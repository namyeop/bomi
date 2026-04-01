"""Bomi LiveKit Voice Agent — 아이 영어 학습 음성 에이전트 진입점.

LangGraph 멀티 에이전트 그래프를 LiveKit 음성 파이프라인에 연결한다.
Supervisor가 아이의 음성 입력을 분류하고, 전문 에이전트가 응답을 생성한다.

사용법:
    python -m bomi.agent dev       # 개발 모드
    python -m bomi.agent start     # 프로덕션 모드
"""

import logging
import uuid

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from livekit.agents import (
    Agent,
    AgentSession,
    JobContext,
    WorkerOptions,
    cli,
    llm as livekit_llm,
)
from livekit.plugins import silero

from bomi.graph import build_graph_for_livekit
from bomi.state import BomiState

logger = logging.getLogger("bomi")


class BomiGraphLLM(livekit_llm.LLM):
    """LangGraph 멀티 에이전트 그래프를 LiveKit LLM 인터페이스로 래핑.

    LiveKit의 STT → LLM → TTS 파이프라인에서 LLM 자리에 들어간다.
    사용자 음성(STT 결과)이 HumanMessage로 들어오면
    그래프를 실행하여 보미의 응답을 반환한다.
    """

    def __init__(self) -> None:
        super().__init__()
        self._graph = build_graph_for_livekit()
        self._thread_id = str(uuid.uuid4())
        self._initialized = False

    async def chat(
        self,
        *,
        chat_ctx: livekit_llm.ChatContext,
        tools: list | None = None,
        conn_options: livekit_llm.LLMOptions | None = None,
    ) -> livekit_llm.LLMStream:
        # 마지막 사용자 메시지 추출
        last_user_msg = ""
        for msg in reversed(chat_ctx.items):
            if msg.role == "user":
                last_user_msg = msg.text_content
                break

        # 그래프 실행
        config = {"configurable": {"thread_id": self._thread_id}}

        if not self._initialized:
            # 첫 실행: session_setup 포함
            state = self._graph.invoke(
                {"age_group": "5-7"},
                config,
            )
            self._initialized = True

            # 초기 인사 추출
            ai_messages = [m for m in state["messages"] if isinstance(m, AIMessage)]
            response_text = ai_messages[-1].content if ai_messages else "Hey! It's Bomi!"
        else:
            # 이후: 사용자 메시지로 그래프 재개
            state = self._graph.invoke(
                {"messages": [HumanMessage(content=last_user_msg)]},
                config,
            )

            ai_messages = [m for m in state["messages"] if isinstance(m, AIMessage)]
            response_text = ai_messages[-1].content if ai_messages else "Ohhh!"

        # LiveKit LLMStream으로 래핑하여 반환
        return _SingleResponseStream(response_text, self)


class _SingleResponseStream(livekit_llm.LLMStream):
    """단일 응답 텍스트를 LLMStream 인터페이스로 래핑."""

    def __init__(self, text: str, llm: BomiGraphLLM) -> None:
        super().__init__(llm, chat_ctx=livekit_llm.ChatContext())
        self._text = text
        self._sent = False

    async def _run(self) -> None:
        # 전체 텍스트를 한 번에 전송 (음성 응답이 짧으므로 청킹 불필요)
        self._event_ch.send_nowait(
            livekit_llm.ChatChunk(
                choices=[
                    livekit_llm.Choice(
                        delta=livekit_llm.ChoiceDelta(
                            role="assistant",
                            content=self._text,
                        ),
                        index=0,
                    )
                ]
            )
        )


class BomiAgent(Agent):
    """보미 — 호기심 많은 아기 여우 영어 대화 친구"""

    def __init__(self) -> None:
        super().__init__(
            instructions=(
                "You are Bomi, a curious baby fox who loves talking with kids in English. "
                "You are a FRIEND, not a teacher. Keep responses to 1-2 short sentences. "
                "Always end with a question. Be enthusiastic and encouraging."
            ),
        )


async def entrypoint(ctx: JobContext) -> None:
    """LiveKit room에 연결되면 Bomi 음성 에이전트 세션을 시작한다."""
    await ctx.connect()

    session = AgentSession(
        vad=silero.VAD.load(),
        stt="openai/whisper-1",
        llm=BomiGraphLLM(),
        tts="openai/tts-1",
    )

    await session.start(
        room=ctx.room,
        agent=BomiAgent(),
    )


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))

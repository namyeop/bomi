"""Bomi LiveKit Voice Agent — 아이 영어 학습 음성 에이전트 진입점.

LangGraph 멀티 에이전트 그래프를 LLMAdapter를 통해 LiveKit에 연결한다.
사용자 음성 → STT → LangGraph(supervisor → agent) → TTS → 음성 출력.

사용법:
    python -m bomi.agent dev       # 개발 모드
    python -m bomi.agent start     # 프로덕션 모드
"""

import logging
import random

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext
from livekit.agents.llm import StopResponse
from livekit.agents.llm.chat_context import ChatMessage
from livekit.plugins import google, langchain, openai, silero

from bomi.agents.assessment import generate_parent_report
from bomi.config import DAILY_EXPRESSIONS
from bomi.graph import build_graph_for_livekit
from bomi.livekit_events import extract_user_transcript
from bomi.prompts import build_system_prompt
from bomi.session_control import FAREWELL_TEXT, PARENT_REPORT_ATTRIBUTE, is_end_session_text

logger = logging.getLogger("bomi")

GREETING = """\
Say a short, cheerful greeting like 'Hey! It's Bomi! I missed you! What did you do today?'
"""


def _to_langchain_message(message: ChatMessage) -> BaseMessage | None:
    content = message.text_content
    if not content:
        return None

    if message.role == "assistant":
        return AIMessage(content=content)

    if message.role == "user":
        return HumanMessage(content=content)

    return None


def _count_user_turns(messages: list[BaseMessage]) -> int:
    return sum(1 for message in messages if isinstance(message, HumanMessage))


class BomiAgent(Agent):
    def __init__(self) -> None:
        daily_expression = random.choice(DAILY_EXPRESSIONS)
        system_prompt = build_system_prompt("5-7", daily_expression)
        super().__init__(instructions=system_prompt)
        self._daily_expression = daily_expression
        self._shutdown_requested = False

    async def on_user_turn_completed(self, turn_ctx, new_message: ChatMessage) -> None:
        transcript = new_message.text_content or ""
        if self._shutdown_requested or not is_end_session_text(transcript):
            return

        self._shutdown_requested = True
        session = self._get_activity_or_raise().session
        report_messages = [
            converted
            for converted in (_to_langchain_message(message) for message in self.chat_ctx.messages())
            if converted is not None
        ]
        if current_message := _to_langchain_message(new_message):
            report_messages.append(current_message)

        try:
            parent_report = generate_parent_report(
                report_messages,
                turn_count=_count_user_turns(report_messages),
                daily_expression=self._daily_expression,
            ).strip()
            await session.room_io.room.local_participant.set_attributes(
                {PARENT_REPORT_ATTRIBUTE: parent_report}
            )
        except Exception:
            logger.exception("Failed to generate or publish parent report")

        farewell_handle = session.say(
            FAREWELL_TEXT,
            allow_interruptions=False,
            add_to_chat_ctx=True,
        )
        farewell_handle.add_done_callback(lambda _: session.shutdown(drain=True))
        logger.info("Session shutdown requested after farewell")
        raise StopResponse()


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect()
    logger.info("connected to room: %s", ctx.room.name)

    participant = await ctx.wait_for_participant()
    logger.info("participant joined: %s", participant.identity)

    graph = build_graph_for_livekit()

    session = AgentSession(
        stt=openai.STT(model="gpt-4o-transcribe", language="en"),
        llm=langchain.LLMAdapter(graph),
        tts=google.beta.GeminiTTS(
            model="gemini-2.5-flash-preview-tts",
            voice_name="Leda",
            instructions="Speak in a bright, cheerful, child-friendly tone.",
        ),
        vad=silero.VAD.load(),
    )

    @session.on("user_input_transcribed")
    def on_user_speech(ev):
        transcript = extract_user_transcript(ev)
        if transcript is None:
            logger.warning("User speech event missing transcript: %r", ev)
            return

        suffix = "" if getattr(ev, "is_final", True) else " (partial)"
        logger.info("User said%s: %s", suffix, transcript)

    await session.start(
        room=ctx.room,
        agent=BomiAgent(),
    )

    session.generate_reply(
        user_input="[SESSION_START]",
        instructions=GREETING,
    )
    logger.info("agent started with LangGraph in room: %s", ctx.room.name)


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))

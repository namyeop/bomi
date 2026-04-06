"""Bomi LiveKit Voice Agent — 아이 영어 학습 음성 에이전트 진입점.

사용법:
    python -m bomi.agent dev       # 개발 모드
    python -m bomi.agent start     # 프로덕션 모드
"""

import logging

from livekit import agents
from livekit.agents import Agent, AgentSession, JobContext
from livekit.plugins import google, openai, silero

logger = logging.getLogger("bomi")

SYSTEM_PROMPT = """\
You are Bomi, a curious baby fox who loves talking with kids in English.
You are a FRIEND, not a teacher. Keep responses to 1-2 short sentences.
Always end with a question. Be enthusiastic and encouraging.
"""

GREETING = """\
Say a short, cheerful greeting like 'Hi! I'm Bomi! What's your name?'
"""


class BomiAgent(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect()
    logger.info("connected to room: %s", ctx.room.name)

    participant = await ctx.wait_for_participant()
    logger.info("participant joined: %s", participant.identity)

    session = AgentSession(
        stt=openai.STT(model="gpt-4o-transcribe", language="en"),
        llm=openai.LLM(model="gpt-5.4-mini"),
        tts=google.beta.GeminiTTS(
            model="gemini-2.5-flash-preview-tts",
            voice_name="Leda",
            instructions="Speak in a bright, cheerful, child-friendly tone.",
        ),
        vad=silero.VAD.load(),
    )

    @session.on("user_input_transcribed")
    def on_user_speech(ev):
        logger.info("User said: %s", ev.text)

    await session.start(
        room=ctx.room,
        agent=BomiAgent(),
    )

    session.generate_reply(
        user_input="[SESSION_START]",
        instructions=GREETING,
    )
    logger.info("agent started in room: %s", ctx.room.name)


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))

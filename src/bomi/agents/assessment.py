from collections.abc import Sequence

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from langchain_openai import ChatOpenAI

from bomi.config import LLM_MODEL
from bomi.prompts import ASSESSMENT_PROMPT
from bomi.session_control import FAREWELL_TEXT
from bomi.state import BomiState


def _get_llm():
    return ChatOpenAI(model=LLM_MODEL, temperature=0.3)


def generate_parent_report(
    messages: Sequence[BaseMessage],
    *,
    turn_count: int,
    daily_expression: str,
) -> str:
    prompt = ASSESSMENT_PROMPT.format(
        turn_count=turn_count,
        daily_expression=daily_expression,
    )
    response = _get_llm().invoke([*messages, HumanMessage(content=prompt)])
    return response.content


def assessment_agent(state: BomiState) -> dict:
    """세션 종료 시 대화 분석 후 부모 리포트 생성 (한국어).

    리포트는 parent_report 필드에 저장하고, TTS로는 보미의 작별 인사만 출력한다.
    """
    daily_expr = state.get("daily_expression", "")
    turn_count = state.get("turn_count", 0)
    report = generate_parent_report(
        list(state["messages"]),
        turn_count=turn_count,
        daily_expression=daily_expr,
    )

    # 보미의 작별 인사 (TTS로 출력됨)
    farewell = AIMessage(content=FAREWELL_TEXT)

    return {
        "messages": [farewell],
        "parent_report": report,
        "session_active": False,
    }

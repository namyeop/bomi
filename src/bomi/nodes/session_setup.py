import random

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from bomi.config import DAILY_EXPRESSIONS, LLM_MODEL
from bomi.prompts import build_system_prompt
from bomi.state import BomiState


def _get_llm():
    return ChatOpenAI(model=LLM_MODEL, temperature=0.8)


def session_setup(state: BomiState) -> dict:
    """세션 초기화: 오늘의 표현 선택 + 보미 첫 인사 생성"""
    age_group = state.get("age_group", "5-7")
    daily_expression = random.choice(DAILY_EXPRESSIONS)
    system_prompt = build_system_prompt(age_group, daily_expression)

    setup_messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(
            content=(
                "[SESSION START] The child just opened the app. "
                "Greet them as Bomi and introduce today's expression naturally."
            )
        ),
    ]
    response = _get_llm().invoke(setup_messages)

    return {
        "messages": [
            SystemMessage(content=system_prompt),
            AIMessage(content=response.content),
        ],
        "daily_expression": daily_expression,
        "turn_count": 0,
        "session_active": True,
        "active_agent": "",
        "pending_return_to": "",
        "supervisor_decision": "",
        "search_query": "",
        "search_result": "",
        "corrections": [],
        "vocabulary_used": [],
        "daily_expression_used": False,
        "quiz_active": False,
        "quiz_type": "",
        "quiz_score": 0,
        "quiz_questions_remaining": 0,
        "parent_report": "",
    }

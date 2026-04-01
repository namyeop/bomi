import random

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from bomi.config import LLM_MODEL, MAX_CONTEXT_MESSAGES, QUIZ_QUESTIONS_PER_ROUND, QUIZ_TYPES
from bomi.prompts import QUIZ_SYSTEM_PROMPT
from bomi.state import BomiState


def _get_llm():
    return ChatOpenAI(model=LLM_MODEL, temperature=0.8)


def quiz_agent(state: BomiState) -> dict:
    """게임형 영어 학습 에이전트.

    퀴즈가 진행 중이 아니면 새 퀴즈를 시작하고,
    진행 중이면 아이의 답을 평가하고 다음 문제를 낸다.
    """
    quiz_active = state.get("quiz_active", False)
    age_group = state.get("age_group", "5-7")

    if not quiz_active:
        # 새 퀴즈 시작
        quiz_type = random.choice(QUIZ_TYPES)
        remaining = QUIZ_QUESTIONS_PER_ROUND

        prompt = QUIZ_SYSTEM_PROMPT.format(
            age_group=age_group,
            quiz_type=quiz_type,
            score=0,
            total_asked=0,
            remaining=remaining,
        )

        messages = [
            SystemMessage(content=prompt),
            HumanMessage(
                content="Start a new quiz round! Give the first question."
            ),
        ]
        response = _get_llm().invoke(messages)

        return {
            "messages": [AIMessage(content=response.content)],
            "turn_count": state["turn_count"] + 1,
            "quiz_active": True,
            "quiz_type": quiz_type,
            "quiz_score": 0,
            "quiz_questions_remaining": remaining - 1,
            "active_agent": "quiz",
        }

    # 퀴즈 진행 중 — 아이 답 평가 + 다음 문제
    quiz_type = state.get("quiz_type", "word_guess")
    score = state.get("quiz_score", 0)
    remaining = state.get("quiz_questions_remaining", 0)
    total_asked = QUIZ_QUESTIONS_PER_ROUND - remaining

    prompt = QUIZ_SYSTEM_PROMPT.format(
        age_group=age_group,
        quiz_type=quiz_type,
        score=score,
        total_asked=total_asked,
        remaining=remaining,
    )

    # 컨텍스트 윈도우: 퀴즈 프롬프트 + 최근 N개 메시지
    messages = [SystemMessage(content=prompt)] + list(state["messages"][-MAX_CONTEXT_MESSAGES:])

    if remaining <= 0:
        messages.append(
            SystemMessage(
                content=(
                    "This was the last question. Evaluate the answer, "
                    "announce the final score, and say something encouraging. "
                    "Then suggest going back to chatting."
                )
            )
        )

    response = _get_llm().invoke(messages)

    new_remaining = max(remaining - 1, 0)
    end_quiz = remaining <= 0

    return {
        "messages": [AIMessage(content=response.content)],
        "turn_count": state["turn_count"] + 1,
        "quiz_active": not end_quiz,
        "quiz_score": score,  # LLM이 정답 판단하므로 정확한 추적은 향후 개선
        "quiz_questions_remaining": new_remaining,
        "active_agent": "quiz" if not end_quiz else "conversation",
    }

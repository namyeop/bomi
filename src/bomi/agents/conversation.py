import re

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from bomi.config import LLM_MODEL, MAX_CONTEXT_MESSAGES
from bomi.state import BomiState


def _get_llm():
    return ChatOpenAI(model=LLM_MODEL, temperature=0.8)


def _extract_vocabulary(text: str) -> list[str]:
    """아이의 메시지에서 영어 단어를 추출한다."""
    words = re.findall(r"[a-zA-Z]{2,}", text.lower())
    # 너무 흔한 단어 제외
    stop_words = {"the", "is", "am", "are", "it", "to", "and", "or", "in", "on", "at", "my", "me", "do", "no", "yes", "ok", "hi"}
    return [w for w in words if w not in stop_words]


def _check_daily_expression(text: str, expression: str) -> bool:
    """아이가 오늘의 표현을 사용했는지 확인한다."""
    return expression.lower() in text.lower()


def conversation_agent(state: BomiState) -> dict:
    """보미 캐릭터로 자유 영어 대화 응답 생성.

    학습 추적: 어휘, 교정, 오늘의 표현 사용 여부를 업데이트한다.
    """
    # 컨텍스트 윈도우: 시스템 프롬프트 + 최근 N개 메시지
    all_messages = list(state["messages"])
    system_msgs = [m for m in all_messages if isinstance(m, SystemMessage)]
    non_system = [m for m in all_messages if not isinstance(m, SystemMessage)]
    messages = system_msgs + non_system[-MAX_CONTEXT_MESSAGES:]

    search_result = state.get("search_result", "")
    if search_result:
        messages.append(
            SystemMessage(
                content=(
                    f"[KNOWLEDGE HINT] You just looked up something interesting! "
                    f"Here's what you found: {search_result}\n\n"
                    "Share ONE simple, exciting fun fact with the child in your Bomi character. "
                    "Keep it very short (1-2 sentences) and age-appropriate. "
                    "React with excitement like 'Ohhh! Did you know that...?!' "
                    "Then ask a follow-up question to keep the conversation going."
                )
            )
        )

    response = _get_llm().invoke(messages)

    # 학습 추적 업데이트
    updates: dict = {
        "messages": [AIMessage(content=response.content)],
        "turn_count": state.get("turn_count", 0) + 1,
        "search_query": "",
        "search_result": "",
        "active_agent": "conversation",
    }

    # 아이의 마지막 메시지에서 어휘 추출
    last_human = [m for m in all_messages if isinstance(m, HumanMessage)]
    if last_human:
        child_text = last_human[-1].content
        new_words = _extract_vocabulary(child_text)
        existing = list(state.get("vocabulary_used", []))
        for w in new_words:
            if w not in existing:
                existing.append(w)
        updates["vocabulary_used"] = existing

        # 오늘의 표현 체크
        daily_expr = state.get("daily_expression", "")
        if daily_expr and _check_daily_expression(child_text, daily_expr):
            updates["daily_expression_used"] = True

    return updates

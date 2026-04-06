from typing import Literal

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from bomi.config import LLM_MODEL
from bomi.prompts import SUPERVISOR_PROMPT
from bomi.session_control import is_end_session_text
from bomi.state import BomiState

# 규칙 기반 빠른 분류용 키워드
GREETING_WORDS = {"hi", "hello", "hey", "안녕", "하이"}
QUIZ_WORDS = {"game", "play", "quiz", "게임", "퀴즈"}


def _get_llm():
    return ChatOpenAI(model=LLM_MODEL, temperature=0)


def _rule_based_classify(text: str) -> str | None:
    """명백한 패턴은 LLM 없이 규칙으로 분류. None이면 LLM 필요."""
    words = set(text.lower().split())

    if is_end_session_text(text):
        return "end_session"
    if words & GREETING_WORDS and len(words) <= 3:
        return "conversation"
    if words & QUIZ_WORDS:
        return "quiz"
    # 단순 응답 (1-2 단어): yes, no, okay, um 등
    if len(words) <= 2:
        return "conversation"
    return None


def supervisor(state: BomiState) -> dict:
    """아이 입력을 분류하여 라우팅 결정을 내린다.

    하이브리드 방식: 명백한 패턴은 규칙 기반, 애매한 경우만 LLM 호출.
    """
    last_message = state["messages"][-1]

    if not isinstance(last_message, HumanMessage):
        return {
            "supervisor_decision": "conversation",
            "active_agent": "conversation",
        }

    text = last_message.content.lower()

    # 퀴즈 진행 중이면 퀴즈로 유지 (종료 키워드 제외)
    if state.get("quiz_active"):
        if is_end_session_text(text):
            return {
                "supervisor_decision": "end_session",
                "active_agent": "assessment",
                "quiz_active": False,
            }
        return {
            "supervisor_decision": "quiz",
            "active_agent": "quiz",
        }

    # 규칙 기반 빠른 분류 시도
    rule_decision = _rule_based_classify(text)
    if rule_decision:
        decision = rule_decision
    else:
        # LLM 분류 (애매한 경우만)
        messages = [
            SystemMessage(content=SUPERVISOR_PROMPT),
            HumanMessage(content=f"Child's message: {last_message.content}"),
        ]
        response = _get_llm().invoke(messages)
        decision = response.content.strip().lower()

        valid = {"conversation", "quiz", "knowledge", "end_session"}
        if decision not in valid:
            decision = "conversation"

    # knowledge인 경우: 현재 active_agent를 기록해 나중에 복귀
    if decision == "knowledge":
        return_to = state.get("active_agent", "conversation") or "conversation"
        return {
            "supervisor_decision": "knowledge",
            "active_agent": "knowledge",
            "pending_return_to": return_to,
            "search_query": last_message.content,
        }

    return {
        "supervisor_decision": decision,
        "active_agent": decision if decision != "end_session" else "assessment",
    }


def route_by_supervisor(
    state: BomiState,
) -> Literal["conversation_agent", "quiz_agent", "knowledge_agent", "assessment_agent"]:
    """supervisor 결정에 따라 에이전트 노드로 라우팅"""
    decision = state.get("supervisor_decision", "conversation")
    mapping = {
        "conversation": "conversation_agent",
        "quiz": "quiz_agent",
        "knowledge": "knowledge_agent",
        "end_session": "assessment_agent",
    }
    return mapping.get(decision, "conversation_agent")

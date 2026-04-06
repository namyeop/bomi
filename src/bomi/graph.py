from typing import Literal

from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import END, START, StateGraph

from bomi.agents.assessment import assessment_agent
from bomi.agents.conversation import conversation_agent
from bomi.agents.knowledge import knowledge_agent
from bomi.agents.quiz import quiz_agent
from bomi.config import MAX_TURNS
from bomi.nodes.input_analyzer import input_analyzer
from bomi.nodes.response_formatter import response_formatter
from bomi.nodes.session_setup import session_setup
from bomi.nodes.supervisor import route_by_supervisor, supervisor
from bomi.state import BomiState


# ── knowledge 후 복귀 라우팅 ──


def route_after_knowledge(
    state: BomiState,
) -> Literal["conversation_agent", "quiz_agent"]:
    """Knowledge Agent 완료 후 원래 에이전트로 복귀"""
    return_to = state.get("pending_return_to", "conversation")
    if return_to == "quiz":
        return "quiz_agent"
    return "conversation_agent"


# ── 대화 계속 여부 판단 ──


def should_continue(
    state: BomiState,
) -> Literal["input_analyzer", "assessment_agent"]:
    """대화 계속 or 세션 종료 판단"""
    if not state.get("session_active", True):
        return "assessment_agent"
    if state.get("turn_count", 0) >= MAX_TURNS:
        return "assessment_agent"
    return "input_analyzer"


# ── 그래프 조립 ──


def _build_state_graph() -> StateGraph:
    """공통 StateGraph 구조를 빌드한다 (컴파일 전)."""
    builder = StateGraph(BomiState)

    # 노드 추가 (4 인프라 + 4 에이전트 = 8개)
    builder.add_node("session_setup", session_setup)
    builder.add_node("input_analyzer", input_analyzer)
    builder.add_node("supervisor", supervisor)
    builder.add_node("response_formatter", response_formatter)

    builder.add_node("conversation_agent", conversation_agent)
    builder.add_node("quiz_agent", quiz_agent)
    builder.add_node("knowledge_agent", knowledge_agent)
    builder.add_node("assessment_agent", assessment_agent)

    # 엣지 연결
    builder.add_edge(START, "session_setup")
    builder.add_edge("session_setup", "input_analyzer")
    builder.add_edge("input_analyzer", "supervisor")

    # 조건부 엣지 1: supervisor → 4개 에이전트 중 하나
    builder.add_conditional_edges("supervisor", route_by_supervisor)

    # 에이전트 → response_formatter (knowledge 제외)
    builder.add_edge("conversation_agent", "response_formatter")
    builder.add_edge("quiz_agent", "response_formatter")

    # knowledge → 원래 에이전트로 복귀
    builder.add_conditional_edges("knowledge_agent", route_after_knowledge)

    # assessment → END
    builder.add_edge("assessment_agent", END)

    # response_formatter → 계속 or 종료
    builder.add_conditional_edges("response_formatter", should_continue)

    return builder


def build_graph(with_checkpointer: bool = True) -> StateGraph:
    """CLI/노트북용 그래프 (interrupt_before로 사용자 입력 대기)."""
    builder = _build_state_graph()
    checkpointer = MemorySaver() if with_checkpointer else None
    return builder.compile(
        checkpointer=checkpointer,
        interrupt_before=["input_analyzer"],
    )


def _strip_messages(fn):
    """LLMAdapter stream_mode='messages' 중복 방지 래퍼.

    LangGraph는 stream_mode='messages'에서 LLM 호출을 인터셉트하여
    자동 스트리밍한다. 노드가 messages도 반환하면 같은 응답이
    두 번 스트리밍되므로, 반환값에서 messages를 제거한다.
    """

    def wrapper(state):
        result = fn(state)
        result.pop("messages", None)
        return result

    return wrapper


def build_graph_for_livekit() -> StateGraph:
    """LiveKit 음성용 그래프 (LLMAdapter 연동, 턴 단위 실행).

    LiveKit AgentSession이 LLMAdapter를 통해 이 그래프를 호출한다.
    session_setup은 LiveKit Agent의 instructions로 대체하고,
    response_formatter는 프롬프트의 [VOICE OUTPUT] 규칙으로 대체하여
    supervisor → agent 파이프라인만 실행한다.

    에이전트 노드는 _strip_messages로 감싸서 stream_mode='messages'
    자동 스트리밍과의 중복을 방지한다.
    """
    builder = StateGraph(BomiState)

    builder.add_node("supervisor", supervisor)
    builder.add_node("conversation_agent", _strip_messages(conversation_agent))
    builder.add_node("quiz_agent", _strip_messages(quiz_agent))
    builder.add_node("knowledge_agent", knowledge_agent)
    builder.add_node("assessment_agent", _strip_messages(assessment_agent))

    builder.add_edge(START, "supervisor")
    builder.add_conditional_edges("supervisor", route_by_supervisor)
    builder.add_edge("conversation_agent", END)
    builder.add_edge("quiz_agent", END)
    builder.add_conditional_edges("knowledge_agent", route_after_knowledge)
    builder.add_edge("assessment_agent", END)

    return builder.compile()


# 기본 그래프 인스턴스 (CLI/노트북용)
graph = build_graph()

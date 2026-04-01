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


def build_graph_for_livekit() -> StateGraph:
    """LiveKit 음성용 그래프 (interrupt 없이 연속 실행).

    LiveKit은 STT로 사용자 음성을 텍스트로 변환한 후
    이 그래프에 HumanMessage로 전달한다.
    interrupt 없이 supervisor → agent → formatter 를 한 번에 실행하고
    최종 AIMessage를 TTS로 보낸다.
    """
    builder = _build_state_graph()
    return builder.compile(checkpointer=MemorySaver())


# 기본 그래프 인스턴스 (CLI/노트북용)
graph = build_graph()

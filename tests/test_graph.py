"""그래프 조건부 엣지 + 컴파일 테스트."""

from bomi.graph import build_graph, route_after_knowledge, should_continue


def _make_state(**overrides):
    base = {
        "messages": [],
        "age_group": "5-7",
        "daily_expression": "delicious",
        "turn_count": 0,
        "session_active": True,
        "active_agent": "conversation",
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
    base.update(overrides)
    return base


# ── route_after_knowledge ──


def test_route_after_knowledge_conversation():
    state = _make_state(pending_return_to="conversation")
    assert route_after_knowledge(state) == "conversation_agent"


def test_route_after_knowledge_quiz():
    state = _make_state(pending_return_to="quiz")
    assert route_after_knowledge(state) == "quiz_agent"


def test_route_after_knowledge_default():
    state = _make_state(pending_return_to="")
    assert route_after_knowledge(state) == "conversation_agent"


# ── should_continue ──


def test_should_continue_active():
    state = _make_state(session_active=True, turn_count=3)
    assert should_continue(state) == "input_analyzer"


def test_should_continue_inactive():
    state = _make_state(session_active=False)
    assert should_continue(state) == "assessment_agent"


def test_should_continue_max_turns():
    state = _make_state(session_active=True, turn_count=10)
    assert should_continue(state) == "assessment_agent"


def test_should_continue_at_boundary():
    state = _make_state(session_active=True, turn_count=9)
    assert should_continue(state) == "input_analyzer"


# ── 그래프 컴파일 ──


def test_graph_compiles():
    graph = build_graph(with_checkpointer=False)
    assert graph is not None


def test_graph_has_correct_nodes():
    graph = build_graph(with_checkpointer=False)
    node_names = set(graph.get_graph().nodes)
    expected = {
        "__start__", "__end__",
        "session_setup", "input_analyzer", "supervisor", "response_formatter",
        "conversation_agent", "quiz_agent", "knowledge_agent", "assessment_agent",
    }
    assert expected == node_names


def test_graph_has_correct_edge_count():
    graph = build_graph(with_checkpointer=False)
    edges = graph.get_graph().edges
    # 5 fixed + 9 conditional = 14 edges
    assert len(edges) == 14

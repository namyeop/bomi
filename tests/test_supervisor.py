"""Supervisor 라우팅 테스트 — 규칙 기반 + LLM 분류 검증."""

from unittest.mock import MagicMock, patch

from langchain_core.messages import AIMessage, HumanMessage

from bomi.nodes.supervisor import (
    _rule_based_classify,
    route_by_supervisor,
    supervisor,
)


# ── 규칙 기반 분류 테스트 ──


def test_rule_end_session_bye():
    assert _rule_based_classify("bye") == "end_session"


def test_rule_end_session_korean():
    assert _rule_based_classify("끝") == "end_session"


def test_rule_end_session_stop():
    assert _rule_based_classify("stop") == "end_session"


def test_rule_greeting_hi():
    assert _rule_based_classify("hi") == "conversation"


def test_rule_greeting_hello():
    assert _rule_based_classify("hello") == "conversation"


def test_rule_quiz_game():
    assert _rule_based_classify("game") == "quiz"


def test_rule_quiz_play():
    assert _rule_based_classify("let's play") == "quiz"


def test_rule_short_answer_yes():
    assert _rule_based_classify("yes") == "conversation"


def test_rule_short_answer_no():
    assert _rule_based_classify("no") == "conversation"


def test_rule_ambiguous_returns_none():
    assert _rule_based_classify("what do dolphins eat") is None


def test_rule_topic_question_returns_none():
    assert _rule_based_classify("tell me about dinosaurs") is None


# ── Supervisor 노드 테스트 ──


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


def test_supervisor_non_human_message():
    state = _make_state(messages=[AIMessage(content="Hello!")])
    result = supervisor(state)
    assert result["supervisor_decision"] == "conversation"


def test_supervisor_bye_rule():
    state = _make_state(messages=[HumanMessage(content="bye")])
    result = supervisor(state)
    assert result["supervisor_decision"] == "end_session"


def test_supervisor_greeting_rule():
    state = _make_state(messages=[HumanMessage(content="hi")])
    result = supervisor(state)
    assert result["supervisor_decision"] == "conversation"


def test_supervisor_quiz_active_continues():
    state = _make_state(
        messages=[HumanMessage(content="dog")],
        quiz_active=True,
    )
    result = supervisor(state)
    assert result["supervisor_decision"] == "quiz"


def test_supervisor_quiz_active_end():
    state = _make_state(
        messages=[HumanMessage(content="bye")],
        quiz_active=True,
    )
    result = supervisor(state)
    assert result["supervisor_decision"] == "end_session"
    assert result["quiz_active"] is False


@patch("bomi.nodes.supervisor._get_llm")
def test_supervisor_llm_knowledge(mock_llm):
    mock_response = MagicMock()
    mock_response.content = "knowledge"
    mock_llm.return_value.invoke.return_value = mock_response

    state = _make_state(
        messages=[HumanMessage(content="what do dolphins eat")],
    )
    result = supervisor(state)
    assert result["supervisor_decision"] == "knowledge"
    assert result["search_query"] == "what do dolphins eat"
    assert result["pending_return_to"] == "conversation"


@patch("bomi.nodes.supervisor._get_llm")
def test_supervisor_llm_invalid_fallback(mock_llm):
    mock_response = MagicMock()
    mock_response.content = "invalid_garbage"
    mock_llm.return_value.invoke.return_value = mock_response

    state = _make_state(
        messages=[HumanMessage(content="something ambiguous here")],
    )
    result = supervisor(state)
    assert result["supervisor_decision"] == "conversation"


# ── route_by_supervisor 테스트 ──


def test_route_conversation():
    state = _make_state(supervisor_decision="conversation")
    assert route_by_supervisor(state) == "conversation_agent"


def test_route_quiz():
    state = _make_state(supervisor_decision="quiz")
    assert route_by_supervisor(state) == "quiz_agent"


def test_route_knowledge():
    state = _make_state(supervisor_decision="knowledge")
    assert route_by_supervisor(state) == "knowledge_agent"


def test_route_end_session():
    state = _make_state(supervisor_decision="end_session")
    assert route_by_supervisor(state) == "assessment_agent"


def test_route_unknown_defaults():
    state = _make_state(supervisor_decision="unknown")
    assert route_by_supervisor(state) == "conversation_agent"

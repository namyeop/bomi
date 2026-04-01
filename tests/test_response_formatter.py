"""response_formatter 테스트 — 마크다운/이모지 제거 + ID 기반 교체."""

from langchain_core.messages import AIMessage, HumanMessage

from bomi.nodes.response_formatter import response_formatter


def _make_state(last_message):
    return {
        "messages": [last_message],
        "age_group": "5-7",
        "daily_expression": "",
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


def test_non_ai_message_noop():
    state = _make_state(HumanMessage(content="hello"))
    assert response_formatter(state) == {}


def test_clean_text_noop():
    state = _make_state(AIMessage(content="Ohhh! Do you like dogs?"))
    assert response_formatter(state) == {}


def test_strips_bold_markdown():
    msg = AIMessage(content="That is **so cool**!", id="test-1")
    state = _make_state(msg)
    result = response_formatter(state)
    assert result["messages"][0].content == "That is so cool!"
    assert result["messages"][0].id == "test-1"


def test_strips_header_markdown():
    msg = AIMessage(content="# Hello\nHow are you?", id="test-2")
    state = _make_state(msg)
    result = response_formatter(state)
    assert "# " not in result["messages"][0].content


def test_strips_bullet_points():
    msg = AIMessage(content="- item one\n- item two", id="test-3")
    state = _make_state(msg)
    result = response_formatter(state)
    assert "- " not in result["messages"][0].content


def test_preserves_message_id():
    """ID 기반 교체: 원본 메시지의 id가 유지되어야 한다."""
    original_id = "msg-abc-123"
    msg = AIMessage(content="**bold text**", id=original_id)
    state = _make_state(msg)
    result = response_formatter(state)
    assert result["messages"][0].id == original_id

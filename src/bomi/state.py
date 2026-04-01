from typing import Annotated

from langgraph.graph.message import add_messages
from typing_extensions import TypedDict


class BomiState(TypedDict):
    """보미 멀티 에이전트 공유 상태"""

    # 대화 히스토리
    messages: Annotated[list, add_messages]

    # 세션 메타데이터
    age_group: str  # "5-7" or "8-10"
    daily_expression: str
    turn_count: int
    session_active: bool

    # 라우팅
    active_agent: str  # 현재 활성 에이전트 이름
    pending_return_to: str  # knowledge 검색 후 복귀할 에이전트
    supervisor_decision: str  # supervisor의 최신 라우팅 결정

    # 검색
    search_query: str
    search_result: str

    # 학습 추적
    corrections: list[dict]  # [{turn, original, corrected}]
    vocabulary_used: list[str]  # 아이가 사용한 고유 영어 단어
    daily_expression_used: bool

    # 퀴즈
    quiz_active: bool
    quiz_type: str  # "word_guess", "fill_blank", "would_you_rather"
    quiz_score: int
    quiz_questions_remaining: int

    # 부모 리포트 (TTS로 출력되지 않음, 별도 채널로 전달)
    parent_report: str

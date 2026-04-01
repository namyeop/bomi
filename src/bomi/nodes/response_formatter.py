import re

from langchain_core.messages import AIMessage

from bomi.state import BomiState


def response_formatter(state: BomiState) -> dict:
    """음성 출력을 위한 후처리.

    - 마크다운 제거 (**, *, #, - 등)
    - 이모지 제거
    - 원본 메시지의 id를 유지하여 add_messages가 교체(replace)하도록 함
    """
    last_message = state["messages"][-1]
    if not isinstance(last_message, AIMessage):
        return {}

    text = last_message.content

    # 마크다운 볼드/이탈릭 제거
    text = re.sub(r"\*{1,3}(.+?)\*{1,3}", r"\1", text)
    # 마크다운 헤더 제거
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)
    # 불릿 포인트 제거
    text = re.sub(r"^[\-\*]\s+", "", text, flags=re.MULTILINE)
    # 이모지 제거
    text = re.sub(
        r"[\U0001f600-\U0001f64f\U0001f300-\U0001f5ff\U0001f680-\U0001f6ff"
        r"\U0001f1e0-\U0001f1ff\U00002700-\U000027bf\U0001f900-\U0001f9ff"
        r"\U0001fa00-\U0001fa6f\U0001fa70-\U0001faff\U00002600-\U000026ff]",
        "",
        text,
    )
    # 연속 공백 정리
    text = re.sub(r"\s+", " ", text).strip()

    if text != last_message.content:
        # 원본 메시지의 id를 복사하여 교체 (append가 아닌 replace)
        return {
            "messages": [AIMessage(content=text, id=last_message.id)]
        }
    return {}

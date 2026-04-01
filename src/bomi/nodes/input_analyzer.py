from bomi.state import BomiState


def input_analyzer(state: BomiState) -> dict:
    """아이 입력 수신 노드 (interrupt point).

    LiveKit에서 STT 결과가 HumanMessage로 들어온다.
    이 노드는 pass-through — 실제 분류는 supervisor가 수행.
    """
    return {}

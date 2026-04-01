from bomi.state import BomiState
from bomi.tools import search_topic_for_kids


def knowledge_agent(state: BomiState) -> dict:
    """Tavily 웹 검색으로 아이가 궁금한 주제의 재미있는 사실을 조회한다.

    직접 응답하지 않고, search_result에 결과를 저장하여
    Conversation/Quiz Agent가 활용하도록 한다.
    """
    query = state.get("search_query", "")
    if not query:
        return {"search_result": "", "search_query": ""}

    try:
        result = search_topic_for_kids.invoke({"query": query})
        return {"search_result": result}
    except Exception:
        return {"search_result": ""}

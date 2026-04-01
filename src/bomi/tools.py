from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.tools import tool


@tool
def search_topic_for_kids(query: str) -> str:
    """Search for fun, kid-friendly facts about a topic.
    Use this when the child asks about animals, space, food, science, or any curious topic.
    Returns simple, exciting facts suitable for children aged 5-10.
    """
    search = TavilySearchResults(max_results=2)
    results = search.invoke(f"{query} fun facts for kids simple")

    if not results:
        return f"Fun fact: {query} is a really interesting topic!"

    facts = []
    for r in results[:2]:
        content = r.get("content", "")
        if content:
            facts.append(content[:200])

    return " | ".join(facts) if facts else f"Fun fact: {query} is a really interesting topic!"

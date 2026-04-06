import re

FAREWELL_TEXT = "See you tomorrow! Bye bye!"
PARENT_REPORT_ATTRIBUTE = "bomi_parent_report"
END_WORDS = frozenset({"bye", "quit", "exit", "끝", "그만", "stop", "goodbye"})


def tokenize_session_words(text: str) -> set[str]:
    return set(re.findall(r"[\w']+", text.lower()))


def is_end_session_text(text: str) -> bool:
    return bool(tokenize_session_words(text) & END_WORDS)

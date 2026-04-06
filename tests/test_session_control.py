import unittest

from bomi.session_control import is_end_session_text


class SessionControlTests(unittest.TestCase):
    def test_end_session_keyword_matches_plain_text(self) -> None:
        self.assertTrue(is_end_session_text("bye"))

    def test_end_session_keyword_matches_punctuation(self) -> None:
        self.assertTrue(is_end_session_text("goodbye!"))

    def test_end_session_keyword_matches_korean(self) -> None:
        self.assertTrue(is_end_session_text("이제 그만"))

    def test_non_end_session_text_returns_false(self) -> None:
        self.assertFalse(is_end_session_text("tell me about dolphins"))

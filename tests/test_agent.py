import unittest
from types import SimpleNamespace

from bomi.livekit_events import extract_user_transcript


class ExtractUserTranscriptTests(unittest.TestCase):
    def test_prefers_transcript(self) -> None:
        ev = SimpleNamespace(transcript="hello", text="legacy")

        self.assertEqual(extract_user_transcript(ev), "hello")

    def test_falls_back_to_legacy_text(self) -> None:
        ev = SimpleNamespace(text="hello")

        self.assertEqual(extract_user_transcript(ev), "hello")

    def test_returns_none_when_missing(self) -> None:
        ev = SimpleNamespace(language="en")

        self.assertIsNone(extract_user_transcript(ev))

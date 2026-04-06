def extract_user_transcript(ev: object) -> str | None:
    transcript = getattr(ev, "transcript", None)
    if isinstance(transcript, str):
        return transcript

    legacy_text = getattr(ev, "text", None)
    if isinstance(legacy_text, str):
        return legacy_text

    return None

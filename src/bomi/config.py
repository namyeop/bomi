LLM_MODEL = "gpt-4o-mini"

MAX_TURNS = 10
MAX_CONTEXT_MESSAGES = 20  # 모든 에이전트의 컨텍스트 윈도우 상한

DAILY_EXPRESSIONS = [
    "delicious",
    "excited",
    "I want to...",
    "my favorite",
    "Let's go to...",
]

AGE_GROUP_CONFIG = {
    "5-7": {
        "vocab_note": (
            "Use only simple words (about 300-word vocabulary: "
            "animals, food, colors, family, toys). "
            "Keep responses to 1-2 very short sentences."
        ),
        "tone_note": (
            "Be VERY enthusiastic. Use lots of 'Wow!', 'Yay!', 'So cool!' reactions."
        ),
        "topics": "animals, food, games, family, cartoons",
    },
    "8-10": {
        "vocab_note": (
            "Use age-appropriate vocabulary (about 800 words: "
            "school, hobbies, travel, emotions). "
            "Keep responses to 1-2 sentences."
        ),
        "tone_note": "Be a curious, fun friend. React with genuine interest.",
        "topics": "school, hobbies, sports, movies, dreams, travel",
    },
}

QUIZ_TYPES = ["word_guess", "fill_blank", "would_you_rather"]
QUIZ_QUESTIONS_PER_ROUND = 3

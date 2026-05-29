import json
import os


def _load_questions() -> list[dict]:
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    questions_path = os.path.join(base_dir, "..", "questions.json")

    if not os.path.exists(questions_path):
        questions_path = os.path.join(base_dir, "questions.json")

    with open(questions_path, "r") as f:
        data = json.load(f)

    return data.get("questions", data if isinstance(data, list) else [])


_questions_cache: list[dict] | None = None


def get_questions() -> list[dict]:
    global _questions_cache
    if _questions_cache is None:
        _questions_cache = _load_questions()
    return _questions_cache

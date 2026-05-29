from models.assessment import AnswerItem, ScoreResult, RiskLevel
from services.questionnaire import get_questions


_WEIGHT_MAP = {
    "yes": 0,
    "no": 100,
    "partial": 50,
    "in_place": 0,
    "not_in_place": 100,
    "partially": 50,
    "true": 0,
    "false": 100,
}

_CATEGORY_WEIGHTS = {
    "Access Control": 1.2,
    "Cryptography": 1.1,
    "Data Protection": 1.3,
    "Incident Response": 1.1,
    "Business Continuity": 1.0,
    "Compliance": 1.2,
    "Vendor Management": 1.0,
    "Physical Security": 0.9,
    "Network Security": 1.2,
    "Security Awareness": 0.8,
}


def _score_answer(answer: AnswerItem, question: dict) -> float:
    expected_type = question.get("answer_type", "boolean")
    value = answer.answer

    if expected_type == "boolean":
        if isinstance(value, bool):
            return 0.0 if value else 100.0
        str_val = str(value).lower().strip()
        return 0.0 if str_val in ("true", "yes", "in_place") else 100.0

    if expected_type == "choice":
        str_val = str(value).lower().strip()
        return float(_WEIGHT_MAP.get(str_val, 50.0))

    if expected_type == "scale":
        try:
            num = float(value)
            return max(0.0, min(100.0, (1.0 - (num / 5.0)) * 100.0))
        except (ValueError, TypeError):
            return 50.0

    return 50.0


def _get_recommendation(score: float, category: str) -> str:
    if score >= 70:
        return f"Critical improvements needed in {category}. Immediate remediation required."
    if score >= 40:
        return f"Moderate risk in {category}. Address key gaps within the next quarter."
    return f"Low risk in {category}. Continue monitoring and periodic reviews."


def calculate_score(answers: list[AnswerItem]) -> ScoreResult:
    questions = get_questions()
    question_map = {q["id"]: q for q in questions}

    category_scores: dict[str, list[float]] = {}
    category_answers: dict[str, list[dict]] = {}

    for answer in answers:
        question = question_map.get(answer.question_id)
        if not question:
            continue

        category = question.get("category", "General")
        raw_score = _score_answer(answer, question)

        if category not in category_scores:
            category_scores[category] = []
            category_answers[category] = []

        category_scores[category].append(raw_score)
        category_answers[category].append({
            "question_id": question["id"],
            "question_text": question["question"],
            "score": raw_score,
            "answer": answer.answer,
        })

    weighted_total = 0.0
    weight_sum = 0.0
    final_category_scores: dict[str, float] = {}
    recommendations: list[str] = []

    for category, scores in category_scores.items():
        avg_score = sum(scores) / len(scores) if scores else 0.0
        weight = _CATEGORY_WEIGHTS.get(category, 1.0)
        weighted_total += avg_score * weight
        weight_sum += weight
        final_category_scores[category] = round(avg_score, 1)
        recommendations.append(_get_recommendation(avg_score, category))

    overall = round(weighted_total / weight_sum, 1) if weight_sum > 0 else 0.0

    if overall >= 60:
        risk_level = RiskLevel.HIGH
    elif overall >= 30:
        risk_level = RiskLevel.MEDIUM
    else:
        risk_level = RiskLevel.LOW

    return ScoreResult(
        overall_score=overall,
        risk_level=risk_level,
        category_scores=final_category_scores,
        recommendations=suggestions(overall) if len(recommendations) < 3 else recommendations[:5],
    )


def suggestions(score: float) -> list[str]:
    if score >= 60:
        return [
            "Engage vendor for a risk remediation plan with clear timelines.",
            "Require evidence of compliance certifications (SOC 2, ISO 27001).",
            "Schedule a follow-up assessment within 30 days.",
            "Consider conditional approval with ongoing monitoring.",
            "Review vendor data handling and breach notification procedures.",
        ]
    if score >= 30:
        return [
            "Accept vendor with monitoring cadence of 90 days.",
            "Request additional documentation on security controls.",
            "Validate encryption and data protection practices.",
            "Establish service-level agreements for incident response.",
        ]
    return [
        "Vendor meets acceptable risk criteria.",
        "Standard monitoring cadence of 180 days is sufficient.",
        "No immediate remediation required.",
        "Document assessment for compliance records.",
    ]

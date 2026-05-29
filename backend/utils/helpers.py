import json
from datetime import datetime, timezone
from models.assessment import AssessmentSession, AnswerItem


def serialize_session(session: AssessmentSession) -> dict:
    return {
        "token": str(session.token),
        "organization": session.organization,
        "assessor": session.assessor,
        "created_at": session.created_at.isoformat(),
        "answers": [a.model_dump() for a in session.answers],
        "submitted": session.submitted,
    }


def format_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from models.assessment import (
    AssessmentSession, AssessmentCreate, AnswerSubmission, ScoreResult,
)
from services.storage import storage
from services.questionnaire import get_questions
from services.scoring import calculate_score
from services.report import generate_report
from utils.helpers import serialize_session

router = APIRouter(prefix="/api/assessments", tags=["Assessments"])


def _get_session(token: str) -> AssessmentSession:
    session = storage.get_session(token)
    if not session:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return session


@router.post("")
def create_assessment(body: AssessmentCreate):
    session = AssessmentSession(
        organization=body.organization,
        assessor=body.assessor,
    )
    storage.create_session(session)
    return {
        "token": str(session.token),
        "session": serialize_session(session),
    }


@router.get("/{token}")
def get_assessment(token: str):
    session = _get_session(token)
    questions = get_questions()
    return {
        "token": str(session.token),
        "session": serialize_session(session),
        "questions": questions,
    }


@router.post("/{token}/answers")
def submit_answers(token: str, body: AnswerSubmission):
    session = _get_session(token)
    session.answers = body.answers
    session.submitted = True
    storage.update_session(token, session)
    return {
        "message": "Answers submitted successfully",
        "answer_count": len(body.answers),
        "token": token,
    }


@router.get("/{token}/score")
def get_score(token: str):
    session = _get_session(token)
    if not session.answers:
        raise HTTPException(
            status_code=400,
            detail="No answers submitted yet. Submit answers before calculating score.",
        )
    score = calculate_score(session.answers)
    return {
        "token": token,
        "score": score.model_dump(),
    }


@router.get("/{token}/report.pdf")
def get_report(token: str):
    session = _get_session(token)
    if not session.answers:
        raise HTTPException(
            status_code=400,
            detail="No answers submitted yet. Submit answers before generating report.",
        )
    score = calculate_score(session.answers)
    pdf_buffer = generate_report(session, score)
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="assessment-{token}.pdf"',
        },
    )

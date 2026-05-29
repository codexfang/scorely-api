from pydantic import BaseModel
from typing import Optional, Any
from uuid import UUID, uuid4
from datetime import datetime, timezone
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class AnswerItem(BaseModel):
    question_id: str
    answer: Any
    notes: Optional[str] = None


class AssessmentCreate(BaseModel):
    organization: Optional[str] = None
    assessor: Optional[str] = None


class AssessmentSession(BaseModel):
    token: UUID = uuid4()
    organization: Optional[str] = None
    assessor: Optional[str] = None
    created_at: datetime = datetime.now(timezone.utc)
    answers: list[AnswerItem] = []
    submitted: bool = False


class ScoreResult(BaseModel):
    overall_score: float
    risk_level: RiskLevel
    category_scores: dict[str, float]
    recommendations: list[str]


class AssessmentResponse(BaseModel):
    token: str
    session: AssessmentSession


class AnswerSubmission(BaseModel):
    answers: list[AnswerItem]

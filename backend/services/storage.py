from models.assessment import AssessmentSession
from uuid import UUID


class InMemoryStorage:
    def __init__(self):
        self._sessions: dict[str, AssessmentSession] = {}

    def create_session(self, session: AssessmentSession) -> AssessmentSession:
        key = str(session.token)
        self._sessions[key] = session
        return session

    def get_session(self, token: str) -> AssessmentSession | None:
        return self._sessions.get(token)

    def update_session(self, token: str, session: AssessmentSession) -> AssessmentSession:
        self._sessions[token] = session
        return session

    def delete_session(self, token: str) -> bool:
        if token in self._sessions:
            del self._sessions[token]
            return True
        return False

    def list_sessions(self) -> list[AssessmentSession]:
        return list(self._sessions.values())


storage = InMemoryStorage()

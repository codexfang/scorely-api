from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.assessments import router as assessments_router
from services.storage import storage

app = FastAPI(
    title="Scorely API",
    description="Vendor Risk Assessment API — automate security questionnaire workflows",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessments_router)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Scorely API",
        "version": "1.0.0",
        "active_sessions": len(storage.list_sessions()),
    }

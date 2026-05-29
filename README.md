# Scorely API

**Vendor Risk Assessment API** — A developer-first API platform for automating security questionnaires, collecting responses, calculating risk scores, and exporting structured PDF reports.

Scorely functions as a lightweight, API-native vendor risk assessment engine. It is designed for procurement systems, DevOps pipelines, and security teams that need to automate vendor due diligence workflows without a heavy SaaS dependency.

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Frontend   │────▶│   Backend (API)  │────▶│  In-Memory   │
│  (React +   │     │  (FastAPI/Python) │     │  Session     │
│   Tailwind) │◀────│                  │◀────│  Storage     │
└─────────────┘     └──────────────────┘     └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Scoring     │
                    │  Engine +    │
                    │  PDF Report  │
                    └──────────────┘
```

The backend is stateless except for an in-memory session store. Each assessment is isolated by a UUID token. The frontend is a fully static single-page application that can operate with fallback demo data when the API is unavailable.

---

## Features

- **Assessment Lifecycle** — Create, answer, score, and export assessments via REST API
- **SOC 2 + ISO 27001 Questionnaire** — 29 structured questions across 10 security domains
- **Risk Scoring Engine** — Rule-based scoring with category weighting and risk level classification (Low / Medium / High)
- **PDF Report Generation** — Downloadable reports with summary, category breakdown, recommendations, and full response log
- **Token-Based Isolation** — Each assessment uses a UUID token; no authentication required
- **Fallback Mode** — Frontend displays demo data when the API is unreachable
- **Local Persistence** — Assessment tokens stored in localStorage for session continuity
- **Responsive UI** — Mobile-friendly, dark-mode dashboard

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend Framework | FastAPI (Python 3.11) |
| API Server | Uvicorn |
| PDF Generation | ReportLab |
| Session Storage | In-memory dict |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Deployment (Backend) | Render (free plan) |
| Deployment (Frontend) | GitHub Pages |

---

## API Reference

### Health Check

```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "Scorely API",
  "version": "1.0.0",
  "active_sessions": 3
}
```

### Create Assessment

```
POST /api/assessments
```

Request body:
```json
{
  "organization": "Acme Corp",
  "assessor": "Jane Doe"
}
```

Response:
```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "session": {
    "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "organization": "Acme Corp",
    "assessor": "Jane Doe",
    "created_at": "2026-05-29T12:00:00+00:00",
    "answers": [],
    "submitted": false
  }
}
```

### Retrieve Questionnaire

```
GET /api/assessments/{token}
```

Response includes the session data and the full questions array with 29 items across 10 categories.

### Submit Answers

```
POST /api/assessments/{token}/answers
```

Request body:
```json
{
  "answers": [
    {
      "question_id": "AC-1",
      "answer": true,
      "notes": "AWS IAM with least privilege"
    },
    {
      "question_id": "AC-2",
      "answer": "partial",
      "notes": "Quarterly for critical systems only"
    }
  ]
}
```

Response:
```json
{
  "message": "Answers submitted successfully",
  "answer_count": 29,
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

### Get Risk Score

```
GET /api/assessments/{token}/score
```

Response:
```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "score": {
    "overall_score": 18.3,
    "risk_level": "Low",
    "category_scores": {
      "Access Control": 25.0,
      "Cryptography": 0.0,
      "Data Protection": 0.0,
      "Incident Response": 0.0,
      "Business Continuity": 0.0,
      "Compliance": 0.0,
      "Vendor Management": 0.0,
      "Physical Security": 0.0,
      "Network Security": 0.0,
      "Security Awareness": 33.3
    },
    "recommendations": [
      "Low risk in Access Control. Continue monitoring and periodic reviews.",
      "Low risk in Cryptography. Continue monitoring and periodic reviews.",
      "Low risk in Data Protection. Continue monitoring and periodic reviews.",
      "Low risk in Incident Response. Continue monitoring and periodic reviews.",
      "Low risk in Business Continuity. Continue monitoring and periodic reviews."
    ]
  }
}
```

### Download PDF Report

```
GET /api/assessments/{token}/report.pdf
```

Returns a PDF document with the assessment summary, risk score, category breakdown, recommendations, and all answers.

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm

### Local Development

```bash
# Clone the repository
git clone https://github.com/codexfang/scorely-api.git
cd scorely-api

# Start the backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8400

# In another terminal, start the frontend
cd frontend
npm install
npm run dev
```

The API will be available at `http://localhost:8400` and the frontend at `http://localhost:5173`.

---

## Deployment

### Backend (Render)

1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Deploy

### UptimeRobot Monitoring

1. Create a new monitor in UptimeRobot
2. Set the URL to `https://your-app.onrender.com/health`
3. Set interval to **5 minutes**
4. This keeps the free Render instance awake

### Frontend (GitHub Pages)

```bash
cd frontend
npm run build
```

Deploy the `dist/` directory to GitHub Pages. Set the `VITE_API_URL` environment variable in your GitHub Actions or build step to point to your Render backend URL.

---

## Project Structure

```
scorely-api/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt     # Python dependencies
│   ├── Procfile             # Render deployment config
│   ├── runtime.txt          # Python version
│   ├── routes/
│   │   └── assessments.py   # API route handlers
│   ├── services/
│   │   ├── storage.py       # In-memory session store
│   │   ├── questionnaire.py # Question loader
│   │   ├── scoring.py       # Risk scoring engine
│   │   └── report.py        # PDF report generator
│   ├── models/
│   │   └── assessment.py    # Pydantic models
│   └── utils/
│       └── helpers.py       # Utility functions
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main application
│   │   ├── components/      # React components
│   │   │   ├── CreateAssessment.jsx
│   │   │   ├── TokenList.jsx
│   │   │   ├── Questionnaire.jsx
│   │   │   └── ScoreCard.jsx
│   │   └── services/
│   │       ├── api.js       # API client with fallback
│   │       └── storage.js   # localStorage persistence
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── questions.json           # SOC 2 + ISO 27001 questionnaire
└── README.md
```

---

## Scoring Logic

The risk scoring engine works as follows:

1. Each answer is scored 0–100 based on its value (boolean, choice, or scale)
2. Scores are grouped by category (Access Control, Cryptography, etc.)
3. Each category has a weight multiplier (e.g., Data Protection = 1.3x, Physical Security = 0.9x)
4. The overall score is a weighted average of all category scores
5. Risk levels: **Low** (0–29), **Medium** (30–59), **High** (60–100)
6. Recommendations are generated based on each category's score

---

## License

MIT

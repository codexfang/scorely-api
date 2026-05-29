# Scorely API

A developer-first API platform for automating security questionnaires, collecting responses, calculating risk scores, and exporting structured PDF reports.

## Features

- **Assessment Lifecycle** — Create, answer, score, and export assessments via REST API
- **SOC 2 + ISO 27001 Questionnaire** — 29 structured questions across 10 security domains
- **Risk Scoring Engine** — Rule-based scoring with category weighting and risk level classification (Low / Medium / High)
- **PDF Report Generation** — Downloadable reports with summary, category breakdown, recommendations, and full response log
- **Token-Based Isolation** — Each assessment uses a UUID token; no authentication required
- **Fallback Mode** — Frontend displays demo data when the API is unreachable
- **Local Persistence** — Assessment tokens stored in localStorage for session continuity
- **Responsive UI** — Mobile-friendly, dark-mode dashboard

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend Framework | FastAPI (Python 3.11) |
| API Server | Uvicorn |
| PDF Generation | ReportLab |
| Session Storage | In-memory dict |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Deployment (Backend) | Render |
| Deployment (Frontend) | GitHub Pages |

## Scoring Logic

The risk scoring engine works as follows:

1. Each answer is scored 0–100 based on its value (boolean, choice, or scale)
2. Scores are grouped by category (Access Control, Cryptography, etc.)
3. Each category has a weight multiplier (e.g., Data Protection = 1.3x, Physical Security = 0.9x)
4. The overall score is a weighted average of all category scores
5. Risk levels: **Low** (0–29), **Medium** (30–59), **High** (60–100)
6. Recommendations are generated based on each category's score

## License

MIT

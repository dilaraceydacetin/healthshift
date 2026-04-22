# Healthshift

AI-powered analytics platform for building energy management and personal health tracking.

**Live Demo:** [healthshift-phi.vercel.app](https://healthshift-phi.vercel.app)

---

## Projects

### EnergyShift
Upload CSV energy data and ask AI questions about building consumption patterns. Detects anomalies, generates weekly reports with recommendations, and visualizes monthly consumption with real-time charts.

**Try it:**
1. Sign up at [healthshift-phi.vercel.app](https://healthshift-phi.vercel.app)
2. Go to EnergyShift → Upload a CSV with `building, date, kwh, notes` columns
3. Ask "Which building consumes the most energy?"

### SymptomLog
Track daily symptoms and medications. Get AI pattern analysis and generate doctor-ready PDF reports.

**Try it:**
1. Go to SymptomLog → Ask "What patterns do you see in my symptoms?"
2. Download PDF report

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| AI | Groq (Llama 3.3 70B), LangGraph agents, RAG pipeline |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Recharts |
| Auth | Supabase Auth |
| DevOps | Docker, GitHub Actions CI/CD |
| IaC | Terraform (Azure provider) |
| Deploy | Vercel (frontend), Render (API), Supabase (database) |

---

## Architecture

Vercel (Next.js + Supabase Auth)
↓
Render (FastAPI × 2)     ← Docker containers
↓
Supabase (PostgreSQL)    ← pg_trgm for RAG search
↓
Groq API (Llama 3.3)    ← LLM + LangGraph agents


---

## Run Locally

```bash
git clone https://github.com/dilaraceydacetin/healthshift
cd healthshift
cp .env.example .env
# Add GROQ_API_KEY and Supabase credentials to .env
docker compose up --build
```

Services:
- Frontend: http://localhost:3000
- EnergyShift API: http://localhost:8001/docs
- SymptomLog API: http://localhost:8002/docs

---

## Key Features

- **Auth** — Supabase Auth with email/password
- **RAG pipeline** — PostgreSQL `pg_trgm` for semantic search
- **LangGraph agent** — 4-step: fetch → detect anomalies → analyze → recommend
- **Real-time charts** — Recharts with live data from API
- **PDF generation** — Doctor-ready reports via ReportLab
- **CI/CD** — GitHub Actions automated tests on every push
- **IaC** — Terraform configuration for Azure deployment

---

## API Endpoints

- POST /api/upload       -           Upload CSV energy data
- POST /api/ask           -          Ask AI about your data
- GET  /api/stats          -         Monthly energy consumption stats
- POST /api/weekly-report/{id}   -   LangGraph energy analysis
- POST /api/entries       -          Log a symptom
- GET  /api/report/pdf     -         Download symptom PDF report


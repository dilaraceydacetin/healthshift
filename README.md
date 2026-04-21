# Healthshift

AI-powered analytics platform for building energy management and personal health tracking.

**Live Demo:** [healthshift-phi.vercel.app](https://healthshift-phi.vercel.app)

---

## Projects

### EnergyShift
Upload CSV energy data and ask AI questions about building consumption patterns. Detects anomalies and generates weekly reports with recommendations.

**Try it:** Upload a CSV with `building, date, kwh, notes` columns → Ask "Which building consumes the most energy?"

### SymptomLog
Track daily symptoms and medications. Get AI pattern analysis and generate doctor-ready PDF reports.

**Try it:** Ask "What patterns do you see in my symptoms?" → Download PDF report

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, PostgreSQL |
| AI | Groq (Llama 3.3 70B), LangGraph agents, RAG pipeline |
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| DevOps | Docker, GitHub Actions CI/CD |
| IaC | Terraform (Azure provider) |
| Deploy | Vercel (frontend), Render (API), Supabase (database) |

---

## Architecture
Vercel (Next.js)
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
# Add your GROQ_API_KEY to .env

docker compose up --build
```

Services start at:
- Frontend: http://localhost:3000
- EnergyShift API: http://localhost:8001/docs
- SymptomLog API: http://localhost:8002/docs

---

## Key Features

- **RAG pipeline** — PostgreSQL `pg_trgm` for semantic search without external vector DB
- **LangGraph agent** — Multi-step energy analysis: fetch → detect anomalies → analyze → recommend
- **PDF generation** — Doctor-ready symptom reports via ReportLab
- **CI/CD** — GitHub Actions runs tests on every push
- **IaC** — Terraform configuration for Azure deployment

---

## API Endpoints

POST /api/upload          Upload CSV energy data
POST /api/ask             Ask AI about your data
POST /api/weekly-report/{id}  LangGraph energy analysis
POST /api/entries         Log a symptom
GET  /api/report/pdf      Download symptom PDF report



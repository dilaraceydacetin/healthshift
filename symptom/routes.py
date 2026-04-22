from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from core.database import get_db
from symptom.models import SymptomEntry, Medication
from core.rag import query_rag
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import io
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from symptom.models import Conversation

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class SymptomCreate(BaseModel):
    date: datetime
    symptom: str
    severity: int
    notes: str = ""
    user_id: str = "default"

class SymptomResponse(BaseModel):
    id: int
    date: datetime
    symptom: str
    severity: int
    notes: str
    user_id: str

    model_config = {"from_attributes": True}

class MedicationCreate(BaseModel):
    name: str
    dosage: str = ""
    taken_at: datetime
    user_id: str = "default"

class MedicationResponse(BaseModel):
    id: int
    name: str
    dosage: str
    taken_at: datetime
    user_id: str

    model_config = {"from_attributes": True}

class AskRequest(BaseModel):
    question: str

@router.get("/health")
def health():
    return {"status": "ok", "service": "symptom"}

@router.post("/entries", response_model=SymptomResponse)
def create_entry(entry: SymptomCreate, db: Session = Depends(get_db)):
    db_entry = SymptomEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@router.get("/entries", response_model=list[SymptomResponse])
def list_entries(user_id: str = "default", db: Session = Depends(get_db)):
    return db.query(SymptomEntry).filter(
        SymptomEntry.user_id == user_id
    ).order_by(SymptomEntry.date.desc()).all()

@router.post("/medications", response_model=MedicationResponse)
def create_medication(med: MedicationCreate, db: Session = Depends(get_db)):
    db_med = Medication(**med.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

class AskRequest(BaseModel):
    question: str
    messages: list[dict] = []  # konuşma geçmişi

@router.post("/ask")
@limiter.limit("10/minute")
def ask_question(request: Request, body: AskRequest, db: Session = Depends(get_db)):
    entries = db.query(SymptomEntry).order_by(
        SymptomEntry.date.desc()
    ).limit(20).all()

    context_parts = []

    if entries:
        context_parts.append("Recorded symptom entries:\n" + "\n".join([
            f"- {e.date.strftime('%Y-%m-%d')}: {e.symptom} (severity: {e.severity}/10) - {e.notes}"
            for e in entries
        ]))

    if body.messages:
        history = "\n".join([
            f"{'User' if m['role'] == 'user' else 'AI'}: {m['text']}"
            for m in body.messages[-6:]  # son 6 mesaj
        ])
        context_parts.append(f"Conversation history:\n{history}")

    context = "\n\n".join(context_parts)

    from core.llm import ask
    answer = ask(prompt=body.question, context=context)
    return {"question": body.question, "answer": answer}



@router.get("/report/pdf")
def generate_pdf_report(user_id: str = "default", db: Session = Depends(get_db)):
    entries = db.query(SymptomEntry).filter(
        SymptomEntry.user_id == user_id
    ).order_by(SymptomEntry.date.desc()).limit(30).all()

    from core.llm import ask
    if entries:
        context = "Symptom entries:\n" + "\n".join([
            f"- {e.date.strftime('%Y-%m-%d')}: {e.symptom} (severity: {e.severity}/10) - {e.notes}"
            for e in entries
        ])
        summary = ask(
            prompt="Summarize these symptoms for a doctor visit. Be concise and clinical.",
            context=context
        )
    else:
        summary = "No symptom data available."

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, height - 50, "SymptomLog — Medical Report")

    c.setFont("Helvetica", 11)
    c.drawString(50, height - 80, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    c.drawString(50, height - 95, f"Patient ID: {user_id}")

    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, height - 130, "Symptom History")

    c.setFont("Helvetica", 10)
    y = height - 150
    for entry in entries:
        line = f"{entry.date.strftime('%Y-%m-%d')}  |  {entry.symptom}  |  Severity: {entry.severity}/10  |  {entry.notes}"
        c.drawString(50, y, line[:90])
        y -= 18
        if y < 200:
            c.showPage()
            y = height - 50

    c.setFont("Helvetica-Bold", 13)
    c.drawString(50, y - 20, "AI Summary for Doctor")

    c.setFont("Helvetica", 10)
    y = y - 40
    words = summary.split()
    line = ""
    for word in words:
        if len(line + word) < 90:
            line += word + " "
        else:
            c.drawString(50, y, line)
            y -= 15
            line = word + " "
            if y < 50:
                c.showPage()
                y = height - 50
    if line:
        c.drawString(50, y, line)

    c.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=symptom_report.pdf"}
    )

class MessageItem(BaseModel):
    role: str
    text: str

class ConversationSave(BaseModel):
    user_id: str
    messages: list[MessageItem]

@router.post("/conversations")
def save_conversation(data: ConversationSave, db: Session = Depends(get_db)):
    conv = Conversation(
        user_id=data.user_id,
        messages=[{"role": m.role, "text": m.text} for m in data.messages]
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return {"id": conv.id, "status": "saved"}

@router.get("/conversations/{user_id}")
def get_conversations(user_id: str, db: Session = Depends(get_db)):
    convs = db.query(Conversation).filter(
        Conversation.user_id == user_id
    ).order_by(Conversation.created_at.desc()).limit(20).all()
    return {"conversations": [
        {
            "id": c.id,
            "messages": c.messages,
            "created_at": c.created_at.strftime("%b %d, %H:%M") if c.created_at else ""
        }
        for c in convs
    ]}
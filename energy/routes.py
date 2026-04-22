from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from datetime import datetime
from core.database import get_db
from energy.models import Building, EnergyReading
from energy.agent import energy_agent


from fastapi import UploadFile, File
from core.rag import index_documents, query_rag
from core.storage import parse_file

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# --- Pydantic şemaları ---
class BuildingCreate(BaseModel):
    name: str
    address: str = ""

class BuildingResponse(BaseModel):
    id: int
    name: str
    address: str | None

    model_config = {"from_attributes": True}

class ReadingCreate(BaseModel):
    building_id: int
    timestamp: datetime
    kwh: float
    source: str = "manual"

class ReadingResponse(BaseModel):
    id: int
    building_id: int
    timestamp: datetime
    kwh: float
    source: str

    model_config = {"from_attributes": True}

# --- Endpoint'ler ---
@router.get("/health")
def health():
    return {"status": "ok", "service": "energy"}

@router.post("/buildings", response_model=BuildingResponse)
def create_building(building: BuildingCreate, db: Session = Depends(get_db)):
    db_building = Building(**building.model_dump())
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building

@router.get("/buildings", response_model=list[BuildingResponse])
def list_buildings(db: Session = Depends(get_db)):
    return db.query(Building).all()

@router.post("/readings", response_model=ReadingResponse)
def create_reading(reading: ReadingCreate, db: Session = Depends(get_db)):
    db_reading = EnergyReading(**reading.model_dump())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    return db_reading

@router.get("/readings", response_model=list[ReadingResponse])
def list_readings(building_id: int = None, db: Session = Depends(get_db)):
    query = db.query(EnergyReading)
    if building_id:
        query = query.filter(EnergyReading.building_id == building_id)
    return query.all()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    try:
        chunks = parse_file(content, file.filename)
        index_documents(
            texts=chunks,
            collection_name="energy-docs",
            ids=[f"{file.filename}-{i}" for i in range(len(chunks))]
        )
        return {
            "message": f"{file.filename} başarıyla yüklendi",
            "chunks": len(chunks)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

class AskRequest(BaseModel):
    question: str

@router.post("/ask")
@limiter.limit("10/minute")
def ask_question(request: Request, body: AskRequest):
    answer = query_rag(question=body.question, collection_name="energy-docs")
    return {"question": body.question, "answer": answer}


@router.post("/weekly-report/{building_id}")
def weekly_report(building_id: int):
    result = energy_agent.invoke({
        "building_id": building_id,
        "readings": [],
        "anomalies": [],
        "analysis": "",
        "recommendations": ""
    })
    return {
        "building_id": building_id,
        "anomalies_detected": len(result["anomalies"]),
        "analysis": result["analysis"],
        "recommendations": result["recommendations"]
    }

@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func, extract
    results = db.execute(text("""
        SELECT 
            TO_CHAR(timestamp, 'Mon') as month,
            EXTRACT(MONTH FROM timestamp) as month_num,
            SUM(kwh) as total_kwh
        FROM energy_readings
        GROUP BY month, month_num
        ORDER BY month_num
    """)).fetchall()
    
    if not results:
        return {"data": []}
    
    return {
        "data": [
            {"month": row[0], "kwh": round(row[2], 1)}
            for row in results
        ]
    }
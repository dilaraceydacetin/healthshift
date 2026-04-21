from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from core.database import Base

class SymptomEntry(Base):
    __tablename__ = "symptom_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, default="default")
    date = Column(DateTime, nullable=False)
    symptom = Column(String, nullable=False)
    severity = Column(Integer, nullable=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=func.now())

class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, default="default")
    name = Column(String, nullable=False)
    dosage = Column(String, default="")
    taken_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.now())
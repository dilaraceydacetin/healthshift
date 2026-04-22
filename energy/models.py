from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from sqlalchemy.sql import func
from core.database import Base


class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String)
    created_at = Column(DateTime, default=func.now())

class EnergyReading(Base):
    __tablename__ = "energy_readings"

    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, nullable=False)
    timestamp = Column(DateTime, nullable=False)
    kwh = Column(Float, nullable=False)
    source = Column(String, default="manual")
    created_at = Column(DateTime, default=func.now())

    class Conversation(Base):
     __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)
    service = Column(String, nullable=False, default="energy")
    messages = Column(JSON, nullable=False, default=[])
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
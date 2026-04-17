from fastapi import FastAPI
from core.database import Base, engine
from energy.routes import router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EnergyShift API", version="0.1.0")
app.include_router(router, prefix="/api")
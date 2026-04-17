from fastapi import FastAPI
from contextlib import asynccontextmanager
from energy.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    from core.database import Base, engine
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="EnergyShift API", version="0.1.0", lifespan=lifespan)
app.include_router(router, prefix="/api")
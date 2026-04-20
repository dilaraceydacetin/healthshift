from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from energy.routes import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    from core.database import Base, engine
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="EnergyShift API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
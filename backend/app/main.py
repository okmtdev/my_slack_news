from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models import HealthResponse
from app.routers import bots, gemini, images, logs
from app.services import scheduler as sched
from app.storage import yaml_store


@asynccontextmanager
async def lifespan(app: FastAPI):
    sched.start()
    sched.reload_all_bots(yaml_store.list_bots())
    yield
    sched.shutdown()


app = FastAPI(title="Slack News Bot API", version="1.0.0", lifespan=lifespan)

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bots.router)
app.include_router(logs.router)
app.include_router(images.router)
app.include_router(gemini.router)


@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ok",
        scheduler_running=sched.scheduler.running,
        scheduled_jobs=sched.job_count(),
    )

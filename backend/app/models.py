from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator


class RSSFeed(BaseModel):
    url: str
    name: str = ""


class ScheduleEntry(BaseModel):
    days: List[str]
    time: str  # "HH:MM"

    @field_validator("days")
    @classmethod
    def validate_days(cls, v: List[str]) -> List[str]:
        valid = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"}
        for d in v:
            if d.lower() not in valid:
                raise ValueError(f"Invalid day: {d}")
        return [d.lower() for d in v]

    @field_validator("time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        parts = v.split(":")
        if len(parts) != 2:
            raise ValueError("time must be HH:MM")
        h, m = int(parts[0]), int(parts[1])
        if not (0 <= h <= 23 and 0 <= m <= 59):
            raise ValueError("Invalid time value")
        return f"{h:02d}:{m:02d}"


class BotSchedule(BaseModel):
    timezone: str = "Asia/Tokyo"
    entries: List[ScheduleEntry]


class BotBase(BaseModel):
    name: str
    enabled: bool = True
    keywords: List[str]
    rss_feeds: List[RSSFeed]
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    enable_image: bool = False
    gemini_image_model: str = "gemini-2.5-flash-image-preview"
    slack_webhook_url: str
    schedule: BotSchedule
    lookback_days: int = 1


class BotCreate(BotBase):
    pass


class BotUpdate(BotBase):
    pass


class Bot(BotBase):
    id: str
    created_at: datetime
    updated_at: datetime


class LogStep(BaseModel):
    name: str  # internal id: "fetch_articles" | "summarize" | "post_slack"
    label: str  # human-readable label
    status: str  # "success" | "error" | "skipped"
    message: str = ""
    duration_ms: int = 0


class ExecutionLog(BaseModel):
    id: str
    bot_id: str
    bot_name: str
    run_type: str = "full_run"  # "full_run" | "test_message"
    status: str  # "success" | "error"
    message: str
    articles_count: int = 0
    steps: List[LogStep] = []
    executed_at: datetime


class RunResult(BaseModel):
    success: bool
    message: str
    articles_count: int = 0
    steps: List[LogStep] = []


class BotListResponse(BaseModel):
    bots: List[Bot]


class LogListResponse(BaseModel):
    logs: List[ExecutionLog]
    total: int


class HealthResponse(BaseModel):
    status: str
    scheduler_running: bool
    scheduled_jobs: int

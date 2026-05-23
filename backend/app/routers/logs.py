from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query

from app.dependencies import require_auth
from app.models import LogListResponse
from app.storage import yaml_store

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("", response_model=LogListResponse)
def list_logs(
    bot_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    _: None = Depends(require_auth),
):
    logs = yaml_store.list_logs(bot_id=bot_id, limit=limit)
    return LogListResponse(logs=logs, total=len(logs))

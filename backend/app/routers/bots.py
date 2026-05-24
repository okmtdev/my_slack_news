from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import require_auth
from app.models import Bot, BotCreate, BotListResponse, BotUpdate, RunResult
from app.services import scheduler as sched
from app.services.bot_runner import run_bot, test_message
from app.storage import yaml_store

router = APIRouter(prefix="/api/bots", tags=["bots"])


@router.get("", response_model=BotListResponse)
def list_bots(_: None = Depends(require_auth)):
    return BotListResponse(bots=yaml_store.list_bots())


@router.post("", response_model=Bot, status_code=status.HTTP_201_CREATED)
def create_bot(payload: BotCreate, _: None = Depends(require_auth)):
    bot = yaml_store.create_bot(payload)
    sched.update_bot_schedule(bot)
    return bot


@router.get("/{bot_id}", response_model=Bot)
def get_bot(bot_id: str, _: None = Depends(require_auth)):
    bot = yaml_store.get_bot(bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    return bot


@router.put("/{bot_id}", response_model=Bot)
def update_bot(bot_id: str, payload: BotUpdate, _: None = Depends(require_auth)):
    bot = yaml_store.update_bot(bot_id, payload)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    sched.update_bot_schedule(bot)
    return bot


@router.delete("/{bot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bot(bot_id: str, _: None = Depends(require_auth)):
    if not yaml_store.delete_bot(bot_id):
        raise HTTPException(status_code=404, detail="Bot not found")
    sched.remove_bot_schedule(bot_id)


@router.put("/{bot_id}/toggle", response_model=Bot)
def toggle_bot(bot_id: str, enabled: bool, _: None = Depends(require_auth)):
    bot = yaml_store.toggle_bot(bot_id, enabled)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    sched.update_bot_schedule(bot)
    return bot


@router.post("/{bot_id}/run", response_model=RunResult)
def run_bot_now(bot_id: str, _: None = Depends(require_auth)):
    bot = yaml_store.get_bot(bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    result = run_bot(bot_id)
    return result


@router.post("/{bot_id}/test-message", response_model=RunResult)
def send_test_message(bot_id: str, _: None = Depends(require_auth)):
    bot = yaml_store.get_bot(bot_id)
    if not bot:
        raise HTTPException(status_code=404, detail="Bot not found")
    result = test_message(bot_id)
    return result

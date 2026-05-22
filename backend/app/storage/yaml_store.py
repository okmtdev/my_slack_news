from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

import yaml
from filelock import FileLock

from app.config import settings
from app.models import Bot, BotCreate, BotUpdate, ExecutionLog


MAX_LOGS_PER_BOT = 100


def _data_path(filename: str) -> Path:
    return Path(settings.data_dir) / filename


def _lock(filename: str) -> FileLock:
    return FileLock(str(_data_path(filename)) + ".lock")


def _load(filename: str) -> dict:
    path = _data_path(filename)
    if not path.exists():
        return {}
    with open(path) as f:
        return yaml.safe_load(f) or {}


def _save(filename: str, data: dict) -> None:
    path = _data_path(filename)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False)


# ── Bots ──────────────────────────────────────────────────────────────────────

def list_bots() -> List[Bot]:
    with _lock("bots.yaml"):
        data = _load("bots.yaml")
    raw = data.get("bots", []) or []
    return [Bot(**b) for b in raw]


def get_bot(bot_id: str) -> Optional[Bot]:
    bots = list_bots()
    for b in bots:
        if b.id == bot_id:
            return b
    return None


def create_bot(payload: BotCreate) -> Bot:
    now = datetime.now(timezone.utc)
    bot = Bot(
        **payload.model_dump(),
        id=str(uuid.uuid4()),
        created_at=now,
        updated_at=now,
    )
    with _lock("bots.yaml"):
        data = _load("bots.yaml")
        bots = data.get("bots", []) or []
        bots.append(bot.model_dump())
        _save("bots.yaml", {"bots": bots})
    return bot


def update_bot(bot_id: str, payload: BotUpdate) -> Optional[Bot]:
    with _lock("bots.yaml"):
        data = _load("bots.yaml")
        bots = data.get("bots", []) or []
        for i, b in enumerate(bots):
            if b["id"] == bot_id:
                now = datetime.now(timezone.utc)
                updated = {**b, **payload.model_dump(), "id": bot_id, "updated_at": now}
                bots[i] = updated
                _save("bots.yaml", {"bots": bots})
                return Bot(**updated)
    return None


def delete_bot(bot_id: str) -> bool:
    with _lock("bots.yaml"):
        data = _load("bots.yaml")
        bots = data.get("bots", []) or []
        new_bots = [b for b in bots if b["id"] != bot_id]
        if len(new_bots) == len(bots):
            return False
        _save("bots.yaml", {"bots": new_bots})
    return True


def toggle_bot(bot_id: str, enabled: bool) -> Optional[Bot]:
    with _lock("bots.yaml"):
        data = _load("bots.yaml")
        bots = data.get("bots", []) or []
        for i, b in enumerate(bots):
            if b["id"] == bot_id:
                now = datetime.now(timezone.utc)
                bots[i] = {**b, "enabled": enabled, "updated_at": now}
                _save("bots.yaml", {"bots": bots})
                return Bot(**bots[i])
    return None


# ── Logs ──────────────────────────────────────────────────────────────────────

def list_logs(bot_id: Optional[str] = None, limit: int = 50) -> List[ExecutionLog]:
    with _lock("logs.yaml"):
        data = _load("logs.yaml")
    raw = data.get("logs", []) or []
    logs = [ExecutionLog(**l) for l in raw]
    if bot_id:
        logs = [l for l in logs if l.bot_id == bot_id]
    logs.sort(key=lambda l: l.executed_at, reverse=True)
    return logs[:limit]


def append_log(log: ExecutionLog) -> None:
    with _lock("logs.yaml"):
        data = _load("logs.yaml")
        logs = data.get("logs", []) or []
        logs.append(log.model_dump())
        # Keep only the most recent MAX_LOGS_PER_BOT logs per bot
        by_bot: dict[str, list] = {}
        for l in logs:
            by_bot.setdefault(l["bot_id"], []).append(l)
        trimmed = []
        for bot_logs in by_bot.values():
            bot_logs.sort(key=lambda l: l["executed_at"], reverse=True)
            trimmed.extend(bot_logs[:MAX_LOGS_PER_BOT])
        _save("logs.yaml", {"logs": trimmed})

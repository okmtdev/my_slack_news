from __future__ import annotations

import pytz
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from app.models import Bot
from app.services.bot_runner import run_bot

_DAY_MAP = {
    "monday": "mon",
    "tuesday": "tue",
    "wednesday": "wed",
    "thursday": "thu",
    "friday": "fri",
    "saturday": "sat",
    "sunday": "sun",
}

scheduler = BackgroundScheduler()


def start() -> None:
    if not scheduler.running:
        scheduler.start()


def shutdown() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)


def reload_all_bots(bots: list[Bot]) -> None:
    """Replace all scheduled jobs with the current bot configurations."""
    for job in scheduler.get_jobs():
        scheduler.remove_job(job.id)
    for bot in bots:
        if bot.enabled:
            _schedule_bot(bot)


def update_bot_schedule(bot: Bot) -> None:
    _remove_bot_jobs(bot.id)
    if bot.enabled:
        _schedule_bot(bot)


def remove_bot_schedule(bot_id: str) -> None:
    _remove_bot_jobs(bot_id)


def _remove_bot_jobs(bot_id: str) -> None:
    for job in scheduler.get_jobs():
        if job.id.startswith(f"{bot_id}_"):
            scheduler.remove_job(job.id)


def _schedule_bot(bot: Bot) -> None:
    try:
        tz = pytz.timezone(bot.schedule.timezone)
    except Exception:
        tz = pytz.timezone("Asia/Tokyo")

    for i, entry in enumerate(bot.schedule.entries):
        day_of_week = ",".join(_DAY_MAP.get(d, d) for d in entry.days)
        hour, minute = entry.time.split(":")
        scheduler.add_job(
            run_bot,
            CronTrigger(
                day_of_week=day_of_week,
                hour=int(hour),
                minute=int(minute),
                timezone=tz,
            ),
            args=[bot.id],
            id=f"{bot.id}_{i}",
            replace_existing=True,
        )


def job_count() -> int:
    return len(scheduler.get_jobs())

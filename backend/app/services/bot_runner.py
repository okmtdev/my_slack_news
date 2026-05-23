from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.models import ExecutionLog, RunResult
from app.services.gemini_summarizer import summarize
from app.services.news_fetcher import fetch_articles
from app.services.slack_poster import post_to_slack
from app.storage import yaml_store


def run_bot(bot_id: str) -> RunResult:
    bot = yaml_store.get_bot(bot_id)
    if not bot:
        return RunResult(success=False, message=f"Bot {bot_id} not found")

    try:
        articles = fetch_articles(bot.rss_feeds, bot.keywords, bot.lookback_days)

        if not articles:
            msg = f"キーワード {', '.join(bot.keywords)} に一致する新着記事が見つかりませんでした。"
            _save_log(bot_id, bot.name, "success", msg, 0)
            return RunResult(success=True, message=msg, articles_count=0)

        summary = summarize(
            articles,
            bot.keywords,
            bot.gemini_api_key,
            bot.gemini_model,
        )

        post_to_slack(bot.slack_webhook_url, summary, bot.name)

        msg = f"{len(articles)} 件の記事を取得・要約してSlackに投稿しました。"
        _save_log(bot_id, bot.name, "success", msg, len(articles))
        return RunResult(success=True, message=msg, articles_count=len(articles))

    except Exception as e:
        msg = f"エラーが発生しました: {e}"
        _save_log(bot_id, bot.name, "error", msg, 0)
        return RunResult(success=False, message=msg)


def _save_log(bot_id: str, bot_name: str, status: str, message: str, count: int) -> None:
    log = ExecutionLog(
        id=str(uuid.uuid4()),
        bot_id=bot_id,
        bot_name=bot_name,
        status=status,
        message=message,
        articles_count=count,
        executed_at=datetime.now(timezone.utc),
    )
    yaml_store.append_log(log)

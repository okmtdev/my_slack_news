from __future__ import annotations

import time
import uuid
from datetime import datetime, timezone
from typing import List

from app.models import ExecutionLog, LogStep, RunResult
from app.services.gemini_image import build_image_prompt, generate_image
from app.services.gemini_summarizer import summarize
from app.services.image_storage import public_image_url, save_image
from app.services.news_fetcher import fetch_articles
from app.services.slack_poster import build_test_message, post_to_slack
from app.storage import yaml_store


def run_bot(bot_id: str) -> RunResult:
    """Full execution: fetch RSS → summarize via Gemini → post to Slack."""
    bot = yaml_store.get_bot(bot_id)
    if not bot:
        return RunResult(success=False, message=f"Bot {bot_id} not found")

    steps: List[LogStep] = []

    # Step 1: Fetch articles
    start = time.time()
    try:
        articles = fetch_articles(bot.rss_feeds, bot.keywords, bot.lookback_days)
        if bot.keywords:
            fetch_msg = (
                f"RSS {len(bot.rss_feeds)} 件から取得し、"
                f"キーワード {', '.join(bot.keywords)} に該当する {len(articles)} 件を抽出"
            )
        else:
            fetch_msg = (
                f"RSS {len(bot.rss_feeds)} 件から最新記事 {len(articles)} 件を取得"
                "（キーワード未設定）"
            )
        steps.append(LogStep(
            name="fetch_articles",
            label="記事取得",
            status="success",
            message=fetch_msg,
            duration_ms=int((time.time() - start) * 1000),
        ))
    except Exception as e:
        steps.append(LogStep(
            name="fetch_articles",
            label="記事取得",
            status="error",
            message=str(e),
            duration_ms=int((time.time() - start) * 1000),
        ))
        msg = f"記事取得に失敗しました: {e}"
        _save_log(bot, "full_run", "error", msg, 0, steps)
        return RunResult(success=False, message=msg, steps=steps)

    if not articles:
        steps.append(LogStep(
            name="summarize",
            label="要約生成",
            status="skipped",
            message="該当記事なしのためスキップ",
        ))
        steps.append(LogStep(
            name="generate_image",
            label="画像生成",
            status="skipped",
            message="該当記事なしのためスキップ",
        ))
        steps.append(LogStep(
            name="post_slack",
            label="Slack投稿",
            status="skipped",
            message="該当記事なしのためスキップ",
        ))
        msg = (
            f"キーワード {', '.join(bot.keywords)} に該当する新着記事はありませんでした"
            if bot.keywords
            else "フィードから新着記事を取得できませんでした"
        )
        _save_log(bot, "full_run", "success", msg, 0, steps)
        return RunResult(success=True, message=msg, articles_count=0, steps=steps)

    # Step 2: Summarize
    start = time.time()
    try:
        summary = summarize(articles, bot.keywords, bot.gemini_api_key, bot.gemini_model)
        steps.append(LogStep(
            name="summarize",
            label="要約生成",
            status="success",
            message=f"Gemini ({bot.gemini_model}) で要約を生成（{len(summary)} 文字）",
            duration_ms=int((time.time() - start) * 1000),
        ))
    except Exception as e:
        steps.append(LogStep(
            name="summarize",
            label="要約生成",
            status="error",
            message=str(e),
            duration_ms=int((time.time() - start) * 1000),
        ))
        steps.append(LogStep(
            name="generate_image",
            label="画像生成",
            status="skipped",
            message="前工程の失敗によりスキップ",
        ))
        steps.append(LogStep(
            name="post_slack",
            label="Slack投稿",
            status="skipped",
            message="前工程の失敗によりスキップ",
        ))
        msg = f"要約生成に失敗しました: {e}"
        _save_log(bot, "full_run", "error", msg, len(articles), steps)
        return RunResult(success=False, message=msg, articles_count=len(articles), steps=steps)

    # Step 3 (optional): Generate header image
    image_url: str | None = None
    if bot.enable_image:
        start = time.time()
        try:
            image_prompt = build_image_prompt(bot.keywords, articles)
            image_bytes = generate_image(image_prompt, bot.gemini_api_key, bot.gemini_image_model)
            filename = save_image(image_bytes)
            image_url = public_image_url(filename)
            if image_url:
                msg_text = f"画像を生成しました（{bot.gemini_image_model}）"
                step_status = "success"
            else:
                msg_text = (
                    "画像を生成しましたが PUBLIC_BASE_URL が未設定のため "
                    "Slack には添付しません（テキストのみ投稿）"
                )
                step_status = "error"
            steps.append(LogStep(
                name="generate_image",
                label="画像生成",
                status=step_status,
                message=msg_text,
                duration_ms=int((time.time() - start) * 1000),
            ))
        except Exception as e:
            steps.append(LogStep(
                name="generate_image",
                label="画像生成",
                status="error",
                message=f"画像生成に失敗（テキストのみ投稿します）: {e}",
                duration_ms=int((time.time() - start) * 1000),
            ))
            image_url = None
    else:
        steps.append(LogStep(
            name="generate_image",
            label="画像生成",
            status="skipped",
            message="画像投稿が無効のためスキップ",
        ))

    # Step 4: Post to Slack
    start = time.time()
    try:
        post_to_slack(bot.slack_webhook_url, summary, bot.name, image_url=image_url)
        steps.append(LogStep(
            name="post_slack",
            label="Slack投稿",
            status="success",
            message="Slack に投稿しました" + ("（画像付き）" if image_url else ""),
            duration_ms=int((time.time() - start) * 1000),
        ))
    except Exception as e:
        steps.append(LogStep(
            name="post_slack",
            label="Slack投稿",
            status="error",
            message=str(e),
            duration_ms=int((time.time() - start) * 1000),
        ))
        msg = f"Slack投稿に失敗しました: {e}"
        _save_log(bot, "full_run", "error", msg, len(articles), steps)
        return RunResult(success=False, message=msg, articles_count=len(articles), steps=steps)

    msg = f"{len(articles)} 件の記事を要約してSlackに投稿しました"
    _save_log(bot, "full_run", "success", msg, len(articles), steps)
    return RunResult(success=True, message=msg, articles_count=len(articles), steps=steps)


def test_message(bot_id: str) -> RunResult:
    """Send only a test message to Slack (no RSS fetch, no Gemini)."""
    bot = yaml_store.get_bot(bot_id)
    if not bot:
        return RunResult(success=False, message=f"Bot {bot_id} not found")

    steps: List[LogStep] = []
    start = time.time()
    try:
        message = build_test_message(bot.name, bot.keywords)
        post_to_slack(bot.slack_webhook_url, message, bot.name)
        steps.append(LogStep(
            name="post_slack",
            label="Slack投稿",
            status="success",
            message="テストメッセージを送信しました",
            duration_ms=int((time.time() - start) * 1000),
        ))
        msg = "Slack にテストメッセージを送信しました"
        _save_log(bot, "test_message", "success", msg, 0, steps)
        return RunResult(success=True, message=msg, steps=steps)
    except Exception as e:
        steps.append(LogStep(
            name="post_slack",
            label="Slack投稿",
            status="error",
            message=str(e),
            duration_ms=int((time.time() - start) * 1000),
        ))
        msg = f"Slack投稿に失敗しました: {e}"
        _save_log(bot, "test_message", "error", msg, 0, steps)
        return RunResult(success=False, message=msg, steps=steps)


def _save_log(bot, run_type: str, status: str, message: str,
              articles_count: int, steps: List[LogStep]) -> None:
    log = ExecutionLog(
        id=str(uuid.uuid4()),
        bot_id=bot.id,
        bot_name=bot.name,
        run_type=run_type,
        status=status,
        message=message,
        articles_count=articles_count,
        steps=steps,
        executed_at=datetime.now(timezone.utc),
    )
    yaml_store.append_log(log)

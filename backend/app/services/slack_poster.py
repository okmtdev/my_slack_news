from __future__ import annotations

from datetime import datetime
from typing import List

import requests


def post_to_slack(
    webhook_url: str,
    text: str,
    bot_name: str = "News Bot",
) -> None:
    payload: dict = {
        "username": bot_name,
        "icon_emoji": ":newspaper:",
        "text": text,
    }
    resp = requests.post(webhook_url, json=payload, timeout=10)
    resp.raise_for_status()


def post_toggle_notification(webhook_url: str, bot_name: str, enabled: bool) -> None:
    icon = ":white_check_mark:" if enabled else ":pause_button:"
    status = "有効化" if enabled else "無効化"
    text = f"{icon} *ニュースラ*: 「{bot_name}」が{status}されました"
    post_to_slack(webhook_url, text, "ニュースラ")


def build_test_message(bot_name: str, keywords: List[str]) -> str:
    """Compose a simple Slack-ready test message for connection check."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    keywords_str = ", ".join(keywords) if keywords else "(未設定)"
    return (
        ":test_tube: *ニュースラ 接続テスト*\n\n"
        "このメッセージはBotの接続確認用です。\n"
        "正しく表示されていれば、Slackへの投稿は正常に動作しています。\n\n"
        f"• *Bot 名*: {bot_name}\n"
        f"• *キーワード*: {keywords_str}\n"
        f"• *送信時刻*: {now}"
    )

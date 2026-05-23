from __future__ import annotations

import requests


def post_to_slack(webhook_url: str, text: str, bot_name: str = "News Bot") -> None:
    payload = {
        "text": text,
        "username": bot_name,
        "icon_emoji": ":newspaper:",
    }
    resp = requests.post(webhook_url, json=payload, timeout=10)
    resp.raise_for_status()

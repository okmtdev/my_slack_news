from __future__ import annotations

from typing import List

from google import genai

_DEPRECATED_MODELS = {
    "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.0-flash-exp",
    "gemini-2.0-flash-thinking-exp",
    "gemini-1.5-flash", "gemini-1.5-flash-8b", "gemini-1.5-pro",
    "gemini-1.0-pro",
}
_FALLBACK_MODEL = "gemini-2.5-flash"


def summarize(
    articles: List[dict],
    keywords: List[str],
    api_key: str,
    model_name: str = "gemini-2.5-flash",
) -> str:
    if model_name in _DEPRECATED_MODELS:
        model_name = _FALLBACK_MODEL

    client = genai.Client(api_key=api_key)

    articles_text = "\n".join(
        f"- [{a['source']}] {a['title']}\n  {a['summary']}\n  URL: {a['link']}"
        for a in articles[:20]
    )

    keyword_section = f"キーワード: {', '.join(keywords)}\n\n" if keywords else ""

    prompt = f"""次のニュース記事をSlack投稿用に日本語でまとめて出力してください。

{keyword_section}記事一覧:
{articles_text}

【出力ルール】
- 「はい」「分かりました」「承知しました」等の返答フレーズは絶対に書かない
- 冒頭は必ず「おはようございます！」や「本日のニュース」「今週のニュース」等の挨拶・見出しから始める
- 続けて今日のニュースの概要を1〜2文で書く
- 各記事を箇条書きで簡潔に（タイトル + 一言コメント + URL）
- Slackのmrkdwn形式（*太字*、_斜体_ など）
- 絵文字を適度に使い読みやすくする
- 日本語のみで回答する"""

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
    )
    return response.text or ""

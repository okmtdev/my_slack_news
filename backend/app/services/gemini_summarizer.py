from __future__ import annotations

from typing import List

from google import genai


def summarize(
    articles: List[dict],
    keywords: List[str],
    api_key: str,
    model_name: str = "gemini-2.5-flash",
) -> str:
    client = genai.Client(api_key=api_key)

    articles_text = "\n".join(
        f"- [{a['source']}] {a['title']}\n  {a['summary']}\n  URL: {a['link']}"
        for a in articles[:20]  # limit to avoid token overflow
    )

    keyword_section = f"キーワード: {', '.join(keywords)}\n\n" if keywords else ""

    prompt = f"""以下のニュース記事を日本語でまとめてSlackに投稿する文章を作成してください。

{keyword_section}記事一覧:
{articles_text}

要件:
- 冒頭に今日のニュースの概要を1〜2文で書く
- 各記事を箇条書きで簡潔に（タイトル + 一言コメント + URL）
- Slackのmrkdwn形式で記述（*太字* や _斜体_ など）
- 絵文字を適度に使い読みやすくする
- 日本語で回答する"""

    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
    )
    return response.text or ""

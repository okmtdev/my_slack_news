from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import List, Tuple

import feedparser

from app.models import RSSFeed


def _parse_entry_date(entry) -> datetime:
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        return datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
    if hasattr(entry, "updated_parsed") and entry.updated_parsed:
        return datetime(*entry.updated_parsed[:6], tzinfo=timezone.utc)
    return datetime.now(timezone.utc)


def fetch_articles(
    rss_feeds: List[RSSFeed],
    keywords: List[str],
    lookback_days: int = 1,
) -> List[dict]:
    cutoff = datetime.now(timezone.utc) - timedelta(days=lookback_days)
    lower_keywords = [kw.lower() for kw in keywords]
    articles: List[dict] = []

    for feed in rss_feeds:
        try:
            parsed = feedparser.parse(feed.url)
            for entry in parsed.entries:
                pub_date = _parse_entry_date(entry)
                if pub_date < cutoff:
                    continue
                title = getattr(entry, "title", "")
                summary = getattr(entry, "summary", "") or getattr(entry, "description", "")
                link = getattr(entry, "link", "")
                text = f"{title} {summary}".lower()
                if any(kw in text for kw in lower_keywords):
                    articles.append(
                        {
                            "title": title,
                            "summary": summary[:500],
                            "link": link,
                            "published": pub_date.isoformat(),
                            "source": feed.name or parsed.feed.get("title", feed.url),
                        }
                    )
        except Exception as e:
            # Log and continue with other feeds
            print(f"[news_fetcher] Error fetching {feed.url}: {e}")

    # Deduplicate by link
    seen: set[str] = set()
    unique: List[dict] = []
    for a in articles:
        key = a["link"] or a["title"]
        if key not in seen:
            seen.add(key)
            unique.append(a)

    unique.sort(key=lambda a: a["published"], reverse=True)
    return unique

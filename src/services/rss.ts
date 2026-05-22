import Parser from 'rss-parser';
import { FeedItem, RssFeedConfig } from '../types';

const parser = new Parser({ timeout: 10000 });

export async function fetchFeedItems(
  feeds: RssFeedConfig[],
  keywords: string[],
  maxItems: number
): Promise<FeedItem[]> {
  const allItems: FeedItem[] = [];
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  for (const feed of feeds) {
    try {
      const parsed = await parser.parseURL(feed.url);
      for (const item of parsed.items) {
        const text = `${item.title ?? ''} ${item.contentSnippet ?? ''} ${item.content ?? ''}`.toLowerCase();
        const matches = lowerKeywords.length === 0 || lowerKeywords.some(k => text.includes(k));
        if (matches) {
          allItems.push({
            title: item.title ?? '(タイトルなし)',
            link: item.link ?? '',
            contentSnippet: item.contentSnippet,
            pubDate: item.pubDate,
            feedTitle: feed.name ?? parsed.title ?? feed.url,
            feedUrl: feed.url,
          });
        }
      }
      console.log(`[RSS] ${feed.url}: ${parsed.items.length} items fetched`);
    } catch (err) {
      console.error(`[RSS] Failed to fetch ${feed.url}:`, err instanceof Error ? err.message : err);
    }
  }

  return allItems
    .sort((a, b) => {
      const da = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const db = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return db - da;
    })
    .slice(0, maxItems);
}

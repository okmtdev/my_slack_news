import axios from 'axios';
import { FeedItem } from '../types';

export async function postToSlack(
  webhookUrl: string,
  summary: string,
  items: FeedItem[],
  keywords: string[]
): Promise<void> {
  const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📰 ニュースダイジェスト: ${keywords.join(' / ')}`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: summary,
        },
      },
      { type: 'divider' },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `🕐 ${now} JST　|　📊 取得記事数: ${items.length}件　|　🔑 ${keywords.join(', ')}`,
          },
        ],
      },
    ],
  };

  await axios.post(webhookUrl, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}

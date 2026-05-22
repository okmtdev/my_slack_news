import { GoogleGenerativeAI } from '@google/generative-ai';
import { FeedItem } from '../types';

export async function summarizeNews(
  items: FeedItem[],
  keywords: string[],
  apiKey: string,
  model: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const generativeModel = genAI.getGenerativeModel({ model });

  const articlesText = items.map((item, i) => {
    const parts = [
      `[${i + 1}] ${item.title}`,
      `ソース: ${item.feedTitle}`,
      item.contentSnippet ? `概要: ${item.contentSnippet.slice(0, 200)}` : '',
      `URL: ${item.link}`,
      item.pubDate ? `日時: ${item.pubDate}` : '',
    ].filter(Boolean);
    return parts.join('\n');
  }).join('\n\n');

  const prompt = `あなたはテクノロジーニュースのアナリストです。
以下のニュース記事を分析し、「${keywords.join('、')}」に関するトピックについて日本語でまとめてください。

【指示】
- 重要なニュースを3〜5個のポイントに絞って要約してください
- 各ポイントは2〜3文で説明してください
- 関連するニュースのURLを各ポイントの末尾に含めてください
- Slackで読みやすいマークダウン形式（*太字*、箇条書き）で出力してください

【ニュース記事一覧】
${articlesText}`;

  const result = await generativeModel.generateContent(prompt);
  return result.response.text();
}

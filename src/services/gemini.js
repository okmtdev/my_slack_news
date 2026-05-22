'use strict';

const { post } = require('./http');

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

async function summarizeNews(items, keywords, apiKey, model) {
  const articlesText = items
    .map((item, i) => {
      const parts = [
        `[${i + 1}] ${item.title}`,
        `ソース: ${item.feedTitle}`,
        item.contentSnippet ? `概要: ${item.contentSnippet}` : '',
        `URL: ${item.link}`,
        item.pubDate ? `日時: ${item.pubDate}` : '',
      ].filter(Boolean);
      return parts.join('\n');
    })
    .join('\n\n');

  const prompt = `あなたはテクノロジーニュースのアナリストです。
以下のニュース記事を分析し、「${keywords.join('、')}」に関するトピックについて日本語でまとめてください。

【指示】
- 重要なニュースを3〜5個のポイントに絞って要約してください
- 各ポイントは2〜3文で説明してください
- 関連するニュースのURLを各ポイントの末尾に含めてください
- Slackで読みやすいマークダウン形式（*太字*、箇条書き）で出力してください

【ニュース記事一覧】
${articlesText}`;

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
  const body = { contents: [{ parts: [{ text: prompt }] }] };

  const responseText = await post(url, body);
  const data = JSON.parse(responseText);

  if (data.error) throw new Error(`Gemini API error: ${data.error.message}`);

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');

  return text;
}

module.exports = { summarizeNews };

'use strict';

const { fetchFeedItems } = require('./rss');
const { summarizeNews } = require('./gemini');
const { postToSlack } = require('./slack');

async function runNewsDigest(config) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!geminiApiKey) throw new Error('GEMINI_API_KEY is not set');
  if (!slackWebhookUrl) throw new Error('SLACK_WEBHOOK_URL is not set');
  if (!config.rssFeeds || config.rssFeeds.length === 0) throw new Error('RSS feeds are not configured');

  console.log(
    `[News] Fetching from ${config.rssFeeds.length} feeds, keywords: [${config.keywords.join(', ')}]`
  );

  const items = await fetchFeedItems(config.rssFeeds, config.keywords, config.maxArticlesPerRun);
  console.log(`[News] ${items.length} matching articles found`);

  if (items.length === 0) {
    return {
      success: true,
      articlesFound: 0,
      summary: '関連するニュースが見つかりませんでした。',
      timestamp,
      durationMs: Date.now() - startTime,
    };
  }

  const summary = await summarizeNews(items, config.keywords, geminiApiKey, config.geminiModel);
  console.log('[News] Summary generated, posting to Slack...');

  await postToSlack(slackWebhookUrl, summary, items, config.keywords);
  console.log('[News] Successfully posted to Slack');

  return {
    success: true,
    articlesFound: items.length,
    summary,
    timestamp,
    durationMs: Date.now() - startTime,
  };
}

module.exports = { runNewsDigest };

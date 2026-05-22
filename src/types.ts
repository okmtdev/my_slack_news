export interface FeedItem {
  title: string;
  link: string;
  contentSnippet?: string;
  pubDate?: string;
  feedTitle: string;
  feedUrl: string;
}

export interface RssFeedConfig {
  url: string;
  name?: string;
}

export interface AppConfig {
  rssFeeds: RssFeedConfig[];
  keywords: string[];
  maxArticlesPerRun: number;
  geminiModel: string;
}

export interface RunResult {
  success: boolean;
  articlesFound: number;
  summary?: string;
  error?: string;
  timestamp: string;
  durationMs: number;
}

export interface StatusResponse {
  status: 'idle' | 'running';
  lastRun: RunResult | null;
  runHistory: RunResult[];
  config: AppConfig;
  env: {
    hasGeminiApiKey: boolean;
    hasSlackWebhookUrl: boolean;
  };
}

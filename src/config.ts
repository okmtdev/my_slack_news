import fs from 'fs';
import path from 'path';
import { AppConfig } from './types';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'config.json');

const DEFAULT_CONFIG: AppConfig = {
  rssFeeds: [],
  keywords: [],
  maxArticlesPerRun: 20,
  geminiModel: 'gemini-1.5-flash',
};

export function loadConfig(): AppConfig {
  let config: AppConfig = { ...DEFAULT_CONFIG };

  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const fileConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      config = { ...config, ...fileConfig };
    }
  } catch {
    console.warn('[Config] Failed to load config.json, using defaults');
  }

  if (process.env.RSS_FEED_URLS) {
    config.rssFeeds = process.env.RSS_FEED_URLS.split(',')
      .map(url => ({ url: url.trim() }))
      .filter(f => f.url);
  }
  if (process.env.KEYWORDS) {
    config.keywords = process.env.KEYWORDS.split(',').map(k => k.trim()).filter(Boolean);
  }
  if (process.env.GEMINI_MODEL) {
    config.geminiModel = process.env.GEMINI_MODEL;
  }
  if (process.env.MAX_ARTICLES) {
    const n = parseInt(process.env.MAX_ARTICLES, 10);
    if (!isNaN(n)) config.maxArticlesPerRun = n;
  }

  return config;
}

export function saveConfig(config: AppConfig): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

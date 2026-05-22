import { Router, Request, Response } from 'express';
import { loadConfig, saveConfig } from '../config';
import { runNewsDigest } from '../services/news';
import { RunResult } from '../types';

export const router = Router();

let isRunning = false;
const runHistory: RunResult[] = [];
const MAX_HISTORY = 10;

router.get('/config', (_req: Request, res: Response) => {
  res.json(loadConfig());
});

router.post('/config', (req: Request, res: Response) => {
  try {
    saveConfig(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unknown error' });
  }
});

router.post('/run', async (_req: Request, res: Response) => {
  if (isRunning) {
    res.status(409).json({ error: '実行中です。しばらくお待ちください。' });
    return;
  }

  isRunning = true;
  try {
    const config = loadConfig();
    const result = await runNewsDigest(config);
    runHistory.unshift(result);
    if (runHistory.length > MAX_HISTORY) runHistory.pop();
    res.json(result);
  } catch (err) {
    const result: RunResult = {
      success: false,
      articlesFound: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      durationMs: 0,
    };
    runHistory.unshift(result);
    if (runHistory.length > MAX_HISTORY) runHistory.pop();
    res.status(500).json(result);
  } finally {
    isRunning = false;
  }
});

router.get('/status', (_req: Request, res: Response) => {
  res.json({
    status: isRunning ? 'running' : 'idle',
    lastRun: runHistory[0] ?? null,
    runHistory,
    config: loadConfig(),
    env: {
      hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
      hasSlackWebhookUrl: !!process.env.SLACK_WEBHOOK_URL,
    },
  });
});

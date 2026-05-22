'use strict';

const { loadConfig, saveConfig } = require('../config');
const { runNewsDigest } = require('../services/news');

let isRunning = false;
const runHistory = [];
const MAX_HISTORY = 10;

function addToHistory(result) {
  runHistory.unshift(result);
  if (runHistory.length > MAX_HISTORY) runHistory.pop();
}

async function handleApi(req, res, pathname) {
  if (pathname === '/api/config' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(loadConfig()));
    return;
  }

  if (pathname === '/api/config' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const config = JSON.parse(body);
      saveConfig(config);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/run' && req.method === 'POST') {
    if (isRunning) {
      res.writeHead(409, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '実行中です。しばらくお待ちください。' }));
      return;
    }

    isRunning = true;
    try {
      const config = loadConfig();
      const result = await runNewsDigest(config);
      addToHistory(result);
      res.writeHead(result.success ? 200 : 500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (err) {
      const result = {
        success: false,
        articlesFound: 0,
        error: err.message,
        timestamp: new Date().toISOString(),
        durationMs: 0,
      };
      addToHistory(result);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
    } finally {
      isRunning = false;
    }
    return;
  }

  if (pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: isRunning ? 'running' : 'idle',
        lastRun: runHistory[0] ?? null,
        runHistory,
        config: loadConfig(),
        env: {
          hasGeminiApiKey: !!process.env.GEMINI_API_KEY,
          hasSlackWebhookUrl: !!process.env.SLACK_WEBHOOK_URL,
        },
      })
    );
    return;
  }

  return false;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    req.on('error', reject);
  });
}

module.exports = { handleApi };

'use strict';

const https = require('node:https');
const http = require('node:http');

/**
 * Make an HTTPS/HTTP request and return the response body as a string.
 * Follows up to 5 redirects.
 */
function request(url, opts = {}, body = null, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));

    const parsed = new URL(url);
    const lib = parsed.protocol === 'https:' ? https : http;

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: opts.method || 'GET',
      headers: opts.headers || {},
      timeout: opts.timeout || 15000,
    };

    const req = lib.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${parsed.protocol}//${parsed.host}${res.headers.location}`;
        res.resume();
        request(next, opts, body, redirectCount + 1).then(resolve).catch(reject);
        return;
      }

      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf-8');
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${text.slice(0, 200)}`));
        } else {
          resolve(text);
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });

    if (body) req.write(body);
    req.end();
  });
}

function get(url, opts = {}) {
  return request(url, { ...opts, method: 'GET' });
}

function post(url, data, opts = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  return request(url, {
    ...opts,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...opts.headers },
  }, body);
}

module.exports = { get, post };

'use strict';

const { get } = require('./http');

function getTagContent(xml, tag) {
  const patterns = [
    new RegExp(`<${tag}(?:\\s[^>]*)?><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'),
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'),
  ];
  for (const re of patterns) {
    const m = xml.match(re);
    if (m) return m[1].trim();
  }
  return '';
}

function getAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  const m = xml.match(re);
  return m ? m[1] : '';
}

function splitItems(xml, tag) {
  const results = [];
  const open = `<${tag}`;
  const close = `</${tag}>`;
  let pos = 0;
  while (true) {
    const start = xml.indexOf(open, pos);
    if (start === -1) break;
    const end = xml.indexOf(close, start);
    if (end === -1) break;
    results.push(xml.slice(start, end + close.length));
    pos = end + close.length;
  }
  return results;
}

function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

async function parseFeed(url) {
  const xml = await get(url);
  const isAtom = /<feed[\s>]/.test(xml);
  const feedTitle = getTagContent(xml, 'title') || url;
  const items = [];

  const entries = isAtom ? splitItems(xml, 'entry') : splitItems(xml, 'item');

  for (const entry of entries) {
    const title = stripHtml(getTagContent(entry, 'title'));

    let link = '';
    if (isAtom) {
      link = getAttr(entry, 'link', 'href') || getTagContent(entry, 'link');
    } else {
      link = getTagContent(entry, 'link') || getTagContent(entry, 'guid');
    }

    const snippet = isAtom
      ? stripHtml(getTagContent(entry, 'summary') || getTagContent(entry, 'content'))
      : stripHtml(getTagContent(entry, 'description') || getTagContent(entry, 'content:encoded'));

    const pubDate = isAtom
      ? getTagContent(entry, 'updated') || getTagContent(entry, 'published')
      : getTagContent(entry, 'pubDate') || getTagContent(entry, 'dc:date');

    if (title || link) {
      items.push({ title: title || '(no title)', link, contentSnippet: snippet, pubDate, feedTitle });
    }
  }

  return { feedTitle, items };
}

async function fetchFeedItems(feeds, keywords, maxItems) {
  const allItems = [];
  const lowerKw = keywords.map((k) => k.toLowerCase());

  for (const feed of feeds) {
    try {
      const { feedTitle, items } = await parseFeed(feed.url);
      for (const item of items) {
        const text = `${item.title} ${item.contentSnippet}`.toLowerCase();
        const matches = lowerKw.length === 0 || lowerKw.some((k) => text.includes(k));
        if (matches) {
          allItems.push({ ...item, feedTitle: feed.name || feedTitle, feedUrl: feed.url });
        }
      }
      console.log(`[RSS] ${feed.url}: ${items.length} items (source: ${feedTitle})`);
    } catch (err) {
      console.error(`[RSS] Failed to fetch ${feed.url}: ${err.message}`);
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

module.exports = { fetchFeedItems };

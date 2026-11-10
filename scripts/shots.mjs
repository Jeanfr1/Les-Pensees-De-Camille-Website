// Scroll captures: node scripts/shots.mjs <width> <height> <label> [step]
import { chromium } from 'playwright-core';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { execSync } from 'node:child_process';
const [w = 1440, h = 790, label = 'd', stepArg] = process.argv.slice(2);
const root = path.resolve('site'), out = path.resolve('qa-out'); fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff': 'font/woff', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(b); } }); }).listen(0);
const base = process.env.QA_BASE || `http://localhost:${srv.address().port}/`;
const exe = process.env.CHROME || execSync(`find ~/Library/Caches/ms-playwright/chromium-1228 -type f \\( -name Chromium -o -name "Google Chrome for Testing" \\) | head -1`).toString().trim();
const b = await chromium.launch({ executablePath: exe });
const pg = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1, isMobile: +w < 700, hasTouch: +w < 700 });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
await pg.goto(base, { waitUntil: 'load' });
await pg.waitForTimeout(700); await pg.screenshot({ path: `${out}/${label}-intro.jpg`, quality: 70 });
await pg.waitForTimeout(4200);
const total = await pg.evaluate(() => document.documentElement.scrollHeight);
const step = +(stepArg || Math.round(h * .5)); let i = 0;
for (let y = 0; y < total - h + step; y += step) {
  await pg.evaluate(y => scrollTo(0, y), y); await pg.waitForTimeout(1100);
  await pg.screenshot({ path: `${out}/${label}-${String(i++).padStart(2, '0')}.jpg`, quality: 70 });
}
const m = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth, total: document.documentElement.scrollHeight }));
console.log(JSON.stringify({ label, shots: i, ...m, errs }));
await b.close(); srv.close();

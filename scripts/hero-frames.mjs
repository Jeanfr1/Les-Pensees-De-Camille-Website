import { chromium } from 'playwright-core'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const [w = 1440, h = 790, label = 'h'] = process.argv.slice(2);
const root = path.resolve('site'), out = path.resolve('qa-out'); fs.mkdirSync(out, { recursive: true });
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { let p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(b); } }); }).listen(0);
const exe = execSync(`find ~/Library/Caches/ms-playwright/chromium-1228 -type f -name "Google Chrome for Testing" | head -1`).toString().trim();
const b = await chromium.launch({ executablePath: exe });
const pg = await b.newPage({ viewport: { width: +w, height: +h }, isMobile: +w < 700, hasTouch: +w < 700 });
await pg.goto(`http://localhost:${srv.address().port}/`, { waitUntil: 'load' });
let t = 0; for (const ms of [500, 1300, 1700, 2100, 2600, 3300]) { await pg.waitForTimeout(ms - t); t = ms; await pg.screenshot({ path: `${out}/${label}-i${ms}.jpg`, quality: 72 }); }
await pg.waitForTimeout(2500);
for (const p of [.12, .28, .45, .7]) { await pg.evaluate(y => scrollTo(0, y), Math.round(p * h * 1.7)); await pg.waitForTimeout(1300); await pg.screenshot({ path: `${out}/${label}-s${Math.round(p * 100)}.jpg`, quality: 72 }); }
await b.close(); srv.close();

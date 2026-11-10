// README assets from the running page: node scripts/readme-assets.mjs
import { chromium } from 'playwright-core'; import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
const root = path.resolve('site'), tmp = path.resolve('qa-out/readme'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp + '/f', { recursive: true });
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff': 'font/woff' };
const srv = http.createServer((q, r) => { let p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(b); } }); }).listen(0);
const base = process.env.QA_BASE || `http://localhost:${srv.address().port}/`;
const exe = execSync(`find ~/Library/Caches/ms-playwright -type f -name "Google Chrome for Testing" | head -1`).toString().trim();
const b = await chromium.launch({ executablePath: exe });
// banner
{ const pg = await b.newPage({ viewport: { width: 1600, height: 520 } });
  await pg.goto(base); await pg.setContent(`<base href="${base}"><style>@font-face{font-family:IS;src:url(assets/fonts/InstrumentSerif-Regular.woff)}@font-face{font-family:IS;font-style:italic;src:url(assets/fonts/InstrumentSerif-Italic.woff)}@font-face{font-family:M;src:url(assets/fonts/Manrope-Variable.woff)}
  body{margin:0;width:1600px;height:520px;background:radial-gradient(60% 90% at 74% 40%,#fbf8f0,#F3EFE4 70%);overflow:hidden;position:relative;font-family:IS;color:#1B1D1B}
  .l{position:absolute;left:96px;top:70px;width:210px}.e{position:absolute;left:96px;top:206px;font:600 13px M;letter-spacing:.3em;text-transform:uppercase}
  h1{position:absolute;left:92px;top:232px;margin:0;font:400 124px/.9 IS;letter-spacing:-.02em}h1 i{color:#B7A075;font-style:normal}
  p{position:absolute;left:96px;top:452px;margin:0;font:italic 26px IS;color:#7A6235}
  .s{position:absolute;right:120px;top:-40px;height:640px;aspect-ratio:1122/1402}.s img{position:absolute}</style>
  <img class="l" src="assets/brand/logo.webp"><div class="e">Fleurs, plantes & jolies attentions · Herbignac</div><h1>LES MOTS<br>EN FLEURS<i>.</i></h1><p>Pour ce que l’on a envie de dire.</p>
  <div class="s"><img src="assets/images/hero/base.webp" style="inset:0;width:100%;height:100%"><img src="assets/images/hero/lisi2.webp" style="left:83.78%;top:20.83%;width:14.53%"><img src="assets/images/hero/lisi.webp" style="left:73.44%;top:45.22%;width:25.94%"><img src="assets/images/hero/rose.webp" style="left:33.33%;top:43.79%;width:29.77%"><img src="assets/images/hero/gerbera.webp" style="left:45.9%;top:20.19%;width:40.46%"></div>`);
  await pg.waitForTimeout(900); await pg.screenshot({ path: '.github/assets/banner.png' }); await pg.close(); }
// gif frames 1440x900
{ const pg = await b.newPage({ viewport: { width: 1440, height: 900 } }); let n = 0; const shot = () => pg.screenshot({ path: `${tmp}/f/f_${String(n++).padStart(4, '0')}.png` });
  await pg.goto(base, { waitUntil: 'load' }); await pg.waitForTimeout(1000);
  for (let i = 0; i < 16; i++) { await shot(); await pg.waitForTimeout(90); }
  await pg.waitForTimeout(1500); for (let i = 0; i < 4; i++) await shot();
  for (let i = 1; i <= 26; i++) { await pg.evaluate(y => scrollTo(0, y), Math.round(1530 * i / 26)); await pg.waitForTimeout(420); await shot(); }
  for (let i = 0; i < 4; i++) await shot();
  const total = await pg.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let i = 1; i <= 34; i++) { await pg.evaluate(y => scrollTo(0, y), Math.round(1530 + (total - 1530) * i / 34)); await pg.waitForTimeout(520); await shot(); }
  for (let i = 0; i < 5; i++) await shot();
  // section stills
  const ids = { hero: 0, phrase: 1300 };
  for (const [k, y] of Object.entries(ids)) { await pg.evaluate(y => scrollTo(0, y), y); await pg.waitForTimeout(1500); await pg.screenshot({ path: `${tmp}/d-${k}.png` }); }
  for (const [k, sel, off] of [['creations', '#creations', 900], ['occasions', '#occasions', 120], ['fraicheur', '#fraicheur', 40], ['boutique', '#boutique', 60], ['livraison', '#livraison', 40], ['contact', '#contact', 40]]) {
    await pg.evaluate(([s, o]) => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - 500), [sel, off]); await pg.waitForTimeout(500);
    await pg.evaluate(([s, o]) => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY + o), [sel, off]); await pg.waitForTimeout(1600); await pg.screenshot({ path: `${tmp}/d-${k}.png` }); }
  await pg.close(); }
// phone stills
{ const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await pg.goto(base, { waitUntil: 'load' }); await pg.waitForTimeout(4800); await pg.screenshot({ path: `${tmp}/m-hero.png` });
  await pg.evaluate(() => scrollTo(0, 1150)); await pg.waitForTimeout(1500); await pg.screenshot({ path: `${tmp}/m-phrase.png` });
  for (const [k, sel, off] of [['occasions', '#occasions', 40], ['boutique', '#boutique', 330], ['contact', '#contact', 20]]) {
    await pg.evaluate(([s, o]) => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - 400), [sel, off]); await pg.waitForTimeout(500);
    await pg.evaluate(([s, o]) => scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY + o), [sel, off]); await pg.waitForTimeout(1600); await pg.screenshot({ path: `${tmp}/m-${k}.png` }); }
  await pg.close(); }
await b.close(); srv.close();
execSync(`ffmpeg -y -loglevel error -framerate 10 -i ${tmp}/f/f_%04d.png -vf "fps=10,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=112:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" -loop 0 .github/assets/hero-scroll.gif`);
console.log('gif', (fs.statSync('.github/assets/hero-scroll.gif').size / 1e6).toFixed(2), 'MB');

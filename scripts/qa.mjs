// QA: node scripts/qa.mjs   (QA_BASE=https://… to test the live site)
import { chromium } from 'playwright-core';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
import { execSync } from 'node:child_process';

const root = path.resolve('site');
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.woff': 'font/woff', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let p = path.join(root, decodeURIComponent(q.url.split('?')[0])); if (p.endsWith('/')) p += 'index.html'; fs.readFile(p, (e, b) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); r.end(b); } }); }).listen(0);
const base = process.env.QA_BASE || `http://localhost:${srv.address().port}/`;
const exe = process.env.CHROME || execSync(`find ~/Library/Caches/ms-playwright -type f -name "Google Chrome for Testing" | head -1`).toString().trim();
const browser = await chromium.launch({ executablePath: exe });

let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { c ? pass++ : fail++; if (!c) console.log('  ✗', name, extra); };

const sizes = [[1280, 650], [1440, 790], [1920, 950], [1024, 768], [768, 1024], [390, 844], [360, 740]];
for (const [w, h] of sizes) {
  const phone = w < 700;
  const pg = await browser.newPage({ viewport: { width: w, height: h }, isMobile: phone, hasTouch: phone });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  const bad = []; pg.on('response', r => r.status() >= 400 && bad.push(r.url()));
  await pg.goto(base, { waitUntil: 'load' }); await pg.waitForTimeout(4600);
  const tag = `${w}x${h}`;
  ok(errs.length === 0, `${tag} no console errors`, errs.join(' | '));
  ok(bad.length === 0, `${tag} no failed requests`, bad.join(' | '));
  const m = await pg.evaluate(() => {
    const r = s => document.querySelector(s).getBoundingClientRect();
    const h1 = r('h1'), st = r('.stage'), pin = r('.hero-pin'), cta = r('.hero .button-gold');
    return {
      sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight,
      hero: pin.height / innerHeight, h1w: h1.width / innerWidth, h1px: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      h1in: h1.left >= 0 && h1.right <= innerWidth + 1, ctaVisible: cta.bottom <= innerHeight && cta.top > 0,
      stageH: st.height / pin.height, veil: getComputedStyle(document.querySelector('.veil')).display,
      small: [...document.querySelectorAll('p,a,li,td,th,span,em,button')].filter(e => e.offsetParent && e.textContent.trim() && !e.children.length && parseFloat(getComputedStyle(e).fontSize) < 9.5).length,
    };
  });
  ok(m.sw === m.iw, `${tag} no horizontal overflow`, `${m.sw} vs ${m.iw}`);
  ok(m.hero <= 1.001, `${tag} hero ≤ 1 screen`, m.hero.toFixed(2));
  ok(m.h1in, `${tag} H1 inside viewport`);
  ok(m.h1px <= m.iw * .2 && m.h1px <= 132, `${tag} H1 size sane`, m.h1px);
  ok(m.ctaVisible, `${tag} hero CTA visible at load`);
  ok(m.veil === 'none', `${tag} intro veil gone`);
  ok(m.small === 0, `${tag} no text under 9.5px`, m.small);
  // scroll the whole page at a natural pace, checking overflow + image upscale
  const total = await pg.evaluate(() => document.documentElement.scrollHeight);
  let maxUp = 0, overflow = false;
  for (let y = 0; y < total; y += Math.round(h * .6)) {
    await pg.evaluate(y => scrollTo(0, y), y); await pg.waitForTimeout(260);
    const s = await pg.evaluate(() => {
      let up = 0; const dpr = 1;
      document.querySelectorAll('main img').forEach(i => { if (!i.naturalWidth || !i.offsetParent || i.closest('[aria-hidden]')) return; const r = i.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; up = Math.max(up, i.offsetWidth * dpr / i.naturalWidth); });
      return { up, of: document.documentElement.scrollWidth > innerWidth };
    });
    maxUp = Math.max(maxUp, s.up); overflow = overflow || s.of;
  }
  ok(!overflow, `${tag} no overflow while scrolling`);
  ok(maxUp <= 1.12, `${tag} photos not upscaled`, maxUp.toFixed(2));
  // sentence state of the hero
  await pg.evaluate(h => scrollTo(0, h * 1.25), h); await pg.waitForTimeout(1500);
  const sen = await pg.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= 0 && r.bottom <= innerHeight + 2; };
    const mots = [...document.querySelectorAll('.mot')], fls = [...document.querySelectorAll('.fl')];
    const rects = mots.map(e => e.getBoundingClientRect());
    let overlap = false; for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) { const a = rects[i], b = rects[j]; if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) overlap = true; }
    return { mots: mots.every(e => vis(e) && +getComputedStyle(e).opacity > .9), fls: fls.every(vis), overlap, cap: vis(document.querySelector('.phrase-caption')) };
  });
  ok(sen.mots, `${tag} sentence: four words visible`); ok(sen.fls, `${tag} sentence: flowers inside viewport`);
  ok(!sen.overlap, `${tag} sentence: words do not overlap`); ok(sen.cap, `${tag} sentence: caption visible`);
  // anchors land on their section
  for (const id of ['creations', 'occasions', 'fraicheur', 'boutique', 'livraison', 'contact']) {
    await pg.evaluate(id => { const t = document.getElementById(id); scrollTo(0, t.getBoundingClientRect().top + scrollY); }, id); await pg.waitForTimeout(350);
    const top = await pg.evaluate(id => document.getElementById(id).getBoundingClientRect().top, id);
    ok(Math.abs(top) < 4, `${tag} anchor #${id}`, top);
  }
  // contact CTAs clickable (real hit test)
  const hit = await pg.evaluate(() => [...document.querySelectorAll('.contact .button, .contact .social')].every(a => { a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return el && (el === a || a.contains(el)); }));
  ok(hit, `${tag} contact buttons receive the pointer`);
  if (phone) {
    await pg.evaluate(() => scrollTo(0, 0)); await pg.waitForTimeout(300);
    await pg.tap('.menu-toggle'); await pg.waitForTimeout(900);
    ok(await pg.evaluate(() => getComputedStyle(document.getElementById('navigation')).visibility === 'visible'), `${tag} menu opens`);
    await pg.tap('#navigation a[href="#contact"]'); await pg.waitForTimeout(1600);
    ok(await pg.evaluate(() => !document.documentElement.classList.contains('menu-open')), `${tag} menu closes on link`);
  }
  await pg.close();
}

// facts, links, a11y basics
{
  const pg = await browser.newPage({ viewport: { width: 1440, height: 790 } });
  await pg.goto(base, { waitUntil: 'load' }); await pg.waitForTimeout(4600);
  const f = await pg.evaluate(() => ({
    tel: [...document.querySelectorAll('a[href^="tel:"]')].every(a => a.getAttribute('href') === 'tel:+33251753861'),
    mail: [...document.querySelectorAll('a[href^="mailto:"]')].every(a => a.getAttribute('href') === 'mailto:Lespenseesdecamille@gmail.com'),
    ig: !!document.querySelector('a[href="https://www.instagram.com/les_pensees_de_camille/"]'),
    fb: !!document.querySelector('a[href="https://www.facebook.com/lespenseesdecamille"]'),
    ext: [...document.querySelectorAll('a[target=_blank]')].every(a => a.rel.includes('noopener')),
    alts: [...document.querySelectorAll('img')].every(i => i.hasAttribute('alt')),
    h1: document.querySelectorAll('h1').length, lang: document.documentElement.lang,
    text: document.body.textContent,
    icons: [...document.querySelectorAll('use')].every(u => document.querySelector(u.getAttribute('href'))),
    noindex: !!document.querySelector('meta[name=robots][content*=noindex]'),
    today: document.querySelectorAll('.hours tr.is-today').length,
  }));
  ok(f.tel, 'tel links'); ok(f.mail, 'mail links'); ok(f.ig, 'Instagram link'); ok(f.fb, 'Facebook link'); ok(f.ext, 'external links noopener');
  ok(f.alts, 'all images have alt'); ok(f.h1 === 1, 'one H1'); ok(f.lang === 'fr', 'lang fr'); ok(f.icons, 'icon sprites resolve'); ok(f.noindex, 'noindex'); ok(f.today === 1, 'today highlighted');
  for (const t of ['7 avenue de la Monneraye', '44410 Herbignac', '02 51 75 38 61', '9h – 19h30', 'Fermé', '20 km', 'Chèque', 'Mastercard', 'Mariages', 'Anniversaires', 'Hommages', 'Bouquets', 'Compositions', 'Plantes', 'Chocolat', 'Pétales de roses', 'Décoration intérieure', 'Partout en France'])
    ok(f.text.includes(t), `content: ${t}`);
  for (const t of ['Lorem', 'IA', 'généré', 'campagne', 'TODO', 'kit']) ok(!new RegExp(`\\b${t}\\b`).test(f.text), `no production note: ${t}`);
  // dialog
  await pg.evaluate(() => document.querySelector('[data-open]').scrollIntoView()); await pg.click('[data-open="informations"]');
  ok(await pg.evaluate(() => document.getElementById('informations').open), 'dialog opens'); await pg.keyboard.press('Escape');
  ok(await pg.evaluate(() => !document.getElementById('informations').open), 'dialog closes on Escape');
  // motion pause
  await pg.click('#motion-toggle'); await pg.waitForTimeout(400);
  ok(await pg.evaluate(() => !document.documentElement.classList.contains('motion') && !document.querySelector('.pin-spacer')), 'pause removes motion + pins');
  ok(await pg.evaluate(() => [...document.querySelectorAll('h2, .occ-list strong, .hours tr, .chips li')].every(e => +getComputedStyle(e).opacity === 1)), 'paused: content visible');
  await pg.click('#motion-toggle'); await pg.waitForTimeout(600);
  ok(await pg.evaluate(() => document.documentElement.classList.contains('motion') && !!document.querySelector('.pin-spacer')), 'resume restores motion');
  await pg.close();
}
// reduced motion + no JS
{
  const c = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 790 } }); const pg = await c.newPage();
  await pg.goto(base, { waitUntil: 'load' }); await pg.waitForTimeout(800);
  ok(await pg.evaluate(() => !document.documentElement.classList.contains('motion') && getComputedStyle(document.querySelector('.veil')).display === 'none' && !document.querySelector('.pin-spacer')), 'reduced motion: static page');
  ok(await pg.evaluate(() => getComputedStyle(document.querySelector('.door')).display === 'none'), 'reduced motion: vitrine uncovered');
  await c.close();
  const c2 = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }); const p2 = await c2.newPage();
  await p2.goto(base, { waitUntil: 'load' });
  ok(await p2.evaluate(() => getComputedStyle(document.querySelector('.veil')).display === 'none' && document.body.innerText.includes('Faisons fleurir')), 'no JS: content readable');
  await c2.close();
}
// first-load weight
{
  const pg = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true }); let bytes = 0;
  await pg.goto(base, { waitUntil: 'load' }); await pg.waitForTimeout(3000);
  bytes = await pg.evaluate(() => performance.getEntriesByType('resource').reduce((s, e) => s + (e.encodedBodySize || 0), 0) + performance.getEntriesByType('navigation')[0].encodedBodySize);
  ok(bytes < 1.6e6, 'phone first load < 1.6 MB', (bytes / 1e6).toFixed(2) + ' MB'); console.log('  phone first load:', (bytes / 1e6).toFixed(2), 'MB');
  await pg.close();
}
await browser.close(); srv.close();
console.log(`\nQA ${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);

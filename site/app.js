/* Les Pensées de Camille — interface + chorégraphie (GSAP). Sans JS ou en mouvement réduit, tout le contenu reste visible. */
(() => {
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('.header');

  /* ---------- text splitting (harmless without motion) ---------- */
  $$('[data-split]').forEach(el => {
    el.innerHTML = [...el.textContent].map(c => c === ' ' ? ' ' : `<span class="ch">${c}</span>`).join('');
  });
  $$('[data-lines]').forEach(el => {
    el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="ln"><span>${l}</span></span>`).join('');
  });

  /* ---------- menu ---------- */
  const toggle = $('.menu-toggle');
  const setMenu = open => { root.classList.toggle('menu-open', open); toggle.setAttribute('aria-expanded', open); $('.menu-label').textContent = open ? 'Fermer' : 'Menu'; };
  toggle.addEventListener('click', () => setMenu(!root.classList.contains('menu-open')));
  d.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- in-page links ---------- */
  d.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]'); if (!a) return;
    const t = $(a.getAttribute('href')); if (!t) return;
    e.preventDefault(); setMenu(false);
    const y = t.getBoundingClientRect().top + scrollY;
    scrollTo({ top: y, behavior: reduce.matches ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  });

  /* ---------- dialog ---------- */
  let opener = null;
  $$('[data-open]').forEach(b => b.addEventListener('click', () => { opener = b; $('#' + b.dataset.open).showModal(); }));
  $$('dialog').forEach(dl => {
    dl.addEventListener('click', e => { if (e.target === dl || e.target.closest('[data-close]')) dl.close(); });
    dl.addEventListener('close', () => opener && opener.focus());
  });

  /* ---------- year + opening hours (heure de Paris) ---------- */
  $('#annee').textContent = new Date().getFullYear();
  (() => {
    try {
      const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Paris', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map(x => [x.type, x.value]));
      const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min = (+p.hour % 24) * 60 + +p.minute;
      const close = day === 0 ? 0 : day <= 3 ? 19 * 60 : 19 * 60 + 30;
      const open = day !== 0 && min >= 9 * 60 && min < close;
      const row = $(`.hours tr[data-day="${day}"]`); if (row) row.classList.add('is-today');
      const b = $('.open-badge'); b.hidden = false; b.textContent = open ? 'Ouvert' : 'Fermé'; b.classList.toggle('is-open', open);
    } catch (e) { /* the table stays readable */ }
  })();

  /* ---------- créations: steps ---------- */
  const frames = $$('.crea-frame'), items = $$('.crea-index li'), ambs = $$('.crea-ambient img'), countEl = $('.crea-count b');
  let step = -1, creaST = null;
  const setStep = i => {
    if (i === step) return; step = i;
    items.forEach((li, k) => li.classList.toggle('is-active', k === i));
    frames.forEach((f, k) => f.classList.toggle('is-active', k === i));
    ambs.forEach((a, k) => a.style.opacity = k === i ? .5 : 0);
    countEl.textContent = '0' + (i + 1);
  };
  setStep(0);
  items.forEach((li, i) => $('button', li).addEventListener('click', () => {
    if (creaST && creaST.pin) { const s = creaST; scrollTo({ top: s.start + (s.end - s.start) * [.06, .52, .97][i], behavior: 'smooth' }); }
    else if (creaST) { const s = creaST; scrollTo({ top: s.start + (s.end - s.start) * [0, .52, 1][i], behavior: 'smooth' }); }
    else setStep(i);
  }));

  /* ---------- header: theme, hide on scroll down ---------- */
  const themed = $$('[data-theme]'), fab = $('.call-fab'), hero = $('.hero'), contact = $('.contact');
  let lastY = scrollY, tick = false;
  const onScroll = () => {
    tick = false;
    const y = scrollY, probe = 36;
    let theme = 'light';
    for (const s of themed) { const r = s.getBoundingClientRect(); if (r.top <= probe && r.bottom > probe) { theme = s.dataset.theme; break; } }
    header.classList.toggle('on-dark', theme === 'dark');
    header.classList.toggle('is-solid', y > 30);
    if (!root.classList.contains('menu-open')) header.classList.toggle('is-hidden', y > lastY && y > 400);
    lastY = y;
    const hr = hero.getBoundingClientRect(), cr = contact.getBoundingClientRect();
    fab.classList.toggle('is-away', hr.bottom > innerHeight * .6 || cr.top < innerHeight * .7);
  };
  addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ================= MOTION ================= */
  let ctx = null, firstRun = true;
  const mToggle = $('#motion-toggle');

  function startMotion() {
    if (!window.gsap || !window.ScrollTrigger) { root.classList.remove('motion', 'intro'); return; }
    gsap.registerPlugin(ScrollTrigger);
    root.classList.add('motion');
    const withIntro = firstRun && scrollY < 40; firstRun = false;
    if (!withIntro) root.classList.remove('intro');

    ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      const pin = $('.hero-pin'), stage = $('.stage'), breathEl = $('.stage-breath');
      const order = ['gerbera', 'rose', 'lisi', 'lisi2'];
      const fl = Object.fromEntries(order.map(n => [n, $(`.fl[data-fl="${n}"]`)]));
      const mots = Object.fromEntries(order.map(n => [n, $(`.mot[data-mot="${n}"]`)]));
      const T = {};

      /* where each flower lands when the bouquet becomes a sentence */
      const measure = () => {
        const W = pin.offsetWidth, H = pin.offsetHeight, phone = W <= 900;
        const pos = phone ? [[.27, .25], [.73, .25], [.27, .56], [.73, .56]] : [[.15, .37], [.385, .37], [.615, .37], [.85, .37]];
        const hs = phone ? [.2, .17, .17, .115] : [.37, .31, .3, .2];
        const cap = phone ? W * .4 : W * .21;
        order.forEach((n, i) => {
          const el = fl[n], th = Math.min(H * hs[i], cap * hs[i] / hs[0]);
          const cx = stage.offsetLeft + el.offsetLeft + el.offsetWidth / 2, cy = stage.offsetTop + el.offsetTop + el.offsetHeight / 2;
          T[n] = { x: pos[i][0] * W - cx, y: pos[i][1] * H - cy, s: th / el.offsetHeight };
          const ref = Math.min(H * hs[0], cap);
          mots[n].style.left = pos[i][0] * W + 'px';
          mots[n].style.top = pos[i][1] * H + ref / 2 + (phone ? 8 : 22) + 'px';
        });
      };
      measure();
      ScrollTrigger.addEventListener('refreshInit', measure);

      /* --- load intro --- */
      let breath = null;
      const idle = () => {
        breath = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 4.6, ease: 'sine.inOut' } })
          .to(breathEl, { rotation: .7, y: 7 }, 0)
          .to('.fl-gerbera img', { rotation: 4 }, 0)
          .to('.fl-rose img', { rotation: -3 }, 0)
          .to('.fl-lisi img', { rotation: 5 }, 0);
      };
      if (withIntro) {
        gsap.timeline({ defaults: { ease: 'expo.out' }, onComplete: () => { root.classList.remove('intro'); idle(); } })
          .from('.veil img', { scale: .4, autoAlpha: 0, rotation: -50, duration: .8 })
          .from('.veil span', { autoAlpha: 0, y: 12, duration: .6 }, .15)
          .to('.veil', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, 1)
          .from('.st-base', { clipPath: 'inset(100% 0% 0% 0%)', rotation: 6, transformOrigin: '72% 96%', duration: 1.7 }, 1.25)
          .from('.stage-shadow', { autoAlpha: 0, duration: 1.6 }, 1.6)
          .from('.fl img', { scale: 0, rotation: -120, duration: 1.5, ease: 'elastic.out(1,.62)', stagger: .15 }, 1.85)
          .from('h1 .ch', { yPercent: 115, duration: 1.1, stagger: .035 }, 1.35)
          .from('.hero-label, .hero .gold-rule, .hero .actions, .hero-note, .scroll-note', { autoAlpha: 0, y: 18, duration: 1, stagger: .09 }, 1.8)
          .from('.petal', { autoAlpha: 0, scale: .3, duration: 1.6, stagger: .09 }, 1.7)
          .from(header, { autoAlpha: 0, duration: 1, clearProps: 'opacity,visibility' }, 1.7);
      } else idle();

      /* --- hero: the bouquet unties into a sentence --- */
      const rot = { gerbera: -200, rose: 150, lisi: -120, lisi2: 220 };
      const htl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: '.hero', start: 'top top', end: () => '+=' + pin.offsetHeight * 1.7, pin: pin, scrub: .7, invalidateOnRefresh: true, anticipatePin: 1,
          onUpdate: s => breath && breath.paused(s.progress > .01)
        }
      });
      htl.to('.hero-copy', { yPercent: -14, autoAlpha: 0, duration: 1.3, ease: 'power2.in' }, 0)
        .to('.scroll-note', { autoAlpha: 0, duration: .5 }, 0)
        .to('.st-base', { autoAlpha: 0, yPercent: 7, scale: .94, transformOrigin: '72% 96%', duration: 2.6 }, .25)
        .to('.stage-shadow', { autoAlpha: 0, duration: 1.6 }, .25);
      order.forEach((n, i) => {
        htl.to(fl[n], { x: () => T[n].x, y: () => T[n].y, scale: () => T[n].s, rotation: rot[n], duration: 3.4 }, .35 + i * .28)
          .fromTo(mots[n], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: .9, ease: 'power3.out' }, 3.5 + i * .45);
      });
      htl.fromTo('.hero-ghost', { xPercent: 6, autoAlpha: 0 }, { xPercent: -8, autoAlpha: 1, duration: 2.4, ease: 'none' }, 1.6)
        .to('.hero-ghost', { xPercent: -46, duration: 6, ease: 'none' }, 4);
      htl.fromTo('.phrase-caption', { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out' }, 5.6)
        .to(order.map(n => fl[n]), { y: '-=16', rotation: '+=14', duration: 3.2, ease: 'sine.inOut', stagger: .12 }, 6.7)
        .to('.petal', { y: i => pin.offsetHeight * (.34 + .13 * i), x: i => (i % 2 ? -1 : 1) * (40 + i * 26), rotation: i => (i % 2 ? '-=' : '+=') + (120 + i * 30), duration: 10, ease: 'none' }, 0);

      /* pointer depth (desktop) */
      mm.add('(hover:hover) and (min-width:901px)', () => {
        const depth = [['.st-base', 8], ['.fl-lisi2 img', 14], ['.fl-lisi img', 20], ['.fl-rose img', 26], ['.fl-gerbera img', 34]]
          .map(([s, k]) => ({ k, x: gsap.quickTo(s, 'x', { duration: .9, ease: 'power3' }), y: gsap.quickTo(s, 'y', { duration: .9, ease: 'power3' }) }));
        const mv = e => { const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5; depth.forEach(o => { o.x(-nx * o.k); o.y(-ny * o.k); }); };
        pin.addEventListener('pointermove', mv);
        return () => pin.removeEventListener('pointermove', mv);
      });

      /* --- marquee --- */
      const mq = { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: .6 };
      gsap.fromTo('.r1', { xPercent: 4 }, { xPercent: -30, ease: 'none', scrollTrigger: mq });
      gsap.fromTo('.r2', { xPercent: -34 }, { xPercent: -2, ease: 'none', scrollTrigger: mq });

      /* --- créations: pinned stepper, photos wipe over each other --- */
      const creaTl = scrollTrigger => {
        const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1 }, scrollTrigger });
        tl.fromTo(frames[1], { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, .5)
          .fromTo($('img', frames[1]), { yPercent: 16 }, { yPercent: 0 }, .5)
          .to($('img', frames[0]), { yPercent: -10 }, .5)
          .fromTo(frames[2], { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)' }, 2)
          .fromTo($('img', frames[2]), { xPercent: 12 }, { xPercent: 0 }, 2)
          .to($('img', frames[1]), { xPercent: -8 }, 2)
          .to({}, { duration: .6 });
        creaST = tl.scrollTrigger;
        return tl;
      };
      const stepFrom = p => setStep(p < .3 ? 0 : p < .72 ? 1 : 2);
      gsap.fromTo(frames[0], { clipPath: 'inset(22% 16% 22% 16%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.creations', start: 'top 85%', end: 'top 10%', scrub: .5 } });
      mm.add('(min-width:901px) and (min-height:540px)', () => {
        creaTl({ trigger: '.creations', start: 'top top', end: '+=210%', pin: true, scrub: .6, anticipatePin: 1, onUpdate: s => stepFrom(s.progress) });
        return () => { creaST = null; };
      });
      mm.add('(max-width:900px), (max-height:539px)', () => {
        creaTl({ trigger: '.crea-frames', start: 'top 62%', end: 'top 8%', scrub: .5, onUpdate: s => stepFrom(s.progress) });
        return () => { creaST = null; };
      });

      /* --- headings + copy blocks --- */
      $$('h2[data-lines]').forEach(h => gsap.from($$('.ln > span', h), { yPercent: 112, rotation: 3, transformOrigin: '0 100%', duration: 1.2, ease: 'expo.out', stagger: .13, scrollTrigger: { trigger: h, start: 'top 88%' } }));
      ['.crea-copy', '.occ-head', '.fr-copy', '.bt-copy', '.lv-copy', '.ct-copy'].forEach(s => {
        const el = $(s), kids = [...el.children].filter(k => k.tagName !== 'H2' && !k.classList.contains('gold-rule'));
        gsap.from(kids, { autoAlpha: 0, y: 26, duration: 1, ease: 'power3.out', stagger: .08, scrollTrigger: { trigger: el, start: 'top 80%' } });
        const rule = $('.gold-rule', el); if (rule) gsap.from(rule, { scaleX: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: rule, start: 'top 90%' } });
      });

      /* --- occasions: rows slide against each other, the rose turns --- */
      $$('.occ-list li').forEach((li, i) => {
        gsap.fromTo($('strong', li), { xPercent: i % 2 ? 22 : -14, autoAlpha: .15 }, { xPercent: 0, autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: li, start: 'top 98%', end: 'top 55%', scrub: .6 } });
        gsap.from($$('.occ-n, em', li), { autoAlpha: 0, y: 14, duration: .9, scrollTrigger: { trigger: li, start: 'top 82%' } });
      });
      gsap.fromTo('.occ-rose', { rotation: -70, yPercent: -30 }, { rotation: 110, yPercent: 160, ease: 'none', scrollTrigger: { trigger: '.occasions', start: 'top bottom', end: 'bottom top', scrub: .8 } });
      gsap.fromTo('.diamond', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.gifts', start: 'top 85%', end: 'top 35%', scrub: .5 } });
      gsap.from('.chips li', { autoAlpha: 0, y: 20, scale: .8, duration: .7, ease: 'back.out(2)', stagger: .07, scrollTrigger: { trigger: '.chips', start: 'top 90%' } });
      mm.add('(hover:hover) and (min-width:901px)', () => {
        const cur = $('.occ-cursor'), img = $('img', cur);
        gsap.set(cur, { xPercent: -50, yPercent: -50, scale: .4 });
        const qx = gsap.quickTo(cur, 'x', { duration: .5, ease: 'power3' }), qy = gsap.quickTo(cur, 'y', { duration: .5, ease: 'power3' }), qr = gsap.quickTo(cur, 'rotation', { duration: .8, ease: 'power3' });
        let px = 0;
        const mv = e => { qx(e.clientX + 110); qy(e.clientY - 20); qr((e.clientX - px) * 1.4); px = e.clientX; };
        const list = $('.occ-list');
        const over = e => { const li = e.target.closest('li'); if (!li) return; img.src = `assets/images/hero/${li.dataset.flower}.webp`; gsap.to(cur, { autoAlpha: 1, scale: 1, duration: .5, ease: 'back.out(1.8)' }); };
        const out = () => gsap.to(cur, { autoAlpha: 0, scale: .4, duration: .35 });
        list.addEventListener('pointermove', mv); list.addEventListener('pointerover', over); list.addEventListener('pointerleave', out);
        return () => { list.removeEventListener('pointermove', mv); list.removeEventListener('pointerover', over); list.removeEventListener('pointerleave', out); };
      });

      /* --- vitrine: the glass doors slide open --- */
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.vitrine', start: 'top 72%', end: 'top 12%', scrub: .7 } })
        .to('.door-l', { xPercent: -101 }, 0).to('.door-r', { xPercent: 101 }, 0)
        .fromTo('.vitrine img', { xPercent: 2.5 }, { xPercent: 0 }, 0);

      /* --- boutique: arch opens, outlined words drift --- */
      gsap.fromTo('.bigword', { xPercent: 2 }, { xPercent: -42, ease: 'none', scrollTrigger: { trigger: '.boutique', start: 'top bottom', end: 'bottom top', scrub: .6 } });
      gsap.fromTo('.arch', { clipPath: 'inset(46% 22% 0% 22% round 999px 999px 0px 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 0px 0px)', ease: 'none', scrollTrigger: { trigger: '.bt-photo', start: 'top 92%', end: 'top 30%', scrub: .6 } });
      gsap.fromTo('.arch img', { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.bt-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.bt-flower', { rotation: -90, yPercent: 60, scale: .6 }, { rotation: 20, yPercent: -20, scale: 1, ease: 'none', scrollTrigger: { trigger: '.bt-photo', start: 'top 80%', end: 'bottom 20%', scrub: .8 } });
      gsap.fromTo('.bt-petal', { yPercent: -120, rotation: -40 }, { yPercent: 260, rotation: 120, ease: 'none', scrollTrigger: { trigger: '.bt-photo', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      gsap.from('.bt-points li', { autoAlpha: 0, y: 30, duration: .9, ease: 'power3.out', stagger: .12, scrollTrigger: { trigger: '.bt-points', start: 'top 88%' } });

      /* --- livraison: the radius grows, the counter follows --- */
      const km = $('.radar-km b'), kmv = { v: 0 };
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.radar', start: 'top 85%', end: 'top 25%', scrub: .6 } })
        .from('.ring', { scale: 0, autoAlpha: 0, stagger: { each: .18, from: 'end' }, duration: 1 }, 0)
        .fromTo(kmv, { v: 0 }, { v: 20, duration: 1.5, onUpdate: () => km.textContent = Math.round(kmv.v) }, 0)
        .from('.radar-city', { autoAlpha: 0, duration: .4 }, 0);
      gsap.from('.lv-cards article', { autoAlpha: 0, xPercent: 12, duration: 1, ease: 'power3.out', stagger: .14, scrollTrigger: { trigger: '.lv-cards', start: 'top 86%' } });

      /* --- contact: the shopfront rises behind its own frame --- */
      gsap.fromTo('.ct-photo', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.ct-inner', start: 'top 80%', end: 'top 20%', scrub: .6 } });
      gsap.fromTo('.ct-photo img', { yPercent: 12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.ct-inner', start: 'top 80%', end: 'top 20%', scrub: .6 } });
      gsap.from('.hours tr', { autoAlpha: 0, x: 24, duration: .7, ease: 'power3.out', stagger: .06, scrollTrigger: { trigger: '.hours', start: 'top 84%' } });
      gsap.from('.hours .eyebrow, .hours-note', { autoAlpha: 0, duration: 1, scrollTrigger: { trigger: '.hours', start: 'top 84%' } });

      /* --- footer wordmark --- */
      gsap.from('.wordmark .ch', { yPercent: 120, rotation: 10, ease: 'none', stagger: .04, scrollTrigger: { trigger: '.footer', start: 'top 96%', end: 'top 45%', scrub: .7 } });
      gsap.from('.footer-social a', { scale: 0, rotation: -90, duration: .8, ease: 'back.out(2)', stagger: .08, scrollTrigger: { trigger: '.footer-inner', start: 'top 94%' } });

      return () => ScrollTrigger.removeEventListener('refreshInit', measure);
    });
    window.__lpcReady = true;
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  function stopMotion() {
    if (ctx) { ctx.revert(); ctx = null; }
    creaST = null;
    root.classList.remove('motion', 'intro');
    step = -1; setStep(0);
  }

  const setToggle = paused => { mToggle.setAttribute('aria-pressed', paused); mToggle.textContent = paused ? 'Relancer l’animation' : 'Mettre l’animation en pause'; };
  mToggle.addEventListener('click', () => { if (ctx) { stopMotion(); setToggle(true); } else { startMotion(); setToggle(false); } });
  reduce.addEventListener('change', () => { if (reduce.matches) { stopMotion(); setToggle(true); } else { startMotion(); setToggle(false); } });

  if (reduce.matches) setToggle(true); else startMotion();
})();

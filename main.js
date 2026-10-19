(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- loader: procedural lightning + counter ---------- */
  const loader = $('#loader'), cv = $('#loaderArc'), ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const fit = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; };
  fit(); addEventListener('resize', fit);
  function bolt(x1, y1, x2, y2, disp, pts) {
    if (disp < 3) { pts.push([x2, y2]); return; }
    const mx = (x1 + x2) / 2 + (Math.random() - .5) * disp, my = (y1 + y2) / 2 + (Math.random() - .5) * disp;
    bolt(x1, y1, mx, my, disp / 2, pts); bolt(mx, my, x2, y2, disp / 2, pts);
  }
  function drawBolt(x1, y1, x2, y2, w, a) {
    const pts = [[x1, y1]]; bolt(x1, y1, x2, y2, Math.hypot(x2 - x1, y2 - y1) * .35, pts);
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (const p of pts) ctx.lineTo(p[0], p[1]);
    ctx.strokeStyle = `rgba(212,255,58,${a})`; ctx.lineWidth = w * dpr; ctx.shadowBlur = 24 * dpr; ctx.shadowColor = '#d4ff3a'; ctx.stroke();
  }
  let n = 0, t0 = performance.now(), dur = reduce ? 300 : 1900, running = true;
  const countEl = $('#loaderCount');
  function loop(now) {
    if (!running) return;
    const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
    countEl.textContent = String(Math.round(e * 100)).padStart(3, '0');
    ctx.fillStyle = 'rgba(14,14,12,.35)'; ctx.fillRect(0, 0, cv.width, cv.height);
    const cx = cv.width / 2, cy = cv.height / 2, k = 1 + e * 4;
    for (let i = 0; i < k; i++) {
      if (Math.random() < .55) {
        const ang = Math.random() * Math.PI * 2, R = (Math.min(cv.width, cv.height) * (.25 + Math.random() * .5));
        drawBolt(cx, cy, cx + Math.cos(ang) * R * 1.6, cy + Math.sin(ang) * R, .6 + Math.random() * 1.6, .25 + e * .6);
      }
    }
    if (p < 1) requestAnimationFrame(loop); else finish();
  }
  function finish() {
    loader.classList.add('split');
    setTimeout(() => { loader.classList.add('done'); document.documentElement.classList.add('ready'); document.body.classList.add('ready'); }, 520);
    setTimeout(() => { running = false; loader.remove(); }, 1700);
  }
  const go = () => requestAnimationFrame(loop);
  document.fonts ? document.fonts.ready.then(go) : go();
  setTimeout(() => { if (running && !loader.classList.contains('split')) finish(); }, 5000);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ lerp: .09, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
  }
  $$('[data-scroll]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); const el = id && $(id); if (!el) return;
    e.preventDefault(); lenis ? lenis.scrollTo(el, { offset: id === '#top' ? 0 : -10, duration: 1.6 }) : el.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------- clock (Nepal, UTC+5:45) ---------- */
  const clock = $('#clock');
  const tick = () => { clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()); };
  tick(); setInterval(tick, 1000);

  /* ---------- reveal + counters ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; const el = en.target; el.classList.add('in'); io.unobserve(el);
    if (el.dataset.count) countUp(el);
  }), { threshold: .18, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .reveal-media, .file, .prep__ring, [data-count]').forEach(el => io.observe(el));
  function countUp(el) {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), d = 1600, s = performance.now();
    const f = now => { const p = Math.min(1, (now - s) / d), e = 1 - Math.pow(1 - p, 4); const v = to * e;
      el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US'); if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }

  /* ---------- statement: words light up as you read ---------- */
  const st = $('[data-words]');
  st.innerHTML = st.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  const words = $$('.w', st);

  /* ---------- sticky card stack ---------- */
  const cards = $$('.stack .card');

  function onScroll() {
    const vh = innerHeight;
    // words
    const r = st.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * .82 - r.top) / (r.height + vh * .35)));
    const lit = Math.floor(p * words.length * 1.05);
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));
    // cards
    if (innerWidth > 900) cards.forEach((c, i) => {
      const next = cards[i + 1]; if (!next) return;
      const nr = next.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, 1 - (nr.top - 84) / (vh * .9)));
      c.style.transform = `scale(${1 - k * .06})`; c.style.filter = `brightness(${1 - k * .35})`;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (lenis) lenis.on('scroll', onScroll);

  /* ---------- cursor ---------- */
  const cur = $('#cursor'), lab = $('#cursorLabel');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  (function cl() { cx += (mx - cx) * .2; cy += (my - cy) * .2; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(cl); })();
  $$('[data-cursor]').forEach(el => {
    el.addEventListener('pointerenter', () => { lab.textContent = el.dataset.cursor; cur.classList.add('big'); });
    el.addEventListener('pointerleave', () => cur.classList.remove('big'));
  });
  const darkZones = $$('.dark, .card--dark, .card--ink, .marquee');
  addEventListener('pointermove', () => {
    const el = document.elementFromPoint(mx, my);
    cur.classList.toggle('on-dark', !!(el && el.closest('.dark, .card--dark, .card--ink, .marquee, .card__media--lock, .tool__viz--tube, .tool__viz--pulse')));
  }, { passive: true });

  /* ---------- focus lock timer ---------- */
  const lt = $('#lockTime'); let secs = 47 * 60 + 12;
  setInterval(() => { secs = secs > 0 ? secs - 1 : 50 * 60; lt.textContent = `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`; }, 1000);

  /* ---------- logic gate toy ---------- */
  const g = { a: 0, b: 0, op: 'AND' };
  const ops = { AND: (a, b) => a & b, OR: (a, b) => a | b, XOR: (a, b) => a ^ b, NAND: (a, b) => 1 - (a & b) };
  const led = $('#led'), wa = $('#wa'), wb = $('#wb'), wo = $('#wo'), gname = $('#gname');
  function render() {
    const o = ops[g.op](g.a, g.b);
    wa.classList.toggle('hot', !!g.a); wb.classList.toggle('hot', !!g.b); wo.classList.toggle('hot', !!o);
    led.classList.toggle('on', !!o); $('b', led).textContent = o; gname.textContent = g.op;
  }
  $$('.sw').forEach(b => b.addEventListener('click', () => { const k = b.dataset.in; g[k] ^= 1; b.setAttribute('aria-pressed', !!g[k]); $('b', b).textContent = g[k]; render(); }));
  $$('.gates__ops button').forEach(b => b.addEventListener('click', () => { $$('.gates__ops button').forEach(x => x.classList.remove('on')); b.classList.add('on'); g.op = b.dataset.op; render(); }));
  render();
})();

/* ===== v2 ===== */
(() => {
  const $ = s => document.querySelector(s);
  // scroll progress
  const bar = $('#progress');
  const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
  addEventListener('scroll', prog, { passive: true }); prog();

  // rotating proof in hero
  const items = ['payments with zero bars of signal', 'a mod system for a game that had none', 'a lock even Alt+F4 can\'t break', 'a scam detector that reads contracts out loud', 'a Tesla coil out of a pipe and some wire'];
  const rotIn = $('#rot .rot__in'); let ri = 0;
  setInterval(() => {
    rotIn.classList.add('out');
    setTimeout(() => { ri = (ri + 1) % items.length; rotIn.textContent = items[ri]; rotIn.classList.remove('out'); rotIn.classList.add('pre'); rotIn.offsetWidth; rotIn.classList.remove('pre'); }, 450);
  }, 2600);

  // NexPay hold-to-pay demo
  const pay = $('#pay'), btn = $('#payBtn'), fill = $('#payFill'), txt = $('#payTxt'), out = $('#payOut');
  let holding = false, p = 0, raf, done = false;
  const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(b => b.toString(16).padStart(2, '0')).join('');
  function step() {
    if (done) return;
    p += holding ? 0.022 : -0.05; p = Math.max(0, Math.min(1, p));
    fill.style.transform = `scaleX(${p})`;
    if (holding && p > 0) out.textContent = p < .4 ? 'signing note with ECDSA P-256\u2026' : p < .8 ? 'handing over by Bluetooth\u2026' : 'receiver verifying, offline\u2026';
    if (p >= 1) { done = true; pay.classList.add('done'); txt.textContent = 'Paid. Rs 250 \u2713';
      out.innerHTML = `note <b>#${hex(4)}\u2026${hex(2)}</b> signed and delivered. it settles once someone gets signal. <u style="cursor:pointer" id="payAgain">again</u>`;
      $('#payAgain').onclick = () => { done = false; p = 0; pay.classList.remove('done'); txt.textContent = 'Hold to pay Rs 250, offline'; out.textContent = 'try it. there\'s no internet in this card.'; fill.style.transform = 'scaleX(0)'; };
      if (navigator.vibrate) navigator.vibrate(40); return; }
    if (p > 0 || holding) raf = requestAnimationFrame(step); else if (!done) out.textContent = 'try it. there\'s no internet in this card.';
  }
  const start = e => { e.preventDefault(); if (done) return; holding = true; cancelAnimationFrame(raf); raf = requestAnimationFrame(step); };
  const stop = () => { holding = false; };
  btn.addEventListener('pointerdown', start); addEventListener('pointerup', stop); btn.addEventListener('pointerleave', stop);
  btn.addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter') { if (!holding) start(e); } });
  btn.addEventListener('keyup', stop);

  // Focus Lock: try to escape
  const lock = document.querySelector('.lock'), nope = $('#lockNope');
  const lines = ['Nice try.', 'Alt+F4 is on the blocklist too.', 'Restarting just brings it back.', 'Task Manager? Disabled.', 'You signed this. Remember?', 'OK fine: beat a dual N-back first.'];
  let li = 0;
  $('#lockEsc').addEventListener('click', () => { lock.classList.remove('shake'); lock.offsetWidth; lock.classList.add('shake'); nope.textContent = lines[li++ % lines.length]; });

  // easter egg: type "limitless"
  const toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast);
  const say = m => { toast.textContent = m; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(() => toast.classList.remove('on'), 2600); };
  let buf = '';
  addEventListener('keydown', e => {
    if (e.key.length !== 1) return; buf = (buf + e.key.toLowerCase()).slice(-9);
    if (buf === 'limitless') { document.body.classList.remove('overdrive'); document.body.offsetWidth; document.body.classList.add('overdrive'); window.dispatchEvent(new CustomEvent('overdrive')); say('\u26a1 coil overdrive. you found it.'); }
  });

  // tab title when you leave
  const t0 = document.title;
  document.addEventListener('visibilitychange', () => { document.title = document.hidden ? '\u26a1 the coil is still on' : t0; });

  // devtools hello
  console.log('%cLIMITLESS', 'font:900 48px system-ui;color:#d4ff3a;background:#0e0e0c;padding:6px 14px');
  console.log('%cYou opened the console. Respect. No framework here, everything is hand-written.\nIf you\'re hiring or building something hard: limitlessneverdies369@gmail.com', 'font:14px system-ui');
})();

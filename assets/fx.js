/* slettvold.org atmosphere, after Oni Dojo's "Onibi" look: slow red glows, drifting glowing kanji, rising embers,
   a little parallax, glowing cards that follow the pointer, and sections that fade in. Light on phones, paused in
   background tabs, and fully still for people who prefer reduced motion. No libraries, no tracking. */
(() => {
  // phone menu and language switch (no inline handlers: the Content-Security-Policy only allows scripts from files)
  const menu = document.querySelector('header .menu');
  if (menu) menu.addEventListener('click', () => menu.setAttribute('aria-expanded', String(document.body.classList.toggle('nav-open'))));
  document.querySelectorAll('[data-set-lang]').forEach((a) => a.addEventListener('click', () => { try { localStorage.setItem('lang', a.dataset.setLang); } catch (e) {} }));

  // offline support and instant repeat visits (assets → /sw.js); pages are always fetched fresh when online
  if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));

  // for the curious ones with DevTools open
  try {
    console.log('%c鬼 slettvold.org%c\n[SYSTEM] mainframe accessed… welcome, visitor. 🕶️\n[SYSTEM] no trackers, no cookies, one small secret.\n[HINT]   view the page source. Found the flag? Tell me: https://slettvold.org/contact/',
      'font: 800 20px system-ui; color: #ff3147; text-shadow: 0 0 8px rgba(255,49,71,.6)', 'font: 13px ui-monospace, monospace; color: #39ff7a; background: #021006; padding: 6px 10px; line-height: 1.6');
  } catch (e) {}

  // type "matrix" anywhere (outside a text field) for terminal mode; type it again to leave
  const term = (on) => { document.documentElement.classList.toggle('term', on); try { sessionStorage.setItem('term', on ? '1' : ''); } catch (e) {}
    document.querySelectorAll('.term-note').forEach((n) => n.remove());
    if (on) { const n = document.createElement('div'); n.className = 'term-note'; n.textContent = '> terminal mode. type "matrix" again to exit'; document.body.appendChild(n); setTimeout(() => n.remove(), 4000); } };
  try { if (sessionStorage.getItem('term') === '1') document.documentElement.classList.add('term'); } catch (e) {}
  let typed = '';
  addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || /^(INPUT|TEXTAREA|SELECT)$/.test((e.target && e.target.tagName) || '')) return;
    if (e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-6);
    if (typed === 'matrix') { term(!document.documentElement.classList.contains('term')); typed = ''; }
  });
  // five quick clicks on the portrait: a little spin
  const face = document.querySelector('.portrait');
  if (face) { let n = 0, t = 0; face.addEventListener('click', () => { const now = Date.now(); n = now - t < 600 ? n + 1 : 1; t = now;
    if (n >= 5) { n = 0; face.classList.remove('spin'); void face.offsetWidth; face.classList.add('spin'); } }); }

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.classList.contains('calm');
  const phone = matchMedia('(max-width: 760px)').matches;
  const rows = ['日本　夢　道　挑戦　努力　鬼火　未来', '一歩　守　紅　学　旅　鬼　言葉', '夢　鬼　道場　未来　日本　努力　守'];
  const fx = document.createElement('div'); fx.id = 'fx'; fx.setAttribute('aria-hidden', 'true');
  fx.innerHTML = '<div class="glow g1"></div><div class="glow g2"></div><div class="glow g3"></div>'
    + '<div class="kanji">' + rows.map((r, i) => `<div class="krow r${i}">${r}　${r}　${r}</div>`).join('') + '</div>'
    + '<div class="hot">' + ['鬼', '夢', '道', '紅'].map((k, i) => `<span class="h${i}">${k}</span>`).join('') + '</div>'
    + '<canvas></canvas><div class="vignette"></div><div class="grain"></div>';
  document.body.prepend(fx);
  document.documentElement.classList.add('fx-on');

  // sections and cards fade up as they scroll into view
  const io = 'IntersectionObserver' in window && !still ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
  document.querySelectorAll('main h2, main .card, main .tl li, main .note, main .jabox, main .proj').forEach((el) => { if (io) { el.classList.add('rise'); io.observe(el); } });

  // cards glow where the pointer is
  document.querySelectorAll('.card, .btn').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
  // numbers count up the first time they come into view
  document.querySelectorAll('[data-count]').forEach((el) => {
    const fmt = new Intl.NumberFormat(document.documentElement.lang === 'ja' ? 'ja-JP' : 'en-US');
    if (still || !('IntersectionObserver' in window)) return;
    el.textContent = '0';
    const ob = new IntersectionObserver((es) => { if (!es[0].isIntersecting) return; ob.disconnect(); const t0 = performance.now();
      const step = (now) => { const p = Math.min(1, (now - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt.format(Math.round(+el.dataset.count * e)); if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step); });
    ob.observe(el);
  });
  if (still) return;

  // parallax: the glows and kanji lean gently away from the pointer and drift with scrolling
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener('pointermove', (e) => { tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5); }, { passive: true });
  const kan = fx.querySelector('.kanji'), glows = fx.querySelectorAll('.glow');

  // embers on a canvas (fewer on phones), 30 fps is plenty for slow sparks
  const cv = fx.querySelector('canvas'), ctx = cv.getContext('2d');
  const size = () => { const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * d; cv.height = innerHeight * d; };
  size(); addEventListener('resize', size);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const embers = Array.from({ length: phone ? 18 : 42 }, () => ({ x: rnd(), period: 9 + rnd() * 18, off: rnd() * 60, drift: -80 + rnd() * 160, size: .6 + rnd() * .9, hue: rnd() }));
  let last = 0; const t0 = performance.now();
  const frame = (now) => {
    requestAnimationFrame(frame);
    if (document.hidden || now - last < 33) return; last = now;
    cx += (tx - cx) * .05; cy += (ty - cy) * .05;
    const sy = scrollY;
    kan.style.transform = `translate3d(${-cx * 24}px, ${-cy * 16 - sy * .08}px, 0)`;
    glows.forEach((g, i) => { g.style.translate = `${cx * (30 + i * 20)}px ${cy * (20 + i * 14) - sy * (.04 + i * .03)}px`; });
    const sec = (now - t0) / 1000, W = cv.width, H = cv.height, d = cv.width / innerWidth;
    ctx.clearRect(0, 0, W, H);
    for (const e of embers) {
      const p = ((sec + e.off) % e.period) / e.period;
      const a = p < .12 ? p / .12 : p < .75 ? 1 - .55 * (p - .12) / .63 : .45 * (1 - (p - .75) / .25);
      const sc = e.size * (.7 + .6 * p);
      const x = e.x * W + e.drift * d * p + Math.sin(sec * .8 + e.off) * 6 * d - cx * 20 * d, y = H + 10 * d - H * 1.1 * p;
      const g = e.hue > .7 ? '255,176,96' : '255,60,60';
      ctx.fillStyle = `rgba(${g},${a * .16})`; ctx.beginPath(); ctx.arc(x, y, 9 * d * sc, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(${g},${a * .85})`; ctx.beginPath(); ctx.arc(x, y, 1.6 * d * sc, 0, 7); ctx.fill();
    }
  };
  requestAnimationFrame(frame);
})();

/* The entrance on slettvold.org: a neon torii gate where visitors choose English or 日本語 and walk through.
   Shown once per browser session on the home pages; the choice is remembered (localStorage "lang"), and choosing
   the other language goes straight to that version. Without JavaScript the page simply shows as normal. */
(() => {
  // a page can use its own words and session key through data attributes on <body>: data-gate-key, data-gate-kicker,
  // data-gate-name, data-gate-jp, data-gate-tag (the Oni Dojo pages do)
  const D = document.body.dataset, key = D.gateKey || 'entered';
  let seen = false, saved = null;
  try { seen = sessionStorage.getItem(key) === '1'; saved = localStorage.getItem('lang'); } catch (e) {}
  if (seen) return;
  const here = document.body.dataset.lang, other = document.body.dataset.other;
  const guess = saved || ((navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : here);
  const gate = document.createElement('div');
  gate.id = 'gate';
  gate.setAttribute('role', 'dialog'); gate.setAttribute('aria-label', 'Choose a language');
  gate.innerHTML = `
    <div class="gate-glow"></div>
    <svg class="torii" viewBox="0 0 400 300" aria-hidden="true">
      <defs><filter id="neon" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <g filter="url(#neon)" fill="rgba(255,49,71,.08)" stroke="#ff3147" stroke-width="3" stroke-linejoin="round">
        <path class="d d1" d="M14 66 Q200 34 386 66 L378 84 Q200 58 22 84 Z"/>
        <path class="d d2" d="M48 98 H352 V110 H48 Z"/>
        <path class="d d3" d="M70 140 H330 V152 H70 Z"/>
        <path class="d d4" d="M100 84 H118 V292 H100 Z"/>
        <path class="d d5" d="M282 84 H300 V292 H282 Z"/>
        <path class="d d6" d="M192 110 H208 V140 H192 Z"/>
      </g>
    </svg>
    <div class="gate-text">
      <div class="gate-kicker">${D.gateKicker || 'slettvold.org'}</div>
      <div class="gate-name">${D.gateName || 'Tommy André Slettvold'}</div>
      <div class="gate-jp">${D.gateJp || 'トミー・アンドレ・スレットボルド'}</div>
      <div class="gate-tag">${D.gateTag || 'Norway → 日本 · IT security · apps · Japanese'}</div>
      <div class="gate-choose">
        <button data-lang="en" class="${guess === 'en' ? 'pref' : ''}"><b>Enter</b><span>English</span></button>
        <button data-lang="ja" class="${guess === 'ja' ? 'pref' : ''}"><b>入る</b><span>日本語</span></button>
      </div>
      <div class="gate-hint">Choose a language · 言語を選んでください</div>
    </div>`;
  document.body.appendChild(gate);
  document.documentElement.classList.add('gate-open');
  requestAnimationFrame(() => gate.classList.add('show'));

  const enter = (lang) => {
    try { sessionStorage.setItem(key, '1'); localStorage.setItem('lang', lang); } catch (e) {}
    if (lang !== here && other) { gate.classList.add('leave'); setTimeout(() => { location.href = other; }, 450); return; }
    gate.classList.add('through');
    setTimeout(() => document.documentElement.classList.remove('gate-open'), 350);
    setTimeout(() => gate.remove(), 1200);
  };
  gate.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => enter(b.dataset.lang)));
  const pref = gate.querySelector('button.pref') || gate.querySelector('button'); setTimeout(() => pref.focus({ preventScroll: true }), 900);
  addEventListener('keydown', function k(e) {
    if (!document.getElementById('gate')) return removeEventListener('keydown', k);
    if (e.key === 'Escape') enter(here);
    if (e.key.toLowerCase() === 'e') enter('en');
    if (e.key.toLowerCase() === 'j') enter('ja');
  });
})();

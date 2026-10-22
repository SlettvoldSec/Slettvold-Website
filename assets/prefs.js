/* Reading settings for slettvold.org: text size, a readable font (Atkinson Hyperlegible, made for low-vision readers)
   and a calm mode without moving effects. Saved in this browser only (localStorage "prefs"); a small inline script in
   <head> applies them before the page paints, so nothing jumps. No cookies, nothing sent anywhere. */
(() => {
  const html = document.documentElement, ja = document.body.dataset.lang === 'ja';
  const T = ja ? { open: '表示設定', title: '表示設定', size: '文字の大きさ', font: '読みやすいフォント', calm: 'アニメーションを止める', reset: '元に戻す', on: 'オン', off: 'オフ', close: '閉じる' }
               : { open: 'Display settings', title: 'Display settings', size: 'Text size', font: 'Readable font', calm: 'Stop animations', reset: 'Reset', on: 'On', off: 'Off', close: 'Close' };
  let p = {}; try { p = JSON.parse(localStorage.getItem('prefs') || '{}'); } catch (e) {}
  const SIZES = ['s', '', 'l', 'xl'];
  const apply = () => {
    if (p.size) html.dataset.size = p.size; else delete html.dataset.size;
    if (p.font) html.dataset.font = p.font; else delete html.dataset.font;
    html.classList.toggle('calm', !!p.calm);
    if (p.calm) document.querySelectorAll('.rise').forEach((e) => e.classList.add('in'));
    try { localStorage.setItem('prefs', JSON.stringify(p)); } catch (e) {}
    sync();
  };
  const btn = document.createElement('button');
  btn.className = 'prefs-btn'; btn.type = 'button'; btn.setAttribute('aria-label', T.open); btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'prefs'); btn.innerHTML = '<span aria-hidden="true">Aa</span>';
  const panel = document.createElement('div');
  panel.id = 'prefs'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', T.title); panel.hidden = true;
  panel.innerHTML = `
    <div class="pr-head"><b>${T.title}</b><button type="button" class="pr-x" aria-label="${T.close}">×</button></div>
    <div class="pr-row"><span id="pr-size-l">${T.size}</span>
      <div class="pr-seg" role="group" aria-labelledby="pr-size-l">
        <button type="button" data-size="s" aria-label="A−">A−</button><button type="button" data-size="" aria-label="A">A</button>
        <button type="button" data-size="l" aria-label="A+">A+</button><button type="button" data-size="xl" aria-label="A++">A++</button></div></div>
    <div class="pr-row"><span id="pr-font-l">${T.font}</span><button type="button" class="pr-sw" data-k="font" role="switch" aria-labelledby="pr-font-l"></button></div>
    <div class="pr-row"><span id="pr-calm-l">${T.calm}</span><button type="button" class="pr-sw" data-k="calm" role="switch" aria-labelledby="pr-calm-l"></button></div>
    <button type="button" class="pr-reset">${T.reset}</button>`;
  function sync() {
    panel.querySelectorAll('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String((p.size || '') === b.dataset.size)));
    panel.querySelectorAll('.pr-sw').forEach((b) => { const on = b.dataset.k === 'font' ? p.font === 'readable' : !!p.calm; b.setAttribute('aria-checked', String(on)); b.textContent = on ? T.on : T.off; });
  }
  const nav = document.querySelector('header.top .wrap');
  if (!nav) return;
  nav.insertBefore(btn, nav.querySelector('.menu'));
  document.body.appendChild(panel);
  const toggle = (open) => { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); if (open) panel.querySelector('button[data-size]').focus(); };
  btn.addEventListener('click', () => toggle(panel.hidden));
  panel.querySelector('.pr-x').addEventListener('click', () => { toggle(false); btn.focus(); });
  panel.querySelectorAll('[data-size]').forEach((b) => b.addEventListener('click', () => { p.size = b.dataset.size; apply(); }));
  panel.querySelectorAll('.pr-sw').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.k === 'font') p.font = p.font ? '' : 'readable'; else p.calm = !p.calm; apply(); }));
  panel.querySelector('.pr-reset').addEventListener('click', () => { p = {}; apply(); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { toggle(false); btn.focus(); } });
  document.addEventListener('click', (e) => { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) toggle(false); });
  // keyboard shortcut: Ctrl/⌘ + Alt + plus/minus changes the text size
  addEventListener('keydown', (e) => {
    if (!(e.altKey && (e.ctrlKey || e.metaKey))) return;
    const i = SIZES.indexOf(p.size || '');
    if (e.key === '+' || e.key === '=') { p.size = SIZES[Math.min(3, i + 1)]; apply(); e.preventDefault(); }
    if (e.key === '-') { p.size = SIZES[Math.max(0, i - 1)]; apply(); e.preventDefault(); }
  });
  sync();
})();

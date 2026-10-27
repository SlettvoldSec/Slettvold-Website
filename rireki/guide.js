/* Static Rireki Studio guide pages: the "copy email" button. Nothing is sent anywhere. */
(() => {
  const b = document.getElementById('copymail'), m = document.getElementById('mailtpl');
  if (!b || !m) return;
  const label = b.textContent;
  b.addEventListener('click', () => {
    try { navigator.clipboard.writeText(m.textContent).then(() => { b.textContent = document.documentElement.lang === 'ja' ? 'コピーしました' : 'Copied'; setTimeout(() => { b.textContent = label; }, 2000); }); } catch (e) {}
  });
})();

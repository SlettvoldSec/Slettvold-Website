// "Try one" on the Oni Dojo page: the same typed-answer step as in the app, in miniature.
// Accepts kana, katakana, kanji or romaji; the first miss gets a hint and one more try, like in a lesson.
(() => {
  const box = document.getElementById('demo'); if (!box) return;
  const inp = box.querySelector('input'), out = box.querySelector('.demo-out'), blank = box.querySelector('.demo-blank');
  const play = box.querySelector('.demo-play'), btn = box.querySelector('.demo-check');
  const audio = new Audio(box.dataset.audio);
  const ok = (v) => { v = v.trim().toLowerCase().replace(/\s+/g, ''); return ['どこ', 'ドコ', '何処', 'doko'].includes(v); };
  let tries = 0, done = false;
  const say = (cls, html) => { out.className = 'demo-out ' + cls; out.innerHTML = html; };
  const check = () => {
    if (done || !inp.value.trim()) return;
    if (ok(inp.value)) {
      done = true; blank.textContent = 'どこ'; blank.classList.add('ok'); inp.disabled = true; audio.currentTime = 0; audio.play().catch(() => {});
      say('good', tries ? '<b>そう！</b> You fixed it yourself — that is how it sticks. <span lang="ja">どこ</span> = where.' : '<b>正解！</b> <span lang="ja">どこ</span> (doko) = where. Romaji, kana or kanji: all count.');
      return;
    }
    tries++;
    if (tries === 1) { say('hint', '💡 Not quite. The English says <i>where</i>. Which question word means "where"? Listen again and try once more.'); inp.select(); return; }
    done = true; inp.disabled = true; blank.textContent = 'どこ'; blank.classList.add('no');
    say('bad', 'The answer is <b lang="ja">どこ</b> (doko), "where". In the app this question would come back at the end of the lesson.');
  };
  play.addEventListener('click', () => { audio.currentTime = 0; audio.play().catch(() => {}); });
  btn.addEventListener('click', check);
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); check(); } });
})();

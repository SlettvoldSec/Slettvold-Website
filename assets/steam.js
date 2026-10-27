/* Hobbies page: live Steam numbers. /steam/steam.json is refreshed once a day by a GitHub Action in the website's
   repository (.github/steam.mjs); the images are copied there too, so visitors never connect to Steam. If the file
   is missing, the numbers written in the page stay as they are. */
(() => {
  const box = document.getElementById('steam-live'); if (!box) return;
  const ja = document.documentElement.lang === 'ja';
  fetch('/steam/steam.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (!d || !d.games) return;
    const fmt = new Intl.NumberFormat(ja ? 'ja-JP' : 'en-US');
    document.querySelectorAll('[data-steam]').forEach((el) => {
      const v = d[el.dataset.steam]; if (v == null) return;
      el.dataset.count = v; el.textContent = fmt.format(v);   // fx.js counts up to data-count when it scrolls into view
    });
    // favourites: add the hours played when Steam has them
    const hrs = {}; [...(d.mostPlayed || []), ...(d.recent || []), ...(d.favs || [])].forEach((g) => { hrs[g.appid] = g.hours; });
    document.querySelectorAll('.fav[data-appid]').forEach((f) => {
      const h = hrs[f.dataset.appid]; if (!h) return;
      const t = document.createElement('i'); t.className = 'fav-h'; t.textContent = ja ? `${fmt.format(h)}時間` : `${fmt.format(h)} h`; f.appendChild(t);
    });
    more(d, ja, fmt);
    const list = d.recent && d.recent.length ? d.recent : d.mostPlayed || [];
    if (!list.length) return;
    const card = (g) => {
      const a = document.createElement('a'); a.className = 'sgame'; a.href = `https://store.steampowered.com/app/${g.appid}/`; a.rel = 'noopener';
      if (g.img) { const i = document.createElement('img'); i.src = g.img; i.alt = ''; i.width = 231; i.height = 87; i.loading = 'lazy'; a.appendChild(i); }
      const b = document.createElement('b'); b.textContent = g.name; a.appendChild(b);
      const s = document.createElement('span');
      s.textContent = g.hours2w != null ? (ja ? `過去2週間 ${g.hours2w}時間` + (g.hours >= 1 ? ` · 合計 ${fmt.format(g.hours)}時間` : '') : `${g.hours2w} h in the last 2 weeks` + (g.hours >= 1 ? ` · ${fmt.format(g.hours)} h total` : ''))
                                        : (ja ? `合計 ${fmt.format(g.hours)}時間` : `${fmt.format(g.hours)} h played`);
      a.appendChild(s); return a;
    };
    box.querySelector('h3').textContent = d.recent && d.recent.length ? (ja ? '最近遊んでいるゲーム' : 'Playing lately') : (ja ? 'いちばん遊んだゲーム' : 'Most played');
    const grid = box.querySelector('.sgames'); list.forEach((g) => grid.appendChild(card(g)));
    const when = new Date(d.updated);
    box.querySelector('.supd').textContent = (ja ? 'Steamから自動更新 · ' : 'Updated automatically from Steam · ')
      + when.toLocaleDateString(ja ? 'ja-JP' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
      + (d.hours ? (ja ? ` · 総プレイ時間 ${fmt.format(d.hours)}時間` : ` · ${fmt.format(d.hours)} hours played in total`) : '');
    box.hidden = false;
  }).catch(() => {});

  // level progress, achievements, 100 % games, games in Japanese, rarest achievements
  function more(d, ja, fmt) {
    const box = document.getElementById('steam-more'); if (!box) return;
    const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    let any = false;
    if (d.levelProgress) {
      const lp = d.levelProgress, w = el('div', 'lvlbar');
      const top = el('div', 'lvl-top'); top.append(el('span', '', ja ? `レベル ${lp.next - 1} → ${lp.next}` : `Level ${lp.next - 1} → ${lp.next}`), el('span', '', ja ? `あと ${fmt.format(lp.toGo)} XP` : `${fmt.format(lp.toGo)} XP to go`));
      const tr = el('div', 'lvl-track'); const fill = el('i'); fill.style.width = Math.max(2, Math.min(100, lp.pct)) + '%'; tr.appendChild(fill);
      tr.setAttribute('role', 'progressbar'); tr.setAttribute('aria-valuenow', String(lp.pct)); tr.setAttribute('aria-valuemin', '0'); tr.setAttribute('aria-valuemax', '100');
      w.append(top, tr); box.appendChild(w); any = true;
    }
    const st = el('div', 'stats'), stat = (v, label) => { const b = el('b', '', fmt.format(v)); b.dataset.count = v; const c = el('div', 'stat'); c.append(b, el('span', '', label)); st.appendChild(c); };
    if (d.achievements != null) stat(d.achievements, ja ? '実績' : 'achievements');
    if (d.perfect != null) stat(d.perfect, ja ? '実績100%のゲーム' : '100% games');
    if (d.japanese && d.japanese.games != null) stat(d.japanese.games, ja ? '日本語で遊べる' : 'playable in Japanese');
    if (d.japanese && d.japanese.voice != null) stat(d.japanese.voice, ja ? '日本語ボイス' : 'with Japanese voices');
    if (st.children.length) { box.appendChild(st); any = true;
      if (d.japanese && d.japanese.checked < d.japanese.total) box.appendChild(el('p', 'small', ja ? `日本語対応は${fmt.format(d.japanese.total)}本中${fmt.format(d.japanese.checked)}本を確認済み（毎日少しずつ確認しています）。` : `Japanese support checked for ${fmt.format(d.japanese.checked)} of ${fmt.format(d.japanese.total)} games so far (a few more every day).`));
    }
    if (d.rarest && d.rarest.length) {
      box.appendChild(el('h3', 'sh', ja ? 'いちばん珍しい実績' : 'Rarest achievements'));
      const g = el('div', 'rares');
      d.rarest.forEach((r) => {
        const c = el('div', 'rare');
        if (r.icon) { const i = el('img'); i.src = r.icon; i.alt = ''; i.width = 64; i.height = 64; i.loading = 'lazy'; c.appendChild(i); }
        const t = el('div'); t.append(el('b', '', r.name), el('span', 'rg', r.game));
        if (r.desc) t.appendChild(el('span', 'rd', r.desc));
        t.appendChild(el('span', 'rp', ja ? `プレイヤーの${r.pct}%だけ` : `Only ${r.pct}% of players`));
        c.appendChild(t); g.appendChild(c);
      });
      box.appendChild(g); any = true;
    }
    if (d.perfectGames && d.perfectGames.length) {
      box.appendChild(el('h3', 'sh', ja ? '実績100%達成' : '100% completed'));
      const p = el('div', 'perfects'); d.perfectGames.forEach((x) => p.appendChild(el('span', 'tag red', x.name))); box.appendChild(p); any = true;
    }
    if (any) box.hidden = false;
  }
})();

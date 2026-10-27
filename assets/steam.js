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
})();

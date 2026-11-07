/* Sentinel dashboard (/tools/sentinel/manage/). The private token comes from the emailed link (#token) and is only ever
   sent to the Sentinel server function. Without a token the page offers to email a new link. Built from the Mail Shield
   manage page; the server API is the same (mailshield/manage), with the Sentinel fields added. */
(function () {
  'use strict';
  const root = document.getElementById('msm');
  if (!root) return;
  const API = 'https://wavaynaaqsfsitxhdpbs.supabase.co/functions/v1/mailshield/manage';
  const lang = document.documentElement.lang === 'ja' ? 'ja' : 'en';
  const T = {
    en: {
      thanks: 'Thank you! Your subscription is active. We have emailed you a private link to this dashboard; open it to add your domains.',
      nolink: 'Open this page with the private link from your email. Lost it? Enter the email address you paid with and we send a new one.',
      email: 'Email address', send: 'Email me a new link', sent: 'If that address has an active subscription, a new link is on its way. Old links stop working.',
      bad: 'This link is not valid any more. Ask for a new one below.', err: 'Something went wrong. Please try again in a moment.',
      plan: (n, used) => `Your plan: ${n} domain${n === 1 ? '' : 's'} (${used} in use)`, renews: 'Renews', status: 'Status',
      inactive: 'Your subscription is not active, so monitoring is paused.',
      add: 'Add a domain', addbtn: 'Add', full: 'All your domain slots are in use. Remove one or upgrade your plan to add more.',
      verify_h: 'Prove you own this domain', verify_d: 'Add this TXT record to the domain\'s DNS, wait a few minutes, then press Verify. You can delete the record once the domain is verified.',
      verify: 'Verify', notyet: 'The record was not found yet. DNS changes can take from a few minutes up to a few hours.',
      checked: 'Last checked', never: 'not yet', checknow: 'Check now', remove: 'Remove', sure: 'Remove for good?', yes: 'Yes, remove', no: 'Keep',
      copy: 'Copy', copied: 'Copied', emaillang: 'Language of alert emails',
      manage_billing: 'Change or cancel your subscription in the Stripe receipt email, or write to tommy@slettvold.org.',
      t_mail: 'Email security', t_cert: 'Certificate', t_domain: 'Domain', t_up: 'Uptime, 30 days', t_head: 'Security headers', t_dns: 'DNS records',
      waiting: 'First check running…', days: (n) => n < 0 ? 'expired' : `${n} day${n === 1 ? '' : 's'} left`, unknown: 'unknown',
      up: 'up', down: 'down', ms: (n) => `${n} ms`, issuer: 'Issuer', expires: 'Expires', noalerts: 'No alerts in the last 30 days.', alerts: 'Recent alerts',
      noday: 'no data', invalid: 'not valid for this name',
      a: { down: 'Site did not answer', up_again: 'Site answered again', header_gone: (c) => `Header gone: ${c.header}`, cert_expired: 'Certificate expired',
        cert_soon: (c) => `Certificate expires in ${c.days} days`, cert_invalid: 'Certificate not valid', domain_soon: (c) => `Domain expires in ${c.days} days`,
        dns: (c) => `DNS ${c.type} changed`, mail: (x) => 'Email security: ' + x },
    },
    ja: {
      thanks: 'お申し込みありがとうございます。このダッシュボードの専用リンクをメールでお送りしました。リンクを開いてドメインを追加してください。',
      nolink: 'このページは、メールでお送りした専用リンクから開いてください。リンクをなくした場合は、お支払いに使ったメールアドレスを入力すると新しいリンクをお送りします。',
      email: 'メールアドレス', send: '新しいリンクを送る', sent: '有効な契約があるアドレスであれば、新しいリンクを送信しました。古いリンクは使えなくなります。',
      bad: 'このリンクはもう有効ではありません。下から新しいリンクを請求してください。', err: 'エラーが発生しました。少し時間をおいて、もう一度お試しください。',
      plan: (n, used) => `ご契約：${n}ドメイン（使用中 ${used}）`, renews: '次回更新', status: '状態',
      inactive: '契約が有効ではないため、監視を停止しています。',
      add: 'ドメインを追加', addbtn: '追加', full: 'ドメインの枠をすべて使用しています。追加するには、いずれかを削除するか、プランを変更してください。',
      verify_h: 'ドメインの所有確認', verify_d: 'このTXTレコードをドメインのDNSに追加し、数分待ってから「確認する」を押してください。確認後はレコードを削除してもかまいません。',
      verify: '確認する', notyet: 'まだレコードが見つかりません。DNSの反映には数分から数時間かかることがあります。',
      checked: '最終確認', never: 'まだありません', checknow: '今すぐ確認', remove: '削除', sure: '削除しますか？', yes: '削除する', no: 'やめる',
      copy: 'コピー', copied: 'コピーしました', emaillang: '通知メールの言語',
      manage_billing: '契約の変更や解約は、Stripeの領収書メールから行えます。または tommy@slettvold.org までご連絡ください。',
      t_mail: 'メールのセキュリティ', t_cert: '証明書', t_domain: 'ドメイン', t_up: '稼働状況（30日）', t_head: 'セキュリティヘッダー', t_dns: 'DNSレコード',
      waiting: '最初の確認を実行中…', days: (n) => n < 0 ? '期限切れ' : `残り${n}日`, unknown: '不明',
      up: '稼働中', down: '停止', ms: (n) => `${n} ms`, issuer: '発行者', expires: '期限', noalerts: '過去30日間の通知はありません。', alerts: '最近の通知',
      noday: 'データなし', invalid: 'このドメイン名では無効',
      a: { down: 'サイトが応答しませんでした', up_again: 'サイトが復旧しました', header_gone: (c) => `ヘッダーがなくなりました：${c.header}`, cert_expired: '証明書の期限切れ',
        cert_soon: (c) => `証明書の期限まであと${c.days}日`, cert_invalid: '証明書が無効', domain_soon: (c) => `ドメインの期限まであと${c.days}日`,
        dns: (c) => `DNS ${c.type} の変更`, mail: (x) => 'メール：' + x },
    },
  }[lang];
  const HEAD = [['hsts', 'HSTS'], ['csp', 'CSP'], ['xcto', 'X-Content-Type-Options'], ['referrer', 'Referrer-Policy'], ['frame', 'Frame protection']];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const token = (location.hash.slice(1).match(/^[0-9a-f]{48}$/) || [])[0] || null;
  const paid = /[?&]paid\b/.test(location.search);
  const loc = lang === 'ja' ? 'ja-JP' : 'en-GB';
  let data = null, note = '', confirmDel = null;

  async function call(body) {
    const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ token }, body)) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'http'), { code: j.error || 'http' });
    return j;
  }
  const when = d => d ? new Date(d).toLocaleString(loc, { dateStyle: 'medium', timeStyle: 'short' }) : T.never;
  const day = d => new Date(d).toLocaleDateString(loc, { dateStyle: 'medium', timeZone: 'UTC' });
  const lv = n => n == null ? 'info' : n < 0 ? 'bad' : n <= 7 ? 'bad' : n <= 30 ? 'warn' : 'good';
  const tile = (title, level, big, small) => '<div class="sn-tile lv-' + level + '"><div class="sn-t">' + esc(title) + '</div><div class="sn-big">' + big + '</div>'
    + (small ? '<div class="sn-small">' + small + '</div>' : '') + '</div>';

  function resendForm(msg) {
    return (msg ? '<p class="ms-msg">' + esc(msg) + '</p>' : '')
      + '<form class="form msm-resend" id="msm-resend" novalidate><label for="msm-email">' + esc(T.email) + '</label>'
      + '<div class="ms-row"><input id="msm-email" type="email" autocomplete="email" required><button class="btn red" type="submit">' + esc(T.send) + '</button></div></form>';
  }

  function uptimeBar(list) {
    const by = {}; for (const x of list || []) by[String(x.day).slice(0, 10)] = x;
    let ok = 0, all = 0, cells = '';
    for (let i = 29; i >= 0; i--) {
      const k = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10), x = by[k];
      const n = x ? x.ok + x.fail : 0; ok += x ? x.ok : 0; all += n;
      const p = n ? x.ok / n : null;
      const c = p == null ? 'none' : p === 1 ? 'good' : p >= 0.99 ? 'warn' : 'bad';
      cells += '<i class="sn-d sn-' + c + '" title="' + esc(day(k) + ': ' + (p == null ? T.noday : (Math.floor(p * 1000) / 10) + '%' + (x.ms ? ' · ' + T.ms(x.ms) : ''))) + '"></i>';
    }
    return { pct: all ? Math.floor((ok / all) * 1000) / 10 : null, html: '<div class="sn-bar" aria-hidden="true">' + cells + '</div>' };
  }

  function alertLine(a) {
    if (a.kind === 'mail') return (a.changes || []).map(x => T.a.mail(String(x).replace(/_/g, ' '))).join(' · ');
    return (a.changes || []).map(c => { const f = T.a[c.id]; return typeof f === 'function' ? f(c) : (f || c.id); }).join(' · ');
  }

  function domainBody(d) {
    if (!d.http && !d.cert && !d.grade) return '<p class="ms-fd"><span class="ms-spin" aria-hidden="true"></span> ' + esc(T.waiting) + '</p>';
    const g = d.grade;
    const mail = tile(T.t_mail, g ? ({ A: 'good', B: 'ok', C: 'warn' }[g] || 'bad') : 'info', g ? esc(g) : '–', g ? esc(d.pct + '/100') + (d.policy ? ' · DMARC p=' + esc(d.policy) : '') : '');
    const cert = d.cert ? tile(T.t_cert, d.cert.valid === false ? 'bad' : lv(d.cert.days), esc(T.days(d.cert.days)),
      (d.cert.valid === false ? esc(T.invalid) + ' · ' : '') + esc(T.expires) + ' ' + esc(day(d.cert.notAfter)) + (d.cert.issuer ? '<br>' + esc(String(d.cert.issuer).replace(/^.*CN=([^,]+).*$/, '$1')) : ''))
      : tile(T.t_cert, 'info', '–', esc(T.unknown));
    const dom = d.expires ? tile(T.t_domain, lv(d.expires.days), esc(T.days(d.expires.days)), esc(T.expires) + ' ' + esc(day(d.expires.at))) : tile(T.t_domain, 'info', '–', esc(T.unknown));
    const u = uptimeBar(d.uptime), live = d.up;
    const up = tile(T.t_up, live && !live.up ? 'bad' : u.pct == null ? 'info' : u.pct >= 99.9 ? 'good' : u.pct >= 99 ? 'warn' : 'bad',
      u.pct == null ? '–' : esc(u.pct + '%'),
      (live ? esc(live.up ? T.up : T.down) + (live.ms && live.up ? ' · ' + esc(T.ms(live.ms)) : '') + (live.status ? ' · HTTP ' + esc(live.status) : '') : '') + u.html);
    const hs = d.http && d.http.headers;
    const nh = hs ? HEAD.filter(([k]) => hs[k]).length : null;
    const head = tile(T.t_head, nh == null ? 'info' : nh === 5 ? 'good' : nh >= 3 ? 'warn' : 'bad', nh == null ? '–' : esc(nh + '/5'),
      hs ? HEAD.map(([k, n]) => '<span class="sn-chip ' + (hs[k] ? 'on' : 'off') + '">' + (hs[k] ? '✓ ' : '✕ ') + esc(n) + '</span>').join(' ') : '');
    let h = '<div class="sn-tiles">' + mail + cert + dom + up + head + '</div>';
    if (d.dns) {
      const rows = Object.keys(d.dns).filter(k => d.dns[k].length).map(k => d.dns[k].map(v => '<span class="ty">' + esc(k) + '</span>  ' + esc(v)).join('\n')).join('\n');
      h += '<details class="sn-more"><summary>' + esc(T.t_dns) + '</summary><div class="ms-zone"><pre>' + rows + '</pre></div></details>';
    }
    const al = d.alerts || [];
    h += '<details class="sn-more"' + (al.length ? ' open' : '') + '><summary>' + esc(T.alerts) + (al.length ? ' (' + al.length + ')' : '') + '</summary>'
      + (al.length ? '<ul class="sn-alerts">' + al.map(a => '<li><span class="small">' + esc(when(a.at)) + '</span> ' + esc(alertLine(a)) + '</li>').join('') + '</ul>' : '<p class="small">' + esc(T.noalerts) + '</p>') + '</details>';
    return h;
  }

  function render() {
    if (!token) { root.innerHTML = (paid ? '<p class="ms-msg msm-ok">' + esc(T.thanks) + '</p>' : '') + resendForm(paid ? '' : T.nolink); return; }
    if (!data) { root.innerHTML = '<p class="small"><span class="ms-spin" aria-hidden="true"></span></p>'; return; }
    const s = data.subscription, ds = data.domains;
    const opt = (v, n) => '<option value="' + v + '"' + (s.lang === v ? ' selected' : '') + '>' + n + '</option>';
    let h = '<section class="msm-plan"><div class="ms-ft">' + esc(T.plan(s.limit, ds.length)) + '</div>'
      + '<div class="small">' + esc(T.status) + ': ' + esc(s.status) + (s.period_end ? ' · ' + esc(T.renews) + ': ' + esc(when(s.period_end)) : '') + (s.email ? ' · ' + esc(s.email) : '') + '</div>'
      + '<label class="msm-lang">' + esc(T.emaillang) + ' <select id="msm-lang">' + opt('en', 'English') + opt('nb', 'Norsk') + opt('ja', '日本語') + '</select></label>'
      + (s.active ? '' : '<p class="ms-msg">' + esc(T.inactive) + '</p>') + '</section>';
    if (note) h += '<p class="ms-msg">' + esc(note) + '</p>';
    for (const d of ds) {
      h += '<section class="ms-check msm-dom"><h2><span class="ms-domain">' + esc(d.domain) + '</span></h2>';
      if (!d.verified) {
        h += '<p class="ms-fd"><b>' + esc(T.verify_h) + '.</b> ' + esc(T.verify_d) + '</p>'
          + '<div class="ms-zone"><pre><span class="nm">' + esc(d.verify_name) + '.</span>  <span class="ty">TXT</span>  "' + esc(d.verify_value) + '"</pre>'
          + '<button type="button" class="ms-copy" data-copy="' + esc(d.verify_value) + '">' + esc(T.copy) + '</button></div>'
          + '<div class="msm-actions"><button class="btn red" data-act="verify" data-d="' + esc(d.domain) + '">' + esc(T.verify) + '</button>';
      } else {
        h += domainBody(d)
          + '<p class="small">' + esc(T.checked) + ': ' + esc(when(d.web_checked_at || d.checked_at)) + '</p>'
          + '<div class="msm-actions"><button class="btn line" data-act="check" data-d="' + esc(d.domain) + '">' + esc(T.checknow) + '</button>';
      }
      h += confirmDel === d.domain
        ? ' <span class="small">' + esc(T.sure) + '</span> <button class="btn red" data-act="remove" data-d="' + esc(d.domain) + '">' + esc(T.yes) + '</button> <button class="btn line" data-act="keep">' + esc(T.no) + '</button></div></section>'
        : ' <button class="btn line" data-act="ask" data-d="' + esc(d.domain) + '">' + esc(T.remove) + '</button></div></section>';
    }
    if (s.active) {
      h += ds.length < s.limit
        ? '<form class="form msm-add" id="msm-add" novalidate><label for="msm-domain">' + esc(T.add) + '</label><div class="ms-row"><input id="msm-domain" placeholder="example.com" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn red" type="submit">' + esc(T.addbtn) + '</button></div></form>'
        : '<p class="small">' + esc(T.full) + '</p>';
    }
    h += '<p class="small">' + esc(T.manage_billing) + '</p>';
    root.innerHTML = h;
  }

  async function run(body, busyBtn) {
    if (busyBtn) busyBtn.disabled = true;
    note = '';
    try { data = await call(body); }
    catch (e) {
      if (e.code === 'token') { location.hash = ''; root.innerHTML = resendForm(T.bad); return; }
      note = e.code === 'not-verified' ? T.notyet : e.code === 'limit' ? T.full : T.err;
    }
    confirmDel = null; render();
  }

  root.addEventListener('click', e => {
    const c = e.target.closest('.ms-copy');
    if (c) { try { navigator.clipboard.writeText(c.dataset.copy).then(() => { c.textContent = T.copied; }); } catch (err) { /* select manually */ } return; }
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const act = b.dataset.act, d = b.dataset.d;
    if (act === 'ask') { confirmDel = d; render(); return; }
    if (act === 'keep') { confirmDel = null; render(); return; }
    run({ action: act, domain: d }, b);
  });
  root.addEventListener('change', e => { if (e.target.id === 'msm-lang') run({ action: 'lang', lang: e.target.value }); });
  root.addEventListener('submit', async e => {
    e.preventDefault();
    if (e.target.id === 'msm-add') { run({ action: 'add', domain: document.getElementById('msm-domain').value }, e.target.querySelector('button')); return; }
    if (e.target.id === 'msm-resend') {
      const btn = e.target.querySelector('button'); btn.disabled = true;
      try { await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'resend', email: document.getElementById('msm-email').value, lang }) }); root.innerHTML = '<p class="ms-msg msm-ok">' + esc(T.sent) + '</p>'; }
      catch (err) { btn.disabled = false; root.insertAdjacentHTML('afterbegin', '<p class="ms-msg">' + esc(T.err) + '</p>'); }
    }
  });

  render();
  if (token) run({ action: 'list' });
})();

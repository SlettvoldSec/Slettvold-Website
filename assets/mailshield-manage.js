/* Mail Shield subscriber page (/tools/mail/manage/). The private token comes from the emailed link (#token) and is only
   ever sent to the Mail Shield server function. Without a token the page offers to email a new link. */
(function () {
  'use strict';
  const root = document.getElementById('msm');
  if (!root) return;
  const API = 'https://wavaynaaqsfsitxhdpbs.supabase.co/functions/v1/mailshield/manage';
  const lang = document.documentElement.lang === 'ja' ? 'ja' : 'en';
  const T = {
    en: {
      thanks: 'Thank you! Your subscription is active. We have emailed you a private link to this page; open it to add your domains.',
      nolink: 'Open this page with the private link from your email. Lost it? Enter the email address you paid with and we send a new one.',
      email: 'Email address', send: 'Email me a new link', sent: 'If that address has an active subscription, a new link is on its way. Old links stop working.',
      bad: 'This link is not valid any more. Ask for a new one below.', err: 'Something went wrong. Please try again in a moment.',
      plan: (n, used) => `Your plan: ${n} domain${n === 1 ? '' : 's'} (${used} in use)`, renews: 'Renews', status: 'Status',
      inactive: 'Your subscription is not active, so monitoring is paused.',
      add: 'Add a domain', addbtn: 'Add', full: 'All your domain slots are in use. Remove one or upgrade your plan to add more.',
      verify_h: 'Prove you own this domain', verify_d: 'Add this TXT record to the domain\'s DNS, wait a few minutes, then press Verify. You can delete the record once the domain is verified.',
      name: 'Name', value: 'Value', verify: 'Verify', notyet: 'The record was not found yet. DNS changes can take from a few minutes up to a few hours.',
      monitored: 'Monitored daily', checked: 'Last checked', never: 'not yet', checknow: 'Check now', remove: 'Remove', sure: 'Remove for good?', yes: 'Yes, remove', no: 'Keep',
      copy: 'Copy', copied: 'Copied', emaillang: 'Language of alert emails', policy: 'DMARC', lookups: 'SPF lookups',
      manage_billing: 'Change or cancel your subscription in the Stripe receipt email, or write to tommy@slettvold.org.',
    },
    ja: {
      thanks: 'お申し込みありがとうございます。このページの専用リンクをメールでお送りしました。リンクを開いてドメインを追加してください。',
      nolink: 'このページは、メールでお送りした専用リンクから開いてください。リンクをなくした場合は、お支払いに使ったメールアドレスを入力すると新しいリンクをお送りします。',
      email: 'メールアドレス', send: '新しいリンクを送る', sent: '有効な契約があるアドレスであれば、新しいリンクを送信しました。古いリンクは使えなくなります。',
      bad: 'このリンクはもう有効ではありません。下から新しいリンクを請求してください。', err: 'エラーが発生しました。少し時間をおいて、もう一度お試しください。',
      plan: (n, used) => `ご契約：${n}ドメイン（使用中 ${used}）`, renews: '次回更新', status: '状態',
      inactive: '契約が有効ではないため、監視を停止しています。',
      add: 'ドメインを追加', addbtn: '追加', full: 'ドメインの枠をすべて使用しています。追加するには、いずれかを削除するか、プランを変更してください。',
      verify_h: 'ドメインの所有確認', verify_d: 'このTXTレコードをドメインのDNSに追加し、数分待ってから「確認する」を押してください。確認後はレコードを削除してもかまいません。',
      name: '名前', value: '値', verify: '確認する', notyet: 'まだレコードが見つかりません。DNSの反映には数分から数時間かかることがあります。',
      monitored: '毎日監視中', checked: '最終確認', never: 'まだありません', checknow: '今すぐ診断', remove: '削除', sure: '削除しますか？', yes: '削除する', no: 'やめる',
      copy: 'コピー', copied: 'コピーしました', emaillang: '通知メールの言語', policy: 'DMARC', lookups: 'SPF参照',
      manage_billing: '契約の変更や解約は、Stripeの領収書メールから行えます。または tommy@slettvold.org までご連絡ください。',
    },
  }[lang];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const token = (location.hash.slice(1).match(/^[0-9a-f]{48}$/) || [])[0] || null;
  const paid = /[?&]paid\b/.test(location.search);
  let data = null, note = '', confirmDel = null;

  async function call(body) {
    const r = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ token }, body)) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || 'http'), { code: j.error || 'http' });
    return j;
  }
  const when = d => d ? new Date(d).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : T.never;

  function resendForm(msg) {
    return (msg ? '<p class="ms-msg">' + esc(msg) + '</p>' : '')
      + '<form class="form msm-resend" id="msm-resend" novalidate><label for="msm-email">' + esc(T.email) + '</label>'
      + '<div class="ms-row"><input id="msm-email" type="email" autocomplete="email" required><button class="btn red" type="submit">' + esc(T.send) + '</button></div></form>';
  }

  function render() {
    if (!token) { root.innerHTML = (paid ? '<p class="ms-msg msm-ok">' + esc(T.thanks) + '</p>' : '') + resendForm(paid ? '' : T.nolink); return; }
    if (!data) { root.innerHTML = '<p class="small"><span class="ms-spin" aria-hidden="true"></span></p>'; return; }
    const s = data.subscription, ds = data.domains;
    let h = '<section class="msm-plan"><div class="ms-ft">' + esc(T.plan(s.limit, ds.length)) + '</div>'
      + '<div class="small">' + esc(T.status) + ': ' + esc(s.status) + (s.period_end ? ' · ' + esc(T.renews) + ': ' + esc(when(s.period_end)) : '') + (s.email ? ' · ' + esc(s.email) : '') + '</div>'
      + '<label class="msm-lang">' + esc(T.emaillang) + ' <select id="msm-lang"><option value="en"' + (s.lang === 'en' ? ' selected' : '') + '>English</option><option value="ja"' + (s.lang === 'ja' ? ' selected' : '') + '>日本語</option></select></label>'
      + (s.active ? '' : '<p class="ms-msg">' + esc(T.inactive) + '</p>') + '</section>';
    if (note) h += '<p class="ms-msg">' + esc(note) + '</p>';
    for (const d of ds) {
      h += '<section class="ms-check msm-dom"><h2><span class="ms-domain">' + esc(d.domain) + '</span>'
        + (d.verified ? (d.grade ? ' <span class="ms-pill lv-' + ({ A: 'good', B: 'ok', C: 'warn' }[d.grade] || 'bad') + '">' + esc(d.grade) + ' · ' + esc(d.pct) + '/100</span>' : '') : '') + '</h2>';
      if (!d.verified) {
        h += '<p class="ms-fd"><b>' + esc(T.verify_h) + '.</b> ' + esc(T.verify_d) + '</p>'
          + '<div class="ms-zone"><pre><span class="nm">' + esc(d.verify_name) + '.</span>  <span class="ty">TXT</span>  "' + esc(d.verify_value) + '"</pre>'
          + '<button type="button" class="ms-copy" data-copy="' + esc(d.verify_value) + '">' + esc(T.copy) + '</button></div>'
          + '<div class="msm-actions"><button class="btn red" data-act="verify" data-d="' + esc(d.domain) + '">' + esc(T.verify) + '</button>';
      } else {
        h += '<p class="ms-fd">' + esc(T.monitored) + ' · ' + esc(T.checked) + ': ' + esc(when(d.checked_at))
          + (d.policy ? ' · ' + esc(T.policy) + ' p=' + esc(d.policy) : '') + (d.lookups != null ? ' · ' + esc(T.lookups) + ' ' + esc(d.lookups) + '/10' : '') + '</p>'
          + '<div class="msm-actions"><button class="btn line" data-act="check" data-d="' + esc(d.domain) + '">' + esc(T.checknow) + '</button>';
      }
      h += confirmDel === d.domain
        ? ' <span class="small">' + esc(T.sure) + '</span> <button class="btn red" data-act="remove" data-d="' + esc(d.domain) + '">' + esc(T.yes) + '</button> <button class="btn line" data-act="keep">' + esc(T.no) + '</button></div></section>'
        : ' <button class="btn line" data-act="ask" data-d="' + esc(d.domain) + '">' + esc(T.remove) + '</button></div></section>';
    }
    if (s.active) {
      h += ds.length < s.limit
        ? '<form class="form msm-add" id="msm-add" novalidate><label for="msm-domain">' + esc(T.add) + '</label><div class="ms-row"><input id="msm-domain" placeholder="example.co.jp" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="btn red" type="submit">' + esc(T.addbtn) + '</button></div></form>'
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

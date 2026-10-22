/* Contact & feedback form (pages/en|ja/contact.html). Sends the message straight to Tommy's Supabase function in the EU
   (server/functions/feedback); no third-party scripts, no cookies. ?about=app|website|idea|contact preselects the topic. */
(() => {
  const f = document.getElementById('fb'); if (!f) return;
  const ja = document.body.dataset.lang === 'ja';
  const T = ja ? { send: '送信中…', ok: 'ありがとうございます。メッセージを受け取りました。', short: 'メッセージをもう少し詳しく書いてください。',
                   email: 'メールアドレスを確認してください。', slow: '送信が多すぎます。少し時間をおいてお試しください。', fail: '送信できませんでした。時間をおいてもう一度お試しいただくか、メールでご連絡ください。' }
               : { send: 'Sending…', ok: 'Thank you! Your message has arrived.', short: 'Please write a little more.',
                   email: 'Please check the email address.', slow: 'Too many messages just now. Please try again in a few minutes.', fail: 'That didn’t go through. Please try again later, or send me an email.' };
  const opened = Date.now(), btn = f.querySelector('button[type=submit]'), out = document.getElementById('fb-msg'), label = btn.textContent;
  const about = new URLSearchParams(location.search).get('about');
  if (about && f.kind.querySelector(`option[value="${about}"]`)) f.kind.value = about;
  const say = (text, good) => { out.textContent = text; out.className = 'fb-msg ' + (good ? 'ok' : 'err'); };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = { kind: f.kind.value, message: f.message.value.trim(), name: f.name.value.trim(), email: f.email.value.trim(),
                   website: f.website.value, lang: ja ? 'ja' : 'en', page: document.referrer ? new URL(document.referrer).pathname : '', t: Date.now() - opened };
    if (body.message.length < 5) return say(T.short);
    btn.disabled = true; btn.textContent = T.send; out.textContent = '';
    try {
      const r = await fetch('https://wavaynaaqsfsitxhdpbs.supabase.co/functions/v1/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.ok) { f.reset(); f.hidden = true; document.getElementById('fb-done').hidden = false; return; }
      say(j.error === 'too-short' ? T.short : j.error === 'email' ? T.email : j.error === 'slow-down' ? T.slow : T.fail);
    } catch (err) { say(T.fail); }
    btn.disabled = false; btn.textContent = label;
  });
})();

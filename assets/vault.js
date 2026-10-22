/* The dojo vault: the last step of the little source-code hunt. The flag is XOR-encrypted with the password, so it
   isn't readable in the page source; the password is only checked against its SHA-256. */
(() => {
  const f = document.getElementById('vault'); if (!f) return;
  const HASH = 'a4945a5c194254644e6206856bd9666587e6d7b0124cecddce958917816ca500', BOX = 'ODkkHgUUGw4bEwwxDhkOGxcBMRUBDioVBBoEFA==';
  const out = document.getElementById('vault-out'), log = (t) => { const p = document.createElement('div'); p.textContent = t; out.appendChild(p); };
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const key = f.pw.value.trim().toLowerCase(); f.pw.value = '';
    log('> ' + '*'.repeat(key.length));
    const h = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)))).map((b) => b.toString(16).padStart(2, '0')).join('');
    if (h !== HASH) { log('ACCESS DENIED. 違います。Think about who teaches in my dojo.'); return; }
    const box = atob(BOX); let flag = ''; for (let i = 0; i < box.length; i++) flag += String.fromCharCode(box.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    log('ACCESS GRANTED. おめでとう！'); log('FLAG: ' + flag);
    document.getElementById('vault-done').hidden = false;
  });
})();

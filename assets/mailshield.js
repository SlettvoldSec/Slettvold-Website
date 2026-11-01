/* Mail Shield · Slettvold Security · email authentication checker (SPF, DKIM, DMARC). Runs in your browser; only DNS-over-HTTPS requests. */
/* Mail Shield core: checks a domain's email-authentication records (SPF, DKIM, DMARC, MTA-STS, TLS-RPT, BIMI, MX).
   Pure logic plus a pluggable resolver, so it runs in the browser (DNS-over-HTTPS) and in node tests (fixtures).
   A resolver is: async (name, type) => { status: 'ok'|'nxdomain'|'error', answers: [string], ad: bool }
   TXT answers are returned already joined (multi-string records concatenated). */
(function (root) {
  'use strict';

  // ---------- DNS over HTTPS ----------
  const DOH = [
    'https://cloudflare-dns.com/dns-query',
    'https://dns.google/resolve',
  ];
  const TYPES = { A: 1, MX: 15, TXT: 16, AAAA: 28, CNAME: 5 };

  function joinTxt(data) {
    // DoH JSON gives TXT data as one or more quoted strings: "v=spf1 a" "include:x -all"
    const parts = String(data).match(/"((?:[^"\\]|\\.)*)"/g);
    if (!parts) return String(data);
    return parts.map(p => p.slice(1, -1).replace(/\\(.)/g, '$1')).join('');
  }

  function dohResolver(fetchImpl) {
    const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch.bind(root) : null);
    const cache = new Map();
    return async function resolve(name, type) {
      const key = name.toLowerCase() + '|' + type;
      if (cache.has(key)) return cache.get(key);
      const p = (async () => {
        let lastErr;
        for (const base of DOH) {
          try {
            const url = base + '?name=' + encodeURIComponent(name) + '&type=' + type;
            const res = await f(url, { headers: { accept: 'application/dns-json' } });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            const j = await res.json();
            if (j.Status === 3) return { status: 'nxdomain', answers: [], ad: !!j.AD };
            if (j.Status !== 0) throw new Error('DNS status ' + j.Status);
            const want = TYPES[type];
            const answers = (j.Answer || []).filter(a => a.type === want).map(a => type === 'TXT' ? joinTxt(a.data) : String(a.data));
            return { status: 'ok', answers, ad: !!j.AD };
          } catch (e) { lastErr = e; }
        }
        return { status: 'error', answers: [], error: String(lastErr && lastErr.message || lastErr) };
      })();
      cache.set(key, p);
      return p;
    };
  }

  // ---------- helpers ----------
  const MULTI_PART_SUFFIXES = new Set([
    'co.jp', 'ne.jp', 'or.jp', 'ac.jp', 'go.jp', 'gr.jp', 'ed.jp', 'lg.jp', 'ad.jp',
    'co.uk', 'org.uk', 'ac.uk', 'gov.uk', 'com.au', 'net.au', 'org.au', 'co.nz', 'com.br', 'co.kr', 'com.cn', 'com.tw', 'com.sg',
  ]);

  function normalizeDomain(input) {
    let d = String(input || '').trim().toLowerCase();
    d = d.replace(/^[a-z]+:\/\//, '').replace(/^[^@]*@/, '').split(/[\/?#:]/)[0].replace(/\.$/, '');
    if (!/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/.test(d)) {
      // allow IDN typed in Unicode: convert with URL if available
      try { const h = new URL('http://' + d).hostname; if (h && h !== d) return normalizeDomain(h); } catch (e) { /* fall through */ }
      return null;
    }
    return d;
  }

  function orgDomain(d) {
    const labels = d.split('.');
    if (labels.length <= 2) return d;
    const last2 = labels.slice(-2).join('.');
    if (MULTI_PART_SUFFIXES.has(last2)) return labels.slice(-3).join('.');
    return last2;
  }

  // ---------- SPF ----------
  function parseSpf(record) {
    const terms = record.trim().split(/\s+/).slice(1);
    const out = { mechanisms: [], all: null, redirect: null, ptr: false, unknown: [] };
    for (const t of terms) {
      const m = t.match(/^([+\-~?]?)([a-z0-9]+)(?:[:=\/](.*))?$/i);
      if (!m) { out.unknown.push(t); continue; }
      const q = m[1] || '+';
      const name = m[2].toLowerCase();
      const val = m[3] || '';
      if (t.toLowerCase().startsWith('redirect=')) { out.redirect = t.slice(9); continue; }
      if (t.toLowerCase().startsWith('exp=')) continue;
      if (name === 'all') { out.all = q; continue; }
      if (['include', 'a', 'mx', 'ptr', 'exists', 'ip4', 'ip6'].includes(name)) {
        out.mechanisms.push({ q, name, val });
        if (name === 'ptr') out.ptr = true;
      } else out.unknown.push(t);
    }
    return out;
  }

  const LOOKUP_MECHS = new Set(['include', 'a', 'mx', 'ptr', 'exists']);

  async function spfLookupCount(domain, resolve, depth, seen) {
    // RFC 7208 §4.6.4: at most 10 DNS-querying terms across the whole evaluation.
    if (depth > 10 || seen.has(domain)) return { count: 0, voids: 0, errors: [] };
    seen.add(domain);
    const r = await resolve(domain, 'TXT');
    const recs = r.answers.filter(a => /^v=spf1(\s|$)/i.test(a));
    if (recs.length !== 1) return { count: 0, voids: recs.length === 0 ? 1 : 0, errors: recs.length > 1 ? ['multiple:' + domain] : ['missing:' + domain] };
    const p = parseSpf(recs[0]);
    let count = 0, voids = 0; const errors = [];
    for (const m of p.mechanisms) {
      if (!LOOKUP_MECHS.has(m.name)) continue;
      count++;
      if (m.name === 'include' && m.val && !m.val.includes('%')) {
        const sub = await spfLookupCount(m.val, resolve, depth + 1, seen);
        count += sub.count; voids += sub.voids; errors.push(...sub.errors);
      }
    }
    if (p.redirect && !p.redirect.includes('%')) {
      count++;
      const sub = await spfLookupCount(p.redirect, resolve, depth + 1, seen);
      count += sub.count; voids += sub.voids; errors.push(...sub.errors);
    }
    return { count, voids, errors };
  }

  async function checkSpf(domain, resolve) {
    const r = await resolve(domain, 'TXT');
    const res = { key: 'spf', records: [], findings: [], score: 0, max: 25 };
    if (r.status === 'error') { res.findings.push(f('warn', 'dns_error')); return res; }
    const recs = r.answers.filter(a => /^v=spf1(\s|$)/i.test(a));
    res.records = recs;
    if (recs.length === 0) { res.findings.push(f('bad', 'spf_missing')); return res; }
    if (recs.length > 1) { res.findings.push(f('bad', 'spf_multiple', { n: recs.length })); return res; }
    const p = parseSpf(recs[0]);
    let score = 10;
    const all = p.all || (p.redirect ? 'redirect' : null);
    if (all === '-') { score += 10; res.findings.push(f('good', 'spf_all_fail')); }
    else if (all === '~') { score += 8; res.findings.push(f('ok', 'spf_all_softfail')); }
    else if (all === '?') { score += 2; res.findings.push(f('warn', 'spf_all_neutral')); }
    else if (all === '+') { res.findings.push(f('bad', 'spf_all_pass')); }
    else if (all === 'redirect') { score += 8; res.findings.push(f('info', 'spf_redirect', { to: p.redirect })); }
    else { score += 2; res.findings.push(f('warn', 'spf_no_all')); }
    if (p.ptr) res.findings.push(f('warn', 'spf_ptr'));
    if (p.unknown.length) res.findings.push(f('warn', 'spf_unknown', { terms: p.unknown.join(' ') }));
    const lc = await spfLookupCount(domain, resolve, 0, new Set());
    res.lookups = lc.count;
    if (lc.count > 10) res.findings.push(f('bad', 'spf_too_many', { n: lc.count }));
    else if (lc.count >= 8) { score += 3; res.findings.push(f('warn', 'spf_near_limit', { n: lc.count })); }
    else { score += 5; res.findings.push(f('good', 'spf_lookups_ok', { n: lc.count })); }
    if (lc.voids > 2) res.findings.push(f('warn', 'spf_voids', { n: lc.voids }));
    res.score = Math.min(score, res.max);
    if (all === '+') res.score = 0;
    return res;
  }

  // ---------- DMARC ----------
  function parseTags(record) {
    const tags = {};
    for (const part of record.split(';')) {
      const i = part.indexOf('=');
      if (i < 0) continue;
      const k = part.slice(0, i).trim().toLowerCase();
      if (k && !(k in tags)) tags[k] = part.slice(i + 1).trim();
    }
    return tags;
  }

  async function checkDmarc(domain, resolve) {
    const res = { key: 'dmarc', records: [], findings: [], score: 0, max: 35 };
    let where = '_dmarc.' + domain;
    let r = await resolve(where, 'TXT');
    let recs = r.answers.filter(a => /^v=DMARC1\s*(;|$)/i.test(a));
    let inherited = false;
    const org = orgDomain(domain);
    if (recs.length === 0 && org !== domain) {
      const r2 = await resolve('_dmarc.' + org, 'TXT');
      const recs2 = r2.answers.filter(a => /^v=DMARC1\s*(;|$)/i.test(a));
      if (recs2.length) { recs = recs2; where = '_dmarc.' + org; inherited = true; r = r2; }
    }
    if (r.status === 'error') { res.findings.push(f('warn', 'dns_error')); return res; }
    res.records = recs; res.where = where;
    if (recs.length === 0) { res.findings.push(f('bad', 'dmarc_missing')); return res; }
    if (recs.length > 1) { res.findings.push(f('bad', 'dmarc_multiple', { n: recs.length })); return res; }
    if (inherited) res.findings.push(f('info', 'dmarc_inherited', { org }));
    const t = parseTags(recs[0]);
    res.tags = t;
    let policy = (inherited ? (t.sp || t.p) : t.p || '').toLowerCase();
    let score = 5;
    if (!t.p) { res.findings.push(f('bad', 'dmarc_no_p')); policy = 'none'; }
    if (policy === 'reject') { score += 20; res.findings.push(f('good', 'dmarc_reject')); }
    else if (policy === 'quarantine') { score += 15; res.findings.push(f('ok', 'dmarc_quarantine')); }
    else if (t.p) { score += 3; res.findings.push(f('warn', 'dmarc_none')); }
    const pct = t.pct !== undefined ? parseInt(t.pct, 10) : 100;
    if (!isNaN(pct) && pct < 100 && policy !== 'none') { score -= 5; res.findings.push(f('warn', 'dmarc_pct', { pct })); }
    if (!inherited && t.sp && t.sp.toLowerCase() === 'none' && policy !== 'none') res.findings.push(f('warn', 'dmarc_sp_none'));
    if (t.rua) { score += 7; res.findings.push(f('good', 'dmarc_rua')); }
    else res.findings.push(f('warn', 'dmarc_no_rua'));
    if ((t.adkim || '').toLowerCase() === 's' || (t.aspf || '').toLowerCase() === 's') res.findings.push(f('info', 'dmarc_strict'));
    res.score = Math.max(0, Math.min(score + 3, res.max));
    res.policy = policy;
    return res;
  }

  // ---------- DKIM ----------
  const SELECTORS = [
    'default', 'google', 'selector1', 'selector2', 'k1', 'k2', 'k3', 's1', 's2', 'dkim', 'mail', 'smtp',
    'fm1', 'fm2', 'fm3', 'protonmail', 'protonmail2', 'protonmail3', 'zoho', 'zmail', 'mxvault',
    'everlytickey1', 'everlytickey2', 'mandrill', 'mailjet', 'sib', 'brevo1', 'brevo2', 'pm', 'key1', 'key2', 'dk', 'x',
  ];

  function rsaBitsFromKey(b64) {
    try {
      const clean = b64.replace(/\s+/g, '');
      const bytes = Math.floor(clean.replace(/=+$/, '').length * 3 / 4);
      // SubjectPublicKeyInfo DER sizes: ~94 (512), ~162 (1024), ~294 (2048), ~422 (3072), ~550 (4096)
      if (bytes < 120) return 512;
      if (bytes < 230) return 1024;
      if (bytes < 360) return 2048;
      if (bytes < 490) return 3072;
      return 4096;
    } catch (e) { return null; }
  }

  async function checkDkim(domain, resolve, extraSelectors) {
    const res = { key: 'dkim', found: [], findings: [], score: 0, max: 20 };
    const sels = Array.from(new Set([...(extraSelectors || []), ...SELECTORS]));
    // A wildcard (*._domainkey) answers every selector. Probe a name nobody uses to detect it, then ignore identical answers.
    const probe = await resolve('ms-probe-' + Math.random().toString(36).slice(2, 10) + '._domainkey.' + domain, 'TXT');
    const wildcard = probe.answers.find(a => /(^|;)\s*(v=DKIM1|k=|p=)/i.test(a)) || null;
    if (wildcard) {
      res.wildcard = wildcard;
      const wp = (parseTags(wildcard).p || '').replace(/\s+/g, '');
      res.findings.push(f('info', wp ? 'dkim_wildcard' : 'dkim_wildcard_none'));
    }
    const results = await Promise.all(sels.map(async s => {
      const r = await resolve(s + '._domainkey.' + domain, 'TXT');
      const rec = r.answers.find(a => /(^|;)\s*(v=DKIM1|k=|p=)/i.test(a));
      return rec && rec !== wildcard ? { selector: s, record: rec } : null;
    }));
    for (const x of results) if (x) {
      const t = parseTags(x.record);
      const key = (t.p || '').replace(/\s+/g, '');
      const type = (t.k || 'rsa').toLowerCase();
      x.revoked = key === '';
      x.type = type;
      x.bits = type === 'rsa' && key ? rsaBitsFromKey(key) : null;
      res.found.push(x);
    }
    const live = res.found.filter(x => !x.revoked);
    if (live.length === 0) {
      if (wildcard && !res.found.length) { res.score = null; return res; }
      res.findings.push(f(res.found.length ? 'warn' : 'info', res.found.length ? 'dkim_revoked_only' : 'dkim_not_found'));
      res.score = res.found.length ? 0 : null; // null = unknown (selector may simply be one we did not guess)
      return res;
    }
    let score = 15;
    res.findings.push(f('good', 'dkim_found', { list: live.map(x => x.selector).join(', ') }));
    const weak = live.filter(x => x.bits && x.bits < 2048);
    if (weak.length) { score -= weak.some(x => x.bits <= 512) ? 10 : 5; res.findings.push(f('warn', 'dkim_weak', { list: weak.map(x => x.selector + ' (' + x.bits + ' bit)').join(', ') })); }
    else score += 5;
    if (live.some(x => /t=[^;]*y/i.test(x.record))) res.findings.push(f('warn', 'dkim_testing'));
    res.score = Math.max(0, Math.min(score, res.max));
    return res;
  }

  // ---------- MX, MTA-STS, TLS-RPT, BIMI ----------
  async function checkMx(domain, resolve) {
    const r = await resolve(domain, 'MX');
    const res = { key: 'mx', records: r.answers, findings: [], score: 0, max: 5 };
    if (r.status === 'error') { res.findings.push(f('warn', 'dns_error')); return res; }
    if (r.status === 'nxdomain') { res.findings.push(f('bad', 'nxdomain')); res.nx = true; return res; }
    const nullMx = r.answers.length === 1 && /^0\s+\.?$/.test(r.answers[0].trim());
    res.nullMx = nullMx;
    if (nullMx) { res.score = 5; res.findings.push(f('info', 'mx_null')); }
    else if (r.answers.length === 0) { res.score = 3; res.findings.push(f('info', 'mx_none')); }
    else { res.score = 5; res.findings.push(f('info', 'mx_ok', { list: r.answers.map(a => a.replace(/^\d+\s+/, '').replace(/\.$/, '')).join(', ') })); }
    res.dnssec = r.ad;
    return res;
  }

  async function checkTxtPolicy(name, prefix, key, resolve, goodKey, missKey, max) {
    const r = await resolve(name, 'TXT');
    const recs = r.answers.filter(a => a.toLowerCase().startsWith(prefix.toLowerCase()));
    const res = { key, records: recs, findings: [], score: 0, max };
    if (recs.length) { res.score = max; res.findings.push(f('good', goodKey)); }
    else res.findings.push(f('info', missKey));
    return res;
  }

  // ---------- overall ----------
  function f(level, id, vars) { return { level, id, vars: vars || {} }; }

  function grade(results, sendsMail) {
    // Weighted score out of 100. DKIM "unknown" (null) is scored as half so a guessed-wrong selector does not fail a domain.
    let got = 0, max = 0;
    for (const r of results) {
      if (r.max === 0) continue;
      max += r.max;
      got += r.score === null ? r.max / 2 : r.score;
    }
    const pct = max ? Math.round(got * 100 / max) : 0;
    const spf = results.find(r => r.key === 'spf');
    const dmarc = results.find(r => r.key === 'dmarc');
    let letter = pct >= 90 ? 'A' : pct >= 75 ? 'B' : pct >= 60 ? 'C' : pct >= 40 ? 'D' : 'F';
    // Hard caps: no DMARC or a pass-all SPF means anyone can spoof the domain.
    const capAt = (l, worst) => (l < worst ? worst : l); // letters: A best … F worst
    const passAll = spf.records.length === 1 && /(^|\s)\+?all(\s|$)/i.test(spf.records[0]) && !/[-~?]all/i.test(spf.records[0]);
    if (!dmarc.records.length && !spf.records.length) letter = 'F';
    else if (!dmarc.records.length || passAll) letter = capAt(letter, 'D');
    else if (dmarc.policy === 'none') letter = capAt(letter, 'C');
    return { pct, letter, sendsMail };
  }

  async function checkDomain(input, resolve, opts) {
    const domain = normalizeDomain(input);
    if (!domain) return { error: 'invalid_domain' };
    resolve = resolve || dohResolver();
    const mx = await checkMx(domain, resolve);
    if (mx.nx) return { domain, error: 'nxdomain' };
    const [spf, dmarc, dkim, sts, tlsrpt, bimi] = await Promise.all([
      checkSpf(domain, resolve),
      checkDmarc(domain, resolve),
      checkDkim(domain, resolve, opts && opts.selectors),
      checkTxtPolicy('_mta-sts.' + domain, 'v=STSv1', 'mtasts', resolve, 'mtasts_ok', 'mtasts_missing', 5),
      checkTxtPolicy('_smtp._tls.' + domain, 'v=TLSRPTv1', 'tlsrpt', resolve, 'tlsrpt_ok', 'tlsrpt_missing', 5),
      checkTxtPolicy('default._bimi.' + domain, 'v=BIMI1', 'bimi', resolve, 'bimi_ok', 'bimi_missing', 0),
    ]);
    // A domain that never sends mail should still lock itself down: SPF -all + DMARC reject.
    const results = [spf, dmarc, dkim, mx, sts, tlsrpt, bimi];
    if (mx.nullMx) { sts.max = 0; sts.score = 0; tlsrpt.max = 0; tlsrpt.score = 0; dkim.max = 0; dkim.score = 0; }
    const g = grade(results, !mx.nullMx);
    return { domain, results, grade: g, checkedAt: new Date().toISOString() };
  }

  const api = { checkDomain, dohResolver, normalizeDomain, orgDomain, parseSpf, parseTags, joinTxt, rsaBitsFromKey, SELECTORS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MailShield = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* All user-facing text, Japanese and English. {name} placeholders are filled from finding vars. */
(function (root) {
  'use strict';
  const M = {
    ja: {
      title: 'メール送信ドメイン認証チェッカー',
      tagline: 'あなたのドメインは、なりすましメールから守られていますか？SPF・DKIM・DMARCを無料で診断します。',
      placeholder: '例：example.co.jp',
      check: '診断する',
      checking: '診断中…',
      privacy: 'DNSの公開情報だけを確認します。入力したドメインは保存せず、送信先はDNS-over-HTTPS（Cloudflare／Google）のみです。',
      invalid_domain: 'ドメイン名の形式が正しくありません（例：example.co.jp）。',
      nxdomain: 'このドメインは存在しないようです。綴りを確認してください。',
      network: 'DNSに問い合わせできませんでした。ネットワークを確認して、もう一度お試しください。',
      score: '総合評価',
      grade_A: 'とても良好です。なりすまし対策がしっかりできています。',
      grade_B: '良好です。いくつか改善できる点があります。',
      grade_C: '基本はありますが、なりすましを止めきれていません。',
      grade_D: '不十分です。第三者があなたのドメインを名乗ってメールを送れる状態です。',
      grade_F: '対策がほぼありません。早めの設定をおすすめします。',
      sec_spf: 'SPF（送信元サーバーの許可リスト）',
      sec_dmarc: 'DMARC（なりすましメールの扱い方）',
      sec_dkim: 'DKIM（電子署名）',
      sec_mx: 'MX（メールの受信先）',
      sec_mtasts: 'MTA-STS（受信時の暗号化の強制）',
      sec_tlsrpt: 'TLS-RPT（暗号化の失敗レポート）',
      sec_bimi: 'BIMI（受信箱にロゴを表示）',
      record: '見つかったレコード',
      fix: '対処法',
      copy: 'コピー',
      copied: 'コピーしました',
      suggested: '設定例（内容はご自身の環境に合わせてください）',
      lang: 'English',
      footer: 'Slettvold Security 制作。結果は参考情報であり、すべての設定ミスを検出するものではありません。',
      level_good: '良好', level_ok: 'ほぼ良好', level_warn: '要改善', level_bad: '問題あり', level_info: '情報',
      dns_error: { t: 'DNSの応答を取得できませんでした', d: '一時的なエラーの可能性があります。少し時間をおいて再度お試しください。' },
      spf_missing: { t: 'SPFレコードがありません', d: 'どのサーバーがあなたのドメインからメールを送ってよいか、受信側が判断できません。', fix: 'ドメインのDNSに、利用しているメールサービスを含むSPFレコード（TXT）を1つ追加してください。' },
      spf_multiple: { t: 'SPFレコードが{n}個あります', d: 'SPFは1ドメインにつき1つだけです。複数あると受信側でエラー（permerror）になり、SPFが無効と同じ扱いになります。', fix: 'すべての送信元を1つのレコードにまとめてください。' },
      spf_all_fail: { t: '許可していないサーバーは拒否（-all）', d: '最も厳格で推奨される設定です。' },
      spf_all_softfail: { t: '許可していないサーバーは「疑わしい」扱い（~all）', d: '一般的な設定です。DMARCと組み合わせれば十分に機能します。' },
      spf_all_neutral: { t: '判定なし（?all）', d: '許可外のサーバーについて何も言っていないのと同じで、なりすまし対策になりません。', fix: '末尾を ~all または -all に変更してください。' },
      spf_all_pass: { t: '全サーバーを許可（+all）', d: '世界中のどのサーバーからでも、あなたのドメインとしてメールを送れる危険な設定です。', fix: '直ちに末尾を -all（または ~all）に変更してください。' },
      spf_no_all: { t: '末尾に all がありません', d: '許可外のサーバーの扱いが決まっていないため、効果が弱くなります。', fix: 'レコードの最後に ~all または -all を追加してください。' },
      spf_redirect: { t: '{to} の設定を利用（redirect）', d: '別ドメインのSPFをそのまま使う設定です。参照先の内容に依存します。' },
      spf_ptr: { t: 'ptr の使用は非推奨です', d: '遅く信頼性が低いため、RFC 7208で使わないよう推奨されています。', fix: 'ptr を削除し、ip4/ip6 や include に置き換えてください。' },
      spf_unknown: { t: '認識できない記述があります：{terms}', d: '書き間違いの可能性があります。受信側によってはエラーになります。', fix: '記述を確認し、正しい形式に修正してください。' },
      spf_too_many: { t: 'DNS参照が{n}回（上限10回を超過）', d: 'include などが多すぎて、受信側でSPFがエラー（permerror）になります。', fix: '使っていないサービスの include を削除するか、ip4/ip6 に置き換えて参照回数を減らしてください。' },
      spf_near_limit: { t: 'DNS参照が{n}回（上限は10回）', d: '上限に近づいています。サービスを追加すると超過する可能性があります。' },
      spf_lookups_ok: { t: 'DNS参照は{n}回（上限10回以内）', d: '問題ありません。' },
      spf_voids: { t: '存在しない参照先が{n}件あります', d: '空振りの参照が2件を超えると、受信側でエラーになる場合があります。', fix: '使われなくなった include を削除してください。' },
      dmarc_missing: { t: 'DMARCレコードがありません', d: 'SPFやDKIMに失敗したメールをどう扱うか決まっていないため、なりすましメールが届いてしまう可能性があります。Gmailなどは大量送信者にDMARCを必須としています。', fix: 'まずは監視モード（p=none）とレポート先（rua）から始め、問題がないことを確認してから quarantine → reject へ強めてください。' },
      dmarc_multiple: { t: 'DMARCレコードが{n}個あります', d: '複数あるとDMARCが無効として扱われます。', fix: '1つにまとめてください。' },
      dmarc_inherited: { t: '親ドメイン {org} の設定が適用されます', d: 'サブドメイン専用のDMARCがないため、親ドメインの sp（なければ p）が使われます。' },
      dmarc_no_p: { t: 'ポリシー（p=）がありません', d: 'p は必須の項目です。', fix: 'p=none／quarantine／reject のいずれかを追加してください。' },
      dmarc_reject: { t: 'なりすましメールは拒否（p=reject）', d: '最も強い保護です。認証に失敗したメールは受信されません。' },
      dmarc_quarantine: { t: 'なりすましメールは迷惑メールへ（p=quarantine）', d: '良い保護です。運用が安定したら reject も検討してください。' },
      dmarc_none: { t: '監視のみ（p=none）', d: 'レポートは受け取れますが、なりすましメールは止まりません。導入初期の設定です。', fix: 'レポートで正規の送信元がすべて認証に通ることを確認し、p=quarantine、その後 p=reject に変更してください。' },
      dmarc_pct: { t: '適用は{pct}%のメールのみ（pct={pct}）', d: '残りのメールにはポリシーが適用されません。', fix: '準備ができたら pct を削除するか 100 にしてください。' },
      dmarc_sp_none: { t: 'サブドメインは監視のみ（sp=none）', d: 'サブドメインを使ったなりすましが止まりません。', fix: '使っていないなら sp=reject を検討してください。' },
      dmarc_rua: { t: '集計レポートの送信先あり（rua）', d: '誰があなたのドメインでメールを送っているか把握できます。' },
      dmarc_no_rua: { t: 'レポートの送信先（rua）がありません', d: '問題や不正な送信に気づけません。', fix: 'rua=mailto:（レポート用アドレス）を追加してください。' },
      dmarc_strict: { t: '厳格な一致モード（adkim/aspf=s）', d: '高い保護ですが、サブドメインから送るサービスがあると失敗することがあります。' },
      dkim_found: { t: 'DKIM鍵を確認：{list}', d: '送信メールに電子署名が付けられる状態です。' },
      dkim_not_found: { t: 'よく使われるセレクタでは見つかりませんでした', d: 'DKIMのセレクタ名はサービスごとに異なるため、未設定とは限りません。届いたメールのヘッダー（DKIM-Signature の s=）でセレクタ名を確認し、下の欄に入力して再診断できます。' },
      dkim_wildcard: { t: 'すべてのセレクタに同じ鍵が返されます（ワイルドカード）', d: '*._domainkey にワイルドカードが設定されています。個別のセレクタが正しく設定されているか、メールのヘッダーで確認してください。' },
      dkim_wildcard_none: { t: 'DKIM鍵がないことを明示しています', d: 'すべてのセレクタに空の鍵（p=）を返す設定です。メールを送信しないドメインでは良い設定です。' },
      dkim_revoked_only: { t: '無効化されたDKIM鍵のみ見つかりました', d: 'p= が空の鍵は無効です。', fix: 'メールサービスの管理画面で新しいDKIM鍵を発行し、DNSに登録してください。' },
      dkim_weak: { t: '短い鍵があります：{list}', d: '2048ビット未満のRSA鍵は弱いとされています。', fix: 'メールサービスで2048ビットの鍵に更新してください。' },
      dkim_testing: { t: 'テストモード（t=y）の鍵があります', d: '受信側が署名の失敗を無視する場合があります。', fix: '動作確認が済んだら t=y を外してください。' },
      mx_ok: { t: '受信サーバー：{list}', d: '' },
      mx_none: { t: 'MXレコードがありません', d: 'このドメインではメールを受信しないようです。送信もしない場合は、SPF「v=spf1 -all」とDMARC「p=reject」でなりすましを防げます。' },
      mx_null: { t: 'メールを受け付けない設定（Null MX）', d: 'メールを使わないドメインとして明示されています。SPF -all と DMARC reject も設定すると万全です。' },
      mtasts_ok: { t: 'MTA-STSが設定されています', d: '受信メールの暗号化（TLS）を強制し、盗聴や改ざんを防ぎます。' },
      mtasts_missing: { t: 'MTA-STSは未設定です', d: '任意ですが、受信メールの暗号化を強制できます。中〜大規模の組織におすすめです。' },
      tlsrpt_ok: { t: 'TLS-RPTが設定されています', d: '暗号化の失敗についてレポートを受け取れます。' },
      tlsrpt_missing: { t: 'TLS-RPTは未設定です', d: '任意です。MTA-STSと合わせて設定すると、問題に早く気づけます。' },
      bimi_ok: { t: 'BIMIが設定されています', d: '対応する受信箱にブランドロゴが表示されます（DMARCの強い設定が前提です）。' },
      bimi_missing: { t: 'BIMIは未設定です', d: '任意です。DMARCを quarantine 以上にした後に検討できます。' },
      selectors_label: 'DKIMセレクタを指定（任意・カンマ区切り）',
      fix_spf_example: 'v=spf1 include:（利用中のメールサービス） -all',
      fix_dmarc_example: 'v=DMARC1; p=none; rua=mailto:dmarc@{domain}',
      record_name: '名前',
    },
    en: {
      title: 'Email Authentication Checker',
      tagline: 'Can someone send email pretending to be your domain? Free check of SPF, DKIM and DMARC.',
      placeholder: 'e.g. example.com',
      check: 'Check',
      checking: 'Checking…',
      privacy: 'Only public DNS data is read. The domain you enter is not stored; the only requests go to DNS-over-HTTPS (Cloudflare / Google).',
      invalid_domain: 'That does not look like a domain name (e.g. example.com).',
      nxdomain: 'This domain does not seem to exist. Check the spelling.',
      network: 'Could not reach DNS. Check your connection and try again.',
      score: 'Overall',
      grade_A: 'Excellent. Your domain is well protected against spoofing.',
      grade_B: 'Good. A few things could be improved.',
      grade_C: 'The basics are there, but spoofed mail is not being stopped.',
      grade_D: 'Weak. Others can send email pretending to be your domain.',
      grade_F: 'Almost no protection. Setting this up soon is recommended.',
      sec_spf: 'SPF (which servers may send)',
      sec_dmarc: 'DMARC (what to do with spoofed mail)',
      sec_dkim: 'DKIM (digital signature)',
      sec_mx: 'MX (where mail is received)',
      sec_mtasts: 'MTA-STS (enforced encryption)',
      sec_tlsrpt: 'TLS-RPT (encryption failure reports)',
      sec_bimi: 'BIMI (logo in the inbox)',
      record: 'Record found',
      fix: 'How to fix',
      copy: 'Copy',
      copied: 'Copied',
      suggested: 'Example (adjust to your own setup)',
      lang: '日本語',
      footer: 'Made by Slettvold Security. Results are guidance and do not catch every misconfiguration.',
      level_good: 'Good', level_ok: 'Mostly good', level_warn: 'Improve', level_bad: 'Problem', level_info: 'Info',
      dns_error: { t: 'Could not get a DNS answer', d: 'This may be temporary. Please try again in a moment.' },
      spf_missing: { t: 'No SPF record', d: 'Receivers cannot tell which servers are allowed to send mail for your domain.', fix: 'Add one SPF (TXT) record that includes the mail services you use.' },
      spf_multiple: { t: '{n} SPF records found', d: 'A domain may have only one. With several, receivers return an error (permerror) and SPF is treated as broken.', fix: 'Merge all senders into a single record.' },
      spf_all_fail: { t: 'Unlisted servers are rejected (-all)', d: 'The strictest, recommended setting.' },
      spf_all_softfail: { t: 'Unlisted servers are marked suspicious (~all)', d: 'A common setting. Works well together with DMARC.' },
      spf_all_neutral: { t: 'No verdict (?all)', d: 'This says nothing about unlisted servers, so it does not stop spoofing.', fix: 'Change the ending to ~all or -all.' },
      spf_all_pass: { t: 'Every server is allowed (+all)', d: 'Any server in the world can send mail as your domain. This is dangerous.', fix: 'Change the ending to -all (or ~all) right away.' },
      spf_no_all: { t: 'No "all" at the end', d: 'Unlisted servers have no defined outcome, which weakens the record.', fix: 'End the record with ~all or -all.' },
      spf_redirect: { t: 'Uses the policy of {to} (redirect)', d: 'Your SPF depends on what that domain publishes.' },
      spf_ptr: { t: '"ptr" is deprecated', d: 'It is slow and unreliable; RFC 7208 says not to use it.', fix: 'Remove ptr and use ip4/ip6 or include instead.' },
      spf_unknown: { t: 'Unrecognised terms: {terms}', d: 'Possibly a typo. Some receivers will treat this as an error.', fix: 'Check the syntax and correct it.' },
      spf_too_many: { t: '{n} DNS lookups (limit is 10)', d: 'Too many includes: receivers return an error (permerror) and SPF fails.', fix: 'Remove includes for services you no longer use, or replace them with ip4/ip6 ranges.' },
      spf_near_limit: { t: '{n} DNS lookups (limit is 10)', d: 'Close to the limit. Adding another service may push it over.' },
      spf_lookups_ok: { t: '{n} DNS lookups (within the limit of 10)', d: 'No problem.' },
      spf_voids: { t: '{n} lookups point to names that do not exist', d: 'More than two empty lookups can make receivers return an error.', fix: 'Remove includes that are no longer used.' },
      dmarc_missing: { t: 'No DMARC record', d: 'Nothing tells receivers what to do with mail that fails SPF and DKIM, so spoofed mail can get through. Gmail and others require DMARC for bulk senders.', fix: 'Start in monitoring mode (p=none) with a report address (rua), check the reports, then move to quarantine and finally reject.' },
      dmarc_multiple: { t: '{n} DMARC records found', d: 'With more than one, DMARC is ignored.', fix: 'Keep a single record.' },
      dmarc_inherited: { t: 'Policy inherited from {org}', d: 'This subdomain has no DMARC record of its own, so the parent domain\'s sp (or p) applies.' },
      dmarc_no_p: { t: 'No policy (p=)', d: 'The p tag is required.', fix: 'Add p=none, quarantine or reject.' },
      dmarc_reject: { t: 'Spoofed mail is rejected (p=reject)', d: 'The strongest protection: mail that fails authentication is refused.' },
      dmarc_quarantine: { t: 'Spoofed mail goes to spam (p=quarantine)', d: 'Good protection. Consider reject once things are stable.' },
      dmarc_none: { t: 'Monitoring only (p=none)', d: 'You get reports, but spoofed mail is still delivered. This is a starting setting.', fix: 'Use the reports to confirm all your real senders pass, then move to p=quarantine and later p=reject.' },
      dmarc_pct: { t: 'Applied to only {pct}% of mail (pct={pct})', d: 'The rest is not covered by the policy.', fix: 'Remove pct or set it to 100 when ready.' },
      dmarc_sp_none: { t: 'Subdomains are monitor-only (sp=none)', d: 'Spoofing via subdomains is not stopped.', fix: 'If you do not send from subdomains, consider sp=reject.' },
      dmarc_rua: { t: 'Aggregate reports are enabled (rua)', d: 'You can see who is sending mail using your domain.' },
      dmarc_no_rua: { t: 'No report address (rua)', d: 'You will not notice problems or abuse.', fix: 'Add rua=mailto:(a reporting address).' },
      dmarc_strict: { t: 'Strict alignment (adkim/aspf=s)', d: 'Strong, but can fail for services that send from subdomains.' },
      dkim_found: { t: 'DKIM keys found: {list}', d: 'Outgoing mail can be signed.' },
      dkim_not_found: { t: 'Not found with common selectors', d: 'DKIM selector names differ per service, so this does not mean DKIM is missing. Look at the DKIM-Signature header (s=) of a mail you sent and enter the selector below to check again.' },
      dkim_wildcard: { t: 'Every selector returns the same key (wildcard)', d: 'A wildcard is set on *._domainkey. Check a sent message\'s headers to confirm your real selector works.' },
      dkim_wildcard_none: { t: 'Declares that no DKIM keys exist', d: 'Every selector returns an empty key (p=). This is good practice for a domain that never sends mail.' },
      dkim_revoked_only: { t: 'Only revoked DKIM keys found', d: 'A key with an empty p= is disabled.', fix: 'Create a new DKIM key in your mail service and publish it in DNS.' },
      dkim_weak: { t: 'Short keys: {list}', d: 'RSA keys under 2048 bits are considered weak.', fix: 'Rotate to a 2048-bit key in your mail service.' },
      dkim_testing: { t: 'A key is in test mode (t=y)', d: 'Receivers may ignore failed signatures.', fix: 'Remove t=y once you have verified it works.' },
      mx_ok: { t: 'Receiving servers: {list}', d: '' },
      mx_none: { t: 'No MX record', d: 'This domain does not seem to receive mail. If it also never sends mail, publish SPF "v=spf1 -all" and DMARC "p=reject" to stop spoofing.' },
      mx_null: { t: 'Accepts no mail (null MX)', d: 'Declared as a domain that does not use email. Add SPF -all and DMARC reject as well to be fully covered.' },
      mtasts_ok: { t: 'MTA-STS is set up', d: 'Incoming mail must use encryption (TLS), which blocks eavesdropping and tampering.' },
      mtasts_missing: { t: 'No MTA-STS', d: 'Optional. Enforces encryption for incoming mail; recommended for medium and larger organisations.' },
      tlsrpt_ok: { t: 'TLS-RPT is set up', d: 'You receive reports about encryption failures.' },
      tlsrpt_missing: { t: 'No TLS-RPT', d: 'Optional. Together with MTA-STS it helps you notice problems early.' },
      bimi_ok: { t: 'BIMI is set up', d: 'Supporting inboxes can show your logo (requires a strong DMARC policy).' },
      bimi_missing: { t: 'No BIMI', d: 'Optional. Worth considering once DMARC is at quarantine or stronger.' },
      selectors_label: 'DKIM selectors (optional, comma-separated)',
      fix_spf_example: 'v=spf1 include:(your mail service) -all',
      fix_dmarc_example: 'v=DMARC1; p=none; rua=mailto:dmarc@{domain}',
      record_name: 'Name',
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
  else root.MailShieldText = M;
})(typeof window !== 'undefined' ? window : globalThis);

/* Mail Shield page UI for slettvold.org. Static text lives in the page (pages/en|ja/tools__mail.html);
   this renders results into #ms-out with the site's own classes and tokens. Language = <html lang>. */
(function () {
  'use strict';
  const MS = window.MailShield, TX = window.MailShieldText;
  const form = document.getElementById('ms-form');
  if (!form || !MS || !TX) return;
  const lang = document.documentElement.lang === 'ja' ? 'ja' : 'en';
  const T = k => TX[lang][k];
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fill = (s, v) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => v && v[k] !== undefined ? v[k] : '');
  const RANK = { bad: 4, warn: 3, ok: 2, info: 1, good: 0 };
  const NAMES = { spf: 'SPF', dmarc: 'DMARC', dkim: 'DKIM', mtasts: 'MTA-STS', tlsrpt: 'TLS-RPT', mx: 'MX', bimi: 'BIMI' };
  const ORDER = ['dmarc', 'spf', 'dkim', 'mtasts', 'tlsrpt', 'mx', 'bimi'];
  let last = null, sample = false;

  function status(r) {
    if (r.score === null) return 'info';
    let worst = 'good';
    for (const f of r.findings) if (RANK[f.level] > RANK[worst]) worst = f.level;
    if (worst === 'info') return r.max && r.score === r.max ? 'good' : 'info';
    return worst;
  }

  function zoneLines(r, domain) {
    const q = s => '"' + s.replace(/"/g, '\\"') + '"';
    const at = { spf: domain, mtasts: '_mta-sts.' + domain, tlsrpt: '_smtp._tls.' + domain, bimi: 'default._bimi.' + domain };
    if (r.key === 'dmarc') return r.records.map(x => [r.where + '.', 'TXT', q(x)]);
    if (r.key === 'dkim') return r.found.map(x => [x.selector + '._domainkey.' + domain + '.', 'TXT', q(x.record.length > 90 ? x.record.slice(0, 87) + '…' : x.record)]);
    if (r.key === 'mx') return r.records.map(x => [domain + '.', 'MX', x]);
    return (r.records || []).map(x => [at[r.key] + '.', 'TXT', q(x)]);
  }

  function suggestion(r, domain) {
    if (r.key === 'spf' && r.findings.some(f => f.id === 'spf_missing')) return [[domain + '.', 'TXT', '"' + T('fix_spf_example') + '"']];
    if (r.key === 'dmarc' && r.findings.some(f => f.id === 'dmarc_missing')) return [['_dmarc.' + domain + '.', 'TXT', '"' + fill(T('fix_dmarc_example'), { domain }) + '"']];
    return null;
  }

  function zone(rows, label) {
    const plain = rows.map(r => r.join('\t')).join('\n');
    const lines = rows.map(r => '<span class="nm">' + esc(r[0]) + '</span>  <span class="ty">' + esc(r[1]) + '</span>  ' + esc(r[2])).join('\n');
    return '<div class="ms-zone-wrap"><div class="ms-label">' + esc(label) + '</div><div class="ms-zone"><pre>' + lines
      + '</pre><button type="button" class="ms-copy" data-copy="' + esc(plain) + '">' + esc(T('copy')) + '</button></div></div>';
  }

  function render() {
    const out = $('ms-out');
    if (!last) { out.innerHTML = ''; return; }
    if (last.error) { out.innerHTML = '<p class="ms-msg">' + esc(T(last.error) || T('network')) + '</p>'; return; }
    const g = last.grade;
    const when = new Date(last.checkedAt).toLocaleString(lang === 'ja' ? 'ja-JP' : 'en-GB');
    const rs = ORDER.map(k => last.results.find(r => r.key === k));
    let h = '<section class="ms-summary g-' + g.letter + '" aria-label="' + esc(T('score')) + '">'
      + '<div class="ms-seal" aria-label="' + esc(T('score') + ' ' + g.letter) + '"><b>' + g.letter + '</b><i>' + g.pct + '/100</i></div>'
      + '<div class="ms-sum"><div class="ms-domain">' + esc(last.domain)
      + (sample ? ' <span class="tag ms-sample">' + (lang === 'ja' ? 'サンプル' : 'Example') + '</span>' : '') + '</div>'
      + '<p class="ms-verdict">' + esc(T('grade_' + g.letter)) + '</p><div class="ms-chips">'
      + rs.map(r => '<a class="ms-chip lv-' + status(r) + '" href="#ms-' + r.key + '">' + NAMES[r.key] + '</a>').join('')
      + '</div><div class="small">' + esc(when) + '</div></div></section>';
    for (const r of rs) {
      const st = status(r);
      h += '<section class="ms-check" id="ms-' + r.key + '"><h2>' + esc(T('sec_' + r.key)) + ' <span class="ms-pill lv-' + st + '">' + esc(T('level_' + st)) + '</span></h2>';
      const z = zoneLines(r, last.domain);
      if (z.length) h += zone(z, T('record'));
      h += '<ul class="ms-findings">' + r.findings.map(fd => {
        const m = T(fd.id) || {};
        return '<li class="lv-' + fd.level + '"><div><div class="ms-ft"><span class="ms-lv">' + esc(T('level_' + fd.level)) + '</span>' + esc(fill(m.t, fd.vars)) + '</div>'
          + (m.d ? '<p class="ms-fd">' + esc(fill(m.d, fd.vars)) + '</p>' : '')
          + (m.fix ? '<p class="ms-fix"><b>' + esc(T('fix')) + '</b>' + esc(fill(m.fix, fd.vars)) + '</p>' : '') + '</div></li>';
      }).join('') + '</ul>';
      const s = suggestion(r, last.domain);
      if (s) h += zone(s, T('suggested'));
      h += '</section>';
    }
    out.innerHTML = h;
  }

  $('ms-out').addEventListener('click', e => {
    const b = e.target.closest('.ms-copy'); if (!b) return;
    const done = () => { b.textContent = T('copied'); setTimeout(() => { b.textContent = T('copy'); }, 1500); };
    const select = () => { const rg = document.createRange(); rg.selectNodeContents(b.parentNode.querySelector('pre')); const s = getSelection(); s.removeAllRanges(); s.addRange(rg); };
    try { navigator.clipboard.writeText(b.getAttribute('data-copy')).then(done, select); } catch (err) { select(); }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const go = $('ms-go'), label = go.textContent;
    const sels = $('ms-selectors').value.split(/[\s,、]+/).map(s => s.trim().toLowerCase()).filter(s => /^[a-z0-9._-]{1,63}$/.test(s));
    go.disabled = true; go.innerHTML = '<span class="ms-spin" aria-hidden="true"></span>' + esc(T('checking'));
    try {
      const res = await MS.checkDomain($('ms-domain').value, MS.dohResolver(), { selectors: sels });
      const failed = k => res.results && res.results.find(r => r.key === k).findings.some(f => f.id === 'dns_error');
      last = !res.error && failed('mx') && failed('spf') && failed('dmarc') ? { error: 'network' } : res;
    } catch (err) { last = { error: 'network' }; }
    sample = false; go.disabled = false; go.textContent = label;
    render();
    const top = $('ms-out').firstElementChild;
    if (top) top.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  // Opening state: a clearly marked example, so visitors see what they will get before typing.
  const KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA' + 'q'.repeat(300) + 'IDAQAB';
  const EX = {
    'example.co.jp MX': ['10 aspmx.l.google.com.'],
    'example.co.jp TXT': ['v=spf1 include:_spf.google.com include:mail.zendesk.com ~all'],
    '_spf.google.com TXT': ['v=spf1 include:_netblocks.google.com include:_netblocks2.google.com include:_netblocks3.google.com ~all'],
    'mail.zendesk.com TXT': ['v=spf1 ip4:192.0.2.0/24 ~all'],
    '_netblocks.google.com TXT': ['v=spf1 ip4:198.51.100.0/24 ~all'],
    '_netblocks2.google.com TXT': ['v=spf1 ip6:2001:db8::/32 ~all'],
    '_netblocks3.google.com TXT': ['v=spf1 ip4:203.0.113.0/24 ~all'],
    '_dmarc.example.co.jp TXT': ['v=DMARC1; p=none; rua=mailto:dmarc@example.co.jp'],
    'google._domainkey.example.co.jp TXT': ['v=DKIM1; k=rsa; p=' + KEY],
  };
  MS.checkDomain('example.co.jp', async (n, t) => ({ status: 'ok', answers: EX[n.toLowerCase() + ' ' + t] || [] }))
    .then(r => { if (!last) { last = r; sample = true; render(); } });
})();

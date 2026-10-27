(() => {
"use strict";
const KEY2 = "rireki-studio-v2", KEY1 = "rireki-studio-v1";
const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lines = s => String(s || "").split("\n").map(x => x.trim()).filter(Boolean);
const todayISO = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().slice(0,10); };
const uid = () => Math.random().toString(36).slice(2,9);
const MM = 3.7795;

/* =================== UI text =================== */
const T = {
en:{
 nav_builder:"Builder", nav_guide:"Guide", view_edit:"Edit", view_preview:"Preview",
 s_basic:"Profile", s_avail:"Work hours", s_edu:"Education", s_work:"Work history", s_lic:"Licenses & skills", s_pr:"PR & wishes", s_doc:"Settings",
 sj_basic:"基本情報", sj_avail:"勤務条件", sj_edu:"学歴", sj_work:"職歴", sj_lic:"資格・スキル", sj_pr:"自己PR・希望", sj_doc:"設定",
 step:"Step {n} of {m}", read_guide:"How to write this →",
 d_check:"Check", btn_pdf:"Save PDF", btn_io:"Import / Export",
 example_pill:"Example data. Replace it with your own, or start a new CV from the CV menu.",
 add:"Add", remove:"Remove", remove2:"Tap again", up:"Move up", down:"Move down",
 f_nameJa:"Name", h_nameJa:"As in your passport, family name first in capitals: SLETTVOLD Tommy André.",
 f_nameKana:"Name reading (furigana)", h_nameKana:"Katakana, family name first, a space between names. The heading switches to フリガナ automatically.",
 f_birth:"Date of birth", f_gender:"Gender", g_male:"Male", g_female:"Female", g_none:"Leave blank",
 h_gender:"Optional on the 2021 government form.",
 f_nationality:"Nationality", f_postal:"Postal code", f_address:"Address",
 h_address:"Largest to smallest: country → prefecture → city → street. Add the romanized address on a second line if you like.",
 f_addressKana:"Address reading", h_addressKana:"Only if the address has kanji.",
 f_phone:"Phone", f_email:"Email", f_url:"LinkedIn / portfolio",
 f_contact:"Other contact address", h_contact:"Leave empty to print 同上 (same as above).",
 f_photo:"Photo", h_photo:"Taken within 3 months, plain background, 3:4 (30×40 mm). Formal clothing is expected. It is cropped to 3:4 for you.",
 photo_add:"Choose photo", photo_remove:"Remove photo",
 visa_title:"Residence status", f_visaStatus:"Status of residence (在留資格)", f_visaExpiry:"Valid until",
 f_permit:"Work permission (資格外活動許可)", permit_yes:"Granted", permit_applying:"Applied / will apply", permit_no:"Not needed",
 h_permit:"Students need this before starting any part-time job. You can apply at the airport when you arrive.",
 mode_label:"What are you applying for?", mode_full:"Full-time job", mode_baito:"Part-time (アルバイト)",
 h_mode:"Part-time mode adds visa status, work hours and nearest station, and hides the 職務経歴書, which part-time jobs rarely ask for.",
 edu_hint:"Oldest first, usually from high school. Write the school's official name and add the country for schools abroad.",
 f_school:"School", f_dept:"Faculty / course", f_start:"Start (YYYY-MM)", f_end:"End (YYYY-MM)", f_endType:"Status",
 et_grad:"Graduated 卒業", et_comp:"Completed 修了", et_expect:"Expected 卒業見込み", et_drop:"Left 中退", et_current:"Enrolled 在学中",
 work_hint:"Leave End empty for your current job. The 履歴書 lists dates only; the 職務経歴書 shows the details.",
 f_company:"Company", f_startWord:"Start word", h_startWord:"入社 for companies, 入隊 for military, 活動開始 for freelance.",
 f_business:"Business (事業内容)", f_employment:"Employment type", f_location:"Location", f_role:"Position / title",
 f_summary:"Overview", f_duties:"Main duties (one per line)", h_duties:"Short noun phrases, one per line.",
 f_achieve:"Results (one per line)", h_achieve:"Recruiters look for numbers: cases per day, % improvement, ratings.",
 f_leave:"Leaving reason", h_leave:"Shown on the 履歴書. Most people write 一身上の都合により退職.",
 lic_hint:"Official names, oldest first. Include driving licences and JLPT if passed.",
 f_licDate:"Date", f_licName:"Licence / qualification", lang_title:"Languages", f_langName:"Language", f_langLevel:"Level",
 f_skills:"Skills (one per line)", h_skills:"Group them as カテゴリ：item, item. Shown in the 職務経歴書.",
 f_jobSummary:"Career summary 職務要約", h_jobSummary:"3–5 sentences at the top of the 職務経歴書: years, field, main strengths.",
 f_pr:"Self-PR 自己PR", h_pr:"2–3 strengths, each backed by an example.",
 f_motivation:"Motivation 志望動機", h_motivation:"Write a new one for each company. Printed first in the 履歴書 PR box.",
 f_wishes:"Requests 本人希望記入欄", h_wishes:"If you have no conditions, write 貴社規定に従います。 Mention visa support here.",
 f_commute:"Commute time", f_dependents:"Dependents (excl. spouse)", f_spouse:"Spouse", f_spouseSupport:"Support obligation for spouse", yes:"Yes", no:"No",
 avail_hint:"Tick the days you can work. Students may work up to 28 hours a week during term and up to 8 hours a day in long holidays.",
 f_availNote:"Notes on hours", f_startAvail:"Can start from", f_station:"Nearest station (最寄駅)", h_station:"Line and station, e.g. JR山手線 高田馬場駅.",
 total:"Total", hpw:"h/week",
 f_docDate:"Document date", h_docDate:"Use the date you send it. An old date stands out.",
 f_form:"Form style", form_mhlw:"Government form 2021 (recommended)", form_jis:"Classic JIS form",
 h_form:"The 2021 form from the Ministry of Health, Labour and Welfare drops commute, dependents and spouse. Part-time mode always shows station and commute.",
 f_era:"Year format", era_w:"Western 2026年", era_j:"Japanese era 令和8年", h_era:"Either is fine. Use one throughout both documents.",
 f_font:"Paper typeface", font_m:"Mincho (serif, traditional)", font_g:"Gothic (sans-serif, modern)",
 f_order:"Work history order (職務経歴書)", ord_desc:"Newest first (逆編年体)", ord_asc:"Oldest first (編年体)", h_order:"Newest first suits most people whose recent job is the most relevant.",
 cvs_title:"My CVs", cvs_hint:"Keep one CV per purpose, for example full-time and part-time. Everything is saved in this browser only.",
 cv_new:"New blank CV", cv_example:"Add example CV", cv_open:"Open", cv_dup:"Duplicate", cv_del:"Delete", cv_current:"Open now", cv_copy:"copy",
 untitled_cv:"Untitled CV", edited:"Edited",
 io_title:"Import / Export", io_hint:"Save a backup file, move your CVs to another device, or open a file someone shared with you.",
 io_file:"Open file…", io_save_one:"Save this CV", io_save_all:"Save all CVs", io_text:"Copy as text instead",
 io_text_hint:"Use this if file saving is blocked. Paste text here and choose Load to import.", io_copy:"Copy text", io_load:"Load text", close:"Close",
 copied:"Copied", imported:"Imported {n} CV(s)", import_err:"That is not Rireki Studio data. Check that you chose the right file.",
 saved:"Saved", declined:"Save cancelled", pdf_hint:"In the print window, choose \u201cSave as PDF\u201d as the printer.", pdf_fail:"Could not build the PDF here. Open Rireki Studio on slettvold.org to save it.",
 save_fail:"Saving files is not available here. Use Copy text instead.",
 untitled:"(untitled)", ck_none:"No problems found. Read it through once more before you send it.",
 lv_err:"FIX", lv_warn:"CHECK", lv_tip:"TIP", cur:"current"
},
ja:{
 nav_builder:"作成", nav_guide:"ガイド", view_edit:"編集", view_preview:"プレビュー",
 s_basic:"基本情報", s_avail:"勤務条件", s_edu:"学歴", s_work:"職歴", s_lic:"資格・スキル", s_pr:"自己PR・希望", s_doc:"設定",
 sj_basic:"Profile", sj_avail:"Work hours", sj_edu:"Education", sj_work:"Work history", sj_lic:"Licenses", sj_pr:"PR", sj_doc:"Settings",
 step:"ステップ {n} / {m}", read_guide:"書き方を見る →",
 d_check:"チェック", btn_pdf:"PDFで保存", btn_io:"読込・書出",
 example_pill:"記入例です。ご自身の情報に書き換えるか、メニューから新しい履歴書を作成してください。",
 add:"追加", remove:"削除", remove2:"もう一度", up:"上へ", down:"下へ",
 f_nameJa:"氏名", h_nameJa:"パスポート表記で、姓を先に大文字で（例：SLETTVOLD Tommy André）。",
 f_nameKana:"ふりがな", h_nameKana:"カタカナで姓を先に、名前の間はスペース。カタカナを入力すると見出しは自動で「フリガナ」になります。",
 f_birth:"生年月日", f_gender:"性別", g_male:"男", g_female:"女", g_none:"記入しない", h_gender:"2021年の厚生労働省様式では任意記入です。",
 f_nationality:"国籍", f_postal:"郵便番号", f_address:"現住所", h_address:"国→都道府県・州→市→番地の順。2行目にローマ字表記を添えても構いません。",
 f_addressKana:"住所ふりがな", h_addressKana:"漢字を含む場合のみ。", f_phone:"電話", f_email:"メールアドレス", f_url:"LinkedIn・ポートフォリオ",
 f_contact:"連絡先（現住所以外）", h_contact:"空欄の場合は「同上」と印字されます。",
 f_photo:"写真", h_photo:"3か月以内に撮影、無地の背景、縦横比3:4（30×40mm）。スーツ着用が一般的です。自動で3:4に切り抜きます。",
 photo_add:"写真を選択", photo_remove:"写真を削除",
 visa_title:"在留資格", f_visaStatus:"在留資格", f_visaExpiry:"在留期限",
 f_permit:"資格外活動許可", permit_yes:"取得済", permit_applying:"申請中・申請予定", permit_no:"不要",
 h_permit:"留学生はアルバイト開始前に取得が必要です。入国時に空港で申請できます。",
 mode_label:"応募の種類", mode_full:"正社員・フルタイム", mode_baito:"アルバイト",
 h_mode:"アルバイトモードでは在留資格・勤務可能時間・最寄駅の欄が加わり、通常不要な職務経歴書は非表示になります。",
 edu_hint:"古い順に、一般的には高校から記入します。学校名は正式名称で。海外の学校には国名を添えます。",
 f_school:"学校名", f_dept:"学部・学科・コース", f_start:"開始（年-月）", f_end:"終了（年-月）", f_endType:"区分",
 et_grad:"卒業", et_comp:"修了", et_expect:"卒業見込み", et_drop:"中退", et_current:"在学中",
 work_hint:"現職は終了を空欄に。履歴書には年月のみ、詳細は職務経歴書に記載されます。",
 f_company:"会社名", f_startWord:"開始の表記", h_startWord:"会社は「入社」、軍は「入隊」、個人活動は「活動開始」。",
 f_business:"事業内容", f_employment:"雇用形態", f_location:"勤務地", f_role:"職種・役職",
 f_summary:"概要", f_duties:"主な業務（1行に1項目）", h_duties:"体言止めで簡潔に。", f_achieve:"実績・成果（1行に1項目）",
 h_achieve:"件数・改善率・評価など、数字で示すと伝わりやすくなります。",
 f_leave:"退職理由", h_leave:"履歴書に記載。一般的には「一身上の都合により退職」。",
 lic_hint:"正式名称で古い順に。運転免許、合格したJLPTも記入しましょう。",
 f_licDate:"取得年月", f_licName:"免許・資格", lang_title:"語学", f_langName:"言語", f_langLevel:"レベル",
 f_skills:"スキル（1行に1項目）", h_skills:"「カテゴリ：項目、項目」の形でまとめると読みやすくなります。",
 f_jobSummary:"職務要約", h_jobSummary:"職務経歴書の冒頭。経験年数・分野・強みを3〜5文で。",
 f_pr:"自己PR", h_pr:"強みを2〜3点、それぞれ具体例とともに。",
 f_motivation:"志望動機", h_motivation:"応募先ごとに書き直しましょう。履歴書のPR欄の先頭に入ります。",
 f_wishes:"本人希望記入欄", h_wishes:"特になければ「貴社規定に従います。」ビザ支援の希望もここに。",
 f_commute:"通勤時間", f_dependents:"扶養家族数（配偶者を除く）", f_spouse:"配偶者", f_spouseSupport:"配偶者の扶養義務", yes:"有", no:"無",
 avail_hint:"勤務できる曜日にチェックを入れてください。留学生は授業期間中は週28時間以内、長期休暇中は1日8時間以内で勤務できます。",
 f_availNote:"勤務時間の補足", f_startAvail:"勤務開始可能日", f_station:"最寄駅", h_station:"路線名と駅名（例：JR山手線 高田馬場駅）",
 total:"合計", hpw:"時間／週",
 f_docDate:"作成日", h_docDate:"提出日の日付に。古い日付は目立ちます。",
 f_form:"様式", form_mhlw:"厚生労働省様式（2021年・推奨）", form_jis:"従来のJIS様式",
 h_form:"厚生労働省様式では通勤時間・扶養家族・配偶者欄がありません。アルバイトモードでは最寄駅と通勤時間を常に表示します。",
 f_era:"年の表記", era_w:"西暦（2026年）", era_j:"和暦（令和8年）", h_era:"どちらでも構いませんが、両方の書類で統一しましょう。",
 f_font:"書体", font_m:"明朝体（伝統的）", font_g:"ゴシック体（現代的）",
 f_order:"職務経歴書の並び順", ord_desc:"新しい順（逆編年体）", ord_asc:"古い順（編年体）", h_order:"直近の職務が応募先に近い場合は新しい順が一般的です。",
 cvs_title:"履歴書の管理", cvs_hint:"正社員用とアルバイト用など、目的ごとに分けて保存できます。データはこのブラウザ内にのみ保存されます。",
 cv_new:"新規作成", cv_example:"記入例を追加", cv_open:"開く", cv_dup:"複製", cv_del:"削除", cv_current:"表示中", cv_copy:"コピー",
 untitled_cv:"無題の履歴書", edited:"更新",
 io_title:"読込・書出", io_hint:"バックアップの保存、別の端末への移行、共有されたファイルの読み込みができます。",
 io_file:"ファイルを開く…", io_save_one:"この履歴書を保存", io_save_all:"すべて保存", io_text:"テキストでコピーする",
 io_text_hint:"ファイル保存ができない場合にご利用ください。テキストを貼り付けて「読込」を押すと取り込めます。", io_copy:"テキストをコピー", io_load:"読込", close:"閉じる",
 copied:"コピーしました", imported:"{n}件読み込みました", import_err:"Rireki Studio のデータではありません。ファイルをご確認ください。",
 saved:"保存しました", declined:"保存をキャンセルしました", pdf_hint:"印刷画面でプリンターに「PDFに保存」を選んでください。", pdf_fail:"ここではPDFを作成できませんでした。slettvold.org 版をご利用ください。",
 save_fail:"ここではファイルを保存できません。テキストのコピーをご利用ください。",
 untitled:"（未入力）", ck_none:"問題は見つかりませんでした。送付前にもう一度通読しましょう。",
 lv_err:"要修正", lv_warn:"注意", lv_tip:"ヒント", cur:"現在"
}};
let lang = "en";
const t = (k, v) => { let s = T[lang][k] ?? T.en[k] ?? k; if (v) for (const [a,b] of Object.entries(v)) s = s.replace(`{${a}}`, b); return s; };

/* =================== data =================== */
const DAYS = [["mon","月","Mon"],["tue","火","Tue"],["wed","水","Wed"],["thu","木","Thu"],["fri","金","Fri"],["sat","土","Sat"],["sun","日","Sun"]];
const blank = () => ({
  app:"rireki-studio", version:2, isExample:false,
  meta:{docDate:todayISO(), order:"desc", mode:"full", form:"mhlw", era:"w", font:"m"},
  visa:{status:"",expiry:"",permit:"no"},
  baito:{start:"",station:"",note:"",days:{}},
  personal:{nameJa:"",nameKana:"",birth:"",gender:"none",nationality:"",postal:"",address:"",addressKana:"",phone:"",email:"",url:"",contact:"",photo:""},
  education:[], work:[], licenses:[], languages:[], skills:"",
  jobSummary:"", pr:"", motivation:"", wishes:"貴社規定に従います。",
  extra:{commute:"",dependents:"0",spouse:"no",spouseSupport:"no"}
});
const EXAMPLE = {
  isExample:true, meta:{order:"desc", mode:"full", form:"mhlw"},
  personal:{nameJa:"LINDQVIST Emma", nameKana:"リンドクヴィスト エマ", birth:"1995-06-12", gender:"female", nationality:"スウェーデン",
    postal:"111 43", address:"スウェーデン王国 ストックホルム市 クングスガータン12\n(Kungsgatan 12, 111 43 Stockholm, Sweden)",
    phone:"+46 70 123 45 67", email:"emma.lindqvist@example.com"},
  education:[
    {start:"2011-08",end:"2014-06",school:"Södra Latin高等学校（スウェーデン）",dept:"自然科学プログラム",endType:"卒業"},
    {start:"2014-08",end:"2017-06",school:"ストックホルム大学",dept:"コンピュータ・システム科学科（学士）",endType:"卒業"}],
  work:[
    {start:"2017-09",end:"2021-03",company:"Nordvik Digital AB",startWord:"入社",business:"Webサイト・アプリの受託開発",employment:"正社員",location:"ストックホルム",
      role:"Webデザイナー",summary:"小売・観光業界のクライアント向けWebサイトのデザインを担当。",
      duties:"クライアントへのヒアリングと要件整理\nワイヤーフレーム・UIデザインの作成\nHTML/CSSによるコーディング",
      achieve:"担当サイト12件をリリース\n観光案内サイトのリニューアルで問い合わせ数を前年比30％増加",leave:"一身上の都合により退職"},
    {start:"2021-04",end:"",company:"Fjällsjö Software AB",startWord:"入社",business:"業務用SaaSの開発・販売（従業員約80名）",employment:"正社員",location:"ストックホルム（一部リモート）",
      role:"UXデザイナー",summary:"在庫管理SaaSのUX改善をリードし、ユーザー調査からデザインシステム運用までを担当。",
      duties:"ユーザーインタビュー・ユーザビリティテストの設計と実施\nFigmaでのUIデザインとプロトタイプ作成\nデザインシステムの構築・運用",
      achieve:"発注画面の改修により操作時間を平均40％短縮\nデザインシステム導入で開発チームの実装工数を約20％削減",leave:""}],
  licenses:[{date:"2014-08",name:"普通自動車運転免許（スウェーデン）"},{date:"2024-12",name:"日本語能力試験 N3 合格"}],
  languages:[{name:"スウェーデン語",level:"母語"},{name:"英語",level:"ビジネスレベル"},{name:"日本語",level:"日常会話レベル（JLPT N3）"}],
  skills:"デザイン：Figma、Adobe XD、Illustrator\nリサーチ：ユーザーインタビュー、ユーザビリティテスト、アクセシビリティ評価（WCAG）\n開発：HTML、CSS、JavaScriptの基礎",
  jobSummary:"Web制作会社でWebデザイナーとして約3年半、その後SaaS企業でUXデザイナーとして約5年間、ユーザー調査からUIデザイン、デザインシステムの運用までを一貫して担当してまいりました。数値で効果を検証しながら改善を重ねることを得意としております。",
  pr:"【ユーザー調査に基づく改善】現職では年間30件以上のユーザーインタビューを実施し、その結果をもとに発注画面を改修した結果、操作時間を平均40％短縮しました。\n【チームとの協働】エンジニアと週次でデザインレビューを行い、デザインシステムを整備することで実装工数の削減に貢献しました。",
  wishes:"貴社規定に従います。\n就労ビザの取得にあたり、ご支援いただけますと幸いです。"
};
const clone = o => JSON.parse(JSON.stringify(o));
function normalize(d){
  d = d || {};
  const out = Object.assign(blank(), d);
  for (const k of ["meta","visa","personal","extra"]) out[k] = Object.assign(blank()[k], d[k] || {});
  out.baito = Object.assign(blank().baito, d.baito || {});
  out.baito.days = Object.assign({}, d.baito?.days || {});
  for (const [k] of DAYS) out.baito.days[k] = Object.assign({on:false,from:"",to:""}, out.baito.days[k] || {});
  for (const k of ["education","work","licenses","languages"]) if (!Array.isArray(out[k])) out[k] = [];
  if (!out.meta.docDate) out.meta.docDate = todayISO();
  out.app = "rireki-studio"; out.version = 2;
  return out;
}
const nameFor = d => (d.personal?.nameJa || "").trim();

/* store: several CVs */
let store, S;
function loadStore(){
  try {
    const raw = localStorage.getItem(KEY2);
    if (raw){ const s = JSON.parse(raw); if (s && s.profiles && Object.keys(s.profiles).length) return s; }
    const v1 = localStorage.getItem(KEY1);
    if (v1){ const id = uid(); const d = normalize(JSON.parse(v1)); return {active:id, profiles:{[id]:{name:nameFor(d) || "My CV", updated:Date.now(), data:d}}}; }
  } catch(e){}
  const id = uid();
  return {active:id, profiles:{[id]:{name:"Example · Emma", updated:Date.now(), data:normalize(clone(EXAMPLE))}}};
}
store = loadStore();
if (!store.profiles[store.active]) store.active = Object.keys(store.profiles)[0];
for (const p of Object.values(store.profiles)) p.data = normalize(p.data);
S = store.profiles[store.active].data;
const persist = () => { try { localStorage.setItem(KEY2, JSON.stringify(store)); } catch(e){} };
const save = () => { const p = store.profiles[store.active]; p.data = S; p.updated = Date.now(); persist(); };

try { const l = localStorage.getItem(KEY2+"-lang"); if (l === "ja" || l === "en") lang = l; else if ((navigator.language||"").startsWith("ja")) lang = "ja"; } catch(e){}
{ const q = new URLSearchParams(location.search).get("lang"); if (q === "ja" || q === "en") lang = q; }   // links from /ja/ pages open in Japanese
let section = "basic", doc = "rireki", view = "builder";

const getP = p => p.split(".").reduce((o,k) => o == null ? o : o[k], S);
function setP(p, v){ const ks = p.split("."); let o = S; for (let i=0;i<ks.length-1;i++) o = o[ks[i]]; o[ks.at(-1)] = v; }
const isBaito = () => S.meta.mode === "baito";

/* =================== dates =================== */
const ymParts = s => { const m = /^(\d{4})-(\d{1,2})/.exec(s||""); return m ? [+m[1], +m[2]] : null; };
function era(y, m, d = 1){
  const v = y*10000 + m*100 + d;
  if (v >= 20190501) return ["令和", y-2018];
  if (v >= 19890108) return ["平成", y-1988];
  if (v >= 19261225) return ["昭和", y-1925];
  return ["大正", y-1911];
}
const eraY = (y,m,d) => { const [n,k] = era(y,m,d); return n + (k === 1 ? "元" : k); };
const yStr = (y,m,d) => S.meta.era === "j" ? eraY(y,m,d) : String(y);
const ym = s => { const p = ymParts(s); return p ? `${yStr(p[0],p[1],28)}年${p[1]}月` : ""; };
const ymd = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s||""); return m ? `${yStr(+m[1],+m[2],+m[3])}年${+m[2]}月${+m[3]}日` : ""; };
function ageAt(b, d){
  const x = /^(\d{4})-(\d{2})-(\d{2})/.exec(b||""), y = /^(\d{4})-(\d{2})-(\d{2})/.exec(d||"");
  if (!x || !y) return "";
  let a = +y[1] - +x[1]; if (+y[2] < +x[2] || (+y[2] === +x[2] && +y[3] < +x[3])) a--; return a;
}
const mIndex = s => { const p = ymParts(s); return p ? p[0]*12 + p[1] - 1 : null; };
const byStart = (a,b) => (mIndex(a.start) ?? 0) - (mIndex(b.start) ?? 0);
const toMin = s => { const m = /^(\d{1,2}):(\d{2})/.exec(s||""); return m ? (+m[1])*60 + (+m[2]) : null; };
function weekHours(){ let tot = 0; for (const [k] of DAYS){ const d = S.baito.days[k]; if (!d?.on) continue; const a = toMin(d.from), b = toMin(d.to); if (a!=null && b!=null){ let x = b - a; if (x < 0) x += 1440; tot += x; } } return Math.round(tot/6)/10; }
const jlen = s => [...String(s||"").replace(/\s/g,"")].length;

/* =================== form =================== */
const fid = p => "f-" + p.replace(/\./g, "-");
function field(p, k, o = {}){
  const v = getP(p) ?? "";
  const hint = o.hint ? `<div class="hint">${esc(t(o.hint))}</div>` : "";
  const chips = o.chips ? `<div class="chips">${o.chips.map(c => `<button type="button" class="chip" data-chip="${esc(p)}" data-mode="${o.chipMode||"set"}" data-text="${esc(c)}">${esc(c)}</button>`).join("")}</div>` : "";
  const count = o.count ? `<div class="count" data-count="${esc(p)}" data-min="${o.count[0]}" data-max="${o.count[1]}"></div>` : "";
  let ctl;
  if (o.type === "textarea") ctl = `<textarea id="${fid(p)}" data-path="${esc(p)}" class="${o.tall?"tall":""}" rows="${o.rows||4}">${esc(v)}</textarea>`;
  else if (o.type === "select") ctl = `<select id="${fid(p)}" data-path="${esc(p)}">${o.options.map(([val,lab]) => `<option value="${esc(val)}"${val===v?" selected":""}>${esc(t(lab))}</option>`).join("")}</select>`;
  else ctl = `<input id="${fid(p)}" data-path="${esc(p)}" type="${o.type||"text"}" value="${esc(v)}"${o.ph?` placeholder="${esc(o.ph)}"`:""}${o.type==="month"?' placeholder="YYYY-MM"':""}>`;
  return `<label class="f"><span>${esc(t(k))}</span>${ctl}${count}${hint}${chips}</label>`;
}
function updateCounts(){
  document.querySelectorAll("[data-count]").forEach(el => {
    const n = jlen(getP(el.dataset.count)), lo = +el.dataset.min, hi = +el.dataset.max;
    el.textContent = lang === "ja" ? `${n}字（目安 ${lo}〜${hi}字）` : `${n} characters · aim for ${lo}–${hi}`;
    el.className = "count " + (n === 0 ? "" : n < lo ? "lo" : n > hi ? "hi" : "ok");
  });
}
function listUI(key, titleFn, inner){
  const arr = S[key];
  const items = arr.map((it,i) => `<div class="item">
    <div class="item-h"><b>${esc(titleFn(it) || t("untitled"))}</b>
      <button type="button" class="btn sm ghost" data-act="up" data-list="${key}" data-i="${i}" aria-label="${esc(t("up"))}" ${i===0?"disabled":""}>↑</button>
      <button type="button" class="btn sm ghost" data-act="down" data-list="${key}" data-i="${i}" aria-label="${esc(t("down"))}" ${i===arr.length-1?"disabled":""}>↓</button>
      <button type="button" class="btn sm ghost danger" data-act="del" data-list="${key}" data-i="${i}">${esc(t("remove"))}</button></div>
    ${inner(i)}</div>`).join("");
  return items + `<button type="button" class="addbtn" data-act="add" data-list="${key}">+ ${esc(t("add"))}</button>`;
}
const NEW = {
  education: () => ({start:"",end:"",school:"",dept:"",endType:"卒業"}),
  work: () => ({start:"",end:"",company:"",startWord:"入社",business:"",employment:"正社員",location:"",role:"",summary:"",duties:"",achieve:"",leave:"一身上の都合により退職"}),
  licenses: () => ({date:"",name:""}),
  languages: () => ({name:"",level:""})
};
const GUIDE_FOR = {basic:"rireki", avail:"baito", edu:"history", work:"history", lic:"licences", pr:"pr", doc:"basics"};

const SECTIONS = {
 basic(){
  const p = S.personal;
  return `
  ${S.isExample?`<div><span class="pill">${esc(t("example_pill"))}</span></div>`:""}
  <div class="f"><span>${esc(t("mode_label"))}</span>
    <div class="seg" role="group" style="align-self:flex-start">
      <button type="button" id="mode-full" data-mode-set="full" aria-pressed="${!isBaito()}">${esc(t("mode_full"))}</button>
      <button type="button" id="mode-baito" data-mode-set="baito" aria-pressed="${isBaito()}">${esc(t("mode_baito"))}</button></div>
    <div class="hint">${esc(t("h_mode"))}</div></div>
  ${field("personal.nameJa","f_nameJa",{hint:"h_nameJa"})}
  ${field("personal.nameKana","f_nameKana",{hint:"h_nameKana"})}
  <div class="row">${field("personal.birth","f_birth",{type:"date"})}
    ${field("personal.gender","f_gender",{type:"select",hint:"h_gender",options:[["none","g_none"],["male","g_male"],["female","g_female"]]})}</div>
  <div class="row">${field("personal.nationality","f_nationality",{ph:"ノルウェー"})}${field("personal.postal","f_postal")}</div>
  ${field("personal.address","f_address",{type:"textarea",rows:3,hint:"h_address"})}
  ${field("personal.addressKana","f_addressKana",{hint:"h_addressKana"})}
  <div class="row">${field("personal.phone","f_phone",{type:"tel"})}${field("personal.email","f_email",{type:"email"})}</div>
  ${field("personal.url","f_url",{type:"url"})}
  ${field("personal.contact","f_contact",{type:"textarea",rows:2,hint:"h_contact"})}
  <div class="sect-title">${esc(t("visa_title"))}</div>
  <div class="row">${field("visa.status","f_visaStatus",{chips:["留学","家族滞在","技術・人文知識・国際業務","ワーキング・ホリデー"]})}${field("visa.expiry","f_visaExpiry",{type:"date"})}</div>
  ${field("visa.permit","f_permit",{type:"select",hint:"h_permit",options:[["yes","permit_yes"],["applying","permit_applying"],["no","permit_no"]]})}
  <div class="f"><span>${esc(t("f_photo"))}</span>
    <div class="photo-row"><div class="photo-prev" style="${p.photo?`background-image:url('${p.photo}')`:""}">${p.photo?"":"3:4"}</div>
      <div style="display:flex;flex-direction:column;gap:7px;min-width:0">
        <label class="btn" style="align-self:flex-start">${esc(t("photo_add"))}<input type="file" id="photoInput" accept="image/*" hidden></label>
        ${p.photo?`<button type="button" class="btn sm ghost danger" id="photoDel" style="align-self:flex-start">${esc(t("photo_remove"))}</button>`:""}
        <div class="hint">${esc(t("h_photo"))}</div></div></div></div>`;
 },
 avail(){
  const h = weekHours();
  const rows = DAYS.map(([k,ja,en]) => { const d = S.baito.days[k]; return `<div class="dayrow">
    <label><input type="checkbox" id="${fid(`baito.days.${k}.on`)}" data-path="baito.days.${k}.on" ${d.on?"checked":""}> ${lang==="ja"?ja:en}</label>
    <input type="time" id="${fid(`baito.days.${k}.from`)}" data-path="baito.days.${k}.from" value="${esc(d.from)}" ${d.on?"":"disabled"} aria-label="${en} from">
    <input type="time" id="${fid(`baito.days.${k}.to`)}" data-path="baito.days.${k}.to" value="${esc(d.to)}" ${d.on?"":"disabled"} aria-label="${en} to"></div>`; }).join("");
  return `<div class="hint">${esc(t("avail_hint"))}</div>
   <div class="daygrid">${rows}</div>
   <div class="total ${h>28?"over":""}" id="hoursTotal">${esc(t("total"))}: ${h} ${esc(t("hpw"))}</div>
   ${field("baito.note","f_availNote",{type:"textarea",rows:2,chipMode:"append",chips:["長期休暇中は1日8時間まで勤務可能です。","土日の勤務も相談可能です。","シフトは柔軟に対応いたします。"]})}
   <div class="row">${field("baito.start","f_startAvail",{type:"date"})}${field("extra.commute","f_commute",{ph:"約20分"})}</div>
   ${field("baito.station","f_station",{hint:"h_station"})}`;
 },
 edu(){
  return `<div class="hint">${esc(t("edu_hint"))}</div>` + listUI("education", it => [it.school, it.dept].filter(Boolean).join(" "), i => `
    ${field(`education.${i}.school`,"f_school")}
    ${field(`education.${i}.dept`,"f_dept")}
    <div class="row3">${field(`education.${i}.start`,"f_start",{type:"month"})}${field(`education.${i}.end`,"f_end",{type:"month"})}
    ${field(`education.${i}.endType`,"f_endType",{type:"select",options:[["卒業","et_grad"],["修了","et_comp"],["卒業見込み","et_expect"],["在学中","et_current"],["中退","et_drop"]]})}</div>`);
 },
 work(){
  return `<div class="hint">${esc(t("work_hint"))}</div>` + listUI("work", it => [it.company, it.role].filter(Boolean).join(" · "), i => `
    ${field(`work.${i}.company`,"f_company")}
    <div class="row">${field(`work.${i}.start`,"f_start",{type:"month"})}${field(`work.${i}.end`,"f_end",{type:"month"})}</div>
    ${field(`work.${i}.role`,"f_role")}
    ${isBaito()?"":`<div class="row">${field(`work.${i}.employment`,"f_employment",{chips:["正社員","契約社員","派遣社員","アルバイト","業務委託"]})}${field(`work.${i}.location`,"f_location")}</div>
    ${field(`work.${i}.business`,"f_business")}
    ${field(`work.${i}.summary`,"f_summary",{type:"textarea",rows:2})}
    ${field(`work.${i}.duties`,"f_duties",{type:"textarea",rows:5,hint:"h_duties"})}
    ${field(`work.${i}.achieve`,"f_achieve",{type:"textarea",rows:3,hint:"h_achieve"})}`}
    ${field(`work.${i}.startWord`,"f_startWord",{hint:"h_startWord",chips:["入社","入隊","入職","活動開始"]})}
    ${field(`work.${i}.leave`,"f_leave",{hint:"h_leave",chips:["一身上の都合により退職","会社都合により退職","契約期間満了により退職","任期満了により退役"]})}`);
 },
 lic(){
  return `<div class="hint">${esc(t("lic_hint"))}</div>` + listUI("licenses", it => it.name, i => `
    <div class="row" style="grid-template-columns:1fr 2fr">${field(`licenses.${i}.date`,"f_licDate",{type:"month"})}${field(`licenses.${i}.name`,"f_licName")}</div>`)
  + `<div class="sect-title">${esc(t("lang_title"))}</div>` + listUI("languages", it => [it.name,it.level].filter(Boolean).join(" · "), i => `
    <div class="row">${field(`languages.${i}.name`,"f_langName")}${field(`languages.${i}.level`,"f_langLevel",{chips:["母語","ビジネスレベル","日常会話レベル","初級"]})}</div>`)
  + field("skills","f_skills",{type:"textarea",tall:true,hint:"h_skills"});
 },
 pr(){
  return (isBaito() ? "" : field("jobSummary","f_jobSummary",{type:"textarea",tall:true,hint:"h_jobSummary",count:[150,300]}))
  + field("pr","f_pr",{type:"textarea",tall:true,hint:"h_pr",count:isBaito()?[100,250]:[200,400],chips:["【","】"],chipMode:"append"})
  + field("motivation","f_motivation",{type:"textarea",rows:5,hint:"h_motivation",count:[100,250]})
  + field("wishes","f_wishes",{type:"textarea",rows:4,hint:"h_wishes",chipMode:"append",chips:["貴社規定に従います。","就労ビザの取得にあたり、ご支援いただけますと幸いです。","内定後、速やかに来日可能です。","勤務地は東京都内を希望いたします。"]})
  + (S.meta.form === "jis" ? `<div class="row">${isBaito()?"":field("extra.commute","f_commute",{ph:"約45分"})}${field("extra.dependents","f_dependents",{type:"number"})}</div>
     <div class="row">${field("extra.spouse","f_spouse",{type:"select",options:[["no","no"],["yes","yes"]]})}${field("extra.spouseSupport","f_spouseSupport",{type:"select",options:[["no","no"],["yes","yes"]]})}</div>` : "");
 },
 doc(){
  return field("meta.docDate","f_docDate",{type:"date",hint:"h_docDate"})
   + field("meta.mode","mode_label",{type:"select",hint:"h_mode",options:[["full","mode_full"],["baito","mode_baito"]]})
   + field("meta.form","f_form",{type:"select",hint:"h_form",options:[["mhlw","form_mhlw"],["jis","form_jis"]]})
   + field("meta.era","f_era",{type:"select",hint:"h_era",options:[["w","era_w"],["j","era_j"]]})
   + field("meta.font","f_font",{type:"select",options:[["m","font_m"],["g","font_g"]]})
   + (isBaito() ? "" : field("meta.order","f_order",{type:"select",hint:"h_order",options:[["desc","ord_desc"],["asc","ord_asc"]]}));
 }
};
const secList = () => isBaito() ? ["basic","avail","edu","work","lic","pr","doc"] : ["basic","edu","work","lic","pr","doc"];
function secState(k){
  const p = S.personal;
  const f = {
    basic: [p.nameJa, p.nameKana, p.birth, p.address, p.phone || p.email, p.photo, !isBaito() || S.visa.status],
    avail: [DAYS.some(([d]) => S.baito.days[d].on), S.baito.station],
    edu: [S.education.length],
    work: [S.work.length],
    lic: [S.licenses.length || S.languages.length, lines(S.skills).length || isBaito()],
    pr: [S.pr.trim(), isBaito() || S.jobSummary.trim(), S.wishes.trim()],
    doc: [true]
  }[k].map(Boolean);
  const n = f.filter(Boolean).length;
  return n === f.length ? "done" : n ? "part" : "";
}
function renderTabs(){
  const secs = secList();
  if (!secs.includes(section)) section = "basic";
  $("#dt-shokumu").hidden = isBaito();
  if (isBaito() && doc === "shokumu") doc = "rireki";
  $("#stabs").innerHTML = secs.map(k =>
    `<button type="button" role="tab" id="st-${k}" data-sec="${k}" aria-selected="${k===section}"><span class="dot ${secState(k)}"></span>${esc(t("s_"+k))}</button>`).join("");
}
function refreshDots(){ document.querySelectorAll("#stabs [data-sec]").forEach(b => { b.querySelector(".dot").className = "dot " + secState(b.dataset.sec); }); }
function renderForm(){
  const secs = secList(), n = secs.indexOf(section) + 1;
  $("#form").innerHTML = `<div class="fhead"><div><div class="kicker">${esc(t("step",{n,m:secs.length}))}</div>
      <h2>${esc(t("s_"+section))}<span class="jp">${esc(t("sj_"+section))}</span></h2></div>
      <a href="#g-${GUIDE_FOR[section]}" class="glink" data-guide="${GUIDE_FOR[section]}">${esc(t("read_guide"))}</a></div>` + SECTIONS[section]();
  updateCounts();
}
function applyLang(){
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach(el => el.textContent = t(el.dataset.t));
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  $("#cvname").textContent = store.profiles[store.active].name || t("untitled_cv");
  renderTabs(); renderForm(); renderDoc();
  if (view === "guide") renderGuide();
}

/* =================== 履歴書 =================== */
const kanaLabel = () => (/[ァ-ヶ]/.test(S.personal.nameKana) && !/[ぁ-ゖ]/.test(S.personal.nameKana)) ? "フリガナ" : "ふりがな";
function historyRows(){
  const r = [{c:"学歴"}];
  const yy = s => { const p = ymParts(s); return p ? [yStr(p[0],p[1],28), String(p[1])] : ["",""]; };
  [...S.education].sort(byStart).forEach(e => {
    const name = [e.school, e.dept].filter(Boolean).join("　");
    if (e.start){ const [y,m] = yy(e.start); r.push({y,m,txt:`${name}　入学`}); }
    if (e.endType === "在学中") r.push({txt:`${name}　在学中`, ind:1});
    else if (e.end){ const [y,m] = yy(e.end); r.push({y,m,txt:`${name}　${e.endType||"卒業"}`}); }
  });
  r.push({blank:1}); r.push({c:"職歴"});
  let current = false;
  if (!S.work.length) r.push({txt:"なし", ind:1});
  [...S.work].sort(byStart).forEach(w => {
    const [y,m] = yy(w.start);
    r.push({y,m,txt:`${w.company||""}　${w.startWord||"入社"}`});
    if (w.role) r.push({txt:w.role, ind:1});
    if (w.end){ const [y2,m2] = yy(w.end); r.push({y:y2,m:m2,txt:w.leave||"一身上の都合により退職"}); }
    else current = true;
  });
  if (current) r.push({txt:"現在に至る", ind:1});
  r.push({txt:"以上", rt:1});
  return r;
}
function rowHTML(x){
  if (!x || x.blank) return `<tr><td class="y"></td><td class="m"></td><td></td></tr>`;
  if (x.c) return `<tr><td class="y"></td><td class="m"></td><td class="c">${esc(x.c)}</td></tr>`;
  const w = [...(x.txt||"")].reduce((a,ch) => a + (/[　-鿿＀-￯]/.test(ch) ? 1 : .55), 0) + (x.ind ? 2 : 0);
  const fs = w > 44 ? `font-size:${Math.max(7, 10*44/w).toFixed(2)}pt` : "";
  return `<tr><td class="y">${esc(x.y||"")}</td><td class="m">${esc(x.m||"")}</td><td class="${x.rt?"rt":x.ind?"ind":""}" style="${fs}">${esc(x.txt)}</td></tr>`;
}
const histHead = () => `<colgroup><col style="width:${S.meta.era==="j"?18:16}mm"><col style="width:10mm"><col></colgroup><tr><th>年</th><th>月</th><th>学歴・職歴（各別にまとめて書く）</th></tr>`;
function visaText(){
  const v = S.visa, parts = [v.status || ""];
  if (v.expiry) parts.push(`（在留期限：${ymd(v.expiry)}）`);
  if (v.permit === "yes") parts.push("　資格外活動許可：取得済");
  if (v.permit === "applying") parts.push("　資格外活動許可：申請予定");
  return parts.join("");
}
function availHTML(){
  const cells = DAYS.map(([k]) => { const d = S.baito.days[k]; return d.on ? `${esc(d.from||"")}<br>～${esc(d.to||"")}` : "×"; });
  const h = weekHours();
  const note = [S.baito.start && `勤務開始可能日：${ymd(S.baito.start)}`, h && `週合計：約${h}時間`, S.visa.status === "留学" && "（資格外活動許可の範囲内：週28時間以内）"].filter(Boolean).join("　");
  return `<div class="r-avail"><table><colgroup><col style="width:22mm"></colgroup>
    <tr><th style="height:6.5mm">曜日</th>${DAYS.map(([,ja]) => `<th>${ja}</th>`).join("")}</tr>
    <tr><th style="height:11mm">勤務可能時間</th>${cells.map(c => `<td style="line-height:1.25">${c}</td>`).join("")}</tr></table>
    ${note || S.baito.note ? `<div class="note">${esc(note)}${note && S.baito.note ? "<br>" : ""}${esc(S.baito.note||"").replace(/\n/g,"<br>")}</div>` : ""}</div>`;
}
function rirekiPages(){
  const p = S.personal, x = S.extra, d = S.meta.docDate, jis = S.meta.form === "jis", baito = isBaito();
  const font = S.meta.font === "g" ? " gothic" : "";
  const age = ageAt(p.birth, d);
  const rows = historyRows();
  const showNat = !!p.nationality, showVisa = !!(S.visa.status || baito);
  const P1 = 21 - (showNat?1:0) - (showVisa?1:0), P2MIN = baito ? 6 : 8;
  const r1 = rows.slice(0, P1), r2 = rows.slice(P1);
  while (r1.length < P1) r1.push(null);
  while (r2.length < P2MIN) r2.push(null);
  const lic = [...S.licenses].sort((a,b) => (mIndex(a.date)??0) - (mIndex(b.date)??0));
  const licRows = lic.map(l => { const pp = ymParts(l.date); return `<tr><td class="y">${pp?esc(yStr(pp[0],pp[1],28)):""}</td><td class="m">${pp?pp[1]:""}</td><td>${esc(l.name)}</td></tr>`; });
  while (licRows.length < 6) licRows.push(`<tr><td></td><td></td><td></td></tr>`);
  const sex = p.gender === "male" ? "男" : p.gender === "female" ? "女" : "";
  const prText = [S.motivation, S.pr].map(s => (s||"").trim()).filter(Boolean).join("\n\n");
  const dense = prText.length > 420 ? "xdense" : prText.length > 260 ? "dense" : "";
  const yn = v => v === "yes" ? `<span class="maru">有</span>・<span class="nomaru">無</span>` : `<span class="nomaru">有</span>・<span class="maru">無</span>`;
  const addr = (p.address||"").split("\n").map(esc).join("<br>");
  const contact = (p.contact||"").trim() ? esc(p.contact).replace(/\n/g,"<br>") : "同上";
  const KL = kanaLabel();
  const side = [];
  if (baito) side.push(["最寄駅", esc(S.baito.station||"")]);
  if (baito || jis) side.push(["通勤時間", esc(x.commute||"")]);
  if (jis){ side.push(["扶養家族数（配偶者を除く）", `${esc(x.dependents||"0")}人`]); side.push(["配偶者", yn(x.spouse)]); side.push(["配偶者の扶養義務", yn(x.spouseSupport)]); }
  const page1 = `<div class="page rireki${font}">
   <div class="r-head">
    <div>
     <div class="r-titleline"><div class="r-title">履歴書</div><div class="r-date">${esc(ymd(d))}現在</div></div>
     <table class="r-id"><colgroup><col style="width:20mm"><col><col style="width:12mm"><col style="width:14mm"></colgroup>
      <tr class="kana"><th>${KL}</th><td colspan="3">${esc(p.nameKana)}</td></tr>
      <tr class="nm2"><th>氏　名</th><td colspan="3">${esc(p.nameJa)}</td></tr>
      <tr class="bd"><th>生年月日</th><td>${p.birth?`${esc(ymd(p.birth))}生（満${age}歳）`:""}</td><th>性別</th><td style="text-align:center">${sex}</td></tr>
      ${showNat?`<tr class="bd"><th>国籍</th><td colspan="3">${esc(p.nationality)}</td></tr>`:""}
      ${showVisa?`<tr class="bd"><th>在留資格</th><td colspan="3" style="font-size:9pt">${esc(visaText())}</td></tr>`:""}
     </table>
     ${jis?"":`<div class="r-note">※「性別」欄：記載は任意です。未記載とすることも可能です。</div>`}
    </div>
    <div class="r-photo ${p.photo?"has":""}">${p.photo?`<img src="${p.photo}" alt="">`:"写真をはる位置<br><br>縦 36〜40mm<br>横 24〜30mm"}</div>
   </div>
   <table class="r-addr">
    <tr class="kana"><th>${KL}</th><td>${esc(p.addressKana)}</td><td class="side"><span class="sl">電話</span>${esc(p.phone)}</td></tr>
    <tr class="tall"><th>現住所</th><td>〒${esc(p.postal)}<br>${addr}</td><td class="side"><span class="sl">E-mail</span>${esc(p.email)}</td></tr>
    <tr class="kana"><th>${KL}</th><td></td><td class="side"><span class="sl">電話</span></td></tr>
    <tr class="tall"><th>連絡先</th><td>${contact}</td><td class="side"><span class="sl">E-mail</span></td></tr>
   </table>
   <table class="r-hist">${histHead()}${r1.map(rowHTML).join("")}</table>
  </div>`;
  const page2 = `<div class="page rireki${font}">
   <table class="r-hist">${histHead()}${r2.map(rowHTML).join("")}</table>
   <table class="r-hist">${histHead().replace("学歴・職歴（各別にまとめて書く）","免許・資格")}${licRows.join("")}</table>
   ${baito?availHTML():""}
   <div class="r-pr ${side.length?"":"full"}">
    <div class="box ${dense}"><span class="lab">志望の動機、特技、好きな学科、アピールポイントなど</span>${esc(prText)}</div>
    ${side.length?`<div class="r-side">${side.map(([k,v]) => `<div><div class="k">${k}</div>${v}</div>`).join("")}</div>`:""}
   </div>
   <div class="r-wish ${baito?"short":""}"><span class="lab">本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他についての希望などがあれば記入）</span>${esc(S.wishes)}</div>
  </div>`;
  return [page1, page2];
}

/* =================== 職務経歴書 (paginated) =================== */
function shokumuBlocks(){
  const p = S.personal, B = [];
  const jobs = [...S.work].sort(byStart); if (S.meta.order === "desc") jobs.reverse();
  const ul = s => { const l = lines(s); return l.length ? `<ul>${l.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""; };
  const jobHTML = w => {
    const per = `${ym(w.start)}～${w.end ? ym(w.end) : "現在"}`;
    const meta = [w.business && `事業内容：${w.business}`, w.employment && `雇用形態：${w.employment}`, w.location && `勤務地：${w.location}`].filter(Boolean).map(esc).join("　／　");
    return `<div class="job">
      <div class="job-h"><span>${esc(w.company)}</span><span style="font-weight:400">${esc(per)}</span></div>
      ${meta?`<div class="job-meta">${meta}</div>`:""}
      <table><tr><td class="per">${esc(ym(w.start))}<br>～<br>${esc(w.end?ym(w.end):"現在")}</td><td>
        ${w.role?`<div class="role">${esc(w.role)}</div>`:""}
        ${w.summary?`<p class="s-p">${esc(w.summary)}</p>`:""}
        ${lines(w.duties).length?`<div class="sub">【主な業務】</div>${ul(w.duties)}`:""}
        ${lines(w.achieve).length?`<div class="sub">【実績・成果】</div>${ul(w.achieve)}`:""}
      </td></tr></table></div>`;
  };
  B.push(`<h1 class="s-title">職務経歴書</h1><div class="s-meta">${esc(ymd(S.meta.docDate))}現在<br>氏名　${esc(p.nameJa)}</div>`);
  if (S.jobSummary.trim()) B.push(`<div class="s-h">■ 職務要約</div><p class="s-p">${esc(S.jobSummary.trim())}</p>`);
  jobs.forEach((w,i) => B.push((i===0?`<div class="s-h">■ 職務経歴</div>`:"") + jobHTML(w)));
  if (lines(S.skills).length) B.push(`<div class="s-h">■ 活かせる経験・知識・スキル</div><ul class="s-list">${lines(S.skills).map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`);
  if (S.languages.length) B.push(`<div class="s-h">■ 語学</div><table class="s-tbl">${S.languages.map(l=>`<tr><td>${esc(l.name)}</td><td>${esc(l.level)}</td></tr>`).join("")}</table>`);
  const lic = [...S.licenses].sort((a,b) => (mIndex(a.date)??0) - (mIndex(b.date)??0));
  if (lic.length) B.push(`<div class="s-h">■ 資格</div><table class="s-tbl">${lic.map(l=>`<tr><td>${esc(ym(l.date))}</td><td>${esc(l.name)}</td></tr>`).join("")}</table>`);
  const pr = S.pr.trim().split(/\n(?=【)/).filter(Boolean);
  pr.forEach((para,i) => B.push((i===0?`<div class="s-h">■ 自己PR</div>`:"") + `<p class="s-p">${esc(para)}</p>`));
  B.push(`<div class="s-end">以上</div>`);
  return B;
}
function shokumuPages(){
  const font = S.meta.font === "g" ? " gothic" : "";
  const blocks = shokumuBlocks();
  const m = $("#measure");
  m.innerHTML = `<div class="page shokumu${font}" style="height:auto">${blocks.map(b => `<div class="blk">${b}</div>`).join("")}</div>`;
  const hs = [...m.querySelectorAll(".blk")].map(el => el.getBoundingClientRect().height);
  m.innerHTML = "";
  const avail = (297 - 30) * MM - 2;
  const pages = []; let cur = [], used = 0;
  blocks.forEach((b,i) => {
    if (cur.length && used + hs[i] > avail){ pages.push(cur); cur = []; used = 0; }
    cur.push(b); used += hs[i];
  });
  if (cur.length) pages.push(cur);
  return pages.map((bs,i) => `<div class="page shokumu${font}">${bs.map(b => `<div class="blk">${b}</div>`).join("")}${pages.length>1?`<div class="pno">${i+1} / ${pages.length}</div>`:""}</div>`);
}

/* =================== checker =================== */
function checks(){
  const out = [], add = (lvl,en,ja) => out.push({lvl, msg: lang==="ja"?ja:en});
  const p = S.personal, today = todayISO();
  if (!p.nameJa) add("err","Name is empty.","氏名が未入力です。");
  if (!p.nameKana) add("warn","Add your name reading in katakana.","ふりがな（カタカナ）を入力してください。");
  if (!p.birth) add("err","Date of birth is empty.","生年月日が未入力です。");
  if (!p.address) add("err","Address is empty.","現住所が未入力です。");
  if (!p.postal) add("warn","Postal code is empty.","郵便番号が未入力です。");
  if (!p.phone && !p.email) add("err","Add a phone number or email.","電話番号かメールアドレスを入力してください。");
  if (!p.photo) add("warn","No photo. Most Japanese employers expect one on the 履歴書.","写真がありません。多くの企業では履歴書に写真が必要です。");
  if (/[ァ-ヶ]/.test(p.nameJa) && /[A-Za-z]/.test(p.nameJa)) add("tip","Your name mixes katakana and Latin letters. Use one script for 氏名.","氏名にカタカナとローマ字が混在しています。どちらかに統一しましょう。");
  const dd = S.meta.docDate;
  if (dd){
    const diff = (new Date(today) - new Date(dd)) / 864e5;
    if (diff > 30) add("warn",`The document date (${dd}) is more than a month old. Set it to the day you send it.`,`作成日（${ymd(dd)}）が1か月以上前です。提出日に更新してください。`);
    if (diff < -1) add("warn","The document date is in the future.","作成日が未来の日付になっています。");
  }
  if (!S.education.length) add("err","Add your education.","学歴を入力してください。");
  S.education.forEach(e => {
    const n = e.school || "?";
    if (e.end && e.start && mIndex(e.end) < mIndex(e.start)) add("err",`${n}: end date is before start date.`,`${n}：終了が開始より前になっています。`);
    if (e.end && e.end > today.slice(0,7) && e.endType === "卒業") add("warn",`${n}: the end date is in the future, so use 卒業見込み (expected).`,`${n}：終了が未来の日付のため「卒業見込み」にしてください。`);
  });
  if (!S.work.length && !isBaito()) add("tip","No work history. New graduates can skip this, but the 職務経歴書 will be empty.","職歴がありません。新卒の場合は不要ですが、職務経歴書は空になります。");
  const sorted = [...S.work].sort(byStart);
  sorted.forEach((w,i) => {
    const n = w.company || "?";
    if (!w.start) add("err",`${n}: start date is empty.`,`${n}：開始年月が未入力です。`);
    if (w.end && w.start && mIndex(w.end) < mIndex(w.start)) add("err",`${n}: end date is before start date.`,`${n}：終了が開始より前になっています。`);
    if (w.end && w.end > today.slice(0,7)) add("warn",`${n}: the end date is in the future. If you still work there, leave it empty (現在に至る).`,`${n}：終了が未来の日付です。在職中なら空欄（現在に至る）にしてください。`);
    if (!isBaito() && !lines(w.duties).length) add("warn",`${n}: add main duties for the 職務経歴書.`,`${n}：職務経歴書用の主な業務を入力してください。`);
    const all = (w.duties||"") + (w.achieve||"") + (w.summary||"");
    if (!isBaito() && lines(w.duties).length && !/[0-9０-９]/.test(all)) add("tip",`${n}: no numbers yet. Add volumes or results (cases per day, %, ratings).`,`${n}：数字がありません。件数・％・評価などを加えると説得力が増します。`);
    if (/㈱|\(株\)|（株）/.test(w.company||"")) add("warn",`${n}: write 株式会社 in full, not ㈱ or (株).`,`${n}：「㈱」「(株)」と略さず「株式会社」と書きましょう。`);
    if (i>0 && sorted[i-1].end && w.start){
      const gap = mIndex(w.start) - mIndex(sorted[i-1].end);
      if (gap > 12) add("tip",`Gap of about ${Math.round(gap/12*10)/10} years before ${n}. Be ready to explain it (study, travel, family).`,`${n}の前に約${Math.round(gap/12*10)/10}年の空白があります。面接で説明できるよう準備しましょう。`);
    }
  });
  if (!isBaito() && !S.jobSummary.trim()) add("warn","The 職務要約 (career summary) is empty. It is the first thing a recruiter reads.","職務要約が未入力です。採用担当者が最初に読む部分です。");
  const prL = jlen(S.pr);
  if (!prL) add("warn","Self-PR is empty.","自己PRが未入力です。");
  else if (prL < (isBaito()?80:150)) add("tip","Self-PR is short. Add a concrete example.","自己PRが短めです。具体例を加えましょう。");
  if (!S.motivation.trim()) add("tip","No 志望動機 (motivation). Write one for each company you apply to.","志望動機がありません。応募先ごとに作成しましょう。");
  if ((S.motivation + S.pr).length > 520) add("tip","The 履歴書 PR box is small, so long text prints smaller. A shorter version reads better.","履歴書の自己PR欄は小さいため、長文は小さな文字で印刷されます。");
  if (!S.wishes.trim()) add("warn","本人希望記入欄 is empty. Write at least 貴社規定に従います。","本人希望記入欄が空です。最低限「貴社規定に従います。」と記入しましょう。");
  const nat = (p.nationality||"").trim();
  if (!isBaito() && nat && nat !== "日本" && !/ビザ|在留|visa/i.test(S.wishes)) add("tip","Applying from abroad? Mention visa support or your residence status in 本人希望記入欄.","海外からの応募の場合、ビザ支援の希望や在留資格を本人希望記入欄に記載しましょう。");
  S.licenses.forEach(l => { if (/失効|expired/i.test(l.name)) add("tip",`"${l.name}" has expired. Most people leave expired certificates off or move them to skills.`,`「${l.name}」は失効しています。記載しないか、スキル欄に移すことも検討してください。`); });
  if (isBaito()){
    const v = S.visa, h = weekHours();
    if (!v.status) add("err","Add your status of residence (在留資格), e.g. 留学.","在留資格を入力してください（例：留学）。");
    if (v.status === "留学" && v.permit !== "yes") add("warn","Students cannot start a part-time job before 資格外活動許可 is granted. Mark it as granted once you have it.","留学生は資格外活動許可を取得するまでアルバイトを始められません。取得後に「取得済」にしてください。");
    if (!v.expiry) add("warn","Add the expiry date of your residence card.","在留期限を入力してください。");
    else { const left = (new Date(v.expiry) - new Date(S.meta.docDate || today)) / 864e5; if (left < 92) add("tip","Your residence period ends within 3 months. Employers may ask about renewal.","在留期限まで3か月を切っています。更新予定について聞かれることがあります。"); }
    if (!DAYS.some(([k]) => S.baito.days[k].on)) add("warn","Tick the days you can work.","勤務できる曜日を選択してください。");
    if (DAYS.some(([k]) => S.baito.days[k].on && (toMin(S.baito.days[k].from) == null || toMin(S.baito.days[k].to) == null))) add("warn","Some ticked days have no start or end time.","時間が未入力の曜日があります。");
    if (v.status === "留学" && h > 28) add("err",`Your hours add up to ${h} h/week. Students may work at most 28 h/week during term.`,`勤務可能時間が週${h}時間になっています。留学生の上限は授業期間中週28時間です。`);
    if (!S.baito.station) add("tip","Add your nearest station. Employers use it to plan commute pay.","最寄駅を入力してください。交通費の計算に使われます。");
    if (p.address && !/日本|\d{3}-\d{4}/.test(p.address + p.postal)) add("tip","Switch to your Japanese address once you have one.","日本の住所が決まったら現住所を更新してください。");
  }
  return out;
}

/* =================== preview =================== */
function renderDoc(){
  const wrap = $("#docwrap");
  document.querySelectorAll("#dtabs [data-doc]").forEach(b => b.setAttribute("aria-pressed", b.dataset.doc === doc));
  const ck = checks();
  const badge = $("#ckbadge"); badge.textContent = ck.length;
  badge.className = "badge " + (ck.some(c => c.lvl === "err") ? "err" : ck.length ? "" : "zero");
  if (doc === "check"){
    const order = {err:0,warn:1,tip:2};
    wrap.innerHTML = `<div class="check">${ck.length ? ck.sort((a,b)=>order[a.lvl]-order[b.lvl]).map(c => `<div class="ck"><span class="lvl ${c.lvl}">${esc(t("lv_"+c.lvl))}</span><p>${esc(c.msg)}</p></div>`).join("") : `<div class="ck-ok">${esc(t("ck_none"))}</div>`}</div>`;
    return;
  }
  const pages = doc === "rireki" ? rirekiPages() : shokumuPages();
  wrap.innerHTML = pages.map((h,i) => `${pages.length>1?`<div class="pagenote">${i+1} / ${pages.length}</div>`:""}<div class="pagebox"><div class="scaler">${h}</div></div>`).join("");
  fit();
}
function fit(){
  const wrap = $("#docwrap"); if (!wrap || !wrap.clientWidth) return;
  const cs = getComputedStyle(wrap);
  const avail = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  document.querySelectorAll(".scaler").forEach(sc => {
    const page = sc.firstElementChild; if (!page) return;
    const w = page.offsetWidth, h = page.offsetHeight, s = Math.min(1, avail / w);
    sc.style.transform = `scale(${s})`; sc.style.width = w + "px";
    sc.parentElement.style.height = (h * s) + "px";
    sc.style.marginInline = s < 1 ? `${-(w - w*s)/2}px` : "0";
  });
}
let tmr; const later = () => { clearTimeout(tmr); tmr = setTimeout(() => { renderDoc(); refreshDots(); }, 180); };
new ResizeObserver(() => fit()).observe($("#docwrap"));

/* =================== guide =================== */
const G = (en, ja) => lang === "ja" ? ja : en;
function guideChapters(){
  const nm = S.personal.nameJa || "SLETTVOLD Tommy André";
  const kana = (S.personal.nameKana || "スレットヴォルド トミー アンドレ").replace(/\s+/g,"");
  const mailJa = `件名：応募書類の送付（${nm}）

株式会社〇〇
人事部　採用ご担当者様

お世話になっております。
${nm}と申します。

貴社の〇〇職の求人に応募させていただきたく、応募書類をお送りいたします。

【添付書類】
・履歴書（PDF）
・職務経歴書（PDF）

ご多忙のところ恐縮ですが、ご検討のほど何卒よろしくお願い申し上げます。

――――――――――――――
${nm}
${S.personal.email || "email@example.com"}
${S.personal.phone || "+47 000 00 000"}
――――――――――――――`;
  const ex = (good, bad) => `<div class="ex"><b class="g">OK</b><span>${good}</span>${bad?`<b class="x">${G("AVOID","NG")}</b><span>${bad}</span>`:""}</div>`;
  return [
  {id:"basics", en:"The two documents", ja:"2つの書類",
   html: G(`
<p>Japanese job applications usually need two documents. They do different jobs, so they are written differently.</p>
<h3>履歴書 <span class="jp">rirekisho</span></h3>
<p>A fixed form with your personal details, education and job history as dates only, licences, motivation and requests. Every applicant fills in the same boxes, so the recruiter can compare people quickly. Needed for both full-time and part-time jobs.</p>
<h3>職務経歴書 <span class="jp">shokumu keirekisho</span></h3>
<p>A free-format document that explains what you did at each job and what you achieved. It is where you sell your experience. Needed for full-time jobs and career changes; part-time jobs rarely ask for it.</p>
<h3>Format today</h3>
<ul>
<li><b>A4, made on a computer, sent as PDF</b> is accepted almost everywhere. Some traditional companies still prefer handwriting; the job ad will say so.</li>
<li>In 2021 the Ministry of Health, Labour and Welfare published a recommended 履歴書 form. Gender became optional, and the boxes for commute, dependents and spouse were removed. Rireki Studio uses this form by default. You can switch to the classic JIS form in Settings.</li>
<li>Use the same date style (2026年 or 令和8年) and the same facts in both documents. Recruiters compare them.</li>
</ul>
<div class="callout"><p><b>Rule of thumb:</b> the 履歴書 says <i>who</i> you are and <i>when</i> things happened. The 職務経歴書 says <i>what</i> you did and <i>how well</i>.</p></div>`,
`
<p>日本の応募書類は通常2種類です。役割が違うため、書き方も異なります。</p>
<h3>履歴書</h3>
<p>決まった様式に、個人情報・学歴と職歴（年月のみ）・免許資格・志望動機・本人希望を記入します。全員が同じ欄を埋めるため、採用担当者は比較しやすくなります。正社員・アルバイトどちらにも必要です。</p>
<h3>職務経歴書</h3>
<p>自由形式で、各職場で何をしてどんな成果を出したかを説明します。経験をアピールする書類です。正社員や転職で求められ、アルバイトではほとんど不要です。</p>
<h3>現在の主流</h3>
<ul>
<li><b>A4・パソコン作成・PDF送付</b>がほぼどこでも受け入れられます。手書きを求める企業は求人票に明記しています。</li>
<li>2021年に厚生労働省が履歴書の様式例を公表しました。性別は任意となり、通勤時間・扶養家族・配偶者の欄はなくなりました。Rireki Studio はこの様式が標準です。設定で従来のJIS様式に切り替えられます。</li>
<li>年の表記（西暦・和暦）や内容は2つの書類で統一しましょう。採用担当者は見比べます。</li>
</ul>
<div class="callout"><p><b>目安：</b>履歴書は「誰が・いつ」、職務経歴書は「何を・どれだけ」を伝える書類です。</p></div>`)},
  {id:"rireki", en:"履歴書, box by box", ja:"履歴書の書き方",
   html: G(`
<h3>Date <span class="jp">日付</span></h3>
<p>The day you send or hand it in, not the day you wrote it. An old date suggests you send the same paper everywhere.</p>
<h3>Name and reading <span class="jp">氏名・フリガナ</span></h3>
<p>Write your name as in your passport, family name first. Capitals for the family name make the order clear. The reading goes in katakana. If the heading says ふりがな the convention is hiragana, if it says フリガナ katakana; Rireki Studio switches the heading for you.</p>
${ex("SLETTVOLD Tommy André ／ スレットヴォルド トミー アンドレ","Tommy André Slettvold ／ とみー あんどれ")}
<h3>Photo <span class="jp">写真</span></h3>
<ul><li>30 × 40 mm, taken within the last 3 months, plain light background.</li>
<li>Suit or smart clothing, face the camera, no hat. A neutral expression or a light smile is fine.</li>
<li>Selfies and holiday photos look careless. A photo booth (証明写真機) costs about ¥800–1,000 at most stations.</li></ul>
<h3>Address <span class="jp">現住所</span></h3>
<p>Japanese addresses go from largest to smallest: prefecture, city, district, block, building, room. For an address abroad, do the same in Japanese and add the original on a second line. 連絡先 is only for a second address; otherwise it says 同上 (same as above).</p>
<h3>Gender <span class="jp">性別</span></h3>
<p>Optional on the 2021 form. You may leave it blank.</p>
<h3>Motivation and self-PR <span class="jp">志望動機・自己PR</span></h3>
<p>The 履歴書 box is small: about 150–250 characters for motivation and a short self-PR. Rewrite the motivation for every company. See <a href="#g-pr" data-guide="pr">Self-PR and motivation</a>.</p>
<h3>Requests <span class="jp">本人希望記入欄</span></h3>
<p>Only write conditions you really need. If you have none, write <span class="jt">貴社規定に従います。</span> (I will follow your company's rules). If the company has several openings, name the role you apply for. Foreign applicants should mention visa support here.</p>
${ex("貴社規定に従います。<br>就労ビザの取得にあたり、ご支援いただけますと幸いです。","給料は月30万円以上を希望します。土日休み希望。")}`,
`
<h3>日付</h3>
<p>書いた日ではなく、提出日（郵送日・持参日）にします。古い日付は使い回しの印象を与えます。</p>
<h3>氏名・フリガナ</h3>
<p>パスポートと同じ表記で、姓を先に書きます。姓を大文字にすると順序が明確です。読みはカタカナで。見出しが「ふりがな」ならひらがな、「フリガナ」ならカタカナが原則で、Rireki Studio は見出しを自動で切り替えます。</p>
${ex("SLETTVOLD Tommy André ／ スレットヴォルド トミー アンドレ","Tommy André Slettvold ／ とみー あんどれ")}
<h3>写真</h3>
<ul><li>縦40mm×横30mm、3か月以内に撮影、無地の明るい背景。</li>
<li>スーツなどきちんとした服装で正面を向き、帽子は外します。</li>
<li>自撮りや旅行の写真は避けましょう。駅の証明写真機なら800〜1,000円程度です。</li></ul>
<h3>現住所</h3>
<p>都道府県から部屋番号まで、大きい単位から書きます。海外の住所も日本語で同じ順に書き、2行目に原文を添えます。連絡先は現住所以外に連絡を希望する場合のみ記入し、なければ「同上」とします。</p>
<h3>性別</h3>
<p>2021年の厚生労働省様式では任意です。空欄でも構いません。</p>
<h3>志望動機・自己PR</h3>
<p>履歴書の欄は小さいため、志望動機は150〜250字程度、自己PRは簡潔に。志望動機は応募先ごとに書き直します。<a href="#g-pr" data-guide="pr">自己PRと志望動機</a>も参照してください。</p>
<h3>本人希望記入欄</h3>
<p>どうしても譲れない条件だけを書きます。特になければ「貴社規定に従います。」複数の職種を募集している場合は希望職種を記入します。外国籍の方はビザ支援の希望をここに書きましょう。</p>
${ex("貴社規定に従います。<br>就労ビザの取得にあたり、ご支援いただけますと幸いです。","給料は月30万円以上を希望します。土日休み希望。")}`)},
  {id:"history", en:"Education and work history", ja:"学歴・職歴",
   html: G(`
<p>One table, two blocks. Write <span class="jt">学歴</span> centred on the first line, list education, leave one empty line, then <span class="jt">職歴</span> and your jobs. Oldest first.</p>
<h3>Education <span class="jp">学歴</span></h3>
<ul><li>Start from high school entry (or junior high graduation). Each school gets two lines: 入学 (entered) and 卒業 (graduated).</li>
<li>Write official names in full. Translate the school type and add the country: <span class="jt">Ole Vig高等学校（ノルウェー）</span>.</li>
<li>Still studying: <span class="jt">卒業見込み</span> (expected) with the planned month, or <span class="jt">在学中</span>.</li>
<li>Online and vocational schools count. Name the course exactly.</li></ul>
<h3>Work history <span class="jp">職歴</span></h3>
<ul><li>List every employer, including short jobs. Gaps are fine but be ready to explain them.</li>
<li>Company names in full: <span class="jt">株式会社</span>, never ㈱ or (株). Foreign companies keep their own name; add what they do in the 職務経歴書.</li>
<li>Joining: <span class="jt">入社</span>. Military: <span class="jt">入隊</span>. Freelance: <span class="jt">活動開始</span> or <span class="jt">業務委託契約</span>.</li>
<li>Leaving: <span class="jt">一身上の都合により退職</span> if you chose to leave, <span class="jt">会社都合により退職</span> for layoffs or closures, <span class="jt">契約期間満了により退職</span> when a contract ended.</li>
<li>Current job: write <span class="jt">現在に至る</span> on its own line, then <span class="jt">以上</span> aligned right on the next line to show the list is complete.</li></ul>
${ex("2022　10　Releasy AS　入社<br>　　　　　カスタマーサポート（FINN.no担当）<br>　　　　　現在に至る<br>　　　　　　　　　　　　　　　以上","2022/10　Releasy (Customer support)")}`,
`
<p>1つの表に2つのブロックを書きます。1行目の中央に「学歴」、学歴を書いたら1行空け、「職歴」と各職歴を続けます。古い順です。</p>
<h3>学歴</h3>
<ul><li>高校入学（または中学卒業）から書き始めます。1校につき「入学」「卒業」の2行です。</li>
<li>学校名は正式名称で。海外の学校は学校種別を訳し、国名を添えます（例：Ole Vig高等学校（ノルウェー））。</li>
<li>在学中の場合は卒業予定年月と「卒業見込み」、または「在学中」。</li>
<li>通信制・専門学校も学歴です。コース名を正確に。</li></ul>
<h3>職歴</h3>
<ul><li>短期間の勤務も含め、すべて書きます。空白期間は問題ありませんが、説明できるようにしておきましょう。</li>
<li>会社名は省略せず「株式会社」と書きます（㈱・(株)は不可）。外資系・海外企業は正式名称のまま、事業内容は職務経歴書で補足します。</li>
<li>入社は「入社」、軍は「入隊」、個人事業は「活動開始」「業務委託契約」など。</li>
<li>退職理由：自己都合は「一身上の都合により退職」、解雇・倒産は「会社都合により退職」、契約満了は「契約期間満了により退職」。</li>
<li>現職は「現在に至る」と書き、次の行の右端に「以上」と書きます。</li></ul>
${ex("2022　10　Releasy AS　入社<br>　　　　　カスタマーサポート（FINN.no担当）<br>　　　　　現在に至る<br>　　　　　　　　　　　　　　　以上","2022/10　Releasy (Customer support)")}`)},
  {id:"licences", en:"Licences and qualifications", ja:"免許・資格",
   html: G(`
<ul><li>Official names, oldest first, with the month you passed.</li>
<li>Licences end in <span class="jt">取得</span>, exams in <span class="jt">合格</span>: <span class="jt">普通自動車第一種運転免許 取得</span>, <span class="jt">日本語能力試験N3 合格</span>.</li>
<li>Foreign licences: add the country, e.g. <span class="jt">普通自動車運転免許（ノルウェー）</span>.</li>
<li>Expired certificates are usually left out or moved to the skills section of the 職務経歴書.</li>
<li>Studying for something relevant? You may write <span class="jt">現在、〇〇の取得に向けて勉強中</span> on the last line.</li>
<li>IT applicants: the Japanese 情報処理技術者試験 (for example 情報セキュリティマネジメント or 基本情報技術者) carries weight with employers and immigration. Vendor certificates such as CCNA or AWS are welcome too.</li></ul>`,
`
<ul><li>正式名称で、古い順に取得年月とともに書きます。</li>
<li>免許は「取得」、試験は「合格」：「普通自動車第一種運転免許 取得」「日本語能力試験N3 合格」。</li>
<li>海外の免許は国名を添えます（例：普通自動車運転免許（ノルウェー））。</li>
<li>失効した資格は書かないか、職務経歴書のスキル欄に移すのが一般的です。</li>
<li>関連する資格を勉強中なら、最後の行に「現在、〇〇の取得に向けて勉強中」と書けます。</li>
<li>IT職では、情報処理技術者試験（情報セキュリティマネジメント、基本情報技術者など）が評価されます。CCNA・AWSなどのベンダー資格も記載しましょう。</li></ul>`)},
  {id:"shokumu", en:"Writing the 職務経歴書", ja:"職務経歴書の書き方",
   html: G(`
<p>No fixed form, but recruiters expect this order. One or two A4 pages; three at most for a long career.</p>
<ol>
<li><b>Title, date, name</b> at the top.</li>
<li><b>職務要約</b>: 150–300 characters on your years of experience, field and main strengths. Many recruiters read only this, so make it count.</li>
<li><b>職務経歴</b>: one block per employer with period, 事業内容 (what the company does), employment type, your role, main duties as a list and results with numbers.</li>
<li><b>活かせる経験・知識・スキル</b>: tools, languages, methods, grouped.</li>
<li><b>資格</b> and <b>語学</b>.</li>
<li><b>自己PR</b>: 2–3 strengths with evidence.</li>
<li><span class="jt">以上</span> at the end, right-aligned.</li></ol>
<h3>Order</h3>
<p><b>逆編年体</b> (newest first) puts your most relevant job on top and suits most people. <b>編年体</b> (oldest first) suits a straight career. A third style, キャリア式, groups by skill and is rare.</p>
<h3>Style</h3>
<ul><li>Prose in polite form (<span class="jt">〜しました</span>, <span class="jt">〜しております</span>). Lists in short noun phrases (体言止め): <span class="jt">利用者からの問い合わせ対応</span>.</li>
<li>Numbers make claims believable: cases per day, team size, % improved, ratings.</li>
<li>Foreign companies are unknown in Japan. One line on what they do helps a lot: <span class="jt">ノルウェー最大のオンラインマーケットプレイス</span>.</li>
<li>Confidential work (military, security): say so in one line and describe the type of work only.</li></ul>
${ex("詐欺・不正行為に関する通報の調査（1日平均約40件）","詐欺対応をがんばりました。")}`,
`
<p>決まった様式はありませんが、次の順序が一般的です。A4で1〜2枚、経歴が長くても3枚までに。</p>
<ol>
<li>冒頭に<b>タイトル・日付・氏名</b>。</li>
<li><b>職務要約</b>：経験年数・分野・強みを150〜300字で。ここしか読まない担当者もいます。</li>
<li><b>職務経歴</b>：会社ごとに期間、事業内容、雇用形態、役職、主な業務（箇条書き）、数字を使った実績。</li>
<li><b>活かせる経験・知識・スキル</b>：ツール・言語・手法をまとめて。</li>
<li><b>資格</b>と<b>語学</b>。</li>
<li><b>自己PR</b>：根拠のある強みを2〜3点。</li>
<li>最後に右寄せで「以上」。</li></ol>
<h3>並び順</h3>
<p><b>逆編年体</b>（新しい順）は直近の経験を先に見せられ、多くの人に向いています。<b>編年体</b>（古い順）は一貫したキャリアに向いています。スキル別にまとめるキャリア式もあります。</p>
<h3>書き方</h3>
<ul><li>文章は「です・ます」調、箇条書きは体言止め（例：利用者からの問い合わせ対応）。</li>
<li>件数・人数・改善率・評価などの数字で説得力が増します。</li>
<li>海外企業は日本で知られていないため、事業内容を一言添えましょう（例：ノルウェー最大のオンラインマーケットプレイス）。</li>
<li>守秘義務のある業務（軍・セキュリティ）は、その旨を一言添え、業務の種類のみ記載します。</li></ul>
${ex("詐欺・不正行為に関する通報の調査（1日平均約40件）","詐欺対応をがんばりました。")}`)},
  {id:"pr", en:"Self-PR and motivation", ja:"自己PRと志望動機",
   html: G(`
<h3>Self-PR <span class="jp">自己PR</span></h3>
<p>Use the same three steps for each strength:</p>
<ol><li><b>Strength</b> in one line, often in brackets: <span class="jt">【不正対策の実務経験】</span></li>
<li><b>Evidence</b>: what you did, with a number.</li>
<li><b>Use</b>: how it helps this employer.</li></ol>
<p>Two or three strengths, 200–400 characters in the 職務経歴書; a shorter version for the 履歴書. Avoid lists of adjectives (真面目、明るい、責任感が強い) with nothing to back them.</p>
<h3>Motivation <span class="jp">志望動機</span></h3>
<p>Answer three questions: why this industry, why this company, and what you will contribute. Mention something specific to the company (a product, a value, a market). Write a new one for each application.</p>
${ex("貴社が提供する決済サービスの不正検知に、FINN.noで培った詐欺対策の経験を活かせると考え、志望いたしました。","日本が好きなので応募しました。")}
<h3>Japanese level</h3>
<p>Be honest. Overstating your Japanese is found out in the first interview. State the JLPT level you passed and that you study daily.</p>`,
`
<h3>自己PR</h3>
<p>強みごとに同じ3段階で書きます。</p>
<ol><li><b>強み</b>を一言で（【】で見出しにすることが多い）：【不正対策の実務経験】</li>
<li><b>根拠</b>：何をしたか、数字とともに。</li>
<li><b>貢献</b>：応募先でどう活かせるか。</li></ol>
<p>強みは2〜3点、職務経歴書では200〜400字、履歴書は短く。根拠のない形容詞の羅列（真面目、明るい、責任感が強い）は避けましょう。</p>
<h3>志望動機</h3>
<p>「なぜこの業界か」「なぜこの会社か」「何で貢献できるか」の3点に答えます。商品・理念・市場など、その会社ならではの点に触れ、応募先ごとに書き直します。</p>
${ex("貴社が提供する決済サービスの不正検知に、FINN.noで培った詐欺対策の経験を活かせると考え、志望いたしました。","日本が好きなので応募しました。")}
<h3>日本語レベル</h3>
<p>正直に書きましょう。誇張は最初の面接で分かります。合格したJLPTのレベルと、毎日学習していることを伝えます。</p>`)},
  {id:"foreign", en:"Tips for foreign applicants", ja:"外国籍の方へ",
   html: G(`
<ul>
<li><b>Name order:</b> family name first, as on a Japanese residence card. Katakana reading under it.</li>
<li><b>Nationality and residence status:</b> add 国籍, and once you live in Japan your 在留資格 and its expiry. Employers must check you are allowed to do the job.</li>
<li><b>Visa:</b> if you need a work visa, say so politely in 本人希望記入欄. Many employers support it, and saying it early avoids surprises.</li>
<li><b>Education abroad:</b> translate the school type to the nearest Japanese one (videregående skole → 高等学校, university college → 大学, fagskole → 専門学校) and add the country.</li>
<li><b>Military service:</b> list it under 職歴 with 入隊 and 任期満了により退役 (or 除隊).</li>
<li><b>Proof:</b> keep certificates of employment (在職証明書), diplomas and transcripts in English. Visa applications need them.</li>
<li><b>Get a native check.</b> A Japanese friend, teacher or a free service at Hello Work (外国人雇用サービスセンター) can read it through.</li>
</ul>`,
`
<ul>
<li><b>氏名の順序：</b>在留カードと同じく姓を先に。下にカタカナの読みを。</li>
<li><b>国籍・在留資格：</b>国籍を記入し、日本在住なら在留資格と在留期限も。企業には就労可否の確認義務があります。</li>
<li><b>ビザ：</b>就労ビザが必要な場合は、本人希望記入欄に丁寧に書きます。早めに伝えるほど行き違いがありません。</li>
<li><b>海外の学歴：</b>学校種別を最も近い日本の学校に置き換え（videregående skole → 高等学校、university college → 大学、fagskole → 専門学校）、国名を添えます。</li>
<li><b>兵役：</b>職歴に「入隊」「任期満了により退役（除隊）」と書きます。</li>
<li><b>証明書類：</b>在職証明書・卒業証明書・成績証明書を英文で用意しておきましょう。ビザ申請で必要です。</li>
<li><b>ネイティブのチェック：</b>日本人の友人や先生、ハローワークの外国人雇用サービスセンターなどで見てもらいましょう。</li>
</ul>`)},
  {id:"baito", en:"Part-time jobs (アルバイト)", ja:"アルバイトの場合",
   html: G(`
<p>Part-time employers usually only want the 履歴書. They look at three things first: when you can work, how far you live, and whether you are allowed to work.</p>
<ul>
<li><b>Work permission:</b> students on a 留学 visa need 資格外活動許可 before they start. You can apply at the airport on arrival. It allows up to <b>28 hours a week</b> during term and up to <b>8 hours a day</b> in long school holidays.</li>
<li><b>Not allowed:</b> the permission excludes adult entertainment businesses (風俗営業), which includes host or hostess bars and pachinko parlours.</li>
<li><b>Hours:</b> fill in the weekly table honestly. Shops plan shifts from it. Rireki Studio warns you if the total goes over 28 hours.</li>
<li><b>Nearest station and commute:</b> employers pay transport costs and want staff who live close.</li>
<li><b>Motivation can be simple:</b> "I want to use Japanese at work while studying" is a fine reason. Add one thing you bring: customer service, English, physical work.</li>
<li><b>Japanese level:</b> with N5–N4, look for kitchen, hotel, warehouse, cleaning or English-speaking customer jobs.</li>
</ul>`,
`
<p>アルバイトでは通常、履歴書のみを提出します。採用担当者がまず見るのは「いつ働けるか」「どこに住んでいるか」「就労が許可されているか」です。</p>
<ul>
<li><b>資格外活動許可：</b>留学生は勤務開始前に取得が必要です。入国時に空港で申請できます。授業期間中は<b>週28時間以内</b>、長期休暇中は<b>1日8時間以内</b>です。</li>
<li><b>できない仕事：</b>風俗営業（接待を伴う飲食店、パチンコ店など）では働けません。</li>
<li><b>勤務可能時間：</b>シフト作成に使われるため正確に。合計が28時間を超えるとRireki Studioが警告します。</li>
<li><b>最寄駅・通勤時間：</b>交通費の支給や、近くに住んでいるかの確認に使われます。</li>
<li><b>志望動機は簡潔に：</b>「学校で学びながら、仕事を通して日本語を身につけたい」で十分です。接客経験・英語・体力など、自分の強みを一つ添えましょう。</li>
<li><b>日本語レベル：</b>N5〜N4なら、キッチン・ホテル・倉庫・清掃・英語を使う接客などが探しやすいです。</li>
</ul>`)},
  {id:"send", en:"Sending your application", ja:"応募書類の送り方",
   html: G(`
<ul>
<li>Save each document as a PDF. Name the files so the recruiter knows whose they are: <span class="jt">${esc(kana)}_履歴書_2026.pdf</span>.</li>
<li>Re-check the date, the company name and that the motivation matches this company.</li>
<li>Email in Japanese with a clear subject. Send on a weekday during office hours if you can.</li>
<li>Some companies ask for a password-protected ZIP; follow their instructions.</li>
</ul>
<h3>Email template <span class="jp">送付メール</span></h3>
<p>Replace 〇〇 with the company and role. Your name, email and phone come from your CV.</p>
<div class="mail" id="mailtpl">${esc(mailJa)}</div>
<button type="button" class="btn" id="copymail">Copy email</button>`,
`
<ul>
<li>書類はそれぞれPDFで保存し、誰の書類か分かるファイル名にします（例：${esc(kana)}_履歴書_2026.pdf）。</li>
<li>日付、応募先の社名、志望動機がその会社向けになっているか再確認しましょう。</li>
<li>件名の分かりやすいメールで、できれば平日の業務時間内に送ります。</li>
<li>パスワード付きZIPを指定する企業もあります。指示に従いましょう。</li>
</ul>
<h3>送付メールの例</h3>
<p>〇〇を社名・職種に置き換えてください。氏名・メール・電話は履歴書から入ります。</p>
<div class="mail" id="mailtpl">${esc(mailJa)}</div>
<button type="button" class="btn" id="copymail">メールをコピー</button>`)},
  {id:"mistakes", en:"Final checklist", ja:"提出前チェックリスト",
   html: G(`
<ul>
<li>Date is the day you send it, in the same style in both documents.</li>
<li>No empty boxes. Write なし (none) if you have no licences.</li>
<li>No abbreviations: 株式会社, 高等学校, 大学 in full.</li>
<li>Photo is recent and formal.</li>
<li>Motivation names this company and this role.</li>
<li>Numbers in the 職務経歴書 are true and you can explain them.</li>
<li>Both documents tell the same story: same dates, same job titles.</li>
<li>Run the <b>Check</b> tab in the builder; it catches most of these.</li>
</ul>`,
`
<ul>
<li>日付は提出日で、2つの書類で表記が統一されている。</li>
<li>空欄がない（資格がなければ「なし」と記入）。</li>
<li>略さない：株式会社・高等学校・大学。</li>
<li>写真が最近のもので、きちんとした服装。</li>
<li>志望動機に応募先の社名・職種が反映されている。</li>
<li>職務経歴書の数字が事実で、説明できる。</li>
<li>2つの書類の内容（日付・役職）が一致している。</li>
<li>作成画面の<b>チェック</b>タブで確認する。多くの項目を自動で確認できます。</li>
</ul>`)},
  {id:"glossary", en:"Glossary", ja:"用語集",
   html: `<div class="tblwrap"><table class="gt"><tr><th>${G("Term","用語")}</th><th>${G("Reading","読み")}</th><th>${G("Meaning","意味（英語）")}</th></tr>
${[["履歴書","りれきしょ","Résumé form"],["職務経歴書","しょくむけいれきしょ","Work history / career document"],["職務要約","しょくむようやく","Career summary"],["自己PR","じこピーアール","Self-promotion, strengths"],["志望動機","しぼうどうき","Motivation for applying"],["本人希望記入欄","ほんにんきぼうきにゅうらん","Requests box"],["入学 / 卒業","にゅうがく / そつぎょう","Entered / graduated"],["卒業見込み","そつぎょうみこみ","Expected to graduate"],["中退","ちゅうたい","Left before finishing"],["入社 / 退職","にゅうしゃ / たいしょく","Joined / left a company"],["一身上の都合により","いっしんじょうのつごうにより","For personal reasons"],["現在に至る","げんざいにいたる","Up to the present"],["以上","いじょう","End of list"],["取得 / 合格","しゅとく / ごうかく","Obtained (licence) / passed (exam)"],["貴社規定に従います","きしゃきていにしたがいます","I will follow your company's rules"],["在留資格","ざいりゅうしかく","Status of residence (visa type)"],["資格外活動許可","しかくがいかつどうきょか","Permission to work outside your status"],["最寄駅","もよりえき","Nearest station"],["正社員 / 契約社員","せいしゃいん / けいやくしゃいん","Permanent / contract employee"],["業務委託","ぎょうむいたく","Freelance contract"],["編年体 / 逆編年体","へんねんたい / ぎゃくへんねんたい","Oldest first / newest first"]].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join("")}
</table></div>`}
  ];
}
let guideObs;
function renderGuide(){
  const chs = guideChapters();
  $("#guide").innerHTML = `<div class="guide">
    <nav class="toc" aria-label="Guide"><div class="kicker">${G("Guide","ガイド")}</div>${chs.map(c => `<a href="#g-${c.id}" data-guide="${c.id}">${esc(G(c.en,c.ja))}</a>`).join("")}</nav>
    <article class="gbody">
      <header class="ghero"><div class="kicker">${G("How to write it","書き方")}</div>
        <h1>${G("Japanese CVs, explained","履歴書と職務経歴書の書き方")}<span class="jp">${G("履歴書・職務経歴書の書き方","Japanese CVs, explained")}</span></h1>
        <p class="lead">${G("What goes in each box, the fixed phrases Japanese recruiters expect, and what to do differently as a foreign applicant.","各欄に何を書くか、採用担当者が期待する決まった表現、外国籍の方が気をつける点をまとめました。")}</p>
        <button type="button" class="btn red tobuilder" data-goview="builder">${G("Open the builder","作成画面へ")}</button></header>
      ${chs.map(c => `<section class="chap" id="g-${c.id}"><h2>${esc(G(c.en,c.ja))}<span class="jp">${esc(G(c.ja,c.en))}</span></h2>${c.html}</section>`).join("")}
    </article></div>`;
  guideObs?.disconnect();
  guideObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting){ document.querySelectorAll(".toc a").forEach(a => a.setAttribute("aria-current", a.dataset.guide === e.target.id.slice(2))); } }), {rootMargin:"-30% 0px -60% 0px"});
  document.querySelectorAll(".chap").forEach(s => guideObs.observe(s));
}
function setView(v, anchor){
  view = v;
  $("#builder").hidden = v !== "builder"; $("#guide").hidden = v !== "guide";
  document.querySelectorAll(".views [data-goview]").forEach(b => b.setAttribute("aria-current", b.dataset.goview === v ? "page" : "false"));
  if (v === "guide"){ renderGuide(); requestAnimationFrame(() => { const el = anchor && document.getElementById("g-"+anchor); el ? el.scrollIntoView() : window.scrollTo(0,0); }); }
  else { requestAnimationFrame(() => { fit(); window.scrollTo(0,0); }); }
}

/* =================== events: builder =================== */
function edited(){ if (S.isExample){ S.isExample = false; } save(); later(); }
$("#form").addEventListener("input", e => {
  const el = e.target.closest("[data-path]"); if (!el) return;
  const val = el.type === "checkbox" ? el.checked : el.value;
  setP(el.dataset.path, val); edited();
  if (el.type === "checkbox" && el.dataset.path.startsWith("baito.days")) el.closest(".dayrow").querySelectorAll("input[type=time]").forEach(x => x.disabled = !val);
  if (el.dataset.path.startsWith("baito.days")){ const h = weekHours(), tot = $("#hoursTotal"); if (tot){ tot.textContent = `${t("total")}: ${h} ${t("hpw")}`; tot.classList.toggle("over", h > 28); } }
  if (el.dataset.path === "personal.nameJa" && /^Example|^無題|^Untitled|^My CV$/.test(store.profiles[store.active].name)){ store.profiles[store.active].name = val; $("#cvname").textContent = val || t("untitled_cv"); persist(); }
  updateCounts();
  const item = el.closest(".item"); if (item && /(school|dept|company|role|name|level)$/.test(el.dataset.path)){
    const [key,i] = el.dataset.path.split("."); const it = S[key][+i];
    const title = key==="education" ? [it.school,it.dept] : key==="work" ? [it.company,it.role] : key==="licenses" ? [it.name] : [it.name,it.level];
    item.querySelector(".item-h b").textContent = title.filter(Boolean).join(key==="education"?" ":" · ") || t("untitled");
  }
});
$("#form").addEventListener("change", e => {
  const el = e.target;
  if (el.id === "photoInput" && el.files[0]) return loadPhoto(el.files[0]);
  if (el.matches("select[data-path]")){ setP(el.dataset.path, el.value); edited(); if (/^meta\.(mode|form)$/.test(el.dataset.path)){ renderTabs(); renderForm(); renderDoc(); } }
});
let delArm = null;
$("#form").addEventListener("click", e => {
  const chip = e.target.closest("[data-chip]");
  if (chip){
    const p = chip.dataset.chip, txt = chip.dataset.text, cur = getP(p) || "";
    const v = chip.dataset.mode === "append" ? (cur && !cur.endsWith("\n") && !/[【】]/.test(txt) ? cur + "\n" + txt : cur + txt) : txt;
    setP(p, v); const el = document.getElementById(fid(p)); if (el){ el.value = v; el.focus(); }
    edited(); updateCounts(); return;
  }
  const ms = e.target.closest("[data-mode-set]");
  if (ms){ S.meta.mode = ms.dataset.modeSet; edited(); renderTabs(); renderForm(); renderDoc(); return; }
  if (e.target.id === "photoDel"){ S.personal.photo = ""; edited(); renderForm(); return; }
  const b = e.target.closest("[data-act]"); if (!b) return;
  const arr = S[b.dataset.list], i = +b.dataset.i;
  if (b.dataset.act === "del" && delArm !== b){ delArm = b; b.textContent = t("remove2"); setTimeout(() => { if (delArm === b){ delArm = null; b.textContent = t("remove"); } }, 2500); return; }
  delArm = null;
  if (b.dataset.act === "add") arr.push(NEW[b.dataset.list]());
  if (b.dataset.act === "del") arr.splice(i,1);
  if (b.dataset.act === "up" && i>0) [arr[i-1],arr[i]] = [arr[i],arr[i-1]];
  if (b.dataset.act === "down" && i<arr.length-1) [arr[i+1],arr[i]] = [arr[i],arr[i+1]];
  edited(); renderForm(); refreshDots();
  if (b.dataset.act === "add"){ const items = document.querySelectorAll(".item"); const last = items[items.length-1]; last?.scrollIntoView({block:"center"}); last?.querySelector("input")?.focus(); }
});
function loadPhoto(file){
  const r = new FileReader();
  r.onload = () => { const img = new Image(); img.onload = () => {
      const c = document.createElement("canvas"); c.width = 360; c.height = 480;
      const w = img.width, h = img.height; let sx=0, sy=0, sw=w, sh=h;
      if (w/h > .75){ sw = h*.75; sx = (w-sw)/2; } else { sh = w/.75; sy = (h-sh)/2; }
      c.getContext("2d").drawImage(img, sx, sy, sw, sh, 0, 0, 360, 480);
      S.personal.photo = c.toDataURL("image/jpeg", .85); edited(); renderForm(); refreshDots();
    }; img.src = r.result; };
  r.readAsDataURL(file);
}
$("#stabs").addEventListener("click", e => { const b = e.target.closest("[data-sec]"); if (!b) return; section = b.dataset.sec; renderTabs(); renderForm(); const y = $(".editor").getBoundingClientRect().top + scrollY - $(".top").offsetHeight; if (scrollY > y) window.scrollTo(0, y); });
$("#dtabs").addEventListener("click", e => { const b = e.target.closest("[data-doc]"); if (!b) return; doc = b.dataset.doc; renderDoc(); });
document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => { lang = b.dataset.lang; try{localStorage.setItem(KEY2+"-lang",lang);}catch(e){} applyLang(); }));
document.querySelectorAll("[data-pane]").forEach(b => b.addEventListener("click", () => setPane(b.dataset.pane)));
function setPane(v){ document.body.dataset.pane = v; document.querySelectorAll("[data-pane]").forEach(b => b.setAttribute("aria-pressed", b.dataset.pane === v)); if (v==="preview") requestAnimationFrame(fit); }
document.addEventListener("click", e => {
  const gv = e.target.closest("[data-goview]"); if (gv){ e.preventDefault(); setView(gv.dataset.goview); return; }
  const g = e.target.closest("[data-guide]"); if (g){ e.preventDefault(); if (view !== "guide") setView("guide", g.dataset.guide); else document.getElementById("g-"+g.dataset.guide)?.scrollIntoView({behavior: matchMedia("(prefers-reduced-motion:reduce)").matches ? "auto" : "smooth"}); return; }
  if (e.target.id === "copymail") copyText($("#mailtpl").textContent);
});

function toast(msg){ document.querySelectorAll(".toast").forEach(x => x.remove()); const d = document.createElement("div"); d.className = "toast"; d.setAttribute("role","status"); d.textContent = msg; document.body.appendChild(d); setTimeout(() => d.remove(), 3600); }
function copyText(txt, ta){
  const fb = () => { if (ta){ ta.focus(); ta.select(); } };
  try { navigator.clipboard.writeText(txt).then(() => toast(t("copied")), fb); } catch(e){ fb(); }
}

/* =================== CV manager =================== */
const dlgC = $("#dlg-cvs"), dlgIO = $("#dlg-io");
const openDlg = d => d.showModal ? d.showModal() : d.setAttribute("open","");
const closeDlg = d => d.close ? d.close() : d.removeAttribute("open");
function switchTo(id){ store.active = id; S = store.profiles[id].data; persist(); section = "basic"; applyLang(); }
function addProfile(data, name){ const id = uid(); store.profiles[id] = {name: name || nameFor(data) || t("untitled_cv"), updated: Date.now(), data: normalize(data)}; return id; }
let cvDelArm = null;
function renderCVs(){
  const ids = Object.keys(store.profiles).sort((a,b) => store.profiles[b].updated - store.profiles[a].updated);
  const fmt = ms => new Date(ms).toLocaleDateString(lang === "ja" ? "ja-JP" : "en-GB", {year:"numeric",month:"short",day:"numeric"});
  $("#cvlist").innerHTML = ids.map(id => { const p = store.profiles[id], on = id === store.active;
    const mode = p.data.meta.mode === "baito" ? t("mode_baito") : t("mode_full");
    return `<div class="cvrow ${on?"on":""}"><div style="min-width:0">
      <input id="cvn-${id}" data-rename="${id}" value="${esc(p.name)}" aria-label="Name">
      <div class="meta">${esc(mode)} · ${esc(t("edited"))} ${esc(fmt(p.updated))}</div></div>
      <div class="b">${on?`<span class="btn sm ghost" style="cursor:default">${esc(t("cv_current"))}</span>`:`<button type="button" class="btn sm" data-cv="open" data-id="${id}">${esc(t("cv_open"))}</button>`}
        <button type="button" class="btn sm ghost" data-cv="dup" data-id="${id}">${esc(t("cv_dup"))}</button>
        ${ids.length>1?`<button type="button" class="btn sm ghost danger" data-cv="del" data-id="${id}">${esc(t("cv_del"))}</button>`:""}</div></div>`; }).join("");
}
$("#btn-cvs").addEventListener("click", () => { renderCVs(); openDlg(dlgC); });
$("#cv-close").addEventListener("click", () => closeDlg(dlgC));
$("#cvlist").addEventListener("input", e => { const id = e.target.dataset.rename; if (!id) return; store.profiles[id].name = e.target.value; persist(); if (id === store.active) $("#cvname").textContent = e.target.value || t("untitled_cv"); });
$("#cvlist").addEventListener("click", e => {
  const b = e.target.closest("[data-cv]"); if (!b) return; const id = b.dataset.id;
  if (b.dataset.cv === "open"){ switchTo(id); closeDlg(dlgC); }
  if (b.dataset.cv === "dup"){ const p = store.profiles[id]; const nid = addProfile(clone(p.data), `${p.name} (${t("cv_copy")})`); persist(); switchTo(nid); renderCVs(); }
  if (b.dataset.cv === "del"){
    if (cvDelArm !== b){ cvDelArm = b; b.textContent = t("remove2"); setTimeout(() => { if (cvDelArm === b){ cvDelArm = null; b.textContent = t("cv_del"); } }, 2500); return; }
    delete store.profiles[id]; if (id === store.active){ store.active = Object.keys(store.profiles)[0]; S = store.profiles[store.active].data; }
    persist(); applyLang(); renderCVs();
  }
});
$("#cv-new").addEventListener("click", () => { const id = addProfile(blank(), t("untitled_cv")); persist(); switchTo(id); closeDlg(dlgC); });
$("#cv-example").addEventListener("click", () => { const id = addProfile(clone(EXAMPLE), "Example · Emma"); persist(); switchTo(id); closeDlg(dlgC); });
$("#cv-io").addEventListener("click", () => { closeDlg(dlgC); $("#io-text").value = JSON.stringify(S, null, 2); openDlg(dlgIO); });
$("#io-close").addEventListener("click", () => closeDlg(dlgIO));
$("#io-copy").addEventListener("click", () => copyText($("#io-text").value, $("#io-text")));

/* files: a plain download link (nothing leaves the device) */
const framed = (() => { try { return window.self !== window.top; } catch(e){ return true; } })();
async function saveFile(filename, data, type){
  if (!framed){
    const blob = data instanceof Blob ? data : new Blob([data], {type});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); return true;
  }
  toast(t("save_fail")); return false;
}
const fileBase = () => (S.personal.nameKana || S.personal.nameJa || "rireki").replace(/\s+/g,"").replace(/[\\/:*?"<>|]/g,"");
$("#io-save-one").addEventListener("click", () => saveFile(`${fileBase()}_rireki-studio.json`, JSON.stringify(S, null, 2), "application/json"));
$("#io-save-all").addEventListener("click", () => saveFile(`rireki-studio_all_${todayISO()}.json`, JSON.stringify({app:"rireki-studio", kind:"bundle", profiles:Object.values(store.profiles).map(p => ({name:p.name, data:p.data}))}, null, 2), "application/json"));
function importText(txt){
  try {
    const d = JSON.parse(txt); let n = 0, last;
    if (d && Array.isArray(d.profiles)) d.profiles.forEach(p => { if (p?.data?.personal){ last = addProfile(p.data, p.name); n++; } });
    else if (d && d.personal){ last = addProfile(d); n = 1; }
    if (!n) throw 0;
    persist(); switchTo(last); closeDlg(dlgIO); toast(t("imported",{n}));
  } catch(e){ toast(t("import_err")); }
}
$("#io-load").addEventListener("click", () => importText($("#io-text").value));
$("#io-file").addEventListener("change", e => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => importText(r.result); r.readAsText(f); e.target.value = ""; });

/* =================== PDF =================== */
// The browser's print dialog → "Save as PDF" gives sharp text and works offline on Windows, Mac, Android and iPhone.
$("#btn-pdf").addEventListener("click", () => {
  const which = (doc === "shokumu" && !isBaito()) ? "shokumu" : "rireki";
  const pages = which === "rireki" ? rirekiPages() : shokumuPages();
  const title = `${fileBase()}_${which==="rireki"?"履歴書":"職務経歴書"}${isBaito()&&which==="rireki"?"_アルバイト":""}_${(S.meta.docDate||"").slice(0,4)}`;
  if (framed){ toast(t("pdf_fail")); return; }
  $("#printRoot").innerHTML = pages.join("");
  const old = document.title; document.title = title;
  toast(t("pdf_hint"));
  setTimeout(() => { window.print(); document.title = old; }, 80);
});

/* =================== boot =================== */
new ResizeObserver(() => document.documentElement.style.setProperty("--toph", $(".top").offsetHeight + "px")).observe($(".top"));
setPane("edit");
applyLang();
setView(location.hash.startsWith("#g-") ? "guide" : "builder", location.hash.startsWith("#g-") ? location.hash.slice(3) : null);
document.fonts?.ready.then(() => renderDoc());
})();

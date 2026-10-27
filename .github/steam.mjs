// Updates /steam/steam.json (and small game images in /steam/img/) from the Steam Web API, for the Hobbies page.
// Runs in GitHub Actions (workflows/steam.yml) once a day. Needs the repository secret STEAM_API_KEY and the
// secret or variable STEAM_ID (a SteamID64, or the custom name from steamcommunity.com/id/<name>).
// Visitors never talk to Steam: the page only reads this JSON and these images from slettvold.org itself.
import fs from 'node:fs';
const KEY = process.env.STEAM_API_KEY, ID_IN = (process.env.STEAM_ID || '').trim();
if (!KEY || !ID_IN) { console.log('STEAM_API_KEY or STEAM_ID missing: nothing to do'); process.exit(0); }
const API = 'https://api.steampowered.com';
const get = async (path, params) => {
  const r = await fetch(`${API}/${path}/?${new URLSearchParams({ key: KEY, format: 'json', ...params })}`);
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return (await r.json()).response || {};
};
let steamid = ID_IN;
if (!/^\d{17}$/.test(steamid)) {
  const v = await get('ISteamUser/ResolveVanityURL/v1', { vanityurl: ID_IN });
  if (v.success !== 1) throw new Error('could not resolve STEAM_ID ' + ID_IN);
  steamid = v.steamid;
}
const owned = await get('IPlayerService/GetOwnedGames/v1', { steamid, include_appinfo: 1, include_played_free_games: 1 });
if (!owned.game_count) throw new Error('no games returned: is "Game details" set to Public in the Steam privacy settings?');
const level = await get('IPlayerService/GetSteamLevel/v1', { steamid });
const badges = await get('IPlayerService/GetBadges/v1', { steamid });
const recent = await get('IPlayerService/GetRecentlyPlayedGames/v1', { steamid, count: 4 });

const games = owned.games || [];
const hours = Math.round(games.reduce((s, g) => s + (g.playtime_forever || 0), 0) / 60);
const top = [...games].sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0)).slice(0, 4);
fs.mkdirSync('steam/img', { recursive: true });
const keep = new Set();
async function image(appid) {
  const file = `steam/img/${appid}.jpg`; keep.add(`${appid}.jpg`);
  if (fs.existsSync(file)) return `/${file}`;
  for (const u of [`https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_231x87.jpg`,
                   `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/capsule_231x87.jpg`,
                   `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`]) {
    try { const r = await fetch(u); if (r.ok && (r.headers.get('content-type') || '').startsWith('image/')) { fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); return `/${file}`; } } catch (e) {}
  }
  return null;
}
const pick = async (g, extra) => ({ appid: g.appid, name: g.name, hours: Math.round((g.playtime_forever || 0) / 60), img: await image(g.appid), ...extra });
// the hand-picked favourites on the Hobbies page (data-appid there): their hours are always included
const FAVS = [570, 892970, 39210, 306130];
const byId = Object.fromEntries(games.map((g) => [g.appid, g]));
const data = {
  games: owned.game_count, hours, level: level.player_level ?? null,
  badges: (badges.badges || []).length, xp: badges.player_xp ?? null,
  recent: await Promise.all((recent.games || []).map((g) => pick(g, { hours2w: Math.round((g.playtime_2weeks || 0) / 6) / 10 }))),
  mostPlayed: await Promise.all(top.map((g) => pick(g, {}))),
  favs: FAVS.filter((id) => byId[id]).map((id) => ({ appid: id, hours: Math.round((byId[id].playtime_forever || 0) / 60) })),
};
// ---------- level progress ----------
if (badges.player_xp != null && badges.player_xp_needed_to_level_up != null) {
  const into = badges.player_xp - (badges.player_xp_needed_current_level || 0), span = into + badges.player_xp_needed_to_level_up;
  data.levelProgress = { next: (level.player_level || 0) + 1, toGo: badges.player_xp_needed_to_level_up, pct: span > 0 ? Math.round(into / span * 1000) / 10 : 0 };
}

// ---------- achievements: totals, 100 % games and the rarest ones unlocked ----------
const raw = async (path, params) => {
  const r = await fetch(`${API}/${path}/?${new URLSearchParams({ key: KEY, format: 'json', ...params })}`);
  return r.ok ? r.json() : null;
};
const pool = async (items, n, fn) => { const out = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]).catch(() => null); } })); return out; };
const played = games.filter((g) => (g.playtime_forever || 0) >= 60).sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, 400);
const ach = await pool(played, 6, async (g) => {
  const j = await raw('ISteamUserStats/GetPlayerAchievements/v1', { steamid, appid: g.appid, l: 'english' });
  const list = j && j.playerstats && j.playerstats.achievements;
  return list && list.length ? { g, list } : null;
});
let unlocked = 0; const perfect = [], cand = [];
for (const a of ach.filter(Boolean)) {
  const got = a.list.filter((x) => x.achieved === 1); unlocked += got.length;
  if (got.length === a.list.length) perfect.push(a.g);
  if (got.length) cand.push({ g: a.g, got });
}
const pcts = await pool(cand, 6, async (c) => {
  const j = await raw('ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2', { gameid: c.g.appid });
  const m = {}; ((j && j.achievementpercentages && j.achievementpercentages.achievements) || []).forEach((x) => { m[x.name] = +x.percent; });
  return c.got.filter((x) => m[x.apiname] > 0).map((x) => ({ g: c.g, a: x, pct: m[x.apiname] }));
});
const rare = pcts.flat().filter(Boolean).sort((a, b) => a.pct - b.pct).slice(0, 5);
const schemas = {};
async function achIcon(appid, apiname) {
  if (!schemas[appid]) {
    const j = await raw('ISteamUserStats/GetSchemaForGame/v2', { appid, l: 'english' });
    schemas[appid] = Object.fromEntries(((j && j.game && j.game.availableGameStats && j.game.availableGameStats.achievements) || []).map((x) => [x.name, x]));
  }
  const s = schemas[appid][apiname]; if (!s || !s.icon) return null;
  const name = `ach-${appid}-${apiname.replace(/[^\w-]/g, '_').slice(0, 60)}.jpg`, file = `steam/img/${name}`; keep.add(name);
  if (!fs.existsSync(file)) { try { const r = await fetch(s.icon); if (!r.ok) return null; fs.writeFileSync(file, Buffer.from(await r.arrayBuffer())); } catch (e) { return null; } }
  return `/${file}`;
}
data.achievements = unlocked;
data.perfect = perfect.length;
data.perfectGames = perfect.slice(0, 8).map((g) => ({ appid: g.appid, name: g.name }));
data.rarest = [];
for (const r of rare) data.rarest.push({ appid: r.g.appid, game: r.g.name, name: r.a.name || r.a.apiname, desc: r.a.description || '', pct: Math.round(r.pct * 10) / 10, icon: await achIcon(r.g.appid, r.a.apiname) });

// ---------- games playable in Japanese (store data, cached; checked a little each day) ----------
const CACHE = 'steam/cache/lang.json';
fs.mkdirSync('steam/cache', { recursive: true });
const lang = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};   // appid → 0 none, 1 text, 2 voice, -1 unknown
const todo = games.map((g) => String(g.appid)).filter((id) => !(id in lang)).slice(0, 150);   // the store allows ~200 requests per 5 min
for (const id of todo) {
  try {
    const r = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&filters=basic&l=english`);
    if (r.status === 429) break;
    const j = r.ok ? await r.json() : null, d = j && j[id];
    if (!d || !d.success) lang[id] = -1;
    else { const s = d.data.supported_languages || ''; const m = /Japanese(<strong>\*<\/strong>)?/i.exec(s); lang[id] = !m ? 0 : m[1] ? 2 : 1; }
  } catch (e) { lang[id] = -1; }
  await new Promise((res) => setTimeout(res, 1600));
}
fs.writeFileSync(CACHE, JSON.stringify(lang));
const known = games.filter((g) => lang[g.appid] >= 0);
data.japanese = { games: known.filter((g) => lang[g.appid] >= 1).length, voice: known.filter((g) => lang[g.appid] === 2).length,
                  checked: games.filter((g) => String(g.appid) in lang).length, total: games.length };

for (const f of fs.readdirSync('steam/img')) if (!keep.has(f)) fs.unlinkSync(`steam/img/${f}`);   // drop images no longer shown
const old = fs.existsSync('steam/steam.json') ? JSON.parse(fs.readFileSync('steam/steam.json', 'utf8')) : {};
const same = JSON.stringify({ ...old, updated: 0 }) === JSON.stringify({ ...data, updated: 0 });
if (same) { console.log('no change'); process.exit(0); }
fs.writeFileSync('steam/steam.json', JSON.stringify({ ...data, updated: new Date().toISOString() }, null, 1));
console.log(`updated: ${data.games} games, ${hours} h, level ${data.level}, ${data.badges} badges, ${data.recent.length} recent`);

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
const data = {
  games: owned.game_count, hours, level: level.player_level ?? null,
  badges: (badges.badges || []).length, xp: badges.player_xp ?? null,
  recent: await Promise.all((recent.games || []).map((g) => pick(g, { hours2w: Math.round((g.playtime_2weeks || 0) / 6) / 10 }))),
  mostPlayed: await Promise.all(top.map((g) => pick(g, {}))),
};
for (const f of fs.readdirSync('steam/img')) if (!keep.has(f)) fs.unlinkSync(`steam/img/${f}`);   // drop images no longer shown
const old = fs.existsSync('steam/steam.json') ? JSON.parse(fs.readFileSync('steam/steam.json', 'utf8')) : {};
const same = JSON.stringify({ ...old, updated: 0 }) === JSON.stringify({ ...data, updated: 0 });
if (same) { console.log('no change'); process.exit(0); }
fs.writeFileSync('steam/steam.json', JSON.stringify({ ...data, updated: new Date().toISOString() }, null, 1));
console.log(`updated: ${data.games} games, ${hours} h, level ${data.level}, ${data.badges} badges, ${data.recent.length} recent`);

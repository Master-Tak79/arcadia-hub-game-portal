const ADMIN_GAMES_KEY = "arcadia_hub_admin_games_v1";

function readRaw() {
  try {
    const raw = localStorage.getItem(ADMIN_GAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeRaw(games) {
  localStorage.setItem(ADMIN_GAMES_KEY, JSON.stringify(games));
}

export function listAdminGames() {
  return readRaw();
}

export function upsertAdminGame(game) {
  const games = readRaw();
  const idx = games.findIndex((g) => g.id === game.id);
  if (idx >= 0) games[idx] = game;
  else games.unshift(game);
  writeRaw(games);
}

export function removeAdminGame(id) {
  const games = readRaw().filter((g) => g.id !== id);
  writeRaw(games);
}

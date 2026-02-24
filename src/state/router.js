const GAME_ROUTE_PREFIX = "#/game/";

export function getRouteGameId(hash = window.location.hash) {
  if (!hash.startsWith(GAME_ROUTE_PREFIX)) return null;
  const id = decodeURIComponent(hash.slice(GAME_ROUTE_PREFIX.length));
  return id || null;
}

export function openGameRoute(gameId) {
  const nextHash = `${GAME_ROUTE_PREFIX}${encodeURIComponent(gameId)}`;
  if (window.location.hash !== nextHash) window.location.hash = nextHash;
}

export function clearGameRoute() {
  if (!window.location.hash.startsWith(GAME_ROUTE_PREFIX)) return;
  history.pushState("", document.title, `${window.location.pathname}${window.location.search}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function onRouteChange(callback) {
  const handler = () => callback(getRouteGameId());
  window.addEventListener("hashchange", handler);
  callback(getRouteGameId());
  return () => window.removeEventListener("hashchange", handler);
}

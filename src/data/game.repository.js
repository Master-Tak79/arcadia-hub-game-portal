import { gameSeed } from "./games.seed.js";
import { GAME_DEFAULT_VERSION, normalizeVersion } from "../config/version.js";
import { listAdminGames } from "./admin.storage.js";

function sanitizeMediaPath(value) {
  const path = String(value || "").trim();
  if (!path) return "";
  if (/^javascript:/i.test(path)) return "";
  return path;
}

function uniqueList(list) {
  const seen = new Set();
  const out = [];
  list.forEach((item) => {
    if (!item || seen.has(item)) return;
    seen.add(item);
    out.push(item);
  });
  return out;
}

function normalizeText(value = "") {
  return String(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function toSafeTimestamp(value) {
  const ts = Date.parse(String(value || ""));
  return Number.isFinite(ts) ? ts : 0;
}

function isImplementedGame(game) {
  const raw = String(game?.playUrl || "").trim();
  if (!raw) return false;

  const lowerRaw = raw.toLowerCase();
  if (/^(?:\.\/)?games\//.test(lowerRaw) || /^\/games\//.test(lowerRaw)) {
    return true;
  }

  try {
    const parsed = new URL(raw, "https://arcadia.local");
    const path = parsed.pathname.toLowerCase();
    if (!path.includes("/games/")) return false;
    return /\/games\/[^/?#]+(?:\/index\.html|\/?)$/.test(path);
  } catch {
    return false;
  }
}

function gamePriority(game) {
  let score = 0;
  if (isImplementedGame(game)) score += 1000;
  if (game?.featured) score += 120;
  score += Math.max(0, Number(game?.popularity || 0));
  score += toSafeTimestamp(game?.updatedAt) / 1_000_000_000_000;
  return score;
}

function pickPreferredGame(a, b) {
  return gamePriority(b) > gamePriority(a) ? b : a;
}

function mergeSeedWithAdmin(seedGame, adminGame) {
  const merged = {
    ...seedGame,
    ...adminGame,
  };

  // core seed 게임이 구현 상태인데 admin 값이 외부/빈 링크로 덮어쓰면
  // 포털 상단 우선순위가 무너질 수 있어 seed playUrl을 보호한다.
  if (isImplementedGame(seedGame) && !isImplementedGame(merged)) {
    merged.playUrl = seedGame.playUrl;
  }

  // seed featured true를 admin false로 낮추는 경우, 기본 노출 우선 정책 유지
  if (seedGame.featured && !adminGame.featured) {
    merged.featured = true;
  }

  // 인기도는 하향 덮어쓰기보다 최대값 유지(상단 노출 안정성)
  merged.popularity = Math.max(Number(seedGame.popularity || 0), Number(merged.popularity || 0));

  return merged;
}

function dedupeByTitle(games) {
  const map = new Map();

  games.forEach((game) => {
    const titleKey = normalizeText(game?.title);
    const key = titleKey || `__id:${String(game?.id || "unknown")}`;

    const prev = map.get(key);
    if (!prev) {
      map.set(key, game);
      return;
    }

    map.set(key, pickPreferredGame(prev, game));
  });

  return [...map.values()];
}

function withDefaults(game) {
  const screenshotsRaw = Array.isArray(game.screenshots)
    ? game.screenshots.map((v) => sanitizeMediaPath(v)).filter(Boolean)
    : [];

  const screenshots = uniqueList(screenshotsRaw);
  const previewImage = sanitizeMediaPath(game.previewImage) || screenshots[0] || "";

  return {
    studio: "Arcadia Studio",
    difficulty: "보통",
    estimatedPlayTime: "10~20분",
    controls: "마우스 또는 키보드 기본 입력",
    longDescription: `${game.description} 반복 플레이 중심으로 설계되어 짧은 세션에서도 성취감을 주는 구조입니다. 향후 랭킹/도전과제/이벤트 모드를 연동하기 좋도록 데이터 키를 분리해 둔 상태입니다.`,
    category: "트렌딩",
    ...game,
    previewImage,
    screenshots: screenshots.length ? screenshots : previewImage ? [previewImage] : [],
    version: normalizeVersion(game.version, GAME_DEFAULT_VERSION),
  };
}

function mergeGames(seed, admins) {
  const seedById = new Map(seed.map((g) => [g.id, g]));
  const byId = new Map(seedById);

  admins.forEach((adminGame) => {
    if (!adminGame?.id) return;

    const current = byId.get(adminGame.id);
    if (!current) {
      byId.set(adminGame.id, adminGame);
      return;
    }

    if (seedById.has(adminGame.id)) {
      const merged = mergeSeedWithAdmin(seedById.get(adminGame.id), adminGame);
      byId.set(adminGame.id, pickPreferredGame(current, merged));
      return;
    }

    byId.set(adminGame.id, pickPreferredGame(current, adminGame));
  });

  return dedupeByTitle([...byId.values()]);
}

export async function listGames() {
  // 추후 여기서 `/api/games` 호출로 교체 예정
  await new Promise((resolve) => setTimeout(resolve, 40));
  const merged = mergeGames(gameSeed, listAdminGames());
  return merged.map(withDefaults);
}

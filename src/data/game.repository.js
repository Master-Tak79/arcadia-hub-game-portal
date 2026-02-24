import { gameSeed } from "./games.seed.js";
import { GAME_DEFAULT_VERSION, normalizeVersion } from "../config/version.js";
import { listAdminGames } from "./admin.storage.js";

function withDefaults(game) {
  return {
    studio: "Arcadia Studio",
    difficulty: "보통",
    estimatedPlayTime: "10~20분",
    controls: "마우스 또는 키보드 기본 입력",
    longDescription: `${game.description} 반복 플레이 중심으로 설계되어 짧은 세션에서도 성취감을 주는 구조입니다. 향후 랭킹/도전과제/이벤트 모드를 연동하기 좋도록 데이터 키를 분리해 둔 상태입니다.`,
    category: "트렌딩",
    ...game,
    version: normalizeVersion(game.version, GAME_DEFAULT_VERSION),
  };
}

function mergeGames(seed, admins) {
  const map = new Map();
  seed.forEach((g) => map.set(g.id, g));
  admins.forEach((g) => map.set(g.id, g));
  return [...map.values()];
}

export async function listGames() {
  // 추후 여기서 `/api/games` 호출로 교체 예정
  await new Promise((resolve) => setTimeout(resolve, 40));
  const merged = mergeGames(gameSeed, listAdminGames());
  return merged.map(withDefaults);
}

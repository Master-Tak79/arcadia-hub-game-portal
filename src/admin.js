import { listAdminGames, removeAdminGame, upsertAdminGame } from "./data/admin.storage.js";
import { GAME_DEFAULT_VERSION, PORTAL_VERSION, normalizeVersion } from "./config/version.js";

const els = {
  gameForm: document.getElementById("gameForm"),
  adminList: document.getElementById("adminList"),
  resetFormBtn: document.getElementById("resetFormBtn"),
  portalVersionText: document.getElementById("portalVersionText"),
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fillForm(game) {
  const f = els.gameForm;
  f.id.value = game.id || "";
  f.title.value = game.title || "";
  f.genre.value = game.genre || "";
  f.category.value = game.category || "";
  f.platform.value = game.platform || "cross";
  f.popularity.value = game.popularity || 80;
  f.version.value = game.version || GAME_DEFAULT_VERSION;
  f.updatedAt.value = game.updatedAt || today();
  f.playUrl.value = game.playUrl || "";
  f.studio.value = game.studio || "Arcadia Studio";
  f.difficulty.value = game.difficulty || "보통";
  f.estimatedPlayTime.value = game.estimatedPlayTime || "10~20분";
  f.controls.value = game.controls || "마우스 또는 키보드 기본 입력";
  f.tags.value = (game.tags || []).join(", ");
  f.description.value = game.description || "";
  f.longDescription.value = game.longDescription || "";
}

function resetForm() {
  els.gameForm.reset();
  els.gameForm.updatedAt.value = today();
  els.gameForm.platform.value = "cross";
  els.gameForm.popularity.value = 80;
  els.gameForm.version.value = GAME_DEFAULT_VERSION;
  els.gameForm.studio.value = "Arcadia Studio";
  els.gameForm.difficulty.value = "보통";
  els.gameForm.estimatedPlayTime.value = "10~20분";
  els.gameForm.controls.value = "마우스 또는 키보드 기본 입력";
}

function renderAdminList() {
  const games = listAdminGames();
  els.adminList.innerHTML = "";

  if (!games.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "등록된 커스텀 게임이 없습니다.";
    els.adminList.appendChild(empty);
    return;
  }

  games.forEach((game) => {
    const item = document.createElement("article");
    item.className = "admin-item";
    item.innerHTML = `
      <h4>${game.title} <small>(${game.id})</small></h4>
      <p>${game.genre} · ${game.category} · ${game.platform} · 인기도 ${game.popularity} · v${game.version || GAME_DEFAULT_VERSION}</p>
      <p>${game.updatedAt} · ${game.playUrl}</p>
      <div class="button-row">
        <button class="small-btn" data-action="edit">수정</button>
        <button class="small-btn" data-action="delete">삭제</button>
      </div>
    `;

    item.querySelector('[data-action="edit"]').addEventListener("click", () => fillForm(game));
    item.querySelector('[data-action="delete"]').addEventListener("click", () => {
      if (!confirm(`'${game.title}'을(를) 삭제할까요?`)) return;
      removeAdminGame(game.id);
      renderAdminList();
    });

    els.adminList.appendChild(item);
  });
}

function bindEvents() {
  els.gameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(els.gameForm);

    const game = {
      id: String(f.get("id") || "").trim(),
      title: String(f.get("title") || "").trim(),
      genre: String(f.get("genre") || "").trim(),
      category: String(f.get("category") || "").trim(),
      platform: String(f.get("platform") || "cross"),
      popularity: Number(f.get("popularity") || 80),
      version: normalizeVersion(f.get("version"), GAME_DEFAULT_VERSION),
      updatedAt: String(f.get("updatedAt") || today()),
      playUrl: String(f.get("playUrl") || "").trim(),
      studio: String(f.get("studio") || "Arcadia Studio").trim(),
      difficulty: String(f.get("difficulty") || "보통").trim(),
      estimatedPlayTime: String(f.get("estimatedPlayTime") || "10~20분").trim(),
      controls: String(f.get("controls") || "마우스 또는 키보드 기본 입력").trim(),
      tags: String(f.get("tags") || "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      description: String(f.get("description") || "").trim(),
      longDescription: String(f.get("longDescription") || "").trim(),
      featured: false,
      thumbGradient: ["#4a5cff", "#19c2d5"],
    };

    if (!game.id || !game.title || !game.description || !game.playUrl) {
      alert("필수 항목(ID, 이름, 설명, 링크)을 입력해 주세요.");
      return;
    }

    upsertAdminGame(game);
    renderAdminList();
    alert("저장 완료. 포털 페이지 새로고침 시 반영됩니다.");
  });

  els.resetFormBtn.addEventListener("click", resetForm);
}

if (els.portalVersionText) {
  els.portalVersionText.textContent = `Portal v${PORTAL_VERSION}`;
}

resetForm();
bindEvents();
renderAdminList();

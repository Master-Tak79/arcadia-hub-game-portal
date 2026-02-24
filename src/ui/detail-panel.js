import { gradient, toPlatformLabel, toUpdatedLabel } from "../utils/format.js";

function clear(node) {
  node.innerHTML = "";
}

function createPill(text) {
  const span = document.createElement("span");
  span.className = "detail-pill";
  span.textContent = text;
  return span;
}

export function setDetailVisible(overlay, visible) {
  overlay.classList.toggle("hidden", !visible);
  overlay.setAttribute("aria-hidden", String(!visible));
  document.body.classList.toggle("lock-scroll", visible);
}

export function renderDetail({
  refs,
  game,
  isFavorite,
  onToggleFavorite,
}) {
  refs.hero.style.background = gradient(game.thumbGradient);
  refs.title.textContent = game.title;
  refs.description.textContent = game.description;
  refs.controls.textContent = game.controls;
  refs.longDescription.textContent = game.longDescription;

  clear(refs.meta);
  refs.meta.appendChild(createPill(game.genre));
  refs.meta.appendChild(createPill(toPlatformLabel(game.platform)));
  refs.meta.appendChild(createPill(`v${game.version || "0.1.0"}`));
  refs.meta.appendChild(createPill(`인기도 ${game.popularity}`));
  refs.meta.appendChild(createPill(`난이도 ${game.difficulty}`));
  refs.meta.appendChild(createPill(`플레이 ${game.estimatedPlayTime}`));
  refs.meta.appendChild(createPill(toUpdatedLabel(game.updatedAt)));
  refs.meta.appendChild(createPill(`스튜디오 ${game.studio}`));

  clear(refs.tags);
  game.tags.forEach((tagText) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = `#${tagText}`;
    refs.tags.appendChild(tag);
  });

  refs.playLink.href = game.playUrl;

  const favored = isFavorite(game.id);
  refs.favBtn.textContent = favored ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기";
  refs.favBtn.onclick = () => onToggleFavorite(game.id);
}

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

function appendScreenshotEmpty(node) {
  const empty = document.createElement("p");
  empty.className = "detail-screenshots-empty";
  empty.textContent = "등록된 스크린샷이 없습니다.";
  node.appendChild(empty);
}

function renderScreenshots(node, game) {
  clear(node);

  const shots = [...(game.screenshots || [])];
  if (!shots.length && game.previewImage) {
    shots.push(game.previewImage);
  }

  if (!shots.length) {
    appendScreenshotEmpty(node);
    return;
  }

  shots.slice(0, 6).forEach((src, idx) => {
    const img = document.createElement("img");
    img.className = "detail-shot";
    img.src = src;
    img.alt = `${game.title} 스크린샷 ${idx + 1}`;
    img.loading = "lazy";
    img.decoding = "async";
    img.onerror = () => {
      img.remove();
      if (!node.querySelector(".detail-shot")) {
        appendScreenshotEmpty(node);
      }
    };
    node.appendChild(img);
  });
}

export function renderDetail({
  refs,
  game,
  isFavorite,
  onToggleFavorite,
}) {
  const heroBg = game.previewImage
    ? `linear-gradient(180deg, rgba(9,16,39,0.15), rgba(9,16,39,0.65)), url("${game.previewImage}") center / cover`
    : gradient(game.thumbGradient);

  refs.hero.style.background = heroBg;
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

  renderScreenshots(refs.screenshots, game);

  refs.playLink.href = game.playUrl;

  const favored = isFavorite(game.id);
  refs.favBtn.textContent = favored ? "★ 즐겨찾기 해제" : "☆ 즐겨찾기";
  refs.favBtn.onclick = () => onToggleFavorite(game.id);
}

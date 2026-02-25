import { gradient, toPlatformLabel, toUpdatedLabel } from "../utils/format.js";

function clear(node) {
  node.replaceChildren();
}

function appendEmptyState(node, text) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = text;
  node.appendChild(empty);
}

function buildChip({ text, value, isActive, className = "chip", dataKey = "genre" }) {
  const chip = document.createElement("button");
  chip.className = `${className} ${isActive ? "active" : ""}`;
  chip.dataset[dataKey] = value;
  chip.type = "button";
  chip.textContent = text;
  return chip;
}

export function renderGenreChips(container, genres, activeGenre) {
  clear(container);
  container.appendChild(
    buildChip({ text: "전체", value: "all", isActive: activeGenre === "all", dataKey: "genre" })
  );

  genres.forEach((genre) => {
    container.appendChild(
      buildChip({ text: genre, value: genre, isActive: activeGenre === genre, dataKey: "genre" })
    );
  });
}

export function renderCategoryTabs(container, categories, activeCategory) {
  clear(container);
  container.appendChild(
    buildChip({
      text: "ALL",
      value: "all",
      isActive: activeCategory === "all",
      className: "category-tab",
      dataKey: "category",
    })
  );

  categories.forEach((category) => {
    container.appendChild(
      buildChip({
        text: category,
        value: category,
        isActive: activeCategory === category,
        className: "category-tab",
        dataKey: "category",
      })
    );
  });
}

export function renderGameCards({
  container,
  template,
  games,
  isFavorite,
  onToggleFavorite,
  onOpenDetail,
}) {
  clear(container);

  if (!games.length) {
    appendEmptyState(container, "조건에 맞는 게임이 없습니다. 필터를 조정해 주세요.");
    return;
  }

  games.forEach((game) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.gameId = game.id;

    const thumb = node.querySelector(".thumb");
    thumb.style.background = gradient(game.thumbGradient);

    const thumbImg = node.querySelector(".thumb-img");
    const thumbChip = node.querySelector(".thumb-chip");
    if (game.previewImage) {
      thumbImg.src = game.previewImage;
      thumbImg.alt = `${game.title} 미리보기`;
      thumbImg.classList.add("visible");
      thumbChip.hidden = false;
      node.classList.add("has-preview");

      thumbImg.onerror = () => {
        thumbImg.removeAttribute("src");
        thumbImg.alt = "";
        thumbImg.classList.remove("visible");
        thumbChip.hidden = true;
        node.classList.remove("has-preview");
      };
    } else {
      thumbImg.removeAttribute("src");
      thumbImg.alt = "";
      thumbImg.classList.remove("visible");
      thumbChip.hidden = true;
      node.classList.remove("has-preview");
      thumbImg.onerror = null;
    }

    node.querySelector(".title").textContent = game.title;
    node.querySelector(".desc").textContent = game.description;
    node.querySelector(".platform").textContent = toPlatformLabel(game.platform);
    node.querySelector(".updated").textContent = `${toUpdatedLabel(game.updatedAt)} · v${game.version || "0.1.0"}`;

    const favBtn = node.querySelector(".fav-btn");
    const favored = isFavorite(game.id);
    favBtn.textContent = favored ? "★" : "☆";
    favBtn.setAttribute("aria-label", favored ? "즐겨찾기 해제" : "즐겨찾기 추가");
    favBtn.addEventListener("click", () => onToggleFavorite(game.id));

    const detailBtn = node.querySelector(".detail-btn");
    detailBtn.addEventListener("click", () => onOpenDetail(game.id));

    const tagWrap = node.querySelector(".tag-wrap");
    game.tags.forEach((tagText) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = `#${tagText}`;
      tagWrap.appendChild(tag);
    });

    const playLink = node.querySelector(".play-link");
    playLink.href = game.playUrl;

    container.appendChild(node);
  });
}

export function renderRecentList(container, games, onOpenDetail) {
  clear(container);

  if (!games.length) {
    appendEmptyState(container, "최근 업데이트 게임이 없습니다.");
    return;
  }

  games.forEach((game) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "recent-item";

    const title = document.createElement("p");
    title.className = "recent-title";
    title.textContent = game.title;

    const meta = document.createElement("span");
    meta.className = "recent-meta";
    meta.textContent = `${toPlatformLabel(game.platform)} · ${game.genre}`;

    const date = document.createElement("span");
    date.className = "recent-date";
    date.textContent = game.updatedAt;

    item.append(title, meta, date);
    item.addEventListener("click", () => onOpenDetail(game.id));
    container.appendChild(item);
  });
}

export function updateStats(node, { totalCount, visibleCount, favoriteCount, onlyFavorites }) {
  node.textContent = `표시 ${visibleCount}/${totalCount} · 즐겨찾기 ${favoriteCount}${
    onlyFavorites ? " · 즐겨찾기 필터 ON" : ""
  }`;
}

export function updateLoadMoreStatus(node, hasMore) {
  if (!node) return;
  node.textContent = hasMore ? "아래로 스크롤하면 더 로드됩니다" : "모든 게임을 표시했습니다";
}

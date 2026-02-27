import { gameCategories, gameGenres } from "./data/games.seed.js";
import { listGames } from "./data/game.repository.js";
import { PORTAL_VERSION } from "./config/version.js";
import { createStore } from "./state/store.js";
import { clearGameRoute, onRouteChange, openGameRoute } from "./state/router.js";
import {
  renderCategoryTabs,
  renderGameCards,
  renderGenreChips,
  updateLoadMoreStatus,
  updateStats,
} from "./ui/renderers.js";
import { renderDetail, setDetailVisible } from "./ui/detail-panel.js";

const els = {
  searchInput: document.getElementById("searchInput"),
  platformSelect: document.getElementById("platformSelect"),
  sortSelect: document.getElementById("sortSelect"),
  genreChips: document.getElementById("genreChips"),
  categoryTabs: document.getElementById("categoryTabs"),
  showAllBtn: document.getElementById("showAllBtn"),
  showFavoritesBtn: document.getElementById("showFavoritesBtn"),
  updateNoticeBtn: document.getElementById("updateNoticeBtn"),
  featuredGrid: document.getElementById("featuredGrid"),
  gameGrid: document.getElementById("gameGrid"),
  cardTemplate: document.getElementById("gameCardTemplate"),
  statsText: document.getElementById("statsText"),
  portalVersionText: document.getElementById("portalVersionText"),
  loadMoreSentinel: document.getElementById("loadMoreSentinel"),
  loadMoreText: document.getElementById("loadMoreText"),

  updateOverlay: document.getElementById("updateOverlay"),
  updateBackdrop: document.querySelector("[data-close-update='true']"),
  updateCloseBtn: document.getElementById("updateCloseBtn"),
  updateSummary: document.getElementById("updateSummary"),
  updateList: document.getElementById("updateList"),

  detailOverlay: document.getElementById("detailOverlay"),
  detailBackdrop: document.querySelector("[data-close-detail='true']"),
  detailCloseBtn: document.getElementById("detailCloseBtn"),
  detailHero: document.getElementById("detailHero"),
  detailTitle: document.getElementById("detailTitle"),
  detailDescription: document.getElementById("detailDescription"),
  detailMeta: document.getElementById("detailMeta"),
  detailTags: document.getElementById("detailTags"),
  detailPlayLink: document.getElementById("detailPlayLink"),
  detailFavBtn: document.getElementById("detailFavBtn"),
  detailControls: document.getElementById("detailControls"),
  detailLongDescription: document.getElementById("detailLongDescription"),
  detailScreenshots: document.getElementById("detailScreenshots"),
};

const store = createStore([]);
let currentRouteGameId = null;
let observer = null;
let resizeTimer = null;
let featuredExcludeIds = [];

function clearNode(node) {
  if (!node) return;
  node.replaceChildren();
}

function setUpdateVisible(visible) {
  els.updateOverlay.classList.toggle("hidden", !visible);
  els.updateOverlay.setAttribute("aria-hidden", String(!visible));

  const hasOpenOverlay = document.querySelector(".detail-overlay:not(.hidden)");
  document.body.classList.toggle("lock-scroll", Boolean(hasOpenOverlay));
}

function getUpdateGames() {
  return store.getRecentUpdatedGames(999);
}

function renderUpdateNoticeSummary(games) {
  if (!els.updateNoticeBtn) return;
  if (!games.length) {
    els.updateNoticeBtn.textContent = "공지 · 업데이트 없음";
    return;
  }

  const latest = games[0];
  els.updateNoticeBtn.textContent = `공지 · ${latest.updatedAt} · ${games.length}종`;
}

function renderUpdateList(games) {
  if (!els.updateList || !els.updateSummary) return;

  clearNode(els.updateList);

  if (!games.length) {
    els.updateSummary.textContent = "표시할 업데이트 항목이 없습니다.";
    return;
  }

  const latest = games[0];
  els.updateSummary.textContent = `Portal v${PORTAL_VERSION} · 최신 업데이트 ${latest.updatedAt} · 총 ${games.length}종`;

  games.forEach((game) => {
    const item = document.createElement("article");
    item.className = "update-item";

    const head = document.createElement("div");
    head.className = "update-item-head";

    const title = document.createElement("h4");
    title.textContent = game.title;

    const meta = document.createElement("p");
    meta.className = "update-item-meta";
    meta.textContent = `${game.updatedAt} · v${game.version || "0.1.0"} · ${game.genre}`;

    const desc = document.createElement("p");
    desc.className = "update-item-desc";
    desc.textContent = game.description;

    head.append(title, meta);
    item.append(head, desc);
    els.updateList.appendChild(item);
  });
}

function openUpdateOverlay() {
  clearGameRoute();
  renderUpdateList(getUpdateGames());
  setUpdateVisible(true);
}

function closeUpdateOverlay() {
  setUpdateVisible(false);
}

function render() {
  const filters = store.getFilters();
  const featuredGames = store.getFeaturedGames();
  featuredExcludeIds = featuredGames.map((g) => g.id);

  const visibleGames = store.getVisibleGames(featuredExcludeIds);
  const updateGames = getUpdateGames();

  renderGenreChips(els.genreChips, gameGenres, filters.genre);
  renderCategoryTabs(els.categoryTabs, gameCategories, filters.category);

  renderGameCards({
    container: els.featuredGrid,
    template: els.cardTemplate,
    games: featuredGames,
    isFavorite: store.isFavorite,
    onToggleFavorite: handleToggleFavorite,
    onOpenDetail: openGameRoute,
  });

  renderGameCards({
    container: els.gameGrid,
    template: els.cardTemplate,
    games: visibleGames,
    isFavorite: store.isFavorite,
    onToggleFavorite: handleToggleFavorite,
    onOpenDetail: openGameRoute,
  });

  updateStats(els.statsText, {
    totalCount: store.getTotalCount(),
    visibleCount: visibleGames.length + featuredGames.length,
    favoriteCount: store.getFavoriteCount(),
    onlyFavorites: store.isOnlyFavorites(),
  });

  renderUpdateNoticeSummary(updateGames);
  if (!els.updateOverlay.classList.contains("hidden")) {
    renderUpdateList(updateGames);
  }

  updateLoadMoreStatus(els.loadMoreText, store.canLoadMore(featuredExcludeIds));
  syncDetailPanel();
}

function handleToggleFavorite(gameId) {
  store.toggleFavorite(gameId);
  render();
}

function syncDetailPanel() {
  if (!currentRouteGameId) {
    setDetailVisible(els.detailOverlay, false);
    return;
  }

  const game = store.getGameById(currentRouteGameId);
  if (!game) {
    setDetailVisible(els.detailOverlay, false);
    return;
  }

  renderDetail({
    refs: {
      hero: els.detailHero,
      title: els.detailTitle,
      description: els.detailDescription,
      meta: els.detailMeta,
      tags: els.detailTags,
      playLink: els.detailPlayLink,
      favBtn: els.detailFavBtn,
      controls: els.detailControls,
      longDescription: els.detailLongDescription,
      screenshots: els.detailScreenshots,
    },
    game,
    isFavorite: store.isFavorite,
    onToggleFavorite: handleToggleFavorite,
  });

  setDetailVisible(els.detailOverlay, true);
}

function bindInfiniteScroll() {
  if (!els.loadMoreSentinel || observer) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        if (!store.canLoadMore(featuredExcludeIds)) return;
        store.increaseVisibleLimit(12);
        render();
      });
    },
    {
      root: null,
      rootMargin: "0px 0px 160px 0px",
      threshold: 0,
    }
  );

  observer.observe(els.loadMoreSentinel);
}

function bindEvents() {
  els.searchInput.addEventListener("input", (e) => {
    store.setFilter("query", e.target.value);
    render();
  });

  els.platformSelect.addEventListener("change", (e) => {
    store.setFilter("platform", e.target.value);
    render();
  });

  els.sortSelect.addEventListener("change", (e) => {
    store.setFilter("sort", e.target.value);
    render();
  });

  els.genreChips.addEventListener("click", (e) => {
    const target = e.target.closest(".chip");
    if (!target) return;
    store.setFilter("genre", target.dataset.genre || "all");
    render();
  });

  els.categoryTabs.addEventListener("click", (e) => {
    const target = e.target.closest(".category-tab");
    if (!target) return;
    store.setFilter("category", target.dataset.category || "all");
    render();
  });

  els.showAllBtn.addEventListener("click", () => {
    store.setOnlyFavorites(false);
    render();
  });

  els.showFavoritesBtn.addEventListener("click", () => {
    store.setOnlyFavorites(true);
    render();
  });

  els.updateNoticeBtn.addEventListener("click", openUpdateOverlay);
  els.updateCloseBtn.addEventListener("click", closeUpdateOverlay);
  els.updateBackdrop.addEventListener("click", closeUpdateOverlay);

  els.detailCloseBtn.addEventListener("click", clearGameRoute);
  els.detailBackdrop.addEventListener("click", clearGameRoute);

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!els.updateOverlay.classList.contains("hidden")) {
      closeUpdateOverlay();
      return;
    }
    clearGameRoute();
  });

  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      render();
    }, 80);
  });

  onRouteChange((gameId) => {
    currentRouteGameId = gameId;
    syncDetailPanel();
  });
}

async function bootstrap() {
  if (els.portalVersionText) {
    els.portalVersionText.textContent = `Portal v${PORTAL_VERSION}`;
  }

  const initialGames = await listGames();
  store.setGames(initialGames);
  bindEvents();
  bindInfiniteScroll();
  render();
}

bootstrap();

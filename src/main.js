import { gameCategories, gameGenres } from "./data/games.seed.js";
import { listGames } from "./data/game.repository.js";
import { PORTAL_VERSION } from "./config/version.js";
import { createStore } from "./state/store.js";
import { clearGameRoute, onRouteChange, openGameRoute } from "./state/router.js";
import {
  renderCategoryTabs,
  renderGameCards,
  renderGenreChips,
  renderRecentList,
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
  refreshBtn: document.getElementById("refreshBtn"),
  featuredGrid: document.getElementById("featuredGrid"),
  gameGrid: document.getElementById("gameGrid"),
  recentList: document.getElementById("recentList"),
  cardTemplate: document.getElementById("gameCardTemplate"),
  statsText: document.getElementById("statsText"),
  portalVersionText: document.getElementById("portalVersionText"),
  loadMoreSentinel: document.getElementById("loadMoreSentinel"),
  loadMoreText: document.getElementById("loadMoreText"),

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

function render() {
  const filters = store.getFilters();
  const allGames = store.getFilteredGames();
  const visibleGames = store.getVisibleGames();
  const featuredGames = store.getFeaturedGames();
  const recentGames = store.getRecentUpdatedGames();

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

  renderRecentList(els.recentList, recentGames, openGameRoute);

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
    visibleCount: visibleGames.length,
    favoriteCount: store.getFavoriteCount(),
    onlyFavorites: store.isOnlyFavorites(),
  });

  updateLoadMoreStatus(els.loadMoreText, store.canLoadMore());
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
        if (!store.canLoadMore()) return;
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

  els.refreshBtn.addEventListener("click", async () => {
    const latestGames = await listGames();
    store.setGames(latestGames);
    render();
  });

  els.detailCloseBtn.addEventListener("click", clearGameRoute);
  els.detailBackdrop.addEventListener("click", clearGameRoute);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") clearGameRoute();
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

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
import { createUpdateNoticeController } from "./ui/update-notice.js";
import { renderFilterSummary } from "./ui/filter-summary.js";

const els = {
  searchInput: document.getElementById("searchInput"),
  platformSelect: document.getElementById("platformSelect"),
  sortSelect: document.getElementById("sortSelect"),
  genreChips: document.getElementById("genreChips"),
  categoryTabs: document.getElementById("categoryTabs"),
  showAllBtn: document.getElementById("showAllBtn"),
  showFavoritesBtn: document.getElementById("showFavoritesBtn"),
  resetFiltersBtn: document.getElementById("resetFiltersBtn"),
  updateNoticeBtn: document.getElementById("updateNoticeBtn"),
  featuredGrid: document.getElementById("featuredGrid"),
  gameGrid: document.getElementById("gameGrid"),
  activeFilterText: document.getElementById("activeFilterText"),
  activeFilterChips: document.getElementById("activeFilterChips"),
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

function getUpdateGames() {
  return store.getRecentUpdatedGames(999);
}

const updateNotice = createUpdateNoticeController({
  refs: {
    overlay: els.updateOverlay,
    backdrop: els.updateBackdrop,
    closeBtn: els.updateCloseBtn,
    summary: els.updateSummary,
    list: els.updateList,
    noticeBtn: els.updateNoticeBtn,
  },
  portalVersion: PORTAL_VERSION,
  onOpenGame: openGameRoute,
  onOpen: clearGameRoute,
});

function syncFilterFormValues() {
  const filters = store.getFilters();
  if (els.searchInput.value !== filters.query) els.searchInput.value = filters.query;
  if (els.platformSelect.value !== filters.platform) els.platformSelect.value = filters.platform;
  if (els.sortSelect.value !== filters.sort) els.sortSelect.value = filters.sort;
}

function resetFilters() {
  store.setFilter("query", "");
  store.setFilter("platform", "all");
  store.setFilter("sort", "popularity");
  store.setFilter("genre", "all");
  store.setFilter("category", "all");
  store.setOnlyFavorites(false);
  syncFilterFormValues();
  render();
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

  const activeFilterCount = renderFilterSummary({
    textNode: els.activeFilterText,
    chipsNode: els.activeFilterChips,
    filters,
    onlyFavorites: store.isOnlyFavorites(),
  });
  els.resetFiltersBtn.disabled = activeFilterCount === 0;

  updateNotice.renderSummary(updateGames);
  if (updateNotice.isVisible()) {
    updateNotice.renderList(updateGames);
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

  els.resetFiltersBtn.addEventListener("click", resetFilters);

  els.updateNoticeBtn.addEventListener("click", () => {
    updateNotice.open(getUpdateGames());
  });
  updateNotice.bindCloseEvents();

  els.detailCloseBtn.addEventListener("click", clearGameRoute);
  els.detailBackdrop.addEventListener("click", clearGameRoute);

  window.addEventListener("keydown", (e) => {
    const tag = e.target?.tagName;
    const isFormField = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

    if (e.key === "/" && !isFormField) {
      e.preventDefault();
      els.searchInput.focus();
      els.searchInput.select();
      return;
    }

    if (e.key.toLowerCase() === "u" && !isFormField) {
      e.preventDefault();
      updateNotice.open(getUpdateGames());
      return;
    }

    if (e.key.toLowerCase() === "f" && !isFormField) {
      e.preventDefault();
      store.setOnlyFavorites(!store.isOnlyFavorites());
      render();
      return;
    }

    if (e.key !== "Escape") return;
    if (updateNotice.isVisible()) {
      updateNotice.close();
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
  syncFilterFormValues();
  bindEvents();
  bindInfiniteScroll();
  render();
}

bootstrap();

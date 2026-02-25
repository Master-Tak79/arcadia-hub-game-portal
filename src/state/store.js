const FAVORITES_KEY = "arcadia_hub_favorites_v1";

export function createStore(initialGames = []) {
  let games = [...initialGames];
  let onlyFavorites = false;
  let visibleLimit = 12;

  const filters = {
    query: "",
    genre: "all",
    category: "all",
    platform: "all",
    sort: "popularity",
  };

  const favoriteSet = new Set(loadFavorites());

  function loadFavorites() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favoriteSet]));
  }

  function setGames(nextGames) {
    games = [...nextGames];
    resetVisibleLimit();
  }

  function toggleFavorite(gameId) {
    if (favoriteSet.has(gameId)) favoriteSet.delete(gameId);
    else favoriteSet.add(gameId);
    saveFavorites();
  }

  function setFilter(key, value) {
    if (key in filters) {
      filters[key] = value;
      resetVisibleLimit();
    }
  }

  function setOnlyFavorites(value) {
    onlyFavorites = Boolean(value);
    resetVisibleLimit();
  }

  function normalize(str = "") {
    return str.toLowerCase().trim();
  }

  function isImplementedGame(game) {
    return typeof game?.playUrl === "string" && game.playUrl.startsWith("./games/");
  }

  function compareImplementedFirst(a, b) {
    const ai = isImplementedGame(a) ? 1 : 0;
    const bi = isImplementedGame(b) ? 1 : 0;
    return bi - ai;
  }

  function getSorted(list) {
    if (filters.sort === "title") {
      return [...list].sort((a, b) => {
        const impl = compareImplementedFirst(a, b);
        if (impl !== 0) return impl;
        return a.title.localeCompare(b.title, "ko");
      });
    }

    if (filters.sort === "updated") {
      return [...list].sort((a, b) => {
        const impl = compareImplementedFirst(a, b);
        if (impl !== 0) return impl;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    }

    return [...list].sort((a, b) => {
      const impl = compareImplementedFirst(a, b);
      if (impl !== 0) return impl;
      return b.popularity - a.popularity;
    });
  }

  function getFilteredGames() {
    const q = normalize(filters.query);

    const filtered = games.filter((game) => {
      if (onlyFavorites && !favoriteSet.has(game.id)) return false;
      if (filters.genre !== "all" && game.genre !== filters.genre) return false;
      if (filters.category !== "all" && game.category !== filters.category) return false;
      if (filters.platform !== "all" && game.platform !== filters.platform) return false;

      if (!q) return true;
      const haystack = [game.title, game.description, ...(game.tags || [])].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    return getSorted(filtered);
  }

  function getVisibleGames() {
    return getFilteredGames().slice(0, visibleLimit);
  }

  function getFeaturedGames() {
    return getFilteredGames().filter((g) => g.featured).slice(0, 3);
  }

  function getRecentUpdatedGames(limit = 6) {
    return [...games]
      .sort((a, b) => {
        const impl = compareImplementedFirst(a, b);
        if (impl !== 0) return impl;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      })
      .slice(0, limit);
  }

  function getGameById(id) {
    return games.find((g) => g.id === id) || null;
  }

  function canLoadMore() {
    return visibleLimit < getFilteredGames().length;
  }

  function increaseVisibleLimit(step = 12) {
    visibleLimit += step;
  }

  function resetVisibleLimit() {
    visibleLimit = 12;
  }

  return {
    setGames,
    setFilter,
    toggleFavorite,
    setOnlyFavorites,
    getFilteredGames,
    getVisibleGames,
    getFeaturedGames,
    getRecentUpdatedGames,
    getGameById,
    canLoadMore,
    increaseVisibleLimit,
    resetVisibleLimit,
    getFilters: () => ({ ...filters }),
    isFavorite: (id) => favoriteSet.has(id),
    getFavoriteCount: () => favoriteSet.size,
    getTotalCount: () => games.length,
    isOnlyFavorites: () => onlyFavorites,
  };
}

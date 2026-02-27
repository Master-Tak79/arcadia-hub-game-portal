function clear(node) {
  if (!node) return;
  node.replaceChildren();
}

export function createUpdateNoticeController({ refs, portalVersion, onOpenGame, onOpen }) {
  function hasOpenOverlay() {
    return document.querySelector(".detail-overlay:not(.hidden)");
  }

  function setVisible(visible) {
    refs.overlay.classList.toggle("hidden", !visible);
    refs.overlay.setAttribute("aria-hidden", String(!visible));
    document.body.classList.toggle("lock-scroll", Boolean(hasOpenOverlay()));
  }

  function isVisible() {
    return !refs.overlay.classList.contains("hidden");
  }

  function renderSummary(games) {
    if (!refs.noticeBtn) return;

    if (!games.length) {
      refs.noticeBtn.textContent = "공지 · 업데이트 없음";
      return;
    }

    const latest = games[0];
    refs.noticeBtn.textContent = `공지 · ${latest.updatedAt} · ${games.length}종`;
  }

  function renderList(games) {
    if (!refs.list || !refs.summary) return;

    clear(refs.list);

    if (!games.length) {
      refs.summary.textContent = "표시할 업데이트 항목이 없습니다.";
      return;
    }

    const latest = games[0];
    refs.summary.textContent = `Portal v${portalVersion} · 최신 업데이트 ${latest.updatedAt} · 총 ${games.length}종`;

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

      const action = document.createElement("button");
      action.type = "button";
      action.className = "update-item-action";
      action.textContent = "게임 상세 보기";
      action.addEventListener("click", () => {
        setVisible(false);
        onOpenGame(game.id);
      });

      head.append(title, meta);
      item.append(head, desc, action);
      refs.list.appendChild(item);
    });
  }

  function open(games) {
    onOpen?.();
    renderList(games);
    setVisible(true);
  }

  function close() {
    setVisible(false);
  }

  function bindCloseEvents() {
    refs.closeBtn.addEventListener("click", close);
    refs.backdrop.addEventListener("click", close);
  }

  return {
    renderSummary,
    renderList,
    open,
    close,
    isVisible,
    bindCloseEvents,
  };
}

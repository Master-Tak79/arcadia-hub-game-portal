export function bindInput({
  canvas,
  buildButtons,
  endTurnBtn,
  startGame,
  setSelectedBuild,
  onBoardTap,
  onBoardHover,
  endTurn,
  togglePause,
  isRunning,
}) {
  buildButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.build;
      if (!key) return;
      setSelectedBuild(key);
    });
  });

  endTurnBtn.addEventListener("click", () => {
    if (!isRunning()) {
      startGame();
      return;
    }
    endTurn();
  });

  canvas.addEventListener("pointermove", (e) => {
    onBoardHover(e.clientX, e.clientY);
  });

  canvas.addEventListener("pointerleave", () => {
    onBoardHover(null, null);
  });

  canvas.addEventListener("click", (e) => {
    onBoardTap(e.clientX, e.clientY);
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "1") return setSelectedBuild("farm");
    if (key === "2") return setSelectedBuild("mine");
    if (key === "3") return setSelectedBuild("plant");
    if (key === "4") return setSelectedBuild("home");
    if (key === "5") return setSelectedBuild("market");

    if (e.key === "Enter") {
      e.preventDefault();
      if (!isRunning()) {
        startGame();
      } else {
        endTurn();
      }
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      endTurn();
      return;
    }

    if (key === "p") {
      e.preventDefault();
      togglePause();
    }
  });
}

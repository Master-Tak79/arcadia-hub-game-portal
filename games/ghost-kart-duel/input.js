let touchStartX = null;

export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  boostBtn,
  startGame,
  moveLane,
  triggerBoost,
  togglePause,
  isRunning,
}) {
  leftBtn.addEventListener("click", () => moveLane(-1));
  rightBtn.addEventListener("click", () => moveLane(1));

  boostBtn.addEventListener("click", () => {
    if (!isRunning()) {
      startGame();
      return;
    }
    triggerBoost();
  });

  canvas.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      touchStartX = touch.clientX;
    },
    { passive: true }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (!touch || touchStartX == null) return;

      const deltaX = touch.clientX - touchStartX;
      if (Math.abs(deltaX) < 24) return;

      moveLane(deltaX > 0 ? 1 : -1);
      touchStartX = touch.clientX;
    },
    { passive: true }
  );

  canvas.addEventListener("touchend", () => {
    touchStartX = null;
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key;
    const lower = key.toLowerCase();

    if (key === "ArrowLeft" || lower === "a") {
      moveLane(-1);
      return;
    }

    if (key === "ArrowRight" || lower === "d") {
      moveLane(1);
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (!isRunning()) {
        startGame();
      } else {
        triggerBoost();
      }
      return;
    }

    if (key === "Enter") {
      e.preventDefault();
      if (!isRunning()) startGame();
      return;
    }

    if (lower === "p") {
      e.preventDefault();
      togglePause();
    }
  });
}

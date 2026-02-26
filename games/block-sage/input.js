export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  rotateBtn,
  dropBtn,
  startGame,
  moveLeft,
  moveRight,
  rotate,
  drop,
  togglePause,
  isRunning,
}) {
  leftBtn.addEventListener("click", () => moveLeft());
  rightBtn.addEventListener("click", () => moveRight());
  rotateBtn.addEventListener("click", () => rotate());
  dropBtn.addEventListener("click", () => {
    if (!isRunning()) {
      startGame();
      return;
    }
    drop();
  });

  let touchStartX = null;
  canvas.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      touchStartX = t.clientX;
    },
    { passive: true }
  );

  canvas.addEventListener(
    "touchend",
    (e) => {
      const t = e.changedTouches[0];
      if (!t || touchStartX == null) return;
      const dx = t.clientX - touchStartX;
      if (Math.abs(dx) > 24) {
        if (dx < 0) moveLeft();
        else moveRight();
      }
      touchStartX = null;
    },
    { passive: true }
  );

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (e.key === "ArrowLeft" || key === "a") {
      e.preventDefault();
      moveLeft();
      return;
    }

    if (e.key === "ArrowRight" || key === "d") {
      e.preventDefault();
      moveRight();
      return;
    }

    if (e.key === "ArrowUp" || key === "w") {
      e.preventDefault();
      rotate();
      return;
    }

    if (e.key === "ArrowDown" || key === "s") {
      e.preventDefault();
      drop();
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (!isRunning()) {
        startGame();
      } else {
        drop();
      }
      return;
    }

    if (key === "p") {
      e.preventDefault();
      togglePause();
    }
  });
}

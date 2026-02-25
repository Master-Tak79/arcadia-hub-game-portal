export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  dashBtn,
  startGame,
  triggerDash,
  togglePause,
  setMove,
  isRunning,
}) {
  const leftDown = () => setMove(-1, true);
  const rightDown = () => setMove(1, true);
  const leftUp = () => setMove(-1, false);
  const rightUp = () => setMove(1, false);

  leftBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    leftDown();
  });
  rightBtn.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    rightDown();
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
    leftBtn.addEventListener(type, leftUp);
    rightBtn.addEventListener(type, rightUp);
  });

  dashBtn.addEventListener("click", () => {
    if (!isRunning()) {
      startGame();
      return;
    }
    triggerDash();
  });

  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (!isRunning()) return;
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      if (touch.clientX < centerX - 18) {
        setMove(-1, true);
        setMove(1, false);
      } else if (touch.clientX > centerX + 18) {
        setMove(1, true);
        setMove(-1, false);
      }
    },
    { passive: true }
  );

  canvas.addEventListener("touchend", () => {
    setMove(-1, false);
    setMove(1, false);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      setMove(-1, true);
      return;
    }

    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      setMove(1, true);
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (!isRunning()) {
        startGame();
      } else {
        triggerDash();
      }
      return;
    }

    if (e.key === "p" || e.key === "P") {
      e.preventDefault();
      togglePause();
    }
  });

  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      setMove(-1, false);
      return;
    }

    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      setMove(1, false);
    }
  });
}

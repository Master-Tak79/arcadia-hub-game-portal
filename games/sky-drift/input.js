export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  boostBtn,
  startGame,
  triggerBoost,
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

  leftBtn.addEventListener("pointerup", leftUp);
  leftBtn.addEventListener("pointercancel", leftUp);
  leftBtn.addEventListener("pointerleave", leftUp);
  rightBtn.addEventListener("pointerup", rightUp);
  rightBtn.addEventListener("pointercancel", rightUp);
  rightBtn.addEventListener("pointerleave", rightUp);

  boostBtn.addEventListener("click", (e) => {
    e.preventDefault();
    triggerBoost();
  });

  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (!isRunning()) return;
      const touch = e.touches[0];
      if (!touch) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      if (touch.clientX < centerX - 20) {
        setMove(-1, true);
        setMove(1, false);
      } else if (touch.clientX > centerX + 20) {
        setMove(1, true);
        setMove(-1, false);
      } else {
        setMove(-1, false);
        setMove(1, false);
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
        triggerBoost();
      }
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

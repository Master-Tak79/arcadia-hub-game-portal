export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  launchBtn,
  startGame,
  launchBall,
  togglePause,
  setMove,
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

  launchBtn.addEventListener("click", () => {
    launchBall();
  });

  canvas.addEventListener(
    "touchmove",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = canvas.getBoundingClientRect();
      const rel = (touch.clientX - rect.left) / rect.width;
      if (rel < 0.45) {
        setMove(-1, true);
        setMove(1, false);
      } else if (rel > 0.55) {
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
      startGame();
      launchBall();
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

export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  startGame,
  moveLeft,
  moveRight,
  isRunning,
}) {
  const swipe = { active: false, startX: 0 };

  function onMoveByDelta(dx) {
    if (Math.abs(dx) <= 24) return;
    if (dx > 0) moveRight();
    else moveLeft();
  }

  window.addEventListener("keydown", (e) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    if (e.key === "ArrowLeft" || key === "a") moveLeft();
    if (e.key === "ArrowRight" || key === "d") moveRight();
    if (e.key === " " && !isRunning()) startGame();
  });

  leftBtn.addEventListener("click", moveLeft);
  rightBtn.addEventListener("click", moveRight);

  canvas.addEventListener("pointerdown", (e) => {
    swipe.active = true;
    swipe.startX = e.clientX;
  });

  canvas.addEventListener("pointerup", (e) => {
    if (!swipe.active) return;
    swipe.active = false;
    onMoveByDelta(e.clientX - swipe.startX);
  });

  canvas.addEventListener("pointercancel", () => {
    swipe.active = false;
  });
}

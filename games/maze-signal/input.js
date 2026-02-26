export function bindInput({
  canvas,
  rerollBtn,
  scanBtn,
  startGame,
  rotateCellAt,
  rerollGrid,
  triggerScan,
  togglePause,
  isRunning,
}) {
  rerollBtn.addEventListener("click", () => {
    if (!isRunning()) {
      startGame();
      return;
    }
    rerollGrid();
  });

  scanBtn.addEventListener("click", () => {
    if (!isRunning()) {
      startGame();
      return;
    }
    triggerScan();
  });

  canvas.addEventListener("pointerdown", (e) => {
    if (!isRunning()) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    rotateCellAt(x, y);
  });

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "r") {
      if (!isRunning()) startGame();
      else rerollGrid();
      return;
    }

    if (key === "f") {
      if (!isRunning()) startGame();
      else triggerScan();
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (!isRunning()) startGame();
      else triggerScan();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (!isRunning()) startGame();
      return;
    }

    if (key === "p") {
      e.preventDefault();
      togglePause();
    }
  });
}

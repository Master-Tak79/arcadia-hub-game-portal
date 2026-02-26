function bindHoldButton(button, onDown, onUp) {
  button.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    onDown();
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach((type) => {
    button.addEventListener(type, onUp);
  });
}

function updateDirectionFromTouch(touch, canvas, setDirection) {
  const rect = canvas.getBoundingClientRect();
  const centerX = rect.left + rect.width * 0.5;
  const centerY = rect.top + rect.height * 0.5;
  const dx = touch.clientX - centerX;
  const dy = touch.clientY - centerY;
  const threshold = 18;

  setDirection("left", dx < -threshold);
  setDirection("right", dx > threshold);
  setDirection("up", dy < -threshold);
  setDirection("down", dy > threshold);
}

function clearDirections(setDirection) {
  setDirection("left", false);
  setDirection("right", false);
  setDirection("up", false);
  setDirection("down", false);
}

export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  upBtn,
  downBtn,
  dashBtn,
  startGame,
  triggerDash,
  togglePause,
  setDirection,
  isRunning,
}) {
  bindHoldButton(leftBtn, () => setDirection("left", true), () => setDirection("left", false));
  bindHoldButton(rightBtn, () => setDirection("right", true), () => setDirection("right", false));
  bindHoldButton(upBtn, () => setDirection("up", true), () => setDirection("up", false));
  bindHoldButton(downBtn, () => setDirection("down", true), () => setDirection("down", false));

  dashBtn.addEventListener("click", () => {
    if (!isRunning()) {
      startGame();
      return;
    }
    triggerDash();
  });

  canvas.addEventListener(
    "touchstart",
    (e) => {
      if (!isRunning()) return;
      const touch = e.touches[0];
      if (!touch) return;
      updateDirectionFromTouch(touch, canvas, setDirection);
    },
    { passive: true }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      if (!isRunning()) return;
      const touch = e.touches[0];
      if (!touch) return;
      updateDirectionFromTouch(touch, canvas, setDirection);
    },
    { passive: true }
  );

  canvas.addEventListener("touchend", () => clearDirections(setDirection));
  canvas.addEventListener("touchcancel", () => clearDirections(setDirection));

  window.addEventListener("keydown", (e) => {
    const key = e.key;
    const lower = key.toLowerCase();

    if (key === "ArrowLeft" || lower === "a") {
      setDirection("left", true);
      return;
    }

    if (key === "ArrowRight" || lower === "d") {
      setDirection("right", true);
      return;
    }

    if (key === "ArrowUp" || lower === "w") {
      setDirection("up", true);
      return;
    }

    if (key === "ArrowDown" || lower === "s") {
      setDirection("down", true);
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

    if (lower === "p") {
      e.preventDefault();
      togglePause();
    }
  });

  window.addEventListener("keyup", (e) => {
    const key = e.key;
    const lower = key.toLowerCase();

    if (key === "ArrowLeft" || lower === "a") {
      setDirection("left", false);
      return;
    }

    if (key === "ArrowRight" || lower === "d") {
      setDirection("right", false);
      return;
    }

    if (key === "ArrowUp" || lower === "w") {
      setDirection("up", false);
      return;
    }

    if (key === "ArrowDown" || lower === "s") {
      setDirection("down", false);
    }
  });
}

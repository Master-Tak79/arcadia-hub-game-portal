export function bindInput({
  canvas,
  leftBtn,
  rightBtn,
  setMove,
  startGame,
  togglePause,
  resumeGame,
  isRunning,
  isPaused,
  isGameOver,
  releaseAllInput,
}) {
  function bindKeyboard() {
    window.addEventListener("keydown", (e) => {
      const key = e.key.toLowerCase();
      if (e.key === " ") e.preventDefault();

      if (e.key === "ArrowLeft" || key === "a") setMove("left", true);
      if (e.key === "ArrowRight" || key === "d") setMove("right", true);
      if (key === "p" && !e.repeat) togglePause();

      if (e.key === " " && isPaused()) resumeGame();
      if (e.key === " " && !isRunning()) startGame();
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") setMove("left", false);
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") setMove("right", false);
    });
  }

  function bindCanvasSafety() {
    canvas.addEventListener(
      "pointerdown",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }

  function bindMobileButton(button, direction) {
    const press = (e) => {
      e?.preventDefault?.();
      setMove(direction, true);
      if (!isRunning() && !isGameOver()) startGame();
    };

    const release = (e) => {
      e?.preventDefault?.();
      setMove(direction, false);
      if (e?.pointerId != null) {
        try {
          button.releasePointerCapture(e.pointerId);
        } catch {}
      }
    };

    if ("PointerEvent" in window) {
      button.addEventListener("pointerdown", (e) => {
        press(e);
        try {
          button.setPointerCapture(e.pointerId);
        } catch {}
      });
      button.addEventListener("pointerup", release);
      button.addEventListener("pointercancel", release);
      button.addEventListener("lostpointercapture", release);
      button.addEventListener("pointerleave", release);
    } else {
      button.addEventListener("touchstart", press, { passive: false });
      button.addEventListener("touchend", release, { passive: false });
      button.addEventListener("touchcancel", release, { passive: false });
      button.addEventListener("mousedown", press);
      button.addEventListener("mouseup", release);
      button.addEventListener("mouseleave", release);
    }

    button.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  function bindAutoPause() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        releaseAllInput();
        if (isRunning() && !isPaused() && !isGameOver()) {
          togglePause("앱 전환으로 자동 일시정지되었습니다.");
        }
      }
    });

    window.addEventListener("blur", releaseAllInput);
  }

  bindMobileButton(leftBtn, "left");
  bindMobileButton(rightBtn, "right");
  bindKeyboard();
  bindCanvasSafety();
  bindAutoPause();
}

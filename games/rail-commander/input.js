export function bindInput({
  northBtn,
  centralBtn,
  southBtn,
  dispatchBtn,
  overdriveBtn,
  startGame,
  doAction,
  togglePause,
  isRunning,
}) {
  northBtn.addEventListener("click", () => doAction("north"));
  centralBtn.addEventListener("click", () => doAction("central"));
  southBtn.addEventListener("click", () => doAction("south"));
  dispatchBtn.addEventListener("click", () => doAction("dispatch"));
  overdriveBtn.addEventListener("click", () => doAction("overdrive"));

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "1") {
      doAction("north");
      return;
    }

    if (key === "2") {
      doAction("central");
      return;
    }

    if (key === "3") {
      doAction("south");
      return;
    }

    if (key === "4") {
      doAction("dispatch");
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (!isRunning()) startGame();
      else doAction("overdrive");
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

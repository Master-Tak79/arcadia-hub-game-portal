export function bindInput({
  fieldBtn,
  harborBtn,
  boatBtn,
  shipBtn,
  rushBtn,
  startGame,
  doAction,
  togglePause,
  isRunning,
}) {
  fieldBtn.addEventListener("click", () => doAction("field"));
  harborBtn.addEventListener("click", () => doAction("harbor"));
  boatBtn.addEventListener("click", () => doAction("boat"));
  shipBtn.addEventListener("click", () => doAction("ship"));
  rushBtn.addEventListener("click", () => doAction("rush"));

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "1") {
      doAction("field");
      return;
    }

    if (key === "2") {
      doAction("harbor");
      return;
    }

    if (key === "3") {
      doAction("boat");
      return;
    }

    if (key === "4") {
      doAction("ship");
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (!isRunning()) {
        startGame();
      } else {
        doAction("rush");
      }
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

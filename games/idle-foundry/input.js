export function bindInput({
  upgradeExtractorBtn,
  upgradeSmelterBtn,
  upgradeGeneratorBtn,
  sellBtn,
  overclockBtn,
  startGame,
  doAction,
  togglePause,
  isRunning,
}) {
  upgradeExtractorBtn.addEventListener("click", () => doAction("extractor"));
  upgradeSmelterBtn.addEventListener("click", () => doAction("smelter"));
  upgradeGeneratorBtn.addEventListener("click", () => doAction("generator"));
  sellBtn.addEventListener("click", () => doAction("sell"));
  overclockBtn.addEventListener("click", () => doAction("overclock"));

  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();

    if (key === "1") {
      doAction("extractor");
      return;
    }

    if (key === "2") {
      doAction("smelter");
      return;
    }

    if (key === "3") {
      doAction("generator");
      return;
    }

    if (key === "4") {
      doAction("sell");
      return;
    }

    if (e.code === "Space") {
      e.preventDefault();
      if (!isRunning()) {
        startGame();
      } else {
        doAction("overclock");
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

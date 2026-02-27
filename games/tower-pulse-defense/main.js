import { createEconomyCoreGame } from "../templates/economy-core/create-game.js";
import { celebrateMission, celebrateNewBest } from "../shared/confetti.fx.js";
import { economyCoreConfig } from "./economy-core.config.js";
import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createSfx } from "./sfx.js";
import { createState, loadSettings, saveSettings, STORAGE_KEY } from "./state.js";
import { buyUpgrade, dispatchTrain, resetRound, stepGame, triggerOverdrive } from "./systems.js";
import {
  showOverlay as showOverlayUI,
  syncHud as syncHudState,
  syncSettingsUI as syncSettingsUIState,
  syncControls as syncControlsState,
} from "./ui.js";

createEconomyCoreGame({
  modules: {
    bindInput,
    createRenderer,
    createSfx,
    createState,
    loadSettings,
    saveSettings,
    STORAGE_KEY,
    buyUpgrade,
    dispatchTrain,
    resetRound,
    stepGame,
    triggerOverdrive,
    showOverlayUI,
    syncHudState,
    syncSettingsUIState,
    syncControlsState,
    celebrateMission,
    celebrateNewBest,
  },
  config: economyCoreConfig,
});

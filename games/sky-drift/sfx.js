import { createSfxRuntime } from "../shared/sfx.runtime.js";

const SFX_CONFIG = {
  start: { file: "start.wav", volume: 0.26, cooldownMs: 110 },
  tick: { file: "tick.wav", volume: 0.22, cooldownMs: 120 },
  hit: { file: "hit.wav", volume: 0.28, cooldownMs: 140 },
  gameover: { file: "gameover.wav", volume: 0.3, cooldownMs: 260 },
  best: { file: "best.wav", volume: 0.32, cooldownMs: 180 },
  item: { file: "item.wav", volume: 0.26, cooldownMs: 90 },
};

function src(file) {
  return new URL(`../meteor-dodge/assets/sfx/${file}`, import.meta.url).href;
}

export function createSfx() {
  return createSfxRuntime({
    config: SFX_CONFIG,
    resolveSrc: src,
    bgmFile: "bgm-loop.wav",
    bgmVolume: 0.2,
  });
}

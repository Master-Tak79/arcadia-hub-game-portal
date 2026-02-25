import { createSfxRuntime } from "../shared/sfx.runtime.js";

const SFX_CONFIG = {
  start: { file: "start.wav", volume: 0.24, cooldownMs: 110 },
  tick: { file: "tick.wav", volume: 0.2, cooldownMs: 90 },
  hit: { file: "hit.wav", volume: 0.22, cooldownMs: 80 },
  gameover: { file: "gameover.wav", volume: 0.28, cooldownMs: 240 },
  best: { file: "best.wav", volume: 0.28, cooldownMs: 170 },
  item: { file: "item.wav", volume: 0.24, cooldownMs: 80 },
};

function src(file) {
  return new URL(`../meteor-dodge/assets/sfx/${file}`, import.meta.url).href;
}

export function createSfx() {
  return createSfxRuntime({
    config: SFX_CONFIG,
    resolveSrc: src,
    bgmFile: "bgm-loop.wav",
    bgmVolume: 0.16,
  });
}

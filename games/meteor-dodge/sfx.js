import { Howl } from "https://cdn.jsdelivr.net/npm/howler@2.2.4/+esm";

function src(file) {
  return new URL(`./assets/sfx/${file}`, import.meta.url).href;
}

export function createSfx() {
  const sounds = {
    start: new Howl({ src: [src("start.wav")], volume: 0.28 }),
    tick: new Howl({ src: [src("tick.wav")], volume: 0.2 }),
    hit: new Howl({ src: [src("hit.wav")], volume: 0.28 }),
    gameover: new Howl({ src: [src("gameover.wav")], volume: 0.3 }),
    best: new Howl({ src: [src("best.wav")], volume: 0.32 }),
  };

  function play(name) {
    const sound = sounds[name];
    if (!sound) return;
    sound.play();
  }

  return { play };
}

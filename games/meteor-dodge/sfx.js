const SFX_CONFIG = {
  start: { file: "start.wav", volume: 0.28 },
  tick: { file: "tick.wav", volume: 0.2 },
  hit: { file: "hit.wav", volume: 0.28 },
  gameover: { file: "gameover.wav", volume: 0.3 },
  best: { file: "best.wav", volume: 0.32 },
};

function src(file) {
  return new URL(`./assets/sfx/${file}`, import.meta.url).href;
}

function createHtmlAudioBackend() {
  const sounds = Object.fromEntries(
    Object.entries(SFX_CONFIG).map(([name, cfg]) => {
      const audio = new Audio(src(cfg.file));
      audio.preload = "auto";
      audio.volume = cfg.volume;
      return [name, audio];
    })
  );

  return {
    play(name) {
      const base = sounds[name];
      if (!base) return;

      // 중첩 재생을 위해 clone 사용
      const audio = base.cloneNode();
      audio.volume = base.volume;
      audio.play().catch(() => {});
    },
  };
}

async function createHowlerBackend() {
  const mod = await import("https://cdn.jsdelivr.net/npm/howler@2.2.4/+esm");
  const { Howl } = mod;

  const sounds = Object.fromEntries(
    Object.entries(SFX_CONFIG).map(([name, cfg]) => {
      const howl = new Howl({ src: [src(cfg.file)], volume: cfg.volume });
      return [name, howl];
    })
  );

  return {
    play(name) {
      const sound = sounds[name];
      if (!sound) return;
      sound.play();
    },
  };
}

export function createSfx() {
  let enabled = true;
  let ready = false;
  let backend = null;
  const queue = [];

  function flushQueue() {
    if (!backend || !enabled) return;
    while (queue.length) {
      const name = queue.shift();
      backend.play(name);
    }
  }

  (async () => {
    try {
      backend = await createHowlerBackend();
    } catch {
      backend = createHtmlAudioBackend();
    } finally {
      ready = true;
      flushQueue();
    }
  })();

  function play(name) {
    if (!enabled) return;

    if (!ready || !backend) {
      queue.push(name);
      if (queue.length > 12) queue.shift();
      return;
    }

    backend.play(name);
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    if (enabled) flushQueue();
  }

  return {
    play,
    setEnabled,
    isReady: () => ready,
  };
}

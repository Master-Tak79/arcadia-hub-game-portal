const SFX_CONFIG = {
  start: { file: "start.wav", volume: 0.28, cooldownMs: 120 },
  tick: { file: "tick.wav", volume: 0.2, cooldownMs: 180 },
  hit: { file: "hit.wav", volume: 0.28, cooldownMs: 120 },
  gameover: { file: "gameover.wav", volume: 0.3, cooldownMs: 320 },
  best: { file: "best.wav", volume: 0.32, cooldownMs: 220 },
  item: { file: "item.wav", volume: 0.26, cooldownMs: 90 },
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
    play(name, volumeScale = 1) {
      const base = sounds[name];
      if (!base) return;

      const audio = base.cloneNode();
      audio.volume = Math.max(0, Math.min(1, base.volume * volumeScale));
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
    play(name, volumeScale = 1) {
      const sound = sounds[name];
      if (!sound) return;
      sound.volume(Math.max(0, Math.min(1, SFX_CONFIG[name].volume * volumeScale)));
      sound.play();
    },
  };
}

export function createSfx() {
  let enabled = true;
  let ready = false;
  let backend = null;
  let volumeScale = 1;
  const queue = [];
  const lastPlayedAt = new Map();

  function canPlay(name) {
    const now = performance.now();
    const cooldown = SFX_CONFIG[name]?.cooldownMs || 0;
    const prev = lastPlayedAt.get(name) || 0;
    if (now - prev < cooldown) return false;
    lastPlayedAt.set(name, now);
    return true;
  }

  function flushQueue() {
    if (!backend || !enabled) return;
    while (queue.length) {
      const name = queue.shift();
      if (!canPlay(name)) continue;
      backend.play(name, volumeScale);
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
      if (queue.length > 16) queue.shift();
      return;
    }

    if (!canPlay(name)) return;
    backend.play(name, volumeScale);
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    if (enabled) flushQueue();
  }

  function setVolume(nextScale) {
    const num = Number(nextScale);
    volumeScale = Number.isFinite(num) ? Math.max(0, Math.min(1, num)) : 1;
  }

  return {
    play,
    setEnabled,
    setVolume,
    isReady: () => ready,
  };
}

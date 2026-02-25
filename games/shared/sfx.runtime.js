function createHtmlAudioBackend({ resolveSrc, config, bgmFile, bgmVolume }) {
  const sounds = Object.fromEntries(
    Object.entries(config).map(([name, cfg]) => {
      const audio = new Audio(resolveSrc(cfg.file));
      audio.preload = "auto";
      audio.volume = cfg.volume;
      return [name, audio];
    })
  );

  const bgm = new Audio(resolveSrc(bgmFile));
  bgm.loop = true;
  bgm.preload = "auto";
  bgm.volume = bgmVolume;

  let bgmEnabled = true;

  return {
    play(name, volumeScale = 1) {
      const base = sounds[name];
      const cfg = config[name];
      if (!base || !cfg) return;

      const audio = base.cloneNode();
      audio.volume = Math.max(0, Math.min(1, cfg.volume * volumeScale));
      audio.play().catch(() => {});
    },
    setBgmEnabled(nextEnabled, volumeScale = 1) {
      bgmEnabled = Boolean(nextEnabled);
      bgm.volume = Math.max(0, Math.min(1, bgmVolume * volumeScale));
      if (!bgmEnabled) bgm.pause();
    },
    startBgm(volumeScale = 1) {
      if (!bgmEnabled) return;
      bgm.volume = Math.max(0, Math.min(1, bgmVolume * volumeScale));
      bgm.play().catch(() => {});
    },
    pauseBgm() {
      bgm.pause();
    },
  };
}

async function createHowlerBackend({ resolveSrc, config, bgmFile, bgmVolume }) {
  const mod = await import("https://cdn.jsdelivr.net/npm/howler@2.2.4/+esm");
  const { Howl } = mod;

  const sounds = Object.fromEntries(
    Object.entries(config).map(([name, cfg]) => {
      const howl = new Howl({ src: [resolveSrc(cfg.file)], volume: cfg.volume });
      return [name, howl];
    })
  );

  const bgm = new Howl({
    src: [resolveSrc(bgmFile)],
    loop: true,
    volume: bgmVolume,
    html5: true,
  });

  let bgmEnabled = true;

  return {
    play(name, volumeScale = 1) {
      const sound = sounds[name];
      const cfg = config[name];
      if (!sound || !cfg) return;
      sound.volume(Math.max(0, Math.min(1, cfg.volume * volumeScale)));
      sound.play();
    },
    setBgmEnabled(nextEnabled, volumeScale = 1) {
      bgmEnabled = Boolean(nextEnabled);
      bgm.volume(Math.max(0, Math.min(1, bgmVolume * volumeScale)));
      if (!bgmEnabled) bgm.pause();
    },
    startBgm(volumeScale = 1) {
      if (!bgmEnabled) return;
      bgm.volume(Math.max(0, Math.min(1, bgmVolume * volumeScale)));
      if (!bgm.playing()) bgm.play();
    },
    pauseBgm() {
      bgm.pause();
    },
  };
}

export function createSfxRuntime({ config, resolveSrc, bgmFile = "bgm-loop.wav", bgmVolume = 0.24 }) {
  let enabled = true;
  let ready = false;
  let backend = null;
  let volumeScale = 1;
  let bgmEnabled = true;

  const queue = [];
  const lastPlayedAt = new Map();

  function canPlay(name) {
    const now = performance.now();
    const cooldown = config[name]?.cooldownMs || 0;
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
      backend = await createHowlerBackend({ resolveSrc, config, bgmFile, bgmVolume });
    } catch {
      backend = createHtmlAudioBackend({ resolveSrc, config, bgmFile, bgmVolume });
    } finally {
      ready = true;
      backend.setBgmEnabled(bgmEnabled && enabled, volumeScale);
      flushQueue();
    }
  })();

  function play(name) {
    if (!enabled) return;

    if (!ready || !backend) {
      queue.push(name);
      if (queue.length > 20) queue.shift();
      return;
    }

    if (!canPlay(name)) return;
    backend.play(name, volumeScale);
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);
    if (ready && backend) {
      backend.setBgmEnabled(bgmEnabled && enabled, volumeScale);
    }
    if (enabled) flushQueue();
  }

  function setBgmEnabled(nextEnabled) {
    bgmEnabled = Boolean(nextEnabled);
    if (ready && backend) backend.setBgmEnabled(bgmEnabled && enabled, volumeScale);
  }

  function startBgm() {
    if (!ready || !backend || !enabled || !bgmEnabled) return;
    backend.startBgm(volumeScale);
  }

  function pauseBgm() {
    if (!ready || !backend) return;
    backend.pauseBgm();
  }

  function setVolume(nextScale) {
    const num = Number(nextScale);
    volumeScale = Number.isFinite(num) ? Math.max(0, Math.min(1, num)) : 1;
    if (ready && backend) backend.setBgmEnabled(bgmEnabled && enabled, volumeScale);
  }

  return {
    play,
    setEnabled,
    setBgmEnabled,
    setVolume,
    startBgm,
    pauseBgm,
    isReady: () => ready,
  };
}

export function formatDuration(seconds) {
  const sec = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export function formatLocalDateTime(isoString) {
  if (!isoString) return "기록 없음";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "기록 없음";
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${mi}`;
}

function setMultilineText(node, text) {
  node.replaceChildren();
  const lines = String(text || "").split(/<br\s*\/?>|\n/g);

  lines.forEach((line, index) => {
    if (index > 0) {
      node.appendChild(document.createElement("br"));
    }
    node.appendChild(document.createTextNode(line));
  });
}

export function showOverlay(refs, title, text) {
  refs.overlayTitle.textContent = title;
  setMultilineText(refs.overlayText, text);
  refs.overlay.classList.remove("hidden");
}

export function syncHud({ state, scoreText, bestText, livesText, levelText }) {
  scoreText.textContent = String(state.score);
  bestText.textContent = String(state.best);
  const shield = state.graceMs > 0 ? " 🛡" : "";
  livesText.textContent = (state.lives > 0 ? "❤".repeat(state.lives) : "0") + shield;
  levelText.textContent = String(state.level);
}

export function syncMissionUI({ state, missionText }) {
  const effects = [];
  if (state.graceMs > 0) effects.push(`쉴드 ${(state.graceMs / 1000).toFixed(1)}s`);
  if (state.slowMs > 0) effects.push(`슬로우 ${(state.slowMs / 1000).toFixed(1)}s`);
  if (state.magnetMs > 0) effects.push(`자석 ${(state.magnetMs / 1000).toFixed(1)}s`);
  if (state.doubleMs > 0) effects.push(`더블 ${(state.doubleMs / 1000).toFixed(1)}s`);
  if (state.overdriveMs > 0) effects.push(`오버 ${(state.overdriveMs / 1000).toFixed(1)}s`);

  if (state.mission.completed) {
    const extra = effects.length ? ` · ${effects.join(" / ")}` : "";
    missionText.textContent = `🎯 미션 완료! (${state.mission.title})${extra}`;
    return;
  }

  const remain = Math.max(0, state.mission.targetMs - state.survivalMs);
  const extra = effects.length ? ` · ${effects.join(" / ")}` : "";
  missionText.textContent = `미션: ${state.mission.title} · 남은 ${formatDuration(remain / 1000)}${extra}`;
}

export function syncDifficultyUI({ state, difficultySelect, subtitleText, getPresetConfig }) {
  const preset = getPresetConfig(state.difficulty);
  difficultySelect.value = preset.key;
  subtitleText.textContent = `운석 회피 아케이드 · ${preset.label}`;
}

export function syncSettingsUI({
  settings,
  soundToggle,
  bgmToggle,
  vibrationToggle,
  sfxVolumeRange,
  sfxVolumeValue,
  isLowSpec,
}) {
  soundToggle.checked = settings.soundEnabled;
  bgmToggle.checked = settings.bgmEnabled;
  bgmToggle.disabled = isLowSpec;
  vibrationToggle.checked = settings.vibrationEnabled;
  sfxVolumeRange.value = String(settings.sfxVolume);
  sfxVolumeValue.textContent = `${settings.sfxVolume}%`;
}

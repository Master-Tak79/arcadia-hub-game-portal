export function formatDuration(seconds) {
  const sec = Math.max(0, Math.floor(seconds));
  const m = String(Math.floor(sec / 60)).padStart(2, "0");
  const s = String(sec % 60).padStart(2, "0");
  return `${m}:${s}`;
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

export function showNotice({ notice, settings, state }, text, ms = 900) {
  if (!settings.effectsEnabled) return;
  notice.textContent = text;
  state.noticeMs = ms;
  notice.classList.add("visible");
}

export function hideNotice(notice) {
  notice.classList.remove("visible");
}

export function syncHud({ state, scoreText, bestText, speedText, livesText }) {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  speedText.textContent = `${(state.speed / 250).toFixed(1)}x`;

  const shield = state.shieldMs > 0 ? " 🛡" : "";
  livesText.textContent = (state.lives > 0 ? "❤".repeat(state.lives) : "0") + shield;
}

export function syncMissionUI({ state, missionText }) {
  const targetSec = Math.floor(state.missionTargetMs / 1000);
  if (state.missionCompleted) {
    missionText.textContent = `🎯 ${targetSec}초 미션 완료! (+120)`;
    return;
  }

  const remain = Math.max(0, state.missionTargetMs - state.survivalMs);
  missionText.textContent = `미션: ${targetSec}초 생존 · 남은 ${formatDuration(remain / 1000)}`;
}

export function syncSettingsUI({ settings, effectsToggle, vibrationToggle }) {
  effectsToggle.checked = settings.effectsEnabled;
  vibrationToggle.checked = settings.vibrationEnabled;
}

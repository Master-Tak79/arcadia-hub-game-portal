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

export function setMultilineText(node, text) {
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

export const PORTAL_VERSION = "0.2.3";
export const GAME_DEFAULT_VERSION = "0.1.0";

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

export function normalizeVersion(input, fallback = GAME_DEFAULT_VERSION) {
  const value = String(input || "").trim();
  return SEMVER_RE.test(value) ? value : fallback;
}

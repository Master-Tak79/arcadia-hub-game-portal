import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

if (!globalThis.localStorage) {
  const bucket = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return bucket.has(key) ? bucket.get(key) : null;
    },
    setItem(key, value) {
      bucket.set(key, String(value));
    },
    removeItem(key) {
      bucket.delete(key);
    },
    clear() {
      bucket.clear();
    },
  };
}

function extractLocalGameIds(seedSource) {
  const ids = [];
  const re = /playUrl:\s*"\.\/games\/([^/]+)\/index\.html"/g;

  let match;
  while ((match = re.exec(seedSource))) {
    ids.push(match[1]);
  }

  return [...new Set(ids)].sort();
}

function extractFunctionBody(source, fnName) {
  const sig = new RegExp(`export\\s+function\\s+${fnName}\\b`, "m");
  const matched = source.match(sig);
  if (!matched || matched.index == null) return "";

  const start = source.indexOf("{", matched.index);
  if (start === -1) return "";

  let depth = 0;

  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "{") depth += 1;
    if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start + 1, i);
      }
    }
  }

  return "";
}

function parseLiteral(expr) {
  const trimmed = String(expr || "").trim();

  if (/^[+-]?\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;

  const quoted = trimmed.match(/^(["'`])([\s\S]*)\1$/);
  if (quoted) {
    const quote = quoted[1];
    const body = quoted[2];
    if (quote === "`" && body.includes("${")) return undefined;
    return body;
  }

  return undefined;
}

function extractStateAssignments(resetRoundBody) {
  const out = [];
  const re = /state\.([A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g;

  let match;
  while ((match = re.exec(resetRoundBody))) {
    const key = match[1];
    const rawExpr = match[2].trim();
    out.push({ key, rawExpr, literal: parseLiteral(rawExpr) });
  }

  return out;
}

function isPrimitive(value) {
  return (
    value === null ||
    typeof value === "number" ||
    typeof value === "string" ||
    typeof value === "boolean"
  );
}

async function loadCreateState(gameId) {
  const modulePath = path.resolve(ROOT, "games", gameId, "state.js");
  const mod = await import(pathToFileURL(modulePath).href);
  assert.equal(typeof mod.createState, "function", `[${gameId}] createState() not found`);
  return mod.createState;
}

async function run() {
  const seedPath = path.resolve(ROOT, "src/data/games.seed.js");
  const seedSource = fs.readFileSync(seedPath, "utf8");
  const gameIds = extractLocalGameIds(seedSource);

  assert.ok(gameIds.length >= 15, `expected at least 15 local games, got ${gameIds.length}`);

  const mismatches = [];
  const missingMissionResets = [];

  for (const gameId of gameIds) {
    const createState = await loadCreateState(gameId);
    const expectedState = createState();

    const systemsPath = path.resolve(ROOT, "games", gameId, "systems.js");
    const systemsSource = fs.readFileSync(systemsPath, "utf8");
    const resetRoundBody = extractFunctionBody(systemsSource, "resetRound");

    assert.ok(resetRoundBody, `[${gameId}] resetRound() body not found`);

    const assignments = extractStateAssignments(resetRoundBody);
    const assignedKeys = new Set(assignments.map((it) => it.key));

    const missionKeys = Object.keys(expectedState).filter((k) => /^missionTarget[A-Z_]/.test(k));
    for (const key of missionKeys) {
      if (!assignedKeys.has(key)) {
        missingMissionResets.push(`[${gameId}] resetRound missing assignment for ${key}`);
      }
    }

    for (const item of assignments) {
      if (item.literal === undefined) continue;
      if (!(item.key in expectedState)) continue;

      const expected = expectedState[item.key];
      if (!isPrimitive(expected)) continue;
      if (!isPrimitive(item.literal)) continue;

      if (expected !== item.literal) {
        mismatches.push(
          `[${gameId}] ${item.key}: createState=${JSON.stringify(expected)} resetRound=${JSON.stringify(
            item.literal
          )}`
        );
      }
    }
  }

  if (missingMissionResets.length || mismatches.length) {
    [...missingMissionResets, ...mismatches].forEach((line) => console.error(line));
    process.exit(1);
  }

  console.log("state reset sync check passed ✅");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

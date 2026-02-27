import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const REQUIRED_SELECTORS = [
  "button,",
  ".mini-link,",
  ".ghost,",
  ".ghost-btn,",
  ".ghost-link,",
  ".btn-row a,",
  ".controls button,",
  ".hint",
];

const REQUIRED_PROPERTIES = [
  "-webkit-user-select: none",
  "user-select: none",
  "-webkit-touch-callout: none",
  "touch-action: manipulation",
];

function extractLocalGameIds(seedSource) {
  const ids = [];
  const re = /playUrl:\s*"\.\/games\/([^/]+)\/index\.html"/g;

  let match;
  while ((match = re.exec(seedSource))) {
    ids.push(match[1]);
  }

  return [...new Set(ids)].sort();
}

function extractLongPressBlock(html) {
  const match = html.match(/\/\*\s*Mobile long-press guard\s*\*\/([\s\S]*?)\n\s*body\s*\{/);
  return match ? match[1] : "";
}

function run() {
  const seedPath = path.resolve(ROOT, "src/data/games.seed.js");
  const seedSource = fs.readFileSync(seedPath, "utf8");
  const gameIds = extractLocalGameIds(seedSource);

  assert.ok(gameIds.length >= 15, `expected at least 15 local games in seed, got ${gameIds.length}`);

  for (const gameId of gameIds) {
    const indexPath = path.resolve(ROOT, "games", gameId, "index.html");
    assert.ok(fs.existsSync(indexPath), `[${gameId}] missing index.html`);

    const html = fs.readFileSync(indexPath, "utf8");
    const block = extractLongPressBlock(html);

    assert.ok(block, `[${gameId}] missing \"Mobile long-press guard\" style block`);

    for (const selector of REQUIRED_SELECTORS) {
      assert.ok(block.includes(selector), `[${gameId}] selector missing in guard block: ${selector}`);
    }

    for (const cssProp of REQUIRED_PROPERTIES) {
      assert.ok(block.includes(cssProp), `[${gameId}] property missing in guard block: ${cssProp}`);
    }
  }

  console.log("longpress guard check passed ✅");
}

try {
  run();
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}

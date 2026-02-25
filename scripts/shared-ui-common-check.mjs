import assert from "node:assert/strict";
import {
  formatDuration,
  formatLocalDateTime,
  showOverlay,
} from "../games/shared/ui.common.js";

function createFakeNode() {
  return {
    children: [],
    textContent: "",
    replaceChildren() {
      this.children = [];
    },
    appendChild(node) {
      this.children.push(node);
      return node;
    },
  };
}

function run() {
  // formatDuration
  assert.equal(formatDuration(0), "00:00");
  assert.equal(formatDuration(65), "01:05");
  assert.equal(formatDuration(-4), "00:00");

  // formatLocalDateTime (shape + invalid guards)
  assert.equal(formatLocalDateTime(""), "기록 없음");
  assert.equal(formatLocalDateTime("not-a-date"), "기록 없음");
  const sample = formatLocalDateTime("2026-02-25T05:30:00.000Z");
  assert.match(sample, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

  // showOverlay + multiline rendering
  const originalDocument = globalThis.document;
  globalThis.document = {
    createElement(tagName) {
      return { kind: "element", tagName };
    },
    createTextNode(text) {
      return { kind: "text", textContent: text };
    },
  };

  const overlayText = createFakeNode();
  const overlayTitle = { textContent: "" };
  const overlay = {
    classList: {
      removed: [],
      remove(name) {
        this.removed.push(name);
      },
    },
  };

  showOverlay({ overlay, overlayTitle, overlayText }, "테스트", "첫 줄\n둘째 줄");

  assert.equal(overlayTitle.textContent, "테스트");
  assert.deepEqual(overlay.classList.removed, ["hidden"]);
  assert.equal(overlayText.children.length, 3);
  assert.deepEqual(overlayText.children[0], { kind: "text", textContent: "첫 줄" });
  assert.equal(overlayText.children[1].kind, "element");
  assert.equal(overlayText.children[1].tagName, "br");
  assert.deepEqual(overlayText.children[2], { kind: "text", textContent: "둘째 줄" });

  globalThis.document = originalDocument;

  console.log("shared ui common check passed ✅");
}

try {
  run();
} catch (error) {
  console.error("shared ui common check failed");
  console.error(error);
  process.exitCode = 1;
}

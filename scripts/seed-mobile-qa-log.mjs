import fs from "node:fs";
import path from "node:path";
import { gameSeed } from "../src/data/games.seed.js";

const date = process.argv[2] || "2026-02-27";
const outputPath = process.argv[3] || `QA_3RUN_LOG_${date}_STAGE1.md`;

const ordered = gameSeed
  .slice()
  .sort((a, b) => a.title.localeCompare(b.title, "ko"));

function blockForGame(game) {
  const lines = [];
  lines.push(`## ${game.title}`);
  lines.push("| Date | Device Slot | Browser | Run# | DurationSec | Result | Notes | Issue |");
  lines.push("| --- | --- | --- | --- | ---: | --- | --- | --- |");

  const browserBySlot = {
    A: "Telegram in-app",
    B: "Chrome / Edge / Samsung",
  };

  for (const slot of ["A", "B"]) {
    for (let run = 1; run <= 3; run += 1) {
      lines.push(
        `| ${date} | ${slot} | ${browserBySlot[slot]} | ${run} | - | PENDING | 실기기 60초+ 점검 예정 | - |`
      );
    }
  }

  lines.push("");
  return lines.join("\n");
}

const content = [
  `# QA 3-Run Log — Stage 1 Seed (${date})`,
  "",
  "목적: 실기기 QA 로그 1차 채움을 위해 15개 게임 × Device A/B × 3회 실행 기록 틀을 선생성합니다.",
  "",
  "작성 규칙:",
  "- 실제 플레이 후 `DurationSec`, `Result`, `Notes`, `Issue`를 갱신합니다.",
  "- `Result`는 PASS/FAIL로 확정하고, FAIL은 재현 스텝을 남깁니다.",
  "",
  ...ordered.map((g) => blockForGame(g)),
].join("\n");

fs.writeFileSync(path.resolve(outputPath), content, "utf8");
console.log(`seeded: ${outputPath}`);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const BUILDINGS = {
  farm: {
    label: "농장",
    cost: { ore: 1, energy: 0, food: 0 },
    baseYield: { food: 2, ore: 0, energy: 0, population: 0, prosperity: 1 },
    colorA: "#9fe48f",
    colorB: "#4fbf64",
  },
  mine: {
    label: "광산",
    cost: { ore: 0, energy: 0, food: 1 },
    baseYield: { food: 0, ore: 2, energy: 0, population: 0, prosperity: 1 },
    colorA: "#c8d8ff",
    colorB: "#7e9cff",
  },
  plant: {
    label: "발전소",
    cost: { ore: 1, energy: 0, food: 0 },
    baseYield: { food: 0, ore: 0, energy: 2, population: 0, prosperity: 1 },
    colorA: "#ffdca9",
    colorB: "#ffb75d",
  },
  home: {
    label: "주거지",
    cost: { ore: 1, energy: 0, food: 2 },
    baseYield: { food: 0, ore: 0, energy: 0, population: 1, prosperity: 2 },
    colorA: "#f5b3df",
    colorB: "#d67aca",
  },
  market: {
    label: "시장",
    cost: { ore: 2, energy: 1, food: 1 },
    baseYield: { food: 0, ore: 0, energy: 0, population: 0, prosperity: 4 },
    colorA: "#9fe3ff",
    colorB: "#4eb8d7",
  },
};

function getNeighbors(board, x, y) {
  const out = [];
  const dirs = [
    [0, -1],
    [1, 0],
    [0, 1],
    [-1, 0],
  ];

  dirs.forEach(([dx, dy]) => {
    const nx = x + dx;
    const ny = y + dy;
    if (ny < 0 || ny >= board.length || nx < 0 || nx >= board[0].length) return;
    const cell = board[ny][nx];
    if (cell) out.push(cell);
  });

  return out;
}

function hasEnoughResources(state, cost) {
  return state.food >= (cost.food || 0) && state.ore >= (cost.ore || 0) && state.energy >= (cost.energy || 0);
}

function spendResources(state, cost) {
  state.food -= cost.food || 0;
  state.ore -= cost.ore || 0;
  state.energy -= cost.energy || 0;
}

function addYield(state, gain) {
  state.food += gain.food || 0;
  state.ore += gain.ore || 0;
  state.energy += gain.energy || 0;
  state.population += gain.population || 0;
  state.score += gain.prosperity || 0;
}

function computeTileYield(board, x, y, cellType) {
  const def = BUILDINGS[cellType];
  const gain = { ...def.baseYield };
  const neighbors = getNeighbors(board, x, y);

  if (cellType === "farm") {
    if (neighbors.includes("home")) gain.food += 1;
    if (neighbors.includes("market")) gain.prosperity += 1;
  }

  if (cellType === "mine") {
    if (neighbors.includes("plant")) gain.ore += 1;
    if (neighbors.includes("market")) gain.prosperity += 1;
  }

  if (cellType === "plant") {
    if (neighbors.includes("mine")) gain.energy += 1;
    if (neighbors.includes("market")) gain.prosperity += 1;
  }

  if (cellType === "home") {
    if (neighbors.includes("farm")) gain.population += 1;
    if (neighbors.includes("market")) gain.prosperity += 1;
  }

  if (cellType === "market") {
    const aroundKinds = new Set(neighbors);
    gain.prosperity += aroundKinds.size;
  }

  return gain;
}

function upkeep(state) {
  const needFood = Math.max(1, Math.floor(state.population * 0.5));
  const needEnergy = Math.max(1, Math.floor(state.population * 0.35));

  state.food -= needFood;
  state.energy -= needEnergy;

  if (state.food < 0 || state.energy < 0) {
    state.score += Math.floor(Math.min(state.food, state.energy));
    state.population = Math.max(1, state.population - 1);
  }

  state.food = Math.max(0, state.food);
  state.energy = Math.max(0, state.energy);
  state.ore = Math.max(0, state.ore);
}

function updateMission(state, callbacks = {}) {
  if (state.missionCompleted) return;
  if (state.score < state.missionTargetScore) return;

  state.missionCompleted = true;
  state.missionNoticeMs = 1700;
  state.score += 80;
  callbacks.onMissionComplete?.();
}

export function createBoard(rows = 6, cols = 6) {
  return Array.from({ length: rows }, () => Array(cols).fill(null));
}

export function getBuildingDefs() {
  return BUILDINGS;
}

export function placeBuilding(state, board, x, y, type) {
  const def = BUILDINGS[type];
  if (!def) return { ok: false, reason: "invalid-type" };

  if (y < 0 || y >= board.length || x < 0 || x >= board[0].length) {
    return { ok: false, reason: "out-of-range" };
  }

  if (board[y][x]) {
    return { ok: false, reason: "occupied" };
  }

  if (!hasEnoughResources(state, def.cost)) {
    return { ok: false, reason: "insufficient-resource" };
  }

  spendResources(state, def.cost);
  board[y][x] = type;

  return { ok: true };
}

export function endTurn(state, board, callbacks = {}) {
  const income = { food: 0, ore: 0, energy: 0, population: 0, prosperity: 0 };

  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board[y].length; x += 1) {
      const cellType = board[y][x];
      if (!cellType) continue;

      const gain = computeTileYield(board, x, y, cellType);
      income.food += gain.food || 0;
      income.ore += gain.ore || 0;
      income.energy += gain.energy || 0;
      income.population += gain.population || 0;
      income.prosperity += gain.prosperity || 0;
    }
  }

  addYield(state, income);
  upkeep(state);

  state.turn += 1;

  updateMission(state, callbacks);

  if (state.turn > state.turnLimit) {
    callbacks.onGameOver?.("turn-limit");
    return;
  }

  callbacks.onTurnEnd?.(income);
}

export function resetRound(state, board) {
  state.score = 0;
  state.turn = 1;
  state.turnLimit = 30;

  state.food = 5;
  state.ore = 4;
  state.energy = 4;
  state.population = 2;

  state.selectedBuild = "farm";

  state.missionTargetScore = 180;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.noticeMs = 0;
  state.flash = 0;
  state.gameOver = false;

  for (let y = 0; y < board.length; y += 1) {
    board[y].fill(null);
  }
}

export function stepGame({ state, deltaSec, callbacks }) {
  if (!state.running || state.paused || state.gameOver) return;

  const deltaMs = deltaSec * 1000;
  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }

  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;
  if (state.flash > 0) state.flash = clamp(state.flash - deltaSec, 0, 1);
}

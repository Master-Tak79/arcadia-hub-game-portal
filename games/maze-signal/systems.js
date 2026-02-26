const DIRS = [
  { dr: -1, dc: 0, bit: 1, oppositeBit: 4 },
  { dr: 0, dc: 1, bit: 2, oppositeBit: 8 },
  { dr: 1, dc: 0, bit: 4, oppositeBit: 1 },
  { dr: 0, dc: -1, bit: 8, oppositeBit: 2 },
];

const BASE_BITS = {
  straight: 10,
  elbow: 3,
  tee: 11,
  cross: 15,
};

function rotateBitsOnce(bits) {
  let out = 0;
  if (bits & 1) out |= 2;
  if (bits & 2) out |= 4;
  if (bits & 4) out |= 8;
  if (bits & 8) out |= 1;
  return out;
}

function rotateBits(bits, turns) {
  let out = bits;
  for (let i = 0; i < turns; i += 1) {
    out = rotateBitsOnce(out);
  }
  return out;
}

function tileBits(tile) {
  return rotateBits(BASE_BITS[tile.kind] ?? BASE_BITS.straight, tile.rot || 0);
}

function indexOfCell(size, row, col) {
  return row * size + col;
}

function randomKind() {
  const roll = Math.random();
  if (roll < 0.38) return "straight";
  if (roll < 0.74) return "elbow";
  if (roll < 0.94) return "tee";
  return "cross";
}

function createTile() {
  return {
    kind: randomKind(),
    rot: Math.floor(Math.random() * 4),
  };
}

function createGrid(size) {
  return Array.from({ length: size * size }, () => createTile());
}

function findPathOnGrid(grid, size) {
  if (!grid.length) return null;

  const start = 0;
  const end = grid.length - 1;
  const queue = [start];
  const visited = new Array(grid.length).fill(false);
  const parent = new Array(grid.length).fill(-1);

  visited[start] = true;

  while (queue.length) {
    const current = queue.shift();
    if (current === end) break;

    const row = Math.floor(current / size);
    const col = current % size;
    const currentBits = tileBits(grid[current]);

    for (const dir of DIRS) {
      if ((currentBits & dir.bit) === 0) continue;

      const nr = row + dir.dr;
      const nc = col + dir.dc;
      if (nr < 0 || nr >= size || nc < 0 || nc >= size) continue;

      const next = indexOfCell(size, nr, nc);
      const nextBits = tileBits(grid[next]);
      if ((nextBits & dir.oppositeBit) === 0) continue;

      if (visited[next]) continue;
      visited[next] = true;
      parent[next] = current;
      queue.push(next);
    }
  }

  if (!visited[end]) return null;

  const path = [];
  let cursor = end;
  while (cursor !== -1) {
    path.push(cursor);
    cursor = parent[cursor];
  }

  return path.reverse();
}

function createGridWithoutImmediatePath(size) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const grid = createGrid(size);
    if (!findPathOnGrid(grid, size)) return grid;
  }

  return createGrid(size);
}

function updateDerived(state) {
  state.level = 1 + Math.floor(state.clears / 2);
}

export function rotateCell(state, row, col, callbacks) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (row < 0 || row >= state.gridSize || col < 0 || col >= state.gridSize) {
    return { ok: false, reason: "out-of-range" };
  }

  if (state.movesLeft <= 0) {
    return { ok: false, reason: "no-move" };
  }

  const idx = indexOfCell(state.gridSize, row, col);
  const tile = state.grid[idx];
  tile.rot = (tile.rot + 1) % 4;
  state.movesLeft -= 1;

  const path = findPathOnGrid(state.grid, state.gridSize);
  if (path) {
    state.clears += 1;
    state.pathCells = path;
    state.pathHighlightMs = 1200;

    const scoreGain = 46 + state.movesLeft * 1.2 + state.level * 5;
    state.scoreFloat += scoreGain;
    state.score = Math.floor(state.scoreFloat);
    updateDerived(state);

    state.movesLeft = Math.min(30, state.movesLeft + 3);

    callbacks?.onClear?.({ pathLength: path.length });

    state.grid = createGridWithoutImmediatePath(state.gridSize);
  } else {
    callbacks?.onRotate?.();
  }

  if (!state.missionCompleted && state.clears >= state.missionTargetClears) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.scoreFloat += 120;
    state.score = Math.floor(state.scoreFloat);
    callbacks?.onMissionComplete?.();
  }

  if (state.movesLeft <= 0) {
    callbacks?.onGameOver?.();
  }

  return { ok: true, solved: Boolean(path) };
}

export function rerollGrid(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  const cost = 2;
  if (state.movesLeft <= cost) {
    return { ok: false, reason: "insufficient-move", cost };
  }

  state.movesLeft -= cost;
  state.grid = createGridWithoutImmediatePath(state.gridSize);
  state.pathCells = [];
  state.pathHighlightMs = 0;

  return { ok: true, cost };
}

export function triggerScan(state) {
  if (!state.running || state.paused || state.gameOver) {
    return { ok: false, reason: "not-running" };
  }

  if (state.scanCooldownMs > 0) {
    return { ok: false, reason: "cooldown" };
  }

  state.scanCooldownMs = 8200;
  const path = findPathOnGrid(state.grid, state.gridSize);

  if (path) {
    state.pathCells = path;
    state.pathHighlightMs = 1500;
    state.scoreFloat += 8;
    state.score = Math.floor(state.scoreFloat);
    return { ok: true, found: true, pathLength: path.length };
  }

  return { ok: true, found: false };
}

export function resetRound(state) {
  state.score = 0;
  state.scoreFloat = 0;
  state.level = 1;

  state.grid = createGridWithoutImmediatePath(state.gridSize);
  state.pathCells = [];
  state.pathHighlightMs = 0;

  state.movesLeft = 26;
  state.clears = 0;

  state.scanCooldownMs = 0;

  state.missionTargetClears = 4;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;
}

export function stepGame({ state, deltaSec, callbacks }) {
  if (!state.running || state.paused || state.gameOver) return;

  const deltaMs = deltaSec * 1000;

  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }

  if (state.flash > 0) {
    state.flash = Math.max(0, state.flash - deltaSec);
  }

  if (state.pathHighlightMs > 0) {
    state.pathHighlightMs -= deltaMs;
    if (state.pathHighlightMs <= 0) {
      state.pathCells = [];
    }
  }

  if (state.missionNoticeMs > 0) {
    state.missionNoticeMs -= deltaMs;
  }

  if (state.scanCooldownMs > 0) {
    state.scanCooldownMs -= deltaMs;
  }
}

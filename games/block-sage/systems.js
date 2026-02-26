function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const SHAPES = [
  {
    matrix: [
      [1, 1],
      [1, 1],
    ],
    hue: 198,
  },
  {
    matrix: [[1, 1, 1, 1]],
    hue: 52,
  },
  {
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    hue: 276,
  },
  {
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    hue: 336,
  },
  {
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    hue: 142,
  },
  {
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    hue: 18,
  },
  {
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    hue: 225,
  },
];

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function rotateMatrix(matrix) {
  const h = matrix.length;
  const w = matrix[0].length;
  const out = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      out[x][h - y - 1] = matrix[y][x];
    }
  }
  return out;
}

function canPlace(board, matrix, offsetX, offsetY) {
  const rows = board.length;
  const cols = board[0].length;

  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;

      const bx = offsetX + x;
      const by = offsetY + y;
      if (bx < 0 || bx >= cols || by < 0 || by >= rows) return false;
      if (board[by][bx] !== 0) return false;
    }
  }

  return true;
}

function mergePiece(board, piece) {
  const { matrix, x: px, y: py, hue } = piece;
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;
      board[py + y][px + x] = hue;
    }
  }
}

function clearLines(board) {
  let lines = 0;
  for (let y = board.length - 1; y >= 0; y -= 1) {
    if (!board[y].every((cell) => cell !== 0)) continue;
    board.splice(y, 1);
    board.unshift(Array(board[0].length).fill(0));
    lines += 1;
    y += 1;
  }
  return lines;
}

function updateDifficulty(state) {
  const turns = state.turnsUsed;
  const lineBonus = Math.floor(state.lines * 0.8);
  state.dropIntervalMs = clamp(560 - turns * 7 - lineBonus * 4, 220, 560);
}

function scoreByLines(lines) {
  if (lines <= 0) return 0;
  if (lines === 1) return 40;
  if (lines === 2) return 100;
  if (lines === 3) return 180;
  return 300;
}

export function createBoard(rows = 14, cols = 8) {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
}

export function spawnPiece(board, random = Math.random) {
  const cols = board[0].length;
  const base = SHAPES[Math.floor(random() * SHAPES.length)];
  const matrix = cloneMatrix(base.matrix);
  const width = matrix[0].length;
  const x = Math.floor((cols - width) * 0.5);
  const y = 0;

  const piece = {
    matrix,
    x,
    y,
    hue: base.hue,
  };

  return canPlace(board, piece.matrix, piece.x, piece.y) ? piece : null;
}

export function tryMovePiece(board, piece, dx, dy) {
  const nx = piece.x + dx;
  const ny = piece.y + dy;
  if (!canPlace(board, piece.matrix, nx, ny)) return false;
  piece.x = nx;
  piece.y = ny;
  return true;
}

export function rotatePiece(board, piece) {
  const rotated = rotateMatrix(piece.matrix);
  const kicks = [0, -1, 1, -2, 2];

  for (const k of kicks) {
    if (!canPlace(board, rotated, piece.x + k, piece.y)) continue;
    piece.matrix = rotated;
    piece.x += k;
    return true;
  }

  return false;
}

export function hardDrop(board, piece) {
  let dropped = 0;
  while (tryMovePiece(board, piece, 0, 1)) dropped += 1;
  return dropped;
}

export function lockAndAdvance(state, board, piece, callbacks = {}) {
  mergePiece(board, piece);

  const lines = clearLines(board);
  state.lines += lines;
  state.score += 6 + scoreByLines(lines);

  if (lines > 0) {
    callbacks.onLineClear?.(lines);
  } else {
    callbacks.onPieceLock?.();
  }

  if (!state.missionCompleted && state.lines >= state.missionTargetLines) {
    state.missionCompleted = true;
    state.missionNoticeMs = 1700;
    state.score += 120;
    callbacks.onMissionComplete?.();
  }

  state.turnsUsed += 1;
  callbacks.onTurnUsed?.(Math.max(0, state.turnLimit - state.turnsUsed));

  updateDifficulty(state);

  if (state.turnsUsed >= state.turnLimit) {
    callbacks.onGameOver?.("turn-limit");
    return null;
  }

  const next = spawnPiece(board);
  if (!next) {
    callbacks.onGameOver?.("stack-overflow");
    return null;
  }

  return next;
}

export function resetRound(state, board) {
  state.score = 0;
  state.lines = 0;
  state.turnsUsed = 0;
  state.turnLimit = 40;

  state.dropIntervalMs = 560;
  state.dropElapsed = 0;

  state.missionTargetLines = 12;
  state.missionCompleted = false;
  state.missionNoticeMs = 0;

  state.noticeMs = 0;
  state.flash = 0;

  state.gameOver = false;

  for (let y = 0; y < board.length; y += 1) {
    board[y].fill(0);
  }

  return spawnPiece(board);
}

export function stepGame({ state, board, piece, deltaSec, callbacks }) {
  if (!state.running || state.paused || state.gameOver || !piece) return piece;

  const deltaMs = deltaSec * 1000;

  if (state.noticeMs > 0) {
    state.noticeMs -= deltaMs;
    if (state.noticeMs <= 0) callbacks?.onNoticeEnd?.();
  }
  if (state.missionNoticeMs > 0) state.missionNoticeMs -= deltaMs;
  if (state.flash > 0) state.flash -= deltaSec;

  state.dropElapsed += deltaMs;
  if (state.dropElapsed < state.dropIntervalMs) return piece;

  state.dropElapsed = 0;

  if (tryMovePiece(board, piece, 0, 1)) return piece;

  return lockAndAdvance(state, board, piece, callbacks);
}

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

function boardRect(canvas) {
  const size = Math.min(canvas.width * 0.78, canvas.height * 0.68);
  const x = (canvas.width - size) * 0.5;
  const y = 122;
  return { x, y, size };
}

function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#0f1a48");
  bg.addColorStop(1, "#050913");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gap = 34;
  const offset = (tick * 0.7) % gap;
  ctx.strokeStyle = "rgba(121, 170, 255, 0.12)";
  ctx.lineWidth = 1;

  for (let x = -gap; x < canvas.width + gap; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset, canvas.height);
    ctx.stroke();
  }
}

function drawCellConnectors(ctx, cx, cy, cellSize, bits, color) {
  const half = cellSize * 0.5;
  const core = cellSize * 0.18;

  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(3, cellSize * 0.12);
  ctx.lineCap = "round";

  if (bits & 1) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - half + 6);
    ctx.stroke();
  }

  if (bits & 2) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + half - 6, cy);
    ctx.stroke();
  }

  if (bits & 4) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + half - 6);
    ctx.stroke();
  }

  if (bits & 8) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - half + 6, cy);
    ctx.stroke();
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, core, 0, Math.PI * 2);
  ctx.fill();
}

function drawGrid(ctx, canvas, state) {
  const { x, y, size } = boardRect(canvas);
  const cellSize = size / state.gridSize;
  const pathSet = new Set(state.pathCells);

  ctx.fillStyle = "rgba(14, 24, 58, 0.9)";
  ctx.fillRect(x - 8, y - 8, size + 16, size + 16);
  ctx.strokeStyle = "rgba(153, 189, 255, 0.45)";
  ctx.strokeRect(x - 8, y - 8, size + 16, size + 16);

  for (let row = 0; row < state.gridSize; row += 1) {
    for (let col = 0; col < state.gridSize; col += 1) {
      const idx = row * state.gridSize + col;
      const tile = state.grid[idx];
      const px = x + col * cellSize;
      const py = y + row * cellSize;
      const cx = px + cellSize * 0.5;
      const cy = py + cellSize * 0.5;
      const bits = tileBits(tile);

      const active = pathSet.has(idx);
      const cellBg = active ? "rgba(118, 248, 200, 0.22)" : "rgba(89, 117, 184, 0.18)";
      const connectorColor = active ? "#b9ffe4" : "#b9d5ff";

      ctx.fillStyle = cellBg;
      ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);

      ctx.strokeStyle = "rgba(156, 191, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 2, py + 2, cellSize - 4, cellSize - 4);

      drawCellConnectors(ctx, cx, cy, cellSize, bits, connectorColor);

      if (row === 0 && col === 0) {
        ctx.fillStyle = "#7df8ff";
        ctx.font = `${Math.max(10, cellSize * 0.2)}px system-ui`;
        ctx.fillText("IN", px + 6, py + 16);
      }

      if (row === state.gridSize - 1 && col === state.gridSize - 1) {
        ctx.fillStyle = "#98ffbf";
        ctx.font = `${Math.max(10, cellSize * 0.2)}px system-ui`;
        ctx.fillText("OUT", px + 4, py + cellSize - 8);
      }
    }
  }
}

export function createRenderer({ canvas, ctx }) {
  let tick = 0;

  function render(state) {
    tick += 1;

    drawBackground(ctx, canvas, tick);
    drawGrid(ctx, canvas, state);

    if (state.missionNoticeMs > 0) {
      const w = Math.min(340, canvas.width * 0.84);
      const x = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(136, 255, 185, 0.2)";
      ctx.fillRect(x, 64, w, 40);
      ctx.strokeStyle = "rgba(162, 255, 205, 0.7)";
      ctx.strokeRect(x, 64, w, 40);
      ctx.fillStyle = "#e1ffe9";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText("🎯 미션 완료! +120", canvas.width * 0.5, 90);
      ctx.textAlign = "start";
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 84, 84, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  function getCellFromPoint(pointX, pointY, gridSize) {
    const { x, y, size } = boardRect(canvas);
    if (pointX < x || pointY < y || pointX > x + size || pointY > y + size) {
      return null;
    }

    const cellSize = size / gridSize;
    const col = Math.floor((pointX - x) / cellSize);
    const row = Math.floor((pointY - y) / cellSize);
    return { row, col };
  }

  return { render, getCellFromPoint };
}

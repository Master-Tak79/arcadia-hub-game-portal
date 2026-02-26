function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w * 0.5, h * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function getLayout(canvas, rows, cols) {
  const horizontalPadding = 20;
  const maxW = canvas.width - horizontalPadding * 2;
  const maxH = canvas.height * 0.74;
  const cell = Math.floor(Math.min(maxW / cols, maxH / rows));
  const boardW = cell * cols;
  const boardH = cell * rows;

  return {
    cell,
    boardW,
    boardH,
    x: (canvas.width - boardW) * 0.5,
    y: canvas.height * 0.16,
  };
}

function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#111c4b");
  bg.addColorStop(1, "#040914");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const pulse = (Math.sin(tick * 0.016) + 1) * 0.5;
  const beamY = canvas.height * (0.18 + pulse * 0.3);
  const beam = ctx.createLinearGradient(0, beamY - 120, 0, beamY + 120);
  beam.addColorStop(0, "rgba(99, 179, 255, 0)");
  beam.addColorStop(0.5, "rgba(99, 179, 255, 0.14)");
  beam.addColorStop(1, "rgba(99, 179, 255, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, beamY - 120, canvas.width, 240);
}

function drawBoardPanel(ctx, layout) {
  ctx.save();
  roundRectPath(ctx, layout.x - 10, layout.y - 10, layout.boardW + 20, layout.boardH + 20, 14);
  ctx.fillStyle = "rgba(8, 14, 34, 0.86)";
  ctx.fill();
  ctx.strokeStyle = "rgba(145, 205, 255, 0.24)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx, layout, rows, cols) {
  ctx.save();
  ctx.strokeStyle = "rgba(130, 170, 255, 0.15)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= cols; x += 1) {
    const px = layout.x + x * layout.cell;
    ctx.beginPath();
    ctx.moveTo(px, layout.y);
    ctx.lineTo(px, layout.y + layout.boardH);
    ctx.stroke();
  }

  for (let y = 0; y <= rows; y += 1) {
    const py = layout.y + y * layout.cell;
    ctx.beginPath();
    ctx.moveTo(layout.x, py);
    ctx.lineTo(layout.x + layout.boardW, py);
    ctx.stroke();
  }

  ctx.restore();
}

function drawCell(ctx, x, y, size, hue) {
  const inset = 3;
  const w = size - inset * 2;
  const h = size - inset * 2;

  ctx.save();
  ctx.shadowColor = `hsla(${hue}, 95%, 70%, 0.56)`;
  ctx.shadowBlur = 10;

  roundRectPath(ctx, x + inset, y + inset, w, h, 6);
  const grd = ctx.createLinearGradient(x, y, x, y + size);
  grd.addColorStop(0, `hsla(${hue}, 100%, 78%, 0.95)`);
  grd.addColorStop(1, `hsla(${(hue + 20) % 360}, 90%, 56%, 0.92)`);
  ctx.fillStyle = grd;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = `hsla(${hue}, 100%, 90%, 0.56)`;
  ctx.lineWidth = 1.2;
  roundRectPath(ctx, x + inset, y + inset, w, h, 6);
  ctx.stroke();
  ctx.restore();
}

function drawBoardCells(ctx, board, layout) {
  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board[y].length; x += 1) {
      const hue = board[y][x];
      if (!hue) continue;
      drawCell(ctx, layout.x + x * layout.cell, layout.y + y * layout.cell, layout.cell, hue);
    }
  }
}

function drawPiece(ctx, piece, layout) {
  if (!piece) return;

  for (let y = 0; y < piece.matrix.length; y += 1) {
    for (let x = 0; x < piece.matrix[y].length; x += 1) {
      if (!piece.matrix[y][x]) continue;
      const px = layout.x + (piece.x + x) * layout.cell;
      const py = layout.y + (piece.y + y) * layout.cell;
      drawCell(ctx, px, py, layout.cell, piece.hue);
    }
  }
}

export function createRenderer({ canvas, ctx, rows, cols }) {
  let tick = 0;

  function render(state, board, piece) {
    tick += 1;

    drawBackground(ctx, canvas, tick);
    const layout = getLayout(canvas, rows, cols);

    drawBoardPanel(ctx, layout);
    drawGrid(ctx, layout, rows, cols);
    drawBoardCells(ctx, board, layout);
    drawPiece(ctx, piece, layout);

    if (state.missionNoticeMs > 0) {
      const w = Math.min(320, canvas.width * 0.82);
      const x = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(136, 255, 185, 0.18)";
      ctx.fillRect(x, 76, w, 40);
      ctx.strokeStyle = "rgba(162, 255, 205, 0.7)";
      ctx.strokeRect(x, 76, w, 40);
      ctx.fillStyle = "#d7ffea";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText("🎯 미션 완료! +120", canvas.width * 0.5, 101);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 82, 82, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

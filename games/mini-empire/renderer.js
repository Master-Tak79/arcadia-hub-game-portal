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
  const pad = 20;
  const maxW = canvas.width - pad * 2;
  const maxH = canvas.height * 0.72;
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
  bg.addColorStop(0, "#0f204f");
  bg.addColorStop(1, "#040a1b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const sweep = (tick * 0.18) % (canvas.width + 260);
  const beam = ctx.createLinearGradient(sweep - 220, 0, sweep + 40, canvas.height);
  beam.addColorStop(0, "rgba(112, 175, 255, 0)");
  beam.addColorStop(0.5, "rgba(112, 175, 255, 0.14)");
  beam.addColorStop(1, "rgba(112, 175, 255, 0)");
  ctx.fillStyle = beam;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPanel(ctx, layout) {
  ctx.save();
  roundRectPath(ctx, layout.x - 10, layout.y - 10, layout.boardW + 20, layout.boardH + 20, 14);
  ctx.fillStyle = "rgba(6, 14, 34, 0.84)";
  ctx.fill();
  ctx.strokeStyle = "rgba(137, 199, 255, 0.28)";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

function drawGrid(ctx, layout, rows, cols) {
  ctx.save();
  ctx.strokeStyle = "rgba(126, 176, 255, 0.2)";
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

function drawTile(ctx, x, y, size, def) {
  const inset = 3;
  const w = size - inset * 2;
  const h = size - inset * 2;

  ctx.save();
  const hue = (def?.hue || 200) % 360;
  ctx.shadowColor = `hsla(${hue}, 90%, 68%, 0.5)`;
  ctx.shadowBlur = 10;

  roundRectPath(ctx, x + inset, y + inset, w, h, 6);
  const grd = ctx.createLinearGradient(x, y, x, y + size);
  grd.addColorStop(0, def?.colorA || `hsla(${hue}, 100%, 78%, 0.95)`);
  grd.addColorStop(1, def?.colorB || `hsla(${(hue + 25) % 360}, 90%, 58%, 0.92)`);
  ctx.fillStyle = grd;
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(255,255,255,0.52)";
  ctx.lineWidth = 1.2;
  roundRectPath(ctx, x + inset, y + inset, w, h, 6);
  ctx.stroke();
  ctx.restore();
}

function drawBoard(ctx, board, layout, defs) {
  for (let y = 0; y < board.length; y += 1) {
    for (let x = 0; x < board[y].length; x += 1) {
      const type = board[y][x];
      if (!type) continue;
      const def = defs[type];
      drawTile(ctx, layout.x + x * layout.cell, layout.y + y * layout.cell, layout.cell, def);

      ctx.save();
      ctx.fillStyle = "rgba(16, 36, 71, 0.7)";
      ctx.font = "700 10px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(def?.label?.[0] || "?", layout.x + x * layout.cell + layout.cell * 0.5, layout.y + y * layout.cell + layout.cell * 0.62);
      ctx.restore();
    }
  }
}

function drawSelectionHint(ctx, layout, hoverCell, selectedDef) {
  if (!hoverCell || !selectedDef) return;

  const x = layout.x + hoverCell.x * layout.cell;
  const y = layout.y + hoverCell.y * layout.cell;

  ctx.save();
  ctx.fillStyle = "rgba(150, 245, 255, 0.12)";
  ctx.strokeStyle = "rgba(150, 245, 255, 0.62)";
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, x + 2, y + 2, layout.cell - 4, layout.cell - 4, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawSelectedInfo(ctx, canvas, selectedDef) {
  if (!selectedDef) return;

  const cardW = Math.min(320, canvas.width * 0.82);
  const x = (canvas.width - cardW) * 0.5;
  const y = canvas.height * 0.06;

  ctx.save();
  ctx.fillStyle = "rgba(8, 18, 43, 0.78)";
  roundRectPath(ctx, x, y, cardW, 42, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(152, 210, 255, 0.36)";
  ctx.stroke();

  ctx.fillStyle = "#d6f2ff";
  ctx.font = "600 13px system-ui";
  ctx.textAlign = "left";
  ctx.fillText(`선택: ${selectedDef.label}`, x + 12, y + 17);

  const cost = selectedDef.cost || {};
  ctx.fillStyle = "#a9c8e8";
  ctx.font = "500 11px system-ui";
  ctx.fillText(`비용 F:${cost.food || 0} O:${cost.ore || 0} E:${cost.energy || 0}`, x + 12, y + 33);
  ctx.restore();
}

export function createRenderer({ canvas, ctx, rows, cols, buildingDefs }) {
  let tick = 0;

  function render(state, board, hoverCell) {
    tick += 1;
    drawBackground(ctx, canvas, tick);

    const layout = getLayout(canvas, rows, cols);
    drawPanel(ctx, layout);
    drawGrid(ctx, layout, rows, cols);
    drawBoard(ctx, board, layout, buildingDefs);
    drawSelectionHint(ctx, layout, hoverCell, buildingDefs[state.selectedBuild]);
    drawSelectedInfo(ctx, canvas, buildingDefs[state.selectedBuild]);

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
      ctx.fillText("🎯 미션 완료! +80", canvas.width * 0.5, 101);
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 82, 82, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render, getLayout: () => getLayout(canvas, rows, cols) };
}

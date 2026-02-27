function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#123b66");
  bg.addColorStop(1, "#07142c");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const waveGap = 40;
  const offset = (tick * 1.2) % waveGap;
  ctx.strokeStyle = "rgba(149, 222, 255, 0.16)";
  ctx.lineWidth = 2;

  for (let y = -waveGap; y < canvas.height + waveGap; y += waveGap) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 26) {
      const wave = Math.sin((x + offset) * 0.04 + y * 0.03) * 5;
      const py = y + wave;
      if (x === 0) ctx.moveTo(x, py);
      else ctx.lineTo(x, py);
    }
    ctx.stroke();
  }
}

function drawPanel(ctx, x, y, w, h, title, level, color) {
  ctx.save();
  ctx.fillStyle = "rgba(11, 28, 54, 0.86)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(164, 215, 255, 0.34)";
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#def0ff";
  ctx.font = "600 16px system-ui";
  ctx.fillText(title, x + 12, y + 24);

  ctx.fillStyle = color;
  ctx.font = "700 22px system-ui";
  ctx.fillText(`Lv ${level}`, x + 12, y + 56);

  const barW = w - 24;
  const fill = Math.min(1, level / 12);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(x + 12, y + h - 20, barW, 10);
  ctx.fillStyle = color;
  ctx.fillRect(x + 12, y + h - 20, barW * fill, 10);
  ctx.restore();
}

function drawResourceBar(ctx, x, y, w, label, value, max, color) {
  const fill = Math.max(0, Math.min(1, value / Math.max(1, max)));

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, w, 12);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * fill, 12);

  ctx.fillStyle = "#d6e8ff";
  ctx.font = "600 13px system-ui";
  ctx.fillText(`${label} ${value}`, x, y - 6);
}

export function createRenderer({ canvas, ctx }) {
  let tick = 0;

  function render(state) {
    tick += 1;
    drawBackground(ctx, canvas, tick);

    const panelW = canvas.width - 60;
    const panelH = 100;
    const x = 30;

    drawPanel(ctx, x, 104, panelW, panelH, "Field", state.fieldLv, "#8dffac");
    drawPanel(ctx, x, 226, panelW, panelH, "Harbor", state.harborLv, "#8fe7ff");
    drawPanel(ctx, x, 348, panelW, panelH, "Boat", state.boatLv, "#ffd88d");

    ctx.fillStyle = "rgba(10, 23, 46, 0.9)";
    ctx.fillRect(24, 488, canvas.width - 48, 190);
    ctx.strokeStyle = "rgba(159, 206, 255, 0.34)";
    ctx.strokeRect(24, 488, canvas.width - 48, 190);

    drawResourceBar(ctx, 42, 526, canvas.width - 84, "작물", state.crops, 140, "#a8ffb6");
    drawResourceBar(ctx, 42, 566, canvas.width - 84, "어획", state.fish, 120, "#8fe9ff");
    drawResourceBar(ctx, 42, 606, canvas.width - 84, "화물", state.crates, 90, "#ffd88d");

    const dayProgress = Math.min(1, (state.day - 1) / Math.max(1, state.dayLimit));
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(42, 646, canvas.width - 84, 10);
    ctx.fillStyle = "#a9c9ff";
    ctx.fillRect(42, 646, (canvas.width - 84) * dayProgress, 10);

    ctx.fillStyle = "#d8e9ff";
    ctx.font = "600 13px system-ui";
    ctx.fillText(`DAY ${state.day}/${state.dayLimit}`, 42, 640);

    if (state.rushMs > 0) {
      const remain = (state.rushMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(152, 255, 211, 0.18)";
      ctx.fillRect(24, 700, canvas.width - 48, 42);
      ctx.strokeStyle = "rgba(164, 255, 222, 0.6)";
      ctx.strokeRect(24, 700, canvas.width - 48, 42);
      ctx.fillStyle = "#e0fff4";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText(`🌊 MERGE RUSH ${remain}s`, canvas.width * 0.5, 726);
      ctx.textAlign = "start";
    }

    if (state.missionNoticeMs > 0) {
      const w = Math.min(340, canvas.width * 0.84);
      const mx = (canvas.width - w) * 0.5;
      ctx.fillStyle = "rgba(136, 255, 185, 0.2)";
      ctx.fillRect(mx, 64, w, 40);
      ctx.strokeStyle = "rgba(162, 255, 205, 0.7)";
      ctx.strokeRect(mx, 64, w, 40);
      ctx.fillStyle = "#e1ffe9";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText("🎯 미션 완료! +110", canvas.width * 0.5, 90);
      ctx.textAlign = "start";
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 84, 84, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

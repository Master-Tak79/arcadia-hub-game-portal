function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#0f173f");
  bg.addColorStop(1, "#050913");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gap = 30;
  const offset = (tick * 0.7) % gap;
  ctx.strokeStyle = "rgba(120, 170, 255, 0.12)";
  ctx.lineWidth = 1;

  for (let x = -gap; x < canvas.width + gap; x += gap) {
    ctx.beginPath();
    ctx.moveTo(x + offset, 0);
    ctx.lineTo(x + offset, canvas.height);
    ctx.stroke();
  }

  for (let y = -gap; y < canvas.height + gap; y += gap) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset * 0.55);
    ctx.lineTo(canvas.width, y + offset * 0.55);
    ctx.stroke();
  }
}

function drawFactoryPanel(ctx, x, y, w, h, title, level, color) {
  ctx.save();
  ctx.fillStyle = "rgba(14, 22, 54, 0.86)";
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = "rgba(154, 194, 255, 0.35)";
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = "#dce7ff";
  ctx.font = "600 16px system-ui";
  ctx.fillText(title, x + 12, y + 24);

  ctx.fillStyle = color;
  ctx.font = "700 22px system-ui";
  ctx.fillText(`Lv ${level}`, x + 12, y + 54);

  const barW = w - 24;
  const fill = Math.min(1, level / 12);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(x + 12, y + h - 22, barW, 10);
  ctx.fillStyle = color;
  ctx.fillRect(x + 12, y + h - 22, barW * fill, 10);
  ctx.restore();
}

function drawResourceBar(ctx, x, y, w, label, value, max, color) {
  const fill = Math.max(0, Math.min(1, value / Math.max(1, max)));

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(x, y, w, 12);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * fill, 12);

  ctx.fillStyle = "#d6e2ff";
  ctx.font = "600 13px system-ui";
  ctx.fillText(`${label} ${value}`, x, y - 6);
}

export function createRenderer({ canvas, ctx }) {
  let tick = 0;

  function render(state, factory) {
    tick += 1;
    drawBackground(ctx, canvas, tick);

    const panelW = canvas.width - 60;
    const panelH = 100;
    const baseX = 30;

    drawFactoryPanel(ctx, baseX, 110, panelW, panelH, "Extractor", factory.extractorLv, "#77d7ff");
    drawFactoryPanel(ctx, baseX, 232, panelW, panelH, "Smelter", factory.smelterLv, "#ffd27c");
    drawFactoryPanel(ctx, baseX, 354, panelW, panelH, "Generator", factory.generatorLv, "#a9ffb0");

    ctx.fillStyle = "rgba(13, 21, 49, 0.9)";
    ctx.fillRect(24, 500, canvas.width - 48, 156);
    ctx.strokeStyle = "rgba(146, 183, 255, 0.35)";
    ctx.strokeRect(24, 500, canvas.width - 48, 156);

    drawResourceBar(ctx, 42, 538, canvas.width - 84, "에너지", state.energy, 80, "#7fe3ff");
    drawResourceBar(ctx, 42, 580, canvas.width - 84, "스크랩", state.scrap, 120, "#9ec3ff");
    drawResourceBar(ctx, 42, 622, canvas.width - 84, "잉곳", state.ingot, 80, "#ffd890");

    if (state.overclockMs > 0) {
      const remain = (state.overclockMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(155, 255, 215, 0.18)";
      ctx.fillRect(24, 678, canvas.width - 48, 44);
      ctx.strokeStyle = "rgba(165, 255, 224, 0.6)";
      ctx.strokeRect(24, 678, canvas.width - 48, 44);
      ctx.fillStyle = "#ddfff4";
      ctx.font = "700 18px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`⚡ OVERCLOCK ${remain}s`, canvas.width * 0.5, 706);
      ctx.textAlign = "start";
    }

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

  return { render };
}

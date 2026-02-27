function drawBackground(ctx, canvas, tick) {
  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bg.addColorStop(0, "#13225a");
  bg.addColorStop(1, "#07112b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const stripeGap = 38;
  const offset = (tick * 2.3) % stripeGap;
  ctx.strokeStyle = "rgba(138, 199, 255, 0.13)";
  ctx.lineWidth = 1;

  for (let y = -stripeGap; y < canvas.height + stripeGap; y += stripeGap) {
    ctx.beginPath();
    ctx.moveTo(0, y + offset);
    ctx.lineTo(canvas.width, y + offset + 12);
    ctx.stroke();
  }
}

function drawRailLane(ctx, x, y, width, title, level, progress, color) {
  ctx.save();
  ctx.fillStyle = "rgba(13, 24, 56, 0.86)";
  ctx.fillRect(x, y, width, 96);
  ctx.strokeStyle = "rgba(153, 199, 255, 0.34)";
  ctx.strokeRect(x, y, width, 96);

  ctx.fillStyle = "#dce7ff";
  ctx.font = "600 15px system-ui";
  ctx.fillText(title, x + 12, y + 22);

  ctx.fillStyle = color;
  ctx.font = "700 20px system-ui";
  ctx.fillText(`Lv ${level}`, x + 12, y + 50);

  ctx.fillStyle = "rgba(255,255,255,0.1)";
  ctx.fillRect(x + 12, y + 66, width - 24, 12);
  ctx.fillStyle = color;
  ctx.fillRect(x + 12, y + 66, (width - 24) * progress, 12);

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

  function render(state) {
    tick += 1;
    drawBackground(ctx, canvas, tick);

    const panelW = canvas.width - 60;
    const x = 30;

    const northProgress = Math.min(1, state.northLv / 12);
    const centralProgress = Math.min(1, state.centralLv / 12);
    const southProgress = Math.min(1, state.southLv / 12);

    drawRailLane(ctx, x, 112, panelW, "West Tower", state.northLv, northProgress, "#8be3ff");
    drawRailLane(ctx, x, 226, panelW, "Core Tower", state.centralLv, centralProgress, "#ffd88e");
    drawRailLane(ctx, x, 340, panelW, "East Tower", state.southLv, southProgress, "#9dffbb");

    ctx.fillStyle = "rgba(13, 21, 49, 0.9)";
    ctx.fillRect(24, 476, canvas.width - 48, 184);
    ctx.strokeStyle = "rgba(146, 183, 255, 0.35)";
    ctx.strokeRect(24, 476, canvas.width - 48, 184);

    drawResourceBar(ctx, 42, 514, canvas.width - 84, "화물", state.cargo, 130, "#8fe3ff");
    drawResourceBar(ctx, 42, 554, canvas.width - 84, "승객", state.passenger, 120, "#ffd89a");
    drawResourceBar(ctx, 42, 594, canvas.width - 84, "우편", state.mail, 110, "#9effc8");

    const shiftProgress = Math.max(0, Math.min(1, state.shiftRemainSec / Math.max(1, state.shiftLimitSec)));
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(42, 632, canvas.width - 84, 10);
    ctx.fillStyle = "#a9c9ff";
    ctx.fillRect(42, 632, (canvas.width - 84) * shiftProgress, 10);

    ctx.fillStyle = "#d8e9ff";
    ctx.font = "600 13px system-ui";
    ctx.fillText(`SHIFT ${(state.shiftRemainSec).toFixed(1)}s`, 42, 626);

    if (state.overdriveMs > 0) {
      const remain = (state.overdriveMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(152, 255, 211, 0.18)";
      ctx.fillRect(24, 682, canvas.width - 48, 42);
      ctx.strokeStyle = "rgba(164, 255, 222, 0.6)";
      ctx.strokeRect(24, 682, canvas.width - 48, 42);
      ctx.fillStyle = "#e0fff4";
      ctx.textAlign = "center";
      ctx.font = "700 18px system-ui";
      ctx.fillText(`🚄 PULSE ${remain}s`, canvas.width * 0.5, 708);
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
      ctx.fillText("🎯 미션 완료! +130", canvas.width * 0.5, 90);
      ctx.textAlign = "start";
    }

    if (state.flash > 0) {
      ctx.fillStyle = `rgba(255, 84, 84, ${Math.min(0.34, state.flash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

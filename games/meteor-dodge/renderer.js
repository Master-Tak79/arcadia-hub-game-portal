function drawShip(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#5be3ff";
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.58);
  ctx.lineTo(w * 0.52, h * 0.5);
  ctx.lineTo(0, h * 0.18);
  ctx.lineTo(-w * 0.52, h * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#8bf1ff";
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.05, w * 0.12, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffa45f";
  ctx.beginPath();
  ctx.moveTo(-w * 0.16, h * 0.5);
  ctx.lineTo(0, h * 0.56);
  ctx.lineTo(w * 0.16, h * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMeteor(ctx, m) {
  const isAccelerating = m.type === "accelerating";

  if (isAccelerating) {
    ctx.save();
    const tailLength = Math.min(90, m.vy * 0.12 + 20);
    const tail = ctx.createLinearGradient(m.x, m.y - tailLength, m.x, m.y + m.r * 0.8);
    tail.addColorStop(0, "rgba(104, 230, 255, 0)");
    tail.addColorStop(1, "rgba(104, 230, 255, 0.35)");
    ctx.strokeStyle = tail;
    ctx.lineWidth = Math.max(2, m.r * 0.22);
    ctx.beginPath();
    ctx.moveTo(m.x, m.y - tailLength);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.rot);

  const grd = ctx.createRadialGradient(-m.r * 0.3, -m.r * 0.25, m.r * 0.2, 0, 0, m.r * 1.1);
  if (isAccelerating) {
    grd.addColorStop(0, "#baf6ff");
    grd.addColorStop(0.45, "#4fcfff");
    grd.addColorStop(1, "#1d4c88");
  } else {
    grd.addColorStop(0, "#f0b36f");
    grd.addColorStop(0.46, "#d46f35");
    grd.addColorStop(1, "#772f1d");
  }

  ctx.fillStyle = grd;
  ctx.beginPath();
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI * 2 * i) / 8;
    const jag = m.r * (0.82 + (i % 2 ? 0.3 : 0));
    const px = Math.cos(a) * jag;
    const py = Math.sin(a) * jag;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = isAccelerating ? "rgba(0, 20, 48, 0.3)" : "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.arc(m.r * 0.2, m.r * 0.1, m.r * 0.2, 0, Math.PI * 2);
  ctx.fill();

  if (isAccelerating) {
    ctx.fillStyle = "rgba(214, 247, 255, 0.85)";
    ctx.beginPath();
    ctx.arc(-m.r * 0.2, -m.r * 0.14, m.r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawItem(ctx, item) {
  const bobY = Math.sin(item.bob) * 3;
  const y = item.y + bobY;

  if (item.type === "coin") {
    ctx.save();
    ctx.fillStyle = "#ffd66e";
    ctx.beginPath();
    ctx.arc(item.x, y, item.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffb73a";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "#8a5a16";
    ctx.font = "700 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("+", item.x, y + 5);
    ctx.restore();
    return;
  }

  if (item.type === "shield") {
    ctx.save();
    ctx.fillStyle = "rgba(124, 232, 255, 0.22)";
    ctx.beginPath();
    ctx.arc(item.x, y, item.r + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#7ae7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(item.x, y, item.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#d9fbff";
    ctx.font = "700 12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("🛡", item.x, y + 4);
    ctx.restore();
    return;
  }

  // slow
  ctx.save();
  ctx.fillStyle = "rgba(150, 220, 255, 0.22)";
  ctx.beginPath();
  ctx.arc(item.x, y, item.r + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a6e7ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(item.x, y, item.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#eefbff";
  ctx.font = "700 12px system-ui";
  ctx.textAlign = "center";
  ctx.fillText("🐢", item.x, y + 4);
  ctx.restore();
}

export function createRenderer({ canvas, ctx, stars }) {
  function drawBackground(deltaSec) {
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#060f2e");
    bg.addColorStop(1, "#030716");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(170, 210, 255, 0.9)";
    stars.forEach((s) => {
      s.y += s.vy * deltaSec;
      if (s.y > canvas.height) {
        s.y = -5;
        s.x = Math.random() * canvas.width;
      }
      ctx.globalAlpha = 0.35 + s.r / 2.8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function render(state, player, meteors, items, deltaSec) {
    drawBackground(deltaSec);

    items.forEach((item) => drawItem(ctx, item));
    meteors.forEach((m) => drawMeteor(ctx, m));

    if (state.invincibleMs > 0 && Math.floor(state.invincibleMs / 90) % 2 === 0) {
      // blink
    } else {
      drawShip(ctx, player.x, player.y, player.w, player.h);
    }

    if (state.countdownMs > 0) {
      const n = Math.max(1, Math.ceil(state.countdownMs / 1000));
      ctx.fillStyle = "rgba(3, 8, 26, 0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#dff6ff";
      ctx.textAlign = "center";
      ctx.font = "700 96px system-ui";
      ctx.fillText(String(n), canvas.width * 0.5, canvas.height * 0.52);
      ctx.font = "600 24px system-ui";
      ctx.fillText("준비", canvas.width * 0.5, canvas.height * 0.62);
    } else if (state.graceMs > 0) {
      const remain = (state.graceMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(35, 211, 255, 0.18)";
      ctx.fillRect(16, 16, 170, 34);
      ctx.strokeStyle = "rgba(98, 224, 255, 0.6)";
      ctx.strokeRect(16, 16, 170, 34);
      ctx.fillStyle = "#baf4ff";
      ctx.font = "600 18px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`🛡 보호 ${remain}s`, 26, 39);
    }

    if (state.slowMs > 0) {
      const remain = (state.slowMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(168, 222, 255, 0.18)";
      ctx.fillRect(354, 16, 170, 34);
      ctx.strokeStyle = "rgba(196, 239, 255, 0.6)";
      ctx.strokeRect(354, 16, 170, 34);
      ctx.fillStyle = "#dff6ff";
      ctx.font = "600 18px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`🐢 슬로우 ${remain}s`, 364, 39);
    }

    if (state.mission.justCompletedMs > 0) {
      ctx.fillStyle = "rgba(113, 255, 174, 0.18)";
      ctx.fillRect(110, 90, 320, 46);
      ctx.strokeStyle = "rgba(148, 255, 195, 0.7)";
      ctx.strokeRect(110, 90, 320, 46);
      ctx.fillStyle = "#d6ffe6";
      ctx.textAlign = "center";
      ctx.font = "700 22px system-ui";
      ctx.fillText("🎯 미션 완료! +120", canvas.width * 0.5, 121);
    }

    if (state.itemNoticeMs > 0 && state.itemNoticeText) {
      ctx.fillStyle = "rgba(255, 244, 188, 0.18)";
      ctx.fillRect(140, 145, 260, 40);
      ctx.strokeStyle = "rgba(255, 234, 150, 0.7)";
      ctx.strokeRect(140, 145, 260, 40);
      ctx.fillStyle = "#fff5c4";
      ctx.textAlign = "center";
      ctx.font = "700 20px system-ui";
      ctx.fillText(state.itemNoticeText, canvas.width * 0.5, 171);
    }

    if (state.hitFlash > 0) {
      ctx.fillStyle = `rgba(255, 80, 80, ${Math.min(0.34, state.hitFlash)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  return { render };
}

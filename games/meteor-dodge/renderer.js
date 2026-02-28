function drawShip(ctx, x, y, w, h) {
  ctx.save();
  ctx.translate(x, y);

  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, w * 1.1);
  glow.addColorStop(0, "rgba(105, 235, 255, 0.25)");
  glow.addColorStop(1, "rgba(105, 235, 255, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(0, 0, w * 0.9, h * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "rgba(107, 236, 255, 0.55)";
  ctx.shadowBlur = 12;
  const body = ctx.createLinearGradient(0, -h * 0.58, 0, h * 0.5);
  body.addColorStop(0, "#96f3ff");
  body.addColorStop(1, "#53d8ff");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.58);
  ctx.lineTo(w * 0.52, h * 0.5);
  ctx.lineTo(0, h * 0.18);
  ctx.lineTo(-w * 0.52, h * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "#d8fbff";
  ctx.beginPath();
  ctx.ellipse(0, -h * 0.05, w * 0.12, h * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  const flame = ctx.createLinearGradient(0, h * 0.42, 0, h * 0.62);
  flame.addColorStop(0, "#ffd091");
  flame.addColorStop(1, "#ff8b54");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-w * 0.16, h * 0.5);
  ctx.lineTo(0, h * 0.6);
  ctx.lineTo(w * 0.16, h * 0.5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMeteor(ctx, m) {
  const isAccelerating = m.type === "accelerating";

  if (isAccelerating) {
    ctx.save();
    const tailLength = Math.min(104, m.vy * 0.14 + 24);
    const tail = ctx.createLinearGradient(m.x, m.y - tailLength, m.x, m.y + m.r * 0.9);
    tail.addColorStop(0, "rgba(104, 230, 255, 0)");
    tail.addColorStop(1, m.colorTail || "rgba(104, 230, 255, 0.35)");
    ctx.strokeStyle = tail;
    ctx.lineWidth = Math.max(2, m.r * 0.24);
    ctx.beginPath();
    ctx.moveTo(m.x, m.y - tailLength);
    ctx.lineTo(m.x, m.y + m.r * 0.24);
    ctx.stroke();

    ctx.strokeStyle = "rgba(219, 248, 255, 0.52)";
    ctx.lineWidth = Math.max(1, m.r * 0.08);
    ctx.beginPath();
    ctx.moveTo(m.x - m.r * 0.18, m.y - tailLength * 0.72);
    ctx.lineTo(m.x - m.r * 0.05, m.y - m.r * 0.15);
    ctx.moveTo(m.x + m.r * 0.18, m.y - tailLength * 0.66);
    ctx.lineTo(m.x + m.r * 0.05, m.y - m.r * 0.18);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.rot);

  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, m.r * 2.3);
  halo.addColorStop(0, m.colorGlow || (isAccelerating ? "rgba(120, 224, 255, 0.28)" : "rgba(255, 166, 114, 0.24)"));
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(0, 0, m.r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  const grd = ctx.createRadialGradient(-m.r * 0.3, -m.r * 0.25, m.r * 0.18, 0, 0, m.r * 1.12);
  grd.addColorStop(0, m.colorCoreA || (isAccelerating ? "#baf6ff" : "#f0b36f"));
  grd.addColorStop(0.44, m.colorCoreB || (isAccelerating ? "#4fcfff" : "#d46f35"));
  grd.addColorStop(1, m.colorRim || (isAccelerating ? "#1d4c88" : "#772f1d"));

  ctx.fillStyle = grd;
  ctx.beginPath();
  const spikes = m.spikes || 8;
  for (let i = 0; i < spikes; i += 1) {
    const a = (Math.PI * 2 * i) / spikes;
    const jag = m.r * (0.8 + (i % 2 ? 0.32 : 0.05));
    const px = Math.cos(a) * jag;
    const py = Math.sin(a) * jag;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = Math.max(1, m.r * 0.06);
  ctx.stroke();

  ctx.fillStyle = m.colorCrater || (isAccelerating ? "rgba(0, 20, 48, 0.3)" : "rgba(0,0,0,0.22)");
  ctx.beginPath();
  ctx.arc(m.r * 0.2, m.r * 0.1, m.r * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-m.r * 0.16, m.r * 0.24, m.r * 0.14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = m.colorShard || (isAccelerating ? "rgba(214, 247, 255, 0.85)" : "rgba(255, 226, 180, 0.62)");
  ctx.beginPath();
  ctx.arc(-m.r * 0.24, -m.r * 0.16, m.r * 0.12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawItemBadge(ctx, x, y, r, palette, drawIcon) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
  ctx.fill();

  const core = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r * 1.1);
  core.addColorStop(0, palette.coreA);
  core.addColorStop(1, palette.coreB);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = palette.ring;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.save();
  ctx.translate(x, y);
  drawIcon();
  ctx.restore();
}

function drawItem(ctx, item) {
  const bobY = Math.sin(item.bob) * 3;
  const y = item.y + bobY;

  ctx.save();

  if (item.type === "coin") {
    drawItemBadge(
      ctx,
      item.x,
      y,
      item.r,
      {
        glow: "rgba(255, 219, 122, 0.42)",
        coreA: "#ffe8a6",
        coreB: "#ffc447",
        ring: "#ffb73a",
      },
      () => {
        ctx.fillStyle = "#8a5a16";
        ctx.font = "700 12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("C", 0, 4);
      }
    );
    ctx.restore();
    return;
  }

  if (item.type === "shield") {
    drawItemBadge(
      ctx,
      item.x,
      y,
      item.r,
      {
        glow: "rgba(124, 232, 255, 0.24)",
        coreA: "#d4fbff",
        coreB: "#82e9ff",
        ring: "#7ae7ff",
      },
      () => {
        ctx.strokeStyle = "#1f597f";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -item.r * 0.5);
        ctx.lineTo(item.r * 0.46, -item.r * 0.14);
        ctx.lineTo(item.r * 0.3, item.r * 0.46);
        ctx.lineTo(0, item.r * 0.68);
        ctx.lineTo(-item.r * 0.3, item.r * 0.46);
        ctx.lineTo(-item.r * 0.46, -item.r * 0.14);
        ctx.closePath();
        ctx.stroke();
      }
    );
    ctx.restore();
    return;
  }

  if (item.type === "slow") {
    drawItemBadge(
      ctx,
      item.x,
      y,
      item.r,
      {
        glow: "rgba(150, 220, 255, 0.22)",
        coreA: "#eaf8ff",
        coreB: "#9fddff",
        ring: "#a6e7ff",
      },
      () => {
        ctx.strokeStyle = "#22507a";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, item.r * 0.42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(item.r * 0.18, -item.r * 0.14);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -item.r * 0.24);
        ctx.stroke();
      }
    );
    ctx.restore();
    return;
  }

  if (item.type === "magnet") {
    drawItemBadge(
      ctx,
      item.x,
      y,
      item.r,
      {
        glow: "rgba(255, 171, 204, 0.22)",
        coreA: "#ffe9f4",
        coreB: "#ffc6e0",
        ring: "#ffc6e0",
      },
      () => {
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = "#a33f77";
        ctx.beginPath();
        ctx.arc(0, 0, item.r * 0.36, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        ctx.fillStyle = "#f25786";
        ctx.fillRect(-item.r * 0.34, -item.r * 0.05, item.r * 0.16, item.r * 0.24);
        ctx.fillRect(item.r * 0.18, -item.r * 0.05, item.r * 0.16, item.r * 0.24);
      }
    );
    ctx.restore();
    return;
  }

  if (item.type === "double") {
    drawItemBadge(
      ctx,
      item.x,
      y,
      item.r,
      {
        glow: "rgba(255, 225, 159, 0.24)",
        coreA: "#fff5d1",
        coreB: "#ffe19a",
        ring: "#ffe9a5",
      },
      () => {
        ctx.fillStyle = "#8d6a15";
        ctx.font = "700 10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("x2", 0, 3.5);
      }
    );
    ctx.restore();
    return;
  }

  // overdrive
  drawItemBadge(
    ctx,
    item.x,
    y,
    item.r,
    {
      glow: "rgba(255, 151, 120, 0.24)",
      coreA: "#ffd8c6",
      coreB: "#ff9a78",
      ring: "#ffba96",
    },
    () => {
      ctx.fillStyle = "#8c351c";
      ctx.beginPath();
      ctx.moveTo(-item.r * 0.1, -item.r * 0.35);
      ctx.lineTo(item.r * 0.18, -item.r * 0.05);
      ctx.lineTo(0, -item.r * 0.05);
      ctx.lineTo(item.r * 0.1, item.r * 0.34);
      ctx.lineTo(-item.r * 0.2, 0.05 * item.r);
      ctx.lineTo(0, 0.05 * item.r);
      ctx.closePath();
      ctx.fill();
    }
  );

  ctx.restore();
}

export function createRenderer({ canvas, ctx, stars }) {
  function drawBackground(deltaSec) {
    const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bg.addColorStop(0, "#07143a");
    bg.addColorStop(0.55, "#06102e");
    bg.addColorStop(1, "#030716");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const nebulaShift = (performance.now() * 0.00006) % 1;
    const nebula = ctx.createLinearGradient(0, canvas.height * (0.18 + nebulaShift * 0.25), canvas.width, canvas.height * 0.84);
    nebula.addColorStop(0, "rgba(112, 175, 255, 0.16)");
    nebula.addColorStop(0.5, "rgba(88, 119, 255, 0.08)");
    nebula.addColorStop(1, "rgba(53, 85, 219, 0)");
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(170, 210, 255, 0.9)";
    stars.forEach((s) => {
      s.y += s.vy * deltaSec;
      if (s.y > canvas.height) {
        s.y = -5;
        s.x = Math.random() * canvas.width;
      }
      const twinkle = 0.25 + (Math.sin((s.x + s.y + performance.now() * 0.0025) * 0.04) + 1) * 0.2;
      ctx.globalAlpha = twinkle + s.r / 3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    const vignette = ctx.createRadialGradient(
      canvas.width * 0.5,
      canvas.height * 0.52,
      canvas.width * 0.15,
      canvas.width * 0.5,
      canvas.height * 0.52,
      canvas.width * 0.76
    );
    vignette.addColorStop(0, "rgba(0,0,0,0)");
    vignette.addColorStop(1, "rgba(1, 3, 12, 0.46)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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

    if (state.magnetMs > 0) {
      const remain = (state.magnetMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(255, 192, 223, 0.16)";
      ctx.fillRect(16, 56, 170, 30);
      ctx.strokeStyle = "rgba(255, 211, 235, 0.6)";
      ctx.strokeRect(16, 56, 170, 30);
      ctx.fillStyle = "#ffe8f4";
      ctx.font = "600 16px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`🧲 자석 ${remain}s`, 24, 77);
    }

    if (state.doubleMs > 0) {
      const remain = (state.doubleMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(255, 232, 177, 0.16)";
      ctx.fillRect(188, 56, 170, 30);
      ctx.strokeStyle = "rgba(255, 244, 196, 0.6)";
      ctx.strokeRect(188, 56, 170, 30);
      ctx.fillStyle = "#fff6d7";
      ctx.font = "600 16px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`✨ 더블 ${remain}s`, 196, 77);
    }

    if (state.overdriveMs > 0) {
      const remain = (state.overdriveMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(255, 170, 120, 0.16)";
      ctx.fillRect(360, 56, 164, 30);
      ctx.strokeStyle = "rgba(255, 198, 151, 0.6)";
      ctx.strokeRect(360, 56, 164, 30);
      ctx.fillStyle = "#ffe7d6";
      ctx.font = "600 16px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`⚡ 오버 ${remain}s`, 368, 77);
    }

    if (state.dodgeChain > 1) {
      ctx.fillStyle = "rgba(255, 205, 147, 0.2)";
      ctx.fillRect(canvas.width - 188, 20, 154, 30);
      ctx.strokeStyle = "rgba(255, 224, 184, 0.72)";
      ctx.strokeRect(canvas.width - 188, 20, 154, 30);
      ctx.fillStyle = "#fff0de";
      ctx.textAlign = "center";
      ctx.font = "700 14px system-ui";
      ctx.fillText(`☄️ CHAIN x${state.dodgeChain}`, canvas.width - 111, 40);
      ctx.textAlign = "left";
    }

    if (state.stormType !== "normal") {
      const label = state.stormType === "shower" ? "SHOWER" : "ACCEL";
      const remain = Math.max(0, state.stormMs / 1000).toFixed(1);
      ctx.fillStyle = "rgba(177, 189, 255, 0.16)";
      ctx.fillRect(24, 20, 176, 30);
      ctx.strokeStyle = "rgba(198, 208, 255, 0.68)";
      ctx.strokeRect(24, 20, 176, 30);
      ctx.fillStyle = "#e9edff";
      ctx.font = "700 13px system-ui";
      ctx.fillText(`⛈ ${label} ${remain}s`, 34, 40);
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

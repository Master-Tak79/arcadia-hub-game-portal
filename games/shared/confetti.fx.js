function getConfetti() {
  const fn = globalThis?.confetti;
  return typeof fn === "function" ? fn : null;
}

export function burstConfetti({ spread = 60, startVelocity = 42, particleCount = 50 } = {}) {
  const confetti = getConfetti();
  if (!confetti) return;

  confetti({
    particleCount,
    spread,
    startVelocity,
    origin: { y: 0.6 },
    ticks: 180,
    scalar: 0.9,
  });
}

export function sideCannons() {
  const confetti = getConfetti();
  if (!confetti) return;

  confetti({
    particleCount: 28,
    angle: 60,
    spread: 48,
    origin: { x: 0.04, y: 0.66 },
    ticks: 160,
    scalar: 0.88,
  });

  confetti({
    particleCount: 28,
    angle: 120,
    spread: 48,
    origin: { x: 0.96, y: 0.66 },
    ticks: 160,
    scalar: 0.88,
  });
}

export function celebrateMission() {
  burstConfetti({ spread: 68, startVelocity: 46, particleCount: 56 });
}

export function celebrateNewBest() {
  sideCannons();
  burstConfetti({ spread: 74, startVelocity: 52, particleCount: 64 });
}

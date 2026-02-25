import { bindInput } from "./input.js";
import { createRenderer } from "./renderer.js";
import { createLanes, createPlayer, createState, STORAGE_KEY } from "./state.js";
import { moveLane, resetRound, stepGame } from "./systems.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("scoreText");
const bestText = document.getElementById("bestText");
const speedText = document.getElementById("speedText");
const livesText = document.getElementById("livesText");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const startBtn = document.getElementById("startBtn");
const notice = document.getElementById("notice");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const lanes = createLanes(canvas);
const state = createState(localStorage.getItem(STORAGE_KEY));
const player = createPlayer(canvas, lanes);
const obstacles = [];
const coins = [];

const renderer = createRenderer({ canvas, ctx });

let rafId = 0;
let lastTs = performance.now();

function showNotice(text, ms = 900) {
  notice.textContent = text;
  state.noticeMs = ms;
  notice.classList.add("visible");
}

function hideNotice() {
  notice.classList.remove("visible");
}

function syncHud() {
  scoreText.textContent = String(Math.floor(state.score));
  bestText.textContent = String(Math.floor(state.best));
  speedText.textContent = `${(state.speed / 260).toFixed(1)}x`;
  livesText.textContent = state.lives > 0 ? "❤".repeat(state.lives) : "0";
}

function startGame() {
  if (!state.gameOver && state.running) return;

  resetRound(state, player, obstacles, coins, lanes);
  state.running = true;
  state.paused = false;

  hideNotice();
  overlay.classList.add("hidden");
  startBtn.textContent = "시작";

  syncHud();
}

function endGame() {
  state.running = false;
  state.gameOver = true;

  if (state.score > state.best) {
    state.best = Math.floor(state.score);
    localStorage.setItem(STORAGE_KEY, String(state.best));
    showNotice("🏆 NEW BEST", 1300);
  }

  syncHud();
  overlayTitle.textContent = "게임 오버";
  overlayText.innerHTML = `최종 점수 ${Math.floor(state.score)}점 · 최고 점수 ${state.best}점<br />다시 시작하려면 시작 버튼을 누르세요.`;
  overlay.classList.remove("hidden");
  startBtn.textContent = "다시 시작";
}

function frame(now) {
  const deltaSec = Math.min(0.033, (now - lastTs) / 1000);
  lastTs = now;

  stepGame({
    state,
    player,
    obstacles,
    coins,
    lanes,
    canvasHeight: canvas.height,
    deltaSec,
    callbacks: {
      onCoinPickup: (gained) => showNotice(`💰 +${gained}`, 700),
      onNoticeEnd: hideNotice,
      onHit: () => {},
      onGameOver: endGame,
    },
  });

  renderer.render(state, player, obstacles, coins);
  syncHud();

  rafId = requestAnimationFrame(frame);
}

startBtn.addEventListener("click", startGame);

bindInput({
  canvas,
  leftBtn,
  rightBtn,
  startGame,
  moveLeft: () => moveLane(state, player, -1, lanes.length),
  moveRight: () => moveLane(state, player, 1, lanes.length),
  isRunning: () => state.running,
});

syncHud();

cancelAnimationFrame(rafId);
rafId = requestAnimationFrame((ts) => {
  lastTs = ts;
  frame(ts);
});

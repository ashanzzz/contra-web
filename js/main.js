import { loadAssets } from "./game/assets.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_DIFFICULTY } from "./game/constants.js";
import { Game } from "./game/engine/game.js";
import { KeyboardInput } from "./game/input/keyboard.js";
import { TouchInput } from "./game/input/touch.js";

const canvas = document.getElementById("gameCanvas");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const difficultySelect = document.getElementById("difficultySelect");
const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultDetail = document.getElementById("resultDetail");
const restartButton = document.getElementById("restartButton");
const controls = document.getElementById("touchControls");
const runStatus = document.getElementById("runStatus");

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const keyboard = new KeyboardInput();
const touch = new TouchInput(controls);

const ui = {
  showStart() {
    startScreen.hidden = false;
    resultScreen.hidden = true;
    this.setStatus("待命中");
  },
  hideStart() {
    startScreen.hidden = true;
  },
  showResult(result) {
    resultScreen.hidden = false;
    resultTitle.textContent = result.victory ? "任务完成" : "任务失败";
    resultDetail.textContent = [
      result.text,
      `难度：${result.difficultyLabel}`,
      `得分：${result.score}（最高 ${result.bestScore}）`,
      `耗时：${result.missionSeconds}s`,
      `击杀：${result.kills}`,
      `命中率：${result.accuracy}%`,
    ].join("\n");
  },
  hideResult() {
    resultScreen.hidden = true;
  },
  setStatus(text) {
    runStatus.textContent = text;
  },
};

let game = null;
let lastTime = performance.now();
const launchedFromFileProtocol = window.location.protocol === "file:";

function frame(now) {
  if (!game) {
    requestAnimationFrame(frame);
    return;
  }

  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;

  game.update(dt);
  game.render();

  requestAnimationFrame(frame);
}

async function init() {
  ui.setStatus("加载资源中...");
  const assets = await loadAssets();
  game = new Game({ canvas, assets, keyboard, touch, ui });
  ui.showStart();

  if (launchedFromFileProtocol) {
    ui.setStatus("建议使用本地静态服务启动（file:// 兼容性较差）");
  }

  difficultySelect.value = DEFAULT_DIFFICULTY;

  startButton.addEventListener("click", () => {
    ui.hideStart();
    ui.hideResult();
    game.startNewRun(difficultySelect.value);
    lastTime = performance.now();
  });

  restartButton.addEventListener("click", () => {
    ui.hideResult();
    game.startNewRun(game.difficultyId);
    lastTime = performance.now();
  });

  requestAnimationFrame(frame);
}

init().catch((error) => {
  resultScreen.hidden = false;
  resultTitle.textContent = "加载失败";
  resultDetail.textContent = launchedFromFileProtocol
    ? `检测到 file:// 直接打开。请在项目目录运行本地静态服务（例如 \`python3 -m http.server 8080\`），再访问 http://localhost:8080。\n\n原始错误：${error.message}`
    : error.message;
  ui.setStatus("加载异常");
});

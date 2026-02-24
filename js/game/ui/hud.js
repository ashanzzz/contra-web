import { CANVAS_WIDTH, COLORS } from "../constants.js";

export function drawHud(ctx, game) {
  const { player, level } = game;
  const progress = Math.min(1, player.x / (level.length - 180));
  const accuracy = game.stats.shotsFired ? Math.round((game.stats.shotsHit / game.stats.shotsFired) * 100) : 0;

  ctx.save();
  ctx.fillStyle = "rgba(8, 12, 19, 0.72)";
  ctx.fillRect(14, 12, 430, 110);
  ctx.fillStyle = "#f2f6ff";
  ctx.font = "600 18px 'Trebuchet MS', 'Segoe UI', sans-serif";
  ctx.fillText(`HP: ${player.hp}/${player.maxHp}`, 26, 38);
  ctx.fillText(`LIVES: ${Math.max(0, player.lives)}`, 26, 64);
  ctx.fillText(`SCORE: ${player.score}`, 160, 38);
  ctx.fillText(`BEST: ${game.bestScore}`, 160, 64);
  ctx.fillText(`DIFF: ${game.difficulty.label}`, 320, 38);
  ctx.fillText(`ACC: ${accuracy}%`, 320, 64);

  const barX = 26;
  const barY = 84;
  const barW = 390;
  const barH = 14;
  ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = COLORS.good;
  ctx.fillRect(barX, barY, barW * progress, barH);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
  ctx.strokeRect(barX, barY, barW, barH);

  if (game.tipTimer > 0 && game.currentTip) {
    ctx.fillStyle = "rgba(9, 14, 22, 0.75)";
    ctx.fillRect(CANVAS_WIDTH * 0.18, 126, CANVAS_WIDTH * 0.64, 40);
    ctx.fillStyle = "#ffe39a";
    ctx.font = "600 17px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(game.currentTip, CANVAS_WIDTH * 0.5, 152);
    ctx.textAlign = "left";
  }

  if (game.boss && game.boss.alive) {
    const ratio = Math.max(0, game.boss.hp) / game.boss.maxHp;
    const width = 360;
    const x = CANVAS_WIDTH - width - 22;
    const y = 16;
    ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
    ctx.fillRect(x, y, width, 36);
    ctx.fillStyle = COLORS.warning;
    ctx.fillRect(x + 6, y + 18, (width - 12) * ratio, 12);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.strokeRect(x + 6, y + 18, width - 12, 12);
    ctx.fillStyle = "#fff3f3";
    ctx.font = "700 14px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.fillText("HEAVY CORE // MINI BOSS", x + 10, y + 14);
  }

  if (game.state === "paused") {
    ctx.fillStyle = "rgba(12, 20, 36, 0.68)";
    ctx.fillRect(CANVAS_WIDTH - 200, 68, 178, 28);
    ctx.fillStyle = "#f8fbff";
    ctx.font = "700 14px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.fillText("PAUSED", CANVAS_WIDTH - 140, 87);
  }

  ctx.restore();
}

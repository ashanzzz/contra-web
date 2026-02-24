import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  COLORS,
  DEFAULT_DIFFICULTY,
  DIFFICULTY_PRESETS,
  STORAGE_KEYS,
  WORLD,
} from "../constants.js";
import { createSfxManager } from "../audio/sfx.js";
import { Player } from "../entities/player.js";
import { Drone, GroundSoldier, MiniBoss, Turret, intersects } from "../entities/enemies.js";
import { createLevel1 } from "../level/level1.js";
import { drawHud } from "../ui/hud.js";

export class Game {
  constructor({ canvas, assets, keyboard, touch, ui }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.assets = assets;
    this.keyboard = keyboard;
    this.touch = touch;
    this.ui = ui;

    this.level = createLevel1();
    this.player = new Player(80, WORLD.floorY - 64);
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.effects = [];

    this.waveIndex = 0;
    this.boss = null;
    this.currentTip = "";
    this.tipTimer = 0;
    this.cameraX = 0;
    this.time = 0;
    this.state = "start";
    this.lastResult = null;

    this.sfx = createSfxManager();
    this.bestScore = loadBestScore();
    this.difficultyId = DEFAULT_DIFFICULTY;
    this.difficulty = DIFFICULTY_PRESETS[this.difficultyId];
    this.stats = createStats();

    this.startNewRun(this.difficultyId);
    this.state = "start";
  }

  startNewRun(difficultyId = this.difficultyId) {
    this.difficultyId = DIFFICULTY_PRESETS[difficultyId] ? difficultyId : DEFAULT_DIFFICULTY;
    this.difficulty = DIFFICULTY_PRESETS[this.difficultyId];

    this.level = createLevel1();
    this.player.reset(true);
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.effects = [];
    this.waveIndex = 0;
    this.boss = null;
    this.currentTip = "教学：方向键/WASD 移动，K/空格 跳跃，J 连发。";
    this.tipTimer = 4.8;
    this.cameraX = 0;
    this.time = 0;
    this.lastResult = null;
    this.stats = createStats();
    this.state = "playing";

    this.sfx.unlock();
    this.ui.setStatus(`作战中 · 难度 ${this.difficulty.label}`);
  }

  update(dt) {
    const input = mergeInput(this.keyboard.getState(), this.touch.getState());

    if (input.mutePressed) {
      this.toggleMute();
    }

    if (this.state === "paused") {
      if (input.pausePressed) {
        this.togglePause();
      }
      return;
    }

    if (this.state !== "playing") {
      return;
    }

    if (input.pausePressed) {
      this.togglePause();
      return;
    }

    this.time += dt;

    this.player.update(dt, input, this.level.terrain);

    const playerShot = this.player.tryShoot(input);
    if (playerShot) {
      this.playerBullets.push(playerShot);
      this.stats.shotsFired += 1;
      this.sfx.fire();
      this.spawnMuzzleFlash(playerShot.x, playerShot.y, playerShot.vx >= 0 ? 1 : -1);
    }

    this.spawnWavesByProgress();

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const shots = enemy.update(dt, this.player, this.level.terrain);
      if (shots.length) {
        this.enemyBullets.push(...shots);
      }
    }

    this.updateBullets(dt);
    this.updateBodyCollisions();
    this.updateEffects(dt);
    this.removeDead();

    if (this.tipTimer > 0) {
      this.tipTimer = Math.max(0, this.tipTimer - dt);
    }

    this.cameraX = clamp(this.player.x - CANVAS_WIDTH * 0.35, 0, this.level.length - CANVAS_WIDTH);

    if (this.player.lives <= 0 && this.player.hp <= 0) {
      this.finish(false, "任务失败：突击队全灭");
      return;
    }

    const bossCleared = !this.boss || !this.boss.alive;
    if (bossCleared && this.player.x >= this.level.finishX) {
      this.finish(true, "任务成功：基地已摧毁");
    }
  }

  spawnWavesByProgress() {
    while (this.waveIndex < this.level.waves.length) {
      const wave = this.level.waves[this.waveIndex];
      if (this.player.x < wave.atX) break;

      for (const spawn of wave.spawns) {
        const enemy = this.createEnemy(spawn);
        if (enemy) this.enemies.push(enemy);
      }

      this.currentTip = wave.tip;
      this.tipTimer = 4.2;
      this.waveIndex += 1;
    }
  }

  createEnemy(spawn) {
    if (spawn.type === "soldier") {
      return new GroundSoldier(spawn.x, spawn.y, spawn.patrol, this.difficulty);
    }
    if (spawn.type === "turret") {
      return new Turret(spawn.x, spawn.y, this.difficulty);
    }
    if (spawn.type === "drone") {
      return new Drone(spawn.x, spawn.y, this.difficulty);
    }
    if (spawn.type === "boss") {
      this.boss = new MiniBoss(spawn.x, spawn.y, this.difficulty);
      return this.boss;
    }
    return null;
  }

  updateBullets(dt) {
    for (const bullet of this.playerBullets) {
      if (!bullet.alive) continue;
      bullet.update(dt);
      if (bullet.x < 0 || bullet.x > this.level.length || bullet.y < 0 || bullet.y > CANVAS_HEIGHT + 200) {
        bullet.alive = false;
        continue;
      }

      for (const block of this.level.terrain) {
        if (intersects(bullet.bounds, block)) {
          bullet.alive = false;
          this.spawnExplosion(bullet.x, bullet.y, "#ffd77b", 4, 0.18);
          break;
        }
      }
      if (!bullet.alive) continue;

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (intersects(bullet.bounds, enemy.bounds)) {
          bullet.alive = false;
          this.stats.shotsHit += 1;
          this.sfx.hit();

          const died = enemy.hit(bullet.damage);
          if (died) {
            this.stats.kills += 1;
            this.player.score += Math.round(enemy.score * this.difficulty.scoreMultiplier);
            this.spawnExplosion(enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5, "#ff9276", 14, 0.44);
            this.sfx.enemyDown();
          } else {
            this.spawnExplosion(bullet.x, bullet.y, "#ffe6a8", 6, 0.24);
          }
          break;
        }
      }
    }

    for (const bullet of this.enemyBullets) {
      if (!bullet.alive) continue;
      bullet.update(dt);
      if (bullet.x < 0 || bullet.x > this.level.length || bullet.y < -80 || bullet.y > CANVAS_HEIGHT + 220) {
        bullet.alive = false;
        continue;
      }

      for (const block of this.level.terrain) {
        if (intersects(bullet.bounds, block)) {
          bullet.alive = false;
          this.spawnExplosion(bullet.x, bullet.y, "#ffb1a9", 5, 0.2);
          break;
        }
      }
      if (!bullet.alive) continue;

      if (intersects(bullet.bounds, this.player.bounds)) {
        bullet.alive = false;
        this.applyDamage(bullet.damage, bullet.x, bullet.y);
      }
    }
  }

  updateBodyCollisions() {
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (intersects(this.player.bounds, enemy.bounds)) {
        const amount = enemy.type === "boss" ? 2 : 1;
        const damaged = this.applyDamage(amount, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5);
        if (damaged) {
          this.player.vx = this.player.x < enemy.x ? -160 : 160;
          this.player.vy = -220;
        }
      }
    }
  }

  applyDamage(amount, fx, fy) {
    const previousLives = this.player.lives;
    const damaged = this.player.takeDamage(amount);
    if (!damaged) {
      return false;
    }

    this.sfx.playerHurt();
    this.spawnExplosion(fx, fy, "#ff9e9b", 7, 0.24);

    if (this.player.lives < previousLives) {
      this.stats.deaths += 1;
      this.spawnExplosion(this.player.x + this.player.width * 0.5, this.player.y + this.player.height * 0.5, "#ff6f5f", 18, 0.5);
      this.sfx.playerDown();
    }

    return true;
  }

  updateEffects(dt) {
    for (const effect of this.effects) {
      effect.life -= dt;

      if (effect.kind === "muzzle") {
        effect.x += effect.vx * dt;
        effect.y += effect.vy * dt;
        effect.vx *= 0.84;
        effect.vy *= 0.8;
        continue;
      }

      if (effect.kind === "burst") {
        effect.size += 120 * dt;
        continue;
      }

      effect.x += effect.vx * dt;
      effect.y += effect.vy * dt;
      effect.vy += 380 * dt;
      effect.vx *= 0.98;
    }
  }

  removeDead() {
    this.playerBullets = this.playerBullets.filter((bullet) => bullet.alive);
    this.enemyBullets = this.enemyBullets.filter((bullet) => bullet.alive);
    this.enemies = this.enemies.filter((enemy) => enemy.alive);
    this.effects = this.effects.filter((effect) => effect.life > 0);
  }

  finish(victory, text) {
    if (this.state === "win" || this.state === "lose") {
      return;
    }

    this.state = victory ? "win" : "lose";

    const missionSeconds = Math.max(1, Math.round(this.time));
    const accuracy = this.stats.shotsFired ? Math.round((this.stats.shotsHit / this.stats.shotsFired) * 100) : 0;
    const survivalBonus = Math.max(0, this.player.lives) * 180;
    const accuracyBonus = Math.round(accuracy * 4);
    const finalScore = this.player.score + survivalBonus + accuracyBonus;

    this.player.score = finalScore;

    if (finalScore > this.bestScore) {
      this.bestScore = finalScore;
      saveBestScore(this.bestScore);
    }

    this.lastResult = {
      victory,
      text,
      score: finalScore,
      bestScore: this.bestScore,
      missionSeconds,
      kills: this.stats.kills,
      accuracy,
      difficultyLabel: this.difficulty.label,
    };

    this.ui.showResult(this.lastResult);
    this.ui.setStatus(victory ? "作战完成" : "作战失败");

    if (victory) {
      this.sfx.victory();
    } else {
      this.sfx.defeat();
    }
  }

  togglePause() {
    if (this.state === "playing") {
      this.state = "paused";
      this.ui.setStatus("已暂停");
      return;
    }

    if (this.state === "paused") {
      this.state = "playing";
      this.ui.setStatus(`作战中 · 难度 ${this.difficulty.label}`);
    }
  }

  toggleMute() {
    const next = !this.sfx.muted;
    this.sfx.setMuted(next);
    this.ui.setStatus(next ? "音效：静音" : `作战中 · 难度 ${this.difficulty.label}`);
  }

  spawnExplosion(x, y, color, count = 10, ttl = 0.36) {
    this.effects.push({
      kind: "burst",
      x,
      y,
      size: 24,
      life: ttl * 0.9,
      maxLife: ttl * 0.9,
    });

    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 210;
      this.effects.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        size: 2 + Math.random() * 3,
        color,
        life: ttl * (0.75 + Math.random() * 0.55),
        maxLife: ttl,
      });
    }
  }

  spawnMuzzleFlash(x, y, direction = 1) {
    this.effects.push({
      kind: "muzzle",
      x,
      y,
      dir: direction,
      size: 44,
      vx: direction * 140,
      vy: -26,
      life: 0.12,
      maxLife: 0.12,
    });
  }

  render() {
    const ctx = this.ctx;
    this.drawBackground(ctx);

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    this.drawTerrain(ctx);
    this.drawProps(ctx);

    for (const bullet of this.playerBullets) {
      bullet.draw(ctx);
    }
    for (const bullet of this.enemyBullets) {
      bullet.draw(ctx);
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      this.drawEnemy(ctx, enemy);
    }

    this.player.draw(ctx, this.assets.player);
    this.drawEffects(ctx);

    ctx.restore();

    drawHud(ctx, this);

    if (this.state === "start") {
      this.drawCenterNotice("OPERATION READY", "点击开始作战");
    }
    if (this.state === "paused") {
      this.drawCenterNotice("PAUSED", "按 P / ESC 或触控暂停键继续");
    }
    if (this.state === "lose") {
      this.drawCenterNotice("MISSION FAILED", "点击下方按钮重新突击");
    }
    if (this.state === "win") {
      this.drawCenterNotice("MISSION COMPLETE", "基地已清除，准备下一行动");
    }
  }

  drawTerrain(ctx) {
    const tile = this.assets.tile;
    for (const block of this.level.terrain) {
      const cols = Math.ceil(block.width / 64);
      const rows = Math.ceil(block.height / 32);
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < cols; x += 1) {
          ctx.drawImage(tile, block.x + x * 64, block.y + y * 32, 64, 32);
        }
      }
    }
  }

  drawProps(ctx) {
    if (!Array.isArray(this.level.props)) {
      return;
    }

    const spriteMap = {
      crate: this.assets.crate,
      barrel: this.assets.barrel,
    };

    for (const prop of this.level.props) {
      const sprite = spriteMap[prop.type];
      if (!sprite) {
        ctx.fillStyle = "rgba(34, 48, 60, 0.7)";
        ctx.fillRect(prop.x, prop.y, prop.width, prop.height);
        continue;
      }
      ctx.drawImage(sprite, prop.x, prop.y, prop.width, prop.height);
    }
  }

  drawEnemy(ctx, enemy) {
    const spriteMap = {
      soldier: this.assets.soldier,
      turret: this.assets.turret,
      drone: this.assets.drone,
      boss: this.assets.boss,
    };

    const sprite = spriteMap[enemy.type];
    if (!sprite) {
      ctx.fillStyle = "#ff6674";
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      return;
    }

    ctx.drawImage(sprite, enemy.x, enemy.y, enemy.width, enemy.height);

    if (enemy.type !== "boss") return;

    ctx.fillStyle = COLORS.shadow;
    ctx.fillRect(enemy.x, enemy.y - 10, enemy.width, 6);
    ctx.fillStyle = "#ff958f";
    ctx.fillRect(enemy.x, enemy.y - 10, enemy.width * (enemy.hp / enemy.maxHp), 6);
  }

  drawBackground(ctx) {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, COLORS.skyTop);
    gradient.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const clouds = this.assets.bgClouds;
    const far = this.assets.bgFar;
    const near = this.assets.bgNear;

    drawParallax(ctx, clouds, this.cameraX * 0.08, 54, 120, 0.38);
    drawParallax(ctx, far, this.cameraX * 0.16, 130, CANVAS_HEIGHT - 260, 0.54);
    drawParallax(ctx, near, this.cameraX * 0.34, 180, CANVAS_HEIGHT - 210, 0.85);
  }

  drawEffects(ctx) {
    for (const effect of this.effects) {
      const alpha = clamp(effect.life / effect.maxLife, 0, 1);
      ctx.globalAlpha = alpha;

      if (effect.kind === "muzzle") {
        const sprite = this.assets.muzzle;
        if (sprite) {
          const size = effect.size;
          const drawX = effect.x - size * 0.5;
          const drawY = effect.y - size * 0.5;
          if (effect.dir < 0) {
            ctx.save();
            ctx.translate(drawX + size, drawY);
            ctx.scale(-1, 1);
            ctx.drawImage(sprite, 0, 0, size, size);
            ctx.restore();
          } else {
            ctx.drawImage(sprite, drawX, drawY, size, size);
          }
        }
        continue;
      }

      if (effect.kind === "burst") {
        const sprite = this.assets.burst;
        if (sprite) {
          const size = effect.size;
          ctx.drawImage(sprite, effect.x - size * 0.5, effect.y - size * 0.5, size, size);
        }
        continue;
      }

      ctx.fillStyle = effect.color;
      ctx.fillRect(effect.x, effect.y, effect.size, effect.size);
    }
    ctx.globalAlpha = 1;
  }

  drawCenterNotice(title, subtitle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "rgba(8, 10, 20, 0.5)";
    ctx.fillRect(230, 190, 500, 140);
    ctx.fillStyle = "#f8fbff";
    ctx.font = "700 36px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, CANVAS_WIDTH / 2, 245);
    ctx.font = "500 20px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.fillText(subtitle, CANVAS_WIDTH / 2, 286);
    ctx.textAlign = "left";
    ctx.restore();
  }
}

function mergeInput(primary, secondary) {
  return {
    left: primary.left || secondary.left,
    right: primary.right || secondary.right,
    down: primary.down || secondary.down,
    fire: primary.fire || secondary.fire,
    jumpPressed: primary.jumpPressed || secondary.jumpPressed,
    pausePressed: primary.pausePressed || secondary.pausePressed,
    mutePressed: primary.mutePressed || secondary.mutePressed,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawParallax(ctx, image, offsetX, y, height, alpha = 1) {
  const width = image.width ? image.width * (height / image.height) : 500;
  const safeWidth = Math.max(width, 1);
  const start = -((offsetX % safeWidth) + safeWidth);

  ctx.save();
  ctx.globalAlpha = alpha;
  for (let x = start; x < CANVAS_WIDTH + safeWidth; x += safeWidth) {
    ctx.drawImage(image, x, y, safeWidth, height);
  }
  ctx.restore();
}

function createStats() {
  return {
    shotsFired: 0,
    shotsHit: 0,
    kills: 0,
    deaths: 0,
  };
}

function loadBestScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.bestScore);
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.round(parsed));
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem(STORAGE_KEYS.bestScore, String(score));
  } catch {
    // ignore write errors in restricted environments
  }
}

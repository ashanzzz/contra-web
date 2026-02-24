import { BULLET_CONFIG, ENEMY_STATS, WORLD } from "../constants.js";
import { Projectile } from "./projectile.js";

class EnemyBase {
  constructor(type, x, y, width, height, difficulty = {}) {
    const base = ENEMY_STATS[type];

    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.vx = 0;
    this.vy = 0;

    this.score = base.score;

    this.moveMultiplier = difficulty.enemyMoveMultiplier ?? 1;
    this.fireRateMultiplier = difficulty.enemyFireRateMultiplier ?? 1;
    this.bulletSpeedMultiplier = difficulty.enemyBulletSpeedMultiplier ?? 1;
    this.damageMultiplier = difficulty.enemyDamageMultiplier ?? 1;

    this.maxHp = Math.max(1, Math.round(base.hp * (difficulty.enemyHpMultiplier ?? 1)));
    this.hp = this.maxHp;

    this.fireRate = base.fireRate / this.fireRateMultiplier;
    this.fireTimer = 0.35 + Math.random() * 0.8;
    this.alive = true;
  }

  hit(amount = 1) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.alive = false;
      return true;
    }
    return false;
  }

  get bounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  fireToward(playerX, playerY) {
    const centerX = this.x + this.width * 0.5;
    const centerY = this.y + this.height * 0.42;
    const dx = playerX - centerX;
    const dy = playerY - centerY;
    const len = Math.max(1, Math.hypot(dx, dy));
    const bulletSpeed = BULLET_CONFIG.enemySpeed * this.bulletSpeedMultiplier;
    const baseDamage = this.type === "boss" ? 2 : 1;
    const damage = Math.max(1, Math.round(baseDamage * this.damageMultiplier));

    return new Projectile({
      x: centerX,
      y: centerY,
      vx: (dx / len) * bulletSpeed,
      vy: (dy / len) * bulletSpeed,
      width: 8,
      height: 4,
      owner: "enemy",
      damage,
    });
  }
}

export class GroundSoldier extends EnemyBase {
  constructor(x, y, patrol = [x - 80, x + 120], difficulty = {}) {
    super("soldier", x, y, 40, 58, difficulty);
    this.patrol = patrol;
    this.vx = ENEMY_STATS.soldier.speed * this.moveMultiplier;
  }

  update(dt, player, terrain, world = WORLD) {
    const gravity = toNumber(world.gravity, WORLD.gravity);
    const floorY = toNumber(world.floorY, WORLD.floorY);

    this.fireTimer -= dt;
    this.vy += gravity * dt;

    this.x += this.vx * dt;
    if (this.x < this.patrol[0]) {
      this.x = this.patrol[0];
      this.vx = Math.abs(this.vx);
    }
    if (this.x > this.patrol[1]) {
      this.x = this.patrol[1];
      this.vx = -Math.abs(this.vx);
    }

    this.y += this.vy * dt;
    for (const block of terrain) {
      if (!intersects(this.bounds, block)) continue;
      if (this.vy > 0) {
        this.y = block.y - this.height;
        this.vy = 0;
      }
    }

    if (this.y + this.height >= floorY) {
      this.y = floorY - this.height;
      this.vy = 0;
    }

    const close = Math.abs(player.x + player.width / 2 - (this.x + this.width / 2)) < 280;
    if (this.fireTimer <= 0 && close) {
      this.fireTimer = this.fireRate + Math.random() * 0.5;
      return [this.fireToward(player.x + player.width / 2, player.y + 24)];
    }
    return [];
  }
}

export class Turret extends EnemyBase {
  constructor(x, y, difficulty = {}) {
    super("turret", x, y, 52, 52, difficulty);
  }

  update(dt, player) {
    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = this.fireRate + Math.random() * 0.4;
      return [this.fireToward(player.x + player.width / 2, player.y + 18)];
    }
    return [];
  }
}

export class Drone extends EnemyBase {
  constructor(x, y, difficulty = {}) {
    super("drone", x, y, 42, 34, difficulty);
    this.baseY = y;
    this.phase = Math.random() * Math.PI * 2;
    const speed = ENEMY_STATS.drone.speed * this.moveMultiplier;
    this.vx = Math.random() > 0.5 ? speed : -speed;
  }

  update(dt, player, _terrain, world = WORLD) {
    const worldLength = toNumber(world.length, WORLD.length);

    this.fireTimer -= dt;
    this.phase += dt * 3;
    this.x += this.vx * dt;
    this.y = this.baseY + Math.sin(this.phase) * 22;

    if (this.x < 0 || this.x > worldLength - this.width) {
      this.vx *= -1;
    }

    if (Math.abs(player.x - this.x) < 320 && this.fireTimer <= 0) {
      this.fireTimer = this.fireRate + Math.random() * 0.35;
      return [this.fireToward(player.x + player.width / 2, player.y + 16)];
    }
    return [];
  }
}

export class MiniBoss extends EnemyBase {
  constructor(x, y, difficulty = {}) {
    super("boss", x, y, 170, 128, difficulty);
    this.anchorX = x;
    this.direction = -1;
    this.spreadFlip = false;
    this.moveSpeed = ENEMY_STATS.boss.speed * this.moveMultiplier;
  }

  update(dt, player) {
    this.fireTimer -= dt;
    this.x += this.direction * this.moveSpeed * dt;
    if (this.x < this.anchorX - 180 || this.x > this.anchorX + 140) {
      this.direction *= -1;
    }

    if (this.fireTimer <= 0) {
      this.fireTimer = this.fireRate;
      const targetX = player.x + player.width / 2;
      const targetY = player.y + player.height / 2;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      const baseAngle = Math.atan2(targetY - centerY, targetX - centerX);
      const spread = this.spreadFlip ? [0, 0.22, -0.22] : [0, 0.33, -0.33];
      this.spreadFlip = !this.spreadFlip;

      return spread.map((delta) => {
        const angle = baseAngle + delta;
        return new Projectile({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * (BULLET_CONFIG.enemySpeed + 60) * this.bulletSpeedMultiplier,
          vy: Math.sin(angle) * (BULLET_CONFIG.enemySpeed + 60) * this.bulletSpeedMultiplier,
          width: 10,
          height: 6,
          owner: "enemy",
          damage: Math.max(1, Math.round(this.damageMultiplier)),
        });
      });
    }
    return [];
  }
}

export function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function toNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

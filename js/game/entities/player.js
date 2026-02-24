import { BULLET_CONFIG, PLAYER_CONFIG, WORLD } from "../constants.js";
import { Projectile } from "./projectile.js";

export class Player {
  constructor(x, y) {
    this.spawnX = x;
    this.spawnY = y;
    this.width = PLAYER_CONFIG.width;
    this.height = PLAYER_CONFIG.height;
    this.reset(true);
  }

  reset(fullReset = false) {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.crouching = false;
    this.fireTimer = 0;
    this.invincible = 0;
    if (fullReset) {
      this.maxHp = PLAYER_CONFIG.maxHp;
      this.hp = this.maxHp;
      this.lives = PLAYER_CONFIG.lives;
      this.score = 0;
      this.lastSafeX = this.spawnX;
    }
  }

  update(dt, input, terrain) {
    this.fireTimer -= dt;
    this.invincible = Math.max(0, this.invincible - dt);

    const move = (input.left ? -1 : 0) + (input.right ? 1 : 0);
    this.vx = move * PLAYER_CONFIG.speed;

    if (move !== 0) {
      this.facing = move;
    }

    this.crouching = Boolean(input.down && this.onGround && move === 0);

    if (input.jumpPressed && this.onGround) {
      this.vy = PLAYER_CONFIG.jumpVelocity;
      this.onGround = false;
    }

    this.vy += WORLD.gravity * dt;

    this.x += this.vx * dt;
    this.resolveHorizontal(terrain);

    this.y += this.vy * dt;
    this.resolveVertical(terrain);

    if (this.onGround && this.x > this.lastSafeX) {
      this.lastSafeX = this.x;
    }

    if (this.y > WORLD.floorY + 350) {
      this.takeDamage(999);
    }
  }

  resolveHorizontal(terrain) {
    for (const block of terrain) {
      if (!intersects(this.bounds, block)) continue;
      if (this.vx > 0) {
        this.x = block.x - this.width;
      } else if (this.vx < 0) {
        this.x = block.x + block.width;
      }
    }
  }

  resolveVertical(terrain) {
    this.onGround = false;
    for (const block of terrain) {
      if (!intersects(this.bounds, block)) continue;
      if (this.vy > 0) {
        this.y = block.y - this.height;
        this.vy = 0;
        this.onGround = true;
      } else if (this.vy < 0) {
        this.y = block.y + block.height;
        this.vy = 0;
      }
    }

    if (this.y + this.height >= WORLD.floorY) {
      this.y = WORLD.floorY - this.height;
      this.vy = 0;
      this.onGround = true;
    }

    if (this.x < 0) this.x = 0;
    if (this.x > WORLD.length - this.width) this.x = WORLD.length - this.width;
  }

  tryShoot(input) {
    if (!input.fire || this.fireTimer > 0) {
      return null;
    }

    this.fireTimer = PLAYER_CONFIG.fireCooldown;
    const shotY = this.crouching ? this.y + this.height - 18 : this.y + 20;
    return new Projectile({
      x: this.facing > 0 ? this.x + this.width : this.x - BULLET_CONFIG.width,
      y: shotY,
      vx: this.facing * BULLET_CONFIG.speed,
      width: BULLET_CONFIG.width,
      height: BULLET_CONFIG.height,
      owner: "player",
      damage: 1,
    });
  }

  takeDamage(amount) {
    if (this.invincible > 0) return false;
    this.hp -= amount;
    this.invincible = PLAYER_CONFIG.invincibleSeconds;
    if (this.hp <= 0) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.hp = 0;
        this.vx = 0;
        this.vy = 0;
        return true;
      }
      this.hp = this.maxHp;
      this.x = Math.max(this.spawnX, this.lastSafeX - 120);
      this.y = this.spawnY;
      this.vx = 0;
      this.vy = 0;
    }
    return true;
  }

  draw(ctx, sprite) {
    ctx.save();
    const blinking = this.invincible > 0 && Math.floor(this.invincible * 12) % 2 === 0;
    if (blinking) ctx.globalAlpha = 0.45;

    if (this.facing < 0) {
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      ctx.drawImage(sprite, 0, 0, this.width, this.height);
    } else {
      ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
    }

    if (this.crouching) {
      ctx.fillStyle = "rgba(15, 16, 23, 0.35)";
      ctx.fillRect(this.x, this.y + this.height - 14, this.width, 14);
    }

    ctx.restore();
  }

  get bounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

function intersects(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

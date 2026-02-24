export class Projectile {
  constructor({ x, y, vx, vy = 0, width = 10, height = 4, owner = "player", damage = 1 }) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = width;
    this.height = height;
    this.owner = owner;
    this.damage = damage;
    this.alive = true;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.owner === "player" ? "#ffe066" : "#ff6d6d";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  get bounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }
}

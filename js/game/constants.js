export const CANVAS_WIDTH = 960;
export const CANVAS_HEIGHT = 540;

export const WORLD = {
  length: 6200,
  gravity: 1800,
  floorY: 460,
};

export const PLAYER_CONFIG = {
  width: 44,
  height: 64,
  speed: 260,
  jumpVelocity: -640,
  maxHp: 5,
  lives: 3,
  fireCooldown: 0.14,
  invincibleSeconds: 1.2,
};

export const BULLET_CONFIG = {
  speed: 680,
  enemySpeed: 340,
  width: 10,
  height: 4,
};

export const COLORS = {
  skyTop: "#a8d8ff",
  skyBottom: "#e6f3ff",
  shadow: "rgba(0, 0, 0, 0.28)",
  warning: "#d6453a",
  good: "#3ea84a",
};

export const ENEMY_STATS = {
  soldier: { hp: 2, speed: 88, score: 120, fireRate: 1.35 },
  turret: { hp: 3, score: 180, fireRate: 1.75 },
  drone: { hp: 2, speed: 118, score: 160, fireRate: 1.25 },
  boss: { hp: 48, speed: 38, score: 3000, fireRate: 0.95 },
};

export const DIFFICULTY_PRESETS = {
  recruit: {
    id: "recruit",
    label: "新兵",
    enemyHpMultiplier: 0.9,
    enemyMoveMultiplier: 0.9,
    enemyFireRateMultiplier: 0.85,
    enemyBulletSpeedMultiplier: 0.9,
    enemyDamageMultiplier: 1,
    scoreMultiplier: 0.9,
  },
  standard: {
    id: "standard",
    label: "标准",
    enemyHpMultiplier: 1,
    enemyMoveMultiplier: 1,
    enemyFireRateMultiplier: 1,
    enemyBulletSpeedMultiplier: 1,
    enemyDamageMultiplier: 1,
    scoreMultiplier: 1,
  },
  veteran: {
    id: "veteran",
    label: "老兵",
    enemyHpMultiplier: 1.22,
    enemyMoveMultiplier: 1.14,
    enemyFireRateMultiplier: 1.2,
    enemyBulletSpeedMultiplier: 1.18,
    enemyDamageMultiplier: 1.35,
    scoreMultiplier: 1.25,
  },
};

export const DEFAULT_DIFFICULTY = "standard";

export const STORAGE_KEYS = {
  bestScore: "contra_iron_delta_best_score_v2",
};

import { WORLD } from "../constants.js";

export function createIronDeltaMap() {
  const floorY = WORLD.floorY;

  return {
    id: "iron-delta",
    name: "铁幕突击（Iron Delta）",
    briefing: "突击敌军沿岸基地，突破多段火力并摧毁核心机甲。",
    length: WORLD.length,
    floorY,
    gravity: WORLD.gravity,
    spawnX: 80,
    spawnY: floorY - 64,
    terrain: [
      { x: 0, y: floorY, width: WORLD.length, height: 80 },
      { x: 560, y: floorY - 90, width: 220, height: 20 },
      { x: 1320, y: floorY - 120, width: 260, height: 20 },
      { x: 2040, y: floorY - 90, width: 220, height: 20 },
      { x: 2860, y: floorY - 140, width: 260, height: 20 },
      { x: 3640, y: floorY - 100, width: 220, height: 20 },
      { x: 4460, y: floorY - 150, width: 280, height: 20 },
      { x: 5220, y: floorY - 120, width: 260, height: 20 },
    ],
    props: [
      { type: "crate", x: 380, y: floorY - 46, width: 46, height: 46 },
      { type: "barrel", x: 940, y: floorY - 50, width: 42, height: 50 },
      { type: "crate", x: 1710, y: floorY - 46, width: 46, height: 46 },
      { type: "barrel", x: 2580, y: floorY - 50, width: 42, height: 50 },
      { type: "crate", x: 3340, y: floorY - 46, width: 46, height: 46 },
      { type: "barrel", x: 4200, y: floorY - 50, width: 42, height: 50 },
      { type: "crate", x: 5060, y: floorY - 46, width: 46, height: 46 },
    ],
    waves: [
      {
        atX: 320,
        tip: "前方巡逻队，压枪推进。",
        spawns: [
          { type: "soldier", x: 470, y: floorY - 58, patrol: [420, 620] },
          { type: "soldier", x: 620, y: floorY - 58, patrol: [560, 760] },
        ],
      },
      {
        atX: 980,
        tip: "炮塔交叉火力，优先清理高处。",
        spawns: [
          { type: "turret", x: 1400, y: floorY - 52 },
          { type: "drone", x: 1200, y: floorY - 240 },
          { type: "soldier", x: 1520, y: floorY - 58, patrol: [1460, 1660] },
        ],
      },
      {
        atX: 1900,
        tip: "无人机群接近，注意头顶火线。",
        spawns: [
          { type: "drone", x: 2140, y: floorY - 250 },
          { type: "drone", x: 2380, y: floorY - 220 },
          { type: "soldier", x: 2300, y: floorY - 58, patrol: [2240, 2460] },
        ],
      },
      {
        atX: 2860,
        tip: "多点压制，保持移动节奏。",
        spawns: [
          { type: "turret", x: 2940, y: floorY - 52 },
          { type: "soldier", x: 3100, y: floorY - 58, patrol: [3020, 3240] },
          { type: "drone", x: 3300, y: floorY - 240 },
          { type: "soldier", x: 3460, y: floorY - 58, patrol: [3380, 3600] },
        ],
      },
      {
        atX: 3820,
        tip: "敌军反扑，压线突围。",
        spawns: [
          { type: "soldier", x: 3960, y: floorY - 58, patrol: [3900, 4120] },
          { type: "turret", x: 4300, y: floorY - 52 },
          { type: "drone", x: 4200, y: floorY - 230 },
        ],
      },
      {
        atX: 4620,
        tip: "核心防线出现重装单位。",
        spawns: [
          { type: "soldier", x: 4740, y: floorY - 58, patrol: [4680, 4880] },
          { type: "turret", x: 5000, y: floorY - 52 },
          { type: "drone", x: 5120, y: floorY - 230 },
          { type: "soldier", x: 5280, y: floorY - 58, patrol: [5200, 5420] },
        ],
      },
      {
        atX: 5200,
        tip: "核心机甲启动，集中火力！",
        spawns: [{ type: "boss", x: 5480, y: floorY - 128 }],
      },
    ],
    finishX: WORLD.length - 170,
    completion: {
      requireAllWaves: true,
      requireBossKill: true,
      minProgressX: 520,
    },
  };
}

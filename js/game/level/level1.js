import { WORLD } from "../constants.js";

export function createLevel1() {
  const terrain = [
    { x: 0, y: WORLD.floorY, width: WORLD.length, height: 80 },
    { x: 460, y: 392, width: 210, height: 20 },
    { x: 920, y: 360, width: 170, height: 20 },
    { x: 1380, y: 390, width: 220, height: 20 },
    { x: 1880, y: 338, width: 190, height: 20 },
    { x: 2460, y: 368, width: 220, height: 20 },
    { x: 3180, y: 392, width: 260, height: 20 },
    { x: 3760, y: 350, width: 200, height: 20 },
    { x: 4340, y: 390, width: 240, height: 20 },
    { x: 4860, y: 360, width: 180, height: 20 },
    { x: 5340, y: 392, width: 230, height: 20 },
  ];

  const props = [
    { type: "crate", x: 190, y: WORLD.floorY - 44, width: 44, height: 44 },
    { type: "barrel", x: 604, y: WORLD.floorY - 50, width: 34, height: 50 },
    { type: "crate", x: 976, y: 316, width: 40, height: 40 },
    { type: "barrel", x: 1450, y: 340, width: 34, height: 50 },
    { type: "crate", x: 1945, y: 298, width: 40, height: 40 },
    { type: "barrel", x: 2550, y: 318, width: 34, height: 50 },
    { type: "crate", x: 3260, y: 348, width: 44, height: 44 },
    { type: "barrel", x: 4380, y: 340, width: 34, height: 50 },
    { type: "crate", x: 5440, y: 348, width: 44, height: 44 },
  ];

  const waves = [
    {
      atX: 320,
      spawns: [
        { type: "soldier", x: 520, y: WORLD.floorY - 58, patrol: [480, 730] },
      ],
      tip: "教学：按住 J 连发，优先清地面兵。",
    },
    {
      atX: 760,
      spawns: [
        { type: "turret", x: 1020, y: 308 },
        { type: "drone", x: 1180, y: 240 },
      ],
      tip: "节奏提升：炮台压制 + 无人机穿插。",
    },
    {
      atX: 1320,
      spawns: [
        { type: "soldier", x: 1510, y: 332, patrol: [1430, 1680] },
        { type: "soldier", x: 1660, y: WORLD.floorY - 58, patrol: [1590, 1830] },
        { type: "drone", x: 1730, y: 220 },
      ],
      tip: "混合威胁：地面与空中同步逼近。",
    },
    {
      atX: 2140,
      spawns: [
        { type: "turret", x: 2410, y: 316 },
        { type: "turret", x: 2600, y: WORLD.floorY - 52 },
        { type: "drone", x: 2520, y: 198 },
      ],
      tip: "掩体区：利用高低差规避弹道。",
    },
    {
      atX: 3020,
      spawns: [
        { type: "soldier", x: 3280, y: 334, patrol: [3200, 3500] },
        { type: "drone", x: 3360, y: 208 },
        { type: "soldier", x: 3500, y: WORLD.floorY - 58, patrol: [3430, 3650] },
      ],
      tip: "收束战前：稳住节奏，准备 Boss。",
    },
    {
      atX: 4300,
      spawns: [
        { type: "turret", x: 4520, y: 338 },
        { type: "soldier", x: 4680, y: WORLD.floorY - 58, patrol: [4620, 4830] },
        { type: "drone", x: 4780, y: 220 },
      ],
      tip: "终局前哨：清场后推进到基地闸门。",
    },
    {
      atX: 5200,
      spawns: [{ type: "boss", x: 5610, y: 308 }],
      tip: "Boss 出现：注意三连弹幕节奏。",
    },
  ];

  return {
    name: "Operation Iron Delta",
    length: WORLD.length,
    terrain,
    props,
    waves,
    finishX: WORLD.length - 170,
  };
}

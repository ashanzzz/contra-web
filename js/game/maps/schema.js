import { WORLD } from "../constants.js";

const ENEMY_TYPES = new Set(["soldier", "turret", "drone", "boss"]);
const PROP_TYPES = new Set(["crate", "barrel"]);

export function normalizeMap(rawMap = {}) {
  const length = Math.max(1200, Math.round(toNumber(rawMap.length, WORLD.length)));
  const floorY = Math.round(toNumber(rawMap.floorY, WORLD.floorY));
  const gravity = Math.max(200, toNumber(rawMap.gravity, WORLD.gravity));

  const spawnX = clamp(Math.round(toNumber(rawMap.spawnX, 80)), 0, Math.max(0, length - 80));
  const spawnY = Math.round(toNumber(rawMap.spawnY, floorY - 64));

  const terrain = normalizeTerrain(rawMap.terrain, floorY, length);
  const props = normalizeProps(rawMap.props, floorY, length);
  const waves = normalizeWaves(rawMap.waves, floorY, length);

  const hasBossWave = waves.some((wave) => wave.spawns.some((spawn) => spawn.type === "boss"));

  const completionRaw = rawMap.completion ?? {};
  const minProgressDefault = Math.min(length - 80, spawnX + 360);
  const minProgressX = clamp(
    Math.round(toNumber(completionRaw.minProgressX, minProgressDefault)),
    Math.min(spawnX + 80, length - 40),
    length - 40,
  );
  const finishDefault = Math.max(minProgressX + 200, length - 170);
  const finishX = clamp(
    Math.round(toNumber(rawMap.finishX, finishDefault)),
    Math.min(minProgressX + 120, length - 20),
    length - 20,
  );

  return {
    id: sanitizeId(rawMap.id, "map"),
    name: toText(rawMap.name, "Unnamed Operation"),
    briefing: toText(rawMap.briefing, ""),
    length,
    floorY,
    gravity,
    spawnX,
    spawnY,
    terrain,
    props,
    waves,
    finishX,
    completion: {
      requireAllWaves: completionRaw.requireAllWaves !== false,
      requireBossKill: completionRaw.requireBossKill ?? hasBossWave,
      minProgressX,
    },
  };
}

function normalizeTerrain(terrainInput, floorY, length) {
  const terrain = [];

  if (Array.isArray(terrainInput)) {
    for (const item of terrainInput) {
      if (!item) continue;
      const x = clamp(Math.round(toNumber(item.x, 0)), 0, length - 10);
      const y = Math.round(toNumber(item.y, floorY));
      const width = Math.max(10, Math.round(toNumber(item.width, 80)));
      const height = Math.max(8, Math.round(toNumber(item.height, 20)));
      terrain.push({ x, y, width: Math.min(width, length - x), height });
    }
  }

  if (!terrain.length) {
    terrain.push({ x: 0, y: floorY, width: length, height: 80 });
    return terrain;
  }

  const hasGround = terrain.some((item) => item.y >= floorY - 8 && item.width >= length * 0.6);
  if (!hasGround) {
    terrain.unshift({ x: 0, y: floorY, width: length, height: 80 });
  }

  terrain.sort((a, b) => a.x - b.x);
  return terrain;
}

function normalizeProps(propsInput, floorY, length) {
  if (!Array.isArray(propsInput)) {
    return [];
  }

  const props = [];
  for (const item of propsInput) {
    if (!item) continue;
    const type = PROP_TYPES.has(item.type) ? item.type : "crate";
    const width = Math.max(10, Math.round(toNumber(item.width, 52)));
    const height = Math.max(10, Math.round(toNumber(item.height, 52)));
    const x = clamp(Math.round(toNumber(item.x, 0)), 0, length - width);
    const y = Math.round(toNumber(item.y, floorY - height));
    props.push({ type, x, y, width, height });
  }

  return props;
}

function normalizeWaves(wavesInput, floorY, length) {
  if (!Array.isArray(wavesInput)) {
    return [];
  }

  const waves = [];
  for (const wave of wavesInput) {
    if (!wave) continue;
    const atX = clamp(Math.round(toNumber(wave.atX, 0)), 0, length - 20);
    const tip = toText(wave.tip, "");
    const spawns = normalizeSpawns(wave.spawns, floorY, length);
    if (!spawns.length) continue;
    waves.push({ atX, tip, spawns });
  }

  waves.sort((a, b) => a.atX - b.atX);
  return waves;
}

function normalizeSpawns(spawnsInput, floorY, length) {
  if (!Array.isArray(spawnsInput)) {
    return [];
  }

  const spawns = [];
  for (const spawn of spawnsInput) {
    if (!spawn || !ENEMY_TYPES.has(spawn.type)) continue;

    const x = clamp(Math.round(toNumber(spawn.x, 0)), 0, length - 20);
    const yDefault = getDefaultSpawnY(spawn.type, floorY);
    const y = Math.round(toNumber(spawn.y, yDefault));

    if (spawn.type === "soldier") {
      const patrol = normalizePatrol(spawn.patrol, x, length);
      spawns.push({ type: "soldier", x, y, patrol });
      continue;
    }

    spawns.push({ type: spawn.type, x, y });
  }

  return spawns;
}

function normalizePatrol(patrolInput, x, length) {
  const leftDefault = Math.max(0, x - 80);
  const rightDefault = Math.min(length - 20, x + 120);

  if (!Array.isArray(patrolInput) || patrolInput.length < 2) {
    return [leftDefault, rightDefault];
  }

  const left = clamp(Math.round(toNumber(patrolInput[0], leftDefault)), 0, length - 20);
  const right = clamp(Math.round(toNumber(patrolInput[1], rightDefault)), 0, length - 20);
  if (left >= right) {
    return [leftDefault, rightDefault];
  }
  return [left, right];
}

function getDefaultSpawnY(type, floorY) {
  if (type === "drone") return floorY - 220;
  if (type === "boss") return floorY - 128;
  if (type === "turret") return floorY - 52;
  return floorY - 58;
}

function sanitizeId(value, fallback) {
  const text = toText(value, fallback).toLowerCase();
  const clean = text.replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean || fallback;
}

function toText(value, fallback) {
  return typeof value === "string" ? value.trim() || fallback : fallback;
}

function toNumber(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

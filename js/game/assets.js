const manifest = {
  player: "assets/player.svg",
  soldier: "assets/enemy_soldier.svg",
  turret: "assets/enemy_turret.svg",
  drone: "assets/enemy_drone.svg",
  boss: "assets/enemy_boss.svg",
  tile: "assets/tile_ground.svg",
  bgFar: "assets/bg_far.svg",
  bgNear: "assets/bg_near.svg",
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export async function loadAssets() {
  const entries = Object.entries(manifest);
  const loaded = await Promise.all(entries.map(async ([key, src]) => [key, await loadImage(src)]));
  return Object.fromEntries(loaded);
}

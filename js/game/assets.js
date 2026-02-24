const manifest = {
  player: "assets/player.svg",
  soldier: "assets/enemy_soldier.svg",
  turret: "assets/enemy_turret.svg",
  drone: "assets/enemy_drone.svg",
  boss: "assets/enemy_boss.svg",
  tile: "assets/tile_ground.svg",
  bgFar: "assets/bg_far.svg",
  bgNear: "assets/bg_near.svg",
  bgClouds: "assets/bg_clouds.svg",
  crate: "assets/prop_crate.svg",
  barrel: "assets/prop_barrel.svg",
  burst: "assets/effect_burst.svg",
  muzzle: "assets/effect_muzzle.svg",
};

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function createPlaceholderAsset(key) {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#2a3948";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#ffcc76";
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  ctx.fillStyle = "#f2f7ff";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("MISSING", canvas.width / 2, 40);
  ctx.fillText(key.toUpperCase(), canvas.width / 2, 62);

  return loadImage(canvas.toDataURL("image/png"));
}

async function loadAssetWithFallback(key, src) {
  try {
    return await loadImage(src);
  } catch (error) {
    console.warn(`[assets] ${error.message}. Using placeholder for ${key}.`);
    return createPlaceholderAsset(key);
  }
}

export async function loadAssets() {
  const entries = Object.entries(manifest);
  const loaded = await Promise.all(entries.map(async ([key, src]) => [key, await loadAssetWithFallback(key, src)]));
  return Object.fromEntries(loaded);
}

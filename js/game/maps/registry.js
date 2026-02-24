import { createIronDeltaMap } from "./iron-delta.js";
import { normalizeMap } from "./schema.js";

const mapFactories = {
  "iron-delta": createIronDeltaMap,
};

const orderedIds = Object.keys(mapFactories);

const mapCatalog = orderedIds.map((id) => {
  const map = normalizeMap(mapFactories[id]());
  return {
    id: map.id,
    name: map.name,
    briefing: map.briefing,
  };
});

export const DEFAULT_MAP_ID = mapCatalog[0]?.id ?? "iron-delta";

export function listMaps() {
  return mapCatalog.map((map) => ({ ...map }));
}

export function createMapById(mapId = DEFAULT_MAP_ID) {
  const factory = mapFactories[mapId] || mapFactories[DEFAULT_MAP_ID];
  if (!factory) {
    throw new Error("No map factory registered");
  }
  return normalizeMap(factory());
}

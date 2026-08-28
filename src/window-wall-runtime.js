import { createSegmentBoxMesh } from "./segment-box-runtime.js";

export function resolveWindowWallFeatures(model) {
  const explicitInfills = model.windowWallInfills ?? [];
  const explicitUpperWindowIds = new Set(
    explicitInfills.filter(({ position }) => position === "upper").map(({ windowId }) => windowId),
  );
  const explicitLowerWindowIds = new Set(
    explicitInfills.filter(({ position }) => position === "lower").map(({ windowId }) => windowId),
  );
  const legacySills = model.windows
    .filter(({ id }) => !explicitLowerWindowIds.has(id))
    .map((windowFeature) => ({
      ...windowFeature,
      ...windowFeature.wallFaceMetadata,
      id: `${windowFeature.id}-SILL-WALL`,
      windowId: windowFeature.id,
      bottomMm: 0,
      topMm: windowFeature.sillMm,
      depthMm: model.renderConventions.wallVisualThicknessMm,
      rendererPath: "legacy-derived-window-sill",
    }));
  const legacyHeads = model.windows
    .filter(({ id }) => !explicitUpperWindowIds.has(id))
    .map((windowFeature) => ({
      ...windowFeature,
      ...windowFeature.wallFaceMetadata,
      id: `${windowFeature.id}-HEAD-WALL`,
      windowId: windowFeature.id,
      bottomMm: windowFeature.headMm,
      topMm: model.rooms.find((room) => room.id === windowFeature.roomId).ceilingHeightMm,
      depthMm: model.renderConventions.wallVisualThicknessMm,
      rendererPath: "legacy-derived-window-head",
    }));
  return [
    ...legacySills,
    ...legacyHeads,
    ...explicitInfills.map((feature) => ({ ...feature, rendererPath: "explicit-generated-window-infill" })),
  ];
}

export function createWindowWallMeshes(model, conventions, material) {
  return resolveWindowWallFeatures(model).map((feature) => createSegmentBoxMesh(
    feature,
    feature.bottomMm,
    feature.topMm,
    feature.depthMm ?? conventions.wallVisualThicknessMm,
    material,
  ));
}

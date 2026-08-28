import * as THREE from "three";
import {
  calculateFinishedFacePlacement,
  calculateInwardProjectionPlacement,
} from "./measurement-utils.js";

const mm = (value) => value * 0.001;

export function applyFeatureMetadata(object, feature) {
  object.name = feature.id;
  object.userData = {
    featureId: feature.id,
    windowId: feature.windowId ?? null,
    classification: feature.classification,
    componentClass: feature.componentClass ?? null,
    sourceFeatureId: feature.sourceFeatureId,
    sourceFeatureIds: feature.sourceFeatureIds,
    recessedWindowEdgeIds: feature.recessedWindowEdgeIds,
    position: feature.position ?? null,
    depthMm: feature.depthMm ?? null,
    backPlaneMeaning: feature.backPlaneMeaning ?? null,
    closed: feature.closed ?? null,
    widthMm: feature.widthMm ?? null,
    locationStatus: feature.locationStatus ?? null,
    coordinateMm: feature.coordinate ?? null,
    visualDiameterMm: feature.visualDiameterMm ?? null,
    sourceEndpointsMm: feature.endpoints?.map(({ x, y }) => ({ x, y })) ?? null,
    bottomMm: feature.bottomMm ?? null,
    topMm: feature.topMm ?? null,
    roomId: feature.roomId,
    measurementSurface: object.isMesh === true,
    authoritativeFinishedFaceAligned: object.isMesh === true ? feature.authoritativeFinishedFaceAligned === true : null,
    frontFaceAligned: object.isMesh === true ? feature.frontFaceAligned === true : null,
    sourceDatumMeaning: feature.sourceDatumMeaning ?? null,
    roomFacingSide: feature.roomFacingSide ?? null,
    visualThicknessMm: feature.visualThicknessMm ?? null,
    roomFacingPlaneOffsetMm: feature.roomFacingPlaneOffsetMm ?? null,
    oppositeFaceStatus: feature.oppositeFaceStatus ?? null,
    sourcePlaneBackAligned: object.isMesh === true ? feature.sourcePlaneBackAligned === true : null,
    sourcePlaneOffsetMm: feature.sourcePlaneOffsetMm ?? null,
    casingProjectionMm: feature.casingProjectionMm ?? null,
    renderCentreOffsetMm: feature.renderCentreOffsetMm ?? null,
    renderedDepthMm: feature.renderedDepthMm ?? null,
  };
  return object;
}

export function createSegmentBoxMesh(feature, bottomMm, topMm, thicknessMm, material) {
  const [a, b] = feature.endpoints;
  const dx = mm(b.x - a.x);
  const dz = mm(b.y - a.y);
  const length = Math.hypot(dx, dz);
  const height = mm(topMm - bottomMm);
  const geometry = new THREE.BoxGeometry(length, height, mm(thicknessMm));
  const mesh = new THREE.Mesh(geometry, material);
  const facePlacement = feature.authoritativeFinishedFaceAligned || feature.frontFaceAligned
    ? calculateFinishedFacePlacement(feature.endpoints, thicknessMm, feature.roomFacingSide)
    : null;
  const inwardProjectionPlacement = feature.sourcePlaneBackAligned
    ? calculateInwardProjectionPlacement(feature.endpoints, thicknessMm, feature.roomFacingSide)
    : null;
  const centreOffsetMm = facePlacement?.centreOffsetMm ?? inwardProjectionPlacement?.centreOffsetMm ?? { x: 0, y: 0 };
  mesh.position.set(
    mm((a.x + b.x) / 2 + centreOffsetMm.x),
    mm((bottomMm + topMm) / 2),
    mm((a.y + b.y) / 2 + centreOffsetMm.y),
  );
  mesh.rotation.y = -Math.atan2(dz, dx);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  applyFeatureMetadata(mesh, {
    ...feature,
    bottomMm,
    topMm,
    renderedDepthMm: thicknessMm,
    renderCentreOffsetMm: centreOffsetMm,
    ...(facePlacement ? { roomFacingPlaneOffsetMm: facePlacement.roomFacingPlaneOffsetMm } : {}),
    ...(inwardProjectionPlacement ? {
      sourcePlaneOffsetMm: inwardProjectionPlacement.sourcePlaneOffsetMm,
      roomFacingPlaneOffsetMm: inwardProjectionPlacement.roomFacingPlaneOffsetMm,
    } : {}),
  });
  return mesh;
}

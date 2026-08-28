import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import {
  buildValidationReport,
  calculateComparison,
  calculateFinishedFacePlacement,
  calculateInwardProjectionPlacement,
  calculateMeasurement,
  closestMeasurementSurfaceHit,
  endpointAllowedForMode,
  isMeasurementSurface,
  nearestValidationNode,
  pointerToNdc,
  roomFacingSideForDirectedSegment,
  roomsVisible,
} from "../src/measurement-utils.js";
import { createWindowWallMeshes, resolveWindowWallFeatures } from "../src/window-wall-runtime.js";
import { createCp1LowerServiceGroup } from "../src/cp1-lower-service-runtime.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
const shell = readJson("public/generated/flat-shell-v0_1.json");
const whole = readJson("docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json");
const toleranceMm = shell.surveyValidation.geometryValidation.toleranceMm;
const sourcePoints = {
  ...whole.geometry.roomAFinalReviewMm,
  ...whole.geometry.roomCUnchangedNodesMm,
  ...whole.geometry.roomCUnchangedObjectNodesMm,
  ...whole.geometry.roomBWCUnchangedMm,
};

let maximumNodeDeltaMm = 0;
for (const node of shell.surveyValidation.nodes) {
  const source = sourcePoints[node.id];
  if (!source) throw new Error(`Validation node ${node.id} has no promoted source coordinate.`);
  maximumNodeDeltaMm = Math.max(maximumNodeDeltaMm, Math.hypot(node.coordinateMm.x - source.x, node.coordinateMm.y - source.y));
}
if (maximumNodeDeltaMm > toleranceMm) throw new Error(`Validation node delta ${maximumNodeDeltaMm} mm exceeds tolerance.`);

const roomC = shell.rooms.find(({ id }) => id === "ROOM-C");
for (const coordinate of roomC.points) {
  if (!Object.values(whole.geometry.roomCUnchangedNodesMm).some((source) => Math.hypot(coordinate.x - source.x, coordinate.y - source.y) <= toleranceMm)) {
    throw new Error("A Room C boundary coordinate does not match a promoted Room C node.");
  }
}

for (const cupboard of shell.cupboards) {
  const expectedIds = cupboard.sourceFeatureIds;
  cupboard.points.forEach((coordinate, index) => {
    const source = sourcePoints[expectedIds[index]];
    if (!source || Math.hypot(coordinate.x - source.x, coordinate.y - source.y) > toleranceMm) throw new Error(`${cupboard.id} footprint point ${index} moved.`);
  });
}

const alignedWallRecords = [
  ...shell.walls.map((feature) => ({ id: feature.id, endpoints: feature.endpoints, metadata: feature })),
  ...shell.doorFaces.flatMap((feature) => {
    const fragments = [{ id: `${feature.id}-WALL-HEAD`, endpoints: feature.wallHeadEndpoints ?? feature.clearEndpoints, metadata: feature.wallHeadFaceMetadata ?? feature.wallFaceMetadata }];
    [[feature.outerEndpoints[0], feature.clearEndpoints[0]], [feature.outerEndpoints[1], feature.clearEndpoints[1]]].forEach((endpoints, index) => {
      if (Math.hypot(endpoints[1].x - endpoints[0].x, endpoints[1].y - endpoints[0].y) < 0.1) return;
      fragments.push({
        id: `${feature.id}-WALL-SIDE-${index + 1}`,
        endpoints,
        metadata: {
          ...feature.wallFaceMetadata,
          roomFacingSide: roomFacingSideForDirectedSegment(feature.clearEndpoints, endpoints, feature.wallFaceMetadata.roomFacingSide),
        },
      });
    });
    return fragments;
  }),
  ...shell.windows.map((feature) => ({ id: `${feature.id} surrounding wall pieces`, endpoints: feature.endpoints, metadata: feature.wallFaceMetadata })),
  ...(shell.windowWallInfills ?? []).map((feature) => ({ id: feature.id, endpoints: feature.endpoints, metadata: feature })),
];
let maximumFinishedFacePlaneDeltaMm = 0;
for (const feature of alignedWallRecords) {
  const metadata = feature.metadata;
  if (!metadata?.authoritativeFinishedFaceAligned || metadata.sourceDatumMeaning !== "authoritative surveyed finished-wall face") {
    throw new Error(`${feature.id} lacks authoritative finished-face metadata.`);
  }
  const expectedDepthMm = metadata.depthMm ?? shell.renderConventions.wallVisualThicknessMm;
  if (metadata.visualThicknessMm !== expectedDepthMm || metadata.roomFacingPlaneOffsetMm !== 0) {
    throw new Error(`${feature.id} has inconsistent wall-render metadata.`);
  }
  const placement = calculateFinishedFacePlacement(feature.endpoints, expectedDepthMm, metadata.roomFacingSide);
  const centreNormalOffsetMm = placement.centreOffsetMm.x * placement.inwardNormal.x + placement.centreOffsetMm.y * placement.inwardNormal.y;
  const renderedRoomFaceDeltaMm = Math.abs(centreNormalOffsetMm + expectedDepthMm / 2);
  maximumFinishedFacePlaneDeltaMm = Math.max(maximumFinishedFacePlaneDeltaMm, renderedRoomFaceDeltaMm);
}
if (maximumFinishedFacePlaneDeltaMm > toleranceMm) throw new Error(`A rendered room-facing wall plane is ${maximumFinishedFacePlaneDeltaMm} mm from its authoritative source plane.`);
if (shell.volumes.find(({ id }) => id === "ROOM-C-REMOVABLE-PARTITION")?.authoritativeFinishedFaceAligned != null) throw new Error("The removable partition was incorrectly given permanent-wall face semantics.");
if (shell.windows.some((feature) => feature.authoritativeFinishedFaceAligned != null)) throw new Error("Window/glazing features were incorrectly moved onto the permanent-wall face convention.");

const horizontalLeftPlacement = calculateFinishedFacePlacement([{ x: 0, y: 0 }, { x: 1000, y: 0 }], 80, "left");
const verticalRightPlacement = calculateFinishedFacePlacement([{ x: 0, y: 0 }, { x: 0, y: 1000 }], 80, "right");
if (horizontalLeftPlacement.centreOffsetMm.x !== 0 || horizontalLeftPlacement.centreOffsetMm.y !== -40
  || verticalRightPlacement.centreOffsetMm.x !== -40 || verticalRightPlacement.centreOffsetMm.y !== 0) {
  throw new Error("Finished-face wall placement direction cases failed.");
}
if (roomFacingSideForDirectedSegment([{ x: 0, y: 0 }, { x: 100, y: 0 }], [{ x: 50, y: 0 }, { x: 0, y: 0 }], "left") !== "right") {
  throw new Error("Reversed finished-face fragment orientation failed.");
}

const d2C = shell.doorFaces.find(({ id }) => id === "D2-C");
for (const [index, id] of ["D2-OPENING-R", "D2-OPENING-L-INFERRED"].entries()) {
  const coordinate = d2C.clearEndpoints[index];
  const source = sourcePoints[id];
  if (Math.hypot(coordinate.x - source.x, coordinate.y - source.y) > toleranceMm) throw new Error(`D2-C opening endpoint ${id} moved.`);
}

const numericCases = [
  {
    name: "horizontal",
    start: { coordinateMm: { x: 0, y: 0, elevation: 0 } },
    end: { coordinateMm: { x: 3000, y: 4000, elevation: 0 } },
    expected: { horizontalDistanceMm: 5000, verticalDifferenceMm: 0, trueDistanceMm: 5000 },
  },
  {
    name: "vertical and 3D",
    start: { coordinateMm: { x: 0, y: 0, elevation: 1000 } },
    end: { coordinateMm: { x: 3000, y: 4000, elevation: 2200 } },
    expected: { horizontalDistanceMm: 5000, verticalDifferenceMm: 1200, trueDistanceMm: Math.hypot(5000, 1200) },
  },
];
for (const test of numericCases) {
  const result = calculateMeasurement(test.start, test.end);
  for (const key of Object.keys(test.expected)) {
    if (Math.abs(result[key] - test.expected[key]) > 1e-9) throw new Error(`Measurement calculation ${test.name}/${key} failed.`);
  }
}

const reportFixtureStart = { nodeId: "D2-CR", featureId: null, nearestNodeId: "D2-CR", description: "Room C D2 casing edge", coordinateMm: { x: 4176.98, y: -579.94, elevation: 0 } };
const reportFixtureEnd = { nodeId: null, featureId: "ROOM-C-WALL-15", nearestNodeId: "D3-CL", description: "Room C permanent wall — arbitrary virtual point", coordinateMm: { x: 4168.34, y: -100, elevation: 1200 } };
const reportFixture = { id: "VM-001", start: reportFixtureStart, end: reportFixtureEnd, ...calculateMeasurement(reportFixtureStart, reportFixtureEnd), fieldStatus: "completed", fieldId: "FIELD-001", realWorldMm: 4221 };
const reportText = buildValidationReport([reportFixture], shell.sourceAuthority);
for (const requiredText of ["3D VALIDATION SESSION", "VM-001", "Node D2-CR", "Feature ROOM-C-WALL-15", "Model horizontal", "Real world: 4221 mm", "Difference (real - model)", "Vertical difference", "True 3D distance", "FIELD-001", "Field status: completed", "Technical traceability:"]) {
  if (!reportText.includes(requiredText)) throw new Error(`Validation report omitted required traceability text: ${requiredText}`);
}

const d2OpeningRight = shell.surveyValidation.nodes.find(({ id }) => id === "D2-OPENING-R");
const c0Node = shell.surveyValidation.nodes.find(({ id }) => id === "C0");
const d2ToC0 = calculateMeasurement({ coordinateMm: d2OpeningRight.coordinateMm }, { coordinateMm: c0Node.coordinateMm });
const d2ToC0Comparison = calculateComparison(d2ToC0.horizontalDistanceMm, 4221);
if (Math.abs(d2ToC0.horizontalDistanceMm - 4217.0478209287585) > 1e-9 || Math.abs(d2ToC0Comparison.signedDifferenceMm - 3.952179071241517) > 1e-9) throw new Error("D2-OPENING-R to C0 / 4221 mm workflow calculation failed.");

const roomFilterCases = [
  { name: "Room C only", active: new Set(["ROOM-C"]), visible: [["ROOM-C"], ["ROOM-C", "ROOM-A"]], expected: [true, false] },
  { name: "Room A + C", active: new Set(["ROOM-A", "ROOM-C"]), visible: [["ROOM-C"], ["ROOM-A", "ROOM-C"], ["ROOM-B", "ROOM-C"]], expected: [true, true, false] },
  { name: "Room B + C", active: new Set(["ROOM-B", "ROOM-C"]), visible: [["ROOM-C"], ["ROOM-A", "ROOM-C"], ["ROOM-B", "ROOM-C"]], expected: [true, false, true] },
];
for (const test of roomFilterCases) test.visible.forEach((required, index) => {
  if (roomsVisible(required, test.active) !== test.expected[index]) throw new Error(`Room filter case failed: ${test.name}.`);
});
const modeCases = { node: { node: true, free: false }, free: { node: false, free: true }, mixed: { node: true, free: true } };
for (const [mode, expectations] of Object.entries(modeCases)) for (const [kind, expected] of Object.entries(expectations)) {
  if (endpointAllowedForMode(mode, kind) !== expected) throw new Error(`Measurement mode ${mode}/${kind} failed.`);
}

const ndcCentre = pointerToNdc(600, 300, { left: 100, top: 50, width: 1000, height: 500 });
if (ndcCentre.x !== 0 || ndcCentre.y !== 0) throw new Error("Canvas-relative pointer conversion failed.");

const physicalSurface = {
  isMesh: true,
  visible: true,
  userData: { measurementSurface: true, featureId: "ROOM-C-WALL-15", roomId: "ROOM-C" },
  material: { visible: true, transparent: false, opacity: 1 },
  parent: { visible: true, parent: null },
};
const edgeHelper = {
  isLineSegments: true,
  visible: true,
  userData: { measurementHelper: true },
  material: { visible: true, transparent: true, opacity: 0.55 },
  parent: physicalSurface,
};
const hiddenSurface = {
  ...physicalSurface,
  userData: { measurementSurface: true, featureId: "ROOM-B-WALL-HIDDEN", roomId: "ROOM-B" },
  parent: { visible: false, parent: null },
};
if (!isMeasurementSurface(physicalSurface) || isMeasurementSurface(edgeHelper) || isMeasurementSurface(hiddenSurface)) throw new Error("Measurement surface eligibility failed.");
const selectedSurfaceHit = closestMeasurementSurfaceHit([
  { object: edgeHelper, distance: 1 },
  { object: physicalSurface, distance: 2 },
]);
if (selectedSurfaceHit?.object !== physicalSurface) throw new Error("A helper edge intercepted the physical measurement surface.");

const snapNodes = [
  { id: "A-HIDDEN", roomId: "ROOM-A", coordinateMm: { x: 1, y: 0, elevation: 0 } },
  { id: "C-VISIBLE", roomId: "ROOM-C", coordinateMm: { x: 20, y: 0, elevation: 0 } },
];
const visibleSnap = nearestValidationNode({ x: 0, y: 0, elevation: 0 }, snapNodes, new Set(["ROOM-C"]));
if (visibleSnap?.node.id !== "C-VISIBLE" || visibleSnap.distanceMm !== 20) throw new Error("Mixed-mode snapping did not respect visible node rooms.");

const crossRoomSurface = { ...physicalSurface, userData: { ...physicalSurface.userData, featureId: "ROOM-B-WALL-01", roomId: "ROOM-B" } };
if (!isMeasurementSurface(crossRoomSurface)) throw new Error("Free surface selection was incorrectly restricted by node-room filters.");

const roomCMeasurementExpectations = {
  "RC-08": 580,
  "ROOM-C-W2-WIDTH": 1269,
  "ROOM-C-CP1-BODY-WIDTH": 1285,
  "ROOM-C-CP2-BODY-WIDTH": 708,
};
for (const [id, expectedModelMm] of Object.entries(roomCMeasurementExpectations)) {
  const measurement = shell.surveyValidation.repositoryMeasurements.find((candidate) => candidate.id === id);
  if (!measurement || Math.abs(measurement.modelPlanDistanceMm - expectedModelMm) > 0.02) throw new Error(`Room C overlay ${id} failed its model-distance check.`);
}

const wallById = (id) => shell.walls.find((feature) => feature.id === id);
const doorFaceById = (id) => shell.doorFaces.find((feature) => feature.id === id);
const projectToInfiniteSegmentLine = (coordinate, endpoints) => {
  const [start, end] = endpoints;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const factor = ((coordinate.x - start.x) * dx + (coordinate.y - start.y) * dy) / (dx * dx + dy * dy);
  return { x: start.x + factor * dx, y: start.y + factor * dy, elevation: coordinate.elevation ?? 0 };
};
const horizontalDistance = (start, end) => Math.hypot(end.x - start.x, end.y - start.y);
const parallelLineSeparation = (first, second) => {
  const [start, end] = second.endpoints;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const point = first.endpoints[0];
  return Math.abs((point.x - start.x) * dy - (point.y - start.y) * dx) / Math.hypot(dx, dy);
};
const roomAControlResults = [
  { id: "A1", beforeMm: 3925.1, realMm: 4014, afterMm: parallelLineSeparation(wallById("ROOM-A-WALL-03"), wallById("ROOM-A-WALL-09")) },
  { id: "A2", beforeMm: 4459.5, realMm: 4550, afterMm: parallelLineSeparation(wallById("ROOM-A-WALL-11"), wallById("ROOM-A-WALL-06")) },
];
for (const control of roomAControlResults) {
  if (control.afterMm - control.beforeMm < 79 || control.afterMm - control.beforeMm > 81 || Math.abs(control.realMm - control.afterMm) > 12) {
    throw new Error(`Room A finished-face control ${control.id} failed.`);
  }
}

const d5WC = doorFaceById("D5-WC");
const expectedD5WCClearEndpoints = [whole.geometry.wcD5FinalReviewMm.doorLeft, whole.geometry.wcD5FinalReviewMm.doorRight];
if (!d5WC || d5WC.wallHeadDatum !== "WC permanent wall / outer-casing-boundary plane") throw new Error("D5-WC wall-head datum metadata is missing.");
for (const [index, expected] of expectedD5WCClearEndpoints.entries()) {
  if (horizontalDistance(d5WC.clearEndpoints[index], expected) > toleranceMm) throw new Error(`D5-WC clear endpoint ${index + 1} moved.`);
  if (Math.abs(d5WC.wallHeadEndpoints[index].y - expected.y) > toleranceMm) throw new Error(`D5-WC wall-head longitudinal endpoint ${index + 1} moved.`);
  const projected = projectToInfiniteSegmentLine(d5WC.wallHeadEndpoints[index], d5WC.outerEndpoints);
  if (horizontalDistance(d5WC.wallHeadEndpoints[index], projected) > toleranceMm) throw new Error(`D5-WC wall-head endpoint ${index + 1} is not on the permanent wall/casing-boundary plane.`);
}
const d5WCWallHeadDatumShiftMm = horizontalDistance(d5WC.clearEndpoints[0], d5WC.wallHeadEndpoints[0]);
if (Math.abs(d5WCWallHeadDatumShiftMm - whole.geometry.wcD5FinalReviewMm.topDerivedRevealDepthMm) > toleranceMm) throw new Error("D5-WC wall-head datum shift no longer matches the established clear-to-casing-boundary depth.");
const d5WCWallHeadToWall02Mm = parallelLineSeparation({ endpoints: d5WC.wallHeadEndpoints }, wallById("WC-WALL-02"));
if (Math.abs(d5WCWallHeadToWall02Mm - 1662.688) > 0.001) throw new Error("D5-WC wall-head to WC-WALL-02 finished-face span changed unexpectedly.");

const wallThicknessMm = shell.renderConventions.wallVisualThicknessMm;
const wallHeadPlacement = calculateFinishedFacePlacement(
  d5WC.wallHeadEndpoints,
  wallThicknessMm,
  d5WC.wallHeadFaceMetadata.roomFacingSide,
);
const intendedWallHeadPlaneX = d5WC.wallHeadEndpoints[0].x;
const wallHeadCentreX = intendedWallHeadPlaneX + wallHeadPlacement.centreOffsetMm.x;
const wallHeadOppositeFaceX = intendedWallHeadPlaneX + wallHeadPlacement.outwardNormal.x * wallThicknessMm;
if (Math.abs(wallHeadCentreX - 5060.347) > 0.001) throw new Error("D5-WC wall-head render centre is not on the non-WC side of the source plane.");
if (Math.abs(wallHeadOppositeFaceX - 5020.347) > 0.001 || wallHeadOppositeFaceX >= intendedWallHeadPlaneX) throw new Error("D5-WC wall-head opposite face is not exactly 80 mm outside the WC.");

const preFixWallHeadPlacement = calculateFinishedFacePlacement(d5WC.wallHeadEndpoints, wallThicknessMm, "right");
const preFixWCFirstHitX = intendedWallHeadPlaneX + preFixWallHeadPlacement.outwardNormal.x * wallThicknessMm;
const preFixWallHeadToWall02Mm = d5WCWallHeadToWall02Mm - wallThicknessMm;
if (Math.abs(preFixWCFirstHitX - 5180.347) > 0.001 || Math.abs(preFixWallHeadToWall02Mm - 1582.688) > 0.001) {
  throw new Error("D5-WC pre-fix 80 mm wrong-face diagnosis no longer reproduces deterministically.");
}

const [wallHeadStart, wallHeadEnd] = d5WC.wallHeadEndpoints;
const wallHeadLengthM = horizontalDistance(wallHeadStart, wallHeadEnd) / 1000;
const wallHeadHeightM = (d5WC.ceilingHeightMm - d5WC.openingHeightMm) / 1000;
const wallHeadRaycastMesh = new THREE.Mesh(
  new THREE.BoxGeometry(wallHeadLengthM, wallHeadHeightM, wallThicknessMm / 1000),
  new THREE.MeshBasicMaterial(),
);
wallHeadRaycastMesh.position.set(
  wallHeadCentreX / 1000,
  (d5WC.openingHeightMm + d5WC.ceilingHeightMm) / 2000,
  ((wallHeadStart.y + wallHeadEnd.y) / 2 + wallHeadPlacement.centreOffsetMm.y) / 1000,
);
wallHeadRaycastMesh.rotation.y = -Math.atan2(
  (wallHeadEnd.y - wallHeadStart.y) / 1000,
  (wallHeadEnd.x - wallHeadStart.x) / 1000,
);
wallHeadRaycastMesh.updateMatrixWorld(true);
const raycastElevationMm = 2123.3;
const raycastStationY = (wallHeadStart.y + wallHeadEnd.y) / 2;
const wallHeadRay = new THREE.Raycaster(
  new THREE.Vector3(wallById("WC-WALL-02").endpoints[0].x / 1000, raycastElevationMm / 1000, raycastStationY / 1000),
  new THREE.Vector3(-1, 0, 0),
);
const wallHeadRaycastHit = wallHeadRay.intersectObject(wallHeadRaycastMesh, false)[0];
if (!wallHeadRaycastHit) throw new Error("D5-WC deterministic WC-side wall-head raycast did not hit the generated-equivalent mesh.");
const wallHeadRaycastHitMm = {
  x: wallHeadRaycastHit.point.x * 1000,
  y: wallHeadRaycastHit.point.z * 1000,
  elevation: wallHeadRaycastHit.point.y * 1000,
};
if (Math.abs(wallHeadRaycastHitMm.x - intendedWallHeadPlaneX) > 0.001) throw new Error("D5-WC deterministic raycast still selects the wrong box face.");

if (d5WC.casingTopMm === d5WC.ceilingHeightMm) throw new Error("D5-WC casing incorrectly reaches the ceiling.");
if (d5WC.casingTopMm - d5WC.openingHeightMm !== 90 || d5WC.casingAboveDoorTopMm !== 90) throw new Error("D5-WC casing is not 90 mm above the opening/leaf top datum.");
if (d5WC.observedCasingTopToCeilingMm !== 226) throw new Error("D5-WC direct 226 mm casing-to-ceiling observation was not retained.");
if (d5WC.ceilingHeightMm - d5WC.casingTopMm !== 225 || d5WC.selectedCeilingModelClearanceMm !== 225) throw new Error("D5-WC selected-ceiling closure is no longer the documented 225 mm.");
if (Math.abs(d5WC.observedCasingTopToCeilingMm - (d5WC.ceilingHeightMm - d5WC.casingTopMm)) !== 1) throw new Error("D5-WC one-millimetre vertical field/model closure difference changed.");
if (d5WC.casingProjectionMm !== 30 || d5WC.casingRoomFacingSide !== "left") throw new Error("D5-WC casing projection metadata is incorrect.");
const casingPlacement = calculateInwardProjectionPlacement(d5WC.outerEndpoints, d5WC.casingProjectionMm, d5WC.casingRoomFacingSide);
const casingBackPlaneX = d5WC.outerEndpoints[0].x;
const casingFrontPlaneX = casingBackPlaneX + casingPlacement.inwardNormal.x * d5WC.casingProjectionMm;
if (Math.abs(casingFrontPlaneX - 5130.347) > 0.001) throw new Error("D5-WC casing front is not 30 mm proud into the WC from its source plane.");

for (const id of ["T0", "T1", "T2", "T3"]) {
  const generated = shell.surveyValidation.nodes.find((candidate) => candidate.id === id)?.coordinateMm;
  const promoted = whole.geometry.roomBWCUnchangedMm[id];
  if (!generated || horizontalDistance(generated, promoted) > toleranceMm) throw new Error(`${id} moved from the promoted whole-flat coordinate.`);
}
if (shell.sourceAuthority.promotedGeometrySha256 !== "BF90135506785ABAB61FD79F37616F33F00EB2C6B6CEEDF01CFF1846465B90C0") throw new Error("Promoted whole-flat geometry hash changed.");

const w2Window = shell.windows.find(({ id }) => id === "W2");
const w2UpperInfill = shell.windowWallInfills?.find(({ id }) => id === "W2-C-UPPER-WALL-INFILL");
const w2LowerInfill = shell.windowWallInfills?.find(({ id }) => id === "W2-C-LOWER-WALL-INFILL");
const w2Infills = [w2UpperInfill, w2LowerInfill];
if (!w2Window || w2Infills.some((feature) => !feature)) throw new Error("The explicit W2 upper or lower wall infill is missing.");
if (shell.windowWallHeads?.length) throw new Error("The superseded windowWallHeads collection is still present.");
if (shell.windowWallInfills.some(({ id }) => ["W2-C-UPPER-WALL-STRIP", "W2-C-WALL-HEAD", "W2-HEAD-WALL"].includes(id))) throw new Error("A superseded W2 wall-head/strip feature is still present.");
if (shell.windowWallInfills.filter(({ windowId }) => windowId === "W2").length !== 2) throw new Error("W2 must have exactly one upper and one lower explicit wall infill.");
if (w2Window.sillMm !== 1040 || w2Window.headMm !== 2556 || w2Window.openingHeightMm !== 1516) throw new Error("Protected W2 vertical geometry moved.");
if (w2UpperInfill.bottomMm !== w2Window.headMm || w2UpperInfill.topMm !== roomC.ceilingHeightMm) throw new Error("W2 upper infill does not run exactly from casing top to the Room C ceiling.");
if (w2UpperInfill.modelHeightMm !== 75 || w2UpperInfill.topMm - w2UpperInfill.bottomMm !== 75) throw new Error("W2 generated upper-infill closure changed from 75 mm.");
if (w2UpperInfill.observedHeightMm !== 72 || w2UpperInfill.fieldModelClosureDifferenceMm !== 3) throw new Error("W2 direct 72 mm evidence or its 3 mm frozen-datum closure difference is missing.");
if (w2LowerInfill.bottomMm !== 0 || w2LowerInfill.topMm !== w2Window.sillMm || w2LowerInfill.modelHeightMm !== 1040) throw new Error("W2 lower infill does not run exactly from floor to the protected sill/frame datum.");
if (w2UpperInfill.position !== "upper" || w2LowerInfill.position !== "lower") throw new Error("W2 wall-infill position semantics are incorrect.");
if (w2Infills.some((feature) => feature.classification !== "existing-permanent" || !feature.authoritativeFinishedFaceAligned)) throw new Error("W2 infills are not classified as permanent finished-face surfaces.");
for (const [index, id] of ["W2-CR", "W2-CL"].entries()) {
  if (horizontalDistance(w2Window.endpoints[index], sourcePoints[id]) > toleranceMm) throw new Error(`${id} moved in the W2 window feature.`);
}
for (const [index, id] of ["C1", "C2"].entries()) {
  const generated = shell.surveyValidation.nodes.find((candidate) => candidate.id === id)?.coordinateMm;
  if (!generated || horizontalDistance(generated, sourcePoints[id]) > toleranceMm) throw new Error(`${id} moved from the promoted Room C coordinate.`);
  for (const feature of w2Infills) if (horizontalDistance(feature.endpoints[index], sourcePoints[id]) > toleranceMm) throw new Error(`${id} moved in ${feature.id}.`);
}
for (const feature of w2Infills) {
  if (JSON.stringify(feature.sourceFeatureIds) !== JSON.stringify(["C1", "C2"]) || JSON.stringify(feature.recessedWindowEdgeIds) !== JSON.stringify(["W2-CR", "W2-CL"])) {
    throw new Error(`${feature.id} source topology or protected recessed-window references are incorrect.`);
  }
}
const w2WindowPlaneY = w2Window.endpoints[0].y;
const w2RecessDepthMm = w2WindowPlaneY - sourcePoints.C1.y;
if (Math.abs(w2WindowPlaneY - 164.98) > 0.001 || Math.abs(w2RecessDepthMm - 164.98) > 0.001) throw new Error("W2 recessed-frame depth changed.");
const w2Placements = new Map();
for (const feature of w2Infills) {
  if (Math.abs(feature.depthMm - w2RecessDepthMm) > 0.001) throw new Error(`${feature.id} does not reach the protected W2 frame plane.`);
  const placement = calculateFinishedFacePlacement(feature.endpoints, feature.depthMm, feature.roomFacingSide);
  const sourcePlaneY = feature.endpoints[0].y;
  const renderCentreY = sourcePlaneY + placement.centreOffsetMm.y;
  const backPlaneY = sourcePlaneY + placement.outwardNormal.y * feature.depthMm;
  if (Math.abs(sourcePlaneY) > 0.001 || Math.abs(renderCentreY - 82.49) > 0.001 || Math.abs(backPlaneY - w2WindowPlaneY) > 0.001) {
    throw new Error(`${feature.id} does not align from the Room C finished face to the recessed W2 frame plane.`);
  }
  w2Placements.set(feature.id, { sourcePlaneY, renderCentreY, backPlaneY });
}
const runtimeWindowWallFeatures = resolveWindowWallFeatures(shell);
const runtimeWindowWallGroup = new THREE.Group();
runtimeWindowWallGroup.name = "existing-permanent";
const runtimeWindowWallMeshes = createWindowWallMeshes(shell, shell.renderConventions, new THREE.MeshBasicMaterial());
runtimeWindowWallGroup.add(...runtimeWindowWallMeshes);
runtimeWindowWallGroup.updateMatrixWorld(true);
const w2RuntimeMeshes = runtimeWindowWallMeshes.filter(({ userData }) => userData.windowId === "W2" || ["W2-C-UPPER-WALL-INFILL", "W2-C-LOWER-WALL-INFILL"].includes(userData.featureId));
if (w2RuntimeMeshes.length !== 2) throw new Error(`Expected exactly two runtime W2 wall-infill meshes; found ${w2RuntimeMeshes.length}.`);
const supersededW2Ids = ["W2-SILL-WALL", "W2-HEAD-WALL", "W2-C-WALL-HEAD", "W2-C-UPPER-WALL-STRIP"];
if (runtimeWindowWallMeshes.some((mesh) => supersededW2Ids.includes(mesh.userData.featureId))) throw new Error("A legacy or superseded W2 wall-head/strip runtime mesh is still active.");
const resolvedW2Features = runtimeWindowWallFeatures.filter(({ windowId }) => windowId === "W2");
if (resolvedW2Features.length !== 2 || resolvedW2Features.some(({ rendererPath }) => rendererPath !== "explicit-generated-window-infill")) {
  throw new Error("W2 runtime resolution did not exclusively select the two explicit generated infills.");
}
const runtimeBoundsToleranceM = 1e-6;
const expectedW2Bounds = {
  "W2-C-UPPER-WALL-INFILL": { min: new THREE.Vector3(0.33, 2.556, 0), max: new THREE.Vector3(1.599, 2.631, 0.16498), rayElevationM: 2.6 },
  "W2-C-LOWER-WALL-INFILL": { min: new THREE.Vector3(0.33, 0, 0), max: new THREE.Vector3(1.599, 1.04, 0.16498), rayElevationM: 0.5 },
};
const w2RuntimeResults = {};
for (const mesh of w2RuntimeMeshes) {
  if (mesh.parent?.name !== "existing-permanent" || mesh.geometry.type !== "BoxGeometry") throw new Error(`${mesh.name} runtime parent or geometry type changed.`);
  if (!isMeasurementSurface(mesh)) throw new Error(`${mesh.name} is not an eligible measurement surface.`);
  mesh.geometry.computeBoundingBox();
  const localBounds = mesh.geometry.boundingBox.clone();
  const worldBounds = new THREE.Box3().setFromObject(mesh);
  const expected = expectedW2Bounds[mesh.userData.featureId];
  if (!expected || worldBounds.min.distanceTo(expected.min) > runtimeBoundsToleranceM || worldBounds.max.distanceTo(expected.max) > runtimeBoundsToleranceM) throw new Error(`${mesh.name} runtime bounds do not connect the main wall face to the W2 frame plane.`);
  const ray = new THREE.Raycaster(new THREE.Vector3(0.9645, expected.rayElevationM, -0.5), new THREE.Vector3(0, 0, 1));
  const hit = ray.intersectObject(mesh, false)[0];
  if (!hit || Math.abs(hit.point.z * 1000) > 0.001 || hit.object.userData.featureId !== mesh.userData.featureId) throw new Error(`${mesh.name} Room C-side raycast returned the wrong face or identity.`);
  w2RuntimeResults[mesh.userData.featureId] = {
    positionM: mesh.position.toArray(),
    localBoundsM: { min: localBounds.min.toArray(), max: localBounds.max.toArray() },
    worldBoundsM: { min: worldBounds.min.toArray(), max: worldBounds.max.toArray() },
    roomCSideRaycastHitMm: { x: hit.point.x * 1000, y: hit.point.z * 1000, elevation: hit.point.y * 1000 },
    metadata: mesh.userData,
  };
}
const openingRay = new THREE.Raycaster(new THREE.Vector3(0.9645, 1.8, -0.5), new THREE.Vector3(0, 0, 1));
if (openingRay.intersectObjects(w2RuntimeMeshes, false).length !== 0) throw new Error("W2 wall infill obstructs the protected opening/frame/glazing zone.");

const cp1Cupboard = shell.cupboards.find(({ id }) => id === "CP1");
const cp1Lower = shell.cp1LowerServiceAssembly;
if (!cp1Cupboard || !cp1Lower) throw new Error("CP1 upper cupboard or lower service assembly is missing.");
if (cp1Cupboard.cavityBaseMm !== 1315 || cp1Cupboard.cavityTopMm !== 2576 || cp1Cupboard.topCasingMm !== 30) throw new Error("The established upper CP1 body/casing datums moved.");
const cp1FrontageLengthMm = horizontalDistance(sourcePoints["CP1-FL"], sourcePoints.PO1);
if (Math.abs(cp1FrontageLengthMm - 1550.7) > 0.001 || Math.abs(cp1Lower.frontageLengthMm - cp1FrontageLengthMm) > toleranceMm) throw new Error("CP1-FL to PO1 frontage changed.");
if (cp1Lower.panel.bottomMm !== 0 || cp1Lower.panel.topMm !== 1315 || cp1Lower.panel.depthMm !== 10 || cp1Lower.panel.fragments.length !== 3) throw new Error("CP1 lower enclosure panel dimensions are incorrect.");
const access = cp1Lower.accessDoor;
if (access.assemblyWidthMm !== 722 || Math.abs(horizontalDistance(...access.outerEndpoints) - 722) > toleranceMm || access.bottomMm !== 0 || access.topMm !== 772) throw new Error("CP1 lower access assembly width/height is incorrect.");
if (access.leaf.widthMm !== 560 || Math.abs(horizontalDistance(...access.leaf.endpoints) - 560) > toleranceMm) throw new Error("CP1 lower access leaf is not 560 mm wide.");
if (access.casings.length !== 2 || access.casings.some((casing) => casing.widthMm !== 80 || Math.abs(horizontalDistance(...casing.endpoints) - 80) > toleranceMm)) throw new Error("CP1 lower access side casings are not 80 mm each.");
if (access.topCasingPresent !== false || cp1Lower.panel.fragments.some(({ id }) => id.includes("TOP-CASING"))) throw new Error("A top casing was generated for the CP1 lower access door.");
if (Math.abs(access.sideClearanceMm - 1) > toleranceMm) throw new Error("CP1 access assembly did not retain the one-millimetre leaf clearance on each side.");
const modeledLeftStationMm = horizontalDistance(sourcePoints["CP1-FL"], access.outerEndpoints[0]);
const modeledRightStationMm = horizontalDistance(access.outerEndpoints[1], sourcePoints.PO1);
if (Math.abs(modeledLeftStationMm - 535) > 0.001 || Math.abs(modeledRightStationMm - 293.7) > 0.001) throw new Error("CP1 access-door CP1-FL-controlled placement is incorrect.");
if (Math.abs(access.placement.observedLeftOuterDistanceFromCP1FLMm - 535) > toleranceMm
  || Math.abs(access.placement.observedRightOuterDistanceFromPO1Mm - 243) > toleranceMm
  || Math.abs(access.placement.stationImpliedAssemblyWidthMm - 772.7) > 0.001
  || Math.abs(access.placement.stationClosureResidualMm - 50.7) > 0.001
  || Math.abs(access.placement.rightStationResidualMm - 50.7) > 0.001
  || access.placement.control !== "CP1-FL left-hand station"
  || !access.placement.conflictingRightStationStatus.includes("unresolved local field evidence")) throw new Error("CP1 access-door station conflict is not preserved explicitly.");
if (cp1Lower.lip.bottomMm !== 1265 || cp1Lower.lip.topMm !== 1315 || cp1Lower.lip.projectionMm !== 60 || Math.abs(horizontalDistance(...cp1Lower.lip.endpoints) - cp1FrontageLengthMm) > toleranceMm) throw new Error("CP1 lower lip dimensions or frontage span are incorrect.");
const water = cp1Lower.waterInletReference;
if (water.bottomMm !== 0 || water.topMm !== 150 || Math.abs(water.coordinate.x - 1484.19) > 0.001 || Math.abs(water.coordinate.y + 3720.92) > 0.001 || water.coordinate.x <= access.outerEndpoints[1].x || water.coordinate.x >= sourcePoints.PO1.x) throw new Error("CP1 water-inlet reference moved or is not a 150 mm marker in the right-hand service zone.");
if (cp1Lower.classification !== "existing-permanent" || !cp1Lower.futureDesignNote.includes("possible future alteration or removal")) throw new Error("CP1 lower enclosure existing/future-design semantics are missing.");
const cp1DesignNote = shell.designStageNotes?.find(({ scopeFeatureId }) => scopeFeatureId === cp1Lower.id);
if (!cp1DesignNote || !cp1DesignNote.status.includes("no existing-condition removal")) throw new Error("CP1 lower enclosure design-stage note is missing.");

const cp1RuntimeGroup = createCp1LowerServiceGroup(cp1Lower, {
  panel: new THREE.MeshBasicMaterial(),
  casing: new THREE.MeshBasicMaterial(),
  door: new THREE.MeshBasicMaterial(),
  lip: new THREE.MeshBasicMaterial(),
  service: new THREE.MeshBasicMaterial(),
});
cp1RuntimeGroup.updateMatrixWorld(true);
const cp1RuntimeMeshes = [];
cp1RuntimeGroup.traverse((object) => { if (object.isMesh) cp1RuntimeMeshes.push(object); });
if (cp1RuntimeMeshes.length !== 8 || cp1RuntimeMeshes.some((mesh) => !isMeasurementSurface(mesh))) throw new Error("CP1 lower service runtime mesh count or measurement eligibility is incorrect.");
const cp1RuntimeById = Object.fromEntries(cp1RuntimeMeshes.map((mesh) => [mesh.userData.featureId, mesh]));
for (const id of ["CP1-LOWER-SERVICE-ENCLOSURE-LEFT", "CP1-LOWER-SERVICE-ENCLOSURE-RIGHT", "CP1-LOWER-SERVICE-ENCLOSURE-ABOVE-DOOR", "CP1-LOWER-ACCESS-CASING-L", "CP1-LOWER-ACCESS-CASING-R", "CP1-LOWER-ACCESS-DOOR-LEAF", "CP1-LOWER-LIP", "CP1-WATER-INLET-REFERENCE"]) {
  if (!cp1RuntimeById[id]) throw new Error(`CP1 runtime feature ${id} is missing.`);
}
if (Object.keys(cp1RuntimeById).some((id) => id.includes("TOP-CASING"))) throw new Error("A CP1 lower top-casing runtime mesh exists unexpectedly.");
const cp1FrontRay = (xMm, elevationMm, expectedId, expectedPlanY) => {
  const ray = new THREE.Raycaster(new THREE.Vector3(xMm / 1000, elevationMm / 1000, -3.4), new THREE.Vector3(0, 0, -1));
  const hit = ray.intersectObjects(cp1RuntimeMeshes, false)[0];
  if (!hit || hit.object.userData.featureId !== expectedId || Math.abs(hit.point.z * 1000 - expectedPlanY) > 0.001) throw new Error(`CP1 raycast did not hit ${expectedId} on its intended front face.`);
  return { x: hit.point.x * 1000, y: hit.point.z * 1000, elevation: hit.point.y * 1000 };
};
const cp1PanelRaycastHitMm = cp1FrontRay(300, 500, "CP1-LOWER-SERVICE-ENCLOSURE-LEFT", -3690.92);
const cp1DoorRaycastHitMm = cp1FrontRay(1000, 500, "CP1-LOWER-ACCESS-DOOR-LEAF", -3690.92);
const cp1LipRaycastHitMm = cp1FrontRay(1000, 1290, "CP1-LOWER-LIP", -3630.92);
const pipeBounds = new THREE.Box3().setFromObject(cp1RuntimeById["CP1-WATER-INLET-REFERENCE"]);
if (Math.abs(pipeBounds.min.y) > 1e-6 || Math.abs(pipeBounds.max.y - 0.15) > 1e-6) throw new Error("CP1 water-inlet runtime marker is not 150 mm high from FFL.");

const expectedWCNodeDescriptions = {
  T0: "WC permanent wall endpoint coincident with the WC-side D5 outer casing edge (D5-WCR); casing-layer datum",
  T1: "WC permanent corner joining WC-WALL-01 and WC-WALL-02",
  T2: "WC permanent rear corner joining WC-WALL-02 and WC-WALL-03; rectangularised working-shell position",
  T3: "WC permanent return corner joining WC-WALL-03 to the short wall toward D5-WCL",
};
for (const [id, expectedDescription] of Object.entries(expectedWCNodeDescriptions)) {
  const node = shell.surveyValidation.nodes.find((candidate) => candidate.id === id);
  if (!node || node.description !== expectedDescription) throw new Error(`WC node description ${id} is not explicit and authoritative.`);
}

const roomCFreeChecks = [
  { id: "Wall15-Wall05", beforeMm: 3610.9886319400125, expectedAfterMm: 3691.006710424678, start: { x: 3193, y: -40 }, startFeature: wallById("ROOM-C-WALL-15"), end: { x: 3167.7, y: -3650.9 }, endFeature: wallById("ROOM-C-WALL-05") },
  { id: "Wall05-W2-rendered", beforeMm: 3803.9515309740736, expectedAfterMm: 3843.970994479537, start: { x: 1445.3, y: -3650.9 }, startFeature: wallById("ROOM-C-WALL-05"), end: { x: 1425.5, y: 153 } },
  { id: "partition-Wall10", beforeMm: 2440.95982146368, expectedAfterMm: 2480.985932265883, start: { x: 1712.5, y: -2564.1 }, end: { x: 4152.7, y: -2625 }, endFeature: wallById("ROOM-C-WALL-10") },
  { id: "partition-Wall01", beforeMm: 1513.6890697894332, expectedAfterMm: 1553.6217497720822, start: { x: 1589.2, y: -2584.6 }, end: { x: 77.4, y: -2509 }, endFeature: wallById("ROOM-C-WALL-01") },
  { id: "D2-head-Wall01", beforeMm: 4089.8922540820076, expectedAfterMm: 4169.919633972484, start: { x: 4142.5, y: -952.4 }, startFeature: { endpoints: doorFaceById("D2-C").clearEndpoints }, end: { x: 53.2, y: -882.8 }, endFeature: wallById("ROOM-C-WALL-01") },
  { id: "partition-Wall05", beforeMm: 2162.9020551102167, expectedAfterMm: 2202.900217531426, start: { x: 2348.7, y: -1489.2 }, end: { x: 2276.6, y: -3650.9 }, endFeature: wallById("ROOM-C-WALL-05") },
];
for (const check of roomCFreeChecks) {
  const start = check.startFeature ? projectToInfiniteSegmentLine(check.start, check.startFeature.endpoints) : check.start;
  const end = check.endFeature ? projectToInfiniteSegmentLine(check.end, check.endFeature.endpoints) : check.end;
  check.afterMm = horizontalDistance(start, end);
  if (Math.abs(check.afterMm - check.expectedAfterMm) > 0.001) throw new Error(`Room C finished-face regression ${check.id} failed.`);
}

if (shell.surveyValidation.repositoryMeasurements.some(({ category }) => category !== "repository-field-observation")) throw new Error("Repository measurements are not distinctly classified.");
if ([...shell.walls, ...shell.volumes, ...shell.cupboards].some(({ id }) => id.includes("SOFFIT"))) throw new Error("Room B soffit geometry was generated unexpectedly.");

console.log(JSON.stringify({
  status: "PASS",
  validationNodes: shell.surveyValidation.nodes.length,
  repositoryMeasurements: shell.surveyValidation.repositoryMeasurements.length,
  roomCBoundaryPointsChecked: roomC.points.length,
  cupboardFootprintPointsChecked: shell.cupboards.reduce((sum, cupboard) => sum + cupboard.points.length, 0),
  d2OpeningEndpointsChecked: 2,
  measurementCalculationCases: numericCases.length,
  validationReportFixture: "PASS",
  d2OpeningRightToC0ModelMm: d2ToC0.horizontalDistanceMm,
  d2OpeningRightToC0RealMm: 4221,
  d2OpeningRightToC0DifferenceMm: d2ToC0Comparison.signedDifferenceMm,
  roomFilterCases: roomFilterCases.length,
  measurementModesChecked: Object.keys(modeCases).length,
  pointerConversionCases: 1,
  raycastEligibilityCases: 4,
  mixedSnapVisibilityCases: 1,
  roomCMeasurementOverlaysChecked: Object.keys(roomCMeasurementExpectations).length,
  alignedWallRecordsChecked: alignedWallRecords.length,
  maximumFinishedFacePlaneDeltaMm,
  roomAControlResults: roomAControlResults.map((control) => ({ ...control, residualMm: control.realMm - control.afterMm })),
  d5WCWallHead: {
    sourceClearPlaneX: d5WC.clearEndpoints[0].x,
    correctedPermanentWallPlaneX: d5WC.wallHeadEndpoints[0].x,
    datumShiftMm: d5WCWallHeadDatumShiftMm,
    preFixWCFirstHitX,
    preFixPerpendicularSpanToWCWall02Mm: preFixWallHeadToWall02Mm,
    visualThicknessMm: wallThicknessMm,
    renderCentreX: wallHeadCentreX,
    oppositeFaceX: wallHeadOppositeFaceX,
    deterministicPostFixRaycastHitMm: wallHeadRaycastHitMm,
    perpendicularSpanToWCWall02Mm: d5WCWallHeadToWall02Mm,
    residualAgainst1677Mm: 1677 - d5WCWallHeadToWall02Mm,
    clearEndpointsUnchanged: true,
  },
  d5WCCasing: {
    doorOpeningTopMm: d5WC.openingHeightMm,
    casingTopMm: d5WC.casingTopMm,
    casingAboveDoorTopMm: d5WC.casingTopMm - d5WC.openingHeightMm,
    selectedCeilingMm: d5WC.ceilingHeightMm,
    renderedClearanceToSelectedCeilingMm: d5WC.ceilingHeightMm - d5WC.casingTopMm,
    observedClearanceToCeilingMm: d5WC.observedCasingTopToCeilingMm,
    fieldModelClosureDifferenceMm: d5WC.observedCasingTopToCeilingMm - (d5WC.ceilingHeightMm - d5WC.casingTopMm),
    sourcePlaneX: casingBackPlaneX,
    frontPlaneX: casingFrontPlaneX,
    projectionMm: d5WC.casingProjectionMm,
  },
  w2WallInfills: {
    featureIds: w2Infills.map(({ id }) => id),
    sourceFeatureIds: w2UpperInfill.sourceFeatureIds,
    recessedWindowEdgeIds: w2UpperInfill.recessedWindowEdgeIds,
    roomCCeilingMm: roomC.ceilingHeightMm,
    windowBottomMm: w2Window.sillMm,
    windowTopMm: w2Window.headMm,
    upperVerticalBoundsMm: [w2UpperInfill.bottomMm, w2UpperInfill.topMm],
    lowerVerticalBoundsMm: [w2LowerInfill.bottomMm, w2LowerInfill.topMm],
    generatedUpperHeightMm: w2UpperInfill.modelHeightMm,
    observedUpperHeightMm: w2UpperInfill.observedHeightMm,
    fieldModelClosureDifferenceMm: w2UpperInfill.fieldModelClosureDifferenceMm,
    roomFacingPlaneY: w2Placements.get(w2UpperInfill.id).sourcePlaneY,
    renderCentreY: w2Placements.get(w2UpperInfill.id).renderCentreY,
    recessedFrameBackPlaneY: w2Placements.get(w2UpperInfill.id).backPlaneY,
    recessDepthMm: w2RecessDepthMm,
    runtimeMeshCount: w2RuntimeMeshes.length,
    supersededW2MeshCount: runtimeWindowWallMeshes.filter((mesh) => supersededW2Ids.includes(mesh.userData.featureId)).length,
    runtimeMeshes: w2RuntimeResults,
    protectedOpeningRayMissedInfills: true,
    upperAndLowerReachFramePlane: true,
    protectedWindowDatumsUnchanged: true,
  },
  cp1LowerService: {
    assemblyId: cp1Lower.id,
    panelFeatureId: cp1Lower.panel.id,
    panelSpanMm: cp1Lower.frontageLengthMm,
    panelVerticalBoundsMm: [cp1Lower.panel.bottomMm, cp1Lower.panel.topMm],
    panelDepthMm: cp1Lower.panel.depthMm,
    accessDoorFeatureId: access.id,
    accessOuterEndpoints: access.outerEndpoints,
    accessAssemblyWidthMm: access.assemblyWidthMm,
    accessVerticalBoundsMm: [access.bottomMm, access.topMm],
    leafWidthMm: access.leaf.widthMm,
    casingWidthsMm: access.casings.map(({ widthMm }) => widthMm),
    topCasingPresent: access.topCasingPresent,
    cp1FLToObservedLeftStationMm: access.placement.observedLeftOuterDistanceFromCP1FLMm,
    cp1FLToModeledLeftStationMm: modeledLeftStationMm,
    po1ToObservedRightStationMm: access.placement.observedRightOuterDistanceFromPO1Mm,
    po1ToModeledRightStationMm: modeledRightStationMm,
    stationImpliedAssemblyWidthMm: access.placement.stationImpliedAssemblyWidthMm,
    stationClosureResidualMm: access.placement.stationClosureResidualMm,
    rightStationResidualMm: access.placement.rightStationResidualMm,
    placementControl: access.placement.control,
    lipFeatureId: cp1Lower.lip.id,
    lipVerticalBoundsMm: [cp1Lower.lip.bottomMm, cp1Lower.lip.topMm],
    lipProjectionMm: cp1Lower.lip.projectionMm,
    waterInletReference: water,
    runtimeMeshCount: cp1RuntimeMeshes.length,
    runtimeRaycastHitsMm: { panel: cp1PanelRaycastHitMm, door: cp1DoorRaycastHitMm, lip: cp1LipRaycastHitMm },
    waterInletRuntimeBoundsM: { min: pipeBounds.min.toArray(), max: pipeBounds.max.toArray() },
    upperCupboardDatumsUnchanged: true,
    promotedCoordinatesUnchanged: true,
    futureDesignNoteRecorded: true,
  },
  explicitWCNodeDescriptionsChecked: Object.keys(expectedWCNodeDescriptions),
  roomCFreeChecks: roomCFreeChecks.map(({ id, beforeMm, afterMm }) => ({ id, beforeMm, afterMm })),
  maximumGeometryDeltaMm: Math.max(maximumNodeDeltaMm, shell.surveyValidation.geometryValidation.maximumActiveLocalTransformDeltaMm),
}, null, 2));

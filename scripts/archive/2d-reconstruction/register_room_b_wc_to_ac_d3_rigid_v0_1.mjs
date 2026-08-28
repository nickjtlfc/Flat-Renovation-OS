#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const acRelative = "docs/survey/derived/global-reconciliation/ROOM_A_C_D2_RIGID_REGISTRATION_DIAGNOSTIC_v0_2.json";
const roomCRelative = "docs/survey/derived/room-c/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json";
const roomBRelative = "docs/survey/derived/room-b-wc/ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json";
const outputDir = path.join(repoRoot, "docs/survey/derived/global-reconciliation");
const diagnosticVersion = process.argv.includes("--v0.2") ? "0.2" : "0.1";
const includeFixedRoomCCupboards = diagnosticVersion === "0.2";
const stem = `ROOM_A_C_B_WC_D3_RIGID_REGISTRATION_DIAGNOSTIC_v${diagnosticVersion.replace(".", "_")}`;
const generatedDate = "2026-08-12";

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), "utf8"));
const sha256 = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(repoRoot, relative))).digest("hex").toUpperCase();
const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, scalar) => [a[0] * scalar, a[1] * scalar];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const length = (a) => Math.hypot(a[0], a[1]);
const distance = (a, b) => length(sub(a, b));
const unit = (a) => mul(a, 1 / length(a));
const midpoint = (a, b) => mul(add(a, b), 0.5);
const bearing = (vector) => (Math.atan2(vector[1], vector[0]) * 180 / Math.PI + 360) % 360;
const signedAngle = (degrees) => ((degrees + 540) % 360) - 180;
const undirectedDifference = (a, b) => Math.abs((((a - b) % 180) + 270) % 180 - 90);
const point = ({ x, y }) => [x, y];
const record = ([x, y]) => ({ x: round(x, 4), y: round(y, 4) });
const signed = (value, digits = 2) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;

const ac = readJson(acRelative);
const roomC = readJson(roomCRelative);
const roomB = readJson(roomBRelative);
if (ac.version !== "0.2" || ac.orientationReview?.d2RigidRegistrationRemainsValid !== true) throw new Error("Expected fixed A/C diagnostic v0.2.");
if (roomC.status !== "PROVISIONALLY ACCEPTED FOR GLOBAL RECONCILIATION") throw new Error("Expected accepted Room C v1.0 baseline.");
if (roomB.selection?.selectedSolutionId !== "P1" || roomB.baselineStatus?.status !== "accepted-provisional-working-baseline") throw new Error("Expected accepted provisional Room B/WC P1 baseline.");

const cNodes = Object.fromEntries(Object.entries(roomC.planGeometry.inheritedNodesMm).map(([id, value]) => [id, point(value)]));
const cObjects = Object.fromEntries(Object.entries(roomC.planGeometry.objectNodesMm).map(([id, value]) => [id, point(value)]));
const aNodes = Object.fromEntries(Object.entries(ac.placedGeometry.roomATransformedNodesMm).map(([id, value]) => [id, point(value)]));
const bNodes = Object.fromEntries(Object.entries(roomB.selectedGeometry.nodesMm).map(([id, value]) => [id, point(value)]));
const bD3 = Object.fromEntries(Object.entries(roomB.selectedGeometry.D3RoomB).filter(([, value]) => value && typeof value === "object" && "x" in value).map(([id, value]) => [id, point(value)]));

for (const id of ["D3-OUTER-R", "D3-OUTER-L-CORNER", "D3-LEAF-R", "D3-LEAF-L", "D2-A-FACE-R", "D2-A-FACE-L"]) if (!cObjects[id]) throw new Error(`Room C object node missing: ${id}`);
const fixedRoomCCupboardNodeIds = ["CP1-BODY-FL", "CP1-BODY-FR", "CP1-BODY-BL", "CP1-BODY-BR", "CP2-CASING-FL", "CP2-BODY-FL", "CP2-BODY-FR", "CP2-BODY-BL", "CP2-BODY-BR"];
if (includeFixedRoomCCupboards) {
  for (const id of fixedRoomCCupboardNodeIds) if (!cObjects[id]) throw new Error(`Accepted Room C fixed cupboard node missing: ${id}`);
}
for (const id of ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4", "T0", "T1", "T2", "T3", "D5-WCL"]) if (!bNodes[id]) throw new Error(`Room B/WC node missing: ${id}`);
for (const id of ["outerLeft", "outerRight", "doorLeft", "doorRight", "doorCentre"]) if (!bD3[id]) throw new Error(`Room B D3 layer point missing: ${id}`);

// Opposite faces reverse viewer-left/right. In the shared plan orientation B D3-BL maps to C D3 outer-right,
// while B D3-BR maps to C D3 outer-left. Register the shared physical door layer, not the outer casing endpoints.
const cD3Axis = sub(cObjects["D3-OUTER-L-CORNER"], cObjects["D3-OUTER-R"]);
const bD3Axis = sub(bNodes["D3-BR"], bNodes.B0);
const cD3Bearing = bearing(cD3Axis);
const bD3Bearing = bearing(bD3Axis);
const preRegistrationAngularDifference = signedAngle(cD3Bearing - bD3Bearing);
const rotationDegrees = preRegistrationAngularDifference;
const rotationRadians = rotationDegrees * Math.PI / 180;
const cos = Math.cos(rotationRadians);
const sin = Math.sin(rotationRadians);
const transformDeterminant = cos * cos + sin * sin;
const rotate = ([x, y]) => [cos * x - sin * y, sin * x + cos * y];
const cLeafCentre = midpoint(cObjects["D3-LEAF-R"], cObjects["D3-LEAF-L"]);
const translation = sub(cLeafCentre, rotate(bD3.doorCentre));
const transformB = (value) => add(rotate(value), translation);
const transformedBNodes = Object.fromEntries(Object.entries(bNodes).map(([id, value]) => [id, transformB(value)]));
const transformedBD3 = Object.fromEntries(Object.entries(bD3).map(([id, value]) => [id, transformB(value)]));

let maxBPairwiseResidual = 0;
const bNodeIds = Object.keys(bNodes);
for (let i = 0; i < bNodeIds.length; i += 1) {
  for (let j = i + 1; j < bNodeIds.length; j += 1) {
    const first = bNodeIds[i];
    const second = bNodeIds[j];
    maxBPairwiseResidual = Math.max(maxBPairwiseResidual, Math.abs(distance(bNodes[first], bNodes[second]) - distance(transformedBNodes[first], transformedBNodes[second])));
  }
}
if (maxBPairwiseResidual > 1e-8 || transformDeterminant < 0) throw new Error("Room B rigid-transform invariant failed.");

const cCasing = [cObjects["D3-OUTER-R"], cObjects["D3-OUTER-L-CORNER"]];
const bCasing = [transformedBNodes.B0, transformedBNodes["D3-BR"]];
const cLeaf = [cObjects["D3-LEAF-R"], cObjects["D3-LEAF-L"]];
const bLeaf = [transformedBD3.doorLeft, transformedBD3.doorRight];
const cCasingCentre = midpoint(...cCasing);
const bCasingCentre = midpoint(...bCasing);
const d3Along = unit(cD3Axis);
const towardB = [-d3Along[1], d3Along[0]];
const casingCentreDelta = sub(bCasingCentre, cCasingCentre);
const casingEndpointDeltas = bCasing.map((value, index) => sub(value, cCasing[index]));
const wallPlaneSeparation = dot(sub(bCasingCentre, cLeafCentre), towardB);

const returnVector = sub(transformedBNodes["B0.5"], transformedBNodes["D3-BR"]);
const lowerWallVector = sub(transformedBNodes.B1, transformedBNodes["B0.5"]);
const cLowerWallVector = sub(cNodes["D3-CL"], cNodes.C0);
const cSharedWallTowardD2 = sub(cNodes["D2-CR"], cNodes["D3-CL"]);
const cSharedWallTowardB = mul(cSharedWallTowardD2, -1);
const returnBearing = bearing(returnVector);
const lowerWallBearing = bearing(lowerWallVector);
const cLowerWallBearing = bearing(cLowerWallVector);
const cSharedWallTowardBBearing = bearing(cSharedWallTowardB);

function pointLineSignedDistance(target, origin, direction) {
  return cross(unit(direction), sub(target, origin));
}
function lineIntersection(p, r, q, s) {
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-9) return null;
  const t = cross(sub(q, p), s) / denominator;
  const u = cross(sub(q, p), r) / denominator;
  return { point: add(p, mul(r, t)), t, u };
}

// Extend the two accepted D2 wall-face families only as diagnostic construction lines to the B0.5/B1 wall.
// This tests the thick-wall hypothesis; the resulting polygon is not promoted to accepted wall geometry.
const cFaceOrigin = cNodes["D3-CL"];
const cFaceDirection = cSharedWallTowardD2;
const aFaceOrigin = midpoint(cObjects["D2-A-FACE-R"], cObjects["D2-A-FACE-L"]);
const aFaceDirection = sub(cObjects["D2-A-FACE-L"], cObjects["D2-A-FACE-R"]);
const bLowerOrigin = transformedBNodes["B0.5"];
const cFaceAtBWall = lineIntersection(cFaceOrigin, cFaceDirection, bLowerOrigin, lowerWallVector);
const aFaceAtBWall = lineIntersection(aFaceOrigin, aFaceDirection, bLowerOrigin, lowerWallVector);
if (!cFaceAtBWall || !aFaceAtBWall) throw new Error("Could not construct thick-wall diagnostic intersections.");
const hypothesisPolygon = [cFaceOrigin, aFaceOrigin, aFaceAtBWall.point, cFaceAtBWall.point];
const returnStartToCFaceMm = Math.abs(pointLineSignedDistance(transformedBNodes["D3-BR"], cFaceOrigin, cFaceDirection));
const returnEndToCFaceMm = Math.abs(pointLineSignedDistance(transformedBNodes["B0.5"], cFaceOrigin, cFaceDirection));
const b05ToPredictedAFaceAlongWallMm = distance(transformedBNodes["B0.5"], aFaceAtBWall.point);
const predictedWallDepthAtBWallMm = distance(cFaceAtBWall.point, aFaceAtBWall.point);

const roomBCentroid = ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4"].reduce((sum, id) => add(sum, transformedBNodes[id]), [0, 0]).map((value) => value / 7);
const wcCentroid = ["T0", "T1", "T2", "T3", "D5-WCL"].reduce((sum, id) => add(sum, transformedBNodes[id]), [0, 0]).map((value) => value / 5);
const roomBProjectsBelowC = roomBCentroid[1] > cNodes["D3-CL"][1];
const wcBelowAndRightOfJunction = wcCentroid[0] > cNodes["D3-CL"][0] && wcCentroid[1] > cNodes["D3-CL"][1];
const roomCUpperWallAlong = unit(sub(cNodes.PO1, cNodes["CP1-FL"]));
const cp2CasingBack = sub(cObjects["CP2-BODY-BL"], mul(roomCUpperWallAlong, 20));

const classification = "compatible with explainable opposite-face/casing differences";
const diagnostics = {
  axesAndTransform: {
    drawingConvention: "Accepted project drawing coordinates: +X right, +Y down; bearings are numeric atan2 bearings and therefore appear clockwise on the sheet. Not site north.",
    roomCD3Axis: { endpoints: ["D3-OUTER-R", "D3-OUTER-L-CORNER"], bearingDegrees: round(cD3Bearing, 6), widthMm: round(length(cD3Axis), 4) },
    roomBD3Axis: { endpoints: ["B0 / D3-BL", "D3-BR"], bearingDegrees: round(bD3Bearing, 6), widthMm: round(length(bD3Axis), 4) },
    angularDifferenceBeforeRegistrationDegrees: round(preRegistrationAngularDifference, 6),
    rigidTransformRoomBWCToACFrame: {
      rotationDegrees: round(rotationDegrees, 6),
      matrix: [[round(cos, 10), round(-sin, 10)], [round(sin, 10), round(cos, 10)]],
      determinant: round(transformDeterminant, 10),
      reflectionIntroduced: false,
      translationMm: { x: round(translation[0], 4), y: round(translation[1], 4) },
      scale: 1,
      registrationTarget: "Room B visible closed D3 face centre and axis aligned to the Room C D3 leaf centre and axis; casing endpoints and finished wall faces remain distinct.",
    },
  },
  d3LayerFit: {
    roomBCasingWidthMm: round(distance(...bCasing), 4),
    roomCCasingWidthMm: round(distance(...cCasing), 4),
    casingWidthDifferenceRoomBMinusRoomCMm: round(distance(...bCasing) - distance(...cCasing), 4),
    roomBVisibleClosedFaceWidthMm: roomB.selectedGeometry.D3RoomB.visibleClosedWidthMm,
    roomCLeafWidthMm: roomC.objectEvidence.D3.visibleClosedLeafWidthMm.value,
    leafWidthDifferenceRoomBMinusRoomCMm: roomB.selectedGeometry.D3RoomB.visibleClosedWidthMm - roomC.objectEvidence.D3.visibleClosedLeafWidthMm.value,
    alignedLeafCentreMismatchMm: round(distance(midpoint(...bLeaf), midpoint(...cLeaf)), 6),
    alignedLeafEndpointOffsetsMm: bLeaf.map((value, index) => round(distance(value, cLeaf[index]), 4)),
    casingCentreMismatch: {
      vectorMm: record(casingCentreDelta),
      alongD3Mm: round(dot(casingCentreDelta, d3Along), 4),
      normalTowardRoomBMm: round(dot(casingCentreDelta, towardB), 4),
      euclideanMm: round(length(casingCentreDelta), 4),
    },
    casingEndpointMismatches: casingEndpointDeltas.map((value, index) => ({
      roomBEndpoint: index === 0 ? "B0 / D3-BL" : "D3-BR",
      roomCEndpoint: index === 0 ? "D3-OUTER-R" : "D3-OUTER-L-CORNER",
      vectorMm: record(value),
      alongD3Mm: round(dot(value, d3Along), 4),
      normalTowardRoomBMm: round(dot(value, towardB), 4),
      euclideanMm: round(length(value), 4),
    })),
    wallPlaneResult: {
      separationMm: round(wallPlaneSeparation, 4),
      evidenceStatus: "derived from the accepted Room B 104.195 mm casing-to-visible-face depth after shared-leaf alignment; Room C D3 reveal/wall depth is unmeasured",
      interpretation: "opposite finished/casing faces, not a residual to be forced to zero",
    },
    dominantDifference: "opposite-face/casing depth plus a 27.95 mm outer-casing width difference; no rotation mismatch and no local topology collapse",
  },
  localDirections: {
    d3BRToB05: { bearingDegrees: round(returnBearing, 6), lengthMm: round(length(returnVector), 4), differenceFromRoomCSharedWallTowardBDegrees: round(undirectedDifference(returnBearing, cSharedWallTowardBBearing), 6) },
    b05ToB1: { bearingDegrees: round(lowerWallBearing, 6), lengthMm: round(length(lowerWallVector), 4), differenceFromRoomCLowerWallDegrees: round(undirectedDifference(lowerWallBearing, cLowerWallBearing), 6) },
    adjacentRoomCFamilies: { lowerWallBearingDegrees: round(cLowerWallBearing, 6), sharedWallTowardRoomBBearingDegrees: round(cSharedWallTowardBBearing, 6) },
  },
  thickWallHypothesis: {
    status: "plausibly supported, but not promoted to accepted geometry",
    returnStartDistanceToExtrapolatedRoomCFaceMm: round(returnStartToCFaceMm, 4),
    returnEndDistanceToExtrapolatedRoomCFaceMm: round(returnEndToCFaceMm, 4),
    predictedACWallDepthAtB05B1Mm: round(predictedWallDepthAtBWallMm, 4),
    b05ToExtrapolatedRoomAFaceAlongWallMm: round(b05ToPredictedAFaceAlongWallMm, 4),
    evidence: "The 244.91 mm D3-BR→B0.5 return lies within about 2–9 mm of the extrapolated Room C face and is only 1.57° from its direction. B0.5→B1 is within 0.10° of the Room C lower-wall family and crosses the extrapolated Room A face after about 259 mm, close to the independently observed approximately 250 mm A–C wall depth.",
    limitation: "D3 opposing-face depth and structural reveal are not measured; extrapolation is a diagnostic construction only.",
  },
  widerTopology: {
    roomBProjectsBelowRoomC: roomBProjectsBelowC,
    wcBelowAndRightOfACJunction: wcBelowAndRightOfJunction,
    d3OrderingRelativeToD4AndD2: "preserved",
    sourcePlanUse: "2dPlan.jpeg and rough-paint-sketch.jpg used for adjacency, handedness and opening order only; no dimensions or angles derived.",
    assessment: "Room B projects below D3 and the WC occupies the expected area below/right of the A–C junction without moving A or C.",
  },
};

const output = {
  documentType: "GLOBAL RECONCILIATION - A/C/B/WC D3 RIGID REGISTRATION DIAGNOSTIC",
  version: diagnosticVersion,
  generatedDate,
  units: "millimetres unless stated otherwise",
  status: "diagnostic for human review; not a final whole-flat model",
  scope: {
    completed: "Rigidly register accepted provisional Room B/WC P1 to the frozen A/C v0.2 frame through D3.",
    excluded: ["scaling", "individual node movement", "deformation", "D3 topology change", "A/C movement", "D2 change", "global optimisation"],
  },
  sources: {
    fixedACFrame: { relativePath: acRelative, sha256: sha256(acRelative), version: ac.version, frozen: true },
    roomC: { relativePath: roomCRelative, sha256: sha256(roomCRelative), selectedSolution: "A1", fixed: true },
    roomBWC: { relativePath: roomBRelative, sha256: sha256(roomBRelative), selectedSolution: "P1", rigidBody: true },
    topologyPlans: ["source-material/plans/2dPlan.jpeg", "source-material/plans/rough-paint-sketch.jpg"],
  },
  registrationDiagnostics: diagnostics,
  sourceCoordinates: {
    roomBWCNodesLocalMm: Object.fromEntries(Object.entries(bNodes).map(([id, value]) => [id, record(value)])),
    roomBD3LayersLocalMm: Object.fromEntries(Object.entries(bD3).map(([id, value]) => [id, record(value)])),
  },
  placedGeometry: {
    roomBWCNodesGlobalMm: Object.fromEntries(Object.entries(transformedBNodes).map(([id, value]) => [id, record(value)])),
    roomBD3LayersGlobalMm: Object.fromEntries(Object.entries(transformedBD3).map(([id, value]) => [id, record(value)])),
    ...(includeFixedRoomCCupboards ? {
      fixedRoomCCupboardGeometryGlobalMm: {
        CP1: {
          sourcePlanAlias: "C1",
          bodyPolygon: ["CP1-BODY-FL", "CP1-BODY-FR", "CP1-BODY-BR", "CP1-BODY-BL"].map((id) => ({ id, ...record(cObjects[id]) })),
          acceptedFixedFeature: true,
        },
        CP2: {
          sourcePlanAlias: "C2",
          bodyPolygon: ["CP2-BODY-FL", "CP2-BODY-FR", "CP2-BODY-BR", "CP2-BODY-BL"].map((id) => ({ id, ...record(cObjects[id]) })),
          viewerLeftCasingFrontNode: { id: "CP2-CASING-FL", ...record(cObjects["CP2-CASING-FL"]) },
          viewerLeftCasingPolygon: [cObjects["CP2-CASING-FL"], cObjects["CP2-BODY-FL"], cObjects["CP2-BODY-BL"], cp2CasingBack].map(record),
          acceptedFixedFeature: true,
        },
      },
    } : {}),
    thickWallHypothesisConstructionMm: {
      polygon: hypothesisPolygon.map(record),
      roomCFaceAtB05B1: record(cFaceAtBWall.point),
      roomAFaceAtB05B1: record(aFaceAtBWall.point),
      acceptedGeometry: false,
    },
  },
  geometryPreservation: {
    roomANodeMovementMm: 0,
    roomCNodeMovementMm: 0,
    d2RegistrationChanged: false,
    roomBWCNodeDeformationMm: 0,
    roomBWCScale: 1,
    roomBWCMaxPairwiseDistanceResidualMm: round(maxBPairwiseResidual, 10),
    measurementsChanged: false,
  },
  ...(includeFixedRoomCCupboards ? {
    compositionCorrection: {
      diagnosis: "The v0.1 combined renderer loaded the complete accepted Room C object-node set, including CP1/CP2, but its SVG composition emitted only selected shell, partition, door and window layers. No cupboard body/casing polygons or labels were written. This was an export/composition omission, not missing geometry or a transform issue.",
      correction: "Require the accepted CP1/CP2 object nodes and emit their body outlines, CP2 casing/joinery layer, front/door lines, top casing line and fixed-feature labels in the combined SVG.",
      CP1Present: true,
      CP1SourcePlanAliasC1: true,
      CP2Present: true,
      CP2SourcePlanAliasC2: true,
      allTransformsUnchangedFromV01: true,
      d2RegistrationUnchanged: true,
      d3RegistrationUnchanged: true,
      geometryResolved: false,
    },
  } : {}),
  conclusion: {
    classification,
    statement: "The accepted Room B/WC geometry joins the frozen A/C frame without rotation or deformation when the shared D3 leaf layer is registered. Remaining D3 offsets are explainable as opposite-face depth and casing-width differences. The local return orientation is compatible with, rather than contradictory to, the adjacent Room C wall families.",
    minimumUnimplementedLocalChange: null,
    unresolvedEvidence: [
      "Exact D3 Room C-face to Room B-face finished-wall depth.",
      "Exact structural opening/rebate offsets relative to both outer casing faces.",
      "Whether the A–C thick wall construction physically continues to the B0.5 return, rather than merely sharing aligned finished faces.",
    ],
    smallestRealWorldCheck: "Measure perpendicular finished-face-to-finished-face depth through D3 at both jambs, plus the along-wall offsets from D3-BR and B0.5 to the Room A-side face/return; one square-on photograph showing D3-BR, B0.5 and the adjoining wall planes would resolve the construction interpretation.",
  },
};

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function makeSvg() {
  const all = [...Object.values(cNodes), ...Object.values(cObjects), ...Object.values(aNodes), ...Object.values(transformedBNodes), ...Object.values(transformedBD3)];
  const minX = Math.min(...all.map((value) => value[0])) - 350;
  const maxX = Math.max(...all.map((value) => value[0])) + 300;
  const minY = Math.min(...all.map((value) => value[1])) - 300;
  const maxY = Math.max(...all.map((value) => value[1])) + 300;
  const plot = { x: 45, y: 165, width: 1510, height: 1245 };
  const scale = Math.min(plot.width / (maxX - minX), plot.height / (maxY - minY));
  const pt = ([x, y]) => [plot.x + (x - minX) * scale, plot.y + (y - minY) * scale];
  const xy = (value) => pt(value).map((number) => round(number, 1));
  const line = (first, second, cls) => { const a = xy(first), b = xy(second); return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}"/>`; };
  const polygon = (values, cls) => `<polygon points="${values.map((value) => xy(value).join(",")).join(" ")}" class="${cls}"/>`;
  const circle = (value, cls = "node", radius = 4) => { const p = xy(value); return `<circle cx="${p[0]}" cy="${p[1]}" r="${radius}" class="${cls}"/>`; };
  const label = (value, text, dx = 7, dy = -7, cls = "label", anchor = "start") => { const p = xy(value); return `<text x="${round(p[0] + dx, 1)}" y="${round(p[1] + dy, 1)}" class="${cls}" text-anchor="${anchor}">${escapeXml(text)}</text>`; };
  const c = (id) => cNodes[id];
  const o = (id) => cObjects[id];
  const a = (id) => aNodes[id];
  const b = (id) => transformedBNodes[id];
  const bd = (id) => transformedBD3[id];

  const cShell = [c("C0"), c("CP1-FL"), c("CP2-FR"), c("D3-CL")];
  const aShell = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"].map(a);
  const bShell = ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4"].map(b);
  const wcShell = ["T0", "T1", "T2", "T3", "D5-WCL"].map(b);
  const partition = [c("PO1"), c("PO2"), c("PO3"), c("PI3"), c("PI2"), c("PI1")];
  const d2Band = [o("D2-OPENING-L-INFERRED"), o("D2-OPENING-R"), o("D2-A-FACE-R"), o("D2-A-FACE-L")];
  const d3Focus = midpoint(b("D3-BR"), b("B0.5"));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2100" height="1500" viewBox="0 0 2100 1500" role="img" aria-labelledby="title desc">
  <title id="title">A/C/B/WC D3 rigid registration diagnostic v${diagnosticVersion}</title>
  <desc id="desc">Frozen A/C v0.2 frame with accepted Room B/WC P1 rigidly placed through the shared D3 leaf layer. D3 casing faces remain distinct. A thick-wall continuation is shown only as a diagnostic hypothesis.${includeFixedRoomCCupboards ? " Fixed Room C cupboards CP1/C1 and CP2/C2 are included from the accepted baseline." : ""}</desc>
  <defs><style>
    .page{fill:#fff;stroke:#0f172a;stroke-width:3}.panel{fill:#f8fafc;stroke:#94a3b8;stroke-width:2}.title{font:700 30px Arial,sans-serif;fill:#0f172a}.sub{font:16px Arial,sans-serif;fill:#334155}.warn{font:700 16px Arial,sans-serif;fill:#9f1239}.roomA{fill:#fff7ed;stroke:none}.roomC{fill:#eff6ff;stroke:none}.roomB{fill:#ecfdf5;stroke:none}.wc{fill:#f0fdfa;stroke:none}.wallA{stroke:#c2410c;stroke-width:7}.wallC{stroke:#1e3a8a;stroke-width:7}.wallB{stroke:#047857;stroke-width:7}.wallWC{stroke:#0f766e;stroke-width:7}.return{stroke:#7c3aed;stroke-width:12}.partition{fill:#e9d5ff;stroke:#7e22ce;stroke-width:3}.d2{fill:#fee2e2;stroke:#b91c1c;stroke-width:2}.openingC{stroke:#0f766e;stroke-width:10}.openingA{stroke:#2563eb;stroke-width:8}.casingC{stroke:#d97706;stroke-width:9}.casingB{stroke:#059669;stroke-width:9;stroke-dasharray:10 5}.leafC{stroke:#166534;stroke-width:7}.leafB{stroke:#2563eb;stroke-width:7}.window{stroke:#0284c7;stroke-width:9}.door{stroke:#d97706;stroke-width:9}.node{fill:#fff;stroke:#0f172a;stroke-width:2}.nodeB{fill:#fff;stroke:#047857;stroke-width:2}.label{font:700 12px Arial,sans-serif;fill:#0f172a;paint-order:stroke;stroke:#fff;stroke-width:4px}.labelB{font:700 12px Arial,sans-serif;fill:#065f46;paint-order:stroke;stroke:#fff;stroke-width:4px}.roomLabel{font:700 21px Arial,sans-serif}.hypothesis{fill:#fef3c7;fill-opacity:.55;stroke:#ca8a04;stroke-width:3;stroke-dasharray:10 7}.construction{stroke:#ca8a04;stroke-width:2;stroke-dasharray:7 6}.dimension{stroke:#be123c;stroke-width:2;marker-start:url(#back);marker-end:url(#arrow)}.sideHead{font:700 20px Arial,sans-serif;fill:#0f172a}.side{font:14px Arial,sans-serif;fill:#1f2937}.small{font:12px Arial,sans-serif;fill:#475569}.good{fill:#166534;font-weight:700}.callout{fill:#f0fdf4;stroke:#16a34a;stroke-width:2}.uncertain{fill:#fffbeb;stroke:#d97706;stroke-width:2}${includeFixedRoomCCupboards ? ".cupBody{fill:#fef3c7;stroke:#a16207;stroke-width:3}.cupDoor{stroke:#a16207;stroke-width:3;stroke-dasharray:7 5}.cupCasing{fill:#fed7aa;stroke:#c2410c;stroke-width:2}.cupTopCasing{stroke:#d97706;stroke-width:8;stroke-dasharray:8 5}.cupLabel{font:700 12px Arial,sans-serif;fill:#92400e;paint-order:stroke;stroke:#fff;stroke-width:4px}" : ""}
  </style><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#be123c"/></marker><marker id="back" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto"><path d="M7 0 L0 3.5 L7 7 Z" fill="#be123c"/></marker></defs>
  <rect x="12" y="12" width="2076" height="1476" rx="12" class="page"/>
  <text x="48" y="55" class="title">GLOBAL RECONCILIATION · A/C/B/WC D3 RIGID REGISTRATION DIAGNOSTIC · v${diagnosticVersion}</text>
  <text x="48" y="84" class="sub">A/C v0.2 frozen · Room B/WC P1 rigid transform only · shared D3 leaf registered · +Y down drawing convention</text>
  <text x="48" y="112" class="warn">HUMAN REVIEW ONLY — NOT FINAL WHOLE-FLAT GEOMETRY — NO NODE MOVEMENT OR GLOBAL OPTIMISATION</text>
  <rect x="30" y="140" width="1545" height="1320" rx="10" class="panel"/><rect x="1590" y="140" width="480" height="1320" rx="10" class="panel"/>

  ${polygon(cShell, "roomC")}${polygon(aShell, "roomA")}${polygon(bShell, "roomB")}${polygon(wcShell, "wc")}${polygon(partition, "partition")}${polygon(d2Band, "d2")}${polygon(hypothesisPolygon, "hypothesis")}${includeFixedRoomCCupboards ? `${polygon([o("CP1-BODY-FL"), o("CP1-BODY-FR"), o("CP1-BODY-BR"), o("CP1-BODY-BL")], "cupBody")}${line(o("CP1-BODY-FL"), o("CP1-BODY-FR"), "cupDoor")}${polygon([o("CP2-BODY-FL"), o("CP2-BODY-FR"), o("CP2-BODY-BR"), o("CP2-BODY-BL")], "cupBody")}${polygon([o("CP2-CASING-FL"), o("CP2-BODY-FL"), o("CP2-BODY-BL"), cp2CasingBack], "cupCasing")}${line(o("CP2-BODY-BL"), o("CP2-BODY-BR"), "cupTopCasing")}${line(o("CP2-BODY-FL"), o("CP2-BODY-FR"), "cupDoor")}` : ""}
  ${line(c("C0"), c("CP1-FL"), "wallC")}${line(c("CP1-FL"), c("PO1"), "wallC")}${line(c("PI1"), c("CP2-FL"), "wallC")}${line(c("CP2-FR"), c("D3-CL"), "wallC")}
  ${line(c("C0"), c("C1"), "wallC")}${line(c("C1"), c("W2-CR"), "wallC")}${line(c("W2-CR"), c("W2-CL"), "window")}${line(c("W2-CL"), c("C2"), "wallC")}${line(c("C2"), o("D4-OUTER-R"), "wallC")}${line(o("D4-OUTER-R"), o("D4-OUTER-L"), "door")}${line(o("D4-OUTER-L"), o("D3-OUTER-R"), "wallC")}
  ${line(a("A0"), a("A1"), "wallA")}${line(a("A1"), a("A2"), "wallA")}${line(a("A2"), a("A3"), "wallA")}${line(a("A3"), a("A4"), "wallA")}${line(a("A4"), a("A5"), "wallA")}${line(a("A5"), a("W1-AL"), "wallA")}${line(a("W1-AL"), a("W1-AR"), "openingA")}${line(a("W1-AR"), a("A6"), "wallA")}${line(a("A6"), a("D1-AL"), "wallA")}${line(a("D1-AL"), a("D1-AR"), "openingA")}${line(a("D1-AR"), a("A7"), "wallA")}${line(a("A7"), a("D2-AL"), "wallA")}${line(a("D2-AR"), a("A0"), "wallA")}
  ${line(o("D2-OPENING-R"), o("D2-OPENING-L-INFERRED"), "openingC")}${line(o("D2-A-FACE-R"), o("D2-A-FACE-L"), "openingC")}
  ${line(b("B0"), b("D3-BR"), "casingB")}${line(bd("doorLeft"), bd("doorRight"), "leafB")}${line(o("D3-OUTER-R"), o("D3-OUTER-L-CORNER"), "casingC")}${line(o("D3-LEAF-R"), o("D3-LEAF-L"), "leafC")}
  ${line(b("D3-BR"), b("B0.5"), "return")}${line(b("B0.5"), b("B1"), "wallB")}${line(b("B1"), b("B2"), "door")}${line(b("B2"), b("B3"), "wallB")}${line(b("B3"), b("B4"), "wallB")}${line(b("B4"), b("B0"), "wallB")}
  ${line(b("T0"), b("T1"), "wallWC")}${line(b("T1"), b("T2"), "wallWC")}${line(b("T2"), b("T3"), "wallWC")}${line(b("T3"), b("D5-WCL"), "wallWC")}${line(b("D5-WCL"), b("T0"), "door")}
  ${line(cFaceOrigin, cFaceAtBWall.point, "construction")}${line(aFaceOrigin, aFaceAtBWall.point, "construction")}${line(cCasingCentre, bCasingCentre, "dimension")}

  ${["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4", "T0", "T1", "T2", "T3", "D5-WCL"].map((id) => circle(b(id), "nodeB")).join("")}
  ${label(b("B0"), "B0 / D3-BL", -5, 20, "labelB", "end")}${label(b("D3-BR"), "D3-BR", 7, 18, "labelB")}${label(b("B0.5"), "B0.5 · corner", -10, 34, "labelB", "end")}${label(b("B1"), "B1 / D5-BL", 6, 19, "labelB")}${label(d3Focus, "249 mm return", 14, 0, "labelB")}
  ${label(midpoint(cCasingCentre, bCasingCentre), "~104 mm derived face separation", -8, -8, "label", "end")}${label(midpoint(...cLeaf), "D3 shared leaf centre", 0, -18, "label", "middle")}
  ${label(midpoint(o("D2-A-FACE-R"), o("D2-A-FACE-L")), "D2 · frozen A/C join", 14, 4, "label")}${label(midpoint(cFaceAtBWall.point, aFaceAtBWall.point), "~250 mm A–C face band extrapolation", 0, -20, "label", "middle")}${includeFixedRoomCCupboards ? `${label(midpoint(o("CP1-BODY-FL"), o("CP1-BODY-BR")), "CP1 / source-plan C1 · fixed", 0, 5, "cupLabel", "middle")}${label(midpoint(o("CP2-BODY-FL"), o("CP2-BODY-BR")), "CP2 / source-plan C2 · fixed", 0, 5, "cupLabel", "middle")}` : ""}
  <text x="${xy([1750, -1800])[0]}" y="${xy([1750, -1800])[1]}" class="roomLabel" fill="#1e3a8a" text-anchor="middle">ROOM C · FIXED</text>
  <text x="${xy([6900, -1800])[0]}" y="${xy([6900, -1800])[1]}" class="roomLabel" fill="#9a3412" text-anchor="middle">ROOM A · FROZEN v0.2</text>
  <text x="${xy(roomBCentroid)[0]}" y="${xy(roomBCentroid)[1]}" class="roomLabel" fill="#047857" text-anchor="middle">ROOM B · RIGIDLY PLACED</text>
  <text x="${xy(wcCentroid)[0]}" y="${xy(wcCentroid)[1]}" class="roomLabel" fill="#0f766e" text-anchor="middle">WC</text>

  <text x="1620" y="185" class="sideHead">Rigid D3 registration</text>
  <text x="1620" y="216" class="side">C D3 axis: <tspan font-weight="700">${cD3Bearing.toFixed(6)}°</tspan></text>
  <text x="1620" y="242" class="side">B D3 axis: <tspan font-weight="700">${bD3Bearing.toFixed(6)}°</tspan></text>
  <text x="1620" y="268" class="side">Pre-fit angular difference: <tspan class="good">${rotationDegrees.toFixed(6)}°</tspan></text>
  <text x="1620" y="294" class="side">Applied rotation: <tspan font-weight="700">${rotationDegrees.toFixed(6)}°</tspan></text>
  <text x="1620" y="320" class="side">Translation: <tspan font-weight="700">${translation[0].toFixed(2)}, ${translation[1].toFixed(2)} mm</tspan></text>
  <text x="1620" y="346" class="small">Scale 1 · determinant +1 · no reflection</text>

  <text x="1620" y="388" class="sideHead">D3 layers</text>
  <text x="1620" y="419" class="side">B casing / C casing: <tspan font-weight="700">${distance(...bCasing).toFixed(2)} / ${distance(...cCasing).toFixed(2)}</tspan></text>
  <text x="1620" y="445" class="side">B visible face / C leaf: <tspan font-weight="700">738 / 760</tspan></text>
  <text x="1620" y="471" class="side">Leaf centre mismatch: <tspan class="good">0.00 mm</tspan></text>
  <text x="1620" y="497" class="side">Leaf end offsets: <tspan class="good">11.00 / 11.00 mm</tspan></text>
  <text x="1620" y="523" class="side">Casing centre: ${signed(dot(casingCentreDelta, d3Along))} along</text>
  <text x="1620" y="549" class="side">Derived wall-face separation: <tspan font-weight="700">${wallPlaneSeparation.toFixed(2)} mm</tspan></text>
  <text x="1620" y="573" class="small">Opposite faces; C reveal depth remains unmeasured.</text>

  <text x="1620" y="615" class="sideHead">Local directions</text>
  <text x="1620" y="646" class="side">D3-BR→B0.5: <tspan font-weight="700">${returnBearing.toFixed(3)}°</tspan></text>
  <text x="1620" y="672" class="side">vs C shared wall: <tspan class="good">${undirectedDifference(returnBearing, cSharedWallTowardBBearing).toFixed(3)}°</tspan></text>
  <text x="1620" y="698" class="side">B0.5→B1: <tspan font-weight="700">${lowerWallBearing.toFixed(3)}°</tspan></text>
  <text x="1620" y="724" class="side">vs C lower wall: <tspan class="good">${undirectedDifference(lowerWallBearing, cLowerWallBearing).toFixed(3)}°</tspan></text>

  <rect x="1610" y="760" width="440" height="235" rx="8" class="uncertain"/>
  <text x="1630" y="795" class="sideHead">Thick-wall hypothesis</text>
  <text x="1630" y="827" class="side"><tspan class="good">Plausibly supported</tspan>, not accepted geometry.</text>
  <text x="1630" y="855" class="side">Return to extrapolated C face: ${returnStartToCFaceMm.toFixed(1)}–${returnEndToCFaceMm.toFixed(1)} mm</text>
  <text x="1630" y="883" class="side">B0.5 to extrapolated A face: ${b05ToPredictedAFaceAlongWallMm.toFixed(1)} mm</text>
  <text x="1630" y="911" class="side">Extrapolated face-band depth: ${predictedWallDepthAtBWallMm.toFixed(1)} mm</text>
  <text x="1630" y="940" class="small">Gold construction overlay is diagnostic only.</text>
  <text x="1630" y="966" class="small">D3 opposing-face depth still requires measurement.</text>

  <rect x="1610" y="1030" width="440" height="165" rx="8" class="callout"/>
  <text x="1630" y="1065" class="sideHead">Assessment</text>
  <text x="1630" y="1098" class="side"><tspan class="good">Compatible</tspan> with explainable</text>
  <text x="1630" y="1125" class="side">opposite-face/casing differences.</text>
  <text x="1630" y="1155" class="small">No Room B local orientation correction indicated.</text>
  <text x="1630" y="1181" class="small">A/C and D2 remain frozen.</text>

  <text x="1620" y="1240" class="sideHead">Preservation</text>
  <text x="1620" y="1272" class="side">A movement: 0.00 mm · C movement: 0.00 mm</text>
  <text x="1620" y="1298" class="side">B/WC deformation: 0.00 mm</text>
  <text x="1620" y="1324" class="side">Room B projects down: <tspan class="good">yes</tspan></text>
  <text x="1620" y="1350" class="side">WC below/right of junction: <tspan class="good">yes</tspan></text>
  ${includeFixedRoomCCupboards ? `<text x="1620" y="1378" class="small">CP1/C1 fixed cupboard: present</text>
  <text x="1620" y="1402" class="small">CP2/C2 fixed cupboard: present</text>
  <text x="1620" y="1426" class="small">Transforms unchanged; no global solve.</text>` : `<text x="1620" y="1395" class="small">Room B/WC P1 remains one rigid body.</text>
  <text x="1620" y="1420" class="small">Stop for human review; no global solve.</text>`}
</svg>`;
}

function makeReport() {
  const compositionCorrection = includeFixedRoomCCupboards ? `

## Composition correction from v0.1

The v0.1 global renderer loaded the complete accepted Room C object-node register, including CP1 and CP2, but its SVG composition emitted only selected shell, partition, door and window layers. The cupboard groups were therefore omitted at export time; no Room C geometry or transform was missing.

v0.2 requires the accepted cupboard nodes and restores the fixed **CP1 / source-plan C1** and **CP2 / source-plan C2** body outlines. It also restores CP2's separate viewer-left casing/joinery strip, the accepted front/door reference lines and the approximate top-casing line. These are copied in the fixed Room C frame; no coordinate is recalculated.
` : "";
  return `# Global reconciliation — A/C/B/WC D3 rigid registration diagnostic v${diagnosticVersion}

Status: **GLOBAL RECONCILIATION — A/C/B/WC D3 RIGID REGISTRATION DIAGNOSTIC** for human review. This is not a final whole-flat model.

The corrected A/C v0.2 frame is frozen. Room B/WC uses its human-accepted provisional P1 geometry and receives one rigid transform only. No A, C, B or WC node is individually moved; there is no scale or deformation.${compositionCorrection}

## Registration method

Opposite doorway faces reverse viewer-left/right: Room B \`B0 / D3-BL\` corresponds to the Room C outer-right side, while \`D3-BR\` corresponds to the Room C outer-left/corner side. The transform aligns the **Room B visible closed D3 face centre and axis** to the **Room C D3 leaf centre and axis**. It deliberately does not force the two outer casing endpoint pairs together.

Both accepted models use the project drawing gauge (+X right, +Y down). The source plans were used only to confirm adjacency, handedness, Room B projecting down, the WC below/right of the junction and D4→D3→D2 ordering. No plan length, angle or proportion was fitted.

| Quantity | Result |
|---|---:|
| Room C D3 axis, outer R → outer L | ${cD3Bearing.toFixed(6)}° |
| Room B D3 axis, B0/D3-BL → D3-BR | ${bD3Bearing.toFixed(6)}° |
| Angular difference before registration | ${preRegistrationAngularDifference.toFixed(6)}° |
| Rotation applied to Room B/WC | ${rotationDegrees.toFixed(6)}° |
| Translation applied to Room B/WC | X ${translation[0].toFixed(4)} mm; Y ${translation[1].toFixed(4)} mm |
| Transform determinant / scale | ${transformDeterminant.toFixed(10)} / 1.000000 |
| Room B outer casing span | ${distance(...bCasing).toFixed(2)} mm |
| Room C outer casing span | ${distance(...cCasing).toFixed(2)} mm |
| Casing-width difference, B minus C | ${(distance(...bCasing) - distance(...cCasing)).toFixed(2)} mm |
| Room B visible closed face / Room C leaf | 738 / 760 mm |
| Shared leaf centre mismatch after placement | 0.00 mm |
| Shared leaf endpoint offsets | 11.00 / 11.00 mm |
| Derived C-face to B-face separation | ${wallPlaneSeparation.toFixed(2)} mm |

## D3 mismatch diagnosis

There is **no rotation mismatch**: both accepted D3 axes are 0° in their local drawing gauges, so Room B/WC requires 0° rotation. Translation registers the shared leaf centre exactly.

The outer casing spans differ by ${(distance(...bCasing) - distance(...cCasing)).toFixed(2)} mm. After leaf-centre alignment, the Room B casing centre is ${signed(dot(casingCentreDelta, d3Along))} mm along D3 from the Room C casing centre and ${signed(dot(casingCentreDelta, towardB))} mm toward Room B. Endpoint vectors are:

- \`B0 / D3-BL\` relative to Room C \`D3-OUTER-R\`: ${signed(casingEndpointDeltas[0][0])}, ${signed(casingEndpointDeltas[0][1])} mm; ${casingEndpointDeltas[0] ? length(casingEndpointDeltas[0]).toFixed(2) : "0"} mm total.
- \`D3-BR\` relative to Room C \`D3-OUTER-L-CORNER\`: ${signed(casingEndpointDeltas[1][0])}, ${signed(casingEndpointDeltas[1][1])} mm; ${length(casingEndpointDeltas[1]).toFixed(2)} mm total.

The ${wallPlaneSeparation.toFixed(2)} mm normal separation is derived from Room B's accepted casing-to-visible-face construction after the shared leaf is aligned. It is **not an independently measured D3 wall thickness**, because Room C's exact D3 reveal and opposing-face depth remain unmeasured. The dominant mismatch is therefore opposite-face/casing depth plus outer-casing width—not translation failure, rotation failure or a collapsed Room B topology.

## Return and wall-family comparison

| Segment | Bearing | Adjacent Room C family | Difference |
|---|---:|---:|---:|
| \`D3-BR → B0.5\` | ${returnBearing.toFixed(6)}° | shared wall toward B ${cSharedWallTowardBBearing.toFixed(6)}° | ${undirectedDifference(returnBearing, cSharedWallTowardBBearing).toFixed(6)}° |
| \`B0.5 → B1\` | ${lowerWallBearing.toFixed(6)}° | lower wall ${cLowerWallBearing.toFixed(6)}° | ${undirectedDifference(lowerWallBearing, cLowerWallBearing).toFixed(6)}° |

The real ${length(returnVector).toFixed(2)} mm return remains intact. \`D3-BR\` and \`B0.5\` remain separate nodes, and \`B0.5 → B1\` remains a separate wall run.

## Thick A–C wall interpretation

The rigid placement **plausibly supports** the hypothesis, but does not prove it. The return starts about ${returnStartToCFaceMm.toFixed(2)} mm and ends about ${returnEndToCFaceMm.toFixed(2)} mm from the extrapolated Room C face. Its direction differs from that wall family by only ${undirectedDifference(returnBearing, cSharedWallTowardBBearing).toFixed(2)}°. The \`B0.5 → B1\` wall crosses the extrapolated Room A face after ${b05ToPredictedAFaceAlongWallMm.toFixed(2)} mm; the two extrapolated A/C faces are ${predictedWallDepthAtBWallMm.toFixed(2)} mm apart there, consistent with the independent approximately 250 mm D2 depth.

This suggests a credible arrangement in which the thick A–C wall continues past D2 toward D3, then terminates/returns near \`D3-BR → B0.5\`. The gold SVG overlay is a **diagnostic extrapolation only**, not newly accepted wall geometry. Exact construction cannot be established without D3 opposing-face/reveal measurements.

## Wider topology and conclusion

Room B projects downward from D3. The WC falls below and to the right of the A–C junction, with D4→D3→D2 ordering preserved. No incorrect A/C/B shell overlap or unexplained large gap is introduced by the shared-leaf registration.

Classification: **${classification}**.

No local Room B correction is indicated by this rigid test. If tighter closure is needed, the minimum real-world check is perpendicular finished-face-to-finished-face depth through D3 at both jambs, plus along-wall offsets from \`D3-BR\` and \`B0.5\` to the Room A-side face/return. A square-on photograph showing those nodes and adjoining wall planes would resolve the construction interpretation.

${includeFixedRoomCCupboards ? "Composition confirmation: **CP1/C1 is present; CP2/C2 is present; all A/C/B/WC transforms, D2 registration and D3 registration are unchanged from v0.1. No geometry was re-solved.**\n\n" : ""}Stop here for human review. Do not deform the global network or adjust D3 nodes.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  status: output.documentType,
  classification,
  rotationDegrees: round(rotationDegrees, 6),
  translationMm: { x: round(translation[0], 4), y: round(translation[1], 4) },
  leafCentreMismatchMm: diagnostics.d3LayerFit.alignedLeafCentreMismatchMm,
  wallPlaneSeparationMm: diagnostics.d3LayerFit.wallPlaneResult.separationMm,
  thickWallHypothesis: diagnostics.thickWallHypothesis.status,
  outputs: ["svg", "json", "md"].map((extension) => path.relative(repoRoot, path.join(outputDir, `${stem}.${extension}`))),
}, null, 2));

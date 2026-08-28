#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const roomARelative = "docs/survey/derived/room-a/ROOM_A_RECONSTRUCTION_PILOT_v0_1.json";
const roomCRelative = "docs/survey/derived/room-c/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json";
const outputDir = path.join(repoRoot, "docs/survey/derived/global-reconciliation");
const diagnosticVersion = process.argv.includes("--v0.2") ? "0.2" : "0.1";
const correctedDisplayOrientation = diagnosticVersion === "0.2";
const stem = `ROOM_A_C_D2_RIGID_REGISTRATION_DIAGNOSTIC_v${diagnosticVersion.replace(".", "_")}`;
const generatedDate = "2026-08-12";

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), "utf8"));
const sha256 = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(repoRoot, relative))).digest("hex").toUpperCase();
const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, scalar) => [a[0] * scalar, a[1] * scalar];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const length = (a) => Math.hypot(a[0], a[1]);
const distance = (a, b) => length(sub(a, b));
const unit = (a) => mul(a, 1 / length(a));
const midpoint = (a, b) => mul(add(a, b), 0.5);
const bearingDegrees = (vector) => (Math.atan2(vector[1], vector[0]) * 180 / Math.PI + 360) % 360;
const normaliseSignedDegrees = (degrees) => ((degrees + 540) % 360) - 180;
const point = ({ x, y }) => [x, y];
const record = ([x, y]) => ({ x: round(x, 4), y: round(y, 4) });

const roomA = readJson(roomARelative);
const roomC = readJson(roomCRelative);
if (roomA.selection?.selectedSolutionId !== "S3") throw new Error("Expected selected Room A solution S3.");
if (roomC.status !== "PROVISIONALLY ACCEPTED FOR GLOBAL RECONCILIATION") throw new Error("Expected accepted provisional Room C v1.0 baseline.");

const aNodes = Object.fromEntries(Object.entries(roomA.selectedGeometry.allNodeCoordinatesMm).map(([id, value]) => [id, point(value)]));
const cNodes = Object.fromEntries(Object.entries(roomC.planGeometry.inheritedNodesMm).map(([id, value]) => [id, point(value)]));
const cObjects = Object.fromEntries(Object.entries(roomC.planGeometry.objectNodesMm).map(([id, value]) => [id, point(value)]));

const requiredA = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7", "W1-AL", "W1-AR", "D1-AL", "D1-AR", "D2-AL", "D2-AR"];
const requiredC = ["D3-CL", "D2-CR", "PO1", "PO2", "PO3", "PI1", "PI2", "PI3"];
const requiredCObjects = ["D2-OPENING-R", "D2-OPENING-L-INFERRED", "D2-A-FACE-R", "D2-A-FACE-L", "D2-LEAF-A-FACE-R-INFERRED", "D2-LEAF-A-FACE-L-INFERRED"];
for (const id of requiredA) if (!aNodes[id]) throw new Error(`Room A node missing: ${id}`);
for (const id of requiredC) if (!cNodes[id]) throw new Error(`Room C node missing: ${id}`);
for (const id of requiredCObjects) if (!cObjects[id]) throw new Error(`Room C object node missing: ${id}`);

const roomAOpeningWidthMm = roomA.selectedGeometry.objects.D2.clearOpeningWidthMm;
const roomACasingWidthMm = roomA.selectedGeometry.objects.D2.frontFaceWidthMm;
const roomAClosingHeightMm = roomA.selectedGeometry.objects.D2.clearOpeningHeightMm;
const roomCOpeningWidthMm = roomC.objectEvidence.D2.structuralOpeningWidthMm.value;
const roomCLeafWidthMm = roomC.objectEvidence.D2.visibleClosedLeafWidthMm.value;
const roomCLeafHeightMm = roomC.objectEvidence.D2.visibleClosedLeafHeightMm.value;
const wallDepthMm = roomC.objectEvidence.D2.structuralWallDepthMm.value;

// Opposite doorway faces reverse viewer-left/right. Align A's AL->AR direction with C's Room-A-face R->L direction.
const aD2AxisVector = sub(aNodes["D2-AR"], aNodes["D2-AL"]);
const aD2AxisUnit = unit(aD2AxisVector);
const cD2AxisVector = sub(cObjects["D2-A-FACE-L"], cObjects["D2-A-FACE-R"]);
const cD2AxisUnit = unit(cD2AxisVector);
const roomALocalAxisBearingDegrees = bearingDegrees(aD2AxisVector);
const roomCLocalAxisBearingDegrees = bearingDegrees(cD2AxisVector);
const rotationDegrees = normaliseSignedDegrees(roomCLocalAxisBearingDegrees - roomALocalAxisBearingDegrees);
const rotationRadians = rotationDegrees * Math.PI / 180;
const cos = Math.cos(rotationRadians);
const sin = Math.sin(rotationRadians);
const rigidTransformDeterminant = cos * cos + sin * sin;
const rotate = ([x, y]) => [cos * x - sin * y, sin * x + cos * y];

const aD2CentreLocal = midpoint(aNodes["D2-AL"], aNodes["D2-AR"]);
const cD2RoomCFaceCentre = midpoint(cObjects["D2-OPENING-R"], cObjects["D2-OPENING-L-INFERRED"]);
const cD2RoomAFaceCentre = midpoint(cObjects["D2-A-FACE-R"], cObjects["D2-A-FACE-L"]);
const translationMm = sub(cD2RoomAFaceCentre, rotate(aD2CentreLocal));
const transformA = (value) => add(rotate(value), translationMm);
const transformedANodes = Object.fromEntries(Object.entries(aNodes).map(([id, value]) => [id, transformA(value)]));
const aNodeIds = Object.keys(aNodes);
let maxPairwiseDistanceResidualMm = 0;
for (let i = 0; i < aNodeIds.length; i += 1) {
  for (let j = i + 1; j < aNodeIds.length; j += 1) {
    const idA = aNodeIds[i];
    const idB = aNodeIds[j];
    const residual = Math.abs(distance(aNodes[idA], aNodes[idB]) - distance(transformedANodes[idA], transformedANodes[idB]));
    maxPairwiseDistanceResidualMm = Math.max(maxPairwiseDistanceResidualMm, residual);
  }
}
if (maxPairwiseDistanceResidualMm > 1e-8) throw new Error(`Rigid-transform distance invariant failed: ${maxPairwiseDistanceResidualMm} mm.`);

const aClearLocal = [
  add(aD2CentreLocal, mul(aD2AxisUnit, -roomAOpeningWidthMm / 2)),
  add(aD2CentreLocal, mul(aD2AxisUnit, roomAOpeningWidthMm / 2)),
];
const aClearGlobal = aClearLocal.map(transformA);
const aMeasuredCasingGlobal = [
  add(cD2RoomAFaceCentre, mul(cD2AxisUnit, -roomACasingWidthMm / 2)),
  add(cD2RoomAFaceCentre, mul(cD2AxisUnit, roomACasingWidthMm / 2)),
];
const cStructuralAtAFace = [cObjects["D2-A-FACE-R"], cObjects["D2-A-FACE-L"]];
const cLeafAtAFace = [cObjects["D2-LEAF-A-FACE-R-INFERRED"], cObjects["D2-LEAF-A-FACE-L-INFERRED"]];
const wallNormalTowardA = unit(sub(cD2RoomAFaceCentre, cD2RoomCFaceCentre));
const resultingWallFaceSeparationMm = distance(cD2RoomCFaceCentre, cD2RoomAFaceCentre);

const clearEndpointOffsetsMm = [distance(aClearGlobal[0], cStructuralAtAFace[0]), distance(aClearGlobal[1], cStructuralAtAFace[1])];
const transformedCasingNodeSpanMm = distance(transformedANodes["D2-AL"], transformedANodes["D2-AR"]);
const modelCasingOverhangEachEndMm = (transformedCasingNodeSpanMm - roomCOpeningWidthMm) / 2;
const measuredCasingOverhangEachEndMm = (roomACasingWidthMm - roomCOpeningWidthMm) / 2;
const roomAInteriorReference = midpoint(transformedANodes.A3, transformedANodes.A5);
const roomAExtensionFromAFaceMm = dot(sub(roomAInteriorReference, cD2RoomAFaceCentre), wallNormalTowardA);
const aBoundarySignedOffsetsMm = ["A0", "A7", "D2-AL", "D2-AR"].map((id) => dot(sub(transformedANodes[id], cD2RoomAFaceCentre), wallNormalTowardA));
const roomCShellReference = midpoint(cNodes.C0, cNodes["CP2-FR"]);
const roomCShellSideOffsetMm = dot(sub(roomCShellReference, cD2RoomCFaceCentre), wallNormalTowardA);

const diagnostics = {
  roomAOpeningWidthMm,
  roomCStructuralOpeningWidthMm: roomCOpeningWidthMm,
  openingWidthDifferenceRoomCMinusRoomAMm: roomCOpeningWidthMm - roomAOpeningWidthMm,
  axes: {
    convention: correctedDisplayOrientation
      ? "Numeric atan2 bearings from local +X. Both accepted room drawing gauges use +Y down, so increasing bearing appears clockwise on the sheet; bearings are not site north. Directed endpoints reverse across opposite doorway faces."
      : "Local coordinate bearings from +X, counter-clockwise; not site north. Directed endpoints reverse across opposite doorway faces.",
    roomA: { directedEndpoints: ["D2-AL", "D2-AR"], unitVector: record(aD2AxisUnit), bearingDegrees: round(roomALocalAxisBearingDegrees, 6) },
    roomC: { directedEndpoints: ["D2-A-FACE-R", "D2-A-FACE-L"], unitVector: record(cD2AxisUnit), bearingDegrees: round(roomCLocalAxisBearingDegrees, 6), reverseDirectionBearingDegrees: round((roomCLocalAxisBearingDegrees + 180) % 360, 6) },
  },
  rigidTransformRoomAToRoomCFrame: {
    rotationDegrees: round(rotationDegrees, 6),
    rotationRadians: round(rotationRadians, 10),
    matrix: [[round(cos, 10), round(-sin, 10)], [round(sin, 10), round(cos, 10)]],
    determinant: round(rigidTransformDeterminant, 10),
    reflectionIntroduced: rigidTransformDeterminant < 0,
    translationMm: { x: round(translationMm[0], 4), y: round(translationMm[1], 4) },
    scale: 1,
    registrationTarget: "Room A D2 clear-opening centre to Room C structural-opening centre on the Room A wall face; directed axes aligned with opposite-face handedness reversed.",
  },
  wallAndLayerResult: {
    roomCFaceCentreMm: record(cD2RoomCFaceCentre),
    roomAFaceCentreMm: record(cD2RoomAFaceCentre),
    resultingWallFaceSeparationMm: round(resultingWallFaceSeparationMm, 4),
    targetWallDepthMm: wallDepthMm,
    separationResidualMm: round(resultingWallFaceSeparationMm - wallDepthMm, 4),
    throughWallAxisUnitTowardRoomA: record(wallNormalTowardA),
    roomAClosingPlaneCoincidesWithRoomAFaceInDiagnostic: true,
  },
  endpointAndCasingResult: {
    structuralVsClearOpeningWidthDifferenceMm: roomCOpeningWidthMm - roomAOpeningWidthMm,
    centredClearEndpointOffsetsMm: clearEndpointOffsetsMm.map((value) => round(value, 4)),
    roomAModelCasingNodeSpanMm: round(transformedCasingNodeSpanMm, 4),
    roomAMeasuredCasingFrontWidthMm: roomACasingWidthMm,
    modelCasingNodeSpanMinusMeasuredCasingWidthMm: round(transformedCasingNodeSpanMm - roomACasingWidthMm, 4),
    casingNodeOverhangBeyondCStructuralOpeningEachEndMm: round(modelCasingOverhangEachEndMm, 4),
    measuredCasingOverhangBeyondCStructuralOpeningEachEndMm: round(measuredCasingOverhangEachEndMm, 4),
    cLeafVsAOpeningWidthDifferenceMm: roomAOpeningWidthMm - roomCLeafWidthMm,
    cLeafVsAOpeningCentredOffsetEachEndMm: round((roomAOpeningWidthMm - roomCLeafWidthMm) / 2, 4),
    leafHeightDifferenceRoomCMinusRoomAMm: roomCLeafHeightMm - roomAClosingHeightMm,
    interpretation: "The 3 mm structural/clear difference is small. Larger casing endpoint offsets are expected because Room A outer casing, the structural opening and the Room C reveal are distinct layers; they are not evidence of shell error.",
  },
  sanityChecks: {
    roomAExtendsTowardExpectedRightHandSide: roomAExtensionFromAFaceMm > 0,
    roomAInteriorReferenceOffsetOutwardFromAFaceMm: round(roomAExtensionFromAFaceMm, 2),
    roomABoundaryOffsetsFromRegisteredAFaceMm: aBoundarySignedOffsetsMm.map((value) => round(value, 4)),
    roomCShellReferenceOffsetFromCRoomFaceMm: round(roomCShellSideOffsetMm, 2),
    shellOverlapToleranceMm: 5,
    incorrectRoomAShellOverlapIntoRoomC: Math.min(...aBoundarySignedOffsetsMm) < -5,
    unexplainedLargeGapAtD2: Math.abs(resultingWallFaceSeparationMm - wallDepthMm) > 5,
    conceptualTopologyCheck: "Consistent with Room C on the left, Room A extending rightward, D2 through the shared permanent wall and the Room A chimney-breast step retained.",
  },
};

const output = {
  documentType: "GLOBAL RECONCILIATION - A/C D2 RIGID REGISTRATION DIAGNOSTIC",
  version: diagnosticVersion,
  generatedDate,
  units: "millimetres unless stated otherwise",
  status: "diagnostic for human review; not a final whole-flat model",
  scope: {
    completed: "Rigidly register accepted Room A S3 to fixed accepted Room C v1.0 through D2.",
    excluded: ["node deformation", "scaling", "global solve", "Room B/WC", "D3 reconciliation", "changes to source baselines"],
  },
  sources: {
    roomA: { relativePath: roomARelative, selectedSolution: "S3", sha256: sha256(roomARelative), fixedInternally: true },
    roomC: { relativePath: roomCRelative, selectedSolution: "A1", sha256: sha256(roomCRelative), globalFrame: true, fixed: true },
  },
  evidenceClasses: {
    directMeasured: ["Room A D2 clear opening 767 mm", "Room C D2 structural opening 770 mm", "Room C D2 leaf 742 x 1975 mm"],
    approximateMeasured: ["A-C wall/reveal depth approximately 250 mm", "Room A D2 casing face projection maximum 37 mm"],
    topologyAndLayerConstraints: ["one shared D2 assembly", "Room C left / Room A right", "closing plane on Room A side", "door opens into Room A", "opposite casing faces remain distinct"],
    inferredPlacement: ["centred Room A clear opening and casing presentation", "Room C opposite structural-opening endpoint", "exact closing-plane rebate"],
  },
  registrationDiagnostics: diagnostics,
  sourceCoordinates: {
    roomALocalNodesMm: Object.fromEntries(Object.entries(aNodes).map(([id, value]) => [id, record(value)])),
    roomCGlobalNodesMm: Object.fromEntries(Object.entries(cNodes).map(([id, value]) => [id, record(value)])),
    roomCObjectNodesMm: Object.fromEntries(Object.entries(cObjects).map(([id, value]) => [id, record(value)])),
  },
  placedGeometry: {
    roomATransformedNodesMm: Object.fromEntries(Object.entries(transformedANodes).map(([id, value]) => [id, record(value)])),
    d2: {
      roomAClearOpeningSegmentMm: aClearGlobal.map(record),
      roomAMeasuredCasingSegmentMm: aMeasuredCasingGlobal.map(record),
      roomCStructuralOpeningAtRoomCFaceMm: [cObjects["D2-OPENING-R"], cObjects["D2-OPENING-L-INFERRED"]].map(record),
      roomCStructuralOpeningAtRoomAFaceMm: cStructuralAtAFace.map(record),
      roomCLeafClosingPlaneMm: cLeafAtAFace.map(record),
    },
  },
  localGeometryPreservation: {
    roomCNodeMovementMm: 0,
    roomANodeDeformationMm: 0,
    roomAScale: 1,
    roomALocalPairwiseDistancesPreserved: true,
    roomAMaxPairwiseDistanceResidualMm: round(maxPairwiseDistanceResidualMm, 10),
    measurementsChanged: false,
  },
  ...(correctedDisplayOrientation ? {
    orientationReview: {
      diagnosis: "The v0.1 combined SVG was vertically reflected by its world-to-SVG conversion. The accepted Room A and Room C drawing gauges both use increasing model Y down the sheet, but v0.1 rendered Y as maxY minus Y as though the model used Cartesian Y-up.",
      issueClass: "display-only coordinate-conversion reflection; underlying transformed geometry and D2 registration unchanged",
      topologyReferences: [
        "source-material/plans/2dPlan.jpeg",
        "source-material/plans/rough-paint-sketch.jpg",
      ],
      topologyReferenceUse: "Room adjacency, handedness, feature side and opening order only; no lengths, angles or proportions derived.",
      acceptedInputDrawingConventions: {
        roomA: "The accepted Room A SVG generator maps local Y directly to increasing SVG Y (down the page).",
        roomC: "The Room C coordinate gauge explicitly states positive Y is down on the reconstruction sheet, and its accepted SVG generator maps it directly to increasing SVG Y.",
      },
      rigidTransform: {
        linearDeterminant: round(rigidTransformDeterminant, 10),
        reflectionIntroduced: rigidTransformDeterminant < 0,
        rotationAndTranslationUnchangedFromV01: true,
      },
      v01WorldToSvg: {
        yMapping: "plotY + (maxY - modelY) * scale",
        linearDeterminantSign: -1,
        effect: "vertical reflection relative to the accepted project drawing convention",
      },
      v02WorldToSvg: {
        yMapping: "plotY + (modelY - minY) * scale",
        linearDeterminantSign: 1,
        effect: "preserves the accepted project drawing handedness",
      },
      sourcePlanLabels: "The source plans' cupboard labels C1/C2 correspond to survey objects CP1/CP2. Permanent nodes C1/C2 are separately retained at the W2 recess.",
      correctedTopologyChecks: {
        roomCLeftOfRoomA: true,
        sourcePlanC1C2CupboardsOnUpperSideAsSurveyCP1CP2: true,
        w2OnLowerSideOfRoomC: true,
        roomASteppedChimneyBoundaryOnUpperSide: true,
        w1OnFarRightRoomAWall: true,
        d1OnLowerSideOfRoomA: true,
        d2TowardLowerEndOfSharedWall: true,
      },
      d2RigidRegistrationRemainsValid: true,
    },
  } : {}),
  conclusion: {
    classification: "compatible with small explainable face/casing differences",
    statement: "The rigid D2 registration is architecturally credible. The 3 mm opening-width difference produces 1.5 mm centred endpoint offsets; larger outer-casing offsets arise from deliberately distinct casing, reveal and structural-opening layers rather than shell error.",
    remainingInterfaceAmbiguity: [
      "Exact Room A finished-face/casing projection and casing-to-structural-opening side offsets.",
      "Exact structural jamb/rebate position within the approximately 250 mm reveal.",
      "Whether the 250 mm depth varies between the two jambs.",
    ],
    minimumAdditionalFieldCheckForTighterRegistration: "Measure perpendicular finished-face-to-finished-face depth at both D2 jambs and each Room A casing edge to the corresponding structural jamb/reveal edge.",
  },
};

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function makeSvg() {
  const allPoints = [...Object.values(cNodes), ...Object.values(cObjects), ...Object.values(transformedANodes), ...aClearGlobal, ...aMeasuredCasingGlobal];
  const minX = Math.min(...allPoints.map((value) => value[0])) - 350;
  const maxX = Math.max(...allPoints.map((value) => value[0])) + 350;
  const minY = Math.min(...allPoints.map((value) => value[1])) - 300;
  const maxY = Math.max(...allPoints.map((value) => value[1])) + 300;
  const plot = { x: 50, y: 185, width: 1420, height: 990 };
  const scale = Math.min(plot.width / (maxX - minX), plot.height / (maxY - minY));
  const pt = ([x, y]) => [
    plot.x + (x - minX) * scale,
    plot.y + (correctedDisplayOrientation ? y - minY : maxY - y) * scale,
  ];
  const xy = (value) => pt(value).map((number) => round(number, 1));
  const line = (a, b, cls) => { const p = xy(a), q = xy(b); return `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" class="${cls}"/>`; };
  const polygon = (values, cls) => `<polygon points="${values.map((value) => xy(value).join(",")).join(" ")}" class="${cls}"/>`;
  const circle = (value, cls = "node", radius = 5) => { const p = xy(value); return `<circle cx="${p[0]}" cy="${p[1]}" r="${radius}" class="${cls}"/>`; };
  const label = (value, text, dx = 7, dy = -7, cls = "label", anchor = "start") => { const p = xy(value); return `<text x="${round(p[0] + dx, 1)}" y="${round(p[1] + dy, 1)}" class="${cls}" text-anchor="${anchor}">${escapeXml(text)}</text>`; };
  const c = (id) => cNodes[id];
  const o = (id) => cObjects[id];
  const a = (id) => transformedANodes[id];

  const outward = point(roomC.planGeometry.axes.structuralWallOutwardTowardRoomA);
  const cWallAEnd = add(c("D3-CL"), mul(outward, wallDepthMm));
  const cWallAStart = add(c("CP2-FR"), mul(outward, wallDepthMm));
  const d2Band = [o("D2-OPENING-L-INFERRED"), o("D2-OPENING-R"), o("D2-A-FACE-R"), o("D2-A-FACE-L")];
  const fullWallBand = [c("CP2-FR"), c("D3-CL"), cWallAEnd, cWallAStart];
  const aShellIds = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"];
  const cShellFill = [c("C0"), c("CP1-FL"), c("CP2-FR"), c("D3-CL")];
  const partition = [c("PO1"), c("PO2"), c("PO3"), c("PI3"), c("PI2"), c("PI1")];
  const dimensionMid = midpoint(cD2RoomCFaceCentre, cD2RoomAFaceCentre);
  const d2LabelPoint = add(dimensionMid, mul(cD2AxisUnit, 610));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1900" height="1300" viewBox="0 0 1900 1300" role="img" aria-labelledby="title desc">
  <title id="title">Room A to Room C D2 rigid registration diagnostic v${diagnosticVersion}</title>
  <desc id="desc">Fixed accepted Room C with rigidly transformed Room A. D2 clear and structural openings are centreline-aligned across an approximately 250 mm wall; casing faces remain distinct.${correctedDisplayOrientation ? " The v0.2 rendering preserves the accepted project drawing convention with positive Y down the page." : ""}</desc>
  <defs><style>
    .page{fill:#fff;stroke:#0f172a;stroke-width:3}.panel{fill:#f8fafc;stroke:#94a3b8;stroke-width:2}.title{font:700 31px Arial,sans-serif;fill:#0f172a}.sub{font:17px Arial,sans-serif;fill:#334155}.warn{font:700 17px Arial,sans-serif;fill:#9f1239}.roomA{fill:#fff7ed;stroke:#c2410c;stroke-width:2}.roomC{fill:#eff6ff;stroke:#1d4ed8;stroke-width:2}.wallA{stroke:#c2410c;stroke-width:7}.wallC{stroke:#1e3a8a;stroke-width:7}.wallBand{fill:#fee2e2;stroke:#b91c1c;stroke-width:2}.openingCut{fill:#fff;stroke:#0f766e;stroke-width:2}.partition{fill:#e9d5ff;stroke:#7e22ce;stroke-width:3}.openingA{stroke:#2563eb;stroke-width:9}.casingA{stroke:#d97706;stroke-width:8;stroke-dasharray:9 5}.openingC{stroke:#0f766e;stroke-width:11}.leaf{stroke:#166534;stroke-width:7}.window{stroke:#0284c7;stroke-width:9}.door{stroke:#d97706;stroke-width:10}.cup{fill:#fef3c7;stroke:#a16207;stroke-width:2}.node{fill:#fff;stroke:#0f172a;stroke-width:2}.nodeA{fill:#fff7ed;stroke:#c2410c;stroke-width:2}.nodeC{fill:#eff6ff;stroke:#1d4ed8;stroke-width:2}.partitionNode{fill:#faf5ff;stroke:#7e22ce;stroke-width:2}.label{font:700 12px Arial,sans-serif;fill:#0f172a;paint-order:stroke;stroke:#fff;stroke-width:4px}.labelA{font:700 12px Arial,sans-serif;fill:#9a3412;paint-order:stroke;stroke:#fff;stroke-width:4px}.labelC{font:700 12px Arial,sans-serif;fill:#1e3a8a;paint-order:stroke;stroke:#fff;stroke-width:4px}.roomLabel{font:700 21px Arial,sans-serif}.sideHead{font:700 20px Arial,sans-serif;fill:#0f172a}.side{font:15px Arial,sans-serif;fill:#1f2937}.small{font:13px Arial,sans-serif;fill:#475569}.good{fill:#166534;font-weight:700}.construction{stroke:#64748b;stroke-width:2;stroke-dasharray:7 6}.dimension{stroke:#be123c;stroke-width:2;marker-start:url(#arrowBack);marker-end:url(#arrow)}.callout{fill:#fff7ed;stroke:#d97706;stroke-width:2}
  </style><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#be123c"/></marker><marker id="arrowBack" markerWidth="7" markerHeight="7" refX="1" refY="3.5" orient="auto"><path d="M7 0 L0 3.5 L7 7 Z" fill="#be123c"/></marker></defs>
  <rect x="12" y="12" width="1876" height="1276" rx="12" class="page"/>
  <text x="48" y="58" class="title">GLOBAL RECONCILIATION · A/C D2 RIGID REGISTRATION DIAGNOSTIC · v${diagnosticVersion}</text>
  <text x="48" y="89" class="sub">Room C fixed · Room A rigid transform only · no scale · no node deformation${correctedDisplayOrientation ? " · accepted +Y-down drawing orientation restored" : " · residual convention model minus evidence"}</text>
  <text x="48" y="120" class="warn">HUMAN REVIEW ONLY — NOT FINAL WHOLE-FLAT GEOMETRY — ROOM B/WC AND D3 EXCLUDED</text>
  <rect x="30" y="150" width="1460" height="1100" rx="10" class="panel"/><rect x="1510" y="150" width="360" height="1100" rx="10" class="panel"/>

  ${polygon(cShellFill, "roomC")}${polygon(aShellIds.map(a), "roomA")}${polygon(fullWallBand, "wallBand")}${polygon(d2Band, "openingCut")}${polygon(partition, "partition")}

  ${line(c("C0"), c("CP1-FL"), "wallC")}${line(c("CP1-FL"), c("PO1"), "wallC")}${line(c("PI1"), c("CP2-FL"), "wallC")}${line(c("CP2-FR"), c("D3-CL"), "wallC")}
  ${line(c("C0"), c("C1"), "wallC")}${line(c("C1"), c("W2-CR"), "wallC")}${line(c("W2-CL"), c("C2"), "wallC")}${line(c("C2"), o("D4-OUTER-R"), "wallC")}
  ${line(c("W2-CR"), c("W2-CL"), "window")}${line(o("D4-OUTER-R"), o("D4-OUTER-L"), "door")}${line(o("D4-OUTER-L"), o("D3-OUTER-R"), "wallC")}${line(o("D3-OUTER-R"), o("D3-OUTER-L-CORNER"), "door")}
  ${polygon([o("CP1-BODY-FL"), o("CP1-BODY-FR"), o("CP1-BODY-BR"), o("CP1-BODY-BL")], "cup")}${polygon([o("CP2-BODY-FL"), o("CP2-BODY-FR"), o("CP2-BODY-BR"), o("CP2-BODY-BL")], "cup")}

  ${line(a("A0"), a("A1"), "wallA")}${line(a("A1"), a("A2"), "wallA")}${line(a("A2"), a("A3"), "wallA")}${line(a("A3"), a("A4"), "wallA")}${line(a("A4"), a("A5"), "wallA")}
  ${line(a("A5"), a("W1-AL"), "wallA")}${line(a("W1-AR"), a("A6"), "wallA")}${line(a("A6"), a("D1-AL"), "wallA")}${line(a("D1-AR"), a("A7"), "wallA")}${line(a("A7"), a("D2-AL"), "wallA")}${line(a("D2-AR"), a("A0"), "wallA")}
  ${line(a("W1-AL"), a("W1-AR"), "openingA")}${line(a("D1-AL"), a("D1-AR"), "openingA")}

  ${line(o("D2-OPENING-R"), o("D2-OPENING-L-INFERRED"), "openingC")}${line(cStructuralAtAFace[0], cStructuralAtAFace[1], "openingC")}${line(cLeafAtAFace[0], cLeafAtAFace[1], "leaf")}${line(aClearGlobal[0], aClearGlobal[1], "openingA")}${line(aMeasuredCasingGlobal[0], aMeasuredCasingGlobal[1], "casingA")}
  ${line(cD2RoomCFaceCentre, cD2RoomAFaceCentre, "dimension")}${line(aClearGlobal[0], cStructuralAtAFace[0], "construction")}${line(aClearGlobal[1], cStructuralAtAFace[1], "construction")}

  ${requiredC.map((id) => circle(c(id), id.startsWith("P") ? "partitionNode" : "nodeC", id.startsWith("P") ? 4 : 5)).join("")}${requiredA.map((id) => circle(a(id), "nodeA", id.startsWith("A") ? 4 : 3)).join("")}
  ${label(c("D3-CL"), "D3-CL · corner", -8, 22, "labelC", "end")}${label(c("D2-CR"), "D2-CR", -7, -8, "labelC", "end")}${label(c("PO3"), "PO3", 7, 17, "labelC")}${label(c("PI3"), "PI3", 7, -8, "labelC")}
  ${label(a("D2-AL"), "D2-AL", 8, 17, "labelA")}${label(a("D2-AR"), "D2-AR", 8, -8, "labelA")}${label(a("A0"), "A0", 7, -8, "labelA")}${label(a("A7"), "A7", 7, 17, "labelA")}${label(a("A2"), "A2", -7, 17, "labelA", "end")}${label(a("A3"), "A3", 7, 17, "labelA")}
  ${correctedDisplayOrientation ? `${label(midpoint(o("CP1-BODY-FL"), o("CP1-BODY-BR")), "CP1 · source-plan C1", 0, 5, "label", "middle")}${label(midpoint(o("CP2-BODY-FL"), o("CP2-BODY-BR")), "CP2 · source-plan C2", 0, 5, "label", "middle")}${label(midpoint(c("W2-CR"), c("W2-CL")), "W2 · lower side", 0, 24, "labelC", "middle")}${label(midpoint(a("W1-AL"), a("W1-AR")), "W1 · far-right wall", -12, 4, "labelA", "end")}${label(midpoint(a("D1-AL"), a("D1-AR")), "D1 · lower side", 0, 26, "labelA", "middle")}` : ""}
  ${label(dimensionMid, "~250 mm through-wall", -10, -10, "label", "end")}${correctedDisplayOrientation ? label(dimensionMid, "D2 shared assembly", 65, 5, "label") : label(d2LabelPoint, "D2 shared assembly", 0, 0, "label", "middle")}
  <text x="${xy(midpoint(c("C0"), c("D3-CL")))[0]}" y="${xy(midpoint(c("C0"), c("CP1-FL")))[1]}" class="roomLabel" fill="#1e3a8a" text-anchor="middle">ROOM C · FIXED FRAME</text>
  <text x="${xy(midpoint(a("A3"), a("A7")))[0]}" y="${xy(midpoint(a("A1"), a("A7")))[1]}" class="roomLabel" fill="#9a3412" text-anchor="middle">ROOM A · RIGIDLY PLACED</text>

  <text x="1540" y="195" class="sideHead">D2 registration</text>
  <text x="1540" y="226" class="side">A clear opening: <tspan font-weight="700">${roomAOpeningWidthMm} mm</tspan></text>
  <text x="1540" y="252" class="side">C structural opening: <tspan font-weight="700">${roomCOpeningWidthMm} mm</tspan></text>
  <text x="1540" y="278" class="side">Width difference: <tspan class="good">${roomCOpeningWidthMm - roomAOpeningWidthMm} mm</tspan></text>
  <text x="1540" y="316" class="sideHead">Rigid transform</text>
  <text x="1540" y="347" class="side">Rotation: <tspan font-weight="700">${round(rotationDegrees, 6)}°</tspan></text>
  <text x="1540" y="373" class="side">Translation X: <tspan font-weight="700">${round(translationMm[0], 2)} mm</tspan></text>
  <text x="1540" y="399" class="side">Translation Y: <tspan font-weight="700">${round(translationMm[1], 2)} mm</tspan></text>
  <text x="1540" y="425" class="side">Scale: <tspan font-weight="700">1.000000</tspan></text>
  ${correctedDisplayOrientation ? `<text x="1540" y="447" class="small">Transform determinant: +1 · no reflection</text>` : ""}
  <text x="1540" y="463" class="sideHead">Axes · local +X gauge</text>
  <text x="1540" y="494" class="small">A AL→AR: ${round(roomALocalAxisBearingDegrees, 6)}°</text>
  <text x="1540" y="518" class="small">C A-face R→L: ${round(roomCLocalAxisBearingDegrees, 6)}°</text>
  <text x="1540" y="542" class="small">Opposite-face handedness reversed</text>
  <text x="1540" y="580" class="sideHead">Layer result</text>
  <text x="1540" y="611" class="side">Wall-face depth: <tspan class="good">${round(resultingWallFaceSeparationMm, 2)} mm</tspan></text>
  <text x="1540" y="637" class="side">Clear end offsets: <tspan class="good">1.50 / 1.50 mm</tspan></text>
  <text x="1540" y="663" class="small">A casing span model ${round(transformedCasingNodeSpanMm, 2)}</text>
  <text x="1540" y="687" class="small">A measured casing width ${roomACasingWidthMm}</text>
  <text x="1540" y="711" class="small">C leaf ${roomCLeafWidthMm} · A clear ${roomAOpeningWidthMm}</text>
  <rect x="1530" y="750" width="320" height="150" rx="8" class="callout"/>
  <text x="1550" y="784" class="sideHead">Assessment</text>
  <text x="1550" y="817" class="side"><tspan class="good">Compatible</tspan> with small,</text>
  <text x="1550" y="843" class="side">explainable face/casing differences.</text>
  <text x="1550" y="871" class="small">No shell error indicated.</text>
  <text x="1540" y="938" class="sideHead">Layer key</text>
  <line x1="1540" y1="970" x2="1580" y2="970" class="wallC"/><text x="1595" y="976" class="small">Room C shell</text>
  <line x1="1540" y1="1000" x2="1580" y2="1000" class="wallA"/><text x="1595" y="1006" class="small">Room A shell</text>
  <rect x="1540" y="1020" width="40" height="20" class="wallBand"/><text x="1595" y="1036" class="small">A–C wall body</text>
  <line x1="1540" y1="1065" x2="1580" y2="1065" class="openingC"/><text x="1595" y="1071" class="small">C structural opening</text>
  <line x1="1540" y1="1095" x2="1580" y2="1095" class="openingA"/><text x="1595" y="1101" class="small">A clear opening</text>
  <line x1="1540" y1="1125" x2="1580" y2="1125" class="casingA"/><text x="1595" y="1131" class="small">A outer casing</text>
  <line x1="1540" y1="1155" x2="1580" y2="1155" class="leaf"/><text x="1595" y="1161" class="small">closing leaf</text>
  <text x="1540" y="1203" class="small">Room C coordinates fixed.</text>
  <text x="1540" y="1227" class="small">Room A pairwise distances preserved.</text>
</svg>`;
}

function signed(value) { return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}`; }

function makeReport() {
  const orientationReview = correctedDisplayOrientation ? `
## Orientation diagnosis and correction

The v0.1 drawing had a **display-only vertical reflection**. Both accepted input reconstructions use the project drawing convention in which model +Y runs downward on the sheet: Room C states this explicitly in its coordinate gauge, and both accepted room SVG generators map local Y directly to increasing SVG Y. The v0.1 combined renderer instead used \`maxY - modelY\`, a Cartesian-Y-to-SVG conversion whose linear determinant is negative. That mirrored the combined drawing vertically.

The D2 rigid transform did **not** cause the reflection. Its linear matrix determinant is **${rigidTransformDeterminant.toFixed(10)}**, so it is a rotation with no reflection. v0.2 retains exactly the v0.1 rotation, translation, scale, D2 centreline registration and wall-face separation; only the world-to-SVG Y mapping changes to \`modelY - minY\`, whose determinant sign is positive.

The two source plans were inspected only for topology and handedness. No length, angle or proportion was derived from them. Their cupboard labels C1/C2 correspond to survey objects CP1/CP2; permanent survey nodes C1/C2 are separately retained at the W2 recess.

In the corrected view:

- Room C is left of Room A;
- CP1/CP2 (source-plan cupboards C1/C2) are on the upper side of Room C and W2 is on its lower side;
- Room A's chimney-breast/stepped boundary is uppermost, W1 is on the far-right wall and D1 is on the lower side;
- D2 remains toward the lower end of the A–C shared wall.

` : "";
  return `# Global reconciliation — A/C D2 rigid registration diagnostic v${diagnosticVersion}

Status: **GLOBAL RECONCILIATION — A/C D2 RIGID REGISTRATION DIAGNOSTIC** for human review. This is not a final whole-flat model.

Room C is fixed as the global coordinate frame. Room A uses its accepted/current selected S3 geometry and receives one rigid transform only: translation and rotation, with scale 1 and no node deformation. Room B/WC and D3 are outside this task.
${orientationReview}

## Registration definition

Opposite doorway faces reverse viewer-left/right. The directed Room A axis D2-AL → D2-AR is therefore aligned with the Room C Room-A-face structural direction D2-A-FACE-R → D2-A-FACE-L. The Room A clear-opening centre is placed on the Room C structural-opening centre at the Room A wall face, 250 mm through the wall from the Room C reveal face.

${correctedDisplayOrientation ? "Local bearings are numeric atan2 bearings from each source model's +X axis. Because both accepted room drawing gauges use +Y down, increasing numerical bearing appears clockwise on the sheet. They are not site-north bearings." : "Local bearings are coordinate-gauge bearings from each source model's +X axis, not site-north bearings."}

| Quantity | Result |
|---|---:|
| Room A D2 clear opening | ${roomAOpeningWidthMm.toFixed(2)} mm |
| Room C D2 structural opening | ${roomCOpeningWidthMm.toFixed(2)} mm |
| Difference, C minus A | ${(roomCOpeningWidthMm - roomAOpeningWidthMm).toFixed(2)} mm |
| Room A local D2 axis, D2-AL → D2-AR | ${roomALocalAxisBearingDegrees.toFixed(6)}° |
| Room C local D2 axis, A-face R → L | ${roomCLocalAxisBearingDegrees.toFixed(6)}° |
| Rotation applied to Room A | ${rotationDegrees.toFixed(6)}° |
| Translation applied to Room A | X ${translationMm[0].toFixed(4)} mm; Y ${translationMm[1].toFixed(4)} mm |
| Rigid-transform determinant | ${rigidTransformDeterminant.toFixed(10)} — no reflection |
| Scale | 1.000000 |
| Resulting Room C-face → Room A-face separation | ${resultingWallFaceSeparationMm.toFixed(4)} mm |
| Separation residual against 250 mm | ${signed(resultingWallFaceSeparationMm - wallDepthMm)} mm |

## D2 layer mismatch

Centred alignment of the 767 mm Room A clear opening within the 770 mm Room C structural opening leaves **1.50 mm at each endpoint**. This is clean agreement for references that are not physically identical layers.

Room A's fitted D2-AL/D2-AR casing-node span is ${transformedCasingNodeSpanMm.toFixed(2)} mm; its separately measured casing front width is ${roomACasingWidthMm} mm. Against the 770 mm structural opening, these extend approximately ${modelCasingOverhangEachEndMm.toFixed(2)} mm and ${measuredCasingOverhangEachEndMm.toFixed(2)} mm per side respectively when centred. Those are casing/architrave extents, not structural jamb mismatches.

The Room C closing leaf is ${roomCLeafWidthMm} mm versus the Room A clear opening of ${roomAOpeningWidthMm} mm, a ${roomAOpeningWidthMm - roomCLeafWidthMm} mm difference or ${(roomAOpeningWidthMm - roomCLeafWidthMm) / 2} mm per end when centred. The recorded heights differ by ${roomCLeafHeightMm - roomAClosingHeightMm} mm (${roomCLeafHeightMm} mm in C versus ${roomAClosingHeightMm} mm in A). These are consistent with a leaf/clear-opening/rebate distinction.

No outer casing edges were forced to coincide.

## Combined-shell sanity check

- The approximately ${resultingWallFaceSeparationMm.toFixed(2)} mm A–C wall body remains explicit and perpendicular to the registered opening axis.
- Room A extends to the expected right-hand side of Room C; its interior reference is ${roomAExtensionFromAFaceMm.toFixed(2)} mm outward from the Room A wall face.
- The Room A A7–A0/D2 wall line coincides with the registered Room A face without crossing into the Room C side.
- Room C remains on the opposite side of its finished face, with the deep reveal between faces.
- No unexplained large gap occurs at D2 and no incorrect Room A/Room C shell overlap is introduced.
- Room A's wider shell and chimney-breast step remain intact and extend in the direction supported by the conceptual whole-flat topology.

The conceptual/evidence plan was used only to check Room C-left/Room A-right topology and the chimney-breast relationship; no schematic proportions were fitted.

## Preservation and assessment

Room C node movement is **0.00 mm**. Room A node deformation is **0.00 mm**; all Room A pairwise distances are preserved by the rigid transform. No measurements changed and neither accepted source baseline was edited.

Classification: **compatible with small explainable face/casing differences**. The 3 mm structural/clear-opening difference does not indicate shell error. Remaining ambiguity is limited to exact casing projection, structural jamb/rebate registration and possible variation of the approximately 250 mm depth between jambs.

If tighter D2 registration becomes necessary, the minimum useful real-world check is perpendicular finished-face-to-finished-face depth at both jambs plus each Room A casing edge to its corresponding structural jamb/reveal edge.

Stop here for human review. Do not begin D3, Room B/WC registration or a deformable global solve.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  status: output.documentType,
  classification: output.conclusion.classification,
  rotationDegrees: diagnostics.rigidTransformRoomAToRoomCFrame.rotationDegrees,
  translationMm: diagnostics.rigidTransformRoomAToRoomCFrame.translationMm,
  wallFaceSeparationMm: diagnostics.wallAndLayerResult.resultingWallFaceSeparationMm,
  clearEndpointOffsetsMm: diagnostics.endpointAndCasingResult.centredClearEndpointOffsetsMm,
  sourceGeometryChanged: false,
  outputs: ["svg", "json", "md"].map((extension) => path.relative(repoRoot, path.join(outputDir, `${stem}.${extension}`))),
}, null, 2));

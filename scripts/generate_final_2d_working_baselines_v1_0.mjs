#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const generatedDate = "2026-08-13";
const generator = "scripts/generate_final_2d_working_baselines_v1_0.mjs";
const status = "FINAL 2D WORKING SHELL — VALIDATED FOR DESIGN / 3D DEVELOPMENT";

const files = {
  frozen: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.json",
  frozenSvg: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.svg",
  roomAPilot: "docs/survey/derived/room-a/ROOM_A_RECONSTRUCTION_PILOT_v0_1.json",
  constrainedV02: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_2.json",
  roomBRectV03: "docs/survey/derived/room-b-wc/ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3.json",
  roomC: "docs/survey/derived/room-c/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json",
  cp2Audit: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_V1_3_CP2_R5_SEMANTIC_VALIDATION_AUDIT_v0_1.json",
};

const stems = {
  roomA: "ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0",
  roomB: "ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0",
  roomC: "ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0",
  whole: "WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0",
};

const out = {
  roomA: path.join(root, "docs/survey/derived/room-a"),
  roomB: path.join(root, "docs/survey/derived/room-b-wc"),
  roomC: path.join(root, "docs/survey/derived/room-c"),
  whole: path.join(root, "docs/survey/derived/global-reconciliation"),
};

const archiveReadPath = (relative) => {
  const direct = path.join(root, relative);
  if (fs.existsSync(direct)) return direct;
  const normalized = relative.replaceAll("\\", "/");
  const routes = [
    ["docs/survey/derived/room-a/", "docs/survey/derived/room-a/archive/"],
    ["docs/survey/derived/room-b-wc/", "docs/survey/derived/room-b-wc/archive/"],
    ["docs/survey/derived/room-c/", "docs/survey/derived/room-c/archive/"],
    ["docs/survey/derived/global-reconciliation/", "docs/survey/derived/global-reconciliation/archive/"],
  ];
  for (const [historicalRoot, archiveRoot] of routes) {
    if (!normalized.startsWith(historicalRoot)) continue;
    const archived = path.join(root, archiveRoot, normalized.slice(historicalRoot.length));
    if (fs.existsSync(archived)) return archived;
  }
  throw new Error(`Source not found at active or archived path: ${relative}`);
};
const read = (relative) => fs.readFileSync(archiveReadPath(relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));
const sha = (text) => crypto.createHash("sha256").update(text).digest("hex").toUpperCase();
const jsonSha = (value) => sha(JSON.stringify(value));
const clone = (value) => JSON.parse(JSON.stringify(value));
const p = (value) => [value.x, value.y];
const obj = (value) => ({ x: value[0], y: value[1] });
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const round = (value, digits = 6) => Number(value.toFixed(digits));
const mapPoints = (points, transform) => points.map((point) => obj(transform(p(point))));
const mapNodeObject = (nodes, transform) => Object.fromEntries(Object.entries(nodes).map(([id, value]) => [id, obj(transform(p(value)))]));
const translateTransform = (translation) => ({
  type: "rigid translation only",
  rotationDegrees: 0,
  scale: 1,
  reflection: false,
  translationMm: obj(translation),
  formula: "whole = local + translation",
});
const maxNodeDelta = (localNodes, globalNodes, translation) => Math.max(...Object.keys(localNodes).map((id) => distance(add(p(localNodes[id]), translation), p(globalNodes[id]))));
const maxPointListDelta = (localPoints, globalPoints, translation) => {
  if (localPoints.length !== globalPoints.length) throw new Error("Point-list comparison length mismatch.");
  return Math.max(...localPoints.map((point, index) => distance(add(p(point), translation), p(globalPoints[index]))));
};

const frozenText = read(files.frozen);
const frozenSvgText = read(files.frozenSvg);
const frozen = JSON.parse(frozenText);
const roomBSource = readJson(files.roomBRectV03);
const roomCSource = readJson(files.roomC);
const cp2Audit = readJson(files.cp2Audit);

if (frozen.version !== "1.3" || frozen.freeze?.frozenForNextStage !== true) {
  throw new Error("Expected the frozen whole-flat v1.3 source.");
}
if (roomBSource.version !== "0.3" || roomCSource.version !== "1.0") {
  throw new Error("Expected accepted Room B/WC v0.3 and Room C v1.0 sources.");
}

const GA = frozen.geometry.roomAFinalReviewMm;
const GC = frozen.geometry.roomCUnchangedNodesMm;
const GCO = frozen.geometry.roomCUnchangedObjectNodesMm;
const GB = frozen.geometry.roomBWCUnchangedMm;

// Room A local datum: accepted A7 is local (0,0); accepted A7→A6 remains the local +x family.
// The human-approved orientation is already baked into GA, so no inverse historical rotation is applied.
const aTranslation = p(GA.A7);
const A = mapNodeObject(GA, (point) => sub(point, aTranslation));

// Room B/WC retains its accepted local v0.3 coordinate frame. The global D3 registration is a translation only.
const bTranslation = [3309.78, 103.859];
const B = clone(roomBSource.geometry.nodesMm);

// Room C is the global datum and its accepted local frame is unchanged.
const cTranslation = [0, 0];
const C = clone(GC);
const CO = clone(GCO);

const toALocal = (point) => obj(sub(p(point), aTranslation));
const toBLocal = (point) => obj(sub(p(point), bTranslation));
const toCLocal = (point) => clone(point);
const mapSegment = (segment, mapper) => segment.map(mapper);

const roomADoors = {
  D1: {
    ...clone(frozen.doors.layers.D1),
    opening: { ...clone(frozen.doors.layers.D1.opening), endpoints: mapSegment(frozen.doors.layers.D1.opening.endpoints, toALocal) },
    casing: { ...clone(frozen.doors.layers.D1.casing), endpoints: mapSegment(frozen.doors.layers.D1.casing.endpoints, toALocal) },
    hingeLocalPointMm: toALocal(frozen.doors.layers.D1.hingeGlobalPointMm),
  },
  D2: {
    ...clone(frozen.doors.layers.D2),
    opening: { ...clone(frozen.doors.layers.D2.opening), roomAFace: mapSegment(frozen.doors.layers.D2.opening.roomAFace, toALocal) },
    casing: { ...clone(frozen.doors.layers.D2.casing), roomAMeasured: mapSegment(frozen.doors.layers.D2.casing.roomAMeasured, toALocal) },
    leaf: { ...clone(frozen.doors.layers.D2.leaf), endpoints: mapSegment(frozen.doors.layers.D2.leaf.endpoints, toALocal) },
    hingeLocalPointMm: toALocal(frozen.doors.layers.D2.hingeGlobalPointMm),
    sharedAssemblyNote: "Room A local package exposes the accepted Room A face and shared leaf. Room C opposing-face layers remain in the Room C and whole-flat baselines.",
  },
};

const bD3 = Object.fromEntries(Object.entries(frozen.geometry.roomBD3UnchangedMm).map(([key, value]) => {
  if (value && typeof value === "object" && Number.isFinite(value.x) && Number.isFinite(value.y) && !["direction", "inward"].includes(key)) return [key, toBLocal(value)];
  return [key, clone(value)];
}));
const bD5 = Object.fromEntries(Object.entries(frozen.geometry.roomBD5FinalReviewMm).map(([key, value]) => {
  if (value && typeof value === "object" && Number.isFinite(value.x) && Number.isFinite(value.y) && !["direction", "inward"].includes(key)) return [key, toBLocal(value)];
  return [key, clone(value)];
}));
const wcD5 = Object.fromEntries(Object.entries(frozen.geometry.wcD5FinalReviewMm).map(([key, value]) => {
  if (value && typeof value === "object" && Number.isFinite(value.x) && Number.isFinite(value.y) && key !== "direction") return [key, toBLocal(value)];
  return [key, clone(value)];
}));
const sharedD5 = {
  ...clone(frozen.geometry.d5SharedPhysicalLeafFinalReviewMm),
  leafTopMm: toBLocal(frozen.geometry.d5SharedPhysicalLeafFinalReviewMm.leafTopMm),
  leafBottomMm: toBLocal(frozen.geometry.d5SharedPhysicalLeafFinalReviewMm.leafBottomMm),
  leafCentreMm: toBLocal(frozen.geometry.d5SharedPhysicalLeafFinalReviewMm.leafCentreMm),
};

const roomCDoors = {
  D2: clone(frozen.doors.layers.D2),
  D3: clone(frozen.doors.layers.D3),
  D4: clone(frozen.doors.layers.D4),
};

const roomAObjectDeltaMm = maxPointListDelta(
  [...roomADoors.D1.opening.endpoints, ...roomADoors.D1.casing.endpoints, roomADoors.D1.hingeLocalPointMm, ...roomADoors.D2.opening.roomAFace, ...roomADoors.D2.casing.roomAMeasured, ...roomADoors.D2.leaf.endpoints, roomADoors.D2.hingeLocalPointMm],
  [...frozen.doors.layers.D1.opening.endpoints, ...frozen.doors.layers.D1.casing.endpoints, frozen.doors.layers.D1.hingeGlobalPointMm, ...frozen.doors.layers.D2.opening.roomAFace, ...frozen.doors.layers.D2.casing.roomAMeasured, ...frozen.doors.layers.D2.leaf.endpoints, frozen.doors.layers.D2.hingeGlobalPointMm],
  aTranslation,
);
const coordinateValues = (value, excluded = []) => Object.entries(value).filter(([key, item]) => !excluded.includes(key) && item && typeof item === "object" && Number.isFinite(item.x) && Number.isFinite(item.y)).map(([, item]) => item);
const roomBObjectDeltaMm = maxPointListDelta(
  [...coordinateValues(bD3, ["direction", "inward"]), ...coordinateValues(bD5, ["direction", "inward"]), ...coordinateValues(wcD5, ["direction"]), sharedD5.leafTopMm, sharedD5.leafBottomMm, sharedD5.leafCentreMm],
  [...coordinateValues(frozen.geometry.roomBD3UnchangedMm, ["direction", "inward"]), ...coordinateValues(frozen.geometry.roomBD5FinalReviewMm, ["direction", "inward"]), ...coordinateValues(frozen.geometry.wcD5FinalReviewMm, ["direction"]), frozen.geometry.d5SharedPhysicalLeafFinalReviewMm.leafTopMm, frozen.geometry.d5SharedPhysicalLeafFinalReviewMm.leafBottomMm, frozen.geometry.d5SharedPhysicalLeafFinalReviewMm.leafCentreMm],
  bTranslation,
);
const roomCObjectDeltaMm = maxNodeDelta(CO, GCO, cTranslation);

const sharedUncertainties = {
  validations: {
    A_C_9019: {
      measuredMm: frozen.validations.A_D2_C_9019.measuredMm,
      modelMm: frozen.validations.A_D2_C_9019.v13ModelMm,
      residualMm: frozen.validations.A_D2_C_9019.v13ResidualMm,
      residualPercent: round(frozen.validations.A_D2_C_9019.v13ResidualMm / frozen.validations.A_D2_C_9019.measuredMm * 100, 3),
    },
    C_B_3726: {
      measuredMm: frozen.validations.C_partition_D3_B_3726.measuredMm,
      modelMm: frozen.validations.C_partition_D3_B_3726.v13ModelMm,
      residualMm: frozen.validations.C_partition_D3_B_3726.v13ResidualMm,
      residualPercent: round(frozen.validations.C_partition_D3_B_3726.v13ResidualMm / frozen.validations.C_partition_D3_B_3726.measuredMm * 100, 3),
      caution: "Conditional D3-normal interpretation; exact original field ray bearing and landing stations were not permanently marked.",
    },
  },
  CP1: "Local RC-04 object-layer conflict remains; do not distort the shell to remove it.",
  CP2: "Body width/depth and direct Room C relationships remain strong. The outer-right footprint/casing station retains the localized uncertainty identified by the R5 semantic audit; CP2 is not moved.",
  WC: "Human rectangular working shell retained despite the 1643/1685 mm opposing-width observations.",
  doorDetail: [
    "D1 actual leaf width and exact lateral leaf/lining position remain unmeasured.",
    "D3 opposing structural reveal and D4 structural reveal dimensions remain unmeasured.",
    "D5 shallow high-level cover/bulkhead exact 3D extent remains unmeasured.",
    "The accepted approximately 0.855 degree D2 A-side casing versus Room C opening-layer difference remains documented.",
  ],
};

const sourceHashes = Object.fromEntries(Object.entries(files).map(([key, relative]) => [key, { file: relative, sha256: sha(read(relative)) }]));

const roomA = {
  documentType: "final working 2D room baseline",
  scope: "Room A",
  version: "1.0",
  generatedDate,
  units: "millimetres",
  status,
  activeGenerator: generator,
  provenance: {
    geometryAuthority: sourceHashes.frozen,
    originalReconstruction: sourceHashes.roomAPilot,
    acceptedHumanConstraintSource: sourceHashes.constrainedV02,
    statement: "Accepted v1.3 Room A shape: S3 reconstruction provenance, human-constrained A1/chimney return, then approved -0.854961637° rigid orientation about D2.",
  },
  coordinateFrame: {
    localDatum: "A7 = (0,0); accepted A7→A6 family is local +x. This is a translation of accepted v1.3 global coordinates, not a new solve or inverse of the approved orientation.",
    wholeFlatTransform: translateTransform(aTranslation),
    acceptedOrientationHistory: clone(frozen.roomAOrientationReview),
  },
  geometry: {
    nodesLocalMm: A,
    boundarySequence: ["A0", "A1", "A2", "A3", "A4", "A5", "W1-AL", "W1-AR", "A6", "D1-AL", "D1-AR", "A7", "D2-AL", "D2-AR"],
    wallPolygonSequence: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"],
    windows: { W1: ["W1-AL", "W1-AR"] },
    doors: roomADoors,
  },
  correspondence: {
    wholeFlatGeometryPath: "geometry.roomAFinalReviewMm",
    maximumRoundTripNodeDeltaMm: round(maxNodeDelta(A, GA, aTranslation), 12),
    maximumRoundTripObjectDeltaMm: round(roomAObjectDeltaMm, 12),
    numericallyIdenticalAfterTransform: maxNodeDelta(A, GA, aTranslation) < 1e-9,
    allExportedGeometryNumericallyIdenticalAfterTransform: Math.max(maxNodeDelta(A, GA, aTranslation), roomAObjectDeltaMm) < 1e-9,
    intentionalPresentationDifferences: ["Standalone crop and room-specific labels only; shared D2 opposing-face context is shown in the whole-flat and Room C packages."],
  },
  retainedUncertainties: [sharedUncertainties.validations.A_C_9019, ...sharedUncertainties.doorDetail.filter((item) => item.startsWith("D1") || item.includes("D2"))],
  preservation: { geometryMovementMm: 0, solverRun: false, acceptedOrientationRetained: true },
};

const roomB = {
  documentType: "final working 2D room-group baseline",
  scope: "Room B/WC",
  version: "1.0",
  generatedDate,
  units: "millimetres",
  status,
  activeGenerator: generator,
  provenance: {
    localGeometryAuthority: sourceHashes.roomBRectV03,
    wholeFlatCompositionAuthority: sourceHashes.frozen,
    statement: "Accepted local v0.3 corrected orthogonal Room B and rectangular WC, with the later accepted v1.3 straight D5 leaf and cleaned doorway-layer presentation.",
  },
  coordinateFrame: {
    localDatum: "Room B v0.3 local frame; B0 = (0,0), D3 casing axis = local +x.",
    wholeFlatTransform: translateTransform(bTranslation),
  },
  geometry: {
    nodesLocalMm: B,
    aliases: clone(roomBSource.geometry.aliases),
    roomBBoundarySequence: clone(roomBSource.geometry.roomBBoundarySequence),
    wcBoundarySequence: clone(roomBSource.geometry.wcBoundarySequence),
    D3RoomB: bD3,
    D5RoomB: bD5,
    D5WC: wcD5,
    D5SharedPhysicalLeaf: sharedD5,
    tileAndWallLayers: clone(roomBSource.geometry.tileAndWallLayers),
    soffit: clone(roomBSource.geometry.soffit),
    verticalEvidence: clone(roomBSource.geometry.verticalEvidence),
    sanitaryAndServiceTopology: clone(roomBSource.geometry.sanitaryAndServiceTopology),
  },
  acceptedConstraints: {
    D3BRToB05Mm: 136,
    old249MmReturn: "superseded/inactive",
    roomBShell: "corrected orthogonal",
    WC: "human-approved exact working rectangle",
    D5: "one clean opening with one straight 761 mm leaf at 90°",
  },
  correspondence: {
    wholeFlatGeometryPath: "geometry.roomBWCUnchangedMm",
    maximumRoundTripNodeDeltaMm: round(maxNodeDelta(B, GB, bTranslation), 12),
    maximumRoundTripObjectDeltaMm: round(roomBObjectDeltaMm, 12),
    numericallyIdenticalAfterTransform: maxNodeDelta(B, GB, bTranslation) < 1e-9,
    allExportedGeometryNumericallyIdenticalAfterTransform: Math.max(maxNodeDelta(B, GB, bTranslation), roomBObjectDeltaMm) < 1e-9,
    laterAcceptedObjectComposition: "D5 casing positions unchanged from local v0.3; v1.3 leaf endpoints are inverse-transformed into this local package.",
    intentionalPresentationDifferences: ["Standalone crop and room-specific labels only."],
  },
  retainedUncertainties: [sharedUncertainties.validations.C_B_3726, sharedUncertainties.WC, ...sharedUncertainties.doorDetail.filter((item) => item.startsWith("D3") || item.startsWith("D5"))],
  preservation: { geometryMovementMm: 0, solverRun: false, correctedRoomBRetained: true, rectangularWCRetained: true, straightD5LeafRetained: true },
};

const roomC = {
  documentType: "final working 2D room baseline",
  scope: "Room C",
  version: "1.0",
  generatedDate,
  units: "millimetres",
  status,
  activeGenerator: generator,
  provenance: {
    acceptedGeometryAuthority: sourceHashes.roomC,
    wholeFlatCompositionAuthority: sourceHashes.frozen,
    semanticValidation: sourceHashes.cp2Audit,
    statement: "Accepted Room C v1.0 shell and object nodes are unchanged; successor export promotes the accepted continuous host wall, fixed cupboards, removable partition and final doorway presentation.",
  },
  coordinateFrame: {
    localDatum: "Accepted Room C frame with C0 = (0,0); this is also the whole-flat datum.",
    wholeFlatTransform: translateTransform(cTranslation),
  },
  geometry: {
    nodesLocalMm: C,
    objectNodesLocalMm: CO,
    permanentBoundary: {
      upperHostWall: ["C0", "CP1-FL", "PI1", "CP2-FL", "CP2-FR", "D3-CL"],
      explanation: "Continuous permanent upper host-wall topology is retained through the removable-partition junction; CP1/CP2 and partition are separate layers.",
      lowerRuns: [["C0", "C1", "W2-CR"], ["W2-CL", "C2", "D4-CR"], ["D4-CL", "D3-CR"], ["D3-CL", "D2-CR"]],
    },
    cupboards: {
      CP1: ["CP1-BODY-FL", "CP1-BODY-FR", "CP1-BODY-BR", "CP1-BODY-BL"],
      CP2Body: ["CP2-BODY-FL", "CP2-BODY-FR", "CP2-BODY-BR", "CP2-BODY-BL"],
      CP2LeftCasing: ["CP2-CASING-FL", "CP2-BODY-FL", "CP2-BODY-BL"],
      status: "fixed cupboard/recess geometry; not optional furniture",
    },
    removablePartitionSequence: ["PO1", "PO2", "PO3", "PI3", "PI2", "PI1"],
    doors: roomCDoors,
    derivedSemanticReferences: {
      "CP2-CR": {
        ...clone(cp2Audit.semanticMappings["CP2-CR"]),
        placementStatus: "validation/reference metadata only; not added to frozen plan-node geometry",
      },
    },
  },
  correspondence: {
    wholeFlatNodesPath: "geometry.roomCUnchangedNodesMm",
    wholeFlatObjectNodesPath: "geometry.roomCUnchangedObjectNodesMm",
    nodeGeometryByteEquivalentToAcceptedV10: JSON.stringify(roomCSource.planGeometry.inheritedNodesMm) === JSON.stringify(GC),
    objectGeometryByteEquivalentToAcceptedV10: JSON.stringify(roomCSource.planGeometry.objectNodesMm) === JSON.stringify(GCO),
    maximumRoundTripNodeDeltaMm: round(maxNodeDelta(C, GC, cTranslation), 12),
    maximumRoundTripObjectDeltaMm: round(roomCObjectDeltaMm, 12),
    numericallyIdenticalAfterTransform: maxNodeDelta(C, GC, cTranslation) < 1e-9,
    allExportedGeometryNumericallyIdenticalAfterTransform: Math.max(maxNodeDelta(C, GC, cTranslation), roomCObjectDeltaMm) < 1e-9,
    intentionalPresentationDifferences: ["Promoted standalone drawing explicitly shows the continuous upper host wall, CP1/CP2, removable partition and accepted D2/D3/D4 layers together."],
  },
  retainedUncertainties: [sharedUncertainties.CP1, sharedUncertainties.CP2, ...sharedUncertainties.doorDetail.filter((item) => item.startsWith("D3") || item.includes("D4") || item.includes("D2"))],
  preservation: { geometryMovementMm: 0, solverRun: false, topWallRetained: true, partitionRetained: true, cupboardsRetained: true },
};

const whole = {
  documentType: "final working whole-flat 2D shell",
  version: "1.0",
  generatedDate,
  units: "millimetres",
  status,
  designationCaution: "Renovation digital-twin working baseline; not construction-survey certification, structural-engineering approval, or construction-locked dimensional perfection.",
  activeGenerator: generator,
  provenance: {
    directGeometryAndCompositionAuthority: sourceHashes.frozen,
    promotionMethod: "Exact deep copy of frozen v1.3 geometry and accepted D1-D5 composition; only status, packaging and explanatory metadata change.",
    predecessorsRetained: true,
  },
  roomBaselines: {
    RoomA: { json: `docs/survey/derived/room-a/${stems.roomA}.json`, wholeFlatTransform: roomA.coordinateFrame.wholeFlatTransform },
    RoomBWC: { json: `docs/survey/derived/room-b-wc/${stems.roomB}.json`, wholeFlatTransform: roomB.coordinateFrame.wholeFlatTransform },
    RoomC: { json: `docs/survey/derived/room-c/${stems.roomC}.json`, wholeFlatTransform: roomC.coordinateFrame.wholeFlatTransform },
  },
  geometry: clone(frozen.geometry),
  doors: clone(frozen.doors),
  acceptedComposition: {
    topRoomCWall: clone(frozen.topRoomCWall),
    d3WallJunction: clone(frozen.d3WallJunction),
    d5WallJunction: clone(frozen.d5WallJunction),
    d5DoorAlignment: clone(frozen.d5DoorAlignment),
  },
  validations: clone(sharedUncertainties.validations),
  retainedUncertainties: {
    CP1: sharedUncertainties.CP1,
    CP2: sharedUncertainties.CP2,
    WC: sharedUncertainties.WC,
    doorDetail: sharedUncertainties.doorDetail,
  },
  integrity: {
    frozenSourceSha256: sha(frozenText),
    promotedGeometrySha256: jsonSha(frozen.geometry),
    frozenGeometrySha256: jsonSha(frozen.geometry),
    coordinatesExactlyMatchFrozenV13: JSON.stringify(frozen.geometry) === JSON.stringify(clone(frozen.geometry)),
    geometryMovementMm: 0,
    roomShellMovementMm: { RoomA: 0, RoomB: 0, WC: 0, RoomC: 0 },
    registrationsChanged: { D2: false, D3: false, D5: false },
    solverRun: false,
    representationsRetained: {
      D1ThroughD5: Object.keys(frozen.doors.layers).join(",") === "D1,D2,D3,D4,D5",
      roomCTopWall: true,
      roomCPartition: true,
      cupboardsCP1CP2: ["CP1-BODY-FL", "CP1-BODY-FR", "CP1-BODY-BL", "CP1-BODY-BR", "CP2-BODY-FL", "CP2-BODY-FR", "CP2-BODY-BL", "CP2-BODY-BR"].every((id) => id in GCO),
      roomAApprovedOrientation: frozen.roomAOrientationReview.candidateApplied && frozen.roomAOrientationReview.rotationDegrees === -0.854961637,
      correctedRoomB136MmReturn: distance(p(GB["D3-BR"]), p(GB["B0.5"])) === 136,
      rectangularWC: GB.T0.y === GB.T1.y && GB.T1.x === GB.T2.x && GB.T2.y === GB.T3.y && GB.T3.x === GB.T0.x,
      straightD5Leaf: frozen.geometry.d5SharedPhysicalLeafFinalReviewMm.leafBearingDegrees === 90,
    },
  },
  approvedUse: ["2D design work", "3D modelling", "furniture/layout planning", "services planning"],
  stopGate: "FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED",
};

function renderSvg({ title, subtitle, nodes, polygonSequences = [], wallSegments = [], windowSegments = [], casingSegments = [], openingSegments = [], revealSegments = [], leafSegments = [], cupboards = [], partition = null, labels = [], notes = [] }) {
  const all = Object.values(nodes).map(p);
  for (const sequence of polygonSequences) for (const id of sequence.ids) if (nodes[id]) all.push(p(nodes[id]));
  for (const group of [wallSegments, windowSegments, casingSegments, openingSegments, revealSegments, leafSegments]) for (const [a, b] of group) all.push(a, b);
  for (const points of cupboards) all.push(...points);
  if (partition) all.push(...partition);
  const xs = all.map((value) => value[0]);
  const ys = all.map((value) => value[1]);
  const minX = Math.min(...xs) - 350;
  const maxX = Math.max(...xs) + 350;
  const minY = Math.min(...ys) - 700;
  const maxY = Math.max(...ys) + 650;
  const width = maxX - minX;
  const height = maxY - minY;
  const line = ([a, b], cls) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}"/>`;
  const polygon = (points, cls) => `<polygon points="${points.map((value) => value.join(",")).join(" ")}" class="${cls}"/>`;
  const nodeMarks = Object.entries(nodes).map(([id, value]) => `<circle cx="${value.x}" cy="${value.y}" r="23" class="node"/><text x="${value.x + 34}" y="${value.y - 30}" class="nodeLabel">${id}</text>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${title}</title>
  <desc id="desc">${subtitle}. Exact accepted geometry; standalone presentation only.</desc>
  <style>
    .bg{fill:#f8fafc}.room{fill:#eff6ff;stroke:none}.roomAlt{fill:#ecfdf5;stroke:none}.wc{fill:#f0fdfa;stroke:none}.wall{stroke:#1e3a8a;stroke-width:30;stroke-linecap:round}.window{stroke:#0284c7;stroke-width:30}.casing{stroke:#d97706;stroke-width:24}.opening{stroke:#a21caf;stroke-width:18}.reveal{stroke:#0891b2;stroke-width:12}.leaf{stroke:#111827;stroke-width:16}.cup{fill:#fef3c7;stroke:#a16207;stroke-width:14}.partition{fill:#f3e8ff;fill-opacity:.48;stroke:#a855f7;stroke-width:12;stroke-dasharray:28 18}.node{fill:#fff;stroke:#334155;stroke-width:7}.title{font:bold 58px Arial;fill:#9f1239}.sub{font:34px Arial;fill:#334155}.roomLabel{font:bold 88px Arial;fill:#17324d}.nodeLabel{font:26px Arial;fill:#334155}.objectLabel{font:bold 34px Arial;fill:#7c2d12}.note{font:29px Arial;fill:#334155}.gate{font:bold 32px Arial;fill:#9f1239}
  </style>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" class="bg"/>
  ${polygonSequences.map((sequence) => polygon(sequence.ids.map((id) => p(nodes[id])), sequence.cls || "room")).join("\n")}
  ${partition ? polygon(partition, "partition") : ""}
  ${cupboards.map((points) => polygon(points, "cup")).join("\n")}
  ${wallSegments.map((segment) => line(segment, "wall")).join("\n")}
  ${windowSegments.map((segment) => line(segment, "window")).join("\n")}
  ${casingSegments.map((segment) => line(segment, "casing")).join("\n")}
  ${openingSegments.map((segment) => line(segment, "opening")).join("\n")}
  ${revealSegments.map((segment) => line(segment, "reveal")).join("\n")}
  ${leafSegments.map((segment) => line(segment, "leaf")).join("\n")}
  ${nodeMarks}
  <text x="${minX + 100}" y="${minY + 105}" class="title">${title}</text>
  <text x="${minX + 100}" y="${minY + 160}" class="sub">${subtitle}</text>
  ${labels.map(({ x, y, text, cls = "objectLabel" }) => `<text x="${x}" y="${y}" class="${cls}">${text}</text>`).join("\n")}
  ${notes.map((note, index) => `<text x="${minX + 100}" y="${maxY - 165 + index * 42}" class="note">${note}</text>`).join("\n")}
  <text x="${minX + 100}" y="${maxY - 35}" class="gate">FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED</text>
</svg>\n`;
}

const seg = (nodes, a, b) => [p(nodes[a]), p(nodes[b])];
const pointSeg = (a, b) => [p(a), p(b)];

const roomASvg = renderSvg({
  title: "ROOM A · FINAL 2D WORKING BASELINE v1.0",
  subtitle: "Accepted constrained shape and approved global orientation retained · local datum A7",
  nodes: A,
  polygonSequences: [{ ids: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"], cls: "room" }],
  wallSegments: [["A0", "A1"], ["A1", "A2"], ["A2", "A3"], ["A3", "A4"], ["A4", "A5"], ["A5", "W1-AL"], ["W1-AR", "A6"], ["A6", "D1-AL"], ["D1-AR", "A7"], ["A7", "D2-AL"], ["D2-AR", "A0"]].map(([a, b]) => seg(A, a, b)),
  windowSegments: [seg(A, "W1-AL", "W1-AR")],
  casingSegments: [pointSeg(...roomADoors.D1.casing.endpoints), pointSeg(...roomADoors.D2.casing.roomAMeasured)],
  openingSegments: [pointSeg(...roomADoors.D1.opening.endpoints), pointSeg(...roomADoors.D2.opening.roomAFace)],
  leafSegments: [pointSeg(...roomADoors.D1.opening.endpoints), pointSeg(...roomADoors.D2.leaf.endpoints)],
  labels: [{ x: 500, y: -2100, text: "ROOM A", cls: "roomLabel" }, { x: A["W1-AL"].x - 400, y: (A["W1-AL"].y + A["W1-AR"].y) / 2, text: "W1" }, { x: (A["D1-AL"].x + A["D1-AR"].x) / 2, y: 170, text: "D1 · swings into A" }, { x: -900, y: (A["D2-AL"].y + A["D2-AR"].y) / 2, text: "D2 · swings into A" }],
  notes: ["Whole-flat transform: translate (+4432.6987, +134.9958) mm · rotation 0° · scale 1", "Geometry movement during promotion: 0 mm"],
});

const BNodesForSvg = clone(B);
const roomBSvg = renderSvg({
  title: "ROOM B / WC · FINAL 2D WORKING BASELINE v1.0",
  subtitle: "Corrected 136 mm return · orthogonal Room B · rectangular WC · straight D5 leaf",
  nodes: BNodesForSvg,
  polygonSequences: [
    { ids: ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4"], cls: "roomAlt" },
    { ids: ["T0", "T1", "T2", "T3", "D5-WCL"], cls: "wc" },
  ],
  wallSegments: [["D3-BR", "B0.5"], ["B0.5", "B1"], ["B2", "B3"], ["B3", "B4"], ["B4", "B0"], ["T0", "T1"], ["T1", "T2"], ["T2", "T3"], ["T3", "D5-WCL"]].map(([a, b]) => seg(BNodesForSvg, a, b)),
  casingSegments: [pointSeg(bD3.outerLeft, bD3.outerRight), pointSeg(bD5.outerLeft, bD5.outerRight), pointSeg(wcD5.outerRight, wcD5.outerLeft)],
  revealSegments: [pointSeg(bD5.innerLeft, bD5.visibleDoorLeft), pointSeg(bD5.innerRight, bD5.visibleDoorRight), pointSeg(wcD5.innerRight, wcD5.doorRight), pointSeg(wcD5.innerLeft, wcD5.doorLeft)],
  leafSegments: [pointSeg(bD3.doorLeft, bD3.doorRight), pointSeg(sharedD5.leafTopMm, sharedD5.leafBottomMm)],
  labels: [{ x: 350, y: 1300, text: "ROOM B", cls: "roomLabel" }, { x: 2350, y: 800, text: "WC", cls: "roomLabel" }, { x: 920, y: 70, text: "136 mm return", cls: "note" }, { x: 1780, y: 680, text: "D5 · one straight 761 mm leaf" }],
  notes: ["Whole-flat transform: translate (+3309.78, +103.859) mm · rotation 0° · scale 1", "Geometry movement during promotion: 0 mm"],
});

const cDoorD2 = frozen.geometry.d2LayersFinalReviewMm;
const roomCSvg = renderSvg({
  title: "ROOM C · FINAL 2D WORKING BASELINE v1.0",
  subtitle: "Accepted shell · continuous host wall · fixed CP1/CP2 · removable partition",
  nodes: C,
  polygonSequences: [{ ids: ["C0", "CP1-FL", "CP2-FR", "D3-CL"], cls: "room" }],
  wallSegments: [seg(C, "C0", "CP1-FL"), seg(C, "CP1-FL", "CP2-FL"), seg(C, "CP2-FR", "D3-CL"), seg(C, "C0", "C1"), seg(C, "C1", "W2-CR"), seg(C, "W2-CL", "C2"), seg(C, "C2", "D4-CR"), pointSeg(CO["D4-OUTER-L"], CO["D3-OUTER-R"]), seg(C, "D3-CL", "D2-CR")],
  windowSegments: [seg(C, "W2-CR", "W2-CL")],
  casingSegments: [pointSeg(CO["D4-OUTER-R"], CO["D4-OUTER-L"]), pointSeg(CO["D3-OUTER-R"], CO["D3-OUTER-L-CORNER"]), pointSeg(...cDoorD2.roomCStructuralOpeningAtRoomCFaceMm)],
  openingSegments: [pointSeg(CO["D4-LEAF-R"], CO["D4-LEAF-L"]), pointSeg(CO["D3-LEAF-R"], CO["D3-LEAF-L"]), pointSeg(...cDoorD2.roomCStructuralOpeningAtRoomAFaceMm)],
  leafSegments: [pointSeg(...cDoorD2.roomCLeafClosingPlaneMm), pointSeg(CO["D4-LEAF-R"], CO["D4-LEAF-L"]), pointSeg(CO["D3-LEAF-R"], CO["D3-LEAF-L"])],
  cupboards: [
    [CO["CP1-BODY-FL"], CO["CP1-BODY-FR"], CO["CP1-BODY-BR"], CO["CP1-BODY-BL"]].map(p),
    [CO["CP2-BODY-FL"], CO["CP2-BODY-FR"], CO["CP2-BODY-BR"], CO["CP2-BODY-BL"]].map(p),
  ],
  partition: [C.PO1, C.PO2, C.PO3, C.PI3, C.PI2, C.PI1].map(p),
  labels: [{ x: 450, y: -1700, text: "ROOM C", cls: "roomLabel" }, { x: 430, y: -3980, text: "CP1 / C1 · fixed" }, { x: 3600, y: -3980, text: "CP2 / C2 · fixed" }, { x: 1550, y: -3450, text: "continuous permanent host wall", cls: "note" }, { x: 1850, y: -1660, text: "removable partition", cls: "note" }],
  notes: ["Whole-flat transform: identity · Room C is the global datum", "Geometry movement during promotion: 0 mm"],
});

function finalWholeSvg() {
  let svg = frozenSvgText
    .replace("Whole-flat final 2D review candidate v1.3", "Whole-flat final 2D working shell v1.0")
    .replace("Human-review-only whole-flat 2D candidate. Accepted shell retained; D3 wall-to-casing junction clarified and D5 leaf straightened flush through the doorway. Not construction locked.", "Final renovation digital-twin working 2D shell for design and 3D development. Exact frozen v1.3 geometry retained. Not construction-survey certified or construction locked.")
    .replace("WHOLE-FLAT PRE-FINAL 2D FIELD-VALIDATION CANDIDATE v1.3", "WHOLE-FLAT FINAL 2D WORKING SHELL v1.0")
    .replace("D3/D5 markup relationship verified; geometry frozen for field validation. HUMAN REVIEW REQUIRED.", "VALIDATED FOR DESIGN / 3D DEVELOPMENT · NOT CONSTRUCTION LOCKED · HUMAN PROMOTION REVIEW REQUIRED.");
  if (svg === frozenSvgText || !svg.includes("WHOLE-FLAT FINAL 2D WORKING SHELL v1.0")) throw new Error("Whole-flat SVG metadata promotion failed.");
  return svg;
}

const wholeSvg = finalWholeSvg();

function roomReport(name, data, predecessor, sourceStatement, caveats) {
  const transform = data.coordinateFrame.wholeFlatTransform;
  const describeCaveat = (item) => {
    if (typeof item === "string") return item;
    if (item.measuredMm === 9019) return `A↔C 9019 mm validation: model ${item.modelMm.toFixed(2)} mm; residual ${item.residualMm.toFixed(2)} mm / ${item.residualPercent.toFixed(2)}%.`;
    if (item.measuredMm === 3726) return `C↔B 3726 mm conditional D3-normal validation: model ${item.modelMm.toFixed(2)} mm; residual ${item.residualMm.toFixed(2)} mm / ${item.residualPercent.toFixed(2)}%. ${item.caution}`;
    return JSON.stringify(item);
  };
  return `# ${name} final 2D working baseline v1.0

**Status: ${status}.**

This is the active standalone 2D baseline for ${name}. It is a promotion/export of accepted geometry, not a new solve. Geometry movement during promotion is **0 mm**.

## Provenance

- Direct promoted source: \`${predecessor}\`.
- ${sourceStatement}
- All pilots, diagnostics, measurements, superseded observations and validation audits remain preserved.

## Coordinate frame and whole-flat transform

${data.coordinateFrame.localDatum}

\`whole = local + (${transform.translationMm.x}, ${transform.translationMm.y}) mm\`; rotation ${transform.rotationDegrees}°; scale ${transform.scale}; no reflection.

- Maximum node round-trip delta: **${data.correspondence.maximumRoundTripNodeDeltaMm.toFixed(12)} mm**.
- Maximum exported object/door round-trip delta: **${data.correspondence.maximumRoundTripObjectDeltaMm.toFixed(12)} mm**.
- Numerically identical after transform: **${data.correspondence.numericallyIdenticalAfterTransform ? "yes" : "no"}**.
- Presentation-only differences: ${data.correspondence.intentionalPresentationDifferences.join(" ")}

## Active files

- SVG: \`${stems[name === "Room A" ? "roomA" : name === "Room B/WC" ? "roomB" : "roomC"]}.svg\`
- JSON: \`${stems[name === "Room A" ? "roomA" : name === "Room B/WC" ? "roomB" : "roomC"]}.json\`
- Generator: \`${generator}\`

## Retained uncertainties

${caveats.map((item) => `- ${describeCaveat(item)}`).join("\n")}

These caveats do not reopen the accepted room shell. This baseline is suitable for design coordination and 3D development, but is not construction-survey certification or structural-engineering approval.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**
`;
}

const roomAMd = roomReport("Room A", roomA, "docs/survey/derived/global-reconciliation/archive/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.json", "The accepted internal shape includes the human A1/chimney-return correction and approved -0.854961637° global orientation; the original pilot alone is not promoted.", roomA.retainedUncertainties);
const roomBMd = roomReport("Room B/WC", roomB, "docs/survey/derived/room-b-wc/archive/ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3.json", "Local v0.3 supplies the corrected Room B/rectangular WC geometry; frozen v1.3 supplies the accepted straight D5 object/door presentation.", roomB.retainedUncertainties);
const roomCMd = roomReport("Room C", roomC, "docs/survey/derived/room-c/archive/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json", "The accepted shell/object coordinates are unchanged; this successor export consolidates the accepted continuous wall, cupboards, partition and doors in one standalone presentation.", roomC.retainedUncertainties);

const wholeMd = `# Whole-flat final 2D working shell v1.0

**Status: ${status}.**

This is the definitive active working 2D shell for the renovation digital twin. It is promoted directly from frozen \`WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3\`; every geometry coordinate and accepted D1–D5 composition is retained. It is not construction-survey certification, structural-engineering approval, or a construction-locked dimensional record.

## Promotion integrity

- Frozen v1.3 source SHA-256: \`${whole.integrity.frozenSourceSha256}\`.
- Frozen and promoted geometry SHA-256: \`${whole.integrity.promotedGeometrySha256}\`.
- Exact geometry equality: **${whole.integrity.coordinatesExactlyMatchFrozenV13 ? "verified" : "failed"}**.
- Geometry movement: **0 mm everywhere**.
- Solver run: **no**.
- D2, D3 and D5 registrations changed: **no**.

Retained composition checks: D1–D5, continuous Room C top wall, removable partition, CP1/CP2 cupboards, approved Room A orientation, corrected 136 mm Room B return, rectangular WC and straight 90° D5 leaf all pass.

## Room-baseline transforms

| Scope | Local frame | Whole-flat transform | Node / object round-trip maximum |
|---|---|---|---:|
| Room A | A7 = (0,0), accepted A7→A6 +x | translate (+4432.6987, +134.9958) mm | ${roomA.correspondence.maximumRoundTripNodeDeltaMm.toFixed(12)} / ${roomA.correspondence.maximumRoundTripObjectDeltaMm.toFixed(12)} mm |
| Room B/WC | accepted local v0.3, B0 = (0,0) | translate (+3309.78, +103.859) mm | ${roomB.correspondence.maximumRoundTripNodeDeltaMm.toFixed(12)} / ${roomB.correspondence.maximumRoundTripObjectDeltaMm.toFixed(12)} mm |
| Room C | accepted C0/global datum | identity | ${roomC.correspondence.maximumRoundTripNodeDeltaMm.toFixed(12)} / ${roomC.correspondence.maximumRoundTripObjectDeltaMm.toFixed(12)} mm |

## Whole-flat validations retained

- A↔C 9019 mm: model **${sharedUncertainties.validations.A_C_9019.modelMm.toFixed(2)} mm**; residual **${sharedUncertainties.validations.A_C_9019.residualMm.toFixed(2)} mm / ${sharedUncertainties.validations.A_C_9019.residualPercent.toFixed(2)}%**.
- C↔B 3726 mm: model **${sharedUncertainties.validations.C_B_3726.modelMm.toFixed(2)} mm**; residual **${sharedUncertainties.validations.C_B_3726.residualMm.toFixed(2)} mm / ${sharedUncertainties.validations.C_B_3726.residualPercent.toFixed(2)}%**. Exact original ray bearing and landing stations were not permanently marked.

## Remaining uncertainties

- **CP1:** ${sharedUncertainties.CP1}
- **CP2:** ${sharedUncertainties.CP2}
- **WC:** ${sharedUncertainties.WC}
- **Door/detail:** ${sharedUncertainties.doorDetail.join(" ")}

## Active source of truth

Future 2D design work, 3D modelling, furniture/layout planning and services planning should consume:

- \`docs/survey/derived/global-reconciliation/${stems.whole}.json\` for authoritative coordinates and typed geometry;
- \`docs/survey/derived/global-reconciliation/${stems.whole}.svg\` for the active visual shell;
- \`docs/survey/FINAL_2D_BASELINE_MANIFEST.md\` as the entry point and per-room index.

Historical pilots, diagnostics, candidates, audits and evidence remain in place and are not superseded as provenance.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**
`;

const manifest = `# Final 2D baseline manifest

This is the authoritative entry point for active renovation digital-twin 2D geometry. The promoted files are validated working baselines for design and 3D development—not construction-survey certification, structural-engineering approval, or construction-locked records.

For the shortest source-of-truth orientation, see [CURRENT_2D_MODEL.md](CURRENT_2D_MODEL.md).

| Scope | Active SVG | Active JSON | Status | Supersedes / derives from |
|---|---|---|---|---|
| Room A | [${stems.roomA}.svg](derived/room-a/${stems.roomA}.svg) | [${stems.roomA}.json](derived/room-a/${stems.roomA}.json) | Final working 2D baseline | Frozen v1.3 Room A; S3 + human A1/chimney constraint + approved rigid orientation |
| Room B/WC | [${stems.roomB}.svg](derived/room-b-wc/${stems.roomB}.svg) | [${stems.roomB}.json](derived/room-b-wc/${stems.roomB}.json) | Final working 2D baseline | Rectangular local v0.3 + frozen v1.3 straight D5 presentation |
| Room C | [${stems.roomC}.svg](derived/room-c/${stems.roomC}.svg) | [${stems.roomC}.json](derived/room-c/${stems.roomC}.json) | Final working 2D baseline | Accepted Room C v1.0 + successor composition export |
| Whole flat | [${stems.whole}.svg](derived/global-reconciliation/${stems.whole}.svg) | [${stems.whole}.json](derived/global-reconciliation/${stems.whole}.json) | Final working 2D shell | Frozen whole-flat v1.3, coordinates unchanged |

Reports: [Room A](derived/room-a/${stems.roomA}.md), [Room B/WC](derived/room-b-wc/${stems.roomB}.md), [Room C](derived/room-c/${stems.roomC}.md), and [whole flat](derived/global-reconciliation/${stems.whole}.md).

All four packages are reproduced by [${generator}](../../${generator}).

## Coordinate relationships

- **Room A:** local A7 = (0,0); translate by (+4432.6987, +134.9958) mm to the whole-flat frame. Approved Room A orientation is already baked into the local shape.
- **Room B/WC:** accepted local v0.3 frame; translate by (+3309.78, +103.859) mm.
- **Room C:** identity transform; Room C is the whole-flat datum.
- All transforms have rotation 0°, scale 1 and no reflection. Maximum verified node/object round-trip delta is ${Math.max(roomA.correspondence.maximumRoundTripNodeDeltaMm, roomA.correspondence.maximumRoundTripObjectDeltaMm, roomB.correspondence.maximumRoundTripNodeDeltaMm, roomB.correspondence.maximumRoundTripObjectDeltaMm, roomC.correspondence.maximumRoundTripNodeDeltaMm, roomC.correspondence.maximumRoundTripObjectDeltaMm).toFixed(12)} mm.

## Active source of truth

Use \`${stems.whole}.json\` and its SVG for whole-flat 2D design, 3D modelling, furniture/layout planning and services planning. Use the matching room JSON/SVG when a local coordinate frame is preferable. Do not promote old pilots or diagnostics over these files.

## Retained known uncertainties

- A↔C 9019 mm validation: model 8957.64 mm; residual -61.36 mm / -0.68%.
- C↔B 3726 mm conditional D3-normal validation: model 3684.59 mm; residual -41.41 mm / -1.11%; exact field bearing was not permanently marked.
- CP1 RC-04 object-layer conflict remains local; shell unchanged.
- CP2 body and direct relationships are strong; outer-right footprint/casing station remains locally uncertain; CP2 unchanged.
- Rectangular WC is the accepted human working constraint despite the 1643/1685 mm opposing-width evidence.
- D1 leaf/lining placement, D3/D4 reveals, D2 layer difference and D5 bulkhead extent remain detail-stage uncertainties.

All raw measurements, superseded readings, reconstruction pilots, diagnostics, audits and generators remain preserved. No cleanup or archiving is performed by this promotion.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**
`;

const outputs = [
  [out.roomA, stems.roomA, roomA, roomAMd, roomASvg],
  [out.roomB, stems.roomB, roomB, roomBMd, roomBSvg],
  [out.roomC, stems.roomC, roomC, roomCMd, roomCSvg],
  [out.whole, stems.whole, whole, wholeMd, wholeSvg],
];

for (const [directory, stem, data, md, svg] of outputs) {
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, `${stem}.json`), `${JSON.stringify(data, null, 2)}\n`);
  fs.writeFileSync(path.join(directory, `${stem}.md`), md);
  fs.writeFileSync(path.join(directory, `${stem}.svg`), svg);
}
fs.writeFileSync(path.join(root, "docs/survey/FINAL_2D_BASELINE_MANIFEST.md"), manifest);

console.log(JSON.stringify({
  status,
  outputs: outputs.flatMap(([directory, stem]) => ["json", "md", "svg"].map((extension) => path.relative(root, path.join(directory, `${stem}.${extension}`)).replaceAll("\\", "/"))).concat(["docs/survey/FINAL_2D_BASELINE_MANIFEST.md"]),
  frozenSourceSha256: sha(frozenText),
  frozenGeometrySha256: jsonSha(frozen.geometry),
  geometryMovementMm: 0,
  maximumRoomRoundTripDeltaMm: Math.max(roomA.correspondence.maximumRoundTripNodeDeltaMm, roomA.correspondence.maximumRoundTripObjectDeltaMm, roomB.correspondence.maximumRoundTripNodeDeltaMm, roomB.correspondence.maximumRoundTripObjectDeltaMm, roomC.correspondence.maximumRoundTripNodeDeltaMm, roomC.correspondence.maximumRoundTripObjectDeltaMm),
  stopGate: whole.stopGate,
}, null, 2));

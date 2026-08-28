import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const relativePaths = {
  whole: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json",
  roomA: "docs/survey/derived/room-a/ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.json",
  roomB: "docs/survey/derived/room-b-wc/ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.json",
  roomC: "docs/survey/derived/room-c/ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.json",
  vertical: "data/3d/vertical-model-v0_1.json",
  validation: "data/3d/survey-validation-v0_1.json",
};

const readSource = (relativePath) => {
  const text = fs.readFileSync(path.join(root, relativePath), "utf8");
  return { text, data: JSON.parse(text), sha256: crypto.createHash("sha256").update(text).digest("hex").toUpperCase() };
};

const sources = Object.fromEntries(Object.entries(relativePaths).map(([key, value]) => [key, readSource(value)]));
const { whole, roomA, roomB, roomC, vertical, validation } = Object.fromEntries(Object.entries(sources).map(([key, value]) => [key, value.data]));

if (whole.units !== "millimetres" || vertical.units !== "millimetres" || validation.units !== "millimetres") throw new Error("The first 3D shell requires millimetre source data.");
if (whole.integrity.geometryMovementMm !== 0 || whole.integrity.solverRun !== false) throw new Error("The promoted whole-flat authority failed its frozen-geometry integrity gate.");
if (whole.integrity.promotedGeometrySha256 !== "BF90135506785ABAB61FD79F37616F33F00EB2C6B6CEEDF01CFF1846465B90C0") throw new Error("Unexpected promoted whole-flat geometry hash.");

const points = {
  ...whole.geometry.roomAFinalReviewMm,
  ...whole.geometry.roomCUnchangedNodesMm,
  ...whole.geometry.roomCUnchangedObjectNodesMm,
  ...whole.geometry.roomBWCUnchangedMm,
};
const point = (id) => {
  const value = points[id];
  if (!value) throw new Error(`Missing promoted whole-flat point: ${id}`);
  return { x: value.x, y: value.y };
};
const pair = (a, b) => [point(a), point(b)];
const directPair = (value) => value.map(({ x, y }) => ({ x, y }));
const featurePair = (a, b) => [{ ...point(a), id: a }, { ...point(b), id: b }];
const pointDistance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pointAtDistance = (endpoints, distanceMm) => {
  const [start, end] = endpoints;
  const length = pointDistance(start, end);
  return {
    x: start.x + (end.x - start.x) * distanceMm / length,
    y: start.y + (end.y - start.y) * distanceMm / length,
  };
};
const alignPair = (reference, candidate) => pointDistance(reference[0], candidate[0]) + pointDistance(reference[1], candidate[1]) <= pointDistance(reference[0], candidate[1]) + pointDistance(reference[1], candidate[0]) ? candidate : [candidate[1], candidate[0]];
const projectPointOntoLine = (coordinate, endpoints) => {
  const [start, end] = endpoints;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const factor = ((coordinate.x - start.x) * dx + (coordinate.y - start.y) * dy) / (dx * dx + dy * dy);
  return { x: start.x + factor * dx, y: start.y + factor * dy };
};

function validateLocalTransform(localData, wholePoints, label) {
  const transform = localData.coordinateFrame.wholeFlatTransform;
  if (transform.rotationDegrees !== 0 || transform.scale !== 1 || transform.reflection) throw new Error(`${label} has an unsupported promoted transform.`);
  let maximum = 0;
  for (const [id, local] of Object.entries(localData.geometry.nodesLocalMm)) {
    if (!wholePoints[id]) continue;
    const dx = local.x + transform.translationMm.x - wholePoints[id].x;
    const dy = local.y + transform.translationMm.y - wholePoints[id].y;
    maximum = Math.max(maximum, Math.hypot(dx, dy));
  }
  if (maximum > 1e-6) throw new Error(`${label} active-local to whole-flat coordinate mismatch: ${maximum} mm.`);
  return maximum;
}

const transformChecks = {
  RoomA: validateLocalTransform(roomA, whole.geometry.roomAFinalReviewMm, "Room A"),
  RoomBWC: validateLocalTransform(roomB, whole.geometry.roomBWCUnchangedMm, "Room B/WC"),
  RoomC: validateLocalTransform(roomC, whole.geometry.roomCUnchangedNodesMm, "Room C"),
};

const roomANodeIds = new Set(Object.keys(whole.geometry.roomAFinalReviewMm));
const roomCNodeIds = new Set(Object.keys(whole.geometry.roomCUnchangedNodesMm));
const roomCObjectNodeIds = new Set(Object.keys(whole.geometry.roomCUnchangedObjectNodesMm));
const roomAObjectIds = new Set(["D2-A-FACE-R", "D2-A-FACE-L", "D2-LEAF-A-FACE-R-INFERRED", "D2-LEAF-A-FACE-L-INFERRED"]);
const wcNodeIds = new Set(["T0", "T1", "T2", "T3", "D5-WCL"]);
const nodeRoom = (id) => roomANodeIds.has(id) || roomAObjectIds.has(id) ? "ROOM-A"
  : roomCNodeIds.has(id) || roomCObjectNodeIds.has(id) ? "ROOM-C"
    : wcNodeIds.has(id) ? "WC" : "ROOM-B";
const fallbackNodeDescription = (id) => {
  const roomName = nodeRoom(id).replace("ROOM-", "Room ");
  if (id.includes("LEAF")) return `${roomName} ${id} door-leaf reference`;
  if (id.includes("OPENING") || id.includes("FACE")) return `${roomName} ${id} opening/object-layer reference`;
  if (id.startsWith("CP")) return `${roomName} ${id} fixed cupboard/recess reference`;
  if (/^(PO|PI)/.test(id)) return `${roomName} ${id} removable-partition face reference`;
  if (/^[DWT]/.test(id)) return `${roomName} ${id} measured opening/casing reference`;
  return `${roomName} ${id} permanent shell reference`;
};
const validationNodes = Object.entries(points).map(([id, value]) => ({
  id,
  roomId: nodeRoom(id),
  classification: id.startsWith("PO") || id.startsWith("PI") ? "existing-removable" : "existing-permanent",
  coordinateMm: { x: value.x, y: value.y, elevation: validation.nodeElevationMm },
  description: validation.nodeDescriptions[id] ?? fallbackNodeDescription(id),
  sourceCollection: roomANodeIds.has(id) ? "whole.geometry.roomAFinalReviewMm"
    : roomCNodeIds.has(id) ? "whole.geometry.roomCUnchangedNodesMm"
      : roomCObjectNodeIds.has(id) ? "whole.geometry.roomCUnchangedObjectNodesMm"
        : "whole.geometry.roomBWCUnchangedMm",
}));
const validationNodeById = Object.fromEntries(validationNodes.map((node) => [node.id, node]));
const repositoryMeasurements = validation.repositoryMeasurements.map((measurement) => {
  const from = validationNodeById[measurement.from];
  const to = validationNodeById[measurement.to];
  if (!from || !to) throw new Error(`Repository measurement ${measurement.id} references an unmapped endpoint.`);
  const modelPlanDistanceMm = pointDistance(from.coordinateMm, to.coordinateMm);
  return {
    ...measurement,
    category: "repository-field-observation",
    endpoints: [from.coordinateMm, to.coordinateMm],
    endpointDescriptions: [from.description, to.description],
    modelPlanDistanceMm,
    residualMm: modelPlanDistanceMm - measurement.recordedMm,
  };
});

const sourceNodeMaximumDeltaMm = validationNodes.reduce((maximum, node) => {
  const source = points[node.id];
  return Math.max(maximum, Math.hypot(node.coordinateMm.x - source.x, node.coordinateMm.y - source.y));
}, 0);
const heights = vertical.roomCeilings;
const roomPolygons = [
  { id: "ROOM-A", name: "Room A", classification: "existing-permanent", ceilingHeightMm: heights.RoomA.modelHeightMm, points: ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"].map(point) },
  { id: "ROOM-C", name: "Room C", classification: "existing-permanent", ceilingHeightMm: heights.RoomC.modelHeightMm, points: ["C0", "CP1-FL", "CP2-FR", "D3-CL", "D3-CR", "D4-CL", "D4-CR", "C2", "W2-CL", "W2-CR", "C1"].map(point) },
  { id: "ROOM-B", name: "Room B", classification: "existing-permanent", ceilingHeightMm: heights.RoomB.modelHeightMm, points: roomB.geometry.roomBBoundarySequence.map(point) },
  { id: "WC", name: "WC", classification: "existing-permanent", ceilingHeightMm: heights.WC.modelHeightMm, points: roomB.geometry.wcBoundarySequence.map(point) },
];

const walls = [];
const finishedFaceMetadata = (roomFacingSide) => ({
  authoritativeFinishedFaceAligned: true,
  sourceDatumMeaning: "authoritative surveyed finished-wall face",
  roomFacingSide,
  visualThicknessMm: vertical.renderConventions.wallVisualThicknessMm,
  roomFacingPlaneOffsetMm: 0,
  oppositeFaceStatus: "schematic visual thickness; not a surveyed opposite face",
});
const addWall = (id, roomId, endpoints, topMm, roomFacingSide) => walls.push({
  id,
  roomId,
  classification: "existing-permanent",
  endpoints,
  bottomMm: 0,
  topMm,
  sourceFeatureIds: endpoints.map((value) => value.id).filter(Boolean),
  ...finishedFaceMetadata(roomFacingSide),
});
const idsPair = featurePair;

[
  ["A0", "A1"], ["A1", "A2"], ["A2", "A3"], ["A3", "A4"], ["A4", "A5"],
  ["A5", "W1-AL"], ["W1-AR", "A6"], ["A6", "D1-AL"], ["D1-AR", "A7"],
  ["A7", "D2-AL"], ["D2-AR", "A0"],
].forEach(([a, b], index) => addWall(`ROOM-A-WALL-${String(index + 1).padStart(2, "0")}`, "ROOM-A", idsPair(a, b), heights.RoomA.modelHeightMm, "left"));

[
  ["D3-BR", "B0.5"], ["B0.5", "B1"], ["B2", "B3"], ["B3", "B4"], ["B4", "B0"],
].forEach(([a, b], index) => addWall(`ROOM-B-WALL-${String(index + 1).padStart(2, "0")}`, "ROOM-B", idsPair(a, b), heights.RoomB.modelHeightMm, "left"));

[
  ["T0", "T1"], ["T1", "T2"], ["T2", "T3"], ["T3", "D5-WCL"],
].forEach(([a, b], index) => addWall(`WC-WALL-${String(index + 1).padStart(2, "0")}`, "WC", idsPair(a, b), heights.WC.modelHeightMm, "left"));

const roomCWalls = [
  ["C0", "CP1-BODY-FL"],
  ["CP1-BODY-FL", "CP1-BODY-BL"], ["CP1-BODY-BL", "CP1-BODY-BR"], ["CP1-BODY-BR", "CP1-BODY-FR"],
  ["CP1-BODY-FR", "CP2-CASING-FL"],
  ["CP2-CASING-FL", "CP2-BODY-FL"],
  ["CP2-BODY-FL", "CP2-BODY-BL"], ["CP2-BODY-BL", "CP2-BODY-BR"], ["CP2-BODY-BR", "CP2-BODY-FR"],
  ["CP2-BODY-FR", "D2-OPENING-L-INFERRED"],
  ["C0", "C1"], ["C1", "W2-CR"], ["W2-CL", "C2"], ["C2", "D4-CR"],
  ["D4-OUTER-L", "D3-OUTER-R"], ["D3-CL", "D2-CR"],
];
roomCWalls.forEach(([a, b], index) => addWall(
  `ROOM-C-WALL-${String(index + 1).padStart(2, "0")}`,
  "ROOM-C",
  idsPair(a, b),
  heights.RoomC.modelHeightMm,
  index < 10 ? "left" : "right",
));

const doors = whole.doors.layers;
const openingConfigs = vertical.doors;
const bD3 = whole.geometry.roomBD3UnchangedMm;
const bD5 = whole.geometry.roomBD5FinalReviewMm;
const wcD5 = whole.geometry.wcD5FinalReviewMm;
const doorFaces = [
  {
    id: "D1-A", doorId: "D1", roomId: "ROOM-A", outerEndpoints: idsPair("D1-AL", "D1-AR"),
    clearEndpoints: directPair(doors.D1.opening.endpoints), openingHeightMm: openingConfigs.D1.openingHeightMm,
    casingTopMm: openingConfigs.D1.casingTopMm, ceilingHeightMm: heights.RoomA.modelHeightMm, casingStatus: "measured Room A outer casing", wallRoomFacingSide: "left",
  },
  {
    id: "D2-A", doorId: "D2", roomId: "ROOM-A", outerEndpoints: idsPair("D2-AL", "D2-AR"),
    clearEndpoints: directPair(doors.D2.opening.roomAFace), openingHeightMm: openingConfigs.D2.openingHeightMm,
    casingTopMm: openingConfigs.D2.casingTopMm, ceilingHeightMm: heights.RoomA.modelHeightMm, casingStatus: "measured Room A outer casing", wallRoomFacingSide: "left",
  },
  {
    id: "D2-C", doorId: "D2", roomId: "ROOM-C", outerEndpoints: directPair(doors.D2.opening.roomCFace),
    clearEndpoints: directPair(doors.D2.opening.roomCFace), openingHeightMm: openingConfigs.D2.openingHeightMm,
    casingTopMm: null, ceilingHeightMm: heights.RoomC.modelHeightMm, casingStatus: openingConfigs.D2.roomCCasingStatus, wallRoomFacingSide: "right",
  },
  {
    id: "D3-C", doorId: "D3", roomId: "ROOM-C", outerEndpoints: directPair(doors.D3.casing.roomCEndpoints),
    clearEndpoints: directPair(doors.D3.leaf.endpoints), openingHeightMm: openingConfigs.D3.openingHeightMm,
    casingTopMm: openingConfigs.D3.casingTopMm, ceilingHeightMm: heights.RoomC.modelHeightMm, casingStatus: "approximate 45/80/80 mm Room C casing", wallRoomFacingSide: "right",
  },
  {
    id: "D3-B", doorId: "D3", roomId: "ROOM-B", outerEndpoints: directPair(doors.D3.casing.roomBEndpoints),
    clearEndpoints: directPair([bD3.doorLeft, bD3.doorRight]), openingHeightMm: 1975,
    casingTopMm: openingConfigs.D3.roomBCasingTopMm, ceilingHeightMm: heights.RoomB.modelHeightMm, casingStatus: "measured Room B face", wallRoomFacingSide: "left",
  },
  {
    id: "D4-C", doorId: "D4", roomId: "ROOM-C", outerEndpoints: directPair(doors.D4.casing.endpoints),
    clearEndpoints: directPair(doors.D4.leaf.endpoints), openingHeightMm: openingConfigs.D4.openingHeightMm,
    casingTopMm: openingConfigs.D4.casingTopMm, ceilingHeightMm: heights.RoomC.modelHeightMm, casingStatus: "measured 80/80/80 mm casing", wallRoomFacingSide: "right",
  },
  {
    id: "D5-B", doorId: "D5", roomId: "ROOM-B", outerEndpoints: directPair(doors.D5.casing.roomBEndpoints),
    clearEndpoints: directPair([bD5.visibleDoorLeft, bD5.visibleDoorRight]), openingHeightMm: openingConfigs.D5.openingHeightMm,
    casingTopMm: openingConfigs.D5.roomBCasingTopMm, ceilingHeightMm: heights.RoomB.modelHeightMm, casingStatus: "measured Room B face", wallRoomFacingSide: "right",
  },
  {
    id: "D5-WC", doorId: "D5", roomId: "WC", outerEndpoints: directPair(doors.D5.casing.wcEndpoints),
    clearEndpoints: directPair([wcD5.doorRight, wcD5.doorLeft]), openingHeightMm: openingConfigs.D5.openingHeightMm,
    casingTopMm: openingConfigs.D5.wcCasingTopMm, ceilingHeightMm: heights.WC.modelHeightMm, casingStatus: "measured WC face", wallRoomFacingSide: "right",
    casingAboveDoorTopMm: openingConfigs.D5.wcCasingAboveDoorTopMm,
    casingProjectionMm: openingConfigs.D5.wcCasingProjectionMm,
    observedCasingTopToCeilingMm: openingConfigs.D5.wcObservedCasingTopToCeilingMm,
    selectedCeilingModelClearanceMm: openingConfigs.D5.wcSelectedCeilingModelClearanceMm,
    casingRoomFacingSide: "left",
    wallHeadDatum: "WC permanent wall / outer-casing-boundary plane",
    wallHeadRoomFacingSide: "left",
  },
].map((value) => {
  const clearEndpoints = alignPair(value.outerEndpoints, value.clearEndpoints);
  return {
    ...value,
    clearEndpoints,
    ...(value.wallHeadDatum ? {
      wallHeadEndpoints: clearEndpoints.map((coordinate) => projectPointOntoLine(coordinate, value.outerEndpoints)),
    } : {}),
    classification: "existing-permanent",
    wallFaceMetadata: finishedFaceMetadata(value.wallRoomFacingSide),
    ...(value.wallHeadRoomFacingSide ? { wallHeadFaceMetadata: finishedFaceMetadata(value.wallHeadRoomFacingSide) } : {}),
  };
});

const doorReveals = [
  {
    id: "D2-THROUGH-REVEAL", doorId: "D2", classification: "existing-permanent",
    faceA: directPair(doors.D2.opening.roomAFace), faceB: directPair(doors.D2.opening.roomCFace),
    bottomMm: 0, topMm: openingConfigs.D2.openingHeightMm,
    status: "one continuous through-opening across the accepted approximately 250 mm A-C wall depth",
  },
  {
    id: "D3-THROUGH-REVEAL", doorId: "D3", classification: "existing-permanent",
    faceA: directPair([bD3.doorLeft, bD3.doorRight]), faceB: directPair(doors.D3.leaf.endpoints),
    bottomMm: 0, topMm: Math.min(1975, openingConfigs.D3.openingHeightMm),
    status: "simple reveal between accepted opposing doorway faces; structural reveal detail remains unmeasured",
  },
  {
    id: "D5-THROUGH-REVEAL", doorId: "D5", classification: "existing-permanent",
    faceA: directPair([bD5.visibleDoorLeft, bD5.visibleDoorRight]), faceB: directPair([wcD5.doorRight, wcD5.doorLeft]),
    bottomMm: 0, topMm: openingConfigs.D5.openingHeightMm,
    status: "simple reveal across the accepted Room B/WC casing-face separation",
  },
].map((value) => ({ ...value, faceB: alignPair(value.faceA, value.faceB) }));

const doorLeaves = [
  { id: "D1", endpoints: directPair(doors.D1.opening.endpoints), heightMm: openingConfigs.D1.leafHeightMm, status: "clear-opening-width proxy" },
  { id: "D2", endpoints: directPair(doors.D2.leaf.endpoints), heightMm: openingConfigs.D2.leafHeightMm, status: "measured leaf" },
  { id: "D3", endpoints: directPair(doors.D3.leaf.endpoints), heightMm: openingConfigs.D3.leafHeightMm, status: "measured leaf" },
  { id: "D4", endpoints: directPair(doors.D4.leaf.endpoints), heightMm: openingConfigs.D4.leafHeightMm, status: "measured leaf" },
  { id: "D5", endpoints: directPair(doors.D5.leaf.endpoints), heightMm: openingConfigs.D5.leafHeightMm, status: "measured shared physical leaf" },
].map((value) => ({ ...value, classification: "existing-permanent", bottomMm: 0, sourceFeatureId: value.id }));

const windows = [
  { id: "W1", roomId: "ROOM-A", endpoints: pair("W1-AL", "W1-AR"), wallRoomFacingSide: "left", ...vertical.windows.W1 },
  { id: "W2", roomId: "ROOM-C", endpoints: pair("W2-CR", "W2-CL"), wallRoomFacingSide: "right", ...vertical.windows.W2 },
].map((value) => ({
  ...value,
  classification: "existing-permanent",
  wallFaceMetadata: finishedFaceMetadata(value.wallRoomFacingSide),
}));

const w2 = windows.find(({ id }) => id === "W2");
const w2MainWallEndpoints = pair("C1", "C2");
const w2RecessDepthMm = w2.endpoints[0].y - w2MainWallEndpoints[0].y;
const w2InfillBase = {
  windowId: "W2",
  roomId: "ROOM-C",
  classification: "existing-permanent",
  endpoints: w2MainWallEndpoints,
  sourceFeatureIds: ["C1", "C2"],
  recessedWindowEdgeIds: ["W2-CR", "W2-CL"],
  depthMm: w2RecessDepthMm,
  backPlaneMeaning: "protected recessed W2 frame/casing plane",
  ...finishedFaceMetadata(w2.wallRoomFacingSide),
  visualThicknessMm: w2RecessDepthMm,
  oppositeFaceStatus: "protected recessed W2 frame/casing plane derived from unchanged W2 XY datum",
};
const windowWallInfills = [
  {
    ...w2InfillBase,
    id: "W2-C-UPPER-WALL-INFILL",
    position: "upper",
    bottomMm: w2.headMm,
    topMm: heights.RoomC.modelHeightMm,
    modelHeightMm: heights.RoomC.modelHeightMm - w2.headMm,
    observedHeightMm: w2.observedUpperWallStripHeightMm,
    fieldModelClosureDifferenceMm: heights.RoomC.modelHeightMm - w2.headMm - w2.observedUpperWallStripHeightMm,
    evidenceStatus: w2.observedUpperWallStripStatus,
  },
  {
    ...w2InfillBase,
    id: "W2-C-LOWER-WALL-INFILL",
    position: "lower",
    bottomMm: 0,
    topMm: w2.sillMm,
    modelHeightMm: w2.sillMm,
    evidenceStatus: w2.verticalPlacementStatus,
  },
];

const cp1 = roomC.geometry.cupboards.CP1.map(point);
const cp2 = roomC.geometry.cupboards.CP2Body.map(point);
const cp1LowerEvidence = vertical.cupboards.CP1.lowerServiceEnclosure;
const cp1FrontageEndpoints = pair("CP1-FL", "PO1");
const cp1FrontageLengthMm = pointDistance(...cp1FrontageEndpoints);
const cp1LeftStationMm = cp1LowerEvidence.cp1FLToLeftOuterCasingMm;
const cp1RightStationMm = cp1FrontageLengthMm - cp1LowerEvidence.po1ToRightOuterCasingMm;
const cp1StationImpliedAssemblyWidthMm = cp1RightStationMm - cp1LeftStationMm;
const cp1StationClosureResidualMm = cp1StationImpliedAssemblyWidthMm - cp1LowerEvidence.accessAssemblyWidthMm;
const cp1DoorOuterLeftDistanceMm = cp1LeftStationMm;
const cp1DoorOuterRightDistanceMm = cp1DoorOuterLeftDistanceMm + cp1LowerEvidence.accessAssemblyWidthMm;
const cp1ComponentClearanceMm = (
  cp1LowerEvidence.accessAssemblyWidthMm
  - cp1LowerEvidence.leftCasingWidthMm
  - cp1LowerEvidence.accessLeafWidthMm
  - cp1LowerEvidence.rightCasingWidthMm
) / 2;
const cp1DoorOuterLeft = pointAtDistance(cp1FrontageEndpoints, cp1DoorOuterLeftDistanceMm);
const cp1DoorOuterRight = pointAtDistance(cp1FrontageEndpoints, cp1DoorOuterRightDistanceMm);
const cp1LeftCasingInner = pointAtDistance(cp1FrontageEndpoints, cp1DoorOuterLeftDistanceMm + cp1LowerEvidence.leftCasingWidthMm);
const cp1RightCasingInner = pointAtDistance(cp1FrontageEndpoints, cp1DoorOuterRightDistanceMm - cp1LowerEvidence.rightCasingWidthMm);
const cp1DoorLeafLeft = pointAtDistance(cp1FrontageEndpoints, cp1DoorOuterLeftDistanceMm + cp1LowerEvidence.leftCasingWidthMm + cp1ComponentClearanceMm);
const cp1DoorLeafRight = pointAtDistance(cp1FrontageEndpoints, cp1DoorOuterRightDistanceMm - cp1LowerEvidence.rightCasingWidthMm - cp1ComponentClearanceMm);
const cp1FrontageDirection = {
  x: (cp1FrontageEndpoints[1].x - cp1FrontageEndpoints[0].x) / cp1FrontageLengthMm,
  y: (cp1FrontageEndpoints[1].y - cp1FrontageEndpoints[0].y) / cp1FrontageLengthMm,
};
const cp1ServiceAreaMidpoint = pointAtDistance(
  cp1FrontageEndpoints,
  cp1FrontageLengthMm - cp1LowerEvidence.po1ToRightOuterCasingMm / 2,
);
const cp1LowerServiceAssembly = {
  id: "CP1-LOWER-SERVICE-ASSEMBLY",
  roomId: "ROOM-C",
  classification: "existing-permanent",
  componentClass: "existing-joinery-and-service-reference",
  sourceFeatureIds: ["CP1-FL", "PO1"],
  frontageEndpoints: cp1FrontageEndpoints,
  frontageLengthMm: cp1FrontageLengthMm,
  panel: {
    id: "CP1-LOWER-SERVICE-ENCLOSURE",
    depthMm: cp1LowerEvidence.panelDepthMm,
    bottomMm: cp1LowerEvidence.panelBaseMm,
    topMm: cp1LowerEvidence.panelTopMm,
    roomFacingSide: "left",
    frontFaceAligned: true,
    fragments: [
      { id: "CP1-LOWER-SERVICE-ENCLOSURE-LEFT", endpoints: [cp1FrontageEndpoints[0], cp1DoorOuterLeft], bottomMm: cp1LowerEvidence.panelBaseMm, topMm: cp1LowerEvidence.panelTopMm },
      { id: "CP1-LOWER-SERVICE-ENCLOSURE-RIGHT", endpoints: [cp1DoorOuterRight, cp1FrontageEndpoints[1]], bottomMm: cp1LowerEvidence.panelBaseMm, topMm: cp1LowerEvidence.panelTopMm },
      { id: "CP1-LOWER-SERVICE-ENCLOSURE-ABOVE-DOOR", endpoints: [cp1DoorOuterLeft, cp1DoorOuterRight], bottomMm: cp1LowerEvidence.accessHeightMm, topMm: cp1LowerEvidence.panelTopMm },
    ],
  },
  accessDoor: {
    id: "CP1-LOWER-ACCESS-DOOR",
    outerEndpoints: [cp1DoorOuterLeft, cp1DoorOuterRight],
    bottomMm: 0,
    topMm: cp1LowerEvidence.accessHeightMm,
    depthMm: cp1LowerEvidence.panelDepthMm,
    roomFacingSide: "left",
    frontFaceAligned: true,
    assemblyWidthMm: cp1LowerEvidence.accessAssemblyWidthMm,
    leaf: { id: "CP1-LOWER-ACCESS-DOOR-LEAF", endpoints: [cp1DoorLeafLeft, cp1DoorLeafRight], widthMm: cp1LowerEvidence.accessLeafWidthMm },
    casings: [
      { id: "CP1-LOWER-ACCESS-CASING-L", endpoints: [cp1DoorOuterLeft, cp1LeftCasingInner], widthMm: cp1LowerEvidence.leftCasingWidthMm },
      { id: "CP1-LOWER-ACCESS-CASING-R", endpoints: [cp1RightCasingInner, cp1DoorOuterRight], widthMm: cp1LowerEvidence.rightCasingWidthMm },
    ],
    sideClearanceMm: cp1ComponentClearanceMm,
    topCasingPresent: cp1LowerEvidence.topCasingPresent,
    closed: true,
    placement: {
      control: "CP1-FL left-hand station",
      leftOuterDistanceFromCP1FLMm: cp1DoorOuterLeftDistanceMm,
      rightOuterDistanceFromPO1Mm: cp1FrontageLengthMm - cp1DoorOuterRightDistanceMm,
      observedLeftOuterDistanceFromCP1FLMm: cp1LowerEvidence.cp1FLToLeftOuterCasingMm,
      observedRightOuterDistanceFromPO1Mm: cp1LowerEvidence.po1ToRightOuterCasingMm,
      rightStationResidualMm: cp1FrontageLengthMm - cp1DoorOuterRightDistanceMm - cp1LowerEvidence.po1ToRightOuterCasingMm,
      stationImpliedAssemblyWidthMm: cp1StationImpliedAssemblyWidthMm,
      stationClosureResidualMm: cp1StationClosureResidualMm,
      note: cp1LowerEvidence.placementControl,
      conflictingRightStationStatus: cp1LowerEvidence.conflictingRightStationStatus,
    },
  },
  lip: {
    id: "CP1-LOWER-LIP",
    endpoints: cp1FrontageEndpoints,
    bottomMm: vertical.cupboards.CP1.bodyBaseMm - cp1LowerEvidence.lipHeightMm,
    topMm: vertical.cupboards.CP1.bodyBaseMm,
    projectionMm: cp1LowerEvidence.lipProjectionMm,
    roomFacingSide: "left",
    sourcePlaneBackAligned: true,
  },
  waterInletReference: {
    id: "CP1-WATER-INLET-REFERENCE",
    coordinate: {
      x: cp1ServiceAreaMidpoint.x + cp1FrontageDirection.y * 30,
      y: cp1ServiceAreaMidpoint.y - cp1FrontageDirection.x * 30,
    },
    bottomMm: 0,
    topMm: cp1LowerEvidence.waterInletReferenceHeightMm,
    visualDiameterMm: cp1LowerEvidence.waterInletVisualDiameterMm,
    locationStatus: cp1LowerEvidence.waterInletLocationStatus,
  },
  futureDesignNote: cp1LowerEvidence.futureDesignNote,
};
const roomExtensions = [
  { id: "CP1-INTERNAL-RECESS", roomId: "ROOM-C", classification: "existing-permanent", ceilingHeightMm: heights.RoomC.modelHeightMm, points: cp1 },
  { id: "CP2-INTERNAL-RECESS", roomId: "ROOM-C", classification: "existing-permanent", ceilingHeightMm: heights.RoomC.modelHeightMm, points: cp2 },
];
const cupboards = [
  {
    id: "CP1", name: "CP1 fixed suspended open cupboard", classification: "existing-permanent", points: cp1,
    cavityBaseMm: vertical.cupboards.CP1.bodyBaseMm,
    cavityTopMm: vertical.cupboards.CP1.bodyBaseMm + vertical.cupboards.CP1.bodyHeightMm,
    panelThicknessMm: vertical.renderConventions.cupboardPanelThicknessMm,
    topCasingMm: vertical.cupboards.CP1.topTrimHeightMm,
    upperClosure: null,
    openFront: true,
    sourceFeatureIds: roomC.geometry.cupboards.CP1,
  },
  {
    id: "CP2", name: "CP2 fixed open cupboard with enclosed upper build-up", classification: "existing-permanent", points: cp2,
    cavityBaseMm: vertical.cupboards.CP2.bodyBaseMm,
    cavityTopMm: vertical.cupboards.CP2.bodyTopMm,
    panelThicknessMm: vertical.renderConventions.cupboardPanelThicknessMm,
    topCasingMm: null,
    upperClosure: {
      baseMm: vertical.cupboards.CP2.bodyTopMm,
      topMm: vertical.cupboards.CP2.upperClosureTopMm,
      status: vertical.cupboards.CP2.upperClosureStatus,
    },
    openFront: true,
    sourceFeatureIds: roomC.geometry.cupboards.CP2Body,
  },
];
const volumes = [
  {
    id: "ROOM-C-REMOVABLE-PARTITION", name: "Current Room C removable partition", classification: "existing-removable",
    points: roomC.geometry.removablePartitionSequence.map(point), baseMm: vertical.removablePartition.baseMm, topMm: vertical.removablePartition.topMm,
    sourceFeatureIds: roomC.geometry.removablePartitionSequence,
  },
];

const geometryValidation = {
  toleranceMm: 0.000001,
  validationNodeCount: validationNodes.length,
  roomBoundaryPointCount: roomPolygons.reduce((sum, room) => sum + room.points.length, 0),
  openingEndpointCount: doorFaces.reduce((sum, face) => sum + face.clearEndpoints.length, 0),
  cupboardFootprintPointCount: cupboards.reduce((sum, cupboard) => sum + cupboard.points.length, 0),
  maximumSourceNodeDeltaMm: sourceNodeMaximumDeltaMm,
  maximumActiveLocalTransformDeltaMm: Math.max(...Object.values(transformChecks)),
  status: "generated coordinates match the promoted source geometry within tolerance",
};

const output = {
  documentType: "deterministic first 3D construction shell",
  version: "0.1",
  generatedDate: whole.generatedDate,
  status: "FIRST 3D CONSTRUCTION SHELL — HUMAN VISUAL REVIEW REQUIRED",
  classificationVocabulary: ["existing-permanent", "existing-removable", "proposed"],
  sourceAuthority: {
    horizontalGeometry: relativePaths.whole,
    horizontalGeometrySha256: sources.whole.sha256,
    promotedGeometrySha256: whole.integrity.promotedGeometrySha256,
    topologyAndFeatureGrouping: [relativePaths.roomA, relativePaths.roomB, relativePaths.roomC],
    verticalModel: relativePaths.vertical,
    surveyValidationModel: relativePaths.validation,
    sourceFiles: Object.fromEntries(Object.entries(relativePaths).map(([key, value]) => [key, { path: value, sha256: sources[key].sha256 }])),
    transformChecksMaximumDeltaMm: transformChecks,
  },
  coordinateSystem: vertical.coordinateConvention,
  renderConventions: vertical.renderConventions,
  verticalModel: {
    roomCeilings: vertical.roomCeilings,
    doors: vertical.doors,
    windows: vertical.windows,
    cupboards: vertical.cupboards,
    removablePartition: vertical.removablePartition,
  },
  assumptions: [
    "Each room uses one documented flat working ceiling plane selected from a measured station; differing station readings remain preserved in the vertical model.",
    "Wall/floor/ceiling/leaf thicknesses are visual renderer conventions, not concealed-construction measurements.",
    vertical.doors.D1.leafHeightStatus,
    vertical.doors.D2.openingHeightStatus,
    vertical.windows.W1.verticalPlacementStatus,
    vertical.cupboards.CP2.bodyBaseStatus,
    vertical.cupboards.CP2.upperClosureStatus,
    vertical.removablePartition.heightStatus,
  ],
  deferredFeatures: vertical.deferredFeatures,
  surveyValidation: {
    nodes: validationNodes,
    repositoryMeasurements,
    assumptions: validation.assumptions,
    excludedMeasurementClasses: validation.excludedMeasurementClasses,
    geometryValidation,
  },
  rooms: roomPolygons,
  roomExtensions,
  walls,
  doorFaces,
  doorReveals,
  doorLeaves,
  windows,
  windowWallInfills,
  cupboards,
  cp1LowerServiceAssembly,
  volumes,
  designStageNotes: [{
    id: "CP1-LOWER-ENCLOSURE-POTENTIAL-ALTERATION",
    scopeFeatureId: cp1LowerServiceAssembly.id,
    status: "design-stage possibility only; no existing-condition removal",
    note: cp1LowerEvidence.futureDesignNote,
  }],
};

const finitePoints = [
  ...output.rooms.flatMap((feature) => feature.points),
  ...output.roomExtensions.flatMap((feature) => feature.points),
  ...output.walls.flatMap((feature) => feature.endpoints),
  ...output.doorFaces.flatMap((feature) => [...feature.outerEndpoints, ...feature.clearEndpoints, ...(feature.wallHeadEndpoints ?? [])]),
  ...output.doorReveals.flatMap((feature) => [...feature.faceA, ...feature.faceB]),
  ...output.doorLeaves.flatMap((feature) => feature.endpoints),
  ...output.windows.flatMap((feature) => feature.endpoints),
  ...output.windowWallInfills.flatMap((feature) => feature.endpoints),
  ...output.cupboards.flatMap((feature) => feature.points),
  ...output.cp1LowerServiceAssembly.panel.fragments.flatMap((feature) => feature.endpoints),
  ...output.cp1LowerServiceAssembly.accessDoor.casings.flatMap((feature) => feature.endpoints),
  ...output.cp1LowerServiceAssembly.accessDoor.leaf.endpoints,
  ...output.cp1LowerServiceAssembly.lip.endpoints,
  output.cp1LowerServiceAssembly.waterInletReference.coordinate,
  ...output.volumes.flatMap((feature) => feature.points),
];
if (finitePoints.some(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y))) throw new Error("Generated shell contains a non-finite plan coordinate.");
if (geometryValidation.maximumSourceNodeDeltaMm > geometryValidation.toleranceMm || geometryValidation.maximumActiveLocalTransformDeltaMm > geometryValidation.toleranceMm) throw new Error("Generated validation geometry no longer matches promoted source coordinates.");
if (repositoryMeasurements.some(({ modelPlanDistanceMm, recordedMm }) => !Number.isFinite(modelPlanDistanceMm) || !Number.isFinite(recordedMm))) throw new Error("Generated repository measurement overlay contains an invalid distance.");
if (output.doorFaces.some(({ openingHeightMm, ceilingHeightMm }) => openingHeightMm <= 0 || openingHeightMm >= ceilingHeightMm)) throw new Error("Generated shell contains an invalid door opening height.");
if (output.windows.some(({ sillMm, headMm, roomId }) => sillMm < 0 || headMm <= sillMm || headMm >= output.rooms.find((room) => room.id === roomId).ceilingHeightMm)) throw new Error("Generated shell contains an invalid window vertical chain.");
if (output.windowWallInfills.some(({ bottomMm, topMm, depthMm }) => bottomMm < 0 || topMm <= bottomMm || depthMm <= 0)) throw new Error("Generated shell contains invalid window wall-infill geometry.");
if (output.volumes.some(({ baseMm, topMm }) => baseMm < 0 || topMm <= baseMm)) throw new Error("Generated shell contains an invalid fixed/removable volume height.");
if (output.cupboards.some(({ cavityBaseMm, cavityTopMm }) => cavityBaseMm < 0 || cavityTopMm <= cavityBaseMm)) throw new Error("Generated shell contains an invalid cupboard cavity height.");
if (output.cp1LowerServiceAssembly.accessDoor.topCasingPresent !== false) throw new Error("CP1 lower access door must not generate a top casing.");
if (Math.abs(output.cp1LowerServiceAssembly.accessDoor.placement.stationClosureResidualMm - 50.7) > 0.001) throw new Error("CP1 lower access-door station conflict changed unexpectedly.");
if (output.cp1LowerServiceAssembly.classification === "proposed") throw new Error("The CP1 lower service assembly must remain existing-condition geometry.");
if ([...output.rooms, ...output.roomExtensions, ...output.walls, ...output.doorFaces, ...output.doorReveals, ...output.doorLeaves, ...output.windows, ...output.windowWallInfills, ...output.cupboards, ...output.volumes].some(({ classification }) => classification === "proposed")) throw new Error("The first existing-condition shell must not contain proposed geometry.");
if ([...output.walls, ...output.doorFaces, ...output.cupboards, ...output.volumes].some(({ id }) => id.includes("SOFFIT"))) throw new Error("Room B soffit geometry must remain deferred in v0.1.");
const d2FaceA = output.doorFaces.find(({ id }) => id === "D2-A");
const d2FaceC = output.doorFaces.find(({ id }) => id === "D2-C");
const d2Reveal = output.doorReveals.find(({ id }) => id === "D2-THROUGH-REVEAL");
if (!d2FaceA || !d2FaceC || !d2Reveal || d2Reveal.topMm !== d2FaceA.openingHeightMm || d2Reveal.topMm !== d2FaceC.openingHeightMm) throw new Error("D2 through-opening continuity gate failed.");
if (output.walls.some(({ endpoints }) => {
  const ids = endpoints.map(({ id }) => id).filter(Boolean);
  return ids.includes("CP2-BODY-FR") && ids.includes("D3-CL");
})) throw new Error("A Room C wall still spans across the D2 opening.");

const outputPath = path.join(root, "public/generated/flat-shell-v0_1.json");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify({ output: path.relative(root, outputPath).replaceAll("\\", "/"), rooms: output.rooms.length, roomExtensions: output.roomExtensions.length, walls: output.walls.length, doorFaces: output.doorFaces.length, throughReveals: output.doorReveals.length, doors: output.doorLeaves.length, windows: output.windows.length, windowWallInfills: output.windowWallInfills.length, cupboards: output.cupboards.length, cp1LowerServiceAssembly: Boolean(output.cp1LowerServiceAssembly), volumes: output.volumes.length, validationNodes: validationNodes.length, repositoryMeasurements: repositoryMeasurements.length, transformChecksMaximumDeltaMm: transformChecks, geometryValidationMaximumDeltaMm: Math.max(geometryValidation.maximumSourceNodeDeltaMm, geometryValidation.maximumActiveLocalTransformDeltaMm) }, null, 2));

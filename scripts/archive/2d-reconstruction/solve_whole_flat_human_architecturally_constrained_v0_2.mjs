#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const sourceRelative = "docs/survey/derived/global-reconciliation/WHOLE_FLAT_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_1.json";
const predecessorFamilyRelatives = {
  json: sourceRelative,
  report: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_1.md",
  cleanSvg: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_1.svg",
  diagnosticSvg: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_1_DIAGNOSTIC.svg",
  generator: "scripts/solve_whole_flat_architecturally_constrained_v0_1.mjs",
};
const roomARelative = "docs/survey/derived/room-a/ROOM_A_RECONSTRUCTION_PILOT_v0_1.json";
const roomBRelative = "docs/survey/derived/room-b-wc/ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json";
const roomCRelative = "docs/survey/derived/room-c/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json";
const outputDir = path.join(repoRoot, "docs/survey/derived/global-reconciliation");
const stem = "WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_2";
const generatedDate = "2026-08-12";

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), "utf8"));
const sha256 = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(repoRoot, relative))).digest("hex").toUpperCase();
const round = (value, digits = 4) => Math.round(value * 10 ** digits) / 10 ** digits;
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
const acuteDirectionDifference = (first, second) => {
  const raw = Math.abs(((first - second + 180) % 360 + 360) % 360 - 180);
  return Math.min(raw, 180 - raw);
};
const angle = (previous, corner, next) => {
  const a = sub(previous, corner);
  const b = sub(next, corner);
  return Math.acos(Math.max(-1, Math.min(1, dot(a, b) / length(a) / length(b)))) * 180 / Math.PI;
};
const record = ([x, y]) => ({ x: round(x), y: round(y) });
const toPoints = (source) => Object.fromEntries(Object.entries(source).map(([id, value]) => [id, [value.x, value.y]]));
const clonePoints = (source) => Object.fromEntries(Object.entries(source).map(([id, value]) => [id, [...value]]));
const lineIntersection = (p, r, q, s) => {
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-12) throw new Error("Parallel lines in constrained intersection.");
  return add(p, mul(r, cross(sub(q, p), s) / denominator));
};
const rms = (values) => values.length ? Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length) : 0;
const signed = (value, digits = 2) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;

const source = readJson(sourceRelative);
const roomA = readJson(roomARelative);
const roomB = readJson(roomBRelative);
const roomC = readJson(roomCRelative);
if (source.version !== "0.1" || source.status !== "PROVISIONAL WHOLE-FLAT ARCHITECTURALLY CONSTRAINED RECONCILIATION — HUMAN REVIEW REQUIRED") {
  throw new Error("Expected the v0.1 constrained candidate as immutable source geometry.");
}

const beforeA = toPoints(source.geometry.roomAConstrainedNodesMm);
const beforeB = toPoints(source.geometry.roomBWCConstrainedMm);
const cNodes = toPoints(source.geometry.roomCUnchangedNodesMm);
const cObjects = toPoints(source.geometry.roomCUnchangedObjectNodesMm);
const d2Layers = Object.fromEntries(Object.entries(source.geometry.d2LayersUnchangedMm).map(([id, values]) => [id, values.map((value) => [value.x, value.y])]));
const d3Layers = toPoints(source.geometry.d3LayersUnchangedMm);
const afterA = clonePoints(beforeA);
const afterB = clonePoints(beforeB);

// Human guide A: A0→A1 belongs to the same upper-wall direction family as A2→A3.
// A0, A2 and the A2→A3 reference remain fixed; A1 is their parallel/perpendicular intersection.
const aUpperDirection = unit(sub(beforeA.A3, beforeA.A2));
const aReturnDirection = [-aUpperDirection[1], aUpperDirection[0]];
afterA.A1 = lineIntersection(beforeA.A0, aUpperDirection, beforeA.A2, aReturnDirection);

// Human guides B–F: v0.1 already has the right D5/wall face straight, the
// B3 corner square, and the WC rectangular. Keep those accepted relationships
// fixed. Move B4 only to make B0→B4 parallel to B1→B2→B3 while keeping
// B4→B3 perpendicular. This is the unique minimum-change intersection.
const familyA = unit(sub(beforeB.B3, beforeB.B1));
const familyB = [familyA[1], -familyA[0]];
afterB.B4 = lineIntersection(beforeB.B0, familyA, beforeB.B3, familyB);

function intervalResidual(predicted, reading) {
  if (reading.valueMm !== undefined) return predicted - reading.valueMm;
  if (predicted < reading.minMm) return predicted - reading.minMm;
  if (predicted > reading.maxMm) return predicted - reading.maxMm;
  return 0;
}

const d3Centre = d3Layers.doorCentre;
const d3Normal = [0, 1];
const partitionOuterLine = [cNodes.PO2, cNodes.PO3];
function validation3726(points) {
  const start = lineIntersection(d3Centre, d3Normal, partitionOuterLine[0], sub(partitionOuterLine[1], partitionOuterLine[0]));
  const finish = lineIntersection(d3Centre, d3Normal, points.B3, sub(points.B4, points.B3));
  return distance(start, finish);
}


const aDistanceDefinitions = [
  ["BASE-A-01", "A0", "A1", 1316, 4, "exact"], ["BASE-A-02", "A1", "A2", 284, 4, "exact"],
  ["BASE-A-04", "A3", "A4", 268, 4, "exact"], ["BASE-A-05", "A4", "A5", 1293, 4, "exact"],
  ["BASE-A-06", "A5", "W1-AL", 1410, 4, "exact"], ["BASE-A-07", "W1-AR", "A6", 1431, 4, "exact"],
  ["BASE-A-08", "A6", "D1-AL", 529, 4, "exact"], ["BASE-A-09", "D1-AR", "A7", 2825, 4, "exact"],
  ["BASE-A-10", "A7", "D2-AL", 550, 4, "exact"], ["BASE-A-11", "D2-AR", "A0", 2664, 4, "exact"],
  ["SUP-001", "A2", "A0", 1338, 8, "exact"], ["SUP-002", "A2", "D2-AR", 2696, 8, "exact"],
  ["SUP-003", "A2", "A7", 4215, 8, "exact"], ["SUP-004", "A2", "D1-AR", 4287, 8, "exact"],
  ["SUP-005", "A2", "A6", 5155, 8, "exact"], ["SUP-006", "A2", "W1-AL", 3430, 8, "exact"],
  ["SUP-025", "A3", "A5", 1318, 8, "exact"], ["SUP-026", "A3", "W1-AL", 1721, 8, "exact"],
  ["SUP-027", "A3", "A6", 4206, 8, "exact"], ["SUP-028", "A3", "D1-AL", 4082, 8, "exact"],
  ["SUP-029", "A3", "D1-AR", 4029, 8, "exact"], ["SUP-030", "A3", "A7", 5157, 8, "exact"],
  ["SUP-032", "A4", "W1-AL", 1900, 8, "exact"], ["SUP-033", "A4", "A6", 4458, 8, "exact"],
  ["SUP-034", "A4", "D1-AL", 4342, 8, "exact"], ["SUP-035", "A0", "A2", 1333, 8, "exact"],
  ["SUP-036", "A0", "W1-AL", 4760, 8, "exact"], ["SUP-037", "A0", "A6", 6251, 8, "exact"],
  ["SUP-038", "A0", "D1-AR", 5133, 8, "exact"], ["SUP-039", "A1", "D2-AR", 2945, 8, "exact"],
  ["SUP-040", "A1", "A7", 4485, 8, "exact"], ["SUP-041", "A5", "D1-AL", 4298, 8, "exact"],
  ["SUP-042", "A5", "A7", 6225, 8, "exact"], ["SUP-043", "A5", "D2-AR", 5237, 8, "exact"],
  ["SUP-044", "W1-AR", "D1-AL", 1514, 8, "exact"], ["SUP-031", "A3", "D2-AR", 4017, 40, "approximate"],
  ["SUP-045", "W1-AR", "A7", 4760, 75, "approximate"], ["SUP-046", "A6", "D2-AR", 4838, 75, "approximate"],
  ...roomA.evidence.repeatedDistances.map((item) => [item.id, item.from, item.to, item.measuredMm, item.sigmaMm, item.exactEndpoint ? "exact" : "approximate"]),
].map(([id, from, to, measuredMm, sigmaMm, quality]) => ({ id, from, to, measuredMm, sigmaMm, quality }));

const rowsA = (points) => aDistanceDefinitions.map((item) => ({ ...item, predictedMm: distance(points[item.from], points[item.to]), residualMm: distance(points[item.from], points[item.to]) - item.measuredMm }));
const rowsB = (points) => roomB.observations.distance.map((item) => {
  const predictedMm = distance(points[item.from], points[item.to]);
  return { ...item, predictedMm, residualMm: intervalResidual(predictedMm, item.reading) };
});
const beforeARows = rowsA(beforeA);
const afterARows = rowsA(afterA);
const beforeBRows = rowsB(beforeB);
const afterBRows = rowsB(afterB);
const aHeadline = (rows) => rows.filter((item) => item.quality === "exact");
const bHeadline = (rows) => rows.filter((item) => item.exactEndpoint && item.reading.valueMm !== undefined && !["approximate", "cross-tie"].includes(item.category));
const comparableBefore = [...aHeadline(beforeARows), ...bHeadline(beforeBRows)];
const comparableAfter = [...aHeadline(afterARows), ...bHeadline(afterBRows)];
const worst = (rows) => [...rows].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm))[0];

const d2Centre = midpoint(cObjects["D2-A-FACE-R"], cObjects["D2-A-FACE-L"]);
const d2Normal = unit(sub(midpoint(cObjects["D2-A-FACE-R"], cObjects["D2-A-FACE-L"]), midpoint(cObjects["D2-OPENING-R"], cObjects["D2-OPENING-L-INFERRED"])));
function validation9019(points) {
  const farA = lineIntersection(d2Centre, d2Normal, points.A5, sub(points.A6, points.A5));
  const farC = lineIntersection(d2Centre, d2Normal, cNodes.C0, sub(cNodes["CP1-FL"], cNodes.C0));
  return distance(farA, farC);
}

const allMovements = [
  ...Object.keys(afterA).map((id) => ({ room: "A", id, vector: sub(afterA[id], beforeA[id]), magnitudeMm: distance(afterA[id], beforeA[id]) })),
  ...Object.keys(afterB).map((id) => ({ room: id.startsWith("T") || id === "D5-WCL" ? "WC" : "B", id, vector: sub(afterB[id], beforeB[id]), magnitudeMm: distance(afterB[id], beforeB[id]) })),
];
const moved = allMovements.filter((item) => item.magnitudeMm > 1e-7);
const maximumMovement = [...moved].sort((a, b) => b.magnitudeMm - a.magnitudeMm)[0];

function metrics(aPoints, bPoints) {
  const aUpper = bearing(sub(aPoints.A1, aPoints.A0));
  const aReference = bearing(sub(aPoints.A3, aPoints.A2));
  const bLeft = bearing(sub(bPoints.B4, bPoints.B0));
  const bRight = bearing(sub(bPoints.B3, bPoints.B1));
  const bBottom = bearing(sub(bPoints.B3, bPoints.B4));
  const bTop = bearing(sub(bPoints.B1, bPoints["B0.5"]));
  const wcTop = bearing(sub(bPoints.T1, bPoints.T0));
  const wcLeft = bearing(sub(bPoints.T3, bPoints.T0));
  return {
    aUpperDirectionDegrees: aUpper,
    aUpperReferenceDirectionDegrees: aReference,
    aUpperReferenceDeviationDegrees: acuteDirectionDifference(aUpper, aReference),
    a1AngleDegrees: angle(aPoints.A0, aPoints.A1, aPoints.A2),
    bLeftDirectionDegrees: bLeft,
    bRightDirectionDegrees: bRight,
    bSideTaperDegrees: acuteDirectionDifference(bLeft, bRight),
    bBottomDirectionDegrees: bBottom,
    bBottomRightAngleDegrees: angle(bPoints.B2, bPoints.B3, bPoints.B4),
    bTopDirectionDegrees: bTop,
    bD5LineDeviationDegrees: 180 - angle(bPoints.B1, bPoints.B2, bPoints.B3),
    wcTopDirectionDegrees: wcTop,
    wcLeftDirectionDegrees: wcLeft,
    wcKinkDeviationDegrees: 180 - angle(bPoints.T3, bPoints["D5-WCL"], bPoints.T0),
    wcCornerAngleDegrees: angle(bPoints.T3, bPoints.T0, bPoints.T1),
    validation9019ModelMm: validation9019(aPoints),
    validation3726ModelMm: validation3726(bPoints),
  };
}

const beforeMetrics = metrics(beforeA, beforeB);
const afterMetrics = metrics(afterA, afterB);
const changedRows = (before, after) => after.map((item, index) => ({ id: item.id, beforeMm: before[index].residualMm, afterMm: item.residualMm, changeMm: item.residualMm - before[index].residualMm })).filter((item) => Math.abs(item.changeMm) > 0.01);
const roomBHeadline = (rows) => bHeadline(rows).filter((item) => !item.id.startsWith("BASE-WC") && !item.id.startsWith("D5-WC"));
const wcHeadline = (rows) => bHeadline(rows).filter((item) => item.id.startsWith("BASE-WC") || item.id.startsWith("D5-WC"));

const output = {
  documentType: "WHOLE-FLAT HUMAN ARCHITECTURALLY CONSTRAINED RECONCILIATION",
  version: "0.2",
  generatedDate,
  units: "millimetres unless stated otherwise",
  status: "PROVISIONAL HUMAN ARCHITECTURALLY CONSTRAINED WORKING MODEL — HUMAN REVIEW REQUIRED",
  provenanceBoundary: {
    measurementDerivedEvidence: {
      description: "Immutable accepted room reconstructions and their raw observations remain evidence; they are not overwritten by this working model.",
      roomA: { relativePath: roomARelative, sha256: sha256(roomARelative) },
      roomBWC: { relativePath: roomBRelative, sha256: sha256(roomBRelative) },
      roomC: { relativePath: roomCRelative, sha256: sha256(roomCRelative) },
    },
    predecessorConstrainedCandidate: {
      relativePath: sourceRelative,
      sha256: sha256(sourceRelative),
      unchanged: true,
      familyArtifacts: Object.fromEntries(Object.entries(predecessorFamilyRelatives).map(([role, relativePath]) => [role, { relativePath, sha256: sha256(relativePath) }])),
    },
    humanConstraintMarkup: { suppliedName: "black-to-straigthen.jpg", availability: "supplied in the task conversation; no repository file/hash", interpretationOnly: true, pixelCoordinatesUsed: false },
  },
  markupToTopologyMapping: [
    { guide: "Room A upper black guide", modelNodes: ["A0", "A1"], reference: "A2→A3 upper-wall direction family" },
    { guide: "Room B left black guide", modelSegment: "B0→B4", relation: "straight Room B side family; adjacent D3-BR→B0.5 return remains separately fixed" },
    { guide: "Room B/D5 right black guide", modelNodes: ["B1", "B2", "B3"], virtualSpan: "B1→B2", relation: "one straight face; virtual reference continues through the opening, but B1→B2 remains opening and B2→B3 remains wall" },
    { guide: "Room B bottom black guide", modelSegment: "B4→B3", relation: "perpendicular to both Room B side families" },
    { guide: "WC/D5 alignment reference", modelNodes: ["T0", "D5-WCL", "T3"], virtualSpan: "T0→D5-WCL", relation: "straight distinct WC face; opening and wall remain separately typed" },
  ],
  humanApprovedArchitecturalConstraints: {
    hard: [
      { id: "HUM-A-UPPER-PARALLEL", relation: "A0→A1 parallel to fixed A2→A3" },
      { id: "HUM-A-A1-SQUARE", relation: "A0→A1 perpendicular to A1→A2" },
      { id: "HUM-B-LEFT-SIDE", relation: "B0→B4 is the left Room B side family" },
      { id: "HUM-B-SIDES", relation: "B0→B4 parallel to B1→B2→B3" },
      { id: "HUM-B-BOTTOM", relation: "B4→B3 perpendicular to both Room B side families" },
      { id: "HUM-B-D5-LINE", relation: "B1, B2 and B3 collinear; B1→B2 remains an opening" },
      { id: "HUM-WC-RECTANGLE", relation: "T0→T1→T2→T3 exact v0.1 rectangle preserved without movement" },
      { id: "HUM-WC-D5-LINE", relation: "T0, D5-WCL and T3 collinear; T0→D5-WCL remains opening and D5-WCL→T3 remains wall" },
      { id: "FREEZE-C-D2-D3", relation: "Room C plus D2/D3 registration layers fixed" },
      { id: "PRESERVE-D3-RETURN", relation: "D3-BR and B0.5 fixed exactly; their real separate return is not absorbed into the regularised Room B side family" },
    ],
    method: "deterministic exact line intersection: preserve the accepted v0.1 right-side and bottom directions, then move B4 to their unique parallel/perpendicular closure; A1 uses an exact parallel/perpendicular intersection",
    directionalDatum: "The unchanged v0.1 B1→B2→B3 family supplies the Room B side direction; its perpendicular supplies B4→B3. The WC keeps its already rectangular v0.1 direction. Painted pixels supplied topology only and supplied no direction or dimensions.",
  },
  constraintScopeDecision: {
    adjustedNow: ["A1 only for A0→A1 parallel/A1 square closure", "B4 only for parallel Room B side walls and preserved square bottom"],
    alreadySatisfiedAndFrozenFromV01: ["B1→B2→B3 straight D5/wall face", "B4→B3 perpendicular to the right family", "T0→T1→T2→T3 rectangle", "T0→D5-WCL→T3 straight WC face"],
    rejectedOverconstraint: "A trial that imposed one new absolute direction across all B/WC families moved nodes by approximately 56–97 mm and degraded the 3726 validation. It was rejected in favour of the two-node minimum-change successor recorded here.",
  },
  softEvidenceTreatment: {
    roomDistanceObservations: "accepted active survey distances are evaluated before/after, not altered",
    validation3726Use: "reported validation only; the defining B3→B4 line is preserved",
    validation9019Use: "reported validation only; its defining geometry is outside the changed A1 node",
    wcConflict: { opposingWidthsMm: [1643, 1685], differenceMm: 42, retainedInEvidence: true, architecturalRectangleOverridesDisplayOfConflict: true },
  },
  beforeAfter: {
    predecessor: "v0.1 constrained candidate",
    metrics: { before: Object.fromEntries(Object.entries(beforeMetrics).map(([key, value]) => [key, round(value, 6)])), after: Object.fromEntries(Object.entries(afterMetrics).map(([key, value]) => [key, round(value, 6)])) },
    movements: {
      nodes: Object.fromEntries(moved.map((item) => [`${item.room}:${item.id}`, { deltaMm: record(item.vector), magnitudeMm: round(item.magnitudeMm) }])),
      maximum: { node: `${maximumMovement.room}:${maximumMovement.id}`, magnitudeMm: round(maximumMovement.magnitudeMm) },
      rmsMovedNodesMm: round(rms(moved.map((item) => item.magnitudeMm))),
      rmsByAreaMm: {
        roomA: round(rms(moved.filter((item) => item.room === "A").map((item) => item.magnitudeMm))),
        roomB: round(rms(moved.filter((item) => item.room === "B").map((item) => item.magnitudeMm))),
        wc: round(rms(moved.filter((item) => item.room === "WC").map((item) => item.magnitudeMm))),
      },
    },
    measurementSummary: {
      definition: "Unweighted RMS over the same 58 comparable direct exact-endpoint distance observations used by v0.1.",
      count: comparableBefore.length,
      totalRmsBeforeMm: round(rms(comparableBefore.map((item) => item.residualMm))),
      totalRmsAfterMm: round(rms(comparableAfter.map((item) => item.residualMm))),
      roomARmsBeforeMm: round(rms(aHeadline(beforeARows).map((item) => item.residualMm))),
      roomARmsAfterMm: round(rms(aHeadline(afterARows).map((item) => item.residualMm))),
      roomBRmsBeforeMm: round(rms(roomBHeadline(beforeBRows).map((item) => item.residualMm))),
      roomBRmsAfterMm: round(rms(roomBHeadline(afterBRows).map((item) => item.residualMm))),
      wcRmsBeforeMm: round(rms(wcHeadline(beforeBRows).map((item) => item.residualMm))),
      wcRmsAfterMm: round(rms(wcHeadline(afterBRows).map((item) => item.residualMm))),
      worstBefore: { id: worst(comparableBefore).id, residualMm: round(worst(comparableBefore).residualMm) },
      worstAfter: { id: worst(comparableAfter).id, residualMm: round(worst(comparableAfter).residualMm) },
      roomAChanged: changedRows(beforeARows, afterARows).map((item) => ({ ...item, beforeMm: round(item.beforeMm), afterMm: round(item.afterMm), changeMm: round(item.changeMm) })),
      roomBWCChanged: changedRows(beforeBRows, afterBRows).map((item) => ({ ...item, beforeMm: round(item.beforeMm), afterMm: round(item.afterMm), changeMm: round(item.changeMm) })),
    },
    validations: {
      span9019: { measuredMm: 9019, modelBeforeMm: round(beforeMetrics.validation9019ModelMm), modelAfterMm: round(afterMetrics.validation9019ModelMm), residualBeforeMm: round(beforeMetrics.validation9019ModelMm - 9019), residualAfterMm: round(afterMetrics.validation9019ModelMm - 9019) },
      span3726: { measuredMm: 3726, modelBeforeMm: round(beforeMetrics.validation3726ModelMm), modelAfterMm: round(afterMetrics.validation3726ModelMm), residualBeforeMm: round(beforeMetrics.validation3726ModelMm - 3726), residualAfterMm: round(afterMetrics.validation3726ModelMm - 3726) },
    },
  },
  geometry: {
    roomABeforeMm: Object.fromEntries(Object.entries(beforeA).map(([id, value]) => [id, record(value)])),
    roomAAfterMm: Object.fromEntries(Object.entries(afterA).map(([id, value]) => [id, record(value)])),
    roomBWCBeforeMm: Object.fromEntries(Object.entries(beforeB).map(([id, value]) => [id, record(value)])),
    roomBWCAfterMm: Object.fromEntries(Object.entries(afterB).map(([id, value]) => [id, record(value)])),
    roomCUnchangedNodesMm: Object.fromEntries(Object.entries(cNodes).map(([id, value]) => [id, record(value)])),
    roomCUnchangedObjectNodesMm: Object.fromEntries(Object.entries(cObjects).map(([id, value]) => [id, record(value)])),
    d2LayersUnchangedMm: Object.fromEntries(Object.entries(d2Layers).map(([id, values]) => [id, values.map(record)])),
    d3LayersUnchangedMm: Object.fromEntries(Object.entries(d3Layers).map(([id, value]) => [id, record(value)])),
  },
  measurementResiduals: {
    roomA: afterARows.map((item, index) => ({ id: item.id, beforeMm: round(beforeARows[index].residualMm), afterMm: round(item.residualMm), changeMm: round(item.residualMm - beforeARows[index].residualMm), quality: item.quality })),
    roomBWC: afterBRows.map((item, index) => ({ id: item.id, beforeMm: round(beforeBRows[index].residualMm), afterMm: round(item.residualMm), changeMm: round(item.residualMm - beforeBRows[index].residualMm), category: item.category })),
  },
  preservation: {
    predecessorFilesOverwritten: false,
    acceptedMeasurementBaselinesEdited: false,
    roomCMaximumMovementMm: 0,
    d2RegistrationChanged: false,
    d3RegistrationChanged: false,
    d3ReturnEndpointsMovedMm: { "D3-BR": 0, "B0.5": 0 },
    d3ReturnLengthChangedMm: round(distance(afterB["D3-BR"], afterB["B0.5"]) - distance(beforeB["D3-BR"], beforeB["B0.5"])),
    wcMaximumMovementMm: 0,
    wcGeometryChanged: false,
    d3ReturnTopologyPreserved: true,
    d5OpeningPreserved: true,
    virtualWallDrawnAcrossD5InCleanSvg: false,
    d2RoomACasingVisible: true,
    cupboardGeometryChanged: false,
    globalScaleChanged: false,
  },
};

function escapeXml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }

function makeSvg({ diagnostic = false } = {}) {
  const all = [...Object.values(afterA), ...Object.values(afterB), ...Object.values(cNodes), ...Object.values(cObjects)];
  const minX = Math.min(...all.map((item) => item[0])) - 350;
  const maxX = Math.max(...all.map((item) => item[0])) + 300;
  const minY = Math.min(...all.map((item) => item[1])) - 320;
  const maxY = Math.max(...all.map((item) => item[1])) + 320;
  const plot = { x: 45, y: 175, width: 1560, height: 1240 };
  const scale = Math.min(plot.width / (maxX - minX), plot.height / (maxY - minY));
  const xy = ([x, y]) => [round(plot.x + (x - minX) * scale, 1), round(plot.y + (y - minY) * scale, 1)];
  const line = (first, second, cls, extra = "") => { const a = xy(first); const b = xy(second); return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}" ${extra}/>`; };
  const polygon = (values, cls) => `<polygon points="${values.map((item) => xy(item).join(",")).join(" ")}" class="${cls}"/>`;
  const circle = (value, cls = "node", radius = 4) => { const p = xy(value); return `<circle cx="${p[0]}" cy="${p[1]}" r="${radius}" class="${cls}"/>`; };
  const label = (value, text, dx = 7, dy = -7, cls = "label", anchor = "start") => { const p = xy(value); return `<text x="${round(p[0] + dx, 1)}" y="${round(p[1] + dy, 1)}" class="${cls}" text-anchor="${anchor}">${escapeXml(text)}</text>`; };
  const a = (id) => afterA[id]; const b = (id) => afterB[id]; const c = (id) => cNodes[id]; const o = (id) => cObjects[id];
  const cp2Along = unit(sub(c("PO1"), c("CP1-FL")));
  const cp2CasingBack = sub(o("CP2-BODY-BL"), mul(cp2Along, 20));
  const cp1Centre = midpoint(midpoint(o("CP1-BODY-FL"), o("CP1-BODY-FR")), midpoint(o("CP1-BODY-BL"), o("CP1-BODY-BR")));
  const cp2Centre = midpoint(midpoint(o("CP2-BODY-FL"), o("CP2-BODY-FR")), midpoint(o("CP2-BODY-BL"), o("CP2-BODY-BR")));
  const aIds = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"];
  const bIds = ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4"];
  const wcIds = ["T0", "T1", "T2", "T3", "D5-WCL"];
  const diagnosticOverlay = diagnostic ? `
    ${polygon(aIds.map((id) => beforeA[id]), "old")}${polygon(bIds.map((id) => beforeB[id]), "old")}${polygon(wcIds.map((id) => beforeB[id]), "old")}
    ${moved.map((item) => line(item.room === "A" ? beforeA[item.id] : beforeB[item.id], item.room === "A" ? afterA[item.id] : afterB[item.id], "move", "marker-end=\"url(#arrow)\"")).join("")}
    ${line(b("B1"), b("B3"), "reference")}${label(midpoint(b("B1"), b("B2")), "virtual B datum", -20, -18, "referenceLabel", "end")}
    ${line(b("T0"), b("T3"), "reference")}${label(midpoint(b("T0"), b("D5-WCL")), "virtual WC datum", 20, 20, "referenceLabel")}
  ` : "";
  const summary = output.beforeAfter.measurementSummary;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1500" viewBox="0 0 2200 1500" role="img" aria-labelledby="title desc">
<title id="title">Whole-flat human architecturally constrained reconciliation v0.2${diagnostic ? " diagnostic" : ""}</title>
<desc id="desc">Human-approved straight, parallel and perpendicular wall families applied to the v0.1 candidate. Room C and D2/D3 remain fixed. Virtual guides appear only in the diagnostic.</desc>
<defs><style>
.page{fill:#fff;stroke:#0f172a;stroke-width:3}.panel{fill:#f8fafc;stroke:#94a3b8;stroke-width:2}.title{font:700 28px Arial,sans-serif;fill:#0f172a}.sub{font:16px Arial,sans-serif;fill:#334155}.warn{font:700 16px Arial,sans-serif;fill:#9f1239}.roomA{fill:#fff7ed}.roomC{fill:#eff6ff}.roomB{fill:#ecfdf5}.wc{fill:#f0fdfa}.wallA{stroke:#c2410c;stroke-width:7}.wallC{stroke:#1e3a8a;stroke-width:7}.wallB{stroke:#047857;stroke-width:7}.wallWC{stroke:#0f766e;stroke-width:7}.return{stroke:#7c3aed;stroke-width:11}.partition{fill:#e9d5ff;stroke:#7e22ce;stroke-width:3}.window{stroke:#0284c7;stroke-width:9}.door{stroke:#d97706;stroke-width:9}.casing{stroke:#d97706;stroke-width:8}.casingApprox{stroke:#d97706;stroke-width:8;stroke-dasharray:9 5}.clear{stroke:#2563eb;stroke-width:7}.structural{stroke:#0f766e;stroke-width:9}.leafC{stroke:#166534;stroke-width:10}.leafB{stroke:#2563eb;stroke-width:5}.reveal{stroke:#64748b;stroke-width:2;stroke-dasharray:5 4}.cupBody{fill:#fef3c7;stroke:#a16207;stroke-width:3}.cupDoor{stroke:#a16207;stroke-width:3;stroke-dasharray:7 5}.cupCasing{fill:#fed7aa;stroke:#c2410c;stroke-width:2}.cupTop{stroke:#d97706;stroke-width:7;stroke-dasharray:8 5}.cupLabel{font:700 12px Arial,sans-serif;fill:#92400e;paint-order:stroke;stroke:#fff;stroke-width:4px}.nodeA{fill:#fff;stroke:#c2410c;stroke-width:2}.nodeB{fill:#fff;stroke:#047857;stroke-width:2}.label{font:700 12px Arial,sans-serif;fill:#0f172a;paint-order:stroke;stroke:#fff;stroke-width:4px}.labelA{font:700 12px Arial,sans-serif;fill:#9a3412;paint-order:stroke;stroke:#fff;stroke-width:4px}.labelB{font:700 12px Arial,sans-serif;fill:#065f46;paint-order:stroke;stroke:#fff;stroke-width:4px}.roomLabel{font:700 21px Arial,sans-serif}.sideHead{font:700 19px Arial,sans-serif;fill:#0f172a}.side{font:14px Arial,sans-serif;fill:#1f2937}.small{font:12px Arial,sans-serif;fill:#475569}.good{fill:#166534;font-weight:700}.caution{fill:#b45309;font-weight:700}.callout{fill:#f0fdf4;stroke:#16a34a;stroke-width:2}.old{fill:none;stroke:#94a3b8;stroke-width:2;stroke-dasharray:7 6}.move{stroke:#dc2626;stroke-width:2}.reference{stroke:#7c3aed;stroke-width:2;stroke-dasharray:7 5}.referenceLabel{font:700 11px Arial,sans-serif;fill:#6d28d9;paint-order:stroke;stroke:#fff;stroke-width:4px}
</style><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#dc2626"/></marker></defs>
<rect x="12" y="12" width="2176" height="1476" rx="12" class="page"/><text x="48" y="54" class="title">WHOLE-FLAT HUMAN ARCHITECTURALLY CONSTRAINED RECONCILIATION · v0.2${diagnostic ? " · DIAGNOSTIC" : ""}</text><text x="48" y="83" class="sub">Measurement history preserved · explicit human wall-family constraints · Room C and D2/D3 fixed</text><text x="48" y="111" class="warn">PROVISIONAL WORKING MODEL — HUMAN REVIEW REQUIRED — NOT A FINAL SHELL</text>
<rect x="30" y="138" width="1600" height="1325" rx="10" class="panel"/><rect x="1645" y="138" width="525" height="1325" rx="10" class="panel"/>
${polygon([c("C0"), c("CP1-FL"), c("CP2-FR"), c("D3-CL")], "roomC")}${polygon(aIds.map(a), "roomA")}${polygon(bIds.map(b), "roomB")}${polygon(wcIds.map(b), "wc")}${polygon([c("PO1"), c("PO2"), c("PO3"), c("PI3"), c("PI2"), c("PI1")], "partition")}
${polygon([o("CP1-BODY-FL"), o("CP1-BODY-FR"), o("CP1-BODY-BR"), o("CP1-BODY-BL")], "cupBody")}${line(o("CP1-BODY-FL"), o("CP1-BODY-FR"), "cupDoor")}${polygon([o("CP2-BODY-FL"), o("CP2-BODY-FR"), o("CP2-BODY-BR"), o("CP2-BODY-BL")], "cupBody")}${polygon([o("CP2-CASING-FL"), o("CP2-BODY-FL"), o("CP2-BODY-BL"), cp2CasingBack], "cupCasing")}${line(o("CP2-BODY-BL"), o("CP2-BODY-BR"), "cupTop")}${line(o("CP2-BODY-FL"), o("CP2-BODY-FR"), "cupDoor")}
${line(c("C0"), c("CP1-FL"), "wallC")}${line(c("CP1-FL"), c("PO1"), "wallC")}${line(c("PI1"), c("CP2-FL"), "wallC")}${line(c("CP2-FR"), c("D3-CL"), "wallC")}${line(c("C0"), c("C1"), "wallC")}${line(c("C1"), c("W2-CR"), "wallC")}${line(c("W2-CR"), c("W2-CL"), "window")}${line(c("W2-CL"), c("C2"), "wallC")}${line(c("C2"), o("D4-OUTER-R"), "wallC")}${line(o("D4-OUTER-R"), o("D4-OUTER-L"), "door")}${line(o("D4-OUTER-L"), o("D3-OUTER-R"), "wallC")}
${line(a("A0"), a("A1"), "wallA")}${line(a("A1"), a("A2"), "wallA")}${line(a("A2"), a("A3"), "wallA")}${line(a("A3"), a("A4"), "wallA")}${line(a("A4"), a("A5"), "wallA")}${line(a("A5"), a("W1-AL"), "wallA")}${line(a("W1-AL"), a("W1-AR"), "clear")}${line(a("W1-AR"), a("A6"), "wallA")}${line(a("A6"), a("D1-AL"), "wallA")}${line(a("D1-AL"), a("D1-AR"), "clear")}${line(a("D1-AR"), a("A7"), "wallA")}${line(a("A7"), a("D2-AL"), "wallA")}${line(a("D2-AR"), a("A0"), "wallA")}
${line(d2Layers.roomCStructuralOpeningAtRoomCFaceMm[0], d2Layers.roomCStructuralOpeningAtRoomCFaceMm[1], "structural")}${line(d2Layers.roomCStructuralOpeningAtRoomAFaceMm[0], d2Layers.roomCStructuralOpeningAtRoomAFaceMm[1], "structural")}${line(d2Layers.roomCLeafClosingPlaneMm[0], d2Layers.roomCLeafClosingPlaneMm[1], "leafC")}${line(d2Layers.roomAClearOpeningSegmentMm[0], d2Layers.roomAClearOpeningSegmentMm[1], "clear")}${line(d2Layers.roomAMeasuredCasingSegmentMm[0], d2Layers.roomAMeasuredCasingSegmentMm[1], "casingApprox")}
${line(o("D3-OUTER-R"), o("D3-OUTER-L-CORNER"), "casing")}${line(o("D3-LEAF-R"), o("D3-LEAF-L"), "leafC")}${line(beforeB.B0, beforeB["D3-BR"], "casingApprox")}${line(d3Layers.innerLeft, d3Layers.doorLeft, "reveal")}${line(d3Layers.innerRight, d3Layers.doorRight, "reveal")}${line(beforeB.B0, d3Layers.innerLeft, "reveal")}${line(beforeB["D3-BR"], d3Layers.innerRight, "reveal")}${line(d3Layers.doorLeft, d3Layers.doorRight, "leafB")}
${line(b("D3-BR"), b("B0.5"), "return")}${line(b("B0.5"), b("B1"), "wallB")}${line(b("B1"), b("B2"), "door")}${line(b("B2"), b("B3"), "wallB")}${line(b("B3"), b("B4"), "wallB")}${line(b("B4"), b("B0"), "wallB")}
${line(b("T0"), b("T1"), "wallWC")}${line(b("T1"), b("T2"), "wallWC")}${line(b("T2"), b("T3"), "wallWC")}${line(b("T3"), b("D5-WCL"), "wallWC")}${line(b("D5-WCL"), b("T0"), "door")}
${diagnosticOverlay}
${["A1", "A2"].map((id) => circle(a(id), "nodeA")).join("")}${["D3-BR", "B0.5", "B1", "B2", "B3", "B4", "T0", "T1", "T2", "T3", "D5-WCL"].map((id) => circle(b(id), "nodeB")).join("")}
${label(a("A1"), "A1 · 90°", -8, -10, "labelA", "end")}${label(midpoint(a("A0"), a("A1")), "A0–A1 ∥ A2–A3", 0, -12, "labelA", "middle")}${label(b("B0.5"), "B0.5 · preserved corner", -8, 28, "labelB", "end")}${label(b("B3"), "B3 · 90°", 8, 18, "labelB")}${label(midpoint(b("B2"), b("B3")), "straight B2–B3 wall", 10, 0, "labelB")}${label(midpoint(b("B1"), b("B2")), "D5 opening · aligned face", 10, 0, "label")}${label(midpoint(b("T3"), b("T0")), "straight WC wall/opening face", -10, 0, "labelB", "end")}${label(midpoint(...d2Layers.roomAMeasuredCasingSegmentMm), "D2 A casing retained", 16, 4, "label")}${label(midpoint(o("D3-LEAF-R"), o("D3-LEAF-L")), "D3 unchanged", 0, -18, "label", "middle")}${label(cp1Centre, "CP1 / C1 · fixed", 0, 4, "cupLabel", "middle")}${label(cp2Centre, "CP2 / C2 · fixed", 0, 4, "cupLabel", "middle")}
<text x="${xy([1700,-1800])[0]}" y="${xy([1700,-1800])[1]}" class="roomLabel" fill="#1e3a8a" text-anchor="middle">ROOM C · FIXED</text><text x="${xy([6900,-1800])[0]}" y="${xy([6900,-1800])[1]}" class="roomLabel" fill="#9a3412" text-anchor="middle">ROOM A</text><text x="${xy([3950,1500])[0]}" y="${xy([3950,1500])[1]}" class="roomLabel" fill="#047857" text-anchor="middle">ROOM B</text><text x="${xy([5900,900])[0]}" y="${xy([5900,900])[1]}" class="roomLabel" fill="#0f766e" text-anchor="middle">WC</text>
<text x="1675" y="180" class="sideHead">Human constraints</text><text x="1675" y="212" class="side">A upper: ${beforeMetrics.aUpperDirectionDegrees.toFixed(3)}° → <tspan class="good">${afterMetrics.aUpperDirectionDegrees.toFixed(3)}°</tspan></text><text x="1675" y="238" class="side">B side taper: ${beforeMetrics.bSideTaperDegrees.toFixed(3)}° → <tspan class="good">0.000°</tspan></text><text x="1675" y="264" class="side">B bottom/right: ${beforeMetrics.bBottomRightAngleDegrees.toFixed(3)}° → <tspan class="good">90.000°</tspan></text><text x="1675" y="290" class="side">WC rectangle/kink retained: <tspan class="good">90° / 0°</tspan></text><text x="1675" y="318" class="small">D5 remains an opening; reference gap is diagnostic-only.</text>
<text x="1675" y="370" class="sideHead">Movement from v0.1</text><text x="1675" y="402" class="side">Maximum: <tspan class="caution">${maximumMovement.room}:${maximumMovement.id} ${maximumMovement.magnitudeMm.toFixed(2)} mm</tspan></text><text x="1675" y="428" class="side">RMS moved nodes: ${output.beforeAfter.movements.rmsMovedNodesMm.toFixed(2)} mm</text><text x="1675" y="454" class="side">A / B / WC RMS: ${output.beforeAfter.movements.rmsByAreaMm.roomA.toFixed(2)} / ${output.beforeAfter.movements.rmsByAreaMm.roomB.toFixed(2)} / ${output.beforeAfter.movements.rmsByAreaMm.wc.toFixed(2)} mm</text>
<text x="1675" y="510" class="sideHead">Comparable measurement RMS</text><text x="1675" y="542" class="side">Total: ${summary.totalRmsBeforeMm.toFixed(2)} → ${summary.totalRmsAfterMm.toFixed(2)} mm</text><text x="1675" y="568" class="side">Room A: ${summary.roomARmsBeforeMm.toFixed(2)} → ${summary.roomARmsAfterMm.toFixed(2)} mm</text><text x="1675" y="594" class="side">Room B: ${summary.roomBRmsBeforeMm.toFixed(2)} → ${summary.roomBRmsAfterMm.toFixed(2)} mm</text><text x="1675" y="620" class="side">WC: ${summary.wcRmsBeforeMm.toFixed(2)} → ${summary.wcRmsAfterMm.toFixed(2)} mm</text><text x="1675" y="646" class="small">Same ${summary.count} direct exact-endpoint observations.</text>
<text x="1675" y="706" class="sideHead">Independent validation</text><text x="1675" y="738" class="side">9019 span: ${beforeMetrics.validation9019ModelMm.toFixed(2)} → ${afterMetrics.validation9019ModelMm.toFixed(2)}</text><text x="1675" y="764" class="side">Residual: ${signed(beforeMetrics.validation9019ModelMm-9019)} → ${signed(afterMetrics.validation9019ModelMm-9019)} mm</text><text x="1675" y="790" class="side">3726 span: ${beforeMetrics.validation3726ModelMm.toFixed(2)} → ${afterMetrics.validation3726ModelMm.toFixed(2)}</text><text x="1675" y="816" class="side">Residual: ${signed(beforeMetrics.validation3726ModelMm-3726)} → ${signed(afterMetrics.validation3726ModelMm-3726)} mm</text>
<rect x="1665" y="870" width="485" height="215" rx="8" class="callout"/><text x="1685" y="905" class="sideHead">Evidence vs working model</text><text x="1685" y="937" class="side">Raw room baselines remain immutable evidence.</text><text x="1685" y="965" class="side">Human constraints apply only in this successor.</text><text x="1685" y="993" class="side">WC 1643 / 1685 mm conflict remains recorded.</text><text x="1685" y="1021" class="side">Working WC remains rectangular by approval.</text><text x="1685" y="1053" class="small">No painted-pixel coordinate or dimension was used.</text>
<text x="1675" y="1140" class="sideHead">Preserved</text><text x="1675" y="1172" class="side">Room C movement 0 · D2 unchanged · D3 unchanged</text><text x="1675" y="1198" class="side">D3-BR and B0.5 fixed · separate return retained</text><text x="1675" y="1224" class="side">D2 casing and Room C cupboards retained</text><text x="1675" y="1250" class="side">No predecessor or accepted baseline overwritten</text><text x="1675" y="1310" class="small">${diagnostic ? "Grey dashed = v0.1; red = movement; purple = virtual reference." : "See diagnostic SVG for v0.1 overlay and virtual references."}</text><text x="1675" y="1336" class="small">Clean SVG contains no virtual wall through D5.</text><text x="1675" y="1396" class="small">HUMAN REVIEW REQUIRED · no 3D work started.</text>
</svg>`;
}

function movementRows() { return moved.map((item) => `| ${item.room} | \`${item.id}\` | ${signed(item.vector[0])} | ${signed(item.vector[1])} | ${item.magnitudeMm.toFixed(2)} |`).join("\n"); }
function consequenceRows() {
  const items = [...output.beforeAfter.measurementSummary.roomAChanged, ...output.beforeAfter.measurementSummary.roomBWCChanged];
  return items.sort((a, b) => Math.abs(b.changeMm) - Math.abs(a.changeMm)).slice(0, 14).map((item) => `| \`${item.id}\` | ${signed(item.beforeMm)} | ${signed(item.afterMm)} | ${signed(item.changeMm)} |`).join("\n");
}
function makeReport() {
  const m = output.beforeAfter.metrics;
  const s = output.beforeAfter.measurementSummary;
  const v = output.beforeAfter.validations;
  const areaMax = (room) => Math.max(0, ...moved.filter((item) => item.room === room).map((item) => item.magnitudeMm));
  return `# Whole-flat human architecturally constrained reconciliation v0.2

**Status: PROVISIONAL HUMAN ARCHITECTURALLY CONSTRAINED WORKING MODEL — HUMAN REVIEW REQUIRED.**

This successor starts from \`WHOLE_FLAT_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_1\`. It does not overwrite v0.1 or any accepted measurement-derived room baseline. The supplied \`black-to-straigthen.jpg\` markup was interpreted only as human approval of named straight/parallel/perpendicular relationships; no coordinate or dimension was taken from painted pixels.

## Evidence and constraint boundary

- **Measurement-derived evidence:** the accepted Room A, Room B/WC and Room C records, including the conflicting WC widths of 1643 and 1685 mm, remain unchanged provenance.
- **Human-approved working geometry:** only the wall families mapped below are regularised. It is a preferred design/3D working candidate only after human review, not final measured geometry.

## Painted-guide topology mapping

| Guide | Exact model interpretation | Physical rendering |
|---|---|---|
| Room A upper guide | \`A0→A1\`, referenced to fixed \`A2→A3\` | wall |
| Room B left guide | \`B0→B4\`; adjacent \`D3-BR→B0.5\` remains separately fixed | real side wall plus distinct return |
| Room B/D5 right guide | \`B1→B2→B3\` | virtual reference through \`B1→B2\` opening; \`B2→B3\` wall |
| Room B bottom guide | \`B4→B3\` | wall, perpendicular to side families |
| WC/D5 guide | \`T0→D5-WCL→T3\` | virtual reference through opening, then wall on a distinct WC face |

D5 remains an opening. The clean SVG contains no wall through either D5 face or the \`B1→T0\` assembly gap.

## Before/after wall-family results

| Area | Nodes/segments | Original | Constrained | Max movement | RMS movement |
|---|---|---:|---:|---:|---:|
| Room A upper | \`A0→A1\`, \`A1→A2\`, reference \`A2→A3\` | direction ${m.before.aUpperDirectionDegrees.toFixed(3)}°; reference offset ${m.before.aUpperReferenceDeviationDegrees.toFixed(3)}°; A1 ${m.before.a1AngleDegrees.toFixed(3)}° | direction ${m.after.aUpperDirectionDegrees.toFixed(3)}°; reference offset ${m.after.aUpperReferenceDeviationDegrees.toFixed(3)}°; A1 ${m.after.a1AngleDegrees.toFixed(3)}° | ${areaMax("A").toFixed(2)} mm | ${output.beforeAfter.movements.rmsByAreaMm.roomA.toFixed(2)} mm |
| Room B left/right families | \`B0→B4\`; \`B1→B2→B3\` | ${m.before.bLeftDirectionDegrees.toFixed(3)}° / ${m.before.bRightDirectionDegrees.toFixed(3)}°; taper ${m.before.bSideTaperDegrees.toFixed(3)}° | ${m.after.bLeftDirectionDegrees.toFixed(3)}° / ${m.after.bRightDirectionDegrees.toFixed(3)}°; taper ${m.after.bSideTaperDegrees.toFixed(3)}° | ${areaMax("B").toFixed(2)} mm | ${output.beforeAfter.movements.rmsByAreaMm.roomB.toFixed(2)} mm |
| Room B bottom | \`B4→B3\` against right family | direction ${m.before.bBottomDirectionDegrees.toFixed(3)}°; angle ${m.before.bBottomRightAngleDegrees.toFixed(3)}° | direction ${m.after.bBottomDirectionDegrees.toFixed(3)}°; angle ${m.after.bBottomRightAngleDegrees.toFixed(3)}° | ${areaMax("B").toFixed(2)} mm | included above |
| Room B D5 line | \`B1→B2→B3\` | break ${m.before.bD5LineDeviationDegrees.toFixed(6)}° | break ${m.after.bD5LineDeviationDegrees.toFixed(6)}° | ${areaMax("B").toFixed(2)} mm | included above |
| WC rectangle/D5 face | \`T0,T1,T2,T3,D5-WCL\` | ${m.before.wcCornerAngleDegrees.toFixed(3)}°; kink ${m.before.wcKinkDeviationDegrees.toFixed(6)}° | ${m.after.wcCornerAngleDegrees.toFixed(3)}°; kink ${m.after.wcKinkDeviationDegrees.toFixed(6)}° | ${areaMax("WC").toFixed(2)} mm | ${output.beforeAfter.movements.rmsByAreaMm.wc.toFixed(2)} mm |

The unchanged v0.1 \`B1→B2→B3\` family (${bearing(familyA).toFixed(3)}°) is the directional datum for the Room B correction. \`B4\` alone is moved to make \`B0→B4\` parallel and \`B4→B3\` perpendicular (${bearing(familyB).toFixed(3)}°). The already-rectangular WC and the separate fixed \`D3-BR→B0.5\` return are not re-solved. This honours the markup without treating its pixels as survey geometry.

## Node movement from v0.1

| Area | Node | ΔX mm | ΔY mm | Movement mm |
|---|---|---:|---:|---:|
${movementRows()}

Maximum displacement is **${maximumMovement.magnitudeMm.toFixed(2)} mm at ${maximumMovement.room}:${maximumMovement.id}**. RMS across moved nodes is **${output.beforeAfter.movements.rmsMovedNodesMm.toFixed(2)} mm**. Every unlisted node is unchanged.

## Measurement consequences

| Metric | v0.1 before | v0.2 after |
|---|---:|---:|
| Total comparable RMS (${s.count} observations) | ${s.totalRmsBeforeMm.toFixed(2)} mm | ${s.totalRmsAfterMm.toFixed(2)} mm |
| Room A RMS | ${s.roomARmsBeforeMm.toFixed(2)} mm | ${s.roomARmsAfterMm.toFixed(2)} mm |
| Room B RMS | ${s.roomBRmsBeforeMm.toFixed(2)} mm | ${s.roomBRmsAfterMm.toFixed(2)} mm |
| WC RMS | ${s.wcRmsBeforeMm.toFixed(2)} mm | ${s.wcRmsAfterMm.toFixed(2)} mm |
| Worst residual | \`${s.worstBefore.id}\` ${signed(s.worstBefore.residualMm)} mm | \`${s.worstAfter.id}\` ${signed(s.worstAfter.residualMm)} mm |

Largest changed direct-observation residuals:

| Observation | Before mm | After mm | Change mm |
|---|---:|---:|---:|
${consequenceRows()}

The WC remains an exact architectural rectangle despite the retained 42 mm conflict between its 1643 and 1685 mm opposing-width observations. The evidence is preserved; the working outline does not reproduce the measurement conflict as a kink.

## Independent validation

| Span | Measured | v0.1 model | v0.1 residual | v0.2 model | v0.2 residual |
|---|---:|---:|---:|---:|---:|
| Far Room A wall through D2 to opposite Room C wall | 9019 | ${v.span9019.modelBeforeMm.toFixed(2)} | ${signed(v.span9019.residualBeforeMm)} | ${v.span9019.modelAfterMm.toFixed(2)} | ${signed(v.span9019.residualAfterMm)} |
| Room C partition outer face through D3 to Room B back wall | 3726 | ${v.span3726.modelBeforeMm.toFixed(2)} | ${signed(v.span3726.residualBeforeMm)} | ${v.span3726.modelAfterMm.toFixed(2)} | ${signed(v.span3726.residualAfterMm)} |

## Preservation and review gate

Room C movement is **0.00 mm**. D2, D3, the D3 shared-door layers, both endpoints of \`D3-BR→B0.5\`, the Room A D2 casing, Room C cupboards, global scale and all accepted measurement baselines remain unchanged. \`B0.5\` remains the genuine separate return corner.

This candidate requires human visual review. It is not promoted to a final shell, and no 3D work follows from this task.
`;
}

fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}_DIAGNOSTIC.svg`), `${makeSvg({ diagnostic: true })}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  directions: { before: output.beforeAfter.metrics.before, after: output.beforeAfter.metrics.after },
  movement: output.beforeAfter.movements,
  measurements: output.beforeAfter.measurementSummary,
  validations: output.beforeAfter.validations,
}, null, 2));

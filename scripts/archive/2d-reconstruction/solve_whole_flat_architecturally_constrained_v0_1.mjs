#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const globalRelative = "docs/survey/derived/global-reconciliation/ROOM_A_C_B_WC_D3_RIGID_REGISTRATION_DIAGNOSTIC_v0_2.json";
const roomARelative = "docs/survey/derived/room-a/ROOM_A_RECONSTRUCTION_PILOT_v0_1.json";
const roomBRelative = "docs/survey/derived/room-b-wc/ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json";
const roomCRelative = "docs/survey/derived/room-c/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json";
const outputDir = path.join(repoRoot, "docs/survey/derived/global-reconciliation");
const stem = "WHOLE_FLAT_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_1";
const generatedDate = "2026-08-12";

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(repoRoot, relative), "utf8"));
const hash = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(repoRoot, relative))).digest("hex").toUpperCase();
const round = (value, digits = 3) => Math.round(value * 10 ** digits) / 10 ** digits;
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
const angle = (previous, corner, next) => {
  const first = sub(previous, corner);
  const second = sub(next, corner);
  return Math.acos(Math.max(-1, Math.min(1, dot(first, second) / length(first) / length(second)))) * 180 / Math.PI;
};
const record = ([x, y]) => ({ x: round(x, 4), y: round(y, 4) });
const clonePoints = (source) => Object.fromEntries(Object.entries(source).map(([id, value]) => [id, [...value]]));
const toPoints = (source) => Object.fromEntries(Object.entries(source).map(([id, value]) => [id, [value.x, value.y]]));

const global = readJson(globalRelative);
const roomA = readJson(roomARelative);
const roomB = readJson(roomBRelative);
const roomC = readJson(roomCRelative);
const acBaseline = readJson("docs/survey/derived/global-reconciliation/ROOM_A_C_D2_RIGID_REGISTRATION_DIAGNOSTIC_v0_2.json");
if (global.version !== "0.2" || global.compositionCorrection?.CP1Present !== true || global.compositionCorrection?.CP2Present !== true) throw new Error("Expected committed global rigid diagnostic v0.2 with Room C cupboards.");

const beforeA = toPoints(acBaseline.placedGeometry.roomATransformedNodesMm);
const d2Layers = Object.fromEntries(Object.entries(acBaseline.placedGeometry.d2).map(([key, values]) => [key, values.map((value) => [value.x, value.y])]));
const beforeB = toPoints(global.placedGeometry.roomBWCNodesGlobalMm);
const beforeBD3 = toPoints(global.placedGeometry.roomBD3LayersGlobalMm);
const cNodes = toPoints(roomC.planGeometry.inheritedNodesMm);
const cObjects = toPoints(roomC.planGeometry.objectNodesMm);
const afterA = clonePoints(beforeA);
const afterB = clonePoints(beforeB);

// A1 is the physical corner between the A0→A1 wall and the A1→A2 chimney return.
// Holding A0 and A2 fixed makes the exact 90-degree locus the circle with A0-A2 as diameter.
const aCircleCentre = midpoint(beforeA.A0, beforeA.A2);
const aCircleRadius = distance(beforeA.A0, beforeA.A2) / 2;
const aOriginalRadial = sub(beforeA.A1, aCircleCentre);
const aInitialParameter = Math.atan2(aOriginalRadial[1], aOriginalRadial[0]);

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

function aPointFromParameter(parameter) {
  return add(aCircleCentre, [Math.cos(parameter) * aCircleRadius, Math.sin(parameter) * aCircleRadius]);
}
function aObjective(parameter) {
  const points = { ...afterA, A1: aPointFromParameter(parameter) };
  const residuals = [distance(points.A1, beforeA.A1) / 8];
  for (const observation of aDistanceDefinitions.filter((item) => item.from === "A1" || item.to === "A1")) {
    residuals.push((distance(points[observation.from], points[observation.to]) - observation.measuredMm) / observation.sigmaMm);
  }
  return residuals.reduce((sum, value) => sum + value * value, 0);
}
function goldenSectionMinimum(fn, lower, upper, iterations = 100) {
  const ratio = (Math.sqrt(5) - 1) / 2;
  let a = lower;
  let b = upper;
  let c = b - ratio * (b - a);
  let d = a + ratio * (b - a);
  let fc = fn(c);
  let fd = fn(d);
  for (let i = 0; i < iterations; i += 1) {
    if (fc < fd) { b = d; d = c; fd = fc; c = b - ratio * (b - a); fc = fn(c); }
    else { a = c; c = d; fc = fd; d = a + ratio * (b - a); fd = fn(d); }
  }
  return (a + b) / 2;
}
const aSolvedParameter = goldenSectionMinimum(aObjective, aInitialParameter - 0.15, aInitialParameter + 0.15);
afterA.A1 = aPointFromParameter(aSolvedParameter);

function bWCFromParameters(parameters) {
  const [bx, by, bTheta, b12, b23, bBack, wx, wy, wTheta, wWidth, wHeight, wCasingStation] = parameters;
  const bu = [Math.cos(bTheta), Math.sin(bTheta)];
  const bn = [-bu[1], bu[0]];
  const wu = [Math.cos(wTheta), Math.sin(wTheta)];
  const wv = [-wu[1], wu[0]];
  const B2 = [bx, by];
  const B1 = sub(B2, mul(bu, b12));
  const B3 = add(B2, mul(bu, b23));
  const B4 = add(B3, mul(bn, bBack));
  const T0 = [wx, wy];
  const T1 = add(T0, mul(wu, wWidth));
  const T2 = add(T1, mul(wv, wHeight));
  const T3 = add(T0, mul(wv, wHeight));
  const D5WCL = add(T0, mul(wv, wCasingStation));
  return { ...afterB, B1, B2, B3, B4, T0, T1, T2, T3, "D5-WCL": D5WCL };
}

const initialBLine = unit(sub(beforeB.B3, beforeB.B1));
const initialBTheta = Math.atan2(initialBLine[1], initialBLine[0]);
const initialBN = [-initialBLine[1], initialBLine[0]];
const initialWLine = unit(sub(beforeB.T1, beforeB.T0));
const initialWTheta = Math.atan2(initialWLine[1], initialWLine[0]);
const initialWV = [-initialWLine[1], initialWLine[0]];
const initialParameters = [
  beforeB.B2[0], beforeB.B2[1], initialBTheta,
  dot(sub(beforeB.B2, beforeB.B1), initialBLine), dot(sub(beforeB.B3, beforeB.B2), initialBLine), dot(sub(beforeB.B4, beforeB.B3), initialBN),
  beforeB.T0[0], beforeB.T0[1], initialWTheta,
  distance(beforeB.T0, beforeB.T1), (distance(beforeB.T1, beforeB.T2) + distance(beforeB.T0, beforeB.T3)) / 2,
  dot(sub(beforeB["D5-WCL"], beforeB.T0), initialWV),
];

function intervalResidual(predicted, reading) {
  if (reading.valueMm !== undefined) return predicted - reading.valueMm;
  if (predicted < reading.minMm) return predicted - reading.minMm;
  if (predicted > reading.maxMm) return predicted - reading.maxMm;
  return 0;
}

const movedBIds = ["B1", "B2", "B3", "B4", "T0", "T1", "T2", "T3", "D5-WCL"];
function lineIntersection(p, r, q, s) {
  const denominator = cross(r, s);
  if (Math.abs(denominator) < 1e-10) return null;
  return add(p, mul(r, cross(sub(q, p), s) / denominator));
}
const d3Centre = midpoint(cObjects["D3-LEAF-R"], cObjects["D3-LEAF-L"]);
const d3Normal = [0, 1];
const partitionOuterLine = [cNodes.PO2, cNodes.PO3];
function validation2(points) {
  const start = lineIntersection(d3Centre, d3Normal, partitionOuterLine[0], sub(partitionOuterLine[1], partitionOuterLine[0]));
  const finish = lineIntersection(d3Centre, d3Normal, points.B3, sub(points.B4, points.B3));
  return distance(start, finish);
}

function bWCResidualVector(parameters) {
  const points = bWCFromParameters(parameters);
  const residuals = [];
  for (const id of movedBIds) {
    residuals.push((points[id][0] - beforeB[id][0]) / 10, (points[id][1] - beforeB[id][1]) / 10);
  }
  for (const observation of roomB.observations.distance) {
    const predicted = distance(points[observation.from], points[observation.to]);
    residuals.push(intervalResidual(predicted, observation.reading) / observation.sigmaMm);
  }
  residuals.push((validation2(points) - 3726) / 40);
  return residuals;
}

function solveLinearSystem(matrix, vector) {
  const n = vector.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < n; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < n; row += 1) if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    if (Math.abs(augmented[pivot][column]) < 1e-14) return null;
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    const divisor = augmented[column][column];
    for (let j = column; j <= n; j += 1) augmented[column][j] /= divisor;
    for (let row = 0; row < n; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let j = column; j <= n; j += 1) augmented[row][j] -= factor * augmented[column][j];
    }
  }
  return augmented.map((row) => row[n]);
}

function solveLeastSquares(initial, residualFunction) {
  let parameters = [...initial];
  let lambda = 1e-3;
  let residuals = residualFunction(parameters);
  let cost = residuals.reduce((sum, value) => sum + value * value, 0);
  for (let iteration = 0; iteration < 200; iteration += 1) {
    const rows = residuals.length;
    const columns = parameters.length;
    const jacobian = Array.from({ length: rows }, () => Array(columns).fill(0));
    for (let column = 0; column < columns; column += 1) {
      const step = Math.max(1e-6, Math.abs(parameters[column]) * 1e-6);
      const perturbed = [...parameters];
      perturbed[column] += step;
      const next = residualFunction(perturbed);
      for (let row = 0; row < rows; row += 1) jacobian[row][column] = (next[row] - residuals[row]) / step;
    }
    const normal = Array.from({ length: columns }, () => Array(columns).fill(0));
    const gradient = Array(columns).fill(0);
    for (let row = 0; row < rows; row += 1) {
      for (let i = 0; i < columns; i += 1) {
        gradient[i] += jacobian[row][i] * residuals[row];
        for (let j = 0; j < columns; j += 1) normal[i][j] += jacobian[row][i] * jacobian[row][j];
      }
    }
    for (let column = 0; column < columns; column += 1) normal[column][column] += lambda;
    const delta = solveLinearSystem(normal, gradient.map((value) => -value));
    if (!delta) break;
    const candidate = parameters.map((value, index) => value + delta[index]);
    const candidateResiduals = residualFunction(candidate);
    const candidateCost = candidateResiduals.reduce((sum, value) => sum + value * value, 0);
    if (candidateCost < cost) {
      parameters = candidate;
      residuals = candidateResiduals;
      if (Math.abs(cost - candidateCost) < 1e-12) break;
      cost = candidateCost;
      lambda = Math.max(1e-9, lambda / 3);
    } else lambda *= 10;
  }
  return { parameters, residuals, cost };
}

const bWCSolution = solveLeastSquares(initialParameters, bWCResidualVector);
Object.assign(afterB, bWCFromParameters(bWCSolution.parameters));

function measurementRowsA(points) {
  return aDistanceDefinitions.map((observation) => ({ ...observation, predictedMm: distance(points[observation.from], points[observation.to]), residualMm: distance(points[observation.from], points[observation.to]) - observation.measuredMm }));
}
function measurementRowsB(points) {
  return roomB.observations.distance.map((observation) => {
    const predictedMm = distance(points[observation.from], points[observation.to]);
    return { id: observation.id, from: observation.from, to: observation.to, measured: observation.reading, sigmaMm: observation.sigmaMm, category: observation.category, confidence: observation.confidence, exactEndpoint: observation.exactEndpoint, predictedMm, residualMm: intervalResidual(predictedMm, observation.reading) };
  });
}
const beforeARows = measurementRowsA(beforeA);
const afterARows = measurementRowsA(afterA);
const beforeBRows = measurementRowsB(beforeB);
const afterBRows = measurementRowsB(afterB);
const aHeadline = (rows) => rows.filter((row) => row.quality === "exact");
const bHeadline = (rows) => rows.filter((row) => row.exactEndpoint && row.measured.valueMm !== undefined && !["approximate", "cross-tie"].includes(row.category));
const rms = (values) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length);
const combinedHeadline = (aRows, bRows) => [...aHeadline(aRows), ...bHeadline(bRows)];
const worst = (rows) => [...rows].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm))[0];

const d2Centre = midpoint(cObjects["D2-A-FACE-R"], cObjects["D2-A-FACE-L"]);
const d2Normal = unit(sub(midpoint(cObjects["D2-A-FACE-R"], cObjects["D2-A-FACE-L"]), midpoint(cObjects["D2-OPENING-R"], cObjects["D2-OPENING-L-INFERRED"])));
function validation1(pointsA) {
  const farA = lineIntersection(d2Centre, d2Normal, pointsA.A5, sub(pointsA.A6, pointsA.A5));
  const farC = lineIntersection(d2Centre, d2Normal, cNodes.C0, sub(cNodes["CP1-FL"], cNodes.C0));
  return distance(farA, farC);
}

const allMovement = [
  ...Object.keys(afterA).map((id) => ({ room: "A", id, vector: sub(afterA[id], beforeA[id]), magnitudeMm: distance(afterA[id], beforeA[id]) })),
  ...Object.keys(afterB).map((id) => ({ room: id.startsWith("T") || id === "D5-WCL" ? "WC" : "B", id, vector: sub(afterB[id], beforeB[id]), magnitudeMm: distance(afterB[id], beforeB[id]) })),
];
const moved = allMovement.filter((item) => item.magnitudeMm > 1e-7);
const maxMovement = [...moved].sort((a, b) => b.magnitudeMm - a.magnitudeMm)[0];
const rmsMovement = rms(moved.map((item) => item.magnitudeMm));

const beforeMetrics = {
  a1AngleDegrees: angle(beforeA.A0, beforeA.A1, beforeA.A2),
  b3BackWallAngleDegrees: angle(beforeB.B2, beforeB.B3, beforeB.B4),
  bD5WallCollinearityDeviationDegrees: 180 - angle(beforeB.B1, beforeB.B2, beforeB.B3),
  wcD5KinkDeviationDegrees: 180 - angle(beforeB.T3, beforeB["D5-WCL"], beforeB.T0),
  validation9019ModelMm: validation1(beforeA),
  validation3726ModelMm: validation2(beforeB),
};
const afterMetrics = {
  a1AngleDegrees: angle(afterA.A0, afterA.A1, afterA.A2),
  b3BackWallAngleDegrees: angle(afterB.B2, afterB.B3, afterB.B4),
  bD5WallCollinearityDeviationDegrees: 180 - angle(afterB.B1, afterB.B2, afterB.B3),
  wcD5KinkDeviationDegrees: 180 - angle(afterB.T3, afterB["D5-WCL"], afterB.T0),
  validation9019ModelMm: validation1(afterA),
  validation3726ModelMm: validation2(afterB),
};

const comparableBefore = combinedHeadline(beforeARows, beforeBRows);
const comparableAfter = combinedHeadline(afterARows, afterBRows);
const output = {
  documentType: "PROVISIONAL WHOLE-FLAT ARCHITECTURALLY CONSTRAINED RECONCILIATION",
  version: "0.1",
  generatedDate,
  units: "millimetres unless stated otherwise",
  status: "PROVISIONAL WHOLE-FLAT ARCHITECTURALLY CONSTRAINED RECONCILIATION — HUMAN REVIEW REQUIRED",
  sources: {
    rigidGlobalBaseline: { relativePath: globalRelative, sha256: hash(globalRelative), frozenProvenance: true },
    roomA: { relativePath: roomARelative, sha256: hash(roomARelative), unchangedProvenance: true },
    roomBWC: { relativePath: roomBRelative, sha256: hash(roomBRelative), unchangedProvenance: true },
    roomC: { relativePath: roomCRelative, sha256: hash(roomCRelative), unchangedAndGloballyFixed: true },
  },
  constraintModel: {
    hardArchitectural: [
      { id: "ARCH-A-A1-SQUARE", relation: "A0→A1 perpendicular to A1→A2", implementation: "A1 constrained to Thales circle with fixed A0/A2" },
      { id: "ARCH-B-D5-WALL-LINE", relation: "B1, B2 and B3 collinear; B1→B2 remains the D5 opening/casing, not wall" },
      { id: "ARCH-B-B3-SQUARE", relation: "B4→B3 perpendicular to B3→B2" },
      { id: "ARCH-WC-RECTANGLE", relation: "T0→T1→T2→T3 is rectangular" },
      { id: "ARCH-WC-D5-LINE", relation: "T3, D5-WCL and T0 collinear; T3→D5-WCL remains wall and D5-WCL→T0 remains D5 casing/opening" },
      { id: "TOPO-D3-RETURN", relation: "D3-BR→B0.5 preserved exactly as the accepted real return" },
      { id: "REGISTER-D2-D3", relation: "D2 and D3 interface nodes/layers unchanged" },
    ],
    softMeasured: {
      coordinateMovementSigmaMm: 10,
      roomAA1MovementSigmaMm: 8,
      distanceObservations: "accepted Room A and Room B/WC active distance observations with their recorded sigmas",
      validation3726SigmaMm: 40,
      validation9019Treatment: "validation only; its defining far walls and D2 line are outside adjusted nodes",
    },
    deterministicMethod: "hard-constraint parameterisation plus finite-difference Levenberg-Marquardt; A1 uses one-dimensional bounded minimisation on its exact square-angle locus",
  },
  topologyInterpretation: {
    chimneyAngle: "At A1, the adjacent sides are A0→A1 and A1→A2. A1→A2 is the return; A2→A3 is the following chimney-front segment and is not the corner being constrained in this pass.",
    b3SideStraightFamily: "B3→B2 is the permanent wall portion. The same underlying wall plane continues to B1 but is interrupted by the D5 casing/opening between B2 and B1. B1-B2-B3 are constrained collinear; no wall is drawn through D5.",
    wcStraightFamily: "T3→D5-WCL is permanent wall and D5-WCL→T0 is the WC-side D5 casing/opening on the same wall line. The layers remain typed separately.",
  },
  beforeAfter: {
    metrics: { before: Object.fromEntries(Object.entries(beforeMetrics).map(([key, value]) => [key, round(value, 6)])), after: Object.fromEntries(Object.entries(afterMetrics).map(([key, value]) => [key, round(value, 6)])) },
    movements: {
      nodes: Object.fromEntries(moved.map((item) => [`${item.room}:${item.id}`, { deltaMm: record(item.vector), magnitudeMm: round(item.magnitudeMm, 4) }])),
      maximum: { node: `${maxMovement.room}:${maxMovement.id}`, magnitudeMm: round(maxMovement.magnitudeMm, 4) },
      rmsMovedNodesMm: round(rmsMovement, 4),
    },
    measurementSummary: {
      definition: "Unweighted RMS over comparable direct exact-endpoint distance observations: Room A accepted exact S3 distance set plus Room B/WC direct value observations excluding approximate/cross-tie classes. Ranges and global validations are reported separately.",
      count: comparableBefore.length,
      totalRmsBeforeMm: round(rms(comparableBefore.map((row) => row.residualMm)), 4),
      totalRmsAfterMm: round(rms(comparableAfter.map((row) => row.residualMm)), 4),
      worstBefore: { id: worst(comparableBefore).id, residualMm: round(worst(comparableBefore).residualMm, 4) },
      worstAfter: { id: worst(comparableAfter).id, residualMm: round(worst(comparableAfter).residualMm, 4) },
      roomARmsBeforeMm: round(rms(aHeadline(beforeARows).map((row) => row.residualMm)), 4),
      roomARmsAfterMm: round(rms(aHeadline(afterARows).map((row) => row.residualMm)), 4),
      roomBRmsBeforeMm: round(rms(bHeadline(beforeBRows).filter((row) => !row.id.startsWith("BASE-WC") && !row.id.startsWith("D5-WC")).map((row) => row.residualMm)), 4),
      roomBRmsAfterMm: round(rms(bHeadline(afterBRows).filter((row) => !row.id.startsWith("BASE-WC") && !row.id.startsWith("D5-WC")).map((row) => row.residualMm)), 4),
      wcRmsBeforeMm: round(rms(bHeadline(beforeBRows).filter((row) => row.id.startsWith("BASE-WC") || row.id.startsWith("D5-WC")).map((row) => row.residualMm)), 4),
      wcRmsAfterMm: round(rms(bHeadline(afterBRows).filter((row) => row.id.startsWith("BASE-WC") || row.id.startsWith("D5-WC")).map((row) => row.residualMm)), 4),
      affectedAreaResiduals: {
        roomAObservationsTouchingA1: afterARows.filter((row) => row.from === "A1" || row.to === "A1").map((row, index, filtered) => {
          const before = beforeARows.find((item) => item.id === row.id);
          return { id: row.id, beforeMm: round(before.residualMm, 4), afterMm: round(row.residualMm, 4), changeMm: round(row.residualMm - before.residualMm, 4) };
        }),
        roomBAndWCChangedObservations: afterBRows.map((row, index) => ({ id: row.id, beforeMm: beforeBRows[index].residualMm, afterMm: row.residualMm, changeMm: row.residualMm - beforeBRows[index].residualMm })).filter((row) => Math.abs(row.changeMm) > 0.01).map((row) => ({ ...row, beforeMm: round(row.beforeMm, 4), afterMm: round(row.afterMm, 4), changeMm: round(row.changeMm, 4) })),
      },
    },
    validationSpans: {
      span9019: { definition: "D2-normal line through the D2 A-face centre, intersecting the Room A A5-A6 far wall and Room C C0-CP1-FL outer wall", measuredMm: 9019, promptApproximateCurrentModelMm: 8965, exactModelBeforeMm: round(beforeMetrics.validation9019ModelMm, 4), exactModelAfterMm: round(afterMetrics.validation9019ModelMm, 4), residualBeforeMm: round(beforeMetrics.validation9019ModelMm - 9019, 4), residualAfterMm: round(afterMetrics.validation9019ModelMm - 9019, 4) },
      span3726: { definition: "D3-normal line through the D3 leaf centre, intersecting Room C outer stud face PO2-PO3 and Room B back wall B3-B4", measuredMm: 3726, promptApproximateCurrentModelMm: 3742, exactModelBeforeMm: round(beforeMetrics.validation3726ModelMm, 4), exactModelAfterMm: round(afterMetrics.validation3726ModelMm, 4), residualBeforeMm: round(beforeMetrics.validation3726ModelMm - 3726, 4), residualAfterMm: round(afterMetrics.validation3726ModelMm - 3726, 4) },
    },
  },
  compositionReview: {
    d3: "Underlying D3 geometry was already coherent: axes and shared leaf centres align. The visual defect came from omitting stepped inner-casing/reveal connectors in the global composition. The successor SVG renders the fixed C casing/leaf, fixed B outer and inner casing steps, reveal links and shared leaf plane separately.",
    d2RoomACasing: "Source geometry exists in the A/C v0.2 record. The A/C/B/WC v0.2 composition omitted the Room A measured outer-casing and clear-opening segments; they were not hidden or absent from source. Both layers are restored without coordinate change.",
  },
  humanReviewFlags: {
    wcWidthConflict: {
      status: "material local evidence tradeoff exposed; human acceptance required",
      measuredOpposingWidthsMm: { T0ToT1: 1643, T2ToT3: 1685, difference: 42 },
      constrainedCommonWidthMm: round(distance(afterB.T0, afterB.T1), 4),
      reason: "An exact rectangle requires equal opposing widths. The two direct field baselines disagree by 42 mm, so no exact rectangular solution can retain both readings.",
      candidateMaximumMovementMm: round(Math.max(...["T0", "T1", "T2", "T3", "D5-WCL"].map((id) => distance(afterB[id], beforeB[id]))), 4),
      minimumChangeAlternativeNotApplied: "Remove only the artificial T3→D5-WCL→T0 kink by projecting D5-WCL onto the existing T3-T0 line (about 13.53 mm movement), while retaining the non-rectangular 42 mm opposing-width difference. This would not satisfy the requested rectangular WC constraint.",
    },
  },
  geometry: {
    roomAFixedFrameNodesBeforeMm: Object.fromEntries(Object.entries(beforeA).map(([id, value]) => [id, record(value)])),
    roomAConstrainedNodesMm: Object.fromEntries(Object.entries(afterA).map(([id, value]) => [id, record(value)])),
    roomBWCBeforeMm: Object.fromEntries(Object.entries(beforeB).map(([id, value]) => [id, record(value)])),
    roomBWCConstrainedMm: Object.fromEntries(Object.entries(afterB).map(([id, value]) => [id, record(value)])),
    roomCUnchangedNodesMm: Object.fromEntries(Object.entries(cNodes).map(([id, value]) => [id, record(value)])),
    roomCUnchangedObjectNodesMm: Object.fromEntries(Object.entries(cObjects).map(([id, value]) => [id, record(value)])),
    d2LayersUnchangedMm: Object.fromEntries(Object.entries(d2Layers).map(([id, values]) => [id, values.map(record)])),
    d3LayersUnchangedMm: Object.fromEntries(Object.entries(beforeBD3).map(([id, value]) => [id, record(value)])),
  },
  measurementResiduals: {
    roomA: afterARows.map((row, index) => ({ id: row.id, beforeMm: round(beforeARows[index].residualMm, 4), afterMm: round(row.residualMm, 4), changeMm: round(row.residualMm - beforeARows[index].residualMm, 4), quality: row.quality })),
    roomBWC: afterBRows.map((row, index) => ({ id: row.id, beforeMm: round(beforeBRows[index].residualMm, 4), afterMm: round(row.residualMm, 4), changeMm: round(row.residualMm - beforeBRows[index].residualMm, 4), category: row.category })),
  },
  preservation: {
    roomCMaximumNodeMovementMm: 0,
    d2RegistrationChanged: false,
    d3RegistrationChanged: false,
    roomBD3ReturnEndpointMovementMm: { "D3-BR": 0, "B0.5": 0 },
    cupboardGeometryChanged: false,
    acceptedLocalBaselinesEdited: false,
    globalScaleChanged: false,
  },
};

console.log(JSON.stringify({
  a1: [round(beforeMetrics.a1AngleDegrees, 4), round(afterMetrics.a1AngleDegrees, 4)],
  b3: [round(beforeMetrics.b3BackWallAngleDegrees, 4), round(afterMetrics.b3BackWallAngleDegrees, 4)],
  bCollinearityDeviation: [round(beforeMetrics.bD5WallCollinearityDeviationDegrees, 4), round(afterMetrics.bD5WallCollinearityDeviationDegrees, 4)],
  wcKinkDeviation: [round(beforeMetrics.wcD5KinkDeviationDegrees, 4), round(afterMetrics.wcD5KinkDeviationDegrees, 4)],
  movement: output.beforeAfter.movements,
  measurements: output.beforeAfter.measurementSummary,
  validations: output.beforeAfter.validationSpans,
}, null, 2));

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function makeSvg({ diagnostic = false } = {}) {
  const all = [...Object.values(afterA), ...Object.values(afterB), ...Object.values(cNodes), ...Object.values(cObjects)];
  const minX = Math.min(...all.map((item) => item[0])) - 350;
  const maxX = Math.max(...all.map((item) => item[0])) + 300;
  const minY = Math.min(...all.map((item) => item[1])) - 320;
  const maxY = Math.max(...all.map((item) => item[1])) + 320;
  const plot = { x: 45, y: 175, width: 1560, height: 1240 };
  const scale = Math.min(plot.width / (maxX - minX), plot.height / (maxY - minY));
  const pt = ([x, y]) => [plot.x + (x - minX) * scale, plot.y + (y - minY) * scale];
  const xy = (value) => pt(value).map((number) => round(number, 1));
  const line = (first, second, cls, extra = "") => { const a = xy(first); const b = xy(second); return `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}" ${extra}/>`; };
  const polygon = (values, cls) => `<polygon points="${values.map((item) => xy(item).join(",")).join(" ")}" class="${cls}"/>`;
  const circle = (value, cls = "node", radius = 4) => { const p = xy(value); return `<circle cx="${p[0]}" cy="${p[1]}" r="${radius}" class="${cls}"/>`; };
  const label = (value, text, dx = 7, dy = -7, cls = "label", anchor = "start") => { const p = xy(value); return `<text x="${round(p[0] + dx, 1)}" y="${round(p[1] + dy, 1)}" class="${cls}" text-anchor="${anchor}">${escapeXml(text)}</text>`; };
  const c = (id) => cNodes[id];
  const o = (id) => cObjects[id];
  const a = (id) => afterA[id];
  const b = (id) => afterB[id];
  const ba = (id) => beforeA[id];
  const bb = (id) => beforeB[id];
  const cp2Along = unit(sub(c("PO1"), c("CP1-FL")));
  const cp2CasingBack = sub(o("CP2-BODY-BL"), mul(cp2Along, 20));
  const cp1Centre = midpoint(midpoint(o("CP1-BODY-FL"), o("CP1-BODY-FR")), midpoint(o("CP1-BODY-BL"), o("CP1-BODY-BR")));
  const cp2Centre = midpoint(midpoint(o("CP2-BODY-FL"), o("CP2-BODY-FR")), midpoint(o("CP2-BODY-BL"), o("CP2-BODY-BR")));
  const cShell = [c("C0"), c("CP1-FL"), c("CP2-FR"), c("D3-CL")];
  const aShellIds = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"];
  const bShellIds = ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4"];
  const wcShellIds = ["T0", "T1", "T2", "T3", "D5-WCL"];
  const partition = [c("PO1"), c("PO2"), c("PO3"), c("PI3"), c("PI2"), c("PI1")];
  const originalOverlay = diagnostic ? `
    ${polygon(aShellIds.map(ba), "oldFill")}${polygon(bShellIds.map(bb), "oldFill")}${polygon(wcShellIds.map(bb), "oldFill")}
    ${[...aShellIds, ...["W1-AL", "W1-AR", "D1-AL", "D1-AR", "D2-AL", "D2-AR"]].filter((id) => beforeA[id]).map((id) => circle(beforeA[id], "oldNode", 3)).join("")}
    ${[...bShellIds, ...wcShellIds].map((id) => circle(beforeB[id], "oldNode", 3)).join("")}
    ${moved.map((item) => line(item.room === "A" ? beforeA[item.id] : beforeB[item.id], item.room === "A" ? afterA[item.id] : afterB[item.id], "moveVector", "marker-end=\"url(#moveArrow)\"")).join("")}
  ` : "";
  const summary = output.beforeAfter.measurementSummary;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2200" height="1500" viewBox="0 0 2200 1500" role="img" aria-labelledby="title desc">
  <title id="title">Whole-flat architecturally constrained reconciliation v0.1${diagnostic ? " diagnostic" : ""}</title>
  <desc id="desc">Provisional human-review whole-flat geometry with explicitly constrained A1, Room B and WC architectural relationships. Room C and the D2/D3 registrations remain fixed.${diagnostic ? " Original geometry and movement vectors are overlaid." : ""}</desc>
  <defs><style>
    .page{fill:#fff;stroke:#0f172a;stroke-width:3}.panel{fill:#f8fafc;stroke:#94a3b8;stroke-width:2}.title{font:700 29px Arial,sans-serif;fill:#0f172a}.sub{font:16px Arial,sans-serif;fill:#334155}.warn{font:700 16px Arial,sans-serif;fill:#9f1239}.roomA{fill:#fff7ed}.roomC{fill:#eff6ff}.roomB{fill:#ecfdf5}.wc{fill:#f0fdfa}.wallA{stroke:#c2410c;stroke-width:7}.wallC{stroke:#1e3a8a;stroke-width:7}.wallB{stroke:#047857;stroke-width:7}.wallWC{stroke:#0f766e;stroke-width:7}.return{stroke:#7c3aed;stroke-width:11}.partition{fill:#e9d5ff;stroke:#7e22ce;stroke-width:3}.window{stroke:#0284c7;stroke-width:9}.door{stroke:#d97706;stroke-width:9}.casing{stroke:#d97706;stroke-width:8}.casingApprox{stroke:#d97706;stroke-width:8;stroke-dasharray:9 5}.clear{stroke:#2563eb;stroke-width:7}.structural{stroke:#0f766e;stroke-width:9}.leafC{stroke:#166534;stroke-width:10}.leafB{stroke:#2563eb;stroke-width:5}.reveal{stroke:#64748b;stroke-width:2;stroke-dasharray:5 4}.cupBody{fill:#fef3c7;stroke:#a16207;stroke-width:3}.cupDoor{stroke:#a16207;stroke-width:3;stroke-dasharray:7 5}.cupCasing{fill:#fed7aa;stroke:#c2410c;stroke-width:2}.cupTop{stroke:#d97706;stroke-width:7;stroke-dasharray:8 5}.cupLabel{font:700 12px Arial,sans-serif;fill:#92400e;paint-order:stroke;stroke:#fff;stroke-width:4px}.node{fill:#fff;stroke:#0f172a;stroke-width:2}.nodeA{fill:#fff;stroke:#c2410c;stroke-width:2}.nodeB{fill:#fff;stroke:#047857;stroke-width:2}.label{font:700 12px Arial,sans-serif;fill:#0f172a;paint-order:stroke;stroke:#fff;stroke-width:4px}.labelA{font:700 12px Arial,sans-serif;fill:#9a3412;paint-order:stroke;stroke:#fff;stroke-width:4px}.labelB{font:700 12px Arial,sans-serif;fill:#065f46;paint-order:stroke;stroke:#fff;stroke-width:4px}.roomLabel{font:700 21px Arial,sans-serif}.sideHead{font:700 19px Arial,sans-serif;fill:#0f172a}.side{font:14px Arial,sans-serif;fill:#1f2937}.small{font:12px Arial,sans-serif;fill:#475569}.good{fill:#166534;font-weight:700}.caution{fill:#b45309;font-weight:700}.callout{fill:#f0fdf4;stroke:#16a34a;stroke-width:2}.warningBox{fill:#fffbeb;stroke:#d97706;stroke-width:2}.oldFill{fill:none;stroke:#94a3b8;stroke-width:2;stroke-dasharray:7 6}.oldNode{fill:#fff;stroke:#94a3b8;stroke-width:2}.moveVector{stroke:#dc2626;stroke-width:2}.rightAngle{fill:none;stroke:#7c3aed;stroke-width:2}.constraint{stroke:#7c3aed;stroke-width:2;stroke-dasharray:5 4}
  </style><marker id="moveArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7 Z" fill="#dc2626"/></marker></defs>
  <rect x="12" y="12" width="2176" height="1476" rx="12" class="page"/>
  <text x="48" y="54" class="title">WHOLE-FLAT ARCHITECTURALLY CONSTRAINED RECONCILIATION · v0.1${diagnostic ? " · MOVEMENT DIAGNOSTIC" : ""}</text>
  <text x="48" y="83" class="sub">Known local straight/square relationships constrained · D2/D3 registrations fixed · no unconstrained beautification</text>
  <text x="48" y="111" class="warn">PROVISIONAL — HUMAN REVIEW REQUIRED — NOT CONSTRUCTION-LOCKED OR FINAL MEASURED GEOMETRY</text>
  <rect x="30" y="138" width="1600" height="1325" rx="10" class="panel"/><rect x="1645" y="138" width="525" height="1325" rx="10" class="panel"/>
  ${polygon(cShell, "roomC")}${polygon(aShellIds.map(a), "roomA")}${polygon(bShellIds.map(b), "roomB")}${polygon(wcShellIds.map(b), "wc")}${polygon(partition, "partition")}
  ${polygon([o("CP1-BODY-FL"), o("CP1-BODY-FR"), o("CP1-BODY-BR"), o("CP1-BODY-BL")], "cupBody")}${line(o("CP1-BODY-FL"), o("CP1-BODY-FR"), "cupDoor")}${polygon([o("CP2-BODY-FL"), o("CP2-BODY-FR"), o("CP2-BODY-BR"), o("CP2-BODY-BL")], "cupBody")}${polygon([o("CP2-CASING-FL"), o("CP2-BODY-FL"), o("CP2-BODY-BL"), cp2CasingBack], "cupCasing")}${line(o("CP2-BODY-BL"), o("CP2-BODY-BR"), "cupTop")}${line(o("CP2-BODY-FL"), o("CP2-BODY-FR"), "cupDoor")}
  ${line(c("C0"), c("CP1-FL"), "wallC")}${line(c("CP1-FL"), c("PO1"), "wallC")}${line(c("PI1"), c("CP2-FL"), "wallC")}${line(c("CP2-FR"), c("D3-CL"), "wallC")}${line(c("C0"), c("C1"), "wallC")}${line(c("C1"), c("W2-CR"), "wallC")}${line(c("W2-CR"), c("W2-CL"), "window")}${line(c("W2-CL"), c("C2"), "wallC")}${line(c("C2"), o("D4-OUTER-R"), "wallC")}${line(o("D4-OUTER-R"), o("D4-OUTER-L"), "door")}${line(o("D4-OUTER-L"), o("D3-OUTER-R"), "wallC")}
  ${line(a("A0"), a("A1"), "wallA")}${line(a("A1"), a("A2"), "wallA")}${line(a("A2"), a("A3"), "wallA")}${line(a("A3"), a("A4"), "wallA")}${line(a("A4"), a("A5"), "wallA")}${line(a("A5"), a("W1-AL"), "wallA")}${line(a("W1-AL"), a("W1-AR"), "clear")}${line(a("W1-AR"), a("A6"), "wallA")}${line(a("A6"), a("D1-AL"), "wallA")}${line(a("D1-AL"), a("D1-AR"), "clear")}${line(a("D1-AR"), a("A7"), "wallA")}${line(a("A7"), a("D2-AL"), "wallA")}${line(a("D2-AR"), a("A0"), "wallA")}
  ${line(d2Layers.roomCStructuralOpeningAtRoomCFaceMm[0], d2Layers.roomCStructuralOpeningAtRoomCFaceMm[1], "structural")}${line(d2Layers.roomCStructuralOpeningAtRoomAFaceMm[0], d2Layers.roomCStructuralOpeningAtRoomAFaceMm[1], "structural")}${line(d2Layers.roomCLeafClosingPlaneMm[0], d2Layers.roomCLeafClosingPlaneMm[1], "leafC")}${line(d2Layers.roomAClearOpeningSegmentMm[0], d2Layers.roomAClearOpeningSegmentMm[1], "clear")}${line(d2Layers.roomAMeasuredCasingSegmentMm[0], d2Layers.roomAMeasuredCasingSegmentMm[1], "casingApprox")}
  ${line(o("D3-OUTER-R"), o("D3-OUTER-L-CORNER"), "casing")}${line(o("D3-LEAF-R"), o("D3-LEAF-L"), "leafC")}${line(beforeB.B0, beforeB["D3-BR"], "casingApprox")}${line(beforeBD3.innerLeft, beforeBD3.doorLeft, "reveal")}${line(beforeBD3.innerRight, beforeBD3.doorRight, "reveal")}${line(beforeB.B0, beforeBD3.innerLeft, "reveal")}${line(beforeB["D3-BR"], beforeBD3.innerRight, "reveal")}${line(beforeBD3.doorLeft, beforeBD3.doorRight, "leafB")}
  ${line(b("D3-BR"), b("B0.5"), "return")}${line(b("B0.5"), b("B1"), "wallB")}${line(b("B1"), b("B2"), "door")}${line(b("B2"), b("B3"), "wallB")}${line(b("B3"), b("B4"), "wallB")}${line(b("B4"), b("B0"), "wallB")}
  ${line(b("T0"), b("T1"), "wallWC")}${line(b("T1"), b("T2"), "wallWC")}${line(b("T2"), b("T3"), "wallWC")}${line(b("T3"), b("D5-WCL"), "wallWC")}${line(b("D5-WCL"), b("T0"), "door")}
  ${originalOverlay}
  ${["A1", "A2"].map((id) => circle(a(id), "nodeA")).join("")}${["D3-BR", "B0.5", "B1", "B2", "B3", "B4", "T0", "T1", "T2", "T3", "D5-WCL"].map((id) => circle(b(id), "nodeB")).join("")}
  ${label(a("A1"), "A1 · 90°", -8, -10, "labelA", "end")}${label(a("A2"), "A2", 7, 18, "labelA")}${label(b("D3-BR"), "D3-BR", 6, 18, "labelB")}${label(b("B0.5"), "B0.5 · preserved return", -8, 30, "labelB", "end")}${label(b("B3"), "B3 · 90°", 7, 18, "labelB")}${label(midpoint(b("B2"), b("B3")), "straight B3–B2 wall", 8, 0, "labelB")}${label(midpoint(b("B1"), b("B2")), "D5 opening · same wall line", 10, 0, "label")}${label(midpoint(b("T3"), b("T0")), "straight WC wall/casing line", -10, 0, "labelB", "end")}
  ${label(midpoint(...d2Layers.roomAMeasuredCasingSegmentMm), "D2 A casing restored", 16, 4, "label")}${label(midpoint(o("D3-LEAF-R"), o("D3-LEAF-L")), "D3 one leaf plane", 0, -18, "label", "middle")}
  ${label(cp1Centre, "CP1 / source-plan C1 · fixed", 0, 4, "cupLabel", "middle")}${label(cp2Centre, "CP2 / source-plan C2 · fixed", 0, 4, "cupLabel", "middle")}
  <text x="${xy([1700,-1800])[0]}" y="${xy([1700,-1800])[1]}" class="roomLabel" fill="#1e3a8a" text-anchor="middle">ROOM C · FIXED</text><text x="${xy([6900,-1800])[0]}" y="${xy([6900,-1800])[1]}" class="roomLabel" fill="#9a3412" text-anchor="middle">ROOM A</text><text x="${xy([3950,1500])[0]}" y="${xy([3950,1500])[1]}" class="roomLabel" fill="#047857" text-anchor="middle">ROOM B</text><text x="${xy([5900,900])[0]}" y="${xy([5900,900])[1]}" class="roomLabel" fill="#0f766e" text-anchor="middle">WC</text>

  <text x="1675" y="180" class="sideHead">Architectural constraints</text>
  <text x="1675" y="212" class="side">A1 corner: ${beforeMetrics.a1AngleDegrees.toFixed(3)}° → <tspan class="good">90.000°</tspan></text>
  <text x="1675" y="238" class="side">B3 corner: ${beforeMetrics.b3BackWallAngleDegrees.toFixed(3)}° → <tspan class="good">90.000°</tspan></text>
  <text x="1675" y="264" class="side">B D5 wall-line break: ${beforeMetrics.bD5WallCollinearityDeviationDegrees.toFixed(3)}° → <tspan class="good">0.000°</tspan></text>
  <text x="1675" y="290" class="side">WC casing-line kink: ${beforeMetrics.wcD5KinkDeviationDegrees.toFixed(3)}° → <tspan class="good">0.000°</tspan></text>
  <text x="1675" y="316" class="small">D3-BR→B0.5 return unchanged.</text>
  <text x="1675" y="342" class="small">D2 and D3 registration nodes unchanged.</text>

  <text x="1675" y="388" class="sideHead">Movement</text>
  <text x="1675" y="420" class="side">Maximum: <tspan class="caution">${maxMovement.room}:${maxMovement.id} ${maxMovement.magnitudeMm.toFixed(2)} mm</tspan></text>
  <text x="1675" y="446" class="side">RMS across moved nodes: ${rmsMovement.toFixed(2)} mm</text>
  <text x="1675" y="472" class="side">A1: ${distance(beforeA.A1, afterA.A1).toFixed(2)} mm</text>
  <text x="1675" y="498" class="side">Room B max: ${Math.max(...["B1","B2","B3","B4"].map((id)=>distance(beforeB[id],afterB[id]))).toFixed(2)} mm</text>
  <text x="1675" y="524" class="side">WC max: ${Math.max(...["T0","T1","T2","T3","D5-WCL"].map((id)=>distance(beforeB[id],afterB[id]))).toFixed(2)} mm</text>

  <text x="1675" y="570" class="sideHead">Comparable measurement RMS</text>
  <text x="1675" y="602" class="side">Total: ${summary.totalRmsBeforeMm.toFixed(2)} → ${summary.totalRmsAfterMm.toFixed(2)} mm</text>
  <text x="1675" y="628" class="side">Room A: ${summary.roomARmsBeforeMm.toFixed(2)} → ${summary.roomARmsAfterMm.toFixed(2)} mm</text>
  <text x="1675" y="654" class="side">Room B: ${summary.roomBRmsBeforeMm.toFixed(2)} → ${summary.roomBRmsAfterMm.toFixed(2)} mm</text>
  <text x="1675" y="680" class="side">WC: ${summary.wcRmsBeforeMm.toFixed(2)} → <tspan class="caution">${summary.wcRmsAfterMm.toFixed(2)} mm</tspan></text>
  <text x="1675" y="706" class="small">Direct exact-distance comparison; ${summary.count} observations.</text>

  <rect x="1665" y="745" width="485" height="205" rx="8" class="warningBox"/>
  <text x="1685" y="780" class="sideHead">WC evidence conflict</text>
  <text x="1685" y="812" class="side">Opposing direct widths: 1643 vs 1685 mm.</text>
  <text x="1685" y="840" class="side">Exact rectangle requires one common width.</text>
  <text x="1685" y="868" class="side">Candidate width: ${distance(afterB.T0, afterB.T1).toFixed(2)} mm.</text>
  <text x="1685" y="896" class="side">Worst constrained width residual: ~22 mm.</text>
  <text x="1685" y="924" class="small">Explicit human-review compromise; not hidden as noise.</text>

  <text x="1675" y="998" class="sideHead">Independent validation</text>
  <text x="1675" y="1030" class="side">9019 span: ${beforeMetrics.validation9019ModelMm.toFixed(2)} → ${afterMetrics.validation9019ModelMm.toFixed(2)}</text>
  <text x="1675" y="1056" class="side">Residual: ${signed(beforeMetrics.validation9019ModelMm-9019)} → ${signed(afterMetrics.validation9019ModelMm-9019)} mm</text>
  <text x="1675" y="1082" class="side">3726 span: ${beforeMetrics.validation3726ModelMm.toFixed(2)} → ${afterMetrics.validation3726ModelMm.toFixed(2)}</text>
  <text x="1675" y="1108" class="side">Residual: ${signed(beforeMetrics.validation3726ModelMm-3726)} → ${signed(afterMetrics.validation3726ModelMm-3726)} mm</text>

  <rect x="1665" y="1150" width="485" height="175" rx="8" class="callout"/>
  <text x="1685" y="1185" class="sideHead">Preserved</text>
  <text x="1685" y="1217" class="side">Room C movement 0 · D2 unchanged · D3 unchanged</text>
  <text x="1685" y="1243" class="side">Cupboards retained · scale unchanged</text>
  <text x="1685" y="1269" class="side">No accepted local baseline overwritten</text>
  <text x="1685" y="1297" class="small">Provisional candidate; human review required.</text>
  <text x="1675" y="1370" class="small">${diagnostic ? "Grey dashed = rigid baseline; red arrows = movement." : "See companion diagnostic SVG for movement vectors."}</text>
  <text x="1675" y="1396" class="small">No 3D modelling or unconstrained global optimisation.</text>
</svg>`;
}

function signed(value, digits = 2) { return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`; }

function movementRowsMarkdown() {
  return moved.map((item) => `| ${item.room} | \`${item.id}\` | ${signed(item.vector[0], 2)} | ${signed(item.vector[1], 2)} | ${item.magnitudeMm.toFixed(2)} |`).join("\n");
}

function changedResidualRowsMarkdown() {
  const rows = output.beforeAfter.measurementSummary.affectedAreaResiduals.roomBAndWCChangedObservations;
  return [...rows].sort((a, b) => Math.abs(b.changeMm) - Math.abs(a.changeMm)).slice(0, 12).map((item) => `| \`${item.id}\` | ${signed(item.beforeMm)} | ${signed(item.afterMm)} | ${signed(item.changeMm)} |`).join("\n");
}

function makeReport() {
  const summary = output.beforeAfter.measurementSummary;
  const validation = output.beforeAfter.validationSpans;
  const bMax = Math.max(...["B1", "B2", "B3", "B4"].map((id) => distance(beforeB[id], afterB[id])));
  const wcMax = Math.max(...["T0", "T1", "T2", "T3", "D5-WCL"].map((id) => distance(beforeB[id], afterB[id])));
  return `# Whole-flat architecturally constrained reconciliation v0.1

**Status: PROVISIONAL WHOLE-FLAT ARCHITECTURALLY CONSTRAINED RECONCILIATION — HUMAN REVIEW REQUIRED.**

This candidate starts from the committed \`ROOM_A_C_B_WC_D3_RIGID_REGISTRATION_DIAGNOSTIC_v0_2\`. Room C, D2 and D3 are fixed. Only the specifically approved A1, Room B and WC relationships are constrained; no accepted local baseline is overwritten and no unconstrained whole-flat regularisation is performed.

Inspect the clean SVG first. The companion diagnostic SVG overlays the rigid baseline in grey and shows movement vectors in red.

## Constraint interpretation

- **A1/A2 chimney return:** the constrained corner is at \`A1\`; its adjacent sides are \`A0→A1\` and the \`A1→A2\` return. \`A2→A3\` is the following chimney-front wall, not the other side of the A1 corner.
- **B3-side straight family:** \`B3→B2\` is permanent wall. The underlying plane reaches \`B1\`, but D5 interrupts it between \`B2\` and \`B1\`. The nodes \`B3–B2–B1\` are collinear, while the SVG retains \`B1→B2\` as an opening/casing rather than wall.
- **B4→B3 square:** the adjoining family is the constrained \`B3→B2\` line.
- **WC:** \`T3→D5-WCL\` is wall and \`D5-WCL→T0\` is WC-side D5 casing/opening on the same straight wall line. \`T0–T1–T2–T3\` is constrained rectangular without changing D5 topology.
- **D3:** \`D3-BR→B0.5\` is unchanged. The doorway's axes and leaf centres were already coherent; the successor rendering restores the omitted stepped Room B casing/reveal connectors so the separate faces read as one assembly.

## Required before/after summary

| Area | Original condition | Constrained condition | Max node movement | Measurement consequence |
|---|---|---|---:|---|
| A1/A2 chimney return | A0–A1–A2 ${beforeMetrics.a1AngleDegrees.toFixed(3)}° | 90.000° | ${distance(beforeA.A1, afterA.A1).toFixed(2)} mm | Room A exact-distance RMS ${summary.roomARmsBeforeMm.toFixed(2)} → ${summary.roomARmsAfterMm.toFixed(2)} mm |
| D3 area | Shared leaf centred, but stepped casing/reveal connectors omitted visually | One coherent leaf plane with separate C/B casing and reveal layers | 0.00 mm | No measurement or registration change |
| B4→B3 | angle to B3→B2 ${beforeMetrics.b3BackWallAngleDegrees.toFixed(3)}° | 90.000° | ${bMax.toFixed(2)} mm across adjusted B nodes | Room B exact-distance RMS ${summary.roomBRmsBeforeMm.toFixed(2)} → ${summary.roomBRmsAfterMm.toFixed(2)} mm |
| B3-side wall family | B1–B2–B3 line break ${beforeMetrics.bD5WallCollinearityDeviationDegrees.toFixed(3)}° | collinear; D5 remains an opening | ${bMax.toFixed(2)} mm | largest changed B/WC observations listed below |
| WC T3/D5-WCL | casing-line kink ${beforeMetrics.wcD5KinkDeviationDegrees.toFixed(3)}°; opposing widths differ 42 mm | straight wall/casing line and exact rectangular family | ${wcMax.toFixed(2)} mm | WC exact-distance RMS ${summary.wcRmsBeforeMm.toFixed(2)} → ${summary.wcRmsAfterMm.toFixed(2)} mm; material local tradeoff |

## Movement

| Room | Node | ΔX mm | ΔY mm | Movement mm |
|---|---|---:|---:|---:|
${movementRowsMarkdown()}

Maximum displacement is **${maxMovement.magnitudeMm.toFixed(2)} mm at ${maxMovement.room}:${maxMovement.id}**. RMS displacement across the ${moved.length} moved nodes is **${rmsMovement.toFixed(2)} mm**. Every unlisted node remains fixed.

The Room B adjustments remain below 8 mm. The larger WC movement is localized and explained by the direct 42 mm conflict between its measured opposing widths.

## Measurement consequences

Headline comparison uses an unweighted RMS over ${summary.count} comparable direct exact-endpoint distance observations: the accepted Room A S3 exact set plus Room B/WC direct value observations, excluding approximate and cross-tie classes. This is a transparent cross-room diagnostic rather than a replacement for the source solvers' room-specific robust costs.

| Metric | Before | After |
|---|---:|---:|
| Total comparable measurement RMS | ${summary.totalRmsBeforeMm.toFixed(2)} mm | ${summary.totalRmsAfterMm.toFixed(2)} mm |
| Room A RMS | ${summary.roomARmsBeforeMm.toFixed(2)} mm | ${summary.roomARmsAfterMm.toFixed(2)} mm |
| Room B RMS | ${summary.roomBRmsBeforeMm.toFixed(2)} mm | ${summary.roomBRmsAfterMm.toFixed(2)} mm |
| WC RMS | ${summary.wcRmsBeforeMm.toFixed(2)} mm | ${summary.wcRmsAfterMm.toFixed(2)} mm |
| Worst individual residual | \`${summary.worstBefore.id}\` ${signed(summary.worstBefore.residualMm)} mm | \`${summary.worstAfter.id}\` ${signed(summary.worstAfter.residualMm)} mm |

Largest changed Room B/WC observation residuals:

| Observation | Before mm | After mm | Change mm |
|---|---:|---:|---:|
${changedResidualRowsMarkdown()}

The two Room A observations directly involving A1 change as follows: ${summary.affectedAreaResiduals.roomAObservationsTouchingA1.map((item) => `\`${item.id}\` ${signed(item.beforeMm)} → ${signed(item.afterMm)} mm`).join("; ")}.

## WC conflict and alternatives

An exact rectangle requires \`T0→T1\` and \`T3→T2\` to have equal length. Their direct field readings are **1643 mm** and **1685 mm**, a **42 mm disagreement**. The constrained candidate uses a common width of **${distance(afterB.T0, afterB.T1).toFixed(2)} mm**, leaving an approximately 20–22 mm residual on each opposing width and requiring up to ${wcMax.toFixed(2)} mm WC node movement.

This is the principal human-review gate. The minimum-change alternative—not applied—would only project \`D5-WCL\` onto the existing \`T3–T0\` line, moving it approximately **13.53 mm**. That removes the visible casing-line kink but retains the non-rectangular 42 mm width difference, so it does not satisfy the requested rectangular WC condition.

## Independent global validation

| Validation | Measured | Exact model before | Residual before | Exact model after | Residual after |
|---|---:|---:|---:|---:|---:|
| Far A wall through D2 to opposite C wall | 9019 | ${validation.span9019.exactModelBeforeMm.toFixed(2)} | ${signed(validation.span9019.residualBeforeMm)} | ${validation.span9019.exactModelAfterMm.toFixed(2)} | ${signed(validation.span9019.residualAfterMm)} |
| C stud outer face through D3 to B back wall | 3726 | ${validation.span3726.exactModelBeforeMm.toFixed(2)} | ${signed(validation.span3726.residualBeforeMm)} | ${validation.span3726.exactModelAfterMm.toFixed(2)} | ${signed(validation.span3726.residualAfterMm)} |

The prompt's 8965 mm first model value was explicitly approximate. Using the recorded geometry definition—a D2-normal line through the A-face opening centre intersecting \`A5–A6\` and \`C0–CP1-FL\`—the exact rigid-baseline value is ${validation.span9019.exactModelBeforeMm.toFixed(2)} mm. It remains unchanged because neither defining wall nor D2 moved. The second exact baseline reproduces the stated approximately 3742 mm value and improves by ${Math.abs(validation.span3726.residualBeforeMm - validation.span3726.residualAfterMm).toFixed(2)} mm.

## Composition corrections

- **D3:** the previous global composition showed outer casing/leaf layers but omitted the accepted Room B inner casing and 105 mm reveal connectors. Those fixed layers are now drawn separately. No D3 point moved.
- **D2 Room A casing:** the source A/C v0.2 record already contains the measured Room A outer-casing segment and clear-opening segment. The A/C/B/WC v0.2 exporter omitted them; they were not absent or merely overdrawn. Both are restored without changing D2 geometry.

## Preservation and status

Room C maximum movement is **0.00 mm**. D2 registration, D3 registration, the \`D3-BR→B0.5\` return endpoints, Room C cupboards, global scale and every accepted individual-room baseline are unchanged.

This is a constrained candidate for human review, not construction-locked geometry. Stop here; do not begin 3D modelling.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}_DIAGNOSTIC.svg`), `${makeSvg({ diagnostic: true })}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

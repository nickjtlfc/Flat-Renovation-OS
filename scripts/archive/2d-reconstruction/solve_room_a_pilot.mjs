#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const evidenceRelative = "docs/survey/ROOM_A_EVIDENCE_v1_1.md";
const outputRelative = "docs/survey/derived/room-a";
const evidencePath = path.join(repoRoot, evidenceRelative);
const outputDir = path.join(repoRoot, outputRelative);
const svgName = "ROOM_A_RECONSTRUCTION_PILOT_v0_1.svg";
const jsonName = "ROOM_A_RECONSTRUCTION_PILOT_v0_1.json";
const reportName = "ROOM_A_RECONSTRUCTION_PILOT_v0_1.md";

const evidenceText = fs.readFileSync(evidencePath, "utf8");
for (const token of ["Field recheck - 3 August 2026", "SUP-028-R1", "A0 | approximately 91 degrees"]) {
  if (!evidenceText.includes(token)) throw new Error(`Authoritative evidence is missing: ${token}`);
}

const distances = [];
function addDistance(id, from, to, measuredMm, sigmaMm, category, options = {}) {
  distances.push({
    id,
    from,
    to,
    measuredMm,
    sigmaMm,
    category,
    evidenceSet: options.evidenceSet || "original",
    sourceObservationId: options.sourceObservationId || id,
    exactEndpoint: options.exactEndpoint ?? true,
    note: options.note || "",
  });
}

for (const row of [
  ["BASE-A-01", "A0", "A1", 1316], ["BASE-A-02", "A1", "A2", 284],
  ["BASE-A-03", "A2", "A3", 1955], ["BASE-A-04", "A3", "A4", 268],
  ["BASE-A-05", "A4", "A5", 1293], ["BASE-A-06", "A5", "W1-AL", 1410],
  ["BASE-A-07", "W1-AR", "A6", 1431], ["BASE-A-08", "A6", "D1-AL", 529],
  ["BASE-A-09", "D1-AR", "A7", 2825], ["BASE-A-10", "A7", "D2-AL", 550],
  ["BASE-A-11", "D2-AR", "A0", 2664],
]) addDistance(...row, row[0] === "BASE-A-03" ? 0 : 4, row[0] === "BASE-A-03" ? "fixed-gauge" : "baseline");

for (const row of [
  ["SUP-001", "A2", "A0", 1338], ["SUP-002", "A2", "D2-AR", 2696],
  ["SUP-003", "A2", "A7", 4215], ["SUP-004", "A2", "D1-AR", 4287],
  ["SUP-005", "A2", "A6", 5155], ["SUP-006", "A2", "W1-AL", 3430],
  ["SUP-025", "A3", "A5", 1318], ["SUP-026", "A3", "W1-AL", 1721],
  ["SUP-027", "A3", "A6", 4206], ["SUP-028", "A3", "D1-AL", 4082],
  ["SUP-029", "A3", "D1-AR", 4029], ["SUP-030", "A3", "A7", 5157],
  ["SUP-032", "A4", "W1-AL", 1900], ["SUP-033", "A4", "A6", 4458],
  ["SUP-034", "A4", "D1-AL", 4342], ["SUP-035", "A0", "A2", 1333],
  ["SUP-036", "A0", "W1-AL", 4760], ["SUP-037", "A0", "A6", 6251],
  ["SUP-038", "A0", "D1-AR", 5133], ["SUP-039", "A1", "D2-AR", 2945],
  ["SUP-040", "A1", "A7", 4485], ["SUP-041", "A5", "D1-AL", 4298],
  ["SUP-042", "A5", "A7", 6225], ["SUP-043", "A5", "D2-AR", 5237],
  ["SUP-044", "W1-AR", "D1-AL", 1514],
]) addDistance(...row, 8, "node-to-node");

addDistance("SUP-031", "A3", "D2-AR", 4017, 40, "approximate", { note: "Approximate mark on source sheet" });
addDistance("SUP-045", "W1-AR", "A7", 4760, 75, "approximate-area", { exactEndpoint: false, note: "A7 area provisionally represented by A7" });
addDistance("SUP-046", "A6", "D2-AR", 4838, 75, "approximate-area", { exactEndpoint: false, note: "D2-AR area provisionally represented by D2-AR" });

for (const row of [
  ["SUP-038-R1", "A0", "D1-AR", 5137, 8, "SUP-038"],
  ["SUP-046-R1", "A6", "D2-AR", 4837, 75, "SUP-046"],
  ["SUP-032-R1", "A4", "W1-AL", 1901, 8, "SUP-032"],
  ["SUP-039-R1", "A1", "D2-AR", 2947, 8, "SUP-039"],
  ["SUP-044-R1", "W1-AR", "D1-AL", 1517, 8, "SUP-044"],
  ["SUP-025-R1", "A3", "A5", 1318, 8, "SUP-025"],
  ["SUP-001-R1", "A2", "A0", 1338, 8, "SUP-001"],
  ["SUP-028-R1", "A3", "D1-AL", 4077, 24, "SUP-028"],
  ["SUP-003-R1", "A2", "A7", 4220, 8, "SUP-003"],
]) {
  const [id, from, to, measured, sigma, source] = row;
  addDistance(id, from, to, measured, sigma, source === "SUP-046" ? "repeat-approximate-area" : "repeat-node-to-node", {
    evidenceSet: "repeat",
    sourceObservationId: source,
    exactEndpoint: source !== "SUP-046",
    note: id === "SUP-028-R1" ? "Approximate difficult repeat; deliberately lower confidence" : "Repeat field observation, 3 August 2026",
  });
}

const angleObservations = [
  { id: "ANGLE-A0-R1", node: "A0", previous: "A7", next: "A1", measuredDegrees: 91 },
  { id: "ANGLE-A1-R1", node: "A1", previous: "A0", next: "A2", measuredDegrees: 90 },
  { id: "ANGLE-A4-R1", node: "A4", previous: "A3", next: "A5", measuredDegrees: 89 },
  { id: "ANGLE-A5-R1", node: "A5", previous: "A4", next: "A6", measuredDegrees: 90 },
  { id: "ANGLE-A6-R1", node: "A6", previous: "A5", next: "A7", measuredDegrees: 90 },
  { id: "ANGLE-A7-R1", node: "A7", previous: "A6", next: "A0", measuredDegrees: 89 },
].map((item) => ({ ...item, sigmaDegrees: 1.75, provenance: "Practical physical angle-measurer field reading, 3 August 2026; soft constraint only" }));

function lerp(a, b, t) { return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]; }
function coordinates(p) {
  const c = { A2: [0, 0], A3: [1955, 0], A0: [p[0], p[1]], A1: [p[2], p[3]], A4: [p[4], p[5]], A5: [p[6], p[7]], A6: [p[8], p[9]], A7: [p[10], p[11]] };
  c["W1-AL"] = lerp(c.A5, c.A6, p[12]); c["W1-AR"] = lerp(c.A5, c.A6, p[13]);
  c["D1-AL"] = lerp(c.A6, c.A7, p[14]); c["D1-AR"] = lerp(c.A6, c.A7, p[15]);
  c["D2-AL"] = lerp(c.A7, c.A0, p[16]); c["D2-AR"] = lerp(c.A7, c.A0, p[17]);
  return c;
}
function distance(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function bearingDegrees(c, from, to) { return ((Math.atan2(c[to][1] - c[from][1], c[to][0] - c[from][0]) * 180) / Math.PI + 360) % 360; }
function returnDifference(c) {
  const delta = ((bearingDegrees(c, "A1", "A2") - bearingDegrees(c, "A4", "A3")) * Math.PI) / 180;
  return (Math.atan2(Math.sin(2 * delta), Math.cos(2 * delta)) * 90) / Math.PI;
}
function interiorAngle(c, previous, node, next) {
  const u = [c[previous][0] - c[node][0], c[previous][1] - c[node][1]];
  const v = [c[next][0] - c[node][0], c[next][1] - c[node][1]];
  const cosine = Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))));
  return (Math.acos(cosine) * 180) / Math.PI;
}
function activeDistances(options) { return distances.filter((d) => d.sigmaMm > 0 && (d.evidenceSet === "original" || options.includeRepeats)); }
function rawResiduals(parameters, options) {
  const c = coordinates(parameters);
  const residuals = activeDistances(options).map((d) => ({ id: d.id, z: (distance(c[d.from], c[d.to]) - d.measuredMm) / d.sigmaMm }));
  if (options.includeAngles) for (const a of angleObservations) residuals.push({ id: a.id, z: (interiorAngle(c, a.previous, a.node, a.next) - a.measuredDegrees) / a.sigmaDegrees });
  return residuals;
}
function objective(parameters, options) {
  return rawResiduals(parameters, options).reduce((sum, r) => { const a = Math.abs(r.z); return sum + (a <= 2.5 ? 0.5 * a * a : 2.5 * (a - 1.25)); }, 0);
}
function solveLinearSystem(matrix, vector) {
  const n = vector.length, a = matrix.map((row, i) => [...row, vector[i]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col; for (let row = col + 1; row < n; row += 1) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    [a[col], a[pivot]] = [a[pivot], a[col]]; if (Math.abs(a[col][col]) < 1e-12) return null;
    const diagonal = a[col][col]; for (let j = col; j <= n; j += 1) a[col][j] /= diagonal;
    for (let row = 0; row < n; row += 1) if (row !== col) { const factor = a[row][col]; for (let j = col; j <= n; j += 1) a[row][j] -= factor * a[col][j]; }
  }
  return a.map((row) => row[n]);
}
function fit(initial, options) {
  let p = [...initial], damping = 1e-2;
  for (let iteration = 0; iteration < 300; iteration += 1) {
    const residuals = rawResiduals(p, options), rows = residuals.length, cols = p.length;
    const weights = residuals.map((r) => Math.abs(r.z) <= 2.5 ? 1 : 2.5 / Math.abs(r.z));
    const jacobian = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let col = 0; col < cols; col += 1) {
      const step = Math.max(1e-6, Math.abs(p[col]) * 1e-6), shifted = [...p]; shifted[col] += step;
      const shiftedResiduals = rawResiduals(shifted, options);
      for (let row = 0; row < rows; row += 1) jacobian[row][col] = (shiftedResiduals[row].z - residuals[row].z) / step;
    }
    const normal = Array.from({ length: cols }, () => Array(cols).fill(0)), gradient = Array(cols).fill(0);
    for (let row = 0; row < rows; row += 1) for (let col = 0; col < cols; col += 1) {
      gradient[col] += weights[row] * jacobian[row][col] * residuals[row].z;
      for (let other = 0; other < cols; other += 1) normal[col][other] += weights[row] * jacobian[row][col] * jacobian[row][other];
    }
    for (let i = 0; i < cols; i += 1) normal[i][i] += damping * (normal[i][i] + 1e-6);
    const delta = solveLinearSystem(normal, gradient.map((v) => -v)); if (!delta) break;
    const trial = p.map((v, i) => v + delta[i]);
    if (objective(trial, options) < objective(p, options)) { p = trial; damping = Math.max(damping / 2, 1e-9); if (Math.max(...delta.map(Math.abs)) < 1e-7) break; }
    else damping = Math.min(damping * 5, 1e12);
  }
  return p;
}

const initial = [-1316, -284, 0, -284, 1955, -268, 3248, -268, 3248, 4000, -1300, 4000, 1410 / 4268, (1410 + 1122) / 4268, 529 / 4548, 1 - 2825 / 4548, 550 / 4300, 1 - 2664 / 4300];
const solutionDefinitions = [
  { id: "S1", label: "Existing distance-only", options: { includeRepeats: false, includeAngles: false } },
  { id: "S2", label: "Distance with repeats", options: { includeRepeats: true, includeAngles: false } },
  { id: "S3", label: "Distance with repeats and soft angles", options: { includeRepeats: true, includeAngles: true } },
];
const fittedParameters = {};
fittedParameters.S1 = fit(initial, solutionDefinitions[0].options);
fittedParameters.S2 = fit(fittedParameters.S1, solutionDefinitions[1].options);
fittedParameters.S3 = fit(fittedParameters.S2, solutionDefinitions[2].options);
function round(value, digits = 2) { const f = 10 ** digits; return Math.round(value * f) / f; }
function polygonAreaM2(c) {
  const ids = ["A0", "A1", "A2", "A3", "A4", "A5", "A6", "A7"]; let twice = 0;
  for (let i = 0; i < ids.length; i += 1) { const a = c[ids[i]], b = c[ids[(i + 1) % ids.length]]; twice += a[0] * b[1] - b[0] * a[1]; }
  return Math.abs(twice) / 2e6;
}
function diagnose(definition) {
  const c = coordinates(fittedParameters[definition.id]);
  const activeIds = new Set(activeDistances(definition.options).map((d) => d.id));
  const distanceResiduals = distances.map((d) => ({ ...d, predictedMm: distance(c[d.from], c[d.to]), residualMm: distance(c[d.from], c[d.to]) - d.measuredMm, usedInFit: activeIds.has(d.id) }));
  const exact = distanceResiduals.filter((d) => d.usedInFit && d.exactEndpoint && ["baseline", "node-to-node", "repeat-node-to-node"].includes(d.category));
  const largestExact = [...exact].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm))[0];
  const angles = angleObservations.map((a) => ({ ...a, fittedDegrees: interiorAngle(c, a.previous, a.node, a.next), residualDegrees: interiorAngle(c, a.previous, a.node, a.next) - a.measuredDegrees, usedInFit: definition.options.includeAngles }));
  return {
    id: definition.id, label: definition.label, options: definition.options, coordinates: c,
    clearBaselineNodeRmsMm: Math.sqrt(exact.reduce((s, d) => s + d.residualMm ** 2, 0) / exact.length),
    largestExactDistanceResidual: largestExact,
    a1ToA2BearingDegrees: bearingDegrees(c, "A1", "A2"), a4ToA3BearingDegrees: bearingDegrees(c, "A4", "A3"),
    returnAngularDifferenceDegrees: returnDifference(c), finishedWallAreaM2: polygonAreaM2(c), distanceResiduals, angleResiduals: angles,
    angleObservationRmsDegrees: Math.sqrt(angles.reduce((s, a) => s + a.residualDegrees ** 2, 0) / angles.length),
  };
}
const solutions = Object.fromEntries(solutionDefinitions.map((d) => [d.id, diagnose(d)]));
const s2 = solutions.S2, s3 = solutions.S3;
const selectionTests = {
  compatibleWithDistanceNetwork: s3.clearBaselineNodeRmsMm - s2.clearBaselineNodeRmsMm <= 1,
  modestResidualDeterioration: Math.abs(s3.largestExactDistanceResidual.residualMm) - Math.abs(s2.largestExactDistanceResidual.residualMm) <= 2,
  betterReflectsVerifiedAngles: s3.angleObservationRmsDegrees < s2.angleObservationRmsDegrees,
  noSeriousExactDistanceContradiction: Math.abs(s3.largestExactDistanceResidual.residualMm) < 25,
};
const selectedSolutionId = Object.values(selectionTests).every(Boolean) ? "S3" : "S2";
const selected = solutions[selectedSolutionId], fitted = selected.coordinates;

function materialChanges(fromSolution, toSolution, thresholdMm = 2) {
  return distances.map((d) => {
    const before = fromSolution.distanceResiduals.find((r) => r.id === d.id), after = toSolution.distanceResiduals.find((r) => r.id === d.id);
    return { id: d.id, fromResidualMm: before.residualMm, toResidualMm: after.residualMm, changeMm: after.residualMm - before.residualMm, activeFrom: before.usedInFit, activeTo: after.usedInFit };
  }).filter((r) => r.activeFrom && r.activeTo && Math.abs(r.changeMm) >= thresholdMm).sort((a, b) => Math.abs(b.changeMm) - Math.abs(a.changeMm));
}
const residualChanges = { S1toS2: materialChanges(solutions.S1, solutions.S2), S2toS3: materialChanges(solutions.S2, solutions.S3) };
const selectedConstraintResults = selected.distanceResiduals;
const resultById = Object.fromEntries(selectedConstraintResults.map((r) => [r.id, r]));

function pointToSegmentRange(point, start, end) {
  const dx = end[0] - start[0], dy = end[1] - start[1], denominator = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / denominator));
  const closest = [start[0] + t * dx, start[1] + t * dy];
  return { min: distance(point, closest), max: Math.max(distance(point, start), distance(point, end)) };
}
function segmentRange(a, b, c, d) { return { min: Math.min(pointToSegmentRange(a, c, d).min, pointToSegmentRange(b, c, d).min, pointToSegmentRange(c, a, b).min, pointToSegmentRange(d, a, b).min), max: Math.max(distance(a, c), distance(a, d), distance(b, c), distance(b, d)) }; }
const intervalChecks = [
  { id: "SUP-061", measuredMm: 4558, range: segmentRange(fitted["W1-AR"], fitted.A6, fitted.A7, fitted["D2-AL"]) },
  { id: "SUP-062", measuredMm: 4547, range: pointToSegmentRange(fitted["W1-AL"], fitted["D2-AR"], fitted.A0) },
  { id: "SUP-063", measuredMm: 4297, range: pointToSegmentRange(fitted.A1, fitted["D1-AR"], fitted.A7) },
  { id: "SUP-064", measuredMm: 4268, range: pointToSegmentRange(fitted["D1-AL"], fitted.A5, fitted.A6) },
].map((x) => ({ id: x.id, measuredMm: x.measuredMm, admissibleRangeMm: [round(x.range.min, 1), round(x.range.max, 1)], compatible: x.measuredMm >= x.range.min && x.measuredMm <= x.range.max, usedInFit: false }));

const ceilingHeightsMm = { A0: 3125, A1: 3124, A2: 3122, A3: 3142, A4: 3143, A5: 3147, "W1-AL": 3160, "W1-AR": 3167, A6: 3169, "D1-AL": 3165, "D1-AR": 3151, A7: 3146, "D2-AL": 3140, "D2-AR": 3137 };
const objects = {
  W1: { wallPlaneNodes: ["W1-AL", "W1-AR"], frontFaceWidthMm: 1430, recordedWindowWidthMm: 1026, recordedWindowHeightMm: 1887 },
  D1: { wallPlaneNodes: ["D1-AL", "D1-AR"], frontFaceWidthMm: 1204, clearOpeningWidthMm: 781, clearOpeningHeightMm: 2030 },
  D2: { wallPlaneNodes: ["D2-AL", "D2-AR"], frontFaceWidthMm: 1096, clearOpeningWidthMm: 767, clearOpeningHeightMm: 1971 },
};
const derivedDimensions = { roomAreaM2: round(selected.finishedWallAreaM2, 3), A5ToA6WallRunMm: round(distance(fitted.A5, fitted.A6), 1), A6ToA7WallRunMm: round(distance(fitted.A6, fitted.A7), 1), A7ToA0WallRunMm: round(distance(fitted.A7, fitted.A0), 1), W1WallPlaneNodeSpanMm: round(distance(fitted["W1-AL"], fitted["W1-AR"]), 1), D1WallPlaneNodeSpanMm: round(distance(fitted["D1-AL"], fitted["D1-AR"]), 1), D2WallPlaneNodeSpanMm: round(distance(fitted["D2-AL"], fitted["D2-AR"]), 1) };

function serializeSolution(solution) {
  return {
    id: solution.id, label: solution.label, includedEvidence: solution.options,
    clearBaselineNodeRmsMm: round(solution.clearBaselineNodeRmsMm, 3),
    largestExactDistanceResidual: { id: solution.largestExactDistanceResidual.id, residualMm: round(solution.largestExactDistanceResidual.residualMm, 3) },
    bearings: { convention: "Degrees from solver +X; A2 to A3 is 0 degrees; not site north", A1toA2Degrees: round(solution.a1ToA2BearingDegrees, 3), A4toA3Degrees: round(solution.a4ToA3BearingDegrees, 3), signedReturnDifferenceDegrees: round(solution.returnAngularDifferenceDegrees, 3), absoluteReturnDifferenceDegrees: round(Math.abs(solution.returnAngularDifferenceDegrees), 3) },
    coordinatesMm: Object.fromEntries(Object.entries(solution.coordinates).filter(([id]) => /^A[0-7]$/.test(id)).map(([id, p]) => [id, { x: round(p[0], 2), y: round(p[1], 2) }])),
    finishedWallAreaM2: round(solution.finishedWallAreaM2, 4), angleObservationRmsDegrees: round(solution.angleObservationRmsDegrees, 3),
    distanceResiduals: solution.distanceResiduals.filter((r) => r.usedInFit).map((r) => ({ id: r.id, measuredMm: r.measuredMm, predictedMm: round(r.predictedMm, 2), residualMm: round(r.residualMm, 2), sigmaMm: r.sigmaMm, category: r.category })),
    angleResiduals: solution.angleResiduals.map((a) => ({ id: a.id, node: a.node, measuredDegrees: a.measuredDegrees, fittedDegrees: round(a.fittedDegrees, 3), residualDegrees: round(a.residualDegrees, 3), sigmaDegrees: a.sigmaDegrees, usedInFit: a.usedInFit })),
  };
}
const jsonOutput = {
  documentType: "derived Room A pilot reconstruction and evidence/residual record - not source evidence", version: "0.1", generatedDate: "2026-08-03", units: "millimetres", authoritativeEvidence: evidenceRelative,
  coordinateGauge: { A2: [0, 0], A3: [1955, 0], note: "Gauge only: fixes translation, rotation and scale; not site north." },
  repeatObservationTreatment: { method: "Separate weighted observations", explanation: "Each repeat remains a distinct residual. Equal-sigma original/repeat pairs are mathematically equivalent to their mean with sigma divided by sqrt(2), assuming independent random reading error, while preserving evidence visibility.", normalRepeatSigmaMm: 8, difficultSup028RepeatSigmaMm: 24, approximateAreaSup046RepeatSigmaMm: 75, baselineRechecks: "A0-A1 and A4-A5 agreed with existing values but were not duplicated numerically because separate readings were not supplied." },
  angleTreatment: { method: "Six independent soft included-angle observations with Huber robust loss", sigmaDegrees: 1.75, exactRightAnglesImposed: false, directlyMeasuredCorners: ["A0", "A1", "A4", "A5", "A6", "A7"], notDirectlyMeasured: ["A2", "A3"] },
  evidence: { repeatedDistances: distances.filter((d) => d.evidenceSet === "repeat"), angles: angleObservations },
  solutions: Object.fromEntries(Object.values(solutions).map((s) => [s.id, serializeSolution(s)])), residualChanges: { S1toS2: residualChanges.S1toS2.map((r) => ({ ...r, fromResidualMm: round(r.fromResidualMm, 2), toResidualMm: round(r.toResidualMm, 2), changeMm: round(r.changeMm, 2) })), S2toS3: residualChanges.S2toS3.map((r) => ({ ...r, fromResidualMm: round(r.fromResidualMm, 2), toResidualMm: round(r.toResidualMm, 2), changeMm: round(r.changeMm, 2) })) },
  selection: { selectedSolutionId, selectedType: selectedSolutionId === "S3" ? "angle-informed" : "distance-only with repeats", tests: selectionTests, thresholds: { modestRmsIncreaseMm: 1, modestLargestExactResidualIncreaseMm: 2, seriousExactResidualMm: 25 }, reason: selectedSolutionId === "S3" ? "The angle-informed fit better matches the six practical angle readings while causing only modest distance-residual deterioration and no serious exact-distance contradiction." : "The angle-informed fit failed one or more compatibility tests; the repeat-distance solution is retained." },
  selectedGeometry: { allNodeCoordinatesMm: Object.fromEntries(Object.entries(fitted).map(([id, p]) => [id, { x: round(p[0], 2), y: round(p[1], 2) }])), derivedDimensions, intervalChecks, ceilingHeightsMm, objects },
};

function sign(value, digits = 2) { const v = round(value, digits); return `${v >= 0 ? "+" : ""}${v}`; }
function coordTable(solution) { return ["| Node | x (mm) | y (mm) |", "|---|---:|---:|", ...Object.entries(solution.coordinates).filter(([id]) => /^A[0-7]$/.test(id)).map(([id, p]) => `| ${id} | ${round(p[0], 2)} | ${round(p[1], 2)} |`)].join("\n"); }
function residualChangeTable(items) { return items.length ? ["| Measurement | Before residual | After residual | Change |", "|---|---:|---:|---:|", ...items.map((r) => `| ${r.id} | ${sign(r.fromResidualMm)} mm | ${sign(r.toResidualMm)} mm | ${sign(r.changeMm)} mm |`)].join("\n") : "No distance residual changed by at least 2 mm."; }
const comparisonRows = Object.values(solutions).map((s) => `| ${s.id}: ${s.label} | ${round(s.clearBaselineNodeRmsMm, 3)} mm | ${s.largestExactDistanceResidual.id} ${sign(s.largestExactDistanceResidual.residualMm, 3)} mm | ${round(s.a1ToA2BearingDegrees, 3)} deg | ${round(s.a4ToA3BearingDegrees, 3)} deg | ${round(Math.abs(s.returnAngularDifferenceDegrees), 3)} deg | ${round(s.finishedWallAreaM2, 4)} m2 |`).join("\n");
const angleRows = selected.angleResiduals.map((a) => `| ${a.node} | ~${a.measuredDegrees} deg | ${round(a.fittedDegrees, 3)} deg | ${sign(a.residualDegrees, 3)} deg |`).join("\n");
const report = `# Room A reconstruction pilot v0.1

**Status:** Selected **${selectedSolutionId}: ${selected.label}** on 3 August 2026. This is derived geometry, not source evidence.

## Outcome

The angle-informed solution is selected because it remains compatible with the distance network, improves agreement with the human-verified near-orthogonal room, and does not force any exact distance into serious contradiction. No angle is fixed at 90 degrees, and A2/A3 remain distance-derived.

| Solution | Clear baseline/node RMS | Largest exact-distance residual | A1 to A2 bearing | A4 to A3 bearing | Return difference | Finished-wall area |
|---|---:|---:|---:|---:|---:|---:|
${comparisonRows}

Bearings use solver +X, with A2 to A3 fixed at 0 degrees as a coordinate gauge; they are not site-north bearings. RMS is the unweighted RMS of active clear baseline/node observations, including clear repeats where applicable. Approximate-area readings are excluded from that RMS.

## Repeat-observation treatment

Both original and repeat readings are preserved. Normal repeats are separate observations at the same 8 mm working sigma as the original clear supplemental observations. This is equivalent to fitting the pair's mean at 8/sqrt(2) mm under independent random error, but keeps each residual auditable. SUP-028-R1 is deliberately wider at 24 mm because it was difficult; SUP-046-R1 retains 75 mm because its endpoint remains an approximate landing area. The A0-A1 and A4-A5 rechecks are qualitative confirmations only because separate numeric readings were not supplied.

## SVG opening and casing convention

The review SVG restores the earlier three-layer convention: black is the surrounding finished-wall plane, solid blue is the actual clear/recorded opening width, and orange is the projecting outer casing or architrave front face. A thin dashed cyan line between the named wall-plane nodes is a reference span only and must not be read as the clear opening.

| Object | Opening shown | Casing extent shown | Evidence status |
|---|---:|---:|---|
| D1 | 781 mm clear opening | 1204 mm front-face casing; 31 mm projection | Width and projection directly measured |
| D2 | 767 mm clear opening | 1096 mm outer casing | Width directly measured; drawn front-face position is approximate because 37 mm is a maximum projection, not two surveyed side offsets |
| W1 | 1026 mm recorded window width | 1430 mm front-face casing; 157/151 mm node-to-face offsets | Casing width and offsets directly measured; 1026 mm remains secondary recorded window-width evidence rather than a substituted casing width |

For presentation, the width segments are centred on their associated wall-plane node span as in the earlier SVG. That centring is a diagrammatic placement convention, not an added survey constraint, and does not alter the fitted nodes or opening-bearing wall geometry.

## Coordinates by solution

### S1 - Existing distance-only

${coordTable(solutions.S1)}

### S2 - Distance with repeats

${coordTable(solutions.S2)}

### S3 - Repeats plus soft angles (selected)

${coordTable(solutions.S3)}

## Soft angle observations in selected fit

| Corner | Field reading | Selected fitted angle | Residual |
|---|---:|---:|---:|
${angleRows}

Each angle has a 1.75 degree working sigma and Huber treatment. A2 and A3 have no direct angle residual.

## Material distance-residual changes

Material means at least 2 mm change in predicted-minus-observed residual.

### S1 to S2 - adding repeat distances

${residualChangeTable(residualChanges.S1toS2)}

### S2 to S3 - adding soft angles

${residualChangeTable(residualChanges.S2toS3)}

## Selection-rule assessment

- Distance-network compatibility: **${selectionTests.compatibleWithDistanceNetwork ? "pass" : "fail"}**; clear RMS change S2 to S3 is ${sign(s3.clearBaselineNodeRmsMm - s2.clearBaselineNodeRmsMm, 3)} mm.
- Modest residual deterioration: **${selectionTests.modestResidualDeterioration ? "pass" : "fail"}**; the largest exact residual changes by ${sign(Math.abs(s3.largestExactDistanceResidual.residualMm) - Math.abs(s2.largestExactDistanceResidual.residualMm), 3)} mm.
- Better reflects field angles: **${selectionTests.betterReflectsVerifiedAngles ? "pass" : "fail"}**; angle-observation RMS changes from ${round(s2.angleObservationRmsDegrees, 3)} to ${round(s3.angleObservationRmsDegrees, 3)} degrees.
- No serious exact-distance contradiction: **${selectionTests.noSeriousExactDistanceContradiction ? "pass" : "fail"}**; selected largest exact residual is ${s3.largestExactDistanceResidual.id} ${sign(s3.largestExactDistanceResidual.residualMm, 3)} mm.

The selected shape is not a forced rectangle: its six measured-corner fitted angles remain individually estimated, and the unmeasured chimney-front corners A2/A3 follow the distance network.

## Selected geometry checks

- Finished-wall area: **${round(selected.finishedWallAreaM2, 4)} m2**.
- Selected bearings A1 to A2 / A4 to A3: **${round(selected.a1ToA2BearingDegrees, 3)} / ${round(selected.a4ToA3BearingDegrees, 3)} degrees**.
- Absolute angular difference between the returns: **${round(Math.abs(selected.returnAngularDifferenceDegrees), 3)} degrees**.
- General-landing checks SUP-061 through SUP-064 remain ${intervalChecks.every((x) => x.compatible) ? "compatible" : "partly conflicting"} and are not fitted because their landing points are not exact nodes.

See the companion JSON for every active distance residual in each solution, all repeat evidence, all angle residuals, and the machine-readable selection tests. The SVG shows the selected geometry, fitted return bearings, field angles, and selected solution type.
`;

function xml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
const canvas = { width: 1600, height: 1050 };
const permanent = Object.entries(fitted).filter(([id]) => /^A[0-7]$/.test(id));
const minX = Math.min(...permanent.map(([, p]) => p[0])), maxX = Math.max(...permanent.map(([, p]) => p[0]));
const minY = Math.min(...permanent.map(([, p]) => p[1])), maxY = Math.max(...permanent.map(([, p]) => p[1]));
const scale = Math.min(820 / (maxX - minX), 720 / (maxY - minY));
function screen(p) { return [80 + (p[0] - minX) * scale, 150 + (p[1] - minY) * scale]; }
function line(from, to, klass) { const a = screen(fitted[from]), b = screen(fitted[to]); return `<line x1="${round(a[0], 1)}" y1="${round(a[1], 1)}" x2="${round(b[0], 1)}" y2="${round(b[1], 1)}" class="${klass}"/>`; }
function pointLine(a, b, klass) { const p1 = screen(a), p2 = screen(b); return `<line x1="${round(p1[0], 1)}" y1="${round(p1[1], 1)}" x2="${round(p2[0], 1)}" y2="${round(p2[1], 1)}" class="${klass}"/>`; }
function textNode(x, y, value, klass = "body", anchor = "start") { return `<text x="${round(x, 1)}" y="${round(y, 1)}" class="${klass}" text-anchor="${anchor}">${xml(value)}</text>`; }
function unitVector(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy); return [dx / length, dy / length]; }
function vectorAdd(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function vectorScale(v, amount) { return [v[0] * amount, v[1] * amount]; }
function centrePoint(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
function faceSegment(leftId, rightId, widthMm, projectionLeftMm, projectionRightMm) {
  const leftNode = fitted[leftId], rightNode = fitted[rightId], direction = unitVector(leftNode, rightNode), inward = [-direction[1], direction[0]], centre = centrePoint(leftNode, rightNode);
  return {
    centre,
    clearSegment(width) { return [vectorAdd(centre, vectorScale(direction, -width / 2)), vectorAdd(centre, vectorScale(direction, width / 2))]; },
    casing: [vectorAdd(vectorAdd(centre, vectorScale(direction, -widthMm / 2)), vectorScale(inward, projectionLeftMm)), vectorAdd(vectorAdd(centre, vectorScale(direction, widthMm / 2)), vectorScale(inward, projectionRightMm))],
  };
}
const casingVisuals = {
  W1: { leftId: "W1-AL", rightId: "W1-AR", clearWidthMm: 1026, casingWidthMm: 1430, projectionLeftMm: 157, projectionRightMm: 151, approximatePlacement: false, label: "W1  opening 1026 · casing 1430", note: "measured casing + offsets; opening is recorded window width", labelOffset: [-278, -10] },
  D1: { leftId: "D1-AL", rightId: "D1-AR", clearWidthMm: 781, casingWidthMm: 1204, projectionLeftMm: 31, projectionRightMm: 31, approximatePlacement: false, label: "D1  clear 781 · casing 1204", note: "measured casing; 31 projection", labelOffset: [-125, -68] },
  D2: { leftId: "D2-AL", rightId: "D2-AR", clearWidthMm: 767, casingWidthMm: 1096, projectionLeftMm: 37, projectionRightMm: 37, approximatePlacement: true, label: "D2  clear 767 · casing 1096", note: "casing width measured; face position approx (max 37)", labelOffset: [28, -8] },
};
const svg = [`<?xml version="1.0" encoding="UTF-8"?>`, `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-labelledby="title description">`, `<title id="title">Room A selected reconstruction</title>`, `<desc id="description">Selected ${selectedSolutionId} angle-informed Room A geometry with fitted bearings, practical angle observations, clear opening widths, and separately drawn casing front faces.</desc>`, `<style>.bg{fill:#f7f6f2}.panel{fill:#fff;stroke:#ccc}.wall{stroke:#222;stroke-width:7}.opening-reference{stroke:#1293a3;stroke-width:3;stroke-dasharray:7 5}.opening-clear{stroke:#1468a8;stroke-width:11}.casing{stroke:#d07a18;stroke-width:8}.casing-approx{stroke:#d07a18;stroke-width:8;stroke-dasharray:9 5}.casing-link{stroke:#d07a18;stroke-width:2;stroke-dasharray:4 4}.node{fill:#fff;stroke:#222;stroke-width:2}.title{font:700 28px Arial;fill:#222}.head{font:700 17px Arial;fill:#222}.body{font:14px Arial;fill:#333}.small{font:12px Arial;fill:#555}.object-label{font:700 12px Arial;fill:#333;paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}.object-note{font:11px Arial;fill:#76511f;paint-order:stroke;stroke:#fff;stroke-width:4px}.angle{font:700 12px Arial;fill:#9a5600}.good{fill:#197047;font-weight:700}.rule{stroke:#ddd}</style>`, `<rect width="1600" height="1050" class="bg"/>`, textNode(50, 48, "ROOM A — SELECTED RECONSTRUCTION", "title"), textNode(50, 76, `Selected ${selectedSolutionId}: ${selected.label} — soft angles, not exact right angles`, "body"), `<rect x="45" y="105" width="930" height="880" rx="8" class="panel"/><rect x="995" y="105" width="560" height="880" rx="8" class="panel"/>`];
for (const [a, b] of [["A0","A1"],["A1","A2"],["A2","A3"],["A3","A4"],["A4","A5"],["A5","W1-AL"],["W1-AR","A6"],["A6","D1-AL"],["D1-AR","A7"],["A7","D2-AL"],["D2-AR","A0"]]) svg.push(line(a, b, "wall"));
for (const visual of Object.values(casingVisuals)) {
  svg.push(line(visual.leftId, visual.rightId, "opening-reference"));
  const geometry = faceSegment(visual.leftId, visual.rightId, visual.casingWidthMm, visual.projectionLeftMm, visual.projectionRightMm);
  const clear = geometry.clearSegment(visual.clearWidthMm);
  svg.push(pointLine(geometry.casing[0], geometry.casing[1], visual.approximatePlacement ? "casing-approx" : "casing"));
  svg.push(pointLine(fitted[visual.leftId], geometry.casing[0], "casing-link"));
  svg.push(pointLine(fitted[visual.rightId], geometry.casing[1], "casing-link"));
  svg.push(pointLine(clear[0], clear[1], "opening-clear"));
  const centre = screen(geometry.centre), lx = centre[0] + visual.labelOffset[0], ly = centre[1] + visual.labelOffset[1];
  svg.push(textNode(lx, ly, visual.label, "object-label"));
  svg.push(textNode(lx, ly + 15, visual.note, "object-note"));
}
const labelOffsets = { A0:[-32,-12], A1:[-12,-18], A2:[-10,25], A3:[-10,25], A4:[-10,-18], A5:[-5,-18], A6:[12,18], A7:[-28,20] };
for (const [id, p] of Object.entries(fitted)) { const s = screen(p), isMain = /^A[0-7]$/.test(id); svg.push(`<circle cx="${round(s[0],1)}" cy="${round(s[1],1)}" r="${isMain ? 6 : 4}" class="node"/>`); const o = labelOffsets[id] || [8,-8]; svg.push(textNode(s[0]+o[0], s[1]+o[1], id, isMain ? "head" : "small")); }
for (const a of selected.angleResiduals) { const s = screen(fitted[a.node]); svg.push(textNode(s[0] + 14, s[1] - 20, `field ~${a.measuredDegrees}° / fit ${round(a.fittedDegrees,1)}°`, "angle")); }
const panelX = 1025; let y = 145;
svg.push(textNode(panelX,y,"SELECTION", "head")); y+=30; svg.push(textNode(panelX,y,`${selectedSolutionId}: ANGLE-INFORMED`,"good")); y+=24; svg.push(textNode(panelX,y,`Distance RMS ${round(selected.clearBaselineNodeRmsMm,3)} mm`,"body")); y+=20; svg.push(textNode(panelX,y,`Largest exact: ${selected.largestExactDistanceResidual.id} ${sign(selected.largestExactDistanceResidual.residualMm,2)} mm`,"body")); y+=20; svg.push(textNode(panelX,y,`Finished-wall area ${round(selected.finishedWallAreaM2,4)} m²`,"body")); y+=34; svg.push(`<line x1="${panelX}" y1="${y}" x2="1525" y2="${y}" class="rule"/>`); y+=30;
svg.push(textNode(panelX,y,"SELECTED RETURN BEARINGS", "head")); y+=28; svg.push(textNode(panelX,y,`A1→A2: ${round(selected.a1ToA2BearingDegrees,3)}°`,"body")); y+=22; svg.push(textNode(panelX,y,`A4→A3: ${round(selected.a4ToA3BearingDegrees,3)}°`,"body")); y+=22; svg.push(textNode(panelX,y,`Absolute difference: ${round(Math.abs(selected.returnAngularDifferenceDegrees),3)}°`,"body")); y+=18; svg.push(textNode(panelX,y,"Convention: solver +X; not site north", "small")); y+=36; svg.push(`<line x1="${panelX}" y1="${y}" x2="1525" y2="${y}" class="rule"/>`); y+=30;
svg.push(textNode(panelX,y,"THREE-SOLUTION COMPARISON", "head")); y+=28; for (const s of Object.values(solutions)) { svg.push(textNode(panelX,y,`${s.id} RMS ${round(s.clearBaselineNodeRmsMm,3)} mm · return Δ ${round(Math.abs(s.returnAngularDifferenceDegrees),3)}°`,"body")); y+=23; }
y+=12; svg.push(textNode(panelX,y,"FIELD ANGLES (OBSERVED → FITTED)","head")); y+=27; for (const a of selected.angleResiduals) { svg.push(textNode(panelX,y,`${a.node}: ~${a.measuredDegrees}° → ${round(a.fittedDegrees,2)}°`,"body")); y+=21; }
y+=14; svg.push(textNode(panelX,y,"Repeat treatment: separate weighted readings", "small")); y+=18; svg.push(textNode(panelX,y,"SUP-028 repeat lower confidence (σ 24 mm)", "small")); y+=18; svg.push(textNode(panelX,y,"No direct angle observations at A2 or A3", "small"));
const legendY = 810; svg.push(textNode(panelX,legendY,"OPENING / CASING LEGEND","head"));
for (const [index, item] of [["wall","finished wall"],["opening-clear","clear / recorded opening width"],["casing","measured casing front-face extent"],["casing-approx","measured casing width; approximate face position"],["opening-reference","wall-plane node span (not clear width)"]].entries()) { const rowY = legendY + 28 + index * 25; svg.push(`<line x1="${panelX}" y1="${rowY}" x2="${panelX + 38}" y2="${rowY}" class="${item[0]}"/>`); svg.push(textNode(panelX + 50,rowY + 4,item[1],"small")); }
svg.push(textNode(65,1020,`Source: ${evidenceRelative} · selected geometry is derived, not source evidence`,"small")); svg.push(`</svg>`);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, jsonName), `${JSON.stringify(jsonOutput, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, reportName), report);
fs.writeFileSync(path.join(outputDir, svgName), `${svg.join("\n")}\n`);
console.log(JSON.stringify({ outputDir: outputRelative, files: [svgName, jsonName, reportName], selectedSolutionId, selectedType: jsonOutput.selection.selectedType, selectedClearRmsMm: round(selected.clearBaselineNodeRmsMm, 3), largestExactResidual: jsonOutput.solutions[selectedSolutionId].largestExactDistanceResidual, returnDifferenceDegrees: jsonOutput.solutions[selectedSolutionId].bearings.absoluteReturnDifferenceDegrees, selectionTests }, null, 2));

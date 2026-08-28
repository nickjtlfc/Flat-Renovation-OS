#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "docs/survey/derived/room-c/archive");
const stem = "ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1";
const generatedDate = "2026-08-12";

const requiredEvidence = [
  "docs/survey/NODE_REFERENCE_MAP_R5.svg",
  "docs/survey/NODE_REFERENCE_REGISTER_R5.md",
  "docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md",
  "source-material/plans/rough-paint-sketch.jpg",
  "source-material/plans/2dPlan.jpeg",
];
for (const relative of requiredEvidence) {
  if (!fs.existsSync(path.join(repoRoot, relative))) throw new Error(`Required evidence missing: ${relative}`);
}
const register = fs.readFileSync(path.join(repoRoot, requiredEvidence[1]), "utf8");
for (const token of ["permanent finished-wall corner", "580 mm along the adjoining wall", "Object edge coincident with permanent point"]) {
  if (!register.includes(token)) throw new Error(`Corrected D2/D3 topology not present in node register: ${token}`);
}

const observations = [
  ["RC-01", "D3-CL", "C0", 4185, "direct", 8, "shell closure run"],
  ["RC-02", "C0", "CP1-FL", 3705, "direct", 8, "shell closure run"],
  ["RC-03", "CP1-FL", "PO1", 1534, "direct", 8, "upper shell / CP1 relationship"],
  ["RC-04", "CP1-FR", "PO1", 225, "direct", 8, "upper shell / CP1 relationship"],
  ["RC-05", "PO1", "PO2", 2318, "direct", 8, "outer stud-wall face"],
  ["RC-06", "PO2", "PO3", 2601, "direct", 8, "outer stud-wall face"],
  ["RC-07", "PO3", "D3-CL", 1346, "direct", 8, "A-C wall relationship"],
  ["RC-08", "D3-CL", "D2-CR", 580, "direct", 8, "corrected local topology"],
  ["RC-09", "D3-CR", "D4-CL", 218, "direct", 8, "wall between provisional door extents"],
  ["RC-10", "D4-CR", "C2", 548, "direct", 8, "lower shell"],
  ["RC-11", "C1", "C0", 330, "direct", 8, "lower shell"],
  ["RC-12", "C1", "W2-CR", 165, "direct", 8, "W2 recess return"],
  ["RC-13", "C2", "W2-CL", 165, "direct", 8, "W2 recess return"],
  ["RC-14", "C1", "C2", 1269, "direct", 8, "W2 recess span relationship"],
  ["RC-15", "PO2", "CP1-FL", 2760, "approximate-cross-check", 100, "rough supporting check"],
  ["RC-16", "PO2", "C0", 2100, "approximate-cross-check", 100, "rough supporting check"],
  ["RC-17", "PO2", "D3-CL", 2928, "approximate-cross-check", 100, "rough supporting check"],
  ["RC-18", "PI1", "CP2-FR", 2494, "direct", 8, "inner enclosure / CP2 relationship"],
  ["RC-19", "CP2-FL", "PI3", 2206, "direct", 8, "inner enclosure cross-tie"],
  ["RC-20", "PI3", "PI2", 2494, "direct", 8, "inner stud-wall face"],
  ["RC-21", "PI2", "PI1", 2202, "direct", 8, "inner stud-wall face"],
  ["RC-22", "CP2-FL", "PI1", 1739, "direct", 8, "upper shell / CP2 relationship"],
].map(([id, from, to, measuredMm, evidenceClass, sigmaMm, note]) => ({ id, from, to, measuredMm, evidenceClass, sigmaMm, note }));

const P = {
  cp1ToPo1: 0,
  po2ToPo3: 1,
  po1ToPo2: 2,
  po3ToD3: 3,
  angleDeg: 4,
  innerHorizontal: 5,
  innerVertical: 6,
  pi1ToCp2Fl: 7,
  cp1FrToPo1: 8,
  c0ToC1: 9,
  c1ToC2: 10,
  c1ToW2Cr: 11,
  c2ToW2Cl: 12,
  c2ToD4Cr: 13,
  d4ClToD3Cr: 14,
  d3ToD2Cr: 15,
};

const initial = [1534, 2601, 2318, 1346, 90, 2494, 2202, 1739, 225, 330, 1269, 165, 165, 548, 218, 580];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, scalar) => [a[0] * scalar, a[1] * scalar];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const round = (value, digits = 2) => { const f = 10 ** digits; return Math.round(value * f) / f; };

function coordinates(p) {
  const e = [1, 0];
  const radians = p[P.angleDeg] * Math.PI / 180;
  const down = [Math.cos(radians), Math.sin(radians)];
  const outerHorizontal = p[P.po2ToPo3];
  const outerVertical = p[P.po1ToPo2];
  const rightVertical = p[P.po3ToD3];
  const lowerRun = p[P.cp1ToPo1] + outerHorizontal;
  const leftRun = outerVertical + rightVertical;
  const c = {};

  c.C0 = [0, 0];
  c["D3-CL"] = mul(e, lowerRun);
  c["CP1-FL"] = mul(down, -leftRun);
  c.PO1 = add(c["CP1-FL"], mul(e, p[P.cp1ToPo1]));
  c["CP1-FR"] = sub(c.PO1, mul(e, p[P.cp1FrToPo1]));
  c.PO2 = add(c.PO1, mul(down, outerVertical));
  c.PO3 = add(c.PO2, mul(e, outerHorizontal));

  const topFaceThickness = outerHorizontal - p[P.innerHorizontal];
  const endFaceThickness = outerVertical - p[P.innerVertical];
  c.PI1 = add(c.PO1, mul(e, topFaceThickness));
  c.PI2 = add(c.PI1, mul(down, p[P.innerVertical]));
  c.PI3 = add(c.PI2, mul(e, p[P.innerHorizontal]));
  c["CP2-FL"] = add(c.PI1, mul(e, p[P.pi1ToCp2Fl]));
  c["CP2-FR"] = add(c.PI1, mul(e, p[P.innerHorizontal]));

  c.C1 = add(c.C0, mul(e, p[P.c0ToC1]));
  c.C2 = add(c.C1, mul(e, p[P.c1ToC2]));
  c["W2-CR"] = add(c.C1, mul(down, p[P.c1ToW2Cr]));
  c["W2-CL"] = add(c.C2, mul(down, p[P.c2ToW2Cl]));
  c["D4-CR"] = add(c.C2, mul(e, p[P.c2ToD4Cr]));

  // D4-CL and D3-CR have a measured separation but no absolute station in this first pass.
  // Equal sharing of the remaining combined D4/D3 span is only a display/null-space gauge.
  const unresolvedDoorTotal = lowerRun - c["D4-CR"][0] - p[P.d4ClToD3Cr];
  const displayDoorShare = unresolvedDoorTotal / 2;
  c["D4-CL"] = add(c["D4-CR"], mul(e, displayDoorShare));
  c["D3-CR"] = add(c["D4-CL"], mul(e, p[P.d4ClToD3Cr]));
  c["D2-CR"] = sub(c["D3-CL"], mul(down, p[P.d3ToD2Cr]));

  return {
    nodes: c,
    axes: { lowerAndUpper: e, adjoiningAndReturns: down, includedAngleDegrees: p[P.angleDeg] },
    derived: { lowerRun, leftRun, topFaceThickness, endFaceThickness, unresolvedDoorTotal, displayDoorShare },
  };
}

function observationPrediction(p, observation) {
  const c = coordinates(p).nodes;
  return distance(c[observation.from], c[observation.to]);
}

const solutionDefinitions = [
  {
    id: "D1",
    label: "distance-led diagnostic",
    includeObservation: () => true,
    angleSigmaDegrees: null,
    note: "Uses every supplied distance, with approximate checks at lower weight and no right-angle prior.",
  },
  {
    id: "A1",
    label: "architecture-informed first pass",
    includeObservation: (observation) => observation.id !== "RC-19",
    angleSigmaDegrees: 3,
    note: "Holds RC-19 out after contradiction review; uses all other distances, low-weight approximate checks and a soft 90 degree wall-family relationship.",
  },
];

function rawResiduals(p, definition) {
  const rows = observations
    .filter(definition.includeObservation)
    .map((observation) => ({
      id: observation.id,
      z: (observationPrediction(p, observation) - observation.measuredMm) / observation.sigmaMm,
    }));
  if (definition.angleSigmaDegrees) rows.push({ id: "ARCH-ANGLE-01", z: (p[P.angleDeg] - 90) / definition.angleSigmaDegrees });
  return rows;
}

function objective(p, definition) {
  return rawResiduals(p, definition).reduce((sum, row) => {
    const a = Math.abs(row.z);
    return sum + (a <= 2.5 ? 0.5 * a * a : 2.5 * (a - 1.25));
  }, 0);
}

function solveLinearSystem(matrix, vector) {
  const n = vector.length;
  const a = matrix.map((row, index) => [...row, vector[index]]);
  for (let col = 0; col < n; col += 1) {
    let pivot = col;
    for (let row = col + 1; row < n; row += 1) if (Math.abs(a[row][col]) > Math.abs(a[pivot][col])) pivot = row;
    [a[col], a[pivot]] = [a[pivot], a[col]];
    if (Math.abs(a[col][col]) < 1e-12) return null;
    const diagonal = a[col][col];
    for (let j = col; j <= n; j += 1) a[col][j] /= diagonal;
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      for (let j = col; j <= n; j += 1) a[row][j] -= factor * a[col][j];
    }
  }
  return a.map((row) => row[n]);
}

function fit(start, definition) {
  let p = [...start];
  let damping = 1e-2;
  for (let iteration = 0; iteration < 300; iteration += 1) {
    const residuals = rawResiduals(p, definition);
    const rows = residuals.length;
    const cols = p.length;
    const weights = residuals.map((row) => Math.abs(row.z) <= 2.5 ? 1 : 2.5 / Math.abs(row.z));
    const jacobian = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (let col = 0; col < cols; col += 1) {
      const step = Math.max(1e-6, Math.abs(p[col]) * 1e-6);
      const shifted = [...p]; shifted[col] += step;
      const shiftedResiduals = rawResiduals(shifted, definition);
      for (let row = 0; row < rows; row += 1) jacobian[row][col] = (shiftedResiduals[row].z - residuals[row].z) / step;
    }
    const normal = Array.from({ length: cols }, () => Array(cols).fill(0));
    const gradient = Array(cols).fill(0);
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        gradient[col] += weights[row] * jacobian[row][col] * residuals[row].z;
        for (let other = 0; other < cols; other += 1) normal[col][other] += weights[row] * jacobian[row][col] * jacobian[row][other];
      }
    }
    for (let index = 0; index < cols; index += 1) normal[index][index] += damping * (normal[index][index] + 1e-6);
    const delta = solveLinearSystem(normal, gradient.map((value) => -value));
    if (!delta) break;
    const trial = p.map((value, index) => value + delta[index]);
    if (trial[P.angleDeg] < 70 || trial[P.angleDeg] > 110 || trial.some((value, index) => index !== P.angleDeg && value <= 0)) {
      damping *= 5;
      continue;
    }
    if (objective(trial, definition) < objective(p, definition)) {
      p = trial;
      damping = Math.max(damping / 2, 1e-9);
      if (Math.max(...delta.map(Math.abs)) < 1e-7) break;
    } else damping = Math.min(damping * 5, 1e12);
  }
  return p;
}

function diagnose(parameters, definition) {
  const geometry = coordinates(parameters);
  const residuals = observations.map((observation) => {
    const solvedMm = observationPrediction(parameters, observation);
    const usedInFit = definition.includeObservation(observation);
    return {
      ...observation,
      solvedMm,
      residualMm: solvedMm - observation.measuredMm,
      usedInFit,
      weightingClass: usedInFit
        ? observation.evidenceClass === "direct" ? `direct / sigma ${observation.sigmaMm} mm / Huber` : `low-weight approximate / sigma ${observation.sigmaMm} mm / Huber`
        : "direct validation held out after contradiction review",
    };
  });
  const usedDirect = residuals.filter((row) => row.usedInFit && row.evidenceClass === "direct");
  const approximate = residuals.filter((row) => row.evidenceClass === "approximate-cross-check");
  const rms = (rows) => Math.sqrt(rows.reduce((sum, row) => sum + row.residualMm ** 2, 0) / rows.length);
  const sorted = [...residuals].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm));
  return {
    id: definition.id,
    label: definition.label,
    note: definition.note,
    parameters,
    geometry,
    objective: objective(parameters, definition),
    usedDirectRmsMm: rms(usedDirect),
    approximateRmsMm: rms(approximate),
    largestResidual: sorted[0],
    residuals,
  };
}

const fitted = {};
for (const definition of solutionDefinitions) fitted[definition.id] = fit(initial, definition);
const solutions = Object.fromEntries(solutionDefinitions.map((definition) => [definition.id, diagnose(fitted[definition.id], definition)]));
const selected = solutions.A1;
const selectedNodes = selected.geometry.nodes;

function impliedAngleFromInnerMeasurements() {
  const a = 2494 - 1739;
  const b = 2202;
  const diagonal = 2206;
  const cosine = (diagonal ** 2 - a ** 2 - b ** 2) / (2 * a * b);
  return Math.acos(Math.max(-1, Math.min(1, cosine))) * 180 / Math.PI;
}

function polygonArea(points) {
  let twice = 0;
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index], b = points[(index + 1) % points.length];
    twice += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(twice) / 2;
}

const partitionPolygon = [selectedNodes.PO1, selectedNodes.PO2, selectedNodes.PO3, selectedNodes.PI3, selectedNodes.PI2, selectedNodes.PI1];
const envelopePolygon = [selectedNodes.C0, selectedNodes["CP1-FL"], selectedNodes["CP2-FR"], selectedNodes["D3-CL"]];
const selectedResiduals = selected.residuals.map((row) => ({
  id: row.id,
  from: row.from,
  to: row.to,
  measuredMm: row.measuredMm,
  solvedMm: round(row.solvedMm, 2),
  residualMm: round(row.residualMm, 2),
  evidenceClass: row.evidenceClass,
  weightingClass: row.weightingClass,
  nominalSigmaMm: row.sigmaMm,
  usedInSelectedFit: row.usedInFit,
  note: row.note,
}));

const architecturalConstraints = [
  { id: "ARCH-01", class: "hard topology", statement: "D3-CL is the permanent finished-wall corner; D2-CR is 580 mm along the adjoining wall and is not the corner." },
  { id: "ARCH-02", class: "hard parameterisation", statement: "C0-D3-CL, CP1-FL-PO1, PO2-PO3, PI1-CP2-FR and PI2-PI3 use one continuous/parallel wall-direction family." },
  { id: "ARCH-03", class: "hard parameterisation", statement: "C0-CP1-FL, PO1-PO2, PO3-D3-CL, PI1-PI2 and the A-C wall use the adjoining wall-direction family." },
  { id: "ARCH-04", class: "soft architectural constraint", statement: "The two wall-direction families are approximately perpendicular, modelled as 90 degrees with sigma 3 degrees in A1." },
  { id: "ARCH-05", class: "hard topology", statement: "PO and PI partition faces remain distinct; the L-shaped wall is never collapsed to one line." },
  { id: "ARCH-06", class: "hard topology", statement: "C1/W2-CR and C2/W2-CL are the two 165 mm W2 recess returns; C1-C2 is their 1269 mm span relationship." },
  { id: "ARCH-07", class: "display-only null-space gauge", statement: "The unmeasured combined D4/D3 opening span is shared equally only to place provisional symbols; this does not solve either casing width." },
];

const contradiction = {
  observationId: "RC-19",
  impliedAngleDegreesIfInnerOppositeRunsAreParallel: round(impliedAngleFromInnerMeasurements(), 3),
  selectedAngleDegrees: round(selected.geometry.axes.includedAngleDegrees, 3),
  selectedResidualMm: round(selected.residuals.find((row) => row.id === "RC-19").residualMm, 2),
  treatment: "Held out of A1 after contradiction review; retained and reported as a direct validation observation.",
  reason: "RC-18/20/21/22 plus the registered parallel/continuous wall relationships make RC-19 imply about 99.6 degrees. RC-15/16/17 independently imply about 90-93 degrees, and the plan/photo topology is broadly rectilinear.",
};
const closureTensions = [
  {
    id: "CLOSURE-H",
    relationship: "RC-01 versus RC-03 + RC-06",
    directMm: 4185,
    componentSumMm: 1534 + 2601,
    mismatchMm: 4185 - (1534 + 2601),
    interpretation: "The continuous/parallel lower, upper and outer-partition runs do not close by 50 mm. No single contributing observation can be isolated from this network alone.",
  },
  {
    id: "CLOSURE-V",
    relationship: "RC-02 versus RC-05 + RC-07",
    directMm: 3705,
    componentSumMm: 2318 + 1346,
    mismatchMm: 3705 - (2318 + 1346),
    interpretation: "The continuous/parallel side and adjoining-wall runs do not close by 41 mm. No single contributing observation can be isolated from this network alone.",
  },
];

function serialiseSolution(solution) {
  return {
    id: solution.id,
    label: solution.label,
    note: solution.note,
    objective: round(solution.objective, 4),
    includedAngleDegrees: round(solution.geometry.axes.includedAngleDegrees, 4),
    usedDirectRmsMm: round(solution.usedDirectRmsMm, 3),
    approximateCrossCheckRmsMm: round(solution.approximateRmsMm, 3),
    largestResidual: { id: solution.largestResidual.id, residualMm: round(solution.largestResidual.residualMm, 2), usedInFit: solution.largestResidual.usedInFit },
    residuals: solution.residuals.map((row) => ({ id: row.id, measuredMm: row.measuredMm, solvedMm: round(row.solvedMm, 2), residualMm: round(row.residualMm, 2), usedInFit: row.usedInFit })),
  };
}

const jsonOutput = {
  documentType: "derived Room C first-pass 2D reconstruction and residual record - not source evidence",
  version: "0.1",
  generatedDate,
  units: "millimetres",
  status: "first-pass proposal for human visual review; not accepted geometry",
  scope: "Permanent finished-wall shell and current thick stud partition. Detailed D2/D3/D4/W2/CP1/CP2 object reconstruction is deferred.",
  authoritativeTopology: ["docs/survey/NODE_REFERENCE_MAP_R5.svg", "docs/survey/NODE_REFERENCE_REGISTER_R5.md"],
  validationEvidence: ["docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md", "source-material/photos/RoomC/", "source-material/plans/rough-paint-sketch.jpg", "source-material/plans/2dPlan.jpeg"],
  coordinateGauge: { origin: "C0", positiveX: "C0 toward D3-CL", positiveY: "approximately into the W2 recess / down on the reconstruction sheet", siteNorth: false },
  method: { loss: "Huber", huberThresholdStandardDeviations: 2.5, directNominalSigmaMm: 8, approximateCrossCheckSigmaMm: 100, selectedSoftAngleSigmaDegrees: 3 },
  architecturalConstraints,
  candidates: Object.fromEntries(Object.values(solutions).map((solution) => [solution.id, serialiseSolution(solution)])),
  selection: {
    selectedSolutionId: "A1",
    reason: "A1 preserves the measured topology, the three approximate cross-checks and the broadly rectilinear architectural/photo evidence. D1 reduces RC-19 but produces a visibly skewed 99-degree wall-family relationship and worsens every approximate cross-check.",
    contradiction,
    secondaryClosureTensions: closureTensions,
  },
  selectedGeometry: {
    axes: {
      lowerAndUpperDirection: { x: 1, y: 0 },
      adjoiningAndReturnDirection: { x: round(selected.geometry.axes.adjoiningAndReturns[0], 8), y: round(selected.geometry.axes.adjoiningAndReturns[1], 8) },
      includedAngleDegrees: round(selected.geometry.axes.includedAngleDegrees, 4),
    },
    nodesMm: Object.fromEntries(Object.entries(selectedNodes).map(([id, point]) => [id, { x: round(point[0], 2), y: round(point[1], 2), status: ["D4-CL", "D3-CR"].includes(id) ? "provisional display station; absolute station underdetermined" : "solved or directly derived first-pass node" }])),
    permanentEnvelopeSequence: ["C0", "CP1-FL", "PO1", "PI1", "CP2-FR", "D3-CL", "C0"],
    currentStudPartitionOuterFace: ["PO1", "PO2", "PO3"],
    currentStudPartitionInnerFace: ["PI1", "PI2", "PI3"],
    currentStudPartitionPolygon: ["PO1", "PO2", "PO3", "PI3", "PI2", "PI1"],
    derivedPartitionFaceSeparationsMm: {
      atTopJunctionAlongUpperWall: round(selected.geometry.derived.topFaceThickness, 2),
      atACWallJunctionAlongAdjoiningWall: round(selected.geometry.derived.endFaceThickness, 2),
      note: "Derived from differences between fitted PO and PI face runs; not direct thickness readings and not a uniform construction-thickness claim.",
    },
    outlineMetrics: {
      lowerC0ToD3CornerMm: round(selected.geometry.derived.lowerRun, 2),
      leftC0ToCP1FlMm: round(selected.geometry.derived.leftRun, 2),
      envelopeAreaExcludingCupboardDepthsM2: round(polygonArea(envelopePolygon) / 1e6, 4),
      partitionPlanAreaM2: round(polygonArea(partitionPolygon) / 1e6, 4),
      warning: "The envelope area excludes unmeasured CP1/CP2 rear depths and is not an accepted Room C floor area.",
    },
    unresolvedObjects: {
      D2: "D2-CR is fixed; D2-CL, casing/opening width, reveal and swing are not solved.",
      D3: "D3-CL is fixed at the permanent corner; D3-CR absolute station and detailed casing/opening geometry are provisional.",
      D4: "D4-CR is locally fixed from C2; D4-CL absolute station and detailed casing/opening geometry are provisional.",
      W2: "The two 165 mm returns and 1269 mm C1-C2 relationship are used; detailed casing/reveal/opening geometry is deferred.",
      CP1: "Front relationship CP1-FL/CP1-FR/PO1 is represented; rear depth and full footprint are not solved.",
      CP2: "Front relationship PI1/CP2-FL/CP2-FR is represented; rear depth and full footprint are not solved.",
    },
  },
  observationResiduals: selectedResiduals,
};

function escapeXml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function makeSvg() {
  const measuredPoints = Object.values(selectedNodes);
  const minX = Math.min(...measuredPoints.map((point) => point[0])) - 260;
  const maxX = Math.max(...measuredPoints.map((point) => point[0])) + 260;
  const minY = Math.min(...measuredPoints.map((point) => point[1])) - 330;
  const maxY = Math.max(...measuredPoints.map((point) => point[1])) + 280;
  const planBox = { x: 60, y: 245, width: 1190, height: 1035 };
  const scale = Math.min(planBox.width / (maxX - minX), planBox.height / (maxY - minY));
  const pt = (idOrPoint) => {
    const point = typeof idOrPoint === "string" ? selectedNodes[idOrPoint] : idOrPoint;
    return [planBox.x + (point[0] - minX) * scale, planBox.y + (point[1] - minY) * scale];
  };
  const pair = (value) => value.map((number) => round(number, 1)).join(",");
  const line = (from, to, cls, extra = "") => { const a = pt(from), b = pt(to); return `<line x1="${round(a[0], 1)}" y1="${round(a[1], 1)}" x2="${round(b[0], 1)}" y2="${round(b[1], 1)}" class="${cls}" ${extra}/>`; };
  const poly = (ids, cls) => `<polygon points="${ids.map((id) => pair(pt(id))).join(" ")}" class="${cls}"/>`;
  const objectNode = (id, provisional = false) => { const [x, y] = pt(id); return `<path d="M${round(x, 1)} ${round(y - 8, 1)} L${round(x + 8, 1)} ${round(y, 1)} L${round(x, 1)} ${round(y + 8, 1)} L${round(x - 8, 1)} ${round(y, 1)} Z" class="${provisional ? "object provisionalNode" : "object"}"/>`; };
  const studNode = (id) => { const [x, y] = pt(id); return `<rect x="${round(x - 7, 1)}" y="${round(y - 7, 1)}" width="14" height="14" class="studNode"/>`; };
  const permNode = (id) => { const [x, y] = pt(id); return `<circle cx="${round(x, 1)}" cy="${round(y, 1)}" r="8" class="perm"/>`; };
  const textAt = (id, dx, dy, text, cls = "label", anchor = "start") => { const [x, y] = pt(id); return `<text x="${round(x + dx, 1)}" y="${round(y + dy, 1)}" class="${cls}" text-anchor="${anchor}">${escapeXml(text)}</text>`; };

  const topResiduals = [...selectedResiduals].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm)).slice(0, 7);
  const [d2x, d2y] = pt("D2-CR"), [po3x, po3y] = pt("PO3");
  const [cp1flx, cp1fly] = pt("CP1-FL"), [cp1frx] = pt("CP1-FR");
  const [cp2flx, cp2fly] = pt("CP2-FL"), [cp2frx] = pt("CP2-FR");
  const residualRows = topResiduals.map((row, index) => {
    const y = 755 + index * 35;
    return `<text x="1325" y="${y}" class="sideSmall"><tspan class="mono">${row.id}</tspan><tspan x="1415">${round(row.measuredMm, 1)}</tspan><tspan x="1505">${round(row.solvedMm, 1)}</tspan><tspan x="1600" class="${Math.abs(row.residualMm) > 50 ? "bad" : ""}">${row.residualMm >= 0 ? "+" : ""}${round(row.residualMm, 1)}</tspan></text>`;
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1450" viewBox="0 0 1800 1450" role="img" aria-labelledby="title desc">
  <title id="title">Room C first-pass measured reconstruction v0.1</title>
  <desc id="desc">Architecture-informed first-pass Room C finished-wall shell and current thick stud partition. Detailed door, window and cupboard geometry remains provisional. Not construction geometry.</desc>
  <defs>
    <style>
      .page{fill:#fff;stroke:#0f172a;stroke-width:3}.head{font:700 34px Arial,sans-serif;fill:#0f172a}.sub{font:19px Arial,sans-serif;fill:#334155}.warn{font:700 18px Arial,sans-serif;fill:#9f1239}.panel{fill:#f8fafc;stroke:#94a3b8;stroke-width:2}.envelope{fill:#eff6ff;stroke:none}.bedroom{fill:#faf5ff;stroke:none}.partition{fill:#e9d5ff;stroke:#7e22ce;stroke-width:4;stroke-linejoin:miter}.wall{stroke:#1e293b;stroke-width:9;stroke-linecap:square}.struct{stroke:#b91c1c;stroke-width:11;stroke-linecap:square}.opening{stroke:#0f766e;stroke-width:10}.openingProvisional{stroke:#d97706;stroke-width:10;stroke-dasharray:14 8}.window{stroke:#0284c7;stroke-width:11}.uncertain{stroke:#d97706;stroke-width:18;stroke-dasharray:7 8;opacity:.45}.perm{fill:#fff;stroke:#0f172a;stroke-width:3}.object{fill:#fffbeb;stroke:#d97706;stroke-width:3}.provisionalNode{stroke-dasharray:4 3}.studNode{fill:#faf5ff;stroke:#7e22ce;stroke-width:3}.label{font:700 15px Arial,sans-serif;fill:#0f172a}.objectLabel{font:700 15px Arial,sans-serif;fill:#9a3412}.studLabel{font:700 15px Arial,sans-serif;fill:#7e22ce}.tiny{font:14px Arial,sans-serif;fill:#475569}.room{font:700 25px Arial,sans-serif;fill:#1e3a8a}.sideHead{font:700 23px Arial,sans-serif;fill:#0f172a}.side{font:17px Arial,sans-serif;fill:#1f2937}.sideSmall{font:15px Arial,sans-serif;fill:#334155}.mono{font-family:Consolas,monospace;font-weight:700}.bad{fill:#b91c1c;font-weight:700}.callout{fill:#fff7ed;stroke:#d97706;stroke-width:2}.guide{stroke:#64748b;stroke-width:2;stroke-dasharray:7 6;fill:none}.cupFront{stroke:#a16207;stroke-width:15}.measure{stroke:#64748b;stroke-width:2;marker-start:url(#arrow);marker-end:url(#arrow)}
    </style>
    <marker id="arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto"><path d="M7 3.5 L0 0 L0 7 Z" fill="#64748b"/></marker>
  </defs>
  <rect x="15" y="15" width="1770" height="1420" rx="12" class="page"/>
  <text id="titleText" x="55" y="70" class="head">ROOM C FIRST-PASS 2D RECONSTRUCTION · v0.1</text>
  <text x="55" y="105" class="sub">Measured shell network + current thick stud partition · selected solution A1 · units mm</text>
  <text x="55" y="138" class="warn">HUMAN REVIEW ONLY — NOT ACCEPTED OR CONSTRUCTION GEOMETRY — OBJECT DETAIL AWAITS SECOND-PASS SURVEY</text>
  <rect x="45" y="175" width="1225" height="1210" rx="12" class="panel"/>
  <rect x="1290" y="175" width="465" height="1210" rx="12" class="panel"/>

  ${poly(["C0", "CP1-FL", "CP2-FR", "D3-CL"], "envelope")}
  ${poly(["PI1", "CP2-FR", "PI3", "PI2"], "bedroom")}
  ${poly(["PO1", "PO2", "PO3", "PI3", "PI2", "PI1"], "partition")}

  ${line("C0", "CP1-FL", "wall")}
  ${line("CP1-FL", "CP1-FR", "cupFront")}
  ${line("CP1-FR", "PO1", "wall")}
  ${line("PI1", "CP2-FL", "wall")}
  ${line("CP2-FL", "CP2-FR", "cupFront")}
  ${line("CP2-FR", "PI3", "struct")}
  ${line("D3-CL", "D2-CR", "struct")}
  ${line("PO3", "D2-CR", "uncertain")}

  ${line("C0", "C1", "wall")}
  ${line("C1", "W2-CR", "wall")}
  ${line("W2-CR", "W2-CL", "window")}
  ${line("W2-CL", "C2", "wall")}
  ${line("C2", "D4-CR", "wall")}
  ${line("D4-CR", "D4-CL", "openingProvisional")}
  ${line("D4-CL", "D3-CR", "wall")}
  ${line("D3-CR", "D3-CL", "openingProvisional")}

  <line x1="${round(cp1flx, 1)}" y1="${round(cp1fly - 34, 1)}" x2="${round(cp1frx, 1)}" y2="${round(cp1fly - 34, 1)}" class="guide"/>
  <text x="${round((cp1flx + cp1frx) / 2, 1)}" y="${round(cp1fly - 47, 1)}" class="tiny" text-anchor="middle">CP1 front supported · rear/depth not solved</text>
  <line x1="${round(cp2flx, 1)}" y1="${round(cp2fly - 34, 1)}" x2="${round(cp2frx, 1)}" y2="${round(cp2fly - 34, 1)}" class="guide"/>
  <text x="${round((cp2flx + cp2frx) / 2, 1)}" y="${round(cp2fly - 47, 1)}" class="tiny" text-anchor="middle">CP2 front supported · rear/depth not solved</text>

  <line x1="${round(po3x + 20, 1)}" y1="${round(po3y, 1)}" x2="${round(d2x + 20, 1)}" y2="${round(d2y, 1)}" class="guide"/>
  <text x="${round((po3x + d2x) / 2 - 24, 1)}" y="${round((po3y + d2y) / 2, 1)}" class="tiny" text-anchor="end">D2 extent / D2-CL unresolved</text>

  ${permNode("C0")}${permNode("C1")}${permNode("C2")}
  ${objectNode("CP1-FL")}${objectNode("CP1-FR")}${objectNode("CP2-FL")}${objectNode("CP2-FR")}
  ${objectNode("W2-CR")}${objectNode("W2-CL")}${objectNode("D4-CR")}${objectNode("D4-CL", true)}${objectNode("D3-CR", true)}${objectNode("D2-CR")}
  ${permNode("D3-CL")}${objectNode("D3-CL")}
  ${["PO1", "PO2", "PO3", "PI1", "PI2", "PI3"].map(studNode).join("")}

  ${textAt("C0", -12, 26, "C0", "label", "end")}${textAt("C1", -7, -15, "C1", "label", "end")}${textAt("C2", 7, -15, "C2", "label")}
  ${textAt("W2-CR", -8, 27, "W2-CR", "objectLabel", "end")}${textAt("W2-CL", 8, 27, "W2-CL", "objectLabel")}
  ${textAt("D4-CR", -8, -15, "D4-CR", "objectLabel", "end")}${textAt("D4-CL", -8, 28, "D4-CL*", "objectLabel", "end")}
  ${textAt("D3-CR", 8, 28, "D3-CR*", "objectLabel")}${textAt("D3-CL", -10, -17, "D3-CL · CORNER", "objectLabel", "end")}
  ${textAt("D2-CR", -15, 5, "D2-CR", "objectLabel", "end")}
  ${textAt("CP1-FL", -8, 25, "CP1-FL", "objectLabel", "end")}${textAt("CP1-FR", 8, 25, "CP1-FR", "objectLabel")}
  ${textAt("CP2-FL", -8, 25, "CP2-FL", "objectLabel", "end")}${textAt("CP2-FR", 8, 25, "CP2-FR", "objectLabel")}
  ${textAt("PO1", -10, -14, "PO1", "studLabel", "end")}${textAt("PI1", 10, -14, "PI1", "studLabel")}
  ${textAt("PO2", -10, 25, "PO2", "studLabel", "end")}${textAt("PI2", 10, -15, "PI2", "studLabel")}
  ${textAt("PO3", 10, 25, "PO3", "studLabel")}${textAt("PI3", 10, -15, "PI3", "studLabel")}

  <text x="${round(pt([1900, -750])[0], 1)}" y="${round(pt([1900, -750])[1], 1)}" class="room" text-anchor="middle">OPEN ROOM C</text>
  <text x="${round(pt([3000, -2800])[0], 1)}" y="${round(pt([3000, -2800])[1], 1)}" class="room" text-anchor="middle">CURRENT BEDROOM</text>
  <text x="${round(pt([3000, -2800])[0], 1)}" y="${round(pt([3000, -2800])[1] + 25, 1)}" class="tiny" text-anchor="middle">inside existing stud partition</text>
  <rect x="78" y="1286" width="1135" height="72" rx="8" class="callout"/>
  <text x="96" y="1314" class="side"><tspan font-weight="700">* D4-CL / D3-CR stations:</tspan> display-only equal split of an underdetermined span.</text>
  <text x="96" y="1341" class="side">Dashed amber openings and cupboard/W2 detail remain provisional pending the second-pass object survey.</text>

  <text x="1320" y="220" class="sideHead">Selected geometry</text>
  <text x="1320" y="255" class="side">Wall-family angle: <tspan font-weight="700">${round(selected.geometry.axes.includedAngleDegrees, 2)}°</tspan></text>
  <text x="1320" y="286" class="side">C0 → D3-CL: <tspan font-weight="700">${round(selected.geometry.derived.lowerRun, 1)} mm</tspan></text>
  <text x="1320" y="317" class="side">C0 → CP1-FL: <tspan font-weight="700">${round(selected.geometry.derived.leftRun, 1)} mm</tspan></text>
  <text x="1320" y="348" class="side">PO wall: <tspan font-weight="700">${round(distance(selectedNodes.PO1, selectedNodes.PO2), 1)} × ${round(distance(selectedNodes.PO2, selectedNodes.PO3), 1)} mm</tspan></text>
  <text x="1320" y="379" class="side">PI wall: <tspan font-weight="700">${round(distance(selectedNodes.PI1, selectedNodes.PI2), 1)} × ${round(distance(selectedNodes.PI2, selectedNodes.PI3), 1)} mm</tspan></text>

  <rect x="1310" y="410" width="425" height="238" rx="8" class="callout"/>
  <text x="1330" y="444" class="sideHead">Network conflict</text>
  <text x="1330" y="477" class="side">RC-19 implies <tspan font-weight="700">${round(contradiction.impliedAngleDegreesIfInnerOppositeRunsAreParallel, 2)}°</tspan>.</text>
  <text x="1330" y="507" class="side">Three approximate checks imply</text>
  <text x="1330" y="532" class="side">roughly 90–93° and agree with</text>
  <text x="1330" y="557" class="side">the plan/photo topology.</text>
  <text x="1330" y="589" class="warn">RC-19 held out of selected fit</text>
  <text x="1330" y="618" class="side">Residual retained: <tspan class="bad">${contradiction.selectedResidualMm >= 0 ? "+" : ""}${contradiction.selectedResidualMm} mm</tspan></text>

  <text x="1320" y="696" class="sideHead">Largest residuals</text>
  <text x="1325" y="726" class="sideSmall"><tspan class="mono">ID</tspan><tspan x="1415">measured</tspan><tspan x="1505">solved</tspan><tspan x="1600">residual</tspan></text>
  ${residualRows}

  <text x="1320" y="1020" class="sideHead">Reference key</text>
  <circle cx="1335" cy="1055" r="8" class="perm"/><text x="1360" y="1061" class="side">permanent point/corner</text>
  <path d="M1335 1080 L1343 1088 L1335 1096 L1327 1088 Z" class="object"/><text x="1360" y="1094" class="side">object/casing edge</text>
  <rect x="1328" y="1114" width="14" height="14" class="studNode"/><text x="1360" y="1127" class="side">stud-wall face node</text>
  <line x1="1322" y1="1157" x2="1348" y2="1157" class="wall"/><text x="1360" y="1163" class="side">permanent wall</text>
  <line x1="1322" y1="1193" x2="1348" y2="1193" class="openingProvisional"/><text x="1360" y="1199" class="side">provisional object extent</text>
  <text x="1320" y="1250" class="sideSmall">Schematic sheet orientation only.</text>
  <text x="1320" y="1275" class="sideSmall">No site-north bearing is asserted.</text>
  <text x="1320" y="1316" class="sideSmall">Generated ${generatedDate}</text>
  <text x="1320" y="1342" class="sideSmall">Solver: scripts/solve_room_c_first_pass.mjs</text>
</svg>`;
}

function makeReport() {
  const rows = selectedResiduals.map((row) => `| \`${row.id}\` | \`${row.from}\` | \`${row.to}\` | ${row.measuredMm} | ${row.solvedMm.toFixed(2)} | ${row.residualMm >= 0 ? "+" : ""}${row.residualMm.toFixed(2)} | ${row.evidenceClass} | ${row.weightingClass}${row.usedInSelectedFit ? "" : " — **not used in A1 fit**"} |`).join("\n");
  const largest = [...selectedResiduals].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm)).slice(0, 6);
  return `# Room C reconstruction — first pass v0.1

Status: **proposal for human visual review; not accepted or construction geometry**.

This pass reconstructs the permanent finished-wall network and the current L-shaped stud partition. It does not perform the detailed D2/D3/D4/W2/CP1/CP2 object survey or reconcile Room C globally with Rooms A, B or the WC.

## Selected result

Solution **A1 (architecture-informed first pass)** is selected. It uses the corrected D3/D2 topology, hard continuous/parallel wall-family relationships, distinct PO/PI wall faces, every supplied observation except the contradicted RC-19, the three approximate checks at lower weight, and a soft 90° architectural relationship between the two wall-direction families.

- Solved wall-family angle: **${round(selected.geometry.axes.includedAngleDegrees, 3)}°**.
- C0 → D3-CL solved envelope run: **${round(selected.geometry.derived.lowerRun, 2)} mm**.
- C0 → CP1-FL solved envelope run: **${round(selected.geometry.derived.leftRun, 2)} mm**.
- Outer stud face: PO1 → PO2 **${round(distance(selectedNodes.PO1, selectedNodes.PO2), 2)} mm**; PO2 → PO3 **${round(distance(selectedNodes.PO2, selectedNodes.PO3), 2)} mm**.
- Inner stud face: PI1 → PI2 **${round(distance(selectedNodes.PI1, selectedNodes.PI2), 2)} mm**; PI2 → PI3 **${round(distance(selectedNodes.PI2, selectedNodes.PI3), 2)} mm**.
- Derived face separations are approximately **${round(selected.geometry.derived.topFaceThickness, 2)} mm** at the upper junction and **${round(selected.geometry.derived.endFaceThickness, 2)} mm** at the A–C-wall junction. These come from differences between PO and PI face runs; they are not direct or uniform-thickness measurements.

No accepted Room C floor area is reported because CP1/CP2 rear depths and several object extents are not measured.

## Contradiction review

RC-19 is retained as a direct observation but held out of the selected A1 fit. With the registered parallel/continuous inner enclosure relationships, RC-18, RC-20, RC-21 and RC-22 make RC-19 imply an included angle of **${round(contradiction.impliedAngleDegreesIfInnerOppositeRunsAreParallel, 3)}°**. That conflicts with:

- RC-15, RC-16 and RC-17, which independently imply approximately 90–93°;
- the broadly rectilinear plan topology; and
- the Room C photographs, which show a conventional near-orthogonal shell/partition arrangement rather than a strongly skewed enclosure.

The selected solution leaves RC-19 at **${contradiction.selectedResidualMm >= 0 ? "+" : ""}${contradiction.selectedResidualMm.toFixed(2)} mm**. This is intentionally visible and should be rechecked before an accepted Room C baseline is created.

For comparison, distance-led diagnostic D1 produces a **${round(solutions.D1.geometry.axes.includedAngleDegrees, 3)}°** angle. It fits RC-19 more closely but degrades all three approximate cross-checks and gives the room a visibly less plausible skew, so it is not selected.

Two smaller direct-network closure tensions also remain:

- RC-01 is **50 mm** longer than RC-03 + RC-06.
- RC-02 is **41 mm** longer than RC-05 + RC-07.

The hard continuous/parallel wall topology distributes those mismatches across the contributing readings, producing the roughly 14–17 mm residuals visible below. The current evidence does not isolate one bad reading in either closure group, so none is discarded.

## Residuals

Direct observations use nominal sigma 8 mm. Approximate cross-checks use sigma 100 mm and therefore have lower influence. Huber loss limits the effect of large standardized residuals. RC-19 is validation-only in A1 after the explicit contradiction review.

| ID | From | To | Measured mm | Solved mm | Residual mm | Evidence class | Weighting / constraint class |
|---|---|---|---:|---:|---:|---|---|
${rows}

Largest absolute residuals:

${largest.map((row) => `- \`${row.id}\`: ${row.residualMm >= 0 ? "+" : ""}${row.residualMm.toFixed(2)} mm${row.usedInSelectedFit ? "" : " (held-out validation)"}.`).join("\n")}

## Architectural constraints used

${architecturalConstraints.map((item) => `- **${item.id} — ${item.class}:** ${item.statement}`).join("\n")}

## Object status for the second pass

- **D2:** D2-CR is fixed 580 mm from the permanent corner at D3-CL. D2-CL, casing/opening width, reveal and swing remain unresolved.
- **D3:** D3-CL is fixed at the permanent corner. The absolute station of D3-CR and all detailed casing/opening geometry remain provisional.
- **D4:** D4-CR is locally fixed 548 mm from C2. The absolute station of D4-CL and all detailed casing/opening geometry remain provisional.
- **W2:** the two 165 mm returns and the 1269 mm C1 → C2 relationship are used. Detailed casing, reveal and opening geometry remains deferred.
- **CP1:** the measured CP1-FL / CP1-FR / PO1 front relationship is shown. Rear depth, casing thickness and full footprint are not solved.
- **CP2:** the measured PI1 / CP2-FL / CP2-FR front relationship is shown. Rear depth, casing thickness and full footprint are not solved.

The SVG uses an equal display split for the otherwise underdetermined combined D4/D3 opening span. That is a null-space drawing gauge only and is not a solved door width.

## Evidence checked

- corrected R5 node map and register;
- provisional flat evidence-map notes and both plan sources;
- all nine Room C photographs, including the shell walls, cupboard views and ceiling/wall junction views;
- existing Room A and Room B/WC reconstruction conventions for versioning, residual visibility and derived-output separation.

## Human-review gate

Review the SVG against the real Room C, especially the near-orthogonal overall shell, the L-shaped thick partition, the D3 turning corner, the W2 recess, and the unresolved D2/D3/D4 object zones. Do not use this first pass for global reconciliation or detailed object reconstruction.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(jsonOutput, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  selectedSolution: "A1",
  angleDegrees: round(selected.geometry.axes.includedAngleDegrees, 4),
  usedDirectRmsMm: round(selected.usedDirectRmsMm, 3),
  approximateRmsMm: round(selected.approximateRmsMm, 3),
  rc19ResidualMm: contradiction.selectedResidualMm,
  outputs: [
    path.relative(repoRoot, path.join(outputDir, `${stem}.svg`)),
    path.relative(repoRoot, path.join(outputDir, `${stem}.json`)),
    path.relative(repoRoot, path.join(outputDir, `${stem}.md`)),
  ],
}, null, 2));

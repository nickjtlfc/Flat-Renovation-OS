#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "docs/survey/derived/global-reconciliation");
const stem = "WHOLE_FLAT_V1_3_EXISTING_VALIDATION_AUDIT_v0_1";

const sources = {
  frozen: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.json",
  roomA: "docs/survey/derived/room-a/ROOM_A_RECONSTRUCTION_PILOT_v0_1.json",
  roomAEvidence: "docs/survey/ROOM_A_EVIDENCE_v1_1.md",
  roomC: "docs/survey/derived/room-c/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json",
  roomBPilot: "docs/survey/derived/room-b-wc/ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json",
  roomB: "docs/survey/derived/room-b-wc/ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.json",
  roomBRectWC: "docs/survey/derived/room-b-wc/ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3.json",
  roomBEvidence: "docs/survey/ROOM_B_EVIDENCE_v1.md",
  roomWCEvidence: "docs/survey/ROOM_WC_EVIDENCE_v1.md",
  nodeRegister: "docs/survey/NODE_REFERENCE_REGISTER_R5.md",
};

const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));
const hashText = (text) => crypto.createHash("sha256").update(text).digest("hex");
const round = (value, digits = 3) => value == null ? null : Number(value.toFixed(digits));
const p = (value) => [value.x, value.y];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const subtract = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const multiply = (a, scalar) => [a[0] * scalar, a[1] * scalar];
const midpoint = (a, b) => multiply(add(a, b), 0.5);
const unit = (a) => multiply(a, 1 / Math.hypot(a[0], a[1]));
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const lineIntersection = (originA, directionA, originB, directionB) => {
  const denominator = cross(directionA, directionB);
  if (Math.abs(denominator) < 1e-10) throw new Error("Expected non-parallel lines");
  return add(originA, multiply(directionA, cross(subtract(originB, originA), directionB) / denominator));
};
const pointToLineDistance = (point, lineA, lineB) => Math.abs(cross(subtract(lineB, lineA), subtract(point, lineA))) / distance(lineA, lineB);
const interiorAngle = (previous, node, next) => {
  const a = subtract(previous, node);
  const b = subtract(next, node);
  const cosine = Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1]) / (Math.hypot(...a) * Math.hypot(...b))));
  return Math.acos(cosine) * 180 / Math.PI;
};

const frozenText = read(sources.frozen);
const frozen = JSON.parse(frozenText);
const roomA = readJson(sources.roomA);
const roomC = readJson(sources.roomC);
const roomB = readJson(sources.roomB);
const roomBRectWC = readJson(sources.roomBRectWC);

if (frozen.version !== "1.3" || frozen.freeze?.frozenForNextStage !== true) {
  throw new Error("The required frozen v1.3 candidate was not found or is not marked frozen.");
}

const A = Object.fromEntries(Object.entries(frozen.geometry.roomAFinalReviewMm).map(([id, value]) => [id, p(value)]));
const C = Object.fromEntries(Object.entries(frozen.geometry.roomCUnchangedNodesMm).map(([id, value]) => [id, p(value)]));
const O = Object.fromEntries(Object.entries(frozen.geometry.roomCUnchangedObjectNodesMm).map(([id, value]) => [id, p(value)]));
const B = Object.fromEntries(Object.entries(frozen.geometry.roomBWCUnchangedMm).map(([id, value]) => [id, p(value)]));
const D2 = frozen.geometry.d2LayersFinalReviewMm;

const reviewBand = (absolutePercent) => {
  if (absolutePercent == null) return "Not rated";
  if (absolutePercent <= 0.5) return "Excellent";
  if (absolutePercent <= 1.0) return "Good / likely acceptable";
  if (absolutePercent <= 1.5) return "Review";
  return "Investigate";
};

const rows = [];
function addScalar({ id, from, target, evidenceType, measuredMm, modelMm, area, method, notes, source, usedInFit = false, scorecardEligible = false, status }) {
  const residualMm = modelMm - measuredMm;
  const residualPercent = residualMm / measuredMm * 100;
  rows.push({
    id, from, target, evidenceType, measuredMm: round(measuredMm), modelV13Mm: round(modelMm),
    residualMm: round(residualMm), absoluteResidualMm: round(Math.abs(residualMm)), residualPercent: round(residualPercent),
    direction: residualMm > 0 ? "model longer" : residualMm < 0 ? "model shorter" : "exact",
    status: status || reviewBand(Math.abs(residualPercent)), area, method, notes, source, usedInFit, scorecardEligible,
  });
}

function addRange({ id, from, target, evidenceType, measuredRangeMm, modelMm, area, method, notes, source, usedInFit = false, scorecardEligible = false, status }) {
  const [lower, upper] = measuredRangeMm;
  const residualToLowerMm = modelMm - lower;
  const residualToUpperMm = modelMm - upper;
  const insideRange = modelMm >= lower && modelMm <= upper;
  const distanceToRangeMm = insideRange ? 0 : Math.min(Math.abs(residualToLowerMm), Math.abs(residualToUpperMm));
  const residualPercentRange = [residualToUpperMm / upper * 100, residualToLowerMm / lower * 100].sort((a, b) => a - b);
  const worstAbsolutePercent = Math.max(...residualPercentRange.map(Math.abs));
  rows.push({
    id, from, target, evidenceType, measuredRangeMm, modelV13Mm: round(modelMm),
    residualToLowerMm: round(residualToLowerMm), residualToUpperMm: round(residualToUpperMm),
    residualPercentRange: residualPercentRange.map((value) => round(value)), insideObservedRange: insideRange,
    distanceToObservedRangeMm: round(distanceToRangeMm), worstAbsolutePercent: round(worstAbsolutePercent),
    direction: insideRange ? "inside range" : modelMm > upper ? "model longer" : "model shorter",
    status: status || `${reviewBand(worstAbsolutePercent)} — ${insideRange ? "inside range" : "outside range"}`, area, method, notes, source, usedInFit, scorecardEligible,
  });
}

function addNonComparable({ id, from, target, evidenceType, measuredMm, measuredRangeMm, modelRangeMm, area, status, notes, source, usedInFit = false }) {
  rows.push({ id, from, target, evidenceType, measuredMm, measuredRangeMm, modelRangeMm, status, area, notes, source, usedInFit, scorecardEligible: false });
}

// Whole-flat checks already recorded in the frozen candidate.
addScalar({
  id: "GLOBAL-AC-9019", from: "Room C C0–CP1-FL wall face", target: "Room A A5–A6 far wall through D2",
  evidenceType: "independent validation", measuredMm: frozen.validations.A_D2_C_9019.measuredMm,
  modelMm: frozen.validations.A_D2_C_9019.v13ModelMm, area: "A↔C registration", scorecardEligible: true,
  method: frozen.validations.A_D2_C_9019.definition,
  notes: "Independent, non-fitted span. The v1.1 rigid Room A rotation changed this model distance by only +0.50 mm.", source: sources.frozen,
});
addScalar({
  id: "GLOBAL-CB-3726", from: "Room C PO2–PO3 outer partition face", target: "Room B B3–B4 finished tile face through D3",
  evidenceType: "independent validation", measuredMm: frozen.validations.C_partition_D3_B_3726.measuredMm,
  modelMm: frozen.validations.C_partition_D3_B_3726.v13ModelMm, area: "C↔B registration", scorecardEligible: true,
  method: frozen.validations.C_partition_D3_B_3726.definition,
  notes: "Conditional D3-normal interpretation; the physical ray bearing and endpoint stations were not permanently marked.", source: sources.frozen,
});

// Current human field ranges. The previously quoted model values align with the accepted rendered object edges,
// not with similarly named inherited shell-reference nodes. Both are retained below as explicit alternatives.
const d4ObjectLeft = O["D4-OUTER-L"];
const d4InheritedCL = C["D4-CL"];
const d4A5Object = distance(d4ObjectLeft, A.A5);
const d4A5Literal = distance(d4InheritedCL, A.A5);
const d4Cp2BodyFront = distance(d4ObjectLeft, O["CP2-BODY-FR"]);
const d4Cp2LiteralFront = distance(d4InheritedCL, C["CP2-FR"]);
const d4Cp2BodyRear = distance(d4ObjectLeft, O["CP2-BODY-BR"]);

addRange({
  id: "FIELD-D4CL-A5-2026-08", from: "D4-CL semantic target (v1.3 D4-OUTER-L object edge)", target: "A5",
  evidenceType: "later field recheck", measuredRangeMm: [7212, 7236], modelMm: d4A5Object,
  area: "A↔C registration", scorecardEligible: true,
  method: "Euclidean distance from accepted D4 outer-left casing/object edge to frozen A5.",
  notes: `The literal inherited D4-CL node gives ${round(d4A5Literal)} mm and lies inside the field range; the accepted object edge gives the prior approximately 7209 mm interpretation. This 18.33 mm node-layer split is documented, not resolved here.`,
  source: "Current human validation brief (2026-08-13)",
});
addRange({
  id: "FIELD-D4CL-CP2FR-2026-08", from: "D4-CL semantic target (v1.3 D4-OUTER-L object edge)", target: "CP2 body front-right proxy (CP2-BODY-FR)",
  evidenceType: "later field recheck", measuredRangeMm: [3800, 3814], modelMm: d4Cp2BodyFront,
  area: "CP1/CP2", scorecardEligible: true,
  method: "Euclidean distance between accepted rendered object-layer endpoints.",
  notes: `This pairing reproduces the prior approximately 3860 mm estimate. Literal inherited D4-CL→CP2-FR is ${round(d4Cp2LiteralFront)} mm. R5 CP2-FR is an outer-footprint reference, while the rendered body edge is separate; field endpoint layer needs confirmation.`,
  source: "Current human validation brief (2026-08-13)",
});
addRange({
  id: "FIELD-D4CL-CP2CR-2026-08", from: "D4-CL semantic target (v1.3 D4-OUTER-L object edge)", target: "CP2 rear-right proxy (CP2-BODY-BR)",
  evidenceType: "later field recheck", measuredRangeMm: [4310, 4330], modelMm: d4Cp2BodyRear,
  area: "CP1/CP2", scorecardEligible: false, status: "Investigate — outside range (proxy endpoint)",
  method: "Euclidean distance to CP2-BODY-BR, the only explicit frozen rear-right CP2 point.",
  notes: "CP2-CR is defined in the R5 register but is not instantiated in v1.3. CP2-BODY-BR is a body-layer proxy, not an asserted casing/footprint coincidence; excluded from scorecard statistics.",
  source: "Current human validation brief (2026-08-13)",
});

// Room A supplementary and repeat measurements. Every scalar is recalculated from final v1.3 coordinates.
const roomASupplemental = [
  ["SUP-001", "A2", "A0", 1338], ["SUP-002", "A2", "D2-AR", 2696], ["SUP-003", "A2", "A7", 4215],
  ["SUP-004", "A2", "D1-AR", 4287], ["SUP-005", "A2", "A6", 5155], ["SUP-006", "A2", "W1-AL", 3430],
  ["SUP-025", "A3", "A5", 1318], ["SUP-026", "A3", "W1-AL", 1721], ["SUP-027", "A3", "A6", 4206],
  ["SUP-028", "A3", "D1-AL", 4082], ["SUP-029", "A3", "D1-AR", 4029], ["SUP-030", "A3", "A7", 5157],
  ["SUP-031", "A3", "D2-AR", 4017, "approximate marked endpoint"], ["SUP-032", "A4", "W1-AL", 1900],
  ["SUP-033", "A4", "A6", 4458], ["SUP-034", "A4", "D1-AL", 4342], ["SUP-035", "A0", "A2", 1333],
  ["SUP-036", "A0", "W1-AL", 4760], ["SUP-037", "A0", "A6", 6251], ["SUP-038", "A0", "D1-AR", 5133],
  ["SUP-039", "A1", "D2-AR", 2945], ["SUP-040", "A1", "A7", 4485], ["SUP-041", "A5", "D1-AL", 4298],
  ["SUP-042", "A5", "A7", 6225], ["SUP-043", "A5", "D2-AR", 5237], ["SUP-044", "W1-AR", "D1-AL", 1514],
  ["SUP-045", "W1-AR", "A7", 4760, "approximate area represented by A7"],
  ["SUP-046", "A6", "D2-AR", 4838, "approximate area represented by D2-AR"],
];
const roomARepeats = [
  ["SUP-038-R1", "A0", "D1-AR", 5137], ["SUP-046-R1", "A6", "D2-AR", 4837, "approximate area represented by D2-AR"],
  ["SUP-032-R1", "A4", "W1-AL", 1901], ["SUP-039-R1", "A1", "D2-AR", 2947],
  ["SUP-044-R1", "W1-AR", "D1-AL", 1517], ["SUP-025-R1", "A3", "A5", 1318],
  ["SUP-001-R1", "A2", "A0", 1338], ["SUP-028-R1", "A3", "D1-AL", 4077, "difficult repeat"],
  ["SUP-003-R1", "A2", "A7", 4220],
];
for (const [id, from, target, measuredMm, caution] of roomASupplemental) addScalar({
  id, from, target, evidenceType: "active measured constraint", measuredMm, modelMm: distance(A[from], A[target]), area: "Room A", usedInFit: true,
  method: "Euclidean v1.3 node-to-node distance.", notes: `Supplementary Room A observation used in S3 fit; not statistically independent.${caution ? ` ${caution}.` : ""}`,
  source: sources.roomAEvidence,
});
for (const [id, from, target, measuredMm, caution] of roomARepeats) addScalar({
  id, from, target, evidenceType: "later field recheck", measuredMm, modelMm: distance(A[from], A[target]), area: "Room A", usedInFit: true,
  method: "Euclidean v1.3 node-to-node distance.", notes: `3 August 2026 repeat used in S3 fit; not statistically independent.${caution ? ` ${caution}.` : ""}`,
  source: sources.roomAEvidence,
});
for (const check of roomA.selectedGeometry.intervalChecks) addNonComparable({
  id: check.id, from: check.id === "SUP-061" ? "W1-AR–A6 wall area" : check.id === "SUP-062" ? "W1-AL" : check.id === "SUP-063" ? "A1" : "D1-AL",
  target: check.id === "SUP-061" ? "A7–D2-AL wall area" : check.id === "SUP-062" ? "D2-AR–A0 wall area" : check.id === "SUP-063" ? "D1-AR–A7 wall area" : "A5–A6 wall area",
  evidenceType: "ambiguous/insufficiently documented", measuredMm: check.measuredMm, modelRangeMm: check.admissibleRangeMm,
  area: "Room A", status: check.compatible ? "Compatible interval; not rated" : "Outside interval; review",
  notes: "Landing point is an area, not a marked node. The model range is the admissible point/segment distance interval; no midpoint or invented landing is used.", source: sources.roomAEvidence,
});

// Room C validation-only observations and object checks.
for (const observation of roomC.validationOnlyObservations) {
  let modelMm;
  let method;
  if (observation.id === "VALID-RC-01") {
    modelMm = pointToLineDistance(O["D4-OUTER-L"], C.PI1, C["CP2-FL"]);
    method = "Perpendicular separation of D4-OUTER-L–D3-OUTER-R and PI1–CP2-FL parallel faces.";
  } else if (observation.id === "VALID-RC-02") {
    modelMm = distance(C.PO3, C.C0);
    method = "Euclidean distance PO3→C0.";
  } else {
    modelMm = pointToLineDistance(C["W2-CR"], O["CP1-BODY-BL"], O["CP1-BODY-BR"]);
    method = "Perpendicular separation of the W2 face and CP1 body-back face.";
  }
  addScalar({
    id: observation.id, from: observation.targetedSurfaces.from, target: observation.targetedSurfaces.to,
    evidenceType: "independent validation", measuredMm: observation.physicalMeasuredMm, modelMm,
    area: observation.id === "VALID-RC-03" ? "CP1/CP2" : "Room C", scorecardEligible: true, method,
    notes: observation.interpretationCaution || observation.assessment, source: sources.roomC,
  });
}
for (const observation of roomC.measurementFitSummary.approximateCrossChecks) addScalar({
  id: observation.id, from: observation.from, target: observation.to, evidenceType: "active measured constraint",
  measuredMm: observation.measuredMm, modelMm: distance(C[observation.from], C[observation.to]), area: "Room C", usedInFit: true,
  method: "Euclidean v1.3 node-to-node distance.", notes: "Low-weight approximate cross-check used in the accepted Room C fit; not independent.", source: sources.roomC,
});
const rc19 = roomC.measurementFitSummary.correctedRC19;
addScalar({
  id: rc19.id, from: rc19.from, target: rc19.to, evidenceType: "independent validation", measuredMm: rc19.measuredMm,
  modelMm: distance(C[rc19.from], C[rc19.to]), area: "CP1/CP2", scorecardEligible: true,
  method: "Euclidean v1.3 node-to-node distance.", notes: "Corrected CP2-FR endpoint; retained outside the accepted shell fit. Earlier CP2-FL endpoint is superseded.", source: sources.roomC,
});
for (const id of ["RC-18", "RC-22"]) {
  const observation = roomC.shell.activeObservationResiduals.find((item) => item.id === id);
  addScalar({
    id, from: observation.from, target: observation.to, evidenceType: "active measured constraint", measuredMm: observation.measuredMm,
    modelMm: distance(C[observation.from], C[observation.to]), area: "CP1/CP2", usedInFit: true,
    method: "Euclidean v1.3 node-to-node distance.", notes: "Direct CP2 relationship used in the accepted Room C fit; not independent validation.", source: sources.roomC,
  });
}
addScalar({
  id: "CP2-BODY-WIDTH", from: "CP2-BODY-FL", target: "CP2-BODY-FR", evidenceType: "active measured constraint", measuredMm: roomC.objectEvidence.CP2.body.widthMm.value,
  modelMm: distance(O["CP2-BODY-FL"], O["CP2-BODY-FR"]), area: "CP1/CP2", usedInFit: true,
  method: "Euclidean object-node distance.", notes: "Direct body width; distinct from casing/outer-footprint span.", source: sources.roomC,
});
addScalar({
  id: "CP2-BODY-DEPTH", from: "CP2-BODY-FL", target: "CP2-BODY-BL", evidenceType: "active measured constraint", measuredMm: roomC.objectEvidence.CP2.body.depthMm.value,
  modelMm: distance(O["CP2-BODY-FL"], O["CP2-BODY-BL"]), area: "CP1/CP2", usedInFit: true,
  method: "Euclidean object-node distance.", notes: "Direct body depth; the body follows the accepted slightly tapered Room C wall direction.", source: sources.roomC,
});
addScalar({
  id: "CP2-LEFT-CASING", from: "CP2-CASING-FL", target: "CP2-BODY-FL", evidenceType: "active measured constraint", measuredMm: roomC.objectEvidence.CP2.casing.viewerLeftVerticalMm.value,
  modelMm: distance(O["CP2-CASING-FL"], O["CP2-BODY-FL"]), area: "CP1/CP2", usedInFit: true,
  method: "Euclidean object-node distance.", notes: "Approximate casing observation; no right casing/gap dimension is invented.", source: sources.roomC,
});
for (const check of roomC.objectPlacementChecks) {
  if (check.id === "OBJ-CHECK-CP2-FOOTPRINT-BALANCE") {
    addScalar({ id: check.id, from: "CP2-FL/FR inherited footprint span", target: "708 body + approximately 20 left casing", evidenceType: "ambiguous/insufficiently documented",
      measuredMm: check.measuredMm, modelMm: check.solvedMm, area: "CP1/CP2", method: "Repository mixed direct/approximate balance check.",
      notes: "27 mm remains unallocated; no explicit right casing, gap or CP2-CR coordinate exists in v1.3.", source: sources.roomC });
  } else if (check.id === "OBJ-CHECK-CP1-RC04") {
    addScalar({ id: check.id, from: "CP1-BODY-FR", target: "PO1", evidenceType: "independent validation", measuredMm: check.measuredMm,
      modelMm: distance(O["CP1-BODY-FR"], C.PO1), area: "CP1/CP2", scorecardEligible: true, method: "Euclidean object-node to shell-node distance.",
      notes: "Known retained conflict created when the direct 1285 mm CP1 body width replaced the former provisional object station; shell unchanged.", source: sources.roomC });
  } else {
    addScalar({ id: check.id, from: "D3-OUTER-R", target: "D4-OUTER-L", evidenceType: "independent validation", measuredMm: check.measuredMm,
      modelMm: distance(O["D3-OUTER-R"], O["D4-OUTER-L"]), area: "Room C", scorecardEligible: true, method: "Euclidean accepted object-edge distance.",
      notes: check.treatment, source: sources.roomC });
  }
}

// Room B: include every supplementary/recheck observation retained in v0.2, recalculated on frozen v1.3.
const roomBIncludedIds = new Set(["FIELD-B-D3-RETURN-2026-08", "FIELD-B-B2-B3-2026-08", "FIELD-B-B0-B4-2026-08", "SUP-065", "SUP-066", "SUP-067", "SUP-068", "SUP-069", "SUP-070", "SUP-071", "FIELD-B-B1-B3-2026-08", "FIELD-B-B05-BACK-PERP-2026-08", "SUP-080"]);
for (const observation of roomB.observations.active.filter((item) => roomBIncludedIds.has(item.id))) {
  const [fromRaw, targetRaw] = observation.label.split(" -> ");
  const from = fromRaw.includes("/") ? fromRaw.split("/")[0].trim() : fromRaw.trim();
  const target = targetRaw.includes("perpendicular") ? "B3-B4 line" : targetRaw.trim();
  let modelMm;
  let method;
  if (observation.id === "FIELD-B-B05-BACK-PERP-2026-08") {
    modelMm = pointToLineDistance(B["B0.5"], B.B3, B.B4);
    method = "Perpendicular point-to-line distance from B0.5 to B3–B4.";
  } else if (observation.id === "SUP-080") {
    modelMm = pointToLineDistance(B["D3-BR"], B.B3, B.B4);
    method = "Perpendicular point-to-line distance from D3-BR to B3–B4.";
  } else {
    const ids = {
      "FIELD-B-D3-RETURN-2026-08": ["D3-BR", "B0.5"], "FIELD-B-B2-B3-2026-08": ["B2", "B3"],
      "FIELD-B-B0-B4-2026-08": ["B0", "B4"], "SUP-065": ["B0", "B0.5"], "SUP-066": ["B0", "B2"],
      "SUP-067": ["B0", "B3"], "SUP-068": ["B0.5", "B2"], "SUP-069": ["B0.5", "B3"],
      "SUP-070": ["B1", "B4"], "SUP-071": ["B2", "B4"], "FIELD-B-B1-B3-2026-08": ["B1", "B3"],
    }[observation.id];
    modelMm = distance(B[ids[0]], B[ids[1]]);
    method = "Euclidean v1.3 node-to-node distance.";
  }
  const evidenceType = observation.id.startsWith("FIELD-") ? "later field recheck" : "active measured constraint";
  const common = { id: observation.id, from, target, evidenceType, modelMm, area: "Room B", usedInFit: true, method,
    notes: `${observation.quality}; retained in the v0.2 Room B fit, so it is not statistically independent.`, source: sources.roomB };
  if (observation.range) addRange({ ...common, measuredRangeMm: observation.range });
  else addScalar({ ...common, measuredMm: observation.measured });
}

// WC retained measurements after the human rectangular working constraint, recalculated from frozen v1.3.
for (const observation of roomBRectWC.diagnostics.observations.after) {
  const modelMm = distance(B[observation.from], B[observation.to]);
  addScalar({
    id: observation.id, from: observation.from, target: observation.to,
    evidenceType: observation.id.startsWith("SUP-") ? "active measured constraint" : "active measured constraint",
    measuredMm: observation.measuredMm, modelMm, area: "WC", usedInFit: true,
    method: "Euclidean v1.3 node-to-node distance.",
    notes: `${observation.note}; retained in the v0.3 human-rectangular reconciliation and not statistically independent.`, source: sources.roomBRectWC,
  });
}
const sup081Start = midpoint(B.T1, B.T2);
addScalar({
  id: "SUP-081", from: "Assumed midpoint of T1–T2", target: "Perpendicular landing on B0–B4",
  evidenceType: "supplementary/redundant check", measuredMm: 3492,
  modelMm: pointToLineDistance(sup081Start, B.B0, B.B4), area: "WC", usedInFit: true,
  method: "Midpoint of frozen T1–T2 to the frozen B0–B4 line, measured perpendicularly.",
  notes: "Low-weight broad wall-to-wall validation inherited from the earlier P1 fit. Neither physical endpoint was marked; excluded from independent statistics.",
  source: sources.roomBPilot,
});

// Useful correction history. These rows are provenance only and never enter statistics.
for (const item of [
  { id: "SUP-032-OLD", from: "A4", target: "W1-AL", measuredMm: 900, notes: "Transcription corrected to active SUP-032 = 1900 mm." , source: sources.roomAEvidence },
  { id: "BASE-B-02", from: "D3-BR", target: "B0.5", measuredMm: 249, notes: "Same-span field recheck gives 136 mm; no 113 mm layer offset is evidenced.", source: sources.roomB },
  { id: "BASE-B-07-OLD", from: "B4", target: "B0 / D3-BL", measuredRangeMm: [2010, 2030], notes: "Superseded first by approximately 2200–2220 mm and then refined by the active 2216 mm field recheck.", source: sources.roomBEvidence },
  { id: "SUP-071-OLD", from: "B1 / D5-BR", target: "B4", measuredMm: 2014, notes: "Both start label and reading corrected; active SUP-071 is B2 / D5-BR→B4 = 2046 mm.", source: sources.roomBEvidence },
  { id: "BASE-WC-03-OLD", from: "T2", target: "T3", measuredMm: 690, notes: "Incorrect raw reading; active field recheck is 1685 mm.", source: sources.roomWCEvidence },
  { id: "BASE-WC-04-OLD", from: "T3", target: "D5-WCL", measuredMm: 171, notes: "Superseded by clarified active 173 mm endpoint reading.", source: sources.roomWCEvidence },
  { id: "RC-19-OLD-ENDPOINT", from: "CP2-FL", target: "PI3", measuredMm: 2206, notes: "Field value retained but endpoint corrected to CP2-FR; old definition produced approximately +111 mm conflict.", source: sources.roomC },
]) addNonComparable({ ...item, evidenceType: "superseded/inactive observation", area: item.id.startsWith("SUP-032") ? "Room A" : item.id.startsWith("BASE-WC") ? "WC" : item.id.startsWith("RC-") ? "CP1/CP2" : "Room B", status: "Superseded / excluded" });

const angleEvidence = roomA.evidence.angles.map((observation) => ({
  id: observation.id, node: observation.node, previous: observation.previous, next: observation.next,
  evidenceType: "active measured constraint", measuredDegrees: observation.measuredDegrees,
  modelV13Degrees: round(interiorAngle(A[observation.previous], A[observation.node], A[observation.next]), 6),
  residualDegrees: round(interiorAngle(A[observation.previous], A[observation.node], A[observation.next]) - observation.measuredDegrees, 6),
  usedInFit: true, note: "Practical angle reading used softly in Room A S3; the later whole-room rigid rotation preserves this angle.",
}));

const humanArchitecturalConstraints = [
  { id: "ARCH-A-ORIENTATION", description: "Rigidly rotate Room A -0.854961637° about the D2 anchor so A7–A6 is parallel to the frozen Room C/WC horizontal family.", evidenceType: "human architectural constraint", measuredObservation: false, note: "Not counted as a field observation. Pairwise Room A geometry is unchanged." },
  { id: "ARCH-WC-RECTANGLE", description: "Represent the WC as an exact rectangle despite active opposing widths 1643 and 1685 mm.", evidenceType: "human architectural constraint", measuredObservation: false, note: "The 42 mm conflict remains visible in active evidence residuals." },
  { id: "ARCH-C-TOPOLOGY", description: "Retain accepted Room C parallel wall families, D3-CL turning corner and D2-CR 580 mm station.", evidenceType: "human architectural constraint", measuredObservation: false, note: "No topology or geometry change is made by this audit." },
];

const scalarActive = rows.filter((row) => row.modelV13Mm != null && row.measuredMm != null && row.evidenceType !== "superseded/inactive observation");
const roomAFitRows = scalarActive.filter((row) => row.area === "Room A" && row.usedInFit);
const roomARepeatRows = roomAFitRows.filter((row) => row.evidenceType === "later field recheck");
const roomBRechecks = scalarActive.filter((row) => row.area === "Room B" && row.evidenceType === "later field recheck");
const median = (values) => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
};
const absoluteForScore = (row) => row.distanceToObservedRangeMm ?? row.absoluteResidualMm;
const percentForScore = (row) => row.worstAbsolutePercent ?? Math.abs(row.residualPercent);
const scoreAreas = ["Room A", "Room C", "Room B", "WC", "A↔C registration", "C↔B registration", "CP1/CP2"];
const scorecard = scoreAreas.map((area) => {
  const independent = rows.filter((row) => row.area === area && row.scorecardEligible);
  const supplementaryCount = rows.filter((row) => row.area === area && row.usedInFit && row.evidenceType !== "superseded/inactive observation").length;
  const assessments = {
    "Room A": "Internal shape is strongly consistent with 37 fitted SUP/repeat distances; they cannot independently validate the later rigid global rotation.",
    "Room C": "Independent shell/face checks are excellent-to-good; no Room C-wide scale pattern.",
    "Room B": "Five active field rechecks fit closely; they were inputs to v0.2, so independent count remains zero.",
    "WC": "Known 42 mm opposing-width conflict remains under the human rectangular constraint; no new inconsistency.",
    "A↔C registration": "Both long checks are good: 9019 span is 0.68% short and D4→A5 is within 3 mm of the range on the accepted object layer.",
    "C↔B registration": "Single D3-normal check is in Review at 1.11%; exact physical ray bearing remains uncertain.",
    "CP1/CP2": "Local object-layer concerns remain: known CP1 RC-04 conflict and coherent D4→CP2 model-long rays.",
  };
  return {
    area, activeIndependentChecks: independent.length, activeFitOrRecheckCountExcludedFromIndependent: supplementaryCount,
    medianAbsoluteResidualMm: round(median(independent.map(absoluteForScore))),
    worstPercentResidual: independent.length ? round(Math.max(...independent.map(percentForScore))) : null,
    systematicConcern: area === "CP1/CP2" ? "Yes — object endpoint/layer issue" : area === "WC" ? "Known 42 mm width conflict" : area === "C↔B registration" ? "Single conditional ray only" : "No",
    assessment: assessments[area],
  };
});

const cp2Front = rows.find((row) => row.id === "FIELD-D4CL-CP2FR-2026-08");
const cp2Rear = rows.find((row) => row.id === "FIELD-D4CL-CP2CR-2026-08");
const cp2Existing = rows.filter((row) => /CP2/.test(`${row.id} ${row.from} ${row.target}`));
const outliers = [
  {
    rank: 1, feature: "CP1 body-right placement relative to PO1", observations: ["OBJ-CHECK-CP1-RC04"],
    finding: "Model is 265.70 mm versus 225 mm, +40.70 mm (+18.09%).",
    likelyCause: "Known object-layer conflict introduced when the direct 1285 mm CP1 body width replaced the provisional CP1-FR station; body edge versus inherited casing/shell reference is the leading explanation.",
    confidence: "High that the documented conflict exists; medium on physical cause.",
    smallestUsefulAction: "First confirm the original RC-04 contact surfaces from notes/photo. Only if still unclear, recheck CP1 body-right to PO1 once; no shell survey programme.",
  },
  {
    rank: 2, feature: "CP2 position/layer relative to D4", observations: ["FIELD-D4CL-CP2FR-2026-08", "FIELD-D4CL-CP2CR-2026-08"],
    finding: `Body-layer models are long by ${round(Math.min(Math.abs(cp2Front.residualToLowerMm), Math.abs(cp2Front.residualToUpperMm)))}–${round(Math.max(Math.abs(cp2Front.residualToLowerMm), Math.abs(cp2Front.residualToUpperMm)))} mm at the front and ${round(Math.min(Math.abs(cp2Rear.residualToLowerMm), Math.abs(cp2Rear.residualToUpperMm)))}–${round(Math.max(Math.abs(cp2Rear.residualToLowerMm), Math.abs(cp2Rear.residualToUpperMm)))} mm at the rear.`,
    likelyCause: "A coherent local endpoint/layer mismatch is more likely than independent noise. CP2 width and depth match direct dimensions, and corrected RC-19 is only -4 mm, so depth/width error is not supported. If the field contacts are confirmed as body corners, the paired rays instead resemble a roughly 50–60 mm CP2/D4 relative translation.",
    confidence: "Medium; CP2-CR is absent from frozen v1.3 and the front name also spans footprint/body layers.",
    smallestUsefulAction: "No new distance initially: annotate/confirm whether both shots touched D4-OUTER-L and CP2 body front/back right. If confirmed and a numeric recheck is still required, repeat only the easier front-right shot.",
  },
  {
    rank: 3, feature: "Room B B0→B0.5 diagonal", observations: ["SUP-065"],
    finding: "Model is 862.91 mm versus 888 mm, -25.09 mm (-2.83%).",
    likelyCause: "Isolated older casing/corner endpoint or layer discrepancy; the five later Room B rechecks do not show a matching shell displacement.",
    confidence: "Medium that it is an isolated evidence-layer issue; low that it indicates shell failure.",
    smallestUsefulAction: "None before 2D sign-off unless this short diagonal is construction-critical.",
  },
  {
    rank: 4, feature: "WC opposing widths under rectangular constraint", observations: ["BASE-WC-01", "BASE-WC-03", "SUP-072"],
    finding: "The active 1643/1685 mm widths differ by 42 mm; the frozen 1662.69 mm rectangle splits that conflict and the diagonal SUP-072 is +20.83 mm (+1.06%).",
    likelyCause: "Known field-face/room non-ideal conflict intentionally overridden by the human architectural rectangle.",
    confidence: "High; explicitly preserved in v0.3.",
    smallestUsefulAction: "None for pre-final 2D validation; revisit only at construction-detail stage if exact WC finishes matter.",
  },
];

const patterns = {
  broadScale: "Not indicated. Room A internal SUP distances, Room C independent closures and Room B rechecks do not share a common percentage bias; all transforms are rigid and scale 1.",
  byRoom: {
    roomA: `All ${roomAFitRows.length} scalar SUP/repeat inputs remain within ${round(Math.max(...roomAFitRows.map((row) => Math.abs(row.residualPercent))))}% of their readings; this validates internal shape but is not independent of the Room A fit.`,
    roomC: "VALID-RC-01/02 and the D3–D4 object-edge check are good or excellent; no shell-wide Room C displacement pattern.",
    roomB: `The five active rechecks have median absolute residual ${round(median(roomBRechecks.map((row) => row.absoluteResidualMm)))} mm and worst ${round(Math.max(...roomBRechecks.map((row) => Math.abs(row.residualPercent))))}%; SUP-065 is the isolated older outlier.`,
    wc: "Residuals are symmetric around the imposed 1662.69 mm width because the two measured widths conflict by 42 mm; this is known, not a newly detected transform error.",
  },
  byDoorway: {
    D2: "The 9019 mm A/C span is good (0.68% short). The rigid Room A rotation barely changed it, so it supports placement tolerance but does not uniquely validate rotation.",
    D3: "The 3726 mm span is 1.11% short under the D3-normal assumption. Face layers are named correctly; unrecorded ray bearing remains the principal ambiguity.",
    D4: "D4→A5 is compatible, while both D4→CP2 rays are long. That split implicates CP2 endpoint/layer interpretation rather than a general D4 station error.",
    D5: "Room B/WC casing and cross-tie evidence has no new outlier beyond the known rectangular-WC compromise.",
  },
  cp2Diagnosis: {
    observationsReviewed: cp2Existing.map((row) => row.id),
    translatedAsWhole: "Conditionally plausible from the two D4 rays alone: their midpoint discrepancies are similar. It is not supported unconditionally because RC-19 fixes CP2-FR→PI3 to -4 mm.",
    depthIncorrect: "Not supported. Direct 536 mm body depth is reproduced, and the front/rear D4 excesses are similar rather than divergent.",
    widthIncorrect: "Not supported. Direct 708 mm body width is reproduced exactly; the separate inherited 755 mm footprint still has 27 mm unallocated casing/gap detail.",
    d4InterpretationMismatch: "Plausible. Frozen v1.3 has inherited D4-CL at x=3048.67 and accepted D4-OUTER-L at x=3067.00, an 18.33 mm layer/station split.",
    casingFootprintMismatch: "Most strongly supported documentation issue. CP2-FR exists both as an inherited outer reference and a separate body-front-right point; CP2-CR is not instantiated at all.",
    conclusion: "The evidence does not justify moving CP2. Confirm endpoint layers first. If body endpoints are confirmed, retain a medium-confidence local CP2/D4 relative-position concern for later review.",
  },
};

const sourceIntegrity = Object.fromEntries(Object.entries(sources).map(([key, relativePath]) => [key, { path: relativePath, sha256: hashText(read(relativePath)) }]));
const result = {
  documentType: "existing-validation-audit",
  version: "v0.1",
  generatedDate: "2026-08-13",
  units: "millimetres unless stated otherwise",
  status: "VALIDATION REVIEW REQUIRED",
  scope: "Read-only validation analysis of frozen WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3; no geometry generation or solve.",
  frozenCandidate: {
    source: sources.frozen, designation: frozen.freeze.designation, sourceSha256: hashText(frozenText),
    geometrySha256: hashText(JSON.stringify(frozen.geometry)),
    preserved: { roomA: true, roomB: true, wc: true, roomC: true, cupboards: true, D1toD5: true, D2Registration: true, D3Registration: true },
    solverRun: false, geometryVersionCreated: false,
  },
  residualConvention: "model v1.3 minus active measurement; positive means model longer, negative means model shorter",
  reviewBandsPercent: { excellentMaximum: 0.5, goodMaximum: 1.0, reviewMaximum: 1.5, investigateAbove: 1.5 },
  sourceIntegrity,
  evidenceClassificationPolicy: {
    categories: ["active measured constraint", "independent validation", "supplementary/redundant check", "later field recheck", "superseded/inactive observation", "human architectural constraint", "ambiguous/insufficiently documented"],
    statistics: "Only rows marked scorecardEligible enter active independent scorecard statistics. Fit inputs and superseded rows are excluded.",
  },
  masterValidationTable: rows,
  angleEvidence,
  humanArchitecturalConstraints,
  scorecard,
  systematicPatternAnalysis: patterns,
  outlierShortlist: outliers,
  overallValidationAssessment: {
    classification: "validated with minor local issues",
    shellAssessment: "The frozen whole-flat shell is strongly supported overall. No broad scale, solve or registration failure is indicated.",
    stronglySupportedAreas: ["Room A internal shape", "Room C shell closures and wall-family separations", "corrected orthogonal Room B", "A↔C placement within the existing field tolerances", "CP2 body width and depth"],
    remainingSystematicIssues: ["Known CP1 RC-04 object-layer conflict", "CP2/D4 endpoint-layer ambiguity with coherent model-long rays", "known WC opposing-width conflict under the human rectangle", "single conditional C↔B D3-normal residual"],
    requiredBeforeFinal2DSignOff: ["Human review of CP1 RC-04 conflict and CP2 endpoint-layer mapping.", "No broad new survey programme. Confirm existing CP2/D4 contact-point labels first; only one front-right repeat if that review cannot resolve the ambiguity.", "No geometry change is recommended by this audit."],
    readyForFinal2DPromotion: false,
    gate: "VALIDATION REVIEW REQUIRED",
  },
};

const signed = (value, digits = 2) => value == null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
const fixed = (value, digits = 2) => value == null ? "—" : Number(value).toFixed(digits);
const rowMeasured = (row) => row.measuredRangeMm ? `${row.measuredRangeMm[0]}–${row.measuredRangeMm[1]}` : row.measuredMm ?? "—";
const rowModel = (row) => row.modelRangeMm ? `${fixed(row.modelRangeMm[0], 1)}–${fixed(row.modelRangeMm[1], 1)} admissible` : fixed(row.modelV13Mm);
const rowResidual = (row) => {
  if (row.residualMm != null) return signed(row.residualMm);
  if (row.residualToLowerMm != null) return `${signed(Math.min(row.residualToLowerMm, row.residualToUpperMm))} to ${signed(Math.max(row.residualToLowerMm, row.residualToUpperMm))}`;
  return "—";
};
const rowPercent = (row) => {
  if (row.residualPercent != null) return `${signed(row.residualPercent)}%`;
  if (row.residualPercentRange) return `${signed(row.residualPercentRange[0])}% to ${signed(row.residualPercentRange[1])}%`;
  return "—";
};
const safe = (text) => String(text ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");

const scoreRows = scorecard.map((item) => `| ${item.area} | ${item.activeIndependentChecks}${item.activeFitOrRecheckCountExcludedFromIndependent ? ` (+${item.activeFitOrRecheckCountExcludedFromIndependent} fit/recheck)` : ""} | ${fixed(item.medianAbsoluteResidualMm)} | ${item.worstPercentResidual == null ? "—" : `${fixed(item.worstPercentResidual)}%`} | ${item.systematicConcern} | ${item.assessment} |`).join("\n");
const tableRows = rows.map((row) => `| ${safe(row.id)} | ${safe(row.from)} | ${safe(row.target)} | ${safe(row.evidenceType)} | ${safe(rowMeasured(row))} | ${safe(rowModel(row))} | ${safe(rowResidual(row))} | ${safe(rowPercent(row))} | ${safe(row.status)} | ${safe(row.notes)} |`).join("\n");
const angleRows = angleEvidence.map((row) => `| ${row.id} | ${row.node} | ${row.measuredDegrees.toFixed(1)}° | ${row.modelV13Degrees.toFixed(3)}° | ${signed(row.residualDegrees, 3)}° | Active soft fit constraint; not independent |`).join("\n");
const outlierRows = outliers.map((item) => `### ${item.rank}. ${item.feature}\n\n- Supporting observations: ${item.observations.map((id) => `\`${id}\``).join(", ")}\n- Finding: ${item.finding}\n- Likely cause: ${item.likelyCause}\n- Confidence: ${item.confidence}\n- Smallest useful action: ${item.smallestUsefulAction}`).join("\n\n");

const report = `# Whole-flat v1.3 existing-validation audit v0.1

**Status: VALIDATION REVIEW REQUIRED.**

This is a read-only evidence audit of \`WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3\`. The v1.3 geometry, room placements, cupboards, D1–D5, D2/D3 registrations and transforms are unchanged. No solver ran and no geometry successor was created.

## Method and evidence boundary

Every sufficiently defined model distance below is recalculated from the frozen v1.3 coordinates. Euclidean node distances, perpendicular point-to-line distances, or line intersections are used as stated. Residual is **model minus measurement**: positive means the model is longer. Ranges are retained as ranges; the report does not promote their midpoint to an observation.

Room A SUP and repeat distances, the Room B v0.2 rechecks, and the WC v0.3 observations were used in their respective local fits/reconciliations. They are useful fit checks but are excluded from the independent scorecard. Superseded values are provenance only. Human architectural constraints are not mislabelled as measurements.

Review bands: **Excellent ≤0.5%; Good >0.5–1.0%; Review >1.0–1.5%; Investigate >1.5%.**

## Whole-flat validation scorecard

| Area | Number of active independent checks | Median absolute residual | Worst % residual | Systematic concern? | Assessment |
|---|---:|---:|---:|---|---|
${scoreRows}

The parenthetical counts are active fit/recheck observations excluded from the independent count. A zero therefore does not mean “no evidence”; it prevents fitted evidence from being presented as independent validation.

## Master validation table

| ID | From | To / target | Evidence type | Measured mm | Model v1.3 mm | Residual mm | Residual % | Status | Notes |
|---|---|---|---|---:|---:|---:|---:|---|---|
${tableRows}

## Room A angular evidence

| ID | Node | Measured | Model v1.3 | Residual | Status |
|---|---|---:|---:|---:|---|
${angleRows}

The 37 scalar SUP/repeat distances and six soft angles support the accepted Room A **internal shape**. They do not independently prove the later \`-0.854962°\` rigid global rotation because rigid rotation preserves all internal distances and angles. The independent 9019 mm A/C span is good at ${fixed(Math.abs(rows.find((row) => row.id === "GLOBAL-AC-9019").residualPercent))}% short, and D4→A5 is within 3 mm of its field range on the accepted D4 object edge. Those checks support the current placement tolerance, but the 9019 span changed only 0.50 mm when Room A rotated and therefore does not uniquely select that rotation.

## Room C validation

The three accepted post-solve checks remain encouraging when recalculated: \`VALID-RC-01\` is ${signed(rows.find((row) => row.id === "VALID-RC-01").residualMm)} mm, \`VALID-RC-02\` is ${signed(rows.find((row) => row.id === "VALID-RC-02").residualMm)} mm, and \`VALID-RC-03\` is ${signed(rows.find((row) => row.id === "VALID-RC-03").residualMm)} mm. The D3/D4 object-edge gap is also excellent at ${signed(rows.find((row) => row.id === "OBJ-CHECK-D3-D4-RC09").residualMm)} mm. This pattern does not indicate a Room C-wide scale error.

The known CP1 \`RC-04\` conflict remains: CP1-BODY-FR→PO1 is 265.70 mm against 225 mm, or +40.70 mm. It is a local object-placement/layer conflict, not a shell closure error.

## Room B validation

The five active field rechecks give:

- D3-BR→B0.5: ${fixed(rows.find((row) => row.id === "FIELD-B-D3-RETURN-2026-08").modelV13Mm)} mm against 136 mm.
- B0 / D3-BL→B4: ${fixed(rows.find((row) => row.id === "FIELD-B-B0-B4-2026-08").modelV13Mm)} mm against 2216 mm.
- B1 / D5-BL→B3: ${fixed(rows.find((row) => row.id === "FIELD-B-B1-B3-2026-08").modelV13Mm)} mm against 2091 mm.
- B0.5 perpendicular to B3–B4: ${fixed(rows.find((row) => row.id === "FIELD-B-B05-BACK-PERP-2026-08").modelV13Mm)} mm against 2080 mm.
- B2 / D5-BR→B3: ${fixed(rows.find((row) => row.id === "FIELD-B-B2-B3-2026-08").modelV13Mm)} mm against 1219 mm.

Their median absolute residual is ${fixed(median(roomBRechecks.map((row) => row.absoluteResidualMm)))} mm and worst percentage residual is ${fixed(Math.max(...roomBRechecks.map((row) => Math.abs(row.residualPercent))))}%. They support the 136 mm return, orthogonal main shell, corrected depth and corrected width. Because they were used in v0.2, this is fit confirmation rather than independent holdout validation. The old 249 mm return remains explicitly superseded and excluded.

The only >1.5% Room B row is older \`SUP-065\` (B0→B0.5), at -25.09 mm / -2.83%. It is isolated; no matching displacement appears in the later rechecks.

## CP2 investigation

The exact frozen evidence does **not** support a CP2 width or depth error: the 708 mm body width and 536 mm body depth are reproduced, \`RC-18\` and \`RC-22\` are exact fit constraints, and corrected holdout \`RC-19\` is only -4.00 mm.

The new D4 rays nevertheless form a coherent local pattern on the rendered body layer:

- front-right model ${fixed(d4Cp2BodyFront)} mm versus 3800–3814 mm: model long by ${fixed(Math.min(Math.abs(cp2Front.residualToLowerMm), Math.abs(cp2Front.residualToUpperMm)))}–${fixed(Math.max(Math.abs(cp2Front.residualToLowerMm), Math.abs(cp2Front.residualToUpperMm)))} mm;
- rear-right proxy ${fixed(d4Cp2BodyRear)} mm versus 4310–4330 mm: model long by ${fixed(Math.min(Math.abs(cp2Rear.residualToLowerMm), Math.abs(cp2Rear.residualToUpperMm)))}–${fixed(Math.max(Math.abs(cp2Rear.residualToLowerMm), Math.abs(cp2Rear.residualToUpperMm)))} mm.

Their similar excess suggests a common local station/layer issue rather than independent noise or wrong cupboard depth. But the evidence is not yet clean enough to call this a CP2 translation: v1.3 contains an inherited \`D4-CL\` and a later \`D4-OUTER-L\` 18.33 mm apart; \`CP2-FR\` and \`CP2-BODY-FR\` are separate; and no explicit \`CP2-CR\` coordinate exists. The prior approximate 3860/4377 values specifically match \`D4-OUTER-L→CP2-BODY-FR/BR\`, not the literal inherited node names.

Conclusion: **casing/footprint endpoint mismatch is the first diagnosis to resolve.** If the field contacts are confirmed as the body corners, the two rays then support a medium-confidence roughly 50–60 mm CP2/D4 relative-position concern. This audit does not move CP2.

## Systematic-pattern assessment

- By room: Room A, Room C and corrected Room B do not show a common scale bias. WC retains its already-known 42 mm opposing-width conflict.
- By doorway: D2 is good; D3 is a single conditional Review-band ray; D4 passes toward A5 but not toward CP2; D5 has no new systematic issue.
- By start node: the common D4 object edge agrees with A5 but both CP2 targets are model-long, focusing attention on CP2 endpoint/layer semantics.
- By direction: only the D4→CP2 diagonal family clusters coherently. The two whole-flat through-door spans are model-short, but at different percentages and with different ray definitions; this is insufficient evidence of global scale error.
- By object: CP1 has one known large local conflict. CP2 has coherent new rays but strong width/depth and RC-19 checks. These are object-layer issues, not evidence for re-solving the shell.

## Outlier shortlist

${outlierRows}

## Human architectural constraints

${humanArchitecturalConstraints.map((item) => `- \`${item.id}\`: ${item.description} ${item.note}`).join("\n")}

## Overall validation assessment

**Validated with minor local issues.** The frozen v1.3 shell is strongly supported overall. No broad whole-flat scale error, registration failure or reason to run a new solve is present.

## Strongly supported areas

- Room A internal shape and measured-angle network.
- Room C shell closures and independent face/closure checks.
- Corrected orthogonal Room B, including the active 136 mm D3 return.
- A↔C placement at the current project review tolerance.
- CP2 body width and depth.

## Remaining systematic issues

1. Known CP1 RC-04 object-layer conflict.
2. CP2/D4 endpoint-layer ambiguity with two coherent model-long field rays.
3. Known WC opposing-width conflict under the human rectangular constraint.
4. Single conditional C↔B D3-normal Review-band residual.

## Required actions before final 2D sign-off

Keep the geometry frozen. Human-review the CP1 RC-04 contact surfaces and the CP2/D4 endpoint mapping. No broad new survey programme is recommended. First confirm the existing photo/field annotations; only if the CP2 contacts cannot be established should the easier D4 outer-left casing→CP2 body front-right distance be repeated once.

No geometry change is recommended by this audit.

**VALIDATION REVIEW REQUIRED**
`;

const xml = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const poly = (points, cls) => `<polygon points="${points.map((q) => `${q[0]},${q[1]}`).join(" ")}" class="${cls}"/>`;
const line = (a, b, cls) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" class="${cls}"/>`;
const label = (point, textValue, cls = "label", dx = 0, dy = 0) => `<text x="${point[0] + dx}" y="${point[1] + dy}" class="${cls}">${xml(textValue)}</text>`;

const d2CFaceCentre = midpoint(p(D2.roomCStructuralOpeningAtRoomCFaceMm[0]), p(D2.roomCStructuralOpeningAtRoomCFaceMm[1]));
const d2AFaceCentre = midpoint(p(D2.roomCStructuralOpeningAtRoomAFaceMm[0]), p(D2.roomCStructuralOpeningAtRoomAFaceMm[1]));
const d2Normal = unit(subtract(d2AFaceCentre, d2CFaceCentre));
const acStart = lineIntersection(d2AFaceCentre, d2Normal, C.C0, subtract(C["CP1-FL"], C.C0));
const acEnd = lineIntersection(d2AFaceCentre, d2Normal, A.A5, subtract(A.A6, A.A5));
const cbStart = p(frozen.validations.C_partition_D3_B_3726.pointsMm.startOnRoomCOuterFace);
const cbEnd = p(frozen.validations.C_partition_D3_B_3726.pointsMm.endOnRoomBFinishedTileFace);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-450 -4700 10600 7900" role="img" aria-labelledby="title desc">
<title id="title">Whole-flat v1.3 existing validation audit v0.1</title>
<desc id="desc">Focused read-only validation overlay on frozen v1.3 geometry. Shows principal independent spans and local CP1/CP2 outliers. Schematic, not to scale for measurement.</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M0 0L10 5L0 10z" fill="#7c2d12"/></marker></defs>
<style>
.bg{fill:#f8fafc}.roomA{fill:#fff7ed;stroke:#c2410c}.roomC{fill:#eff6ff;stroke:#1e3a8a}.roomB{fill:#ecfdf5;stroke:#047857}.wc{fill:#f0fdfa;stroke:#0f766e}.roomA,.roomC,.roomB,.wc{stroke-width:18}.cup{fill:#fef3c7;stroke:#a16207;stroke-width:14}.global{stroke:#2563eb}.conditional{stroke:#7c3aed}.pass{stroke:#059669}.cp2{stroke:#dc2626}.cp1{stroke:#e11d48}.global,.conditional,.pass,.cp2,.cp1{fill:none;stroke-width:24;stroke-dasharray:44 24}.node{fill:#fff;stroke:#111827;stroke-width:8}.title{font:bold 76px Arial;fill:#0f172a}.subtitle{font:42px Arial;fill:#334155}.label{font:bold 42px Arial;fill:#172554}.small{font:34px Arial;fill:#334155}.warn{font:bold 36px Arial;fill:#991b1b}.legend{fill:#fff;stroke:#cbd5e1;stroke-width:8}
</style>
<rect x="-450" y="-4700" width="10600" height="7900" class="bg"/>
${poly([C.C0,C["CP1-FL"],C["CP2-FR"],C["D3-CL"]],"roomC")}
${poly(["A0","A1","A2","A3","A4","A5","A6","A7"].map((id)=>A[id]),"roomA")}
${poly(["B0","D3-BR","B0.5","B1","B2","B3","B4"].map((id)=>B[id]),"roomB")}
${poly(["T0","T1","T2","T3"].map((id)=>B[id]),"wc")}
${poly([O["CP1-BODY-FL"],O["CP1-BODY-FR"],O["CP1-BODY-BR"],O["CP1-BODY-BL"]],"cup")}
${poly([O["CP2-BODY-FL"],O["CP2-BODY-FR"],O["CP2-BODY-BR"],O["CP2-BODY-BL"]],"cup")}
${line(acStart,acEnd,"global")}${line(cbStart,cbEnd,"conditional")}${line(d4ObjectLeft,A.A5,"pass")}
${line(d4ObjectLeft,O["CP2-BODY-FR"],"cp2")}${line(d4ObjectLeft,O["CP2-BODY-BR"],"cp2")}
${line(O["CP1-BODY-FR"],C.PO1,"cp1")}
${[d4ObjectLeft,O["CP2-BODY-FR"],O["CP2-BODY-BR"],O["CP1-BODY-FR"],C.PO1].map((q)=>`<circle cx="${q[0]}" cy="${q[1]}" r="18" class="node"/>`).join("")}
${label([50,-4500],"v1.3 EXISTING VALIDATION AUDIT · GEOMETRY FROZEN","title")}
${label([50,-4415],"Focused rays only · model-minus-measurement · schematic / do not scale drawing","subtitle")}
${label(midpoint(acStart,acEnd),"9019 model 8957.64 · -61.36 mm", "label", 40,-35)}
${label(midpoint(cbStart,cbEnd),"3726 model 3684.59 · -41.41 mm", "label", 40,-35)}
${label(midpoint(d4ObjectLeft,A.A5),"D4→A5 7212–7236 · model 7209.08", "label", 40,-40)}
${label(midpoint(d4ObjectLeft,O["CP2-BODY-FR"]),"CP2 front · +45.83…+59.83", "warn", -900,-45)}
${label(midpoint(d4ObjectLeft,O["CP2-BODY-BR"]),"CP2 rear proxy · +47.20…+67.20", "warn", -1050,70)}
${label(midpoint(O["CP1-BODY-FR"],C.PO1),"CP1 RC-04 +40.70", "warn", 40,-30)}
<rect x="5200" y="2100" width="4450" height="850" rx="35" class="legend"/>
${label([5350,2260],"Assessment: VALIDATED WITH MINOR LOCAL ISSUES","label")}
${label([5350,2370],"Blue A↔C: Good · purple C↔B: Review (conditional ray)","small")}
${label([5350,2470],"Green D4→A5: compatible · red D4→CP2: coherent model-long pattern","small")}
${label([5350,2570],"CP2-CR absent; rear line uses CP2-BODY-BR proxy","small")}
${label([5350,2670],"CP1 RC-04 conflict is known object-layer evidence","small")}
${label([5350,2800],"NO GEOMETRY CHANGE · VALIDATION REVIEW REQUIRED","warn")}
</svg>`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, `${stem}.md`), report);
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), svg);

if (hashText(read(sources.frozen)) !== result.frozenCandidate.sourceSha256) throw new Error("Frozen v1.3 changed while the audit was generated.");

console.log(JSON.stringify({
  outputs: [`${stem}.json`, `${stem}.md`, `${stem}.svg`],
  masterRows: rows.length,
  scorecardIndependentChecks: scorecard.reduce((sum, item) => sum + item.activeIndependentChecks, 0),
  frozenSourceSha256: result.frozenCandidate.sourceSha256,
  frozenGeometrySha256: result.frozenCandidate.geometrySha256,
  solverRun: false,
  geometryChanged: false,
  gate: result.overallValidationAssessment.gate,
}, null, 2));

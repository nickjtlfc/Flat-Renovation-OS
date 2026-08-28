#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "docs/survey/derived/global-reconciliation");
const stem = "WHOLE_FLAT_V1_3_CP2_R5_SEMANTIC_VALIDATION_AUDIT_v0_1";

const sources = {
  frozen: "docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.json",
  acceptedRoomC: "docs/survey/derived/room-c/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json",
  nodeMap: "docs/survey/NODE_REFERENCE_MAP_R5.svg",
  nodeRegister: "docs/survey/NODE_REFERENCE_REGISTER_R5.md",
  objectSchedule: "docs/survey/OBJECT_SCHEDULES_R5.md",
  migration: "docs/survey/NODE_MIGRATION_R4_TO_R5.md",
  integrationScript: "scripts/integrate_room_c_objects_v0_2.mjs",
};

const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), "utf8");
const readJson = (relative) => JSON.parse(read(relative));
const sha256 = (text) => crypto.createHash("sha256").update(text).digest("hex");
const round = (value, digits = 3) => Number(value.toFixed(digits));
const point = (value) => [value.x, value.y];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const subtract = (a, b) => [a[0] - b[0], a[1] - b[1]];
const multiply = (a, scalar) => [a[0] * scalar, a[1] * scalar];
const length = (a) => Math.hypot(a[0], a[1]);
const distance = (a, b) => length(subtract(a, b));
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const lineIntersection = (originA, directionA, originB, directionB) => {
  const denominator = cross(directionA, directionB);
  if (Math.abs(denominator) < 1e-10) throw new Error("Cannot derive CP2-CR from parallel lines.");
  return add(originA, multiply(directionA, cross(subtract(originB, originA), directionB) / denominator));
};
const coordinate = (value) => ({ x: round(value[0], 3), y: round(value[1], 3) });
const coordinateText = (value) => `(${value[0].toFixed(2)}, ${value[1].toFixed(2)})`;
const signed = (value, digits = 3) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;

const frozenText = read(sources.frozen);
const frozen = JSON.parse(frozenText);
const roomC = readJson(sources.acceptedRoomC);
if (frozen.version !== "1.3" || frozen.freeze?.frozenForNextStage !== true) {
  throw new Error("Required frozen v1.3 source is missing or no longer marked frozen.");
}

const C = Object.fromEntries(Object.entries(frozen.geometry.roomCUnchangedNodesMm).map(([id, value]) => [id, point(value)]));
const O = Object.fromEntries(Object.entries(frozen.geometry.roomCUnchangedObjectNodesMm).map(([id, value]) => [id, point(value)]));

// Accepted v0.2 object integration explicitly supersedes the provisional equal-split
// D4-CL/D3-CR display gauges with measured casing/object stations. No coordinate is moved here.
const semantic = {
  "D4-CL": O["D4-OUTER-L"],
  "D3-CR": O["D3-OUTER-R"],
  "CP2-FL": C["CP2-FL"],
  "CP2-FR": C["CP2-FR"],
  C2: C.C2,
};

// CP2-CR is absent as an explicit v1.3 node. R5 puts it on the A-C structural wall,
// and accepted object geometry supplies the CP2 rear plane through the two body-back nodes.
// Their unique line intersection recovers the semantic reference without inventing a measurement.
const structuralDirection = subtract(C["D3-CL"], C["CP2-FR"]);
const rearPlaneDirection = subtract(O["CP2-BODY-BR"], O["CP2-BODY-BL"]);
const derivedCP2CR = lineIntersection(C["CP2-FR"], structuralDirection, O["CP2-BODY-BL"], rearPlaneDirection);
const derivedCP2CRByDepthVector = add(C["CP2-FR"], subtract(O["CP2-BODY-BR"], O["CP2-BODY-FR"]));
semantic["CP2-CR"] = derivedCP2CR;

const reviewBand = (absolutePercent) => {
  if (absolutePercent <= 0.5) return "Excellent";
  if (absolutePercent <= 1.0) return "Good / likely acceptable";
  if (absolutePercent <= 1.5) return "Review";
  return "Investigate";
};

function scalarCheck(id, from, to, fieldMm) {
  const modelMm = distance(semantic[from], semantic[to]);
  const residualMm = modelMm - fieldMm;
  const residualPercent = residualMm / fieldMm * 100;
  return {
    id, from, to, field: { kind: "approximate scalar", valueMm: fieldMm },
    modelV13Mm: round(modelMm), residualMm: round(residualMm), residualPercent: round(residualPercent),
    direction: residualMm > 0 ? "model longer" : residualMm < 0 ? "model shorter" : "exact",
    assessment: reviewBand(Math.abs(residualPercent)),
  };
}

function rangeCheck(id, from, to, fieldRangeMm) {
  const modelMm = distance(semantic[from], semantic[to]);
  const [lower, upper] = fieldRangeMm;
  const residualToLowerMm = modelMm - lower;
  const residualToUpperMm = modelMm - upper;
  const residualPercentToLower = residualToLowerMm / lower * 100;
  const residualPercentToUpper = residualToUpperMm / upper * 100;
  const worstAbsolutePercent = Math.max(Math.abs(residualPercentToLower), Math.abs(residualPercentToUpper));
  const inside = modelMm >= lower && modelMm <= upper;
  return {
    id, from, to, field: { kind: "approximate range", rangeMm: fieldRangeMm },
    modelV13Mm: round(modelMm), residualToLowerMm: round(residualToLowerMm), residualToUpperMm: round(residualToUpperMm),
    residualPercentToLower: round(residualPercentToLower), residualPercentToUpper: round(residualPercentToUpper),
    insideObservedRange: inside, direction: inside ? "inside range" : modelMm > upper ? "model longer" : "model shorter",
    assessment: `${reviewBand(worstAbsolutePercent)} — ${inside ? "inside range" : "outside range"}`,
  };
}

const checks = [
  rangeCheck("A", "D4-CL", "CP2-FR", [3800, 3814]),
  rangeCheck("B", "D4-CL", "CP2-CR", [4310, 4330]),
  scalarCheck("C", "D4-CL", "CP2-FL", 3680),
  scalarCheck("D", "D3-CR", "CP2-FL", 3660),
  rangeCheck("E", "CP2-FR", "C2", [4470, 4520]),
];

const alternatives = {
  "D4-CL inherited literal": C["D4-CL"],
  "D3-CR inherited literal": C["D3-CR"],
  "CP2-FL body": O["CP2-BODY-FL"],
  "CP2-FR body": O["CP2-BODY-FR"],
  "CP2-CR body rear proxy": O["CP2-BODY-BR"],
};

function comparison(id, oldStart, oldTarget, newStart, newTarget, note) {
  const oldMm = distance(oldStart, oldTarget);
  const correctedMm = distance(newStart, newTarget);
  return {
    id,
    oldStart: coordinate(oldStart), oldTarget: coordinate(oldTarget),
    correctStart: coordinate(newStart), correctTarget: coordinate(newTarget),
    startCoordinateOffsetMm: round(distance(oldStart, newStart)), targetCoordinateOffsetMm: round(distance(oldTarget, newTarget)),
    oldPredictedMm: round(oldMm), correctedPredictedMm: round(correctedMm),
    correctedMinusOldMm: round(correctedMm - oldMm),
    apparentModelLongDiscrepancyExplainedMm: round(oldMm - correctedMm), note,
  };
}

const proxyComparisons = [
  comparison("A", O["D4-OUTER-L"], O["CP2-BODY-FR"], semantic["D4-CL"], semantic["CP2-FR"], "Prior audit used the body front-right target. Correct R5 footprint semantics lengthen the ray; they explain none of the model-long result."),
  comparison("B", O["D4-OUTER-L"], O["CP2-BODY-BR"], semantic["D4-CL"], semantic["CP2-CR"], "Prior audit used CP2-BODY-BR as an unqualified rear proxy. The recovered R5 rear footprint point is about 27 mm away and lengthens the ray."),
  comparison("C", O["D4-OUTER-L"], O["CP2-BODY-FL"], semantic["D4-CL"], semantic["CP2-FL"], "Body-left is 20 mm inside the explicit outer-footprint node; correct semantics shorten this diagonal slightly."),
  comparison("D", O["D3-OUTER-R"], O["CP2-BODY-FL"], semantic["D3-CR"], semantic["CP2-FL"], "Correct D3 casing station is retained; using the footprint rather than body-left shortens this diagonal slightly."),
  comparison("E", O["CP2-BODY-FR"], C.C2, semantic["CP2-FR"], semantic.C2, "The R5 footprint point, not the body point, is the field endpoint; correct semantics lengthen this check."),
];

const literalStartAlternatives = [
  {
    id: "D4-CL",
    provisionalFrozenCoordinate: coordinate(C["D4-CL"]),
    correctR5Coordinate: coordinate(semantic["D4-CL"]),
    offsetMm: round(distance(C["D4-CL"], semantic["D4-CL"])),
    decision: "Use D4-OUTER-L: the accepted integration says it replaced the v0.1 equal-split display gauge with the measured 760 + 80 + 80 mm casing/leaf span.",
  },
  {
    id: "D3-CR",
    provisionalFrozenCoordinate: coordinate(C["D3-CR"]),
    correctR5Coordinate: coordinate(semantic["D3-CR"]),
    offsetMm: round(distance(C["D3-CR"], semantic["D3-CR"])),
    decision: "Use D3-OUTER-R: the accepted integration says it replaced the v0.1 equal-split display gauge with the measured leaf plus approximate casing span.",
  },
];

const rc18 = roomC.shell.activeObservationResiduals.find((item) => item.id === "RC-18");
const rc22 = roomC.shell.activeObservationResiduals.find((item) => item.id === "RC-22");
const supportingEvidence = {
  "RC-18": { from: rc18.from, to: rc18.to, measuredMm: rc18.measuredMm, modelV13Mm: round(distance(C[rc18.from], C[rc18.to])), residualMm: round(distance(C[rc18.from], C[rc18.to]) - rc18.measuredMm), role: "direct constraint used in accepted Room C fit" },
  "RC-19": { from: roomC.measurementFitSummary.correctedRC19.from, to: roomC.measurementFitSummary.correctedRC19.to, measuredMm: roomC.measurementFitSummary.correctedRC19.measuredMm, modelV13Mm: round(distance(C[roomC.measurementFitSummary.correctedRC19.from], C[roomC.measurementFitSummary.correctedRC19.to])), residualMm: round(distance(C[roomC.measurementFitSummary.correctedRC19.from], C[roomC.measurementFitSummary.correctedRC19.to]) - roomC.measurementFitSummary.correctedRC19.measuredMm), role: "corrected endpoint; direct validation retained outside accepted fit" },
  "RC-22": { from: rc22.from, to: rc22.to, measuredMm: rc22.measuredMm, modelV13Mm: round(distance(C[rc22.from], C[rc22.to])), residualMm: round(distance(C[rc22.from], C[rc22.to]) - rc22.measuredMm), role: "direct constraint used in accepted Room C fit" },
  cp2BodyWidth: { measuredMm: 708, modelV13Mm: round(distance(O["CP2-BODY-FL"], O["CP2-BODY-FR"])), evidenceClass: "direct" },
  cp2BodyDepth: { measuredMm: 536, modelV13Mm: round(distance(O["CP2-BODY-FR"], O["CP2-BODY-BR"])), evidenceClass: "direct" },
  cp2LeftCasing: { observedMm: 20, modelV13Mm: round(distance(O["CP2-CASING-FL"], O["CP2-BODY-FL"])), evidenceClass: "approximate" },
  footprintBalance: { outerFrontSpanMm: round(distance(C["CP2-FL"], C["CP2-FR"])), bodyWidthMm: 708, knownLeftCasingMm: 20, unallocatedMm: 27, treatment: "Still unallocated by physical layer. The CP2-CR derivation locates the outer rear reference geometrically but does not convert the 27 mm into a measured right casing or gap." },
};

const mappings = {
  "D4-CL": {
    r5Meaning: "Viewer-left outer casing edge while standing in Room C facing D4.",
    frozenInstantiation: "roomCUnchangedObjectNodesMm.D4-OUTER-L",
    coordinateMm: coordinate(semantic["D4-CL"]),
    confusedAlternative: { id: "roomCUnchangedNodesMm.D4-CL", coordinateMm: coordinate(C["D4-CL"]), offsetMm: round(distance(C["D4-CL"], semantic["D4-CL"])), status: "superseded provisional equal-split display gauge" },
  },
  "D3-CR": {
    r5Meaning: "Viewer-right outer casing edge while standing in Room C facing D3.",
    frozenInstantiation: "roomCUnchangedObjectNodesMm.D3-OUTER-R",
    coordinateMm: coordinate(semantic["D3-CR"]),
    confusedAlternative: { id: "roomCUnchangedNodesMm.D3-CR", coordinateMm: coordinate(C["D3-CR"]), offsetMm: round(distance(C["D3-CR"], semantic["D3-CR"])), status: "superseded provisional equal-split display gauge" },
  },
  "CP2-FL": {
    r5Meaning: "Viewer-left identifiable front outer footprint corner of CP2.",
    frozenInstantiation: "roomCUnchangedNodesMm.CP2-FL (coincident with CP2-CASING-FL)",
    coordinateMm: coordinate(semantic["CP2-FL"]),
    confusedAlternative: { id: "CP2-BODY-FL", coordinateMm: coordinate(O["CP2-BODY-FL"]), offsetMm: round(distance(O["CP2-BODY-FL"], semantic["CP2-FL"])), status: "rendered cupboard-body edge, not footprint" },
  },
  "CP2-FR": {
    r5Meaning: "Viewer-right identifiable front outer footprint corner of CP2 at the structural wall.",
    frozenInstantiation: "roomCUnchangedNodesMm.CP2-FR",
    coordinateMm: coordinate(semantic["CP2-FR"]),
    confusedAlternative: { id: "CP2-BODY-FR", coordinateMm: coordinate(O["CP2-BODY-FR"]), offsetMm: round(distance(O["CP2-BODY-FR"], semantic["CP2-FR"])), status: "rendered cupboard-body edge, not footprint" },
  },
  "CP2-CR": {
    r5Meaning: "Viewer-right rear casing/footprint corner on the A-C structural wall.",
    frozenInstantiation: null,
    recoveredAs: "derived semantic reference from accepted geometry: intersection of CP2-FR→D3-CL structural-wall line with CP2-BODY-BL→CP2-BODY-BR rear plane",
    coordinateMm: coordinate(semantic["CP2-CR"]),
    derivationCrossCheckMm: { depthVectorMethod: coordinate(derivedCP2CRByDepthVector), differenceBetweenMethodsMm: round(distance(derivedCP2CR, derivedCP2CRByDepthVector), 6) },
    confusedAlternative: { id: "CP2-BODY-BR", coordinateMm: coordinate(O["CP2-BODY-BR"]), offsetMm: round(distance(O["CP2-BODY-BR"], semantic["CP2-CR"])), status: "rendered cupboard-body edge, not footprint" },
    evidenceStatus: "not a new measured node; right-side layer allocation remains unmeasured",
  },
  C2: {
    r5Meaning: "Permanent Room C upper/inner return associated with the W2 recess / D4 side.",
    frozenInstantiation: "roomCUnchangedNodesMm.C2",
    coordinateMm: coordinate(semantic.C2),
    confusedAlternative: { id: "legacy source-plan cupboard label C2", coordinateMm: null, offsetMm: null, status: "object alias for CP2, not the R5 permanent node C2" },
  },
};

const audit = {
  artifact: stem,
  version: "0.1",
  generatedBy: "scripts/generate_whole_flat_v1_3_cp2_r5_semantic_validation_audit_v0_1.mjs",
  scope: "Targeted R5 semantic/node-mapping and CP2 validation audit of frozen v1.3; analysis only.",
  sources,
  sourceHashesSha256: Object.fromEntries(Object.entries(sources).map(([key, relative]) => [key, sha256(read(relative))])),
  frozenIntegrity: { version: frozen.version, frozenForNextStage: frozen.freeze.frozenForNextStage, sourceSha256: sha256(frozenText), geometryMovementMm: 0, solverRun: false, v14Created: false },
  semanticMappings: mappings,
  literalStartAlternatives,
  cp2CRDerivation: {
    status: "uniquely recovered derived semantic reference from accepted geometry",
    structuralWall: { through: ["CP2-FR", "D3-CL"], pointsMm: [coordinate(C["CP2-FR"]), coordinate(C["D3-CL"])] },
    rearPlane: { through: ["CP2-BODY-BL", "CP2-BODY-BR"], pointsMm: [coordinate(O["CP2-BODY-BL"]), coordinate(O["CP2-BODY-BR"])] },
    resultMm: coordinate(derivedCP2CR),
    depthVectorCrossCheckMm: coordinate(derivedCP2CRByDepthVector),
    methodDifferenceMm: round(distance(derivedCP2CR, derivedCP2CRByDepthVector), 6),
    caution: "The 27 mm body-to-footprint balance remains an unknown right-side layer composition; this derivation locates the R5 outer reference but does not measure that composition.",
  },
  fieldChecks: checks,
  proxyComparisons,
  supportingEvidence,
  patternAnalysis: {
    rightRayModelDifferenceMm: round(checks[1].modelV13Mm - checks[0].modelV13Mm),
    observedRightRayDifferenceAdmissibleMm: [4310 - 3814, 4330 - 3800],
    leftRayModelDifferenceMm: round(checks[2].modelV13Mm - checks[3].modelV13Mm),
    observedLeftRayDifferenceMm: 20,
    endpointLayerMismatch: "Resolved semantically but does not explain the model-long right rays; correct endpoints increase A by 7.986 mm and B by 7.092 mm relative to prior body proxies.",
    wholeCP2Translation: "All five rays are model-long, so a common movement toward the doorway/recess reference cluster is directionally possible. No vector is estimated: approximate/ranged readings have no authoritative point values, and moving CP2 would violate exact RC-18/RC-22 and near-exact RC-19 unless adjoining accepted geometry also changed.",
    widthDepth: "No direct evidence of body width/depth error. Width 708 mm and depth 536 mm reproduce exactly; the A-to-B modeled increment is inside the interval permitted by the two observed ranges.",
    d4D3Mapping: "Resolved. D4-OUTER-L and D3-OUTER-R are the accepted R5 casing stations. Checks C and D agree to within 1%, and their modeled difference is within 2.878 mm of the observed approximate difference.",
  },
  diagnosis: { classNumber: 3, classification: "systematic CP2 relative-position discrepancy", qualifier: "Low-to-medium-confidence, localized outer-footprint/right-station discrepancy; not a demonstrated whole-object translation or body width/depth failure." },
  requiredAction: "Keep v1.3 frozen. Human-review and accept the resolved node mapping plus the localized CP2 outer-footprint residual flag; carry CP2-CR as a derived semantic reference in validation records. Existing expanded evidence is sufficient, so no new physical measurement or solve is requested.",
  final2DConsequence: "No change to the recommendation to keep v1.3 frozen. No geometry has moved and no v1.4 is created.",
  stopGate: "VALIDATION REVIEW REQUIRED",
};

const scalarRow = (check) => `| ${check.id} | ${check.from} → ${check.to} | ≈${check.field.valueMm.toFixed(0)} | ${check.modelV13Mm.toFixed(2)} | ${signed(check.residualMm, 2)} | ${signed(check.residualPercent, 2)}% | ${check.assessment} |`;
const rangeRow = (check) => `| ${check.id} | ${check.from} → ${check.to} | ≈${check.field.rangeMm[0]}–${check.field.rangeMm[1]} | ${check.modelV13Mm.toFixed(2)} | ${signed(check.residualToLowerMm, 2)} to lower; ${signed(check.residualToUpperMm, 2)} to upper | ${signed(check.residualPercentToLower, 2)}% to lower; ${signed(check.residualPercentToUpper, 2)}% to upper | ${check.assessment} |`;
const fieldRows = checks.map((check) => check.field.kind === "approximate range" ? rangeRow(check) : scalarRow(check)).join("\n");
const mappingRows = Object.entries(mappings).map(([id, entry]) => {
  const alternative = entry.confusedAlternative;
  const alt = alternative.coordinateMm ? `${alternative.id} ${coordinateText([alternative.coordinateMm.x, alternative.coordinateMm.y])}, offset ${alternative.offsetMm.toFixed(2)} mm` : alternative.id;
  return `| ${id} | ${entry.r5Meaning} | ${coordinateText([entry.coordinateMm.x, entry.coordinateMm.y])} | ${entry.frozenInstantiation || "Not explicit; derived below"} | ${alt} |`;
}).join("\n");
const proxyRows = proxyComparisons.map((item) => `| ${item.id} | ${coordinateText([item.oldStart.x, item.oldStart.y])} → ${coordinateText([item.oldTarget.x, item.oldTarget.y])} | ${coordinateText([item.correctStart.x, item.correctStart.y])} → ${coordinateText([item.correctTarget.x, item.correctTarget.y])} | ${item.startCoordinateOffsetMm.toFixed(2)} / ${item.targetCoordinateOffsetMm.toFixed(2)} | ${item.oldPredictedMm.toFixed(2)} | ${item.correctedPredictedMm.toFixed(2)} | ${signed(item.apparentModelLongDiscrepancyExplainedMm, 2)} |` ).join("\n");

const markdown = `# Whole-flat v1.3 CP2 R5 semantic validation audit v0.1

## Scope and frozen-state gate

This is a targeted semantic/node-mapping and CP2 validation audit of \`WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3\`. It does not alter geometry, run a solver, or create v1.4. Expected and actual geometry movement is **0 mm everywhere**.

The field names are interpreted using the explicit R5 viewer-relative definitions, not page-left/page-right and not visually nearby rendered-body proxies.

## Exact semantic trace

| R5 node | Physical meaning | Correct frozen-v1.3 coordinate (mm) | Instantiation | Confusable alternative |
|---|---|---:|---|---|
${mappingRows}

### D4-CL resolution

The correct R5 coordinate is **D4-OUTER-L ${coordinateText(semantic["D4-CL"])}**. The inherited literal \`D4-CL\` at ${coordinateText(C["D4-CL"])} is ${distance(C["D4-CL"], semantic["D4-CL"]).toFixed(2)} mm away and is the superseded v0.1 equal-split display gauge. The accepted object integration explicitly states that the measured 760 + 80 + 80 mm D4 object span replaced that gauge. Every D4 field check below therefore uses D4-OUTER-L.

### D3-CR resolution

The correct R5 coordinate is **D3-OUTER-R ${coordinateText(semantic["D3-CR"])}**. The inherited literal \`D3-CR\` at ${coordinateText(C["D3-CR"])} is ${distance(C["D3-CR"], semantic["D3-CR"]).toFixed(2)} mm away and is likewise a superseded equal-split display gauge. No D3 leaf/opening point is substituted.

### CP2 front footprint resolution

Explicit outer-footprint coordinates exist: **CP2-FL ${coordinateText(semantic["CP2-FL"])}** and **CP2-FR ${coordinateText(semantic["CP2-FR"])}**. CP2-FL coincides with \`CP2-CASING-FL\`, while \`CP2-BODY-FL\` is 20.00 mm inside it. \`CP2-BODY-FR\` is 27.00 mm from CP2-FR. These body points are rendered joinery geometry, not R5 footprint substitutes.

### CP2-CR recovery

\`CP2-CR\` is not explicit in frozen v1.3, but it is uniquely recoverable as a **derived semantic reference from accepted geometry**:

- R5 places CP2-CR on the A–C structural wall, whose accepted Room C line is CP2-FR→D3-CL.
- The accepted 536 mm object depth supplies the rear plane through CP2-BODY-BL→CP2-BODY-BR.
- Their intersection is **CP2-CR ${coordinateText(semantic["CP2-CR"])}**.
- Independently extending CP2-FR by the accepted body-depth vector gives ${coordinateText(derivedCP2CRByDepthVector)}, only ${distance(derivedCP2CR, derivedCP2CRByDepthVector).toFixed(3)} mm different because stored coordinates are rounded.

This is not a new measured node. It is ${distance(O["CP2-BODY-BR"], semantic["CP2-CR"]).toFixed(2)} mm from CP2-BODY-BR. The known 27 mm right-side footprint balance remains physically unallocated; the derivation does not relabel it as measured casing or gap.

The R5 permanent node \`C2\` is ${coordinateText(semantic.C2)} at the W2/D4-side return. It must not be confused with the legacy source-plan cupboard name C2, which R5 replaced with CP2.

## Expanded validation results

Residual is model minus field. Full observation ranges are retained; no midpoint is promoted to a measurement.

| Check | Semantic ray | Field measurement (mm) | Model v1.3 (mm) | Residual (mm) | Residual % | Assessment |
|---|---|---:|---:|---:|---:|---|
${fieldRows}

Review bands follow the project convention: Excellent ≤0.5%, Good >0.5–1.0%, Review >1.0–1.5%, Investigate >1.5%. Ranged checks use the worst percentage against either reported limit.

## Semantic versus proxy comparison

The coordinate-offset column is start / target. “Explained” is old predicted distance minus corrected predicted distance: a negative value means correct semantics make the model-long result larger rather than explaining it.

| Check | Old proxy coordinates | Correct R5 coordinates | Coordinate offsets (mm) | Old prediction (mm) | Corrected (mm) | Apparent discrepancy explained (mm) |
|---|---|---|---:|---:|---:|---:|
${proxyRows}

For A and B, the corrected semantic endpoints lengthen the predictions by ${proxyComparisons[0].correctedMinusOldMm.toFixed(2)} mm and ${proxyComparisons[1].correctedMinusOldMm.toFixed(2)} mm respectively. Endpoint semantics are now resolved, but they do **not** remove the paired model-long residual.

## Supporting CP2 evidence

| Evidence | Field (mm) | Frozen v1.3 (mm) | Residual (mm) | Role |
|---|---:|---:|---:|---|
| RC-18 PI1→CP2-FR | ${supportingEvidence["RC-18"].measuredMm} | ${supportingEvidence["RC-18"].modelV13Mm.toFixed(2)} | ${signed(supportingEvidence["RC-18"].residualMm, 2)} | Direct fit constraint |
| RC-19 CP2-FR→PI3 | ${supportingEvidence["RC-19"].measuredMm} | ${supportingEvidence["RC-19"].modelV13Mm.toFixed(2)} | ${signed(supportingEvidence["RC-19"].residualMm, 2)} | Corrected holdout endpoint |
| RC-22 CP2-FL→PI1 | ${supportingEvidence["RC-22"].measuredMm} | ${supportingEvidence["RC-22"].modelV13Mm.toFixed(2)} | ${signed(supportingEvidence["RC-22"].residualMm, 2)} | Direct fit constraint |
| CP2 body width | 708 | ${supportingEvidence.cp2BodyWidth.modelV13Mm.toFixed(2)} | ${signed(supportingEvidence.cp2BodyWidth.modelV13Mm - 708, 2)} | Direct body layer |
| CP2 body depth | 536 | ${supportingEvidence.cp2BodyDepth.modelV13Mm.toFixed(2)} | ${signed(supportingEvidence.cp2BodyDepth.modelV13Mm - 536, 2)} | Direct body layer |
| CP2 viewer-left casing | ≈20 | ${supportingEvidence.cp2LeftCasing.modelV13Mm.toFixed(2)} | ${signed(supportingEvidence.cp2LeftCasing.modelV13Mm - 20, 2)} | Approximate casing layer |

The explicit CP2-FL→CP2-FR span is 755 mm. The 708 mm body plus approximately 20 mm left casing explains 728 mm, leaving the established **27 mm unallocated footprint/casing balance**. That unknown layer composition remains relevant to the outer-right reference, but it is too small by itself to explain the full A/B residual and must not be invented as a measured right casing.

## Geometric pattern analysis

### Hypothesis 1 — endpoint/layer mismatch

The ambiguity is resolved, but the hypothesis does not explain the concern. Correct footprint/rear semantics increase A from ${proxyComparisons[0].oldPredictedMm.toFixed(2)} to ${proxyComparisons[0].correctedPredictedMm.toFixed(2)} mm and B from ${proxyComparisons[1].oldPredictedMm.toFixed(2)} to ${proxyComparisons[1].correctedPredictedMm.toFixed(2)} mm. The prior proxy conclusion was not semantically valid, yet the correct calculation remains model-long.

### Hypothesis 2 — whole-CP2 translation

A and B remain model-long by overlapping bands: A is +${checks[0].residualToUpperMm.toFixed(2)} to +${checks[0].residualToLowerMm.toFixed(2)} mm beyond the observed range, and B is +${checks[1].residualToUpperMm.toFixed(2)} to +${checks[1].residualToLowerMm.toFixed(2)} mm. C and D are also model-long, but only +${checks[2].residualMm.toFixed(2)} and +${checks[3].residualMm.toFixed(2)} mm. E lies only ${checks[4].residualToUpperMm.toFixed(2)} mm above its upper reported limit.

All five rays therefore have a coherent directional tendency that could be reduced by moving CP2 toward the doorway/recess reference cluster. A displacement vector is **not** estimated: the observations are approximate or ranged, their midpoints are non-authoritative, and a CP2-only move would break exact RC-18/RC-22 and near-exact RC-19 unless accepted adjoining geometry also changed. The evidence is not sufficiently determined for a rigid translation claim.

### Hypothesis 3 — CP2 width/depth problem

Not supported. The direct 708 mm body width and 536 mm body depth reproduce exactly. RC-18 and RC-22 reproduce exactly, and corrected holdout RC-19 is only -4.00 mm. Further, model B minus A is ${(checks[1].modelV13Mm - checks[0].modelV13Mm).toFixed(2)} mm; the two field ranges permit a difference of 496–530 mm. Thus the paired front/rear pattern is compatible with the accepted depth contribution rather than diagnosing a depth error.

The stronger right-side residual relative to the left-side checks points instead to the outer-right footprint/reference station or to the approximate long-ray evidence. The 27 mm layer balance is relevant but does not fully account for a roughly 54–74 mm excess.

### Hypothesis 4 — D4/D3 reference mismatch

Resolved, with no leaf proxy used. The accepted R5 stations are D4-OUTER-L and D3-OUTER-R. Checks C and D are both Good at ${checks[2].residualPercent.toFixed(2)}% and ${checks[3].residualPercent.toFixed(2)}%; their modeled difference is ${(checks[2].modelV13Mm - checks[3].modelV13Mm).toFixed(2)} mm versus the approximate field difference of 20 mm. That coherence supports the corrected doorway mapping rather than a D4/D3 semantic failure.

## Correct semantic mappings

- D4-CL = **${coordinateText(semantic["D4-CL"])}**, instantiated as D4-OUTER-L.
- D3-CR = **${coordinateText(semantic["D3-CR"])}**, instantiated as D3-OUTER-R.
- CP2-FL = **${coordinateText(semantic["CP2-FL"])}**, explicit outer footprint and coincident with CP2-CASING-FL.
- CP2-FR = **${coordinateText(semantic["CP2-FR"])}**, explicit outer footprint.
- CP2-CR = **${coordinateText(semantic["CP2-CR"])}**, derived semantic reference from the accepted structural-wall/rear-plane intersection.
- C2 = **${coordinateText(semantic.C2)}**, permanent W2/D4-side return.

## CP2 diagnosis

**3. Systematic CP2 relative-position discrepancy**, with a low-to-medium-confidence, localized outer-footprint/right-station qualifier. Semantics are resolved and the five rays are consistently model-long, but direct constraints do not support a body width/depth failure and the approximate evidence is insufficient to identify an authoritative whole-object translation.

## Required action

Keep v1.3 frozen. The minimum next action is human review/acceptance of the resolved mapping and the localized CP2 outer-footprint residual flag, with CP2-CR carried as a derived semantic reference in validation records. The expanded existing field evidence is sufficient for this gate: **do not request another physical measurement, move geometry, or run a solve**.

## Final 2D consequence

This evidence does **not** change the recommendation to keep v1.3 frozen. No Room C, doorway, cupboard, shell, or other node moved; no transform changed; no solver ran; no v1.4 was created.

**VALIDATION REVIEW REQUIRED**
`;

const svgPoint = ([x, y]) => [80 + (x - 1450) * 0.25, 80 + (-y) * 0.16];
const xy = (value) => svgPoint(value).map((part) => part.toFixed(1)).join(",");
const svgLine = (a, b, cls, extra = "") => `<line x1="${svgPoint(a)[0].toFixed(1)}" y1="${svgPoint(a)[1].toFixed(1)}" x2="${svgPoint(b)[0].toFixed(1)}" y2="${svgPoint(b)[1].toFixed(1)}" class="${cls}" ${extra}/>`;
const svgCircle = (id, value, dx = 8, dy = -8) => {
  const [x, y] = svgPoint(value);
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" class="semantic"/><text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" class="label">${id}</text>`;
};
const svgSquare = (id, value, dx = 8, dy = 17) => {
  const [x, y] = svgPoint(value);
  return `<rect x="${(x - 4.5).toFixed(1)}" y="${(y - 4.5).toFixed(1)}" width="9" height="9" class="bodyNode"/><text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" class="bodyLabel">${id}</text>`;
};
const svgCross = (id, value, dx = -8, dy = 18) => {
  const [x, y] = svgPoint(value);
  return `<path d="M ${(x - 5).toFixed(1)} ${(y - 5).toFixed(1)} L ${(x + 5).toFixed(1)} ${(y + 5).toFixed(1)} M ${(x + 5).toFixed(1)} ${(y - 5).toFixed(1)} L ${(x - 5).toFixed(1)} ${(y + 5).toFixed(1)}" class="proxy"/><text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" class="proxyLabel" text-anchor="end">${id}</text>`;
};
const cp2Body = [O["CP2-BODY-FL"], O["CP2-BODY-FR"], O["CP2-BODY-BR"], O["CP2-BODY-BL"]].map(xy).join(" ");
const rayColors = ["rayA", "rayB", "rayC", "rayD", "rayE"];
const raySvg = checks.map((check, index) => `${svgLine(semantic[check.from], semantic[check.to], `ray ${rayColors[index]}`)}<text x="${((svgPoint(semantic[check.from])[0] + svgPoint(semantic[check.to])[0]) / 2 + 5).toFixed(1)}" y="${((svgPoint(semantic[check.from])[1] + svgPoint(semantic[check.to])[1]) / 2 - 6).toFixed(1)}" class="rayLabel">${check.id}</text>`).join("\n");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1000" viewBox="0 0 1500 1000" role="img" aria-labelledby="title desc">
  <title id="title">Whole-flat v1.3 CP2 R5 semantic validation audit</title>
  <desc id="desc">Exact frozen Room C coordinates showing R5 semantic nodes, rendered CP2 body nodes, superseded doorway gauges and five validation rays. Geometry is unchanged.</desc>
  <style>
    .bg{fill:#f7f8fb}.panel{fill:#fff;stroke:#cad2df;stroke-width:1.5}.wall{stroke:#27374d;stroke-width:5;fill:none}.outer{stroke:#244a8f;stroke-width:3;fill:none}.body{fill:#fff1d6;stroke:#b66b00;stroke-width:2.5}.semantic{fill:#fff;stroke:#193f83;stroke-width:3}.bodyNode{fill:#f4a641;stroke:#8b4e00;stroke-width:1.5}.proxy{fill:none;stroke:#7d8796;stroke-width:2}.label{font:700 13px Arial;fill:#173b78}.bodyLabel{font:12px Arial;fill:#8b4e00}.proxyLabel{font:11px Arial;fill:#697586}.ray{stroke-width:2.2;stroke-dasharray:9 6;fill:none;opacity:.85}.rayA{stroke:#d64045}.rayB{stroke:#8f3bb8}.rayC{stroke:#2a9d8f}.rayD{stroke:#168aad}.rayE{stroke:#e76f51}.rayLabel{font:700 13px Arial;fill:#252b36;paint-order:stroke;stroke:#fff;stroke-width:4}.title{font:700 25px Arial;fill:#16253a}.sub{font:14px Arial;fill:#425066}.head{font:700 17px Arial;fill:#16253a}.text{font:13px Arial;fill:#253246}.small{font:12px Arial;fill:#526176}.warning{fill:#fff5d9;stroke:#d69e2e;stroke-width:1.3}.good{fill:#e9f7f0;stroke:#3d9872;stroke-width:1.3}.legend{font:12px Arial;fill:#253246}
  </style>
  <rect width="1500" height="1000" class="bg"/>
  <text x="42" y="45" class="title">CP2 R5 semantic validation · frozen v1.3</text>
  <text x="42" y="70" class="sub">Exact coordinate geometry · semantic references and body layers separated · no geometry movement</text>
  <rect x="35" y="92" width="1040" height="850" rx="10" class="panel"/>
  <rect x="1095" y="92" width="370" height="850" rx="10" class="panel"/>

  ${svgLine(C.C2, C["D4-CR"], "wall")}
  ${svgLine(O["D4-OUTER-R"], O["D4-OUTER-L"], "outer")}
  ${svgLine(O["D4-OUTER-L"], O["D3-OUTER-R"], "wall")}
  ${svgLine(O["D3-OUTER-R"], C["D3-CL"], "outer")}
  ${svgLine(C["D3-CL"], C["CP2-FR"], "wall")}
  ${svgLine(C.PI1, C["CP2-FL"], "wall")}
  ${svgLine(C["CP2-FL"], C["CP2-FR"], "outer")}
  ${svgLine(C["CP2-FR"], semantic["CP2-CR"], "outer")}
  ${svgLine(semantic["CP2-CR"], O["CP2-BODY-BL"], "outer")}
  <polygon points="${cp2Body}" class="body"/>

  ${raySvg}

  ${svgCircle("C2", semantic.C2, -8, -10)}
  ${svgCircle("D4-CL", semantic["D4-CL"], -10, 23)}
  ${svgCircle("D3-CR", semantic["D3-CR"], 8, 23)}
  ${svgCircle("CP2-FL", semantic["CP2-FL"], -8, -10)}
  ${svgCircle("CP2-FR", semantic["CP2-FR"], 8, -10)}
  ${svgCircle("CP2-CR derived", semantic["CP2-CR"], 8, 18)}

  ${svgSquare("BODY-FL", O["CP2-BODY-FL"])}
  ${svgSquare("BODY-FR", O["CP2-BODY-FR"], -8, 20)}
  ${svgSquare("BODY-BL", O["CP2-BODY-BL"], 8, 18)}
  ${svgSquare("BODY-BR", O["CP2-BODY-BR"], -8, 18)}
  ${svgCross("old D4-CL", C["D4-CL"])}
  ${svgCross("old D3-CR", C["D3-CR"], -8, -12)}

  <text x="1120" y="130" class="head">Node layers</text>
  <circle cx="1128" cy="160" r="5.5" class="semantic"/><text x="1145" y="165" class="legend">Correct R5 semantic node</text>
  <rect x="1123.5" y="182.5" width="9" height="9" class="bodyNode"/><text x="1145" y="192" class="legend">Rendered cupboard-body node</text>
  <path d="M1123 213 L1133 223 M1133 213 L1123 223" class="proxy"/><text x="1145" y="222" class="legend">Superseded/proxy point</text>

  <text x="1120" y="270" class="head">Five semantic rays</text>
  <line x1="1122" y1="295" x2="1160" y2="295" class="ray rayA"/><text x="1170" y="300" class="legend">A · D4-CL → CP2-FR</text>
  <line x1="1122" y1="325" x2="1160" y2="325" class="ray rayB"/><text x="1170" y="330" class="legend">B · D4-CL → CP2-CR</text>
  <line x1="1122" y1="355" x2="1160" y2="355" class="ray rayC"/><text x="1170" y="360" class="legend">C · D4-CL → CP2-FL</text>
  <line x1="1122" y1="385" x2="1160" y2="385" class="ray rayD"/><text x="1170" y="390" class="legend">D · D3-CR → CP2-FL</text>
  <line x1="1122" y1="415" x2="1160" y2="415" class="ray rayE"/><text x="1170" y="420" class="legend">E · CP2-FR → C2</text>

  <rect x="1115" y="458" width="330" height="156" rx="8" class="warning"/>
  <text x="1132" y="487" class="head">Semantic outcome</text>
  <text x="1132" y="516" class="text">D4/D3 gauges superseded:</text>
  <text x="1132" y="540" class="small">D4 offset 18.33 mm · D3 offset 16.67 mm</text>
  <text x="1132" y="568" class="text">CP2-CR recovered at</text>
  <text x="1132" y="592" class="small">${coordinateText(semantic["CP2-CR"])} · derived, not measured</text>

  <rect x="1115" y="638" width="330" height="198" rx="8" class="good"/>
  <text x="1132" y="668" class="head">Evidence interaction</text>
  <text x="1132" y="696" class="text">RC-18 / RC-22 exact</text>
  <text x="1132" y="721" class="text">RC-19 residual -4.00 mm</text>
  <text x="1132" y="746" class="text">Body 708 × 536 mm exact</text>
  <text x="1132" y="771" class="text">Left casing ≈20 mm</text>
  <text x="1132" y="796" class="text">Right-layer balance 27 mm unallocated</text>
  <text x="1132" y="821" class="small">No width/depth change supported.</text>

  <text x="1120" y="874" class="head">Conclusion</text>
  <text x="1120" y="902" class="text">Localized systematic CP2 relative-</text>
  <text x="1120" y="924" class="text">position residual · keep v1.3 frozen.</text>
  <text x="42" y="975" class="sub">VALIDATION REVIEW REQUIRED · geometry movement 0 mm · solver not run · no v1.4</text>
</svg>
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(audit, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, `${stem}.md`), markdown);
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), svg);

console.log(JSON.stringify({
  generated: [`${stem}.md`, `${stem}.json`, `${stem}.svg`],
  frozenSourceSha256: sha256(frozenText),
  geometryMovementMm: 0,
  semanticMappings: Object.fromEntries(Object.entries(semantic).map(([id, value]) => [id, coordinate(value)])),
}, null, 2));

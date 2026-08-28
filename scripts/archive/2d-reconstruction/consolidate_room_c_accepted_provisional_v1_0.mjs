#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const roomCDirRelative = "docs/survey/derived/room-c";
const archiveDirRelative = `${roomCDirRelative}/archive`;
const outputDir = path.join(repoRoot, roomCDirRelative);
const predecessorRelative = `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_VERTICAL_CORRECTIONS_v0_4.json`;
const predecessorSvgRelative = `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_VERTICAL_CORRECTIONS_v0_4.svg`;
const acceptedShellRelative = `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1.json`;
const stem = "ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0";
const generatedDate = "2026-08-12";

const resolveArtefactPath = (relative) => relative.startsWith(`${roomCDirRelative}/ROOM_C_RECONSTRUCTION_`)
  ? path.join(repoRoot, archiveDirRelative, path.basename(relative))
  : path.join(repoRoot, relative);
const readJson = (relative) => JSON.parse(fs.readFileSync(resolveArtefactPath(relative), "utf8"));
const hashFile = (relative) => crypto.createHash("sha256").update(fs.readFileSync(resolveArtefactPath(relative))).digest("hex").toUpperCase();
const clone = (value) => JSON.parse(JSON.stringify(value));
const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const point = ({ x, y }) => [x, y];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const midpoint = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = (vector) => {
  const length = Math.hypot(vector[0], vector[1]);
  return [vector[0] / length, vector[1] / length];
};
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const parallelLineSeparation = (a1, a2, b1) => Math.abs(cross(sub(b1, a1), unit(sub(a2, a1))));

const predecessor = readJson(predecessorRelative);
const acceptedShell = readJson(acceptedShellRelative);
const predecessorSvg = fs.readFileSync(resolveArtefactPath(predecessorSvgRelative), "utf8");

if (predecessor.version !== "0.4") throw new Error("Expected Room C v0.4 predecessor.");
if (acceptedShell.selection?.selectedSolutionId !== "A1") throw new Error("Expected accepted first-pass A1 shell.");
if ([predecessor.shell?.changedFromV01, predecessor.shell?.changedFromV02, predecessor.shell?.changedFromV03].some((value) => value !== false)) {
  throw new Error("The v0.4 predecessor does not preserve the accepted A1 shell lineage.");
}

const inherited = predecessor.planGeometry.inheritedNodesMm;
const objects = predecessor.planGeometry.objectNodesMm;

// Validation-only observations. Predictions are derived from the accepted v0.4 coordinates and are never fitted.
const validRc01Model = parallelLineSeparation(
  point(objects["D4-OUTER-L"]),
  point(objects["D3-OUTER-R"]),
  midpoint(point(inherited.PI1), point(inherited["CP2-FL"])),
);
const validRc02Model = distance(point(inherited.PO3), point(inherited.C0));
const validRc03Model = parallelLineSeparation(
  point(inherited["W2-CR"]),
  point(inherited["W2-CL"]),
  midpoint(point(objects["CP1-BODY-BL"]), point(objects["CP1-BODY-BR"])),
);

const validationOnlyObservations = [
  {
    id: "VALID-RC-01",
    evidenceClass: "validation-only",
    usedAsFitConstraint: false,
    physicalMeasuredMm: 3668,
    modelPredictedMm: round(validRc01Model, 2),
    residualConvention: "model minus physical measurement",
    residualMm: round(validRc01Model - 3668, 2),
    physicalMinusModelMm: round(3668 - validRc01Model, 2),
    targetedSurfaces: {
      from: "small permanent lower-wall section between D4 and D3",
      to: "opposing upper wall run between PI1 and CP2-FL",
    },
    modelDerivation: {
      method: "perpendicular separation between the accepted parallel wall-face lines",
      sourceLineNodes: ["D4-OUTER-L", "D3-OUTER-R"],
      targetLineNodes: ["PI1", "CP2-FL"],
    },
    assessment: "credible cross-room validation; approximately 0.62% model-over-measurement difference",
  },
  {
    id: "VALID-RC-02",
    evidenceClass: "validation-only",
    usedAsFitConstraint: false,
    physicalMeasuredMm: 4405,
    modelPredictedMm: round(validRc02Model, 2),
    residualConvention: "model minus physical measurement",
    residualMm: round(validRc02Model - 4405, 2),
    physicalMinusModelMm: round(4405 - validRc02Model, 2),
    targetedSurfaces: { from: "PO3", to: "C0" },
    modelDerivation: { method: "Euclidean distance between accepted PO3 and C0 coordinates", nodes: ["PO3", "C0"] },
    assessment: "strong independent long closure check; approximately 0.03% difference",
  },
  {
    id: "VALID-RC-03",
    evidenceClass: "validation-only",
    usedAsFitConstraint: false,
    physicalMeasuredMm: 4399,
    modelPredictedMm: round(validRc03Model, 2),
    residualConvention: "model minus physical measurement",
    residualMm: round(validRc03Model - 4399, 2),
    physicalMinusModelMm: round(4399 - validRc03Model, 2),
    targetedSurfaces: { from: "W2/window face", to: "rear/back face of CP1 body" },
    modelDerivation: {
      method: "perpendicular separation between the accepted W2 face and CP1 body-back face lines",
      sourceLineNodes: ["W2-CR", "W2-CL"],
      targetLineNodes: ["CP1-BODY-BL", "CP1-BODY-BR"],
    },
    interpretationCaution: "CP1/rear-wall area is physically uneven; retain surface-selection caution.",
    assessment: "credible long validation; approximately 0.57% model-under-measurement difference",
  },
];

const lineageDefinitions = [
  {
    version: "0.1",
    role: "accepted A1 first-pass shell and partition geometry",
    artefacts: [
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1.svg`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1.json`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1.md`,
      "scripts/solve_room_c_first_pass.mjs",
    ],
  },
  {
    version: "0.2",
    role: "object-layer integration",
    artefacts: [
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_OBJECT_INTEGRATION_v0_2.svg`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_OBJECT_INTEGRATION_v0_2.json`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_OBJECT_INTEGRATION_v0_2.md`,
      "scripts/integrate_room_c_objects_v0_2.mjs",
    ],
  },
  {
    version: "0.3",
    role: "RC-19 endpoint and D2 closing-plane corrections plus local height evidence",
    artefacts: [
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_OBJECT_CORRECTIONS_v0_3.svg`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_OBJECT_CORRECTIONS_v0_3.json`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_OBJECT_CORRECTIONS_v0_3.md`,
      "scripts/correct_room_c_object_integration_v0_3.mjs",
    ],
  },
  {
    version: "0.4",
    role: "CP1 and W2 vertical-evidence corrections",
    artefacts: [
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_VERTICAL_CORRECTIONS_v0_4.svg`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_VERTICAL_CORRECTIONS_v0_4.json`,
      `${roomCDirRelative}/ROOM_C_RECONSTRUCTION_VERTICAL_CORRECTIONS_v0_4.md`,
      "scripts/correct_room_c_vertical_evidence_v0_4.mjs",
    ],
  },
];
const lineage = lineageDefinitions.map((entry) => ({
  ...entry,
  preserved: true,
  artefacts: entry.artefacts.map((relativePath) => ({ relativePath, sha256: hashFile(relativePath) })),
}));

const activeResiduals = predecessor.shell.activeObservationResiduals;
const residual = (id) => {
  const row = activeResiduals.find((item) => item.id === id);
  if (!row) throw new Error(`Active observation missing: ${id}`);
  return row;
};
const d3D4Check = predecessor.objectPlacementChecks.find((item) => item.id === "OBJ-CHECK-D3-D4-RC09");
if (!d3D4Check) throw new Error("D3/D4 object-layer validation missing.");

const output = clone(predecessor);
output.documentType = "consolidated Room C accepted provisional baseline - derived, not source evidence";
output.version = "1.0";
output.generatedDate = generatedDate;
output.status = "PROVISIONALLY ACCEPTED FOR GLOBAL RECONCILIATION";
output.predecessor = predecessorRelative;
output.acceptedShellBaseline = acceptedShellRelative;
output.predecessorCorrectionScope = clone(predecessor.correctionScope);
delete output.correctionScope;
output.consolidationScope = [
  "Carry the accepted A1 shell, partition and v0.4 object/vertical evidence forward without coordinate movement.",
  "Add three independent validation-only observations derived from named accepted surfaces.",
  "Package one obvious provisional Room C input for later whole-flat reconciliation while preserving v0.1-v0.4 provenance.",
];
output.governingStatus = {
  status: "PROVISIONALLY ACCEPTED FOR GLOBAL RECONCILIATION",
  suitableUse: "input to later whole-flat reconciliation through shared D2 and D3 interfaces",
  exclusions: ["construction-locked geometry", "survey-grade certification", "final immutable whole-flat geometry"],
  futureAdjustmentRule: "Small evidence-led adjustment may be justified by later D2/D3 whole-flat closure, with movement and residual changes explicitly reported.",
};
output.consolidation = {
  method: "immutable consolidation of the accepted v0.1-v0.4 lineage; no solve, refit or coordinate optimisation",
  geometrySource: acceptedShellRelative,
  objectAndVerticalSource: predecessorRelative,
  selectedShellSolution: "A1",
  shellNodesMovedMm: 0,
  objectPlanNodesMovedMm: 0,
  partitionFacesCollapsed: false,
  topologyRestoredOrReinterpreted: false,
};
output.lineage = lineage;
output.geometrySummary = {
  wallFamilyAngleDegrees: acceptedShell.selectedGeometry.axes.includedAngleDegrees,
  majorEnvelopeRunsMm: {
    C0ToD3CL: acceptedShell.selectedGeometry.outlineMetrics.lowerC0ToD3CornerMm,
    C0ToCP1FL: acceptedShell.selectedGeometry.outlineMetrics.leftC0ToCP1FlMm,
  },
  envelopeAreaExcludingCupboardDepthsM2: acceptedShell.selectedGeometry.outlineMetrics.envelopeAreaExcludingCupboardDepthsM2,
  partition: {
    outerFaceNodes: acceptedShell.selectedGeometry.currentStudPartitionOuterFace,
    innerFaceNodes: acceptedShell.selectedGeometry.currentStudPartitionInnerFace,
    outerFaceRunsMm: { PO1ToPO2: residual("RC-05").solvedMm, PO2ToPO3: residual("RC-06").solvedMm },
    innerFaceRunsMm: { PI1ToPI2: residual("RC-21").solvedMm, PI2ToPI3: residual("RC-20").solvedMm },
    derivedFaceSeparationsMm: acceptedShell.selectedGeometry.derivedPartitionFaceSeparationsMm,
    planAreaM2: acceptedShell.selectedGeometry.outlineMetrics.partitionPlanAreaM2,
    removableExistingGeometry: true,
  },
  topology: {
    D3CL: "permanent Room C wall turning corner",
    D2CR: "point 580 mm along adjoining wall from D3-CL; not a corner",
    D2WallDepthAxis: "approximately 250 mm perpendicular through-wall axis toward Room A; excluded from along-wall shell chain",
  },
};
output.measurementFitSummary = {
  residualConvention: "model minus measurement",
  primaryShellResiduals: ["RC-01", "RC-02", "RC-03", "RC-05", "RC-06", "RC-07", "RC-08"].map((id) => residual(id)),
  approximateCrossChecks: ["RC-15", "RC-16", "RC-17"].map((id) => residual(id)),
  correctedRC19: residual("RC-19"),
  D3D4ObjectLayerCheck: d3D4Check,
  validationOnlyObservations,
  assessment: "Primary network tensions remain visible at roughly 14-17 mm, while corrected RC-19, the D3/D4 local check and three independent validations support a physically credible provisional model. No RMS-only acceptance argument is used.",
};
output.validationOnlyObservations = validationOnlyObservations;
output.evidenceStatus = {
  directMeasured: "Active RC-series observations and directly measured object dimensions retained with residuals/provenance.",
  approximateMeasured: "Approximate casing, joinery and vertical readings retain approximate status.",
  architecturalTopologyConstraint: "D3-CL turning corner, D2-CR adjoining-wall station, parallel wall families, distinct PO/PI partition faces and through-wall D2 depth axis.",
  inferredObjectPlacement: "Explicitly labelled inferred casing/opening endpoints, centred D2 leaf clearances and unallocated CP2 footprint detail.",
  validationOnly: validationOnlyObservations.map((item) => item.id),
  supersededCorrected: "v0.3/v0.4 correction histories remain embedded; CP2-FL RC-19, Room-C-face D2 leaf, CP1 ceiling-clearance interpretation and W2 approximately 700 mm clearance are history only.",
};
output.globalReconciliationHandoff = {
  ready: true,
  confidence: "Suitable as a provisional Room C input to global reconciliation; independently validated and internally coherent, but not professionally surveyed or construction-certified.",
  materialInterfaceAmbiguities: [
    "D2 exact casing-to-structural-opening registration, exact Room A-side closing-plane rebate/inset and the inferred opposite structural-opening boundary.",
    "The approximately 250 mm A-C wall/reveal depth and exact correspondence of its Room A and Room C finished faces.",
    "D3 structural-opening/reveal dimensions and hinge side; casing widths are approximate, although D3-CL is a fixed permanent corner and the casing-gap check is strong.",
    "Primary shell closure tensions remain distributed across RC-01/03/06 and RC-02/05/07; later global evidence may justify small transparent adjustments rather than silent deformation.",
  ],
  nonMaterialDetailAmbiguities: [
    "D4 hinge side and structural reveal detail.",
    "CP1 detailed joinery and exact top trim within the approximately 30-40 mm range.",
    "CP2 right-side gap/joinery allocation, top-casing thickness and removable-door dimensions.",
    "W2 detailed frame/reveal and exact casing dimensions.",
  ],
};
output.shell.changedDuringConsolidation = false;
output.shell.statement = "Accepted A1 shell and all PO/PI/object plan coordinates copied without movement. Consolidation adds status, provenance and validation-only evidence only.";

function replaceRequired(source, search, replacement, description) {
  if (!source.match(search)) throw new Error(`SVG predecessor fragment missing: ${description}`);
  return source.replace(search, replacement);
}

function makeSvg() {
  let svg = predecessorSvg;
  svg = replaceRequired(svg, /Room C targeted vertical-evidence corrections v0\.4/g, "Room C accepted provisional baseline v1.0", "title version");
  svg = replaceRequired(svg, /<desc id="desc">[^<]*<\/desc>/, '<desc id="desc">Consolidated Room C digital-twin baseline: accepted A1 shell, corrected object and vertical evidence, and three validation-only checks. Provisionally accepted for later global reconciliation.</desc>', "drawing description");
  svg = replaceRequired(svg, /ROOM C VERTICAL-EVIDENCE CORRECTIONS · v0\.4/g, "ROOM C ACCEPTED PROVISIONAL BASELINE · v1.0", "drawing heading");
  svg = replaceRequired(svg, /v0\.3 preserved · CP1 interpretation \+ W2 vertical chain corrected · plan unchanged/g, "Accepted A1 shell + corrected object/vertical layers · validation checks retained without refit", "drawing subtitle");
  svg = replaceRequired(svg, /HUMAN REVIEW ONLY — NO GLOBAL RECONCILIATION — NO RENOVATION DESIGN/g, "PROVISIONALLY ACCEPTED FOR GLOBAL RECONCILIATION — NOT CONSTRUCTION GEOMETRY", "status banner");

  const validationStart = svg.indexOf('  <rect x="1310" y="610"');
  const localHeightStart = svg.indexOf('  <text x="1320" y="835" class="sideHead">');
  if (validationStart < 0 || localHeightStart < 0 || localHeightStart <= validationStart) throw new Error("Sidebar validation block markers missing.");
  const validationBlock = `  <rect x="1310" y="610" width="425" height="190" rx="8" class="callout"/>\n  <text x="1330" y="644" class="sideHead">Independent validation</text>\n  <text x="1330" y="675" class="sideSmall">VALID-RC-01  3668 / 3690.92 / <tspan class="good">+22.92</tspan></text>\n  <text x="1330" y="704" class="sideSmall">VALID-RC-02  4405 / 4403.74 / <tspan class="good">−1.26</tspan></text>\n  <text x="1330" y="733" class="sideSmall">VALID-RC-03  4399 / 4373.84 / <tspan class="good">−25.16</tspan></text>\n  <text x="1330" y="762" class="sideSmall">measured / model / residual mm · not fitted</text>\n\n`;
  svg = `${svg.slice(0, validationStart)}${validationBlock}${svg.slice(localHeightStart)}`;

  svg = replaceRequired(svg, /  <text x="92" y="1293"[^\n]*\n  <text x="92" y="1321"[^\n]*\n  <text x="92" y="1347"[^\n]*/, `  <text x="92" y="1293" class="side"><tspan font-weight="700">Shell consolidated unchanged:</tspan> accepted A1 and every plan-node movement = 0.00 mm.</text>\n  <text x="92" y="1321" class="side">Wall-family angle 90.854° · lower run 4168.34 mm · cross run 3691.32 mm.</text>\n  <text x="92" y="1347" class="side">PO/PI faces retained · D3/D4 casing gap 216.34 versus 218 mm (residual −1.66 mm).</text>`, "bottom baseline summary");
  svg = svg.replace("Generated 2026-08-12 · v0.3 preserved · vertical-only successor", "Generated 2026-08-12 · v0.1–v0.4 provenance preserved");
  return svg;
}

function signed(value) {
  return `${value >= 0 ? "+" : ""}${Number(value).toFixed(2)}`;
}

function makeReport() {
  const primaryRows = output.measurementFitSummary.primaryShellResiduals
    .map((row) => `| ${row.id} | ${row.from} → ${row.to} | ${Number(row.measuredMm).toFixed(2)} | ${Number(row.solvedMm).toFixed(2)} | ${signed(row.residualMm)} |`)
    .join("\n");
  const validationRows = validationOnlyObservations
    .map((row) => `| ${row.id} | ${row.physicalMeasuredMm.toFixed(2)} | ${row.modelPredictedMm.toFixed(2)} | ${signed(row.residualMm)} | ${row.targetedSurfaces.from} → ${row.targetedSurfaces.to} |`)
    .join("\n");

  return `# Room C accepted provisional baseline v1.0

**Status: PROVISIONALLY ACCEPTED FOR GLOBAL RECONCILIATION.**

This is the consolidated Room C digital-twin baseline produced from the preserved v0.1–v0.4 lineage. It is not a new solve, construction-locked geometry, survey-grade certification or final whole-flat geometry. Later shared D2/D3 closure evidence may justify small, explicitly reported adjustments.

## Geometry

- Selected shell: **A1**, copied without re-optimisation.
- Wall-family angle: **90.8536°**.
- Major permanent-envelope runs: C0 → D3-CL **4168.34 mm**; C0 → CP1-FL **3691.32 mm**.
- Indicative envelope area excluding cupboard rear depths: **15.385 m²**; this is not a certified floor area.
- Shell, PO/PI and object plan-node movement during consolidation: **0.00 mm**.

D3-CL remains the permanent turning corner. D2-CR remains a point **580 mm** along the adjoining wall and is not a corner. The obsolete straight-continuation interpretation is correction history only.

The current removable bedroom wall remains a thick L-shaped polygon with distinct outer face PO1–PO2–PO3 and inner face PI1–PI2–PI3. Outer runs are **2331.56 mm** and **2617.64 mm**; inner runs are **2202.00 mm** and **2494.00 mm**. Derived face separations are **123.64 mm** and **129.56 mm** and are not uniform-thickness survey claims.

## Measurement fit

Residual convention is **model minus measurement**. Acceptance is based on topology, residual patterns, corrected evidence and independent checks—not RMS alone.

| Observation | Relationship | Measured mm | Model mm | Residual mm |
|---|---|---:|---:|---:|
${primaryRows}

The non-zero direct shell residuals remain distributed at approximately 14–17 mm across the two known closure groups. Approximate supporting checks remain RC-15 **+20.85 mm**, RC-16 **−22.40 mm**, and RC-17 **+3.71 mm**.

Corrected RC-19 is **CP2-FR → PI3 = 2206 mm**. The model gives **2202.00 mm**, residual **−4.00 mm**. The old CP2-FL definition and approximately +111 mm conflict are superseded history, not an active concern.

The object-layer D3/D4 casing gap is **216.34 mm** against measured **218 mm**, residual **−1.66 mm**.

### Independent validation-only observations

These measurements were not used as fitting constraints.

| ID | Physical mm | Model mm | Residual mm | Surfaces |
|---|---:|---:|---:|---|
${validationRows}

VALID-RC-02 is a particularly strong long closure check. VALID-RC-03 retains caution because the CP1/rear-wall surface is physically uneven. Together the checks differ from the model by no more than 25.16 mm or about 0.63%, supporting physical credibility without justifying a refit.

## Objects

- **D2:** approximately 250 mm through-wall reveal, 770 mm structural opening and 742 × 1975 mm leaf. Room C sees the deep reveal; the closing plane is on the Room A side and opens into Room A. Through-wall depth does not extend the Room C shell chain.
- **D3:** 760 × 1987 mm leaf; casing approximately 45/80/80 mm; opens into Room C; 544 mm casing-top-to-ceiling. D3-CL is the fixed permanent corner.
- **D4:** 760 × 1987 mm leaf; 80/80/80 mm casing; opens into Room C; 567 mm casing-top-to-ceiling.
- **W2:** 1269 mm width relationship and approximately 40 mm casing. Active vertical chain is approximately 1040 + 1516 + 75 = **2631 mm**. The old approximately 700 mm clearance is superseded.
- **CP1:** 1285 × 518 mm suspended body; floor-to-body-base 1315 mm; body height 1261 mm; separate top trim approximately 30–40 mm; services area below.
- **CP2:** 708 × 536 mm body; top-to-floor 2148 mm; top-to-ceiling approximately 450 mm; approximately 20 mm left casing and top continuation; removable door remains separate. No right-side allocation is invented.

Unmeasured object detail remains explicit: exact D2 casing/rebate and hinge side; D3/D4 hinge and structural-reveal detail; CP1/CP2 joinery detail; and W2 frame/reveal detail. These are distinct from the primary Room C shell.

## Vertical geometry

Station-specific floor-to-ceiling readings remain separate: D3 **2598 mm**, D4 **2631 mm**, CP1 **2596 mm**, CP2 **2594 mm**, and PO2 **2616 mm**. The range is **37 mm** and no universal room height is inferred.

CP1's 1261 mm value is body height, not ceiling clearance; its 30–40 mm top trim is separate. W2's corrected chain totals approximately 2631 mm and lies within the local height range. None of the vertical evidence affects plan geometry.

## Evidence status and confidence

Direct and approximate measurements, architectural/topology constraints, inferred object placements, validation-only checks and superseded/corrected records remain distinctly classified in the JSON. All v0.1–v0.4 artefacts and generators are retained with SHA-256 provenance hashes.

Room C is suitable to enter global reconciliation because the corrected topology is stable, all later corrections preserved the A1 shell, RC-19 is resolved, the D3/D4 local check is strong, and three independent validations agree within approximately 26 mm. It is not professionally surveyed or construction-certified.

Material interface ambiguity for later global closure remains concentrated at D2 and D3: exact D2 Room A/Room C face registration and casing/rebate offsets; approximate 250 mm wall depth; and D3 structural-opening/reveal detail with approximate casing widths. Any global adjustment must preserve D3-CL as the corner and report coordinate/residual changes.

Stop here for human review. Do not start global reconciliation or merge branches.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  version: "1.0",
  status: output.status,
  selectedShell: "A1",
  shellChanged: false,
  maximumShellMovementMm: 0,
  validationOnlyObservations: validationOnlyObservations.map(({ id, physicalMeasuredMm, modelPredictedMm, residualMm }) => ({ id, physicalMeasuredMm, modelPredictedMm, residualMm })),
  lineageVersionsPreserved: lineage.map((entry) => entry.version),
  outputs: ["svg", "json", "md"].map((extension) => path.relative(repoRoot, path.join(outputDir, `${stem}.${extension}`))),
}, null, 2));

#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const baselineRelative = "docs/survey/derived/room-c/ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1.json";
const baselinePath = path.join(repoRoot, "docs/survey/derived/room-c/archive", path.basename(baselineRelative));
const outputDir = path.join(repoRoot, "docs/survey/derived/room-c/archive");
const stem = "ROOM_C_RECONSTRUCTION_OBJECT_INTEGRATION_v0_2";
const generatedDate = "2026-08-12";

if (!fs.existsSync(baselinePath)) throw new Error(`Accepted first-pass baseline missing: ${baselineRelative}`);
const baseline = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
if (baseline.selection?.selectedSolutionId !== "A1") throw new Error("Expected accepted first-pass A1 geometry.");

const baselineNodes = Object.fromEntries(Object.entries(baseline.selectedGeometry.nodesMm).map(([id, point]) => [id, [point.x, point.y]]));
for (const id of ["C0", "C1", "C2", "W2-CR", "W2-CL", "D4-CR", "D3-CL", "D2-CR", "CP1-FL", "PO1", "PO2", "PO3", "PI1", "PI2", "PI3", "CP2-FL", "CP2-FR"]) {
  if (!baselineNodes[id]) throw new Error(`Baseline node missing: ${id}`);
}

const round = (value, digits = 2) => { const factor = 10 ** digits; return Math.round(value * factor) / factor; };
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, scalar) => [a[0] * scalar, a[1] * scalar];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const unit = (a) => { const length = Math.hypot(a[0], a[1]); return [a[0] / length, a[1] / length]; };
const along = unit(sub(baselineNodes["D3-CL"], baselineNodes.C0));
const down = unit(sub(baselineNodes.PO2, baselineNodes.PO1));
const outward = [down[1], -down[0]];

const objectEvidence = {
  source: "Room C Object Survey – Field Measurement Handover for Codex (12 August 2026), supplied in the task attachment",
  supersession: "The handover's stale straight D3-CL to D2-CR sentence is rejected. The corrected node register and accepted v0.1 baseline remain topology authority.",
  CP1: {
    body: {
      widthMm: { value: 1285, class: "direct" },
      depthMm: { value: 518, class: "direct", supersedesMm: 523 },
      ceilingToTopMm: { value: 1261, class: "direct", axis: "vertical" },
      bottomToFinishedFloorMm: { value: 1315, class: "direct", axis: "vertical" },
    },
    casing: { recorded: false },
    interpretation: "Mid-air suspended cupboard; constant 518 mm body depth for this pass; editable object layer.",
  },
  CP2: {
    body: {
      widthMm: { value: 708, class: "direct" },
      depthMm: { value: 536, class: "direct" },
      topToFinishedFloorMm: { value: 2148, class: "direct", axis: "vertical" },
      topToCeilingMm: { value: 450, class: "approximate", axis: "vertical" },
    },
    casing: {
      viewerLeftVerticalMm: { value: 20, class: "approximate" },
      continuesAcrossTop: true,
      topThicknessMm: null,
    },
    removableDoor: { removableForRenovation: true, dimensionsMm: null },
    interpretation: "Cupboard body, casing and removable door remain distinct layers.",
  },
  D2: {
    structuralWallDepthMm: { value: 250, class: "direct", axis: "plan/reveal depth" },
    structuralOpeningWidthMm: { value: 770, class: "direct" },
    visibleClosedLeafWidthMm: { value: 742, class: "direct" },
    visibleClosedLeafHeightMm: { value: 1975, class: "direct", axis: "vertical" },
    swing: "opens into Room A",
    casing: { evidenced: true, dimensionsMm: null },
    viewerRightLip: { exists: true, dimensionsMm: null, importance: "minor" },
  },
  D3: {
    visibleClosedLeafWidthMm: { value: 760, class: "direct" },
    visibleClosedLeafHeightMm: { value: 1987, class: "direct", axis: "vertical" },
    casingLeftMm: { value: 45, class: "approximate" },
    casingRightMm: { value: 80, class: "approximate" },
    casingTopMm: { value: 80, class: "approximate", axis: "vertical" },
    topCasingToCeilingMm: { value: 544, class: "direct", axis: "vertical" },
    swing: "opens into Room C",
    topology: "D3-CL is the permanent turning corner and the casing endpoint directly abuts it.",
  },
  D4: {
    visibleClosedLeafWidthMm: { value: 760, class: "direct" },
    visibleClosedLeafHeightMm: { value: 1987, class: "direct", axis: "vertical" },
    casingLeftMm: { value: 80, class: "direct" },
    casingRightMm: { value: 80, class: "direct" },
    casingTopMm: { value: 80, class: "direct", axis: "vertical" },
    topCasingToCeilingMm: { value: 567, class: "direct", axis: "vertical" },
    swing: "opens into Room C",
  },
  W2: {
    openingWidthMm: { value: 1269, class: "direct" },
    openingHeightMm: { value: 1515, class: "direct", axis: "vertical" },
    bottomOpeningToFinishedFloorMm: { value: 1060, class: "approximate", axis: "vertical" },
    topOpeningToCeilingMm: { value: 700, class: "approximate", axis: "vertical" },
    casingAllSidesMm: { value: 40, class: "approximate" },
    interpretation: "Opening is retained accurately; existing assembly is deliberately low detail because replacement is anticipated.",
  },
};

const objectNodes = {};

// CP1: the measured body starts at retained CP1-FL; the new width updates the body-right object point only.
objectNodes["CP1-BODY-FL"] = baselineNodes["CP1-FL"];
objectNodes["CP1-BODY-FR"] = add(objectNodes["CP1-BODY-FL"], mul(along, objectEvidence.CP1.body.widthMm.value));
objectNodes["CP1-BODY-BL"] = sub(objectNodes["CP1-BODY-FL"], mul(down, objectEvidence.CP1.body.depthMm.value));
objectNodes["CP1-BODY-BR"] = sub(objectNodes["CP1-BODY-FR"], mul(down, objectEvidence.CP1.body.depthMm.value));

// CP2: CP2-FL/FR remain inherited outer-footprint references. The 20 mm left casing is outside the 708 mm body.
objectNodes["CP2-CASING-FL"] = baselineNodes["CP2-FL"];
objectNodes["CP2-BODY-FL"] = add(objectNodes["CP2-CASING-FL"], mul(along, objectEvidence.CP2.casing.viewerLeftVerticalMm.value));
objectNodes["CP2-BODY-FR"] = add(objectNodes["CP2-BODY-FL"], mul(along, objectEvidence.CP2.body.widthMm.value));
objectNodes["CP2-BODY-BL"] = sub(objectNodes["CP2-BODY-FL"], mul(down, objectEvidence.CP2.body.depthMm.value));
objectNodes["CP2-BODY-BR"] = sub(objectNodes["CP2-BODY-FR"], mul(down, objectEvidence.CP2.body.depthMm.value));

// D4 is anchored by measured D4-CR placement and its complete measured casing/leaf span.
const d4OuterSpanMm = objectEvidence.D4.casingLeftMm.value + objectEvidence.D4.visibleClosedLeafWidthMm.value + objectEvidence.D4.casingRightMm.value;
objectNodes["D4-OUTER-R"] = baselineNodes["D4-CR"];
objectNodes["D4-OUTER-L"] = add(objectNodes["D4-OUTER-R"], mul(along, d4OuterSpanMm));
objectNodes["D4-LEAF-R"] = add(objectNodes["D4-OUTER-R"], mul(along, objectEvidence.D4.casingRightMm.value));
objectNodes["D4-LEAF-L"] = add(objectNodes["D4-LEAF-R"], mul(along, objectEvidence.D4.visibleClosedLeafWidthMm.value));

// D3 is anchored at the corrected D3-CL turning corner and runs back toward D4.
const d3OuterSpanMm = objectEvidence.D3.casingLeftMm.value + objectEvidence.D3.visibleClosedLeafWidthMm.value + objectEvidence.D3.casingRightMm.value;
objectNodes["D3-OUTER-L-CORNER"] = baselineNodes["D3-CL"];
objectNodes["D3-OUTER-R"] = sub(objectNodes["D3-OUTER-L-CORNER"], mul(along, d3OuterSpanMm));
objectNodes["D3-LEAF-L"] = sub(objectNodes["D3-OUTER-L-CORNER"], mul(along, objectEvidence.D3.casingLeftMm.value));
objectNodes["D3-LEAF-R"] = sub(objectNodes["D3-LEAF-L"], mul(along, objectEvidence.D3.visibleClosedLeafWidthMm.value));

// D2: D2-CR remains the placement anchor. The structural-opening top is inferred because casing offsets were not measured.
objectNodes["D2-OPENING-R"] = baselineNodes["D2-CR"];
objectNodes["D2-OPENING-L-INFERRED"] = sub(objectNodes["D2-OPENING-R"], mul(down, objectEvidence.D2.structuralOpeningWidthMm.value));
objectNodes["D2-LEAF-R-INFERRED"] = sub(objectNodes["D2-OPENING-R"], mul(down, (objectEvidence.D2.structuralOpeningWidthMm.value - objectEvidence.D2.visibleClosedLeafWidthMm.value) / 2));
objectNodes["D2-LEAF-L-INFERRED"] = sub(objectNodes["D2-LEAF-R-INFERRED"], mul(down, objectEvidence.D2.visibleClosedLeafWidthMm.value));
objectNodes["D2-A-FACE-R"] = add(objectNodes["D2-OPENING-R"], mul(outward, objectEvidence.D2.structuralWallDepthMm.value));
objectNodes["D2-A-FACE-L"] = add(objectNodes["D2-OPENING-L-INFERRED"], mul(outward, objectEvidence.D2.structuralWallDepthMm.value));

const objectChecks = [
  {
    id: "OBJ-CHECK-CP1-RC04",
    description: "Updated CP1 body-right point to PO1 versus inherited RC-04",
    measuredMm: 225,
    solvedMm: distance(objectNodes["CP1-BODY-FR"], baselineNodes.PO1),
    residualMm: distance(objectNodes["CP1-BODY-FR"], baselineNodes.PO1) - 225,
    evidenceClass: "direct placement check",
    treatment: "validation only; shell unchanged",
  },
  {
    id: "OBJ-CHECK-D3-D4-RC09",
    description: "D3 outer casing to D4 outer casing wall gap versus RC-09",
    measuredMm: 218,
    solvedMm: distance(objectNodes["D3-OUTER-R"], objectNodes["D4-OUTER-L"]),
    residualMm: distance(objectNodes["D3-OUTER-R"], objectNodes["D4-OUTER-L"]) - 218,
    evidenceClass: "direct placement check using new casing spans",
    treatment: "validation only; shell unchanged",
  },
  {
    id: "OBJ-CHECK-CP2-FOOTPRINT-BALANCE",
    description: "Inherited CP2-FL/FR footprint span less 708 mm body and approximately 20 mm left casing",
    measuredMm: distance(baselineNodes["CP2-FL"], baselineNodes["CP2-FR"]),
    solvedMm: objectEvidence.CP2.body.widthMm.value + objectEvidence.CP2.casing.viewerLeftVerticalMm.value,
    residualMm: (objectEvidence.CP2.body.widthMm.value + objectEvidence.CP2.casing.viewerLeftVerticalMm.value) - distance(baselineNodes["CP2-FL"], baselineNodes["CP2-FR"]),
    evidenceClass: "mixed direct / approximate interpretation check",
    treatment: "27 mm remains unallocated; no right casing or gap dimension invented",
  },
];
const d3D4PlacementCheck = objectChecks.find((check) => check.id === "OBJ-CHECK-D3-D4-RC09");

const rc19Baseline = baseline.observationResiduals.find((row) => row.id === "RC-19");
if (!rc19Baseline) throw new Error("RC-19 missing from accepted baseline residual record.");
const rc19BodyEdgeDistance = distance(objectNodes["CP2-BODY-FL"], baselineNodes.PI3);
const rc19Review = {
  rawObservation: { id: "RC-19", from: "CP2-FL", to: "PI3", measuredMm: 2206 },
  acceptedBaselineSolvedMm: rc19Baseline.solvedMm,
  acceptedBaselineResidualMm: rc19Baseline.residualMm,
  usedInShellFit: false,
  newCP2Evidence: {
    inheritedOuterFootprintSpanMm: round(distance(baselineNodes["CP2-FL"], baselineNodes["CP2-FR"]), 2),
    measuredBodyWidthMm: 708,
    approximateLeftCasingMm: 20,
    remainingUnallocatedAcrossInheritedFootprintMm: round(distance(baselineNodes["CP2-FL"], baselineNodes["CP2-FR"]) - 708 - 20, 2),
    alternativeDistanceIfCP2EndpointWereBodyLeftMm: round(rc19BodyEdgeDistance, 2),
    alternativeResidualIfCP2EndpointWereBodyLeftMm: round(rc19BodyEdgeDistance - 2206, 2),
  },
  conclusion: "Partially clarifies endpoint layering but does not resolve RC-19. The known approximately 20 mm left casing can reduce the diagonal discrepancy by only about 6 mm under the body-edge alternative; more than 100 mm remains. The raw observation stays held out and unresolved.",
};

const shellNodeIds = ["C0", "C1", "C2", "W2-CR", "W2-CL", "D4-CR", "D3-CL", "D2-CR", "CP1-FL", "PO1", "PO2", "PO3", "PI1", "PI2", "PI3", "CP2-FL", "CP2-FR"];
const shellComparison = Object.fromEntries(shellNodeIds.map((id) => [id, {
  baselineMm: { x: baselineNodes[id][0], y: baselineNodes[id][1] },
  updatedMm: { x: baselineNodes[id][0], y: baselineNodes[id][1] },
  movementMm: 0,
}]));

const updatedObjectStations = {
  "CP1-FR": {
    previousV01Mm: { x: baselineNodes["CP1-FR"][0], y: baselineNodes["CP1-FR"][1] },
    updatedV02Mm: { x: round(objectNodes["CP1-BODY-FR"][0], 2), y: round(objectNodes["CP1-BODY-FR"][1], 2) },
    movementMm: round(distance(baselineNodes["CP1-FR"], objectNodes["CP1-BODY-FR"]), 2),
    reason: "Replaced provisional CP1 width with direct 1285 mm body width; this is an object-point update, not shell movement.",
  },
  "D4-CL": {
    previousV01Mm: { x: baselineNodes["D4-CL"][0], y: baselineNodes["D4-CL"][1] },
    updatedV02Mm: { x: round(objectNodes["D4-OUTER-L"][0], 2), y: round(objectNodes["D4-OUTER-L"][1], 2) },
    movementMm: round(distance(baselineNodes["D4-CL"], objectNodes["D4-OUTER-L"]), 2),
    reason: "Replaced v0.1 equal-split display gauge with measured 760 + 80 + 80 mm D4 object span.",
  },
  "D3-CR": {
    previousV01Mm: { x: baselineNodes["D3-CR"][0], y: baselineNodes["D3-CR"][1] },
    updatedV02Mm: { x: round(objectNodes["D3-OUTER-R"][0], 2), y: round(objectNodes["D3-OUTER-R"][1], 2) },
    movementMm: round(distance(baselineNodes["D3-CR"], objectNodes["D3-OUTER-R"]), 2),
    reason: "Replaced v0.1 equal-split display gauge with measured 760 mm leaf plus approximate 45/80 mm casing span.",
  },
};

const verticalObservations = [
  ["CP1-V01", "CP1", "ceiling to cupboard top", 1261, "direct"],
  ["CP1-V02", "CP1", "cupboard bottom to finished floor", 1315, "direct"],
  ["CP2-V01", "CP2", "cupboard top to finished floor", 2148, "direct"],
  ["CP2-V02", "CP2", "cupboard top to ceiling", 450, "approximate"],
  ["D2-V01", "D2", "visible closed leaf height", 1975, "direct"],
  ["D3-V01", "D3", "visible closed leaf height", 1987, "direct"],
  ["D3-V02", "D3", "top casing to ceiling", 544, "direct"],
  ["D3-V03", "D3", "upper casing", 80, "approximate"],
  ["D4-V01", "D4", "visible closed leaf height", 1987, "direct"],
  ["D4-V02", "D4", "top casing to ceiling", 567, "direct"],
  ["D4-V03", "D4", "upper casing", 80, "direct"],
  ["W2-V01", "W2", "opening height", 1515, "direct"],
  ["W2-V02", "W2", "bottom opening to finished floor", 1060, "approximate"],
  ["W2-V03", "W2", "top opening to ceiling", 700, "approximate"],
].map(([id, object, description, measuredMm, evidenceClass]) => ({ id, object, description, measuredMm, evidenceClass, affectsPlanGeometry: false }));

const output = {
  documentType: "derived Room C v0.2 object-layer integration - not source evidence",
  version: "0.2",
  generatedDate,
  status: "proposal for human visual review; accepted v0.1 shell retained exactly",
  baseline: baselineRelative,
  governingTopology: "Corrected D3-CL turning-corner topology from the active node map/register and accepted first-pass baseline.",
  objectEvidence,
  layerModel: [
    "permanent finished-wall shell",
    "structural opening",
    "reveal/wall depth",
    "casing/architrave",
    "door leaf/window",
    "cupboard body",
    "cupboard casing/joinery/removable door",
  ],
  shell: {
    changedFromV01: false,
    statement: "No accepted first-pass shell or PO/PI partition node moved. Object evidence is integrated as separate geometry and validation checks.",
    coordinateComparison: shellComparison,
    inheritedObservationResiduals: baseline.observationResiduals,
  },
  planGeometry: {
    axes: { alongWall: { x: round(along[0], 8), y: round(along[1], 8) }, adjoiningWall: { x: round(down[0], 8), y: round(down[1], 8) }, structuralWallOutwardTowardRoomA: { x: round(outward[0], 8), y: round(outward[1], 8) } },
    inheritedNodesMm: Object.fromEntries(Object.entries(baselineNodes).map(([id, point]) => [id, { x: point[0], y: point[1] }])),
    objectNodesMm: Object.fromEntries(Object.entries(objectNodes).map(([id, point]) => [id, { x: round(point[0], 2), y: round(point[1], 2) }])),
    updatedObjectStations,
    D2StructuralOpeningPlacement: {
      anchoringAssumption: "For plan display, the viewer-right structural-opening boundary is placed at D2-CR. The casing-to-structure offset was not measured, so the opposite opening endpoint and centred 14 mm leaf clearances are inferred, not formal node replacements.",
      wallDepthMm: 250,
      openingWidthMm: 770,
      leafWidthMm: 742,
      inferredClearanceEachEndMm: 14,
    },
  },
  objectPlacementChecks: objectChecks.map((check) => ({ ...check, solvedMm: round(check.solvedMm, 2), residualMm: round(check.residualMm, 2) })),
  verticalObservations,
  independentCeilingRelationship: { D3TopCasingToCeilingMm: 544, D4TopCasingToCeilingMm: 567, differenceMm: 23, treatment: "Preserved independently; not averaged and does not affect plan geometry." },
  RC19Review: rc19Review,
  unresolved: [
    "D2 casing dimensions, exact casing-to-structural-opening offset, hinge side and minor right lip dimension.",
    "D3 and D4 hinge sides and structural-opening dimensions; only leaf/casing extents and swing destination are known.",
    "CP1 body height and detailed joinery/casing.",
    "CP2 top-casing thickness, right-side joinery/gap allocation, removable-door dimensions and internal construction.",
    "W2 frame/reveal detail beyond the measured opening and approximate 40 mm casing.",
    "RC-19 remains unresolved and held out of the shell fit.",
  ],
};

function escapeXml(value) { return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }

function makeSvg() {
  const allPoints = [...Object.values(baselineNodes), ...Object.values(objectNodes)];
  const minX = Math.min(...allPoints.map((point) => point[0])) - 300;
  const maxX = Math.max(...allPoints.map((point) => point[0])) + 450;
  const minY = Math.min(...allPoints.map((point) => point[1])) - 250;
  const maxY = Math.max(...allPoints.map((point) => point[1])) + 260;
  const box = { x: 55, y: 215, width: 1200, height: 1040 };
  const scale = Math.min(box.width / (maxX - minX), box.height / (maxY - minY));
  const pt = (idOrPoint) => {
    const point = typeof idOrPoint === "string" ? (objectNodes[idOrPoint] || baselineNodes[idOrPoint]) : idOrPoint;
    return [box.x + (point[0] - minX) * scale, box.y + (point[1] - minY) * scale];
  };
  const pstr = (point) => point.map((value) => round(value, 1)).join(",");
  const line = (a, b, cls) => { const x = pt(a), y = pt(b); return `<line x1="${round(x[0], 1)}" y1="${round(x[1], 1)}" x2="${round(y[0], 1)}" y2="${round(y[1], 1)}" class="${cls}"/>`; };
  const poly = (ids, cls) => `<polygon points="${ids.map((id) => pstr(pt(id))).join(" ")}" class="${cls}"/>`;
  const circle = (id, cls = "perm") => { const p = pt(id); return `<circle cx="${round(p[0], 1)}" cy="${round(p[1], 1)}" r="7" class="${cls}"/>`; };
  const diamond = (id, cls = "objectNode") => { const p = pt(id); return `<path d="M${round(p[0], 1)} ${round(p[1] - 7, 1)} L${round(p[0] + 7, 1)} ${round(p[1], 1)} L${round(p[0], 1)} ${round(p[1] + 7, 1)} L${round(p[0] - 7, 1)} ${round(p[1], 1)} Z" class="${cls}"/>`; };
  const square = (id) => { const p = pt(id); return `<rect x="${round(p[0] - 6, 1)}" y="${round(p[1] - 6, 1)}" width="12" height="12" class="studNode"/>`; };
  const label = (id, dx, dy, text, cls = "label", anchor = "start") => { const p = pt(id); return `<text x="${round(p[0] + dx, 1)}" y="${round(p[1] + dy, 1)}" class="${cls}" text-anchor="${anchor}">${escapeXml(text)}</text>`; };

  const d2Band = [objectNodes["D2-OPENING-L-INFERRED"], objectNodes["D2-OPENING-R"], objectNodes["D2-A-FACE-R"], objectNodes["D2-A-FACE-L"]];
  const wallStart = baselineNodes["D3-CL"];
  const wallEnd = baselineNodes["CP2-FR"];
  const wallStartA = add(wallStart, mul(outward, 250));
  const wallEndA = add(wallEnd, mul(outward, 250));
  const wallBand = [wallEnd, wallStart, wallStartA, wallEndA];
  const d2Mid = mul(add(objectNodes["D2-OPENING-L-INFERRED"], objectNodes["D2-OPENING-R"]), 0.5);
  const d2ArrowEnd = add(d2Mid, mul(outward, 190));

  const cp1Move = updatedObjectStations["CP1-FR"].movementMm;
  const d3Move = updatedObjectStations["D3-CR"].movementMm;
  const d4Move = updatedObjectStations["D4-CL"].movementMm;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1800" height="1450" viewBox="0 0 1800 1450" role="img" aria-labelledby="title desc">
  <title id="title">Room C object-layer integration v0.2</title>
  <desc id="desc">Accepted first-pass Room C shell and thick stud partition with measured CP1, CP2, D2, D3, D4 and W2 object layers. Shell unchanged. Human review only.</desc>
  <defs><style>
    .page{fill:#fff;stroke:#0f172a;stroke-width:3}.panel{fill:#f8fafc;stroke:#94a3b8;stroke-width:2}.head{font:700 34px Arial,sans-serif;fill:#0f172a}.sub{font:19px Arial,sans-serif;fill:#334155}.warn{font:700 18px Arial,sans-serif;fill:#9f1239}.wall{stroke:#1e293b;stroke-width:9;stroke-linecap:square}.structFace{stroke:#b91c1c;stroke-width:8}.wallBand{fill:#fee2e2;stroke:#b91c1c;stroke-width:2}.openingCut{fill:#fff;stroke:#0f766e;stroke-width:3}.opening{stroke:#0f766e;stroke-width:13}.leaf{stroke:#166534;stroke-width:8}.casing{stroke:#d97706;stroke-width:16}.casingApprox{stroke:#d97706;stroke-width:16;stroke-dasharray:9 6}.window{stroke:#0284c7;stroke-width:11}.windowCasing{stroke:#d97706;stroke-width:20}.cupBody{fill:#fef3c7;stroke:#a16207;stroke-width:3}.cupDoor{fill:#fde68a;stroke:#a16207;stroke-width:2;stroke-dasharray:7 5}.cupCasing{fill:#fed7aa;stroke:#c2410c;stroke-width:2}.partition{fill:#e9d5ff;stroke:#7e22ce;stroke-width:4}.shellFill{fill:#eff6ff}.bedroomFill{fill:#faf5ff}.perm{fill:#fff;stroke:#0f172a;stroke-width:3}.objectNode{fill:#fffbeb;stroke:#d97706;stroke-width:3}.studNode{fill:#faf5ff;stroke:#7e22ce;stroke-width:3}.label{font:700 14px Arial,sans-serif;fill:#0f172a}.objectLabel{font:700 14px Arial,sans-serif;fill:#9a3412}.studLabel{font:700 14px Arial,sans-serif;fill:#7e22ce}.tiny{font:13px Arial,sans-serif;fill:#475569}.room{font:700 23px Arial,sans-serif;fill:#1e3a8a}.sideHead{font:700 22px Arial,sans-serif;fill:#0f172a}.side{font:16px Arial,sans-serif;fill:#1f2937}.sideSmall{font:14px Arial,sans-serif;fill:#334155}.callout{fill:#fff7ed;stroke:#d97706;stroke-width:2}.good{fill:#166534;font-weight:700}.bad{fill:#b91c1c;font-weight:700}.arrow{stroke:#166534;stroke-width:3;marker-end:url(#arrow)}
  </style><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="#166534"/></marker></defs>
  <rect x="15" y="15" width="1770" height="1420" rx="12" class="page"/>
  <text x="55" y="68" class="head">ROOM C SHELL + OBJECT LAYERS · v0.2</text>
  <text x="55" y="103" class="sub">Accepted v0.1 shell retained · CP1 / CP2 / D2 / D3 / D4 / W2 integrated from 12 August object survey</text>
  <text x="55" y="137" class="warn">HUMAN REVIEW ONLY — NO GLOBAL RECONCILIATION — NO RENOVATION DESIGN</text>
  <rect x="42" y="170" width="1230" height="1215" rx="12" class="panel"/>
  <rect x="1290" y="170" width="465" height="1215" rx="12" class="panel"/>

  ${poly(["C0", "CP1-FL", "CP2-FR", "D3-CL"], "shellFill")}
  ${poly(["PI1", "CP2-FR", "PI3", "PI2"], "bedroomFill")}
  ${poly(["PO1", "PO2", "PO3", "PI3", "PI2", "PI1"], "partition")}

  ${poly([wallEnd, wallStart, wallStartA, wallEndA], "wallBand")}
  ${poly(d2Band, "openingCut")}
  ${line("C0", "CP1-FL", "wall")}${line("CP1-FL", "PO1", "wall")}${line("PI1", "CP2-FL", "wall")}${line("CP2-FR", "D3-CL", "structFace")}
  ${line("C0", "C1", "wall")}${line("C1", "W2-CR", "wall")}${line("W2-CL", "C2", "wall")}${line("C2", "D4-CR", "wall")}

  ${poly(["CP1-BODY-FL", "CP1-BODY-FR", "CP1-BODY-BR", "CP1-BODY-BL"], "cupBody")}
  ${line("CP1-BODY-FL", "CP1-BODY-FR", "cupDoor")}
  ${poly(["CP2-BODY-FL", "CP2-BODY-FR", "CP2-BODY-BR", "CP2-BODY-BL"], "cupBody")}
  ${poly(["CP2-CASING-FL", "CP2-BODY-FL", "CP2-BODY-BL", sub(objectNodes["CP2-BODY-BL"], mul(along, 20))], "cupCasing")}
  ${line("CP2-BODY-BL", "CP2-BODY-BR", "casingApprox")}
  ${line("CP2-BODY-FL", "CP2-BODY-FR", "cupDoor")}

  ${line(add(baselineNodes["W2-CR"], mul(along, -40)), add(baselineNodes["W2-CL"], mul(along, 40)), "windowCasing")}
  ${line("W2-CR", "W2-CL", "window")}

  ${line("D4-OUTER-R", "D4-OUTER-L", "casing")}${line("D4-LEAF-R", "D4-LEAF-L", "leaf")}
  ${line("D4-OUTER-L", "D3-OUTER-R", "wall")}
  ${line("D3-OUTER-R", "D3-OUTER-L-CORNER", "casingApprox")}${line("D3-LEAF-R", "D3-LEAF-L", "leaf")}

  ${line("D2-OPENING-L-INFERRED", "D2-OPENING-R", "opening")}${line("D2-LEAF-L-INFERRED", "D2-LEAF-R-INFERRED", "leaf")}
  ${line(d2Mid, d2ArrowEnd, "arrow")}

  ${["C0", "C1", "C2", "D3-CL"].map((id) => circle(id)).join("")}
  ${["CP1-FL", "CP2-FL", "CP2-FR", "W2-CR", "W2-CL", "D4-CR", "D2-CR"].map((id) => diamond(id)).join("")}
  ${["PO1", "PO2", "PO3", "PI1", "PI2", "PI3"].map((id) => square(id)).join("")}
  ${diamond("CP1-BODY-FR")}${diamond("D4-OUTER-L")}${diamond("D3-OUTER-R")}

  ${label("C0", -10, 24, "C0", "label", "end")}${label("C1", -6, -14, "C1", "label", "end")}${label("C2", 7, -14, "C2")}
  ${label("CP1-FL", -8, 23, "CP1-FL", "objectLabel", "end")}${label("CP1-BODY-FR", 8, 23, "CP1-FR", "objectLabel")}
  ${label("CP2-FL", -8, 23, "CP2-FL", "objectLabel", "end")}${label("CP2-FR", -8, 23, "CP2-FR outer ref", "objectLabel", "end")}
  ${label("W2-CR", -7, 25, "W2-CR", "objectLabel", "end")}${label("W2-CL", 7, 25, "W2-CL", "objectLabel")}
  ${label("D4-CR", -7, -14, "D4-CR", "objectLabel", "end")}${label("D4-OUTER-L", -7, 26, "D4-CL", "objectLabel", "end")}
  ${label("D3-OUTER-R", 7, 26, "D3-CR", "objectLabel")}${label("D3-CL", -8, -15, "D3-CL · TURNING CORNER", "objectLabel", "end")}
  ${label("D2-CR", -12, 5, "D2-CR", "objectLabel", "end")}
  ${label("PO1", -8, -13, "PO1", "studLabel", "end")}${label("PI1", 8, -13, "PI1", "studLabel")}${label("PO2", -8, 24, "PO2", "studLabel", "end")}${label("PI2", 8, -13, "PI2", "studLabel")}${label("PO3", 8, 24, "PO3", "studLabel")}${label("PI3", 8, -13, "PI3", "studLabel")}

  <text x="${round(pt([1900, -700])[0], 1)}" y="${round(pt([1900, -700])[1], 1)}" class="room" text-anchor="middle">OPEN ROOM C</text>
  <text x="${round(pt([3000, -2750])[0], 1)}" y="${round(pt([3000, -2750])[1], 1)}" class="room" text-anchor="middle">CURRENT BEDROOM</text>
  <text x="${round(pt([3000, -2750])[0], 1)}" y="${round(pt([3000, -2750])[1] + 23, 1)}" class="tiny" text-anchor="middle">existing PO/PI stud partition retained</text>
  <text x="${round(pt(d2ArrowEnd)[0] + 8, 1)}" y="${round(pt(d2ArrowEnd)[1] - 5, 1)}" class="tiny">D2 opens into Room A</text>
  <text x="${round(pt(d2Mid)[0] - 16, 1)}" y="${round(pt(d2Mid)[1] + 20, 1)}" class="tiny" text-anchor="end">250 mm wall depth</text>
  <text x="${round(pt(d2Mid)[0] - 16, 1)}" y="${round(pt(d2Mid)[1] + 39, 1)}" class="tiny" text-anchor="end">770 opening · 742 leaf</text>

  <rect x="72" y="1265" width="1150" height="92" rx="8" class="callout"/>
  <text x="92" y="1293" class="side"><tspan font-weight="700">Shell unchanged:</tspan> every accepted v0.1 shell and PO/PI node movement = 0.00 mm.</text>
  <text x="92" y="1321" class="side">Object stations replace v0.1 display/provisional points: CP1-FR ${cp1Move} mm; D4-CL ${d4Move} mm; D3-CR ${d3Move} mm.</text>
  <text x="92" y="1347" class="side">D3/D4 casing-derived gap = ${round(d3D4PlacementCheck.solvedMm, 2)} mm versus RC-09 218 mm (residual ${round(d3D4PlacementCheck.residualMm, 2)} mm).</text>

  <text x="1320" y="215" class="sideHead">Measured object layers</text>
  <text x="1320" y="250" class="side"><tspan font-weight="700">CP1 body</tspan> 1285 × 518</text><text x="1320" y="274" class="sideSmall">suspended · no casing measured</text>
  <text x="1320" y="310" class="side"><tspan font-weight="700">CP2 body</tspan> 708 × 536</text><text x="1320" y="334" class="sideSmall">~20 left casing + top casing separate</text>
  <text x="1320" y="370" class="side"><tspan font-weight="700">D2</tspan> 250 wall · 770 opening · 742 leaf</text><text x="1320" y="394" class="sideSmall">leaf height 1975 · opens into Room A</text>
  <text x="1320" y="430" class="side"><tspan font-weight="700">D3</tspan> leaf 760 × 1987</text><text x="1320" y="454" class="sideSmall">casing ~45 / ~80 / ~80 · opens into C</text>
  <text x="1320" y="490" class="side"><tspan font-weight="700">D4</tspan> leaf 760 × 1987</text><text x="1320" y="514" class="sideSmall">casing 80 / 80 / 80 · opens into C</text>
  <text x="1320" y="550" class="side"><tspan font-weight="700">W2 opening</tspan> 1269 × 1515</text><text x="1320" y="574" class="sideSmall">~40 casing · vertical offsets approximate</text>

  <rect x="1310" y="610" width="425" height="210" rx="8" class="callout"/>
  <text x="1330" y="644" class="sideHead">RC-19 remains unresolved</text>
  <text x="1330" y="675" class="side">Baseline residual: <tspan class="bad">+${rc19Review.acceptedBaselineResidualMm} mm</tspan></text>
  <text x="1330" y="704" class="side">CP2 body + known left casing explains</text>
  <text x="1330" y="729" class="side">part of the 755 mm footprint span, but</text>
  <text x="1330" y="754" class="side">leaves ${rc19Review.newCP2Evidence.remainingUnallocatedAcrossInheritedFootprintMm} mm unallocated.</text>
  <text x="1330" y="784" class="side">Body-edge alternative residual: <tspan class="bad">+${rc19Review.newCP2Evidence.alternativeResidualIfCP2EndpointWereBodyLeftMm} mm</tspan></text>

  <text x="1320" y="865" class="sideHead">Independent vertical evidence</text>
  <text x="1320" y="898" class="side">D3 casing top → ceiling: <tspan font-weight="700">544 mm</tspan></text>
  <text x="1320" y="926" class="side">D4 casing top → ceiling: <tspan font-weight="700">567 mm</tspan></text>
  <text x="1320" y="954" class="side">Difference retained: <tspan font-weight="700">23 mm</tspan></text>
  <text x="1320" y="982" class="sideSmall">Not averaged; no plan-coordinate effect.</text>

  <text x="1320" y="1030" class="sideHead">Layer key</text>
  <line x1="1320" y1="1060" x2="1350" y2="1060" class="wall"/><text x="1370" y="1066" class="side">permanent finished wall</text>
  <rect x="1318" y="1082" width="34" height="18" class="wallBand"/><text x="1370" y="1097" class="side">250 mm structural wall band</text>
  <line x1="1320" y1="1127" x2="1350" y2="1127" class="opening"/><text x="1370" y="1133" class="side">structural opening</text>
  <line x1="1320" y1="1162" x2="1350" y2="1162" class="casing"/><text x="1370" y="1168" class="side">casing / architrave</text>
  <line x1="1320" y1="1197" x2="1350" y2="1197" class="leaf"/><text x="1370" y="1203" class="side">leaf / window layer</text>
  <rect x="1318" y="1220" width="34" height="20" class="cupBody"/><text x="1370" y="1236" class="side">cupboard body</text>
  <rect x="1318" y="1254" width="34" height="20" class="cupCasing"/><text x="1370" y="1270" class="side">cupboard casing/joinery</text>
  <text x="1320" y="1320" class="sideSmall">Plan orientation is a drawing gauge, not site north.</text>
  <text x="1320" y="1347" class="sideSmall">Generated ${generatedDate} · data-driven successor script</text>
</svg>`;
}

function makeReport() {
  const checks = output.objectPlacementChecks.map((check) => `| ${check.id} | ${check.measuredMm.toFixed(2)} | ${check.solvedMm.toFixed(2)} | ${check.residualMm >= 0 ? "+" : ""}${check.residualMm.toFixed(2)} | ${check.treatment} |`).join("\n");
  return `# Room C reconstruction — object integration v0.2

Status: **proposal for human visual review; accepted first-pass shell retained exactly**.

This pass adds the 12 August 2026 object survey to the accepted Room C v0.1 shell. It does not restart the shell solve, perform global flat reconciliation, or propose renovation geometry.

## Shell

The accepted first-pass shell **did not change**. Every retained shell and PO/PI partition coordinate has movement **0.00 mm**. D3-CL remains the permanent turning corner; D2-CR remains 580 mm along its adjoining wall.

Three former provisional/display object stations changed without moving shell geometry:

- CP1-FR moved ${updatedObjectStations["CP1-FR"].movementMm.toFixed(2)} mm to apply the direct 1285 mm CP1 body width.
- D4-CL moved ${updatedObjectStations["D4-CL"].movementMm.toFixed(2)} mm from the v0.1 equal-split display gauge to the measured 920 mm casing/leaf span.
- D3-CR moved ${updatedObjectStations["D3-CR"].movementMm.toFixed(2)} mm from the v0.1 equal-split display gauge to the 885 mm approximate casing/leaf span anchored at the D3-CL corner.

The resulting D3-to-D4 wall gap is ${round(d3D4PlacementCheck.solvedMm, 2)} mm versus RC-09 = 218 mm, residual ${round(d3D4PlacementCheck.residualMm, 2)} mm. This validates the new object placements without shell adjustment.

## Objects

### CP1

- **Applied/measured:** 1285 mm body width; 518 mm constant body depth, superseding 523 mm; ceiling-to-top 1261 mm; bottom-to-finished-floor 1315 mm.
- **Interpretation:** suspended mid-air cupboard; editable body layer.
- **Approximate:** none of the applied body dimensions.
- **Inferred:** the plan footprint projects outward from the retained CP1-FL wall relationship.
- **Unmeasured:** body height, casing and detailed joinery.
- **Conflict retained:** the updated CP1-FR leaves ${round(objectChecks[0].solvedMm, 2)} mm to PO1 versus inherited RC-04 = 225 mm, residual +${round(objectChecks[0].residualMm, 2)} mm. The shell anchors are not moved to conceal it.

### CP2

- **Applied/measured body:** 708 mm width; 536 mm depth; top-to-finished-floor 2148 mm.
- **Approximate:** top-to-ceiling about 450 mm; viewer-left vertical casing about 20 mm.
- **Separate layers:** 708 mm body, left/top casing, and removable cupboard door.
- **Inferred:** body-left plan edge is shown 20 mm inside the inherited CP2-FL outer reference; casing continuation across the top is shown without inventing a top thickness.
- **Unmeasured:** right-side gap/joinery allocation, top-casing thickness, removable-door dimensions and internal construction.

### D2

- **Structural wall depth:** **250 mm**, retained separately from the door object.
- **Structural opening:** **770 mm**.
- **Visible closed leaf:** **742 mm wide × 1975 mm high**.
- **Swing:** **opens into Room A**.
- **Inferred:** for plan display, the opening is anchored at D2-CR and the 742 mm leaf is centred, leaving 14 mm each end. The casing-to-structural-opening offset was not measured, so this does not redefine D2-CL.
- **Unmeasured:** casing dimensions, hinge side and the minor viewer-right lip dimension.

### D3

- **Measured leaf:** 760 × 1987 mm.
- **Approximate casing:** left 45 mm; right 80 mm; upper 80 mm.
- **Vertical:** top casing to ceiling **544 mm**, retained independently.
- **Swing:** opens into Room C; hinge side remains unmeasured.
- **Topology:** D3-CL remains the permanent turning corner and directly abuts the casing. The stale straight-continuation sentence is not used.
- **Unmeasured:** structural-opening dimensions and reveal depth.

### D4

- **Measured leaf:** 760 × 1987 mm.
- **Measured casing:** left 80 mm; right 80 mm; upper 80 mm.
- **Vertical:** top casing to ceiling **567 mm**, retained independently.
- **Swing:** opens into Room C; hinge side remains unmeasured.
- **Unmeasured:** structural-opening dimensions and reveal depth.

D3's 544 mm and D4's 567 mm ceiling clearances remain separate observations. Their 23 mm difference is not averaged or used to alter plan geometry.

### W2

- **Measured opening:** **1269 × 1515 mm**.
- **Approximate:** bottom of opening to finished floor about 1060 mm; top of opening to ceiling about 700 mm; casing about 40 mm on all sides.
- **Inferred:** the plan casing is shown as a simple 40 mm approximate surround.
- **Unmeasured/deferred:** detailed frame, reveal and heritage assembly geometry; replacement is anticipated.

## Placement and interpretation checks

| Check | Reference mm | Integrated mm | Residual/difference mm | Treatment |
|---|---:|---:|---:|---|
${checks}

## RC-19

RC-19 remains unresolved. The raw CP2-FL → PI3 = 2206 mm observation is retained and remains held out of the shell fit.

The new CP2 evidence **partially clarifies endpoint layering**: the inherited CP2-FL/FR span is ${rc19Review.newCP2Evidence.inheritedOuterFootprintSpanMm} mm, while the measured body is 708 mm and the known viewer-left casing is approximately 20 mm, leaving ${rc19Review.newCP2Evidence.remainingUnallocatedAcrossInheritedFootprintMm} mm without a measured right-side allocation. If CP2-FL were reinterpreted as the body-left edge behind that casing, the RC-19 residual would reduce only from +${rc19Review.acceptedBaselineResidualMm} mm to +${rc19Review.newCP2Evidence.alternativeResidualIfCP2EndpointWereBodyLeftMm} mm. More than 100 mm remains, so the object survey does not resolve the discrepancy and the shell/partition is not distorted.

## Reproducibility and scope

The successor script reads the accepted v0.1 JSON, asserts its selected A1 baseline, retains all shell coordinates, adds structured object/vertical evidence, runs interpretation checks, and regenerates this report, the v0.2 JSON and SVG. Vertical observations are explicitly marked as non-plan constraints.

Stop here for human review. Do not use this artifact for global D2/D3 reconciliation, renovation layout design, or construction.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  version: "0.2",
  shellChanged: false,
  maximumShellMovementMm: 0,
  objectPlacementChecks: output.objectPlacementChecks,
  rc19Conclusion: rc19Review.conclusion,
  outputs: [
    path.relative(repoRoot, path.join(outputDir, `${stem}.svg`)),
    path.relative(repoRoot, path.join(outputDir, `${stem}.json`)),
    path.relative(repoRoot, path.join(outputDir, `${stem}.md`)),
  ],
}, null, 2));

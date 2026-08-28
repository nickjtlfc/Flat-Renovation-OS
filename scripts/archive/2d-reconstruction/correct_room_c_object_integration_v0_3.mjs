#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const predecessorRelative = "docs/survey/derived/room-c/ROOM_C_RECONSTRUCTION_OBJECT_INTEGRATION_v0_2.json";
const predecessorSvgRelative = "docs/survey/derived/room-c/ROOM_C_RECONSTRUCTION_OBJECT_INTEGRATION_v0_2.svg";
const acceptedShellRelative = "docs/survey/derived/room-c/ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1.json";
const archiveDir = path.join(repoRoot, "docs/survey/derived/room-c/archive");
const outputDir = archiveDir;
const stem = "ROOM_C_RECONSTRUCTION_OBJECT_CORRECTIONS_v0_3";
const generatedDate = "2026-08-12";

const historicalPath = (relative) => path.join(archiveDir, path.basename(relative));
const readJson = (relative) => JSON.parse(fs.readFileSync(historicalPath(relative), "utf8"));
const predecessor = readJson(predecessorRelative);
const acceptedShell = readJson(acceptedShellRelative);
const predecessorSvg = fs.readFileSync(historicalPath(predecessorSvgRelative), "utf8");

if (predecessor.version !== "0.2") throw new Error("Expected Room C object integration v0.2 predecessor.");
if (acceptedShell.selection?.selectedSolutionId !== "A1") throw new Error("Expected accepted first-pass A1 shell.");
if (predecessor.shell?.changedFromV01 !== false) throw new Error("The v0.2 predecessor does not preserve the accepted shell.");

const clone = (value) => JSON.parse(JSON.stringify(value));
const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, scalar) => [a[0] * scalar, a[1] * scalar];
const midpoint = (a, b) => mul(add(a, b), 0.5);
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const point = ({ x, y }) => [x, y];
const pointRecord = ([x, y]) => ({ x: round(x, 2), y: round(y, 2) });
const inheritedNodes = predecessor.planGeometry.inheritedNodesMm;
const predecessorObjectNodes = predecessor.planGeometry.objectNodesMm;
const outward = [
  predecessor.planGeometry.axes.structuralWallOutwardTowardRoomA.x,
  predecessor.planGeometry.axes.structuralWallOutwardTowardRoomA.y,
];

// RC-19 field-transcription correction: retain the reading, replace only its starting endpoint.
const supersededRc19 = predecessor.shell.inheritedObservationResiduals.find((row) => row.id === "RC-19");
if (!supersededRc19 || supersededRc19.from !== "CP2-FL" || supersededRc19.measuredMm !== 2206) {
  throw new Error("Expected superseded RC-19 CP2-FL -> PI3 = 2206 mm record.");
}
const correctedRc19SolvedMm = distance(point(inheritedNodes["CP2-FR"]), point(inheritedNodes.PI3));
const correctedRc19ResidualMm = correctedRc19SolvedMm - 2206;
const correctedRc19 = {
  ...supersededRc19,
  from: "CP2-FR",
  solvedMm: round(correctedRc19SolvedMm, 2),
  residualMm: round(correctedRc19ResidualMm, 2),
  weightingClass: "direct validation retained outside the already accepted shell fit",
  note: "Corrected field endpoint; 2206 mm field reading preserved. Not used to re-solve the accepted shell.",
};
const signedResidualChangeMm = correctedRc19ResidualMm - supersededRc19.residualMm;
const absoluteResidualImprovementMm = Math.abs(supersededRc19.residualMm) - Math.abs(correctedRc19ResidualMm);

const output = clone(predecessor);
output.documentType = "derived Room C v0.3 targeted object corrections - not source evidence";
output.version = "0.3";
output.generatedDate = generatedDate;
output.status = "proposal for human visual review; v0.2 preserved; accepted v0.1 A1 shell retained exactly";
output.predecessor = predecessorRelative;
output.acceptedShellBaseline = acceptedShellRelative;
output.correctionScope = [
  "RC-19 endpoint corrected from CP2-FL to CP2-FR without changing its 2206 mm field reading.",
  "D2 leaf/closing plane moved from the Room C face to the Room A side of the 250 mm through-wall reveal.",
  "Five station-specific Room C floor-to-ceiling observations added as non-plan vertical evidence.",
];

output.objectEvidence.correctionHistory = [
  {
    id: "RC-19-ENDPOINT-CORRECTION",
    correctionClass: "field transcription correction",
    supersededDefinition: { from: "CP2-FL", to: "PI3", measuredMm: 2206 },
    activeDefinition: { from: "CP2-FR", to: "PI3", measuredMm: 2206 },
    statement: "The earlier CP2-FL endpoint is retained only as superseded history; CP2-FR is the active physical endpoint.",
  },
  {
    id: "D2-CLOSING-PLANE-CORRECTION",
    correctionClass: "object-layer placement correction",
    supersededInterpretation: "Door leaf/closing plane drawn at the Room C face of the structural wall.",
    activeInterpretation: "Door leaf/closing plane sits on the Room A side after the approximately 250 mm through-wall reveal.",
  },
];
output.objectEvidence.D2.closingPlane = {
  physicalSide: "Room A side of the A-C structural wall",
  placementClass: "side confirmed; exact rebate/inset within Room A-side casing unmeasured",
  roomCSideSequence: "Room C -> deep reveal/open passage through approximately 250 mm wall -> D2 leaf/closing plane on Room A side",
};
output.objectEvidence.RoomCFloorToCeiling = [
  { station: "near D3", measuredMm: 2598, evidenceClass: "direct", axis: "vertical" },
  { station: "near D4", measuredMm: 2631, evidenceClass: "direct", axis: "vertical" },
  { station: "near CP1", measuredMm: 2596, evidenceClass: "direct", axis: "vertical" },
  { station: "near CP2", measuredMm: 2594, evidenceClass: "direct", axis: "vertical" },
  { station: "near PO2", measuredMm: 2616, evidenceClass: "direct", axis: "vertical" },
];

// Keep the inherited ledger as explicit history and replace RC-19 only in the active ledger.
output.shell.changedFromV02 = false;
output.shell.statement = "No accepted first-pass shell, PO/PI partition node, or v0.2 object station moved. Corrections affect evidence interpretation and the D2 through-wall object layer only.";
output.shell.historicalObservationResiduals = predecessor.shell.inheritedObservationResiduals.map((row) => row.id === "RC-19" ? {
  ...row,
  recordStatus: "superseded field transcription",
  supersededBy: "RC-19 CP2-FR -> PI3 = 2206 mm",
} : row);
output.shell.activeObservationResiduals = predecessor.shell.inheritedObservationResiduals.map((row) => row.id === "RC-19" ? correctedRc19 : row);
delete output.shell.inheritedObservationResiduals;

// Move only the D2 leaf/closing-plane drawing object along the perpendicular through-wall axis.
const priorLeafR = point(predecessorObjectNodes["D2-LEAF-R-INFERRED"]);
const priorLeafL = point(predecessorObjectNodes["D2-LEAF-L-INFERRED"]);
const roomALeafR = add(priorLeafR, mul(outward, 250));
const roomALeafL = add(priorLeafL, mul(outward, 250));
delete output.planGeometry.objectNodesMm["D2-LEAF-R-INFERRED"];
delete output.planGeometry.objectNodesMm["D2-LEAF-L-INFERRED"];
output.planGeometry.objectNodesMm["D2-LEAF-A-FACE-R-INFERRED"] = pointRecord(roomALeafR);
output.planGeometry.objectNodesMm["D2-LEAF-A-FACE-L-INFERRED"] = pointRecord(roomALeafL);
output.planGeometry.D2StructuralOpeningPlacement = {
  ...output.planGeometry.D2StructuralOpeningPlacement,
  revealAxis: "perpendicular through-wall axis toward Room A; not part of the Room C along-wall shell chain",
  roomCFace: "structural opening enters the deep reveal at D2-CR",
  roomAFace: "742 mm leaf/closing plane shown at the Room A side of the approximately 250 mm wall",
  exactClosingPlaneInset: "unmeasured; Room A side is confirmed, exact rebate/inset is schematic",
  affectsRoomCShell: false,
};
output.planGeometry.D2LeafCorrectionHistory = {
  supersededV02NodesMm: {
    "D2-LEAF-R-INFERRED": predecessorObjectNodes["D2-LEAF-R-INFERRED"],
    "D2-LEAF-L-INFERRED": predecessorObjectNodes["D2-LEAF-L-INFERRED"],
  },
  activeV03NodesMm: {
    "D2-LEAF-A-FACE-R-INFERRED": pointRecord(roomALeafR),
    "D2-LEAF-A-FACE-L-INFERRED": pointRecord(roomALeafL),
  },
  translationMm: 250,
  axis: "through-wall toward Room A",
  shellNodeMovementMm: 0,
};

const newFloorToCeilingObservations = [
  ["RC-FTC-D3", "near D3", 2598],
  ["RC-FTC-D4", "near D4", 2631],
  ["RC-FTC-CP1", "near CP1", 2596],
  ["RC-FTC-CP2", "near CP2", 2594],
  ["RC-FTC-PO2", "near PO2", 2616],
].map(([id, station, measuredMm]) => ({
  id,
  object: "ROOM-C",
  station,
  description: "local finished-floor to ceiling",
  measuredMm,
  evidenceClass: "direct station-specific vertical observation",
  affectsPlanGeometry: false,
}));
output.verticalObservations = [...predecessor.verticalObservations, ...newFloorToCeilingObservations];
output.floorToCeilingReview = {
  observations: newFloorToCeilingObservations,
  lowest: { station: "near CP2", measuredMm: 2594 },
  highest: { station: "near D4", measuredMm: 2631 },
  observedRangeMm: 37,
  treatment: "Retained independently; not averaged, not forced to close, and not used in the 2D shell solve.",
  objectVerticalComparisons: [
    { station: "near D3", componentSumMm: 2611, localFloorToCeilingMm: 2598, differenceMm: 13, materiallyInconsistent: false, basis: "1987 leaf + approximately 80 upper casing + 544 casing-to-ceiling; small difference may include leaf/floor clearance or reference detail." },
    { station: "near D4", componentSumMm: 2634, localFloorToCeilingMm: 2631, differenceMm: 3, materiallyInconsistent: false, basis: "1987 leaf + 80 upper casing + 567 casing-to-ceiling." },
    { station: "near CP2", componentSumMm: 2598, localFloorToCeilingMm: 2594, differenceMm: 4, materiallyInconsistent: false, basis: "2148 floor-to-top + approximately 450 top-to-ceiling." },
    { station: "near CP1", knownClearancesSumMm: 2576, localFloorToCeilingMm: 2596, impliedBodyHeightMm: 20, materiallyInconsistent: true, basis: "1315 floor-to-bottom + unmeasured body height + 1261 top-to-ceiling; the 20 mm remainder is implausible for the observed cupboard body and requires field clarification." },
    { station: "W2 (not co-located with a new height station)", componentSumMm: 3275, highestNewLocalFloorToCeilingMm: 2631, excessAboveHighestLocalMm: 644, materiallyInconsistent: true, basis: "Approximately 1060 floor-to-opening + 1515 opening + approximately 700 opening-to-ceiling; retain without adjustment because station/reference semantics may differ." },
  ],
};

output.RC19Review = {
  correctionClass: "field transcription correction",
  correctionHistory: {
    supersededDefinition: { from: "CP2-FL", to: "PI3", measuredMm: 2206 },
    activeDefinition: { from: "CP2-FR", to: "PI3", measuredMm: 2206 },
  },
  previousTranscriptionResult: { solvedMm: supersededRc19.solvedMm, residualMm: supersededRc19.residualMm },
  correctedResult: { solvedMm: round(correctedRc19SolvedMm, 2), residualMm: round(correctedRc19ResidualMm, 2) },
  signedResidualChangeMm: round(signedResidualChangeMm, 2),
  absoluteResidualImprovementMm: round(absoluteResidualImprovementMm, 2),
  usedToMoveShellNodes: false,
  assessment: "resolved",
  conclusion: "The corrected CP2-FR endpoint resolves the former approximately 111 mm conflict on the fixed accepted geometry. The remaining -4.00 mm residual is within the inherited 8 mm nominal sigma and does not justify shell movement.",
};
output.unresolved = output.unresolved
  .filter((item) => !item.startsWith("RC-19 remains unresolved"))
  .map((item) => item.startsWith("D2 casing dimensions")
    ? "D2 casing dimensions, exact Room A-side closing-plane rebate/inset, casing-to-structural-opening offset, hinge side and minor right lip dimension."
    : item);

function svgLine(a, b, cls, pt) {
  const p1 = pt(a);
  const p2 = pt(b);
  return `<line x1="${round(p1[0], 1)}" y1="${round(p1[1], 1)}" x2="${round(p2[0], 1)}" y2="${round(p2[1], 1)}" class="${cls}"/>`;
}

function replaceRequired(source, search, replacement, description) {
  if (!source.match(search)) throw new Error(`SVG predecessor fragment missing: ${description}`);
  return source.replace(search, replacement);
}

function makeSvg() {
  const inheritedPointArrays = Object.values(inheritedNodes).map(point);
  const predecessorObjectPointArrays = Object.values(predecessorObjectNodes).map(point);
  const allPoints = [...inheritedPointArrays, ...predecessorObjectPointArrays];
  const minX = Math.min(...allPoints.map((item) => item[0])) - 300;
  const maxX = Math.max(...allPoints.map((item) => item[0])) + 450;
  const minY = Math.min(...allPoints.map((item) => item[1])) - 250;
  const maxY = Math.max(...allPoints.map((item) => item[1])) + 260;
  const box = { x: 55, y: 215, width: 1200, height: 1040 };
  const scale = Math.min(box.width / (maxX - minX), box.height / (maxY - minY));
  const pt = (item) => [box.x + (item[0] - minX) * scale, box.y + (item[1] - minY) * scale];

  const openingR = point(predecessorObjectNodes["D2-OPENING-R"]);
  const openingL = point(predecessorObjectNodes["D2-OPENING-L-INFERRED"]);
  const oldLeafLine = svgLine(priorLeafL, priorLeafR, "leaf", pt);
  const newLeafLine = svgLine(roomALeafL, roomALeafR, "leaf", pt);
  const oldMid = midpoint(openingL, openingR);
  const oldArrowEnd = add(oldMid, mul(outward, 190));
  const newMid = midpoint(roomALeafL, roomALeafR);
  const newArrowEnd = add(newMid, mul(outward, 190));
  const revealMid = midpoint(oldMid, newMid);
  const oldArrow = svgLine(oldMid, oldArrowEnd, "arrow", pt);
  const newArrow = svgLine(newMid, newArrowEnd, "arrow", pt);
  const leafLabelPoint = [pt(newMid)[0] + 18, pt(newMid)[1]];
  const revealLabelPoint = [pt(revealMid)[0] - 2, pt(revealMid)[1]];
  const newArrowLabel = `  <text x="${round(pt(newArrowEnd)[0] + 8, 1)}" y="${round(pt(newArrowEnd)[1] - 5, 1)}" class="tiny">D2 opens into Room A</text>\n  <text x="${round(leafLabelPoint[0], 1)}" y="${round(leafLabelPoint[1], 1)}" class="tiny" text-anchor="middle" transform="rotate(-89 ${round(leafLabelPoint[0], 1)} ${round(leafLabelPoint[1], 1)})">leaf / closing plane · Room A side</text>\n  <text x="${round(revealLabelPoint[0], 1)}" y="${round(revealLabelPoint[1], 1)}" class="tiny" text-anchor="middle" transform="rotate(-89 ${round(revealLabelPoint[0], 1)} ${round(revealLabelPoint[1], 1)})">deep reveal · ~250 mm through-wall</text>`;

  let svg = predecessorSvg
    .replaceAll("Â·", "·")
    .replaceAll("â€”", "—")
    .replaceAll("â€“", "–")
    .replaceAll("â†’", "→")
    .replaceAll("Ã—", "×");
  svg = replaceRequired(svg, /Room C object-layer integration v0\.2/g, "Room C targeted object corrections v0.3", "title version");
  svg = replaceRequired(svg, /ROOM C SHELL \+ OBJECT LAYERS · v0\.2/g, "ROOM C OBJECT CORRECTIONS · v0.3", "drawing heading");
  svg = replaceRequired(svg, /Accepted v0\.1 shell retained · CP1 \/ CP2 \/ D2 \/ D3 \/ D4 \/ W2 integrated from 12 August object survey/g, "v0.2 preserved · RC-19 endpoint + D2 closing plane corrected · five local heights added", "drawing subtitle");
  svg = replaceRequired(svg, oldLeafLine, newLeafLine, "D2 Room C-face leaf line");
  svg = replaceRequired(svg, oldArrow, newArrow, "D2 swing arrow");
  svg = replaceRequired(svg, /  <text x="[^"]+" y="[^"]+" class="tiny">D2 opens into Room A<\/text>/, newArrowLabel, "D2 swing label");
  svg = replaceRequired(svg, /<text x="1320" y="394" class="sideSmall">[^<]*<\/text>/, `<text x="1320" y="394" class="sideSmall">leaf at Room A side · deep reveal from C</text>`, "D2 sidebar summary");

  const rc19Start = svg.indexOf('  <rect x="1310" y="610"');
  const verticalStart = svg.indexOf('  <text x="1320" y="865" class="sideHead">');
  if (rc19Start < 0 || verticalStart < 0 || verticalStart <= rc19Start) throw new Error("RC-19 sidebar block markers missing.");
  const rc19Block = `  <rect x="1310" y="610" width="425" height="190" rx="8" class="callout"/>\n  <text x="1330" y="644" class="sideHead">RC-19 endpoint corrected</text>\n  <text x="1330" y="675" class="sideSmall">Superseded CP2-FL residual: <tspan class="bad">+111.17 mm</tspan></text>\n  <text x="1330" y="704" class="side">Active CP2-FR residual: <tspan class="good">−4.00 mm</tspan></text>\n  <text x="1330" y="733" class="sideSmall">Signed change: −115.17 mm</text>\n  <text x="1330" y="762" class="sideSmall"><tspan class="good">Resolved</tspan> on fixed shell · 2206 retained</text>\n\n`;
  svg = `${svg.slice(0, rc19Start)}${rc19Block}${svg.slice(verticalStart)}`;

  const newVerticalStart = svg.indexOf('  <text x="1320" y="865" class="sideHead">');
  const layerKeyStart = svg.indexOf('  <text x="1320" y="1030" class="sideHead">');
  if (newVerticalStart < 0 || layerKeyStart < 0 || layerKeyStart <= newVerticalStart) throw new Error("Vertical sidebar block markers missing.");
  const verticalBlock = `  <text x="1320" y="835" class="sideHead">Local floor-to-ceiling</text>\n  <text x="1320" y="868" class="side">D3 2598 · D4 2631</text>\n  <text x="1320" y="896" class="side">CP1 2596 · CP2 2594</text>\n  <text x="1320" y="924" class="side">PO2 2616 · range <tspan font-weight="700">37 mm</tspan></text>\n  <text x="1320" y="952" class="sideSmall">Stations retained separately; not averaged.</text>\n  <text x="1320" y="978" class="sideSmall">No 2D plan-coordinate effect.</text>\n\n`;
  svg = `${svg.slice(0, newVerticalStart)}${verticalBlock}${svg.slice(layerKeyStart)}`;
  svg = svg.replace("Generated 2026-08-12 · data-driven successor script", "Generated 2026-08-12 · v0.2 preserved · targeted successor");
  return svg;
}

function makeReport() {
  return `# Room C reconstruction — targeted object corrections v0.3

Status: **proposal for human visual review; v0.2 preserved; accepted first-pass A1 shell retained exactly**.

This successor makes only the requested RC-19 endpoint correction, D2 closing-plane correction, and addition of five station-specific floor-to-ceiling readings. It does not re-solve Room C, perform global reconciliation, or alter unrelated geometry.

## Shell preservation

No accepted shell or PO/PI node moved: maximum movement **0.00 mm**. The approximately 250 mm D2 depth is represented only on the perpendicular through-wall axis toward Room A; it does not enter or lengthen the Room C along-wall shell chain.

## RC-19 field-transcription correction

- **Superseded transcription retained as history:** CP2-FL → PI3 = 2206 mm.
- **Active observation:** **CP2-FR → PI3 = 2206 mm**.
- Previous solved distance/residual: ${supersededRc19.solvedMm.toFixed(2)} mm / **+${supersededRc19.residualMm.toFixed(2)} mm**.
- Corrected solved distance/residual: ${correctedRc19SolvedMm.toFixed(2)} mm / **${correctedRc19ResidualMm.toFixed(2)} mm**.
- Signed residual change: **${signedResidualChangeMm.toFixed(2)} mm**; absolute residual magnitude improves by **${absoluteResidualImprovementMm.toFixed(2)} mm**.

Assessment: **resolved**. The corrected residual is within the inherited 8 mm nominal sigma. RC-19 now supports the fixed accepted geometry as a validation observation; no shell node was moved.

## D2 closing-plane correction

The drawing and structured geometry now show this physical sequence:

**Room C → structural opening/deep reveal through approximately 250 mm wall → 742 mm D2 leaf/closing plane on the Room A side → swing into Room A.**

Preserved measurements are the approximately 250 mm structural reveal depth, 770 mm structural opening, 742 × 1975 mm visible closed leaf, and Room A swing destination. The Room C-side deep reveal remains visible as a separate opening layer.

Remaining D2 ambiguity: exact casing dimensions, exact Room A-side leaf rebate/inset, casing-to-structural-opening offset, hinge side, minor viewer-right lip dimension, and the inferred opposite opening boundary. The drawing therefore fixes the confirmed physical side but keeps the closing plane’s precise rebate schematic.

## Station-specific Room C floor-to-ceiling evidence

| Survey station | Floor to ceiling mm |
|---|---:|
| near D3 | 2598 |
| near D4 | 2631 |
| near CP1 | 2596 |
| near CP2 | 2594 |
| near PO2 | 2616 |

All five readings are retained independently. Lowest is **2594 mm near CP2**; highest is **2631 mm near D4**; observed range is **37 mm**. They were not averaged and did not influence the 2D shell solve.

### Vertical consistency review

- D3 components total 2611 mm versus the local 2598 mm: **+13 mm**, not considered material at this evidence detail.
- D4 components total 2634 mm versus 2631 mm: **+3 mm**, not material.
- CP2 components total approximately 2598 mm versus 2594 mm: **+4 mm**, not material.
- CP1’s known clearances total 2576 mm, leaving only **20 mm** for the unmeasured cupboard body height against the 2596 mm local height. This appears **materially inconsistent** and needs field/reference clarification; no value was adjusted.
- W2’s approximate vertical chain totals 3275 mm, **644 mm above the highest new local reading**. Although no new height was taken specifically at W2, this is materially inconsistent with the new Room C height range and likely reflects differing reference semantics or an erroneous approximate component. It remains unadjusted.

Existing D3/D4 casing-to-ceiling, cupboard, door, and window vertical observations remain separate in the JSON. None were forced to close mathematically.

Stop here for human review. Do not use this artifact to begin global reconciliation or further Room C optimisation.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  version: "0.3",
  shellChanged: false,
  maximumShellMovementMm: 0,
  rc19: output.RC19Review,
  d2ClosingPlane: output.planGeometry.D2StructuralOpeningPlacement,
  floorToCeiling: {
    count: output.floorToCeilingReview.observations.length,
    rangeMm: output.floorToCeilingReview.observedRangeMm,
  },
  outputs: ["svg", "json", "md"].map((extension) => path.relative(repoRoot, path.join(outputDir, `${stem}.${extension}`))),
}, null, 2));

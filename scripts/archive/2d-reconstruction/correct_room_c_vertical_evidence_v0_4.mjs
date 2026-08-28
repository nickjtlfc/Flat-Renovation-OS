#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const predecessorRelative = "docs/survey/derived/room-c/ROOM_C_RECONSTRUCTION_OBJECT_CORRECTIONS_v0_3.json";
const predecessorSvgRelative = "docs/survey/derived/room-c/ROOM_C_RECONSTRUCTION_OBJECT_CORRECTIONS_v0_3.svg";
const acceptedShellRelative = "docs/survey/derived/room-c/ROOM_C_RECONSTRUCTION_FIRST_PASS_v0_1.json";
const archiveDir = path.join(repoRoot, "docs/survey/derived/room-c/archive");
const outputDir = archiveDir;
const stem = "ROOM_C_RECONSTRUCTION_VERTICAL_CORRECTIONS_v0_4";
const generatedDate = "2026-08-12";

const historicalPath = (relative) => path.join(archiveDir, path.basename(relative));
const readJson = (relative) => JSON.parse(fs.readFileSync(historicalPath(relative), "utf8"));
const predecessor = readJson(predecessorRelative);
const acceptedShell = readJson(acceptedShellRelative);
const predecessorSvg = fs.readFileSync(historicalPath(predecessorSvgRelative), "utf8");

if (predecessor.version !== "0.3") throw new Error("Expected Room C v0.3 predecessor.");
if (acceptedShell.selection?.selectedSolutionId !== "A1") throw new Error("Expected accepted Room C A1 shell.");
if (predecessor.shell?.changedFromV01 !== false || predecessor.shell?.changedFromV02 !== false) {
  throw new Error("The predecessor does not preserve the accepted shell.");
}

const clone = (value) => JSON.parse(JSON.stringify(value));
const output = clone(predecessor);
const previousCP1 = clone(predecessor.objectEvidence.CP1);
const previousW2 = clone(predecessor.objectEvidence.W2);
const previousVerticalObservations = clone(predecessor.verticalObservations);

output.documentType = "derived Room C v0.4 targeted vertical-evidence corrections - not source evidence";
output.version = "0.4";
output.generatedDate = generatedDate;
output.status = "proposal for human visual review; v0.3 preserved; accepted v0.1 A1 shell and all plan nodes retained exactly";
output.predecessor = predecessorRelative;
output.acceptedShellBaseline = acceptedShellRelative;
output.correctionScope = [
  "CP1 1261 mm reclassified from ceiling clearance to cupboard-body height; 1315 mm retained as finished-floor to body base; approximately 30-40 mm top trim added separately.",
  "W2 active vertical chain corrected to approximately 1040 + 1516 + 75 = 2631 mm; previous approximately 700 mm top-clearance reading superseded.",
  "No 2D shell or object plan node changed.",
];

output.verticalEvidenceCorrectionHistory = [
  {
    id: "CP1-VERTICAL-INTERPRETATION-CORRECTION",
    correctionClass: "field interpretation correction",
    supersededInterpretation: {
      finishedFloorToCupboardBaseMm: 1315,
      ceilingToCupboardTopMm: 1261,
      topCasingRecorded: false,
    },
    activeInterpretation: {
      finishedFloorToCupboardBodyBaseMm: 1315,
      cupboardBodyHeightMm: 1261,
      topCasingHeightApproxMm: { min: 30, max: 40 },
    },
    statement: "The 1261 mm reading is cupboard-body height, not ceiling clearance. Top casing remains a separate joinery layer.",
  },
  {
    id: "W2-VERTICAL-TRANSCRIPTION-CORRECTION",
    correctionClass: "field transcription/read correction",
    supersededInterpretation: {
      finishedFloorToOpeningBottomApproxMm: 1060,
      openingHeightMm: 1515,
      openingTopToCeilingApproxMm: 700,
    },
    activeInterpretation: {
      finishedFloorToCasingBaseApproxMm: 1040,
      overallHeightIncludingCasingApproxMm: 1516,
      casingTopToCeilingApproxMm: 75,
      chainTotalApproxMm: 2631,
    },
    statement: "The approximately 700 mm top-clearance value is superseded and is not active vertical evidence.",
  },
];

output.objectEvidence.correctionHistory = [
  ...(predecessor.objectEvidence.correctionHistory || []),
  ...output.verticalEvidenceCorrectionHistory,
];

output.objectEvidence.CP1 = {
  ...previousCP1,
  body: {
    widthMm: previousCP1.body.widthMm,
    depthMm: previousCP1.body.depthMm,
    heightMm: { value: 1261, class: "direct", axis: "vertical", correctedInterpretation: true },
    bottomToFinishedFloorMm: {
      value: 1315,
      class: "direct",
      axis: "vertical",
      semanticDirection: "finished floor to bottom/base of cupboard body",
    },
  },
  casing: {
    recorded: true,
    topHeightMm: { min: 30, max: 40, class: "approximate", axis: "vertical" },
    separateFromBodyHeight: true,
  },
  servicesZoneBelow: {
    exists: true,
    verticalExtentToCupboardBaseMm: 1315,
    note: "High-level suspended cupboard with services/water-inlet-related space below.",
  },
  interpretation: "High-level suspended cupboard: 1315 mm floor-to-body-base, 1261 mm body height, then separate approximately 30-40 mm top casing/trim.",
};
delete output.objectEvidence.CP1.body.ceilingToTopMm;

output.objectEvidence.W2 = {
  openingWidthMm: previousW2.openingWidthMm,
  activeVerticalChain: {
    finishedFloorToCasingBaseMm: { value: 1040, class: "approximate", axis: "vertical" },
    overallHeightIncludingCasingMm: { value: 1516, class: "approximate", axis: "vertical" },
    casingTopToCeilingMm: { value: 75, class: "approximate", axis: "vertical" },
    totalMm: { value: 2631, class: "derived from approximate field observations", axis: "vertical" },
  },
  casingAllSidesMm: previousW2.casingAllSidesMm,
  interpretation: "Active vertical evidence uses casing-base and casing-top references. The previous approximately 700 mm top-clearance interpretation is superseded.",
  affectsPlanGeometry: false,
};

const replacementVerticalObservations = [
  {
    id: "CP1-V01",
    object: "CP1",
    description: "cupboard body height",
    measuredMm: 1261,
    evidenceClass: "direct corrected interpretation",
    affectsPlanGeometry: false,
  },
  {
    id: "CP1-V02",
    object: "CP1",
    description: "finished floor to cupboard body base",
    measuredMm: 1315,
    evidenceClass: "direct",
    affectsPlanGeometry: false,
  },
  {
    id: "CP1-V03",
    object: "CP1",
    description: "top casing/trim above cupboard body",
    measuredRangeMm: { min: 30, max: 40 },
    evidenceClass: "approximate; separate joinery/casing layer",
    affectsPlanGeometry: false,
  },
  {
    id: "W2-V01",
    object: "W2",
    description: "finished floor to bottom/base of W2 casing",
    measuredMm: 1040,
    evidenceClass: "approximate corrected observation",
    affectsPlanGeometry: false,
  },
  {
    id: "W2-V02",
    object: "W2",
    description: "overall W2 height including casing",
    measuredMm: 1516,
    evidenceClass: "approximate corrected observation",
    affectsPlanGeometry: false,
  },
  {
    id: "W2-V03",
    object: "W2",
    description: "top of W2 casing to ceiling",
    measuredMm: 75,
    evidenceClass: "approximate corrected observation; supersedes approximately 700 mm",
    affectsPlanGeometry: false,
  },
];

const replacedIds = new Set(["CP1-V01", "CP1-V02", "W2-V01", "W2-V02", "W2-V03"]);
output.verticalObservations = [
  ...predecessor.verticalObservations.filter((observation) => !replacedIds.has(observation.id)),
  ...replacementVerticalObservations,
];
output.historicalVerticalObservations = previousVerticalObservations
  .filter((observation) => replacedIds.has(observation.id))
  .map((observation) => ({
    ...observation,
    recordStatus: "superseded vertical interpretation",
    activeSuccessor: replacementVerticalObservations.find((successor) => successor.id === observation.id) || null,
  }));

output.floorToCeilingReview.objectVerticalComparisons = predecessor.floorToCeilingReview.objectVerticalComparisons
  .filter((comparison) => comparison.station !== "near CP1" && !comparison.station.startsWith("W2"));
output.floorToCeilingReview.objectVerticalComparisons.push(
  {
    station: "near CP1",
    correctedChainRangeMm: { min: 2606, max: 2616 },
    localFloorToCeilingMm: 2596,
    differenceRangeMm: { min: 10, max: 20 },
    materiallyInconsistent: false,
    basis: "1315 floor-to-body-base + 1261 body + approximately 30-40 top casing. The small excess is retained as approximate/local vertical variation; no value is adjusted.",
  },
  {
    station: "W2 (not co-located with a new height station)",
    correctedChainMm: 2631,
    localRoomCRangeMm: { min: 2594, max: 2631 },
    agreesWithLocalRange: true,
    materiallyInconsistent: false,
    basis: "Approximately 1040 floor-to-casing-base + 1516 overall including casing + 75 casing-top-to-ceiling = 2631, equal to the highest recorded local Room C reading.",
  },
);
output.floorToCeilingReview.treatment = "Station readings and corrected object chains remain separate, unaveraged vertical evidence and do not affect the 2D shell.";

output.shell.changedFromV03 = false;
output.shell.statement = "No accepted shell, PO/PI partition node, or object plan node moved. v0.4 changes vertical evidence semantics only.";
output.unresolved = output.unresolved.map((item) => {
  if (item.startsWith("CP1 body height")) return "CP1 detailed joinery and exact top-casing height within the approximately 30-40 mm observed range.";
  if (item.startsWith("W2 frame/reveal detail")) return "W2 frame/reveal detail and exact casing dimensions; the corrected approximate vertical chain is internally consistent but is not forced to reconcile with superseded reference semantics.";
  return item;
});

function replaceRequired(source, search, replacement, description) {
  if (!source.match(search)) throw new Error(`SVG predecessor fragment missing: ${description}`);
  return source.replace(search, replacement);
}

function makeSvg() {
  let svg = predecessorSvg;
  svg = replaceRequired(svg, /Room C targeted object corrections v0\.3/g, "Room C targeted vertical-evidence corrections v0.4", "title version");
  svg = replaceRequired(svg, /<desc id="desc">[^<]*<\/desc>/, '<desc id="desc">Room C v0.3 plan retained exactly; CP1 and W2 vertical evidence corrected with superseded interpretations preserved for human review.</desc>', "drawing description");
  svg = replaceRequired(svg, /ROOM C OBJECT CORRECTIONS · v0\.3/g, "ROOM C VERTICAL-EVIDENCE CORRECTIONS · v0.4", "drawing heading");
  svg = replaceRequired(svg, /v0\.2 preserved · RC-19 endpoint \+ D2 closing plane corrected · five local heights added/g, "v0.3 preserved · CP1 interpretation + W2 vertical chain corrected · plan unchanged", "drawing subtitle");
  svg = replaceRequired(svg, /<text x="1320" y="274" class="sideSmall">[^<]*<\/text>/, '<text x="1320" y="274" class="sideSmall">body height 1261 · top trim ~30–40 separate</text>', "CP1 sidebar summary");
  svg = replaceRequired(svg, /<text x="1320" y="550" class="side"><tspan font-weight="700">W2 opening<\/tspan>[^<]*<\/text><text x="1320" y="574" class="sideSmall">[^<]*<\/text>/, '<text x="1320" y="550" class="side"><tspan font-weight="700">W2 vertical</tspan> ~1040 + ~1516 + ~75</text><text x="1320" y="574" class="sideSmall">casing references · chain ~2631</text>', "W2 sidebar summary");

  const correctionStart = svg.indexOf('  <rect x="1310" y="610"');
  const localHeightStart = svg.indexOf('  <text x="1320" y="835" class="sideHead">');
  if (correctionStart < 0 || localHeightStart < 0 || localHeightStart <= correctionStart) throw new Error("Sidebar correction block markers missing.");
  const correctionBlock = `  <rect x="1310" y="610" width="425" height="190" rx="8" class="callout"/>\n  <text x="1330" y="644" class="sideHead">Vertical evidence corrected</text>\n  <text x="1330" y="675" class="side">CP1 body height: <tspan class="good">1261 mm</tspan></text>\n  <text x="1330" y="704" class="sideSmall">FFL→base 1315 · top trim ~30–40 separate</text>\n  <text x="1330" y="733" class="side">W2 chain: <tspan class="good">~2631 mm</tspan></text>\n  <text x="1330" y="762" class="sideSmall">~700 top clearance superseded · plan fixed</text>\n\n`;
  svg = `${svg.slice(0, correctionStart)}${correctionBlock}${svg.slice(localHeightStart)}`;
  svg = svg.replace("Generated 2026-08-12 · v0.2 preserved · targeted successor", "Generated 2026-08-12 · v0.3 preserved · vertical-only successor");
  return svg;
}

function makeReport() {
  return `# Room C reconstruction — targeted vertical-evidence corrections v0.4

Status: **proposal for human visual review; v0.3 preserved; accepted first-pass A1 shell and all plan nodes retained exactly**.

This successor changes only the CP1 and W2 vertical evidence definitions. It does not re-solve the 2D shell, move plan nodes, perform global reconciliation, or alter unrelated Room C geometry.

## CP1 corrected vertical definition

The active field interpretation is:

**Finished floor → 1315 mm clear/services zone → CP1 cupboard body 1261 mm high → approximately 30–40 mm separate top casing/trim.**

- **1315 mm** is finished floor to the bottom/base of the cupboard body.
- **1261 mm** is the actual cupboard-body height. It is no longer interpreted as ceiling-to-cupboard-top.
- The approximately **30–40 mm top casing/trim** is a separate joinery layer and is not merged into body height.
- CP1 remains a high-level suspended cupboard with services/water-inlet-related space below.

The corrected chain totals approximately **2606–2616 mm** including top trim. Compared with the 2596 mm local reading near CP1, this is 10–20 mm higher; that small difference remains visible and is treated as approximate/local vertical variation rather than being silently adjusted.

## W2 corrected vertical chain

The active approximate field observations are:

| W2 vertical component | Approximate measurement |
|---|---:|
| Finished floor to bottom/base of casing | 1040 mm |
| Overall W2 height including casing | 1516 mm |
| Top of casing to ceiling | 75 mm |
| **Derived chain total** | **2631 mm** |

The former approximately **700 mm W2 top-to-ceiling value is explicitly superseded/incorrect** and remains only in correction history.

The corrected W2 total of approximately **2631 mm** lies within the recorded Room C local floor-to-ceiling range of **2594–2631 mm**, matching its highest reading. The previous apparent W2 vertical inconsistency is therefore resolved. W2 was not itself one of the five local height stations, so the agreement is a range check rather than a forced co-located closure.

## Geometry gate

- Maximum accepted shell-node movement: **0.00 mm**.
- PO/PI partition-node movement: **0.00 mm**.
- Object plan-node movement: **0.00 mm**.
- CP1 and W2 corrections are vertical-only and did not influence the 2D shell.

Stop here for human review. Do not proceed to global reconciliation.
`;
}

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(output, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), `${makeSvg()}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), makeReport(), "utf8");

console.log(JSON.stringify({
  version: "0.4",
  shellChanged: false,
  maximumShellMovementMm: 0,
  objectPlanNodesChanged: false,
  cp1: {
    finishedFloorToBodyBaseMm: 1315,
    bodyHeightMm: 1261,
    separateTopCasingApproxMm: { min: 30, max: 40 },
  },
  w2: {
    chainApproxMm: [1040, 1516, 75],
    totalApproxMm: 2631,
    previousTopClearanceApproxMm: 700,
    previousTopClearanceStatus: "superseded",
    agreesWithRoomCLocalRange: true,
  },
  outputs: ["svg", "json", "md"].map((extension) => path.relative(repoRoot, path.join(outputDir, `${stem}.${extension}`))),
}, null, 2));

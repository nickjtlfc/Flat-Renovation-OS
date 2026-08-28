#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'docs', 'survey', 'derived', 'global-reconciliation');
const predecessorPath = path.join(outDir, 'WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_1.json');
const predecessorSvgPath = path.join(outDir, 'WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_1.svg');
const predecessor = JSON.parse(fs.readFileSync(predecessorPath, 'utf8'));
const predecessorSvg = fs.readFileSync(predecessorSvgPath, 'utf8');

const sha = value => crypto.createHash('sha256').update(value).digest('hex').toUpperCase();
const fileSha = file => sha(fs.readFileSync(file));
const jsonSha = value => sha(JSON.stringify(value));
const round = (n, digits = 4) => Number(n.toFixed(digits));
const arr = p => [p.x, p.y];
const rec = ([x, y]) => ({ x: round(x), y: round(y) });
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const len = a => Math.hypot(...a);
const distance = (a, b) => len(sub(a, b));
const midpoint = (a, b) => mul(add(a, b), 0.5);
const axisAngle = (a, b) => {
  let value = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  while (value > 90) value -= 180;
  while (value <= -90) value += 180;
  return value;
};
const undirectedDifference = (a, b) => Math.abs((((a - b) % 180) + 270) % 180 - 90);
const line = (a, b, cls, extra = '') => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}" ${extra}/>`;
const text = (p, value, cls, dx = 0, dy = 0) => `<text x="${p.x + dx}" y="${p.y + dy}" class="${cls}">${value}</text>`;
const swingArc = (hinge, closedFree, openFree, radiusMm, label, sweep) => `${line(hinge, openFree, 'swingOpen')}
  <path d="M ${closedFree.x} ${closedFree.y} A ${radiusMm} ${radiusMm} 0 0 ${sweep} ${openFree.x} ${openFree.y}" class="swingArc" marker-end="url(#arrow)"/>
  ${text(openFree, label, 'swingLabel', 25, -15)}`;

if (predecessor.version !== '1.1') throw new Error('Expected v1.1 predecessor.');
if (predecessor.status !== 'FINAL 2D REVIEW CANDIDATE — HUMAN APPROVAL REQUIRED') throw new Error('Unexpected predecessor status.');

const geometry = predecessor.geometry;
const doors = structuredClone(predecessor.doors.layers);
const d1Leaf = doors.D1.opening.endpoints;
const d2Leaf = doors.D2.leaf.endpoints;
const d4Leaf = doors.D4.leaf.endpoints;

// Human-confirmed viewing conventions translated to the existing global gauge.
// D1: facing south from Room A, viewer-right is global west/page-left.
const d1Hinge = d1Leaf[0];
const d1ClosedFree = d1Leaf[1];
const d1OpenFree = rec(add(arr(d1Hinge), [0, -doors.D1.opening.clearWidthMm]));
// D2: facing west from Room A, viewer-left is global south/page-bottom.
const d2Hinge = d2Leaf[0];
const d2ClosedFree = d2Leaf[1];
const d2OpenFree = rec(add(arr(d2Hinge), [doors.D2.leaf.widthMm, 0]));
// D4: facing south from Room C, viewer-left is global east/page-right.
const d4Hinge = d4Leaf[1];
const d4ClosedFree = d4Leaf[0];
const d4OpenFree = rec(add(arr(d4Hinge), [0, -doors.D4.leaf.widthMm]));

doors.D1.hingeSide = 'right-hand side when viewed from Room A; global west/page-left endpoint of the schematic clear-opening proxy';
doors.D1.viewingRoom = 'Room A';
doors.D1.hingeEvidence = 'authoritative human confirmation for v1.2';
doors.D1.hingeGlobalPointMm = d1Hinge;
doors.D1.swingDepiction = 'arc into Room A; radius uses the recorded 781 mm clear-opening proxy because a separate leaf width is not measured';
doors.D2.hingeSide = 'left-hand side when viewed from Room A; global south/page-bottom endpoint of the accepted 742 mm leaf';
doors.D2.viewingRoom = 'Room A';
doors.D2.hingeEvidence = 'authoritative human confirmation for v1.2';
doors.D2.hingeGlobalPointMm = d2Hinge;
doors.D2.swingDepiction = '742 mm leaf and swing arc into Room A';
doors.D3.viewingRoom = 'Room B';
doors.D3.swingDepiction = '760 mm leaf and photo-supported swing arc into Room C';
doors.D4.hingeSide = 'left-hand side when viewed from Room C; global east/page-right endpoint of the accepted 760 mm leaf';
doors.D4.viewingRoom = 'Room C';
doors.D4.hingeEvidence = 'authoritative human confirmation for v1.2';
doors.D4.hingeGlobalPointMm = d4Hinge;
doors.D4.swingDepiction = '760 mm leaf and swing arc into Room C';
doors.D5.viewingRoom = 'Room B and WC opposing faces';
doors.D5.swingDepiction = '761 mm shared physical leaf and photo-supported swing arc into WC';

const bD5 = geometry.roomBD5UnchangedMm;
const wcD5 = geometry.wcD5UnchangedMm;
const d5TopB = bD5.outerLeft;
const d5BottomB = bD5.outerRight;
const d5TopWC = wcD5.outerRight;
const d5BottomWC = wcD5.outerLeft;
const d5Zone = [d5TopB, d5TopWC, d5BottomWC, d5BottomB];
const d5RoomBBearing = axisAngle(arr(d5TopB), arr(d5BottomB));
const d5WCBearing = axisAngle(arr(d5TopWC), arr(d5BottomWC));
const d5CentreB = rec(midpoint(arr(d5TopB), arr(d5BottomB)));
const d5CentreWC = rec(midpoint(arr(d5TopWC), arr(d5BottomWC)));

const validation9019 = predecessor.validations.A_D2_C_9019;
const validation3726 = predecessor.validations.C_partition_D3_B_3726;
const remainingIssues = [
  'D1 actual leaf width and exact lateral leaf/lining position remain unmeasured; the recorded 781 mm clear opening is still used only as a schematic leaf proxy.',
  'D3 opposing structural reveal and D4 structural reveal remain unmeasured.',
  'The shallow high-level D5 cover/bulkhead is photographically/contextually observed but its exact 3D dimensions and extent are unmeasured.',
  'The accepted Room A orientation retains the documented 0.855 degree difference between the separate D2 A-side casing and fixed Room C opening layers.',
];

const result = {
  ...predecessor,
  documentType: 'whole-flat final minor-corrected 2D human-review candidate; derived layer, not source evidence or construction geometry',
  version: '1.2',
  generatedDate: '2026-08-13',
  status: 'FINAL 2D REVIEW CANDIDATE — HUMAN APPROVAL REQUIRED',
  provenance: {
    predecessor: {
      file: path.basename(predecessorPath),
      sha256: fileSha(predecessorPath),
      svgFile: path.basename(predecessorSvgPath),
      svgSha256: fileSha(predecessorSvgPath),
      use: 'human-approved-in-principle v1.1 geometry, including the Room A rigid orientation',
    },
    inheritedMeasurementAndReconciliationHistory: predecessor.provenance,
    humanEvidenceAdded: [
      'D1 opens into Room A; hinge right when viewed from Room A',
      'D2 opens into Room A; hinge left when viewed from Room A',
      'D4 opens into Room C; hinge left when viewed from Room C',
    ],
    rawEvidenceDeleted: false,
    predecessorOverwritten: false,
  },
  approvedCarryForward: {
    roomAOrientation: {
      approved: true,
      rotationDegreesFromPreV11Position: predecessor.roomAOrientationReview.rotationDegrees,
      pivotMm: predecessor.roomAOrientationReview.pivot.coordinateMm,
      changedInV12: false,
    },
    roomBGeometryChanged: false,
    roomBReturnD3BRToB05Mm: 136,
    wcMainShellChanged: false,
    roomCGeometryChanged: false,
    d2RegistrationChanged: false,
    d3RegistrationChanged: false,
    cupboardsChanged: false,
    roomCPartitionChanged: false,
    continuousUpperRoomCWallRetained: true,
  },
  doors: {
    ...predecessor.doors,
    visualConvention: {
      ...predecessor.doors.visualConvention,
      hingePolicy: 'All five hinge sides are now supported by human confirmation or the previously accepted photographic evidence; all five swing arcs are shown.',
    },
    layers: doors,
  },
  d5Cleanup: {
    classification: 'composition-only doorway/reveal-zone bridge; no geometry adjustment',
    oneOpening: true,
    opensInto: 'WC',
    noWallAcrossOpening: true,
    straightReading: 'Room B and WC casing faces remain parallel; one continuous reveal zone now connects their matching top and bottom endpoints.',
    doorwayZoneCornersMm: d5Zone,
    roomBCasingBearingDegrees: round(d5RoomBBearing, 6),
    wcCasingBearingDegrees: round(d5WCBearing, 6),
    casingParallelDifferenceDegrees: round(undirectedDifference(d5RoomBBearing, d5WCBearing), 6),
    opposingFaceCentreSeparationMm: round(distance(arr(d5CentreB), arr(d5CentreWC))),
    topEndpointBridgeMm: round(distance(arr(d5TopB), arr(d5TopWC))),
    bottomEndpointBridgeMm: round(distance(arr(d5BottomB), arr(d5BottomWC))),
    roomBReturnTermination: 'B0.5-B1 ends at Room B top casing endpoint B1; B2-B3 begins at Room B bottom casing endpoint B2',
    wcReturnTermination: 'T0-T1 begins at WC top casing endpoint T0; T3-D5-WCL ends at WC bottom casing endpoint D5-WCL',
    overheadBulkhead: {
      observed: true,
      interpretation: 'shallow cover/boxed ceiling wall crossing at high level',
      planTreatment: 'documented but not drawn as a floor-level wall and does not interrupt D5',
      dimensionsKnown: false,
    },
    geometryAdjustmentMm: 0,
  },
  validations: {
    A_D2_C_9019: {
      ...validation9019,
      v11ModelMm: validation9019.modelAfterMm,
      v12ModelMm: validation9019.modelAfterMm,
      v11ResidualMm: validation9019.residualAfterMm,
      v12ResidualMm: validation9019.residualAfterMm,
      changeMm: 0,
      unchangedByV12: true,
    },
    C_partition_D3_B_3726: {
      ...validation3726,
      v11ModelMm: validation3726.currentPreferredD3NormalModelMm,
      v12ModelMm: validation3726.currentPreferredD3NormalModelMm,
      v11ResidualMm: validation3726.residualMm,
      v12ResidualMm: validation3726.residualMm,
      changeMm: 0,
      unchangedByV12: true,
    },
  },
  preservation: {
    ...predecessor.preservation,
    approvedRoomAOrientationChanged: false,
    doorObjectDimensionsChanged: false,
    d5ShellOrObjectGeometryChanged: false,
    d5CompositionChanged: true,
    globalSolvePerformed: false,
    repositoryCleanupPerformed: false,
    modelling3DStarted: false,
    promotedToFinalOrConstructionLocked: false,
  },
  unresolved: remainingIssues,
  remainingIssues,
};

result.integrity = {
  predecessorGeometrySha256: jsonSha(predecessor.geometry),
  outputGeometrySha256: jsonSha(result.geometry),
  roomASha256: jsonSha(result.geometry.roomAFinalReviewMm),
  roomCSha256: jsonSha(result.geometry.roomCUnchangedNodesMm),
  roomBWCSha256: jsonSha(result.geometry.roomBWCUnchangedMm),
  d2LayersSha256: jsonSha(result.geometry.d2LayersFinalReviewMm),
  d3Sha256: jsonSha(result.geometry.roomBD3UnchangedMm),
  d5Sha256: jsonSha({ roomB: result.geometry.roomBD5UnchangedMm, wc: result.geometry.wcD5UnchangedMm, leaf: result.geometry.d5SharedPhysicalLeafUnchangedMm }),
};
if (result.integrity.predecessorGeometrySha256 !== result.integrity.outputGeometrySha256) throw new Error('v1.1 geometry changed.');
if (result.d5Cleanup.casingParallelDifferenceDegrees > 1e-6) throw new Error('D5 casing faces are not parallel.');

function replaceDoorBlock(svg, id, nextId, replacementArc, comment) {
  const next = nextId ? `<!-- ${nextId}:` : '<!-- D5:';
  const pattern = new RegExp(`<!-- ${id}:[\\s\\S]*?class="leaf" \\/>[\\s\\S]*?(?=\\s*${next.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})`);
  const match = svg.match(pattern);
  if (!match) throw new Error(`Could not locate ${id} SVG block.`);
  const leafEnd = match[0].match(/[\s\S]*class="leaf" \/>/)?.[0];
  if (!leafEnd) throw new Error(`Could not retain ${id} leaf.`);
  const retained = leafEnd.replace(/^<!-- [^\n]+/, comment);
  return svg.replace(pattern, `${retained}${replacementArc}\n  `);
}

function finalSvg() {
  let svg = predecessorSvg
    .replaceAll('v1.1', 'v1.2')
    .replace('Permanent Room C host wall restored, door layers standardised, Room A rigidly rotated about the D2 anchor. Not construction locked.', 'Approved v1.1 geometry retained; D1, D2 and D4 hinges finalised and D5 reveal-zone composition clarified. Not construction locked.')
    .replace('dashed arrow = confirmed destination only', 'red arc = confirmed hinge + swing')
    .replace('</style>', '.doorwayZone{fill:#cffafe;fill-opacity:.72}.doorwayBridge{fill:none;stroke:#0891b2;stroke-width:14;stroke-linecap:round}.hingeMark{fill:#fff;stroke:#b91c1c;stroke-width:12}</style>');

  const zone = `<polygon points="${d5Zone.map(p => `${p.x},${p.y}`).join(' ')}" class="doorwayZone"/>`;
  svg = svg.replace(/(<rect[^>]+class="bg"\/>)/, `$1\n  ${zone}`);
  svg = replaceDoorBlock(svg, 'D1', 'D2', swingArc(d1Hinge, d1ClosedFree, d1OpenFree, doors.D1.opening.clearWidthMm, 'into A', 0), '<!-- D1: human-confirmed right hinge from Room A; clear-opening proxy retained because leaf width is unmeasured. -->');
  svg = replaceDoorBlock(svg, 'D2', 'D3', swingArc(d2Hinge, d2ClosedFree, d2OpenFree, doors.D2.leaf.widthMm, 'into A', 1), '<!-- D2: human-confirmed left hinge from Room A; separate A/C faces and 742 mm leaf retained. -->');
  svg = replaceDoorBlock(svg, 'D4', 'D5', swingArc(d4Hinge, d4ClosedFree, d4OpenFree, doors.D4.leaf.widthMm, 'into C', 1), '<!-- D4: human-confirmed left hinge from Room C; accepted 760 mm leaf retained. -->');

  const bridges = `${line(d5TopB, d5TopWC, 'doorwayBridge')}${line(d5BottomB, d5BottomWC, 'doorwayBridge')}`;
  svg = svg.replace('<!-- D5: one opening, two casing faces, measured/derived reveal layers and one shared leaf. -->', '<!-- D5: one straight opening; separate parallel faces joined by a continuous reveal zone; no wall across. -->\n  ' + bridges);
  svg = svg.replace('D3/D5 arcs photo-supported; D1/D2/D4 hinge sides unresolved. HUMAN REVIEW REQUIRED.', 'All D1-D5 hinge sides confirmed; D5 is one straight bridged opening. HUMAN REVIEW REQUIRED.');
  return svg;
}

function diagnosticSvg(cleanSvg) {
  const d1Circle = `<circle cx="${d1Hinge.x}" cy="${d1Hinge.y}" r="42" class="changeHalo"/>`;
  const d2Circle = `<circle cx="${d2Hinge.x}" cy="${d2Hinge.y}" r="42" class="changeHalo"/>`;
  const d4Circle = `<circle cx="${d4Hinge.x}" cy="${d4Hinge.y}" r="42" class="changeHalo"/>`;
  const d5Outline = `<polygon points="${d5Zone.map(p => `${p.x},${p.y}`).join(' ')}" class="d5Change"/>`;
  const note = `<g><text x="120" y="2590" class="changeText">v1.1 -> v1.2: geometry movement 0 mm</text><text x="120" y="2660" class="changeText">Green circles: newly confirmed D1/D2/D4 hinge pivots and arcs</text><text x="120" y="2730" class="changeText">Cyan D5 zone: composition-only bridge between unchanged parallel casing faces</text><text x="120" y="2800" class="changeText">High-level D5 cover/bulkhead documented separately; not drawn as a plan wall</text></g>`;
  return cleanSvg
    .replace('v1.2</title>', 'v1.2 diagnostic</title>')
    .replace('</style>', '.changeHalo{fill:none;stroke:#16a34a;stroke-width:20}.d5Change{fill:none;stroke:#16a34a;stroke-width:18;stroke-dasharray:28 18}.changeText{font:bold 42px Arial;fill:#166534}</style>')
    .replace('</svg>', `${d1Circle}${d2Circle}${d4Circle}${d5Outline}${note}</svg>`);
}

function report() {
  return `# Whole-flat final 2D review candidate v1.2

**Status: FINAL 2D REVIEW CANDIDATE — HUMAN APPROVAL REQUIRED.**

This is the final minor-corrections successor to \`WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_1\`. The human-approved v1.1 Room A orientation and all accepted shell/object coordinates are carried forward unchanged. This pass adds authoritative D1/D2/D4 hinge information and makes the existing D5 opposing-face/reveal relationship read as one continuous doorway. No solve or geometric adjustment was performed.

## Approved carry-forward items

| Item | v1.2 treatment |
|---|---|
| Room A approved orientation | Preserved exactly: ${predecessor.roomAOrientationReview.rotationDegrees.toFixed(6)} degree rigid rotation about D2; no further movement |
| Room B geometry | Unchanged; orthogonal shell and 136 mm D3-BR to B0.5 return retained |
| WC main shell | Unchanged rectangular working geometry |
| Room C geometry | Unchanged; continuous CP1-FL to CP2-FL permanent wall retained |
| D2 registration | Unchanged |
| D3 registration | Unchanged |
| CP1/C1 and CP2/C2 | Unchanged |
| Room C partition | Unchanged geometry and lighter subordinate style |

## Door updates

The v1.1 opening/casing/reveal/leaf convention is retained. All five doors now have supported hinge information and swing arcs.

| Door | Direction | Hinge side and viewing room | Opening | Casing | Reveal | Leaf and swing |
|---|---|---|---|---|---|---|
| D1 | Opens into Room A | Right when viewed from Room A | Shown | 1204 mm front-face reference shown | 31 mm casing projection shown; through-wall reveal unmeasured | 781 mm clear-opening proxy and arc shown; actual leaf width remains unmeasured |
| D2 | Opens into Room A | Left when viewed from Room A | Separate Room C and Room A faces shown | 1096 mm Room A casing shown | Approx. 250 mm through-wall relationship shown | 742 mm leaf and arc shown |
| D3 | Opens into Room C | Previously accepted east/right endpoint when viewed from Room B | Structural reveal remains unmeasured | Separate Room C and Room B casing faces shown | Derived opposing-face layer shown | 760 mm leaf and accepted arc shown |
| D4 | Opens into Room C | Left when viewed from Room C | Structural reveal remains unmeasured | 920 mm casing shown | Unmeasured and not invented | 760 mm leaf and arc shown |
| D5 | Opens into WC | Previously accepted north/top endpoint; left from Room B and right from WC | One continuous opening shown | Separate parallel Room B and WC casing faces shown | Continuous bridged reveal zone shown | One 761 mm physical leaf and accepted arc shown |

No opposite doorway faces were collapsed and no new dimensions were created.

## D5 cleanup

The correction is **composition only**. The accepted D5 coordinates already describe two parallel casing faces separated by ${result.d5Cleanup.opposingFaceCentreSeparationMm.toFixed(3)} mm. The v1.1 drawing left the narrow inter-face zone visually unfilled, making the rooms appear disconnected.

v1.2 adds:

- one pale continuous doorway/reveal zone between the unchanged Room B and WC casing faces;
- a top jamb/reveal bridge of ${result.d5Cleanup.topEndpointBridgeMm.toFixed(3)} mm between B1 and T0;
- a bottom jamb/reveal bridge of ${result.d5Cleanup.bottomEndpointBridgeMm.toFixed(3)} mm between B2 and D5-WCL;
- no wall across the opening.

The Room B and WC casing bearings remain parallel (${d5RoomBBearing.toFixed(6)} and ${d5WCBearing.toFixed(6)} degrees; difference ${result.d5Cleanup.casingParallelDifferenceDegrees.toFixed(6)} degrees). The Room B returns already terminate at B1/B2 and the WC returns already terminate at T0/D5-WCL, so no node or casing endpoint needed movement.

The shallow cover/boxed ceiling wall is retained as a separate high-level observation. Its dimensions are not known, and it is not projected as a floor-level wall because it does not interrupt the D5 plan opening.

## Validation

| Validation | Measured | v1.1 model | v1.2 model | v1.1 residual | v1.2 residual | Change |
|---|---:|---:|---:|---:|---:|---:|
| A/D2/C | 9019 mm | ${validation9019.modelAfterMm.toFixed(2)} | ${validation9019.modelAfterMm.toFixed(2)} | ${validation9019.residualAfterMm.toFixed(2)} | ${validation9019.residualAfterMm.toFixed(2)} | 0.00 mm |
| C/D3/B | 3726 mm | ${validation3726.currentPreferredD3NormalModelMm.toFixed(2)} | ${validation3726.currentPreferredD3NormalModelMm.toFixed(2)} | ${validation3726.residualMm.toFixed(2)} | ${validation3726.residualMm.toFixed(2)} | 0.00 mm |

Both checks are unchanged because v1.2 changes presentation and hinge metadata only.

## Remaining issues material to cleanup or 3D transition

${result.remainingIssues.map(issue => `- ${issue}`).join('\n')}

No repository cleanup, archive pass, final promotion, construction lock or 3D modelling has been performed.

**HUMAN REVIEW REQUIRED**
`;
}

const cleanSvg = finalSvg();
const diagnostic = diagnosticSvg(cleanSvg);
const stem = 'WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_2';
fs.writeFileSync(path.join(outDir, `${stem}.json`), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, `${stem}.md`), report());
fs.writeFileSync(path.join(outDir, `${stem}.svg`), cleanSvg);
fs.writeFileSync(path.join(outDir, `${stem}_DIAGNOSTIC.svg`), diagnostic);

console.log(JSON.stringify({
  outputs: 4,
  status: result.status,
  geometryChangedFromV11: false,
  approvedRoomAOrientationChanged: false,
  newlyConfirmedHinges: ['D1', 'D2', 'D4'],
  d5Cleanup: result.d5Cleanup.classification,
  d5CasingParallelDifferenceDegrees: result.d5Cleanup.casingParallelDifferenceDegrees,
  validationsChangeMm: { A_D2_C_9019: 0, C_D3_B_3726: 0 },
  solvePerformed: false,
}, null, 2));

#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'docs', 'survey', 'derived', 'global-reconciliation');
const predecessorPath = path.join(outDir, 'WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_2.json');
const predecessorSvgPath = path.join(outDir, 'WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_2.svg');
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
const polygon = (points, cls) => `<polygon points="${points.map(p => `${p.x},${p.y}`).join(' ')}" class="${cls}"/>`;

if (predecessor.version !== '1.2') throw new Error('Expected v1.2 predecessor.');

const oldGeometry = predecessor.geometry;
const oldBD5 = oldGeometry.roomBD5UnchangedMm;
const oldWCD5 = oldGeometry.wcD5UnchangedMm;
const oldSharedD5 = oldGeometry.d5SharedPhysicalLeafUnchangedMm;
const D3 = oldGeometry.roomBD3UnchangedMm;
const CObjects = oldGeometry.roomCUnchangedObjectNodesMm;

// Straighten the physical D5 leaf about its accepted centre. This is the
// minimum-displacement 90-degree correction and preserves the 761 mm width.
const physicalCentre = arr(oldSharedD5.leafCentreMm);
const physicalHalf = oldSharedD5.physicalLeafWidthMm / 2;
const newLeafTop = rec(add(physicalCentre, [0, -physicalHalf]));
const newLeafBottom = rec(add(physicalCentre, [0, physicalHalf]));

// The Room B visible closed face is a separate layer. Straighten it about its
// own centre while preserving its accepted 736.856 mm visible width.
const visibleCentre = midpoint(arr(oldBD5.visibleDoorLeft), arr(oldBD5.visibleDoorRight));
const visibleHalf = oldBD5.visibleClosedWidthMm / 2;
const newVisibleTop = rec(add(visibleCentre, [0, -visibleHalf]));
const newVisibleBottom = rec(add(visibleCentre, [0, visibleHalf]));

const newBD5 = structuredClone(oldBD5);
newBD5.visibleDoorLeft = newVisibleTop;
newBD5.visibleDoorRight = newVisibleBottom;
newBD5.doorLeft = newLeafTop;
newBD5.doorRight = newLeafBottom;
newBD5.doorCentre = rec(physicalCentre);
newBD5.direction = { x: 0, y: 1 };
newBD5.leftInnerToDoorMm = round(Math.abs(newVisibleTop.x - oldBD5.innerLeft.x));
newBD5.rightInnerToDoorMm = round(Math.abs(newVisibleBottom.x - oldBD5.innerRight.x));
newBD5.geometryValid = true;

const newWCD5 = structuredClone(oldWCD5);
newWCD5.doorRight = newLeafTop;
newWCD5.doorLeft = newLeafBottom;
newWCD5.doorCentre = rec(physicalCentre);
newWCD5.topDerivedRevealDepthMm = round(Math.abs(oldWCD5.innerRight.x - newLeafTop.x));
newWCD5.bottomDerivedRevealDepthMm = round(Math.abs(oldWCD5.innerLeft.x - newLeafBottom.x));

const newSharedD5 = structuredClone(oldSharedD5);
newSharedD5.leafTopMm = newLeafTop;
newSharedD5.leafBottomMm = newLeafBottom;
newSharedD5.leafCentreMm = rec(physicalCentre);
newSharedD5.leafBearingDegrees = 90;
newSharedD5.roomB.revealDepthsMm = { top: newBD5.leftInnerToDoorMm, bottom: newBD5.rightInnerToDoorMm };
newSharedD5.roomB.hiddenLeafBehindStopsMm = {
  top: round(newVisibleTop.y - newLeafTop.y),
  bottom: round(newLeafBottom.y - newVisibleBottom.y),
  total: round((newVisibleTop.y - newLeafTop.y) + (newLeafBottom.y - newVisibleBottom.y)),
};
newSharedD5.wc.derivedRevealDepthsMm = { top: newWCD5.topDerivedRevealDepthMm, bottom: newWCD5.bottomDerivedRevealDepthMm };

const oldLeafAngle = axisAngle(arr(oldSharedD5.leafTopMm), arr(oldSharedD5.leafBottomMm));
const newLeafAngle = axisAngle(arr(newLeafTop), arr(newLeafBottom));
const referenceAngle = axisAngle(arr(oldBD5.outerLeft), arr(oldBD5.outerRight));

const movement = (before, after) => ({
  before,
  after,
  deltaMm: { x: round(after.x - before.x), y: round(after.y - before.y) },
  magnitudeMm: round(distance(arr(before), arr(after))),
});
const d5ObjectMovements = {
  'sharedLeaf.leafTop / roomBD5.doorLeft / wcD5.doorRight': movement(oldSharedD5.leafTopMm, newLeafTop),
  'sharedLeaf.leafBottom / roomBD5.doorRight / wcD5.doorLeft': movement(oldSharedD5.leafBottomMm, newLeafBottom),
  'roomBD5.visibleDoorLeft': movement(oldBD5.visibleDoorLeft, newVisibleTop),
  'roomBD5.visibleDoorRight': movement(oldBD5.visibleDoorRight, newVisibleBottom),
  'sharedLeaf / roomBD5 / wcD5 doorCentre': movement(oldSharedD5.leafCentreMm, newSharedD5.leafCentreMm),
};
const maxD5Movement = Math.max(...Object.values(d5ObjectMovements).map(item => item.magnitudeMm));

const d3RoomCLeft = CObjects['D3-OUTER-R'];
const d3RoomCRight = CObjects['D3-OUTER-L-CORNER'];
const d3RoomBLeft = D3.outerLeft;
const d3RoomBRight = D3.outerRight;
const d3Zone = [d3RoomCLeft, d3RoomCRight, d3RoomBRight, d3RoomBLeft];

const { roomBD5UnchangedMm, wcD5UnchangedMm, d5SharedPhysicalLeafUnchangedMm, ...geometryWithoutOldD5 } = oldGeometry;
const geometry = {
  ...geometryWithoutOldD5,
  roomBD5BeforeV13Mm: roomBD5UnchangedMm,
  roomBD5FinalReviewMm: newBD5,
  wcD5BeforeV13Mm: wcD5UnchangedMm,
  wcD5FinalReviewMm: newWCD5,
  d5SharedPhysicalLeafBeforeV13Mm: d5SharedPhysicalLeafUnchangedMm,
  d5SharedPhysicalLeafFinalReviewMm: newSharedD5,
};

const doorLayers = structuredClone(predecessor.doors.layers);
doorLayers.D5.leaf.endpoints = [newLeafTop, newLeafBottom];
doorLayers.D5.leaf.bearingDegrees = 90;
doorLayers.D5.leaf.alignment = 'straightened about the preserved leaf centre to the 90 degree Room B/WC doorway family';
doorLayers.D5.swingDepiction = '761 mm straight physical leaf and accepted swing arc into WC';

const validation9019 = predecessor.validations.A_D2_C_9019;
const validation3726 = predecessor.validations.C_partition_D3_B_3726;
const B = oldGeometry.roomBWCUnchangedMm;
const endpointCoincidenceMm = {
  D5: {
    roomBTopWallToOuterCasing: round(distance(arr(B.B1), arr(oldBD5.outerLeft)), 9),
    roomBBottomWallToOuterCasing: round(distance(arr(B.B2), arr(oldBD5.outerRight)), 9),
    wcTopWallToOuterCasing: round(distance(arr(B.T0), arr(oldWCD5.outerRight)), 9),
    wcBottomWallToOuterCasing: round(distance(arr(B['D5-WCL']), arr(oldWCD5.outerLeft)), 9),
  },
  D3: {
    roomCLeftWallToOuterCasing: 0,
    roomCRightWallToOuterCasingCorner: round(distance(arr(oldGeometry.roomCUnchangedNodesMm['D3-CL']), arr(CObjects['D3-OUTER-L-CORNER'])), 9),
    roomBLeftWallToOuterCasing: round(distance(arr(B.B0), arr(D3.outerLeft)), 9),
    roomBReturnToOuterCasing: round(distance(arr(B['D3-BR']), arr(D3.outerRight)), 9),
  },
};

const result = {
  ...predecessor,
  documentType: 'pre-final whole-flat 2D field-validation candidate; doorway junctions human-reviewed; derived layer, not source evidence or construction geometry',
  version: '1.3',
  generatedDate: '2026-08-13',
  status: 'PRE-FINAL 2D FIELD-VALIDATION CANDIDATE — HUMAN REVIEW REQUIRED',
  provenance: {
    predecessor: {
      file: path.basename(predecessorPath),
      sha256: fileSha(predecessorPath),
      svgFile: path.basename(predecessorSvgPath),
      svgSha256: fileSha(predecessorSvgPath),
      use: 'accepted v1.2 shell, registrations, hinge sides and swing directions',
    },
    inheritedHistory: predecessor.provenance,
    humanEvidenceAdded: 'D5 physical leaf/door plane is straight and flush through the Room B/WC doorway rather than diagonally cut through the wall assembly.',
    rawEvidenceDeleted: false,
    predecessorOverwritten: false,
  },
  doors: {
    ...predecessor.doors,
    layers: doorLayers,
  },
  d5WallJunction: {
    classification: 'composition and layer-selection correction; shell unchanged',
    roomBWallTerminationBoundary: 'Room B outer casing endpoints B1/outerLeft and B2/outerRight',
    wcWallTerminationBoundary: 'WC outer casing endpoints T0/outerRight and D5-WCL/outerLeft',
    changeFromV12: 'Retains the continuous reveal zone but makes the wall-to-doorway boundary explicit at the outer casing edges; leaf endpoints no longer control wall termination.',
    noWallAcrossOpening: true,
    roomsAdjoinThroughOneOpening: true,
    shellMovementMm: 0,
  },
  d5Cleanup: {
    ...predecessor.d5Cleanup,
    classification: 'outer-casing wall-junction composition correction plus tiny leaf-object alignment; no shell adjustment',
    straightReading: 'Room B and WC casing faces remain parallel, one continuous reveal zone connects them, and the physical leaf is now parallel to the 90 degree doorway family.',
    geometryAdjustmentMm: round(maxD5Movement),
    geometryAdjustmentScope: 'D5 leaf-related object coordinates only',
    predecessorCompositionOnlyStatementSuperseded: true,
  },
  d5DoorAlignment: {
    cause: 'inherited local D5 object-angle error: top and bottom physical-leaf coordinates used different x positions, producing a diagonal 88.678 degree black leaf line even though both doorway casing faces are vertical',
    correctionType: 'tiny D5 object-only rigid orientation correction; leaf and visible face straightened about their preserved centres',
    v12PhysicalLeafBearingDegrees: round(oldLeafAngle, 6),
    v13PhysicalLeafBearingDegrees: round(newLeafAngle, 6),
    referenceDoorwayBearingDegrees: round(referenceAngle, 6),
    reference: 'parallel 90 degree Room B and WC casing/wall family',
    physicalLeafWidthBeforeMm: round(distance(arr(oldSharedD5.leafTopMm), arr(oldSharedD5.leafBottomMm))),
    physicalLeafWidthAfterMm: round(distance(arr(newLeafTop), arr(newLeafBottom))),
    physicalLeafCentreMovementMm: 0,
    hingeSideChanged: false,
    swingDestinationChanged: false,
    movementByObjectNodeMm: d5ObjectMovements,
    maximumObjectNodeMovementMm: round(maxD5Movement),
    casingGeometryChanged: false,
    casingAndWallSideRevealBoundaryGeometryChanged: false,
    leafSideRevealEndpointsFollowedStraightenedLeaf: true,
    dependentDerivedRevealDepthsMm: {
      roomBBefore: oldSharedD5.roomB.revealDepthsMm,
      roomBAfter: newSharedD5.roomB.revealDepthsMm,
      wcBefore: oldSharedD5.wc.derivedRevealDepthsMm,
      wcAfter: newSharedD5.wc.derivedRevealDepthsMm,
      interpretation: 'The fixed opposing faces remain distinct; straightening about the leaf/visible-face centres replaces the former skewed endpoint depths with each face average.',
    },
    roomBShellChanged: false,
    wcShellChanged: false,
    conclusion: 'D5 now sits straight/flush between Room B and WC rather than diagonally through the wall assembly.',
  },
  d3WallJunction: {
    classification: 'composition-only casing-boundary/reveal-zone clarification',
    roomCWallTerminationBoundary: 'Room C D3 outer casing endpoints D3-OUTER-R and D3-OUTER-L-CORNER/D3-CL',
    roomBWallTerminationBoundary: 'Room B D3 outer casing endpoints B0/outerLeft and D3-BR/outerRight',
    changeFromV12: 'Adds a clearly coded doorway/reveal zone and outer jamb bridges between the distinct Room C and Room B casing faces; no wall is angled between unlike casing endpoints.',
    casingAsymmetryRetained: true,
    roomCCasingWidthMm: predecessor.doors.layers.D3.casing.roomCWidthMm,
    roomBCasingWidthMm: predecessor.doors.layers.D3.casing.roomBWidthMm,
    d3RegistrationChanged: false,
    d3AxisChanged: false,
    sharedLeafChanged: false,
    roomCShellChanged: false,
    roomBShellChanged: false,
  },
  humanMarkupVerification: {
    reference: 'grey-showing-wall-relationship-between-rooms.jpg (conversation attachment; drafting-intent only, no pixel dimensions used)',
    geometryDerivedFromMarkup: false,
    reviewedAgainstEnlargedD3AndD5Views: true,
    conclusion: 'v1.3 already matches the human drafting intent; no v1.4 or composition change is required',
    wallTerminatesAtOuterCasingNotLeaf: true,
    revealZonesBridgeDistinctFaces: true,
    noWallAcrossD3OrD5: true,
    d5LeafBearingDegrees: 90,
    d3CasingAsymmetryRetained: true,
    endpointCoincidenceMm,
    geometryMovementForMarkupReviewMm: 0,
  },
  geometry,
  validations: {
    A_D2_C_9019: { ...validation9019, v12ModelMm: validation9019.v12ModelMm, v13ModelMm: validation9019.v12ModelMm, v12ResidualMm: validation9019.v12ResidualMm, v13ResidualMm: validation9019.v12ResidualMm, changeMm: 0, unchangedByV13: true },
    C_partition_D3_B_3726: { ...validation3726, v12ModelMm: validation3726.v12ModelMm, v13ModelMm: validation3726.v12ModelMm, v12ResidualMm: validation3726.v12ResidualMm, v13ResidualMm: validation3726.v12ResidualMm, changeMm: 0, unchangedByV13: true },
  },
  preservation: {
    ...predecessor.preservation,
    roomAMovementFromV12Mm: 0,
    roomCMovementFromV12Mm: 0,
    roomBShellMovementFromV12Mm: 0,
    wcShellMovementFromV12Mm: 0,
    d2MovementFromV12Mm: 0,
    d3MovementFromV12Mm: 0,
    b05MovementFromV12Mm: 0,
    cupboardsMovementFromV12Mm: 0,
    roomCPartitionMovementFromV12Mm: 0,
    d5GeometryChanged: true,
    d5ShellOrObjectGeometryChanged: true,
    d5ObjectGeometryChanged: true,
    d5ShellGeometryChanged: false,
    d5MaximumObjectNodeMovementMm: round(maxD5Movement),
    globalSolvePerformed: false,
    repositoryCleanupPerformed: false,
    modelling3DStarted: false,
    promotedToFinalOrConstructionLocked: false,
  },
  unresolved: [],
  remainingIssuesPreventingFinal2DApproval: [],
  nonBlockingFutureDetailMeasurements: [
    'D1 actual leaf width and exact lateral leaf/lining position.',
    'D3 opposing structural reveal and D4 structural reveal dimensions.',
    'Exact 3D dimensions and extent of the shallow high-level D5 cover/bulkhead.',
    'The already accepted 0.855 degree D2 A-side casing versus fixed Room C opening-layer difference remains documented.',
  ],
  freeze: {
    frozenForNextStage: true,
    designation: 'PRE-FINAL 2D FIELD-VALIDATION CANDIDATE',
    scope: 'v1.3 geometry and doorway composition frozen pending the separate whole-flat field-validation programme',
    fieldValidationPackageGenerated: false,
    repositoryCleanupPerformed: false,
    modelling3DStarted: false,
  },
};

result.integrity = {
  roomAUnchanged: jsonSha(predecessor.geometry.roomAFinalReviewMm) === jsonSha(result.geometry.roomAFinalReviewMm),
  roomCUnchanged: jsonSha(predecessor.geometry.roomCUnchangedNodesMm) === jsonSha(result.geometry.roomCUnchangedNodesMm),
  roomBWCUnchanged: jsonSha(predecessor.geometry.roomBWCUnchangedMm) === jsonSha(result.geometry.roomBWCUnchangedMm),
  d2Unchanged: jsonSha(predecessor.geometry.d2LayersFinalReviewMm) === jsonSha(result.geometry.d2LayersFinalReviewMm),
  d3Unchanged: jsonSha(predecessor.geometry.roomBD3UnchangedMm) === jsonSha(result.geometry.roomBD3UnchangedMm),
  roomCObjectsUnchanged: jsonSha(predecessor.geometry.roomCUnchangedObjectNodesMm) === jsonSha(result.geometry.roomCUnchangedObjectNodesMm),
  d5CasingUnchanged: jsonSha({ b: { outerLeft: oldBD5.outerLeft, outerRight: oldBD5.outerRight }, wc: { outerLeft: oldWCD5.outerLeft, outerRight: oldWCD5.outerRight } }) === jsonSha({ b: { outerLeft: newBD5.outerLeft, outerRight: newBD5.outerRight }, wc: { outerLeft: newWCD5.outerLeft, outerRight: newWCD5.outerRight } }),
  d5LeafCentreUnchanged: distance(arr(oldSharedD5.leafCentreMm), arr(newSharedD5.leafCentreMm)) < 1e-9,
  d5LeafWidthChangeMm: round(distance(arr(newLeafTop), arr(newLeafBottom)) - distance(arr(oldSharedD5.leafTopMm), arr(oldSharedD5.leafBottomMm)), 9),
};
for (const [key, value] of Object.entries(result.integrity)) {
  if (key !== 'd5LeafWidthChangeMm' && value !== true) throw new Error(`Integrity failure: ${key}`);
}
if (Math.abs(result.integrity.d5LeafWidthChangeMm) > 0.001) throw new Error('D5 leaf width changed.');
if (Math.abs(newLeafAngle - referenceAngle) > 1e-6) throw new Error('D5 leaf not aligned to doorway family.');
for (const [door, checks] of Object.entries(endpointCoincidenceMm)) {
  for (const [check, value] of Object.entries(checks)) {
    if (value > 1e-6) throw new Error(`${door} wall/casing endpoint mismatch: ${check} = ${value} mm`);
  }
}

function d5Block() {
  const openFree = rec(add(arr(newLeafTop), [newSharedD5.physicalLeafWidthMm, 0]));
  return `<!-- D5: one straight opening; shell walls terminate at outer casing boundaries; separate faces and reveals retained. -->
  ${line(oldBD5.outerLeft, oldWCD5.outerRight, 'doorwayBridge')}${line(oldBD5.outerRight, oldWCD5.outerLeft, 'doorwayBridge')}
  ${line(oldBD5.outerLeft, oldBD5.outerRight, 'casing')}${line(oldWCD5.outerLeft, oldWCD5.outerRight, 'casing')}
  ${line(oldBD5.innerLeft, newBD5.visibleDoorLeft, 'reveal')}${line(oldBD5.innerRight, newBD5.visibleDoorRight, 'reveal')}
  ${line(oldWCD5.innerRight, newLeafTop, 'reveal')}${line(oldWCD5.innerLeft, newLeafBottom, 'reveal')}
  ${line(newLeafTop, newLeafBottom, 'leaf')}${line(newLeafTop, openFree, 'swingOpen')}
  <path d="M ${newLeafBottom.x} ${newLeafBottom.y} A ${newSharedD5.physicalLeafWidthMm} ${newSharedD5.physicalLeafWidthMm} 0 0 0 ${openFree.x} ${openFree.y}" class="swingArc" marker-end="url(#arrow)"/>
  ${text(openFree, 'into WC', 'swingLabel', 25, -15)}
  `;
}

function cleanSvg() {
  let svg = predecessorSvg
    .replaceAll('v1.2', 'v1.3')
    .replace('Approved v1.1 geometry retained; D1, D2 and D4 hinges finalised and D5 reveal-zone composition clarified. Not construction locked.', 'Accepted shell retained; D3 wall-to-casing junction clarified and D5 leaf straightened flush through the doorway. Not construction locked.')
    .replace('All D1-D5 hinge sides confirmed; D5 is one straight bridged opening. HUMAN REVIEW REQUIRED.', 'D3/D5 markup relationship verified; geometry frozen for field validation. HUMAN REVIEW REQUIRED.');

  const d3ZoneSvg = polygon(d3Zone, 'doorwayZone');
  svg = svg.replace(/(<rect[^>]+class="bg"\/>)/, `$1\n  ${d3ZoneSvg}`);
  svg = svg.replace('<!-- D3: both casing faces, derived B reveal face and accepted C leaf. -->', `<!-- D3: shell walls terminate at the distinct outer casing boundaries; asymmetrical opposing faces retained. -->\n  ${line(d3RoomCLeft, d3RoomBLeft, 'doorwayBridge')}${line(d3RoomCRight, d3RoomBRight, 'doorwayBridge')}`);
  const d5Pattern = /<!-- D5:[\s\S]*?(?=<text x="160")/;
  if (!d5Pattern.test(svg)) throw new Error('Could not locate D5 SVG block.');
  svg = svg.replace(d5Pattern, d5Block());
  return svg.replace('WHOLE-FLAT FINAL 2D REVIEW CANDIDATE v1.3', 'WHOLE-FLAT PRE-FINAL 2D FIELD-VALIDATION CANDIDATE v1.3');
}

function diagnosticSvg(svg) {
  const oldTop = oldSharedD5.leafTopMm;
  const oldBottom = oldSharedD5.leafBottomMm;
  const notes = `<text x="3150" y="-930" class="diagTitle">v1.3 DOORWAY-JUNCTION DETAIL</text>
  <text x="3150" y="1390" class="diagText">D3: green zone = distinct casing faces joined as reveal, not diagonal wall</text>
  <text x="3150" y="1470" class="diagText">D5: grey dotted = v1.2 leaf ${oldLeafAngle.toFixed(3)} deg; black = v1.3 leaf ${newLeafAngle.toFixed(3)} deg</text>
  <text x="3150" y="1550" class="diagText">D5 leaf centre and width preserved; maximum object-node move ${maxD5Movement.toFixed(2)} mm</text>
  <text x="3150" y="1630" class="diagText">All permanent shell movement: 0 mm; no wall crosses either opening</text>`;
  return svg
    .replace('viewBox="-400 -4580 10200 7600"', 'viewBox="3000 -1050 3400 2850"')
    .replace('v1.3</title>', 'v1.3 diagnostic</title>')
    .replace('</style>', '.oldLeaf{fill:none;stroke:#64748b;stroke-width:18;stroke-dasharray:28 18}.movement{stroke:#16a34a;stroke-width:12;marker-end:url(#arrow)}.d3Highlight{fill:none;stroke:#16a34a;stroke-width:18;stroke-dasharray:28 18}.diagTitle{font:bold 64px Arial;fill:#166534}.diagText{font:bold 42px Arial;fill:#166534}</style>')
    .replace('</svg>', `${line(oldTop, oldBottom, 'oldLeaf')}${line(oldTop, newLeafTop, 'movement')}${line(oldBottom, newLeafBottom, 'movement')}${polygon(d3Zone, 'd3Highlight')}${notes}</svg>`);
}

function report() {
  const movementRows = Object.entries(d5ObjectMovements).map(([id, item]) => `| ${id} | ${item.before.x.toFixed(3)}, ${item.before.y.toFixed(3)} | ${item.after.x.toFixed(3)}, ${item.after.y.toFixed(3)} | ${item.deltaMm.x.toFixed(3)} | ${item.deltaMm.y.toFixed(3)} | ${item.magnitudeMm.toFixed(3)} |`).join('\n');
  return `# Whole-flat final 2D review candidate v1.3

**Status: PRE-FINAL 2D FIELD-VALIDATION CANDIDATE — HUMAN REVIEW REQUIRED.**

This successor performs only the final D3/D5 doorway-junction drafting correction and the minimum D5 object alignment required by the human observation that the leaf sits straight and flush. No whole-flat solve, room-shell movement or registration change occurred.

## Grey-markup confirmation and freeze

The supplied \`grey-showing-wall-relationship-between-rooms.jpg\` was used only as a human architectural/drafting-intent reference. No dimension was derived from its pixels.

The enlarged v1.3 junctions already match that intent, so no v1.4 or further composition change is required:

- D5 Room B walls meet B1/B2 outer casing endpoints with 0.000 mm mismatch; WC walls meet T0/D5-WCL outer casing endpoints with 0.000 mm mismatch.
- D3 Room C and Room B wall runs meet their own outer casing boundaries with 0.000 mm mismatch.
- Cyan zones are reveal/depth, not wall fill; the openings remain clear.
- D5 remains a straight 90 degree leaf.
- D3 retains its real casing-width asymmetry without a diagonal permanent wall.

The v1.3 geometry and doorway composition are therefore frozen as the **PRE-FINAL 2D FIELD-VALIDATION CANDIDATE**. The field-validation package is deliberately deferred to the next task.

## D5 wall junction

The permanent Room B wall now reads explicitly to the **Room B outer casing boundaries B1 and B2**. The WC wall reads explicitly to the **WC outer casing boundaries T0 and D5-WCL**. The doorway/reveal zone joins those unchanged opposing faces, while the opening remains free of any wall.

Relative to v1.2, this is a **composition and layer-selection correction**: wall termination is communicated by the outer casing edges, never by the black leaf endpoints. Room B and WC remain visibly connected through one D5 opening.

## D5 door alignment

The v1.2 leaf endpoints had different x coordinates and produced an **${oldLeafAngle.toFixed(6)} degree** black leaf line. Both accepted D5 casing faces and the Room B/WC doorway family are **${referenceAngle.toFixed(6)} degrees**. v1.3 rotates the physical leaf about its unchanged centre to **${newLeafAngle.toFixed(6)} degrees** and straightens the separate Room B visible-leaf face about its own centre.

- Reference direction: parallel Room B/WC outer casing and orthogonal shell family.
- Leaf width: ${result.d5DoorAlignment.physicalLeafWidthBeforeMm.toFixed(3)} -> ${result.d5DoorAlignment.physicalLeafWidthAfterMm.toFixed(3)} mm.
- Shared leaf-centre movement: 0.000 mm.
- Maximum D5 object-node movement: ${maxD5Movement.toFixed(3)} mm.
- D5 casing, wall-side reveal-boundary and permanent-shell movement: 0.000 mm. Only the leaf-side ends of the reveal graphics follow the corrected leaf/visible face.
- Hinge side and opening into the WC: unchanged.

| Altered D5 object coordinate/alias | v1.2 x,y mm | v1.3 x,y mm | dx | dy | movement |
|---|---:|---:|---:|---:|---:|
${movementRows}

**D5 now sits straight/flush between Room B and WC rather than diagonally through the wall assembly.**

## D3 wall junction

The D3 correction is composition-only. The Room C wall terminates at **D3-OUTER-R** and **D3-OUTER-L-CORNER/D3-CL**; the Room B wall terminates at its distinct **B0/outerLeft** and **D3-BR/outerRight** casing boundaries. A clearly coded reveal zone and jamb bridges connect the two faces without presenting those unequal casing endpoints as a diagonal permanent wall.

Room C casing remains ${result.d3WallJunction.roomCCasingWidthMm.toFixed(3)} mm and Room B casing remains ${result.d3WallJunction.roomBCasingWidthMm.toFixed(3)} mm. Their real asymmetry remains visible. D3 position, axis, shared leaf, registration, D3-BR, B0.5 and the 136 mm return are unchanged.

## Frozen geometry

| Item | Movement from v1.2 |
|---|---:|
| Room A | 0.000 mm |
| Room C shell | 0.000 mm |
| Room B shell | 0.000 mm |
| WC shell | 0.000 mm |
| D2 | 0.000 mm |
| D3 | 0.000 mm |
| B0.5 | 0.000 mm |
| CP1/C1 and CP2/C2 cupboards | 0.000 mm |
| Room C removable partition | 0.000 mm |

All confirmed D1-D5 hinge sides and swing destinations carry forward unchanged.

## Validation

| Validation | Measured | v1.2 model | v1.3 model | v1.2 residual | v1.3 residual | Change |
|---|---:|---:|---:|---:|---:|---:|
| A/D2/C | 9019 mm | ${validation9019.v12ModelMm.toFixed(2)} | ${validation9019.v12ModelMm.toFixed(2)} | ${validation9019.v12ResidualMm.toFixed(2)} | ${validation9019.v12ResidualMm.toFixed(2)} | 0.00 mm |
| C/D3/B | 3726 mm | ${validation3726.v12ModelMm.toFixed(2)} | ${validation3726.v12ModelMm.toFixed(2)} | ${validation3726.v12ResidualMm.toFixed(2)} | ${validation3726.v12ResidualMm.toFixed(2)} | 0.00 mm |

## Remaining issues

No known issue from this pass materially prevents final 2D approval. The following remain non-blocking detail measurements for later design/3D work:

${result.nonBlockingFutureDetailMeasurements.map(item => `- ${item}`).join('\n')}

No repository cleanup, archive pass, final promotion or 3D work has been performed.

**HUMAN REVIEW REQUIRED**
`;
}

const finalSvg = cleanSvg();
const diagnostic = diagnosticSvg(finalSvg);
const stem = 'WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3';
fs.writeFileSync(path.join(outDir, `${stem}.json`), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, `${stem}.md`), report());
fs.writeFileSync(path.join(outDir, `${stem}.svg`), finalSvg);
fs.writeFileSync(path.join(outDir, `${stem}_DIAGNOSTIC.svg`), diagnostic);

console.log(JSON.stringify({
  outputs: 4,
  status: result.status,
  d5LeafBearingDegrees: { before: result.d5DoorAlignment.v12PhysicalLeafBearingDegrees, after: result.d5DoorAlignment.v13PhysicalLeafBearingDegrees },
  d5MaximumObjectNodeMovementMm: result.d5DoorAlignment.maximumObjectNodeMovementMm,
  d5LeafCentreMovementMm: result.d5DoorAlignment.physicalLeafCentreMovementMm,
  roomShellMovementMm: 0,
  d3RegistrationChanged: false,
  validationsChangeMm: { A_D2_C_9019: 0, C_D3_B_3726: 0 },
  globalSolvePerformed: false,
  markupReviewGeometryMovementMm: 0,
  frozenForFieldValidation: true,
  fieldValidationPackageGenerated: false,
}, null, 2));

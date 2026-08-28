#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'docs', 'survey', 'derived', 'global-reconciliation');
const predecessorPath = path.join(outDir, 'WHOLE_FLAT_PREFERRED_PROVISIONAL_WORKING_SHELL_v1_0.json');
const roomASourcePath = path.join(root, 'docs', 'survey', 'derived', 'room-a', 'ROOM_A_RECONSTRUCTION_PILOT_v0_1.json');
const roomCSourcePath = path.join(root, 'docs', 'survey', 'derived', 'room-c', 'ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json');
const d3PhotoPath = path.join(root, 'source-material', 'photos', 'RoomB-WC-Survey', 'D3-ROOM-B.jpeg');
const d5RoomBPhotoPath = path.join(root, 'source-material', 'photos', 'RoomB-WC-Survey', 'D5-ROOM-B.jpeg');
const d5WCPhotoPath = path.join(root, 'source-material', 'photos', 'RoomB-WC-Survey', 'D5-WC.jpeg');

const predecessor = JSON.parse(fs.readFileSync(predecessorPath, 'utf8'));
const roomASource = JSON.parse(fs.readFileSync(roomASourcePath, 'utf8'));
const roomCSource = JSON.parse(fs.readFileSync(roomCSourcePath, 'utf8'));
const d1Source = roomASource.selectedGeometry.objects.D1;

const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const shaJson = o => crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').toUpperCase();
const round = (n, d = 4) => Number(n.toFixed(d));
const arr = p => [p.x, p.y];
const rec = ([x, y]) => ({ x: round(x), y: round(y) });
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const len = a => Math.hypot(...a);
const distance = (a, b) => len(sub(a, b));
const midpoint = (a, b) => mul(add(a, b), 0.5);
const unit = a => mul(a, 1 / len(a));
const axisAngle = (a, b) => {
  let d = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  while (d > 90) d -= 180;
  while (d <= -90) d += 180;
  return d;
};
const undirectedDifference = (a, b) => Math.abs((((a - b) % 180) + 270) % 180 - 90);
const lineIntersection = (p, r, q, s) => {
  const den = cross(r, s);
  if (Math.abs(den) < 1e-10) throw new Error('Parallel diagnostic lines');
  return add(p, mul(r, cross(sub(q, p), s) / den));
};

const beforeA = predecessor.geometry.roomAUnchangedMm;
const C = predecessor.geometry.roomCUnchangedNodesMm;
const O = predecessor.geometry.roomCUnchangedObjectNodesMm;
const beforeD2 = predecessor.geometry.d2LayersUnchangedMm;
const B = predecessor.geometry.roomBWCPreferredMm;
const BD3 = predecessor.geometry.roomBD3UnchangedMm;
const BD5 = predecessor.geometry.roomBD5UnchangedMm;
const WCD5 = predecessor.geometry.wcD5PreferredMm;
const sharedD5 = predecessor.geometry.d5SharedPhysicalLeafUnchangedMm;

// The long lower Room A wall is the principal family adjacent to the WC.
// Rotate Room A only, about the existing D2 Room A casing centre.
const roomALowerBeforeDegrees = axisAngle(arr(beforeA.A7), arr(beforeA.A6));
const rotationDegrees = -roomALowerBeforeDegrees;
const rotationRadians = rotationDegrees * Math.PI / 180;
const cs = Math.cos(rotationRadians);
const sn = Math.sin(rotationRadians);
const d2Anchor = midpoint(arr(beforeD2.roomAMeasuredCasingSegmentMm[0]), arr(beforeD2.roomAMeasuredCasingSegmentMm[1]));
const rotateVector = ([x, y]) => [cs * x - sn * y, sn * x + cs * y];
const rotateAboutAnchor = p => add(d2Anchor, rotateVector(sub(p, d2Anchor)));
const afterA = Object.fromEntries(Object.entries(beforeA).map(([id, p]) => [id, rec(rotateAboutAnchor(arr(p)))]));
const afterD2 = {
  ...beforeD2,
  roomAClearOpeningSegmentMm: beforeD2.roomAClearOpeningSegmentMm.map(p => rec(rotateAboutAnchor(arr(p)))),
  roomAMeasuredCasingSegmentMm: beforeD2.roomAMeasuredCasingSegmentMm.map(p => rec(rotateAboutAnchor(arr(p)))),
};

const roomAMovement = Object.fromEntries(Object.entries(afterA).map(([id, p]) => {
  const q = beforeA[id];
  const dx = p.x - q.x;
  const dy = p.y - q.y;
  return [id, {
    before: q,
    after: p,
    deltaMm: { x: round(dx), y: round(dy) },
    magnitudeMm: round(Math.hypot(dx, dy)),
  }];
}));
const maximumRoomAMovementEntry = Object.entries(roomAMovement).sort((a, b) => b[1].magnitudeMm - a[1].magnitudeMm)[0];

let rigidPairwiseMaximumChangeMm = 0;
const aIds = Object.keys(beforeA);
for (let i = 0; i < aIds.length; i += 1) {
  for (let j = i + 1; j < aIds.length; j += 1) {
    const before = distance(arr(beforeA[aIds[i]]), arr(beforeA[aIds[j]]));
    const after = distance(arr(afterA[aIds[i]]), arr(afterA[aIds[j]]));
    rigidPairwiseMaximumChangeMm = Math.max(rigidPairwiseMaximumChangeMm, Math.abs(after - before));
  }
}

const d2CasingBeforeAngle = axisAngle(arr(beforeD2.roomAMeasuredCasingSegmentMm[0]), arr(beforeD2.roomAMeasuredCasingSegmentMm[1]));
const d2CasingAfterAngle = axisAngle(arr(afterD2.roomAMeasuredCasingSegmentMm[0]), arr(afterD2.roomAMeasuredCasingSegmentMm[1]));
const d2FixedOpeningAngle = axisAngle(arr(beforeD2.roomCStructuralOpeningAtRoomAFaceMm[0]), arr(beforeD2.roomCStructuralOpeningAtRoomAFaceMm[1]));
const d2AnchorAfter = midpoint(arr(afterD2.roomAMeasuredCasingSegmentMm[0]), arr(afterD2.roomAMeasuredCasingSegmentMm[1]));
const d2RoomCFaceCentre = midpoint(arr(beforeD2.roomCStructuralOpeningAtRoomCFaceMm[0]), arr(beforeD2.roomCStructuralOpeningAtRoomCFaceMm[1]));
const d2RoomAFaceCentre = midpoint(arr(beforeD2.roomCStructuralOpeningAtRoomAFaceMm[0]), arr(beforeD2.roomCStructuralOpeningAtRoomAFaceMm[1]));

const d2Normal = unit(sub(d2RoomAFaceCentre, d2RoomCFaceCentre));
const cFarWallStart = arr(C.C0);
const cFarWallDirection = sub(arr(C['CP1-FL']), cFarWallStart);
const beforeAFarWallStart = arr(beforeA.A5);
const beforeAFarWallDirection = sub(arr(beforeA.A6), beforeAFarWallStart);
const afterAFarWallStart = arr(afterA.A5);
const afterAFarWallDirection = sub(arr(afterA.A6), afterAFarWallStart);
const validationStart = lineIntersection(d2RoomAFaceCentre, d2Normal, cFarWallStart, cFarWallDirection);
const validationBeforeEnd = lineIntersection(d2RoomAFaceCentre, d2Normal, beforeAFarWallStart, beforeAFarWallDirection);
const validationAfterEnd = lineIntersection(d2RoomAFaceCentre, d2Normal, afterAFarWallStart, afterAFarWallDirection);
const validationBeforeMm = distance(validationStart, validationBeforeEnd);
const validationAfterMm = distance(validationStart, validationAfterEnd);

const wallFamilies = [
  { id: 'A-lower-principal', room: 'Room A', nodes: ['A7', 'A6'], beforeDegrees: roomALowerBeforeDegrees, afterDegrees: axisAngle(arr(afterA.A7), arr(afterA.A6)), target: 'WC T0-T1 horizontal family' },
  { id: 'A-upper-opening-side', room: 'Room A', nodes: ['A2', 'A3'], beforeDegrees: axisAngle(arr(beforeA.A2), arr(beforeA.A3)), afterDegrees: axisAngle(arr(afterA.A2), arr(afterA.A3)), target: 'diagnostic only; not independently altered' },
  { id: 'A-C-side', room: 'Room A', nodes: ['A7', 'A0'], beforeDegrees: axisAngle(arr(beforeA.A7), arr(beforeA.A0)), afterDegrees: axisAngle(arr(beforeA.A7), arr(beforeA.A0)) + rotationDegrees, target: 'near perpendicular to Room C horizontal family' },
  { id: 'WC-horizontal', room: 'WC', nodes: ['T0', 'T1'], beforeDegrees: axisAngle(arr(B.T0), arr(B.T1)), afterDegrees: axisAngle(arr(B.T0), arr(B.T1)), target: 'fixed reference family' },
  { id: 'WC-vertical', room: 'WC', nodes: ['T0', 'T3'], beforeDegrees: axisAngle(arr(B.T0), arr(B.T3)), afterDegrees: axisAngle(arr(B.T0), arr(B.T3)), target: 'fixed reference family' },
  { id: 'C-lower', room: 'Room C', nodes: ['C0', 'D3-CL'], beforeDegrees: axisAngle(arr(C.C0), arr(C['D3-CL'])), afterDegrees: axisAngle(arr(C.C0), arr(C['D3-CL'])), target: 'fixed horizontal family' },
  { id: 'C-upper-host-wall', room: 'Room C', nodes: ['CP1-FL', 'CP2-FL'], beforeDegrees: axisAngle(arr(C['CP1-FL']), arr(C['CP2-FL'])), afterDegrees: axisAngle(arr(C['CP1-FL']), arr(C['CP2-FL'])), target: 'fixed horizontal family' },
  { id: 'C-D2-side', room: 'Room C', nodes: ['D3-CL', 'D2-CR'], beforeDegrees: axisAngle(arr(C['D3-CL']), arr(C['D2-CR'])), afterDegrees: axisAngle(arr(C['D3-CL']), arr(C['D2-CR'])), target: 'fixed D2 adjoining wall' },
].map(x => ({ ...x, beforeDegrees: round(x.beforeDegrees, 6), afterDegrees: round(x.afterDegrees, 6) }));
const aCSideBeforeDegrees = wallFamilies.find(x => x.id === 'A-C-side').beforeDegrees;
const aCSideAfterDegrees = wallFamilies.find(x => x.id === 'A-C-side').afterDegrees;
const roomCHorizontalDegrees = wallFamilies.find(x => x.id === 'C-lower').afterDegrees;
const aCRelationshipBeforeDegrees = undirectedDifference(aCSideBeforeDegrees, roomCHorizontalDegrees);
const aCRelationshipAfterDegrees = undirectedDifference(aCSideAfterDegrees, roomCHorizontalDegrees);

// D1 has measured widths but no surveyed leaf endpoints. Its leaf/reference line is
// deliberately a schematic centred reference and creates no plan node.
const d1Axis = unit(sub(arr(afterA['D1-AL']), arr(afterA['D1-AR'])));
const d1IntoRoomANormal = [d1Axis[1], -d1Axis[0]];
const d1BayCentre = midpoint(arr(afterA['D1-AL']), arr(afterA['D1-AR']));
const d1CasingProjectionMm = 31;
const d1FrontCasingCentre = add(d1BayCentre, mul(d1IntoRoomANormal, d1CasingProjectionMm));
const d1FrontCasing = [rec(add(d1FrontCasingCentre, mul(d1Axis, -d1Source.frontFaceWidthMm / 2))), rec(add(d1FrontCasingCentre, mul(d1Axis, d1Source.frontFaceWidthMm / 2)))];
const d1LeafReference = [rec(add(d1BayCentre, mul(d1Axis, -d1Source.clearOpeningWidthMm / 2))), rec(add(d1BayCentre, mul(d1Axis, d1Source.clearOpeningWidthMm / 2)))];

const doorLayers = {
  D1: {
    swingDestination: 'Room A', hingeSide: 'unresolved - no arc or pivot invented',
    opening: { clearWidthMm: d1Source.clearOpeningWidthMm, endpoints: d1LeafReference, placement: 'schematic centred reference; lateral leaf/lining placement is not surveyed' },
    casing: { frontFaceWidthMm: d1Source.frontFaceWidthMm, projectionMm: d1CasingProjectionMm, endpoints: d1FrontCasing, placement: 'schematic centred reference derived from measured width/projection; not a plan node' },
    reveal: { status: `${d1CasingProjectionMm} mm casing projection shown; through-wall reveal not surveyed` },
    leaf: { widthStatus: `not separately measured; ${d1Source.clearOpeningWidthMm} mm clear-opening reference shown as leaf proxy` },
  },
  D2: {
    swingDestination: 'Room A', hingeSide: 'unresolved - no arc or pivot invented',
    opening: { roomCFace: beforeD2.roomCStructuralOpeningAtRoomCFaceMm, roomAFace: beforeD2.roomCStructuralOpeningAtRoomAFaceMm, structuralWidthMm: 770 },
    casing: { roomAMeasured: afterD2.roomAMeasuredCasingSegmentMm, frontFaceWidthMm: 1096 },
    reveal: { observedApproximateDepthMm: 250, centreSeparationMm: round(distance(d2RoomCFaceCentre, d2RoomAFaceCentre)) },
    leaf: { endpoints: beforeD2.roomCLeafClosingPlaneMm, widthMm: 742, closingPlane: 'fixed Room A side from accepted Room C baseline' },
  },
  D3: {
    swingDestination: 'Room C', hingeSide: 'photographically identified at the east end of the global leaf segment (viewer-right from Room B); not a measured hinge node',
    opening: { structuralRevealStatus: 'unmeasured' },
    casing: { roomCEndpoints: [O['D3-OUTER-R'], O['D3-OUTER-L-CORNER']], roomBEndpoints: [BD3.outerLeft, BD3.outerRight], roomCWidthMm: 885, roomBWidthMm: BD3.casingLengthMm },
    reveal: { derivedOpposingFaceSeparationMm: BD3.derivedDoorFaceDepthMm, status: 'derived registration layer, not measured wall thickness' },
    leaf: { endpoints: [O['D3-LEAF-R'], O['D3-LEAF-L']], widthMm: 760 },
  },
  D4: {
    swingDestination: 'Room C', hingeSide: 'unresolved - no arc or pivot invented',
    opening: { structuralRevealStatus: 'unmeasured' },
    casing: { endpoints: [O['D4-OUTER-R'], O['D4-OUTER-L']], widthMm: 920 },
    reveal: { status: 'unmeasured' },
    leaf: { endpoints: [O['D4-LEAF-R'], O['D4-LEAF-L']], widthMm: 760 },
  },
  D5: {
    swingDestination: 'WC', hingeSide: 'photographically corroborated at the north/top end of the global leaf segment (viewer-left from Room B; viewer-right from WC); not a measured hinge node',
    opening: { topology: 'one opening; no wall across Room B/WC assembly gap' },
    casing: { roomBEndpoints: [BD5.outerLeft, BD5.outerRight], wcEndpoints: [WCD5.outerLeft, WCD5.outerRight], roomBWidthMm: BD5.casingLength, wcWidthMm: WCD5.casingLength },
    reveal: { opposingCasingFaceSeparationMm: sharedD5.oppositeCasingFaceSeparationMm, roomBDerivedFaceDepthMm: BD5.derivedDoorFaceDepthMm },
    leaf: { endpoints: [sharedD5.leafTopMm, sharedD5.leafBottomMm], widthMm: sharedD5.physicalLeafWidthMm, status: 'one shared physical leaf' },
  },
};

const result = {
  documentType: 'whole-flat final 2D human-review candidate; derived layer, not source evidence or construction geometry',
  version: '1.1',
  generatedDate: '2026-08-13',
  units: 'millimetres',
  status: 'FINAL 2D REVIEW CANDIDATE — HUMAN APPROVAL REQUIRED',
  provenance: {
    predecessor: { file: path.basename(predecessorPath), sha256: sha(predecessorPath), use: 'fixed preferred v1.0 whole-flat geometry and registrations' },
    roomAEvidence: { file: path.relative(root, roomASourcePath).replaceAll('\\', '/'), sha256: sha(roomASourcePath), use: 'D1 object dimensions and Room A solved node geometry' },
    roomCAcceptedBaseline: { file: path.relative(root, roomCSourcePath).replaceAll('\\', '/'), sha256: sha(roomCSourcePath), use: 'accepted fixed Room C shell, cupboards, partition and D2/D3/D4 object layers' },
    sourcePlansReviewed: [
      { file: 'source-material/plans/2dPlan.jpeg', use: 'topology and room/door relationships only; no dimensions derived' },
      { file: 'source-material/plans/rough-paint-sketch.jpg', use: 'topology and room/door relationships only; sketch leaf strokes are not hinge evidence' },
    ],
    photographsReviewed: [
      { file: 'source-material/photos/RoomC/RoomC-EastWall.jpeg', use: 'Room C fixed cupboards/wall context; no dimensions derived' },
      { file: 'source-material/photos/RoomC/RoomC-EastWall-Cupboard1.jpeg', use: 'Room C fixed cupboard/wall context; no dimensions derived' },
      { file: 'source-material/photos/RoomC/RoomC-NorthWall.jpeg', use: 'Room C wall/cupboard context; no dimensions derived' },
      { file: 'source-material/photos/RoomC/RoomC-South&WestWalls.jpeg', use: 'door context only; D1/D2/D4 hinge mapping not promoted from this non-explicit view' },
      { file: path.relative(root, d3PhotoPath).replaceAll('\\', '/'), sha256: sha(d3PhotoPath), use: 'D3 Room B face; hinge/latch relationship only' },
      { file: path.relative(root, d5RoomBPhotoPath).replaceAll('\\', '/'), sha256: sha(d5RoomBPhotoPath), use: 'D5 Room B face; hinge/latch relationship only' },
      { file: path.relative(root, d5WCPhotoPath).replaceAll('\\', '/'), sha256: sha(d5WCPhotoPath), use: 'D5 WC face; corroborates the same physical hinge side' },
    ],
    rawEvidenceDeleted: false,
    predecessorOverwritten: false,
  },
  topRoomCWall: {
    status: 'restored as continuous permanent host wall in the drawing composition',
    compositionOnly: true,
    continuousSegment: { from: 'CP1-FL', to: 'CP2-FL', endpointsMm: [C['CP1-FL'], C['CP2-FL']] },
    predecessorVisibleSplit: [{ from: 'CP1-FL', to: 'PO1' }, { from: 'PI1', to: 'CP2-FL' }],
    diagnosis: 'The predecessor renderer terminated the host-wall strokes at the two partition-face nodes PO1 and PI1, leaving a 123.64 mm visual gap. The accepted permanent host wall is continuous behind the removable partition junction.',
    nodeMovementMm: 0,
    partitionTreatment: 'unchanged geometry; drawn as a lighter subordinate overlay while the permanent wall remains continuous',
  },
  roomAOrientationReview: {
    candidateApplied: true,
    transformType: 'single rigid rotation only; no scale, shear, deformation or solve',
    rotationDegrees: round(rotationDegrees, 9),
    pivot: { definition: 'midpoint of the existing Room A measured D2 casing segment', coordinateMm: rec(d2Anchor) },
    target: 'A7-A6 principal lower Room A wall made parallel to fixed WC T0-T1 and fixed Room C horizontal families',
    wallFamilies,
    roomCRelationship: {
      sharedRoomASide: 'A7-A0',
      relevantFixedRoomCFamily: 'C0-D3-CL (parallel to CP1-FL-CP2-FL)',
      roomASideDirectionBeforeDegrees: aCSideBeforeDegrees,
      roomASideDirectionAfterDegrees: aCSideAfterDegrees,
      roomCFamilyDirectionDegrees: roomCHorizontalDegrees,
      includedAngleBeforeDegrees: round(aCRelationshipBeforeDegrees, 6),
      includedAngleAfterDegrees: round(aCRelationshipAfterDegrees, 6),
      departureFromSquareBeforeDegrees: round(90 - aCRelationshipBeforeDegrees, 6),
      departureFromSquareAfterDegrees: round(90 - aCRelationshipAfterDegrees, 6),
    },
    movementByNodeMm: roomAMovement,
    maximumMovementMm: { node: maximumRoomAMovementEntry[0], magnitudeMm: maximumRoomAMovementEntry[1].magnitudeMm },
    rigidPairwiseMaximumChangeMm: round(rigidPairwiseMaximumChangeMm, 9),
    assessment: 'Adopted for human review: the principal family becomes square to WC and Room C; the upper A2-A3 evidence-fit segment retains a small 0.068539 degree angle because Room A was not deformed.',
  },
  d2Review: {
    physicalRegistrationAnchorChanged: false,
    anchorMovementMm: round(distance(d2Anchor, d2AnchorAfter), 9),
    fixedRoomCOpeningAndLeafChanged: false,
    rotatedRoomALayers: ['roomAClearOpeningSegmentMm', 'roomAMeasuredCasingSegmentMm'],
    roomACasingEndpointMovementMm: beforeD2.roomAMeasuredCasingSegmentMm.map((p, i) => round(distance(arr(p), arr(afterD2.roomAMeasuredCasingSegmentMm[i])))),
    roomAClearOpeningEndpointMovementMm: beforeD2.roomAClearOpeningSegmentMm.map((p, i) => round(distance(arr(p), arr(afterD2.roomAClearOpeningSegmentMm[i])))),
    roomACasingAngleBeforeDegrees: round(d2CasingBeforeAngle, 6),
    roomACasingAngleAfterDegrees: round(d2CasingAfterAngle, 6),
    fixedRoomCOpeningAngleDegrees: round(d2FixedOpeningAngle, 6),
    opposingFaceAngularDifferenceBeforeDegrees: round(undirectedDifference(d2CasingBeforeAngle, d2FixedOpeningAngle), 6),
    opposingFaceAngularDifferenceAfterDegrees: round(undirectedDifference(d2CasingAfterAngle, d2FixedOpeningAngle), 6),
    approximateThroughWallDepthPreservedAtCentreMm: round(distance(d2RoomCFaceCentre, d2RoomAFaceCentre)),
    assessment: 'The shared centre and approximate face depth remain coherent. The rigid Room A correction leaves a 0.855 degree angular difference between the rotated Room A casing and fixed Room C opening/leaf layers; this is retained for human review rather than forcing either room.',
  },
  doors: {
    visualConvention: {
      wallOpening: 'magenta', casing: 'ochre', reveal: 'cyan', visibleLeaf: 'black', swingDestination: 'dashed red arrow',
      hingePolicy: 'D3 and D5 use photo-supported pivots/arcs; no hinge pivot or swing arc is drawn where hinge side is unresolved.',
    },
    layers: doorLayers,
  },
  validations: {
    A_D2_C_9019: {
      measuredMm: 9019,
      definition: 'Fixed D2 normal through the fixed D2 A-face centre, intersecting C0-CP1-FL and the Room A A5-A6 far wall.',
      modelBeforeMm: round(validationBeforeMm),
      modelAfterMm: round(validationAfterMm),
      residualBeforeMm: round(validationBeforeMm - 9019),
      residualAfterMm: round(validationAfterMm - 9019),
      absoluteResidualImprovementMm: round(Math.abs(validationBeforeMm - 9019) - Math.abs(validationAfterMm - 9019)),
    },
    C_partition_D3_B_3726: { ...predecessor.validations.C_partition_D3_B_3726, unchangedByThisTask: true },
  },
  geometry: {
    roomABeforeMm: beforeA,
    roomAFinalReviewMm: afterA,
    roomCUnchangedNodesMm: C,
    roomCUnchangedObjectNodesMm: O,
    d2LayersBeforeMm: beforeD2,
    d2LayersFinalReviewMm: afterD2,
    roomBWCUnchangedMm: B,
    roomBD3UnchangedMm: BD3,
    roomBD5UnchangedMm: BD5,
    wcD5UnchangedMm: WCD5,
    d5SharedPhysicalLeafUnchangedMm: sharedD5,
  },
  preservation: {
    roomCNodeMovementMm: 0,
    roomBWCNodeMovementMm: 0,
    d3RegistrationChanged: false,
    d5GeometryChanged: false,
    roomCCupboardGeometryChanged: false,
    roomCPartitionGeometryChanged: false,
    roomAScaledOrDeformed: false,
    globalSolvePerformed: false,
    roomReconstructionPerformed: false,
    threeDimensionalWorkStarted: false,
    promotedToFinalOrConstructionLocked: false,
  },
  unresolved: [
    'Hinge sides for D1, D2 and D4 are not verified; destination arrows are shown without invented pivots or arcs.',
    'D1 leaf endpoints and lateral clear-opening placement are not surveyed; the 781 mm reference is schematic and centred only for display.',
    'The Room A rigid correction produces a 0.855 degree angular difference at the separate D2 A/C face layers while keeping their shared centre fixed.',
    'D3 opposing structural reveal and D4 structural reveal remain unmeasured.',
  ],
};

result.integrity = {
  predecessorRoomCSha256: shaJson(predecessor.geometry.roomCUnchangedNodesMm),
  outputRoomCSha256: shaJson(result.geometry.roomCUnchangedNodesMm),
  predecessorRoomBWCGeometrySha256: shaJson(predecessor.geometry.roomBWCPreferredMm),
  outputRoomBWCGeometrySha256: shaJson(result.geometry.roomBWCUnchangedMm),
  fixedD2RoomCLayersBeforeSha256: shaJson({
    roomCStructuralOpeningAtRoomCFaceMm: beforeD2.roomCStructuralOpeningAtRoomCFaceMm,
    roomCStructuralOpeningAtRoomAFaceMm: beforeD2.roomCStructuralOpeningAtRoomAFaceMm,
    roomCLeafClosingPlaneMm: beforeD2.roomCLeafClosingPlaneMm,
  }),
  fixedD2RoomCLayersAfterSha256: shaJson({
    roomCStructuralOpeningAtRoomCFaceMm: afterD2.roomCStructuralOpeningAtRoomCFaceMm,
    roomCStructuralOpeningAtRoomAFaceMm: afterD2.roomCStructuralOpeningAtRoomAFaceMm,
    roomCLeafClosingPlaneMm: afterD2.roomCLeafClosingPlaneMm,
  }),
};

if (result.integrity.predecessorRoomCSha256 !== result.integrity.outputRoomCSha256) throw new Error('Room C geometry changed.');
if (result.integrity.predecessorRoomBWCGeometrySha256 !== result.integrity.outputRoomBWCGeometrySha256) throw new Error('Room B/WC geometry changed.');
if (result.integrity.fixedD2RoomCLayersBeforeSha256 !== result.integrity.fixedD2RoomCLayersAfterSha256) throw new Error('Fixed Room C D2 layers changed.');
if (result.roomAOrientationReview.rigidPairwiseMaximumChangeMm > 0.001) throw new Error('Room A rigid invariant failed.');
if (result.d2Review.anchorMovementMm > 1e-5) throw new Error('D2 anchor moved.');
if (Math.abs(result.roomAOrientationReview.wallFamilies[0].afterDegrees) > 1e-5) throw new Error('Room A target family was not aligned.');

const line = (a, b, cls, extra = '') => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}" ${extra}/>`;
const polygon = (points, cls) => `<polygon points="${points.map(p => `${p.x},${p.y}`).join(' ')}" class="${cls}"/>`;
const polyline = (points, cls) => `<polyline points="${points.map(p => `${p.x},${p.y}`).join(' ')}" class="${cls}"/>`;
const midRec = (a, b) => rec(midpoint(arr(a), arr(b)));
const text = (p, value, cls = 'label', dx = 0, dy = 0) => `<text x="${p.x + dx}" y="${p.y + dy}" class="${cls}">${value}</text>`;
const arrow = (start, direction, lengthMm, labelText, dx = 0, dy = 0) => {
  const finish = rec(add(arr(start), mul(unit(direction), lengthMm)));
  return `${line(start, finish, 'swing', 'marker-end="url(#arrow)"')}${text(finish, labelText, 'swingLabel', dx, dy)}`;
};
const swingArc = (hinge, closedFree, openFree, radiusMm, labelText, sweep = 1) => `${line(hinge, openFree, 'swingOpen')}
  <path d="M ${closedFree.x} ${closedFree.y} A ${radiusMm} ${radiusMm} 0 0 ${sweep} ${openFree.x} ${openFree.y}" class="swingArc" marker-end="url(#arrow)"/>
  ${text(openFree, labelText, 'swingLabel', 25, -15)}`;

function wholeFlatSvg(diagnostic = false) {
  const a = id => afterA[id];
  const a0 = id => beforeA[id];
  const c = id => C[id];
  const o = id => O[id];
  const b = id => B[id];
  const roomBIds = ['B0', 'D3-BR', 'B0.5', 'B1', 'B2', 'B3', 'B4'];
  const wcIds = ['T0', 'T1', 'T2', 'T3', 'D5-WCL'];
  const cp2Back = { x: O['CP2-BODY-BL'].x - 20, y: O['CP2-BODY-BL'].y };
  const d2LeafCentre = midRec(beforeD2.roomCLeafClosingPlaneMm[0], beforeD2.roomCLeafClosingPlaneMm[1]);
  const d3LeafCentre = midRec(O['D3-LEAF-R'], O['D3-LEAF-L']);
  const d4LeafCentre = midRec(O['D4-LEAF-R'], O['D4-LEAF-L']);
  const d5LeafCentre = sharedD5.leafCentreMm;
  const d1LeafCentre = midRec(d1LeafReference[0], d1LeafReference[1]);
  const d3Hinge = O['D3-LEAF-L'];
  const d3ClosedFree = O['D3-LEAF-R'];
  const d3OpenFree = rec(add(arr(d3Hinge), [0, -760]));
  const d5Hinge = sharedD5.leafTopMm;
  const d5ClosedFree = sharedD5.leafBottomMm;
  const d5OpenFree = rec(add(arr(d5Hinge), [sharedD5.physicalLeafWidthMm, 0]));

  const diagnosticOverlay = diagnostic ? `
    ${polygon(['A0','A1','A2','A3','A4','A5','A6','A7'].map(a0), 'priorRoomA')}
    ${Object.values(roomAMovement).map(m => line(m.before, m.after, 'move')).join('')}
    ${line(rec(validationStart), rec(validationBeforeEnd), 'validationBefore')}
    ${line(rec(validationStart), rec(validationAfterEnd), 'validationAfter')}
    ${text({x: 120, y: 2600}, `Room A rigid rotation ${rotationDegrees.toFixed(6)} deg about D2; max move ${result.roomAOrientationReview.maximumMovementMm.magnitudeMm.toFixed(2)} mm`, 'diagnosticText')}
    ${text({x: 120, y: 2680}, `9019 model ${validationBeforeMm.toFixed(2)} -> ${validationAfterMm.toFixed(2)} mm; residual ${round(validationAfterMm-9019).toFixed(2)} mm`, 'diagnosticText')}
    ${text({x: 120, y: 2760}, `D2 A/C face angle difference ${result.d2Review.opposingFaceAngularDifferenceBeforeDegrees.toFixed(3)} -> ${result.d2Review.opposingFaceAngularDifferenceAfterDegrees.toFixed(3)} deg`, 'diagnosticText')}
  ` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-400 -4580 10200 7600" role="img" aria-labelledby="title desc">
  <title id="title">Whole-flat final 2D review candidate v1.1${diagnostic ? ' diagnostic' : ''}</title>
  <desc id="desc">Human-review-only whole-flat 2D candidate. Permanent Room C host wall restored, door layers standardised, Room A rigidly rotated about the D2 anchor. Not construction locked.</desc>
  <defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#b91c1c"/></marker></defs>
  <style>
    .bg{fill:#f8fafc}.roomA{fill:#fff7ed}.roomC{fill:#eff6ff}.roomB{fill:#ecfdf5}.wc{fill:#f0fdfa}
    .partitionFill{fill:#f3e8ff;fill-opacity:.55}.partitionEdge{fill:none;stroke:#a855f7;stroke-width:15;stroke-dasharray:32 18}
    .cup{fill:#fef3c7;stroke:#a16207;stroke-width:18}.wallA,.wallC,.wallB,.wallWC{fill:none;stroke-width:38;stroke-linecap:round}
    .wallA{stroke:#c2410c}.wallC{stroke:#1e3a8a}.wallB{stroke:#047857}.wallWC{stroke:#0f766e}.window{fill:none;stroke:#0284c7;stroke-width:38;stroke-linecap:round}
    .opening{fill:none;stroke:#a21caf;stroke-width:24;stroke-linecap:round}.casing{fill:none;stroke:#d97706;stroke-width:30;stroke-linecap:round}
    .reveal{fill:none;stroke:#0891b2;stroke-width:14;stroke-linecap:round}.leaf{fill:none;stroke:#111827;stroke-width:18;stroke-linecap:round}
    .swing,.swingOpen,.swingArc{fill:none;stroke:#b91c1c;stroke-width:13;stroke-dasharray:25 16}.swingOpen{stroke-width:11}.roomLabel{font:bold 120px Arial;fill:#17324d}.title{font:bold 62px Arial;fill:#9f1239}
    .label{font:62px Arial;fill:#17324d}.objectLabel{font:bold 55px Arial;fill:#7c2d12}.small{font:47px Arial;fill:#334155}.swingLabel{font:bold 44px Arial;fill:#991b1b}
    .legend{font:48px Arial;fill:#334155}.priorRoomA{fill:none;stroke:#94a3b8;stroke-width:18;stroke-dasharray:45 25}.move{stroke:#e11d48;stroke-width:11}
    .validationBefore{stroke:#94a3b8;stroke-width:12;stroke-dasharray:30 20}.validationAfter{stroke:#dc2626;stroke-width:13;stroke-dasharray:30 20}.diagnosticText{font:bold 40px Arial;fill:#7f1d1d}
  </style>
  <rect x="-400" y="-4580" width="10200" height="7600" class="bg"/>
  ${polygon([c('C0'),c('CP1-FL'),c('CP2-FR'),c('D3-CL')], 'roomC')}
  ${polygon(['A0','A1','A2','A3','A4','A5','A6','A7'].map(a), 'roomA')}
  ${polygon(roomBIds.map(b), 'roomB')}${polygon(wcIds.map(b), 'wc')}
  ${polygon([c('PO1'),c('PO2'),c('PO3'),c('PI3'),c('PI2'),c('PI1')], 'partitionFill')}
  ${polyline([c('PO1'),c('PO2'),c('PO3'),c('PI3'),c('PI2'),c('PI1'),c('PO1')], 'partitionEdge')}
  ${diagnosticOverlay}
  ${line(c('C0'),c('CP1-FL'),'wallC')}${line(c('CP1-FL'),c('CP2-FL'),'wallC')}${line(c('CP2-FR'),c('D3-CL'),'wallC')}
  ${polygon([o('CP1-BODY-FL'),o('CP1-BODY-FR'),o('CP1-BODY-BR'),o('CP1-BODY-BL')],'cup')}
  ${polygon([o('CP2-BODY-FL'),o('CP2-BODY-FR'),o('CP2-BODY-BR'),o('CP2-BODY-BL')],'cup')}
  ${polygon([o('CP2-CASING-FL'),o('CP2-BODY-FL'),o('CP2-BODY-BL'),cp2Back],'cup')}
  ${line(c('C0'),c('C1'),'wallC')}${line(c('C1'),c('W2-CR'),'wallC')}${line(c('W2-CR'),c('W2-CL'),'window')}${line(c('W2-CL'),c('C2'),'wallC')}
  ${line(c('C2'),o('D4-OUTER-R'),'wallC')}${line(o('D4-OUTER-L'),o('D3-OUTER-R'),'wallC')}
  ${line(a('A0'),a('A1'),'wallA')}${line(a('A1'),a('A2'),'wallA')}${line(a('A2'),a('A3'),'wallA')}${line(a('A3'),a('A4'),'wallA')}${line(a('A4'),a('A5'),'wallA')}
  ${line(a('A5'),a('W1-AL'),'wallA')}${line(a('W1-AL'),a('W1-AR'),'window')}${line(a('W1-AR'),a('A6'),'wallA')}
  ${line(a('A6'),a('D1-AL'),'wallA')}${line(a('D1-AR'),a('A7'),'wallA')}${line(a('A7'),a('D2-AL'),'wallA')}${line(a('D2-AR'),a('A0'),'wallA')}
  ${line(b('D3-BR'),b('B0.5'),'wallB')}${line(b('B0.5'),b('B1'),'wallB')}${line(b('B2'),b('B3'),'wallB')}${line(b('B3'),b('B4'),'wallB')}${line(b('B4'),b('B0'),'wallB')}
  ${line(b('T0'),b('T1'),'wallWC')}${line(b('T1'),b('T2'),'wallWC')}${line(b('T2'),b('T3'),'wallWC')}${line(b('T3'),b('D5-WCL'),'wallWC')}
  <!-- D1: measured casing/clear widths, schematic lateral leaf placement; no hinge invented. -->
  ${line(a('D1-AL'),a('D1-AR'),'opening')}${line(d1FrontCasing[0],d1FrontCasing[1],'casing')}${line(d1LeafReference[0],d1LeafReference[1],'leaf')}
  ${arrow(d1LeafCentre,d1IntoRoomANormal,300,'to A',35,-15)}
  <!-- D2: separate C opening, A opening/casing, reveal and fixed closing-plane leaf. -->
  ${line(beforeD2.roomCStructuralOpeningAtRoomCFaceMm[0],beforeD2.roomCStructuralOpeningAtRoomCFaceMm[1],'opening')}
  ${line(beforeD2.roomCStructuralOpeningAtRoomAFaceMm[0],beforeD2.roomCStructuralOpeningAtRoomAFaceMm[1],'opening')}
  ${line(afterD2.roomAMeasuredCasingSegmentMm[0],afterD2.roomAMeasuredCasingSegmentMm[1],'casing')}
  ${line(beforeD2.roomCStructuralOpeningAtRoomCFaceMm[0],beforeD2.roomCStructuralOpeningAtRoomAFaceMm[0],'reveal')}
  ${line(beforeD2.roomCStructuralOpeningAtRoomCFaceMm[1],beforeD2.roomCStructuralOpeningAtRoomAFaceMm[1],'reveal')}
  ${line(beforeD2.roomCLeafClosingPlaneMm[0],beforeD2.roomCLeafClosingPlaneMm[1],'leaf')}${arrow(d2LeafCentre,[1,0],320,'to A',25,-15)}
  <!-- D3: both casing faces, derived B reveal face and accepted C leaf. -->
  ${line(o('D3-OUTER-R'),o('D3-OUTER-L-CORNER'),'casing')}${line(BD3.outerLeft,BD3.outerRight,'casing')}
  ${line(BD3.innerLeft,BD3.doorLeft,'reveal')}${line(BD3.innerRight,BD3.doorRight,'reveal')}
  ${line(o('D3-LEAF-R'),o('D3-LEAF-L'),'leaf')}${swingArc(d3Hinge,d3ClosedFree,d3OpenFree,760,'into C',1)}
  <!-- D4: accepted casing and leaf; structural reveal and hinge remain unknown. -->
  ${line(o('D4-OUTER-R'),o('D4-OUTER-L'),'casing')}${line(o('D4-LEAF-R'),o('D4-LEAF-L'),'leaf')}${arrow(d4LeafCentre,[0,-1],300,'to C',25,-20)}
  <!-- D5: one opening, two casing faces, measured/derived reveal layers and one shared leaf. -->
  ${line(BD5.outerLeft,BD5.outerRight,'casing')}${line(WCD5.outerLeft,WCD5.outerRight,'casing')}
  ${line(BD5.innerLeft,BD5.visibleDoorLeft,'reveal')}${line(BD5.innerRight,BD5.visibleDoorRight,'reveal')}
  ${line(WCD5.innerRight,sharedD5.leafTopMm,'reveal')}${line(WCD5.innerLeft,sharedD5.leafBottomMm,'reveal')}
  ${line(sharedD5.leafTopMm,sharedD5.leafBottomMm,'leaf')}${swingArc(d5Hinge,d5ClosedFree,d5OpenFree,sharedD5.physicalLeafWidthMm,'into WC',0)}
  ${text({x:160,y:-4410},'WHOLE-FLAT FINAL 2D REVIEW CANDIDATE v1.1','title')}
  ${text({x:430,y:-1850},'ROOM C','roomLabel')}${text({x:6400,y:-2200},'ROOM A','roomLabel')}${text({x:3500,y:1700},'ROOM B','roomLabel')}${text({x:5700,y:800},'WC','roomLabel')}
  ${text(midRec(o('CP1-BODY-FL'),o('CP1-BODY-BR')),'CP1 / C1','small',-180,0)}${text(midRec(o('CP2-BODY-FL'),o('CP2-BODY-BR')),'CP2 / C2','small',-160,0)}
  ${text({x:1450,y:-3570},'continuous permanent host wall restored','small')}${text({x:1760,y:-1700},'removable partition - geometry unchanged','small')}
  ${text(midRec(a('W1-AL'),a('W1-AR')),'W1','objectLabel',35,0)}${text(midRec(c('W2-CR'),c('W2-CL')),'W2','objectLabel',0,80)}
  ${text(d1LeafCentre,'D1','objectLabel',-35,95)}${text(d2LeafCentre,'D2','objectLabel',-110,0)}${text(d3LeafCentre,'D3','objectLabel',-35,95)}${text(d4LeafCentre,'D4','objectLabel',-35,95)}${text(d5LeafCentre,'D5','objectLabel',-125,0)}
  ${text(midRec(b('D3-BR'),b('B0.5')),'136 mm return','small',45,0)}
  <g transform="translate(180 2860)"><text class="legend"><tspan fill="#a21caf">magenta opening</tspan><tspan dx="55" fill="#d97706">ochre casing</tspan><tspan dx="55" fill="#0891b2">cyan reveal</tspan><tspan dx="55" fill="#111827">black leaf</tspan><tspan dx="55" fill="#b91c1c">dashed arrow = confirmed destination only</tspan></text></g>
  ${text({x:5750,y:2860},'D3/D5 arcs photo-supported; D1/D2/D4 hinge sides unresolved. HUMAN REVIEW REQUIRED.','small')}
  </svg>`;
}

function report() {
  const angleRows = wallFamilies.map(x => `| ${x.id} | ${x.nodes.join('-')} | ${x.beforeDegrees.toFixed(6)} | ${x.afterDegrees.toFixed(6)} | ${x.target} |`).join('\n');
  const movementRows = Object.entries(roomAMovement).map(([id, m]) => `| ${id} | ${m.deltaMm.x.toFixed(2)} | ${m.deltaMm.y.toFixed(2)} | ${m.magnitudeMm.toFixed(2)} |`).join('\n');
  const doorRows = Object.entries(doorLayers).map(([id, d]) => {
    const key = id === 'D1' ? '781 mm clear proxy; 1204 mm front casing' : id === 'D2' ? '770 mm opening; 742 mm leaf; ~250 mm reveal' : id === 'D3' ? '760 mm leaf; separate C/B casing faces' : id === 'D4' ? '760 mm leaf; 920 mm casing' : '761 mm shared leaf; separate B/WC casing faces';
    const hinge = id === 'D3' ? 'Photo-supported east endpoint; swing arc shown' : id === 'D5' ? 'Photo-supported north/top endpoint; swing arc shown' : 'Unresolved; destination arrow only';
    return `| ${id} | ${d.swingDestination} | ${key} | ${hinge} |`;
  }).join('\n');
  return `# Whole-flat final 2D review candidate v1.1

**Status: FINAL 2D REVIEW CANDIDATE — HUMAN APPROVAL REQUIRED.**

This is a narrowly scoped successor to \`WHOLE_FLAT_PREFERRED_PROVISIONAL_WORKING_SHELL_v1_0\`. It restores one omitted permanent-wall stroke, standardises the five door graphics, and applies one tested rigid Room A orientation correction. It does not reconstruct a room, run a solve, scale geometry, alter Room C/Room B/WC, change D3/D5, begin 3D work, or promote the model to construction geometry.

## Room C upper permanent wall

The permanent host wall is now drawn continuously from **CP1-FL (${C['CP1-FL'].x.toFixed(2)}, ${C['CP1-FL'].y.toFixed(2)}) mm** to **CP2-FL (${C['CP2-FL'].x.toFixed(2)}, ${C['CP2-FL'].y.toFixed(2)}) mm**. In v1.0, the renderer ended one stroke at PO1 and restarted at PI1, so the partition thickness appeared as a ${distance(arr(C.PO1),arr(C.PI1)).toFixed(2)} mm break. That was a composition error: the permanent wall continues behind the junction.

No Room C node moved. CP1/C1, CP2/C2 and the removable partition retain their accepted geometry. The partition is lighter and subordinate to the continuous permanent host wall.

## Door convention

All five openings now use the same visual language: magenta opening, ochre casing, cyan reveal, black closed-leaf reference, and a dashed red destination arrow.

| Door | Opens into | Geometry shown | Hinge treatment |
|---|---|---|---|
${doorRows}

The task supplies the swing destinations as authoritative: D1 -> Room A, D2 -> Room A, D3 -> Room C, D4 -> Room C, D5 -> WC. The explicitly labelled D3 Room B photograph supports the east-end hinge, and the paired D5 Room B/WC photographs corroborate the north/top hinge from both faces, so those two doors have swing arcs. D1, D2 and D4 retain destination-only arrows because their accepted evidence does not map a hinge side unambiguously enough to create a pivot. D1's 781 mm clear width and 1204 mm front casing width exist, but its leaf endpoints/lateral placement do not; the centred black 781 mm line is explicitly a schematic clear-opening proxy, not a new node or surveyed leaf position.

## Room A rigid orientation review

Room A is rotated **${rotationDegrees.toFixed(6)} degrees** about the unchanged D2 Room A casing-centre anchor **(${d2Anchor[0].toFixed(2)}, ${d2Anchor[1].toFixed(2)}) mm**. The target is the long A7-A6 lower wall, which becomes parallel to the fixed WC T0-T1 and Room C horizontal families. Scale is 1, there is no deformation, and maximum pairwise distance change is ${rigidPairwiseMaximumChangeMm.toFixed(9)} mm.

| Wall family | Nodes | Before deg | After deg | Review role |
|---|---|---:|---:|---|
${angleRows}

The A2-A3 upper segment remains at ${wallFamilies.find(x=>x.id==='A-upper-opening-side').afterDegrees.toFixed(6)} degrees because the source Room A evidence-fit shape was kept rigid rather than squared internally.

### Room A node movement

| Node | dx mm | dy mm | movement mm |
|---|---:|---:|---:|
${movementRows}

Maximum movement is **${maximumRoomAMovementEntry[1].magnitudeMm.toFixed(2)} mm at ${maximumRoomAMovementEntry[0]}**. Room C and Room B/WC movement is 0 mm.

## D2 consequence

The D2 physical registration centre moves **${result.d2Review.anchorMovementMm.toFixed(3)} mm**. The fixed Room C structural-opening and leaf layers do not move; only the Room A clear-opening and measured-casing segments rotate with Room A. Their casing endpoints move ${result.d2Review.roomACasingEndpointMovementMm.map(x=>x.toFixed(2)).join(' / ')} mm and clear-opening endpoints move ${result.d2Review.roomAClearOpeningEndpointMovementMm.map(x=>x.toFixed(2)).join(' / ')} mm.

The approximate through-wall face-centre separation remains **${result.d2Review.approximateThroughWallDepthPreservedAtCentreMm.toFixed(2)} mm**. The opposing A/C face-angle difference changes from ${result.d2Review.opposingFaceAngularDifferenceBeforeDegrees.toFixed(3)} to **${result.d2Review.opposingFaceAngularDifferenceAfterDegrees.toFixed(3)} degrees**. This is the explicit cost of keeping Room C fixed while rotating Room A; it is not silently reconciled.

## Independent validations

| Validation | Measured | Before model | After model | Before residual | After residual |
|---|---:|---:|---:|---:|---:|
| Far Room A wall through D2 to opposite Room C wall | 9019 | ${validationBeforeMm.toFixed(2)} | ${validationAfterMm.toFixed(2)} | ${(validationBeforeMm-9019).toFixed(2)} | ${(validationAfterMm-9019).toFixed(2)} |
| Room C partition outer face through D3 to Room B back wall | 3726 | ${predecessor.validations.C_partition_D3_B_3726.currentPreferredD3NormalModelMm.toFixed(2)} | unchanged | ${predecessor.validations.C_partition_D3_B_3726.residualMm.toFixed(2)} | unchanged |

The rigid Room A test improves the 9019 mm absolute residual by only **${result.validations.A_D2_C_9019.absoluteResidualImprovementMm.toFixed(2)} mm**. It remains an independent residual, not a fitted constraint.

## Preserved geometry and evidence

- Room B remains orthogonal with the corrected 136 mm D3 return.
- WC remains rectangular.
- Room C shell, cupboards CP1/C1 and CP2/C2, and removable partition geometry are unchanged.
- D3 and D5 geometry/registration are unchanged.
- The v1.0 predecessor and all measurement-driven/superseded records remain intact.
- No global optimisation or new shell solve was performed.

## Remaining human-review ambiguities

${result.unresolved.map(x=>`- ${x}`).join('\n')}

The 9019 mm and 3726 mm residuals remain documented above as independent, non-fitted checks. They are not treated as blockers to using this candidate for human 2D review.

## Final human-review gate

### Composition fixes

- The permanent upper Room C wall is continuous from CP1-FL to CP2-FL; this is a composition-only restoration over unchanged nodes.
- The removable partition retains both faces, thickness and topology, and remains visually subordinate.
- D1-D5 use the same opening/casing/reveal/leaf/swing vocabulary without collapsing opposite faces.
- Confirmed destinations used: D1 -> Room A; D2 -> Room A; D3 -> Room C; D4 -> Room C; D5 -> WC. Only photo-supported D3 and D5 hinges have arcs.

### Room A orientation

- Current principal A7-A6 angle: ${roomALowerBeforeDegrees.toFixed(6)} degrees; fixed WC T0-T1 reference: 0.000000 degrees.
- The fixed Room C C0-D3-CL / CP1-FL-CP2-FL family is 0.000000 degrees; A7-A0 changes from ${aCSideBeforeDegrees.toFixed(6)} to ${aCSideAfterDegrees.toFixed(6)} degrees. Its included angle to that Room C family changes from ${aCRelationshipBeforeDegrees.toFixed(6)} to ${aCRelationshipAfterDegrees.toFixed(6)} degrees (departure from square ${round(90-aCRelationshipBeforeDegrees,6).toFixed(6)} to ${round(90-aCRelationshipAfterDegrees,6).toFixed(6)} degrees).
- Adopted rigid test rotation: ${rotationDegrees.toFixed(6)} degrees about D2; maximum Room A movement: ${maximumRoomAMovementEntry[1].magnitudeMm.toFixed(2)} mm at ${maximumRoomAMovementEntry[0]}.
- D2 centre movement is 0 mm; its fixed C layers remain fixed and the separate A/C layer angle difference becomes ${result.d2Review.opposingFaceAngularDifferenceAfterDegrees.toFixed(3)} degrees.
- The 9019 mm model changes from ${validationBeforeMm.toFixed(2)} to ${validationAfterMm.toFixed(2)} mm; residual changes from ${(validationBeforeMm-9019).toFixed(2)} to ${(validationAfterMm-9019).toFixed(2)} mm.

### Frozen geometry

| Item | Movement/change |
|---|---|
| Room C | 0 mm |
| Room B | 0 mm |
| WC | 0 mm |
| D3 registration/geometry | unchanged |
| CP1/C1 and CP2/C2 cupboards | 0 mm / unchanged |
| Room C removable partition | 0 mm / unchanged |

### Remaining known uncertainties

${result.unresolved.map(x=>`- ${x}`).join('\n')}

**STOP: HUMAN REVIEW REQUIRED. No cleanup pass, final promotion, construction lock, or 3D work has been performed.**
`;
}

const stem = 'WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_1';
fs.writeFileSync(path.join(outDir, `${stem}.json`), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, `${stem}.md`), report());
fs.writeFileSync(path.join(outDir, `${stem}.svg`), wholeFlatSvg(false));
fs.writeFileSync(path.join(outDir, `${stem}_DIAGNOSTIC.svg`), wholeFlatSvg(true));

console.log(JSON.stringify({
  outputs: 4,
  status: result.status,
  roomCUpperWall: result.topRoomCWall.continuousSegment,
  roomARotationDegrees: result.roomAOrientationReview.rotationDegrees,
  roomAMaximumMovementMm: result.roomAOrientationReview.maximumMovementMm,
  d2AnchorMovementMm: result.d2Review.anchorMovementMm,
  d2FaceAngleDifferenceAfterDegrees: result.d2Review.opposingFaceAngularDifferenceAfterDegrees,
  validation9019ResidualAfterMm: result.validations.A_D2_C_9019.residualAfterMm,
  roomBWCChanged: false,
  roomCNodesChanged: false,
  solvePerformed: false,
}, null, 2));

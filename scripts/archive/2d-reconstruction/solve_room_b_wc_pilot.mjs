#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputRelative = "docs/survey/derived/room-b-wc";
const outputDir = path.join(repoRoot, outputRelative);
const svgName = "ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.svg";
const jsonName = "ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json";
const reportName = "ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.md";
const solverOutputName = "ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1_solver-output.json";
const generatedDate = "2026-08-04";
const baselineStatus = Object.freeze({
  status: "accepted-provisional-working-baseline",
  acceptedDate: "2026-08-04",
  acceptedBy: "human review",
  geometryFrozen: true,
  finalOrConstructionAccurate: false,
  nextPhase: "independent Room C reconstruction",
  integrationInterfaces: ["Room A -> Room C through D2", "Room B/WC -> Room C through D3"],
  reopenOnlyFor: "global Room C integration evidence exposing a genuine network inconsistency",
});

const authoritativeEvidence = [
  "docs/survey/ROOM_B_WC_RECONSTRUCTION_BRIEF_v1.md",
  "docs/survey/ROOM_B_EVIDENCE_v1.md",
  "docs/survey/ROOM_WC_EVIDENCE_v1.md",
  "docs/survey/ROOM_B_WC_NODE_REFERENCE_ADDENDUM_v1.md",
];

for (const relative of authoritativeEvidence) {
  const text = fs.readFileSync(path.join(repoRoot, relative), "utf8");
  for (const token of relative.includes("ROOM_B_EVIDENCE")
    ? ["B0.5", "SUP-071", "SUP-079"]
    : relative.includes("ROOM_WC_EVIDENCE")
      ? ["BASE-WC-03", "SUP-072", "D5-WCL"]
      : []) {
    if (!text.includes(token)) throw new Error(`${relative} is missing expected token ${token}`);
  }
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
function sign(value, digits = 2) {
  const result = round(value, digits);
  return `${result >= 0 ? "+" : ""}${result}`;
}
function distance(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1]); }
function add(a, b) { return [a[0] + b[0], a[1] + b[1]]; }
function subtract(a, b) { return [a[0] - b[0], a[1] - b[1]]; }
function scaleVector(vector, scalar) { return [vector[0] * scalar, vector[1] * scalar]; }
function unit(a, b) {
  const vector = subtract(b, a);
  const length = Math.hypot(...vector);
  return [vector[0] / length, vector[1] / length];
}
function rightNormal(vector) { return [vector[1], -vector[0]]; }
function leftNormal(vector) { return [-vector[1], vector[0]]; }
function midpoint(a, b) { return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }
function vectorFromAngle(radians) { return [Math.cos(radians), Math.sin(radians)]; }
function lerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
function bearingDegrees(a, b) {
  return ((Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI + 360) % 360;
}
function signedParallelDifferenceDegrees(firstBearing, secondBearing) {
  return ((firstBearing - secondBearing + 90) % 180 + 180) % 180 - 90;
}
function angleBetweenDegrees(first, second) {
  const firstLength = Math.hypot(...first), secondLength = Math.hypot(...second);
  const cosine = Math.max(-1, Math.min(1, dot(first, second) / (firstLength * secondLength)));
  return (Math.acos(cosine) * 180) / Math.PI;
}
function cornerAngleDegrees(previous, corner, next) {
  return angleBetweenDegrees(subtract(previous, corner), subtract(next, corner));
}
function perpendicularLanding(point, wallStart, wallEnd) {
  const wall = subtract(wallEnd, wallStart);
  const fraction = dot(subtract(point, wallStart), wall) / dot(wall, wall);
  const landing = add(wallStart, scaleVector(wall, fraction));
  return { fraction, landing, distanceMm: distance(point, landing), withinSegment: fraction >= 0 && fraction <= 1 };
}
function polygonAreaM2(points) {
  let twice = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index], next = points[(index + 1) % points.length];
    twice += current[0] * next[1] - next[0] * current[1];
  }
  return Math.abs(twice) / 2e6;
}
function orientation(a, b, c) {
  const value = (b[1] - a[1]) * (c[0] - b[0]) - (b[0] - a[0]) * (c[1] - b[1]);
  return Math.abs(value) < 1e-9 ? 0 : value > 0 ? 1 : 2;
}
function segmentsIntersect(a, b, c, d) {
  return orientation(a, b, c) !== orientation(a, b, d) && orientation(c, d, a) !== orientation(c, d, b);
}
function polygonSelfIntersects(points) {
  for (let first = 0; first < points.length; first += 1) {
    const firstNext = (first + 1) % points.length;
    for (let second = first + 1; second < points.length; second += 1) {
      const secondNext = (second + 1) % points.length;
      if (first === second || firstNext === second || secondNext === first) continue;
      if (segmentsIntersect(points[first], points[firstNext], points[second], points[secondNext])) return true;
    }
  }
  return false;
}

const D5_FIELD = Object.freeze({
  physicalLeafWidthMm: 761,
  roomBVisibleClosedWidthMm: 737,
  roomBTopOuterCasingMm: 59,
  roomBBottomOuterCasingMm: 80,
  roomBTopRevealDepthMm: 80,
  roomBBottomRevealDepthMm: 97,
  wcTopFrameOffsetMm: 63,
  wcBottomFrameOffsetMm: 81,
});

const D3_FIELD = Object.freeze({
  visibleClosedWidthMm: 738,
  physicalLeafWidthMm: null,
  leftOuterCasingMm: 80,
  rightOuterCasingMm: 65,
  leftInnerToVisibleFaceMm: 105,
  rightInnerToVisibleFaceMm: 105,
  supersededVisibleFaceMm: 763,
});

// D5 is one physical leaf. The Room B visible points sit at the two frame
// stops; the full 761 mm leaf continues behind those stops. The hidden-leaf
// split is derived from the two WC casing/frame observations, while the sum
// of their residuals remains an auditable casing-width compatibility check.
function sharedD5Assembly(c) {
  const outerTop = c.B1, outerBottom = c.B2;
  const direction = unit(outerTop, outerBottom);
  const inward = rightNormal(direction);
  const casingLength = distance(outerTop, outerBottom);
  const innerTop = add(outerTop, scaleVector(direction, D5_FIELD.roomBTopOuterCasingMm));
  const innerBottom = add(outerBottom, scaleVector(direction, -D5_FIELD.roomBBottomOuterCasingMm));
  const visibleTop = add(innerTop, scaleVector(inward, D5_FIELD.roomBTopRevealDepthMm));
  const visibleBottom = add(innerBottom, scaleVector(inward, D5_FIELD.roomBBottomRevealDepthMm));
  const leafDirection = unit(visibleTop, visibleBottom);
  const visibleClosedWidthMm = distance(visibleTop, visibleBottom);
  const hiddenTotalMm = D5_FIELD.physicalLeafWidthMm - visibleClosedWidthMm;
  const projectionFactor = dot(leafDirection, direction);

  const topOffsetBeforeHiddenMm = dot(subtract(visibleTop, c.T0), direction);
  const fullEndBeforeHidden = add(visibleTop, scaleVector(leafDirection, D5_FIELD.physicalLeafWidthMm));
  const bottomOffsetBeforeHiddenMm = dot(subtract(c["D5-WCL"], fullEndBeforeHidden), direction);
  const topResidualAtZero = topOffsetBeforeHiddenMm - D5_FIELD.wcTopFrameOffsetMm;
  const bottomResidualAtZero = bottomOffsetBeforeHiddenMm - D5_FIELD.wcBottomFrameOffsetMm;
  const unconstrainedHiddenAtTopMm = (topResidualAtZero - bottomResidualAtZero) / (2 * projectionFactor);
  const hiddenAtTopMm = Math.max(0, Math.min(Math.max(0, hiddenTotalMm), unconstrainedHiddenAtTopMm));
  const hiddenAtBottomMm = hiddenTotalMm - hiddenAtTopMm;
  const leafTop = add(visibleTop, scaleVector(leafDirection, -hiddenAtTopMm));
  const leafBottom = add(leafTop, scaleVector(leafDirection, D5_FIELD.physicalLeafWidthMm));
  const leafCentre = midpoint(leafTop, leafBottom);

  const wcTopFrameOffsetMm = dot(subtract(leafTop, c.T0), direction);
  const wcBottomFrameOffsetMm = dot(subtract(c["D5-WCL"], leafBottom), direction);
  const wcInnerTop = add(c.T0, scaleVector(direction, D5_FIELD.wcTopFrameOffsetMm));
  const wcInnerBottom = add(c["D5-WCL"], scaleVector(direction, -D5_FIELD.wcBottomFrameOffsetMm));
  const oppositeCasingFaceSeparationMm = Math.abs(dot(subtract(c.T0, c.B1), inward));

  return {
    sharedDoorWidthMm: D5_FIELD.physicalLeafWidthMm,
    sharedDoorCentre: leafCentre,
    sharedDoorBearingDegrees: bearingDegrees(leafTop, leafBottom),
    leafTop,
    leafBottom,
    leafDirection,
    direction,
    inward,
    roomB: {
      outerTop,
      outerBottom,
      innerTop,
      innerBottom,
      visibleTop,
      visibleBottom,
      casingLength,
      visibleClosedWidthMm,
      visibleWidthResidualMm: visibleClosedWidthMm - D5_FIELD.roomBVisibleClosedWidthMm,
      topOuterCasingMm: D5_FIELD.roomBTopOuterCasingMm,
      bottomOuterCasingMm: D5_FIELD.roomBBottomOuterCasingMm,
      topRevealDepthMm: distance(innerTop, visibleTop),
      bottomRevealDepthMm: distance(innerBottom, visibleBottom),
      hiddenAtTopMm,
      hiddenAtBottomMm,
      hiddenTotalMm,
    },
    wc: {
      outerTop: c.T0,
      outerBottom: c["D5-WCL"],
      innerTop: wcInnerTop,
      innerBottom: wcInnerBottom,
      casingLength: distance(c.T0, c["D5-WCL"]),
      topFrameOffsetMm: wcTopFrameOffsetMm,
      bottomFrameOffsetMm: wcBottomFrameOffsetMm,
      topFrameResidualMm: wcTopFrameOffsetMm - D5_FIELD.wcTopFrameOffsetMm,
      bottomFrameResidualMm: wcBottomFrameOffsetMm - D5_FIELD.wcBottomFrameOffsetMm,
      topDerivedRevealDepthMm: Math.abs(dot(subtract(leafTop, wcInnerTop), inward)),
      bottomDerivedRevealDepthMm: Math.abs(dot(subtract(leafBottom, wcInnerBottom), inward)),
    },
    oppositeCasingFaceSeparationMm,
    roomBLeftOuterToLeafAlongMm: dot(subtract(leafTop, c.B1), direction),
    roomBRightOuterToLeafAlongMm: dot(subtract(c.B2, leafBottom), direction),
    roomBCasingToLeafNormalMm: Math.abs(dot(subtract(leafCentre, c.B1), inward)),
    wcLeftOuterToLeafAlongMm: wcBottomFrameOffsetMm,
    wcRightOuterToLeafAlongMm: wcTopFrameOffsetMm,
    wcCasingToLeafNormalMm: (
      Math.abs(dot(subtract(leafTop, wcInnerTop), inward))
      + Math.abs(dot(subtract(leafBottom, wcInnerBottom), inward))
    ) / 2,
    wcReferenceCentreLongitudinalOffsetMm: 0,
    geometryValid: hiddenTotalMm >= 0 && projectionFactor > 0,
  };
}

function d5RoomBObject(c) {
  const assembly = sharedD5Assembly(c);
  return {
    outerLeft: assembly.roomB.outerTop,
    outerRight: assembly.roomB.outerBottom,
    innerLeft: assembly.roomB.innerTop,
    innerRight: assembly.roomB.innerBottom,
    visibleDoorLeft: assembly.roomB.visibleTop,
    visibleDoorRight: assembly.roomB.visibleBottom,
    doorLeft: assembly.leafTop,
    doorRight: assembly.leafBottom,
    doorCentre: assembly.sharedDoorCentre,
    direction: assembly.direction,
    inward: assembly.inward,
    casingLength: assembly.roomB.casingLength,
    visibleClosedWidthMm: assembly.roomB.visibleClosedWidthMm,
    derivedDoorFaceDepthMm: (assembly.roomB.topRevealDepthMm + assembly.roomB.bottomRevealDepthMm) / 2,
    leftInnerToDoorMm: assembly.roomB.topRevealDepthMm,
    rightInnerToDoorMm: assembly.roomB.bottomRevealDepthMm,
    geometryValid: assembly.geometryValid,
  };
}

function d3RoomBObject(c) {
  const left = c.B0, right = c["D3-BR"];
  const direction = unit(left, right);
  const inward = rightNormal(direction);
  const casingLength = distance(left, right);
  const innerLeft = add(left, scaleVector(direction, D3_FIELD.leftOuterCasingMm));
  const innerRight = add(right, scaleVector(direction, -D3_FIELD.rightOuterCasingMm));
  const separationDelta = D3_FIELD.leftOuterCasingMm + D3_FIELD.visibleClosedWidthMm + D3_FIELD.rightOuterCasingMm - casingLength;
  const along = -separationDelta / 2;
  const depthSquared = D3_FIELD.leftInnerToVisibleFaceMm ** 2 - along ** 2;
  const depth = Math.sqrt(Math.max(0, depthSquared));
  const doorLeft = add(add(innerLeft, scaleVector(direction, along)), scaleVector(inward, depth));
  const doorRight = add(doorLeft, scaleVector(direction, D3_FIELD.visibleClosedWidthMm));
  return {
    outerLeft: left,
    outerRight: right,
    innerLeft,
    innerRight,
    doorLeft,
    doorRight,
    doorCentre: midpoint(doorLeft, doorRight),
    direction,
    inward,
    casingLength,
    visibleClosedWidthMm: distance(doorLeft, doorRight),
    physicalLeafWidthMm: D3_FIELD.physicalLeafWidthMm,
    alongAdjustmentMm: along,
    derivedDoorFaceDepthMm: depth,
    leftInnerToDoorMm: distance(innerLeft, doorLeft),
    rightInnerToDoorMm: distance(innerRight, doorRight),
    geometryValid: depthSquared >= 0,
  };
}

// Gauge: B0 is the origin and D3-BR is on +X. Its X value remains fitted,
// so the gauge fixes only translation and rotation, not scale.
function coordinates(parameters, options = {}) {
  const exactArchitecturalParallels = options.exactObservedParallels || options.completeArchitecturalConstraints;
  const alignedWallDirection = exactArchitecturalParallels ? [1, 0] : vectorFromAngle(parameters[1]);
  const alignedWallNormal = leftNormal(alignedWallDirection);
  const c = {
    B0: [0, 0],
    "D3-BR": [parameters[0], 0],
    B2: [parameters[5], parameters[6]],
    B3: [parameters[7], parameters[8]],
    B4: [parameters[9], parameters[10]],
  };
  c["B0.5"] = exactArchitecturalParallels
    ? add(c["D3-BR"], scaleVector(unit(c.B0, c.B4), parameters[2]))
    : add(c["D3-BR"], add(scaleVector(alignedWallNormal, parameters[2]), scaleVector(alignedWallDirection, parameters[3])));
  c.B1 = add(c["B0.5"], scaleVector(alignedWallDirection, parameters[4]));
  if (options.completeArchitecturalConstraints) {
    c.B2 = add(c.B1, scaleVector(unit(c.B1, c.B3), 874));
  }
  c["D3-BL"] = c.B0;
  c["D5-BL"] = c.B1;
  c["D5-BR"] = c.B2;

  // Human-confirmed physical topology, not a drawing convention:
  // B0.5->B1 and T0->T1 are collinear wall faces interrupted by D5.
  // B1->T0 is the D5 assembly gap, never a wall segment.
  const d5AssemblyGap = parameters[11];
  const t0T1Length = parameters[12];
  c.T0 = add(c.B1, scaleVector(alignedWallDirection, d5AssemblyGap));
  c["D5-WCR"] = c.T0;
  c.T1 = add(c.T0, scaleVector(alignedWallDirection, t0T1Length));

  const roomBDoorDirection = unit(c.B1, c.B2);
  const wcDirection = scaleVector(roomBDoorDirection, -1);
  const wcCasingLength = parameters[13];
  c["D5-WCL"] = add(c.T0, scaleVector(wcDirection, -wcCasingLength));
  c.T2 = [parameters[14], parameters[15]];
  c.T3 = [parameters[16], parameters[17]];
  return c;
}

const observations = [];
function addDistanceObservation(id, from, to, reading, sigmaMm, category, confidence, options = {}) {
  observations.push({
    id,
    type: "distance",
    from,
    to,
    reading,
    sigmaMm,
    category,
    confidence,
    exactEndpoint: options.exactEndpoint ?? true,
    note: options.note || "",
  });
}

addDistanceObservation("BASE-B-02", "D3-BR", "B0.5", { valueMm: 249 }, 4, "baseline", "high");
addDistanceObservation("BASE-B-03", "B0.5", "B1", { valueMm: 823 }, 4, "baseline", "high");
addDistanceObservation("D5-B-CASING-WIDTH", "B1", "B2", { valueMm: 874 }, 5, "door-object", "high", { note: "Room B outer casing face" });
addDistanceObservation("BASE-B-05", "B2", "B3", { valueMm: 1218 }, 4, "baseline", "high");
addDistanceObservation("BASE-B-06", "B3", "B4", { valueMm: 1665 }, 7, "baseline-tile-face", "high", { note: "Visible finished tile face; underlying wall plane is approximately 10 mm behind" });
addDistanceObservation("BASE-B-07", "B4", "B0", { minMm: 2200, maxMm: 2220 }, 35, "approximate-range", "low", { note: "Authoritative field recheck; supersedes inactive 2010-2030 mm range. Shower-screen-obstructed direct shot" });
addDistanceObservation("SUP-065", "B0", "B0.5", { valueMm: 888 }, 7, "node-to-node", "high");
addDistanceObservation("SUP-066", "B0", "B2", { valueMm: 1952 }, 30, "approximate", "low", { note: "Difficult laser shot" });
addDistanceObservation("SUP-067", "B0", "B3", { minMm: 2755, maxMm: 2765 }, 12, "measured-range", "medium", { note: "Human-confirmed range" });
addDistanceObservation("SUP-068", "B0.5", "B2", { minMm: 1182, maxMm: 1190 }, 12, "measured-range", "medium");
addDistanceObservation("SUP-069", "B0.5", "B3", { valueMm: 2228 }, 8, "node-to-node", "high");
addDistanceObservation("SUP-070", "B1", "B4", { valueMm: 2673 }, 8, "node-to-node", "high");
addDistanceObservation("SUP-071", "B2", "B4", { valueMm: 2046 }, 8, "node-to-node", "high", { note: "Authoritative field recheck corrected both the endpoint and value from the superseded inactive B1 / D5-BR -> B4 = 2014 record" });

addDistanceObservation("BASE-WC-01", "T0", "T1", { valueMm: 1643 }, 4, "baseline", "high");
addDistanceObservation("BASE-WC-02", "T1", "T2", { valueMm: 1078 }, 4, "baseline", "high");
addDistanceObservation("BASE-WC-03", "T2", "T3", { valueMm: 1685 }, 4, "baseline", "high", { note: "Authoritative field recheck; supersedes the inactive erroneous raw value of 690 mm" });
addDistanceObservation("BASE-WC-04", "T3", "D5-WCL", { valueMm: 173 }, 4, "baseline", "high", { note: "Authoritative WC-side endpoint clarification; supersedes inactive 171 mm value and is a finished-wall segment, not casing" });
addDistanceObservation("D5-WC-CASING-WIDTH", "D5-WCL", "T0", { valueMm: 898 }, 5, "door-object", "high");
addDistanceObservation("SUP-072", "T0", "T2", { valueMm: 1959 }, 8, "node-to-node", "high");
addDistanceObservation("SUP-073", "T1", "T3", { valueMm: 1970 }, 35, "approximate", "low");
addDistanceObservation("SUP-079", "B0", "T2", { valueMm: 3674 }, 12, "cross-tie", "high", { note: "Only direct Room B-to-WC cross-tie" });

const wallSpanObservations = [
  {
    id: "SUP-080",
    type: "derived-wall-span",
    measuredMm: 2217,
    sigmaMm: 30,
    category: "wall-to-wall-check",
    confidence: "medium",
    startDescription: "D3-BR",
    landingWall: ["B3", "B4"],
    note: "Field recheck; endpoint represented as the perpendicular landing on the B3-B4 finished wall segment",
    evaluate(c) { return { start: c["D3-BR"], ...perpendicularLanding(c["D3-BR"], c.B3, c.B4) }; },
  },
  {
    id: "SUP-081",
    type: "derived-wall-span",
    measuredMm: 3492,
    sigmaMm: 90,
    category: "broad-wall-to-wall-check",
    confidence: "low",
    startDescription: "Assumed 50% point on T1-T2",
    landingWall: ["B0", "B4"],
    note: "Field recheck with two unmarked general wall-face endpoints; midpoint and perpendicular landing are explicit modelling assumptions",
    evaluate(c) {
      const start = midpoint(c.T1, c.T2);
      return { start, ...perpendicularLanding(start, c.B0, c.B4), startFraction: 0.5 };
    },
  },
];

const angularObservations = [
  { id: "ANG-B-D3BR", room: "Room B", previous: "B0", corner: "D3-BR", next: "B0.5" },
  { id: "ANG-B-B05", room: "Room B", previous: "D3-BR", corner: "B0.5", next: "B1" },
  { id: "ANG-B-B1", room: "Room B", previous: "B0.5", corner: "B1", next: "B2" },
  { id: "ANG-B-B2", room: "Room B", previous: "B1", corner: "B2", next: "B3", targetDegrees: 180 },
  { id: "ANG-B-B3", room: "Room B", previous: "B2", corner: "B3", next: "B4" },
  { id: "ANG-B-B4", room: "Room B", previous: "B3", corner: "B4", next: "B0" },
  { id: "ANG-B-B0", room: "Room B", previous: "B4", corner: "B0", next: "D3-BR" },
  { id: "ANG-WC-T0", room: "WC", previous: "D5-WCL", corner: "T0", next: "T1" },
  { id: "ANG-WC-T1", room: "WC", previous: "T0", corner: "T1", next: "T2" },
  { id: "ANG-WC-T2", room: "WC", previous: "T1", corner: "T2", next: "T3" },
  { id: "ANG-WC-T3", room: "WC", previous: "T2", corner: "T3", next: "D5-WCL" },
  { id: "ANG-WC-D5WCL", room: "WC", previous: "T3", corner: "D5-WCL", next: "T0", targetDegrees: 180 },
].map((item) => ({ ...item, targetDegrees: item.targetDegrees ?? 90, sigmaDegrees: 6, confidence: "soft-human-observation" }));

const parallelObservations = [
  {
    id: "PAR-A-RETURN-B0B4",
    type: "soft-parallel",
    firstSegment: ["D3-BR", "B0.5"],
    secondSegment: ["B0", "B4"],
    targetDifferenceDegrees: 0,
    sigmaDegrees: 1.1,
    confidence: "authoritative-human-and-photo-observation",
    note: "Family A: the D3-BR to B0.5 return is approximately parallel to B0-B4 and terminates at B0.5",
  },
  {
    id: "PAR-B-D3-B05B1",
    type: "soft-parallel",
    firstSegment: ["B0", "D3-BR"],
    secondSegment: ["B0.5", "B1"],
    targetDifferenceDegrees: 0,
    sigmaDegrees: 1.1,
    confidence: "authoritative-human-and-photo-observation",
    note: "Family B: the D3 doorway/casing span is very closely parallel to the B0.5-B1 / T0-T1 interrupted wall alignment",
  },
  {
    id: "PAR-B-D3-B4B3",
    type: "soft-parallel",
    firstSegment: ["B0", "D3-BR"],
    secondSegment: ["B4", "B3"],
    targetDifferenceDegrees: 0,
    sigmaDegrees: 1.1,
    confidence: "authoritative-human-and-photo-observation",
    note: "Family B: the D3 doorway/casing span is very closely parallel to B4-B3",
  },
  {
    id: "PAR-B-D3-T3T2",
    type: "soft-parallel",
    firstSegment: ["B0", "D3-BR"],
    secondSegment: ["T3", "T2"],
    targetDifferenceDegrees: 0,
    sigmaDegrees: 1.1,
    confidence: "authoritative-human-and-photo-observation",
    note: "Family B: the D3 doorway/casing span is very closely parallel to T3-T2; B0.5-B1 and T0-T1 are already exactly collinear topology",
  },
];

const reportedParallelPairs = [
  { id: "PAIR-D3-B05B1", firstSegment: ["B0", "D3-BR"], secondSegment: ["B0.5", "B1"] },
  { id: "PAIR-D3-B4B3", firstSegment: ["B0", "D3-BR"], secondSegment: ["B4", "B3"] },
  { id: "PAIR-D3-T0T1", firstSegment: ["B0", "D3-BR"], secondSegment: ["T0", "T1"] },
  { id: "PAIR-D3-T3T2", firstSegment: ["B0", "D3-BR"], secondSegment: ["T3", "T2"] },
  { id: "PAIR-RETURN-B0B4", firstSegment: ["D3-BR", "B0.5"], secondSegment: ["B0", "B4"] },
];

const relationObservations = [
  {
    id: "D5-B-VISIBLE-CLOSED-LEAF",
    type: "derived-relation",
    measuredMm: D5_FIELD.roomBVisibleClosedWidthMm,
    sigmaMm: 4,
    category: "door-object-reconciliation",
    confidence: "approximate-field-recheck",
    note: "Visible exposed portion of the one 761 mm physical leaf when closed and viewed from Room B",
    predict(parameters, c) { return sharedD5Assembly(c).roomB.visibleClosedWidthMm; },
  },
  {
    id: "D5-WC-T0-FRAME-63",
    type: "derived-relation",
    measuredMm: D5_FIELD.wcTopFrameOffsetMm,
    sigmaMm: 4,
    category: "door-object-reconciliation",
    confidence: "fresh-field-recheck",
    note: "T0 / D5-WCR to the WC inner-casing edge along the WC casing datum",
    predict(parameters, c) { return sharedD5Assembly(c).wc.topFrameOffsetMm; },
  },
  {
    id: "D5-WC-D5WCL-FRAME-81",
    type: "derived-relation",
    measuredMm: D5_FIELD.wcBottomFrameOffsetMm,
    sigmaMm: 4,
    category: "door-object-reconciliation",
    confidence: "fresh-field-recheck",
    note: "D5-WCL to the WC inner-casing/door-edge reference along the WC casing datum",
    predict(parameters, c) { return sharedD5Assembly(c).wc.bottomFrameOffsetMm; },
  },
];

function observationPrediction(observation, c) {
  return distance(c[observation.from], c[observation.to]);
}
function intervalResidualMm(predicted, reading) {
  if (reading.valueMm !== undefined) return predicted - reading.valueMm;
  if (predicted < reading.minMm) return predicted - reading.minMm;
  if (predicted > reading.maxMm) return predicted - reading.maxMm;
  return 0;
}
function activeObservations(options) {
  return observations.filter((item) => !options.excludedObservationIds.includes(item.id));
}
function rawResiduals(parameters, options) {
  const c = coordinates(parameters, options);
  const results = activeObservations(options).map((observation) => {
    const predicted = observationPrediction(observation, c);
    return { id: observation.id, z: intervalResidualMm(predicted, observation.reading) / observation.sigmaMm };
  });
  for (const relation of relationObservations) {
    results.push({ id: relation.id, z: (relation.predict(parameters, c) - relation.measuredMm) / relation.sigmaMm });
  }
  for (const observation of wallSpanObservations) {
    const evaluated = observation.evaluate(c);
    results.push({ id: observation.id, z: (evaluated.distanceMm - observation.measuredMm) / observation.sigmaMm });
    if (!evaluated.withinSegment) results.push({ id: `${observation.id}-LANDING-OUTSIDE-SEGMENT`, z: 100 + 100 * Math.abs(evaluated.fraction - Math.max(0, Math.min(1, evaluated.fraction))) });
  }
  if (options.softParallel) {
    for (const observation of parallelObservations) {
      const differenceDegrees = signedParallelDifferenceDegrees(
        bearingDegrees(c[observation.firstSegment[0]], c[observation.firstSegment[1]]),
        bearingDegrees(c[observation.secondSegment[0]], c[observation.secondSegment[1]]),
      );
      results.push({ id: observation.id, z: (differenceDegrees - observation.targetDifferenceDegrees) / observation.sigmaDegrees });
    }
  }
  if (options.completeArchitecturalConstraints) {
    const orderedRemainderMm = distance(c.B1, c.B3) - 874;
    if (orderedRemainderMm <= 0) results.push({ id: "ARCH-B1-B2-B3-ORDER", z: 100 + Math.abs(orderedRemainderMm) });
  }
  const d5 = sharedD5Assembly(c);
  if (!d5.geometryValid) results.push({ id: "D5-SHARED-GEOMETRY-VALIDITY", z: 100 + Math.abs(d5.roomB.hiddenTotalMm) });
  const d3 = d3RoomBObject(c);
  if (!d3.geometryValid) results.push({ id: "D3-B-GEOMETRY-VALIDITY", z: 100 + Math.abs(d3.alongAdjustmentMm) });
  if (d3.derivedDoorFaceDepthMm < 80) results.push({ id: "D3-B-MEASURED-LAYER-DEPTH", z: (80 - d3.derivedDoorFaceDepthMm) / 5 });
  return results;
}
function objective(parameters, options) {
  return rawResiduals(parameters, options).reduce((sum, residual) => {
    const absolute = Math.abs(residual.z);
    return sum + (absolute <= 2.5 ? 0.5 * absolute ** 2 : 2.5 * (absolute - 1.25));
  }, 0);
}
function solveLinearSystem(matrix, vector) {
  const size = vector.length;
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  for (let column = 0; column < size; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(augmented[row][column]) > Math.abs(augmented[pivot][column])) pivot = row;
    }
    [augmented[column], augmented[pivot]] = [augmented[pivot], augmented[column]];
    if (Math.abs(augmented[column][column]) < 1e-12) return null;
    const diagonal = augmented[column][column];
    for (let index = column; index <= size; index += 1) augmented[column][index] /= diagonal;
    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = augmented[row][column];
      for (let index = column; index <= size; index += 1) augmented[row][index] -= factor * augmented[column][index];
    }
  }
  return augmented.map((row) => row[size]);
}
function fit(initial, options) {
  let parameters = [...initial], damping = 1e-2;
  for (let iteration = 0; iteration < 500; iteration += 1) {
    const residuals = rawResiduals(parameters, options);
    const rows = residuals.length, columns = parameters.length;
    const weights = residuals.map((residual) => Math.abs(residual.z) <= 2.5 ? 1 : 2.5 / Math.abs(residual.z));
    const jacobian = Array.from({ length: rows }, () => Array(columns).fill(0));
    for (let column = 0; column < columns; column += 1) {
      const step = Math.max(1e-5, Math.abs(parameters[column]) * 1e-6);
      const shifted = [...parameters];
      shifted[column] += step;
      const shiftedResiduals = rawResiduals(shifted, options);
      for (let row = 0; row < rows; row += 1) jacobian[row][column] = (shiftedResiduals[row].z - residuals[row].z) / step;
    }
    const normal = Array.from({ length: columns }, () => Array(columns).fill(0));
    const gradient = Array(columns).fill(0);
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        gradient[column] += weights[row] * jacobian[row][column] * residuals[row].z;
        for (let other = 0; other < columns; other += 1) normal[column][other] += weights[row] * jacobian[row][column] * jacobian[row][other];
      }
    }
    for (let index = 0; index < columns; index += 1) normal[index][index] += damping * (normal[index][index] + 1e-6);
    const delta = solveLinearSystem(normal, gradient.map((value) => -value));
    if (!delta) break;
    const trial = parameters.map((value, index) => value + delta[index]);
    if (objective(trial, options) < objective(parameters, options)) {
      parameters = trial;
      damping = Math.max(damping / 2, 1e-9);
      if (Math.max(...delta.map(Math.abs)) < 1e-6) break;
    } else {
      damping = Math.min(damping * 5, 1e12);
    }
  }
  return parameters;
}

const initial = [
  847,
  0,
  249, 0,
  823,
  1670, 1125,
  1510, 2340,
  -148, 2190,
  120,
  1643,
  898,
  3427, 1324,
  1773, 1305,
];

const solutionDefinitions = [
  { id: "D0", label: "Corrected distance-only fit", options: { excludedObservationIds: [], softParallel: false } },
  { id: "P1", label: "Accepted provisional baseline with two strong soft wall-direction families", options: { excludedObservationIds: [], softParallel: true } },
  { id: "A2", label: "Fresh diagnostic with complete human-confirmed architectural constraints", options: { excludedObservationIds: [], softParallel: false, completeArchitecturalConstraints: true } },
];
const fittedParameters = {};
fittedParameters.D0 = fit(initial, solutionDefinitions[0].options);
const softParallelInitial = [...fittedParameters.D0];
softParallelInitial[1] = 0;
fittedParameters.P1 = fit(softParallelInitial, solutionDefinitions[1].options);
const architecturalInitial = [...fittedParameters.P1];
architecturalInitial[1] = 0;
architecturalInitial[2] = 249;
architecturalInitial[3] = 0;
fittedParameters.A2 = fit(architecturalInitial, solutionDefinitions[2].options);

function readingLabel(reading) {
  return reading.valueMm !== undefined ? `${reading.valueMm}` : `${reading.minMm}-${reading.maxMm}`;
}
function diagnose(definition) {
  const parameters = fittedParameters[definition.id];
  const c = coordinates(parameters, definition.options);
  const activeIds = new Set(activeObservations(definition.options).map((item) => item.id));
  const distanceResiduals = observations.map((observation) => {
    const predictedMm = observationPrediction(observation, c);
    return {
      ...observation,
      predictedMm,
      residualMm: intervalResidualMm(predictedMm, observation.reading),
      withinRange: observation.reading.valueMm === undefined && predictedMm >= observation.reading.minMm && predictedMm <= observation.reading.maxMm,
      usedInFit: activeIds.has(observation.id),
    };
  });
  const relationResiduals = relationObservations.map((relation) => {
    const predictedMm = relation.predict(parameters, c);
    return { ...relation, predictedMm, residualMm: predictedMm - relation.measuredMm, usedInFit: true };
  });
  const wallSpanResiduals = wallSpanObservations.map((observation) => {
    const evaluated = observation.evaluate(c);
    return {
      ...observation,
      predictedMm: evaluated.distanceMm,
      residualMm: evaluated.distanceMm - observation.measuredMm,
      startPoint: evaluated.start,
      landingPoint: evaluated.landing,
      landingFraction: evaluated.fraction,
      startFraction: evaluated.startFraction,
      withinSegment: evaluated.withinSegment,
      usedInFit: true,
    };
  });
  const angularResiduals = angularObservations.map((observation) => {
    const predictedDegrees = cornerAngleDegrees(c[observation.previous], c[observation.corner], c[observation.next]);
    return { ...observation, predictedDegrees, residualDegrees: predictedDegrees - observation.targetDegrees, usedInFit: false };
  });
  const parallelResiduals = parallelObservations.map((observation) => {
    const firstBearingDegrees = bearingDegrees(c[observation.firstSegment[0]], c[observation.firstSegment[1]]);
    const secondBearingDegrees = bearingDegrees(c[observation.secondSegment[0]], c[observation.secondSegment[1]]);
    const predictedDifferenceDegrees = signedParallelDifferenceDegrees(firstBearingDegrees, secondBearingDegrees);
    return {
      ...observation,
      firstBearingDegrees,
      secondBearingDegrees,
      predictedDifferenceDegrees,
      residualDegrees: predictedDifferenceDegrees - observation.targetDifferenceDegrees,
      usedInFit: definition.options.softParallel,
    };
  });
  const reportedParallelDifferences = reportedParallelPairs.map((pair) => ({
    ...pair,
    firstBearingDegrees: bearingDegrees(c[pair.firstSegment[0]], c[pair.firstSegment[1]]),
    secondBearingDegrees: bearingDegrees(c[pair.secondSegment[0]], c[pair.secondSegment[1]]),
    differenceDegrees: signedParallelDifferenceDegrees(
      bearingDegrees(c[pair.firstSegment[0]], c[pair.firstSegment[1]]),
      bearingDegrees(c[pair.secondSegment[0]], c[pair.secondSegment[1]]),
    ),
  }));
  const exact = distanceResiduals.filter((item) => item.usedInFit && item.reading.valueMm !== undefined && item.exactEndpoint && ["baseline", "baseline-tile-face", "node-to-node", "cross-tie", "door-object"].includes(item.category));
  const roomBExactIds = new Set(["SUP-065", "SUP-066", "SUP-067", "SUP-068", "SUP-069", "SUP-070", "SUP-071"]);
  const roomBExact = exact.filter((item) => item.id.includes("-B-") || roomBExactIds.has(item.id));
  const wcExact = exact.filter((item) => item.id.includes("WC") || item.id === "SUP-072");
  const rms = (items) => Math.sqrt(items.reduce((sum, item) => sum + item.residualMm ** 2, 0) / items.length);
  const roomBPoints = [c.B0, c["D3-BR"], c["B0.5"], c.B1, c.B2, c.B3, c.B4];
  const wcPoints = [c.T0, c.T1, c.T2, c.T3, c["D5-WCL"]];
  const d5Shared = sharedD5Assembly(c), d5B = d5RoomBObject(c), d3B = d3RoomBObject(c);
  const alignedWallDirection = unit(c["B0.5"], c.B1);
  const alignedWallNormal = leftNormal(alignedWallDirection);
  const largestExact = [...exact].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm))[0];
  return {
    id: definition.id,
    label: definition.label,
    options: definition.options,
    parameters,
    coordinates: c,
    distanceResiduals,
    relationResiduals,
    wallSpanResiduals,
    angularResiduals,
    parallelResiduals,
    reportedParallelDifferences,
    distanceOnlyRobustCost: objective(parameters, { excludedObservationIds: definition.options.excludedObservationIds, softParallel: false, exactObservedParallels: definition.options.exactObservedParallels, completeArchitecturalConstraints: definition.options.completeArchitecturalConstraints, distanceCostOnly: true }),
    totalRobustCost: objective(parameters, definition.options),
    softParallelChiSquare: parallelResiduals.reduce((sum, item) => sum + (item.residualDegrees / item.sigmaDegrees) ** 2, 0),
    parallelDifferenceDegrees: Math.max(...parallelResiduals.map((item) => Math.abs(item.predictedDifferenceDegrees))),
    wallBearingsDegrees: {
      D3: bearingDegrees(c.B0, c["D3-BR"]),
      D3Return: bearingDegrees(c["D3-BR"], c["B0.5"]),
      B05B1: bearingDegrees(c["B0.5"], c.B1),
      D5RoomBFace: bearingDegrees(c.B1, c.B2),
      B2B3: bearingDegrees(c.B2, c.B3),
      B3B4: bearingDegrees(c.B3, c.B4),
      B4B3: bearingDegrees(c.B4, c.B3),
      B4B0: bearingDegrees(c.B4, c.B0),
      B0B4: bearingDegrees(c.B0, c.B4),
      T0T1: bearingDegrees(c.T0, c.T1),
      T1T2: bearingDegrees(c.T1, c.T2),
      T2T3: bearingDegrees(c.T2, c.T3),
      T3T2: bearingDegrees(c.T3, c.T2),
      T3D5WCL: bearingDegrees(c.T3, c["D5-WCL"]),
    },
    clearExactRmsMm: rms(exact),
    roomBClearExactRmsMm: rms(roomBExact),
    wcClearExactRmsMm: rms(wcExact),
    largestExactDistanceResidual: largestExact,
    roomBAreaM2: polygonAreaM2(roomBPoints),
    wcAreaM2: polygonAreaM2(wcPoints),
    roomBSelfIntersects: polygonSelfIntersects(roomBPoints),
    wcSelfIntersects: polygonSelfIntersects(wcPoints),
    d3B,
    d5B,
    sharedD5Assembly: d5Shared,
    d5WC: {
      outerLeft: d5Shared.wc.outerBottom,
      outerRight: d5Shared.wc.outerTop,
      innerLeft: d5Shared.wc.innerBottom,
      innerRight: d5Shared.wc.innerTop,
      direction: scaleVector(d5Shared.direction, -1),
      casingLength: d5Shared.wc.casingLength,
      topFrameOffsetMm: d5Shared.wc.topFrameOffsetMm,
      bottomFrameOffsetMm: d5Shared.wc.bottomFrameOffsetMm,
      topDerivedRevealDepthMm: d5Shared.wc.topDerivedRevealDepthMm,
      bottomDerivedRevealDepthMm: d5Shared.wc.bottomDerivedRevealDepthMm,
      doorLeft: d5Shared.leafBottom,
      doorRight: d5Shared.leafTop,
      doorCentre: d5Shared.sharedDoorCentre,
      derivedDoorWidthMm: d5Shared.sharedDoorWidthMm,
    },
    d5AssemblyGapMm: distance(c.B1, c.T0),
    d5OppositeCasingFaceSeparationMm: d5Shared.oppositeCasingFaceSeparationMm,
    interruptedWallAlignment: {
      roomBWallSegment: ["B0.5", "B1"],
      d5AssemblyInterruption: ["B1", "T0"],
      wcWallSegment: ["T0", "T1"],
      direction: alignedWallDirection,
      b1PerpendicularDeviationMm: Math.abs(dot(subtract(c.B1, c["B0.5"]), alignedWallNormal)),
      t0PerpendicularDeviationMm: Math.abs(dot(subtract(c.T0, c["B0.5"]), alignedWallNormal)),
      t1PerpendicularDeviationMm: Math.abs(dot(subtract(c.T1, c["B0.5"]), alignedWallNormal)),
      orderedDistancesFromB05Mm: [0, distance(c["B0.5"], c.B1), distance(c["B0.5"], c.T0), distance(c["B0.5"], c.T1)],
      wallExistsAcrossB1T0: false,
      d3BRPerpendicularDistanceMm: Math.abs(dot(subtract(c["D3-BR"], c["B0.5"]), alignedWallNormal)),
      d3BRIsCollinear: Math.abs(dot(subtract(c["D3-BR"], c["B0.5"]), alignedWallNormal)) < 1e-6,
      d3SpanParallelToAlignedWalls: Math.abs(dot(d3B.direction, alignedWallNormal)) < 1e-9,
      b05IsBelowD3BRInGauge: c["B0.5"][1] > c["D3-BR"][1],
    },
  };
}

const solutions = Object.fromEntries(solutionDefinitions.map((definition) => [definition.id, diagnose(definition)]));
const selectedSolutionId = "P1";
const selected = solutions[selectedSolutionId];
const fitted = selected.coordinates;
const resultById = Object.fromEntries(selected.distanceResiduals.map((item) => [item.id, item]));
const wallSpanById = Object.fromEntries(selected.wallSpanResiduals.map((item) => [item.id, item]));
const largestExactResiduals = selected.distanceResiduals
  .filter((item) => item.usedInFit && item.reading.valueMm !== undefined && item.exactEndpoint && ["baseline", "baseline-tile-face", "node-to-node", "cross-tie", "door-object"].includes(item.category))
  .sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm))
  .slice(0, 5);
const largestReportedResiduals = [
  ...selected.distanceResiduals.filter((item) => item.usedInFit).map((item) => ({ id: item.id, predictedMm: item.predictedMm, residualMm: item.residualMm, kind: item.reading.valueMm === undefined ? "range/approximate distance" : "distance" })),
  ...selected.wallSpanResiduals.map((item) => ({ id: item.id, predictedMm: item.predictedMm, residualMm: item.residualMm, kind: "reduced-weight wall-face validation" })),
].sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm)).slice(0, 5);

const roomBSequence = ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4"];
const wcSequence = ["T0", "T1", "T2", "T3", "D5-WCL"];
const soffitStart = add(fitted.B2, scaleVector(unit(fitted.B2, fitted.B3), 192));
const baseWc03Prediction = resultById["BASE-WC-03"].predictedMm;
const previousSelectedCoordinates = {
  B0: [0, 0],
  "D3-BR": [885.08, 0],
  "B0.5": [852.73, 245.55],
  B1: [1670.41, 343.8],
  B2: [1527.68, 1207.46],
  B3: [1358.17, 2413.02],
  B4: [-287.15, 2158.66],
  T0: [1798.17, 359.15],
  T1: [3429.11, 555.13],
  T2: [3295.61, 1624.6],
  T3: [1623.61, 1418.45],
};
const coordinateMovements = Object.fromEntries(Object.entries(previousSelectedCoordinates).map(([id, previous]) => {
  const delta = subtract(fitted[id], previous);
  return [id, { previous, corrected: fitted[id], delta, magnitudeMm: Math.hypot(...delta) }];
}));

if (process.argv.includes("--complete-architecture-comparison-only")) {
  const p1 = solutions.P1;
  const a2 = solutions.A2;
  const comparisonNodeIds = ["B0", "D3-BR", "B0.5", "B1", "B2", "B3", "B4", "T0", "T1"];
  const a2DistanceById = Object.fromEntries(a2.distanceResiduals.map((item) => [item.id, item]));
  const p1DistanceById = Object.fromEntries(p1.distanceResiduals.map((item) => [item.id, item]));
  const a2WallSpanById = Object.fromEntries(a2.wallSpanResiduals.map((item) => [item.id, item]));
  const p1WallSpanById = Object.fromEntries(p1.wallSpanResiduals.map((item) => [item.id, item]));
  const measurementComparison = observations.map((observation) => ({
    id: observation.id,
    reading: observation.reading,
    sigmaMm: observation.sigmaMm,
    confidence: observation.confidence,
    p1PredictedMm: round(p1DistanceById[observation.id].predictedMm, 3),
    p1ResidualMm: round(p1DistanceById[observation.id].residualMm, 3),
    a2PredictedMm: round(a2DistanceById[observation.id].predictedMm, 3),
    a2ResidualMm: round(a2DistanceById[observation.id].residualMm, 3),
    a2StandardisedResidual: round(a2DistanceById[observation.id].residualMm / observation.sigmaMm, 3),
    residualChangeMm: round(a2DistanceById[observation.id].residualMm - p1DistanceById[observation.id].residualMm, 3),
  })).sort((a, b) => Math.abs(b.a2StandardisedResidual) - Math.abs(a.a2StandardisedResidual));
  const pointArray = (point) => point.map((value) => round(value, 2));
  const candidateRecord = (solution) => ({
    label: solution.label,
    roomBRmsMm: round(solution.roomBClearExactRmsMm, 3),
    wcRmsMm: round(solution.wcClearExactRmsMm, 3),
    robustDistanceCost: round(solution.distanceOnlyRobustCost, 4),
    totalCostIncludingArchitecturalRelations: round(solution.totalRobustCost, 4),
    largestExactResidual: { id: solution.largestExactDistanceResidual.id, residualMm: round(solution.largestExactDistanceResidual.residualMm, 3) },
    b1B2DistanceMm: round(distance(solution.coordinates.B1, solution.coordinates.B2), 3),
    baseB07: { predictedMm: round(solution.distanceResiduals.find((item) => item.id === "BASE-B-07").predictedMm, 2), residualToRangeMm: round(solution.distanceResiduals.find((item) => item.id === "BASE-B-07").residualMm, 2) },
    baseWc04: { measuredMm: 173, predictedMm: round(solution.distanceResiduals.find((item) => item.id === "BASE-WC-04").predictedMm, 2), residualMm: round(solution.distanceResiduals.find((item) => item.id === "BASE-WC-04").residualMm, 2) },
    sup080: { predictedMm: round(solution.wallSpanResiduals.find((item) => item.id === "SUP-080").predictedMm, 2), residualMm: round(solution.wallSpanResiduals.find((item) => item.id === "SUP-080").residualMm, 2) },
    sup081: { predictedMm: round(solution.wallSpanResiduals.find((item) => item.id === "SUP-081").predictedMm, 2), residualMm: round(solution.wallSpanResiduals.find((item) => item.id === "SUP-081").residualMm, 2) },
    roomBAreaM2: round(solution.roomBAreaM2, 4),
    wcAreaM2: round(solution.wcAreaM2, 4),
    bearingsDegrees: { ...Object.fromEntries(Object.entries(solution.wallBearingsDegrees).map(([id, value]) => [id, round(value, 6)])), B0B4: round(bearingDegrees(solution.coordinates.B0, solution.coordinates.B4), 6) },
    cornerAnglesDegrees: Object.fromEntries(solution.angularResiduals.map((item) => [item.corner, round(item.predictedDegrees, 3)])),
    d5: {
      sharedDoorCentreMm: pointArray(solution.sharedD5Assembly.sharedDoorCentre),
      sharedDoorBearingDegrees: round(solution.sharedD5Assembly.sharedDoorBearingDegrees, 6),
      sharedDoorLeafWidthMm: 761,
      roomBCasingWidthMm: round(distance(solution.coordinates.B1, solution.coordinates.B2), 3),
      wcCasingWidthMm: round(distance(solution.coordinates["D5-WCL"], solution.coordinates.T0), 3),
      roomBVisibleClosedWidthMm: round(solution.sharedD5Assembly.roomB.visibleClosedWidthMm, 3),
      roomBVisibleClosedResidualMm: round(solution.sharedD5Assembly.roomB.visibleWidthResidualMm, 3),
      roomBOuterCasingMm: { top: 59, bottom: 80 },
      roomBRevealDepthMm: { top: 80, bottom: 97 },
      hiddenLeafBehindStopsMm: { top: round(solution.sharedD5Assembly.roomB.hiddenAtTopMm, 3), bottom: round(solution.sharedD5Assembly.roomB.hiddenAtBottomMm, 3), total: round(solution.sharedD5Assembly.roomB.hiddenTotalMm, 3) },
      wcFrameOffsetsMm: { topFromT0: round(solution.sharedD5Assembly.wc.topFrameOffsetMm, 3), bottomFromD5WCL: round(solution.sharedD5Assembly.wc.bottomFrameOffsetMm, 3) },
      wcFrameOffsetResidualsMm: { top63: round(solution.sharedD5Assembly.wc.topFrameResidualMm, 3), bottom81: round(solution.sharedD5Assembly.wc.bottomFrameResidualMm, 3) },
      wcDerivedRevealDepthMm: { top: round(solution.sharedD5Assembly.wc.topDerivedRevealDepthMm, 3), bottom: round(solution.sharedD5Assembly.wc.bottomDerivedRevealDepthMm, 3) },
      oppositeCasingFaceSeparationMm: round(solution.sharedD5Assembly.oppositeCasingFaceSeparationMm, 3),
      onePhysicalLeaf: true,
    },
  });
  const comparison = {
    diagnosticOnly: true,
    selectedArtefactsWritten: false,
    selectedSolutionRemains: "P1",
    candidates: { P1: candidateRecord(p1), A2: candidateRecord(a2) },
    exactArchitecturalChecks: {
      d3VersusB05B1Degrees: round(Math.abs(signedParallelDifferenceDegrees(a2.wallBearingsDegrees.D3, a2.wallBearingsDegrees.B05B1)), 9),
      b05B1VersusT0T1Degrees: round(Math.abs(signedParallelDifferenceDegrees(a2.wallBearingsDegrees.B05B1, a2.wallBearingsDegrees.T0T1)), 9),
      d3ReturnVersusB0B4Degrees: round(Math.abs(signedParallelDifferenceDegrees(a2.wallBearingsDegrees.D3Return, bearingDegrees(a2.coordinates.B0, a2.coordinates.B4))), 9),
      b1B2B3AngleDegrees: round(cornerAngleDegrees(a2.coordinates.B1, a2.coordinates.B2, a2.coordinates.B3), 9),
      b1B2DistanceMm: round(distance(a2.coordinates.B1, a2.coordinates.B2), 9),
      b2OrderedBetweenB1B3: distance(a2.coordinates.B1, a2.coordinates.B3) > 874,
      aliasesPreserved: a2.coordinates.B1 === a2.coordinates["D5-BL"] && a2.coordinates.B2 === a2.coordinates["D5-BR"],
      wallExistsAcrossB1T0: a2.interruptedWallAlignment.wallExistsAcrossB1T0,
      singleSharedDoorLeaf: true,
    },
    movementP1ToA2Mm: Object.fromEntries(comparisonNodeIds.map((id) => {
      const delta = subtract(a2.coordinates[id], p1.coordinates[id]);
      return [id, { deltaX: round(delta[0], 2), deltaY: round(delta[1], 2), magnitude: round(Math.hypot(...delta), 2) }];
    })),
    wallSpanComparison: ["SUP-080", "SUP-081"].map((id) => ({
      id,
      measuredMm: a2WallSpanById[id].measuredMm,
      p1PredictedMm: round(p1WallSpanById[id].predictedMm, 2),
      p1ResidualMm: round(p1WallSpanById[id].residualMm, 2),
      a2PredictedMm: round(a2WallSpanById[id].predictedMm, 2),
      a2ResidualMm: round(a2WallSpanById[id].residualMm, 2),
    })),
    measurementComparison,
  };
  console.log(JSON.stringify(comparison, null, 2));
  process.exit(0);
}
const alignedTopologyDistances = selected.interruptedWallAlignment.orderedDistancesFromB05Mm;
const plausibilityChecks = {
  roomBDoesNotSelfIntersect: !selected.roomBSelfIntersects,
  wcDoesNotSelfIntersect: !selected.wcSelfIntersects,
  roomBAreaPlausible: selected.roomBAreaM2 >= 2.5 && selected.roomBAreaM2 <= 6,
  wcAreaPlausible: selected.wcAreaM2 >= 1 && selected.wcAreaM2 <= 3.5,
  d5AssemblyGapPositiveAndLocal: selected.d5AssemblyGapMm > 0 && selected.d5AssemblyGapMm < 400,
  interruptedWallFacesCollinearExact: selected.interruptedWallAlignment.t0PerpendicularDeviationMm < 1e-6 && selected.interruptedWallAlignment.t1PerpendicularDeviationMm < 1e-6,
  interruptedWallNodeOrderExact: alignedTopologyDistances.every((value, index) => index === 0 || value > alignedTopologyDistances[index - 1]),
  noWallEdgeAcrossD5: selected.interruptedWallAlignment.wallExistsAcrossB1T0 === false,
  d3BRExplicitlyOffLowerAlignment: !selected.interruptedWallAlignment.d3BRIsCollinear && selected.interruptedWallAlignment.d3BRPerpendicularDistanceMm > 100,
  crossTieWithin25Mm: Math.abs(resultById["SUP-079"].residualMm) < 25,
  correctedBaseWc03Within50Mm: Math.abs(resultById["BASE-WC-03"].residualMm) < 50,
  correctedBaseB07WithinWorkingSigma: Math.abs(resultById["BASE-B-07"].residualMm) < resultById["BASE-B-07"].sigmaMm,
  sup080LandingOnB3B4: wallSpanById["SUP-080"].withinSegment,
  sup081LandingOnB0B4: wallSpanById["SUP-081"].withinSegment,
  softParallelSelected: selected.options.softParallel === true,
  softFamiliesReduceMaximumDeviation: selected.parallelDifferenceDegrees < solutions.D0.parallelDifferenceDegrees,
  softFamiliesDistanceCostIncreaseBelowFifteen: selected.distanceOnlyRobustCost - solutions.D0.distanceOnlyRobustCost < 15,
  d3ObjectGeometryValid: selected.d3B.geometryValid && selected.d3B.derivedDoorFaceDepthMm > 70,
  d5ObjectGeometryValid: selected.d5B.geometryValid,
  d5OnePhysicalLeafExact: Math.abs(distance(selected.sharedD5Assembly.leafTop, selected.sharedD5Assembly.leafBottom) - 761) < 1e-6,
  d5RoomBVisibleFaceWithin5Mm: Math.abs(selected.sharedD5Assembly.roomB.visibleWidthResidualMm) < 5,
  d5WcFrameOffsetsWithin5Mm: Math.max(Math.abs(selected.sharedD5Assembly.wc.topFrameResidualMm), Math.abs(selected.sharedD5Assembly.wc.bottomFrameResidualMm)) < 5,
};
if (!Object.values(plausibilityChecks).every(Boolean)) {
  throw new Error(`Selected geometry failed plausibility checks: ${JSON.stringify({ plausibilityChecks, crossTieResidualMm: resultById["SUP-079"].residualMm, baseWc03PredictionMm: baseWc03Prediction, d5AssemblyGapMm: selected.d5AssemblyGapMm, roomBAreaM2: selected.roomBAreaM2, wcAreaM2: selected.wcAreaM2, d3Candidates: Object.fromEntries(Object.entries(solutions).map(([id, item]) => [id, { casingLengthMm: item.d3B.casingLength, alongAdjustmentMm: item.d3B.alongAdjustmentMm, depthMm: item.d3B.derivedDoorFaceDepthMm, geometryValid: item.d3B.geometryValid, parallelDifferenceDegrees: item.parallelDifferenceDegrees, distanceCost: item.distanceOnlyRobustCost, totalCost: item.totalRobustCost }])) })}`);
}

function serializePoint(point) { return { x: round(point[0], 2), y: round(point[1], 2) }; }
function serializeObjectGeometry(object) {
  return Object.fromEntries(Object.entries(object).map(([key, value]) => Array.isArray(value) ? [key, serializePoint(value)] : [key, typeof value === "number" ? round(value, 3) : value]));
}
function serializeSharedD5(assembly) {
  return {
    onePhysicalLeaf: true,
    physicalLeafWidthMm: assembly.sharedDoorWidthMm,
    leafTopMm: serializePoint(assembly.leafTop),
    leafBottomMm: serializePoint(assembly.leafBottom),
    leafCentreMm: serializePoint(assembly.sharedDoorCentre),
    leafBearingDegrees: round(assembly.sharedDoorBearingDegrees, 3),
    roomB: {
      casingWidthMm: round(assembly.roomB.casingLength, 3),
      visibleClosedWidthMm: round(assembly.roomB.visibleClosedWidthMm, 3),
      visibleClosedResidualMm: round(assembly.roomB.visibleWidthResidualMm, 3),
      outerCasingOffsetsMm: { topFromB1: 59, bottomToB2: 80 },
      revealDepthsMm: { top: 80, bottom: 97 },
      hiddenLeafBehindStopsMm: { top: round(assembly.roomB.hiddenAtTopMm, 3), bottom: round(assembly.roomB.hiddenAtBottomMm, 3), total: round(assembly.roomB.hiddenTotalMm, 3) },
    },
    wc: {
      casingWidthMm: round(assembly.wc.casingLength, 3),
      frameOffsetsMm: { topFromT0: round(assembly.wc.topFrameOffsetMm, 3), bottomFromD5WCL: round(assembly.wc.bottomFrameOffsetMm, 3) },
      frameOffsetResidualsMm: { top63: round(assembly.wc.topFrameResidualMm, 3), bottom81: round(assembly.wc.bottomFrameResidualMm, 3) },
      derivedRevealDepthsMm: { top: round(assembly.wc.topDerivedRevealDepthMm, 3), bottom: round(assembly.wc.bottomDerivedRevealDepthMm, 3) },
    },
    oppositeCasingFaceSeparationMm: round(assembly.oppositeCasingFaceSeparationMm, 3),
  };
}
function serializeSolution(solution) {
  return {
    id: solution.id,
    label: solution.label,
    excludedObservationIds: solution.options.excludedObservationIds,
    clearExactRmsMm: round(solution.clearExactRmsMm, 3),
    roomBClearExactRmsMm: round(solution.roomBClearExactRmsMm, 3),
    wcClearExactRmsMm: round(solution.wcClearExactRmsMm, 3),
    largestExactDistanceResidual: { id: solution.largestExactDistanceResidual.id, residualMm: round(solution.largestExactDistanceResidual.residualMm, 3) },
    roomBAreaM2: round(solution.roomBAreaM2, 4),
    wcAreaM2: round(solution.wcAreaM2, 4),
    distanceOnlyRobustCost: round(solution.distanceOnlyRobustCost, 4),
    totalRobustCost: round(solution.totalRobustCost, 4),
    softParallelChiSquare: round(solution.softParallelChiSquare, 4),
    parallelDifferenceDegrees: round(solution.parallelDifferenceDegrees, 3),
    wallBearingsDegrees: Object.fromEntries(Object.entries(solution.wallBearingsDegrees).map(([id, value]) => [id, round(value, 3)])),
    coordinatesMm: Object.fromEntries(Object.entries(solution.coordinates).filter(([id]) => roomBSequence.includes(id) || wcSequence.includes(id)).map(([id, point]) => [id, serializePoint(point)])),
    distanceResiduals: solution.distanceResiduals.map((item) => ({
      id: item.id,
      from: item.from,
      to: item.to,
      readingMm: item.reading,
      predictedMm: round(item.predictedMm, 2),
      residualToReadingOrRangeMm: round(item.residualMm, 2),
      sigmaMm: item.sigmaMm,
      category: item.category,
      confidence: item.confidence,
      usedInFit: item.usedInFit,
      withinRange: item.withinRange,
      note: item.note,
    })),
    relationResiduals: solution.relationResiduals.map((item) => ({ id: item.id, measuredMm: item.measuredMm, predictedMm: round(item.predictedMm, 2), residualMm: round(item.residualMm, 2), sigmaMm: item.sigmaMm, category: item.category, note: item.note })),
    wallSpanResiduals: solution.wallSpanResiduals.map((item) => ({
      id: item.id,
      measuredMm: item.measuredMm,
      predictedMm: round(item.predictedMm, 2),
      residualMm: round(item.residualMm, 2),
      sigmaMm: item.sigmaMm,
      confidence: item.confidence,
      startDescription: item.startDescription,
      startPointMm: serializePoint(item.startPoint),
      startFraction: item.startFraction,
      landingWall: item.landingWall,
      landingPointMm: serializePoint(item.landingPoint),
      landingFraction: round(item.landingFraction, 5),
      withinSegment: item.withinSegment,
      note: item.note,
    })),
    angularResiduals: solution.angularResiduals.map((item) => ({
      id: item.id,
      room: item.room,
      corner: item.corner,
      previous: item.previous,
      next: item.next,
      targetDegrees: item.targetDegrees,
      predictedDegrees: round(item.predictedDegrees, 3),
      residualDegrees: round(item.residualDegrees, 3),
      sigmaDegrees: item.sigmaDegrees,
      usedInFit: item.usedInFit,
    })),
    architecturalParallelResiduals: solution.parallelResiduals.map((item) => ({
      id: item.id,
      firstSegment: item.firstSegment,
      secondSegment: item.secondSegment,
      targetDifferenceDegrees: item.targetDifferenceDegrees,
      predictedDifferenceDegrees: round(item.predictedDifferenceDegrees, 3),
      residualDegrees: round(item.residualDegrees, 3),
      sigmaDegrees: item.sigmaDegrees,
      usedInFit: item.usedInFit,
      note: item.note,
    })),
    reportedArchitecturalPairDifferences: solution.reportedParallelDifferences.map((item) => ({
      id: item.id,
      firstSegment: item.firstSegment,
      secondSegment: item.secondSegment,
      firstBearingDegrees: round(item.firstBearingDegrees, 3),
      secondBearingDegrees: round(item.secondBearingDegrees, 3),
      differenceDegrees: round(item.differenceDegrees, 3),
    })),
    d5AssemblyGapMm: round(solution.d5AssemblyGapMm, 2),
    d5SharedPhysicalLeaf: serializeSharedD5(solution.sharedD5Assembly),
    interruptedWallAlignment: {
      ...solution.interruptedWallAlignment,
      direction: solution.interruptedWallAlignment.direction.map((value) => round(value, 8)),
      b1PerpendicularDeviationMm: round(solution.interruptedWallAlignment.b1PerpendicularDeviationMm, 8),
      t0PerpendicularDeviationMm: round(solution.interruptedWallAlignment.t0PerpendicularDeviationMm, 8),
      t1PerpendicularDeviationMm: round(solution.interruptedWallAlignment.t1PerpendicularDeviationMm, 8),
      orderedDistancesFromB05Mm: solution.interruptedWallAlignment.orderedDistancesFromB05Mm.map((value) => round(value, 3)),
      d3BRPerpendicularDistanceMm: round(solution.interruptedWallAlignment.d3BRPerpendicularDistanceMm, 3),
    },
  };
}

const verticalEvidence = {
  roomB: { B4B0ClearAreaCeilingMm: 2281, B2D5AreaCeilingMm: 2274 },
  wc: { T0D5AreaCeilingMm: 2289, T3AreaCeilingMm: 2277 },
  doors: {
    D3RoomB: { doorHeightMm: 1975, casingTopFromFloorMm: 2076, casingTopToCeilingMm: 221 },
    D5RoomB: { casingHeightMm: 2157, casingTopToCeilingMm: 237, doorHeightMm: 1974 },
    D5WC: { casingHeightMm: 2057, casingTopToCeilingMm: 225 },
  },
};

const jsonOutput = {
  documentType: "derived joint Room B/WC pilot reconstruction, evidence and residual record - not source evidence",
  version: "0.1",
  generatedDate,
  units: "millimetres",
  baselineStatus,
  authoritativeEvidence,
  photographicEvidence: {
    annotatedFolder: "source-material/photos/RoomB-WC-Survey/",
    annotatedFilesInspected: ["BASE-B-01.jpeg", "BASE-B-02.jpeg", "BASE-B-03.jpeg", "BASE-B-04.jpeg", "BASE-WC-05.jpeg", "D3-ROOM-B.jpeg", "D5-ROOM-B.jpeg", "D5-WC.jpeg", "D5-ROOM-B-20MM-CUTAWAY-TILES&DOOR.jpeg", "ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg"],
    generalRoomBAndWCFolder: "source-material/photos/RoomB/",
    contextualPlan: "source-material/plans/2dPlan.jpeg",
  },
  coordinateGauge: { B0: [0, 0], D3BR: "constrained to +X with fitted distance", note: "Gauge only; axes are not site north." },
  fittingMethod: {
    method: "Robust weighted nonlinear least squares using finite-difference Levenberg-Marquardt and Huber loss",
    exactRightAnglesImposed: false,
    candidateFits: [
      "D0: corrected distance network without directional residuals",
      "P1: the same distance network plus two strong soft wall-direction families, each evaluated at 1.1 degree sigma",
    ],
    directionalScope: "No right angle or exact parallelism is imposed. Family A strongly and softly relates D3-BR->B0.5 to B0->B4. Family B strongly and softly relates D3, B0.5->B1/T0->T1, B4->B3 and T3->T2. B0.5-B1/T0-T1 collinearity remains exact topology evidence.",
    ranges: "Interval residual: zero anywhere inside the stated range; penalty only outside the range.",
    topology: "Typed physical sequence: B0/D3-BL ->[D3 opening/casing]-> D3-BR ->[249 mm wall return]-> B0.5 ->[Room B wall]-> B1/D5-BL ->[D5 assembly interruption, no wall]-> T0/D5-WCR ->[WC wall on the same alignment]-> T1. D3-BR is explicitly not collinear with the B0.5-B1/T0-T1 alignment.",
    d5: "D5 is one shared 761 mm physical leaf. The Room B 737 mm observation is its exposed closed-face portion between frame stops, not a second leaf. Room B and WC outer casing, inner casing/frame and reveal layers remain separate around the single centreline and orientation.",
    activeEvidenceTreatment: "No active observation is excluded. Corrected BASE-WC-03 = 1685 mm, corrected SUP-071 = B2/D5-BR to B4 = 2046 mm, and corrected BASE-B-07 = 2200-2220 mm are active.",
    wallFaceChecks: "SUP-080 uses an explicit perpendicular landing on B3-B4 at reduced weight. SUP-081 assumes the 50% point of T1-T2 and a perpendicular landing on B0-B4 at low weight; it remains a broad validation because neither endpoint was physically marked.",
  },
  evidenceCorrections: {
    baseB07: {
      activeReading: "B4 -> B0 / D3-BL = approximately 2200-2220 mm",
      provenance: "2026-08-04 authoritative field recheck",
      supersededInactiveReading: "B4 -> B0 = approximately 2010-2030 mm",
      treatment: "2200-2220 mm is active; 2010-2030 mm is retained only as an erroneous inactive range in correction history.",
    },
    baseWc03: {
      activeReading: "T2 -> T3 = 1685 mm",
      provenance: "authoritative field recheck",
      supersededInactiveReading: "T2 -> T3 = 690 mm",
      treatment: "1685 mm is active; 690 mm is retained only as an erroneous inactive value in correction history.",
    },
    sup071: {
      activeReading: "B2 / D5-BR -> B4 = 2046 mm",
      provenance: "authoritative field recheck correcting endpoint and value",
      supersededInactiveReading: "B1 / D5-BR -> B4 = 2014 mm",
      treatment: "Corrected B2-to-B4 reading is active at high confidence; the superseded record is history only.",
    },
    d5FieldRecheck: {
      activeRoomB: "59 mm B1-to-inner-casing, 80 mm opposite inner-casing-to-B2, approximately 80/97 mm perpendicular reveal depths, approximately 737 mm visible closed face, 761 mm full physical leaf",
      activeWC: "63 mm T0-to-inner-casing and 81 mm D5-WCL-to-inner-casing/door reference; T3-to-D5-WCL remains 173 mm wall",
      supersededOrDifferentLayerReadings: "Room B 63/65 and 81; WC 83 and 52",
      treatment: "Superseded values are history only. WC 83/52 remain inactive because their exact frame/stop layers differ or are unconfirmed.",
    },
    d3FieldRecheck: {
      activeReading: "Room B visible closed D3 face = 738 mm",
      provenance: "authoritative final D3 field remeasurement",
      supersededInactiveReading: "D3 door face = 763 mm",
      treatment: "738 mm is the exposed closed-face width. The full physical D3 leaf width remains unresolved; 763 mm is correction history only and is not averaged into the active object geometry.",
    },
  },
  topologyCorrection: {
    controllingHumanEvidence: "D3 is the upper horizontal span ending at D3-BR. A 249 mm return drops to B0.5. B0.5->B1 and T0->T1 form the separate lower straight alignment interrupted by D5; D3-BR is not on that line and B1->T0 contains no wall.",
    confirmingPhotograph: "source-material/photos/RoomB-WC-Survey/ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg",
    supersededImplementationDifference: "The previous regeneration called all four nodes one continuous physical wall alignment and rendered B1->T0 with the derived-wall class. That incorrectly represented the D5 interruption as wall geometry and did not type the D3-BR->B0.5 edge explicitly as a shell return.",
    previousSelectedMetrics: {
      roomBClearExactRmsMm: 3.573,
      wcClearExactRmsMm: 0.545,
      sup079ResidualMm: 0,
      d5ReportedDoorFaceNormalSeparationMm: 125.76,
      largestExactResidual: { id: "SUP-070", residualMm: -9.061 },
      baseWc03PredictedMm: 1702.43,
      baseWc03ResidualMm: 1012.43,
    },
  },
  observations: {
    distance: observations.map((item) => ({ ...item })),
    relations: relationObservations.map(({ predict, ...item }) => item),
    wallFaceChecks: wallSpanObservations.map(({ evaluate, ...item }) => item),
    architecturalParallelChecks: parallelObservations,
    cornerAngleValidationOnly: angularObservations,
    zeroLengthAliases: [
      { id: "BASE-B-01", aliases: ["B0", "D3-BL"], distanceMm: 0 },
      { id: "BASE-B-04", aliases: ["B2", "D5-BR"], distanceMm: 0 },
      { id: "BASE-WC-05", aliases: ["T0", "D5-WCR"], distanceMm: 0 },
      { id: "BASE-B-03-alias", aliases: ["B1", "D5-BL"], distanceMm: 0 },
    ],
  },
  solutions: Object.fromEntries(Object.values(solutions).map((solution) => [solution.id, serializeSolution(solution)])),
  selection: {
    selectedSolutionId,
    reason: `Human review accepted P1 as the provisional Room B/WC working baseline. It reduces the maximum deviation within the two observed wall-direction families from ${round(solutions.D0.parallelDifferenceDegrees, 3)} to ${round(solutions.P1.parallelDifferenceDegrees, 3)} degrees while preserving the corrected shell topology and one-leaf D5 plausibility checks.`,
    plausibilityChecks,
  },
  selectedGeometry: {
    nodesMm: Object.fromEntries(Object.entries(fitted).filter(([id]) => roomBSequence.includes(id) || wcSequence.includes(id)).map(([id, point]) => [id, serializePoint(point)])),
    aliases: { B0: ["D3-BL"], B1: ["D5-BL"], B2: ["D5-BR"], T0: ["D5-WCR"] },
    roomBBoundarySequence: roomBSequence,
    wcBoundarySequence: wcSequence,
    areasM2: { roomB: round(selected.roomBAreaM2, 4), wc: round(selected.wcAreaM2, 4) },
    D3RoomB: serializeObjectGeometry(selected.d3B),
    D5RoomB: serializeObjectGeometry(selected.d5B),
    D5WC: serializeObjectGeometry(selected.d5WC),
    D5SharedPhysicalLeaf: serializeSharedD5(selected.sharedD5Assembly),
    jointTransitionSequence: ["B0 / D3-BL", "D3-BR", "B0.5", "B1 / D5-BL", "T0 / D5-WCR", "T1"],
    topologyEdges: [
      { from: "B0 / D3-BL", to: "D3-BR", physicalType: "upper horizontal D3 opening/casing", isWall: false, derivedMm: round(selected.d3B.casingLength, 2) },
      { from: "D3-BR", to: "B0.5", physicalType: "short Room B wall return", isWall: true, measuredMm: 249 },
      { from: "B0.5", to: "B1 / D5-BL", physicalType: "Room B finished wall", isWall: true, measuredMm: 823 },
      { from: "B1 / D5-BL", to: "T0 / D5-WCR", physicalType: "D5 doorway/wall assembly interruption", isWall: false, derivedMm: round(selected.d5AssemblyGapMm, 2) },
      { from: "T0 / D5-WCR", to: "T1", physicalType: "WC finished wall", isWall: true, measuredMm: 1643 },
    ],
    D5AssemblyGapMm: round(selected.d5AssemblyGapMm, 2),
    D5OppositeCasingFaceSeparationMm: round(selected.d5OppositeCasingFaceSeparationMm, 2),
    interruptedWallAlignment: serializeSolution(selected).interruptedWallAlignment,
    wallBearingsDegrees: Object.fromEntries(Object.entries(selected.wallBearingsDegrees).map(([id, value]) => [id, round(value, 3)])),
    cornerAnglesDegrees: selected.angularResiduals.map((item) => ({ id: item.id, room: item.room, corner: item.corner, angleDegrees: round(item.predictedDegrees, 3) })),
    coordinateMovementFromPreviousSelectedMm: Object.fromEntries(Object.entries(coordinateMovements).map(([id, item]) => [id, { previous: serializePoint(item.previous), corrected: serializePoint(item.corrected), delta: serializePoint(item.delta), magnitudeMm: round(item.magnitudeMm, 2) }])),
    wallFaceChecks: serializeSolution(selected).wallSpanResiduals,
    tileAndWallLayers: {
      B3ToB4: "Measured finished tile face; underlying wall plane shown 10 mm behind as approximate derived layer.",
      D5B2Cutaway: "Approximately 20 mm local tile/casing cutaway shown as a photo-derived secondary detail; not a shell constraint.",
    },
    soffit: { startPointMm: serializePoint(soffitStart), fromB2Mm: 192, fullGeometryModelled: false },
    verticalEvidence,
  },
  suitabilityForLater3D: {
    status: "accepted provisional input for Room C integration",
    statement: "Human review accepts this 2D shell and one-leaf D5 object as the current Room B/WC working baseline, not as final or construction-accurate geometry. Preserve it without isolated marginal optimisation; revisit only if D3 closure during Room C integration exposes a genuine network inconsistency.",
  },
};

function residualTableRows(solution, includeInactive = false) {
  return solution.distanceResiduals
    .filter((item) => includeInactive || item.usedInFit)
    .map((item) => {
      const status = item.reading.valueMm === undefined
        ? (item.withinRange ? "inside interval" : `${sign(item.residualMm)} mm to interval`)
        : `${sign(item.residualMm)} mm`;
      return `| ${item.id} | ${readingLabel(item.reading)} | ${round(item.predictedMm, 1)} | ${status} | ${item.confidence} | ${item.usedInFit ? "yes" : "no"} |`;
    }).join("\n");
}
function coordinateRows(ids) {
  return ids.map((id) => `| ${id} | ${round(fitted[id][0], 2)} | ${round(fitted[id][1], 2)} |`).join("\n");
}

const supersededReportTemplateHistory = `# Joint Room B and WC reconstruction pilot v0.1 — SUPERSEDED TEMPLATE HISTORY

**Status:** Selected **S2: ${selected.label}** on ${generatedDate}. This is derived geometry, not source evidence.

## Outcome

The topology-corrected joint model follows the authoritative sketch directly. D3 ends at D3-BR; the separate 249 mm return reaches B0.5; and the long alignment runs through **B0.5 -> B1**, the no-wall D5 gap, and **T0 -> T1**. D3-BR is explicitly off the lower alignment.

## Topology correction

The human sketch and **ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg** confirm that D3 terminates at D3-BR. From there, the 249 mm segment drops to B0.5; at B0.5 the shell turns again onto the separate lower wall alignment to B1.

The superseded regeneration still diverged in three exact ways:

- it described **B0.5 -> B1 -> T0 -> T1** as one continuous physical wall alignment;
- it drew **B1 -> T0** with the derived-wall SVG class and repeated that continuous line in the node map;
- it did not explicitly type **D3-BR -> B0.5** as a shell return distinct from every D3 casing, inner-casing and door-face layer.

The corrected typed transition is **B0/D3-BL ->[D3 opening/casing]-> D3-BR ->[249 wall return]-> B0.5 ->[Room B wall]-> B1/D5-BL ->[D5 assembly gap; no wall]-> T0/D5-WCR ->[WC wall]-> T1**.

The former solver also treated **80 + 763 + 65 = 908 mm** as if it were a measured D3 outer shell span. That was an invalid collapse of stepped object layers. The 908 mm constraint remains removed. The D3 outer endpoint span is derived from the shell network; the active object geometry uses the new 738 mm visible closed face, and the superseded 763 mm value is correction history only.

The authoritative field recheck corrects **BASE-WC-03 to T2 -> T3 = 1685 mm**. The superseded 690 mm transcription is retained only in correction history and is not active in any fit.

| Solution | Clear exact RMS | Room B RMS | WC RMS | Largest exact residual | Room B area | WC area |
|---|---:|---:|---:|---:|---:|---:|
| D0: ${solutions.D0.label} | ${round(solutions.D0.clearExactRmsMm, 3)} mm | ${round(solutions.D0.roomBClearExactRmsMm, 3)} mm | ${round(solutions.D0.wcClearExactRmsMm, 3)} mm | ${solutions.D0.largestExactDistanceResidual.id} ${sign(solutions.D0.largestExactDistanceResidual.residualMm, 2)} mm | ${round(solutions.D0.roomBAreaM2, 4)} m2 | ${round(solutions.D0.wcAreaM2, 4)} m2 |
| P1: ${solutions.P1.label} | ${round(solutions.P1.clearExactRmsMm, 3)} mm | ${round(solutions.P1.roomBClearExactRmsMm, 3)} mm | ${round(solutions.P1.wcClearExactRmsMm, 3)} mm | ${solutions.P1.largestExactDistanceResidual.id} ${sign(solutions.P1.largestExactDistanceResidual.residualMm, 2)} mm | ${round(solutions.P1.roomBAreaM2, 4)} m2 | ${round(solutions.P1.wcAreaM2, 4)} m2 |

Effect versus the superseded selected geometry:

| Quantity | Superseded | Corrected | Change |
|---|---:|---:|---:|
| Room B RMS | 3.573 mm | ${round(selected.roomBClearExactRmsMm, 3)} mm | ${sign(selected.roomBClearExactRmsMm - 3.573, 3)} mm |
| WC RMS | 0.545 mm | ${round(selected.wcClearExactRmsMm, 3)} mm | ${sign(selected.wcClearExactRmsMm - 0.545, 3)} mm |
| SUP-079 residual | +0.000 mm | ${sign(resultById["SUP-079"].residualMm, 3)} mm | ${sign(resultById["SUP-079"].residualMm, 3)} mm |
| Largest clear exact residual | SUP-070 -9.061 mm | ${selected.largestExactDistanceResidual.id} ${sign(selected.largestExactDistanceResidual.residualMm, 3)} mm | unchanged if same ID/value |
| D5 B1->T0 assembly interruption | previously mislabelled as wall/face separation | ${round(selected.d5AssemblyGapMm, 2)} mm | topology type corrected |
| BASE-WC-03 prediction | 1702.43 mm | ${round(baseWc03Prediction, 2)} mm | ${sign(baseWc03Prediction - 1702.43, 2)} mm |
| BASE-WC-03 residual | +1012.43 mm | ${sign(resultById["BASE-WC-03"].residualMm, 2)} mm | ${sign(resultById["BASE-WC-03"].residualMm - 1012.43, 2)} mm |

RMS is the unweighted RMS of active clear exact baseline, node, casing and cross-tie observations. Approximate readings, ranges and general wall-face checks are not included in this headline RMS.

## Fitting method

- Robust weighted nonlinear least squares with Huber loss.
- Clear baseline readings use 4-7 mm working sigma; clear node ties use 7-12 mm.
- **BASE-B-07**, **SUP-066** and **SUP-073** use wider 30-35 mm uncertainty.
- **SUP-067** and **SUP-068** are true interval constraints: every value inside the stated range has zero residual.
- No exact right angle or parallel relation is imposed; P1 uses the two reported strong soft wall-direction families, including D3 in the horizontal family.
- The only Room B-to-WC distance is **SUP-079**.

## Selected distance residuals

| Observation | Reading (mm) | Fitted (mm) | Residual/status | Confidence | Active |
|---|---:|---:|---:|---|---|
${residualTableRows(selected, true)}

## Superseded D5 reconciliation history

Before the final field recheck, the Room B face was incorrectly constructed from a 65/80 mm left relationship and an 81/97 mm right relationship. That interpretation treated reveal depths as diagonal links and is inactive.

The former WC 83/52 mm readings are retained only as different-layer endpoint history. They do not enter the active one-leaf model.

This template predates the final single-leaf reconstruction and is never emitted. The active report is the corrected report below.

The approximately 20 mm Room B tile/casing cutaway is shown as a photo-derived local secondary detail and is not used to alter the shell.

## D3 handling

D3 is drawn as two stepped casing/visible-face layers rather than a flat rectangle. Its complete opening runs from **B0 / D3-BL to D3-BR and ends there**. The separately typed 249 mm return then reaches B0.5. The fitted outer endpoint span is **${round(selected.d3B.casingLength, 1)} mm** and is derived from the shell network. The 80/105 mm and 65/105 mm L-shaped layers construct the authoritative **738 mm visible closed face** at a derived depth of **${round(selected.d3B.derivedDoorFaceDepthMm, 1)} mm**; none extends to B0.5. The full physical D3 leaf width remains unresolved.

## Coordinates

Coordinates use **B0 = (0,0)** and place **D3-BR** on solver +X as a gauge only.

| Node | x (mm) | y (mm) |
|---|---:|---:|
${coordinateRows([...roomBSequence, ...wcSequence])}

## Evidence used only for validation or secondary layers

- Door/casing heights, top-to-ceiling readings and the four local ceiling heights are retained as vertical evidence but not fitted in the 2D plan.
- **SUP-074 = 192 mm** locates only the soffit start marker; the full soffit is not modelled.
- The approximately 10 mm build-up behind the B3-B4 tile targets is drawn as a derived underlying wall-plane offset, not substituted for the measured finished face.
- General photos, annotated photos, the rough plan and walkthrough were used to choose the physically recognisable, non-mirrored solution branch; they were not converted into invented dimensions.

## Alias and endpoint decisions

- **B0 = D3-BL**, **B1 = D5-BL**, **B2 = D5-BR**, and **T0 = D5-WCR** are explicit coincident aliases.
- **B0.5** is a separate permanent return node and is not an alias for **D3-BR**.
- **B0.5-to-B1** and **T0-to-T1** are exactly collinear in the solver. **B1 and T0 are not aliases**, and the ${round(selected.d5AssemblyGapMm, 1)} mm interval between them is D5 assembly geometry, not wall.
- **D3-BR is ${round(selected.interruptedWallAlignment.d3BRPerpendicularDistanceMm, 1)} mm off that lower alignment** and can never collapse onto it in the parameterisation.
- Active **SUP-071** is the authoritative field recheck **B2 / D5-BR -> B4 = 2046 mm** at high confidence. The earlier B1/2014 record is correction history only.

## Visual and 3D readiness

The selected SVG follows the sketch and photographed arrangement: upper D3 ends at D3-BR; the return drops to lower corner B0.5; the lower wall runs to B1 and resumes from T0 to T1 after D5; and no line extends the lower wall backward through D3-BR or across the D5 gap.

This section is retained only as superseded template history and is not an acceptance statement.

Inspect **${outputRelative}/${svgName}** first, then use the JSON for exact coordinates, residuals and provenance.
`;

function wallSpanRows(solution) {
  return solution.wallSpanResiduals.map((item) => `| ${item.id} | ${item.measuredMm} | ${round(item.predictedMm, 1)} | ${sign(item.residualMm, 1)} | ${item.startDescription} | ${item.landingWall.join("-")} @ ${round(item.landingFraction * 100, 1)}% | ${item.withinSegment ? "yes" : "no"} |`).join("\n");
}
function angularRows(solution) {
  return solution.angularResiduals.map((item) => `| ${item.room} | ${item.corner} | ${item.targetDegrees} | ${round(item.predictedDegrees, 2)} | ${sign(item.residualDegrees, 2)} | ${item.usedInFit ? "soft" : "validation only"} |`).join("\n");
}
function bearingRows() {
  return Object.keys(selected.wallBearingsDegrees).map((id) => `| ${id} | ${round(solutions.D0.wallBearingsDegrees[id], 2)} | ${round(solutions.P1.wallBearingsDegrees[id], 2)} |`).join("\n");
}
function movementRows() {
  return Object.entries(coordinateMovements).map(([id, item]) => `| ${id} | ${round(item.previous[0], 2)}, ${round(item.previous[1], 2)} | ${round(item.corrected[0], 2)}, ${round(item.corrected[1], 2)} | ${sign(item.delta[0], 2)}, ${sign(item.delta[1], 2)} | ${round(item.magnitudeMm, 2)} |`).join("\n");
}

const correctedReport = `# Joint Room B and WC reconstruction pilot v0.1

**Status:** Human-accepted provisional working baseline **P1: ${selected.label}** on ${generatedDate}. Geometry is frozen for Room C integration. This is not final or construction-accurate geometry and remains derived rather than source evidence.

## Outcome

The active network now uses **BASE-WC-03 T2 -> T3 = 1685 mm** and **SUP-071 B2 / D5-BR -> B4 = 2046 mm**. The superseded 690 mm and B1/2014 mm records are correction history only and never enter the solve.

It also uses corrected **BASE-B-07 B4 -> B0 / D3-BL = approximately 2200-2220 mm**. The former 2010-2030 mm range is inactive correction history only.

The authoritative topology is unchanged: **B0/D3-BL -> D3 opening -> D3-BR -> 249 mm wall return -> B0.5 -> wall -> B1/D5-BL -> D5 assembly gap (no wall) -> T0/D5-WCR -> wall -> T1**. B0.5-B1 and T0-T1 are exactly collinear as physical topology evidence; D3-BR is not on that alignment; B1 and T0 remain distinct.

## Field corrections and history

- **BASE-WC-03:** active **T2 -> T3 = 1685 mm**, authoritative field recheck. Superseded **690 mm** is retained only as an erroneous inactive value in the evidence history.
- **SUP-071:** active **B2 / D5-BR -> B4 = 2046 mm**, authoritative endpoint-and-value recheck. Superseded **B1 / D5-BR -> B4 = 2014 mm** is retained only in history.
- **SUP-080:** **2217 mm** from D3-BR to an unmarked B3-B4 wall-face landing. It is represented as the perpendicular landing on that segment at reduced weight.
- **SUP-081:** **3492 mm** from approximately halfway along T1-T2 to an unmarked B0-B4 wall-face landing. It is represented using an explicit 50% start and perpendicular landing at low weight. To promote it to a precise constraint, mark both laser spots or measure each spot's along-wall offset from a named corner.
- **BASE-B-07:** active **B4 -> B0 / D3-BL = 2200-2220 mm**, authoritative field recheck dated 2026-08-04. Superseded **2010-2030 mm** is retained only as an erroneous inactive range.
- **D5 Room B:** active **59 mm / 80 mm** longitudinal outer-casing offsets, approximately **80 mm / 97 mm** perpendicular reveal depths, **737 mm** visible closed face and one **761 mm** physical leaf. Earlier 63/65 mm and 81 mm endpoint readings are inactive history.
- **D5 WC:** active **63 mm from T0** and **81 mm from D5-WCL** to the fresh inner-casing/frame references. Earlier 83/52 mm readings remain inactive different-layer history.

## Distance-only versus soft-parallel fit

No exact parallelism or right angle is imposed. P1 adds the two human-confirmed wall-direction families with a strong **1.1 degree sigma**: Family A relates the D3-BR->B0.5 return to B0->B4; Family B includes D3, the exact B0.5->B1 / T0->T1 interrupted alignment, B4->B3 and T3->T2.

| Solution | Exact RMS | Room B RMS | WC RMS | Distance cost | Maximum family deviation | Total cost | Largest exact residual |
|---|---:|---:|---:|---:|---:|---:|---:|
| D0 distance-only | ${round(solutions.D0.clearExactRmsMm, 3)} mm | ${round(solutions.D0.roomBClearExactRmsMm, 3)} mm | ${round(solutions.D0.wcClearExactRmsMm, 3)} mm | ${round(solutions.D0.distanceOnlyRobustCost, 3)} | ${round(solutions.D0.parallelDifferenceDegrees, 2)} deg | ${round(solutions.D0.totalRobustCost, 3)} | ${solutions.D0.largestExactDistanceResidual.id} ${sign(solutions.D0.largestExactDistanceResidual.residualMm, 2)} mm |
| P1 soft parallel (selected) | ${round(solutions.P1.clearExactRmsMm, 3)} mm | ${round(solutions.P1.roomBClearExactRmsMm, 3)} mm | ${round(solutions.P1.wcClearExactRmsMm, 3)} mm | ${round(solutions.P1.distanceOnlyRobustCost, 3)} | ${round(solutions.P1.parallelDifferenceDegrees, 2)} deg | ${round(solutions.P1.totalRobustCost, 3)} | ${solutions.P1.largestExactDistanceResidual.id} ${sign(solutions.P1.largestExactDistanceResidual.residualMm, 2)} mm |

P1 is the accepted provisional Room B/WC baseline because human review judged it the best current combination of corrected distance evidence and photographed construction-line relationships. Its distance-only and soft-parallel costs remain reported rather than hidden. RMS is the unweighted RMS of active exact baseline, node, casing and cross-tie observations; approximate readings, ranges and general wall-face checks are excluded from the headline RMS.

## Effects of the corrected observations

| Quantity | Selected result |
|---|---:|
| Room B RMS | ${round(selected.roomBClearExactRmsMm, 3)} mm |
| WC RMS | ${round(selected.wcClearExactRmsMm, 3)} mm |
| BASE-B-07 fit / active range residual | ${round(resultById["BASE-B-07"].predictedMm, 1)} / ${resultById["BASE-B-07"].withinRange ? "inside range" : sign(resultById["BASE-B-07"].residualMm, 1)} |
| BASE-WC-03 fit / residual | ${round(baseWc03Prediction, 1)} / ${sign(resultById["BASE-WC-03"].residualMm, 1)} mm |
| SUP-071 fit / residual | ${round(resultById["SUP-071"].predictedMm, 1)} / ${sign(resultById["SUP-071"].residualMm, 1)} mm |
| SUP-079 fit / residual | ${round(resultById["SUP-079"].predictedMm, 1)} / ${sign(resultById["SUP-079"].residualMm, 1)} mm |
| Largest exact residual | ${selected.largestExactDistanceResidual.id} ${sign(selected.largestExactDistanceResidual.residualMm, 2)} mm |
| D5 B1-to-T0 assembly gap | ${round(selected.d5AssemblyGapMm, 1)} mm |
| D5 opposite casing-face separation | ${round(selected.d5OppositeCasingFaceSeparationMm, 1)} mm |

Largest active exact residuals:

| Observation | Fitted | Residual |
|---|---:|---:|
${largestExactResiduals.map((item) => `| ${item.id} | ${round(item.predictedMm, 1)} mm | ${sign(item.residualMm, 2)} mm |`).join("\n")}

Largest deviations including approximate ranges and wall-face validations:

| Observation | Type | Fitted | Residual |
|---|---|---:|---:|
${largestReportedResiduals.map((item) => `| ${item.id} | ${item.kind} | ${round(item.predictedMm, 1)} mm | ${sign(item.residualMm, 2)} mm |`).join("\n")}

Correcting BASE-WC-03 removes the artificial 1012 mm conflict created by the inactive 690 mm transcription. Correcting SUP-071 removes the former endpoint ambiguity and directly constrains B2/D5-BR to B4 at high confidence.

Correcting BASE-B-07 removes the former short B4-B0 range that pulled the shell inward. The selected two-family comparison and its effect on SUP-080 are shown below.

Relative to the previous selected reconstruction, SUP-080 changes from approximately **2297.3 mm (+80.3 mm)** to **${round(wallSpanById["SUP-080"].predictedMm, 1)} mm (${sign(wallSpanById["SUP-080"].residualMm, 1)} mm)**. This reduced-weight validation discrepancy remains substantial; it is not used as a construction-line constraint.

## Selected distance residuals

| Observation | Reading (mm) | Fitted (mm) | Residual/status | Confidence | Active |
|---|---:|---:|---:|---|---|
${residualTableRows(selected, true)}

## New wall-to-wall checks

| Check | Measured | Fitted | Residual | Modelled start | Derived landing | On segment |
|---|---:|---:|---:|---|---|---|
${wallSpanRows(selected)}

## Selected bearings and parallel differences

Bearings are in the solver gauge, clockwise from +X; only relative changes matter.

| Wall/face | D0 bearing | P1 bearing |
|---|---:|---:|
${bearingRows()}

| Comparison | D0 | P1 |
|---|---:|---:|
${reportedParallelPairs.map((pair) => {
  const d0 = solutions.D0.reportedParallelDifferences.find((item) => item.id === pair.id);
  const p1 = solutions.P1.reportedParallelDifferences.find((item) => item.id === pair.id);
  return `| ${pair.firstSegment.join("->")} versus ${pair.secondSegment.join("->")} | ${round(Math.abs(d0.differenceDegrees), 2)} deg | ${round(Math.abs(p1.differenceDegrees), 2)} deg |`;
}).join("\n")}

## Coordinate movement from the previous selected reconstruction

The solver gauge fixes B0 at the origin and D3 along +X, so the movements below are in that common gauge.

| Node | Previous x,y | Corrected x,y | Delta x,y | Movement |
|---|---:|---:|---:|---:|
${movementRows()}

## D3 and D5 physical layers

D3 ends at D3-BR. Its casing span is **${round(selected.d3B.casingLength, 1)} mm**; the preserved 80/105 mm and 65/105 mm layers construct the authoritative **738 mm visible closed face** at derived depth **${round(selected.d3B.derivedDoorFaceDepthMm, 1)} mm**. The full physical leaf width is not inferred. None of those object layers extends to B0.5. D3-BR is **${round(selected.interruptedWallAlignment.d3BRPerpendicularDistanceMm, 1)} mm** off the B0.5-B1/T0-T1 wall alignment.

The D5 model now contains exactly one physical blue leaf: **${round(selected.sharedD5Assembly.sharedDoorWidthMm, 1)} mm** long, centred at **(${round(selected.sharedD5Assembly.sharedDoorCentre[0], 2)}, ${round(selected.sharedD5Assembly.sharedDoorCentre[1], 2)})** with bearing **${round(selected.sharedD5Assembly.sharedDoorBearingDegrees, 3)} degrees** in the solver gauge.

The Room B casing fits **${round(selected.d5B.casingLength, 1)} mm**. Its fresh 59 mm and 80 mm longitudinal frame offsets plus the 80 mm and 97 mm perpendicular reveal depths expose **${round(selected.sharedD5Assembly.roomB.visibleClosedWidthMm, 1)} mm** of the closed leaf, residual **${sign(selected.sharedD5Assembly.roomB.visibleWidthResidualMm, 1)} mm** against the approximate 737 mm observation. The remaining **${round(selected.sharedD5Assembly.roomB.hiddenTotalMm, 1)} mm** of the same leaf sits behind the two stops: derived **${round(selected.sharedD5Assembly.roomB.hiddenAtTopMm, 1)} mm** at the B1 end and **${round(selected.sharedD5Assembly.roomB.hiddenAtBottomMm, 1)} mm** at the B2 end.

The WC casing fits **${round(selected.d5WC.casingLength, 1)} mm**. The shared leaf predicts **${round(selected.sharedD5Assembly.wc.topFrameOffsetMm, 1)} mm** from T0 and **${round(selected.sharedD5Assembly.wc.bottomFrameOffsetMm, 1)} mm** from D5-WCL, each residual **${sign(selected.sharedD5Assembly.wc.topFrameResidualMm, 1)} mm** against the fresh 63 mm / 81 mm observations. WC perpendicular reveal depths are not directly measured; the shared geometry derives **${round(selected.sharedD5Assembly.wc.topDerivedRevealDepthMm, 1)} mm** and **${round(selected.sharedD5Assembly.wc.bottomDerivedRevealDepthMm, 1)} mm**.

B1-to-T0 remains a **${round(selected.d5AssemblyGapMm, 1)} mm assembly interruption**, not wall. The derived separation between the Room B and WC casing faces is **${round(selected.d5OppositeCasingFaceSeparationMm, 1)} mm**.

## Coordinates

Coordinates use **B0 = (0,0)** and place **D3-BR** on solver +X as a gauge only.

| Node | x (mm) | y (mm) |
|---|---:|---:|
${coordinateRows([...roomBSequence, ...wcSequence])}

## Visual and 3D readiness

The accepted provisional SVG follows the sketch and photographed arrangement: D3 ends at D3-BR and is nearly parallel to B4-B3, B0.5-B1, T0-T1 and T3-T2; the short return reaches and terminates at corner B0.5 nearly parallel to B0-B4; the wall then turns and runs to B1 before resuming from T0 to T1 after D5; and no wall line extends backward through D3-BR or across the D5 gap. D5 remains one shared physical door assembly.

The single-leaf D5 object reconciles the fresh field evidence without a material shell distortion. This geometry is now an **accepted provisional input** to the independent Room C reconstruction. Do not continue isolated Room B/WC optimisation. Any later adjustment should be driven by global D3 closure evidence when Room C is joined to Room B/WC; SUP-080 and SUP-081 remain validation-grade.
`;

function xml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
const canvas = { width: 1900, height: 1200 };
const plottedPoints = [...roomBSequence, ...wcSequence].map((id) => fitted[id]);
const minX = Math.min(...plottedPoints.map((point) => point[0])) - 220;
const maxX = Math.max(...plottedPoints.map((point) => point[0])) + 220;
const minY = Math.min(...plottedPoints.map((point) => point[1])) - 250;
const maxY = Math.max(...plottedPoints.map((point) => point[1])) + 250;
const planPanel = { x: 45, y: 105, width: 1210, height: 1010 };
const drawingScale = Math.min((planPanel.width - 100) / (maxX - minX), (planPanel.height - 120) / (maxY - minY));
function screen(point) {
  return [planPanel.x + 50 + (point[0] - minX) * drawingScale, planPanel.y + 60 + (point[1] - minY) * drawingScale];
}
function pointString(point) { const result = screen(point); return `${round(result[0], 1)},${round(result[1], 1)}`; }
function linePoints(a, b, klass, extra = "") {
  const first = screen(a), second = screen(b);
  return `<line x1="${round(first[0], 1)}" y1="${round(first[1], 1)}" x2="${round(second[0], 1)}" y2="${round(second[1], 1)}" class="${klass}" ${extra}/>`;
}
function textNode(x, y, value, klass = "body", anchor = "start") {
  return `<text x="${round(x, 1)}" y="${round(y, 1)}" class="${klass}" text-anchor="${anchor}">${xml(value)}</text>`;
}
function planText(point, dx, dy, value, klass = "label", anchor = "start") {
  const position = screen(point);
  return textNode(position[0] + dx, position[1] + dy, value, klass, anchor);
}
function dimension(a, b, offsetMm, label, confidence = "high") {
  const direction = unit(a, b), normal = rightNormal(direction);
  const first = add(a, scaleVector(normal, offsetMm)), second = add(b, scaleVector(normal, offsetMm));
  const centre = midpoint(first, second), firstScreen = screen(first), secondScreen = screen(second), centreScreen = screen(centre);
  const klass = confidence === "low" ? "dimension-low" : confidence === "medium" ? "dimension-medium" : "dimension";
  return [
    linePoints(first, second, klass, `marker-start="url(#arrow)" marker-end="url(#arrow)"`),
    `<line x1="${round(screen(a)[0], 1)}" y1="${round(screen(a)[1], 1)}" x2="${round(firstScreen[0], 1)}" y2="${round(firstScreen[1], 1)}" class="extension"/>`,
    `<line x1="${round(screen(b)[0], 1)}" y1="${round(screen(b)[1], 1)}" x2="${round(secondScreen[0], 1)}" y2="${round(secondScreen[1], 1)}" class="extension"/>`,
    textNode(centreScreen[0], centreScreen[1] - 6, label, "dimension-label", "middle"),
  ].join("\n");
}

const svg = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}" viewBox="0 0 ${canvas.width} ${canvas.height}" role="img" aria-labelledby="title description">`,
  `<title id="title">Joint Room B and WC selected reconstruction</title>`,
  `<desc id="description">Derived weighted 2D reconstruction showing D3 ending at D3-BR, the separate D3-BR to B0.5 wall return, collinear Room B and WC wall segments interrupted by the D5 assembly, residuals, confidence classes, scale and SUP-079.</desc>`,
  `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M8 0 L0 4 L8 8" fill="none" stroke="#64748b" stroke-width="1.2"/></marker></defs>`,
  `<style>
    .bg{fill:#f5f4ef}.panel{fill:#fff;stroke:#cbd5e1;stroke-width:1.5}.room-b-fill{fill:#dbeafe;fill-opacity:.55}.wc-fill{fill:#dcfce7;fill-opacity:.65}
    .wall{stroke:#1f2937;stroke-width:8;stroke-linecap:round}.wall-return{stroke:#334155;stroke-width:8;stroke-linecap:round}.wall-derived{stroke:#6b7280;stroke-width:3;stroke-dasharray:7 5}.tile-face{stroke:#0891b2;stroke-width:9;stroke-linecap:round}.opening-ref{stroke:#0f766e;stroke-width:2.5;stroke-dasharray:8 5}
    .assembly-fill{fill:#ede9fe;fill-opacity:.8;stroke:none}.assembly-depth{stroke:#7c3aed;stroke-width:3;stroke-dasharray:7 5}
    .outer-casing{stroke:#d97706;stroke-width:8;stroke-linecap:round}.inner-casing{stroke:#f59e0b;stroke-width:4}.door-face{stroke:#2563eb;stroke-width:10;stroke-linecap:round}.door-depth{stroke:#7c3aed;stroke-width:2;stroke-dasharray:5 4}
    .tie{stroke:#7c3aed;stroke-width:2.5;stroke-dasharray:11 7}.wall-check{stroke:#0f766e;stroke-width:2.2;stroke-dasharray:5 5}.soffit{stroke:#9333ea;stroke-width:4;stroke-dasharray:4 4}.cutaway{stroke:#db2777;stroke-width:4;stroke-dasharray:3 3}
    .node{fill:#fff;stroke:#111827;stroke-width:2}.object-node{fill:#fff7ed;stroke:#d97706;stroke-width:2}.title{font:700 28px Arial,sans-serif;fill:#111827}.subtitle{font:14px Arial,sans-serif;fill:#475569}.head{font:700 17px Arial,sans-serif;fill:#111827}.body{font:14px Arial,sans-serif;fill:#334155}.small{font:12px Arial,sans-serif;fill:#475569}
    .label{font:700 13px Arial,sans-serif;fill:#111827;paint-order:stroke;stroke:#fff;stroke-width:5px;stroke-linejoin:round}.alias{font:11px Arial,sans-serif;fill:#92400e;paint-order:stroke;stroke:#fff;stroke-width:4px}.object-label{font:700 12px Arial,sans-serif;fill:#1e40af;paint-order:stroke;stroke:#fff;stroke-width:5px}.note{font:11px Arial,sans-serif;fill:#7e22ce;paint-order:stroke;stroke:#fff;stroke-width:4px}
    .dimension,.dimension-medium,.dimension-low{stroke:#64748b;stroke-width:1.3;fill:none}.dimension-medium{stroke-dasharray:6 4}.dimension-low{stroke-dasharray:2 4}.extension{stroke:#94a3b8;stroke-width:1}.dimension-label{font:11px Arial,sans-serif;fill:#334155;paint-order:stroke;stroke:#fff;stroke-width:4px}.good{fill:#15803d;font-weight:700}.warn{fill:#b45309;font-weight:700}.bad{fill:#b91c1c;font-weight:700}.rule{stroke:#e2e8f0}.legend-line{stroke-width:6}.room-name{font:700 23px Arial,sans-serif;fill:#334155;opacity:.7}.scale{stroke:#111827;stroke-width:5}
  </style>`,
  `<rect width="${canvas.width}" height="${canvas.height}" class="bg"/>`,
  textNode(50, 48, "ROOM B + WC — SELECTED JOINT RECONSTRUCTION", "title"),
  textNode(50, 76, "Derived 2D geometry · authoritative local D3 double-turn · D5 gap has no wall · full soffit omitted", "subtitle"),
  `<rect x="${planPanel.x}" y="${planPanel.y}" width="${planPanel.width}" height="${planPanel.height}" rx="10" class="panel"/>`,
  `<rect x="1280" y="105" width="575" height="1010" rx="10" class="panel"/>`,
  `<polygon points="${roomBSequence.map((id) => pointString(fitted[id])).join(" ")}" class="room-b-fill"/>`,
  `<polygon points="${wcSequence.map((id) => pointString(fitted[id])).join(" ")}" class="wc-fill"/>`,
  `<polygon points="${[fitted.B1, fitted.B2, fitted["D5-WCL"], fitted.T0].map(pointString).join(" ")}" class="assembly-fill"/>`,
];

svg.push(linePoints(fitted["D3-BR"], fitted["B0.5"], "wall-return"));
for (const [from, to] of [["B0.5", "B1"], ["B2", "B3"], ["B3", "B4"], ["B4", "B0"]]) svg.push(linePoints(fitted[from], fitted[to], "wall"));
for (const [from, to] of [["T0", "T1"], ["T1", "T2"], ["T2", "T3"], ["T3", "D5-WCL"]]) svg.push(linePoints(fitted[from], fitted[to], "wall"));
svg.push(linePoints(fitted.B1, fitted.T0, "assembly-depth"));
svg.push(linePoints(fitted.B2, fitted["D5-WCL"], "assembly-depth"));
svg.push(linePoints(fitted.B0, fitted["D3-BR"], "opening-ref"));
svg.push(linePoints(fitted.B1, fitted.B2, "opening-ref"));
svg.push(linePoints(fitted["D5-WCL"], fitted.T0, "opening-ref"));

// Tile face and the approximate underlying wall plane behind the measured finished face.
svg.push(linePoints(fitted.B2, fitted.B3, "tile-face"));
svg.push(linePoints(fitted.B3, fitted.B4, "tile-face"));
const b3b4Direction = unit(fitted.B3, fitted.B4), b3b4Outward = rightNormal(b3b4Direction);
svg.push(linePoints(add(fitted.B3, scaleVector(b3b4Outward, 10)), add(fitted.B4, scaleVector(b3b4Outward, 10)), "wall-derived"));

const d3Visual = selected.d3B, d5BVisual = selected.d5B, d5WCVisual = selected.d5WC, d5SharedVisual = selected.sharedD5Assembly;
svg.push(linePoints(d3Visual.outerLeft, d3Visual.outerRight, "outer-casing"));
svg.push(linePoints(d3Visual.outerLeft, d3Visual.innerLeft, "inner-casing"));
svg.push(linePoints(d3Visual.outerRight, d3Visual.innerRight, "inner-casing"));
svg.push(linePoints(d3Visual.innerLeft, d3Visual.doorLeft, "inner-casing"));
svg.push(linePoints(d3Visual.innerRight, d3Visual.doorRight, "inner-casing"));
svg.push(linePoints(d3Visual.doorLeft, d3Visual.doorRight, "door-face"));

svg.push(linePoints(d5BVisual.outerLeft, d5BVisual.outerRight, "outer-casing"));
svg.push(linePoints(d5BVisual.outerLeft, d5BVisual.innerLeft, "inner-casing"));
svg.push(linePoints(d5BVisual.outerRight, d5BVisual.innerRight, "inner-casing"));
svg.push(linePoints(d5BVisual.innerLeft, d5BVisual.visibleDoorLeft, "inner-casing"));
svg.push(linePoints(d5BVisual.innerRight, d5BVisual.visibleDoorRight, "inner-casing"));

svg.push(linePoints(d5WCVisual.outerLeft, d5WCVisual.outerRight, "outer-casing"));
svg.push(linePoints(d5WCVisual.outerLeft, d5WCVisual.innerLeft, "inner-casing"));
svg.push(linePoints(d5WCVisual.outerRight, d5WCVisual.innerRight, "inner-casing"));
svg.push(linePoints(d5WCVisual.innerRight, d5SharedVisual.leafTop, "door-depth"));
svg.push(linePoints(d5WCVisual.innerLeft, d5SharedVisual.leafBottom, "door-depth"));

// Exactly one physical D5 leaf. The Room B visible 737 mm portion is shown by
// its endpoint markers/dimension, not by drawing a second blue door face.
svg.push(linePoints(d5SharedVisual.leafTop, d5SharedVisual.leafBottom, "door-face"));
for (const visiblePoint of [d5BVisual.visibleDoorLeft, d5BVisual.visibleDoorRight]) {
  const visibleScreen = screen(visiblePoint);
  svg.push(`<circle cx="${round(visibleScreen[0], 1)}" cy="${round(visibleScreen[1], 1)}" r="5" class="object-node"/>`);
}
svg.push(dimension(d5BVisual.visibleDoorLeft, d5BVisual.visibleDoorRight, -75, `Room B visible ~737 · fit ${round(d5SharedVisual.roomB.visibleClosedWidthMm, 1)}`, "medium"));

// Photo-derived local cutaway: shown at its measured magnitude but kept out of the shell solve.
const cutawayDirection = d5BVisual.direction, cutawayNormal = d5BVisual.inward;
const cutawayA = add(fitted.B2, scaleVector(cutawayDirection, -55));
const cutawayB = add(cutawayA, scaleVector(cutawayNormal, 20));
svg.push(linePoints(cutawayA, cutawayB, "cutaway"));
svg.push(planText(cutawayB, 10, 4, "~20 mm local tile/casing cutaway", "note"));

svg.push(linePoints(fitted.B0, fitted.T2, "tie"));
svg.push(planText(midpoint(fitted.B0, fitted.T2), 8, -9, `SUP-079 3674 / fit ${round(resultById["SUP-079"].predictedMm, 1)} (${sign(resultById["SUP-079"].residualMm, 1)})`, "note"));
for (const item of selected.wallSpanResiduals) {
  svg.push(linePoints(item.startPoint, item.landingPoint, "wall-check"));
  svg.push(planText(midpoint(item.startPoint, item.landingPoint), 8, item.id === "SUP-080" ? -8 : 14, `${item.id} ${item.measuredMm} / fit ${round(item.predictedMm, 1)} (${sign(item.residualMm, 1)})`, "note"));
}

const soffitScreen = screen(soffitStart);
svg.push(`<circle cx="${round(soffitScreen[0], 1)}" cy="${round(soffitScreen[1], 1)}" r="9" fill="#fff" class="soffit"/>`);
svg.push(planText(soffitStart, 12, -10, "soffit starts 192 mm from B2", "note"));
svg.push(planText(soffitStart, 12, 6, "full profile unresolved / not modelled", "small"));

svg.push(dimension(fitted["D3-BR"], fitted["B0.5"], 95, `BASE-B-02 249 · fit ${round(resultById["BASE-B-02"].predictedMm, 1)}`));
svg.push(dimension(fitted["B0.5"], fitted.B1, -100, `BASE-B-03 823 · fit ${round(resultById["BASE-B-03"].predictedMm, 1)}`));
svg.push(dimension(fitted.B1, fitted.B2, 135, `D5-B casing 874 · fit ${round(resultById["D5-B-CASING-WIDTH"].predictedMm, 1)}`));
svg.push(dimension(fitted.B2, fitted.B3, 105, `BASE-B-05 1218 · fit ${round(resultById["BASE-B-05"].predictedMm, 1)}`));
svg.push(dimension(fitted.B3, fitted.B4, 115, `tile face 1665 · fit ${round(resultById["BASE-B-06"].predictedMm, 1)}`));
svg.push(dimension(fitted.B4, fitted.B0, 100, `BASE-B-07 2200-2220 · fit ${round(resultById["BASE-B-07"].predictedMm, 1)}`, "low"));
svg.push(dimension(fitted.T0, fitted.T1, -105, `WC 1643 · fit ${round(resultById["BASE-WC-01"].predictedMm, 1)}`));
svg.push(dimension(fitted.T1, fitted.T2, -95, `WC 1078 · fit ${round(resultById["BASE-WC-02"].predictedMm, 1)}`));
svg.push(dimension(fitted.T2, fitted.T3, -100, `BASE-WC-03 1685 · fit ${round(baseWc03Prediction, 1)}`));
svg.push(dimension(fitted.T3, fitted["D5-WCL"], -75, `WC wall 173 · fit ${round(resultById["BASE-WC-04"].predictedMm, 1)}`));

const nodeOffsets = {
  B0: [-30, -16], "D3-BR": [-8, 28], "B0.5": [-12, 30], B1: [-35, -18], B2: [-40, 35], B3: [-15, 34], B4: [-34, 26],
  T0: [12, -16], T1: [12, -15], T2: [12, 30], T3: [-24, 34], "D5-WCL": [12, 28],
};
for (const id of [...roomBSequence, ...wcSequence]) {
  const position = screen(fitted[id]);
  svg.push(`<circle cx="${round(position[0], 1)}" cy="${round(position[1], 1)}" r="6" class="node"/>`);
  const offset = nodeOffsets[id] || [9, -9];
  svg.push(textNode(position[0] + offset[0], position[1] + offset[1], id, "label"));
}
svg.push(planText(fitted.B0, -34, -34, "= D3-BL", "alias"));
svg.push(planText(fitted.B1, -58, -35, "= D5-BL", "alias"));
svg.push(planText(fitted.B2, -62, 53, "= D5-BR", "alias"));
svg.push(planText(fitted.T0, 12, -35, "= D5-WCR", "alias"));
svg.push(planText(midpoint(fitted["D3-BR"], fitted["B0.5"]), 35, -18, "D3 ends at D3-BR · 249 wall return", "note"));

svg.push(planText(midpoint(fitted.B3, fitted.B4), 0, -30, "ROOM B", "room-name", "middle"));
svg.push(planText(midpoint(fitted.T1, fitted.T2), -100, 0, "WC", "room-name", "middle"));
svg.push(planText(d3Visual.doorCentre, 0, -15, "D3 visible closed face 738", "object-label", "middle"));
svg.push(planText(d5SharedVisual.sharedDoorCentre, 12, -15, "D5 shared physical leaf 761", "object-label"));

// Scale bar.
const scaleOrigin = [planPanel.x + 75, planPanel.y + planPanel.height - 48];
const scaleLength = 1000 * drawingScale;
svg.push(`<line x1="${scaleOrigin[0]}" y1="${scaleOrigin[1]}" x2="${round(scaleOrigin[0] + scaleLength, 1)}" y2="${scaleOrigin[1]}" class="scale"/>`);
svg.push(`<line x1="${scaleOrigin[0]}" y1="${scaleOrigin[1] - 8}" x2="${scaleOrigin[0]}" y2="${scaleOrigin[1] + 8}" class="scale"/>`);
svg.push(`<line x1="${round(scaleOrigin[0] + scaleLength, 1)}" y1="${scaleOrigin[1] - 8}" x2="${round(scaleOrigin[0] + scaleLength, 1)}" y2="${scaleOrigin[1] + 8}" class="scale"/>`);
svg.push(textNode(scaleOrigin[0], scaleOrigin[1] - 13, "0", "small", "middle"));
svg.push(textNode(scaleOrigin[0] + scaleLength, scaleOrigin[1] - 13, "1 m", "small", "middle"));

// Information panel.
const panelX = 1310;
let panelY = 145;
svg.push(textNode(panelX, panelY, "SELECTED SOLUTION", "head")); panelY += 28;
svg.push(textNode(panelX, panelY, "ACCEPTED PROVISIONAL P1 · ROOM C INPUT", "good")); panelY += 23;
svg.push(textNode(panelX, panelY, `Clear exact RMS ${round(selected.clearExactRmsMm, 3)} mm`, "body")); panelY += 20;
svg.push(textNode(panelX, panelY, `Room B ${round(selected.roomBClearExactRmsMm, 3)} · WC ${round(selected.wcClearExactRmsMm, 3)} mm RMS`, "body")); panelY += 20;
svg.push(textNode(panelX, panelY, `D0 cost ${round(solutions.D0.distanceOnlyRobustCost, 2)} · max family Δ ${round(solutions.D0.parallelDifferenceDegrees, 1)}°`, "small")); panelY += 18;
svg.push(textNode(panelX, panelY, `P1 distance cost ${round(solutions.P1.distanceOnlyRobustCost, 2)} · max family Δ ${round(solutions.P1.parallelDifferenceDegrees, 1)}°`, "small")); panelY += 18;
svg.push(textNode(panelX, panelY, `Largest exact ${selected.largestExactDistanceResidual.id} ${sign(selected.largestExactDistanceResidual.residualMm, 2)} mm`, "body")); panelY += 20;
svg.push(textNode(panelX, panelY, `Areas B ${round(selected.roomBAreaM2, 3)} m² · WC ${round(selected.wcAreaM2, 3)} m²`, "body")); panelY += 20;
svg.push(textNode(panelX, panelY, `Derived B1→T0 D5 assembly gap ${round(selected.d5AssemblyGapMm, 1)} mm`, "body")); panelY += 20;
svg.push(textNode(panelX, panelY, "B0.5→B1 / T0→T1 wall collinearity: exact", "good")); panelY += 20;
svg.push(textNode(panelX, panelY, "No physical wall edge across B1→T0", "good")); panelY += 34;
svg.push(textNode(panelX, panelY, `D3-BR off lower alignment: ${round(selected.interruptedWallAlignment.d3BRPerpendicularDistanceMm, 1)} mm`, "good")); panelY += 20;
svg.push(`<line x1="${panelX}" y1="${panelY}" x2="1825" y2="${panelY}" class="rule"/>`); panelY += 28;

svg.push(textNode(panelX, panelY, "AUTHORITATIVE FIELD RECHECKS", "head")); panelY += 27;
svg.push(textNode(panelX, panelY, `BASE-WC-03 1685 · fit ${round(baseWc03Prediction, 1)} (${sign(resultById["BASE-WC-03"].residualMm, 1)})`, "good")); panelY += 20;
svg.push(textNode(panelX, panelY, `SUP-071 B2→B4 2046 · fit ${round(resultById["SUP-071"].predictedMm, 1)} (${sign(resultById["SUP-071"].residualMm, 1)})`, "good")); panelY += 20;
svg.push(textNode(panelX, panelY, `SUP-080 2217 · fit ${round(wallSpanById["SUP-080"].predictedMm, 1)} (${sign(wallSpanById["SUP-080"].residualMm, 1)})`, "body")); panelY += 20;
svg.push(textNode(panelX, panelY, `SUP-081 3492 · fit ${round(wallSpanById["SUP-081"].predictedMm, 1)} (${sign(wallSpanById["SUP-081"].residualMm, 1)})`, "body")); panelY += 20;
svg.push(textNode(panelX, panelY, "SUP-081 endpoints remain validation-grade", "warn")); panelY += 32;
svg.push(textNode(panelX, panelY, `D5 one leaf 761 · bearing ${round(d5SharedVisual.sharedDoorBearingDegrees, 2)}°`, "good")); panelY += 20;
svg.push(textNode(panelX, panelY, `Room B visible ~737 · fit ${round(d5SharedVisual.roomB.visibleClosedWidthMm, 1)} (${sign(d5SharedVisual.roomB.visibleWidthResidualMm, 1)})`, "good")); panelY += 20;
svg.push(textNode(panelX, panelY, `WC frame 63/81 · fit ${round(d5SharedVisual.wc.topFrameOffsetMm, 1)}/${round(d5SharedVisual.wc.bottomFrameOffsetMm, 1)}`, "good")); panelY += 24;
svg.push(`<line x1="${panelX}" y1="${panelY}" x2="1825" y2="${panelY}" class="rule"/>`); panelY += 28;

svg.push(textNode(panelX, panelY, "LARGEST ACTIVE RESIDUALS", "head")); panelY += 27;
const residualsForPanel = [...selected.distanceResiduals.filter((item) => item.usedInFit && item.reading.valueMm !== undefined)]
  .sort((a, b) => Math.abs(b.residualMm) - Math.abs(a.residualMm)).slice(0, 4);
for (const item of residualsForPanel) {
  svg.push(textNode(panelX, panelY, `${item.id}: ${sign(item.residualMm, 1)} mm · ${item.confidence}`, Math.abs(item.residualMm) > 25 ? "warn" : "body"));
  panelY += 21;
}
panelY += 12;
svg.push(textNode(panelX, panelY, "RANGES", "head")); panelY += 26;
for (const id of ["BASE-B-07", "SUP-067", "SUP-068"]) {
  const item = resultById[id];
  svg.push(textNode(panelX, panelY, `${id}: ${readingLabel(item.reading)} → ${round(item.predictedMm, 1)} (${item.withinRange ? "inside" : sign(item.residualMm, 1)})`, "body")); panelY += 21;
}
panelY += 12;
svg.push(`<line x1="${panelX}" y1="${panelY}" x2="1825" y2="${panelY}" class="rule"/>`); panelY += 28;

svg.push(textNode(panelX, panelY, "LAYER / CONFIDENCE LEGEND", "head")); panelY += 26;
const legendItems = [
  ["wall", "finished wall plane"], ["wall-return", "D3-BR→B0.5 shell return"], ["assembly-depth", "D5 assembly interruption / no wall"], ["tile-face", "measured finished tile face"], ["wall-derived", "derived underlying wall plane"],
  ["outer-casing", "outer casing face"], ["inner-casing", "inner casing / frame stop / reveal"], ["door-face", "one physical door leaf"], ["door-depth", "derived WC reveal relation"], ["tie", "SUP-079 node cross-tie"], ["wall-check", "SUP-080/081 wall-face checks"], ["cutaway", "approx local D5 cutaway"],
];
for (const [klass, label] of legendItems) {
  svg.push(`<line x1="${panelX}" y1="${panelY - 4}" x2="${panelX + 40}" y2="${panelY - 4}" class="${klass}"/>`);
  svg.push(textNode(panelX + 52, panelY, label, "small")); panelY += 17;
}
panelY += 5;
svg.push(textNode(panelX, panelY, "Solid dimension = high confidence", "small")); panelY += 18;
svg.push(textNode(panelX, panelY, "Dashed = range / interpreted · dotted = low", "small")); panelY += 18;

svg.push(textNode(65, 1160, "Derived artefact — source evidence remains the Room B/WC Markdown packs and annotated survey photographs", "small"));
svg.push(textNode(1835, 1160, `Generated ${generatedDate}`, "small", "end"));
svg.push(`</svg>`);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, jsonName), `${JSON.stringify(jsonOutput, null, 2)}\n`);
fs.writeFileSync(path.join(outputDir, reportName), correctedReport);
fs.writeFileSync(path.join(outputDir, svgName), `${svg.join("\n")}\n`);

const solverOutput = {
  outputDir: outputRelative,
  files: [svgName, jsonName, reportName, solverOutputName],
  selectedSolutionId,
  baselineStatus,
  clearExactRmsMm: round(selected.clearExactRmsMm, 3),
  roomBRmsMm: round(selected.roomBClearExactRmsMm, 3),
  wcRmsMm: round(selected.wcClearExactRmsMm, 3),
  largestExactResidual: { id: selected.largestExactDistanceResidual.id, residualMm: round(selected.largestExactDistanceResidual.residualMm, 3) },
  correctedBaseB07: { activeRangeMm: [2200, 2220], predictedMm: round(resultById["BASE-B-07"].predictedMm, 2), residualToRangeMm: round(resultById["BASE-B-07"].residualMm, 2), withinRange: resultById["BASE-B-07"].withinRange },
  correctedBaseWc03: { observedMm: 1685, predictedMm: round(baseWc03Prediction, 2), residualMm: round(resultById["BASE-WC-03"].residualMm, 2) },
  correctedSup071: { from: "B2 / D5-BR", to: "B4", observedMm: 2046, predictedMm: round(resultById["SUP-071"].predictedMm, 2), residualMm: round(resultById["SUP-071"].residualMm, 2) },
  wallFaceChecks: selected.wallSpanResiduals.map((item) => ({ id: item.id, observedMm: item.measuredMm, predictedMm: round(item.predictedMm, 2), residualMm: round(item.residualMm, 2), landingFraction: round(item.landingFraction, 5), withinSegment: item.withinSegment })),
  candidateComparison: Object.fromEntries(["D0", "P1"].map((id) => [id, { distanceOnlyRobustCost: round(solutions[id].distanceOnlyRobustCost, 4), totalRobustCost: round(solutions[id].totalRobustCost, 4), parallelDifferenceDegrees: round(solutions[id].parallelDifferenceDegrees, 3), roomBRmsMm: round(solutions[id].roomBClearExactRmsMm, 3), wcRmsMm: round(solutions[id].wcClearExactRmsMm, 3) }])),
  wallBearingsDegrees: Object.fromEntries(Object.entries(selected.wallBearingsDegrees).map(([id, value]) => [id, round(value, 3)])),
  architecturalParallelPairDifferences: selected.reportedParallelDifferences.map((item) => ({ id: item.id, firstSegment: item.firstSegment, secondSegment: item.secondSegment, differenceDegrees: round(item.differenceDegrees, 3) })),
  maximumArchitecturalFamilyDeviationDegrees: round(selected.parallelDifferenceDegrees, 3),
  d3VisibleClosedFace: { observedMm: D3_FIELD.visibleClosedWidthMm, fittedMm: round(selected.d3B.visibleClosedWidthMm, 3), physicalLeafWidthMm: null, supersededInactiveMm: D3_FIELD.supersededVisibleFaceMm },
  coordinateMovementFromPreviousSelectedMm: Object.fromEntries(Object.entries(coordinateMovements).map(([id, item]) => [id, { deltaX: round(item.delta[0], 2), deltaY: round(item.delta[1], 2), magnitude: round(item.magnitudeMm, 2) }])),
  cornerAnglesDegrees: selected.angularResiduals.map((item) => ({ id: item.id, corner: item.corner, angleDegrees: round(item.predictedDegrees, 3) })),
  d5AssemblyGapMm: round(selected.d5AssemblyGapMm, 2),
  d5SharedPhysicalLeaf: serializeSharedD5(selected.sharedD5Assembly),
  roomBAreaM2: round(selected.roomBAreaM2, 4),
  wcAreaM2: round(selected.wcAreaM2, 4),
  plausibilityChecks,
};
fs.writeFileSync(path.join(outputDir, solverOutputName), `${JSON.stringify(solverOutput, null, 2)}\n`);
console.log(JSON.stringify(solverOutput, null, 2));

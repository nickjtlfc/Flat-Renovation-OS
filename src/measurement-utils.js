export function calculateMeasurement(start, end) {
  const dx = end.coordinateMm.x - start.coordinateMm.x;
  const dy = end.coordinateMm.y - start.coordinateMm.y;
  const verticalDifferenceMm = end.coordinateMm.elevation - start.coordinateMm.elevation;
  const horizontalDistanceMm = Math.hypot(dx, dy);
  return {
    horizontalDistanceMm,
    verticalDifferenceMm,
    trueDistanceMm: Math.hypot(horizontalDistanceMm, verticalDifferenceMm),
  };
}

export const formatMm = (value) => `${Math.round(value * 10) / 10} mm`;

export function calculateComparison(modelHorizontalMm, realWorldMm) {
  if (realWorldMm == null || realWorldMm === "" || !Number.isFinite(Number(realWorldMm))) return null;
  const value = Number(realWorldMm);
  const signedDifferenceMm = value - modelHorizontalMm;
  return {
    realWorldMm: value,
    signedDifferenceMm,
    absoluteDifferenceMm: Math.abs(signedDifferenceMm),
    differencePercent: modelHorizontalMm === 0 ? null : (signedDifferenceMm / modelHorizontalMm) * 100,
  };
}

export const endpointAllowedForMode = (mode, endpointKind) => mode === "mixed" || mode === endpointKind;
export const roomsVisible = (requiredRoomIds, activeRoomIds) => requiredRoomIds.every((roomId) => activeRoomIds.has(roomId));

export function pointerToNdc(clientX, clientY, rect) {
  return {
    x: ((clientX - rect.left) / rect.width) * 2 - 1,
    y: -((clientY - rect.top) / rect.height) * 2 + 1,
  };
}

export function objectVisibleInHierarchy(object) {
  let current = object;
  while (current) {
    if (current.visible === false) return false;
    current = current.parent;
  }
  return true;
}

function hasVisibleMaterial(object) {
  const materials = Array.isArray(object?.material) ? object.material : [object?.material];
  return materials.some((material) => material && material.visible !== false && (!material.transparent || material.opacity > 0));
}

export function isMeasurementSurface(object) {
  return Boolean(
    object?.isMesh
    && object.userData?.measurementSurface === true
    && objectVisibleInHierarchy(object)
    && hasVisibleMaterial(object),
  );
}

export function closestMeasurementSurfaceHit(intersections) {
  return intersections.find(({ object }) => isMeasurementSurface(object)) ?? null;
}

export function nearestValidationNode(coordinateMm, nodes, visibleRoomIds = null) {
  let nearest = null;
  for (const node of nodes) {
    if (visibleRoomIds && !visibleRoomIds.has(node.roomId)) continue;
    const dx = node.coordinateMm.x - coordinateMm.x;
    const dy = node.coordinateMm.y - coordinateMm.y;
    const dz = node.coordinateMm.elevation - coordinateMm.elevation;
    const distanceMm = Math.hypot(dx, dy, dz);
    if (!nearest || distanceMm < nearest.distanceMm) nearest = { node, distanceMm };
  }
  return nearest;
}

export function calculateFinishedFacePlacement(endpoints, visualThicknessMm, roomFacingSide) {
  const [start, end] = endpoints;
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) throw new Error("Cannot align a zero-length finished-face segment.");
  if (roomFacingSide !== "left" && roomFacingSide !== "right") throw new Error(`Unsupported room-facing side: ${roomFacingSide}.`);
  const leftNormal = { x: -dy / length, y: dx / length };
  const inwardNormal = roomFacingSide === "left" ? leftNormal : { x: -leftNormal.x, y: -leftNormal.y };
  const halfThicknessMm = visualThicknessMm / 2;
  return {
    inwardNormal,
    outwardNormal: { x: -inwardNormal.x, y: -inwardNormal.y },
    centreOffsetMm: { x: -inwardNormal.x * halfThicknessMm, y: -inwardNormal.y * halfThicknessMm },
    roomFacingPlaneOffsetMm: 0,
    oppositePlaneOffsetMm: visualThicknessMm,
  };
}

export function calculateInwardProjectionPlacement(endpoints, projectionMm, roomFacingSide) {
  const finishedFacePlacement = calculateFinishedFacePlacement(endpoints, projectionMm, roomFacingSide);
  return {
    inwardNormal: finishedFacePlacement.inwardNormal,
    outwardNormal: finishedFacePlacement.outwardNormal,
    centreOffsetMm: {
      x: finishedFacePlacement.inwardNormal.x * projectionMm / 2,
      y: finishedFacePlacement.inwardNormal.y * projectionMm / 2,
    },
    sourcePlaneOffsetMm: 0,
    roomFacingPlaneOffsetMm: projectionMm,
  };
}

export function roomFacingSideForDirectedSegment(referenceEndpoints, segmentEndpoints, referenceRoomFacingSide) {
  if (referenceRoomFacingSide !== "left" && referenceRoomFacingSide !== "right") throw new Error(`Unsupported room-facing side: ${referenceRoomFacingSide}.`);
  const [referenceStart, referenceEnd] = referenceEndpoints;
  const [segmentStart, segmentEnd] = segmentEndpoints;
  const directionDotProduct = (referenceEnd.x - referenceStart.x) * (segmentEnd.x - segmentStart.x)
    + (referenceEnd.y - referenceStart.y) * (segmentEnd.y - segmentStart.y);
  if (directionDotProduct === 0) throw new Error("Cannot orient a perpendicular or zero-length finished-face fragment from its reference segment.");
  if (directionDotProduct > 0) return referenceRoomFacingSide;
  return referenceRoomFacingSide === "left" ? "right" : "left";
}

export function endpointIdentity(endpoint) {
  if (endpoint.nodeId) return `Node ${endpoint.nodeId}`;
  if (endpoint.featureId) return `Feature ${endpoint.featureId}`;
  return "Free point on model geometry";
}

export function formatCoordinate(coordinateMm) {
  return `x ${coordinateMm.x.toFixed(1)}, y ${coordinateMm.y.toFixed(1)}, elevation ${coordinateMm.elevation.toFixed(1)} mm`;
}

export function buildValidationReport(measurements, sourceAuthority) {
  const lines = [
    "3D VALIDATION SESSION",
  ];

  if (!measurements.length) {
    lines.push("", "No virtual measurements recorded.");
    return lines.join("\n");
  }

  for (const measurement of measurements) {
    const comparison = calculateComparison(measurement.horizontalDistanceMm, measurement.realWorldMm);
    lines.push("", measurement.id);
    lines.push(`Start: ${conciseReportIdentity(measurement.start)}`);
    lines.push(`  ${measurement.start.description}`);
    lines.push(`End: ${conciseReportIdentity(measurement.end)}`);
    lines.push(`  ${measurement.end.description}`);
    lines.push("");
    lines.push(`Model horizontal: ${formatMm(measurement.horizontalDistanceMm)}`);
    lines.push(`Real world: ${comparison ? formatMm(comparison.realWorldMm) : "pending"}`);
    lines.push(`Difference (real - model): ${comparison ? signedMm(comparison.signedDifferenceMm) : "pending"}`);
    lines.push(`Field status: ${measurement.fieldStatus ?? (measurement.fieldCheck ? "required" : "virtual")}`);
    if (measurement.fieldId) lines.push(`Field ID: ${measurement.fieldId}`);
    lines.push("");
    lines.push("Technical traceability:");
    lines.push(`  Start identity: ${endpointIdentity(measurement.start)}`);
    if (measurement.start.nearestNodeId && measurement.start.nearestNodeId !== measurement.start.nodeId) lines.push(`  Start nearest node: ${measurement.start.nearestNodeId}`);
    lines.push(`  Start coordinate: ${formatCoordinate(measurement.start.coordinateMm)}`);
    lines.push(`  End identity: ${endpointIdentity(measurement.end)}`);
    if (measurement.end.nearestNodeId && measurement.end.nearestNodeId !== measurement.end.nodeId) lines.push(`  End nearest node: ${measurement.end.nearestNodeId}`);
    lines.push(`  End coordinate: ${formatCoordinate(measurement.end.coordinateMm)}`);
    lines.push(`  True 3D distance: ${formatMm(measurement.trueDistanceMm)}`);
    lines.push(`  Vertical difference: ${formatMm(measurement.verticalDifferenceMm)}`);
  }
  lines.push("", "MODEL AUTHORITY", `Source: ${sourceAuthority.horizontalGeometry}`, `Promoted geometry hash: ${sourceAuthority.promotedGeometrySha256}`, "Entered real-world readings are comparison evidence only and do not modify authoritative geometry.");
  return lines.join("\n");
}

const conciseReportIdentity = (endpoint) => endpoint.nodeId || endpoint.featureId || "Free point";
const signedMm = (value) => `${value >= 0 ? "+" : ""}${Math.round(value * 10) / 10} mm`;

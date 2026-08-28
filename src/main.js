import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  buildValidationReport,
  calculateComparison,
  calculateMeasurement,
  closestMeasurementSurfaceHit,
  endpointAllowedForMode,
  formatCoordinate,
  formatMm,
  isMeasurementSurface,
  nearestValidationNode,
  objectVisibleInHierarchy,
  pointerToNdc,
  roomFacingSideForDirectedSegment,
  roomsVisible,
} from "./measurement-utils.js";
import { applyFeatureMetadata, createSegmentBoxMesh } from "./segment-box-runtime.js";
import { createWindowWallMeshes } from "./window-wall-runtime.js";
import { createCp1LowerServiceGroup } from "./cp1-lower-service-runtime.js";
import "./styles.css";

const canvas = document.querySelector("#viewer");
const statusElement = document.querySelector("#model-status");
const errorElement = document.querySelector("#error");
const resetButton = document.querySelector("#reset-camera");
const ceilingToggle = document.querySelector("#toggle-ceilings");
const removableToggle = document.querySelector("#toggle-removable");
const roomFilterInputs = [...document.querySelectorAll("[data-room-filter]")];
const measurementModeInputs = [...document.querySelectorAll("[name='measurement-mode']")];
const snapToggle = document.querySelector("#toggle-snap");
const exactNodeSelect = document.querySelector("#exact-node-select");
const useExactNodeButton = document.querySelector("#use-exact-node");
const repoMeasurementsToggle = document.querySelector("#toggle-repo-measurements");
const repoMeasurementSummary = document.querySelector("#repo-measurement-summary");
const repoMeasurementItems = document.querySelector("#repo-measurement-items");
const measurementLabelsToggle = document.querySelector("#toggle-measurement-labels");
const allNodeLabelsToggle = document.querySelector("#toggle-all-node-labels");
const assumptionsToggle = document.querySelector("#toggle-assumptions");
const tapeButton = document.querySelector("#toggle-tape");
const tapeStatus = document.querySelector("#tape-status");
const assumptionPanel = document.querySelector("#assumption-panel");
const measurementList = document.querySelector("#measurement-list");
const clearMeasurementsButton = document.querySelector("#clear-measurements");
const copyReportButton = document.querySelector("#copy-report");
const copyStatus = document.querySelector("#copy-status");
const reportOutput = document.querySelector("#report-output");
const selectedMeasurementCard = document.querySelector("#selected-measurement");
const selectedIdElement = document.querySelector("#selected-id");
const selectedFieldIdElement = document.querySelector("#selected-field-id");
const selectedStartId = document.querySelector("#selected-start-id");
const selectedStartDescription = document.querySelector("#selected-start-description");
const selectedEndId = document.querySelector("#selected-end-id");
const selectedEndDescription = document.querySelector("#selected-end-description");
const selectedModelDistance = document.querySelector("#selected-model-distance");
const selectedRealWorld = document.querySelector("#selected-real-world");
const selectedDifference = document.querySelector("#selected-difference");
const selectedFieldStatus = document.querySelector("#selected-field-status");
const selectedAdvancedDetails = document.querySelector("#selected-advanced-details");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe9eef5);
scene.fog = new THREE.Fog(0xe9eef5, 16, 30);

const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 100);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.075;
controls.screenSpacePanning = true;
controls.minDistance = 2;
controls.maxDistance = 35;
controls.maxPolarAngle = Math.PI * 0.495;

scene.add(new THREE.HemisphereLight(0xffffff, 0x64748b, 2.1));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
keyLight.position.set(7, 14, 9);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -12;
keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 12;
keyLight.shadow.camera.bottom = -12;
scene.add(keyLight);

const palette = {
  walls: 0xf2eee6,
  wallEdges: 0x9c9488,
  ceilings: 0xfafafa,
  doors: 0x2f6f68,
  windows: 0x5ca9d6,
  frames: 0x285d7a,
  cupboards: 0xc58b46,
  trim: 0x996225,
  casing: 0xb77933,
  services: 0x2387a6,
  reveal: 0xd7c8b4,
  cupboardInterior: 0xe8d4b6,
  removable: 0x9b73c9,
  nodes: 0x8b2fc9,
  repositoryMeasurement: 0xe07a2f,
  virtualMeasurement: 0x00a7b5,
  fieldCheck: 0xd04a30,
  floor: {
    "ROOM-A": 0xe7d9ca,
    "ROOM-C": 0xd9e5f1,
    "ROOM-B": 0xd9eadf,
    WC: 0xd5ece9,
  },
};

const permanentGroup = new THREE.Group();
permanentGroup.name = "existing-permanent";
const removableGroup = new THREE.Group();
removableGroup.name = "existing-removable";
const ceilingGroup = new THREE.Group();
ceilingGroup.name = "ceilings";
ceilingGroup.visible = false;
const nodeGroup = new THREE.Group();
nodeGroup.name = "validation-nodes";
nodeGroup.visible = true;
const repositoryMeasurementGroup = new THREE.Group();
repositoryMeasurementGroup.name = "repository-field-observations";
repositoryMeasurementGroup.visible = true;
const repositoryMeasurementLabelGroup = new THREE.Group();
repositoryMeasurementLabelGroup.name = "repository-field-observation-labels";
repositoryMeasurementLabelGroup.visible = true;
const virtualMeasurementGroup = new THREE.Group();
virtualMeasurementGroup.name = "virtual-measurements";
scene.add(permanentGroup, removableGroup, ceilingGroup, nodeGroup, repositoryMeasurementGroup, repositoryMeasurementLabelGroup, virtualMeasurementGroup);

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let loadedModel = null;
let tapeEnabled = false;
let pendingEndpoint = null;
let pendingMarkerGroup = null;
let virtualMeasurementCounter = 0;
let fieldCheckCounter = 0;
let selectedMeasurement = null;
let hoveredNodeLabel = null;
const SNAP_RADIUS_MM = 75;
const activeRooms = new Set(["ROOM-C"]);
const virtualMeasurements = [];

const mm = (value) => value * 0.001;
const planShape = (points) => {
  const shape = new THREE.Shape();
  points.forEach((point, index) => {
    const x = mm(point.x);
    const y = -mm(point.y);
    if (index === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  });
  shape.closePath();
  return shape;
};

const setMetadata = applyFeatureMetadata;

function addEdges(mesh, color = palette.wallEdges, opacity = 0.55) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry, 22),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  edges.renderOrder = 2;
  edges.userData.measurementHelper = true;
  edges.raycast = () => {};
  mesh.add(edges);
}

function makeSegmentBox(feature, bottomMm, topMm, thicknessMm, color, opacity = 1) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.82,
    metalness: 0,
    transparent: opacity < 1,
    opacity,
  });
  const mesh = createSegmentBoxMesh(feature, bottomMm, topMm, thicknessMm, material);
  addEdges(mesh, feature.classification === "existing-removable" ? 0x6d4a96 : palette.wallEdges);
  return mesh;
}

const segmentLengthMm = ([a, b]) => Math.hypot(b.x - a.x, b.y - a.y);

const sourceToScene = ({ x, y, elevation = 0 }) => new THREE.Vector3(mm(x), mm(elevation), mm(y));
const sceneToSource = (vector) => ({ x: vector.x * 1000, y: vector.z * 1000, elevation: vector.y * 1000 });

function makeTextSprite(text, color = "#26384a", background = "rgba(255,255,255,0.92)", fontSize = 34) {
  const canvasElement = document.createElement("canvas");
  const context = canvasElement.getContext("2d");
  context.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
  const width = Math.ceil(context.measureText(text).width + 30);
  const height = fontSize + 22;
  canvasElement.width = width;
  canvasElement.height = height;
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.strokeRect(1, 1, width - 2, height - 2);
  context.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.fillText(text, 15, height / 2 + 1);
  const texture = new THREE.CanvasTexture(canvasElement);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  const scale = 0.0022;
  sprite.scale.set(width * scale, height * scale, 1);
  sprite.center.set(0.5, 0);
  sprite.renderOrder = 20;
  return sprite;
}

function makeLine(start, end, color, dashed = false) {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = dashed
    ? new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.07, depthTest: false })
    : new THREE.LineBasicMaterial({ color, depthTest: false });
  const line = new THREE.Line(geometry, material);
  if (dashed) line.computeLineDistances();
  line.renderOrder = 12;
  return line;
}

function describeFeature(object) {
  const id = object.userData.featureId || object.name || "model geometry";
  const room = object.userData.roomId ? `${object.userData.roomId.replace("ROOM-", "Room ")} ` : "";
  const sourcePair = object.userData.sourceFeatureIds?.length >= 2
    ? ` between ${object.userData.sourceFeatureIds[0]} and ${object.userData.sourceFeatureIds[1]}`
    : "";
  if (id.includes("WALL")) return `${room}permanent wall${sourcePair} — free surface point`;
  if (id.includes("CASING")) return `${room}${id} casing — free surface point`;
  if (id.includes("REVEAL")) return `${id} door reveal — free surface point`;
  if (id.includes("DOOR") || /^D\d/.test(id)) return `${id} door/opening feature — free surface point`;
  if (id.includes("W1") || id.includes("W2") || id.includes("WINDOW")) return `${id} window feature — free surface point`;
  if (id.includes("CP1") || id.includes("CP2")) return `${id} fixed cupboard feature — free surface point`;
  if (id.includes("FLOOR")) return `${room}finished-floor plane — free surface point`;
  if (id.includes("CEILING")) return `${room}temporary ceiling plane — free surface point`;
  if (id.includes("PARTITION")) return "Room C removable partition — free surface point";
  return `${room}${id} — free surface point`;
}

function makeNodeOverlay(node) {
  const group = new THREE.Group();
  group.name = node.id;
  group.userData = { roomId: node.roomId, validationNode: node };
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 14, 10),
    new THREE.MeshBasicMaterial({ color: node.classification === "existing-removable" ? palette.removable : palette.nodes, depthTest: false }),
  );
  marker.position.copy(sourceToScene(node.coordinateMm));
  marker.position.y += 0.025;
  marker.renderOrder = 18;
  marker.userData.validationNode = node;
  const label = makeTextSprite(node.id, "#5d2588");
  label.position.copy(sourceToScene(node.coordinateMm));
  label.position.y += 0.09;
  label.userData.validationNode = node;
  label.userData.isNodeLabel = true;
  label.visible = false;
  marker.userData.nodeLabel = label;
  group.add(marker, label);
  return group;
}

function makeRepositoryMeasurementOverlay(measurement) {
  const start = sourceToScene(measurement.endpoints[0]);
  const end = sourceToScene(measurement.endpoints[1]);
  start.y += 0.065;
  end.y += 0.065;
  const line = makeLine(start, end, palette.repositoryMeasurement, true);
  line.name = measurement.id;
  const nodeRooms = measurement.from && measurement.to
    ? [...new Set([measurement.from, measurement.to].map((id) => loadedModel.surveyValidation.nodes.find((node) => node.id === id)?.roomId).filter(Boolean))]
    : [];
  line.userData = { measurementId: measurement.id, category: measurement.category, roomIds: nodeRooms };
  repositoryMeasurementGroup.add(line);
  const label = makeTextSprite(`${measurement.id} · field ${formatMm(measurement.recordedMm)} · model ${formatMm(measurement.modelPlanDistanceMm)}`, "#a34d11", "rgba(255,248,238,0.94)", 28);
  label.position.copy(start).lerp(end, 0.5);
  label.position.y += 0.09;
  label.name = `${measurement.id}-LABEL`;
  label.userData = { measurementId: measurement.id, roomIds: nodeRooms };
  repositoryMeasurementLabelGroup.add(label);
}

function makeExtrudedVolume(feature, color, edgeColor = palette.trim) {
  const height = mm(feature.topMm - feature.baseMm);
  const geometry = new THREE.ExtrudeGeometry(planShape(feature.points), {
    depth: height,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = mm(feature.baseMm);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  setMetadata(mesh, feature);
  addEdges(mesh, feature.classification === "existing-removable" ? 0x6d4a96 : edgeColor);
  return mesh;
}

function makeWindow(feature, conventions) {
  const group = new THREE.Group();
  setMetadata(group, feature);
  const glass = makeSegmentBox(feature, feature.sillMm, feature.headMm, conventions.windowVisualThicknessMm, palette.windows, 0.48);
  glass.material.depthWrite = false;
  group.add(glass);

  const [a, b] = feature.endpoints;
  const rail = conventions.windowFrameRailMm;
  const horizontalRailFeature = { ...feature, id: `${feature.id}-FRAME-HORIZONTAL` };
  group.add(makeSegmentBox(horizontalRailFeature, feature.sillMm, feature.sillMm + rail, conventions.windowVisualThicknessMm * 1.8, palette.frames));
  group.add(makeSegmentBox(horizontalRailFeature, feature.headMm - rail, feature.headMm, conventions.windowVisualThicknessMm * 1.8, palette.frames));

  for (const [index, endpoint] of [a, b].entries()) {
    const post = {
      ...feature,
      id: `${feature.id}-FRAME-POST-${index + 1}`,
      endpoints: [
        { x: endpoint.x - rail / 2, y: endpoint.y },
        { x: endpoint.x + rail / 2, y: endpoint.y },
      ],
    };
    group.add(makeSegmentBox(post, feature.sillMm, feature.headMm, conventions.windowVisualThicknessMm * 1.8, palette.frames));
  }
  return group;
}

function makeDoorFace(feature, conventions) {
  const group = new THREE.Group();
  setMetadata(group, feature);
  const [outer0, outer1] = feature.outerEndpoints;
  const [clear0, clear1] = feature.clearEndpoints;
  const sideSegments = [[outer0, clear0], [outer1, clear1]];

  sideSegments.forEach((endpoints, index) => {
    if (segmentLengthMm(endpoints) < 0.1) return;
    const fill = {
      ...feature,
      ...feature.wallFaceMetadata,
      id: `${feature.id}-WALL-SIDE-${index + 1}`,
      endpoints,
      roomFacingSide: roomFacingSideForDirectedSegment(feature.clearEndpoints, endpoints, feature.wallFaceMetadata.roomFacingSide),
    };
    group.add(makeSegmentBox(fill, 0, feature.ceilingHeightMm, conventions.wallVisualThicknessMm, palette.walls));
  });

  group.add(makeSegmentBox(
    { ...feature, ...(feature.wallHeadFaceMetadata ?? feature.wallFaceMetadata), id: `${feature.id}-WALL-HEAD`, endpoints: feature.wallHeadEndpoints ?? feature.clearEndpoints },
    feature.openingHeightMm,
    feature.ceilingHeightMm,
    conventions.wallVisualThicknessMm,
    palette.walls,
  ));

  if (feature.casingTopMm != null) {
    const casingProjectionMm = feature.casingProjectionMm ?? conventions.doorCasingVisualDepthMm;
    sideSegments.forEach((endpoints, index) => {
      if (segmentLengthMm(endpoints) < 0.1) return;
      const casingSide = {
        ...feature,
        id: `${feature.id}-CASING-SIDE-${index + 1}`,
        endpoints,
        ...(feature.casingProjectionMm == null ? {} : {
          sourcePlaneBackAligned: true,
          roomFacingSide: roomFacingSideForDirectedSegment(feature.outerEndpoints, endpoints, feature.casingRoomFacingSide),
        }),
      };
      group.add(makeSegmentBox(casingSide, 0, feature.casingTopMm, casingProjectionMm, palette.casing));
    });
    group.add(makeSegmentBox(
      {
        ...feature,
        id: `${feature.id}-CASING-HEAD`,
        endpoints: feature.outerEndpoints,
        ...(feature.casingProjectionMm == null ? {} : {
          sourcePlaneBackAligned: true,
          roomFacingSide: feature.casingRoomFacingSide,
        }),
      },
      feature.openingHeightMm,
      feature.casingTopMm,
      casingProjectionMm,
      palette.casing,
    ));
  }
  return group;
}

function makeDoorReveal(feature, conventions) {
  const group = new THREE.Group();
  setMetadata(group, feature);
  for (let index = 0; index < 2; index += 1) {
    group.add(makeSegmentBox(
      { ...feature, id: `${feature.id}-JAMB-${index + 1}`, endpoints: [feature.faceA[index], feature.faceB[index]] },
      feature.bottomMm,
      feature.topMm,
      conventions.doorRevealVisualThicknessMm,
      palette.reveal,
    ));
  }
  const revealPlan = [feature.faceA[0], feature.faceA[1], feature.faceB[1], feature.faceB[0]];
  group.add(makeExtrudedVolume(
    { ...feature, id: `${feature.id}-HEAD`, points: revealPlan, baseMm: feature.topMm - conventions.doorRevealVisualThicknessMm, topMm: feature.topMm },
    palette.reveal,
    palette.wallEdges,
  ));
  group.add(makeExtrudedVolume(
    { ...feature, id: `${feature.id}-THRESHOLD`, points: revealPlan, baseMm: -conventions.floorVisualThicknessMm, topMm: 0 },
    0xc9bba9,
    palette.wallEdges,
  ));
  return group;
}

function makeCupboard(feature) {
  const group = new THREE.Group();
  setMetadata(group, feature);
  const [frontLeft, frontRight, backRight, backLeft] = feature.points;
  const panel = feature.panelThicknessMm;
  const panelFeatures = [
    { id: `${feature.id}-LEFT-PANEL`, endpoints: [frontLeft, backLeft] },
    { id: `${feature.id}-RIGHT-PANEL`, endpoints: [frontRight, backRight] },
    { id: `${feature.id}-BACK-PANEL`, endpoints: [backLeft, backRight] },
  ];
  panelFeatures.forEach((panelFeature) => {
    group.add(makeSegmentBox(
      { ...feature, ...panelFeature },
      feature.cavityBaseMm,
      feature.cavityTopMm,
      panel,
      palette.cupboardInterior,
    ));
  });
  group.add(makeExtrudedVolume(
    { ...feature, id: `${feature.id}-BASE-PANEL`, baseMm: feature.cavityBaseMm, topMm: feature.cavityBaseMm + panel },
    palette.cupboardInterior,
    palette.trim,
  ));
  group.add(makeExtrudedVolume(
    { ...feature, id: `${feature.id}-TOP-PANEL`, baseMm: feature.cavityTopMm - panel, topMm: feature.cavityTopMm },
    palette.cupboardInterior,
    palette.trim,
  ));
  if (feature.topCasingMm) {
    group.add(makeSegmentBox(
      { ...feature, id: `${feature.id}-TOP-CASING`, endpoints: [frontLeft, frontRight] },
      feature.cavityTopMm,
      feature.cavityTopMm + feature.topCasingMm,
      Math.max(panel * 2, 40),
      palette.trim,
    ));
  }
  if (feature.upperClosure) {
    group.add(makeExtrudedVolume(
      { ...feature, id: `${feature.id}-UPPER-CLOSURE`, baseMm: feature.upperClosure.baseMm, topMm: feature.upperClosure.topMm },
      palette.walls,
      palette.wallEdges,
    ));
  }
  return group;
}

function addGroundGrid(bounds) {
  const size = Math.ceil(Math.max(bounds.max.x - bounds.min.x, bounds.max.z - bounds.min.z) + 5);
  const grid = new THREE.GridHelper(size, size * 2, 0xaab5c2, 0xcbd3dc);
  grid.position.set((bounds.min.x + bounds.max.x) / 2, -0.022, (bounds.min.z + bounds.max.z) / 2);
  grid.material.transparent = true;
  grid.material.opacity = 0.32;
  scene.add(grid);
}

let initialCamera = null;
function frameModel() {
  const bounds = new THREE.Box3().setFromObject(permanentGroup);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.z);
  const target = new THREE.Vector3(center.x, Math.min(1.25, size.y * 0.42), center.z);
  const position = new THREE.Vector3(center.x + span * 0.9, Math.max(6.5, size.y + span * 0.55), center.z + span * 0.95);
  camera.position.copy(position);
  controls.target.copy(target);
  controls.update();
  initialCamera = { position: position.clone(), target: target.clone() };
  return bounds;
}

function resetCamera() {
  if (!initialCamera) return;
  camera.position.copy(initialCamera.position);
  controls.target.copy(initialCamera.target);
  controls.update();
}

const currentMeasurementMode = () => measurementModeInputs.find((input) => input.checked)?.value ?? "node";
const endpointName = (endpoint) => endpoint.nodeId || endpoint.featureId || "Free point";
const signedMm = (value) => `${value >= 0 ? "+" : ""}${Math.round(value * 10) / 10} mm`;

function updateNodeVisibility() {
  for (const nodeObject of nodeGroup.children) {
    nodeObject.visible = activeRooms.has(nodeObject.userData.roomId);
    const label = nodeObject.children.find((child) => child.userData.isNodeLabel);
    if (label) label.visible = allNodeLabelsToggle.checked && nodeObject.visible;
  }
  updateExactNodeOptions();
  updateRepositoryMeasurementVisibility();
}

function updateExactNodeOptions() {
  const previous = exactNodeSelect.value;
  exactNodeSelect.replaceChildren();
  const nodes = loadedModel?.surveyValidation.nodes.filter((node) => activeRooms.has(node.roomId)).sort((a, b) => a.id.localeCompare(b.id)) ?? [];
  for (const node of nodes) {
    const option = document.createElement("option");
    option.value = node.id;
    option.textContent = `${node.id} — ${node.description}`;
    exactNodeSelect.append(option);
  }
  if (nodes.some(({ id }) => id === previous)) exactNodeSelect.value = previous;
  useExactNodeButton.disabled = nodes.length === 0 || currentMeasurementMode() === "free";
}

function updateRepositoryMeasurementVisibility() {
  const showLabels = repoMeasurementsToggle.checked && measurementLabelsToggle.checked;
  repositoryMeasurementGroup.children.forEach((line) => {
    line.visible = repoMeasurementsToggle.checked && roomsVisible(line.userData.roomIds, activeRooms);
  });
  repositoryMeasurementLabelGroup.children.forEach((label) => {
    label.visible = showLabels && roomsVisible(label.userData.roomIds, activeRooms);
  });
  [...repoMeasurementItems.children].forEach((item) => {
    const rooms = item.dataset.rooms ? item.dataset.rooms.split(",") : [];
    item.hidden = !roomsVisible(rooms, activeRooms);
  });
}

function metadataOwner(object) {
  let current = object;
  while (current && current !== scene) {
    if (current.userData.featureId) return current;
    current = current.parent;
  }
  return object;
}

function endpointFromPointer(event) {
  const rect = canvas.getBoundingClientRect();
  const ndc = pointerToNdc(event.clientX, event.clientY, rect);
  pointer.set(ndc.x, ndc.y);
  raycaster.setFromCamera(pointer, camera);

  const mode = currentMeasurementMode();
  if (endpointAllowedForMode(mode, "node")) {
    const nodeHit = raycaster.intersectObjects(nodeGroup.children, true)
      .find((hit) => hit.object.userData.validationNode && objectVisibleInHierarchy(hit.object));
    if (nodeHit) {
      const node = nodeHit.object.userData.validationNode;
      return {
        nodeId: node.id,
        featureId: null,
        nearestNodeId: node.id,
        description: `${node.id} — ${node.description}`,
        coordinateMm: { ...node.coordinateMm },
        selection: "known-node-marker",
        snapped: false,
      };
    }
  }

  if (!endpointAllowedForMode(mode, "free")) return { error: "Node-to-node mode requires a visible node marker or the exact-node selector." };

  const raycastGroups = [permanentGroup];
  if (removableGroup.visible) raycastGroups.push(removableGroup);
  if (ceilingGroup.visible) raycastGroups.push(ceilingGroup);
  const measurementSurfaces = [];
  raycastGroups.forEach((group) => group.traverseVisible((object) => {
    if (isMeasurementSurface(object)) measurementSurfaces.push(object);
  }));
  const hit = closestMeasurementSurfaceHit(raycaster.intersectObjects(measurementSurfaces, false));
  if (!hit) return { error: "No visible model surface was hit." };
  const hitCoordinate = sceneToSource(hit.point);
  const nearest = nearestValidationNode(hitCoordinate, loadedModel.surveyValidation.nodes, activeRooms);
  const owner = metadataOwner(hit.object);
  if (mode === "mixed" && snapToggle.checked && nearest && nearest.distanceMm <= SNAP_RADIUS_MM && activeRooms.has(nearest.node.roomId)) {
    return {
      nodeId: nearest.node.id,
      featureId: owner.userData.featureId || null,
      nearestNodeId: nearest.node.id,
      description: `${nearest.node.id} — ${nearest.node.description}`,
      coordinateMm: { ...nearest.node.coordinateMm },
      selection: "snapped-known-node",
      snapped: true,
      snapDistanceMm: nearest.distanceMm,
      raycastDistanceMm: hit.distance * 1000,
      hitWorldPositionM: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
    };
  }
  const nearestDetail = nearest
    ? ` Nearest node: ${nearest.node.id}; plan offset ${Math.hypot(nearest.node.coordinateMm.x - hitCoordinate.x, nearest.node.coordinateMm.y - hitCoordinate.y).toFixed(1)} mm; elevation ${hitCoordinate.elevation.toFixed(1)} mm.`
    : ` Elevation ${hitCoordinate.elevation.toFixed(1)} mm.`;
  return {
    nodeId: null,
    featureId: owner.userData.featureId || owner.name || null,
    nearestNodeId: nearest?.node.id ?? null,
    description: `${describeFeature(owner)}.${nearestDetail}`,
    coordinateMm: hitCoordinate,
    selection: "model-surface-hit",
    snapped: false,
    raycastDistanceMm: hit.distance * 1000,
    hitWorldPositionM: { x: hit.point.x, y: hit.point.y, z: hit.point.z },
    authoritativeFinishedFaceAligned: owner.userData.authoritativeFinishedFaceAligned,
    sourceDatumMeaning: owner.userData.sourceDatumMeaning,
    roomFacingSide: owner.userData.roomFacingSide,
    visualThicknessMm: owner.userData.visualThicknessMm,
    roomFacingPlaneOffsetMm: owner.userData.roomFacingPlaneOffsetMm,
  };
}

function makeTapeEndpointMarker(endpoint, labelText, color) {
  const group = new THREE.Group();
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 16, 12),
    new THREE.MeshBasicMaterial({ color, depthTest: false }),
  );
  marker.position.copy(sourceToScene(endpoint.coordinateMm));
  marker.renderOrder = 19;
  const label = makeTextSprite(labelText, color === palette.fieldCheck ? "#a72817" : "#006f78", "rgba(240,255,255,0.94)", 28);
  label.position.copy(marker.position);
  label.position.y += 0.08;
  label.userData.isEndpointLabel = true;
  label.visible = true;
  group.add(marker, label);
  return group;
}

function makeVirtualMeasurementScene(measurement) {
  const group = new THREE.Group();
  group.name = measurement.id;
  const start = sourceToScene(measurement.start.coordinateMm);
  const end = sourceToScene(measurement.end.coordinateMm);
  const line = makeLine(start, end, palette.virtualMeasurement);
  line.userData.measurementLine = true;
  group.add(line);
  group.add(makeTapeEndpointMarker(measurement.start, `${measurement.id} START · ${endpointName(measurement.start)}`, palette.virtualMeasurement));
  group.add(makeTapeEndpointMarker(measurement.end, `${measurement.id} END · ${endpointName(measurement.end)}`, palette.virtualMeasurement));
  const distanceLabel = makeTextSprite(`${measurement.id} · H ${formatMm(measurement.horizontalDistanceMm)} · 3D ${formatMm(measurement.trueDistanceMm)}`, "#006f78", "rgba(237,253,255,0.95)", 28);
  distanceLabel.position.copy(start).lerp(end, 0.5);
  distanceLabel.position.y += 0.1;
  distanceLabel.userData.isMeasurementLabel = true;
  distanceLabel.visible = measurementLabelsToggle.checked;
  group.add(distanceLabel);
  virtualMeasurementGroup.add(group);
  return group;
}

function setMeasurementColor(measurement) {
  const color = measurement.fieldStatus === "investigate" ? palette.fieldCheck : palette.virtualMeasurement;
  measurement.sceneGroup.traverse((child) => {
    if (child.isLine || child.isMesh) child.material?.color?.setHex(color);
  });
}

function conciseEndpoint(endpoint) {
  return endpoint.nodeId || endpoint.featureId || "free point";
}

function updateReportOutput(measurements = virtualMeasurements) {
  if (!loadedModel) return;
  reportOutput.value = buildValidationReport(measurements, loadedModel.sourceAuthority);
}

function selectMeasurement(measurement) {
  selectedMeasurement = measurement;
  selectedMeasurementCard.hidden = !measurement;
  if (!measurement) {
    renderMeasurementList();
    return;
  }
  selectedIdElement.textContent = measurement.id;
  selectedFieldIdElement.textContent = measurement.fieldId ?? "";
  selectedStartId.textContent = endpointName(measurement.start);
  selectedStartDescription.textContent = measurement.start.description;
  selectedEndId.textContent = endpointName(measurement.end);
  selectedEndDescription.textContent = measurement.end.description;
  selectedModelDistance.textContent = formatMm(measurement.horizontalDistanceMm);
  selectedRealWorld.value = measurement.realWorldMm ?? "";
  selectedFieldStatus.value = measurement.fieldStatus;
  selectedAdvancedDetails.replaceChildren();
  const advancedRows = [
    ["True 3D", formatMm(measurement.trueDistanceMm)],
    ["Vertical difference", signedMm(measurement.verticalDifferenceMm)],
    ["Start selection", measurement.start.selection],
    ["Start coordinate", formatCoordinate(measurement.start.coordinateMm)],
    ["End selection", measurement.end.selection],
    ["End coordinate", formatCoordinate(measurement.end.coordinateMm)],
  ];
  for (const [label, endpoint] of [["Start", measurement.start], ["End", measurement.end]]) {
    if (endpoint.featureId) advancedRows.push([`${label} hit feature`, endpoint.featureId]);
    if (endpoint.authoritativeFinishedFaceAligned != null) {
      advancedRows.push([`${label} authoritative finished-face aligned`, endpoint.authoritativeFinishedFaceAligned ? "yes" : "no"]);
    }
    if (endpoint.sourceDatumMeaning) advancedRows.push([`${label} source datum`, endpoint.sourceDatumMeaning]);
    if (endpoint.roomFacingSide) advancedRows.push([`${label} room-facing side`, endpoint.roomFacingSide]);
    if (endpoint.visualThicknessMm != null) advancedRows.push([`${label} visual thickness`, formatMm(endpoint.visualThicknessMm)]);
    if (endpoint.roomFacingPlaneOffsetMm != null) advancedRows.push([`${label} room-face/source offset`, formatMm(endpoint.roomFacingPlaneOffsetMm)]);
    if (endpoint.raycastDistanceMm != null) advancedRows.push([`${label} camera ray`, formatMm(endpoint.raycastDistanceMm)]);
    if (endpoint.hitWorldPositionM) advancedRows.push([`${label} world hit`, `x ${endpoint.hitWorldPositionM.x.toFixed(4)}, y ${endpoint.hitWorldPositionM.y.toFixed(4)}, z ${endpoint.hitWorldPositionM.z.toFixed(4)} m`]);
    if (endpoint.snapDistanceMm != null) advancedRows.push([`${label} snap distance`, formatMm(endpoint.snapDistanceMm)]);
  }
  advancedRows.forEach(([term, definition]) => {
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = definition;
    selectedAdvancedDetails.append(dt, dd);
  });
  updateSelectedDifference();
  renderMeasurementList();
}

function updateSelectedDifference() {
  if (!selectedMeasurement) return;
  const comparison = calculateComparison(selectedMeasurement.horizontalDistanceMm, selectedMeasurement.realWorldMm);
  selectedDifference.className = "difference-result";
  if (!comparison) {
    selectedDifference.classList.add("pending");
    selectedDifference.textContent = "Difference pending";
    return;
  }
  selectedDifference.classList.add(selectedMeasurement.fieldStatus === "investigate" ? "investigate" : "complete");
  selectedDifference.textContent = `${signedMm(comparison.signedDifferenceMm)} real − model · absolute ${formatMm(comparison.absoluteDifferenceMm)}`;
}

function assignFieldIdentity(measurement) {
  if (measurement.fieldStatus === "virtual") {
    measurement.fieldId = null;
    return;
  }
  measurement.fieldId ||= `FIELD-${String(++fieldCheckCounter).padStart(3, "0")}`;
}

function renderMeasurementList() {
  measurementList.replaceChildren();
  if (!virtualMeasurements.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No virtual measurements yet.";
    measurementList.append(empty);
  }
  for (const measurement of virtualMeasurements) {
    const card = document.createElement("article");
    card.className = `measurement-card${measurement.visible ? "" : " is-hidden"}${measurement === selectedMeasurement ? " is-selected" : ""}`;
    card.addEventListener("click", () => selectMeasurement(measurement));
    const row = document.createElement("div");
    row.className = "measurement-row";
    const title = document.createElement("strong");
    title.textContent = measurement.id;
    row.append(title);
    if (measurement.fieldId) {
      const fieldId = document.createElement("span");
      fieldId.className = "field-id";
      fieldId.textContent = measurement.fieldId;
      row.append(fieldId);
    }
    const route = document.createElement("p");
    route.className = "measurement-route";
    route.textContent = `${conciseEndpoint(measurement.start)} → ${conciseEndpoint(measurement.end)}`;
    route.title = `${measurement.start.description} → ${measurement.end.description}`;
    const values = document.createElement("p");
    values.className = "measurement-values";
    values.textContent = `Model horizontal ${formatMm(measurement.horizontalDistanceMm)}`;
    const comparison = calculateComparison(measurement.horizontalDistanceMm, measurement.realWorldMm);
    const difference = document.createElement("p");
    difference.className = "measurement-difference";
    difference.textContent = comparison ? `Real ${formatMm(comparison.realWorldMm)} · difference ${signedMm(comparison.signedDifferenceMm)}` : "Real-world reading pending";
    const actions = document.createElement("div");
    actions.className = "measurement-actions";
    const showLabel = document.createElement("label");
    const showInput = document.createElement("input");
    showInput.type = "checkbox";
    showInput.checked = measurement.visible;
    showInput.addEventListener("change", (event) => {
      event.stopPropagation();
      measurement.visible = showInput.checked;
      measurement.sceneGroup.visible = measurement.visible;
      renderMeasurementList();
    });
    showInput.addEventListener("click", (event) => event.stopPropagation());
    showLabel.append(showInput, "Show");
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.textContent = "Open";
    openButton.addEventListener("click", (event) => { event.stopPropagation(); selectMeasurement(measurement); });
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();
      virtualMeasurementGroup.remove(measurement.sceneGroup);
      virtualMeasurements.splice(virtualMeasurements.indexOf(measurement), 1);
      if (selectedMeasurement === measurement) selectMeasurement(virtualMeasurements.at(-1) ?? null);
      updateReportOutput();
      renderMeasurementList();
    });
    actions.append(showLabel, openButton, deleteButton);
    card.append(row, route, values, difference, actions);
    measurementList.append(card);
  }
  clearMeasurementsButton.disabled = virtualMeasurements.length === 0;
}

function createVirtualMeasurement(start, end) {
  const id = `VM-${String(++virtualMeasurementCounter).padStart(3, "0")}`;
  const measurement = {
    id,
    start,
    end,
    ...calculateMeasurement(start, end),
    visible: true,
    fieldStatus: "virtual",
    fieldId: null,
    realWorldMm: null,
  };
  measurement.sceneGroup = makeVirtualMeasurementScene(measurement);
  virtualMeasurements.push(measurement);
  selectMeasurement(measurement);
  updateReportOutput();
  renderMeasurementList();
  return measurement;
}

function handleTapePoint(endpoint) {
  if (!pendingEndpoint) {
    pendingEndpoint = endpoint;
    pendingMarkerGroup = makeTapeEndpointMarker(endpoint, `PENDING START · ${endpointName(endpoint)}`, palette.virtualMeasurement);
    virtualMeasurementGroup.add(pendingMarkerGroup);
    tapeStatus.textContent = `START: ${endpointName(endpoint)}${endpoint.snapped ? " (snapped)" : ""}. Select the END point.`;
    tapeStatus.classList.add("active");
    return;
  }
  if (pendingMarkerGroup) virtualMeasurementGroup.remove(pendingMarkerGroup);
  pendingMarkerGroup = null;
  const measurement = createVirtualMeasurement(pendingEndpoint, endpoint);
  pendingEndpoint = null;
  tapeStatus.textContent = `${measurement.id} saved. MODEL horizontal: ${formatMm(measurement.horizontalDistanceMm)}. Enter the real-world reading below or select another START.`;
}

async function loadModel() {
  const response = await fetch("/generated/flat-shell-v0_1.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Could not load generated shell data (${response.status}).`);
  const model = await response.json();
  loadedModel = model;
  const conventions = model.renderConventions;

  model.rooms.forEach((room) => {
    permanentGroup.add(makeExtrudedVolume(
      { ...room, id: `${room.id}-FLOOR`, baseMm: -conventions.floorVisualThicknessMm, topMm: 0 },
      palette.floor[room.id] ?? 0xe3e5e8,
      palette.wallEdges,
    ));
    const ceiling = makeExtrudedVolume(
      { ...room, id: `${room.id}-CEILING`, baseMm: room.ceilingHeightMm, topMm: room.ceilingHeightMm + conventions.ceilingVisualThicknessMm },
      palette.ceilings,
      palette.wallEdges,
    );
    ceilingGroup.add(ceiling);
  });

  model.roomExtensions.forEach((extension) => {
    permanentGroup.add(makeExtrudedVolume(
      { ...extension, id: `${extension.id}-FLOOR`, baseMm: -conventions.floorVisualThicknessMm, topMm: 0 },
      palette.floor[extension.roomId] ?? 0xe3e5e8,
      palette.wallEdges,
    ));
    ceilingGroup.add(makeExtrudedVolume(
      { ...extension, id: `${extension.id}-CEILING`, baseMm: extension.ceilingHeightMm, topMm: extension.ceilingHeightMm + conventions.ceilingVisualThicknessMm },
      palette.ceilings,
      palette.wallEdges,
    ));
  });

  model.walls.forEach((wall) => {
    permanentGroup.add(makeSegmentBox(wall, wall.bottomMm, wall.topMm, conventions.wallVisualThicknessMm, palette.walls));
  });

  model.doorFaces.forEach((doorFace) => permanentGroup.add(makeDoorFace(doorFace, conventions)));
  model.doorReveals.forEach((doorReveal) => permanentGroup.add(makeDoorReveal(doorReveal, conventions)));

  model.windows.forEach((windowFeature) => {
    permanentGroup.add(makeWindow(windowFeature, conventions));
  });

  const windowWallMaterial = new THREE.MeshStandardMaterial({ color: palette.walls, roughness: 0.82, metalness: 0 });
  createWindowWallMeshes(model, conventions, windowWallMaterial).forEach((mesh) => {
    addEdges(mesh, palette.wallEdges);
    permanentGroup.add(mesh);
  });

  model.doorLeaves.forEach((door) => {
    permanentGroup.add(makeSegmentBox(door, door.bottomMm, door.heightMm, conventions.doorLeafVisualThicknessMm, palette.doors));
  });

  model.cupboards.forEach((cupboard) => permanentGroup.add(makeCupboard(cupboard)));

  if (model.cp1LowerServiceAssembly) {
    const material = (color, roughness = 0.76) => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0 });
    const cp1LowerGroup = createCp1LowerServiceGroup(model.cp1LowerServiceAssembly, {
      panel: material(palette.cupboardInterior),
      casing: material(palette.casing),
      door: material(palette.cupboards),
      lip: material(palette.trim),
      service: material(palette.services, 0.52),
    });
    cp1LowerGroup.traverse((object) => {
      if (object.isMesh) addEdges(object, object.userData.componentClass === "existing-service-reference" ? palette.services : palette.trim);
    });
    permanentGroup.add(cp1LowerGroup);
  }

  model.volumes.forEach((volume) => {
    const target = volume.classification === "existing-removable" ? removableGroup : permanentGroup;
    const color = volume.classification === "existing-removable"
      ? palette.removable
      : volume.id.includes("TRIM") ? palette.trim : palette.cupboards;
    target.add(makeExtrudedVolume(volume, color));
  });

  model.surveyValidation.nodes.forEach((node) => nodeGroup.add(makeNodeOverlay(node)));
  model.surveyValidation.repositoryMeasurements.forEach(makeRepositoryMeasurementOverlay);
  updateNodeVisibility();
  model.surveyValidation.repositoryMeasurements.forEach((measurement) => {
    const item = document.createElement("p");
    item.textContent = `${measurement.id}: ${measurement.from} → ${measurement.to} · field ${formatMm(measurement.recordedMm)} · ${measurement.status}`;
    item.title = measurement.source;
    item.dataset.rooms = [...new Set([measurement.from, measurement.to].map((id) => model.surveyValidation.nodes.find((node) => node.id === id)?.roomId).filter(Boolean))].join(",");
    repoMeasurementItems.append(item);
  });
  updateRepositoryMeasurementVisibility();

  const assumptionList = document.createElement("ul");
  model.surveyValidation.assumptions.forEach((assumption) => {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = `${assumption.label}: `;
    item.append(title, assumption.detail);
    assumptionList.append(item);
  });
  assumptionPanel.replaceChildren(assumptionList);
  updateReportOutput();
  renderMeasurementList();

  const bounds = frameModel();
  addGroundGrid(bounds);
  statusElement.textContent = `${model.rooms.length} rooms · ${model.walls.length} wall runs · ${model.surveyValidation.nodes.length} validation nodes · ${model.surveyValidation.repositoryMeasurements.length} field observations`;
  document.title = `Flat Renovation OS · ${model.status}`;
}

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

function animate() {
  requestAnimationFrame(animate);
  resize();
  controls.update();
  renderer.render(scene, camera);
}

resetButton.addEventListener("click", resetCamera);
ceilingToggle.addEventListener("change", () => { ceilingGroup.visible = ceilingToggle.checked; });
removableToggle.addEventListener("change", () => { removableGroup.visible = removableToggle.checked; });
roomFilterInputs.forEach((input) => input.addEventListener("change", () => {
  if (input.checked) activeRooms.add(input.dataset.roomFilter);
  else activeRooms.delete(input.dataset.roomFilter);
  updateNodeVisibility();
}));
measurementModeInputs.forEach((input) => input.addEventListener("change", () => {
  pendingEndpoint = null;
  if (pendingMarkerGroup) virtualMeasurementGroup.remove(pendingMarkerGroup);
  pendingMarkerGroup = null;
  updateExactNodeOptions();
  const modeLabels = { node: "Node → node: click visible markers or use the exact-node selector.", free: "Free → free: clicks retain exact surface hit points; node snapping is not applied.", mixed: `Mixed: click markers or surfaces. Surface hits snap only when enabled and within ${SNAP_RADIUS_MM} mm.` };
  tapeStatus.textContent = modeLabels[currentMeasurementMode()];
}));
allNodeLabelsToggle.addEventListener("change", updateNodeVisibility);
repoMeasurementsToggle.addEventListener("change", () => {
  repoMeasurementSummary.hidden = !repoMeasurementsToggle.checked;
  updateRepositoryMeasurementVisibility();
});
measurementLabelsToggle.addEventListener("change", () => {
  updateRepositoryMeasurementVisibility();
  virtualMeasurementGroup.traverse((child) => {
    if (child.userData.isMeasurementLabel) child.visible = measurementLabelsToggle.checked;
  });
});
assumptionsToggle.addEventListener("change", () => { assumptionPanel.hidden = !assumptionsToggle.checked; });
useExactNodeButton.addEventListener("click", () => {
  const node = loadedModel?.surveyValidation.nodes.find(({ id }) => id === exactNodeSelect.value);
  if (!node) return;
  if (!tapeEnabled) {
    tapeStatus.textContent = "Start measuring first, then use the exact-node selector.";
    return;
  }
  handleTapePoint({ nodeId: node.id, featureId: null, nearestNodeId: node.id, description: `${node.id} — ${node.description}`, coordinateMm: { ...node.coordinateMm }, selection: "exact-node-selector", snapped: false });
});
tapeButton.addEventListener("click", () => {
  tapeEnabled = !tapeEnabled;
  pendingEndpoint = null;
  if (pendingMarkerGroup) virtualMeasurementGroup.remove(pendingMarkerGroup);
  pendingMarkerGroup = null;
  tapeButton.setAttribute("aria-pressed", String(tapeEnabled));
  tapeButton.textContent = tapeEnabled ? "Stop measuring" : "Start measuring";
  canvas.style.cursor = tapeEnabled ? "crosshair" : "grab";
  tapeStatus.classList.toggle("active", tapeEnabled);
  tapeStatus.textContent = tapeEnabled ? `Tape active in ${currentMeasurementMode().replace("node", "node-to-node")} mode. Select the START point.` : "Choose a mode, then start measuring.";
});

let pointerDownPosition = null;
canvas.addEventListener("pointerdown", (event) => { pointerDownPosition = { x: event.clientX, y: event.clientY }; });
canvas.addEventListener("pointerup", (event) => {
  if (!tapeEnabled || !loadedModel || !pointerDownPosition) return;
  const movement = Math.hypot(event.clientX - pointerDownPosition.x, event.clientY - pointerDownPosition.y);
  pointerDownPosition = null;
  if (movement > 5) return;
  const endpoint = endpointFromPointer(event);
  if (!endpoint || endpoint.error) {
    tapeStatus.textContent = endpoint?.error ?? "No visible model geometry was hit.";
    return;
  }
  handleTapePoint(endpoint);
});

canvas.addEventListener("pointermove", (event) => {
  if (!loadedModel || allNodeLabelsToggle.checked) return;
  const rect = canvas.getBoundingClientRect();
  const ndc = pointerToNdc(event.clientX, event.clientY, rect);
  pointer.set(ndc.x, ndc.y);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(nodeGroup.children, true).find((candidate) => candidate.object.userData.validationNode);
  const nextLabel = hit?.object.userData.nodeLabel ?? hit?.object.parent?.children.find((child) => child.userData.isNodeLabel) ?? null;
  if (hoveredNodeLabel && hoveredNodeLabel !== nextLabel) hoveredNodeLabel.visible = false;
  hoveredNodeLabel = nextLabel;
  if (hoveredNodeLabel) hoveredNodeLabel.visible = true;
});
canvas.addEventListener("pointerleave", () => {
  if (hoveredNodeLabel && !allNodeLabelsToggle.checked) hoveredNodeLabel.visible = false;
  hoveredNodeLabel = null;
});

selectedRealWorld.addEventListener("input", () => {
  if (!selectedMeasurement) return;
  selectedMeasurement.realWorldMm = selectedRealWorld.value === "" ? null : Number(selectedRealWorld.value);
  if (selectedMeasurement.realWorldMm == null && selectedMeasurement.fieldStatus === "completed") {
    selectedMeasurement.fieldStatus = "required";
    selectedFieldStatus.value = "required";
  }
  updateSelectedDifference();
  updateReportOutput();
  renderMeasurementList();
});
selectedFieldStatus.addEventListener("change", () => {
  if (!selectedMeasurement) return;
  if (selectedFieldStatus.value === "completed" && selectedMeasurement.realWorldMm == null) {
    selectedFieldStatus.value = "required";
    tapeStatus.textContent = "Enter the real-world reading before marking this field check completed.";
  }
  selectedMeasurement.fieldStatus = selectedFieldStatus.value;
  assignFieldIdentity(selectedMeasurement);
  setMeasurementColor(selectedMeasurement);
  selectMeasurement(selectedMeasurement);
  updateReportOutput();
});

clearMeasurementsButton.addEventListener("click", () => {
  virtualMeasurements.splice(0);
  virtualMeasurementGroup.clear();
  pendingEndpoint = null;
  pendingMarkerGroup = null;
  selectMeasurement(null);
  updateReportOutput();
  renderMeasurementList();
  tapeStatus.textContent = tapeEnabled ? "Measurements cleared. Select a new START point." : "Choose a mode, then start measuring.";
});

copyReportButton.addEventListener("click", async () => {
  updateReportOutput();
  try {
    await navigator.clipboard.writeText(reportOutput.value);
    copyStatus.textContent = "Copied";
  } catch {
    reportOutput.closest("details").open = true;
    reportOutput.focus();
    reportOutput.select();
    copyStatus.textContent = "Select/copy the report below";
  }
  window.setTimeout(() => { copyStatus.textContent = ""; }, 2500);
});

loadModel().catch((error) => {
  console.error(error);
  statusElement.textContent = "Load failed";
  errorElement.hidden = false;
  errorElement.textContent = error.message;
});
animate();

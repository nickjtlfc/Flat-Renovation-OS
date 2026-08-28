import * as THREE from "three";
import { applyFeatureMetadata, createSegmentBoxMesh } from "./segment-box-runtime.js";

const mm = (value) => value * 0.001;

export function createCp1LowerServiceGroup(assembly, materials) {
  const group = new THREE.Group();
  applyFeatureMetadata(group, assembly);

  const sharedPanelMetadata = {
    roomId: assembly.roomId,
    classification: assembly.classification,
    sourceFeatureIds: assembly.sourceFeatureIds,
    componentClass: assembly.componentClass,
    depthMm: assembly.panel.depthMm,
    roomFacingSide: assembly.panel.roomFacingSide,
    frontFaceAligned: assembly.panel.frontFaceAligned,
    sourceDatumMeaning: "promoted CP1-FL to PO1 frontage reference",
    visualThicknessMm: assembly.panel.depthMm,
  };
  assembly.panel.fragments.forEach((fragment) => group.add(createSegmentBoxMesh(
    { ...sharedPanelMetadata, ...fragment },
    fragment.bottomMm,
    fragment.topMm,
    assembly.panel.depthMm,
    materials.panel,
  )));

  const accessMetadata = {
    roomId: assembly.roomId,
    classification: assembly.classification,
    sourceFeatureIds: assembly.sourceFeatureIds,
    componentClass: "existing-access-joinery",
    depthMm: assembly.accessDoor.depthMm,
    roomFacingSide: assembly.accessDoor.roomFacingSide,
    frontFaceAligned: assembly.accessDoor.frontFaceAligned,
    sourceDatumMeaning: "field-positioned CP1 lower access assembly on promoted frontage",
    visualThicknessMm: assembly.accessDoor.depthMm,
  };
  assembly.accessDoor.casings.forEach((casing) => group.add(createSegmentBoxMesh(
    { ...accessMetadata, ...casing },
    assembly.accessDoor.bottomMm,
    assembly.accessDoor.topMm,
    assembly.accessDoor.depthMm,
    materials.casing,
  )));
  group.add(createSegmentBoxMesh(
    { ...accessMetadata, ...assembly.accessDoor.leaf, closed: assembly.accessDoor.closed },
    assembly.accessDoor.bottomMm,
    assembly.accessDoor.topMm,
    assembly.accessDoor.depthMm,
    materials.door,
  ));

  group.add(createSegmentBoxMesh(
    {
      ...assembly.lip,
      roomId: assembly.roomId,
      classification: assembly.classification,
      sourceFeatureIds: assembly.sourceFeatureIds,
      componentClass: "existing-projecting-joinery",
      sourceDatumMeaning: "CP1 lower enclosure frontage back plane",
      visualThicknessMm: assembly.lip.projectionMm,
    },
    assembly.lip.bottomMm,
    assembly.lip.topMm,
    assembly.lip.projectionMm,
    materials.lip,
  ));

  const service = assembly.waterInletReference;
  const heightM = mm(service.topMm - service.bottomMm);
  const pipe = new THREE.Mesh(
    new THREE.CylinderGeometry(mm(service.visualDiameterMm) / 2, mm(service.visualDiameterMm) / 2, heightM, 12),
    materials.service,
  );
  pipe.position.set(mm(service.coordinate.x), mm((service.bottomMm + service.topMm) / 2), mm(service.coordinate.y));
  pipe.castShadow = true;
  pipe.receiveShadow = true;
  applyFeatureMetadata(pipe, {
    ...service,
    roomId: assembly.roomId,
    classification: assembly.classification,
    sourceFeatureIds: assembly.sourceFeatureIds,
    componentClass: "existing-service-reference",
  });
  group.add(pipe);
  return group;
}

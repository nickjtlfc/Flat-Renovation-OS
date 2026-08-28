#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const outDir=path.join(root,'docs','survey','derived','global-reconciliation');
const globalPath=path.join(outDir,'WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_3.json');
const localPath=path.join(root,'docs','survey','derived','room-b-wc','ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3.json');
const global=JSON.parse(fs.readFileSync(globalPath,'utf8'));
const local=JSON.parse(fs.readFileSync(localPath,'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const round=(n,d=4)=>Number(n.toFixed(d));
const arr=p=>[p.x,p.y],rec=([x,y])=>({x:round(x),y:round(y)});
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mul=(a,s)=>[a[0]*s,a[1]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],cross=(a,b)=>a[0]*b[1]-a[1]*b[0],len=a=>Math.hypot(...a),distance=(a,b)=>len(sub(a,b));
const midpoint=(a,b)=>mul(add(a,b),.5),unit=a=>mul(a,1/len(a));
const lineIntersection=(p,r,q,s)=>{const den=cross(r,s);if(Math.abs(den)<1e-10)throw new Error('Parallel lines');return add(p,mul(r,cross(sub(q,p),s)/den));};
const shaJson=o=>crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex').toUpperCase();

const rotation=global.registration.requiredRotationDegrees*Math.PI/180,cs=Math.cos(rotation),sn=Math.sin(rotation);
const translation=[global.registration.requiredTranslationMm.x,global.registration.requiredTranslationMm.y];
const rotate=([x,y])=>[cs*x-sn*y,sn*x+cs*y];
const transform=p=>add(rotate(p),translation);
const deep=(value,key='')=>{
  if(Array.isArray(value))return value.map(v=>deep(v,key));
  if(!value||typeof value!=='object')return value;
  if(typeof value.x==='number'&&typeof value.y==='number')return rec((key==='direction'||key==='inward'?rotate:transform)(arr(value)));
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,deep(v,k)]));
};
const B=Object.fromEntries(Object.entries(local.geometry.nodesMm).map(([id,p])=>[id,rec(transform(arr(p)))]));
const BD3=deep(local.geometry.D3RoomB),BD5=deep(local.geometry.D5RoomB),WCD5=deep(local.geometry.D5WC),sharedD5=deep(local.geometry.D5SharedPhysicalLeaf);
const priorB=global.geometry.roomBWCCorrectedRegisteredMm;
const roomBIds=['B0','D3-BR','B0.5','B1','B2','B3','B4'];
const wcIds=['T0','T1','T2','T3','D5-WCL'];
const movement=(ids)=>Object.fromEntries(ids.map(id=>{const dx=B[id].x-priorB[id].x,dy=B[id].y-priorB[id].y;return[id,{previous:priorB[id],preferred:B[id],deltaMm:{x:round(dx),y:round(dy)},magnitudeMm:round(Math.hypot(dx,dy))}];}));
const roomBMovement=movement(roomBIds),wcMovement=movement(wcIds);
const roomBMax=Math.max(...Object.values(roomBMovement).map(m=>m.magnitudeMm));
if(roomBMax>0.001)throw new Error(`Room B moved ${roomBMax} mm while generating preferred shell.`);

const A=global.geometry.roomAUnchangedMm,C=global.geometry.roomCUnchangedNodesMm,O=global.geometry.roomCUnchangedObjectNodesMm,D2=global.geometry.d2LayersUnchangedMm;
const d3Centre=arr(global.registration.sharedLeafCentre.targetRoomC),normal=[0,1];
const outerLine=[arr(C.PO2),arr(C.PO3)],innerLine=[arr(C.PI2),arr(C.PI3)],backLine=[arr(B.B4),arr(B.B3)];
const startOuter=lineIntersection(d3Centre,normal,outerLine[0],sub(outerLine[1],outerLine[0]));
const startInner=lineIntersection(d3Centre,normal,innerLine[0],sub(innerLine[1],innerLine[0]));
const endTile=lineIntersection(d3Centre,normal,backLine[0],sub(backLine[1],backLine[0]));
const endUnderlying=add(endTile,[0,10]);
const model3726=distance(startOuter,endTile),measured3726=3726;
const rayAngle=Math.acos(model3726/measured3726);
const rayStart=[d3Centre[0]-Math.abs(startOuter[1])*Math.tan(rayAngle),startOuter[1]];
const rayEnd=[d3Centre[0]+Math.abs(endTile[1])*Math.tan(rayAngle),endTile[1]];
const rayLength=distance(rayStart,rayEnd);
const validation3726={
  measuredMm:3726,
  currentPreferredD3NormalModelMm:round(model3726),residualMm:round(model3726-3726),
  definition:'D3-normal line through the fixed shared leaf centre, from the Room C outer removable-stud-partition face PO2-PO3 to the Room B B3-B4 finished tile face.',
  pointsMm:{startOnRoomCOuterFace:rec(startOuter),d3Crossing:rec(d3Centre),endOnRoomBFinishedTileFace:rec(endTile)},
  faceAudit:{
    roomCSelectedFace:{nodes:['PO2','PO3'],type:'accepted outer face of current removable stud partition',modelY:round(startOuter[1]),sameNamedPhysicalLayerAsFieldDescription:true},
    roomCInnerFaceAlternative:{nodes:['PI2','PI3'],modelMm:round(distance(startInner,endTile)),residualMm:round(distance(startInner,endTile)-3726),assessment:'wrong named face for the field description and substantially worse'},
    roomBSelectedFace:{nodes:['B3','B4'],type:'measured finished tile face',modelY:round(endTile[1]),sameNamedPhysicalLayerAsFieldDescription:true},
    roomBUnderlyingWallAlternative:{offsetBehindTileMm:10,modelMm:round(distance(startOuter,endUnderlying)),residualMm:round(distance(startOuter,endUnderlying)-3726),assessment:'supported approximate layer, but explains only about 10 mm'},
    casingRevealEffect:'None on the wall-to-wall span once start/end faces and ray are fixed; casing/reveal controls the doorway layers, not these wall intersections.',
    landingPositionEffect:'None for a perpendicular line between the currently parallel PO2-PO3 and B3-B4 faces; it matters only if the physical laser ray was oblique.',
  },
  directionAudit:{
    modelAssumption:'perpendicular D3 normal through the shared leaf centre',
    fieldRayPreciselyMarked:false,
    unresolved:'The evidence describes a straight ray through D3 but does not preserve marked start/end stations or an independently surveyed bearing.',
    illustrativeObliqueRayToEqual3726:{acceptedGeometry:false,angleFromD3NormalDegrees:round(rayAngle*180/Math.PI,6),horizontalOffsetAcrossSpanMm:round(Math.abs(rayEnd[0]-rayStart[0])),startMm:rec(rayStart),d3CrossingMm:rec(d3Centre),endMm:rec(rayEnd),lengthMm:round(rayLength),assessment:'Geometrically possible through the opening and onto B3-B4; shown only to quantify direction uncertainty, not to erase the perpendicular residual.'},
  },
  conclusion:'The selected model faces match the named physical finished faces. Tile/reference layers do not explain all 41.41 mm. Because the exact field bearing was not marked, the result remains a conditional D3-normal residual. If the physical shot was perpendicular, -41.41 mm is a genuine retained model residual.',
};
const validation9019={...global.globalValidation.span9019,finalModelMm:global.globalValidation.span9019.correctedModelMm,finalResidualMm:global.globalValidation.span9019.correctedResidualMm,unchangedByThisTask:true};

const result={
  documentType:'preferred provisional human-validated whole-flat 2D working shell; derived layer, not source evidence or construction geometry',
  version:'1.0',generatedDate:'2026-08-13',units:'millimetres',status:'PREFERRED PROVISIONAL HUMAN-VALIDATED 2D WORKING SHELL - HUMAN APPROVAL REQUIRED',
  provenance:{
    fixedWholeFlatV03:{file:'WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_3.json',sha256:sha(globalPath),use:'fixed Room A/C/D2/D3 frame and corrected Room B placement'},
    rectangularLocalV03:{file:'../room-b-wc/ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3.json',sha256:sha(localPath),use:'locked Room B and rectangular WC working layer'},
    measurementHistoryPreserved:['ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1','ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2','WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_3'],
    rawEvidenceDeleted:false,sourceBaselinesOverwritten:false,supersededObservationsRetained:true,preferredLayerIsDerivedHumanValidated:true,
  },
  architecturalReview:{
    sourcePlans:[{file:'source-material/plans/2dPlan.jpeg',use:'topology, handedness and room arrangement only'},{file:'source-material/plans/rough-paint-sketch.jpg',use:'topology, handedness and room arrangement only'}],
    dimensionsDerivedFromPlans:false,
    findings:['Room C is left of Room A','Room B drops below the D3 junction','WC is attached to the right of Room B as a simple rectangle','D3 and D5 each read as one coherent doorway','No artificial WC kink or Room B taper remains'],
  },
  roomB:{source:'ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2 geometry locked through local v0.3',movementFromCorrectedV02Mm:0,returnD3BRToB05Mm:136,mainWidthMm:local.predecessor?sourceRoomBWidth():null,mainDepthMm:sourceRoomBDepth(),measurementRmsMm:10.246,principalAnglesDegrees:[90,90,90,90,90,90],status:'preferred corrected Room B candidate'},
  wc:{workingWidthMm:local.solver.fittedParametersMm.width,workingHeightMm:local.solver.fittedParametersMm.height,movementFromGlobalV03:wcMovement,maximumMovementMm:Math.max(...Object.values(wcMovement).map(m=>m.magnitudeMm)),measurementRms:local.diagnostics.measurementRms,weightedChiSquare:local.solver.weightedChiSquareAfter,principalAnglesDegrees:local.diagnostics.anglesDegrees.after,opposingWidthsMm:local.diagnostics.opposingWidthsMm,status:'human-validated rectangle; raw conflicting measurements retained'},
  d3:{registration:global.registration,returnMm:136,returnStatus:'active verified same-span field recheck; old 249 mm retained inactive',opposingFaceInterpretation:'103.859 mm is derived casing-to-visible-face separation after shared-centre registration, not measured wall thickness',remainingUncertainty:'Room C opposing reveal/finished-face depth and thick A-C wall termination remain unmeasured'},
  d5:{openingTopology:'one real D5 opening; no wall across it',roomBFace:'B1-B2 fixed',wcFace:'T0-D5-WCL fixed architectural casing datum',facesParallel:true,perpendicularFaceSeparationMm:round(Math.abs(B.T0.x-B.B1.x)),topWallPlaneNormalOffsetMm:round(B.T0.y-B.B1.y),sharedLeafPreserved:true,wallPlaneAlignment:'Room B and WC top wall runs are parallel but offset by their distinct D5 face/reveal layers; T0-D5-WCL-T3 is collinear.'},
  validations:{A_D2_C_9019:validation9019,C_partition_D3_B_3726:validation3726},
  geometry:{roomAUnchangedMm:A,roomCUnchangedNodesMm:C,roomCUnchangedObjectNodesMm:O,d2LayersUnchangedMm:D2,roomBWCPreferredMm:B,roomBD3UnchangedMm:BD3,roomBD5UnchangedMm:BD5,wcD5PreferredMm:WCD5,d5SharedPhysicalLeafUnchangedMm:sharedD5},
  preservation:{roomAMaximumMovementMm:0,roomCMaximumMovementMm:0,d2RegistrationChanged:false,d3RegistrationChanged:false,roomBMaximumMovementFromCorrectedV02Mm:roomBMax,cupboardGeometryChanged:false,globalSolvePerformed:false,sourceEvidenceDeleted:false,finalOrConstructionLocked:false,modelling3DStarted:false},
  unresolved:['3726 mm validation is -41.41 mm under the D3-normal assumption; exact field ray bearing is not marked','9019 mm validation remains -61.86 mm','D3 opposing-face/reveal depth and thick A-C wall termination remain unmeasured'],
};
function sourceRoomBWidth(){return round(distance(arr(local.geometry.nodesMm.B4),arr(local.geometry.nodesMm.B3)));}
function sourceRoomBDepth(){return round(distance(arr(local.geometry.nodesMm.B1),arr(local.geometry.nodesMm.B3)));}
result.integrity={roomAGeometrySha256:shaJson(A),roomCGeometrySha256:shaJson(C),roomCObjectsSha256:shaJson(O),d2LayersSha256:shaJson(D2),roomBMaximumMovementMm:roomBMax};

const line=(a,b,cls)=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}"/>`;
const polygon=(points,cls)=>`<polygon points="${points.map(p=>`${p.x},${p.y}`).join(' ')}" class="${cls}"/>`;
const label=(p,s,cls='label',dx=0,dy=0)=>`<text x="${p.x+dx}" y="${p.y+dy}" class="${cls}">${s}</text>`;
const mid=(a,b)=>rec(midpoint(arr(a),arr(b)));
function svg(diagnostic=false){
  const a=id=>A[id],c=id=>C[id],o=id=>O[id],b=id=>B[id];
  const cp2Back={x:O['CP2-BODY-BL'].x-20,y:O['CP2-BODY-BL'].y};
  const overlay=diagnostic?`<polyline points="${wcIds.map(id=>`${priorB[id].x},${priorB[id].y}`).concat(`${priorB.T0.x},${priorB.T0.y}`).join(' ')}" class="old"/>${Object.values(wcMovement).map(m=>line(m.previous,m.preferred,'move')).join('')}${line(rec(startOuter),rec(endTile),'validation')}${line(rec(rayStart),rec(rayEnd),'ray')}${line(rec([startOuter[0]-500,endUnderlying[1]]),rec([startOuter[0]+1500,endUnderlying[1]]),'layer')}`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-400 -4550 10200 7500" role="img" aria-labelledby="title desc"><title id="title">Preferred provisional whole-flat working shell v1.0${diagnostic?' diagnostic':''}</title><desc id="desc">Human-validated 2D working shell. Prior evidence preserved. Human approval required; not construction locked.</desc><style>.bg{fill:#f8fafc}.roomA{fill:#fff7ed}.roomC{fill:#eff6ff}.roomB{fill:#ecfdf5}.wc{fill:#f0fdfa}.partition{fill:#f3e8ff}.cup{fill:#fef3c7;stroke:#a16207;stroke-width:18}.wallA{stroke:#c2410c}.wallC{stroke:#1e3a8a}.wallB{stroke:#047857}.wallWC{stroke:#0f766e}.wallA,.wallC,.wallB,.wallWC,.door,.window,.d2,.d3,.leaf,.validation,.ray,.layer{fill:none;stroke-width:38;stroke-linecap:round}.door{stroke:#d97706}.window{stroke:#0284c7}.d2{stroke:#9333ea;stroke-width:24}.d3{stroke:#f59e0b;stroke-width:30}.leaf{stroke:#0f172a;stroke-width:18}.label{font:66px Arial;fill:#17324d}.doorLabel{font:bold 48px Arial;fill:#7c2d12}.roomLabel{font:bold 120px Arial;fill:#17324d}.title{font:bold 64px Arial;fill:#9f1239}.small{font:48px Arial;fill:#334155}.old{fill:none;stroke:#94a3b8;stroke-width:17;stroke-dasharray:48 28}.move{stroke:#e11d48;stroke-width:12}.validation{stroke:#dc2626;stroke-width:16;stroke-dasharray:30 20}.ray{stroke:#7c3aed;stroke-width:14;stroke-dasharray:25 20}.layer{stroke:#0284c7;stroke-width:11;stroke-dasharray:20 16}</style><rect x="-400" y="-4550" width="10200" height="7500" class="bg"/>${polygon([c('C0'),c('CP1-FL'),c('CP2-FR'),c('D3-CL')],'roomC')}${polygon(['A0','A1','A2','A3','A4','A5','A6','A7'].map(a),'roomA')}${polygon(roomBIds.map(b),'roomB')}${polygon(wcIds.map(b),'wc')}${polygon([c('PO1'),c('PO2'),c('PO3'),c('PI3'),c('PI2'),c('PI1')],'partition')}${polygon([o('CP1-BODY-FL'),o('CP1-BODY-FR'),o('CP1-BODY-BR'),o('CP1-BODY-BL')],'cup')}${polygon([o('CP2-BODY-FL'),o('CP2-BODY-FR'),o('CP2-BODY-BR'),o('CP2-BODY-BL')],'cup')}${polygon([o('CP2-CASING-FL'),o('CP2-BODY-FL'),o('CP2-BODY-BL'),cp2Back],'cup')}${overlay}${line(c('C0'),c('CP1-FL'),'wallC')}${line(c('CP1-FL'),c('PO1'),'wallC')}${line(c('PI1'),c('CP2-FL'),'wallC')}${line(c('CP2-FR'),c('D3-CL'),'wallC')}${line(c('C0'),c('C1'),'wallC')}${line(c('C1'),c('W2-CR'),'wallC')}${line(c('W2-CR'),c('W2-CL'),'window')}${line(c('W2-CL'),c('C2'),'wallC')}${line(c('C2'),o('D4-OUTER-R'),'wallC')}${line(o('D4-OUTER-R'),o('D4-OUTER-L'),'door')}${line(o('D4-OUTER-L'),o('D3-OUTER-R'),'wallC')}${line(a('A0'),a('A1'),'wallA')}${line(a('A1'),a('A2'),'wallA')}${line(a('A2'),a('A3'),'wallA')}${line(a('A3'),a('A4'),'wallA')}${line(a('A4'),a('A5'),'wallA')}${line(a('A5'),a('W1-AL'),'wallA')}${line(a('W1-AL'),a('W1-AR'),'window')}${line(a('W1-AR'),a('A6'),'wallA')}${line(a('A6'),a('D1-AL'),'wallA')}${line(a('D1-AL'),a('D1-AR'),'door')}${line(a('D1-AR'),a('A7'),'wallA')}${line(a('A7'),a('D2-AL'),'wallA')}${line(a('D2-AR'),a('A0'),'wallA')}${line(D2.roomCStructuralOpeningAtRoomCFaceMm[0],D2.roomCStructuralOpeningAtRoomCFaceMm[1],'d2')}${line(D2.roomCStructuralOpeningAtRoomAFaceMm[0],D2.roomCStructuralOpeningAtRoomAFaceMm[1],'d2')}${line(o('D3-OUTER-R'),o('D3-OUTER-L-CORNER'),'d3')}${line(BD3.outerLeft,BD3.outerRight,'d3')}${line(BD3.doorLeft,BD3.doorRight,'leaf')}${line(b('D3-BR'),b('B0.5'),'wallB')}${line(b('B0.5'),b('B1'),'wallB')}${line(b('B1'),b('B2'),'door')}${line(b('B2'),b('B3'),'wallB')}${line(b('B3'),b('B4'),'wallB')}${line(b('B4'),b('B0'),'wallB')}${line(b('T0'),b('T1'),'wallWC')}${line(b('T1'),b('T2'),'wallWC')}${line(b('T2'),b('T3'),'wallWC')}${line(b('T3'),b('D5-WCL'),'wallWC')}${line(b('D5-WCL'),b('T0'),'door')}${line(sharedD5.leafTopMm,sharedD5.leafBottomMm,'leaf')}${label({x:200,y:-4380},'PREFERRED PROVISIONAL HUMAN-VALIDATED 2D WORKING SHELL v1.0','title')}${label({x:450,y:-1850},'ROOM C','roomLabel')}${label({x:6400,y:-2200},'ROOM A','roomLabel')}${label({x:3500,y:1650},'ROOM B','roomLabel')}${label({x:5700,y:800},'WC','roomLabel')}${label(mid(o('CP1-BODY-FL'),o('CP1-BODY-BR')),'CP1 / C1','small',-180,0)}${label(mid(o('CP2-BODY-FL'),o('CP2-BODY-BR')),'CP2 / C2','small',-160,0)}${label(mid(a('W1-AL'),a('W1-AR')),'W1','doorLabel',40,0)}${label(mid(c('W2-CR'),c('W2-CL')),'W2','doorLabel',0,80)}${label(mid(a('D1-AL'),a('D1-AR')),'D1','doorLabel',0,-40)}${label(mid(D2.roomCStructuralOpeningAtRoomCFaceMm[0],D2.roomCStructuralOpeningAtRoomCFaceMm[1]),'D2','doorLabel',-80,0)}${label(mid(o('D3-LEAF-R'),o('D3-LEAF-L')),'D3','doorLabel',-20,-70)}${label(mid(o('D4-OUTER-R'),o('D4-OUTER-L')),'D4','doorLabel',0,-55)}${label(mid(b('B1'),b('B2')),'D5','doorLabel',-100,0)}${label(mid(b('D3-BR'),b('B0.5')),'136 mm return','small',45,0)}${label({x:180,y:2800},diagnostic?'Red = D3-normal 3684.59 mm · purple = illustrative 3726 mm oblique ray · blue = ~10 mm wall layer':'HUMAN APPROVAL REQUIRED · derived working layer · not construction locked','small')}</svg>`;
}
function validationSvg(){
  const S=rec(startOuter),D=rec(d3Centre),E=rec(endTile),SI=rec(startInner),EU=rec(endUnderlying),RS=rec(rayStart),RE=rec(rayEnd);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="3000 -1750 2300 4550" role="img" aria-labelledby="title desc"><title id="title">3726 mm C-D3-B validation audit</title><desc id="desc">Focused layer and direction audit; schematic coordinate diagnostic, human review required.</desc><style>.bg{fill:#fff}.faceC{stroke:#7e22ce}.faceI{stroke:#c084fc}.faceB{stroke:#047857}.tileAlt{stroke:#0284c7}.door{stroke:#d97706}.normal{stroke:#dc2626}.ray{stroke:#7c3aed}.faceC,.faceI,.faceB,.tileAlt,.door,.normal,.ray{fill:none;stroke-width:22}.normal,.ray,.tileAlt{stroke-dasharray:34 24}.node{fill:white;stroke:#0f172a;stroke-width:8}.title{font:bold 58px Arial;fill:#0f172a}.label{font:44px Arial;fill:#17324d}.warn{font:bold 43px Arial;fill:#9f1239}.small{font:36px Arial;fill:#334155}</style><rect x="3000" y="-1750" width="2300" height="4550" class="bg"/><line x1="3150" y1="${SI.y}" x2="5100" y2="${SI.y}" class="faceI"/><line x1="3150" y1="${S.y}" x2="5100" y2="${S.y}" class="faceC"/><line x1="3300" y1="0" x2="4200" y2="0" class="door"/><line x1="3150" y1="${E.y}" x2="5100" y2="${E.y}" class="faceB"/><line x1="3150" y1="${EU.y}" x2="5100" y2="${EU.y}" class="tileAlt"/><line x1="${S.x}" y1="${S.y}" x2="${E.x}" y2="${E.y}" class="normal"/><line x1="${RS.x}" y1="${RS.y}" x2="${RE.x}" y2="${RE.y}" class="ray"/>${[[S,'start'],[D,'D3 centre'],[E,'end']].map(([p])=>`<circle cx="${p.x}" cy="${p.y}" r="18" class="node"/>`).join('')}<text x="3060" y="-1650" class="title">3726 mm VALIDATION · FACE + DIRECTION AUDIT</text><text x="3170" y="${SI.y-35}" class="label">Room C inner face alternative · wrong named layer · 3814.14 mm</text><text x="3170" y="${S.y-35}" class="label">START: PO2–PO3 outer current-stud face (${S.x.toFixed(2)}, ${S.y.toFixed(2)})</text><text x="${D.x+35}" y="-45" class="label">D3 shared leaf centre</text><text x="3170" y="${E.y-45}" class="label">END: B3–B4 finished tile face (${E.x.toFixed(2)}, ${E.y.toFixed(2)})</text><text x="3170" y="${EU.y+65}" class="small">Approx underlying wall +10 mm: 3694.59; residual −31.41 mm</text><text x="4300" y="500" class="warn">D3 normal: 3684.59 mm</text><text x="4300" y="565" class="warn">Measured: 3726 mm</text><text x="4300" y="630" class="warn">Retained residual: −41.41 mm</text><text x="3150" y="2550" class="small">Purple illustrative ray: 8.551° from normal would equal 3726 mm.</text><text x="3150" y="2605" class="small">Its bearing was not observed; it quantifies unmarked field-direction uncertainty only.</text><text x="3150" y="2700" class="warn">HUMAN REVIEW REQUIRED · no geometry fitted to this validation</text></svg>`;
}
function report(){
  const moveRows=Object.entries(wcMovement).map(([id,m])=>`| ${id} | ${m.deltaMm.x} | ${m.deltaMm.y} | ${m.magnitudeMm} |`).join('\n');
  return `# Whole-flat preferred provisional working shell v1.0\n\n**Status: PREFERRED PROVISIONAL HUMAN-VALIDATED 2D WORKING SHELL — HUMAN APPROVAL REQUIRED.**\n\nThis is a derived working layer, not a survey-perfect or construction-locked model. Every predecessor and raw observation remains preserved.\n\n## Room B\n\nThe corrected Room B v0.2 geometry remains preferred and moves **0 mm**. The D3 return remains **136 mm**, main width is **${result.roomB.mainWidthMm.toFixed(2)} mm**, main depth is **${result.roomB.mainDepthMm.toFixed(2)} mm**, the listed Room B RMS remains **10.246 mm**, and all principal shell angles are 90°.\n\n## WC\n\nThe v0.3 WC evidence-fit parallelogram is replaced only in this human-validated layer by a **${result.wc.workingWidthMm.toFixed(2)} × ${result.wc.workingHeightMm.toFixed(2)} mm** rectangle. Opposite walls are parallel, all corners are 90°, and \`T0–D5-WCL–T3\` is collinear with no kink. The raw 1643/1685 mm opposing-width conflict remains recorded.\n\n| WC node | dx mm | dy mm | movement mm |\n|---|---:|---:|---:|\n${moveRows}\n\nMaximum WC movement is **${result.wc.maximumMovementMm.toFixed(2)} mm**. Direct/casing RMS changes from **${result.wc.measurementRms.wcDirectAndCasingBeforeMm.toFixed(2)} to ${result.wc.measurementRms.wcDirectAndCasingAfterMm.toFixed(2)} mm**; all-listed RMS changes from **${result.wc.measurementRms.wcAllListedBeforeMm.toFixed(2)} to ${result.wc.measurementRms.wcAllListedAfterMm.toFixed(2)} mm**. The higher residual is the explicit cost of the human-observed rectangle against contradictory measured widths.\n\n## D3 and D5\n\nD3 registration is unchanged: 0° rotation, scale 1, shared-centre mismatch 0 mm. The 103.859 mm opposing-face separation remains derived, not measured wall thickness. The 249 mm return remains inactive history; 136 mm remains active.\n\nD5 remains one opening with no wall drawn across it. Room B and WC casing faces are parallel and separated by **${result.d5.perpendicularFaceSeparationMm.toFixed(2)} mm**. Their adjacent top-wall datums are parallel with a **${Math.abs(result.d5.topWallPlaneNormalOffsetMm).toFixed(2)} mm** normal offset representing distinct face/reveal layers. The shared leaf is unchanged.\n\n## 3726 mm validation audit\n\nThe selected start is the accepted **PO2–PO3 outer face** of the current removable stud partition. The model ray is the D3 normal through the fixed shared-leaf centre. It lands on **B3–B4**, whose measurement layer is the Room B finished tile face. These match the named field faces.\n\n- D3-normal model: 3684.59 mm; residual −41.41 mm.\n- Approximate underlying Room B wall plane 10 mm behind tile: 3694.59 mm; residual −31.41 mm.\n- Room C inner partition face: 3814.14 mm; residual +88.14 mm and the wrong named start layer.\n- Casing/reveal choices do not alter the fixed wall-to-wall intersections.\n- Landing station does not alter the perpendicular distance between these parallel faces.\n\nThe exact field ray bearing and marked endpoint stations were not preserved. An oblique ray about **${validation3726.directionAudit.illustrativeObliqueRayToEqual3726.angleFromD3NormalDegrees.toFixed(3)}°** from normal could geometrically pass through D3 and measure 3726 mm, but that bearing is not evidence and is not adopted. Therefore −41.41 mm remains the honest residual under the D3-normal interpretation.\n\n## Validation summary\n\n| Validation | Real measurement | Model before | Model after | Final residual |\n|---|---:|---:|---:|---:|\n| A→D2→C | 9019 mm | 8957.14 mm | 8957.14 mm | −61.86 mm |\n| C partition→D3→B | 3726 mm | 3684.59 mm | 3684.59 mm | −41.41 mm |\n\nThe WC cleanup affects neither validation.\n\n## Visual and provenance review\n\nThe two source plans were inspected only for topology. The result reads as Room C left, Room A right, Room B dropping below D3 and a simple rectangular WC attached through D5. D1–D5, W1/W2 and both Room C cupboards remain present. No artificial WC kink or unexplained Room B taper remains.\n\nPrevious measurement-driven baselines and constrained candidates are unchanged; the superseded 249 mm return and conflicting WC widths remain traceable; no source evidence was deleted. This preferred shell is explicitly a derived human-validated layer. No 3D work or automatic final promotion has occurred.\n\n**HUMAN REVIEW REQUIRED**\n`;
}
const stem='WHOLE_FLAT_PREFERRED_PROVISIONAL_WORKING_SHELL_v1_0';
fs.writeFileSync(path.join(outDir,stem+'.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(outDir,stem+'.md'),report());
fs.writeFileSync(path.join(outDir,stem+'.svg'),svg(false));
fs.writeFileSync(path.join(outDir,stem+'_DIAGNOSTIC.svg'),svg(true));
fs.writeFileSync(path.join(outDir,'WHOLE_FLAT_C_D3_B_3726_VALIDATION_DIAGNOSTIC_v0_1.svg'),validationSvg());
console.log(JSON.stringify({outputs:5,status:result.status,roomBMaximumMovementMm:roomBMax,wcMaximumMovementMm:result.wc.maximumMovementMm,d3RegistrationChanged:false,validations:{span9019:validation9019.finalResidualMm,span3726:validation3726.residualMm},illustrativeRayAngleDegrees:validation3726.directionAudit.illustrativeObliqueRayToEqual3726.angleFromD3NormalDegrees},null,2));

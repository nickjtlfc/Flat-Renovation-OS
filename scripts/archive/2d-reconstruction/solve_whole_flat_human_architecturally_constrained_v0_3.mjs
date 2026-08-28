#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root,'docs','survey','derived','global-reconciliation');
const globalV02Path = path.join(outDir,'WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_2.json');
const localV02Path = path.join(root,'docs','survey','derived','room-b-wc','ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.json');
const prior = JSON.parse(fs.readFileSync(globalV02Path,'utf8'));
const local = JSON.parse(fs.readFileSync(localV02Path,'utf8'));
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();
const round=(n,d=4)=>Number(n.toFixed(d));
const arr=p=>[p.x,p.y], rec=p=>({x:round(p[0]),y:round(p[1])});
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1]], mul=(a,s)=>[a[0]*s,a[1]*s];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1], cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const len=a=>Math.hypot(...a), distance=(a,b)=>len(sub(a,b)), unit=a=>mul(a,1/len(a)), midpoint=(a,b)=>mul(add(a,b),.5);
const bearing=a=>((Math.atan2(a[1],a[0])*180/Math.PI)+360)%360;
const signedAngle=d=>((d+540)%360)-180;
const undirectedDifference=(a,b)=>Math.abs((((a-b)%180)+270)%180-90);
const lineIntersection=(p,r,q,s)=>{const den=cross(r,s);if(Math.abs(den)<1e-10)throw new Error('Parallel diagnostic lines');return add(p,mul(r,cross(sub(q,p),s)/den));};
const pointLineDistance=(p,o,d)=>Math.abs(cross(unit(d),sub(p,o)));
const transformDeep=(value, pointFn, vectorFn, key='')=>{
  if(Array.isArray(value))return value.map(v=>transformDeep(v,pointFn,vectorFn,key));
  if(!value||typeof value!=='object')return value;
  if(typeof value.x==='number'&&typeof value.y==='number')return rec((key==='direction'||key==='inward'?vectorFn:pointFn)(arr(value)));
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,transformDeep(v,pointFn,vectorFn,k)]));
};

if(local.status!=='candidate - HUMAN REVIEW REQUIRED')throw new Error('Expected local field-reconciled v0.2 candidate.');
const A=prior.geometry.roomAAfterMm;
const C=prior.geometry.roomCUnchangedNodesMm;
const O=prior.geometry.roomCUnchangedObjectNodesMm;
const D2=prior.geometry.d2LayersUnchangedMm;
const oldB=prior.geometry.roomBWCAfterMm;
const localB=local.geometry.nodesMm;
const localD3=local.geometry.D3RoomB;

const cLeafCentre=midpoint(arr(O['D3-LEAF-R']),arr(O['D3-LEAF-L']));
const cAxis=sub(arr(O['D3-LEAF-L']),arr(O['D3-LEAF-R']));
const bAxis=sub(arr(localB['D3-BR']),arr(localB.B0));
const rotationDegrees=signedAngle(bearing(cAxis)-bearing(bAxis));
const rad=rotationDegrees*Math.PI/180, cs=Math.cos(rad), sn=Math.sin(rad);
const rotate=([x,y])=>[cs*x-sn*y,sn*x+cs*y];
const translation=sub(cLeafCentre,rotate(arr(localD3.doorCentre)));
const rigid=p=>add(rotate(p),translation);
const B=Object.fromEntries(Object.entries(localB).map(([id,p])=>[id,rec(rigid(arr(p)))]));
const BD3=transformDeep(localD3,rigid,rotate);
const BD5=transformDeep(local.geometry.D5RoomB,rigid,rotate);
const WCD5=transformDeep(local.geometry.D5WC,rigid,rotate);
const SharedD5=transformDeep(local.geometry.D5SharedPhysicalLeaf,rigid,rotate);

let pairwiseMax=0;
const ids=Object.keys(localB);
for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)pairwiseMax=Math.max(pairwiseMax,Math.abs(distance(arr(localB[ids[i]]),arr(localB[ids[j]]))-distance(arr(B[ids[i]]),arr(B[ids[j]]))));
if(pairwiseMax>1e-6||Math.abs(cs*cs+sn*sn-1)>1e-10)throw new Error('Rigid-transform invariant failed.');

const cFaceOrigin=arr(C['D3-CL']);
const cFaceDirection=sub(arr(C['D2-CR']),arr(C['D3-CL']));
const aFaceOrigin=midpoint(arr(O['D2-A-FACE-R']),arr(O['D2-A-FACE-L']));
const aFaceDirection=sub(arr(O['D2-A-FACE-L']),arr(O['D2-A-FACE-R']));
const lowerOrigin=arr(B['B0.5']), lowerDirection=sub(arr(B.B1),lowerOrigin);
const cFaceAtLower=lineIntersection(cFaceOrigin,cFaceDirection,lowerOrigin,lowerDirection);
const aFaceAtLower=lineIntersection(aFaceOrigin,aFaceDirection,lowerOrigin,lowerDirection);
const returnStartDistance=pointLineDistance(arr(B['D3-BR']),cFaceOrigin,cFaceDirection);
const returnEndDistance=pointLineDistance(arr(B['B0.5']),cFaceOrigin,cFaceDirection);
const b05ToAFace=distance(arr(B['B0.5']),aFaceAtLower);
const extrapolatedBandDepth=distance(cFaceAtLower,aFaceAtLower);
const cTowardB=mul(cFaceDirection,-1);
const returnBearing=bearing(sub(arr(B['B0.5']),arr(B['D3-BR'])));
const cTowardBBearing=bearing(cTowardB);

const d3Centre=cLeafCentre, d3Normal=[0,1];
const partitionLine=[arr(C.PO2),arr(C.PO3)];
const validation3726=points=>distance(lineIntersection(d3Centre,d3Normal,partitionLine[0],sub(partitionLine[1],partitionLine[0])),lineIntersection(d3Centre,d3Normal,arr(points.B3),sub(arr(points.B4),arr(points.B3))));
const d2Centre=midpoint(arr(O['D2-A-FACE-R']),arr(O['D2-A-FACE-L']));
const d2Normal=unit(sub(midpoint(arr(O['D2-A-FACE-R']),arr(O['D2-A-FACE-L'])),midpoint(arr(O['D2-OPENING-R']),arr(O['D2-OPENING-L-INFERRED']))));
const validation9019=()=>distance(lineIntersection(d2Centre,d2Normal,arr(A.A5),sub(arr(A.A6),arr(A.A5))),lineIntersection(d2Centre,d2Normal,arr(C.C0),sub(arr(C['CP1-FL']),arr(C.C0))));
const old3726=prior.beforeAfter.validations.span3726.modelAfterMm;
const new3726=validation3726(B), model9019=validation9019();
const bMovement=Object.fromEntries(Object.entries(B).map(([id,p])=>{const q=oldB[id];const dx=p.x-q.x,dy=p.y-q.y;return[id,{previous:q,corrected:p,deltaMm:{x:round(dx),y:round(dy)},magnitudeMm:round(Math.hypot(dx,dy))}];}));

const cCasing=[arr(O['D3-OUTER-R']),arr(O['D3-OUTER-L-CORNER'])];
const bCasing=[arr(B.B0),arr(B['D3-BR'])];
const cCasingCentre=midpoint(...cCasing), bCasingCentre=midpoint(...bCasing), along=unit(cAxis), towardB=[-along[1],along[0]];
const casingCentreDelta=sub(bCasingCentre,cCasingCentre);
const casingEndpointDeltas=bCasing.map((p,i)=>sub(p,cCasing[i]));
const hypothesisStatus='not supported by the corrected return alone; remains unresolved pending opposing-face/reveal measurements';

const result={
  documentType:'whole-flat human architecturally constrained reconciliation with field-reconciled Room B/WC rigidly registered through D3',
  version:'0.3',generatedDate:'2026-08-12',units:'millimetres',status:'candidate - HUMAN REVIEW REQUIRED',
  sources:{
    fixedGlobalFrame:{file:'WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_2.json',sha256:sha(globalV02Path),use:'Room A, Room C, D2 and all Room C objects copied unchanged'},
    correctedLocal:{file:'../room-b-wc/ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.json',sha256:sha(localV02Path),use:'Room B/WC geometry; rigid registration only'},
  },
  registration:{
    method:'Rigidly align corrected Room B visible closed D3 face centre and axis to fixed Room C D3 leaf centre and axis; scale 1, no reflection, no deformation.',
    roomBD3Axis:{bearingDegrees:round(bearing(bAxis),6),outerCasingWidthMm:round(len(bAxis))},
    roomCD3Axis:{bearingDegrees:round(bearing(cAxis),6),outerCasingWidthMm:round(distance(...cCasing))},
    requiredRotationDegrees:round(rotationDegrees,6),requiredTranslationMm:{x:round(translation[0]),y:round(translation[1])},scale:1,reflection:false,
    sharedLeafCentre:{targetRoomC:rec(cLeafCentre),placedRoomB:BD3.doorCentre,mismatchMm:round(distance(cLeafCentre,arr(BD3.doorCentre)),6)},
    layerChecks:{
      roomBVisibleClosedFaceWidthMm:localD3.visibleClosedWidthMm,roomCLeafWidthMm:distance(arr(O['D3-LEAF-R']),arr(O['D3-LEAF-L'])),leafWidthDifferenceRoomBMinusRoomCMm:round(localD3.visibleClosedWidthMm-distance(arr(O['D3-LEAF-R']),arr(O['D3-LEAF-L']))),
      roomBOuterCasingWidthMm:round(distance(...bCasing)),roomCOuterCasingWidthMm:round(distance(...cCasing)),casingWidthDifferenceRoomBMinusRoomCMm:round(distance(...bCasing)-distance(...cCasing)),
      casingCentreOffsetMm:{alongD3:round(dot(casingCentreDelta,along)),towardRoomB:round(dot(casingCentreDelta,towardB))},
      casingEndpointOffsetsMm:{B0RelativeToRoomCOuterRight:rec(casingEndpointDeltas[0]),D3BRRelativeToRoomCOuterLeftCorner:rec(casingEndpointDeltas[1])},
      opposingFaceSeparationMm:round(localD3.derivedDoorFaceDepthMm),opposingFaceEvidenceStatus:'Derived from corrected Room B casing-to-visible-face construction; Room C D3 reveal/depth remains unmeasured.'
    },
    resultingB05:B['B0.5'],
    rigidInvariantMaximumPairwiseChangeMm:round(pairwiseMax,8),
  },
  thickACWallHypothesis:{
    status:hypothesisStatus,
    reassessedFromCorrectedGeometry:true,
    correctedReturnLengthMm:round(distance(arr(B['D3-BR']),arr(B['B0.5']))),
    returnBearingDegrees:round(returnBearing,6),roomCExtrapolatedFaceTowardBBearingDegrees:round(cTowardBBearing,6),directionDifferenceDegrees:round(undirectedDifference(returnBearing,cTowardBBearing),6),
    returnStartDistanceToExtrapolatedRoomCFaceMm:round(returnStartDistance),returnEndDistanceToExtrapolatedRoomCFaceMm:round(returnEndDistance),
    b05ToExtrapolatedRoomAFaceAlongWallMm:round(b05ToAFace),predictedACWallDepthAtB05B1Mm:round(extrapolatedBandDepth),
    assessment:'The corrected return remains directionally compatible with the Room C face family, and the extrapolated A/C face band remains a diagnostic coincidence. However, the old 244.9 mm return was a material part of the prior plausibility argument. At 136 mm that evidence no longer establishes where the thick construction terminates. The continuation is therefore unresolved, not accepted geometry.',
  },
  globalValidation:{
    span9019:{measuredMm:9019,previousModelMm:prior.beforeAfter.validations.span9019.modelAfterMm,correctedModelMm:round(model9019),previousResidualMm:prior.beforeAfter.validations.span9019.residualAfterMm,correctedResidualMm:round(model9019-9019),unchanged:true},
    span3726:{measuredMm:3726,previousModelMm:round(old3726),correctedModelMm:round(new3726),previousResidualMm:round(old3726-3726),correctedResidualMm:round(new3726-3726),changeInModelMm:round(new3726-old3726),assessment:Math.abs(new3726-3726)<Math.abs(old3726-3726)?'improved':'worse absolute agreement; retained as independent validation, not fitted'},
  },
  geometry:{
    roomAUnchangedMm:A,roomCUnchangedNodesMm:C,roomCUnchangedObjectNodesMm:O,d2LayersUnchangedMm:D2,
    roomBWCCorrectedRegisteredMm:B,roomBD3CorrectedRegisteredMm:BD3,roomBD5CorrectedRegisteredMm:BD5,wcD5CorrectedRegisteredMm:WCD5,d5SharedPhysicalLeafRegisteredMm:SharedD5,
    diagnosticOnly:{roomCFaceAtB05B1:rec(cFaceAtLower),roomAFaceAtB05B1:rec(aFaceAtLower),acceptedGeometry:false},
  },
  movementFromGlobalV02:{roomBWCNodes:bMovement},
  preservation:{
    priorGlobalFilesOverwritten:false,localV01Overwritten:false,localV02DeformedDuringRegistration:false,
    roomAMaximumMovementMm:0,roomCMaximumMovementMm:0,d2RegistrationChanged:false,roomCObjectsChanged:false,cupboardGeometryChanged:false,
    cp1Present:true,cp2Present:true,roomBLocalCandidateRigidlyRegistered:true,d3TopologyChanged:false,d3RegistrationRecomputedFromCorrectedLocalCandidate:true,
    globalSolvePerformed:false,finalShellPromoted:false,modelling3DStarted:false,
  },
  unresolved:['Exact Room C-to-Room B finished-face depth/reveal through D3','Physical termination of the thick A-C wall near D3','The corrected 3726 validation residual of '+round(new3726-3726)+' mm'],
};

const line=(a,b,cls)=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}"/>`;
const poly=(points,cls)=>`<polygon points="${points.map(p=>`${p.x},${p.y}`).join(' ')}" class="${cls}"/>`;
const textAt=(p,s,cls='label',dx=0,dy=0)=>`<text x="${p.x+dx}" y="${p.y+dy}" class="${cls}">${s}</text>`;
const mid=(a,b)=>rec(midpoint(arr(a),arr(b)));
function svg(diagnostic=false){
  const a=id=>A[id],c=id=>C[id],o=id=>O[id],b=id=>B[id];
  const cp2Back={x:O['CP2-BODY-BL'].x-20,y:O['CP2-BODY-BL'].y};
  const oldOverlay=diagnostic?`<polyline points="${['B0','D3-BR','B0.5','B1','B2','B3','B4','B0'].map(id=>`${oldB[id].x},${oldB[id].y}`).join(' ')}" class="old"/><polyline points="${['T0','T1','T2','T3','D5-WCL','T0'].map(id=>`${oldB[id].x},${oldB[id].y}`).join(' ')}" class="old"/>${line(rec(cFaceOrigin),rec(cFaceAtLower),'construct')}${line(rec(aFaceOrigin),rec(aFaceAtLower),'construct')}${line(rec(lineIntersection(d3Centre,d3Normal,partitionLine[0],sub(partitionLine[1],partitionLine[0]))),rec(lineIntersection(d3Centre,d3Normal,arr(B.B3),sub(arr(B.B4),arr(B.B3)))),'validation')}`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-400 -4550 10200 7450" role="img" aria-labelledby="title desc"><title id="title">Whole-flat reconciliation v0.3${diagnostic?' diagnostic':''}</title><desc id="desc">Fixed Room A/C frame with corrected Room B/WC candidate rigidly registered through D3. Schematic, not to scale, human review required.</desc><style>.bg{fill:#f8fafc}.roomA{fill:#fff7ed}.roomC{fill:#eff6ff}.roomB{fill:#ecfdf5}.wc{fill:#f0fdfa}.partition{fill:#f3e8ff}.cup{fill:#fef3c7;stroke:#a16207;stroke-width:18}.wallA{stroke:#c2410c}.wallC{stroke:#1e3a8a}.wallB{stroke:#047857}.wallWC{stroke:#0f766e}.wallA,.wallC,.wallB,.wallWC,.door,.window,.d2,.d3,.construct,.validation{fill:none;stroke-width:38;stroke-linecap:round}.door{stroke:#d97706}.window{stroke:#0284c7}.d2{stroke:#9333ea;stroke-width:24}.d3{stroke:#f59e0b;stroke-width:30}.label{font:70px Arial;fill:#17324d}.roomLabel{font:bold 125px Arial;fill:#17324d}.note{font:bold 66px Arial;fill:#9f1239}.small{font:52px Arial;fill:#334155}.old{fill:none;stroke:#94a3b8;stroke-width:18;stroke-dasharray:55 35}.construct{stroke:#ca8a04;stroke-width:18;stroke-dasharray:45 30}.validation{stroke:#dc2626;stroke-width:14;stroke-dasharray:30 25}</style><rect x="-400" y="-4550" width="10200" height="7450" class="bg"/>${poly([c('C0'),c('CP1-FL'),c('CP2-FR'),c('D3-CL')],'roomC')}${poly(['A0','A1','A2','A3','A4','A5','A6','A7'].map(a),'roomA')}${poly(['B0','D3-BR','B0.5','B1','B2','B3','B4'].map(b),'roomB')}${poly(['T0','T1','T2','T3','D5-WCL'].map(b),'wc')}${poly([c('PO1'),c('PO2'),c('PO3'),c('PI3'),c('PI2'),c('PI1')],'partition')}${poly([o('CP1-BODY-FL'),o('CP1-BODY-FR'),o('CP1-BODY-BR'),o('CP1-BODY-BL')],'cup')}${poly([o('CP2-BODY-FL'),o('CP2-BODY-FR'),o('CP2-BODY-BR'),o('CP2-BODY-BL')],'cup')}${poly([o('CP2-CASING-FL'),o('CP2-BODY-FL'),o('CP2-BODY-BL'),cp2Back],'cup')}${oldOverlay}${line(c('C0'),c('CP1-FL'),'wallC')}${line(c('CP1-FL'),c('PO1'),'wallC')}${line(c('PI1'),c('CP2-FL'),'wallC')}${line(c('CP2-FR'),c('D3-CL'),'wallC')}${line(c('C0'),c('C1'),'wallC')}${line(c('C1'),c('W2-CR'),'wallC')}${line(c('W2-CR'),c('W2-CL'),'window')}${line(c('W2-CL'),c('C2'),'wallC')}${line(c('C2'),o('D4-OUTER-R'),'wallC')}${line(o('D4-OUTER-R'),o('D4-OUTER-L'),'door')}${line(o('D4-OUTER-L'),o('D3-OUTER-R'),'wallC')}${line(a('A0'),a('A1'),'wallA')}${line(a('A1'),a('A2'),'wallA')}${line(a('A2'),a('A3'),'wallA')}${line(a('A3'),a('A4'),'wallA')}${line(a('A4'),a('A5'),'wallA')}${line(a('A5'),a('W1-AL'),'wallA')}${line(a('W1-AL'),a('W1-AR'),'window')}${line(a('W1-AR'),a('A6'),'wallA')}${line(a('A6'),a('D1-AL'),'wallA')}${line(a('D1-AL'),a('D1-AR'),'door')}${line(a('D1-AR'),a('A7'),'wallA')}${line(a('A7'),a('D2-AL'),'wallA')}${line(a('D2-AR'),a('A0'),'wallA')}${line(D2.roomCStructuralOpeningAtRoomCFaceMm[0],D2.roomCStructuralOpeningAtRoomCFaceMm[1],'d2')}${line(D2.roomCStructuralOpeningAtRoomAFaceMm[0],D2.roomCStructuralOpeningAtRoomAFaceMm[1],'d2')}${line(o('D3-OUTER-R'),o('D3-OUTER-L-CORNER'),'d3')}${line(BD3.doorLeft,BD3.doorRight,'d3')}${line(b('D3-BR'),b('B0.5'),'wallB')}${line(b('B0.5'),b('B1'),'wallB')}${line(b('B1'),b('B2'),'door')}${line(b('B2'),b('B3'),'wallB')}${line(b('B3'),b('B4'),'wallB')}${line(b('B4'),b('B0'),'wallB')}${line(b('T0'),b('T1'),'wallWC')}${line(b('T1'),b('T2'),'wallWC')}${line(b('T2'),b('T3'),'wallWC')}${line(b('T3'),b('D5-WCL'),'wallWC')}${line(b('D5-WCL'),b('T0'),'door')}${textAt({x:250,y:-4380},'WHOLE-FLAT v0.3 · FIELD-RECONCILED ROOM B/WC · HUMAN REVIEW REQUIRED','note')}${textAt({x:600,y:-1800},'ROOM C · FIXED','roomLabel')}${textAt({x:6100,y:-2200},'ROOM A · FIXED v0.2','roomLabel')}${textAt({x:3500,y:1500},'ROOM B · corrected rigid placement','roomLabel')}${textAt({x:5600,y:1000},'WC','roomLabel')}${textAt(mid(o('CP1-BODY-FL'),o('CP1-BODY-BR')),'CP1 / C1 · fixed','label',-250,0)}${textAt(mid(o('CP2-BODY-FL'),o('CP2-BODY-BR')),'CP2 / C2 · fixed','label',-250,0)}${textAt(b('B0.5'),'B0.5', 'label',30,80)}${textAt(mid(b('D3-BR'),b('B0.5')),`${round(distance(arr(B['D3-BR']),arr(B['B0.5'])),1)} mm corrected return`,'small',50,0)}${textAt({x:300,y:2720},`D3 rigid: rotation ${round(rotationDegrees,3)}° · translation (${round(translation[0],2)}, ${round(translation[1],2)}) mm · 3726 model ${round(new3726,2)} mm`, 'small')}</svg>`;
}

function markdown(){
  const v=result.globalValidation;
  return `# Whole-flat human architecturally constrained reconciliation v0.3\n\n**Status: HUMAN REVIEW REQUIRED. Candidate only; not a final shell or construction model.**\n\nThis successor takes \`ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2\` as a fixed local model and rigidly registers it into the unchanged Room A/Room C v0.2 frame through D3. It does not hand-edit a predecessor SVG and does not deform any room during global placement.\n\n## Fixed and changed scope\n\n- Room A geometry and placement: unchanged, maximum movement 0 mm.\n- Room C geometry, cupboards CP1/C1 and CP2/C2, and placement: unchanged, maximum movement 0 mm.\n- D2 registration: unchanged.\n- Room B/WC: corrected local v0.2 candidate, then transformed as one rigid group.\n- D3 topology: unchanged; D3-BR to B0.5 remains a real separate return.\n\n## D3 rigid registration\n\n| Check | Result |\n|---|---:|\n| Corrected Room B D3 axis | ${result.registration.roomBD3Axis.bearingDegrees.toFixed(6)}° |\n| Fixed Room C D3 axis | ${result.registration.roomCD3Axis.bearingDegrees.toFixed(6)}° |\n| Required rotation | ${result.registration.requiredRotationDegrees.toFixed(6)}° |\n| Required translation | ${result.registration.requiredTranslationMm.x.toFixed(2)}, ${result.registration.requiredTranslationMm.y.toFixed(2)} mm |\n| Scale / reflection | 1 / none |\n| Shared leaf-centre mismatch | ${result.registration.sharedLeafCentre.mismatchMm.toFixed(2)} mm |\n| Derived opposing-face separation | ${result.registration.layerChecks.opposingFaceSeparationMm.toFixed(2)} mm |\n| Room B / Room C outer casing | ${result.registration.layerChecks.roomBOuterCasingWidthMm.toFixed(2)} / ${result.registration.layerChecks.roomCOuterCasingWidthMm.toFixed(2)} mm |\n| Room B visible face / Room C leaf | ${result.registration.layerChecks.roomBVisibleClosedFaceWidthMm.toFixed(2)} / ${result.registration.layerChecks.roomCLeafWidthMm.toFixed(2)} mm |\n\nThe shared centre and axis register exactly. The 738 mm Room B visible face is centred on the 760 mm Room C leaf reference, leaving 11 mm at each leaf end. Outer casing spans differ by ${Math.abs(result.registration.layerChecks.casingWidthDifferenceRoomBMinusRoomCMm).toFixed(2)} mm and are deliberately not forced together. The ${result.registration.layerChecks.opposingFaceSeparationMm.toFixed(2)} mm normal separation is derived from Room B's casing/face construction; it is not a measured D3 wall thickness.\n\nResulting \`B0.5\`: **(${B['B0.5'].x.toFixed(2)}, ${B['B0.5'].y.toFixed(2)}) mm** in the fixed global gauge.\n\n## Thick A-C wall continuation reassessment\n\n**${hypothesisStatus}.**\n\nThe corrected ${result.thickACWallHypothesis.correctedReturnLengthMm.toFixed(2)} mm return is still approximately parallel to the extrapolated Room C face family (${result.thickACWallHypothesis.directionDifferenceDegrees.toFixed(2)}° difference). The extrapolated face band remains about ${result.thickACWallHypothesis.predictedACWallDepthAtB05B1Mm.toFixed(2)} mm and B0.5 reaches the extrapolated Room A face after about ${result.thickACWallHypothesis.b05ToExtrapolatedRoomAFaceAlongWallMm.toFixed(2)} mm. Those are diagnostic extrapolations only. Because the old 244.9 mm return was materially used to argue for a termination near that wall construction, the corrected ${result.thickACWallHypothesis.correctedReturnLengthMm.toFixed(1)} mm span removes that part of the support. Exact D3 opposing-face/reveal measurements are still required.\n\n## Global validations\n\n| Span | Measured | v0.2 model | v0.2 residual | v0.3 model | v0.3 residual |\n|---|---:|---:|---:|---:|---:|\n| Far Room A wall through D2 to opposite Room C wall | 9019 | ${v.span9019.previousModelMm.toFixed(2)} | ${v.span9019.previousResidualMm.toFixed(2)} | ${v.span9019.correctedModelMm.toFixed(2)} | ${v.span9019.correctedResidualMm.toFixed(2)} |\n| Room C partition outer face through D3 to Room B back wall | 3726 | ${v.span3726.previousModelMm.toFixed(2)} | ${v.span3726.previousResidualMm.toFixed(2)} | ${v.span3726.correctedModelMm.toFixed(2)} | ${v.span3726.correctedResidualMm.toFixed(2)} |\n\nThe 9019 mm A/C check is unchanged. The corrected 3726 model is ${Math.abs(v.span3726.correctedResidualMm).toFixed(2)} mm short, versus ${Math.abs(v.span3726.previousResidualMm).toFixed(2)} mm long previously; absolute agreement is worse. This check is retained as an independent diagnostic and was not fitted. It is the principal global ambiguity for human review, alongside the unmeasured D3 opposing-face/reveal depth.\n\n## Conclusion\n\nThe corrected local Room B shape remains exactly orthogonal and the D3 rigid registration is geometrically valid: rotation 0°, leaf-centre mismatch 0 mm and rigid pairwise deformation below ${result.registration.rigidInvariantMaximumPairwiseChangeMm} mm. No A/C node moved, D2 did not change, and no global solve was performed.\n\n**HUMAN REVIEW REQUIRED**\n`;
}

const stem='WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_3';
fs.writeFileSync(path.join(outDir,stem+'.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(outDir,stem+'.md'),markdown());
fs.writeFileSync(path.join(outDir,stem+'.svg'),svg(false));
fs.writeFileSync(path.join(outDir,stem+'_DIAGNOSTIC.svg'),svg(true));
console.log(JSON.stringify({outputs:4,rotationDegrees,translationMm:result.registration.requiredTranslationMm,resultingB05:B['B0.5'],validations:result.globalValidation,thickWallHypothesis:result.thickACWallHypothesis.status},null,2));

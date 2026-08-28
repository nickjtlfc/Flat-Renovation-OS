#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const outDir=path.join(root,'docs','survey','derived','room-b-wc');
const sourcePath=path.join(outDir,'ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.json');
const source=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
const old=source.geometry.nodesMm;
const round=(n,d=3)=>Number(n.toFixed(d));
const point=(x,y)=>({x:round(x),y:round(y)});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const bearing=(a,b)=>((Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI)+360)%360;
const angle=(a,b,c)=>{const u=[a.x-b.x,a.y-b.y],v=[c.x-b.x,c.y-b.y];return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/(Math.hypot(...u)*Math.hypot(...v)))))*180/Math.PI;};
const rms=xs=>Math.sqrt(xs.reduce((s,x)=>s+x*x,0)/xs.length);
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex').toUpperCase();

const xAxis=(old.T0.x+old['D5-WCL'].x)/2;
const topY=old.T0.y;
const casingDepth=Math.abs(old['D5-WCL'].y-old.T0.y);
function trialNodes([width,height]){
  return {
    ...structuredClone(old),
    T0:point(xAxis,topY),
    T1:point(xAxis+width,topY),
    T2:point(xAxis+width,topY+height),
    T3:point(xAxis,topY+height),
    'D5-WCL':point(xAxis,old['D5-WCL'].y),
  };
}
function observations(nodes){
  const obs=[
    ['BASE-WC-01','T0','T1',1643,4,'direct opposing width'],
    ['BASE-WC-02','T1','T2',1078,4,'direct side depth'],
    ['BASE-WC-03','T2','T3',1685,4,'direct opposing width; conflicts with BASE-WC-01 by 42 mm'],
    ['BASE-WC-04','T3','D5-WCL',173,4,'direct permanent wall segment'],
    ['D5-WC-CASING-WIDTH','D5-WCL','T0',898,5,'WC-side D5 object/casing layer'],
    ['SUP-072','T0','T2',1959,8,'diagonal cross-tie'],
    ['SUP-073','T1','T3',1970,35,'approximate diagonal'],
    ['SUP-079','B0','T2',3674,12,'Room B-to-WC cross-tie'],
  ];
  return obs.map(([id,from,to,measured,sigma,note])=>{const model=dist(nodes[from],nodes[to]);return{id,from,to,measuredMm:measured,modelMm:round(model),residualMm:round(model-measured),sigmaMm:sigma,note};});
}
function cost(params){return observations(trialNodes(params)).reduce((s,o)=>s+(o.residualMm/o.sigmaMm)**2,0);}
function solve(){let p=[1664,1075],steps=[32,24],best=cost(p);for(let k=0;k<120;k++){let improved=false;for(let i=0;i<2;i++)for(const sign of[-1,1]){const q=[...p];q[i]+=sign*steps[i];const c=cost(q);if(c<best){p=q;best=c;improved=true;}}if(!improved)steps=steps.map(s=>s/2);if(Math.max(...steps)<0.0002)break;}return{params:p.map(v=>round(v,4)),cost:round(best,6)};}
const solved=solve();
const nodes=trialNodes(solved.params);
const beforeObs=observations(old),afterObs=observations(nodes);
const baselineIds=new Set(['BASE-WC-01','BASE-WC-02','BASE-WC-03','BASE-WC-04','D5-WC-CASING-WIDTH']);
const baselineBefore=beforeObs.filter(o=>baselineIds.has(o.id)).map(o=>o.residualMm);
const baselineAfter=afterObs.filter(o=>baselineIds.has(o.id)).map(o=>o.residualMm);

const movement=Object.fromEntries(['T0','T1','T2','T3','D5-WCL'].map(id=>{const dx=nodes[id].x-old[id].x,dy=nodes[id].y-old[id].y;return[id,{previous:old[id],corrected:nodes[id],deltaMm:point(dx,dy),magnitudeMm:round(Math.hypot(dx,dy))}];}));
const maxMovement=Object.entries(movement).sort((a,b)=>b[1].magnitudeMm-a[1].magnitudeMm)[0];
const beforeAngles={T0:angle(old['D5-WCL'],old.T0,old.T1),T1:angle(old.T0,old.T1,old.T2),T2:angle(old.T1,old.T2,old.T3),T3:angle(old.T2,old.T3,old['D5-WCL']),D5WCL:angle(old.T3,old['D5-WCL'],old.T0)};
const afterAngles={T0:angle(nodes['D5-WCL'],nodes.T0,nodes.T1),T1:angle(nodes.T0,nodes.T1,nodes.T2),T2:angle(nodes.T1,nodes.T2,nodes.T3),T3:angle(nodes.T2,nodes.T3,nodes['D5-WCL']),D5WCL:angle(nodes.T3,nodes['D5-WCL'],nodes.T0)};
const beforeBearings={top:bearing(old.T0,old.T1),right:bearing(old.T1,old.T2),bottom:bearing(old.T3,old.T2),left:bearing(old.T0,old.T3),d5Face:bearing(old.T0,old['D5-WCL']),wallToD5:bearing(old['D5-WCL'],old.T3)};
const afterBearings={top:bearing(nodes.T0,nodes.T1),right:bearing(nodes.T1,nodes.T2),bottom:bearing(nodes.T3,nodes.T2),left:bearing(nodes.T0,nodes.T3),d5Face:bearing(nodes.T0,nodes['D5-WCL']),wallToD5:bearing(nodes['D5-WCL'],nodes.T3)};

const D5WC=structuredClone(source.geometry.D5WC);
D5WC.outerLeft=nodes['D5-WCL'];D5WC.outerRight=nodes.T0;D5WC.innerLeft.x=round(xAxis);D5WC.innerRight.x=round(xAxis);D5WC.direction={x:0,y:-1};D5WC.casingLength=round(casingDepth);
const shared=structuredClone(source.geometry.D5SharedPhysicalLeaf);
shared.wc.casingWidthMm=round(casingDepth);shared.oppositeCasingFaceSeparationMm=round(Math.abs(xAxis-nodes.B1.x));
const roomBIds=['B0','D3-BR','B0.5','B1','B2','B3','B4'];
const roomBLocked=roomBIds.every(id=>JSON.stringify(nodes[id])===JSON.stringify(old[id]));
if(!roomBLocked)throw new Error('Room B lock violated.');

const result={
  documentType:'derived Room B/WC candidate with locked field-reconciled Room B and human-validated rectangular WC working geometry',
  version:'0.3',generatedDate:'2026-08-13',units:'millimetres',status:'preferred local candidate - HUMAN REVIEW REQUIRED',
  predecessor:{file:'ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.json',sha256:sha(sourcePath),overwritten:false},
  scope:{roomB:'locked without movement',wc:'architectural rectangle successor only',d3:'unchanged',d5:'opening and separate faces preserved'},
  evidenceBoundary:{
    rawMeasurementsEdited:false,sourceEvidenceDeleted:false,superseded249ReturnRetained:true,
    measuredWC:'The 1643 and 1685 mm opposing widths remain conflicting active provenance. No measurement is rewritten to make the room rectangular.',
    workingWC:'Exact parallel/perpendicular shell is a human-approved architectural working layer fitted against the retained evidence.',
  },
  solver:{method:'Deterministic weighted least-squares coordinate descent for rectangle width and height; WC-side D5 casing axis anchored; exact parallel/perpendicular constraints.',fittedParametersMm:{width:solved.params[0],height:solved.params[1]},fixedD5WCCasingDepthMm:round(casingDepth),weightedChiSquareBefore:round(beforeObs.reduce((s,o)=>s+(o.residualMm/o.sigmaMm)**2,0),6),weightedChiSquareAfter:solved.cost},
  geometry:{
    nodesMm:nodes,aliases:source.geometry.aliases,roomBBoundarySequence:source.geometry.roomBBoundarySequence,wcBoundarySequence:source.geometry.wcBoundarySequence,
    areasM2:{roomB:source.geometry.areasM2.roomB,wc:round(solved.params[0]*solved.params[1]/1e6,4)},
    D3RoomB:source.geometry.D3RoomB,D5RoomB:source.geometry.D5RoomB,D5WC,D5SharedPhysicalLeaf:shared,
    tileAndWallLayers:source.geometry.tileAndWallLayers,soffit:source.geometry.soffit,verticalEvidence:source.geometry.verticalEvidence,
    sanitaryAndServiceTopology:'unchanged; no sanitary/service point was re-solved or inferred',
  },
  diagnostics:{
    observations:{before:beforeObs,after:afterObs},
    measurementRms:{definition:'Unweighted RMS in millimetres over the named retained observations.',wcDirectAndCasingBeforeMm:round(rms(baselineBefore)),wcDirectAndCasingAfterMm:round(rms(baselineAfter)),wcAllListedBeforeMm:round(rms(beforeObs.map(o=>o.residualMm))),wcAllListedAfterMm:round(rms(afterObs.map(o=>o.residualMm)))},
    movement:{nodes:movement,maximum:{node:maxMovement[0],magnitudeMm:maxMovement[1].magnitudeMm},rmsMovedWCNodesMm:round(rms(Object.values(movement).map(m=>m.magnitudeMm))),explanation:'T1/T2 rotate onto the D5 casing datum and T3 closes the left wall. These are explained architectural rectangularisation movements, not residual force applied to Room B.'},
    anglesDegrees:{before:Object.fromEntries(Object.entries(beforeAngles).map(([k,v])=>[k,round(v,6)])),after:Object.fromEntries(Object.entries(afterAngles).map(([k,v])=>[k,round(v,6)]))},
    bearingsDegrees:{before:Object.fromEntries(Object.entries(beforeBearings).map(([k,v])=>[k,round(v,6)])),after:Object.fromEntries(Object.entries(afterBearings).map(([k,v])=>[k,round(v,6)]))},
    opposingWidthsMm:{before:{T0T1:round(dist(old.T0,old.T1)),T3T2:round(dist(old.T3,old.T2)),difference:round(dist(old.T3,old.T2)-dist(old.T0,old.T1))},after:{T0T1:round(dist(nodes.T0,nodes.T1)),T3T2:round(dist(nodes.T3,nodes.T2)),difference:0},rawEvidence:{top:1643,bottom:1685,difference:42}},
    rectangularity:{oppositeWallsParallel:true,adjoiningWallsPerpendicular:true,d5WallKinkDegrees:round(180-afterAngles.D5WCL,8),artificialKink:false},
  },
  preservation:{roomBMaximumMovementMm:0,d3MaximumMovementMm:0,d5RoomBObjectChanged:false,d5SharedLeafChanged:false,d5WCObjectTopologyChanged:false,roomCMaximumMovementMm:0,roomAMaximumMovementMm:0,d2MaximumMovementMm:0,sourceBaselinesOverwritten:false,finalShellPromoted:false,modelling3DStarted:false},
};

const line=(a,b,cls)=>`<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}"/>`;
const poly=(ids,n,cls)=>`<polygon points="${ids.map(id=>`${n[id].x},${n[id].y}`).join(' ')}" class="${cls}"/>`;
function svg(diagnostic=false){
  const all=[...Object.values(nodes),...Object.values(old)],minX=Math.min(...all.map(p=>p.x))-250,maxX=Math.max(...all.map(p=>p.x))+300,minY=Math.min(...all.map(p=>p.y))-300,maxY=Math.max(...all.map(p=>p.y))+300;
  const overlay=diagnostic?`<polyline points="${['T0','T1','T2','T3','D5-WCL','T0'].map(id=>`${old[id].x},${old[id].y}`).join(' ')}" class="old"/>${Object.entries(movement).map(([,m])=>line(m.previous,m.corrected,'move')).join('')}`:'';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX-minX} ${maxY-minY}" role="img" aria-labelledby="title desc"><title id="title">Room B/WC rectangular WC candidate v0.3${diagnostic?' diagnostic':''}</title><desc id="desc">Locked corrected Room B and human-validated rectangular WC. Schematic, not to scale.</desc><style>.bg{fill:#f8fafc}.b{fill:#ecfdf5}.wc{fill:#eff6ff}.wallB{stroke:#047857}.wallWC{stroke:#0f766e}.door{stroke:#d97706}.wallB,.wallWC,.door{fill:none;stroke-width:22;stroke-linecap:round}.node{fill:white;stroke:#0f766e;stroke-width:5}.label{font:36px Arial;fill:#17324d}.title{font:bold 42px Arial;fill:#9f1239}.old{fill:none;stroke:#9b5de5;stroke-width:7;stroke-dasharray:25 18}.move{stroke:#e11d48;stroke-width:4}.dim{font:30px Arial;fill:#334155}</style><rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" class="bg"/>${poly(['B0','D3-BR','B0.5','B1','B2','B3','B4'],nodes,'b')}${poly(['T0','T1','T2','T3','D5-WCL'],nodes,'wc')}${overlay}${line(nodes.B0,nodes['D3-BR'],'door')}${line(nodes['D3-BR'],nodes['B0.5'],'wallB')}${line(nodes['B0.5'],nodes.B1,'wallB')}${line(nodes.B1,nodes.B2,'door')}${line(nodes.B2,nodes.B3,'wallB')}${line(nodes.B3,nodes.B4,'wallB')}${line(nodes.B4,nodes.B0,'wallB')}${line(nodes.T0,nodes.T1,'wallWC')}${line(nodes.T1,nodes.T2,'wallWC')}${line(nodes.T2,nodes.T3,'wallWC')}${line(nodes.T3,nodes['D5-WCL'],'wallWC')}${line(nodes['D5-WCL'],nodes.T0,'door')}${['T0','T1','T2','T3','D5-WCL'].map(id=>`<circle cx="${nodes[id].x}" cy="${nodes[id].y}" r="11" class="node"/><text x="${nodes[id].x+16}" y="${nodes[id].y-14}" class="label">${id}</text>`).join('')}<text x="${minX+35}" y="${minY+62}" class="title">RECTANGULAR WC v0.3 · ROOM B LOCKED · HUMAN REVIEW REQUIRED</text><text x="${nodes.T0.x+300}" y="${nodes.T0.y+100}" class="dim">${round(solved.params[0],1)} × ${round(solved.params[1],1)} mm working rectangle</text><text x="${nodes.T0.x+25}" y="${(nodes.T0.y+nodes['D5-WCL'].y)/2}" class="dim">D5 opening · separate WC face</text></svg>`;
}
function report(){
  const moveRows=Object.entries(movement).map(([id,m])=>`| ${id} | ${m.deltaMm.x} | ${m.deltaMm.y} | ${m.magnitudeMm} |`).join('\n');
  const obsRows=afterObs.map((o,i)=>`| ${o.id} | ${o.measuredMm} | ${beforeObs[i].modelMm} | ${beforeObs[i].residualMm} | ${o.modelMm} | ${o.residualMm} |`).join('\n');
  return `# Room B/WC field-reconciled rectangular-WC candidate v0.3\n\n**Status: preferred local candidate — HUMAN REVIEW REQUIRED.**\n\nRoom B is copied unchanged from \`ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2\`. The 136 mm D3 return and every corrected Room B node remain locked. This successor only creates an explicit human-validated rectangular WC working layer.\n\n## WC architecture\n\nThe permanent WC wall families are \`T0→T1\` / \`T3→T2\` and \`T1→T2\` / \`T0→T3\`. The WC-side D5 casing \`T0→D5-WCL\` interrupts the left family; \`D5-WCL→T3\` is the remaining permanent wall on the same straight datum. No wall is drawn across D5.\n\nWorking rectangle: **${solved.params[0].toFixed(2)} × ${solved.params[1].toFixed(2)} mm**. All four principal corners are 90°, opposite walls are parallel, and the D5-WCL kink is ${result.diagnostics.rectangularity.d5WallKinkDegrees.toFixed(6)}°. The D5 shared leaf and Room B face are unchanged.\n\n## Retained measurement conflict\n\nThe measured opposing widths remain 1643 and 1685 mm, a 42 mm conflict. The rectangle does not rewrite either observation; its equal working widths are ${solved.params[0].toFixed(2)} mm.\n\n| Observation | Measured | Before model | Before residual | After model | After residual |\n|---|---:|---:|---:|---:|---:|\n${obsRows}\n\nDirect/casing WC RMS changes from **${result.diagnostics.measurementRms.wcDirectAndCasingBeforeMm.toFixed(2)} to ${result.diagnostics.measurementRms.wcDirectAndCasingAfterMm.toFixed(2)} mm**. RMS over all eight listed WC/cross-tie observations changes from **${result.diagnostics.measurementRms.wcAllListedBeforeMm.toFixed(2)} to ${result.diagnostics.measurementRms.wcAllListedAfterMm.toFixed(2)} mm**. Weighted chi-square changes from ${result.solver.weightedChiSquareBefore.toFixed(2)} to ${result.solver.weightedChiSquareAfter.toFixed(2)}. This fit penalty is the explicit cost of representing the human-observed rectangle despite conflicting raw widths.\n\n## WC node movement\n\n| Node | dx mm | dy mm | magnitude mm |\n|---|---:|---:|---:|\n${moveRows}\n\nMaximum movement is **${maxMovement[1].magnitudeMm.toFixed(2)} mm at ${maxMovement[0]}**; WC-node RMS movement is **${result.diagnostics.movement.rmsMovedWCNodesMm.toFixed(2)} mm**. T1/T2 movements rotate the measured parallelogram onto the D5 casing datum. They are explained architectural cleanup movements. Room B, D3, Room A, Room C and D2 movement are all 0 mm.\n\nNo source evidence is deleted, and no 3D or final-shell promotion occurs here.\n`;
}
const stem='ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3';
fs.writeFileSync(path.join(outDir,stem+'.json'),JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(outDir,stem+'.md'),report());
fs.writeFileSync(path.join(outDir,stem+'.svg'),svg(false));
fs.writeFileSync(path.join(outDir,stem+'_DIAGNOSTIC.svg'),svg(true));
console.log(JSON.stringify({outputs:4,roomBMaximumMovementMm:0,wcParametersMm:result.solver.fittedParametersMm,maximumMovement:result.diagnostics.movement.maximum,rms:result.diagnostics.measurementRms,anglesAfter:result.diagnostics.anglesDegrees.after},null,2));

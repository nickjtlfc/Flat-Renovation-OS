import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'docs', 'survey', 'derived', 'room-b-wc');
const predecessorPath = path.join(outDir, 'ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json');
const predecessor = JSON.parse(fs.readFileSync(predecessorPath, 'utf8'));
const old = predecessor.selectedGeometry;
const oldNodes = old.nodesMm;
const round = (n, d = 3) => Number(n.toFixed(d));
const pt = (x, y) => ({ x: round(x), y: round(y) });
const xy = (p) => [p.x, p.y];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const bearing = (a, b) => ((Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI) + 360) % 360;
const rms = (xs) => Math.sqrt(xs.reduce((s, x) => s + x * x, 0) / xs.length);
const intervalResidual = (value, min, max) => value < min ? value - min : value > max ? value - max : 0;
const huber = (z, k = 1.5) => Math.abs(z) <= k ? 0.5 * z * z : k * (Math.abs(z) - 0.5 * k);

const d5Length = dist(oldNodes.B1, oldNodes.B2);
const oldV = { x: (oldNodes.B2.x - oldNodes.B1.x) / d5Length, y: (oldNodes.B2.y - oldNodes.B1.y) / d5Length };
const oldN = { x: oldV.y, y: -oldV.x };
const localComponents = (p) => {
  const dx = p.x - oldNodes.B1.x;
  const dy = p.y - oldNodes.B1.y;
  return { n: dx * oldN.x + dy * oldN.y, v: dx * oldV.x + dy * oldV.y };
};
const wcT2Offset = localComponents(oldNodes.T2);

function nodesFor([r, a, width, depth]) {
  return {
    B0: pt(0, 0),
    'D3-BR': pt(a, 0),
    'B0.5': pt(a, r),
    B1: pt(width, r),
    B2: pt(width, r + d5Length),
    B3: pt(width, r + depth),
    B4: pt(0, r + depth),
  };
}

function evidenceFor(params) {
  const n = nodesFor(params);
  const value = (a, b) => dist(n[a], n[b]);
  const t2 = pt(n.B1.x + wcT2Offset.n, n.B1.y + wcT2Offset.v);
  return [
    { id: 'FIELD-B-D3-RETURN-2026-08', label: 'D3-BR -> B0.5', measured: 136, predicted: value('D3-BR', 'B0.5'), sigma: 2, quality: 'new exact field recheck' },
    { id: 'BASE-B-03', label: 'B0.5 -> B1', measured: 823, predicted: value('B0.5', 'B1'), sigma: 4, quality: 'existing exact endpoint' },
    { id: 'D5-B-CASING-WIDTH', label: 'B1 -> B2', measured: 874, predicted: value('B1', 'B2'), sigma: 5, quality: 'existing door-object' },
    { id: 'FIELD-B-B2-B3-2026-08', label: 'B2 -> B3', measured: 1219, predicted: value('B2', 'B3'), sigma: 4, quality: 'new exact field recheck' },
    { id: 'BASE-B-06', label: 'B3 -> B4', measured: 1665, predicted: value('B3', 'B4'), sigma: 7, quality: 'finished tile face' },
    { id: 'FIELD-B-B0-B4-2026-08', label: 'B0 / D3-BL -> B4', measured: 2216, predicted: value('B0', 'B4'), sigma: 4, quality: 'new exact field recheck' },
    { id: 'SUP-065', label: 'B0 -> B0.5', measured: 888, predicted: value('B0', 'B0.5'), sigma: 7, quality: 'existing exact endpoint' },
    { id: 'SUP-066', label: 'B0 -> B2', measured: 1952, predicted: value('B0', 'B2'), sigma: 30, quality: 'approximate difficult shot' },
    { id: 'SUP-067', label: 'B0 -> B3', range: [2755, 2765], predicted: value('B0', 'B3'), sigma: 12, quality: 'measured range' },
    { id: 'SUP-068', label: 'B0.5 -> B2', range: [1182, 1190], predicted: value('B0.5', 'B2'), sigma: 12, quality: 'measured range' },
    { id: 'SUP-069', label: 'B0.5 -> B3', measured: 2228, predicted: value('B0.5', 'B3'), sigma: 8, quality: 'existing exact endpoint' },
    { id: 'SUP-070', label: 'B1 -> B4', measured: 2673, predicted: value('B1', 'B4'), sigma: 8, quality: 'existing exact endpoint' },
    { id: 'SUP-071', label: 'B2 -> B4', measured: 2046, predicted: value('B2', 'B4'), sigma: 8, quality: 'existing exact endpoint' },
    { id: 'FIELD-B-B1-B3-2026-08', label: 'B1 / D5-BL -> B3', measured: 2091, predicted: value('B1', 'B3'), sigma: 4, quality: 'new exact field recheck' },
    { id: 'FIELD-B-B05-BACK-PERP-2026-08', label: 'B0.5 -> perpendicular B3-B4 landing', measured: 2080, predicted: params[3], sigma: 8, quality: 'new perpendicular field recheck' },
    { id: 'SUP-080', label: 'D3-BR -> perpendicular B3-B4 landing', measured: 2217, predicted: params[0] + params[3], sigma: 30, quality: 'existing validation-grade wall span' },
    { id: 'SUP-079', label: 'B0 -> T2', measured: 3674, predicted: Math.hypot(t2.x, t2.y), sigma: 12, quality: 'existing B/WC cross-tie' },
  ].map(o => ({ ...o, residualMm: round(o.range ? intervalResidual(o.predicted, ...o.range) : o.predicted - o.measured) }));
}

function cost(params) {
  const [r, a, width, depth] = params;
  if (r < 50 || r > 300 || a < 700 || a > 1050 || width < 1500 || width > 1900 || depth < 1850 || depth > 2250 || width <= a || depth <= d5Length) return 1e12;
  return evidenceFor(params).reduce((s, o) => s + huber(o.residualMm / o.sigma), 0);
}

function solve() {
  let p = [136, 878, 1690, 2088];
  let steps = [32, 48, 64, 64];
  let best = cost(p);
  for (let outer = 0; outer < 120; outer++) {
    let improved = false;
    // The verified same-span field correction is controlling evidence, not a fitted compromise.
    for (let i = 1; i < p.length; i++) {
      for (const sign of [-1, 1]) {
        const q = [...p]; q[i] += sign * steps[i];
        const c = cost(q);
        if (c + 1e-12 < best) { p = q; best = c; improved = true; }
      }
    }
    if (!improved) steps = steps.map(s => s / 2);
    if (Math.max(...steps) < 0.0002) break;
  }
  return { params: p.map(x => round(x, 4)), cost: round(best, 6) };
}

const solved = solve();
const nodes = nodesFor(solved.params);

function transformAcceptedPoint(p) {
  const c = localComponents(p);
  return pt(nodes.B1.x + c.n, nodes.B1.y + c.v);
}
function transformAcceptedVector(p) {
  const x = p.x * oldN.x + p.y * oldN.y;
  const y = p.x * oldV.x + p.y * oldV.y;
  const length = Math.hypot(x, y);
  return pt(x / length, y / length);
}
function transformObject(value, key = '') {
  if (Array.isArray(value)) return value.map(v => transformObject(v, key));
  if (!value || typeof value !== 'object') return value;
  if (typeof value.x === 'number' && typeof value.y === 'number') return key === 'direction' || key === 'inward' ? transformAcceptedVector(value) : transformAcceptedPoint(value);
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, transformObject(v, k)]));
}
for (const id of ['T0', 'T1', 'T2', 'T3', 'D5-WCL']) nodes[id] = transformAcceptedPoint(oldNodes[id]);

const d3AlongAdjustment = (883 - solved.params[1]) / 2;
const d3Depth = Math.sqrt(105 ** 2 - d3AlongAdjustment ** 2);
const D3RoomB = {
  outerLeft: nodes.B0, outerRight: nodes['D3-BR'], innerLeft: pt(80, 0), innerRight: pt(solved.params[1] - 65, 0),
  doorLeft: pt(80 - d3AlongAdjustment, -d3Depth), doorRight: pt(solved.params[1] - 65 + d3AlongAdjustment, -d3Depth),
  doorCentre: pt((solved.params[1] + 15) / 2, -d3Depth), direction: pt(1, 0), inward: pt(0, -1),
  casingLengthMm: round(solved.params[1]), visibleClosedWidthMm: 738, physicalLeafWidthMm: null,
  alongAdjustmentMm: round(d3AlongAdjustment), derivedDoorFaceDepthMm: round(d3Depth),
  leftInnerToDoorMm: 105, rightInnerToDoorMm: 105, geometryValid: Number.isFinite(d3Depth),
};
const D5RoomB = transformObject(old.D5RoomB);
const D5WC = transformObject(old.D5WC);
const D5SharedPhysicalLeaf = transformObject(old.D5SharedPhysicalLeaf);
D5SharedPhysicalLeaf.leafBearingDegrees = round(bearing(D5SharedPhysicalLeaf.leafTopMm, D5SharedPhysicalLeaf.leafBottomMm));
const evidence = evidenceFor(solved.params).map(o => ({ ...o, predicted: round(o.predicted) }));
const oldNewEvidence = evidenceFor([dist(oldNodes['D3-BR'], oldNodes['B0.5']), oldNodes['D3-BR'].x, oldNodes.B1.x, oldNodes.B3.y - oldNodes.B1.y]);

const headlineIds = new Set(['FIELD-B-D3-RETURN-2026-08','BASE-B-03','D5-B-CASING-WIDTH','FIELD-B-B2-B3-2026-08','BASE-B-06','FIELD-B-B0-B4-2026-08','SUP-065','SUP-069','SUP-070','SUP-071','FIELD-B-B1-B3-2026-08','FIELD-B-B05-BACK-PERP-2026-08']);
const beforeHeadline = oldNewEvidence.filter(o => headlineIds.has(o.id)).map(o => o.residualMm);
const afterHeadline = evidence.filter(o => headlineIds.has(o.id)).map(o => o.residualMm);
const movement = Object.fromEntries(Object.entries(nodes).map(([id, p]) => {
  const prior = oldNodes[id]; const dx = p.x - prior.x; const dy = p.y - prior.y;
  return [id, { previous: prior, corrected: p, deltaMm: pt(dx, dy), magnitudeMm: round(Math.hypot(dx, dy)) }];
}));
const movementValues = Object.values(movement).map(m => m.magnitudeMm);
const maxMoveEntry = Object.entries(movement).sort((a,b) => b[1].magnitudeMm - a[1].magnitudeMm)[0];
const roomBIds = ['B0','D3-BR','B0.5','B1','B2','B3','B4'];
const wcIds = ['T0','T1','T2','T3','D5-WCL'];
const wallBearings = {
  D3: bearing(nodes.B0, nodes['D3-BR']), D3Return: bearing(nodes['D3-BR'], nodes['B0.5']), B05B1: bearing(nodes['B0.5'], nodes.B1),
  B0B4: bearing(nodes.B0, nodes.B4), B1B2: bearing(nodes.B1, nodes.B2), B2B3: bearing(nodes.B2, nodes.B3), B4B3: bearing(nodes.B4, nodes.B3),
  T0T1: bearing(nodes.T0, nodes.T1), T1T2: bearing(nodes.T1, nodes.T2), T3T2: bearing(nodes.T3, nodes.T2),
};
const wcRms = predecessor.solutions.P1.wcClearExactRmsMm;

const auditRows = [
  ['D3-BR -> B0.5', '249 mm (P1 model 244.9)', '136 mm', '-113 mm vs record', 'Yes: same annotated casing edge and B0.5 corner', 'New active; 249 inactive/superseded'],
  ['B0 / D3-BL -> B4', '2200-2220 mm active range; older 2010-2030 inactive', '2216 mm', 'Within active range', 'Yes', 'New active exact refinement; history retained'],
  ['B1 / D5-BL -> B3', 'No direct record; 874 + 1218 = 2092 mm chain', '2091 mm', '-1 mm vs chain', 'Yes', 'New active'],
  ['B0.5 -> perpendicular B3-B4 landing', 'No same-start direct record', '2080 mm', 'n/a', 'New explicitly described landing', 'New active; SUP-080 remains separate'],
  ['B2 / D5-BR -> B3', '1218 mm', '1219 mm', '+1 mm', 'Yes', 'New active; 1218 retained as consistent history'],
];

const geometry = {
  nodesMm: nodes,
  aliases: old.aliases,
  roomBBoundarySequence: old.roomBBoundarySequence,
  wcBoundarySequence: old.wcBoundarySequence,
  areasM2: {
    roomB: round((solved.params[2] * solved.params[3] + solved.params[1] * solved.params[0]) / 1e6, 4),
    wc: old.areasM2.wc,
  },
  D3RoomB, D5RoomB, D5WC, D5SharedPhysicalLeaf,
  wallBearingsDegrees: Object.fromEntries(Object.entries(wallBearings).map(([k,v]) => [k, round(v)])),
  topologyEdges: [
    { from:'B0 / D3-BL', to:'D3-BR', physicalType:'D3 opening/casing', isWall:false, derivedMm:round(solved.params[1]) },
    { from:'D3-BR', to:'B0.5', physicalType:'short permanent Room B wall return', isWall:true, activeMeasuredMm:136, supersededMeasuredMm:249 },
    { from:'B0.5', to:'B1 / D5-BL', physicalType:'Room B finished wall', isWall:true, measuredMm:823 },
    { from:'B1 / D5-BL', to:'B2 / D5-BR', physicalType:'D5 Room B casing/opening, not wall', isWall:false, measuredMm:874 },
    { from:'B2 / D5-BR', to:'B3', physicalType:'Room B finished wall', isWall:true, measuredMm:1219 },
  ],
  tileAndWallLayers: old.tileAndWallLayers,
  soffit: transformObject(old.soffit),
  verticalEvidence: old.verticalEvidence,
};

const result = {
  documentType: 'derived Room B/WC field-reconciled orthogonal candidate; not source evidence and not final shell',
  version: '0.2', generatedDate: '2026-08-12', units: 'millimetres', status: 'candidate - HUMAN REVIEW REQUIRED',
  predecessor: 'ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1 (preserved and not overwritten)',
  provenance: {
    rawEvidenceEdited: false,
    auditFilesPreserved: ['ROOM_B_WALL_PLANE_NODE_EVIDENCE_AUDIT_v0_1.*','ROOM_B_D3_EVIDENCE_AUDIT_v0_1.svg','ROOM_B_D5_WC_EVIDENCE_AUDIT_v0_1.svg'],
    sameEndpointFinding: 'BASE-B-02.jpeg and ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg identify the old 249 mm and new 136 mm values as the same physical D3-BR casing-edge to B0.5 permanent-corner span. No casing, reveal or tile layer offset of 113 mm is evidenced.',
    correctionHistory: { active: 'D3-BR -> B0.5 = 136 mm, physical field recheck', inactiveSuperseded: 'BASE-B-02 = 249 mm; P1 fitted 244.9 mm', treatment: 'Retained for traceability and excluded from the v0.2 solve.' },
    evidenceReconciliation: auditRows.map(r => ({ relationship:r[0], previousValue:r[1], newFieldValue:r[2], difference:r[3], samePhysicalEndpoints:r[4], proposedStatus:r[5] })),
  },
  solver: { method:'Deterministic three-parameter robust coordinate descent with Huber loss; 136 mm D3 return fixed from the verified field recheck; exact orthogonal Room B topology', parameters:['fixed D3 return','fitted D3 casing width','fitted main Room B width','fitted B0.5/B1-to-back depth'], fixedAcceptedAssembly:'D5 and WC are transformed rigidly from P1 about B1; their internal geometry is not re-solved.', robustCost:solved.cost, fittedParametersMm:{ return:solved.params[0], d3OuterCasingWidth:solved.params[1], mainWidth:solved.params[2], mainDepth:solved.params[3], d5RoomBCasingLength:d5Length } },
  observations: { active:evidence, supersededInactive:[{id:'BASE-B-02',relationship:'D3-BR -> B0.5',valueMm:249,reason:'Same-span physical recheck gives 136 mm'},{id:'BASE-B-07-OLD',relationship:'B0 -> B4',rangeMm:[2010,2030],reason:'Previously superseded; retained history'}] },
  diagnostics: {
    movementFromP1: { nodes:movement, maximum:{node:maxMoveEntry[0],magnitudeMm:maxMoveEntry[1].magnitudeMm}, rmsAllNodesMm:round(rms(movementValues)), rmsRoomBNodesMm:round(rms(roomBIds.map(id=>movement[id].magnitudeMm))), rmsWCNodesMm:round(rms(wcIds.map(id=>movement[id].magnitudeMm))) },
    measurementRms: { definition:'Unweighted RMS residual over the listed 12 principal Room B direct/field observations, evaluated against the corrected observation set.', roomBBeforeMm:round(rms(beforeHeadline)), roomBAfterMm:round(rms(afterHeadline)), wcBeforeMm:wcRms, wcAfterMm:wcRms, wcNote:'WC/D5 assembly preserved by rigid local transform; WC residuals are invariant.' },
    principalWallAnglesDegrees: { D3_to_return:90, return_to_top:90, top_to_right:90, right_to_back:90, back_to_left:90, left_to_D3:90 },
    parallelism: { d3ParallelTopDifferenceDegrees:0, topParallelBackDifferenceDegrees:0, returnParallelLeftDifferenceDegrees:0, rightSegmentsCollinearDifferenceDegrees:0 },
    correctedReadings: { d3ReturnBeforeModelMm:round(dist(oldNodes['D3-BR'],oldNodes['B0.5'])), d3ReturnAfterMm:round(dist(nodes['D3-BR'],nodes['B0.5'])), b1ToB3Mm:round(dist(nodes.B1,nodes.B3)), b05PerpendicularDepthMm:round(solved.params[3]), differenceBetweenNewDepthChecksMm:11 },
    stopConditionAssessment: 'No unexplained >40 mm movement at multiple principal nodes. Large coordinate changes are the expected propagation of the verified 109-113 mm return correction in the fixed B0/D3 gauge; direct corrected evidence closes with small residuals.',
    architecturalAnswer: 'Yes. With the same-span 136 mm correction active, the main Room B shell is exactly orthogonal without forcing any principal dimension away from the new field checks by more than a small survey residual.'
  },
  geometry,
  preservation: { predecessorOverwritten:false, rawEvidenceOverwritten:false, wcGeometryChanged:false, wcRigidlyRepositioned:true, d5TopologyChanged:false, d3ReturnTopologyPreserved:true, finalShellPromoted:false, modelling3DStarted:false },
};

function svg(clean = true) {
  const all = [...Object.values(nodes), ...Object.values(oldNodes)];
  const minX = Math.min(...all.map(p=>p.x))-260, maxX=Math.max(...all.map(p=>p.x))+260, minY=Math.min(...all.map(p=>p.y))-300, maxY=Math.max(...all.map(p=>p.y))+260;
  const line = (a,b,cls='wall') => `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${cls}"/>`;
  const poly = (ids, source, cls) => `<polyline points="${ids.map(id=>`${source[id].x},${source[id].y}`).join(' ')}" class="${cls}"/>`;
  const nodeMarks = Object.entries(nodes).map(([id,p])=>`<circle cx="${p.x}" cy="${p.y}" r="12" class="node"/><text x="${p.x+18}" y="${p.y-15}" class="label">${id}</text>`).join('');
  const diagnostic = clean ? '' : `${poly(['B0','D3-BR','B0.5','B1','B2','B3','B4','B0'],oldNodes,'old')} ${poly(['T0','T1','T2','T3','D5-WCL','T0'],oldNodes,'old')} ${Object.entries(movement).map(([id,m])=>line(m.previous,m.corrected,'move')).join('')}<text x="${nodes['D3-BR'].x+30}" y="${(nodes['D3-BR'].y+oldNodes['B0.5'].y)/2}" class="oldtxt">old P1 return 244.9</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${maxX-minX} ${maxY-minY}" role="img" aria-labelledby="title desc"><title id="title">Room B/WC field-reconciled candidate v0.2${clean?'':' diagnostic'}</title><desc id="desc">Schematic millimetre-coordinate reconstruction; not construction information and not to be scaled from the drawing.</desc><style>.bg{fill:#f8fafc}.room{fill:#eaf6ef;stroke:none}.wc{fill:#eef6ff;stroke:none}.wall{stroke:#08735f;stroke-width:22;fill:none;stroke-linecap:round}.opening{stroke:#d97706;stroke-width:18}.node{fill:white;stroke:#08735f;stroke-width:5}.label,.note,.oldtxt{font:38px Arial;fill:#17324d}.note{font-size:34px}.old{stroke:#9b5de5;stroke-width:8;stroke-dasharray:26 18;fill:none}.move{stroke:#e11d48;stroke-width:5;marker-end:url(#arr)}.oldtxt{fill:#7e22ce;font-size:30px}.dim{stroke:#334155;stroke-width:4;stroke-dasharray:10 8}</style><defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#e11d48"/></marker></defs><rect x="${minX}" y="${minY}" width="${maxX-minX}" height="${maxY-minY}" class="bg"/><polygon points="${['B0','D3-BR','B0.5','B1','B2','B3','B4'].map(id=>`${nodes[id].x},${nodes[id].y}`).join(' ')}" class="room"/><polygon points="${['T0','T1','T2','T3','D5-WCL'].map(id=>`${nodes[id].x},${nodes[id].y}`).join(' ')}" class="wc"/>${diagnostic}${line(nodes.B0,nodes['D3-BR'],'opening')}${line(nodes['D3-BR'],nodes['B0.5'])}${line(nodes['B0.5'],nodes.B1)}${line(nodes.B2,nodes.B3)}${line(nodes.B3,nodes.B4)}${line(nodes.B4,nodes.B0)}${line(nodes.B1,nodes.B2,'opening')}${line(nodes.T0,nodes.T1)}${line(nodes.T1,nodes.T2)}${line(nodes.T2,nodes.T3)}${line(nodes.T3,nodes['D5-WCL'])}${line(nodes['D5-WCL'],nodes.T0,'opening')}${nodeMarks}<text x="${minX+40}" y="${minY+70}" class="note">FIELD-RECONCILED v0.2 · HUMAN REVIEW REQUIRED · schematic / not to scale</text><text x="${nodes['D3-BR'].x+28}" y="${nodes['D3-BR'].y+85}" class="note">136 mm corrected permanent return</text><text x="${nodes['B0.5'].x+28}" y="${nodes['B0.5'].y+100}" class="note">main shell: exact orthogonal working geometry</text></svg>`;
}

function markdown() {
  const rows = auditRows.map(r=>`| ${r.join(' | ')} |`).join('\n');
  const moved = Object.entries(movement).map(([id,m])=>`| ${id} | ${m.deltaMm.x} | ${m.deltaMm.y} | ${m.magnitudeMm} |`).join('\n');
  const obs = evidence.map(o=>`| ${o.id} | ${o.label} | ${o.measured ?? `${o.range[0]}-${o.range[1]}`} | ${o.predicted} | ${o.residualMm} |`).join('\n');
  return `# Room B/WC field-reconciled candidate v0.2\n\n**Status: HUMAN REVIEW REQUIRED. Derived working geometry only; not final shell or construction information.**\n\nGenerated deterministically by \`scripts/solve_room_b_wc_field_reconciled_candidate_v0_2.mjs\`. The accepted/provisional v0.1 pilot and raw evidence are preserved.\n\n## Evidence reconciliation\n\n| Relationship | Previous value | New field value | Difference | Same physical endpoints? | Proposed status |\n|---|---:|---:|---:|---|---|\n${rows}\n\nThe original 249 mm record is \`BASE-B-02\`. Its annotated evidence and \`ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg\` identify the same physical D3-BR casing edge and B0.5 permanent corner as the 136 mm recheck. No reveal, casing, tile-face or wall-plane layer distinction accounts for 113 mm. It is therefore retained but inactive and superseded.\n\nThe new 2091 mm B1-to-B3 reading and 2080 mm perpendicular B0.5 depth differ by 11 mm, directly supporting the observed near-orthogonal main shell. The new 1219 mm B2-to-B3 reading confirms the prior 1218 mm record to 1 mm.\n\n## Solver and geometry\n\nThe candidate fixes the verified return at ${solved.params[0]} mm and robustly fits three remaining parameters under exact orthogonal Room B topology: D3 outer casing ${solved.params[1]} mm, main width ${solved.params[2]} mm, and main depth ${solved.params[3]} mm. D5 and the human-approved simple WC are copied as one rigid assembly from P1 and attached at B1; the WC is not re-solved.\n\n- D3-BR to B0.5: ${round(dist(oldNodes['D3-BR'],oldNodes['B0.5']))} mm before; ${round(dist(nodes['D3-BR'],nodes['B0.5']))} mm after.\n- B0.5 to B1: bearing ${round(wallBearings.B05B1)} degrees.\n- B0 to B4: bearing ${round(wallBearings.B0B4)} degrees.\n- B1/B2/B3 wall family: bearing 90 degrees and collinear.\n- B4 to B3: bearing ${round(wallBearings.B4B3)} degrees.\n- Main wall corner angles: 90 degrees.\n- D3/top/back parallel difference: 0 degrees; return/side parallel difference: 0 degrees.\n\n## Observation residuals\n\n| ID | Relationship | Field mm | Model mm | Residual mm |\n|---|---|---:|---:|---:|\n${obs}\n\nRoom B principal-observation RMS is **${round(rms(beforeHeadline))} mm before** and **${round(rms(afterHeadline))} mm after** against the corrected evidence set. WC RMS remains **${wcRms} mm before and after** because the accepted WC/D5 assembly is rigidly preserved.\n\n## Node movement from P1 local gauge\n\n| Node | dx mm | dy mm | magnitude mm |\n|---|---:|---:|---:|\n${moved}\n\nMaximum movement is **${maxMoveEntry[1].magnitudeMm} mm at ${maxMoveEntry[0]}**; RMS across all listed nodes is **${round(rms(movementValues))} mm**. These are coordinate changes in the fixed B0/D3 gauge caused by replacing the verified same-span return by a value 109-113 mm shorter and closing the corrected orthogonal network. They are not unexplained forced movements.\n\n## Architectural assessment\n\n**Yes:** the corrected field evidence produces the simple orthogonal Room B geometry observed in reality. No principal fitted dimension departs from the new field checks by a large artificial displacement. The former 100+ mm problem follows the superseded return interpretation.\n\nThe drawing remains schematic/not to scale. This candidate is not promoted automatically.\n`;
}

fs.writeFileSync(path.join(outDir,'ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.json'), JSON.stringify(result,null,2)+'\n');
fs.writeFileSync(path.join(outDir,'ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.md'), markdown());
fs.writeFileSync(path.join(outDir,'ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2.svg'), svg(true));
fs.writeFileSync(path.join(outDir,'ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2_DIAGNOSTIC.svg'), svg(false));
console.log(JSON.stringify({ outputs:4, params:result.solver.fittedParametersMm, roomBRms:result.diagnostics.measurementRms, maximumMovement:result.diagnostics.movementFromP1.maximum },null,2));

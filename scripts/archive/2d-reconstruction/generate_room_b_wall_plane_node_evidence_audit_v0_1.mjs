#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const outputDir = path.join(repoRoot, "docs/survey/derived/room-b-wc");
const stem = "ROOM_B_WALL_PLANE_NODE_EVIDENCE_AUDIT_v0_1";
const sourceRelative = "docs/survey/derived/room-b-wc/ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json";
const currentRelative = "docs/survey/derived/global-reconciliation/WHOLE_FLAT_HUMAN_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_2.json";
const source = JSON.parse(fs.readFileSync(path.join(repoRoot, sourceRelative), "utf8"));
const current = JSON.parse(fs.readFileSync(path.join(repoRoot, currentRelative), "utf8"));

if (source.version !== "0.1" || source.selection?.selectedSolutionId !== "P1") {
  throw new Error("Expected accepted Room B/WC P1 baseline v0.1.");
}
if (current.version !== "0.2") throw new Error("Expected whole-flat human-constrained v0.2 context.");

const sha256 = (relative) => crypto.createHash("sha256").update(fs.readFileSync(path.join(repoRoot, relative))).digest("hex").toUpperCase();
const round = (value, digits = 2) => Math.round(value * 10 ** digits) / 10 ** digits;
const hypot = (a, b) => Math.hypot(a, b);
const generatedDate = "2026-08-12";

const lengths = {
  d3OuterCasingDerivedMm: 857.05,
  returnMm: 249,
  topWallMm: 823,
  d5RoomBCasingMm: 874,
  rightWallMm: 1218,
  backTileFaceMm: 1665,
  leftWallRangeMm: [2200, 2220],
};
const orthogonalChecks = {
  widthExpectedFromD3PlusTopMm: lengths.d3OuterCasingDerivedMm + lengths.topWallMm,
  widthObservedBackTileFaceMm: lengths.backTileFaceMm,
  widthClosureMm: lengths.d3OuterCasingDerivedMm + lengths.topWallMm - lengths.backTileFaceMm,
  depthExpectedFromReturnPlusRightChainMm: lengths.returnMm + lengths.d5RoomBCasingMm + lengths.rightWallMm,
  depthObservedLeftRangeMm: lengths.leftWallRangeMm,
  depthClosureRangeMm: [
    lengths.returnMm + lengths.d5RoomBCasingMm + lengths.rightWallMm - lengths.leftWallRangeMm[1],
    lengths.returnMm + lengths.d5RoomBCasingMm + lengths.rightWallMm - lengths.leftWallRangeMm[0],
  ],
  b0ToB05ExpectedMm: hypot(lengths.d3OuterCasingDerivedMm, lengths.returnMm),
  b05ToB2ExpectedMm: hypot(lengths.topWallMm, lengths.d5RoomBCasingMm),
  b05ToB3ExpectedMm: hypot(lengths.topWallMm, lengths.d5RoomBCasingMm + lengths.rightWallMm),
  b2ToB4ExpectedMm: hypot(lengths.backTileFaceMm, lengths.rightWallMm),
  b1ToB4ExpectedMm: hypot(lengths.backTileFaceMm, lengths.d5RoomBCasingMm + lengths.rightWallMm),
  b0ToB2ExpectedMm: hypot(lengths.d3OuterCasingDerivedMm + lengths.topWallMm, lengths.returnMm + lengths.d5RoomBCasingMm),
  b0ToB3ExpectedMm: hypot(lengths.d3OuterCasingDerivedMm + lengths.topWallMm, lengths.returnMm + lengths.d5RoomBCasingMm + lengths.rightWallMm),
  d3BRToBackWallExpectedMm: lengths.returnMm + lengths.d5RoomBCasingMm + lengths.rightWallMm,
};

const nodeClassifications = [
  { node: "B0", aliases: ["D3-BL"], currentRole: "Permanent Room B endpoint and D3 object-edge alias", physicalLayer: "Finished plaster wall endpoint coincident with viewer-left Room B outer casing edge", confidence: "high", evidence: ["NODE_REFERENCE_REGISTER_R5", "BASE-B-01.jpeg", "ROOM_B_EVIDENCE_v1"], potentialIssue: "Composite wall/casing target. Rechecks must state whether the laser datum is the wall face, casing face or D3 reveal/door face." },
  { node: "D3-BR", aliases: [], currentRole: "Room B outer casing edge and start of the real 249 mm return", physicalLayer: "Viewer-right D3 outer casing edge at the finished return junction", confidence: "high topology; medium plane equivalence", evidence: ["BASE-B-02.jpeg", "ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg", "D3-ROOM-B.jpeg"], potentialIssue: "D3 has measured 65/105 mm stepped casing-to-door layers. A casing-face or door-face datum swap is of the same order as the unexplained depth discrepancy." },
  { node: "B0.5", aliases: [], currentRole: "Permanent lower return corner", physicalLayer: "Finished plaster wall corner where the 249 mm return turns onto B0.5→B1", confidence: "high", evidence: ["ROOM_B_WC_NODE_REFERENCE_ADDENDUM_v1", "BASE-B-02.jpeg", "ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg"], potentialIssue: "Not a D3 casing point and not collinear with D3-BR. Its exact finish plane should be used for a direct wall-to-back-wall recheck." },
  { node: "B1", aliases: ["D5-BL"], currentRole: "Permanent wall endpoint and Room B D5 outer-casing alias", physicalLayer: "Finished plaster wall endpoint coincident with viewer-left Room B outer casing edge", confidence: "high topology; medium plane equivalence", evidence: ["BASE-B-03.jpeg", "D5-ROOM-B.jpeg", "NODE_REFERENCE_REGISTER_R5"], potentialIssue: "Composite wall/casing point; the outer casing direction is not automatically a structural wall plane." },
  { node: "B2", aliases: ["D5-BR"], currentRole: "Permanent wall endpoint and Room B D5 outer-casing alias", physicalLayer: "Viewer-right outer casing edge meeting the tiled finished face at a local cutaway", confidence: "high identity; medium common-plane use", evidence: ["BASE-B-04.jpeg", "D5-ROOM-B-20MM-CUTAWAY-TILES&DOOR.jpeg", "ROOM_B_EVIDENCE_v1"], potentialIssue: "Explicit mixed casing/tile target with approximately 20 mm cutaway. It must not silently stand for an underlying structural wall plane." },
  { node: "B3", aliases: [], currentRole: "Permanent lower-right Room B corner", physicalLayer: "Finished tiled corner joining B2→B3 and the B3→B4 visible tile face", confidence: "high topology; medium structural-plane equivalence", evidence: ["BASE-B-05", "BASE-B-06", "ROOM_B_EVIDENCE_v1"], potentialIssue: "Permanent corner does not mean structural-face datum; the underlying wall is recorded approximately 10 mm behind the visible tile face." },
  { node: "B4", aliases: [], currentRole: "Permanent lower-left Room B corner", physicalLayer: "Finished corner at the back/tiled wall and B0→B4 side wall", confidence: "high topology; low-to-medium measurement accessibility", evidence: ["BASE-B-06", "BASE-B-07", "RoomB-WestWall.jpeg"], potentialIssue: "The direct B4→B0 shot was shower-screen-obstructed and has already undergone a large correction. Tile build-up and target height must be recorded on recheck." },
  { node: "T0", aliases: ["D5-WCR"], currentRole: "Permanent WC wall endpoint and viewer-right WC outer-casing alias", physicalLayer: "WC finished plaster wall/casing junction on the opposite face of D5", confidence: "high", evidence: ["BASE-WC-05.jpeg", "D5-WC.jpeg", "ROOM_WC_EVIDENCE_v1"], potentialIssue: "Distinct from B1. The B1↔T0 interval is assembly depth, not wall and not a shared node." },
  { node: "T3", aliases: [], currentRole: "Permanent WC return corner", physicalLayer: "Finished plaster corner before the 173 mm wall run to D5-WCL", confidence: "high", evidence: ["BASE-WC-03", "BASE-WC-04", "NODE_REFERENCE_REGISTER_R5"], potentialIssue: "Earlier diagrams used shared-corner shorthand with B2; it is not coincident with B2." },
  { node: "D5-BL", aliases: ["B1"], currentRole: "Viewer-left Room B outer casing edge", physicalLayer: "Door-object edge coincident with the B1 finished-wall endpoint", confidence: "high", evidence: ["BASE-B-03.jpeg", "D5-ROOM-B.jpeg"], potentialIssue: "Alias is physical coincidence, not permission to merge outer casing, inner frame, reveal and structural wall layers." },
  { node: "D5-BR", aliases: ["B2"], currentRole: "Viewer-right Room B outer casing edge", physicalLayer: "Door-object edge coincident with the B2 tile/casing junction", confidence: "high identity; medium plane equivalence", evidence: ["BASE-B-04.jpeg", "D5-ROOM-B-20MM-CUTAWAY-TILES&DOOR.jpeg"], potentialIssue: "Highest-risk D5 endpoint because the local 20 mm cutaway and tile trim make the normal wall-plane offset explicit." },
  { node: "D5-WCL", aliases: [], currentRole: "Viewer-left WC outer casing edge", physicalLayer: "WC-side casing edge after the 173 mm T3 wall segment", confidence: "high", evidence: ["D5-WC.jpeg", "ROOM_WC_EVIDENCE_v1"], potentialIssue: "Separate from B2/D5-BR; opposite-face separation is derived, not a zero-length alias." },
  { node: "D5-WCR", aliases: ["T0"], currentRole: "Viewer-right WC outer casing edge", physicalLayer: "WC-side casing edge coincident with the T0 finished-wall endpoint", confidence: "high", evidence: ["BASE-WC-05.jpeg", "D5-WC.jpeg"], potentialIssue: "Separate from B1/D5-BL across the D5 assembly depth." },
];

const measurements = [
  { id: "BASE-B-02", endpoints: ["D3-BR", "B0.5"], reading: "249 mm", evidenceClass: "high-confidence baseline", endpointLayers: ["D3 outer casing/return junction", "finished plaster return corner"], capture: "Direct node-to-node field reading; exact instrument contact plane not recorded", shellUse: "Constrains the real short return, but not a structural-wall centreline", concern: "One endpoint is casing-derived" },
  { id: "BASE-B-03", endpoints: ["B0.5", "B1 / D5-BL"], reading: "823 mm", evidenceClass: "high-confidence baseline", endpointLayers: ["finished plaster corner", "finished wall/outer casing junction"], capture: "Clear direct baseline", shellUse: "Best measured candidate for the upper finished-wall run", concern: "Terminates on outer casing rather than an independent structural target" },
  { id: "D5-B-CASING-WIDTH", endpoints: ["B1 / D5-BL", "B2 / D5-BR"], reading: "874 mm", evidenceClass: "high-confidence door object", endpointLayers: ["Room B outer casing edge", "Room B outer casing edge at tile cutaway"], capture: "Across Room B outer casing face", shellUse: "Constrains D5 object width; only a virtual alignment may cross the opening", concern: "Object face, not permanent wall; B2 has a 20 mm cutaway" },
  { id: "BASE-B-05", endpoints: ["B2 / D5-BR", "B3"], reading: "1218 mm", evidenceClass: "high-confidence baseline", endpointLayers: ["outer casing/tiled-face junction with cutaway", "finished tiled corner"], capture: "Recorded only as a clear direct baseline reading; stance, target height and instrument contact faces are not documented", shellUse: "Strongly constrains the local finished/tiled wall length if both targets used the same visible face. It should not alone define the underlying structural plane.", concern: "Mixed casing/tile start. The rejected exact trial shortened this span to 1173.72 mm, changing residual from -1.22 to -44.28 mm; the raw 1218 mm remains unchanged." },
  { id: "BASE-B-06", endpoints: ["B3", "B4"], reading: "1665 mm", evidenceClass: "high-confidence baseline, tile face", endpointLayers: ["finished tiled corner", "finished tiled corner"], capture: "Visible tile-face measurement", shellUse: "Constrains finished back-wall width", concern: "Underlying wall is recorded about 10 mm behind the target at each end" },
  { id: "BASE-B-07", endpoints: ["B4", "B0 / D3-BL"], reading: "approximately 2200–2220 mm", evidenceClass: "low-confidence approximate range", endpointLayers: ["finished/tiled corner", "finished wall/outer D3 casing junction"], capture: "Direct field recheck obstructed by shower screen", shellUse: "Only approximate left-side finished-boundary depth", concern: "Primary suspect: difficult shot and previous inactive range was 2010–2030 mm" },
  { id: "SUP-065", endpoints: ["B0 / D3-BL", "B0.5"], reading: "888 mm", evidenceClass: "high-confidence node-to-node", endpointLayers: ["D3 casing/wall junction", "finished plaster corner"], capture: "Clear reading", shellUse: "Checks the D3 span/return triangle", concern: "Composite D3 endpoint" },
  { id: "SUP-066", endpoints: ["B0 / D3-BL", "B2 / D5-BR"], reading: "approximately 1952 mm", evidenceClass: "low-confidence approximate", endpointLayers: ["D3 casing/wall junction", "D5 casing/tile junction"], capture: "Difficult laser shot", shellUse: "Context only", concern: "Both endpoints are composite and the shot is approximately 69 mm shorter than the simple orthogonal chain" },
  { id: "SUP-067", endpoints: ["B0 / D3-BL", "B3"], reading: "2755–2765 mm", evidenceClass: "medium-confidence measured range", endpointLayers: ["D3 casing/wall junction", "finished tiled corner"], capture: "Human-confirmed range", shellUse: "Strong discriminator for D3-side-to-back-corner depth", concern: "Approximately 116–126 mm shorter than the raw orthogonal chain" },
  { id: "SUP-068", endpoints: ["B0.5", "B2 / D5-BR"], reading: "1182–1190 mm", evidenceClass: "medium-confidence measured range", endpointLayers: ["finished plaster corner", "D5 casing/tile junction"], capture: "Measured range", shellUse: "Tests the B0.5–B1–B2 corner", concern: "Simple right-angle prediction is 1200.50 mm, 10.50–18.50 mm longer" },
  { id: "SUP-069", endpoints: ["B0.5", "B3"], reading: "2228 mm", evidenceClass: "high-confidence node-to-node", endpointLayers: ["finished plaster corner", "finished tiled corner"], capture: "Clear reading", shellUse: "Constrains the top-corner-to-back-corner diagonal", concern: "Simple orthogonal right-chain prediction is 2248.06 mm, 20.06 mm longer" },
  { id: "SUP-070", endpoints: ["B1 / D5-BL", "B4"], reading: "2673 mm", evidenceClass: "high-confidence node-to-node", endpointLayers: ["wall/outer casing junction", "finished/tiled corner"], capture: "Clear reading", shellUse: "Strong orthogonality discriminator", concern: "Simple orthogonal prediction is 2673.70 mm: exceptionally close despite mixed layers" },
  { id: "SUP-071", endpoints: ["B2 / D5-BR", "B4"], reading: "2046 mm", evidenceClass: "high-confidence corrected node-to-node", endpointLayers: ["D5 casing/tile junction", "finished/tiled corner"], capture: "Authoritative field recheck", shellUse: "Tests the B2–B3–B4 corner", concern: "Simple right-angle prediction is 2062.95 mm, 16.95 mm longer" },
  { id: "SUP-080", endpoints: ["D3-BR", "unmarked perpendicular landing on B3–B4"], reading: "2217 mm", evidenceClass: "medium-confidence wall-face validation", endpointLayers: ["D3 outer casing/return junction", "general finished tile face"], capture: "Field recheck; landing spot was not permanently marked", shellUse: "Validation only", concern: "Accepted P1 predicts 2296.47 mm (+79.47); raw orthogonal depth chain predicts 2341 mm (+124)" },
  { id: "VALIDATION-3726", endpoints: ["Room C outer partition face", "D3-normal landing on B3–B4"], reading: "3726 mm", evidenceClass: "independent global validation", endpointLayers: ["Room C outer partition face", "Room B finished back-wall face"], capture: "Through D3 along the registered D3 normal", shellUse: "Validates back-wall station near the D3 centreline, not room squareness or either back corner", concern: "Current v0.2 predicts 3741.07 mm, only +15.07 mm; this resists moving the whole back wall about 100 mm" },
];

const closures = [
  { id: "LOOP-WIDTH", expression: "857.05 + 823 versus 1665", expectedMm: 1680.05, observed: "1665 mm", closure: "+15.05 mm", interpretation: "Good closure for mixed D3 casing, plaster wall and tiled back-wall layers; supports an orthogonal width family within documented finish offsets." },
  { id: "LOOP-DEPTH", expression: "249 + 874 + 1218 versus 2200–2220", expectedMm: 2341, observed: "2200–2220 mm", closure: "+121 to +141 mm", interpretation: "Dominant conflict. Too large for the documented approximately 10–20 mm finish offsets." },
  { id: "LOOP-B0-B05", expression: "sqrt(857.05² + 249²) versus SUP-065", expectedMm: round(orthogonalChecks.b0ToB05ExpectedMm), observed: "888 mm", closure: "+4.49 mm", interpretation: "Strongly supports the D3 span/return right-angle interpretation, subject to the derived 857.05 mm casing span." },
  { id: "LOOP-B05-B2", expression: "sqrt(823² + 874²) versus SUP-068", expectedMm: round(orthogonalChecks.b05ToB2ExpectedMm), observed: "1182–1190 mm", closure: "+10.50 to +18.50 mm", interpretation: "Near-orthogonal locally; plausible finish/casing contribution." },
  { id: "LOOP-B05-B3", expression: "sqrt(823² + (874+1218)²) versus SUP-069", expectedMm: round(orthogonalChecks.b05ToB3ExpectedMm), observed: "2228 mm", closure: "+20.06 mm", interpretation: "Moderate tension, much smaller than the left/depth conflict." },
  { id: "LOOP-B2-B4", expression: "sqrt(1665² + 1218²) versus SUP-071", expectedMm: round(orthogonalChecks.b2ToB4ExpectedMm), observed: "2046 mm", closure: "+16.95 mm", interpretation: "Near-orthogonal B3 corner with possible tile/casing offsets." },
  { id: "LOOP-B1-B4", expression: "sqrt(1665² + (874+1218)²) versus SUP-070", expectedMm: round(orthogonalChecks.b1ToB4ExpectedMm), observed: "2673 mm", closure: "+0.70 mm", interpretation: "Very strong support for the local right-chain/back-wall orthogonal relationship." },
  { id: "LOOP-B0-B3", expression: "sqrt((857.05+823)² + (249+874+1218)²) versus SUP-067", expectedMm: round(orthogonalChecks.b0ToB3ExpectedMm), observed: "2755–2765 mm", closure: "+116.47 to +126.47 mm", interpretation: "Repeats the depth conflict from an independent diagonal starting at the D3-side composite node." },
  { id: "LOOP-D3BR-BACK", expression: "249 + 874 + 1218 versus SUP-080", expectedMm: 2341, observed: "2217 mm", closure: "+124 mm", interpretation: "Numerically echoes the depth conflict, but SUP-080 uses an unmarked general landing and is validation-grade." },
];

const rechecks = [
  { priority: 1, from: "B0 / D3-BL", to: "B4", existing: "BASE-B-07: approximately 2200–2220 mm", why: "Remove the shower-screen obstruction and repeat at a documented height on explicit finished faces.", resolves: "Directly tests the 121–141 mm depth closure and the most weakly captured baseline." },
  { priority: 2, from: "B1 / D5-BL", to: "B3", existing: "No direct total; chain is 874 + 1218 = 2092 mm", why: "Measure the full D5-plus-wall station in one shot or with a marked straightedge, while recording casing versus tile contact.", resolves: "Tests whether B1–B2–B3 really forms one straight physical datum and whether BASE-B-05 shares the D5 casing layer." },
  { priority: 3, from: "B0.5", to: "Marked perpendicular landing on B3–B4", existing: "No direct named-node wall span", why: "Uses a pure finished-wall corner rather than a D3 casing start; mark the landing and its offset from B3.", resolves: "Separates main-shell depth from D3 casing/reveal-layer uncertainty." },
  { priority: 4, from: "D3-BR", to: "Marked perpendicular landing on B3–B4", existing: "SUP-080: 2217 mm", why: "Repeat with both spots marked and record the landing fraction/offset along B3–B4.", resolves: "Determines whether the current +79.47 mm residual is endpoint ambiguity or genuine shell skew." },
  { priority: 5, from: "B2 / D5-BR", to: "B3", existing: "BASE-B-05: 1218 mm", why: "Repeat at a recorded height and state whether the start touches outer casing, metal trim, tile face or plaster cutaway.", resolves: "Confirms the observation that most strongly resists the rejected strict candidate." },
  { priority: 6, from: "B0.5", to: "B2 / D5-BR and B3", existing: "SUP-068: 1182–1190 mm; SUP-069: 2228 mm", why: "Recheck as a paired set without moving the B0.5 datum and document the B2 material layer.", resolves: "Tests the approximately 2.9° incompatible angular signal across the straight B1–B2–B3 assumption." },
  { priority: 7, from: "B0 / D3-BL", to: "B3", existing: "SUP-067: 2755–2765 mm", why: "Repeat the diagonal from the photographed outer wall/casing junction, not the door face or reveal.", resolves: "Checks the independent 116–126 mm shortfall predicted by the raw orthogonal chain." },
  { priority: 8, from: "B1 / D5-BL and B2 / D5-BR", to: "T0 / D5-WCR and D5-WCL respectively", existing: "Derived opposite-face separations: about 120.7 mm and 120.5 mm", why: "Measure both jamb-face separations at matched heights and name outer-casing versus finished-wall contacts.", resolves: "Confirms that opposite D5 faces are paired correctly and that no WC-face alias has leaked into Room B shell constraints." },
];

const interpretations = [
  { id: "A", title: "Current measured shell is genuinely skewed", supports: ["BASE-B-07 short left depth", "SUP-067 B0→B3 range", "SUP-080 short D3-BR-to-back-wall span", "current 3726 validation is only +15.07 mm"], contradicts: ["Width loop closes within 15.05 mm", "SUP-070 is within 0.70 mm of a simple orthogonal chain", "photographs and both plans read as a simple orthogonal room"], assumptions: ["D3/casing aliases correctly represent the intended finished boundary", "The correlated depth observations are not sharing one layer/targeting bias"], discriminator: "Priorities 1, 3 and 4: clean left depth plus two marked wall-to-wall spans." },
  { id: "B", title: "Orthogonal architectural shell with offset finish/object nodes", supports: ["Photographic visual reading", "15.05 mm width closure", "near-right-angle B0–B0.5, B0.5–B2, B2–B4 loops", "SUP-070 0.70 mm closure"], contradicts: ["121–141 mm depth closure", "SUP-067 is 116–126 mm short", "SUP-080 is 124 mm short against the raw orthogonal chain", "known tile/cutaway offsets are only about 10–20 mm"], assumptions: ["One or more D3/D5 composite aliases or depth measurements use a different face", "The undocumented offset is substantially larger than tile thickness"], discriminator: "Priorities 2, 3, 5 and 8, with physical faces written beside every endpoint." },
  { id: "C", title: "Mostly orthogonal main shell, but D3-side datum is on a different station/layer", supports: ["The conflict clusters in observations starting at B0/D3-BR or comparing the left depth", "D3 has documented 105 mm casing-to-door-face steps", "The unexplained scale is roughly 80–140 mm, comparable to a jamb/reveal datum rather than tile thickness", "Right-side and width loops close much better"], contradicts: ["Photographs label B0 and D3-BR at outer casing/wall junctions", "No raw record explicitly says the disputed shots used the door face", "3726 validates the current back-wall station but not the precise local start layer"], assumptions: ["At least one recorded start or model use differs from the photographed sticky-note target", "The main shell may be orthogonal even if the D3 object/return datum is locally stepped"], discriminator: "Priority 3 compared directly with priority 4, plus explicit D3 outer-casing-to-door-face offsets at the same height." },
];

const audit = {
  documentType: "ROOM B WALL-PLANE / NODE EVIDENCE AUDIT",
  version: "0.1",
  generatedDate,
  status: "EVIDENCE AUDIT ONLY — HUMAN REVIEW REQUIRED — NO GEOMETRY CHANGE",
  units: "millimetres unless stated otherwise",
  scope: { geometrySolved: false, nodesMoved: false, optimisationRun: false, sourceEvidenceModified: false, constrainedWholeFlatModelModified: false },
  sourceGeometryContext: {
    acceptedRoomBWC: { relativePath: sourceRelative, sha256: sha256(sourceRelative), use: "diagram orientation and existing evidence/residual context only" },
    currentWholeFlatCandidate: { relativePath: currentRelative, sha256: sha256(currentRelative), use: "current residual and 3726 validation context only" },
  },
  evidenceReviewed: {
    documents: [
      "docs/survey/ROOM_B_EVIDENCE_v1.md", "docs/survey/ROOM_WC_EVIDENCE_v1.md", "docs/survey/ROOM_B_WC_NODE_REFERENCE_ADDENDUM_v1.md",
      "docs/survey/ROOM_B_WC_RECONSTRUCTION_BRIEF_v1.md", "docs/survey/NODE_REFERENCE_REGISTER_R5.md",
      "docs/survey/derived/room-b-wc/ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.md", sourceRelative, currentRelative,
      "source-material/videos/FlatWalkWithCommentary.srt",
    ],
    photographs: [
      "BASE-B-01.jpeg", "BASE-B-02.jpeg", "BASE-B-03.jpeg", "BASE-B-04.jpeg", "BASE-WC-05.jpeg", "D3-ROOM-B.jpeg", "D5-ROOM-B.jpeg",
      "D5-ROOM-B-20MM-CUTAWAY-TILES&DOOR.jpeg", "D5-WC.jpeg", "ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg",
      "RoomB-NorthWall.jpeg", "RoomB-SouthWall.jpeg", "RoomB-EastWall.jpeg", "RoomB-WestWall.jpeg", "RoomB-ToiletRoom.jpeg",
    ],
    plans: ["source-material/plans/rough-paint-sketch.jpg", "source-material/plans/2dPlan.jpeg"],
    videoFrameStatus: "Walkthrough transcript reviewed. No claim is made for unsampled MP4 frames because a local frame decoder was unavailable.",
  },
  preservedTopology: {
    roomBSequence: ["B0 / D3-BL", "D3-BR", "B0.5", "B1 / D5-BL", "B2 / D5-BR", "B3", "B4", "B0"],
    d3Return: "D3-BR→B0.5 is a real short return; B0.5 is a real corner.",
    d5: "B1→B2 is the Room B D5 opening/casing face; B2→B3 is wall. T0→D5-WCL is the WC D5 opening/casing face; T3→D5-WCL is wall. No wall is inferred through D5.",
    oppositeFaces: "Room B and WC D5 nodes remain distinct except the documented same-face aliases B1=D5-BL, B2=D5-BR and T0=D5-WCR.",
  },
  headlineFinding: "Known 10–20 mm finish offsets can explain the small width and local diagonal closures, but cannot explain the 121–141 mm depth closure. The conflict clusters around D3/B0-started depth evidence and the low-confidence B0→B4 measurement. A D3 casing/reveal datum mismatch is the leading layer hypothesis; genuine skew remains viable until targeted rechecks are made.",
  nodeClassifications,
  diagnosticMeasurements: measurements,
  closureAnalysis: { inputs: lengths, calculations: Object.fromEntries(Object.entries(orthogonalChecks).map(([key, value]) => [key, Array.isArray(value) ? value.map((item) => round(item)) : round(value)])), loops: closures },
  rejectedStrictTrialContext: { status: "not applied", movementsMm: { B2: 43.31, B3: 111.55, B4: 118.89 }, baseB05ResidualBeforeMm: -1.22, baseB05ResidualTrialMm: -44.28, roomBRmsBeforeMm: 14.09, roomBRmsTrialMm: 19.59, validation3726Before: { modelMm: 3741.07, residualMm: 15.07 }, validation3726Trial: { modelMm: 3755.15, residualMm: 29.15 } },
  competingInterpretations: interpretations,
  fieldRechecks: rechecks,
  conclusion: {
    mostLikelyCause: "A composite physical-datum mismatch around the D3-side casing/return and left-depth observations, amplified by the low-confidence BASE-B-07 capture. The documented 10–20 mm tile/cutaway layers are secondary and cannot alone generate the 60–120 mm correction. The approximately 105 mm D3 casing-to-door-face step makes an unrecorded D3 start-plane swap the leading specific hypothesis, not a confirmed correction.",
    suspectRanking: ["BASE-B-07 endpoint/capture", "SUP-080 unmarked landing and D3-BR start plane", "B0/D3-BL and D3-BR composite casing-versus-wall datum", "SUP-067 B0→B3", "B2/D5-BR mixed casing/tile cutaway and BASE-B-05 target height", "SUP-068/SUP-069 paired diagonal consistency", "B3/B4 tile-face versus underlying wall plane"],
    minimumRecheckSet: rechecks.slice(0, 5).map((item) => item.priority),
  },
};

const escapeXml = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const svgHeader = (title, subtitle, width = 1800, height = 1200) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title><desc id="desc">${escapeXml(subtitle)}</desc>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#475569"/></marker>
    <style>
      .title{font:700 31px Arial,sans-serif;fill:#0f172a}.sub{font:16px Arial,sans-serif;fill:#475569}.h{font:700 20px Arial,sans-serif;fill:#0f172a}.t{font:15px Arial,sans-serif;fill:#1e293b}.small{font:13px Arial,sans-serif;fill:#334155}.tiny{font:11px Arial,sans-serif;fill:#475569}.wall{stroke:#1e3a8a;stroke-width:9;fill:none;stroke-linecap:round;stroke-linejoin:round}.tile{stroke:#0f766e;stroke-width:11;fill:none;stroke-linecap:round}.opening{stroke:#c2410c;stroke-width:7;fill:none;stroke-dasharray:12 9}.assembly{stroke:#7c3aed;stroke-width:4;fill:none;stroke-dasharray:8 7}.dim{stroke:#475569;stroke-width:2;fill:none;marker-start:url(#arrow);marker-end:url(#arrow)}.diag{stroke:#64748b;stroke-width:2;fill:none;stroke-dasharray:7 7}.suspect{stroke:#dc2626;stroke-width:3;fill:none;stroke-dasharray:9 7}.node{fill:#fff;stroke:#1d4ed8;stroke-width:4}.mixed{fill:#fff;stroke:#7c3aed;stroke-width:5}.wc{fill:#fff;stroke:#047857;stroke-width:4}.box{fill:#fff;stroke:#cbd5e1;stroke-width:2}.warn{fill:#fff7ed;stroke:#ea580c;stroke-width:2}.bad{fill:#fef2f2;stroke:#dc2626;stroke-width:2}.good{fill:#f0fdf4;stroke:#16a34a;stroke-width:2}
    </style>
  </defs>
  <rect width="100%" height="100%" fill="#f8fafc"/><text x="55" y="58" class="title">${escapeXml(title)}</text><text x="55" y="88" class="sub">${escapeXml(subtitle)}</text>`;
const svgFooter = `</svg>\n`;
const textLines = (x, y, lines, klass = "t", step = 21) => lines.map((line, index) => `<text x="${x}" y="${y + index * step}" class="${klass}">${escapeXml(line)}</text>`).join("\n");

const nodes = source.selectedGeometry.nodesMm;
const mainTransform = (id) => ({ x: 150 + (nodes[id].x + 120) * 0.39, y: 205 + nodes[id].y * 0.39 });
const mp = Object.fromEntries(Object.keys(nodes).map((id) => [id, mainTransform(id)]));
const edge = (a, b, klass) => `<path d="M ${mp[a].x} ${mp[a].y} L ${mp[b].x} ${mp[b].y}" class="${klass}"/>`;
const circle = (id, klass = "node") => `<circle cx="${mp[id].x}" cy="${mp[id].y}" r="8" class="${klass}"/>`;
const nodeLabel = (id, label, dx, dy, klass = "small") => `<text x="${mp[id].x + dx}" y="${mp[id].y + dy}" class="${klass}" font-weight="700">${escapeXml(label)}</text>`;
const diag = (a, b, label, dx = 0, dy = 0, suspect = false) => {
  const midX = (mp[a].x + mp[b].x) / 2 + dx; const midY = (mp[a].y + mp[b].y) / 2 + dy;
  return `<path d="M ${mp[a].x} ${mp[a].y} L ${mp[b].x} ${mp[b].y}" class="${suspect ? "suspect" : "diag"}"/><rect x="${midX - 95}" y="${midY - 15}" width="190" height="22" rx="5" fill="#f8fafc" opacity=".94"/><text x="${midX}" y="${midY + 1}" class="tiny" text-anchor="middle">${escapeXml(label)}</text>`;
};

const mainSvg = `${svgHeader("Room B wall-plane / node evidence audit v0.1", "FIELD SHEET — accepted P1 layout for orientation only; no new geometry; not for setting out", 1800, 1600)}
  <rect x="55" y="115" width="1080" height="1075" rx="14" class="box"/><text x="85" y="150" class="h">Main Room B evidence network</text>
  ${edge("B0", "D3-BR", "opening")}${edge("D3-BR", "B0.5", "wall")}${edge("B0.5", "B1", "wall")}${edge("B1", "B2", "opening")}${edge("B2", "B3", "tile")}${edge("B3", "B4", "tile")}${edge("B4", "B0", "wall")}
  ${edge("B1", "T0", "assembly")}${edge("T0", "D5-WCL", "opening")}${edge("D5-WCL", "T3", "wall")}
  ${diag("B0", "B0.5", "SUP-065 — B0→B0.5 — 888 mm", -30, -20)}
  ${diag("B0.5", "B2", "SUP-068 — B0.5→B2 — 1182–1190 mm", 65, -28)}
  ${diag("B0.5", "B3", "SUP-069 — B0.5→B3 — 2228 mm", 80, 0)}
  ${diag("B1", "B4", "SUP-070 — B1→B4 — 2673 mm", -90, -2)}
  ${diag("B2", "B4", "SUP-071 — B2→B4 — 2046 mm", 25, 35)}
  ${diag("B0", "B3", "SUP-067 — B0→B3 — 2755–2765 mm", -10, 48, true)}
  ${["B0","D3-BR","B0.5","B1","B2","B3","B4"].map((id) => circle(id, ["B1","B2","B0"].includes(id) ? "mixed" : "node")).join("")}
  ${circle("T0", "wc")}${circle("D5-WCL", "wc")}${circle("T3", "wc")}
  ${nodeLabel("B0", "B0 / D3-BL", -45, -18)}${nodeLabel("D3-BR", "D3-BR", -20, -18)}${nodeLabel("B0.5", "B0.5", -25, 31)}${nodeLabel("B1", "B1 / D5-BL", -95, -18)}${nodeLabel("B2", "B2 / D5-BR", -120, 28)}${nodeLabel("B3", "B3", 14, 5)}${nodeLabel("B4", "B4", -42, 5)}${nodeLabel("T0", "T0 / D5-WCR", 15, -12)}${nodeLabel("D5-WCL", "D5-WCL", 14, 7)}${nodeLabel("T3", "T3", 14, 7)}
  <rect x="260" y="160" width="260" height="28" rx="6" fill="#fff7ed"/><text x="390" y="179" class="small" text-anchor="middle">D3 opening/casing — no wall</text>
  <text x="560" y="288" class="small" text-anchor="middle">BASE-B-02 — D3-BR→B0.5 — 249 mm</text>
  <text x="750" y="235" class="small" text-anchor="middle">BASE-B-03 — B0.5→B1 — 823 mm</text>
  <text x="850" y="500" class="small" transform="rotate(93 850 500)" text-anchor="middle">D5-B-CASING-WIDTH — B1→B2 — 874 mm — OPENING</text>
  <text x="815" y="890" class="small" transform="rotate(93 815 890)" text-anchor="middle">BASE-B-05 — B2→B3 — 1218 mm</text>
  <text x="480" y="1115" class="small" transform="rotate(3 480 1115)" text-anchor="middle">BASE-B-06 — B3→B4 — 1665 mm — visible tile face</text>
  <text x="155" y="730" class="small" transform="rotate(93 155 730)" text-anchor="middle">BASE-B-07 — B4→B0 — approx 2200–2220 mm — RECHECK</text>
  <rect x="1165" y="115" width="580" height="230" rx="14" class="bad"/><text x="1195" y="153" class="h">Dominant closure conflict</text>
  ${textLines(1195,185,["Width: 857.05 + 823 = 1680.05 mm", "Back tile face: 1665 mm", "Closure: +15.05 mm  ✓ plausible finish layers", "", "Depth: 249 + 874 + 1218 = 2341 mm", "Left side: 2200–2220 mm", "Closure: +121 to +141 mm  ✕ not tile thickness"],"t",23)}
  <rect x="1165" y="370" width="580" height="220" rx="14" class="good"/><text x="1195" y="408" class="h">What already supports local orthogonality</text>
  ${textLines(1195,440,["SUP-070 expected 2673.70; observed 2673 (+0.70)", "SUP-065 expected 892.49; observed 888 (+4.49)", "SUP-068 expected 1200.50; observed 1182–1190", "SUP-071 expected 2062.95; observed 2046", "Known tile/cutaway offsets: approximately 10–20 mm"],"t",27)}
  <rect x="1165" y="615" width="580" height="205" rx="14" class="warn"/><text x="1195" y="653" class="h">3726 mm independent validation</text>
  ${textLines(1195,686,["Room C outer partition face → through D3 →", "landing on the B3–B4 finished back wall", "Measured: 3726 mm", "Current v0.2: 3741.07 mm; residual +15.07 mm", "Validates back-wall station, not squareness or corners."],"t",25)}
  <rect x="1165" y="845" width="580" height="345" rx="14" class="box"/><text x="1195" y="883" class="h">Five minimum field rechecks</text>
  ${textLines(1195,917,rechecks.slice(0,5).flatMap((r) => [`${r.priority}. ${r.from} → ${r.to}`, `   ${r.existing}`]),"small",25)}
  <rect x="55" y="1220" width="1690" height="315" rx="14" class="box"/><text x="85" y="1260" class="h">Principal node physical-layer key</text>
  ${textLines(85,1295,["B0 / D3-BL — finished plaster wall endpoint + viewer-left D3 outer casing edge", "D3-BR — viewer-right D3 outer casing edge at start of the real 249 mm return", "B0.5 — finished plaster corner; no D3 casing layer reaches this point", "B1 / D5-BL — finished plaster wall endpoint + viewer-left Room B D5 outer casing edge", "B2 / D5-BR — mixed Room B outer casing / metal trim / tiled face at approx 20 mm cutaway"],"small",30)}
  ${textLines(930,1295,["B3 — permanent finished tiled corner; underlying wall plane recorded about 10 mm behind", "B4 — permanent finished/tiled corner; BASE-B-07 access obstructed by shower screen", "T0 / D5-WCR — WC finished plaster / outer casing junction; distinct from B1", "D5-WCL — viewer-left WC outer casing edge; distinct from B2", "T3 — WC finished plaster return before the 173 mm wall run to D5-WCL"],"small",30)}
  <text x="75" y="1570" class="small" fill="#b91c1c">Raw observations remain immutable. Mark every laser spot, target height and material face before accepting a superseding observation.</text>
${svgFooter}`;

const d3Svg = `${svgHeader("Room B D3 evidence audit v0.1", "FIELD SHEET — casing, return and finished-wall datums; schematic, not to scale", 1600, 1000)}
  <rect x="55" y="115" width="1490" height="825" rx="14" class="box"/>
  <path d="M 150 250 L 650 250" class="opening"/><path d="M 650 250 L 650 440 L 1280 440" class="wall"/><path d="M 150 250 L 150 820" class="wall"/>
  <circle cx="150" cy="250" r="10" class="mixed"/><circle cx="650" cy="250" r="10" class="mixed"/><circle cx="650" cy="440" r="10" class="node"/><circle cx="1280" cy="440" r="10" class="mixed"/><circle cx="150" cy="820" r="10" class="node"/>
  <text x="105" y="225" class="h">B0 / D3-BL</text><text x="605" y="225" class="h">D3-BR</text><text x="610" y="480" class="h">B0.5</text><text x="1180" y="480" class="h">B1 / D5-BL</text><text x="105" y="855" class="h">B4</text>
  <text x="400" y="205" class="t" text-anchor="middle">D3 outer casing/opening span — derived 857.05 mm — no wall</text><text x="690" y="350" class="t">BASE-B-02 — 249 mm real return</text><text x="965" y="410" class="t" text-anchor="middle">BASE-B-03 — 823 mm finished plaster wall</text>
  <path d="M 230 280 L 230 335 L 275 335" fill="none" stroke="#c2410c" stroke-width="5"/><path d="M 570 280 L 570 335 L 525 335" fill="none" stroke="#c2410c" stroke-width="5"/>
  <text x="180" y="375" class="small">80 mm along casing</text><text x="180" y="397" class="small">+ 105 mm inward to door face</text><text x="470" y="375" class="small">65 mm along casing</text><text x="470" y="397" class="small">+ 105 mm inward</text>
  <path d="M 150 250 L 650 440" class="diag"/><text x="390" y="320" class="small" text-anchor="middle">SUP-065 — B0→B0.5 — 888 mm</text>
  <path d="M 650 250 L 450 820" class="suspect"/><text x="505" y="590" class="small" text-anchor="middle" transform="rotate(-70 505 590)">SUP-080 — D3-BR→marked back-wall landing — 2217 mm — repeat</text>
  <rect x="820" y="560" width="650" height="300" rx="12" class="warn"/><text x="850" y="600" class="h">Physical-layer question to resolve in the flat</text>
  ${textLines(850,637,["B0 and D3-BR are photographed at outer casing/wall junctions.", "D3 also contains approximately 105 mm inward steps to the door face.", "The unexplained Room B depth error is approximately 80–140 mm.", "That similarity makes a casing/reveal/door-face datum swap plausible,", "but no raw record proves that such a swap occurred.", "", "Mark: outer casing face, finished wall face, reveal and door face.", "Repeat priorities 1, 3 and 4 at the same recorded height."],"t",26)}
  <text x="80" y="970" class="small" fill="#b91c1c">Do not move B0, D3-BR or B0.5 from this sheet. It is an endpoint-identification audit only.</text>
${svgFooter}`;

const d5Svg = `${svgHeader("Room B D5 / WC evidence audit v0.1", "FIELD SHEET — opposite casing faces are distinct; openings are not walls; schematic, not to scale", 1600, 1050)}
  <rect x="55" y="115" width="1490" height="875" rx="14" class="box"/>
  <path d="M 380 185 L 380 765" class="opening"/><path d="M 380 765 L 380 950" class="tile"/><path d="M 770 185 L 770 780" class="opening"/><path d="M 770 780 L 770 930" class="wall"/>
  <path d="M 380 185 L 770 185" class="assembly"/><path d="M 380 765 L 770 780" class="assembly"/>
  <path d="M 500 250 L 500 700" stroke="#c2410c" stroke-width="5"/><path d="M 650 245 L 650 705" stroke="#047857" stroke-width="5"/><path d="M 565 285 L 585 680" stroke="#2563eb" stroke-width="8"/>
  <circle cx="380" cy="185" r="10" class="mixed"/><circle cx="380" cy="765" r="10" class="mixed"/><circle cx="770" cy="185" r="10" class="wc"/><circle cx="770" cy="780" r="10" class="wc"/><circle cx="770" cy="930" r="10" class="wc"/>
  <text x="180" y="175" class="h">B1 / D5-BL</text><text x="170" y="775" class="h">B2 / D5-BR</text><text x="800" y="175" class="h">T0 / D5-WCR</text><text x="800" y="790" class="h">D5-WCL</text><text x="800" y="940" class="h">T3</text>
  <text x="330" y="485" class="t" transform="rotate(-90 330 485)" text-anchor="middle">Room B outer casing — 874 mm — OPENING</text><text x="825" y="485" class="t" transform="rotate(90 825 485)" text-anchor="middle">WC outer casing — 898 mm — OPENING</text>
  <text x="575" y="150" class="small" text-anchor="middle">B1↔T0 assembly depth — derived 120.7 mm — no wall</text><text x="575" y="825" class="small" text-anchor="middle">B2↔D5-WCL opposite-face separation — derived 120.5 mm</text>
  <text x="420" y="240" class="small">59 mm to inner frame</text><text x="420" y="730" class="small">80 mm from inner frame</text><text x="680" y="240" class="small" text-anchor="end">63 mm to inner frame</text><text x="680" y="730" class="small" text-anchor="end">81 mm from D5-WCL</text>
  <text x="575" y="520" class="t" text-anchor="middle">one shared physical leaf — approximately 761 mm</text><text x="575" y="550" class="small" text-anchor="middle">Room B reveal depths: approximately 80 / 97 mm</text>
  <rect x="95" y="850" width="600" height="105" rx="10" class="bad"/><text x="120" y="882" class="h">B2 local material stack</text>${textLines(120,912,["Outer casing + metal trim + tiled face", "Approximately 20 mm local cutaway; not a generic wall corner"],"small",23)}
  <rect x="940" y="185" width="520" height="360" rx="12" class="warn"/><text x="970" y="225" class="h">Field checks</text>
  ${textLines(970,260,["1. B1→B3 direct total; record material contact.", "2. Repeat BASE-B-05 B2→B3 = 1218 mm.", "3. Measure B1↔T0 at a matched height.", "4. Measure B2↔D5-WCL at the same height.", "5. Photograph the B2 cutaway with a ruler in plane.", "", "Never identify B1 with T0 or B2 with D5-WCL.", "Never draw a wall through either D5 opening."],"t",30)}
  <rect x="940" y="585" width="520" height="300" rx="12" class="good"/><text x="970" y="625" class="h">BASE-B-05 meaning</text>
  ${textLines(970,660,["From: B2 / D5-BR mixed casing/tile junction", "To: B3 finished tiled corner", "Reading: 1218 mm; high-confidence baseline", "Method record: 'clear baseline' only", "Missing metadata: stance, height and exact contact faces", "Use: local finished-face wall length", "Do not promote it alone to structural wall plane."],"t",28)}
  <text x="80" y="1020" class="small" fill="#b91c1c">All D5 object, casing, reveal, tile and finished-wall layers remain separate. No geometry is corrected by this audit.</text>
${svgFooter}`;

const markdown = `# Room B wall-plane / node evidence audit v0.1

**Status:** EVIDENCE AUDIT ONLY — **HUMAN REVIEW REQUIRED** — no geometry change  
**Date:** ${generatedDate}  
**Scope:** Room B node and physical-layer interpretation, with D3/D5/WC junction context. No solve, optimisation, node movement or baseline edit.

## Outcome

The evidence does **not** support treating the rejected 40–120 mm orthogonalisation as ordinary survey noise. The known approximately 10–20 mm tile/cutaway layers explain some small closures, but not the dominant depth conflict.

- Width closure: \`857.05 + 823 = 1680.05 mm\` versus \`B3→B4 = 1665 mm\`: **+15.05 mm**.
- Depth closure: \`249 + 874 + 1218 = 2341 mm\` versus \`B0→B4 = 2200–2220 mm\`: **+121 to +141 mm**.
- \`SUP-070 B1→B4 = 2673 mm\` is only **0.70 mm** from the simple orthogonal prediction.
- D3/B0-started depth evidence points the other way: \`SUP-067\` is **116–126 mm shorter** than the raw orthogonal chain, and \`SUP-080\` is **124 mm shorter** than that chain.
- The independent 3726 mm global span is currently only **+15.07 mm** high, so it supports the current back-wall station near the D3 centreline but does not validate squareness.

The leading hypothesis is therefore a **composite physical-datum mismatch around the D3-side casing/return and left-depth observations**, amplified by the low-confidence \`BASE-B-07\` capture. This is not yet a correction. Genuine Room B skew remains a viable competing interpretation.

## Evidence reviewed

Documents: Room B and WC evidence packs, Room B/WC node addendum and reconstruction brief, R5 node register, accepted Room B/WC pilot report/JSON, current whole-flat v0.2 report/JSON, and the walkthrough transcript.

Photographs: \`BASE-B-01\` through \`BASE-B-04\`, \`BASE-WC-05\`, D3 and both D5 faces, the D5 20 mm cutaway image, the D3-BR/B0.5 confirmation image, all four general Room B wall views, and the WC view. Plans: \`rough-paint-sketch.jpg\` and \`2dPlan.jpeg\`.

The transcript supports the D3→Room B→D5→WC sequence only. A local MP4 frame decoder was unavailable, so this audit makes no claim based on unsampled walkthrough frames.

## Preserved topology

\`B0 / D3-BL → D3-BR → B0.5 → B1 / D5-BL → B2 / D5-BR → B3 → B4 → B0\`

- \`D3-BR→B0.5\` remains a real short return.
- \`B0.5\` remains a real corner.
- \`B0.5→B1\` remains a separate finished-wall run.
- \`B1→B2\` is the Room B D5 opening/casing face; no wall is drawn there.
- \`B2→B3\` is the permanent finished/tiled wall portion.
- Room B and WC D5 faces remain distinct.

## Wall-plane classification

| Node | Current role | Physical layer | Confidence | Evidence | Potential issue |
|---|---|---|---|---|---|
${nodeClassifications.map((n) => `| \`${n.node}${n.aliases.length ? ` / ${n.aliases.join(" / ")}` : ""}\` | ${n.currentRole} | ${n.physicalLayer} | ${n.confidence} | ${n.evidence.join("; ")} | ${n.potentialIssue} |`).join("\n")}

### Are the three principal wall runs on one comparable layer?

Not exactly:

- \`B0.5→B1\` is a finished plaster wall terminating at a Room B outer-casing edge.
- \`B0→B4\` begins at a plaster-wall/D3-outer-casing composite point and ends at a tiled/finished corner; its direct reading is obstructed and approximate.
- \`B2→B3\` begins at a D5 outer-casing/tile junction with a documented approximately 20 mm cutaway and ends at a finished tiled corner.

These are all legitimate finished-boundary references, but they are not interchangeable structural-plane targets. The documented finish offsets can plausibly account for roughly 10–20 mm, not the full 60–120 mm conflict.

## BASE-B-05 audit

\`BASE-B-05\` connects **B2 / D5-BR to B3** and records **1218 mm**.

- **B2 physical meaning:** viewer-right Room B outer casing edge coincident with the wall/tiled-face endpoint. The photograph shows the metal trim/tile/plaster junction and the evidence records an approximately 20 mm local cutaway.
- **B3 physical meaning:** permanent lower-right corner on the finished tiled boundary. The underlying wall plane is not the measured surface.
- **Capture record:** “Clear baseline reading.” The source does not record stance, instrument contact faces or target height; those details must not be invented.
- **Logical use:** it is a strong constraint on the local finished/tiled wall length when the two visible targets are repeated consistently. It should not alone establish the structural wall plane or force the D5 casing face to be collinear with an underlying untiled wall.
- **Rejected-trial behaviour:** the unapplied strict trial shortened the modeled span from about 1216.78 mm to 1173.72 mm, changing the residual from approximately **−1.22 mm to −44.28 mm**. This demonstrates that the proposed node moves contradicted the observation; it does not prove the raw 1218 mm is wrong.

## Diagnostic measurements

| ID | Endpoints | Reading | Class | Capture record | Endpoint layers | Audit use / concern |
|---|---|---:|---|---|---|---|
${measurements.map((m) => `| \`${m.id}\` | ${m.endpoints.join(" → ")} | ${m.reading} | ${m.evidenceClass} | ${m.capture} | ${m.endpointLayers.join("; ")} | ${m.shellUse} ${m.concern} |`).join("\n")}

## Measurement closure and consistency

These are arithmetic audits of the existing readings, not fitted geometry.

| Loop | Calculation | Expected | Observed | Closure | Meaning |
|---|---|---:|---:|---:|---|
${closures.map((c) => `| \`${c.id}\` | ${c.expression} | ${c.expectedMm} mm | ${c.observed} | ${c.closure} | ${c.interpretation} |`).join("\n")}

### Central consistency finding

The right-side/back-wall evidence is surprisingly compatible with a local rectangle: \`SUP-070\` closes to 0.70 mm and other local diagonal checks are within about 4–20 mm. The observations tied to the D3/B0 start or left-side depth are consistently 70–140 mm shorter. That pattern is more diagnostic than any single residual.

It could mean:

1. the room genuinely skews/shortens toward the D3 side;
2. a D3 outer-casing, reveal or door-face station has been substituted in one or more measurements/model uses; or
3. the left-depth observations share an access/targeting bias.

## 3726 mm global validation

The validation runs from the **outer Room C partition face**, through D3 along its registered normal, to a landing on the **B3–B4 finished back-wall segment**.

- Measured: **3726 mm**.
- Current v0.2: **3741.07 mm**, residual **+15.07 mm**.
- Rejected strict trial: **3755.15 mm**, residual **+29.15 mm**.

This validates the back-wall station near the D3 centreline. It does **not** validate \`B3\` or \`B4\` individually, prove the back wall parallel to \`B0.5→B1\`, or establish which D3 casing/reveal layer should define a local Room B depth.

## Competing interpretations

${interpretations.map((item) => `### Interpretation ${item.id} — ${item.title}\n\n**Supports:** ${item.supports.join("; ")}.\n\n**Contradicts:** ${item.contradicts.join("; ")}.\n\n**Required assumptions:** ${item.assumptions.join("; ")}.\n\n**Best discriminator:** ${item.discriminator}`).join("\n\n")}

## Ranked field recheck list

| Priority | From | To | Existing measurement | Why recheck | What disagreement it could resolve |
|---:|---|---|---|---|---|
${rechecks.map((r) => `| ${r.priority} | ${r.from} | ${r.to} | ${r.existing} | ${r.why} | ${r.resolves} |`).join("\n")}

For every recheck, photograph both endpoints with the laser/tape in place and record: height above FFL, material face, whether the point is wall/casing/trim/reveal/door, and any along-wall offset from the nearest permanent corner.

## Most likely cause

The most likely cause is a **composite physical-datum mismatch around the D3-side casing/return and left-depth observations**, amplified by the weak \`BASE-B-07\` capture. The known tile/casing offsets at B2/B3/B4 are real but too small to explain the full conflict. The approximately 105 mm D3 casing-to-door-face step is close enough to the unexplained scale to make a D3 start-plane swap the leading specific hypothesis, but it remains unconfirmed.

## Suspect observations/nodes

1. \`BASE-B-07\` — obstructed, approximate and already substantially corrected once.
2. \`SUP-080\` — unmarked landing and +79.47 mm residual in accepted P1.
3. \`B0 / D3-BL\` and \`D3-BR\` — composite outer-casing/finished-wall datums beside documented 105 mm D3 reveal steps.
4. \`SUP-067\` — repeats the 116–126 mm short depth signal.
5. \`B2 / D5-BR\` and \`BASE-B-05\` — mixed casing/tile/cutaway start requiring an explicit same-height repeat.
6. The paired \`SUP-068\` / \`SUP-069\` angular signal.
7. \`B3\` / \`B4\` tile face versus the approximately 10 mm recessed underlying wall plane.

## Minimum recheck set

Take priorities **1–5** first. They are the smallest practical set that distinguishes a bad left baseline, a D3 datum-layer mismatch, a non-straight D5/right wall, and a genuine skewed room.

## Stop

No geometry was created or modified. No raw observation was corrected, deleted or down-rated. The existing Room B/WC baseline and whole-flat constrained models remain unchanged.
`;

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, `${stem}.json`), `${JSON.stringify(audit, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.md`), markdown, "utf8");
fs.writeFileSync(path.join(outputDir, `${stem}.svg`), mainSvg, "utf8");
fs.writeFileSync(path.join(outputDir, "ROOM_B_D3_EVIDENCE_AUDIT_v0_1.svg"), d3Svg, "utf8");
fs.writeFileSync(path.join(outputDir, "ROOM_B_D5_WC_EVIDENCE_AUDIT_v0_1.svg"), d5Svg, "utf8");

console.log(`Wrote ${stem}.md/.json/.svg and two detail SVGs.`);

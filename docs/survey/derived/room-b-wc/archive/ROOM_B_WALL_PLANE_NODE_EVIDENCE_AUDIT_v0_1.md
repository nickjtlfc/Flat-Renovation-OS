# Room B wall-plane / node evidence audit v0.1

**Status:** EVIDENCE AUDIT ONLY — **HUMAN REVIEW REQUIRED** — no geometry change  
**Date:** 2026-08-12  
**Scope:** Room B node and physical-layer interpretation, with D3/D5/WC junction context. No solve, optimisation, node movement or baseline edit.

## Outcome

The evidence does **not** support treating the rejected 40–120 mm orthogonalisation as ordinary survey noise. The known approximately 10–20 mm tile/cutaway layers explain some small closures, but not the dominant depth conflict.

- Width closure: `857.05 + 823 = 1680.05 mm` versus `B3→B4 = 1665 mm`: **+15.05 mm**.
- Depth closure: `249 + 874 + 1218 = 2341 mm` versus `B0→B4 = 2200–2220 mm`: **+121 to +141 mm**.
- `SUP-070 B1→B4 = 2673 mm` is only **0.70 mm** from the simple orthogonal prediction.
- D3/B0-started depth evidence points the other way: `SUP-067` is **116–126 mm shorter** than the raw orthogonal chain, and `SUP-080` is **124 mm shorter** than that chain.
- The independent 3726 mm global span is currently only **+15.07 mm** high, so it supports the current back-wall station near the D3 centreline but does not validate squareness.

The leading hypothesis is therefore a **composite physical-datum mismatch around the D3-side casing/return and left-depth observations**, amplified by the low-confidence `BASE-B-07` capture. This is not yet a correction. Genuine Room B skew remains a viable competing interpretation.

## Evidence reviewed

Documents: Room B and WC evidence packs, Room B/WC node addendum and reconstruction brief, R5 node register, accepted Room B/WC pilot report/JSON, current whole-flat v0.2 report/JSON, and the walkthrough transcript.

Photographs: `BASE-B-01` through `BASE-B-04`, `BASE-WC-05`, D3 and both D5 faces, the D5 20 mm cutaway image, the D3-BR/B0.5 confirmation image, all four general Room B wall views, and the WC view. Plans: `rough-paint-sketch.jpg` and `2dPlan.jpeg`.

The transcript supports the D3→Room B→D5→WC sequence only. A local MP4 frame decoder was unavailable, so this audit makes no claim based on unsampled walkthrough frames.

## Preserved topology

`B0 / D3-BL → D3-BR → B0.5 → B1 / D5-BL → B2 / D5-BR → B3 → B4 → B0`

- `D3-BR→B0.5` remains a real short return.
- `B0.5` remains a real corner.
- `B0.5→B1` remains a separate finished-wall run.
- `B1→B2` is the Room B D5 opening/casing face; no wall is drawn there.
- `B2→B3` is the permanent finished/tiled wall portion.
- Room B and WC D5 faces remain distinct.

## Wall-plane classification

| Node | Current role | Physical layer | Confidence | Evidence | Potential issue |
|---|---|---|---|---|---|
| `B0 / D3-BL` | Permanent Room B endpoint and D3 object-edge alias | Finished plaster wall endpoint coincident with viewer-left Room B outer casing edge | high | NODE_REFERENCE_REGISTER_R5; BASE-B-01.jpeg; ROOM_B_EVIDENCE_v1 | Composite wall/casing target. Rechecks must state whether the laser datum is the wall face, casing face or D3 reveal/door face. |
| `D3-BR` | Room B outer casing edge and start of the real 249 mm return | Viewer-right D3 outer casing edge at the finished return junction | high topology; medium plane equivalence | BASE-B-02.jpeg; ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg; D3-ROOM-B.jpeg | D3 has measured 65/105 mm stepped casing-to-door layers. A casing-face or door-face datum swap is of the same order as the unexplained depth discrepancy. |
| `B0.5` | Permanent lower return corner | Finished plaster wall corner where the 249 mm return turns onto B0.5→B1 | high | ROOM_B_WC_NODE_REFERENCE_ADDENDUM_v1; BASE-B-02.jpeg; ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg | Not a D3 casing point and not collinear with D3-BR. Its exact finish plane should be used for a direct wall-to-back-wall recheck. |
| `B1 / D5-BL` | Permanent wall endpoint and Room B D5 outer-casing alias | Finished plaster wall endpoint coincident with viewer-left Room B outer casing edge | high topology; medium plane equivalence | BASE-B-03.jpeg; D5-ROOM-B.jpeg; NODE_REFERENCE_REGISTER_R5 | Composite wall/casing point; the outer casing direction is not automatically a structural wall plane. |
| `B2 / D5-BR` | Permanent wall endpoint and Room B D5 outer-casing alias | Viewer-right outer casing edge meeting the tiled finished face at a local cutaway | high identity; medium common-plane use | BASE-B-04.jpeg; D5-ROOM-B-20MM-CUTAWAY-TILES&DOOR.jpeg; ROOM_B_EVIDENCE_v1 | Explicit mixed casing/tile target with approximately 20 mm cutaway. It must not silently stand for an underlying structural wall plane. |
| `B3` | Permanent lower-right Room B corner | Finished tiled corner joining B2→B3 and the B3→B4 visible tile face | high topology; medium structural-plane equivalence | BASE-B-05; BASE-B-06; ROOM_B_EVIDENCE_v1 | Permanent corner does not mean structural-face datum; the underlying wall is recorded approximately 10 mm behind the visible tile face. |
| `B4` | Permanent lower-left Room B corner | Finished corner at the back/tiled wall and B0→B4 side wall | high topology; low-to-medium measurement accessibility | BASE-B-06; BASE-B-07; RoomB-WestWall.jpeg | The direct B4→B0 shot was shower-screen-obstructed and has already undergone a large correction. Tile build-up and target height must be recorded on recheck. |
| `T0 / D5-WCR` | Permanent WC wall endpoint and viewer-right WC outer-casing alias | WC finished plaster wall/casing junction on the opposite face of D5 | high | BASE-WC-05.jpeg; D5-WC.jpeg; ROOM_WC_EVIDENCE_v1 | Distinct from B1. The B1↔T0 interval is assembly depth, not wall and not a shared node. |
| `T3` | Permanent WC return corner | Finished plaster corner before the 173 mm wall run to D5-WCL | high | BASE-WC-03; BASE-WC-04; NODE_REFERENCE_REGISTER_R5 | Earlier diagrams used shared-corner shorthand with B2; it is not coincident with B2. |
| `D5-BL / B1` | Viewer-left Room B outer casing edge | Door-object edge coincident with the B1 finished-wall endpoint | high | BASE-B-03.jpeg; D5-ROOM-B.jpeg | Alias is physical coincidence, not permission to merge outer casing, inner frame, reveal and structural wall layers. |
| `D5-BR / B2` | Viewer-right Room B outer casing edge | Door-object edge coincident with the B2 tile/casing junction | high identity; medium plane equivalence | BASE-B-04.jpeg; D5-ROOM-B-20MM-CUTAWAY-TILES&DOOR.jpeg | Highest-risk D5 endpoint because the local 20 mm cutaway and tile trim make the normal wall-plane offset explicit. |
| `D5-WCL` | Viewer-left WC outer casing edge | WC-side casing edge after the 173 mm T3 wall segment | high | D5-WC.jpeg; ROOM_WC_EVIDENCE_v1 | Separate from B2/D5-BR; opposite-face separation is derived, not a zero-length alias. |
| `D5-WCR / T0` | Viewer-right WC outer casing edge | WC-side casing edge coincident with the T0 finished-wall endpoint | high | BASE-WC-05.jpeg; D5-WC.jpeg | Separate from B1/D5-BL across the D5 assembly depth. |

### Are the three principal wall runs on one comparable layer?

Not exactly:

- `B0.5→B1` is a finished plaster wall terminating at a Room B outer-casing edge.
- `B0→B4` begins at a plaster-wall/D3-outer-casing composite point and ends at a tiled/finished corner; its direct reading is obstructed and approximate.
- `B2→B3` begins at a D5 outer-casing/tile junction with a documented approximately 20 mm cutaway and ends at a finished tiled corner.

These are all legitimate finished-boundary references, but they are not interchangeable structural-plane targets. The documented finish offsets can plausibly account for roughly 10–20 mm, not the full 60–120 mm conflict.

## BASE-B-05 audit

`BASE-B-05` connects **B2 / D5-BR to B3** and records **1218 mm**.

- **B2 physical meaning:** viewer-right Room B outer casing edge coincident with the wall/tiled-face endpoint. The photograph shows the metal trim/tile/plaster junction and the evidence records an approximately 20 mm local cutaway.
- **B3 physical meaning:** permanent lower-right corner on the finished tiled boundary. The underlying wall plane is not the measured surface.
- **Capture record:** “Clear baseline reading.” The source does not record stance, instrument contact faces or target height; those details must not be invented.
- **Logical use:** it is a strong constraint on the local finished/tiled wall length when the two visible targets are repeated consistently. It should not alone establish the structural wall plane or force the D5 casing face to be collinear with an underlying untiled wall.
- **Rejected-trial behaviour:** the unapplied strict trial shortened the modeled span from about 1216.78 mm to 1173.72 mm, changing the residual from approximately **−1.22 mm to −44.28 mm**. This demonstrates that the proposed node moves contradicted the observation; it does not prove the raw 1218 mm is wrong.

## Diagnostic measurements

| ID | Endpoints | Reading | Class | Capture record | Endpoint layers | Audit use / concern |
|---|---|---:|---|---|---|---|
| `BASE-B-02` | D3-BR → B0.5 | 249 mm | high-confidence baseline | Direct node-to-node field reading; exact instrument contact plane not recorded | D3 outer casing/return junction; finished plaster return corner | Constrains the real short return, but not a structural-wall centreline One endpoint is casing-derived |
| `BASE-B-03` | B0.5 → B1 / D5-BL | 823 mm | high-confidence baseline | Clear direct baseline | finished plaster corner; finished wall/outer casing junction | Best measured candidate for the upper finished-wall run Terminates on outer casing rather than an independent structural target |
| `D5-B-CASING-WIDTH` | B1 / D5-BL → B2 / D5-BR | 874 mm | high-confidence door object | Across Room B outer casing face | Room B outer casing edge; Room B outer casing edge at tile cutaway | Constrains D5 object width; only a virtual alignment may cross the opening Object face, not permanent wall; B2 has a 20 mm cutaway |
| `BASE-B-05` | B2 / D5-BR → B3 | 1218 mm | high-confidence baseline | Recorded only as a clear direct baseline reading; stance, target height and instrument contact faces are not documented | outer casing/tiled-face junction with cutaway; finished tiled corner | Strongly constrains the local finished/tiled wall length if both targets used the same visible face. It should not alone define the underlying structural plane. Mixed casing/tile start. The rejected exact trial shortened this span to 1173.72 mm, changing residual from -1.22 to -44.28 mm; the raw 1218 mm remains unchanged. |
| `BASE-B-06` | B3 → B4 | 1665 mm | high-confidence baseline, tile face | Visible tile-face measurement | finished tiled corner; finished tiled corner | Constrains finished back-wall width Underlying wall is recorded about 10 mm behind the target at each end |
| `BASE-B-07` | B4 → B0 / D3-BL | approximately 2200–2220 mm | low-confidence approximate range | Direct field recheck obstructed by shower screen | finished/tiled corner; finished wall/outer D3 casing junction | Only approximate left-side finished-boundary depth Primary suspect: difficult shot and previous inactive range was 2010–2030 mm |
| `SUP-065` | B0 / D3-BL → B0.5 | 888 mm | high-confidence node-to-node | Clear reading | D3 casing/wall junction; finished plaster corner | Checks the D3 span/return triangle Composite D3 endpoint |
| `SUP-066` | B0 / D3-BL → B2 / D5-BR | approximately 1952 mm | low-confidence approximate | Difficult laser shot | D3 casing/wall junction; D5 casing/tile junction | Context only Both endpoints are composite and the shot is approximately 69 mm shorter than the simple orthogonal chain |
| `SUP-067` | B0 / D3-BL → B3 | 2755–2765 mm | medium-confidence measured range | Human-confirmed range | D3 casing/wall junction; finished tiled corner | Strong discriminator for D3-side-to-back-corner depth Approximately 116–126 mm shorter than the raw orthogonal chain |
| `SUP-068` | B0.5 → B2 / D5-BR | 1182–1190 mm | medium-confidence measured range | Measured range | finished plaster corner; D5 casing/tile junction | Tests the B0.5–B1–B2 corner Simple right-angle prediction is 1200.50 mm, 10.50–18.50 mm longer |
| `SUP-069` | B0.5 → B3 | 2228 mm | high-confidence node-to-node | Clear reading | finished plaster corner; finished tiled corner | Constrains the top-corner-to-back-corner diagonal Simple orthogonal right-chain prediction is 2248.06 mm, 20.06 mm longer |
| `SUP-070` | B1 / D5-BL → B4 | 2673 mm | high-confidence node-to-node | Clear reading | wall/outer casing junction; finished/tiled corner | Strong orthogonality discriminator Simple orthogonal prediction is 2673.70 mm: exceptionally close despite mixed layers |
| `SUP-071` | B2 / D5-BR → B4 | 2046 mm | high-confidence corrected node-to-node | Authoritative field recheck | D5 casing/tile junction; finished/tiled corner | Tests the B2–B3–B4 corner Simple right-angle prediction is 2062.95 mm, 16.95 mm longer |
| `SUP-080` | D3-BR → unmarked perpendicular landing on B3–B4 | 2217 mm | medium-confidence wall-face validation | Field recheck; landing spot was not permanently marked | D3 outer casing/return junction; general finished tile face | Validation only Accepted P1 predicts 2296.47 mm (+79.47); raw orthogonal depth chain predicts 2341 mm (+124) |
| `VALIDATION-3726` | Room C outer partition face → D3-normal landing on B3–B4 | 3726 mm | independent global validation | Through D3 along the registered D3 normal | Room C outer partition face; Room B finished back-wall face | Validates back-wall station near the D3 centreline, not room squareness or either back corner Current v0.2 predicts 3741.07 mm, only +15.07 mm; this resists moving the whole back wall about 100 mm |

## Measurement closure and consistency

These are arithmetic audits of the existing readings, not fitted geometry.

| Loop | Calculation | Expected | Observed | Closure | Meaning |
|---|---|---:|---:|---:|---|
| `LOOP-WIDTH` | 857.05 + 823 versus 1665 | 1680.05 mm | 1665 mm | +15.05 mm | Good closure for mixed D3 casing, plaster wall and tiled back-wall layers; supports an orthogonal width family within documented finish offsets. |
| `LOOP-DEPTH` | 249 + 874 + 1218 versus 2200–2220 | 2341 mm | 2200–2220 mm | +121 to +141 mm | Dominant conflict. Too large for the documented approximately 10–20 mm finish offsets. |
| `LOOP-B0-B05` | sqrt(857.05² + 249²) versus SUP-065 | 892.49 mm | 888 mm | +4.49 mm | Strongly supports the D3 span/return right-angle interpretation, subject to the derived 857.05 mm casing span. |
| `LOOP-B05-B2` | sqrt(823² + 874²) versus SUP-068 | 1200.5 mm | 1182–1190 mm | +10.50 to +18.50 mm | Near-orthogonal locally; plausible finish/casing contribution. |
| `LOOP-B05-B3` | sqrt(823² + (874+1218)²) versus SUP-069 | 2248.06 mm | 2228 mm | +20.06 mm | Moderate tension, much smaller than the left/depth conflict. |
| `LOOP-B2-B4` | sqrt(1665² + 1218²) versus SUP-071 | 2062.95 mm | 2046 mm | +16.95 mm | Near-orthogonal B3 corner with possible tile/casing offsets. |
| `LOOP-B1-B4` | sqrt(1665² + (874+1218)²) versus SUP-070 | 2673.7 mm | 2673 mm | +0.70 mm | Very strong support for the local right-chain/back-wall orthogonal relationship. |
| `LOOP-B0-B3` | sqrt((857.05+823)² + (249+874+1218)²) versus SUP-067 | 2881.47 mm | 2755–2765 mm | +116.47 to +126.47 mm | Repeats the depth conflict from an independent diagonal starting at the D3-side composite node. |
| `LOOP-D3BR-BACK` | 249 + 874 + 1218 versus SUP-080 | 2341 mm | 2217 mm | +124 mm | Numerically echoes the depth conflict, but SUP-080 uses an unmarked general landing and is validation-grade. |

### Central consistency finding

The right-side/back-wall evidence is surprisingly compatible with a local rectangle: `SUP-070` closes to 0.70 mm and other local diagonal checks are within about 4–20 mm. The observations tied to the D3/B0 start or left-side depth are consistently 70–140 mm shorter. That pattern is more diagnostic than any single residual.

It could mean:

1. the room genuinely skews/shortens toward the D3 side;
2. a D3 outer-casing, reveal or door-face station has been substituted in one or more measurements/model uses; or
3. the left-depth observations share an access/targeting bias.

## 3726 mm global validation

The validation runs from the **outer Room C partition face**, through D3 along its registered normal, to a landing on the **B3–B4 finished back-wall segment**.

- Measured: **3726 mm**.
- Current v0.2: **3741.07 mm**, residual **+15.07 mm**.
- Rejected strict trial: **3755.15 mm**, residual **+29.15 mm**.

This validates the back-wall station near the D3 centreline. It does **not** validate `B3` or `B4` individually, prove the back wall parallel to `B0.5→B1`, or establish which D3 casing/reveal layer should define a local Room B depth.

## Competing interpretations

### Interpretation A — Current measured shell is genuinely skewed

**Supports:** BASE-B-07 short left depth; SUP-067 B0→B3 range; SUP-080 short D3-BR-to-back-wall span; current 3726 validation is only +15.07 mm.

**Contradicts:** Width loop closes within 15.05 mm; SUP-070 is within 0.70 mm of a simple orthogonal chain; photographs and both plans read as a simple orthogonal room.

**Required assumptions:** D3/casing aliases correctly represent the intended finished boundary; The correlated depth observations are not sharing one layer/targeting bias.

**Best discriminator:** Priorities 1, 3 and 4: clean left depth plus two marked wall-to-wall spans.

### Interpretation B — Orthogonal architectural shell with offset finish/object nodes

**Supports:** Photographic visual reading; 15.05 mm width closure; near-right-angle B0–B0.5, B0.5–B2, B2–B4 loops; SUP-070 0.70 mm closure.

**Contradicts:** 121–141 mm depth closure; SUP-067 is 116–126 mm short; SUP-080 is 124 mm short against the raw orthogonal chain; known tile/cutaway offsets are only about 10–20 mm.

**Required assumptions:** One or more D3/D5 composite aliases or depth measurements use a different face; The undocumented offset is substantially larger than tile thickness.

**Best discriminator:** Priorities 2, 3, 5 and 8, with physical faces written beside every endpoint.

### Interpretation C — Mostly orthogonal main shell, but D3-side datum is on a different station/layer

**Supports:** The conflict clusters in observations starting at B0/D3-BR or comparing the left depth; D3 has documented 105 mm casing-to-door-face steps; The unexplained scale is roughly 80–140 mm, comparable to a jamb/reveal datum rather than tile thickness; Right-side and width loops close much better.

**Contradicts:** Photographs label B0 and D3-BR at outer casing/wall junctions; No raw record explicitly says the disputed shots used the door face; 3726 validates the current back-wall station but not the precise local start layer.

**Required assumptions:** At least one recorded start or model use differs from the photographed sticky-note target; The main shell may be orthogonal even if the D3 object/return datum is locally stepped.

**Best discriminator:** Priority 3 compared directly with priority 4, plus explicit D3 outer-casing-to-door-face offsets at the same height.

## Ranked field recheck list

| Priority | From | To | Existing measurement | Why recheck | What disagreement it could resolve |
|---:|---|---|---|---|---|
| 1 | B0 / D3-BL | B4 | BASE-B-07: approximately 2200–2220 mm | Remove the shower-screen obstruction and repeat at a documented height on explicit finished faces. | Directly tests the 121–141 mm depth closure and the most weakly captured baseline. |
| 2 | B1 / D5-BL | B3 | No direct total; chain is 874 + 1218 = 2092 mm | Measure the full D5-plus-wall station in one shot or with a marked straightedge, while recording casing versus tile contact. | Tests whether B1–B2–B3 really forms one straight physical datum and whether BASE-B-05 shares the D5 casing layer. |
| 3 | B0.5 | Marked perpendicular landing on B3–B4 | No direct named-node wall span | Uses a pure finished-wall corner rather than a D3 casing start; mark the landing and its offset from B3. | Separates main-shell depth from D3 casing/reveal-layer uncertainty. |
| 4 | D3-BR | Marked perpendicular landing on B3–B4 | SUP-080: 2217 mm | Repeat with both spots marked and record the landing fraction/offset along B3–B4. | Determines whether the current +79.47 mm residual is endpoint ambiguity or genuine shell skew. |
| 5 | B2 / D5-BR | B3 | BASE-B-05: 1218 mm | Repeat at a recorded height and state whether the start touches outer casing, metal trim, tile face or plaster cutaway. | Confirms the observation that most strongly resists the rejected strict candidate. |
| 6 | B0.5 | B2 / D5-BR and B3 | SUP-068: 1182–1190 mm; SUP-069: 2228 mm | Recheck as a paired set without moving the B0.5 datum and document the B2 material layer. | Tests the approximately 2.9° incompatible angular signal across the straight B1–B2–B3 assumption. |
| 7 | B0 / D3-BL | B3 | SUP-067: 2755–2765 mm | Repeat the diagonal from the photographed outer wall/casing junction, not the door face or reveal. | Checks the independent 116–126 mm shortfall predicted by the raw orthogonal chain. |
| 8 | B1 / D5-BL and B2 / D5-BR | T0 / D5-WCR and D5-WCL respectively | Derived opposite-face separations: about 120.7 mm and 120.5 mm | Measure both jamb-face separations at matched heights and name outer-casing versus finished-wall contacts. | Confirms that opposite D5 faces are paired correctly and that no WC-face alias has leaked into Room B shell constraints. |

For every recheck, photograph both endpoints with the laser/tape in place and record: height above FFL, material face, whether the point is wall/casing/trim/reveal/door, and any along-wall offset from the nearest permanent corner.

## Most likely cause

The most likely cause is a **composite physical-datum mismatch around the D3-side casing/return and left-depth observations**, amplified by the weak `BASE-B-07` capture. The known tile/casing offsets at B2/B3/B4 are real but too small to explain the full conflict. The approximately 105 mm D3 casing-to-door-face step is close enough to the unexplained scale to make a D3 start-plane swap the leading specific hypothesis, but it remains unconfirmed.

## Suspect observations/nodes

1. `BASE-B-07` — obstructed, approximate and already substantially corrected once.
2. `SUP-080` — unmarked landing and +79.47 mm residual in accepted P1.
3. `B0 / D3-BL` and `D3-BR` — composite outer-casing/finished-wall datums beside documented 105 mm D3 reveal steps.
4. `SUP-067` — repeats the 116–126 mm short depth signal.
5. `B2 / D5-BR` and `BASE-B-05` — mixed casing/tile/cutaway start requiring an explicit same-height repeat.
6. The paired `SUP-068` / `SUP-069` angular signal.
7. `B3` / `B4` tile face versus the approximately 10 mm recessed underlying wall plane.

## Minimum recheck set

Take priorities **1–5** first. They are the smallest practical set that distinguishes a bad left baseline, a D3 datum-layer mismatch, a non-straight D5/right wall, and a genuine skewed room.

## Stop

No geometry was created or modified. No raw observation was corrected, deleted or down-rated. The existing Room B/WC baseline and whole-flat constrained models remain unchanged.

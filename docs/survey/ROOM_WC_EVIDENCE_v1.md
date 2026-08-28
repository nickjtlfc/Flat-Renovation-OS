# ROOM WC EVIDENCE PACK v1

**Purpose:** Human-reviewed transcription of the WC survey evidence for a joint Room B and WC 2D reconstruction.

**Status:** Ready to place in the repository and use alongside `ROOM_B_EVIDENCE_v1.md`.

**Units:** millimetres unless stated otherwise.

**Scope:** WC only as a separate evidence pack. It is intended to be solved jointly with Room B using D5 and the single Room B-to-WC tie. No Room A or Room C geometry is included.

---

## 1. Survey conventions and cautions

- Nodes T0-T3 describe the WC finished boundary.
- D5-WCL and D5-WCR are WC-side door/casing endpoint references.
- Where a wall node and casing endpoint coincide, both labels are preserved as aliases.
- Wall plane, casing face, inner casing and door face are separate physical layers.
- Approximate readings must remain approximate and must not be promoted to exact constraints.
- The WC is to be reconstructed jointly with Room B, but it remains a distinct room within the solve.
- The joint solve must not extend into Room A or Room C.

---

## 2. WC baseline chain

| ID | Start node | End node | Reading | Confidence / interpretation |
|---|---|---|---:|---|
| BASE-WC-01 | T0 / D5-WCR | T1 | 1643 | Clear baseline reading. T0 and D5-WCR are treated as the same physical start point. |
| BASE-WC-02 | T1 | T2 | 1078 | Clear baseline reading. |
| BASE-WC-03 | T2 | T3 | 1685 | Authoritative field recheck. The earlier raw value of 690 mm was incorrect and is superseded. |
| BASE-WC-04 | T3 | D5-WCL | 173 | Authoritative endpoint clarification. Finished-wall segment terminating at the WC-side left casing endpoint; not part of the D5 casing width. |
| BASE-WC-05 | D5-WCR | T0 | 0 | D5-WCR and T0 are the same physical point. The casing runs directly into the wall; photograph required for interpretation. |

### Baseline alias note

- `T0 / D5-WCR` is one coincident node.
- D5-WCL is the opposite WC-side door/casing endpoint.
- `BASE-WC-05 = 0` is not a missing measurement. It records a coincident wall/casing condition.

### Field-recheck correction history

- Active `BASE-WC-03`: `T2 -> T3 = 1685 mm`, confirmed by field recheck.
- Superseded inactive raw record: `T2 -> T3 = 690 mm`. The 690 mm value was erroneous and must not enter the active solve.
- Active `BASE-WC-04`: `T3 -> D5-WCL = 173 mm`, confirmed during the WC-side D5 endpoint clarification.
- Superseded inactive record: `T3 -> D5-WCL = 171 mm`. It is retained only as correction history and must not enter the active solve.

---

## 3. WC supplemental measurements

| ID | From node / point | To node / point | Reading | Confidence / note |
|---|---|---|---:|---|
| SUP-072 | T0 / D5-WCR | T2 | 1959 | Clear WC diagonal / cross-check. |
| SUP-073 | T1 | T3 | approximately 1970 | Approximate WC diagonal / cross-check. |
| SUP-077 | Finished floor | Ceiling at T0 / D5-WCR area | 2289 | Local WC ceiling height. |
| SUP-078 | Finished floor | Ceiling at T3 area | 2277 | Local WC ceiling height. |
| SUP-079 | Room B node B0 / D3-BL | WC node T2 | 3674 | Sole direct Room B-to-WC tie. Use to connect the two room networks in the joint solve. |
| SUP-081 | Approximate midpoint of T1-T2 wall | Derived perpendicular landing point on the B0-B4 finished wall segment | 3492 | Field recheck broad wall-to-wall span. Neither endpoint is a permanent target. Use as a low-weight check and report the assumed midpoint plus landing fraction; a repeat should mark both endpoints if node-level precision is required. |

---

## 4. Door D5 - WC face

These measurements describe the WC face of D5 and should be used together with the Room B-side D5 evidence.

| Measurement | Reading | Confidence / note |
|---|---:|---|
| WC-side casing width | 898 | Across the visible WC-side casing face. |
| WC-side casing top elevation | 2064 | Working elevation derived from the unchanged 1974 mm opening/leaf top plus the direct 90 mm casing-above-door observation. |
| Door finish/opening top to casing top | 90 | Direct WC-side field observation. |
| WC-side top casing to ceiling | 226 | Direct local field observation. The selected first-shell WC ceiling is 2289 mm, so its flat working-plane representation closes at 225 mm; preserve the 1 mm field/model difference. |
| WC-side casing projection from finished wall | 30 | Direct field observation of the proud projection only; it does not establish rear depth, full casing thickness, rebate or frame thickness. |
| WC-side D5-WCL to inner-casing/door-edge reference | 81 | Fresh field observation, viewed from inside the WC facing Room B. Runs along the WC casing datum from `D5-WCL` toward the shared leaf. |
| WC-side T0 / D5-WCR to inner-casing edge | 63 | Fresh field observation, viewed from inside the WC facing Room B. Runs along the WC casing datum from the coincident wall/casing endpoint toward the shared leaf. |
| Shared physical door-leaf width | approximately 761 | Same physical leaf measured from Room B with the door open. |

### WC D5 correction and endpoint history

- Active vertical/object observations from the 2026-08-14 field check: 90 mm from door finish/opening top to casing top, 226 mm from casing top to the local ceiling, and 30 mm proud projection from the finished wall.
- The earlier 2057 mm WC-side casing-height interpretation is superseded. The active first-shell casing top is 2064 mm, derived from the unchanged 1974 mm opening/leaf top plus 90 mm.
- The earlier 225 mm top-clearance entry is superseded as a field reading by the direct 226 mm observation. A 225 mm rendered clearance remains the explicit 1 mm closure result against the selected 2289 mm flat WC ceiling; it is not substituted for the field observation.
- Active fresh observations: 81 mm from `D5-WCL` to the relevant inner-casing/door-edge reference and 63 mm from `T0 / D5-WCR` to the inner-casing edge.
- Earlier observations of 83 mm and 52 mm may have used different frame or door-stop layers. They are retained as inactive history and must not be treated as interchangeable with 81 mm and 63 mm unless their endpoint identity is later confirmed.
- The 173 mm `T3 -> D5-WCL` reading remains an active finished-wall segment and is not part of the casing width.

### D5 joint-door instruction

- D5 is the shared physical connection between Room B and the WC.
- The Room B and WC evidence packs describe opposite faces of the same door assembly.
- Use one shared 761 mm door leaf, centreline, width and orientation. Do not create separate Room B and WC leaf positions.
- Preserve the different casing widths, heights and side offsets around that shared leaf.
- Authoritative WC-side order: `T3 ->[173 mm finished wall]-> D5-WCL ->[81 mm casing/frame relationship]-> shared D5 leaf ->[63 mm casing/frame relationship]-> D5-WCR / T0`.
- `D5-WCR = T0`; `T3` and `D5-WCL` remain separate nodes.
- Use the annotated Room B/WC survey photographs to interpret the local tiled-wall, casing and door-face geometry.
- If the two faces cannot be reconciled confidently, stop for human review rather than inventing wall thickness or casing depth.

---

## 5. Ceiling evidence

| Area | Height |
|---|---:|
| T0 / D5-WCR area | 2289 |
| T3 area | 2277 |

Preserve both observations. Do not replace them with one averaged ceiling height at this stage.

---

## 6. Photographic evidence

Relevant annotated photographs are expected under:

`source-material/photos/RoomB-WC-Survey/`

Including:

- `BASE-WC-05.jpeg`
- `D5-WC.jpeg`
- the Room B-side D5 photographs
- the 20 mm cutaway / tile-and-door photograph

The general Room B/WC photographs already in the repository should also be used for orientation and visual checking.

---

## 7. Evidence hierarchy

Use evidence in this order:

1. Clear WC baseline measurements.
2. Clear WC diagonal / supplemental measurements.
3. D5 WC-side object measurements.
4. Annotated survey photographs.
5. The Room B-to-WC tie `SUP-079`.
6. Approximate readings such as `SUP-073` with reduced weight.

Where evidence conflicts:

- preserve raw values;
- report residuals;
- do not impose right angles without support;
- do not invent wall thickness;
- stop for targeted human review if D5 cannot be reconciled.

---

## 8. Joint reconstruction scope

This evidence pack is to be used with:

- `docs/survey/ROOM_B_EVIDENCE_v1.md`
- `docs/survey/ROOM_B_WC_RECONSTRUCTION_BRIEF_v1.md`

The first reconstruction should:

- solve Room B and the WC together;
- use D5 and SUP-079 to connect the two room networks;
- produce one joint 2D SVG;
- keep Room B and WC visually distinct;
- exclude Room A and Room C;
- omit full soffit geometry in the first pass;
- remain 2D until human review is complete.

---

## 9. Human-review stop condition

Stop and ask for clarification if:

- D5-WCL / D5-WCR endpoint meaning conflicts with the photographs;
- the Room B-side and WC-side door assemblies cannot be reconciled;
- the cross-tie `SUP-079` forces a visibly implausible orientation;
- a solution requires inventing links to Room A or Room C.

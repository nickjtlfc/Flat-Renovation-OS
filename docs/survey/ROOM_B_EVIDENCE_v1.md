# ROOM B EVIDENCE PACK v1

**Purpose:** Human-reviewed transcription of the Room B survey evidence for a future Codex 2D reconstruction.

**Status:** Ready to place in the repository and use as the authoritative Room B evidence source, subject to the explicit cautions below.

**Units:** millimetres unless stated otherwise.

**Scope:** Room B only. WC geometry is not to be reconstructed in this pack. One Room B-to-WC tie measurement is retained as contextual geometry. No Room C or Room A geometry is included.

---

## 1. Survey conventions and cautions

- Measurements are taken from the labelled physical nodes shown in the field photographs and survey sheets.
- A node may coincide with a door-casing endpoint where the wall and casing physically meet.
- Where a wall node and a door-casing endpoint are the same physical point, both labels are retained as aliases.
- Wall plane, tile face, outer casing, inner casing and door face are separate physical layers and must not be silently merged.
- Some readings are approximate, ranges, or difficult laser shots. These must be down-weighted rather than treated as exact.
- The Room B soffit is only partially surveyed. Its start location is recorded, but its full geometry is outside the first-pass reconstruction.
- BASE-B-07 is an approximate field range because the shower screen obstructed a clean direct measurement; the authoritative recheck range is 2200-2220 mm.
- The annotated photographs are essential evidence for understanding the local D3 and D5 geometry.
- Preserve uncertainty rather than inventing precision.

---

## 2. Room B baseline chain

| ID | Start node | End node | Reading | Confidence / interpretation |
|---|---|---|---:|---|
| BASE-B-01 | B0 | D3-BL | 0 | B0 and D3-BL are the same physical point. The wall runs directly into the D3 casing. |
| BASE-B-02 | D3-BR | B0.5 | 249 | Wall comes out from the D3 side. B0.5 is an inserted intermediate node not present on the earlier plan. |
| BASE-B-03 | B0.5 | D5-BL / B1 | 823 | D5-BL and B1 are the same physical node where wall and casing meet. |
| BASE-B-04 | D5-BR / B2 | B2 | 0 | D5-BR and B2 are the same physical node where casing and wall/tiled face meet. The local area includes an approximately 20 mm cutaway around the tiles/door junction; photograph required. |
| BASE-B-05 | B2 | B3 | 1218 | Clear baseline reading. |
| BASE-B-06 | B3 | B4 | 1665 | Measured to the visible tile face. Approximately 10 mm of tile/build-up sits behind the target at each end. |
| BASE-B-07 | B4 | B0 / D3-BL | approximately 2200-2220 | Authoritative field recheck. Approximate range because the shower screen obstructed a clean direct measurement. |

### Baseline alias notes

- `B0 / D3-BL` is one coincident node.
- `D5-BL / B1` is one coincident node.
- `D5-BR / B2` is one coincident node.
- The D5 20 mm condition is a local cutaway around the tiled wall/door junction. It must be interpreted from the annotated photographs rather than reduced to a simple uninterrupted wall plane.

### BASE-B-07 correction history

- 2026-08-04 authoritative field recheck: active `BASE-B-07` is `B4 -> B0 / D3-BL = approximately 2200-2220 mm`.
- Superseded inactive record: `B4 -> B0 = approximately 2010-2030 mm`. This incorrect range is retained only as correction history and must not enter the active solve.

---

## 3. Room B supplemental measurements

| ID | From node / point | To node / point | Reading | Confidence / note |
|---|---|---|---:|---|
| SUP-065 | B0 / D3-BL | B0.5 | 888 | Clear reading. |
| SUP-066 | B0 / D3-BL | B2 / D5-BR | approximately 1952 | Difficult to obtain a clean reading. |
| SUP-067 | B0 / D3-BL | B3 | 2755-2765 | Human-confirmed correction. Preserve as a measured range. |
| SUP-068 | B0.5 | B2 / D5-BR | 1182-1190 | Preserve as a measured range. |
| SUP-069 | B0.5 | B3 | 2228 | Clear reading. |
| SUP-070 | B1 / D5-BL | B4 | 2673 | Clear reading. |
| SUP-071 | B2 / D5-BR | B4 | 2046 | Authoritative field recheck. The start is the coincident `B2 / D5-BR` node; the earlier `B1 / D5-BR -> B4 = 2014` record is superseded. |
| SUP-074 | B2 / D5-BR | Start of soffit | 192 | Feature-location measurement only; does not define full soffit geometry. |
| SUP-075 | Finished floor | Ceiling at B4-B0 clear wall area | 2281 | Vertical Room B height observation. |
| SUP-076 | Finished floor | Ceiling at B2 / D5-BR area | 2274 | Vertical Room B height observation. |
| SUP-079 | B0 / D3-BL | WC node T2 | 3674 | Sole Room B-to-WC tie. This is the only unobstructed straight-line connection between visible Room B and WC nodes. Use only as contextual validation; do not reconstruct the WC. |
| SUP-080 | D3-BR | Derived perpendicular landing point on the B3-B4 finished wall segment | 2217 | Field recheck wall-to-wall span. Endpoint is a general wall-face point, not a permanent node. Use with reduced weight and report the derived landing fraction on B3-B4. This is a validation span only; it does not define a construction line through B0.5 or B1. |

### Field-recheck correction history

- Active `SUP-071`: `B2 / D5-BR -> B4 = 2046 mm`, confirmed by field recheck.
- Superseded inactive record: `B1 / D5-BR -> B4 = 2014 mm`. Both the start label and reading were corrected; this value must not enter the active solve.
- New `SUP-080`: `D3-BR -> B3-B4 wall-face landing = 2217 mm`, recorded during the same field-review cycle. The landing point was not permanently marked, so the reconstruction should use a derived perpendicular foot with reduced weight or retain the reading as validation.

### Room B architectural direction families

- Family A: `B0 -> B4` is approximately parallel to the terminating return `D3-BR -> B0.5`.
- Family B: `B0 / D3-BL -> D3-BR`, `B0.5 -> B1`, `T0 -> T1`, `B4 -> B3` and `T3 -> T2` are very closely parallel.
- The return ends at `B0.5`; the Family B wall begins there after an approximately 90-degree change of direction. `D3-BR`, `B0.5` and `B1` are not collinear.
- Use these relationships as soft architectural evidence. Do not impose exact parallelism or exact right angles unless separately approved.

---

## 4. Door D3 - Room B face

The D3 side geometry forms two L-shaped offsets from the outer wall/casing reference toward the door face.

### Left side of D3

| Segment | Reading | Meaning |
|---|---:|---|
| B0 / D3-BL to inner casing | 80 | Runs horizontally along the lower/outer casing line until the casing drops inward. |
| Inner casing to door face | 105 | Runs inward from that point toward the start of the door face, forming an L-shape with the 80 mm segment. |

### Right side of D3

| Segment | Reading | Meaning |
|---|---:|---|
| D3-BR to inner casing | 65 | Opposite-side equivalent of the left 80 mm segment. |
| Inner casing to door face | 105 | Runs inward from that point toward the door face, forming the opposite L-shape. |

### Main D3 dimensions

| Measurement | Reading |
|---|---:|
| Visible closed door face from Room B | 738 |
| Door face height | 1975 |
| Finished floor to casing top | 2076 |
| Casing top to ceiling | 221 |

### D3 modelling instruction

Do not model D3 as one flat-width rectangle. The 80/105 mm and 65/105 mm measurements describe two stepped L-shaped side conditions between wall/casing references, inner casing and door face.

The authoritative 738 mm reading is the exposed width visible when D3 is closed from Room B. It is not automatically the full physical leaf width: an unmeasured portion may sit behind the frame stop or reveal. Keep the physical D3 leaf width unresolved until it is measured directly with the door open. The D3 object layers are derived inside the fitted shell and must not rotate or resize the Room B shell.

Correction history: the former 763 mm D3 door-face entry is superseded and inactive. It is retained here only to preserve provenance; do not average it with the authoritative 738 mm visible closed-face measurement.

---

## 5. Door D5 - Room B face

| Measurement | Reading | Confidence / note |
|---|---:|---|
| Casing width | 874 | Room B face. |
| Casing height | 2157 | Room B face. |
| Top casing to ceiling | 237 | Room B face. |
| Door height | 1974 | |
| Physical door-leaf width | approximately 761 | Full shared D5 leaf, measured with the door open. This is the same physical leaf seen from the WC. |
| Visible closed-leaf width from Room B | approximately 737 | Exposed part of the 761 mm leaf when closed; the remaining width is concealed behind the frame stops/reveals. This is not a second door width. |
| B1 / D5-BL to nearer inner-casing edge | 59 | Fresh field recheck. Runs along the Room B casing/wall datum. |
| Nearer inner-casing edge to visible door face | approximately 80 | Reveal depth, approximately perpendicular to the casing-width direction. |
| Opposite inner-casing edge to visible door face | approximately 97 | Reveal depth, approximately perpendicular to the casing-width direction. |
| Opposite inner-casing edge to B2 / D5-BR | 80 | Fresh field recheck. Runs along the Room B casing/wall datum. |

### Room B D5 correction history

- Active fresh field observations: 59 mm from `B1 / D5-BL` to the nearer inner-casing edge and 80 mm from the opposite inner-casing edge to `B2 / D5-BR`.
- Superseded inactive readings for those same endpoint relationships: 63/65 mm on the B1 side and 81 mm on the B2 side. Preserve them as history; they must not enter the active solve.
- The 80 mm and 97 mm readings are reveal depths approximately perpendicular to the 874 mm casing-width direction. Earlier solver interpretations that treated them as longitudinal or diagonal casing-to-leaf offsets are superseded.
- The 761 mm observation is the full physical leaf. The approximately 737 mm Room B observation is only its exposed closed-face width. Do not average or substitute one for the other.

### Room B D5 modelling instruction

Model the Room B face as separate outer-casing, inner-casing/frame-stop, reveal and door-leaf layers. The stepped observations must not be flattened into a single arithmetic chain. In particular, do not calculate `B1 -> B2` by adding `59 + 80 + 761 + 97 + 80`.

### D5 local cutaway condition

The annotated field photograph records an approximately 20 mm local cutaway around the tiled wall and door/casing junction. This is a real local construction nuance, not a measurement typo.

Codex must:

- inspect the annotated photographs;
- avoid assuming a single uninterrupted wall plane at this location;
- keep tile face, casing and door face as separate layers;
- stop for human review if the cutaway cannot be interpreted confidently.

### WC-side D5 values - context only

These values describe the opposite face of the same door. They are retained as object context only and are not instructions to reconstruct the WC.

| Measurement | Reading |
|---|---:|
| WC-side casing width | 898 |
| WC-side casing top elevation | 2064 (derived from unchanged 1974 mm opening/leaf top + measured 90 mm) |
| Door finish/opening top to casing top | 90 |
| WC-side top casing to local ceiling | 226 |
| WC-side casing projection from finished wall | 30 |
| WC-side D5-WCL to inner-casing/door-edge reference | 81 |
| WC-side T0 / D5-WCR to inner-casing edge | 63 |

The former 83 mm and 52 mm WC readings may have targeted different frame/stop layers. They are retained in the WC evidence correction history and are inactive unless their exact endpoints are later shown to match the fresh 81 mm and 63 mm observations.

The former 2057 mm WC-side casing-height interpretation and 225 mm field-clearance entry are superseded by the direct 2026-08-14 vertical/object observations recorded in `ROOM_WC_EVIDENCE_v1.md`. The first-shell selected 2289 mm flat ceiling produces a separate 225 mm rendered clearance above the derived 2064 mm casing top; the 1 mm closure difference from the direct 226 mm local observation remains explicit.

---

## 6. Room B ceiling and soffit evidence

| Evidence | Reading | Interpretation |
|---|---:|---|
| Floor to ceiling at B4-B0 clear wall area | 2281 | Local Room B ceiling height. |
| Floor to ceiling at B2 / D5-BR area | 2274 | Local Room B ceiling height. |
| B2 / D5-BR to start of soffit | 192 | Locates the start of the soffit only. |

The bath/shower soffit is not fully measured. It should be omitted from the first shell solve or shown only as an unresolved secondary feature for later addition.

---

## 7. Photographic evidence

Recommended repository folder:

`source-material/photos/RoomB-WC-Survey/`

Expected photographs include:

- `BASE-B-01.jpeg`
- `BASE-B-02.jpeg`
- `BASE-B-03.jpeg`
- `BASE-B-04.jpeg`
- `BASE-WC-05.jpeg`
- `D3-ROOM-B.jpeg`
- `D5-ROOM-B.jpeg`
- `D5-WC.jpeg`
- `D5-ROOM-B-20MM-CUTAWAY-TILES&DOOR.jpeg`

The photographs are primary evidence of endpoint meaning and awkward construction details. They are not merely illustrative.

---

## 8. Evidence hierarchy for Codex

Use evidence in this order:

1. Clear exact Room B baseline readings.
2. Clear node-to-node supplemental readings.
3. Human-confirmed endpoint aliases and L-shaped door details.
4. Ranged or approximate supplemental readings.
5. Door object measurements.
6. Annotated photographs for endpoint-layer interpretation.
7. The Room B-to-WC tie as contextual validation only.
8. Soffit evidence as secondary and incomplete.

Where evidence conflicts:

- preserve the raw values;
- report residuals;
- do not silently average ranges into false precision;
- down-weight approximate shots;
- do not silently reconcile conflicting aliases;
- stop for human review if endpoint meaning remains ambiguous.

---

## 9. First-pass reconstruction scope

When used by Codex:

- reconstruct Room B only;
- include D3 and the Room B face of D5;
- use SUP-079 only as a Room B-to-WC tie check;
- do not fit the full WC;
- do not fit Room C;
- do not connect Room B directly to Room A;
- do not model the full soffit in the first pass;
- retain the soffit start as a secondary feature marker;
- produce a 2D SVG geometry-checking artefact before any 3D work;
- do not proceed to 3D until the Room B 2D geometry has passed human review.

---

## 10. Human-review stop condition

If the photographs and node-reference files do not make the D5 aliases or 20 mm cutaway unambiguous, Codex should stop and ask for a specific real-world clarification rather than continuing with an assumed geometry.

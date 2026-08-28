# First 3D construction shell v0.1

**Status:** first deterministic existing-condition shell for human visual review. It is not construction-certified geometry and is not a proposed renovation layout.

## Run locally

From the repository root:

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite. The viewer provides orbit, pan, zoom, reset-view, ceiling visibility and removable-partition visibility controls.

For a production build:

```powershell
npm run build
npm run preview
```

To run the lightweight source-geometry and measurement-maths guard independently:

```powershell
npm run generate:3d-shell
npm run validate:3d-shell
```

`npm run dev` and `npm run build` first regenerate `public/generated/flat-shell-v0_1.json`.
For this first narrow implementation, `npm run dev` builds and serves the production viewer locally; rerun it after source changes.

## Geometry and generation path

Horizontal coordinates come from the promoted whole-flat authority:

`docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json`

The active promoted local room packages supply topology and feature grouping only. The generator verifies their documented translations against the whole-flat coordinates and stops if any checked node differs by more than 0.000001 mm.

Generation path:

```text
promoted whole-flat XY + active local feature topology + reviewed vertical model
    → scripts/generate_3d_shell_v0_1.mjs
    → public/generated/flat-shell-v0_1.json
    → Three.js viewer
```

No promoted JSON/SVG is changed by generation.

## Coordinate and unit convention

- Source horizontal units: millimetres.
- Render units: metres.
- Conversion: 1 mm = 0.001 m.
- Source 2D `x` maps to scene `X`.
- Elevation above finished floor maps to scene `Y`.
- Source 2D `y` maps to scene `Z` without rotation or reflection.
- Origin: Room C `C0 = (0,0)` at finished-floor elevation 0 mm.

Generated objects retain feature IDs, classification and source node/object IDs in Three.js `userData` where practical.

### Permanent finished-face rendering convention

The promoted permanent-wall segments are surveyed finished-wall face datums, not wall centrelines. Each safely classified permanent wall record therefore carries an explicit directed `roomFacingSide` (`left` or `right`), `authoritativeFinishedFaceAligned: true`, the 80 mm visual thickness and its source-datum meaning. The viewer offsets the mesh centre 40 mm away from the named room-facing side, so the rendered room face remains exactly on the immutable source segment and the schematic thickness extends outward. The opposite face is explicitly not treated as surveyed geometry.

This applies to Room A, Room C, Room B and WC wall runs, plus the permanent wall sides/heads around D1-D5 and the wall infill above/below W1/W2. Shared openings retain separate room-face records (for example `D2-A` and `D2-C`) rather than collapsing two measured faces into one centred wall. Casings, door reveals/leaves, window glazing/frames, cupboard carcasses and the Room C removable partition retain their separate physical datums and are not moved by this convention.

## Modelled scope

- room floor polygons;
- simple permanent wall panels generated along accepted wall runs and cupboard-envelope returns;
- real door and window gaps with complete jamb/head wall fill as applicable;
- simple measured/derived door casing faces and through-reveal surfaces at D2, D3 and D5;
- five simple door leaves;
- W1 and W2 simple glazing/frame representations;
- open-front CP1 and CP2 cupboard carcasses inside Room C recess/envelope extensions;
- a simple enclosed CP2 upper build-up above the measured cupboard top;
- current Room C partition as `existing-removable`;
- optional flat ceiling planes.

Loose furniture, appliances, sanitaryware, finishes, proposed layouts, detailed service routing and photorealistic materials are excluded. The CP1 lower enclosure includes one deliberately simple water-inlet reference because that service point is part of the observed existing construction.

## Vertical evidence and working planes

The central reviewed/assumed vertical model is `data/3d/vertical-model-v0_1.json`.

The Room C vertical source currently sits in the preserved accepted-baseline history because no promoted active vertical package exists. It is used only for accepted vertical evidence and correction history; no archived XY coordinate is consumed.

| Space | First-shell ceiling | Basis |
|---|---:|---|
| Room A | 3167 mm | measured W1-AR station (`SUP-054`); other Room A stations remain preserved at 3122–3169 mm |
| Room B | 2281 mm | measured B4-B0 clear-wall station (`SUP-075`) |
| WC | 2289 mm | measured T0/D5-WCR station (`SUP-077`); T3 is 2277 mm |
| Room C | 2631 mm | measured D4 station and corrected W2 chain; other recorded stations remain 2594–2616 mm |

These are temporary flat working planes selected from measured stations, not averages or claims that the measured station differences do not exist.

Door heights used are D1 2030 mm, D2 1975 mm, D3/D4 1987 mm and D5 1974 mm. W2 retains its protected approximate 1040 mm sill/base and 2556 mm head. Its upper permanent wall strip is now direct field evidence at approximately 72 mm; the unchanged 2631 mm Room C working ceiling produces a 75 mm generated closure, so the 3 mm field/model difference remains explicit. W1 uses the recorded 1887 mm height, with temporary vertical placement at 986–2873 mm because no sill datum was recorded. CP1 begins at 1315 mm, has a 1261 mm body and a separate 30 mm top trim. CP2 is modelled to its measured 2148 mm top.

## First correction pass

- D2's Room C wall is now split at `D2-OPENING-R` / `D2-OPENING-L-INFERRED`; no generated wall spans the opening.
- A continuous D2 threshold, two jamb reveals and a head reveal bridge the accepted Room A and Room C opening faces across the approximately 250 mm wall depth.
- On the Room A face, wall fill now occupies both casing-to-clear-opening side intervals up to the ceiling, and the clear-opening head is filled from 1975 mm to the 3167 mm working ceiling. The measured casing remains a separate overlay ending at 2140 mm rather than extending to the ceiling.
- The same simple wall-fill/casing convention is applied to the other measured door faces. D2-C deliberately has no invented architrave because its exact casing/rebate extent remains unresolved.
- CP1 and CP2 footprints now extend the Room C floor/ceiling envelope and receive exterior side/back shell returns, so they read as internal built-in recesses rather than external solids.
- CP1 and CP2 retain their open-front upper cupboard carcasses. CP1's high-level suspended body remains unchanged and its lower services zone now has the observed thin enclosure, closed access door, projecting transition lip and simple water-inlet reference described below. CP2 remains open from FFL to its measured 2148 mm top, with a simple enclosed upper build-up from 2148 mm to the selected Room C working ceiling.

## Survey / Validation interface

The viewer's Survey / Validation panel is a lightweight inspection layer over the generated existing-condition shell. It does not edit the model or promoted coordinates.

1. Select any combination of Room A, Room B, WC and Room C. Room C is the only default. Markers are filtered by room; labels appear on hover, while selected tape endpoints remain labelled. Showing every node label is an advanced option.
2. Choose **Node → node**, **Free → free** or **Mixed**. Node mode accepts exact known nodes; free mode preserves exact raycast hits; mixed mode accepts both.
3. Start measuring and select START/END. The exact-node selector is useful for coincident references such as `D2-CR` and `D2-OPENING-R`, which occupy the same promoted coordinate but retain different physical meanings.
4. Inspect the persistent line and endpoint labels while orbiting. The selected card makes horizontal model distance primary; true 3D distance, vertical difference, coordinates and selection metadata sit under Advanced details.
5. Enter the real-world reading. The viewer calculates `real world − model horizontal`, showing both signed and absolute difference without changing the model.
6. Assign Virtual, Field check required, Field check completed or Needs investigation. Non-virtual checks receive sequential `FIELD-###` identities.
7. Export all accumulated session checks in one report. Human-readable results precede technical coordinates and model provenance.

Mixed-mode surface snapping is explicit and optional. When enabled it uses a 75 mm true-3D radius and reports that the endpoint snapped; when disabled, or in Free → free mode, the exact surface hit is retained. Free points preserve feature identity, nearest node, plan offset from that node and elevation where available.

For a free hit, Advanced details also states whether the selected mesh is aligned to an authoritative finished-wall face. Unsupported semantic layers report `no`; supported permanent-wall surfaces additionally expose their datum, directed room-facing side, visual thickness and zero room-face/source-plane offset.

Repository observations remain an advanced orange dashed overlay. They respect the active room combination and continue to show recorded field values separately from model-derived endpoint distances. Tape labels, repository observations, assumptions and all-node labels are independently optional.

Each completed tape check receives a session-only `VM-###` ID and retains its line plus labelled START/END markers until hidden, deleted or cleared. Browser-session persistence is intentionally not implemented in this pass. Entered real-world readings are comparison evidence only; they do not automatically alter authoritative geometry.

For the first known Room C field check, choose `D2-OPENING-R` and `C0` explicitly, then enter 4221 mm. The model horizontal is approximately 4217.05 mm and the comparison is approximately +3.95 mm. `D2-CR` is coordinate-coincident but semantically a casing-edge reference, so the viewer does not silently substitute it for the stated opening-right reference.

### WC T0-to-T2 field-check close-out and D5 wall-head datum

The T0-to-T2 field relationship has been sufficiently explored and is not awaiting another same-height wall-plane measurement. At approximately 1300 mm above FFL, the physically accessible T0 outer-casing edge to T2 measurement is 1961 mm. The casing is built directly into the adjoining corner, so no independent `T0-WALL-1300` point exists behind it. At approximately 2100 mm, above the casing, the best practical comparison from the underlying T0-side wall/corner line to T2 is 1967 mm. The 6 mm difference confirms a real casing-versus-wall semantic effect, but it does not explain the remaining approximately 23-29 mm disagreement with the otherwise coherent fixed-T3 network. That residual remains WC geometry/semantic-abstraction uncertainty; no repeat of this specific field check is recommended.

On the WC side of D5, `D5-WC-WALL-HEAD` is generated on the permanent finished-wall / outer-casing-boundary plane while retaining the established clear-opening longitudinal span. A follow-up free-surface check exposed a separate rendering-orientation error: the 80 mm visual box had extended into the WC, so a ray from inside the room first met its opposite face at x = 5180.347 mm and reported 1582.688 mm to `WC-WALL-02`. The wall-head now has its own directed room-face metadata. Its WC-facing surface is x = 5100.347 mm, its render centre is x = 5060.347 mm, and the schematic opposite face is x = 5020.347 mm outside the WC. The clean perpendicular span is therefore restored to 1662.688 mm. This changes only mesh placement/raycast contact; the earlier 31.846 mm clear-plane-to-wall-plane source correction remains intact.

The D5 WC casing is a separate object layer. Its current door/opening top datum remains 1974 mm; the direct 90 mm casing-above-door observation places the casing top at 2064 mm. The casing is rendered 30 mm proud into the WC from its finished-wall back plane, without inferring rear depth, full casing thickness, rebate or frame thickness. The direct local casing-top-to-ceiling observation is 226 mm. Against the existing selected 2289 mm flat WC ceiling, the deterministic model clearance is 225 mm, leaving an explicit 1 mm field/model vertical closure difference rather than moving the ceiling or door datum. The casing stops below the ceiling and the permanent wall head remains visible above and behind it.

### W2 recessed-window permanent wall infills

W2 is represented as a recessed opening in solid wall mass. The two explicit permanent features are `W2-C-UPPER-WALL-INFILL` and `W2-C-LOWER-WALL-INFILL`. Both follow the unchanged main Room C wall line from `C1` at `(330, 0)` mm to `C2` at `(1599, 0)` mm, and both extend from the Room C finished face at y = 0 mm to the unchanged recessed W2 frame/casing plane at y = 164.98 mm. Their mesh centreline is therefore y = 82.49 mm and their full recess depth is 164.98 mm.

The upper infill runs from the protected 2556 mm W2 casing-top datum to the unchanged 2631 mm Room C working ceiling. Its model height remains 75 mm against the approximately 72 mm direct field observation, retaining the explicit 3 mm frozen-datum closure difference. The lower infill runs from finished-floor level at 0 mm to the protected W2 sill/frame datum at 1040 mm. These volumes meet the recessed frame plane and remove the former open gaps above and below the window.

The protected W2 opening remains exactly 1040–2556 mm high and 1269 mm wide on the unchanged recessed endpoints `W2-CR` `(327.54, 164.98)` mm and `W2-CL` `(1596.54, 164.98)` mm. Neither infill enters that vertical interval, so frame, glazing and opening remain unobstructed. Runtime world bounds are `(0.33, 2.556, 0)` to `(1.599, 2.631, 0.16498)` m for the upper infill and `(0.33, 0, 0)` to `(1.599, 1.04, 0.16498)` m for the lower infill.

Window-wall construction and resolution live in shared runtime helpers used by both the viewer and deterministic validator. Tests assert exactly the two explicit W2 infills, exact front/back and vertical bounds, permanent measurement-surface metadata, Room C-side raycast hits, an unobstructed opening-zone ray and no legacy `W2-HEAD-WALL`, superseded `W2-C-WALL-HEAD`, or intermediate `W2-C-UPPER-WALL-STRIP` mesh.

### CP1 lower service enclosure

`CP1-LOWER-SERVICE-ASSEMBLY` represents the observed existing joinery and concealed service area below the unchanged suspended CP1 body. Its thin frontage is aligned to the promoted `CP1-FL` `(54.99, -3690.92)` mm to `PO1` `(1605.69, -3690.92)` mm line. The panel is 10 mm deep and runs from FFL to the unchanged 1315 mm upper-cupboard base. It is split around the access assembly so no duplicate panel occupies the door opening.

The closed access assembly is 722 mm wide and 772 mm high. It contains a 560 mm leaf, 80 mm left casing, 80 mm right casing, 1 mm clearance at each leaf side and no top casing. The promoted frontage is 1550.70 mm, while the independently observed stations imply `1550.70 - 535 - 243 = 772.70 mm`, which is 50.70 mm wider than the measured 722 mm assembly. This is not a rounding closure. The current placement preserves the CP1-FL-side 535 mm observation and the 722 mm assembly: outer casing edges are `(589.99, -3690.92)` to `(1311.99, -3690.92)` mm, leaving 293.70 mm to PO1. The earlier 243 mm PO1-side observation remains conflicting local evidence with a +50.70 mm residual, pending the next Room C / CP1 / partition investigation; neither source node is moved.

`CP1-LOWER-LIP` spans the full 1550.70 mm frontage, occupies 1265–1315 mm vertically and projects 60 mm into Room C from the enclosure plane. `CP1-WATER-INLET-REFERENCE` is a simple 150 mm-high vertical marker behind the right-hand panel at approximately `(1484.19, -3720.92)` mm. Its 18 mm display diameter is only a visibility convention; pipe diameter, routing, valves and connections are not inferred.

All lower components remain classified as existing fabric/joinery/services. A separate design-stage note records that the enclosure/front panel may later be explored for alteration or removal to expose the service area. Nothing is removed or reclassified as the existing removable Room C partition in this shell.

### Evidence categories

The validation layer keeps three categories distinct:

1. **Repository field observations** are real recorded survey values. Their overlay definitions and provenance live in `data/3d/survey-validation-v0_1.json` and are emitted under `surveyValidation.repositoryMeasurements`.
2. **Model-derived distances** are calculated from current promoted endpoints and are shown beside—never substituted for—the recorded field values.
3. **Virtual checks** are ad-hoc viewer measurements created during the current browser session. They are not field evidence unless subsequently measured in the flat and imported through a separate reviewed evidence workflow.

The first repository overlay set contains 16 Room C observations: `RC-01`, `RC-02`, `RC-03`, `RC-05`, `RC-06`, `RC-07`, `RC-08`, corrected `RC-19`, W2 width, CP1 body width/depth, CP2 body width/depth, D2 structural-opening width and D3/D4 leaf widths. Approximate surface checks with unmarked landing stations, approximate-area endpoints, unlocated vertical stations and superseded readings are intentionally excluded.

### Geometry guard

`scripts/validate_3d_shell_v0_1.mjs` verifies promoted source-node XY against generated validation-node XZ, Room C boundary points, cupboard footprints and D2-C opening endpoints. It also tests horizontal/vertical/true-distance and real-minus-model calculations, all three endpoint modes, Room C/Room A+Room C/Room B+Room C filter combinations, the 4221 mm D2-opening-right-to-C0 workflow and selected Room C overlays. The finished-face guard checks every classified wall, individual door-wall fragment, both explicit W2 wall infills and window-surround records, asserting that each Room C-facing surface lands on its authoritative source plane within 0.000001 mm. Deterministic Three.js tests inspect the production upper/lower infill meshes, prove that both back faces reach the W2 frame plane, raycast both Room C-facing surfaces, prove the opening interval is unobstructed and reject duplicate legacy or superseded W2 heads/strips. Room A opposing-wall controls and six Room C free-surface regression fixtures protect the expected before/after distances. The generator records the maximum source/transform delta in `surveyValidation.geometryValidation` and stops above 0.000001 mm. This is a downstream integrity guard, not a reconstruction solve.

## Explicit assumptions and simplifications

- Wall, floor, ceiling, door-leaf and glazing thicknesses are visual conventions only; concealed structural build-up is not inferred.
- The 80 mm permanent-wall thickness extends away from the authoritative room face. Its opposite visual face and exterior corner/miter detail remain schematic rather than newly measured wall build-up.
- Door casing depth (110 mm), reveal skin thickness (18 mm) and cupboard carcass panel thickness (20 mm) are replaceable visual conventions, not measured hidden construction. D5's WC-side casing is the exception to the generic casing-depth display: its measured 30 mm proud projection is represented from the finished-wall back plane, while its unspecified rear/hidden construction remains unresolved.
- The CP1 water-inlet marker uses an 18 mm visual diameter solely to keep the approximate 150 mm-high service reference legible. No pipe specification is asserted.
- Each room uses one flat working ceiling selected from a measured station. Other station readings remain data, not silently averaged away.
- D1 uses its 2030 mm clear-opening height as the temporary leaf-height proxy because the physical leaf height was not separately measured.
- D2 uses a 1975 mm first-shell opening to accommodate the measured 1975 mm leaf; the Room A clear-opening reading is 1971 mm and the 4 mm layer difference remains documented.
- W1's unmeasured sill is temporarily derived by placing the recorded 1887 mm window height with its head at the recorded 2873 mm casing top, producing a 986 mm sill.
- CP1 top trim uses 30 mm, the lower end of its observed approximately 30–40 mm range, and remains separate from the body.
- CP2's usable open cavity is temporarily modelled from finished floor to its measured 2148 mm top because its lower body datum/body height was not measured.
- CP2's upper casing/build-up is simplified as a closed volume from 2148 mm to the selected 2631 mm Room C ceiling. Evidence records approximately 450 mm from cupboard top to its local ceiling, but exact casing thickness, local ceiling relationship and internal upper composition remain unmeasured.
- The Room C removable partition is temporarily full-height to the 2631 mm Room C working plane because no separate partition-top datum was located.
- Simple window frame rails are a visual convention; they are not detailed joinery geometry.

## Deferred features

**Room B soffit is intentionally omitted from the first 3D shell and Room B is temporarily represented with a flat ceiling.**

The measured 192 mm start-location observation and general soffit evidence remain preserved for a later dedicated modelling task. The unmeasured shallow D5 high-level cover/bulkhead is also omitted.

## First visual review

Check these relationships first:

1. overall Room A / Room C / Room B-WC placement and recognisable plan shape;
2. D2's continuous Room A-to-Room C threshold/reveal, full wall closure above it and measured Room A casing ending below the ceiling;
3. D3 and D5 shared-room interfaces and simple casing/reveal treatment;
4. W1 and W2 sill/head positions;
5. CP1 as an unchanged suspended upper cupboard plus existing lower service enclosure, closed side-cased access door without top casing, projecting lip and simple right-side water-inlet reference;
6. CP2 as an internal open-front cupboard below an enclosed upper build-up;
7. Room C removable partition classification and full-height assumption;
8. flat Room B ceiling with no soffit geometry.

If a horizontal discrepancy appears, trace its feature ID back to the promoted geometry and evidence before considering any authoritative correction.

# R5 node reference register — Iteration 1 review

Status: **proposal for human review; not measured geometry and not an active survey model**.

This register defines a language for describing physically valid observations. It does not limit the survey to a pre-authorised list of node pairs. Any visible and physically valid point-to-point, casing-to-casing, node-to-casing or wall-plane observation may later be recorded. Wall planes do not need predeclared map identifiers: their meaning should follow from the approved topology, named endpoints and the observation description.

## Governing conventions

- The map and every coordinate in it are schematic and not to scale.
- For every door, window and cupboard, **left and right are determined while standing in the named room or area and facing the object**. They never mean drawing-page left or right.
- A permanent point node is a permanent, physically identifiable corner or wall return.
- An object edge node is the outermost visible casing/architrave edge or identifiable external footprint corner. It is not the clear opening, a leaf, a shelf or hidden construction.
- Opposite faces of one opening remain distinct references even if their schematic marks appear close.
- The current Room C bedroom enclosure is bounded by a real, thin, demolishable stud wall. `PO` nodes are on the face toward open Room C; `PI` nodes are on the face toward the current bedroom. The paired nodes must not be collapsed to an infinitely thin line.
- One physical position receives one plan marker.
- On the Room C face, `D3-CL` is the D3 casing-edge reference coincident with the permanent finished-wall corner. The wall turns there; `D2-CR` is a D2 casing-edge point 580 mm along the adjoining wall. No separate generic C node is added at the same physical corner.

## Room A permanent nodes

| Identifier | Type | Room/object | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `A0` | Permanent point | Room A | Upper endpoint of the permanent A–C wall at Room A's upper-left corner | None | `A1`; `D2-AR` along the A–C wall | Permanent | The opposite Room C face and CP2 casing must not be assumed dimensionally coincident |
| `A1` | Permanent point | Room A | Left rear chimney-breast return | None | `A0`, `A2` | Permanent | Exact finished corner to target |
| `A2` | Permanent point | Room A | Left front chimney-breast corner | None | `A1`, `A3` | Permanent | Exact finished corner to target |
| `A3` | Permanent point | Room A | Right front chimney-breast corner | None | `A2`, `A4` | Permanent | Exact finished corner to target |
| `A4` | Permanent point | Room A | Right rear chimney-breast return | None | `A3`, `A5` | Permanent | Exact finished corner to target |
| `A5` | Permanent point | Room A | Upper-right permanent corner at the W1 wall | None | `A4`, `W1-AL` | Permanent | None beyond survey precision |
| `A6` | Permanent point | Room A | Lower-right permanent corner at the W1/D1-wall junction | None | `W1-AR`, `D1-AL` | Permanent | None beyond survey precision |
| `A7` | Permanent point | Room A | Lower endpoint of the A–C wall on the Room A face | None | `D1-AR`, `D2-AL` | Permanent | Do not assume dimensional coincidence with a Room C finished-face point |

## Room C permanent nodes

The Room C detail follows the whole-flat overview: CP1 and CP2 are recess/projection objects embedded in the stepped upper permanent boundary. Generic Room C nodes are used only for the remaining permanent corners around the lower-left W2 recess. `D3-CL` retains its D3 object-edge identifier while also marking the coincident permanent finished-wall corner; this preserves the casing layer without inventing a second marker at the same physical position.

| Identifier | Type | Room/object | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `C0` | Permanent point | Room C | Lower-left permanent shell corner below CP1 | None | CP1-side wall above; `C1` along the lower boundary | Permanent | Exact finished corner |
| `C1` | Permanent point | Room C | Upper/inner return at the W2 recess on the `W2-CR` side | None | `C0`, `W2-CR` | Permanent | Confirm targetable finished return |
| `C2` | Permanent point | Room C | Upper/inner return at the W2 recess on the `W2-CL` side | None | `W2-CL`, `D4-CR` | Permanent | Confirm targetable finished return |

`B0` is intentionally absent from the Room C detail and Room C register. It remains a Room B node only.

## Room B permanent nodes

Two wall-direction families are authoritative architectural evidence. Family A is `B0 -> B4` parallel to `D3-BR -> B0.5`. Family B is `B0 / D3-BL -> D3-BR`, `B0.5 -> B1`, `T0 -> T1`, `B4 -> B3` and `T3 -> T2`. Family A terminates at `B0.5`; Family B starts there after an approximately 90-degree turn. `SUP-080` is only a wall-to-wall validation span and does not define either family or make `D3-BR`, `B0.5` and `B1` collinear.

The Room B rows below incorporate the measured pilot topology, the confirmation photograph `ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg`, and the authoritative human sketch. D3 is the upper horizontal span and ends at `D3-BR`. A separate 249 mm return drops to the lower corner `B0.5`; `D3-BR` is not collinear with the lower `B0.5 → B1` / `T0 → T1` alignment. D5 interrupts that lower line between distinct endpoints `B1` and `T0`, with no wall across the assembly gap.

| Identifier | Type | Room/object | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `B0` | Permanent point | Room B | Wall endpoint coincident with the viewer-left Room B outer casing edge of D3 | None | `B4`; `D3-BR` across D3 | Measured; alias `D3-BL` | Wall runs directly into casing; one physical point carries both labels |
| `B0.5` | Permanent point | Room B | Lower shell corner reached by the separate 249 mm return down from `D3-BR`; lower wall turns here and runs to `B1` | None | `D3-BR`, `B1` | Measured inserted node; photograph and human sketch | Not an alias for or collinear with `D3-BR`; no D3 object layer reaches it; do not extend the lower wall backward through D3-BR |
| `B1` | Permanent point | Room B | Wall endpoint coincident with the viewer-left Room B outer casing edge of D5 | None | `B0.5` by wall; `T0` through the D5 assembly interruption; `B2` across the Room B D5 face | Measured; alias `D5-BL`; human-confirmed alignment | Collinear with `T0` but not joined to it by wall |
| `B2` | Permanent point | Room B | Wall/tiled-face endpoint coincident with the viewer-right Room B outer casing edge of D5 | None | `B1` across D5; `B3` | Measured; alias `D5-BR` | Approximately 20 mm local tile/casing cutaway is a separate secondary condition |
| `B3` | Permanent point | Room B | Lower-right permanent corner | None | `B2`, `B4` | Permanent | Exact finished corner |
| `B4` | Permanent point | Room B | Lower-left permanent corner | None | `B3`, `B0` | Permanent | Exact finished corner |

## WC permanent nodes

`T0–T3` are retained R4 WC identifiers. The `WC` prefix is mandatory for D5 object-edge nodes, where a single `W` would be ambiguous with windows. The WC face is dimensionally separate from the Room B face of D5. `T0 → T1` is collinear with `B0.5 → B1`, but D5 interrupts the alignment between the distinct nodes `B1` and `T0`; no wall segment may be inferred across that gap. The earlier schematic `B1/T0` and `B2/T3` shared-corner shorthand must not be read as physical coincidence.

| Identifier | Type | Room/object | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `T0` | Permanent point | WC | Wall endpoint coincident with the viewer-right WC outer casing edge of D5 | None | `B1` through the D5 assembly interruption; `T1` by wall; `D5-WCL` across the WC D5 face | Measured; alias `D5-WCR`; human-confirmed alignment | Collinear with `B1` but not joined to it by wall |
| `T1` | Permanent point | WC | Upper-right WC corner continuing the straight wall alignment from `B0.5` through `B1` and `T0` | None | `T0`, `T2` | Permanent; human-confirmed alignment | None beyond access |
| `T2` | Permanent point | WC | Lower-right WC corner | None | `T1`, `T3` | Permanent | Sanitary fittings may obstruct targeting |
| `T3` | Permanent point | WC | Lower-left WC return before the 173 mm finished-wall run to the viewer-left D5 casing edge | None | `T2`, `D5-WCL` | Measured topology; corrected `BASE-WC-03 = 1685 mm` | Do not infer coincidence with `B2`; `T3 -> D5-WCL` is wall, not casing |

Measured-pilot correction: authoritative field recheck sets `BASE-WC-03` to `T2 → T3 = 1685 mm`. The former 690 mm transcription is superseded and inactive; it is retained only in the WC evidence correction history. This correction affects the numeric fit, not the `T0 → T1 → T2 → T3 → D5-WCL → T0` topology.

## Door outer-casing nodes

All door nodes mean the **outermost visible casing/architrave edge on the named face**, not the clear opening or leaf.

| Identifier | Type | Object/face | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `D1-AL` | Object edge | D1, Room A face | Viewer-left outer casing edge | Stand in A facing D1 | `A6`; D1 opening | Object-based | Confirm exact moulding extremity |
| `D1-AR` | Object edge | D1, Room A face | Viewer-right outer casing edge | Stand in A facing D1 | D1 opening; `A7` | Object-based | Entrance-side nodes deliberately excluded |
| `D2-AL` | Object edge | D2, Room A face | Viewer-left outer casing edge | Stand in A facing D2 | `A7`; D2 opening | Object-based | Opposite face need not align |
| `D2-AR` | Object edge | D2, Room A face | Viewer-right outer casing edge | Stand in A facing D2 | D2 opening; `A0` | Object-based | Opposite face need not align |
| `D2-CL` | Object edge | D2, Room C face | Viewer-left outer casing edge | Stand in C facing D2 | D2 opening; structural wall above | Object-based | Exact plan station provisional until survey |
| `D2-CR` | Object edge | D2, Room C face | Viewer-right outer casing edge lying on the adjoining wall that runs from the turning corner at `D3-CL` | Stand in C facing D2 | D2 opening; `D3-CL` by 580 mm of permanent wall | Human-observed Room C survey topology; observed separation 580 mm | Remains an object/casing-layer point, not the wall corner; broader Room C geometry and the wall's exact survey bearing are not established here |
| `D3-BL` | Object edge | D3, Room B face | Viewer-left outer casing edge coincident with the adjoining wall endpoint | Stand in B facing D3 | `B0` alias; D3 opening | Measured object edge | Opposite face need not align |
| `D3-BR` | Object edge | D3, Room B face | Viewer-right end of the upper horizontal D3 casing span, above the separate lower node `B0.5` | Stand in B facing D3 | D3 opening; 249 mm return down to `B0.5` | Measured object edge; human sketch | Not collinear with the lower B0.5-B1/T0-T1 alignment; do not collapse into B0.5 or extend D3 casing onto the return |
| `D3-CL` | Object edge coincident with permanent point | D3, Room C face | Viewer-left outer casing edge at the permanent finished-wall corner where the wall changes direction from the D3 side onto the adjoining wall toward D2 | Stand in C facing D3 | D3 opening; `D2-CR` 580 mm along the adjoining wall | Human-observed Room C survey topology; observed separation 580 mm | The casing edge and finished-wall corner are confirmed coincident, so no duplicate generic C node is added; the exact turn angle and broader Room C geometry remain outside this correction |
| `D3-CR` | Object edge | D3, Room C face | Viewer-right outer casing edge | Stand in C facing D3 | D3 opening; uninterrupted permanent wall toward D4 | Object-based | Confirm exact adjoining-wall length |
| `D4-CL` | Object edge | D4, Room C face | Viewer-left outer casing edge | Stand in C facing D4 | D4 opening; wall toward D3 | Object-based | Shared-area face deliberately excluded |
| `D4-CR` | Object edge | D4, Room C face | Viewer-right outer casing edge | Stand in C facing D4 | `C2`; D4 opening | Object-based | Shared-area face deliberately excluded |
| `D5-BL` | Object edge | D5, Room B face | Viewer-left outer casing edge coincident with adjoining wall endpoint | Stand in B facing D5 | `B1` alias; D5 opening; `T0 / D5-WCR` through the assembly depth | Measured object edge; human-confirmed alignment | Distinct from and collinear with `T0 / D5-WCR`; the interval is D5 assembly, not wall |
| `D5-BR` | Object edge | D5, Room B face | Viewer-right outer casing edge coincident with adjoining wall/tiled-face endpoint | Stand in B facing D5 | D5 opening; `B2` alias | Measured object edge | Preserve the local approximately 20 mm cutaway as a separate layer |
| `D5-WCL` | Object edge | D5, WC face | Viewer-left outer casing edge after the short wall return from `T3` | Stand in WC facing D5 | `T3`; D5 opening | Measured object edge | Remains separate from `B2 / D5-BR` |
| `D5-WCR` | Object edge | D5, WC face | Viewer-right outer casing edge coincident with `T0` | Stand in WC facing D5 | D5 opening; `T0` alias; `B1 / D5-BL` through the assembly depth | Measured object edge; human-confirmed alignment | Remains separate from and collinear with `B1 / D5-BL`; no wall crosses the interval |

## Window outer-casing/opening nodes

| Identifier | Type | Object/face | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `W1-AL` | Object edge | W1, Room A | Outer visible casing/opening edge nearest `A5` | Stand in A facing W1 | `A5`, W1 opening | Object-based | Confirm whether casing or outer reveal is the repeatable target |
| `W1-AR` | Object edge | W1, Room A | Outer visible casing/opening edge nearest `A6` | Stand in A facing W1 | W1 opening, `A6` | Object-based | Confirm whether casing or outer reveal is the repeatable target |
| `W2-CL` | Object edge | W2, Room C | Viewer-left outer visible casing/opening edge; authoritative migration from R4 `C9` | Stand in C facing W2 | W2 opening, `C2` | Object-based | Do not reverse from page orientation or old prose |
| `W2-CR` | Object edge | W2, Room C | Viewer-right outer visible casing/opening edge; authoritative migration from R4 `C8` | Stand in C facing W2 | `C1`, W2 opening | Object-based | Do not reverse from page orientation or old prose |

## Cupboard outer-footprint nodes

Cupboard object `C1` becomes `CP1`; cupboard object `C2` becomes `CP2`. CP1 and CP2 are drawn as recess/projection footprints integrated into the Room C upper boundary, not as floating objects.

| Identifier | Type | Object | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `CP1-CL` | Object edge | CP1 | Viewer-left rear casing/footprint corner on the permanent boundary | Stand in C facing CP1 | adjacent shell; `CP1-FL` | Object-based | Confirm exact visible casing extremity |
| `CP1-CR` | Object edge | CP1 | Viewer-right rear casing/footprint corner on the permanent boundary | Stand in C facing CP1 | `CP1-FR`; upper wall continuation | Object-based | Confirm exact visible casing extremity |
| `CP1-FL` | Object footprint | CP1 | Viewer-left identifiable front outer footprint corner | Stand in C facing CP1 | `CP1-CL`, `CP1-FR`; wall to `C0` | Object-based | Include only if externally targetable |
| `CP1-FR` | Object footprint | CP1 | Viewer-right identifiable front outer footprint corner | Stand in C facing CP1 | `CP1-FL`, `CP1-CR`; permanent wall to `PO1` | Object-based | Include only if externally targetable |
| `CP2-CL` | Object edge | CP2 | Viewer-left rear casing/footprint corner on the permanent boundary | Stand in C facing CP2 | upper wall continuation; `CP2-FL` | Object-based | Confirm exact visible casing extremity |
| `CP2-CR` | Object edge | CP2 | Viewer-right rear casing/footprint corner at the A–C structural wall | Stand in C facing CP2 | `CP2-FR`; structural wall | Object-based | Finished-face relationship to Room A requires survey |
| `CP2-FL` | Object footprint | CP2 | Viewer-left identifiable front outer footprint corner | Stand in C facing CP2 | `CP2-CL`, `CP2-FR`; permanent wall from `PI1` | Object-based | Include only if externally targetable |
| `CP2-FR` | Object footprint | CP2 | Viewer-right identifiable front outer footprint corner at the structural wall | Stand in C facing CP2 | `CP2-FL`, `CP2-CR`; structural wall | Object-based | Confirm externally targetable corner |

## Current bedroom stud-wall face nodes

| Identifier | Type | Room/object | Exact physical meaning | Viewing direction | Neighbours | Basis | Ambiguity for review |
|---|---|---|---|---|---|---|---|
| `PO1` | Stud-wall face point | Room C current bedroom wall | Top junction on the face toward open Room C, where the stud wall meets the permanent wall run from `CP1-FR` | Face toward open Room C | `CP1-FR`, `PO2`, `PI1` through wall thickness | User-corrected | Exact finished face and junction |
| `PI1` | Stud-wall face point | Room C current bedroom wall | Top junction on the face toward the current bedroom, where the stud wall meets the permanent wall run to `CP2-FL` | Face toward current bedroom | `CP2-FL`, `PI2`, `PO1` through wall thickness | User-corrected | Exact finished face and junction |
| `PO2` | Stud-wall face point | Room C current bedroom wall | Outer-face corner where the vertical stud-wall run turns into the horizontal run | Face toward open Room C | `PO1`, `PO3`, `PI2` across corner thickness | User-corrected | Exact finished corner |
| `PI2` | Stud-wall face point | Room C current bedroom wall | Inner-face corner where the vertical stud-wall run turns into the horizontal run | Face toward current bedroom | `PI1`, `PI3`, `PO2` across corner thickness | User-corrected | Exact finished corner |
| `PO3` | Stud-wall face point | Room C current bedroom wall | Outer-face end junction of the horizontal stud wall at the A–C wall | Face toward open Room C | `PO2`, `PI3` through end thickness | User-corrected | Exact finished-face junction with the A–C wall |
| `PI3` | Stud-wall face point | Room C current bedroom wall | Inner-face end junction of the horizontal stud wall at the A–C wall | Face toward current bedroom | `PI2`, `PO3` through end thickness | User-corrected | Exact finished-face junction with the A–C wall |

The active R5 model contains no retained conceptual glass-door gap. The stud wall is shown continuously and with thickness. Its planned demolition does not make it dimensionless for the current measured survey.

## Vertical object references

These are elevation datums, not additional plan nodes. `{face}` is required where a door has two measured faces.

| Object/face | Upper datum | Ceiling datum | Additional vertical datums | Proposed later observation |
|---|---|---|---|---|
| D1-A | `D1-A-UOC` | `D1-A-CLG` | — | upper outer casing ↔ ceiling |
| D2-A | `D2-A-UOC` | `D2-A-CLG` | — | upper outer casing ↔ ceiling |
| D2-C | `D2-C-UOC` | `D2-C-CLG` | — | upper outer casing ↔ ceiling |
| D3-B | `D3-B-UOC` | `D3-B-CLG` | — | upper outer casing ↔ ceiling |
| D3-C | `D3-C-UOC` | `D3-C-CLG` | — | upper outer casing ↔ ceiling |
| D4-C | `D4-C-UOC` | `D4-C-CLG` | — | upper outer casing ↔ ceiling |
| D5-B | `D5-B-UOC` | `D5-B-CLG` | — | upper outer casing ↔ ceiling |
| D5-WC | `D5-WC-UOC` | `D5-WC-CLG` | — | upper outer casing ↔ ceiling |
| W1 | `W1-UOC` | `W1-CLG` | `W1-SILL`, `W1-FFL` | upper casing ↔ ceiling; sill ↔ finished floor |
| W2 | `W2-UOC` | `W2-CLG` | `W2-SILL`, `W2-FFL` | upper casing ↔ ceiling; sill ↔ finished floor |
| CP1 | `CP1-UOC` | `CP1-CLG` | `CP1-BASE`, `CP1-FFL` | upper casing ↔ ceiling; lower casing/base ↔ finished floor |
| CP2 | `CP2-UOC` | `CP2-CLG` | — | upper casing ↔ ceiling |

For every vertical observation, record the exact floor/ceiling station and face used. Do not assume a level ceiling, level floor or matching height on an opposite face.

## Approval questions

Before Iteration 2, please approve or correct:

1. the revised Room C topology, especially CP1 and CP2 as parts of the stepped upper boundary;
2. the compact `C0–C2` permanent-node sequence;
3. every door casing node and its viewer-left/viewer-right interpretation;
4. the corrected `D3-CL → D2-CR` relationship: the permanent wall turns at `D3-CL`, and `D2-CR` lies 580 mm along the adjoining wall;
5. W1's A5/A6 relationship and the authoritative W2 mapping;
6. all four external footprint/casing nodes for CP1 and CP2;
7. the absence of `B0` from Room C while retaining it in Room B;
8. the vertical datum suffixes; and
9. the printed legibility and leader placement of every map label.

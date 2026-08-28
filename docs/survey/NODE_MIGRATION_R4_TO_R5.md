# Node migration record — R4 to R5

Status: **completed migration record retained with the active R5 node system**. The current Room C stud-wall correction supersedes the former single-face P-node treatment. Superseded R4 operational artefacts were removed during final cleanup and remain recoverable through Git history; see `../archive/R4_SURVEY_HISTORY.md`.

## Migration rules

- Physical topology is preserved unless the user supplied an explicit correction.
- Renaming or renumbering never moves a physical point.
- Door, window and cupboard outer edges replace ambiguous generic or prose-only endpoints.
- Left/right is always viewed from the named room or area while facing the object.
- CP1 and CP2 are integrated into the stepped Room C upper boundary, matching the whole-flat overview and the supporting topology evidence.
- Human-observed Room C survey evidence supersedes the earlier straight/no-corner interpretation: `D3-CL` is the permanent finished-wall turning corner, and `D2-CR` lies 580 mm along the adjoining wall. Because the D3 casing edge and permanent corner coincide, no duplicate generic C node is created there.
- `B0` remains a Room B node and is not used in the Room C detail.
- R4 `C8 → W2-CR` and R4 `C9 → W2-CL` are authoritative and must not be reversed.
- Wall-plane readings remain valid but receive no predeclared map identifiers.
- The old single-line Room C enclosure nodes `P1`/`P2`/`P3` are superseded by paired outer-face (`PO`) and inner-face (`PI`) stud-wall nodes so the current wall thickness remains measurable.

## Permanent-node migration

| R4 node | Proposed R5 node/treatment | Physical meaning | Location changed? | Iteration 2 labels/measurements likely affected |
|---|---|---|---|---|
| `A0` | `A0` retained | Upper A–C wall endpoint on Room A face | No | A perimeter and D2-A placement labels |
| `A1` | `A1` retained | Chimney left rear return | No | Room A perimeter/diagonals |
| `A2` | `A2` retained | Chimney left front corner | No | Room A perimeter/diagonals |
| `A3` | `A3` retained | Chimney right front corner | No | Room A perimeter/diagonals |
| `A4` | `A4` retained | Chimney right rear return | No | Room A perimeter |
| `A5` | `A5` retained | Upper-right W1-wall corner | No | W1 placement and Room A diagonals |
| `A6` | `A6` retained | Lower-right W1/D1-wall corner | No | W1 and D1 placement |
| `A7` | `A7` retained | Lower A–C wall endpoint on Room A face | No | D1/D2 placement and A perimeter |
| `C0` | `CP2-CR` | CP2 viewer-right rear corner at the A–C structural wall | No proposed move | R4 `D2-06`; CP2 adjacency and casing labels |
| `C1` | `CP2-CL` | CP2 viewer-left rear corner on the stepped upper boundary | No proposed move | CP2 exterior placement terminology |
| `C2` | `CP2-FL` | CP2 viewer-left front footprint corner | No proposed move | R4 `C03`; CP2 exterior labels |
| `C3` | `CP1-FR` | CP1 viewer-right front footprint corner | No proposed move | R4 `C12`, `C15`, `RC03`, `X05` |
| `C4` | `CP1-CR` | CP1 viewer-right rear corner on the stepped upper boundary | No proposed move | CP1 exterior width/projection labels |
| `C5` | `CP1-CL` | CP1 viewer-left rear corner on the stepped upper boundary | No proposed move | R4 `C06`, `C12`, `C13` |
| `C6` | `C0` | Lower-left permanent Room C shell corner below CP1 | No; identifier only | R4 `C06`, `C07`, `C14`, `C15`, `X04` |
| `C7` | `C1` | W2 recess return on the `W2-CR` side | No; identifier only | R4 `C07`, `C08`, `W2-04` |
| `C8` | `W2-CR` | Viewer-right W2 outer casing/opening edge | **No** | R4 `C08`, `W2-04`; all old C8 prose |
| `C9` | `W2-CL` | Viewer-left W2 outer casing/opening edge | **No** | R4 `C09`, `W2-05`; all old C9 prose |
| `C10` | `C2` | Permanent W2 recess return on the `W2-CL` side | No; identifier only | R4 `C09`, `C10`, `D4-03`, `W2-05`, `X05`, `SVC05` |
| `C15` | Retire; no separate replacement point | Former duplicate/intermediate corner interpretation between D3 and D2; the confirmed corner is `D3-CL` itself | Human-observed correction locates the wall turn at `D3-CL`; `D2-CR` is 580 mm along the adjoining wall | R4 `C11`, `RC04`, `D2-07`, `D3-07` |
| `Q1` | Retire as a pre-planned arbitrary wall target | Non-corner target formerly used for one long check | No shell point is moved | R4 `X09`; a later reading may describe the relevant wall plane directly |
| `P1` | Superseded by `PO1` / `PI1` | Paired top stud-wall faces on the `CP1-FR` to `CP2-FL` wall run | Yes: corrected onto the permanent wall run and split by wall thickness | R4 `C03`, `RC03`, `RC05`; active Room C baseline |
| `P2` | Superseded by `PO2` / `PI2` | Paired outer/inner corners where the stud wall turns | Face split only | R4 `C13`, `C14`, `RC01`; active stud-wall baseline |
| `P3` | Superseded by `PO3` / `PI3` | Paired outer/inner stud-wall end junctions at the A–C wall | Face split only | R4 `RC04`, `RC05`; active stud-wall baseline |
| `B0` | `B0` retained in Room B only | Room B upper-left corner | No | Room B perimeter and B-side D3/D4 relationships |
| `B1` / `T0` | Retained | Shared B/WC upper junction, with distinct finished faces | No | Room B/WC perimeter and D5 placement |
| `B2` / `T3` | Retained | Shared B/WC lower junction, with distinct finished faces | No | Room B/WC perimeter and D5 placement |
| `B3`, `B4`, `T1`, `T2` | Retained | Remaining Room B and WC permanent corners | No | Room B/WC perimeter and diagonals |

`CP1-FL` and `CP2-FR` are additional explicit object-footprint corners needed to complete the two cupboard footprints. They are new object references, not invented shell corners, and remain subject to confirmation that the physical corners are externally targetable.

### Room C numbering proposal

The resulting generic permanent Room C sequence is compact:

`C0 → C1 → W2-CR → W2-CL → C2`

The upper boundary is described by the explicit CP1/CP2 footprint nodes, not duplicate generic C nodes. Door nodes describe the lower/right openings. At `D3-CL`, the permanent wall turns onto the adjoining run; `D2-CR` lies 580 mm along that run. `D3-CL` retains its casing-edge identifier at the coincident permanent corner, and `B0` is not part of the Room C node sequence.

## Door-node migration

| R4 terminology | R5 plan node(s) | Treatment | Iteration 2 impact |
|---|---|---|---|
| D1-A casing-left/right | `D1-AL`, `D1-AR` | Shortened, explicit Room A face | Update D1 adjoining-wall labels; keep opening dimensions separate |
| D1 entrance/common face | None | Retired from internal node map | Remove external-face plan-node dependencies only; retain historical R4 provenance |
| D2-A casing-left/right | `D2-AL`, `D2-AR` | Explicit Room A face | Update D2-A placement labels |
| D2-C casing-left/right | `D2-CL`, `D2-CR` | Explicit Room C face | Place `D2-CR` on the adjoining wall, 580 mm from the turning corner at `D3-CL` |
| D3-B casing-left/right | `D3-BL`, `D3-BR` | Explicit Room B face | Update D3-B placement labels |
| D3-C casing-left/right | `D3-CL`, `D3-CR` | Explicit Room C face | Use `D3-CL` as both the D3 casing edge and coincident permanent finished-wall corner; retire `C15` rather than adding a duplicate generic node |
| D4-C casing-left/right | `D4-CL`, `D4-CR` | Explicit Room C face | Update D4 adjoining-wall labels |
| D4 shared-area face | None | Retired from internal node map | Remove shared-area plan-node dependencies only |
| D5-B casing-left/right | `D5-BL`, `D5-BR` | Explicit Room B face | Update B-side D5 placement |
| D5-WC casing-left/right | `D5-WCL`, `D5-WCR` | Use unambiguous `WC` area code | Update WC-side D5 placement and migration prose |

Door clear-opening, height, lining-depth and casing-profile observations remain object schedule concepts for Iteration 2; they are not plan-position nodes in this map.

## Window-node migration

| R4 node/term | R5 node | Physical rule | Location changed? | Iteration 2 impact |
|---|---|---|---|---|
| W1 upper/near edge in old page-oriented prose | `W1-AL` | Room A viewer-left outer edge, nearest A5 | No proposed move | Replace W1 placement prose |
| W1 lower/far edge in old page-oriented prose | `W1-AR` | Room A viewer-right outer edge, nearest A6 | No proposed move | Replace W1 placement prose |
| `C8` / W2 old left-page edge | `W2-CR` | Room C viewer-right edge | No | R4 `C08`, `W2-04` and map labels |
| `C9` / W2 old right-page edge | `W2-CL` | Room C viewer-left edge | No | R4 `C09`, `W2-05` and map labels |

The W2 mapping above is explicit user instruction. Iteration 2 must not infer a reversal from drawing-page orientation or older descriptions.

## Cupboard-object migration

| R4 object/term | R5 object/node | Treatment | Iteration 2 impact |
|---|---|---|---|
| Cupboard object `C1` | `CP1` | Rename object to prevent collision with Room C nodes | Rename `C1-EXT-*`, `C1-INT-*`, CP1 service datums and documentation while preserving provenance |
| Cupboard object `C2` | `CP2` | Rename object to prevent collision with Room C nodes | Rename `C2-EXT-*`, `C2-INT-*` and documentation while preserving provenance |
| R4 CP1-coincident `C3–C5` | `CP1-FR`, `CP1-CR`, `CP1-CL` | Replace generic nodes with explicit footprint nodes | Update all affected Room C and cupboard labels |
| New targetable CP1 front-left corner | `CP1-FL` | Complete the external CP1 footprint | Add only if physically identifiable |
| R4 CP2-coincident `C0–C2` | `CP2-CR`, `CP2-CL`, `CP2-FL` | Replace generic nodes with explicit footprint nodes | Update all affected Room C and cupboard labels |
| New targetable CP2 front-right corner | `CP2-FR` | Complete the external CP2 footprint | Add only if physically identifiable |

No internal shelf, cupboard leaf, stored item, boiler/cylinder component or hidden construction becomes a plan node.

## Vertical references introduced for review

No wall-face identifiers are introduced. Later wall-plane observations can be described from topology, named endpoints and the recorded observation direction.

The proposed vertical datum suffixes are:

- `{object-face}-UOC` — upper outer casing;
- `{object-face}-CLG` — corresponding ceiling station;
- `W#-SILL` and `W#-FFL` — window sill and finished floor below;
- `CP1-BASE` and `CP1-FFL` — CP1 lower casing/base and finished floor below.

The approved object schedules use these datums where applicable. This document itself creates no measurement plan.

## Historical downstream update list

At the time this migration was proposed, the following downstream files were expected to require coordinated updates:

- `docs/survey/LASER_MEASUREMENT_MAP.svg`;
- `docs/survey/LASER_SURVEY_FORM.html`;
- `docs/survey/LASER_SURVEY_FORM.pdf`;
- `docs/survey/MEASUREMENT_PLAN.json`;
- `SURVEY_CAPTURE_SHEET.md`;
- `MEASUREMENT_REGISTER.md`;
- `SURVEY_PLAN.md`;
- `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`;
- `scripts/survey_r4_model.ps1` or its approved R5 replacement;
- `scripts/build_survey_artifacts.ps1`;
- `scripts/build_survey_form_html.ps1`;
- `scripts/build_survey_pdf.ps1` if output naming changes;
- `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md` and `CHANGELOG.md`.

This list is retained only as migration provenance. The superseded R4 operational files were later removed; see `../archive/R4_SURVEY_HISTORY.md`.

## Historical human approval gate

The approval review covered:

1. the revised Room C topology and cupboard integration;
2. the compact `C0–C2` Room C numbering;
3. every door face and casing-edge node;
4. the former straight `D3-CL → D2-CR` relationship with no inserted corner (superseded by the later physical-survey correction locating the turn at `D3-CL` and `D2-CR` 580 mm along the adjoining wall);
5. W1 and W2 edge identities;
6. every CP1/CP2 casing and footprint corner;
7. `B0` appearing only in Room B;
8. the vertical datum convention; and
9. map-label legibility at normal zoom and on an A4 print.

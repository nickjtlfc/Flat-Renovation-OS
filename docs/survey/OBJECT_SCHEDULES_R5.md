# R5 object measurement schedules

Status: **retained detailed reference; no longer the compulsory remaining-room field schedule**.

Following the Room A field pilot, `LASER_SURVEY_FORM_R5.pdf` now uses compact human-led records for D2-D5, W2, CP1 and CP2. The detailed rows below remain useful provenance and optional prompts, but surveyors should not force inaccessible or ambiguous finishes into this rigid schema. Use supplemental measurements, photographs and plain-English notes instead.

Use with:

- `NODE_REFERENCE_MAP_R5.svg`
- `NODE_REFERENCE_REGISTER_R5.md`
- `OBJECT_MEASUREMENT_GUIDES_R5.html` or its matching PDF

The approved node files control object names, faces and plan-position references. The guide pack explains each generic measurement visually. All readings are in millimetres unless explicitly recorded otherwise.

## Shared rules

- Left and right are viewed while standing in the named room or area and facing the object.
- `CL` and `CR` are outer visible casing edges, not clear-opening edges.
- Door leaves, cupboard doors, shelves and hidden construction are not positioning datums.
- Record the actual finished floor, ceiling and wall surfaces used.
- Preserve blocked, repeated and contradictory readings without guessing or silently reconciling them.
- The schedule is structured object work within the node-first workflow; it does not limit supplemental observations.

## Door schedule

### Applicable door faces

| Door | R5 measured face(s) | Approved casing nodes |
|---|---|---|
| D1 | Room A only: `D1-A` | `D1-AL`, `D1-AR` |
| D2 | Room A: `D2-A`; Room C: `D2-C` | `D2-AL`, `D2-AR`; `D2-CL`, `D2-CR` |
| D3 | Room B: `D3-B`; Room C: `D3-C` | `D3-BL`, `D3-BR`; `D3-CL`, `D3-CR` |
| D4 | Room C only: `D4-C` | `D4-CL`, `D4-CR` |
| D5 | Room B: `D5-B`; WC: `D5-WC` | `D5-BL`, `D5-BR`; `D5-WCL`, `D5-WCR` |

D1's entrance/common face and D4's shared-area face are deliberately excluded from the active R5 internal schedule.

### One opening record per door

Replace `{D#}` with D1–D5.

| Schedule suffix | Measurement | From/reference | To/reference | Guide |
|---|---|---|---|---|
| `{D#}-CLEAR-W` | Clear opening width | clear lining/opening edge | opposite clear lining/opening edge | D01 |
| `{D#}-CLEAR-H` | Clear opening height | finished threshold/floor datum | underside of clear opening head | D02 |
| `{D#}-LINING-D` | Finished wall/lining depth | named room finished wall face | opposite named-area finished wall face through lining | D07 |

`LINING-D` records the finished reveal/lining condition; it does not prove hidden structural wall thickness.

### One face record for every applicable face

Replace `{FACE}` with the face names in the table above. Replace `{CL}` and `{CR}` with that face's approved casing nodes.

| Schedule suffix | Measurement | From/reference | To/reference | Guide |
|---|---|---|---|---|
| `{FACE}-OC-W` | Outer casing width | `{CL}` | `{CR}` | D03 |
| `{FACE}-OC-H` | Outer casing height | actual lower outer-casing datum | `{FACE}-UOC` | D04 |
| `{FACE}-TRIM-L` | Left casing trim width | `{CL}` | clear opening's viewer-left edge | D05 |
| `{FACE}-TRIM-R` | Right casing trim width | clear opening's viewer-right edge | `{CR}` | D06 |
| `{FACE}-PROJ-MAX` | Maximum visible casing projection | named finished wall face | furthest visible casing face, square to wall | D08 |
| `{FACE}-UOC-CLG` | Upper outer casing to ceiling | `{FACE}-UOC` | `{FACE}-CLG` directly above | D09 |
| `{FACE}-LOWER-FFL` | Lower casing/frame datum to finished floor | actual lower casing/frame reference | finished floor directly below | D10 |

If the lower casing/frame datum meets the finished floor, record `0` and identify the datum rather than omitting the row. This vertical is retained for later 3D reconstruction.

### Door positioning logic

Position doors using the approved casing nodes and adjoining permanent references. The leaf and hinge are observations only.

| Door face | Positioning sequence or relationship |
|---|---|
| D1-A | `A6 → D1-AL → opening → D1-AR → A7` |
| D2-A | `A7 → D2-AL → opening → D2-AR → A0` |
| D2-C | structural wall above → `D2-CL → opening → D2-CR → 580 mm adjoining wall → D3-CL` permanent turning corner |
| D3-B | `B0 → D3-BL → opening → D3-BR → B1` |
| D3-C | wall from D4 → `D3-CR → opening → D3-CL` permanent turning corner → 580 mm adjoining wall → `D2-CR` |
| D4-C | `C2 → D4-CR → opening → D4-CL` → wall toward D3 |
| D5-B | `B1 → D5-BL → opening → D5-BR → B2` |
| D5-WC | `T3 → D5-WCL → opening → D5-WCR → T0` |

Exact measured segments may be baseline or supplemental observations; they need not be duplicated as compulsory object rows.

## Window schedule

### Applicable windows

| Window | Viewing room | Approved plan-position nodes | Adjacent permanent references |
|---|---|---|---|
| W1 | Room A | `W1-AL`, `W1-AR` | `A5`, `A6` |
| W2 | Room C | `W2-CL`, `W2-CR` | `C2` on the `W2-CL` side; `C1` on the `W2-CR` side |

For W2, viewer-left/right must not be reversed from page orientation: `W2-CL` is the viewer-left casing/opening edge and `W2-CR` is viewer-right when standing in Room C facing W2.

### One record per window

Replace `{W#}` with W1 or W2.

| Schedule suffix | Measurement | From/reference | To/reference | Guide |
|---|---|---|---|---|
| `{W#}-OUTER-W` | Outer visible opening/casing width | approved viewer-left casing/opening edge | approved viewer-right casing/opening edge | W01 |
| `{W#}-OUTER-H` | Outer visible opening/casing height | lower outer opening/casing datum | upper outer opening/casing datum | W02 |
| `{W#}-FRAME-W` | Visible frame width | visible frame left edge | visible frame right edge | W03 |
| `{W#}-FRAME-H` | Visible frame height | visible frame bottom | visible frame top | W04 |
| `{W#}-RECESS-D` | Accessible recess/wall depth | named finished wall face | nominated visible frame face, square to wall | W05 |
| `{W#}-UOC-CLG` | Upper outer casing/opening to ceiling | `{W#}-UOC` | `{W#}-CLG` directly above | W06 |
| `{W#}-SILL-FFL` | Finished sill to finished floor | `{W#}-SILL` | `{W#}-FFL` directly below | W07 |
| `{W#}-LOWER-FFL` | Lower outer casing/opening datum to finished floor | nominated lower outer datum | finished floor directly below | W08 |

Record both W07 and W08 when the sill and lower outer casing/opening datum are distinct. Do not infer one from the other without a documented derivation.

### Window positioning logic

| Window | Required interpretation |
|---|---|
| W1 | `A5 → W1-AL → window → W1-AR → A6` |
| W2 | `C2 → W2-CL → window → W2-CR → C1` when written in viewer-left-to-right order |

These are plan-position relationships. Use the actual wall path and measured references; the guide diagram is not geometry.

## Cupboard schedule

### Applicable cupboards

| Cupboard | Approved rear/wall-side nodes | Approved front footprint nodes |
|---|---|---|
| CP1 | `CP1-CL`, `CP1-CR` | `CP1-FL`, `CP1-FR` |
| CP2 | `CP2-CL`, `CP2-CR` | `CP2-FL`, `CP2-FR` |

CP1 and CP2 replace the old R4 cupboard-object names C1 and C2. Internal shelves, cupboard doors, stored items, boiler/cylinder components and hidden construction remain non-positioning features.

### One record per cupboard

Replace `{CP#}` with CP1 or CP2.

| Schedule suffix | Measurement | From/reference | To/reference | Guide |
|---|---|---|---|---|
| `{CP#}-REAR-W` | Rear/wall-side outer footprint width | `{CP#}-CL` | `{CP#}-CR` | C01 |
| `{CP#}-FRONT-W` | Front outer footprint width | `{CP#}-FL` | `{CP#}-FR` | C02 |
| `{CP#}-PROJ-L` | Viewer-left outer projection | `{CP#}-CL` | `{CP#}-FL` | C03 |
| `{CP#}-PROJ-R` | Viewer-right outer projection | `{CP#}-CR` | `{CP#}-FR` | C04 |
| `{CP#}-OUTER-H` | Outer casing/footprint height | nominated lower outer datum | upper outer casing/top | C05 |
| `{CP#}-INT-W` | Accessible internal clear width | clear internal left surface | clear internal right surface | C06 |
| `{CP#}-INT-D` | Accessible internal depth | clear internal front datum | accessible internal back surface | C07 |
| `{CP#}-INT-H` | Accessible clear internal height | internal base | accessible internal top | C08 |
| `{CP#}-TOP-CLG` | Upper casing/top to ceiling | nominated upper outer casing/top | ceiling directly above | C09 |
| `{CP#}-BASE-FFL` | Bottom/base/lower casing to finished floor | nominated cupboard base/lower casing | finished floor directly below | C10 |

Where the two projections or widths differ, retain both readings; do not force the footprint square. If a front or internal corner is not physically targetable, mark the row blocked and explain the obstruction.

## Scope boundary

These schedules and the generic guide pack support the approved recording form. They do not:

- predetermine every valid baseline or supplemental measurement;
- accept geometry;
- create a shell or solver;
- authorise copying dimensions from any SVG.

# Evidence map correction log

## 2026-07-27 — Conceptual survey-basis approval

The user accepted the corrected evidence map as sufficiently accurate to design the measured-survey strategy.

This approval is explicitly limited:

- it does not approve the map’s geometry;
- it does not establish an accepted shell;
- it does not verify dimensions, proportions, angles or wall thicknesses;
- it authorises regeneration of the laser measurement map and reconciliation of the field sheet only.

After survey collection and review, measured-survey data becomes the authoritative geometry input for the first true-to-scale digital shell. The evidence map then ceases to be the primary geometry source and remains only as provenance and spatial interpretation context. The structured shell will require a separate approval decision.

The existing `LASER_MEASUREMENT_MAP.svg` and `SURVEY_CAPTURE_SHEET.md` were not regenerated as part of this documentation update.

## 2026-07-27 — Revision Candidate vNext review amendments

This was a local review revision, not a topology redesign.

| Requested amendment | Revision made | Verification still required |
|---|---|---|
| Room A / Room B / WC boundary | Added a continuous permanent Room A lower wall above both Room B and the WC | Exact wall lengths, junctions and build-up |
| D2 | Moved the approximate opening below the purple enclosure so it enters permanent Room C | Exact position, width, jambs and swing |
| Electricity entry | Moved `E` immediately right of D1 in the corner | Exact intake point and concealed route |
| C1 water/boiler services | Moved the service symbol inside the lower part of the unchanged C1 footprint | Exact inlet/equipment point and routes |
| Chimney breast | Replaced the earlier dashed approximation with the stepped permanent-shell form shown by the latest rough sketch | Exact width, depth, angles and offset |

### Deliberately preserved

- Overall stepped shell footprint and Room A/B/C/WC topology
- Purple Room C enclosure
- D1, D3, D4 and D5 general relationships
- W1/W2 and C1/C2 interpretation
- Structural-sensitive A–C wall classification
- Soffit and other general service interpretations

### Approval status

At that stage the result was **Revision Candidate vNext**. `LASER_MEASUREMENT_MAP.svg` and `SURVEY_CAPTURE_SHEET.md` remained unchanged pending the later conceptual survey-basis approval recorded above.

## 2026-07-27 — Corrected from block-based topology to supplied sketch topology

### Trigger

The user supplied `source-material/plans/rough-paint-sketch.jpg` and stated that it, together with `2dPlan.jpeg`, is the principal authority for overall shell topology, general footprint, room relationships, major recesses/projections and the removable Room C bedroom enclosure.

The sketch was subsequently amended by the user so that the downward bathroom projection is correctly labelled `ROOM B`.

### Superseded interpretation

The earlier `PROVISIONAL_FLAT_EVIDENCE_MAP.svg` used broad room blocks:

- Room C and Room A were regularised into adjoining large shapes.
- Room B was made too broad and placed beneath much of the A–C junction.
- The WC was placed inside that broad Room B block.
- C1/C2 projections, the W2 recess and lower wall/opening steps were not represented faithfully.
- The purple/current bedroom enclosure was represented as a central freestanding box rather than the two-sided enclosure shown by the new sketch.

That version is no longer an authority for topology.

### Corrections made

| Area | Earlier interpretation | Corrected interpretation | Principal source |
|---|---|---|---|
| Upper footprint | Large simplified C/A blocks | Stepped shell with C1 and C2 upper projections | Rough sketch + original plan |
| Room C lower edge | Simplified continuous boundary | W2 recess plus irregular D4/D3/D2 sequence | Rough sketch + original plan |
| Room B | Broad block beneath C/A | Narrower downward bathroom projection | Rough sketch + original plan |
| WC | Internal sub-box within B | Attached upper-right compartment beside B | Rough sketch + original plan |
| Room C enclosure | Central box | Purple vertical partition with horizontal return to A–C wall | Rough sketch + user clarification |
| A–C wall | Oversimplified full divider | Structural wall ending at the D2 opening | Original plan refined by rough sketch |
| Openings | General identities, weak placement | D1–D5 placed on the walls/edges shown by the new sketch | Sketch labels + transcript/plan |
| Chimney breast | Fixed feature in an incorrect block context | Retained as dashed plan/photo refinement inside corrected Room A | Original plan + Room A photos |
| Soffit | Broad uncertain zone | Gold-labelled lower-right Room B warning zone | Rough sketch + photos/walkthrough |

### Source conflicts and decisions

- The initial rough sketch contained a second `ROOM C` label in the downward projection. The user corrected the source file to `ROOM B` before finalisation. No conflict remains.
- At the time of the first correction, the rough sketch omitted the Room A chimney breast, so it was shown as an approximate dashed plan/photo refinement. The later vNext sketch now supplies its general stepped shape.
- Door-leaf indications in the sketch are not treated as verified hinge/swing records.
- C1/C2 and the soffit are retained because they are labelled, but their drawn sizes are not treated as proportions.
- The proposed serving hatch is not positioned because no source establishes an accepted location.

### Downstream status

- `docs/survey/LASER_MEASUREMENT_MAP.svg` was **not modified** at this stage and remained invalid pending the later approval milestone recorded above.
- `SURVEY_CAPTURE_SHEET.md` was **not modified**.
- `MEASUREMENT_REGISTER.md` measurement paths were **not modified**.
- No renovation-planner application code was created or changed.
- No coordinate, angle, length or wall thickness in the corrected SVG is dimensionally verified.

### Approval gate

The corrected SVG must be reviewed by the user against both plan images. Any further correction should be recorded here before rebuilding the laser measurement map.

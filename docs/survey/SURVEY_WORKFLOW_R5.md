# R5 measured-survey workflow

Status: **active remaining-room workflow, revised after the Room A field pilot**.

The approved R5 node-reference system defines the shared language for physical measurement references:

- `NODE_REFERENCE_MAP_R5.svg`
- `NODE_REFERENCE_REGISTER_R5.md`
- `NODE_MIGRATION_R4_TO_R5.md`

The map establishes topology and reference names. It is not measured geometry, and its drawn distances, angles, proportions and wall thicknesses must never be used as measurements.

## 1. Approved node-reference system

Before measuring, use the approved map and register to identify permanent nodes and the named edges of doors, windows, cupboards and the removable Room C enclosure.

A reference does not have to be a formal node. A repeatable plain-English description is valid when that is the clearest physical reference, for example `A5–A6 wall`, `opposite cupboard back`, or `C5–C6 wall through D2`. Do not invent artificial wall-face IDs.

## 2. Baseline room measurements

Record a short minimum set of obvious permanent room-boundary segments, useful diagonals and important cross-room ties. The baseline checklist is a minimum, not a limit and not a claim that every useful measurement can be anticipated before the visit.

Each reading must identify the actual start and target, unit, relevant height or datum, route through an opening where applicable, and any obstruction or unusual target setup.

## 3. Human-led openings and enclosed features

For the remaining Room B, WC and Room C survey, doors and windows use compact evidence records rather than the former multi-row object schedules. Record the actual opening reference points, clear or visible opening, outer casing/surround where measurable, wall/return relationship, photographs and any reason the normal rear-of-opening method could not be used. Do not assume symmetrical casing, two visible casing edges, a separate architrave, or a knowable hidden structural opening.

Survey CP1 and CP2 progressively from the visible exterior inward. Describe what can be seen, photograph it, record individual dimensions mainly as supplemental observations, and preserve access limitations and concealed areas. Do not force a square or complete cupboard model from the field form.

`OBJECT_SCHEDULES_R5.md` and `OBJECT_MEASUREMENT_GUIDES_R5.html` / `.pdf` remain available as detailed historical/optional references, but their former exhaustive rows are not compulsory in the revised field form.

## 4. Supplemental free-form measurements

Take additional measurements whenever they are physically possible and likely to improve reconstruction or validation. Valid observations include:

- node to node;
- node to casing node;
- casing node to casing node;
- room diagonals;
- cross-room spans;
- wall to wall through an open doorway;
- clear spans to a repeatable plain-English reference;
- repeat or validation measurements taken for a stated reason.

An observation is not invalid merely because it was not listed in advance. Room A already uses `SUP-001` through `SUP-064`; the revised remaining-room form reserves exactly `SUP-065` through `SUP-264`. Preserve the exact route, datum and physical references, and use ordinary-language endpoints whenever that is clearer than inventing a formal node.

## 5. Measurement entry

Use `LASER_SURVEY_FORM_R5.pdf` for field recording, `MEASUREMENT_INPUT_TEMPLATE_R5.md` for later human-readable transcription and `MEASUREMENT_SCHEMA_R5.json` for later structured exchange. `SURVEY_PACK_INDEX_R5.md` explains the revised pack. Review each room's raw evidence with a human before formalising geometry.

Record raw values exactly as observed. Use millimetres unless a source explicitly uses another unit, in which case preserve the original unit and normalise only in a separate documented step. Do not silently alter, average, round or discard a reading to make it agree with another reading.

Blocked or deferred observations remain records with their reason and status; they are not guessed values.

## 6. Contradiction and completeness review

Codex will later consider baseline, object and supplemental observations together as geometric constraints. The review will:

- identify missing or weakly connected areas;
- compare overlapping observations and segment totals;
- identify inconsistent surfaces, datums or routes;
- preserve repeated and conflicting raw readings;
- request the smallest useful set of re-measurements;
- distinguish direct readings from later derivations.

Contradictions remain visible until a human-reviewed resolution is supported by evidence. Raw readings must never be silently changed to force closure.

## 7. Construction of the first measurement-driven shell

Only after measurement entry and contradiction review may a first digital shell be proposed. Reviewed measured values—not SVG proportions—will supply its geometric constraints.

The first shell must retain provenance, uncertainty and unresolved conflicts. Producing it does not automatically make it accepted geometry.

## 8. Human review and later professional verification

The user must review the proposed shell before it becomes the operational geometry source. Structural composition, concealed services, regulatory matters and any feature requiring opening-up remain subject to appropriate professional verification.

No geometry has yet been accepted as measured geometry. The next stage is physical measurement collection using `SURVEY_PACK_INDEX_R5.md`. Transcription, contradiction review and shell construction remain separate later stages; this workflow creates no digital shell, geometry solver or imported measurement.

# R5 remaining-room field survey pack

Status: **reissued for Room B, WC and Room C following the Room A field pilot**.

## Active field documents

### Node reference map

`NODE_REFERENCE_MAP_R5.svg`

Use the existing map to identify approved permanent nodes, opening-edge references, cupboard footprint references and both faces of the current Room C stud wall. The map is conceptual and not a source of dimensions.

### Recording form

`LASER_SURVEY_FORM_R5.pdf`

The revised form is the authoritative writable field document for the remaining survey. It contains:

- 7 Room B planned node-to-node rows;
- 5 WC planned node-to-node rows;
- 10 Room C permanent-boundary rows;
- 7 Room C stud-wall face/thickness rows;
- compact human-led records for D2-D5, W2, CP1 and CP2;
- exactly 200 flexible supplemental rows, `SUP-065` through `SUP-264`;
- wide Notes fields for photographs, uncertainty, repeats and exceptions.

Room A has already been surveyed and reconstructed. Its completed evidence and `SUP-001` through `SUP-064` are not repeated or renumbered in this form.

## Optional detailed references

`OBJECT_MEASUREMENT_GUIDES_R5.pdf` and `OBJECT_SCHEDULES_R5.md` preserve the earlier detailed opening/casing/cupboard concepts. They may help interpret a feature, but the former exhaustive object rows are no longer compulsory. The compact records and supplemental pages govern actual remaining-room field capture.

## Field order

1. Complete planned node-to-node rows for the room.
2. Take useful repeats.
3. Add diagonals, triangulation, doorway checks and unexpected observations using the next supplemental ID.
4. Describe ordinary-language endpoints precisely when formal nodes are unsuitable.
5. Photograph unusual casing, blocked points, cupboards and ambiguous endpoints.
6. Survey cupboards from outside inward without inventing hidden geometry.
7. Mark uncertainty and review each room before reconstruction.

## Supporting sources

- `NODE_REFERENCE_REGISTER_R5.md` defines formal references.
- `SURVEY_WORKFLOW_R5.md` governs collection and later review.
- `MEASUREMENT_INPUT_TEMPLATE_R5.md` and `MEASUREMENT_SCHEMA_R5.json` support later transcription.
- `PRE_SURVEY_AUDIT_R5.md` records validation of the regenerated form.

No Room B, WC or Room C geometry is solved or accepted by this pack.

## Reproduction

Run `scripts/build_r5_survey_form.ps1` with no arguments to regenerate `LASER_SURVEY_FORM_R5.pdf` from the authoritative HTML source using a fresh temporary Chrome/Edge profile.

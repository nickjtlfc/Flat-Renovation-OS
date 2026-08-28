# Changelog

This file records significant project decisions, verified measurements, structural discoveries, feature additions and changes to the renovation planning application.

## Format

Each entry should include:

- Date
- Version (if applicable)
- Summary
- Reason for change
- Files affected (if relevant)

Only meaningful project changes should be recorded. Minor formatting or refactoring changes should be omitted unless they affect the behaviour or future understanding of the project.

---

## History

### 2026-08-15 - Re-anchor the CP1 lower access assembly from CP1-FL

- Shifted the complete unchanged 722 mm lower access assembly 50.70 mm toward CP1-FL so its left outer casing edge is exactly 535 mm from `CP1-FL`.
- New outer casing coordinates are `(589.99, -3690.92)` to `(1311.99, -3690.92)` mm, leaving 293.70 mm to `PO1`. The 560 mm leaf, 80 mm side casings, 1 mm side clearances, 772 mm height, closed state and absence of top casing are unchanged.
- Retained the earlier 243 mm PO1-side observation only as unresolved local field evidence; it differs from the model-implied 293.70 mm by 50.70 mm.
- Preserved the enclosure frontage/depth/height, lip, water-inlet marker, suspended upper CP1 body and all promoted Room C coordinates.

**Files affected:** `data/3d/vertical-model-v0_1.json`, `scripts/generate_3d_shell_v0_1.mjs`, `scripts/validate_3d_shell_v0_1.mjs`, `public/generated/flat-shell-v0_1.json`, `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`, `CHANGELOG.md`.

### 2026-08-15 - Add the existing CP1 lower service enclosure and access assembly

- Added `CP1-LOWER-SERVICE-ASSEMBLY` beneath the unchanged suspended CP1 body: a 10 mm-deep enclosure from FFL to 1315 mm, split around a closed 722 × 772 mm access assembly.
- Represented the measured 560 mm leaf, 80 mm left/right casings, 1 mm side clearances and explicit absence of top casing. Added the continuous 50 × 60 mm projecting lip at 1265–1315 mm.
- Preserved the field-evidence conflict instead of moving source nodes: the promoted 1550.70 mm CP1-FL-to-PO1 frontage minus the 535/243 mm stations implies 772.70 mm, leaving a 50.70 mm residual against the measured 722 mm assembly. The PO1-side 243 mm station controls the rendered placement because it is visually exposed; the separate CP1-FL station remains recorded.
- Added a deliberately simple 150 mm-high right-side `CP1-WATER-INLET-REFERENCE`; its 18 mm diameter is a display convention, not a pipe specification.
- Recorded the lower enclosure as existing joinery/services while preserving a separate design-stage note that it may later be explored for alteration/removal. It is not reclassified as the existing removable partition.
- Added deterministic generator/runtime guards for enclosure span/depth/height, door and casing dimensions, no top casing, lip projection, water marker, raycast surfaces, unchanged upper CP1 datums and promoted geometry invariance.

**Files affected:** `data/3d/vertical-model-v0_1.json`, `scripts/generate_3d_shell_v0_1.mjs`, `scripts/validate_3d_shell_v0_1.mjs`, `src/main.js`, `src/segment-box-runtime.js`, `src/cp1-lower-service-runtime.js`, `public/generated/flat-shell-v0_1.json`, `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`, `CHANGELOG.md`.

### 2026-08-15 - Complete the recessed W2 upper and lower wall mass

- Replaced the intermediate 80 mm-deep `W2-C-UPPER-WALL-STRIP` with the authoritative `W2-C-UPPER-WALL-INFILL` and added `W2-C-LOWER-WALL-INFILL`.
- Both permanent infills span unchanged `C1` `(330, 0)` mm to `C2` `(1599, 0)` mm and extend 164.98 mm from the Room C finished face to the protected recessed W2 frame/casing plane.
- The upper infill remains 2556–2631 mm: 75 mm in the frozen model against the approximately 72 mm field observation. The lower infill is 0–1040 mm. The protected 1040–2556 mm W2 opening remains unobstructed.
- Updated shared viewer/validator runtime composition so the generated infills are visible, raycastable permanent surfaces; deterministic guards check exact mesh bounds, both front-face raycasts, frame-plane contact, opening clearance and absence of duplicate W2 head/strip meshes.
- Did not move C1, C2, W2 endpoints, frame, glazing, sill/head, ceiling, any promoted XY coordinate, or any other room geometry.

**Files affected:** `data/3d/vertical-model-v0_1.json`, `scripts/generate_3d_shell_v0_1.mjs`, `scripts/validate_3d_shell_v0_1.mjs`, `src/main.js`, `src/segment-box-runtime.js`, `src/window-wall-runtime.js`, `public/generated/flat-shell-v0_1.json`, `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`, `CHANGELOG.md`.

### 2026-08-14 - Correct the Room C W2 upper wall-strip topology

- Corrected the previous misunderstanding that located the upper wall on the recessed `W2-CR` to `W2-CL` edge. The single explicit permanent feature is now `W2-C-UPPER-WALL-STRIP`, spanning the unchanged main-wall nodes `C1` `(330, 0)` mm to `C2` `(1599, 0)` mm.
- Recorded the new approximately 72 mm direct field observation. The protected vertical datums generate a 75 mm band, so the 3 mm field/model closure remains documented rather than moving the W2 frame/glazing or ceiling.
- Applied the Room C finished-face plane at y = 0 mm and outward 80 mm visual thickness. The protected recessed W2 window/casing remains at y = 164.98 mm, leaving 84.98 mm of plan clearance beyond the strip's outward face and preventing any coverage of the window.
- Retired the superseded `W2-C-WALL-HEAD` representation. Shared runtime helpers used by both viewer and validator now assert one explicit C1-to-C2 strip, no `W2-HEAD-WALL` or superseded duplicate, exact production mesh bounds, correct metadata and deterministic raycast behaviour.
- Did not alter promoted XY geometry, C1/C2, W2 plan coordinates, other rooms, D5, or proposed geometry.

**Files affected:** `data/3d/vertical-model-v0_1.json`, `scripts/generate_3d_shell_v0_1.mjs`, `scripts/validate_3d_shell_v0_1.mjs`, `src/main.js`, `src/segment-box-runtime.js`, `src/window-wall-head-runtime.js`, `public/generated/flat-shell-v0_1.json`, `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`, `CHANGELOG.md`.

### 2026-08-14 - Correct WC D5 wall-head rendering, casing evidence and validation semantics

- Moved only the generated `D5-WC-WALL-HEAD` permanent surface from the D5 clear/leaf plane to the WC permanent wall / outer-casing-boundary plane, retaining the clear opening's longitudinal head span.
- Corrected the wall-head's independent room-facing orientation after a field check proved that the prior 80 mm box extended into the WC: the pre-fix selectable face was x = 5180.347 mm, while the corrected WC-facing source surface is x = 5100.347 mm and the schematic thickness now extends outside the room to x = 5020.347 mm.
- Recorded the direct D5 WC casing observations: 90 mm above the unchanged 1974 mm opening/leaf top, 30 mm proud of the finished wall and 226 mm local clearance to the ceiling. The casing top is now 2064 mm; the selected 2289 mm flat ceiling gives a separately documented 225 mm rendered clearance and 1 mm closure difference.
- Added explicit viewer descriptions for T0-T3 so T1-T3 are no longer mislabeled as generic opening/casing references.
- Recorded that `T0-WALL-1300` is physically inaccessible behind the integrated casing; retained the 1961 mm casing-level and 1967 mm high-level underlying-wall comparisons as a closed 6 mm semantic check.
- Added deterministic validation for the corrected wall-head plane, unchanged D5 clear endpoints, predicted 1662.688 mm perpendicular span to `WC-WALL-02`, programmatic WC-side raycast, casing height/projection evidence, promoted hash, unchanged T0-T3 coordinates and explicit T0-T3 descriptions.
- Did not alter promoted geometry, D5 source nodes, the clear opening, leaf/rebate plane, casing XY nodes or width, Room B, or any solved survey coordinate.

**Files affected:** `scripts/generate_3d_shell_v0_1.mjs`, `scripts/validate_3d_shell_v0_1.mjs`, `src/measurement-utils.js`, `src/main.js`, `data/3d/vertical-model-v0_1.json`, `data/3d/survey-validation-v0_1.json`, `public/generated/flat-shell-v0_1.json`, `docs/survey/ROOM_WC_EVIDENCE_v1.md`, `docs/survey/ROOM_B_EVIDENCE_v1.md`, `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`, `CHANGELOG.md`.

### 2026-08-03 - Compact the R5 printable field form

- Reduced the printable Rooms B, WC and Room C survey form from 44 pages to a compact 14-page handwritten capture sheet.
- Retained all 29 planned node-to-node rows and all 200 supplemental IDs (`SUP-065` through `SUP-264`) while consolidating context into wide Notes fields.
- Removed visible-services pages, photograph registers, review pages and pre-survey measurement advice from the printable interface without changing survey evidence, the node network, the measurement schema or any solver.

**Files affected:** `docs/survey/LASER_SURVEY_FORM_R5.html`, `.pdf`, `CHANGELOG.md`.

### 2026-08-03 - Rebuild R5 form for Room B, WC and Room C

- Preserved all 29 active non-Room-A baseline rows: Room B 7, WC 5, Room C permanent boundary 10 and Room C stud wall 7.
- Replaced the compulsory 107-row structured-object schedule with compact human-led records for D2-D5, W2, CP1 and CP2 while retaining the detailed object schedule/guide as optional provenance.
- Added exactly 200 flexible supplemental observations, `SUP-065` through `SUP-264`, with ordinary-language endpoints, repeat, uncertainty, photograph and notes fields.
- Added a front-page workflow, prominent photograph guidance/registers and separate B/WC and Room C review sheets.
- Retained relevant transition, ceiling, enclosure, soffit and visible-service IDs; omitted completed Room A-only work without changing Room A evidence or `SUP-001` through `SUP-064`.
- Regenerated and visually verified the 44-page A4-landscape PDF; corrected an initial door-page overflow by splitting the door records across two pages.

**Reason for change:** The Room A field pilot showed that rigid casing and cupboard schedules were less useful than a planned-node minimum plus generous supplemental, photographic and plain-English evidence capture.

**Files affected:** `docs/survey/LASER_SURVEY_FORM_R5.html`, `.pdf`, `SURVEY_WORKFLOW_R5.md`, `SURVEY_PACK_INDEX_R5.md`, `PRE_SURVEY_AUDIT_R5.md`, `OBJECT_SCHEDULES_R5.md`, `MEASUREMENT_INPUT_TEMPLATE_R5.md`, `MEASUREMENT_SCHEMA_R5.json`, `scripts/build_r5_survey_form.ps1`, `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md`, `CHANGELOG.md`.

### 2026-07-28 - Final R5 post-migration repository cleanup

- Made the approved R5 node map, object guide, recording form and workflow the sole active survey pack.
- Added `docs/archive/R4_SURVEY_HISTORY.md` and removed the superseded blank R4 map, forms, plan, register, detailed references and R4-only generator chain.
- Removed the completed temporary R5 transition document and redirected active repository guidance to the R5 pack and concise R4 history.
- Retained `scripts/build_r5_survey_form.ps1` as the deterministic fresh-profile Chrome/Edge renderer for both active R5 PDFs.
- Preserved all source evidence, evidence maps, accepted R5 pack content and project history. No measurement was imported and no shell or solver was created.

**Reason for change:** Human approval of the R5 pack made the parallel R4 operational surface obsolete; Git history and the pre-survey tag preserve the complete former state.

**Files affected:** added `docs/archive/R4_SURVEY_HISTORY.md`; updated `README.md`, `SOURCE_INDEX.md`, `PROJECT_OVERVIEW.md`, `DECISIONS.md`, `docs/survey/NODE_MIGRATION_R4_TO_R5.md`, `docs/survey/SURVEY_WORKFLOW_R5.md`, `docs/survey/SURVEY_PACK_INDEX_R5.md`; deleted the R4 artefacts and scripts listed in the archive summary plus `docs/survey/R5_REPOSITORY_TRANSITION.md`.

### 2026-07-28 - R5 Room C stud-wall face correction

- Corrected the Room C node panel so the current bedroom stud wall intersects the permanent wall run between `CP1-FR` and `CP2-FL`.
- Replaced active single-face nodes `P1`/`P2`/`P3` with paired outer-face `PO1`/`PO2`/`PO3` and inner-face `PI1`/`PI2`/`PI3` nodes.
- Represented the current wall as a continuous, thin, demolishable stud wall with measurable face runs and thickness; removed the conceptual retained glass-door gap.
- Replaced the direct `CP1-FR -> CP2-FL` form row with `CP1-FR -> PO1` and `PI1 -> CP2-FL`, and added seven explicit stud-wall face/thickness rows.
- Regenerated the 14-page Chrome PDF and visually checked the corrected map and affected form pages.
- Did not change Rooms A or B geometry, approved door/window/cupboard schedules, construct a shell, create a solver or import measurements.

**Reason for change:** The previous active R5 representation placed the upper wall junction incorrectly and collapsed a real stud wall to a single line.

**Files affected:** `docs/survey/NODE_REFERENCE_MAP_R5.svg`, `docs/survey/NODE_REFERENCE_REGISTER_R5.md`, `docs/survey/NODE_MIGRATION_R4_TO_R5.md`, `docs/survey/LASER_SURVEY_FORM_R5.html`, `docs/survey/LASER_SURVEY_FORM_R5.pdf`, `docs/survey/PRE_SURVEY_AUDIT_R5.md`, `docs/survey/SURVEY_PACK_INDEX_R5.md`, `README.md`, `SOURCE_INDEX.md`, `CHANGELOG.md`.

### 2026-07-28 - Final R5 pre-survey recording pack and audit

- Created the 14-page A4-landscape R5 recording form with 34 baseline rows, 107 approved structured-object rows, 35 vertical/special rows and 64 blank supplemental rows.
- Retained `NODE_REFERENCE_MAP_R5.svg` unchanged as the only R5 map; no walking-order or measurement-arrow map was generated.
- Created the three-document field-pack index and completed all 22 pre-survey audit checks.
- Generated the PDF from the final HTML using fresh-profile headless Chrome without Windows Runtime APIs.
- Parsed the rendered HTML and PDF structure, verified unique IDs and approved node/object references, and visually inspected all 14 final print pages.
- Reassessed the retained R4 pack without deleting substantive historical material.
- Did not import measurements, construct a shell, create a geometry solver or merge branches.

**Reason for change:** R5 Runs 1 and 2 were approved, allowing the final practical recording form and pre-survey validation pack to be assembled without redesigning nodes, objects or topology.

**Files affected:** `docs/survey/LASER_SURVEY_FORM_R5.html`, `docs/survey/LASER_SURVEY_FORM_R5.pdf`, `docs/survey/SURVEY_PACK_INDEX_R5.md`, `docs/survey/PRE_SURVEY_AUDIT_R5.md`, `scripts/build_r5_survey_form.ps1`, `docs/survey/SURVEY_WORKFLOW_R5.md`, `docs/survey/R5_REPOSITORY_TRANSITION.md`, `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md`, `CHANGELOG.md`.

### 2026-07-28 — R5 object-schedule migration and visual guide pack

- Migrated the retained R4 door, window and cupboard measurement concepts to the approved R5 face, casing and footprint names.
- Retained clear openings, lining/recess depths, per-face outer casing sizes, trim widths, projections, visible frame dimensions and accessible cupboard interiors.
- Added explicit upper-casing/top-to-ceiling verticals for doors, windows and cupboards, plus door lower-frame, window sill/lower-opening and cupboard base-to-floor references for later 3D work.
- Created one generic annotated guide page for doors, one for windows and one for cupboards instead of duplicating diagrams for each real object.
- Printed the HTML to a matching three-page A4 landscape PDF using fresh-profile headless Chrome, confirmed the PDF page tree and page size, and visually inspected all three rendered guide pages.
- Did not modify the approved node files, regenerate the final all-in-one R5 pack, import measurements, construct geometry or create a solver.

**Reason for change:** The R4 object schedules were conceptually thorough but needed approved R5 naming and clear human-facing dimension sketches before final pack assembly.

**Files affected:** `docs/survey/OBJECT_SCHEDULES_R5.md`, `docs/survey/OBJECT_MEASUREMENT_GUIDES_R5.html`, `docs/survey/OBJECT_MEASUREMENT_GUIDES_R5.pdf`, `docs/survey/SURVEY_WORKFLOW_R5.md`, `docs/survey/R5_REPOSITORY_TRANSITION.md`, `README.md`, `SOURCE_INDEX.md`, `CHANGELOG.md`.

### 2026-07-28 — R5 node-first workflow and repository transition

- Adopted the approved R5 node-reference map, register and migration record as the authoritative measurement language and conceptual topology.
- Replaced the active predetermined-checklist method with a short baseline minimum, structured measured objects and unlimited supplemental observations.
- Added a human-readable measurement template and a JSON Schema that accept both formal node IDs and repeatable plain-English references.
- Marked the 192-row R4 plan and generated pack historical for workflow purposes while retaining their door, window and cupboard schedules for Run 2 and their generators for reproducibility.
- Removed the accidental tracked Word owner file `docs/survey/~$SER_SURVEY_FORM.docx` after confirming it had no references or unique content.
- Removed the ignored stale `tmp/edge-r4-pdf/` browser profile after confirming it contained only obsolete cache, lock, crash and browser-state data and was not used by the maintained PDF script.
- Did not change the approved R5 node files, redesign object schedules, regenerate survey outputs, import measurements, construct geometry or create a solver.

**Reason for change:** R4's exhaustive connected checklist was too rigid for a field workflow in which unanticipated but physically useful observations must remain valid.

**Files affected:** `docs/survey/SURVEY_WORKFLOW_R5.md`, `docs/survey/MEASUREMENT_INPUT_TEMPLATE_R5.md`, `docs/survey/MEASUREMENT_SCHEMA_R5.json`, `docs/survey/R5_REPOSITORY_TRANSITION.md`, `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md`, `SURVEY_PLAN.md`, `SURVEY_CAPTURE_SHEET.md`, `MEASUREMENT_REGISTER.md`, `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`, `CHANGELOG.md`; deleted `docs/survey/~$SER_SURVEY_FORM.docx`; cleaned ignored `tmp/edge-r4-pdf/`.

### 2026-07-28 - Survey Plan R4 measured-object and concise-field revision

- Retained the R3 topology supported by the provisional evidence map and `2dPlan.jpeg`; no shell geometry was normalised or accepted.
- Rebuilt the form around five columns and one careful reading: `Done`, `ID / map`, `Measure`, `Reading (mm)`, `Note/photo`.
- Reduced the printable field form from 15 pages to 12 without shrinking the content into repeated boilerplate.
- Defined two named viewing faces for every door D1-D5, with independent outer casing width/height, left/right trim and maximum projection plus a distinct clear opening and lining depth.
- Changed adjoining door-wall endpoints to named outer casing edges and added explicit casing-to-node placement segments.
- Split C1-C2 into external casing/footprint (`EXT`) and accessible internal-space (`INT`) objects.
- Standardised W1-W2 shell placement on the outer visible opening/reveal boundary and recorded frame dimensions separately.
- Retired routine duplicate checks while retaining eight distinct closure and cross-room constraints, including the user-confirmed long ties through open D2, D5 and the Room C glass doors.
- Added a complete R3-to-R4 migration table and stable-ID endpoint redefinition record.
- Regenerated the synchronized JSON, SVG, Markdown and HTML artifacts; the matching PDF was printed once from the corrected HTML by fresh-profile headless Chrome, independently parsed as exactly 12 A4 landscape pages and visually checked page by page.
- Removed the tracked temporary Word owner file, ignored future `~$*.docx` files and removed unreachable legacy Word-generation code; the supported field-form workflow is now HTML to PDF.
- Completed stable-endpoint compatibility notes for `C10`, `C11`, `SVC09` and `SVC11`, and clarified the complementary `C03`/`RC03` wall segments without changing the survey model.
- Did not import readings, construct the measured shell or modify renovation-planner application code.

**Reason for change:** The earlier form was impractical in the field and its door/casing/cupboard terminology could identify different physical boundaries.

**Files affected:** `docs/survey/LASER_MEASUREMENT_MAP.svg`, `docs/survey/MEASUREMENT_PLAN.json`, `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`, `docs/survey/LASER_SURVEY_FORM.html`, `docs/survey/LASER_SURVEY_FORM.pdf`, `SURVEY_CAPTURE_SHEET.md`, `SURVEY_PLAN.md`, `MEASUREMENT_REGISTER.md`, `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md`, `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg` (status text only), `scripts/survey_r4_model.ps1`, `scripts/build_survey_artifacts.ps1`, `scripts/build_survey_form_html.ps1`, `CHANGELOG.md`.

### 2026-07-28 — Survey Plan R3 D4/W2 topology and long-tie revision

- Corrected the laser-map base around W2 and D4 so the conceptual permanent-wall and opening sequence follows the provisional evidence map, corroborated by `2dPlan.jpeg`.
- Added D4 edge nodes D4W/D4E and core measurement `C18` for the permanent wall from D4 to the Room B return.
- Retained `C10` as a lower-edge overall span and reconciled it with the individual W2, D4, D4-to-B0 and B0-to-D3 components.
- Refined `X09` as a long Room B-to-C2 read through open D3 and the Room C glass doors, retaining a photographed target Q1 on the visible cupboard-back surface.
- Added `X15` as a repeated Room A-to-Room C outer-wall read through open D2; retained `X08` through open D5.
- Increased the synchronized network from 131 to 133 items: 39 core geometry, 15 geometry checks, 25 opening details, 13 vertical geometry, 28 fixed features, 9 optional details and 4 deferred items.
- Regenerated the SVG, JSON, Markdown, HTML and PDF survey artifacts. No measurement was treated as verified and no shell or application geometry was constructed.
- Replaced stale evidence-map status statements that said the laser map was invalid or still required regeneration; no evidence-map geometry was changed.

**Reason for change:** The R2 map omitted permanent wall pieces around D4/W2 and did not exploit three user-confirmed open-door sightlines that can strengthen the future measured reconstruction.

**Files affected:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg` (status text only), `docs/survey/LASER_MEASUREMENT_MAP.svg`, `docs/survey/MEASUREMENT_PLAN.json`, `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`, `docs/survey/LASER_SURVEY_FORM.html`, `docs/survey/LASER_SURVEY_FORM.pdf`, `SURVEY_CAPTURE_SHEET.md`, `SURVEY_PLAN.md`, `MEASUREMENT_REGISTER.md`, `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md`, `scripts/survey_field_instructions.tsv`, `scripts/build_survey_artifacts.ps1`, `CHANGELOG.md`.

### 2026-07-27 — Survey Plan R2 field-usability revision

- Reviewed all 131 measurement IDs against one-person access, visible start/target surfaces, useful geometry and simpler equivalents.
- Added a plain-English `FieldInstruction` for every ID while preserving the technical definition and permanent register mapping.
- Updated the survey map to show the raised Room C enclosure wall, glass-door gap and partition nodes P1-P3.
- Split the permanent Room C wall measurement at the vertical enclosure junction (`C03` / `RC03`) so no beam crosses the purple wall.
- Redesigned `C12-C15` as outer-zone chords and `RC01-RC05` as directly accessible bedroom width, depth, offsets and diagonal.
- Replaced the enclosure-blocked `X10` span and the specialist signed-plane checks `X12-X13`; restricted `X14` to clear doorway spans.
- Simplified all door, window, soffit, floor-level, cupboard and visible-service instructions for a competent DIY user.
- Retained all three floor threshold checks as quick `SAME LEVEL` or measured-step observations.
- Regenerated the SVG, Markdown, HTML and PDF field artifacts; no measured shell or application code was created.

**Reason for change:** R1 was a useful geometric specification but not sufficiently practical for one person using a borrowed laser distance measurer. R2 gives physical sightline constraints equal weight with reconstruction completeness.

**Files affected:** `docs/survey/LASER_MEASUREMENT_MAP.svg`, `docs/survey/MEASUREMENT_PLAN.json`, `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`, `docs/survey/LASER_SURVEY_FORM.html`, `docs/survey/LASER_SURVEY_FORM.pdf`, `SURVEY_CAPTURE_SHEET.md`, `SURVEY_PLAN.md`, `MEASUREMENT_REGISTER.md`, `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md`, `scripts/survey_field_instructions.tsv`, `scripts/build_survey_artifacts.ps1`, `scripts/build_survey_form_html.ps1`, `CHANGELOG.md`.

### 2026-07-27 — Connected measured-survey network issued as Survey Plan R1

- Regenerated `LASER_MEASUREMENT_MAP.svg` as an 11-panel field-planning map based on the current conceptual topology.
- Replaced the former 54-row schedule with one 131-item connected network: 38 core geometry, 14 geometry checks, 25 opening details, 13 vertical geometry, 28 fixed features, 9 optional details and 4 deferred items.
- Added triangulating chords, segment-sum checks, alignment tests, doorway-connected room ties and explicit finished-face reveal evidence.
- Preserved the blocked full Room C post-demolition diagonal and structural/concealed information as deferred rather than deriving it.
- Added a theoretical reconstruction and closure strategy with discrepancy thresholds and prohibited derivations.
- Added `MEASUREMENT_PLAN.json` as the common ID/wording/register-import dictionary.
- Reconciled `SURVEY_CAPTURE_SHEET.md` and created matching static A4 landscape HTML plus print-ready PDF field forms. HTML was used as the documented fallback because reliable DOCX generation and verification were not available in this environment.
- Recorded decision D-018 as proposed pending human field-practicality review.
- Did not create a measured shell or change renovation-planner application code.

**Reason for change:** Work backwards from the geometry required for a first measurement-driven shell and provide enough independent measurements to detect non-square rooms, missed returns, opening errors and accumulated closure error.

**Files affected:** `docs/survey/LASER_MEASUREMENT_MAP.svg`, `docs/survey/MEASUREMENT_PLAN.json`, `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`, `docs/survey/LASER_SURVEY_FORM.html`, `docs/survey/LASER_SURVEY_FORM.pdf`, `SURVEY_CAPTURE_SHEET.md`, `SURVEY_PLAN.md`, `MEASUREMENT_REGISTER.md`, `README.md`, `SOURCE_INDEX.md`, `DECISIONS.md`, `scripts/build_survey_artifacts.ps1`, `scripts/build_survey_form_html.ps1`, `CHANGELOG.md`.

### 2026-07-27 — Evidence map approved only as conceptual survey basis

- Recorded that the corrected evidence map is sufficiently accurate to design the measured-survey strategy.
- Explicitly excluded geometry approval, dimensional verification and shell acceptance from that decision.
- Established that the current laser map must be regenerated and the field sheet reconciled before field use.
- Established the post-survey authority transition: reviewed measured data becomes the authoritative geometry input for the first true-to-scale shell, while the evidence map remains provenance/context.
- Retained a separate future acceptance gate for the structured shell.
- Updated the evidence-map status text without changing its geometry.
- Added decision D-017 and aligned the project overview, README, survey workflow, measurement register, source index and evidence-map records.
- Did not regenerate the laser measurement map or modify the survey capture sheet.

**Reason for change:** Record the precise approval scope and geometry-authority lifecycle before redesigning the measured-survey materials.

**Files affected:** `PROJECT_OVERVIEW.md`, `README.md`, `SURVEY_PLAN.md`, `MEASUREMENT_REGISTER.md`, `DECISIONS.md`, `SOURCE_INDEX.md`, `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`, `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md`, `docs/survey/EVIDENCE_MAP_CORRECTION_LOG.md`, `CHANGELOG.md`.

### 2026-07-27 — Evidence map Revision Candidate vNext

- Made five local review amendments without redesigning the accepted general topology.
- Closed the permanent Room A boundary above both Room B and the WC.
- Moved approximate D2 below the purple enclosure so it enters permanent Room C.
- Moved the electrical-entry marker immediately right of D1.
- Moved the water/associated-service marker inside the lower part of C1 without changing cupboard geometry.
- Updated the chimney-breast shell step from the latest rough sketch while keeping all proportions provisional.
- Updated the evidence notes and correction log for the new approval candidate.
- Left `LASER_MEASUREMENT_MAP.svg` and `SURVEY_CAPTURE_SHEET.md` unchanged.

**Reason for change:** Incorporate the user’s evidence-map review corrections before the approval gate and any downstream laser-map regeneration.

**Files affected:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`, `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md`, `docs/survey/EVIDENCE_MAP_CORRECTION_LOG.md`, `CHANGELOG.md`.

### 2026-07-27 — Provisional evidence-map topology corrected

- Rebuilt `PROVISIONAL_FLAT_EVIDENCE_MAP.svg` around the new `rough-paint-sketch.jpg` topology and the original `2dPlan.jpeg`.
- Corrected Room B from a broad block to a narrower downward projection and placed the WC as its attached upper-right compartment.
- Restored the stepped C1/C2 upper footprint, Room C W2 recess and the lower D4–D3–D2–D1 relationships.
- Replaced the incorrect central Room C demolition box with the purple two-sided bedroom enclosure shown by the supplied sketch.
- Retained the Room A chimney breast as an uncertain plan/photo refinement because the rough sketch omits it.
- Rewrote the evidence-map notes with explicit source reconciliation, remaining ambiguity and colour interpretation.
- Added `docs/survey/EVIDENCE_MAP_CORRECTION_LOG.md` so the earlier misunderstanding and downstream invalidation remain auditable.
- Did not update `LASER_MEASUREMENT_MAP.svg`, `SURVEY_CAPTURE_SHEET.md`, measurement-register paths or application code.

**Reason for change:** The supplied rough sketch materially corrected the general footprint and room topology represented by the earlier provisional SVG.

**Files affected:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`, `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md`, `docs/survey/EVIDENCE_MAP_CORRECTION_LOG.md`, `CHANGELOG.md`.

### 2026-07-27 — Visual survey workflow and simplified field sheet

- Added a provisional flat evidence map with a prominent human-review gate, source traceability and visible uncertainty.
- Added a laser measurement map with 54 primary Map IDs, exact surface definitions, priority/access conventions and doorway, window, soffit, uncertain-wall and blocked-diagonal insets.
- Replaced the root capture sheet with a short walk-order worksheet using one careful reading by default and selective repeat fields.
- Preserved the original comprehensive capture sheet as `docs/survey/SURVEY_CAPTURE_SHEET_DETAILED_REFERENCE.md`.
- Clarified that visual Map IDs are retained during import and linked to permanent `M-...` measurement-register IDs.
- Added decision D-016 and updated the survey workflow documentation.
- Created no application code or approved/replacement floor-plan geometry; all drawn coordinates remain expressly schematic.

**Reason for change:** Make the temporary laser survey achievable in practice without discarding the detailed technical register or presenting provisional topology as measured geometry.

**Files affected:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`, `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md`, `docs/survey/LASER_MEASUREMENT_MAP.svg`, `docs/survey/SURVEY_CAPTURE_SHEET_DETAILED_REFERENCE.md`, `SURVEY_CAPTURE_SHEET.md`, `SURVEY_PLAN.md`, `MEASUREMENT_REGISTER.md`, `README.md`, `DECISIONS.md`, `SOURCE_INDEX.md`, `CHANGELOG.md`.

### 2026-07-27 — Practical measured-survey workflow added

- Added `SURVEY_PLAN.md` with an achievable, priority-ordered field workflow for temporary laser-measurer access.
- Added `SURVEY_CAPTURE_SHEET.md` with pre-allocated stable IDs, compact field codes, room/opening/service checklists, repeated-reading fields, photograph references and deferred records.
- Established millimetres, exact reference surfaces and laser reference edge as standard survey conventions.
- Separated clear, lining, casing, leaf, reveal and hidden structural-opening measurements.
- Added explicit handling for skirting projections, uncertain wall thicknesses, difficult laser targets, furniture, uneven walls and non-square corners.
- Registered Room C's full diagonal as `M-C-DIAG-001`, blocked and deferred until after demolition.
- Added a reconstructable Room B soffit procedure based on horizontal offsets and height stations rather than a measured angle.
- Expanded `MEASUREMENT_REGISTER.md` with classification, obstruction, repeated-reading, accepted-reading, derivation, photograph, finish-treatment, priority and revisit fields.
- Added planned Priority 1–4 measurements without inventing values.
- Added decisions D-011 through D-015 for durable survey conventions and raw-reading preservation.
- Updated `README.md` to include the survey documents in the repository workflow.
- No source material, application code or floor-plan geometry was created or altered.

**Reason for change:** Capture the highest-value shell evidence consistently during one temporary laser-measurer session while preserving uncertainty and deferred work.

**Files affected:** `SURVEY_PLAN.md`, `SURVEY_CAPTURE_SHEET.md`, `MEASUREMENT_REGISTER.md`, `DECISIONS.md`, `README.md`, `CHANGELOG.md`.

### 2026-07-27 — Plan compass reference clarified

- Recorded the user-confirmed compass reference near the upper-right corner of `2dPlan.jpeg`.
- Established that the pointer directed generally left on the photographed page represents 0° north.
- Removed compass mapping from the list of missing prerequisites.
- Added decision D-010 and updated the source index and walkthrough context.
- Preserved the plan in its original orientation; no geometry was rotated or normalised.

**Reason for change:** Correct the earlier interpretation that the plan lacked a usable north reference.

**Files affected:** `README.md`, `SOURCE_INDEX.md`, `WALKTHROUGH_NOTES.md`, `DECISIONS.md`, `CHANGELOG.md`.

### 2026-07-27 — Repository custody and evidence-documentation baseline

- Recognised Codex as the ongoing repository custodian.
- Clarified the roles of `PROJECT_OVERVIEW.md`, `README.md`, `CHANGELOG.md`, `DECISIONS.md`, `SOURCE_INDEX.md`, `MEASUREMENT_REGISTER.md`, `WALKTHROUGH_NOTES.md` and `source-material/`.
- Corrected the outdated commentary-video reference from `source-material/videos/FlatWalkWithTalk.mp4` to `source-material/videos/FlatWalkWithCommentary.mp4`.
- Added the correct transcript reference: `source-material/videos/FlatWalkWithCommentary.srt`.
- Added `SOURCE_INDEX.md` with an entry for every current source-material file, its inspection state, limitations, role and known references.
- Added `WALKTHROUGH_NOTES.md`, using the SRT and sampled video frames to record timestamped room, opening, cupboard, service, soffit and demolition context.
- Added `MEASUREMENT_REGISTER.md` with stable measurement IDs, uncertainty and supersession policy, a reusable record format and three clearly qualified ceiling-height observations.
- Expanded `DECISIONS.md` into a stable decision register covering the post-demolition Room C shell, shell-first workflow, measurement uncertainty, later laser measurement, structural sensitivity of the A–C wall, unapproved serving hatch, structured geometry, transcript reliability and repository custody.
- Updated `PROJECT_OVERVIEW.md` to clarify the Room C post-demolition wording and recognise timestamped transcripts as fallible supporting evidence.
- Added an evidence-state vocabulary and staged outstanding-evidence gates to `README.md`.
- Preserved the plan, photographs, MP4 files and SRT transcript without modification.
- No application code, SVG geometry or replacement floor plan was created.

**Reason for change:** Establish an evidence-based, internally consistent documentation system before shell transcription or application implementation.

**Files affected:** `README.md`, `PROJECT_OVERVIEW.md`, `CHANGELOG.md`, `DECISIONS.md`, `SOURCE_INDEX.md`, `MEASUREMENT_REGISTER.md`, `WALKTHROUGH_NOTES.md`.

### Project Initialisation

- Repository created.
- Source material organised.
- PROJECT_OVERVIEW.md created.
- README.md created.
- Initial apartment evidence collected.

## Completed 2D reconstruction and 3D transition

The following entries are appended in event order to preserve the existing changelog verbatim.

### 2026-08-03 - Select and lock the Room A reconstruction

- Selected the S3 distance/repeat/soft-angle solution after comparing three auditable candidates; the selected clear distance RMS is 5.101 mm and the largest active exact-distance residual is +12.171 mm.
- Preserved raw and repeated observations, kept the measured-corner angles soft rather than forcing a rectangle, and retained separate opening, casing and wall-plane layers.
- Locked the evidence-backed local Room A reconstruction for downstream work instead of pursuing marginal room-only optimisation. Its later promoted form also carries the accepted human A1/chimney-return correction and approved orientation.

**Reason for change:** Complete the Room A reconstruction pilot with a reproducible, human-reviewed working shape while keeping its uncertainty and object-layer conventions explicit.

**Files affected:** `docs/survey/derived/room-a/archive/ROOM_A_RECONSTRUCTION_PILOT_v0_1.json`, `.md`, `.svg`; `docs/survey/ROOM_A_EVIDENCE_v1_1.md`; `scripts/archive/2d-reconstruction/solve_room_a_pilot.mjs`.

### 2026-08-04 - Accept the provisional Room B/WC reconstruction

- Accepted the P1 Room B/WC reconstruction as the local baseline for independent Room C work and later D3 registration.
- Recorded Room B RMS 6.244 mm, WC RMS 1.354 mm and largest active exact residual `SUP-069 = -15.864 mm`, while preserving D3/object-layer and other local uncertainties.
- Froze local coordinates and evidence weights against further marginal optimisation pending whole-flat reconciliation.

**Reason for change:** Establish a stable Room B/WC handoff without presenting provisional local geometry as construction-certified or immune from justified global refinement.

**Files affected:** `docs/survey/derived/room-b-wc/archive/ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json`, `.md`, `.svg`, `_solver-output.json`; `docs/survey/derived/room-b-wc/archive/ROOM_B_WC_ACCEPTED_PROVISIONAL_BASELINE_v0_1.md`; `scripts/archive/2d-reconstruction/solve_room_b_wc_pilot.mjs`.

### 2026-08-12 - Accept the Room C provisional baseline

- Consolidated the v0.1–v0.4 lineage into `ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0` with 0.00 mm shell, partition and object plan-node movement.
- Preserved corrected topology: `D3-CL` is the permanent turning corner and `D2-CR` lies 580 mm along the adjoining wall; retained CP1/CP2, D2–D4 and removable-partition layers.
- Accepted the A1 shell for global reconciliation after independent checks agreed within approximately 26 mm, while retaining D2/D3 interface, object-detail and station-specific vertical uncertainties.

**Reason for change:** Complete the Room C local reconstruction and provide a stable, reproducible input to whole-flat D2/D3 reconciliation.

**Files affected:** `docs/survey/derived/room-c/archive/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json`, `.md`, `.svg`, `_ACCEPTANCE.md`; `scripts/archive/2d-reconstruction/consolidate_room_c_accepted_provisional_v1_0.mjs`.

### 2026-08-13 - Finalise Room B/WC field geometry

- Reconciled the Room B wall-plane evidence, replaced the superseded 249 mm D3 return interpretation with the accepted 136 mm return and retained all correction history.
- Adopted the human rectangular WC working shell despite the preserved 1643/1685 mm opposing-width conflict; Room B remained unchanged by that WC-only architectural constraint.
- Final composition retained the straight 90° D5 leaf and casing-boundary wall junctions without changing the accepted room shells.

**Reason for change:** Resolve the material Room B/WC topology and presentation issues needed for a coherent final local baseline and whole-flat composition.

**Files affected:** `docs/survey/derived/room-b-wc/archive/ROOM_B_WALL_PLANE_NODE_EVIDENCE_AUDIT_v0_1.json`, `.md`, `.svg`; `docs/survey/derived/room-b-wc/archive/ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3.json`, `.md`, `.svg`; `docs/survey/derived/global-reconciliation/archive/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.json`, `.md`, `.svg`.

### 2026-08-13 - Complete whole-flat D2/D3 reconciliation and validation

- Registered Room A to the fixed Room C datum through D2 and Room B/WC through D3, then resolved the final doorway/object composition without silently deforming accepted room shells.
- Froze `WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3` after validating D1–D5 composition, CP1/CP2, the Room C wall/partition, the Room A orientation, the 136 mm Room B return, rectangular WC and straight D5.
- Retained the A↔C 9019 mm validation residual of -61.36 mm (-0.68%) and the conditional C↔B 3726 mm residual of -41.41 mm (-1.11%); the latter's exact field ray bearing and landing stations were not permanently marked.

**Reason for change:** Join the three accepted local reconstructions into one coherent, inspectable whole-flat working model while keeping residuals and semantic uncertainties visible.

**Files affected:** `docs/survey/derived/global-reconciliation/archive/ROOM_A_C_D2_RIGID_REGISTRATION_DIAGNOSTIC_v0_2.json`, `.md`, `.svg`; `docs/survey/derived/global-reconciliation/archive/ROOM_A_C_B_WC_D3_RIGID_REGISTRATION_DIAGNOSTIC_v0_2.json`, `.md`, `.svg`; `docs/survey/derived/global-reconciliation/archive/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.json`, `.md`, `.svg`; the v1.3 validation-audit packages in the same archive.

### 2026-08-13 - Promote the final 2D working baselines

- Promoted final v1.0 JSON/SVG/report packages for Room A, Room B/WC, Room C and the whole flat, indexed by `FINAL_2D_BASELINE_MANIFEST.md`.
- Made `WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json` the authoritative horizontal geometry for downstream design and 3D development, with corresponding local packages for room-frame work.
- Verified exact geometry equality with frozen v1.3: geometry movement was 0 mm everywhere, no solver ran and D2, D3 and D5 registrations did not change. The promoted geometry SHA-256 is `BF90135506785ABAB61FD79F37616F33F00EB2C6B6CEEDF01CFF1846465B90C0`.

**Reason for change:** Turn the validated reconciliation candidate into explicit, reproducible working baselines without presenting them as construction-survey certification.

**Files affected:** `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`; the four promoted v1.0 JSON/SVG/report triplets under `docs/survey/derived/`; `scripts/generate_final_2d_working_baselines_v1_0.mjs`.

### 2026-08-13 - Archive reconstruction history and enter 3D shell development

- Moved local pilots, global diagnostics, candidates, audits and completed 2D reconstruction generators into labelled archive locations; the active geometry directories now expose only a README and each promoted baseline triplet.
- Preserved the promoted JSON/SVG geometry and its geometry hash while making `CURRENT_2D_MODEL.md` the concise source-of-truth pointer.
- Fast-forwarded the completed `global-room-reconciliation` work to `main` and switched to `3d-shell-development`, as verified by Git history and reflog.
- Updated the root orientation documents for the 3D phase and recorded durable rules for authoritative-data-driven 2D/3D generation, evidence-led corrections and semantic separation of permanent, removable and proposed elements.

**Reason for change:** Close the active 2D reconstruction phase, simplify current-geometry discovery and begin deterministic, inspectable 3D shell development from the promoted baseline.

**Files affected:** `docs/survey/CURRENT_2D_MODEL.md`; `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`; active/archive README files and historical moves under `docs/survey/derived/`; `scripts/archive/2d-reconstruction/`; `AGENTS.md`; `PROJECT_OVERVIEW.md`; `README.md`; `SOURCE_INDEX.md`; `DECISIONS.md`; `CHANGELOG.md`.

### 2026-08-13 - Add the first deterministic 3D construction shell

- Added a generated Three.js viewer for the empty existing apartment shell with four floor areas, permanent wall runs, real opening gaps, D1–D5 leaves, W1/W2, CP1/CP2 and the separately classified removable Room C partition.
- Made the promoted whole-flat v1.0 JSON the sole XY coordinate authority; active local v1.0 packages supply feature topology/grouping and are transform-checked during generation.
- Centralised measured vertical values and explicit temporary assumptions in `data/3d/vertical-model-v0_1.json`, including selected flat working ceiling planes and object heights.
- Explicitly omitted the Room B soffit and represented Room B with a temporary flat 2281 mm ceiling; no proposed geometry, furniture, appliances, sanitaryware or service routing was added.
- Verified repeat generation is byte-identical, built the production viewer and served it locally with orbit/pan/zoom, camera reset, ceiling visibility and removable-partition visibility controls.

**Reason for change:** Begin the inspectable 3D phase from authoritative apartment data without creating an independent hand-maintained 3D coordinate model or inventing unsupported architectural detail.

**Files affected:** `package.json`; `package-lock.json`; `index.html`; `src/main.js`; `src/styles.css`; `data/3d/vertical-model-v0_1.json`; `scripts/generate_3d_shell_v0_1.mjs`; `public/generated/flat-shell-v0_1.json`; `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`; `.gitignore`; `CHANGELOG.md`.

### 2026-08-13 - Correct D2 closure and built-in cupboard presentation

- Split the Room C right wall at D2 and generated one continuous threshold/jamb/head reveal across the accepted Room A and Room C opening faces.
- Filled the former casing-width voids around door faces with permanent wall geometry and added simple casing overlays that stop at their recorded casing-top levels; D2-A now closes correctly from its 1975 mm opening head to the ceiling while its measured casing stops at 2140 mm.
- Extended the Room C floor/ceiling shell into the accepted CP1/CP2 footprints, wrapped their side/back envelope edges and replaced solid cupboard blocks with open-front usable carcasses.
- Retained CP1 as a suspended body with a clear services zone below and separate 30 mm top trim; retained CP2 as an open cavity to its measured 2148 mm top with an explicit simplified enclosed upper build-up to the working ceiling.
- Kept the Room B soffit and unmeasured D5 high-level bulkhead deferred. No promoted 2D coordinate or proposed geometry changed.

**Reason for change:** Resolve the first human-review issues where D2 appeared blocked or under-filled and fixed cupboard/recess geometry appeared as sealed external masses.

**Files affected:** `scripts/generate_3d_shell_v0_1.mjs`; `src/main.js`; `data/3d/vertical-model-v0_1.json`; `public/generated/flat-shell-v0_1.json`; `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`; `CHANGELOG.md`.

### 2026-08-13 - Add 3D survey validation and virtual measurement tools

- Added promoted-coordinate node overlays with physical descriptions derived from the R5 measurement language and current model metadata.
- Added 16 distinctly classified Room C repository field-observation overlays with recorded values, model-derived endpoint distances, status and provenance; observations with unmarked or ambiguous endpoints remain excluded.
- Added a session-only click-to-click tape tool with known-node snapping, feature/free-point identification, visible endpoint markers, horizontal/vertical/true-3D distances and multiple saved `VM-###` checks.
- Added per-check visibility/deletion, `FIELD-###` field-review flags and a structured copyable validation report containing endpoint identities, descriptions and exact model coordinates.
- Added a deterministic 3D integrity check for generated validation nodes, Room C boundary points, cupboard footprints, D2-C opening endpoints and measurement calculations. Maximum source/transform delta remains numerical noise below 0.000001 mm.
- Preserved the promoted 2D geometry, accepted transforms, existing shell composition and deliberate Room B soffit deferral.

**Reason for change:** Make survey discrepancies reproducible and traceable in the current 3D shell before renovation-layout planning begins.

**Files affected:** `data/3d/survey-validation-v0_1.json`; `scripts/generate_3d_shell_v0_1.mjs`; `scripts/validate_3d_shell_v0_1.mjs`; `src/measurement-utils.js`; `src/main.js`; `src/styles.css`; `index.html`; `package.json`; `public/generated/flat-shell-v0_1.json`; `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`; `CHANGELOG.md`.

### 2026-08-13 - Simplify 3D validation and field-check workflow

- Replaced the all-room node display with independent Room A, Room B, WC and Room C filters; Room C alone is the default and repository overlays follow the active room combination.
- Reduced label clutter by keeping marker labels hover-driven, with optional all-label display and persistent labels only for tape endpoints.
- Split tape behavior into node-to-node, free-to-free and mixed modes, added an exact-node selector for coincident semantic references and replaced the implicit 180 mm snap with an explicit optional 75 mm mixed-mode snap.
- Added a prominent selected-check card with endpoint identities, primary horizontal model distance, real-world reading entry and automatic signed/absolute `real − model` difference.
- Replaced the single field-required flag with virtual, required, completed and investigate statuses while retaining sequential `FIELD-###` identities.
- Reordered the session export so human-readable results and real-world differences precede coordinates/source metadata. Added deterministic checks for room-filter logic, all endpoint modes and the 4221 mm `D2-OPENING-R → C0` example.
- Did not alter promoted geometry or act on the 4221 mm comparison; Room B soffit remains deferred.

**Reason for change:** Make Room C field validation practical at the flat while retaining exact downstream traceability for Codex.

**Files affected:** `index.html`; `src/styles.css`; `src/main.js`; `src/measurement-utils.js`; `scripts/validate_3d_shell_v0_1.mjs`; `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`; `CHANGELOG.md`.

### 2026-08-13 - Correct free-point and mixed tape raycasting

- Restricted surface tape raycasts to visible physical meshes explicitly tagged as measurement surfaces; decorative edge helpers, labels, node overlays and tape geometry are no longer eligible surface hits.
- Disabled raycasting on generated edge helpers, whose default Three.js line threshold could previously intercept a click before the visible wall and inherit an unrelated parent feature identity such as `ROOM-A-WALL-01`.
- Retained exact canvas-relative pointer conversion and nearest eligible intersection ordering, with free mode never snapping and mixed mode snapping only to visible-room nodes when explicitly enabled.
- Added feature, source coordinate, camera-ray distance and world-hit diagnostics under the selected check's Advanced details, while keeping free-surface selection independent of node-room filters for through-door cross-room checks.
- Added deterministic tests for pointer conversion, physical-surface eligibility, helper rejection, hidden-surface rejection, visible-node snapping and cross-room surface eligibility. Promoted geometry and the deferred Room B soffit remain unchanged.

**Reason for change:** Make arbitrary wall-to-wall and node-to-surface field checks select the physical surface visibly under the cursor rather than nearby rendering helpers.

**Files affected:** `src/main.js`; `src/measurement-utils.js`; `scripts/validate_3d_shell_v0_1.mjs`; `CHANGELOG.md`.

### 2026-08-14 - Align rendered permanent wall faces to surveyed finished-wall datums

- Replaced the centred 80 mm permanent-wall rendering convention with explicit per-segment room-facing metadata and a half-thickness outward mesh offset; authoritative source segments and promoted coordinates remain unchanged.
- Applied the finished-face convention architecture-wide to the safely classified Room A, Room C, Room B and WC wall runs, door wall sides/heads and W1/W2 surrounding wall infill. Shared door faces remain separate records with independent directions.
- Kept casings, reveals, door leaves, W1/W2 glazing and frames, cupboard geometry and the Room C removable partition on their existing distinct datums. No W2 depth or opposite wall face was inferred.
- Added free-hit Advanced details for finished-face alignment status and deterministic plane-alignment, fragment-direction, Room A acceptance-control and Room C regression checks across every classified wall and opening-wall fragment.

**Reason for change:** The source wall lines are surveyed permanent finished faces, so centring visual wall thickness on them shortened opposing rendered-surface measurements by approximately 80 mm.

**Files affected:** `scripts/generate_3d_shell_v0_1.mjs`; `scripts/validate_3d_shell_v0_1.mjs`; `src/measurement-utils.js`; `src/main.js`; `public/generated/flat-shell-v0_1.json`; `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md`; `CHANGELOG.md`.

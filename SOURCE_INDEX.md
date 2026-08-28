# Source Index

## Purpose

This file indexes the original evidence and important derived evidence/review artefacts used to establish the apartment model.

It records what each source appears to show, its limitations, its intended role and its relationship to the current model.

An evidence entry does not certify structural construction, legal renovation feasibility or construction-grade dimensional accuracy.

## Current geometry authority

This file is primarily an evidence index.

It is **not** the primary navigation document for current geometry.

For current geometry start with:

`docs/survey/CURRENT_2D_MODEL.md`

and:

`docs/survey/FINAL_2D_BASELINE_MANIFEST.md`

The current authoritative whole-flat working horizontal geometry is:

`docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json`

Human-readable representation:

`docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg`

Historical evidence maps, node maps, survey forms and reconstruction outputs remain important provenance but do not supersede the promoted final working baseline.

## Current promoted geometry

| Filename                                        | Relative path                                                                           | Type     | Basis                                                                       | Status and limitation                                                                                                                   | Intended role                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json`   | `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json` | JSON     | Reconciled and human-reviewed final local room baselines                    | Current authoritative horizontal working geometry; practical renovation/digital-twin baseline rather than construction-certified survey | Primary machine-readable source for current whole-flat geometry and downstream 3D development |
| `WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg`    | `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg`  | SVG      | Deterministic human-readable representation of promoted whole-flat geometry | Current visual working plan                                                                                                             | Human review and geometry inspection                                                          |
| `ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.json`    | `docs/survey/derived/room-a/ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.json`                 | JSON     | Reviewed Room A survey reconstruction                                       | Promoted final local working baseline                                                                                                   | Room A detail, provenance and local downstream geometry                                       |
| `ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.json` | `docs/survey/derived/room-b-wc/ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.json`           | JSON     | Reviewed Room B/WC survey reconstruction                                    | Promoted final local working baseline with retained documented uncertainty                                                              | Room B/WC detail, provenance and local downstream geometry                                    |
| `ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.json`    | `docs/survey/derived/room-c/ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.json`                 | JSON     | Reviewed Room C survey reconstruction                                       | Promoted final local working baseline with retained documented uncertainty                                                              | Room C detail, provenance and local downstream geometry                                       |
| `CURRENT_2D_MODEL.md`                           | `docs/survey/CURRENT_2D_MODEL.md`                                                       | Markdown | Final promotion and repository cleanup                                      | Current geometry orientation document                                                                                                   | First navigation point for geometry/design/3D tasks                                           |
| `FINAL_2D_BASELINE_MANIFEST.md`                 | `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`                                             | Markdown | Final baseline promotion                                                    | Current baseline manifest                                                                                                               | Resolve active whole-flat and room baseline files                                             |

Corresponding SVG and report files accompanying each promoted local JSON remain part of the active local baseline triplets.

## Historical derived review and survey aids

The following files are important evidence, measurement-language or provenance artefacts.

They should not be mistaken for current whole-flat geometry.

| Filename                                                          | Relative path                                        | Type                   | Basis                                                                       | Current status and limitation                                                                | Intended role                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `NODE_REFERENCE_MAP_R5.svg`                                       | `docs/survey/NODE_REFERENCE_MAP_R5.svg`              | SVG                    | Approved conceptual topology plus later survey-node corrections             | Historical survey reference; schematic and not the current geometry source                   | Identify physical measurement references when tracing survey provenance |
| `NODE_REFERENCE_REGISTER_R5.md`                                   | `docs/survey/NODE_REFERENCE_REGISTER_R5.md`          | Markdown               | R5 node review and corrections                                              | Historical measurement-language reference; contains node meanings rather than final geometry | Interpret measurement endpoints and diagnose source geometry            |
| `NODE_MIGRATION_R4_TO_R5.md`                                      | `docs/survey/NODE_MIGRATION_R4_TO_R5.md`             | Markdown               | R4-to-R5 review                                                             | Historical migration/provenance record                                                       | Preserve identifier history                                             |
| `SURVEY_WORKFLOW_R5.md`                                           | `docs/survey/SURVEY_WORKFLOW_R5.md`                  | Markdown               | Approved node-first survey method                                           | Completed-phase workflow                                                                     | Explain how field evidence was intended to be collected and interpreted |
| `MEASUREMENT_INPUT_TEMPLATE_R5.md` / `MEASUREMENT_SCHEMA_R5.json` | `docs/survey/`                                       | Markdown / JSON Schema | R5 workflow                                                                 | Historical/diagnostic input structures                                                       | Interpret structured and supplemental observations where relevant       |
| `OBJECT_SCHEDULES_R5.md`                                          | `docs/survey/OBJECT_SCHEDULES_R5.md`                 | Markdown               | R5 nodes plus migrated object concepts                                      | Historical detailed measurement reference                                                    | Interpret door, window and cupboard evidence                            |
| `OBJECT_MEASUREMENT_GUIDES_R5.html` / `.pdf`                      | `docs/survey/`                                       | HTML / PDF             | Generic object measurement guide                                            | Historical detailed reference                                                                | Understand intended door/window/cupboard measurement concepts           |
| `SURVEY_PACK_INDEX_R5.md`                                         | `docs/survey/SURVEY_PACK_INDEX_R5.md`                | Markdown               | R5 survey pack                                                              | Completed field-pack index                                                                   | Survey provenance                                                       |
| `LASER_SURVEY_FORM_R5.html` / `.pdf`                              | `docs/survey/`                                       | HTML / PDF             | R5 node system and human-led field workflow                                 | Historical raw-field-capture framework                                                       | Interpret/preserve survey collection provenance                         |
| `PRE_SURVEY_AUDIT_R5.md`                                          | `docs/survey/PRE_SURVEY_AUDIT_R5.md`                 | Markdown               | Cross-file and visual validation of R5 pack                                 | Point-in-time historical audit                                                               | Preserve pre-survey technical validation                                |
| `PROVISIONAL_FLAT_EVIDENCE_MAP.svg`                               | `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`      | SVG                    | Rough sketch, hand plan, photographs, walkthrough and project clarification | Historical conceptual survey-planning map; schematic and not accepted geometry               | Provenance and interpretation context                                   |
| `PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md`                          | `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md` | Markdown               | Source-by-source conceptual reconciliation                                  | Historical interpretation record                                                             | Trace early topology reasoning and uncertainty                          |
| `R4_SURVEY_HISTORY.md`                                            | `docs/archive/R4_SURVEY_HISTORY.md`                  | Markdown               | Final R4-to-R5 cleanup review                                               | Archive history                                                                              | Preserve R4 provenance without competing with active geometry           |

Files inside other `archive/` directories may contain valuable reconstruction history but are not current geometry unless explicitly selected for historical investigation.

## Plans

| Filename      | Relative path                       | Type | Appears to show                                                                                                                                                                                                           | Inspected | Limitations                                                                                                                                         | Current role                                                                | Related references                                                                                 |
| ------------- | ----------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `2dPlan.jpeg` | `source-material/plans/2dPlan.jpeg` | JPEG | Hand-drawn apartment plan on graph paper, including Rooms A–C, wall outlines, openings, cupboard references, service symbols, ceiling heights, handwritten dimensions and a compass reference near the upper-right corner | Yes       | Angled photograph; perspective distortion; handwriting overlaps geometry; graph scale is not calibrated; some values and coloured lines are unclear | Original evidence and provenance; no longer the operational geometry source | Rooms A–C; D1–D5; W1–W2; C1–C2; A–C structural wall; water/electricity symbols; 0° north reference |

## Walkthrough videos

| Filename                     | Relative path                                       | Type | Appears to show                                                                                             | Inspected                                                                           | Limitations                                                                               | Current role                                       | Related references                                            |
| ---------------------------- | --------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| `FlatWalkWithCommentary.mp4` | `source-material/videos/FlatWalkWithCommentary.mp4` | MP4  | Portrait walkthrough from the flat entrance through Room A, Room C, bathroom and WC, with spoken commentary | Partially — representative frames sampled; commentary reviewed through matching SRT | Sampled frames may miss brief views; perspective prevents reliable dimensional extraction | Original visual evidence and diagnostic context    | D1–D5; W1–W2; C1–C2; Rooms A–C; WC; soffit; Room C partitions |
| `FlatWalkNoCommentary.mp4`   | `source-material/videos/FlatWalkNoCommentary.mp4`   | MP4  | Wider landscape walkthrough showing entrance, Room A, Room C kitchen, bathroom/WC and circulation           | Partially — representative frames sampled                                           | No commentary; perspective and movement prevent measurement extraction                    | Independent visual evidence and diagnostic context | Rooms A–C; entrance; bathroom/WC; Room C window and kitchen   |

## Transcripts and subtitles

| Filename                     | Relative path                                       | Type | Appears to show                                                                     | Inspected    | Limitations                                                                                                                                    | Current role                                                | Related references                                                                  |
| ---------------------------- | --------------------------------------------------- | ---- | ----------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `FlatWalkWithCommentary.srt` | `source-material/videos/FlatWalkWithCommentary.srt` | SRT  | Timestamped speech-to-text transcript corresponding to `FlatWalkWithCommentary.mp4` | Yes, in full | May contain transcription errors, unclear phrases and imprecise technical terms; statements may describe intentions rather than physical facts | Supporting original evidence and timestamped navigation aid | D1–D5; W1–W2; C1–C2; Room B height; Room C demolition intention; WC/boiler concepts |

## Room A photographs

| Filename               | Relative path                                       | Appears to show                                    | Limitations                             | Current role                                 |
| ---------------------- | --------------------------------------------------- | -------------------------------------------------- | --------------------------------------- | -------------------------------------------- |
| `RoomA-Ceiling.jpeg`   | `source-material/photos/RoomA/RoomA-Ceiling.jpeg`   | High Room A ceiling, perimeter detailing and light | Wide-angle perspective; partial ceiling | Vertical/architectural visual evidence       |
| `RoomA-EastWall.jpeg`  | `source-material/photos/RoomA/RoomA-EastWall.jpeg`  | Chimney-breast/fireplace feature                   | Furniture obscures lower wall           | Fixed-feature and visual diagnostic evidence |
| `RoomA-NorthWall.jpeg` | `source-material/photos/RoomA/RoomA-NorthWall.jpeg` | Internal door and computer corner                  | Perspective distortion                  | Opening/wall visual evidence                 |
| `RoomA-SouthWall.jpeg` | `source-material/photos/RoomA/RoomA-SouthWall.jpeg` | W1 and heater below                                | No reliable dimensions extractable      | Window/elevation evidence                    |
| `RoomA-WestWall.jpeg`  | `source-material/photos/RoomA/RoomA-WestWall.jpeg`  | D1 entrance wall                                   | Furniture obscures parts                | Entrance/wall evidence                       |

## Room B and WC photographs

| Filename                        | Relative path                                                | Appears to show                                | Limitations                                    | Current role                                 |
| ------------------------------- | ------------------------------------------------------------ | ---------------------------------------------- | ---------------------------------------------- | -------------------------------------------- |
| `RoomB-Ceiling.jpeg`            | `source-material/photos/RoomB/RoomB-Ceiling.jpeg`            | Large stair-related sloping/stepped soffit     | Does not establish complete measurable profile | Important 3D soffit/vertical visual evidence |
| `RoomB-EastWall.jpeg`           | `source-material/photos/RoomB/RoomB-EastWall.jpeg`           | Bathroom wall, access door, WC door and heater | Perspective/fixtures                           | Door and circulation evidence                |
| `RoomB-NorthWall.jpeg`          | `source-material/photos/RoomB/RoomB-NorthWall.jpeg`          | Bath/shower, basin, extractor and access door  | Fixtures obscure wall                          | Bathroom/service context                     |
| `RoomB-SouthWall.jpeg`          | `source-material/photos/RoomB/RoomB-SouthWall.jpeg`          | Door, bath end and soffit                      | Perspective                                    | Door/soffit context                          |
| `RoomB-ToiletRoom-Ceiling.jpeg` | `source-material/photos/RoomB/RoomB-ToiletRoom-Ceiling.jpeg` | WC ceiling/light/ventilation                   | Narrow view                                    | WC vertical/service context                  |
| `RoomB-ToiletRoom.jpeg`         | `source-material/photos/RoomB/RoomB-ToiletRoom.jpeg`         | WC compartment and boxing behind toilet        | Concealed routes not visible                   | WC/service context                           |
| `RoomB-WestWall.jpeg`           | `source-material/photos/RoomB/RoomB-WestWall.jpeg`           | Bath/shower wall beneath soffit                | Perspective                                    | Soffit/shower context                        |

## Room C photographs

| Filename                                | Relative path                                                        | Appears to show                                  | Limitations                                                | Current role                         |
| --------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------ |
| `RoomC-Ceiling-North&WestWallArea.jpeg` | `source-material/photos/RoomC/RoomC-Ceiling-North&WestWallArea.jpeg` | Current kitchen ceiling and cabinetry            | Wide-angle perspective                                     | Ceiling/current-condition evidence   |
| `RoomC-Ceiling-SouthWallArea.jpeg`      | `source-material/photos/RoomC/RoomC-Ceiling-SouthWallArea.jpeg`      | Bedroom-side ceiling and storage                 | Partial area                                               | Current-partition/vertical evidence  |
| `RoomC-Ceiling-WestWallArea.jpeg`       | `source-material/photos/RoomC/RoomC-Ceiling-WestWallArea.jpeg`       | Tall kitchen ceiling and window-side wall        | Lens distortion                                            | Ceiling/window evidence              |
| `RoomC-EastWall-Cupboard1.jpeg`         | `source-material/photos/RoomC/RoomC-EastWall-Cupboard1.jpeg`         | Current kitchen run and cupboard area            | Exact CP1 boundary not certifiable from image              | Cupboard/current-fit-out evidence    |
| `RoomC-EastWall.jpeg`                   | `source-material/photos/RoomC/RoomC-EastWall.jpeg`                   | Bedroom-side wall and open storage               | Exact cupboard reference not determinable from still alone | Current-condition evidence           |
| `RoomC-NorthWall.jpeg`                  | `source-material/photos/RoomC/RoomC-NorthWall.jpeg`                  | Current kitchen cabinet/appliance wall           | Units obscure shell and services                           | Existing-fit-out evidence            |
| `RoomC-South&WestWalls.jpeg`            | `source-material/photos/RoomC/RoomC-South&WestWalls.jpeg`            | Room C circulation, doors and current partitions | Mirrors and perspective complicate interpretation          | Opening/partition context            |
| `RoomC-SouthWall.jpeg`                  | `source-material/photos/RoomC/RoomC-SouthWall.jpeg`                  | Current bedroom wall and storage cupboard        | Furnishings obscure lower wall                             | Current partition/demolition context |
| `RoomC-WestWall.jpeg`                   | `source-material/photos/RoomC/RoomC-WestWall.jpeg`                   | W2 above sink/washing-machine area               | No reliable dimensions extractable                         | Window and wet-service context       |

## Evidence hierarchy in current development

For current 3D development, use evidence according to the question being answered.

### Current horizontal geometry

Use the promoted final whole-flat/local JSON baselines.

### Human visual geometry review

Use promoted SVGs and final reports.

### Vertical and architectural detail

Use final survey/vertical records where available, supported by photographs and walkthrough evidence.

### Geometry discrepancy investigation

Trace the relevant promoted feature back through local reports, measurement records, node definitions and original evidence as needed.

### Historical reconstruction reasoning

Use archived solver/reconciliation reports only when explicitly investigating how the current baseline was reached.

Original evidence remains available throughout and must not be overwritten by later interpretation.

## Preservation rule

Files in `source-material/` are original evidence.

They must not be rewritten, cleaned up, geometrically corrected, moved or renamed without a clear documented reason.

Interpretations belong in:

- project documentation;
- measurement records;
- reconstruction reports;
- promoted structured geometry;
- future 3D/design data.

The current accepted model does not erase the original evidence from which it was constructed.

# Decision Register

This register records accepted project, modelling and renovation decisions with stable IDs. A conceptual renovation idea is not treated as structurally, legally or technically approved unless the decision explicitly records appropriate evidence.

## D-001 — Model Room C primarily as the post-demolition shell

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Room C will be modelled primarily as its intended post-demolition shell, not as a fully detailed recreation of partitions and fit-out that are definitely being removed.
- **Reasoning:** The principal design task is to explore a better future division of Room C into a kitchen and bedroom. The commentary and project overview state that the current small-bedroom/internal partitioning will be removed.
- **Consequences:** Existing Room C conditions remain documented as evidence. Confirmed demolition elements should not become permanent shell geometry. Any element whose removal is not confirmed, including the exact treatment of C1/C2, remains uncertain rather than silently omitted.
- **Related files or evidence:** `PROJECT_OVERVIEW.md`; `WALKTHROUGH_NOTES.md` 02:08–03:57; `source-material/videos/FlatWalkWithCommentary.srt`; Room C photographs.

## D-002 — Verify the fixed shell before interactive planning

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** The fixed apartment shell must be established and verified before interactive partitions, doors, furniture, services or saved layout variants are introduced.
- **Reasoning:** All later planning features depend on stable topology and dimensions. Building interaction first would make approximate geometry appear authoritative and create rework.
- **Consequences:** The next modelling stage is a source-referenced shell transcription and review gate. Application implementation remains deferred.
- **Related files or evidence:** `PROJECT_OVERVIEW.md`; `README.md`; initial feasibility assessment.

## D-003 — Preserve measurement uncertainty

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Approximate, ambiguous and contradictory measurements will remain visibly uncertain until replaced or verified by better evidence.
- **Reasoning:** The hand-drawn plan is approximate, contains difficult handwriting and may include measurement errors. Silent correction would destroy provenance.
- **Consequences:** Measurements require stable IDs, sources, confidence/status and verification state. Original observations remain available after supersession.
- **Related files or evidence:** `PROJECT_OVERVIEW.md`; `MEASUREMENT_REGISTER.md`; `source-material/plans/2dPlan.jpeg`.

## D-004 — Improve shell accuracy with later laser measurements

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Laser measurements will later be used to improve and verify shell accuracy.
- **Reasoning:** Photographs, video and graph-paper proportions cannot provide reliably dimensioned geometry. Independent overall lengths and diagonals are needed to resolve chain conflicts.
- **Consequences:** Laser observations will receive new measurement IDs and supersede rather than erase earlier plan observations. A dimensionally reliable shell cannot be accepted before the priority measurements are obtained.
- **Related files or evidence:** `MEASUREMENT_REGISTER.md`; `README.md` outstanding evidence gates.

## D-005 — Treat the A–C wall as structurally sensitive

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** The wall between Rooms A and C must remain classified as structurally sensitive.
- **Reasoning:** The hand-drawn plan explicitly annotates the A–C wall as `STRUCTURE WALL`. No contrary professional evidence is present.
- **Consequences:** The wall cannot be treated as an ordinary removable partition. Proposed openings require separate constraints and professional review.
- **Related files or evidence:** `source-material/plans/2dPlan.jpeg`; `SOURCE_INDEX.md`; `PROJECT_OVERVIEW.md` decision hierarchy.

## D-006 — Do not represent the serving hatch as physically approved

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** The proposed serving hatch must not be represented as structurally or physically approved until suitable structural advice is obtained.
- **Reasoning:** The apparent target wall is structurally sensitive, while the hatch location, width, height, lintel and construction are not established.
- **Consequences:** Any future hatch object must be labelled proposed/unapproved. It must not imply that the wall can safely be opened or that permissions have been obtained.
- **Related files or evidence:** `PROJECT_OVERVIEW.md`; `source-material/plans/2dPlan.jpeg`; D-005.

## D-007 — Structured geometry becomes the modelling source of truth

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Once reviewed and accepted, the structured geometry model will become the operational source of truth for rendering and interaction, while the original hand plan remains preserved as evidence.
- **Reasoning:** Geometry must remain editable, versionable and reusable across planning layers. A traced image or hard-coded drawing would not support that requirement.
- **Consequences:** Rendering must consume structured data. Source provenance and uncertainty remain attached to model elements. The original JPEG is never overwritten or “corrected.”
- **Related files or evidence:** `PROJECT_OVERVIEW.md` data-driven architecture and measurements sections; `SOURCE_INDEX.md`.

## D-008 — Treat the SRT as supporting, fallible evidence

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** `FlatWalkWithCommentary.srt` is the timestamped text companion to the commentary video, but it is not automatically treated as error-free.
- **Reasoning:** The transcript usefully maps D1–D5, W1–W2 and C1–C2 and records renovation intentions, but it contains unclear speech-to-text phrases and qualitative descriptions.
- **Consequences:** Important transcript statements are cross-checked against frames, photographs and the plan. Unclear wording remains marked ambiguous and is not silently rewritten.
- **Related files or evidence:** `source-material/videos/FlatWalkWithCommentary.srt`; `WALKTHROUGH_NOTES.md`; `SOURCE_INDEX.md`.

## D-009 — Maintain evidence-first repository custody

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Codex acts as repository custodian and maintains internal documentation consistency, the source index, measurement register, decision record and changelog during future work.
- **Reasoning:** The project is expected to evolve over a long renovation, and decisions or measurements must remain understandable and traceable.
- **Consequences:** Meaningful changes update `CHANGELOG.md`; accepted decisions update this register; filename references are corrected when sources change; original source evidence is preserved.
- **Related files or evidence:** `README.md`; `CHANGELOG.md`; `SOURCE_INDEX.md`; `MEASUREMENT_REGISTER.md`.

## D-010 — Use the plan's 0° north reference

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** The compass reference near the upper-right corner of `2dPlan.jpeg` establishes 0° north as pointing generally left on the photographed page.
- **Reasoning:** The user explicitly clarified the meaning of the visible pointer and its `0`/north annotation.
- **Consequences:** Compass mapping is no longer treated as missing. The plan remains preserved in its existing photographed orientation; future transcription may derive cardinal wall directions from the reference but must not silently rotate or normalise the source.
- **Related files or evidence:** `source-material/plans/2dPlan.jpeg`; user clarification dated 2026-07-27; `SOURCE_INDEX.md`; `WALKTHROUGH_NOTES.md`.

## D-011 — Record survey measurements in millimetres with exact surfaces

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** New measured-survey observations will normally be recorded in millimetres, together with the exact physical start and end surfaces and the laser reference edge.
- **Reasoning:** A numeric value is ambiguous when it is unclear whether it was taken from wall, skirting, tile, lining, casing or another projection.
- **Consequences:** Survey records must name reference surfaces and finish treatment. A skirting-based reading remains distinct from a wall-face reading unless a documented derivation is made.
- **Related files or evidence:** `SURVEY_PLAN.md`; `SURVEY_CAPTURE_SHEET.md`; `MEASUREMENT_REGISTER.md`.

## D-012 — Keep finished and hidden structural openings distinct

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Finished opening dimensions, clear usable widths, linings, casings and structural/masonry openings are separate measurements.
- **Reasoning:** Architraves and linings normally conceal the true structural opening. Treating casing width as structural geometry would invent hidden information.
- **Consequences:** Initial shell work may use verified finished opening and location measurements. Hidden structural openings remain missing until exposed or professionally verified.
- **Related files or evidence:** `SURVEY_PLAN.md` Stage C; `SURVEY_CAPTURE_SHEET.md` doors and windows sections.

## D-013 — Defer blocked dimensions instead of guessing

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Blocked and inaccessible dimensions will be recorded with the obstruction and revisit stage rather than guessed. Room C's full permanent-corner diagonal is specifically deferred until after demolition.
- **Reasoning:** The current built-in bedroom/internal partition prevents a clean Room C corner-to-corner sight line.
- **Consequences:** The survey will capture accessible permanent perimeter segments, partial triangulating chords, partition offsets and connected-doorway checks. `DEF01` / `M-DEF-C-DIAG-001` remains blocked/deferred and is required before dimensionally reliable Room C closure.
- **Related files or evidence:** `MEASUREMENT_REGISTER.md` M-DEF-C-DIAG-001; `docs/survey/MEASUREMENT_PLAN.json`; `SURVEY_PLAN.md`; `SURVEY_CAPTURE_SHEET.md`; Room C photographs.

## D-014 — Reconstruct the Room B soffit from a measured profile

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** The Room B stair soffit will be reconstructed from heights and horizontal offsets rather than requiring a directly measured angle.
- **Reasoning:** The available laser may not measure angles, and a consistent side profile is more transparent and reproducible.
- **Consequences:** Record normal and lowest heights, slope start/end offsets from one datum, width and any flat section. Use up to two intermediate height stations only where the visible profile changes enough to require them; do not impose regular interval readings.
- **Related files or evidence:** `SURVEY_PLAN.md` Stage E; `SURVEY_CAPTURE_SHEET.md` Room B soffit profile; Room B photographs; `WALKTHROUGH_NOTES.md`.

## D-015 — Preserve raw, repeated and superseded survey readings

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** Raw survey sheets, repeated readings, contradictory readings, derivation inputs and superseded values will be preserved.
- **Reasoning:** Selecting or averaging readings without their field context would conceal uncertainty and make later reconciliation impossible.
- **Consequences:** Important readings are repeated; contradictory values remain recorded; a new verified measurement supersedes rather than deletes an older observation; only reviewed values may be approved for shell use.
- **Related files or evidence:** `MEASUREMENT_REGISTER.md`; `SURVEY_CAPTURE_SHEET.md`; `SURVEY_PLAN.md` post-survey import workflow.

## D-016 — Use a human-reviewed visual map and simplified default field sheet

- **Date:** 2026-07-27
- **Status:** Superseded by D-018
- **Decision:** The normal field workflow will use a human-reviewed provisional evidence map, a matching laser measurement map and a simplified 54-row walk-order capture sheet. The original detailed capture register remains permanently available as `docs/survey/SURVEY_CAPTURE_SHEET_DETAILED_REFERENCE.md`.
- **Reasoning:** The comprehensive register is valuable as a technical reference but is too dense for a practical one-visit survey. A visual map and short ordered sheet reduce interpretation overhead while preserving explicit measurement surfaces and uncertainty.
- **Consequences:** The evidence map must be reviewed against the source plan before reliance. One careful reading is the default; repeat fields are used selectively for difficult, long, unstable, contradictory or designated closure measurements. Map IDs remain linked to, but do not replace, permanent `M-...` register IDs. Neither SVG is approved geometry.
- **Related files or evidence:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`; `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md`; `docs/survey/LASER_MEASUREMENT_MAP.svg`; `SURVEY_CAPTURE_SHEET.md`; `docs/survey/SURVEY_CAPTURE_SHEET_DETAILED_REFERENCE.md`; user workflow instruction dated 2026-07-27.

## D-017 — Approve the evidence map only as the measured-survey planning basis

- **Date:** 2026-07-27
- **Status:** Accepted
- **Decision:** `PROVISIONAL_FLAT_EVIDENCE_MAP.svg` is sufficiently accurate to act as the conceptual basis for designing the measured-survey strategy. This is not approval of its geometry, an accepted shell model or dimensional verification.
- **Reasoning:** The corrected map now provides enough spatial understanding to design coherent physical measurement paths, while its coordinates, proportions, angles and dimensions remain schematic.
- **Consequences:** The laser measurement map must be regenerated and the field sheet reconciled before survey use. After collection and review, measured-survey data becomes the authoritative geometry input for the first true-to-scale digital shell. The evidence map then ceases to be the primary geometry source but remains provenance/context. The first structured shell requires a separate human acceptance decision before it becomes the operational model source of truth.
- **Related files or evidence:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`; `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP_NOTES.md`; `docs/survey/EVIDENCE_MAP_CORRECTION_LOG.md`; `SURVEY_PLAN.md`; `MEASUREMENT_REGISTER.md`; user approval clarification dated 2026-07-27.

## D-018 — Use a connected triangulated survey network for the first shell

- **Date:** 2026-07-27
- **Status:** Superseded by D-019
- **Decision:** Survey Plan R1 uses 38 core perimeter/chord measurements, 14 independent checks, 25 opening details, 13 vertical measurements, 28 fixed-feature/service observations, 9 optional details and 4 explicitly deferred items. The map and all forms are generated from one machine-readable dictionary.
- **Reasoning:** Isolated room lengths and widths cannot establish non-square, stepped or non-parallel geometry. Connected measured triangles, shared vertices, reveal-face ties, segment sums and multi-room spans provide a transparent route to a near-to-scale shell and expose closure errors.
- **Consequences:** The earlier 54-row form is superseded. The R1 map/form must receive human review for physical access, named surfaces, obstructions and walking order before the survey. Raw results then pass contradiction and closure review before any shell construction. The evidence-map SVG remains topology context only.
- **Related files or evidence:** `docs/survey/MEASUREMENT_PLAN.json`; `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`; `docs/survey/LASER_MEASUREMENT_MAP.svg`; `SURVEY_CAPTURE_SHEET.md`; `docs/survey/LASER_SURVEY_FORM.html`; `docs/survey/LASER_SURVEY_FORM.pdf`; user survey-planning instruction dated 2026-07-27.

## D-019 — Use the R2 one-person field-usability revision

- **Date:** 2026-07-27
- **Status:** Superseded by D-020
- **Decision:** Preserve the connected 131-ID reconstruction network, but use a separate plain-English `FieldInstruction` for every row and redesign any path that crosses the current Room C enclosure, depends on accidental doorway alignment or requires a specialist laser-line datum.
- **Reasoning:** R1 was geometrically useful but read like a technical measured-building specification. A borrowed distance laser must be used only between visible, accessible surfaces by one person following immediately understandable instructions.
- **Consequences:** C03/RC03 split the permanent-wall sightline at P1; C12-C15 remain outside the enclosure; RC01-RC05 form an accessible bedroom network; X10, X12, X13 and X14 use practical substitute checks. Door, window, soffit, level and service wording is simplified. IDs, register links, categories and the overall reconstruction method remain stable. R2 still requires a final in-flat review and creates no measured shell.
- **Related files or evidence:** corrected `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`; `scripts/survey_field_instructions.tsv`; `docs/survey/MEASUREMENT_PLAN.json`; `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`; `docs/survey/LASER_MEASUREMENT_MAP.svg`; `SURVEY_CAPTURE_SHEET.md`; `docs/survey/LASER_SURVEY_FORM.html`; `docs/survey/LASER_SURVEY_FORM.pdf`; user field-usability instruction dated 2026-07-27.

## D-020 — Use the R3 D4/W2 topology and long-tie revision

- **Date:** 2026-07-28
- **Status:** Superseded by D-021
- **Decision:** Correct the laser-map topology around W2 and D4 to follow the conceptual evidence map and the opening sequence supported by `2dPlan.jpeg`; measure each permanent wall and opening component separately; retain an overall lower-edge check; and add the user-confirmed long sightlines through open D2, D5 and the Room C glass doors.
- **Reasoning:** The R2 laser map omitted permanent wall pieces around D4/W2, so its diagram and measurement chain could not reliably reconstruct that part of Room C. The open doors provide valuable independent cross-room constraints when their exact physical target surfaces are recorded.
- **Consequences:** Survey Plan R3 contains 133 IDs: 39 core geometry, 15 checks, 25 opening details, 13 vertical measurements, 28 fixed features, 9 optional details and 4 deferred items. New nodes D4W/D4E identify the D4 edges; new `C18` measures D4E-to-B0; new `X15` ties the outer A and C wall faces through D2; `X09` uses photographed target Q1 on the visible back of C2; `X08` remains the Room B-to-WC tie. No dimension, angle, wall thickness, shell geometry or application model is accepted by this decision.
- **Related files or evidence:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`; `source-material/plans/2dPlan.jpeg`; `docs/survey/LASER_MEASUREMENT_MAP.svg`; `docs/survey/MEASUREMENT_PLAN.json`; `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`; matching field forms; user clarification dated 2026-07-28.

## D-021 - Use the R4 measured-object and one-reading field convention

- **Date:** 2026-07-28
- **Status:** Superseded for workflow purposes by D-022; retained as Run 2 object-schedule source
- **Decision:** Retain the R3 conceptual topology, but measure every door D1-D5 as a complete two-face object; use named outer casing edges for adjoining wall endpoints; separate cupboard exteriors from accessible interiors; use the outer visible window opening/reveal for shell placement; and give every field row one reading box with concise node-pair wording.
- **Reasoning:** R3's opening, lining and casing terminology could identify different physical surfaces, while its 15-page repeated-reading form was too dense for practical use. The first measurement-driven shell needs complete object geometry and unambiguous interfaces, not repeated operating instructions.
- **Consequences:** Survey Plan R4 contains 192 rows: 54 core geometry, 8 checks, 16 opening details, 13 vertical measurements, 90 fixed features, 7 optional details and 4 deferred items. Door faces use the viewing-room rule; adjacent wall rows terminate at outer casing boundaries; C1-C2 use `EXT` and `INT` IDs; W1-W2 keep opening/reveal and frame boundaries distinct. R3 routine check IDs are migrated or retired. The matching field form is 12 pages with `Done | ID / map | Measure | Reading (mm) | Note/photo`; the supported output path is HTML to fresh-profile headless-Chrome PDF, not DOCX. The PDF was independently parsed and visually reviewed as 12 A4 landscape pages. This decision accepts no reading, dimension, shell geometry or application model.
- **Related files or evidence:** `docs/survey/PROVISIONAL_FLAT_EVIDENCE_MAP.svg`; `source-material/plans/2dPlan.jpeg`; door and cupboard photographs; `docs/survey/MEASUREMENT_PLAN.json`; `docs/survey/LASER_MEASUREMENT_MAP.svg`; `SURVEY_CAPTURE_SHEET.md`; `docs/survey/LASER_SURVEY_FORM.html`; `docs/survey/LASER_SURVEY_FORM.pdf`; user field-form and casing instruction dated 2026-07-28.

## D-022 — Use the R5 node-first and supplemental-measurement workflow

- **Date:** 2026-07-28
- **Status:** Accepted
- **Decision:** Use the approved R5 node-reference system as the measurement language; combine a short baseline minimum with structured door, window and cupboard schedules; and accept any additional physically valid measurement using formal nodes, object edges or repeatable plain-English references.
- **Reasoning:** R4's 192-row connected plan usefully exposed topology and object-boundary issues but coupled valid field observations to a predetermined list. Geometry reconstruction benefits from additional diagonals, cross-room spans and validation readings even when they were not anticipated before the visit.
- **Consequences:** `docs/survey/SURVEY_WORKFLOW_R5.md` is the active workflow. A pre-existing measurement ID is not required for validity; supplemental rows use `SUP-###`; raw and contradictory readings remain unchanged; wall planes may be described without artificial wall-face IDs. R4 remains temporarily available for Run 2 object-schedule review and historical reproduction. No measurement, dimension, shell geometry or application model is accepted by this decision.
- **Related files or evidence:** approved `docs/survey/NODE_REFERENCE_MAP_R5.svg`, `NODE_REFERENCE_REGISTER_R5.md` and `NODE_MIGRATION_R4_TO_R5.md`; `docs/survey/SURVEY_WORKFLOW_R5.md`; `docs/survey/MEASUREMENT_INPUT_TEMPLATE_R5.md`; `docs/survey/MEASUREMENT_SCHEMA_R5.json`; user R5 workflow instruction dated 2026-07-28.

## D-023 - Issue the final R5 pack for field measurement

- **Date:** 2026-07-28
- **Status:** Accepted
- **Decision:** Use one node-reference map, the approved three-page object guide and the 14-page recording form as the coordinated R5 field pack. Do not add a walking-order or comprehensive measurement-arrow map.
- **Reasoning:** The approved node system already identifies physical references, while the object guide defines measurement endpoints and the form provides one-reading baseline, object, vertical and free-form recording space.
- **Consequences:** Technical validation and human practical approval have passed, so the pack may be used for real-world measurement collection. This approval accepts no measurement or geometry and does not authorise transcription, a shell, a solver or application work.
- **Related files or evidence:** `docs/survey/NODE_REFERENCE_MAP_R5.svg`; `docs/survey/OBJECT_MEASUREMENT_GUIDES_R5.pdf`; `docs/survey/LASER_SURVEY_FORM_R5.pdf`; `docs/survey/SURVEY_PACK_INDEX_R5.md`; `docs/survey/PRE_SURVEY_AUDIT_R5.md`.

## D-024 - Retire R4 operational artefacts after R5 approval

- **Date:** 2026-07-28
- **Status:** Accepted
- **Decision:** Present R5 as the sole active survey workflow and remove the superseded R4 generated pack, root survey forms/register and closed R4 generator chain after preserving concise provenance.
- **Reasoning:** R5 has incorporated the useful node, object-boundary, datum, contradiction and supplemental-measurement concepts. Keeping the blank 192-row R4 pack and its generators beside R5 created a competing operational surface without preserving additional source evidence.
- **Consequences:** `docs/archive/R4_SURVEY_HISTORY.md` records the removed artefacts and migration rationale. Full R4 detail remains recoverable through Git history and the pre-survey tag. Original plans, photographs, videos, transcript, walkthrough notes, evidence maps and accepted decisions remain unchanged. The R5 pack content is unchanged.
- **Related files or evidence:** `docs/archive/R4_SURVEY_HISTORY.md`; `docs/survey/SURVEY_WORKFLOW_R5.md`; `docs/survey/SURVEY_PACK_INDEX_R5.md`; D-021 through D-023.

## D-025 - Reissue R5 as a human-led remaining-room form after the Room A pilot

- **Date:** 2026-08-03
- **Status:** Accepted
- **Decision:** Preserve the approved R5 node network and remaining-room planned measurements, but replace the compulsory detailed opening/cupboard rows with compact evidence records and reserve `SUP-065` through `SUP-264` for flexible Room B, WC and Room C observations.
- **Reasoning:** The Room A field survey demonstrated that irregular casing, merged finishes, access restrictions and useful unplanned triangulation are handled more reliably with photographs, plain-English endpoints and later human review than with a large rigid object schema.
- **Consequences:** Room B retains 7 planned rows, WC 5, Room C permanent boundary 10 and its stud wall 7. D2-D5, W2, CP1 and CP2 are recorded compactly; detailed schedules remain optional references. Room A evidence and `SUP-001` through `SUP-064` are untouched. No remaining-room geometry is accepted or solved.
- **Related files or evidence:** `docs/survey/LASER_SURVEY_FORM_R5.html`; `docs/survey/LASER_SURVEY_FORM_R5.pdf`; `docs/survey/PRE_SURVEY_AUDIT_R5.md`; Room A field workflow and reconstruction evidence; user reissue instruction dated 2026-08-03.

## D-026 — Accept the promoted local and whole-flat final 2D working baselines

- **Date:** 2026-08-13
- **Status:** Accepted
- **Decision:** Accept `ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0`, `ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0` and `ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0` as the practical local working geometry, and accept `WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0` as the primary horizontal geometry for downstream digital-twin development.
- **Reasoning:** Each room passed its evidence-led reconstruction and review process, the shared D2/D3 interfaces were reconciled and the frozen whole-flat v1.3 candidate passed the final composition and semantic audits. Promotion reproduced the accepted coordinates with exact geometry equality and 0 mm movement.
- **Consequences:** New design and 3D work must start from the promoted JSON/SVG packages indexed by the final manifest, not archived pilots or diagnostics. The documented A↔C and C↔B residuals, CP1/CP2, WC and door-detail uncertainties remain active. “Final working” does not mean construction-survey certification, structural-engineering approval or a construction-locked record.
- **Related files or evidence:** `docs/survey/CURRENT_2D_MODEL.md`; `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`; the four promoted v1.0 reports under `docs/survey/derived/`.

## D-027 — Close routine 2D reconstruction and require evidence-led corrections

- **Date:** 2026-08-13
- **Status:** Accepted
- **Decision:** Close the active 2D reconstruction phase. A questionable future view must follow: visual discrepancy → identify the source feature/node → inspect current geometry and measurements/evidence → decide whether a genuine correction is justified → modify authoritative data only when justified → regenerate dependent 2D and 3D outputs.
- **Reasoning:** The promoted shell is an evidence-backed working baseline with known, explicit uncertainty. Reopening it from visual impression alone, or hand-sculpting a different 3D interpretation, would break provenance and create competing geometry.
- **Consequences:** Archived reconstruction artefacts remain provenance, not current alternatives. Corrections require a traceable evidence reason and must enter through authoritative data; a manually adjusted 3D mesh must not become an unofficial source of apartment geometry.
- **Related files or evidence:** `docs/survey/CURRENT_2D_MODEL.md`; `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`; `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.md`; D-007; D-015.

## D-028 — Derive deterministic 2D and 3D representations from authoritative apartment data

- **Date:** 2026-08-13
- **Status:** Accepted
- **Decision:** Extend D-007 so authoritative apartment data deterministically generates both the 2D and 3D representations rather than maintaining independent hand-edited models. Where practical, generated 3D objects must retain identifiers or metadata linking them to the surveyed/modelled feature.
- **Reasoning:** One data lineage keeps plan and spatial views reproducible, makes corrections propagate consistently and preserves inspection back to evidence-bearing nodes and objects.
- **Consequences:** Rendering-specific files may differ, but they must not carry independent authoritative dimensions or topology. Regeneration must be repeatable, and feature identity should survive from source data into downstream views.
- **Related files or evidence:** D-007; `docs/survey/CURRENT_2D_MODEL.md`; `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`; `scripts/generate_final_2d_working_baselines_v1_0.mjs`.

## D-029 — Keep permanent, removable and proposed elements distinct

- **Date:** 2026-08-13
- **Status:** Accepted
- **Decision:** Model existing permanent structure, existing removable structure and proposed renovation elements as distinct semantic layers throughout 3D and design development.
- **Reasoning:** The accepted baseline already distinguishes permanent shell from elements such as the removable Room C partition, while proposals have a different evidence and approval status. Collapsing these categories would make existing conditions and design intent indistinguishable.
- **Consequences:** Proposed walls, furniture, services and layouts must not silently alter the accepted permanent shell. Removable existing elements remain represented until an explicit demolition/design state excludes them, and proposed work must remain identifiable as proposed.
- **Related files or evidence:** D-001; D-006; `docs/survey/derived/room-c/ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.md`; `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.md`.

## D-030 — Begin with a simple, inspectable 3D construction shell

- **Date:** 2026-08-13
- **Status:** Accepted
- **Decision:** Make the next active modelling stage a simple deterministic 3D construction shell using promoted final 2D geometry horizontally, measured vertical evidence where available and explicit assumptions where evidence is missing.
- **Reasoning:** An inspectable shell establishes trustworthy spatial relationships before visual detail is added. Available vertical readings are station-specific and incomplete, so unsupported architectural complexity would imply evidence that does not exist.
- **Consequences:** Prioritise geometric correctness, traceability and reviewability over photorealism. Do not invent sloping ceilings, roof forms or concealed construction. Record assumptions explicitly and preserve measured vertical observations rather than averaging them into unsupported universal dimensions.
- **Related files or evidence:** `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`; `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.md`; `docs/survey/derived/room-c/archive/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.md`; D-003; D-013.

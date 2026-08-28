# R4 survey history

Survey Plan R4 attempted to predefine a complete connected measurement network for the flat. It coordinated a conceptual 12-panel map, a machine-readable 192-row plan, a 12-page one-reading form and detailed reconstruction guidance. The approach was useful for exposing topology, sightline, casing, cupboard, window, soffit, service and geometric-closure issues, but it made valid field observations depend on an exhaustive predetermined checklist.

R5 superseded that workflow with an approved node-reference language, a short baseline, structured door/window/cupboard schedules and freely extensible supplemental observations. Useful R4 concepts migrated into the R5 node migration record, node register, object schedules and guides, workflow and recording form. These include named casing boundaries, separate cupboard exteriors/interiors, distinct opening and frame references, enclosure-safe sightlines, cross-room ties, explicit datums, preservation of raw contradictions and deferred hidden geometry.

No R4 field measurements were collected or imported. Its SVG proportions were never accepted as measured geometry. The three qualified ceiling-height observations formerly indexed in the root measurement register remain preserved with source and uncertainty in `WALKTHROUGH_NOTES.md`; the original plan and walkthrough transcript also remain unchanged.

The final cleanup removed these superseded R4 operational artefacts:

- `docs/survey/MEASUREMENT_PLAN.json`
- `docs/survey/LASER_MEASUREMENT_MAP.svg`
- `docs/survey/LASER_SURVEY_FORM.html`
- `docs/survey/LASER_SURVEY_FORM.pdf`
- `docs/survey/MEASUREMENT_GEOMETRY_STRATEGY.md`
- `docs/survey/SURVEY_CAPTURE_SHEET_DETAILED_REFERENCE.md`
- `SURVEY_CAPTURE_SHEET.md`
- `SURVEY_PLAN.md`
- `MEASUREMENT_REGISTER.md`
- `scripts/survey_r4_model.ps1`
- `scripts/survey_field_instructions.tsv`
- `scripts/build_survey_artifacts.ps1`
- `scripts/build_survey_form_html.ps1`
- `scripts/build_survey_pdf.ps1`

The complete pre-cleanup R4 state remains recoverable through Git history and the repository's pre-survey tag. This summary preserves provenance without presenting R4 as a competing field workflow.

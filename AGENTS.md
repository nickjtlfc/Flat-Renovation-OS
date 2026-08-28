# Repository guidance for agents

This repository is the working source for the Flat Renovation digital-twin and Renovation Operating System project.

The difficult survey, room-reconstruction and global 2D reconciliation phases have been completed.

The project is now developing from the promoted final 2D working baseline into a deterministic 3D construction shell and, later, an editable renovation-planning environment.

## Current development phase

Current branch:

`3d-shell-development`

The stable promoted 2D baseline underneath this work has already been merged to `main`.

Do not work directly on `main` unless explicitly instructed.

## Geometry authority

For any geometry, design, viewer or 3D task:

1. Read `docs/survey/CURRENT_2D_MODEL.md` first.
2. Read `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`.
3. Use the promoted whole-flat JSON as the authoritative horizontal working geometry:
   `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json`
4. Use the corresponding SVG for human visual review:
   `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg`
5. Use the promoted final local room baselines when room-level detail or provenance is required.
6. Prefer structured JSON for machine-readable geometry and SVG/report files for human inspection and explanation.

The promoted 2D baseline was carried forward from the validated global reconciliation without geometry movement.

Treat it as the current working source of truth.

## Active local room baselines

Room A:

`docs/survey/derived/room-a/ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.json`

Room B/WC:

`docs/survey/derived/room-b-wc/ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.json`

Room C:

`docs/survey/derived/room-c/ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.json`

Each has corresponding human-readable SVG and report files.

## Historical and archived geometry

Files inside `archive/` directories are reconstruction history, superseded solver states, evidence corrections or provenance.

They must not be selected as current geometry merely because they contain more detailed discussion or appear numerically plausible.

Do not select geometry from an `archive/` directory unless the task explicitly concerns:

- provenance;
- reconstruction history;
- diagnosis of a known uncertainty;
- comparison with an earlier solution.

Historical survey documents such as the R5 node system, measurement forms and evidence maps remain valuable evidence and diagnostic references but no longer supersede the promoted final 2D geometry.

## Do not casually reopen the 2D reconstruction

The 2D reconstruction/reconciliation phase is closed as the current working baseline.

A visual discrepancy discovered during 3D development is not, by itself, permission to edit the promoted 2D coordinates.

Use the following workflow:

**visual discrepancy → identify source feature/node → inspect authoritative geometry and relevant measurement/evidence → determine whether a genuine source correction is justified → update authoritative data if approved → regenerate dependent 2D and 3D outputs**

Do not manually sculpt the 3D model to hide a discrepancy.

Do not change promoted 2D geometry during cleanup, documentation, presentation or renderer work.

## Known uncertainty

The promoted 2D shell is a practical renovation/digital-twin baseline, not a construction-certified measured survey.

Known retained local uncertainties include:

- CP1 RC-04 object-layer conflict;
- CP2 outer-right footprint/casing station uncertainty;
- accepted WC rectangular representation despite conflicting opposing-width evidence;
- conditional C→D3→B validation residual;
- some door lining and reveal details;
- D5 high-level bulkhead detail;
- some minor casing/object dimensions not fully measured.

These do not justify reopening the entire shell.

Carry uncertainty locally into downstream modelling where relevant and preserve its provenance.

## 3D development principles

The first 3D phase should create a simple, geometrically useful construction shell.

Prioritise:

- deterministic generation from authoritative data;
- geometric clarity;
- maintainability;
- inspectability;
- explicit assumptions;
- easy regeneration.

The first shell should include, where supported by evidence:

- floor;
- permanent walls;
- measured ceiling heights;
- door openings;
- doors;
- door casings and reveals where sufficiently known;
- windows;
- window recess/casing;
- permanent cupboards and fixed structures;
- the existing removable Room C partition as a distinct non-permanent element;
- relevant measured soffits/bulkheads;
- major structural returns.

Photorealism is not a priority.

Do not invent sloping roofs, ceilings, concealed construction or complex architectural geometry merely because the building is old or irregular.

Where measured ceilings are effectively flat, model them as flat.

## Vertical geometry

Use measured vertical observations where available.

Do not silently substitute generic architectural dimensions for missing values.

If a height required for the first shell is not established:

- locate the best existing survey evidence;
- record any temporary assumption explicitly;
- keep the assumption identifiable and replaceable.

## Data-driven architecture

The intended relationship is:

**authoritative apartment data → deterministic 2D representation + deterministic 3D representation**

Avoid:

**2D drawing + separately hand-edited 3D model**

Do not duplicate authoritative XY geometry into an unrelated manually maintained 3D dataset unless there is a strong documented reason.

Where practical, 3D objects should retain identifiers or metadata linking them to the underlying surveyed feature.

## Existing versus proposed

Preserve a distinction between:

- existing permanent structure;
- existing removable structure;
- proposed renovation elements.

Future proposed walls, furniture, kitchens, sanitaryware, services and layout alternatives must not silently become part of the surveyed permanent shell.

## Longer-term direction

The eventual system should support:

- browser-based 3D inspection;
- orbit/pan/zoom;
- first-person walkthrough;
- hide/show walls or ceilings where useful;
- selectable or inspectable architectural features;
- proposed partition walls;
- kitchen and bedroom planning;
- plumbing and electrical/service routing;
- furniture;
- alternative saved layouts;
- renovation notes, costs and construction planning;
- visualisation outputs.

Do not over-engineer these later stages before the basic deterministic construction shell is working and human-reviewed.

## Repository documentation

Keep the active orientation documents accurate as the project progresses.

Important root documents include:

- `PROJECT_OVERVIEW.md`
- `README.md`
- `CHANGELOG.md`
- `DECISIONS.md`
- `SOURCE_INDEX.md`
- `WALKTHROUGH_NOTES.md`

Important current geometry navigation documents include:

- `docs/survey/CURRENT_2D_MODEL.md`
- `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`

Meaningful project changes should be recorded in `CHANGELOG.md`.

Durable accepted architectural, modelling or workflow decisions should be recorded in `DECISIONS.md`.

Do not rewrite historical reports merely to make them sound current.

# Flat Renovation OS

Flat Renovation OS is a measurement-driven digital model of a real apartment, built to support renovation planning in a property where the geometry is awkward, irregular and difficult to infer from photographs or a rough floor plan.

The repository brings together the source evidence, measured survey, room-level reconstruction, reconciled 2D geometry and a deterministic Three.js construction shell. The aim is not to produce a photorealistic render or compete with general-purpose CAD software. It is to create a dependable spatial baseline that future renovation decisions can be tested against.

The project is iterative and still developing. The measurement campaign and accepted 2D baseline are complete, while the existing-condition 3D shell is approximately 90% complete. It is a practical renovation and digital-twin baseline, not a construction-certified measured building survey.

## Why I built this

The project began with a real renovation problem: planning changes to an older apartment whose rooms, openings, cupboards, wall returns and ceiling conditions do not fit neatly into a simple rectangular plan.

Early experiments showed that image-generation and rough-plan approaches could produce something visually convincing very quickly. The problem was that visual plausibility was not the same as dimensional reliability. Small invented alignments or incorrect wall relationships would make the result unsuitable for decisions involving furniture, kitchens, bathrooms, circulation or services.

That changed the goal. Instead of asking software to produce a floor plan that looked right, I needed a process for establishing geometry that could be inspected, reconciled and traced back to actual evidence.

## What the system became

The work grew beyond a floor-plan exercise into a small renovation operating system for one property.

It now separates:

- original source evidence;
- recorded measurements;
- interpreted nodes and architectural features;
- accepted working geometry;
- existing permanent and removable elements;
- future proposed renovation layers.

Rooms were reconstructed independently before being joined into a whole-flat coordinate system. That reconciled 2D model then became the horizontal source of truth for a generated 3D shell.

The intention is for the permanent apartment model to remain stable while proposed layouts, interiors, services and finishes can change around it.

## How it works

The current workflow is:

**Source evidence → measured survey → node and measurement reconciliation → room-level reconstruction → whole-flat reconciliation → accepted 2D baseline → deterministic 3D shell → renovation planning and validation**

The important distinction is between evidence and interpretation. Photographs, walkthrough notes and raw measurements are preserved as evidence. Structured JSON contains the accepted working geometry. SVG outputs provide a human-readable plan, and the Three.js viewer provides an inspectable 3D representation generated from the same underlying model.

If a visual discrepancy appears in 3D, the intended workflow is to trace it back to the relevant feature, node and evidence. The underlying data is corrected only when the evidence justifies it, after which the dependent outputs can be regenerated.

## Current capabilities

### Measurement-driven reconstruction

The repository contains completed room-level reconstructions for:

- Room A;
- Room B and the WC;
- Room C;
- the reconciled whole flat.

The model retains documented residuals and local uncertainties instead of forcing every conflicting observation into artificial agreement.

### Accepted 2D baseline

The promoted whole-flat JSON is the authoritative horizontal working geometry:

`docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json`

A corresponding SVG provides the human-readable plan:

`docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg`

Promoted local JSON, SVG and report packages are also retained for each reconstructed room.

### Deterministic 3D shell

A build script generates the existing-condition 3D shell from the promoted horizontal geometry, reviewed vertical data and explicit modelling conventions.

The shell currently represents, where supported by the evidence:

- room floors and permanent wall runs;
- measured working ceiling planes;
- door openings, leaves, reveals and casing faces;
- windows, frames and recessed wall infill;
- permanent cupboards and fixed structures;
- the existing removable Room C partition as a separate classification;
- selected existing service and construction references;
- feature identifiers and source metadata used for inspection.

The generated shell does not become a second, independently edited geometry source.

### Interactive viewer

The browser-based Three.js viewer currently supports:

- orbit, pan and zoom;
- camera reset;
- ceiling visibility;
- removable-partition visibility;
- room-filtered survey-node overlays;
- hover and optional node labels;
- repository field-observation overlays.

### Measurement and field validation

The viewer includes session-based tools for comparing the digital model with real-world checks:

- node-to-node measurement;
- free surface-to-surface measurement;
- mixed node and surface measurement;
- optional explicit surface snapping;
- horizontal, vertical and true 3D distances;
- exact selection between coincident nodes with different meanings;
- entry of a real-world reading;
- automatic `real world − model` comparison;
- virtual, required, completed and investigation statuses;
- copyable validation reports with feature identities, coordinates and provenance.

These checks do not silently change the accepted geometry. They provide evidence for a later reviewed correction if one is needed.

### Deterministic validation

Generation and validation scripts check source-node transforms, important room and feature relationships, measurement calculations, finished-wall face alignment and selected viewer interactions.

The purpose is to catch drift between the accepted survey geometry and the generated shell, rather than treating a visually plausible render as sufficient validation.

## Running the viewer locally

With Node.js and npm installed:

```bash
npm install
npm run dev
```

Vite will print the local URL for the viewer.

To generate and validate the shell independently:

```bash
npm run generate:3d-shell
npm run validate:3d-shell
```

For a production build and local preview:

```bash
npm run build
npm run preview
```

Both `npm run dev` and `npm run build` regenerate the shell data before serving or building the viewer.

## Current stage

The measured survey, room reconstruction, whole-flat reconciliation and promoted 2D baseline are complete for the current project scope.

The existing-condition 3D construction shell is approximately 90% complete. Its principal measurements and overall spatial relationships are in place. The remaining shell work is focused on:

- adding the Room B bathroom soffit profile;
- refining identified internal door casings;
- improving selected decorative casing shapes;
- completing local visual and field-review touch-ups without disturbing the accepted 2D baseline.

The current model deliberately does not include a finished interior design, proposed furniture layouts, detailed utility routes or photorealistic materials.

Once the shell refinement is complete, the next stage is to develop the renovation design while continuing to treat measurement as a constraint. Planned work includes interior layouts and explicit routes for services such as water and electricity.

## Repository guide

For a quick technical inspection, start with the viewer and then follow the geometry back to its sources.

### Project orientation

- `PROJECT_OVERVIEW.md` — long-term purpose, modelling principles and intended layer structure.
- `docs/3d/FIRST_3D_CONSTRUCTION_SHELL_v0_1.md` — current 3D scope, geometry conventions, viewer workflow and known simplifications.
- `docs/survey/CURRENT_2D_MODEL.md` — shortest guide to the current geometry authority.
- `docs/survey/FINAL_2D_BASELINE_MANIFEST.md` — manifest of the promoted room and whole-flat baselines.

### Evidence and decisions

- `SOURCE_INDEX.md` — index of original and derived evidence.
- `WALKTHROUGH_NOTES.md` — timestamped observations extracted from the original property walkthrough.
- `DECISIONS.md` — durable modelling and workflow decisions, with their reasoning and consequences.
- `CHANGELOG.md` — development, survey and geometry history.
- `source-material/` — original property evidence retained in the repository.

### Geometry and application

- `docs/survey/derived/` — promoted room-level and whole-flat geometry, together with archived reconstruction history.
- `data/3d/` — reviewed vertical data and survey-validation definitions used by the shell generator.
- `scripts/` — deterministic geometry generation and validation scripts.
- `src/` — Three.js viewer, interaction and measurement logic.
- `public/generated/` — generated shell data consumed by the viewer.
- `docs/3d/` — detailed 3D implementation and validation documentation.

Files inside `archive/` directories are retained for provenance and diagnosis. They are not the current geometry authority.

## Engineering themes

### A clear source of truth

The promoted JSON geometry is authoritative. SVG and 3D outputs are derived representations rather than separate models that can drift apart.

### Deterministic geometry over visual plausibility

A model that looks convincing can still be dimensionally wrong. The project therefore prioritises repeatable generation, traceable inputs and explicit assumptions over visual polish.

### Measurement reconciliation

Real survey evidence does not always close perfectly. The reconstruction preserves residuals, conflicts and accepted working representations rather than hiding them behind idealised rectangles.

### Evidence separated from interpretation

Original photographs, plans, observations and measurements are preserved. Interpretations and accepted modelling decisions live in structured data and documented decision records.

### 3D as a validation interface

The 3D viewer is not only a presentation layer. It is also a way to inspect wall relationships, openings, casings, cupboards and measurements that can be difficult to understand from tables or a 2D plan alone.

### AI as part of the workflow, not the geometry authority

AI has been useful for organising evidence, developing scripts, checking consistency and iterating on the viewer. It is not treated as the authority on the apartment's dimensions. That authority comes from reviewed measurements, documented decisions and deterministic model data.

## Status and next steps

This is an active personal project rather than a polished commercial application.

The immediate priorities are to finish the remaining existing-shell details, complete another focused visual review and keep the deterministic validation checks passing. Development can then move into proposed interior layouts and measured utility routing while keeping those layers separate from the permanent surveyed shell.

## Related

A broader account of the project and its development is available on my portfolio:

[Building an AI-assisted renovation digital property twin](https://nick-jt.com/projects/ai-renovation-digital-property-twin)

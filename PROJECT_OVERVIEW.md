# Apartment Renovation Operating System

> **Current project phase:** the measurement-driven 2D reconstruction and global reconciliation phases are complete. The promoted final 2D working shell is now the horizontal geometry source for development on `3d-shell-development`.
>
> Start geometry work with:
>
> - `docs/survey/CURRENT_2D_MODEL.md`
> - `docs/survey/FINAL_2D_BASELINE_MANIFEST.md`

# Project Overview

This project is not simply a floor plan, CAD drawing or 3D render.

The goal is to build a long-term **Renovation Operating System** for a single apartment.

It should become the central source of truth for planning, designing, documenting and managing the complete renovation.

Every future feature should build upon one consistent digital representation of the apartment.

---

# Current Milestone

The difficult survey and horizontal-geometry reconstruction stage has been completed.

Rooms A, B/WC and C have each been reconstructed from the measured evidence, reviewed and promoted to final local working baselines.

Those rooms have been reconciled into a promoted whole-flat working 2D shell.

The authoritative current whole-flat machine-readable geometry is:

`docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json`

The corresponding human-readable plan is:

`docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg`

Primary navigation and authority records are:

`docs/survey/CURRENT_2D_MODEL.md`

`docs/survey/FINAL_2D_BASELINE_MANIFEST.md`

The promoted whole-flat geometry was carried forward from the validated global reconciliation without geometry movement.

The 2D reconstruction should therefore be treated as a stable working milestone rather than casually reopened during later design work.

---

# Core Philosophy

The objective is to help make better renovation decisions.

The application should not attempt to compete with professional CAD software.

Instead it should provide an intuitive, interactive planning environment specifically designed around this apartment and its renovation.

The emphasis is on:

- accurate spatial understanding;
- rapid experimentation;
- iterative refinement;
- practical decision making;
- traceability;
- maintainability.

Everything that is expected to change should remain editable.

The system should distinguish between measured fact, accepted modelling representation, uncertainty and proposed design.

---

# Digital Twin

The apartment should progressively become an editable digital twin.

The project already has an accepted working 2D representation of:

- apartment topology;
- room geometry;
- permanent wall relationships;
- doors and openings;
- windows;
- major fixed features;
- current removable Room C partition geometry;
- room relationships;
- key measured and reconciled horizontal geometry.

The next stage is to add the vertical dimension and create a useful 3D construction shell.

Over time the digital twin should expand into:

- kitchen layouts;
- bedroom layouts;
- plumbing;
- electrics;
- lighting;
- furniture;
- materials;
- budgeting;
- construction notes;
- contractor-facing information;
- AI visualisations.

---

# Guiding Principle

The permanent apartment shell is the foundation.

Everything else is layered on top.

The shell changes rarely.

Proposed layouts may change frequently.

Furniture and finishes may change even more frequently.

The project should therefore separate, wherever practical:

## Layer 1 — Existing permanent structure

The surveyed and accepted apartment shell.

## Layer 2 — Existing removable structure

Current partitions or other features known or intended to be removed but still relevant to understanding the existing apartment.

## Layer 3 — Proposed layouts

New partitions, openings and alternative spatial arrangements.

## Layer 4 — Services

Plumbing, waste, ventilation, heating and electrical routes/components.

## Layer 5 — Furniture and equipment

Kitchen units, appliances, sanitaryware, wardrobes, beds and other movable or replaceable components.

## Layer 6 — Finishes

Materials, colours, decoration and other cosmetic choices.

These layers should remain independently editable wherever practical.

---

# Current Development Goal

The current branch is:

`3d-shell-development`

The immediate goal is a deterministic **3D construction shell** generated from the promoted 2D geometry and existing vertical survey evidence.

The first 3D version should prioritise geometric correctness and inspectability rather than photorealism.

It should represent, where sufficiently supported:

- floor;
- permanent walls;
- ceiling heights;
- door openings;
- doors;
- door reveals and casings;
- windows;
- window recesses/casings;
- permanent cupboard/fixed structures;
- the current removable Room C partition as a separately classified element;
- relevant soffits or bulkheads;
- important structural wall returns.

Do not invent architectural complexity that has not been measured.

In particular, an old or irregular building does not automatically justify speculative sloping ceilings or roof geometry.

Where the surveyed ceiling is effectively flat, model it as flat.

---

# 3D as a Validation Interface

The 3D model is not merely a presentation output.

It should become another interface for inspecting the survey and model.

A user should eventually be able to navigate the flat and identify issues such as:

- a casing that appears to terminate incorrectly;
- an implausible doorway reveal;
- a wall that appears too long or short;
- a cupboard projection that appears misplaced;
- a questionable opening relationship;
- an unexpected ceiling or soffit condition.

The correct response to a visual discrepancy is:

**visual discrepancy → identify the relevant feature/node → inspect the source geometry and measurements → inspect evidence if necessary → correct authoritative data only if justified → regenerate dependent 2D and 3D outputs**

The 3D mesh must not become a separate manually corrected version of the apartment that can drift away from the underlying survey model.

---

# Data-Driven Architecture

Geometry should not be duplicated unnecessarily or hard-coded into rendering logic.

The desired relationship is:

**authoritative apartment data → deterministic 2D representation + deterministic 3D representation**

Rendering should display structured data.

Interaction should operate on structured data or explicit editable design layers.

Future modules should consume the same underlying apartment model wherever practical.

Avoid duplicated coordinate sources.

If an underlying permanent feature changes after justified evidence review, dependent representations should be regenerable.

---

# Geometry Authority

The current 2D authority is defined by:

`docs/survey/CURRENT_2D_MODEL.md`

and:

`docs/survey/FINAL_2D_BASELINE_MANIFEST.md`

The promoted whole-flat model is the primary working horizontal geometry.

Promoted final local baselines remain available for room-level detail and provenance.

Historical files inside `archive/` directories are not current geometry sources unless a task explicitly concerns reconstruction history or evidence diagnosis.

Earlier evidence maps, node maps, field forms and solver iterations remain valuable provenance but do not supersede the promoted final working shell.

---

# Retained Uncertainty

The current shell is a practical renovation and digital-twin baseline, not a construction-certified measured building survey.

Known local uncertainties remain, including:

- CP1 RC-04 object-layer conflict;
- CP2 outer-right footprint/casing station uncertainty;
- the accepted WC rectangular representation despite conflicting opposing-width evidence;
- the conditional C→D3→B validation residual;
- some door lining and reveal details;
- D5 high-level bulkhead detail;
- some minor casing or object dimensions not fully measured.

These uncertainties should be carried explicitly into later modelling where relevant.

They do not justify reopening the complete 2D shell.

---

# Vertical Geometry

Vertical survey evidence already exists and should be reviewed before the first 3D implementation.

Relevant evidence may include:

- room ceiling heights;
- door casing/opening heights;
- window sill and head levels;
- cupboard heights;
- floor-to-object relationships;
- Room B soffit/bulkhead observations;
- any local ceiling transitions.

Do not silently invent missing values.

Where a temporary assumption is genuinely required for a first model, it should be:

- explicit;
- traceable;
- replaceable;
- visually or structurally distinguishable from measured data where useful.

---

# Main Renovation Design Challenge

Room C remains the principal layout-design problem, but its **survey reconstruction is no longer the active task**.

The existing Room C geometry has been reconstructed and incorporated into the promoted whole-flat shell.

The renovation intention remains to remove the current internal bedroom enclosure where technically and legally appropriate and then divide the resulting space more effectively into:

- bedroom;
- kitchen.

The position of the future partition is intentionally undecided.

The planning system should eventually allow alternative positions to be tested against:

- room proportions;
- furniture fit;
- appliance fit;
- circulation;
- storage;
- plumbing routes;
- electrical routes;
- natural light;
- construction practicality.

The permanent surveyed shell beneath those alternatives must remain unchanged unless separately corrected through evidence review.

---

# Design Philosophy

The software should encourage experimentation.

Users should eventually be able to duplicate and compare layouts.

Nothing proposed should feel permanently baked into the surveyed structure.

Changing design choices should be quick and reversible.

Existing permanent geometry should remain clearly distinguishable from proposed geometry.

---

# Navigable 3D

After the basic construction shell is credible, the next useful capability is interactive visual inspection.

Desired capabilities include:

- orbit;
- pan;
- zoom;
- first-person or WASD-style walkthrough;
- looking through openings and reveals;
- ceiling visibility controls;
- selective wall visibility where useful;
- object selection;
- feature identification;
- eventual display of source IDs, dimensions or metadata.

The viewer should feel approachable rather than like a professional CAD package.

---

# Proposed Layouts

Once the existing shell has passed visual review, proposed renovation elements can be added as editable layers.

Examples include:

- new Room C partition walls;
- alternative Room C subdivisions;
- serving hatch concepts;
- kitchen cabinets;
- worktops;
- sink;
- fridge;
- oven;
- shower;
- toilet;
- basin;
- wardrobes;
- beds;
- furniture;
- storage;
- plumbing routes;
- electrical routes;
- heating components.

A proposed element should not silently become permanent survey geometry.

---

# Alternative Layouts

The system should eventually support multiple saved design states, for example:

- Layout A;
- Layout B;
- Layout C.

All alternatives should share the same permanent apartment shell.

Only proposed layers should vary between layout options unless an explicit alternative construction scenario is being investigated.

---

# Measurements and Evidence

Measurements and original evidence remain important even though the first 2D reconstruction stage is complete.

Original field observations, photographs, plans and walkthrough material should remain preserved.

The accepted model is an interpretation and reconciliation of that evidence rather than a replacement for it.

If a future discrepancy requires investigation, the project should retain enough provenance to trace model features back to the relevant observations.

Do not silently overwrite contradictory or superseded evidence.

---

# Source Material

The project uses:

- hand-drawn plans;
- walkthrough videos;
- timestamped walkthrough transcripts;
- room photographs;
- laser measurements;
- field notes;
- reconstruction reports;
- structured geometry;
- human review.

These sources have different authority depending on the task.

Original evidence should be preserved.

Transcripts are supporting evidence and may contain speech-to-text errors.

Historical reconstruction outputs explain how the current baseline was reached but do not automatically remain active geometry.

---

# User Interface

The interface should feel closer to an architectural planning board or simple exploration environment than a complex CAD package.

Priorities:

- clean;
- minimal;
- responsive;
- understandable;
- visually inspectable.

Users should eventually understand:

- what is existing;
- what is proposed;
- current dimensions;
- selected layout;
- editable objects;
- room names;
- service locations;
- known uncertainty.

---

# Future Modules

Potential future modules include:

## Kitchen Planner

- cabinets;
- appliances;
- worktops;
- clearances.

## Bedroom Planner

- beds;
- wardrobes;
- furniture;
- storage.

## Plumbing Planner

- water;
- waste;
- hot water;
- pipe routes.

## Electrical Planner

- sockets;
- lighting;
- consumer unit;
- circuits.

## Cost Planner

- material estimates;
- labour estimates;
- budgets;
- quotes.

## Construction Planner

- project stages;
- dependencies;
- contractor notes;
- checklists.

## AI Visualisation

- interior concepts;
- materials;
- lighting studies;
- design imagery;
- contractor-facing illustrations.

---

# Development Principles

Prioritise:

- simplicity;
- clarity;
- modularity;
- maintainability;
- traceability;
- deterministic generation;
- explicit assumptions;
- incremental development.

Avoid:

- premature optimisation;
- unnecessary abstraction;
- duplicated geometry;
- manually maintaining conflicting 2D and 3D models;
- speculative architecture;
- hiding uncertainty.

Every significant feature should make later development easier rather than harder.

---

# Development Sequence

The broad development path is now:

1. Preserve the promoted final 2D baseline.
2. Review and organise vertical geometry needed by 3D.
3. Define the minimal 3D data/coordinate conventions.
4. Generate the first deterministic construction shell.
5. Perform human visual inspection.
6. Add useful navigable-viewer controls.
7. Add selectable/inspectable model features.
8. Add proposed renovation layers.
9. Add reusable furniture, kitchen, bathroom and service components.
10. Add saved alternative layouts.
11. Extend into costs, construction planning and richer visualisation.

Do not jump to later modules before the permanent construction shell is credible.

---

# Long-Term Vision

The finished application should become the definitive digital representation of the apartment.

It should eventually allow the user to:

- explore the existing apartment;
- inspect dimensions and features;
- design layouts;
- compare alternatives;
- check fit and clearances;
- plan services;
- plan construction;
- estimate costs;
- visualise interiors;
- communicate proposals to contractors;
- manage the renovation;
- document the completed property.

It should become the operating system for the entire renovation rather than simply another drawing of the flat.

---

# Decision Hierarchy

When multiple renovation design solutions exist, prioritise them in this order:

1. Preserve structural integrity.
2. Maximise usable living space.
3. Improve natural light.
4. Minimise plumbing and electrical complexity.
5. Maximise storage.
6. Keep construction practical and cost-effective.
7. Produce a clean, modern interior.
8. Keep the design flexible for future refinement.

Every significant design recommendation should explain which of these priorities influenced it.

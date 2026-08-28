# Room C final 2D working baseline v1.0

**Status: FINAL 2D WORKING SHELL — VALIDATED FOR DESIGN / 3D DEVELOPMENT.**

This is the active standalone 2D baseline for Room C. It is a promotion/export of accepted geometry, not a new solve. Geometry movement during promotion is **0 mm**.

## Provenance

- Direct promoted source: `docs/survey/derived/room-c/archive/ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json`.
- The accepted shell/object coordinates are unchanged; this successor export consolidates the accepted continuous wall, cupboards, partition and doors in one standalone presentation.
- All pilots, diagnostics, measurements, superseded observations and validation audits remain preserved.

## Coordinate frame and whole-flat transform

Accepted Room C frame with C0 = (0,0); this is also the whole-flat datum.

`whole = local + (0, 0) mm`; rotation 0°; scale 1; no reflection.

- Maximum node round-trip delta: **0.000000000000 mm**.
- Maximum exported object/door round-trip delta: **0.000000000000 mm**.
- Numerically identical after transform: **yes**.
- Presentation-only differences: Promoted standalone drawing explicitly shows the continuous upper host wall, CP1/CP2, removable partition and accepted D2/D3/D4 layers together.

## Active files

- SVG: `ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.svg`
- JSON: `ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.json`
- Generator: `scripts/generate_final_2d_working_baselines_v1_0.mjs`

## Retained uncertainties

- Local RC-04 object-layer conflict remains; do not distort the shell to remove it.
- Body width/depth and direct Room C relationships remain strong. The outer-right footprint/casing station retains the localized uncertainty identified by the R5 semantic audit; CP2 is not moved.
- D3 opposing structural reveal and D4 structural reveal dimensions remain unmeasured.
- The accepted approximately 0.855 degree D2 A-side casing versus Room C opening-layer difference remains documented.

These caveats do not reopen the accepted room shell. This baseline is suitable for design coordination and 3D development, but is not construction-survey certification or structural-engineering approval.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**

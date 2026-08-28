# Room A final 2D working baseline v1.0

**Status: FINAL 2D WORKING SHELL — VALIDATED FOR DESIGN / 3D DEVELOPMENT.**

This is the active standalone 2D baseline for Room A. It is a promotion/export of accepted geometry, not a new solve. Geometry movement during promotion is **0 mm**.

## Provenance

- Direct promoted source: `docs/survey/derived/global-reconciliation/archive/WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3.json`.
- The accepted internal shape includes the human A1/chimney-return correction and approved -0.854961637° global orientation; the original pilot alone is not promoted.
- All pilots, diagnostics, measurements, superseded observations and validation audits remain preserved.

## Coordinate frame and whole-flat transform

A7 = (0,0); accepted A7→A6 family is local +x. This is a translation of accepted v1.3 global coordinates, not a new solve or inverse of the approved orientation.

`whole = local + (4432.6987, 134.9958) mm`; rotation 0°; scale 1; no reflection.

- Maximum node round-trip delta: **0.000000000000 mm**.
- Maximum exported object/door round-trip delta: **0.000000000000 mm**.
- Numerically identical after transform: **yes**.
- Presentation-only differences: Standalone crop and room-specific labels only; shared D2 opposing-face context is shown in the whole-flat and Room C packages.

## Active files

- SVG: `ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.svg`
- JSON: `ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.json`
- Generator: `scripts/generate_final_2d_working_baselines_v1_0.mjs`

## Retained uncertainties

- A↔C 9019 mm validation: model 8957.64 mm; residual -61.36 mm / -0.68%.
- D1 actual leaf width and exact lateral leaf/lining position remain unmeasured.
- The accepted approximately 0.855 degree D2 A-side casing versus Room C opening-layer difference remains documented.

These caveats do not reopen the accepted room shell. This baseline is suitable for design coordination and 3D development, but is not construction-survey certification or structural-engineering approval.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**

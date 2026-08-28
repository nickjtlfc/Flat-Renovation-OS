# Room B/WC final 2D working baseline v1.0

**Status: FINAL 2D WORKING SHELL — VALIDATED FOR DESIGN / 3D DEVELOPMENT.**

This is the active standalone 2D baseline for Room B/WC. It is a promotion/export of accepted geometry, not a new solve. Geometry movement during promotion is **0 mm**.

## Provenance

- Direct promoted source: `docs/survey/derived/room-b-wc/archive/ROOM_B_WC_FIELD_RECONCILED_RECTANGULAR_WC_CANDIDATE_v0_3.json`.
- Local v0.3 supplies the corrected Room B/rectangular WC geometry; frozen v1.3 supplies the accepted straight D5 object/door presentation.
- All pilots, diagnostics, measurements, superseded observations and validation audits remain preserved.

## Coordinate frame and whole-flat transform

Room B v0.3 local frame; B0 = (0,0), D3 casing axis = local +x.

`whole = local + (3309.78, 103.859) mm`; rotation 0°; scale 1; no reflection.

- Maximum node round-trip delta: **0.000000000001 mm**.
- Maximum exported object/door round-trip delta: **0.000000000000 mm**.
- Numerically identical after transform: **yes**.
- Presentation-only differences: Standalone crop and room-specific labels only.

## Active files

- SVG: `ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.svg`
- JSON: `ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.json`
- Generator: `scripts/generate_final_2d_working_baselines_v1_0.mjs`

## Retained uncertainties

- C↔B 3726 mm conditional D3-normal validation: model 3684.59 mm; residual -41.41 mm / -1.11%. Conditional D3-normal interpretation; exact original field ray bearing and landing stations were not permanently marked.
- Human rectangular working shell retained despite the 1643/1685 mm opposing-width observations.
- D3 opposing structural reveal and D4 structural reveal dimensions remain unmeasured.
- D5 shallow high-level cover/bulkhead exact 3D extent remains unmeasured.

These caveats do not reopen the accepted room shell. This baseline is suitable for design coordination and 3D development, but is not construction-survey certification or structural-engineering approval.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**

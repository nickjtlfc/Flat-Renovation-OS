# Final 2D baseline manifest

This is the authoritative entry point for active renovation digital-twin 2D geometry. The promoted files are validated working baselines for design and 3D development—not construction-survey certification, structural-engineering approval, or construction-locked records.

For the shortest source-of-truth orientation, see [CURRENT_2D_MODEL.md](CURRENT_2D_MODEL.md).

| Scope | Active SVG | Active JSON | Status | Supersedes / derives from |
|---|---|---|---|---|
| Room A | [ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.svg](derived/room-a/ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.svg) | [ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.json](derived/room-a/ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.json) | Final working 2D baseline | Frozen v1.3 Room A; S3 + human A1/chimney constraint + approved rigid orientation |
| Room B/WC | [ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.svg](derived/room-b-wc/ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.svg) | [ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.json](derived/room-b-wc/ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.json) | Final working 2D baseline | Rectangular local v0.3 + frozen v1.3 straight D5 presentation |
| Room C | [ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.svg](derived/room-c/ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.svg) | [ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.json](derived/room-c/ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.json) | Final working 2D baseline | Accepted Room C v1.0 + successor composition export |
| Whole flat | [WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg](derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg) | [WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json](derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json) | Final working 2D shell | Frozen whole-flat v1.3, coordinates unchanged |

Reports: [Room A](derived/room-a/ROOM_A_FINAL_2D_WORKING_BASELINE_v1_0.md), [Room B/WC](derived/room-b-wc/ROOM_B_WC_FINAL_2D_WORKING_BASELINE_v1_0.md), [Room C](derived/room-c/ROOM_C_FINAL_2D_WORKING_BASELINE_v1_0.md), and [whole flat](derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.md).

All four packages are reproduced by [scripts/generate_final_2d_working_baselines_v1_0.mjs](../../scripts/generate_final_2d_working_baselines_v1_0.mjs).

## Coordinate relationships

- **Room A:** local A7 = (0,0); translate by (+4432.6987, +134.9958) mm to the whole-flat frame. Approved Room A orientation is already baked into the local shape.
- **Room B/WC:** accepted local v0.3 frame; translate by (+3309.78, +103.859) mm.
- **Room C:** identity transform; Room C is the whole-flat datum.
- All transforms have rotation 0°, scale 1 and no reflection. Maximum verified node/object round-trip delta is 0.000000000001 mm.

## Active source of truth

Use `WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json` and its SVG for whole-flat 2D design, 3D modelling, furniture/layout planning and services planning. Use the matching room JSON/SVG when a local coordinate frame is preferable. Do not promote old pilots or diagnostics over these files.

## Retained known uncertainties

- A↔C 9019 mm validation: model 8957.64 mm; residual -61.36 mm / -0.68%.
- C↔B 3726 mm conditional D3-normal validation: model 3684.59 mm; residual -41.41 mm / -1.11%; exact field bearing was not permanently marked.
- CP1 RC-04 object-layer conflict remains local; shell unchanged.
- CP2 body and direct relationships are strong; outer-right footprint/casing station remains locally uncertain; CP2 unchanged.
- Rectangular WC is the accepted human working constraint despite the 1643/1685 mm opposing-width evidence.
- D1 leaf/lining placement, D3/D4 reveals, D2 layer difference and D5 bulkhead extent remain detail-stage uncertainties.

All raw measurements, superseded readings, reconstruction pilots, diagnostics, audits and generators remain preserved. No cleanup or archiving is performed by this promotion.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**

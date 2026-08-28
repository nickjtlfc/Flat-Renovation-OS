# Whole-flat final 2D working shell v1.0

**Status: FINAL 2D WORKING SHELL — VALIDATED FOR DESIGN / 3D DEVELOPMENT.**

This is the definitive active working 2D shell for the renovation digital twin. It is promoted directly from frozen `WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3`; every geometry coordinate and accepted D1–D5 composition is retained. It is not construction-survey certification, structural-engineering approval, or a construction-locked dimensional record.

## Promotion integrity

- Frozen v1.3 source SHA-256: `1617D936D521259A1D73E240C42E408F0F4C5F8D4FB60E585ED755027EC50474`.
- Frozen and promoted geometry SHA-256: `BF90135506785ABAB61FD79F37616F33F00EB2C6B6CEEDF01CFF1846465B90C0`.
- Exact geometry equality: **verified**.
- Geometry movement: **0 mm everywhere**.
- Solver run: **no**.
- D2, D3 and D5 registrations changed: **no**.

Retained composition checks: D1–D5, continuous Room C top wall, removable partition, CP1/CP2 cupboards, approved Room A orientation, corrected 136 mm Room B return, rectangular WC and straight 90° D5 leaf all pass.

## Room-baseline transforms

| Scope | Local frame | Whole-flat transform | Node / object round-trip maximum |
|---|---|---|---:|
| Room A | A7 = (0,0), accepted A7→A6 +x | translate (+4432.6987, +134.9958) mm | 0.000000000000 / 0.000000000000 mm |
| Room B/WC | accepted local v0.3, B0 = (0,0) | translate (+3309.78, +103.859) mm | 0.000000000001 / 0.000000000000 mm |
| Room C | accepted C0/global datum | identity | 0.000000000000 / 0.000000000000 mm |

## Whole-flat validations retained

- A↔C 9019 mm: model **8957.64 mm**; residual **-61.36 mm / -0.68%**.
- C↔B 3726 mm: model **3684.59 mm**; residual **-41.41 mm / -1.11%**. Exact original ray bearing and landing stations were not permanently marked.

## Remaining uncertainties

- **CP1:** Local RC-04 object-layer conflict remains; do not distort the shell to remove it.
- **CP2:** Body width/depth and direct Room C relationships remain strong. The outer-right footprint/casing station retains the localized uncertainty identified by the R5 semantic audit; CP2 is not moved.
- **WC:** Human rectangular working shell retained despite the 1643/1685 mm opposing-width observations.
- **Door/detail:** D1 actual leaf width and exact lateral leaf/lining position remain unmeasured. D3 opposing structural reveal and D4 structural reveal dimensions remain unmeasured. D5 shallow high-level cover/bulkhead exact 3D extent remains unmeasured. The accepted approximately 0.855 degree D2 A-side casing versus Room C opening-layer difference remains documented.

## Active source of truth

Future 2D design work, 3D modelling, furniture/layout planning and services planning should consume:

- `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.json` for authoritative coordinates and typed geometry;
- `docs/survey/derived/global-reconciliation/WHOLE_FLAT_FINAL_2D_WORKING_SHELL_v1_0.svg` for the active visual shell;
- `docs/survey/FINAL_2D_BASELINE_MANIFEST.md` as the entry point and per-room index.

Historical pilots, diagnostics, candidates, audits and evidence remain in place and are not superseded as provenance.

**FINAL 2D PROMOTION — HUMAN REVIEW REQUIRED**

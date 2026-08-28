# Room C accepted provisional baseline v1.0 — acceptance record

**Status:** **ACCEPTED PROVISIONAL BASELINE — SUITABLE FOR GLOBAL RECONCILIATION**, accepted by human review on 2026-08-12.

Room C local reconstruction is complete for now. The active Room C input for later whole-flat reconciliation is:

- `ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.json` — authoritative machine-readable Room C baseline;
- `ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.svg` — human-reviewable representation of the same baseline;
- `ROOM_C_ACCEPTED_PROVISIONAL_BASELINE_v1_0.md` — consolidated evidence and residual report;
- `scripts/consolidate_room_c_accepted_provisional_v1_0.mjs` — reproducible consolidation generator.

This acceptance records the current best Room C reconstruction. It does not make the geometry construction-locked, professionally survey-certified, or immune from later whole-flat adjustment. Small transparent node movements are permitted during global reconciliation when required by shared D2/D3 evidence and whole-flat closure.

## Accepted geometry state

- Selected shell: `A1`.
- Wall-family angle: `90.8536°`.
- `C0 → D3-CL = 4168.34 mm`.
- `C0 → CP1-FL = 3691.32 mm`.
- Consolidation movement from v0.4: `0.00 mm`.
- `D3-CL` is the permanent Room C turning corner.
- `D2-CR` lies `580 mm` along the adjoining wall and is not the corner.
- The existing removable stud wall retains distinct finite-thickness faces `PO1–PO2–PO3` and `PI1–PI2–PI3`.
- D2 retains its approximately `250 mm` through-wall reveal, `770 mm` opening and `742 × 1975 mm` closing leaf on the Room A side, opening into Room A. The wall depth is not an along-wall Room C dimension.

Corrected RC-19 remains `CP2-FR → PI3 = 2206 mm`; the model distance is `2202 mm`, residual `−4 mm`. The former CP2-FL transcription and approximately 111 mm conflict are superseded history only.

## Validation-only evidence

Residual convention is model minus physical measurement. These observations remain validation-only and must not be retroactively converted into fitting constraints:

| ID | Physical mm | Model mm | Residual mm |
|---|---:|---:|---:|
| `VALID-RC-01` | 3668 | 3690.92 | +22.92 |
| `VALID-RC-02` | 4405 | 4403.74 | −1.26 |
| `VALID-RC-03` | 4399 | 4373.84 | −25.16 |

The D3/D4 local casing-gap check remains measured `218 mm`, model `216.34 mm`, residual `−1.66 mm`.

## Vertical evidence

Retain the five station readings independently: D3 `2598 mm`, D4 `2631 mm`, CP1 `2596 mm`, CP2 `2594 mm`, and PO2 `2616 mm`. Their range is `37 mm`; do not average them into a universal Room C height or use them to alter plan geometry.

## Provenance and freeze rule

The v0.1 first pass, v0.2 object integration, v0.3 corrections and v0.4 vertical corrections remain intact under `archive/` as provenance/history. They are not competing active baselines and must not be deleted. Their historical filenames and file-content hashes are unchanged; the active generator resolves their archived filesystem location.

Do not pursue further Room C-only optimisation. Reopen the accepted Room C coordinates only if the global Room A / Room B-WC / Room C solve identifies a specific shared D2/D3 or whole-flat closure reason. Any later revision must preserve this v1.0 baseline and report the triggering evidence, affected nodes, coordinate movements and residual changes.

Carry these accepted uncertainties into global reconciliation rather than resolving them locally:

- exact D2 Room A/Room C finished-face registration;
- D2 casing/rebate and opposite opening-boundary detail;
- approximate nature of the `~250 mm` A-C wall thickness;
- D3 structural-opening/reveal geometry and approximate casing widths;
- distributed primary shell tensions in the approximately 14–17 mm range.

## Next phase

The next phase is whole-flat reconciliation using the accepted provisional baselines for Room A, Room B/WC and Room C. Shared D2 and D3 interfaces are global closure evidence, not permission to silently deform an accepted local reconstruction.

Do not begin global reconciliation or merge branches as part of this acceptance record.

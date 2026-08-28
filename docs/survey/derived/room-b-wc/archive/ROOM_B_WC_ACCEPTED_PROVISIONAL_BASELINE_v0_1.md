# Room B/WC accepted provisional baseline v0.1

**Status:** Accepted by human review on 2026-08-04 as the current working Room B/WC baseline.

This acceptance freezes the current P1 geometry for use as an input to the independent Room C reconstruction. It does not declare the reconstruction final, construction-accurate or immune from later global refinement.

## Frozen source artefacts

- `ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.svg`
- `ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.json`
- `ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1.md`
- `ROOM_B_WC_RECONSTRUCTION_PILOT_v0_1_solver-output.json`
- `scripts/solve_room_b_wc_pilot.mjs`
- Room B/WC evidence packs, node addendum, node map/register and all correction history

The selected solution remains `P1`. Its accepted headline metrics are Room B RMS 6.244 mm, WC RMS 1.354 mm and largest active exact residual `SUP-069 = -15.864 mm`.

## Freeze rule

Do not pursue further marginal Room B/WC-only optimisation. Preserve the selected coordinates, topology, evidence weights, object-layer interpretation and correction history while Room C is reconstructed independently.

Remaining uncertainties—especially D3 object layers, `BASE-B-07`, `SUP-080`, `SUP-081` and minor shell alignment—remain recorded. They are not reasons to reopen the local fit in isolation.

## Room C integration handoff

Room C should be reconstructed independently using the same evidence-first method. Global registration should then use:

- Room A to Room C through the shared D2 geometry;
- this Room B/WC baseline to Room C through the shared D3 geometry.

The doorway interfaces are global closure constraints, not permission to silently deform an accepted room model. Reopen Room B/WC only if the combined D2/D3 network exposes a genuine inconsistency that cannot be resolved by modest global registration or by correcting Room C evidence.

Any later revision must retain this v0.1 baseline and describe the triggering global evidence, affected measurements, coordinate movement and residual changes.

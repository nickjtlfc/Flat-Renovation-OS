# Room C reconstruction — object integration v0.2

Status: **proposal for human visual review; accepted first-pass shell retained exactly**.

This pass adds the 12 August 2026 object survey to the accepted Room C v0.1 shell. It does not restart the shell solve, perform global flat reconciliation, or propose renovation geometry.

## Shell

The accepted first-pass shell **did not change**. Every retained shell and PO/PI partition coordinate has movement **0.00 mm**. D3-CL remains the permanent turning corner; D2-CR remains 580 mm along its adjoining wall.

Three former provisional/display object stations changed without moving shell geometry:

- CP1-FR moved 40.70 mm to apply the direct 1285 mm CP1 body width.
- D4-CL moved 18.33 mm from the v0.1 equal-split display gauge to the measured 920 mm casing/leaf span.
- D3-CR moved 16.67 mm from the v0.1 equal-split display gauge to the 885 mm approximate casing/leaf span anchored at the D3-CL corner.

The resulting D3-to-D4 wall gap is 216.34 mm versus RC-09 = 218 mm, residual -1.66 mm. This validates the new object placements without shell adjustment.

## Objects

### CP1

- **Applied/measured:** 1285 mm body width; 518 mm constant body depth, superseding 523 mm; ceiling-to-top 1261 mm; bottom-to-finished-floor 1315 mm.
- **Interpretation:** suspended mid-air cupboard; editable body layer.
- **Approximate:** none of the applied body dimensions.
- **Inferred:** the plan footprint projects outward from the retained CP1-FL wall relationship.
- **Unmeasured:** body height, casing and detailed joinery.
- **Conflict retained:** the updated CP1-FR leaves 265.7 mm to PO1 versus inherited RC-04 = 225 mm, residual +40.7 mm. The shell anchors are not moved to conceal it.

### CP2

- **Applied/measured body:** 708 mm width; 536 mm depth; top-to-finished-floor 2148 mm.
- **Approximate:** top-to-ceiling about 450 mm; viewer-left vertical casing about 20 mm.
- **Separate layers:** 708 mm body, left/top casing, and removable cupboard door.
- **Inferred:** body-left plan edge is shown 20 mm inside the inherited CP2-FL outer reference; casing continuation across the top is shown without inventing a top thickness.
- **Unmeasured:** right-side gap/joinery allocation, top-casing thickness, removable-door dimensions and internal construction.

### D2

- **Structural wall depth:** **250 mm**, retained separately from the door object.
- **Structural opening:** **770 mm**.
- **Visible closed leaf:** **742 mm wide × 1975 mm high**.
- **Swing:** **opens into Room A**.
- **Inferred:** for plan display, the opening is anchored at D2-CR and the 742 mm leaf is centred, leaving 14 mm each end. The casing-to-structural-opening offset was not measured, so this does not redefine D2-CL.
- **Unmeasured:** casing dimensions, hinge side and the minor viewer-right lip dimension.

### D3

- **Measured leaf:** 760 × 1987 mm.
- **Approximate casing:** left 45 mm; right 80 mm; upper 80 mm.
- **Vertical:** top casing to ceiling **544 mm**, retained independently.
- **Swing:** opens into Room C; hinge side remains unmeasured.
- **Topology:** D3-CL remains the permanent turning corner and directly abuts the casing. The stale straight-continuation sentence is not used.
- **Unmeasured:** structural-opening dimensions and reveal depth.

### D4

- **Measured leaf:** 760 × 1987 mm.
- **Measured casing:** left 80 mm; right 80 mm; upper 80 mm.
- **Vertical:** top casing to ceiling **567 mm**, retained independently.
- **Swing:** opens into Room C; hinge side remains unmeasured.
- **Unmeasured:** structural-opening dimensions and reveal depth.

D3's 544 mm and D4's 567 mm ceiling clearances remain separate observations. Their 23 mm difference is not averaged or used to alter plan geometry.

### W2

- **Measured opening:** **1269 × 1515 mm**.
- **Approximate:** bottom of opening to finished floor about 1060 mm; top of opening to ceiling about 700 mm; casing about 40 mm on all sides.
- **Inferred:** the plan casing is shown as a simple 40 mm approximate surround.
- **Unmeasured/deferred:** detailed frame, reveal and heritage assembly geometry; replacement is anticipated.

## Placement and interpretation checks

| Check | Reference mm | Integrated mm | Residual/difference mm | Treatment |
|---|---:|---:|---:|---|
| OBJ-CHECK-CP1-RC04 | 225.00 | 265.70 | +40.70 | validation only; shell unchanged |
| OBJ-CHECK-D3-D4-RC09 | 218.00 | 216.34 | -1.66 | validation only; shell unchanged |
| OBJ-CHECK-CP2-FOOTPRINT-BALANCE | 755.00 | 728.00 | -27.00 | 27 mm remains unallocated; no right casing or gap dimension invented |

## RC-19

RC-19 remains unresolved. The raw CP2-FL → PI3 = 2206 mm observation is retained and remains held out of the shell fit.

The new CP2 evidence **partially clarifies endpoint layering**: the inherited CP2-FL/FR span is 755 mm, while the measured body is 708 mm and the known viewer-left casing is approximately 20 mm, leaving 27 mm without a measured right-side allocation. If CP2-FL were reinterpreted as the body-left edge behind that casing, the RC-19 residual would reduce only from +111.17 mm to +105.02 mm. More than 100 mm remains, so the object survey does not resolve the discrepancy and the shell/partition is not distorted.

## Reproducibility and scope

The successor script reads the accepted v0.1 JSON, asserts its selected A1 baseline, retains all shell coordinates, adds structured object/vertical evidence, runs interpretation checks, and regenerates this report, the v0.2 JSON and SVG. Vertical observations are explicitly marked as non-plan constraints.

Stop here for human review. Do not use this artifact for global D2/D3 reconciliation, renovation layout design, or construction.

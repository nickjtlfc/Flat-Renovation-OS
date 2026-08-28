# Room C reconstruction — targeted object corrections v0.3

Status: **proposal for human visual review; v0.2 preserved; accepted first-pass A1 shell retained exactly**.

This successor makes only the requested RC-19 endpoint correction, D2 closing-plane correction, and addition of five station-specific floor-to-ceiling readings. It does not re-solve Room C, perform global reconciliation, or alter unrelated geometry.

## Shell preservation

No accepted shell or PO/PI node moved: maximum movement **0.00 mm**. The approximately 250 mm D2 depth is represented only on the perpendicular through-wall axis toward Room A; it does not enter or lengthen the Room C along-wall shell chain.

## RC-19 field-transcription correction

- **Superseded transcription retained as history:** CP2-FL → PI3 = 2206 mm.
- **Active observation:** **CP2-FR → PI3 = 2206 mm**.
- Previous solved distance/residual: 2317.17 mm / **+111.17 mm**.
- Corrected solved distance/residual: 2202.00 mm / **-4.00 mm**.
- Signed residual change: **-115.17 mm**; absolute residual magnitude improves by **107.17 mm**.

Assessment: **resolved**. The corrected residual is within the inherited 8 mm nominal sigma. RC-19 now supports the fixed accepted geometry as a validation observation; no shell node was moved.

## D2 closing-plane correction

The drawing and structured geometry now show this physical sequence:

**Room C → structural opening/deep reveal through approximately 250 mm wall → 742 mm D2 leaf/closing plane on the Room A side → swing into Room A.**

Preserved measurements are the approximately 250 mm structural reveal depth, 770 mm structural opening, 742 × 1975 mm visible closed leaf, and Room A swing destination. The Room C-side deep reveal remains visible as a separate opening layer.

Remaining D2 ambiguity: exact casing dimensions, exact Room A-side leaf rebate/inset, casing-to-structural-opening offset, hinge side, minor viewer-right lip dimension, and the inferred opposite opening boundary. The drawing therefore fixes the confirmed physical side but keeps the closing plane’s precise rebate schematic.

## Station-specific Room C floor-to-ceiling evidence

| Survey station | Floor to ceiling mm |
|---|---:|
| near D3 | 2598 |
| near D4 | 2631 |
| near CP1 | 2596 |
| near CP2 | 2594 |
| near PO2 | 2616 |

All five readings are retained independently. Lowest is **2594 mm near CP2**; highest is **2631 mm near D4**; observed range is **37 mm**. They were not averaged and did not influence the 2D shell solve.

### Vertical consistency review

- D3 components total 2611 mm versus the local 2598 mm: **+13 mm**, not considered material at this evidence detail.
- D4 components total 2634 mm versus 2631 mm: **+3 mm**, not material.
- CP2 components total approximately 2598 mm versus 2594 mm: **+4 mm**, not material.
- CP1’s known clearances total 2576 mm, leaving only **20 mm** for the unmeasured cupboard body height against the 2596 mm local height. This appears **materially inconsistent** and needs field/reference clarification; no value was adjusted.
- W2’s approximate vertical chain totals 3275 mm, **644 mm above the highest new local reading**. Although no new height was taken specifically at W2, this is materially inconsistent with the new Room C height range and likely reflects differing reference semantics or an erroneous approximate component. It remains unadjusted.

Existing D3/D4 casing-to-ceiling, cupboard, door, and window vertical observations remain separate in the JSON. None were forced to close mathematically.

Stop here for human review. Do not use this artifact to begin global reconciliation or further Room C optimisation.

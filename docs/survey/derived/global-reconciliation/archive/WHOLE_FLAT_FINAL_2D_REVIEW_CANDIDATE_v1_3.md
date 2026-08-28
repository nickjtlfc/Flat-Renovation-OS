# Whole-flat final 2D review candidate v1.3

**Status: PRE-FINAL 2D FIELD-VALIDATION CANDIDATE — HUMAN REVIEW REQUIRED.**

This successor performs only the final D3/D5 doorway-junction drafting correction and the minimum D5 object alignment required by the human observation that the leaf sits straight and flush. No whole-flat solve, room-shell movement or registration change occurred.

## Grey-markup confirmation and freeze

The supplied `grey-showing-wall-relationship-between-rooms.jpg` was used only as a human architectural/drafting-intent reference. No dimension was derived from its pixels.

The enlarged v1.3 junctions already match that intent, so no v1.4 or further composition change is required:

- D5 Room B walls meet B1/B2 outer casing endpoints with 0.000 mm mismatch; WC walls meet T0/D5-WCL outer casing endpoints with 0.000 mm mismatch.
- D3 Room C and Room B wall runs meet their own outer casing boundaries with 0.000 mm mismatch.
- Cyan zones are reveal/depth, not wall fill; the openings remain clear.
- D5 remains a straight 90 degree leaf.
- D3 retains its real casing-width asymmetry without a diagonal permanent wall.

The v1.3 geometry and doorway composition are therefore frozen as the **PRE-FINAL 2D FIELD-VALIDATION CANDIDATE**. The field-validation package is deliberately deferred to the next task.

## D5 wall junction

The permanent Room B wall now reads explicitly to the **Room B outer casing boundaries B1 and B2**. The WC wall reads explicitly to the **WC outer casing boundaries T0 and D5-WCL**. The doorway/reveal zone joins those unchanged opposing faces, while the opening remains free of any wall.

Relative to v1.2, this is a **composition and layer-selection correction**: wall termination is communicated by the outer casing edges, never by the black leaf endpoints. Room B and WC remain visibly connected through one D5 opening.

## D5 door alignment

The v1.2 leaf endpoints had different x coordinates and produced an **88.677863 degree** black leaf line. Both accepted D5 casing faces and the Room B/WC doorway family are **90.000000 degrees**. v1.3 rotates the physical leaf about its unchanged centre to **90.000000 degrees** and straightens the separate Room B visible-leaf face about its own centre.

- Reference direction: parallel Room B/WC outer casing and orthogonal shell family.
- Leaf width: 761.000 -> 761.000 mm.
- Shared leaf-centre movement: 0.000 mm.
- Maximum D5 object-node movement: 8.785 mm.
- D5 casing, wall-side reveal-boundary and permanent-shell movement: 0.000 mm. Only the leaf-side ends of the reveal graphics follow the corrected leaf/visible face.
- Hinge side and opening into the WC: unchanged.

| Altered D5 object coordinate/alias | v1.2 x,y mm | v1.3 x,y mm | dx | dy | movement |
|---|---:|---:|---:|---:|---:|
| sharedLeaf.leafTop / roomBD5.doorLeft / wcD5.doorRight | 5059.726, 293.826 | 5068.501, 293.730 | 8.775 | -0.096 | 8.775 |
| sharedLeaf.leafBottom / roomBD5.doorRight / wcD5.doorLeft | 5077.285, 1054.623 | 5068.501, 1054.730 | -8.784 | 0.107 | 8.785 |
| roomBD5.visibleDoorLeft | 5059.840, 298.868 | 5068.341, 298.769 | 8.501 | -0.100 | 8.501 |
| roomBD5.visibleDoorRight | 5076.841, 1035.525 | 5068.341, 1035.624 | -8.501 | 0.100 | 8.501 |
| sharedLeaf / roomBD5 / wcD5 doorCentre | 5068.501, 674.230 | 5068.501, 674.230 | 0.000 | 0.000 | 0.000 |

**D5 now sits straight/flush between Room B and WC rather than diagonally through the wall assembly.**

## D3 wall junction

The D3 correction is composition-only. The Room C wall terminates at **D3-OUTER-R** and **D3-OUTER-L-CORNER/D3-CL**; the Room B wall terminates at its distinct **B0/outerLeft** and **D3-BR/outerRight** casing boundaries. A clearly coded reveal zone and jamb bridges connect the two faces without presenting those unequal casing endpoints as a diagonal permanent wall.

Room C casing remains 885.000 mm and Room B casing remains 852.121 mm. Their real asymmetry remains visible. D3 position, axis, shared leaf, registration, D3-BR, B0.5 and the 136 mm return are unchanged.

## Frozen geometry

| Item | Movement from v1.2 |
|---|---:|
| Room A | 0.000 mm |
| Room C shell | 0.000 mm |
| Room B shell | 0.000 mm |
| WC shell | 0.000 mm |
| D2 | 0.000 mm |
| D3 | 0.000 mm |
| B0.5 | 0.000 mm |
| CP1/C1 and CP2/C2 cupboards | 0.000 mm |
| Room C removable partition | 0.000 mm |

All confirmed D1-D5 hinge sides and swing destinations carry forward unchanged.

## Validation

| Validation | Measured | v1.2 model | v1.3 model | v1.2 residual | v1.3 residual | Change |
|---|---:|---:|---:|---:|---:|---:|
| A/D2/C | 9019 mm | 8957.64 | 8957.64 | -61.36 | -61.36 | 0.00 mm |
| C/D3/B | 3726 mm | 3684.59 | 3684.59 | -41.41 | -41.41 | 0.00 mm |

## Remaining issues

No known issue from this pass materially prevents final 2D approval. The following remain non-blocking detail measurements for later design/3D work:

- D1 actual leaf width and exact lateral leaf/lining position.
- D3 opposing structural reveal and D4 structural reveal dimensions.
- Exact 3D dimensions and extent of the shallow high-level D5 cover/bulkhead.
- The already accepted 0.855 degree D2 A-side casing versus fixed Room C opening-layer difference remains documented.

No repository cleanup, archive pass, final promotion or 3D work has been performed.

**HUMAN REVIEW REQUIRED**

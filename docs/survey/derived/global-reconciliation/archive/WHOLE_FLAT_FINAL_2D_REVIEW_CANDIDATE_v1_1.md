# Whole-flat final 2D review candidate v1.1

**Status: FINAL 2D REVIEW CANDIDATE — HUMAN APPROVAL REQUIRED.**

This is a narrowly scoped successor to `WHOLE_FLAT_PREFERRED_PROVISIONAL_WORKING_SHELL_v1_0`. It restores one omitted permanent-wall stroke, standardises the five door graphics, and applies one tested rigid Room A orientation correction. It does not reconstruct a room, run a solve, scale geometry, alter Room C/Room B/WC, change D3/D5, begin 3D work, or promote the model to construction geometry.

## Room C upper permanent wall

The permanent host wall is now drawn continuously from **CP1-FL (54.99, -3690.92) mm** to **CP2-FL (3468.33, -3690.92) mm**. In v1.0, the renderer ended one stroke at PO1 and restarted at PI1, so the partition thickness appeared as a 123.64 mm break. That was a composition error: the permanent wall continues behind the junction.

No Room C node moved. CP1/C1, CP2/C2 and the removable partition retain their accepted geometry. The partition is lighter and subordinate to the continuous permanent host wall.

## Door convention

All five openings now use the same visual language: magenta opening, ochre casing, cyan reveal, black closed-leaf reference, and a dashed red destination arrow.

| Door | Opens into | Geometry shown | Hinge treatment |
|---|---|---|---|
| D1 | Room A | 781 mm clear proxy; 1204 mm front casing | Unresolved; destination arrow only |
| D2 | Room A | 770 mm opening; 742 mm leaf; ~250 mm reveal | Unresolved; destination arrow only |
| D3 | Room C | 760 mm leaf; separate C/B casing faces | Photo-supported east endpoint; swing arc shown |
| D4 | Room C | 760 mm leaf; 920 mm casing | Unresolved; destination arrow only |
| D5 | WC | 761 mm shared leaf; separate B/WC casing faces | Photo-supported north/top endpoint; swing arc shown |

The task supplies the swing destinations as authoritative: D1 -> Room A, D2 -> Room A, D3 -> Room C, D4 -> Room C, D5 -> WC. The explicitly labelled D3 Room B photograph supports the east-end hinge, and the paired D5 Room B/WC photographs corroborate the north/top hinge from both faces, so those two doors have swing arcs. D1, D2 and D4 retain destination-only arrows because their accepted evidence does not map a hinge side unambiguously enough to create a pivot. D1's 781 mm clear width and 1204 mm front casing width exist, but its leaf endpoints/lateral placement do not; the centred black 781 mm line is explicitly a schematic clear-opening proxy, not a new node or surveyed leaf position.

## Room A rigid orientation review

Room A is rotated **-0.854962 degrees** about the unchanged D2 Room A casing-centre anchor **(4432.69, -961.17) mm**. The target is the long A7-A6 lower wall, which becomes parallel to the fixed WC T0-T1 and Room C horizontal families. Scale is 1, there is no deformation, and maximum pairwise distance change is 0.000098602 mm.

| Wall family | Nodes | Before deg | After deg | Review role |
|---|---|---:|---:|---|
| A-lower-principal | A7-A6 | 0.854962 | 0.000000 | WC T0-T1 horizontal family |
| A-upper-opening-side | A2-A3 | 0.923501 | 0.068541 | diagnostic only; not independently altered |
| A-C-side | A7-A0 | -89.145754 | -90.000716 | near perpendicular to Room C horizontal family |
| WC-horizontal | T0-T1 | 0.000000 | 0.000000 | fixed reference family |
| WC-vertical | T0-T3 | 90.000000 | 90.000000 | fixed reference family |
| C-lower | C0-D3-CL | 0.000000 | 0.000000 | fixed horizontal family |
| C-upper-host-wall | CP1-FL-CP2-FL | 0.000000 | 0.000000 | fixed horizontal family |
| C-D2-side | D3-CL-D2-CR | -89.146465 | -89.146465 | fixed D2 adjoining wall |

The A2-A3 upper segment remains at 0.068541 degrees because the source Room A evidence-fit shape was kept rigid rather than squared internally.

### Room A node movement

| Node | dx mm | dy mm | movement mm |
|---|---:|---:|---:|
| A2 | -43.27 | -19.73 | 47.56 |
| A3 | -43.02 | -48.90 | 65.13 |
| A0 | -47.84 | -0.36 | 47.84 |
| A1 | -47.67 | -19.76 | 51.60 |
| A4 | -46.99 | -48.83 | 67.77 |
| A5 | -46.86 | -68.09 | 82.65 |
| A6 | 16.86 | -67.61 | 69.68 |
| A7 | 16.36 | 0.12 | 16.36 |
| W1-AL | -25.86 | -67.93 | 72.69 |
| W1-AR | -4.44 | -67.77 | 67.91 |
| D1-AL | 16.80 | -59.74 | 62.06 |
| D1-AR | 16.67 | -41.99 | 45.18 |
| D2-AL | 8.15 | 0.06 | 8.15 |
| D2-AR | -8.15 | -0.06 | 8.15 |

Maximum movement is **82.65 mm at A5**. Room C and Room B/WC movement is 0 mm.

## D2 consequence

The D2 physical registration centre moves **0.000 mm**. The fixed Room C structural-opening and leaf layers do not move; only the Room A clear-opening and measured-casing segments rotate with Room A. Their casing endpoints move 8.18 / 8.18 mm and clear-opening endpoints move 5.72 / 5.72 mm.

The approximate through-wall face-centre separation remains **250.00 mm**. The opposing A/C face-angle difference changes from 0.000 to **0.855 degrees**. This is the explicit cost of keeping Room C fixed while rotating Room A; it is not silently reconciled.

## Independent validations

| Validation | Measured | Before model | After model | Before residual | After residual |
|---|---:|---:|---:|---:|---:|
| Far Room A wall through D2 to opposite Room C wall | 9019 | 8957.14 | 8957.64 | -61.86 | -61.36 |
| Room C partition outer face through D3 to Room B back wall | 3726 | 3684.59 | unchanged | -41.41 | unchanged |

The rigid Room A test improves the 9019 mm absolute residual by only **0.50 mm**. It remains an independent residual, not a fitted constraint.

## Preserved geometry and evidence

- Room B remains orthogonal with the corrected 136 mm D3 return.
- WC remains rectangular.
- Room C shell, cupboards CP1/C1 and CP2/C2, and removable partition geometry are unchanged.
- D3 and D5 geometry/registration are unchanged.
- The v1.0 predecessor and all measurement-driven/superseded records remain intact.
- No global optimisation or new shell solve was performed.

## Remaining human-review ambiguities

- Hinge sides for D1, D2 and D4 are not verified; destination arrows are shown without invented pivots or arcs.
- D1 leaf endpoints and lateral clear-opening placement are not surveyed; the 781 mm reference is schematic and centred only for display.
- The Room A rigid correction produces a 0.855 degree angular difference at the separate D2 A/C face layers while keeping their shared centre fixed.
- D3 opposing structural reveal and D4 structural reveal remain unmeasured.

The 9019 mm and 3726 mm residuals remain documented above as independent, non-fitted checks. They are not treated as blockers to using this candidate for human 2D review.

## Final human-review gate

### Composition fixes

- The permanent upper Room C wall is continuous from CP1-FL to CP2-FL; this is a composition-only restoration over unchanged nodes.
- The removable partition retains both faces, thickness and topology, and remains visually subordinate.
- D1-D5 use the same opening/casing/reveal/leaf/swing vocabulary without collapsing opposite faces.
- Confirmed destinations used: D1 -> Room A; D2 -> Room A; D3 -> Room C; D4 -> Room C; D5 -> WC. Only photo-supported D3 and D5 hinges have arcs.

### Room A orientation

- Current principal A7-A6 angle: 0.854962 degrees; fixed WC T0-T1 reference: 0.000000 degrees.
- The fixed Room C C0-D3-CL / CP1-FL-CP2-FL family is 0.000000 degrees; A7-A0 changes from -89.145754 to -90.000716 degrees. Its included angle to that Room C family changes from 89.145754 to 89.999284 degrees (departure from square 0.854246 to 0.000716 degrees).
- Adopted rigid test rotation: -0.854962 degrees about D2; maximum Room A movement: 82.65 mm at A5.
- D2 centre movement is 0 mm; its fixed C layers remain fixed and the separate A/C layer angle difference becomes 0.855 degrees.
- The 9019 mm model changes from 8957.14 to 8957.64 mm; residual changes from -61.86 to -61.36 mm.

### Frozen geometry

| Item | Movement/change |
|---|---|
| Room C | 0 mm |
| Room B | 0 mm |
| WC | 0 mm |
| D3 registration/geometry | unchanged |
| CP1/C1 and CP2/C2 cupboards | 0 mm / unchanged |
| Room C removable partition | 0 mm / unchanged |

### Remaining known uncertainties

- Hinge sides for D1, D2 and D4 are not verified; destination arrows are shown without invented pivots or arcs.
- D1 leaf endpoints and lateral clear-opening placement are not surveyed; the 781 mm reference is schematic and centred only for display.
- The Room A rigid correction produces a 0.855 degree angular difference at the separate D2 A/C face layers while keeping their shared centre fixed.
- D3 opposing structural reveal and D4 structural reveal remain unmeasured.

**STOP: HUMAN REVIEW REQUIRED. No cleanup pass, final promotion, construction lock, or 3D work has been performed.**

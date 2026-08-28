# Whole-flat human architecturally constrained reconciliation v0.2

**Status: PROVISIONAL HUMAN ARCHITECTURALLY CONSTRAINED WORKING MODEL — HUMAN REVIEW REQUIRED.**

This successor starts from `WHOLE_FLAT_ARCHITECTURALLY_CONSTRAINED_RECONCILIATION_v0_1`. It does not overwrite v0.1 or any accepted measurement-derived room baseline. The supplied `black-to-straigthen.jpg` markup was interpreted only as human approval of named straight/parallel/perpendicular relationships; no coordinate or dimension was taken from painted pixels.

## Evidence and constraint boundary

- **Measurement-derived evidence:** the accepted Room A, Room B/WC and Room C records, including the conflicting WC widths of 1643 and 1685 mm, remain unchanged provenance.
- **Human-approved working geometry:** only the wall families mapped below are regularised. It is a preferred design/3D working candidate only after human review, not final measured geometry.

## Painted-guide topology mapping

| Guide | Exact model interpretation | Physical rendering |
|---|---|---|
| Room A upper guide | `A0→A1`, referenced to fixed `A2→A3` | wall |
| Room B left guide | `B0→B4`; adjacent `D3-BR→B0.5` remains separately fixed | real side wall plus distinct return |
| Room B/D5 right guide | `B1→B2→B3` | virtual reference through `B1→B2` opening; `B2→B3` wall |
| Room B bottom guide | `B4→B3` | wall, perpendicular to side families |
| WC/D5 guide | `T0→D5-WCL→T3` | virtual reference through opening, then wall on a distinct WC face |

D5 remains an opening. The clean SVG contains no wall through either D5 face or the `B1→T0` assembly gap.

## Before/after wall-family results

| Area | Nodes/segments | Original | Constrained | Max movement | RMS movement |
|---|---|---:|---:|---:|---:|
| Room A upper | `A0→A1`, `A1→A2`, reference `A2→A3` | direction 1.520°; reference offset 0.597°; A1 90.000° | direction 0.924°; reference offset 0.000°; A1 90.000° | 13.89 mm | 13.89 mm |
| Room B left/right families | `B0→B4`; `B1→B2→B3` | 92.465° / 93.025°; taper 0.560° | 93.025° / 93.025°; taper 0.000° | 21.99 mm | 21.99 mm |
| Room B bottom | `B4→B3` against right family | direction 3.025°; angle 90.000° | direction 3.025°; angle 90.000° | 21.99 mm | included above |
| Room B D5 line | `B1→B2→B3` | break 0.000001° | break 0.000001° | 21.99 mm | included above |
| WC rectangle/D5 face | `T0,T1,T2,T3,D5-WCL` | 90.000°; kink 0.000019° | 90.000°; kink 0.000019° | 0.00 mm | 0.00 mm |

The unchanged v0.1 `B1→B2→B3` family (93.025°) is the directional datum for the Room B correction. `B4` alone is moved to make `B0→B4` parallel and `B4→B3` perpendicular (3.025°). The already-rectangular WC and the separate fixed `D3-BR→B0.5` return are not re-solved. This honours the markup without treating its pixels as survey geometry.

## Node movement from v0.1

| Area | Node | ΔX mm | ΔY mm | Movement mm |
|---|---|---:|---:|---:|
| A | `A1` | -2.71 | -13.63 | 13.89 |
| B | `B4` | -21.96 | -1.16 | 21.99 |

Maximum displacement is **21.99 mm at B:B4**. RMS across moved nodes is **18.39 mm**. Every unlisted node is unchanged.

## Measurement consequences

| Metric | v0.1 before | v0.2 after |
|---|---:|---:|
| Total comparable RMS (58 observations) | 7.31 mm | 8.96 mm |
| Room A RMS | 5.30 mm | 6.42 mm |
| Room B RMS | 9.94 mm | 14.09 mm |
| WC RMS | 13.46 mm | 13.46 mm |
| Worst residual | `BASE-WC-03` -22.17 mm | `SUP-071` +28.69 mm |

Largest changed direct-observation residuals:

| Observation | Before mm | After mm | Change mm |
|---|---:|---:|---:|
| `BASE-B-06` | -6.58 | +15.42 | +21.99 |
| `SUP-071` | +10.92 | +28.69 | +17.77 |
| `SUP-070` | -3.29 | +10.43 | +13.72 |
| `BASE-A-02` | -3.03 | +10.53 | +13.56 |
| `SUP-040` | -4.37 | +7.79 | +12.15 |
| `SUP-039` | +3.30 | +14.21 | +10.91 |
| `SUP-039-R1` | +1.30 | +12.21 | +10.91 |
| `BASE-A-01` | -12.38 | -15.38 | -3.00 |
| `BASE-B-07` | +31.19 | +31.08 | -0.11 |

The WC remains an exact architectural rectangle despite the retained 42 mm conflict between its 1643 and 1685 mm opposing-width observations. The evidence is preserved; the working outline does not reproduce the measurement conflict as a kink.

## Independent validation

| Span | Measured | v0.1 model | v0.1 residual | v0.2 model | v0.2 residual |
|---|---:|---:|---:|---:|---:|
| Far Room A wall through D2 to opposite Room C wall | 9019 | 8957.14 | -61.86 | 8957.14 | -61.86 |
| Room C partition outer face through D3 to Room B back wall | 3726 | 3741.07 | +15.07 | 3741.07 | +15.07 |

## Preservation and review gate

Room C movement is **0.00 mm**. D2, D3, the D3 shared-door layers, both endpoints of `D3-BR→B0.5`, the Room A D2 casing, Room C cupboards, global scale and all accepted measurement baselines remain unchanged. `B0.5` remains the genuine separate return corner.

This candidate requires human visual review. It is not promoted to a final shell, and no 3D work follows from this task.

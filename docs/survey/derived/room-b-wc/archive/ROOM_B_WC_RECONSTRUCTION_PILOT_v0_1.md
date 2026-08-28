# Joint Room B and WC reconstruction pilot v0.1

**Status:** Human-accepted provisional working baseline **P1: Accepted provisional baseline with two strong soft wall-direction families** on 2026-08-04. Geometry is frozen for Room C integration. This is not final or construction-accurate geometry and remains derived rather than source evidence.

## Outcome

The active network now uses **BASE-WC-03 T2 -> T3 = 1685 mm** and **SUP-071 B2 / D5-BR -> B4 = 2046 mm**. The superseded 690 mm and B1/2014 mm records are correction history only and never enter the solve.

It also uses corrected **BASE-B-07 B4 -> B0 / D3-BL = approximately 2200-2220 mm**. The former 2010-2030 mm range is inactive correction history only.

The authoritative topology is unchanged: **B0/D3-BL -> D3 opening -> D3-BR -> 249 mm wall return -> B0.5 -> wall -> B1/D5-BL -> D5 assembly gap (no wall) -> T0/D5-WCR -> wall -> T1**. B0.5-B1 and T0-T1 are exactly collinear as physical topology evidence; D3-BR is not on that alignment; B1 and T0 remain distinct.

## Field corrections and history

- **BASE-WC-03:** active **T2 -> T3 = 1685 mm**, authoritative field recheck. Superseded **690 mm** is retained only as an erroneous inactive value in the evidence history.
- **SUP-071:** active **B2 / D5-BR -> B4 = 2046 mm**, authoritative endpoint-and-value recheck. Superseded **B1 / D5-BR -> B4 = 2014 mm** is retained only in history.
- **SUP-080:** **2217 mm** from D3-BR to an unmarked B3-B4 wall-face landing. It is represented as the perpendicular landing on that segment at reduced weight.
- **SUP-081:** **3492 mm** from approximately halfway along T1-T2 to an unmarked B0-B4 wall-face landing. It is represented using an explicit 50% start and perpendicular landing at low weight. To promote it to a precise constraint, mark both laser spots or measure each spot's along-wall offset from a named corner.
- **BASE-B-07:** active **B4 -> B0 / D3-BL = 2200-2220 mm**, authoritative field recheck dated 2026-08-04. Superseded **2010-2030 mm** is retained only as an erroneous inactive range.
- **D5 Room B:** active **59 mm / 80 mm** longitudinal outer-casing offsets, approximately **80 mm / 97 mm** perpendicular reveal depths, **737 mm** visible closed face and one **761 mm** physical leaf. Earlier 63/65 mm and 81 mm endpoint readings are inactive history.
- **D5 WC:** active **63 mm from T0** and **81 mm from D5-WCL** to the fresh inner-casing/frame references. Earlier 83/52 mm readings remain inactive different-layer history.

## Distance-only versus soft-parallel fit

No exact parallelism or right angle is imposed. P1 adds the two human-confirmed wall-direction families with a strong **1.1 degree sigma**: Family A relates the D3-BR->B0.5 return to B0->B4; Family B includes D3, the exact B0.5->B1 / T0->T1 interrupted alignment, B4->B3 and T3->T2.

| Solution | Exact RMS | Room B RMS | WC RMS | Distance cost | Maximum family deviation | Total cost | Largest exact residual |
|---|---:|---:|---:|---:|---:|---:|---:|
| D0 distance-only | 1.472 mm | 1.638 mm | 1.318 mm | 3.006 | 34.95 deg | 3.006 | SUP-070 -3.08 mm |
| P1 soft parallel (selected) | 4.759 mm | 6.244 mm | 1.354 mm | 16.025 | 2.95 deg | 19.651 | SUP-069 -15.86 mm |

P1 is the accepted provisional Room B/WC baseline because human review judged it the best current combination of corrected distance evidence and photographed construction-line relationships. Its distance-only and soft-parallel costs remain reported rather than hidden. RMS is the unweighted RMS of active exact baseline, node, casing and cross-tie observations; approximate readings, ranges and general wall-face checks are excluded from the headline RMS.

## Effects of the corrected observations

| Quantity | Selected result |
|---|---:|
| Room B RMS | 6.244 mm |
| WC RMS | 1.354 mm |
| BASE-B-07 fit / active range residual | 2252.4 / +32.4 |
| BASE-WC-03 fit / residual | 1684.7 / -0.3 mm |
| SUP-071 fit / residual | 2050.9 / +4.9 mm |
| SUP-079 fit / residual | 3674.6 / +0.6 mm |
| Largest exact residual | SUP-069 -15.86 mm |
| D5 B1-to-T0 assembly gap | 120.7 mm |
| D5 opposite casing-face separation | 120.5 mm |

Largest active exact residuals:

| Observation | Fitted | Residual |
|---|---:|---:|
| SUP-069 | 2212.1 mm | -15.86 mm |
| SUP-065 | 881.3 mm | -6.67 mm |
| SUP-071 | 2050.9 mm | +4.87 mm |
| BASE-B-02 | 244.9 mm | -4.1 mm |
| D5-WC-CASING-WIDTH | 900.9 mm | +2.9 mm |

Largest deviations including approximate ranges and wall-face validations:

| Observation | Type | Fitted | Residual |
|---|---|---:|---:|
| SUP-080 | reduced-weight wall-face validation | 2296.5 mm | +79.47 mm |
| SUP-067 | range/approximate distance | 2813.2 mm | +48.18 mm |
| BASE-B-07 | range/approximate distance | 2252.4 mm | +32.41 mm |
| SUP-081 | reduced-weight wall-face validation | 3460 mm | -31.96 mm |
| SUP-073 | distance | 2001 mm | +31.05 mm |

Correcting BASE-WC-03 removes the artificial 1012 mm conflict created by the inactive 690 mm transcription. Correcting SUP-071 removes the former endpoint ambiguity and directly constrains B2/D5-BR to B4 at high confidence.

Correcting BASE-B-07 removes the former short B4-B0 range that pulled the shell inward. The selected two-family comparison and its effect on SUP-080 are shown below.

Relative to the previous selected reconstruction, SUP-080 changes from approximately **2297.3 mm (+80.3 mm)** to **2296.5 mm (+79.5 mm)**. This reduced-weight validation discrepancy remains substantial; it is not used as a construction-line constraint.

## Selected distance residuals

| Observation | Reading (mm) | Fitted (mm) | Residual/status | Confidence | Active |
|---|---:|---:|---:|---|---|
| BASE-B-02 | 249 | 244.9 | -4.1 mm | high | yes |
| BASE-B-03 | 823 | 823.4 | +0.42 mm | high | yes |
| D5-B-CASING-WIDTH | 874 | 875.7 | +1.66 mm | high | yes |
| BASE-B-05 | 1218 | 1217.1 | -0.91 mm | high | yes |
| BASE-B-06 | 1665 | 1663.5 | -1.54 mm | high | yes |
| BASE-B-07 | 2200-2220 | 2252.4 | +32.41 mm to interval | low | yes |
| SUP-065 | 888 | 881.3 | -6.67 mm | high | yes |
| SUP-066 | 1952 | 1967.3 | +15.28 mm | low | yes |
| SUP-067 | 2755-2765 | 2813.2 | +48.18 mm to interval | medium | yes |
| SUP-068 | 1182-1190 | 1166.3 | -15.74 mm to interval | medium | yes |
| SUP-069 | 2228 | 2212.1 | -15.86 mm | high | yes |
| SUP-070 | 2673 | 2670.2 | -2.85 mm | high | yes |
| SUP-071 | 2046 | 2050.9 | +4.87 mm | high | yes |
| BASE-WC-01 | 1643 | 1642.7 | -0.31 mm | high | yes |
| BASE-WC-02 | 1078 | 1077.6 | -0.35 mm | high | yes |
| BASE-WC-03 | 1685 | 1684.7 | -0.35 mm | high | yes |
| BASE-WC-04 | 173 | 172.9 | -0.09 mm | high | yes |
| D5-WC-CASING-WIDTH | 898 | 900.9 | +2.9 mm | high | yes |
| SUP-072 | 1959 | 1960.5 | +1.5 mm | high | yes |
| SUP-073 | 1970 | 2001 | +31.05 mm | low | yes |
| SUP-079 | 3674 | 3674.6 | +0.61 mm | high | yes |

## New wall-to-wall checks

| Check | Measured | Fitted | Residual | Modelled start | Derived landing | On segment |
|---|---:|---:|---:|---|---|---|
| SUP-080 | 2217 | 2296.5 | +79.5 | D3-BR | B3-B4 @ 49.9% | yes |
| SUP-081 | 3492 | 3460 | -32 | Assumed 50% point on T1-T2 | B0-B4 @ 28.6% | yes |

## Selected bearings and parallel differences

Bearings are in the solver gauge, clockwise from +X; only relative changes matter.

| Wall/face | D0 bearing | P1 bearing |
|---|---:|---:|
| D3 | 0 | 0 |
| D3Return | 60.96 | 92.43 |
| B05B1 | 5.35 | 0.1 |
| D5RoomBFace | 97.83 | 93.46 |
| B2B3 | 96.39 | 92.36 |
| B3B4 | 187.18 | 182.95 |
| B4B3 | 7.18 | 2.95 |
| B4B0 | 275.91 | 272.39 |
| B0B4 | 95.91 | 92.39 |
| T0T1 | 5.35 | 0.1 |
| T1T2 | 95.61 | 90.36 |
| T2T3 | 185.53 | 180.28 |
| T3T2 | 5.53 | 0.28 |
| T3D5WCL | 277.98 | 268.11 |

| Comparison | D0 | P1 |
|---|---:|---:|
| B0->D3-BR versus B0.5->B1 | 5.35 deg | 0.1 deg |
| B0->D3-BR versus B4->B3 | 7.18 deg | 2.95 deg |
| B0->D3-BR versus T0->T1 | 5.35 deg | 0.1 deg |
| B0->D3-BR versus T3->T2 | 5.53 deg | 0.28 deg |
| D3-BR->B0.5 versus B0->B4 | 34.95 deg | 0.03 deg |

## Coordinate movement from the previous selected reconstruction

The solver gauge fixes B0 at the origin and D3 along +X, so the movements below are in that common gauge.

| Node | Previous x,y | Corrected x,y | Delta x,y | Movement |
|---|---:|---:|---:|---:|
| B0 | 0, 0 | 0, 0 | +0, +0 | 0 |
| D3-BR | 885.08, 0 | 857.05, 0 | -28.03, +0 | 28.03 |
| B0.5 | 852.73, 245.55 | 846.68, 244.69 | -6.05, -0.86 | 6.11 |
| B1 | 1670.41, 343.8 | 1670.11, 246.05 | -0.3, -97.75 | 97.75 |
| B2 | 1527.68, 1207.46 | 1617.26, 1120.12 | +89.58, -87.34 | 125.11 |
| B3 | 1358.17, 2413.02 | 1567.24, 2336.18 | +209.07, -76.84 | 222.74 |
| B4 | -287.15, 2158.66 | -94.01, 2250.45 | +193.14, +91.79 | 213.85 |
| T0 | 1798.17, 359.15 | 1790.82, 246.26 | -7.35, -112.89 | 113.13 |
| T1 | 3429.11, 555.13 | 3433.51, 248.99 | +4.4, -306.14 | 306.18 |
| T2 | 3295.61, 1624.6 | 3426.78, 1326.61 | +131.17, -297.99 | 325.58 |
| T3 | 1623.61, 1418.45 | 1742.15, 1318.33 | +118.54, -100.12 | 155.16 |

## D3 and D5 physical layers

D3 ends at D3-BR. Its casing span is **857 mm**; the preserved 80/105 mm and 65/105 mm layers construct the authoritative **738 mm visible closed face** at derived depth **104.2 mm**. The full physical leaf width is not inferred. None of those object layers extends to B0.5. D3-BR is **244.7 mm** off the B0.5-B1/T0-T1 wall alignment.

The D5 model now contains exactly one physical blue leaf: **761 mm** long, centred at **(1732.39, 684.98)** with bearing **92.138 degrees** in the solver gauge.

The Room B casing fits **875.7 mm**. Its fresh 59 mm and 80 mm longitudinal frame offsets plus the 80 mm and 97 mm perpendicular reveal depths expose **736.9 mm** of the closed leaf, residual **-0.1 mm** against the approximate 737 mm observation. The remaining **24.1 mm** of the same leaf sits behind the two stops: derived **5 mm** at the B1 end and **19.1 mm** at the B2 end.

The WC casing fits **900.9 mm**. The shared leaf predicts **61.1 mm** from T0 and **79.1 mm** from D5-WCL, each residual **-1.9 mm** against the fresh 63 mm / 81 mm observations. WC perpendicular reveal depths are not directly measured; the shared geometry derives **40.6 mm** and **23.1 mm**.

B1-to-T0 remains a **120.7 mm assembly interruption**, not wall. The derived separation between the Room B and WC casing faces is **120.5 mm**.

## Coordinates

Coordinates use **B0 = (0,0)** and place **D3-BR** on solver +X as a gauge only.

| Node | x (mm) | y (mm) |
|---|---:|---:|
| B0 | 0 | 0 |
| D3-BR | 857.05 | 0 |
| B0.5 | 846.68 | 244.69 |
| B1 | 1670.11 | 246.05 |
| B2 | 1617.26 | 1120.12 |
| B3 | 1567.24 | 2336.18 |
| B4 | -94.01 | 2250.45 |
| T0 | 1790.82 | 246.26 |
| T1 | 3433.51 | 248.99 |
| T2 | 3426.78 | 1326.61 |
| T3 | 1742.15 | 1318.33 |
| D5-WCL | 1736.45 | 1145.51 |

## Visual and 3D readiness

The accepted provisional SVG follows the sketch and photographed arrangement: D3 ends at D3-BR and is nearly parallel to B4-B3, B0.5-B1, T0-T1 and T3-T2; the short return reaches and terminates at corner B0.5 nearly parallel to B0-B4; the wall then turns and runs to B1 before resuming from T0 to T1 after D5; and no wall line extends backward through D3-BR or across the D5 gap. D5 remains one shared physical door assembly.

The single-leaf D5 object reconciles the fresh field evidence without a material shell distortion. This geometry is now an **accepted provisional input** to the independent Room C reconstruction. Do not continue isolated Room B/WC optimisation. Any later adjustment should be driven by global D3 closure evidence when Room C is joined to Room B/WC; SUP-080 and SUP-081 remain validation-grade.

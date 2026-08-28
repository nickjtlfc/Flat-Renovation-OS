# Global reconciliation — A/C/B/WC D3 rigid registration diagnostic v0.2

Status: **GLOBAL RECONCILIATION — A/C/B/WC D3 RIGID REGISTRATION DIAGNOSTIC** for human review. This is not a final whole-flat model.

The corrected A/C v0.2 frame is frozen. Room B/WC uses its human-accepted provisional P1 geometry and receives one rigid transform only. No A, C, B or WC node is individually moved; there is no scale or deformation.

## Composition correction from v0.1

The v0.1 global renderer loaded the complete accepted Room C object-node register, including CP1 and CP2, but its SVG composition emitted only selected shell, partition, door and window layers. The cupboard groups were therefore omitted at export time; no Room C geometry or transform was missing.

v0.2 requires the accepted cupboard nodes and restores the fixed **CP1 / source-plan C1** and **CP2 / source-plan C2** body outlines. It also restores CP2's separate viewer-left casing/joinery strip, the accepted front/door reference lines and the approximate top-casing line. These are copied in the fixed Room C frame; no coordinate is recalculated.


## Registration method

Opposite doorway faces reverse viewer-left/right: Room B `B0 / D3-BL` corresponds to the Room C outer-right side, while `D3-BR` corresponds to the Room C outer-left/corner side. The transform aligns the **Room B visible closed D3 face centre and axis** to the **Room C D3 leaf centre and axis**. It deliberately does not force the two outer casing endpoint pairs together.

Both accepted models use the project drawing gauge (+X right, +Y down). The source plans were used only to confirm adjacency, handedness, Room B projecting down, the WC below/right of the junction and D4→D3→D2 ordering. No plan length, angle or proportion was fitted.

| Quantity | Result |
|---|---:|
| Room C D3 axis, outer R → outer L | 0.000000° |
| Room B D3 axis, B0/D3-BL → D3-BR | 0.000000° |
| Angular difference before registration | 0.000000° |
| Rotation applied to Room B/WC | 0.000000° |
| Translation applied to Room B/WC | X 3307.3200 mm; Y 104.2000 mm |
| Transform determinant / scale | 1.0000000000 / 1.000000 |
| Room B outer casing span | 857.05 mm |
| Room C outer casing span | 885.00 mm |
| Casing-width difference, B minus C | -27.95 mm |
| Room B visible closed face / Room C leaf | 738 / 760 mm |
| Shared leaf centre mismatch after placement | 0.00 mm |
| Shared leaf endpoint offsets | 11.00 / 11.00 mm |
| Derived C-face to B-face separation | 104.20 mm |

## D3 mismatch diagnosis

There is **no rotation mismatch**: both accepted D3 axes are 0° in their local drawing gauges, so Room B/WC requires 0° rotation. Translation registers the shared leaf centre exactly.

The outer casing spans differ by -27.95 mm. After leaf-centre alignment, the Room B casing centre is +10.01 mm along D3 from the Room C casing centre and +104.20 mm toward Room B. Endpoint vectors are:

- `B0 / D3-BL` relative to Room C `D3-OUTER-R`: +23.98, +104.20 mm; 106.92 mm total.
- `D3-BR` relative to Room C `D3-OUTER-L-CORNER`: -3.97, +104.20 mm; 104.28 mm total.

The 104.20 mm normal separation is derived from Room B's accepted casing-to-visible-face construction after the shared leaf is aligned. It is **not an independently measured D3 wall thickness**, because Room C's exact D3 reveal and opposing-face depth remain unmeasured. The dominant mismatch is therefore opposite-face/casing depth plus outer-casing width—not translation failure, rotation failure or a collapsed Room B topology.

## Return and wall-family comparison

| Segment | Bearing | Adjacent Room C family | Difference |
|---|---:|---:|---:|
| `D3-BR → B0.5` | 92.426752° | shared wall toward B 90.853535° | 1.573217° |
| `B0.5 → B1` | 0.094631° | lower wall 0.000000° | 0.094631° |

The real 244.91 mm return remains intact. `D3-BR` and `B0.5` remain separate nodes, and `B0.5 → B1` remains a separate wall run.

## Thick A–C wall interpretation

The rigid placement **plausibly supports** the hypothesis, but does not prove it. The return starts about 2.42 mm and ends about 9.14 mm from the extrapolated Room C face. Its direction differs from that wall family by only 1.57°. The `B0.5 → B1` wall crosses the extrapolated Room A face after 259.15 mm; the two extrapolated A/C faces are 250.01 mm apart there, consistent with the independent approximately 250 mm D2 depth.

This suggests a credible arrangement in which the thick A–C wall continues past D2 toward D3, then terminates/returns near `D3-BR → B0.5`. The gold SVG overlay is a **diagnostic extrapolation only**, not newly accepted wall geometry. Exact construction cannot be established without D3 opposing-face/reveal measurements.

## Wider topology and conclusion

Room B projects downward from D3. The WC falls below and to the right of the A–C junction, with D4→D3→D2 ordering preserved. No incorrect A/C/B shell overlap or unexplained large gap is introduced by the shared-leaf registration.

Classification: **compatible with explainable opposite-face/casing differences**.

No local Room B correction is indicated by this rigid test. If tighter closure is needed, the minimum real-world check is perpendicular finished-face-to-finished-face depth through D3 at both jambs, plus along-wall offsets from `D3-BR` and `B0.5` to the Room A-side face/return. A square-on photograph showing those nodes and adjoining wall planes would resolve the construction interpretation.

Composition confirmation: **CP1/C1 is present; CP2/C2 is present; all A/C/B/WC transforms, D2 registration and D3 registration are unchanged from v0.1. No geometry was re-solved.**

Stop here for human review. Do not deform the global network or adjust D3 nodes.

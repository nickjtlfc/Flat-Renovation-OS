# Whole-flat human architecturally constrained reconciliation v0.3

**Status: HUMAN REVIEW REQUIRED. Candidate only; not a final shell or construction model.**

This successor takes `ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2` as a fixed local model and rigidly registers it into the unchanged Room A/Room C v0.2 frame through D3. It does not hand-edit a predecessor SVG and does not deform any room during global placement.

## Fixed and changed scope

- Room A geometry and placement: unchanged, maximum movement 0 mm.
- Room C geometry, cupboards CP1/C1 and CP2/C2, and placement: unchanged, maximum movement 0 mm.
- D2 registration: unchanged.
- Room B/WC: corrected local v0.2 candidate, then transformed as one rigid group.
- D3 topology: unchanged; D3-BR to B0.5 remains a real separate return.

## D3 rigid registration

| Check | Result |
|---|---:|
| Corrected Room B D3 axis | 0.000000° |
| Fixed Room C D3 axis | 0.000000° |
| Required rotation | 0.000000° |
| Required translation | 3309.78, 103.86 mm |
| Scale / reflection | 1 / none |
| Shared leaf-centre mismatch | 0.00 mm |
| Derived opposing-face separation | 103.86 mm |
| Room B / Room C outer casing | 852.12 / 885.00 mm |
| Room B visible face / Room C leaf | 738.00 / 760.00 mm |

The shared centre and axis register exactly. The 738 mm Room B visible face is centred on the 760 mm Room C leaf reference, leaving 11 mm at each leaf end. Outer casing spans differ by 32.88 mm and are deliberately not forced together. The 103.86 mm normal separation is derived from Room B's casing/face construction; it is not a measured D3 wall thickness.

Resulting `B0.5`: **(4161.90, 239.86) mm** in the fixed global gauge.

## Thick A-C wall continuation reassessment

**not supported by the corrected return alone; remains unresolved pending opposing-face/reveal measurements.**

The corrected 136.00 mm return is still approximately parallel to the extrapolated Room C face family (0.85° difference). The extrapolated face band remains about 250.01 mm and B0.5 reaches the extrapolated Room A face after about 252.88 mm. Those are diagnostic extrapolations only. Because the old 244.9 mm return was materially used to argue for a termination near that wall construction, the corrected 136.0 mm span removes that part of the support. Exact D3 opposing-face/reveal measurements are still required.

## Global validations

| Span | Measured | v0.2 model | v0.2 residual | v0.3 model | v0.3 residual |
|---|---:|---:|---:|---:|---:|
| Far Room A wall through D2 to opposite Room C wall | 9019 | 8957.14 | -61.86 | 8957.14 | -61.86 |
| Room C partition outer face through D3 to Room B back wall | 3726 | 3741.07 | 15.07 | 3684.59 | -41.41 |

The 9019 mm A/C check is unchanged. The corrected 3726 model is 41.41 mm short, versus 15.07 mm long previously; absolute agreement is worse. This check is retained as an independent diagnostic and was not fitted. It is the principal global ambiguity for human review, alongside the unmeasured D3 opposing-face/reveal depth.

## Conclusion

The corrected local Room B shape remains exactly orthogonal and the D3 rigid registration is geometrically valid: rotation 0°, leaf-centre mismatch 0 mm and rigid pairwise deformation below 0 mm. No A/C node moved, D2 did not change, and no global solve was performed.

**HUMAN REVIEW REQUIRED**

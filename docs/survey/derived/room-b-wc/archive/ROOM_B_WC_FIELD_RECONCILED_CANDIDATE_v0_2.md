# Room B/WC field-reconciled candidate v0.2

**Status: HUMAN REVIEW REQUIRED. Derived working geometry only; not final shell or construction information.**

Generated deterministically by `scripts/solve_room_b_wc_field_reconciled_candidate_v0_2.mjs`. The accepted/provisional v0.1 pilot and raw evidence are preserved.

## Evidence reconciliation

| Relationship | Previous value | New field value | Difference | Same physical endpoints? | Proposed status |
|---|---:|---:|---:|---|---|
| D3-BR -> B0.5 | 249 mm (P1 model 244.9) | 136 mm | -113 mm vs record | Yes: same annotated casing edge and B0.5 corner | New active; 249 inactive/superseded |
| B0 / D3-BL -> B4 | 2200-2220 mm active range; older 2010-2030 inactive | 2216 mm | Within active range | Yes | New active exact refinement; history retained |
| B1 / D5-BL -> B3 | No direct record; 874 + 1218 = 2092 mm chain | 2091 mm | -1 mm vs chain | Yes | New active |
| B0.5 -> perpendicular B3-B4 landing | No same-start direct record | 2080 mm | n/a | New explicitly described landing | New active; SUP-080 remains separate |
| B2 / D5-BR -> B3 | 1218 mm | 1219 mm | +1 mm | Yes | New active; 1218 retained as consistent history |

The original 249 mm record is `BASE-B-02`. Its annotated evidence and `ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg` identify the same physical D3-BR casing edge and B0.5 permanent corner as the 136 mm recheck. No reveal, casing, tile-face or wall-plane layer distinction accounts for 113 mm. It is therefore retained but inactive and superseded.

The new 2091 mm B1-to-B3 reading and 2080 mm perpendicular B0.5 depth differ by 11 mm, directly supporting the observed near-orthogonal main shell. The new 1219 mm B2-to-B3 reading confirms the prior 1218 mm record to 1 mm.

## Solver and geometry

The candidate fixes the verified return at 136 mm and robustly fits three remaining parameters under exact orthogonal Room B topology: D3 outer casing 852.1206 mm, main width 1670.0625 mm, and main depth 2085.1172 mm. D5 and the human-approved simple WC are copied as one rigid assembly from P1 and attached at B1; the WC is not re-solved.

- D3-BR to B0.5: 244.91 mm before; 136 mm after.
- B0.5 to B1: bearing 0 degrees.
- B0 to B4: bearing 90 degrees.
- B1/B2/B3 wall family: bearing 90 degrees and collinear.
- B4 to B3: bearing 0 degrees.
- Main wall corner angles: 90 degrees.
- D3/top/back parallel difference: 0 degrees; return/side parallel difference: 0 degrees.

## Observation residuals

| ID | Relationship | Field mm | Model mm | Residual mm |
|---|---|---:|---:|---:|
| FIELD-B-D3-RETURN-2026-08 | D3-BR -> B0.5 | 136 | 136 | 0 |
| BASE-B-03 | B0.5 -> B1 | 823 | 817.942 | -5.058 |
| D5-B-CASING-WIDTH | B1 -> B2 | 874 | 875.666 | 1.666 |
| FIELD-B-B2-B3-2026-08 | B2 -> B3 | 1219 | 1209.451 | -9.549 |
| BASE-B-06 | B3 -> B4 | 1665 | 1670.063 | 5.063 |
| FIELD-B-B0-B4-2026-08 | B0 / D3-BL -> B4 | 2216 | 2221.117 | 5.117 |
| SUP-065 | B0 -> B0.5 | 888 | 862.906 | -25.094 |
| SUP-066 | B0 -> B2 | 1952 | 1952.583 | 0.583 |
| SUP-067 | B0 -> B3 | 2755-2765 | 2778.933 | 13.933 |
| SUP-068 | B0.5 -> B2 | 1182-1190 | 1198.257 | 8.257 |
| SUP-069 | B0.5 -> B3 | 2228 | 2239.808 | 11.808 |
| SUP-070 | B1 -> B4 | 2673 | 2671.483 | -1.517 |
| SUP-071 | B2 -> B4 | 2046 | 2062.009 | 16.009 |
| FIELD-B-B1-B3-2026-08 | B1 / D5-BL -> B3 | 2091 | 2085.117 | -5.883 |
| FIELD-B-B05-BACK-PERP-2026-08 | B0.5 -> perpendicular B3-B4 landing | 2080 | 2085.117 | 5.117 |
| SUP-080 | D3-BR -> perpendicular B3-B4 landing | 2217 | 2221.117 | 4.117 |
| SUP-079 | B0 -> T2 | 3674 | 3660.639 | -13.361 |

Room B principal-observation RMS is **47.326 mm before** and **10.246 mm after** against the corrected evidence set. WC RMS remains **1.354 mm before and after** because the accepted WC/D5 assembly is rigidly preserved.

## Node movement from P1 local gauge

| Node | dx mm | dy mm | magnitude mm |
|---|---:|---:|---:|
| B0 | 0 | 0 | 0 |
| D3-BR | -4.929 | 0 | 4.929 |
| B0.5 | 5.441 | -108.69 | 108.826 |
| B1 | -0.047 | -110.05 | 110.05 |
| B2 | 52.803 | -108.454 | 120.625 |
| B3 | 102.823 | -115.063 | 154.312 |
| B4 | 94.01 | -29.333 | 98.48 |
| T0 | -0.254 | -117.336 | 117.336 |
| T1 | -3.084 | -216.484 | 216.506 |
| T2 | 61.967 | -218.042 | 226.676 |
| T3 | 64.538 | -116.353 | 133.053 |
| D5-WCL | 54.118 | -115.694 | 127.726 |

Maximum movement is **226.676 mm at T2**; RMS across all listed nodes is **134.809 mm**. These are coordinate changes in the fixed B0/D3 gauge caused by replacing the verified same-span return by a value 109-113 mm shorter and closing the corrected orthogonal network. They are not unexplained forced movements.

## Architectural assessment

**Yes:** the corrected field evidence produces the simple orthogonal Room B geometry observed in reality. No principal fitted dimension departs from the new field checks by a large artificial displacement. The former 100+ mm problem follows the superseded return interpretation.

The drawing remains schematic/not to scale. This candidate is not promoted automatically.

# Room B/WC field-reconciled rectangular-WC candidate v0.3

**Status: preferred local candidate — HUMAN REVIEW REQUIRED.**

Room B is copied unchanged from `ROOM_B_WC_FIELD_RECONCILED_CANDIDATE_v0_2`. The 136 mm D3 return and every corrected Room B node remain locked. This successor only creates an explicit human-validated rectangular WC working layer.

## WC architecture

The permanent WC wall families are `T0→T1` / `T3→T2` and `T1→T2` / `T0→T3`. The WC-side D5 casing `T0→D5-WCL` interrupts the left family; `D5-WCL→T3` is the remaining permanent wall on the same straight datum. No wall is drawn across D5.

Working rectangle: **1662.69 × 1074.80 mm**. All four principal corners are 90°, opposite walls are parallel, and the D5-WCL kink is 0.000000°. The D5 shared leaf and Room B face are unchanged.

## Retained measurement conflict

The measured opposing widths remain 1643 and 1685 mm, a 42 mm conflict. The rectangle does not rewrite either observation; its equal working widths are 1662.69 mm.

| Observation | Measured | Before model | Before residual | After model | After residual |
|---|---:|---:|---:|---:|---:|
| BASE-WC-01 | 1643 | 1642.692 | -0.308 | 1662.688 | 19.688 |
| BASE-WC-02 | 1078 | 1077.641 | -0.359 | 1074.801 | -3.199 |
| BASE-WC-03 | 1685 | 1684.651 | -0.349 | 1662.688 | -22.312 |
| BASE-WC-04 | 173 | 172.914 | -0.086 | 173.909 | 0.909 |
| D5-WC-CASING-WIDTH | 898 | 900.892 | 2.892 | 900.892 | 2.892 |
| SUP-072 | 1959 | 1960.49 | 1.49 | 1979.83 | 20.83 |
| SUP-073 | 1970 | 2001.047 | 31.047 | 1979.83 | 9.83 |
| SUP-079 | 3674 | 3660.639 | -13.361 | 3657.038 | -16.962 |

Direct/casing WC RMS changes from **1.32 to 13.45 mm**. RMS over all eight listed WC/cross-tie observations changes from **12.01 to 14.68 mm**. Weighted chi-square changes from 2.42 to 65.22. This fit penalty is the explicit cost of representing the human-observed rectangle despite conflicting raw widths.

## WC node movement

| Node | dx mm | dy mm | magnitude mm |
|---|---:|---:|---:|
| T0 | 0.001 | 0 | 0.001 |
| T1 | 22.829 | 96.418 | 99.084 |
| T2 | -35.492 | 95.157 | 101.561 |
| T3 | -16.121 | 1.748 | 16.215 |
| D5-WCL | -0.001 | 0 | 0.001 |

Maximum movement is **101.56 mm at T2**; WC-node RMS movement is **63.87 mm**. T1/T2 movements rotate the measured parallelogram onto the D5 casing datum. They are explained architectural cleanup movements. Room B, D3, Room A, Room C and D2 movement are all 0 mm.

No source evidence is deleted, and no 3D or final-shell promotion occurs here.

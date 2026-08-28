# Whole-flat architecturally constrained reconciliation v0.1

**Status: PROVISIONAL WHOLE-FLAT ARCHITECTURALLY CONSTRAINED RECONCILIATION — HUMAN REVIEW REQUIRED.**

This candidate starts from the committed `ROOM_A_C_B_WC_D3_RIGID_REGISTRATION_DIAGNOSTIC_v0_2`. Room C, D2 and D3 are fixed. Only the specifically approved A1, Room B and WC relationships are constrained; no accepted local baseline is overwritten and no unconstrained whole-flat regularisation is performed.

Inspect the clean SVG first. The companion diagnostic SVG overlays the rigid baseline in grey and shows movement vectors in red.

## Constraint interpretation

- **A1/A2 chimney return:** the constrained corner is at `A1`; its adjacent sides are `A0→A1` and the `A1→A2` return. `A2→A3` is the following chimney-front wall, not the other side of the A1 corner.
- **B3-side straight family:** `B3→B2` is permanent wall. The underlying plane reaches `B1`, but D5 interrupts it between `B2` and `B1`. The nodes `B3–B2–B1` are collinear, while the SVG retains `B1→B2` as an opening/casing rather than wall.
- **B4→B3 square:** the adjoining family is the constrained `B3→B2` line.
- **WC:** `T3→D5-WCL` is wall and `D5-WCL→T0` is WC-side D5 casing/opening on the same straight wall line. `T0–T1–T2–T3` is constrained rectangular without changing D5 topology.
- **D3:** `D3-BR→B0.5` is unchanged. The doorway's axes and leaf centres were already coherent; the successor rendering restores the omitted stepped Room B casing/reveal connectors so the separate faces read as one assembly.

## Required before/after summary

| Area | Original condition | Constrained condition | Max node movement | Measurement consequence |
|---|---|---|---:|---|
| A1/A2 chimney return | A0–A1–A2 88.123° | 90.000° | 9.16 mm | Room A exact-distance RMS 5.10 → 5.30 mm |
| D3 area | Shared leaf centred, but stepped casing/reveal connectors omitted visually | One coherent leaf plane with separate C/B casing and reveal layers | 0.00 mm | No measurement or registration change |
| B4→B3 | angle to B3→B2 89.401° | 90.000° | 7.95 mm across adjusted B nodes | Room B exact-distance RMS 5.94 → 9.94 mm |
| B3-side wall family | B1–B2–B3 line break 1.105° | collinear; D5 remains an opening | 7.95 mm | largest changed B/WC observations listed below |
| WC T3/D5-WCL | casing-line kink 5.349°; opposing widths differ 42 mm | straight wall/casing line and exact rectangular family | 23.57 mm | WC exact-distance RMS 1.32 → 13.46 mm; material local tradeoff |

## Movement

| Room | Node | ΔX mm | ΔY mm | Movement mm |
|---|---|---:|---:|---:|
| A | `A1` | -9.16 | +0.06 | 9.16 |
| B | `B2` | +6.24 | +1.41 | 6.40 |
| B | `B3` | -7.94 | +0.43 | 7.95 |
| B | `B4` | -2.81 | -1.34 | 3.11 |
| B | `B1` | -0.42 | +1.35 | 1.41 |
| WC | `T0` | -22.85 | -5.78 | 23.57 |
| WC | `T1` | -2.81 | +9.36 | 9.77 |
| WC | `D5-WCL` | +21.84 | -4.65 | 22.33 |
| WC | `T2` | -7.62 | +5.88 | 9.62 |
| WC | `T3` | +14.27 | -3.71 | 14.75 |

Maximum displacement is **23.57 mm at WC:T0**. RMS displacement across the 10 moved nodes is **12.88 mm**. Every unlisted node remains fixed.

The Room B adjustments remain below 8 mm. The larger WC movement is localized and explained by the direct 42 mm conflict between its measured opposing widths.

## Measurement consequences

Headline comparison uses an unweighted RMS over 58 comparable direct exact-endpoint distance observations: the accepted Room A S3 exact set plus Room B/WC direct value observations, excluding approximate and cross-tie classes. This is a transparent cross-room diagnostic rather than a replacement for the source solvers' room-specific robust costs.

| Metric | Before | After |
|---|---:|---:|
| Total comparable measurement RMS | 5.05 mm | 7.31 mm |
| Room A RMS | 5.10 mm | 5.30 mm |
| Room B RMS | 5.94 mm | 9.94 mm |
| WC RMS | 1.32 mm | 13.46 mm |
| Worst individual residual | `SUP-069` -15.87 mm | `BASE-WC-03` -22.17 mm |

Largest changed Room B/WC observation residuals:

| Observation | Before mm | After mm | Change mm |
|---|---:|---:|---:|
| `BASE-WC-03` | -0.35 | -22.17 | -21.82 |
| `SUP-073` | +31.05 | +9.62 | -21.42 |
| `BASE-WC-01` | -0.31 | +19.83 | +20.14 |
| `SUP-072` | +1.49 | +20.62 | +19.13 |
| `SUP-071` | +4.88 | +10.92 | +6.05 |
| `SUP-066` | +15.28 | +21.21 | +5.93 |
| `SUP-068` | -15.74 | -10.55 | +5.19 |
| `BASE-B-06` | -1.54 | -6.58 | -5.04 |
| `SUP-079` | +0.60 | -4.37 | -4.98 |
| `SUP-067` | +48.18 | +44.12 | -4.06 |
| `BASE-WC-02` | -0.36 | -3.80 | -3.44 |
| `SUP-069` | -15.87 | -18.03 | -2.17 |

The two Room A observations directly involving A1 change as follows: `BASE-A-01` -3.23 → -12.38 mm; `BASE-A-02` -2.58 → -3.03 mm; `SUP-039` +7.54 → +3.30 mm; `SUP-040` -1.50 → -4.37 mm; `SUP-039-R1` +5.54 → +1.30 mm.

## WC conflict and alternatives

An exact rectangle requires `T0→T1` and `T3→T2` to have equal length. Their direct field readings are **1643 mm** and **1685 mm**, a **42 mm disagreement**. The constrained candidate uses a common width of **1662.83 mm**, leaving an approximately 20–22 mm residual on each opposing width and requiring up to 23.57 mm WC node movement.

This is the principal human-review gate. The minimum-change alternative—not applied—would only project `D5-WCL` onto the existing `T3–T0` line, moving it approximately **13.53 mm**. That removes the visible casing-line kink but retains the non-rectangular 42 mm width difference, so it does not satisfy the requested rectangular WC condition.

## Independent global validation

| Validation | Measured | Exact model before | Residual before | Exact model after | Residual after |
|---|---:|---:|---:|---:|---:|
| Far A wall through D2 to opposite C wall | 9019 | 8957.14 | -61.86 | 8957.14 | -61.86 |
| C stud outer face through D3 to B back wall | 3726 | 3741.61 | +15.61 | 3741.07 | +15.07 |

The prompt's 8965 mm first model value was explicitly approximate. Using the recorded geometry definition—a D2-normal line through the A-face opening centre intersecting `A5–A6` and `C0–CP1-FL`—the exact rigid-baseline value is 8957.14 mm. It remains unchanged because neither defining wall nor D2 moved. The second exact baseline reproduces the stated approximately 3742 mm value and improves by 0.54 mm.

## Composition corrections

- **D3:** the previous global composition showed outer casing/leaf layers but omitted the accepted Room B inner casing and 105 mm reveal connectors. Those fixed layers are now drawn separately. No D3 point moved.
- **D2 Room A casing:** the source A/C v0.2 record already contains the measured Room A outer-casing segment and clear-opening segment. The A/C/B/WC v0.2 exporter omitted them; they were not absent or merely overdrawn. Both are restored without changing D2 geometry.

## Preservation and status

Room C maximum movement is **0.00 mm**. D2 registration, D3 registration, the `D3-BR→B0.5` return endpoints, Room C cupboards, global scale and every accepted individual-room baseline are unchanged.

This is a constrained candidate for human review, not construction-locked geometry. Stop here; do not begin 3D modelling.

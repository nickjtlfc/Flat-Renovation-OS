# Room C accepted provisional baseline v1.0

**Status: PROVISIONALLY ACCEPTED FOR GLOBAL RECONCILIATION.**

This is the consolidated Room C digital-twin baseline produced from the preserved v0.1–v0.4 lineage. It is not a new solve, construction-locked geometry, survey-grade certification or final whole-flat geometry. Later shared D2/D3 closure evidence may justify small, explicitly reported adjustments.

## Geometry

- Selected shell: **A1**, copied without re-optimisation.
- Wall-family angle: **90.8536°**.
- Major permanent-envelope runs: C0 → D3-CL **4168.34 mm**; C0 → CP1-FL **3691.32 mm**.
- Indicative envelope area excluding cupboard rear depths: **15.385 m²**; this is not a certified floor area.
- Shell, PO/PI and object plan-node movement during consolidation: **0.00 mm**.

D3-CL remains the permanent turning corner. D2-CR remains a point **580 mm** along the adjoining wall and is not a corner. The obsolete straight-continuation interpretation is correction history only.

The current removable bedroom wall remains a thick L-shaped polygon with distinct outer face PO1–PO2–PO3 and inner face PI1–PI2–PI3. Outer runs are **2331.56 mm** and **2617.64 mm**; inner runs are **2202.00 mm** and **2494.00 mm**. Derived face separations are **123.64 mm** and **129.56 mm** and are not uniform-thickness survey claims.

## Measurement fit

Residual convention is **model minus measurement**. Acceptance is based on topology, residual patterns, corrected evidence and independent checks—not RMS alone.

| Observation | Relationship | Measured mm | Model mm | Residual mm |
|---|---|---:|---:|---:|
| RC-01 | D3-CL → C0 | 4185.00 | 4168.34 | -16.66 |
| RC-02 | C0 → CP1-FL | 3705.00 | 3691.32 | -13.68 |
| RC-03 | CP1-FL → PO1 | 1534.00 | 1550.70 | +16.70 |
| RC-05 | PO1 → PO2 | 2318.00 | 2331.56 | +13.56 |
| RC-06 | PO2 → PO3 | 2601.00 | 2617.64 | +16.64 |
| RC-07 | PO3 → D3-CL | 1346.00 | 1359.76 | +13.76 |
| RC-08 | D3-CL → D2-CR | 580.00 | 580.00 | +0.00 |

The non-zero direct shell residuals remain distributed at approximately 14–17 mm across the two known closure groups. Approximate supporting checks remain RC-15 **+20.85 mm**, RC-16 **−22.40 mm**, and RC-17 **+3.71 mm**.

Corrected RC-19 is **CP2-FR → PI3 = 2206 mm**. The model gives **2202.00 mm**, residual **−4.00 mm**. The old CP2-FL definition and approximately +111 mm conflict are superseded history, not an active concern.

The object-layer D3/D4 casing gap is **216.34 mm** against measured **218 mm**, residual **−1.66 mm**.

### Independent validation-only observations

These measurements were not used as fitting constraints.

| ID | Physical mm | Model mm | Residual mm | Surfaces |
|---|---:|---:|---:|---|
| VALID-RC-01 | 3668.00 | 3690.92 | +22.92 | small permanent lower-wall section between D4 and D3 → opposing upper wall run between PI1 and CP2-FL |
| VALID-RC-02 | 4405.00 | 4403.74 | -1.26 | PO3 → C0 |
| VALID-RC-03 | 4399.00 | 4373.84 | -25.16 | W2/window face → rear/back face of CP1 body |

VALID-RC-02 is a particularly strong long closure check. VALID-RC-03 retains caution because the CP1/rear-wall surface is physically uneven. Together the checks differ from the model by no more than 25.16 mm or about 0.63%, supporting physical credibility without justifying a refit.

## Objects

- **D2:** approximately 250 mm through-wall reveal, 770 mm structural opening and 742 × 1975 mm leaf. Room C sees the deep reveal; the closing plane is on the Room A side and opens into Room A. Through-wall depth does not extend the Room C shell chain.
- **D3:** 760 × 1987 mm leaf; casing approximately 45/80/80 mm; opens into Room C; 544 mm casing-top-to-ceiling. D3-CL is the fixed permanent corner.
- **D4:** 760 × 1987 mm leaf; 80/80/80 mm casing; opens into Room C; 567 mm casing-top-to-ceiling.
- **W2:** 1269 mm width relationship and approximately 40 mm casing. Active vertical chain is approximately 1040 + 1516 + 75 = **2631 mm**. The old approximately 700 mm clearance is superseded.
- **CP1:** 1285 × 518 mm suspended body; floor-to-body-base 1315 mm; body height 1261 mm; separate top trim approximately 30–40 mm; services area below.
- **CP2:** 708 × 536 mm body; top-to-floor 2148 mm; top-to-ceiling approximately 450 mm; approximately 20 mm left casing and top continuation; removable door remains separate. No right-side allocation is invented.

Unmeasured object detail remains explicit: exact D2 casing/rebate and hinge side; D3/D4 hinge and structural-reveal detail; CP1/CP2 joinery detail; and W2 frame/reveal detail. These are distinct from the primary Room C shell.

## Vertical geometry

Station-specific floor-to-ceiling readings remain separate: D3 **2598 mm**, D4 **2631 mm**, CP1 **2596 mm**, CP2 **2594 mm**, and PO2 **2616 mm**. The range is **37 mm** and no universal room height is inferred.

CP1's 1261 mm value is body height, not ceiling clearance; its 30–40 mm top trim is separate. W2's corrected chain totals approximately 2631 mm and lies within the local height range. None of the vertical evidence affects plan geometry.

## Evidence status and confidence

Direct and approximate measurements, architectural/topology constraints, inferred object placements, validation-only checks and superseded/corrected records remain distinctly classified in the JSON. All v0.1–v0.4 artefacts and generators are retained with SHA-256 provenance hashes.

Room C is suitable to enter global reconciliation because the corrected topology is stable, all later corrections preserved the A1 shell, RC-19 is resolved, the D3/D4 local check is strong, and three independent validations agree within approximately 26 mm. It is not professionally surveyed or construction-certified.

Material interface ambiguity for later global closure remains concentrated at D2 and D3: exact D2 Room A/Room C face registration and casing/rebate offsets; approximate 250 mm wall depth; and D3 structural-opening/reveal detail with approximate casing widths. Any global adjustment must preserve D3-CL as the corner and report coordinate/residual changes.

Stop here for human review. Do not start global reconciliation or merge branches.

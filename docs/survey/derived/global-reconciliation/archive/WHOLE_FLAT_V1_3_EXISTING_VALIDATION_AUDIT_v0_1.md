# Whole-flat v1.3 existing-validation audit v0.1

**Status: VALIDATION REVIEW REQUIRED.**

This is a read-only evidence audit of `WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3`. The v1.3 geometry, room placements, cupboards, D1–D5, D2/D3 registrations and transforms are unchanged. No solver ran and no geometry successor was created.

## Method and evidence boundary

Every sufficiently defined model distance below is recalculated from the frozen v1.3 coordinates. Euclidean node distances, perpendicular point-to-line distances, or line intersections are used as stated. Residual is **model minus measurement**: positive means the model is longer. Ranges are retained as ranges; the report does not promote their midpoint to an observation.

Room A SUP and repeat distances, the Room B v0.2 rechecks, and the WC v0.3 observations were used in their respective local fits/reconciliations. They are useful fit checks but are excluded from the independent scorecard. Superseded values are provenance only. Human architectural constraints are not mislabelled as measurements.

Review bands: **Excellent ≤0.5%; Good >0.5–1.0%; Review >1.0–1.5%; Investigate >1.5%.**

## Whole-flat validation scorecard

| Area | Number of active independent checks | Median absolute residual | Worst % residual | Systematic concern? | Assessment |
|---|---:|---:|---:|---|---|
| Room A | 0 (+37 fit/recheck) | — | — | No | Internal shape is strongly consistent with 37 fitted SUP/repeat distances; they cannot independently validate the later rigid global rotation. |
| Room C | 3 (+3 fit/recheck) | 1.66 | 0.76% | No | Independent shell/face checks are excellent-to-good; no Room C-wide scale pattern. |
| Room B | 0 (+13 fit/recheck) | — | — | No | Five active field rechecks fit closely; they were inputs to v0.2, so independent count remains zero. |
| WC | 0 (+9 fit/recheck) | — | — | Known 42 mm width conflict | Known 42 mm opposing-width conflict remains under the human rectangular constraint; no new inconsistency. |
| A↔C registration | 2 | 32.14 | 0.68% | No | Both long checks are good: 9019 span is 0.68% short and D4→A5 is within 3 mm of the range on the accepted object layer. |
| C↔B registration | 1 | 41.41 | 1.11% | Single conditional ray only | Single D3-normal check is in Review at 1.11%; exact physical ray bearing remains uncertain. |
| CP1/CP2 | 4 (+5 fit/recheck) | 32.93 | 18.09% | Yes — object endpoint/layer issue | Local object-layer concerns remain: known CP1 RC-04 conflict and coherent D4→CP2 model-long rays. |

The parenthetical counts are active fit/recheck observations excluded from the independent count. A zero therefore does not mean “no evidence”; it prevents fitted evidence from being presented as independent validation.

## Master validation table

| ID | From | To / target | Evidence type | Measured mm | Model v1.3 mm | Residual mm | Residual % | Status | Notes |
|---|---|---|---|---:|---:|---:|---:|---|---|
| GLOBAL-AC-9019 | Room C C0–CP1-FL wall face | Room A A5–A6 far wall through D2 | independent validation | 9019 | 8957.64 | -61.36 | -0.68% | Good / likely acceptable | Independent, non-fitted span. The v1.1 rigid Room A rotation changed this model distance by only +0.50 mm. |
| GLOBAL-CB-3726 | Room C PO2–PO3 outer partition face | Room B B3–B4 finished tile face through D3 | independent validation | 3726 | 3684.59 | -41.41 | -1.11% | Review | Conditional D3-normal interpretation; the physical ray bearing and endpoint stations were not permanently marked. |
| FIELD-D4CL-A5-2026-08 | D4-CL semantic target (v1.3 D4-OUTER-L object edge) | A5 | later field recheck | 7212–7236 | 7209.08 | -26.92 to -2.92 | -0.37% to -0.04% | Excellent — outside range | The literal inherited D4-CL node gives 7224.103 mm and lies inside the field range; the accepted object edge gives the prior approximately 7209 mm interpretation. This 18.33 mm node-layer split is documented, not resolved here. |
| FIELD-D4CL-CP2FR-2026-08 | D4-CL semantic target (v1.3 D4-OUTER-L object edge) | CP2 body front-right proxy (CP2-BODY-FR) | later field recheck | 3800–3814 | 3859.83 | +45.83 to +59.83 | +1.20% to +1.57% | Investigate — outside range | This pairing reproduces the prior approximately 3860 mm estimate. Literal inherited D4-CL→CP2-FR is 3873.334 mm. R5 CP2-FR is an outer-footprint reference, while the rendered body edge is separate; field endpoint layer needs confirmation. |
| FIELD-D4CL-CP2CR-2026-08 | D4-CL semantic target (v1.3 D4-OUTER-L object edge) | CP2 rear-right proxy (CP2-BODY-BR) | later field recheck | 4310–4330 | 4377.20 | +47.20 to +67.20 | +1.09% to +1.56% | Investigate — outside range (proxy endpoint) | CP2-CR is defined in the R5 register but is not instantiated in v1.3. CP2-BODY-BR is a body-layer proxy, not an asserted casing/footprint coincidence; excluded from scorecard statistics. |
| SUP-001 | A2 | A0 | active measured constraint | 1338 | 1333.55 | -4.45 | -0.33% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-002 | A2 | D2-AR | active measured constraint | 2696 | 2697.59 | +1.59 | +0.06% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-003 | A2 | A7 | active measured constraint | 4215 | 4211.62 | -3.38 | -0.08% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-004 | A2 | D1-AR | active measured constraint | 4287 | 4285.32 | -1.68 | -0.04% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-005 | A2 | A6 | active measured constraint | 5155 | 5151.56 | -3.44 | -0.07% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-006 | A2 | W1-AL | active measured constraint | 3430 | 3434.69 | +4.69 | +0.14% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-025 | A3 | A5 | active measured constraint | 1318 | 1311.51 | -6.49 | -0.49% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-026 | A3 | W1-AL | active measured constraint | 1721 | 1717.29 | -3.71 | -0.22% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-027 | A3 | A6 | active measured constraint | 4206 | 4204.43 | -1.57 | -0.04% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-028 | A3 | D1-AL | active measured constraint | 4082 | 4074.48 | -7.52 | -0.18% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-029 | A3 | D1-AR | active measured constraint | 4029 | 4026.89 | -2.11 | -0.05% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-030 | A3 | A7 | active measured constraint | 5157 | 5159.93 | +2.93 | +0.06% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-031 | A3 | D2-AR | active measured constraint | 4017 | 4021.42 | +4.42 | +0.11% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. approximate marked endpoint. |
| SUP-032 | A4 | W1-AL | active measured constraint | 1900 | 1908.29 | +8.29 | +0.44% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-033 | A4 | A6 | active measured constraint | 4458 | 4460.01 | +2.00 | +0.04% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-034 | A4 | D1-AL | active measured constraint | 4342 | 4336.98 | -5.02 | -0.12% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-035 | A0 | A2 | active measured constraint | 1333 | 1333.55 | +0.55 | +0.04% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-036 | A0 | W1-AL | active measured constraint | 4760 | 4761.87 | +1.87 | +0.04% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-037 | A0 | A6 | active measured constraint | 6251 | 6253.98 | +2.98 | +0.05% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-038 | A0 | D1-AR | active measured constraint | 5133 | 5145.16 | +12.16 | +0.24% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-039 | A1 | D2-AR | active measured constraint | 2945 | 2959.21 | +14.21 | +0.48% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-040 | A1 | A7 | active measured constraint | 4485 | 4492.79 | +7.79 | +0.17% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-041 | A5 | D1-AL | active measured constraint | 4298 | 4302.89 | +4.88 | +0.11% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-042 | A5 | A7 | active measured constraint | 6225 | 6232.33 | +7.33 | +0.12% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-043 | A5 | D2-AR | active measured constraint | 5237 | 5245.21 | +8.21 | +0.16% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-044 | W1-AR | D1-AL | active measured constraint | 1514 | 1522.09 | +8.09 | +0.53% | Good / likely acceptable | Supplementary Room A observation used in S3 fit; not statistically independent. |
| SUP-045 | W1-AR | A7 | active measured constraint | 4760 | 4758.54 | -1.46 | -0.03% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. approximate area represented by A7. |
| SUP-046 | A6 | D2-AR | active measured constraint | 4838 | 4827.23 | -10.77 | -0.22% | Excellent | Supplementary Room A observation used in S3 fit; not statistically independent. approximate area represented by D2-AR. |
| SUP-038-R1 | A0 | D1-AR | later field recheck | 5137 | 5145.16 | +8.16 | +0.16% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. |
| SUP-046-R1 | A6 | D2-AR | later field recheck | 4837 | 4827.23 | -9.77 | -0.20% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. approximate area represented by D2-AR. |
| SUP-032-R1 | A4 | W1-AL | later field recheck | 1901 | 1908.29 | +7.29 | +0.38% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. |
| SUP-039-R1 | A1 | D2-AR | later field recheck | 2947 | 2959.21 | +12.21 | +0.41% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. |
| SUP-044-R1 | W1-AR | D1-AL | later field recheck | 1517 | 1522.09 | +5.09 | +0.34% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. |
| SUP-025-R1 | A3 | A5 | later field recheck | 1318 | 1311.51 | -6.49 | -0.49% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. |
| SUP-001-R1 | A2 | A0 | later field recheck | 1338 | 1333.55 | -4.45 | -0.33% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. |
| SUP-028-R1 | A3 | D1-AL | later field recheck | 4077 | 4074.48 | -2.52 | -0.06% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. difficult repeat. |
| SUP-003-R1 | A2 | A7 | later field recheck | 4220 | 4211.62 | -8.38 | -0.20% | Excellent | 3 August 2026 repeat used in S3 fit; not statistically independent. |
| SUP-061 | W1-AR–A6 wall area | A7–D2-AL wall area | ambiguous/insufficiently documented | 4558 | 4539.2–4758.5 admissible | — | — | Compatible interval; not rated | Landing point is an area, not a marked node. The model range is the admissible point/segment distance interval; no midpoint or invented landing is used. |
| SUP-062 | W1-AL | D2-AR–A0 wall area | ambiguous/insufficiently documented | 4547 | 4539.3–4761.9 admissible | — | — | Compatible interval; not rated | Landing point is an area, not a marked node. The model range is the admissible point/segment distance interval; no midpoint or invented landing is used. |
| SUP-063 | A1 | D1-AR–A7 wall area | ambiguous/insufficiently documented | 4297 | 4287.0–4545.1 admissible | — | — | Compatible interval; not rated | Landing point is an area, not a marked node. The model range is the admissible point/segment distance interval; no midpoint or invented landing is used. |
| SUP-064 | D1-AL | A5–A6 wall area | ambiguous/insufficiently documented | 4268 | 527.1–4302.9 admissible | — | — | Compatible interval; not rated | Landing point is an area, not a marked node. The model range is the admissible point/segment distance interval; no midpoint or invented landing is used. |
| VALID-RC-01 | small permanent lower-wall section between D4 and D3 | opposing upper wall run between PI1 and CP2-FL | independent validation | 3668 | 3690.92 | +22.92 | +0.63% | Good / likely acceptable | credible cross-room validation; approximately 0.62% model-over-measurement difference |
| VALID-RC-02 | PO3 | C0 | independent validation | 4405 | 4403.74 | -1.26 | -0.03% | Excellent | strong independent long closure check; approximately 0.03% difference |
| VALID-RC-03 | W2/window face | rear/back face of CP1 body | independent validation | 4399 | 4373.84 | -25.16 | -0.57% | Good / likely acceptable | CP1/rear-wall area is physically uneven; retain surface-selection caution. |
| RC-15 | PO2 | CP1-FL | active measured constraint | 2760 | 2780.85 | +20.85 | +0.76% | Good / likely acceptable | Low-weight approximate cross-check used in the accepted Room C fit; not independent. |
| RC-16 | PO2 | C0 | active measured constraint | 2100 | 2077.60 | -22.40 | -1.07% | Review | Low-weight approximate cross-check used in the accepted Room C fit; not independent. |
| RC-17 | PO2 | D3-CL | active measured constraint | 2928 | 2931.72 | +3.72 | +0.13% | Excellent | Low-weight approximate cross-check used in the accepted Room C fit; not independent. |
| RC-19 | CP2-FR | PI3 | independent validation | 2206 | 2202.00 | -4.00 | -0.18% | Excellent | Corrected CP2-FR endpoint; retained outside the accepted shell fit. Earlier CP2-FL endpoint is superseded. |
| RC-18 | PI1 | CP2-FR | active measured constraint | 2494 | 2494.00 | +0.00 | +0.00% | Excellent | Direct CP2 relationship used in the accepted Room C fit; not independent validation. |
| RC-22 | CP2-FL | PI1 | active measured constraint | 1739 | 1739.00 | +0.00 | +0.00% | Excellent | Direct CP2 relationship used in the accepted Room C fit; not independent validation. |
| CP2-BODY-WIDTH | CP2-BODY-FL | CP2-BODY-FR | active measured constraint | 708 | 708.00 | +0.00 | +0.00% | Excellent | Direct body width; distinct from casing/outer-footprint span. |
| CP2-BODY-DEPTH | CP2-BODY-FL | CP2-BODY-BL | active measured constraint | 536 | 536.00 | +0.00 | +0.00% | Excellent | Direct body depth; the body follows the accepted slightly tapered Room C wall direction. |
| CP2-LEFT-CASING | CP2-CASING-FL | CP2-BODY-FL | active measured constraint | 20 | 20.00 | +0.00 | +0.00% | Excellent | Approximate casing observation; no right casing/gap dimension is invented. |
| OBJ-CHECK-CP1-RC04 | CP1-BODY-FR | PO1 | independent validation | 225 | 265.70 | +40.70 | +18.09% | Investigate | Known retained conflict created when the direct 1285 mm CP1 body width replaced the former provisional object station; shell unchanged. |
| OBJ-CHECK-D3-D4-RC09 | D3-OUTER-R | D4-OUTER-L | independent validation | 218 | 216.34 | -1.66 | -0.76% | Good / likely acceptable | validation only; shell unchanged |
| OBJ-CHECK-CP2-FOOTPRINT-BALANCE | CP2-FL/FR inherited footprint span | 708 body + approximately 20 left casing | ambiguous/insufficiently documented | 755 | 728.00 | -27.00 | -3.58% | Investigate | 27 mm remains unallocated; no explicit right casing, gap or CP2-CR coordinate exists in v1.3. |
| FIELD-B-D3-RETURN-2026-08 | D3-BR | B0.5 | later field recheck | 136 | 136.00 | +0.00 | +0.00% | Excellent | new exact field recheck; retained in the v0.2 Room B fit, so it is not statistically independent. |
| FIELD-B-B2-B3-2026-08 | B2 | B3 | later field recheck | 1219 | 1209.45 | -9.55 | -0.78% | Good / likely acceptable | new exact field recheck; retained in the v0.2 Room B fit, so it is not statistically independent. |
| FIELD-B-B0-B4-2026-08 | B0 | B4 | later field recheck | 2216 | 2221.12 | +5.12 | +0.23% | Excellent | new exact field recheck; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-065 | B0 | B0.5 | active measured constraint | 888 | 862.91 | -25.09 | -2.83% | Investigate | existing exact endpoint; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-066 | B0 | B2 | active measured constraint | 1952 | 1952.58 | +0.58 | +0.03% | Excellent | approximate difficult shot; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-067 | B0 | B3 | active measured constraint | 2755–2765 | 2778.93 | +13.93 to +23.93 | +0.50% to +0.87% | Good / likely acceptable — outside range | measured range; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-068 | B0.5 | B2 | active measured constraint | 1182–1190 | 1198.26 | +8.26 to +16.26 | +0.69% to +1.38% | Review — outside range | measured range; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-069 | B0.5 | B3 | active measured constraint | 2228 | 2239.81 | +11.81 | +0.53% | Good / likely acceptable | existing exact endpoint; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-070 | B1 | B4 | active measured constraint | 2673 | 2671.48 | -1.52 | -0.06% | Excellent | existing exact endpoint; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-071 | B2 | B4 | active measured constraint | 2046 | 2062.01 | +16.01 | +0.78% | Good / likely acceptable | existing exact endpoint; retained in the v0.2 Room B fit, so it is not statistically independent. |
| FIELD-B-B1-B3-2026-08 | B1 | B3 | later field recheck | 2091 | 2085.12 | -5.88 | -0.28% | Excellent | new exact field recheck; retained in the v0.2 Room B fit, so it is not statistically independent. |
| FIELD-B-B05-BACK-PERP-2026-08 | B0.5 | B3-B4 line | later field recheck | 2080 | 2085.12 | +5.12 | +0.25% | Excellent | new perpendicular field recheck; retained in the v0.2 Room B fit, so it is not statistically independent. |
| SUP-080 | D3-BR | B3-B4 line | active measured constraint | 2217 | 2221.12 | +4.12 | +0.19% | Excellent | existing validation-grade wall span; retained in the v0.2 Room B fit, so it is not statistically independent. |
| BASE-WC-01 | T0 | T1 | active measured constraint | 1643 | 1662.69 | +19.69 | +1.20% | Review | direct opposing width; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| BASE-WC-02 | T1 | T2 | active measured constraint | 1078 | 1074.80 | -3.20 | -0.30% | Excellent | direct side depth; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| BASE-WC-03 | T2 | T3 | active measured constraint | 1685 | 1662.69 | -22.31 | -1.32% | Review | direct opposing width; conflicts with BASE-WC-01 by 42 mm; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| BASE-WC-04 | T3 | D5-WCL | active measured constraint | 173 | 173.91 | +0.91 | +0.53% | Good / likely acceptable | direct permanent wall segment; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| D5-WC-CASING-WIDTH | D5-WCL | T0 | active measured constraint | 898 | 900.89 | +2.89 | +0.32% | Excellent | WC-side D5 object/casing layer; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| SUP-072 | T0 | T2 | active measured constraint | 1959 | 1979.83 | +20.83 | +1.06% | Review | diagonal cross-tie; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| SUP-073 | T1 | T3 | active measured constraint | 1970 | 1979.83 | +9.83 | +0.50% | Excellent | approximate diagonal; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| SUP-079 | B0 | T2 | active measured constraint | 3674 | 3657.04 | -16.96 | -0.46% | Excellent | Room B-to-WC cross-tie; retained in the v0.3 human-rectangular reconciliation and not statistically independent. |
| SUP-081 | Assumed midpoint of T1–T2 | Perpendicular landing on B0–B4 | supplementary/redundant check | 3492 | 3453.26 | -38.74 | -1.11% | Review | Low-weight broad wall-to-wall validation inherited from the earlier P1 fit. Neither physical endpoint was marked; excluded from independent statistics. |
| SUP-032-OLD | A4 | W1-AL | superseded/inactive observation | 900 | — | — | — | Superseded / excluded | Transcription corrected to active SUP-032 = 1900 mm. |
| BASE-B-02 | D3-BR | B0.5 | superseded/inactive observation | 249 | — | — | — | Superseded / excluded | Same-span field recheck gives 136 mm; no 113 mm layer offset is evidenced. |
| BASE-B-07-OLD | B4 | B0 / D3-BL | superseded/inactive observation | 2010–2030 | — | — | — | Superseded / excluded | Superseded first by approximately 2200–2220 mm and then refined by the active 2216 mm field recheck. |
| SUP-071-OLD | B1 / D5-BR | B4 | superseded/inactive observation | 2014 | — | — | — | Superseded / excluded | Both start label and reading corrected; active SUP-071 is B2 / D5-BR→B4 = 2046 mm. |
| BASE-WC-03-OLD | T2 | T3 | superseded/inactive observation | 690 | — | — | — | Superseded / excluded | Incorrect raw reading; active field recheck is 1685 mm. |
| BASE-WC-04-OLD | T3 | D5-WCL | superseded/inactive observation | 171 | — | — | — | Superseded / excluded | Superseded by clarified active 173 mm endpoint reading. |
| RC-19-OLD-ENDPOINT | CP2-FL | PI3 | superseded/inactive observation | 2206 | — | — | — | Superseded / excluded | Field value retained but endpoint corrected to CP2-FR; old definition produced approximately +111 mm conflict. |

## Room A angular evidence

| ID | Node | Measured | Model v1.3 | Residual | Status |
|---|---|---:|---:|---:|---|
| ANGLE-A0-R1 | A0 | 91.0° | 89.931° | -1.069° | Active soft fit constraint; not independent |
| ANGLE-A1-R1 | A1 | 90.0° | 90.000° | -0.000° | Active soft fit constraint; not independent |
| ANGLE-A4-R1 | A4 | 89.0° | 88.731° | -0.269° | Active soft fit constraint; not independent |
| ANGLE-A5-R1 | A5 | 90.0° | 89.949° | -0.051° | Active soft fit constraint; not independent |
| ANGLE-A6-R1 | A6 | 90.0° | 90.000° | +0.000° | Active soft fit constraint; not independent |
| ANGLE-A7-R1 | A7 | 89.0° | 90.001° | +1.001° | Active soft fit constraint; not independent |

The 37 scalar SUP/repeat distances and six soft angles support the accepted Room A **internal shape**. They do not independently prove the later `-0.854962°` rigid global rotation because rigid rotation preserves all internal distances and angles. The independent 9019 mm A/C span is good at 0.68% short, and D4→A5 is within 3 mm of its field range on the accepted D4 object edge. Those checks support the current placement tolerance, but the 9019 span changed only 0.50 mm when Room A rotated and therefore does not uniquely select that rotation.

## Room C validation

The three accepted post-solve checks remain encouraging when recalculated: `VALID-RC-01` is +22.92 mm, `VALID-RC-02` is -1.26 mm, and `VALID-RC-03` is -25.16 mm. The D3/D4 object-edge gap is also excellent at -1.66 mm. This pattern does not indicate a Room C-wide scale error.

The known CP1 `RC-04` conflict remains: CP1-BODY-FR→PO1 is 265.70 mm against 225 mm, or +40.70 mm. It is a local object-placement/layer conflict, not a shell closure error.

## Room B validation

The five active field rechecks give:

- D3-BR→B0.5: 136.00 mm against 136 mm.
- B0 / D3-BL→B4: 2221.12 mm against 2216 mm.
- B1 / D5-BL→B3: 2085.12 mm against 2091 mm.
- B0.5 perpendicular to B3–B4: 2085.12 mm against 2080 mm.
- B2 / D5-BR→B3: 1209.45 mm against 1219 mm.

Their median absolute residual is 5.12 mm and worst percentage residual is 0.78%. They support the 136 mm return, orthogonal main shell, corrected depth and corrected width. Because they were used in v0.2, this is fit confirmation rather than independent holdout validation. The old 249 mm return remains explicitly superseded and excluded.

The only >1.5% Room B row is older `SUP-065` (B0→B0.5), at -25.09 mm / -2.83%. It is isolated; no matching displacement appears in the later rechecks.

## CP2 investigation

The exact frozen evidence does **not** support a CP2 width or depth error: the 708 mm body width and 536 mm body depth are reproduced, `RC-18` and `RC-22` are exact fit constraints, and corrected holdout `RC-19` is only -4.00 mm.

The new D4 rays nevertheless form a coherent local pattern on the rendered body layer:

- front-right model 3859.83 mm versus 3800–3814 mm: model long by 45.83–59.83 mm;
- rear-right proxy 4377.20 mm versus 4310–4330 mm: model long by 47.20–67.20 mm.

Their similar excess suggests a common local station/layer issue rather than independent noise or wrong cupboard depth. But the evidence is not yet clean enough to call this a CP2 translation: v1.3 contains an inherited `D4-CL` and a later `D4-OUTER-L` 18.33 mm apart; `CP2-FR` and `CP2-BODY-FR` are separate; and no explicit `CP2-CR` coordinate exists. The prior approximate 3860/4377 values specifically match `D4-OUTER-L→CP2-BODY-FR/BR`, not the literal inherited node names.

Conclusion: **casing/footprint endpoint mismatch is the first diagnosis to resolve.** If the field contacts are confirmed as the body corners, the two rays then support a medium-confidence roughly 50–60 mm CP2/D4 relative-position concern. This audit does not move CP2.

## Systematic-pattern assessment

- By room: Room A, Room C and corrected Room B do not show a common scale bias. WC retains its already-known 42 mm opposing-width conflict.
- By doorway: D2 is good; D3 is a single conditional Review-band ray; D4 passes toward A5 but not toward CP2; D5 has no new systematic issue.
- By start node: the common D4 object edge agrees with A5 but both CP2 targets are model-long, focusing attention on CP2 endpoint/layer semantics.
- By direction: only the D4→CP2 diagonal family clusters coherently. The two whole-flat through-door spans are model-short, but at different percentages and with different ray definitions; this is insufficient evidence of global scale error.
- By object: CP1 has one known large local conflict. CP2 has coherent new rays but strong width/depth and RC-19 checks. These are object-layer issues, not evidence for re-solving the shell.

## Outlier shortlist

### 1. CP1 body-right placement relative to PO1

- Supporting observations: `OBJ-CHECK-CP1-RC04`
- Finding: Model is 265.70 mm versus 225 mm, +40.70 mm (+18.09%).
- Likely cause: Known object-layer conflict introduced when the direct 1285 mm CP1 body width replaced the provisional CP1-FR station; body edge versus inherited casing/shell reference is the leading explanation.
- Confidence: High that the documented conflict exists; medium on physical cause.
- Smallest useful action: First confirm the original RC-04 contact surfaces from notes/photo. Only if still unclear, recheck CP1 body-right to PO1 once; no shell survey programme.

### 2. CP2 position/layer relative to D4

- Supporting observations: `FIELD-D4CL-CP2FR-2026-08`, `FIELD-D4CL-CP2CR-2026-08`
- Finding: Body-layer models are long by 45.829–59.829 mm at the front and 47.196–67.196 mm at the rear.
- Likely cause: A coherent local endpoint/layer mismatch is more likely than independent noise. CP2 width and depth match direct dimensions, and corrected RC-19 is only -4 mm, so depth/width error is not supported. If the field contacts are confirmed as body corners, the paired rays instead resemble a roughly 50–60 mm CP2/D4 relative translation.
- Confidence: Medium; CP2-CR is absent from frozen v1.3 and the front name also spans footprint/body layers.
- Smallest useful action: No new distance initially: annotate/confirm whether both shots touched D4-OUTER-L and CP2 body front/back right. If confirmed and a numeric recheck is still required, repeat only the easier front-right shot.

### 3. Room B B0→B0.5 diagonal

- Supporting observations: `SUP-065`
- Finding: Model is 862.91 mm versus 888 mm, -25.09 mm (-2.83%).
- Likely cause: Isolated older casing/corner endpoint or layer discrepancy; the five later Room B rechecks do not show a matching shell displacement.
- Confidence: Medium that it is an isolated evidence-layer issue; low that it indicates shell failure.
- Smallest useful action: None before 2D sign-off unless this short diagonal is construction-critical.

### 4. WC opposing widths under rectangular constraint

- Supporting observations: `BASE-WC-01`, `BASE-WC-03`, `SUP-072`
- Finding: The active 1643/1685 mm widths differ by 42 mm; the frozen 1662.69 mm rectangle splits that conflict and the diagonal SUP-072 is +20.83 mm (+1.06%).
- Likely cause: Known field-face/room non-ideal conflict intentionally overridden by the human architectural rectangle.
- Confidence: High; explicitly preserved in v0.3.
- Smallest useful action: None for pre-final 2D validation; revisit only at construction-detail stage if exact WC finishes matter.

## Human architectural constraints

- `ARCH-A-ORIENTATION`: Rigidly rotate Room A -0.854961637° about the D2 anchor so A7–A6 is parallel to the frozen Room C/WC horizontal family. Not counted as a field observation. Pairwise Room A geometry is unchanged.
- `ARCH-WC-RECTANGLE`: Represent the WC as an exact rectangle despite active opposing widths 1643 and 1685 mm. The 42 mm conflict remains visible in active evidence residuals.
- `ARCH-C-TOPOLOGY`: Retain accepted Room C parallel wall families, D3-CL turning corner and D2-CR 580 mm station. No topology or geometry change is made by this audit.

## Overall validation assessment

**Validated with minor local issues.** The frozen v1.3 shell is strongly supported overall. No broad whole-flat scale error, registration failure or reason to run a new solve is present.

## Strongly supported areas

- Room A internal shape and measured-angle network.
- Room C shell closures and independent face/closure checks.
- Corrected orthogonal Room B, including the active 136 mm D3 return.
- A↔C placement at the current project review tolerance.
- CP2 body width and depth.

## Remaining systematic issues

1. Known CP1 RC-04 object-layer conflict.
2. CP2/D4 endpoint-layer ambiguity with two coherent model-long field rays.
3. Known WC opposing-width conflict under the human rectangular constraint.
4. Single conditional C↔B D3-normal Review-band residual.

## Required actions before final 2D sign-off

Keep the geometry frozen. Human-review the CP1 RC-04 contact surfaces and the CP2/D4 endpoint mapping. No broad new survey programme is recommended. First confirm the existing photo/field annotations; only if the CP2 contacts cannot be established should the easier D4 outer-left casing→CP2 body front-right distance be repeated once.

No geometry change is recommended by this audit.

**VALIDATION REVIEW REQUIRED**

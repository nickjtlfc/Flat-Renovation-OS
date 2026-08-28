# Room A reconstruction pilot v0.1

**Status:** Selected **S3: Distance with repeats and soft angles** on 3 August 2026. This is derived geometry, not source evidence.

## Outcome

The angle-informed solution is selected because it remains compatible with the distance network, improves agreement with the human-verified near-orthogonal room, and does not force any exact distance into serious contradiction. No angle is fixed at 90 degrees, and A2/A3 remain distance-derived.

| Solution | Clear baseline/node RMS | Largest exact-distance residual | A1 to A2 bearing | A4 to A3 bearing | Return difference | Finished-wall area |
|---|---:|---:|---:|---:|---:|---:|
| S1: Existing distance-only | 4.835 mm | SUP-038 +13.12 mm | 93.62 deg | 88.255 deg | 5.365 deg | 18.8875 m2 |
| S2: Distance with repeats | 5.119 mm | SUP-038 +12.068 mm | 93.303 deg | 88.587 deg | 4.717 deg | 18.8965 m2 |
| S3: Distance with repeats and soft angles | 5.101 mm | SUP-038 +12.171 mm | 92.461 deg | 88.612 deg | 3.849 deg | 18.8986 m2 |

Bearings use solver +X, with A2 to A3 fixed at 0 degrees as a coordinate gauge; they are not site-north bearings. RMS is the unweighted RMS of active clear baseline/node observations, including clear repeats where applicable. Approximate-area readings are excluded from that RMS.

## Repeat-observation treatment

Both original and repeat readings are preserved. Normal repeats are separate observations at the same 8 mm working sigma as the original clear supplemental observations. This is equivalent to fitting the pair's mean at 8/sqrt(2) mm under independent random error, but keeps each residual auditable. SUP-028-R1 is deliberately wider at 24 mm because it was difficult; SUP-046-R1 retains 75 mm because its endpoint remains an approximate landing area. The A0-A1 and A4-A5 rechecks are qualitative confirmations only because separate numeric readings were not supplied.

## SVG opening and casing convention

The review SVG restores the earlier three-layer convention: black is the surrounding finished-wall plane, solid blue is the actual clear/recorded opening width, and orange is the projecting outer casing or architrave front face. A thin dashed cyan line between the named wall-plane nodes is a reference span only and must not be read as the clear opening.

| Object | Opening shown | Casing extent shown | Evidence status |
|---|---:|---:|---|
| D1 | 781 mm clear opening | 1204 mm front-face casing; 31 mm projection | Width and projection directly measured |
| D2 | 767 mm clear opening | 1096 mm outer casing | Width directly measured; drawn front-face position is approximate because 37 mm is a maximum projection, not two surveyed side offsets |
| W1 | 1026 mm recorded window width | 1430 mm front-face casing; 157/151 mm node-to-face offsets | Casing width and offsets directly measured; 1026 mm remains secondary recorded window-width evidence rather than a substituted casing width |

For presentation, the width segments are centred on their associated wall-plane node span as in the earlier SVG. That centring is a diagrammatic placement convention, not an added survey constraint, and does not alter the fitted nodes or opening-bearing wall geometry.

## Coordinates by solution

### S1 - Existing distance-only

| Node | x (mm) | y (mm) |
|---|---:|---:|
| A2 | 0 | 0 |
| A3 | 1955 | 0 |
| A0 | -1297.3 | -298.03 |
| A1 | 17.83 | -281.81 |
| A4 | 1946.9 | -265.89 |
| A5 | 3237.99 | -265.99 |
| A6 | 3241.35 | 4003.93 |
| A7 | -1296.81 | 4004.51 |

### S2 - Distance with repeats

| Node | x (mm) | y (mm) |
|---|---:|---:|
| A2 | 0 | 0 |
| A3 | 1955 | 0 |
| A0 | -1298.46 | -296.1 |
| A1 | 16.2 | -280.77 |
| A4 | 1948.44 | -265.72 |
| A5 | 3238.88 | -268.64 |
| A6 | 3244.42 | 4001.98 |
| A7 | -1295.63 | 4007.08 |

### S3 - Repeats plus soft angles (selected)

| Node | x (mm) | y (mm) |
|---|---:|---:|
| A2 | 0 | 0 |
| A3 | 1955 | 0 |
| A0 | -1300.62 | -294.53 |
| A1 | 12.08 | -281.16 |
| A4 | 1948.56 | -265.76 |
| A5 | 3238.74 | -268.45 |
| A6 | 3243.82 | 4002.02 |
| A7 | -1295.42 | 4007.45 |

## Soft angle observations in selected fit

| Corner | Field reading | Selected fitted angle | Residual |
|---|---:|---:|---:|
| A0 | ~91 deg | 89.347 deg | -1.653 deg |
| A1 | ~90 deg | 88.122 deg | -1.878 deg |
| A4 | ~89 deg | 88.731 deg | -0.269 deg |
| A5 | ~90 deg | 89.949 deg | -0.051 deg |
| A6 | ~90 deg | 90 deg | +0 deg |
| A7 | ~89 deg | 90.001 deg | +1.001 deg |

Each angle has a 1.75 degree working sigma and Huber treatment. A2 and A3 have no direct angle residual.

## Material distance-residual changes

Material means at least 2 mm change in predicted-minus-observed residual.

### S1 to S2 - adding repeat distances

| Measurement | Before residual | After residual | Change |
|---|---:|---:|---:|
| SUP-042 | +4.1 mm | +7.46 mm | +3.36 mm |
| SUP-032 | +11.04 mm | +8.42 mm | -2.62 mm |
| SUP-045 | -3.09 mm | -0.92 mm | +2.17 mm |
| SUP-043 | +5.09 mm | +7.23 mm | +2.14 mm |
| SUP-003 | -5.74 mm | -3.66 mm | +2.08 mm |

### S2 to S3 - adding soft angles

No distance residual changed by at least 2 mm.

## Selection-rule assessment

- Distance-network compatibility: **pass**; clear RMS change S2 to S3 is -0.018 mm.
- Modest residual deterioration: **pass**; the largest exact residual changes by +0.103 mm.
- Better reflects field angles: **pass**; angle-observation RMS changes from 1.347 to 1.106 degrees.
- No serious exact-distance contradiction: **pass**; selected largest exact residual is SUP-038 +12.171 mm.

The selected shape is not a forced rectangle: its six measured-corner fitted angles remain individually estimated, and the unmeasured chimney-front corners A2/A3 follow the distance network.

## Selected geometry checks

- Finished-wall area: **18.8986 m2**.
- Selected bearings A1 to A2 / A4 to A3: **92.461 / 88.612 degrees**.
- Absolute angular difference between the returns: **3.849 degrees**.
- General-landing checks SUP-061 through SUP-064 remain compatible and are not fitted because their landing points are not exact nodes.

See the companion JSON for every active distance residual in each solution, all repeat evidence, all angle residuals, and the machine-readable selection tests. The SVG shows the selected geometry, fitted return bearings, field angles, and selected solution type.

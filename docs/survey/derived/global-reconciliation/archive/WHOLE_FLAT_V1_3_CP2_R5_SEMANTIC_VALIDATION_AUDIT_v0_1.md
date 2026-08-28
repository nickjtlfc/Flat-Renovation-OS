# Whole-flat v1.3 CP2 R5 semantic validation audit v0.1

## Scope and frozen-state gate

This is a targeted semantic/node-mapping and CP2 validation audit of `WHOLE_FLAT_FINAL_2D_REVIEW_CANDIDATE_v1_3`. It does not alter geometry, run a solver, or create v1.4. Expected and actual geometry movement is **0 mm everywhere**.

The field names are interpreted using the explicit R5 viewer-relative definitions, not page-left/page-right and not visually nearby rendered-body proxies.

## Exact semantic trace

| R5 node | Physical meaning | Correct frozen-v1.3 coordinate (mm) | Instantiation | Confusable alternative |
|---|---|---:|---|---|
| D4-CL | Viewer-left outer casing edge while standing in Room C facing D4. | (3067.00, 0.00) | roomCUnchangedObjectNodesMm.D4-OUTER-L | roomCUnchangedNodesMm.D4-CL (3048.67, 0.00), offset 18.33 mm |
| D3-CR | Viewer-right outer casing edge while standing in Room C facing D3. | (3283.34, 0.00) | roomCUnchangedObjectNodesMm.D3-OUTER-R | roomCUnchangedNodesMm.D3-CR (3266.67, 0.00), offset 16.67 mm |
| CP2-FL | Viewer-left identifiable front outer footprint corner of CP2. | (3468.33, -3690.92) | roomCUnchangedNodesMm.CP2-FL (coincident with CP2-CASING-FL) | CP2-BODY-FL (3488.33, -3690.92), offset 20.00 mm |
| CP2-FR | Viewer-right identifiable front outer footprint corner of CP2 at the structural wall. | (4223.33, -3690.92) | roomCUnchangedNodesMm.CP2-FR | CP2-BODY-FR (4196.33, -3690.92), offset 27.00 mm |
| CP2-CR | Viewer-right rear casing/footprint corner on the A-C structural wall. | (4231.31, -4226.86) | Not explicit; derived below | CP2-BODY-BR (4204.32, -4226.86), offset 27.00 mm |
| C2 | Permanent Room C upper/inner return associated with the W2 recess / D4 side. | (1599.00, 0.00) | roomCUnchangedNodesMm.C2 | legacy source-plan cupboard label C2 |

### D4-CL resolution

The correct R5 coordinate is **D4-OUTER-L (3067.00, 0.00)**. The inherited literal `D4-CL` at (3048.67, 0.00) is 18.33 mm away and is the superseded v0.1 equal-split display gauge. The accepted object integration explicitly states that the measured 760 + 80 + 80 mm D4 object span replaced that gauge. Every D4 field check below therefore uses D4-OUTER-L.

### D3-CR resolution

The correct R5 coordinate is **D3-OUTER-R (3283.34, 0.00)**. The inherited literal `D3-CR` at (3266.67, 0.00) is 16.67 mm away and is likewise a superseded equal-split display gauge. No D3 leaf/opening point is substituted.

### CP2 front footprint resolution

Explicit outer-footprint coordinates exist: **CP2-FL (3468.33, -3690.92)** and **CP2-FR (4223.33, -3690.92)**. CP2-FL coincides with `CP2-CASING-FL`, while `CP2-BODY-FL` is 20.00 mm inside it. `CP2-BODY-FR` is 27.00 mm from CP2-FR. These body points are rendered joinery geometry, not R5 footprint substitutes.

### CP2-CR recovery

`CP2-CR` is not explicit in frozen v1.3, but it is uniquely recoverable as a **derived semantic reference from accepted geometry**:

- R5 places CP2-CR on the A–C structural wall, whose accepted Room C line is CP2-FR→D3-CL.
- The accepted 536 mm object depth supplies the rear plane through CP2-BODY-BL→CP2-BODY-BR.
- Their intersection is **CP2-CR (4231.31, -4226.86)**.
- Independently extending CP2-FR by the accepted body-depth vector gives (4231.32, -4226.86), only 0.005 mm different because stored coordinates are rounded.

This is not a new measured node. It is 26.99 mm from CP2-BODY-BR. The known 27 mm right-side footprint balance remains physically unallocated; the derivation does not relabel it as measured casing or gap.

The R5 permanent node `C2` is (1599.00, 0.00) at the W2/D4-side return. It must not be confused with the legacy source-plan cupboard name C2, which R5 replaced with CP2.

## Expanded validation results

Residual is model minus field. Full observation ranges are retained; no midpoint is promoted to a measurement.

| Check | Semantic ray | Field measurement (mm) | Model v1.3 (mm) | Residual (mm) | Residual % | Assessment |
|---|---|---:|---:|---:|---:|---|
| A | D4-CL → CP2-FR | ≈3800–3814 | 3867.82 | +67.81 to lower; +53.81 to upper | +1.78% to lower; +1.41% to upper | Investigate — outside range |
| B | D4-CL → CP2-CR | ≈4310–4330 | 4384.29 | +74.29 to lower; +54.29 to upper | +1.72% to lower; +1.25% to upper | Investigate — outside range |
| C | D4-CL → CP2-FL | ≈3680 | 3712.68 | +32.67 | +0.89% | Good / likely acceptable |
| D | D3-CR → CP2-FL | ≈3660 | 3695.55 | +35.55 | +0.97% | Good / likely acceptable |
| E | CP2-FR → C2 | ≈4470–4520 | 4528.80 | +58.80 to lower; +8.80 to upper | +1.31% to lower; +0.20% to upper | Review — outside range |

Review bands follow the project convention: Excellent ≤0.5%, Good >0.5–1.0%, Review >1.0–1.5%, Investigate >1.5%. Ranged checks use the worst percentage against either reported limit.

## Semantic versus proxy comparison

The coordinate-offset column is start / target. “Explained” is old predicted distance minus corrected predicted distance: a negative value means correct semantics make the model-long result larger rather than explaining it.

| Check | Old proxy coordinates | Correct R5 coordinates | Coordinate offsets (mm) | Old prediction (mm) | Corrected (mm) | Apparent discrepancy explained (mm) |
|---|---|---|---:|---:|---:|---:|
| A | (3067.00, 0.00) → (4196.33, -3690.92) | (3067.00, 0.00) → (4223.33, -3690.92) | 0.00 / 27.00 | 3859.83 | 3867.82 | -7.99 |
| B | (3067.00, 0.00) → (4204.32, -4226.86) | (3067.00, 0.00) → (4231.31, -4226.86) | 0.00 / 27.00 | 4377.20 | 4384.29 | -7.09 |
| C | (3067.00, 0.00) → (3488.33, -3690.92) | (3067.00, 0.00) → (3468.33, -3690.92) | 0.00 / 20.00 | 3714.89 | 3712.68 | +2.21 |
| D | (3283.34, 0.00) → (3488.33, -3690.92) | (3283.34, 0.00) → (3468.33, -3690.92) | 0.00 / 20.00 | 3696.61 | 3695.55 | +1.05 |
| E | (4196.33, -3690.92) → (1599.00, 0.00) | (4223.33, -3690.92) → (1599.00, 0.00) | 27.00 / 0.00 | 4513.20 | 4528.80 | -15.59 |

For A and B, the corrected semantic endpoints lengthen the predictions by 7.99 mm and 7.09 mm respectively. Endpoint semantics are now resolved, but they do **not** remove the paired model-long residual.

## Supporting CP2 evidence

| Evidence | Field (mm) | Frozen v1.3 (mm) | Residual (mm) | Role |
|---|---:|---:|---:|---|
| RC-18 PI1→CP2-FR | 2494 | 2494.00 | +0.00 | Direct fit constraint |
| RC-19 CP2-FR→PI3 | 2206 | 2202.00 | -4.00 | Corrected holdout endpoint |
| RC-22 CP2-FL→PI1 | 1739 | 1739.00 | +0.00 | Direct fit constraint |
| CP2 body width | 708 | 708.00 | +0.00 | Direct body layer |
| CP2 body depth | 536 | 536.00 | +0.00 | Direct body layer |
| CP2 viewer-left casing | ≈20 | 20.00 | +0.00 | Approximate casing layer |

The explicit CP2-FL→CP2-FR span is 755 mm. The 708 mm body plus approximately 20 mm left casing explains 728 mm, leaving the established **27 mm unallocated footprint/casing balance**. That unknown layer composition remains relevant to the outer-right reference, but it is too small by itself to explain the full A/B residual and must not be invented as a measured right casing.

## Geometric pattern analysis

### Hypothesis 1 — endpoint/layer mismatch

The ambiguity is resolved, but the hypothesis does not explain the concern. Correct footprint/rear semantics increase A from 3859.83 to 3867.82 mm and B from 4377.20 to 4384.29 mm. The prior proxy conclusion was not semantically valid, yet the correct calculation remains model-long.

### Hypothesis 2 — whole-CP2 translation

A and B remain model-long by overlapping bands: A is +53.81 to +67.81 mm beyond the observed range, and B is +54.29 to +74.29 mm. C and D are also model-long, but only +32.67 and +35.55 mm. E lies only 8.80 mm above its upper reported limit.

All five rays therefore have a coherent directional tendency that could be reduced by moving CP2 toward the doorway/recess reference cluster. A displacement vector is **not** estimated: the observations are approximate or ranged, their midpoints are non-authoritative, and a CP2-only move would break exact RC-18/RC-22 and near-exact RC-19 unless accepted adjoining geometry also changed. The evidence is not sufficiently determined for a rigid translation claim.

### Hypothesis 3 — CP2 width/depth problem

Not supported. The direct 708 mm body width and 536 mm body depth reproduce exactly. RC-18 and RC-22 reproduce exactly, and corrected holdout RC-19 is only -4.00 mm. Further, model B minus A is 516.47 mm; the two field ranges permit a difference of 496–530 mm. Thus the paired front/rear pattern is compatible with the accepted depth contribution rather than diagnosing a depth error.

The stronger right-side residual relative to the left-side checks points instead to the outer-right footprint/reference station or to the approximate long-ray evidence. The 27 mm layer balance is relevant but does not fully account for a roughly 54–74 mm excess.

### Hypothesis 4 — D4/D3 reference mismatch

Resolved, with no leaf proxy used. The accepted R5 stations are D4-OUTER-L and D3-OUTER-R. Checks C and D are both Good at 0.89% and 0.97%; their modeled difference is 17.12 mm versus the approximate field difference of 20 mm. That coherence supports the corrected doorway mapping rather than a D4/D3 semantic failure.

## Correct semantic mappings

- D4-CL = **(3067.00, 0.00)**, instantiated as D4-OUTER-L.
- D3-CR = **(3283.34, 0.00)**, instantiated as D3-OUTER-R.
- CP2-FL = **(3468.33, -3690.92)**, explicit outer footprint and coincident with CP2-CASING-FL.
- CP2-FR = **(4223.33, -3690.92)**, explicit outer footprint.
- CP2-CR = **(4231.31, -4226.86)**, derived semantic reference from the accepted structural-wall/rear-plane intersection.
- C2 = **(1599.00, 0.00)**, permanent W2/D4-side return.

## CP2 diagnosis

**3. Systematic CP2 relative-position discrepancy**, with a low-to-medium-confidence, localized outer-footprint/right-station qualifier. Semantics are resolved and the five rays are consistently model-long, but direct constraints do not support a body width/depth failure and the approximate evidence is insufficient to identify an authoritative whole-object translation.

## Required action

Keep v1.3 frozen. The minimum next action is human review/acceptance of the resolved mapping and the localized CP2 outer-footprint residual flag, with CP2-CR carried as a derived semantic reference in validation records. The expanded existing field evidence is sufficient for this gate: **do not request another physical measurement, move geometry, or run a solve**.

## Final 2D consequence

This evidence does **not** change the recommendation to keep v1.3 frozen. No Room C, doorway, cupboard, shell, or other node moved; no transform changed; no solver ran; no v1.4 was created.

**VALIDATION REVIEW REQUIRED**

# Room C reconstruction — first pass v0.1

Status: **proposal for human visual review; not accepted or construction geometry**.

This pass reconstructs the permanent finished-wall network and the current L-shaped stud partition. It does not perform the detailed D2/D3/D4/W2/CP1/CP2 object survey or reconcile Room C globally with Rooms A, B or the WC.

## Selected result

Solution **A1 (architecture-informed first pass)** is selected. It uses the corrected D3/D2 topology, hard continuous/parallel wall-family relationships, distinct PO/PI wall faces, every supplied observation except the contradicted RC-19, the three approximate checks at lower weight, and a soft 90° architectural relationship between the two wall-direction families.

- Solved wall-family angle: **90.854°**.
- C0 → D3-CL solved envelope run: **4168.34 mm**.
- C0 → CP1-FL solved envelope run: **3691.32 mm**.
- Outer stud face: PO1 → PO2 **2331.56 mm**; PO2 → PO3 **2617.64 mm**.
- Inner stud face: PI1 → PI2 **2202 mm**; PI2 → PI3 **2494 mm**.
- Derived face separations are approximately **123.64 mm** at the upper junction and **129.56 mm** at the A–C-wall junction. These come from differences between PO and PI face runs; they are not direct or uniform-thickness measurements.

No accepted Room C floor area is reported because CP1/CP2 rear depths and several object extents are not measured.

## Contradiction review

RC-19 is retained as a direct observation but held out of the selected A1 fit. With the registered parallel/continuous inner enclosure relationships, RC-18, RC-20, RC-21 and RC-22 make RC-19 imply an included angle of **99.563°**. That conflicts with:

- RC-15, RC-16 and RC-17, which independently imply approximately 90–93°;
- the broadly rectilinear plan topology; and
- the Room C photographs, which show a conventional near-orthogonal shell/partition arrangement rather than a strongly skewed enclosure.

The selected solution leaves RC-19 at **+111.17 mm**. This is intentionally visible and should be rechecked before an accepted Room C baseline is created.

For comparison, distance-led diagnostic D1 produces a **98.85°** angle. It fits RC-19 more closely but degrades all three approximate cross-checks and gives the room a visibly less plausible skew, so it is not selected.

Two smaller direct-network closure tensions also remain:

- RC-01 is **50 mm** longer than RC-03 + RC-06.
- RC-02 is **41 mm** longer than RC-05 + RC-07.

The hard continuous/parallel wall topology distributes those mismatches across the contributing readings, producing the roughly 14–17 mm residuals visible below. The current evidence does not isolate one bad reading in either closure group, so none is discarded.

## Residuals

Direct observations use nominal sigma 8 mm. Approximate cross-checks use sigma 100 mm and therefore have lower influence. Huber loss limits the effect of large standardized residuals. RC-19 is validation-only in A1 after the explicit contradiction review.

| ID | From | To | Measured mm | Solved mm | Residual mm | Evidence class | Weighting / constraint class |
|---|---|---|---:|---:|---:|---|---|
| `RC-01` | `D3-CL` | `C0` | 4185 | 4168.34 | -16.66 | direct | direct / sigma 8 mm / Huber |
| `RC-02` | `C0` | `CP1-FL` | 3705 | 3691.32 | -13.68 | direct | direct / sigma 8 mm / Huber |
| `RC-03` | `CP1-FL` | `PO1` | 1534 | 1550.70 | +16.70 | direct | direct / sigma 8 mm / Huber |
| `RC-04` | `CP1-FR` | `PO1` | 225 | 225.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-05` | `PO1` | `PO2` | 2318 | 2331.56 | +13.56 | direct | direct / sigma 8 mm / Huber |
| `RC-06` | `PO2` | `PO3` | 2601 | 2617.64 | +16.64 | direct | direct / sigma 8 mm / Huber |
| `RC-07` | `PO3` | `D3-CL` | 1346 | 1359.76 | +13.76 | direct | direct / sigma 8 mm / Huber |
| `RC-08` | `D3-CL` | `D2-CR` | 580 | 580.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-09` | `D3-CR` | `D4-CL` | 218 | 218.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-10` | `D4-CR` | `C2` | 548 | 548.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-11` | `C1` | `C0` | 330 | 330.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-12` | `C1` | `W2-CR` | 165 | 165.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-13` | `C2` | `W2-CL` | 165 | 165.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-14` | `C1` | `C2` | 1269 | 1269.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-15` | `PO2` | `CP1-FL` | 2760 | 2780.85 | +20.85 | approximate-cross-check | low-weight approximate / sigma 100 mm / Huber |
| `RC-16` | `PO2` | `C0` | 2100 | 2077.60 | -22.40 | approximate-cross-check | low-weight approximate / sigma 100 mm / Huber |
| `RC-17` | `PO2` | `D3-CL` | 2928 | 2931.71 | +3.71 | approximate-cross-check | low-weight approximate / sigma 100 mm / Huber |
| `RC-18` | `PI1` | `CP2-FR` | 2494 | 2494.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-19` | `CP2-FL` | `PI3` | 2206 | 2317.17 | +111.17 | direct | direct validation held out after contradiction review — **not used in A1 fit** |
| `RC-20` | `PI3` | `PI2` | 2494 | 2494.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-21` | `PI2` | `PI1` | 2202 | 2202.00 | +0.00 | direct | direct / sigma 8 mm / Huber |
| `RC-22` | `CP2-FL` | `PI1` | 1739 | 1739.00 | +0.00 | direct | direct / sigma 8 mm / Huber |

Largest absolute residuals:

- `RC-19`: +111.17 mm (held-out validation).
- `RC-16`: -22.40 mm.
- `RC-15`: +20.85 mm.
- `RC-03`: +16.70 mm.
- `RC-01`: -16.66 mm.
- `RC-06`: +16.64 mm.

## Architectural constraints used

- **ARCH-01 — hard topology:** D3-CL is the permanent finished-wall corner; D2-CR is 580 mm along the adjoining wall and is not the corner.
- **ARCH-02 — hard parameterisation:** C0-D3-CL, CP1-FL-PO1, PO2-PO3, PI1-CP2-FR and PI2-PI3 use one continuous/parallel wall-direction family.
- **ARCH-03 — hard parameterisation:** C0-CP1-FL, PO1-PO2, PO3-D3-CL, PI1-PI2 and the A-C wall use the adjoining wall-direction family.
- **ARCH-04 — soft architectural constraint:** The two wall-direction families are approximately perpendicular, modelled as 90 degrees with sigma 3 degrees in A1.
- **ARCH-05 — hard topology:** PO and PI partition faces remain distinct; the L-shaped wall is never collapsed to one line.
- **ARCH-06 — hard topology:** C1/W2-CR and C2/W2-CL are the two 165 mm W2 recess returns; C1-C2 is their 1269 mm span relationship.
- **ARCH-07 — display-only null-space gauge:** The unmeasured combined D4/D3 opening span is shared equally only to place provisional symbols; this does not solve either casing width.

## Object status for the second pass

- **D2:** D2-CR is fixed 580 mm from the permanent corner at D3-CL. D2-CL, casing/opening width, reveal and swing remain unresolved.
- **D3:** D3-CL is fixed at the permanent corner. The absolute station of D3-CR and all detailed casing/opening geometry remain provisional.
- **D4:** D4-CR is locally fixed 548 mm from C2. The absolute station of D4-CL and all detailed casing/opening geometry remain provisional.
- **W2:** the two 165 mm returns and the 1269 mm C1 → C2 relationship are used. Detailed casing, reveal and opening geometry remains deferred.
- **CP1:** the measured CP1-FL / CP1-FR / PO1 front relationship is shown. Rear depth, casing thickness and full footprint are not solved.
- **CP2:** the measured PI1 / CP2-FL / CP2-FR front relationship is shown. Rear depth, casing thickness and full footprint are not solved.

The SVG uses an equal display split for the otherwise underdetermined combined D4/D3 opening span. That is a null-space drawing gauge only and is not a solved door width.

## Evidence checked

- corrected R5 node map and register;
- provisional flat evidence-map notes and both plan sources;
- all nine Room C photographs, including the shell walls, cupboard views and ceiling/wall junction views;
- existing Room A and Room B/WC reconstruction conventions for versioning, residual visibility and derived-output separation.

## Human-review gate

Review the SVG against the real Room C, especially the near-orthogonal overall shell, the L-shaped thick partition, the D3 turning corner, the W2 recess, and the unresolved D2/D3/D4 object zones. Do not use this first pass for global reconciliation or detailed object reconstruction.

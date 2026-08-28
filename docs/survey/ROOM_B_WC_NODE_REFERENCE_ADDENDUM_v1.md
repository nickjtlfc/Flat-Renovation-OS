# ROOM B AND WC NODE REFERENCE ADDENDUM v1

## Purpose

This addendum records the current Room B and WC node interpretation for the joint reconstruction pilot.

It exists because the older repository-wide R5 node-reference map predates the physical Room B survey and does not show every node now required by the measured geometry.

For the Room B and WC reconstruction, this addendum and the approved Room B/WC evidence packs take precedence over older Room B/WC node drawings where they conflict.

---

## Precedence

For the Room B and WC reconstruction, use evidence in this order:

1. `docs/survey/ROOM_B_EVIDENCE_v1.md`
2. `docs/survey/ROOM_WC_EVIDENCE_v1.md`
3. human-confirmed topology recorded in this addendum
4. annotated photographs under `source-material/photos/RoomB-WC-Survey/`, including `ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg`
5. the existing node-reference registry and map
6. the rough 2D plan and general room photographs

The existing `NODE_REFERENCE_MAP_R5.svg` remains useful for broad orientation, but its Room B/WC panel is not fully current.

Do not silently force the measured Room B geometry back onto the older simplified node arrangement.

---

## New Room B node

### B0.5

`B0.5` is a newly introduced permanent wall-return node identified during the physical Room B survey.

It was not shown on the earlier R5 Room B/WC node panel.

Its measured relationship is:

- `D3-BR -> B0.5 = 249 mm` (`BASE-B-02`)
- `B0.5 -> D5-BL / B1 = 823 mm` (`BASE-B-03`)
- `B0 / D3-BL -> B0.5 = 888 mm` (`SUP-065`)
- `B0.5 -> B2 / D5-BR = 1182-1190 mm` (`SUP-068`)
- `B0.5 -> B3 = 2228 mm` (`SUP-069`)

`B0.5` is not an alias for `D3-BR`.

It is a separate wall-return node reached after the 249 mm segment from `D3-BR`.

The confirmation photograph `ROOMB-D3BR-RELATIONTOB0,5ANDB1WALL.jpeg` makes the layer transition explicit:

- D3 is the upper horizontal doorway/casing span and all D3 object geometry ends at `D3-BR`;
- `D3-BR -> B0.5` is the 249 mm return down to the lower corner `B0.5`;
- no part of the 249 mm return may be classified as D3 casing, inner casing or door face;
- `D3-BR` is not collinear with `B0.5`, `B1`, `T0` and `T1`;
- at `B0.5` the shell turns again onto the lower straight alignment and runs to `B1 / D5-BL`;
- the lower `B0.5 -> B1` wall must not be extended backward through `D3-BR`.

---

## Current Room B boundary sequence

The intended Room B boundary sequence for the pilot is:

`B0 / D3-BL -> D3-BR -> B0.5 -> D5-BL / B1 -> D5-BR / B2 -> B3 -> B4 -> B0`

This sequence includes door/opening endpoints and coincident aliases.

The exact casing, inner-casing and door-face layers at D3 and D5 remain separate object geometry and must not be collapsed into the wall boundary.

### Joint D3-to-WC transition sequence

For joint topology and drawing-layer purposes, the typed transition is:

`B0 / D3-BL ->[upper horizontal D3 doorway/casing]-> D3-BR ->[249 mm return down]-> B0.5 ->[lower straight Room B wall]-> B1 / D5-BL ->[D5 opening/assembly; no wall]-> T0 / D5-WCR ->[same lower straight alignment]-> T1`

The wall segments `B0.5 -> B1` and `T0 -> T1` share one straight alignment.

At `B0.5` the wall changes direction. `D3-BR -> B0.5` terminates at the corner and is not collinear with `B0.5 -> B1`. The D3 doorway bearing is not used as a substitute for either wall-family direction.

`B1` and `T0` are distinct endpoints separated by D5. **There is no physical wall segment from `B1` to `T0`.** A solver may use their ordered collinearity to locate the opposite face, but it must type the intervening edge as D5 assembly geometry, never as wall.

### Architectural wall-direction families

Human field review identifies two separate approximately parallel construction families. Treat these as architectural evidence with soft angular weighting rather than exact survey-grade parallelism:

- Family A: `B0 -> B4` and `D3-BR -> B0.5`.
- Family B: `B0 / D3-BL -> D3-BR`, `B0.5 -> B1`, `T0 -> T1`, `B4 -> B3` and `T3 -> T2`.

Family A terminates at `B0.5`; Family B begins there. The change of direction is approximately 90 degrees, but no exact right angle is imposed solely from this observation.

These are strong soft architectural direction constraints. They do not make any corner perfectly square, and the 738 mm visible D3 closed-face object measurement must not be used to distort the shell.

`SUP-080` is a long wall-to-wall validation measurement from `D3-BR` to a derived landing on `B3-B4`. It does not create an infinite construction line through `D3-BR`, `B0.5` and `B1`, and it does not make the Family A return collinear with Family B.

---

## Current WC boundary sequence

The intended WC boundary sequence is:

`T0 / D5-WCR -> T1 -> T2 -> T3 -> D5-WCL -> T0 / D5-WCR`

D5 is the shared physical door assembly connecting Room B and the WC.

D5 contains one physical 761 mm leaf with one centreline, position and orientation. The approximately 737 mm Room B closed-face observation is only the exposed portion of that leaf between the frame stops. Room B and WC casing, inner-frame, reveal and finish layers remain separate around the shared leaf; they must never generate two independent door-face positions.

The WC wall begins at `T0 / D5-WCR` and continues to `T1`; it does not continue through D5 to `B1` as a wall edge.

---

## Known alias cautions

The evidence contains several labels that refer to coincident or opposite-face door points.

Codex must not reconcile these labels by name alone.

In particular:

- `B0 / D3-BL` is one coincident Room B wall/casing node.
- `D5-BL / B1` is recorded as one coincident Room B node.
- `D5-BR / B2` is recorded as one coincident Room B node.
- `T0 / D5-WCR` is one coincident WC wall/casing node.
- Authoritative field recheck sets `SUP-071` to `B2 / D5-BR -> B4 = 2046 mm`. The former `B1 / D5-BR -> B4 = 2014 mm` record is superseded, inactive, and retained only in the Room B evidence correction history.

If the D5 aliases cannot be reconciled confidently, stop for human review.

---

## Required repository update

Before the Room B/WC geometry is treated as locked:

- update `NODE_REFERENCE_REGISTER_R5.md` to register `B0.5` and the interrupted D5 alignment;
- update the Room B/WC panel in `NODE_REFERENCE_MAP_R5.svg`;
- preserve the older node arrangement in history or changelog notes;
- do not renumber existing Room B or WC nodes merely to avoid the decimal suffix.

The decimal node name `B0.5` is acceptable as a survey-era inserted node unless the repository already has a formal migration convention that requires a different permanent identifier.

Any later renaming must include an explicit alias/migration record so existing evidence IDs remain traceable.

---

## Reconstruction instruction

For the current Room B/WC pilot:

- treat `B0.5` as valid and authoritative;
- use the measured boundary sequence above;
- preserve the typed D3-to-WC transition and the no-wall D5 interruption;
- use the older node-reference map only for broad orientation;
- do not reject the evidence pack because the older SVG lacks `B0.5`;
- report any other mismatch between the old map and measured evidence before fitting.

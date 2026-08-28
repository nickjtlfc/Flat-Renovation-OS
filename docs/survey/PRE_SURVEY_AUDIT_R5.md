# R5 remaining-room pre-survey audit

Date: 2026-08-03

Status: **PASS for Room B, WC and Room C field use; human evidence review remains required before reconstruction**.

Historical note: this audit records the earlier 44-page reissue. The active printable form was subsequently compacted to 14 pages; see `CHANGELOG.md` and `SURVEY_PACK_INDEX_R5.md` for the current interface.

## Reissue summary

The Room A field pilot showed that the earlier detailed door, window and cupboard schedules were too prescriptive for irregular finishes and human-led evidence collection. The form was rebuilt without changing the approved node system or completed Room A evidence.

| Item | Result |
|---|---|
| Recording-form HTML/PDF | 44 pages, A4 landscape |
| Room B planned node-to-node rows | 7 |
| WC planned node-to-node rows | 5 |
| Room C permanent-boundary rows | 10 |
| Room C stud-wall rows | 7 |
| Retained transition/vertical/feature rows | 30: transitions 3; ceiling/enclosure 7; soffit 6; visible services 14 |
| Supplemental rows | Exactly 200: `SUP-065` through `SUP-264` |
| Opening records | Compact D2-D5 and W2 evidence cards |
| Cupboard records | Descriptive staged sheets for CP1 and CP2 |
| Room A | No repeated full section; `SUP-001` through `SUP-064` untouched |

## Planned-measurement preservation

All 29 active non-Room-A baseline rows from the previous R5 form remain present with unchanged IDs and endpoints:

- `BASE-B-01` through `BASE-B-07`;
- `BASE-WC-01` through `BASE-WC-05`;
- `BASE-C-01` through `BASE-C-10`;
- `BASE-SW-01` through `BASE-SW-07`.

The three existing floor-transition IDs `LEVEL-A-C`, `LEVEL-C-B` and `LEVEL-B-WC` are retained on the connected-network page. The remaining relevant ceiling, stud-wall, Room B soffit and visible-service IDs are also retained. Room A-only ceiling/electrical work is not repeated because Room A is complete.

No planned baseline measurement was removed, merged, renamed or repositioned.

## Object-schedule reclassification

The former 107-row structured door/window/cupboard schedule is no longer compulsory in the field form:

- D1 and W1 are omitted because Room A is complete.
- D2-D5 now use compact records for actual opening references, clear width, measurable casing extent, wall/return condition, photographs and method exceptions.
- W2 now separates visible opening, outer surround and full wall assembly without an eight-row schedule.
- CP1 and CP2 use exterior-first descriptive evidence sheets; most dimensions go into referenced supplemental rows.
- `OBJECT_SCHEDULES_R5.md` and the three-page object guide remain available as detailed provenance/optional prompts.

This is an explicit workflow reclassification, not deletion of the earlier reference material or evidence.

## Verification

1. **PASS - authoritative nodes.** The baseline arrays match the active node register and previous R5 form.
2. **PASS - planned counts.** Room B 7, WC 5, Room C permanent 10 and Room C stud wall 7.
3. **PASS - supplemental sequence.** The rendered DOM contains 200 supplemental records, all unique and consecutive from `SUP-065` to `SUP-264`.
4. **PASS - prior IDs protected.** No form record uses `SUP-001` through `SUP-064`; the cover only identifies that range as completed Room A evidence.
5. **PASS - doors/windows simplified.** D2-D5 and W2 use compact evidence cards and allow merged, hidden, asymmetric or approximate finishes.
6. **PASS - cupboards descriptive.** CP1/CP2 sheets capture exterior evidence, photographs, access, visible interior, concealed areas and follow-up SUP IDs without forcing geometry.
7. **PASS - photographs prominent.** Opening/cupboard prompts and two photograph-register pages provide full-feature, endpoint and wider-context guidance.
8. **PASS - PDF structure.** Chrome generated a valid 44-page PDF from the authoritative HTML; all page objects are A4 landscape by the source print rule.
9. **PASS - page numbers.** Every rendered page header reports its page number and `of 44` total.
10. **PASS - visual layout.** Representative cover, maximum-row baseline, both door pages, W2, cupboard, first/last supplemental, photograph and both review page types were rendered to PNG and inspected. An initial four-door overflow was found and corrected by splitting doors across two pages. The final inspection found no clipping, overlap or footer collision.
11. **PASS - writing space.** Planned rows use 13 mm cells; supplemental observations use two-tier 20.4 mm cards with ordinary-language start/end fields and separate uncertainty/photo/notes space.
12. **PASS - scope.** No Room B, WC or Room C reconstruction, solver or geometry was created. Room A reconstruction/evidence files were not edited by this reissue.
13. **PASS - deterministic generation.** The maintained build script normalises Chrome's volatile creation/modification timestamps in place. Two consecutive final builds produced the same PDF SHA-256.

Final hashes:

- HTML: `69A6521BAB4449A6137A2769DE67949BE273B694F282DB7236F836A61758BB51`
- PDF: `3BF1E39F2D4EBD6B6BD2762D6A993EEA98E76274E4CB4593F87D945326848E84`

## Measurement-plan issues for human review

- The active R5 plan contains the three named floor-transition ties but no fixed-ID geometric cross-room distance span for the remaining survey. Record physically useful B/WC/C doorway or long-room ties using `SUP-065` onward with exact endpoints, datum and beam route.
- The ten Room C permanent-boundary rows and seven stud-wall rows do not preassign a room diagonal. Add accessible Room C diagonals/triangulation as supplemental observations rather than reviving superseded R4 node names.
- D5 casing may merge into adjoining WC walls. The compact record deliberately allows the standard rear-of-opening method to be rejected with photographs and explanation.

These are field-review prompts, not grounds to invent new nodes or alter the established baseline.

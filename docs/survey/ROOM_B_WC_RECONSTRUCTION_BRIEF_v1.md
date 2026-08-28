# ROOM B AND WC RECONSTRUCTION BRIEF v1

## Purpose

This brief defines the next Codex task: a joint 2D reconstruction of **Room B and the WC together**.

The immediate output is a clear, reviewable 2D SVG similar in purpose to the existing Room A reconstruction.

This is not yet a 3D task. However, the joint 2D geometry must be suitable as the foundation for a later editable 3D model of Room B and the WC, and eventually the wider flat.

The output must be both:

- numerically credible; and
- visually recognisable as the real Room B and WC arrangement.

A low-residual result that does not resemble the physical rooms is not acceptable.

---

## Authoritative evidence

Read these files in full:

- `docs/survey/ROOM_B_EVIDENCE_v1.md`
- `docs/survey/ROOM_WC_EVIDENCE_v1.md`

These Markdown files are the authoritative machine-readable evidence sources.

Matching PDFs may also be present as human-readable audit copies:

- `docs/survey/ROOM_B_EVIDENCE_v1.pdf`
- `docs/survey/ROOM_WC_EVIDENCE_v1.pdf`

If PDF rendering is unavailable, do not spend time troubleshooting it. Continue from the Markdown and repository evidence.

---

## Photographic and contextual evidence

Inspect:

- `source-material/photos/RoomB-WC-Survey/`
- existing general Room B and WC photographs;
- `2dPlan.jpeg`;
- existing node-reference and survey workflow files;
- the Room A reconstruction outputs as a methodological example;
- walkthrough videos where useful for orientation.

Annotated survey photographs are primary evidence for:

- wall/casing coincident nodes;
- D3 stepped geometry;
- D5 opposite-face geometry;
- tile face versus wall plane;
- the local approximately 20 mm D5 cutaway;
- difficult baseline endpoints.

General photographs and videos are for spatial orientation and visual validation. They must not override clearer measurements.

---

## Scope

Reconstruct **Room B and the WC together as one connected 2D solve**.

The two rooms should remain distinct spaces connected through D5.

Use:

- D5 as the shared door assembly;
- `SUP-079` as the only direct Room B-to-WC cross-tie.

Do not reconstruct or fit:

- Room A;
- Room C;
- the full flat;
- full soffit geometry;
- furniture, finishes or renovation proposals.

Do not attempt a direct connection from Room B or WC to Room A or Room C in this task.

---

## Required 2D output

Create one joint SVG showing, where evidence supports them:

- Room B finished boundary;
- WC finished boundary;
- node labels B0-B4, B0.5 and T0-T3;
- D3 Room B-side geometry;
- D5 Room B-side and WC-side geometry;
- coincident node aliases;
- wall plane, tile face, outer casing, inner casing and door face distinctions;
- the D5 local cutaway condition;
- the Room B-to-WC tie;
- key dimensions;
- residuals and confidence classes;
- the partial soffit start marker only.

The full soffit should be omitted or shown as an unresolved secondary feature.

---

## Joint geometry method

Treat both evidence packs as a weighted constraint network.

Use:

1. clear Room B and WC baseline measurements;
2. clear node-to-node supplemental measurements;
3. D5 as the shared object between both rooms;
4. `SUP-079` to orient and validate the joint network;
5. ranged and approximate measurements with reduced weight;
6. annotated photographs for endpoint-layer interpretation;
7. general room photographs and the rough plan for visual checking.

Do not assume:

- perfect right angles;
- parallel walls;
- one flat wall plane around D3 or D5;
- identical casing geometry on both faces of D5;
- a wall thickness not supported by evidence.

Do not silently average ranges into false precision.

---

## D5 handling

D5 is the critical shared object.

The Room B and WC evidence describe opposite faces of the same door assembly.

Codex must:

- preserve both faces separately;
- reconcile them through a common door/opening relationship where supported;
- avoid flattening the assembly into one rectangle;
- inspect the annotated photographs closely;
- report any inferred wall/casing depth separately from measured evidence;
- stop for human review if the two faces cannot be reconciled safely.

Do not invent wall thickness merely to close the model.

---

## Visual fidelity

After fitting, compare the geometry against:

- annotated Room B/WC survey photographs;
- general Room B and WC photographs;
- `2dPlan.jpeg`;
- the visible layout of D3, D5, tiled walls and room returns.

The joint SVG must look recognisably like the actual Room B and WC.

If the mathematically best fit appears visually wrong:

- do not silently accept it;
- identify the measurements or aliases driving the mismatch;
- show the competing interpretation where practical;
- pause for a targeted human check.

---

## Human review and stop conditions

Accuracy is more important than uninterrupted progress.

Codex should tolerate isolated poor measurements, ranges and approximate readings because the survey contains redundancy.

Stop and ask for direction when:

- a node alias cannot be reconciled;
- D5 Room B and WC faces conflict;
- the 20 mm cutaway cannot be interpreted;
- `SUP-079` creates an implausible room relationship;
- the solution requires inventing geometry;
- the SVG does not resemble the photographs;
- two materially different solutions remain viable.

When stopping, report:

1. the exact issue;
2. the conflicting evidence;
3. the competing interpretations;
4. the specific real-world check needed;
5. whether work can continue elsewhere safely.

---

## Long-term requirement

This joint 2D reconstruction is intended to become the basis for later 3D modelling.

Therefore:

- preserve real dimensions;
- preserve uncertainty and provenance;
- keep object layers separate;
- make derived geometry reproducible and data-driven;
- do not simplify away awkward physical construction solely for visual neatness.

Do not proceed to 3D in this task.

---

## Required outputs

Create a derived folder consistent with the Room A workflow, for example:

`docs/survey/derived/room-b-wc/`

Produce:

1. joint Room B/WC SVG;
2. structured JSON geometry and residual record;
3. concise Markdown reconstruction report;
4. reproducible solver or reconstruction script where appropriate.

Clearly mark all outputs as derived, not source evidence.

Do not overwrite either evidence pack.

---

## SVG requirements

Include:

- joint Room B and WC outline;
- labels and node aliases;
- D3 and D5 object layers;
- legend and scale;
- key measurements;
- confidence / approximate markers;
- residual summary;
- note that the full soffit is not modelled;
- note that Room A and Room C are outside scope.

Use the Room A SVG as a diagnostic and presentation reference, adapted for this more complex two-room solve.

---

## Before editing

First report:

- evidence files read;
- photos and reference files inspected;
- proposed files to create or update;
- proposed fitting method;
- how D5 will connect the two rooms;
- how `SUP-079` will be used;
- any ambiguities already identified.

Do not make broad repository changes.

Do not alter unrelated files.

---

## Completion report

At completion, report:

1. files created or changed;
2. reconstruction method;
3. measurements fitted;
4. measurements used only for validation;
5. down-weighted or excluded readings and reasons;
6. RMS and largest residuals;
7. D5 reconciliation result;
8. unresolved alias or endpoint issues;
9. whether the SVG resembles both real spaces;
10. whether the result is reliable enough to support later 3D work;
11. exact file to inspect first.

---

## Final scope reminder

This task is:

- Room B and WC together;
- one connected 2D solve;
- no Room A or Room C;
- no full soffit;
- no 3D yet;
- human-review driven;
- intended as the foundation for later 3D modelling.

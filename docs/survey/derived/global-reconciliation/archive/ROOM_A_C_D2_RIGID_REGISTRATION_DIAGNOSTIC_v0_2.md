# Global reconciliation — A/C D2 rigid registration diagnostic v0.2

Status: **GLOBAL RECONCILIATION — A/C D2 RIGID REGISTRATION DIAGNOSTIC** for human review. This is not a final whole-flat model.

Room C is fixed as the global coordinate frame. Room A uses its accepted/current selected S3 geometry and receives one rigid transform only: translation and rotation, with scale 1 and no node deformation. Room B/WC and D3 are outside this task.

## Orientation diagnosis and correction

The v0.1 drawing had a **display-only vertical reflection**. Both accepted input reconstructions use the project drawing convention in which model +Y runs downward on the sheet: Room C states this explicitly in its coordinate gauge, and both accepted room SVG generators map local Y directly to increasing SVG Y. The v0.1 combined renderer instead used `maxY - modelY`, a Cartesian-Y-to-SVG conversion whose linear determinant is negative. That mirrored the combined drawing vertically.

The D2 rigid transform did **not** cause the reflection. Its linear matrix determinant is **1.0000000000**, so it is a rotation with no reflection. v0.2 retains exactly the v0.1 rotation, translation, scale, D2 centreline registration and wall-face separation; only the world-to-SVG Y mapping changes to `modelY - minY`, whose determinant sign is positive.

The two source plans were inspected only for topology and handedness. No length, angle or proportion was derived from them. Their cupboard labels C1/C2 correspond to survey objects CP1/CP2; permanent survey nodes C1/C2 are separately retained at the W2 recess.

In the corrected view:

- Room C is left of Room A;
- CP1/CP2 (source-plan cupboards C1/C2) are on the upper side of Room C and W2 is on its lower side;
- Room A's chimney-breast/stepped boundary is uppermost, W1 is on the far-right wall and D1 is on the lower side;
- D2 remains toward the lower end of the A–C shared wall.



## Registration definition

Opposite doorway faces reverse viewer-left/right. The directed Room A axis D2-AL → D2-AR is therefore aligned with the Room C Room-A-face structural direction D2-A-FACE-R → D2-A-FACE-L. The Room A clear-opening centre is placed on the Room C structural-opening centre at the Room A wall face, 250 mm through the wall from the Room C reveal face.

Local bearings are numeric atan2 bearings from each source model's +X axis. Because both accepted room drawing gauges use +Y down, increasing numerical bearing appears clockwise on the sheet. They are not site-north bearings.

| Quantity | Result |
|---|---:|
| Room A D2 clear opening | 767.00 mm |
| Room C D2 structural opening | 770.00 mm |
| Difference, C minus A | 3.00 mm |
| Room A local D2 axis, D2-AL → D2-AR | 269.930763° |
| Room C local D2 axis, A-face R → L | 270.854265° |
| Rotation applied to Room A | 0.923502° |
| Translation applied to Room A | X 5776.1840 mm; Y -3851.1767 mm |
| Rigid-transform determinant | 1.0000000000 — no reflection |
| Scale | 1.000000 |
| Resulting Room C-face → Room A-face separation | 250.0027 mm |
| Separation residual against 250 mm | +0.00 mm |

## D2 layer mismatch

Centred alignment of the 767 mm Room A clear opening within the 770 mm Room C structural opening leaves **1.50 mm at each endpoint**. This is clean agreement for references that are not physically identical layers.

Room A's fitted D2-AL/D2-AR casing-node span is 1092.34 mm; its separately measured casing front width is 1096 mm. Against the 770 mm structural opening, these extend approximately 161.17 mm and 163.00 mm per side respectively when centred. Those are casing/architrave extents, not structural jamb mismatches.

The Room C closing leaf is 742 mm versus the Room A clear opening of 767 mm, a 25 mm difference or 12.5 mm per end when centred. The recorded heights differ by 4 mm (1975 mm in C versus 1971 mm in A). These are consistent with a leaf/clear-opening/rebate distinction.

No outer casing edges were forced to coincide.

## Combined-shell sanity check

- The approximately 250.00 mm A–C wall body remains explicit and perpendicular to the registered opening axis.
- Room A extends to the expected right-hand side of Room C; its interior reference is 3897.38 mm outward from the Room A wall face.
- The Room A A7–A0/D2 wall line coincides with the registered Room A face without crossing into the Room C side.
- Room C remains on the opposite side of its finished face, with the deep reveal between faces.
- No unexplained large gap occurs at D2 and no incorrect Room A/Room C shell overlap is introduced.
- Room A's wider shell and chimney-breast step remain intact and extend in the direction supported by the conceptual whole-flat topology.

The conceptual/evidence plan was used only to check Room C-left/Room A-right topology and the chimney-breast relationship; no schematic proportions were fitted.

## Preservation and assessment

Room C node movement is **0.00 mm**. Room A node deformation is **0.00 mm**; all Room A pairwise distances are preserved by the rigid transform. No measurements changed and neither accepted source baseline was edited.

Classification: **compatible with small explainable face/casing differences**. The 3 mm structural/clear-opening difference does not indicate shell error. Remaining ambiguity is limited to exact casing projection, structural jamb/rebate registration and possible variation of the approximately 250 mm depth between jambs.

If tighter D2 registration becomes necessary, the minimum useful real-world check is perpendicular finished-face-to-finished-face depth at both jambs plus each Room A casing edge to its corresponding structural jamb/reveal edge.

Stop here for human review. Do not begin D3, Room B/WC registration or a deformable global solve.

# U12 — გეომეტრია (geometry)

Grade 1, `topicId: 'geometria'`. Fifty templates over the curriculum's nine
subtopics, three levels each: 8 / 7 / 6 / 6 / 5 / 5 / 5 / 4 / 4.

## The one idea this unit must not break

A geometry question promises that the picture and the answer are the same object
seen twice. Two consequences shape the whole file:

- **A shape is data, not a word** (`src/practice/templates/geometry.ts`). A
  `Shape` carries `sides`, `corners`, a glyph and — where it matters — whether it
  is round or equilateral. A `Solid` carries two independent surface facts,
  `stands` and `rolls`. Every picture is rendered from those objects and every
  answer is computed from those same fields, so a triangle can never be drawn
  under a question whose answer is „4“.
- **A symmetric picture is built, not drawn.** `symmetricPicture(half)` is the
  half plus `shift(mirrorVertical(half, 2), 2)`, and `isSymmetric` recomputes the
  same fold. Rule 5 — check the symmetry cell by cell — is therefore true by
  construction rather than by careful drawing, and the tests redo the check from
  the rendered grid.

## Reference question → template

**U12.1 `brtyeli-formebi`** — flat shapes (Q1–Q8)

| Q | Reference | Template | Level |
|---|---|---|---|
| 1 | which of these is the square | `g1-u12-1-which-shape` | 1 |
| 2 | how many sides has this figure | `g1-u12-1-how-many-sides` | 1 |
| 3 | the round shape with no corners | `g1-u12-1-round-one` | 1 |
| 4 | match each shape to its name (recast from drag-and-drop) | `g1-u12-1-match-names` | 1 |
| 5 | how many corners has this figure | `g1-u12-1-how-many-corners` | 2 |
| 6 | every shape with four sides (recast from multi-select) | `g1-u12-1-four-sides` | 2 |
| 7 | four equal sides — find the square | `g1-u12-1-square-among-rectangles` | 3 |
| 8 | count the triangles in the row | `g1-u12-1-count-triangles` | 3 |

**U12.2 `moculobiti-formebi`** — solids (Q9–Q15)

| Q | Reference | Template | Level |
|---|---|---|---|
| 9 | which of these is the cylinder | `g1-u12-2-which-solid` | 1 |
| 10, 11 | what solid does this object resemble | `g1-u12-2-object-shape` | 1 |
| 12 | match objects to solids (recast) | `g1-u12-2-match-objects` | 2 |
| 13 | the shape that only rolls (condition pinned) | `g1-u12-2-rolls-only` | 2 |
| 14 | the cone, from its flat base and apex | `g1-u12-2-cone-parts` | 2 |
| 15 | stands *and* rolls (recast from multi-select) | `g1-u12-2-stands-and-rolls` | 3 |
| — | name the solid from its picture | `g1-u12-2-name-solid` | 2 |

**U12.3 `gverdebi-kutxebi`** — comparing sides and corners (Q16–Q21)

| Q | Reference | Template | Level |
|---|---|---|---|
| 16 | which of the two has more sides | `g1-u12-3-more-sides` | 1 |
| 17 | how many corners has the named figure | `g1-u12-3-corners-count` | 1 |
| 18 | match figures to their side counts (recast) | `g1-u12-3-match-sides` | 2 |
| 19 | which two figures have equal corners | `g1-u12-3-same-corners` | 2 |
| 20 | how many more corners has the second | `g1-u12-3-how-many-more` | 3 |
| 21 | four sides *and* four corners (recast) | `g1-u12-3-four-and-four` | 3 |

**U12.4 `gverdebis-datvla`** — counting sides and corners (Q22–Q27)

| Q | Reference | Template | Level |
|---|---|---|---|
| 22 | corners of one figure | `g1-u12-4-corners` | 1 |
| 23 | sides of one figure | `g1-u12-4-sides` | 1 |
| 24 | four corners on each square, counted across the row | `g1-u12-4-square-corners` | 3 |
| 26 | match figures to their corner counts (recast) | `g1-u12-4-match-corners` | 2 |
| 25 | triangles and quadrilaterals, corners added | `g1-u12-4-mixed-corners` | 3 |
| 27 | the same for sides | `g1-u12-4-mixed-sides` | 3 |

**U12.5 `gaRia-daxuruli`** — open and closed figures (Q28–Q32)

| Q | Reference | Template | Level |
|---|---|---|---|
| 28 | which line is closed | `g1-u12-5-closed-line` | 1 |
| 29 | which line is open | `g1-u12-5-open-line` | 1 |
| 30 | every closed line on the page (recast) | `g1-u12-5-all-closed` | 3 |
| 31 | the ends meet — open or closed? | `g1-u12-5-ends-meet` | 2 |
| 32 | how many open lines | `g1-u12-5-count-open` | 3 |

**U12.6 `msgavsi-formebi`** — similar and congruent shapes (Q33–Q37)

| Q | Reference | Template | Level |
|---|---|---|---|
| 33 | which shape appears twice | `g1-u12-6-two-the-same` | 1 |
| 34 | which two are of one family | `g1-u12-6-same-form` | 2 |
| 35 | one shape at two sizes | `g1-u12-6-different-sizes` | 2 |
| 36 | match equal shapes (recast) | `g1-u12-6-match-same` | 3 |
| 37 | every triangle on the page (recast) | `g1-u12-6-all-triangles` | 3 |

**U12.7 `formebi-cxovrebaSi`** — shapes in daily life (Q38–Q42)

| Q | Reference | Template | Level |
|---|---|---|---|
| 38, 41 | what shape is this object | `g1-u12-7-object-shape` | 1 |
| — | a flat shape behind a familiar object | `g1-u12-7-flat-behind-object` | 1 |
| 41 | which object could be this solid | `g1-u12-7-which-object` | 2 |
| 40 | match objects to solids (recast) | `g1-u12-7-match-daily` | 2 |
| 42 | every cube-shaped object (recast) | `g1-u12-7-all-cubes` | 3 |

**U12.8 `formebiT-agwera`** — describing objects by shape (Q43–Q46)

| Q | Reference | Template | Level |
|---|---|---|---|
| 43 | the object with a three-cornered shape | `g1-u12-8-triangle-object` | 1 |
| 45 | four sides and four right angles — **both** figures | `g1-u12-8-description` | 2 |
| 46 | two flat round faces and a curved side | `g1-u12-8-cylinder-object` | 2 |
| 44 | a two-part description | `g1-u12-8-two-part` | 3 |

**U12.9 `simetria`** — symmetry (Q47–Q50)

| Q | Reference | Template | Level |
|---|---|---|---|
| 47, 49 | which of four lettered pictures is symmetric (vertical) | `g1-u12-9-which-symmetric` | 1 |
| 48 | true or false: is this line an axis | `g1-u12-9-is-axis` | 2 |
| 50 | complete the other half (recast from drag-and-drop) | `g1-u12-9-complete-half` | 3 |
| 49 | the same check across the horizontal axis | `g1-u12-9-horizontal` | 3 |

## Deviations from the specification

Four, all forced by the runner and all recorded rather than hidden.

- **Drag-and-drop → „which row pairs them all correctly“** (Q4, Q12, Q18, Q26,
  Q36, Q40, Q50). `PracticeSession` marks exactly one option and has no drop
  targets. Each matching question offers one true pairing and three that are the
  same pairing with one or more pairs slipped, so checking an answer still means
  checking every pair — the thing the drag task measured. Q50 is a further
  reduction: the child chooses the right-hand half rather than placing cells.
- **Multi-select → „choose the complete list“** (Q6, Q15, Q21, Q30, Q37, Q42).
  One option names every member that fits; each other option omits one, adds one
  that does not fit, or swaps one. The templates hand the generator their whole
  option list, and the generator rejects any list where the answer is not present
  exactly once — so the recast cannot quietly collapse to „one obvious set among
  nothing“.
- **A grid cannot be laid out side by side.** The runner renders one `visual`, so
  a left half and its options cannot sit next to each other as the reference
  drawing shows. The half is drawn four wide with the axis as its right edge, and
  the options are the two-wide blocks that would sit on the other side.
- **Nothing is drawn to scale.** A text picture prints glyphs at one size, so
  „the same shape at two sizes“ (Q35) says which is which in the picture.

Two specification questions were rewritten rather than merely recast, both of them
the ones the specification itself flags:

- **„Which shape can roll?“** has three defensible answers — the sphere, the can
  and the cone all roll. Rule 10 forbids it as written, so rolling is only ever
  asked of the solid that *only* rolls (`rolls-only`, answer: the sphere), and the
  two-surface question is a list question where both answers are expected
  (`stands-and-rolls`, answer: the cylinder and the cone).
- **„Four sides and all four corners right angles“** fits both the square and the
  rectangle. The list form accepts both (`description`), and the single-answer
  form adds „and all four sides equal“ (`description-one`) — except that the
  single-answer form did not survive the fifty-template budget, so the second
  form of the answer lives in the same template's option set: „square“ alone is a
  deliberate wrong option there, and a test pins that the answer names both.

## What is honestly ambiguous, and how each is closed

| Ambiguity | How the template closes it |
|---|---|
| „Which shape rolls?“ | asked only as „only rolls, no flat surface“ |
| „Which four-sided shape?“ | both square and rectangle are accepted |
| „Is a general triangle symmetric?“ | `△` draws a general triangle, which has no axis — answered „no“ |
| Two open lines share the name „ღია კუთხე“ | option lists are built from `OPEN_NAMED`, which keeps one per name |
| A matching row that repeats a name | pairings are permutations, so every name appears once |
| An identification option that prints the name asked for | glyph questions offer glyphs; naming questions offer names |

## Capacity

A perfect session needs 35 distinct questions per level. Measured over 160 draws
per subtopic and level, the thin cells are `gverdebis-datvla` and `simetria` at
level 1 — both hold two templates that each ask one counting or symmetry question
about one figure. `session-length.test.ts` plays every U12 subtopic through to
100 points and it does not run dry, but the margin at level 1 is small, and a
third template at that level is the obvious next addition.

## Defects the first draft had

Six, none of them visible to the type checker:

- **Every symmetry answer was empty.** The mirror was computed as
  `width − 1 − col` on a four-wide picture whose half already sat at the left
  edge, so the mirrored cells landed outside the grid and `grid` silently dropped
  them. The results were still „correct by construction“, which is exactly why no
  assertion caught it: the empty picture was symmetric, and the answer was the
  empty picture. Fixed by folding each half across its own two-column width and
  then shifting it right.
- **The cube was listed as rolling.** `standsAndRolls` was set to `true` for the
  cube in the first `geometry.ts`, which made „stands and rolls“ a three-item
  answer with a cube in it. `stands` and `rolls` are now separate facts, and the
  cube is `stands: true, rolls: false`.
- **Identification questions printed the answer.** „Which of these is the square“
  offered options reading „□ კვადრატი“ — the glyph *and* the name. Questions now
  offer either glyphs or names, never the pair.
- **Georgian case endings were glued on with a hyphen.** „მართკუთხედი-ს“ in nine
  templates' prompts. All of them call `dative()` now, which drops the final `-ი`
  and appends `-ს`: მართკუთხედს, სამკუთხედს, წრეს.
- **„Ends meet“ was illustrated by a picture that did not.** The glyph was drawn
  independently of the sentence, and came out open under a sentence that said the
  ends met. The picture is now drawn from the answer.
- **Option sets collapsed.** „All the closed lines“ offered three options when the
  drawn page held one closed line, and „all the cubes“ three when it held one
  cube. Both now constrain the page so four distinct answers exist, and a test
  fails any genuine choice question that offers fewer than four.

A seventh was a wording bug rather than a geometry one: „which shapes' *count*
equals four“ was meant to be „which shapes *have* four sides“, and read as
nonsense in Georgian until a reviewer looked at the rendered prompt.

## What the tests do not cover

- **No screen reader or keyboard pass** on the lettered pictures. The labels `[ა]`
  … `[დ]` are read as text, which may be worse than an unlabelled grid.
- **A reading-level review by a teacher.** The Georgian is checked for being real
  Georgian, for the `-ს` forms and for one sentence per question, not for whether
  a six-year-old will follow „მარცხენა ნახევარი მოცემულია“.
- **Visual scale.** A glyph is a glyph: „big“ and „small“ are words here, not
  sizes, and no test can tell whether that reads clearly.

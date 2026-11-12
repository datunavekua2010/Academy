# U10 — რაოდენობის მოდელები (quantity models)

Grade 1, `topicId: 'raodenobis-modeli'`. 49 templates over 5 subtopics, three
levels each. Every model is drawn from the same drawn value that produces the
answer, so the picture and the sentence cannot disagree.

## The one idea this unit must not break

A model is *not* decoration. In every other unit a picture supports a question;
here the picture **is** the question, half the time. So the renderer is
built the other way round from the number: `tensOf`/`onesOf` are the only way
in, and the text, the picture and the answer all derive from the same value.

Two consequences worth stating, because both are easy to get wrong:

- **A ten is one bar, not ten cubes.** `🟦░░░░░░░░▌` is a labelled bar. Ten
  separate `🟦` glyphs would read as ten loose ones, which is precisely the
  misconception the unit exists to remove. There is a test
  (`never draws a ten as ten separate cubes`) that fails if any picture contains
  a bare `🟦` not followed by the ruler.
- **A colour named in the sentence must be the colour drawn.** The story „2 tens
  of red balls and 5 blue“ draws red bars and blue cubes; the block colour is a
  parameter of `tenBar` for exactly this reason. Caught in review: the first
  draft drew red tens in the default blue.

## Reference question → template

**U10.1 `ateuli-erteuli-modeli`** — tens and ones (Q1–Q8)

| Q | Reference | Template | Level |
|---|---|---|---|
| 1 | 3 tens, 2 ones → which number | `g1-u10-1-model-number` | 1 |
| 2 | how many tens and ones in 47 | `g1-u10-1-tens-and-ones-of` | 1 |
| 3 | choose the model for 26 | `g1-u10-1-choose-model` | 1 |
| 4 | 5 tens and 0 ones | `g1-u10-1-round-tens` | 1 |
| 5 | 4 tens, 7 ones — how many ones in all | `g1-u10-1-total-ones` | 2 |
| 6 | 6 tens and an unknown, 64 in all | `g1-u10-1-missing-ones` | 2 |
| 7 | match number to model (4 numbers) | `g1-u10-1-review-match` | 2 |
| 8 | count every block in the model | `g1-u10-1-count-blocks` | 3 |
| 43 | 9 tens and 2 ones (review) | `g1-u10-1-review-read` | 1 |

**U10.2 `modelidan-ricxvi`** — number from a model (Q9–Q16)

| Q | Reference | Template | Level |
|---|---|---|---|
| 9 | 2 tens, 5 ones → write it | `g1-u10-2-model-to-number` | 1 |
| 10 | 7 tens and 3 ones, pick the number | `g1-u10-2-words-to-number` | 1 |
| 11 | 8 tens, no ones | `g1-u10-2-tens-only` | 1 |
| 12 | 3 tens 9 ones, take one cube away | `g1-u10-2-one-less` | 2 |
| 13 | how many to add to reach the next ten | `g1-u10-2-up-to-next-ten` | 2 |
| 14 | ten more than the model | `g1-u10-2-ten-more` | 3 |
| 15 | add 10 ones to the model | `g1-u10-2-add-ten-ones` | 3 |
| 16 | two models, which number is larger | `g1-u10-2-which-model-larger` | 3 |

**U10.3 `ricxvidan-modeli`** — model from a number (Q17–Q24)

| Q | Reference | Template | Level |
|---|---|---|---|
| 17 | 34 → choose the model | `g1-u10-3-number-to-model` | 1 |
| 18 | 60 → how many tens and ones to draw | `g1-u10-3-round-draw` | 1 |
| 19 | build 28 (drag tiles) | `g1-u10-3-build-model` | 1 |
| 20 | which model matches 51 | `g1-u10-3-choose-matching` | 2 |
| 21 | model is one ten short — complete it | `g1-u10-3-complete-model` | 2 |
| 22 | make the number with 7 tens and 4 ones | `g1-u10-3-make-number` | 2 |
| 23 | 63 drawn two ways, second with ones only | `g1-u10-3-two-ways` | 3 |
| 24 | model one ten short of 72 | `g1-u10-3-ten-short` | 3 |
| 47 | which model shows ten fewer than 72 | `g1-u10-3-review-ten-less` | 2 |
| 49 | describe 58 by its digits | `g1-u10-3-review-description` | 3 |

**U10.4 `ateulidan-erteulebamde`** — tens to ones and back (Q25–Q32)

| Q | Reference | Template | Level |
|---|---|---|---|
| 25 | 3 tens = how many ones | `g1-u10-4-tens-to-ones` | 1 |
| 26 | 50 ones = how many tens | `g1-u10-4-ones-to-tens` | 1 |
| 27 | match tens to ones (3 pairs) | `g1-u10-4-match-tens-to-ones` | 1 |
| 28 | how many ones in 6 tens and 4 ones | `g1-u10-4-tens-and-ones-total` | 2 |
| 29 | 37 ones = how many tens and ones | `g1-u10-4-ones-to-tens-and-ones` | 2 |
| 30 | add to four tens to make 47 | `g1-u10-4-add-to-tens` | 2 |
| 31 | 6 tens and 13 ones — regroup | `g1-u10-4-regroup` | 3 |
| 32 | 84 ones as tens and ones | `g1-u10-4-split-ones` | 3 |
| 44 | 80 → how many tens and ones (review) | `g1-u10-4-review-round` | 1 |
| 48 | 5 tens and 12 ones (review) | `g1-u10-4-review-extra-ones` | 3 |

**U10.5 `sawyisi-raodenoba`** — finding the required quantity (Q33–Q42)

| Q | Reference | Template | Level |
|---|---|---|---|
| 33 | 3 tens of pencils | `g1-u10-5-tens-of-things` | 1 |
| 34 | 24, how many missing to reach 30 | `g1-u10-5-missing-to-next-ten` | 1 |
| 35 | 2 tens red + 5 blue | `g1-u10-5-two-colours` | 1 |
| 36 | 35 cubes, remove to leave 20 | `g1-u10-5-remove-to-target` | 2 |
| 37 | 28 and 34 — how many more | `g1-u10-5-how-many-more` | 2 |
| 38 | 4 tens, how many ones to reach 46 | `g1-u10-5-add-ones-to-tens` | 2 |
| 39 | 52 books, 10 taken | `g1-u10-5-take-a-ten` | 2 |
| 40 | 5 tens 8 ones, then 2 more tens | `g1-u10-5-add-tens` | 3 |
| 41 | 73 across two models, first has 37 | `g1-u10-5-missing-on-second` | 3 |
| 42 | 67, remove 2 tens, add 4 ones | `g1-u10-5-two-steps` | 3 |
| 46 | 4 tens 9 ones, add to reach 60 (review) | `g1-u10-5-add-to-target` | 2 |
| 50 | 6 tens 4 ones, remove 2 tens add 3 (review) | `g1-u10-5-review-two-steps` | 3 |

Q45 (match 4 models to numbers) is `g1-u10-1-review-match`.

## Recasts, and why

**The engine marks one answer per question.** The specification asks for
several shapes the runner cannot represent, and each was recast without
changing the reasoning it tests. All are marked in the source.

1. **Q2, Q18, Q22, Q29, Q32 — „two numbers“ (tens *and* ones).** Graded as one
   ordered compound answer, `„3, 2“`, the device U07 and U09 already use. Both
   wrong options are order/place errors, so the digits themselves are never
   wrong — only the reading of which is which.

2. **Q7, Q27, Q45 — „match each number to its model“ (drag & drop).** The runner
   supports ordering (`shuffle`) but not pairing, and an ordering answer would
   not be the question. Each is recast as a **four-picture choice**: one model,
   four numbers, or one number, four models. Because the options are *pictures*,
   the test reads them back glyph by glyph and asserts exactly one of them
   renders as the target — a set of four that happened to contain two identical
   drawings would be two right answers.

3. **Q19, Q21 — drag & drop building a model from blocks.** Recast as „how many
   tens and how many ones must the model have“, answered as the digit pair.
   Building by dragging would have been the same knowledge with more motor
   skill, and the runner's one-answer rule makes the pair the honest form.

4. **Q23 — two models of the same number.** The second model has *n* ones, and
   the specification itself notes that drawing 63 separate cubes is not
   required. It is drawn **grouped in tens with the remainder after them**
   (`🟨×10 | 🟨×10 | … | 🟨×3`), which is what a teacher draws. The answer is the
   count of ones, i.e. the number itself — the *point* of the question is that it
   takes that many cubes.

## Rules the tests enforce

Numbering follows the specification's eight technical requirements, and each is
checked in `tests/u10-templates.test.ts`:

1. **Unique template ids** — `covers every subtopic at every level` plus the
   catalog's own uniqueness test.
2. **The answer is computed, never stored** — every answer re-derived in
   `U10 arithmetic is computed from what is printed`.
3. **Three plausible distractors, exactly one right** — `offers plausible
   place-value mistakes` requires every wrong option to be a real slip (digits
   swapped, a ten out, or one out); `offers exactly one model option` counts
   matching pictures.
4. **The picture always matches the text and the answer** — the central test.
   `draws the model the answer comes from` reads the rendered picture back by
   counting glyphs and asserts it equals the number in the sentence. It only
   trusts the glyphs, never the template's own variables.
5. **Difficulty** — simple: direct recognition; medium: one step or one
   re-encoding; hard: two steps or two models compared.
6. **Results are stored** — template id, drawn params, answer, level and score
   are on the generated question and the session record.
7. **Automatic quality checks** — the whole suite runs every template at every
   level.
8. **Q23's grouped drawing** — `group the ones-only model` asserts groups of ten
   with at most one remainder.

## Capacity

Distinct questions per subtopic, 600 seeds per level, after de-duplication:

| Subtopic | L1 | L2 | L3 |
|---|---|---|---|
| `ateuli-erteuli-modeli` | 315 | 234 | 72 |
| `modelidan-ricxvi` | 180 | 144 | 725 |
| `ricxvidan-modeli` | 153 | 297 | 242 |
| `ateulidan-erteulebamde` | 90 | 208 | 232 |
| `sawyisi-raodenoba` | 318 | 841 | 1640 |

A perfect session needs 35 distinct questions per level; the thinnest cell is 72.

## Defects the first draft had

Three, all invisible to the type checker, and two of them caught only by
reading the rendered output:

- **The ones were drawn twice.** `g1-u10-4-ones-to-tens` shows a grouped count
  and can carry a remainder. `grouped(n)` already ends with that remainder as
  its own group, and the visual appended it again — „90 ones“ was drawn as 92.
  The test that reads pictures back caught it as a two-block disagreement.

- **A dependent variable drawn before its source.** `g1-u10-1-missing-ones`
  declared `o` (the missing ones, derived from the total) *before* `total`.
  The generator draws in declaration order, so `o` read `undefined` and every
  attempt failed with „answer is not a finite number“. Capacity alone would have
  shown it as a single-question subtopic; the generation error is what named it.

- **Red tens, blue draw.** `g1-u10-5-two-colours` describes red and blue groups
  but drew every ten in the same blue. The counts were right, so every numeric
  assertion passed. Colour is part of what the sentence says.

## A real bug in session start, surfaced by this unit

`tests/session-length.test.ts` plays every real subtopic to 100 and asserts no
question is shown twice. It started failing about one run in three after U10
landed — in **U06, U07 and U08 subtopics**, not U10, because adding templates
shifts the shared random stream.

That looked like a flaky test. It was not. An investigation found the real
cause, and it is in the app:

- **Question ids are `template~seed`.** Two *different* templates can draw the
  same visible question — two number-line walks that happen to start at 3 and
  take two steps read identically, down to the picture.
- **`startSession` queued the batch without checking what the student would
  see.** Both halves of such a pair went into the opening queue, so a student
  could be asked the same question twice in a row. Measured at **39 sessions in
  200** — roughly one in five, from the app's own unseeded batch draw, not from
  anything the test did.
- **`advance` de-duplicated the queue, but only within the queue.** A repeat
  that was already answered and then queued again under a second id survived.

Both are now fixed: `startSession` filters its opening queue by `shownKey`, and
`advance` drops any queued question whose visible form was already shown this
session. The duplicate rate went from 39/200 to **0/200**.

The test helper was *also* wrong, in a way that hid this for a while: it queued
whatever the refill returned, so a batch of four repeats was queued and shown.
It now avoids what has been shown *and* what is already waiting, keeps only
genuinely unseen questions, and retries a few times before concluding the
material is exhausted.

Ten consecutive runs of the file are clean. The fix does not depend on which
unit shifts the random stream next, which is the point.

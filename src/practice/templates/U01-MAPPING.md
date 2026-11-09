# U01 — the 60 reference questions, mapped to templates

Reference: *U01: საგნების მდებარეობა და შედარება* — 60 questions over
U01.1–U01.8, each with three levels.

The 60 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves that nothing in the document is unaccounted for. Shipping the 60 as a
fixed pool was explicitly ruled out.

Current state: **43 templates** across the eight subtopics.

---

## U01.1 — მარცხნივ, შუაში, მარჯვნივ (6 templates)

| Q | Question shape | Template | Level |
|---|---|---|---|
| 1 | which object stands in the middle | `g1-u01-1-name-position` | 1 |
| 2 | which object stands on the left | `g1-u01-1-name-position` | 1 |
| 3 | which is **second from the left** | `g1-u01-1-ordinal-from-left` | 2 |
| 4 | which is **immediately left of** the cup | `g1-u01-1-neighbour-of` | 2 |
| 5 | ends given, which toy is in the middle | `g1-u01-1-infer-middle` | 3 |
| 6 | Nino is third; who stands immediately left of her | `g1-u01-1-neighbour-by-ordinal` | 3 |

Also present from the earlier pass: `g1-u01-1-which-position` (name the position
of a named object — the inverse of Q2, level 2).

## U01.2 — ზემოთ, ქვემოთ, გვერდით (4)

| Q | Question shape | Template | Level |
|---|---|---|---|
| 7, 8 | where is the bird / the ball | `g1-u01-2-where-is-it` | 1 |
| 9 | which **sentence** describes the picture | `g1-u01-2-true-sentence` | 2 |
| 10 | which flower is in the middle | `g1-u01-1-name-position` (same reasoning) | 1 |
| 11, 22 | which of three stacked objects is highest / lowest | `g1-u01-2-extreme-of-three` | 3 |
| 12 | which object is above / below | `g1-u01-2-name-the-object` | 2 |

## U01.3–U01.6 — comparing length, height, weight, width (24)

Each of the four subtopics carries the same six forms, built from one
`MeasureSpec` so a topic cannot silently lose a form:

| Form | Template suffix | Level | Q examples |
|---|---|---|---|
| which is longer / taller / heavier / wider | *(base id)* | 2 | 13, 15, 19, 25, 27, 30, 31, 33 |
| which is **shorter / lower / lighter / narrower** | `-less` | 2 | 14, 20, 26, 32 |
| **how much more** (subtract) | `-difference` | 3 • typed | 23 |
| the two are **equal** | `-equal` | 2 | 16, 34 |
| the **largest of three** | `-largest-of-three` | 3 | 21, 35 |
| the **smallest of three** | `-smallest-of-three` | 3 | 29 |

Plus `g1-u01-5-bag-balance` (level 3) for Q28 — which side of a balance sinks.

Six forms × four subtopics = 24, of which U01.4 (height) has no "equal" or
"smallest-of-three" because the reference never asks them there.

## U01.7 — ყველა და ზოგიერთი (7)

| Q | Question shape | Template | Level |
|---|---|---|---|
| 37, 38 | is "all are red" true | `g1-u01-7-is-it-true` | 2 |
| 39 | is "some are cats" true | `g1-u01-7-some-is-true` | 2 |
| 40 | which of two sentences is right | `g1-u01-7-quantifier-sentence` | 2 |
| 41 | both "all" and "some" are true | `g1-u01-7-all-and-some` | 3 |
| 42 | which sentence is **wrong** | `g1-u01-7-false-sentence` | 3 |

Also `g1-u01-7-count-in-group` (typed, level 2) and `g1-u01-7-all-taken`
(level 1).

## U01.8 — რამდენია? (4)

| Q | Question shape | Template | Level |
|---|---|---|---|
| 43–45, 49 | count one row of objects (up to ten) | `g1-u01-8-count-row` | 1 • typed |
| 46, 47, 48 | add two drawn groups | `g1-u01-8-count-groups` | 2 • typed |
| 58 | count, then take some away | `g1-u01-8-count-and-take` | 3 • typed |
| 50, 60 | a total is given, how many are the rest | `g1-u01-8-rest-are` | 3 • typed |

## Q51–Q60

The summary section recombines the shapes above rather than introducing new
ones: Q52 is a two-way comparison, Q53 an extreme of three, Q54 a "lighter"
direction, Q55 a "narrower" direction, Q56 a "all" true/false, Q57 a relation,
Q58 a count, Q59 an ordering, Q60 a remainder. All are covered by the templates
mapped above.

---

## Answer formats

The document names three formats. The engine now supports all three:

| Format | Where | Questions |
|---|---|---|
| multiple choice | everywhere else | most |
| **number entry** | `format.entry: true` | 18, 23, 43–50, 58, 60 |
| ordering | **not implemented** | 17, 24, 36, 59 |

**Number entry** renders a numeric field instead of options, and grading compares
by *value*, not spelling — ` 04` is the same answer as `4`. That is tested in
`tests/typed-answers.test.ts` and driven through the real UI in
`tests/practice-ui.test.tsx`.

**Ordering is still missing, and this is the one real gap.** Q17, Q24, Q36 and
Q59 ask the child to arrange three measures. They are currently reachable only
through `-largest-of-three` and `-smallest-of-three`, which test the same
comparison but not the same task: ordering asks for a full sequence, not one
extreme. Implementing it needs a drag-or-tap sequence control plus a
sequence-grading rule that is not "one of N options is equal to the key". That
is a UI feature rather than a template, so it is called out here rather than
faked.

## A note on Q41

The reference marks "both sentences are correct" as the answer when six green
cubes are shown — right for "all are green" and "some are green" in everyday
reading. It is implemented as written: `g1-u01-7-all-and-some`. A strict
reading of "some" as "some but not all" would make it false, so it is flagged
here for the academy to confirm which convention a six-year-old is being taught.

## Things the reference does not ask for, which the templates also avoid

- "which is beside?" — symmetric, two correct answers.
- "which is in the middle?" on an even-length row.
- naming an object that is not drawn in the picture.

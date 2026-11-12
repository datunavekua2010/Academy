# U11 — კანონზომიერებები და მიმდევრობები (patterns and sequences)

Grade 1, `topicId: 'kanonzomiereba'`. 49 templates over 4 subtopics plus a mixed
review, three levels each. Every pattern is printed by one function and answered
by another call to a function over the *same* values, so a picture and its answer
cannot disagree.

## The one idea this unit must not break

A pattern question promises something no other unit promises: that the rule a
child reads off the printed row is the rule the answer obeys. Two consequences
shape the whole file:

- **The picture and the answer come from the same values** (rule 8). A repeating
  pattern is only ever printed by `runOf(cycle, n)` and only ever answered by
  `elementAt(cycle, p)`. A growing sequence is only ever printed by
  `sequence(first, step, n)` and only ever answered by `term(first, step, p)`.
  There is no second copy of the pattern that could drift.
- **Nothing is stored that can be computed** (rules 2 and 5). The variables hold
  the cycle, the first term, the step and the position. The answer is re-derived
  on every render.

Two things had to be added to the type system's way of doing things:

- **A cycle does not fit in a `choice` variable.** Choice values are scalars, so
  a whole cycle is packed into one string (`🟢|🟡`) by `pack` and read back by
  `cycleOf`. The alternative — a variable per symbol — cannot express a cycle of
  unknown length, and the length *is* the question.
- **The step and the position are the only things a growing template may
  remember.** `term()` is `a₁ + (n − 1)d`, computed, never a running total. A
  template that carried the last term forward would give a wrong seventh figure
  the first time a constraint narrowed the range.

## Reference question → template

**U11.1 `gameorebadi`** — repeating patterns (Q1–Q10)

| Q | Reference | Template | Level |
|---|---|---|---|
| 1, 3 | continue 🔴 🔵 🔴 🔵 … | `g1-u11-1-alternate` | 1 |
| 2, 6 | two of one symbol, then another | `g1-u11-1-double-then-one` | 1 |
| 4 | fill the missing middle symbol | `g1-u11-1-fill-middle` | 1 |
| 5 | which row continues the pattern | `g1-u11-1-which-repeats` | 2 |
| 7 | two missing symbols (recast from drag-and-drop) | `g1-u11-1-two-blanks` | 2 |
| 10 | a three-symbol cycle | `g1-u11-1-three-cycle` | 2 |
| 8 | which symbol is in third place | `g1-u11-1-position-three` | 2 |
| 9 | which symbol is in fourth place | `g1-u11-1-position-four` | 2 |
| 48 | a place far down a four-symbol cycle | `g1-u11-1-position-deep` | 3 |

**U11.2 `mzardi`** — growing patterns (Q11–Q20)

| Q | Reference | Template | Level |
|---|---|---|---|
| 11, 42 | step of one | `g1-u11-2-step-one` | 1 |
| 12 | step of two | `g1-u11-2-step-two` | 1 |
| 13 | pictures growing by one | `g1-u11-2-picture-grow` | 1 |
| 14 | step of five | `g1-u11-2-step-five` | 1 |
| 15, 38 | step of three | `g1-u11-2-step-three` | 2 |
| 16 | circles growing by two, fourth figure | `g1-u11-2-circles-fourth` | 2 |
| 17, 34, 46 | the next two terms | `g1-u11-2-next-two` | 2 |
| 18 | a tower growing by a fixed number of cubes | `g1-u11-2-tower` | 2 |
| 19 | step of four, two blanks | `g1-u11-2-step-four-two` | 3 |
| 20 | growth of a given step, fifth figure | `g1-u11-2-fifth-figure` | 3 |
| 40, 47 | the sixth term from the rule | `g1-u11-2-sixth-term` | 3 |
| 50 | the seventh figure from the rule | `g1-u11-2-seventh-figure` | 3 |

**U11.3 `wesis-agwera`** — describing the rule (Q21–Q30)

| Q | Reference | Template | Level |
|---|---|---|---|
| 21 | a rising sequence, name its rule | `g1-u11-3-rule-rising` | 1 |
| 22 | a sequence of tens, name its rule | `g1-u11-3-rule-tens` | 1 |
| 23 | describe a two-symbol alternation | `g1-u11-3-rule-alternating` | 1 |
| 24, 28 | a falling sequence, name its rule | `g1-u11-3-rule-falling` | 2 |
| 25, 43 | the step, as a number | `g1-u11-3-name-the-step` | 2 |
| 26 | pick the rule that fits a growing pattern | `g1-u11-3-pick-rule` | 2 |
| 27 | a run of odd numbers, describe it | `g1-u11-3-rule-odd` | 2 |
| 29 | which number continues the rule (recast from multi-select) | `g1-u11-3-next-under-rule` | 3 |
| 30 | is a named rule the right one? (true/false) | `g1-u11-3-claim-check` | 3 |

**U11.4 `ricxviTi-mimdevroba`** — number sequences (Q31–Q40)

| Q | Reference | Template | Level |
|---|---|---|---|
| 31 | count by twos | `g1-u11-4-count-by-twos` | 1 |
| 32 | count by fives | `g1-u11-4-count-by-fives` | 1 |
| 33, 41 | count down | `g1-u11-4-count-down` | 1 |
| 35 | a single blank in the middle | `g1-u11-4-middle-hole` | 1 |
| 37 | count by tens from an odd start | `g1-u11-4-count-by-tens` | 2 |
| 34, 36, 39 | two blanks, both answers in order | `g1-u11-4-two-holes` | 2 |
| 44 | a hundred-chart leap of ten | `g1-u11-4-hundred-chart` | 2 |
| 45 | what stood before a printed run | `g1-u11-4-before-the-run` | 2 |
| 49 | two interleaved runs | `g1-u11-4-two-trains` | 3 |

**Review (Q41–Q50)** — one second form of each subtopic, still filed under its
own subtopic id so the topic's progress stays honest:

| Q | Reference | Template | Level |
|---|---|---|---|
| 41 | count down while colours alternate | `g1-u11-r-down-and-back` | 1 |
| 42 | a picture rule, asked for a distant place | `g1-u11-r-picture-then-number` | 2 |
| 43 | how much does each number grow | `g1-u11-r-step-as-number` | 2 |
| 44 | a chart leap, asked backwards | `g1-u11-r-chart-backwards` | 2 |
| 45 | what came before a run | `g1-u11-r-what-came-first` | 2 |
| 46 | two numbers, one ordered answer | `g1-u11-r-two-after` | 2 |
| 47 | the eighth term from the rule | `g1-u11-r-far-term` | 3 |
| 48 | a place far down a three-symbol cycle | `g1-u11-r-far-position` | 3 |
| 49 | two runs interleaved | `g1-u11-r-weave` | 3 |
| 50 | the rule named for a mixed pattern | `g1-u11-r-rule-mixed` | 3 |

## How the answer types in the specification were handled

| Specification | Here |
|---|---|
| single choice | `optionCount: 3` throughout, `2` for true/false |
| number input | `format: { kind: 'integer', entry: true }` — typing is the grade-1 default for a bare number |
| pattern recognition | the symbol questions: the options are the symbols of *this* cycle plus, when needed, palette symbols that are plainly not in it |
| **drag & drop** (Q7) | **recast** as an ordered two-symbol answer (`"⭐, 🌙"`). The runner has no drag target, and `shuffle` only supports ascending and descending order of numbers |
| two numbers (Q17, 19, 34, 36, 39, 46) | one ordered compound answer, `"23, 27"`, with `kind: 'text'` |
| **multi-select** (Q29) | **recast** as „which number continues the rule“. The runner marks exactly one option, so the same knowledge is asked in a form the engine can score |
| true/false (Q30) | `optionCount: 2`, and the verdict is *computed* by comparing the claimed step with the real one |

## Constraints honoured

1. **Nothing is fixed.** Every cycle, first term, step and position is drawn from
   variables. Examples in the specification informed the shapes, never the values.
2. **Answers are computed**, never stored — see the two functions above.
3. **Distractors are computed too**, and are mistakes rather than noise:
   `sequenceSlips` gives the off-by-one (`a₁ + n·d`), one step either way, and the
   term already printed; the cycle distractors are the other symbols *of that
   pattern*.
4. **Exactly one correct option**, and never a distractor that is also the answer,
   printed in the prompt, or a duplicate of another option — all asserted.
5. **A repeating pattern keeps its cycle and position; a growing one keeps its
   first term, step and position.** The values are on the generated question.
6. **`template_id`, drawn params, answer, level and result** are on the generated
   question and the session record, as for every unit.
7. **Rule 8** — the same parameters drive the picture and the answer. This is the
   property the test file exists for: it reads the *rendered row* back, works out
   the period and the step from the glyphs and numbers alone, and re-derives the
   answer.
8. **Difficulty** — easy: continue or read a short cycle, one visible step;
   medium: a missing term, two blanks, or naming the rule; hard: long cycles,
   several blanks, a place far along the run, or a figure computed from the rule.
9. **Validation before generation** — every template carries constraints for the
   things the generator cannot see: all cycle symbols distinct, the spoiler a
   third symbol, the position not a wrapped first element, the run inside one
   hundred, no negative term, and (for the true/false item) that a claim marked
   false really is false.
10. **Many examples per template** — every test runs 25–60 variations of every
    template, and capacity is measured at 600 seeds per level.

## Capacity

Distinct questions per subtopic, 600 seeds per level, after de-duplication:

| Subtopic | L1 | L2 | L3 |
|---|---|---|---|
| `gameorebadi` | 600 | 600 | 600 |
| `mzardi` | 84 | 275 | 430 |
| `wesis-agwera` | 216 | 593 | 600 |
| `ricxviTi-mimdevroba` | 570 | 600 | 40 |

A perfect session needs 35 distinct questions per level, so the thinnest cell —
`ricxviTi-mimdevroba` at level 3, with 40 — still has room for one full run and no
more. That is acceptable but deliberate: level 3 of that subtopic has a single
template, and it is the hardest material in the unit. A second hard template is
the obvious next addition.

## Defects the first draft had

Four, none visible to the type checker:

- **A descending run answered as if it were ascending.** `g1-u11-4-count-down`
  printed `19, 17, 15, 13, __` (that is, `a, a−d, a−2d, a−3d`) and answered
  `from − 4d` — one term too far, so 5 instead of 11. The template carried the
  run's *start* and subtracted the whole run again. Both descending templates now
  answer `last printed − step`, and there is a test that plays every falling run
  and demands exactly one step down.
- **A cycle packed as a nested array.** `values: (v) => [[a, b]]` type-checks
  nowhere, and the first version of it silently drew the string `" "` — a
  placeholder that rendered to nothing, which is how the „which row continues“
  question first shipped with the rows missing. Found by printing the drawn vars,
  not by any assertion. The rows now live in the options, where they belong.
- **A distractor that was printed in the prompt.** `g1-u11-2-next-two` offered
  „28, 32“ against a run ending „…, 24, 28“, so it could be picked by copying
  rather than by applying the rule. Three two-number templates had the same
  shape. They now offer a stepped-past answer and a nudged one; a test asserts
  that no option repeats a number printed in the prompt.
- **A chart question that answered a different question.** `g1-u11-r-chart-backwards`
  asked „how much does each step take off (10), given start and end“ and then
  printed a run that *ascended* from the start. It now asks for the number three
  steps back, which is what the run means.

## What the tests do not cover

- **Drag-and-drop and multi-select are not exercised**, because they do not
  exist in the runner. The two questions that needed them were recast, and the
  recasts are tested as ordinary single-answer questions.
- **A reading-level review by a teacher.** The Georgian is checked for being real
  Georgian and for consistent wording, not for whether a six-year-old will
  understand „მონაცვლეობს“.

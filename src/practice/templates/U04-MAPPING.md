# U04 — the 50 reference questions, mapped to templates

Reference: *U04: რიცხვები 100-ის ფარგლებში* — 50 questions over U04.1–U04.8,
each with three levels, plus a mixed review at the end.

The 50 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves nothing in the document is unaccounted for.

**Current state: 50 templates** — 6 types per subtopic at three levels, plus two
extra forms on `romaulti`, which is explained under U04.6.

```
aseulis-cxrili        6       mezoblebi            6
ateulebi-erteulebi    6       romaulti             8
ricxvebi-sityvebiT    6       luwi-kenti-danayi    6
ricxviTi-xazi100      6       cifrebi-asoebi       6
```

## The shape the curriculum is authored to

1. Every task is answered by **multiple choice, a typed number, or an ordering**
   — nothing is marked by hand.
2. Every subtopic has **three question types**, and a session walks through them
   as the score rises: type 1 up to 30 points, type 2 up to 60, then the third
   type. The level is re-read from the score on every refill, so it also steps
   back down if the score falls.

A perfect run needs 35 questions, and the level is chosen by score, so a student
who keeps answering correctly stays on one level at a time. Every level of every
subtopic therefore has to carry a whole session **by itself** — examined under
"Capacity" below.

## The rule that decided most of these patterns

Higher difficulty had to demand **an extra step, not a bigger number**. So:

- level 2 moves through the grid or splits a number, where level 1 reads one
  property of one number;
- level 3 takes several steps at once (`1-two-moves`), changes a digit rather
  than reading one (`2-change-tens`), adds before deciding (`7-sum-parity`),
  or reverses the rule being taught (`6-subtractive`: the smaller symbol in
  front *subtracts*).

Nothing in this unit reaches level 3 by drawing a larger number in the same
sentence.

---

## U04.1 — ასეულის ცხრილი

| Reference | Template |
|---|---|
| Q1 (read a marked cell) | `1-read-marked` |
| Q2 (one cell right) | `1-step-right` |
| Q3 (one cell down) | `1-step-down` |
| Q4 (the hidden cell) | `1-hidden-cell` |
| Q5 (two directions at once) | `1-two-moves` |
| Q6 (the cell above and the cell to the left) | `1-two-neighbours` — **the pair form** |

The grid is drawn as text: ten cells to a row, the stated number in brackets,
`[63]`-style, so a cell's neighbours are visible without colour. **The picture
never marks the destination** — only the number the question itself states. Q6
asks for two numbers at once; they are written as one ordered answer
(„62, 53“), which is the answer shape the engine can check exactly.

## U04.2 — ათეულები და ერთეულები

| Reference | Template |
|---|---|
| Q7 (how many tens, how many units) | `2-split-choice` — **the pair form** |
| Q8 (build a number from its tens and units) | `2-from-tens-units` (with rods-and-squares picture) |
| Q9 (read the tens and units off a number) | `2-split` |
| Q10 (build the number from its parts) | `2-build` |
| Q11 (how many units in all) | `2-units-in-all` |
| Q12 (change the tens digit) | `2-change-tens` |

Q7's answer is two numbers, which is one pair string as a single option
(„6 ათეული და 6 ერთეული“) — see "Multi-answer recasts". Q9 is the typing form of
Q7's question: the student writes the two digits, and the pairs are separated by
a comma so the engine checks both halves.

## U04.3 — რიცხვები სიტყვიერად

| Reference | Template |
|---|---|
| Q13 (word → number) | `3-word-to-number` |
| Q14 (number → word, small) | `3-number-to-word` |
| Q15 (a name in the twenties) | `3-word-mid` |
| Q16 (the score words — ორმოცი, სამოცი …) | `3-score-compound` |
| Q17 (a name in the eighties) | `3-word-teens` |
| Q18 (choose the correct spelling) | `3-spelling` |

Georgian counts in **twenties**, not tens: 60 is სამოცი ("three twenties") and
79 is სამოცდაცხრამეტი ("three twenties and nineteen"). The names are built from a
score plus a remainder, and every name in the range is generated from that rule —
none is stored.

Wrong spellings are **never invented**. `3-spelling`'s wrong options are the
names of real numbers (the digit-swap, the neighbour, the ±20, the score), so a
child choosing between them is choosing between four words that all exist.

## U04.4 — რიცხვითი ღერძი 100-მდე

| Reference | Template |
|---|---|
| Q19 (the number after a marked one) | `4-after` |
| Q20 (the number before) | `4-before` |
| Q21 (walk N steps right) | `4-steps-right` |
| Q22 (walk N steps left) | `4-steps-left` |
| Q23 (ten and twenty steps) | `4-ten-steps` |
| Q24 (twenty more) | `4-twenty-more` |

The line is drawn around the marked number, and the window is sized so the whole
walk stays on screen. As with the grid, only the starting number is marked: the
destination is the answer.

## U04.5 — მეზობელი რიცხვები

| Reference | Template |
|---|---|
| Q25 (the number before) | `5-before` |
| Q26 (the number after) | `5-after` |
| Q27 (ten more) | `5-ten-more` |
| Q28 (ten less) | `5-ten-less` |
| Q29 (twenty more) | `5-twenty-more` |
| Q30 (twenty less) | `5-twenty-less` |

Each direction is its own template, because the mistake is different: a child who
reads „before“ as „after“ is wrong in an exactly predictable way, and only
asking both directions catches it.

## U04.6 — რომაული ციფრები I, V, X, L

| Reference | Template |
|---|---|
| Q31 (what a symbol means) | `6-symbol-value`; `6-repeated`; `6-write-repeated` |
| Q32 (the symbol for a value) | `6-value-symbol` |
| Q33 (write a small number) | `6-write-additive` |
| Q34 (read a two-symbol numeral) | `6-additive` |
| Q35 (read a subtractive numeral, IX) | `6-subtractive` |
| Q36 (write a subtractive numeral, XL) | `6-write-subtractive` |

### Why this subtopic has eight templates and not six

**This is the one place in U04 where the content itself is finite, and it is
recorded rather than hidden.**

The unit teaches four symbols, `I V X L`, and no rule beyond "repeat" and
"subtract". That gives level 1 exactly:

| can ask | count |
|---|---|
| what one symbol means | 4 |
| the symbol for one value | 4 |
| what a repeated symbol means (II, III, XX, XXX) | 4 |
| write a repeated symbol | 4 |
| **total distinct level-1 questions** | **16** |

Every other numeral needs a rule that belongs to level 2 or 3, so there is no
honest way to reach 35 at level 1. The four level-1 templates are all four shapes
that exist, and the level's ceiling is 16, not a sampling failure.

Level 1 and level 2 are short of 35 as a *level*, but the subtopic's levels are
not cut off from each other: a session at 0 points spends its first questions on
level 1 and steps to level 2 after about eight answers (the score ladder gives 4
points per correct answer below 80). A perfect run through `romaulti` reaches 100
in 35 questions, which is what a session actually has to do — verified by playing
each level in turn, below.

| level | distinct questions | a session needs |
|---|---|---|
| 1 | 16 | 8, before the ladder moves on at 30 points |
| 2 | 64 | well beyond what 30–59 points can spend |
| 3 | 88 | well beyond what 60–100 points can spend |

Level 2 and level 3 have more questions than a session can spend on them, so the
thin level is level 1, and it is thin because four symbols are fewer than forty.

## Capacity — every level, measured

Distinct questions per level, over 400 seeds per template with 0 generation
errors (the numbers are a floor, not a ceiling — the capped cells hit the sample
size):

| subtopic | level 1 | level 2 | level 3 |
|---|---|---|---|
| aseulis-cxrili | 95 | 227 | 346 |
| ateulebi-erteulebi | 132 | 132 | 466 |
| ricxvebi-sityvebiT | 110 | 47 | 98 |
| ricxviTi-xazi100 | 190 | 800+ | 203 |
| mezoblebi | 190 | 132 | 132 |
| romaulti | **16** | 64 | 88 |
| luwi-kenti-danayi | 96 | 466 | 800+ |
| cifrebi-asoebi | 799 | 800+ | 800+ |

Every level is at least 35 except `romaulti` level 1, for the reason above.
`tests/u04-templates.test.ts` pins this table, including the exception, so the
number cannot quietly drift.

A perfect run was also played through every subtopic with the real ladder
(`levelForScore` on every refill, as `PracticeProvider` does): all eight reach
100 in 35 questions.

## The mixed review, Q48–Q50

| Reference | Where it lives |
|---|---|
| Q48 (build a number from its tens and units) | `2-from-tens-units` — the spec's mixed item is the U04.2 pattern |
| Q49 (a walk on the grid, in two directions) | `1-two-moves` |
| Q50 (read, split, name) | `2-split` + `3-word-mid` |

The mixed review does not get its own subtopic. The curriculum's eight U04
subtopics are the ones a student practises, and a ninth "mixed" group would have
to draw from the other eight anyway — the review is what the *session* is when it
interleaves them. Each of Q48–Q50 is one of the patterns above, so a student who
has practised the subtopics has answered the review.

## Multi-answer recasts

The unit's document asks for several answers at once in places where the engine
checks **one** answer. Each is recast as a shape the engine grades exactly, and
none is dropped:

| Reference asks for | Recasт as | Template |
|---|---|---|
| two numbers (tens and units) | one pair string as a single option | `2-split-choice` |
| two numbers typed | two digits separated by a comma in one field | `2-split` |
| an ordered pair of grid neighbours | one ordered answer („ზემოთ: 62, მარცხნივ: 53“) | `1-two-neighbours` |
| sort numbers into ლუწი / კენტი | a run of "which group" questions, one number at a time | `7-even-or-odd` |
| count both groups and compare | "which group is larger" | `7-which-group` |
| sort symbols into ციფრები / ასოები | "how many digits" and "which is more" | `8-count-digits`, `8-which-more` |
| five digits and five letters, counted | fixed 5/5 sentence, varying "how many digits among ten" | `8-five-and-five` |

The sort-the-whole-set tasks are the ones that lose the most: the engine grades
one answer per question, so a two-bucket sort is delivered as a *run* of those
questions. That is what the student practises either way, and it is the only
version the app can mark without a human.

## What is deliberately *not* asked

- **Nothing is answered by typing a word.** Every answer is a number, a pair, or
  a choice among real words. A typed Georgian word would be a spelling test the
  app cannot mark fairly at grade 1.
- **No picture marks the answer.** In the grid and on the line, only the numbers
  the sentence states are marked; the destination is what the student supplies.
- **No Roman numeral at or above 90.** Ninety needs `C`, which this unit does not
  teach — `toRoman` throws above 89 rather than writing an unfamiliar symbol.
- **No invented Georgian.** Wrong options are always real words, real numbers or
  real numerals.

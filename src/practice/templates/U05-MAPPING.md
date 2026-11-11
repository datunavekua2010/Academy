# U05 — the 50 reference questions, mapped to templates

Reference: *U05: შედარება და დალაგება* — 50 questions over U05.1–U05.8, each
with three levels.

The 50 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves nothing in the document is unaccounted for.

**Current state: 49 templates** — six types per subtopic at three levels, plus a
seventh on `toli-raodenoba`, which covers the spec's two identical "how many to
add" items (Q48, Q50) with one pattern.

```
meti-naklebi-toli        6    dalageba              6
Sedareba10               6    dalageba-danayi       6
Sedareba100              6    toli-raodenoba        7
ramdenit-meti            6
SeFaseba-aTeulamde       6
```

## The shape the curriculum is authored to

1. Every task is answered by **multiple choice, a typed number, or an ordering**
   — nothing is marked by hand.
2. Every subtopic has **three question types**, and a session walks through them
   as the score rises: type 1 up to 30 points, type 2 up to 60, then the third
   type. The level is re-read from the score on every refill, so it also steps
   back down if the score falls.

A perfect run needs 35 questions and the level is chosen by score, so every
level of every subtopic has to carry a whole session **by itself** — examined
under "Capacity" below.

## The two rules this unit could not be built without

### Rounding: five rounds *up*

The unit compares numbers to the nearest ten. The half-way case has to be decided
once, in one place, and never re-decided:

**0–4 units → lower ten, 5–9 units → upper ten.** `75 → 80`, `65 → 70`,
`95 → 100`. Never banker's rounding, which would send `25` down to `20` at
random.

This is a *pre-declared* rule: `nearestTen` is the only place it is written, the
explanation spells it out in words on every question (`„ერთეულია 5 — ხუთზე
მეტი, ამიტომ ზედა ათეული: 80“`), and `tests/u05-templates.test.ts` reads the rule
back off every generated question rather than trusting the helper.

### Georgian takes the singular after a numeral

`7 ვაშლი`, never `7 ვაშლები`. Every counted noun in this unit is printed directly
after its number, so a stored plural would be a grammar fault on screen. The
vocabulary is therefore stored singular-only, and a test fails if a plural ever
reaches a prompt.

The same trap has two more faces, both of which cost a rewrite here:

- **A person's name cannot be borrowed by a story about objects.** „რამდენით მეტი
  აქვს მარიამს?“ only works when the two quantities are hers.
- **Case endings are irregular**, so no template appends an ending to a noun:
  მსხალი → მსხლით, not მსხალიით. Stories that would need an instrumental ask about
  the *place* instead („რამდენით მეტია პირველ თეფშზე?“).

---

## U05.1 — მეტი, ნაკლები, ტოლი

| Reference | Template |
|---|---|
| Q1 (the sign between two numbers 0–10) | `1-sign` — **drawn**, both quantities shown |
| Q2 (two equal groups: which is greater, or equal) | `1-two-groups` — **three options**, equal is a real answer |
| Q3 (fill the sign, `8 __ 3`) | `1-fill-sign` |
| Q4 (which group has more) | `1-which-group` |
| Q5 (three signs at once) | `1-three-signs` — **one ordered answer** |
| Q6 (how many more apples) | `1-how-many-more` — typed |

Q1 is drawn rather than printed as bare digits: at this level the sign is being
read off two piles, and a bare `8 ? 3` is Q3's question. Q5 asks for three signs
in one answer (`>,<,=`), which is the only shape the engine can grade exactly;
the constraint stops all three being the same sign, since that would be three
copies of one comparison. Q2 offers „პირველი მეტია / მეორე მეტია / ტოლია“, so
equality is tested as a first-class answer rather than a leftover.

## U05.2 — შედარება 10-ის ფარგლებში

| Reference | Template |
|---|---|
| Q7 (which is greater: 3 or 6?) | `2-larger` |
| Q8 (which is less?) | `2-smaller` |
| Q9 (sign `7 __ 9`) | `2-sign` |
| Q10 (find a number between 4 and 6) | `2-between` — **the answer is constructed** |
| Q11 (largest of four) | `2-largest-of-four` |
| Q12 (smallest of four) | `2-smallest-of-four` |

Q10 is the unit's one genuinely open-ended question: „4 __ 6 — any correct
number“ has several right answers, and the engine checks **one**. It is recast so
the gap is exactly one wide, which makes the answer unique while the *pair* still
varies (16 distinct questions) — see "Multi-answer recasts".

Q11 and Q12 print four numbers in one run and ask for the extreme; the answer is
always one of the four, so a child who has not grasped the order still has a
process (compare them pairwise) that works.

## U05.3 — შედარება 100-ის ფარგლებში

| Reference | Template |
|---|---|
| Q13 (which is greater, 34 or 43?) | `3-larger` |
| Q14 (equal sign, `56 __ 56`) | `3-equal` |
| Q15 (72 vs 68) | `3-larger-close` |
| Q16 (smallest of three) | `3-smallest-of-three` |
| Q17 (`67 __ 76`) | `3-reversed` |
| Q18 (largest of four, two-digit) | `3-largest-of-four` |

Q14 asks for `=` on a pair that is sometimes equal and sometimes one digit apart,
so a student cannot answer `=` by pattern-matching the shape of the question.
Q15's two numbers share a tens digit, so the units decide it — the tens digit is
not a shortcut.

Q17 is the reversed-digit comparison: `67` and `76` are the same two digits in
the other order, and only the places distinguish them. It has the narrowest
capacity in the unit (64 distinct) because the pair really only varies over the
digits — still well clear of a session.

## U05.4 — რამდენით მეტი

| Reference | Template |
|---|---|
| Q19 (7 and 4 pencils) | `4-pencils` |
| Q20 (two plates) | `4-plates` |
| Q21 (flowers in a garden) | `4-flowers` |
| Q22 (cubes in two boxes) | `4-cubes` |
| Q23 (stickers, 30s) | `4-stickers` |
| Q24 (books on a shelf, 30s) | `4-books` |

Every one of the six is a *story* with its own closing question and its own
subject matter — the counts rise from single digits (Q19–Q22) to the thirties
(Q23, Q24), but the sentence stays grammatical at every size. All six are typed
numbers.

The wrong options are always real mistakes rather than noise: the larger
quantity, the smaller quantity, the answer plus one, and the sum. A child who
adds instead of subtracts lands on a wrong option that a teacher would recognise.

## U05.5 — უახლოეს ათეულამდე შეფასება

| Reference | Template |
|---|---|
| Q25 (closer to which ten, rounding down) | `5-nearest-ten` — 2 choices, units 1–4 |
| Q26 (closer to which ten, rounding up) | `5-nearest-ten-up` — 2 choices, units 6–9 |
| Q27 (round a small number) | `5-round-small` — typed |
| Q28 (round a large number) | `5-round-large` — typed |
| Q29 (a number ending in five) | `5-round-half` — 2 choices, the rule made visible |
| Q30 (round three numbers, in the same order) | `5-round-three` — **one ordered answer** |

Q25 and Q26 are the same *sentence* but not the same *question*: Q25's nearer ten
is always the lower one, Q26's always the upper one. A child who has learned
"round down" passes Q25 and fails Q26, which is exactly what the pair is for. So
they stay two templates even though the prompt text is shared.

Q29 is the half-way case and is a choice between the two neighbouring tens rather
than a typed number, because a typed `80` cannot distinguish "I know the rule"
from "I guessed the upper ten". The explanation always states which side of the
half the units fell on.

Q30 asks for three rounded numbers as one ordered answer (`10, 60, 100`) — the
same shape as Q5.

## U05.6 — დალაგება

| Reference | Template |
|---|---|
| Q31 (three numbers ascending) | `6-three-asc` |
| Q32 (three numbers descending) | `6-three-desc` |
| Q33 (four ascending) | `6-four-asc` |
| Q34 (four descending) | `6-four-desc` |
| Q35 (five ascending) | `6-five-asc` |
| Q36 (five descending) | `6-five-desc` |

Both directions are templates of their own, for the same reason U04.5 splits
`before` and `after`: a child who reverses the rule is wrong in an exactly
predictable way, and only asking both catches it.

## U05.7 — დალაგება — გადაადგილება

| Reference | Template |
|---|---|
| Q37 (3–4 numbers, 1–10, ascending) | `7-small-asc` |
| Q38 (3–4 numbers, 1–10, descending) | `7-small-desc` |
| Q39 (4 numbers, 10–100, ascending) | `7-four-asc` |
| Q40 (5 numbers, 10–100, descending) | `7-five-desc` |
| Q41 (5 numbers, 1–100, ascending) | `7-five-asc` |
| Q42 (6 numbers, 1–100, descending) | `7-six-desc` |

These are the drag-and-drop questions (`shuffle` mode): the student moves the
numbers into slots. The engine checks the **final sequence**, not merely that
every number was moved — a set that is fully used but in the wrong order is
wrong, and `tests/u05-templates.test.ts` reads every answer back into the sorted
order to prove it.

The answer key is a list of *display positions*, so it changes whenever the draw
does: `6-five-asc` alone reaches 117 distinct arrangements over 400 draws.

## U05.8 — ტოლი რაოდენობა

| Reference | Template |
|---|---|
| Q43 (equal groups) | `8-equal-groups` |
| Q44 (which group has fewer) | `8-fewer-group` |
| Q45 (total objects on a plate) | `8-altogether` — typed |
| Q46 (how many more cubes) | `8-more-in-first` |
| Q47 (compare basket totals for equality) | `8-sum-compare` |
| Q48 (how many to add to equalise) | `8-balance` |
| Q49 (total of three boxes) | `8-three-boxes` |
| Q50 (how many to add to equalise) | `8-balance` — the second draw |

`8-balance` covers both Q48 and Q50: they are the same task with different
numbers, and a second template would be the same question twice. The gap is
always the answer, and the larger group is always printed first so the sentence
reads in the direction a child expects.

`8-altogether` and `8-three-boxes` are typed totals, not comparisons — they are
here because a child can only compare two quantities once they can total each
side, which is the step Q47 asks for.

## Capacity

Distinct questions per level, over 600 seeds per template with 0 generation
errors (the numbers are a floor, not a ceiling — the capped cells hit the sample
size):

| subtopic | level 1 | level 2 | level 3 |
|---|---|---|---|
| meti-naklebi-toli | 863 | 883 | 1031 |
| Sedareba10 | 220 | 136 | 1158 |
| Sedareba100 | 905 | 992 | 660 |
| ramdenit-meti | 768 | 679 | 1028 |
| SeFaseba-aTeulamde | 64 | 81 | 608 |
| dalageba | 769 | 1200 | 1200 |
| dalageba-danayi | 1135 | 1200 | 1200 |
| toli-raodenoba | 884 | 1144 | 1527 |

Every level clears 35 — the threshold a session needs — by at least a factor of
two, and most by an order of magnitude. `SeFaseba-aTeulamde` level 1 is the
tightest at 64, because a two-choice question between neighbouring tens has only
the number itself to vary; it is still nearly twice a session.

A perfect run was also played through every subtopic with the real ladder
(`levelForScore` on every refill, as `PracticeProvider` does): all eight reach
100 in 35 questions.

## Multi-answer recasts

The unit's document asks for shapes the engine cannot grade verbatim. Each is
recast as a shape it grades exactly, and none is dropped:

| Reference asks for | Recast as | Template |
|---|---|---|
| three signs in one answer (Q5) | one ordered answer, `>,<,=` | `1-three-signs` |
| any number strictly between 4 and 6 (Q10) | a one-wide gap, so the answer is unique | `2-between` |
| three rounded numbers (Q30) | one ordered answer, `10, 60, 100` | `5-round-three` |
| which group is greater, with equality allowed (Q2) | three options, „ტოლია“ being one | `1-two-groups` |
| drag the numbers into order (Q37–Q42) | `shuffle` ordering; the final sequence is checked | `7-*` |
| how many to add so the two sides match (Q48, Q50) | the gap, typed | `8-balance` |

The one place a question is **split** rather than recast is Q25/Q26: two
near-identical prompts that test opposite mistakes are two templates, not one
with a hidden branch.

## What is deliberately *not* asked

- **Nothing is answered by typing a word.** Signs, numbers and orderings only.
- **No picture marks the answer.** Drawn groups show the quantities being
  compared; the sign or the count is what the student supplies.
- **No invented Georgian.** Wrong options are real numbers, real signs, or real
  quantities drawn on the page.
- **No plurals after a numeral**, and no sentence that borrows a person's name
  for an object.
- **No number is rounded to a ten it already is.** `30 → 30` asks nothing, so the
  rounding templates exclude exact tens by constraint rather than offer a
  question with no choice in it.

# U02 — the 50 reference questions, mapped to templates

Reference: *U02: რიცხვები 20-ის ფარგლებში* — 50 questions over U02.1–U02.7, each
with three levels, plus a summary set.

The 50 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves nothing in the document is unaccounted for.

## The shape the curriculum is authored to

Two rules from the academy's document decide the shape of this library:

1. Every task is answered by **multiple choice, a typed number, or an ordering** —
   nothing is marked by hand.
2. Every subtopic has **exactly three question types**, and a session walks
   through them as the score rises: type 1 up to 30 points, type 2 up to 60,
   then the third type. The level is read from the score on every refill, so it
   also steps back down if the score falls.

**Current state: 21 templates — 3 types × 7 subtopics.** A perfect run needs 35
questions and the level is chosen by score, so a student who keeps answering
correctly stays on level 3 and a student who keeps answering wrong stays on
level 1. Each level must therefore carry a whole session **by itself**. Every
template here produces at least 36 distinct questions; a test pins that
(`tests/u02-templates.test.ts`).

## U02.1 — რიცხვები 1-დან 10-მდე

| Reference | Pattern |
|---|---|
| Q1 (stars → number), Q2 (word → number) | `1-quantity-to-number` — the quantity is given as a drawn row or as a word, the digit is chosen |
| Q3 (missing in `1,2,3,__,5`) | `1-missing-in-run` — typed number |
| Q4 (how many circles) | `1-quantity-to-number` (picture form) |
| Q5 (which row has exactly 6) | `1-pick-the-row` — three real rows, one has the count |
| Q6 (order `8,3,6,1`) | `2-order-numbers` (U02.2) — the same ordering skill |

Note Q1 and Q4 are one pattern seen twice: a quantity is shown and the digit is
chosen. Q2 is the same question with the quantity named instead of drawn.

## U02.2 — რიცხვები 11-დან 20-მდე

| Reference | Pattern |
|---|---|
| Q7 (which number is თერთმეტი) | `2-name-the-number` (word form) |
| Q8, Q11 (one ten and 5 ones) | `2-name-the-number` (tens form) |
| Q9 (missing in `13,14,__,16`) | `2-missing-in-run` — typed number |
| Q10 (how many ones in two tens) | `2-name-the-number` (20 has no units form) |
| Q12 (order `19,12,16,20`) | `2-order-numbers` — **ordering** |

## U02.3 — რიგობითი რიცხვები

| Reference | Pattern |
|---|---|
| Q13 (who is first) | `3-who-is-nth` — the queue is printed, the place is drawn |
| Q14 (which place is silver) | `3-who-is-nth` — a medal is a name for a place |
| Q15 (which place is the green book) | `3-which-position` — the inverse direction |
| Q16 (how many in front of the fourth) | `3-how-many-in-front` — typed number |
| Q17 (second, then the one after) | `3-who-is-nth` |
| Q18 (which toy is fifth) | `3-who-is-nth` / `3-which-position` |

## U02.4 — წინა და მომდევნო რიცხვები

| Reference | Pattern |
|---|---|
| Q19 (after 5), Q20 (before 9) | `4-neighbour-choice` |
| Q21 (after 14), Q22 (before 18) | `4-neighbour-entry` — typed number |
| Q23 (`__,16,17,__`) | `4-two-gaps` |
| Q24 (both neighbours of 19) | `4-two-gaps` / `4-neighbour-choice` |

The choice form and the typed form are deliberately two templates: recognising
`6` among `4, 6, 7` and producing `6` from "after five" are different steps, and
the document asks for both.

## U02.5 — უდიდესი და უმცირესი

| Reference | Pattern |
|---|---|
| Q25, Q26 (largest / smallest of three) | `5-pick-extreme` — the three numbers are printed |
| Q27, Q28 (largest / smallest among `12,17,14`) | `5-type-extreme` — typed number |
| Q29 (order descending) | `2-order-numbers` with `direction: 'desc'` |
| Q30 (difference between extremes) | `5-range` — typed number |

## U02.6 — რიცხვითი ღერძი 20-მდე

| Reference | Pattern |
|---|---|
| Q31, Q32 (after 4 / before 10 on the line) | `6-read-the-line` |
| Q33, Q34 (six, three steps right) | `6-one-move` — typed number |
| Q35 (two moves) | `6-plan-a-journey` — typed number |
| Q36 (how many steps from 12 to 18) | `6-plan-a-journey` |

`6-read-the-line` draws a window that does not start at 1, so counting from the
left edge gives the wrong answer. That is the mistake the exercise exists to
catch, and it is offered as a distractor.

## U02.7 — ლუწი და კენტი რიცხვები

| Reference | Pattern |
|---|---|
| Q37, Q38 (which is even / odd) | `7-pick-one` — exactly one option has the asked parity |
| Q39 (`2,4,6,__,10`) | `2-missing-in-run` |
| Q40 (which group is all odd) | `7-pick-the-group` — a sentence about a printed group |
| Q41 (which of these are even) | `7-pick-one` |
| Q42 (how many odds from 1 to 10) | `7-odd-one-out` — five numbers, one has the other parity |

Q42 is the one reference question this library answers differently. "How many
odd numbers are there from 1 to 20?" is a fixed sentence with one honest answer,
so its whole variation is which end of the range is named — twelve screens,
under the thirty-five a session needs. Asking instead *which* number breaks the
parity of a printed group gives the student the numbers to check, and it is the
harder version of the same judgement.

## Summary set (Q43–Q50)

These are one question drawn from each subtopic — a count (U02.1), a missing
number (U02.2), tens and units (U02.2), a place in a queue (U02.3), a smallest
number (U02.5), a move on the line (U02.6), an odd number (U02.7) and an
ordering (U02.2). Nothing in them needs a new pattern; they are what a session
already looks like once all seven subtopics use the templates above.

## What is deliberately not here

- **No question is a stored instance.** Q1's four stars are a draw, not a fact
  about the question.
- **No free text.** Every answer is a choice, a typed number or an ordering.
- **No hand-built scene per question.** The stars, apples and balloons come from
  one vocabulary, so the noun in the stem and the picture under it are the same
  entry.

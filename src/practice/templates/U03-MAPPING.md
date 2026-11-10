# U03 — the 50 reference questions, mapped to templates

Reference: *U03: თვლა* — 50 questions over U03.1–U03.6, each with three levels,
plus a summary set.

The 50 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves nothing in the document is unaccounted for.

## The shape the curriculum is authored to

Two rules from the academy's document decide the shape of this library:

1. Every task is answered by **multiple choice, a typed number, or an ordering** —
   nothing is marked by hand.
2. Every subtopic has **three question types**, and a session walks through them
   as the score rises: type 1 up to 30 points, type 2 up to 60, then the third
   type. The level is read from the score on every refill, so it also steps back
   down if the score falls.

**Current state: 21 templates — 3 types × 6 subtopics, plus 3 extra forms.**
Three subtopics carry a fourth template, all for the same reason: the fourth
answers a genuinely different *shape* of question rather than the same question
with other numbers — a single number where another asks for a pair
(`2-turn-around`), a pair where another asks for one number (`3-two-gaps`), or a
sequence of positions where another asks for a count (`3-order`). Those are
marked **the pair form**, **the walk form** and **the ordering form** below.

A perfect run needs 35 questions and the level is chosen by score, so a student
who keeps answering correctly stays on level 3 and a student who keeps answering
wrong stays on level 1. Each level must therefore carry a whole session **by
itself**. Every level of every subtopic here produces at least 35 distinct
questions; a test pins that (`tests/u03-templates.test.ts`), and the thinnest
level in the library is U03.2 level 3 with 96.

## The rule that decided most of these patterns

Higher difficulty had to demand **an extra step, not a bigger number**. Every
level 3 here either:

- combines three groups where level 2 combined two (`1-add-groups`,
  `5-third-group`, `6-add-two-kinds`),
- holds two answers at once (`2-two-gaps`, `3-two-gaps`),
- changes the operation rather than the range (`3-ten-more-less`: tens instead of
  ones; `3-order`: compare four numbers with each other),
- or asks for a number a fixed distance away rather than the next one
  (`4-third-step`: three steps, with one step and two steps offered as options).

## U03.1 — საგნების დათვლა

| Reference | Pattern |
|---|---|
| Q1 (count the stars), Q2 (count the balls) | `1-count-row` — the row is drawn, the number is chosen |
| Q3 (red balls + blue balls) | `1-add-groups` — two groups drawn, the total typed |
| Q4 (how many triangles among the shapes) | `1-count-one-kind` — two kinds interleaved, the other kind's size is an option |
| Q5 (four kinds, count the ducks) | `1-count-one-kind` — the mixture is drawn round-robin, so the asked kind is never its own line |
| Q6 (two baskets of apples and pears) | `1-add-groups` — the same two-group sum with fruit |

Q3's two-colour sum and Q6's two baskets are the same operation — count two
groups, then add them — so they share level 3 with Q5's three-group page. The
number of groups is drawn as two or three: the level asks for the addition, and
adding three groups rather than two is the extra work that appears inside the
level rather than a separate question type. A test pins that both count of
groups is reachable.

## U03.2 — წინ და უკან თვლა

| Reference | Pattern |
|---|---|
| Q7 (forward run with a blank) | `2-fill-one` — the row is built from its own numbers, direction drawn |
| Q8 (backward run with a blank) | `2-fill-one` — the backward half of the same draw |
| Q9 (start at N, take K forward) | `2-take-steps` — nothing printed; the running number is held |
| Q10 (start at N, take K back) | `2-take-steps` — the backward half |
| Q11 (`14, __, 12, __, 10`) | `2-two-gaps` — **the pair form**, answered as two numbers |
| Q12 (start 7, +5, −3) | `2-turn-around` — **the walk form**, answered as one number |

Q11 and Q12 are both level 3 but they cannot be one template: one answer is a
pair and the other a single number, so the options cannot be built by the same
rule. That is the judgement call recorded here.

## U03.3 — თვლა 100-მდე

| Reference | Pattern |
|---|---|
| Q13 (number after N) | `3-neighbour` — direction drawn; the neighbour in the *other* direction is on offer |
| Q14 (number before N) | `3-neighbour` — the other half of the same draw |
| Q15 (missing in a run under 100) | `3-fill-one` — the run length is drawn, so the blank is not always in the middle |
| Q16 (order four numbers) | `3-order` — **the ordering form**, four numbers under 100 |
| Q17 (`87,88,__,__,91`) | `3-two-gaps` — **the pair form** |
| Q18 (ten more than N) | `3-ten-more-less` — **the tens form**; the units digit never changes |

Three extra forms sit on this subtopic because the answers have three different
shapes: one number (`3-neighbour`, `3-fill-one`, `3-ten-more-less`), a pair
(`3-two-gaps`), and a sequence of positions (`3-order`). Collapsing any two of
them would mean answering a different question than the reference asks.

## U03.4 — თვლა ათეულებით და სხვა ბიჯებით

| Reference | Pattern |
|---|---|
| Q19, Q20 (continue a sequence by tens) | `4-continue` — the step is drawn from 2, 3, 5, 10 and never printed |
| Q21, Q22 (continue by fives / threes) | `4-continue` — the same template, a different drawn step |
| Q23 (`20,30,__,50,60`) | `4-step-gap` — the blank is *inside* the sequence, so it can be found from either side |
| Q24 (start at N, third number by fours) | `4-third-step` — one step and two steps are both offered |

Q23 is a different search from Q19–Q22 even though the arithmetic is the same
kind: continuing means looking forward from the last printed number, whereas a
gap in the middle has numbers on both sides and a child who adds the step once
does not land on it. That is why it is level 2 and continuation is level 1.

## U03.5 — სამიზნე რიცხვის შედგენა

| Reference | Pattern |
|---|---|
| Q25, Q26 (how many more to reach the target) | `5-how-many-more` — drawn as a basket; an empty basket gets its own sentence |
| Q27 (six chips, ten to fill) | `5-second-group` — the target split into two groups |
| Q28 (seven in the first group, fifteen in all) | `5-second-group` — the same question from the other side |
| Q29 (`9+4+__=18`) | `5-third-group` — three groups, two known |
| Q30 (build the target from three groups) | `5-third-group` — the same pattern stated as a story |

## U03.6 — აირჩიე და დაითვალე

| Reference | Pattern |
|---|---|
| Q31 (stars and circles, count the stars) | `6-count-a-shape` — two kinds **interleaved**, the other count is an option |
| Q32 (how many triangles) | `6-count-a-shape` — the same pattern with a different pair of shapes |
| Q33 (two colours, count the named one) | `6-count-a-category` (colour form) — colours are mixed into one row |
| Q34 (animals among other things, count the animals) | `6-count-a-category` (animal form) — two kinds of animal, both have to be counted and added |
| Q35 (three kinds, add the first two) | `6-add-two-kinds` — the third group's size and the whole page are both options |
| Q36 (sum of two named kinds) | `6-add-two-kinds` — the same pattern with different shapes |

The colour and animal forms are one template because both ask "which of these
match a description printed on none of them, and how many are there?". The
animal form is the harder half: the animals come in two kinds, so the count
needs an addition as well as a selection.

## The summary set

| Reference | Pattern |
|---|---|
| Count a drawn row | `1-count-row` |
| Count one kind among others | `1-count-one-kind` |
| Add groups on one page | `1-add-groups` |
| Fill a blank forwards or backwards | `2-fill-one` |
| Walk K steps from N | `2-take-steps` |
| The number after / before N | `3-neighbour` |
| Continue a stepped sequence | `4-continue` |
| How many more to the target | `5-how-many-more` |
| Add two named kinds | `6-add-two-kinds` |

All nine are already covered above; the summary repeats the same patterns rather
than introducing a tenth.

## What is deliberately *not* asked

- **Nothing is counted by typing a word.** Every answer is a number, a pair of
  numbers, or an order. A text answer would be a spelling test.
- **No picture asks the student to count more than twenty objects.** Grade 1
  counts to 20 and reads numbers to 100; the tens questions of U03.3 and the
  skip counting of U03.4 use printed numbers, not pictures, for anything above
  twenty.
- **No question has a single fixed instance.** Every count, start, step and
  target is drawn, and the picture is built from the same draw, so the same
  question cannot come back with a different picture.

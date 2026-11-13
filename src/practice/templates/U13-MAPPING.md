# U13 — დრო (time)

Grade 1, `topicId: 'dro'`. Fifty templates over the curriculum's five subtopics,
ten each, and every subtopic reaches all three levels (16 easy, 18 medium, 16
hard).

## The one idea this unit must not break

A time question promises that the answer is what the clock says. Three
consequences shape the whole unit:

- **A time is one number — minutes since midnight — and everything is derived
  from it.** `src/practice/templates/clock.ts` draws a dial from `clockFace(minutes)`
  and hands back the geometry it drew from `clockHands(minutes)`; no template
  computes an angle, and no picture holds a second copy of the time. A dial
  cannot disagree with the answer beside it for the same reason a triangle
  cannot be drawn under a question whose answer is „4“.
- **The calendar is five arrays and four modulo functions**
  (`src/practice/templates/calendar.ts`). Weekday and month arithmetic is one
  function each, `((index ± steps) % length + length) % length`, so rule 4
  (`10 % 7`) and rule 5 (twelve months) are the definition rather than a thing
  to remember. Seasons are a list of three-month groups and a lookup, never a
  second table in a template.
- **A duration is `end − start` in minutes** (`minutesOf`), formatted back by
  `durationWords`. The specification's own example, „1 hour 30 minutes“ for
  10:00–11:30, comes out of that function, and a test checks it at the source
  rather than inside a template.

## The dial is a character grid, and that costs something

`clockFace` draws 17 characters by 9 rows. A character cell is about twice as
tall as it is wide, so a square-ish dial needs the wide grid; the first draft
used 15 × 15 and drew a tall ellipse whose numerals stopped reading as
positions on a circle.

Two things follow, and both are written down here because they bound what a
clock question can honestly ask:

- **A hand lies on a grid line, not at an arbitrary angle.** The minute hand is
  exact — it is always on a numeral or exactly between two — but the hour hand
  is rounded to a cell, so its angle is right and its *drawn* position is a
  half-cell off. That is why the hour hand is checked in tests by its stated
  `between` pair plus the requirement that it is not on either numeral, not by
  reading a cell back out.
- **The hands must be visibly different lengths**, or the picture cannot say
  which is which. The hour hand reaches 0.46 of the ring and the minute hand
  0.88. With equal reaches, twelve o'clock drew one hand instead of two.

## Reference question → template

**U13.1 `saatis-wakitxva`** — reading the clock (Q1–Q9, Q47)

| Q | Reference | Template | Level |
|---|---|---|---|
| 1, 2 | read the analogue clock on the hour | `g1-u13-1-read-oclock` | 1 |
| 3 | write the time the hands show | `g1-u13-1-write-oclock` | 1 |
| 4 | match four clocks to their times (recast from drag-and-drop) | `g1-u13-1-match-clocks` | 1 |
| 6 | which clock shows this time | `g1-u13-1-which-clock` | 1 |
| 5, 47 | where is the minute hand | `g1-u13-1-minute-hand-hotspot` | 2 |
| 6, 8 | half past and quarter past, hour hand between two numerals | `g1-u13-1-half-past` | 2 |
| 7 | how many minutes past the hour | `g1-u13-1-minutes-past` | 2 |
| — | which of two dials is later | `g1-u13-1-which-is-later` | 2 |
| 9 | the time in words („six hours and thirty minutes“) | `g1-u13-1-time-in-words` | 3 |
| — | read the dial, then say what time it will be after a wait | `g1-u13-1-wait-until` | 3 |

**U13.2 `kviris-dgeebi`** — the days of the week (Q10–Q18, Q46)

| Q | Reference | Template | Level |
|---|---|---|---|
| 10, 13, 46 | what comes after this day | `g1-u13-2-next-day` | 1 |
| 12 | the day before this one, and Sunday → Monday | `g1-u13-2-week-wraps` | 1 |
| 11 | put four days in week order (recast from drag-and-drop) | `g1-u13-2-match-days` | 1 |
| 14 | tomorrow | `g1-u13-2-tomorrow` | 2 |
| 15 | yesterday | `g1-u13-2-yesterday` | 2 |
| — | the order number of a day, Monday = 1 | `g1-u13-2-day-number` | 2 |
| 16 | N days later, N = 2…6 | `g1-u13-2-days-ahead` | 2 |
| 17, 50 | ten and more days later | `g1-u13-2-many-days-ahead` | 3 |
| 18 | the day before yesterday | `g1-u13-2-day-before-yesterday` | 3 |
| — | two weeks later is the same day | `g1-u13-2-same-day-two-weeks` | 3 |

**U13.3 `Tveebi-seasonebi`** — months and seasons (Q19–Q27, Q48)

| Q | Reference | Template | Level |
|---|---|---|---|
| 19, 23 | the month after this one | `g1-u13-3-next-month` | 1 |
| 20 | the first month, and the last, from the year's ends | `g1-u13-3-first-month` | 1 |
| 24 | seasons → months, Georgia's four-season split (recast) | `g1-u13-3-match-seasons` | 1 |
| 22 | the season after this one | `g1-u13-3-next-season` | 1 |
| 25, 27 | twelve months, four seasons | `g1-u13-3-months-in-year` | 1 |
| 26 | two months before December | `g1-u13-3-months-before` | 2 |
| 21 | which season owns this month | `g1-u13-3-season-of-month` | 2 |
| 21 | which month belongs to this season | `g1-u13-3-month-of-season` | 3 |
| 27, 48 | four months after March, and months ahead | `g1-u13-3-months-ahead` | 3 |
| — | months back across the new year | `g1-u13-3-months-wrap-back` | 3 |

**U13.4 `drois-amocanebi`** — time problems (Q28–Q37)

| Q | Reference | Template | Level |
|---|---|---|---|
| 28, 30 | a lesson starting at H:00 and lasting D hours | `g1-u13-4-end-after-hours` | 1 |
| 29 | a film from 5:00 to 6:00 — how long | `g1-u13-4-hours-between` | 1 |
| 31 | 10:00–11:30 is 1 hour 30 minutes | `g1-u13-4-hours-and-minutes-between` | 2 |
| 32, 34 | a start plus a duration in minutes | `g1-u13-4-end-after-minutes` | 2 |
| 33 | 4:30–5:00 is 30 minutes | `g1-u13-4-minutes-taken` | 2 |
| 36 | 8:30 to 1:00 in the afternoon, across noon | `g1-u13-4-across-noon` | 3 |
| 37 | two parts of 20 + 35 minutes | `g1-u13-4-total-minutes` | 3 |
| 35 | 6:00 plus 90 minutes, read off a dial | `g1-u13-4-half-past-plus` | 3 |
| — | a break taken out of a rehearsal | `g1-u13-4-break-in-the-middle` | 3 |
| — | warm-up plus main part, on the clock | `g1-u13-4-two-parts-on-clock` | 3 |

**U13.5 `sxva-dro`** — other time questions (Q38–Q45)

| Q | Reference | Template | Level |
|---|---|---|---|
| 38 | one hour after, one hour before | `g1-u13-5-hour-step` | 1 |
| 39 | half an hour on — 30 minutes | `g1-u13-5-half-hour-on` | 1 |
| 40 | a quarter of an hour on | `g1-u13-5-quarters-on` | 2 |
| 41 | half an hour back | `g1-u13-5-half-hour-back` | 2 |
| 42 | three hours ahead | `g1-u13-5-hours-ahead` | 2 |
| — | 2:15 to 3:45, and the meeting that runs 05:30–06:45 | `g1-u13-5-gap-between` | 3 |
| — | 90 minutes on, typed | `g1-u13-5-minutes-ahead` | 3 |
| — | an hour before, read off the dial | `g1-u13-5-hour-back-from-face` | 3 |
| 43 | a start plus 45 minutes, typed | `g1-u13-5-end-typed` | 2 |
| 44 | which of two times is earlier | `g1-u13-5-earlier-or-later` | 2 |

## Deviations from the specification

Three, all forced by the runner and all recorded rather than hidden.

- **Drag-and-drop → „which row pairs them all correctly“** (Q4, Q11, Q24).
  `PracticeSession` marks exactly one option and has no drop targets. Each
  matching question offers one true pairing and three that are the same pairing
  with pairs slipped, so checking an answer still means checking every pair — the
  thing the drag task measured.
- **Multi-select → „which option names the complete set“** (the seasons-to-months
  question, and every „which is the right order“ on the calendar). One option
  names every member that fits; the others omit one, add one that does not fit,
  or rotate the months one season along.
- **No 12-hour dial can say morning or evening.** Rule 7 forbids a time whose
  answer depends on it, so a clock that crosses noon says which half of the day
  it is in: „დილის 09:00-ზე“ … „შუადღის 1:00-ზე“ (`g1-u13-4-across-noon`,
  Q36's own example). Every other question stays inside one morning, and a
  constraint in the template guarantees it rather than a hope.

Two specification questions were reshaped rather than merely recast, because as
written they would have been unanswerable:

- **„How many minutes past the hour?“** (Q7) is asked with the numeral named *and*
  with the child finding it on the dial, two frames of one question. The first
  draft asked it from a bare numeral-dial with no hour hand, which is a picture
  of nothing.
- **„Four months after March“** (Q27) and its mirror, months back across the new
  year (`months-wrap-back`), are two templates because that is two different
  mistakes: forgetting the wrap forwards, and forgetting it backwards.

## What is honestly ambiguous, and how each is closed

| Ambiguity | How the template closes it |
|---|---|
| „What time is it?“ on a dial that shows 7:30 twice a day | never asked; the question always names a time the answer can distinguish |
| „Which is later: 7:00 or 7:00?“ | the two-picture comparison constrains a non-zero gap |
| „How many months in a year“ — 12 or 13 (lunar)? | the school year is the 12, and the seasons by the same answer are Georgia's four |
| „Which season is December in?“ | winter, by the curriculum's own split; the season list is the only source |
| „Tomorrow“ from Sunday | wraps — checked at the source and by a template that asks exactly it |
| A duration of 1 hour 30 minutes — written „1:30“ or said? | `durationWords`, always words, because „1:30“ is also a clock time |
| „Where is the minute hand?“ at a quarter hour | 3, 6, 9, 12 are the four options, and the dial decides |
| Half past the hour, which numeral does the hour hand point at? | it points at *neither* — it is between them, and the question says so |

## Capacity

A 100-point session spends 35 answers: 20 questions at +4, then five at +2, then
ten at +1 (rules in `src/practice/scoring.ts`). Distinct **wordings and pictures**
per subtopic and level, measured over 300 draws of six with de-duplication:

| Subtopic | L1 | L2 | L3 |
|---|---:|---:|---:|
| `saatis-wakitxva` | 646 | 151 | 188 |
| `kviris-dgeebi` | 35 | 62 | 105 |
| `Tveebi-seasonebi` | 38 | 48 | 143 |
| `drois-amocanebi` | 120 | 604 | 650 |
| `sxva-dro` | 31 | 189 | 405 |

The thinnest cells are `kviris-dgeebi` and `Tveebi-seasonebi` at level 1, and
they are thin for a reason worth stating: the universe of a calendar question is
seven days and twelve months, so „what comes after X“ has seven and twelve
wordings however many templates ask it. `session-length.test.ts` plays every U13
subtopic through to 100 points and does not run dry; the margin at those two
cells is a little over one session's worth, which is enough but is the first
place to add material if a student ever practises a subtopic for a long time.

## Defects the first draft had

Seven, none of them visible to the type checker:

- **The hour hand sat on the hour at half past.** The first `clockFace` computed
  the hour hand from `hours * 30` and dropped the minutes, so 4:30 drew a hand
  through the 4 and the picture said 4:00 under a question whose answer was
  04:30. The hand is now `(hours + minutes / 60) * 30`, `clockHands` states the
  two numerals it lies between, and a test checks the pair at all twelve half
  hours.
- **Twelve o'clock drew one hand instead of two.** Both hands reached the same
  character cell, so the minute hand silently overwrote the hour hand. Reaches
  are now 0.46 and 0.88 of the ring.
- **The dial was a tall ellipse.** A 15 × 15 grid of characters is not square on
  screen; the dial is 17 × 9 with separate horizontal and vertical radii.
- **Georgian case endings were glued on with a hyphen** — „ივლისი-ის შემდეგ“ in
  eleven templates. All of them call `genitive`, `locative`, `fromName` or
  `untilName` now, and a test refuses a hyphen in any of the four forms of any
  day, month or season name.
- **`10:5` was accepted as `10:05`.** `asClock` matched a prefix, so a typed time
  one keystroke away from the right answer was marked right. The match is now
  anchored and the minute field must be two digits.
- **Three quarters of the sessions' prompts were invisible to de-duplication.**
  Content that lived only in the options — the four clocks in „which clock
  shows …“, the four pairings in „which row pairs them“ — made every draw of the
  template look like the same question, because `shownKey` is prompt + visual.
  The varying content is drawn in the `visual` now, and a test requires four
  distinct prompt-and-picture pairs from every template.

The seventh is the one this suite could not have found on its own, and it was
still there after every test above passed:

- **The dial was unreadable on screen.** `.question-visual` sets
  `white-space: pre-line` and an emoji font stack — both right for a row of
  objects to count, both fatal to a character grid. `pre-line` collapses the runs
  of spaces the numerals are *placed* with, and a proportional font puts every
  numeral at a different width, so the `12`, the `3` and the `6` would have
  drifted off their radii and the hands would have pointed at nothing. The
  picture was correct in the string and wrong on the page. Dial visuals now
  carry `question-visual-dial` (`white-space: pre`, a monospace stack), the
  class is applied by looking for the dial's centre mark, and
  `visual-and-options.test.tsx` reads that rule out of the stylesheet and fails
  if the class is missing — because jsdom loads no CSS and would never notice.

An eighth was a wording bug rather than a geometry one: „ნინო სკოლაში 09:30-ზე
მივიდა და 14-ზე წამოვიდა“ printed a 24-hour hour next to a dial that shows 2,
and said nothing about which half of the day it was. It says „დილის“ and
„შუადღის“ now.

## What the tests do not cover

- **A blind student cannot answer the clock-reading questions.** Every picture in
  the runner carries `aria-hidden="true"`, which is right for a row of objects
  (the prompt already says what is being counted) and wrong here: on
  `g1-u13-1-read-oclock` the dial *is* the question, so a screen reader gets
  „how many hours does the clock show?“ and no clock. Reading the character grid
  aloud instead would be noise — „space space space one two space space" — so
  `aria-hidden` is the better of two bad options, not an oversight. The honest
  fix is a non-visual equivalent (describe the hands, ask for the time, which is
  already what `g1-u13-1-write-oclock` does in reverse), and that is not in this
  unit. The exclusion is inherited from every earlier visual unit, and U13 is
  the first where it makes a whole subtopic unanswerable rather than harder.
- **A reading-level review by a teacher.** The Georgian is checked for being real
  Georgian, for the case endings and for one sentence per question, not for
  whether a six-year-old will follow „ნახატზე ნახე, სად არის წუთის ისარი“.
- **Whether the dial is legible on a phone.** It is 17 characters wide in a
  monospace font and scrolls horizontally rather than wrapping, so it cannot
  break — but at 1.25 rem on a narrow screen it is near the width of the card,
  and nobody has looked at it on a real phone.
- **The *drawn* angle of the hour hand**, beyond „not on a numeral and on the
  correct side“. A character grid cannot express a half-cell, so the picture is
  checked against the stated `between` pair rather than by reading the cell back.
- **Real-world durations.** Every word problem is a plausible lesson, film or
  walk; none of them has been checked against an actual timetable, and one of
  them (a 180-minute lesson) is deliberately odd to keep the arithmetic honest.

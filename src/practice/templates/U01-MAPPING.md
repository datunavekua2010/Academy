# U01 — the 60 reference questions, mapped to templates

Reference: *U01: საგნების მდებარეობა და შედარება* — 60 questions over
U01.1–U01.8, each with three levels.

The 60 questions are **examples, not a bank.** The deliverable is the *pattern*
behind each one, so this file records which pattern each question belongs to and
proves that nothing in the document is unaccounted for. Shipping the 60 as a
fixed pool was explicitly ruled out.

## The shape the curriculum is authored to

Two rules from the academy's document decide the shape of this library:

1. Every task is answered by **multiple choice, a typed number, or an ordering** —
   nothing is marked by hand.
2. Every subtopic has **exactly three question types**, and a session walks
   through them as the score rises: type 1 up to 30 points, type 2 up to 60,
   then the third type.

So each subtopic below is exactly three templates, one per level. The level is
read from the score on every refill (`src/practice/levels.ts`), which also means
it steps back down if the score falls.

**Current state: 24 templates — 3 types × 8 subtopics.** Every one of them can
produce at least 24 distinct questions, which is the whole point: one template
per level has to carry a session on its own. A test pins both facts
(`tests/u01-templates.test.ts`).

| Subtopic | Type 1 — გაგება | Type 2 — გამოყენება | Type 3 — გამოწვევა |
|---|---|---|---|
| U01.1 მარცხენა / შუა / მარჯვენა | `1-name-position` (choice) | `1-which-position` (choice) | `1-infer-middle` (choice) |
| U01.2 ზემოთ / ქვემოთ / გვერდით | `2-where-is-it` (choice) | `2-name-the-object` (choice) | `2-extreme-of-three` (choice) |
| U01.3 გრძელი / მოკლე | `3-ribbon` (choice) | `3-ribbon-equal` (choice) | `3-ribbon-order` (**ordering**) |
| U01.4 მაღალი / დაბალი | `4-tower` (choice) | `4-tower-equal` (choice) | `4-tower-difference` (**typed number**) |
| U01.5 მძიმე / მსუბუქი | `5-bag` (choice) | `5-bag-equal` (choice) | `5-bag-difference` (**typed number**) |
| U01.6 განიერი / ვიწრო | `6-box` (choice) | `6-box-equal` (choice) | `6-box-difference` (**typed number**) |
| U01.7 ყველა / ზოგიერთი | `7-all-taken` (choice) | `7-is-it-true` (choice) | `7-all-and-some` (choice) |
| U01.8 რამდენია? | `8-count-row` (**typed number**) | `8-count-groups` (**typed number**) | `8-rest-are` (**typed number**) |

All three answer modes the document names are in use: multiple choice, typed
number, and ordering.

---

## Where each reference question landed

The reference numbers below are the questions the document gives as examples.
Several of them share one pattern — that is the point of a template.

### U01.1 — მარცხნივ, შუაში, მარჯვნივ

| Q | Question shape | Type |
|---|---|---|
| 1, 2 | which object stands in the middle / on the left | 1 |
| 3, 4 | name the position of a named object; which is immediately left of X | 2 |
| 5 | the two ends are given, which is in the middle | 3 |

Q3's "second from the left" reading is covered by the *level 2* type through
`which-position` (counting to a named object); the two ends of the row and the
deduction step live at level 3.

### U01.2 — ზემოთ, ქვემოთ, გვერდით

| Q | Question shape | Type |
|---|---|---|
| 7, 8 | where is the object, given the picture | 1 |
| 9, 10 | which object is in the stated position | 2 |
| 11, 22 | which of three stacked objects is highest / lowest | 3 |

Positions are **drawn, not looked up**: two objects and a relation are drawn
independently from the shared vocabulary and the picture is composed from that
same draw, so a wording can never contradict its picture.

### U01.3–U01.6 — შედარება

| Q | Question shape | Subtopic | Type |
|---|---|---|---|
| 13, 25 | which is longer / heavier | U01.3, U01.5 | 1 |
| 14, 26, 32 | which is shorter / lighter / narrower | U01.3–U01.6 | 1 (the same comparison, reversed) |
| 15, 16 | are they equal, or which is more | U01.3–U01.6 | 2 |
| 17, 24, 36, 59 | put three in order | U01.3 | 3 (**ordering**) |
| 19, 27, 33 | how much longer / heavier / wider | U01.4–U01.6 | 3 (**typed number**) |

U01.3 spends its third type on ordering because the document asks for the whole
sequence there (Q17, Q36, Q59); the other three measures ask for the difference,
which is a typed number.

### U01.7 — ყველა და ზოგიერთი

| Q | Question shape | Type |
|---|---|---|
| 41 | "all were taken, how many are left" | 1 |
| 39, 40 | is "all …" / "some …" true | 2 |
| 42 | every object is the same shape — are "all" and "some" both true | 3 |

### U01.8 — რამდენია?

| Q | Question shape | Type |
|---|---|---|
| 49 | count the objects in a row | 1 |
| 50 | count two groups and add them | 2 |
| 51–54 | the total and one colour are given — how many of the other | 3 |

---

## Why three types and not one per reference question

The first pass of this library had 43 templates: a separate pattern for every
shape the reference used. That was wrong for two reasons.

* The document says each subtopic has **three** types, not one per example. Six
  choice questions about the same comparison are six wordings of one type.
* With one template per level, the generator's variation is what carries a
  session. The old design hid thin templates behind their siblings; measured
  directly, U01.2 could only produce 8 distinct questions at level 1, which is
  not enough to fill a session.

Every template is now checked to produce at least 24 distinct questions at its
level.

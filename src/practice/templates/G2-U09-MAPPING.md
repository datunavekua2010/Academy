# Grade 2 — Unit 09: დამრგვალება (Rounding)
## Template Mapping & Architecture Documentation

### Overview
Unit 09 covers rounding numbers and estimating sums/differences for Grade 2 mathematics in Georgian. It implements rounding to the nearest 5, 10, and 20, as well as estimating two-step addition and subtraction results through rounding. It contains 5 subtopics with exactly 6 questions per subtopic, totaling 30 authored templates (Q01–Q30).

---

### Subtopics in Unit 09 (`g2-damrgvaleba`)

| Subtopic ID | Georgian Title | English Description | Difficulty Levels | Template Count |
|---|---|---|---|---|
| `u09-nearest-5` | დამრგვალება უახლოეს 5-მდე | Rounding single/two-digit numbers to the nearest multiple of 5 | L1, L2, L3 | 6 |
| `u09-nearest-10` | დამრგვალება უახლოეს 10-მდე | Rounding two-digit numbers to the nearest multiple of 10 | L1, L2, L3 | 6 |
| `u09-nearest-20` | დამრგვალება უახლოეს 20-მდე | Rounding two-digit numbers to the nearest multiple of 20 | L1, L2, L3 | 6 |
| `u09-rounding-sums` | ჯამების დამრგვალება | Computing exact sum first, then rounding to indicated step | L1, L2, L3 | 6 |
| `u09-rounding-differences` | სხვაობების დამრგვალება | Computing exact difference first, then rounding to indicated step | L1, L2, L3 | 6 |

Total: **30 authored templates** across 5 subtopics (6 questions each).

---

### Core Pedagogical & Technical Rules
1. **უახლოეს 5-მდე (Nearest 5)**: Output must be a multiple of 5 (e.g., 5, 10, 15, 20...). Ties or halfway distances round up to the greater value.
2. **უახლოეს 10-მდე (Nearest 10)**: Output must be a multiple of 10 (e.g., 10, 20, 30...). Numbers ending in 5 always round up to the next ten.
3. **უახლოეს 20-მდე (Nearest 20)**: Output must be a multiple of 20 (e.g., 0, 20, 40, 60, 80, 100...). Numbers exactly halfway (e.g., 10, 30, 50, 70, 90) round up to the greater multiple of 20.
4. **ჯამებისა და სხვაობების დამრგვალება (Sums & Differences)**: Exact value is computed first (`a + b` or `a - b`), then rounded to the designated step (5, 10, or 20).
5. **Scoring & Progression**: Continuous score progression (correct answers increase score, incorrect decrease) up to 100 points (`MAX_SCORE`).
6. **Difficulty Levels**: Each subtopic spans levels 1, 2, and 3:
   - Level 1: Foundational proximity questions, number line visualization, smaller values.
   - Level 2: Standard two-digit rounding, halfway rule application, sum/difference estimation.
   - Level 3: Higher numbers (approaching or exceeding 100), bracket comparisons, mixed and multi-term problem contexts.

---

### Detailed Question Mapping (Q01–Q30)

| ID | Subtopic | Level | Format | Description / Prompt Concept |
|---|---|---|---|---|
| `g2-u09-01` | `u09-nearest-5` | 1 | Choice | Proximity check: Is `n` closer to `low` or `high` (multiples of 5)? |
| `g2-u09-02` | `u09-nearest-5` | 1 | Numeric | Round numbers from 1 to 20 to nearest 5 |
| `g2-u09-03` | `u09-nearest-5` | 2 | Numeric | Round two-digit numbers (20 to 60) to nearest 5 |
| `g2-u09-04` | `u09-nearest-5` | 2 | Numeric | Round two-digit numbers (60 to 99) to nearest 5 |
| `g2-u09-05` | `u09-nearest-5` | 3 | MC | Multiple choice rounding to nearest 5 with close distractors |
| `g2-u09-06` | `u09-nearest-5` | 3 | Choice | Find which of four given numbers rounds to `target` (multiple of 5) |
| `g2-u09-07` | `u09-nearest-10` | 1 | Choice | Proximity check: Is `n` closer to `low` or `high` (tens)? |
| `g2-u09-08` | `u09-nearest-10` | 1 | Numeric | Round numbers from 10 to 50 to nearest 10 |
| `g2-u09-09` | `u09-nearest-10` | 2 | Numeric | Round numbers from 50 to 99 to nearest 10 |
| `g2-u09-10` | `u09-nearest-10` | 2 | MC | Round halfway numbers ending in 5 to next ten |
| `g2-u09-11` | `u09-nearest-10` | 3 | MC | Identify which two tens bracket a given number `n` |
| `g2-u09-12` | `u09-nearest-10` | 3 | MC | Round numbers in the 90s to 90 or 100 |
| `g2-u09-13` | `u09-nearest-20` | 1 | Choice | Proximity check: Is `n` closer to `low` or `high` (multiples of 20)? |
| `g2-u09-14` | `u09-nearest-20` | 1 | Numeric | Round numbers within 60 to nearest 20 |
| `g2-u09-15` | `u09-nearest-20` | 2 | Numeric | Round numbers from 40 to 100 to nearest 20 |
| `g2-u09-16` | `u09-nearest-20` | 2 | MC | Multiple choice rounding to nearest 20 |
| `g2-u09-17` | `u09-nearest-20` | 3 | MC | Round halfway numbers (ending in 10: 30, 50, 70...) up to next 20 |
| `g2-u09-18` | `u09-nearest-20` | 3 | MC | Round numbers above 100 (up to 140) to nearest 20 |
| `g2-u09-19` | `u09-rounding-sums` | 1 | Numeric | Calculate sum `a + b` (up to 40) and round to nearest 10 |
| `g2-u09-20` | `u09-rounding-sums` | 1 | Numeric | Calculate sum `a + b` (up to 50) and round to nearest 5 |
| `g2-u09-21` | `u09-rounding-sums` | 2 | Numeric | Calculate two-digit sum `a + b` (up to 90) and round to nearest 10 |
| `g2-u09-22` | `u09-rounding-sums` | 2 | Numeric | Calculate sum `a + b` and round to nearest 20 |
| `g2-u09-23` | `u09-rounding-sums` | 3 | MC | Story word problem estimating total items rounded to nearest 10 |
| `g2-u09-24` | `u09-rounding-sums` | 3 | Numeric | Calculate sum of three addends `a + b + c` and round to nearest 10 |
| `g2-u09-25` | `u09-rounding-differences` | 1 | Numeric | Calculate difference `a - b` (within 40) and round to nearest 10 |
| `g2-u09-26` | `u09-rounding-differences` | 1 | Numeric | Calculate difference `a - b` and round to nearest 5 |
| `g2-u09-27` | `u09-rounding-differences` | 2 | Numeric | Calculate two-digit difference `a - b` (within 80) and round to nearest 10 |
| `g2-u09-28` | `u09-rounding-differences` | 2 | Numeric | Calculate difference `a - b` and round to nearest 20 |
| `g2-u09-29` | `u09-rounding-differences` | 3 | MC | Story word problem estimating remaining items rounded to nearest 10 |
| `g2-u09-30` | `u09-rounding-differences` | 3 | Numeric | Mixed expression `a - b + c` evaluated and rounded to nearest 10 |

---

### Verification and Quality Checklist
- [x] All 5 subtopics registered in `src/practice/curriculum.ts`.
- [x] All 30 templates implemented in `src/practice/templates/g2-u09-rounding.ts`.
- [x] Registered in `TEMPLATE_REGISTRY` and exported in `src/practice/templates/catalog.ts`.
- [x] Fallback placeholders in `grade2-placeholders.ts` removed for U09.
- [x] 100% typecheck clean (`npm run typecheck`).
- [x] 100% test pass (`npm test`, 44 test suites, 3974 tests passed).
- [x] Full gameplay simulation reaches 100 points on every subtopic.
- [x] Production build clean (`npm run build`).

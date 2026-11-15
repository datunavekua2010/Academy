# Grade 4 Unit 5: ალგებრა (Algebra)

## Overview
Unit 05 (`g4-algebra`) implements the complete Grade 4 curriculum for algebra as specified in Google Docs document `U05` (ID: `1CXtygzcznr7sw7MOKIK-6qclSYSuPi1HOyRAURxFeAc`, folder `WEBSITE GRADE 4` / `1ICXAouMBmoTDNwQb9J0p5b0XWKFPZFuX`):
- Writing algebraic expressions from verbal descriptions (addition, subtraction, multiplication, division, multi-step parenthesized expressions).
- Evaluating single algebraic expressions for a given variable value ($a + 14$, $b - 18$, $7x$, $y \div 5$, $3n + 8$, $4m - 12$).
- Evaluating algebraic expressions across multiple values of a variable to generate sequence sets and analyze linear progression.

## Architecture & Subtopics
The unit contains **18 dynamic question templates** (Q01–Q18) evenly distributed across **3 subtopics** (6 questions each) spanning progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U05.1: ალგებრული გამოსახულებების ჩაწერა** (`u05-write-expressions`, Q01–Q06)
   - Q01 (`g4-u05-01`, Level 1, Multiple Choice): რიცხვ $a$-ს დაუმატე $k$ $\rightarrow$ $a + k$.
   - Q02 (`g4-u05-02`, Level 1, Multiple Choice): რიცხვ $b$-ს გამოაკელი $k$ $\rightarrow$ $b - k$.
   - Q03 (`g4-u05-03`, Level 2, Multiple Choice): რიცხვი $x$ გაამრავლე $k$-ზე $\rightarrow$ $kx$.
   - Q04 (`g4-u05-04`, Level 2, Multiple Choice): რიცხვი $y$ გაყავი $k$-ზე $\rightarrow$ $y \div k$.
   - Q05 (`g4-u05-05`, Level 3, Multiple Choice): რიცხვ $n$-ს დაუმატე $k$ და მიღებული შედეგი გაამრავლე $m$-ზე $\rightarrow$ $(n + k) \times m$.
   - Q06 (`g4-u05-06`, Level 3, Multiple Choice): რიცხვ $m$-ს გაამრავლე $m$-ზე და მიღებულ შედეგს გამოაკელი $k$ $\rightarrow$ $m \cdot \text{var} - k$.

2. **U05.2: გამოსახულების მნიშვნელობის გამოთვლა** (`u05-evaluate-expression`, Q07–Q12)
   - Q07 (`g4-u05-07`, Level 1, Numeric): გამოთვალე $a + k$, თუ $a = \text{val}$.
   - Q08 (`g4-u05-08`, Level 1, Numeric): გამოთვალე $b - k$, თუ $b = \text{val}$.
   - Q09 (`g4-u05-09`, Level 2, Numeric): გამოთვალე $kx$, თუ $x = \text{val}$.
   - Q10 (`g4-u05-10`, Level 2, Numeric): გამოთვალე $y \div k$, თუ $y = \text{val}$.
   - Q11 (`g4-u05-11`, Level 3, Numeric): გამოთვალე $kn + c$, თუ $n = \text{val}$.
   - Q12 (`g4-u05-12`, Level 3, Numeric): გამოთვალე $km - c$, თუ $m = \text{val}$.

3. **U05.3: გამოსახულების მნიშვნელობების გამოთვლა ცვლადების სხვადასხვა მნიშვნელობისთვის** (`u05-evaluate-multiple-values`, Q13–Q18)
   - Q13 (`g4-u05-13`, Level 1, Multiple Choice): გამოთვალე $x + k$ სამი განსხვავებული მნიშვნელობისთვის ($v_1, v_2, v_3$).
   - Q14 (`g4-u05-14`, Level 1, Multiple Choice): გამოთვალე $ka$ სამი განსხვავებული მნიშვნელობისთვის ($v_1, v_2, v_3$).
   - Q15 (`g4-u05-15`, Level 2, Multiple Choice): გამოთვალე $b - k$ სამი განსხვავებული მნიშვნელობისთვის ($v_1, v_2, v_3$).
   - Q16 (`g4-u05-16`, Level 2, Multiple Choice): გამოთვალე $ky + c$ სამი განსხვავებული მნიშვნელობისთვის ($v_1, v_2, v_3$).
   - Q17 (`g4-u05-17`, Level 3, Multiple Choice): გამოთვალე $n \div k$ სამი განსხვავებული მნიშვნელობისთვის ($v_1, v_2, v_3$).
   - Q18 (`g4-u05-18`, Level 3, Multiple Choice): გამოთვალე $km - c$ სამი განსხვავებული მნიშვნელობისთვის ($v_1, v_2, v_3$).

## Test Verification
- All 18 templates generate at least 12 distinct variations without placeholder leakage (`tests/g4-u05-templates.test.ts`).
- Full simulated gameplay playthroughs reach the maximum score (100 points) on every one of the 3 subtopics.
- Full catalog unit metadata integrity verified (`tests/template-catalog.test.ts`).

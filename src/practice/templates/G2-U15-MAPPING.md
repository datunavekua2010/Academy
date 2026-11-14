# Grade 2 Unit 15: წილადები (Fractions)

## Overview
Unit 15 (`g2-wiladebi`) introduces Grade 2 students to foundational fraction concepts: understanding that fractions represent equal parts of a whole, identifying halves, thirds, and quarters using visual and concrete models (pizza, cakes, fruit, geometric shapes, sets of items), calculating unit fractions of numbers (half, third, quarter of numbers up to 40), finding the original whole given a unit fraction, recognizing how many unit parts make a whole, and comparing unit fractions of the same whole (1/2 > 1/3 > 1/4).

## Architecture & Subtopics
The unit contains **24 dynamic question templates** (Q01–Q24) evenly distributed across **4 subtopics** (6 questions each) covering progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U15.1: მთელის ნაწილები** (`u15-parts-of-a-whole`, Q01–Q06)
   - Q01 (Level 1, MC): მთელის დაყოფა თანაბარ ნაწილებად და ერთი ნაწილის დასახელება (ნახევარი, მესამედი, მეოთხედი).
   - Q02 (Level 1, Numeric): ფიგურის თანაბარი ნაწილების საერთო რაოდენობის დათვლა.
   - Q03 (Level 2, MC): შეფერილი ნაწილის ამოცნობა (ნახევარი, მესამედი, მეოთხედი).
   - Q04 (Level 2, MC): მთელის ამოცნობა (ყველა ნაწილი ერთად).
   - Q05 (Level 3, Numeric): ნაწილების რაოდენობის გამოთვლა (დარჩენილი ნაწილები: total − eaten).
   - Q06 (Level 3, MC): წილადის ჩაწერის ფორმატი (1/2, 1/3, 1/4, 1/5, 1/6).

2. **U15.2: ნახევრები** (`u15-halves`, Q07–Q12)
   - Q07 (Level 1, MC): ნახევრის ცნება (ორი ტოლი ნაწილიდან თითოეული).
   - Q08 (Level 1, Numeric): ლუწი რიცხვის ნახევრის გამოთვლა (n : 2).
   - Q09 (Level 2, Numeric): საგნების სიმრავლის ნახევრის პოვნა (total : 2).
   - Q10 (Level 2, MC): ნახევრის შედარება მეოთხედთან/მესამედთან.
   - Q11 (Level 3, Numeric): მთელი რიცხვის პოვნა მისი ნახევრის მიხედვით (half × 2).
   - Q12 (Level 3, Numeric): რამდენი ნახევარია საჭირო ერთი მთელის შესადგენად (2).

3. **U15.3: მესამედები** (`u15-thirds`, Q13–Q18)
   - Q13 (Level 1, MC): მესამედის ცნება (სამი ტოლი ნაწილიდან თითოეული).
   - Q14 (Level 1, Numeric): 3-ის ჯერადი რიცხვის მესამედის გამოთვლა (n : 3).
   - Q15 (Level 2, Numeric): საგნების სიმრავლის მესამედის გამოთვლა (total : 3).
   - Q16 (Level 2, Numeric): რამდენი მესამედია საჭირო ერთი მთელის შესადგენად (3).
   - Q17 (Level 3, Numeric): მთელი რიცხვის პოვნა მისი მესამედის მიხედვით (third × 3).
   - Q18 (Level 3, MC): რამდენიმე მესამედის დათვლა (მაგ. 2 ნაწილი = ორი მესამედი).

4. **U15.4: მეოთხედები** (`u15-quarters`, Q19–Q24)
   - Q19 (Level 1, MC): მეოთხედის ცნება (ოთხი ტოლი ნაწილიდან თითოეული).
   - Q20 (Level 1, Numeric): 4-ის ჯერადი რიცხვის მეოთხედის გამოთვლა (n : 4).
   - Q21 (Level 2, Numeric): საგნების სიმრავლის მეოთხედის გამოთვლა (total : 4).
   - Q22 (Level 2, Numeric): რამდენი მეოთხედია საჭირო ერთი მთელის შესადგენად (4).
   - Q23 (Level 3, Numeric): მთელი რიცხვის პოვნა მისი მეოთხედის მიხედვით (quarter × 4).
   - Q24 (Level 3, MC): ერთნაირი ზომის მთელში წილადების შედარება (1/2 > 1/3 > 1/4).

## Test Verification
- `tests/g2-u15-templates.test.ts`:
  - 4 subtopics mapped and validated.
  - 24 authored templates (Q01–Q24) present.
  - Difficulty levels 1, 2, and 3 represented across all subtopics.
  - Variable combinations verified to provide >= 12 distinct variations per template with zero warnings.
  - Distinct distractors, verified mathematical correctness, and natural Georgian explanations.
  - Full end-to-end interactive session simulation to 100 points (`MAX_SCORE`) passing across all 4 subtopics.
- Full project test suite: 50 test files, 5,007 passing tests.
- Production build: `npm run build` succeeds cleanly.

# Grade 4 Unit 1: რიცხვები და რიცხვითი სისტემები (Numbers and Number Systems)

## Overview
Unit 01 (`g4-ricxvebi-sistemebi`) implements the foundational Grade 4 curriculum for numbers and number systems as specified in Google Docs document `U01` (ID: `1z5k267ERUVq8f7Q4-Jl2-c5rDWiObppQBmEw4UBLpbU`, folder `WEBSITE GRADE 4`):
- Roman numerals (I, V, X, L, C, D, M) and conversion between Arabic and Roman representations up to 1000.
- Even and odd numbers: identification, counting within intervals, and properties under addition and multiplication.
- Operations with dates and calendars: days in months, leap years, days elapsed, and date calculations.
- Rounding natural numbers to the nearest ten, hundred, and thousand.
- Prime and composite numbers: definitions, divisibility checks, prime factor properties.
- Comparing and ordering multi-digit numbers up to 1,000,000.
- Sequences and patterns: step rules (hundreds, thousands, ten-thousands, and irregular steps).
- Hundred chart analysis: spatial directional movements (left, right, up, down) and coordinate mappings.
- Minimum and maximum even/odd numbers with leading digit constraints and boundary limits.
- Multiplication by 10, 100, 1,000 and multiples of ten (e.g. $640 \times 30$, $125 \times 400$).
- Digit counting: counting total digits, occurrences of specific digits (including 0), and distinct digits.
- Arithmetic operations on multi-digit numbers: 4-digit addition/subtraction, 3-digit multiplication/division, and multi-step order of operations.
- Operations on extreme values: forming maximum and minimum numbers from digit sets (including zero), and differences/sums of extreme values.
- Word problems finding differences between quantities (apples/pears, pencils, store items, warehouse inventories).
- Arithmetic mean: finding the average of 3 or 4 numbers, test scores, daily temperatures, and finding totals from means.

## Architecture & Subtopics
The unit contains **90 dynamic question templates** (Q01–Q90) evenly distributed across **15 subtopics** (6 questions each) covering progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U01.1: რომაული ციფრები** (`u01-roman-numerals`, Q01–Q06)
   - Q01 (`g4-u01-01`, Level 1, Numeric): რომაული ციფრიდან არაბულზე გადაყვანა (L = 50, C = 100, D = 500, M = 1000).
   - Q02 (`g4-u01-02`, Level 1, Text/MC): არაბული რიცხვის ჩაწერა რომაულად (10–100).
   - Q03 (`g4-u01-03`, Level 2, Numeric): რთული რომაული რიცხვის მნიშვნელობა (XV, XL, LX, XC, CD, CM).
   - Q04 (`g4-u01-04`, Level 2, Text/MC): არაბული რიცხვის რომაული ჩანაწერი (30–90).
   - Q05 (`g4-u01-05`, Level 3, Numeric): ასეულებიანი რომაული რიცხვი (CL, CC, CD, DC, DCL, CM).
   - Q06 (`g4-u01-06`, Level 3, Text/MC): სამნიშნა არაბული რიცხვის ჩაწერა რომაულად (150–900).

2. **U01.2: ლუწი და კენტი რიცხვები** (`u01-even-odd`, Q07–Q12)
   - Q07 (`g4-u01-07`, Level 1, Numeric/MC): მოცემული სამნიშნა რიცხვებიდან ლუწის ამოცნობა.
   - Q08 (`g4-u01-08`, Level 1, Numeric/MC): მოცემული სამნიშნა რიცხვებიდან კენტის ამოცნობა.
   - Q09 (`g4-u01-09`, Level 2, Numeric): უმცირესი ლუწი K-ნიშნა რიცხვი მოცემული პირველი ციფრით.
   - Q10 (`g4-u01-10`, Level 2, Numeric): უდიდესი კენტი K-ნიშნა რიცხვი მოცემული პირველი ციფრით.
   - Q11 (`g4-u01-11`, Level 3, Numeric): ლუწი/კენტი რიცხვების რაოდენობის დათვლა მოცემულ შუალედში.
   - Q12 (`g4-u01-12`, Level 3, Text/MC): დიდი რიცხვის ლუწ-კენტობის განსაზღვრა ბოლო ციფრით.

3. **U01.3: მოქმედებები თარიღებთან** (`u01-dates`, Q13–Q18)
   - Q13 (`g4-u01-13`, Level 1, Numeric): დღეების რაოდენობა მოცემულ თვეში (აპრილი, მაისი, ივნისი და ა.შ.).
   - Q14 (`g4-u01-14`, Level 1, Numeric): დღეების რაოდენობა ნაკიან წელიწადში (366).
   - Q15 (`g4-u01-15`, Level 2, Numeric): გასული დღეების რაოდენობა ერთსა და იმავე თვეში ორ რიცხვს შორის.
   - Q16 (`g4-u01-16`, Level 2, Text/MC): მომდევნო თარიღის განსაზღვრა თვის ბოლოს გადაბიჯებისას.
   - Q17 (`g4-u01-17`, Level 3, Numeric): დღეების საერთო რაოდენობა ორ თანამიმდევრულ თვეში.
   - Q18 (`g4-u01-18`, Level 3, Numeric): წლის რომელ დღეს წარმოადგენს თარიღი წლის დასაწყისიდან.

4. **U01.4: ნატურალური რიცხვების დამრგვალება** (`u01-rounding`, Q19–Q24)
   - Q19 (`g4-u01-19`, Level 1, Numeric): დამრგვალება უახლოეს ათეულამდე (ორნიშნა/სამნიშნა).
   - Q20 (`g4-u01-20`, Level 1, Numeric): დამრგვალება უახლოეს ასეულამდე (სამნიშნა).
   - Q21 (`g4-u01-21`, Level 2, Numeric): დამრგვალება უახლოეს ათასეულამდე (ოთხნიშნა).
   - Q22 (`g4-u01-22`, Level 2, Numeric): ხუთნიშნა რიცხვის დამრგვალება უახლოეს ასეულამდე.
   - Q23 (`g4-u01-23`, Level 3, Numeric): ექვსნიშნა რიცხვის დამრგვალება უახლოეს ათასეულამდე.
   - Q24 (`g4-u01-24`, Level 3, Numeric): დამრგვალება უახლოეს ათიათასეულამდე.

5. **U01.5: მარტივი და შედგენილი რიცხვები** (`u01-prime-composite`, Q25–Q30)
   - Q25 (`g4-u01-25`, Level 1, Text/MC): რიცხვი N მარტივია თუ შედგენილი (პირველი ათეულიდან).
   - Q26 (`g4-u01-26`, Level 1, Text/MC): რიცხვი N მარტივია თუ შედგენილი (შუალედიდან 10–30).
   - Q27 (`g4-u01-27`, Level 2, Numeric/MC): მოცემული რიცხვებიდან მარტივი რიცხვის ამოცნობა.
   - Q28 (`g4-u01-28`, Level 2, Numeric/MC): მოცემული რიცხვებიდან შედგენილი რიცხვის ამოცნობა.
   - Q29 (`g4-u01-29`, Level 3, Numeric): უმცირესი მარტივი რიცხვი (2).
   - Q30 (`g4-u01-30`, Level 3, Numeric): მარტივი რიცხვების რაოდენობა მოცემულ შუალედში (1–10 ან 10–20).

6. **U01.6: რიცხვების შედარება მილიონამდე** (`u01-compare-million`, Q31–Q36)
   - Q31 (`g4-u01-31`, Level 1, Text/Sign): 5-ნიშნა რიცხვების შედარება (`<`, `>`, `=`).
   - Q32 (`g4-u01-32`, Level 1, Text/Sign): 6-ნიშნა რიცხვების შედარება (`<`, `>`, `=`).
   - Q33 (`g4-u01-33`, Level 2, Text/MC): 5-ნიშნა რიცხვების ზრდადობით დალაგება.
   - Q34 (`g4-u01-34`, Level 2, Text/MC): 6-ნიშნა რიცხვების კლებადობით დალაგება.
   - Q35 (`g4-u01-35`, Level 3, Text/Sign): 6-ნიშნა რიცხვის შედარება 1,000,000-თან.
   - Q36 (`g4-u01-36`, Level 3, Numeric): უდიდესი რიცხვის პოვნა, რომელიც მოცემულ M-ზე ნაკლებია (`M − 1`).

7. **U01.7: შესაბამისი რიცხვები და ნიმუშები** (`u01-patterns-sequences`, Q37–Q42)
   - Q37 (`g4-u01-37`, Level 1, Numeric): გამოტოვებული წევრის პოვნა ასეულებით ზრდად მიმდევრობაში.
   - Q38 (`g4-u01-38`, Level 1, Numeric): გამოტოვებული წევრის პოვნა კლებად მიმდევრობაში.
   - Q39 (`g4-u01-39`, Level 2, Numeric): ათასეულებით მზარდი მიმდევრობის შემდეგი წევრი.
   - Q40 (`g4-u01-40`, Level 2, Text/MC): მიმდევრობის კანონზომიერების (წესის) სიტყვიერი ფორმულირება.
   - Q41 (`g4-u01-41`, Level 3, Numeric): ათიათასეულებიანი მიმდევრობის გამოტოვებული წევრი.
   - Q42 (`g4-u01-42`, Level 3, Numeric): შერეული ბიჯის (250, 500, 750) მიმდევრობის გაგრძელება.

8. **U01.8: ასეულების ცხრილის ანალიზი** (`u01-hundred-chart`, Q43–Q48)
   - Q43 (`g4-u01-43`, Level 1, Numeric): რა რიცხვია N-ის მარჯვნივ (`N + 1`).
   - Q44 (`g4-u01-44`, Level 1, Numeric): რა რიცხვია N-ის ქვემოთ (`N + 10`).
   - Q45 (`g4-u01-45`, Level 2, Numeric): რა რიცხვია N-ის მარცხნივ (`N − 1`).
   - Q46 (`g4-u01-46`, Level 2, Numeric): გადაადგილება 1 უჯრით ქვემოთ და R უჯრით მარჯვნივ (`N + 10 + R`).
   - Q47 (`g4-u01-47`, Level 3, Numeric): გადაადგილება U უჯრით ზემოთ (`N − 10U`).
   - Q48 (`g4-u01-48`, Level 3, Numeric): გადაადგილება R მარჯვნივ და D ქვემოთ (`N + R + 10D`).

9. **U01.9: უმცირესი და უდიდესი ლუწი/კენტი რიცხვები** (`u01-min-max-even-odd`, Q49–Q54)
   - Q49 (`g4-u01-49`, Level 1, Numeric): უდიდესი ლუწი/კენტი სამნიშნა რიცხვი მოცემული პირველი ციფრით.
   - Q50 (`g4-u01-50`, Level 1, Numeric): უმცირესი ლუწი/კენტი ოთხნიშნა რიცხვი მოცემული პირველი ციფრით.
   - Q51 (`g4-u01-51`, Level 2, Numeric): უდიდესი ლუწი/კენტი ოთხნიშნა რიცხვი მოცემული პირველი ორი ციფრით.
   - Q52 (`g4-u01-52`, Level 2, Numeric): უმცირესი ლუწი/კენტი ექვსნიშნა რიცხვი მოცემული პირველი ციფრით.
   - Q53 (`g4-u01-53`, Level 3, Numeric): Limit-ზე ნაკლები უდიდესი ლუწი/კენტი რიცხვი.
   - Q54 (`g4-u01-54`, Level 3, Numeric): Limit-ზე მეტი უმცირესი კენტი/ლუწი რიცხვი.

10. **U01.10: ათზე და მის ჯერადებზე გამრავლება** (`u01-multiply-tens`, Q55–Q60)
    - Q55 (`g4-u01-55`, Level 1, Numeric): გამრავლება 10-ზე ($A \times 10$).
    - Q56 (`g4-u01-56`, Level 1, Numeric): გამრავლება 100-ზე ($A \times 100$).
    - Q57 (`g4-u01-57`, Level 2, Numeric): გამრავლება 1,000-ზე ($A \times 1000$).
    - Q58 (`g4-u01-58`, Level 2, Numeric): მრგვალი ათეულების გამრავლება ($640 \times 30$).
    - Q59 (`g4-u01-59`, Level 3, Numeric): გამრავლება მრგვალ ასეულებზე ($125 \times 400$).
    - Q60 (`g4-u01-60`, Level 3, Numeric): უცნობი მამრავლის პოვნა ($\square \times 100 = \text{Product}$).

11. **U01.11: ციფრების დათვლა** (`u01-digit-counting`, Q61–Q66)
    - Q61 (`g4-u01-61`, Level 1, Numeric): რამდენი ციფრია 3–5 ნიშნა რიცხვში.
    - Q62 (`g4-u01-62`, Level 1, Numeric): რამდენი ციფრია 5–6 ნიშნა რიცხვში.
    - Q63 (`g4-u01-63`, Level 2, Numeric): რამდენჯერ გვხვდება მოცემული ციფრი რიცხვში.
    - Q64 (`g4-u01-64`, Level 2, Numeric): რამდენჯერ გვხვდება ციფრი 0 რიცხვში.
    - Q65 (`g4-u01-65`, Level 3, Numeric): რამდენი განსხვავებული ციფრია რიცხვში.
    - Q66 (`g4-u01-66`, Level 3, Numeric): კონკრეტული ციფრის სიხშირე მრავალნიშნა რიცხვში.

12. **U01.12: მოქმედებები რიცხვებზე** (`u01-operations`, Q67–Q72)
    - Q67 (`g4-u01-67`, Level 1, Numeric): 4-ნიშნა რიცხვების შეკრება.
    - Q68 (`g4-u01-68`, Level 1, Numeric): გამოკლება მრგვალი ათასეულიდან ($9000 - B$).
    - Q69 (`g4-u01-69`, Level 2, Numeric): სამნიშნა რიცხვის გამრავლება ერთნიშნაზე ($236 \times 4$).
    - Q70 (`g4-u01-70`, Level 2, Numeric): სამნიშნა/ოთხნიშნა რიცხვის გაყოფა ერთნიშნაზე ნაშთის გარეშე.
    - Q71 (`g4-u01-71`, Level 3, Numeric): შერეული მოქმედება: გამრავლება და შეკრება ($A \times B + C$).
    - Q72 (`g4-u01-72`, Level 3, Numeric): შერეული მოქმედება: გამოკლება და გაყოფა ($A - B \div C$).

13. **U01.13: მოქმედებები უმცირეს და უდიდეს მნიშვნელობებზე** (`u01-extreme-values`, Q73–Q78)
    - Q73 (`g4-u01-73`, Level 1, Numeric): მოცემული სამი ციფრით უდიდესი სამნიშნა რიცხვის შედგენა.
    - Q74 (`g4-u01-74`, Level 1, Numeric): მოცემული სამი ციფრით უმცირესი სამნიშნა რიცხვის შედგენა.
    - Q75 (`g4-u01-75`, Level 2, Numeric): სხვაობა უდიდეს და უმცირეს მრავალნიშნა რიცხვებს შორის.
    - Q76 (`g4-u01-76`, Level 2, Numeric): უდიდესი და უმცირესი მრავალნიშნა რიცხვების ჯამი.
    - Q77 (`g4-u01-77`, Level 3, Numeric): ციფრებით $0, d_1, d_2, d_3$ უდიდესი ოთხნიშნა რიცხვის შედგენა.
    - Q78 (`g4-u01-78`, Level 3, Numeric): ციფრებით $0, d_1, d_2, d_3$ უმცირესი ოთხნიშნა რიცხვის შედგენა (ნულის არასასტარტო პოზიციის გათვალისწინებით).

14. **U01.14: განსხვავებული რაოდენობების პოვნა** (`u01-difference-word-problems`, Q79–Q84)
    - Q79 (`g4-u01-79`, Level 1, Numeric): ტექსტური ამოცანა: რამდენით მეტია ვაშლი მსხალზე.
    - Q80 (`g4-u01-80`, Level 1, Numeric): ტექსტური ამოცანა: რამდენით ნაკლები ფანქარია მეორე ყუთში.
    - Q81 (`g4-u01-81`, Level 2, Numeric): რამდენით განსხვავდება წიგნების რაოდენობა ორ ჯგუფს შორის.
    - Q82 (`g4-u01-82`, Level 2, Numeric): რამდენით მეტი ნივთი გაიყიდა მეორე დღეს.
    - Q83 (`g4-u01-83`, Level 3, Numeric): მეორე საწყობში ყუთების რაოდენობის პოვნა საერთო ჯამის მიხედვით.
    - Q84 (`g4-u01-84`, Level 3, Numeric): პატარა რიცხვის პოვნა, როდესაც ცნობილია სხვაობა და დიდი რიცხვი.

15. **U01.15: საშუალო არითმეტიკული** (`u01-arithmetic-mean`, Q85–Q90)
    - Q85 (`g4-u01-85`, Level 1, Numeric): სამი რიცხვის საშუალო არითმეტიკული.
    - Q86 (`g4-u01-86`, Level 1, Numeric): ოთხი რიცხვის საშუალო არითმეტიკული.
    - Q87 (`g4-u01-87`, Level 2, Numeric): მოსწავლის ოთხი ტესტის საშუალო ქულის გამოთვლა.
    - Q88 (`g4-u01-88`, Level 2, Numeric): სამი დღის საშუალო ტემპერატურის გამოთვლა.
    - Q89 (`g4-u01-89`, Level 3, Numeric): საშუალო არითმეტიკულის პოვნა მოცემული საერთო ჯამიდან.
    - Q90 (`g4-u01-90`, Level 3, Numeric): რიცხვების ჯამის პოვნა მოცემული საშუალო არითმეტიკულიდან.

## Verification & Testing
- Unit test suite: `tests/g4-u01-templates.test.ts`
  - 109 passing tests
  - Verifies all 15 subtopics and all 90 authored templates (Q01–Q90).
  - Asserts full difficulty distribution across Levels 1, 2, and 3.
  - Verifies all templates generate valid distinct variations and formatted distractors.
  - Simulates end-to-end interactive student sessions from 0 to 100 points (`MAX_SCORE`) on every subtopic.
- Catalog test suite: `tests/template-catalog.test.ts`
  - 4,583 passing tests across the entire academy catalog.

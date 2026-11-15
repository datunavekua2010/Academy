# Grade 4 Unit 6: შედარებითი ტექსტური ამოცანები (Comparative Word Problems)

## Overview
Unit 06 (`g4-shedarebiti-amocanebi`) implements the complete Grade 4 curriculum for comparative word problems as specified in Google Docs document `U06` (ID: `1lPJ1HItRKVjPYCsMntFNdr4abRFJIGYUMUuMFdjDBmM`, folder `WEBSITE GRADE 4` / `1ICXAouMBmoTDNwQb9J0p5b0XWKFPZFuX`):
- Difference comparison problems ("How much more?"): $A - B$.
- Difference comparison problems ("How much less?"): $A - B$.
- Multiplicative comparison problems ("How many times more?"): $A \div B$.
- Multiplicative comparison problems ("How many times less?"): $A \div B$.
- Comparative quantity calculation problems: finding a quantity given that it is $k$ times more ($A \times k$), $k$ times less ($A \div k$), or finding the combined total of both quantities ($A + A \times k$).

## Architecture & Subtopics
The unit contains **30 dynamic question templates** (Q01–Q30) evenly distributed across **5 subtopics** (6 questions each) spanning progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U06.1: რამდენით მეტია?** (`u06-how-much-more`, Q01–Q06)
   - Q01 (`g4-u06-01`, Level 1, Numeric): $A$-ს $a$ ფანქარი აქვს, $B$-ს კი $b$. რამდენით მეტი ფანქარი აქვს $A$-ს? ($a - b$).
   - Q02 (`g4-u06-02`, Level 1, Numeric): ერთ ბიბლიოთეკაში $a$ წიგნია, მეორეში $b$. რამდენით მეტი წიგნია პირველში? ($a - b$).
   - Q03 (`g4-u06-03`, Level 2, Numeric): ორშაბათს გაიყიდა $a$, სამშაბათს $b$. რამდენით მეტი გაიყიდა სამშაბათს? ($b - a$).
   - Q04 (`g4-u06-04`, Level 2, Numeric): ერთ ყუთში $a$ გრამია, მეორეში $b$ გრამი. რამდენით მეტია პირველში? ($a - b$).
   - Q05 (`g4-u06-05`, Level 3, Numeric): პირველმა ქარხანამ $a$ ნივთი გამოუშვა, მეორემ $b$. რამდენით მეტი პირველმა? ($a - b$).
   - Q06 (`g4-u06-06`, Level 3, Numeric): ბაღში $a$ ვაშლის ხეა და $b$ მსხლის ხე. რამდენით მეტია ვაშლის ხეები? ($a - b$).

2. **U06.2: რამდენით ნაკლებია?** (`u06-how-much-less`, Q07–Q12)
   - Q07 (`g4-u06-07`, Level 1, Numeric): $A$-ს $a$ ბარათი აქვს, $B$-ს კი $b$. რამდენით ნაკლები ბარათი აქვს $B$-ს? ($a - b$).
   - Q08 (`g4-u06-08`, Level 1, Numeric): პირველ თაროზე $a$ წიგნია, მეორეზე $b$. რამდენით ნაკლები წიგნია მეორეზე? ($a - b$).
   - Q09 (`g4-u06-09`, Level 2, Numeric): პარკში $a$ ბავშვი იყო, მეზობელში $b$. რამდენით ნაკლები ბავშვი იყო მეორეში? ($a - b$).
   - Q10 (`g4-u06-10`, Level 2, Numeric): იყო $a$ კგ ფქვილი, დარჩა $b$ კგ. რამდენით ნაკლები ფქვილი დარჩა? ($a - b$).
   - Q11 (`g4-u06-11`, Level 3, Numeric): პირველმა ფერმამ მოიწია $a$ კგ ყურძენი, მეორემ $b$ კგ. რამდენით ნაკლები მოიწია მეორემ? ($a - b$).
   - Q12 (`g4-u06-12`, Level 3, Numeric): პირველმა გაიარა $a$ კმ, მეორემ $b$ კმ. რამდენით ნაკლები მანძილი გაიარა მეორემ? ($a - b$).

3. **U06.3: რამდენჯერ მეტია?** (`u06-how-many-times-more`, Q13–Q18)
   - Q13 (`g4-u06-13`, Level 1, Numeric): $A$-ს $b$ მანქანა აქვს, $B$-ს კი $a$. რამდენჯერ მეტია $B$-ს მანქანები? ($a \div b$).
   - Q14 (`g4-u06-14`, Level 1, Numeric): ერთ კალათაში $b$ ვაშლია, მეორეში $a$. რამდენჯერ მეტია მეორეში? ($a \div b$).
   - Q15 (`g4-u06-15`, Level 2, Numeric): პირველ თაროზე $b$ წიგნია, მეორეზე $a$. რამდენჯერ მეტია მეორეზე? ($a \div b$).
   - Q16 (`g4-u06-16`, Level 2, Numeric): ერთმა ამოხსნა $b$, მეორემ $a$. რამდენჯერ მეტი ამოხსნა მეორემ? ($a \div b$).
   - Q17 (`g4-u06-17`, Level 3, Numeric): პირველმა დაამზადა $b$, მეორემ $a$. რამდენჯერ მეტი დაამზადა მეორემ? ($a \div b$).
   - Q18 (`g4-u06-18`, Level 3, Numeric): პირველმა გადაიტანა $b$ კგ, მეორემ $a$ კგ. რამდენჯერ მეტი გადაიტანა მეორემ? ($a \div b$).

4. **U06.4: რამდენჯერ ნაკლებია?** (`u06-how-many-times-less`, Q19–Q24)
   - Q19 (`g4-u06-19`, Level 1, Numeric): $A$-ს $b$ ფანქარი აქვს, $B$-ს კი $a$. რამდენჯერ ნაკლები ფანქარი აქვს $A$-ს? ($a \div b$).
   - Q20 (`g4-u06-20`, Level 1, Numeric): ერთ ყუთში $b$ ბურთია, მეორეში $a$. რამდენჯერ ნაკლები ბურთია პირველში? ($a \div b$).
   - Q21 (`g4-u06-21`, Level 2, Numeric): პირველმა ამოხსნა $b$, მეორემ $a$. რამდენჯერ ნაკლები ამოხსნა პირველმა? ($a \div b$).
   - Q22 (`g4-u06-22`, Level 2, Numeric): ერთ მაღაზიაში $b$ კგ ბრინჯია, მეორეში $a$ კგ. რამდენჯერ ნაკლებია პირველში? ($a \div b$).
   - Q23 (`g4-u06-23`, Level 3, Numeric): პირველმა ქარხანამ $b$ გამოუშვა, მეორემ $a$. რამდენჯერ ნაკლები გამოუშვა პირველმა? ($a \div b$).
   - Q24 (`g4-u06-24`, Level 3, Numeric): პირველმა მანქანამ $b$ კგ გადაიტანა, მეორემ $a$ კგ. რამდენჯერ ნაკლები გადაიტანა პირველმა? ($a \div b$).

5. **U06.5: საგნების რაოდენობების შედარება** (`u06-compare-quantities`, Q25–Q30)
   - Q25 (`g4-u06-25`, Level 1, Numeric): ერთ კალათაში $a$ მსხალია, მეორეში $k$-ჯერ ნაკლები. რამდენი მსხალია მეორეში? ($a \div k$).
   - Q26 (`g4-u06-26`, Level 1, Numeric): პირველ თაროზე $a$ წიგნია, მეორეზე $k$-ჯერ მეტი. რამდენი წიგნია მეორეზე? ($a \times k$).
   - Q27 (`g4-u06-27`, Level 2, Numeric): $A$-ს $a$ სტიკერი აქვს, $B$-ს $k$-ჯერ ნაკლები. რამდენი სტიკერი აქვს $B$-ს? ($a \div k$).
   - Q28 (`g4-u06-28`, Level 2, Numeric): ერთ ფერმაში $a$ ქათამია, მეორეში $k$-ჯერ მეტი. რამდენი ქათამია მეორეში? ($a \times k$).
   - Q29 (`g4-u06-29`, Level 3, Numeric): პირველმა $a$ ქულა დააგროვა, მეორემ $k$-ჯერ ნაკლები. რამდენი ქულა დააგროვა მეორემ? ($a \div k$).
   - Q30 (`g4-u06-30`, Level 3, Numeric): ერთ საწყობში $a$ ყუთია, მეორეში $k$-ჯერ მეტი. რამდენი ყუთია ორივეში ერთად? ($a + a \times k$).

## Test Verification
- All 30 templates generate at least 12 distinct variations without placeholder leakage (`tests/g4-u06-templates.test.ts`).
- Full simulated gameplay playthroughs reach the maximum score (100 points) on every one of the 5 subtopics.
- Full catalog unit metadata integrity verified (`tests/template-catalog.test.ts`).

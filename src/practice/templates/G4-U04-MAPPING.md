# Grade 4 Unit 4: გაყოფა (Division)

## Overview
Unit 04 (`g4-gayofa`) implements the complete Grade 4 curriculum for division as specified in Google Docs document `U04` (ID: `1QSfRtHFK1jdwYRGPoQd-8Jm6Q907gFGDV9FPmSupK-A`, folder `WEBSITE GRADE 4` / `1ICXAouMBmoTDNwQb9J0p5b0XWKFPZFuX`):
- Identifying the unknown dividend ($\square \div b = c$ and $\square = b \times c + r$).
- Identifying the unknown divisor ($a \div \square = c$ and $a = \square \times c + r$).
- Division facts up to 12 ($a \div 2, 3, \dots, 12$).
- Long division and remainders: finding remainders, maximum possible remainder rule ($r < d$), quotient-remainder decomposition ($a = d \cdot q + r$).
- Division of numbers ending with zeros by 1-digit numbers ($a0 \div b, a00 \div b, a\,000 \div b$).
- Division of numbers ending with zeros with zeros cancellation ($a0 \div b0, a00 \div b00, a\,000 \div b0$).
- Fundamental principles and laws of division ($a \div 1 = a$, $a \div a = 1$, $0 \div a = 0$, distributive law $(a \pm b) \div c = a/c \pm b/c$).
- Division by two-digit numbers (exact and with remainder, up to 4-digit dividends).
- Quotient estimation using compatible numbers and interval bounds.
- Deriving and calculating quantities using division (fractions of numbers, chains $a \div b \div c$, reverse operation word problems).

## Architecture & Subtopics
The unit contains **66 dynamic question templates** (Q01–Q66) evenly distributed across **11 subtopics** (6 questions each) spanning progressive difficulty levels (Level 1, Level 2, Level 3):

1. **U04.1: გასაყოფის პოვნა** (`u04-find-dividend`, Q01–Q06)
   - Q01 (`g4-u04-01`, Level 1, Numeric): უცნობი გასაყოფის პოვნა 1-ნიშნა განაყოფით: $\square \div b = c$.
   - Q02 (`g4-u04-02`, Level 1, Numeric): უცნობი გასაყოფის პოვნა ტაბულურ დიაპაზონში: $\square \div b = c$.
   - Q03 (`g4-u04-03`, Level 2, Numeric): უცნობი გასაყოფის პოვნა 2-ნიშნა განაყოფით: $\square \div b = c$.
   - Q04 (`g4-u04-04`, Level 2, Numeric): უცნობი გასაყოფის პოვნა მრგვალი ათეულებით: $\square \div b = c$.
   - Q05 (`g4-u04-05`, Level 3, Numeric): უცნობი გასაყოფის პოვნა ნაშთიან გაყოფაში: $\square \div b = q$ (ნაშთი $r$).
   - Q06 (`g4-u04-06`, Level 3, Numeric): უცნობი გასაყოფის პოვნა ნაშთიან გაყოფაში 2-ნიშნა განაყოფით.

2. **U04.2: გამყოფის პოვნა** (`u04-find-divisor`, Q07–Q12)
   - Q07 (`g4-u04-07`, Level 1, Numeric): გამყოფის პოვნა გამრავლების ტაბულის ფარგლებში: $a \div \square = c$.
   - Q08 (`g4-u04-08`, Level 1, Numeric): ერთნიშნა გამყოფის პოვნა 2-ნიშნა გასაყოფში: $a \div \square = c$.
   - Q09 (`g4-u04-09`, Level 2, Numeric): ორნიშნა გამყოფის პოვნა: $a \div \square = c$.
   - Q10 (`g4-u04-10`, Level 2, Numeric): მრგვალი ათეულის გამყოფის პოვნა: $a \div \square = c$.
   - Q11 (`g4-u04-11`, Level 3, Numeric): გამყოფის პოვნა ნაშთიან გაყოფაში: $a \div \square = q$ (ნაშთი $r$).
   - Q12 (`g4-u04-12`, Level 3, Numeric): გამყოფის პოვნა ნაშთიან გაყოფაში 3-ნიშნა გასაყოფისთვის.

3. **U04.3: გაყოფა 12-მდე** (`u04-divide-up-to-12`, Q13–Q18)
   - Q13 (`g4-u04-13`, Level 1, Numeric): გაყოფა 10-ზე: $a \div 10$.
   - Q14 (`g4-u04-14`, Level 1, Numeric): გაყოფა 12-ზე: $a \div 12$.
   - Q15 (`g4-u04-15`, Level 2, Numeric): გაყოფა 9-ზე: $a \div 9$.
   - Q16 (`g4-u04-16`, Level 2, Numeric): გაყოფა 8-ზე: $a \div 8$.
   - Q17 (`g4-u04-17`, Level 3, Numeric): გაყოფა 11-ზე: $a \div 11$.
   - Q18 (`g4-u04-18`, Level 3, Numeric): გაყოფა 12-ზე სამნიშნა რიცხვებში: $a \div 12$.

4. **U04.4: ნაშთიანი გაყოფა** (`u04-long-division-remainder`, Q19–Q24)
   - Q19 (`g4-u04-19`, Level 1, Numeric): ნაშთის პოვნა მცირე რიცხვებში: $a \div b$-ის ნაშთი.
   - Q20 (`g4-u04-20`, Level 1, Numeric): ნაშთის პოვნა ორნიშნა რიცხვის გაყოფისას: $a \div b$-ის ნაშთი.
   - Q21 (`g4-u04-21`, Level 2, Numeric): ნაშთის პოვნა სამნიშნა რიცხვის გაყოფისას: $a \div b$-ის ნაშთი.
   - Q22 (`g4-u04-22`, Level 2, Numeric): უდიდესი შესაძლო ნაშთი $b$-ზე გაყოფისას ($r_{\max} = b - 1$).
   - Q23 (`g4-u04-23`, Level 3, Numeric): ნაშთიანი გაყოფის შემოწმება: $a - b \times q$.
   - Q24 (`g4-u04-24`, Level 3, Numeric): ტექსტური ამოცანა ნაშთიან გაყოფაზე (დარჩენილი ერთეულები).

5. **U04.5: განაყოფისა და ნაშთის პოვნა** (`u04-quotient-and-remainder`, Q25–Q30)
   - Q25 (`g4-u04-25`, Level 1, Numeric): არასრული განაყოფის პოვნა: $a \div b$-ის განაყოფი.
   - Q26 (`g4-u04-26`, Level 1, Numeric): ნაშთის პოვნა განაყოფთან ერთად: $a \div b$-ის ნაშთი.
   - Q27 (`g4-u04-27`, Level 2, Numeric): ტოლობის შევსება: $a = b \times \square + r$.
   - Q28 (`g4-u04-28`, Level 2, Numeric): არასრული განაყოფის პოვნა 3-ნიშნა რიცხვისთვის.
   - Q29 (`g4-u04-29`, Level 3, Multiple Choice): სწორი განაყოფისა და ნაშთის წყვილის არჩევა ($q$ და ნაშთი $r$).
   - Q30 (`g4-u04-30`, Level 3, Numeric): ტექსტური ამოცანა: სრული ჯგუფების რაოდენობის განსაზღვრა.

6. **U04.6: ნულით დამთავრებული რიცხვების გაყოფა ერთნიშნა რიცხვზე** (`u04-divide-ending-zeros-single`, Q31–Q36)
   - Q31 (`g4-u04-31`, Level 1, Numeric): მრგვალი ათეულის გაყოფა ერთნიშნა რიცხვზე: $a0 \div b$.
   - Q32 (`g4-u04-32`, Level 1, Numeric): მრგვალი ასეულის გაყოფა ერთნიშნა რიცხვზე: $a00 \div b$.
   - Q33 (`g4-u04-33`, Level 2, Numeric): მრგვალი ათასეულის გაყოფა ერთნიშნა რიცხვზე: $a\,000 \div b$.
   - Q34 (`g4-u04-34`, Level 2, Numeric): სამნიშნა რიცხვი ნულოვანი ბოლოთი: $ab0 \div c$.
   - Q35 (`g4-u04-35`, Level 3, Numeric): ოთხნიშნა რიცხვი ნულებით გაყოფილი ერთნიშნა რიცხვზე.
   - Q36 (`g4-u04-36`, Level 3, Numeric): გონებაში გამოთვლის ხერხი ნულების გამოყოფით: $(a \div b) \times 100$.

7. **U04.7: ნულით დამთავრებული რიცხვების გაყოფა** (`u04-divide-ending-zeros`, Q37–Q42)
   - Q37 (`g4-u04-37`, Level 1, Numeric): 10-ზე გაყოფა (ბოლო ნულის ჩამოწერა): $a0 \div 10$.
   - Q38 (`g4-u04-38`, Level 1, Numeric): 100-ზე გაყოფა (ორი ნულის ჩამოწერა): $a00 \div 100$.
   - Q39 (`g4-u04-39`, Level 2, Numeric): 1 000-ზე გაყოფა: $a\,000 \div 1\,000$.
   - Q40 (`g4-u04-40`, Level 2, Numeric): ორივე რიცხვის ბოლო ნულის შეკვეცა: $a0 \div b0$.
   - Q41 (`g4-u04-41`, Level 3, Numeric): ორივე რიცხვის ორი ბოლო ნულის შეკვეცა: $a00 \div b00$.
   - Q42 (`g4-u04-42`, Level 3, Numeric): ნულების შეკვეცა სხვადასხვა რაოდენობისას: $a\,000 \div b00$.

8. **U04.8: გაყოფის ძირითადი თვისებები და წესები** (`u04-division-principles`, Q43–Q48)
   - Q43 (`g4-u04-43`, Level 1, Numeric): 1-ზე გაყოფა: $a \div 1 = a$.
   - Q44 (`g4-u04-44`, Level 1, Numeric): რიცხვის თავის თავზე გაყოფა: $a \div a = 1$.
   - Q45 (`g4-u04-45`, Level 2, Numeric): ნულის გაყოფა რიცხვზე: $0 \div a = 0$.
   - Q46 (`g4-u04-46`, Level 2, Numeric): განრიგებადობის თვისება შეკრების მიმართ: $(a + b) \div c = a \div c + b \div c$.
   - Q47 (`g4-u04-47`, Level 3, Numeric): განრიგებადობის თვისება გამოკლების მიმართ: $(a - b) \div c = a \div c - b \div c$.
   - Q48 (`g4-u04-48`, Level 3, Numeric): ჯამის გაყოფა მარტივი შესაკრებების ხერხით.

9. **U04.9: ორნიშნა რიცხვზე გაყოფა** (`u04-divide-by-two-digit`, Q49–Q54)
   - Q49 (`g4-u04-49`, Level 1, Numeric): ორნიშნა $\div$ ორნიშნა (უნაშთო, ერთნიშნა განაყოფი): $a \div b$.
   - Q50 (`g4-u04-50`, Level 1, Numeric): სამნიშნა $\div$ ორნიშნა (უნაშთო, ერთნიშნა განაყოფი): $a \div b$.
   - Q51 (`g4-u04-51`, Level 2, Numeric): სამნიშნა $\div$ ორნიშნა (ორნიშნა განაყოფი): $a \div b$.
   - Q52 (`g4-u04-52`, Level 2, Numeric): სამნიშნა $\div$ ორნიშნა ნაშთით: განაყოფის გამოთვლა.
   - Q53 (`g4-u04-53`, Level 3, Numeric): ოთხნიშნა $\div$ ორნიშნა უნაშთო გაყოფა: $a \div b$.
   - Q54 (`g4-u04-54`, Level 3, Numeric): ოთხნიშნა $\div$ ორნიშნა გაყოფა: ნაშთის პოვნა.

10. **U04.10: განაყოფის შეფასება** (`u04-estimate-quotient`, Q55–Q60)
    - Q55 (`g4-u04-55`, Level 1, Multiple Choice): მოსახერხებელი რიცხვების (მეგობრული რიცხვების) შერჩევა გაყოფისთვის.
    - Q56 (`g4-u04-56`, Level 1, Multiple Choice): განაყოფის მიახლოებითი მნიშვნელობის შეფასება (ერთნიშნა).
    - Q57 (`g4-u04-57`, Level 2, Multiple Choice): განაყოფის შეფასება გასაყოფისა და გამყოფის დამრგვალებით.
    - Q58 (`g4-u04-58`, Level 2, Multiple Choice): რომელ ინტერვალში მოექცევა განაყოფი?
    - Q59 (`g4-u04-59`, Level 3, Multiple Choice): განაყოფის ქვედა და ზედა ზღვრები: $L < a \div b < U$.
    - Q60 (`g4-u04-60`, Level 3, Multiple Choice): პრაქტიკული ამოცანა განაყოფის მიახლოებით შეფასებაზე.

11. **U04.11: რიცხვების მიღება გაყოფის გამოყენებით** (`u04-obtain-numbers-division`, Q61–Q66)
    - Q61 (`g4-u04-61`, Level 1, Numeric): რიცხვის ნახევრის პოვნა: $a \div 2$.
    - Q62 (`g4-u04-62`, Level 1, Numeric): რიცხვის მესამედის/მეოთხედის პოვნა: $a \div 3$ ან $a \div 4$.
    - Q63 (`g4-u04-63`, Level 2, Numeric): ორსაფეხურიანი გამოთვლა: გაყოფა და შემდეგ მიმატება/გამოკლება.
    - Q64 (`g4-u04-64`, Level 2, Numeric): საწყისი რიცხვის პოვნა შებრუნებული მოქმედებით: ჩაიფიქრეს რიცხვი...
    - Q65 (`g4-u04-65`, Level 3, Numeric): თანმიმდევრული გაყოფა (ჯაჭვი): $a \div b \div c$.
    - Q66 (`g4-u04-66`, Level 3, Numeric): კომპლექსური არითმეტიკული თავსატეხი გაყოფით.

## Test Verification
- All 66 templates generate at least 12 distinct, valid variations without placeholder leakage or duplicate choices (`tests/g4-u04-templates.test.ts`).
- Full simulated gameplay playthroughs reach the maximum score (100 points) on every one of the 11 subtopics.
- Full catalog unit metadata integrity verified (`tests/template-catalog.test.ts`).

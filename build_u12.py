#!/usr/bin/env python3
"""Generator script for Grade 4 Unit 12: დრო (Time)"""
import json

header = """import { defineTemplate, type QuestionTemplate } from './types';

export function nearMisses(answer: number, count = 3, min = 0, step = 1): number[] {
  const result = new Set<number>();
  const deltas = [step, -step, 2 * step, -2 * step, 3 * step, -3 * step, 5, -5, 10, -10];
  for (const delta of deltas) {
    const val = answer + delta;
    if (val >= min && val !== answer) {
      result.add(val);
      if (result.size >= count) break;
    }
  }
  let fallback = 1;
  while (result.size < count) {
    const val = answer + fallback * step;
    if (val >= min && val !== answer) {
      result.add(val);
    }
    fallback++;
  }
  return Array.from(result).slice(0, count);
}

export const G4_U12_SUBTOPICS = [
  'u12-time-sequence',
  'u12-time-unit-conversion',
  'u12-time-operations',
  'u12-elapsed-time',
  'u12-age-problems',
  'u12-work-rate-time',
  'u12-hourly-rate',
] as const;

export type G4U12SubtopicId = (typeof G4_U12_SUBTOPICS)[number];

const addr = (options: { id: string; subtopicId: G4U12SubtopicId; difficulty: 1 | 2 | 3 }) => ({
  grade: 4 as const,
  topicId: 'g4-dro' as const,
  unitId: 'g4-dro' as const,
  ...options,
});

export const G4_U12_TEMPLATES: QuestionTemplate[] = [
"""

footer = """];
"""

templates = []

def emit_template(tid, subtopic, diff, prompt, vals, vars_extra, ans_code, dist_or_opt_code, expl_code, is_options=False, option_count=None):
    vals_json = json.dumps(vals, ensure_ascii=False)
    opt_key = "options" if is_options else "distractors"
    opt_count_str = f"    optionCount: {option_count},\n" if option_count is not None else ""
    entry = f"""  // {tid} (Level {diff})
  defineTemplate({{
    ...addr({{ id: '{tid}', subtopicId: '{subtopic}', difficulty: {diff} }}),
{opt_count_str}    prompt: '{prompt}',
    variables: {{
      spec: {{
        kind: 'choice',
        values: {vals_json},
      }},
{vars_extra}
    }},
    answer: {ans_code},
    {opt_key}: {dist_or_opt_code},
    explanation: {expl_code},
  }}),
"""
    templates.append(entry)

# ----------------- U12.1: u12-time-sequence -----------------
# Q01: Daily routine order
q01_vals = [
  'გაღვიძება, საუზმე, დაძინება|გაღვიძება, დაძინება, საუზმე|დაძინება, გაღვიძება, საუზმე|საუზმე, დაძინება, გაღვიძება|1',
  'დილა, შუადღე, საღამო|შუადღე, დილა, საღამო|საღამო, დილა, შუადღე|დილა, საღამო, შუადღე|2',
  'გაღვიძება, სკოლაში წასვლა, სახლში დაბრუნება|სკოლაში წასვლა, გაღვიძება, სახლში დაბრუნება|სახლში დაბრუნება, გაღვიძება, სკოლაში წასვლა|გაღვიძება, სახლში დაბრუნება, სკოლაში წასვლა|3',
  'საუზმე, სადილი, ვახშამი|სადილი, საუზმე, ვახშამი|ვახშამი, საუზმე, სადილი|საუზმე, ვახშამი, სადილი|4',
  'გაკვეთილის დაწყება, შესვენება, გაკვეთილის დასრულება|შესვენება, გაკვეთილის დაწყება, გაკვეთილის დასრულება|გაკვეთილის დასრულება, შესვენება, გაკვეთილის დაწყება|შესვენება, გაკვეთილის დასრულება, გაკვეთილის დაწყება|5',
  'ჩაცმა, საუზმობა, სკოლაში გამგზავრება|სკოლაში გამგზავრება, ჩაცმა, საუზმობა|საუზმობა, ჩაცმა, სკოლაში გამგზავრება|ჩაცმა, სკოლაში გამგზავრება, საუზმობა|6',
  'დავალების დაწერა, ეზოში გასვლა, დაძინება|დაძინება, დავალების დაწერა, ეზოში გასვლა|ეზოში გასვლა, დაძინება, დავალების დაწერა|დავალების დაწერა, დაძინება, ეზოში გასვლა|7',
  'დილის ვარჯიში, შხაპი, საუზმე|საუზმე, დილის ვარჯიში, შხაპი|შხაპი, საუზმე, დილის ვარჯიში|დილის ვარჯიში, საუზმე, შხაპი|8',
  'წიგნის გახსნა, წაკითხვა, დახურვა|წაკითხვა, წიგნის გახსნა, დახურვა|დახურვა, წიგნის გახსნა, წაკითხვა|წიგნის გახსნა, დახურვა, წაკითხვა|9',
  'მზის ამოსვლა, შუადღე, მზის ჩასვლა|შუადღე, მზის ამოსვლა, მზის ჩასვლა|მზის ჩასვლა, მზის ამოსვლა, შუადღე|მზის ამოსვლა, მზის ჩასვლა, შუადღე|10',
  'კარის გაღება, ოთახში შესვლა, კარის დაკეტვა|ოთახში შესვლა, კარის გაღება, კარის დაკეტვა|კარის დაკეტვა, ოთახში შესვლა, კარის გაღება|კარის გაღება, კარის დაკეტვა, ოთახში შესვლა|11',
  'ჩანთის ჩალაგება, სკოლაში წასვლა, გაკვეთილი|სკოლაში წასვლა, ჩანთის ჩალაგება, გაკვეთილი|გაკვეთილი, ჩანთის ჩალაგება, სკოლაში წასვლა|ჩანთის ჩალაგება, გაკვეთილი, სკოლაში წასვლა|12',
  'გაღვიძება, პირის დაბანა, საუზმე|საუზმე, პირის დაბანა, გაღვიძება|პირის დაბანა, საუზმე, გაღვიძება|გაღვიძება, საუზმე, პირის დაბანა|13',
  'სადილობა, დასვენება, მეცადინეობა|მეცადინეობა, სადილობა, დასვენება|დასვენება, მეცადინეობა, სადილობა|სადილობა, მეცადინეობა, დასვენება|14',
  'საღამო, ვახშამი, ღამე|ღამე, સાღამო, ვახშამი|ვახშამი, ღამე, საღამო|საღამო, ღამე, ვახშამი|15',
  'დავალების მომზადება, ჩანთაში ჩადება, დაძინება|დაძინება, ჩანთაში ჩადება, დავალების მომზადება|ჩანთაში ჩადება, დავალების მომზადება, დაძინება|დავალების მომზადება, დაძინება, ჩანთაში ჩადება|16',
]
emit_template('g4-u12-01', 'u12-time-sequence', 1,
  'რომელია მოვლენების სწორი დროითი თანმიმდევრობა (ვარიანტი #{num})?',
  q01_vals,
  """      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      num: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },""",
  "(v) => String(v.ans)",
  "(v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)]",
  "({ answer }) => `მოვლენების სწორი თანმიმდევრობაა: ${answer}.`",
  is_options=True
)

# Q02: Earlier / Later comparison
q02_vals = [
  'დილა თუ შუადღე|დილა|შუადღე',
  'შუადღე თუ საღამო|შუადღე|საღამო',
  'დილა თუ საღამო|დილა|საღამო',
  'გათენება თუ შუადღე|გათენება|შუადღე',
  'საუზმე თუ სადილი|საუზმე|სადილი',
  'სადილი თუ ვახშამი|სადილი|ვახშამი',
  'საუზმე თუ ვახშამი|საუზმე|ვახშამი',
  'დილის 9 საათი თუ დღის 2 საათი|დილის 9 საათი|დღის 2 საათი',
  'დილის 8 საათი თუ დილის 11 საათი|დილის 8 საათი|დილის 11 საათი',
  'დღის 1 საათი თუ საღამოს 6 საათი|დღის 1 საათი|საღამოს 6 საათი',
  'შუაღამე თუ დილა|შუაღამე|დილა',
  'მზის ამოსვლა თუ მზის ჩასვლა|მზის ამოსვლა|მზის ჩასვლა',
  'დილის 10 საათი თუ საღამოს 8 საათი|დილის 10 საათი|საღამოს 8 საათი',
  'დილის 7 საათი თუ დღის 12 საათი|დილის 7 საათი|დღის 12 საათი',
  'პირველი გაკვეთილი თუ მესამე გაკვეთილი|პირველი გაკვეთილი|მესამე გაკვეთილი',
  'დილის 6 საათი თუ დილის 9 საათი|დილის 6 საათი|დილის 9 საათი',
]
emit_template('g4-u12-02', 'u12-time-sequence', 1,
  'რომელი დრო დგება უფრო ადრე: {pair}?',
  q02_vals,
  """      pair: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      other: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },""",
  "(v) => String(v.ans)",
  "(v) => [String(v.ans), String(v.other)]",
  "({ answer }) => `უფრო ადრე დგება: ${answer}.`",
  is_options=True,
  option_count=2
)

# Q03: Order time units from smallest to largest
q03_vals = [
  'წამი, წუთი, საათი|საათი, წუთი, წამი|წუთი, წამი, საათი|წამი, საათი, წუთი|1',
  'წუთი, საათი, დღე|დღე, საათი, წუთი|საათი, წუთი, დღე|წუთი, დღე, საათი|2',
  'საათი, დღე, კვირა|კვირა, დღე, საათი|დღე, საათი, კვირა|საათი, კვირა, დღე|3',
  'დღე, კვირა, თვე|თვე, კვირა, დღე|კვირა, დღე, თვე|დღე, თვე, კვირა|4',
  'კვირა, თვე, წელი|წელი, თვე, კვირა|თვე, კვირა, წელი|კვირა, წელი, თვე|5',
  'წამი, წუთი, დღე|დღე, წუთი, წამი|წუთი, წამი, დღე|წამი, დღე, წუთი|6',
  'წუთი, დღე, წელი|წელი, დღე, წუთი|დღე, წუთი, წელი|წუთი, წელი, დღე|7',
  'საათი, კვირა, წელი|წელი, კვირა, საათი|კვირა, საათი, წელი|საათი, წელი, კვირა|8',
  'დღე, თვე, საუკუნე|საუკუნე, თვე, დღე|თვე, დღე, საუკუნე|დღე, საუკუნე, თვე|9',
  'წელი, ათწლეული, საუკუნე|საუკუნე, ათწლეული, წელი|ათწლეული, წელი, საუკუნე|წელი, საუკუნე, ათწლეული|10',
  'წამი, საათი, დღე|დღე, საათი, წამი|საათი, წამი, დღე|წამი, დღე, საათი|11',
  'საათი, თვე, წელი|წელი, თვე, საათი|თვე, საათი, წელი|საათი, წელი, თვე|12',
  'წუთი, კვირა, წელი|წელი, კვირა, წუთი|კვირა, წუთი, წელი|წუთი, წელი, კვირა|13',
  'დღე, წელი, საუკუნე|საუკუნე, წელი, დღე|წელი, დღე, საუკუნე|დღე, საუკუნე, წელი|14',
  'საათი, დღე, წელი|წელი, დღე, საათი|დღე, საათი, წელი|საათი, წელი, დღე|15',
  'წამი, დღე, წელი|წელი, დღე, წამი|დღე, წამი, წელი|წამი, წელი, დღე|16',
]
emit_template('g4-u12-03', 'u12-time-sequence', 2,
  'რომელია დროის ერთეულების სწორი დალაგება უმცირესიდან უდიდესამდე (ვარიანტი #{num})?',
  q03_vals,
  """      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      num: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },""",
  "(v) => String(v.ans)",
  "(v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)]",
  "({ answer }) => `სწორი თანმიმდევრობაა: ${answer}.`",
  is_options=True
)

# Q04: Days of the week sequence
q04_vals = [
  'ორშაბათის|სამშაბათი|ოთხშაბათი|ხუთშაბათი|პარასკევი',
  'სამშაბათის|ოთხშაბათი|ხუთშაბათი|პარასკევი|შაბათი',
  'ოთხშაბათის|ხუთშაბათი|პარასკევი|შაბათი|კვირა',
  'ხუთშაბათის|პარასკევი|შაბათი|კვირა|ორშაბათი',
  'პარასკევის|შაბათი|კვირა|ორშაბათი|სამშაბათი',
  'შაბათის|კვირა|ორშაბათი|სამშაბათი|ოთხშაბათი',
  'კვირის|ორშაბათი|სამშაბათი|ოთხშაბათი|ხუთშაბათი',
  'ორშაბათის მომდევნო დღის|სამშაბათი|ოთხშაბათი|ხუთშაბათი|პარასკევი',
  'სამშაბათის მომდევნო დღის|ოთხშაბათი|ხუთშაბათი|პარასკევი|შაბათი',
  'პარასკევის მომდევნო დღის|შაბათი|კვირა|ორშაბათი|სამშაბათი',
  'ოთხშაბათის მომდევნო დღის|ხუთშაბათი|პარასკევი|შაბათი|კვირა',
  'ხუთშაბათის მომდევნო დღის|პარასკევი|შაბათი|კვირა|ორშაბათი',
  'შაბათის მომდევნო დღის|კვირა|ორშაბათი|სამშაბათი|ოთხშაბათი',
  'კვირის მომდევნო დღის|ორშაბათი|სამშაბათი|ოთხშაბათი|ხუთშაბათი',
  'სამუშაო კვირის პირველი დღის|ორშაბათი|სამშაბათი|ოთხშაბათი|პარასკევი',
  'დასვენების პირველი დღის|შაბათი|კვირა|პარასკევი|ორშაბათი',
]
emit_template('g4-u12-04', 'u12-time-sequence', 2,
  'კვირის რომელი დღე მოდის {day} შემდეგ?',
  q04_vals,
  """      day: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },""",
  "(v) => String(v.ans)",
  "(v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)]",
  "({ vars, answer }) => `${vars.day} შემდეგ მოდის ${answer}.`",
  is_options=True
)

# Q05: Months sequence
q05_vals = [
  'იანვრის|თებერვალი|მარტი|აპრილი|დეკემბერი',
  'თებერვლის|მარტი|აპრილი|მაისი|იანვარი',
  'მარტის|აპრილი|მაისი|ივნისი|თებერვალი',
  'აპრილის|მაისი|ივნისი|ივლისი|მარტი',
  'მაისის|ივნისი|ივლისი|აგვისტო|აპრილი',
  'ივნისის|ივლისი|აგვისტო|სექტემბერი|მაისი',
  'ივლისის|აგვისტო|სექტემბერი|ოქტომბერი|ივნისი',
  'აგვისტოს|სექტემბერი|ოქტომბერი|ნოემბერი|ივლისი',
  'სექტემბრის|ოქტომბერი|ნოემბერი|დეკემბერი|აგვისტო',
  'ოქტომბრის|ნოემბერი|დეკემბერი|იანვარი|სექტემბერი',
  'ნოემბრის|დეკემბერი|იანვარი|თებერვალი|ოქტომბერი',
  'დეკემბრის|იანვარი|თებერვალი|მარტი|ნოემბერი',
  'გაზაფხულის პირველი თვის (მარტის)|აპრილი|მაისი|ივნისი|თებერვალი',
  'ზაფხულის პირველი თვის (ივნისის)|ივლისი|აგვისტო|სექტემბერი|მაისი',
  'შემოდგომის პირველი თვის (სექტემბრის)|ოქტომბერი|ნოემბერი|დეკემბერი|აგვისტო',
  'ზამთრის პირველი თვის (დეკემბრის)|იანვარი|თებერვალი|მარტი|ნოემბერი',
]
emit_template('g4-u12-05', 'u12-time-sequence', 3,
  'რომელი თვე მოდის {month} შემდეგ?',
  q05_vals,
  """      month: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      w1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[2]] },
      w2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },
      w3: { kind: 'choice', values: (v) => [String(v.spec).split('|')[4]] },""",
  "(v) => String(v.ans)",
  "(v) => [String(v.ans), String(v.w1), String(v.w2), String(v.w3)]",
  "({ vars, answer }) => `${vars.month} შემდეგ მოდის ${answer}.`",
  is_options=True
)

# Q06: Seasons sequence
q06_vals = [
  'ზამთრის|გაზაფხული|ზაფხული|შემოდგომა',
  'გაზაფხულის|ზაფხული|შემოდგომა|ზამთარი',
  'ზაფხულის|შემოდგომა|ზამთარი|გაზაფხული',
  'შემოდგომის|ზამთარი|გაზაფხული|ზაფხული',
  'ცივი ზამთრის|გაზაფხული|ზაფხული|შემოდგომა',
  'ყვავილოვანი გაზაფხულის|ზაფხული|შემოდგომა|ზამთარი',
  'ცხელი ზაფხულის|შემოდგომა|ზამთარი|გაზაფხული',
  'ოქროსფერი შემოდგომის|ზამთარი|გაზაფხული|ზაფხული',
  'წელიწადის პირველი სეზონის (ზამთრის)|გაზაფხული|ზაფხული|შემოდგომა',
  'წელიწადის მეორე სეზონის (გაზაფხულის)|ზაფხული|შემოდგომა|ზამთარი',
  'წელიწადის მესამე სეზონის (ზაფხულის)|შემოდგომა|ზამთარი|გაზაფხული',
  'წელიწადის მეოთხე სეზონის (შემოდგომის)|ზამთარი|გაზაფხული|ზაფხული',
  'ზამთრის სეზონის|გაზაფხული|ზაფხული|შემოდგომა',
  'გაზაფხულის სეზონის|ზაფხული|შემოდგომა|ზამთარი',
  'ზაფხულის სეზონის|შემოდგომა|ზამთარი|გაზაფხული',
  'შემოდგომის სეზონის|ზამთარი|გაზაფხული|ზაფხული',
]
emit_template('g4-u12-06', 'u12-time-sequence', 3,
  'რომელი წელიწადის დრო მოდის {season} შემდეგ?',
  q06_vals,
  """      season: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },""",
  "(v) => String(v.ans)",
  "() => ['გაზაფხული', 'ზაფხული', 'შემოდგომა', 'ზამთარი']",
  "({ vars, answer }) => `${vars.season} შემდეგ მოდის ${answer}.`",
  is_options=True
)

# ----------------- U12.2: u12-time-unit-conversion -----------------
# Q07: Hours to minutes (e.g. 3 hrs -> 180 mins)
q07_vals = [f"{h}|{h*60}" for h in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20]]
emit_template('g4-u12-07', 'u12-time-unit-conversion', 1,
  'რამდენი წუთია {h} საათში?',
  q07_vals,
  """      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 30, 60)",
  "({ vars, answer }) => `1 საათი = 60 წუთი, ამიტომ ${vars.h} საათი = ${vars.h} × 60 = ${answer} წუთი.`"
)

# Q08: Minutes to seconds (e.g. 2 mins -> 120 secs)
q08_vals = [f"{m}|{m*60}" for m in [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 25, 30, 40, 50]]
emit_template('g4-u12-08', 'u12-time-unit-conversion', 1,
  'რამდენი წამია {m} წუთში?',
  q08_vals,
  """      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 30, 60)",
  "({ vars, answer }) => `1 წუთი = 60 წამი, ამიტომ ${vars.m} წუთი = ${vars.m} × 60 = ${answer} წამი.`"
)

# Q09: Minutes to hours (e.g. 180 mins -> 3 hrs)
q09_vals = [f"{h*60}|{h}" for h in [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 18, 20, 24, 25]]
emit_template('g4-u12-09', 'u12-time-unit-conversion', 2,
  'რამდენი საათია {m} წუთი?',
  q09_vals,
  """      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `60 წუთი = 1 საათი, ამიტომ ${vars.m} წუთი = ${vars.m} ÷ 60 = ${answer} საათი.`"
)

# Q10: Weeks to days (e.g. 2 weeks -> 14 days)
q10_vals = [f"{w}|{w*7}" for w in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 20, 25]]
emit_template('g4-u12-10', 'u12-time-unit-conversion', 2,
  'რამდენი დღეა {w} კვირაში?',
  q10_vals,
  """      w: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 7, 7)",
  "({ vars, answer }) => `1 კვირა = 7 დღე, ამიტომ ${vars.w} კვირა = ${vars.w} × 7 = ${answer} დღე.`"
)

# Q11: Years to months (e.g. 3 years -> 36 months)
q11_vals = [f"{y}|{y*12}" for y in [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25, 30, 50]]
emit_template('g4-u12-11', 'u12-time-unit-conversion', 3,
  'რამდენი თვეა {y} წელიწადში?',
  q11_vals,
  """      y: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 6, 12)",
  "({ vars, answer }) => `1 წელიწადი = 12 თვე, ამიტომ ${vars.y} წელიწადი = ${vars.y} × 12 = ${answer} თვე.`"
)

# Q12: Hours and minutes to minutes (e.g. 2 hrs 15 mins -> 135 mins)
q12_vals = [
  '2|15|135', '3|20|200', '1|45|105', '4|10|250', '2|30|150', '3|40|220',
  '5|15|315', '2|50|170', '4|30|270', '1|25|85', '3|15|195', '2|40|160',
  '4|45|285', '5|20|320', '1|50|110', '2|25|145', '3|35|215', '4|20|260'
]
emit_template('g4-u12-12', 'u12-time-unit-conversion', 3,
  'რამდენი წუთია {h} საათსა და {m} წუთში?',
  q12_vals,
  """      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 10, 10)",
  "({ vars, answer }) => `${vars.h} საათი = ${Number(vars.h) * 60} წუთი. სულ: ${Number(vars.h) * 60} + ${vars.m} = ${answer} წუთი.`"
)

# ----------------- U12.3: u12-time-operations -----------------
# Q13: Add hours and minutes without minute overflow
q13_vals = [
  '2|30|1|20|3|50', '3|15|2|25|5|40', '4|10|3|30|7|40', '1|40|2|15|3|55',
  '5|20|2|20|7|40', '3|30|4|15|7|45', '2|15|3|30|5|45', '6|10|1|40|7|50',
  '4|25|2|25|6|50', '5|15|3|20|8|35', '1|20|4|30|5|50', '3|25|2|30|5|55',
  '2|40|3|10|5|50', '4|15|1|35|5|50', '5|25|2|15|7|40', '6|20|2|30|8|50'
]
emit_template('g4-u12-13', 'u12-time-operations', 1,
  'გამოთვალე: {h1} სთ {m1} წთ + {h2} სთ {m2} წთ.',
  q13_vals,
  """      h1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      h2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      hAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      mAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },""",
  "(v) => `${v.hAns} სთ ${v.mAns} წთ`",
  """(ctx) => [
      `${Number(ctx.vars.hAns) + 1} სთ ${ctx.vars.mAns} წთ`,
      `${ctx.vars.hAns} სთ ${Number(ctx.vars.mAns) + 10} წთ`,
      `${Math.max(1, Number(ctx.vars.hAns) - 1)} სთ ${ctx.vars.mAns} წთ`,
    ]""",
  "({ vars, answer }) => `${vars.h1} სთ + ${vars.h2} სთ = ${vars.hAns} სთ, ${vars.m1} წთ + ${vars.m2} წთ = ${vars.mAns} წთ. სულ: ${answer}.`"
)

# Q14: Subtract hours and minutes without minute borrow
q14_vals = [
  '5|15|2|10|3|5', '6|40|2|20|4|20', '7|35|3|15|4|20', '8|50|4|25|4|25',
  '5|45|1|30|4|15', '9|30|5|10|4|20', '4|40|2|15|2|25', '7|55|3|25|4|30',
  '6|35|2|15|4|20', '8|45|3|20|5|25', '5|50|2|30|3|20', '9|40|4|15|5|25',
  '7|30|3|10|4|20', '6|25|1|15|5|10', '8|55|2|35|6|20', '4|35|1|20|3|15'
]
emit_template('g4-u12-14', 'u12-time-operations', 1,
  'გამოთვალე: {h1} სთ {m1} წთ − {h2} სთ {m2} წთ.',
  q14_vals,
  """      h1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      h2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      hAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      mAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },""",
  "(v) => `${v.hAns} სთ ${v.mAns} წთ`",
  """(ctx) => [
      `${Number(ctx.vars.hAns) + 1} სთ ${ctx.vars.mAns} წთ`,
      `${ctx.vars.hAns} სთ ${Number(ctx.vars.mAns) + 10} წთ`,
      `${Math.max(1, Number(ctx.vars.hAns) - 1)} სთ ${ctx.vars.mAns} წთ`,
    ]""",
  "({ vars, answer }) => `${vars.h1} − ${vars.h2} = ${vars.hAns} სთ, ხოლო ${vars.m1} − ${vars.m2} = ${vars.mAns} წთ. შედეგი: ${answer}.`"
)

# Q15: Add minutes and seconds
q15_vals = [
  '3|40|2|15|5|55', '4|20|3|30|7|50', '2|35|1|20|3|55', '5|15|2|40|7|55',
  '6|10|2|45|8|55', '3|25|4|25|7|50', '4|30|2|15|6|45', '1|40|3|15|4|55',
  '5|20|1|30|6|50', '3|35|2|20|5|55', '4|15|3|35|7|50', '2|45|1|10|3|55',
  '6|20|3|25|9|45', '5|30|2|15|7|45', '4|25|1|30|5|55', '3|10|4|40|7|50'
]
emit_template('g4-u12-15', 'u12-time-operations', 2,
  'გამოთვალე: {m1} წთ {s1} წმ + {m2} წთ {s2} წმ.',
  q15_vals,
  """      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      s1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      s2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      mAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      sAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },""",
  "(v) => `${v.mAns} წთ ${v.sAns} წმ`",
  """(ctx) => [
      `${Number(ctx.vars.mAns) + 1} წთ ${ctx.vars.sAns} წმ`,
      `${ctx.vars.mAns} წთ ${Number(ctx.vars.sAns) - 10} წმ`,
      `${Math.max(1, Number(ctx.vars.mAns) - 1)} წთ ${ctx.vars.sAns} წმ`,
    ]""",
  "({ vars, answer }) => `${vars.m1} + ${vars.m2} = ${vars.mAns} წთ, ${vars.s1} + ${vars.s2} = ${vars.sAns} წმ. შედეგი: ${answer}.`"
)

# Q16: Subtract minutes and seconds with borrow
q16_vals = [
  '8|20|3|35|4|45', '7|15|2|40|4|35', '6|10|1|30|4|40', '9|25|4|45|4|40',
  '5|20|2|50|2|30', '8|10|3|40|4|30', '7|30|2|50|4|40', '6|15|3|45|2|30',
  '9|10|5|30|3|40', '8|25|3|50|4|35', '7|20|1|45|5|35', '6|05|2|35|3|30',
  '10|15|4|40|5|35', '8|30|3|55|4|35', '7|10|2|30|4|40', '9|15|3|45|5|30'
]
emit_template('g4-u12-16', 'u12-time-operations', 2,
  'გამოთვალე: {m1} წთ {s1} წმ − {m2} წთ {s2} წმ.',
  q16_vals,
  """      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      s1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      s2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      mAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      sAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },""",
  "(v) => `${v.mAns} წთ ${v.sAns} წმ`",
  """(ctx) => [
      `${Number(ctx.vars.mAns) + 1} წთ ${ctx.vars.sAns} წმ`,
      `${ctx.vars.mAns} წთ ${Number(ctx.vars.sAns) - 10} წმ`,
      `${Math.max(1, Number(ctx.vars.mAns) - 1)} წთ ${ctx.vars.sAns} წმ`,
    ]""",
  "({ vars, answer }) => `1 წუთი გადავიტანოთ წამებში: ${Number(vars.m1) - 1} წთ და ${Number(vars.s1) + 60} წმ. გამოკლებით მიიღება: ${answer}.`"
)

# Q17: Days and hours in hours (e.g. 1 day + 12 hrs = 36 hrs)
q17_vals = [
  '1|12|36', '2|6|54', '1|18|42', '3|4|76', '2|10|58', '1|8|32',
  '2|12|60', '3|8|80', '1|15|39', '2|4|52', '1|6|30', '3|12|84',
  '2|16|64', '1|20|44', '3|6|78', '2|14|62', '1|10|34', '2|8|56'
]
emit_template('g4-u12-17', 'u12-time-operations', 3,
  'გამოთვალე: {d} დღე + {h} საათი. პასუხი ჩაწერე საათებში.',
  q17_vals,
  """      d: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 6, 6)",
  "({ vars, answer }) => `1 დღე = 24 საათი. ${vars.d} დღე = ${Number(vars.d) * 24} სთ. სულ: ${Number(vars.d) * 24} + ${vars.h} = ${answer} საათი.`"
)

# Q18: Add hours and minutes with minute overflow
q18_vals = [
  '4|10|2|55|7|5', '3|45|2|30|6|15', '5|40|1|35|7|15', '2|50|3|20|6|10',
  '4|35|2|45|7|20', '3|55|1|25|5|20', '6|30|2|40|9|10', '4|50|3|30|8|20',
  '5|25|2|50|8|15', '3|40|2|40|6|20', '4|45|1|30|6|15', '2|35|3|45|6|20',
  '5|50|2|20|8|10', '3|30|4|45|8|15', '4|40|3|35|8|15', '6|25|1|50|8|15'
]
emit_template('g4-u12-18', 'u12-time-operations', 3,
  'გამოთვალე: {h1} სთ {m1} წთ + {h2} სთ {m2} წთ.',
  q18_vals,
  """      h1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      m1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      h2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },
      hAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[4])] },
      mAns: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[5])] },""",
  "(v) => `${v.hAns} სთ ${v.mAns} წთ`",
  """(ctx) => [
      `${Number(ctx.vars.hAns) + 1} სთ ${ctx.vars.mAns} წთ`,
      `${ctx.vars.hAns} სთ ${Number(ctx.vars.mAns) + 10} წთ`,
      `${Math.max(1, Number(ctx.vars.hAns) - 1)} სთ ${ctx.vars.mAns} წთ`,
    ]""",
  "({ vars, answer }) => `წუთების ჯამია ${Number(vars.m1) + Number(vars.m2)} წთ, რაც არის 1 სთ და ${vars.mAns} წთ. სულ: ${answer}.`"
)

# ----------------- U12.4: u12-elapsed-time -----------------
# Q19: Lesson duration (e.g. 09:00 to 09:45 -> 45 mins)
q19_vals = [
  '09:00|09:45|45', '10:00|10:45|45', '11:15|12:00|45', '13:00|13:40|40',
  '14:10|14:50|40', '15:00|15:35|35', '08:30|09:15|45', '12:00|12:50|50',
  '16:00|16:45|45', '09:10|09:55|45', '11:00|11:40|40', '14:00|14:50|50',
  '10:15|10:55|40', '13:10|13:55|45', '15:15|15:50|35', '17:00|17:45|45'
]
emit_template('g4-u12-19', 'u12-elapsed-time', 1,
  'გაკვეთილი დაიწყო {t1} საათზე და დასრულდა {t2} საათზე. რამდენ ხანს გაგრძელდა გაკვეთილი?',
  q19_vals,
  """      t1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => `${v.ans} წუთი`",
  """(ctx) => [
      `${Number(ctx.vars.ans) + 10} წუთი`,
      `${Math.max(10, Number(ctx.vars.ans) - 10)} წუთი`,
      `${Number(ctx.vars.ans) + 5} წუთი`,
    ]""",
  "({ vars, answer }) => `${vars.t1}-დან ${vars.t2}-მდე გავიდა ${answer}.`"
)

# Q20: Movie duration across an hour (e.g. 17:20 to 19:00 -> 1 სთ 40 წთ)
q20_vals = [
  '17:20|19:00|1|40', '18:15|20:00|1|45', '16:30|18:00|1|30', '19:10|21:00|1|50',
  '15:40|17:00|1|20', '14:25|16:00|1|35', '20:15|22:00|1|45', '13:30|15:00|1|30',
  '17:10|19:00|1|50', '18:40|20:00|1|20', '16:15|18:00|1|45', '19:20|21:00|1|40',
  '15:30|17:00|1|30', '14:45|16:00|1|15', '20:20|22:00|1|40', '18:25|20:00|1|35'
]
emit_template('g4-u12-20', 'u12-elapsed-time', 1,
  'ფილმი დაიწყო {t1} საათზე და დასრულდა {t2} საათზე. რამდენ ხანს გაგრძელდა ფილმი?',
  q20_vals,
  """      t1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => `${v.h} სთ ${v.m} წთ`",
  """(ctx) => [
      `${Number(ctx.vars.h) + 1} სთ ${ctx.vars.m} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) - 10} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) + 10} წთ`,
    ]""",
  "({ vars, answer }) => `გასული დროა: ${answer}.`"
)

# Q21: Bus departure and arrival
q21_vals = [
  '10:15|12:00|1|45', '09:20|11:00|1|40', '11:30|13:00|1|30', '08:10|10:00|1|50',
  '13:25|15:00|1|35', '14:15|16:00|1|45', '07:40|09:00|1|20', '12:30|14:00|1|30',
  '15:10|17:00|1|50', '16:20|18:00|1|40', '10:35|12:00|1|25', '11:10|13:00|1|50',
  '08:45|10:00|1|15', '13:15|15:00|1|45', '14:30|16:00|1|30', '09:40|11:00|1|20'
]
emit_template('g4-u12-21', 'u12-elapsed-time', 2,
  'ავტობუსი გავიდა {t1} საათზე და დანიშნულების ადგილზე მივიდა {t2} საათზე. რამდენი დრო გავიდა?',
  q21_vals,
  """      t1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => `${v.h} სთ ${v.m} წთ`",
  """(ctx) => [
      `${Number(ctx.vars.h) + 1} სთ ${ctx.vars.m} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) - 10} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) + 10} წთ`,
    ]""",
  "({ vars, answer }) => `მგზავრობის ხანგრძლივობაა: ${answer}.`"
)

# Q22: Homework / studying time
q22_vals = [
  '16:30|17:50|1|20', '15:20|16:45|1|25', '17:10|18:30|1|20', '14:40|16:10|1|30',
  '18:15|19:40|1|25', '16:20|17:35|1|15', '15:30|17:00|1|30', '17:45|19:15|1|30',
  '14:20|15:50|1|30', '16:10|17:40|1|30', '15:15|16:40|1|25', '18:30|19:45|1|15',
  '13:40|15:00|1|20', '17:25|18:50|1|25', '16:05|17:35|1|30', '14:50|16:20|1|30'
]
emit_template('g4-u12-22', 'u12-elapsed-time', 2,
  'ნინომ მეცადინეობა დაიწყო {t1} საათზე და დაასრულა {t2} საათზე. რამდენ ხანს მეცადინეობდა ნინო?',
  q22_vals,
  """      t1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => `${v.h} სთ ${v.m} წთ`",
  """(ctx) => [
      `${Number(ctx.vars.h) + 1} სთ ${ctx.vars.m} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) - 10} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) + 10} წთ`,
    ]""",
  "({ vars, answer }) => `ნინო მეცადინეობდა: ${answer}.`"
)

# Q23: Match duration
q23_vals = [
  '14:10|15:40|1|30', '16:20|17:50|1|30', '13:15|14:45|1|30', '15:00|16:30|1|30',
  '17:30|19:00|1|30', '12:40|14:10|1|30', '18:10|19:40|1|30', '14:30|16:00|1|30',
  '15:45|17:15|1|30', '16:00|17:30|1|30', '13:30|15:00|1|30', '17:15|18:45|1|30',
  '14:50|16:20|1|30', '18:00|19:30|1|30', '12:15|13:45|1|30', '16:40|18:10|1|30'
]
emit_template('g4-u12-23', 'u12-elapsed-time', 3,
  'ფეხბურთის თამაში დაიწყო {t1} საათზე და დასრულდა {t2} საათზე. რამდენ ხანს გაგრძელდა თამაში?',
  q23_vals,
  """      t1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      t2: { kind: 'choice', values: (v) => [String(v.spec).split('|')[1]] },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => `${v.h} სთ ${v.m} წთ`",
  """(ctx) => [
      `${Number(ctx.vars.h) + 1} სთ ${ctx.vars.m} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) - 15} წთ`,
      `${ctx.vars.h} სთ ${Number(ctx.vars.m) + 15} წთ`,
    ]""",
  "({ vars, answer }) => `თამაში გაგრძელდა: ${answer}.`"
)

# Q24: Train arrival time given start and duration
q24_vals = [
  '08:25|2|35|11:00', '09:15|1|45|11:00', '10:20|2|40|13:00', '07:30|3|30|11:00',
  '12:10|1|50|14:00', '13:25|2|35|16:00', '08:40|2|20|11:00', '11:15|2|45|14:00',
  '14:20|1|40|16:00', '09:30|2|30|12:00', '10:45|1|15|12:00', '15:10|2|50|18:00',
  '07:15|2|45|10:00', '12:35|1|25|14:00', '13:40|2|20|16:00', '16:25|1|35|18:00'
]
emit_template('g4-u12-24', 'u12-elapsed-time', 3,
  'მატარებელი გავიდა {t1} საათზე. მგზავრობა {dur_h} საათსა და {dur_m} წუთს გაგრძელდა. რომელ საათზე მივიდა მატარებელი დანიშნულების ადგილზე?',
  q24_vals,
  """      t1: { kind: 'choice', values: (v) => [String(v.spec).split('|')[0]] },
      dur_h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      dur_m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [String(v.spec).split('|')[3]] },""",
  "(v) => String(v.ans)",
  """(ctx) => {
      const parts = String(ctx.vars.ans).split(':');
      const h = Number(parts[0]);
      return [
        `${String(h + 1).padStart(2, '0')}:00`,
        `${String(Math.max(1, h - 1)).padStart(2, '0')}:00`,
        `${String(h).padStart(2, '0')}:30`,
      ];
    }""",
  "({ vars, answer }) => `${vars.t1}-ს რომ დავუმატოთ ${vars.dur_h} სთ და ${vars.dur_m} წთ, მივიღებთ ${answer}-ს.`"
)

# ----------------- U12.5: u12-age-problems -----------------
# Q25: Age difference (e.g. Ana 9, brother 12 -> 3 yrs)
q25_vals = [
  '9|12|3', '8|13|5', '7|11|4', '10|15|5', '6|12|6', '9|14|5',
  '11|16|5', '8|14|6', '7|12|5', '10|14|4', '9|15|6', '8|11|3',
  '6|10|4', '11|15|4', '7|13|6', '10|16|6', '8|15|7', '9|13|4'
]
emit_template('g4-u12-25', 'u12-age-problems', 1,
  'ანა {a1} წლისაა, მისი ძმა კი {a2} წლის. რამდენი წლით უფროსია ძმა?',
  q25_vals,
  """      a1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      a2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `${vars.a2} − ${vars.a1} = ${answer} წლით უფროსია.`"
)

# Q26: Age ratio (e.g. father 40, son 10 -> 4 times)
q26_vals = [
  '40|10|4', '36|9|4', '30|10|3', '45|9|5', '35|7|5', '32|8|4',
  '48|8|6', '42|7|6', '50|10|5', '36|12|3', '24|8|3', '28|7|4',
  '45|15|3', '40|8|5', '48|12|4', '36|6|6', '54|9|6', '30|6|5'
]
emit_template('g4-u12-26', 'u12-age-problems', 1,
  'მამა {af} წლისაა, შვილი კი {as} წლის. რამდენჯერ მეტია მამის ასაკი შვილის ასაკზე?',
  q26_vals,
  """      af: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      as: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `${vars.af} ÷ ${vars.as} = ${answer}-ჯერ მეტია.`"
)

# Q27: Age after X years
q27_vals = [
  '11|4|15', '9|5|14', '12|3|15', '10|6|16', '8|7|15', '13|4|17',
  '7|8|15', '11|6|17', '10|5|15', '9|7|16', '12|5|17', '8|6|14',
  '14|3|17', '10|4|14', '11|5|16', '9|6|15', '12|4|16', '13|5|18'
]
emit_template('g4-u12-27', 'u12-age-problems', 2,
  'ნიკა {age} წლისაა. რამდენი წლის იქნება {years} წლის შემდეგ?',
  q27_vals,
  """      age: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      years: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `${vars.age} + ${vars.years} = ${answer} წლის იქნება.`"
)

# Q28: Age X years ago
q28_vals = [
  '14|3|11', '15|4|11', '12|5|7', '16|6|10', '13|4|9', '17|5|12',
  '11|3|8', '14|5|9', '15|6|9', '18|4|14', '12|4|8', '16|5|11',
  '13|5|8', '15|3|12', '14|6|8', '17|4|13', '12|3|9', '16|7|9'
]
emit_template('g4-u12-28', 'u12-age-problems', 2,
  'მარიამი {age} წლისაა. რამდენი წლის იყო {years} წლის წინ?',
  q28_vals,
  """      age: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      years: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `${vars.age} − ${vars.years} = ${answer} წლის იყო.`"
)

# Q29: Future age of sibling when brother reaches age
q29_vals = [
  '8|13|12|17', '7|12|10|15', '9|14|13|18', '6|11|10|15', '8|15|11|18', '7|14|12|19',
  '10|16|14|20', '6|13|11|18', '8|12|11|15', '9|15|12|18', '7|11|13|17', '8|14|13|19',
  '10|15|13|18', '6|12|9|15', '7|13|11|17', '9|16|12|19', '8|13|14|19', '5|12|10|17'
]
emit_template('g4-u12-29', 'u12-age-problems', 3,
  'გიორგი {b1} წლისაა, მისი და კი {s1} წლის. რამდენი წლის იქნება და, როცა გიორგი {b2} წლის გახდება?',
  q29_vals,
  """      b1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      s1: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      b2: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `გიორგი გაიზრდება ${Number(vars.b2) - Number(vars.b1)} წლით. მისი დაც ${Number(vars.b2) - Number(vars.b1)} წლით გაიზრდება: ${vars.s1} + ${Number(vars.b2) - Number(vars.b1)} = ${answer} წლის.`"
)

# Q30: Years until mother's age is twice child's age
# If mother is M and child is C, M + x = 2*(C + x) => x = M - 2*C
q30_vals = [
  '36|12|12', '40|15|10', '32|10|12', '38|14|10', '35|12|11', '42|16|10',
  '34|11|12', '44|17|10', '30|9|12', '40|14|12', '36|13|10', '42|15|12',
  '38|13|12', '44|16|12', '32|9|14', '35|11|13', '40|13|14', '36|11|14'
]
emit_template('g4-u12-30', 'u12-age-problems', 3,
  'დედა {am} წლისაა, შვილი კი {ac} წლის. რამდენი წლის შემდეგ იქნება დედის ასაკი შვილის ასაკზე ორჯერ მეტი?',
  q30_vals,
  """      am: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      ac: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `ასაკთა სხვაობაა ${Number(vars.am) - Number(vars.ac)} წელი. როცა დედის ასაკი შვილისაზე 2-ჯერ მეტი იქნება, შვილის ასაკი იქნება ${Number(vars.am) - Number(vars.ac)} წელი. ამიტომ გავა ${Number(vars.am) - 2 * Number(vars.ac)} = ${answer} წელი.`"
)

# ----------------- U12.6: u12-work-rate-time -----------------
# Q31: Distance in hours (speed * time)
q31_vals = [
  '60|3|180', '50|4|200', '70|2|140', '80|3|240', '40|5|200', '65|2|130',
  '75|3|225', '55|4|220', '90|2|180', '60|4|240', '70|3|210', '50|5|250',
  '80|4|320', '45|3|135', '65|3|195', '75|4|300', '85|2|170', '60|5|300'
]
emit_template('g4-u12-31', 'u12-work-rate-time', 1,
  'მანქანა ერთ საათში {v} კმ-ს გადის. რამდენ კილომეტრს გაივლის {t} საათში, თუ სიჩქარე უცვლელია?',
  q31_vals,
  """      v: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 10, 10)",
  "({ vars, answer }) => `${vars.v} × ${vars.t} = ${answer} კმ.`"
)

# Q32: Worker items produced
q32_vals = [
  '8|5|40', '7|6|42', '9|4|36', '6|7|42', '10|5|50', '8|4|32',
  '12|3|36', '7|5|35', '9|5|45', '11|4|44', '6|8|48', '8|6|48',
  '10|4|40', '7|7|49', '9|6|54', '12|4|48', '8|7|56', '10|6|60'
]
emit_template('g4-u12-32', 'u12-work-rate-time', 1,
  'მუშა ერთ საათში {rate} ნივთს ამზადებს. რამდენ ნივთს დაამზადებს {t} საათში?',
  q32_vals,
  """      rate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 2, 2)",
  "({ vars, answer }) => `${vars.rate} × ${vars.t} = ${answer} ნივთს დაამზადებს.`"
)

# Q33: Water tap flow
q33_vals = [
  '4|6|24', '5|7|35', '3|8|24', '6|5|30', '4|9|36', '7|4|28',
  '5|6|30', '8|3|24', '6|7|42', '4|8|32', '5|8|40', '7|5|35',
  '6|6|36', '8|4|32', '3|9|27', '5|9|45', '7|6|42', '4|7|28'
]
emit_template('g4-u12-33', 'u12-work-rate-time', 2,
  'ონკანიდან ერთ წუთში {flow} ლიტრი წყალი ჩაედინება ავზში. რამდენი ლიტრი წყალი ჩაედინება {t} წუთში?',
  q33_vals,
  """      flow: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 2, 2)",
  "({ vars, answer }) => `${vars.flow} × ${vars.t} = ${answer} ლიტრი ჩაედინება.`"
)

# Q34: Printer page output
q34_vals = [
  '12|4|48', '15|3|45', '10|6|60', '14|4|56', '20|3|60', '16|3|48',
  '18|4|72', '12|5|60', '15|4|60', '25|2|50', '14|5|70', '16|4|64',
  '20|4|80', '18|3|54', '15|5|75', '12|6|72', '22|3|66', '25|3|75'
]
emit_template('g4-u12-34', 'u12-work-rate-time', 2,
  'პრინტერი ერთ წუთში {pages} გვერდს ბეჭდავს. რამდენ გვერდს დაბეჭდავს {t} წუთში?',
  q34_vals,
  """      pages: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 4, 4)",
  "({ vars, answer }) => `${vars.pages} × ${vars.t} = ${answer} გვერდს დაბეჭდავს.`"
)

# Q35: Tree watering
q35_vals = [
  '15|3|45', '12|4|48', '14|3|42', '16|3|48', '20|4|80', '18|3|54',
  '15|4|60', '25|2|50', '10|5|50', '22|3|66', '14|4|56', '16|4|64',
  '18|4|72', '20|3|60', '15|5|75', '12|5|60', '25|3|75', '30|2|60'
]
emit_template('g4-u12-35', 'u12-work-rate-time', 3,
  'ბაღში ყოველ საათში {trees} ხეს რწყავენ. რამდენ ხეს მორწყავენ {t} საათში?',
  q35_vals,
  """      trees: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `${vars.trees} × ${vars.t} = ${answer} ხეს მორწყავენ.`"
)

# Q36: Reading pages with fractional hours (e.g. 20 pgs/hr, 2 hrs 30 mins -> 50 pages)
# Rate * 2.5 = 2.5 * Rate
q36_vals = [
  '20|2|30|50', '16|2|30|40', '24|2|30|60', '12|2|30|30', '18|2|30|45', '28|2|30|70',
  '30|1|30|45', '20|1|30|30', '16|1|30|24', '24|1|30|36', '32|1|30|48', '40|1|30|60',
  '20|3|30|70', '16|3|30|56', '24|3|30|84', '18|1|30|27', '22|2|30|55', '26|2|30|65'
]
emit_template('g4-u12-36', 'u12-work-rate-time', 3,
  'მოსწავლე ერთ საათში {rate} გვერდს კითხულობს. რამდენ გვერდს წაიკითხავს {h} საათსა და {m} წუთში, თუ კითხვის ტემპი უცვლელია?',
  q36_vals,
  """      rate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      h: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      m: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[3])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `${vars.h} საათში წაიკითხავს ${Number(vars.rate) * Number(vars.h)} გვერდს, ნახევარ საათში — ${Number(vars.rate) / 2} გვერდს. სულ: ${answer} გვერდი.`"
)

# ----------------- U12.7: u12-hourly-rate -----------------
# Q37: 12 GEL/hr for 3 hrs
q37_vals = [
  '12|3|36', '10|4|40', '15|3|45', '14|2|28', '20|3|60', '16|2|32',
  '11|4|44', '18|2|36', '13|3|39', '25|2|50', '15|4|60', '12|5|60',
  '14|3|42', '16|3|48', '20|4|80', '18|3|54', '22|2|44', '15|5|75'
]
emit_template('g4-u12-37', 'u12-hourly-rate', 1,
  'სამუშაოს ერთი საათის ღირებულებაა {rate} ლარი. რამდენი ლარი ეღირება {t} საათის სამუშაო?',
  q37_vals,
  """      rate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `${vars.rate} × ${vars.t} = ${answer} ლარი.`"
)

# Q38: Babysitting cost
q38_vals = [
  '10|4|40', '12|3|36', '15|2|30', '14|3|42', '8|5|40', '11|4|44',
  '9|5|45', '10|6|60', '12|4|48', '15|3|45', '16|2|32', '8|6|48',
  '10|5|50', '12|5|60', '14|4|56', '9|6|54', '11|5|55', '15|4|60'
]
emit_template('g4-u12-38', 'u12-hourly-rate', 1,
  'ძიძის მომსახურება საათში {rate} ლარი ღირს. რამდენი უნდა გადაიხადონ {t} საათში?',
  q38_vals,
  """      rate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `${vars.rate} × ${vars.t} = ${answer} ლარი.`"
)

# Q39: Car rental
q39_vals = [
  '15|2|30', '20|3|60', '25|2|50', '18|3|54', '30|2|60', '16|4|64',
  '22|2|44', '15|4|60', '35|2|70', '24|3|72', '20|4|80', '18|2|36',
  '25|3|75', '30|3|90', '15|5|75', '22|3|66', '16|3|48', '28|2|56'
]
emit_template('g4-u12-39', 'u12-hourly-rate', 2,
  'მანქანის დაქირავება საათში {rate} ლარი ღირს. რა ეღირება {t} საათით დაქირავება?',
  q39_vals,
  """      rate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 5, 5)",
  "({ vars, answer }) => `${vars.rate} × ${vars.t} = ${answer} ლარი.`"
)

# Q40: Teacher lesson price
q40_vals = [
  '25|3|75', '30|2|60', '20|4|80', '35|2|70', '15|4|60', '25|4|100',
  '40|2|80', '30|3|90', '20|5|100', '35|3|105', '18|3|54', '22|3|66',
  '25|2|50', '24|3|72', '30|4|120', '40|3|120', '15|5|75', '28|2|56'
]
emit_template('g4-u12-40', 'u12-hourly-rate', 2,
  'მასწავლებლის ერთი გაკვეთილი, რომელიც 1 საათს გრძელდება, {rate} ლარი ღირს. რამდენი ლარი ეღირება {n} ასეთი გაკვეთილი?',
  q40_vals,
  """      rate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      n: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 10, 10)",
  "({ vars, answer }) => `${vars.rate} × ${vars.n} = ${answer} ლარი.`"
)

# Q41: Find hourly rate from total
q41_vals = [
  '5|60|12', '4|48|12', '6|90|15', '3|45|15', '4|80|20', '5|100|20',
  '3|75|25', '6|72|12', '4|64|16', '5|70|14', '3|54|18', '7|70|10',
  '4|56|14', '5|85|17', '6|120|20', '3|66|22', '4|72|18', '5|75|15'
]
emit_template('g4-u12-41', 'u12-hourly-rate', 3,
  'სამუშაოს {t} საათში {total} ლარს იხდიან. რა არის ერთი საათის ღირებულება, თუ საათობრივი ფასი უცვლელია?',
  q41_vals,
  """      t: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      total: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `${vars.total} ÷ ${vars.t} = ${answer} ლარი.`"
)

# Q42: Find hours possible for given budget
q42_vals = [
  '18|90|5', '15|75|5', '20|80|4', '12|72|6', '25|100|4', '14|70|5',
  '16|64|4', '15|90|6', '20|100|5', '18|72|4', '22|66|3', '30|90|3',
  '12|60|5', '14|84|6', '25|75|3', '16|80|5', '15|60|4', '20|60|3'
]
emit_template('g4-u12-42', 'u12-hourly-rate', 3,
  'მომსახურება საათში {rate} ლარი ღირს. რამდენი საათის მომსახურებაა შესაძლებელი {budget} ლარად, თუ სხვა გადასახადი არ არსებობს?',
  q42_vals,
  """      rate: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[0])] },
      budget: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[1])] },
      ans: { kind: 'choice', values: (v) => [Number(String(v.spec).split('|')[2])] },""",
  "(v) => Number(v.ans)",
  "(ctx) => nearMisses(Number(ctx.answer), 3, 1, 1)",
  "({ vars, answer }) => `${vars.budget} ÷ ${vars.rate} = ${answer} საათი.`"
)

output = header + "\n".join(templates) + footer
with open('src/practice/templates/g4-u12-time.ts', 'w') as f:
    f.write(output)
print(f'Successfully written src/practice/templates/g4-u12-time.ts with {len(templates)} QuestionTemplate definitions.')

import type { QuestionTemplate, Vars } from './types';
import { C, D, I, N, q6 } from './g6-helpers';
import { textOptions, unitOptions } from './g7-u08-proportion-percent';

/**
 * Grade VII — Unit 13: logic.
 *
 * Converted from the academy's Grade VII `U13` bank: 6 subtopics × 6 questions.
 *
 * Statements about numbers are generated from a drawn number and a property, so
 * the truth value is computed, never guessed. Verbal statements (negations,
 * converses, syllogisms, analogies) come from small hand-checked pools whose
 * answer and distractors are written out together: the distractors are the
 * typical mistakes — the inverse or contrapositive taken for the converse, "all"
 * negated by "none", a rule applied backwards.
 */

export const G7_U13_SUBTOPICS = ['u13-01', 'u13-02', 'u13-03', 'u13-04', 'u13-05', 'u13-06'] as const;

const T = 'g7-logic';
let seq = 0;
const nextId = (): string => `g7-u13-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic' | 'grade'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, grade: 7, ...spec });

const g = (v: Vars, key: string): number => N(v, key);
const TRUE = 'ჭეშმარიტია';
const FALSE = 'მცდარია';
const YES = 'კი';
const NO = 'არა';
const truth = (b: boolean): string => (b ? TRUE : FALSE);
const isPrime = (n: number): boolean => n > 1 && Array.from({ length: n - 2 }, (_, i) => i + 2).every((d) => n % d !== 0);
const divides = (a: number, b: number): boolean => a % b === 0;

/** A statement about a number: its text after the number and its truth. */
interface Prop {
  text: string;
  holds: (n: number) => boolean;
}
const PROPS: Prop[] = [
  { text: 'ლუწი რიცხვია', holds: (n) => n % 2 === 0 },
  { text: 'კენტი რიცხვია', holds: (n) => n % 2 === 1 },
  { text: 'მარტივი რიცხვია', holds: isPrime },
  { text: 'შედგენილი რიცხვია', holds: (n) => n > 1 && !isPrime(n) },
  { text: 'იყოფა 3-ზე', holds: (n) => n % 3 === 0 },
  { text: 'იყოფა 4-ზე', holds: (n) => n % 4 === 0 },
  { text: 'იყოფა 5-ზე', holds: (n) => n % 5 === 0 },
  { text: 'იყოფა 6-ზე', holds: (n) => n % 6 === 0 },
];
const DIVS = PROPS.slice(4);
/** The two draws that name a pair of different properties. */
const pairVars = (pool: Prop[]) => ({
  n: I(4, 40),
  pi: I(0, pool.length - 1),
  qi: I(0, pool.length - 1),
  P: D((v: Vars) => `${g(v, 'n')} ${pool[g(v, 'pi')]!.text}`),
  Q: D((v: Vars) => `${g(v, 'n')} ${pool[g(v, 'qi')]!.text}`),
});
const differ = (v: Vars): boolean => g(v, 'pi') !== g(v, 'qi');
const holdsP = (pool: Prop[], v: Vars): boolean => pool[g(v, 'pi')]!.holds(g(v, 'n'));
const holdsQ = (pool: Prop[], v: Vars): boolean => pool[g(v, 'qi')]!.holds(g(v, 'n'));
const TF = (_v: Vars, right: string): string[] => textOptions(right, [right === TRUE ? FALSE : TRUE]);
const word = (b: boolean): string => (b ? 'ჭეშმარიტია' : 'მცდარია');

/** Divisor pairs (a, b): b divides a, 1 < b < a. */
const IMPL: string[] = [];
for (const a of [4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24]) for (const b of [2, 3, 4, 5, 6, 7, 8, 9, 10, 12]) if (b < a && a % b === 0) IMPL.push(`${a}|${b}`);
const implVars = {
  ab: C(IMPL),
  a: D((v: Vars) => Number(String(v.ab).split('|')[0])),
  b: D((v: Vars) => Number(String(v.ab).split('|')[1])),
};

// ───────────────────────── hand-checked pools ─────────────────────────
const CLAIMS: Array<[string, boolean, string]> = [
  ['ყველა მარტივი რიცხვი კენტია', false, 'რიცხვი 2 მარტივია, მაგრამ ლუწია'],
  ['ყველა კენტი რიცხვი მარტივია', false, 'რიცხვი 9 კენტია, მაგრამ 3-ზე იყოფა'],
  ['ყველა 4-ის ჯერადი რიცხვი ლუწია', true, '4 = 2 · 2, ამიტომ 4-ის ყოველი ჯერადი 2-ზეც იყოფა'],
  ['ყველა ლუწი რიცხვი 4-ის ჯერადია', false, 'რიცხვი 6 ლუწია, მაგრამ 4-ზე არ იყოფა'],
  ['ყველა 5-ის ჯერადი რიცხვი 0-ზე ან 5-ზე მთავრდება', true, 'ყოველი ასეთი რიცხვის ბოლო ციფრი 0 ან 5-ია'],
  ['ყველა ორნიშნა რიცხვი 10-ზე მეტია', false, 'რიცხვი 10 ორნიშნაა, მაგრამ 10-ზე მეტი არ არის'],
  ['ყველა მთელი რიცხვის კვადრატი დადებითია', false, 'რიცხვი 0-ის კვადრატი 0-ია'],
  ['ყველა მარტივი რიცხვი 1-ზე მეტია', true, 'მარტივ რიცხვს ზუსტად ორი გამყოფი აქვს, 1-ს კი ერთი'],
  ['ყველა 9-ის ჯერადი რიცხვი 3-ზეც იყოფა', true, '9 = 3 · 3, ამიტომ 9-ის ყოველი ჯერადი 3-ზეც იყოფა'],
  ['ყველა შედგენილი რიცხვი ლუწია', false, 'რიცხვი 9 შედგენილია, მაგრამ კენტია'],
];
const SHAPES: Array<[string, boolean, string]> = [
  ['კვადრატის ყველა კუთხე მართია', true, 'კვადრატი მართკუთხედის ერთ-ერთი სახეა'],
  ['მართკუთხედის ყველა კუთხე მართია', true, 'ეს მართკუთხედის განმარტებაა'],
  ['რომბის ყველა კუთხე მართია', false, 'არამართკუთხა რომბის კუთხეები მართი არ არის'],
  ['პარალელოგრამის ყველა გვერდი ტოლია', false, 'მართკუთხედის გვერდები განსხვავებულია'],
  ['კვადრატის ყველა გვერდი ტოლია', true, 'ეს კვადრატის განმარტებაა'],
  ['ტრაპეციის ყველა გვერდი პარალელურია', false, 'ტრაპეციაში მხოლოდ ერთი წყვილი გვერდია პარალელური'],
  ['ტოლგვერდა სამკუთხედის ყველა გვერდი ტოლია', true, 'ეს ტოლგვერდა სამკუთხედის განმარტებაა'],
  ['მართკუთხედის დიაგონალები ტოლია', true, 'მართკუთხედის დიაგონალები ერთმანეთის ტოლი მონაკვეთებია'],
  ['რომბის დიაგონალები ტოლია', false, 'არამართკუთხა რომბის დიაგონალები სხვადასხვა სიგრძისაა'],
];
const POLY: Array<[string, number]> = [['სამკუთხედის', 3], ['ოთხკუთხედის', 4], ['ხუთკუთხედის', 5], ['ექვსკუთხედის', 6]];

// negation pools
const WHO: Array<[string, string]> = [['მოსწავლე', 'მოსწავლეს'], ['ბავშვი', 'ბავშვს'], ['მეზობელი', 'მეზობელს'], ['სპორტსმენი', 'სპორტსმენს'], ['მეგობარი', 'მეგობარს']];
const THINGS = ['ნაყინი', 'მუსიკა', 'ფეხბურთი', 'ჭადრაკი', 'ხატვა', 'კითხვა'];
const ADJ = ['ლუწი', 'კენტი', 'მარტივი', 'შედგენილი', '3-ის ჯერადი', '5-ის ჯერადი'];
const KINDS: Array<[string, string, string]> = [
  ['სამკუთხედი', 'ტოლგვერდაა', 'ტოლგვერდა არ არის'],
  ['ოთხკუთხედი', 'კვადრატია', 'კვადრატი არ არის'],
  ['პარალელოგრამი', 'მართკუთხედია', 'მართკუთხედი არ არის'],
  ['სამკუთხედი', 'მართკუთხაა', 'მართკუთხა არ არის'],
  ['რომბი', 'კვადრატია', 'კვადრატი არ არის'],
  ['მართკუთხედი', 'კვადრატია', 'კვადრატი არ არის'],
  ['ტრაპეცია', 'პარალელოგრამია', 'პარალელოგრამი არ არის'],
  ['სამკუთხედი', 'ტოლფერდაა', 'ტოლფერდა არ არის'],
];
const VERBS = ['აგვიანებს გაკვეთილზე', 'კითხულობს წიგნებს', 'თამაშობს ჭადრაკს', 'ცურავს აუზში', 'მღერის გუნდში', 'ხატავს გაკვეთილზე'];

// converse pools
const FIG: Array<{ P: string; Pn: string; Q: string; Qn: string }> = [
  { P: 'კვადრატია', Pn: 'კვადრატი არ არის', Q: 'ოთხი გვერდი აქვს', Qn: 'ოთხი გვერდი არ აქვს' },
  { P: 'სამკუთხედია', Pn: 'სამკუთხედი არ არის', Q: 'სამი კუთხე აქვს', Qn: 'სამი კუთხე არ აქვს' },
  { P: 'ხუთკუთხედია', Pn: 'ხუთკუთხედი არ არის', Q: 'ხუთი გვერდი აქვს', Qn: 'ხუთი გვერდი არ აქვს' },
  { P: 'ექვსკუთხედია', Pn: 'ექვსკუთხედი არ არის', Q: 'ექვსი კუთხე აქვს', Qn: 'ექვსი კუთხე არ აქვს' },
  { P: 'ოთხკუთხედია', Pn: 'ოთხკუთხედი არ არის', Q: 'ოთხი კუთხე აქვს', Qn: 'ოთხი კუთხე არ აქვს' },
  { P: 'მართკუთხედია', Pn: 'მართკუთხედი არ არის', Q: 'ოთხი მართი კუთხე აქვს', Qn: 'ოთხი მართი კუთხე არ აქვს' },
];
const REL: Array<{ s: string; g: string; P: string; Pn: string; Q: string; Qn: string }> = [
  { s: 'სამკუთხედი', g: 'სამკუთხედის', P: 'ტოლგვერდაა', Pn: 'ტოლგვერდა არ არის', Q: 'ყველა კუთხე 60°-ია', Qn: 'ყველა კუთხე 60°-ის ტოლი არ არის' },
  { s: 'სამკუთხედი', g: 'სამკუთხედის', P: 'ტოლფერდაა', Pn: 'ტოლფერდა არ არის', Q: 'ორი გვერდი ტოლია', Qn: 'ორი გვერდი ტოლი არ არის' },
  { s: 'სამკუთხედი', g: 'სამკუთხედის', P: 'მართკუთხაა', Pn: 'მართკუთხა არ არის', Q: 'ერთი კუთხე მართია', Qn: 'ერთი კუთხე მართი არ არის' },
  { s: 'ოთხკუთხედი', g: 'ოთხკუთხედის', P: 'მართკუთხედია', Pn: 'მართკუთხედი არ არის', Q: 'ყველა კუთხე მართია', Qn: 'ყველა კუთხე მართი არ არის' },
  { s: 'ოთხკუთხედი', g: 'ოთხკუთხედის', P: 'რომბია', Pn: 'რომბი არ არის', Q: 'ყველა გვერდი ტოლია', Qn: 'ყველა გვერდი ტოლი არ არის' },
  { s: 'ოთხკუთხედი', g: 'ოთხკუთხედის', P: 'პარალელოგრამია', Pn: 'პარალელოგრამი არ არის', Q: 'მოპირდაპირე გვერდები პარალელურია', Qn: 'მოპირდაპირე გვერდები პარალელური არ არის' },
];
const INTRO = ['მოცემულია დებულება:', 'განვიხილოთ დებულება:'];
const ASK = ['ჩამოაყალიბე ამ დებულების შებრუნებული დებულება.', 'ჩამოაყალიბე შებრუნებული დებულება.'];
const converseVars = { i0: C([0, 1]), a0: C([0, 1]), intro: D((v: Vars) => INTRO[g(v, 'i0')]!), ask: D((v: Vars) => ASK[g(v, 'a0')]!) };

// deduction pools
const IS: Array<[string, string]> = [
  ['კვადრატი', 'მართკუთხედი'],
  ['რომბი', 'პარალელოგრამი'],
  ['მართკუთხედი', 'პარალელოგრამი'],
  ['კვადრატი', 'რომბი'],
  ['კვადრატი', 'პარალელოგრამი'],
  ['ტოლგვერდა სამკუთხედი', 'ტოლფერდა სამკუთხედი'],
  ['ტოლფერდა სამკუთხედი', 'სამკუთხედი'],
];
const LABELS = ['A', 'B', 'C', 'D', 'P', 'Q', 'K', 'M'];
const TRI_LABELS = ['ABC', 'MNK', 'PQR', 'DEF', 'KLM'];
const ANIMALS: Array<{ cls: string; prop: string; neg: string; ex: string[] }> = [
  { cls: 'ძუძუმწოვარი', prop: 'სუნთქავს ფილტვებით', neg: 'არ სუნთქავს ფილტვებით', ex: ['დელფინი', 'ვეშაპი', 'ლომი'] },
  { cls: 'ფრინველი', prop: 'დებს კვერცხებს', neg: 'არ დებს კვერცხებს', ex: ['ბეღურა', 'არწივი', 'ბუ'] },
  { cls: 'თევზი', prop: 'სუნთქავს ლაყუჩებით', neg: 'არ სუნთქავს ლაყუჩებით', ex: ['კობრი', 'ორაგული', 'ქაშაყი'] },
  { cls: 'ქვეწარმავალი', prop: 'სხეულს ქერცლი აფარია', neg: 'სხეულს ქერცლი არ აფარია', ex: ['გველი', 'ხვლიკი', 'კუ'] },
];
const NAMES: Array<[string, string]> = [['ნიკა', 'ნიკას'], ['ანა', 'ანას'], ['გიორგი', 'გიორგის'], ['მარიამი', 'მარიამის']];
const ACTS: Array<[string, string]> = [['ვარჯიშობს', 'უნარი'], ['კითხულობს', 'კითხვის უნარი'], ['ხატავს', 'ხატვის უნარი'], ['თამაშობს ჭადრაკს', 'ჭადრაკის უნარი']];

// analogy pools
const ANTONYMS: Array<[string, string]> = [['დღე', 'ღამე'], ['სინათლე', 'სიბნელე'], ['ცხელი', 'ცივი'], ['დიდი', 'პატარა'], ['მაღალი', 'დაბალი'], ['სწრაფი', 'ნელი'], ['ახალი', 'ძველი'], ['მძიმე', 'მსუბუქი']];
const HOMES: Array<[string, string]> = [['ჩიტი', 'ბუდე'], ['ფუტკარი', 'სკა'], ['ძაღლი', 'ბუნა'], ['ცხენი', 'თავლა'], ['ქათამი', 'საქათმე'], ['ძროხა', 'ბოსელი']];
const MAKERS: Array<[string, string]> = [['მწერალი', 'წიგნი'], ['მხატვარი', 'ნახატი'], ['მკერავი', 'ტანსაცმელი'], ['მშენებელი', 'შენობა'], ['მეფუნთუშე', 'პური'], ['კომპოზიტორი', 'მუსიკა']];
const POLYS: Array<[string, number]> = [['სამკუთხედი', 3], ['ოთხკუთხედი', 4], ['ხუთკუთხედი', 5], ['ექვსკუთხედი', 6], ['რვაკუთხედი', 8], ['ათკუთხედი', 10]];
const UNITS: Array<[string, string]> = [['წუთი', 'დრო'], ['მეტრი', 'სიგრძე'], ['კილოგრამი', 'მასა'], ['ლიტრი', 'მოცულობა'], ['გრადუსი', 'ტემპერატურა'], ['ლარი', 'ფასი']];
/** Pairs of different indices of a pool, as `i|j`. */
const pairIdx = (n: number): string[] => {
  const out: string[] = [];
  for (let i = 0; i < n; i += 1) for (let j = 0; j < n; j += 1) if (i !== j) out.push(`${i}|${j}`);
  return out;
};
const two = (key: string, which: 0 | 1): number => Number(String(key).split('|')[which]);
/** The first elements of pool pairs other than i and j, used as the wrong options of an analogy. */
const others = (pool: Array<[string, string]>, i: number, j: number, pick: 0 | 1): string[] => pool.filter((_, k) => k !== i && k !== j).map((p) => p[pick]);

export const G7_U13_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U13.1 — ჭეშმარიტი და მცდარი დებულებები ═════════
  t({
    sub: 'u13-01',
    prompt: 'განსაზღვრე, დებულება ჭეშმარიტია თუ მცდარი: „ყველა {k}-ის ჯერადი რიცხვი იყოფა {d}-ზე უნაშთოდ“.',
    vars: { kd: C(['10|5', '6|3', '12|4', '8|4', '6|4', '10|4', '9|6', '12|8', '15|10', '8|6', '12|6', '9|3']), k: D((v: Vars) => Number(String(v.kd).split('|')[0])), d: D((v: Vars) => Number(String(v.kd).split('|')[1])) },
    answer: (v) => truth(divides(g(v, 'k'), g(v, 'd'))),
    options: TF,
    optionCount: 2,
    why: (v, a) => `${v.k} ${divides(g(v, 'k'), g(v, 'd')) ? 'იყოფა' : 'არ იყოფა'} ${v.d}-ზე${divides(g(v, 'k'), g(v, 'd')) ? ', ამიტომ ყველა მისი ჯერადიც იყოფა' : `, ამიტომ ${v.k} კონტრმაგალითია`}. დებულება ${a}.`,
  }),
  t({
    sub: 'u13-01',
    prompt: 'განსაზღვრე, დებულება ჭეშმარიტია თუ მცდარი: „{claim}“.',
    vars: { i: I(0, CLAIMS.length - 1), claim: D((v: Vars) => CLAIMS[g(v, 'i')]![0]) },
    answer: (v) => truth(CLAIMS[g(v, 'i')]![1]),
    options: TF,
    optionCount: 2,
    why: (v, a) => `${CLAIMS[g(v, 'i')]![2]}. დებულება ${a}.`,
  }),
  t({
    sub: 'u13-01',
    prompt: 'განსაზღვრე, დებულება ჭეშმარიტია თუ მცდარი: „{claim}“.',
    vars: { i: I(0, SHAPES.length - 1), claim: D((v: Vars) => SHAPES[g(v, 'i')]![0]) },
    answer: (v) => truth(SHAPES[g(v, 'i')]![1]),
    options: TF,
    optionCount: 2,
    why: (v, a) => `${SHAPES[g(v, 'i')]![2]}. დებულება ${a}.`,
  }),
  t({
    sub: 'u13-01',
    prompt: 'განსაზღვრე, დებულება ჭეშმარიტია თუ მცდარი: „{n} {kind} რიცხვია“.',
    vars: { n: I(4, 40), kd: C([0, 1, 2, 3]), kind: D((v: Vars) => ['მარტივი', 'შედგენილი', 'ლუწი', 'კენტი'][g(v, 'kd')]!) },
    answer: (v) => truth([isPrime, (n: number) => n > 1 && !isPrime(n), (n: number) => n % 2 === 0, (n: number) => n % 2 === 1][g(v, 'kd')]!(g(v, 'n'))),
    options: TF,
    optionCount: 2,
    why: (v, a) => {
      const n = g(v, 'n');
      const divs = Array.from({ length: n }, (_, i) => i + 1).filter((d) => n % d === 0);
      return `${n}-ის გამყოფებია ${divs.join(', ')}. დებულება ${a}.`;
    },
  }),
  t({
    sub: 'u13-01',
    prompt: 'განსაზღვრე, დებულება ჭეშმარიტია თუ მცდარი: „თუ რიცხვი {a}-ზე იყოფა, მაშინ ის {b}-ზეც იყოფა“.',
    vars: { a: I(4, 24), b: I(2, 9) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'two different numbers' }],
    answer: (v) => truth(divides(g(v, 'a'), g(v, 'b'))),
    options: TF,
    optionCount: 2,
    why: (v, a) => `${v.a} ${divides(g(v, 'a'), g(v, 'b')) ? `= ${g(v, 'b')} · ${g(v, 'a') / g(v, 'b')}, ამიტომ ${v.a}-ის ყოველი ჯერადი ${v.b}-ის ჯერადიცაა` : `არ იყოფა ${v.b}-ზე, ამიტომ ${v.a} კონტრმაგალითია`}. დებულება ${a}.`,
  }),
  t({
    sub: 'u13-01',
    prompt: 'განსაზღვრე, დებულება ჭეშმარიტია თუ მცდარი: „ნებისმიერი {poly} შიდა კუთხეების ჯამი {s}°-ია“.',
    vars: { pi: I(0, POLY.length - 1), si: I(0, 3), poly: D((v: Vars) => POLY[g(v, 'pi')]![0]), s: D((v: Vars) => 180 * (g(v, 'si') + 1)) },
    answer: (v) => truth(180 * (POLY[g(v, 'pi')]![1] - 2) === g(v, 's')),
    options: TF,
    optionCount: 2,
    why: (v, a) => `${v.poly} შიდა კუთხეების ჯამია (${POLY[g(v, 'pi')]![1]} − 2) · 180° = ${180 * (POLY[g(v, 'pi')]![1] - 2)}°. დებულება ${a}.`,
  }),

  // ═════════ U13.2 — დებულების უარყოფა ═════════
  t({
    sub: 'u13-02',
    prompt: 'ჩამოაყალიბე დებულების უარყოფა: „ყველა {wd} უყვარს {th}“.',
    vars: { wi: I(0, WHO.length - 1), ti: I(0, THINGS.length - 1), wd: D((v: Vars) => WHO[g(v, 'wi')]![1]), th: D((v: Vars) => THINGS[g(v, 'ti')]!) },
    answer: (v) => `არსებობს ${WHO[g(v, 'wi')]![0]}, რომელსაც არ უყვარს ${THINGS[g(v, 'ti')]}`,
    options: (v, right) => textOptions(right, [`არც ერთ ${WHO[g(v, 'wi')]![1]} არ უყვარს ${THINGS[g(v, 'ti')]}`, `ზოგ ${WHO[g(v, 'wi')]![1]} უყვარს ${THINGS[g(v, 'ti')]}`, `ყველა ${WHO[g(v, 'wi')]![1]} არ უყვარს ${THINGS[g(v, 'ti')]}`]),
    why: (_v, a) => `„ყველა“-ს უარყოფა საკმარისია ერთი გამონაკლისით: ${a}.`,
  }),
  t({
    sub: 'u13-02',
    prompt: 'ჩამოაყალიბე დებულების უარყოფა: „არსებობს {A} {B} რიცხვი“.',
    vars: { ai: I(0, ADJ.length - 1), bi: I(0, ADJ.length - 1), A: D((v: Vars) => ADJ[g(v, 'ai')]!), B: D((v: Vars) => ADJ[g(v, 'bi')]!) },
    constraints: [{ test: (v: Vars) => g(v, 'ai') !== g(v, 'bi'), note: 'two different properties' }],
    answer: (v) => `არც ერთი ${v.B} რიცხვი არ არის ${v.A}`,
    options: (v, right) => textOptions(right, [`ყველა ${v.B} რიცხვი არის ${v.A}`, `არსებობს ${v.B} რიცხვი, რომელიც არ არის ${v.A}`, `ზოგი ${v.B} რიცხვი არის ${v.A}`]),
    why: (_v, a) => `„არსებობს“-ს უარყოფა ნიშნავს, რომ ასეთი რიცხვი არ არსებობს: ${a}.`,
  }),
  t({
    sub: 'u13-02',
    prompt: 'ჩამოაყალიბე დებულების უარყოფა: „რიცხვი {a} {rel} {b}-ზე“.',
    vars: { a: I(2, 30), b: I(2, 30), dr: C([0, 1]), rel: D((v: Vars) => (g(v, 'dr') ? 'ნაკლებია' : 'მეტია')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'b'), note: 'two different numbers' }],
    answer: (v) => `რიცხვი ${v.a} ${g(v, 'dr') ? 'მეტია ან ტოლია' : 'ნაკლებია ან ტოლია'} ${v.b}-ზე`,
    options: (v, right) => textOptions(right, [`რიცხვი ${v.a} ${g(v, 'dr') ? 'მეტია' : 'ნაკლებია'} ${v.b}-ზე`, `რიცხვი ${v.a} ${g(v, 'dr') ? 'ნაკლებია' : 'მეტია'} ${v.b}-ზე`, `რიცხვი ${v.a} ტოლია ${v.b}-ის`]),
    why: (_v, a) => `„მეტია“-ს უარყოფა მოიცავს ტოლობასაც: ${a}.`,
  }),
  t({
    sub: 'u13-02',
    prompt: 'ჩამოაყალიბე დებულების უარყოფა: „ყველა {shape} {pos}“.',
    vars: { ki: I(0, KINDS.length - 1), shape: D((v: Vars) => KINDS[g(v, 'ki')]![0]), pos: D((v: Vars) => KINDS[g(v, 'ki')]![1]) },
    answer: (v) => `არსებობს ${KINDS[g(v, 'ki')]![0]}, რომელიც ${KINDS[g(v, 'ki')]![2]}`,
    options: (v, right) => textOptions(right, [`ყველა ${KINDS[g(v, 'ki')]![0]} ${KINDS[g(v, 'ki')]![2]}`, `ზოგი ${KINDS[g(v, 'ki')]![0]} ${KINDS[g(v, 'ki')]![1]}`, `არსებობს ${KINDS[g(v, 'ki')]![0]}, რომელიც ${KINDS[g(v, 'ki')]![1]}`]),
    why: (_v, a) => `„ყველა“-ს უარყოფა საკმარისია ერთი გამონაკლისით: ${a}.`,
  }),
  t({
    sub: 'u13-02',
    prompt: 'ჩამოაყალიბე დებულების უარყოფა: „არსებობს {noun}, რომელიც {d}-ზე უნაშთოდ იყოფა“.',
    vars: { d: I(2, 12), ni: C([0, 1]), noun: D((v: Vars) => (g(v, 'ni') ? 'ბუნებრივი რიცხვი' : 'მთელი რიცხვი')) },
    answer: (v) => `არც ერთი ${v.noun} არ იყოფა ${v.d}-ზე უნაშთოდ`,
    options: (v, right) => textOptions(right, [`ყველა ${v.noun} იყოფა ${v.d}-ზე უნაშთოდ`, `არსებობს ${v.noun}, რომელიც ${v.d}-ზე უნაშთოდ არ იყოფა`, `ზოგი ${v.noun} იყოფა ${v.d}-ზე უნაშთოდ`]),
    why: (_v, a) => `„არსებობს“-ს უარყოფა ნიშნავს, რომ ასეთი რიცხვი არ არსებობს: ${a}.`,
  }),
  t({
    sub: 'u13-02',
    prompt: 'ჩამოაყალიბე დებულების უარყოფა: „არც ერთი {who} არ {verb}“.',
    vars: { wi: I(0, WHO.length - 1), vi: I(0, VERBS.length - 1), who: D((v: Vars) => WHO[g(v, 'wi')]![0]), verb: D((v: Vars) => VERBS[g(v, 'vi')]!) },
    answer: (v) => `არსებობს ${v.who}, რომელიც ${v.verb}`,
    options: (v, right) => textOptions(right, [`ყველა ${v.who} ${v.verb}`, `ზოგი ${v.who} არ ${v.verb}`, `არც ერთი ${v.who} არ ${v.verb}`]),
    why: (_v, a) => `„არც ერთი“-ს უარყოფაა ერთი მაინც გამონაკლისის არსებობა: ${a}.`,
  }),

  // ═════════ U13.3 — შებრუნებული დებულება ═════════
  t({
    sub: 'u13-03',
    prompt: '{intro} „თუ რიცხვი {a}-ზე იყოფა, მაშინ ის ლუწია“. {ask}',
    vars: { a: C([4, 6, 8, 10, 12, 14, 16, 18, 20]), ...converseVars },
    answer: (v) => `თუ რიცხვი ლუწია, მაშინ ის ${v.a}-ზე იყოფა`,
    options: (v, right) => textOptions(right, [`თუ რიცხვი კენტია, მაშინ ის ${v.a}-ზე არ იყოფა`, `თუ რიცხვი ${v.a}-ზე არ იყოფა, მაშინ ის კენტია`, `თუ რიცხვი ${v.a}-ზე იყოფა, მაშინ ის ლუწია`]),
    why: (_v, a) => `შებრუნებულ დებულებაში პირობა და დასკვნა ადგილებს იცვლის: ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: '{intro} „თუ ფიგურა {P}, მაშინ მას {Q}“. {ask}',
    vars: { fi: I(0, FIG.length - 1), P: D((v: Vars) => FIG[g(v, 'fi')]!.P), Q: D((v: Vars) => FIG[g(v, 'fi')]!.Q), ...converseVars },
    answer: (v) => `თუ ფიგურას ${FIG[g(v, 'fi')]!.Q}, მაშინ ის ${FIG[g(v, 'fi')]!.P}`,
    options: (v, right) => {
      const f = FIG[g(v, 'fi')]!;
      return textOptions(right, [`თუ ფიგურა ${f.Pn}, მაშინ მას ${f.Qn}`, `თუ ფიგურას ${f.Qn}, მაშინ ის ${f.Pn}`, `თუ ფიგურა ${f.P}, მაშინ მას ${f.Q}`]);
    },
    why: (_v, a) => `შებრუნებულ დებულებაში პირობა და დასკვნა ადგილებს იცვლის: ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: '{intro} „თუ {s} {P}, მაშინ მისი {Q}“. {ask}',
    vars: { ri: I(0, 2), s: D((v: Vars) => REL[g(v, 'ri')]!.s), P: D((v: Vars) => REL[g(v, 'ri')]!.P), Q: D((v: Vars) => REL[g(v, 'ri')]!.Q), ...converseVars },
    answer: (v) => `თუ ${REL[g(v, 'ri')]!.g} ${REL[g(v, 'ri')]!.Q}, მაშინ ის ${REL[g(v, 'ri')]!.P}`,
    options: (v, right) => {
      const r = REL[g(v, 'ri')]!;
      return textOptions(right, [`თუ ${r.s} ${r.Pn}, მაშინ მისი ${r.Qn}`, `თუ ${r.g} ${r.Qn}, მაშინ ის ${r.Pn}`, `თუ ${r.s} ${r.P}, მაშინ მისი ${r.Q}`]);
    },
    why: (_v, a) => `შებრუნებულ დებულებაში პირობა და დასკვნა ადგილებს იცვლის: ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: '{intro} „თუ რიცხვი {a}-ის ჯერადია, მაშინ ის {b}-ის ჯერადია“. {ask}',
    vars: { ...implVars, ...converseVars },
    answer: (v) => `თუ რიცხვი ${v.b}-ის ჯერადია, მაშინ ის ${v.a}-ის ჯერადია`,
    options: (v, right) => textOptions(right, [`თუ რიცხვი ${v.b}-ის ჯერადი არ არის, მაშინ ის ${v.a}-ის ჯერადი არ არის`, `თუ რიცხვი ${v.a}-ის ჯერადი არ არის, მაშინ ის ${v.b}-ის ჯერადი არ არის`, `თუ რიცხვი ${v.a}-ის ჯერადია, მაშინ ის ${v.b}-ის ჯერადია`]),
    why: (_v, a) => `შებრუნებულ დებულებაში პირობა და დასკვნა ადგილებს იცვლის: ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: '{intro} „თუ {s} {P}, მაშინ მისი {Q}“. {ask}',
    vars: { ri: I(3, 5), s: D((v: Vars) => REL[g(v, 'ri')]!.s), P: D((v: Vars) => REL[g(v, 'ri')]!.P), Q: D((v: Vars) => REL[g(v, 'ri')]!.Q), ...converseVars },
    answer: (v) => `თუ ${REL[g(v, 'ri')]!.g} ${REL[g(v, 'ri')]!.Q}, მაშინ ის ${REL[g(v, 'ri')]!.P}`,
    options: (v, right) => {
      const r = REL[g(v, 'ri')]!;
      return textOptions(right, [`თუ ${r.s} ${r.Pn}, მაშინ მისი ${r.Qn}`, `თუ ${r.g} ${r.Qn}, მაშინ ის ${r.Pn}`, `თუ ${r.s} ${r.P}, მაშინ მისი ${r.Q}`]);
    },
    why: (_v, a) => `შებრუნებულ დებულებაში პირობა და დასკვნა ადგილებს იცვლის: ${a}.`,
  }),
  t({
    sub: 'u13-03',
    prompt: '{intro} „თუ რიცხვი {a}-ზე იყოფა, მაშინ ის {b}-ზე იყოფა“. {ask}',
    vars: { ...implVars, ...converseVars },
    answer: (v) => `თუ რიცხვი ${v.b}-ზე იყოფა, მაშინ ის ${v.a}-ზე იყოფა`,
    options: (v, right) => textOptions(right, [`თუ რიცხვი ${v.b}-ზე არ იყოფა, მაშინ ის ${v.a}-ზე არ იყოფა`, `თუ რიცხვი ${v.a}-ზე არ იყოფა, მაშინ ის ${v.b}-ზე არ იყოფა`, `თუ რიცხვი ${v.a}-ზე იყოფა, მაშინ ის ${v.b}-ზე იყოფა`]),
    why: (_v, a) => `შებრუნებულ დებულებაში პირობა და დასკვნა ადგილებს იცვლის: ${a}.`,
  }),

  // ═════════ U13.4 — მოქმედებები დებულებებზე ═════════
  t({
    sub: 'u13-04',
    prompt: 'მოცემულია დებულებები: P: „{P}“ და Q: „{Q}“. განსაზღვრე, ჭეშმარიტია თუ მცდარი დებულება P ∧ Q.',
    vars: pairVars(PROPS),
    constraints: [{ test: differ, note: 'two different statements' }],
    answer: (v) => truth(holdsP(PROPS, v) && holdsQ(PROPS, v)),
    options: TF,
    optionCount: 2,
    why: (v, a) => `P ${word(holdsP(PROPS, v))}, Q ${word(holdsQ(PROPS, v))}; „და“ ჭეშმარიტია მხოლოდ მაშინ, როცა ორივეა ჭეშმარიტი. P ∧ Q ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'მოცემულია დებულებები: P: „{P}“ და Q: „{Q}“. განსაზღვრე, ჭეშმარიტია თუ მცდარი დებულება P ∨ Q.',
    vars: pairVars(DIVS),
    constraints: [{ test: differ, note: 'two different statements' }],
    answer: (v) => truth(holdsP(DIVS, v) || holdsQ(DIVS, v)),
    options: TF,
    optionCount: 2,
    why: (v, a) => `P ${word(holdsP(DIVS, v))}, Q ${word(holdsQ(DIVS, v))}; „ან“ ჭეშმარიტია, თუ ერთი მაინც ჭეშმარიტია. P ∨ Q ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'მოცემულია დებულება P: „{P}“. განსაზღვრე, ჭეშმარიტია თუ მცდარი დებულება ¬P.',
    vars: pairVars(PROPS),
    answer: (v) => truth(!holdsP(PROPS, v)),
    options: TF,
    optionCount: 2,
    why: (v, a) => `P ${word(holdsP(PROPS, v))}, ამიტომ მისი უარყოფა ¬P ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'მოცემულია დებულებები: P: „{n} მეტია {a}-ზე“ და Q: „{n} ნაკლებია {b}-ზე“. განსაზღვრე, ჭეშმარიტია თუ მცდარი დებულება P ∧ Q.',
    vars: { n: I(2, 30), a: I(1, 25), b: I(4, 40) },
    answer: (v) => truth(g(v, 'n') > g(v, 'a') && g(v, 'n') < g(v, 'b')),
    options: TF,
    optionCount: 2,
    why: (v, a) => `P ${word(g(v, 'n') > g(v, 'a'))}, Q ${word(g(v, 'n') < g(v, 'b'))}; P ∧ Q ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'მოცემულია დებულებები: P: „{P}“ და Q: „{Q}“. განსაზღვრე, ჭეშმარიტია თუ მცდარი დებულება P ∨ Q.',
    vars: pairVars(PROPS),
    constraints: [{ test: differ, note: 'two different statements' }],
    answer: (v) => truth(holdsP(PROPS, v) || holdsQ(PROPS, v)),
    options: TF,
    optionCount: 2,
    why: (v, a) => `P ${word(holdsP(PROPS, v))}, Q ${word(holdsQ(PROPS, v))}; „ან“ ჭეშმარიტია, თუ ერთი მაინც ჭეშმარიტია. P ∨ Q ${a}.`,
  }),
  t({
    sub: 'u13-04',
    prompt: 'მოცემულია დებულებები: P: „{P}“ და Q: „{Q}“. განსაზღვრე, ჭეშმარიტია თუ მცდარი დებულება ¬P ∨ Q.',
    vars: pairVars(DIVS),
    constraints: [{ test: differ, note: 'two different statements' }],
    answer: (v) => truth(!holdsP(DIVS, v) || holdsQ(DIVS, v)),
    options: TF,
    optionCount: 2,
    why: (v, a) => `P ${word(holdsP(DIVS, v))}, ამიტომ ¬P ${word(!holdsP(DIVS, v))}; Q ${word(holdsQ(DIVS, v))}. ¬P ∨ Q ${a}.`,
  }),

  // ═════════ U13.5 — დასკვნის გამოტანა ═════════
  t({
    sub: 'u13-05',
    prompt: 'მოცემულია: ყველა {X} {Y}ა. ფიგურა {L} {X}ა. რა დასკვნის გამოტანა შეიძლება ფიგურა {L}-ს შესახებ?',
    vars: { ii: I(0, 4), li: I(0, LABELS.length - 1), X: D((v: Vars) => IS[g(v, 'ii')]![0]), Y: D((v: Vars) => IS[g(v, 'ii')]![1]), L: D((v: Vars) => LABELS[g(v, 'li')]!) },
    answer: (v) => `ფიგურა ${v.L} ${IS[g(v, 'ii')]![1]}ა`,
    options: (v, right) => textOptions(right, [`ფიგურა ${v.L} ${IS[g(v, 'ii')]![1]} არ არის`, `ყველა ${IS[g(v, 'ii')]![1]} ${IS[g(v, 'ii')]![0]}ა`, 'დასკვნის გამოტანა შეუძლებელია']),
    why: (v, a) => `ყველა ${v.X} ${v.Y}ა, ფიგურა ${v.L} კი ${v.X}ა; ამიტომ ${a}.`,
  }),
  t({
    sub: 'u13-05',
    prompt: 'მოცემულია: ყველა რიცხვი, რომელიც {a}-ზე იყოფა, {b}-ზეც იყოფა. რიცხვი {n} იყოფა {a}-ზე. რა დასკვნის გამოტანა შეიძლება?',
    vars: { ...implVars, m: I(1, 6), n: D((v: Vars) => g(v, 'a') * g(v, 'm')) },
    answer: (v) => `რიცხვი ${v.n} იყოფა ${v.b}-ზე`,
    options: (v, right) => textOptions(right, [`რიცხვი ${v.n} არ იყოფა ${v.b}-ზე`, `ყველა რიცხვი, რომელიც ${v.b}-ზე იყოფა, ${v.a}-ზეც იყოფა`, 'დასკვნის გამოტანა შეუძლებელია']),
    why: (v, a) => `${v.n} იყოფა ${v.a}-ზე, ხოლო ყოველი ასეთი რიცხვი ${v.b}-ზეც იყოფა; ამიტომ ${a}.`,
  }),
  t({
    sub: 'u13-05',
    prompt: 'მოცემულია: ყველა {cls} {prop}. {ex} {cls}ა. რა დასკვნის გამოტანა შეიძლება?',
    vars: { ci: I(0, ANIMALS.length - 1), ei: I(0, 2), cls: D((v: Vars) => ANIMALS[g(v, 'ci')]!.cls), prop: D((v: Vars) => ANIMALS[g(v, 'ci')]!.prop), ex: D((v: Vars) => ANIMALS[g(v, 'ci')]!.ex[g(v, 'ei')]!) },
    answer: (v) => `${v.ex} ${v.prop}`,
    options: (v, right) => textOptions(right, [`${v.ex} ${ANIMALS[g(v, 'ci')]!.neg}`, `ყველა, ვინც ${v.prop}, ${v.cls}ა`, 'დასკვნის გამოტანა შეუძლებელია']),
    why: (v, a) => `${v.ex} ${v.cls}ა, ამიტომ მასზეც მოქმედებს საერთო წესი: ${a}.`,
  }),
  t({
    sub: 'u13-05',
    prompt: 'მოცემულია: თუ რიცხვი {a}-ზე იყოფა, მაშინ ის {b}-ზე იყოფა. რიცხვი {n} {fact}. შეგვიძლია თუ არა დავასკვნათ, რომ {n} {concl}? უპასუხე „კი“ ან „არა“.',
    vars: {
      ...implVars,
      form: C([0, 1, 2]),
      m: I(1, 5),
      n: D((v: Vars) => (g(v, 'form') === 0 ? g(v, 'a') * g(v, 'm') : g(v, 'form') === 1 ? g(v, 'b') * (g(v, 'm') + 1) : g(v, 'b') * g(v, 'm') + 1)),
      fact: D((v: Vars) => (g(v, 'form') === 0 ? `იყოფა ${g(v, 'a')}-ზე` : g(v, 'form') === 1 ? `იყოფა ${g(v, 'b')}-ზე` : `არ იყოფა ${g(v, 'a')}-ზე`)),
      concl: D((v: Vars) => (g(v, 'form') === 0 ? `იყოფა ${g(v, 'b')}-ზე` : g(v, 'form') === 1 ? `იყოფა ${g(v, 'a')}-ზე` : `არ იყოფა ${g(v, 'b')}-ზე`)),
    },
    constraints: [{ test: (v: Vars) => g(v, 'form') !== 1 || g(v, 'n') % g(v, 'a') !== 0, note: 'the converse is not accidentally true' }],
    answer: (v) => (g(v, 'form') === 0 ? YES : NO),
    options: () => [YES, NO],
    optionCount: 2,
    why: (v, a) =>
      g(v, 'form') === 0
        ? `წესი მოქმედებს პირდაპირ: ${v.n} იყოფა ${v.a}-ზე, ამიტომ იყოფა ${v.b}-ზეც. ${a}.`
        : g(v, 'form') === 1
          ? `წესი მხოლოდ ერთი მიმართულებით მუშაობს: ${v.b}-ზე გაყოფა არ იძლევა ${v.a}-ზე გაყოფის გარანტიას. ${a}.`
          : `${v.a}-ზე გაუყოფლობა არ გვეუბნება ${v.b}-ზე გაუყოფლობას — რიცხვი შეიძლება მაინც იყოფოდეს ${v.b}-ზე. ${a}.`,
  }),
  t({
    sub: 'u13-05',
    prompt: 'მოცემულია: ყველა {X} {Y}ა. {tri} {X}ა. რა დასკვნის გამოტანა შეიძლება {tri}-ზე?',
    vars: { ii: I(5, 6), ti: I(0, TRI_LABELS.length - 1), X: D((v: Vars) => IS[g(v, 'ii')]![0]), Y: D((v: Vars) => IS[g(v, 'ii')]![1]), tri: D((v: Vars) => `სამკუთხედი ${TRI_LABELS[g(v, 'ti')]}`) },
    answer: (v) => `${v.tri} ${IS[g(v, 'ii')]![1]}ა`,
    options: (v, right) => textOptions(right, [`${v.tri} ${IS[g(v, 'ii')]![1]} არ არის`, `ყველა ${IS[g(v, 'ii')]![1]} ${IS[g(v, 'ii')]![0]}ა`, 'დასკვნის გამოტანა შეუძლებელია']),
    why: (v, a) => `ყველა ${v.X} ${v.Y}ა, ${v.tri} კი ${v.X}ა; ამიტომ ${a}.`,
  }),
  t({
    sub: 'u13-05',
    prompt: 'მოცემულია: თუ მოსწავლე ყოველდღე {act}, მისი {skill} {mod}. {name} ყოველდღე {act}. შეგვიძლია თუ არა მოცემული ინფორმაციის საფუძველზე დავასკვნათ, რომ {nameG} {skill} აუცილებლად გაუმჯობესდება? უპასუხე „კი“ ან „არა“.',
    vars: { ai: I(0, ACTS.length - 1), ni: I(0, NAMES.length - 1), md: C([0, 1]), act: D((v: Vars) => ACTS[g(v, 'ai')]![0]), skill: D((v: Vars) => ACTS[g(v, 'ai')]![1]), name: D((v: Vars) => NAMES[g(v, 'ni')]![0]), nameG: D((v: Vars) => NAMES[g(v, 'ni')]![1]), mod: D((v: Vars) => (g(v, 'md') ? 'აუცილებლად გაუმჯობესდება' : 'შეიძლება გაუმჯობესდეს')) },
    answer: (v) => (g(v, 'md') ? YES : NO),
    options: () => [YES, NO],
    optionCount: 2,
    why: (v, a) => (g(v, 'md') ? `წესი გარანტიას იძლევა („აუცილებლად“), ${v.name} კი პირობას ასრულებს. ${a}.` : `წესში წერია მხოლოდ „შეიძლება“ — ეს გარანტიას არ იძლევა. ${a}.`),
  }),

  // ═════════ U13.6 — ანალოგიები ═════════
  t({
    sub: 'u13-06',
    prompt: 'შეავსე ანალოგია: {a1} : {b1} = {a2} : ___.',
    vars: { ij: C(pairIdx(ANTONYMS.length)), a1: D((v: Vars) => ANTONYMS[two(String(v.ij), 0)]![0]), b1: D((v: Vars) => ANTONYMS[two(String(v.ij), 0)]![1]), a2: D((v: Vars) => ANTONYMS[two(String(v.ij), 1)]![0]) },
    answer: (v) => ANTONYMS[two(String(v.ij), 1)]![1],
    options: (v, right) => textOptions(right, others(ANTONYMS, two(String(v.ij), 0), two(String(v.ij), 1), 0)),
    why: (v, a) => `${v.a1} და ${v.b1} საპირისპიროა; ${v.a2}-ის საპირისპიროა ${a}.`,
  }),
  t({
    sub: 'u13-06',
    prompt: 'შეავსე ანალოგია: {a} : {b} = {c} : ___, თუ ორივე შემთხვევაში მეორე რიცხვი პირველზე {rule}.',
    vars: { a: I(2, 9), c: I(2, 12), f: I(2, 5), kind: C([0, 1]), b: D((v: Vars) => (g(v, 'kind') ? g(v, 'a') + g(v, 'f') : g(v, 'a') * g(v, 'f'))), rule: D((v: Vars) => (g(v, 'kind') ? `${g(v, 'f')}-ით მეტია` : `${g(v, 'f')}-ჯერ მეტია`)) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'c'), note: 'two different numbers' }],
    answer: (v) => String(g(v, 'kind') ? g(v, 'c') + g(v, 'f') : g(v, 'c') * g(v, 'f')),
    options: (v) => {
      const key = g(v, 'kind') ? g(v, 'c') + g(v, 'f') : g(v, 'c') * g(v, 'f');
      return unitOptions(key, '', [g(v, 'kind') ? g(v, 'c') * g(v, 'f') : g(v, 'c') + g(v, 'f'), g(v, 'c') + 1, key + 1, key - 1]);
    },
    why: (v, a) => `მეორე რიცხვი პირველზე ${v.rule}, ამიტომ ${v.c}-ის შესაბამისი რიცხვია ${a}.`,
  }),
  t({
    sub: 'u13-06',
    prompt: 'შეავსე ანალოგია: {s1} : {n1} {attr} = {s2} : ___ {attr}.',
    vars: { ij: C(pairIdx(POLYS.length)), at: C([0, 1]), attr: D((v: Vars) => (g(v, 'at') ? 'კუთხე' : 'გვერდი')), s1: D((v: Vars) => POLYS[two(String(v.ij), 0)]![0]), n1: D((v: Vars) => POLYS[two(String(v.ij), 0)]![1]), s2: D((v: Vars) => POLYS[two(String(v.ij), 1)]![0]), s1d: D((v: Vars) => POLYS[two(String(v.ij), 0)]![0].slice(0, -1) + 'ს'), s2d: D((v: Vars) => POLYS[two(String(v.ij), 1)]![0].slice(0, -1) + 'ს') },
    answer: (v) => String(POLYS[two(String(v.ij), 1)]![1]),
    options: (v) => {
      const k = POLYS[two(String(v.ij), 1)]![1];
      return unitOptions(k, '', [POLYS[two(String(v.ij), 0)]![1], k + 1, k - 1, k * 2]);
    },
    why: (v, a) => `${v.s2d} ${a} ${v.attr} აქვს, როგორც ${v.s1d} ${v.n1}.`,
  }),
  t({
    sub: 'u13-06',
    prompt: 'შეავსე ანალოგია: {a1} : {b1} = {a2} : ___.',
    vars: { dm: C([0, 1]), ij: C(pairIdx(6)), a1: D((v: Vars) => (g(v, 'dm') ? MAKERS : HOMES)[two(String(v.ij), 0)]![0]), b1: D((v: Vars) => (g(v, 'dm') ? MAKERS : HOMES)[two(String(v.ij), 0)]![1]), a2: D((v: Vars) => (g(v, 'dm') ? MAKERS : HOMES)[two(String(v.ij), 1)]![0]) },
    answer: (v) => (g(v, 'dm') ? MAKERS : HOMES)[two(String(v.ij), 1)]![1],
    options: (v, right) => textOptions(right, others(g(v, 'dm') ? MAKERS : HOMES, two(String(v.ij), 0), two(String(v.ij), 1), 1)),
    why: (v, a) => `${v.a1} და ${v.b1} ისეთივე კავშირშია, როგორც ${v.a2} და ${a}.`,
  }),
  t({
    sub: 'u13-06',
    prompt: 'შეავსე ანალოგია: {a} : {b} = {c} : ___, თუ {rule}.',
    vars: { a: I(2, 9), c: I(2, 9), pw: C([2, 3]), rule: D((v: Vars) => (g(v, 'pw') === 2 ? 'რიცხვი საკუთარ თავზე მრავლდება' : 'მეორე რიცხვი პირველის კუბია')), b: D((v: Vars) => g(v, 'a') ** g(v, 'pw')) },
    constraints: [{ test: (v: Vars) => g(v, 'a') !== g(v, 'c') && (g(v, 'pw') === 2 || (g(v, 'a') <= 6 && g(v, 'c') <= 6)), note: 'two different numbers, small cubes' }],
    answer: (v) => String(g(v, 'c') ** g(v, 'pw')),
    options: (v) => {
      const key = g(v, 'c') ** g(v, 'pw');
      return unitOptions(key, '', [g(v, 'c') * g(v, 'pw'), g(v, 'c') * 2, g(v, 'c') ** (g(v, 'pw') === 2 ? 3 : 2), g(v, 'c') + g(v, 'b') - g(v, 'a')]);
    },
    why: (v, a) => `${v.b} = ${v.a}${g(v, 'pw') === 2 ? ' · ' + v.a : ' · ' + v.a + ' · ' + v.a}; ამიტომ ${v.c}-ის შესაბამისია ${a}.`,
  }),
  t({
    sub: 'u13-06',
    prompt: 'შეავსე ანალოგია: {a1} : {b1} = {a2} : ___.',
    vars: { ij: C(pairIdx(UNITS.length)), a1: D((v: Vars) => UNITS[two(String(v.ij), 0)]![0]), b1: D((v: Vars) => UNITS[two(String(v.ij), 0)]![1]), a2: D((v: Vars) => UNITS[two(String(v.ij), 1)]![0]) },
    answer: (v) => UNITS[two(String(v.ij), 1)]![1],
    options: (v, right) => textOptions(right, others(UNITS, two(String(v.ij), 0), two(String(v.ij), 1), 1)),
    why: (v, a) => `${v.a1} ზომავს სიდიდეს „${v.b1}“; ${v.a2} ზომავს სიდიდეს „${a}“.`,
  }),
];

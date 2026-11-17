/**
 * Grade I — pictured templates for the units that were wording only
 * (numbers to 20 and 100, counting, comparing, tens and ones, mixed problems,
 * patterns, logic). Each question is asked about something drawn from its own
 * numbers: a row of objects, base-ten blocks, a number line, a part–whole model,
 * a balance.
 */
import type { QuestionTemplate, Vars } from './types';
import type { Picture } from '../pictures/types';
import { OBJECTS, blocksOf, blocksTO, derived, distinct, fixed, iconRow, icons, int, interactiveSet, manyRows, nounOf, num, pick } from './ix-kit';

const P = (topicId: string, unit: string) => interactiveSet(1, topicId, `g1-px-${unit}`);
const model = (whole: string | number, ...parts: Array<string | number>): Picture => ({ kind: 'model', whole: String(whole), parts: parts.map(String) });
const chips = (...items: Array<string | number>): Picture => ({ kind: 'chips', arrows: true, items: items.map((text) => ({ text: String(text) })) });
const objectVars = { o: int(0, 5), n: derived((v: Vars) => nounOf(OBJECTS[num(v, 'o')]!.icon)) };
const objIcon = (v: Vars, key = 'o'): string => OBJECTS[num(v, key)]!.icon;
const COLORS = [
  { icon: 'dot-red', name: 'წითელი' },
  { icon: 'dot-blue', name: 'ლურჯი' },
  { icon: 'dot-green', name: 'მწვანე' },
  { icon: 'dot-yellow', name: 'ყვითელი' },
];
const LETTERS = ['ა', 'ბ', 'გ'];

/* ------------------------------------------------------------ U02 */
const u02 = P('ricxvebi20', 'u02');
const U02: QuestionTemplate[] = [
  u02('ricxvebi1-10', 'count-row', 1, {
    prompt: 'რამდენი {n} არის სურათზე?',
    variables: { ...objectVars, k: int(1, 10) },
    pictures: (v) => [iconRow(objIcon(v), num(v, 'k'))],
    answer: (v) => num(v, 'k'),
    explanation: ({ answer }) => `დათვლით: ${answer}.`,
  }),
  u02('ricxvebi11-20', 'ten-and-more', 2, {
    prompt: 'რამდენია სულ? პირველ რიგში ათია, მეორეში — {k}.',
    variables: { ...objectVars, k: int(1, 9) },
    pictures: (v) => [manyRows([{ tokens: icons(objIcon(v), 10) }, { tokens: icons(objIcon(v), num(v, 'k')) }])],
    answer: (v) => 10 + num(v, 'k'),
    explanation: ({ answer }) => `10 და კიდევ ${Number(answer) - 10}: ${answer}.`,
  }),
  u02('win-nak', 'neighbour', 1, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას? (შემდეგი რიცხვი: {m})',
    variables: { k: int(2, 18), m: derived((v: Vars) => num(v, 'k') + 1) },
    pictures: (v) => [chips(num(v, 'k') - 1, '?', num(v, 'k') + 1)],
    answer: (v) => num(v, 'k'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u02('udidesi-umciresti', 'most-group', 1, {
    prompt: 'რომელ ჯგუფშია ყველაზე მეტი {n}?',
    variables: { ...objectVars, a: int(2, 9), b: int(2, 9), c: int(2, 9) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [manyRows([num(v, 'a'), num(v, 'b'), num(v, 'c')].map((k, i) => ({ label: LETTERS[i], tokens: icons(objIcon(v), k) })))],
    options: fixed('ა', 'ბ', 'გ'),
    optionCount: 3,
    text: true,
    answer: (v) => {
      const list = [num(v, 'a'), num(v, 'b'), num(v, 'c')];
      return LETTERS[list.indexOf(Math.max(...list))]!;
    },
    explanation: ({ answer }) => `ყველაზე გრძელი რიგი: ${answer}.`,
  }),
  u02('ricxviTi-xazi20', 'read-line', 1, {
    prompt: 'რომელ რიცხვზე დგას წითელი წერტილი?',
    variables: { k: int(1, 20) },
    pictures: (v) => [{ kind: 'line', from: 0, to: 20, step: 1, marks: [{ value: num(v, 'k') }] }],
    answer: (v) => num(v, 'k'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u02('rigobiti', 'odd-one-position', 1, {
    prompt: 'მარცხნიდან რამდენეულია ვარსკვლავი?',
    variables: { k: int(1, 8) },
    pictures: (v) => [{ kind: 'rows', rows: [{ tokens: Array.from({ length: 8 }, (_, i) => ({ t: 'icon' as const, icon: i + 1 === num(v, 'k') ? 'star' : 'apple' })) }] }],
    answer: (v) => num(v, 'k'),
    explanation: ({ answer }) => `მარცხნიდან ${answer}-ე ადგილზეა.`,
  }),
  u02('luwi-kenti', 'pairs', 2, {
    prompt: 'ობიექტები წყვილებადაა დაყოფილი. ლუწია თუ კენტი რაოდენობა? (სულ {k})',
    variables: { ...objectVars, k: int(3, 15) },
    pictures: (v) => {
      const k = num(v, 'k');
      const groups = Array.from({ length: Math.ceil(k / 2) }, (_, i) => ({ t: 'group' as const, tokens: icons(objIcon(v), Math.min(2, k - i * 2)) }));
      return [manyRows([{ tokens: groups }])];
    },
    options: fixed('ლუწი', 'კენტი'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'k') % 2 === 0 ? 'ლუწი' : 'კენტი'),
    explanation: ({ answer }) => `წყვილების გარეშე ერთი რჩება — ${answer === 'კენტი' ? 'კენტია' : 'ლუწია'}.`,
  }),
];

/* ------------------------------------------------------------ U03 */
const u03 = P('datvla', 'u03');
const gridCells = (start: number, unknownIndex: number) =>
  Array.from({ length: 3 }, (_, r) =>
    Array.from({ length: 3 }, (_, c) => {
      const value = start + r * 10 + c;
      return r * 3 + c === unknownIndex ? { text: '?', unknown: true } : { text: String(value) };
    }),
  );
const U03: QuestionTemplate[] = [
  u03('sruli-datvla', 'count-two-rows', 1, {
    prompt: 'რამდენი {n} არის სურათზე?',
    variables: { o: int(0, 5), p: int(6, 11), n: derived((v: Vars) => nounOf(OBJECTS[num(v, 'o')]!.icon)), a: int(3, 10), b: int(3, 10) },
    pictures: (v) => [manyRows([{ tokens: icons(objIcon(v), num(v, 'a')) }, { tokens: icons(objIcon(v, 'p'), num(v, 'b')) }])],
    answer: (v) => num(v, 'a'),
    explanation: ({ answer }) => `პირველ რიგში ${answer}.`,
  }),
  u03('win-ukan', 'countdown', 1, {
    prompt: 'დათვალე უკან. რომელი რიცხვი უნდა იყოს ❓ ადგილას? (პირველი: {k})',
    variables: { k: int(5, 20) },
    pictures: (v) => [chips(num(v, 'k'), num(v, 'k') - 1, num(v, 'k') - 2, '?')],
    answer: (v) => num(v, 'k') - 3,
    explanation: ({ answer }) => `ყოველ ნაბიჯზე ერთით ნაკლები: ${answer}.`,
  }),
  u03('100-mde', 'chart-gap', 2, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას ცხრილში?',
    variables: { r: int(0, 6), c: int(0, 7), u: int(0, 8) },
    pictures: (v) => [{ kind: 'chart', rows: gridCells(num(v, 'r') * 10 + num(v, 'c') + 1, num(v, 'u')) }],
    answer: (v) => num(v, 'r') * 10 + num(v, 'c') + 1 + Math.floor(num(v, 'u') / 3) * 10 + (num(v, 'u') % 3),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u03('atobit-nabijebit', 'tens-chain', 1, {
    prompt: 'დათვალე ათეულებით. რომელი რიცხვი უნდა იყოს ❓ ადგილას? (პირველი: {a})',
    variables: { a: int(1, 5, {}), s: derived(() => 10) },
    pictures: (v) => [chips(num(v, 'a') * 10, num(v, 'a') * 10 + 10, num(v, 'a') * 10 + 20, '?')],
    answer: (v) => num(v, 'a') * 10 + 30,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u03('sagvnebamde', 'steps-to-target', 2, {
    prompt: 'რამდენი ნაბიჯია საჭირო {a}-დან {b}-მდე?',
    variables: { a: int(1, 12), d: int(2, 7), b: derived((v: Vars) => num(v, 'a') + num(v, 'd')) },
    pictures: (v) => [{ kind: 'line', from: 0, to: 20, step: 1, marks: [{ value: num(v, 'a'), label: String(v.a) }, { value: num(v, 'b'), label: String(v.b) }] }],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer} ნაბიჯი.`,
  }),
  u03('airCe-da-daTvale', 'count-kind', 1, {
    prompt: 'რამდენი ვარსკვლავია?',
    variables: { a: int(2, 7), b: int(2, 7) },
    pictures: (v) => {
      const a = num(v, 'a');
      const b = num(v, 'b');
      const row: Array<{ t: 'icon'; icon: string }> = [];
      let stars = a;
      let apples = b;
      while (stars + apples > 0) {
        if (stars > 0) {
          row.push({ t: 'icon', icon: 'star' });
          stars -= 1;
        }
        if (apples > 0) {
          row.push({ t: 'icon', icon: 'apple' });
          apples -= 1;
        }
      }
      return [manyRows([{ tokens: row }])];
    },
    answer: (v) => num(v, 'a'),
    explanation: ({ answer }) => `ვარსკვლავები: ${answer}.`,
  }),
];

/* ------------------------------------------------------------ U04 */
const u04 = P('ricxvebi100', 'u04');
const U04: QuestionTemplate[] = [
  u04('aseulis-cxrili', 'chart-gap', 1, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას ასეულის ცხრილში?',
    variables: { r: int(0, 6), c: int(0, 7), u: int(0, 8) },
    pictures: (v) => [{ kind: 'chart', rows: gridCells(num(v, 'r') * 10 + num(v, 'c') + 1, num(v, 'u')) }],
    answer: (v) => num(v, 'r') * 10 + num(v, 'c') + 1 + Math.floor(num(v, 'u') / 3) * 10 + (num(v, 'u') % 3),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u04('ateulebi-erteulebi', 'read-blocks', 1, {
    prompt: 'რა რიცხვია გამოსახული? ({t} ათეული)',
    variables: { t: int(1, 9), o: int(0, 9) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'))],
    answer: (v) => num(v, 't') * 10 + num(v, 'o'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u04('ricxviTi-xazi100', 'read-line', 1, {
    prompt: 'რომელ რიცხვზე დგას წითელი წერტილი?',
    variables: { k: int(1, 10) },
    pictures: (v) => [{ kind: 'line', from: 0, to: 100, step: 10, marks: [{ value: num(v, 'k') * 10 }] }],
    answer: (v) => num(v, 'k') * 10,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u04('mezoblebi', 'between', 2, {
    prompt: 'რომელ რიცხვზე დგას წერტილი {a}-სა და {b}-ს შორის?',
    variables: { a: int(1, 8, {}), o: int(1, 9), b: derived((v: Vars) => num(v, 'a') * 10 + 10) },
    pictures: (v) => [{ kind: 'line', from: num(v, 'a') * 10, to: num(v, 'a') * 10 + 10, step: 1, marks: [{ value: num(v, 'a') * 10 + num(v, 'o') }] }],
    answer: (v) => num(v, 'a') * 10 + num(v, 'o'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U05 */
const u05 = P('Sedareba', 'u05');
const pairVars = { ...objectVars, a: int(2, 10), b: int(2, 10) };
const U05: QuestionTemplate[] = [
  u05('meti-naklebi-toli', 'compare-rows', 1, {
    prompt: 'შეადარე რიგები. პირველ რიგში მეორესთან შედარებით:',
    variables: pairVars,
    pictures: (v) => [manyRows([{ label: 'I', tokens: icons(objIcon(v), num(v, 'a')) }, { label: 'II', tokens: icons(objIcon(v), num(v, 'b')) }])],
    options: fixed('მეტია', 'ნაკლებია', 'ტოლია'),
    optionCount: 3,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'მეტია' : num(v, 'a') < num(v, 'b') ? 'ნაკლებია' : 'ტოლია'),
    explanation: ({ answer }) => `პირველ რიგში ${answer}.`,
  }),
  u05('Sedareba10', 'more-row', 1, {
    prompt: 'რომელ რიგშია მეტი {n}?',
    variables: pairVars,
    constraints: [distinct('a', 'b')],
    pictures: (v) => [manyRows([{ label: 'I', tokens: icons(objIcon(v), num(v, 'a')) }, { label: 'II', tokens: icons(objIcon(v), num(v, 'b')) }])],
    options: fixed('პირველში', 'მეორეში'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'პირველში' : 'მეორეში'),
    explanation: ({ answer }) => `${answer} მეტია.`,
  }),
  u05('Sedareba100', 'bigger-number', 2, {
    prompt: 'რომელი რიცხვია მეტი?',
    variables: { a: int(12, 98), b: int(12, 98) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [blocksOf(num(v, 'a'), String(v.a)), blocksOf(num(v, 'b'), String(v.b))],
    answer: (v) => Math.max(num(v, 'a'), num(v, 'b')),
    explanation: ({ answer }) => `${answer} მეტია.`,
  }),
  u05('ramdenit-meti', 'how-many-more', 2, {
    prompt: 'რამდენით მეტია პირველ რიგში?',
    variables: { ...objectVars, b: int(2, 8), d: int(1, 6), a: derived((v: Vars) => num(v, 'b') + num(v, 'd')) },
    pictures: (v) => [manyRows([{ label: 'I', tokens: icons(objIcon(v), num(v, 'a')) }, { label: 'II', tokens: icons(objIcon(v), num(v, 'b')) }])],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer}-ით მეტია.`,
  }),
  u05('SeFaseba-aTeulamde', 'nearest-ten', 2, {
    prompt: 'რომელ ათეულთან უფრო ახლოსაა წერტილი? ({n})',
    variables: { t: int(1, 8), o: pick(1, 2, 3, 4, 6, 7, 8, 9), n: derived((v: Vars) => num(v, 't') * 10 + num(v, 'o')) },
    pictures: (v) => [{ kind: 'line', from: num(v, 't') * 10, to: num(v, 't') * 10 + 10, step: 1, marks: [{ value: num(v, 'n'), label: String(v.n) }] }],
    answer: (v) => (num(v, 'o') < 5 ? num(v, 't') * 10 : num(v, 't') * 10 + 10),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u05('dalageba', 'smallest-on-line', 2, {
    prompt: 'რომელია უმცირესი მონიშნული რიცხვი?',
    variables: { a: int(1, 19), b: int(1, 19), c: int(1, 19) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [{ kind: 'line', from: 0, to: 20, step: 1, marks: [num(v, 'a'), num(v, 'b'), num(v, 'c')].map((value) => ({ value, label: String(value) })) }],
    answer: (v) => Math.min(num(v, 'a'), num(v, 'b'), num(v, 'c')),
    explanation: ({ answer }) => `ყველაზე მარცხენა: ${answer}.`,
  }),
  u05('toli-raodenoba', 'make-equal', 3, {
    prompt: 'რამდენი უნდა დაემატოს მეორე რიგს, რომ რიგები ტოლი გახდეს?',
    variables: { ...objectVars, b: int(2, 8), d: int(1, 5), a: derived((v: Vars) => num(v, 'b') + num(v, 'd')) },
    pictures: (v) => [manyRows([{ label: 'I', tokens: icons(objIcon(v), num(v, 'a')) }, { label: 'II', tokens: icons(objIcon(v), num(v, 'b')) }])],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U08 */
const u08 = P('ateulebi-orcifra', 'u08');
const U08: QuestionTemplate[] = [
  u08('ateulebi-ateulebi', 'tens-add', 1, {
    prompt: 'იპოვე ჯამი. ({a} ათეული და {b} ათეული)',
    variables: { a: int(1, 5), b: int(1, 4) },
    pictures: (v) => [blocksTO(num(v, 'a'), 0, String(num(v, 'a') * 10)), blocksTO(num(v, 'b'), 0, `+ ${num(v, 'b') * 10}`)],
    answer: (v) => (num(v, 'a') + num(v, 'b')) * 10,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u08('ateulebis-gamokleba', 'tens-sub', 1, {
    prompt: 'იპოვე სხვაობა. (სულ {a} ათეული, წაიღეს {b} ათეული)',
    variables: { a: int(4, 9), b: int(1, 3) },
    pictures: (v) => [blocksTO(num(v, 'a'), 0, String(num(v, 'a') * 10)), blocksTO(num(v, 'b'), 0, `− ${num(v, 'b') * 10}`)],
    answer: (v) => (num(v, 'a') - num(v, 'b')) * 10,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u08('orcifra-ertcifra', 'add-ones', 1, {
    prompt: 'იპოვე ჯამი: {t}{o} + {b}',
    variables: { t: int(1, 8), o: int(0, 4), b: int(1, 4) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'), `${v.t}${v.o}`), blocksTO(0, num(v, 'b'), `+ ${v.b}`)],
    answer: (v) => num(v, 't') * 10 + num(v, 'o') + num(v, 'b'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u08('gadajgufebiT', 'carry-ones', 2, {
    prompt: 'იპოვე ჯამი: {t}{o} + {b}. ერთეულები 10-ს სცდება.',
    variables: { t: int(1, 8), o: int(5, 9), b: int(5, 9) },
    constraints: [{ test: (v: Vars) => num(v, 'o') + num(v, 'b') >= 10, note: 'carry' }],
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'), `${v.t}${v.o}`), blocksTO(0, num(v, 'b'), `+ ${v.b}`)],
    answer: (v) => num(v, 't') * 10 + num(v, 'o') + num(v, 'b'),
    explanation: ({ answer }) => `10 ერთეული ერთი ათეულია. პასუხი: ${answer}.`,
  }),
  u08('esveTis-chamowerTa', 'sub-ones', 1, {
    prompt: 'იპოვე სხვაობა: {t}{o} − {b}',
    variables: { t: int(1, 8), o: int(5, 9), b: int(1, 4) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'), `${v.t}${v.o}`), blocksTO(0, num(v, 'b'), `− ${v.b}`)],
    answer: (v) => num(v, 't') * 10 + num(v, 'o') - num(v, 'b'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u08('nulidan-9-mde', 'sub-borrow', 2, {
    prompt: 'იპოვე სხვაობა: {t}{o} − {b}. ერთეულები არ ყოფნის.',
    variables: { t: int(2, 8), o: int(0, 3), b: int(5, 9) },
    pictures: (v) => [blocksTO(num(v, 't'), num(v, 'o'), `${v.t}${v.o}`), blocksTO(0, num(v, 'b'), `− ${v.b}`)],
    answer: (v) => num(v, 't') * 10 + num(v, 'o') - num(v, 'b'),
    explanation: ({ answer }) => `ერთი ათეული დაშალე: ${answer}.`,
  }),
  u08('aszeulSi', 'tens-to-hundred', 2, {
    prompt: 'რამდენია ყველა ათეული ერთად? ({a} და {b} ათეული)',
    variables: { a: int(3, 6), b: int(2, 4) },
    pictures: (v) => [blocksTO(num(v, 'a'), 0, String(num(v, 'a') * 10)), blocksTO(num(v, 'b'), 0, `+ ${num(v, 'b') * 10}`)],
    answer: (v) => (num(v, 'a') + num(v, 'b')) * 10,
    explanation: ({ answer }) => `${answer}.`,
  }),
  u08('ricxviTi-gamocanebi', 'missing-model', 2, {
    prompt: 'რომელი რიცხვია ❓ ადგილას? (მთელი: {w})',
    variables: { a: int(11, 40), d: int(5, 30), w: derived((v: Vars) => num(v, 'a') + num(v, 'd')) },
    pictures: (v) => [model(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U09 */
const u09 = P('Sereuli-amocanebi', 'u09');
const U09: QuestionTemplate[] = [
  u09('20-mde', 'model-total', 1, {
    prompt: 'რამდენია სულ? ({a} და {b})',
    variables: { a: int(3, 12), b: int(2, 8) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') <= 20, note: '≤20' }],
    pictures: (v) => [model('?', num(v, 'a'), num(v, 'b'))],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u09('jami-sxvaoba', 'model-part', 1, {
    prompt: 'რომელი რიცხვია ❓ ადგილას? (მთელი: {w})',
    variables: { a: int(3, 10), d: int(2, 9), w: derived((v: Vars) => num(v, 'a') + num(v, 'd')) },
    pictures: (v) => [model(num(v, 'w'), num(v, 'a'), '?')],
    answer: (v) => num(v, 'd'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u09('romeli-moqmedeba', 'which-op', 2, {
    prompt: 'სურათზე რაოდენობა შეიცვალა. რომელი ნიშანი ჩავწეროთ?',
    variables: { ...objectVars, a: int(4, 10), d: int(1, 3), up: int(0, 1) },
    pictures: (v) => [
      manyRows([
        {
          tokens: [
            ...icons(objIcon(v), num(v, 'a')),
            { t: 'sep', style: 'arrow' },
            ...icons(objIcon(v), num(v, 'up') ? num(v, 'a') + num(v, 'd') : num(v, 'a') - num(v, 'd')),
          ],
        },
      ]),
    ],
    options: fixed('+', '−'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'up') ? '+' : '−'),
    explanation: ({ answer }) => (answer === '+' ? 'რაოდენობა გაიზარდა — შეკრებაა.' : 'რაოდენობა შემცირდა — გამოკლებაა.'),
  }),
  u09('ori-nabiji', 'two-rows', 3, {
    prompt: 'ორი რიგი გააერთიანეს და {c} წაიღეს. რამდენი დარჩა?',
    variables: { ...objectVars, a: int(3, 8), b: int(3, 8), c: int(1, 5) },
    pictures: (v) => [manyRows([{ tokens: icons(objIcon(v), num(v, 'a')) }, { tokens: icons(objIcon(v), num(v, 'b')) }])],
    answer: (v) => num(v, 'a') + num(v, 'b') - num(v, 'c'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u09('martali-tolobebi', 'balance-equal', 2, {
    prompt: 'სასწორი წონასწორობაშია. რამდენი {n} უნდა იყოს მარჯვნივ ❓ ადგილას?',
    variables: { ...objectVars, a: int(2, 6), b: int(2, 6), c: int(1, 5) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') > num(v, 'c'), note: 'positive' }],
    pictures: (v) => [{ kind: 'balance', left: [...icons(objIcon(v), num(v, 'a')), ...icons(objIcon(v), num(v, 'b'))], right: [...icons(objIcon(v), num(v, 'c')), { t: 'unknown' }], tilt: 'level' }],
    answer: (v) => num(v, 'a') + num(v, 'b') - num(v, 'c'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U11 */
const u11 = P('kanonzomiereba', 'u11');
const U11: QuestionTemplate[] = [
  u11('gameorebadi', 'colors-repeat', 1, {
    prompt: 'რომელი ფერი უნდა იყოს ❓ ადგილას?',
    variables: { x: int(0, 1), y: int(2, 3), r: int(1, 3) },
    pictures: (v) => {
      const unit = [COLORS[num(v, 'x')]!.icon, COLORS[num(v, 'y')]!.icon];
      const shown = Array.from({ length: num(v, 'r') * 2 + 1 }, (_, i) => unit[i % 2]!);
      return [{ kind: 'rows', rows: [{ tokens: [...shown.map((icon) => ({ t: 'icon' as const, icon })), { t: 'unknown' as const }] }] }];
    },
    options: () => COLORS.map((c) => c.name),
    text: true,
    answer: (v) => COLORS[[num(v, 'x'), num(v, 'y')][(num(v, 'r') * 2 + 1) % 2]!]!.name,
    explanation: ({ answer }) => `მიმდევრობა მეორდება: ${answer}.`,
  }),
  u11('mzardi', 'growing-groups', 2, {
    prompt: 'რამდენი ვარსკვლავი უნდა იყოს მეოთხე ჯგუფში?',
    variables: { a: int(1, 4), s: int(1, 3) },
    pictures: (v) => {
      const a = num(v, 'a');
      const s = num(v, 's');
      return [manyRows([a, a + s, a + 2 * s].map((n) => ({ tokens: icons('star', n) })).concat([{ tokens: [{ t: 'unknown' as const }] }]))];
    },
    answer: (v) => num(v, 'a') + 3 * num(v, 's'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u11('wesis-agwera', 'step-size', 2, {
    prompt: 'რამდენი ემატება ყოველ ნაბიჯზე?',
    variables: { a: int(1, 12), s: int(2, 5) },
    pictures: (v) => [chips(num(v, 'a'), num(v, 'a') + num(v, 's'), num(v, 'a') + 2 * num(v, 's'), num(v, 'a') + 3 * num(v, 's'))],
    answer: (v) => num(v, 's'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u11('ricxviTi-mimdevroba', 'next-number', 1, {
    prompt: 'რომელი რიცხვი უნდა იყოს ❓ ადგილას?',
    variables: { a: int(1, 12), s: int(1, 4) },
    pictures: (v) => [chips(num(v, 'a'), num(v, 'a') + num(v, 's'), num(v, 'a') + 2 * num(v, 's'), '?')],
    answer: (v) => num(v, 'a') + 3 * num(v, 's'),
    explanation: ({ answer }) => `${answer}.`,
  }),
];

/* ------------------------------------------------------------ U16 */
const u16 = P('logikuri-azrovneba', 'u16');
const U16: QuestionTemplate[] = [
  u16('gamoricxva', 'crossed-left', 1, {
    prompt: 'გადახაზული ობიექტები გამოირიცხა. რამდენი დარჩა?',
    variables: { ...objectVars, a: int(5, 10), x: int(1, 4) },
    pictures: (v) => [iconRow(objIcon(v), num(v, 'a'), undefined, num(v, 'x'))],
    answer: (v) => num(v, 'a') - num(v, 'x'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  u16('sascori', 'which-heavier', 1, {
    prompt: 'რომელი მხარეა უფრო მძიმე?',
    variables: { ...objectVars, a: int(1, 6), b: int(1, 6) },
    constraints: [distinct('a', 'b')],
    pictures: (v) => [{ kind: 'balance', left: icons(objIcon(v), num(v, 'a')), right: icons(objIcon(v), num(v, 'b')), tilt: num(v, 'a') > num(v, 'b') ? 'left' : 'right' }],
    options: fixed('მარცხენა', 'მარჯვენა'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') > num(v, 'b') ? 'მარცხენა' : 'მარჯვენა'),
    explanation: ({ answer }) => `დაბლა ჩამოვარდნილი მხარე მძიმეა: ${answer}.`,
  }),
  u16('Cafiqrebuli-ricxvi', 'between-two', 2, {
    prompt: 'ჩავიფიქრე რიცხვი {a}-სა და {b}-ს შორის. რომელია ის?',
    variables: { a: int(1, 17), b: derived((v: Vars) => num(v, 'a') + 2) },
    pictures: (v) => [chips(num(v, 'a'), '?', num(v, 'b'))],
    answer: (v) => num(v, 'a') + 1,
    explanation: ({ answer }) => `${answer}.`,
  }),
];


/* ------------------------------------------------------------ the remaining subtopics */
const xs5 = P('Sedareba', 'u05x');
const xs6 = P('Sekreba', 'u06x');
const xs7 = P('Gamokleba', 'u07x');
const xs8 = P('ateulebi-orcifra', 'u08x');
const xs9 = P('Sereuli-amocanebi', 'u09x');
const EXTRA: QuestionTemplate[] = [
  xs5('dalageba-danayi', 'middle-on-line', 2, {
    prompt: 'რომელია შუა რიცხვი სამიდან (არც უმცირესი, არც უდიდესი)?',
    variables: { a: int(1, 19), b: int(1, 19), c: int(1, 19) },
    constraints: [distinct('a', 'b', 'c')],
    pictures: (v) => [{ kind: 'line', from: 0, to: 20, step: 1, marks: [num(v, 'a'), num(v, 'b'), num(v, 'c')].map((value) => ({ value, label: String(value) })) }],
    answer: (v) => [num(v, 'a'), num(v, 'b'), num(v, 'c')].sort((x, y) => x - y)[1]!,
    explanation: ({ answer }) => `${answer}.`,
  }),
  xs6('SeSveTebis-arCevani', 'pick-parts', 2, {
    prompt: 'რამდენია ორივე ჯგუფი ერთად? ({a} და {b})',
    variables: { ...objectVars, a: int(2, 9), b: int(2, 9) },
    pictures: (v) => [manyRows([{ tokens: [{ t: 'group', tokens: icons(objIcon(v), num(v, 'a')) }, { t: 'text', text: '+' }, { t: 'group', tokens: icons(objIcon(v), num(v, 'b')) }] }])],
    answer: (v) => num(v, 'a') + num(v, 'b'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  xs7('teqsti-gamokleba', 'story-crossed', 1, {
    prompt: 'იყო {a}, გაჰქონდათ {b}. რამდენი დარჩა?',
    variables: { ...objectVars, a: int(6, 14), b: int(1, 5) },
    pictures: (v) => [iconRow(objIcon(v), num(v, 'a'), undefined, num(v, 'b'))],
    answer: (v) => num(v, 'a') - num(v, 'b'),
    explanation: ({ answer }) => `${answer}.`,
  }),
  xs8('Sedareba-10Tan', 'compare-ten', 2, {
    prompt: 'ორი ჯგუფის ჯამი 10-ზე მეტია, ნაკლებია თუ ტოლი? ({a} და {b})',
    variables: { ...objectVars, a: int(2, 8), b: int(2, 8) },
    pictures: (v) => [manyRows([{ tokens: [{ t: 'group', tokens: icons(objIcon(v), num(v, 'a')) }, { t: 'text', text: '+' }, { t: 'group', tokens: icons(objIcon(v), num(v, 'b')) }] }])],
    options: fixed('მეტია', 'ნაკლებია', 'ტოლია'),
    optionCount: 3,
    text: true,
    answer: (v) => (num(v, 'a') + num(v, 'b') > 10 ? 'მეტია' : num(v, 'a') + num(v, 'b') < 10 ? 'ნაკლებია' : 'ტოლია'),
    explanation: ({ answer }) => `ჯამი 10-თან შედარებით ${answer}.`,
  }),
  xs9('Sedareba-jamebi', 'compare-sums', 3, {
    prompt: 'რომელი ჯამია მეტი: პირველი თუ მეორე?',
    variables: { ...objectVars, a: int(2, 8), b: int(2, 8), c: int(2, 8), d: int(2, 8) },
    constraints: [{ test: (v: Vars) => num(v, 'a') + num(v, 'b') !== num(v, 'c') + num(v, 'd'), note: 'not equal' }],
    pictures: (v) => [
      manyRows([
        { label: 'I', tokens: [{ t: 'group', tokens: icons(objIcon(v), num(v, 'a')) }, { t: 'text', text: '+' }, { t: 'group', tokens: icons(objIcon(v), num(v, 'b')) }] },
        { label: 'II', tokens: [{ t: 'group', tokens: icons(objIcon(v), num(v, 'c')) }, { t: 'text', text: '+' }, { t: 'group', tokens: icons(objIcon(v), num(v, 'd')) }] },
      ]),
    ],
    options: fixed('პირველი', 'მეორე'),
    optionCount: 2,
    text: true,
    answer: (v) => (num(v, 'a') + num(v, 'b') > num(v, 'c') + num(v, 'd') ? 'პირველი' : 'მეორე'),
    explanation: ({ answer }) => `${answer} ჯამია მეტი.`,
  }),
];

export const G1_PICTURED_TEMPLATES: QuestionTemplate[] = [...EXTRA, ...U02, ...U03, ...U04, ...U05, ...U08, ...U09, ...U11, ...U16];

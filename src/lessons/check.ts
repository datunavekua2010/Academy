import { parseNumber, parsePoly, polyEqual } from './algebra';
import { divisionFromLines, divisionOf, groupOf, hasEqualParts, parseLines, ruleHolds } from './exercises/ShapeGeometry';
import { aligned, compareGroup, orderOf, px, readingAt, suitableUnit, unitsIn, zeroAligned } from './exercises/MeasureGeometry';
import { hourHandBetween, minutesBetween, normalHour, normalMinute, parseDigital, sameTime, timeOf, timeText } from './exercises/ClockGeometry';
import { FLAT_NAME, sidesOf, shapeGroup, verticesOf } from './exercises/Shape2DGeometry';
import { isBalanced, panTotal, sentenceHolds, type TermSpec } from './exercises/BalanceGeometry';
import { cellKey, chartCount, vennRegion, type SortObj } from './exercises/SortGeometry';
import { VENN_REGION_NAME } from './exercises/SortGeometry';
import { PLACE_NAME, PLACES, digitsOf, isStandard, partsOf, valueAt, valueOfBlocks, type Place } from './exercises/PlaceValueGeometry';
import { holeValues, landings, ruleText, sequenceOf, stepOf, stepWords, termAt } from './exercises/PatternGeometry';
import { carriedTen, columnDifference, columnSum, digits2, needsBorrow, needsCarry, sumTens } from './exercises/AddSubGeometry';
import { allEqual, arrayTotal, arraysFor, groupsText, multiplyText, repeatedText, totalOf, unevenGroups } from './exercises/GroupsGeometry';
import { cellsFor, factText, productOf, repeatText } from './exercises/TimesGeometry';
import { allSame, fairShare, groupInto, isFairShare, quotientOf, totalOfCounts } from './exercises/ShareGeometry';
import { fractionOf, fractionText, hasEqualPieces, piecesOf } from './exercises/FractionGeometry';
import { addDays, dateFullText, dateText, daysBetween, monthLength, weekdayName, weekdayOf, weeksTextOf } from './exercises/CalendarGeometry';
import { changeFrom, fewestPieces, moneyText, pieceText, totalOf as moneyTotal } from './exercises/MoneyGeometry';
import { cellKey as symCellKey, isReflectionOf, isSymmetricAbout, lineName, missingForSymmetry, reflectCells, sameCells, tidy } from './exercises/SymmetryGeometry';
import { filledText, runSteps, sentenceText, solve, solvePuzzle } from './exercises/PuzzleGeometry';
import {
  cellKey as gridCellKey,
  clueText as gridClueText,
  firstFailed,
  forcedCell,
  holes as gridHoles,
  gridText,
  holes,
  itemAt as patternItemAt,
  itemText,
  latinHolds,
  mistakeAt,
  put as gridPut,
  survivors as survivingCandidates,
  walk as gridWalk,
} from './exercises/GridGeometry';
import type { AnswerInput, Evaluation, GridBoard, GridItem, Misconception, PuzzleTerm, Question, ResponseSpec } from './types';

/**
 * Answer checking. Pure functions only — no React, no DOM — so every rule can
 * be unit-tested and reused by any exercise component.
 */

function findMisconception(list: Misconception[] | undefined, match: (answer: string | number) => boolean): Misconception | undefined {
  return list?.find((m) => m.answers.some(match));
}

function wrong(question: Question, misconception: Misconception | undefined, extra?: Partial<Evaluation>): Evaluation {
  return {
    verdict: 'incorrect',
    feedback: misconception?.feedback ?? question.fallbackFeedback,
    misconceptionId: misconception?.id,
    ...extra,
  };
}

const MSG = {
  needNumber: 'ჩაწერე რიცხვი, მაგალითად 12.',
  needExpression: 'ჩაწერე გამოსახულება, მაგალითად 4x.',
  needAll: 'შეავსე ყველა ცარიელი ადგილი.',
  needChoice: 'აირჩიე ერთ-ერთი პასუხი.',
  needObjects: 'შეეხე საგნებს და აირჩიე საჭირო რაოდენობა.',
  needMove: 'გადაანაცვლე ფილები სწორ რიგში და შემდეგ შეამოწმე.',
  needCounters: 'გადაიტანე კუბიკები ყუთებში და შემდეგ შეამოწმე.',
  needPlace: 'ჯერ ყველა კუბიკი ყუთებში უნდა მოათავსო.',
  needTwoParts: 'ორი ნაწილისთვის ორივე ყუთში უნდა იყოს კუბიკები. სცადე სხვანაირად გაყოფა.',
  needFill: 'შეეხე ცარიელ ადგილებს და დაამატე კუბიკები.',
  needStart: 'ჯერ შეეხე რიცხვს ღერძზე: იქიდან დაიწყე.',
  needJumps: 'გააკეთე ნახტომები ღილაკით და შემდეგ შეამოწმე.',
  needTakeAway: 'შეეხე საგნებს, რომ გამოიტანო ისინი ჯგუფიდან.',
  needIntoFrame: 'გადაიტანე კუბიკები ჩარჩოში და შემდეგ შეამოწმე.',
  needStoryOperation: 'აირჩიე + ან − და ჩაწერე პასუხი.',
  needSort: 'ყველა ნახატი ჯგუფში უნდა ჩადო. შეეხე ნახატს და მერე ჯგუფს.',
  needJudge: 'შეადარე ნაწილები და აირჩიე პასუხი.',
  needSelect: 'შეეხე საჭირო ნაწილებს და მერე შეამოწმე.',
  needReassemble: 'ყველა ნაწილი თავის ადგილზე უნდა დადო.',
  needCut: 'წერტილებზე შეეხე და ხაზები გაავლე, რომ ფიგურა დაიყოს.',
  needAlign: 'ჯერ ორივე საგანი საერთო დასაწყის ხაზამდე მიიტანე.',
  needLengthChoice: 'აირჩიე, რომელია უფრო გრძელი ან უფრო მოკლე.',
  needLengthSort: 'ყველა საგანი ჯგუფში უნდა ჩადო: უფრო გრძელი, უფრო მოკლე თუ იგივე სიგრძე.',
  needUnits: 'დაალაგე ერთნაირი ერთეულები საგანზე და შემდეგ შეამოწმე.',
  needRuler: 'მიიტანე სახაზავი საგანს და ნული დასაწყისთან დააყენე.',
  needCm: 'აირჩიე გაზომვა სანტიმეტრებში.',
  needUnitPick: 'ყველა საგნისთვის აირჩიე სანტიმეტრი ან მეტრი.',
  needHandPick: 'აირჩიე, რომელი ისარი რომელს აჩვენებს.',
  needSetClock: 'ისრები ისე დაატრიალე, რომ საათმა საჭირო დრო აჩვენოს.',
  needTimeChoice: 'აირჩიე დრო, რომელსაც საათი აჩვენებს.',
  needMatch: 'ყველა საათი შეუსაბამე ციფრულ დროს.',
  needShapeSort: 'ყველა ფიგურა ჯგუფში უნდა ჩადო.',
  needTapSides: 'შეეხე ფიგურის ყველა გვერდს და შემდეგ შეამოწმე.',
  needTapCorners: 'შეეხე ფიგურის ყველა კუთხეს და შემდეგ შეამოწმე.',
  needFindShapes: 'შეეხე ყველა საგანს, რომელსაც ეს ფიგურა აქვს.',
  needPans: 'დააწყვე წონები ორ თაროზე და შემდეგ შეამოწმე.',
  needEqualGroups: 'დაამატე ან წაიღე საგნები, სანამ ორივე ჯგუფი ერთნაირი არ იქნება.',
  needSentence: 'შეავსე წინადადების ყველა ადგილი.',
  needSentencePick: 'აირჩიე ყველა მართალი წინადადება.',
  needPuzzle: 'ჩაწერე უცნობი წონის მნიშვნელობა რიცხვით.',
  needSortGroups: 'ყველა საგანი ჯგუფში უნდა ჩადო.',
  needSortGrid: 'ყველა საგანი ცხრილის უჯრაში უნდა ჩადო.',
  needVenn: 'ყველა საგანი უნდა მოხვდეს წრეებში ან მათ გარეთ.',
  needChartRead: 'აირჩიე ერთი კატეგორია.',
  needChartBuild: 'დაამატე სიმბოლოები, სანამ ყველა რიგი შეივსება.',
  needClue: 'აირჩიე ყველა საგანი, რომელიც ყველა პირობას აკმაყოფილებს.',
  needBlocks: 'დააწყვე ბლოკები დაფაზე და შემდეგ შეამოწმე.',
  needCards: 'სამივე ადგილი უნდა შეავსო ბარათებით.',
  needDigit: 'შეეხე ერთ ციფრს და შემდეგ შეამოწმე.',
  needPlaceValue: 'ჩაწერე დაფარული ადგილის მნიშვნელობა.',
  blocksNotStandard: 'ბლოკების მნიშვნელობა სწორია, მაგრამ ჯერ დაუჯგუფებელია: 10 ერთეული უნდა გახდეს 1 ათეული, 10 ათეული — 1 ასეული.',
  cardsWrongPlace: 'ბარათი არასწორ ადგილზეა: ადგილი განსაზღვრავს, რამდენი ღირს ციფრი.',
  digitNotPlace: 'ეს ციფრი სხვა ადგილზე დგას. ადგილები მარცხნიდან მარჯვნივაა: ასეულები, ათეულები, ერთეულები.',
  placeFaceValue: 'ეს ციფრის სახეა, არა მისი ღირებულება ამ ადგილზე.',
  needStoryNumber: 'ჩაწერე პასუხი რიცხვით.',
  frameNotFull: 'ჩარჩოში ჯერ კიდევ არის ცარიელი ადგილი.',
  firstSmallest: 'ჯერ არ არის სწორი. პირველ ადგილზე ყველაზე პატარა რიცხვი უნდა იდგეს.',
  firstLargest: 'ჯერ არ არის სწორი. პირველ ადგილზე ყველაზე დიდი რიცხვი უნდა იდგეს.',
  closeOrder: 'დასაწყისი სწორია. შეადარე დანარჩენი რიცხვები ერთმანეთს.',
  needMarker: 'გადაიტანე მარკერი რიცხვით ღერძზე და შემდეგ შეამოწმე.',
  needSkip: 'გადადგი ნაბიჯები რიცხვით ღერძზე და შემდეგ შეამოწმე.',
  needHoleValues: 'შეავსე ყველა გამოტოვებული რიცხვი.',
  needRule: 'აირჩიე წესი: რამენით იცვლება რიცხვები?',
  needColumnAnswer: 'ჩაწერე პასუხი ორივე სვეტში: ათეულებიც და ერთეულებიც.',
  needSumSteps: 'ჩაწერე ორივე ციფრი: ერთეულების ჯამი და ათეულების ჯამი.',
  needBorrowFirst: 'ჯერ გახსენი ერთი ათეული 10 ერთეულად, მერე ჩაწერე სხვაობა.',
  needStoryOp: 'ჯერ აირჩიე მოქმედება: შეკრება თუ გამოკლება, და ჩაწერე პასუხი.',
  transposed: 'ციფრები ადგილებში შეიცვალა: ათეულები და ერთეულები ერთმანეთში აირია.',
  noCarry: 'ერთეულების ჯამი 10-ზე ნაკლებია — გადატანა არ არის საჭირო.',
  needCarry: 'ერთეულების ჯამი 10-ს ან მეტს იძლევა — ერთი ათეული უნდა გადავიდეს ათეულებში.',
  noBorrow: 'ერთეულების ციფრი საკმარისია — ათეულის დაშლა არ არის საჭირო.',
  wrongOperation: 'მოქმედება არასწორია: შეხედე, რაოდენობა იზრდება თუ მცირდება.',
  needEqual: 'დაამატე ან წაიღე საგნები, სანამ ყველა ჯგუფში ერთი და იგივე რაოდენობა იქნება.',
  needArray: 'ჩაწერე რიგების რაოდენობა და თითო რიგში საგნების რაოდენობა.',
  arrayOff: 'რიგებისა და სვეტების ნამრავლი სულს უნდა უდრიდეს.',
  needStoryGroups: 'ჩაწერე ჯგუფები, თითოეულში საგნები და სულ რაოდენობა.',
  groupsUneven: 'ჯგუფები ჯერ არ არის ტოლი: თითოეულში ერთი და იგივე რაოდენობა უნდა იყოს.',
  needFactors: 'ჩაწერე ორივე თანამამრავლი — ნამრავლი თვითონ გამოითვლება.',
  needTable: 'შეავსე ცხრილი თანმიმდევრულად, 1 × ცხრილიდან დაწყებული.',
  needShare: 'ჩაწერე, რამდენს მიიღებს თითოეული და რამდენი დარჩება.',
  needGroups: 'ჩაწერე სრული ჯგუფების რაოდენობა და ნაშთი.',
  needDivision: 'ჩაწერე საერთო რაოდენობა და ჯგუფების რაოდენობა.',
  needFamily: 'ჩაწერე გამოტოვებული რიცხვი.',
  needParts: 'აირჩიე: ტოლი თუ არატოლი ნაწილები.',
  needPick: 'მონიშნე საჭირო რაოდენობის ნაწილი.',
  needFraction: 'ჩაწერე მრიცხველი და მნიშვნელი.',
  shareOff: 'დარიგებული რაოდენობა სულს უნდა უდრიდეს.',
  shareUneven: 'ჯერ არ არის თანაბარი: ყველა ბავშვს ერთი და იგივე რაოდენობა უნდა ჰქონდეს.',
  groupsOff: 'სრული ჯგუფები და ნაშთი ერთად სულ რაოდენობას უნდა უდრიდეს.',
  divisionOff: 'გაყოფა და გამრავლება ერთსა და იმავე რიცხვებს ეხება.',
  partsUnequal: 'ნაწილები ტოლი ზომისა არ არის — ეს ტოლი ნაწილები არ არის.',
  fractionOff: 'მნიშვნელი ამბობს, რამდენ ტოლ ნაწილად არის დაყოფილი მთელი, მრიცხველი — რამდენია აღებული.',
  needDate: 'ჩაწერე თარიღი: წელი, თვე და დღე.',
  needWeekday: 'აირჩიე კვირის დღე.',
  needDays: 'ჩაწერე დღეების რაოდენობა.',
  needElapsed: 'ჩაწერე გასული საათები და წუთები.',
  needMoney: 'ჩაწერე თანხა თეთრებში.',
  needMoneyPair: 'ჯერ მიუთითე, საკმარისია თუ არა ფული, და შემდეგ ჩაწერე ხურდა.',
  needMoneyBuild: 'აიღე ფული, სანამ თანხა ზუსტად არ შეივსება.',
  needCells: 'მონიშნე უჯრები.',
  dateOff: 'ეს თარიღი კალენდარზე არ არსებობს: თვეში მეტი დღე არ არის.',
  moneyOff: 'თანხა ფულის ნაჭრების ჯამია: დათვალე თითოეული ერთხელ.',
  symmetryOff: 'სარკის ხაზი მაშინაა სწორი, როცა თითოეულ უჯრას მეორე მხარეს ზუსტი წყვილი აქვს.',
  wrongRule: 'ეს რიცხვები ასე არ იცვლება: შეადარე ორი მეზობელი რიცხვი.',
  notSimplified: 'მნიშვნელობა სწორია, მაგრამ გამოსახულება ჯერ არ არის გამარტივებული. ჩაწერე ყველაზე მარტივი სახით.',
};

/** Reads a typed cell list (`"0,0;1,2"`) back into cells, dropping anything that is not a whole pair. */
function parseCells(text: string): Array<{ x: number; y: number }> {
  return text
    .split(';')
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.split(',').map((n) => Number(n.trim())))
    .filter((pair) => pair.length === 2 && pair.every((n) => Number.isInteger(n)))
    .map(([x, y]) => ({ x, y }));
}

export function evaluateAnswer(question: Question, input: AnswerInput): Evaluation {
  return evaluateResponse(question, question.response, input);
}

/** The explanation for a wrong answer: the question's own words, then the detail this checker worked out. */
const withDetail = (question: Question, detail: string): string =>
  !detail ? (question.fallbackFeedback ?? '') : question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail;

/** The symbol standing in a place — a sentence being solved always has one to get. */
const termSym = (term: PuzzleTerm): string => {
  if (typeof term === 'number') throw new RangeError('this place holds a number, not a symbol');
  return term.sym;
};

/** A grid route is stored as `"1,1,1,2"`; this turns it back into the cells it names. */
function pairsOf(flat: readonly string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) out.push(`${flat[i]},${flat[i + 1]}`);
  return out;
}

/** Two pattern items are the same when their shape and colour both match. */
const sameGridItem = (a: GridItem | undefined, b: GridItem): boolean => Boolean(a) && a!.shape === b.shape && (a!.colour ?? '') === (b.colour ?? '');

export function evaluateResponse(question: Question, response: ResponseSpec, input: AnswerInput): Evaluation {
  switch (response.type) {
    case 'choice': {
      const value = typeof input === 'string' ? input : '';
      if (!value) return { verdict: 'incomplete', feedback: MSG.needChoice };
      if (value === response.answer) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => a === value));
    }
    case 'numeric': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: MSG.needNumber };
      if (Math.abs(n - response.answer) < 1e-9) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => typeof a === 'number' && Math.abs(a - n) < 1e-9));
    }
    case 'expression': {
      const text = typeof input === 'string' ? input : '';
      if (!text.trim()) return { verdict: 'incomplete', feedback: MSG.needExpression };
      const typed = parsePoly(text);
      if (!typed) return { verdict: 'incomplete', feedback: MSG.needExpression };
      const target = parsePoly(response.answer);
      if (!target) throw new Error(`Bad expression answer in lesson data: ${response.answer}`);
      if (polyEqual(typed, target)) {
        if (typed.unsimplified) return { verdict: 'incorrect', feedback: MSG.notSimplified, notSimplified: true };
        return { verdict: 'correct' };
      }
      const hit = findMisconception(question.misconceptions, (a) => {
        const candidate = parsePoly(String(a));
        return candidate !== null && polyEqual(candidate, typed);
      });
      return wrong(question, hit);
    }
    case 'line': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: MSG.needMarker };
      if (n === response.answer) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => typeof a === 'number' && a === n));
    }
    case 'collect': {
      const picked = typeof input === 'string' && input ? new Set(input.split(',').filter(Boolean)) : new Set<string>();
      if (picked.size === 0) return { verdict: 'incomplete', feedback: MSG.needObjects };
      if (picked.size === response.answer) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => typeof a === 'number' && a === picked.size));
    }
    case 'order': {
      const order = typeof input === 'string' && input ? input.split(',').map(Number) : [];
      if (order.length !== response.items.length || order.some((n) => !Number.isFinite(n))) return { verdict: 'incomplete', feedback: MSG.needMove };
      const right = correctOrder(response);
      if (order.every((n, i) => n === right[i])) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => String(a) === order.join(','));
      if (hit) return wrong(question, hit);
      const generic = order[0] !== right[0] ? (response.direction === 'asc' ? MSG.firstSmallest : MSG.firstLargest) : MSG.closeOrder;
      return { verdict: 'incorrect', feedback: generic };
    }
    case 'split': {
      const left = parseNumber(typeof input === 'string' ? input : '');
      if (left === null || left === response.total) return { verdict: 'incomplete', feedback: MSG.needCounters };
      if (left === response.answer) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => typeof a === 'number' && a === left));
    }
    case 'distribute': {
      const [a, b] = typeof input === 'string' && input ? input.split(',').map(Number) : [0, 0];
      const placed = (Number.isFinite(a) ? a : 0) + (Number.isFinite(b) ? b : 0);
      if (placed < response.total) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needPlace };
      if (response.allowEmpty === false && (a === 0 || b === 0)) return wrong(question, undefined, { feedback: MSG.needTwoParts });
      return { verdict: 'correct' };
    }
    case 'fill': {
      const added = parseNumber(typeof input === 'string' ? input : '');
      if (added === null || added === 0) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needFill };
      if (response.given + added === response.size) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (m) => typeof m === 'number' && m === added);
      return { ...wrong(question, hit), feedback: hit?.feedback ?? question.fallbackFeedback ?? MSG.frameNotFull };
    }
    case 'jumps': {
      const [s, c] = (typeof input === 'string' ? input : '').split(',');
      const start = s === undefined || s === '' ? (response.pickStart ? null : response.from) : Number(s);
      const count = Number(c ?? 0) || 0;
      if (start === null || !Number.isFinite(start)) return { verdict: 'incomplete', feedback: MSG.needStart };
      if (count <= 0) return { verdict: 'incomplete', feedback: MSG.needJumps };
      const other = response.direction === 'forward' && start === response.count && count === response.from;
      if ((start === response.from && count === response.count) || (response.swapOk && other)) return { verdict: 'correct' };
      const reason = other ? 'swapped' : start !== response.from ? 'start' : count < response.count ? 'few' : 'many';
      return wrong(question, findMisconception(question.misconceptions, (a) => a === reason));
    }
    case 'takeaway': {
      const taken = typeof input === 'string' && input ? new Set(input.split(',').filter(Boolean)).size : 0;
      if (taken === 0) return { verdict: 'incomplete', feedback: MSG.needTakeAway };
      if (taken === response.remove) return { verdict: 'correct' };
      const reason = taken < response.remove ? 'few' : 'many';
      return wrong(question, findMisconception(question.misconceptions, (a) => a === reason || a === taken));
    }
    case 'make-ten': {
      const inFrame = parseNumber(typeof input === 'string' ? input : '');
      if (inFrame === null || inFrame <= response.a) return { verdict: 'incomplete', feedback: MSG.needIntoFrame };
      if (inFrame === 10) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => typeof a === 'number' && a === inFrame);
      return { ...wrong(question, hit), feedback: hit?.feedback ?? question.fallbackFeedback ?? MSG.frameNotFull };
    }
    case 'story': {
      const text = typeof input === 'string' ? input : '';
      const op = text.startsWith('+') ? '+' : text.startsWith('-') ? '-' : '';
      const n = parseNumber(text.slice(text.indexOf(',') + 1));
      if (!op) return { verdict: 'incomplete', feedback: MSG.needStoryOperation };
      if (n === null) return { verdict: 'incomplete', feedback: MSG.needStoryNumber };
      if (op !== (response.operation === 'add' ? '+' : '-')) return wrong(question, findMisconception(question.misconceptions, (a) => a === 'operation'));
      if (n === response.answer) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => typeof a === 'number' && a === n));
    }
    case 'blanks': {
      const values = Array.isArray(input) ? input : [];
      if (values.length < response.answers.length || values.slice(0, response.answers.length).some((v) => !v || !v.trim())) {
        return { verdict: 'incomplete', feedback: MSG.needAll };
      }
      const nums = values.slice(0, response.answers.length).map(parseNumber);
      if (nums.some((n) => n === null)) return { verdict: 'incomplete', feedback: MSG.needNumber };
      const ok = nums.every((n, i) => n !== null && Math.abs(n - response.answers[i]) < 1e-9);
      if (ok) return { verdict: 'correct' };
      const joined = nums.join(',');
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === joined));
    }
    case 'classify': {
      const groups = typeof input === 'string' && input ? input.split(',') : [];
      if (groups.length !== response.items.length || groups.some((g) => !g)) return { verdict: 'incomplete', feedback: MSG.needSort };
      const right = response.items.map((item) => groupOf(response.rule, item));
      if (groups.every((g, i) => g === right[i])) return { verdict: 'correct' };
      const wrongIndex = groups.findIndex((g, i) => g !== right[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex)));
    }
    case 'judge': {
      const value = typeof input === 'string' ? input : '';
      if (!value) return { verdict: 'incomplete', feedback: MSG.needJudge };
      const yes = ruleHolds(response.rule, divisionOf(response.shape));
      const expected = response.rule === 'equal' ? (yes ? 'e' : 'u') : yes ? 'y' : 'n';
      if (value === expected) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === value));
    }
    case 'select-parts': {
      const picked = typeof input === 'string' && input ? input.split(',').map(Number).filter((n) => Number.isInteger(n)) : [];
      if (picked.length === 0) return { verdict: 'incomplete', feedback: MSG.needSelect };
      const from = response.from ?? divisionOf(response.shape).pieces.map((_, i) => i + 1);
      const right = picked.length === response.need && picked.every((n) => from.includes(n));
      if (right) return { verdict: 'correct' };
      const reason = picked.length !== response.need ? 'count' : 'which';
      return wrong(question, findMisconception(question.misconceptions, (a) => a === reason));
    }
    case 'reassemble': {
      const places = typeof input === 'string' && input ? input.split(',') : [];
      const real = divisionOf(response.shape).pieces.length;
      const placed = places.filter((p) => p !== '-' && p !== '').length;
      if (placed < real) return { verdict: 'incomplete', feedback: MSG.needReassemble };
      // the board only accepts pieces that fit their place, so a full board is a correct answer
      return { verdict: 'correct' };
    }
    case 'cut': {
      const lines = parseLines(typeof input === 'string' ? input : '');
      if (lines.length === 0) return { verdict: 'incomplete', feedback: MSG.needCut };
      const division = divisionFromLines(response.shape, lines);
      if (division.pieces.length !== response.parts) {
        return wrong(question, findMisconception(question.misconceptions, (a) => a === 'count'));
      }
      if (!hasEqualParts(division)) {
        return wrong(question, findMisconception(question.misconceptions, (a) => a === 'unequal'));
      }
      return { verdict: 'correct' };
    }
    case 'align-compare': {
      const [didAlign, choice = ''] = String(input ?? '').split(',');
      // the unit always draws both objects from one line; an unaligned picture is never a valid comparison
      if (didAlign !== '1' || !aligned([0, 0])) return { verdict: 'incomplete', feedback: MSG.needAlign };
      if (!choice) return { verdict: 'incomplete', feedback: MSG.needLengthChoice };
      const order = orderOf(response.a.cm, response.b.cm);
      const longer = order === 'first-longer' ? 'a' : order === 'second-longer' ? 'b' : 'same';
      const shorter = order === 'first-longer' ? 'b' : order === 'second-longer' ? 'a' : 'same';
      const right = (response.ask ?? 'longer') === 'longer' ? longer : shorter;
      if (choice === right) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === choice));
    }
    case 'length-sort': {
      const groups = typeof input === 'string' && input ? input.split(',').map((g) => g.trim()) : [];
      if (groups.length !== response.items.length || groups.some((g) => !g)) return { verdict: 'incomplete', feedback: MSG.needLengthSort };
      const right = response.items.map((item) => compareGroup(item.cm, response.reference.cm));
      if (groups.every((g, i) => g === right[i])) return { verdict: 'correct' };
      const wrongIndex = groups.findIndex((g, i) => g !== right[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex)));
    }
    case 'measure-units': {
      const placed = Number(String(input ?? '').trim());
      if (!Number.isFinite(placed) || placed <= 0) return { verdict: 'incomplete', feedback: MSG.needUnits };
      const right = unitsIn(response.object.cm, response.unitCm);
      if (placed === right) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => Number(a) === placed));
    }
    case 'ruler-read': {
      const [zeroText = '', cmText = ''] = String(input ?? '').split(',');
      const zero = Number(zeroText);
      const cm = Number(cmText);
      if (zeroText === '' || !Number.isFinite(zero)) return { verdict: 'incomplete', feedback: MSG.needRuler };
      if (cmText === '' || !Number.isFinite(cm)) return { verdict: 'incomplete', feedback: MSG.needCm };
      // the zero mark has to sit under the object's start; only then is the tick at the end its length
      if (!zeroAligned(0, px(zero))) return wrong(question, findMisconception(question.misconceptions, (a) => a === 'zero'));
      // the tick at the far end is the length only when the zero is at the start, and the answer must be that reading
      if (cm === readingAt(px(response.object.cm), px(zero)) && cm === response.answerCm) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => Number(a) === cm));
    }
    case 'hand-pick': {
      const [hour = '', minute = ''] = String(input ?? '').split(',');
      if (!hour || !minute) return { verdict: 'incomplete', feedback: MSG.needHandPick };
      if (hour === response.hourHand && minute === response.minuteHand) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => a === `${hour},${minute}` || a === hour || a === minute));
    }
    case 'set-clock': {
      const [hText = '', mText = ''] = String(input ?? '').split(',');
      if (hText === '' || mText === '') return { verdict: 'incomplete', feedback: MSG.needSetClock };
      const h = Number(hText);
      const m = Number(mText);
      if (!Number.isFinite(h) || !Number.isFinite(m)) return { verdict: 'incomplete', feedback: MSG.needSetClock };
      const set = timeOf(h, m);
      const ask = timeOf(response.ask.h, response.ask.m);
      if (sameTime(set, ask)) return { verdict: 'correct' };
      // a common slip: the hour set right but the minute hand left at the wrong mark, or the other way round
      if (normalHour(set.h) === normalHour(ask.h)) return wrong(question, findMisconception(question.misconceptions, (a) => a === 'minute'));
      if (normalMinute(set.m) === normalMinute(ask.m)) return wrong(question, findMisconception(question.misconceptions, (a) => a === 'hour'));
      // at half past the hour hand must really be between the numbers
      if (normalMinute(ask.m) === 30 && Math.abs(hourHandBetween(set) - hourHandBetween(ask)) > 0.01)
        return wrong(question, findMisconception(question.misconceptions, (a) => a === 'between'));
      return wrong(question, findMisconception(question.misconceptions, (a) => a === `${normalHour(set.h)},${normalMinute(set.m)}`));
    }
    case 'read-clock': {
      const [hText = '', mText = ''] = String(input ?? '').split(',');
      if (hText === '' || mText === '') return { verdict: 'incomplete', feedback: MSG.needTimeChoice };
      const chosen = timeOf(Number(hText), Number(mText));
      if (!Number.isFinite(Number(hText)) || !Number.isFinite(Number(mText))) return { verdict: 'incomplete', feedback: MSG.needTimeChoice };
      if (sameTime(chosen, timeOf(response.time.h, response.time.m))) return { verdict: 'correct' };
      const key = `${normalHour(chosen.h)},${normalMinute(chosen.m)}`;
      return wrong(question, findMisconception(question.misconceptions, (a) => a === key));
    }
    case 'match-time': {
      const picks = typeof input === 'string' && input ? input.split(',').map((p) => p.trim()) : [];
      if (picks.length !== response.faces.length || picks.some((p) => p === '')) return { verdict: 'incomplete', feedback: MSG.needMatch };
      const mapping = picks.map(Number);
      if (mapping.some((n) => !Number.isInteger(n) || n < 0 || n >= response.displays.length))
        return { verdict: 'incomplete', feedback: MSG.needMatch };
      // a display belongs to a face only when it reads the same time as that face, so the display text itself is
      // parsed and compared — never the index, so a shuffled set of displays cannot be scored by position
      const right = response.faces.every((time, i) => {
        const chosen = parseDigital(response.displays[mapping[i]] ?? '');
        return chosen !== null && sameTime(time, chosen);
      });
      if (right) return { verdict: 'correct' };
      const wrongIndex = response.faces.findIndex((time, i) => {
        const chosen = parseDigital(response.displays[mapping[i]] ?? '');
        return chosen === null || !sameTime(time, chosen);
      });
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex)));
    }
    case 'shape-sort': {
      const groups = typeof input === 'string' && input ? input.split(',').map((g) => g.trim()) : [];
      if (groups.length !== response.shapes.length || groups.some((g) => !g)) return { verdict: 'incomplete', feedback: MSG.needShapeSort };
      const right = response.shapes.map((spec) =>
        response.groupBy === 'kind' ? shapeGroup(spec) : response.groupBy === 'sides' ? String(sidesOf(spec)) : String(verticesOf(spec)),
      );
      if (groups.every((g, i) => g === right[i])) return { verdict: 'correct' };
      const wrongIndex = groups.findIndex((g, i) => g !== right[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex) || a === right[wrongIndex]));
    }
    case 'tap-parts': {
      const tapped = typeof input === 'string' && input ? input.split(',').filter(Boolean).map(Number) : [];
      const count = response.tap === 'sides' ? sidesOf(response.shape) : verticesOf(response.shape);
      if (count === 0) {
        // a circle has no straight sides and no corners: nothing is the right answer, and the lesson says why
        if (tapped.length === 0) return { verdict: 'incorrect', feedback: question.fallbackFeedback ?? MSG[response.tap === 'sides' ? 'needTapSides' : 'needTapCorners'] };
        return wrong(question, findMisconception(question.misconceptions, (a) => a === 'circle'));
      }
      if (tapped.length < count) return { verdict: 'incomplete', feedback: MSG[response.tap === 'sides' ? 'needTapSides' : 'needTapCorners'] };
      const unique = [...new Set(tapped)];
      if (unique.length === count && unique.every((n) => n >= 1 && n <= count) && tapped.length === count) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => Number(a) === unique.length || a === 'repeat'));
    }
    case 'find-shapes': {
      const picked = typeof input === 'string' && input ? input.split(',').filter(Boolean) : [];
      if (picked.length === 0) return { verdict: 'incomplete', feedback: MSG.needFindShapes };
      const right = response.items.filter((item) => shapeGroup(item.spec) === response.kind).map((item) => item.id);
      if (picked.length === right.length && right.every((id) => picked.includes(id))) return { verdict: 'correct' };
      const wrongId = picked.find((id) => !right.includes(id));
      const missing = right.find((id) => !picked.includes(id));
      return wrong(question, findMisconception(question.misconceptions, (a) => a === wrongId || a === missing || a === 'extra' || a === 'missing'));
    }
    case 'unit-pick': {
      const picks = typeof input === 'string' && input ? input.split(',').map((p) => p.trim()) : [];
      if (picks.length !== response.items.length || picks.some((p) => !p)) return { verdict: 'incomplete', feedback: MSG.needUnitPick };
      const right = response.items.map((item) => suitableUnit(item.cm));
      if (picks.every((p, i) => p === right[i])) return { verdict: 'correct' };
      const wrongIndex = picks.findIndex((p, i) => p !== right[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex)));
    }
    case 'balance-pans': {
      // both pans are always "filled": an empty pan is a real state, not an unfinished answer
      const raw = typeof input === 'string' ? input : '';
      if (!raw.includes(':')) return { verdict: 'incomplete', feedback: MSG.needPans };
      const [l = '', r = ''] = raw.split(':');
      const nums = (t: string): number[] => t.split(',').filter((v) => v !== '').map(Number);
      const left = nums(l);
      const right = nums(r);
      // the weights on the pans must be the ones handed out, counted with multiplicity
      const pool = [...response.weights];
      for (const w of [...left, ...right]) {
        const at = pool.indexOf(w);
        if (at < 0) return { verdict: 'incorrect', feedback: question.fallbackFeedback, misconceptionId: 'invented' };
        pool.splice(at, 1);
      }
      if (left.length === 0 && right.length === 0) return { verdict: 'incomplete', feedback: MSG.needPans };
      // the question may already have weights sitting on a pan; the student's own weights are added to those
      const fullLeft = [...(response.left ?? []), ...left];
      const fullRight = [...(response.right ?? []), ...right];
      if (isBalanced({ left: { weights: fullLeft }, right: { weights: fullRight } })) return { verdict: 'correct' };
      const heavier = panTotal({ weights: fullLeft }) > panTotal({ weights: fullRight }) ? 'left' : 'right';
      return wrong(question, findMisconception(question.misconceptions, (a) => a === heavier || a === 'unbalanced'));
    }
    case 'equal-groups': {
      const raw = typeof input === 'string' ? input : '';
      const [aText = '', bText = ''] = raw.split(',');
      if (aText === '' || bText === '') return { verdict: 'incomplete', feedback: MSG.needEqualGroups };
      const a = Number(aText);
      const b = Number(bText);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return { verdict: 'incomplete', feedback: MSG.needEqualGroups };
      // untouched is unfinished — unless the two groups started out equal, in which case "nothing to do" is the answer
      if (a === response.a && b === response.b && response.a !== response.b)
        return { verdict: 'incomplete', feedback: MSG.needEqualGroups };
      if (a === b) return { verdict: 'correct' };
      const diff = Math.abs(a - b);
      return wrong(question, findMisconception(question.misconceptions, (x) => Number(x) === diff || x === (a > b ? 'a' : 'b')));
    }
    case 'sentence-build': {
      const places = response.template.split('{}').length - 1;
      const values = typeof input === 'string' && input ? input.split(',') : [];
      if (values.length < places || values.slice(0, places).some((v) => !v)) return { verdict: 'incomplete', feedback: MSG.needSentence };
      const ok = values.slice(0, places).every((v, i) => v === response.answers[i]);
      if (ok) return { verdict: 'correct' };
      const wrongIndex = values.slice(0, places).findIndex((v, i) => v !== response.answers[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex) || a === response.answers[wrongIndex]));
    }
    case 'sentence-pick': {
      const picked = typeof input === 'string' && input ? input.split(',').filter(Boolean) : [];
      if (picked.length === 0) return { verdict: 'incomplete', feedback: MSG.needSentencePick };
      const right = response.sentences.filter((s) => sentenceHolds({ left: s.left, right: s.right })).map((s) => s.id);
      if (picked.length === right.length && right.every((id) => picked.includes(id))) return { verdict: 'correct' };
      const extra = picked.find((id) => !right.includes(id));
      const missing = right.find((id) => !picked.includes(id));
      return wrong(question, findMisconception(question.misconceptions, (a) => a === extra || a === missing || a === 'extra' || a === 'missing'));
    }
    case 'balance-puzzle': {
      const text = typeof input === 'string' ? input.trim() : '';
      if (!text) return { verdict: 'incomplete', feedback: MSG.needPuzzle };
      const n = Number(text.replace(',', '.'));
      if (!Number.isFinite(n)) return { verdict: 'incomplete', feedback: MSG.needPuzzle };
      if (n === response.answer) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => Number(a) === n || a === 'wrong'));
    }
    case 'sort-groups': {
      const groups = typeof input === 'string' && input ? input.split(',').map((g) => g.trim()) : [];
      const objs = response.objects as SortObj[];
      if (groups.length !== objs.length || groups.some((g) => !g)) return { verdict: 'incomplete', feedback: MSG.needSortGroups };
      const right = objs.map((o) => o[response.attr]);
      if (groups.every((g, i) => g === right[i])) return { verdict: 'correct' };
      const wrongIndex = groups.findIndex((g, i) => g !== right[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex) || a === right[wrongIndex]));
    }
    case 'sort-grid': {
      const cells = typeof input === 'string' && input ? input.split(',').map((c) => c.trim()) : [];
      const objs = response.objects as SortObj[];
      if (cells.length !== objs.length || cells.some((c) => !c)) return { verdict: 'incomplete', feedback: MSG.needSortGrid };
      const right = objs.map((o) => cellKey(o, response.rowAttr, response.colAttr));
      if (cells.every((c, i) => c === right[i])) return { verdict: 'correct' };
      const wrongIndex = cells.findIndex((c, i) => c !== right[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex) || a === right[wrongIndex]));
    }
    case 'venn-sort': {
      const regions = typeof input === 'string' && input ? input.split(',').map((r) => r.trim()) : [];
      const objs = response.objects as SortObj[];
      if (regions.length !== objs.length || regions.some((r) => !r)) return { verdict: 'incomplete', feedback: MSG.needVenn };
      const right = objs.map((o) => vennRegion(o, response.leftAttr, response.leftValue, response.rightAttr, response.rightValue));
      if (regions.every((r, i) => r === right[i])) return { verdict: 'correct' };
      const wrongIndex = regions.findIndex((r, i) => r !== right[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => a === regions[wrongIndex] || a === right[wrongIndex] || String(a) === String(wrongIndex)));
    }
    case 'chart-read': {
      const picked = typeof input === 'string' ? input.trim() : '';
      if (!picked) return { verdict: 'incomplete', feedback: MSG.needChartRead };
      const chart = { glyph: response.chart.glyph, rows: response.chart.rows };
      const counts = response.chart.rows.map((r) => r.count);
      let right: string[] = [];
      if (response.ask === 'most') {
        const max = Math.max(...counts);
        right = response.chart.rows.filter((r) => r.count === max).map((r) => r.label);
      } else if (response.ask === 'least') {
        const min = Math.min(...counts);
        right = response.chart.rows.filter((r) => r.count === min).map((r) => r.label);
      } else if (response.ask === 'same') {
        const other = response.compareWith ?? '';
        const target = chartCount(chart, other);
        right = response.chart.rows.filter((r) => r.label !== other && r.count === target).map((r) => r.label);
      } else {
        const other = chartCount(chart, response.compareWith ?? '');
        right = response.chart.rows.filter((r) => (response.ask === 'more' ? r.count > other : r.count < other)).map((r) => r.label);
      }
      if (right.includes(picked)) return { verdict: 'correct' };
      return wrong(question, findMisconception(question.misconceptions, (a) => a === picked));
    }
    case 'chart-build': {
      const counts = typeof input === 'string' && input ? input.split(',').map((c) => Number(c || 0)) : [];
      if (counts.length < response.labels.length) return { verdict: 'incomplete', feedback: MSG.needChartBuild };
      const shown = counts.slice(0, response.labels.length);
      if (shown.every((c, i) => c === response.target[i])) return { verdict: 'correct' };
      if (shown.every((c) => c === 0)) return { verdict: 'incomplete', feedback: MSG.needChartBuild };
      const wrongIndex = shown.findIndex((c, i) => c !== response.target[i]);
      return wrong(question, findMisconception(question.misconceptions, (a) => String(a) === String(wrongIndex) || a === 'count'));
    }
    case 'clue-pick': {
      const picked = typeof input === 'string' && input ? input.split(',').filter(Boolean) : [];
      if (picked.length === 0) return { verdict: 'incomplete', feedback: MSG.needClue };
      const right = (response.objects as SortObj[])
        .filter((o) => response.clues.every((c) => (o[c.attr] === c.value) !== Boolean(c.negate)))
        .map((o) => o.id);
      if (picked.length === right.length && right.every((id) => picked.includes(id))) return { verdict: 'correct' };
      const extra = picked.find((id) => !right.includes(id));
      const missing = right.find((id) => !picked.includes(id));
      return wrong(question, findMisconception(question.misconceptions, (a) => a === extra || a === missing || a === 'extra' || a === 'missing'));
    }
    case 'place-build': {
      const [h = '', t = '', o = ''] = (typeof input === 'string' ? input : '').split(',');
      if (h === '' || t === '' || o === '') return { verdict: 'incomplete', feedback: MSG.needBlocks };
      const counts = { hundreds: Number(h), tens: Number(t), ones: Number(o) };
      if (!Object.values(counts).every((n) => Number.isInteger(n) && n >= 0)) return { verdict: 'incomplete', feedback: MSG.needBlocks };
      const worth = valueOfBlocks(counts);
      if (worth === 0) return { verdict: 'incomplete', feedback: MSG.needBlocks };
      // the blocks are judged by what they are worth — but a built number is normally in standard form, where no place
      // holds ten or more. Only a question that is explicitly about loose blocks accepts an ungrouped set.
      const standard = isStandard(counts);
      if (response.allowRegroup !== true && !standard) return { verdict: 'incorrect', feedback: MSG.blocksNotStandard, misconceptionId: 'not-standard' };
      if (worth === response.target) return { verdict: 'correct' };
      const target = digitsOf(response.target);
      const swapped = PLACES.find((p) => counts[p] === target[p] && counts[p] !== 0);
      const hit = findMisconception(question.misconceptions, (a) => Number(a) === worth || a === 'worth' || (a === 'swapped' && swapped !== undefined));
      if (hit) return wrong(question, hit);
      return wrong(question, { id: 'worth', answers: [], feedback: `ბლოკები ${worth}-ს იძლევა, საჭიროა ${response.target}. შეამოწმე ასეულები, ათეულები და ერთეულები.` });
    }
    case 'expanded-build': {
      const cards = (typeof input === 'string' ? input : '').split(',');
      if (cards.length < 3 || cards.slice(0, 3).some((c) => c === '' || c === undefined)) return { verdict: 'incomplete', feedback: MSG.needCards };
      const values = cards.slice(0, 3).map(Number);
      if (!values.every((n) => Number.isFinite(n))) return { verdict: 'incomplete', feedback: MSG.needCards };
      const right = partsOf(response.value).map((p) => p.value);
      if (values.every((v, i) => v === right[i])) return { verdict: 'correct' };
      // a card placed by its face value instead of its place is the interesting mistake here
      const face = digitsOf(response.value);
      const faceWrong = values.some((v, i) => v === face[PLACES[i]] && v !== right[i]);
      const hit = findMisconception(question.misconceptions, (a) => a === 'face' || a === 'place');
      if (hit) return wrong(question, hit);
      return wrong(question, faceWrong ? { id: 'face-value', answers: [], feedback: MSG.cardsWrongPlace } : undefined);
    }
    case 'digit-tap': {
      const tapped = typeof input === 'string' && (PLACES as string[]).includes(input) ? (input as Place) : null;
      if (!tapped) return { verdict: 'incomplete', feedback: MSG.needDigit };
      if (tapped === response.target) return { verdict: 'correct' };
      // tapping the digit whose face value equals the target digit is the classic "digit, not place" slip
      const faceMatch = digitsOf(response.value)[tapped] === digitsOf(response.value)[response.target];
      const hit = findMisconception(question.misconceptions, (a) => a === tapped || (a === 'face' && faceMatch));
      if (hit) return wrong(question, hit);
      return wrong(question, faceMatch ? { id: 'face-value', answers: [], feedback: MSG.digitNotPlace } : undefined);
    }
    case 'place-missing': {
      const text = typeof input === 'string' ? input.trim() : '';
      if (!text) return { verdict: 'incomplete', feedback: MSG.needPlaceValue };
      const n = Number(text.replace(',', '.'));
      if (!Number.isFinite(n)) return { verdict: 'incomplete', feedback: MSG.needPlaceValue };
      const answer = valueAt(response.value, response.missing);
      if (n === answer) return { verdict: 'correct' };
      const faceValue = digitsOf(response.value)[response.missing];
      if (n === faceValue) return wrong(question, findMisconception(question.misconceptions, (a) => a === 'face') ?? { id: 'face-value', answers: [], feedback: MSG.placeFaceValue });
      return wrong(question, findMisconception(question.misconceptions, (a) => Number(a) === n));
    }
    case 'skip-line': {
      const text = typeof input === 'string' ? input.trim() : '';
      if (!text) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needSkip };
      const hops = Number(text);
      if (!Number.isInteger(hops) || hops < 0) return { verdict: 'incomplete', feedback: MSG.needSkip };
      const wanted = response.count - 1;
      if (hops === wanted) return { verdict: 'correct' };
      // the character stopped on a real landing, but not the last one: the count is short, not the rule
      const landed = termAt(response.start, response.step, hops);
      const hit = findMisconception(question.misconceptions, (a) => Number(a) === hops);
      if (hit) return wrong(question, hit);
      // the character stands on a real landing, just not the last one: the count is short, not the rule
      const left = wanted - hops;
      // the count is the point of this question, so say how many jumps are missing rather than a generic line
      return {
        verdict: 'incorrect',
        misconceptionId: 'short',
        feedback:
          left > 0
            ? `ჩერდები ${landed}-ზე. ${ruleText(response.step)} — კიდევ ${left} ნახტომია საჭირო.`
            : `გადახვედი ${landed}-ზე: საჭირო იყო ${termAt(response.start, response.step, wanted)}.`,
      };
    }
    case 'sequence-fill': {
      const raw = (typeof input === 'string' ? input : '').split(',');
      const holes = [...response.holes].sort((a, b) => a - b);
      if (raw.length < holes.length || raw.slice(0, holes.length).some((v) => v.trim() === '')) return { verdict: 'incomplete', feedback: MSG.needHoleValues };
      const typed = raw.slice(0, holes.length).map((v) => Number(v.trim()));
      if (typed.some((n) => !Number.isFinite(n))) return { verdict: 'incomplete', feedback: MSG.needHoleValues };
      const numbers = sequenceOf(response.start, response.step, response.count);
      const wanted = holeValues(numbers, holes);
      if (typed.every((n, i) => n === wanted[i])) return { verdict: 'correct' };
      // a blank filled with its neighbour's number is the classic slip: the sequence would no longer move by the step
      const neighbour = holes.some((pos, i) => {
        const pair = [numbers[pos - 1], numbers[pos + 1]];
        return pair.includes(typed[i]) && typed[i] !== wanted[i];
      });
      const joined = typed.join(',');
      const hit = findMisconception(question.misconceptions, (a) => String(a) === joined);
      if (hit) return wrong(question, hit);
      if (neighbour) return wrong(question, { id: 'copied', answers: [], feedback: `გამოტოვებული ადგილი მეზობლის ტოლი არ არის: ${ruleText(response.step)}.` });
      return wrong(question, undefined);
    }
    case 'sequence-rule': {
      const text = typeof input === 'string' ? input.trim() : '';
      if (!text) return { verdict: 'incomplete', feedback: MSG.needRule };
      const chosen = Number(text);
      if (!Number.isFinite(chosen)) return { verdict: 'incomplete', feedback: MSG.needRule };
      const numbers = sequenceOf(response.start, response.step, response.count);
      if (chosen === response.step) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => Number(a) === chosen);
      if (hit) return wrong(question, hit);
      // the student may have read the rule of one pair only: say what the numbers really do
      const real = stepOf(numbers);
      return {
        verdict: 'incorrect',
        misconceptionId: 'rule',
        feedback: question.fallbackFeedback ?? `${MSG.wrongRule} ${real === null ? '' : ruleText(real) + '.'}`.trim(),
      };
    }
    case 'column-sum': {
      const [t = '', o = ''] = (typeof input === 'string' ? input : '').split(',');
      if (t.trim() === '' || o.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needColumnAnswer };
      const tensDigit = Number(t);
      const onesDigit = Number(o);
      if (!Number.isInteger(tensDigit) || !Number.isInteger(onesDigit)) return { verdict: 'incomplete', feedback: MSG.needColumnAnswer };
      const written = tensDigit * 10 + onesDigit;
      const answer = response.op === 'add' ? columnSum(response.a, response.b) : columnDifference(response.a, response.b);
      if (written === answer) return { verdict: 'correct' };
      // the digits are right but in the wrong columns — a different number, and a very common slip
      const flipped = onesDigit * 10 + tensDigit;
      if (flipped === answer) return wrong(question, findMisconception(question.misconceptions, (a) => a === 'flipped') ?? { id: 'transposed', answers: [], feedback: MSG.transposed });
      const hit = findMisconception(question.misconceptions, (a) => Number(a) === written);
      if (hit) return wrong(question, hit);
      // a correct ones digit with the tens off points at the carry (or its absence)
      if (response.op === 'add' && onesDigit === columnSum(response.a, response.b) % 10 && tensDigit !== sumTens(response.a, response.b)) {
        return wrong(question, {
          id: needsCarry(response.a, response.b) ? 'forgot-carry' : 'carried-anyway',
          answers: [],
          feedback: needsCarry(response.a, response.b) ? MSG.needCarry : MSG.noCarry,
        });
      }
      if (response.op === 'subtract' && onesDigit !== columnDifference(response.a, response.b) % 10) {
        return wrong(question, {
          id: needsBorrow(response.a, response.b) ? 'no-borrow' : 'borrowed-anyway',
          answers: [],
          feedback: needsBorrow(response.a, response.b)
            ? `ერთეულები: ${digits2(response.a).ones} − ${digits2(response.b).ones} უარყოფითია. 1 ათეული უნდა გაიხსნას 10 ერთეულად.`
            : MSG.noBorrow,
        });
      }
      return wrong(question, undefined);
    }
    case 'sum-steps': {
      const [o = '', t = ''] = (typeof input === 'string' ? input : '').split(',');
      if (o.trim() === '' || t.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needSumSteps };
      const onesDigit = Number(o);
      const tensDigit = Number(t);
      if (!Number.isInteger(onesDigit) || !Number.isInteger(tensDigit)) return { verdict: 'incomplete', feedback: MSG.needSumSteps };
      const rightOnes = columnSum(response.a, response.b) % 10;
      const rightTens = sumTens(response.a, response.b);
      if (onesDigit === rightOnes && tensDigit === rightTens) return { verdict: 'correct' };
      if (onesDigit === digits2(response.a).ones + digits2(response.b).ones) {
        // the whole ones total was written in the ones place instead of carrying the ten
        return wrong(question, { id: 'no-carry', answers: [], feedback: MSG.needCarry });
      }
      if (tensDigit === digits2(response.a).tens + digits2(response.b).tens && carriedTen(response.a, response.b) === 1) {
        return wrong(question, { id: 'forgot-carry', answers: [], feedback: MSG.needCarry });
      }
      if (tensDigit === digits2(response.a).tens + digits2(response.b).tens + 1 && carriedTen(response.a, response.b) === 0) {
        return wrong(question, { id: 'carried-anyway', answers: [], feedback: MSG.noCarry });
      }
      const hit = findMisconception(question.misconceptions, (a) => String(a) === `${onesDigit},${tensDigit}`);
      return wrong(question, hit);
    }
    case 'difference-steps': {
      const text = typeof input === 'string' ? input.trim() : '';
      if (!text) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needBorrowFirst };
      const n = Number(text);
      if (!Number.isFinite(n)) return { verdict: 'incomplete', feedback: MSG.needNumber };
      const answer = columnDifference(response.a, response.b);
      if (n === answer) return { verdict: 'correct' };
      // adding instead of subtracting: a + b, or the ones subtracted the other way round
      if (n === response.a + response.b) return wrong(question, { id: 'added', answers: [], feedback: 'ეს შეკრებაა. ამოცანა გამოკლებაა: უნდა აიღო რაოდენობა.' });
      if (needsBorrow(response.a, response.b) && n === digits2(response.a).tens * 10 + (digits2(response.b).ones - digits2(response.a).ones)) {
        return wrong(question, { id: 'subtracted-back', answers: [], feedback: `ერთეულებში უფრო დიდს პატარა არ აკლდება. გახსენი ათეული: ${digits2(response.a).ones} + 10 − ${digits2(response.b).ones}.` });
      }
      const hit = findMisconception(question.misconceptions, (a) => Number(a) === n);
      return wrong(question, hit, {
        feedback:
          hit?.feedback ??
          question.fallbackFeedback ??
          (needsBorrow(response.a, response.b)
            ? `ჯერ ათეული გახსენი: ${digits2(response.a).ones} + 10 − ${digits2(response.b).ones} = ${digits2(response.a).ones + 10 - digits2(response.b).ones}, შემდეგ ათეულები: ${digits2(response.a).tens - 1} − ${digits2(response.b).tens}.`
            : `ერთეულები: ${digits2(response.a).ones} − ${digits2(response.b).ones}; ათეულები: ${digits2(response.a).tens} − ${digits2(response.b).tens}.`),
      });
    }
    case 'story-problem': {
      const [op = '', answerText = ''] = (typeof input === 'string' ? input : '').split(',');
      if (!op || answerText.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needStoryOp };
      const wanted = response.kind === 'separate' ? 'subtract' : 'add';
      if (op !== wanted) {
        const hit = findMisconception(question.misconceptions, (a) => a === 'operation' || a === op);
        return wrong(question, hit ?? { id: 'operation', answers: [], feedback: MSG.wrongOperation });
      }
      const n = Number(answerText);
      if (!Number.isFinite(n)) return { verdict: 'incomplete', feedback: MSG.needStoryNumber };
      const answer = wanted === 'subtract' ? response.a - response.b : response.a + response.b;
      if (n === answer) return { verdict: 'correct' };
      // the operation was right but the numbers were combined the other way round
      if (n === (wanted === 'subtract' ? response.a + response.b : Math.abs(response.a - response.b))) {
        return wrong(question, { id: 'flipped-op', answers: [], feedback: `მოქმედება სწორია, მაგრამ რიცხვები გადაურიე. აქ სწორია ${response.a} ${wanted === 'subtract' ? '−' : '+'} ${response.b}.` });
      }
      const hit = findMisconception(question.misconceptions, (a) => Number(a) === n);
      return wrong(question, hit);
    }
    case 'make-equal': {
      const text = typeof input === 'string' ? input.trim() : '';
      const sizes = text === '' ? [] : text.split(',').map((n) => Number(n));
      if (sizes.length < response.groups || sizes.some((n) => !Number.isInteger(n) || n < 0)) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needEqual };
      if (sizes.every((n) => n === 0)) return { verdict: 'incomplete', feedback: MSG.needEqual };
      if (allEqual(sizes)) return { verdict: 'correct' };
      const odd = unevenGroups(sizes);
      return {
        verdict: 'incorrect',
        misconceptionId: 'uneven',
        // name the groups that differ, so the student can fix the one that is off rather than re-read the whole board
        feedback: `${question.fallbackFeedback ?? MSG.groupsUneven} ${odd.map((i) => `${i + 1}-ე ჯგუფში ${sizes[i]}`).join(', ')}.`,
      };
    }
    case 'array-read': {
      const [r = '', c = ''] = (typeof input === 'string' ? input : '').split(',');
      if (r.trim() === '' || c.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needArray };
      const rows = Number(r);
      const cols = Number(c);
      if (!Number.isInteger(rows) || !Number.isInteger(cols)) return { verdict: 'incomplete', feedback: MSG.needArray };
      if (rows === response.rows && cols === response.cols) return { verdict: 'correct' };
      // rows and columns swapped: the same total, so this is a reading slip, not a counting one
      if (rows === response.cols && cols === response.rows) {
        return wrong(question, findMisconception(question.misconceptions, (a) => a === 'swapped') ?? { id: 'swapped-axes', answers: [], feedback: 'რიგები და სვეტები ადგილებში შეიცვალა. სულ იგივეა, მაგრამ აქ რიგები ' + response.rows + '-ია, სვეტები — ' + response.cols + '.' });
      }
      const hit = findMisconception(question.misconceptions, (a) => a === `${rows},${cols}`);
      if (hit) return wrong(question, hit);
      if (rows * cols !== arrayTotal({ rows: response.rows, cols: response.cols })) {
        return wrong(question, { id: 'array-off', answers: [], feedback: `${MSG.arrayOff} ${rows} × ${cols} = ${rows * cols}, მაგრამ მართკუთხედში ${arrayTotal({ rows: response.rows, cols: response.cols })} საგანია.` });
      }
      return wrong(question, undefined);
    }
    case 'array-build': {
      const [r = '', c = ''] = (typeof input === 'string' ? input : '').split(',');
      if (r.trim() === '' || c.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needArray };
      const rows = Number(r);
      const cols = Number(c);
      if (!Number.isInteger(rows) || !Number.isInteger(cols) || rows < 1 || cols < 1) return { verdict: 'incomplete', feedback: MSG.needArray };
      if (rows * cols === response.total) return { verdict: 'correct' };
      // any true factor pair is right; a pair that does not make the total is not
      const useful = arraysFor(response.total).map((a) => `${a.rows},${a.cols}`);
      const hit = findMisconception(question.misconceptions, (a) => a === `${rows},${cols}`);
      if (hit) return wrong(question, hit);
      return wrong(question, {
        id: 'array-total',
        answers: [],
        feedback: `${rows} × ${cols} = ${rows * cols}, არა ${response.total}. ${response.total === 0 ? '' : `სცადე: ${useful[0]?.split(',').join(' × ')}.`}`,
      });
    }
    case 'times-fact': {
      const [a = '', b = ''] = (typeof input === 'string' ? input : '').split(',');
      if (a.trim() === '' || b.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needFactors };
      const one = Number(a);
      const two = Number(b);
      if (!Number.isInteger(one) || !Number.isInteger(two) || one < 0 || two < 0) return { verdict: 'incomplete', feedback: MSG.needFactors };
      // a true sentence is right however it is written: 3 × 4 and 4 × 3 are the same product
      if (productOf(one, two) === productOf(response.table, response.factor)) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => String(v) === `${one},${two}` || Number(v) === productOf(one, two));
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, {
        feedback: `${question.fallbackFeedback ? `${question.fallbackFeedback} ` : ''}${one} × ${two} = ${productOf(one, two)}, მაგრამ ${response.factor} ჯგუფი თითოეულში ${response.table} არის ${productOf(response.table, response.factor)}. ${repeatText(response.table, response.factor)}.`,
      });
    }
    case 'times-missing': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needFamily };
      const answer = response.missing === 'factor' ? response.factor : response.missing === 'product' ? productOf(response.table, response.factor) : response.factor;
      if (n === answer) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === n);
      if (hit) return wrong(question, hit);
      if (response.missing === 'product') {
        const detail = `${factText(response.table, response.factor)}: ${repeatText(response.table, response.factor)}.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      return wrong(question, undefined, {
        feedback: question.fallbackFeedback ?? `${productOf(response.table, response.factor)} საგანი ${response.table}-ად: ${productOf(response.table, response.factor)} ÷ ${response.table} = ${response.factor}.`,
      });
    }
    case 'table-build': {
      const written = (typeof input === 'string' && input !== '' ? input.split(',') : []).map((v) => v.trim());
      if (written.length === 0 || written[0] === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needTable };
      const right = Array.from({ length: response.upTo }, (_, i) => productOf(response.table, i + 1));
      // the row is filled from the start, so only the first n cells can be judged
      const done = written.filter((v) => v !== '');
      const wrongAt = done.findIndex((v, i) => Number(v) !== right[i]);
      if (wrongAt !== -1) {
        const hit = findMisconception(question.misconceptions, (v) => Number(v) === Number(done[wrongAt]));
        if (hit) return wrong(question, hit);
        const detail = `${wrongAt + 1} × ${response.table} = ${right[wrongAt]}, არა ${done[wrongAt]}. ${wrongAt === 0 ? `ცხრილი იწყება ${response.table}-ით.` : `წინა ნამრავლს ${response.table} ემატება.`}`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      if (done.length < response.upTo) return { verdict: 'incomplete', feedback: `${MSG.needTable} შევსებულია ${done.length} / ${response.upTo}.` };
      return { verdict: 'correct' };
    }
    case 'table-grid': {
      if (response.ask === 'read-product') {
        const n = parseNumber(typeof input === 'string' ? input : '');
        if (n === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needFactors };
        const target = typeof response.target === 'object' ? productOf(response.target.table, response.target.factor) : response.target;
        if (n === target) return { verdict: 'correct' };
        const hit = findMisconception(question.misconceptions, (v) => Number(v) === n);
        if (hit) return wrong(question, hit);
        const cell = typeof response.target === 'object' ? response.target : { table: response.tables[0], factor: response.factors[0] };
        const detail = `უჯრა იკითხება: ${cell.table} × ${cell.factor} = ${target}.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      const target = typeof response.target === 'object' ? productOf(response.target.table, response.target.factor) : response.target;
      const wanted = cellsFor(target, response.tables, response.factors);
      // each cell key is written as `"table,factor"`, so the list is read in pairs
      const parts = (typeof input === 'string' && input ? input.split(',') : []).map((v) => v.trim()).filter((v) => v !== '');
      const keys: string[] = [];
      for (let i = 0; i + 1 < parts.length; i += 2) keys.push(`${parts[i]},${parts[i + 1]}`);
      const picked = keys;
      if (picked.length === 0) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needFactors };
      const extra = picked.filter((k) => !wanted.includes(k));
      if (extra.length === 0 && picked.length === wanted.length) return { verdict: 'correct' };
      if (extra.length > 0) {
        const [table, factor] = extra[0].split(',').map(Number);
        const detail = `${table} × ${factor} = ${productOf(table, factor)}, არა ${target}. მოძებნე უჯრები, სადაც ნამრავლი ${target}-ია.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      return { verdict: 'incomplete', feedback: `${MSG.needPick} სულ საჭიროა ${wanted.length}, მონიშნულია ${picked.length}.` };
    }
    case 'share-fair': {
      const [shareText_, leftText = '0'] = (typeof input === 'string' ? input : '').split(',');
      if (shareText_ === undefined || shareText_.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needShare };
      const each = parseNumber(shareText_);
      const left = parseNumber(leftText === '' ? '0' : leftText);
      if (each === null || left === null) return { verdict: 'incomplete', feedback: MSG.needShare };
      const expected = fairShare(response.total, response.people);
      if (each === expected.share && left === expected.leftover) return { verdict: 'correct' };
      if (left !== expected.leftover) {
        // what the written share really deals out, so the leftover is named rather than only judged
        const used = response.people * each;
        const detail = `${response.people} × ${each} = ${used}. ${used === response.total ? 'ყველა საგანი დარიგდა, ნაშთი 0-ია.' : used < response.total ? `კიდევ ${response.total - used} საგანი რჩება.` : `${used - response.total} ზედმეტია.`}`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === each);
      if (hit) return wrong(question, hit);
      // the leftover was right, so the share itself is the slip: name the real share
      const detail = `${response.people} × ${each} = ${response.people * each}, არა ${response.total}. თანაბარი წილი ${expected.share}-ია.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'share-groups': {
      const counts = (typeof input === 'string' && input ? input.split(',') : []).map((v) => Number(v));
      if (counts.length < response.groups || counts.some((n) => !Number.isInteger(n) || n < 0)) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needGroups };
      if (counts.every((n) => n === 0)) return { verdict: 'incomplete', feedback: MSG.needGroups };
      if (isFairShare(counts, response.total)) return { verdict: 'correct' };
      if (!allSame(counts)) {
        const odd = counts.flatMap((n, i) => (n === counts[0] ? [] : [i]));
        return wrong(question, undefined, { feedback: `${question.fallbackFeedback ?? MSG.shareUneven} ${odd.map((i) => `${i + 1}-ე ჯგუფში ${counts[i]}`).join(', ')}.` });
      }
      // equal but not all used, or too many used
      const used = totalOfCounts(counts);
      const detail = used < response.total ? MSG.shareOff + ` კიდევ ${response.total - used} საგანი რჩება.` : `${used - response.total} ზედმეტია: სულ ${response.total} საგანია.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'group-into': {
      const [gText = '', lText = '0'] = (typeof input === 'string' ? input : '').split(',');
      if (gText.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needGroups };
      const groups = parseNumber(gText);
      const left = parseNumber(lText === '' ? '0' : lText);
      if (groups === null || left === null) return { verdict: 'incomplete', feedback: MSG.needGroups };
      const expected = groupInto(response.total, response.size);
      if (groups === expected.groups && left === expected.leftover) return { verdict: 'correct' };
      if (groups * response.size + left !== response.total) {
        const expectedGrouping = groupInto(response.total, response.size);
        const detail = `${response.size} × ${groups} + ${left} = ${response.size * groups + left}, არა ${response.total}. ${expectedGrouping.groups} სრული ჯგუფი და ${expectedGrouping.leftover} ნაშთი გამოდის.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === groups);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: question.fallbackFeedback ?? MSG.groupsOff });
    }
    case 'division-sentence': {
      const [tText = '', bText = ''] = (typeof input === 'string' ? input : '').split(',');
      if (tText.trim() === '' || bText.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needDivision };
      const total = parseNumber(tText);
      const by = parseNumber(bText);
      if (total === null || by === null) return { verdict: 'incomplete', feedback: MSG.needDivision };
      if (total === response.total && by === response.by) return { verdict: 'correct' };
      if (by !== response.by) {
        const hit = findMisconception(question.misconceptions, (v) => Number(v) === by || String(v) === `${total},${by}`);
        if (hit) return wrong(question, hit);
        return wrong(question, undefined, { feedback: question.fallbackFeedback ?? `${response.family === 'group' ? 'ვაჯგუფებთ' : 'ვანაწილებთ'}: გამყოფი ${response.by}-ია. ${response.total} ÷ ${response.by} = ${quotientOf(response.total, response.by) ?? '?'}.` });
      }
      return wrong(question, undefined, { feedback: question.fallbackFeedback ?? `სულ ${response.total} საგანია: ${response.total} ÷ ${response.by} = ${quotientOf(response.total, response.by) ?? '?'}.` });
    }
    case 'fact-family': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needFamily };
      const answer = response.missing === 'a' ? response.a : response.missing === 'b' ? response.b : productOf(response.a, response.b);
      if (n === answer) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === n);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, {
        feedback: question.fallbackFeedback ?? `${response.a} × ${response.b} = ${productOf(response.a, response.b)}, ${productOf(response.a, response.b)} ÷ ${response.a} = ${response.b}, ${productOf(response.a, response.b)} ÷ ${response.b} = ${response.a}.`,
      });
    }
    case 'parts-judge': {
      const value = typeof input === 'string' ? input : '';
      if (value !== '0' && value !== '1') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needParts };
      const equal = hasEqualPieces(response.shape);
      if ((value === '1') === equal) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => String(v) === value);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: question.fallbackFeedback ?? (equal ? 'ნაწილები ტოლია: ერთი და იმავე ზომისაა.' : MSG.partsUnequal) });
    }
    case 'fraction-pick': {
      const picked = typeof input === 'string' && input ? input.split(',').map(Number).filter((n) => Number.isInteger(n)) : [];
      if (picked.length === 0) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needPick };
      const pieces = piecesOf(response.shape);
      const pickedValid = picked.filter((n) => pieces.includes(n));
      if (pickedValid.length === response.need && picked.length === response.need) return { verdict: 'correct' };
      if (picked.length !== response.need) {
        const hit = findMisconception(question.misconceptions, (v) => v === 'count');
        return wrong(question, hit, { feedback: hit?.feedback ?? `${MSG.needPick} საჭიროა ${response.need}, მონიშნულია ${picked.length}.` });
      }
      const hit = findMisconception(question.misconceptions, (v) => v === 'which');
      return wrong(question, hit, { feedback: hit?.feedback ?? MSG.needPick });
    }
    case 'fraction-name': {
      const [nText = '', dText = ''] = (typeof input === 'string' ? input : '').split(',');
      if (nText.trim() === '' || dText.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needFraction };
      const num = parseNumber(nText);
      const den = parseNumber(dText);
      if (num === null || den === null) return { verdict: 'incomplete', feedback: MSG.needFraction };
      const actual = fractionOf(response.shape, response.take);
      if (actual === null) return wrong(question, undefined, { feedback: MSG.partsUnequal });
      if (num === actual.numerator && den === actual.denominator) return { verdict: 'correct' };
      // the pair written the other way round is a real slip, and worth naming
      if (num === actual.denominator && den === actual.numerator) {
        const hit = findMisconception(question.misconceptions, (v) => v === 'swapped');
        return wrong(question, hit, { feedback: hit?.feedback ?? 'მრიცხველი და მნიშვნელი ადგილებში შეიცვალა: ზემოთ აღებული ნაწილებია, ქვემოთ — სულ.' });
      }
      const hit = findMisconception(question.misconceptions, (v) => String(v) === `${num},${den}`);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: question.fallbackFeedback ?? `${MSG.fractionOff} ეს ფიგურა: ${fractionText(actual)} — მთელი დაყოფილია ${actual.denominator} ტოლ ნაწილად, აღებულია ${actual.numerator}.` });
    }
    case 'date-step': {
      const parts = (typeof input === 'string' ? input : '').split(',');
      const [yText = '', mText = '', dText = ''] = parts;
      if (yText.trim() === '' || mText.trim() === '' || dText.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needDate };
      const y = parseNumber(yText);
      const m = parseNumber(mText);
      const d = parseNumber(dText);
      if (y === null || m === null || d === null) return { verdict: 'incomplete', feedback: MSG.needDate };
      if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(d) || d < 1 || d > monthLength(m, y)) {
        return wrong(question, undefined, { feedback: MSG.dateOff });
      }
      const typed = { year: y, month: m, day: d };
      const expected = addDays(response.from, response.count);
      if (typed.year === expected.year && typed.month === expected.month && typed.day === expected.day) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => String(v) === `${y},${m},${d}`);
      if (hit) return wrong(question, hit);
      const detail = `${dateFullText(response.from)}-დან ${response.count >= 0 ? `+${response.count}` : `−${Math.abs(response.count)}`} დღე არის ${dateFullText(expected)} (${weekdayName(weekdayOf(expected))}).`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'weekday-of': {
      const value = typeof input === 'string' ? input : '';
      if (!value.trim()) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needWeekday };
      const chosen = Number(value);
      if (!Number.isInteger(chosen) || chosen < 0 || chosen > 6) return { verdict: 'incomplete', feedback: MSG.needWeekday };
      const actual = weekdayOf(response.date);
      if (chosen === actual) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === chosen);
      if (hit) return wrong(question, hit);
      const detail = `${dateFullText(response.date)} — ${weekdayName(actual)}.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'days-between': {
      const value = parseNumber(typeof input === 'string' ? input : '');
      if (value === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needDays };
      const actual = daysBetween(response.from, response.to);
      if (value === actual) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === value);
      if (hit) return wrong(question, hit);
      const detail = `${dateText(response.from)}-დან ${dateText(response.to)}-მდე ${weeksTextOf(actual)}.`;
      const off = Math.abs(actual - value) === 1 ? ' დღე ერთით ჩამოგრჩა ან გადაგაცილდა.' : '';
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}${off}` : `${detail}${off}` });
    }
    case 'elapsed': {
      const [hText = '', mText = ''] = (typeof input === 'string' ? input : '').split(',');
      if (hText.trim() === '' || mText.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needElapsed };
      const h = parseNumber(hText);
      const m = parseNumber(mText);
      if (h === null || m === null) return { verdict: 'incomplete', feedback: MSG.needElapsed };
      const actual = minutesBetween(response.from, response.to);
      const said = h * 60 + m;
      if (said === actual) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => String(v) === `${h},${m}`);
      if (hit) return wrong(question, hit);
      const detail = `საათებით და წუთებით: ${Math.floor(actual / 60)} სთ ${actual % 60} წთ (სულ ${actual} წუთი).`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'money-total': {
      const value = parseNumber(typeof input === 'string' ? input : '');
      if (value === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needMoney };
      const actual = moneyTotal(response.pieces);
      if (value === actual) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === value);
      if (hit) return wrong(question, hit);
      const detail = `${response.pieces.join(' + ')} = ${moneyText(actual)}.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'money-compare': {
      const [enoughText = '', changeText_ = ''] = (typeof input === 'string' ? input : '').split(',');
      if (enoughText.trim() === '' || changeText_.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needMoneyPair };
      const enough = enoughText.trim() === '1' || enoughText.trim() === 'true' ? true : enoughText.trim() === '0' || enoughText.trim() === 'false' ? false : null;
      const change = parseNumber(changeText_);
      if (enough === null || change === null) return { verdict: 'incomplete', feedback: MSG.needMoneyPair };
      const expectedEnough = response.money >= response.cost;
      const expectedChange = expectedEnough ? changeFrom(response.money, response.cost) : 0;
      if (enough === expectedEnough && change === expectedChange) return { verdict: 'correct' };
      if (enough !== expectedEnough) {
        const detail = expectedEnough
          ? `${moneyText(response.money)} ≥ ${moneyText(response.cost)} — ფული საკმარისია, ხურდა ${moneyText(expectedChange)}.`
          : `${moneyText(response.money)} < ${moneyText(response.cost)} — ${moneyText(response.cost - response.money)} აკლია, ხურდა არ რჩება.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      const detail = `${response.money} − ${response.cost} = ${expectedChange} თეთრი.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'money-build': {
      const picked = typeof input === 'string' && input ? input.split(',').filter(Boolean).map(Number) : [];
      const valid = picked.filter((n) => response.tray.includes(n));
      const sum = moneyTotal(valid);
      if (valid.length === 0) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needMoneyBuild };
      if (sum === response.target && (!response.fewest || valid.length === fewestPieces(response.target).length)) return { verdict: 'correct' };
      if (sum !== response.target) {
        const hit = findMisconception(question.misconceptions, (v) => Number(v) === sum);
        if (hit) return wrong(question, hit);
        const detail = sum < response.target ? `კიდევ ${moneyText(response.target - sum)} გჭირდება.` : `${moneyText(sum - response.target)} ზედმეტია.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      const fewest = fewestPieces(response.target);
      const detail = `ესეც ${moneyText(response.target)}-ს იძლევა, მაგრამ ყველაზე ცოტა ნაჭრით შეიძლება ასე: ${fewest.map(pieceText).join(' + ') || '0'}.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'reflect': {
      const expected = reflectCells(response.picture.cells, response.line);
      const typed = parseCells(typeof input === 'string' ? input : '');
      if (typed.length === 0) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needCells };
      if (sameCells(typed, expected)) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => String(v) === typed.map(symCellKey).join(';'));
      if (hit) return wrong(question, hit);
      const detail = `სარკის ხაზი ${lineName(response.line)}ა: თითოეული უჯრა გადის ხაზის მეორე მხარეს იმავე მანძილზე.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'symmetry-fill': {
      const typed = parseCells(typeof input === 'string' ? input : '');
      if (typed.length === 0) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needCells };
      const completed = tidy([...response.picture.cells, ...typed]);
      if (isSymmetricAbout(completed, response.line) && sameCells(completed, [...response.picture.cells, ...missingForSymmetry(response.picture.cells, response.line)])) {
        return { verdict: 'correct' };
      }
      if (!isSymmetricAbout(completed, response.line)) {
        const missing = missingForSymmetry(completed, response.line).length;
        const detail = `ჯერ არ არის სარკული: ${missing} უჯრას ჯერ არ აქვს წყვილი მეორე მხარეს.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      const extra = typed.filter((c) => !response.picture.cells.some((g) => g.x === c.x && g.y === c.y) && !missingForSymmetry(response.picture.cells, response.line).some((g) => g.x === c.x && g.y === c.y));
      const detail = extra.length > 0 ? `ფიგურა სარკულია, მაგრამ ${extra.length} უჯრა ზედმეტია — დაკვირვე, რომელ ნახევარს ასახავ.` : 'ეს უჯრები უკვე შევსებულია.';
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'symmetry-line': {
      const chosen = typeof input === 'string' && input ? input.split(',').filter(Boolean) : [];
      const key = (l: { axis: string; at: number }) => `${l.axis}:${l.at}`;
      const right = response.candidates.filter((line) => isSymmetricAbout(response.picture.cells, line)).map(key);
      if (chosen.length === 0) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needCells };
      if (response.ask === 'count') {
        const n = parseNumber(chosen[0]);
        if (n === null) return { verdict: 'incomplete', feedback: MSG.needCells };
        if (n === right.length) return { verdict: 'correct' };
        const detail = right.length === 0 ? 'ამ ფიგურას სარკის ხაზი არ აქვს.' : `სარკის ხაზი ${right.length} აქვს: ${response.candidates.filter((l) => right.includes(key(l))).map(lineName).join(', ')}.`;
        return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
      }
      if (right.length === chosen.length && right.every((k) => chosen.includes(k))) return { verdict: 'correct' };
      const detail = right.length === 0 ? 'არც ერთი შემოთავაზებული ხაზი არ არის სარკის ხაზი — თითოეულ უჯრას წყვილი არ აქვს.' : `სწორია ${right.length} ხაზი.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    case 'flip-pick': {
      const value = typeof input === 'string' ? input : '';
      if (!value.trim()) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needChoice };
      const actual = response.options.find((o) => isReflectionOf(response.source, o.cells, response.line));
      if (actual && actual.id === value) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => v === value);
      if (hit) return wrong(question, hit);
      const chosenOption = response.options.find((o) => o.id === value);
      const detail = chosenOption && sameCells(chosenOption.cells, response.source)
        ? 'ეს იგივე ფიგურაა, მხოლოდ გადაადგილებული — გადატანა არ ცვლის ორიენტაციას, არეკვლა კი ცვლის.'
        : 'აირჩიე ის ფიგურა, რომლის თითოეული უჯრაც წყაროს უჯრის არეკვლაა.';
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }
    // ─────────────────────────── U11: missing numbers & puzzles ───────────────────────────
    case 'sentence-fill': {
      const typed = (Array.isArray(input) ? input : [input]).map((v) => parseNumber(typeof v === 'string' ? v : ''));
      if (typed.length < response.blanks.length || typed.slice(0, response.blanks.length).some((n) => n === null)) {
        return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needNumber };
      }
      const values = solve(response.sentence).values;
      const want = response.blanks.map((place) => values[termSym(response.sentence[place])]);
      if (want.every((n, i) => typed[i] === n)) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => String(a) === typed.join(','));
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'ჩასვი შენი რიცხვი წინადადებაში და შეამოწმე ტოლობა.') });
    }
    case 'sentence-check': {
      const value = typeof input === 'string' ? input : '';
      if (!value) return { verdict: 'incomplete', feedback: MSG.needChoice };
      if (value === response.answer) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => a === value);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'შეადარე მოქმედებები და რიცხვები.') });
    }
    case 'symbol-solve': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needNumber };
      const { values } = solvePuzzle(response.sentences);
      if (n === values[response.symbol]) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === n);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'ერთი და იგივე სიმბოლო ყველგან ერთი რიცხვია.') });
    }
    case 'chain-solve': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needNumber };
      const all = runSteps(response.start, response.steps);
      if (typeof response.ask === 'number' && (response.ask < 1 || response.ask > all.length)) {
        throw new RangeError(`this question asks about step ${String(response.ask)}, but the chain has ${all.length} steps`);
      }
      const want = response.ask === 'end' ? all[all.length - 1] : all[response.ask - 1];
      if (n === want) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === n);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'შეამოწმე მოქმედებები თანმიმდევრობით.') });
    }
    case 'chain-fill': {
      const typed = (Array.isArray(input) ? input : [input]).map((v) => parseNumber(typeof v === 'string' ? v : ''));
      if (typed.length < response.asks.length || typed.slice(0, response.asks.length).some((n) => n === null)) {
        return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needNumber };
      }
      const all = runSteps(response.start, response.steps);
      const want = response.asks.map((at) => all[at - 1]);
      if (want.every((n, i) => typed[i] === n)) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => String(a) === typed.join(','));
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'შეამოწმე მოქმედებები თანმიმდევრობით.') });
    }
    case 'family-pick': {
      const value = typeof input === 'string' ? input : '';
      if (!value) return { verdict: 'incomplete', feedback: MSG.needChoice };
      if (value === response.answer) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => a === value);
      if (hit) return wrong(question, hit);
      const c = response.a + response.b;
      const detail = `${response.a} + ${response.b} = ${c}, ${c} − ${response.a} = ${response.b}, ${c} − ${response.b} = ${response.a}.`;
      return wrong(question, undefined, { feedback: question.fallbackFeedback ? `${question.fallbackFeedback} ${detail}` : detail });
    }

    // ─────────────────────────── U12: patterns, grids & logic ───────────────────────────
    case 'pattern-next': {
      const value = typeof input === 'string' ? input : '';
      if (!value) return { verdict: 'incomplete', feedback: MSG.needChoice };
      const want = response.options.findIndex((item) => sameGridItem(item, patternItemAt(response.pattern, response.shown)));
      if (Number(value) === want) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => String(a) === value);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'დააკვირდი, როგორ მეორდება ან იცვლება წესი.') });
    }
    case 'pattern-fix': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needNumber };
      const at = mistakeAt(response.pattern, response.items);
      if (at === -1) throw new RangeError('a "find the mistake" question needs a mistake in its row');
      if (n === at + 1) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === n);
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'შეადარე თითოეული ადგილი წესს.') });
    }
    case 'pattern-fill': {
      const typed = (typeof input === 'string' ? input : '').split(',').filter((v) => v !== '');
      if (typed.length < response.holes.length) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needChoice };
      const want = response.holes.map((h) => patternItemAt(response.pattern, h));
      if (typed.length === want.length && typed.every((v, i) => sameGridItem(response.options[Number(v)], want[i]))) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => String(a) === typed.join(','));
      if (hit) return wrong(question, hit);
      return wrong(question, undefined, { feedback: withDetail(question, 'გამოიყენე წესი თითოეულ ცარიელ ადგილზე.') });
    }
    case 'grid-route': {
      const picked = (typeof input === 'string' ? input : '').split(',').filter(Boolean);
      if (picked.length === 0) return { verdict: 'incomplete', feedback: MSG.needCells };
      const { cells, ok } = gridWalk(response.start, response.moves, response.rows, response.cols);
      if (!ok) throw new RangeError('route walks outside the grid');
      const keys = cells.map(gridCellKey);
      const got = pairsOf(picked);
      if (got.length === keys.length && keys.every((k, i) => got[i] === k)) return { verdict: 'correct' };
      const missing = keys.find((k) => !got.includes(k));
      const detail = missing
        ? `გზა გადის ${keys.length} უჯრაზე; ვერ მოინიშნა ${missing}.`
        : 'ნაბიჯები ზედიზედ უნდა მიჰყვებოდეს ერთმანეთს — ყოველი შემდეგი უჯრა წინაზე ერთი ნაბიჯით შორსაა.';
      return wrong(question, undefined, { feedback: withDetail(question, detail) });
    }
    case 'grid-end': {
      const value = (typeof input === 'string' ? input : '').replace(/\s/g, '');
      if (!value) return { verdict: 'incomplete', feedback: MSG.needCells };
      const reachable = gridWalk(response.start, response.moves, response.rows, response.cols);
      // an instruction that leaves the grid is a broken question, not a wrong answer
      if (!reachable.ok) throw new RangeError(`these instructions walk off a ${response.rows}×${response.cols} grid`);
      const want = gridCellKey(reachable.cells[reachable.cells.length - 1]);
      if (value === want) return { verdict: 'correct' };
      return wrong(question, undefined, { feedback: withDetail(question, 'მიჰყევი მითითებებს სათითაოდ.') });
    }
    case 'grid-fill': {
      const typed = (typeof input === 'string' ? input : '').split(';').filter(Boolean);
      if (typed.length === 0) return { verdict: 'incomplete', feedback: MSG.needCells };
      let grid = response.grid;
      const validHoles = new Set(gridHoles(response.grid).map(gridCellKey));
      const seen = new Set<string>();
      try {
        for (const chunk of typed) {
          const [key, index] = chunk.split('=');
          const [row, col] = key.split(',').map(Number);
          if (!validHoles.has(key) || seen.has(key)) return { verdict: 'incomplete', feedback: MSG.needCells };
          seen.add(key);
          const item = response.options[Number(index)];
          if (!item) return { verdict: 'incomplete', feedback: MSG.needChoice };
          grid = gridPut(grid, { row, col }, item);
        }
      } catch {
        return { verdict: 'incomplete', feedback: MSG.needCells };
      }
      if (seen.size !== validHoles.size) return { verdict: 'incomplete', feedback: MSG.needCells };
      const check = latinHolds(grid, response.items);
      if (check.ok) return { verdict: 'correct' };
      const where = check.row !== null ? `${check.row}-ე რიგში` : `${check.col}-ე სვეტში`;
      const detail = `${where} ყოველი ფიგურა ზუსტად ერთხელ უნდა იყოს.`;
      return wrong(question, undefined, { feedback: withDetail(question, detail) });
    }
    case 'clue-select': {
      const picked = (typeof input === 'string' ? input : '').split(',').filter(Boolean);
      if (picked.length === 0) return { verdict: 'incomplete', feedback: MSG.needClue };
      const right = survivingCandidates(response.candidates, response.clues).map((c) => c.id);
      if (picked.length === right.length && right.every((id) => picked.includes(id))) return { verdict: 'correct' };
      const extra = picked.find((id) => !right.includes(id));
      const gone = right.find((id) => !picked.includes(id));
      const hit = findMisconception(question.misconceptions, (a) => a === extra || a === gone || a === 'extra' || a === 'missing');
      if (hit) return wrong(question, hit);
      let detail = '';
      if (extra) {
        const extraCandidate = response.candidates.find((c) => c.id === extra);
        const failed = extraCandidate ? firstFailed(extraCandidate, response.clues) : null;
        const name = response.candidates.find((c) => c.id === extra)?.label ?? extra;
        detail = failed ? `${name} პირობას არ აკმაყოფილებს: ${gridClueText(failed, failed.attr, failed.value)}.` : `${name} ყველა პირობას არ აკმაყოფილებს.`;
      } else if (gone) {
        const name = response.candidates.find((c) => c.id === gone)?.label ?? gone;
        detail = `${name} ყველა პირობას აკმაყოფილებს — ისიც უნდა აირჩიო.`;
      }
      return wrong(question, undefined, { feedback: withDetail(question, detail) });
    }
    case 'clue-pick2': {
      const n = parseNumber(typeof input === 'string' ? input : '');
      if (n === null) return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needChoice };
      const candidate = response.candidates.find((c) => c.id === response.candidate);
      if (!candidate) throw new RangeError(`clue-pick2 asks about a candidate that is not in the list: ${response.candidate}`);
      const which = response.clues.findIndex((clue) => (candidate.traits[clue.attr] === clue.value) === Boolean(clue.negate));
      if (which === -1) throw new RangeError(`every clue is satisfied by ${response.candidate}, so no clue rules it out`);
      if (n === which) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (v) => Number(v) === n);
      if (hit) return wrong(question, hit);
      const clue = response.clues[which];
      const detail = `${candidate.label}: ${gridClueText(clue, clue.attr, clue.value)} — ეს პირობა არ სრულდება.`;
      return wrong(question, undefined, { feedback: withDetail(question, detail) });
    }
    case 'group-story': {
      const [g = '', e = '', t = ''] = (typeof input === 'string' ? input : '').split(',');
      if (g.trim() === '' || e.trim() === '' || t.trim() === '') return { verdict: 'incomplete', feedback: question.incompleteFeedback ?? MSG.needStoryGroups };
      const groups = Number(g);
      const each = Number(e);
      const total = Number(t);
      if (![groups, each, total].every((n) => Number.isInteger(n) && n >= 0)) return { verdict: 'incomplete', feedback: MSG.needStoryGroups };
      if (groups * each !== total) {
        // the multiplication must be a true sentence before the total can be judged
        return wrong(question, {
          id: 'product-off',
          answers: [],
          feedback: `${groups} × ${each} = ${groups * each}, არა ${total}. ${groupsText(response.groups, response.each)} — ეს არის ${multiplyText(response.groups, response.each)}.`,
        });
      }
      if (total === totalOf(response.groups, response.each)) return { verdict: 'correct' };
      const hit = findMisconception(question.misconceptions, (a) => Number(a) === total);
      return wrong(question, hit, {
        feedback:
          hit?.feedback ??
          question.fallbackFeedback ??
          `${groupsText(response.groups, response.each)} — სულ ${totalOf(response.groups, response.each)}: ${repeatedText(response.groups, response.each)}.`,
      });
    }
  }
}

/** `3 + 2`, for describing a sentence. */
const termWords = (t: TermSpec): string => (t.op === undefined || t.b === undefined ? String(t.a) : `${t.a} ${t.op} ${t.b}`);

/** The right order of an `order` response's tiles. */
export function correctOrder(response: Extract<ResponseSpec, { type: 'order' }>): number[] {
  const sorted = [...response.items].sort((a, b) => a - b);
  return response.direction === 'asc' ? sorted : sorted.reverse();
}

/** The correct answer as readable text, for the "show answer" state. */
export function describeAnswer(response: ResponseSpec): string {
  switch (response.type) {
    case 'choice':
      return response.options.find((o) => o.id === response.answer)?.text ?? response.answer;
    case 'numeric':
      return response.unit ? `${response.answer} ${response.unit}` : String(response.answer);
    case 'expression':
      return response.answer;
    case 'blanks':
      return response.answers.join(', ');
    case 'line':
    case 'collect':
      return String(response.answer);
    case 'order':
      return correctOrder(response).join(', ');
    case 'split':
      return `${response.answer} და ${response.total - response.answer}`;
    case 'distribute':
      return `ნებისმიერი ორი ნაწილი, რომლებიც ერთად ${response.total} არის`;
    case 'fill':
      return String(response.size - response.given);
    case 'jumps':
      return `დაიწყე ${response.from}-დან და გააკეთე ${response.count} ნახტომი`;
    case 'takeaway':
      return `გამოიტანე ${response.remove} საგანი`;
    case 'make-ten':
      return `გადაიტანე ${10 - response.a} კუბიკი`;
    case 'story':
      return `${response.operation === 'add' ? '+' : '−'}, პასუხი ${response.answer}`;
    case 'classify':
      return 'ყველა ნახატი თავის ჯგუფში';
    case 'judge':
      return response.rule === 'equal' ? 'ტოლი ნაწილები' : 'დიახ';
    case 'select-parts':
      return `${response.need} ნაწილი`;
    case 'reassemble':
      return 'ყველა ნაწილი თავის ადგილზე';
    case 'cut':
      return `${response.parts} ტოლი ნაწილი`;
    case 'align-compare': {
      const order = orderOf(response.a.cm, response.b.cm);
      const which = order === 'first-longer' ? 'პირველი' : order === 'second-longer' ? 'მეორე' : 'ორივე';
      if (order === 'same') return 'ორივე იგივე სიგრძისაა';
      return (response.ask ?? 'longer') === 'longer' ? `${which} უფრო გრძელია` : `${which} უფრო მოკლეა`;
    }
    case 'length-sort':
      return 'თითოეული საგანი თავის ჯგუფში';
    case 'measure-units':
      return `${unitsIn(response.object.cm, response.unitCm)} ${response.unitName}`;
    case 'ruler-read':
      return `ნული დასაწყისთან, ${response.answerCm} სმ`;
    case 'unit-pick':
      return response.items.map((item) => `${item.label}: ${suitableUnit(item.cm) === 'cm' ? 'სმ' : 'მ'}`).join(', ');
    case 'hand-pick':
      return `საათის ისარი — ${response.hourHand === 'short' ? 'მოკლე' : 'გრძელი'}, წუთის ისარი — ${response.minuteHand === 'short' ? 'მოკლე' : 'გრძელი'}`;
    case 'set-clock':
      return timeText(response.ask);
    case 'read-clock':
      return timeText(response.time);
    case 'match-time':
      return response.faces.map((time) => timeText(time)).join(', ');
    case 'shape-sort':
      return 'ყველა ფიგურა თავის ჯგუფში';
    case 'tap-parts': {
      const count = response.tap === 'sides' ? sidesOf(response.shape) : verticesOf(response.shape);
      if (count === 0) return `${FLAT_NAME.circle}: ${response.tap === 'sides' ? 'სწორი გვერდი არ აქვს' : 'კუთხე არ აქვს'} (0)`;
      return `${count} ${response.tap === 'sides' ? 'გვერდი' : 'კუთხე'}`;
    }
    case 'find-shapes':
      return `${FLAT_NAME[response.kind]}: ${response.items.filter((item) => shapeGroup(item.spec) === response.kind).map((item) => item.label).join(', ')}`;
    case 'balance-pans':
      return `თანაბარი: ${response.left.join(' + ') || 0} = ${response.right.join(' + ') || 0}`;
    case 'equal-groups':
      return `${response.a} = ${response.b} (თანაბარი ჯგუფები)`;
    case 'sentence-build':
      return response.answers.join(' ');
    case 'sentence-pick':
      return response.sentences
        .filter((s) => sentenceHolds({ left: s.left, right: s.right }))
        .map((s) => `${termWords(s.left)} = ${s.right}`)
        .join(', ');
    case 'balance-puzzle':
      return `${response.unknown} = ${response.answer}`;
    case 'sort-groups':
      return (response.objects as SortObj[]).map((o) => `${o.label ?? o.id}: ${o[response.attr]}`).join(', ');
    case 'sort-grid':
      return (response.objects as SortObj[]).map((o) => `${o.label ?? o.id}: ${o[response.rowAttr]}|${o[response.colAttr]}`).join(', ');
    case 'venn-sort':
      return (response.objects as SortObj[])
        .map((o) => `${o.label ?? o.id}: ${VENN_REGION_NAME[vennRegion(o, response.leftAttr, response.leftValue, response.rightAttr, response.rightValue)]}`)
        .join(', ');
    case 'chart-read': {
      if (response.ask === 'most') {
        const max = Math.max(...response.chart.rows.map((r) => r.count));
        return response.chart.rows.filter((r) => r.count === max).map((r) => r.label).join(', ');
      }
      if (response.ask === 'least') {
        const min = Math.min(...response.chart.rows.map((r) => r.count));
        return response.chart.rows.filter((r) => r.count === min).map((r) => r.label).join(', ');
      }
      return response.chart.rows.map((r) => `${r.label}: ${r.count}`).join(', ');
    }
    case 'chart-build':
      return response.labels.map((l, i) => `${l}: ${response.target[i]}`).join(', ');
    case 'clue-pick':
      return (response.objects as SortObj[]).filter((o) => response.clues.every((c) => (o[c.attr] === c.value) !== Boolean(c.negate))).map((o) => o.label ?? o.id).join(', ');
    case 'place-build':
      return `${digitsOf(response.target).hundreds} ასეული, ${digitsOf(response.target).tens} ათეული, ${digitsOf(response.target).ones} ერთეული = ${response.target}`;
    case 'expanded-build':
      return partsOf(response.value).map((p) => p.value).join(' + ');
    case 'digit-tap':
      return `${PLACE_NAME[response.target]}: ციფრი ${digitsOf(response.value)[response.target]} (ღირს ${valueAt(response.value, response.target)})`;
    case 'place-missing':
      return `${PLACE_NAME[response.missing]}: ${valueAt(response.value, response.missing)}`;
    case 'skip-line':
      return `${landings(response.start, response.step, termAt(response.start, response.step, response.count - 1)).join(' → ')}`;
    case 'sequence-fill': {
      const numbers = sequenceOf(response.start, response.step, response.count);
      return holeValues(numbers, [...response.holes].sort((a, b) => a - b)).join(', ');
    }
    case 'sequence-rule':
      return `${stepWords(response.step)} (${response.step > 0 ? '+' : '−'}${Math.abs(response.step)})`;
    case 'column-sum':
      return `${response.a} ${response.op === 'add' ? '+' : '−'} ${response.b} = ${response.op === 'add' ? columnSum(response.a, response.b) : columnDifference(response.a, response.b)}`;
    case 'sum-steps':
      return `${response.a} + ${response.b} = ${columnSum(response.a, response.b)} (ერთეულები ${columnSum(response.a, response.b) % 10}, ათეულები ${sumTens(response.a, response.b)})`;
    case 'difference-steps':
      return `${response.a} − ${response.b} = ${columnDifference(response.a, response.b)}`;
    case 'story-problem':
      return `${response.kind === 'separate' ? '−' : '+'} · ${response.a} ${response.kind === 'separate' ? '−' : '+'} ${response.b} = ${response.kind === 'separate' ? response.a - response.b : response.a + response.b} ${response.unit}`;
    case 'make-equal':
      return `ყველა ჯგუფში ${response.each} საგანი (${response.groups} ჯგუფი, სულ ${totalOf(response.groups, response.each)})`;
    case 'array-read':
      return `${response.rows} რიგი × ${response.cols} = ${response.rows * response.cols}`;
    case 'array-build':
      return arraysFor(response.total).map((a) => `${a.rows} × ${a.cols}`).join(' ან ');
    case 'group-story':
      return `${multiplyText(response.groups, response.each)} ${response.unit}`;
    case 'times-fact':
      return `${response.factor} × ${response.table} = ${productOf(response.table, response.factor)}`;
    case 'times-missing':
      return response.missing === 'product'
        ? `${response.factor} × ${response.table} = ${productOf(response.table, response.factor)}`
        : `${productOf(response.table, response.factor)} ÷ ${response.table} = ${response.factor}`;
    case 'table-build':
      return Array.from({ length: response.upTo }, (_, i) => `${i + 1} × ${response.table} = ${productOf(response.table, i + 1)}`).join(', ');
    case 'table-grid':
      return response.ask === 'read-product'
        ? `${factText(typeof response.target === 'object' ? response.target.table : response.tables[0], typeof response.target === 'object' ? response.target.factor : response.factors[0])}`
        : cellsFor(typeof response.target === 'object' ? productOf(response.target.table, response.target.factor) : response.target, response.tables, response.factors)
            .map((k) => k.split(',').reverse().join(' × '))
            .join(', ');
    case 'share-fair': {
      const s = fairShare(response.total, response.people);
      return `თითოეულს ${s.share}, ნაშთი ${s.leftover}`;
    }
    case 'share-groups':
      return `თითოეულ ჯგუფში ${fairShare(response.total, response.groups).share}`;
    case 'group-into': {
      const g = groupInto(response.total, response.size);
      return `${g.groups} სრული ჯგუფი, ნაშთი ${g.leftover}`;
    }
    case 'division-sentence':
      return `${response.total} ÷ ${response.by} = ${quotientOf(response.total, response.by) ?? '?'}`;
    case 'fact-family':
      return response.missing === 'a'
        ? `${response.a}`
        : response.missing === 'b'
          ? `${response.b}`
          : `${productOf(response.a, response.b)}`;
    case 'parts-judge':
      return hasEqualPieces(response.shape) ? 'ტოლი ნაწილები' : 'არატოლი ნაწილები';
    case 'fraction-pick':
      return `${response.need} ნაწილი`;
    case 'fraction-name': {
      const f = fractionOf(response.shape, response.take);
      return f ? `${fractionText(f)}` : 'ტოლი ნაწილები არ არის';
    }
    case 'date-step': {
      const date = addDays(response.from, response.count);
      return `${dateFullText(date)} (${weekdayName(weekdayOf(date))})`;
    }
    case 'weekday-of':
      return weekdayName(weekdayOf(response.date));
    case 'days-between':
      return weeksTextOf(daysBetween(response.from, response.to));
    case 'elapsed': {
      const total = minutesBetween(response.from, response.to);
      return `${Math.floor(total / 60)} სთ ${total % 60} წთ`;
    }
    case 'money-total':
      return moneyText(moneyTotal(response.pieces));
    case 'money-compare': {
      const enough = response.money >= response.cost;
      return enough ? `საკმარისია, ხურდა ${moneyText(changeFrom(response.money, response.cost))}` : `არა, ${moneyText(response.cost - response.money)} აკლია`;
    }
    case 'money-build':
      return `${moneyText(response.target)}: ${fewestPieces(response.target).map(pieceText).join(' + ')}`;
    case 'reflect':
      return reflectCells(response.picture.cells, response.line)
        .map((c) => `(${c.x},${c.y})`)
        .join(' ');
    case 'symmetry-fill':
      return missingForSymmetry(response.picture.cells, response.line)
        .map((c) => `(${c.x},${c.y})`)
        .join(' ');
    case 'symmetry-line': {
      const right = response.candidates.filter((line) => isSymmetricAbout(response.picture.cells, line));
      return response.ask === 'count' ? String(right.length) : right.map(lineName).join(', ') || 'არც ერთი';
    }
    case 'flip-pick': {
      const actual = response.options.find((o) => isReflectionOf(response.source, o.cells, response.line));
      return actual?.id ?? '';
    }
    case 'sentence-fill': {
      const values = solve(response.sentence).values;
      return filledText(response.sentence, values);
    }
    case 'sentence-check':
      return sentenceText(response.options.find((o) => o.id === response.answer)!.sentence);
    case 'symbol-solve':
      return `${response.symbol} = ${solvePuzzle(response.sentences).values[response.symbol]}`;
    case 'chain-solve': {
      const all = runSteps(response.start, response.steps);
      return String(response.ask === 'end' ? all[all.length - 1] : all[response.ask - 1]);
    }
    case 'chain-fill': {
      const all = runSteps(response.start, response.steps);
      return response.asks.map((at) => all[at - 1]).join(', ');
    }
    case 'family-pick':
      return response.options.find((o) => o.id === response.answer)?.text ?? response.answer;
    case 'pattern-next':
      return itemText(patternItemAt(response.pattern, response.shown));
    case 'pattern-fix':
      return `${mistakeAt(response.pattern, response.items) + 1}`;
    case 'pattern-fill':
      return response.holes.map((h) => itemText(patternItemAt(response.pattern, h))).join(', ');
    case 'grid-route':
      return gridWalk(response.start, response.moves, response.rows, response.cols).cells.map(gridCellKey).join(' → ');
    case 'grid-end': {
      const got = gridWalk(response.start, response.moves, response.rows, response.cols);
      return gridCellKey(got.cells[got.cells.length - 1]);
    }
    case 'grid-fill': {
      const solved = solveGrid(response.grid, response.items);
      return gridText(solved).join(' / ');
    }
    case 'clue-select':
      return survivingCandidates(response.candidates, response.clues).map((c) => c.label).join(', ');
    case 'clue-pick2': {
      const candidate = response.candidates.find((c) => c.id === response.candidate)!;
      const clue = firstFailed(candidate, response.clues)!;
      return gridClueText(clue, clue.attr, clue.value);
    }
  }
}

/**
 * Fill a rule grid the only way it can be filled: repeatedly place the item that is forced in some row and column. Throws
 * when nothing is forced, because a grid with two possible answers is a content bug, not a puzzle.
 */
export function solveGrid(grid: GridBoard, items: readonly GridItem[]): GridBoard {
  let out = grid;
  for (let guard = 0; guard < grid.rows * grid.cols + 1; guard += 1) {
    if (holes(out).length === 0) return out;
    const forced = forcedCell(out, items);
    if (!forced) throw new RangeError('this grid cannot be solved by elimination — no cell is forced');
    out = gridPut(out, forced.cell, forced.item);
  }
  throw new RangeError('this grid cannot be solved');
}

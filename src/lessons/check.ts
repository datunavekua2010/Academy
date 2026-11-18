import { parseNumber, parsePoly, polyEqual } from './algebra';
import { divisionFromLines, divisionOf, groupOf, hasEqualParts, parseLines, ruleHolds } from './exercises/ShapeGeometry';
import type { AnswerInput, Evaluation, Misconception, Question, ResponseSpec } from './types';

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
  needStoryNumber: 'ჩაწერე პასუხი რიცხვით.',
  frameNotFull: 'ჩარჩოში ჯერ კიდევ არის ცარიელი ადგილი.',
  firstSmallest: 'ჯერ არ არის სწორი. პირველ ადგილზე ყველაზე პატარა რიცხვი უნდა იდგეს.',
  firstLargest: 'ჯერ არ არის სწორი. პირველ ადგილზე ყველაზე დიდი რიცხვი უნდა იდგეს.',
  closeOrder: 'დასაწყისი სწორია. შეადარე დანარჩენი რიცხვები ერთმანეთს.',
  needMarker: 'გადაიტანე მარკერი რიცხვით ღერძზე და შემდეგ შეამოწმე.',
  notSimplified: 'მნიშვნელობა სწორია, მაგრამ გამოსახულება ჯერ არ არის გამარტივებული. ჩაწერე ყველაზე მარტივი სახით.',
};

export function evaluateAnswer(question: Question, input: AnswerInput): Evaluation {
  return evaluateResponse(question, question.response, input);
}

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
  }
}

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
  }
}

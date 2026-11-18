import { parseNumber, parsePoly, polyEqual } from './algebra';
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
  }
}

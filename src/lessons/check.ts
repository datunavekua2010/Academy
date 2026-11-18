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
      return String(response.answer);
  }
}

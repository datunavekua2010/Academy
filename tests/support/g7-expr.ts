/**
 * Reading the notation of the Grade VII algebra units back into JavaScript:
 * `3x² − 5x + 2`, `2(3x − 1)`, `|x − 3|`, `x/3 + 4`, with a true minus sign.
 */

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const NAMES = ['x', 'y', 'z', 'a', 'b', 'm', 't', 'n'];

export type Env = Record<string, number>;

export const compile = (text: string): ((env: Env) => number) => {
  let js = text.replace(/\s/g, '').replace(/\u2212/g, '-');
  js = js.replace(new RegExp(`[${SUP}]+`, 'g'), (m) => `^${[...m].map((c) => SUP.indexOf(c)).join('')}`);
  // |expr| → §(expr), kept apart from the implicit-product step
  while (/\|[^|]+\|/.test(js)) js = js.replace(/\|([^|]+)\|/, '§($1)');
  js = js.replace(/(\d|[a-z]|\)|\d\^\d)(?=[a-z(])/g, '$1*');
  js = js.replace(/(\d+|[a-z])\^(\d+)/g, '($1**$2)');
  js = js.replace(/\)\^(\d+)/g, ')**$1');
  js = js.replace(/§/g, 'Math.abs');
  const fn = new Function(...NAMES, `return ${js};`) as (...args: number[]) => number;
  return (env) => fn(...NAMES.map((n) => env[n] ?? 0));
};

const REL = /\s*(≤|≥|<|>|=)\s*/;

/** Does `x` satisfy a chain such as `−4 < x < 4`, `x ≥ 3`, `1 < 2x + 1 ≤ 9`, `x = 5`? */
export const holds = (chain: string, x: number, name = 'x'): boolean => {
  const parts = chain.split(REL);
  for (let i = 0; i + 2 < parts.length; i += 2) {
    const a = compile(parts[i]!)({ [name]: x });
    const b = compile(parts[i + 2]!)({ [name]: x });
    const op = parts[i + 1]!;
    const ok = op === '<' ? a < b : op === '>' ? a > b : op === '≤' ? a <= b : op === '≥' ? a >= b : a === b;
    if (!ok) return false;
  }
  return true;
};

/** `x = 3 ან x = −7`, `x < −3 ან x > 3`, `x ∈ [−3; 5]`, `ამონახსნი არ აქვს`. */
export const answerHolds = (answer: string, x: number, name = 'x'): boolean => {
  if (answer === 'ამონახსნი არ აქვს') return false;
  const interval = /^(\S+) ∈ ([[(])(\S+); (\S+)([\])])$/.exec(answer);
  if (interval) {
    const lo = Number(interval[3]!.replace('\u2212', '-'));
    const hi = Number(interval[4]!.replace('\u2212', '-'));
    return (interval[2] === '[' ? x >= lo : x > lo) && (interval[5] === ']' ? x <= hi : x < hi);
  }
  return answer.split(' ან ').some((part) => holds(part, x, name));
};

export const RANGE = Array.from({ length: 161 }, (_, i) => i - 80);
export const solutionSet = (test: (x: number) => boolean): number[] => RANGE.filter(test);

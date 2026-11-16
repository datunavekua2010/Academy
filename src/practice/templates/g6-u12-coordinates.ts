import type { QuestionTemplate, Vars } from './types';
import { C, D, F, I, MINUS, N, SPEC, q6, sg } from './g6-helpers';

/**
 * Grade VI — Unit 12: საკოორდინატო სიბრტყე და სიმეტრია (the coordinate plane and symmetry).
 *
 * Converted from the academy's `U12` bank: 6 subtopics × 6 questions.
 *
 * A point is printed the way Grade V prints it, `A(3;5)`, with a true minus.
 * Every key is computed from the drawn coordinates; the wrong options are the
 * slips of the topic: coordinates swapped, a sign lost, the wrong axis mirrored,
 * a step taken along the wrong direction, a centre forgotten.
 */

export const G6_U12_SUBTOPICS = ['u12-01', 'u12-02', 'u12-03', 'u12-04', 'u12-05', 'u12-06'] as const;

const T = 'g6-coordinates';
let seq = 0;
const nextId = (): string => `g6-u12-q${String(++seq).padStart(2, '0')}`;
type Spec = Omit<Parameters<typeof q6>[0], 'id' | 'topic'>;
const t = (spec: Spec): QuestionTemplate => q6({ id: nextId(), topic: T, ...spec });

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'K', 'P'];
const PAIRS = ['A|B', 'C|D', 'M|N', 'K|L', 'E|F'];

/** `(−2;4)`. */
const pt = (x: number, y: number): string => `(${sg(x)};${sg(y)})`;
/** `A(−2;4)`. */
const named = (label: string, x: number, y: number): string => `${label}${pt(x, y)}`;

/** Options for a point answer: the key first, then the usual slips, then generic neighbours. */
const pointOptions = (x: number, y: number, extra: Array<[number, number]> = []): string[] => {
  const right = pt(x, y);
  const all: string[] = [right];
  for (const [a, b] of [...extra, [-x, y], [x, -y], [-x, -y], [y, x], [x + 1, y], [x, y + 1], [x - 1, y], [x, y - 1], [x + 2, y - 2]] as Array<[number, number]>) {
    const text = pt(a, b);
    if (!all.includes(text)) all.push(text);
  }
  return all;
};

const AXES = ['x-ღერძზე', 'y-ღერძზე', 'სათავეში', 'არც ერთ ღერძზე'];
const QUADRANTS = ['I', 'II', 'III', 'IV'];
const quadrantOf = (x: number, y: number): string => (x > 0 && y > 0 ? 'I' : x < 0 && y > 0 ? 'II' : x < 0 && y < 0 ? 'III' : 'IV');
const quad = (q: string): string => `${q} მეოთხედში`;

/** A point `L(x;y)` drawn with a letter. */
const pointVars = (xr: [number, number], yr: [number, number]): Record<string, ReturnType<typeof C>> => ({
  L: C(LETTERS),
  x: I(xr[0], xr[1]),
  y: I(yr[0], yr[1]),
  P: D((v) => named(String(v.L), N(v, 'x'), N(v, 'y'))),
});
const nonZero = { test: (v: Vars) => N(v, 'x') !== 0 && N(v, 'y') !== 0, note: 'off the axes' };

/** A shift of a point by (dx, dy), drawn as steps a (horizontal) and b (vertical). */
const shifted = (
  sub: string, d: 1 | 2 | 3, prompt: string,
  xr: [number, number], yr: [number, number], ar: [number, number], br: [number, number] | null,
  sx: -1 | 0 | 1, sy: -1 | 0 | 1,
  constraints: Array<{ test: (v: Vars) => boolean; note: string }> = [],
): QuestionTemplate => {
  const dx = (v: Vars): number => sx * N(v, 'a');
  const dy = (v: Vars): number => sy * N(v, br ? 'b' : 'a');
  return t({
    sub, d, prompt,
    vars: { ...pointVars(xr, yr), a: I(ar[0], ar[1]), ...(br ? { b: I(br[0], br[1]) } : {}) },
    constraints,
    optionCount: 4,
    answer: (v) => pt(N(v, 'x') + dx(v), N(v, 'y') + dy(v)),
    options: (v) => {
      const x = N(v, 'x');
      const y = N(v, 'y');
      const nx = x + dx(v);
      const ny = y + dy(v);
      const extra: Array<[number, number]> = [[x - dx(v), y + dy(v)], [x + dx(v), y - dy(v)], [x - dx(v), y - dy(v)], [x + dy(v), y + dx(v)], [x + dx(v) + dy(v), y]];
      if (dy(v) !== 0 && dx(v) !== 0) extra.push([x + dx(v), y], [x, y + dy(v)]);
      if (dy(v) === 0) extra.push([x, y + dx(v)]);
      if (dx(v) === 0) extra.push([x + dy(v), y]);
      return pointOptions(nx, ny, extra);
    },
    why: (v, a) => {
      const x = N(v, 'x');
      const y = N(v, 'y');
      const part = (value: number, step: number): string => (step === 0 ? `${sg(value)}` : `${sg(value)} ${step < 0 ? MINUS : '+'} ${Math.abs(step)} = ${sg(value + step)}`);
      return `x: ${part(x, dx(v))}; y: ${part(y, dy(v))}. ახალი წერტილია ${a}.`;
    },
  });
};

/** A reflection or the like, built from a function of (x, y). */
const mirrored = (
  sub: string, d: 1 | 2 | 3, prompt: string, xr: [number, number], yr: [number, number],
  image: (x: number, y: number) => [number, number], slips: (x: number, y: number) => Array<[number, number]>, rule: string,
  constraints: Array<{ test: (v: Vars) => boolean; note: string }> = [],
): QuestionTemplate =>
  t({
    sub, d, prompt,
    vars: pointVars(xr, yr),
    constraints: [nonZero, ...constraints],
    answer: (v) => pt(...image(N(v, 'x'), N(v, 'y'))),
    options: (v) => pointOptions(...image(N(v, 'x'), N(v, 'y')), slips(N(v, 'x'), N(v, 'y'))),
    why: (v, a) => `${v.P}: ${rule} ${a}.`,
  });

const axisOf = (x: number, y: number): string => (x === 0 && y === 0 ? 'სათავეში' : x === 0 ? 'y-ღერძზე' : y === 0 ? 'x-ღერძზე' : 'არც ერთ ღერძზე');
/** A point on an axis: one coordinate zero, the other not. */
const onAxis = (xr: [number, number], yr: [number, number], sub: string, d: 1 | 2, prompt: string): QuestionTemplate =>
  t({
    sub, d, prompt,
    vars: {
      L: C(LETTERS), on: C(['x', 'y']), n: I(xr[0], xr[1]),
      x: D((v) => (v.on === 'y' ? 0 : N(v, 'n'))),
      y: D((v) => (v.on === 'y' ? N(v, 'n') : 0)),
      P: D((v) => named(String(v.L), v.on === 'y' ? 0 : N(v, 'n'), v.on === 'y' ? N(v, 'n') : 0)),
    },
    constraints: [{ test: (v) => N(v, 'n') !== 0 && N(v, 'n') >= yr[0] && N(v, 'n') <= yr[1], note: 'a point on one axis' }],
    optionCount: 4,
    answer: (v) => axisOf(N(v, 'x'), N(v, 'y')),
    options: (_v, right) => [right, ...AXES.filter((x) => x !== right)],
    why: (v, a) => `${v.P}: ${v.on === 'y' ? 'x-კოორდინატი 0-ია' : 'y-კოორდინატი 0-ია'}, ამიტომ წერტილი მდებარეობს ${a}.`,
  });

export const G6_U12_TEMPLATES: QuestionTemplate[] = [
  // ═════════ U12.1 — საკოორდინატო სიბრტყე ═════════
  t({
    sub: 'u12-01',
    prompt: 'მოცემულია წერტილი {P}. რომელია მისი x-კოორდინატი?',
    vars: pointVars([1, 9], [1, 9]),
    constraints: [{ test: (v) => N(v, 'x') !== N(v, 'y'), note: 'x differs from y' }],
    answer: (v) => sg(N(v, 'x')),
    wrong: (v) => [N(v, 'y'), N(v, 'x') + 1, N(v, 'x') - 1, N(v, 'x') + N(v, 'y'), N(v, 'x') * N(v, 'y')],
    why: (v, a) => `წერტილის პირველი რიცხვი x-კოორდინატია: ${v.P} → ${a}.`,
  }),
  t({
    sub: 'u12-01',
    prompt: 'მოცემულია წერტილი {P}. იპოვე მისი y-კოორდინატი.',
    vars: pointVars([-9, -1], [1, 9]),
    answer: (v) => sg(N(v, 'y')),
    wrong: (v) => [-N(v, 'x'), N(v, 'x'), N(v, 'y') + 1, N(v, 'y') - 1, N(v, 'y') + 2, -N(v, 'y')],
    why: (v, a) => `წერტილის მეორე რიცხვი y-კოორდინატია: ${v.P} → ${a}.`,
  }),
  onAxis([1, 9], [1, 9], 'u12-01', 1, 'წერტილის კოორდინატებია {P}. რომელ ღერძზე მდებარეობს წერტილი?'),
  onAxis([1, 9], [1, 9], 'u12-01', 1, 'წერტილი {P} რომელ ღერძზე მდებარეობს?'),
  t({
    sub: 'u12-01',
    d: 2,
    prompt: 'იპოვე {Pa} და {Pb} წერტილებს შორის ვერტიკალური მანძილი.',
    vars: {
      spec: SPEC(PAIRS), La: F(0), Lb: F(1), x: I(1, 6), y1: I(1, 5), k: I(2, 8),
      Pa: D((v) => named(String(v.La), N(v, 'x'), N(v, 'y1'))),
      Pb: D((v) => named(String(v.Lb), N(v, 'x'), N(v, 'y1') + N(v, 'k'))),
    },
    answer: (v) => sg(N(v, 'k')),
    wrong: (v) => [N(v, 'y1') + N(v, 'k'), N(v, 'x'), N(v, 'k') + N(v, 'y1') + N(v, 'x'), N(v, 'k') + 1, N(v, 'k') - 1, N(v, 'y1')],
    why: (v, a) => `x-კოორდინატები ერთნაირია, ამიტომ მანძილი y-ების სხვაობაა: ${N(v, 'y1') + N(v, 'k')} − ${v.y1} = ${a}.`,
  }),
  t({
    sub: 'u12-01',
    d: 2,
    prompt: 'იპოვე {Pa} და {Pb} წერტილებს შორის ჰორიზონტალური მანძილი.',
    vars: {
      spec: SPEC(PAIRS), La: F(0), Lb: F(1), x1: I(-8, -1), x2: I(1, 8), y: I(-5, 6),
      Pa: D((v) => named(String(v.La), N(v, 'x1'), N(v, 'y'))),
      Pb: D((v) => named(String(v.Lb), N(v, 'x2'), N(v, 'y'))),
    },
    answer: (v) => sg(N(v, 'x2') - N(v, 'x1')),
    wrong: (v) => [Math.abs(N(v, 'x2') + N(v, 'x1')), Math.abs(N(v, 'x1')), N(v, 'x2'), N(v, 'x2') - N(v, 'x1') + 1, N(v, 'x2') - N(v, 'x1') - 1, N(v, 'x2') - N(v, 'x1') + 2],
    why: (v, a) => `y-კოორდინატები ერთნაირია, ამიტომ მანძილი x-ების სხვაობაა: ${v.x2} − (${sg(N(v, 'x1'))}) = ${a}.`,
  }),

  // ═════════ U12.2 — მეოთხედები და ღერძები ═════════
  t({
    sub: 'u12-02',
    prompt: 'რომელ მეოთხედში მდებარეობს წერტილი {P}?',
    vars: pointVars([-9, 9], [-9, 9]),
    constraints: [nonZero],
    optionCount: 4,
    answer: (v) => quad(quadrantOf(N(v, 'x'), N(v, 'y'))),
    options: (_v, right) => [right, ...QUADRANTS.map(quad).filter((x) => x !== right)],
    why: (v, a) => `x ${N(v, 'x') > 0 ? '>' : '<'} 0 და y ${N(v, 'y') > 0 ? '>' : '<'} 0, ამიტომ ${v.P} მდებარეობს ${a}.`,
  }),
  t({
    sub: 'u12-02',
    prompt: 'რომელი წერტილი მდებარეობს {Q} მეოთხედში?',
    vars: {
      Q: C(QUADRANTS), a: I(1, 9), b: I(1, 9),
    },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b'), note: 'distinct' }],
    optionCount: 4,
    answer: (v) => {
      const [x, y] = ({ I: [1, 1], II: [-1, 1], III: [-1, -1], IV: [1, -1] } as Record<string, number[]>)[String(v.Q)]!;
      return pt(x! * N(v, 'a'), y! * N(v, 'b'));
    },
    options: (v, right) => [right, ...[[1, 1], [-1, 1], [-1, -1], [1, -1]].map(([x, y]) => pt(x! * N(v, 'a'), y! * N(v, 'b'))).filter((o) => o !== right)],
    why: (v, a) => `${v.Q} მეოთხედში x-ისა და y-ის ნიშნები ${({ I: 'დადებითია და დადებითი', II: 'უარყოფითია და დადებითი', III: 'უარყოფითია და უარყოფითი', IV: 'დადებითია და უარყოფითი' } as Record<string, string>)[String(v.Q)]}; ეს წერტილია ${a}.`,
  }),
  t({
    sub: 'u12-02',
    prompt: 'წერტილის x-კოორდინატია {tx}, y-კოორდინატი კი {ty}. რომელ მეოთხედში მდებარეობს ეს წერტილი?',
    vars: { x: I(-9, 9), y: I(-9, 9), tx: D((v) => sg(N(v, 'x'))), ty: D((v) => sg(N(v, 'y'))) },
    constraints: [nonZero],
    optionCount: 4,
    answer: (v) => quad(quadrantOf(N(v, 'x'), N(v, 'y'))),
    options: (_v, right) => [right, ...QUADRANTS.map(quad).filter((x) => x !== right)],
    why: (v, a) => `x = ${v.tx}, y = ${v.ty}; ნიშნების მიხედვით წერტილი მდებარეობს ${a}.`,
  }),
  t({
    sub: 'u12-02',
    prompt: 'წერტილის x-კოორდინატი {sx}, y-კოორდინატი კი {sy}. რომელ მეოთხედში მდებარეობს წერტილი?',
    vars: { sx: C(['დადებითია', 'უარყოფითია']), sy: C(['დადებითია', 'უარყოფითია']) },
    optionCount: 4,
    answer: (v) => quad(quadrantOf(v.sx === 'დადებითია' ? 1 : -1, v.sy === 'დადებითია' ? 1 : -1)),
    options: (_v, right) => [right, ...QUADRANTS.map(quad).filter((x) => x !== right)],
    why: (v, a) => `x ${v.sx === 'დადებითია' ? '> 0' : '< 0'}, y ${v.sy === 'დადებითია' ? '> 0' : '< 0'}; ეს ${a}.`,
  }),
  onAxis([-9, 9], [-9, 9], 'u12-02', 1, 'რომელ ღერძზე მდებარეობს წერტილი {P}?'),
  t({
    sub: 'u12-02',
    d: 2,
    prompt: 'რომელი წერტილი მდებარეობს {ax}-ღერძზე?',
    vars: { ax: C(['x', 'y']), a: I(1, 9), b: I(1, 9) },
    constraints: [{ test: (v) => N(v, 'a') !== N(v, 'b'), note: 'distinct' }],
    optionCount: 4,
    answer: (v) => (v.ax === 'x' ? pt(N(v, 'a'), 0) : pt(0, N(v, 'a'))),
    options: (v, right) => [right, v.ax === 'x' ? pt(0, N(v, 'a')) : pt(N(v, 'a'), 0), pt(N(v, 'a'), N(v, 'b')), pt(-N(v, 'a'), N(v, 'b'))],
    why: (v, a) => `${v.ax}-ღერძზე მდებარე წერტილში ${v.ax === 'x' ? 'y' : 'x'}-კოორდინატი 0-ია: ${a}.`,
  }),

  // ═════════ U12.3 — წერტილის პოვნა ═════════
  t({
    sub: 'u12-03',
    prompt: 'ჩაწერე წერტილის კოორდინატები, თუ ის საწყისი წერტილიდან {a} ერთეულით {h} და {b} ერთეულით {w} მდებარეობს.',
    vars: { a: I(2, 9), b: I(2, 9), h: C(['მარჯვნივ', 'მარცხნივ']), w: C(['ზემოთ', 'ქვემოთ']) },
    optionCount: 4,
    answer: (v) => pt(v.h === 'მარჯვნივ' ? N(v, 'a') : -N(v, 'a'), v.w === 'ზემოთ' ? N(v, 'b') : -N(v, 'b')),
    options: (v) => {
      const x = v.h === 'მარჯვნივ' ? N(v, 'a') : -N(v, 'a');
      const y = v.w === 'ზემოთ' ? N(v, 'b') : -N(v, 'b');
      return pointOptions(x, y, [[y, x], [-x, y], [x, -y], [-x, -y]]);
    },
    why: (v, a) => `${v.h}: x = ${v.h === 'მარჯვნივ' ? '' : MINUS}${v.a}; ${v.w}: y = ${v.w === 'ზემოთ' ? '' : MINUS}${v.b}. წერტილია ${a}.`,
  }),
  shifted('u12-03', 1, 'წერტილი {P} გადაიტანე {a} ერთეულით მარჯვნივ. ჩაწერე ახალი კოორდინატები.', [-6, 6], [-6, 6], [2, 8], null, 1, 0),
  shifted('u12-03', 1, 'წერტილი {P} გადაიტანე {a} ერთეულით მარცხნივ. ჩაწერე ახალი კოორდინატები.', [-6, 6], [-6, 6], [2, 8], null, -1, 0),
  shifted('u12-03', 1, 'წერტილი {P} გადაიტანე {a} ერთეულით ზემოთ. ჩაწერე ახალი კოორდინატები.', [-6, 6], [-6, 6], [2, 8], null, 0, 1),
  shifted('u12-03', 1, 'წერტილი {P} გადაიტანე {a} ერთეულით ქვემოთ. ჩაწერე ახალი კოორდინატები.', [-6, 6], [-6, 6], [2, 8], null, 0, -1),
  shifted('u12-03', 2, 'წერტილი {P} გადაიტანე {a} ერთეულით მარცხნივ და {b} ერთეულით ქვემოთ. ჩაწერე ახალი კოორდინატები.', [-6, 8], [-6, 8], [2, 8], [2, 8], -1, -1),

  // ═════════ U12.4 — გადაადგილება საკოორდინატო სიბრტყეზე ═════════
  shifted('u12-04', 1, 'წერტილი {P} გადაიტანე {a} ერთეულით მარჯვნივ და {b} ერთეულით ზემოთ. იპოვე ახალი კოორდინატები.', [-3, 6], [-3, 6], [2, 9], [2, 9], 1, 1),
  shifted('u12-04', 1, 'წერტილი {P} გადაიტანე {a} ერთეულით მარჯვნივ და {b} ერთეულით ქვემოთ. იპოვე ახალი კოორდინატები.', [-7, -1], [1, 7], [2, 9], [2, 9], 1, -1),
  shifted('u12-04', 2, 'წერტილი {P} გადაიტანე {a} ერთეულით მარცხნივ. იპოვე ახალი კოორდინატები.', [1, 6], [-6, -1], [7, 12], null, -1, 0),
  shifted('u12-04', 2, 'წერტილი {P} გადაიტანე {a} ერთეულით ზემოთ. იპოვე ახალი კოორდინატები.', [-6, -1], [-7, -1], [8, 12], null, 0, 1),
  shifted('u12-04', 2, 'წერტილი {P} ჯერ გადაიტანე {a} ერთეულით მარცხნივ, შემდეგ კი {b} ერთეულით ზემოთ. იპოვე საბოლოო კოორდინატები.', [-2, 6], [-4, 5], [2, 9], [2, 9], -1, 1),
  shifted('u12-04', 2, 'წერტილი {P} გადაიტანე {a} ერთეულით მარჯვნივ და {b} ერთეულით ქვემოთ. იპოვე საბოლოო კოორდინატები.', [-6, -1], [1, 7], [2, 9], [8, 12], 1, -1),

  // ═════════ U12.5 — ღერძული სიმეტრია ═════════
  mirrored('u12-05', 1, 'იპოვე {P} წერტილის სიმეტრიული წერტილის კოორდინატები y-ღერძის მიმართ.', [1, 9], [1, 9], (x, y) => [-x, y], (x, y) => [[x, -y], [-x, -y], [y, x], [-y, x]], 'y-ღერძის მიმართ x-ის ნიშანი იცვლება, y უცვლელია;'),
  mirrored('u12-05', 1, 'იპოვე {P} წერტილის სიმეტრიული წერტილის კოორდინატები y-ღერძის მიმართ.', [-9, -1], [-9, 9], (x, y) => [-x, y], (x, y) => [[x, -y], [-x, -y], [y, x], [-y, x]], 'y-ღერძის მიმართ x-ის ნიშანი იცვლება, y უცვლელია;'),
  mirrored('u12-05', 1, 'იპოვე {P} წერტილის სიმეტრიული წერტილის კოორდინატები x-ღერძის მიმართ.', [1, 9], [-9, -1], (x, y) => [x, -y], (x, y) => [[-x, y], [-x, -y], [y, x], [x, -y + 1]], 'x-ღერძის მიმართ y-ის ნიშანი იცვლება, x უცვლელია;'),
  mirrored('u12-05', 1, 'იპოვე {P} წერტილის სიმეტრიული წერტილის კოორდინატები x-ღერძის მიმართ.', [-9, -1], [-9, -1], (x, y) => [x, -y], (x, y) => [[-x, y], [-x, -y], [y, x], [x, -y + 1]], 'x-ღერძის მიმართ y-ის ნიშანი იცვლება, x უცვლელია;'),
  t({
    sub: 'u12-05',
    d: 2,
    prompt: 'წერტილი {P} ასახე ორივე კოორდინატული ღერძის მიმართ თანმიმდევრულად. რა იქნება საბოლოო კოორდინატები?',
    vars: pointVars([-9, 9], [-9, 9]),
    constraints: [nonZero],
    answer: (v) => pt(-N(v, 'x'), -N(v, 'y')),
    options: (v) => pointOptions(-N(v, 'x'), -N(v, 'y'), [[-N(v, 'x'), N(v, 'y')], [N(v, 'x'), -N(v, 'y')], [N(v, 'y'), N(v, 'x')], [-N(v, 'y'), -N(v, 'x')]]),
    why: (v, a) => `ერთი ღერძის მიმართ იცვლება ერთი ნიშანი, მეორის მიმართ — მეორე: ${v.P} → ${a}.`,
  }),
  t({
    sub: 'u12-05',
    d: 2,
    prompt: 'წერტილი {P} ასახე წრფის y = x მიმართ. ჩაწერე სიმეტრიული წერტილის კოორდინატები.',
    vars: pointVars([-9, 9], [-9, 9]),
    constraints: [nonZero, { test: (v) => N(v, 'x') !== N(v, 'y') && N(v, 'x') !== -N(v, 'y'), note: 'not on a diagonal' }],
    answer: (v) => pt(N(v, 'y'), N(v, 'x')),
    options: (v) => pointOptions(N(v, 'y'), N(v, 'x'), [[-N(v, 'x'), N(v, 'y')], [N(v, 'x'), -N(v, 'y')], [-N(v, 'y'), -N(v, 'x')], [-N(v, 'x'), -N(v, 'y')]]),
    why: (v, a) => `წრფე y = x-ის მიმართ კოორდინატები ადგილს იცვლიან: ${v.P} → ${a}.`,
  }),

  // ═════════ U12.6 — ცენტრალური სიმეტრია ═════════
  mirrored('u12-06', 1, 'იპოვე {P} წერტილის ცენტრალურად სიმეტრიული წერტილის კოორდინატები სათავის მიმართ.', [1, 9], [1, 9], (x, y) => [-x, -y], (x, y) => [[-x, y], [x, -y], [y, x], [-y, -x]], 'სათავის მიმართ ორივე კოორდინატის ნიშანი იცვლება;'),
  mirrored('u12-06', 1, 'იპოვე {P} წერტილის ცენტრალურად სიმეტრიული წერტილის კოორდინატები სათავის მიმართ.', [-9, -1], [1, 9], (x, y) => [-x, -y], (x, y) => [[-x, y], [x, -y], [y, x], [-y, -x]], 'სათავის მიმართ ორივე კოორდინატის ნიშანი იცვლება;'),
  mirrored('u12-06', 1, 'იპოვე {P} წერტილის ცენტრალურად სიმეტრიული წერტილის კოორდინატები სათავის მიმართ.', [1, 9], [-9, -1], (x, y) => [-x, -y], (x, y) => [[-x, y], [x, -y], [y, x], [-y, -x]], 'სათავის მიმართ ორივე კოორდინატის ნიშანი იცვლება;'),
  t({
    sub: 'u12-06',
    d: 2,
    prompt: 'წერტილი {P} და მისი სიმეტრიული წერტილი {L}′ ცენტრალური სიმეტრიისას სათავის მიმართ არის ერთმანეთისგან რამდენი ერთეულით დაშორებული?',
    vars: { L: C(LETTERS), spec: SPEC(['3|4|5', '6|8|10', '5|12|13', '8|6|10', '4|3|5', '0|5|5', '7|0|7', '0|9|9', '6|0|6', '12|5|13', '9|12|15', '0|4|4']), x: F(0), y: F(1), r: F(2), P: D((v) => named(String(v.L), N(v, 'x'), N(v, 'y'))) },
    answer: (v) => `${2 * N(v, 'r')} ერთეული`,
    wrong: (v) => [N(v, 'r'), N(v, 'x') + N(v, 'y'), 2 * (N(v, 'x') + N(v, 'y')), 2 * N(v, 'r') + 2, 2 * N(v, 'r') - 2, 4 * N(v, 'r'), N(v, 'r') + 5].filter((x) => x > 0 && x !== 2 * N(v, 'r')).map((x) => `${x} ერთეული`),
    why: (v, a) => `სიმეტრიული წერტილი ${pt(-N(v, 'x'), -N(v, 'y'))}; სათავე მათ შუაშია, ამიტომ მანძილი სათავემდე ${v.r}-ის ორმაგია: ${a}.`,
  }),
  t({
    sub: 'u12-06',
    d: 2,
    prompt: '{P} წერტილის ცენტრალური სიმეტრიის ცენტრია {O}. იპოვე სიმეტრიული წერტილის კოორდინატები.',
    vars: { L: C(LETTERS.filter((x) => x !== 'O')), x: I(-6, 6), y: I(-6, 6), ox: I(-4, 4), oy: I(-4, 4), P: D((v) => named(String(v.L), N(v, 'x'), N(v, 'y'))), O: D((v) => named('O', N(v, 'ox'), N(v, 'oy'))) },
    constraints: [{ test: (v) => (N(v, 'ox') !== 0 || N(v, 'oy') !== 0) && N(v, 'x') !== N(v, 'ox') && N(v, 'y') !== N(v, 'oy'), note: 'the centre is elsewhere' }],
    answer: (v) => pt(2 * N(v, 'ox') - N(v, 'x'), 2 * N(v, 'oy') - N(v, 'y')),
    options: (v) => pointOptions(2 * N(v, 'ox') - N(v, 'x'), 2 * N(v, 'oy') - N(v, 'y'), [[-N(v, 'x'), -N(v, 'y')], [N(v, 'ox') - N(v, 'x'), N(v, 'oy') - N(v, 'y')], [N(v, 'ox') + N(v, 'x'), N(v, 'oy') + N(v, 'y')], [2 * N(v, 'ox') + N(v, 'x'), 2 * N(v, 'oy') + N(v, 'y')]]),
    why: (v, a) => `x′ = 2 × ${sg(N(v, 'ox'))} − ${par0(N(v, 'x'))} = ${sg(2 * N(v, 'ox') - N(v, 'x'))}, y′ = 2 × ${sg(N(v, 'oy'))} − ${par0(N(v, 'y'))} = ${sg(2 * N(v, 'oy') - N(v, 'y'))}; ${a}.`,
  }),
  t({
    sub: 'u12-06',
    d: 3,
    prompt: '{P} წერტილისა და მისი ცენტრალურად სიმეტრიული წერტილის შემაერთებელი მონაკვეთის შუაწერტილია {O}. იპოვე სიმეტრიული წერტილის კოორდინატები.',
    vars: { L: C(LETTERS.filter((x) => x !== 'O')), x: I(-6, 6), y: I(-6, 6), ox: I(-4, 4), oy: I(-4, 4), P: D((v) => named(String(v.L), N(v, 'x'), N(v, 'y'))), O: D((v) => named('O', N(v, 'ox'), N(v, 'oy'))) },
    constraints: [{ test: (v) => (N(v, 'ox') !== 0 || N(v, 'oy') !== 0) && N(v, 'x') !== N(v, 'ox') && N(v, 'y') !== N(v, 'oy'), note: 'the centre is elsewhere' }],
    answer: (v) => pt(2 * N(v, 'ox') - N(v, 'x'), 2 * N(v, 'oy') - N(v, 'y')),
    options: (v) => pointOptions(2 * N(v, 'ox') - N(v, 'x'), 2 * N(v, 'oy') - N(v, 'y'), [[-N(v, 'x'), -N(v, 'y')], [N(v, 'ox') - N(v, 'x'), N(v, 'oy') - N(v, 'y')], [N(v, 'ox') + N(v, 'x'), N(v, 'oy') + N(v, 'y')], [2 * N(v, 'ox') + N(v, 'x'), 2 * N(v, 'oy') + N(v, 'y')]]),
    why: (v, a) => `შუაწერტილის კოორდინატი არის ბოლოების კოორდინატების საშუალო; ამიტომ x′ = 2 × ${sg(N(v, 'ox'))} − ${par0(N(v, 'x'))}, y′ = 2 × ${sg(N(v, 'oy'))} − ${par0(N(v, 'y'))}: ${a}.`,
  }),
];

/** A subtracted coordinate, bracketed when negative. */
function par0(n: number): string {
  return n < 0 ? `(${sg(n)})` : sg(n);
}

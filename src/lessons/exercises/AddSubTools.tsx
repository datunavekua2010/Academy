import { useState } from 'react';
import type { ExploreTool, ExplainBlock } from '../types';
import { BuildMat, parseCounts, countsText } from './PlaceValueBoard';
import { digitsOf, exchange, isStandard, valueOfBlocks, type DigitCounts } from './PlaceValueGeometry';
import { Blocks, DifferenceColumns, SumColumns, SumLine } from './AddSubBoard';
import { carriedTen, columnDifference, columnSum, digits2, needsBorrow, needsCarry, sumTens } from './AddSubGeometry';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Exploration labs and step-by-step demonstrations for G2 U03. A carry appears only when the ones really add up to ten;
 * a broken ten only when the ones really are too small. Both are read from the numbers, so the story cannot show a
 * regroup that the algorithm does not need.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

// ─────────────────────────── adding on the mat ───────────────────────────

/** Put both numbers on one mat and watch the sum; the mat offers the exchange exactly when ten ones appear. */
export function AddLab({ tool }: { tool: ToolOf<'add-lab'> }) {
  const [which, setWhich] = useState(0);
  const example = tool.examples[which] ?? tool.examples[0];
  const [counts, setCounts] = useState<DigitCounts>(() => toCounts(example.a));
  const [added, setAdded] = useState(false);
  const total = valueOfBlocks(counts);
  const target = example.a + example.b;
  const standard = isStandard(counts);
  const addSecond = () => {
    // put the second number down as it is: 15 ones stay 15 ones until the student exchanges them
    const d = digits2(example.b);
    setCounts((c) => ({ hundreds: c.hundreds, tens: c.tens + d.tens, ones: c.ones + d.ones }));
    setAdded(true);
  };
  const reset = (index = which) => {
    setWhich(index);
    setCounts(toCounts(tool.examples[index]?.a ?? example.a));
    setAdded(false);
  };
  return (
    <div className="lab lab-add">
      {tool.examples.length > 1 && (
        <div className="xt-modes" role="group" aria-label="მაგალითის არჩევა">
          {tool.examples.map((ex, i) => (
            <button key={`${ex.a}-${ex.b}`} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => reset(i)}>
              {`${ex.a} + ${ex.b}`}
            </button>
          ))}
        </div>
      )}
      <p className="lab-note lab-task">{`${example.a} + ${example.b} — დაფაზე დააწყვე ორივე რიცხვი.`}</p>
      <BuildMat counts={counts} onChange={setCounts} label="შეკრების დაფა" max={examplesMax(tool)} allowRegroup />
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={added} onClick={addSecond}>
          დაამატე {example.b} ბლოკებით
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => reset()}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {!added
          ? `დაფაზე: ${countsText(counts)}. სულ ${total}.`
          : standard
            ? `✓ სტანდარტული სახე: ${countsText(counts)} = ${total}. ${total === target ? `ეს არის ${example.a} + ${example.b}.` : ''}`
            : `ჯერ დაუჯგუფებელია: ${countsText(counts)} = ${total}. 10 ერთეული = 1 ათეული — გამოიყენე ⇄ ღილაკი.`}
      </p>
      <p className="lab-facts">
        <span>ათეულები: {counts.tens}</span>
        <span>ერთეულები: {counts.ones}</span>
        <span>სულ: {total}</span>
        <span>საჭირო: {target}</span>
      </p>
    </div>
  );
}

const toCounts = (n: number): DigitCounts => ({ hundreds: 0, tens: Math.floor(n / 10), ones: n % 10 });

const examplesMax = (tool: ToolOf<'add-lab'>): number => Math.max(20, ...tool.examples.map((ex) => digits2(ex.a).ones + digits2(ex.b).ones + 2));

// ─────────────────────────── subtracting on the mat ───────────────────────────

/** Remove blocks from the first number and watch what remains; the ten can be broken when it is needed. */
export function SubtractLab({ tool }: { tool: ToolOf<'subtract-lab'> }) {
  const [which, setWhich] = useState(0);
  const example = tool.examples[which] ?? tool.examples[0];
  const [counts, setCounts] = useState<DigitCounts>(() => toCounts(example.a));
  const [taken, setTaken] = useState(false);
  const total = valueOfBlocks(counts);
  const borrow = needsBorrow(example.a, example.b);
  const target = example.a - example.b;
  const takeAway = () => {
    // remove the second number's blocks; a ten that had to be broken is already ten ones on the mat
    const d = digits2(example.b);
    setCounts((c) => ({ hundreds: c.hundreds, tens: c.tens - d.tens, ones: c.ones - d.ones }));
    setTaken(true);
  };
  const canTake = counts.tens >= digits2(example.b).tens && counts.ones >= digits2(example.b).ones;
  const reset = (index = which) => {
    setWhich(index);
    setCounts(toCounts(tool.examples[index]?.a ?? example.a));
    setTaken(false);
  };
  return (
    <div className="lab lab-sub">
      {tool.examples.length > 1 && (
        <div className="xt-modes" role="group" aria-label="მაგალითის არჩევა">
          {tool.examples.map((ex, i) => (
            <button key={`${ex.a}-${ex.b}`} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => reset(i)}>
              {`${ex.a} − ${ex.b}`}
            </button>
          ))}
        </div>
      )}
      <p className="lab-note lab-task">{`${example.a} − ${example.b} — წაიღე ${example.b} დაფიდან.`}</p>
      <BuildMat counts={counts} onChange={setCounts} label="გამოკლების დაფა" max={20} allowRegroup />
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={taken || !canTake} onClick={takeAway}>
          წაიღე {example.b}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => reset()}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {!taken
          ? borrow
            ? `${countsText(counts)} = ${total}. ერთეულები (${counts.ones}) ნაკლებია, ვიდრე ${digits2(example.b).ones}: ჯერ 1 ათეული დაშალე 10 ერთეულად.`
            : `${countsText(counts)} = ${total}. შეგიძლია წაიღო ${example.b}.`
          : total === target
            ? `✓ დარჩა ${total}. ${example.a} − ${example.b} = ${target}.`
            : `დარჩა ${total}. შეამოწმე: ${example.a} − ${example.b} = ${target}.`}
      </p>
      <p className="lab-facts">
        <span>ათეულები: {counts.tens}</span>
        <span>ერთეულები: {counts.ones}</span>
        <span>დარჩა: {total}</span>
      </p>
      <p className="lab-fact-check">{borrow ? 'ერთეულების ციფრი მცირეა — ამიტომ საჭიროა ერთი ათეულის დაშლა.' : 'ერთეულების ციფრი საკმარისია — დაშლა არ არის საჭირო.'}</p>
    </div>
  );
}

// ─────────────────────────── the columns lab ───────────────────────────

/** Build a two-digit sum or difference in columns and see whether a carry or a broken ten is needed. */
export function ColumnsLab({ tool }: { tool: ToolOf<'columns-lab'> }) {
  const examples = tool.examples.length > 0 ? tool.examples : [{ a: 34, b: 28, op: 'add' as const }];
  const [which, setWhich] = useState(0);
  const ex = examples[which];
  const isAdd = ex.op === 'add';
  const carry = isAdd && needsCarry(ex.a, ex.b);
  const borrow = !isAdd && needsBorrow(ex.a, ex.b);
  return (
    <div className="lab lab-cols">
      <div className="xt-modes" role="group" aria-label="მაგალითის არჩევა">
        {examples.map((e, i) => (
          <button key={`${e.a}-${e.b}-${e.op}`} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => setWhich(i)}>
            {`${e.a} ${e.op === 'add' ? '+' : '−'} ${e.b}`}
          </button>
        ))}
      </div>
      {isAdd ? <SumColumns a={ex.a} b={ex.b} showAnswer showCarry /> : <DifferenceColumns a={ex.a} b={ex.b} showAnswer showBorrow />}
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {isAdd
          ? carry
            ? `ერთეულები: ${digits2(ex.a).ones} + ${digits2(ex.b).ones} = ${digits2(ex.a).ones + digits2(ex.b).ones}. 10 ან მეტია — 1 ათეული გადადის; ათეულებში ${digits2(ex.a).tens} + ${digits2(ex.b).tens} + 1 = ${sumTens(ex.a, ex.b)}.`
            : `ერთეულები: ${digits2(ex.a).ones} + ${digits2(ex.b).ones} = ${digits2(ex.a).ones + digits2(ex.b).ones}. 10-ზე ნაკლებია — გადატანა არ არის; ათეულები: ${digits2(ex.a).tens} + ${digits2(ex.b).tens} = ${sumTens(ex.a, ex.b)}.`
          : borrow
            ? `ერთეულები: ${digits2(ex.a).ones} < ${digits2(ex.b).ones}. 1 ათეული იშლება: ${digits2(ex.a).ones + 10} − ${digits2(ex.b).ones} = ${digits2(ex.a).ones + 10 - digits2(ex.b).ones}.`
            : `ერთეულები: ${digits2(ex.a).ones} ≥ ${digits2(ex.b).ones}. დაშლა არ სჭირდება: ${digits2(ex.a).ones} − ${digits2(ex.b).ones} = ${digits2(ex.a).ones - digits2(ex.b).ones}.`}
      </p>
      <p className="lab-facts">
        <span>{isAdd ? 'ჯამი' : 'სხვაობა'}: {isAdd ? columnSum(ex.a, ex.b) : columnDifference(ex.a, ex.b)}</span>
        <span>{isAdd ? (carry ? 'ათეული გადადის' : 'გადატანა არ არის') : borrow ? 'ათეული იშლება' : 'დაშლა არ არის'}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the story lab ───────────────────────────

/** Read a story, act it out with the model, choose the operation and check the answer. */
export function StoryLab({ tool }: { tool: ToolOf<'story-lab'> }) {
  const stories = tool.stories.length > 0 ? tool.stories : [{ kind: 'join' as const, text: 'მაღაზიაში 24 ბურთი იყო. მოიტანეს კიდევ 13. რამდენი ბურთია ახლა?', a: 24, b: 13, unit: 'ბურთი' }];
  const [which, setWhich] = useState(0);
  const [choice, setChoice] = useState<'add' | 'subtract' | null>(null);
  const [answer, setAnswer] = useState('');
  const story = stories[which];
  const real = story.kind === 'separate' ? story.a - story.b : story.a + story.b;
  const right = choice === (story.kind === 'separate' ? 'subtract' : 'add') && Number(answer) === real && answer !== '';
  const reset = (i = which) => {
    setWhich(i);
    setChoice(null);
    setAnswer('');
  };
  return (
    <div className="lab lab-story">
      <div className="xt-modes" role="group" aria-label="ამოცანის არჩევა">
        {stories.map((s, i) => (
          <button key={s.text} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => reset(i)}>
            {`ამოცანა ${i + 1}`}
          </button>
        ))}
      </div>
      <blockquote className="stb-story">{story.text}</blockquote>
      <div className="stb-model">
        <Blocks value={story.a} tone="a" noun="თავიდან" />
        <span className="stb-op" aria-hidden="true">
          {story.kind === 'separate' ? '−' : '+'}
        </span>
        <Blocks value={story.b} tone="b" noun={story.kind === 'separate' ? 'გატანილი' : 'დამატებული'} />
      </div>
      <div className="stb-pick" role="radiogroup" aria-label="მოქმედების არჩევა">
        {(['add', 'subtract'] as const).map((op) => (
          <label key={op} className={`lp-choice ${choice === op ? 'is-selected' : ''}`}>
            <input type="radio" name="lab-story-op" value={op} checked={choice === op} onChange={() => setChoice(op)} />
            <span className="lp-choice-dot" aria-hidden="true" />
            <span className="lp-choice-text">{op === 'add' ? 'შეკრება (+)' : 'გამოკლება (−)'}</span>
          </label>
        ))}
      </div>
      <label className="stb-slot">
        <span>პასუხი ({story.unit})</span>
        <input type="text" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value.replace(/[^\d]/g, ''))} aria-label="პასუხი რიცხვით" />
      </label>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => reset()}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {right
          ? `✓ სწორია: ${story.a} ${story.kind === 'separate' ? '−' : '+'} ${story.b} = ${real} ${story.unit}.`
          : choice === null
            ? 'ჯერ აირჩიე მოქმედება: ემატება თუ აკლდება?'
            : choice === (story.kind === 'separate' ? 'subtract' : 'add')
              ? 'მოქმედება სწორია. ახლა ჩაწერე პასუხი.'
              : 'მოქმედება არასწორია: შეხედე, იზრდება რაოდენობა თუ მცირდება.'}
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** A sum told one step at a time: the ones, the carry (when there is one), the tens, the total. */
export function SumDemo({ block }: { block: Block<'sum-demo'> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const carry = carriedTen(block.a, block.b);
  return (
    <figure className="demo demo-sum">
      <span className="demo-badge">{block.mode === 'carry' ? '+ (გადატანით)' : '+ (გადატანის გარეშე)'}</span>
      <SumColumns a={block.a} b={block.b} showAnswer={frame >= 2} showCarry />
      <ol className="demo-bars" aria-label="ნაბიჯები">
        {block.steps.map((text, i) => (
          <li key={text} className={i === frame ? 'is-on' : i < frame ? 'is-done' : ''}>
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      <p className="demo-rule">
        {`${block.a} + ${block.b} = ${columnSum(block.a, block.b)}`}
        {carry ? ' · ერთეულები 10-ს აღემატება, ამიტომ 1 ათეული გადადის' : ' · ერთეულები 10-ზე ნაკლებია, გადატანა არ არის'}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A difference told one step at a time, naming the broken ten when there is one. */
export function DifferenceDemo({ block }: { block: Block<'difference-demo'> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const borrow = needsBorrow(block.a, block.b);
  return (
    <figure className="demo demo-diff">
      <span className="demo-badge">{block.mode === 'borrow' ? '− (დაშლით)' : '− (დაშლის გარეშე)'}</span>
      <DifferenceColumns a={block.a} b={block.b} showAnswer={frame >= 2} showBorrow />
      <ol className="demo-bars" aria-label="ნაბიჯები">
        {block.steps.map((text, i) => (
          <li key={text} className={i === frame ? 'is-on' : i < frame ? 'is-done' : ''}>
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}
      </div>
      <p className="demo-rule">
        {`${block.a} − ${block.b} = ${columnDifference(block.a, block.b)}`}
        {borrow
          ? ` · ერთეულები ${digits2(block.a).ones} < ${digits2(block.b).ones}, ამიტომ 1 ათეული იშლება 10 ერთეულად`
          : ' · ერთეულების ციფრი საკმარისია, დაშლა არ სჭირდება'}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A story acted out in four frames, ending on the number sentence that solves it. */
export function SumStoryDemo({ block }: { block: Block<'story-demo2'> }) {
  const { frame, done, replay, step } = useStepper(block.steps.length);
  const isSeparate = block.kind === 'separate';
  const total = isSeparate ? block.a - block.b : block.a + block.b;
  return (
    <figure className="demo demo-story2">
      <span className="demo-badge">{isSeparate ? 'გამოკლება' : 'შეკრება'}</span>
      <blockquote className="stb-story">{block.text}</blockquote>
      <div className="stb-model">
        <Blocks value={block.a} tone="a" noun="თავიდან" />
        <span className="stb-op" aria-hidden="true">
          {isSeparate ? '−' : '+'}
        </span>
        <Blocks value={block.b} tone="b" noun={isSeparate ? 'გატანილი' : 'დამატებული'} />
      </div>
      {frame >= 2 && (
        <p className="demo-rule" role="status" aria-live="polite">
          {`${block.a} ${isSeparate ? '−' : '+'} ${block.b} = ${total} ${block.unit}`}
        </p>
      )}
      <ol className="demo-bars" aria-label="ნაბიჯები">
        {block.steps.map((text, i) => (
          <li key={text} className={i === frame ? 'is-on' : i < frame ? 'is-done' : ''}>
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-step">{block.steps[Math.min(frame, block.steps.length - 1)] ?? ''}</div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** A number-line picture of a sum or difference, used in explanations. */
export function SumLinePicture({ a, b, min, max, op }: { a: number; b: number; min: number; max: number; op: 'add' | 'subtract' }) {
  return <SumLine a={a} b={b} min={min} max={max} op={op} />;
}

/** How the picture and the columns agree: both computed from the two numbers. */
export const columnsAgree = (a: number, b: number, op: 'add' | 'subtract'): boolean => (op === 'add' ? columnSum(a, b) === a + b : columnDifference(a, b) === a - b);

/** A quick check of a subtraction, as the unit teaches it: add the difference back. */
export const checkSum = (a: number, b: number, answer: number): string => `${b} + ${answer} = ${b + answer}${b + answer === a ? ' ✓' : ` ≠ ${a}`}`;

/** The ten that a place has to exchange, spelled out for the lab's caption. */
export const exchangeNote = (counts: DigitCounts): string => {
  const next = exchange(counts, 'ones');
  return next ? `${countsText(counts)} → ${countsText(next)} (მნიშვნელობა იგივეა)` : countsText(counts);
};

/** The value of a set of blocks, so a lab never states a number its blocks do not make. */
export const blockValue = (counts: DigitCounts): number => valueOfBlocks(counts);

/** The standard blocks of a number, for a lab's starting mat. */
export const standardBlocks = (n: number): DigitCounts => digitsOf(n);

/** `parse` a mat store, for the labs that reset themselves. */
export const readCounts = (text: string): DigitCounts => parseCounts(text);

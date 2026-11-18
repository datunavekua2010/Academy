import { useEffect, useState } from 'react';
import type { ExplainBlock, ExploreTool, ResponseSpec, Verdict, VisualSpec } from '../types';
import { NumberLine } from './NumberLine';
import { ObjectField } from './Objects';
import { TakeAwayBoard } from './TakeAwayBoard';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Number-line jumps (Grade 1 · Unit 4): the answer board, the picture, the explore tool and the
 * demonstration. The marker's position is always `start ± jumps`, computed from the numbers, so the
 * marker, the arcs, the objects and the equation can never disagree.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

/** Where the marker stands after `count` jumps from `start`. */
export const landing = (start: number, count: number, forward: boolean): number => start + (forward ? count : -count);

/** The numbers visited, from the start to the landing. */
export const pathOf = (start: number, count: number, forward: boolean): number[] => Array.from({ length: count + 1 }, (_, i) => landing(start, i, forward));

const unitWord = (n: number): string => `${n} ნახტომი`;

// ───────────────────────── picture ─────────────────────────

export function JumpLinePicture({ spec }: { spec: Extract<VisualSpec, { type: 'jump-line' }> }) {
  const forward = spec.direction === 'forward';
  const end = landing(spec.from, spec.count, forward);
  const path = pathOf(spec.from, spec.count, forward);
  return (
    <NumberLine
      min={spec.min}
      max={spec.max}
      start={spec.from}
      hops={path}
      unlabelled={spec.hideLanding ? [end] : []}
      pins={spec.hideLanding ? [{ value: end, label: '?' }] : []}
      ariaLabel={`რიცხვითი ღერძი: დასაწყისი ${spec.from}, ${unitWord(spec.count)} ${forward ? 'მარჯვნივ' : 'მარცხნივ'}${spec.hideLanding ? '' : `, ბოლო რიცხვი ${end}`}`}
    />
  );
}

// ───────────────────────── answer board ─────────────────────────

interface BoardProps {
  response: Extract<ResponseSpec, { type: 'jumps' }>;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}

const parseJumps = (value: string, response: BoardProps['response']): { start: number | null; count: number } => {
  const [s, c] = value.split(',');
  const start = s === undefined || s === '' ? (response.pickStart ? null : response.from) : Number(s);
  return { start: start !== null && Number.isFinite(start) ? start : null, count: Math.max(0, Number(c ?? 0) || 0) };
};

export function JumpBoard({ response, value, onChange, disabled, verdict, label }: BoardProps) {
  const forward = response.direction === 'forward';
  const { start, count } = parseJumps(value, response);
  const [review, setReview] = useState<number | null>(null);

  // A wrong answer: the marker goes back to the start and the jumps are counted again, one by one.
  useEffect(() => {
    if (verdict !== 'incorrect') {
      setReview(null);
      return undefined;
    }
    setReview(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setReview(n);
      if (n >= count) window.clearInterval(id);
    }, 650);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verdict]);

  const shown = review !== null ? Math.min(review, count) : count;
  const position = start === null ? null : landing(start, shown, forward);
  const room = start === null ? 0 : forward ? response.max - start - count : start - count - response.min;
  const choosing = Boolean(response.pickStart) && count === 0 && !disabled;
  const write = (s: number | null, c: number) => onChange(s === null ? '' : `${s},${c}`);
  const hasReview = review !== null && count > 0;

  return (
    <div className="jb">
      <NumberLine
        min={response.min}
        max={response.max}
        value={position}
        start={start}
        labelled={response.labelled}
        hops={start === null ? [] : pathOf(start, shown, forward)}
        highlight={hasReview ? [response.from, response.from] : undefined}
        onChange={choosing ? (n) => write(n, 0) : undefined}
        ariaLabel={`${label}. რიცხვითი ღერძი ${response.min}-დან ${response.max}-მდე`}
      />
      {response.pickStart && start === null && !disabled && <p className="xt-note">შეეხე რიცხვს ღერძზე, საიდანაც დაიწყებ.</p>}
      <div className="jb-bar">
        <button type="button" className="btn btn-primary jb-jump" disabled={disabled || start === null || room <= 0} onClick={() => write(start, count + 1)}>
          {forward ? 'ნახტომი წინ ▶' : '◀ ნახტომი უკან'}
        </button>
        <button type="button" className="btn btn-ghost" disabled={disabled || count === 0} onClick={() => write(start, count - 1)} aria-label="ბოლო ნახტომის გაუქმება">
          ↶ გაუქმება
        </button>
        <button type="button" className="btn btn-ghost" disabled={disabled || (count === 0 && (start === null || !response.pickStart))} onClick={() => onChange('')}>
          ↻ თავიდან
        </button>
      </div>
      <output className="objs-count jb-count" aria-live="polite">
        {start === null ? 'დასაწყისი ჯერ არ აგირჩევია' : `დასაწყისი: ${start} · ნახტომები: ${shown}`}
        {response.showLanding !== false && start !== null && shown > 0 && !hasReview && (
          <>
            {' '}· ახლა: <strong>{position}</strong>
          </>
        )}
      </output>
      {hasReview && (
        <p className="jb-review" role="status" aria-live="polite">
          ისევ დავთვალოთ ერთად, დასაწყისიდან: {Array.from({ length: Math.min(review, count) }, (_, i) => i + 1).join(', ') || 'ვიწყებთ'}
        </p>
      )}
    </div>
  );
}

// ───────────────────────── explore ─────────────────────────

const ChevronLeft = '◀';

export function JumpExplore({ spec }: { spec: ToolOf<'jump-line'> }) {
  const forward = spec.direction === 'forward';
  const [ei, setEi] = useState(0);
  const [from, setFrom] = useState<'a' | 'b'>('a');
  const [plan, setPlan] = useState(1);
  const [done, setDone] = useState(0);
  const [running, setRunning] = useState(false);
  const ex = spec.examples[ei];
  const start = forward && from === 'b' ? ex.b : ex.a;
  const other = forward ? (from === 'a' ? ex.b : ex.a) : ex.b;
  const room = forward ? spec.max - start : start - spec.min;
  const choices = Array.from({ length: Math.min(9, room) }, (_, i) => i + 1);
  const pos = landing(start, done, forward);
  const path = pathOf(start, done, forward);

  useEffect(() => {
    if (!running) return undefined;
    if (done >= plan) {
      setRunning(false);
      return undefined;
    }
    const id = window.setTimeout(() => setDone((d) => d + 1), 650);
    return () => window.clearTimeout(id);
  }, [running, done, plan]);

  const restart = () => {
    setDone(0);
    setRunning(false);
  };
  const pickExample = (i: number) => {
    setEi(i);
    setFrom('a');
    setPlan(1);
    restart();
  };
  const pickStart = (f: 'a' | 'b') => {
    setFrom(f);
    setPlan(1);
    restart();
  };
  const go = () => {
    setDone(0);
    setRunning(true);
  };
  const once = () => {
    const n = Math.min(done + 1, choices.length);
    setPlan(Math.max(plan, n));
    setDone(n);
    setRunning(false);
  };

  const sign = forward ? '+' : '−';
  const finished = done > 0 && done === other;
  let note: string;
  if (done === 0) note = forward ? `დასაწყისი: ${start}. აირჩიე, რამდენი ნახტომი გააკეთო, და დააჭირე „გადახტომას“.` : `დასაწყისი: ${start}. აირჩიე, რამდენი ნახტომი გააკეთო უკან, და დააჭირე „გადახტომას“.`;
  else if (!finished) note = `ახლა ${pos}-ზე ვართ. ${forward ? 'ნახტომების რაოდენობა უნდა ემთხვეოდეს იმ რიცხვს, რომელსაც ვუმატებთ.' : 'ნახტომების რაოდენობა უნდა ემთხვეოდეს იმ რიცხვს, რომელსაც ვაკლებთ.'}`;
  else if (forward) note = start < other ? `${ex.a} + ${ex.b} = ${pos}. ჯამი იგივეა, მაგრამ ამჯერად მეტი ნახტომი დაგჭირდა. დიდი რიცხვიდან დაწყება უფრო მოკლე გზაა.` : `${ex.a} + ${ex.b} = ${pos}. დიდი რიცხვიდან დავიწყეთ და ნახტომიც ცოტა გვჭირდებოდა.`;
  else note = `${ex.a} − ${ex.b} = ${pos}. ${ex.b} ნახტომი უკან ნიშნავს, რომ ${ex.b} გამოვაკელით.`;

  return (
    <div className="xt jx">
      {spec.examples.length > 1 && (
        <div className="xt-modes" role="group" aria-label="მაგალითის არჩევა">
          {spec.examples.map((e, i) => (
            <button key={i} type="button" className={`xt-mode ${i === ei ? 'is-on' : ''}`} aria-pressed={i === ei} onClick={() => pickExample(i)}>
              {e.a} {sign} {e.b}
            </button>
          ))}
        </div>
      )}
      {forward && (
        <div className="xt-modes" role="group" aria-label="საიდან დავიწყოთ">
          <button type="button" className={`xt-mode ${from === 'a' ? 'is-on' : ''}`} aria-pressed={from === 'a'} onClick={() => pickStart('a')}>
            დავიწყო {ex.a}-დან
          </button>
          <button type="button" className={`xt-mode ${from === 'b' ? 'is-on' : ''}`} aria-pressed={from === 'b'} onClick={() => pickStart('b')}>
            დავიწყო {ex.b}-დან
          </button>
        </div>
      )}
      <NumberLine min={spec.min} max={spec.max} value={pos} start={start} hops={path} ariaLabel={`რიცხვითი ღერძი ${spec.min}-დან ${spec.max}-მდე. დასაწყისი ${start}. გაკეთებულია ${unitWord(done)}`} />
      <div className="xt-modes" role="group" aria-label="ნახტომების რაოდენობა">
        <span className="jx-label">ნახტომები:</span>
        {choices.map((n) => (
          <button key={n} type="button" className={`xt-mode xt-num ${n === plan ? 'is-on' : ''}`} aria-pressed={n === plan} aria-label={unitWord(n)} onClick={() => { setPlan(n); restart(); }}>
            {n}
          </button>
        ))}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-primary xt-big" onClick={go} disabled={running || choices.length === 0}>
          {forward ? 'გადახტომა ▶' : `${ChevronLeft} გადახტომა`}
        </button>
        <button type="button" className="btn btn-ghost" onClick={once} disabled={running || done >= choices.length}>
          ერთი ნახტომი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setPlan(1); setFrom('a'); restart(); }}>
          ↻ თავიდან
        </button>
      </div>
      <p className="jx-eq" role="status" aria-live="polite">
        <span>
          {start} {sign} {done}
        </span>
        <span aria-hidden="true">=</span>
        <strong>{pos}</strong>
        <span className="jx-chain">{path.join(' → ')}</span>
      </p>
      {forward ? (
        <ObjectField count={start + done} glyph={spec.glyph} layout="rows" counted={Array.from({ length: done }, (_, i) => start + i)} extras={new Set(Array.from({ length: done }, (_, i) => start + i))} label={`საგნები: ${start} და ${done} დამატებული`} />
      ) : (
        <TakeAwayBoard total={start} glyph={spec.glyph} removed={Array.from({ length: done }, (_, i) => start - 1 - i)} showRemaining label="ობიექტები" />
      )}
      <p className="xt-note" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}

// ───────────────────────── demonstration ─────────────────────────

export function JumpDemo({ block }: { block: Block<'jump-demo'> }) {
  const forward = block.mode === 'on';
  const { frame, done, replay, step } = useStepper(block.count + 3, 1100);
  // frames — on: start, keep in mind, jump 1…n, read.  back: start, jump 1…n, stop, read.
  const jumps = forward ? Math.min(Math.max(frame - 1, 0), block.count) : Math.min(frame, block.count);
  const reading = frame === block.count + 2;
  const stepAt = forward ? (frame === 0 ? 0 : frame === 1 ? 1 : reading ? 3 : 2) : frame === 0 ? 0 : frame <= block.count ? 1 : reading ? 3 : 2;
  const pos = landing(block.from, jumps, forward);
  const status = frame === 0 ? `დავიწყოთ ${block.from}-დან.` : reading ? `ვკითხულობთ ბოლო რიცხვს: ${pos}.` : jumps === 0 ? `${block.from} გვახსოვს.` : `ნახტომი ${jumps}: ვართ ${pos}-ზე.`;
  return (
    <figure className="demo jd">
      <NumberLine
        min={block.min}
        max={block.max}
        value={pos}
        start={block.from}
        highlight={frame <= (forward ? 1 : 0) || reading ? [reading ? pos : block.from, reading ? pos : block.from] : undefined}
        hops={pathOf(block.from, jumps, forward)}
        ariaLabel={`მარკერი ${block.from}-დან ${forward ? 'წინ' : 'უკან'} ${unitWord(block.count)}`}
      />
      <div className="jd-chips" aria-hidden="true">
        {frame >= 1 && forward && <span className="jd-chip">გახსოვდეს: {block.from}</span>}
        <span className="jd-chip is-eq">
          {block.from} {forward ? '+' : '−'} {jumps} = {pos}
        </span>
      </div>
      {forward ? (
        <ObjectField count={block.from + jumps} glyph={block.glyph} layout="rows" counted={Array.from({ length: jumps }, (_, i) => block.from + i)} extras={new Set(Array.from({ length: jumps }, (_, i) => block.from + i))} label="საგნები" />
      ) : (
        <TakeAwayBoard total={block.from} glyph={block.glyph} removed={Array.from({ length: jumps }, (_, i) => block.from - 1 - i)} showRemaining label="საგნები" />
      )}
      <ol className="jd-steps">
        {block.steps.map((text, i) => (
          <li key={i} className={`${i === stepAt ? 'is-active' : ''} ${i < stepAt ? 'is-done' : ''}`} aria-current={i === stepAt ? 'step' : undefined}>
            {text}
          </li>
        ))}
      </ol>
      <div className="demo-status" role="status" aria-live="polite">
        {status}
      </div>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

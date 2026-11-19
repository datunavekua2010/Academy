import { useState } from 'react';
import type { ExploreTool, ExplainBlock } from '../types';
import { NumberLine } from './NumberLine';
import { SequenceRow, useStepper, DemoButtons } from './Visuals';
import { GroupCount, SequenceFillBoard, SequencePicture } from './PatternBoard';
import { holeValues, onesDigits, ruleText, sequenceOf, stepSign, stepWords, termAt, withHoles } from './PatternGeometry';
import { PLACE_NAME, digitsOf, valueAt, type Place } from './PlaceValueGeometry';

/**
 * Exploration labs and step-by-step demonstrations for G2 U02. Every number shown is computed from the lane's start and
 * step (`PatternGeometry`), so the marker, the caption and the rule can never disagree.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

const WALKER = { rabbit: '🐇', frog: '🐸', kangaroo: '🦘' } as const;

// ─────────────────────────── the skip-count lab ───────────────────────────

/** A character rides the line in jumps of the chosen step; each landing is highlighted and named. */
export function SkipLab({ tool }: { tool: ToolOf<'skip-lab'> }) {
  const steps = tool.steps.length > 0 ? tool.steps : [2];
  const [stepIdx, setStepIdx] = useState(0);
  const [hops, setHops] = useState(0);
  const step = steps[stepIdx];
  const landings = sequenceOf(tool.start, step, tool.landings + 1);
  const here = termAt(tool.start, step, hops);
  const min = Math.min(...landings);
  const max = Math.max(...landings);
  const walker = tool.walker ?? 'rabbit';
  const atEnd = hops >= tool.landings;
  const note = hops === 0 ? `დასაწყისი: ${tool.start}. ღილაკით გადადგი ${stepSign(step)}-ობით.` : `${hops} ნახტომი · ახლა: ${here} · ${ruleText(step)}`;
  return (
    <div className="lab lab-skip">
      <div className="xt-modes" role="group" aria-label="ნაბიჯის არჩევა">
        {steps.map((s, i) => (
          <button key={s} type="button" className={`xt-mode ${i === stepIdx ? 'is-on' : ''}`} aria-pressed={i === stepIdx} onClick={() => { setStepIdx(i); setHops(0); }}>
            {`${stepSign(s)} ნაბიჯი`}
          </button>
        ))}
      </div>
      <NumberLine min={min} max={max} value={here} start={tool.start} hops={landings.slice(0, hops + 1)} labelled={landings} ariaLabel="ნახტომების ღერძი" />
      <p className="lab-walk" aria-hidden="true">
        {landings.map((n, i) => (
          <span key={n} className={`skb-stop ${i < hops ? 'is-past' : ''} ${i === hops ? 'is-here' : ''}`}>
            {i === hops ? WALKER[walker] : '·'}
            <small>{i <= hops ? n : ''}</small>
          </span>
        ))}
      </p>
      <div className="xt-row">
        <button type="button" className="btn btn-primary xt-big" disabled={atEnd} onClick={() => setHops((h) => h + 1)}>
          {step > 0 ? `ნახტომი +${step} ▶` : `◀ ნახტომი −${Math.abs(step)}`}
        </button>
        <button type="button" className="btn btn-ghost" disabled={hops === 0} onClick={() => setHops(0)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {note}
      </p>
      <p className="lab-facts">
        <span>დასაწყისი: {tool.start}</span>
        <span>ნაბიჯი: {stepSign(step)}</span>
        <span>ნახტომები: {hops}</span>
        <span>ახლა: {here}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── groups of ten ───────────────────────────

/** Add or remove a group of ten and watch the number, its tens and its hundreds digits change. */
export function TenGroupsLab({ tool }: { tool: ToolOf<'ten-groups-lab'> }) {
  const groups = Math.max(1, tool.groups);
  const [count, setCount] = useState(Math.min(groups, 3));
  const value = tool.start + count * tool.step;
  const digits = digitsOf(Math.max(0, Math.min(999, value)));
  const before = digitsOf(Math.max(0, Math.min(999, value - tool.step)));
  const changed: Place | null = digits.tens !== before.tens ? 'tens' : digits.hundreds !== before.hundreds ? 'hundreds' : null;
  return (
    <div className="lab lab-ten">
      <GroupCount size={10} groups={count} noun="ათეული" />
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={count >= groups} onClick={() => setCount((c) => c + 1)}>
          +10 ჯგუფი
        </button>
        <button type="button" className="btn btn-ghost" disabled={count === 0} onClick={() => setCount((c) => c - 1)}>
          −10 ჯგუფი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setCount(Math.min(groups, 3))}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${count} ჯგუფი × 10 = ${count * 10}; ${tool.start} + ${count * 10} = ${value}.`}
        {changed
          ? ` ${changed === 'tens' ? 'ათეულების' : 'ასეულების'} ციფრი შეიცვალა: ${before[changed]} → ${digits[changed]}. ერთეულების ციფრი არ შეიცვალა: ${digits.ones}.`
          : ` ერთეულების ციფრი არ შეიცვალა: ${digits.ones}.`}
      </p>
      <p className="lab-facts">
        <span>ასეულები: {digits.hundreds}</span>
        <span>ათეულები: {digits.tens}</span>
        <span>ერთეულები: {digits.ones}</span>
        <span>სულ: {value}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the hundreds lab ───────────────────────────

/** Put down hundreds blocks one at a time and jump along the line with them. */
export function HundredLab({ tool }: { tool: ToolOf<'hundred-lab'> }) {
  const groups = Math.max(1, tool.groups);
  const [count, setCount] = useState(1);
  const value = tool.start + count * 100;
  const landings = Array.from({ length: groups + 1 }, (_, i) => tool.start + i * 100);
  const digits = digitsOf(Math.max(0, Math.min(999, value)));
  return (
    <div className="lab lab-hundred">
      <GroupCount size={100} groups={count} noun="ასეული" />
      <NumberLine min={Math.min(...landings)} max={Math.max(...landings)} value={value} start={tool.start} hops={landings.slice(0, count + 1)} labelled={landings} ariaLabel="ასეულებით თვლის ღერძი" />
      <div className="xt-row">
        <button type="button" className="btn btn-primary" disabled={count >= groups} onClick={() => setCount((c) => c + 1)}>
          +100 კიდევ ერთი ბრტყელი ფილა
        </button>
        <button type="button" className="btn btn-ghost" disabled={count === 0} onClick={() => setCount((c) => c - 1)}>
          −100 ფილის წაღება
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setCount(1)}>
          ↻ თავიდან
        </button>
      </div>
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {`${count} ასეული + ${tool.start} = ${value}. ასეულების ციფრი ${digits.hundreds}-ია; ათეულები და ერთეულები იგივე რჩება.`}
      </p>
      <p className="lab-facts">
        <span>ასეულები: {digits.hundreds}</span>
        <span>ათეულები: {digits.tens}</span>
        <span>ერთეულები: {digits.ones}</span>
        <span>სულ: {value}</span>
      </p>
    </div>
  );
}

// ─────────────────────────── the pattern lab ───────────────────────────

/** Find the rule, then fill the blanks with it. The blanks are checked against the numbers, not the student's guess. */
export function PatternLab({ tool }: { tool: ToolOf<'pattern-lab'> }) {
  const patterns = tool.patterns.length > 0 ? tool.patterns : [{ start: 3, step: 2, count: 7, holes: [4, 6] }];
  const [which, setWhich] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [values, setValues] = useState('');
  const pattern = patterns[which];
  const numbers = sequenceOf(pattern.start, pattern.step, pattern.count);
  const wanted = holeValues(numbers, pattern.holes);
  const typed = values ? values.split(',').map((v) => Number(v.trim())) : [];
  const filled = typed.length >= wanted.length && typed.every((v) => v !== 0 && Number.isFinite(v));
  const right = filled && wanted.every((v, i) => typed[i] === v);
  const shown = numbers.map((n, i) => (pattern.holes.includes(i) && !(filled && right) ? null : n));
  const reset = (i: number) => {
    setWhich(i);
    setValues('');
    setRevealed(false);
  };
  return (
    <div className="lab lab-pattern">
      <div className="xt-modes" role="group" aria-label="მიმდევრობის არჩევა">
        {patterns.map((p, i) => (
          <button key={`${p.start}-${p.step}`} type="button" className={`xt-mode ${i === which ? 'is-on' : ''}`} aria-pressed={i === which} onClick={() => reset(i)}>
            {`მიმდევრობა ${i + 1}`}
          </button>
        ))}
      </div>
      <div className="seq-scroll">
        <SequenceRow items={shown} arrows={right ? stepSign(pattern.step) : '?'} />
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setRevealed(true)} disabled={revealed}>
          ნახე წესი
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => { setValues(''); setRevealed(false); }}>
          ↻ თავიდან
        </button>
      </div>
      <SequenceFillBoard
        response={{ start: pattern.start, step: pattern.step, count: pattern.count, holes: revealed ? pattern.holes.map((h) => h) : pattern.holes }}
        value={values}
        onChange={setValues}
        disabled={revealed}
        label="გამოტოვებული რიცხვები"
      />
      <p className="lab-note lab-status" role="status" aria-live="polite">
        {revealed
          ? `${ruleText(pattern.step)}: ${numbers.join(', ')}.`
          : right
            ? `✓ შენ იპოვე წესი: ${ruleText(pattern.step)}.`
            : filled
              ? 'ჯერ არ არის. შეადარე ორ მეზობელ რიცხვს: რამდენით იცვლება?'
              : 'შეავსე გამოტოვებული რიცხვები.'}
      </p>
    </div>
  );
}

// ─────────────────────────── demonstrations ───────────────────────────

/** The landings of a skip-count, one frame at a time, with the rule named on the last frame. */
export function SkipDemo({ block }: { block: Block<'skip-demo'> }) {
  const landings = sequenceOf(block.start, block.step, block.count);
  const { frame, done, replay, step } = useStepper(landings.length);
  const shown = landings.slice(0, frame + 1);
  const min = Math.min(...landings);
  const max = Math.max(...landings);
  const walker = block.walker ?? 'rabbit';
  return (
    <figure className="demo demo-skip">
      <span className="demo-badge">{block.mode === 'forward' ? 'წინ თვლა ▶' : '◀ უკან თვლა'}</span>
      <NumberLine min={min} max={max} value={landings[frame]} start={block.start} hops={shown} labelled={landings} ariaLabel="ნახტომების ღილაკები" />
      <p className="demo-walk" aria-hidden="true">
        {landings.map((n, i) => (
          <span key={n} className={`skb-stop ${i < frame ? 'is-past' : ''} ${i === frame ? 'is-here' : ''}`}>
            {i === frame ? WALKER[walker] : '·'}
            <small>{i <= frame ? n : ''}</small>
          </span>
        ))}
      </p>
      <div className="demo-step" role="status" aria-live="polite">
        {block.steps[Math.min(frame, block.steps.length - 1)] ?? `ახლა: ${landings[frame]}`}
      </div>
      <p className="demo-rule">
        {stepSign(block.step)} · {ruleText(block.step)} · {shown.join(', ')}
        {!done ? ` …` : ''}
      </p>
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <DemoButtons done={done} replay={replay} step={step} />
    </figure>
  );
}

/** The ones digits of a skip-count, so the pattern in them is stated rather than only seen. */
export function OnesDigitStrip({ numbers, highlight }: { numbers: number[]; highlight?: number }) {
  const ones = onesDigits(numbers);
  return (
    <p className="ods" aria-label={`ერთეულების ციფრები: ${ones.join(', ')}`}>
      {ones.map((d, i) => (
        <span key={i} className={`ods-cell ${i === highlight ? 'is-on' : ''}`}>
          {d}
        </span>
      ))}
    </p>
  );
}

/** A number with one place named, for the counting-by-ten/hundred questions. */
export const placeValueNote = (n: number, place: Place): string => `${PLACE_NAME[place]}: ${valueAt(n, place)}`;

/** „ემატება 2“ for a rule, exposed so content can be written in the same words the tool uses. */
export const stepWordsOf = stepWords;

/** A static picture of a sequence with its rule named. */
export function PatternPicture({ start, step, count, holes }: { start: number; step: number; count: number; holes?: number[] }) {
  return <SequencePicture start={start} step={step} count={count} holes={holes} />;
}

/** Numbers with holes, for a picture that should not give the rule away. */
export const maskedSequence = (start: number, step: number, count: number, holes: number[]): Array<number | null> => withHoles(sequenceOf(start, step, count), holes);

import { useState } from 'react';
import type { ExplainBlock, ExploreTool, ResponseSpec } from '../types';
import { CounterBoard, type Counts } from './CounterBoard';
import { StepChain, type ChainCard } from './StepChain';
import { DemoButtons, useStepper } from './Visuals';

/**
 * Making ten (Grade 1 · Unit 4). The frame holds `f` counters and the rest wait outside, so the numbers on
 * screen are always `[f, a + b − f]`: moving a counter changes both, and no counter can be lost or copied.
 */

type ToolOf<K extends ExploreTool['tool']> = Extract<ExploreTool, { tool: K }>;
type Block<T extends ExplainBlock['type']> = Extract<ExplainBlock, { type: T }>;

const FRAME = 10;

const labels: [string, string, string] = ['ათიანი ჩარჩო', 'ახალი კუბიკები', ''];

/** How the second group splits once the student has moved `moved` counters in. */
export function tenSplit(a: number, b: number, inFrame: number): { moved: number; rest: number; full: boolean } {
  const moved = Math.min(b, Math.max(0, inFrame - a));
  return { moved, rest: b - moved, full: inFrame === FRAME };
}

// ───────────────────────── answer board ─────────────────────────

interface BoardProps {
  response: Extract<ResponseSpec, { type: 'make-ten' }>;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
}

export function MakeTenBoard({ response, value, onChange, disabled, label }: BoardProps) {
  const total = response.a + response.b;
  const parsed = value === '' ? response.a : Number(value);
  const inFrame = Math.min(FRAME, Math.max(0, Number.isFinite(parsed) ? parsed : response.a));
  const counts: Counts = [inFrame, total - inFrame, 0];
  return (
    <div className="mt">
      <CounterBoard
        counts={counts}
        onChange={(c) => onChange(String(c[0]))}
        disabled={disabled}
        frame={10}
        single
        capacity0={FRAME}
        dropZones={[0, 1]}
        labels={labels}
        showTotal={false}
        ariaLabel={`${label}. ჩარჩოში ${inFrame}, გარეთ ${total - inFrame}`}
      />
      <output className="objs-count" aria-live="polite">
        ჩარჩოში: <strong>{inFrame}</strong> · გარეთ: <strong>{total - inFrame}</strong>
      </output>
    </div>
  );
}

// ───────────────────────── shared chain ─────────────────────────

function tenCards(a: number, b: number, split: { moved: number; rest: number; full: boolean }, activeFrom?: number): ChainCard[] {
  const { moved, rest, full } = split;
  const active = activeFrom ?? (full ? 3 : moved > 0 ? 1 : 0);
  return [
    { label: 'დასაწყისი', text: `${a} + ${b}`, active: active === 0 },
    { label: 'ათეულამდე', text: moved > 0 || full ? `${a} + ${moved} + ${rest}` : null, active: active === 1 },
    { label: 'ათეული და დარჩენილი', text: full ? `10 + ${rest}` : null, active: active === 2 },
    { label: 'ჯამი', text: full ? String(a + b) : null, active: active === 3 },
  ];
}

// ───────────────────────── explore ─────────────────────────

export function MakeTenExplore({ spec }: { spec: ToolOf<'make-ten'> }) {
  const [ei, setEi] = useState(0);
  const ex = spec.examples[ei];
  const [inFrame, setInFrame] = useState(ex.a);
  const total = ex.a + ex.b;
  const split = tenSplit(ex.a, ex.b, inFrame);
  const pick = (i: number) => {
    setEi(i);
    setInFrame(spec.examples[i].a);
  };
  const need = FRAME - ex.a;
  const note = split.full
    ? `ჩარჩო სავსეა: 10. გამოვიყენეთ ${split.moved} კუბიკი და ${split.rest} დარჩა. 10 და ${split.rest} ერთად ${total} არის. ჯამი არ შეცვლილა.`
    : split.moved > 0
      ? `ჩარჩოში ${inFrame} კუბიკია. კიდევ ${FRAME - inFrame} ცარიელი ადგილია. გარეთ ${total - inFrame} კუბიკი დარჩა.`
      : `ჩარჩოში ${inFrame} კუბიკია. გადაიტანე გარეთ მდგარი კუბიკები ცარიელ ადგილებში: დაჭერით, ან გადათრევით.`;
  return (
    <div className="xt">
      {spec.examples.length > 1 && (
        <div className="xt-modes" role="group" aria-label="მაგალითის არჩევა">
          {spec.examples.map((e, i) => (
            <button key={i} type="button" className={`xt-mode ${i === ei ? 'is-on' : ''}`} aria-pressed={i === ei} onClick={() => pick(i)}>
              {e.a} + {e.b}
            </button>
          ))}
        </div>
      )}
      <MakeTenBoard key={ei} response={{ type: 'make-ten', a: ex.a, b: ex.b }} value={String(inFrame)} onChange={(v) => setInFrame(Number(v))} disabled={false} label={`${ex.a} + ${ex.b}`} />
      <StepChain cards={tenCards(ex.a, ex.b, split)} ariaLabel="ნაბიჯები: ათეულამდე შევავსოთ და დარჩენილი დავუმატოთ" />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => setInFrame(ex.a)}>
          ↻ თავიდან
        </button>
        <span className="xt-hint" aria-hidden="true">
          ჩარჩოს {need} ადგილი ეკლება
        </span>
      </div>
      <p className="xt-note" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}

// ───────────────────────── demonstration ─────────────────────────

export function TenDemo({ block }: { block: Block<'ten-demo'> }) {
  const { frame, done, replay, step } = useStepper(6, 1500);
  const total = block.a + block.b;
  const need = FRAME - block.a;
  const rest = total - FRAME;
  const moved = frame >= 3;
  const counts: Counts = moved ? [FRAME, rest, 0] : [block.a, block.b, 0];
  const stepAt = [0, 0, 1, 1, 2, 3][frame];
  const cards: ChainCard[] = [
    { label: 'დასაწყისი', text: `${block.a} + ${block.b}`, active: frame === 0 },
    { label: 'მეორე ჯგუფი იყოფა', text: frame >= 2 ? `${block.a} + ${need} + ${rest}` : null, active: frame === 2 || frame === 3 },
    { label: 'ათეული და დარჩენილი', text: frame >= 4 ? `10 + ${rest}` : null, active: frame === 4 },
    { label: 'ჯამი', text: frame >= 5 ? String(total) : null, active: frame === 5 },
  ];
  const status = [
    `${block.a} კუბიკი ჩარჩოშია, ${block.b} გარეთ.`,
    `ჩარჩოში ${need} ცარიელი ადგილია.`,
    `მეორე ჯგუფიდან ${need} გვჭირდება, დანარჩენი ${rest} გვრჩება.`,
    `${need} კუბიკი ჩარჩოში გადავიდა: ახლა 10-ია.`,
    `10 და ${rest} ერთად ${total} არის.`,
    `ჯამი იგივეა: ${block.a} + ${block.b} = ${total}. მეორე ჯგუფი მხოლოდ ორ ნაწილად გავყავით.`,
  ][frame];
  return (
    <figure className="demo jd">
      <CounterBoard counts={counts} onChange={() => undefined} disabled frame={10} single capacity0={FRAME} labels={labels} emphasis={frame === 1 ? 0 : frame === 2 ? 1 : null} showTotal={false} ariaLabel={`${block.a} + ${block.b}: ჩარჩოში ${counts[0]}, გარეთ ${counts[1]}`} />
      <StepChain cards={cards} ariaLabel="ნაბიჯები" />
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

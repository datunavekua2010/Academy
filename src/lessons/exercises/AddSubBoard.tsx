import { useState } from 'react';
import { NumberLine } from './NumberLine';
import { SequenceRow } from './Visuals';
import type { Verdict } from '../types';
import { COLS, COL_NAME, carriedTen, columnDifference, columnSum, digits2, needsBorrow, needsCarry, opSign, sumTens, type Col } from './AddSubGeometry';

/**
 * Pictures for G2 U03 (two-digit addition and subtraction).
 *
 * The columns board draws the two numbers one above the other, column by column, with the carry or the broken ten shown
 * in the place it belongs. Every digit comes from `AddSubGeometry`, so the picture and the algorithm are the same thing.
 */

// ─────────────────────────── the column board ───────────────────────────

/** One number written in its columns, digits aligned by place (never by how wide they look). */
function Columns({ value, tag, className = '' }: { value: number; tag?: string; className?: string }) {
  const d = digits2(value);
  return (
    <div className={`ac-row ${className}`} aria-label={`${tag ? `${tag}: ` : ''}${COL_NAME.tens} ${d.tens}, ${COL_NAME.ones} ${d.ones}`}>
      {COLS.map((col) => (
        <span key={col} className={`ac-cell is-${col}`}>
          {d[col]}
        </span>
      ))}
      {tag && <span className="ac-tag">{tag}</span>}
    </div>
  );
}

/** The carry, written small above the tens column — exactly when there really is one. */
function CarryRow({ a, b }: { a: number; b: number }) {
  const carry = carriedTen(a, b);
  return (
    <div className="ac-row ac-carry" aria-hidden={carry === 0}>
      <span className={`ac-cell is-tens ${carry ? 'is-on' : ''}`}>{carry ? carry : ''}</span>
      <span className="ac-cell is-ones" />
    </div>
  );
}

/**
 * A sum in columns: the two numbers, the line, and — when asked for — the answer with its carry. `showAnswer` is false
 * while the student is working, so the board never gives the total away.
 */
export function SumColumns({
  a,
  b,
  showAnswer = false,
  showCarry = true,
  caption,
}: {
  a: number;
  b: number;
  showAnswer?: boolean;
  showCarry?: boolean;
  caption?: string;
}) {
  const carry = carriedTen(a, b);
  return (
    <figure className="ac" aria-label={`სვეტები: ${a} + ${b}`}>
      {showCarry && showAnswer && carry > 0 && <CarryRow a={a} b={b} />}
      <Columns value={a} />
      <Columns value={b} tag="+" />
      <div className="ac-rule" aria-hidden="true" />
      {showAnswer ? (
        <Columns value={columnSum(a, b)} tag="=" className="is-total" />
      ) : (
        <div className="ac-row ac-blank" aria-label="პასუხი ჯერ არ არის დაწერილი">
          {COLS.map((col) => (
            <span key={col} className="ac-cell is-blank">
              ?
            </span>
          ))}
        </div>
      )}
      {showAnswer && carry > 0 && (
        <figcaption className="ac-note">
          ერთეულები: {digits2(a).ones} + {digits2(b).ones} = {digits2(a).ones + digits2(b).ones}. 10 ან მეტია, ამიტომ 1 ათეული გადადის ათეულებში.
        </figcaption>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** A difference in columns, with the broken ten shown when one is really needed. */
export function DifferenceColumns({ a, b, showAnswer = false, showBorrow = true, caption }: { a: number; b: number; showAnswer?: boolean; showBorrow?: boolean; caption?: string }) {
  const borrow = needsBorrow(a, b);
  const d = digits2(a);
  return (
    <figure className="ac" aria-label={`სვეტები: ${a} − ${b}`}>
      {showBorrow && showAnswer && borrow && (
        <div className="ac-row ac-borrow-hint" aria-hidden="true">
          <span className="ac-cell is-tens">
            <s>{d.tens}</s> {d.tens - 1}
          </span>
          <span className="ac-cell is-ones">
            {d.ones} + 10
          </span>
        </div>
      )}
      <Columns value={a} />
      <Columns value={b} tag="−" />
      <div className="ac-rule" aria-hidden="true" />
      {showAnswer ? (
        <Columns value={columnDifference(a, b)} tag="=" className="is-total" />
      ) : (
        <div className="ac-row ac-blank" aria-label="პასუხი ჯერ არ არის დაწერილი">
          {COLS.map((col) => (
            <span key={col} className="ac-cell is-blank">
              ?
            </span>
          ))}
        </div>
      )}
      {showAnswer && borrow && (
        <figcaption className="ac-note">
          ერთეულები: {d.ones} &lt; {digits2(b).ones}. ერთი ათეული იშლება 10 ერთეულად: {d.ones} + 10 = {d.ones + 10}, და {d.ones + 10} − {digits2(b).ones} = {d.ones + 10 - digits2(b).ones}.
        </figcaption>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

// ─────────────────────────── the blocks a sum uses ───────────────────────────

/** Tens rods and ones cubes for a number, with the count written down. */
export function Blocks({ value, tone, noun }: { value: number; tone: 'a' | 'b' | 'result'; noun?: string }) {
  const d = digits2(value);
  return (
    <div className={`abk is-${tone}`} aria-label={`${noun ?? ''} ${value}: ${d.tens} ათეული და ${d.ones} ერთეული`}>
      <div className="abk-rods" aria-hidden="true">
        {Array.from({ length: d.tens }, (_, i) => (
          <span key={i} className="abk-rod" />
        ))}
      </div>
      <div className="abk-cubes" aria-hidden="true">
        {Array.from({ length: d.ones }, (_, i) => (
          <span key={i} className="abk-cube" />
        ))}
      </div>
      <p className="abk-count">
        {d.tens} ათეული + {d.ones} ერთეული = <b>{value}</b>
      </p>
    </div>
  );
}

// ─────────────────────────── answer controls ───────────────────────────

interface ColumnAnswerProps {
  response: { a: number; b: number; op: 'add' | 'subtract'; allowRegroup?: boolean };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  label: string;
}

/**
 * The student types the tens digit and the ones digit into the answer's own columns. The store is `"tens,ones"`, so a
 * transposed answer (35 for 53) is a different answer and is caught.
 */
export function ColumnAnswer({ response, value, onChange, disabled, verdict, label }: ColumnAnswerProps) {
  const [tens = '', ones = ''] = value.split(',');
  const write = (col: Col, text: string) => {
    const clean = text.replace(/[^\d]/g, '').slice(0, 1);
    const next = col === 'tens' ? [clean, ones] : [tens, clean];
    onChange(next.join(','));
  };
  const isAdd = response.op === 'add';
  const total = isAdd ? columnSum(response.a, response.b) : columnDifference(response.a, response.b);
  const typed = tens !== '' && ones !== '' ? Number(tens) * 10 + Number(ones) : null;
  const right = typed === total;
  return (
    <div className={`aca ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <div className="aca-board" role="group" aria-label={label}>
        {isAdd ? <SumColumns a={response.a} b={response.b} showAnswer={false} /> : <DifferenceColumns a={response.a} b={response.b} showAnswer={false} />}
      </div>
      <div className="aca-answer">
        <p className="aca-title">{isAdd ? 'დაწერე ჯამი სვეტებად' : 'დაწერე სხვაობა სვეტებად'}</p>
        {COLS.map((col) => (
          <label key={col} className="aca-slot">
            <span className="aca-slot-name">{COL_NAME[col]}</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={col === 'tens' ? tens : ones}
              disabled={disabled}
              onChange={(e) => write(col, e.target.value)}
              aria-label={`პასუხის ${COL_NAME[col]}`}
            />
          </label>
        ))}
      </div>
      <output className="ac-note" aria-live="polite">
        {typed === null ? 'ჯერ არ არის სრულად დაწერილი.' : right ? `პასუხი ${typed}-ია.` : `შენ დაწერე ${typed}.`}
      </output>
    </div>
  );
}

interface StepProps {
  response: { a: number; b: number };
  onChange: (value: string) => void;
  value: string;
  disabled: boolean;
  label: string;
}

/**
 * Adding in the order the algorithm is taught: first the ones, then — only if the ones make ten or more — the carry, then
 * the tens. Each answer is a digit in its own place, and the store is `"ones,tens"`.
 */
export function SumStepsBoard({ response, onChange, value, disabled }: StepProps) {
  const [ones = '', tens = ''] = value.split(',');
  const carry = needsCarry(response.a, response.b);
  const onesReal = columnSum(response.a, response.b) % 10;
  const tensReal = sumTens(response.a, response.b);
  const write = (which: 'ones' | 'tens', text: string) => {
    const clean = text.replace(/[^\d]/g, '').slice(0, 1);
    onChange(which === 'ones' ? `${clean},${tens}` : `${ones},${clean}`);
  };
  return (
    <div className="ssb">
      <SumColumns a={response.a} b={response.b} showAnswer={false} />
      <ol className="ssb-steps">
        <li className={`ssb-step ${ones === String(onesReal) ? 'is-done' : ''}`}>
          <span className="ssb-step-text">
            ერთეულები: {digits2(response.a).ones} + {digits2(response.b).ones} = {digits2(response.a).ones + digits2(response.b).ones}
            {carry ? ' → 1 ათეული გადადის, დარჩება ' + onesReal : ''}
          </span>
          <label className="ssb-slot">
            <span>{COL_NAME.ones}</span>
            <input type="text" inputMode="numeric" maxLength={1} value={ones} disabled={disabled} onChange={(e) => write('ones', e.target.value)} aria-label={`${COL_NAME.ones} ჯამი`} />
          </label>
        </li>
        <li className={`ssb-step ${tens === String(tensReal) ? 'is-done' : ''}`}>
          <span className="ssb-step-text">
            ათეულები: {digits2(response.a).tens} + {digits2(response.b).tens}
            {carry ? ' + 1 (გადატანილი)' : ''} = {tensReal}
          </span>
          <label className="ssb-slot">
            <span>{COL_NAME.tens}</span>
            <input type="text" inputMode="numeric" maxLength={1} value={tens} disabled={disabled} onChange={(e) => write('tens', e.target.value)} aria-label={`${COL_NAME.tens} ჯამი`} />
          </label>
        </li>
      </ol>
      <p className="ac-note">
        {carry ? 'ერთეულების ჯამი 10-ს ან მეტს იძლევა — ამიტომ 1 ათეული გადადის ათეულებში.' : 'ერთეულების ჯამი 10-ზე ნაკლებია — გადატანა არ არის.'}
      </p>
    </div>
  );
}

/** Subtracting with a broken ten when one is needed: first the ten, then the answer. Stored as the answer number. */
export function DifferenceStepsBoard({ response, onChange, value, disabled }: StepProps) {
  const borrow = needsBorrow(response.a, response.b);
  const [taken, setTaken] = useState(false);
  const real = columnDifference(response.a, response.b);
  return (
    <div className="dsb">
      <DifferenceColumns a={response.a} b={response.b} showAnswer={false} />
      {borrow && (
        <button type="button" className={`btn ${taken ? 'btn-ghost' : 'btn-primary'}`} disabled={disabled || taken} onClick={() => setTaken(true)} aria-pressed={taken}>
          {taken
            ? `✓ 1 ათეული დავშალე: ${digits2(response.a).ones} + 10 = ${digits2(response.a).ones + 10}`
            : `⇄ 1 ათეული გავხსენი 10 ერთეულად (${digits2(response.a).ones} → ${digits2(response.a).ones + 10})`}
        </button>
      )}
      <label className="dsb-slot">
        <span>სხვაობა</span>
        <input
          type="text"
          inputMode="numeric"
          value={value}
          disabled={disabled || (borrow && !taken)}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
          aria-label="სხვაობა რიცხვით"
        />
      </label>
      <p className="ac-note">
        {borrow
          ? taken
            ? `ერთეულები: ${digits2(response.a).ones + 10} − ${digits2(response.b).ones} = ${digits2(response.a).ones + 10 - digits2(response.b).ones}. ათეულები: ${digits2(response.a).tens - 1} − ${digits2(response.b).tens}.`
            : 'ერთეულების ციფრი მცირეა. ჯერ გახსენი ერთი ათეული.'
          : `ერთეულები: ${digits2(response.a).ones} − ${digits2(response.b).ones} = ${digits2(response.a).ones - digits2(response.b).ones}. ათეულები: ${digits2(response.a).tens} − ${digits2(response.b).tens}.`}
        {borrow && taken ? ` სხვაობა: ${real}.` : ''}
      </p>
    </div>
  );
}

// ─────────────────────────── word problems ───────────────────────────

interface StoryProps {
  response: { kind: 'join' | 'separate' | 'compare'; a: number; b: number; story: string; unit: string };
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  label: string;
}

/**
 * A story problem: pick the operation, then write the answer. The story's numbers are shown as blocks so the student can
 * act it out; the operation is judged against what really happens to the quantities, not against the words.
 */
export function StoryBoard({ response, value, onChange, disabled, label }: StoryProps) {
  const [op = '', answer = ''] = value.split(',');
  const write = (nextOp: string, nextAnswer: string) => onChange(`${nextOp},${nextAnswer}`);
  const isSeparate = response.kind === 'separate';
  return (
    <div className="stb">
      <blockquote className="stb-story">{response.story}</blockquote>
      <div className="stb-model">
        <Blocks value={response.a} tone="a" noun="თავიდან" />
        <span className="stb-op" aria-hidden="true">
          {isSeparate ? '−' : '+'}
        </span>
        <Blocks value={response.b} tone="b" noun={isSeparate ? 'გატანილი' : 'დამატებული'} />
      </div>
      <div className="stb-pick" role="radiogroup" aria-label="რომელი მოქმედებაა საჭირო?">
        {(['add', 'subtract'] as const).map((candidate) => (
          <label key={candidate} className={`lp-choice ${op === candidate ? 'is-selected' : ''}`}>
            <input type="radio" name="stb-op" value={candidate} checked={op === candidate} disabled={disabled} onChange={() => write(candidate, answer)} />
            <span className="lp-choice-dot" aria-hidden="true" />
            <span className="lp-choice-text">{candidate === 'add' ? 'შეკრება (+)' : 'გამოკლება (−)'}</span>
          </label>
        ))}
      </div>
      <label className="stb-slot">
        <span>პასუხი ({response.unit})</span>
        <input
          type="text"
          inputMode="numeric"
          value={answer}
          disabled={disabled || op === ''}
          onChange={(e) => write(op, e.target.value.replace(/[^\d]/g, ''))}
          aria-label="პასუხი რიცხვით"
        />
      </label>
      <p className="ac-note">
        {op === ''
          ? 'ჯერ აირჩიე: ემატება რაოდენობა თუ აკლდება?'
          : op === 'add'
            ? isSeparate
              ? 'რიცხვი მცირდება — ეს გამოკლებაა.'
              : 'რაოდენობა იზრდება — ეს შეკრებაა.'
            : isSeparate
              ? 'რიცხვი მცირდება — ეს გამოკლებაა.'
              : 'რაოდენობა იზრდება — ეს შეკრებაა.'}
      </p>
      <span className="sr-only stb-answer">{`${op},${answer}`}</span>
      <span className="sr-only">{label}</span>
    </div>
  );
}

/** A story drawn as a picture, for a question that only needs the picture. */
export function StoryPicture({ a, b, kind, unit }: { a: number; b: number; kind: 'join' | 'separate' | 'compare'; unit: string }) {
  return (
    <div className="stb-model is-static" aria-label={`${a} ${unit}, ${kind === 'separate' ? `გამოაკელი ${b}` : `დაუმატე ${b}`}`}>
      <Blocks value={a} tone="a" noun="თავიდან" />
      <span className="stb-op" aria-hidden="true">
        {kind === 'separate' ? '−' : '+'}
      </span>
      <Blocks value={b} tone="b" noun={kind === 'separate' ? 'გატანილი' : 'დამატებული'} />
    </div>
  );
}

/** The answer written in columns, for a static picture. */
export function AnswerColumns({ a, b, op }: { a: number; b: number; op: 'add' | 'subtract' }) {
  return op === 'add' ? <SumColumns a={a} b={b} showAnswer /> : <DifferenceColumns a={a} b={b} showAnswer />;
}

/** A sum or difference on a number line: the first number is flagged, the second is the jump. */
export function SumLine({ a, b, min, max, op }: { a: number; b: number; min: number; max: number; op: 'add' | 'subtract' }) {
  const end = op === 'add' ? a + b : a - b;
  const steps = Math.max(1, b);
  const path = Array.from({ length: steps + 1 }, (_, i) => (op === 'add' ? a + i : a - i));
  return (
    <NumberLine
      min={min}
      max={max}
      value={end}
      start={a}
      hops={path}
      labelled={[]}
      ariaLabel={`რიცხვითი ღერძი: ${a} ${opSign(op)} ${b}`}
    />
  );
}

/** A sequence of sums shown as a picture, for "what changes?" questions. */
export function SumStrip({ sums }: { sums: Array<{ a: number; b: number }> }) {
  const items = sums.map((s) => s.a + s.b);
  return <SequenceRow items={items} arrows="?" />;
}

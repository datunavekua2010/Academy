import { useState } from 'react';
import type { LengthObject, ResponseSpec } from '../types';
import { compareGroup, kindOf, KINDS, orderOf, px, unitsIn, zeroAligned } from './MeasureGeometry';
import { AlignBoard, LengthObjectView, OBJECT_NAME, RulerBoard, UnitBoard, UnitPickBoard, describeLength } from './LengthBoard';

/**
 * Answer controls for the length lessons. Presentation only — `check.ts` decides what is right, and it decides
 * from the lengths in the question, never from how the pictures look.
 */

type AlignResponse = Extract<ResponseSpec, { type: 'align-compare' }>;
type SortResponse = Extract<ResponseSpec, { type: 'length-sort' }>;
type UnitsResponse = Extract<ResponseSpec, { type: 'measure-units' }>;
type RulerResponse = Extract<ResponseSpec, { type: 'ruler-read' }>;
type PickResponse = Extract<ResponseSpec, { type: 'unit-pick' }>;

const splitValue = (value: string | string[] | number | undefined): string[] => (typeof value === 'string' && value ? value.split(',') : []);

// ─────────────────────────── 1. align, then compare ───────────────────────────

export function AlignCompareBoard({ response, value, onChange, disabled, label }: { response: AlignResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const [, stored = ''] = value.split(',');
  // both objects start away from the line, so bringing them together is a real action, not a default
  const [starts, setStarts] = useState<[number, number]>([px(1), px(2)]);
  const on = starts[0] === 0 && starts[1] === 0;
  const emit = (next: [number, number], choice: string) => {
    setStarts(next);
    onChange(`${next[0] === 0 && next[1] === 0 ? '1' : ''},${choice}`);
  };
  const pick = (choice: string) => emit(starts, choice);
  const ask = response.ask ?? 'longer';
  const options = [
    { id: 'a', text: `პირველი — ${describeLength(response.a)}` },
    { id: 'b', text: `მეორე — ${describeLength(response.b)}` },
    { id: 'same', text: 'ორივე იგივე სიგრძისაა' },
  ];
  return (
    <div className="al-answer">
      <AlignBoard a={response.a} b={response.b} starts={starts} onStarts={(next) => emit(next, stored)} disabled={disabled} label={label} />
      <p className="al-status" role="status" aria-live="polite">
        {on ? 'ორივე საგანი საერთო დასაწყისთან დგას — ახლა შეიძლება შედარება.' : 'საგნები სხვადასხვა ადგილიდან იწყება. მიიტანე ორივე დასაწყის ხაზთან.'}
      </p>
      <div className="lp-choices al-choices" role="radiogroup" aria-label={ask === 'longer' ? 'რომელია უფრო გრძელი?' : 'რომელია უფრო მოკლე?'}>
        {options.map((option) => {
          const selected = stored === option.id;
          return (
            <label key={option.id} className={`lp-choice ${selected ? 'is-selected' : ''} ${disabled ? 'is-locked' : ''}`}>
              <input type="radio" name={label} value={option.id} checked={selected} disabled={disabled} onChange={() => pick(option.id)} />
              <span className="lp-choice-dot" aria-hidden="true" />
              <span className="lp-choice-text">{option.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────── 2. sort into three groups ───────────────────────────

export const LENGTH_GROUPS = [
  { id: 'l', label: 'უფრო გრძელი', icon: '↑' },
  { id: 's', label: 'უფრო მოკლე', icon: '↓' },
  { id: 'e', label: 'იგივე სიგრძე', icon: '＝' },
];

export function LengthSortBoard({ response, value, onChange, disabled, label }: { response: SortResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const groups = Array.from({ length: response.items.length }, (_, i) => splitValue(value)[i] ?? '');
  const [selected, setSelected] = useState<number | null>(null);
  const place = (groupId: string) => {
    if (disabled || selected === null) return;
    const next = groups.map((g, i) => (i === selected ? groupId : g));
    onChange(next.join(','));
    const after = next.findIndex((g) => !g);
    setSelected(after >= 0 ? after : null);
  };
  // a card always stays selected once tapped: a second tap must never quietly undo the choice
  const pick = (i: number) => {
    if (disabled) return;
    setSelected(i);
  };
  const open = groups.map((g, i) => (g ? -1 : i)).filter((i) => i >= 0);
  const card = (i: number) => {
    const spec = response.items[i];
    return (
      <button key={i} type="button" className={`sort-card ln-card ${selected === i ? 'is-selected' : ''}`} aria-pressed={selected === i} aria-label={`საგანი ${i + 1}: ${OBJECT_NAME(spec)}${selected === i ? ', არჩეულია' : ''}`} disabled={disabled} onClick={() => pick(i)}>
        <span className="sort-no">{i + 1}</span>
        <LengthObjectView spec={spec} maxCm={Math.max(response.reference.cm, ...response.items.map((o) => o.cm))} />
      </button>
    );
  };
  return (
    <div className="sort ln-sort" role="group" aria-label={label}>
      <p className="sort-hint" role="status" aria-live="polite">
        {selected !== null
          ? `საგანი ${selected + 1} არჩეულია. შეეხე ჯგუფს, სადაც უნდა ჩადო.`
          : open.length > 0
            ? 'შეეხე საგანს, მერე ჯგუფს. შეადარე მითითებულ სიგრძეს.'
            : 'ყველა საგანი დალაგებულია. თუ გადაიფიქრე, შეეხე საგანს და სხვა ჯგუფს.'}
      </p>
      <div className="ln-reference">
        <span className="ln-reference-text">შესადარებელი სიგრძე ({response.reference.cm} სმ):</span>
        <LengthObjectView spec={response.reference} maxCm={Math.max(response.reference.cm, ...response.items.map((o) => o.cm))} />
      </div>
      {open.length > 0 && <div className="sort-tray">{open.map(card)}</div>}
      <div className="sort-bins has-3">
        {LENGTH_GROUPS.map((g) => {
          const inside = groups.map((x, i) => (x === g.id ? i : -1)).filter((i) => i >= 0);
          return (
            <section key={g.id} className="sort-bin" aria-label={g.label}>
              <button type="button" className="sort-bin-btn" disabled={disabled || selected === null} onClick={() => place(g.id)}>
                <span aria-hidden="true">{g.icon}</span> {g.label}
              </button>
              <div className="sort-cards">{inside.length === 0 ? <span className="sort-empty">ცარიელია</span> : inside.map(card)}</div>
            </section>
          );
        })}
      </div>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || groups.every((g) => !g)} onClick={() => (onChange(response.items.map(() => '').join(',')), setSelected(0))}>
          ↻ თავიდან
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── 3. count identical units ───────────────────────────

export function MeasureUnitsBoard({ response, value, onChange, disabled, label }: { response: UnitsResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const placed = Number(value);
  const shown = Number.isFinite(placed) && placed > 0 ? Math.round(placed) : 0;
  const exact = unitsIn(response.object.cm, response.unitCm);
  return (
    <div className="un-answer">
      <p className="un-task">
        დაალაგე {response.unitName}ები ერთმანეთის გვერდით, უფსკრულის და გადაფარვის გარეშე. დასაწყისიდან დაიწყე.
      </p>
      <UnitBoard
        object={response.object}
        unitCm={response.unitCm}
        unitName={response.unitName}
        placed={shown}
        onChange={(n) => onChange(String(n))}
        disabled={disabled}
        label={label}
      />
      {shown > 0 && shown !== exact && (
        <p className="un-note" role="status" aria-live="polite">
          {shown * response.unitCm < response.object.cm ? 'ჯერ კიდევ არ არის საგნის ბოლომდე.' : 'მეტი ერთეული აღარ ეტევა — გადაფარე.'}
        </p>
      )}
    </div>
  );
}

// ─────────────────────────── 4. read a ruler ───────────────────────────

export function RulerReadBoard({ response, value, onChange, disabled, label }: { response: RulerResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const [zeroText = '', cmText = ''] = splitValue(value);
  const zero = zeroText === '' ? response.rulerStart : Number(zeroText);
  const cm = cmText === '' ? '' : cmText;
  const alignedNow = zeroAligned(0, zero);
  return (
    <div className="rl-answer">
      <RulerBoard
        object={response.object}
        zeroAt={zero}
        onZero={(next) => onChange(`${next},${cm}`)}
        disabled={disabled}
        label={label}
      />
      <p className="rl-status" role="status" aria-live="polite">
        {alignedNow ? 'ნული საგნის დასაწყისშია — ახლა ბოლო ნიშანი გაჩვენებს სიგრძეს.' : 'ნული საგნის დასაწყისში არ არის. გადააადგილე სახაზავი.'}
      </p>
      <div className="lp-choices rl-choices" role="radiogroup" aria-label="აირჩიე სიგრძე">
        {response.options.map((option) => {
          const selected = cm === String(option);
          return (
            <label key={option} className={`lp-choice ${selected ? 'is-selected' : ''} ${disabled ? 'is-locked' : ''}`}>
              <input type="radio" name={label} value={option} checked={selected} disabled={disabled} onChange={() => onChange(`${zero},${option}`)} />
              <span className="lp-choice-dot" aria-hidden="true" />
              <span className="lp-choice-text">{option} სმ</span>
            </label>
          );
        })}
      </div>
      <div className="xt-row">
        {cm !== '' && (
          <button type="button" className="btn btn-ghost btn-small" disabled={disabled} onClick={() => onChange(`${zero},`)}>
            ↻ პასუხის გასუფთავება
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────── 5. choose cm or m ───────────────────────────

export function UnitPickAnswer({ response, value, onChange, disabled, label }: { response: PickResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const picks = Array.from({ length: response.items.length }, (_, i) => splitValue(value)[i] ?? '');
  return (
    <div className="up-answer">
      <p className="up-task">თითოეული საგნისთვის აირჩიე უფრო მოხერხებული ერთეული: სანტიმეტრი თუ მეტრი.</p>
      <UnitPickBoard items={response.items} picks={picks} onChange={(next) => onChange(next.join(','))} disabled={disabled} label={label} />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || picks.every((p) => !p)} onClick={() => onChange(response.items.map(() => '').join(','))}>
          ↻ გასუფთავება
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── small shared helpers ───────────────────────────

/** The name of an object, for prompts. */
export const lengthName = (spec: LengthObject): string => KINDS[kindOf(spec)].name;

/** The three groups as a sentence, for the explore tools. */
export function groupOfText(spec: LengthObject, reference: LengthObject): string {
  const group = compareGroup(spec.cm, reference.cm);
  if (group === 'e') return `${OBJECT_NAME(spec)} იგივე სიგრძისაა (${spec.cm} სმ).`;
  const order = orderOf(spec.cm, reference.cm);
  return order === 'first-longer'
    ? `${OBJECT_NAME(spec)} უფრო გრძელია: ${spec.cm} სმ > ${reference.cm} სმ.`
    : `${OBJECT_NAME(spec)} უფრო მოკლეა: ${spec.cm} სმ < ${reference.cm} სმ.`;
}

/** A length in centimetres and the same length in drawing units, for tools that show the ruler. */
export const drawnEnd = (spec: LengthObject): number => px(spec.cm);

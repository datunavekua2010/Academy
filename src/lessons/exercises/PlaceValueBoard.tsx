import { useState } from 'react';
import {
  PLACES,
  PLACE_BLOCK,
  PLACE_MULT,
  PLACE_NAME,
  PLACE_PLURAL,
  PLACE_WORTH,
  blocksOf,
  blocksText,
  breakDown,
  digitsOf,
  exchange,
  exchangeable,
  exchangeRule,
  expandedShortText,
  expandedText,
  isStandard,
  partsOf,
  placeUp,
  regroup,
  valueOfBlocks,
  type DigitCounts,
  type Place,
} from './PlaceValueGeometry';

/**
 * Pictures for G2 U01 place value.
 *
 * Every block is drawn from a count that is worth something (`PlaceValueGeometry`): a hundreds flat is 100, a tens rod is
 * 10, a ones cube is 1. The caption always says what the blocks are worth in words, so the value is never only a
 * picture, and a student who cannot see the picture is told the same number.
 */

const PLACE_INK: Record<Place, string> = { hundreds: '#1d4ed8', tens: '#0e9488', ones: '#b45309' };

/** One hundreds flat: a 10 × 10 square, the whole of the next place down. */
function HundredsFlat({ size = 54 }: { size?: number }) {
  return (
    <svg className="pv-flat" width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <rect x="1" y="1" width="98" height="98" rx="4" fill={PLACE_INK.hundreds} opacity="0.18" stroke={PLACE_INK.hundreds} strokeWidth="3" />
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <line x1={10 * (i + 1)} y1="3" x2={10 * (i + 1)} y2="97" stroke={PLACE_INK.hundreds} strokeWidth="1" opacity="0.5" />
          <line x1="3" y1={10 * (i + 1)} x2="97" y2={10 * (i + 1)} stroke={PLACE_INK.hundreds} strokeWidth="1" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

/** One tens rod: ten cubes in a line. */
function TensRod({ cells = 10 }: { cells?: number }) {
  return (
    <svg className="pv-rod" width={cells * 5 + 2} height="14" viewBox={`0 0 ${cells * 5 + 2} 14`} aria-hidden="true">
      <rect x="1" y="1" width={cells * 5} height="12" rx="2" fill={PLACE_INK.tens} opacity="0.2" stroke={PLACE_INK.tens} strokeWidth="1.6" />
      {Array.from({ length: cells - 1 }, (_, i) => (
        <line key={i} x1={(i + 1) * 5 + 1} y1="2" x2={(i + 1) * 5 + 1} y2="12" stroke={PLACE_INK.tens} strokeWidth="0.9" opacity="0.7" />
      ))}
    </svg>
  );
}

/** One ones cube. */
function OnesCube() {
  return (
    <svg className="pv-cube" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="1" y="1" width="10" height="10" rx="2" fill={PLACE_INK.ones} opacity="0.22" stroke={PLACE_INK.ones} strokeWidth="1.6" />
    </svg>
  );
}

/** What a set of blocks is worth, said in words and in numbers. */
export const blocksLabel = (counts: DigitCounts): string =>
  `${blocksText(counts)} — სულ ${valueOfBlocks(counts)}`;

/**
 * Place-value blocks. `counts` is drawn as it is, even when a place holds ten or more: that is the state *before* an
 * exchange, and drawing it honestly is the whole point of the regrouping lesson.
 */
export function PlaceBlocks({
  counts,
  size = 54,
  label,
  showValue = true,
  animateKey,
}: {
  counts: DigitCounts;
  size?: number;
  label: string;
  showValue?: boolean;
  animateKey?: string | number;
}) {
  const value = valueOfBlocks(counts);
  const nothing = counts.hundreds === 0 && counts.tens === 0 && counts.ones === 0;
  return (
    <figure className="pv" aria-label={`${label}: ${blocksLabel(counts)}`}>
      {nothing ? (
        <p className="pv-empty">ჯერ არაფერია დადებული</p>
      ) : (
        <div className="pv-cols" key={animateKey}>
          {PLACES.map((place) => {
            const count = counts[place];
            if (count === 0) return null;
            return (
              <section key={place} className={`pv-col is-${place}`} aria-label={`${PLACE_PLURAL[place]}: ${count}`}>
                <h4 className="pv-col-head">
                  {PLACE_PLURAL[place]} <small>({count})</small>
                </h4>
                <div className="pv-blocks">
                  {place === 'hundreds' && Array.from({ length: count }, (_, i) => <HundredsFlat key={i} size={size} />)}
                  {place === 'tens' && Array.from({ length: count }, (_, i) => <TensRod key={i} />)}
                  {place === 'ones' && (
                    <div className="pv-ones">
                      {Array.from({ length: count }, (_, i) => (
                        <OnesCube key={i} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="pv-col-worth">
                  {count} × {PLACE_WORTH[place]} = {count * PLACE_WORTH[place]}
                </p>
                {count >= 10 && place !== 'hundreds' ? <p className="pv-col-flag">10 {PLACE_PLURAL[place]} = 1 {PLACE_NAME[placeUp(place) ?? place]}</p> : null}
              </section>
            );
          })}
        </div>
      )}
      {showValue ? (
        <figcaption className="pv-caption">
          <span className="pv-word">{blocksText(counts)}</span>
          <span className="pv-value">= {value}</span>
          {!isStandard(counts) && placeUp('ones') ? <span className="pv-note">ჯერ დაუჯგუფებელია — 10-ის ჯგუფები უნდა გაერთიანდეს</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** The three digits of a number, each in its own place cell; `onTap` makes them buttons. */
export function PlaceCards({
  value,
  hide,
  onTap,
  active,
  label,
}: {
  value: number;
  hide?: Place;
  onTap?: (place: Place) => void;
  active?: Place | null;
  label: string;
}) {
  const d = digitsOf(value);
  return (
    <div className="pvc" role="group" aria-label={`${label}: ${value}`}>
      {PLACES.map((place) => {
        const digit = d[place];
        const hidden = hide === place;
        const content = (
          <>
            <span className="pvc-digit">{hidden ? '?' : digit}</span>
            <span className="pvc-place">{PLACE_NAME[place]}</span>
            <span className="pvc-worth">{hidden ? 'უცნობია' : `= ${digit * PLACE_MULT[place]}`}</span>
          </>
        );
        return onTap ? (
          <button
            key={place}
            type="button"
            className={`pvc-card is-${place} ${active === place ? 'is-active' : ''}`}
            aria-pressed={active === place}
            aria-label={`${PLACE_NAME[place]}: ${hidden ? 'დაფარულია' : `ციფრი ${digit}, ღირს ${digit * PLACE_MULT[place]}`}`}
            onClick={() => onTap(place)}
            disabled={hidden}
          >
            {content}
          </button>
        ) : (
          <div key={place} className={`pvc-card is-${place}`} aria-label={`${PLACE_NAME[place]}: ${hidden ? 'დაფარულია' : `${digit}, ღირს ${digit * PLACE_MULT[place]}`}`}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

/** A number in expanded form, with one place optionally covered: `300 + 40 + ?` for 345 hidden in the ones place. */
export function ExpandedLine({ value, hide, label }: { value: number; hide?: Place; label?: string }) {
  const parts = partsOf(value);
  return (
    <p className={`exp ${hide ? `is-hiding-${hide}` : ''}`} aria-label={label ?? (hide ? `${expandedText(value)}, ${PLACE_NAME[hide]} დაფარულია` : expandedText(value))}>
      {parts.map((p, i) => (
        <span key={p.place} className="exp-part">
          {i > 0 && <span className="exp-op" aria-hidden="true"> + </span>}
          <span className={`exp-card is-${p.place} ${hide === p.place ? 'is-hidden' : ''}`}>{hide === p.place ? '?' : p.value}</span>
        </span>
      ))}
      <span className="exp-eq" aria-hidden="true"> = </span>
      <span className="exp-total">{hide ? '?' : value}</span>
    </p>
  );
}

// ─────────────────────────── the building mat ───────────────────────────

/**
 * The workspace for building a number: a tray with a hundreds flat, a tens rod and a ones cube, and three columns that
 * receive them. Tapping a block adds one; tapping a placed block takes it away. Ten of a place can be exchanged for one
 * of the next — the exchange is offered, never forced, so the student can see the value stay the same.
 */
export function BuildMat({
  counts,
  onChange,
  disabled = false,
  label,
  max = 9,
  allowRegroup = true,
}: {
  counts: DigitCounts;
  onChange: (next: DigitCounts) => void;
  disabled?: boolean;
  label: string;
  max?: number;
  allowRegroup?: boolean;
}) {
  const [note, setNote] = useState('');
  const value = valueOfBlocks(counts);
  const add = (place: Place) => {
    if (disabled) return;
    const next = { ...counts, [place]: counts[place] + 1 };
    // a built number normally stops at nine in a place; a mat that is about loose blocks may go higher
    if (next[place] > max) return;
    onChange(next);
    setNote(`დაამატე 1 ${PLACE_BLOCK[place]}: ახლა ${blocksText(next)} = ${valueOfBlocks(next)}`);
  };
  const take = (place: Place) => {
    if (disabled || counts[place] === 0) return;
    const next = { ...counts, [place]: counts[place] - 1 };
    onChange(next);
    setNote(`აიღე 1 ${PLACE_BLOCK[place]}: ახლა ${blocksText(next)} = ${valueOfBlocks(next)}`);
  };
  const doExchange = (place: Place) => {
    if (disabled) return;
    const next = exchange(counts, place);
    if (!next) return;
    onChange(next);
    setNote(`10 ${PLACE_PLURAL[place]} შეიცვალა 1 ${PLACE_NAME[placeUp(place) ?? place]}-ად: მნიშვნელობა იგივეა — ${valueOfBlocks(next)}`);
  };
  const doBreak = (place: Place) => {
    if (disabled) return;
    const next = breakDown(counts, place);
    if (!next) return;
    onChange(next);
    setNote(`1 ${PLACE_NAME[place]} დაიშალა 10 ${PLACE_PLURAL[place === 'tens' ? 'ones' : 'tens']}-ად: მნიშვნელობა იგივეა — ${valueOfBlocks(next)}`);
  };
  const canExchange = exchangeable(counts);
  return (
    <div className="bm" role="group" aria-label={label}>
      <div className="bm-tray" role="toolbar" aria-label="ბლოკების დამატება">
        {PLACES.map((place) => (
          <button key={place} type="button" className={`bm-tile is-${place}`} disabled={disabled || counts[place] >= max} aria-label={`დაამატე 1 ${PLACE_BLOCK[place]} (${PLACE_WORTH[place]})`} onClick={() => add(place)}>
            <span className="bm-tile-art" aria-hidden="true">
              {place === 'hundreds' ? <HundredsFlat size={30} /> : place === 'tens' ? <TensRod cells={8} /> : <OnesCube />}
            </span>
            <span className="bm-tile-text">
              +1 {PLACE_BLOCK[place]} <small>{PLACE_WORTH[place]}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="bm-mat">
        {PLACES.map((place) => (
          <section key={place} className={`bm-col is-${place}`} aria-label={`${PLACE_PLURAL[place]}: ${counts[place]}`}>
            <h4>
              {PLACE_PLURAL[place]} <small>({counts[place]})</small>
            </h4>
            <div className="bm-drop">
              {Array.from({ length: counts[place] }, (_, i) => (
                <button key={i} type="button" className="bm-placed" disabled={disabled} aria-label={`${PLACE_PLURAL[place]}: წაიღე ერთი`} onClick={() => take(place)}>
                  <span aria-hidden="true">{place === 'hundreds' ? <HundredsFlat size={26} /> : place === 'tens' ? <TensRod cells={7} /> : <OnesCube />}</span>
                </button>
              ))}
              {counts[place] === 0 ? <span className="bm-empty">ცარიელია</span> : null}
            </div>
            <div className="bm-acts">
              {allowRegroup && place !== 'hundreds' && (
                <button type="button" className="btn btn-ghost btn-small" disabled={disabled || counts[place] < 10} aria-label={`10 ${PLACE_PLURAL[place]} გახადე 1 ${PLACE_NAME[placeUp(place) ?? place]}`} onClick={() => doExchange(place)}>
                  ⇄ 10 → 1
                </button>
              )}
              {allowRegroup && place !== 'ones' && (
                <button type="button" className="btn btn-ghost btn-small" disabled={disabled || counts[place] < 1} aria-label={`1 ${PLACE_NAME[place]} დაშალე 10 ${PLACE_NAME[place === 'tens' ? 'ones' : 'tens'].replace(/ი$/, '')}ად`} onClick={() => doBreak(place)}>
                  ⇄ 1 → 10
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
      <p className="bm-status" role="status" aria-live="polite">
        {note || `სულ: ${value}`}
      </p>
      <div className="bm-foot">
        <span className="bm-total">
          ბლოკების მნიშვნელობა: <strong>{value}</strong>
        </span>
        {canExchange.length > 0 && <span className="bm-flag">ჯერ არის 10-ის ჯგუფი — შეიძლება გაერთიანება</span>}
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || value === 0} onClick={() => (onChange({ hundreds: 0, tens: 0, ones: 0 }), setNote(''))}>
          ↻ გასუფთავება
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────── the expanded-form cards ───────────────────────────

/**
 * The expanded form built from cards. Each place has a row of cards that could go in it (its own value, the digit, and
 * two distractors); the student puts one card in each place, and the row says what it is worth.
 */
export function ExpandedCards({
  value,
  cards,
  slots,
  onChange,
  disabled = false,
  label,
}: {
  value: number;
  cards: number[];
  slots: Array<string>;
  onChange: (next: string[]) => void;
  disabled?: boolean;
  label: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  const parts = partsOf(value);
  const put = (index: number) => {
    if (disabled || active === null) return;
    const next = slots.map((s, i) => (i === index ? String(cards[active]) : s));
    onChange(next);
    setActive(null);
  };
  const used = slots.filter(Boolean).map(Number);
  const placed = (card: number, index: number) => slots.some((slot, i) => i > index && Number(slot) === card);
  const total = sumOfFilled(slots);
  return (
    <div className="exb" role="group" aria-label={label}>
      <p className="exb-hint" role="status" aria-live="polite">
        {active === null ? 'შეეხე ბარათს, შემდეგ იმ ადგილს, სადაც ის უნდა დადო.' : `ბარათი ${cards[active]} არჩეულია. სად უნდა დადო?`}
      </p>
      <div className="exb-tray" aria-label="ბარათები">
        {cards.map((card, i) => (
          <button
            key={`${card}-${i}`}
            type="button"
            className={`exb-card ${active === i ? 'is-picked' : ''} ${placed(card, i) ? 'is-used' : ''}`}
            disabled={disabled}
            aria-pressed={active === i}
            aria-label={`ბარათი ${card}`}
            onClick={() => setActive(active === i ? null : i)}
          >
            {card}
          </button>
        ))}
      </div>
      <div className="exb-slots">
        {parts.map((part, i) => (
          <div key={part.place} className={`exb-slot is-${part.place}`}>
            <button
              type="button"
              className={`exb-place ${slots[i] ? 'is-filled' : ''} ${active !== null ? 'is-open' : ''}`}
              disabled={disabled || active === null}
              aria-label={`${PLACE_NAME[part.place]}ის ადგილი: ${slots[i] ? `${slots[i]}` : 'ცარიელი'}`}
              onClick={() => put(i)}
            >
              {slots[i] || '—'}
            </button>
            <small>{PLACE_NAME[part.place]}</small>
          </div>
        ))}
      </div>
      <p className="exb-line">
        {slots.filter(Boolean).length === 0 ? 'ჯერ არაფერია დადებული' : `${slots.filter(Boolean).join(' + ')} = ${total}`}
      </p>
      <div className="exb-foot">
        <span className={`exb-check ${total === value && slots.every(Boolean) ? 'is-ok' : ''}`}>
          {slots.every(Boolean) ? (total === value ? `✓ ჯამი ემთხვევა: ${total}` : `ჯამი ${total}, საჭიროა ${value}`) : 'სამივე ადგილი უნდა შეივსოს'}
        </span>
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || used.length === 0} onClick={() => (onChange(parts.map(() => '')), setActive(null))}>
          ↻ გასუფთავება
        </button>
      </div>
    </div>
  );
}

const sumOfFilled = (slots: string[]): number => slots.reduce((sum, s) => sum + (s ? Number(s) : 0), 0);

/** A number written in expanded form beside its standard form, for a static explanation. */
export function ExpandedPanel({ value, label }: { value: number; label?: string }) {
  return (
    <div className="exp-panel" aria-label={label ?? `${expandedText(value)} = ${value}`}>
      <p className="exp-long">{expandedText(value)}</p>
      <p className="exp-short">{expandedShortText(value)}</p>
      <p className="exp-standard">= {value}</p>
    </div>
  );
}

/** The blocks a number would have if nothing were regrouped — used to show 10 of a place turning into 1. */
export function RegroupDemo({ value, place, step }: { value: number; place: Place; step: number }) {
  const base = blocksOf(value);
  const before: DigitCounts = { ...base, [place]: base[place] + 10, [placeUp(place) ?? place]: Math.max(0, base[placeUp(place) ?? place] - 1) };
  const counts = step >= 2 ? base : before;
  const rule = exchangeRule(place);
  return (
    <figure className="regroup-demo">
      <PlaceBlocks counts={counts} size={44} label={step >= 2 ? 'გაერთიანების შემდეგ' : 'გაერთიანებამდე'} animateKey={step} />
      <figcaption>
        <span className="rd-rule">
          {rule.ten} = {rule.one}
        </span>
        <span className="rd-same">მნიშვნელობა არ იცვლება: {valueOfBlocks(counts)}</span>
      </figcaption>
    </figure>
  );
}

/** The value of the blocks currently on a mat, for a status line that never guesses. */
export const matValue = (counts: DigitCounts): number => valueOfBlocks(counts);

/** A rebuilt set of blocks from a stored `\"h,t,o\"` answer. */
export function parseCounts(text: string): DigitCounts {
  const [h = '0', t = '0', o = '0'] = (text ?? '').split(',');
  return { hundreds: Number(h) || 0, tens: Number(t) || 0, ones: Number(o) || 0 };
}

export const countsText = (counts: DigitCounts): string => `${counts.hundreds},${counts.tens},${counts.ones}`;

/** The standard blocks of a number, for a picture that only needs the digits. */
export const standardBlocks = (n: number): DigitCounts => regroup(digitsOf(n));

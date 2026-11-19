import type { Verdict } from '../types';
import {
  TETRI_PER_LARI,
  canAfford,
  changeFrom,
  coin,
  fewestPieces,
  moneyText,
  note,
  organise,
  pieceShort,
  pieceText,
  runningTotal,
  totalOf,
  waysToMake,
} from './MoneyGeometry';

/**
 * Pictures and answer controls for G2 U09.
 *
 * A coin is drawn as a coin and a banknote as a note, so a piece of money is never just a number in a box. The total on
 * screen is always `totalOf(pieces)` over the very array that is drawn — there is no second copy of an amount.
 */

/** One coin or banknote, drawn with its written value inside and its name for a screen reader. */
export function MoneyPiece({ value, size = 'md', tone }: { value: number; size?: 'sm' | 'md' | 'lg'; tone?: 'ok' | 'no' }) {
  const isNote = value % TETRI_PER_LARI === 0;
  return (
    <span className={`mny-piece ${isNote ? 'is-note' : 'is-coin'} is-${size} ${tone ? `is-${tone}` : ''}`} role="img" aria-label={pieceText(value)}>
      <span className="mny-value" aria-hidden="true">
        {pieceShort(value)}
      </span>
    </span>
  );
}

/** A collection of money, in the order it is counted. `running` shows the total after each piece. */
export function MoneyPurse({
  pieces,
  showTotal,
  running,
  caption,
  label,
}: {
  pieces: number[];
  showTotal?: boolean;
  running?: boolean;
  caption?: string;
  label?: string;
}) {
  const sorted = [...pieces].sort((a, b) => b - a);
  const totals = runningTotal(sorted);
  return (
    <figure className="mny" aria-label={label ?? `ფული: ${pieces.map(pieceText).join(', ')}`}>
      <ul className="mny-row">
        {sorted.map((value, i) => (
          <li key={i} className="mny-item">
            <MoneyPiece value={value} />
            {running && <span className="mny-run">{totals[i]}</span>}
          </li>
        ))}
      </ul>
      {running && (
        <p className="mny-note">
          {sorted.map((v, i) => (i === 0 ? String(v) : `+ ${v}`)).join(' ')} = {totalOf(pieces)}
        </p>
      )}
      {showTotal && <figcaption className="mny-total">{moneyText(totalOf(pieces))}</figcaption>}
      {caption && <figcaption className="mny-cap">{caption}</figcaption>}
    </figure>
  );
}

/** A price tag and the money that is meant to pay for it. */
export function PricePicture({ cost, money, caption }: { cost: number; money: number; caption?: string }) {
  const enough = canAfford(money, cost);
  return (
    <figure className="mny mny-shop" aria-label={`ფასი ${moneyText(cost)}, ფული ${moneyText(money)}`}>
      <div className="mny-shop-row">
        <div className="mny-shop-side">
          <span className="mny-shop-label">ფასი</span>
          <span className="mny-tag">{moneyText(cost)}</span>
        </div>
        <div className="mny-shop-side">
          <span className="mny-shop-label">ფული</span>
          <span className="mny-tag is-money">{moneyText(money)}</span>
        </div>
      </div>
      <p className={`mny-note ${enough ? 'is-ok' : 'is-short'}`}>
        {enough ? `საკმარისია: ხურდა ${moneyText(changeFrom(money, cost))}` : `არ არის საკმარისი: ${moneyText(cost - money)} აკლია`}
      </p>
      {caption && <figcaption className="mny-cap">{caption}</figcaption>}
    </figure>
  );
}

/** The same amount written two ways, piece by piece. */
export function WaysPicture({ ways, caption }: { ways: number[][]; caption?: string }) {
  return (
    <figure className="mny mny-ways" aria-label={`${ways.length} გზა`}>
      <ol className="mny-way-list">
        {ways.map((way, i) => (
          <li key={i} className="mny-way">
            <span className="mny-way-tag">{totalOf(way)}</span>
            <span className="mny-way-pieces">
              {way.length === 0 ? '—' : way.map(pieceShort).join(' + ')}
            </span>
            <span className="mny-way-count">{way.length} ნაჭერი</span>
          </li>
        ))}
      </ol>
      {caption && <figcaption className="mny-cap">{caption}</figcaption>}
    </figure>
  );
}

/**
 * The student builds an amount from a tray of pieces. Tapping a piece adds it; tapping it in the purse takes it back.
 * The purse's total is the sum of what is in it, added up as the student goes.
 */
export function MoneyBuildAnswer({
  tray,
  target,
  value,
  onChange,
  disabled,
  verdict,
  showFewestHint,
  label,
}: {
  tray: number[];
  target: number;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  verdict?: Verdict;
  showFewestHint?: boolean;
  label: string;
}) {
  const taken = value === '' ? [] : value.split(',').filter(Boolean).map(Number);
  const total = totalOf(taken);
  const over = total > target;
  const put = (v: number) => {
    if (disabled) return;
    onChange([...taken, v].join(','));
  };
  const take = (index: number) => {
    if (disabled) return;
    onChange(taken.filter((_, i) => i !== index).join(','));
  };
  const fewest = fewestPieces(target);
  return (
    <div className={`mnyb ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <p className="mnyb-ask" aria-live="polite">
        შეადგინე <strong>{moneyText(target)}</strong>. ახლა პარკუჭშია {moneyText(total)}
        {over ? ` — ${moneyText(total - target)} ზედმეტია.` : total === target ? ' — ზუსტად!' : ` — კიდევ ${moneyText(target - total)} გჭირდება.`}
      </p>
      <div className="mnyb-purse" role="group" aria-label={label}>
        {taken.length === 0 ? (
          <span className="mnyb-empty">პარკუჭი ცარიელია — დააჭირე ფულს ქვემოთ.</span>
        ) : (
          taken.map((v, i) => (
            <button key={i} type="button" className="mnyb-slot" onClick={() => take(i)} disabled={disabled} aria-label={`პარკუჭში: ${pieceText(v)} — დაბრუნება`}>
              <MoneyPiece value={v} size="sm" />
            </button>
          ))
        )}
      </div>
      <ul className="mnyb-tray">
        {tray.map((v, i) => (
          <li key={i}>
            <button type="button" className="mnyb-take" onClick={() => put(v)} disabled={disabled} aria-label={`აიღე ${pieceText(v)}`}>
              <MoneyPiece value={v} size="sm" />
            </button>
          </li>
        ))}
      </ul>
      <div className="xt-row">
        <button type="button" className="btn btn-ghost" onClick={() => onChange('')} disabled={disabled}>
          ↻ გასუფთავება
        </button>
        {showFewestHint && (
          <button type="button" className="btn btn-ghost" onClick={() => onChange(fewest.join(','))} disabled={disabled}>
            ყველაზე ცოტა ნაჭრით
          </button>
        )}
      </div>
      <p className="mnyb-fact">{`${taken.length === 0 ? '0' : taken.join(' + ')} = ${total} თეთრი`}</p>
    </div>
  );
}

/** A written collection organised by value — the "how would you count this?" board. */
export function OrganiseAnswer({ pieces, label }: { pieces: number[]; label: string }) {
  const groups = organise(pieces);
  return (
    <div className="mny mny-org" role="group" aria-label={label}>
      <ul className="mny-org-list">
        {groups.map((g) => (
          <li key={g.value} className="mny-org-row">
            <MoneyPiece value={g.value} size="sm" />
            <span className="mny-org-count">× {g.count}</span>
            <span className="mny-org-worth">= {moneyText(g.value * g.count)}</span>
          </li>
        ))}
      </ul>
      <p className="mny-note">სულ {moneyText(totalOf(pieces))}</p>
    </div>
  );
}

/** The fewest pieces that make an amount, drawn — the answer to "how would you pay it?". */
export function FewestPicture({ amount, caption }: { amount: number; caption?: string }) {
  const pieces = fewestPieces(amount);
  return (
    <figure className="mny" aria-label={`${moneyText(amount)}: ${pieces.map(pieceText).join(', ')}`}>
      <ul className="mny-row">
        {pieces.map((v, i) => (
          <li key={i}>
            <MoneyPiece value={v} />
          </li>
        ))}
      </ul>
      <figcaption className="mny-total">
        {moneyText(amount)} = {pieces.map(pieceText).join(' + ')}
      </figcaption>
      {caption && <figcaption className="mny-cap">{caption}</figcaption>}
    </figure>
  );
}

/** Every way to make an amount, fewest first — what the "different ways" lesson explores. */
export const allWays = waysToMake;

/** Coins and notes for a tray, biggest first, with both kinds present. */
export const trayFor = (values: number[]): number[] => [...new Set(values)].sort((a, b) => b - a);

/** A note and a coin of the same value are different pieces — this names which is which for the picture. */
export const pieceKind = (value: number): 'coin' | 'note' => (value % TETRI_PER_LARI === 0 ? 'note' : 'coin');

/** The pieces as objects, for a board that wants to say what each one is. */
export const asPieces = (values: number[]) => values.map((v) => (v % TETRI_PER_LARI === 0 ? note(v / TETRI_PER_LARI) : coin(v)));

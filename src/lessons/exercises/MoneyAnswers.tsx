import { useId } from 'react';
import { moneyText, totalOf } from './MoneyGeometry';
import { MoneyPurse } from './MoneyBoard';

/**
 * Answer controls for G2 U09.4–U09.5: a typed total, and the enough / change pair.
 *
 * The pictures come from `MoneyBoard`, so what is drawn and what is marked are the same pieces of money.
 */

/** Type the total of a collection, with the pieces drawn above the box. */
export function MoneyTotalAnswer({
  pieces,
  value,
  onChange,
  disabled,
  label,
}: {
  pieces: number[];
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  const id = useId();
  return (
    <div className="mnytot">
      <MoneyPurse pieces={pieces} />
      <div className="mnytot-row">
        <label className="mnytot-slot" htmlFor={id}>
          <span>სულ (თეთრი)</span>
          <input id={id} inputMode="numeric" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} aria-label={label} />
        </label>
        <span className="mnytot-unit">თეთრი</span>
      </div>
      <p className="mnytot-note" aria-live="polite">
        {value === '' ? `დათვალე ფული: ${pieces.length} ნაჭერი.` : `სულ ${pieces.length} ნაჭერი — ${moneyText(totalOf(pieces))} შემოწმებისას.`}
      </p>
    </div>
  );
}

/** Enough or not, and how much change — asked as one pair because change only exists when there is enough. */
export function MoneyCompareAnswer({
  money,
  cost,
  value,
  onChange,
  disabled,
  label,
}: {
  money: number;
  cost: number;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  label: string;
}) {
  const [enough = '', change = ''] = value.split(',');
  const put = (which: 0 | 1, text: string) => {
    const parts = [enough, change];
    parts[which] = text;
    onChange(parts.join(','));
  };
  return (
    <div className="mnycmp" role="group" aria-label={label}>
      <div className="mnycmp-pick">
        <button type="button" className={`btn ${enough === '1' ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={enough === '1'} disabled={disabled} onClick={() => put(0, '1')}>
          ✓ საკმარისია
        </button>
        <button type="button" className={`btn ${enough === '0' ? 'btn-primary' : 'btn-ghost'}`} aria-pressed={enough === '0'} disabled={disabled} onClick={() => put(0, '0')}>
          ✗ არ არის საკმარისი
        </button>
      </div>
      <div className="mnycmp-change">
        <label className="mnytot-slot">
          <span>ხურდა (თეთრი)</span>
          <input inputMode="numeric" value={change} disabled={disabled} onChange={(e) => put(1, e.target.value)} aria-label="ხურდა თეთრებში" />
        </label>
        <span className="mnytot-unit">თეთრი</span>
      </div>
      <p className="mnytot-note" aria-live="polite">
        {enough === ''
          ? `${moneyText(money)} და ${moneyText(cost)}: საკმარისია?`
          : enough === '1'
            ? `${moneyText(money)} ფარავს ${moneyText(cost)}-ს — ჩაწერე ხურდა.`
            : `${moneyText(money)} ნაკლებია ${moneyText(cost)}-ზე — ხურდა 0-ია.`}
      </p>
    </div>
  );
}

/** The change sentence, so a wrong answer can be checked by adding: 500 − 320 = 180. */
export const changeSentence = (paid: number, cost: number): string => `${paid} − ${cost} = ${paid - cost}`;

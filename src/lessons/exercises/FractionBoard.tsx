import type { ShapeSpec, Verdict } from '../types';
import { ShapeBoard } from './ShapeBoard';
import { divisionOf } from './ShapeGeometry';
import { denominatorOf, fractionName, fractionOf, fractionSentence, fractionText, piecesOf } from './FractionGeometry';

/**
 * Pictures and answer controls for G2 U07 (halves, quarters, thirds and unit fractions).
 *
 * Every picture is drawn through `ShapeBoard`, so the pieces are the pieces the geometry really cut, and every claim
 * about a fraction is checked against those areas. A shape with three unequal pieces is never called "thirds".
 */

/** A divided shape with some pieces picked, drawn with its fraction underneath. */
export function FractionPicture({ spec, take = [], caption, showFraction = true }: { spec: ShapeSpec; take?: number[]; caption?: string; showFraction?: boolean }) {
  const f = fractionOf(spec, take);
  const den = denominatorOf(spec);
  const marks = Object.fromEntries(take.map((n) => [n, 'sel' as const]));
  const shapeName = spec.shape === 'circle' ? 'წრე' : spec.shape === 'square' ? 'კვადრატი' : 'მართკუთხედი';
  return (
    <figure className="frc" aria-label={f ? fractionSentence(f) : `დაყოფილი ${shapeName}: ნაწილები ტოლი არ არის`}>
      <ShapeBoard spec={spec} marks={marks} label={f ? `${f.numerator}/${f.denominator}` : 'არატოლი ნაწილები'} />
      {showFraction && (
        <figcaption className="frc-note">
          {f ? (
            <>
              <span className="frc-frac">
                <b className="frc-num">{f.numerator}</b>
                <span className="frc-bar" aria-hidden="true" />
                <b className="frc-den">{f.denominator}</b>
              </span>
              <span className="frc-name">{fractionName(f)}</span>
            </>
          ) : (
            <span className="frc-unequal">ნაწილები ტოლი არ არის — ეს ტოლი ნაწილები არ არის.</span>
          )}
        </figcaption>
      )}
      {den !== null && <figcaption className="frc-words">მთელი დაყოფილია {den} ტოლ ნაწილად.</figcaption>}
      {caption && <figcaption className="frc-cap">{caption}</figcaption>}
    </figure>
  );
}

/** Equal or unequal? Stored as `"1"` or `"0"`, decided by the areas. */
export function PartsJudgeAnswer({ response, value, onChange, disabled, label }: { response: { shape: ShapeSpec }; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const den = denominatorOf(response.shape);
  const count = divisionOf(response.shape).pieces.length;
  return (
    <div className="fj">
      <FractionPicture spec={response.shape} showFraction={false} />
      <div className="fj-pick" role="group" aria-label={label}>
        <button type="button" className={value === '1' ? 'btn btn-primary' : 'btn btn-ghost'} aria-pressed={value === '1'} disabled={disabled} onClick={() => onChange('1')}>
          ✓ ტოლი ნაწილები
        </button>
        <button type="button" className={value === '0' ? 'btn btn-primary' : 'btn btn-ghost'} aria-pressed={value === '0'} disabled={disabled} onClick={() => onChange('0')}>
          ✗ არატოლი ნაწილები
        </button>
      </div>
      <p className="fj-note" aria-live="polite">
        {value === '' ? `დაითვალე ნაწილები: ${count}. ისინი ერთნაირი ზომისაა?` : den !== null ? `ნაწილები ტოლია: ${count} ტოლი ნაწილი.` : `ნაწილები ტოლი არ არის: ${count} ნაწილი, მაგრამ სხვადასხვა ზომისაა.`}
      </p>
    </div>
  );
}

/** Pick `need` of the equal parts. Stored as comma-separated piece numbers. */
export function FractionPickAnswer({ response, value, onChange, disabled, verdict, label }: { response: { shape: ShapeSpec; need: number; noun?: string }; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const pieces = piecesOf(response.shape);
  const picked = value === '' ? [] : value.split(',').map(Number).filter((n) => Number.isInteger(n));
  const f = fractionOf(response.shape, picked);
  const toggle = (n: number) => {
    if (disabled) return;
    const next = picked.includes(n) ? picked.filter((k) => k !== n) : [...picked, n];
    onChange(next.join(','));
  };
  return (
    <div className={`fp ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <ShapeBoard spec={response.shape} marks={Object.fromEntries(picked.map((n) => [n, 'sel' as const]))} pressed={picked} onPiece={toggle} label={label} />
      <p className="fp-ask">
        მონიშნე <strong>{response.need}</strong> ნაწილი {response.noun ?? `სულ ${pieces.length}-დან`}.
      </p>
      <p className="fp-note" aria-live="polite">
        {f ? `მონიშნულია ${f.numerator}/${f.denominator} — ${fractionName(f)}.` : 'ჯერ არცერთი ნაწილი არ არის მონიშნული.'}
      </p>
    </div>
  );
}

/** Read the numerator and denominator off a shape. Stored as `"num,den"`. */
export function FractionNameAnswer({ response, value, onChange, disabled, verdict, label }: { response: { shape: ShapeSpec; take: number[] }; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const [num = '', den = ''] = value.split(',');
  const write = (which: 'num' | 'den', text: string) => {
    const clean = text.replace(/[^\d]/g, '');
    onChange(which === 'num' ? `${clean},${den}` : `${num},${clean}`);
  };
  const actual = fractionOf(response.shape, response.take);
  return (
    <div className={`fn ${verdict === 'correct' ? 'is-correct' : verdict === 'incorrect' ? 'is-wrong' : ''}`}>
      <FractionPicture spec={response.shape} take={response.take} showFraction={false} />
      <div className="fn-inputs" role="group" aria-label={label}>
        <label className="fn-slot">
          <span>მრიცხველი (აღებული)</span>
          <input type="text" inputMode="numeric" value={num} disabled={disabled} onChange={(e) => write('num', e.target.value)} aria-label="მრიცხველი" />
        </label>
        <span className="fn-bar" aria-hidden="true">
          —
        </span>
        <label className="fn-slot">
          <span>მნიშვნელი (სულ ნაწილი)</span>
          <input type="text" inputMode="numeric" value={den} disabled={disabled} onChange={(e) => write('den', e.target.value)} aria-label="მნიშვნელი" />
        </label>
      </div>
      <p className="fn-note">
        {actual ? `ფიგურა დაყოფილია ${actual.denominator} ტოლ ნაწილად, აღებულია ${actual.numerator}: ${fractionText(actual)}.` : 'ეს ფიგურა ტოლ ნაწილებად არ არის დაყოფილი.'}
      </p>
    </div>
  );
}

/** A fraction written as a stacked fraction, for a caption. */
export function FractionBadge({ numerator, denominator, name }: { numerator: number; denominator: number; name?: string }) {
  return (
    <span className="frc-badge" aria-label={name ?? `${numerator}/${denominator}`}>
      <b>{numerator}</b>
      <span className="frc-bar" aria-hidden="true" />
      <b>{denominator}</b>
    </span>
  );
}

import type { ResponseSpec } from '../types';
import {
  PLACE_NAME,
  PLACES,
  digitsOf,
  expandedText,
  partsHold,
  partsOf,
  placePuzzleHolds,
  missingPlaceValue,
  shownPlacesSum,
  valueAt,
  valueOfBlocks,
  type DigitCounts,
  type Place,
} from './PlaceValueGeometry';
import { BuildMat, ExpandedCards, PlaceBlocks, PlaceCards, countsText, parseCounts } from './PlaceValueBoard';

/**
 * Answer controls for G2 U01 place value. Presentation only — `check.ts` decides what is right, from the blocks' value
 * and from the digits of the number.
 */

type PlaceBuildResponse = Extract<ResponseSpec, { type: 'place-build' }>;
type ExpandedBuildResponse = Extract<ResponseSpec, { type: 'expanded-build' }>;
type DigitTapResponse = Extract<ResponseSpec, { type: 'digit-tap' }>;
type PlaceMissingResponse = Extract<ResponseSpec, { type: 'place-missing' }>;

/** Build a number from blocks. The mat never hides what it is worth, so the check is about the blocks, not the look. */
export function PlaceBuildAnswer({ response, value, onChange, disabled, label }: { response: PlaceBuildResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const counts = parseCounts(typeof value === 'string' ? value : '');
  // a question that accepts loose blocks has to let the student place more than nine in a place
  const max = response.max ?? (response.allowRegroup === true ? 20 : 9);
  return (
    <div className="pba">
      <p className="pba-task">
        ააწყვე რიცხვი <strong>{response.target}</strong> ბლოკებით: ასეულები, ათეულები და ერთეულები.
      </p>
      <BuildMat counts={counts} onChange={(next) => onChange(countsText(next))} disabled={disabled} label={label} max={max} allowRegroup={response.allowRegroup !== false} />
      <p className="pba-target">
        სამიზნე: <strong>{response.target}</strong> · შენი ბლოკები: <strong>{valueOfBlocks(counts)}</strong>
      </p>
    </div>
  );
}

/** Put the place-value cards in order until they add up to the number. */
export function ExpandedBuildAnswer({ response, value, onChange, disabled, label }: { response: ExpandedBuildResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const slots = typeof value === 'string' && value ? value.split(',') : partsOf(response.value).map(() => '');
  const filled = slots.length === 3 ? slots : [slots[0] ?? '', slots[1] ?? '', slots[2] ?? ''];
  return (
    <div className="eba">
      <p className="eba-task">
        დაალაგე ბარათები ისე, რომ ჯამი <strong>{response.value}</strong> იყოს: ასეულები, ათეულები, ერთეულები.
      </p>
      <ExpandedCards value={response.value} cards={response.cards} slots={filled} onChange={(next) => onChange(next.join(','))} disabled={disabled} label={label} />
    </div>
  );
}

/** Tap the digit that sits in the named place. */
export function DigitTapAnswer({ response, value, onChange, disabled, label }: { response: DigitTapResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const tapped = typeof value === 'string' && (PLACES as string[]).includes(value) ? (value as Place) : null;
  return (
    <div className="dta">
      <p className="dta-task">
        შეეხე იმ ციფრს, რომელიც <strong>{PLACE_NAME[response.target]}</strong>ის ადგილზე დგას რიცხვში <strong>{response.value}</strong>.
      </p>
      <PlaceCards value={response.value} onTap={(place) => !disabled && onChange(place)} active={tapped} label={label} />
      <p className="dta-note" role="status" aria-live="polite">
        {tapped
          ? `არჩეულია ${PLACE_NAME[tapped]}ის ციფრი: ${digitsOf(response.value)[tapped]} — ღირს ${valueAt(response.value, tapped)}.`
          : 'ციფრი ჯერ არ არის არჩეული.'}
      </p>
    </div>
  );
}

/** Read the two shown places and type the value of the hidden one. */
export function PlaceMissingAnswer({ response, value, onChange, disabled }: { response: PlaceMissingResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const shown = PLACES.filter((p) => p !== response.missing);
  const sum = shownPlacesSum(response.value, response.missing);
  return (
    <div className="pma">
      <p className="pma-task">
        რიცხვში <strong>{response.value}</strong> დაფარულია <strong>{PLACE_NAME[response.missing]}</strong>. რა ღირს დაფარული ადგილი?
      </p>
      <div className="pma-parts">
        {shown.map((p) => (
          <span key={p} className="pma-part">
            <small>{PLACE_NAME[p]}</small>
            <strong>{valueAt(response.value, p)}</strong>
          </span>
        ))}
        <span className="pma-part is-hidden">
          <small>{PLACE_NAME[response.missing]}</small>
          <strong>?</strong>
        </span>
      </div>
      <p className="pma-sum">
        ნაჩვენები ნაწილების ჯამი: {shown.map((p) => valueAt(response.value, p)).join(' + ')} = {sum}. მთელი რიცხვი {response.value}.
      </p>
      <label className="pma-input">
        <span>დაფარული ადგილის მნიშვნელობა</span>
        <input
          type="text"
          inputMode="numeric"
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          aria-label={`${PLACE_NAME[response.missing]}ის მნიშვნელობა`}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.preventDefault();
          }}
        />
      </label>
    </div>
  );
}

// ─────────────────────────── shared words ───────────────────────────

/** What a built block set is worth, for feedback. */
export const blocksWorth = (counts: DigitCounts): number => valueOfBlocks(counts);

/** Whether a stored card list really is the expanded form of this number. */
export const cardsHold = (value: number, cards: number[]): boolean => partsHold(value, cards);

/** The expanded form of a number, for feedback. */
export const expandedWords = (value: number): string => expandedText(value);

/** The value the hidden place has to be, for feedback. */
export const missingValueOf = (value: number, missing: Place): number => missingPlaceValue(value, missing);

/** A puzzle is well-formed when the two shown parts really leave this value. */
export const missingIsFair = (value: number, missing: Place): boolean => placePuzzleHolds(value, missing);

/** The blocks for a picture: three counts, in place order. */
export const blocksFor = (hundreds: number, tens: number, ones: number): DigitCounts => ({ hundreds, tens, ones });

/** Re-exported so a lesson can show a number's blocks without importing the board twice. */
export { PlaceBlocks, PlaceCards, BuildMat, ExpandedCards };

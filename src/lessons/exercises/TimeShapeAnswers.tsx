import { useState } from 'react';
import type { ResponseSpec } from '../types';
import { digitalText, sameTime, timeOf, type ClockTime } from './ClockGeometry';
import { ClockFace, ClockReadout, DigitalDisplay, MatchBoard, SetClockBoard, spokenTime } from './ClockBoard';
import { FLAT_NAME, type FlatSpec, shapeGroup, sidesOf, verticesOf } from './Shape2DGeometry';
import { RoomBoard, Shape2D, ShapeSortBoard, TapShapeBoard, groupsFor } from './Shape2DBoard';

/**
 * Answer controls for Unit 7 (time) and Unit 8 (2D shapes). Presentation only — `check.ts` decides what is right,
 * and it decides from the time that is set and from the counted outline.
 */

type HandPickResponse = Extract<ResponseSpec, { type: 'hand-pick' }>;
type SetClockResponse = Extract<ResponseSpec, { type: 'set-clock' }>;
type ReadClockResponse = Extract<ResponseSpec, { type: 'read-clock' }>;
type MatchTimeResponse = Extract<ResponseSpec, { type: 'match-time' }>;
type ShapeSortResponse = Extract<ResponseSpec, { type: 'shape-sort' }>;
type TapPartsResponse = Extract<ResponseSpec, { type: 'tap-parts' }>;
type FindShapesResponse = Extract<ResponseSpec, { type: 'find-shapes' }>;

const split = (value: string): string[] => (value ? value.split(',') : []);
const parseTime = (text: string): ClockTime | null => {
  const [h, m] = text.split(',');
  if (h === undefined || m === undefined || h === '' || m === '') return null;
  const hh = Number(h);
  const mm = Number(m);
  return Number.isFinite(hh) && Number.isFinite(mm) ? { h: hh, m: mm } : null;
};

// ═══════════════════════════ U07 · time ═══════════════════════════

/** 1. Which hand shows hours? Pick the short and the long one. */
export function HandPickAnswer({ value, onChange, disabled, label }: { response: HandPickResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const [hour = '', minute = ''] = split(value);
  const set = (which: 'hour' | 'minute', choice: 'short' | 'long') => {
    const next = { hour: which === 'hour' ? choice : hour, minute: which === 'minute' ? choice : minute };
    onChange(`${next.hour},${next.minute}`);
  };
  const row = (which: 'hour' | 'minute', chosen: string) => (
    <fieldset className="hp-row">
      <legend>{which === 'hour' ? 'საათების ისარი' : 'წუთების ისარი'}</legend>
      {(['short', 'long'] as const).map((choice) => (
        <label key={choice} className={`hp-opt ${chosen === choice ? 'is-on' : ''}`}>
          <input
            type="radio"
            name={`${label}-${which}`}
            value={choice}
            checked={chosen === choice}
            disabled={disabled}
            onChange={() => set(which, choice)}
          />
          {chosen === choice && <span aria-hidden="true">✓ </span>}
          {choice === 'short' ? 'მოკლე ისარი' : 'გრძელი ისარი'}
        </label>
      ))}
    </fieldset>
  );
  return (
    <div className="hp">
      <ClockFace time={timeOf(3, 0)} size={150} highlight="both" label="საათი: ორი ისარი, ერთი მოკლე და ერთი გრძელი" />
      <p className="hp-task">შეადარე ორი ისარი: ერთი მოკლეა, ერთი — გრძელი. აირჩიე, რომელი რას აჩვენებს.</p>
      {row('hour', hour)}
      {row('minute', minute)}
    </div>
  );
}

/** 2 and 3. Set the clock by dragging, in the unit's own step. */
export function SetClockAnswer({ response, value, onChange, disabled, label }: { response: SetClockResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const parsed = parseTime(value);
  const [time, setTime] = useState<ClockTime>(parsed ?? { h: 12, m: 0 });
  const step = response.step === 1 ? 1 : response.step === 30 ? 30 : 5;
  const update = (next: ClockTime) => {
    setTime(next);
    onChange(`${next.h},${next.m}`);
  };
  return (
    <div className="sc">
      <p className="sc-task">
        დააყენე საათი: <strong>{spokenTime(response.ask)}</strong> ({digitalText(response.ask)})
      </p>
      <SetClockBoard time={time} onChange={update} step={step as 1 | 5} disabled={disabled} label={label} />
      <div className="xt-row">
        <button type="button" className="btn btn-ghost btn-small" disabled={disabled || value === ''} onClick={() => { setTime({ h: 12, m: 0 }); onChange(''); }}>
          ↻ გასუფთავება
        </button>
      </div>
    </div>
  );
}

/** 2, 3 and 5. Read a face and choose its time. */
export function ReadClockAnswer({ response, value, onChange, disabled, label }: { response: ReadClockResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const chosen = split(value).join(',');
  return (
    <div className="rc">
      <ClockFace time={response.time} size={176} label={`საათი: ${spokenTime(response.time)}`} />
      <div className="lp-choices rc-choices" role="radiogroup" aria-label="რომელი დროა?">
        {response.options.map((option) => {
          const key = `${option.h},${option.m}`;
          const on = chosen === key;
          return (
            <label key={key} className={`lp-choice ${on ? 'is-selected' : ''} ${disabled ? 'is-locked' : ''}`}>
              <input type="radio" name={label} value={key} checked={on} disabled={disabled} onChange={() => onChange(key)} />
              <span className="lp-choice-dot" aria-hidden="true" />
              <span className="lp-choice-text">
                {digitalText(option)} <span className="rc-words">({spokenTime(option)})</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/** 4. Match analog faces to digital displays. */
export function MatchTimeAnswer({ response, value, onChange, disabled, label }: { response: MatchTimeResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const mapping = response.faces.map((_, i) => split(value)[i] ?? '');
  return (
    <MatchBoard faces={response.faces} displays={response.displays} mapping={mapping} onChange={(next) => onChange(next.join(','))} disabled={disabled} label={label} />
  );
}

// ═══════════════════════════ U08 · shapes ═══════════════════════════

/** 4. Sort shapes by their property. */
export function ShapeSortAnswer({ response, value, onChange, disabled, label }: { response: ShapeSortResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const groups = response.shapes.map((_, i) => split(value)[i] ?? '');
  return (
    <div className="f2-answer">
      <p className="f2-task">
        {response.groupBy === 'kind'
          ? 'დაალაგე ფიგურები სახეობის მიხედვით: წრე, სამკუთხედი, კვადრატი, მართკუთხედი.'
          : response.groupBy === 'sides'
            ? 'დაალაგე ფიგურები გვერდების რაოდენობის მიხედვით.'
            : 'დაალაგე ფიგურები კუთხეების რაოდენობის მიხედვით.'}
      </p>
      <ShapeSortBoard shapes={response.shapes} groupBy={response.groupBy} groups={groups} onChange={(next) => onChange(next.join(','))} disabled={disabled} label={label} />
    </div>
  );
}

/** 2 and 3. Tap each side or corner to count it. */
export function TapPartsAnswer({ response, value, onChange, disabled, label }: { response: TapPartsResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const counted = split(value).filter(Boolean).map(Number);
  return (
    <div className="tp-answer">
      <p className="tp-task">{response.tap === 'sides' ? 'შეეხე ყოველ გვერდს და დათვალე ისინი.' : 'შეეხე ყოველ კუთხეს და დათვალე ისინი.'}</p>
      <TapShapeBoard spec={response.shape} tap={response.tap} counted={counted} onChange={(next) => onChange(next.join(','))} disabled={disabled} label={label} />
    </div>
  );
}

/** 5. Find the objects with the asked shape. */
export function FindShapesAnswer({ response, value, onChange, disabled, label }: { response: FindShapesResponse; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const picked = split(value).filter(Boolean);
  return (
    <RoomBoard target={response.kind} items={response.items} picked={picked} onChange={(next) => onChange(next.join(','))} disabled={disabled} label={label} />
  );
}

// ═══════════════════════════ shared words ═══════════════════════════

/** "4 გვერდი, 4 კუთხე" for a shape in a prompt. */
export const shapeWords = (spec: FlatSpec): string => `${FLAT_NAME[shapeGroup(spec)]}: ${sidesOf(spec)} გვერდი, ${verticesOf(spec)} კუთხე`;

/** The group labels, for tests and prompts. */
export const shapeGroups = groupsFor;

/** A time label, with words, for an option list. */
export const timeLabel = (time: ClockTime): string => `${digitalText(time)} (${spokenTime(time)})`;

/** Whether two sets of picked ids are the same set. */
export const samePick = (a: string[], b: string[]): boolean => a.length === b.length && a.every((x) => b.includes(x));

/** Whether two times are the same, for the setting board's own display. */
export const isSameTime = (a: ClockTime | null, b: ClockTime): boolean => a !== null && sameTime(a, b);

/** Re-exported so a tool can show a readout without importing the board module twice. */
export { ClockReadout, DigitalDisplay, Shape2D };

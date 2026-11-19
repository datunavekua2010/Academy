import type { ResponseSpec, Verdict } from '../types';
import { ArrayBuildAnswer, ArrayReadAnswer, GroupStoryAnswer, MakeEqualAnswer } from './GroupsBoard';

/**
 * Answer controls for G2 U04. The boards live in `EqualGroups.tsx` (they are also used as pictures); these wrappers only
 * give each one the shape the player expects. Nothing here decides whether an answer is right — that is `check.ts`.
 */

export function MakeEqualAnswerControl(props: { response: Extract<ResponseSpec, { type: 'make-equal' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <MakeEqualAnswer response={{ groups: response.groups, each: response.each }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function ArrayReadAnswerControl(props: { response: Extract<ResponseSpec, { type: 'array-read' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <ArrayReadAnswer response={{ rows: response.rows, cols: response.cols }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function ArrayBuildAnswerControl(props: { response: Extract<ResponseSpec, { type: 'array-build' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <ArrayBuildAnswer response={{ total: response.total }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function GroupStoryAnswerControl(props: { response: Extract<ResponseSpec, { type: 'group-story' }>; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const { response, value, onChange, disabled, label } = props;
  return (
    <GroupStoryAnswer
      response={{ groups: response.groups, each: response.each, text: response.text, unit: response.unit, what: response.what }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      label={label}
    />
  );
}

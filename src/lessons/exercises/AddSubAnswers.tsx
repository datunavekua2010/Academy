import type { ResponseSpec, Verdict } from '../types';
import { ColumnAnswer, DifferenceStepsBoard, StoryBoard, SumStepsBoard } from './AddSubBoard';

/**
 * Answer controls for G2 U03. The boards live in `AddSubBoard.tsx` (they are also used as pictures); these wrappers only
 * give each one the shape the player expects. Nothing here decides whether an answer is right — that is `check.ts`.
 */

export function ColumnSumAnswer(props: { response: Extract<ResponseSpec, { type: 'column-sum' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <ColumnAnswer response={{ a: response.a, b: response.b, op: response.op }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function SumStepsAnswer(props: { response: Extract<ResponseSpec, { type: 'sum-steps' }>; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const { response, value, onChange, disabled, label } = props;
  return <SumStepsBoard response={{ a: response.a, b: response.b }} value={value} onChange={onChange} disabled={disabled} label={label} />;
}

export function DifferenceStepsAnswer(props: { response: Extract<ResponseSpec, { type: 'difference-steps' }>; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const { response, value, onChange, disabled, label } = props;
  return <DifferenceStepsBoard response={{ a: response.a, b: response.b }} value={value} onChange={onChange} disabled={disabled} label={label} />;
}

export function StoryProblemAnswer(props: { response: Extract<ResponseSpec, { type: 'story-problem' }>; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const { response, value, onChange, disabled, label } = props;
  return (
    <StoryBoard
      response={{ kind: response.kind, a: response.a, b: response.b, story: response.story, unit: response.unit }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      label={label}
    />
  );
}

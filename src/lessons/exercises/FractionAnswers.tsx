import type { ResponseSpec, Verdict } from '../types';
import { FractionNameAnswer, FractionPickAnswer, PartsJudgeAnswer } from './FractionBoard';

/**
 * Answer controls for G2 U07. The boards live in `FractionBoard.tsx` (they are also used as pictures); these wrappers
 * only give each one the shape the player expects. Nothing here decides whether an answer is right — that is `check.ts`.
 */

export function PartsJudgeAnswerControl(props: { response: Extract<ResponseSpec, { type: 'parts-judge' }>; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const { response, value, onChange, disabled, label } = props;
  return <PartsJudgeAnswer response={{ shape: response.shape }} value={value} onChange={onChange} disabled={disabled} label={label} />;
}

export function FractionPickAnswerControl(props: { response: Extract<ResponseSpec, { type: 'fraction-pick' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <FractionPickAnswer response={{ shape: response.shape, need: response.need, noun: response.noun }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function FractionNameAnswerControl(props: { response: Extract<ResponseSpec, { type: 'fraction-name' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <FractionNameAnswer response={{ shape: response.shape, take: response.take }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

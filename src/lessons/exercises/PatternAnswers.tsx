import type { Verdict } from '../types';
import { SequenceFillBoard, SequenceRuleBoard, SkipBoard } from './PatternBoard';

/**
 * Answer controls for G2 U02. The boards live in `PatternBoard.tsx` (they are also used as pictures); these wrappers only
 * give each one the shape the player expects. Nothing here decides whether an answer is right — that is `check.ts`.
 */

export function SkipLineAnswer(props: { response: Extract<import('../types').ResponseSpec, { type: 'skip-line' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return (
    <SkipBoard
      response={{ start: response.start, step: response.step, count: response.count, walker: response.walker }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      verdict={verdict}
      label={label}
    />
  );
}

export function SequenceFillAnswer(props: { response: Extract<import('../types').ResponseSpec, { type: 'sequence-fill' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return (
    <SequenceFillBoard
      response={{ start: response.start, step: response.step, count: response.count, holes: response.holes, arrows: response.arrows }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      verdict={verdict}
      label={label}
    />
  );
}

export function SequenceRuleAnswer(props: { response: Extract<import('../types').ResponseSpec, { type: 'sequence-rule' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return (
    <SequenceRuleBoard
      response={{ start: response.start, step: response.step, count: response.count, options: response.options }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      verdict={verdict}
      label={label}
    />
  );
}

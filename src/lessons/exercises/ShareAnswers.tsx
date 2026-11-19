import type { ResponseSpec, Verdict } from '../types';
import { DivisionSentenceAnswer, FactFamilyAnswer, GroupIntoAnswer, ShareFairAnswer, ShareGroupsAnswer } from './ShareBoard';

/**
 * Answer controls for G2 U06. The boards live in `ShareBoard.tsx` (they are also used as pictures); these wrappers only
 * give each one the shape the player expects. Nothing here decides whether an answer is right — that is `check.ts`.
 */

export function ShareFairAnswerControl(props: { response: Extract<ResponseSpec, { type: 'share-fair' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <ShareFairAnswer response={{ total: response.total, people: response.people, glyph: response.glyph }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function ShareGroupsAnswerControl(props: { response: Extract<ResponseSpec, { type: 'share-groups' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <ShareGroupsAnswer response={{ total: response.total, groups: response.groups, glyph: response.glyph }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function GroupIntoAnswerControl(props: { response: Extract<ResponseSpec, { type: 'group-into' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <GroupIntoAnswer response={{ total: response.total, size: response.size, glyph: response.glyph }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function DivisionSentenceAnswerControl(props: { response: Extract<ResponseSpec, { type: 'division-sentence' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <DivisionSentenceAnswer response={{ total: response.total, by: response.by, family: response.family }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function FactFamilyAnswerControl(props: { response: Extract<ResponseSpec, { type: 'fact-family' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <FactFamilyAnswer response={{ a: response.a, b: response.b, missing: response.missing }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

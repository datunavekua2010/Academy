import type { ResponseSpec, Verdict } from '../types';
import { TableBuildAnswer, TableGridAnswer, TimesFactAnswer, TimesMissingAnswer } from './TimesBoard';

/**
 * Answer controls for G2 U05. The boards live in `TimesBoard.tsx` (they are also used as pictures); these wrappers only
 * give each one the shape the player expects. Nothing here decides whether an answer is right — that is `check.ts`.
 */

export function TimesFactAnswerControl(props: { response: Extract<ResponseSpec, { type: 'times-fact' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <TimesFactAnswer response={{ table: response.table, factor: response.factor, max: response.max }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function TimesMissingAnswerControl(props: { response: Extract<ResponseSpec, { type: 'times-missing' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return <TimesMissingAnswer response={{ table: response.table, factor: response.factor, missing: response.missing, max: response.max }} value={value} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
}

export function TableBuildAnswerControl(props: { response: Extract<ResponseSpec, { type: 'table-build' }>; value: string; onChange: (v: string) => void; disabled: boolean; label: string }) {
  const { response, value, onChange, disabled, label } = props;
  return <TableBuildAnswer response={{ table: response.table, upTo: response.upTo }} value={value} onChange={onChange} disabled={disabled} label={label} />;
}

export function TableGridAnswerControl(props: { response: Extract<ResponseSpec, { type: 'table-grid' }>; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict; label: string }) {
  const { response, value, onChange, disabled, verdict, label } = props;
  return (
    <TableGridAnswer
      response={{ tables: response.tables, factors: response.factors, ask: response.ask, target: response.target }}
      value={value}
      onChange={onChange}
      disabled={disabled}
      verdict={verdict}
      label={label}
    />
  );
}

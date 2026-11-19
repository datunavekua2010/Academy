import { useId, type KeyboardEvent } from 'react';
import { parseNumber } from '../algebra';
import { RichText } from '../RichText';
import { NumberLine } from './NumberLine';
import { ObjectField } from './Objects';
import { CounterBoard, type Counts } from './CounterBoard';
import { FrameBoard, cellsFor } from './FrameBoard';
import { OrderBoard } from './OrderBoard';
import { SplitBoard } from './SplitBoard';
import { VisualBare } from './Visuals';
import { JumpBoard } from './JumpTools';
import { MakeTenBoard } from './MakeTenTools';
import { StoryAnswer } from './StoryTools';
import { TakeAwayBoard } from './TakeAwayBoard';
import { CutBoard, ReassembleBoard, SelectBoard, SortBoard, parseGroups } from './ShapeAnswers';
import { ComparableBoard, describeShape } from './ShapeBoard';
import { AlignCompareBoard, LengthSortBoard, MeasureUnitsBoard, RulerReadBoard, UnitPickAnswer } from './LengthAnswers';
import { FindShapesAnswer, HandPickAnswer, MatchTimeAnswer, ReadClockAnswer, SetClockAnswer, ShapeSortAnswer, TapPartsAnswer } from './TimeShapeAnswers';
import { BalancePansAnswer, BalancePuzzleAnswer, CluePickAnswer, EqualGroupsAnswer, SentenceBuildAnswer, SentencePickAnswer } from './BalanceAnswers';
import { ChartBuildAnswer, ChartReadAnswer, SortGridAnswer, SortGroupsAnswer, VennSortAnswer } from './SortAnswers';
import { DigitTapAnswer, ExpandedBuildAnswer, PlaceBuildAnswer, PlaceMissingAnswer } from './PlaceValueAnswers';
import { SequenceFillAnswer, SequenceRuleAnswer, SkipLineAnswer } from './PatternAnswers';
import { ColumnSumAnswer, DifferenceStepsAnswer, StoryProblemAnswer, SumStepsAnswer } from './AddSubAnswers';
import { ArrayBuildAnswerControl, ArrayReadAnswerControl, GroupStoryAnswerControl, MakeEqualAnswerControl } from './GroupsAnswers';
import { TableBuildAnswerControl, TableGridAnswerControl, TimesFactAnswerControl, TimesMissingAnswerControl } from './TimesAnswers';
import { DivisionSentenceAnswerControl, FactFamilyAnswerControl, GroupIntoAnswerControl, ShareFairAnswerControl, ShareGroupsAnswerControl } from './ShareAnswers';
import { FractionNameAnswerControl, FractionPickAnswerControl, PartsJudgeAnswerControl } from './FractionAnswers';
import type { AnswerInput, ChoiceOption, ResponseSpec, Verdict } from '../types';

/**
 * Renders the answer control for a response spec. Presentation only: it never
 * decides whether an answer is right (see `check.ts`).
 */

interface Props {
  response: ResponseSpec;
  value: AnswerInput;
  onChange: (value: AnswerInput) => void;
  onSubmit: () => void;
  /** Locks the control once the question is finished. */
  disabled: boolean;
  /** Verdict of the last submission, used to mark the chosen option. */
  verdict?: Verdict;
  /** Accessible label for text inputs. */
  label: string;
  /** How many hints the student has opened (some responses show extra help after a hint). */
  hintsShown?: number;
}

function CheckIcon() {
  return (
    <svg className="lp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
function CrossIcon() {
  return (
    <svg className="lp-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}

function Choices({ options, value, onChange, disabled, verdict }: { options: ChoiceOption[]; value: string; onChange: (v: string) => void; disabled: boolean; verdict?: Verdict }) {
  const group = useId();
  return (
    <div className={`lp-choices ${options.some((o) => o.visual) ? 'has-pics' : ''}`} role="radiogroup" aria-label="პასუხის ვარიანტები">
      {options.map((option) => {
        const selected = value === option.id;
        const mark = selected && verdict === 'correct' ? 'correct' : selected && verdict === 'incorrect' ? 'wrong' : '';
        return (
          <label key={option.id} className={`lp-choice ${selected ? 'is-selected' : ''} ${mark ? `is-${mark}` : ''} ${disabled ? 'is-locked' : ''}`}>
            <input type="radio" name={group} value={option.id} checked={selected} disabled={disabled} onChange={() => onChange(option.id)} />
            <span className="lp-choice-dot" aria-hidden="true" />
            {option.visual && (
              <span className="lp-choice-pic">
                <VisualBare spec={option.visual} compact />
              </span>
            )}
            <RichText text={option.text} className="lp-choice-text" />
            {mark === 'correct' && (
              <span className="lp-choice-tag">
                <CheckIcon /> სწორია
              </span>
            )}
            {mark === 'wrong' && (
              <span className="lp-choice-tag">
                <CrossIcon /> არასწორია
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}

export function ResponseInput({ response, value, onChange, onSubmit, disabled, verdict, label, hintsShown = 0 }: Props) {
  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  switch (response.type) {
    case 'choice':
      return <Choices options={response.options} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} />;
    case 'numeric':
    case 'expression':
      return (
        <div className="lp-field">
          <input
            className="lp-input"
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label={label}
            placeholder={response.type === 'expression' ? (response.placeholder ?? 'ჩაწერე პასუხი') : 'ჩაწერე რიცხვი'}
            value={typeof value === 'string' ? value : ''}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onEnter}
          />
          {response.type === 'numeric' && response.unit && <span className="lp-unit">{response.unit}</span>}
        </div>
      );
    case 'line': {
      const picked = parseNumber(typeof value === 'string' ? value : '');
      const shown = picked ?? response.start ?? null;
      return (
        <div className="lp-line">
          <NumberLine
            min={response.min}
            max={response.max}
            value={shown}
            start={response.start ?? null}
            labelled={response.labelled}
            arrows={response.arrows !== false}
            showValue={response.showValue}
            disabled={disabled}
            onChange={(n) => onChange(String(n))}
            ariaLabel={`${label}. რიცხვითი ღერძი ${response.min}-დან ${response.max}-მდე`}
          />
        </div>
      );
    }
    case 'collect': {
      const picked = new Set(typeof value === 'string' && value ? value.split(',').filter(Boolean).map(Number) : []);
      const toggle = (i: number) => {
        const next = new Set(picked);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        onChange([...next].sort((a, b) => a - b).join(','));
      };
      return (
        <div className="lp-collect">
          <ObjectField count={response.total} glyph={response.glyph} layout={response.layout} seed={response.seed} picked={picked} onTap={disabled ? undefined : toggle} label={label} />
          <output className="objs-count" aria-live="polite">
            არჩეულია: <strong>{picked.size}</strong>
          </output>
        </div>
      );
    }
    case 'order': {
      const parsed = typeof value === 'string' && value ? value.split(',').map(Number) : response.items;
      const order = parsed.length === response.items.length ? parsed : response.items;
      return (
        <OrderBoard
          base={response.items}
          order={order}
          onChange={(next) => onChange(next.join(','))}
          disabled={disabled}
          line={response.lineAfterHint && hintsShown > 0 ? { min: response.min ?? 0, max: response.max ?? 20 } : null}
          ariaLabel={label}
        />
      );
    }
    case 'split': {
      const left = typeof value === 'string' && value !== '' ? Number(value) : response.total;
      return <SplitBoard total={response.total} left={Number.isFinite(left) ? left : response.total} onChange={(n) => onChange(String(n))} disabled={disabled} frame={response.frame} ariaLabel={label} />;
    }
    case 'distribute': {
      const [a, b] = typeof value === 'string' && value ? value.split(',').map((n) => Math.max(0, Number(n) || 0)) : [0, 0];
      const counts: Counts = [Math.max(0, response.total - a - b), a, b];
      return (
        <CounterBoard
          counts={counts}
          onChange={(c) => onChange(`${c[1]},${c[2]}`)}
          disabled={disabled}
          glyph={response.glyph}
          palette={response.palette}
          labels={['დიდი ჭურჭელი', 'პირველი ყუთი', 'მეორე ყუთი']}
          ariaLabel={label}
        />
      );
    }
    case 'fill': {
      const added = Math.min(response.size - response.given, Math.max(0, Number(typeof value === 'string' ? value : 0) || 0));
      const cells = cellsFor(response.size, response.given, added);
      const tap = (i: number) => {
        if (i < response.given) return;
        // a tap on an empty space adds a counter; a tap on an added counter takes one back
        if (i >= response.given + added) onChange(String(Math.min(response.size - response.given, added + 1)));
        else onChange(String(Math.max(0, added - 1)));
      };
      return (
        <div className="lp-fill">
          <FrameBoard cells={cells} onCell={disabled ? undefined : tap} label={response.size === 5 ? 'ხუთეულის ჩარჩო' : 'ათიანი ჩარჩო'} />
          <output className="objs-count" aria-live="polite">
            პირველი ჯგუფი: <strong>{response.given}</strong> · დაამატე: <strong>{added}</strong>
          </output>
        </div>
      );
    }
    case 'jumps':
      return <JumpBoard response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'takeaway': {
      const removed = typeof value === 'string' && value ? value.split(',').filter(Boolean).map(Number) : [];
      const toggle = (i: number) => onChange((removed.includes(i) ? removed.filter((x) => x !== i) : [...removed, i]).join(','));
      return <TakeAwayBoard total={response.total} glyph={response.glyph} removed={removed} onToggle={disabled ? undefined : toggle} label={label} />;
    }
    case 'make-ten':
      return <MakeTenBoard response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'story':
      return <StoryAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} onSubmit={onSubmit} disabled={disabled} label={label} />;
    case 'blanks': {
      const values = Array.isArray(value) ? value : [];
      return (
        <div className="lp-blanks" aria-label={label}>
          {response.template.split(/(\{\d+\})/).map((part, i) => {
            const m = /^\{(\d+)\}$/.exec(part);
            if (!m) return part ? <RichText key={i} text={part} /> : null;
            const index = Number(m[1]) - 1;
            return (
              <input
                key={i}
                className="lp-input lp-blank"
                type="text"
                inputMode="text"
                autoComplete="off"
                aria-label={`ცარიელი ადგილი ${index + 1}`}
                value={values[index] ?? ''}
                disabled={disabled}
                onChange={(e) => {
                  const next = [...values];
                  while (next.length < response.answers.length) next.push('');
                  next[index] = e.target.value;
                  onChange(next);
                }}
                onKeyDown={onEnter}
              />
            );
          })}
        </div>
      );
    }
    case 'classify': {
      const groups = parseGroups(typeof value === 'string' ? value : '', response.items.length);
      return (
        <SortBoard
          items={response.items}
          rule={response.rule}
          groups={groups}
          onChange={(next) => onChange(next.join(','))}
          disabled={disabled}
          label={label}
        />
      );
    }
    case 'judge': {
      const picked = typeof value === 'string' ? value : '';
      const options =
        response.rule === 'equal'
          ? [
              { id: 'e', label: 'ტოლი ნაწილები', icon: '＝' },
              { id: 'u', label: 'არატოლი ნაწილები', icon: '≠' },
            ]
          : [
              { id: 'y', label: response.rule === 'halves' ? 'დიახ, ნახევრებია' : 'დიახ, მეოთხედებია', icon: '✓' },
              { id: 'n', label: response.rule === 'halves' ? 'არა, ნახევრები არ არის' : 'არა, მეოთხედები არ არის', icon: '✗' },
            ];
      return (
        <div className="judge">
          <ComparableBoard spec={response.shape} label={describeShape(response.shape)} compare={Boolean(response.compare)} explain={false} />
          <div className="lp-choices judge-choices" role="radiogroup" aria-label="პასუხის ვარიანტები">
            {options.map((option) => {
              const selected = picked === option.id;
              const mark = selected && verdict === 'correct' ? 'correct' : selected && verdict === 'incorrect' ? 'wrong' : '';
              return (
                <label key={option.id} className={`lp-choice ${selected ? 'is-selected' : ''} ${mark ? `is-${mark}` : ''} ${disabled ? 'is-locked' : ''}`}>
                  <input type="radio" name={label} value={option.id} checked={selected} disabled={disabled} onChange={() => onChange(option.id)} />
                  <span className="lp-choice-dot" aria-hidden="true" />
                  <span className="lp-choice-text">
                    <span aria-hidden="true">{option.icon}</span> {option.label}
                  </span>
                  {mark === 'correct' && (
                    <span className="lp-choice-tag">
                      <CheckIcon /> სწორია
                    </span>
                  )}
                  {mark === 'wrong' && (
                    <span className="lp-choice-tag">
                      <CrossIcon /> არასწორია
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      );
    }
    case 'select-parts': {
      const picked = typeof value === 'string' && value ? value.split(',').map(Number).filter((n) => Number.isInteger(n)) : [];
      return (
        <SelectBoard
          spec={response.shape}
          need={response.need}
          picked={picked}
          onChange={(next) => onChange(next.join(','))}
          disabled={disabled}
          label={label}
          noun={response.noun}
        />
      );
    }
    case 'reassemble':
      return <ReassembleBoard shape={response.shape} decoys={response.decoys} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'hand-pick':
      return <HandPickAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'set-clock':
      return <SetClockAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'read-clock':
      return <ReadClockAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'match-time':
      return <MatchTimeAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'shape-sort':
      return <ShapeSortAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'tap-parts':
      return <TapPartsAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'find-shapes':
      return <FindShapesAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'align-compare':
      return (
        <AlignCompareBoard
          response={response}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          disabled={disabled}
          label={label}
        />
      );
    case 'length-sort':
      return (
        <LengthSortBoard
          response={response}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          disabled={disabled}
          label={label}
        />
      );
    case 'measure-units':
      return (
        <MeasureUnitsBoard
          response={response}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          disabled={disabled}
          label={label}
        />
      );
    case 'ruler-read':
      return (
        <RulerReadBoard
          response={response}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          disabled={disabled}
          label={label}
        />
      );
    case 'unit-pick':
      return (
        <UnitPickAnswer
          response={response}
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          disabled={disabled}
          label={label}
        />
      );
    case 'balance-pans':
      return <BalancePansAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'equal-groups':
      return <EqualGroupsAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'sentence-build':
      return <SentenceBuildAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'sentence-pick':
      return <SentencePickAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'balance-puzzle':
      return <BalancePuzzleAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'sort-groups':
      return <SortGroupsAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'sort-grid':
      return <SortGridAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'venn-sort':
      return <VennSortAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'chart-read':
      return <ChartReadAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'chart-build':
      return <ChartBuildAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'clue-pick':
      return <CluePickAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'place-build':
      return <PlaceBuildAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'expanded-build':
      return <ExpandedBuildAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'digit-tap':
      return <DigitTapAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'place-missing':
      return <PlaceMissingAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'skip-line':
      return <SkipLineAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'sequence-fill':
      return <SequenceFillAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'sequence-rule':
      return <SequenceRuleAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'column-sum':
      return <ColumnSumAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'sum-steps':
      return <SumStepsAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'difference-steps':
      return <DifferenceStepsAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'story-problem':
      return <StoryProblemAnswer response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'make-equal':
      return <MakeEqualAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'array-read':
      return <ArrayReadAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'array-build':
      return <ArrayBuildAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'group-story':
      return <GroupStoryAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'times-fact':
      return <TimesFactAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'times-missing':
      return <TimesMissingAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'table-build':
      return <TableBuildAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'table-grid':
      return <TableGridAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'share-fair':
      return <ShareFairAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'share-groups':
      return <ShareGroupsAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'group-into':
      return <GroupIntoAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'division-sentence':
      return <DivisionSentenceAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'fact-family':
      return <FactFamilyAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'parts-judge':
      return <PartsJudgeAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} label={label} />;
    case 'fraction-pick':
      return <FractionPickAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'fraction-name':
      return <FractionNameAnswerControl response={response} value={typeof value === 'string' ? value : ''} onChange={onChange} disabled={disabled} verdict={verdict} label={label} />;
    case 'cut':
      return (
        <CutBoard
          shape={response.shape}
          parts={response.parts}
          maxCuts={response.maxCuts}
          skin={response.skin}
          compare={Boolean(response.compare)}
          tell="count"
          value={typeof value === 'string' ? value : ''}
          onChange={onChange}
          disabled={disabled}
          label={label}
        />
      );
  }
}

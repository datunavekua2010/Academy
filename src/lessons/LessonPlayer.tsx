import { useEffect, useMemo, useRef, useState } from 'react';
import { Mascot } from '../components/Mascot';
import { PreviewAnswerGuard } from '../components/PreviewAnswerGuard';
import { Link } from '../router';
import { allUnits, getUnit, nextLessonInUnit } from './catalog';
import { lessonHref } from './routes';
import { clearFeedback, initialAttempt, showNextHint, submitAnswer, type AttemptState } from './attempt';
import { discoveryLine, introLine, reactionLine, tapLine } from './dialogue';
import { Feedback } from './exercises/Feedback';
import { ResponseInput } from './exercises/ResponseInput';
import { ExploreToolView } from './exercises/ExploreTools';
import { TilesBoard } from './exercises/TilesBoard';
import { BondDemo } from './exercises/BondTools';
import { DoublesDemo } from './exercises/DoublesTools';
import { JumpDemo } from './exercises/JumpTools';
import { TenDemo } from './exercises/MakeTenTools';
import { StoryDemo } from './exercises/StoryTools';
import { ChainDemo, CompareBlock, ComposeDemo, CountDemo, HopDemo, OrderDemo, QuantitiesBlock, ShapeDemo, VisualView } from './exercises/Visuals';
import { MeasureDemo } from './exercises/MeasureTools';
import { ObjectRow } from './exercises/LengthBoard';
import { ClockDemo, Shape2DDemo } from './exercises/TimeShapeTools';
import { BalanceDemo } from './exercises/BalanceTools';
import { ChartDemo, SortDemo } from './exercises/SortTools';
import { ExpandedDemo, PlaceDemo } from './exercises/PlaceValueTools';
import { GroupCount, SequencePicture, SkipLine } from './exercises/PatternBoard';
import { SkipDemo } from './exercises/PatternTools';
import { AnswerColumns, StoryPicture } from './exercises/AddSubBoard';
import { DifferenceDemo, SumDemo, SumStoryDemo } from './exercises/AddSubTools';
import { ArrayBoard, EqualGroups, RepeatedLine, UnevenGroups } from './exercises/GroupsBoard';
import { ArrayDemo, FourWaysDemo, GroupsDemo } from './exercises/GroupsTools';
import { CountByDemo, DoubleDemo, TableDemo } from './exercises/TimesTools';
import { ShareDemo } from './exercises/ShareTools';
import { FractionDemo } from './exercises/FractionTools';
import { CalendarDemo, ElapsedDemo } from './exercises/CalendarTools';
import { MoneyDemo } from './exercises/MoneyTools';
import { SymmetryDemo } from './exercises/SymmetryTools';
import { SentenceDemo, InverseDemo, ChainDemo as PuzzleChainDemo } from './exercises/PuzzleTools';
import { RoundingDemo } from './exercises/RoundingTools';
import { ThreeDigitDemo } from './exercises/ThreeDigitTools';
import { BarModelDemo } from './exercises/BarModelTools';
import { TimesGroups } from './exercises/TimesBoard';
import { ExpandedLine, PlaceCards } from './exercises/PlaceValueBoard';
import { ClockFace } from './exercises/ClockBoard';
import { Shape2DRow } from './exercises/Shape2DBoard';
import { markCompleted, markStarted, useLessonProgress } from './progress';
import { RichText, plainText } from './RichText';
import { getLessonContent, showDevLabels } from './content';
import type { Activity, AnswerInput, ExplainActivity, ExplainBlock, Lesson, LessonEntry, Question, QuestionActivity, Stage, TilesActivity } from './types';

/**
 * The lesson player. It knows nothing about any particular lesson: everything
 * it shows comes from the `Lesson` data and the catalog entry.
 */

const STAGE_LABEL: Record<Stage, string> = {
  challenge: 'გამოწვევა',
  explore: 'გამოკვლევა',
  understand: 'გააზრება',
  practice: 'პრაქტიკა',
  check: 'შემოწმება',
};

interface Props {
  entry: LessonEntry;
  lesson: Lesson;
  /** Where "back" goes: the unit's lesson list. */
  backTo: string;
  preview?: boolean;
}

interface Coach {
  kind: 'intro' | 'hint' | 'reaction' | 'discovery';
  text: string;
  label?: string;
}

const isQuestionLike = (a: Activity): a is QuestionActivity | TilesActivity => a.kind === 'question' || a.kind === 'tiles';

function ExplainView({ activity }: { activity: ExplainActivity }) {
  return (
    <div className="lp-explain">
      <RichText text={activity.prompt} className="lp-lead" />
      {activity.blocks.map((block: ExplainBlock, i) => {
        switch (block.type) {
          case 'text':
            return (
              <p className="lp-text" key={i}>
                <RichText text={block.text} />
              </p>
            );
          case 'equation':
            return (
              <figure className="lp-equation" key={i}>
                <div className="lp-equation-lines">
                  {block.lines.map((line, k) => (
                    <div key={k} className="lp-equation-line" style={{ animationDelay: `${k * 0.18}s` }}>
                      <RichText text={`$${line}$`} />
                    </div>
                  ))}
                </div>
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );
          case 'worked':
            return (
              <section className="lp-worked" key={i} aria-label="ამოხსნილი მაგალითი">
                <h3>
                  <RichText text={block.title} />
                </h3>
                <ol>
                  {block.steps.map((step, k) => (
                    <li key={k}>
                      <RichText text={step.text} />
                      {step.math && (
                        <div className="lp-step-math">
                          <RichText text={`$${step.math}$`} />
                        </div>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            );
          case 'chain':
            return <ChainDemo key={i} block={block} />;
          case 'hops':
            return <HopDemo key={i} block={block} />;
          case 'quantities':
            return <QuantitiesBlock key={i} block={block} />;
          case 'count-demo':
            return <CountDemo key={i} block={block} />;
          case 'compare':
            return <CompareBlock key={i} block={block} />;
          case 'order-demo':
            return <OrderDemo key={i} block={block} />;
          case 'compose':
            return <ComposeDemo key={i} block={block} />;
          case 'bond-demo':
            return <BondDemo key={i} block={block} />;
          case 'jump-demo':
            return <JumpDemo key={i} block={block} />;
          case 'ten-demo':
            return <TenDemo key={i} block={block} />;
          case 'doubles-demo':
            return <DoublesDemo key={i} block={block} />;
          case 'story-demo':
            return <StoryDemo key={i} block={block} />;
          case 'shape-demo':
            return <ShapeDemo key={i} block={block} />;
          case 'measure-demo':
            return <MeasureDemo key={i} block={block} />;
          case 'length':
            return <ObjectRow key={i} objects={block.objects} align={block.align} showCm={block.showCm} />;
          case 'clock':
            return <ClockFace key={i} time={block.time} showHands={block.showHands !== false} size={140} label="საათი" />;
          case 'flat':
            return <Shape2DRow key={i} shapes={block.shapes} showSides={block.showSides} />;
          case 'clock-demo':
            return <ClockDemo key={i} block={block} />;
          case 'shape2d-demo':
            return <Shape2DDemo key={i} block={block} />;
          case 'balance-demo':
            return <BalanceDemo key={i} block={block} />;
          case 'sort-demo':
            return <SortDemo key={i} block={block} />;
          case 'chart-demo':
            return <ChartDemo key={i} block={block} />;
          case 'place-demo':
            return <PlaceDemo key={i} block={block} />;
          case 'place-blocks':
            return <ExpandedDemo key={i} block={block} />;
          case 'place-cards':
            return <PlaceCards key={i} value={block.value} hide={block.hide} label="რიცხვის ციფრები" />;
          case 'expanded':
            return <ExpandedLine key={i} value={block.value} hide={block.hide} />;
          case 'sequence':
            return <SequencePicture key={i} items={block.items} arrows={block.arrows} caption={block.caption} />;
          case 'skip-line':
            return <SkipLine key={i} spec={{ start: block.start, step: block.step, count: block.count, hideLandings: block.hideLandings, walker: block.walker }} />;
          case 'group-count':
            return <GroupCount key={i} size={block.size} groups={block.groups} noun={block.noun} />;
          case 'skip-demo':
            return <SkipDemo key={i} block={block} />;
          case 'columns':
            return <AnswerColumns key={i} a={block.a} b={block.b} op={block.op} />;
          case 'story-model':
            return <StoryPicture key={i} a={block.a} b={block.b} kind={block.kind} unit={block.unit} />;
          case 'sum-demo':
            return <SumDemo key={i} block={block} />;
          case 'difference-demo':
            return <DifferenceDemo key={i} block={block} />;
          case 'story-demo2':
            return <SumStoryDemo key={i} block={block} />;
          case 'groups-equal':
            return <EqualGroups key={i} groups={block.groups} each={block.each} />;
          case 'groups-uneven':
            return <UnevenGroups key={i} sizes={block.sizes} />;
          case 'array':
            return <ArrayBoard key={i} spec={{ rows: block.rows, cols: block.cols }} />;
          case 'repeated':
            return <RepeatedLine key={i} groups={block.groups} each={block.each} />;
          case 'groups-demo':
            return <GroupsDemo key={i} block={block} />;
          case 'array-demo':
            return <ArrayDemo key={i} block={block} />;
          case 'four-ways':
            return <FourWaysDemo key={i} block={block} />;
          case 'table-demo':
            return <TableDemo key={i} block={block} />;
          case 'double-demo':
            return <DoubleDemo key={i} block={block} />;
          case 'count-by-demo':
            return <CountByDemo key={i} block={block} />;
          case 'share-demo':
            return <ShareDemo key={i} block={block} />;
          case 'fraction-demo':
            return <FractionDemo key={i} block={block} />;
          case 'calendar-demo':
            return <CalendarDemo key={i} block={block} />;
          case 'elapsed-demo':
            return <ElapsedDemo key={i} block={block} />;
          case 'money-demo':
            return <MoneyDemo key={i} block={block} />;
          case 'sentence-demo': return <SentenceDemo key={i} block={block} />;
          case 'inverse-demo': return <InverseDemo key={i} block={block} />;
          case 'chain-demo': return <PuzzleChainDemo key={i} block={block} />;
          case 'rounding-demo': return <RoundingDemo key={i} block={block} />;
          case 'three-digit-demo': return <ThreeDigitDemo key={i} block={block} />;
          case 'bar-model-demo': return <BarModelDemo key={i} block={block} />;
          case 'symmetry-demo':
            return <SymmetryDemo key={i} block={block} />;
          case 'share': {
            const per = Math.floor(block.total / block.people);
            const left = block.total % block.people;
            return (
              <div className="demo demo-share-static" key={i}>
                <TimesGroups key={0} table={per} factor={block.people} glyph={block.glyph ?? 'apple'} caption={left === 0 ? `${block.total} ÷ ${block.people} = ${per}` : `${block.total} ÷ ${block.people} = ${per}, ნაშთი ${left}`} />
              </div>
            );
          }
          case 'callout':
            return (
              <p className={`lp-callout is-${block.tone}`} key={i}>
                <strong>{block.tone === 'warning' ? 'ფრთხილად: ' : 'რჩევა: '}</strong>
                <RichText text={block.text} />
              </p>
            );
        }
      })}
    </div>
  );
}

export function LessonPlayer({ entry, lesson, backTo, preview = false }: Props) {
  const { activities } = lesson;
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>({});
  const [inputs, setInputs] = useState<Record<string, AnswerInput>>({});
  const [moved, setMoved] = useState<Record<string, number[]>>({});
  const [coach, setCoach] = useState<Coach | null>(null);
  const [waveKey, setWaveKey] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [exploreHint, setExploreHint] = useState(0);
  const stepRef = useRef<HTMLHeadingElement>(null);
  const progress = useLessonProgress();

  const activity = activities[index];
  const total = activities.length;
  const state = (isQuestionLike(activity) && attempts[activity.id]) || initialAttempt();

  const introFor = (i: number): Coach | null => {
    const a = activities[i];
    if (!a || a.stage === 'understand' || a.stage === 'check') return null;
    const firstOfStage = a.stage !== 'practice' || activities.findIndex((x) => x.stage === 'practice') === i;
    return firstOfStage ? { kind: 'intro', text: introLine(a) } : null;
  };

  useEffect(() => {
    if (!preview) markStarted(lesson.id);
  }, [lesson.id, preview]);

  useEffect(() => {
    setCoach(introFor(index));
    setExploreHint(0);
    stepRef.current?.focus({ preventScroll: true });
    window.scrollTo?.({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, runKey]);

  const checkIds = useMemo(() => activities.filter((a) => a.stage === 'check' && a.kind === 'question').map((a) => a.id), [activities]);
  const checkCorrect = checkIds.filter((id) => attempts[id]?.status === 'correct').length;
  const passed = checkCorrect >= lesson.completion.minCheckCorrect;

  const tileMoved = (a: TilesActivity): number[] => moved[a.id] ?? a.tiles.map(() => 0);
  const allMoved = (a: TilesActivity): boolean => tileMoved(a).every((m, i) => m >= a.tiles[i].count);

  const patch = (id: string, fn: (s: AttemptState) => AttemptState) => setAttempts((all) => ({ ...all, [id]: fn(all[id] ?? initialAttempt()) }));

  const question = (a: QuestionActivity | TilesActivity): Question => a;

  const exploreHints = activity.kind === 'explore' ? (activity.hints ?? []) : [];
  const giveExploreHint = () => {
    if (exploreHints.length === 0) return;
    setCoach({ kind: 'hint', text: exploreHints[exploreHint % exploreHints.length], label: exploreHints.length > 1 ? `მინიშნება ${(exploreHint % exploreHints.length) + 1} / ${exploreHints.length}` : 'მინიშნება' });
    setExploreHint((i) => i + 1);
  };

  const askHint = () => {
    if (exploreHints.length > 0) {
      giveExploreHint();
      return;
    }
    if (!isQuestionLike(activity)) return;
    const hints = question(activity).hints;
    if (state.hintsShown >= hints.length) return;
    patch(activity.id, (s) => showNextHint(s, activity));
    setCoach({ kind: 'hint', text: hints[state.hintsShown], label: `მინიშნება ${state.hintsShown + 1} / ${hints.length}` });
  };

  const tapMascot = () => {
    if (exploreHints.length > 0) {
      giveExploreHint();
      return;
    }
    const hints = isQuestionLike(activity) ? question(activity).hints : [];
    const line = tapLine(activity, hints, state.hintsShown);
    if (line.usedHint && isQuestionLike(activity)) {
      patch(activity.id, (s) => showNextHint(s, activity));
      setCoach({ kind: 'hint', text: line.text, label: `მინიშნება ${state.hintsShown + 1} / ${hints.length}` });
    } else {
      setCoach({ kind: 'intro', text: line.text });
    }
  };

  const submit = () => {
    if (preview || !isQuestionLike(activity) || state.status !== 'answering') return;
    if (state.last?.verdict === 'incorrect') return; // must press "try again" first
    const input = inputs[activity.id] ?? (activity.response.type === 'blanks' ? [] : '');
    const next = submitAnswer(state, activity, activity.stage, input);
    setAttempts((all) => ({ ...all, [activity.id]: next }));
    if (next.status === 'correct' && activity.kind === 'tiles') {
      const line = discoveryLine(activity);
      setCoach(line ? { kind: 'discovery', text: line } : null);
      setWaveKey((k) => k + 1);
    } else if (next.status === 'correct') {
      setCoach(null);
    } else {
      const text = reactionLine(next);
      setCoach(text ? { kind: 'reaction', text } : null);
    }
  };

  const retry = () => {
    if (!isQuestionLike(activity)) return;
    patch(activity.id, clearFeedback);
    setCoach(null);
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>('.lp-question input:not([disabled])')?.focus());
  };

  const next = () => {
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      if (!preview && passed) markCompleted(lesson.id, checkCorrect, checkIds.length);
      setCoach(null);
      setFinished(true);
      setWaveKey((k) => k + 1);
    }
  };

  const restartCheck = () => {
    const firstCheck = activities.findIndex((a) => a.stage === 'check');
    setAttempts((all) => {
      const copy = { ...all };
      for (const id of checkIds) delete copy[id];
      return copy;
    });
    setInputs((all) => {
      const copy = { ...all };
      for (const id of checkIds) delete copy[id];
      return copy;
    });
    setFinished(false);
    setIndex(Math.max(0, firstCheck));
    setRunKey((k) => k + 1);
  };

  const isLast = index === total - 1;

  // what comes after this lesson (completion screen)
  const nextEntry = nextLessonInUnit(lesson.id);
  const nextPlayable = nextEntry && getLessonContent(nextEntry.id) ? nextEntry : undefined;
  // after the last lesson of a unit: the first lesson of the next unit (same grade), when it exists
  const units = allUnits();
  const nextUnit = nextEntry ? undefined : units[units.findIndex((u) => u.id === entry.unitId) + 1];
  const nextUnitStart = nextUnit && nextUnit.grade === entry.grade && nextUnit.lessons[0] && getLessonContent(nextUnit.lessons[0].id) ? nextUnit.lessons[0] : undefined;
  const unitLessons = getUnit(entry.unitId)?.lessons ?? [];
  const unitComplete = passed && unitLessons.length > 0 && unitLessons.every((l) => l.id === lesson.id || progress[l.id]?.status === 'completed');

  // ───── the one primary action ─────
  type Action = { label: string; onClick: () => void; disabled?: boolean };
  let primary: Action;
  let showHintButton = false;

  if (preview) {
    primary = { label: isLast ? 'ნახვის დასრულება' : 'შემდეგი ნაბიჯი', onClick: next };
  } else if (!isQuestionLike(activity)) {
    primary = { label: isLast ? 'გაკვეთილის დასრულება' : 'გაგრძელება', onClick: next };
    showHintButton = exploreHints.length > 0;
  } else if (state.status !== 'answering') {
    primary = { label: isLast ? 'გაკვეთილის დასრულება' : 'გაგრძელება', onClick: next };
  } else if (activity.kind === 'tiles' && !allMoved(activity)) {
    primary = { label: 'გადაიტანე ყველა ფილა', onClick: () => undefined, disabled: true };
  } else if (state.last?.verdict === 'incorrect') {
    primary = { label: 'ხელახლა ცდა', onClick: retry };
    showHintButton = state.hintsShown < activity.hints.length;
  } else {
    primary = { label: 'პასუხის შემოწმება', onClick: submit };
    showHintButton = state.hintsShown < activity.hints.length;
  }

  const stepDone = !isQuestionLike(activity) ? false : state.status !== 'answering';
  const progressPct = finished ? 100 : Math.round(((index + (stepDone ? 1 : 0)) / total) * 100);
  const stage = activity.stage;
  const showMascot = !finished && stage !== 'understand';
  const showQuestion = isQuestionLike(activity) && (preview || activity.kind === 'question' || allMoved(activity));

  return (
    <div className="lp-root" data-testid="lesson-player">
      <header className="lp-top">
        <div className="lp-top-row">
          <Link to={backTo} className="lp-back" aria-label="უკან, გაკვეთილების სიაში">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="lp-title">
            <span className="lp-code">
              {entry.code}
              {showDevLabels() && lesson.status !== 'published' && <span className="lp-dev" data-testid="dev-label"> · DEV · {lesson.status === 'placeholder' ? 'დროებითი შინაარსი' : 'სამუშაო ვერსია'}</span>}
            </span>
            <span className="lp-name">{entry.title}</span>
          </div>
          <span className="lp-count" aria-hidden={finished}>
            {finished ? 'დასრულდა' : `ნაბიჯი ${index + 1} / ${total}`}
          </span>
        </div>
        <div className="lp-bar" role="progressbar" aria-label="გაკვეთილის პროგრესი" aria-valuemin={0} aria-valuemax={total} aria-valuenow={finished ? total : index + 1} aria-valuetext={finished ? 'დასრულდა' : `ნაბიჯი ${index + 1} ${total}-დან`}>
          <div className="lp-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </header>

      <div className="lp-body">
        <div className="lp-inner">
        {preview && <p className="guest-preview-note">სტუმრის რეჟიმი: შეგიძლია დაათვალიერო გაკვეთილი. პასუხისთვის საჭიროა აკადემიის ანგარიში.</p>}
        {showMascot && (
          <aside className="lp-coach" aria-label="Axi">
            <Mascot key={waveKey} scale={0.3} thoughts={['']} showThoughtBubble={false} waveOnMount={waveKey > 0} onClick={tapMascot} className="lp-mascot" buttonLabel="Axi — მინიშნების თხოვნა" />
            {coach && (
              <div className={`lp-bubble is-${coach.kind}`} role="status" aria-live="polite" key={`${coach.kind}-${coach.text}`}>
                {coach.label && <span className="lp-bubble-label">{coach.label}</span>}
                <RichText text={coach.text} />
                <button type="button" className="lp-bubble-close" onClick={() => setCoach(null)} aria-label="Axi-ს შეტყობინების დახურვა">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                    <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
                  </svg>
                </button>
              </div>
            )}
          </aside>
        )}

        {!finished && (
          <section className="lp-stage" key={`${runKey}-${activity.id}`}>
            <p className={`lp-stage-label is-${stage}`}>{STAGE_LABEL[stage]}</p>
            <h1 className="lp-heading" tabIndex={-1} ref={stepRef}>
              {activity.kind === 'explain' || activity.kind === 'tiles' || activity.kind === 'explore' ? activity.title : <RichText text={activity.prompt} />}
            </h1>

            {activity.kind === 'explore' && (
              <>
                <RichText text={activity.prompt} className="lp-lead" />
                <ExploreToolView tool={activity.tool} />
              </>
            )}

            {activity.kind === 'question' && activity.visual && <VisualView spec={activity.visual} />}

            {activity.kind === 'explain' && <ExplainView activity={activity} />}

            {activity.kind === 'tiles' && (
              <>
                <RichText text={activity.prompt} className="lp-lead" />
                <PreviewAnswerGuard preview={preview} key={`tiles-${activity.id}`}>
                <TilesBoard
                  groups={activity.tiles}
                  moved={tileMoved(activity)}
                  onMove={(gi) => !preview && setMoved((all) => ({ ...all, [activity.id]: tileMoved(activity).map((m, i) => (i === gi ? Math.min(m + 1, activity.tiles[gi].count) : m)) }))}
                  onReset={() => !preview && setMoved((all) => ({ ...all, [activity.id]: activity.tiles.map(() => 0) }))}
                  locked={state.status !== 'answering'}
                />
                </PreviewAnswerGuard>
              </>
            )}

            {showQuestion && isQuestionLike(activity) && (
              <div className="lp-question">
                {activity.kind === 'tiles' && <RichText text={activity.askPrompt} className="lp-ask" />}
                <PreviewAnswerGuard preview={preview} key={`response-${activity.id}`}>
                <ResponseInput
                  response={activity.response}
                  value={inputs[activity.id] ?? (activity.response.type === 'blanks' ? [] : '')}
                  onChange={(v) => {
                    if (preview) return;
                    setInputs((all) => ({ ...all, [activity.id]: v }));
                    if (state.last?.verdict === 'incomplete') patch(activity.id, clearFeedback);
                  }}
                  onSubmit={() => (state.last?.verdict === 'incorrect' ? retry() : submit())}
                  disabled={state.status !== 'answering' || state.last?.verdict === 'incorrect'}
                  verdict={state.last?.verdict}
                  label={plainText(activity.kind === 'tiles' ? activity.askPrompt : activity.prompt)}
                  hintsShown={state.hintsShown}
                  readOnly={preview}
                />
                </PreviewAnswerGuard>
                <Feedback question={activity} state={state} />
              </div>
            )}
          </section>
        )}

        {finished && preview && (
          <section className="lp-stage lp-done">
            <h1 className="lp-heading" tabIndex={-1} ref={stepRef}>გაკვეთილის ნახვა დასრულდა</h1>
            <p>პასუხის გასაცემად შედი აკადემიის ანგარიშით.</p>
          </section>
        )}
        {finished && !preview && (
          <section className="lp-stage lp-done" key="done">
            <p className="lp-stage-label is-done">{passed ? 'დასრულებულია' : 'კიდევ ერთი ცდა'}</p>
            <h1 className="lp-heading" tabIndex={-1} ref={stepRef}>
              {passed ? 'გაკვეთილი დასრულდა' : 'ჯერ არ დასრულებულა'}
            </h1>
            <div className="lp-summary">
              <div className="lp-score">
                <strong>
                  {checkCorrect} / {checkIds.length}
                </strong>
                <span>სწორი პასუხი შემოწმებაში</span>
              </div>
              <p className="lp-objective">
                <span>მიზანი:</span> <RichText text={lesson.objective} />
              </p>
              {lesson.concepts && lesson.concepts.length > 0 && (
                <div className="lp-concepts">
                  <span>ეს გავივარჯიშეთ:</span>
                  <ul>
                    {lesson.concepts.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {unitComplete && (
                <p className="lp-unit-done" role="status">
                  <strong>{entry.unitCode} დასრულდა.</strong> {entry.unitTitle}: ყველა გაკვეთილი გავიარე.
                </p>
              )}
              <p className="lp-done-note">{passed ? 'შენ დაძლიე ეს თემა. პროგრესი შენახულია.' : `დასრულებისთვის საჭიროა მინიმუმ ${lesson.completion.minCheckCorrect} სწორი პასუხი. სცადე შემოწმება ხელახლა.`}</p>
            </div>
            <div className="lp-done-coach">
              <Mascot key={`done-${waveKey}`} scale={0.34} thoughts={['']} showThoughtBubble={false} waveOnMount className="lp-mascot" buttonLabel="Axi" />
              <div className="lp-bubble is-intro">{passed ? (lesson.mascot?.complete ?? 'კარგი სამუშაო გააკეთე.') : (lesson.mascot?.retry ?? 'სცადე ისევ.')}</div>
            </div>
          </section>
        )}
        </div>
      </div>

      <footer className="lp-actions">
        <div className="lp-actions-inner">
          {!finished && showHintButton && (
            <button type="button" className="btn btn-ghost lp-secondary" onClick={askHint}>
              მინიშნება
            </button>
          )}
          {!finished ? (
            <button type="button" className="btn btn-primary lp-primary" onClick={primary.onClick} disabled={primary.disabled}>
              {primary.label}
            </button>
          ) : preview ? (
            <Link to={backTo} className="btn btn-primary lp-primary">გაკვეთილების სიაში დაბრუნება</Link>
          ) : passed && nextPlayable ? (
            <>
              <Link to={backTo} className="btn btn-ghost lp-secondary">
                {entry.unitCode}-ზე დაბრუნება
              </Link>
              <Link to={lessonHref(nextPlayable.id)} className="btn btn-primary lp-primary">
                გაგრძელება: {nextPlayable.code}
              </Link>
            </>
          ) : passed && nextUnitStart && unitComplete ? (
            <>
              <Link to={backTo} className="btn btn-ghost lp-secondary">
                {entry.unitCode}-ზე დაბრუნება
              </Link>
              <Link to={lessonHref(nextUnitStart.id)} className="btn btn-primary lp-primary">
                შემდეგი თემა: {nextUnitStart.code}
              </Link>
            </>
          ) : passed ? (
            <Link to={backTo} className="btn btn-primary lp-primary">
              {entry.unitCode}-ზე დაბრუნება
            </Link>
          ) : (
            <>
              <Link to={backTo} className="btn btn-ghost lp-secondary">
                სიაში დაბრუნება
              </Link>
              <button type="button" className="btn btn-primary lp-primary" onClick={restartCheck}>
                შემოწმების გამეორება
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

import { dueLabel } from '../format';
import { ScoreMeter } from './ScoreMeter';
import type { Assignment, SubtopicProgress } from '../store';
import type { Topic } from '../types';

interface SubtopicRowProps {
  topic: Topic;
  subtopic: { id: string; title: string; summary: string };
  progress: SubtopicProgress;
  assignment?: Assignment;
  onStart: () => void;
  questionCount: number;
}

/** One subtopic: status, best score, and the single "start / continue" action. */
export function SubtopicRow({
  topic,
  subtopic,
  progress,
  assignment,
  onStart,
  questionCount,
}: SubtopicRowProps) {
  const status = progress.completed
    ? { label: 'დასრულებული', cls: 'is-complete' }
    : progress.attempts > 0
      ? { label: 'მიმდინარე', cls: 'is-progress' }
      : { label: 'დასაწყები', cls: 'is-new' };

  return (
    <article className={`subtopic-row tone-${topic.tone} ${status.cls}`}>
      <div className="subtopic-main">
        <div className="subtopic-head">
          <h3>{subtopic.title}</h3>
          <span className={`status-pill ${status.cls}`}>{status.label}</span>
          {assignment && (
            <span className="status-pill is-assigned" title="მასწავლებლის მიერ მინიჭებული">
              📌 ვადა: {dueLabel(assignment)}
            </span>
          )}
        </div>
        <p>{subtopic.summary}</p>
        <div className="subtopic-meta">
          <span className="meta-chip">{questionCount} კითხვა ბანკში</span>
          {progress.attempts > 0 && (
            <>
              <span className="meta-chip">საუკეთესო: {progress.bestScore}</span>
              <span className="meta-chip">მცდელობა: {progress.attempts}</span>
            </>
          )}
        </div>
      </div>

      <div className="subtopic-side">
        {progress.attempts > 0 ? (
          <ScoreMeter score={progress.bestScore} markers={false} label="საუკეთესო ქულა" />
        ) : (
          <p className="subtopic-empty">ჯერ არ დაწყებულა</p>
        )}
        <button
          type="button"
          className={`btn ${status.cls === 'is-complete' ? 'btn-ghost' : 'btn-primary'} btn-small`}
          onClick={onStart}
        >
          {status.cls === 'is-complete'
            ? 'ხელახლა ვარჯიში'
            : status.cls === 'is-progress'
              ? 'გაგრძელება'
              : assignment
                ? 'დავალების დაწყება'
                : 'ვარჯიშის დაწყება'}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

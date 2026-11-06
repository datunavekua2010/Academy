import { useState } from 'react';
import { PageIntro } from './PageIntro';

const QUESTION = {
  prompt: 'რამდენია 3/4 + 1/4?',
  options: ['1', '4/8', '3/8'],
  correct: 0,
  explanation:
    'მნიშვნელი ერთი და იგივეა, ამიტომ მრიცველები შევკრიბოთ: 3 + 1 = 4, მნიშვნელი კი 4 რჩება. 4/4 = 1.',
};

const SETS = [
  { title: 'წილადების შეკვრა', level: 'მარტივი', count: 8, tone: 'teal' as const },
  { title: 'ტექსტური ამოცანები', level: 'საშუალო', count: 6, tone: 'blue' as const },
  { title: 'ლოგიკური კანონზომიერებები', level: 'საშუალო', count: 10, tone: 'yellow' as const },
  { title: 'გეომეტრიული ფორმები', level: 'უფრო რთული', count: 5, tone: 'pink' as const },
];

const LETTERS = ['ა', 'ბ', 'გ'];

export function Practice() {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === QUESTION.correct;

  return (
    <div className="student-page">
      <PageIntro
        eyebrow="ვარჯიში"
        title="სავარჯიშოები და ამოცანები"
        description="ვარჯიში ეხმარება ცოდნის გამყარებას. სცადე დღევანდელი პატარა ამოცანა და ნახე, როგორ ფიქრობ."
      />

      <div className="student-card quiz-card">
        <span className="eyebrow">
          <span className="eyebrow-dot" /> დღევანდელი ვარჯიში
        </span>
        <p className="quiz-question">{QUESTION.prompt}</p>
        <div className="quiz-options">
          {QUESTION.options.map((option, index) => {
            const state = !answered
              ? ''
              : index === QUESTION.correct
                ? 'is-correct'
                : index === selected
                  ? 'is-wrong'
                  : '';
            return (
              <button
                type="button"
                key={option}
                className={`quiz-option ${state}`}
                onClick={() => setSelected(index)}
                aria-pressed={selected === index}
              >
                <span className="option-letter" aria-hidden="true">
                  {LETTERS[index]}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        <div aria-live="polite">
          {answered && (
            <div className={`quiz-feedback ${isCorrect ? '' : 'is-wrong'}`}>
              {isCorrect ? 'სწორია! ' : 'სცადე ისევ. '}
              {QUESTION.explanation}
            </div>
          )}
        </div>
      </div>

      <div className="section-label">
        <h2>სავარჯიშო ნაკრები</h2>
        <span>აირჩიე თემა</span>
      </div>

      <div className="student-grid cols-2">
        {SETS.map((set) => (
          <article className={`student-card tone-${set.tone}`} key={set.title}>
            <div className="student-card-head">
              <div>
                <h3>{set.title}</h3>
                <p>{set.count} ამოცანა</p>
              </div>
              <span className="student-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <circle cx="12" cy="12" r="8.5" />
                  <circle cx="12" cy="12" r="4.5" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
                </svg>
              </span>
            </div>
            <div className="meta-row">
              <span className={`meta-chip tone-${set.tone}`}>{set.level}</span>
              <span className="meta-chip">ვარჯიში</span>
            </div>
          </article>
        ))}
      </div>

      <p className="demo-note">
        სრული სავარჯიშო ნაკრები მალე გაიხსნება. ეს გვერდი დემო ამოცანას
        შეიცავს და არ ინახავ შედეგს.
      </p>
    </div>
  );
}

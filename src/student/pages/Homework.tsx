import { useState } from 'react';
import { PageIntro } from './PageIntro';

interface Task {
  id: string;
  subject: string;
  title: string;
  due: string;
  tone: 'blue' | 'teal' | 'yellow' | 'pink';
}

const TASKS: Task[] = [
  {
    id: 'hw-1',
    subject: 'მათემატიკა',
    title: 'წილადების ამოცანები — გვერდი 42, №1–6',
    due: 'ხვალ, 18:00',
    tone: 'blue',
  },
  {
    id: 'hw-2',
    subject: 'მათემატიკა',
    title: 'ტექსტური ამოცანა: მაღაზიაში შესყიდვა',
    due: '12 ნოემბერი',
    tone: 'teal',
  },
  {
    id: 'hw-3',
    subject: 'ლოგიკა',
    title: 'ლოგიკური კანონზომიერებების გაგრძელება',
    due: '14 ნოემბერი',
    tone: 'yellow',
  },
  {
    id: 'hw-4',
    subject: 'მათემატიკა',
    title: 'გეომეტრიული ფორმების გაზომვა',
    due: '15 ნოემბერი',
    tone: 'pink',
  },
];

export function Homework() {
  const [done, setDone] = useState<string[]>(['hw-3']);

  const toggle = (id: string) => {
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const remaining = TASKS.length - done.length;

  return (
    <div className="student-page">
      <PageIntro
        eyebrow="საშინაო დავალება"
        title="დავალებები და ვადები"
        description="მონიშნე შესრულებული დავალებები, რომ არ დაგავიწყდეს. აქ მოცემულია დემო დავალებები — რეალურ სისტემაში ისინი მასწავლებლისგან მოვა."
      />

      <div className="task-summary" role="status" aria-live="polite">
        <strong>
          {done.length}/{TASKS.length}
        </strong>
        <span>
          {remaining === 0
            ? 'ყველა დავალება შესრულებულია — გილოცავ!'
            : `დარჩა ${remaining} დავალება.`}
        </span>
      </div>

      <div className="section-label">
        <h2>ჩემი დავალებები</h2>
        <span>მონიშნე შესრულებული</span>
      </div>

      <div className="task-list">
        {TASKS.map((task) => {
          const isDone = done.includes(task.id);
          return (
            <label className={`task-item tone-${task.tone} ${isDone ? 'is-done' : ''}`} key={task.id}>
              <input
                type="checkbox"
                className="task-input"
                checked={isDone}
                onChange={() => toggle(task.id)}
              />
              <span className="task-box" aria-hidden="true">
                ✓
              </span>
              <span className="task-body">
                <span className="task-title">{task.title}</span>
                <span className="task-meta">
                  <span className="task-subject">{task.subject}</span>
                  <span aria-hidden="true">•</span>
                  <span>ვადა: {task.due}</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>

      <p className="demo-note">
        დემო რეჟიმი: მონიშვნები არ ინახება გვერდის გადატვირთვისას.
      </p>
    </div>
  );
}

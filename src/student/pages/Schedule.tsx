import { PageIntro } from './PageIntro';

interface Lesson {
  time: string;
  title: string;
  tone: 'blue' | 'teal' | 'yellow' | 'pink' | 'violet' | 'green';
}

interface Day {
  day: string;
  date: string;
  today?: boolean;
  lessons: Lesson[];
}

const WEEK: Day[] = [
  {
    day: 'ორშაბათი',
    date: '10 ნოემბერი',
    lessons: [{ time: '16:00', title: 'მათემატიკა — წილადები', tone: 'blue' }],
  },
  {
    day: 'სამშაბათი',
    date: '11 ნოემბერი',
    lessons: [{ time: '17:00', title: 'ლოგიკა — კანონზომიერებები', tone: 'yellow' }],
  },
  {
    day: 'ოთხშაბათი',
    date: '12 ნოემბერი',
    lessons: [{ time: '16:00', title: 'მათემატიკა — ტექსტური ამოცანები', tone: 'teal' }],
  },
  {
    day: 'ხუთშაბათი',
    date: '13 ნოემბერი',
    lessons: [],
  },
  {
    day: 'პარასკევი',
    date: '14 ნოემბერი',
    today: true,
    lessons: [
      { time: '16:00', title: 'მათემატიკა — გეომეტრია', tone: 'pink' },
      { time: '17:30', title: 'ლოგიკა — ვარჯიში', tone: 'violet' },
    ],
  },
  {
    day: 'შაბათი',
    date: '15 ნოემბერი',
    lessons: [{ time: '12:00', title: 'მათემატიკა — შეჯამება', tone: 'green' }],
  },
];

export function Schedule() {
  return (
    <div className="student-page">
      <PageIntro
        eyebrow="განრიგი"
        title="კვირის გაკვეთილები"
        description="გადახედე კვირის განრიგს და მოემზადე გაკვეთილისთვის. დემო განრიგი ილუსტრაციულია."
      />

      <div className="schedule-list">
        {WEEK.map((day) => (
          <section className={`schedule-day ${day.today ? 'is-today' : ''}`} key={day.day}>
            <div className="schedule-day-name">
              <strong>
                {day.day} {day.today && <span className="meta-chip tone-blue">დღეს</span>}
              </strong>
              <span>{day.date}</span>
            </div>
            <div className="schedule-lessons">
              {day.lessons.length === 0 ? (
                <span className="schedule-empty">დღეს გაკვეთილი არ არის.</span>
              ) : (
                day.lessons.map((lesson) => (
                  <div className={`schedule-lesson tone-${lesson.tone}`} key={`${day.day}-${lesson.time}`}>
                    <span className="schedule-dot" aria-hidden="true" />
                    <time>{lesson.time}</time>
                    <strong>{lesson.title}</strong>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>

      <p className="demo-note">
        დემო განრიგი — რეალური დროები და გაკვეთილები უნდა შეავსოს აკადემიის
        სისტემამ.
      </p>
    </div>
  );
}

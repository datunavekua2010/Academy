import { PageIntro } from './PageIntro';

const TOPICS = [
  { title: 'რიცხვები და მოქმედებები', value: 90, tone: 'teal' },
  { title: 'წილადები', value: 72, tone: 'blue' },
  { title: 'ტექსტური ამოცანები', value: 60, tone: 'yellow' },
  { title: 'გეომეტრია', value: 45, tone: 'pink' },
];

const ACHIEVEMENTS = ['7 დღე ზედიზედ', '10 ამოცანა', 'პირველი შეფასება', 'სწრაფი პასუხი'];

export function Progress() {
  return (
    <div className="student-page">
      <PageIntro
        eyebrow="ჩემი პროგრესი"
        title="შედეგები და მიღწევები"
        description="პროგრესი გვიჩვენებს, რა გამოგივიდა კარგად და რაზე ღირს დამატებითი მუშაობა. ეს არის დემო მონაცემები."
      />

      <div className="student-grid cols-2">
        <section className="student-card">
          <div className="student-card-head">
            <div>
              <h3>საერთო პროგრესი</h3>
              <p>ბოლო 30 დღის შედეგი</p>
            </div>
            <span className="student-icon tone-teal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 20h16" />
                <path d="M7 20v-6M12 20V8M17 20v-9" />
                <path d="m5 9 4-4 3 3 5-5" />
              </svg>
            </span>
          </div>
          <div className="progress-item" style={{ marginTop: 18 }}>
            <div className="progress-label">
              <span>მთლიანი პროგრესი</span>
              <span>72%</span>
            </div>
            <div className="student-progress-track">
              <div className="student-progress-fill" style={{ width: '72%', background: 'var(--teal)' }} />
            </div>
          </div>
          <div className="achievement-row" aria-label="მიღწევები">
            {ACHIEVEMENTS.map((achievement) => (
              <span className="achievement" key={achievement}>
                <span aria-hidden="true">★</span> {achievement}
              </span>
            ))}
          </div>
        </section>

        <section className="student-card">
          <h3>თემების მიხედვით</h3>
          <p>რომელ თემებზე გვჭირდება დამატებითი პრაქტიკა.</p>
          <div style={{ marginTop: 18 }}>
            {TOPICS.map((topic) => (
              <div className={`progress-item tone-${topic.tone}`} key={topic.title}>
                <div className="progress-label">
                  <span>{topic.title}</span>
                  <span>{topic.value}%</span>
                </div>
                <div className="student-progress-track">
                  <div className="student-progress-fill" style={{ width: `${topic.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="section-label">
        <h2>შემდეგი ნაბიჯი</h2>
        <span>რეკომენდაცია</span>
      </div>

      <div className="task-summary">
        <strong>→</strong>
        <span>
          ტექსტური ამოცანების ამოხსნის სტრატეგიებზე დამატებითი პრაქტიკა.
          გირჩევნია დაიწყო მარტივი ამოცანებით და თანდათან გაართულო.
        </span>
      </div>

      <p className="demo-note">
        ილუსტრაციული მონაცემები — არა რეალური მოსწავლის შედეგები.
      </p>
    </div>
  );
}

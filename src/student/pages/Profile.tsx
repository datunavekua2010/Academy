import { useState } from 'react';
import { PageIntro } from './PageIntro';
import { useStudentSession } from '../session';

const PREFERENCES = [
  { id: 'reminders', title: 'გაკვეთილის შეხსენება', description: 'გაფრთხილება გაკვეთილამდე 30 წუთით' },
  { id: 'parent', title: 'მშობლის ანგარიში', description: 'მშობელს ექნება წვდომა პროგრესზე' },
  { id: 'weekly', title: 'ყოველკვირეული რეზიუმე', description: 'შეჯამება მიიღება ელფოსტაზე' },
];

export function Profile() {
  const { student } = useStudentSession();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    reminders: true,
    parent: true,
    weekly: false,
  });

  if (!student) return null;

  return (
    <div className="student-page">
      <PageIntro
        eyebrow="ჩემი პროფილი"
        title="პირადი ინფორმაცია"
        description="აქ ნახავს შენს მონაცემებს და შეგიძლია მართო შეტყობინებები. დემო რეჟიმში ცვლილებები არ ინახება."
      />

      <div className="profile-head">
        <span className="profile-avatar" aria-hidden="true">
          {student.initials}
        </span>
        <div>
          <h2>{student.name}</h2>
          <p>
            {student.grade} • Axiom Academy
          </p>
          <div className="meta-row">
            <span className="meta-chip tone-teal">აქტიური მოსწავლე</span>
            <span className="meta-chip">დემო ანგარიში</span>
          </div>
        </div>
      </div>

      <div className="student-grid cols-2" style={{ marginTop: 18 }}>
        <section className="student-card">
          <h3>ჩემი მონაცემები</h3>
          <dl className="info-list">
            <div className="info-row">
              <dt>სახელი</dt>
              <dd>{student.name}</dd>
            </div>
            <div className="info-row">
              <dt>კლასი</dt>
              <dd>{student.grade}</dd>
            </div>
            <div className="info-row">
              <dt>მშობელი</dt>
              <dd>{student.guardian}</dd>
            </div>
            <div className="info-row">
              <dt>ელფოსტა</dt>
              <dd>{student.email}</dd>
            </div>
          </dl>
        </section>

        <section className="student-card">
          <h3>შეტყობინებები</h3>
          <p>აირჩიე, რის შესახებ გინდა გაფრთხილება.</p>
          <div style={{ marginTop: 8 }}>
            {PREFERENCES.map((preference) => (
              <div className="toggle-row" key={preference.id}>
                <div>
                  <strong>{preference.title}</strong>
                  <span>{preference.description}</span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={Boolean(prefs[preference.id])}
                    onChange={(event) =>
                      setPrefs((current) => ({ ...current, [preference.id]: event.target.checked }))
                    }
                    aria-label={preference.title}
                  />
                  <span className="switch-track" aria-hidden="true" />
                </label>
              </div>
            ))}
          </div>
        </section>
      </div>

      <p className="demo-note">
        დემო ანგარიში — რეალურ სისტემაში მონაცემები უნდა მოვიდეს აკადემიის
        მონაცემთა ბაზიდან და დაცული იყოს მშობლის თანხმობით.
      </p>
    </div>
  );
}

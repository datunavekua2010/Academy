import { useEffect } from 'react';
import './loginPreview.css';

/** Visual-only account entry. Never accepts credentials or simulates a session. */
export function LoginPreview() {
  useEffect(() => { document.title = 'ანგარიშში შესვლა — Axiom Academy'; }, []);
  return <div className="login-preview">
    <header className="login-preview-header">
      <a className="login-preview-brand" href="#home" aria-label="Axiom Academy — მთავარი">
        <span className="login-preview-brand-mark" aria-hidden="true">✦</span>
        <span>Axiom <strong>Academy</strong></span>
      </a>
      <a className="login-preview-back" href="#home"><span aria-hidden="true">←</span> მთავარ გვერდზე</a>
    </header>
    <main className="login-preview-main">
      <section className="login-preview-card" aria-labelledby="login-preview-title">
        <div className="login-preview-intro">
          <div className="login-preview-art" aria-hidden="true"><span>✦</span><i>+</i><b>∑</b><em>×</em></div>
          <p className="login-preview-kicker">AXIOM ACADEMY</p>
          <h1 id="login-preview-title">კეთილი იყოს<br />შენი დაბრუნება<span>.</span></h1>
          <p>სწავლა პატარა ნაბიჯებით, დიდი აღმოჩენებით და შენი საკუთარი ტემპით.</p>
          <div className="login-preview-quote"><span aria-hidden="true">✳</span><p>ყოველი ახალი ნაბიჯი<br /><strong>მეტი შესაძლებლობაა.</strong></p></div>
        </div>
        <div className="login-preview-form-panel">
          <p className="login-preview-eyebrow">შენი სასწავლო სივრცე</p>
          <h2>ანგარიშში შესვლა</h2>
          <p className="login-preview-subtitle">შესვლის ფორმის წინასწარი ხედი.</p>
          <p className="login-preview-notice" role="status"><span aria-hidden="true">ⓘ</span><span><strong>ანგარიშით შესვლა ჯერ არ არის ხელმისაწვდომი.</strong><br />ფორმა მხოლოდ სანახავადაა — მონაცემებს ვერ შეიყვანთ.</span></p>
          <form aria-label="შესვლის ფორმის წინასწარი ხედი" onSubmit={event => event.preventDefault()}>
            <fieldset disabled>
              <label htmlFor="login-preview-email">ელფოსტა</label>
              <input id="login-preview-email" type="email" placeholder="name@example.com" autoComplete="username" />
              <label htmlFor="login-preview-password">პაროლი</label>
              <input id="login-preview-password" type="password" placeholder="შეიყვანე პაროლი" autoComplete="current-password" />
              <button type="submit">შესვლა <span aria-hidden="true">→</span></button>
            </fieldset>
          </form>
          <div className="login-preview-divider" />
          <p className="login-preview-help">მანამდე შეგიძლია დაათვალიერო პლატფორმა და სასწავლო მასალები.</p>
          <a className="login-preview-explore" href="#home">პლატფორმის ნახვა <span aria-hidden="true">↗</span></a>
        </div>
      </section>
      <p className="login-preview-footer">Axiom Academy <span aria-hidden="true">·</span> ვისწავლოთ ერთად</p>
    </main>
  </div>;
}

import raccoonArt from '../../assets/raccoon-mascot.png';

/** Encouragement only: no answer or hint is supplied by the mascot. */
export function Encouragement({ correct }: { correct: boolean }) {
  return (
    <div className="answer-encouragement">
      <img src={raccoonArt} alt="" aria-hidden="true" width="64" height="64" />
      <p>{correct ? 'ყოჩაღ! ძალიან კარგად გამოგივიდა!' : 'არაუშავს, შეცდომებიც სწავლის ნაწილია. განაგრძე, შენ შეძლებ!'}</p>
    </div>
  );
}

import { useRef, useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyGoogleProofStatus } from '../lib/googleProof';

/** Unwired unless both review flags are explicitly set. The privileged RPC must
 * independently enforce session identity, Google proof and role lifecycle. */
export function StudentEnrollmentReview({ client, onComplete }: { client: SupabaseClient; onComplete: () => void }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending.current) return;
    const display = name.trim();
    const numericGrade = Number(grade);
    if (!display || display.length > 100 || !Number.isInteger(numericGrade) || numericGrade < 1 || numericGrade > 7) return;
    pending.current = true; setBusy(true); setError('');
    try {
      const { data, error: authError } = await client.auth.getUser();
      if (authError || !data.user?.id) throw new Error('Unavailable');
      const id = data.user.id;
      await verifyGoogleProofStatus(client);
      const current = await client.auth.getUser();
      if (current.error || current.data.user?.id !== id) throw new Error('Unavailable');
      const result = await client.rpc('review_student_self_enroll', { p_expected_user: id, p_display_name: display, p_grade: numericGrade });
      if (result.error || (result.data !== 'created' && result.data !== 'already_enrolled')) throw new Error('Unavailable');
      onComplete();
    } catch {
      setError('მოსწავლის ანგარიშის შექმნა ვერ მოხერხდა. გადაამოწმე Google-ით შესვლა ან დაუკავშირდი აკადემიას.');
    } finally { pending.current = false; setBusy(false); }
  };
  return <form onSubmit={event => void submit()}>
    <h2>მოსწავლის ანგარიშის შექმნა</h2>
    <label>სახელი ან მეტსახელი <input value={name} onChange={event => setName(event.target.value)} required maxLength={100} autoComplete="off" /></label>
    <label>კლასი <select value={grade} onChange={event => setGrade(event.target.value)} required>
      <option value="">აირჩიე კლასი</option>{[1,2,3,4,5,6,7].map(value => <option key={value} value={value}>{value}</option>)}
    </select></label>
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={busy}>{busy ? 'იტვირთება…' : 'ანგარიშის შექმნა'}</button>
  </form>;
}

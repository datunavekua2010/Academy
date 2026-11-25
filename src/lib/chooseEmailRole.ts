import type { SupabaseClient } from '@supabase/supabase-js';

export type SelfServiceRole = 'student' | 'parent';

/** The database independently verifies the current password session and role. */
export async function chooseEmailRole(client: SupabaseClient, role: SelfServiceRole): Promise<void> {
  if (role !== 'student' && role !== 'parent') throw new Error('Unavailable');
  const first = await client.auth.getUser();
  if (first.error || !first.data.user?.id || !first.data.user.email_confirmed_at) throw new Error('Unavailable');
  const expected = first.data.user.id;
  const result = await client.rpc('choose_email_role', { p_expected_user: expected, p_role: role });
  if (result.error || (result.data !== 'created' && result.data !== 'already_enrolled')) throw new Error('Unavailable');
  const after = await client.auth.getUser();
  if (after.error || after.data.user?.id !== expected) throw new Error('Unavailable');
}

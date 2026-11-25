import type { SupabaseClient } from '@supabase/supabase-js';
import { verifyGoogleProofStatus } from './googleProof';

export type GoogleSelfServiceRole = 'student' | 'parent';

/** The server checks identity, proof, gates and role lifecycle independently. */
export async function chooseGoogleRole(client: SupabaseClient, role: GoogleSelfServiceRole): Promise<void> {
  if (role !== 'student' && role !== 'parent') throw new Error('Unavailable');
  const first = await client.auth.getUser();
  if (first.error || !first.data.user?.id) throw new Error('Unavailable');
  const expected = first.data.user.id;
  await verifyGoogleProofStatus(client);
  const current = await client.auth.getUser();
  if (current.error || current.data.user?.id !== expected) throw new Error('Unavailable');
  const result = await client.rpc('review_choose_google_role', { p_expected_user: expected, p_role: role });
  if (result.error || (result.data !== 'created' && result.data !== 'already_enrolled')) throw new Error('Unavailable');
  // A concurrent account change must not navigate the new user into this role.
  const after = await client.auth.getUser();
  if (after.error || after.data.user?.id !== expected) throw new Error('Unavailable');
}

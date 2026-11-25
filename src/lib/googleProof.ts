import type { SupabaseClient } from '@supabase/supabase-js';

/** URL status is untrusted; ask the server about the current session's proof. */
export async function verifyGoogleProofStatus(client: SupabaseClient): Promise<void> {
  const verified = await client.auth.getUser();
  if (verified.error || !verified.data.user?.id) throw new Error('Google proof unavailable');
  const result = await client.rpc('review_google_proof_status');
  if (result.error || result.data !== true) throw new Error('Google proof unavailable');
}

/** The server validates the Supabase JWT and binds the extra Google proof. */
export async function startGoogleProof(client: SupabaseClient): Promise<string> {
  const {data,error}=await client.auth.getSession();
  const token=data.session?.access_token;
  if (error || !token) throw new Error('Google proof unavailable');
  const response=await fetch('/api/auth/google-proof/start',{method:'POST',headers:{Authorization:`Bearer ${token}`},credentials:'same-origin',cache:'no-store'});
  if (!response.ok) throw new Error('Google proof unavailable');
  const dataValue: unknown = await response.json();
  const address=(dataValue as {authorizationUrl?:unknown} | null)?.authorizationUrl;
  if (typeof address !== 'string' || address.length > 8192) throw new Error('Google proof unavailable');
  let url: URL;
  try { url=new URL(address); } catch { throw new Error('Google proof unavailable'); }
  if (url.origin !== 'https://accounts.google.com' || url.pathname !== '/o/oauth2/v2/auth' || url.username || url.password || url.hash) throw new Error('Google proof unavailable');
  return url.toString();
}

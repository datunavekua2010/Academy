/**
 * Local building block only: verify a Google OIDC ID token against a fresh,
 * server-generated nonce. This does NOT bind a proof to a Supabase session,
 * consume a challenge, grant access, or implement an OAuth flow. Do not deploy
 * as an authorization mechanism until those pieces are implemented and tested.
 */
const GOOGLE_KEYS = 'https://www.googleapis.com/oauth2/v3/certs';
const MAX_JWKS_BYTES = 65536;
const invalid = () => new Error('Google identity proof unavailable');

function decodePart(part: string): Uint8Array {
  if (!part || !/^[A-Za-z0-9_-]+$/.test(part) || part.length % 4 === 1) throw invalid();
  const padded = part.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - part.length % 4) % 4);
  let binary: string;
  try { binary = atob(padded); } catch { throw invalid(); }
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  // Reject alternate encodings of the same bytes.
  if (btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') !== part) throw invalid();
  return bytes;
}

function jsonPart(part: string): Record<string, unknown> {
  let data: unknown;
  try { data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(decodePart(part))); } catch { throw invalid(); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw invalid();
  return data as Record<string, unknown>;
}

type GoogleKey = JsonWebKey & { kid?: string };
async function getKeys(fetcher: typeof fetch): Promise<GoogleKey[]> {
  let response: Response;
  try { response = await fetcher(GOOGLE_KEYS, { method: 'GET', redirect: 'error', credentials: 'omit', signal: AbortSignal.timeout(5000) }); } catch { throw invalid(); }
  if (!response.ok || !response.body || response.redirected) throw invalid();
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    for (;;) {
      const item = await reader.read();
      if (item.done) break;
      size += item.value.byteLength;
      if (size > MAX_JWKS_BYTES) { await reader.cancel(); throw invalid(); }
      chunks.push(item.value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    const value: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!value || typeof value !== 'object' || !Array.isArray((value as {keys?:unknown}).keys)) throw invalid();
    return (value as {keys:GoogleKey[]}).keys;
  } catch { throw invalid(); }
}

/** Returns only Google's stable subject, not tokens, emails, or mutable profile data. */
export async function verifyGoogleIdentityToken(
  token: string,
  options: { clientId: string; nonce: string; nowSeconds?: number; fetcher?: typeof fetch },
): Promise<string> {
  const {clientId, nonce} = options;
  const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (typeof token !== 'string' || token.length > 16384 || typeof clientId !== 'string' || !clientId || clientId.length > 512 || /\s/.test(clientId) || typeof nonce !== 'string' || !/^[A-Za-z0-9_-]{32,128}$/.test(nonce) || !Number.isSafeInteger(now)) throw invalid();
  const parts = token.split('.');
  if (parts.length !== 3) throw invalid();
  const header = jsonPart(parts[0]);
  const claims = jsonPart(parts[1]);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(header.kid) || 'crit' in header || 'b64' in header || 'jku' in header || 'jwk' in header) throw invalid();
  const audience = claims.aud;
  if (!(audience === clientId || (Array.isArray(audience) && audience.length > 0 && audience.every(x => typeof x === 'string') && audience.includes(clientId)))) throw invalid();
  if ((Array.isArray(audience) && audience.length > 1 && claims.azp !== clientId) || (claims.azp !== undefined && claims.azp !== clientId)) throw invalid();
  if (claims.iss !== 'https://accounts.google.com' && claims.iss !== 'accounts.google.com') throw invalid();
  if (claims.nonce !== nonce || typeof claims.sub !== 'string' || !/^[\x21-\x7e]{1,255}$/.test(claims.sub)) throw invalid();
  if (!Number.isSafeInteger(claims.exp) || !Number.isSafeInteger(claims.iat)) throw invalid();
  const exp = claims.exp as number, iat = claims.iat as number;
  if (exp <= now || iat > now + 60 || iat < now - 300 || exp <= iat) throw invalid();
  if (claims.nbf !== undefined && (!Number.isSafeInteger(claims.nbf) || (claims.nbf as number) > now + 60)) throw invalid();
  const signature = decodePart(parts[2]);
  if (signature.length < 256 || signature.length > 1024) throw invalid();
  const keys = await getKeys(options.fetcher ?? fetch);
  const matches = keys.filter(key => key && typeof key === 'object' && key.kid === header.kid && key.kty === 'RSA' && key.use === 'sig' && key.alg === 'RS256');
  if (matches.length !== 1) throw invalid();
  try {
    const key = await crypto.subtle.importKey('jwk', matches[0], { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, signature as BufferSource, new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) throw invalid();
  } catch { throw invalid(); }
  return claims.sub;
}

/**
 * Server-only gateway core. Do not expose these dependencies to the browser.
 * A deployment adapter MUST supply a verified network address from its trusted
 * ingress, not a request header chosen by the client. A separate review-only runtime adapter is not enabled by the current deployment.
 */
export interface CodeGatewayDeps {
  authenticate(authorization: string): Promise<{ id: string } | null>;
  trustedNetwork(request: Request): Promise<string | null>;
  consumeRate(accountHash: string, networkHash: string): Promise<boolean>;
  redeem(studentId: string, normalizedCode: string): Promise<boolean>;
  rateKey: string;
}

const encoder = new TextEncoder();
export async function keyedId(key: string, scope: string, value: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey('raw', encoder.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(`${scope}\0${value}`));
  return Array.from(new Uint8Array(signature), b => b.toString(16).padStart(2, '0')).join('');
}
export function response(status: number, body: string): Response {
  return new Response(JSON.stringify({ message: body }), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' } });
}
export async function readBody(request: Request): Promise<string> {
  if (!request.body) return '';
  const reader = request.body.getReader(); const pieces: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 1024) { await reader.cancel(); throw new Error('Body too large'); }
      pieces.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const piece of pieces) { bytes.set(piece, offset); offset += piece.length; }
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

/** Returns generic responses; consumes the committed rate limit before parsing a code. */
export function createClassroomCodeGateway(deps: CodeGatewayDeps) {
  return async (request: Request): Promise<Response> => {
    if (request.method !== 'POST') return response(405, 'Method not allowed');
    // The backend must load a high-entropy secret from its secret manager.
    if (typeof deps.rateKey !== 'string' || encoder.encode(deps.rateKey).length < 32) return response(503, 'Service unavailable');
    try {
      const authorization = request.headers.get('authorization') ?? '';
      if (!/^Bearer [^\s]+$/.test(authorization)) return response(401, 'Authentication required');
      const user = await deps.authenticate(authorization);
      if (!user || !user.id || user.id.length > 128) return response(401, 'Authentication required');
      // Only a trusted runtime can supply this; never fall back to forwarded headers.
      const network = await deps.trustedNetwork(request);
      if (!network || network.length > 128) return response(503, 'Service unavailable');
      const [accountHash, networkHash] = await Promise.all([keyedId(deps.rateKey, 'account', user.id), keyedId(deps.rateKey, 'network', network)]);
      if (!(await deps.consumeRate(accountHash, networkHash))) return response(429, 'Try again later');
      let body: unknown;
      try { body = JSON.parse(await readBody(request)); } catch { return response(400, 'Unable to join classroom'); }
      if (!body || typeof body !== 'object' || Array.isArray(body) || typeof (body as { code?: unknown }).code !== 'string') return response(400, 'Unable to join classroom');
      const code = (body as { code: string }).code.replace(/[ -]/g, '').toUpperCase();
      if (!/^[A-Z2-7]{26}$/.test(code)) return response(400, 'Unable to join classroom');
      if (!(await deps.redeem(user.id, code))) return response(400, 'Unable to join classroom');
      return response(200, 'Joined');
    } catch { return response(503, 'Service unavailable'); }
  };
}

/** Server-only adapter; provide a privileged client from the server secret manager. */
export function databaseRateLimiter(client: { rpc(name: string, args: Record<string, string>): PromiseLike<{ data: unknown; error: unknown }> }) {
  return async (accountHash: string, networkHash: string): Promise<boolean> => {
    const { data, error } = await client.rpc('classroom_code_consume_rate', { p_account_hash: accountHash, p_network_hash: networkHash });
    if (error || typeof data !== 'boolean') throw new Error('Rate limiter unavailable');
    return data;
  };
}

/** Never trust the JWT payload alone: verify the access token with Supabase Auth. */
export function verifiedSupabaseAuth(client: { auth: { getUser(token: string): PromiseLike<{ data: { user: { id: string } | null }; error: unknown }> } }) {
  return async (authorization: string): Promise<{ id: string } | null> => {
    if (!/^Bearer [^\s]+$/.test(authorization)) return null;
    const { data, error } = await client.auth.getUser(authorization.slice(7));
    if (error || !data?.user || typeof data.user.id !== 'string' || !data.user.id) return null;
    return { id:data.user.id };
  };
}

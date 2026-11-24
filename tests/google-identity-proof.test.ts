// @vitest-environment node
import { beforeAll, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { verifyGoogleIdentityToken } from '../server/google-identity-proof';

const subtle = webcrypto.subtle;
const clientId = 'staging-test.apps.googleusercontent.com';
const nonce = 'A'.repeat(43);
const now = 1_800_000_000;
let privateKey: CryptoKey;
let publicJwk: JsonWebKey;
const base = { iss: 'https://accounts.google.com', aud: clientId, sub: 'synthetic-google-subject', nonce, iat: now, exp: now + 300 };
const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const fetchKeys = () => vi.fn(async () => new Response(JSON.stringify({keys:[publicJwk]}), {status:200})) as unknown as typeof fetch;
async function signed(claims: Record<string,unknown> = base, header: Record<string,unknown> = {alg:'RS256',kid:'test-key',typ:'JWT'}, key = privateKey) {
  const input = `${encode(header)}.${encode(claims)}`;
  const sig = await subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(input));
  return `${input}.${Buffer.from(sig).toString('base64url')}`;
}
beforeAll(async () => {
  const pair = await subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  privateKey = pair.privateKey as CryptoKey;
  publicJwk = {...await subtle.exportKey('jwk',pair.publicKey), kid:'test-key', use:'sig', alg:'RS256'} as JsonWebKey;
});
const opts = () => ({clientId, nonce, nowSeconds:now, fetcher:fetchKeys()});
it('accepts a fresh signed Google proof and fetches only the fixed Google key endpoint', async () => {
  const options = opts();
  expect(await verifyGoogleIdentityToken(await signed(), options)).toBe(base.sub);
  expect(options.fetcher).toHaveBeenCalledOnce();
  expect(vi.mocked(options.fetcher).mock.calls[0][0]).toBe('https://www.googleapis.com/oauth2/v3/certs');
});
it('fails closed for wrong issuer, audience, nonce, timing, subject, and unsafe headers', async () => {
  for (const claims of [
    {...base,iss:'https://attacker.invalid'}, {...base,aud:'another-client'}, {...base,nonce:'B'.repeat(43)},
    {...base,exp:now}, {...base,iat:now-301}, {...base,iat:now+61}, {...base,nbf:now+61}, {...base,sub:''},
    {...base,aud:[clientId,'other']}, {...base,azp:'other'},
  ]) await expect(verifyGoogleIdentityToken(await signed(claims), opts())).rejects.toThrow();
  for (const header of [{alg:'none',kid:'test-key'}, {alg:'RS256',kid:'test-key',crit:['b64']}, {alg:'RS256',kid:'test-key',jku:'https://attacker.invalid'}]) {
    await expect(verifyGoogleIdentityToken(await signed(base,header), opts())).rejects.toThrow();
  }
  expect(await verifyGoogleIdentityToken(await signed({...base,aud:[clientId,'other'],azp:clientId}), opts())).toBe(base.sub);
});
it('rejects invalid signatures, missing keys, ambiguous keys and malformed tokens', async () => {
  const other = await subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  await expect(verifyGoogleIdentityToken(await signed(base,undefined,other.privateKey as CryptoKey), opts())).rejects.toThrow();
  const token = await signed();
  for (const body of [{keys:[]},{keys:[publicJwk,publicJwk]}]) {
    const fetcher = vi.fn(async () => new Response(JSON.stringify(body))) as unknown as typeof fetch;
    await expect(verifyGoogleIdentityToken(token,{...opts(),fetcher})).rejects.toThrow();
  }
  for (const bad of ['', 'abc.def.ghi', token+'=', 'x'.repeat(16385)]) await expect(verifyGoogleIdentityToken(bad, opts())).rejects.toThrow();
});
it('fails closed if Google keys cannot be fetched or are too large', async () => {
  const token = await signed();
  const unavailable = vi.fn(async () => {throw Error('network');}) as unknown as typeof fetch;
  await expect(verifyGoogleIdentityToken(token,{...opts(),fetcher:unavailable})).rejects.toThrow();
  const huge = vi.fn(async () => new Response('x'.repeat(65537))) as unknown as typeof fetch;
  await expect(verifyGoogleIdentityToken(token,{...opts(),fetcher:huge})).rejects.toThrow();
});

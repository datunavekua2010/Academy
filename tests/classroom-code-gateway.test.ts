import { expect, it, vi } from 'vitest';
import { createClassroomCodeGateway, databaseRateLimiter, verifiedSupabaseAuth, type CodeGatewayDeps } from '../server/classroom-code-gateway';
const code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function setup() {
  const deps: CodeGatewayDeps = { rateKey:'a'.repeat(40), authenticate:vi.fn(async () => ({id:'student-id'})), trustedNetwork:vi.fn(async () => 'verified-network'), consumeRate:vi.fn(async () => true), redeem:vi.fn(async () => true) };
  const send=(body:string, headers:Record<string,string> = {authorization:'Bearer validated-by-server'}) => createClassroomCodeGateway(deps)(new Request('https://example.test/api/classroom-join', { method:'POST', headers, body }));
  return {deps,send};
}
it('uses only verified identity and trusted network, hashes both, and limits before redemption', async () => {
  const {deps,send}=setup();
  const res=await send(JSON.stringify({ code, studentId:'attacker-choice', network:'forged' }),{authorization:'Bearer valid','x-forwarded-for':'forged'});
  expect(res.status).toBe(200); expect(res.headers.get('cache-control')).toBe('no-store');
  expect(deps.authenticate).toHaveBeenCalledWith('Bearer valid');
  expect(deps.redeem).toHaveBeenCalledWith('student-id',code);
  const keys=vi.mocked(deps.consumeRate).mock.calls[0];
  expect(keys[0]).toMatch(/^[a-f0-9]{64}$/); expect(keys[1]).toMatch(/^[a-f0-9]{64}$/);
  expect(keys[0]).not.toContain('student'); expect(keys[1]).not.toContain('verified'); expect(keys[0]).not.toBe(keys[1]);
});
it('fails closed for missing authentication, trusted network, weak key, rate errors and exhausted budget', async () => {
  const {deps,send}=setup();
  expect((await send('{}',{})).status).toBe(401);
  vi.mocked(deps.authenticate).mockResolvedValueOnce(null); expect((await send('{}')).status).toBe(401);
  vi.mocked(deps.trustedNetwork).mockResolvedValueOnce(null); expect((await send('{}')).status).toBe(503);
  deps.rateKey='short'; expect((await send('{}')).status).toBe(503); deps.rateKey='a'.repeat(40);
  vi.mocked(deps.consumeRate).mockRejectedValueOnce(new Error('db')); expect((await send('{}')).status).toBe(503);
  vi.mocked(deps.consumeRate).mockResolvedValueOnce(false); expect((await send(JSON.stringify({code}))).status).toBe(429);
  expect(deps.redeem).not.toHaveBeenCalled();
});
it('charges malformed or oversized requests, makes failed joins indistinguishable and never reports fake success', async () => {
  const {deps,send}=setup();
  expect((await send('not json')).status).toBe(400);
  expect((await send('x'.repeat(1025))).status).toBe(400);
  expect((await send(JSON.stringify({code:'bad'}))).status).toBe(400);
  expect(deps.consumeRate).toHaveBeenCalledTimes(3); expect(deps.redeem).not.toHaveBeenCalled();
  vi.mocked(deps.redeem).mockResolvedValueOnce(false); const res=await send(JSON.stringify({code}));
  expect(res.status).toBe(400); expect(await res.json()).toEqual({message:'Unable to join classroom'});
  vi.mocked(deps.redeem).mockRejectedValueOnce(new Error('network')); expect((await send(JSON.stringify({code}))).status).toBe(503);
});
it('rejects database errors or malformed limiter responses', async () => {
  await expect(databaseRateLimiter({rpc:async()=>({data:null,error:'unavailable'})})('a','b')).rejects.toThrow();
  await expect(databaseRateLimiter({rpc:async()=>({data:'true',error:null})})('a','b')).rejects.toThrow();
  expect(await databaseRateLimiter({rpc:async()=>({data:false,error:null})})('a','b')).toBe(false);
});

it('verifies the bearer token with Supabase Auth rather than trusting a client identity', async () => {
  const getUser=vi.fn(async (token:string) => token === 'valid' ? {data:{user:{id:'verified-id'}},error:null} : {data:{user:null},error:'invalid'});
  const authenticate=verifiedSupabaseAuth({auth:{getUser}});
  expect(await authenticate('Bearer valid')).toEqual({id:'verified-id'});
  expect(await authenticate('Bearer invalid')).toBeNull();
  expect(await authenticate('invalid')).toBeNull();
  expect(getUser).toHaveBeenCalledTimes(2);
});

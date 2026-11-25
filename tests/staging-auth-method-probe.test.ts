// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
const fake = vi.hoisted(() => ({
  create: vi.fn(), get: vi.fn(), oauth: vi.fn(), exchange: vi.fn(), refresh: vi.fn(), out: vi.fn(),
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: fake.create }));
const token = (methods: string[]) => `header.${btoa(JSON.stringify({amr:methods.map(method => ({method})),email:'private@example.test'}))}.signature`;
beforeEach(() => {
  vi.resetModules(); vi.clearAllMocks(); sessionStorage.clear(); window.history.replaceState(null, '', '/');
  document.body.innerHTML = '<code id="redirect"></code><input id="key"><button id="start"></button><button id="refresh" hidden></button><button id="out" hidden></button><p id="result"></p>';
  fake.get.mockResolvedValue({data:{session:null},error:null});
  fake.oauth.mockResolvedValue({data:{url:'https://provider.test'},error:null});
  fake.exchange.mockResolvedValue({data:{session:{access_token:token(['oauth'])}},error:null});
  fake.refresh.mockResolvedValue({data:{session:{access_token:token(['oauth'])}},error:null});
  fake.out.mockResolvedValue({error:null});
  fake.create.mockReturnValue({auth:{getSession:fake.get,signInWithOAuth:fake.oauth,exchangeCodeForSession:fake.exchange,refreshSession:fake.refresh,signOut:fake.out}});
});
afterEach(() => { sessionStorage.clear(); document.body.innerHTML = ''; });
async function tick() { for (let i=0;i<8;i++) await Promise.resolve(); }
it('starts only staging Google with a publishable key and fixed callback',async()=>{
  await import('../scripts/staging-auth-method/probe.js');
  (document.querySelector('#key') as HTMLInputElement).value='sb_publishable_test';
  (document.querySelector('#start') as HTMLButtonElement).click(); await tick();
  expect(fake.create.mock.calls[0][0]).toBe('https://wxxgwayrieasrzngpuul.supabase.co');
  expect(fake.oauth).toHaveBeenCalledWith({provider:'google',options:{redirectTo:`${window.location.origin}/staging-auth-return`}});
  expect(document.body.textContent).not.toContain('sb_publishable_test');
});
it('requires a pending callback and displays only allowlisted methods, not tokens or emails',async()=>{
  sessionStorage.setItem('axiom-staging-probe-pending','1'); sessionStorage.setItem('axiom-staging-probe-publishable','sb_publishable_test');
  window.history.replaceState(null,'','/staging-auth-return?code=synthetic-private');
  await import('../scripts/staging-auth-method/probe.js'); await tick();
  expect(fake.exchange).toHaveBeenCalledWith('synthetic-private');
  expect(window.location.search).toBe('');
  expect(document.querySelector('#result')?.textContent).toContain('oauth');
  expect(document.body.textContent).not.toContain('synthetic-private');
  expect(document.body.textContent).not.toContain('private@example.test');
  (document.querySelector('#refresh') as HTMLButtonElement).click(); await tick();
  expect(document.querySelector('#result')?.textContent).toContain('Refresh succeeded');
  (document.querySelector('#out') as HTMLButtonElement).click(); await tick();
  expect(fake.out).toHaveBeenCalledWith({scope:'local'});
});
it('rejects unsolicited callbacks before exchanging a code',async()=>{
  window.history.replaceState(null,'','/staging-auth-return?code=synthetic-private');
  await import('../scripts/staging-auth-method/probe.js'); await tick();
  expect(fake.exchange).not.toHaveBeenCalled();
  expect(window.location.search).toBe('');
});

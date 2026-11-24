// @vitest-environment node
import { beforeAll, expect, it, vi } from 'vitest';
import { webcrypto } from 'node:crypto';
import { startGoogleProof, finishGoogleProof, type GoogleProofStore } from '../server/google-proof-flow';
const subtle = webcrypto.subtle;
const config = {clientId:'test.apps.googleusercontent.com',clientSecret:'synthetic-server-secret',redirectUri:'https://stage.example.test/google-callback'};
const session = {userId:'00000000-0000-4000-8000-000000000001',sessionId:'00000000-0000-4000-8000-000000000002',methods:['oauth']};
const encode = (x:unknown) => Buffer.from(JSON.stringify(x)).toString('base64url');
let privateKey: CryptoKey, key: JsonWebKey;
beforeAll(async () => {
  const pair=await subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
  privateKey=pair.privateKey as CryptoKey;
  key={...await subtle.exportKey('jwk',pair.publicKey),kid:'test-key',use:'sig',alg:'RS256'} as JsonWebKey;
});
async function token(nonce:string) {
  const now=Math.floor(Date.now()/1000);
  const input=`${encode({alg:'RS256',kid:'test-key'})}.${encode({iss:'https://accounts.google.com',aud:config.clientId,sub:'approved-subject',nonce,iat:now,exp:now+300})}`;
  const sig=await subtle.sign('RSASSA-PKCS1-v1_5',privateKey,new TextEncoder().encode(input));
  return `${input}.${Buffer.from(sig).toString('base64url')}`;
}
function fixture() {
  let stored: Parameters<GoogleProofStore['begin']>[0] | undefined;
  let finished=0;
  const store: GoogleProofStore={
    async begin(input){stored=input;},
    async read(state,cookie){return stored?.stateHash===state && stored.cookieHash===cookie ? {nonce:stored.nonce,codeVerifier:stored.codeVerifier} : null;},
    async finish(input){if (!stored || input.stateHash!==stored.stateHash || input.cookieHash!==stored.cookieHash || input.nonce!==stored.nonce || input.subject!=='approved-subject') throw Error('denied'); stored=undefined; finished++;},
  };
  return {store, get challenge(){return stored;}, get finished(){return finished;}};
}
it('binds a verified Google token to the stored challenge, cookie and session',async()=>{
  const db=fixture();
  const started=await startGoogleProof(session,config,db.store);
  const url=new URL(started.authorizationUrl);
  expect(url.origin).toBe('https://accounts.google.com');
  expect(url.searchParams.get('code_challenge_method')).toBe('S256');
  expect(url.searchParams.get('nonce')).toBe(db.challenge?.nonce);
  expect(started.authorizationUrl).not.toContain(config.clientSecret);
  expect(started.authorizationUrl).not.toContain(db.challenge!.codeVerifier);
  expect(started.authorizationUrl).not.toContain(started.cookie);
  const fetcher=vi.fn(async (input: RequestInfo | URL, init?: RequestInit)=>{
    if (String(input)==='https://oauth2.googleapis.com/token') {
      const body=init?.body as URLSearchParams;
      expect(body.get('code_verifier')).toBe(db.challenge?.codeVerifier);
      expect(body.get('client_secret')).toBe(config.clientSecret);
      return new Response(JSON.stringify({id_token:await token(db.challenge!.nonce),access_token:'do-not-return'}));
    }
    if (String(input)==='https://www.googleapis.com/oauth2/v3/certs') return new Response(JSON.stringify({keys:[key]}));
    throw Error('unexpected destination');
  }) as unknown as typeof fetch;
  const state=url.searchParams.get('state')!;
  await expect(finishGoogleProof({state,cookie:'B'.repeat(43),code:'fake-code'},config,db.store,fetcher)).rejects.toThrow();
  expect(fetcher).not.toHaveBeenCalled();
  await finishGoogleProof({state,cookie:started.cookie,code:'fake-code'},config,db.store,fetcher);
  expect(db.finished).toBe(1);
  await expect(finishGoogleProof({state,cookie:started.cookie,code:'fake-code'},config,db.store,fetcher)).rejects.toThrow();
});
it('rejects password and ambiguous sessions before storing a challenge',async()=>{
  const db=fixture();
  for (const methods of [['password'],['oauth','password'],[],['totp']]) {
    await expect(startGoogleProof({...session,methods},config,db.store)).rejects.toThrow();
  }
  expect(db.challenge).toBeUndefined();
  await expect(startGoogleProof({...session,methods:['oauth','totp']},config,db.store)).resolves.toBeDefined();
});
it('never finishes a challenge for a token with the wrong nonce or failed exchange',async()=>{
  const db=fixture(); const started=await startGoogleProof(session,config,db.store);
  const state=new URL(started.authorizationUrl).searchParams.get('state')!;
  const fetcher=vi.fn(async (input: RequestInfo | URL)=> String(input)==='https://oauth2.googleapis.com/token'
    ? new Response(JSON.stringify({id_token:await token('B'.repeat(43))})) : new Response(JSON.stringify({keys:[key]}))) as unknown as typeof fetch;
  await expect(finishGoogleProof({state,cookie:started.cookie,code:'fake-code'},config,db.store,fetcher)).rejects.toThrow();
  expect(db.finished).toBe(0);
  const failed=vi.fn(async()=>new Response(null,{status:401})) as unknown as typeof fetch;
  await expect(finishGoogleProof({state,cookie:started.cookie,code:'fake-code'},config,db.store,failed)).rejects.toThrow();
  expect(db.finished).toBe(0);
});

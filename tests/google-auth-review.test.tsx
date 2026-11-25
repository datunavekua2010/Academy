// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { consumeGoogleCallback } from '../src/lib/authCallbacks';
it('scrubs secrets from a legacy Google callback without starting sign-in',()=>{
 const history={replaceState:vi.fn()};
 expect(consumeGoogleCallback('https://example.test/?google_auth=1&code=abc&other=secret#token',history)).toEqual({code:'abc'});
 expect(history.replaceState).toHaveBeenCalledWith(null,'','/#/account/google');
 expect(consumeGoogleCallback('https://example.test/?google_auth=1&code=a&code=b',history)).toEqual({code:null});
 expect(consumeGoogleCallback('https://example.test/?google_auth=1&code=a&error=denied',history)).toEqual({code:null});
});

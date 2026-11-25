// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import type { Root } from 'react-dom/client';
import { renderAuthCallback } from '../src/authBootstrap';
it.each([{kind:'google' as const,value:{code:'synthetic'}},{kind:'proof' as const,value:'ok' as const}])('ignores legacy $kind callbacks without network requests',callback=>{
 const render=vi.fn();const fetch=vi.spyOn(globalThis,'fetch');
 try { renderAuthCallback({render} as unknown as Root,callback);expect(render).toHaveBeenCalledOnce();expect(fetch).not.toHaveBeenCalled(); }
 finally {fetch.mockRestore();}
});

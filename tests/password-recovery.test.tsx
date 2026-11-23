// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { consumeRecoveryCallback, exchangeRecovery, requestRecovery, updateRecoveryPassword, recoveryClient } from '../src/lib/passwordRecovery';
import { PasswordRecovery, RecoveryRequest } from '../src/account/PasswordRecovery';
afterEach(cleanup);
function mockClient() {
 let callback: ((event:string, session:{user:{id:string}}|null)=>void) | null = null;
 const auth={onAuthStateChange:vi.fn((cb:typeof callback)=>{callback=cb;return {data:{subscription:{unsubscribe:()=>{callback=null;}}}};}),resetPasswordForEmail:vi.fn(async()=>({error:null})),exchangeCodeForSession:vi.fn(async()=>{callback?.('PASSWORD_RECOVERY',{user:{id:'target'}});return {data:{redirectType:'recovery',user:{id:'target'},session:{user:{id:'target'}}},error:null};}),getUser:vi.fn(async()=>({data:{user:{id:'target'}},error:null})),updateUser:vi.fn(async()=>({data:{user:{id:'target'}},error:null})),signOut:vi.fn(async()=>({error:null}))};
 return {auth,client:{auth} as unknown as SupabaseClient};
}
it('is disabled in the public test account',()=>{expect(recoveryClient).toBeNull();});
it('scrubs callback parameters and fragments before exchanging and rejects duplicate codes',()=>{
 const history={replaceState:vi.fn()};
 expect(consumeRecoveryCallback('https://example.test/sub/index.html?recovery=1&code=secret&x=1#access_token=secret',history)).toEqual({code:'secret'});
 expect(history.replaceState).toHaveBeenCalledWith(null,'','/sub/index.html#/account/recovery');
 expect(consumeRecoveryCallback('https://example.test/?recovery=1&code=a&code=b#x',history)).toEqual({code:null});
 expect(consumeRecoveryCallback('https://example.test/#/teacher',history)).toBeNull();
});
it('requests only an HTTPS same-origin fixed callback and surfaces failures without backend details',async()=>{
 const {client,auth}=mockClient();await requestRecovery(client,' user@example.test ','https://example.test','/index.html');
 expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.test',{redirectTo:'https://example.test/index.html?recovery=1'});
 await expect(requestRecovery(client,'x','https://example.test','//evil.test/path')).rejects.toThrow();
 await expect(requestRecovery(client,'x','http://example.test','/')).rejects.toThrow();
 auth.resetPasswordForEmail.mockResolvedValueOnce({error:new Error('secret') as never});await expect(requestRecovery(client,'x','https://example.test','/')).rejects.not.toThrow('secret');
});
it('requires an actual recovery exchange, matching verified identity, and cannot use an existing session alone',async()=>{
 const {client,auth}=mockClient();await expect(exchangeRecovery(client,{code:null})).rejects.toThrow();expect(auth.exchangeCodeForSession).not.toHaveBeenCalled();
 expect(await exchangeRecovery(client,{code:'code'})).toEqual({userId:'target'});
 auth.exchangeCodeForSession.mockResolvedValueOnce({data:{redirectType:'signup',user:{id:'target'},session:{user:{id:'target'}}},error:null});
 await expect(exchangeRecovery(client,{code:'signup'})).rejects.toThrow();expect(auth.signOut).toHaveBeenCalledWith({scope:'local'});
 auth.getUser.mockResolvedValueOnce({data:{user:{id:'different'}},error:null});await expect(exchangeRecovery(client,{code:'code'})).rejects.toThrow();
});
it('rejects changed recovery identity and reports a failed logout separately from a password update',async()=>{
 const {client,auth}=mockClient();auth.getUser.mockResolvedValueOnce({data:{user:{id:'different'}},error:null});
 await expect(updateRecoveryPassword(client,{userId:'target'},'secure-password')).rejects.toThrow();expect(auth.updateUser).not.toHaveBeenCalled();
 auth.signOut.mockResolvedValueOnce({error:new Error('failed') as never});expect(await updateRecoveryPassword(client,{userId:'target'},'secure-password')).toBe('signout-failed');
 expect(auth.updateUser).toHaveBeenCalledWith({password:'secure-password'});expect(auth.signOut).toHaveBeenCalledWith({scope:'local'});
});
it('shows a non-enumerating recovery request response and never claims email delivery',async()=>{
 const {client,auth}=mockClient();render(<RecoveryRequest client={client} />);fireEvent.click(screen.getByRole('button',{name:'პაროლი დაგავიწყდათ?'}));
 fireEvent.change(screen.getByLabelText('ანგარიშის ელფოსტა'),{target:{value:'user@example.test'}});fireEvent.click(screen.getByRole('button',{name:'აღდგენის მოთხოვნა'}));
 expect((await screen.findByRole('status')).textContent).toContain('თუ ანგარიშს');expect(auth.resetPasswordForEmail).toHaveBeenCalledTimes(1);
});
it('requires a valid link, matches passwords and clears them after backend confirmation',async()=>{
 const {client,auth}=mockClient();const view=render(<PasswordRecovery client={client} result={Promise.resolve({ready:{userId:'target'}})} />);
 fireEvent.change(await screen.findByLabelText('ახალი პაროლი'),{target:{value:'long-password-1'}});fireEvent.change(screen.getByLabelText('გაიმეორეთ პაროლი'),{target:{value:'other-password-1'}});
 fireEvent.click(screen.getByRole('button',{name:'პაროლის შეცვლა'}));expect(screen.getByRole('alert').textContent).toContain('არ ემთხვევა');expect(auth.updateUser).not.toHaveBeenCalled();
 fireEvent.change(screen.getByLabelText('გაიმეორეთ პაროლი'),{target:{value:'long-password-1'}});fireEvent.click(screen.getByRole('button',{name:'პაროლის შეცვლა'}));
 expect((await screen.findByRole('status')).textContent).toContain('პაროლი შეიცვალა');expect(screen.queryByLabelText('ახალი პაროლი')).toBeNull();
 view.unmount(); render(<PasswordRecovery client={client} result={null} />);expect(screen.getByRole('alert').textContent).toContain('ბმულის დადასტურება ვერ მოხერხდა');
});
it('does not claim success when the update fails',async()=>{
 const {client,auth}=mockClient();auth.updateUser.mockResolvedValueOnce({data:{user:{id:'target'}},error:new Error('failure') as never});render(<PasswordRecovery client={client} result={Promise.resolve({ready:{userId:'target'}})} />);
 fireEvent.change(await screen.findByLabelText('ახალი პაროლი'),{target:{value:'long-password-1'}});fireEvent.change(screen.getByLabelText('გაიმეორეთ პაროლი'),{target:{value:'long-password-1'}});fireEvent.click(screen.getByRole('button',{name:'პაროლის შეცვლა'}));
 expect((await screen.findByRole('alert')).textContent).toContain('ვერ დადასტურდა');await waitFor(()=>expect((screen.getByLabelText('ახალი პაროლი') as HTMLInputElement).value).toBe(''));
});

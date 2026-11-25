// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { forwardRef, useImperativeHandle } from 'react';
import { validateAuthCallback } from '../src/lib/trustedAuthCallback';
import { SignupForm } from '../src/account/Signup';
import { TeacherSignIn } from '../src/teacher/TeacherSignIn';
import { RecoveryRequest } from '../src/account/PasswordRecovery';
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: forwardRef(function MockWidget(props: {options:{action:string};onSuccess:(s:string)=>void}, ref) {
    useImperativeHandle(ref,()=>({reset:vi.fn()}));
    return <button type="button" onClick={()=>props.onSuccess(props.options.action+'-synthetic-token')}>{props.options.action}</button>;
  }),
}));
afterEach(()=>{cleanup();vi.unstubAllEnvs();vi.unstubAllGlobals();});
it('pins connected-mode callback to a configured exact HTTPS origin and root path',()=>{
 expect(validateAuthCallback('https://academy.example','/','signup','https://academy.example',true)).toBe('https://academy.example/?signup=1');
 for(const [origin,path,pin] of [['https://evil.example','/','https://academy.example'],['https://academy.example','/elsewhere','https://academy.example'],['https://academy.example','/','https://academy.example/'],['https://academy.example','/',undefined],['http://localhost','/','http://localhost']]) {
  expect(()=>validateAuthCallback(origin!,path!,'signup',pin,true)).toThrow();
 }
 expect(()=>validateAuthCallback('https://academy.example','//evil.example/','signup','https://academy.example',true)).toThrow();
});
it('checks a separate Worker token and passes a different CAPTCHA token to Supabase signup',async()=>{
 vi.stubEnv('VITE_TURNSTILE_REVIEW','true');vi.stubEnv('VITE_TURNSTILE_SITE_KEY','test-public-key');
 const fetcher=vi.fn(async()=>new Response(JSON.stringify({verified:true}),{status:200,headers:{'content-type':'application/json'}}));vi.stubGlobal('fetch',fetcher);
 const signUp=vi.fn(async()=>({data:{session:null},error:null}));const client={auth:{signUp}} as unknown as SupabaseClient;
 render(<SignupForm client={client} appClient={null}/>);
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'adult@example.test'}});
 fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'long-password'}});
 fireEvent.change(screen.getByLabelText('გაიმეორეთ პაროლი'),{target:{value:'long-password'}});
 fireEvent.click(screen.getByLabelText('ვარ სრულწლოვანი და ამ ანგარიშის მოთხოვნის უფლება მაქვს'));
 expect((screen.getByText('მოთხოვნის გაგზავნა') as HTMLButtonElement).disabled).toBe(true);
 fireEvent.click(screen.getByText('academy_auth'));fireEvent.click(screen.getByText('supabase_auth'));
 fireEvent.click(screen.getByText('მოთხოვნის გაგზავნა'));
 await waitFor(()=>expect(signUp).toHaveBeenCalledTimes(1));
 expect(fetcher).toHaveBeenCalledWith('/api/auth/signup-verify',expect.objectContaining({body:JSON.stringify({email:'adult@example.test',password:'long-password',role:'student',turnstileToken:'academy_auth-synthetic-token'})}));
 expect(signUp.mock.calls[0][0]).toMatchObject({options:{captchaToken:'supabase_auth-synthetic-token'}});
});
it('blocks submission when the Worker check fails and requires new tokens',async()=>{
 vi.stubEnv('VITE_TURNSTILE_REVIEW','true');vi.stubEnv('VITE_TURNSTILE_SITE_KEY','test-public-key');
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(null,{status:403})));
 const signUp=vi.fn();const client={auth:{signUp}} as unknown as SupabaseClient;render(<SignupForm client={client} appClient={null}/>);
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'adult@example.test'}});fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'long-password'}});fireEvent.change(screen.getByLabelText('გაიმეორეთ პაროლი'),{target:{value:'long-password'}});fireEvent.click(screen.getByLabelText('ვარ სრულწლოვანი და ამ ანგარიშის მოთხოვნის უფლება მაქვს'));
 fireEvent.click(screen.getByText('academy_auth'));fireEvent.click(screen.getByText('supabase_auth'));fireEvent.click(screen.getByText('მოთხოვნის გაგზავნა'));
 await screen.findByRole('alert');expect(signUp).not.toHaveBeenCalled();expect((screen.getByText('მოთხოვნის გაგზავნა') as HTMLButtonElement).disabled).toBe(true);
});

it('passes the Supabase token on teacher password sign-in after Worker verification',async()=>{
 vi.stubEnv('VITE_TURNSTILE_REVIEW','true');vi.stubEnv('VITE_TURNSTILE_SITE_KEY','test-public-key');vi.stubGlobal('fetch',vi.fn(async()=>new Response(null,{status:204})));
 const signInWithPassword=vi.fn(async()=>({error:null}));const client={auth:{signInWithPassword}} as unknown as SupabaseClient;
 render(<TeacherSignIn client={client} onSignedIn={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'teacher@example.test'}});fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'password'}});
 fireEvent.click(screen.getByText('academy_auth'));fireEvent.click(screen.getByText('supabase_auth'));fireEvent.click(screen.getByRole('button',{name:'შესვლა'}));
 await waitFor(()=>expect(signInWithPassword).toHaveBeenCalledWith({email:'teacher@example.test',password:'password',options:{captchaToken:'supabase_auth-synthetic-token'}}));
});
it('passes the Supabase token for recovery requests',async()=>{
 vi.stubEnv('VITE_TURNSTILE_REVIEW','true');vi.stubEnv('VITE_TURNSTILE_SITE_KEY','test-public-key');vi.stubGlobal('fetch',vi.fn(async()=>new Response(null,{status:204})));
 const resetPasswordForEmail=vi.fn(async()=>({error:null}));const client={auth:{resetPasswordForEmail}} as unknown as SupabaseClient;
 render(<RecoveryRequest client={client}/>);fireEvent.click(screen.getByText('პაროლი დაგავიწყდათ?'));fireEvent.change(screen.getByLabelText('ანგარიშის ელფოსტა'),{target:{value:'adult@example.test'}});
 fireEvent.click(screen.getByText('academy_auth'));fireEvent.click(screen.getByText('supabase_auth'));fireEvent.click(screen.getByText('აღდგენის მოთხოვნა'));
 await waitFor(()=>expect(resetPasswordForEmail).toHaveBeenCalledWith('adult@example.test',expect.objectContaining({captchaToken:'supabase_auth-synthetic-token'})));
});
it('does not mistake a 200 SPA fallback for a successful Worker verification',async()=>{
 vi.stubEnv('VITE_TURNSTILE_REVIEW','true');vi.stubEnv('VITE_TURNSTILE_SITE_KEY','test-public-key');
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('<html>static fallback</html>',{status:200,headers:{'content-type':'text/html'}})));
 const signInWithPassword=vi.fn();const client={auth:{signInWithPassword}} as unknown as SupabaseClient;
 render(<TeacherSignIn client={client} onSignedIn={()=>{}}/>);
 fireEvent.change(screen.getByLabelText('ელფოსტა'),{target:{value:'teacher@example.test'}});
 fireEvent.change(screen.getByLabelText('პაროლი'),{target:{value:'password'}});
 fireEvent.click(screen.getByText('academy_auth'));fireEvent.click(screen.getByText('supabase_auth'));
 fireEvent.click(screen.getByRole('button',{name:'შესვლა'}));
 await screen.findByRole('alert');expect(signInWithPassword).not.toHaveBeenCalled();
});

// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
vi.mock('../src/router',async(importOriginal)=>({...(await importOriginal<typeof import('../src/router')>()),useHashRoute:()=>'/account/google'}));
vi.mock('../src/account/LoginPreview',()=>({LoginPreview:()=> <p>email login</p>}));
import { Shell } from '../src/Shell';
afterEach(cleanup);
it('sends a legacy Google callback route to email login without offering Google',()=>{
 render(<Shell/>);expect(screen.getByText('email login')).toBeTruthy();expect(screen.queryByText(/Google/)).toBeNull();
});

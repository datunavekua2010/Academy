// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Entry } from '../src/Entry';
import App from '../src/App';

beforeEach(() => { window.location.hash = ''; window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); window.location.hash = ''; });

it('opens the login preview from the preview entry without accepting credentials or making a request', async () => {
  const fetch = vi.spyOn(globalThis, 'fetch');
  render(<Entry />);
  expect(screen.getByRole('link', { name: 'შესვლა' }).getAttribute('href')).toBe('#/account/login');
  window.location.hash = '#/account/login';
  fireEvent(window, new HashChangeEvent('hashchange'));
  expect(await screen.findByRole('heading', { name: 'ანგარიშში შესვლა' }, { timeout: 15000 })).toBeTruthy();
  expect(screen.getByRole('status').textContent).toContain('ანგარიშით შესვლა ჯერ არ არის ხელმისაწვდომი');
  expect(screen.getByLabelText('ელფოსტა').matches(':disabled')).toBe(true);
  expect(screen.getByLabelText('პაროლი').matches(':disabled')).toBe(true);
  expect(screen.getByRole('button', { name: 'შესვლა' }).matches(':disabled')).toBe(true);
  fireEvent.submit(screen.getByRole('form', { name: 'შესვლის ფორმის წინასწარი ხედი' }));
  expect(fetch).not.toHaveBeenCalled();
}, 30000);

it('provides the login preview link in the landing navigation', () => {
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'მთავარი ნავიგაცია' });
  expect(within(nav).getByRole('link', { name: 'შესვლა' }).getAttribute('href')).toBe('#/account/login');
});

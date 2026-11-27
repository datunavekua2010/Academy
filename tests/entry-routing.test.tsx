// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Entry } from '../src/Entry';

beforeEach(() => { window.location.hash = ''; window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); window.location.hash = ''; });
function go(hash: string) { window.location.hash = hash; fireEvent(window, new HashChangeEvent('hashchange')); }

it('exposes semantic preview landmarks and loads the landing and app routes on demand', async () => {
  render(<Entry />);
  expect(screen.getByRole('banner')).toBeTruthy();
  expect(screen.getByRole('navigation', {name:'საიტის ნავიგაცია'})).toBeTruthy();
  expect(screen.getByRole('main')).toBeTruthy();
  expect(screen.getByRole('contentinfo')).toBeTruthy();
  expect(screen.getByRole('link', {name:/Axiom Academy/}).classList.contains('preview-choice-brand')).toBe(true);
  go('#home');
  expect(await screen.findByRole('navigation', {name:'მთავარი ნავიგაცია'}, {timeout:15000})).toBeTruthy();
  go('#/student');
  expect(await screen.findByRole('button', {name:'Axi-ს ნავიგაციის დახურვა'}, {timeout:15000})).toBeTruthy();
  go('#/');
  expect(await screen.findByRole('heading', {name:'რომელი სივრცის ნახვა გსურთ?'})).toBeTruthy();
}, 30000);

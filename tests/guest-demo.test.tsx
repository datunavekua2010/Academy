// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { TEST_ACCOUNT_ID } from '../src/student/accountMode';

beforeEach(() => { localStorage.clear(); resetProgressCache(); window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); localStorage.clear(); resetProgressCache(); window.location.hash = ''; });
it('opens the clearly labelled test account without sign-in or sign-out', () => {
  window.location.hash = '#/student';
  render(<StudentApp />);
  expect(screen.getByRole('heading', { name: /გამარჯობა, მოსწავლე/ })).toBeTruthy();
  expect(screen.getByText(/ადგილობრივი სივრცე · დავალებები/)).toBeTruthy();
  expect(screen.queryByLabelText('ელფოსტა')).toBeNull();
  expect(screen.queryByLabelText('პაროლი')).toBeNull();
  expect(screen.queryByRole('button', { name: 'მოსწავლის ანგარიშიდან გასვლა' })).toBeNull();
});
it('keeps test lesson progress away from legacy and real account data', () => {
  const legacy = JSON.stringify({ 'g6-u10-l3': { status: 'completed', checkCorrect: 2, checkTotal: 2 } });
  const real = JSON.stringify({ 'g6-u10-l3': { status: 'completed' } });
  localStorage.setItem(LEARN_STORAGE_KEY, legacy);
  localStorage.setItem(`${LEARN_STORAGE_KEY}:real-student`, real);
  window.location.hash = '#/student/lessons/g6-u10-l3';
  render(<StudentApp />);
  const input = screen.getByRole('textbox') as HTMLInputElement;
  expect(input.readOnly).toBe(false);
  fireEvent.change(input, { target: { value: '5x' } });
  expect(input.value).toBe('5x');
  expect(localStorage.getItem(LEARN_STORAGE_KEY)).toBe(legacy);
  expect(localStorage.getItem(`${LEARN_STORAGE_KEY}:real-student`)).toBe(real);
  expect(JSON.parse(localStorage.getItem(`${LEARN_STORAGE_KEY}:${TEST_ACCOUNT_ID}`) ?? '{}')['g6-u10-l3'].status).toBe('started');
});
it('opens the achievement catalog directly', () => {
  window.location.hash = '#/student/achievements';
  render(<StudentApp />);
  expect(screen.getByRole('heading', { name: 'მიღწევები' })).toBeTruthy();
});

it('shows the classroom join interface without simulating enrollment in the local account', () => {
  window.location.hash = '#/student/profile';
  render(<StudentApp />);
  expect(screen.getByRole('heading', { name: 'კლასში გაწევრიანება' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'კლასში შესვლა' }).matches(':disabled')).toBe(true);
  expect(screen.queryByText('კლასს შეუერთდი.')).toBeNull();
});

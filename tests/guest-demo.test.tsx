// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';

afterEach(() => { cleanup(); localStorage.clear(); resetProgressCache(); window.location.hash = ''; });
it('does not fabricate a student when configuration is absent, and offers a clearly unavailable sign-in', () => {
  window.scrollTo = vi.fn();
  window.location.hash = '#/student';
  render(<StudentApp />);
  expect(screen.getByLabelText('ელფოსტა')).toBeTruthy();
  expect(screen.getByLabelText('პაროლი')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'შესვლა' }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.getByRole('alert').textContent).toContain('მიუწვდომელია');
  expect(screen.queryByText(/ნინო/)).toBeNull();
  expect(screen.queryByText(/დემო მოსწავლედ/)).toBeNull();
});
it('lets a guest view lessons without showing or changing old demo progress', () => {
  window.scrollTo = vi.fn();
  const previous = JSON.stringify({ 'g6-u10-l3': { status: 'completed', checkCorrect: 2, checkTotal: 2 } });
  localStorage.setItem(LEARN_STORAGE_KEY, previous);
  resetProgressCache();
  window.location.hash = '#/student/lessons/g6-u10-l3';
  render(<StudentApp />);
  expect(screen.getByText(/სტუმრის რეჟიმი: შეგიძლია/)).toBeTruthy();
  fireEvent.click(screen.getByRole('textbox'));
  expect(screen.getByText(/ანგარიშში არ ხარ შესული/)).toBeTruthy();
  expect(localStorage.getItem(LEARN_STORAGE_KEY)).toBe(previous);
});

it('does not expose achievements as an authenticated student when sign-in is unavailable', () => {
  window.scrollTo = vi.fn();
  window.location.hash = '#/student/achievements';
  render(<StudentApp />);
  expect(screen.getByLabelText('ელფოსტა')).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'მიღწევები' })).toBeNull();
});

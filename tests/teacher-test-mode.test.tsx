// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { TeacherApp } from '../src/teacher/TeacherApp';
import * as data from '../src/teacher/data';
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('provides a data-free teacher preview without loading any real account data', () => {
  const load = vi.spyOn(data, 'loadTeacherData');
  window.location.hash = '#/teacher';
  render(<TeacherApp />);
  expect(screen.getByRole('status').textContent).toMatch(/ეს არ არის ანგარიში/);
  const nav = screen.getByRole('navigation', { name: 'მასწავლებლის ნავიგაცია' });
  expect(within(nav).getAllByRole('link')).toHaveLength(5);
  expect(within(nav).queryByRole('link', { name: /პროგრესის ანგარიშები/ })).toBeNull();
  expect(within(nav).getByRole('link', { name: /ანალიტიკა/ })).toBeTruthy();
  expect(within(nav).queryByRole('link', { name: /მიმოხილვა/ })).toBeNull();
  expect(within(nav).queryByRole('link', { name: /მშობლისთვის/ })).toBeNull();
  expect(screen.getByRole('link', { name: 'გაკვეთილის ჩანაწერები' })).toBeTruthy();
  expect(load).not.toHaveBeenCalled();
});

it('opens and closes the local progress report card inside analytics', async () => {
  window.location.hash = '#/teacher/analytics';
  render(<TeacherApp />);
  const button = screen.getByRole('button', { name: 'ანგარიშის შექმნა' });
  expect(button.getAttribute('aria-expanded')).toBe('false');
  expect(screen.queryByLabelText('მოსწავლე')).toBeNull();
  fireEvent.click(button);
  expect(button.getAttribute('aria-expanded')).toBe('true');
  expect(screen.getByLabelText('მოსწავლე')).toBeTruthy();
  expect(screen.getByLabelText('დაწყების თარიღი')).toBeTruthy();
  expect(screen.getByLabelText('დასრულების თარიღი')).toBeTruthy();
  fireEvent.click(button);
  expect(screen.queryByLabelText('მოსწავლე')).toBeNull();
});

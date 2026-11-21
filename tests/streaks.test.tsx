// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { STREAK_BADGES } from '../src/streaks/catalog';

beforeEach(() => { localStorage.clear(); window.location.hash = '#/student'; window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); localStorage.clear(); window.location.hash = ''; });

it('keeps the six streak badges separate and displays no unverified awards', () => {
  expect(STREAK_BADGES.map((badge) => [badge.id, badge.days])).toEqual([
    ['STREAK_3', 3], ['STREAK_7', 7], ['STREAK_14', 14], ['STREAK_30', 30], ['STREAK_60', 60], ['STREAK_100', 100],
  ]);
  window.location.hash = '#/student/streaks';
  render(<StudentApp />);
  expect(screen.getByRole('heading', { level: 1, name: 'სწავლის სერია' })).toBeTruthy();
  expect(screen.getByText(/სერიის შემოწმება ჯერ მზად არ არის/)).toBeTruthy();
  expect(screen.getByLabelText('მიმდინარე სერია უცნობია').textContent).toBe('—');
  expect(screen.getByLabelText('რეკორდი უცნობია').textContent).toBe('—');
  expect(screen.getAllByText('სტატუსი მიუწვდომელია')).toHaveLength(6);
  expect(screen.queryByRole('progressbar')).toBeNull();
  for (const badge of STREAK_BADGES) expect(screen.getByRole('heading', { name: badge.name })).toBeTruthy();
});

it('links to the page through Axi, keeps achievements, and provides a dashboard entry', async () => {
  render(<StudentApp />);
  expect(screen.getByRole('link', { name: /სერიის ნახვა/ }).getAttribute('href')).toBe('#/student/streaks');
  fireEvent.click(screen.getByRole('button', { name: 'Axi-ს ნავიგაციის გახსნა' }));
  const nav = screen.getByRole('navigation', { name: 'მოსწავლის სექციები' });
  expect(within(nav).getAllByRole('link')).toHaveLength(7);
  expect(within(nav).getByRole('link', { name: /მიღწევები/ }).getAttribute('href')).toBe('#/student/achievements');
  const streaks = within(nav).getByRole('link', { name: /სწავლის სერია/ });
  expect(streaks.getAttribute('href')).toBe('#/student/streaks');
  fireEvent.click(streaks);
  window.location.hash = '#/student/streaks';
  await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'სწავლის სერია' })).toBeTruthy());
  expect(screen.getByRole('link', { name: /დაფაზე დაბრუნება/ }).getAttribute('href')).toBe('#/student');
  expect(screen.getAllByRole('link', { name: /გააგრძელე სწავლა/ })[0].getAttribute('href')).toBe('#/student/lessons');
});

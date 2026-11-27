// @vitest-environment jsdom
import './helpers/signed-in-student';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ACHIEVEMENTS, CATEGORIES } from '../src/achievements/catalog';
import { StudentApp } from '../src/student/StudentApp';
import { Achievements } from '../src/student/pages/Achievements';
import { StudentSessionProvider } from '../src/student/session';

beforeEach(() => { window.localStorage.clear(); window.location.hash = '#/student'; window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); window.localStorage.clear(); window.location.hash = ''; });

describe('achievement catalog', () => {
  it('contains exactly the 28 requested IDs, four categories and correct tiers', () => {
    expect(ACHIEVEMENTS).toHaveLength(28);
    const expected = ['M', 'C', 'A', 'R'].flatMap((letter) => Array.from({ length: 7 }, (_, i) => `${letter}0${i + 1}`));
    expect(ACHIEVEMENTS.map((item) => item.id)).toEqual(expected);
    expect(new Set(ACHIEVEMENTS.map((item) => item.id)).size).toBe(28);
    for (const category of CATEGORIES.slice(1)) expect(ACHIEVEMENTS.filter((item) => item.category === category.id)).toHaveLength(7);
    const tiers = Object.fromEntries(ACHIEVEMENTS.filter((item) => item.tier).map((item) => [item.id, item.tier]));
    expect(tiers).toEqual({ C01: 'bronze', C02: 'silver', C03: 'gold', C04: 'diamond', C05: 'bronze', C06: 'silver', C07: 'gold', A01: 'bronze', A02: 'silver', A03: 'gold', A04: 'diamond', R01: 'bronze', R02: 'silver', R03: 'gold', R04: 'diamond' });
  });

  it('filters without reloading and opens and closes accessible requirement details', () => {
    render(<StudentSessionProvider><Achievements /></StudentSessionProvider>);
    expect(screen.getAllByRole('button', { name: /იხილე პირობები/ })).toHaveLength(28);
    const filters = screen.getByRole('group', { name: 'მიღწევების კატეგორია' });
    fireEvent.click(within(filters).getByRole('button', { name: 'ლოგიკა და მსჯელობა' }));
    expect(within(filters).getByRole('button', { name: 'ლოგიკა და მსჯელობა' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getAllByRole('button', { name: /იხილე პირობები/ })).toHaveLength(7);
    expect(screen.queryByRole('button', { name: /First Steps/ })).toBeNull();
    const card = screen.getByRole('button', { name: /Pattern Finder · ბრინჯაო/ });
    card.focus();
    fireEvent.click(card);
    const dialog = screen.getByRole('dialog', { name: /Pattern Finder/ });
    expect(within(dialog).getByText(/10 განსხვავებული/)).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(card);
    fireEvent.click(within(filters).getByRole('button', { name: 'ყველა' }));
    expect(screen.getAllByRole('button', { name: /იხილე პირობები/ })).toHaveLength(28);
  });

  it('reports unavailable verification rather than inventing an earned count or progress', () => {
    render(<StudentSessionProvider><Achievements /></StudentSessionProvider>);
    expect(screen.getByText(/მიღებული ნიშნების რაოდენობა და პროგრესი ჯერ მიუწვდომელია/)).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    expect(screen.getAllByText(/ჯერ ვერ მოწმდება/)).toHaveLength(28);
    expect(screen.getByRole('heading', { name: 'რომელ მიღწევასთან ხარ ყველაზე ახლოს?' })).toBeTruthy();
    expect(screen.getByText(/დადასტურებული პროგრესია საჭირო/)).toBeTruthy();
    const cards = screen.getAllByRole('button', { name: /პროგრესი მიუწვდომელია, იხილე პირობები/ });
    expect(cards).toHaveLength(28);
    for (const card of cards) {
      expect(within(card).getByText('პროგრესი')).toBeTruthy();
      expect(card.querySelector('.achievement-progress-track')?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(document.querySelectorAll('.achievement-progress-track')).toHaveLength(30);
    expect(screen.getByRole('heading', { name: 'ნინო ბერიძე' })).toBeTruthy();
  });
});

describe('Axi achievement navigation', () => {
  it('opens from the mascot menu and links back to the dashboard', async () => {
    render(<StudentApp />);
    const nav = screen.getByRole('navigation', { name: 'მოსწავლის სექციები' });
    const link = within(nav).getByRole('link', { name: /მიღწევები/ });
    expect(link.getAttribute('href')).toBe('#/student/achievements');
    fireEvent.click(link);
    window.location.hash = '#/student/achievements';
    expect(await screen.findByRole('heading', { level: 1, name: 'მიღწევები' })).toBeTruthy();
    const back = screen.getByRole('link', { name: /დაფაზე დაბრუნება/ });
    expect(back.getAttribute('href')).toBe('#/student');
    fireEvent.click(back);
    window.location.hash = '#/student';
    await waitFor(() => expect(screen.getByRole('button', { name: 'Axi-ს ნავიგაციის დახურვა' })).toBeTruthy());
  });
});

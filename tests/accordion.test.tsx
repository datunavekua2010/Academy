// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';

const topicTrigger = () => screen.getAllByRole('button', { name: /ქვეთემა$/ });

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '#/student/practice';
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

describe('nested curriculum accordion', () => {
  it('shows topics, units and subtopics for the selected grade only', () => {
    render(<StudentApp />);

    // Grade V is the default grade.
    expect(topicTrigger().length).toBe(3);
    fireEvent.click(topicTrigger()[0]);

    // Only the opened topic's panel is live; the others are inert.
    const live = document.querySelector('.accordion-panel:not([inert])')!;
    const units = [...live.querySelectorAll<HTMLElement>('.accordion-unit-trigger')];
    expect(units.length).toBe(2);
    expect(units[0].textContent).toContain('U1');
    expect(units[1].textContent).toContain('U2');

    // Units start closed; opening U1 reveals its subtopic only.
    expect(live.querySelectorAll('.accordion-unit-panel:not([inert])')).toHaveLength(0);
    fireEvent.click(units[0]);
    expect(live.querySelectorAll('.accordion-unit-panel:not([inert])')).toHaveLength(1);
    // The unit title and its subtopic share the name; assert on the row.
    expect(live.querySelector('.subtopic-row h3')?.textContent).toBe('სხვადასხვა მნიშვნელი');
  });

  it('opens exercises for the exact grade/topic/unit/subtopic clicked', () => {
    render(<StudentApp />);

    // Choose grade 7, open "გეომეტრია", open U2 (მოცულობა), start its subtopic.
    fireEvent.click(screen.getAllByRole('tab')[6]);
    const geo = topicTrigger().find((button) => button.textContent?.includes('გეომეტრია'))!;
    fireEvent.click(geo);

    const live = document.querySelector('.accordion-panel:not([inert])')!;
    const units = [...live.querySelectorAll<HTMLElement>('.accordion-unit-trigger')];
    const u2 = units.find((unit) => unit.textContent?.includes('U2'))!;
    fireEvent.click(u2);

    const panel = document.querySelector('#unit-panel-geometria-u2')!;
    const start = within(panel as HTMLElement).getByRole('button', { name: /დაწყება/ });
    fireEvent.click(start);

    // The runner shows the exact path that was clicked.
    const path = document.querySelector('.session-path')?.textContent ?? '';
    expect(path).toContain('გეომეტრია');
    expect(path).toContain('მოცულობა');
    expect(screen.getByRole('heading', { level: 1, name: 'მოცულობა' })).toBeTruthy();

    // The question belongs to the Volume subtopic of grade VII.
    const prompt = document.querySelector('.question-prompt')?.textContent ?? '';
    expect(prompt).toMatch(/მოცულობა|სმ³|კუბი|წახნაგი|აკვარიუმი|ლიტრი/);
  });

  it('resets to collapsed topics when the grade changes', () => {
    render(<StudentApp />);

    fireEvent.click(topicTrigger()[0]);
    expect(topicTrigger()[0].getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(screen.getAllByRole('tab')[0]);
    for (const trigger of topicTrigger()) {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    }
  });
});

// @vitest-environment jsdom
import './helpers/signed-in-student';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { parseStudentGrade } from '../src/student/pages/GradeSelection';

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/student';
  window.scrollTo = vi.fn();
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); localStorage.clear(); window.location.hash = ''; });

describe('homework grade selection', () => {
  it('reads real supported profile formats, not an invented grade', () => {
    expect(parseStudentGrade('V კლასი')).toBe(5);
    expect(parseStudentGrade('VI კლასი')).toBe(6);
    expect(parseStudentGrade('3')).toBe(3);
    expect(parseStudentGrade('VIII კლასი')).toBeNull();
    expect(parseStudentGrade(undefined)).toBeNull();
  });

  it('opens from Axi and keeps profile and chosen grade separate through homework and return', async () => {
    render(<StudentApp />);
    const panel = screen.getByRole('navigation', { name: 'მოსწავლის სექციები' });
    expect(within(panel).getByRole('link', { name: /საშინაო დავალება/ }).getAttribute('href')).toBe('#/student/homework');
    window.location.hash = '#/student/homework';
    await screen.findByRole('heading', { name: 'Choose your grade' });
    const cards = document.querySelectorAll('.grade-choice');
    expect(cards).toHaveLength(7);
    cards.forEach((card, index) => {
      expect(card.querySelector('.grade-choice-bottom')?.textContent).toContain(`კლასი ${index + 1}`);
      expect(card.getAttribute('aria-label')).toContain(`კლასი ${index + 1}`);
    });
    expect(cards[4].textContent).toContain('YOUR GRADE');
    expect(cards[4].getAttribute('aria-pressed')).toBe('true');
    for (const card of cards) {
      fireEvent.click(card);
      expect(card.getAttribute('aria-pressed')).toBe('true');
      expect(document.querySelectorAll('.grade-choice[aria-pressed="true"]')).toHaveLength(1);
    }
    expect(cards[4].textContent).toContain('YOUR GRADE');
    expect(screen.getByText('V კლასი')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: 'მასწავლებლის მიერ მინიჭებული' });
    expect(window.location.hash).toBe('#/student/homework/grade/7');
    expect(document.querySelector('.homework-page')?.textContent).toContain('VII კლასი');
    expect(localStorage.getItem('axiom:homework-grade:demo-student')).toBe('7');
    expect(screen.getByText('V კლასი')).toBeTruthy();
    window.location.hash = '#/student/homework';
    await screen.findByRole('heading', { name: 'Choose your grade' });
    expect(document.querySelectorAll('.grade-choice')[6].getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelectorAll('.grade-choice')[4].textContent).toContain('YOUR GRADE');
  });


  it('moves the desktop window without changing selection and clamps on resize', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1280 });
    let width = 1120;
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('grade-carousel') ? width : 0;
    });
    window.location.hash = '#/student/homework';
    render(<StudentApp />);
    const previous = screen.getByRole('button', { name: 'Previous grades' }) as HTMLButtonElement;
    const next = screen.getByRole('button', { name: 'Next grades' }) as HTMLButtonElement;
    fireEvent.click(previous);
    expect(previous.disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: /კლასი 1/ }));
    while (!next.disabled) fireEvent.click(next);
    expect(next.disabled).toBe(true);
    expect(document.querySelectorAll('.grade-choice')[0].getAttribute('aria-pressed')).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: /კლასი 7/ }));
    width = 900;
    act(() => window.dispatchEvent(new Event('resize')));
    expect(screen.getByRole('button', { name: /კლასი 7/ }).getAttribute('aria-pressed')).toBe('true');
    expect(next.disabled).toBe(true);
  });

  it('restores a valid learning choice but rejects invalid stored grades', async () => {
    localStorage.setItem('axiom:homework-grade:demo-student', '99');
    window.location.hash = '#/student/homework';
    render(<StudentApp />);
    expect(document.querySelectorAll('.grade-choice')[4].getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('link', { name: 'საშინაო დავალება', current: 'page' })).toBeTruthy();
    window.location.hash = '#/student/homework/grade/2';
    await waitFor(() => expect(document.querySelector('.homework-page')?.textContent).toContain('II კლასი'));
  });
});

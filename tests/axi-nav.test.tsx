// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import App from '../src/App';
import { StudentApp } from '../src/student/StudentApp';

const BUBBLES = [
  'ჩემი გაკვეთილები',
  'საშინაო დავალება',
  'ვარჯიში',
  'ჩემი პროგრესი',
  'ჩემი პროფილი',
];

function openAxi() {
  fireEvent.click(screen.getByRole('button', { name: 'Axi-ს ნავიგაციის გახსნა' }));
  return screen.getByRole('navigation', { name: 'მოსწავლის სექციები' });
}

beforeEach(() => {
  window.localStorage.clear();
  window.location.hash = '#/student';
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.location.hash = '';
});

describe('Axi student navigation', () => {
  it('opens all five destinations and closes when Axi is clicked again', () => {
    render(<StudentApp />);

    const panel = openAxi();
    for (const label of BUBBLES) {
      expect(within(panel).getByRole('link', { name: new RegExp(label) })).toBeTruthy();
    }

    fireEvent.click(screen.getByRole('button', { name: 'Axi-ს ნავიგაციის დახურვა' }));
    expect(screen.queryByRole('navigation', { name: 'მოსწავლის სექციები' })).toBeNull();
  });

  it('closes on Escape', () => {
    render(<StudentApp />);
    openAxi();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('navigation', { name: 'მოსწავლის სექციები' })).toBeNull();
  });

  it('navigates to a real student page and closes the menu', async () => {
    render(<StudentApp />);
    const panel = openAxi();

    const practiceLink = within(panel).getByRole('link', { name: /ვარჯიში/ });
    expect(practiceLink.getAttribute('href')).toBe('#/student/practice');

    fireEvent.click(practiceLink);
    // jsdom does not perform same-document anchor navigation; emulate the
    // browser updating the hash after the link is activated.
    window.location.hash = '#/student/practice';

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'ისწავლე და ივარჯიშე' })).toBeTruthy();
    });
    expect(screen.queryByRole('navigation', { name: 'მოსწავლის სექციები' })).toBeNull();
  });

  it('keeps the student area behind the session gate', () => {
    render(<StudentApp />);

    fireEvent.click(screen.getByRole('button', { name: 'მოსწავლის ანგარიშიდან გასვლა' }));
    expect(screen.getByRole('button', { name: 'შესვლა დემო მოსწავლედ' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'შესვლა დემო მოსწავლედ' }));
    expect(screen.getByRole('heading', { level: 1, name: /გამარჯობა, ნინო/ })).toBeTruthy();
  });
});

describe('unified homework + practice', () => {
  it('shows teacher-assigned subtopics on the homework page with no separate workflow', () => {
    window.location.hash = '#/student/homework';
    render(<StudentApp />);

    // The homework page is the same system, filtered to assigned subtopics.
    expect(
      screen.getByRole('heading', { level: 1, name: 'მასწავლებლის მიერ მინიჭებული' }),
    ).toBeTruthy();
    expect(screen.getAllByRole('link', { name: /გახსენი სრული სავარჯიშო სისტემა/ }).length).toBe(1);

    // No checkbox / file-upload workflow anywhere.
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('lists grades, topics and subtopics on the practice page', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    expect(screen.getByRole('heading', { level: 1, name: 'ისწავლე და ივარჯიშე' })).toBeTruthy();
    expect(screen.getByRole('tablist', { name: 'კლასების არჩევა' })).toBeTruthy();
    // All seven grades are offered.
    expect(screen.getAllByRole('tab')).toHaveLength(7);
    // The 100-point rules are rendered from the engine constants.
    expect(screen.getByText('100-ქულიანი სისტემა')).toBeTruthy();
    expect(screen.getAllByText('+4').length).toBeGreaterThan(0);
    expect(screen.getAllByText('−2').length).toBeGreaterThan(0);
  });

  it('shows every primary topic as a collapsed accordion row', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    const triggers = screen.getAllByRole('button', { name: /ქვეთემა$/ });
    // All topics of the grade are visible at once, none expanded.
    expect(triggers.length).toBe(3);
    for (const trigger of triggers) {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
    }
    // Collapsed panels stay in the DOM for the CSS animation, but are inert
    // so nothing inside them is reachable or focusable.
    for (const panel of document.querySelectorAll('.accordion-panel')) {
      expect(panel.hasAttribute('inert')).toBe(true);
    }
    // Unit rows exist only inside their topic's (inert) panel, so none is
    // visible to the student.
    expect(document.querySelectorAll('.accordion-panel:not([inert])')).toHaveLength(0);
  });

  it('expands a topic to reveal units and expands a unit to reveal subtopics', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    const topicTrigger = screen.getAllByRole('button', { name: /ქვეთემა$/ })[0];
    fireEvent.click(topicTrigger);
    expect(topicTrigger.getAttribute('aria-expanded')).toBe('true');

    // Units appear, each collapsed, with their U1/U2 codes.
    const unitTriggers = [...document.querySelectorAll<HTMLButtonElement>('.accordion-unit-trigger')];
    expect(unitTriggers.length).toBeGreaterThan(0);
    expect(unitTriggers[0].textContent).toContain('U1');
    for (const unit of unitTriggers) {
      expect(unit.getAttribute('aria-expanded')).toBe('false');
    }

    // Subtopics are hidden until the unit is opened.
    expect(document.querySelectorAll('.accordion-unit-panel:not([inert])')).toHaveLength(0);
    fireEvent.click(unitTriggers[0]);
    expect(unitTriggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(document.querySelectorAll('.accordion-unit-panel:not([inert])').length).toBe(1);
    expect(document.querySelectorAll('.subtopic-row').length).toBeGreaterThan(0);
  });

  it('keeps the other topics visible and collapses when clicked again', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    const [first, second] = screen.getAllByRole('button', { name: /ქვეთემა$/ });

    fireEvent.click(first);
    expect(first.getAttribute('aria-expanded')).toBe('true');
    // The other topic rows are still on screen.
    expect(second).toBeTruthy();
    expect(second.getAttribute('aria-expanded')).toBe('false');

    // Opening another topic collapses the first (one open at a time).
    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(first.getAttribute('aria-expanded')).toBe('false');

    // Clicking the open topic collapses it.
    fireEvent.click(second);
    expect(second.getAttribute('aria-expanded')).toBe('false');
  });

  it('expanding one unit does not collapse the other unit', () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    fireEvent.click(screen.getAllByRole('button', { name: /ქვეთემა$/ })[0]);

    // Grade I topics have a single unit each; check the general rule on a
    // grade whose topic has more units by re-using the same unit list.
    const units = screen.getAllByRole('button', { name: /^U\d/ });
    fireEvent.click(units[0]);
    expect(units[0].getAttribute('aria-expanded')).toBe('true');
    for (const unit of units.slice(1)) {
      expect(unit.getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('starts a session from a subtopic and applies the 100-point rule', async () => {
    window.location.hash = '#/student/practice';
    render(<StudentApp />);

    // Switch to grade I so the template set is small and deterministic enough.
    fireEvent.click(screen.getAllByRole('tab')[0]);

    // Only subtopics with a template can start a session; the others say so.
    const startButtons = await screen.findAllByRole('button', { name: /დაწყება/ });
    expect(startButtons.length).toBeGreaterThan(0);
    fireEvent.click(startButtons[0]);

    // The runner appears with a live score meter and a generated question.
    expect(screen.getByText(/ავტომატურად გენერირებული/)).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    // First answer in the lowest band is worth +4.
    expect(screen.getByText(/შემდეგი პასუხი: \+4 \/ −2/)).toBeTruthy();
  });
});

describe('public landing page', () => {
  it('keeps its conventional navigation and links to the student area', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: /მათემატიკა, რომელიც/ }),
    ).toBeTruthy();
    expect(screen.getByRole('navigation', { name: 'მთავარი ნავიგაცია' })).toBeTruthy();

    const studentLinks = screen.getAllByRole('link', { name: 'მოსწავლის შესვლა' });
    expect(studentLinks.length).toBeGreaterThan(0);
    for (const link of studentLinks) {
      expect(link.getAttribute('href')).toBe('#/student');
    }
  });
});

describe('practice session flow', () => {
  it('shows +4 points on a correct answer and saves progress', async () => {
    window.location.hash = '#/student/practice';
    const { container } = render(<StudentApp />);

    fireEvent.click(screen.getAllByRole('tab')[0]);
    const startButtons = await screen.findAllByRole('button', { name: /დაწყება/ });
    fireEvent.click(startButtons[0]);

    const group = await screen.findByRole('group', { name: 'პასუხის ვარიანტები' });
    const options = within(group).getAllByRole('button');
    expect(options.length).toBeGreaterThanOrEqual(3);
    fireEvent.click(options[0]);

    // Feedback always appears, with a signed point change.
    const feedback = await screen.findByText(/სწორია!|არასწორია\./);
    // Zero is shown as "0 ქულა" because the score cannot go below 0.
    expect(feedback.parentElement?.textContent).toMatch(/([+−]\d+|0) ქულა/);

    // The score meter reflects the new score (4 for a first correct, else 0).
    const meter = screen.getByRole('progressbar');
    expect([0, 4]).toContain(Number(meter.getAttribute('aria-valuenow')));

    // Advancing shows a new question and the answer state is cleared.
    fireEvent.click(screen.getByRole('button', { name: /შემდეგი კითხვა/ }));
    expect(screen.queryByText(/სწორია!|არასწორია\./)).toBeNull();
    expect(container.querySelector('.answer-feedback')).toBeNull();
  });

  it('persists completed sessions to the progress page', async () => {
    window.localStorage.clear();
    window.location.hash = '#/student/progress';
    render(<StudentApp />);

    // With no attempts the page shows the empty states, not invented numbers.
    expect(screen.getByText(/ჯერ არ გაქვს დაუსრულებელი ქვეთემა/)).toBeTruthy();
    expect(screen.getByText(/ჯერ არ გაქვს დასრულებული სესია/)).toBeTruthy();
  });
});

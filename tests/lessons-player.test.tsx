// @vitest-environment jsdom
import './helpers/signed-in-student';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { showDevLabels } from '../src/lessons/content';

function go(hash: string) {
  window.location.hash = hash;
  return render(<StudentApp />);
}
const click = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));
const type = (label: string | RegExp, value: string) => fireEvent.change(screen.getByRole('textbox', { name: label }), { target: { value } });
const feedback = () => document.querySelector('.lp-feedback')?.textContent ?? '';
const check = (value: string) => {
  type(/გაამარტივე|პასუხი|ჩაწერე/, value);
  click('პასუხის შემოწმება');
};

beforeEach(() => {
  window.localStorage.clear();
  resetProgressCache();
  window.scrollTo = vi.fn();
});
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  resetProgressCache();
  window.location.hash = '';
  document.body.style.overflow = '';
});

describe('My lessons library', () => {
  it('lives inside the existing lessons page, with the original schedule still there', () => {
    go('#/student/lessons');
    expect(screen.getByRole('heading', { name: 'ინტერაქტიული გაკვეთილები' })).toBeTruthy();
    expect(screen.getByText('განრიგი')).toBeTruthy();
    expect(screen.getAllByText('წილადები და მათი შედარება').length).toBeGreaterThan(0);
  });

  it('shows the approved Grade → Topic → Unit titles and switches grade', () => {
    go('#/student/lessons');
    fireEvent.click(within(screen.getByRole('group', { name: 'კლასის არჩევა' })).getByRole('button', { name: /^VI\s/ }));
    expect(screen.getByText('Algebraic Expressions')).toBeTruthy();
    expect(document.querySelector('a[href="#/student/lessons/g6-u10"]')?.textContent).toContain('Combining Like Terms');
  });

  it('opens the unit page with five lessons; only the demo lesson is playable', () => {
    go('#/student/lessons/g6-u10');
    const list = screen.getByRole('list');
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(5);
    expect(within(items[2]).getByText('Combining Like Terms Using Addition')).toBeTruthy();
    expect(within(items[2]).getByRole('link', { name: 'დაწყება' }).getAttribute('href')).toBe('#/student/lessons/g6-u10-l3');
    expect(within(items[0]).queryByRole('link')).toBeNull();
    expect(within(items[0]).getByText('მალე')).toBeTruthy();
  });

  it('shows a calm message for a lesson without content', () => {
    go('#/student/lessons/g6-u10-l1');
    expect(screen.getByText(/ჯერ მზად არ არის/)).toBeTruthy();
  });

  it('unknown sub-routes are not found', () => {
    go('#/student/lessons/nonsense');
    expect(screen.getByText('ეს გვერდი არ არსებობს.')).toBeTruthy();
    cleanup();
    go('#/student/practice/extra');
    expect(screen.getByText('უჰ, ეს გვერდი არ არსებობს.')).toBeTruthy();
  });
});

describe('lesson player (G6 · U10.3 demo)', () => {
  it('walks challenge → explore → understand → practice → check → completion', () => {
    go('#/student/lessons/g6-u10-l3');
    expect(screen.getByText('ნაბიჯი 1 / 9')).toBeTruthy();
    expect(screen.getByText('გამოწვევა')).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('1');

    // Challenge: the 5x² misconception gets targeted feedback, retry works
    check('5x²');
    expect(screen.getByText('ჯერ არ არის სწორი')).toBeTruthy();
    expect(feedback()).toContain('ორივე წევრში ცვლადი ერთი და იგივეა');
    expect(screen.queryByRole('button', { name: 'პასუხის შემოწმება' })).toBeNull();
    click('ხელახლა ცდა');
    check('5x');
    expect(screen.getByText('სწორია')).toBeTruthy();
    click('გაგრძელება');

    // Explore: tiles must be grouped before the question appears
    expect(screen.getByText('გამოკვლევა')).toBeTruthy();
    expect(screen.queryByRole('textbox')).toBeNull();
    expect((screen.getByRole('button', { name: 'გადაიტანე ყველა ფილა' }) as HTMLButtonElement).disabled).toBe(true);
    const tiles = () => screen.getAllByRole('button', { name: /გადაიტანე საერთო ჯგუფში/ });
    expect(tiles()).toHaveLength(5);
    for (let i = 0; i < 5; i += 1) fireEvent.click(tiles()[0]);
    expect(screen.getByText('გადატანილია 5 / 5')).toBeTruthy();
    type('რამდენი x-ია ახლა ერთ ჯგუფში?', '5');
    click('პასუხის შემოწმება');
    expect(screen.getByText('სწორია')).toBeTruthy();
    expect(screen.getByText(/ეს შენ აღმოაჩინე/)).toBeTruthy();
    click('გაგრძელება');

    // Understand
    expect(screen.getByText('გააზრება')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'ამოხსნილი მაგალითი' })).toBeTruthy();
    click('გაგრძელება');

    // Practice 1: a hint, then a wrong answer, then right
    expect(screen.getByText('პრაქტიკა')).toBeTruthy();
    click('მინიშნება');
    expect(screen.getByText('შეხედე ცვლადს ორივე წევრში. ერთი და იგივეა?')).toBeTruthy();
    check('12y');
    expect(feedback()).toContain('ნამრავლია');
    click('ხელახლა ცდა');
    check('8y');
    click('გაგრძელება');

    // Practice 2 (missing number) and 3 (invisible coefficient)
    fireEvent.change(screen.getByRole('textbox', { name: 'ცარიელი ადგილი 1' }), { target: { value: '5' } });
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    check('9m');
    expect(feedback()).toContain('უხილავი');
    click('ხელახლა ცდა');
    check('10m');
    click('გაგრძელება');

    // Independent check
    expect(screen.getByText('შემოწმება', { selector: '.lp-stage-label' })).toBeTruthy();
    check('13k');
    click('გაგრძელება');
    fireEvent.click(screen.getByRole('radio', { name: /წევრები უნდა გადავამრავლოთ/ }));
    click('პასუხის შემოწმება');
    expect(screen.getByText('არასწორია')).toBeTruthy();
    click('ხელახლა ცდა');
    fireEvent.click(screen.getByRole('radio', { name: /იკრიბება მხოლოდ კოეფიციენტები/ }));
    click('პასუხის შემოწმება');
    expect(screen.getByText('სწორია', { selector: '.lp-choice-tag' })).toBeTruthy();
    click('გაგრძელება');
    check('10n');
    click('გაკვეთილის დასრულება');

    // Completion + persistence
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(screen.getByText('3 / 3')).toBeTruthy();
    const saved = JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}');
    expect(saved['g6-u10-l3']).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
  });
});

describe('mascot, hints and completion rules', () => {
  it('tapping Axi gives the next predefined hint, which can be dismissed without losing the answer', () => {
    go('#/student/lessons/g6-u10-l3');
    type(/გაამარტივე|ჩაწერე/, '4x');
    fireEvent.click(screen.getByRole('button', { name: 'Axi — მინიშნების თხოვნა' }));
    const bubble = document.querySelector('.lp-bubble') as HTMLElement;
    expect(bubble.textContent).toContain('მინიშნება 1 / 2');
    expect(bubble.textContent).toContain('რა აქვთ საერთო?');
    fireEvent.click(screen.getByRole('button', { name: 'Axi-ს შეტყობინების დახურვა' }));
    expect(document.querySelector('.lp-bubble')).toBeNull();
    expect((screen.getByRole('textbox') as HTMLInputElement).value).toBe('4x');
    // second tap → second hint; hints never run past the last one
    fireEvent.click(screen.getByRole('button', { name: 'Axi — მინიშნების თხოვნა' }));
    expect(document.querySelector('.lp-bubble')?.textContent).toContain('მინიშნება 2 / 2');
    expect(screen.queryByRole('button', { name: 'მინიშნება' })).toBeNull();
  });

  it('closes the challenge after its attempts without revealing the answer', () => {
    go('#/student/lessons/g6-u10-l3');
    check('1');
    click('ხელახლა ცდა');
    check('2');
    expect(screen.getByText('ვნახოთ ერთად')).toBeTruthy();
    expect(feedback()).not.toContain('სწორი პასუხი');
    expect(screen.getByRole('button', { name: 'გაგრძელება' })).toBeTruthy();
  });

  it('does not mark the lesson completed when the independent check is failed, and offers a retry', () => {
    go('#/student/lessons/g6-u10-l3');
    // jump straight to the check section by walking the early steps quickly
    check('5x');
    click('გაგრძელება');
    for (let i = 0; i < 5; i += 1) fireEvent.click(screen.getAllByRole('button', { name: /გადაიტანე საერთო ჯგუფში/ })[0]);
    type('რამდენი x-ია ახლა ერთ ჯგუფში?', '5');
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    click('გაგრძელება');
    for (const right of ['8y']) {
      check(right);
      click('გაგრძელება');
    }
    fireEvent.change(screen.getByRole('textbox', { name: 'ცარიელი ადგილი 1' }), { target: { value: '5' } });
    click('პასუხის შემოწმება');
    click('გაგრძელება');
    check('10m');
    click('გაგრძელება');
    // check stage: wrong twice on every question
    for (let q = 0; q < 3; q += 1) {
      if (q === 1) {
        fireEvent.click(screen.getByRole('radio', { name: /წევრები უნდა გადავამრავლოთ/ }));
      } else {
        type(/გაამარტივე|ჩაწერე/, '0');
      }
      click('პასუხის შემოწმება');
      click('ხელახლა ცდა');
      if (q === 1) fireEvent.click(screen.getByRole('radio', { name: /ცვლადი ქრება/ }));
      else type(/გაამარტივე|ჩაწერე/, '1');
      click('პასუხის შემოწმება');
      click(q === 2 ? 'გაკვეთილის დასრულება' : 'გაგრძელება');
    }
    expect(screen.getByRole('heading', { name: 'ჯერ არ დასრულებულა' })).toBeTruthy();
    expect(JSON.parse(window.localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}')['g6-u10-l3']).toEqual({ status: 'started' });
    click('შემოწმების გამეორება');
    expect(screen.getByText('ნაბიჯი 7 / 9')).toBeTruthy();
    expect(screen.getByText('შემოწმება', { selector: '.lp-stage-label' })).toBeTruthy();
  });
});

describe('dev-only labels', () => {
  it('show a placeholder marker in development and never in production', () => {
    expect(showDevLabels()).toBe(true);
    go('#/student/lessons/g6-u10-l3');
    expect(screen.getByTestId('dev-label').textContent).toContain('DEV');
    cleanup();
    vi.stubEnv('DEV', false);
    try {
      expect(showDevLabels()).toBe(false);
      go('#/student/lessons/g6-u10-l3');
      expect(screen.queryByTestId('dev-label')).toBeNull();
      cleanup();
      go('#/student/lessons/g6-u10');
      expect(screen.queryByTestId('dev-label')).toBeNull();
      expect(document.body.textContent).not.toContain('DEV');
    } finally {
      vi.unstubAllEnvs();
    }
  });
});

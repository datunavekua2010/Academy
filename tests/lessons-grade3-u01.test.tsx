// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StudentApp } from '../src/student/StudentApp';
import { LESSON_CONTENT } from '../src/lessons/content';
import { LEARN_STORAGE_KEY, resetProgressCache } from '../src/lessons/progress';
import { estimateCalculation, roundingInterval } from '../src/lessons/exercises/RoundingGeometry';
import { RoundingLab } from '../src/lessons/exercises/RoundingTools';

beforeEach(() => { window.localStorage.clear(); resetProgressCache(); window.location.hash = ''; window.scrollTo = vi.fn(); });
afterEach(() => { cleanup(); window.localStorage.clear(); resetProgressCache(); window.location.hash = ''; });

describe('rounding and estimating', () => {
  it('handles boundaries and midpoint ties', () => {
    expect(roundingInterval(345, 10)).toMatchObject({ lower: 340, midpoint: 345, upper: 350, rounded: 350 });
    expect(roundingInterval(350, 100).rounded).toBe(400);
    expect(roundingInterval(349, 100).rounded).toBe(300);
    expect(roundingInterval(999, 100).rounded).toBe(1000);
    expect(roundingInterval(200, 100).rounded).toBe(200);
    expect(estimateCalculation(693, 278, '−', 100)).toMatchObject({ estimate: 400, exact: 415 });
  });
  it('requires both rounded operands and an estimate before revealing the exact result', () => {
    render(<RoundingLab tool={{ tool: 'rounding-lab', mode: 'estimate', place: 100, examples: [{ number: 287, other: 416, op: '+' }] }} />);
    const slider = screen.getByRole('slider');
    fireEvent.keyDown(slider, { key: 'End' });
    for (let i = 0; i < 13; i++) fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    fireEvent.click(screen.getByRole('button', { name: '300' }));
    fireEvent.click(screen.getByRole('button', { name: '400' }));
    fireEvent.click(screen.getByRole('button', { name: '700' }));
    fireEvent.click(screen.getByRole('button', { name: 'ზუსტი პასუხის ნახვა' }));
    expect(screen.getByText(/ზუსტი: 703; მიახლოებითი: 700/)).toBeTruthy();
  });
  it.each([1, 2, 3, 4, 5])('plays lesson %i and persists progress', (number) => {
    const id = `g3-u01-l${number}`;
    const lesson = LESSON_CONTENT[id];
    expect(lesson.activities.map((a) => a.id)).toEqual(['challenge', 'explore', 'understand', 'practice-1', 'practice-2', 'practice-3', 'practice-4', 'check-1', 'check-2', 'check-3']);
    window.location.hash = `#/student/lessons/${id}`;
    render(<StudentApp />);
    lesson.activities.forEach((activity, i) => {
      if (activity.kind === 'question') {
        const r = activity.response;
        if (r.type === 'choice') fireEvent.click(screen.getAllByRole('radio')[r.options.findIndex((o) => o.id === r.answer)]);
        else if (r.type === 'numeric') fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
        else throw new Error(`unexpected response ${r.type}`);
        fireEvent.click(screen.getByRole('button', { name: 'პასუხის შემოწმება' }));
        expect(document.querySelector('.lp-feedback')?.textContent).toContain('სწორია');
      }
      fireEvent.click(screen.getByRole('button', { name: i === lesson.activities.length - 1 ? 'გაკვეთილის დასრულება' : 'გაგრძელება' }));
    });
    expect(screen.getByRole('heading', { name: 'გაკვეთილი დასრულდა' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}')[id]).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
  });
});


describe('three-digit arithmetic lessons', () => {
  it.each([1, 2, 3, 4, 5])('plays U02.%i to completion and saves progress', (number) => {
    const id = `g3-u02-l${number}`;
    const lesson = LESSON_CONTENT[id];
    window.location.hash = `#/student/lessons/${id}`;
    render(<StudentApp />);
    lesson.activities.forEach((activity, i) => {
      if (activity.kind === 'question') {
        const r = activity.response;
        if (r.type === 'choice') fireEvent.click(screen.getAllByRole('radio')[r.options.findIndex((o) => o.id === r.answer)]);
        else if (r.type === 'numeric') fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
        else throw new Error(`unexpected response ${r.type}`);
        fireEvent.click(screen.getByRole('button', { name: 'პასუხის შემოწმება' }));
        expect(document.querySelector('.lp-feedback')?.textContent).toContain('სწორია');
      }
      fireEvent.click(screen.getByRole('button', { name: i === lesson.activities.length - 1 ? 'გაკვეთილის დასრულება' : 'გაგრძელება' }));
    });
    expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}')[id]).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
  });
});


describe('bar model lessons', () => {
  it.each([1, 2, 3, 4, 5])('plays U03.%i to completion and saves progress', (number) => {
    const id = `g3-u03-l${number}`;
    const lesson = LESSON_CONTENT[id];
    window.location.hash = `#/student/lessons/${id}`;
    render(<StudentApp />);
    lesson.activities.forEach((activity, i) => {
      if (activity.kind === 'question') {
        const r = activity.response;
        if (r.type === 'choice') fireEvent.click(screen.getAllByRole('radio')[r.options.findIndex((o) => o.id === r.answer)]);
        else if (r.type === 'numeric') fireEvent.change(screen.getByRole('textbox'), { target: { value: String(r.answer) } });
        else throw new Error(`unexpected response ${r.type}`);
        fireEvent.click(screen.getByRole('button', { name: 'პასუხის შემოწმება' }));
        expect(document.querySelector('.lp-feedback')?.textContent).toContain('სწორია');
      }
      fireEvent.click(screen.getByRole('button', { name: i === lesson.activities.length - 1 ? 'გაკვეთილის დასრულება' : 'გაგრძელება' }));
    });
    expect(JSON.parse(localStorage.getItem(LEARN_STORAGE_KEY) ?? '{}')[id]).toMatchObject({ status: 'completed', checkCorrect: 3, checkTotal: 3 });
  });
});

describe('hands-on activities', () => {
  it('exchanges place-value blocks and checks the student’s sum', async () => {
    const { ThreeDigitLab } = await import('../src/lessons/exercises/ThreeDigitTools');
    render(<ThreeDigitLab tool={{ tool: 'three-digit-lab', op: 'add', examples: [{ a: 268, b: 157 }] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'მეორე რიცხვის დამატება' }));
    expect(screen.getByText(/დაფაზე სულ: 425/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '10 ერთეული → 1 ათეული' }));
    fireEvent.click(screen.getByRole('button', { name: '10 ათეული → 1 ასეული' }));
    fireEvent.change(screen.getByLabelText('პასუხი'), { target: { value: '425' } });
    fireEvent.click(screen.getByRole('button', { name: 'შედეგის შემოწმება' }));
    expect(screen.getByRole('status').textContent).toContain('სწორია');
  });
  it('exchanges hundreds and tens before removing blocks', async () => {
    const { ThreeDigitLab } = await import('../src/lessons/exercises/ThreeDigitTools');
    render(<ThreeDigitLab tool={{ tool: 'three-digit-lab', op: 'subtract', examples: [{ a: 432, b: 178 }] }} />);
    const remove = screen.getByRole('button', { name: 'ბლოკების წაღება' }) as HTMLButtonElement;
    expect(remove.disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '1 ასეული → 10 ათეული' }));
    fireEvent.click(screen.getByRole('button', { name: '1 ათეული → 10 ერთეული' }));
    expect(remove.disabled).toBe(false);
    fireEvent.click(remove);
    expect(screen.getByText(/დაფაზე სულ: 254/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('პასუხი'), { target: { value: '254' } });
    fireEvent.click(screen.getByRole('button', { name: 'შედეგის შემოწმება' }));
    expect(screen.getByRole('status').textContent).toContain('სწორია');
  });
  it('requires each story step in order', async () => {
    const { MissionLab } = await import('../src/lessons/exercises/MissionTools');
    render(<MissionLab tool={{ tool: 'mission-lab', missions: [{ title: 'წიგნები', story: 'ამბავი', start: 240, steps: [{ description: 'დაამატეს 135', op: '+', amount: 135 }, { description: 'გასცეს 60', op: '−', amount: 60 }] }] }} />);
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.change(screen.getByLabelText('ნაბიჯის შედეგი'), { target: { value: '375' } });
    fireEvent.click(screen.getByRole('button', { name: 'ნაბიჯის შემოწმება' }));
    expect(screen.getByText(/ნაბიჯი 2:/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '−' }));
    fireEvent.change(screen.getByLabelText('ნაბიჯის შედეგი'), { target: { value: '315' } });
    fireEvent.click(screen.getByRole('button', { name: 'ნაბიჯის შემოწმება' }));
    expect(screen.getByText(/მთლიანი გზა: 240 \+ 135 = 375; 375 − 60 = 315/)).toBeTruthy();
  });
  it('builds a bar from known labels, then solves the missing part', async () => {
    const { BarModelLab } = await import('../src/lessons/exercises/BarModelTools');
    render(<BarModelLab tool={{ tool: 'bar-model-lab', examples: [{ story: '350-დან 120 ცნობილია.', a: 120, b: 230, missing: 'b' }] }} />);
    expect(screen.queryByRole('option', { name: '230' })).toBeNull();
    fireEvent.change(screen.getByLabelText('მთელი'), { target: { value: '350' } });
    fireEvent.change(screen.getByLabelText('პირველი ნაწილი'), { target: { value: '120' } });
    fireEvent.change(screen.getByLabelText('მეორე ნაწილი'), { target: { value: '?' } });
    fireEvent.click(screen.getByRole('button', { name: 'მოდელის შემოწმება' }));
    fireEvent.click(screen.getByRole('button', { name: '−' }));
    fireEvent.change(screen.getByLabelText('უცნობი'), { target: { value: '230' } });
    fireEvent.click(screen.getByRole('button', { name: 'გამოთვლის შემოწმება' }));
    expect(screen.getByRole('status').textContent).toContain('სწორია');
  });
});

describe('lesson structure', () => {
  it('provides distinct authored content, demonstrations, and independent checks', () => {
    for (let unit = 1; unit <= 3; unit++) for (let number = 1; number <= 5; number++) {
      const id = `g3-u0${unit}-l${number}`;
      const lesson = LESSON_CONTENT[id];
      expect(lesson.status).toBe('placeholder');
      expect(lesson.completion.minCheckCorrect).toBe(2);
      expect(lesson.activities.map(a => a.id)).toEqual(['challenge', 'explore', 'understand', 'practice-1', 'practice-2', 'practice-3', 'practice-4', 'check-1', 'check-2', 'check-3']);
      expect(lesson.activities.filter(a => a.kind === 'explore')).toHaveLength(1);
      const explain = lesson.activities.find(a => a.kind === 'explain');
      expect(explain?.kind === 'explain' && explain.blocks.length > 2).toBe(true);
      expect(explain?.kind === 'explain' && explain.blocks.filter(b => b.type.endsWith('-demo'))).toHaveLength(1);
      for (const activity of lesson.activities) if (activity.kind === 'question') {
        if (activity.stage !== 'practice') expect(activity.hints).toEqual([]);
        if (activity.stage === 'challenge') expect(activity.revealOnExhaust).toBe(false);
      }
    }
  });
  it('builds the story model with segments before assigning labels', async () => {
    const { BarModelLab } = await import('../src/lessons/exercises/BarModelTools');
    render(<BarModelLab tool={{ tool: 'bar-model-lab', buildSegments: true, examples: [{ story: 'ამბავი', a: 125, b: 143, missing: 'whole' }] }} />);
    expect(screen.queryByLabelText('მთელი')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'დაამატე სეგმენტი' }));
    fireEvent.click(screen.getByRole('button', { name: 'დაამატე სეგმენტი' }));
    fireEvent.change(screen.getByLabelText('მთელი'), { target: { value: '?' } });
    fireEvent.change(screen.getByLabelText('პირველი ნაწილი'), { target: { value: '125' } });
    fireEvent.change(screen.getByLabelText('მეორე ნაწილი'), { target: { value: '143' } });
    fireEvent.click(screen.getByRole('button', { name: 'მოდელის შემოწმება' }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.change(screen.getByLabelText('უცნობი'), { target: { value: '268' } });
    fireEvent.click(screen.getByRole('button', { name: 'გამოთვლის შემოწმება' }));
    expect(screen.getByRole('status').textContent).toContain('სწორია');
  });
});

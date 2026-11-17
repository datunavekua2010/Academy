// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { InteractionView } from '../src/practice/interactions/InteractionView';
import type { InteractionSpec } from '../src/practice/interactions/types';
import { previewTemplate } from '../src/practice/generator';
import { StudentApp } from '../src/student/StudentApp';
import { saveDraft } from '../src/practice/store';
import { startSession } from '../src/practice/session';

afterEach(cleanup);

function setup(spec: InteractionSpec, answer = '0') {
  const onSubmit = vi.fn();
  render(<InteractionView spec={spec} answer={answer} done={false} chosen={null} onSubmit={onSubmit} />);
  const check = () => fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));
  return { onSubmit, check };
}
const press = (name: string | RegExp, times = 1) => {
  for (let i = 0; i < times; i += 1) fireEvent.click(screen.getByRole('button', { name }));
};

describe('interaction widgets submit one canonical string', () => {
  it('number line: tap a tick, then check', () => {
    const { onSubmit, check } = setup({ kind: 'line', min: 0, max: 20 });
    expect(screen.getByRole('button', { name: 'შემოწმება' })).toHaveProperty('disabled', true);
    press('7');
    check();
    expect(onSubmit).toHaveBeenCalledWith('7');
  });

  it('ruler and thermometer read their unit', () => {
    const { onSubmit, check } = setup({ kind: 'line', min: 0, max: 10, style: 'ruler', bar: 6, unit: 'სმ' });
    press('6 სმ');
    check();
    expect(onSubmit).toHaveBeenCalledWith('6');
  });

  it('hundred chart and calendar', () => {
    const { onSubmit, check } = setup({ kind: 'chart', from: 1, to: 30, cols: 7, offset: 2, heads: ['ორშ', 'სამ', 'ოთხ', 'ხუთ', 'პარ', 'შაბ', 'კვი'] });
    expect(screen.getByText('კვი')).toBeTruthy();
    press('18');
    check();
    expect(onSubmit).toHaveBeenCalledWith('18');
  });

  it('pick: one, and many in order', () => {
    const one = setup({ kind: 'pick', mode: 'one', items: [{ label: '4' }, { label: '9' }, { label: '2' }] });
    press('9');
    press('2');
    one.check();
    expect(one.onSubmit).toHaveBeenCalledWith('3');
    cleanup();
    const many = setup({ kind: 'pick', mode: 'many', items: [{ label: 'ა' }, { label: 'ბ' }, { label: 'გ' }, { label: 'დ' }] });
    press('დ');
    press('ა');
    many.check();
    expect(many.onSubmit).toHaveBeenCalledWith('1,4');
  });

  it('clock: both hands are set, the answer is hh:mm', () => {
    const { onSubmit, check } = setup({ kind: 'clock' });
    press('საათი: ნაკლები'); // 12 → 11
    press('წუთი: მეტი', 6); // 0 → 30
    expect(screen.getByText(/საათი აჩვენებს: 11:30/)).toBeTruthy();
    check();
    expect(onSubmit).toHaveBeenCalledWith('11:30');
  });

  it('fill: counts the cells that are on; locked cells stay; "extra" counts only new ones', () => {
    const plain = setup({ kind: 'fill', shape: 'frame10', total: 10 });
    for (const n of [1, 2, 3, 4]) press(`უჯრა ${n}`);
    press('უჯრა 4'); // switch off again
    plain.check();
    expect(plain.onSubmit).toHaveBeenCalledWith('3');
    cleanup();

    const extra = setup({ kind: 'fill', shape: 'row', total: 8, start: 3, locked: 3, output: 'extra' });
    expect(screen.getByRole('button', { name: 'უჯრა 1' })).toHaveProperty('disabled', true);
    press('უჯრა 4');
    press('უჯრა 5');
    extra.check();
    expect(extra.onSubmit).toHaveBeenCalledWith('2');
    cleanup();

    const off = setup({ kind: 'fill', shape: 'row', total: 6, start: 6, output: 'off' });
    press('უჯრა 2');
    off.check();
    expect(off.onSubmit).toHaveBeenCalledWith('1');
  });

  it('fraction shading works on a bar and on a circle', () => {
    for (const shape of ['bar', 'circle'] as const) {
      const { onSubmit, check } = setup({ kind: 'fill', shape, total: 4 });
      press('ნაწილი 1');
      press('ნაწილი 3');
      check();
      expect(onSubmit).toHaveBeenCalledWith('2');
      cleanup();
    }
  });

  it('base-ten builder: steppers, trading, number and pair outputs', () => {
    const a = setup({ kind: 'build', startTens: 0, startOnes: 0, output: 'number' });
    press('ათეული: მეტი', 3);
    press('ერთეული: მეტი', 4);
    a.check();
    expect(a.onSubmit).toHaveBeenCalledWith('34');
    cleanup();

    const b = setup({ kind: 'build', startTens: 2, startOnes: 3, output: 'pair' });
    press(/1 ათეული → 10 ერთეული/);
    b.check();
    expect(b.onSubmit).toHaveBeenCalledWith('1,13');
    cleanup();

    const c = setup({ kind: 'build', startTens: 2, startOnes: 7, output: 'number' });
    press('ერთეული: მეტი', 5); // 12 ones
    press(/10 ერთეული → 1 ათეული/);
    expect(screen.getByText(/3 ათეული და 2 ერთეული = 32/)).toBeTruthy();
    c.check();
    expect(c.onSubmit).toHaveBeenCalledWith('32');
  });

  it('purse: total, and total/count; a coin can be taken back out', () => {
    const a = setup({ kind: 'purse', coins: [5, 10, 20], output: 'total' });
    press('10 თეთრი — დამატება');
    press('20 თეთრი — დამატება');
    press('5 თეთრი — დამატება');
    press('5 თეთრი — ამოღება');
    a.check();
    expect(a.onSubmit).toHaveBeenCalledWith('30');
    cleanup();
    const b = setup({ kind: 'purse', coins: [10, 20], output: 'totalCount' });
    press('20 თეთრი — დამატება');
    press('10 თეთრი — დამატება');
    b.check();
    expect(b.onSubmit).toHaveBeenCalledWith('30/2');
  });

  it('bins: select an item, then a bin; everything must be placed', () => {
    const { onSubmit, check } = setup({ kind: 'bins', bins: ['ლუწი', 'კენტი'], items: [{ label: '4' }, { label: '7' }, { label: '10' }] }, '0,1,0');
    const submit = screen.getByRole('button', { name: 'შემოწმება' }) as HTMLButtonElement;
    const itemsBox = () => within(screen.getByRole('group', { name: 'დასალაგებელი ელემენტები' }));
    const place = (label: string, bin: string) => {
      fireEvent.click(itemsBox().getByRole('button', { name: label }));
      fireEvent.click(screen.getByRole('button', { name: bin }));
    };
    place('4', 'ლუწი');
    place('7', 'კენტი');
    expect(submit.disabled).toBe(true);
    place('10', 'ლუწი');
    expect(submit.disabled).toBe(false);
    check();
    expect(onSubmit).toHaveBeenCalledWith('0,1,0');
  });

  it('counters: bar chart columns, tally marks, pictograms', () => {
    const bars = setup({ kind: 'counters', style: 'bars', labels: ['ა', 'ბ'], icon: 'apple', max: 5 });
    press('ა: 3');
    press('ბ: 2');
    bars.check();
    expect(bars.onSubmit).toHaveBeenCalledWith('3,2');
    cleanup();
    const tally = setup({ kind: 'counters', style: 'tally', labels: ['ვაშლი'], icon: 'apple', max: 12 });
    press('ვაშლი: მეტი', 7);
    tally.check();
    expect(tally.onSubmit).toHaveBeenCalledWith('7');
  });

  it('sequence: append from the palette, undo, check', () => {
    const { onSubmit, check } = setup({ kind: 'sequence', shown: ['dot-red', 'dot-blue'], palette: ['dot-red', 'dot-blue'], length: 2 });
    press('წითელი წრე');
    press('↶ უკან');
    press('ლურჯი წრე');
    press('წითელი წრე');
    check();
    expect(onSubmit).toHaveBeenCalledWith('dot-blue,dot-red');
  });

  it('mirror: toggles the right half', () => {
    const { onSubmit, check } = setup({ kind: 'cells', rows: ['#..', '.#.'] });
    press('რიგი 1, უჯრა 3');
    press('რიგი 2, უჯრა 2');
    check();
    expect(onSubmit).toHaveBeenCalledWith('..#/.#.');
  });

  it('signs: every slot must be chosen', () => {
    const { onSubmit, check } = setup({ kind: 'slots', tokens: ['5', '?', '3', '?', '1', '=', '7'], options: ['+', '−'] });
    const submit = screen.getByRole('button', { name: 'შემოწმება' }) as HTMLButtonElement;
    press('ადგილი 1');
    fireEvent.click(screen.getByRole('menuitem', { name: '+' }));
    expect(submit.disabled).toBe(true);
    press('ადგილი 2');
    fireEvent.click(screen.getByRole('menuitem', { name: '−' }));
    check();
    expect(onSubmit).toHaveBeenCalledWith('+,−');
  });

  it('array: grows a rectangle; reports the count, the perimeter or the sides', () => {
    const count = setup({ kind: 'array', maxRows: 6, maxCols: 8, fixedRows: 3, output: 'count' });
    expect(screen.queryByRole('button', { name: 'რიგი: მეტი' })).toBeNull();
    press('სვეტი: მეტი', 3); // 1 → 4 columns
    expect(screen.getByText(/3 × 4 = 12/)).toBeTruthy();
    count.check();
    expect(count.onSubmit).toHaveBeenCalledWith('12');
    cleanup();
    const perimeter = setup({ kind: 'array', maxRows: 6, maxCols: 8, fixedRows: 2, output: 'perimeter' });
    press('სვეტი: მეტი', 4); // 2 rows × 5 columns
    perimeter.check();
    expect(perimeter.onSubmit).toHaveBeenCalledWith('14');
    cleanup();
    const dims = setup({ kind: 'array', maxRows: 6, maxCols: 8, output: 'dims' });
    press('რიგი: მეტი', 2);
    press('სვეტი: მეტი', 4);
    dims.check();
    expect(dims.onSubmit).toHaveBeenCalledWith('3,5');
  });

  it('angle: opens in steps, and cannot pass its limits', () => {
    const { onSubmit, check } = setup({ kind: 'angle', step: 5 });
    press(/გაზრდა 30 /, 3);
    press(/შემცირება 5/);
    expect(screen.getByText('კუთხე: 85°')).toBeTruthy();
    press(/გაზრდა 5 /);
    check();
    expect(onSubmit).toHaveBeenCalledWith('90');
    cleanup();
    setup({ kind: 'angle', step: 5, start: 180 });
    expect((screen.getByRole('button', { name: /გაზრდა 30/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('place value: one digit per column', () => {
    const { onSubmit, check } = setup({ kind: 'place', digits: 4 });
    press('ათასეულები: მეტი', 2);
    press('ათეულები: მეტი', 7);
    press('ერთეულები: მეტი', 5);
    expect(screen.getByText('რიცხვი: 2075')).toBeTruthy();
    check();
    expect(onSubmit).toHaveBeenCalledWith('2075');
  });

  it('cards: fill the slots in order, take one back, then check', () => {
    const { onSubmit, check } = setup({ kind: 'tiles', cards: ['3', '8', '5'], slots: 3 });
    const submit = screen.getByRole('button', { name: 'შემოწმება' }) as HTMLButtonElement;
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(submit.disabled).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'ადგილი 1: 8' })); // 8 goes back
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    check();
    expect(onSubmit).toHaveBeenCalledWith('358');
  });

  it('fractions on the number line are labelled k/den and answered with k', () => {
    const { onSubmit, check } = setup({ kind: 'line', min: 0, max: 4, format: 'frac', den: 4 });
    expect(screen.getByText('3/4')).toBeTruthy();
    press('3/4');
    check();
    expect(onSubmit).toHaveBeenCalledWith('3');
  });

  it('after answering, the widget is read-only and shows the right solution', () => {
    render(<InteractionView spec={{ kind: 'line', min: 0, max: 10 }} answer="4" done chosen="7" onSubmit={() => {}} />);
    expect(screen.getByRole('button', { name: '7' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: '4' }).className).toContain('is-correct');
    expect(screen.getByRole('button', { name: '7' }).className).toContain('is-wrong');
  });
});

describe('in a practice session', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.location.hash = '#/student/practice';
    window.scrollTo = vi.fn();
  });
  afterEach(() => {
    window.localStorage.clear();
    window.location.hash = '';
  });

  it('a clock question is answered by setting the hands, and is marked', () => {
    const question = previewTemplate('g1-ix-u13-set-oclock', 1)[0]!;
    const ref = { grade: 1 as const, topicId: question.topicId, subtopicId: question.subtopicId };
    saveDraft(startSession(ref, [question]), window.localStorage);
    render(<StudentApp />);

    const [hour, minute] = question.answer.split(':').map(Number) as [number, number];
    // The dial starts at 12:00 and the hour stepper is bounded 1…12, so step down to the target.
    const stepDown = 12 - hour;
    press('საათი: ნაკლები', stepDown);
    press('წუთი: მეტი', minute / 5);
    fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));
    expect(screen.getByText('სწორია!')).toBeTruthy();
  });

  it('a wrong state is marked wrong, and the right solution is shown', () => {
    const question = previewTemplate('g1-ix-u02-find-on-line', 1)[0]!;
    const ref = { grade: 1 as const, topicId: question.topicId, subtopicId: question.subtopicId };
    saveDraft(startSession(ref, [question]), window.localStorage);
    render(<StudentApp />);
    const wrong = Number(question.answer) === 0 ? '1' : '0';
    fireEvent.click(screen.getByRole('button', { name: wrong }));
    fireEvent.click(screen.getByRole('button', { name: 'შემოწმება' }));
    expect(screen.getByText('არასწორია.')).toBeTruthy();
    expect(screen.getByRole('button', { name: question.answer }).className).toContain('is-correct');
  });

  it('coordinate plane: tap one point, or several (sorted)', () => {
    const one = setup({ kind: 'plane', xmin: -3, xmax: 3, ymin: -3, ymax: 3 });
    expect(screen.getByRole('button', { name: 'შემოწმება' })).toHaveProperty('disabled', true);
    press('(-2; 3)');
    press('(2; -1)');
    one.check();
    expect(one.onSubmit).toHaveBeenCalledWith('2,-1');
    cleanup();
    const many = setup({ kind: 'plane', xmin: 0, xmax: 4, ymin: 0, ymax: 4, count: 2 });
    press('(3; 1)');
    press('(1; 4)');
    press('(1; 4)');
    press('(1; 2)');
    many.check();
    expect(many.onSubmit).toHaveBeenCalledWith('1,2;3,1');
  });

  it('place value with a decimal comma: no trailing zeros', () => {
    const { onSubmit, check } = setup({ kind: 'place', digits: 2, decimals: 2 });
    press('ერთეულები: მეტი', 3);
    press('მეათედები: მეტი', 2);
    check();
    expect(onSubmit).toHaveBeenCalledWith('3,2');
    cleanup();
    const hundredths = setup({ kind: 'place', digits: 1, decimals: 2, start: 1.5 });
    press('მეასედები: მეტი', 4);
    hundredths.check();
    expect(hundredths.onSubmit).toHaveBeenCalledWith('1,54');
  });
});

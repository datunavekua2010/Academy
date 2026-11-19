// @vitest-environment jsdom
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ResponseInput } from '../src/lessons/exercises/ResponseInput';
import { evaluateResponse } from '../src/lessons/check';
import { missingInChain, solve, solvePuzzle, withBlank } from '../src/lessons/exercises/PuzzleGeometry';
import { gridFrom, latinHolds, walk } from '../src/lessons/exercises/GridGeometry';
import type { AnswerInput, Question, ResponseSpec } from '../src/lessons/types';

afterEach(cleanup);

function Exercise({ response }: { response: ResponseSpec }) {
  const [value, setValue] = useState<AnswerInput>('');
  const [verdict, setVerdict] = useState('');
  const question = { response, prompt: '', hints: [], explanation: '', fallbackFeedback: 'სცადე ისევ.' } as Question;
  return <><ResponseInput response={response} value={value} onChange={setValue} onSubmit={() => {}} disabled={false} label="პასუხი" />
    <button onClick={() => setVerdict(evaluateResponse(question, response, value).verdict)}>შემოწმება</button><output>{verdict}</output></>;
}

describe('missing-number puzzle controls', () => {
  it('finds an unknown subtrahend and checks typed input without revealing it', () => {
    const sentence = withBlank(24, '−', 7, 17, 'b');
    expect(solve(sentence).values['□']).toBe(7);
    render(<Exercise response={{ type: 'sentence-fill', sentence, blanks: ['b'] }} />);
    fireEvent.change(screen.getByLabelText('პასუხი: □'), { target: { value: '8' } });
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('incorrect')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('პასუხი: □'), { target: { value: '7' } });
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('correct')).toBeTruthy();
  });
  it('does not expose a hidden chain result through the accessible name or after typing', () => {
    render(<Exercise response={{ type: 'chain-fill', start: 10, steps: [{ op: '+', n: 4 }, { op: '−', n: 3 }], asks: [1, 2] }} />);
    expect(screen.getByLabelText('ნაბიჯების ჯაჭვი: 10 → უცნობი → უცნობი')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('პასუხი: 1-ე ნაბიჯი'), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText('პასუხი: 2-ე ნაბიჯი'), { target: { value: '11' } });
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('correct')).toBeTruthy();
  });
  it('rejects inconsistent symbol and step puzzles', () => {
    expect(() => solvePuzzle([{ a: { sym: 'x' }, op: '+', b: 1, c: 3 }, { a: { sym: 'x' }, op: '+', b: 1, c: 4 }])).toThrow();
    expect(() => missingInChain([1, 3, 6])).toThrow();
  });
});

describe('visual pattern and grid controls', () => {
  const circle = { shape: 'circle' }; const square = { shape: 'square' };
  const pattern = { kind: 'repeat' as const, block: [circle, square] };
  it('accepts a selected option, including option zero', () => {
    render(<Exercise response={{ type: 'pattern-next', pattern, shown: 2, options: [circle, square] }} />);
    fireEvent.click(screen.getAllByRole('radio')[0]);
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('correct')).toBeTruthy();
  });
  it('uses zero-based hole positions consistently', () => {
    render(<Exercise response={{ type: 'pattern-fill', pattern, length: 4, holes: [1, 2], options: [circle, square] }} />);
    fireEvent.change(screen.getByLabelText('2-ე ადგილი'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('3-ე ადგილი'), { target: { value: '0' } });
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('correct')).toBeTruthy();
  });
  it('walks on a grid through cell buttons', () => {
    render(<Exercise response={{ type: 'grid-end', rows: 2, cols: 2, start: { row: 1, col: 1 }, moves: [{ dir: 'right' }, { dir: 'down' }] }} />);
    fireEvent.click(screen.getByRole('button', { name: 'მწკრივი 2, სვეტი 2' }));
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('correct')).toBeTruthy();
    expect(walk({ row: 0, col: 1 }, [], 2, 2).ok).toBe(false);
  });
  it('requires a complete valid grid', () => {
    const grid = gridFrom([[circle, null], [null, circle]]);
    expect(latinHolds(grid, [circle, square]).ok).toBe(false);
    render(<Exercise response={{ type: 'grid-fill', grid, items: [circle, square], options: [circle, square] }} />);
    fireEvent.change(screen.getByLabelText('მწკრივი 1, სვეტი 2:'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('incomplete')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('მწკრივი 2, სვეტი 1:'), { target: { value: '1' } });
    fireEvent.click(screen.getByText('შემოწმება'));
    expect(screen.getByText('correct')).toBeTruthy();
  });
});

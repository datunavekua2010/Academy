// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { pictorialize, describePicture } from '../src/practice/pictures/parse';
import { PictureView, pictureTargets } from '../src/practice/pictures/PictureView';
import type { Picture } from '../src/practice/pictures/types';
import { clockFace } from '../src/practice/templates/clock';
import { coinRow } from '../src/practice/templates/coins';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { generateFromTemplate } from '../src/practice/templates/generate';

const pictures = (text: string, isVisual = true): Picture[] =>
  pictorialize(text, { isVisual }).flatMap((s) => (s.type === 'picture' ? [s.picture] : []));

describe('pictorialize', () => {
  it('turns an emoji row into the same number of drawn objects', () => {
    const [pic] = pictures('🍎 🍎 🍎 🍎 🍎');
    expect(pic?.kind).toBe('rows');
    if (pic?.kind !== 'rows') return;
    expect(pic.rows[0]!.tokens.filter((t) => t.t === 'icon')).toHaveLength(5);
  });

  it('keeps a caption and a row for each group', () => {
    const [pic] = pictures('პირველი ჯგუფი: 🍪 🍪 🍪\nმეორე ჯგუფი: 🍪 🍪 🍪 🍪 🍪');
    if (pic?.kind !== 'rows') throw new Error('expected rows');
    expect(pic.rows.map((r) => r.label)).toEqual(['პირველი ჯგუფი', 'მეორე ჯგუფი']);
    expect(pic.rows.map((r) => r.tokens.length)).toEqual([3, 5]);
  });

  it('keeps the instruction and lifts only the picture out of a prompt', () => {
    const segments = pictorialize('⭐ ⭐ ⭐ ⭐\n\nრამდენი ვარსკვლავია გამოსახული?', { isVisual: false });
    expect(segments.map((s) => s.type)).toEqual(['picture', 'text']);
    expect(segments[1]).toEqual({ type: 'text', text: 'რამდენი ვარსკვლავია გამოსახული?' });
  });

  it('leaves a sentence that merely contains an emoji alone', () => {
    const text = 'ხეზე იყო 12 ფორთოხალი 🍊. რამდენი დარჩა?';
    expect(pictorialize(text, { isVisual: false })).toEqual([{ type: 'text', text }]);
  });

  it('leaves a sum with a placeholder as text', () => {
    expect(pictures('❓ + 3 = 8')).toHaveLength(0);
    expect(pictures('📦 + 3 = 10')).toHaveLength(0);
  });

  it('draws the exact time the generator recorded, even where the text dial is ambiguous', () => {
    // 2:30 and 3:30 are the same picture in characters; the recorded time decides.
    expect(clockFace(150)).toBe(clockFace(210));
    const segments = pictorialize(clockFace(210), { isVisual: true, clocks: [210] });
    expect(segments).toEqual([{ type: 'picture', picture: { kind: 'clock', minutes: 210 } }]);
  });

  it('never guesses an hour from an ambiguous dial', () => {
    expect(pictures(clockFace(150))).toHaveLength(0);
    expect(pictures(clockFace(180))).toEqual([{ kind: 'clock', minutes: 180 }]);
  });

  it('reads a purse back to its coins, with the label', () => {
    const [pic] = pictures(`ანა\n${coinRow([50, 20, 5])}`);
    expect(pic).toEqual({ kind: 'coins', label: 'ანა', coins: [50, 20, 5] });
  });

  it('reads a hundred-chart block and finds the marked cell', () => {
    const [pic] = pictures('  [77]   [78]   [79]\n  [87]   [88]   [89]\n  [97] 👉[98]   [99]', false);
    if (pic?.kind !== 'chart') throw new Error('expected chart');
    expect(pic.rows).toHaveLength(3);
    expect(pic.rows[2]![1]).toMatchObject({ text: '98', mark: true });
  });

  it('reads a number strip with its marked number', () => {
    const [pic] = pictures('11 12 13 [14] 15 16');
    if (pic?.kind !== 'strip') throw new Error('expected strip');
    expect(pic.cells.map((c) => c.text)).toEqual(['11', '12', '13', '14', '15', '16']);
    expect(pic.cells.find((c) => c.mark)?.text).toBe('14');
  });

  it('reads which side of a balance is lower', () => {
    const [left] = pictures('[ 🍎 🍎 🍎 🍎 ] (დაბლა)\n   \\═══ ▲ ═══/\n             [ 🍎 ] (მაღლა)');
    const [right] = pictures('             [ 🍎 ] (მაღლა)\n   /═══ ▲ ═══\\\n[ 🍎 🍎 🍎 ] (დაბლა)');
    const [level] = pictures('[ ⚽ ⚽ ⚽ ]  ═══ ▲ ═══  [ ⚽ ⚽ ⚽ ]');
    expect(left).toMatchObject({ kind: 'balance', tilt: 'left' });
    expect(right).toMatchObject({ kind: 'balance', tilt: 'right' });
    expect(level).toMatchObject({ kind: 'balance', tilt: 'level' });
  });

  it('turns ten blue squares into one ten rod', () => {
    const [pic] = pictures(`🟦 🟦 🟦 🟦 🟦 🟦 🟦 🟦 🟦 🟦 | 🟦 🟦 🟦 🟦 🟦 🟦 🟦 🟦 🟦 🟦\n🟨 🟨 🟨`);
    if (pic?.kind !== 'rows') throw new Error('expected rows');
    expect(pic.rows[0]!.tokens.filter((t) => t.t === 'rod')).toHaveLength(2);
    expect(pic.rows[1]!.tokens.filter((t) => t.t === 'icon')).toHaveLength(3);
  });

  it('describes a picture in Georgian for a screen reader', () => {
    const [pic] = pictures('🍎 🍎 🍎');
    expect(describePicture(pic!)).toBe('ვაშლი: 3');
  });
});

describe('the pictures cover Grade I and II', () => {
  it('reads and draws every question without losing its instruction', () => {
    let drawn = 0;
    let checked = 0;
    for (const template of TEMPLATE_REGISTRY.all) {
      if (template.grade > 2) continue;
      for (const seed of [3, 41]) {
        let q;
        try {
          q = generateFromTemplate(template, { seed });
        } catch {
          continue;
        }
        checked += 1;
        const visual = q.visual ? pictorialize(q.visual, { isVisual: true, clocks: q.clocks }) : [];
        const prompt = pictorialize(q.prompt, { isVisual: false });
        for (const segment of [...visual, ...prompt]) {
          if (segment.type !== 'picture') continue;
          drawn += 1;
          expect(() => renderToStaticMarkup(<PictureView picture={segment.picture} />)).not.toThrow();
        }
        // The words of a prompt survive: its last text line is still on screen.
        const wordsOnly = q.prompt
          .split('\n')
          .filter((l) => /[ა-ჰ]{3}/.test(l) && !/[\p{Extended_Pictographic}▬▮▪■□│╭╰┼═●◆▲△▭⬠⬡○\[]/u.test(l));
        const textOut = prompt.flatMap((s) => (s.type === 'text' ? [s.text] : [])).join('\n');
        for (const line of wordsOnly) expect(textOut).toContain(line.trim());
      }
    }
    expect(checked).toBeGreaterThan(1000);
    expect(drawn).toBeGreaterThan(500);
  });
});

afterEach(cleanup);

describe('PictureView interaction', () => {
  const strip: Picture = {
    kind: 'strip',
    cells: [{ text: '13' }, { text: '14', mark: true }, { text: '15' }],
  };

  it('offers every unmarked number as a target and never the marked one', () => {
    expect(pictureTargets(strip)).toEqual(['13', '15']);
  });

  it('submits the tapped number', () => {
    const onPick = vi.fn();
    render(<PictureView picture={strip} pick={{ enabled: true, onPick, stateOf: () => undefined }} />);
    fireEvent.click(screen.getByRole('button', { name: '15' }));
    expect(onPick).toHaveBeenCalledWith('15');
  });

  it('stops accepting taps once the question is answered and marks the result with a symbol', () => {
    const onPick = vi.fn();
    render(
      <PictureView
        picture={strip}
        pick={{ enabled: false, onPick, stateOf: (v) => (v === '15' ? 'correct' : v === '13' ? 'wrong' : undefined) }}
      />,
    );
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText('✓')).toBeTruthy();
    expect(screen.getByText('✗')).toBeTruthy();
  });

  it('lets a student tap objects to count them, in order', () => {
    const [pic] = pictures('🍎 🍎 🍎 🍎');
    render(<PictureView picture={pic!} />);
    const buttons = screen.getAllByRole('button', { name: 'დასათვლელი' });
    expect(buttons).toHaveLength(4);
    fireEvent.click(buttons[0]!);
    fireEvent.click(buttons[1]!);
    expect(screen.getByText('დათვლილია: 2')).toBeTruthy();
  });

  it('offers coins as targets under both spellings of the answer', () => {
    expect(pictureTargets({ kind: 'coins', coins: [50, 20] })).toEqual(['50', '50 თეთრი', '20', '20 თეთრი']);
  });

  it('offers named shapes as targets', () => {
    const [pic] = pictures('△   ▭   ⬡   □');
    expect(pictureTargets(pic!)).toEqual(['სამკუთხედი', 'მართკუთხედი', 'ექვსკუთხედი', 'კვადრატი']);
  });
});

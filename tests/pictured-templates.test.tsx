// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { previewTemplate } from '../src/practice/generator';
import { PictureView } from '../src/practice/pictures/PictureView';
import { describePicture, describedPictures } from '../src/practice/pictures/parse';
import { liftPictures } from '../src/practice/pictures/lift';
import type { Picture } from '../src/practice/pictures/types';

afterEach(cleanup);

const pictured = TEMPLATE_REGISTRY.all.filter((t) => /^g[1-4]-px-/.test(t.id));

type Rows = Extract<Picture, { kind: 'rows' }>;
const iconCount = (p: Picture, icon?: string): number =>
  p.kind === 'rows'
    ? (p as Rows).rows.reduce((n, r) => n + countTokens(r.tokens, icon), 0)
    : 0;
function countTokens(tokens: Rows['rows'][number]['tokens'], icon?: string): number {
  return tokens.reduce((n, t) => {
    if (t.t === 'icon') return n + (icon === undefined || t.icon === icon ? (t.state === 'crossed' ? 0 : 1) : 0);
    if (t.t === 'group') return n + countTokens(t.tokens, icon);
    return n;
  }, 0);
}
const blockValue = (p: Picture): number => (p.kind === 'blocks' ? p.tens * 10 + p.ones : 0);

describe('pictured templates (Grades I–IV)', () => {
  it('there are pictured templates in both grades', () => {
    expect(pictured.filter((t) => t.grade === 1).length).toBeGreaterThan(40);
    expect(pictured.filter((t) => t.grade === 2).length).toBeGreaterThan(55);
    expect(pictured.filter((t) => t.grade === 3).length).toBeGreaterThan(40);
  });

  for (const template of pictured) {
    it(`${template.id}: every variation draws a picture that renders`, () => {
      const questions = previewTemplate(template.id, 12);
      expect(questions.length).toBeGreaterThan(2);
      for (const question of questions) {
        expect(question.pictures?.length, question.prompt).toBeGreaterThan(0);
        for (const picture of question.pictures!) {
          expect(describePicture(picture).length).toBeGreaterThan(0);
          const { container, unmount } = render(<PictureView picture={picture} />);
          expect(container.querySelector('[data-picture]'), picture.kind).not.toBeNull();
          unmount();
        }
        // The key must never be written into the picture's „?“.
        const text = JSON.stringify(question.pictures);
        if (/"\?"/.test(text) && !question.options.length) {
          expect(text).not.toContain(`"${question.answer}"?`);
        }
      }
    });
  }

  it('what is drawn is what the key counts', () => {
    const check = (id: string, expected: (q: { answer: string; prompt: string; pictures: Picture[] }) => number) => {
      for (const q of previewTemplate(id, 20)) {
        expect(Number(q.answer), `${id}: ${q.prompt}`).toBe(expected({ answer: q.answer, prompt: q.prompt, pictures: q.pictures! }));
      }
    };
    check('g1-px-u02-count-row', (q) => iconCount(q.pictures[0]!));
    check('g1-px-u02-ten-and-more', (q) => iconCount(q.pictures[0]!));
    check('g1-px-u03-count-two-rows', (q) => iconCount({ kind: 'rows', rows: [(q.pictures[0] as Rows).rows[0]!] }));
    check('g1-px-u16-crossed-left', (q) => iconCount(q.pictures[0]!));
    check('g1-px-u04-read-blocks', (q) => blockValue(q.pictures[0]!));
    check('g1-px-u08-tens-add', (q) => q.pictures.reduce((n, p) => n + blockValue(p), 0));
    check('g1-px-u08-add-ones', (q) => q.pictures.reduce((n, p) => n + blockValue(p), 0));
    check('g1-px-u08-carry-ones', (q) => q.pictures.reduce((n, p) => n + blockValue(p), 0));
    check('g1-px-u08-sub-ones', (q) => blockValue(q.pictures[0]!) - blockValue(q.pictures[1]!));
    check('g1-px-u08-sub-borrow', (q) => blockValue(q.pictures[0]!) - blockValue(q.pictures[1]!));
    check('g1-px-u05-bigger-number', (q) => Math.max(...q.pictures.map(blockValue)));
    check('g1-px-u05-how-many-more', (q) => iconCount({ kind: 'rows', rows: [(q.pictures[0] as Rows).rows[0]!] }) - iconCount({ kind: 'rows', rows: [(q.pictures[0] as Rows).rows[1]!] }));
    check('g2-px-u01-read-blocks', (q) => blockValue(q.pictures[0]!));
    check('g2-px-u03-two-groups', (q) => iconCount(q.pictures[0]!));
    check('g2-px-u03-crossed', (q) => iconCount(q.pictures[0]!));
    check('g2-px-u03-double', (q) => iconCount(q.pictures[0]!));
    check('g2-px-u04-blocks-no-carry', (q) => q.pictures.reduce((n, p) => n + blockValue(p), 0));
    check('g2-px-u04-blocks-carry', (q) => q.pictures.reduce((n, p) => n + blockValue(p), 0));
    check('g2-px-u04-tens-blocks', (q) => q.pictures.reduce((n, p) => n + blockValue(p), 0));
    check('g2-px-u05-blocks-no-borrow', (q) => blockValue(q.pictures[0]!) - blockValue(q.pictures[1]!));
    check('g2-px-u05-blocks-borrow', (q) => blockValue(q.pictures[0]!) - blockValue(q.pictures[1]!));
    check('g2-px-u07-read-model', (q) => blockValue(q.pictures[0]!));
    check('g2-px-u07-trade', (q) => blockValue(q.pictures[0]!));
    check('g2-px-u07-add-models', (q) => q.pictures.reduce((n, p) => n + blockValue(p), 0));
    check('g2-px-u10-pictogram', (q) => iconCount({ kind: 'rows', rows: [(q.pictures[0] as Rows).rows[0]!] }) * Number(/(\d+) ბავშვს/.exec(q.prompt)![1]));
    check('g2-px-u10-dots-total', (q) => iconCount(q.pictures[0]!));
    check('g2-px-u12-coins-total', (q) => (q.pictures[0] as Extract<Picture, { kind: 'coins' }>).coins.reduce((a, b) => a + b, 0));
    check('g2-px-u12-five-coins', (q) => (q.pictures[0] as Extract<Picture, { kind: 'coins' }>).coins.reduce((a, b) => a + b, 0));
    check('g2-px-u12-price-tags', (q) => (q.pictures[0] as Extract<Picture, { kind: 'tags' }>).items.reduce((a, b) => a + b.amount, 0));
    check('g2-px-u11-rect-perimeter', (q) => {
      const r = q.pictures[0] as Extract<Picture, { kind: 'rect' }>;
      return 2 * (r.wv + r.hv);
    });
    check('g2-px-u11-read-temp', (q) => (q.pictures[0] as Extract<Picture, { kind: 'line' }>).marks[0]!.value);
    check('g2-px-u01-read-line', (q) => (q.pictures[0] as Extract<Picture, { kind: 'line' }>).marks[0]!.value);
    check('g1-px-u02-read-line', (q) => (q.pictures[0] as Extract<Picture, { kind: 'line' }>).marks[0]!.value);
    check('g1-px-u04-read-line', (q) => (q.pictures[0] as Extract<Picture, { kind: 'line' }>).marks[0]!.value);
  });

  it('a clock picture shows the time the key names', () => {
    for (const q of previewTemplate('g2-px-u13-read-clock', 25)) {
      const clock = q.pictures![0] as Extract<Picture, { kind: 'clock' }>;
      const hour = Math.floor(clock.minutes / 60) || 12;
      const minute = clock.minutes % 60;
      expect(q.answer).toBe(`${hour}:${String(minute).padStart(2, '0')}`);
    }
  });
});

describe('pictures lifted from the sentence', () => {
  const kinds = (prompt: string): string[] => liftPictures(prompt).map((p) => p.kind);

  it('draws a part–whole model for a missing addend or subtrahend', () => {
    expect(liftPictures('43 + ___ = 69')).toEqual([{ kind: 'model', whole: '69', parts: ['43', '?'] }]);
    expect(liftPictures('___ + 53 = 69')).toEqual([{ kind: 'model', whole: '69', parts: ['?', '53'] }]);
    expect(liftPictures('85 − ❓ = 31')).toEqual([{ kind: 'model', whole: '85', parts: ['31', '?'] }]);
  });

  it('draws the blocks of each operand, and never of the answer', () => {
    const pictures = liftPictures('გამოთვალე: 34 + 27');
    expect(pictures).toEqual([
      { kind: 'blocks', tens: 3, ones: 4, label: '34' },
      { kind: 'blocks', tens: 2, ones: 7, label: '+ 27' },
    ]);
    // Three numbers, or a number the pattern does not account for: left as words.
    expect(liftPictures('გამოთვალე: 42 + 35 − 16')).toEqual([]);
    expect(liftPictures('ლუკას აქვს 12 ვაშლი. მან 34 + 27 დათვალა და 5 მოიტანა')).toEqual([]);
  });

  it('draws the number line for rounding, with the number between its two neighbours', () => {
    expect(liftPictures('დაამრგვალე 74 უახლოეს 10-მდე.')).toEqual([{ kind: 'line', from: 70, to: 80, step: 1, marks: [{ value: 74, label: '74' }] }]);
    expect(liftPictures('დაამრგვალე 74 უახლოეს 5-მდე.')).toEqual([{ kind: 'line', from: 70, to: 75, step: 1, marks: [{ value: 74, label: '74' }] }]);
    // A multiple of the base has nothing to round.
    expect(liftPictures('დაამრგვალე 70 უახლოეს 10-მდე.')).toEqual([]);
  });

  it('draws a pattern with its gap and clocks for times', () => {
    expect(kinds('ანი აგრძელებს მიმდევრობას: 🔵 🟢 🔵 🟢 🔵 __. რა იქნება შემდეგი?')).toEqual(['rows']);
    expect(liftPictures('მიმდევრობა: 15, 18, 21, 24, __. რა იქნება შემდეგი?')).toEqual([
      { kind: 'chips', arrows: true, items: ['15', '18', '21', '24', '?'].map((text) => ({ text })) },
    ]);
    expect(liftPictures('ფილმი 5:00-ზე დაიწყო. რომელ საათზე დასრულდა?')).toEqual([{ kind: 'clock', minutes: 300 }]);
    expect(kinds('რამდენი წუთია "4:00"-სა და "4:20"-ს შორის?')).toEqual(['clock', 'clock']);
  });

  it('does not invent a picture for a plain word problem', () => {
    expect(liftPictures('რამდენი დღეა ნოემბერში?')).toEqual([]);
    expect(describedPictures('რომელი რიცხვია 11-ის უშუალოდ წინ?')).toEqual([]);
  });
});

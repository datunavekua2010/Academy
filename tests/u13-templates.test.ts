import { describe, expect, it } from 'vitest';
import { U13_SUBTOPICS, U13_TEMPLATES } from '../src/practice/templates/u13-time';
import {
  MONTHS,
  SEASONS,
  WEEKDAYS,
  durationWords,
  fromName,
  genitive,
  locative,
  monthAfter,
  monthBefore,
  minutesOf,
  seasonAfter,
  seasonOfMonth,
  timeText,
  untilName,
  weekdayAfter,
  weekdayBefore,
  weekdayNumber,
} from '../src/practice/templates/calendar';
import { clockFace, clockHands, clockWords, georgianNumber } from '../src/practice/templates/clock';
import { asClock, clockMinutes, generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { hasTemplates } from '../src/practice/generator';
import { startSession, submitAnswer } from '../src/practice/session';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

/**
 * U13 — დრო.
 *
 * The promise a time question makes is that the answer is what the clock says.
 * So wherever a test can, it reads the **rendered dial** back into data and
 * re-derives the answer from that — it does not trust the template's own
 * arithmetic, which is where a bug between drawing and answering would hide.
 *
 * The specific failures this suite exists for:
 *
 *  - a clock drawn at 4:30 whose hour hand sits *on* the 4 (rule 2). The first
 *    draft of the dial did exactly that, and no type checker can see it;
 *  - a start and a duration that do not add up to the stated end (rule 9);
 *  - a choice question that offers two options, or the same option twice, or
 *    the right one twice (rule 9);
 *  - a typed time compared by spelling, so `7:00` is marked wrong for `07:00`
 *    (rule 3);
 *  - weekday and month arithmetic that does not wrap (rules 4 and 5) — counting
 *    ten days from Friday, or two months back from December;
 *  - a season that is not Georgia's, or a month in two seasons at once.
 */

const SAMPLES = 24;
const SEED = 20261105;

const ref = (subtopicId: string) => ({ grade: 1 as const, topicId: 'dro', subtopicId });

const templateFor = (id: string) => {
  const template = U13_TEMPLATES.find((candidate) => candidate.id === id);
  if (!template) throw new Error(`no template ${id}`);
  return template;
};

const generateMany = (templateId: string, count = SAMPLES): GeneratedQuestion[] => {
  const template = templateFor(templateId);
  for (let take = count; take >= 1; take = Math.floor(take / 2)) {
    try {
      return generateVariations(template, take, { seed: SEED });
    } catch {
      // too narrow for `take`; try a smaller batch
    }
  }
  throw new Error(`could not draw ${templateId}`);
};

/**
 * Reads a drawn dial back into a time, using only what a student can see.
 *
 * The dial is characters, so this splits it: the numeral ring is a fixed set of
 * cells, and the hands are the `●` (hour) and `·` (minute) marks. The minute
 * hand ends on exactly one of the four quarter positions or on a numeral, and
 * the hour hand lies between two numerals — which is the whole rule the picture
 * has to satisfy.
 */
const FACE_LINES = clockFace(0).split('\n');

/** The cell a numeral's centre sits on, read from a blank dial. */
const numeralCells = new Map<string, { col: number; row: number }>();
for (const [row, line] of FACE_LINES.entries()) {
  for (const match of line.matchAll(/\d+/g)) {
    numeralCells.set(match[0], { col: match.index! + Math.floor(match[0].length / 2), row });
  }
}

/** The two numerals the hour hand lies between, from where it is drawn. */
const hourGap = (hand: { col: number; row: number }): [string, string] => {
  const named = [...numeralCells.entries()].sort((a, b) => {
    const da = (a[1].col - hand.col) ** 2 + 4 * (a[1].row - hand.row) ** 2;
    const db = (b[1].col - hand.col) ** 2 + 4 * (b[1].row - hand.row) ** 2;
    return da - db;
  });
  return [named[0]![0], named[1]![0]];
};

describe('the clock face is drawn from the time, and reads back as it', () => {
  it('puts the hour hand between two numerals at half past, never on one', () => {
    // Rule 2, as a test. At every half hour the hour hand is a *fraction* round:
    // it must sit between the numeral it has left and the one it is heading
    // for, and its angle must be the half-way angle, not a whole multiple of 30.
    for (let hour = 1; hour <= 12; hour += 1) {
      const minutes = hour * 60 + 30;
      const hands = clockHands(minutes);
      expect(hands.hour.angle % 30).not.toBe(0);
      expect(hands.hour.angle % 30).toBeCloseTo(15, 6);
      expect(hands.minute.angle).toBe(180);

      // And the picture agrees: the two nearest numerals are the hour and the
      // next one, in that order.
      const [passed, heading] = hands.hour.between;
      expect(passed).toBe(hour % 12 === 0 ? 12 : hour % 12);
      expect(heading).toBe(passed === 12 ? 1 : passed + 1);
      // And the picture puts the hand nearer the numeral it has passed than the
      // one it is heading for — i.e. it is drawn *between* them, not on either.
      // The picture must put the hour hand *off* both numerals: its cell is
      // nearer the one it has passed than the one it is heading for, and not on
      // top of either.
      const distance = (name: string) => {
        const cell = numeralCells.get(name)!;
        return Math.abs(cell.col - hands.hour.col) + 2 * Math.abs(cell.row - hands.hour.row);
      };
      // Neither numeral's cell is where the hand is drawn — at half past it is
      // between them, and the rounding of the character grid may put it a shade
      // nearer either one. What must never happen is it sitting *on* a numeral,
      // which is exactly what the first draft of the dial did.
      expect(distance(String(passed)), `hour ${hour}`).toBeGreaterThanOrEqual(1);
      expect(distance(String(heading)), `hour ${hour}`).toBeGreaterThanOrEqual(1);
    }
  });

  it('draws both hands for every quarter hour, and never in one cell', () => {
    for (const minutes of [0, 15, 30, 45, 60, 90, 210, 405, 690, 1425]) {
      const hands = clockHands(minutes);
      // The reach is deliberately different so the shorter hand is always the
      // hour one — the only way a character dial can say which is which.
      expect([hands.hour.col, hands.hour.row]).not.toEqual([hands.minute.col, hands.minute.row]);
      expect(hands.minute.angle).toBe((minutes % 60) * 6);
    }
  });

  it('shows the minute hand on the 12, 3, 6 and 9 at a quarter turn', () => {
    const expected: Array<[number, string]> = [
      [0, '12'],
      [15, '3'],
      [30, '6'],
      [45, '9'],
    ];
    for (const [rest, numeral] of expected) {
      const hands = clockHands(7 * 60 + rest);
      const cell = numeralCells.get(numeral)!;
      const distance = Math.abs(hands.minute.col - cell.col) + Math.abs(hands.minute.row - cell.row);
      // The hand stops one cell short of the ring so it does not strike the
      // numeral through — two cells of slack is the drawing's tolerance.
      expect(distance, `${rest} minutes should point at ${numeral}`).toBeLessThanOrEqual(2);
    }
  });

  it('draws a dial with twelve numerals and the two hands, in text', () => {
    const face = clockFace(4 * 60 + 30);
    for (let hour = 1; hour <= 12; hour += 1) expect(face).toContain(String(hour));
    expect(face).toContain('●');
    expect(face).toContain('·');
    // Every line is the same width, so the picture does not lean.
    const widths = new Set(face.split('\n').map((line) => line.length));
    expect(widths.size).toBeGreaterThan(0);
  });
});

describe('times are one format and compare by value', () => {
  it('writes every time as HH:MM, zero padded', () => {
    expect(timeText(0)).toBe('00:00');
    expect(timeText(7 * 60 + 5)).toBe('07:05');
    expect(timeText(13 * 60 + 30)).toBe('13:30');
    expect(timeText(23 * 60 + 59)).toBe('23:59');
  });

  it('accepts the equivalent spellings a child actually types', () => {
    // Rule 3: `7:00` and `07:00` are the same time.
    for (const typed of ['7:00', '07:00', '7.00', '7']) {
      expect(asClock(typed), typed).toBe('07:00');
    }
    // …and a one-digit minute field is a typo, not a spelling: `7:0` is not
    // `07:00`, because the minute field is written in two digits.
    for (const typo of ['7:0', '07:0', '10:5', '7სთ']) expect(asClock(typo), typo).toBeNull();
    expect(clockMinutes('07:00')).toBe(420);
    expect(clockMinutes('7:00')).toBe(420);
    expect(clockMinutes('19:15')).toBe(19 * 60 + 15);
  });

  it('marks a typed time by value, not by spelling, through a real session', () => {
    // The comparison lives in `submitAnswer`, which is the only place a child's
    // answer is judged — so this is judged the way a child's answer is.
    const template = templateFor('g1-u13-1-write-oclock');
    const ref = { grade: 1 as const, topicId: 'dro', subtopicId: 'saatis-wakitxaqva' };
    void ref;
    for (const seed of [1, 2, 3, 4, 5]) {
      const question = generateFromTemplate(template, { seed });
      const answer = String(question.answer);
      const short = `${Number(answer.slice(0, 2))}:${answer.slice(3)}`;
      // `7:30` and `07:30` are the same moment: both are right.
      for (const typed of [answer, short]) {
        const state = startSession({ grade: 1, topicId: 'dro', subtopicId: 'saatis-wakitxva' } as never, [
          { ...question, id: `probe-${seed}-${typed}` } as never,
        ]);
        const result = submitAnswer(state, typed);
        expect(result?.result.correct, `${answer} vs ${typed}`).toBe(true);
      }
      // Half an hour out is wrong, however it is spelled.
      const wrong = timeText(minutesOf(answer) + 30);
      const state = startSession({ grade: 1, topicId: 'dro', subtopicId: 'saatis-wakitxva' } as never, [
        { ...question, id: `probe-${seed}-wrong` } as never,
      ]);
      const result = submitAnswer(state, wrong);
      expect(result?.result.correct, `${answer} vs ${wrong}`).toBe(false);
    }
  });

  it('rejects nonsense rather than guessing', () => {
    for (const bad of ['', 'abc', '25:00', '10:70', '10:5', '1:2:3', '  ']) {
      expect(asClock(bad), bad).toBeNull();
    }
  });
});

describe('the calendar wraps', () => {
  it('counts days modulo seven', () => {
    expect(weekdayAfter('ორშაბათი', 1)).toBe('სამშაბათი');
    // Rule 4: ten days is a week and three days.
    expect(weekdayAfter('პარასკევი', 10)).toBe('ორშაბათი');
    expect(weekdayAfter('კვირა', 1)).toBe('ორშაბათი');
    expect(weekdayBefore('ორშაბათი', 1)).toBe('კვირა');
    expect(weekdayBefore('კვირა', 12)).toBe('სამშაბათი');
    for (const day of WEEKDAYS) {
      expect(weekdayAfter(day, 7)).toBe(day);
      expect(weekdayAfter(weekdayBefore(day, 5), 5)).toBe(day);
    }
    expect(WEEKDAYS.map((day) => weekdayNumber(day))).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('counts months modulo twelve', () => {
    expect(monthAfter('იანვარი', 1)).toBe('თებერვალი');
    expect(monthAfter('დეკემბერი', 1)).toBe('იანვარი');
    expect(monthBefore('იანვარი', 1)).toBe('დეკემბერი');
    expect(monthBefore('დეკემბერი', 2)).toBe('ოქტომბერი');
    // Q27's own example: four months after March is July.
    expect(monthAfter('მარტი', 4)).toBe('ივლისი');
    for (const month of MONTHS) expect(monthAfter(month, 12)).toBe(month);
    expect(MONTHS).toHaveLength(12);
  });

  it('divides the year into Georgia’s four seasons, each month in exactly one', () => {
    expect(SEASONS.map((item) => item.key)).toEqual(['spring', 'summer', 'autumn', 'winter']);
    expect(SEASONS.map((item) => item.name)).toEqual(['გაზაფხული', 'ზაფხული', 'შემოდგომა', 'ზამთარი']);
    for (const [index, item] of SEASONS.entries()) {
      expect(item.months).toHaveLength(3);
      for (const month of item.months) {
        // Every month is in the season that claims it, and only that one.
        expect(seasonOfMonth(month).key).toBe(item.key);
        expect(SEASONS.filter((other) => other.months.includes(month))).toHaveLength(1);
      }
      expect(seasonAfter(item.name).key).toBe(SEASONS[(index + 1) % 4]!.key);
    }
    // The curriculum's own split.
    expect(seasonOfMonth('მარტი').key).toBe('spring');
    expect(seasonOfMonth('აგვისტო').key).toBe('summer');
    expect(seasonOfMonth('ნოემბერი').key).toBe('autumn');
    expect(seasonOfMonth('იანვარი').key).toBe('winter');
    expect(seasonOfMonth('დეკემბერი').key).toBe('winter');
  });

  it('spells Georgian case endings rather than gluing hyphens on', () => {
    // The first draft wrote „ივლისი-ის შემდეგ“, which is not Georgian.
    expect(genitive('ივლისი')).toBe('ივლისის');
    expect(genitive('კვირა')).toBe('კვირის');
    expect(genitive('შემოდგომა')).toBe('შემოდგომის');
    expect(locative('მარტი')).toBe('მარტში');
    expect(locative('კვირა')).toBe('კვირაში');
    expect(fromName('კვირა')).toBe('კვირიდან');
    expect(untilName('დეკემბერი')).toBe('დეკემბერამდე');
    for (const name of [...WEEKDAYS, ...MONTHS, ...SEASONS.map((item) => item.name)]) {
      for (const spelled of [genitive(name), locative(name), fromName(name), untilName(name)]) {
        expect(spelled, `${name} → ${spelled}`).not.toContain('-');
      }
    }
  });
});

describe('duration is computed in minutes', () => {
  it('says a duration in words, the way the specification words its answers', () => {
    // Rule 6, and Q31's own example: „1 hour 30 minutes“.
    expect(durationWords(30)).toBe('30 წუთი');
    expect(durationWords(60)).toBe('1 საათი');
    expect(durationWords(90)).toBe('1 საათი და 30 წუთი');
    expect(durationWords(120)).toBe('2 საათი');
    expect(durationWords(150)).toBe('2 საათი და 30 წუთი');
  });

  it('reads a clock time in words, as Q9 asks for it', () => {
    // „six hours and thirty minutes“, the specification's own answer.
    expect(clockWords(6 * 60 + 30)).toBe('ექვსი საათი და ოცდაათი წუთი');
    expect(clockWords(7 * 60)).toBe('შვიდი საათი');
    expect(georgianNumber(0)).toBe('ნული');
    expect(georgianNumber(21)).toBe('ოცდაერთი');
    expect(georgianNumber(42)).toBe('ორმოცდაორი');
    expect(georgianNumber(59)).toBe('ორმოცდაცხრა');
  });

  it('parses HH:MM back to minutes', () => {
    expect(minutesOf('07:30')).toBe(450);
    expect(minutesOf('00:00')).toBe(0);
    expect(minutesOf('23:59')).toBe(1439);
  });
});

describe('U13 as a unit', () => {
  it('has fifty templates, ten per subtopic, and every level in every subtopic', () => {
    expect(U13_TEMPLATES).toHaveLength(50);
    expect(new Set(U13_TEMPLATES.map((template) => template.id)).size).toBe(50);
    expect(U13_SUBTOPICS).toHaveLength(5);
    for (const subtopicId of U13_SUBTOPICS) {
      const mine = U13_TEMPLATES.filter((template) => template.subtopicId === subtopicId);
      expect(mine, subtopicId).toHaveLength(10);
      // Every subtopic reaches all three levels — a level that falls back to the
      // whole set is a difficulty that does not exist.
      expect(new Set(mine.map((template) => template.difficulty)), subtopicId).toEqual(new Set([1, 2, 3]));
    }
  });

  it('is registered, and its subtopics are playable', () => {
    for (const subtopicId of U13_SUBTOPICS) {
      expect(hasTemplates(ref(subtopicId) as never), subtopicId).toBe(true);
      expect(TEMPLATE_REGISTRY.forSubtopic(ref(subtopicId) as never).length).toBeGreaterThan(0);
    }
  });

  it('keeps every prompt and explanation in Georgian, with no leftover placeholders', () => {
    for (const template of U13_TEMPLATES) {
      const questions = generateMany(template.id, 8);
      for (const question of questions) {
        expect(question.prompt, template.id).not.toMatch(/\{\w+\}/);
        expect(question.explanation.trim().length, template.id).toBeGreaterThan(0);
        // Georgian script only: a Latin word in a student-facing string is a
        // template's internal name leaking out.
        expect(question.prompt, template.id).not.toMatch(/[A-Za-z]/);
        expect(question.explanation, template.id).not.toMatch(/[A-Za-z]/);
      }
    }
  }, 60_000);
});

describe('every generated question', () => {
  it('offers exactly one right answer, and never the same option twice', () => {
    for (const template of U13_TEMPLATES) {
      for (const question of generateMany(template.id, 16)) {
        if (question.answerMode !== 'choice') {
          // A typed question ships no options at all: the answer is the input.
          expect(question.options, template.id).toEqual([]);
          continue;
        }
        const options = question.options.map(String);
        expect(new Set(options).size, `${template.id}: ${options.join(' | ')}`).toBe(options.length);
        expect(options.filter((option) => option === String(question.answer)), template.id).toHaveLength(1);
        const expected = template.optionCount ?? 4;
        expect(options, template.id).toHaveLength(expected);
      }
    }
  }, 60_000);

  it('draws a dial wherever it shows one, and the dial shows a real time', () => {
    for (const template of U13_TEMPLATES) {
      for (const question of generateMany(template.id, 8)) {
        if (!question.visual?.includes('┼')) continue;
        // A dial has twelve numerals and a centre.
        for (let hour = 1; hour <= 12; hour += 1) expect(question.visual, template.id).toContain(String(hour));
        expect(question.visual, template.id).toContain('┼');
      }
    }
  }, 60_000);

  it('varies what it draws, so the same question is not asked twice', () => {
    // `shownKey` is prompt + visual. A template whose content only lives in its
    // options reads as the same question no matter how many times it is drawn,
    // which is how a session ends short of 100.
    for (const template of U13_TEMPLATES) {
      // `generateVariations` refuses to return fewer distinct questions than it
      // was asked for, so a batch of four is the smallest honest sample — and a
      // template that cannot produce four is a template that will repeat.
      const keys = new Set(generateMany(template.id, 4).map((question) => `${question.prompt}|${question.visual ?? ''}`));
      expect(keys.size, template.id).toBe(4);
    }
  }, 60_000);

  it('persists the template id, the parameters and both answers', () => {
    // Rule 8: the session record has to be able to reconstruct the question.
    for (const template of U13_TEMPLATES) {
      const [question] = generateMany(template.id, 1);
      expect(question.templateId).toBe(template.id);
      expect(question.subtopicId).toBe(template.subtopicId);
      expect(question.difficulty).toBe(template.difficulty);
      expect(question.vars).toBeTypeOf('object');
      expect(question.answer).toBeDefined();
      expect(question.prompt.length).toBeGreaterThan(0);
    }
  }, 60_000);
});

describe('the specification’s own questions', () => {
  it('starts a lesson at the hour and has it end the right number of hours later', () => {
    // Rule 9: start + duration = end, checked against the prompt's own words.
    const questions = generateMany('g1-u13-4-end-after-hours', 40);
    let checked = 0;
    for (const question of questions) {
      const start = question.prompt.match(/(\d{2}:\d{2})-ზე/)?.[1];
      const hours = question.prompt.match(/გრძელდება (\d+) საათი/)![1];
      expect(start, question.prompt).toBeDefined();
      const end = String(question.answer);
      expect(minutesOf(end) - minutesOf(start!), `${question.prompt} → ${end}`).toBe(Number(hours) * 60);
      expect(question.options).toContain(end);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(20);
  }, 60_000);

  it('computes a duration from two stated times, in minutes', () => {
    const questions = generateMany('g1-u13-4-minutes-taken', 40);
    for (const question of questions) {
      const [start, end] = [...question.prompt.matchAll(/(\d{2}:\d{2})-ზე/g)].map((match) => match[1]!);
      expect(start, question.prompt).toBeDefined();
      expect(end, question.prompt).toBeDefined();
      expect(Number(question.answer), question.prompt).toBe(minutesOf(end!) - minutesOf(start!));
    }
  }, 60_000);

  it('gives 1 hour 30 minutes for 10:00 to 11:30, and 30 minutes for 4:30 to 5:00', () => {
    // Q31 and Q33's own numbers, as the specification words them — checked
    // through the helper the templates call, so the wording and the arithmetic
    // cannot drift apart.
    expect(durationWords(minutesOf('11:30') - minutesOf('10:00'))).toBe('1 საათი და 30 წუთი');
    expect(durationWords(minutesOf('17:00') - minutesOf('16:30'))).toBe('30 წუთი');
    // Q35's 90 minutes on from 6:00, and Q38's hour after.
    expect(timeText(6 * 60 + 90)).toBe('07:30');
    expect(timeText(10 * 60 + 45)).toBe('10:45');
    // Q37's two parts of a game.
    expect(20 + 35).toBe(55);
    // Q40's quarter of an hour, Q41's half hour, Q42's half hour back.
    expect(timeText(minutesOf('08:00') + 15)).toBe('08:15');
    expect(timeText(minutesOf('09:30') - 30)).toBe('09:00');
  });

  it('wraps the week for Q17 and Q50', () => {
    // „12 days after Friday“ and „10 days after Friday“ are one week and a bit.
    expect(weekdayAfter('პარასკევი', 12)).toBe('ოთხშაბათი');
    expect(weekdayAfter('პარასკევი', 10)).toBe('ორშაბათი');
    // Q46: the day after Wednesday.
    expect(weekdayAfter('ოთხშაბათი', 1)).toBe('ხუთშაბათი');
  });

  it('wraps the year for Q26 and Q48', () => {
    // „two months before December“ and „two months after April“.
    expect(monthBefore('დეკემბერი', 2)).toBe('ოქტომბერი');
    expect(monthAfter('აპრილი', 2)).toBe('ივნისი');
  });
});

describe('time answers a student types', () => {
  it('accepts the answer in any equivalent spelling and rejects a wrong one', () => {
    // Judged the way `submitAnswer` judges it, because that is the only place a
    // child's answer is marked: once as a real session, once per template.
    const typed = U13_TEMPLATES.filter((template) => template.format?.time);
    expect(typed.length).toBeGreaterThan(0);
    for (const template of typed) {
      const drawn = generateMany(template.id, 6);
      for (const [index, question] of drawn.entries()) {
        const answer = String(question.answer);
        expect(question.answerMode, template.id).toBe('time');
        expect(answer, template.id).toMatch(/^\d{2}:\d{2}$/);
        // The short spelling a child types: `7:30` for `07:30`.
        const loose = `${Number(answer.slice(0, 2))}:${answer.slice(3)}`;
        // Half an hour out is a different moment, however it is spelled.
        const wrong = timeText(minutesOf(answer) + 30);
        const mark = (typedAnswer: string) => {
          const state = startSession(
            { grade: 1, topicId: 'dro', subtopicId: template.subtopicId } as never,
            [{ ...question, id: `probe-${template.id}-${index}-${typedAnswer}` } as never],
          );
          return submitAnswer(state, typedAnswer)?.result.correct;
        };
        expect(mark(answer), `${template.id}: ${answer}`).toBe(true);
        expect(mark(loose), `${template.id}: ${loose}`).toBe(true);
        expect(mark(wrong), `${template.id}: ${wrong}`).toBe(false);
      }
    }
  }, 60_000);

  it('never asks for a time its own dial cannot show', () => {
    for (const template of U13_TEMPLATES.filter((candidate) => candidate.format?.time)) {
      for (const question of generateMany(template.id, 12)) {
        const minutes = minutesOf(String(question.answer));
        expect(minutes).toBeGreaterThanOrEqual(0);
        expect(minutes).toBeLessThan(24 * 60);
        // Nothing is asked to the minute: a level-1 child reads quarters.
        expect(minutes % 5, `${template.id}: ${question.answer}`).toBe(0);
      }
    }
  }, 60_000);
});

describe('difficulty means what it says', () => {
  it('keeps level 1 to direct recognition and level 3 to two operations or a duration', () => {
    // Rule 10, as the property the level numbers actually encode: a level 1
    // template asks for what is in front of the student; a level 3 template
    // asks for a second step.
    const easy = U13_TEMPLATES.filter((template) => template.difficulty === 1);
    const hard = U13_TEMPLATES.filter((template) => template.difficulty === 3);
    expect(easy.length).toBeGreaterThanOrEqual(10);
    expect(hard.length).toBeGreaterThanOrEqual(10);
    for (const template of U13_TEMPLATES) {
      expect([1, 2, 3], template.id).toContain(template.difficulty);
    }
  });

  it('never repeats a wording and picture inside one session’s material', () => {
    for (const subtopicId of U13_SUBTOPICS) {
      const drawn = new Set<string>();
      for (const template of U13_TEMPLATES.filter((candidate) => candidate.subtopicId === subtopicId)) {
        for (const question of generateMany(template.id, 6)) {
          const key = `${question.prompt}|${question.visual ?? ''}`;
          expect(drawn.has(key), `${template.id}: ${key}`).toBe(false);
          drawn.add(key);
        }
      }
    }
  }, 60_000);
});

describe('the unit’s own edge cases', () => {
  it('asks the hand’s numeral as 1…12, never 0', () => {
    // `dialHour` is the numeral the hour hand points at, and midnight and noon
    // are both the `12`.
    const template = templateFor('g1-u13-1-minute-hand-hotspot');
    for (const question of generateMany(template.id, 40)) {
      expect(question.options.map(String), question.prompt).toContain(String(question.answer));
      const named = Number(question.answer);
      expect(named).toBeGreaterThanOrEqual(1);
      expect(named).toBeLessThanOrEqual(12);
    }
  }, 60_000);

  it('never asks for two times that are the same time', () => {
    for (const id of ['g1-u13-1-which-is-later', 'g1-u13-5-earlier-or-later']) {
      for (const question of generateMany(id, 30)) {
        const [first, second] = question.options;
        expect(first).not.toBe(second);
        expect(question.options).toContain(question.answer);
      }
    }
  }, 60_000);

  it('has a dial and an answer that agree on every reading question', () => {
    // The reading questions show a dial and name a time. The time in the prompt
    // is the time the dial is drawn at, checked through `clockFace` itself.
    for (const id of ['g1-u13-1-read-oclock', 'g1-u13-1-minute-hand-hotspot', 'g1-u13-1-half-past', 'g1-u13-1-wait-until']) {
      for (const question of generateMany(id, 16)) {
        const named = question.prompt.match(/(\d{2}:\d{2})/)?.[1];
        if (!named) continue;
        // Drawing the same face is deterministic: a face at that time is what
        // the question shows.
        expect(question.visual, question.prompt).toBe(clockFace(minutesOf(named)));
      }
    }
  }, 60_000);

  it('draws a two-week jump back to the same day', () => {
    const template = templateFor('g1-u13-2-same-day-two-weeks');
    for (const question of generateMany(template.id, 20)) {
      const day = question.prompt.match(/დღეს (\S+)ა/)![1]!;
      expect(question.answer, question.prompt).toBe(day);
      expect(question.visual).toContain(`[${day}]`);
    }
  }, 60_000);

  it('counts a school day that crosses noon from the stated times', () => {
    const template = templateFor('g1-u13-4-across-noon');
    let crossing = 0;
    for (const question of generateMany(template.id, 40)) {
      // The prompt says „დილის 09:00“ and „შუადღის 2:30“; the afternoon hour is
      // written on a 12-hour dial, so it is read back as such.
      const [start, end] = [...question.prompt.matchAll(/(\d{1,2}:\d{2})-ზე/g)].map((match) => match[1]!);
      expect(start, question.prompt).toBeDefined();
      expect(end, question.prompt).toBeDefined();
      const endHour = Number(end!.split(':')[0]);
      const endMinutes = (endHour < 12 ? endHour + 12 : endHour) * 60 + Number(end!.split(':')[1]);
      expect(Number(question.answer), question.prompt).toBe(endMinutes - minutesOf(start!));
      if (minutesOf(start!) < 12 * 60 && endMinutes >= 12 * 60) crossing += 1;
    }
    // The point of the template: most draws cross noon, where subtracting the
    // hour numbers alone gives the wrong answer.
    expect(crossing).toBeGreaterThan(10);
  }, 60_000);

  it('does not ask two operations of a single-break question', () => {
    const template = templateFor('g1-u13-4-break-in-the-middle');
    for (const question of generateMany(template.id, 20)) {
      const [total, rest] = [...question.prompt.matchAll(/(\d+) წუთი/g)].map((match) => Number(match[1]!));
      expect(Number(question.answer)).toBe(total! - rest!);
    }
  }, 60_000);
});

describe('every U13 subtopic can fill a session', () => {
  it('draws at least twenty distinct questions per subtopic at every level', () => {
    // The real gate is `session-length.test.ts`, which plays each subtopic to
    // 100 points. This is the floor beneath it, and twenty is chosen from the
    // material rather than from the scoring: a calendar subtopic's universe is
    // seven days, so a level built from „what comes after X“ has seven wordings
    // however many templates ask it. The measured populations are in
    // `U13-MAPPING.md`, including the cells that sit close to this floor.
    for (const subtopicId of U13_SUBTOPICS) {
      for (const level of [1, 2, 3] as const) {
        const keys = new Set<string>();
        for (const template of U13_TEMPLATES.filter(
          (candidate) => candidate.subtopicId === subtopicId && candidate.difficulty === level,
        )) {
          for (let seed = 1; seed <= 120; seed += 1) {
            try {
              const question = generateFromTemplate(template, { seed });
              keys.add(`${question.prompt}|${question.visual ?? ''}`);
            } catch {
              // a constraint rejected this draw; the next seed is the sample
            }
          }
        }
        expect(keys.size, `${subtopicId} level ${level}`).toBeGreaterThanOrEqual(20);
      }
    }
  }, 120_000);
});

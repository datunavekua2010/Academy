import { describe, expect, it } from 'vitest';
import { accuracy, buildProgressReport, reportBounds, reportMessage, type ReportRow } from '../src/teacher/progressReport';
import { getGrade } from '../src/practice/curriculum';

const topic = getGrade(1).topics[0];
const sub = topic.units[0].subtopics[0];
const answer = (questionId: string, correct: unknown, at: unknown, choice: unknown = '1') => ({ questionId, correct, at, choice });
const row: ReportRow = { student_id: 'child', attempt_id: 'session', grade: 1, topic_id: topic.id, subunit_id: sub.id, result: { answers: [
  answer('before', true, '2026-01-01T19:59:59.999Z'),
  answer('first', true, '2026-01-01T20:00:00.000Z'),
  answer('last', false, '2026-01-03T19:59:59.999Z'),
  answer('after', true, '2026-01-03T20:00:00.000Z'),
  answer('unknown', null, '2026-01-02T10:00:00.000Z'),
  answer('missing', true, null),
  answer('unsubmitted', true, '2026-01-02T10:00:00.000Z', null),
  answer('first', true, '2026-01-01T20:00:00.000Z'),
] } };

describe('recorded progress reports', () => {
  it('includes both Tbilisi dates exactly and validates calendar boundaries', () => {
    expect(reportBounds('2026-01-02', '2026-01-03')).toEqual({ startMs: Date.parse('2026-01-01T20:00:00Z'), endMs: Date.parse('2026-01-03T20:00:00Z') });
    expect(() => reportBounds('2026-02-30', '2026-03-01')).toThrow();
    expect(() => reportBounds('2026-02-02', '2026-02-01')).toThrow();
    expect(() => reportBounds('2014-01-01', '2014-01-01')).toThrow();
    expect(() => reportBounds('', '')).toThrow();
  });
  it('counts only distinct, known, submitted outcomes within dates for the selected child', () => {
    const report = buildProgressReport([row, row, { ...row, student_id: 'other', attempt_id: 'other' }], 'child', 'ნინო', '2026-01-02', '2026-01-03');
    expect(report).toMatchObject({ correct: 1, incorrect: 1, excluded: 3 });
    expect(report.topics).toEqual([{ name: `1 კლასი · ${topic.title}`, correct: 1, incorrect: 1, metadataMissing: false }]);
    expect(accuracy(report.correct, report.incorrect)).toBe('50.0%');
    const message = reportMessage(report);
    expect(message).toContain('ნინო');
    expect(message).toContain('სწორი: 1; არასწორი: 1');
    expect(message).toContain('არ არის დადასტურებული');
    expect(message).not.toMatch(/ათვისებ|მოტივაცი|კონცენტრაცი/);
  });
  it('does not count conflicting duplicates and handles missing topic data', () => {
    const conflict = { ...row, topic_id: 'missing', result: { answers: [answer('a', true, '2026-01-02T10:00:00Z'), answer('a', false, '2026-01-02T10:00:00Z'), answer('b', true, '2026-01-02T10:00:00Z')] } };
    const report = buildProgressReport([conflict], 'child', '', '2026-01-02', '2026-01-02');
    expect(report.correct).toBe(1);
    expect(report.excluded).toBe(1);
    expect(report.topics[0]).toMatchObject({ name: 'თემა მიუწვდომელია', metadataMissing: true });
    expect(reportMessage(report)).toContain('მოსწავლე: მოსწავლე');
  });
  it('groups actual curriculum topics and uses sufficiently supported observations only', () => {
    const other = getGrade(1).topics.find((item) => item.id !== topic.id && item.units[0]?.subtopics[0])!;
    const make = (prefix: string, good: number) => Array.from({ length: 10 }, (_, i) => answer(`${prefix}${i}`, i < good, '2026-01-02T10:00:00Z'));
    const report = buildProgressReport([
      { ...row, result: { answers: make('a', 9) } },
      { ...row, attempt_id: 'second', topic_id: other.id, subunit_id: other.units[0].subtopics[0].id, result: { answers: make('b', 4) } },
    ], 'child', 'ნინო', '2026-01-02', '2026-01-02');
    expect(report.topics).toHaveLength(2);
    expect(report).toMatchObject({ correct: 13, incorrect: 7 });
    expect(reportMessage(report)).toContain('მაღალი სიზუსტე დაფიქსირდა');
    expect(reportMessage(report)).toContain('დამატებითი ვარჯიშისთვის');
    expect(reportMessage(report)).not.toMatch(/ათვისებ|ოსტატობ|წინა პერიოდ/);
  });
  it('does not invent performance for empty periods or interpret score as accuracy', () => {
    const report = buildProgressReport([row], 'child', 'ნინო', '2026-02-01', '2026-02-01');
    expect(report.correct + report.incorrect).toBe(0);
    expect(accuracy(0, 0)).toBe('მონაცემები არასაკმარისია');
    expect(reportMessage(report)).toContain('დასათვლელი შენახული პასუხები არ მოიძებნა');
    expect(reportMessage(report)).not.toContain('0%');
  });
});

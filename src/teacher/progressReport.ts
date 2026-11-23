import { getGrade } from '../practice/curriculum';
import { topicSubtopics, type GradeId } from '../practice/types';

/** Report dates and answer timestamps are interpreted in academy local time. */
export const REPORT_TIME_ZONE = 'Asia/Tbilisi';
export type ReportRow = { attempt_id: string; student_id: string; grade: number; topic_id: string; subunit_id: string; result: unknown };
export type ReportTopic = { name: string; correct: number; incorrect: number; metadataMissing: boolean };
export type ProgressReport = { name: string; start: string; end: string; correct: number; incorrect: number; topics: ReportTopic[]; excluded: number; test: boolean };

function parseDay(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new Error('Invalid date');
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  // Modern Tbilisi civil dates only; avoids historical offset discontinuities and date overflow.
  if (year < 2015 || year > 9998) throw new Error('Invalid date');
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('Invalid date');
  return date;
}

/** Georgia has used UTC+04:00 since 2014. End is exclusive midnight after the selected day. */
export function reportBounds(start: string, end: string): { startMs: number; endMs: number } {
  const a = parseDay(start).getTime(), b = parseDay(end).getTime();
  if (a > b) throw new Error('Invalid date range');
  return { startMs: a - 4 * 60 * 60 * 1000, endMs: b + 20 * 60 * 60 * 1000 };
}
export function accuracy(correct: number, incorrect: number): string {
  return correct + incorrect ? `${(100 * correct / (correct + incorrect)).toFixed(1)}%` : 'მონაცემები არასაკმარისია';
}
function topicName(row: ReportRow): { name: string; missing: boolean } {
  if (!Number.isInteger(row.grade) || row.grade < 1 || row.grade > 7) return { name: 'თემა მიუწვდომელია', missing: true };
  const topic = getGrade(row.grade as GradeId).topics.find((t) => t.id === row.topic_id);
  if (!topic || !topicSubtopics(topic).some((sub) => sub.id === row.subunit_id)) return { name: 'თემა მიუწვდომელია', missing: true };
  return { name: `${row.grade} კლასი · ${topic.title}`, missing: false };
}

/** Counts saved answer outcomes, not scores. No result here is server-verified. */
export function buildProgressReport(rows: ReportRow[], studentId: string, name: string, start: string, end: string, test = false): ProgressReport {
  const { startMs, endMs } = reportBounds(start, end);
  const topics = new Map<string, ReportTopic>();
  const seenAttempts = new Set<string>();
  let correct = 0, incorrect = 0, excluded = 0;
  for (const row of rows) {
    if (row.student_id !== studentId || typeof row.attempt_id !== 'string' || !row.attempt_id) continue;
    if (seenAttempts.has(row.attempt_id)) continue;
    seenAttempts.add(row.attempt_id);
    const result = row.result as { answers?: unknown } | null;
    if (!result || !Array.isArray(result.answers)) { excluded++; continue; }
    // One question can be submitted once per session; reject ambiguous duplicates.
    const answers = new Map<string, unknown[]>();
    for (const value of result.answers) {
      if (!value || typeof value !== 'object' || typeof (value as { questionId?: unknown }).questionId !== 'string' || !(value as { questionId: string }).questionId) { excluded++; continue; }
      const id = (value as { questionId: string }).questionId;
      answers.set(id, [...(answers.get(id) ?? []), value]);
    }
    for (const entries of answers.values()) {
      const first = entries[0] as { correct?: unknown; at?: unknown; choice?: unknown };
      if (entries.some((item) => { const a = item as typeof first; return a.correct !== first.correct || a.at !== first.at || a.choice !== first.choice; })) { excluded++; continue; }
      if (typeof first.correct !== 'boolean' || typeof first.choice !== 'string' || typeof first.at !== 'string' || !/^\d{4}-\d\d-\d\dT.*(?:Z|[+-]\d\d:\d\d)$/.test(first.at)) { excluded++; continue; }
      const time = Date.parse(first.at);
      if (!Number.isFinite(time)) { excluded++; continue; }
      if (time < startMs || time >= endMs) continue;
      const metadata = topicName(row);
      const key = metadata.missing ? 'missing' : `${row.grade}/${row.topic_id}`;
      const topic = topics.get(key) ?? { name: metadata.name, correct: 0, incorrect: 0, metadataMissing: metadata.missing };
      if (first.correct) { correct++; topic.correct++; } else { incorrect++; topic.incorrect++; }
      topics.set(key, topic);
    }
  }
  return { name: name.trim() || 'მოსწავლე', start, end, correct, incorrect, topics: [...topics.values()], excluded, test };
}

export function reportMessage(report: ProgressReport): string {
  const { correct, incorrect, topics } = report;
  const total = correct + incorrect;
  const lines = [report.test ? 'Axiom Academy — ადგილობრივი პროგრესის ანგარიში' : 'Axiom Academy — პროგრესის ანგარიში', `მოსწავლე: ${report.name}`, `პერიოდი: ${report.start} — ${report.end} (თბილისის დრო)`];
  if (!total) lines.push('არჩეულ პერიოდში დასათვლელი შენახული პასუხები არ მოიძებნა.');
  else {
    lines.push(`შენახული პასუხები: ${total}; სწორი: ${correct}; არასწორი: ${incorrect}. სიზუსტე: ${accuracy(correct, incorrect)}.`);
    for (const topic of topics) lines.push(`${topic.name}: ${topic.correct + topic.incorrect} პასუხი, სწორი ${topic.correct}, არასწორი ${topic.incorrect}, სიზუსტე ${accuracy(topic.correct, topic.incorrect)}.`);
    const stronger = topics.filter((t) => !t.metadataMissing && t.correct + t.incorrect >= 10 && t.correct / (t.correct + t.incorrect) >= .8);
    const practice = topics.filter((t) => !t.metadataMissing && t.correct + t.incorrect >= 10 && t.correct / (t.correct + t.incorrect) < .6);
    if (stronger.length) lines.push(`არჩეულ პერიოდში მაღალი სიზუსტე დაფიქსირდა: ${stronger.map((t) => t.name).join(', ')}.`);
    if (practice.length) lines.push(`დამატებითი ვარჯიშისთვის შეიძლება განვიხილოთ: ${practice.map((t) => t.name).join(', ')}.`);
  }
  if (report.excluded) lines.push('ზოგი ჩანაწერი არასრული ან ურთიერთსაწინააღმდეგოა და დათვლაში არ შედის.');
  lines.push(report.test ? 'მონაცემები მხოლოდ ამ ბრაუზერშია (მაქსიმუმ 400 შენახული სესია); შედეგები და დრო სერვერის მიერ არ დასტურდება.' : 'შენახული პასუხები და მათი დრო მოწყობილობაზეა ჩაწერილი და სერვერის მიერ არ არის დადასტურებული; შეუნახავი სესიები არ ჩანს.');
  return lines.join('\n');
}

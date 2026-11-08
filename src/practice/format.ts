import type { Assignment } from './store';
import type { GradeId } from './types';

const MONTHS = [
  'იანვარი',
  'თებერვალი',
  'მარტი',
  'აპრილი',
  'მაისი',
  'ივნისი',
  'ივლისი',
  'აგვისტო',
  'სექტემბერი',
  'ოქტომბერი',
  'ნოემბერი',
  'დეკემბერი',
];

export function formatScore(value: number): string {
  return `${Math.round(value)}`;
}

export function signed(value: number): string {
  return value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : '0';
}

export function romanGrade(grade: GradeId): string {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][grade - 1] ?? '';
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${hh}:${mm}`;
}

export function dueLabel(assignment: Assignment, now = new Date()): string {
  const due = new Date(assignment.dueAt);
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const days = Math.round((startOfDay(due) - startOfDay(now)) / dayMs);

  if (days < 0) return `ვადაგადაცილებული — ${formatDate(assignment.dueAt)}`;
  if (days === 0) return 'დღეს';
  if (days === 1) return 'ხვალ';
  if (days === 2) return 'ზეგ';
  return `${days} დღეში`;
}

export function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} წმ`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes} წთ` : `${minutes} წთ ${rest} წმ`;
}

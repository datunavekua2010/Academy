// @vitest-environment jsdom
import { afterEach, expect, it } from 'vitest';
import { LEARN_STORAGE_KEY, markCompleted, resetProgressCache, setLessonProgressOwner } from '../src/lessons/progress';

afterEach(() => { setLessonProgressOwner(null); localStorage.clear(); resetProgressCache(); });
it('keeps demo lesson progress separate from each account on this browser', () => {
  markCompleted('demo-lesson', 2, 3);
  setLessonProgressOwner('student-one');
  markCompleted('student-one-lesson', 3, 3);
  setLessonProgressOwner('student-two');
  markCompleted('student-two-lesson', 2, 3);
  expect(localStorage.getItem(LEARN_STORAGE_KEY)).toContain('demo-lesson');
  expect(localStorage.getItem(`${LEARN_STORAGE_KEY}:student-one`)).toContain('student-one-lesson');
  expect(localStorage.getItem(`${LEARN_STORAGE_KEY}:student-one`)).not.toContain('student-two-lesson');
  expect(localStorage.getItem(`${LEARN_STORAGE_KEY}:student-two`)).not.toContain('demo-lesson');
});

import { expect, it } from 'vitest';
import { getSubtopic } from '../src/practice/curriculum';
import { shownKey } from '../src/practice/identity';
import { generateQuestion } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { drawTemplate } from '../src/teacher/testMakerData';

// Count generated visible variations, not templates or independently authored exercises.
// Restrict the sample to templates actually selectable in the teacher's paper editor.
it('can generate more than 35,000 distinct printable question variants', () => {
  const unique = new Set<string>();
  for (const template of TEMPLATE_REGISTRY.all) {
    if (!getSubtopic(template.grade, template.topicId, template.subtopicId)) continue;
    // The section editor exposes only templates with a printable example in these seeds.
    const selectable = [1, 2, 3, 4, 5].some(seed => {
      try { drawTemplate(template.id, seed); return true; } catch { return false; }
    });
    if (!selectable) continue;
    for (let seed = 1; seed <= 16; seed++) {
      try { unique.add(shownKey(drawTemplate(template.id, seed))); } catch { /* not every variant is printable */ }
    }
    if (unique.size > 35000) break;
  }
  expect(unique.size).toBeGreaterThan(35000);
}, 30000);

it('has over 500 curriculum-linked interactive templates that generate widgets', () => {
  let count = 0;
  for (const template of TEMPLATE_REGISTRY.all) {
    if (!template.interaction || !getSubtopic(template.grade, template.topicId, template.subtopicId)) continue;
    const question = generateQuestion({grade:template.grade, topicId:template.topicId, subtopicId:template.subtopicId}, 1, {templateId:template.id});
    if (question?.interaction) count++;
  }
  expect(count).toBeGreaterThan(500);
});

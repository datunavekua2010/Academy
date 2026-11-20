// Generate reviewable seed SQL from the existing practice curriculum and template registry.
// This script never connects to a database. Run via the command in docs/supabase.md.
import { CURRICULUM } from '../src/practice/curriculum';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';

const quote = (value: string) => `'${value.replace(/'/g, "''")}'`;
const lines = ['-- Generated from the existing practice curriculum. Review before running.', 'begin;'];
const topicKeys = new Set<string>();
const unitKeys = new Set<string>();
const subunitKeys = new Set<string>();
for (const grade of CURRICULUM) {
  grade.topics.forEach((topic, topicPosition) => {
    const topicKey = `${grade.grade}/${topic.id}`;
    if (topicKeys.has(topicKey)) throw new Error(`Duplicate topic ${topicKey}`);
    topicKeys.add(topicKey);
    lines.push(`insert into public.curriculum_topics (grade, topic_id, title, position) values (${grade.grade}, ${quote(topic.id)}, ${quote(topic.title)}, ${topicPosition});`);
    topic.units.forEach((unit, unitPosition) => {
      const unitKey = `${topicKey}/${unit.id}`;
      if (unitKeys.has(unitKey)) throw new Error(`Duplicate unit ${unitKey}`);
      unitKeys.add(unitKey);
      lines.push(`insert into public.curriculum_units (grade, topic_id, unit_id, title, position) values (${grade.grade}, ${quote(topic.id)}, ${quote(unit.id)}, ${quote(unit.title)}, ${unitPosition});`);
      unit.subtopics.forEach((subunit, subunitPosition) => {
        const key = `${topicKey}/${subunit.id}`;
        if (subunitKeys.has(key)) throw new Error(`Duplicate subunit ${key}`);
        subunitKeys.add(key);
        lines.push(`insert into public.curriculum_subunits (grade, topic_id, unit_id, subunit_id, title, position) values (${grade.grade}, ${quote(topic.id)}, ${quote(unit.id)}, ${quote(subunit.id)}, ${quote(subunit.title)}, ${subunitPosition});`);
      });
    });
  });
}
for (const template of TEMPLATE_REGISTRY.all) {
  if (!subunitKeys.has(`${template.grade}/${template.topicId}/${template.subtopicId}`)) throw new Error(`Unknown curriculum for ${template.id}`);
  lines.push(`insert into public.exercise_templates (template_id, grade, topic_id, subunit_id) values (${quote(template.id)}, ${template.grade}, ${quote(template.topicId)}, ${quote(template.subtopicId)});`);
}
lines.push('commit;', '');
process.stdout.write(lines.join('\n'));

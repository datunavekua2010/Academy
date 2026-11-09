import { describe, expect, it, vi } from 'vitest';
import { createTemplateRegistry } from '../src/practice/templates/registry';
import { defineTemplate } from '../src/practice/templates/types';
import { getTopic } from '../src/practice/curriculum';

/**
 * Templates are supplied by the academy over time. A malformed one must fail
 * when the registry is built — with a message naming the template — never reach
 * a student as a broken question.
 */

const good = () =>
  defineTemplate({
    id: 'ok',
    grade: 1,
    topicId: 'Sekreba',
    unitId: 'Sekreba',
    subtopicId: 'SuratiT-10',
    prompt: '{a} + {b} = ?',
    variables: {
      a: { kind: 'int', min: 1, max: 9 },
      b: { kind: 'int', min: 1, max: 9 },
    },
    answer: (v) => Number(v.a) + Number(v.b),
    explanation: ({ answer }) => `პასუხი ${answer}.`,
  });

const build = (templates: Parameters<typeof createTemplateRegistry>[0]) =>
  createTemplateRegistry(templates, { resolveTopic: getTopic });

describe('template validation', () => {
  it('accepts a well-formed template', () => {
    expect(() => build([good()])).not.toThrow();
  });

  it('rejects a prompt placeholder that has no variable', () => {
    const template = { ...good(), id: 'bad-placeholder', prompt: '{a} + {c} = ?' };
    expect(() => build([template])).toThrow(/\{c\} but no such variable/);
  });

  it('rejects a subtopic that does not exist', () => {
    const template = { ...good(), id: 'bad-subtopic', subtopicId: 'does-not-exist' };
    expect(() => build([template])).toThrow(/"does-not-exist"/);
  });

  it('rejects a topic that does not exist for the grade', () => {
    const template = { ...good(), id: 'bad-topic', topicId: 'nope' };
    expect(() => build([template])).toThrow(/has no topic "nope"/);
  });

  it('rejects a unitId that does not own the subtopic', () => {
    // Each grade-1 unit is its own topic; declaring a different unit is a
    // copy-paste error the validator must catch.
    const template = { ...good(), id: 'bad-unit', unitId: 'Gamokleba' };
    expect(() => build([template])).toThrow(/belongs to unit "Sekreba"/);
  });

  it('rejects duplicate ids', () => {
    expect(() => build([good(), good()])).toThrow(/Duplicate template id/);
  });

  it('rejects a template with no variables', () => {
    const template = { ...good(), id: 'no-vars', variables: {}, prompt: 'მუდმივი კითხვა' };
    expect(() => build([template])).toThrow(/at least one variable/);
  });

  it('rejects a choice variable with fewer than two options', () => {
    const template = {
      ...good(),
      id: 'thin-choice',
      variables: { a: { kind: 'choice' as const, values: [1] } },
      prompt: '{a}',
    };
    expect(() => build([template])).toThrow(/at least two values/);
  });

  it('rejects an inverted range', () => {
    const template = {
      ...good(),
      id: 'inverted',
      variables: { a: { kind: 'int' as const, min: 9, max: 2 } },
      prompt: '{a}',
    };
    expect(() => build([template])).toThrow(/max below min/);
  });

  it('rejects a non-function answer rule', () => {
    const template = { ...good(), id: 'static-answer', answer: 42 as unknown as () => number };
    expect(() => build([template])).toThrow(/answer must be a function/);
  });

  it('warns when a prompt has nothing to vary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const template = { ...good(), id: 'static-prompt', prompt: 'ყოველთვის ერთი და იგივე' };
    expect(() => build([template])).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('can build without curriculum validation (for isolated tests)', () => {
    const template = { ...good(), id: 'anywhere', subtopicId: 'not-in-curriculum' };
    expect(() => createTemplateRegistry([template])).not.toThrow();
  });
});

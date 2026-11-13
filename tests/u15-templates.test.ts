import { describe, expect, it } from 'vitest';
import { U15_SUBTOPICS, U15_TEMPLATES } from '../src/practice/templates/u15-parts';
import {
  CONTAINERS,
  CONTAINER_LIST,
  SHARE_ITEMS,
  SHARE_ITEM_LIST,
  dividedChocolate,
  dividedCircle,
  dividedPizza,
  dividedRectangle,
  dividedSquare,
  dividedStrip,
  drawDividedParts,
  parseSharingDiagram,
  parseVisualParts,
  sharingBoxesDiagram,
  sharingLabeledDiagram,
  sharingRowDiagram,
  sharingWithRemainderDiagram,
} from '../src/practice/templates/parts';
import { generateFromTemplate, generateVariations } from '../src/practice/templates/generate';
import { hasTemplates } from '../src/practice/generator';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import type { GeneratedQuestion } from '../src/practice/templates/generate';

const SAMPLES = 24;
const SEED = 20261105;

const templateFor = (id: string) => {
  const template = U15_TEMPLATES.find((candidate) => candidate.id === id);
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

describe('the parts and sharing data model', () => {
  it('contains Georgian items and containers with emojis', () => {
    expect(SHARE_ITEM_LIST.length).toBeGreaterThanOrEqual(10);
    expect(SHARE_ITEMS.apple.name).toBe('ვაშლი');
    expect(SHARE_ITEMS.apple.emoji).toBe('🍎');
    expect(CONTAINER_LIST.length).toBeGreaterThanOrEqual(4);
    expect(CONTAINERS.vase.name).toBe('ვაზა');
    expect(CONTAINERS.vase.inName).toBe('ვაზაში');
  });

  it('draws sharing diagrams with labeled lines and parses them accurately', () => {
    const visual = sharingLabeledDiagram(3, 4, '🌸', 'ვაზა');
    const parsed = parseSharingDiagram(visual);
    expect(parsed.lines).toBe(3);
    expect(parsed.perLine).toEqual([4, 4, 4]);
    expect(parsed.total).toBe(12);
    expect(parsed.equal).toBe(true);
  });

  it('draws boxes and single-row diagrams for sharing', () => {
    const boxes = sharingBoxesDiagram(2, 3, '🍎');
    expect(boxes).toContain('[ 🍎 🍎 🍎 ]');
    const row = sharingRowDiagram(2, 3, '🍎');
    expect(row).toContain('│');
  });

  it('draws sharing diagrams with leftovers/remainders', () => {
    const visual = sharingWithRemainderDiagram(2, 3, 1, '🍎', 'ბავშვი');
    expect(visual).toContain('1-ლი ბავშვი: 🍎 🍎 🍎');
    expect(visual).toContain('მე-2 ბავშვი: 🍎 🍎 🍎');
    expect(visual).toContain('დარჩა: 🍎');
  });

  it('draws divided shapes and parses bracketed parts', () => {
    const equalParts = drawDividedParts([2, 2, 2]);
    const parsedEqual = parseVisualParts(equalParts);
    expect(parsedEqual.parts).toBe(3);
    expect(parsedEqual.sizes).toEqual([2, 2, 2]);
    expect(parsedEqual.equal).toBe(true);

    const unequalParts = drawDividedParts([1, 3]);
    const parsedUnequal = parseVisualParts(unequalParts);
    expect(parsedUnequal.parts).toBe(2);
    expect(parsedUnequal.sizes).toEqual([1, 3]);
    expect(parsedUnequal.equal).toBe(false);
  });

  it('creates divided rectangle, square, circle, pizza, chocolate, and strip', () => {
    expect(dividedRectangle(2, true).equal).toBe(true);
    expect(dividedRectangle(2, false).equal).toBe(false);
    expect(dividedSquare(4, true).equal).toBe(true);
    expect(dividedSquare(4, false).equal).toBe(false);
    expect(dividedCircle(2, true).equal).toBe(true);
    expect(dividedCircle(2, false).equal).toBe(false);
    expect(dividedPizza(4, true).equal).toBe(true);
    expect(dividedPizza(2, false).equal).toBe(false);
    expect(dividedChocolate(2, true).equal).toBe(true);
    expect(dividedChocolate(2, false).equal).toBe(false);
    expect(dividedStrip(3, true).equal).toBe(true);
    expect(dividedStrip(3, false).equal).toBe(false);
  });
});

describe('U15 as a unit', () => {
  it('has thirty templates over the curriculum’s two subtopics', () => {
    expect(U15_TEMPLATES).toHaveLength(30);
    expect(U15_SUBTOPICS).toEqual(['diagramiT-gayofa', 'toli-nawilebi-2']);
  });

  it('reaches all three levels in every subtopic', () => {
    for (const subtopicId of U15_SUBTOPICS) {
      const templates = U15_TEMPLATES.filter((t) => t.subtopicId === subtopicId);
      const levels = new Set(templates.map((t) => t.difficulty));
      expect(levels.has(1), `${subtopicId} lacks level 1`).toBe(true);
      expect(levels.has(2), `${subtopicId} lacks level 2`).toBe(true);
      expect(levels.has(3), `${subtopicId} lacks level 3`).toBe(true);
    }
  });

  it('is registered, and every subtopic is playable', () => {
    for (const subtopicId of U15_SUBTOPICS) {
      const subtopicRef = { grade: 1 as const, topicId: 'toli-nawilebi', subtopicId };
      expect(hasTemplates(subtopicRef), subtopicId).toBe(true);
      const fromRegistry = TEMPLATE_REGISTRY.forSubtopic(subtopicRef);
      expect(fromRegistry.length, `${subtopicId} in registry`).toBeGreaterThan(0);
    }
  });
});

describe('every generated question', () => {
  it('keeps every prompt and explanation in Georgian, fully rendered', () => {
    for (const template of U15_TEMPLATES) {
      const [question] = generateMany(template.id, 1);
      expect(question, template.id).toBeDefined();
      expect(question!.prompt, template.id).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
      expect(question!.explanation, template.id).not.toMatch(/\{[a-zA-Z0-9_]+\}/);
      expect(question!.visual, template.id).toBeTruthy();
    }
  });

  it('offers exactly one right answer, and never duplicate options', () => {
    for (const template of U15_TEMPLATES) {
      if (!template.options) continue;
      const questions = generateMany(template.id, 10);
      for (const question of questions) {
        expect(question.options, `${template.id}: options missing`).toBeDefined();
        const opts = question.options!;
        expect(new Set(opts).size, `${template.id}: duplicate options`).toBe(opts.length);
        expect(opts, `${template.id}: answer not in options`).toContain(String(question.answer));
      }
    }
  });

  it('marks integer entry questions with proper format', () => {
    for (const template of U15_TEMPLATES) {
      if (template.options) continue;
      expect(template.format?.kind, template.id).toBe('integer');
      expect(template.format?.entry, template.id).toBe(true);
    }
  });

  it('persists template id, vars, and correct answer', () => {
    for (const template of U15_TEMPLATES) {
      const [q] = generateMany(template.id, 1);
      expect(q!.templateId).toBe(template.id);
      expect(Object.keys(q!.vars).length).toBeGreaterThan(0);
      expect(q!.answer).toBeDefined();
    }
  });
});

describe('the picture and the answer agree', () => {
  it('matches sharing visual groups, items per group, and total', () => {
    const sharingTemplates = [
      'g1-u15-1-share-children',
      'g1-u15-1-share-containers',
      'g1-u15-2-share-larger',
      'g1-u15-2-missing-total',
    ];
    for (const templateId of sharingTemplates) {
      const questions = generateMany(templateId, 8);
      for (const q of questions) {
        const parsed = parseSharingDiagram(q.visual!);
        const total = Number(q.vars.total);
        const ans = Number(q.answer);
        expect(parsed.total, `${templateId}: visual total agrees with vars`).toBe(total);
        expect(parsed.perLine.every((n) => n === ans || total === ans), `${templateId}: per-group agrees`).toBe(true);
      }
    }
  });

  it('matches divided shape parts count and equality flag', () => {
    const dividedTemplates = [
      'g1-u15-1-equal-vs-unequal',
      'g1-u15-1-count-equal-parts',
      'g1-u15-1-are-parts-equal',
    ];
    for (const templateId of dividedTemplates) {
      const questions = generateMany(templateId, 10);
      for (const q of questions) {
        const parsed = parseVisualParts(q.visual!);
        if (templateId === 'g1-u15-1-count-equal-parts') {
          expect(parsed.parts, `${templateId} parts count`).toBe(Number(q.answer));
          expect(parsed.equal, `${templateId} must be equal`).toBe(true);
        } else if (q.answer === 'თანაბარი' || q.answer === 'ტოლია') {
          expect(parsed.equal, `${templateId} should be equal`).toBe(true);
        } else if (q.answer === 'არათანაბარი' || q.answer === 'არ არის ტოლი') {
          expect(parsed.equal, `${templateId} should be unequal`).toBe(false);
        }
      }
    }
  });

  it('answers A vs B picture choice with the correct letter', () => {
    const qEqual = generateMany('g1-u15-2-which-shows-equal', 8);
    for (const q of qEqual) {
      expect(['A', 'B']).toContain(q.answer);
      const lines = q.visual!.split('\n\n');
      const pickedLine = lines.find((l) => l.startsWith(`${q.answer}:`))!;
      const parsed = parseVisualParts(pickedLine);
      expect(parsed.equal, 'picked picture must be equal').toBe(true);
    }

    const qUnequal = generateMany('g1-u15-2-which-shows-unequal', 8);
    for (const q of qUnequal) {
      expect(['A', 'B']).toContain(q.answer);
      const lines = q.visual!.split('\n\n');
      const pickedLine = lines.find((l) => l.startsWith(`${q.answer}:`))!;
      const parsed = parseVisualParts(pickedLine);
      expect(parsed.equal, 'picked picture must be unequal').toBe(false);
    }
  });
});

describe('the specification questions are covered directly', () => {
  const evaluate = (templateId: string, vars: Record<string, string | number>) => {
    const t = templateFor(templateId);
    const prompt = t.prompt.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));
    const answer = t.answer(vars, {} as never);
    const visual = t.visual ? t.visual(vars) : '';
    return { prompt, answer, visual };
  };

  it('covers U15.1 Q1: 6 apples shared among 2 children -> 3', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 2,
      perChild: 3,
      itemKey: 'apple',
      total: 6,
      itemName: 'ვაშლი',
    });
    expect(q.prompt).toContain('6 ვაშლი თანაბრად გაუნაწილეს 2 ბავშვს');
    expect(q.answer).toBe(3);
    expect(q.visual).toContain('1-ლი ბავშვი: 🍎 🍎 🍎');
    expect(q.visual).toContain('მე-2 ბავშვი: 🍎 🍎 🍎');
  });

  it('covers U15.1 Q2: 8 balls shared among 4 children -> 2', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 4,
      perChild: 2,
      itemKey: 'ball',
      total: 8,
      itemName: 'ბურთი',
    });
    expect(q.prompt).toContain('8 ბურთი თანაბრად გაუნაწილეს 4 ბავშვს');
    expect(q.answer).toBe(2);
  });

  it('covers U15.1 Q3: 4 cakes shared among 2 children -> 2', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 2,
      perChild: 2,
      itemKey: 'cake',
      total: 4,
      itemName: 'ნამცხვარი',
    });
    expect(q.prompt).toContain('4 ნამცხვარი თანაბრად გაუნაწილეს 2 ბავშვს');
    expect(q.answer).toBe(2);
  });

  it('covers U15.1 Q4: 9 pencils shared among 3 children -> 3', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 3,
      perChild: 3,
      itemKey: 'pencil',
      total: 9,
      itemName: 'ფანქარი',
    });
    expect(q.prompt).toContain('9 ფანქარი თანაბრად გაუნაწილეს 3 ბავშვს');
    expect(q.answer).toBe(3);
  });

  it('covers U15.1 Q5: 10 strawberries shared among 2 children -> 5', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 2,
      perChild: 5,
      itemKey: 'strawberry',
      total: 10,
      itemName: 'მარწყვი',
    });
    expect(q.prompt).toContain('10 მარწყვი თანაბრად გაუნაწილეს 2 ბავშვს');
    expect(q.answer).toBe(5);
  });

  it('covers U15.1 Q6: 12 cubes shared among 4 children -> 3', () => {
    const q = evaluate('g1-u15-2-share-larger', {
      children: 4,
      perChild: 3,
      itemKey: 'cube',
      total: 12,
      itemName: 'კუბიკი',
    });
    expect(q.prompt).toContain('12 კუბიკი თანაბრად გაუნაწილეს 4 ბავშვს');
    expect(q.answer).toBe(3);
  });

  it('covers U15.1 Q7: 6 buns shared among 3 children -> 2', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 3,
      perChild: 2,
      itemKey: 'bun',
      total: 6,
      itemName: 'ფუნთუშა',
    });
    expect(q.prompt).toContain('6 ფუნთუშა თანაბრად გაუნაწილეს 3 ბავშვს');
    expect(q.answer).toBe(2);
  });

  it('covers U15.1 Q8: 8 candies shared among 2 children -> 4', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 2,
      perChild: 4,
      itemKey: 'candy',
      total: 8,
      itemName: 'კანფეტი',
    });
    expect(q.prompt).toContain('8 კანფეტი თანაბრად გაუნაწილეს 2 ბავშვს');
    expect(q.answer).toBe(4);
  });

  it('covers U15.1 Q9: 12 flowers put equally into 3 vases -> 4', () => {
    const q = evaluate('g1-u15-1-share-containers', {
      containerKey: 'vase',
      containers: 3,
      perContainer: 4,
      itemKey: 'flower',
      total: 12,
      itemName: 'ყვავილი',
      containerIn: 'ვაზაში',
    });
    expect(q.prompt).toContain('12 ყვავილი თანაბრად ჩააწყვეს 3 ვაზაში');
    expect(q.answer).toBe(4);
  });

  it('covers U15.1 Q10: 10 toys shared among 5 children -> 2', () => {
    const q = evaluate('g1-u15-1-share-children', {
      children: 5,
      perChild: 2,
      itemKey: 'toy',
      total: 10,
      itemName: 'სათამაშო',
    });
    expect(q.prompt).toContain('10 სათამაშო თანაბრად გაუნაწილეს 5 ბავშვს');
    expect(q.answer).toBe(2);
  });

  it('covers U15.2 Q1: rectangle in 2 equal parts -> თანაბარი', () => {
    const q = evaluate('g1-u15-1-equal-vs-unequal', {
      shape: 'rectangle',
      equal: 1,
      parts: 2,
      shapeName: 'მართკუთხედი',
      description: '2 ერთნაირ ნაწილად',
    });
    expect(q.prompt).toContain('მართკუთხედი გაყოფილია 2 ერთნაირ ნაწილად');
    expect(q.answer).toBe('თანაბარი');
  });

  it('covers U15.2 Q2: circle in 2 unequal parts -> არათანაბარი', () => {
    const q = evaluate('g1-u15-1-equal-vs-unequal', {
      shape: 'circle',
      equal: 0,
      parts: 2,
      shapeName: 'წრე',
      description: '2 ნაწილად: ერთი ნაწილი დიდია, მეორე — პატარა',
    });
    expect(q.prompt).toContain('წრე გაყოფილია 2 ნაწილად: ერთი ნაწილი დიდია, მეორე — პატარა');
    expect(q.answer).toBe('არათანაბარი');
  });

  it('covers U15.2 Q3: square in 4 equal small squares -> თანაბარი', () => {
    const q = evaluate('g1-u15-1-equal-vs-unequal', {
      shape: 'square',
      equal: 1,
      parts: 4,
      shapeName: 'კვადრატი',
      description: '4 ერთნაირ პატარა კვადრატად',
    });
    expect(q.prompt).toContain('კვადრატი გაყოფილია 4 ერთნაირ პატარა კვადრატად');
    expect(q.answer).toBe('თანაბარი');
  });

  it('covers U15.2 Q4: pizza in 4 equal slices -> თანაბარი', () => {
    const q = evaluate('g1-u15-1-equal-vs-unequal', {
      shape: 'pizza',
      equal: 1,
      parts: 4,
      shapeName: 'პიცა',
      description: '4 ნაჭრად. ყველა ნაჭერი ერთნაირი ზომისაა',
    });
    expect(q.prompt).toContain('პიცა გაყოფილია 4 ნაჭრად. ყველა ნაჭერი ერთნაირი ზომისაა');
    expect(q.answer).toBe('თანაბარი');
  });

  it('covers U15.2 Q5: rectangle in 2 unequal parts -> არათანაბარი', () => {
    const q = evaluate('g1-u15-1-equal-vs-unequal', {
      shape: 'rectangle',
      equal: 0,
      parts: 2,
      shapeName: 'მართკუთხედი',
      description: '2 ნაწილად, რომელთაგან ერთი მეორეზე დიდია',
    });
    expect(q.prompt).toContain('მართკუთხედი გაყოფილია 2 ნაწილად, რომელთაგან ერთი მეორეზე დიდია');
    expect(q.answer).toBe('არათანაბარი');
  });

  it('covers U15.2 Q6: which picture shows 2 equal parts -> A', () => {
    const q = evaluate('g1-u15-2-which-shows-equal', {
      shape: 'rectangle',
      parts: 2,
      equalLetter: 'A',
    });
    expect(q.prompt).toContain('რომელი ნახატი გვიჩვენებს 2 თანაბარ ნაწილს?');
    expect(q.answer).toBe('A');
  });

  it('covers U15.2 Q7: square divided into 4 equal parts -> 4', () => {
    const q = evaluate('g1-u15-1-count-equal-parts', {
      shape: 'square',
      parts: 4,
      shapeName: 'კვადრატი',
    });
    expect(q.prompt).toContain('კვადრატი გაყოფილია 4 თანაბარ ნაწილად. რამდენი თანაბარი ნაწილია?');
    expect(q.answer).toBe(4);
  });

  it('covers U15.2 Q8: circle divided into 2 equal parts -> 2', () => {
    const q = evaluate('g1-u15-1-count-equal-parts', {
      shape: 'circle',
      parts: 2,
      shapeName: 'წრე',
    });
    expect(q.prompt).toContain('წრე გაყოფილია 2 თანაბარ ნაწილად. რამდენი თანაბარი ნაწილია?');
    expect(q.answer).toBe(2);
  });

  it('covers U15.2 Q9: which picture shows equal parts -> B', () => {
    const q = evaluate('g1-u15-2-which-shows-equal', {
      shape: 'strip',
      parts: 2,
      equalLetter: 'B',
    });
    expect(q.prompt).toContain('რომელი ნახატი გვიჩვენებს 2 თანაბარ ნაწილს?');
    expect(q.answer).toBe('B');
  });

  it('covers U15.2 Q10: rectangle divided into 3 equal parts -> 3', () => {
    const q = evaluate('g1-u15-1-count-equal-parts', {
      shape: 'rectangle',
      parts: 3,
      shapeName: 'მართკუთხედი',
    });
    expect(q.prompt).toContain('მართკუთხედი გაყოფილია 3 თანაბარ ნაწილად. რამდენი თანაბარი ნაწილია?');
    expect(q.answer).toBe(3);
  });
});

import { beforeAll, afterEach, expect, it, vi } from 'vitest';
import fs from 'node:fs';
import { PDFDocument } from 'pdf-lib';
import { TEMPLATE_REGISTRY } from '../src/practice/templates/catalog';
import { drawTemplate, isDuplicate, newTest, paperSupport, totalPoints, validateContent } from '../src/teacher/testMakerData';
import { createTestPdf } from '../src/teacher/testMakerPdf';
import type { GeneratedQuestion } from '../src/practice/generator';
let q: GeneratedQuestion;
beforeAll(() => { for (const template of TEMPLATE_REGISTRY.all) { try { q=drawTemplate(template.id,1); break; } catch { /* not paper-compatible */ } } if (!q) throw new Error('No supported real template'); });
afterEach(() => vi.unstubAllGlobals());
it('uses the real generator, freezes the exact instance and detects duplicates', () => {
  expect(q.templateId).toBeTruthy(); expect(paperSupport(q)).toBe(true);
  const doc = {...newTest(),questions:[{ question:q, points:3 }]};
  validateContent(doc,true); expect(totalPoints(doc)).toBe(3); expect(isDuplicate(doc,q)).toBe(true);
  const saved = JSON.parse(JSON.stringify(doc));
  expect(saved.questions[0].question.answer).toBe(q.answer); expect(saved.questions[0].question.prompt).toBe(q.prompt);
  expect(() => validateContent({...doc,questions:[{question:q,points:0}]})).toThrow();
  expect(() => validateContent({...doc,questions:[{question:{...q,templateId:'missing'},points:1}]})).toThrow();
  expect(() => validateContent({...doc,questions:[{question:{...q,visual:'drawing'},points:1}]})).toThrow();
});
it('generates separate, loadable A4 PDF files from the frozen instance', async () => {
  vi.stubGlobal('fetch', vi.fn(async (path: string) => {
    const name = ['NotoSansGeorgian','NotoSansMath','NotoSansSymbols2'].find((n)=>path.includes(n)) ?? 'NotoSans';
    const file=`src/teacher/fonts/${name}-Regular.ttf`;
    const bytes=fs.readFileSync(file);
    return {ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};
  }));
  const doc = {...newTest(),title:'ტესტი',questions:[{question:q,points:3}]};
  const student=await createTestPdf(doc,false), key=await createTestPdf(doc,true);
  expect(new TextDecoder().decode(student.slice(0,5))).toBe('%PDF-');
  expect(new TextDecoder().decode(key.slice(0,5))).toBe('%PDF-');
  expect(student).not.toEqual(key);
  const loaded=await PDFDocument.load(student); expect(loaded.getPageCount()).toBe(1);
  const {width,height}=loaded.getPage(0).getSize(); expect(width).toBeCloseTo(595.28); expect(height).toBeCloseTo(841.89);
});

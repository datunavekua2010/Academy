import { PDFDocument, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import georgianFont from './fonts/NotoSansGeorgian-Regular.ttf?url';
import latinFont from './fonts/NotoSans-Regular.ttf?url';
import mathFont from './fonts/NotoSansMath-Regular.ttf?url';
import symbolFont from './fonts/NotoSansSymbols2-Regular.ttf?url';
import { totalPoints, validateContent, type TestContent } from './testMakerData';

/** Real A4 PDFs, generated from the same frozen snapshot for preview and download. */
export async function createTestPdf(content: TestContent, key: boolean): Promise<Uint8Array> {
  validateContent(content, true);
  const fontBytes = await Promise.all([georgianFont,latinFont,mathFont,symbolFont].map((url) => fetch(url).then((r) => { if (!r.ok) throw new Error('Font unavailable'); return r.arrayBuffer(); })));
  const doc = await PDFDocument.create(); doc.registerFontkit(fontkit);
  const [geo, latin, math, symbols] = await Promise.all(fontBytes.map((bytes) => doc.embedFont(bytes, { subset: true })));
  const fonts = [geo, latin, math, symbols].map((font) => ({ font, chars: new Set(font.getCharacterSet()) }));
  const width = 595.28, height = 841.89, margin = 48, maxWidth = width - margin * 2;
  const runs = (text: string) => {
    const result: { font: PDFFont; text: string }[] = [];
    for (const ch of text.normalize('NFC')) {
      const cp = ch.codePointAt(0)!; const font = fonts.find((entry) => entry.chars.has(cp))?.font;
      if (!font) throw new Error(`Unsupported character U+${cp.toString(16).toUpperCase()}`);
      const last = result[result.length - 1]; if (last?.font === font) last.text += ch; else result.push({ font, text:ch });
    }
    return result;
  };
  const measure = (text: string, size: number) => runs(text).reduce((n, r) => n + r.font.widthOfTextAtSize(r.text, size), 0);
  const wrap = (text: string, size: number) => {
    const lines: string[] = [];
    for (const paragraph of text.replace(/\r\n?/g,'\n').split('\n')) {
      let current = '';
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const next = current ? `${current} ${word}` : word;
        if (measure(next, size) <= maxWidth) { current = next; continue; }
        if (current) { lines.push(current); current = ''; }
        for (const ch of word) { if (measure(current + ch, size) > maxWidth) { if (!current) throw new Error('Text too wide'); lines.push(current); current = ch; } else current += ch; }
      }
      lines.push(current);
    }
    return lines;
  };
  let page: PDFPage = doc.addPage([width,height]); let y = height - margin;
  const addPage = () => { page = doc.addPage([width,height]); y = height - margin; };
  const line = (text: string, size = 11, gap = 16) => {
    if (y - gap < margin + 22) addPage();
    let x = margin;
    for (const run of runs(text)) { page.drawText(run.text, { x, y:y-size, size, font:run.font, color:rgb(0,0,0) }); x += run.font.widthOfTextAtSize(run.text, size); }
    y -= gap;
  };
  const block = (text: string, size = 11, gap = 16) => { for (const part of wrap(text,size)) line(part,size,gap); };
  if (content.branding) line('Axiom Academy', 12, 19);
  block(content.title, 16, 23);
  if (key) line('პასუხების ფურცელი', 12, 20);
  if (content.grade !== null) line(`${content.grade} კლასი`, 11, 17);
  line(`სულ ქულა: ${totalPoints(content)}`, 11, 17);
  if (!key && content.minutes !== null) line(`დრო: ${content.minutes} წუთი`,11,17);
  if (!key && content.nameField) line('სახელი და გვარი: ____________________________________',11,20);
  if (!key && content.dateField) line('თარიღი: ______________________',11,20);
  if (!key && content.instructions) { y -= 4; block(content.instructions); }
  y -= 10;
  for (const [index, item] of content.questions.entries()) {
    const q = item.question;
    const lines = key ? wrap(`${index + 1}. ${q.answer}  (${item.points} ქულა)`, 11) : [ ...wrap(`${index + 1}. ${q.prompt}  (${item.points} ქულა)`,11), ...q.options.flatMap((option, i) => wrap(`   ${String.fromCharCode(65+i)}. ${option}`,11)) ];
    // Keep a complete question together where it fits on a page; otherwise fail closed.
    const needed = lines.length * 16 + (key ? 10 : 42);
    if (needed > height - 2 * margin - 22) throw new Error('Question too long for one page');
    if (y - needed < margin + 22) addPage();
    for (const text of lines) line(text);
    if (!key) { page.drawLine({ start:{x:margin,y:y-14}, end:{x:width-margin,y:y-14}, thickness:0.5, color:rgb(.5,.5,.5) }); y -= 32; }
    y -= 10;
  }
  const pages = doc.getPages();
  pages.forEach((p,i) => { const label = `${i+1} / ${pages.length}`; p.drawText(label, { x:width-margin-latin.widthOfTextAtSize(label,9), y:22, size:9, font:latin }); });
  return doc.save();
}

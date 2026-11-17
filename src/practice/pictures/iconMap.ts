/**
 * Which character a template wrote, and which drawn icon replaces it.
 *
 * The parser reads this table; the renderer (`icons.tsx`) draws every key in it.
 * `ka` is the Georgian name a screen reader announces, so a row of apples is
 * read as „ვაშლი ×5“ and not as five emoji.
 */
export interface IconInfo {
  key: string;
  ka: string;
}

const i = (key: string, ka: string): IconInfo => ({ key, ka });

export const CHAR_ICONS: Record<string, IconInfo> = {
  // fruit and food
  '🍎': i('apple', 'ვაშლი'),
  '🍏': i('apple-green', 'მწვანე ვაშლი'),
  '🍐': i('pear', 'მსხალი'),
  '🍊': i('orange', 'ფორთოხალი'),
  '🍋': i('lemon', 'ლიმონი'),
  '🍌': i('banana', 'ბანანი'),
  '🍓': i('strawberry', 'მარწყვი'),
  '🫐': i('blueberry', 'მოცვი'),
  '🍉': i('watermelon', 'საზამთრო'),
  '🍈': i('melon', 'ნესვი'),
  '🥐': i('croissant', 'კრუასანი'),
  '🍪': i('cookie', 'ნამცხვარი'),
  '🍬': i('candy', 'კანფეტი'),
  '🍫': i('chocolate', 'შოკოლადი'),
  '🍦': i('cone', 'ნაყინის კონუსი'),
  '🍕': i('pizza', 'პიცა'),
  '🧁': i('cupcake', 'ნამცხვარი'),
  '🍽': i('plate', 'თეფში'),
  // animals and nature
  '🐟': i('fish', 'თევზი'),
  '🐶': i('dog', 'ძაღლი'),
  '🐈': i('cat', 'კატა'),
  '🐱': i('cat', 'კატა'),
  '🐁': i('mouse', 'თაგვი'),
  '🐦': i('bird', 'ჩიტი'),
  '🐤': i('chick', 'წიწილა'),
  '🌳': i('tree', 'ხე'),
  '🌸': i('flower-pink', 'ყვავილი'),
  '🌼': i('flower-yellow', 'ყვავილი'),
  '🌹': i('flower-red', 'ვარდი'),
  '🌙': i('moon', 'მთვარე'),
  '☀': i('sun', 'მზე'),
  '⭐': i('star', 'ვარსკვლავი'),
  '★': i('star', 'ვარსკვლავი'),
  '❤': i('heart', 'გული'),
  // things
  '🎈': i('balloon', 'ბუშტი'),
  '⚽': i('ball', 'ბურთი'),
  '🏐': i('volleyball', 'ბურთი'),
  '🎲': i('dice', 'კამათელი'),
  '🧱': i('brick', 'აგური'),
  '📦': i('box', 'ყუთი'),
  '📘': i('book-blue', 'წიგნი'),
  '📕': i('book-red', 'წიგნი'),
  '📚': i('books', 'წიგნები'),
  '🪑': i('chair', 'სკამი'),
  '🕐': i('clock-icon', 'საათი'),
  '🚗': i('car', 'მანქანა'),
  '🚂': i('train', 'მატარებელი'),
  '🔔': i('bell', 'ზარი'),
  '🧸': i('bear', 'დათუნია'),
  '🤖': i('robot', 'რობოტი'),
  '🥁': i('drum', 'დოლი'),
  '🧩': i('puzzle', 'ფაზლი'),
  '✏': i('pencil', 'ფანქარი'),
  '🥫': i('can', 'ქილა'),
  '🧻': i('roll', 'რულონი'),
  '🪟': i('window', 'ფანჯარა'),
  '🧊': i('ice-cube', 'კუბი'),
  '⚠': i('sign-triangle', 'სამკუთხა ნიშანი'),
  // coloured dots and squares
  '🔴': i('dot-red', 'წითელი წრე'),
  '🟠': i('dot-orange', 'ნარინჯისფერი წრე'),
  '🟡': i('dot-yellow', 'ყვითელი წრე'),
  '🟢': i('dot-green', 'მწვანე წრე'),
  '🔵': i('dot-blue', 'ლურჯი წრე'),
  '🟣': i('dot-purple', 'იისფერი წრე'),
  '⚪': i('dot-white', 'თეთრი წრე'),
  '⚫': i('dot-black', 'შავი წრე'),
  '🟥': i('sq-red', 'წითელი კვადრატი'),
  '🟧': i('sq-orange', 'ნარინჯისფერი კვადრატი'),
  '🟨': i('sq-yellow', 'ყვითელი კვადრატი'),
  '🟩': i('sq-green', 'მწვანე კვადრატი'),
  '🟦': i('sq-blue', 'ლურჯი კვადრატი'),
  '🟪': i('sq-purple', 'იისფერი კვადრატი'),
  '⬜': i('sq-white', 'ცარიელი უჯრა'),
  '⬛': i('sq-black', 'შავი კვადრატი'),
  '🔷': i('diamond-blue', 'ლურჯი რომბი'),
  '🔺': i('tri-red', 'წითელი სამკუთხედი'),
  // geometric glyphs
  '○': i('shape-circle', 'წრე'),
  '●': i('mark-circle', 'წრე'),
  '△': i('shape-triangle', 'სამკუთხედი'),
  '▲': i('mark-triangle', 'სამკუთხედი'),
  '□': i('shape-square', 'კვადრატი'),
  '■': i('mark-square', 'კვადრატი'),
  '▭': i('shape-rectangle', 'მართკუთხედი'),
  '◯': i('shape-circle', 'წრე'),
  '⬭': i('shape-ellipse', 'ოვალი'),
  '⬠': i('shape-pentagon', 'ხუთკუთხედი'),
  '⬡': i('shape-hexagon', 'ექვსკუთხედი'),
  '◇': i('shape-rhombus', 'რომბი'),
  '◆': i('mark-diamond', 'რომბი'),
  '⊐': i('line-open', 'ღია ხაზი'),
  '∿': i('line-wave', 'ტალღოვანი ხაზი'),
  '⌒': i('line-arc', 'რკალი'),
  // place-value pieces
  '▮': i('rod-ten', 'ათეული'),
  '▪': i('unit', 'ერთეული'),
  '▫': i('unit-light', 'ერთეული'),
};

/** Characters that stand for the answer, a removed item, or a pointer. */
export const PLACEHOLDER_CHARS: Record<string, 'unknown' | 'crossed' | 'pointer'> = {
  '❓': 'unknown',
  '❌': 'crossed',
  '👉': 'pointer',
};

/** Strips the invisible variation selector that follows many emoji. */
export const stripVs = (text: string): string => text.replace(/\ufe0f/g, '');

/** Is this a pictographic character the table does not know? Drawn as a glyph. */
export const isPictographic = (char: string): boolean => /\p{Extended_Pictographic}/u.test(char);

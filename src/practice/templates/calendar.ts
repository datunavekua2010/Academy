/**
 * The calendar, as data.
 *
 * U13 asks three questions over and over: what comes next in a cycle, what came
 * before it, and how far apart two points are. All three are the same function
 * once the cycle is a list and the arithmetic is modulo its length — so the unit
 * keeps its cycles here, in one place, and every template computes from them.
 *
 * That is the whole point of this file. A weekday question whose answer is
 * `weekdayAfter(today, 10)` and a weekday picture whose label is
 * `WEEKDAYS[dayIndex]` cannot disagree, because they read the same array. The
 * first draft of U12 got this wrong in a smaller way and shipped a clock whose
 * hour hand sat on the hour at half past.
 *
 * Georgia's four seasons are the ordinary ones the curriculum uses and are
 * stated in the specification: spring is March–May, summer June–August, autumn
 * September–November, winter December–February.
 */

/* ================================================================== *\
 * The week
 * ================================================================== */

/**
 * The seven days, Monday first, as the curriculum numbers them.
 *
 * Monday is 1 and Sunday is 7 — the specification's own numbering for its
 * „match the days to their order“ question, so nothing else in the unit has to
 * translate between two conventions.
 */
export const WEEKDAYS = [
  'ორშაბათი',
  'სამშაბათი',
  'ოთხშაბათი',
  'ხუთშაბათი',
  'პარასკევი',
  'შაბათი',
  'კვირა',
] as const;

export type Weekday = (typeof WEEKDAYS)[number];

/** 0–6, Monday = 0. Throws rather than returning −1: a misspelt day is a bug. */
export const weekdayIndex = (name: string): number => {
  const index = WEEKDAYS.indexOf(name as Weekday);
  if (index < 0) throw new Error(`no weekday "${name}"`);
  return index;
};

/** The day `steps` days after `name`, wrapping through the week. */
export const weekdayAfter = (name: string, steps: number): Weekday => WEEKDAYS[(((weekdayIndex(name) + steps) % 7) + 7) % 7]!;

/** The day `steps` days before `name`. */
export const weekdayBefore = (name: string, steps: number): Weekday => WEEKDAYS[(((weekdayIndex(name) - steps) % 7) + 7) % 7]!;

/** The order number of a day, 1–7 for Monday–Sunday. */
export const weekdayNumber = (name: string): number => weekdayIndex(name) + 1;

/* ================================================================== *\
 * The year
 * ================================================================== */

/** The twelve months, in order. */
export const MONTHS = [
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
] as const;

export type Month = (typeof MONTHS)[number];

/** 0–11, January = 0. */
export const monthIndex = (name: string): number => {
  const index = MONTHS.indexOf(name as Month);
  if (index < 0) throw new Error(`no month "${name}"`);
  return index;
};

/** The month `steps` months after `name`, wrapping through the year. */
export const monthAfter = (name: string, steps: number): Month => MONTHS[(((monthIndex(name) + steps) % 12) + 12) % 12]!;

/** The month `steps` months before `name`. */
export const monthBefore = (name: string, steps: number): Month => MONTHS[(((monthIndex(name) - steps) % 12) + 12) % 12]!;

/* ================================================================== *\
 * Seasons
 * ================================================================== */

export interface Season {
  key: string;
  name: string;
  /** The months, in order, that Georgia's ordinary four-season split gives it. */
  months: Month[];
  /** A short Georgian line about it, used in explanations. */
  note: string;
}

/**
 * The four seasons, with the months the specification assigns them.
 *
 * Winter is listed as December–February, which is why `MONTHS` order and season
 * order are not the same cycle: the season that *follows* winter is spring, but
 * the month that follows February is March. Both are correct, and conflating
 * them is the mistake this unit's calendar tests exist for.
 */
export const SEASONS: Season[] = [
  { key: 'spring', name: 'გაზაფხული', months: ['მარტი', 'აპრილი', 'მაისი'], note: 'ბუნება იღვიძებს' },
  { key: 'summer', name: 'ზაფხული', months: ['ივნისი', 'ივლისი', 'აგვისტო'], note: 'ყველაზე თბილი დროა' },
  { key: 'autumn', name: 'შემოდგომა', months: ['სექტემბერი', 'ოქტომბერი', 'ნოემბერი'], note: 'ფოთლები ყვითლდება' },
  { key: 'winter', name: 'ზამთარი', months: ['დეკემბერი', 'იანვარი', 'თებერვალი'], note: 'ცივა და თოვს' },
];


/** The season a month belongs to, computed from `SEASONS` — never a second table. */
export const seasonOfMonth = (month: string): Season => {
  const found = SEASONS.find((item) => item.months.includes(month as Month));
  if (!found) throw new Error(`no season for "${month}"`);
  return found;
};

/** The season that follows another in the year. */
export const seasonAfter = (name: string): Season => {
  const index = SEASONS.findIndex((item) => item.name === name);
  if (index < 0) throw new Error(`no season "${name}"`);
  return SEASONS[(index + 1) % SEASONS.length]!;
};

/* ================================================================== *\
 * Clock arithmetic
 * ================================================================== */

/**
 * A time of day, held as minutes since midnight.
 *
 * Every duration in the unit is computed by converting to minutes, doing the
 * arithmetic and converting back — the specification's rule 6 — which is what
 * stops „3:30 plus 90 minutes“ from being computed on the hour and the minute
 * separately.
 */
export const pad = (value: number): string => String(value).padStart(2, '0');

/** `HH:MM`, the app's only spelling of a time. */
export const timeText = (minutes: number): string => `${pad(Math.floor(minutes / 60) % 24)}:${pad(minutes % 60)}`;

/** Minutes since midnight, from `HH:MM`. */
export const minutesOf = (text: string): number => {
  const [hours, mins] = text.split(':').map(Number);
  return (hours ?? 0) * 60 + (mins ?? 0);
};

/** The same clock time on the 12-hour dial, 12 o'clock staying 12. */
export const dialHour = (minutes: number): number => {
  const hour = Math.floor(minutes / 60) % 12;
  return hour === 0 ? 12 : hour;
};


/* ---------------------------------------------------------------- *\
 * Georgian case endings
 * ---------------------------------------------------------------- */

/*
 * Georgian is agglutinative enough that the names in this file cannot be
 * dropped into a sentence as they stand: „ივლისი-ის შემდეგ“ is not Georgian.
 * The genitive drops the final vowel („ივლისი“ → „ივლისის“, „მაისი“ → „მაისის“,
 * „ზაფხული“ → „ზაფხულის“), and the two -ში nouns drop it too: „კვირა“ →
 * „კვირაში“, „შემოდგომა“ → „შემოდგომაში“.
 *
 * Only the cases the templates need are spelled out. A name this does not
 * recognise is returned unchanged rather than half-suffixed — a prompt is better
 * slightly stiff than ungrammatical, and the tests assert the endings that do
 * exist.
 */

/**
 * The stem a case ending attaches to: the name without its final vowel.
 *
 * „ივლისი“ → „ივლის-“, „კვირა“ → „კვირ-„. Both the genitive and the ablative work
 * from this stem; the locative is the one case whose ending differs by the
 * vowel that was dropped, so it is written out below.
 */
const stem = (name: string): string => name.replace(/[ია]$/u, '');

/**
 * Genitive — „ივლისის შემდეგ“, „კვირის ბოლო დღე“.
 *
 * Both noun classes take `-ის` on the stem: „მარტი“ → „მარტის“, „მაისი“ →
 * „მაისის“, „შემოდგომა“ → „შემოდგომის“.
 */
export const genitive = (name: string): string => `${stem(name)}ის`;

/**
 * Locative — „ივლისში“, „კვირაში“, „ზაფხულში“.
 *
 * The `-ი` nouns lose their vowel before `-ში` („მარტი“ → „მარტში“); the `-ა`
 * nouns keep it („კვირა“ → „კვირაში“, „შემოდგომა“ → „შემოდგომაში“). A name already
 * ending in `-ში` is left alone, so this is safe to call twice.
 */
export const locative = (name: string): string => {
  if (name.endsWith('ში')) return name;
  return name.endsWith('ა') ? `${name}ში` : `${stem(name)}ში`;
};

/**
 * Ablative/„from“ — „ივლისიდან“, „კვირიდან“, used for counting forwards.
 *
 * Both classes take `-იდან` on the stem, which is why this one is a single rule
 * where the locative needed two.
 */
export const fromName = (name: string): string => (name.endsWith('დან') ? name : `${stem(name)}იდან`);

/** „by/up to“ — „ივლისამდე“, „კვირამდე“: `-ამდე` on the stem, both classes. */
export const untilName = (name: string): string => (name.endsWith('მდე') ? name : `${stem(name)}ამდე`);


/** A duration in words, from a whole number of minutes. */
export const durationWords = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  const hourText = hours === 1 ? '1 საათი' : `${hours} საათი`;
  if (rest === 0) return hourText;
  const minuteText = rest === 1 ? '1 წუთი' : `${rest} წუთი`;
  return hours === 0 ? minuteText : `${hourText} და ${minuteText}`;
};

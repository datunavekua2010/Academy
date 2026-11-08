import type { GradeCurriculum, GradeId, Subtopic, Topic, Unit } from './types';
import { topicSubtopics } from './types';

/**
 * Placeholder curriculum (Grades I–VII).
 *
 * Structure is final: Grade → Topic → Unit → Subtopic → Questions. The actual
 * topic list will be replaced when the academy sends the real curriculum;
 * because every question is stored against the subtopic ids, only this file
 * and the question bank need to change.
 *
 * Units group the subtopics of a topic. They were formed from the existing
 * subtopic ids — no subtopic was renamed or re-identified — so the question
 * bank, the 100-point engine and saved progress keep working unchanged.
 */

type SubtopicSeed = { id: string; title: string; summary: string };

/** `units` are numbered U1, U2, … in the order they are declared. */
const topic = (
  id: string,
  title: string,
  emoji: string,
  summary: string,
  tone: Topic['tone'],
  units: Array<{ id?: string; title: string; subtopics: SubtopicSeed[] }>,
): Topic => ({
  id,
  title,
  emoji,
  summary,
  tone,
  units: units.map((unit, index) => ({
    id: unit.id ?? `u${index + 1}`,
    code: `U${index + 1}`,
    title: unit.title,
    subtopics: unit.subtopics,
  })),
});

const g1: Topic[] = [
  topic('ricxvebi', 'რიცხვები და დათვლა', '🔢', 'რიცხვები 20-მდე, დათვლა და შედარება.', 'blue', [

    {
      title: 'დათვლა',
      subtopics: [
        { id: 'datvla', title: 'დათვლა და მიმდევრობა', summary: 'რიცხვების რიგი და მეზობლები' },
      ],
    },
    {
      title: 'შედარება',
      subtopics: [
        { id: 'shedareba', title: 'რიცხვების შედარება', summary: 'მეტი, ნაკლები, ტოლი' },
      ],
    },
  ]),
  topic('shekreba', 'შეკრება და გამოკლება', '➕', 'მოქმედებები 20-ის ფარგლებში.', 'teal', [

    {
      title: 'მოქმედებები 10-მდე',
      subtopics: [
        { id: 'atamde', title: 'მოქმედებები 10-მდე', summary: 'შეკრება და გამოკლება ერთნიშნა რიცხვებით' },
      ],
    },
    {
      title: 'მოქმედებები 20-მდე',
      subtopics: [
        { id: 'ocamde', title: 'მოქმედებები 20-მდე', summary: 'ათეულის გავლით შეკრება' },
      ],
    },
  ]),
  topic('forma', 'ფორმები და ლოგიკა', '🔺', 'გეომეტრიული ფორმები და კანონზომიერებები.', 'yellow', [

    {
      title: 'გეომეტრიული ფორმები',
      subtopics: [
        { id: 'amocnoba', title: 'ფორმების ამოცნობა', summary: 'გვერდები, კუთხეები, სახელები' },
      ],
    },
    {
      title: 'კანონზომიერება',
      subtopics: [
        { id: 'tanmimdevroba', title: 'თანმიმდევრობა', summary: 'კანონზომიერების გაგრძელება' },
      ],
    },
  ]),
];

const g2: Topic[] = [
  topic('shekreba100', 'შეკრება და გამოკლება 100-მდე', '🧮', 'ორნიშნა რიცხვები ათეულის გავლით.', 'blue', [

    {
      title: 'ათეულის გავლით',
      subtopics: [
        { id: 'ateusit', title: 'ათეულის გავლით', summary: '47 + 25 ტიპის მოქმედებები' },
      ],
    },
    {
      title: 'სიტყვიერი ამოცანები',
      subtopics: [
        { id: 'amocana', title: 'სიტყვიერი ამოცანები', summary: 'მოკლე ტექსტური ამოცანები' },
      ],
    },
  ]),
  topic('gamravleba', 'გამრავლება', '✖️', 'გამრავლების ცხრილი და თანაბარი ჯგუფები.', 'teal', [

    {
      title: 'გამრავლების ცხრილი',
      subtopics: [
        { id: 'cxrili', title: 'გამრავლების ცხრილი 2–5', summary: '2, 3, 4 და 5-ის ცხრილი' },
      ],
    },
    {
      title: 'თანაბარი ჯგუფები',
      subtopics: [
        { id: 'jgufi', title: 'თანაბარი ჯგუფები', summary: 'დაყოფა თანაბარ ნაწილებად' },
      ],
    },
  ]),
  topic('gazomva', 'გაზომვები', '📏', 'სიგრძე და დრო.', 'yellow', [

    {
      title: 'სიგრძე',
      subtopics: [
        { id: 'sigrze', title: 'სიგრძე', summary: 'სანტიმეტრი და მეტრი' },
      ],
    },
    {
      title: 'დრო',
      subtopics: [
        { id: 'dro', title: 'დრო', summary: 'საათი და წუთი' },
      ],
    },
  ]),
];

const g3: Topic[] = [
  topic('gamravleba-gayofa', 'გამრავლება და გაყოფა', '➗', 'ცხრილი 6–9, გაყოფა და ნაშთი.', 'teal', [

    {
      title: 'გამრავლება 6–9',
      subtopics: [
        { id: 'cxrili', title: 'ცხრილი 6–9', summary: 'დიდი გამრავლების ცხრილი' },
      ],
    },
    {
      title: 'გაყოფა',
      subtopics: [
        { id: 'gayofa', title: 'გაყოფა და ნაშთი', summary: 'უნაშთო და ნაშთიანი გაყოფა' },
      ],
    },
  ]),
  topic('amocanebi', 'ტექსტური ამოცანები', '📖', 'ერთ და ორმოქმედებიანი ამოცანები.', 'blue', [

    {
      title: 'ერთმოქმედებიანი',
      subtopics: [
        { id: 'ert', title: 'ერთმოქმედებიანი', summary: 'ერთი მოქმედებით ამოხსნა' },
      ],
    },
    {
      title: 'ორმოქმედებიანი',
      subtopics: [
        { id: 'ori', title: 'ორმოქმედებიანი', summary: 'ორი ნაბიჯის დაგეგმვა' },
      ],
    },
  ]),
  topic('perimetri', 'პერიმეტრი და ფართობი', '📐', 'კვადრატი, მართკუთხედი, სამკუთხედი.', 'pink', [

    {
      title: 'პერიმეტრი',
      subtopics: [
        { id: 'perim', title: 'პერიმეტრი', summary: 'გვერდების ჯამი' },
      ],
    },
    {
      title: 'ფართობი',
      subtopics: [
        { id: 'fartobi', title: 'ფართობი', summary: 'კვადრატული სანტიმეტრი და მეტრი' },
      ],
    },
  ]),
];

const g4: Topic[] = [
  topic('didi-ricxvebi', 'მრავალნიშნა რიცხვები', '🔟', 'თანრიგები და დამრგვალება.', 'blue', [

    {
      title: 'თანრიგები',
      subtopics: [
        { id: 'tanrigi', title: 'თანრიგები', summary: 'ათასეული, ასეული, ათეული' },
      ],
    },
    {
      title: 'დამრგვალება',
      subtopics: [
        { id: 'damrgvaleba', title: 'დამრგვალება', summary: 'უახლოეს ათეულამდე და ასეულამდე' },
      ],
    },
  ]),
  topic('wiladebi', 'წილადები — საწყისი', '🍕', 'მთელის წილი და წილადების შედარება.', 'yellow', [

    {
      title: 'მთელი წილი',
      subtopics: [
        { id: 'wili', title: 'მთელის წილი', summary: '1/2, 1/3, 1/4 რიცხვიდან' },
      ],
    },
    {
      title: 'შედარება',
      subtopics: [
        { id: 'shedareba', title: 'წილადების შედარება', summary: 'ერთი და იგივე მთელი' },
      ],
    },
  ]),
  topic('mozraoba', 'მოძრაობის ამოცანები', '🚌', 'სიჩქარე, დრო და მანძილი.', 'teal', [

    {
      title: 'სიჩქარე და დრო',
      subtopics: [
        { id: 'sichqare', title: 'სიჩქარე და დრო', summary: 'v = s ÷ t' },
      ],
    },
    {
      title: 'მანძილი',
      subtopics: [
        { id: 'mandzili', title: 'მანძილი', summary: 's = v × t' },
      ],
    },
  ]),
];

const g5: Topic[] = [
  topic('wiladebi', 'წილადები', '🧁', 'სხვადასხვა მნიშვნელი და შერეული რიცხვები.', 'yellow', [

    {
      title: 'სხვადასხვა მნიშვნელი',
      subtopics: [
        { id: 'mniSvneli', title: 'სხვადასხვა მნიშვნელი', summary: 'საერთო მნიშვნელი და მოქმედებები' },
      ],
    },
    {
      title: 'შერეული რიცხვები',
      subtopics: [
        { id: 'sereuli', title: 'შერეული რიცხვები', summary: 'მთელი და წილადი ნაწილი' },
      ],
    },
  ]),
  topic('proporciebi', 'პროპორციები', '⚖️', 'მასშტაბი და პროპორციული დამოკიდებულება.', 'violet', [

    {
      title: 'მასშტაბი',
      subtopics: [
        { id: 'masStabi', title: 'მასშტაბი', summary: 'რუკა და ნახატი' },
      ],
    },
    {
      title: 'სამი წესი',
      subtopics: [
        { id: 'sami', title: 'სამი წესი', summary: 'ცნობილი სიდიდეებიდან უცნობის პოვნა' },
      ],
    },
  ]),
  topic('kuTxeebi', 'კუთხეები და სამკუთხედები', '📐', 'კუთხის სახეები და კუთხეების ჯამი.', 'pink', [

    {
      title: 'კუთხეების სახეები',
      subtopics: [
        { id: 'kuTxe', title: 'კუთხის სახეები', summary: 'მახვილი, მართი, ბლაგვი' },
      ],
    },
    {
      title: 'სამკუთხედის კუთხეები',
      subtopics: [
        { id: 'jami', title: 'სამკუთხედის კუთხეები', summary: '180° წესი' },
      ],
    },
  ]),
];

const g6: Topic[] = [
  topic('racionaluri', 'რაციონალური რიცხვები', '➖', 'უარყოფითი რიცხვები და მოქმედებები.', 'violet', [

    {
      title: 'უარყოფითი რიცხვები',
      subtopics: [
        { id: 'uaryofa', title: 'უარყოფითი რიცხვები', summary: 'რიცხვითი ღერძი და მოდული' },
      ],
    },
    {
      title: 'მოქმედებები ნიშნებით',
      subtopics: [
        { id: 'moqmedeba', title: 'მოქმედებები ნიშნებით', summary: 'შეკრება, გამოკლება, გამრავლება' },
      ],
    },
  ]),
  topic('procenti', 'პროცენტები', '％', 'რიცხვის პროცენტი და ფასდაკლება.', 'teal', [

    {
      title: 'რიცხვის პროცენტი',
      subtopics: [
        { id: 'povna', title: 'რიცხვის პროცენტი', summary: 'p% რიცხვიდან' },
      ],
    },
    {
      title: 'ფასდაკლება',
      subtopics: [
        { id: 'fasdakleba', title: 'ფასდაკლება', summary: 'ფასის შემცირება და ახალი ფასი' },
      ],
    },
  ]),
  topic('gamartiveba', 'ალგებრული გამოსახულებები', '🧩', 'მსგავსი წევრები და მარტივი განტოლებები.', 'blue', [

    {
      title: 'გამარტივება',
      subtopics: [
        { id: 'gamartiveba', title: 'გამარტივება', summary: 'მსგავსი წევრების შეკრება' },
      ],
    },
    {
      title: 'განტოლება',
      subtopics: [
        { id: 'gantoleba', title: 'მარტივი განტოლება', summary: 'x-ის პოვნა' },
      ],
    },
  ]),
];

const g7: Topic[] = [
  topic('xazovani', 'ხაზოვანი განტოლებები', '🟰', 'განტოლების ამოხსნა და ტექსტური ამოცანები.', 'blue', [

    {
      title: 'ამოხსნა',
      subtopics: [
        { id: 'ertucnobiani', title: 'ამოხსნა', summary: 'x ორივე მხარეს' },
      ],
    },
    {
      title: 'ტექსტური ამოცანა',
      subtopics: [
        { id: 'amocana', title: 'ტექსტური ამოცანა', summary: 'ამოცანის გადაყვანა განტოლებად' },
      ],
    },
  ]),
  topic('damokidebuleba', 'ფუნქცია და გრაფიკი', '📈', 'კოორდინატები და წრფივი ფუნქცია.', 'violet', [

    {
      title: 'კოორდინატები',
      subtopics: [
        { id: 'koordinatebi', title: 'კოორდინატები', summary: 'სიბრტყე და წერტილები' },
      ],
    },
    {
      title: 'გრაფიკი',
      subtopics: [
        { id: 'grafiki', title: 'წრფივი გრაფიკი', summary: 'y = kx + b' },
      ],
    },
  ]),
  topic('geometria', 'გეომეტრია', '🔷', 'ფართობი და მოცულობა.', 'pink', [

    {
      title: 'ფართობი',
      subtopics: [
        { id: 'fartobi', title: 'ფართობი', summary: 'სამკუთხედი, პარალელოგრამი, წრე' },
      ],
    },
    {
      title: 'მოცულობა',
      subtopics: [
        { id: 'moculoba', title: 'მოცულობა', summary: 'კუბი და პარალელეპიპედი' },
      ],
    },
  ]),
];

export const CURRICULUM: GradeCurriculum[] = [
  { grade: 1, roman: 'I', label: 'I კლასი', ageHint: '6–7 წელი', topics: g1 },
  { grade: 2, roman: 'II', label: 'II კლასი', ageHint: '7–8 წელი', topics: g2 },
  { grade: 3, roman: 'III', label: 'III კლასი', ageHint: '8–9 წელი', topics: g3 },
  { grade: 4, roman: 'IV', label: 'IV კლასი', ageHint: '9–10 წელი', topics: g4 },
  { grade: 5, roman: 'V', label: 'V კლასი', ageHint: '10–11 წელი', topics: g5 },
  { grade: 6, roman: 'VI', label: 'VI კლასი', ageHint: '11–12 წელი', topics: g6 },
  { grade: 7, roman: 'VII', label: 'VII კლასი', ageHint: '12–13 წელი', topics: g7 },
];

export function getGrade(grade: GradeId): GradeCurriculum {
  return CURRICULUM.find((item) => item.grade === grade) ?? CURRICULUM[0];
}

export function getTopic(grade: GradeId, topicId: string): Topic | undefined {
  return getGrade(grade).topics.find((item) => item.id === topicId);
}

/** Every subtopic of a topic, flattened across its units. */
export function topicSubtopicsOf(topic: Topic): Subtopic[] {
  return topicSubtopics(topic);
}

export function getSubtopic(grade: GradeId, topicId: string, subtopicId: string) {
  const topic = getTopic(grade, topicId);
  return topic ? topicSubtopics(topic).find((item) => item.id === subtopicId) : undefined;
}

export function getUnit(
  grade: GradeId,
  topicId: string,
  unitId: string,
): Unit | undefined {
  return getTopic(grade, topicId)?.units.find((unit) => unit.id === unitId);
}

/** All subtopics flattened, in curriculum order. */
export function allSubtopics(): Array<{
  grade: GradeId;
  topic: Topic;
  unit: Unit;
  subtopic: Subtopic;
}> {
  return CURRICULUM.flatMap((grade) =>
    grade.topics.flatMap((topic) =>
      topic.units.flatMap((unit) =>
        unit.subtopics.map((subtopic) => ({ grade: grade.grade, topic, unit, subtopic })),
      ),
    ),
  );
}

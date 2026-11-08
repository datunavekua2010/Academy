import type { GradeCurriculum, GradeId, Topic } from './types';

/**
 * Placeholder curriculum (Grades I–VII).
 *
 * Structure is final: Grade → Topic → Subtopic → Questions. The actual topic
 * list will be replaced when the academy sends the real curriculum; because
 * every question is stored against these ids, only this file and the question
 * bank need to change.
 */

const topic = (
  id: string,
  title: string,
  emoji: string,
  summary: string,
  tone: Topic['tone'],
  subtopics: Array<{ id: string; title: string; summary: string }>,
): Topic => ({ id, title, emoji, summary, tone, subtopics });

const g1: Topic[] = [
  topic('ricxvebi', 'რიცხვები და დათვლა', '🔢', 'რიცხვები 20-მდე, დათვლა და შედარება.', 'blue', [
    { id: 'datvla', title: 'დათვლა და მიმდევრობა', summary: 'რიცხვების რიგი და მეზობლები' },
    { id: 'shedareba', title: 'რიცხვების შედარება', summary: 'მეტი, ნაკლები, ტოლი' },
  ]),
  topic('shekreba', 'შეკრება და გამოკლება', '➕', 'მოქმედებები 20-ის ფარგლებში.', 'teal', [
    { id: 'atamde', title: 'მოქმედებები 10-მდე', summary: 'შეკრება და გამოკლება ერთნიშნა რიცხვებით' },
    { id: 'ocamde', title: 'მოქმედებები 20-მდე', summary: 'ათეულის გავლით შეკრება' },
  ]),
  topic('forma', 'ფორმები და ლოგიკა', '🔺', 'გეომეტრიული ფორმები და კანონზომიერებები.', 'yellow', [
    { id: 'amocnoba', title: 'ფორმების ამოცნობა', summary: 'გვერდები, კუთხეები, სახელები' },
    { id: 'tanmimdevroba', title: 'თანმიმდევრობა', summary: 'კანონზომიერების გაგრძელება' },
  ]),
];

const g2: Topic[] = [
  topic('shekreba100', 'შეკრება და გამოკლება 100-მდე', '🧮', 'ორნიშნა რიცხვები ათეულის გავლით.', 'blue', [
    { id: 'ateusit', title: 'ათეულის გავლით', summary: '47 + 25 ტიპის მოქმედებები' },
    { id: 'amocana', title: 'სიტყვიერი ამოცანები', summary: 'მოკლე ტექსტური ამოცანები' },
  ]),
  topic('gamravleba', 'გამრავლება', '✖️', 'გამრავლების ცხრილი და თანაბარი ჯგუფები.', 'teal', [
    { id: 'cxrili', title: 'გამრავლების ცხრილი 2–5', summary: '2, 3, 4 და 5-ის ცხრილი' },
    { id: 'jgufi', title: 'თანაბარი ჯგუფები', summary: 'დაყოფა თანაბარ ნაწილებად' },
  ]),
  topic('gazomva', 'გაზომვები', '📏', 'სიგრძე და დრო.', 'yellow', [
    { id: 'sigrze', title: 'სიგრძე', summary: 'სანტიმეტრი და მეტრი' },
    { id: 'dro', title: 'დრო', summary: 'საათი და წუთი' },
  ]),
];

const g3: Topic[] = [
  topic('gamravleba-gayofa', 'გამრავლება და გაყოფა', '➗', 'ცხრილი 6–9, გაყოფა და ნაშთი.', 'teal', [
    { id: 'cxrili', title: 'ცხრილი 6–9', summary: 'დიდი გამრავლების ცხრილი' },
    { id: 'gayofa', title: 'გაყოფა და ნაშთი', summary: 'უნაშთო და ნაშთიანი გაყოფა' },
  ]),
  topic('amocanebi', 'ტექსტური ამოცანები', '📖', 'ერთ და ორმოქმედებიანი ამოცანები.', 'blue', [
    { id: 'ert', title: 'ერთმოქმედებიანი', summary: 'ერთი მოქმედებით ამოხსნა' },
    { id: 'ori', title: 'ორმოქმედებიანი', summary: 'ორი ნაბიჯის დაგეგმვა' },
  ]),
  topic('perimetri', 'პერიმეტრი და ფართობი', '📐', 'კვადრატი, მართკუთხედი, სამკუთხედი.', 'pink', [
    { id: 'perim', title: 'პერიმეტრი', summary: 'გვერდების ჯამი' },
    { id: 'fartobi', title: 'ფართობი', summary: 'კვადრატული სანტიმეტრი და მეტრი' },
  ]),
];

const g4: Topic[] = [
  topic('didi-ricxvebi', 'მრავალნიშნა რიცხვები', '🔟', 'თანრიგები და დამრგვალება.', 'blue', [
    { id: 'tanrigi', title: 'თანრიგები', summary: 'ათასეული, ასეული, ათეული' },
    { id: 'damrgvaleba', title: 'დამრგვალება', summary: 'უახლოეს ათეულამდე და ასეულამდე' },
  ]),
  topic('wiladebi', 'წილადები — საწყისი', '🍕', 'მთელის წილი და წილადების შედარება.', 'yellow', [
    { id: 'wili', title: 'მთელის წილი', summary: '1/2, 1/3, 1/4 რიცხვიდან' },
    { id: 'shedareba', title: 'წილადების შედარება', summary: 'ერთი და იგივე მთელი' },
  ]),
  topic('mozraoba', 'მოძრაობის ამოცანები', '🚌', 'სიჩქარე, დრო და მანძილი.', 'teal', [
    { id: 'sichqare', title: 'სიჩქარე და დრო', summary: 'v = s ÷ t' },
    { id: 'mandzili', title: 'მანძილი', summary: 's = v × t' },
  ]),
];

const g5: Topic[] = [
  topic('wiladebi', 'წილადები', '🧁', 'სხვადასხვა მნიშვნელი და შერეული რიცხვები.', 'yellow', [
    { id: 'mniSvneli', title: 'სხვადასხვა მნიშვნელი', summary: 'საერთო მნიშვნელი და მოქმედებები' },
    { id: 'sereuli', title: 'შერეული რიცხვები', summary: 'მთელი და წილადი ნაწილი' },
  ]),
  topic('proporciebi', 'პროპორციები', '⚖️', 'მასშტაბი და პროპორციული დამოკიდებულება.', 'violet', [
    { id: 'masStabi', title: 'მასშტაბი', summary: 'რუკა და ნახატი' },
    { id: 'sami', title: 'სამი წესი', summary: 'ცნობილი სიდიდეებიდან უცნობის პოვნა' },
  ]),
  topic('kuTxeebi', 'კუთხეები და სამკუთხედები', '📐', 'კუთხის სახეები და კუთხეების ჯამი.', 'pink', [
    { id: 'kuTxe', title: 'კუთხის სახეები', summary: 'მახვილი, მართი, ბლაგვი' },
    { id: 'jami', title: 'სამკუთხედის კუთხეები', summary: '180° წესი' },
  ]),
];

const g6: Topic[] = [
  topic('racionaluri', 'რაციონალური რიცხვები', '➖', 'უარყოფითი რიცხვები და მოქმედებები.', 'violet', [
    { id: 'uaryofa', title: 'უარყოფითი რიცხვები', summary: 'რიცხვითი ღერძი და მოდული' },
    { id: 'moqmedeba', title: 'მოქმედებები ნიშნებით', summary: 'შეკრება, გამოკლება, გამრავლება' },
  ]),
  topic('procenti', 'პროცენტები', '％', 'რიცხვის პროცენტი და ფასდაკლება.', 'teal', [
    { id: 'povna', title: 'რიცხვის პროცენტი', summary: 'p% რიცხვიდან' },
    { id: 'fasdakleba', title: 'ფასდაკლება', summary: 'ფასის შემცირება და ახალი ფასი' },
  ]),
  topic('gamartiveba', 'ალგებრული გამოსახულებები', '🧩', 'მსგავსი წევრები და მარტივი განტოლებები.', 'blue', [
    { id: 'gamartiveba', title: 'გამარტივება', summary: 'მსგავსი წევრების შეკრება' },
    { id: 'gantoleba', title: 'მარტივი განტოლება', summary: 'x-ის პოვნა' },
  ]),
];

const g7: Topic[] = [
  topic('xazovani', 'ხაზოვანი განტოლებები', '🟰', 'განტოლების ამოხსნა და ტექსტური ამოცანები.', 'blue', [
    { id: 'ertucnobiani', title: 'ამოხსნა', summary: 'x ორივე მხარეს' },
    { id: 'amocana', title: 'ტექსტური ამოცანა', summary: 'ამოცანის გადაყვანა განტოლებად' },
  ]),
  topic('damokidebuleba', 'ფუნქცია და გრაფიკი', '📈', 'კოორდინატები და წრფივი ფუნქცია.', 'violet', [
    { id: 'koordinatebi', title: 'კოორდინატები', summary: 'სიბრტყე და წერტილები' },
    { id: 'grafiki', title: 'წრფივი გრაფიკი', summary: 'y = kx + b' },
  ]),
  topic('geometria', 'გეომეტრია', '🔷', 'ფართობი და მოცულობა.', 'pink', [
    { id: 'fartobi', title: 'ფართობი', summary: 'სამკუთხედი, პარალელოგრამი, წრე' },
    { id: 'moculoba', title: 'მოცულობა', summary: 'კუბი და პარალელეპიპედი' },
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

export function getSubtopic(grade: GradeId, topicId: string, subtopicId: string) {
  return getTopic(grade, topicId)?.subtopics.find((item) => item.id === subtopicId);
}

/** All subtopics flattened, in curriculum order. */
export function allSubtopics(): Array<{
  grade: GradeId;
  topic: Topic;
  subtopic: { id: string; title: string; summary: string };
}> {
  return CURRICULUM.flatMap((grade) =>
    grade.topics.flatMap((topic) =>
      topic.subtopics.map((subtopic) => ({ grade: grade.grade, topic, subtopic })),
    ),
  );
}

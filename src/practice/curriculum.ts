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
  units: Array<{ id?: string; code?: string; title: string; subtopics: SubtopicSeed[] }>,
): Topic => ({
  id,
  title,
  emoji,
  summary,
  tone,
  units: units.map((unit, index) => ({
    id: unit.id ?? `u${index + 1}`,
    // An explicit code preserves the academy's own numbering (U01…U16) when
    // several units sit inside one topic.
    code: unit.code ?? `U${index + 1}`,
    title: unit.title,
    subtopics: unit.subtopics,
  })),
});

const g1: Topic[] = [
  topic('mdebareoba', 'მდებარეობა და შედარება', '🧭', 'მარცხენა, მარჯვენა, ზემოთ, ქვემოთ და სიდიდეების შედარება.', 'blue', [
    {
      id: 'mdebareoba',
      code: 'U01',
      title: 'მდებარეობა და შედარება',
      subtopics: [
        { id: 'marcxena-marjvena', title: 'მარცხენა, შუა, მარჯვენა', summary: 'სად დგას ობიექტი რიგში' },
        { id: 'zeda-qveda', title: 'ზემოთ, ქვემოთ, გვერდით', summary: 'ზემოთ, ქვემოთ, გვერდით, შუაში' },
        { id: 'grZeli-mokle', title: 'გრძელი და მოკლე', summary: 'სიგრძის შედარება' },
        { id: 'magle-dabali', title: 'მაღალი და დაბალი', summary: 'სიმაღლის შედარება' },
        { id: 'mZime-msubuqi', title: 'მძიმე და მსუბუქი', summary: 'მასის შედარება' },
        { id: 'gansieri-vicki', title: 'განიერი და ვიწრო', summary: 'სიგანის შედარება' },
        { id: 'yvela-rame', title: 'ყველა და რამდენიმე', summary: 'მთლიანი და ნაწილი' },
        { id: 'datvla-suratebidan', title: 'დათვლა სურათიდან', summary: 'რამდენია სურათზე?' },
      ],
    },
  ]),
  topic('ricxvebi20', 'რიცხვები 20-მდე', '🔢', 'რიცხვები 1-დან 20-მდე, რიგობითი რიცხვები, ლუწი და კენტი.', 'teal', [
    {
      id: 'ricxvebi20',
      code: 'U02',
      title: 'რიცხვები 20-მდე',
      subtopics: [
        { id: 'ricxvebi1-10', title: 'რიცხვები 1-დან 10-მდე', summary: 'რიცხვების დასახელება და წერა' },
        { id: 'ricxvebi11-20', title: 'რიცხვები 11-დან 20-მდე', summary: 'ათეული და ერთეულები 20-მდე' },
        { id: 'rigobiti', title: 'რიგობითი რიცხვები', summary: 'პირველი, მეორე, მესამე…' },
        { id: 'win-nak', title: 'წინ და შემდეგ', summary: 'რიცხვის მეზობლები' },
        { id: 'udidesi-umciresti', title: 'უდიდესი და უმცირესი', summary: 'რიცხვების შედარება' },
        { id: 'ricxviTi-xazi20', title: 'რიცხვითი ღერძი 20-მდე', summary: 'რიცხვების განლაგება ღერძზე' },
        { id: 'luwi-kenti', title: 'ლუწი და კენტი', summary: 'ლუწი და კენტი რიცხვები' },
      ],
    },
  ]),
  topic('datvla', 'დათვლა', '🖐️', 'დათვლა წინ და უკან, ათეულებით და ნაბიჯებით.', 'yellow', [
    {
      id: 'datvla',
      code: 'U03',
      title: 'დათვლა',
      subtopics: [
        { id: 'sruli-datvla', title: 'ობიექტების დათვლა', summary: 'სურათზე მოცემული ობიექტების დათვლა' },
        { id: 'win-ukan', title: 'დათვლა წინ და უკან', summary: 'მიმდევრობა ორივე მიმართულებით' },
        { id: '100-mde', title: 'დათვლა 100-მდე', summary: 'რიცხვების რიგი 100-მდე' },
        { id: 'atobit-nabijebit', title: 'დათვლა ათეულებით', summary: 'ათეულებით და სხვა ნაბიჯებით დათვლა' },
        { id: 'sagvnebamde', title: 'მიზნობრივ რიცხვამდე', summary: 'რამდენი უნდა დავამატო მიზნამდე' },
        { id: 'airCe-da-daTvale', title: 'აირჩიე და დათვალე', summary: 'ობიექტების შერჩევა და დათვლა' },
      ],
    },
  ]),
  topic('ricxvebi100', 'რიცხვები 100-მდე', '💯', 'ასეულის ცხრილი, ათეულები და ერთეულები, რომაული ციფრები.', 'pink', [
    {
      id: 'ricxvebi100',
      code: 'U04',
      title: 'რიცხვები 100-მდე',
      subtopics: [
        { id: 'aseulis-cxrili', title: 'ასეულის ცხრილი', summary: 'რიცხვების განლაგება ცხრილში' },
        { id: 'ateulebi-erteulebi', title: 'ათეულები და ერთეულები', summary: 'ორნიშნა რიცხვის აგებულება' },
        { id: 'ricxvebi-sityvebiT', title: 'რიცხვები სიტყვებით', summary: 'რიცხვის სახელის წერა' },
        { id: 'ricxviTi-xazi100', title: 'რიცხვითი ღერძი 100-მდე', summary: 'რიცხვების განლაგება ღერძზე' },
        { id: 'mezoblebi', title: 'მეზობლები: 10 და 20 შორის', summary: 'რიცხვამდე და შემდეგ, 10 ან 20 შორის' },
        { id: 'romaulti', title: 'რომაული ციფრები', summary: 'I, V, X, L' },
        { id: 'luwi-kenti-danayi', title: 'ლუწისა და კენტის დალაგება', summary: 'მონიშვნა და განაწილება' },
        { id: 'cifrebi-asoebi', title: 'ციფრები და ასოები', summary: 'სიმბოლოების განაწილება' },
      ],
    },
  ]),
  topic('Sedareba', 'შედარება და დალაგება', '⚖️', 'მეტი, ნაკლები, ტოლი; დალაგება და შეფასება.', 'violet', [
    {
      id: 'Sedareba',
      code: 'U05',
      title: 'შედარება და დალაგება',
      subtopics: [
        { id: 'meti-naklebi-toli', title: 'მეტი, ნაკლები, ტოლი', summary: 'შედარების ნიშნები' },
        { id: 'Sedareba10', title: 'შედარება 10-მდე', summary: 'ერთნიშნა რიცხვების შედარება' },
        { id: 'Sedareba100', title: 'შედარება 100-მდე', summary: 'ორნიშნა რიცხვების შედარება' },
        { id: 'ramdenit-meti', title: 'რამდენით მეტი?', summary: 'სხვაობის პოვნა' },
        { id: 'SeFaseba-aTeulamde', title: 'შეფასება ათეულამდე', summary: 'უახლოეს ათეულამდე დამრგვალება' },
        { id: 'dalageba', title: 'დალაგება ზრდით და კლებით', summary: 'რიცხვების მიმდევრობა' },
        { id: 'dalageba-danayi', title: 'რიცხვების დალაგება', summary: 'მონიშვნა და განაწილება' },
        { id: 'toli-raodenoba', title: 'ტოლი და შერეული რაოდენობა', summary: 'ტოლი ჯგუფები' },
      ],
    },
  ]),
  topic('Sekreba', 'შეკრება', '➕', 'შეკრების მნიშვნელობა, ამოცანები და ცხრილი.', 'blue', [
    {
      id: 'Sekreba',
      code: 'U06',
      title: 'შეკრება',
      subtopics: [
        { id: 'ra-aris-Sekreba', title: 'რას ნიშნავს შეკრება', summary: 'შეკრების არსი' },
        { id: 'SuratiT-10', title: 'შეკრება სურათებით 10-მდე', summary: 'სურათებით შეკრება' },
        { id: 'teqsti', title: 'ტექსტური ამოცანები', summary: 'ამოცანის ამოკითხვა და შეკრება' },
        { id: 'ricxviT-xazze', title: 'შეკრება რიცხვით ღერძზე', summary: 'ღერძზე გადაადგილება' },
        { id: 'nuli-gakvireba', title: '0-ის დამატება და გაორმაგება', summary: 'ნულთან შეკრება და ორმაგი' },
        { id: 'cxrili-20', title: 'ჯამები 20-მდე ცხრილით', summary: 'შეკრების ცხრილი' },
        { id: 'uknobi-SeSveTi', title: 'უცნობი შესაკრები', summary: 'რომელი რიცხვი აკლია' },
        { id: 'martalia-tu-ara', title: 'მართალია თუ არა', summary: 'ტოლობის შემოწმება' },
        { id: 'raodenobis-gzebi', title: 'რიცხვის მიღების გზები', summary: 'სხვადასხვა შესაკრებით' },
        { id: 'samive-ze-meti', title: 'სამი და მეტი რიცხვის შეკრება', summary: 'რამდენიმე ერთნიშნა რიცხვი' },
        { id: 'SeSveTebis-arCevani', title: 'შესაკრებების არჩევა', summary: 'მონიშვნა და განაწილება' },
        { id: 'Sekreba-cxrili-Sevseba', title: 'შეკრების ცხრილის შევსება', summary: 'ცხრილის შევსება' },
      ],
    },
  ]),
  topic('Gamokleba', 'გამოკლება', '➖', 'გამოკლების მნიშვნელობა, ამოცანები და ცხრილი.', 'teal', [
    {
      id: 'Gamokleba',
      code: 'U07',
      title: 'გამოკლება',
      subtopics: [
        { id: 'ra-aris-Gamokleba', title: 'რას ნიშნავს გამოკლება', summary: 'გამოკლების არსი და წევრები' },
        { id: 'SuratiT-10-gamokleba', title: 'გამოკლება სურათებით 10-მდე', summary: 'სურათებით გამოკლება' },
        { id: 'teqsti-gamokleba', title: 'ტექსტური ამოცანები გამოკლებით', summary: 'ამოცანის ამოკითხვა' },
        { id: 'xazze-gamokleba', title: 'გამოკლება რიცხვით ღერძზე', summary: 'ღერძზე გადაადგილება' },
        { id: 'nuli-taviT-gamokleba', title: '0-ისა და თავისი თავის გამოკლება', summary: 'ნულისა და ნახევრის შემთხვევა' },
        { id: 'cxrili-20-gamokleba', title: 'სხვაობები 20-მდე ცხრილით', summary: 'გამოკლების ცხრილი' },
        { id: 'uknobi-ricxvi', title: 'უცნობი რიცხვი', summary: 'რომელი რიცხვი აკლია' },
        { id: 'martalia-tu-ara-gamokleba', title: 'მართალია თუ არა', summary: 'ტოლობის შემოწმება' },
        { id: 'gamoakeli-raodenoba', title: 'გამოკლებით რიცხვის მიღება', summary: 'სხვადასხვა გზა' },
        { id: 'ramdenit-naklebi', title: 'რამდენით ნაკლები?', summary: 'სხვაობის პოვნა' },
        { id: 'Cevrebi-arCevani', title: 'საკლები და თვლადის არჩევა', summary: 'მონიშვნა და განაწილება' },
        { id: 'gamokleba-cxrili-Sevseba', title: 'გამოკლების ცხრილის შევსება', summary: 'ცხრილის შევსება' },
      ],
    },
  ]),
  topic('ateulebi-orcifra', 'ათეულები და ორნიშნა რიცხვები', '🔟', 'ათეულების შეკრება, გამოკლება და გადაჯგუფება.', 'yellow', [
    {
      id: 'ateulebi-orcifra',
      code: 'U08',
      title: 'ათეულები და ორნიშნა რიცხვები',
      subtopics: [
        { id: 'ateulebi-ateulebi', title: 'ათეულს პლუს ათეული', summary: 'ათეულების შეკრება' },
        { id: 'ateulebis-gamokleba', title: 'ათეულების გამოკლება', summary: 'ათეულების გამოკლება' },
        { id: 'orcifra-ertcifra', title: 'ორნიშნა პლუს ერთნიშნა', summary: 'გადაჯგუფების გარეშე' },
        { id: 'gadajgufebiT', title: 'ორნიშნა პლუს ერთნიშნა გადაჯგუფებით', summary: 'გადაჯგუფებით შეკრება' },
        { id: 'esveTis-chamowerTa', title: 'ორნიშნა მინუს ერთნიშნა', summary: 'სვეტური ჩაწერა' },
        { id: 'nulidan-9-mde', title: '0-დან 9-მდე გამოკლება', summary: 'ერთნიშნა გამოკლება' },
        { id: 'aszeulSi', title: 'ათეულების შეკრება და გამოკლება 100-ში', summary: '100-ის ფარგლებში' },
        { id: 'Sedareba-10Tan', title: 'ჯამების შედარება 10-თან', summary: 'შედეგების შედარება' },
        { id: 'ricxviTi-gamocanebi', title: 'რიცხვითი თავსატეხები', summary: 'მონიშვნა და განაწილება' },
      ],
    },
  ]),
  topic('Sereuli-amocanebi', 'შერეული ამოცანები', '🧩', 'შეკრებისა და გამოკლების თვისებები და ამოცანები.', 'pink', [
    {
      id: 'Sereuli-amocanebi',
      code: 'U09',
      title: 'შერეული ამოცანები',
      subtopics: [
        { id: 'Tvisebebi', title: 'შეკრებისა და გამოკლების თვისებები', summary: 'კანონები და კავშირი' },
        { id: 'romeli-moqmedeba', title: 'რომელი მოქმედება?', summary: 'მოქმედების არჩევა' },
        { id: '20-mde', title: 'შეკრება და გამოკლება 20-მდე', summary: 'შერეული მაგალითები' },
        { id: 'ori-nabiji', title: 'ორნაბიჯიანი მაგალითები', summary: 'ორი მოქმედება' },
        { id: 'martali-tolobebi', title: 'მართალი ტოლობები', summary: 'ტოლობის შემოწმება' },
        { id: 'jami-sxvaoba', title: 'ჯამი და სხვაობა', summary: 'წევრების დასახელება' },
        { id: 'Sedareba-jamebi', title: 'ჯამებისა და სხვაობების შედარება', summary: 'შედეგების შედარება' },
        { id: 'Sekreba-gamokleba-Tavsatexi', title: 'შეკრება-გამოკლების თავსატეხები', summary: 'მონიშვნა და განაწილება' },
      ],
    },
  ]),
  topic('raodenobis-modeli', 'რაოდენობის მოდელები', '🧱', 'ათეულებისა და ერთეულების მოდელები.', 'violet', [
    {
      id: 'raodenobis-modeli',
      code: 'U10',
      title: 'რაოდენობის მოდელები',
      subtopics: [
        { id: 'ateuli-erteuli-modeli', title: 'ათეულისა და ერთეულის მოდელი', summary: 'მოდელის აგება' },
        { id: 'modelidan-ricxvi', title: 'რიცხვი მოდელიდან', summary: 'მოდელის წაკითხვა' },
        { id: 'ricxvidan-modeli', title: 'მოდელი რიცხვიდან', summary: 'მოდელის დახატვა' },
        { id: 'ateulidan-erteulebamde', title: 'ათეულიდან ერთეულებამდე და უკან', summary: 'გარდაქმნა' },
        { id: 'sawyisi-raodenoba', title: 'საჭირო რაოდენობის პოვნა', summary: 'მოცემული რაოდენობის შევსება' },
      ],
    },
  ]),
  topic('kanonzomiereba', 'კანონზომიერებები', '🔁', 'გამეორებადი და მზარდი მიმდევრობები.', 'blue', [
    {
      id: 'kanonzomiereba',
      code: 'U11',
      title: 'კანონზომიერებები',
      subtopics: [
        { id: 'gameorebadi', title: 'გამეორებადი კანონზომიერება', summary: 'მიმდევრობის გაგრძელება' },
        { id: 'mzardi', title: 'მზარდი კანონზომიერება', summary: 'ზრდადი მიმდევრობა' },
        { id: 'wesis-agwera', title: 'წესის აღწერა', summary: 'კანონზომიერების ახსნა' },
        { id: 'ricxviTi-mimdevroba', title: 'რიცხვითი მიმდევრობები', summary: 'რიცხვების რიგი' },
      ],
    },
  ]),
  topic('geometria', 'გეომეტრია', '🔷', 'ბრტყელი და მოცულობითი ფორმები, გვერდები და კუთხეები.', 'teal', [
    {
      id: 'geometria',
      code: 'U12',
      title: 'გეომეტრია',
      subtopics: [
        { id: 'brtyeli-formebi', title: 'ბრტყელი ფორმები', summary: 'ფიგურების ამოცნობა' },
        { id: 'moculobiti-formebi', title: 'მოცულობითი ფორმები', summary: 'სივრცითი ფიგურები' },
        { id: 'gverdebi-kutxebi', title: 'გვერდებისა და კუთხეების შედარება', summary: 'ფიგურების შედარება' },
        { id: 'gverdebis-datvla', title: 'გვერდებისა და კუთხეების დათვლა', summary: 'რამდენი გვერდი აქვს' },
        { id: 'gaRia-daxuruli', title: 'ღია და დახურული ფორმები', summary: 'კონტურის ტიპი' },
        { id: 'msgavsi-formebi', title: 'მსგავსი ფორმები', summary: 'მსგავსების პოვნა' },
        { id: 'formebi-cxovrebaSi', title: 'ფორმები ყოველდღიურ ცხოვრებაში', summary: 'ობიექტის ფორმა' },
        { id: 'formebiT-agwera', title: 'ობიექტის აღწერა ფორმებით', summary: 'აღწერა ფორმების მიხედვით' },
        { id: 'simetria', title: 'სიმეტრია', summary: 'სიმეტრიული ფიგურები' },
      ],
    },
  ]),
  topic('dro', 'დრო', '🕐', 'საათი, კვირის დღეები, თვეები და დროის ამოცანები.', 'yellow', [
    {
      id: 'dro',
      code: 'U13',
      title: 'დრო',
      subtopics: [
        { id: 'saatis-wakitxva', title: 'საათის კითხვა', summary: 'საათის ჩვენება' },
        { id: 'kviris-dgeebi', title: 'კვირის დღეები', summary: 'დღეების რიგი' },
        { id: 'Tveebi-seasonebi', title: 'თვეები და სეზონები', summary: 'თვეების რიგი' },
        { id: 'drois-amocanebi', title: 'დროის ამოცანები', summary: 'დროის გამოთვლა' },
        { id: 'sxva-dro', title: 'სხვა დროის პოვნა', summary: 'დროის შეცვლა' },
      ],
    },
  ]),
  topic('fasebi', 'ფული', '🪙', 'მონეტების ღირებულება და ფულის ამოცანები.', 'pink', [
    {
      id: 'fasebi',
      code: 'U14',
      title: 'ფული',
      subtopics: [
        { id: 'monetebis-vertoba', title: 'მონეტების ღირებულება და დათვლა', summary: 'მონეტების ჯამი' },
        { id: 'fulis-amocanebi', title: 'ფულის ამოცანები', summary: 'ყიდვის ამოცანები' },
        { id: 'tolzRvari-monetebi', title: 'ტოლღირებული მონეტები', summary: 'ეკვივალენტური მონეტები' },
        { id: 'tanxaTa-Sedareba', title: 'თანხების შედარება', summary: 'მეტი ან ნაკლები თანხა' },
        { id: 'yvelaze-cota-monetebi', title: 'ყველაზე ცოტა მონეტა', summary: 'მინიმალური მონეტები' },
        { id: 'sakmarisi-fuli', title: 'საკმარისია თუ არა?', summary: 'თანხის შედარება' },
      ],
    },
  ]),
  topic('toli-nawilebi', 'ტოლი ნაწილები', '🍰', 'გაყოფა დიაგრამით და ტოლი ნაწილები.', 'violet', [
    {
      id: 'toli-nawilebi',
      code: 'U15',
      title: 'ტოლი ნაწილები',
      subtopics: [
        { id: 'diagramiT-gayofa', title: 'გაყოფა დიაგრამით', summary: 'ნაწილებად დაყოფა' },
        { id: 'toli-nawilebi-2', title: 'ტოლი ნაწილები', summary: 'ნაწილების ტოლობა' },
      ],
    },
  ]),
  topic('logikuri-azrovneba', 'ლოგიკური აზროვნება', '🧠', 'წესით შერჩევა, გამორიცხვა და სასწორი.', 'blue', [
    {
      id: 'logikuri-azrovneba',
      code: 'U16',
      title: 'ლოგიკური აზროვნება',
      subtopics: [
        { id: 'ferebi-wesis-mixedviT', title: 'ფერების არჩევა წესით', summary: 'წესის დაცვა' },
        { id: 'gamoricxva', title: 'გამორიცხვა', summary: 'არასწორის გამორიცხვა' },
        { id: 'sascori', title: 'სასწორი', summary: 'წონის შედარება' },
        { id: 'Cafiqrebuli-ricxvi', title: 'ჩაფიქრებული რიცხვი', summary: 'რიცხვის გამოცნობა' },
      ],
    },
  ]),
];

const g2: Topic[] = [
  topic('g2-ricxvebi100', 'რიცხვები 100-მდე', '💯', 'ასეულის ცხრილი, რიცხვები სიტყვებით, რიგობითი რიცხვები, ათეულები და ერთეულები, რომაული ციფრები.', 'blue', [
    {
      id: 'g2-ricxvebi100',
      code: 'U01',
      title: 'რიცხვები 100-მდე',
      subtopics: [
        { id: 'u01-hundred-chart', title: 'ასეულის ცხრილი', summary: 'რიცხვების განლაგება ასეულის ცხრილში' },
        { id: 'u01-numbers-in-words', title: 'რიცხვები სიტყვებით', summary: 'რიცხვების ჩაწერა და წაკითხვა სიტყვებით' },
        { id: 'u01-ordinal-numbers', title: 'რიგობითი რიცხვები', summary: 'პირველი, მეორე, მესამე და რიგში მდებარეობა' },
        { id: 'u01-tens-and-ones', title: 'ათეულები და ერთეულები', summary: 'ორნიშნა რიცხვის შემადგენლობა: ათეულები და ერთეულები' },
        { id: 'u01-before-and-after', title: 'წინ და შემდეგ', summary: 'რიცხვის წინა და მომდევნო მეზობლები' },
        { id: 'u01-number-line-100', title: 'რიცხვითი ღერძი 100-მდე', summary: 'რიცხვების განლაგება რიცხვით ღერძზე' },
        { id: 'u01-largest-and-smallest', title: 'უდიდესი და უმცირესი', summary: 'უდიდესი და უმცირესი რიცხვის პოვნა' },
        { id: 'u01-roman-numerals', title: 'რომაული ციფრები I, V, X, L', summary: 'რომაული ციფრების მნიშვნელობა და ჩაწერა' },
      ],
    },
  ]),
  topic('g2-datvla-mimdevroba', 'დათვლა და მიმდევრობები', '🔢', 'ლუწი და კენტი, ობიექტების დათვლა, ნაბიჯებითა და ცხრილებით დათვლა, რიცხვითი მიმდევრობები.', 'teal', [
    {
      id: 'g2-datvla-mimdevroba',
      code: 'U02',
      title: 'დათვლა და მიმდევრობები',
      subtopics: [
        { id: 'u02-even-and-odd', title: 'ლუწი და კენტი', summary: 'ლუწი და კენტი რიცხვების ამოცნობა' },
        { id: 'u02-counting-objects', title: 'ობიექტების დათვლა', summary: 'საგნების დათვლა და რაოდენობის განსაზღვრა' },
        { id: 'u02-counting-with-steps', title: 'დათვლა ნაბიჯებით', summary: 'დათვლა 2-ით, 3-ით, 5-ით და 10-ით' },
        { id: 'u02-counting-with-tables', title: 'დათვლა ცხრილებით', summary: 'მონაცემების დათვლა ცხრილის დახმარებით' },
        { id: 'u02-number-sequences', title: 'რიცხვითი მიმდევრობები', summary: 'მიმდევრობის კანონზომიერების გაგრძელება' },
        { id: 'u02-moves-on-number-line', title: 'გადაადგილება რიცხვით ღერძზე', summary: 'ნაბიჯები წინ და უკან რიცხვით ღერძზე' },
        { id: 'u02-sorting-even-odd', title: 'ლუწისა და კენტის დალაგება', summary: 'ლუწი და კენტი რიცხვების დაჯგუფება' },
      ],
    },
  ]),
  topic('g2-ertnishna-moqmedebebi', 'მოქმედებები ერთნიშნა რიცხვებზე', '➕', 'ერთნიშნა რიცხვების შეკრება-გამოკლება, გაორმაგება და განახევრება, ტოლობები.', 'yellow', [
    {
      id: 'g2-ertnishna-moqmedebebi',
      code: 'U03',
      title: 'მოქმედებები ერთნიშნა რიცხვებზე',
      subtopics: [
        { id: 'u03-single-digit-add-sub', title: 'ერთნიშნა რიცხვების შეკრება და გამოკლება', summary: 'ერთნიშნა რიცხვების შეკრება-გამოკლება და მოქმედებების ჯაჭვი' },
        { id: 'u03-doubling-and-halving', title: 'გაორმაგება და განახევრება', summary: 'რიცხვის გაორმაგება და ნახევრის პოვნა' },
        { id: 'u03-adding-to-20-pictures', title: 'შეკრება 20-ის ფარგლებში სურათებითა და ცხრილებით', summary: 'შეკრება ვიზუალური მოდელებითა და ცხრილებით' },
        { id: 'u03-subtracting-to-20-pictures', title: 'გამოკლება 20-ის ფარგლებში სურათებითა და ცხრილებით', summary: 'გამოკლება ვიზუალური მოდელებითა და ცხრილებით' },
        { id: 'u03-adding-subtracting-zero', title: 'ნულის დამატება და გამოკლება', summary: 'ნულის თვისებები მოქმედებებში' },
        { id: 'u03-missing-digit', title: 'გამოტოვებული რიცხვი ტოლობაში', summary: 'უცნობი შესაკრებისა და მაკლების პოვნა' },
        { id: 'u03-true-or-false', title: 'ჭეშმარიტი და მცდარი ტოლობები', summary: 'ტოლობის სისწორის შემოწმება' },
        { id: 'u03-adding-three-digits', title: 'რამდენიმე ერთნიშნა რიცხვის შეკრება', summary: 'სამი და ოთხი შესაკრების შეკრება შეჯგუფებით' },
        { id: 'u03-adding-four-or-more', title: 'ოთხი ან მეტი ერთნიშნა რიცხვის შეკრება', summary: 'რამდენიმე ერთნიშნა რიცხვის შეკრება და შედარება' },
        { id: 'u03-mixed-review', title: 'შერეული გამეორება', summary: 'განვლილი მასალის შემაჯამებელი ვარჯიშები' },
      ],
    },
  ]),
  topic('g2-ornishna-sekreba', 'ორნიშნა რიცხვების შეკრება', '🧮', 'ათეულების შეკრება, შეკრება გადაჯგუფებით და მის გარეშე, ტექსტური ამოცანები.', 'pink', [
    {
      id: 'g2-ornishna-sekreba',
      code: 'U04',
      title: 'ორნიშნა რიცხვების შეკრება',
      subtopics: [
        { id: 'u04-adding-tens', title: 'ათეულების შეკრება', summary: 'სრული ათეულების შეკრება' },
        { id: 'u04-without-regrouping', title: 'ორნიშნა რიცხვების შეკრება გადაჯგუფების გარეშე', summary: 'ორნიშნა რიცხვების შეკრება ათეულის გადასვლის გარეშე' },
        { id: 'u04-with-regrouping', title: 'ორნიშნა რიცხვების შეკრება გადაჯგუფებით', summary: 'ორნიშნა რიცხვების შეკრება ათეულის გადასვლით' },
        { id: 'u04-addition-table-100', title: 'შეკრების ცხრილი 100-ის ფარგლებში', summary: 'შეკრების ცხრილის გამოყენება' },
        { id: 'u04-ways-to-make-number', title: 'რიცხვის სხვადასხვა შესაკრებად წარმოდგენა', summary: 'რიცხვის სხვადასხვა შესაკრებად დაშლა' },
        { id: 'u04-word-problems-expressions', title: 'სურათიდან გამოსახულებისა და ამოცანის შედგენა', summary: 'ტექსტური ამოცანები და გამოსახულებები სურათებიდან' },
        { id: 'u04-missing-addend', title: 'გამოტოვებული შესაკრები', summary: 'უცნობი შესაკრების პოვნა' },
        { id: 'u04-comparing-examples', title: 'ჯამების შედარება', summary: 'ჯამების გამოთვლა და შედარება' },
        { id: 'u04-adding-three-numbers', title: 'სამი ან მეტი რიცხვის შეკრება', summary: 'სამი ან მეტი რიცხვის შეკრება და თანმიმდევრობა' },
        { id: 'u04-missing-digits', title: 'გამოტოვებული ციფრები შეკრების ტოლობაში', summary: 'ციფრების აღდგენა შეკრებისას' },
      ],
    },
  ]),
  topic('g2-ornishna-gamokleba', 'ორნიშნა რიცხვების გამოკლება', '➖', 'ათეულების გამოკლება, გამოკლება გადაჯგუფებით და მის გარეშე, ტექსტური ამოცანები.', 'violet', [
    {
      id: 'g2-ornishna-gamokleba',
      code: 'U05',
      title: 'ორნიშნა რიცხვების გამოკლება',
      subtopics: [
        { id: 'u05-subtracting-tens', title: 'ათეულების გამოკლება', summary: 'სრული ათეულების გამოკლება' },
        { id: 'u05-without-regrouping', title: 'ორნიშნა რიცხვების გამოკლება ათეულის დაშლის გარეშე', summary: 'ორნიშნა რიცხვების გამოკლება ათეულის დაშლის გარეშე' },
        { id: 'u05-with-regrouping', title: 'ორნიშნა რიცხვების გამოკლება ათეულის დაშლით', summary: 'ორნიშნა რიცხვების გამოკლება ათეულის დაშლით' },
        { id: 'u05-expressions-from-pictures', title: 'გამოსახულებები სურათების მიხედვით', summary: 'გამოკლების ჩაწერა სურათის მიხედვით' },
        { id: 'u05-subtraction-table-100', title: 'გამოკლების ცხრილი 100-ის ფარგლებში', summary: 'გამოკლების ცხრილის გამოყენება' },
        { id: 'u05-word-problems', title: 'სიტყვიერი ამოცანები', summary: 'სხვაობის პოვნის ამოცანები' },
        { id: 'u05-ways-to-make-number', title: 'რიცხვის მიღების გზები გამოკლებით', summary: 'სხვაობის მიღების სხვადასხვა ხერხი' },
        { id: 'u05-comparing-examples', title: 'გამოკლებების შედარება', summary: 'სხვაობათა შედარება' },
        { id: 'u05-filling-table', title: 'ცხრილის შევსება გადათრევით', summary: 'გამოკლების ცხრილის შევსება' },
        { id: 'u05-three-digit-numbers', title: 'სამნიშნა რიცხვები: გამოკლების საწყისი წარმოდგენა', summary: 'გამოკლება 100-ზე მეტი რიცხვებიდან' },
      ],
    },
  ]),
  topic('g2-shedareba-dalageba', 'შედარება და დალაგება', '⚖️', '100-მდე და 1000-მდე რიცხვების შედარება და დალაგება, ჯამებისა და სხვაობების შედარება.', 'blue', [
    {
      id: 'g2-shedareba-dalageba',
      code: 'U06',
      title: 'შედარება და დალაგება',
      subtopics: [
        { id: 'u06-comparing-to-100', title: 'რიცხვების შედარება 100-ის ფარგლებში', summary: 'ორნიშნა რიცხვების შედარება: >, <, =' },
        { id: 'u06-largest-smallest-group', title: 'უდიდესი და უმცირესი რიცხვი', summary: 'უდიდესი და უმცირესი რიცხვის პოვნა ჩამონათვალში' },
        { id: 'u06-ordering-to-100', title: 'რიცხვების ზრდადობითა და კლებადობით დალაგება 100-მდე', summary: 'ორნიშნა რიცხვების დალაგება ზრდით ან კლებით' },
        { id: 'u06-comparing-tens-ones', title: 'ათეულებისა და ერთეულების შედარება', summary: 'თანრიგების შედარება' },
        { id: 'u06-comparing-sums-differences', title: 'ჯამებისა და სხვაობების შედარება', summary: 'გამოსახულებათა მნიშვნელობების შედარება' },
        { id: 'u06-comparing-to-1000', title: 'რიცხვების შედარება 1000-ის ფარგლებში', summary: 'სამნიშნა რიცხვების შედარება' },
        { id: 'u06-ordering-to-1000', title: 'რიცხვების დალაგება 1000-ის ფარგლებში', summary: 'სამნიშნა რიცხვების დალაგება' },
        { id: 'u06-sorting-more-less', title: 'რიცხვების დახარისხება: მეტი და ნაკლები', summary: 'რიცხვების განაწილება მეტი/ნაკლები კატეგორიებში' },
        { id: 'u06-ordering-drag-drop', title: 'რიცხვების დალაგება გადათრევა-ჩასმით', summary: 'რიცხვითი რიგის შედგენა გადატანით' },
        { id: 'u06-comparing-two-digit-drag', title: 'ორნიშნა რიცხვების შედარება გადათრევა-ჩასმით', summary: 'შედარების ნიშნების ჩასმა გადატანით' },
      ],
    },
  ]),
  topic('g2-raodenobis-modelebi', 'რაოდენობის მოდელები', '🧊', 'ათეულების და ერთეულების ბლოკები, მოდელიდან რიცხვი, შეკრება მოდელებით.', 'teal', [
    {
      id: 'g2-raodenobis-modelebi',
      code: 'U07',
      title: 'რაოდენობის მოდელები',
      subtopics: [
        { id: 'u07-number-from-model', title: 'რიცხვის ამოცნობა მოდელიდან', summary: 'მოდელზე გამოსახული რაოდენობის ამოცნობა' },
        { id: 'u07-model-from-number', title: 'მოდელის შექმნა მოცემული რიცხვისთვის', summary: 'მოცემული რიცხვის შესაბამისი მოდელის შერჩევა' },
        { id: 'u07-shaded-part-number', title: 'გაფერადებული ნაწილის რაოდენობა', summary: 'გაფერადებული უჯრებისა და ნაწილების დათვლა' },
        { id: 'u07-grouping-tens-ones', title: 'დაჯგუფება ათეულებად და ერთეულებად', summary: 'რაოდენობის ათეულებად და ერთეულებად დაჯგუფება' },
        { id: 'u07-adding-with-models', title: 'შეკრება მოდელების გამოყენებით', summary: 'შეკრების შესრულება თვალსაჩინო მოდელებით' },
        { id: 'u07-required-quantity', title: 'საჭირო რაოდენობის პოვნა', summary: 'მოდელის შესავსებად საჭირო რაოდენობის პოვნა' },
      ],
    },
  ]),
  topic('g2-mravalnabijiani-amocanebi', 'მრავალსაფეხურიანი ამოცანები', '🪜', 'ტოლობების გათანაბრება, შეკრება-გამოკლება 100-მდე, ფრჩხილები, მანძილის ამოცანები.', 'yellow', [
    {
      id: 'g2-mravalnabijiani-amocanebi',
      code: 'U08',
      title: 'მრავალსაფეხურიანი ამოცანები',
      subtopics: [
        { id: 'u08-equalizing-sums-diffs', title: 'ჯამებისა და სხვაობების გათანაბრება', summary: 'ორივე მხარის გათანაბრება' },
        { id: 'u08-ways-to-add-subtract', title: 'შეკრებისა და გამოკლების სხვადასხვა ხერხი', summary: 'მოხერხებული ხერხებით გამოთვლა' },
        { id: 'u08-true-false-equalities', title: 'ჭეშმარიტი და მცდარი ტოლობები', summary: 'ტოლობის ჭეშმარიტების შემოწმება' },
        { id: 'u08-add-subtract-within-100', title: 'შეკრება და გამოკლება 100-ის ფარგლებში', summary: 'შერეული მოქმედებები 100-ის ფარგლებში' },
        { id: 'u08-table-rules-100', title: 'ცხრილის წესის პოვნა', summary: 'ცხრილის წესის ამოცნობა და გაგრძელება' },
        { id: 'u08-placing-plus-minus', title: 'შეკრებისა და გამოკლების ნიშნების ჩასმა', summary: 'სწორი მოქმედების ნიშნის შერჩევა' },
        { id: 'u08-which-in-order', title: 'გამოსახულებების დალაგება', summary: 'გამოსახულებათა შედეგების დალაგება' },
        { id: 'u08-word-problems-multistep', title: 'ტექსტური და მრავალსაფეხურიანი ამოცანები', summary: 'ამოცანები ორ ან მეტ ნაბიჯში' },
        { id: 'u08-equalizing-quantities', title: 'რაოდენობების გათანაბრება', summary: 'საგნების გადანაწილება გათანაბრებისთვის' },
        { id: 'u08-distance-problems', title: 'მანძილის ამოცანები', summary: 'გავლილი მანძილის გამოთვლა' },
        { id: 'u08-brackets', title: 'ფრჩხილები გამოსახულებებში', summary: 'ფრჩხილებიანი გამოსახულებების გამოთვლა' },
        { id: 'u08-sorting-add-subtract', title: 'შეკრებისა და გამოკლების დალაგება', summary: 'მაგალითების დაჯგუფება და დალაგება' },
      ],
    },
  ]),
  topic('g2-damrgvaleba', 'დამრგვალება', '🎯', 'უახლოეს 5-მდე, 10-მდე, 20-მდე დამრგვალება; ჯამებისა და სხვაობების დამრგვალება.', 'pink', [
    {
      id: 'g2-damrgvaleba',
      code: 'U09',
      title: 'დამრგვალება',
      subtopics: [
        { id: 'u09-nearest-5', title: 'დამრგვალება უახლოეს 5-მდე', summary: 'რიცხვის დამრგვალება უახლოეს 5-ის ჯერადამდე' },
        { id: 'u09-nearest-10', title: 'დამრგვალება უახლოეს 10-მდე', summary: 'რიცხვის დამრგვალება უახლოეს ათეულამდე' },
        { id: 'u09-nearest-20', title: 'დამრგვალება უახლოეს 20-მდე', summary: 'რიცხვის დამრგვალება უახლოეს 20-ის ჯერადამდე' },
        { id: 'u09-rounding-sums', title: 'ჯამების დამრგვალება', summary: 'ჯამის გამოთვლა და დამრგვალება' },
        { id: 'u09-rounding-differences', title: 'სხვაობების დამრგვალება', summary: 'სხვაობის გამოთვლა და დამრგვალება' },
      ],
    },
  ]),
  topic('g2-monacemebi-albatoba', 'მონაცემები და ალბათობა', '📊', 'ცხრილები, ჩანიშვნა (ჭდეები), პიქტოგრამები, სვეტოვანი და წერტილოვანი დიაგრამები, ალბათობა.', 'violet', [
    {
      id: 'g2-monacemebi-albatoba',
      code: 'U10',
      title: 'მონაცემები და ალბათობა',
      subtopics: [
        { id: 'u10-choosing-tables-charts', title: 'ცხრილებისა და დიაგრამების არჩევა', summary: 'მონაცემების შესაფერისი წარმოდგენა' },
        { id: 'u10-tally-marks', title: 'აღრიცხვის ნიშნები', summary: 'მონაცემების აღრიცხვა ხუთეულებად' },
        { id: 'u10-collecting-data', title: 'მონაცემების შეგროვება', summary: 'ინფორმაციის მოძიება და ორგანიზება' },
        { id: 'u10-pictograms', title: 'პიქტოგრამები', summary: 'სურათებიანი დიაგრამის წაკითხვა და გამოთვლა' },
        { id: 'u10-bar-charts', title: 'სვეტოვანი დიაგრამები', summary: 'სვეტოვანი დიაგრამის ანალიზი' },
        { id: 'u10-dot-plots', title: 'წერტილოვანი დიაგრამები', summary: 'მონაცემები წერტილოვან დიაგრამაზე' },
        { id: 'u10-more-less-equally-likely', title: 'უფრო მეტად, ნაკლებად ან თანაბრად მოსალოდნელი', summary: 'მოვლენის ალბათობის შეფასება' },
        { id: 'u10-possible-impossible', title: 'შესაძლებელი და შეუძლებელი მოვლენები', summary: 'შესაძლებელი და შეუძლებელი მოვლენები' },
        { id: 'u10-changing-chances', title: 'ალბათობის ცვლილება', summary: 'როგორ იცვლება მოვლენის შანსი' },
      ],
    },
  ]),
  topic('g2-gazomva-geometria', 'გაზომვა და გეომეტრია', '📐', 'მეტრი და სანტიმეტრი, მასა, თერმომეტრი, ბრტყელი და სივრცითი ფიგურები, პერიმეტრი, სიმეტრია.', 'blue', [
    {
      id: 'g2-gazomva-geometria',
      code: 'U11',
      title: 'გაზომვა და გეომეტრია',
      subtopics: [
        { id: 'u11-meters-and-centimeters', title: 'მეტრი და სანტიმეტრი', summary: 'სიგრძის ერთეულები: მ და სმ' },
        { id: 'u11-units-of-length', title: 'სიგრძის საზომი ერთეულები', summary: 'სიგრძის გაზომვა და შედარება' },
        { id: 'u11-units-of-weight', title: 'წონის საზომი ერთეულები', summary: 'კილოგრამი და გრამი' },
        { id: 'u11-thermometer', title: 'თერმომეტრი და ტემპერატურა', summary: 'ტემპერატურის წაკითხვა გრადუსებში' },
        { id: 'u11-flat-and-solid-shapes', title: 'ბრტყელი და სივრცული ფიგურები', summary: '2D და 3D გეომეტრიული ფიგურები' },
        { id: 'u11-perimeter', title: 'პერიმეტრი', summary: 'ფიგურის გვერდების სიგრძეთა ჯამი' },
        { id: 'u11-counting-sides', title: 'გვერდების დათვლა', summary: 'მრავალკუთხედის გვერდების რაოდენობა' },
        { id: 'u11-counting-angles', title: 'კუთხეების დათვლა', summary: 'მრავალკუთხედის კუთხეების რაოდენობა' },
        { id: 'u11-grouping-by-sides', title: 'ფიგურების დაჯგუფება გვერდების მიხედვით', summary: 'ფიგურების კლასიფიკაცია გვერდებით' },
        { id: 'u11-inside-and-outside', title: 'შიგნით და გარეთ', summary: 'არეების გარჩევა: შიგნით, გარეთ, საზღვარზე' },
        { id: 'u11-equal-shapes', title: 'ტოლი ფიგურები', summary: 'ტოლი და მსგავსი ფიგურების ამოცნობა' },
        { id: 'u11-symmetry', title: 'სიმეტრია', summary: 'სიმეტრიის ღერძი და სიმეტრიული ფიგურები' },
        { id: 'u11-mixed-review', title: 'შერეული გამეორება', summary: 'გაზომვისა და გეომეტრიის შემაჯამებელი სავარჯიშოები' },
      ],
    },
  ]),
  topic('g2-fuli', 'ფული', '🪙', 'თეთრები და ლარები, მონეტების დათვლა, უმცირესი რაოდენობის მონეტები, თანხების შეკრება-გამოკლება.', 'teal', [
    {
      id: 'g2-fuli',
      code: 'U12',
      title: 'ფული',
      subtopics: [
        { id: 'u12-counting-tetri', title: 'თეთრების დათვლა', summary: 'მონეტების რაოდენობისა და ჯამის გამოთვლა' },
        { id: 'u12-counting-money', title: 'თანხის დათვლა', summary: 'ფასებისა და თანხების დათვლა' },
        { id: 'u12-minimum-coins', title: 'თანხის შედგენა მონეტების მინიმალური რაოდენობით', summary: 'თანხის შედგენა უმცირესი რაოდენობის მონეტებით' },
        { id: 'u12-equivalent-amounts', title: 'თანაბარი ღირებულების თანხები', summary: 'თანხის სხვადასხვა მონეტებით წარმოდგენა' },
        { id: 'u12-money-addition-subtraction', title: 'თანხების შეკრება და გამოკლება', summary: 'ფულადი თანხების შეკრება და გამოკლება' },
        { id: 'u12-comparing-money', title: 'თანხების შედარება', summary: 'რომელი თანხაა მეტი ან ნაკლები' },
        { id: 'u12-sufficient-funds', title: 'საკმარისი თანხა', summary: 'გვეყოფა თუ არა ფული ნივთის საყიდლად' },
        { id: 'u12-making-one-lari', title: '1 ლარის შედგენა', summary: '100 თეთრი = 1 ლარი' },
        { id: 'u12-estimating-money', title: 'თანხის მიახლოებითი შეფასება', summary: 'მიახლოებითი ფასის განსაზღვრა და დამრგვალება' },
        { id: 'u12-mixed-review', title: 'შერეული გამეორება', summary: 'ფულის თემის შემაჯამებელი სავარჯიშოები' },
      ],
    },
  ]),
  topic('g2-dro', 'დრო', '⏰', 'ისრიანი და ელექტრონული საათი, კვირის დღეები, თვეები და სეზონები, კალენდარი.', 'yellow', [
    {
      id: 'g2-dro',
      code: 'U13',
      title: 'დრო',
      subtopics: [
        { id: 'u13-analog-digital-clocks', title: 'ანალოგური და ციფრული საათი', summary: 'ისრიანი და ელექტრონული საათის წაკითხვა' },
        { id: 'u13-comparing-clocks', title: 'საათების შედარება', summary: 'ადრე, გვიან და დროის შედარება' },
        { id: 'u13-days-of-week', title: 'კვირის დღეები', summary: 'კვირის დღეების თანმიმდევრობა' },
        { id: 'u13-seasons-and-months', title: 'წელიწადის დროები და თვეები', summary: 'სეზონები და შესაბამისი თვეები' },
        { id: 'u13-days-in-each-month', title: 'დღეები თითოეულ თვეში', summary: 'დღეების რაოდენობა სხვადასხვა თვეში' },
        { id: 'u13-calendar', title: 'კალენდარი', summary: 'კალენდრის გამოყენება და თარიღის გამოთვლა' },
        { id: 'u13-comparing-times', title: 'დროების შედარება', summary: 'დროის მონაკვეთებისა და ხანგრძლივობის შედარება' },
        { id: 'u13-time-spent', title: 'დახარჯული დრო', summary: 'აქტივობების ხანგრძლივობის გამოთვლა' },
        { id: 'u13-time-units-sequence', title: 'დროის ერთეულები და თანმიმდევრობა', summary: 'წუთი, საათი, დღე-ღამე და დროის გადაყვანა' },
        { id: 'u13-mixed-review', title: 'შერეული სავარჯიშოები', summary: 'დროის თემის შემაჯამებელი სავარჯიშოები' },
      ],
    },
  ]),
  topic('g2-kanonzomiereba-logika', 'კანონზომიერება და ლოგიკა', '🧩', 'განმეორებადი და მზარდი მიმდევრობები, გამორიცხვა, სასწორი, ჩაფიქრებული რიცხვი.', 'pink', [
    {
      id: 'g2-kanonzomiereba-logika',
      code: 'U14',
      title: 'კანონზომიერება და ლოგიკა',
      subtopics: [
        { id: 'u14-repeating-patterns', title: 'განმეორებადი კანონზომიერება', summary: 'ფიგურებისა და ფერების პერიოდული წესი' },
        { id: 'u14-growing-patterns', title: 'მზარდი კანონზომიერება', summary: 'კანონზომიერება ზრდადი ნაბიჯით' },
        { id: 'u14-describing-the-rule', title: 'წესის აღწერა', summary: 'მიმდევრობის წესის სიტყვიერი ჩამოყალიბება' },
        { id: 'u14-number-triangles', title: 'რიცხვითი სამკუთხედები', summary: 'კანონზომიერება რიცხვით ფიგურებში' },
        { id: 'u14-number-guessing', title: 'რიცხვის გამოცნობა', summary: 'რიცხვის პოვნა მინიშნებების მიხედვით' },
        { id: 'u14-word-coding', title: 'სიტყვების კოდირება', summary: 'სიმბოლოებითა და ციფრებით კოდირება' },
        { id: 'u14-age-problems', title: 'ასაკის ამოცანები', summary: 'ასაკობრივი სხვაობები და წლების გასვლა' },
        { id: 'u14-elimination', title: 'გამორიცხვა', summary: 'ზედმეტის პოვნა თვისების მიხედვით' },
        { id: 'u14-color-choice', title: 'ფერის არჩევა', summary: 'ფერის შერჩევა წესის მიხედვით' },
        { id: 'u14-balance-scales', title: 'სასწორი', summary: 'წონასწორობა და წონების შედარება' },
        { id: 'u14-elimination-harder', title: 'გამორიცხვა (რთული)', summary: 'რამდენიმე თვისების გათვალისწინებით გამორიცხვა' },
        { id: 'u14-thought-of-number', title: 'ჩაფიქრებული რიცხვი', summary: 'უცნობი რიცხვის პოვნა შებრუნებული მოქმედებით' },
        { id: 'u14-matching-conditions', title: 'პირობების შეხამება', summary: 'ლოგიკური მსჯელობა და შესაბამისობის დადგენა' },
      ],
    },
  ]),
  topic('g2-wiladebi', 'წილადები', '🍕', 'მთელის ნაწილები, ნახევარი, მესამედი და მეოთხედი.', 'violet', [
    {
      id: 'g2-wiladebi',
      code: 'U15',
      title: 'წილადები',
      subtopics: [
        { id: 'u15-parts-of-a-whole', title: 'მთელის ნაწილები', summary: 'მთელის დაყოფა თანაბარ ნაწილებად' },
        { id: 'u15-halves', title: 'ნახევარი', summary: 'მთელის ორ ტოლ ნაწილად გაყოფა — 1/2' },
        { id: 'u15-thirds', title: 'მესამედი', summary: 'მთელის სამ ტოლ ნაწილად გაყოფა — 1/3' },
        { id: 'u15-quarters', title: 'მეოთხედი', summary: 'მთელის ოთხ ტოლ ნაწილად გაყოფა — 1/4' },
      ],
    },
  ]),
];

const g3: Topic[] = [
  topic('g3-ricxvebi100', 'რიცხვები 100-მდე', '💯', 'ასეულთა ცხრილი, რიცხვები სიტყვიერად, რიგობითი რიცხვები, ათეულები და ერთეულები, წინა და მომდევნო რიცხვები, რიცხვითი ღერძი, უდიდესი და უმცირესი რიცხვები, რომაული ციფრები I, V, X, L.', 'blue', [
    {
      id: 'g3-ricxvebi100',
      code: 'U01',
      title: 'რიცხვები 100-მდე',
      subtopics: [
        { id: 'u01-hundred-chart', title: 'ასეულთა ცხრილი', summary: 'ასეულთა ცხრილში ორიენტაცია და გამოტოვებული უჯრები' },
        { id: 'u01-numbers-in-words', title: 'რიცხვები სიტყვიერად', summary: 'რიცხვების ჩაწერა და წაკითხვა სიტყვებით' },
        { id: 'u01-ordinal-numbers', title: 'რიგობითი რიცხვები', summary: 'რიგობითი რიცხვები და პოზიცია რიგში' },
        { id: 'u01-tens-and-ones', title: 'ათეულები და ერთეულები', summary: 'ორნიშნა რიცხვის დაშლა ათეულებად და ერთეულებად' },
        { id: 'u01-before-and-after', title: 'წინა და მომდევნო რიცხვები', summary: 'წინა, მომდევნო და მეზობელი რიცხვები' },
        { id: 'u01-number-line', title: 'რიცხვითი ღერძი 100-მდე', summary: 'რიცხვები რიცხვით ღერძზე და ნაბიჯებით გადაადგილება' },
        { id: 'u01-largest-and-smallest', title: 'უდიდესი და უმცირესი რიცხვები', summary: 'რიცხვების შედარება და დალაგება' },
        { id: 'u01-roman-numerals', title: 'რომაული ციფრები I, V, X, L', summary: 'რომაული ციფრების ცნობა და ჩაწერა' },
      ],
    },
  ]),
  topic('g3-tvla-mimdevrobebi', 'თვლა და რიცხვითი მიმდევრობები', '🔢', 'ლუწი და კენტი რიცხვები, საგნების დათვლა, ბიჯებით თვლა, ცხრილებით თვლა, რიცხვითი მიმდევრობები, რიცხვით ღერძზე გადაადგილება, ლუწ/კენტ რიცხვთა დახარისხება.', 'yellow', [
    {
      id: 'g3-tvla-mimdevrobebi',
      code: 'U02',
      title: 'თვლა და რიცხვითი მიმდევრობები',
      subtopics: [
        { id: 'u02-even-odd', title: 'ლუწი და კენტი რიცხვები', summary: 'ლუწი და კენტი რიცხვების ცნობა და შევსება' },
        { id: 'u02-counting-objects', title: 'საგნების დათვლა', summary: 'საგნების რაოდენობის გამოთვლა რიგებისა და ჯგუფების მიხედვით' },
        { id: 'u02-skip-counting', title: 'ბიჯებით თვლა', summary: 'წინ და უკან ბიჯებით თვლა და ნაბიჯების გამოთვლა' },
        { id: 'u02-counting-tables', title: 'თვლა ცხრილების გამოყენებით', summary: 'კანონზომიერების პოვნა და ცხრილის შევსება' },
        { id: 'u02-number-patterns', title: 'რიცხვითი მიმდევრობები', summary: 'მიმდევრობის წესის დადგენა და გამოტოვებული რიცხვის პოვნა' },
        { id: 'u02-number-line-movement', title: 'გადაადგილება რიცხვით ღერძზე', summary: 'რიცხვით ღერძზე წინ და უკან გადაადგილება' },
        { id: 'u02-sorting-even-odd', title: 'ლუწი და კენტი რიცხვების დახარისხება', summary: 'რიცხვების დაჯგუფება და დახარისხება ლუწ-კენტობით' },
      ],
    },
  ]),
  topic('g3-ertnishna-moqmedebebi', 'ერთნიშნა რიცხვებზე მოქმედებები', '➕➖', 'ერთნიშნა რიცხვების შეკრება და გამოკლება, გაორმაგება და განახევრება, 20-ის ფარგლებში მოქმედებები, ნულის თვისებები, გამოტოვებული რიცხვები, ჭეშმარიტი/მცდარი ტოლობები, რამდენიმე რიცხვის შეკრება.', 'green', [
    {
      id: 'g3-ertnishna-moqmedebebi',
      code: 'U03',
      title: 'ერთნიშნა რიცხვებზე მოქმედებები',
      subtopics: [
        { id: 'u03-single-digit-addition', title: 'ერთნიშნა რიცხვების შეკრება', summary: 'ერთნიშნა რიცხვების შეკრება 20-ის ფარგლებში' },
        { id: 'u03-single-digit-subtraction', title: 'ერთნიშნა რიცხვების გამოკლება', summary: 'ერთნიშნა რიცხვების გამოკლება 20-ის ფარგლებში' },
        { id: 'u03-doubling-halving', title: 'გაორმაგება და განახევრება', summary: 'რიცხვის გაორმაგება და განახევრება' },
        { id: 'u03-addition-within-20', title: 'შეკრება 20-ის ფარგლებში სურათებითა და ცხრილებით', summary: 'შეკრება სურათებით, ცხრილებითა და ტექსტური ამოცანებით' },
        { id: 'u03-subtraction-within-20', title: 'გამოკლება 20-ის ფარგლებში სურათებითა და ცხრილებით', summary: 'გამოკლება სურათებით, ცხრილებითა და ტექსტური ამოცანებით' },
        { id: 'u03-adding-subtracting-zero', title: 'ნულის მიმატება და გამოკლება', summary: 'ნულის მიმატება და გამოკლება, ტოლობის შევსება' },
        { id: 'u03-missing-number-equality', title: 'გამოტოვებული რიცხვი ტოლობაში', summary: 'უცნობი კომპონენტის პოვნა ტოლობაში' },
        { id: 'u03-true-or-false', title: 'ჭეშმარიტი თუ მცდარი', summary: 'ტოლობის ჭეშმარიტების დადგენა' },
        { id: 'u03-adding-three-numbers', title: 'სამი ერთნიშნა რიცხვის შეკრება', summary: 'სამი ერთნიშნა რიცხვის შეკრება' },
        { id: 'u03-adding-four-or-more', title: 'ოთხი ან მეტი ერთნიშნა რიცხვის შეკრება', summary: 'ოთხი ან მეტი ერთნიშნა რიცხვის შეკრება' },
      ],
    },
  ]),
  topic('g3-gamravleba', 'გამრავლება', '✖️', 'გამრავლების ცხრილი, უცნობი თანამამრავლი, მრგვალ რიცხვებზე გამრავლება.', 'teal', [
    {
      id: 'g3-gamravleba',
      code: 'U04',
      title: 'გამრავლება',
      subtopics: [
        { id: 'u04-facts-0-to-5', title: 'გამრავლება 0-დან 5-მდე', summary: 'გამრავლების ფაქტები 0-დან 5-მდე' },
        { id: 'u04-facts-6-to-10', title: 'გამრავლება 6-დან 10-მდე', summary: 'გამრავლების ფაქტები 6-დან 10-მდე' },
        { id: 'u04-full-table', title: 'გამრავლების სრული ცხრილი', summary: 'გამრავლების მთლიანი ცხრილი' },
        { id: 'u04-unknown-factors', title: 'უცნობი თანამამრავლი', summary: 'უცნობი მამრავლის პოვნა' },
        { id: 'u04-round-numbers', title: 'მრგვალ რიცხვებზე გამრავლება', summary: 'ათეულებზე და ასეულებზე გამრავლება' },
        { id: 'u04-single-digit-products', title: 'ერთნიშნა რიცხვებზე ნამრავლი', summary: 'ნამრავლის გამოთვლა' },
        { id: 'u04-rectangular-tables', title: 'მართკუთხა ცხრილები და ილუსტრაციები', summary: 'გამრავლების მოდელები და ცხრილები' },
        { id: 'u04-addition-multiplication-relation', title: 'კავშირი შეკრებასა და გამრავლებას შორის', summary: 'განმეორებითი შეკრება როგორც გამრავლება' },
        { id: 'u04-multiplying-same-number', title: 'იმავე რიცხვზე გამრავლება', summary: 'კვადრატული რიცხვები და გამრავლება' },
        { id: 'u04-tens-hundreds-multiplication', title: 'ათეულებისა და ასეულების გამრავლება', summary: 'დიდი რიცხვების გამრავლება' },
        { id: 'u04-table-filling', title: 'გამრავლების ცხრილის შევსება', summary: 'ცხრილის შევსება ნამრავლებით' },
      ],
    },
  ]),
  topic('g3-gayofa', 'გაყოფა', '➗', 'გაყოფის ფაქტები, უცნობი გასაყოფი და გამყოფი, მრგვალი რიცხვების გაყოფა, ტექსტური ამოცანები.', 'blue', [
    {
      id: 'g3-gayofa',
      code: 'U05',
      title: 'გაყოფა',
      subtopics: [
        { id: 'u05-facts-1-to-5', title: 'გაყოფა 1-დან 5-მდე', summary: 'გაყოფის ფაქტები 1-დან 5-მდე' },
        { id: 'u05-facts-6-to-10', title: 'გაყოფა 6-დან 10-მდე', summary: 'გაყოფის ფაქტები 6-დან 10-მდე' },
        { id: 'u05-division-within-10', title: 'გაყოფა 10-ის ფარგლებში', summary: 'გაყოფა ერთნიშნა შედეგით' },
        { id: 'u05-round-numbers', title: 'მრგვალი რიცხვების გაყოფა', summary: 'ათეულებისა და ასეულების გაყოფა' },
        { id: 'u05-unknown-dividends-divisors', title: 'უცნობი გასაყოფის და გამყოფის პოვნა', summary: 'უცნობი კომპონენტები გაყოფაში' },
        { id: 'u05-division-tables', title: 'გაყოფის ცხრილები', summary: 'ცხრილების გამოყენება გაყოფისას' },
        { id: 'u05-word-problems-division', title: 'ტექსტური ამოცანები გაყოფაზე', summary: 'გაყოფის გამოყენება პრაქტიკაში' },
      ],
    },
  ]),
  topic('g3-raodenobis-shedareba', 'რაოდენობის განსაზღვრა და შედარება', '⚖️', 'თანრიგები, ნიმუშები, ჯამების შედარება შეკრების გარეშე, რაოდენობების გათანაბრება.', 'blue', [
    {
      id: 'g3-raodenobis-shedareba',
      code: 'U06',
      title: 'რაოდენობის განსაზღვრა და შედარება',
      subtopics: [
        { id: 'u06-digit-ranks-place-values', title: 'თანრიგები და მათი მნიშვნელობა', summary: 'ციფრის მნიშვნელობა თანრიგში' },
        { id: 'u06-corresponding-numbers-samples', title: 'შესაბამისი რიცხვები და ნიმუშები', summary: 'რიცხვების შეხამება ნიმუშთან' },
        { id: 'u06-multiplying-by-samples', title: 'რიცხვების გამრავლება ნიმუშებით', summary: 'ნიმუშის მიხედვით გამრავლება' },
        { id: 'u06-comparing-sums-without-addition', title: 'ჯამების შედარება შეკრების გარეშე', summary: 'ლოგიკური შედარება' },
        { id: 'u06-equalizing-quantities', title: 'რაოდენობების გათანაბრება', summary: 'თანაბარი რაოდენობის მიღება' },
        { id: 'u06-object-quantity-analysis', title: 'საგნების რაოდენობის ანალიზი', summary: 'საგნების დათვლა და შედარება' },
      ],
    },
  ]),
  topic('g3-mravalmoqmedebiani', 'მრავალმოქმედებიანი ამოცანები და მეთოდები', '🧮', 'მოქმედებათა რიგი, ფრჩხილები, ჯამებისა და ნამრავლების შედარება, ჯერადი შედარება.', 'violet', [
    {
      id: 'g3-mravalmoqmedebiani',
      code: 'U07',
      title: 'მრავალმოქმედებიანი ამოცანები და მეთოდები',
      subtopics: [
        { id: 'u07-terms-missing-steps', title: 'მოქმედებათა წევრები და გამოტოვებული ბიჯები', summary: 'მოქმედებების თანმიმდევრობა' },
        { id: 'u07-multistep-brackets', title: 'მრავალსაფეხურიანი გამოსახულებები და ფრჩხილები', summary: 'ფრჩხილების გამოყენება' },
        { id: 'u07-comparing-sums-products', title: 'ჯამისა და ნამრავლის შედარება', summary: 'შეკრებისა და გამრავლების შედარება' },
        { id: 'u07-comparing-differences-quotients', title: 'სხვაობისა და განაყოფის შედარება', summary: 'გამოკლებისა და გაყოფის შედარება' },
        { id: 'u07-scale-comparisons', title: 'ჯერადი შედარება (რამდენჯერ მეტი/ნაკლები)', summary: 'ჯერადი დამოკიდებულება' },
        { id: 'u07-distance-quantity', title: 'მანძილისა და რაოდენობის გამოთვლები', summary: 'პრაქტიკული გამოთვლები' },
        { id: 'u07-sorting-operations', title: 'მოქმედებების დალაგება', summary: 'გამოსახულებათა მნიშვნელობების დალაგება' },
      ],
    },
  ]),
  topic('g3-gantolebebi', 'განტოლებები', '❓', 'განტოლებები უცნობი შესაკრებით, საკლებით, მაკლებით, თანამამრავლით, გასაყოფითა და გამყოფით.', 'pink', [
    {
      id: 'g3-gantolebebi',
      code: 'U08',
      title: 'განტოლებები',
      subtopics: [
        { id: 'u08-unknown-addends', title: 'განტოლება უცნობი შესაკრებით', summary: 'x + a = b ტიპის განტოლება' },
        { id: 'u08-unknown-minuends-subtrahends', title: 'განტოლება უცნობი საკლებით და მაკლებით', summary: 'x − a = b და a − x = b' },
        { id: 'u08-unknown-factors', title: 'განტოლება უცნობი თანამამრავლით', summary: 'x × a = b ტიპის განტოლება' },
        { id: 'u08-unknown-dividends-divisors', title: 'განტოლება უცნობი გასაყოფით და გამყოფით', summary: 'x ÷ a = b და a ÷ x = b' },
      ],
    },
  ]),
  topic('g3-damrgvaleba', 'დამრგვალება და მიახლოება', '🎯', 'დამრგვალება ათეულებამდე, ასეულებამდე და ათასეულებამდე, მიახლოებითი გამოთვლები.', 'yellow', [
    {
      id: 'g3-damrgvaleba',
      code: 'U09',
      title: 'დამრგვალება და მიახლოება',
      subtopics: [
        { id: 'u09-rounding-tens-hundreds-thousands', title: 'დამრგვალება ათეულებამდე, ასეულებამდე და ათასეულებამდე', summary: 'დამრგვალების წესები' },
        { id: 'u09-word-problems-rounding', title: 'ტექსტური ამოცანები დამრგვალებაზე', summary: 'დამრგვალება პრაქტიკულ ამოცანებში' },
        { id: 'u09-approximate-operations', title: 'მიახლოებითი ჯამი, სხვაობა, ნამრავლი და განაყოფი', summary: 'მიახლოებითი ანგარიში' },
      ],
    },
  ]),
  topic('g3-gazomva-geometria', 'გაზომვა და გეომეტრია', '📐', 'თერმომეტრი, ერთეულების გარდაქმნა, ფიგურები, პერიმეტრი, კუთხეები, წრფეები.', 'green', [
    {
      id: 'g3-gazomva-geometria',
      code: 'U10',
      title: 'გაზომვა და გეომეტრია',
      subtopics: [
        { id: 'u10-thermometers-units', title: 'თერმომეტრი და საზომი ერთეულები', summary: 'ტემპერატურა და გაზომვა' },
        { id: 'u10-converting-units', title: 'სიგრძის, მასის და მოცულობის ერთეულების გარდაქმნა', summary: 'საზომი ერთეულების ურთიერთკავშირი' },
        { id: 'u10-ruler-applications', title: 'სახაზავის გამოყენება', summary: 'მონაკვეთის სიგრძის გაზომვა' },
        { id: 'u10-flat-solid-shapes', title: 'ბრტყელი და სივრცითი ფიგურები', summary: 'გეომეტრიული ფიგურების ცნობა' },
        { id: 'u10-triangle-quadrilateral-classification', title: 'სამკუთხედებისა და ოთხკუთხედების კლასიფიკაცია', summary: 'ფიგურების ტიპები' },
        { id: 'u10-sides-vertices-edges-faces', title: 'გვერდები, წვეროები, წიბოები და წახნაგები', summary: 'ფიგურის ელემენტები' },
        { id: 'u10-perimeter-calculations', title: 'პერიმეტრის გამოთვლა', summary: 'გვერდების სიგრძეთა ჯამი' },
        { id: 'u10-angle-classification', title: 'კუთხეების კლასიფიკაცია', summary: 'მართი, მახვილი და ბლაგვი კუთხე' },
        { id: 'u10-lines-segments-rays', title: 'წრფე, მონაკვეთი, სხივი და ურთიერთმდებარეობა', summary: 'ხაზები და გეომეტრიული ელემენტები' },
        { id: 'u10-polygons-shape-filling', title: 'მრავალკუთხედები და ფიგურების შევსება', summary: 'მრავალკუთხედების შედგენა' },
      ],
    },
  ]),
  topic('g3-fuli', 'ფინანსური წიგნიერება და ფული', '🪙', 'თეთრი და ლარი, თანხის დამრგვალება, ოთხი მოქმედება ფულზე, ყიდვა-გაყიდვა.', 'yellow', [
    {
      id: 'g3-fuli',
      code: 'U11',
      title: 'ფინანსური წიგნიერება და ფული',
      subtopics: [
        { id: 'u11-counting-tetri-lari', title: 'თეთრისა და ლარის დათვლა', summary: 'ფულის კუპიურები და მონეტები' },
        { id: 'u11-rounding-money', title: 'თანხის დამრგვალება', summary: 'ფასების მიახლოება' },
        { id: 'u11-money-operations', title: 'შეკრება, გამოკლება, გამრავლება და გაყოფა ფულზე', summary: 'მოქმედებები ფულად ერთეულებზე' },
        { id: 'u11-sufficient-funds-shopping', title: 'საკმარისი თანხა და ფასების შედარება', summary: 'ბიუჯეტის დაგეგმვა' },
        { id: 'u11-money-word-problems', title: 'ტექსტური ამოცანები ფულზე', summary: 'ფინანსური ამოცანები' },
      ],
    },
  ]),
  topic('g3-monacemebi-albatoba', 'მონაცემები და ალბათობა', '📊', 'მონაცემთა შეგროვება, დიაგრამები, ვენის დიაგრამა, ცხრილები, ალბათობის ცნებები.', 'teal', [
    {
      id: 'g3-monacemebi-albatoba',
      code: 'U12',
      title: 'მონაცემები და ალბათობა',
      subtopics: [
        { id: 'u12-gathering-grouping-data', title: 'მონაცემთა შეგროვება და დაჯგუფება', summary: 'მონაცემების ორგანიზება' },
        { id: 'u12-diagrams-pictograms-dotplots', title: 'დიაგრამები, პიქტოგრამები და წერტილოვანი დიაგრამები', summary: 'გრაფიკული გამოსახვა' },
        { id: 'u12-venn-diagrams-redundant-data', title: 'ზედმეტი მონაცემები და ვენის დიაგრამები', summary: 'სიმრავლეთა გადაკვეთა' },
        { id: 'u12-table-data-comparison', title: 'მონაცემთა შედარება ცხრილებში', summary: 'ცხრილების წაკითხვა და ანალიზი' },
        { id: 'u12-event-types', title: 'აუცილებელი, შესაძლებელი და შეუძლებელი ხდომილებები', summary: 'ხდომილებათა ტიპები' },
        { id: 'u12-combinations-likelihood', title: 'კომბინაციები და ალბათობის ცვლილება', summary: 'შესაძლებლობების დათვლა' },
      ],
    },
  ]),
  topic('g3-dro-kalendari', 'დრო და კალენდარი', '⏰', 'დროის მიმდევრობა, დრო რიცხვით ღერძზე, კალენდარი, გასული დრო.', 'pink', [
    {
      id: 'g3-dro-kalendari',
      code: 'U13',
      title: 'დრო და კალენდარი',
      subtopics: [
        { id: 'u13-time-sequences-comparisons', title: 'დროის მიმდევრობა და შედარება', summary: 'საათისა და წუთების შედარება' },
        { id: 'u13-time-number-lines', title: 'დრო რიცხვით ღერძზე', summary: 'დროის ინტერვალები ღერძზე' },
        { id: 'u13-calendar-unit-relations', title: 'კალენდარი და დროის ერთეულებს შორის კავშირი', summary: 'თვეები, დღეები, კვირები' },
        { id: 'u13-elapsed-time-problems', title: 'გასული დროის ამოცანები', summary: 'აქტივობის ხანგრძლივობა' },
      ],
    },
  ]),
  topic('g3-kanonzomiereba-logika', 'კანონზომიერებები და ლოგიკური მსჯელობა', '🧠', 'რიცხვითი მიმდევრობები, ჩაფიქრებული რიცხვები, ასაკი, გამორიცხვა, სასწორი.', 'violet', [
    {
      id: 'g3-kanonzomiereba-logika',
      code: 'U14',
      title: 'კანონზომიერებები და ლოგიკური მსჯელობა',
      subtopics: [
        { id: 'u14-number-sequences-triangles', title: 'რიცხვითი მიმდევრობები და სამკუთხედები', summary: 'კანონზომიერება რიცხვებში' },
        { id: 'u14-illustrated-patterns', title: 'ილუსტრირებული კანონზომიერებები', summary: 'ფორმებისა და ფიგურების კანონზომიერება' },
        { id: 'u14-thought-of-numbers-guessing', title: 'ჩაფიქრებული რიცხვები და გამოცნობა', summary: 'რიცხვის გამოცნობა მინიშნებით' },
        { id: 'u14-age-problems-word-coding', title: 'ასაკის ამოცანები და სიტყვების კოდირება', summary: 'ლოგიკური გამოთვლები' },
        { id: 'u14-interval-problems-color-choices', title: 'შუალედები და ფერის არჩევა', summary: 'პირობითი არჩევანი' },
        { id: 'u14-elimination-logic-grids', title: 'გამორიცხვის მეთოდები და ლოგიკური ბადეები', summary: 'გამორიცხვის წესები' },
        { id: 'u14-balance-scale-reasoning', title: 'სასწორის ლოგიკა', summary: 'წონების შედარება' },
        { id: 'u14-condition-matching-elimination', title: 'პირობების შეხამება და რთული გამორიცხვა', summary: 'კომპლექსური ლოგიკა' },
        { id: 'u14-sorting-largest-smallest', title: 'უდიდესისა და უმცირესის დალაგება', summary: 'დალაგების ლოგიკა' },
      ],
    },
  ]),
  topic('g3-wiladebi-shesavali', 'წილადების შესავალი', '🍕', 'მთელის ნაწილები, ტოლი ნაწილები და ნახევარი, მესამედი და მეოთხედი.', 'violet', [
    {
      id: 'g3-wiladebi-shesavali',
      code: 'U15',
      title: 'წილადების შესავალი',
      subtopics: [
        { id: 'u15-parts-of-a-whole', title: 'მთელის ნაწილები', summary: 'მთელის დაყოფა ნაწილებად' },
        { id: 'u15-equal-parts-halves', title: 'ტოლი ნაწილები და ნახევარი', summary: 'ნახევრის ცნება და გამოთვლა' },
        { id: 'u15-thirds-and-quarters', title: 'მესამედი და მეოთხედი', summary: 'მესამედი და მეოთხედი ნაწილები' },
      ],
    },
  ]),
];

const g4: Topic[] = [
  topic('g4-ricxvebi-sistemebi', 'რიცხვები და რიცხვითი სისტემები', '🔢', 'რომაული ციფრები, ლუწი და კენტი რიცხვები, მოქმედებები თარიღებთან, ნატურალური რიცხვების დამრგვალება, მარტივი და შედგენილი რიცხვები, რიცხვების შედარება მილიონამდე, შესაბამისი რიცხვები და ნიმუშები, ასეულების ცხრილის ანალიზი, უმცირესი და უდიდესი ლუწი/კენტი რიცხვები, ათზე და მის ჯერადებზე გამრავლება, ციფრების დათვლა, მოქმედებები რიცხვებზე, მოქმედებები უმცირეს და უდიდეს მნიშვნელობებზე, განსხვავებული რაოდენობების პოვნა, საშუალო არითმეტიკული.', 'blue', [
    {
      id: 'g4-ricxvebi-sistemebi',
      code: 'U01',
      title: 'რიცხვები და რიცხვითი სისტემები',
      subtopics: [
        { id: 'u01-roman-numerals', title: 'რომაული ციფრები', summary: 'რომაული ციფრებით ჩაწერა და წაკითხვა' },
        { id: 'u01-even-odd', title: 'ლუწი და კენტი რიცხვები', summary: 'ლუწი და კენტი რიცხვების ამოცნობა და თვისებები' },
        { id: 'u01-dates', title: 'მოქმედებები თარიღებთან', summary: 'დღეების გამოთვლა და კალენდარული თარიღები' },
        { id: 'u01-rounding', title: 'ნატურალური რიცხვების დამრგვალება', summary: 'დამრგვალება ათეულებამდე, ასეულებამდე, ათასეულებამდე' },
        { id: 'u01-prime-composite', title: 'მარტივი და შედგენილი რიცხვები', summary: 'მარტივი და შედგენილი რიცხვების განსაზღვრა' },
        { id: 'u01-compare-million', title: 'რიცხვების შედარება მილიონამდე', summary: 'დიდი რიცხვების შედარება და დალაგება' },
        { id: 'u01-patterns-sequences', title: 'შესაბამისი რიცხვები და ნიმუშები', summary: 'გამოტოვებული რიცხვები და მიმდევრობის წესები' },
        { id: 'u01-hundred-chart', title: 'ასეულების ცხრილის ანალიზი', summary: 'ცხრილში გადაადგილება და მეზობელი უჯრები' },
        { id: 'u01-min-max-even-odd', title: 'უმცირესი და უდიდესი ლუწი/კენტი რიცხვები', summary: 'უდიდესი და უმცირესი ლუწი და კენტი მრავალნიშნა რიცხვები' },
        { id: 'u01-multiply-tens', title: 'ათზე და მის ჯერადებზე გამრავლება', summary: 'გამრავლება 10-ზე, 100-ზე, 1000-ზე და მათ ჯერადებზე' },
        { id: 'u01-digit-counting', title: 'ციფრების დათვლა', summary: 'ციფრების რაოდენობა და განმეორებადობა რიცხვში' },
        { id: 'u01-operations', title: 'მოქმედებები რიცხვებზე', summary: 'შეკრება, გამოკლება, გამრავლება და გაყოფა' },
        { id: 'u01-extreme-values', title: 'მოქმედებები უმცირეს და უდიდეს მნიშვნელობებზე', summary: 'ციფრებისგან უდიდესი და უმცირესი რიცხვების შედგენა' },
        { id: 'u01-difference-word-problems', title: 'განსხვავებული რაოდენობების პოვნა', summary: 'ტექსტური ამოცანები სხვაობისა და ნაწილების პოვნაზე' },
        { id: 'u01-arithmetic-mean', title: 'საშუალო არითმეტიკული', summary: 'საშუალო არითმეტიკულის გამოთვლა და ამოცანები' },
      ],
    },
  ]),
  topic('g4-shekreba-gamokleba', 'შეკრება და გამოკლება', '➕', 'უცნობი რიცხვის პოვნა, შეკრება და გამოკლება მილიონამდე, რიცხვის წარმოდგენა შესაკრებების ჯამის სახით, მიახლოებითი გამოთვლები, ცხრილის შევსება, შესაბამისი მოქმედებები და რიცხვითი პირამიდები.', 'teal', [
    {
      id: 'g4-shekreba-gamokleba',
      code: 'U02',
      title: 'შეკრება და გამოკლება',
      subtopics: [
        { id: 'u02-unknown-number', title: 'უცნობი რიცხვის პოვნა', summary: 'უცნობი შესაკრების, საკლების და მაკლების პოვნა' },
        { id: 'u02-addition-million', title: 'შეკრება მილიონამდე', summary: 'მრავალნიშნა რიცხვების შეკრება მილიონამდე' },
        { id: 'u02-subtraction-million', title: 'გამოკლება მილიონამდე', summary: 'მრავალნიშნა რიცხვების გამოკლება მილიონამდე' },
        { id: 'u02-expanded-form', title: 'რიცხვის წარმოდგენა შესაკრებების ჯამის სახით', summary: 'რიცხვის დაშლა სათანრიგო შესაკრებებად' },
        { id: 'u02-estimate-sum', title: 'ჯამის მიახლოებითი გამოთვლა', summary: 'დამრგვალებით ჯამის შეფასება' },
        { id: 'u02-estimate-diff', title: 'სხვაობის მიახლოებითი გამოთვლა', summary: 'დამრგვალებით სხვაობის შეფასება' },
        { id: 'u02-estimate-word-problems', title: 'ტექსტური ამოცანები მიახლოებით ჯამსა და სხვაობაზე', summary: 'პრაქტიკული ამოცანები მიახლოებით გამოთვლებზე' },
        { id: 'u02-fill-table', title: 'ცხრილის შევსება', summary: 'კომპონენტების ცხრილის შევსება: შესაკრები, ჯამი, საკლები, მაკლები, სხვაობა' },
        { id: 'u02-related-operations', title: 'შესაბამისი მოქმედებები', summary: 'შეკრება-გამოკლების ურთიერთკავშირი და თვისებები' },
        { id: 'u02-number-pyramids', title: 'რიცხვითი პირამიდები', summary: 'პირამიდის შევსება მეზობელი უჯრების შეკრებით' },
      ],
    },
  ]),
  topic('g4-gamravleba', 'გამრავლება', '✖️', 'გამრავლების თვისებები, ტაბულა 12-მდე, უცნობი მამრავლი, წერითი გამრავლება, ნულებით დაბოლოებული რიცხვები, დაჯგუფება, შეფასება და კანონზომიერებები.', 'violet', [
    {
      id: 'g4-gamravleba',
      code: 'U03',
      title: 'გამრავლება',
      subtopics: [
        { id: 'u03-multiplication-properties', title: 'გამრავლების თვისებები', summary: 'გადანაცვლებადობა, დაჯგუფება და განრიგებადობა' },
        { id: 'u03-multiplication-table-12', title: 'გამრავლების ტაბულა 12-მდე', summary: 'გამრავლება და უცნობი რიცხვი 12-მდე' },
        { id: 'u03-unknown-factor', title: 'უცნობი მამრავლის პოვნა', summary: 'განტოლებები უცნობი მამრავლით' },
        { id: 'u03-written-single-digit', title: 'ერთნიშნა რიცხვზე მრავალნიშნა რიცხვის წერითი გამრავლება', summary: 'სვეტური გამრავლება ერთნიშნა მამრავლზე' },
        { id: 'u03-multiply-ending-zeros', title: 'ნულით დამთავრებული რიცხვების გამრავლება', summary: 'მრგვალი ათეულების, ასეულების და ათასეულების გამრავლება' },
        { id: 'u03-written-multi-digit', title: 'მრავალნიშნა რიცხვების წერითი გამრავლება', summary: 'ორნიშნა და სამნიშნა რიცხვების სვეტური გამრავლება' },
        { id: 'u03-identify-factors', title: 'ნამრავლის შესაბამისი მამრავლების ამოცნობა', summary: 'მამრავლთა წყვილების შერჩევა' },
        { id: 'u03-associative-tricks', title: 'დაჯგუფების თვისება და გამოთვლის ხერხები', summary: 'მოხერხებული დაჯგუფება: 2×5, 4×25, 8×125' },
        { id: 'u03-commutative-law', title: 'გამრავლების გადანაცვლებადობის კანონი', summary: 'მამრავლთა გადანაცვლება: a × b = b × a' },
        { id: 'u03-estimate-product', title: 'ნამრავლის მიახლოებითი მნიშვნელობა', summary: 'დამრგვალებით ნამრავლის შეფასება' },
        { id: 'u03-multiple-factors', title: 'რამდენიმე მამრავლის მქონე მრავალნიშნა გამრავლება', summary: 'სამი და მეტი მამრავლის ნამრავლი' },
        { id: 'u03-pattern-table', title: 'კანონზომიერებიანი ცხრილის შევსება', summary: 'გამრავლების წესის პოვნა და ცხრილის შევსება' },
        { id: 'u03-product-rounded-factors', title: 'ნამრავლის გამოთვლა დამრგვალებული მამრავლებით', summary: 'ჩანაცვლება მრგვალი რიცხვებით' },
        { id: 'u03-product-comparison-bounds', title: 'ნამრავლის შეფასება', summary: 'ნამრავლის ზღვრები და შედარება' },
        { id: 'u03-commutative-arrays', title: 'გადანაცვლებადობის თვისება ილუსტრაციებით', summary: 'მწკრივები, სვეტები და მასივები' },
        { id: 'u03-apply-commutative', title: 'გადანაცვლებადობის თვისების გამოყენება', summary: 'გამოთვლის გამარტივება გადანაცვლებით' },
        { id: 'u03-multiply-same-number', title: 'ერთი და იმავე რიცხვზე გამრავლება', summary: 'მამრავლის ზრდის გავლენა ნამრავლზე' },
        { id: 'u03-table-fill-drag', title: 'გამრავლების ცხრილის შევსება (გადათრევა და ჩასმა)', summary: 'ნამრავლების შესაბამისობა ცხრილში' },
        { id: 'u03-table-12-drag', title: 'გამრავლების ტაბულა 12-მდე (გადათრევა და ჩასმა)', summary: 'ტაბულის სვეტების შევსება' },
      ],
    },
  ]),
  topic('g4-gayofa', 'გაყოფა', '➗', 'გასაყოფისა და გამყოფის პოვნა, გაყოფა 12-მდე, ნაშთიანი გაყოფა, ნულებით დაბოლოებული რიცხვები, ორნიშნა რიცხვზე გაყოფა და მიახლოებითი განაყოფი.', 'yellow', [
    {
      id: 'g4-gayofa',
      code: 'U04',
      title: 'გაყოფა',
      subtopics: [
        { id: 'u04-find-dividend', title: 'გასაყოფის პოვნა', summary: 'უცნობი გასაყოფის პოვნა: □ ÷ b = c' },
        { id: 'u04-find-divisor', title: 'გამყოფის პოვნა', summary: 'უცნობი გამყოფის პოვნა: a ÷ □ = c' },
        { id: 'u04-divide-up-to-12', title: 'გაყოფა 12-მდე რიცხვებზე', summary: 'გაყოფის ტაბულა 12-მდე და განაყოფის პოვნა' },
        { id: 'u04-long-division-remainder', title: 'დიდი რიცხვების ერთნიშნა რიცხვზე გაყოფა და ნაშთი', summary: 'სამნიშნა და ოთხნიშნა რიცხვების გაყოფა და ნაშთი' },
        { id: 'u04-quotient-and-remainder', title: 'განაყოფისა და ნაშთის გამოთვლა', summary: 'ნაშთიანი გაყოფა: განაყოფისა და ნაშთის მითითება' },
        { id: 'u04-divide-ending-zeros-single', title: 'ნულებით დამთავრებული რიცხვების ერთნიშნა რიცხვზე გაყოფა', summary: 'მრგვალი ათეულების, ასეულების და ათასეულების გაყოფა' },
        { id: 'u04-divide-ending-zeros', title: 'ნულებით დამთავრებული რიცხვების გაყოფა', summary: 'მრგვალი რიცხვების გაყოფა მრგვალ რიცხვებზე' },
        { id: 'u04-division-principles', title: 'რიცხვების გაყოფის პრინციპები', summary: 'გაყოფის თვისებები და გამოთვლის ხერხები' },
        { id: 'u04-divide-by-two-digit', title: 'ორნიშნა რიცხვზე გაყოფა', summary: 'ორნიშნა გამყოფზე გაყოფა' },
        { id: 'u04-estimate-quotient', title: 'მიახლოებითი განაყოფი', summary: 'განაყოფის შეფასება დამრგვალებით' },
        { id: 'u04-obtain-numbers-division', title: 'რიცხვების მიღება გაყოფის საშუალებით', summary: 'ტექსტური ამოცანები უცნობი რიცხვის პოვნაზე' },
      ],
    },
  ]),
  topic('g4-algebra', 'ალგებრა', '📐', 'ალგებრული გამოსახულებების ჩაწერა, გამოსახულების მნიშვნელობის გამოთვლა და ცვლადების სხვადასხვა მნიშვნელობისთვის გამოთვლა.', 'pink', [
    {
      id: 'g4-algebra',
      code: 'U05',
      title: 'ალგებრა',
      subtopics: [
        { id: 'u05-write-expressions', title: 'ალგებრული გამოსახულებების ჩაწერა', summary: 'ტექსტური აღწერის ალგებრულ გამოსახულებად ჩაწერა' },
        { id: 'u05-evaluate-expression', title: 'გამოსახულების მნიშვნელობის გამოთვლა', summary: 'გამოსახულების მნიშვნელობის პოვნა ცვლადის მოცემული მნიშვნელობისთვის' },
        { id: 'u05-evaluate-multiple-values', title: 'გამოსახულების მნიშვნელობების გამოთვლა ცვლადების სხვადასხვა მნიშვნელობისთვის', summary: 'გამოსახულების მნიშვნელობების გამოთვლა რამდენიმე მნიშვნელობისთვის' },
      ],
    },
  ]),
  topic('g4-shedarebiti-amocanebi', 'შედარებითი ტექსტური ამოცანები', '📊', 'რამდენით მეტია, რამდენით ნაკლებია, რამდენჯერ მეტია, რამდენჯერ ნაკლებია და რაოდენობების შედარება.', 'green', [
    {
      id: 'g4-shedarebiti-amocanebi',
      code: 'U06',
      title: 'შედარებითი ტექსტური ამოცანები',
      subtopics: [
        { id: 'u06-how-much-more', title: 'რამდენით მეტია?', summary: 'სხვაობის პოვნა: რამდენით მეტია ერთი სიდიდე მეორეზე' },
        { id: 'u06-how-much-less', title: 'რამდენით ნაკლებია?', summary: 'სხვაობის პოვნა: რამდენით ნაკლებია ერთი სიდიდე მეორეზე' },
        { id: 'u06-how-many-times-more', title: 'რამდენჯერ მეტია?', summary: 'ჯერადი შედარება: რამდენჯერ მეტია ერთი სიდიდე მეორეზე' },
        { id: 'u06-how-many-times-less', title: 'რამდენჯერ ნაკლებია?', summary: 'ჯერადი შედარება: რამდენჯერ ნაკლებია ერთი სიდიდე მეორეზე' },
        { id: 'u06-compare-quantities', title: 'საგნების რაოდენობების შედარება', summary: 'სიდიდის გამოთვლა ჯერადობისა და სხვაობის მიხედვით' },
      ],
    },
  ]),
  topic('g4-mravalsapexuriani-amocanebi', 'მრავალსაფეხურიანი ამოცანები', '🪜', 'მიახლოებითი ჯამები, შეკრებისა და შერეული ამოცანები, მოქმედების ნიშნების ჩასმა, საკმარისი/არასაკმარისი პირობები, განტოლებები, რაოდენობების გათანაბრება, გამრავლება და შეკრება, დროის ინტერვალები და მოქმედებათა თანმიმდევრობა.', 'violet', [
    {
      id: 'g4-mravalsapexuriani-amocanebi',
      code: 'U07',
      title: 'მრავალსაფეხურიანი ამოცანები',
      subtopics: [
        { id: 'u07-approximate-sums', title: 'მიახლოებითი ჯამები მრავალსაფეხურიან ამოცანებში', summary: 'დამრგვალებით ჯამის შეფასება ტექსტურ ამოცანებში' },
        { id: 'u07-addition-problems', title: 'შეკრების ამოცანები', summary: 'რამდენიმე შესაკრებიანი ტექსტური ამოცანები' },
        { id: 'u07-mixed-problems', title: 'შერეული ამოცანები', summary: 'შეკრება-გამოკლების მრავალსაფეხურიანი ამოცანები' },
        { id: 'u07-operation-signs', title: 'ბადეში მოქმედების ნიშნების ჩასმა', summary: 'გამოტოვებული არითმეტიკული ნიშნების (+, −, ×, ÷) პოვნა' },
        { id: 'u07-sufficient-conditions', title: 'საკმარისი ან არასაკმარისი პირობის მქონე ამოცანები', summary: 'ამოცანის პირობის სისრულის ანალიზი' },
        { id: 'u07-guess-and-check', title: 'ამოცანების ამოხსნა გამოცდისა და შემოწმების გზით', summary: 'რიცხვის პოვნა ნაშთის, ჯერადობის და დიაპაზონის მიხედვით' },
        { id: 'u07-equations', title: 'მრავალსაფეხურიანი განტოლებები', summary: 'მარტივი და ორსაფეხურიანი წრფივი განტოლებების ამოხსნა' },
        { id: 'u07-equalizing-quantities', title: 'რაოდენობების გათანაბრება შეკრებით', summary: 'სხვაობის გამოთვლა ორი სიდიდის გასათანაბრებლად' },
        { id: 'u07-multiplication-addition', title: 'გამრავლებისა და შეკრების ამოცანები', summary: 'ორსაფეხურიანი ამოცანები: გამრავლება და შეკრება' },
        { id: 'u07-time-intervals', title: 'დროის ინტერვალებთან დაკავშირებული რაოდენობები', summary: 'დროის გამოთვლა, დაწყება, დასრულება და ხანგრძლივობა' },
        { id: 'u07-determine-compare', title: 'რაოდენობების განსაზღვრა და შედარება', summary: 'ორსაფეხურიანი შედარებითი ამოცანები ჯამითა და სხვაობით' },
        { id: 'u07-order-of-operations', title: 'მოქმედებების დალაგება', summary: 'მოქმედებათა თანმიმდევრობა და ფრჩხილები' },
      ],
    },
  ]),
  topic('g4-monacemta-analizi', 'მონაცემთა ანალიზი', '📈', 'მონაცემების შეგროვება, შერჩევა, ცხრილებისა და დიაგრამების წაკითხვა, პიქტოგრამები, სვეტოვანი დიაგრამები და სიხშირეთა ცხრილები.', 'blue', [
    {
      id: 'g4-monacemta-analizi',
      code: 'U08',
      title: 'მონაცემთა ანალიზი',
      subtopics: [
        { id: 'u08-data-collection', title: 'მონაცემების შეგროვება', summary: 'მონაცემთა შეკრება და საწყისი ანალიზი' },
        { id: 'u08-data-selection', title: 'მონაცემების შერჩევა', summary: 'პირობის შესაბამისი მონაცემების გაფილტვრა' },
        { id: 'u08-reading-tables', title: 'ცხრილების წაკითხვა', summary: 'მონაცემთა ამოკითხვა და შედარება ცხრილებში' },
        { id: 'u08-reading-charts', title: 'დიაგრამების წაკითხვა', summary: 'დიაგრამების ანალიზი და მონაცემთა გამოთვლა' },
        { id: 'u08-pictograms', title: 'პიქტოგრამები', summary: 'პიქტოგრამების სიმბოლოების მნიშვნელობა და გაანგარიშება' },
        { id: 'u08-bar-charts', title: 'სვეტოვანი დიაგრამები', summary: 'სვეტოვანი დიაგრამების წაკითხვა და შედარება' },
        { id: 'u08-frequency-tables', title: 'სიხშირეთა ცხრილები', summary: 'მონაცემთა სიხშირის დათვლა და ცხრილის შევსება' },
      ],
    },
  ]),
  topic('g4-finansuri-tsigniereba-fuli', 'ფინანსური წიგნიერება და ფული', '💰', 'მონეტებითა და ბანკნოტებით თანხის დათვლა, ფულის შეკრება-გამოკლება, შედარება, ერთეულის ფასი, საერთო ღირებულება, საკმარისი თანხა, ვალუტის კონვერტაცია და მრავალსაფეხურიანი ფინანსური ამოცანები.', 'yellow', [
    {
      id: 'g4-finansuri-tsigniereba-fuli',
      code: 'U09',
      title: 'ფინანსური წიგნიერება და ფული',
      subtopics: [
        { id: 'u09-counting-coins', title: 'მონეტებით თანხის დათვლა', summary: 'თეთრებისა და ლარის მონეტების დათვლა' },
        { id: 'u09-counting-banknotes', title: 'თანხის დათვლა ბანკნოტებით', summary: 'ლარის ბანკნოტების დათვლა და შეკრება' },
        { id: 'u09-money-addition', title: 'ფულის შეკრება', summary: 'ლარისა და თეთრის შეკრების ამოცანები' },
        { id: 'u09-comparing-money', title: 'ფულადი ერთეულების შედარება', summary: 'თანხების შედარება და დალაგება' },
        { id: 'u09-unit-price', title: 'ერთეულის ფასი', summary: 'ერთი და რამდენიმე ნივთის ღირებულების გამოთვლა' },
        { id: 'u09-total-cost', title: 'საერთო თანხის გამოთვლა', summary: 'რამდენიმე ნივთის საერთო ღირებულება' },
        { id: 'u09-sufficient-money', title: 'საკმარისი თანხა', summary: 'თანხის საკმარისობის შეფასება და ხურდა' },
        { id: 'u09-currency-conversion', title: 'ვალუტის კონვერტაცია', summary: 'პირობითი კურსით ვალუტის გადაყვანა' },
        { id: 'u09-multi-step-money', title: 'მრავალსაფეხურიანი ფულადი ამოცანები', summary: 'რთული ფინანსური ტექსტური ამოცანები' },
        { id: 'u09-money-subtraction', title: 'ფულის გამოკლება', summary: 'ლარისა და თეთრის გამოკლება და ხურდის პოვნა' },
      ],
    },
  ]),
  topic('g4-gazomva', 'გაზომვა', '📏', 'მასის, სიგრძისა და მოცულობის ერთეულების გადაყვანა, მოქმედებები საზომ ერთეულებზე, ერთეულების შესაბამისობა, შედარება, შევსება, სახაზავისა და ტრანსპორტირის გამოყენება.', 'teal', [
    {
      id: 'g4-gazomva',
      code: 'U10',
      title: 'გაზომვა',
      subtopics: [
        { id: 'u10-mass-conversion', title: 'მასის ერთეულების გადაყვანა', summary: 'კგ და გ გადაყვანა' },
        { id: 'u10-length-conversion', title: 'სიგრძის ერთეულების გადაყვანა', summary: 'კმ, მ, სმ და მმ ერთეულები' },
        { id: 'u10-volume-conversion', title: 'მოცულობის ერთეულების გადაყვანა', summary: 'ლ და მლ გადაყვანა' },
        { id: 'u10-measurement-operations', title: 'მოქმედებები საზომ ერთეულებზე', summary: 'შეკრება და გამოკლება' },
        { id: 'u10-unit-suitability', title: 'საზომი ერთეულების შესაბამისობა', summary: 'შესაფერისი საზომი ერთეულის შერჩევა' },
        { id: 'u10-unit-comparison', title: 'საზომი ერთეულების შედარება', summary: 'სხვადასხვა ერთეულის შედარება' },
        { id: 'u10-fill-to-target', title: 'მოცემულ რაოდენობამდე შევსება', summary: 'სრულ რაოდენობამდე შევსება' },
        { id: 'u10-centimeter-ruler', title: 'სანტიმეტრიანი სახაზავის გამოყენება', summary: 'მონაკვეთის სიგრძის პოვნა სახაზავით' },
        { id: 'u10-protractor-angles', title: 'ტრანსპორტირის გამოყენება', summary: 'კუთხეების ზომა და კლასიფიკაცია' },
      ],
    },
  ]),
  topic('g4-geometria', 'გეომეტრია', '🔷', 'ბრტყელი და სივრცული ფიგურები, ხაზები, მრავალკუთხედები, წრე და წრეწირი, რადიუსი და დიამეტრი, პერიმეტრი და ფართობი, ფიგურების კლასიფიკაცია და დაყოფა.', 'pink', [
    {
      id: 'g4-geometria',
      code: 'U11',
      title: 'გეომეტრია',
      subtopics: [
        { id: 'u11-plane-figures', title: 'ბრტყელი ფიგურები', summary: 'ბრტყელი და სივრცული ფიგურების ამოცნობა' },
        { id: 'u11-tables-patterns', title: 'ცხრილები და კანონზომიერებები', summary: 'მიმდევრობებისა და ცხრილების კანონზომიერება' },
        { id: 'u11-open-closed-lines', title: 'ღია და დახურული ხაზები', summary: 'ღია და დახურული ხაზების გარჩევა' },
        { id: 'u11-squares-rectangles', title: 'კვადრატები და მართკუთხედები', summary: 'კვადრატისა და მართკუთხედის თვისებები' },
        { id: 'u11-polygons', title: 'მრავალკუთხედები', summary: 'მრავალკუთხედების სახელები და თვისებები' },
        { id: 'u11-sides-vertices', title: 'გვერდებისა და წვეროების დათვლა', summary: 'გვერდებისა და წვეროების რაოდენობა' },
        { id: 'u11-lines-segments-rays', title: 'წრფეები, მონაკვეთები და სხივები', summary: 'წრფის, მონაკვეთისა და სხივის გარჩევა' },
        { id: 'u11-parallel-intersecting', title: 'პარალელური და გადამკვეთი წრფეები', summary: 'წრფეთა ურთიერთმდებარეობა' },
        { id: 'u11-circles', title: 'წრეები და წრეწირები', summary: 'წრისა და წრეწირის ცნებები' },
        { id: 'u11-radius-diameter', title: 'რადიუსი და დიამეტრი', summary: 'რადიუსისა და დიამეტრის კავშირი' },
        { id: 'u11-perimeter', title: 'პერიმეტრი', summary: 'ფიგურის პერიმეტრის გამოთვლა' },
        { id: 'u11-area', title: 'ფართობი', summary: 'მართკუთხედისა და კვადრატის ფართობი' },
        { id: 'u11-perimeter-area-relation', title: 'პერიმეტრისა და ფართობის ურთიერთკავშირი', summary: 'პერიმეტრისა და ფართობის შედარება' },
        { id: 'u11-solid-figures', title: 'სივრცული ფიგურები', summary: 'კუბი, პრიზმა, პირამიდა, ცილინდრი, კონუსი, სფერო' },
        { id: 'u11-quadrilateral-classification', title: 'ოთხკუთხედების კლასიფიკაცია', summary: 'კვადრატი, მართკუთხედი, რომბი, ტრაპეცია' },
        { id: 'u11-shape-completion', title: 'ფიგურის შევსება', summary: 'დაუხატავი გვერდების დათვლა' },
        { id: 'u11-area-square-units', title: 'ფართობი კვადრატული ერთეულებით', summary: 'ფართობი ერთეული კვადრატებით' },
        { id: 'u11-triangle-classification', title: 'სამკუთხედების კლასიფიკაცია', summary: 'გვერდებისა და კუთხეების მიხედვით' },
        { id: 'u11-equal-areas', title: 'ტოლი ფართობები', summary: 'ტოლი ფართობის ფიგურების პოვნა' },
        { id: 'u11-shape-partitioning', title: 'ფიგურების დაყოფა', summary: 'დიაგონალებითა და ხაზებით დაყოფა' },
      ],
    },
  ]),
  topic('g4-dro', 'დრო', '⏰', 'დროითი მიმდევრობა, დროის ერთეულების გადაყვანა, მოქმედებები დროზე, გასული დროის, ასაკის, მუშაობისა და საათობრივი ღირებულების ამოცანები.', 'yellow', [
    {
      id: 'g4-dro',
      code: 'U12',
      title: 'დრო',
      subtopics: [
        { id: 'u12-time-sequence', title: 'დროითი მიმდევრობა', summary: 'მოვლენებისა და დროის ერთეულების დალაგება' },
        { id: 'u12-time-unit-conversion', title: 'დროის ერთეულების გადაყვანა', summary: 'საათი, წუთი, წამი, დღე, კვირა, თვე, წელი' },
        { id: 'u12-time-operations', title: 'შერეულ დროის ერთეულებზე მოქმედებები', summary: 'დროის შეკრება და გამოკლება' },
        { id: 'u12-elapsed-time', title: 'გასული დროის ამოცანები', summary: 'ხანგრძლივობა და დასრულების დრო' },
        { id: 'u12-age-problems', title: 'ასაკის ამოცანები', summary: 'ასაკობრივი სხვაობები და გამოთვლები' },
        { id: 'u12-work-rate-time', title: 'დროის მონაკვეთში შესრულებული სამუშაო ან რაოდენობა', summary: 'პროდუქტიულობა და დრო' },
        { id: 'u12-hourly-rate', title: 'საათობრივი ღირებულება', summary: 'საათობრივი ანაზღაურება და ხარჯი' },
      ],
    },
  ]),
  topic('g4-sichkare-mandzili', 'სიჩქარისა და მანძილის ამოცანები', '🚗', 'გავლილი მანძილის, მოძრაობის ხანგრძლივობისა და სიჩქარის გამოთვლა, დროისა და მანძილის ურთიერთკავშირი.', 'teal', [
    {
      id: 'g4-sichkare-mandzili',
      code: 'U13',
      title: 'სიჩქარისა და მანძილის ამოცანები',
      subtopics: [
        { id: 'u13-distance', title: 'გავლილი მანძილი', summary: 'მანძილის გამოთვლა სიჩქარითა და დროით' },
        { id: 'u13-duration', title: 'მოძრაობის ხანგრძლივობა', summary: 'დროის გამოთვლა მანძილითა და სიჩქარით' },
        { id: 'u13-speed', title: 'სიჩქარის გამოთვლა', summary: 'საშუალო სიჩქარის პოვნა' },
        { id: 'u13-speed-time-distance', title: 'დროისა და მანძილის კავშირი', summary: 'შედარებითი და ორსაფეხურიანი ამოცანები' },
      ],
    },
  ]),
  topic('g4-albatoba', 'ალბათობა', '🎲', 'შესაძლო და შეუძლებელი მოვლენები, მოსალოდნელი შედეგები, ყველაზე სავარაუდო მოვლენები, კომბინაციები და ალბათობის ცვლილება.', 'violet', [
    {
      id: 'g4-albatoba',
      code: 'U14',
      title: 'ალბათობა',
      subtopics: [
        { id: 'u14-event-likelihood', title: 'შესაძლო, ნაკლებად სავარაუდო და შეუძლებელი მოვლენები', summary: 'მოვლენათა ალბათობის შეფასება' },
        { id: 'u14-outcomes', title: 'მოსალოდნელი შედეგები', summary: 'შესაძლო შედეგების რაოდენობა' },
        { id: 'u14-most-likely', title: 'ყველაზე სავარაუდო მოვლენები', summary: 'მოვლენათა შედარება შანსების მიხედვით' },
        { id: 'u14-combinations', title: 'კომბინაციები', summary: 'ვარიანტების რაოდენობის გამოთვლა გამრავლებით' },
        { id: 'u14-probability-changes', title: 'ალბათობის გაზრდა და შემცირება', summary: 'მოვლენათა ალბათობის ცვლილების ანალიზი' },
      ],
    },
  ]),
  topic('g4-tsiladebi', 'წილადები', '🍕', 'მთელის ნაწილები, მრიცხველი და მნიშვნელი, რიცხვითი ღერძი, შებრუნებული წილადები, გაყოფა, ტოლი წილადები, შეკრება-გამოკლება, გამრავლება და გამარტივება.', 'yellow', [
    {
      id: 'g4-tsiladebi',
      code: 'U15',
      title: 'წილადები',
      subtopics: [
        { id: 'u15-parts-of-whole', title: 'მთელის ნაწილები (წილადები)', summary: 'წილადის ცნება და ნაწილები' },
        { id: 'u15-numerator-denominator', title: 'მრიცხველისა და მნიშვნელის მნიშვნელობა', summary: 'მრიცხველისა და მნიშვნელის როლი' },
        { id: 'u15-fractions-number-line', title: 'წილადების ამოცნობა რიცხვით ღერძზე', summary: 'წილადების ამოცნობა რიცხვით ღერძზე' },
        { id: 'u15-reciprocal-fractions', title: 'შებრუნებული წილადები', summary: 'შებრუნებული წილადის პოვნა' },
        { id: 'u15-fraction-division', title: 'წილადების გაყოფა', summary: 'წილადის მთელ რიცხვზე გაყოფა' },
        { id: 'u15-equivalent-fractions-problems', title: 'ტოლი წილადების ამოცანები', summary: 'უცნობი წევრის პოვნა ტოლ წილადებში' },
        { id: 'u15-fraction-addition-same-denom', title: 'ტოლი მნიშვნელების მქონე წილადების შეკრება', summary: 'შეკრება საერთო მნიშვნელით' },
        { id: 'u15-fraction-subtraction-same-denom', title: 'ტოლი მნიშვნელების მქონე წილადების გამოკლება', summary: 'გამოკლება საერთო მნიშვნელით' },
        { id: 'u15-fraction-word-problems', title: 'წილადების შეკრებისა და გამოკლების ამოცანები', summary: 'ტექსტური ამოცანები წილადებზე' },
        { id: 'u15-fraction-multiplication-problems', title: 'წილადების გამრავლების ამოცანები', summary: 'რიცხვისა და წილადის ნამრავლი' },
        { id: 'u15-simplifying-fractions', title: 'წილადების გამარტივება', summary: 'წილადის შეკვეცა' },
        { id: 'u15-fraction-multiplication', title: 'წილადების გამრავლება', summary: 'წილადის წილადზე გამრავლება' },
        { id: 'u15-equivalent-fractions', title: 'ტოლი წილადები', summary: 'ეკვივალენტური წილადების ამოცნობა' },
        { id: 'u15-equivalent-fractions-visual', title: 'ტოლი წილადები ილუსტრაციებით', summary: 'ვიზუალური მოდელები და ფართობები' },
      ],
    },
  ]),
  topic('g4-atwiladebi', 'ათწილადები', '🔢', 'ათწილადის ცნება, შედარება, წილადები და ათწილადები, შეკრება და გამოკლება.', 'blue', [
    {
      id: 'g4-atwiladebi',
      code: 'U16',
      title: 'ათწილადები',
      subtopics: [
        { id: 'u16-decimal-concept', title: 'ათწილადის ცნება', summary: 'მეათედები, მეასედები და ათწილადის ჩაწერა' },
        { id: 'u16-decimal-comparison', title: 'ათწილადების შედარება', summary: 'ათწილადების შედარება და დალაგება' },
        { id: 'u16-fractions-to-decimals', title: 'წილადები და ათწილადები', summary: 'ჩვეულებრივი წილადის ათწილადად გადაქცევა' },
        { id: 'u16-decimal-addition', title: 'ათწილადების შეკრება', summary: 'ათწილადების შეკრება სვეტურად' },
        { id: 'u16-decimal-subtraction', title: 'ათწილადების გამოკლება', summary: 'ათწილადების გამოკლება სვეტურად' },
      ],
    },
  ]),
  topic('g4-logika', 'ლოგიკური მსჯელობა', '🧠', 'ჩაფიქრებული რიცხვები, მინიმალური რაოდენობის განსაზღვრა, ორი რიცხვის პოვნა ჯამითა და სხვაობით, ფიგურების თავსატეხები, ასაკის, დროისა და მასშტაბის ამოცანები, გრაფიკები, დალაგება და გამორიცხვის მეთოდი.', 'violet', [
    {
      id: 'g4-logika',
      code: 'U17',
      title: 'ლოგიკური მსჯელობა',
      subtopics: [
        { id: 'u17-thought-numbers', title: 'ჩაფიქრებული რიცხვები', summary: 'უცნობი რიცხვის პოვნა პირდაპირი და საპირისპირო მოქმედებებით' },
        { id: 'u17-minimum-quantity', title: 'მინიმალური რაოდენობის განსაზღვრა', summary: 'რამდენია საკმარისი უარეს შემთხვევაში' },
        { id: 'u17-two-numbers-sum-difference', title: 'ორი რიცხვი ჯამითა და სხვაობით', summary: 'ორი რიცხვის პოვნა ჯამისა და სხვაობის მიხედვით' },
        { id: 'u17-two-numbers-product-quotient', title: 'ორი რიცხვი ნამრავლითა და განაყოფით', summary: 'ორი რიცხვის პოვნა ნამრავლისა და განაყოფის მიხედვით' },
        { id: 'u17-shape-puzzles', title: 'ფიგურების თავსატეხები', summary: 'სიმბოლოების მნიშვნელობის პოვნა' },
        { id: 'u17-age-problems', title: 'ასაკის ამოცანები', summary: 'ასაკის სხვაობა და ცვლილება წლების განმავლობაში' },
        { id: 'u17-time-quantity-problems', title: 'დროისა და რაოდენობის ამოცანები', summary: 'ნაწარმოების, სიჩქარისა და დროის ამოცანები' },
        { id: 'u17-finding-differences', title: 'სხვაობების პოვნა', summary: 'სხვაობის გამოთვლა და შედარება' },
        { id: 'u17-segment-problems', title: 'მონაკვეთების ამოცანები', summary: 'მონაკვეთის ნაწილებისა და სიგრძის პოვნა' },
        { id: 'u17-scale', title: 'მასშტაბის გამოყენება', summary: 'რუკის მასშტაბით რეალური მანძილის პოვნა' },
        { id: 'u17-graphs', title: 'გრაფიკებთან მუშაობა', summary: 'დიაგრამის მონაცემების წაკითხვა და შედარება' },
        { id: 'u17-number-ordering', title: 'რიცხვების დალაგება', summary: 'ზრდადობით და კლებადობით დალაგება' },
        { id: 'u17-condition-matching', title: 'პირობების შესაბამისობა', summary: 'პირობის დამაკმაყოფილებელი რიცხვის პოვნა' },
        { id: 'u17-elimination', title: 'გამორიცხვის მეთოდი', summary: 'ლოგიკური ამოცანები გამორიცხვით' },
        { id: 'u17-digit-finding', title: 'რიცხვის ციფრების პოვნა', summary: 'ციფრებისა და რიცხვის აღდგენა' },
      ],
    },
  ]),
  topic('g4-kanonzomierebebi', 'კანონზომიერებები', '🔄', 'რიცხვითი მიმდევრობები, შემდეგი ელემენტის არჩევა და რიცხვითი სამკუთხედები.', 'teal', [
    {
      id: 'g4-kanonzomierebebi',
      code: 'U18',
      title: 'კანონზომიერებები',
      subtopics: [
        { id: 'u18-number-sequences', title: 'რიცხვითი მიმდევრობები', summary: 'კანონზომიერების გაგრძელება და გამოტოვებული წევრები' },
        { id: 'u18-next-element', title: 'შემდეგი ელემენტის არჩევა', summary: 'შემდეგი რიცხვის პოვნა მიმდევრობაში' },
        { id: 'u18-number-triangles', title: 'რიცხვითი სამკუთხედები', summary: 'რიცხვების კავშირი სამკუთხედში' },
      ],
    },
  ]),
];

const g5: Topic[] = [
  topic('g5-numbers-place-value', 'რიცხვითი სისტემა და ადგილობრივი მნიშვნელობა', '🔢',
    'ადგილების მიხედვით რიცხვის ჩაწერა, რომაული ციფრები, უარყოფითი რიცხვები, დამრგვალება და ათის ხარისხები.', 'blue', [
    {
      id: 'g5-numbers-place-value',
      code: 'U01',
      title: 'რიცხვითი სისტემა და ადგილობრივი მნიშვნელობა',
      subtopics: [
        { id: 'u01-04', title: 'რიცხვის ჩაწერა ადგილების მიხედვით', summary: 'ათასეულები, ასეულები, ათეულები და ერთეულები' },
        { id: 'u01-05', title: 'გამოტოვებული ადგილი', summary: 'რომელ ადგილზე დგას ციფრი' },
        { id: 'u01-06', title: 'რომაული ციფრები', summary: 'რომაული რიცხვების წაკითხვა და ჩაწერა' },
        { id: 'u01-07', title: 'უარყოფითი რიცხვები', summary: 'ტემპერატურა და რიცხვითი ღერძი' },
        { id: 'u01-08', title: 'დამრგვალება', summary: 'დამრგვალება ათეულებამდე, ასეულებამდე და ათასეულებამდე' },
        { id: 'u01-09', title: 'ლუწი და კენტი, ათის ხარისხები', summary: 'ათის ხარისხების ჩაწერა' },
      ],
    },
  ]),
  topic('g5-divisibility', 'გამყოფები, ჯერადები და გაყოფადობა', '🧮',
    'მარტივი და შედგენილი რიცხვები, უდიდესი საერთო გამყოფი, უმცირესი საერთო ჯერადი და გაყოფადობის ნიშნები.', 'violet', [
    {
      id: 'g5-divisibility',
      code: 'U02',
      title: 'გამყოფები, ჯერადები და გაყოფადობა',
      subtopics: [
        { id: 'u02-01', title: 'მარტივი და შედგენილი რიცხვები', summary: 'მარტივი რიცხვის ამოცნობა' },
        { id: 'u02-02', title: 'გამყოფები და ჯერადები', summary: 'რიცხვის გამყოფების დათვლა' },
        { id: 'u02-03', title: 'მარტივ მამრავლებად დაშლა', summary: 'დაშლა მარტივ მამრავლებად' },
        { id: 'u02-04', title: 'უდიდესი საერთო გამყოფი', summary: 'ორი რიცხვის უსგ' },
        { id: 'u02-05', title: 'უმცირესი საერთო ჯერადი', summary: 'ორი რიცხვის უსჯ' },
        { id: 'u02-06', title: 'გაყოფადობა 2-ზე და 4-ზე', summary: 'გაყოფადობის ნიშნები 2-ზე და 4-ზე' },
        { id: 'u02-07', title: 'გაყოფადობა 3-ზე და 9-ზე', summary: 'გაყოფადობის ნიშნები 3-ზე და 9-ზე' },
        { id: 'u02-08', title: 'გაყოფადობა 5-ზე და 10-ზე', summary: 'გაყოფადობის ნიშნები 5-ზე და 10-ზე' },
        { id: 'u02-09', title: 'გაყოფადობა 6-ზე', summary: 'გაყოფადობა 2-ზე და 3-ზე ერთდროულად' },
      ],
    },
  ]),
  topic('g5-add-sub-whole', 'ნატურალური რიცხვების შეკრება და გამოკლება', '➕',
    'თვისებები, მილიარდამდე შეკრება და გამოკლება, მიახლოებითი გამოთვლა, თანხები, უტოლობები და რიცხვითი პირამიდები.', 'teal', [
    {
      id: 'g5-add-sub-whole',
      code: 'U03',
      title: 'ნატურალური რიცხვების შეკრება და გამოკლება',
      subtopics: [
        { id: 'u03-01', title: 'შეკრებისა და გამოკლების თვისებები', summary: 'უცნობი შესაკრების პოვნა' },
        { id: 'u03-02', title: 'შეკრება და გამოკლება მილიარდამდე', summary: 'მრავალნიშნა რიცხვების შეკრება და გამოკლება' },
        { id: 'u03-03', title: 'ჯამისა და სხვაობის შეფასება', summary: 'მიახლოებითი გამოთვლა დამრგვალებით' },
        { id: 'u03-04', title: 'თანხები', summary: 'ლარი და თეთრი ერთად' },
        { id: 'u03-05', title: 'უტოლობები', summary: 'რომელი ნიშანია სწორი' },
        { id: 'u03-06', title: 'რიცხვითი პირამიდები', summary: 'პირამიდის ზედა უჯრის შევსება' },
      ],
    },
  ]),
  topic('g5-multiplication', 'გამრავლება', '✖️',
    'თვისებები, ერთნიშნაზე და სვეტით გამრავლება, გამოტოვებული ციფრები, ნულებით დაბოლოებული რიცხვები, შეფასება და ამოცანები.', 'pink', [
    {
      id: 'g5-multiplication',
      code: 'U04',
      title: 'გამრავლება',
      subtopics: [
        { id: 'u04-01', title: 'თვისებები', summary: 'განრიგებადობის თვისება' },
        { id: 'u04-02', title: 'ერთნიშნა რიცხვზე გამრავლება', summary: 'ორნიშნა რიცხვის გამრავლება ერთნიშნაზე' },
        { id: 'u04-03', title: 'სვეტით გამრავლება', summary: 'ორნიშნა რიცხვების გამრავლება' },
        { id: 'u04-04', title: 'გამოტოვებული ციფრები', summary: 'უცნობი მამრავლის პოვნა' },
        { id: 'u04-05', title: 'ნულით დაბოლოებული რიცხვები', summary: 'მრგვალი რიცხვების გამრავლება' },
        { id: 'u04-06', title: 'ნამრავლის შეფასება', summary: 'მიახლოებითი ნამრავლი' },
        { id: 'u04-07', title: 'სამი და მეტი მამრავლი', summary: 'რამდენიმე მამრავლის ნამრავლი' },
        { id: 'u04-08', title: 'სამნიშნა სამნიშნაზე', summary: 'სამნიშნა რიცხვების სვეტური გამრავლება' },
        { id: 'u04-09', title: 'ამოცანები და უტოლობები', summary: 'გამრავლების ტექსტური ამოცანები' },
      ],
    },
  ]),
  topic('g5-division', 'გაყოფა', '➗',
    'თვისებები, ნულებით დაბოლოებული რიცხვები, სვეტად გაყოფა, ნაშთი, შეფასება, თანხების გაყოფა და ამოცანები.', 'blue', [
    {
      id: 'g5-division',
      code: 'U05',
      title: 'გაყოფა',
      subtopics: [
        { id: 'u05-01', title: 'თვისებები', summary: 'გაყოფის თვისებები' },
        { id: 'u05-02', title: 'ნულით დაბოლოებული რიცხვები', summary: 'მრგვალი რიცხვების გაყოფა' },
        { id: 'u05-03', title: 'კუთხით გაყოფა', summary: 'სამნიშნა რიცხვის გაყოფა' },
        { id: 'u05-04', title: 'გაყოფა ნაშთით', summary: 'ნაშთის პოვნა' },
        { id: 'u05-05', title: 'განაყოფის შეფასება', summary: 'მიახლოებითი განაყოფი' },
        { id: 'u05-06', title: 'თანხის განაწილება', summary: 'თეთრების თანაბრად გაყოფა' },
        { id: 'u05-07', title: 'რიცხვის შეცვლა უნაშთო გაყოფისთვის', summary: 'რამდენი უნდა დაემატოს უნაშთო გაყოფისთვის' },
        { id: 'u05-08', title: 'გაყოფის ამოცანები', summary: 'გაყოფის ტექსტური ამოცანები' },
      ],
    },
  ]),
  topic('g5-multi-step-speed', 'მრავალსაფეხურიანი ამოცანები და სიჩქარე', '⏱️',
    'ორ-სამმოქმედებიანი ამოცანები, დროის შუალედში გავლილი მანძილი, სიჩქარე, დრო და მანძილი.', 'yellow', [
    {
      id: 'g5-multi-step-speed',
      code: 'U06',
      title: 'მრავალსაფეხურიანი ამოცანები და სიჩქარე',
      subtopics: [
        { id: 'u06-01', title: 'ამოცანები მოქმედებებით I', summary: 'ორი მოქმედების ამოცანა' },
        { id: 'u06-02', title: 'ამოცანები მოქმედებებით II', summary: 'სამი მოქმედების ამოცანა' },
        { id: 'u06-03', title: 'რაოდენობა დროის შუალედში', summary: 'დროის შუალედის გამოთვლა' },
        { id: 'u06-04', title: 'მანძილის პოვნა', summary: 'მანძილი = სიჩქარე × დრო' },
        { id: 'u06-05', title: 'დროის პოვნა', summary: 'დრო = მანძილი ÷ სიჩქარე' },
        { id: 'u06-06', title: 'სიჩქარის პოვნა', summary: 'სიჩქარე = მანძილი ÷ დრო' },
      ],
    },
  ]),
  topic('g5-fractions-mixed', 'წილადები და შერეული რიცხვები', '🧁',
    'მთელის ნაწილები, წილადების შედარება და შეკვეცა, საერთო მნიშვნელი, არასწორი წილადები, შერეული რიცხვები და ურთიერთშებრუნებული წილადები.', 'violet', [
    {
      id: 'g5-fractions-mixed',
      code: 'U07',
      title: 'წილადები და შერეული რიცხვები',
      subtopics: [
        { id: 'u07-01', title: 'მთელის ნაწილები', summary: 'მთელის ნაწილის პოვნა' },
        { id: 'u07-02', title: 'იგივე მნიშვნელის წილადების შედარება', summary: 'ერთი მნიშვნელის წილადების შედარება' },
        { id: 'u07-03', title: 'სხვადასხვა მნიშვნელის წილადების შედარება', summary: 'სხვადასხვა მნიშვნელის წილადების შედარება' },
        { id: 'u07-04', title: 'წილადის შეკვეცა', summary: 'წილადის შეკვეცა' },
        { id: 'u07-05', title: 'საერთო მნიშვნელი', summary: 'საერთო მნიშვნელის პოვნა' },
        { id: 'u07-06', title: 'ტოლი წილადები', summary: 'ტოლი წილადების პოვნა' },
        { id: 'u07-07', title: 'სწორი და არასწორი წილადები', summary: 'სწორი თუ არასწორი წილადი' },
        { id: 'u07-08', title: 'შერეული რიცხვები', summary: 'შერეული რიცხვის ამოკითხვა' },
        { id: 'u07-09', title: 'შერეულიდან არასწორ წილადამდე', summary: 'შერეული რიცხვის არასწორ წილადად გადაქცევა' },
        { id: 'u07-10', title: 'წილადების შედარება და დალაგება', summary: 'სამი წილადიდან უდიდესის პოვნა' },
        { id: 'u07-11', title: 'ურთიერთშებრუნებული წილადები', summary: 'შებრუნებული წილადის პოვნა' },
        { id: 'u07-12', title: 'წილადები რიცხვით ღერძზე', summary: 'წილადის მდებარეობა რიცხვით ღერძზე' },
      ],
    },
  ]),
  topic('g5-add-sub-fractions', 'წილადების შეკრება და გამოკლება', '🍰',
    'მეათედები და მეასედები, ერთი და სხვადასხვა მნიშვნელი, შერეული რიცხვები, შეფასება და წილადიანი ამოცანები.', 'teal', [
    {
      id: 'g5-add-sub-fractions',
      code: 'U08',
      title: 'წილადების შეკრება და გამოკლება',
      subtopics: [
        { id: 'u08-01', title: 'მეათედები და მეასედები', summary: 'მეათედების მეასედებად გადაქცევა' },
        { id: 'u08-02', title: 'ერთი მნიშვნელის წილადები', summary: 'ერთი მნიშვნელის წილადების შეკრება' },
        { id: 'u08-03', title: 'ერთი მნიშვნელის შერეული რიცხვები', summary: 'შერეული რიცხვების შეკრება' },
        { id: 'u08-04', title: 'სხვადასხვა მნიშვნელის წილადები', summary: 'სხვადასხვა მნიშვნელის წილადების შეკრება' },
        { id: 'u08-05', title: 'შერეული რიცხვები', summary: 'შერეული რიცხვების გამოკლება' },
        { id: 'u08-06', title: 'ჯამისა და სხვაობის შეფასება', summary: 'წილადების ჯამის შეფასება' },
        { id: 'u08-07', title: 'ჯამებისა და სხვაობების შედარება', summary: 'ორი სხვაობის შედარება' },
        { id: 'u08-08', title: 'გამოტოვებული წილადი, განტოლებები, უტოლობები', summary: 'უცნობი წილადის პოვნა' },
        { id: 'u08-09', title: 'ამოცანები წილადებზე', summary: 'წილადიანი ტექსტური ამოცანა' },
      ],
    },
  ]),
  topic('g5-multiply-fractions', 'წილადების გამრავლება', '✳️',
    'წილადი მთელ რიცხვზე, ორი წილადი, შერეული რიცხვები, ნამრავლების შედარება და სამი მამრავლი.', 'green', [
    {
      id: 'g5-multiply-fractions',
      code: 'U09',
      title: 'წილადების გამრავლება',
      subtopics: [
        { id: 'u09-01', title: 'წილადი მთელ რიცხვზე', summary: 'წილადის გამრავლება მთელზე' },
        { id: 'u09-02', title: 'ორი წილადის გამრავლება', summary: 'ორი წილადის ნამრავლი' },
        { id: 'u09-03', title: 'წილადი შერეულ რიცხვზე', summary: 'წილადის გამრავლება შერეულზე' },
        { id: 'u09-04', title: 'შერეული რიცხვი მთელზე', summary: 'შერეული რიცხვის გამრავლება მთელზე' },
        { id: 'u09-05', title: 'ნამრავლების შედარება', summary: 'წილადის ნამრავლის შედარება' },
        { id: 'u09-06', title: 'სამი და მეტი მამრავლი', summary: 'სამი წილადის ან რიცხვის ნამრავლი' },
        { id: 'u09-07', title: 'ორი შერეული რიცხვი', summary: 'ორი შერეული რიცხვის გამრავლება' },
        { id: 'u09-08', title: 'ამოცანები შერეულ რიცხვებზე', summary: 'წილადიანი ამოცანა შერეულ რიცხვებზე' },
      ],
    },
  ]),
  topic('g5-divide-fractions', 'წილადების გაყოფა', '🪃',
    'წილადის გაყოფა მთელზე, მთელის გაყოფა წილადზე, ორი წილადი, შერეული რიცხვები და ამოცანები.', 'pink', [
    {
      id: 'g5-divide-fractions',
      code: 'U10',
      title: 'წილადების გაყოფა',
      subtopics: [
        { id: 'u10-01', title: 'წილადი მთელ რიცხვზე', summary: 'წილადის გაყოფა მთელზე' },
        { id: 'u10-02', title: 'მთელი რიცხვი წილადზე', summary: 'მთელი რიცხვის გაყოფა წილადზე' },
        { id: 'u10-03', title: 'ორი წილადის გაყოფა', summary: 'ორი წილადის გაყოფა' },
        { id: 'u10-04', title: 'შერეული რიცხვების გაყოფა', summary: 'შერეული რიცხვის გაყოფა' },
        { id: 'u10-05', title: 'ამოცანები წილადების გაყოფაზე', summary: 'წილადების გაყოფის ტექსტური ამოცანა' },
      ],
    },
  ]),
  topic('g5-decimals', 'ათწილადები', '🔟',
    'ათწილადის ნაწილები, შედარება, გადაქცევა, შეკრება, გამოკლება, გამრავლება, გაყოფა და ამოცანები.', 'blue', [
    {
      id: 'g5-decimals',
      code: 'U11',
      title: 'ათწილადები',
      subtopics: [
        { id: 'u11-01', title: 'ათწილადის ნაწილები', summary: 'ათწილადის რიცხვის ჩაწერა' },
        { id: 'u11-02', title: 'ათწილადების შედარება', summary: 'ორი ათწილადის შედარება' },
        { id: 'u11-03', title: 'ათწილადის გადაქცევა', summary: 'ათწილადიდან წილადამდე' },
        { id: 'u11-04', title: 'ათწილადების შეკრება', summary: 'ათწილადების შეკრება' },
        { id: 'u11-05', title: 'ათწილადების გამოკლება', summary: 'ათწილადების გამოკლება' },
        { id: 'u11-06', title: 'ათწილადების გამრავლება', summary: 'ათწილადის გამრავლება 10-ზე, 100-ზე' },
        { id: 'u11-07', title: 'ათწილადების გაყოფა', summary: 'ათწილადის გაყოფა 10-ზე' },
        { id: 'u11-08', title: 'ამოცანები ათწილადებზე', summary: 'ათწილადიანი ტექსტური ამოცანა' },
      ],
    },
  ]),
  topic('g5-percents', 'პროცენტები', '％',
    'რიცხვის პროცენტი, პროცენტის გამოთვლა, ფასდაკლება, წილადები და ათწილადები პროცენტებში.', 'green', [
    {
      id: 'g5-percents',
      code: 'U12',
      title: 'პროცენტები',
      subtopics: [
        { id: 'u12-01', title: 'რიცხვის პროცენტი', summary: 'რიცხვის 10%, 25% ან 50%' },
        { id: 'u12-02', title: 'პროცენტის გამოთვლა', summary: 'რამდენი პროცენტია' },
        { id: 'u12-03', title: 'ფასდაკლება', summary: 'ფასდაკლების შემდეგ ფასი' },
        { id: 'u12-04', title: 'წილადები და პროცენტები', summary: 'წილადის პროცენტად გადაქცევა' },
        { id: 'u12-05', title: 'ათწილადები და პროცენტები', summary: 'ათწილადის პროცენტად გადაქცევა' },
        { id: 'u12-06', title: 'პროცენტის პოვნა', summary: 'მთელის პოვნა პროცენტით' },
        { id: 'u12-07', title: 'ამოცანები პროცენტებზე', summary: 'პროცენტიანი ტექსტური ამოცანა' },
      ],
    },
  ]),
  topic('g5-measurement-scale', 'გაზომვა და მასშტაბი', '📏',
    'მასის, სიგრძის, ფართობისა და მოცულობის ერთეულების გადაყვანა, ერთეულებით მოქმედებები და მასშტაბი.', 'teal', [
    {
      id: 'g5-measurement-scale',
      code: 'U13',
      title: 'გაზომვა და მასშტაბი',
      subtopics: [
        { id: 'u13-01', title: 'მასისა და სიგრძის გადაყვანა', summary: 'კგ ↔ გ და მ ↔ სმ' },
        { id: 'u13-02', title: 'ფართობისა და მოცულობის გადაყვანა', summary: 'მ² ↔ დმ² და ლ ↔ მლ' },
        { id: 'u13-03', title: 'ერთეულებით შეკრება და გამოკლება', summary: 'სიგრძეების შეკრება' },
        { id: 'u13-04', title: 'ერთეულების შედარება', summary: 'სხვადასხვა ერთეულის შედარება' },
        { id: 'u13-05', title: 'ერთეულების ცხრილი', summary: 'ერთეულების ცხრილის შევსება' },
        { id: 'u13-06', title: 'შერეული ერთეულები', summary: 'დარჩენილი ნაწილის პოვნა' },
        { id: 'u13-07', title: 'შედარება ჯერადითა და ფარდობით', summary: 'რამდენჯერ მეტია' },
        { id: 'u13-08', title: 'მასშტაბი და ფართობი', summary: 'რუკის მასშტაბი' },
      ],
    },
  ]),
  topic('g5-coordinate-plane', 'კოორდინატთა სიბრტყე', '🗺️',
    'კოორდინატთა ბადე, ღერძები და კვადრატები, წერტილის კოორდინატები და გადაადგილება.', 'yellow', [
    {
      id: 'g5-coordinate-plane',
      code: 'U14',
      title: 'კოორდინატთა სიბრტყე',
      subtopics: [
        { id: 'u14-01', title: 'კოორდინატთა ბადე', summary: 'ბადის უჯრების დათვლა' },
        { id: 'u14-02', title: 'ღერძები და კვადრატები', summary: 'რომელ კვადრატშია წერტილი' },
        { id: 'u14-03', title: 'წერტილის კოორდინატები', summary: 'კოორდინატების ინტერპრეტაცია' },
        { id: 'u14-04', title: 'სიბრტყე სახაზავით', summary: 'მანძილის პოვნა კოორდინატებით' },
        { id: 'u14-05', title: 'გადაადგილება სიბრტყეზე', summary: 'წერტილის გადაადგილება' },
      ],
    },
  ]),
  topic('g5-geometry', 'გეომეტრია', '📐',
    'კუთხეები, სამკუთხედები, ოთხკუთხედები, სხეულები, წრფეები, წრე, სიმეტრია, პერიმეტრი და ფართობი.', 'pink', [
    {
      id: 'g5-geometry',
      code: 'U15',
      title: 'გეომეტრია',
      subtopics: [
        { id: 'u15-01', title: 'კუთხეების სახეები', summary: 'მახვილი, მართი, ბლაგვი, გაშლილი კუთხეები' },
        { id: 'u15-02', title: 'ტრანსპორტიორი', summary: 'კუთხის გაზომვა' },
        { id: 'u15-03', title: 'უცნობი კუთხეები', summary: 'მოსაზღვრე კუთხეები' },
        { id: 'u15-04', title: 'სამკუთხედები', summary: 'სამკუთხედის ტიპი გვერდებით' },
        { id: 'u15-05', title: 'ოთხკუთხედები', summary: 'ოთხკუთხედის კუთხეების ჯამი' },
        { id: 'u15-06', title: 'მრავალკუთხედები, ღია და დახურული ფიგურები', summary: 'მრავალკუთხედის გვერდების რაოდენობა' },
        { id: 'u15-07', title: 'სხეულები: წახნაგები, კიდეები, წვეროები', summary: 'კუბის ელემენტები' },
        { id: 'u15-08', title: 'წრფეები, სხივები, მონაკვეთები', summary: 'მონაკვეთის სიგრძე კოორდინატებით' },
        { id: 'u15-09', title: 'პარალელური, პერპენდიკულარული, გადამკვეთი წრფეები', summary: 'მართი კუთხის ამოცნობა' },
        { id: 'u15-10', title: 'წრის ნაწილები', summary: 'დიამეტრი და რადიუსი' },
        { id: 'u15-11', title: 'სიმეტრია', summary: 'სიმეტრიის ღერძების რაოდენობა' },
        { id: 'u15-12', title: 'პერიმეტრი', summary: 'მართკუთხედის პერიმეტრი' },
        { id: 'u15-13', title: 'მართკუთხედისა და კვადრატის ფართობი', summary: 'მართკუთხედის ფართობი' },
        { id: 'u15-14', title: 'მართკუთხა სამკუთხედის ფართობი', summary: 'მართკუთხა სამკუთხედის ფართობი' },
        { id: 'u15-15', title: 'შედგენილი ფიგურები და ნაწილები', summary: 'შედგენილი ფიგურის ფართობი' },
      ],
    },
  ]),
  topic('g5-algebra-powers', 'ალგებრა და ხარისხები', '🧠',
    'მოქმედებათა რიგი, რიცხვითი და ასოიანი გამოსახულებები, განტოლებები, კვადრატები, კუბები და ნატურალურ მაჩვენებლიანი ხარისხები.', 'violet', [
    {
      id: 'g5-algebra-powers',
      code: 'U16',
      title: 'ალგებრა და ხარისხები',
      subtopics: [
        { id: 'u16-01', title: 'მოქმედებათა რიგი', summary: 'მოქმედებათა რიგის დაცვა' },
        { id: 'u16-02', title: 'რიცხვითი და ასოიანი გამოსახულებები', summary: 'ასოიანი გამოსახულების მნიშვნელობა' },
        { id: 'u16-03', title: 'განტოლებების ამოხსნა', summary: 'მარტივი განტოლების ამოხსნა' },
        { id: 'u16-04', title: 'კვადრატები და სრული კვადრატები', summary: 'რიცხვის კვადრატი' },
        { id: 'u16-05', title: 'კუბები და სრული კუბები', summary: 'რიცხვის კუბი' },
        { id: 'u16-06', title: 'ხარისხები ნატურალური მაჩვენებლით', summary: 'ხარისხის გამოთვლა' },
      ],
    },
  ]),
  topic('g5-data-chance', 'მონაცემები და ალბათობა', '📊',
    'ცხრილებისა და დიაგრამების წაკითხვა, სიხშირე, ჰიპოთეზა და ალბათობის შეფასება.', 'blue', [
    {
      id: 'g5-data-chance',
      code: 'U17',
      title: 'მონაცემები და ალბათობა',
      subtopics: [
        { id: 'u17-01', title: 'ცხრილების არჩევა', summary: 'ცხრილიდან მონაცემის წაკითხვა' },
        { id: 'u17-02', title: 'პიქტოგრამები', summary: 'პიქტოგრამის წაკითხვა' },
        { id: 'u17-03', title: 'სიხშირის ცხრილები', summary: 'სიხშირის ჯამი' },
        { id: 'u17-04', title: 'წრიული დიაგრამები', summary: 'წრიული დიაგრამის ნაწილი' },
        { id: 'u17-05', title: 'სვეტოვანი დიაგრამები', summary: 'სვეტოვანი დიაგრამის სხვაობა' },
        { id: 'u17-06', title: 'ჰიპოთეზა', summary: 'დაკვირვებიდან დასკვნა' },
        { id: 'u17-07', title: 'გარკვეული, შესაძლებელი, ნაკლებად სავარაუდო, შეუძლებელი', summary: 'მოვლენის ალბათობის შეფასება' },
        { id: 'u17-08', title: 'ალბათობის გამოთვლა', summary: 'ალბათობის გამოთვლა' },
      ],
    },
  ]),
  topic('g5-time-money', 'დრო და ფული', '🕒',
    'დროის ერთეულები, დროზე მოქმედებები, გატარებული დრო, ფულადი ერთეულები, ხურდა, თანხებით მოქმედებები, გადასახადები და დამრგვალება.', 'teal', [
    {
      id: 'g5-time-money',
      code: 'U18',
      title: 'დრო და ფული',
      subtopics: [
        { id: 'u18-01', title: 'დროის ერთეულები', summary: 'საათების წუთებად გადაქცევა' },
        { id: 'u18-02', title: 'მოქმედებები დროზე', summary: 'დროის შუალედის დამატება' },
        { id: 'u18-03', title: 'გატარებული დრო', summary: 'ორ დროს შორის გატარებული წუთები' },
        { id: 'u18-04', title: 'დროის ღერძი', summary: 'მოვლენამდე დარჩენილი დრო' },
        { id: 'u18-05', title: 'ფულადი ერთეულები', summary: 'ლარის თეთრებად გადაქცევა' },
        { id: 'u18-06', title: 'ხურდის დათვლა', summary: 'ხურდის ჯამი' },
        { id: 'u18-07', title: 'მოქმედებები თანხებზე', summary: 'ორი თანხის შეკრება' },
        { id: 'u18-08', title: 'საკმარისი ფული', summary: 'რამდენი თეთრი აკლია' },
        { id: 'u18-09', title: 'ჯარიმები და გადასახადები', summary: 'გადასახადის გამოთვლა' },
        { id: 'u18-10', title: 'თანხების დამრგვალება', summary: 'თანხის დამრგვალება ლარამდე' },
      ],
    },
  ]),
  topic('g5-patterns-logic', 'კანონზომიერებები და ლოგიკა', '🧩',
    'მიმდევრობები, დამატებითი და გამრავლებითი ნიმუშები, ასაკისა და პროპორციის ამოცანები, გზის პოვნა და ორი მოქმედების კავშირი.', 'yellow', [
    {
      id: 'g5-patterns-logic',
      code: 'U19',
      title: 'კანონზომიერებები და ლოგიკა',
      subtopics: [
        { id: 'u19-01', title: 'რომელი არ ერგება ნიმუშს', summary: 'მიმდევრობის დამრღვევი რიცხვი' },
        { id: 'u19-02', title: 'მიმდევრობები შეკრებითა და გამრავლებით', summary: 'მიმდევრობის შემდეგი წევრი' },
        { id: 'u19-03', title: 'მნიშვნელობების პოვნა', summary: 'ორი მოქმედების კავშირი' },
        { id: 'u19-04', title: 'შედარების ამოცანები', summary: 'რამდენჯერ მეტი' },
        { id: 'u19-05', title: 'ასაკის ამოცანები', summary: 'ასაკის სხვაობა' },
        { id: 'u19-06', title: 'პროპორცია', summary: 'პროპორციის ამოცანა' },
        { id: 'u19-07', title: 'ფიგურების შედგენა', summary: 'კვადრატების რაოდენობა ფიგურაში' },
        { id: 'u19-08', title: 'გზის პოვნა (გადათრევა და ჩასმა)', summary: 'გზის სიგრძე ბადეზე' },
        { id: 'u19-09', title: 'ჩაფიქრებული რიცხვი და ციფრები', summary: 'ჩაფიქრებული რიცხვის პოვნა' },
        { id: 'u19-10', title: 'მუშაობა და დრო', summary: 'ერთობლივი მუშაობის ამოცანა' },
        { id: 'u19-11', title: 'მიმართულება და მანძილი', summary: 'ბრუნვა და გზის სიგრძე' },
        { id: 'u19-12', title: 'ორი მოქმედების კავშირი', summary: 'შეკრებისა და გამოკლების კავშირი' },
      ],
    },
  ]),
];

const g6: Topic[] = [
  // <g6-real> — units converted from the academy's U01–U18 banks, in order.
  topic('g6-numbers', 'რიცხვები', '🔢',
    'ნატურალური, მთელი და რაციონალური რიცხვები, მარტივი მამრავლები, უსგ და უსჯ, მოდული და შედარება.', 'blue', [
    {
      id: 'g6-numbers',
      code: 'U01',
      title: 'რიცხვები',
      subtopics: [
        { id: 'u01-01', title: 'ნატურალური და დიდი რიცხვები', summary: 'ნატურალური და დიდი რიცხვები' },
        { id: 'u01-02', title: 'პოზიციური სისტემა', summary: 'პოზიციური სისტემა' },
        { id: 'u01-03', title: 'რომაული რიცხვები', summary: 'რომაული რიცხვები' },
        { id: 'u01-04', title: 'მარტივი და შედგენილი რიცხვები', summary: 'მარტივი და შედგენილი რიცხვები' },
        { id: 'u01-05', title: 'მარტივ მამრავლებად დაშლა', summary: 'მარტივ მამრავლებად დაშლა' },
        { id: 'u01-06', title: 'უდიდესი საერთო გამყოფი და უმცირესი საერთო ჯერადი', summary: 'უდიდესი საერთო გამყოფი და უმცირესი საერთო ჯერადი' },
        { id: 'u01-07', title: 'მთელი და უარყოფითი რიცხვები', summary: 'მთელი და უარყოფითი რიცხვები' },
        { id: 'u01-08', title: 'რაციონალური რიცხვები', summary: 'რაციონალური რიცხვები' },
        { id: 'u01-09', title: 'მოდული', summary: 'მოდული' },
        { id: 'u01-10', title: 'რიცხვებისა და გამოსახულებების შედარება და დალაგება', summary: 'რიცხვებისა და გამოსახულებების შედარება და დალაგება' },
      ],
    },
  ]),
  topic('g6-whole-ops', 'მოქმედებები მთელ რიცხვებზე', '✖️',
    'მთელი რიცხვების გამრავლება და გაყოფა, თვისებები, შეფასება და გაყოფა ნაშთით.', 'violet', [
    {
      id: 'g6-whole-ops',
      code: 'U02',
      title: 'მოქმედებები მთელ რიცხვებზე',
      subtopics: [
        { id: 'u02-01', title: 'მთელი რიცხვების ნამრავლი', summary: 'მთელი რიცხვების ნამრავლი' },
        { id: 'u02-02', title: 'მთელი რიცხვების განაყოფი', summary: 'მთელი რიცხვების განაყოფი' },
        { id: 'u02-03', title: 'გამრავლების თვისებები', summary: 'გამრავლების თვისებები' },
        { id: 'u02-04', title: 'გაყოფის თვისებები', summary: 'გაყოფის თვისებები' },
        { id: 'u02-05', title: 'ნულით დამთავრებული რიცხვების გამრავლება', summary: 'ნულით დამთავრებული რიცხვების გამრავლება' },
        { id: 'u02-06', title: 'ნულით დამთავრებული რიცხვების გაყოფა', summary: 'ნულით დამთავრებული რიცხვების გაყოფა' },
        { id: 'u02-07', title: 'დიდი რიცხვების გაყოფა', summary: 'დიდი რიცხვების გაყოფა' },
        { id: 'u02-08', title: 'სამი ან მეტი რიცხვის ნამრავლი', summary: 'სამი ან მეტი რიცხვის ნამრავლი' },
        { id: 'u02-09', title: 'ნამრავლისა და განაყოფის მიახლოებითი შეფასება', summary: 'ნამრავლისა და განაყოფის მიახლოებითი შეფასება' },
        { id: 'u02-10', title: 'გამრავლებისა და გაყოფის ამოცანები', summary: 'გამრავლებისა და გაყოფის ამოცანები' },
        { id: 'u02-11', title: 'გაყოფა ნაშთით', summary: 'გაყოფა ნაშთით' },
        { id: 'u02-12', title: 'რიცხვითი გამოსახულებების შედგენა', summary: 'რიცხვითი გამოსახულებების შედგენა' },
      ],
    },
  ]),
  topic('g6-negative-rational', 'უარყოფითი და რაციონალური რიცხვები', '➖',
    'მოქმედებები უარყოფით და რაციონალურ რიცხვებზე.', 'teal', [
    {
      id: 'g6-negative-rational',
      code: 'U03',
      title: 'უარყოფითი და რაციონალური რიცხვები',
      subtopics: [
        { id: 'u03-01', title: 'უარყოფითი რიცხვების შეკრება და გამოკლება', summary: 'უარყოფითი რიცხვების შეკრება და გამოკლება' },
        { id: 'u03-02', title: 'უარყოფითი რიცხვების გამრავლება და გაყოფა', summary: 'უარყოფითი რიცხვების გამრავლება და გაყოფა' },
        { id: 'u03-03', title: 'რაციონალური რიცხვების შეკრება და გამოკლება', summary: 'რაციონალური რიცხვების შეკრება და გამოკლება' },
        { id: 'u03-04', title: 'რაციონალური რიცხვების გამრავლება და გაყოფა', summary: 'რაციონალური რიცხვების გამრავლება და გაყოფა' },
      ],
    },
  ]),
  topic('g6-fractions', 'წილადები და შერეული რიცხვები', '🍰',
    'წილადები და შერეული რიცხვები: შეკვეცა, შედარება და ოთხი მოქმედება.', 'pink', [
    {
      id: 'g6-fractions',
      code: 'U04',
      title: 'წილადები და შერეული რიცხვები',
      subtopics: [
        { id: 'u04-01', title: 'წილადები და შერეული რიცხვები', summary: 'წილადები და შერეული რიცხვები' },
        { id: 'u04-02', title: 'ტოლი წილადები და შეკვეცა', summary: 'ტოლი წილადები და შეკვეცა' },
        { id: 'u04-03', title: 'საერთო მნიშვნელი', summary: 'საერთო მნიშვნელი' },
        { id: 'u04-04', title: 'წილადების შედარება', summary: 'წილადების შედარება' },
        { id: 'u04-05', title: 'ერთნაირმნიშვნელიანი წილადების შეკრება და გამოკლება', summary: 'ერთნაირმნიშვნელიანი წილადების შეკრება და გამოკლება' },
        { id: 'u04-06', title: 'სხვადასხვამნიშვნელიანი წილადების შეკრება და გამოკლება', summary: 'სხვადასხვამნიშვნელიანი წილადების შეკრება და გამოკლება' },
        { id: 'u04-07', title: 'ჯამებისა და სხვაობების შედარება', summary: 'ჯამებისა და სხვაობების შედარება' },
        { id: 'u04-08', title: 'შერეული რიცხვების შეკრება და გამოკლება', summary: 'შერეული რიცხვების შეკრება და გამოკლება' },
        { id: 'u04-09', title: 'შერეული რიცხვების ჯამისა და სხვაობის მიახლოებითი შეფასება', summary: 'შერეული რიცხვების ჯამისა და სხვაობის მიახლოებითი შეფასება' },
        { id: 'u04-10', title: 'წილადის გამრავლება მთელ რიცხვზე', summary: 'წილადის გამრავლება მთელ რიცხვზე' },
        { id: 'u04-11', title: 'ორი ან მეტი წილადის ნამრავლი', summary: 'ორი ან მეტი წილადის ნამრავლი' },
        { id: 'u04-12', title: 'წილადების ნამრავლის მიახლოებითი შეფასება', summary: 'წილადების ნამრავლის მიახლოებითი შეფასება' },
        { id: 'u04-13', title: 'შერეული რიცხვების ნამრავლი', summary: 'შერეული რიცხვების ნამრავლი' },
        { id: 'u04-14', title: 'შებრუნებული წილადები', summary: 'შებრუნებული წილადები' },
        { id: 'u04-15', title: 'წილადების გაყოფა მთელ რიცხვებზე', summary: 'წილადების გაყოფა მთელ რიცხვებზე' },
        { id: 'u04-16', title: 'წილადებისა და შერეული რიცხვების გაყოფა', summary: 'წილადებისა და შერეული რიცხვების გაყოფა' },
        { id: 'u04-17', title: 'წილადიანი გამოსახულებების გამარტივება', summary: 'წილადიანი გამოსახულებების გამარტივება' },
      ],
    },
  ]),
  topic('g6-decimals', 'ათწილადები', '🔟',
    'ათწილადები: თანრიგები, შედარება, დამრგვალება და ოთხი მოქმედება.', 'yellow', [
    {
      id: 'g6-decimals',
      code: 'U05',
      title: 'ათწილადები',
      subtopics: [
        { id: 'u05-01', title: 'ათწილადების მნიშვნელობა და გამოყენება', summary: 'ათწილადების მნიშვნელობა და გამოყენება' },
        { id: 'u05-02', title: 'ათწილადების თანრიგები', summary: 'ათწილადების თანრიგები' },
        { id: 'u05-03', title: 'ათწილადები და შერეული რიცხვები', summary: 'ათწილადები და შერეული რიცხვები' },
        { id: 'u05-04', title: 'ათწილადების შედარება და დალაგება', summary: 'ათწილადების შედარება და დალაგება' },
        { id: 'u05-05', title: 'ათწილადების დამრგვალება', summary: 'ათწილადების დამრგვალება' },
        { id: 'u05-06', title: 'ათწილადების შეკრება', summary: 'ათწილადების შეკრება' },
        { id: 'u05-07', title: 'ათწილადების გამოკლება', summary: 'ათწილადების გამოკლება' },
        { id: 'u05-08', title: 'ათწილადების გამრავლება', summary: 'ათწილადების გამრავლება' },
        { id: 'u05-09', title: 'ნამრავლის მიახლოებითი შეფასება', summary: 'ნამრავლის მიახლოებითი შეფასება' },
        { id: 'u05-10', title: 'ათწილადის გაყოფა ნატურალურ რიცხვზე', summary: 'ათწილადის გაყოფა ნატურალურ რიცხვზე' },
        { id: 'u05-11', title: 'ათწილადების გაყოფა', summary: 'ათწილადების გაყოფა' },
        { id: 'u05-12', title: 'განაყოფის მიახლოებითი შეფასება', summary: 'განაყოფის მიახლოებითი შეფასება' },
        { id: 'u05-13', title: 'ათწილადების გამრავლება და გაყოფა 10-ის ხარისხებზე', summary: 'ათწილადების გამრავლება და გაყოფა 10-ის ხარისხებზე' },
        { id: 'u05-14', title: 'უტოლობები ათწილადებით', summary: 'უტოლობები ათწილადებით' },
      ],
    },
  ]),
  topic('g6-fraction-decimal', 'წილადები, ათწილადები და რაციონალური რიცხვები ერთად', '🔁',
    'წილადების, ათწილადებისა და რაციონალური რიცხვების ერთობლივი გამოყენება.', 'green', [
    {
      id: 'g6-fraction-decimal',
      code: 'U06',
      title: 'წილადები, ათწილადები და რაციონალური რიცხვები ერთად',
      subtopics: [
        { id: 'u06-01', title: 'წილადის ათწილადად და ათწილადის წილადად გარდაქმნა', summary: 'წილადის ათწილადად და ათწილადის წილადად გარდაქმნა' },
        { id: 'u06-02', title: 'წილადებისა და ათწილადების შედარება', summary: 'წილადებისა და ათწილადების შედარება' },
        { id: 'u06-03', title: 'კავშირი წილადებს, ათწილადებსა და შერეულ რიცხვებს შორის', summary: 'კავშირი წილადებს, ათწილადებსა და შერეულ რიცხვებს შორის' },
        { id: 'u06-04', title: 'რიცხვების დალაგება', summary: 'რიცხვების დალაგება' },
        { id: 'u06-05', title: 'მოქმედებები წილადებსა და ათწილადებზე', summary: 'მოქმედებები წილადებსა და ათწილადებზე' },
        { id: 'u06-06', title: 'მრავალსაფეხურიანი მაგალითები', summary: 'მრავალსაფეხურიანი მაგალითები' },
      ],
    },
  ]),
  topic('g6-percent', 'პროცენტი', '％',
    'რიცხვის პროცენტი, ფასდაკლება, პროცენტი წილადად და ათწილადად, გადასახადი.', 'blue', [
    {
      id: 'g6-percent',
      code: 'U07',
      title: 'პროცენტი',
      subtopics: [
        { id: 'u07-01', title: 'დიდი რიცხვის პროცენტის გამოთვლა', summary: 'დიდი რიცხვის პროცენტის გამოთვლა' },
        { id: 'u07-02', title: 'ფასდაკლებები', summary: 'ფასდაკლებები' },
        { id: 'u07-03', title: 'წილადები და პროცენტები', summary: 'წილადები და პროცენტები' },
        { id: 'u07-04', title: 'ათწილადები და პროცენტები', summary: 'ათწილადები და პროცენტები' },
        { id: 'u07-05', title: 'პროცენტის გამოსახვა ილუსტრაციებით', summary: 'პროცენტის გამოსახვა ილუსტრაციებით' },
        { id: 'u07-06', title: 'გადასახადი', summary: 'გადასახადი' },
      ],
    },
  ]),
  topic('g6-money', 'ფული', '💰',
    'მოქმედებები ფულზე, თანხის გაყოფა, საკმარისობა და ჯარიმები.', 'violet', [
    {
      id: 'g6-money',
      code: 'U08',
      title: 'ფული',
      subtopics: [
        { id: 'u08-01', title: 'ფულზე მოქმედებები', summary: 'ფულზე მოქმედებები' },
        { id: 'u08-02', title: 'ამოცანები ფულზე', summary: 'ამოცანები ფულზე' },
        { id: 'u08-03', title: 'თანხის გაყოფა და დამრგვალება', summary: 'თანხის გაყოფა და დამრგვალება' },
        { id: 'u08-04', title: 'საკმარისია თუ არა თანხა?', summary: 'საკმარისია თუ არა თანხა?' },
        { id: 'u08-05', title: 'ჯარიმები', summary: 'ჯარიმები' },
      ],
    },
  ]),
  topic('g6-multistep', 'მრავალსაფეხურიანი ამოცანები', '🧠',
    'მრავალსაფეხურიანი ამოცანები მთელ, წილად და ათწილად რიცხვებზე.', 'teal', [
    {
      id: 'g6-multistep',
      code: 'U09',
      title: 'მრავალსაფეხურიანი ამოცანები',
      subtopics: [
        { id: 'u09-01', title: 'ამოცანები მთელ რიცხვებზე', summary: 'ამოცანები მთელ რიცხვებზე' },
        { id: 'u09-02', title: 'ამოცანები დადებით და უარყოფით რიცხვებზე', summary: 'ამოცანები დადებით და უარყოფით რიცხვებზე' },
        { id: 'u09-03', title: 'უტოლობები და შერეული მოქმედებები', summary: 'უტოლობები და შერეული მოქმედებები' },
        { id: 'u09-04', title: 'ამოცანები წილადებზე', summary: 'ამოცანები წილადებზე' },
        { id: 'u09-05', title: 'ამოცანები ათწილადებზე', summary: 'ამოცანები ათწილადებზე' },
        { id: 'u09-06', title: 'შერეული ამოცანები', summary: 'შერეული ამოცანები' },
        { id: 'u09-07', title: 'ამოცანების მიახლოებითი გამოთვლა', summary: 'ამოცანების მიახლოებითი გამოთვლა' },
        { id: 'u09-08', title: 'ზედმეტი ან არასაკმარისი მონაცემები', summary: 'ზედმეტი ან არასაკმარისი მონაცემები' },
        { id: 'u09-09', title: 'დრო, სიჩქარე და მანძილი', summary: 'დრო, სიჩქარე და მანძილი' },
      ],
    },
  ]),
  topic('g6-algebra', 'ალგებრა', '🧩',
    'გამოსახულებები, თვისებები, განტოლებები და უტოლობები.', 'pink', [
    {
      id: 'g6-algebra',
      code: 'U10',
      title: 'ალგებრა',
      subtopics: [
        { id: 'u10-01', title: 'მსგავსი წევრების დაჯგუფება', summary: 'მსგავსი წევრების დაჯგუფება' },
        { id: 'u10-02', title: 'განაწილებადობის კანონი', summary: 'განაწილებადობის კანონი' },
        { id: 'u10-03', title: 'გადანაცვლებადობისა და ჯუფთებადობის კანონები', summary: 'გადანაცვლებადობისა და ჯუფთებადობის კანონები' },
        { id: 'u10-04', title: 'უცნობი მამრავლი', summary: 'უცნობი მამრავლი' },
        { id: 'u10-05', title: 'გამოსახულებები ერთი ცვლადით', summary: 'გამოსახულებები ერთი ცვლადით' },
        { id: 'u10-06', title: 'გამოსახულებები ორი ცვლადით', summary: 'გამოსახულებები ორი ცვლადით' },
        { id: 'u10-07', title: 'გამოსახულებების გამარტივება', summary: 'გამოსახულებების გამარტივება' },
        { id: 'u10-08', title: 'გამოსახულების მნიშვნელობის პოვნა', summary: 'გამოსახულების მნიშვნელობის პოვნა' },
        { id: 'u10-09', title: 'განტოლებები ერთი მოქმედებით', summary: 'განტოლებები ერთი მოქმედებით' },
        { id: 'u10-10', title: 'განტოლებები ორი მოქმედებით', summary: 'განტოლებები ორი მოქმედებით' },
        { id: 'u10-11', title: 'მრავალსაფეხურიანი გამოსახულებები', summary: 'მრავალსაფეხურიანი გამოსახულებები' },
        { id: 'u10-12', title: 'აკმაყოფილებს თუ არა ((x,y)) ტოლობას?', summary: 'აკმაყოფილებს თუ არა ((x,y)) ტოლობას?' },
        { id: 'u10-13', title: 'უტოლობები', summary: 'უტოლობები' },
        { id: 'u10-14', title: 'განტოლებები ათწილადებითა და წილადებით', summary: 'განტოლებები ათწილადებითა და წილადებით' },
        { id: 'u10-15', title: 'გამოსახულებების შედგენა ასოებით', summary: 'გამოსახულებების შედგენა ასოებით' },
      ],
    },
  ]),
  topic('g6-measure-time', 'გაზომვა და დრო', '⏱️',
    'მასშტაბი, სიგრძის ერთეულები, ტემპერატურა და დრო.', 'yellow', [
    {
      id: 'g6-measure-time',
      code: 'U11',
      title: 'გაზომვა და დრო',
      subtopics: [
        { id: 'u11-01', title: 'მასშტაბი', summary: 'მასშტაბი' },
        { id: 'u11-02', title: 'სიდიდის მიახლოებითი შეფასება', summary: 'სიდიდის მიახლოებითი შეფასება' },
        { id: 'u11-03', title: 'სიგრძის ერთეულები', summary: 'სიგრძის ერთეულები' },
        { id: 'u11-04', title: 'მილები და კილომეტრები', summary: 'მილები და კილომეტრები' },
        { id: 'u11-05', title: 'საზომი ერთეულების გარდაქმნა', summary: 'საზომი ერთეულების გარდაქმნა' },
        { id: 'u11-06', title: 'დადებითი და უარყოფითი ტემპერატურა', summary: 'დადებითი და უარყოფითი ტემპერატურა' },
        { id: 'u11-07', title: 'ფარენჰაიტი და ცელსიუსი', summary: 'ფარენჰაიტი და ცელსიუსი' },
        { id: 'u11-08', title: 'ამოცანები დროზე', summary: 'ამოცანები დროზე' },
        { id: 'u11-09', title: 'დროის ერთეულები, თანმიმდევრობა და მართვა', summary: 'დროის ერთეულები, თანმიმდევრობა და მართვა' },
      ],
    },
  ]),
  topic('g6-coordinates', 'საკოორდინატო სიბრტყე და სიმეტრია', '📍',
    'საკოორდინატო სიბრტყე, გადაადგილება და სიმეტრია.', 'green', [
    {
      id: 'g6-coordinates',
      code: 'U12',
      title: 'საკოორდინატო სიბრტყე და სიმეტრია',
      subtopics: [
        { id: 'u12-01', title: 'საკოორდინატო სიბრტყე', summary: 'საკოორდინატო სიბრტყე' },
        { id: 'u12-02', title: 'საკოორდინატო სიბრტყის მეოთხედები და ღერძები', summary: 'საკოორდინატო სიბრტყის მეოთხედები და ღერძები' },
        { id: 'u12-03', title: 'წერტილის პოვნა', summary: 'წერტილის პოვნა' },
        { id: 'u12-04', title: 'გადაადგილება საკოორდინატო სიბრტყეზე', summary: 'გადაადგილება საკოორდინატო სიბრტყეზე' },
        { id: 'u12-05', title: 'ღერძული სიმეტრია', summary: 'ღერძული სიმეტრია' },
        { id: 'u12-06', title: 'ცენტრალური სიმეტრია', summary: 'ცენტრალური სიმეტრია' },
      ],
    },
  ]),
  topic('g6-powers-roots', 'ხარისხები და ფესვები', '√',
    'ხარისხი, კვადრატი, კუბი და ფესვები.', 'blue', [
    {
      id: 'g6-powers-roots',
      code: 'U13',
      title: 'ხარისხები და ფესვები',
      subtopics: [
        { id: 'u13-01', title: 'ხარისხი და ფართობი', summary: 'ხარისხი და ფართობი' },
        { id: 'u13-02', title: 'ფესვი და გაყოფა', summary: 'ფესვი და გაყოფა' },
        { id: 'u13-03', title: 'კვადრატი და კუბი', summary: 'კვადრატი და კუბი' },
        { id: 'u13-04', title: 'კვადრატული და კუბური ფესვები', summary: 'კვადრატული და კუბური ფესვები' },
      ],
    },
  ]),
  topic('g6-patterns-chance', 'კანონზომიერებები და ალბათობა', '🎲',
    'მიმდევრობები, კანონზომიერებები, შესაძლებლობა და ფაქტორიალი.', 'violet', [
    {
      id: 'g6-patterns-chance',
      code: 'U14',
      title: 'კანონზომიერებები და ალბათობა',
      subtopics: [
        { id: 'u14-01', title: 'ზრდადი მიმდევრობები', summary: 'ზრდადი მიმდევრობები' },
        { id: 'u14-02', title: 'კლებადი მიმდევრობები', summary: 'კლებადი მიმდევრობები' },
        { id: 'u14-03', title: 'რომელი რიცხვია ზედმეტი?', summary: 'რომელი რიცხვია ზედმეტი?' },
        { id: 'u14-04', title: 'პროგნოზის გაკეთება', summary: 'პროგნოზის გაკეთება' },
        { id: 'u14-05', title: 'შეუძლებელი და აუცილებელი მოვლენები', summary: 'შეუძლებელი და აუცილებელი მოვლენები' },
        { id: 'u14-06', title: 'ფაქტორიალი', summary: 'ფაქტორიალი' },
      ],
    },
  ]),
  topic('g6-statistics', 'სტატისტიკა', '📊',
    'საშუალო, მედიანა, მოდა და დიაგრამები.', 'teal', [
    {
      id: 'g6-statistics',
      code: 'U15',
      title: 'სტატისტიკა',
      subtopics: [
        { id: 'u15-01', title: 'საშუალო, უდიდესი და უმცირესი მნიშვნელობები', summary: 'საშუალო, უდიდესი და უმცირესი მნიშვნელობები' },
        { id: 'u15-02', title: 'მონაცემთა საშუალო და გამოტოვებული მონაცემი', summary: 'მონაცემთა საშუალო და გამოტოვებული მონაცემი' },
        { id: 'u15-03', title: 'მედიანა და მოდა', summary: 'მედიანა და მოდა' },
        { id: 'u15-04', title: 'მონაცემთა შემაჯამებელი მახასიათებლები', summary: 'მონაცემთა შემაჯამებელი მახასიათებლები' },
        { id: 'u15-05', title: 'დიაგრამების გამოყენება', summary: 'დიაგრამების გამოყენება' },
      ],
    },
  ]),
  topic('g6-angles-circles', 'კუთხეები, წრფეები და წრეწირები', '⭕',
    'კუთხეები, წრფეები და წრეწირები.', 'pink', [
    {
      id: 'g6-angles-circles',
      code: 'U16',
      title: 'კუთხეები, წრფეები და წრეწირები',
      subtopics: [
        { id: 'u16-01', title: 'წრფეები, მონაკვეთები და სხივები', summary: 'წრფეები, მონაკვეთები და სხივები' },
        { id: 'u16-02', title: 'კუთხეების გაზომვა და კლასიფიკაცია', summary: 'კუთხეების გაზომვა და კლასიფიკაცია' },
        { id: 'u16-03', title: 'გრადუსები და რადიანები', summary: 'გრადუსები და რადიანები' },
        { id: 'u16-04', title: 'პარალელური წრფეები და მკვეთი', summary: 'პარალელური წრფეები და მკვეთი' },
        { id: 'u16-05', title: 'მოსაზღვრე და ვერტიკალური კუთხეები', summary: 'მოსაზღვრე და ვერტიკალური კუთხეები' },
        { id: 'u16-06', title: 'პარალელური გადატანა', summary: 'პარალელური გადატანა' },
        { id: 'u16-07', title: 'ორი წრეწირის ურთიერთგანლაგება', summary: 'ორი წრეწირის ურთიერთგანლაგება' },
        { id: 'u16-08', title: 'ცენტრალური და ჩახაზული კუთხეები', summary: 'ცენტრალური და ჩახაზული კუთხეები' },
        { id: 'u16-09', title: 'რადიუსი, დიამეტრი და ქორდა', summary: 'რადიუსი, დიამეტრი და ქორდა' },
        { id: 'u16-10', title: 'სექტორი და სეგმენტი', summary: 'სექტორი და სეგმენტი' },
        { id: 'u16-11', title: 'წრეწირის სიგრძე და წრის ფართობი', summary: 'წრეწირის სიგრძე და წრის ფართობი' },
      ],
    },
  ]),
  topic('g6-triangles-quads', 'სამკუთხედები და ოთხკუთხედები', '🔺',
    'სამკუთხედები, ოთხკუთხედები და პითაგორას თეორემა.', 'yellow', [
    {
      id: 'g6-triangles-quads',
      code: 'U17',
      title: 'სამკუთხედები და ოთხკუთხედები',
      subtopics: [
        { id: 'u17-01', title: 'ოთხკუთხედების კლასიფიკაცია', summary: 'ოთხკუთხედების კლასიფიკაცია' },
        { id: 'u17-02', title: 'სამკუთხედის ელემენტები', summary: 'სამკუთხედის ელემენტები' },
        { id: 'u17-03', title: 'გარე კუთხე', summary: 'გარე კუთხე' },
        { id: 'u17-04', title: 'შიგა კუთხეების ჯამი', summary: 'შიგა კუთხეების ჯამი' },
        { id: 'u17-05', title: 'პითაგორას თეორემა', summary: 'პითაგორას თეორემა' },
        { id: 'u17-06', title: 'სამკუთხედების ტოლობის ნიშნები', summary: 'სამკუთხედების ტოლობის ნიშნები' },
        { id: 'u17-07', title: 'ამოცანები სამკუთხედებსა და ოთხკუთხედებზე', summary: 'ამოცანები სამკუთხედებსა და ოთხკუთხედებზე' },
        { id: 'u17-08', title: 'თალესის თეორემა', summary: 'თალესის თეორემა' },
        { id: 'u17-09', title: 'ტრაპეციის ელემენტები', summary: 'ტრაპეციის ელემენტები' },
      ],
    },
  ]),
  topic('g6-area-volume', 'პერიმეტრი, ფართობი და მოცულობა', '📦',
    'პერიმეტრი, ფართობი, მოცულობა და ზედაპირი.', 'green', [
    {
      id: 'g6-area-volume',
      code: 'U18',
      title: 'პერიმეტრი, ფართობი და მოცულობა',
      subtopics: [
        { id: 'u18-01', title: 'პერიმეტრი', summary: 'პერიმეტრი' },
        { id: 'u18-02', title: 'მართკუთხედის ფართობი', summary: 'მართკუთხედის ფართობი' },
        { id: 'u18-03', title: 'შედგენილი ფიგურები', summary: 'შედგენილი ფიგურები' },
        { id: 'u18-04', title: 'გაფერადებული ფიგურების ფართობი', summary: 'გაფერადებული ფიგურების ფართობი' },
        { id: 'u18-05', title: 'მრავალკუთხედებისა და სხვა ფიგურების ფართობი', summary: 'მრავალკუთხედებისა და სხვა ფიგურების ფართობი' },
        { id: 'u18-06', title: 'ტოლფართობიანი ფიგურები', summary: 'ტოლფართობიანი ფიგურები' },
        { id: 'u18-07', title: 'სივრცული ფიგურები და მათი შლილები', summary: 'სივრცული ფიგურები და მათი შლილები' },
        { id: 'u18-08', title: 'მართკუთხა პარალელეპიპედის მოცულობა და სრული ზედაპირის ფართობი', summary: 'მართკუთხა პარალელეპიპედის მოცულობა და სრული ზედაპირის ფართობი' },
        { id: 'u18-09', title: 'პრიზმის მოცულობა', summary: 'პრიზმის მოცულობა' },
        { id: 'u18-10', title: 'პრიზმის სრული ზედაპირის ფართობი', summary: 'პრიზმის სრული ზედაპირის ფართობი' },
        { id: 'u18-11', title: 'პირამიდა და კონუსი', summary: 'პირამიდა და კონუსი' },
        { id: 'u18-12', title: 'სხვადასხვა ფიგურის მოცულობა', summary: 'სხვადასხვა ფიგურის მოცულობა' },
      ],
    },
  ]),
  // </g6-real>
];

const g7: Topic[] = [
  // <g7-real> — units converted from the academy's Grade VII U01–U17 banks, in order.
  topic('g7-numbers-ops', 'რიცხვები და მოქმედებები', '🔢',
    'მოდული, შებრუნებული რიცხვები, მოქმედებები რაციონალურ რიცხვებზე, დამრგვალება, უსგ და უსჯ, ირაციონალური რიცხვები და პერიოდული ათწილადები.', 'blue', [
    {
      id: 'g7-numbers-ops',
      code: 'U01',
      title: 'რიცხვები და მოქმედებები',
      subtopics: [
        { id: 'u01-01', title: 'მოდული', summary: 'მოდული' },
        { id: 'u01-02', title: 'მოპირდაპირე და შებრუნებული რიცხვები', summary: 'მოპირდაპირე და შებრუნებული რიცხვები' },
        { id: 'u01-03', title: 'რიცხვების სხვადასხვა ფორმით ჩაწერა', summary: 'რიცხვების სხვადასხვა ფორმით ჩაწერა' },
        { id: 'u01-04', title: 'მოქმედებები მთელ რიცხვებსა და წილადებზე', summary: 'მოქმედებები მთელ რიცხვებსა და წილადებზე' },
        { id: 'u01-05', title: 'მოქმედებები შერეულ რიცხვებსა და ათწილადებზე', summary: 'მოქმედებები შერეულ რიცხვებსა და ათწილადებზე' },
        { id: 'u01-06', title: 'მოქმედებები უარყოფით და რაციონალურ რიცხვებზე', summary: 'მოქმედებები უარყოფით და რაციონალურ რიცხვებზე' },
        { id: 'u01-07', title: 'დამრგვალება და მიახლოებითი გამოთვლა', summary: 'დამრგვალება და მიახლოებითი გამოთვლა' },
        { id: 'u01-08', title: 'წილადი გამოსახულებების გამარტივება', summary: 'წილადი გამოსახულებების გამარტივება' },
        { id: 'u01-09', title: 'მარტივ მამრავლებად დაშლა, უდიდესი საერთო გამყოფი და უმცირესი საერთო ჯერადი', summary: 'მარტივ მამრავლებად დაშლა, უდიდესი საერთო გამყოფი და უმცირესი საერთო ჯერადი' },
        { id: 'u01-10', title: 'გამრავლებისა და გაყოფის თვისებები', summary: 'გამრავლებისა და გაყოფის თვისებები' },
        { id: 'u01-11', title: 'ამოცანები რაციონალურ რიცხვებსა და რიცხვით გამოსახულებებზე', summary: 'ამოცანები რაციონალურ რიცხვებსა და რიცხვით გამოსახულებებზე' },
        { id: 'u01-12', title: 'გაყოფა ნაშთით', summary: 'გაყოფა ნაშთით' },
        { id: 'u01-13', title: 'ირაციონალური და ნამდვილი რიცხვები', summary: 'ირაციონალური და ნამდვილი რიცხვები' },
        { id: 'u01-14', title: 'პერიოდული ათწილადები წილადების სახით', summary: 'პერიოდული ათწილადები წილადების სახით' },
      ],
    },
  ]),
  topic('g7-comparing', 'შედარება და დალაგება', '⚖️',
    'მთელი და რაციონალური რიცხვების შედარება, ჯამებისა და სხვაობების შედარება, ორი გამოსახულების შედარება, ნამდვილი რიცხვების დალაგება.', 'teal', [
    {
      id: 'g7-comparing',
      code: 'U02',
      title: 'შედარება და დალაგება',
      subtopics: [
        { id: 'u02-01', title: 'მთელი და რაციონალური რიცხვების შედარება', summary: 'მთელი და რაციონალური რიცხვების შედარება' },
        { id: 'u02-02', title: 'ჯამებისა და სხვაობების შედარება', summary: 'ჯამებისა და სხვაობების შედარება' },
        { id: 'u02-03', title: 'ორი გამოსახულების შედარება', summary: 'ორი გამოსახულების შედარება' },
        { id: 'u02-04', title: 'ნამდვილი რიცხვების დალაგება', summary: 'ნამდვილი რიცხვების დალაგება' },
      ],
    },
  ]),
  topic('g7-sets', 'სიმრავლეები', '🧺',
    'რიცხვთა სიმრავლეები და ქვესიმრავლეები, ქვესიმრავლეების რაოდენობა, სიმრავლეთა გაერთიანება, სიმრავლეთა თანაკვეთა, სიმრავლეთა სხვაობა და სიმეტრიული სხვაობა, სიმრავლის ელემენტების რაოდენობა.', 'green', [
    {
      id: 'g7-sets',
      code: 'U03',
      title: 'სიმრავლეები',
      subtopics: [
        { id: 'u03-01', title: 'რიცხვთა სიმრავლეები და ქვესიმრავლეები', summary: 'რიცხვთა სიმრავლეები და ქვესიმრავლეები' },
        { id: 'u03-02', title: 'ქვესიმრავლეების რაოდენობა', summary: 'ქვესიმრავლეების რაოდენობა' },
        { id: 'u03-03', title: 'სიმრავლეთა გაერთიანება', summary: 'სიმრავლეთა გაერთიანება' },
        { id: 'u03-04', title: 'სიმრავლეთა თანაკვეთა', summary: 'სიმრავლეთა თანაკვეთა' },
        { id: 'u03-05', title: 'სიმრავლეთა სხვაობა და სიმეტრიული სხვაობა', summary: 'სიმრავლეთა სხვაობა და სიმეტრიული სხვაობა' },
        { id: 'u03-06', title: 'სიმრავლის ელემენტების რაოდენობა', summary: 'სიმრავლის ელემენტების რაოდენობა' },
      ],
    },
  ]),
  topic('g7-sequences', 'მიმდევრობები და პროგრესიები', '🪜',
    'რიცხვითი მიმდევრობები, პერიოდული მიმდევრობები, არითმეტიკული პროგრესია, არითმეტიკული პროგრესიის (n)-ური წევრი, არითმეტიკული პროგრესიის ჯამი, გეომეტრიული პროგრესია და მისი (n)-ური წევრი, გეომეტრიული პროგრესიის ჯამი.', 'yellow', [
    {
      id: 'g7-sequences',
      code: 'U04',
      title: 'მიმდევრობები და პროგრესიები',
      subtopics: [
        { id: 'u04-01', title: 'რიცხვითი მიმდევრობები', summary: 'რიცხვითი მიმდევრობები' },
        { id: 'u04-02', title: 'პერიოდული მიმდევრობები', summary: 'პერიოდული მიმდევრობები' },
        { id: 'u04-03', title: 'არითმეტიკული პროგრესია', summary: 'არითმეტიკული პროგრესია' },
        { id: 'u04-04', title: 'არითმეტიკული პროგრესიის (n)-ური წევრი', summary: 'არითმეტიკული პროგრესიის (n)-ური წევრი' },
        { id: 'u04-05', title: 'არითმეტიკული პროგრესიის ჯამი', summary: 'არითმეტიკული პროგრესიის ჯამი' },
        { id: 'u04-06', title: 'გეომეტრიული პროგრესია და მისი (n)-ური წევრი', summary: 'გეომეტრიული პროგრესია და მისი (n)-ური წევრი' },
        { id: 'u04-07', title: 'გეომეტრიული პროგრესიის ჯამი', summary: 'გეომეტრიული პროგრესიის ჯამი' },
      ],
    },
  ]),
  topic('g7-powers-roots', 'ხარისხები და ფესვები', '√',
    'რაციონალური რიცხვების ნატურალური ხარისხები, ხარისხების გამრავლება და გაყოფა, ხარისხის აყვანა ხარისხში, არითმეტიკული კვადრატული ფესვები, კვადრატული ფესვის თვისებები, მამრავლების შეტანა ფესვის ქვეშ და გამოტანა ფესვის გარეთ, ფესვების შემცველი გამოსახულებების გარდაქმნა.', 'pink', [
    {
      id: 'g7-powers-roots',
      code: 'U05',
      title: 'ხარისხები და ფესვები',
      subtopics: [
        { id: 'u05-01', title: 'რაციონალური რიცხვების ნატურალური ხარისხები', summary: 'რაციონალური რიცხვების ნატურალური ხარისხები' },
        { id: 'u05-02', title: 'ხარისხების გამრავლება და გაყოფა', summary: 'ხარისხების გამრავლება და გაყოფა' },
        { id: 'u05-03', title: 'ხარისხის აყვანა ხარისხში', summary: 'ხარისხის აყვანა ხარისხში' },
        { id: 'u05-04', title: 'არითმეტიკული კვადრატული ფესვები', summary: 'არითმეტიკული კვადრატული ფესვები' },
        { id: 'u05-05', title: 'კვადრატული ფესვის თვისებები', summary: 'კვადრატული ფესვის თვისებები' },
        { id: 'u05-06', title: 'მამრავლების შეტანა ფესვის ქვეშ და გამოტანა ფესვის გარეთ', summary: 'მამრავლების შეტანა ფესვის ქვეშ და გამოტანა ფესვის გარეთ' },
        { id: 'u05-07', title: 'ფესვების შემცველი გამოსახულებების გარდაქმნა', summary: 'ფესვების შემცველი გამოსახულებების გარდაქმნა' },
      ],
    },
  ]),
  topic('g7-expressions', 'ცვლადიანი გამოსახულებები', '🔤',
    'გამოსახულების მნიშვნელობის გამოთვლა, მრავალწევრების შეკრება და გამოკლება, მრავალწევრების გამრავლება, შემოკლებული გამრავლების ფორმულები, კუბების ჯამი და სხვაობა, ჯამისა და სხვაობის კუბი, მრავალწევრების მამრავლებად დაშლა.', 'blue', [
    {
      id: 'g7-expressions',
      code: 'U06',
      title: 'ცვლადიანი გამოსახულებები',
      subtopics: [
        { id: 'u06-01', title: 'გამოსახულების მნიშვნელობის გამოთვლა', summary: 'გამოსახულების მნიშვნელობის გამოთვლა' },
        { id: 'u06-02', title: 'მრავალწევრების შეკრება და გამოკლება', summary: 'მრავალწევრების შეკრება და გამოკლება' },
        { id: 'u06-03', title: 'მრავალწევრების გამრავლება', summary: 'მრავალწევრების გამრავლება' },
        { id: 'u06-04', title: 'შემოკლებული გამრავლების ფორმულები', summary: 'შემოკლებული გამრავლების ფორმულები' },
        { id: 'u06-05', title: 'კუბების ჯამი და სხვაობა', summary: 'კუბების ჯამი და სხვაობა' },
        { id: 'u06-06', title: 'ჯამისა და სხვაობის კუბი', summary: 'ჯამისა და სხვაობის კუბი' },
        { id: 'u06-07', title: 'მრავალწევრების მამრავლებად დაშლა', summary: 'მრავალწევრების მამრავლებად დაშლა' },
      ],
    },
  ]),
  topic('g7-equations', 'განტოლებები და უტოლობები', '🟰',
    'წრფივი განტოლებები ერთი უცნობით, ეკვივალენტური განტოლებები, მოდულის შემცველი განტოლებები, ორი განტოლების სისტემები: ჩასმის მეთოდი, ორი განტოლების სისტემები: შეკრების მეთოდი, კვადრატული განტოლებები გამარტივებით, წრფივი უტოლობები, მოდულის შემცველი უტოლობები, უტოლობათა სისტემები, ორმაგი უტოლობები.', 'teal', [
    {
      id: 'g7-equations',
      code: 'U07',
      title: 'განტოლებები და უტოლობები',
      subtopics: [
        { id: 'u07-01', title: 'წრფივი განტოლებები ერთი უცნობით', summary: 'წრფივი განტოლებები ერთი უცნობით' },
        { id: 'u07-02', title: 'ეკვივალენტური განტოლებები', summary: 'ეკვივალენტური განტოლებები' },
        { id: 'u07-03', title: 'მოდულის შემცველი განტოლებები', summary: 'მოდულის შემცველი განტოლებები' },
        { id: 'u07-04', title: 'ორი განტოლების სისტემები: ჩასმის მეთოდი', summary: 'ორი განტოლების სისტემები: ჩასმის მეთოდი' },
        { id: 'u07-05', title: 'ორი განტოლების სისტემები: შეკრების მეთოდი', summary: 'ორი განტოლების სისტემები: შეკრების მეთოდი' },
        { id: 'u07-06', title: 'კვადრატული განტოლებები გამარტივებით', summary: 'კვადრატული განტოლებები გამარტივებით' },
        { id: 'u07-07', title: 'წრფივი უტოლობები', summary: 'წრფივი უტოლობები' },
        { id: 'u07-08', title: 'მოდულის შემცველი უტოლობები', summary: 'მოდულის შემცველი უტოლობები' },
        { id: 'u07-09', title: 'უტოლობათა სისტემები', summary: 'უტოლობათა სისტემები' },
        { id: 'u07-10', title: 'ორმაგი უტოლობები', summary: 'ორმაგი უტოლობები' },
      ],
    },
  ]),
  topic('g7-proportion-percent', 'პროპორცია და პროცენტი', '％',
    'პროპორციის ძირითადი თვისებები, სიდიდის პროპორციულ ნაწილებად დაყოფა, პირდაპირი პროპორციულობა, უკუპროპორციულობა, პროპორციულობის კოეფიციენტი, რიცხვის პროცენტული გამოსახვა, პროცენტები და ფასდაკლება, ჯარიმები და გადასახადები, მარტივი პროცენტი.', 'green', [
    {
      id: 'g7-proportion-percent',
      code: 'U08',
      title: 'პროპორცია და პროცენტი',
      subtopics: [
        { id: 'u08-01', title: 'პროპორციის ძირითადი თვისებები', summary: 'პროპორციის ძირითადი თვისებები' },
        { id: 'u08-02', title: 'სიდიდის პროპორციულ ნაწილებად დაყოფა', summary: 'სიდიდის პროპორციულ ნაწილებად დაყოფა' },
        { id: 'u08-03', title: 'პირდაპირი პროპორციულობა', summary: 'პირდაპირი პროპორციულობა' },
        { id: 'u08-04', title: 'უკუპროპორციულობა', summary: 'უკუპროპორციულობა' },
        { id: 'u08-05', title: 'პროპორციულობის კოეფიციენტი', summary: 'პროპორციულობის კოეფიციენტი' },
        { id: 'u08-06', title: 'რიცხვის პროცენტული გამოსახვა', summary: 'რიცხვის პროცენტული გამოსახვა' },
        { id: 'u08-07', title: 'პროცენტები და ფასდაკლება', summary: 'პროცენტები და ფასდაკლება' },
        { id: 'u08-08', title: 'ჯარიმები და გადასახადები', summary: 'ჯარიმები და გადასახადები' },
        { id: 'u08-09', title: 'მარტივი პროცენტი', summary: 'მარტივი პროცენტი' },
      ],
    },
  ]),
  topic('g7-multistep', 'მრავალსაფეხურიანი ამოცანები', '🧩',
    'ამოცანები პროპორციაზე, დრო, სიჩქარე და მანძილი, მასშტაბი, ამოცანების ამოხსნა სხვადასხვა მეთოდით.', 'yellow', [
    {
      id: 'g7-multistep',
      code: 'U09',
      title: 'მრავალსაფეხურიანი ამოცანები',
      subtopics: [
        { id: 'u09-01', title: 'ამოცანები პროპორციაზე', summary: 'ამოცანები პროპორციაზე' },
        { id: 'u09-02', title: 'დრო, სიჩქარე და მანძილი', summary: 'დრო, სიჩქარე და მანძილი' },
        { id: 'u09-03', title: 'მასშტაბი', summary: 'მასშტაბი' },
        { id: 'u09-04', title: 'ამოცანების ამოხსნა სხვადასხვა მეთოდით', summary: 'ამოცანების ამოხსნა სხვადასხვა მეთოდით' },
      ],
    },
  ]),
  topic('g7-number-line', 'რიცხვითი ღერძი და საკოორდინატო სიბრტყე', '📏',
    'რიცხვითი შუალედები, შუალედების გაერთიანება და თანაკვეთა, საკოორდინატო სიბრტყის მეოთხედები და ღერძები, წერტილის კოორდინატები, ორ წერტილს შორის მანძილი, მონაკვეთის შუაწერტილი, ცენტრალური და ღერძული სიმეტრია, პარალელური გადატანა.', 'pink', [
    {
      id: 'g7-number-line',
      code: 'U10',
      title: 'რიცხვითი ღერძი და საკოორდინატო სიბრტყე',
      subtopics: [
        { id: 'u10-01', title: 'რიცხვითი შუალედები', summary: 'რიცხვითი შუალედები' },
        { id: 'u10-02', title: 'შუალედების გაერთიანება და თანაკვეთა', summary: 'შუალედების გაერთიანება და თანაკვეთა' },
        { id: 'u10-03', title: 'საკოორდინატო სიბრტყის მეოთხედები და ღერძები', summary: 'საკოორდინატო სიბრტყის მეოთხედები და ღერძები' },
        { id: 'u10-04', title: 'წერტილის კოორდინატები', summary: 'წერტილის კოორდინატები' },
        { id: 'u10-05', title: 'ორ წერტილს შორის მანძილი', summary: 'ორ წერტილს შორის მანძილი' },
        { id: 'u10-06', title: 'მონაკვეთის შუაწერტილი', summary: 'მონაკვეთის შუაწერტილი' },
        { id: 'u10-07', title: 'ცენტრალური და ღერძული სიმეტრია', summary: 'ცენტრალური და ღერძული სიმეტრია' },
        { id: 'u10-08', title: 'პარალელური გადატანა', summary: 'პარალელური გადატანა' },
      ],
    },
  ]),
  topic('g7-data', 'მონაცემები და სტატისტიკა', '📊',
    'რიცხვითი მახასიათებლები, არითმეტიკული და გეომეტრიული საშუალო, მონაცემების შეგროვების მეთოდები, ვენის დიაგრამები, სიხშირე და ფარდობითი სიხშირე.', 'blue', [
    {
      id: 'g7-data',
      code: 'U11',
      title: 'მონაცემები და სტატისტიკა',
      subtopics: [
        { id: 'u11-01', title: 'რიცხვითი მახასიათებლები', summary: 'რიცხვითი მახასიათებლები' },
        { id: 'u11-02', title: 'არითმეტიკული და გეომეტრიული საშუალო', summary: 'არითმეტიკული და გეომეტრიული საშუალო' },
        { id: 'u11-03', title: 'მონაცემების შეგროვების მეთოდები', summary: 'მონაცემების შეგროვების მეთოდები' },
        { id: 'u11-04', title: 'ვენის დიაგრამები', summary: 'ვენის დიაგრამები' },
        { id: 'u11-05', title: 'სიხშირე და ფარდობითი სიხშირე', summary: 'სიხშირე და ფარდობითი სიხშირე' },
      ],
    },
  ]),
  topic('g7-probability', 'ალბათობა და დათვლა', '🎲',
    'ფარდობითი სიხშირე და ალბათობა, მოვლენის ალბათობა, დამოუკიდებელი მოვლენები, მოვლენათა ჯამის ალბათობა, მოვლენათა ნამრავლის ალბათობა, გადანაცვლებები, კომბინაციები, განლაგებები.', 'teal', [
    {
      id: 'g7-probability',
      code: 'U12',
      title: 'ალბათობა და დათვლა',
      subtopics: [
        { id: 'u12-01', title: 'ფარდობითი სიხშირე და ალბათობა', summary: 'ფარდობითი სიხშირე და ალბათობა' },
        { id: 'u12-02', title: 'მოვლენის ალბათობა', summary: 'მოვლენის ალბათობა' },
        { id: 'u12-03', title: 'დამოუკიდებელი მოვლენები', summary: 'დამოუკიდებელი მოვლენები' },
        { id: 'u12-04', title: 'მოვლენათა ჯამის ალბათობა', summary: 'მოვლენათა ჯამის ალბათობა' },
        { id: 'u12-05', title: 'მოვლენათა ნამრავლის ალბათობა', summary: 'მოვლენათა ნამრავლის ალბათობა' },
        { id: 'u12-06', title: 'გადანაცვლებები', summary: 'გადანაცვლებები' },
        { id: 'u12-07', title: 'კომბინაციები', summary: 'კომბინაციები' },
        { id: 'u12-08', title: 'განლაგებები', summary: 'განლაგებები' },
      ],
    },
  ]),
  // </g7-real>
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

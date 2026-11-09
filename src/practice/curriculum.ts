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

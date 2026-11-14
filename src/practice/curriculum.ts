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

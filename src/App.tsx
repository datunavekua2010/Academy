import { useEffect, useState, type ReactNode } from 'react';
import { Mascot } from './components/Mascot';
import { CURRICULUM } from './practice/curriculum';
import practiceImage from './assets/landing/practice.png';
import testMakerImage from './assets/landing/test-maker.png';
import './academy-landing.css';

const navigation = [
  ['#platform', 'პლატფორმა'], ['#students', 'მოსწავლეებისთვის'], ['#tutors', 'მასწავლებლებისთვის'], ['#approach', 'რატომ Axiom?'], ['#pricing', 'ფასები'],
] as const;
const topics = CURRICULUM.find((grade) => grade.grade === 3)!.topics.filter((topic) => [
  'g3-ricxvebi100', 'g3-ertnishna-moqmedebebi', 'g3-gamravleba', 'g3-gazomva-geometria', 'g3-kanonzomiereba-logika', 'g3-wiladebi-shesavali',
].includes(topic.id));
const familyPlans = [['Solo', '14.99', '1 ბავშვი'], ['Duo', '22.99', '2 ბავშვი'], ['Four', '32.99', '4 ბავშვი']];
const faq = [
  ['რა არის Axiom Academy?', 'Axiom Academy მათემატიკის ციფრული პლატფორმაა: აქ ერთიანდება თემების მიხედვით დალაგებული მასალა, სავარჯიშოები და ტესტის შექმნის ხელსაწყო.'],
  ['ვის შეუძლია პლატფორმის გამოყენება?', 'პლატფორმა განკუთვნილია მოსწავლეებისთვის, ოჯახებისთვის და მასწავლებლებისთვის, რომლებსაც მათემატიკის პრაქტიკა და სასწავლო რესურსები სჭირდებათ.'],
  ['რას მოიცავს მოსწავლის პაკეტი?', 'მოსწავლის მიმართულება აერთიანებს არსებულ სასწავლო მასალას, ინტერაქტიულ ვარჯიშს და მოსწავლის სივრცეში პროგრესის ნახვას. პაკეტის საბოლოო პირობები და შეძენა ჯერ არ არის ხელმისაწვდომი.'],
  ['რას მოიცავს მასწავლებლის სივრცე?', 'მასწავლებლებისთვის პროგრამა უფასოა. შეგიძლიათ დაათვალიეროთ სავარჯიშოების შაბლონები და შექმნათ ტესტი პასუხების ფურცლით. ანგარიშის რეგისტრაცია ჯერ არ არის ხელმისაწვდომი.'],
  ['როგორ მუშაობს სავარჯიშოების ბიბლიოთეკა?', 'აირჩიეთ კლასი, თემა და ქვეთემა. არსებულ შაბლონებს შეუძლიათ სხვადასხვა ვარიანტის შექმნა; ხელმისაწვდომობა ქვეთემის მიხედვით განსხვავდება.'],
  ['როგორ შევქმნა ტესტი?', 'მასწავლებლის სივრცეში დაამატეთ სავარჯიშოს ტიპები, აირჩიეთ შაბლონები და რაოდენობები, შემდეგ შექმენით ერთი გაერთიანებული ტესტი. ქაღალდის ფორმატს ყველა შაბლონი არ უჭერს მხარს.'],
  ['აქვს თუ არა ტესტს პასუხების ფურცელი?', 'დიახ. შექმნილი დავალებების მიხედვით შეგიძლიათ ცალ-ცალკე ჩამოტვირთოთ მოსწავლის ტესტისა და პასუხების PDF ფაილები.'],
  ['რომელი კლასები და თემებია ხელმისაწვდომი?', 'სასწავლო გეგმა მოიცავს I–VII კლასებს, მათ შორის რიცხვებს, მოქმედებებს, გეომეტრიასა და ლოგიკას. ყველა დაგეგმილი გაკვეთილი ჯერ გამოქვეყნებული არ არის.'],
  ['არსებობს უფასო პაკეტი?', 'მასწავლებლებისთვის პროგრამა უფასოა. მშობლებისთვის განკუთვნილია ფასიანი საოჯახო პაკეტები; მათი ონლაინ შეძენა ჯერ არ არის ხელმისაწვდომი.'],
  ['როგორ მივიღო წვდომა პლატფორმაზე?', 'გამოიყენეთ მოსწავლის ან მასწავლებლის სივრცის ბმული. ანგარიშის რეგისტრაცია და პაკეტის ონლაინ შეძენა ამჟამად ხელმისაწვდომი არ არის.'],
];
const compare = [
  ['სავარჯიშოები', 'კითხვების კრებული', 'თემების მიხედვით შერჩევა'],
  ['სასწავლო სტრუქტურა', 'ფორმატზეა დამოკიდებული', 'კლასი → თემა → ქვეთემა'],
  ['პრაქტიკა', 'ფურცელზე ან ციფრულად', 'ინტერაქტიული პასუხი და უკუკავშირი'],
  ['ვარიანტები', 'ხშირად ფიქსირებული კითხვები', 'არსებული შაბლონების ვარიანტები'],
  ['ტესტი და პასუხები', 'ხელით მომზადებაც შესაძლებელია', 'ტესტისა და პასუხების PDF'],
  ['პროგრესი', 'ხშირად ცალკე აღირიცხება', 'მოსწავლის სივრცეში ჩანს'],
  ['მასწავლებლის ხელსაწყოები', 'ფორმატზეა დამოკიდებული', 'შაბლონების არჩევა და ტესტის შედგენა'],
] as const;

type IconName = 'grid' | 'layers' | 'check' | 'spark' | 'chart' | 'file' | 'plus' | 'compass';
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    layers: <><path d="m3 8 9-5 9 5-9 5-9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></>,
    check: <><rect x="3" y="3" width="18" height="18" rx="5"/><path d="m8 12 2.5 2.5L16.5 9"/></>,
    spark: <><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z"/><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/></>,
    chart: <><path d="M4 20h16M6 17v-5M11 17V7M16 17v-8M21 17V4"/></>,
    file: <><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></>,
    plus: <><path d="M12 4v16M4 12h16"/><circle cx="12" cy="12" r="10"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
function Feature({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return <article className="al-feature"><span className="al-icon"><Icon name={icon}/></span><h3>{title}</h3><p>{children}</p></article>;
}
function PriceRows({ items }: { items: string[][] }) {
  return <div className="al-price-rows">{items.map(([name, price, detail]) => <div key={name}><span><strong>{name}</strong>{detail && <small>{detail}</small>}</span><b>{price} ₾ <small>/ თვე</small></b></div>)}</div>;
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return <div className="axiom-landing">
    <a className="al-skip" href="#main-content">მთავარ შიგთავსზე გადასვლა</a>
    <header className="al-header"><div className="al-container al-nav">
      <a className="al-brand" href="#home" aria-label="Axiom Academy — მთავარი"><span className="al-brand-mark" aria-hidden="true">✦</span><span>Axiom <strong>Academy</strong><small>მათემატიკის ციფრული პლატფორმა</small></span></a>
      <nav id="landing-navigation" aria-label="მთავარი ნავიგაცია" className={menuOpen ? 'al-nav-links is-open' : 'al-nav-links'}>{navigation.map(([href, label]) => <a href={href} key={href} onClick={() => setMenuOpen(false)}>{label}</a>)}<a href="#/account/login" onClick={() => setMenuOpen(false)}>შესვლა</a></nav>
      <a className="al-button al-button-primary al-nav-cta" href="#pricing">ნახე პაკეტები <span aria-hidden="true">↗</span></a>
      <button type="button" className="al-menu" aria-label={menuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen(!menuOpen)}><span/><span/><span/></button>
    </div></header>
    <main id="main-content">
      <section className="al-hero" id="home"><div className="al-container al-hero-grid"><div className="al-hero-copy">
        <p className="al-kicker"><span/> ციფრული მათემატიკის პლატფორმა</p>
        <h1>მათემატიკა, რომელიც <em>აზროვნებას</em> ავითარებს<span className="al-period">.</span></h1>
        <p className="al-hero-intro">აღმოაჩინე მათემატიკის სწავლის თანამედროვე გზა — გააზრებული პრაქტიკა, მრავალფეროვანი სავარჯიშოები და პროგრესი ერთ პლატფორმაზე.</p>
        <div className="al-actions"><a className="al-button al-button-primary" href="#pricing">ნახე პაკეტები <span aria-hidden="true">↗</span></a><a className="al-button al-button-outline" href="#platform">გაიცანი პლატფორმა <span aria-hidden="true">↓</span></a></div>
        <div className="al-hero-meta"><span><Icon name="check"/> ინტერაქტიული პრაქტიკა</span><span><Icon name="file"/> ტესტის შექმნა</span></div>
      </div><div className="al-hero-art"><div className="al-screen al-screen-hero"><div className="al-screen-bar"><span><i/><i/><i/></span><strong>სავარჯიშოს მაგალითი</strong></div><img src={practiceImage} alt="მათემატიკის სავარჯიშოს ინტერფეისი გამრავლების თემაზე" /></div><div className="al-hero-stamp"><Icon name="spark"/><span>ვიფიქროთ<br/><b>ერთად!</b></span></div><Mascot className="al-mascot" initialThought="მოდი, ვიფიქროთ!" thoughts={['გამარჯობა! მე Axi ვარ 👋', 'მოდი, ერთად ვიფიქროთ!', 'ყოველი ნაბიჯი მნიშვნელოვანია!']} waveOnMount={false}/></div></div>
        <div className="al-container al-hero-bottom"><span><b>{CURRICULUM[0].roman}–{CURRICULUM[CURRICULUM.length-1].roman}</b> კლასების სასწავლო გეგმა</span><span><b>ერთი სივრცე</b> სწავლისა და პრაქტიკისთვის</span><span><b>Axi</b> შენი სასწავლო მეგობარი</span></div>
      </section>
      <section className="al-section al-platform" id="platform"><div className="al-container"><div className="al-section-head al-center"><p className="al-eyebrow">გაიცანი პლატფორმა</p><h2>ყველაფერი, რაც მათემატიკის პრაქტიკისთვის გჭირდება<span className="al-period">.</span></h2><p>სტრუქტურირებული თემები, მრავალფეროვანი სავარჯიშოები და სასწავლო ხელსაწყოები — ერთად, ერთ ციფრულ გარემოში.</p></div>
        <div className="al-platform-grid"><a href="#/student/practice" className="al-platform-card"><span className="al-icon"><Icon name="grid"/></span><h3>შეარჩიე თემა</h3><p>იპოვე სავარჯიშო კლასი → თემა → ქვეთემის მიხედვით.</p><span className="al-link">სავარჯიშოების ნახვა ↗</span></a><a href="#/preview/student" className="al-platform-card"><span className="al-icon al-icon-blue"><Icon name="chart"/></span><h3>ივარჯიშე და დააკვირდი</h3><p>უპასუხე კითხვებს და ნახე შენი შესრულებული სამუშაო.</p><span className="al-link">მოსწავლის სივრცე ↗</span></a><a href="#/preview/teacher/interventions" className="al-platform-card"><span className="al-icon al-icon-coral"><Icon name="file"/></span><h3>შექმენი ტესტი</h3><p>შეუთავსე შაბლონები და მიიღე ტესტი პასუხების ფურცლით.</p><span className="al-link">ტესტის შემქმნელი ↗</span></a></div>
      </div></section>
      <section className="al-section al-student-section" id="students"><span id="process" className="al-anchor"/><div className="al-container"><div className="al-section-head"><p className="al-eyebrow">მოსწავლეებისთვის</p><h2>მეტი პრაქტიკა.<br/>მეტი გააზრება.<br/><span>მეტი პროგრესი.</span></h2><p>მათემატიკა პატარა ნაბიჯებად — თემის არჩევიდან პასუხის შემოწმებამდე.</p></div>
        <div className="al-features-grid"><Feature icon="grid" title="სავარჯიშოების ბიბლიოთეკა">სხვადასხვა თემის კითხვები და არსებული შაბლონების მიერ შექმნილი ვარიანტები.</Feature><Feature icon="layers" title="სტრუქტურირებული სწავლა">აირჩიე კლასი და გაჰყევი თემებისა და ქვეთემების სასწავლო სტრუქტურას.</Feature><Feature icon="check" title="ინტერაქტიული პრაქტიკა">უპასუხე კითხვებს და მიიღე მყისიერი უკუკავშირი ვარჯიშის პროცესში.</Feature><Feature icon="compass" title="ლოგიკა და ამოცანები">აღმოაჩინე კანონზომიერებები, იმსჯელე და იპოვე ამოხსნის გზა.</Feature><Feature icon="spark" title="Axi — სასწავლო მეგობარი">მეგობრული ენოტი მოსწავლის სივრცეში ნავიგაციაშიც გეხმარება.</Feature><Feature icon="chart" title="პროგრესის ნახვა">გადახედე შენს სავარჯიშო შედეგებსა და სასწავლო აქტივობას.</Feature></div>
        <a href="#student-plan" className="al-button al-button-outline al-section-action">ნახე მოსწავლეების პაკეტები <span aria-hidden="true">↗</span></a>
      </div></section>
      <section className="al-section al-parent-section" id="parents"><span id="progress" className="al-anchor"/><div className="al-container al-split"><div><p className="al-eyebrow">ოჯახებისთვის</p><h2>მეტი სიცხადე ბავშვის სწავლის პროცესში<span className="al-period">.</span></h2><p className="al-body">ციფრული მათემატიკის გარემო რეგულარული დამოუკიდებელი პრაქტიკისთვის. მოსწავლის სივრცეში შეგიძლიათ ერთად გადახედოთ არჩეულ თემებსა და შესრულებულ სამუშაოს.</p><ul className="al-check-list"><li>თემების მიხედვით დალაგებული მასალა</li><li>პრაქტიკა მოსწავლის ტემპით</li><li>Axi და ბავშვზე მორგებული სასწავლო გარემო</li></ul><a href="#student-plan" className="al-text-link">შეარჩიე საოჯახო პაკეტი <span aria-hidden="true">↗</span></a></div><div className="al-parent-panel"><div className="al-parent-quote">სწავლა იწყება<br/><strong>კითხვით.</strong><span>და გრძელდება აღმოჩენებით.</span></div><Mascot className="al-parent-mascot" initialThought="აბა, ვიფიქროთ!" thoughts={['მოდი, ერთად ვიფიქროთ!', 'ყოველი ნაბიჯი მნიშვნელოვანია!']} waveOnMount={false}/></div></div></section>
      <section className="al-section al-tutor-section" id="tutors"><div className="al-container"><div className="al-tutor-header"><div className="al-section-head"><p className="al-eyebrow">მასწავლებლებისთვის</p><h2>ნაკლები დრო სავარჯიშოების მომზადებაზე<span className="al-period">.</span><br/>მეტი შესაძლებლობა სწავლებისთვის.</h2></div><p className="al-body">მასწავლებლებისთვის პროგრამა უფასოა. სავარჯიშოების შაბლონები და ტესტის შემქმნელი გეხმარებათ სასწავლო რესურსების მომზადებაში.</p></div>
        <div className="al-tutor-grid"><article className="al-tutor-card"><span className="al-icon"><Icon name="grid"/></span><span className="al-number">01</span><h3>მათემატიკის სავარჯიშოები</h3><p>დაათვალიერეთ არსებული შაბლონები კლასისა და ქვეთემის მიხედვით და შეარჩიეთ ის, რაც თქვენს გეგმას შეესაბამება.</p></article><article className="al-tutor-card"><span className="al-icon al-icon-blue"><Icon name="file"/></span><span className="al-number">02</span><h3>ტესტი და პასუხების ფურცელი</h3><p>აირჩიეთ რამდენიმე ტიპი, მიუთითეთ რაოდენობები და შექმენით ერთი ტესტი შესაბამისი პასუხებით.</p></article></div>
        <div className="al-test-showcase"><div className="al-test-copy"><span className="al-small-label">ტესტის შემქმნელი</span><h3>რამდენიმე თემა.<br/>ერთი ტესტი.</h3><p>შექმენით სექციები, შეცვალეთ კითხვების რიგი და ჩამოტვირთეთ მოსწავლისა და პასუხების PDF ფაილები.</p><div className="al-example" aria-label="სექციების რაოდენობის მაგალითი"><span>გამრავლება <b>8</b></span><span>წილადები <b>5</b></span><span>გეომეტრია <b>4</b></span><strong>სულ <b>17</b></strong></div><small>საილუსტრაციო მაგალითი; შაბლონების ხელმისაწვდომობა და განსხვავებული ვარიანტების რაოდენობა განსხვავდება.</small></div><figure className="al-screen al-test-screen"><div className="al-screen-bar"><span><i/><i/><i/></span><strong>ინტერფეისის მაგალითი</strong></div><img src={testMakerImage} alt="ტესტის შემქმნელში არჩეული სავარჯიშოს ტიპი და რაოდენობა" loading="lazy"/></figure></div>
        <p className="al-tutor-note">PDF-ისთვის ხელმისაწვდომია შაბლონების ტექსტური ქვეჯგუფი. სურათზე ან ინტერაქტიულ ელემენტზე დამოკიდებული დავალებები არ შედის.</p><div className="al-actions"><a href="#tutor-plan" className="al-button al-button-primary">ნახე უფასო მასწავლებლის სივრცე <span aria-hidden="true">↗</span></a><a href="#/preview/teacher/interventions" className="al-button al-button-outline">ნახე ტესტის შემქმნელი <span aria-hidden="true">↗</span></a></div>
      </div></section>
      <section className="al-section al-comparison" id="approach"><span id="benefits" className="al-anchor"/><span id="testimonials" className="al-anchor"/><div className="al-container"><div className="al-section-head al-center"><p className="al-eyebrow">რატომ Axiom?</p><h2>მეტი, ვიდრე უბრალოდ სავარჯიშოები<span className="al-period">.</span></h2><p>სავარჯიშოების კრებულსა და ერთიან ციფრულ გარემოს შორის განსხვავება შეიძლება ასე გამოიყურებოდეს.</p></div><div className="al-table-wrap"><table><thead><tr><th scope="col">შესაძლებლობა</th><th scope="col">სავარჯიშოების კრებული</th><th scope="col">Axiom Academy</th></tr></thead><tbody>{compare.map(([name,basic,axiom]) => <tr key={name}><th scope="row">{name}</th><td>{basic}</td><td><span aria-hidden="true">✓</span> {axiom}</td></tr>)}</tbody></table></div><p className="al-comparison-note">კრებულების შესაძლებლობები განსხვავდება; ეს არის მიდგომების შედარება და არა სხვა პლატფორმების შეფასება.</p></div></section>
      <section className="al-section al-curriculum" id="program"><span id="why-math" className="al-anchor"/><div className="al-container al-curriculum-grid"><div><p className="al-eyebrow">სასწავლო მიმართულებები</p><h2>მათემატიკა — საფუძვლებიდან ლოგიკურ აზროვნებამდე<span className="al-period">.</span></h2><p className="al-body">არსებული სასწავლო გეგმა მოიცავს I–VII კლასებს. თემებისა და გამოქვეყნებული გაკვეთილების ხელმისაწვდომობა განსხვავდება.</p><a className="al-text-link" href="#/student/practice">გახსენი სასწავლო გეგმა <span aria-hidden="true">↗</span></a></div><div className="al-topic-grid">{topics.map((topic,index) => <article key={topic.id}><span>{String(index + 1).padStart(2,'0')}</span><h3>{topic.title}</h3><small>III კლასი · სასწავლო გეგმა</small></article>)}</div></div></section>
      <section className="al-section al-pricing" id="pricing"><div className="al-container"><div className="al-section-head al-center"><p className="al-eyebrow">პაკეტები</p><h2>შეარჩიე შენთვის შესაფერისი პაკეტი<span className="al-period">.</span></h2><p>აირჩიე, როგორ გსურს Axiom Academy-ის გამოყენება.</p></div><p className="al-pricing-notice">მასწავლებლებისთვის პროგრამა უფასოა; მშობლებისთვის განკუთვნილია ქვემოთ მოცემული ფასიანი საოჯახო პაკეტები. რეგისტრაცია და ონლაინ შეძენა ამჟამად მიუწვდომელია; პაკეტების პირობები და ურთიერთწვდომა დასაზუსტებელია. ბმულები პლატფორმის დათვალიერებაზე გადადის.</p><div className="al-pricing-grid"><article className="al-price-card" id="student-plan"><span className="al-price-eyebrow"><Icon name="spark"/> მშობლებისა და ოჯახებისთვის</span><h3>საოჯახო პაკეტები</h3><p>ფასიანი პაკეტები ბავშვების მათემატიკის პრაქტიკისა და არსებული სასწავლო მასალისთვის.</p><PriceRows items={familyPlans}/><ul className="al-check-list">
          <li>35,000-ზე მეტი გენერირებული მათემატიკის სავარჯიშოს ვარიანტი</li>
          <li className="al-benefit-unavailable">500-ზე მეტი ინტერაქტიული გაკვეთილი — სამომავლო მიზანი</li>
          <li>შესაბამისი დონის სავარჯიშოები</li>
          <li>პროგრესის ნახვა მოსწავლის სივრცეში</li>
          <li>სწავლა ნებისმიერ დროსა და ადგილას, ინტერნეტით</li>
          <li>მყისიერი უკუკავშირი პასუხებზე</li>
          <li>კლასებისა და თემების მიხედვით დალაგებული სასწავლო გზა</li>
          <li>თავდაჯერებულობის გაძლიერება პრაქტიკით</li>
          <li>დამოუკიდებლად სწავლა</li>
          <li>ყველაფერი ერთ პლატფორმაზე</li>
        </ul><a href="#/preview/student" className="al-button al-button-outline">ნახე მოსწავლის სივრცე <span aria-hidden="true">↗</span></a></article>
        <article className="al-price-card al-price-tutor" id="tutor-plan"><span className="al-price-eyebrow"><Icon name="file"/> მასწავლებლებისთვის</span><h3>მასწავლებლის სივრცე</h3><p>სავარჯიშოები და ტესტის შექმნის ხელსაწყო.</p><div className="al-free-price"><strong>უფასო</strong><span>მასწავლებლებისთვის</span></div><ul className="al-check-list"><li>წვდომა 35,000-ზე მეტ გენერირებულ სავარჯიშოზე</li><li>მოსწავლეების შედეგების ერთ სივრცეში ნახვა.</li><li>სავარჯიშოებისა და საშინაო დავალებების მართვა.</li><li>ტესტების შედგენა არსებული სავარჯიშოებიდან.</li><li>მშობლისთვის გასაზიარებელი პროგრესის ანგარიშების მომზადება.</li><li>გაკვეთილის ჩანაწერებისა და უკუკავშირის ორგანიზება.</li><li>ტესტის ავტომატური შედგენა და პასუხების PDF</li><li>საკლასო ოთახების ნიმუში</li><li>პროგრესის ანგარიშის ავტომატური მომზადება ბრაუზერში შენახული მონაცემებით</li><li className="al-benefit-unavailable">ტესტის ავტომატური შეფასება — სამომავლო მიზანი</li></ul><p className="al-benefits-note">მოსწავლის შედეგები და დავალებები ამ ბრაუზერის ერთ სანიმუშო პროფილს უკავშირდება. გაკვეთილის ჩანაწერები დროებითია და პირადი არ არის. ანგარიშის გაზიარებას მასწავლებელი თავად იწყებს; შედეგები სერვერზე არ მოწმდება.</p><a href="#/preview/teacher/interventions" className="al-button al-button-primary">ნახე მასწავლებლის სივრცე <span aria-hidden="true">↗</span></a></article></div></div></section>
      <section className="al-section al-faq-section" id="faq"><div className="al-container al-faq-grid"><div><p className="al-eyebrow">ხშირი კითხვები</p><h2>კითხვები?<br/>მოვძებნოთ პასუხები<span className="al-period">.</span></h2><p className="al-body">რაც უნდა იცოდე პლატფორმის, რესურსებისა და წვდომის შესახებ.</p></div><div className="al-faq-list">{faq.map(([q,a]) => <details key={q}><summary>{q}<span aria-hidden="true"/></summary><p>{a}</p></details>)}</div></div></section>
      <section className="al-final"><div className="al-container al-final-inner"><div><p className="al-eyebrow">პატარა ნაბიჯებით წინ</p><h2>აბა, ვიფიქროთ<span className="al-period">!</span></h2><p>აღმოაჩინე მათემატიკის სწავლისა და სწავლების ახალი შესაძლებლობები ერთ ციფრულ პლატფორმაზე.</p><a className="al-button al-button-primary" href="#pricing">ნახე პაკეტები <span aria-hidden="true">↗</span></a></div><Mascot className="al-final-mascot" initialThought="აბა, ვიფიქროთ!" thoughts={['მოდი, ერთად ვიფიქროთ!', 'ყოველი ნაბიჯი მნიშვნელოვანია!']} waveOnMount={false}/></div></section>
    </main>
    <footer className="al-footer"><div className="al-container al-footer-grid"><div><a className="al-brand" href="#home"><span className="al-brand-mark" aria-hidden="true">✦</span><span>Axiom <strong>Academy</strong><small>მათემატიკის ციფრული პლატფორმა</small></span></a><p>სწავლა, პრაქტიკა და აღმოჩენები<br/>ერთ სივრცეში.</p></div><nav aria-label="ქვედა ნავიგაცია">{navigation.map(([href,label]) => <a href={href} key={href}>{label}</a>)}<a href="#student-plan">საოჯახო პაკეტები</a><a href="#tutor-plan">მასწავლებლის უფასო სივრცე</a><a href="#faq">ხშირი კითხვები</a><a href="#/student">მოსწავლის გვერდი</a><a href="#/teacher">მასწავლებლის გვერდი</a></nav></div><div className="al-container al-footer-bottom">© {new Date().getFullYear()} Axiom Academy</div></footer>
  </div>;
}

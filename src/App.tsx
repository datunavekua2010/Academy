import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Mascot } from './components/Mascot';

const HERO_THOUGHTS = [
  'გამარჯობა! მე Axi ვარ 👋',
  'ჰმ... საინტერესოა!',
  'აბა ვიფიქროთ!',
  'მოდი, ვიპოვოთ პასუხი!',
  'ერთი იდეა მაქვს!',
  'შევძლებთ ერთად!',
];

const CTA_THOUGHTS = ['მზად ხარ? დავიწყოთ!', 'შევძლებთ ერთად!', 'ყოველი ნაბიჯი მნიშვნელოვანია!'];

const NAV = [
  ['#approach', 'ჩვენი მიდგომა'],
  ['#program', 'პროგრამა'],
  ['#progress', 'პროგრესი'],
  ['#faq', 'ხშირი კითხვები'],
];

const WHY = [
  { cls: 'pink', icon: '?', t: 'პასუხის მიღმა — გაგება', p: 'ბავშვს ვეხმარებით, მათემატიკური წესის გამოყენებასთან ერთად მისი არსიც გაიგოს.' },
  { cls: 'yellow', icon: '◇', t: 'ცოდნა ერთმანეთზე შენდება', p: 'წინაპირობების ცოდნა გვეხმარება, დავადგინოთ, სად სჭირდება ბავშვს დამატებითი ახსნა და პრაქტიკა.' },
  { cls: 'blue', icon: '↗', t: 'ყველას თავისი სასწავლო გზა აქვს', p: 'სწავლებისას საჭიროა ბავშვის მიმდინარე ცოდნისა და სირთულეების გათვალისწინება.' },
];

const APPROACH = [
  ['01', 'გაგება დამახსოვრებამდე', 'ბავშვი სწავლობს ცნებების გააზრებას, მაგალითების შედარებასა და წესების არსის დანახვას.'],
  ['02', 'ლოგიკა და მსჯელობა', 'ამოცანები ავითარებს კანონზომიერებების შემჩნევას, ინფორმაციის გაანალიზებასა და ამოხსნის გზის შერჩევას.'],
  ['03', 'ცოდნაზე აგებული სწავლება', 'ახალი თემის დაწყებამდე ყურადღება ექცევა იმ ცოდნას, რომელიც მის გასაგებად არის საჭირო.'],
  ['04', 'პროგრესზე დაკვირვება', 'დავალებების შედეგები და გამოვლენილი სირთულეები გვეხმარება შემდეგი სასწავლო ნაბიჯების განსაზღვრაში.'],
];

const PROCESS = [
  ['01', 'შეფასება', 'ვარკვევთ, რა თემებს ფლობს ბავშვი კარგად და სად სჭირდება დამატებითი მუშაობა.'],
  ['02', 'სასწავლო მიმართულება', 'შეფასების საფუძველზე განისაზღვრება შესაბამისი თემები და საჭირო წინაპირობები.'],
  ['03', 'სწავლა და პრაქტიკა', 'ბავშვი სწავლობს ცნებებს, ხსნის ამოცანებს და პრაქტიკით ამყარებს ცოდნას.'],
  ['04', 'შედეგების გადახედვა', 'ვაკვირდებით შესრულებულ სამუშაოს და ვგეგმავთ შემდეგ სასწავლო ნაბიჯებს.'],
];

const GRADES = [
  { cls: 'blue', r: 'I–II კლასები', n: '01', p: 'რიცხვები, მოქმედებების საფუძვლები, შედარება, გეომეტრიული ფორმები და მარტივი ლოგიკური კანონზომიერებები.' },
  { cls: 'teal', r: 'III–IV კლასები', n: '02', p: 'არითმეტიკული მოქმედებები, ტექსტური ამოცანები, რიცხვებს შორის კავშირები, გაზომვები და გეომეტრიის საფუძვლები.' },
  { cls: 'yellow', r: 'V–VII კლასები', n: '03', p: 'წილადები, რაციონალური რიცხვები, პროპორციები, ალგებრული აზროვნების საწყისები და მრავალსაფეხურიანი ამოცანები.' },
];

const PROGRESS_POINTS = [
  ['ათვისებული თემები', 'რომელი საკითხები ესმის ბავშვს თავდაჯერებულად.'],
  ['სირთულეები და შეცდომები', 'რომელ საკითხებზე სჭირდება დამატებითი პრაქტიკა.'],
  ['შემდეგი სასწავლო მიზანი', 'რა მიმართულებით არის მიზანშეწონილი გაგრძელება.'],
];

const BENEFITS = [
  { cls: 'blue', icon: '▦', t: 'სტრუქტურირებული პროგრამა', p: 'თემები ლოგიკურად უკავშირდება ერთმანეთს, ახალი მასალა კი საჭირო წინაპირობებს ეყრდნობა.' },
  { cls: 'teal', icon: '◇', t: 'ლოგიკაზე ორიენტირება', p: 'ყურადღება ექცევა მსჯელობასა და ამოხსნის სტრატეგიების განვითარებას.' },
  { cls: 'yellow', icon: '⌘', t: 'ონლაინ სწავლება', p: 'სწავლა მიმდინარეობს ონლაინ, წინასწარ შეთანხმებული განრიგის შესაბამისად.' },
  { cls: 'pink', icon: '♡', t: 'მშობლის ინფორმირებულობა', p: 'მიზანია, მშობელმა იცოდეს, რას სწავლობს ბავშვი და რა არის შემდეგი სასწავლო მიზანი.' },
];

const FAQ = [
  ['რომელი კლასის მოსწავლეებს იღებს აკადემია?', 'აკადემიის სასწავლო მიმართულება განკუთვნილია I–VII კლასების მოსწავლეებისთვის. ბავშვის შესაბამისი სასწავლო დონის დასადგენად გამოიყენება ცოდნის საწყისი შეფასება.'],
  ['რას მოიცავს დიაგნოსტიკური შეფასება?', 'შეფასების მიზანია დავადგინოთ, რა თემებს ფლობს ბავშვი და სად სჭირდება დამატებითი პრაქტიკა. ხანგრძლივობა, ჩატარების ფორმატი და საფასური უნდა განისაზღვროს აკადემიის რეალური პირობების მიხედვით.'],
  ['გაკვეთილები ონლაინ ტარდება?', 'დიახ, სწავლების ფორმატი ონლაინია. გაკვეთილის განრიგი, საჭირო მოწყობილობები და სხვა ტექნიკური პირობები მშობელს წინასწარ ეცნობება.'],
  ['როგორ გავიგებ, როგორ სწავლობს ჩემი შვილი?', 'აკადემიის მიზანია მშობელს ჰქონდეს ინფორმაცია გავლილი თემების, დავალებების შედეგებისა და შემდგომი სასწავლო საჭიროებების შესახებ. ანგარიშგების კონკრეტული ფორმა უნდა შეესაბამებოდეს რეალურად დანერგილ სისტემას.'],
  ['აუცილებელია, რომ ბავშვი ყველა თემას უკვე ფლობდეს?', 'არა. შეფასება სწორედ იმის გასარკვევად ტარდება, რა იცის ბავშვმა ამჟამად და რა საკითხებზე უნდა იმუშაოს შემდეგ.'],
  ['როგორ დავჯავშნო შეფასება?', 'დააჭირეთ ღილაკს „დაჯავშნე ცოდნის შეფასება“ და შეავსეთ მოკლე ფორმა. სანამ საიტი სრულად ამოქმედდება, ფორმის მონაცემების რეალურ მიმღებთან დაკავშირება აუცილებელია.'],
];

const GRADE_OPTIONS = ['I კლასი', 'II კლასი', 'III კლასი', 'IV კლასი', 'V კლასი', 'VI კლასი', 'VII კლასი'];

const BookArrow = () => <span className="arrow">→</span>;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [toast, setToast] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const lastFocus = useRef<HTMLElement | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number>(0);

  const openModal = () => {
    lastFocus.current = document.activeElement as HTMLElement;
    setFormMsg('');
    setSubmitted(false);
    setModalOpen(true);
    window.setTimeout(() => nameRef.current?.focus(), 50);
  };
  const closeModal = () => {
    setModalOpen(false);
    lastFocus.current?.focus();
  };

  useEffect(() => {
    document.body.style.overflow = modalOpen || menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen, menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3500);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get('parentName') || '').trim();
    setFormMsg(
      `მადლობა, ${name}! ფორმა წარმატებით შემოწმდა დემო რეჟიმში. ამ ეტაპზე მონაცემები არ გაგზავნილა — რეალური დაჯავშნისთვის საჭიროა ფორმის სერვერთან დაკავშირება.`,
    );
    setSubmitted(true);
  };

  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <a className="brand" href="#home" aria-label="აკადემიის მთავარი გვერდი">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M8 8h.01M16 8h.01M8 16h.01M16 16h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="brand-name">Axiom Academy</span>
              <span className="brand-sub">მათემატიკა • ლოგიკა</span>
            </span>
          </a>
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`} id="navLinks" aria-label="მთავარი ნავიგაცია">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <a
              href="#/student"
              className="nav-student-link"
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-student-dot" aria-hidden="true" />
              მოსწავლის შესვლა
            </a>
          </nav>
          <button className="btn btn-primary nav-cta" onClick={openModal}>
            შეფასების დაჯავშნა <BookArrow />
          </button>
          <button
            className="menu-toggle"
            aria-label={menuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" id="home">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">
                <span className="eyebrow-dot" /> ონლაინ სწავლება • I–VII კლასები
              </span>
              <h1>
                მათემატიკა, რომელიც <span style={{ color: 'var(--blue)' }}>აზროვნებას</span> ავითარებს.
              </h1>
              <p className="lead">
                დაეხმარე ბავშვს, გაიგოს არა მხოლოდ როგორ ამოხსნას ამოცანა, არამედ რატომ მუშაობს ამოხსნა. განავითაროს ლოგიკა, გაამყაროს ცოდნა და თავდაჯერებულად შეხვდეს ახალ გამოწვევებს.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={openModal}>
                  დაჯავშნე ცოდნის შეფასება <BookArrow />
                </button>
                <a className="btn btn-outline" href="#approach">გაიგე ჩვენი მიდგომა</a>
              </div>
              <div className="hero-note">
                <span className="check-mini">✓</span> გაიგე, რა იცის ბავშვმა და რაზე ღირს შემდეგ მუშაობა.
              </div>
              <div className="hero-proof">
                <div className="proof-pill"><span className="proof-icon">✳</span> ლოგიკური აზროვნება</div>
                <div className="proof-pill"><span className="proof-icon">↗</span> ეტაპობრივი სწავლა</div>
                <div className="proof-pill"><span className="proof-icon">◎</span> ცოდნაზე მორგებული გზა</div>
              </div>
            </div>

            <div className="hero-art" aria-label="მათემატიკური ცნებების დეკორატიული ილუსტრაცია">
              <div className="float-card float-two">
                <span className="float-icon bg-yellow">✦</span>
                <span><strong>აღმოაჩინე კავშირები</strong><small>იფიქრე • სცადე • ისწავლე</small></span>
              </div>
              <div className="math-board">
                <div className="board-top">
                  <span className="board-label">დღევანდელი გამოწვევა</span>
                  <span className="board-dots"><span /><span /><span /></span>
                </div>
                <div className="equation">
                  <span className="number-chip chip-blue">8</span><span>+</span>
                  <span className="number-chip chip-yellow">7</span><span>=</span>
                  <span className="number-chip chip-teal">?</span>
                </div>
                <div className="board-caption">შეგიძლია იპოვო პასუხი და ახსნა, როგორ იფიქრე?</div>
              </div>
              <div className="float-card float-one">
                <span className="float-icon bg-teal">✓</span>
                <span><strong>ყოველი ნაბიჯი მნიშვნელოვანია</strong><small>პროგრესი იწყება გაგებით</small></span>
              </div>

              <span className="m-spark" style={{ left: '14%', top: '38%' }}>✦</span>
              <span className="m-spark" style={{ right: '8%', top: '30%', fontSize: 22, animationDelay: '.8s' }}>✧</span>

              <Mascot className="hero-mascot" scale={0.78} thoughts={HERO_THOUGHTS} initialThought={HERO_THOUGHTS[0]} />
            </div>
          </div>
        </section>

        {/* WHY MATH */}
        <section className="section section-soft" id="why-math">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">რატომ არის ეს მნიშვნელოვანი?</span>
              <h2>მათემატიკის სწავლა პასუხის დამახსოვრებაზე მეტია.</h2>
              <p className="lead">მნიშვნელოვანია არა მხოლოდ სწორი პასუხი, არამედ ისიც, როგორ მივიდა ბავშვი ამ პასუხამდე და შეუძლია თუ არა ცოდნის ახალ სიტუაციაში გამოყენება.</p>
            </div>
            <div className="grid-3">
              {WHY.map((w) => (
                <article className="card" key={w.t}>
                  <div className={`icon-box bg-${w.cls} icon-${w.cls}`}>{w.icon}</div>
                  <h3>{w.t}</h3>
                  <p>{w.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* APPROACH */}
        <section className="section" id="approach">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">ჩვენი მიდგომა</span>
              <h2>გაიგე. იფიქრე. გამოიყენე.</h2>
              <p className="lead">ჩვენი მიზანია, ბავშვმა მათემატიკა მხოლოდ წესების კრებულად არ აღიქვას — შეძლოს მსჯელობა, კავშირების დანახვა და ცოდნის გამოყენება.</p>
            </div>
            <div className="approach-grid">
              {APPROACH.map(([n, t, p]) => (
                <article className="approach-card" key={n}>
                  <span className="step-number">{n}</span>
                  <div><h3>{t}</h3><p>{p}</p></div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="section section-soft" id="process">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">როგორ მუშაობს აკადემია?</span>
              <h2>ოთხი ნაბიჯი სწავლის დასაგეგმად</h2>
              <p className="lead">გასაგები პროცესი მშობელსაც და მოსწავლესაც აჩვენებს, რა ხდება პირველივე შეხვედრიდან.</p>
            </div>
            <div className="process-grid">
              {PROCESS.map(([n, t, p]) => (
                <article className="process-card" key={n}>
                  <div className="process-num">{n}</div>
                  <h3>{t}</h3>
                  <p>{p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* PROGRAM */}
        <section className="section" id="program">
          <div className="container">
            <div className="section-heading">
              <span className="eyebrow">სასწავლო პროგრამა</span>
              <h2>სწავლა ბავშვის კლასისა და ცოდნის შესაბამისად</h2>
              <p className="lead">პროგრამა მოიცავს I–VII კლასების მათემატიკას და ლოგიკურ აზროვნებას. კონკრეტული სასწავლო გზა ბავშვის ცოდნის დონის მიხედვით განისაზღვრება.</p>
            </div>
            <div className="grid-3">
              {GRADES.map((g) => (
                <article className={`grade-card grade-${g.cls}`} key={g.n}>
                  <div className="grade-range">{g.r} <span>{g.n}</span></div>
                  <p>{g.p}</p>
                </article>
              ))}
            </div>
            <p className="grade-note">ეს არის პროგრამის ზოგადი მიმოხილვა. საბოლოო თემები უნდა შეესაბამებოდეს აკადემიის დამტკიცებულ სილაბუსს.</p>
          </div>
        </section>

        {/* PROGRESS */}
        <section className="section section-soft" id="progress">
          <div className="container progress-layout">
            <div>
              <span className="eyebrow">მშობლისთვის ხილული პროგრესი</span>
              <h2 style={{ marginTop: 20 }}>იცოდეთ, რა ისწავლა ბავშვმა და რა არის შემდეგი ნაბიჯი.</h2>
              <p className="lead">სწავლის შედეგებზე დაკვირვება ეხმარება მასწავლებელს შემდეგი ნაბიჯების დაგეგმვაში, მშობელს კი — ბავშვის საჭიროებების უკეთ გაგებაში.</p>
              <div className="progress-list">
                {PROGRESS_POINTS.map(([t, p]) => (
                  <div className="progress-point" key={t}>
                    <span className="tick">✓</span>
                    <div><strong>{t}</strong><span>{p}</span></div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary" onClick={openModal}>
                დაიწყე ცოდნის შეფასებით <BookArrow />
              </button>
            </div>
            <div className="dashboard" aria-label="სასწავლო პროგრესის სადემონსტრაციო პანელი">
              <div className="dashboard-head">
                <div><h3>სწავლის გზა</h3><small>პროგრესის პანელის მაგალითი</small></div>
                <span className="dashboard-badge">დემო</span>
              </div>
              {[
                ['რიცხვების შედარება', 'teal'],
                ['მოქმედებები', 'blue'],
                ['ტექსტური ამოცანები', 'yellow'],
              ].map(([l, c]) => (
                <div className="progress-item" key={l}>
                  <div className="progress-label"><span>{l}</span><span>მაგალითი</span></div>
                  <div className="progress-track"><div className={`progress-fill fill-${c}`} /></div>
                </div>
              ))}
              <div className="next-step">
                <span style={{ fontSize: '1.2rem' }}>↗</span>
                <div><strong>შემდეგი ნაბიჯი</strong><span>ტექსტური ამოცანების ამოხსნის სტრატეგიებზე დამატებითი პრაქტიკა.</span></div>
              </div>
              <p className="demo-note">ილუსტრაციული მაგალითი — არა რეალური მოსწავლის მონაცემები.</p>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="section" id="benefits">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">რატომ ჩვენ?</span>
              <h2>მიზანმიმართული სწავლა, არა უბრალოდ მეტი დავალება</h2>
            </div>
            <div className="grid-4">
              {BENEFITS.map((b) => (
                <article className="why-card" key={b.t}>
                  <div className={`icon-box bg-${b.cls} icon-${b.cls}`}>{b.icon}</div>
                  <h3>{b.t}</h3>
                  <p>{b.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section section-soft" id="testimonials">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">ნდობა რეალური გამოცდილებით</span>
              <h2>მშობლების შეფასებები</h2>
            </div>
            <div className="trust-box">
              <div className="trust-symbol">“</div>
              <div>
                <h3>აქ განთავსდება მშობლების ნამდვილი გამოცდილება</h3>
                <p>როდესაც აკადემიას ექნება პირველი შეფასებები, ამ სივრცეში გამოვაქვეყნებთ ნამდვილ გამოხმაურებებს, რომლებიც აღწერს ბავშვის სასწავლო გამოცდილებასა და კონკრეტულ ცვლილებებს. გამოგონილი შეფასებები არ გამოიყენება.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section" id="faq">
          <div className="container">
            <div className="section-heading center">
              <span className="eyebrow">ხშირი კითხვები</span>
              <h2>გსურთ მეტი გაიგოთ?</h2>
              <p className="lead">აქ ნახავთ პასუხებს ყველაზე გავრცელებულ კითხვებზე აკადემიისა და ცოდნის შეფასების შესახებ.</p>
            </div>
            <div className="faq-wrap">
              {FAQ.map(([q, a], i) => {
                const open = faqOpen === i;
                return (
                  <div className={`faq-item ${open ? 'open' : ''}`} key={q}>
                    <button className="faq-question" aria-expanded={open} onClick={() => setFaqOpen(open ? null : i)}>
                      <span>{q}</span>
                      <span className="faq-symbol">{open ? '−' : '+'}</span>
                    </button>
                    <div className="faq-answer">{a}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta">
          <div className="container">
            <div className="cta-panel">
              <div className="cta-content">
                <span className="eyebrow">შემდეგი ნაბიჯი</span>
                <h2 style={{ marginTop: 22 }}>ყოველი წინსვლა სწორი ნაბიჯით იწყება.</h2>
                <p>გაიგეთ, რა ცოდნას ფლობს თქვენი შვილი დღეს და რა მიმართულებით შეუძლია განვითარება.</p>
                <button className="btn btn-yellow" onClick={openModal}>
                  დაჯავშნე ცოდნის დიაგნოსტიკური შეფასება <BookArrow />
                </button>
              </div>
              <Mascot className="cta-mascot" scale={0.95} thoughts={CTA_THOUGHTS} waveOnMount={false} />
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-main">
            <div>
              <a className="brand" href="#home">
                <span className="brand-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>
                  <span className="brand-name">Axiom Academy</span>
                  <span className="brand-sub">მათემატიკა • ლოგიკა</span>
                </span>
              </a>
              <p className="footer-description">ონლაინ მათემატიკის სწავლება I–VII კლასებისთვის — გააზრებაზე, ლოგიკასა და ეტაპობრივ განვითარებაზე ორიენტირებული მიდგომით.</p>
            </div>
            <nav className="footer-links" aria-label="ქვედა ნავიგაცია">
              {NAV.map(([href, label]) => (
                <a key={href} href={href}>{label}</a>
              ))}
              <a href="#/student">მოსწავლის შესვლა</a>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  showToast('კონფიდენციალურობის გვერდი უნდა დაემატოს რეალური ფორმის სერვერთან დაკავშირებამდე.');
                }}
              >
                კონფიდენციალურობა
              </a>
            </nav>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Axiom Academy. ყველა უფლება დაცულია.</span>
            <span>შექმნილია სწავლის სიყვარულით.</span>
          </div>
        </div>
      </footer>

      {/* BOOKING MODAL */}
      <div
        className={`modal-backdrop ${modalOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bookingTitle"
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal">
          <button className="modal-close" aria-label="ფანჯრის დახურვა" onClick={closeModal}>×</button>
          <span className="eyebrow">პირველი ნაბიჯი</span>
          <h2 id="bookingTitle" style={{ marginTop: 18 }}>დაჯავშნე ცოდნის შეფასება</h2>
          <p className="form-intro">შეავსეთ ინფორმაცია და დაგიკავშირდებით შეფასების ორგანიზებისთვის.</p>
          <form className="form-grid" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="parentName">მშობლის სახელი</label>
              <input ref={nameRef} id="parentName" name="parentName" autoComplete="name" required placeholder="თქვენი სახელი" />
            </div>
            <div className="field">
              <label htmlFor="grade">მოსწავლის კლასი</label>
              <select id="grade" name="grade" required defaultValue="">
                <option value="">აირჩიეთ კლასი</option>
                {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="contact">საკონტაქტო ინფორმაცია</label>
              <input id="contact" name="contact" required placeholder="ტელეფონის ნომერი ან ელფოსტა" />
            </div>
            <div className="field">
              <label htmlFor="contactMethod">სასურველი საკონტაქტო არხი</label>
              <select id="contactMethod" name="contactMethod">
                <option>ტელეფონი</option>
                <option>ელფოსტა</option>
              </select>
            </div>
            <label className="consent">
              <input type="checkbox" id="consent" required />
              <span>ვეთანხმები, რომ აკადემიამ გამოიყენოს მითითებული საკონტაქტო ინფორმაცია შეფასების დასაგეგმად. კონფიდენციალურობის საბოლოო პოლიტიკა საიტის გაშვებამდე უნდა დაემატოს.</span>
            </label>
            <div className={`form-message ${formMsg ? 'show' : ''}`} role="status">{formMsg}</div>
            <button className="btn btn-primary" type="submit">
              {submitted ? 'დემო დასრულებულია' : <>გაგზავნის დემო-ტესტი <BookArrow /></>}
            </button>
          </form>
          <p className="demo-note">დემო რეჟიმი: ეს ფორმა მონაცემებს სერვერზე არ აგზავნის. რეალური დაჯავშნისთვის საჭიროა ფორმის სერვერთან დაკავშირება.</p>
        </div>
      </div>

      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </>
  );
}

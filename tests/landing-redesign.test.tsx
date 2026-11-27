// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { Shell } from '../src/Shell';
import { CURRICULUM } from '../src/practice/curriculum';

beforeEach(() => { window.location.hash='#home'; window.scrollTo=vi.fn(); });
afterEach(() => { cleanup(); window.location.hash=''; });
function navigate(hash:string) { window.location.hash=hash; fireEvent(window,new HashChangeEvent('hashchange')); }
it('presents the digital platform, genuine product illustrations and curriculum, not a booking service', () => {
  const { container }=render(<Shell />);
  expect(screen.getByRole('heading',{level:1,name:/მათემატიკა, რომელიც აზროვნებას ავითარებს/})).toBeTruthy();
  expect(screen.getByRole('heading',{name:/ყველაფერი, რაც მათემატიკის პრაქტიკისთვის გჭირდება/})).toBeTruthy();
  expect(screen.getByRole('heading',{name:/ნაკლები დრო სავარჯიშოების მომზადებაზე/})).toBeTruthy();
  expect(screen.getByRole('heading',{name:/მეტი, ვიდრე უბრალოდ სავარჯიშოები/})).toBeTruthy();
  expect(screen.getByText(/საილუსტრაციო მაგალითი/)).toBeTruthy();
  expect(screen.queryByText(/დაჯავშნე/)).toBeNull(); expect(screen.queryByText(/სატესტო რეჟიმი/)).toBeNull();
  for(const img of [screen.getByAltText(/მათემატიკის სავარჯიშოს ინტერფეისი/),screen.getByAltText(/ტესტის შემქმნელში/)] as HTMLImageElement[]) expect(img.getAttribute('src')).toBeTruthy();
  for(const topic of CURRICULUM.find(g=>g.grade===3)!.topics.filter(t=>['g3-gamravleba','g3-gazomva-geometria'].includes(t.id))) expect(within(container.querySelector('.al-topic-grid') as HTMLElement).getByText(topic.title)).toBeTruthy();
});
it('links every navigation item and plan action to a real destination without implying checkout', async () => {
  const {container}=render(<Shell />);
  const nav=screen.getByRole('navigation',{name:'მთავარი ნავიგაცია'});
  for(const label of ['პლატფორმა','მოსწავლეებისთვის','მასწავლებლებისთვის','რატომ Axiom?','ფასები']) {
    const href=within(nav).getByRole('link',{name:label}).getAttribute('href')!;
    expect(container.querySelector(href)).toBeTruthy();
  }
  expect(screen.getByText(/რეგისტრაცია და ონლაინ შეძენა ამჟამად მიუწვდომელია/)).toBeTruthy();
  expect(screen.queryByText(/დაიწყე უფასოდ/)).toBeNull();
  const studentPlan = within(container.querySelector('#student-plan') as HTMLElement);
  const tutorPlan = within(container.querySelector('#tutor-plan') as HTMLElement);
  expect(studentPlan.getByText(/14\.99 ₾/).closest('div')?.textContent).toContain('1 ბავშვი');
  expect(studentPlan.getByText(/14\.99 ₾/).textContent).toContain('/ თვე');
  expect(studentPlan.getByText(/22\.99 ₾/)).toBeTruthy();
  expect(studentPlan.getByText(/32\.99 ₾/)).toBeTruthy();
  expect(tutorPlan.getByText('უფასო')).toBeTruthy();
  expect(tutorPlan.queryByText(/₾/)).toBeNull();
  expect(screen.queryByText(/13\.99 ₾|19\.99 ₾|39\.99 ₾|79\.99 ₾/)).toBeNull();
  expect(within(container.querySelector('#student-plan') as HTMLElement).getByRole('link').getAttribute('href')).toBe('#/preview/student');
  expect(within(container.querySelector('#tutor-plan') as HTMLElement).getByRole('link').getAttribute('href')).toBe('#/preview/teacher/interventions');
  navigate('#/preview/student'); expect(await screen.findByRole('button',{name:'Axi-ს ნავიგაციის გახსნა'})).toBeTruthy();
  navigate('#/preview/teacher/interventions'); expect(await screen.findByRole('heading',{name:'ტესტის შემქმნელი'})).toBeTruthy();
});
it('opens the responsive menu and preserves meaningful FAQ answers', () => {
  render(<Shell />);
  const menu=screen.getByRole('button',{name:'მენიუს გახსნა'}); fireEvent.click(menu);
  expect(menu.getAttribute('aria-expanded')).toBe('true'); fireEvent.keyDown(document,{key:'Escape'});
  expect(menu.getAttribute('aria-expanded')).toBe('false');
  const faq=screen.getByText('არსებობს უფასო პაკეტი?').closest('details')!;
  fireEvent.click(within(faq).getByText('არსებობს უფასო პაკეტი?'));
  expect(faq.open).toBe(true); expect(within(faq).getByText(/მასწავლებლებისთვის პროგრამა უფასოა/)).toBeTruthy(); expect(within(faq).getByText(/მშობლებისთვის განკუთვნილია ფასიანი საოჯახო პაკეტები/)).toBeTruthy();
  fireEvent.click(within(faq).getByText('არსებობს უფასო პაკეტი?')); expect(faq.open).toBe(false);
  const tutorFaq=screen.getByText('რას მოიცავს მასწავლებლის სივრცე?').closest('details')!;
  expect(within(tutorFaq).getByText(/მასწავლებლებისთვის პროგრამა უფასოა/)).toBeTruthy();
  expect(within(tutorFaq).getByText(/რეგისტრაცია ჯერ არ არის ხელმისაწვდომი/)).toBeTruthy();
});

it('describes package benefits and separates unavailable capabilities from current previews', () => {
  const {container} = render(<Shell />);
  const student = within(container.querySelector('#student-plan') as HTMLElement);
  const teacher = within(container.querySelector('#tutor-plan') as HTMLElement);
  const studentBenefits = [
    '35,000-ზე მეტი გენერირებული მათემატიკის სავარჯიშოს ვარიანტი',
    '500-ზე მეტი ინტერაქტიული გაკვეთილი — სამომავლო მიზანი',
    'შესაბამისი დონის სავარჯიშოები',
    'პროგრესის ნახვა მოსწავლის სივრცეში',
    'სწავლა ნებისმიერ დროსა და ადგილას, ინტერნეტით',
    'მყისიერი უკუკავშირი პასუხებზე',
    'კლასებისა და თემების მიხედვით დალაგებული სასწავლო გზა',
    'თავდაჯერებულობის გაძლიერება პრაქტიკით',
    'დამოუკიდებლად სწავლა',
    'ყველაფერი ერთ პლატფორმაზე',
  ];
  expect(Array.from(container.querySelectorAll('#student-plan .al-check-list li'), (item) => item.textContent)).toEqual(studentBenefits);
  for (const text of studentBenefits) expect(student.getByText(text)).toBeTruthy();
  for (const text of [/წვდომა 35,000-ზე მეტ გენერირებულ სავარჯიშოზე/, /ტესტის ავტომატური შედგენა და პასუხების PDF/, /საკლასო ოთახების ნიმუში/, /პროგრესის ანგარიშის ავტომატური მომზადება ბრაუზერში შენახული მონაცემებით/, /ტესტის ავტომატური შეფასება — სამომავლო მიზანი/]) expect(teacher.getByText(text)).toBeTruthy();
  for (const text of ['მოსწავლეების შედეგების ერთ სივრცეში ნახვა.', 'სავარჯიშოებისა და საშინაო დავალებების მართვა.', 'ტესტების შედგენა არსებული სავარჯიშოებიდან.', 'მშობლისთვის გასაზიარებელი პროგრესის ანგარიშების მომზადება.', 'გაკვეთილის ჩანაწერებისა და უკუკავშირის ორგანიზება.']) expect(teacher.getByText(text)).toBeTruthy();
  expect(teacher.getByText(/ამ ბრაუზერის ერთ სანიმუშო პროფილს უკავშირდება/)).toBeTruthy();
  expect(teacher.getByText(/ჩანაწერები დროებითია და პირადი არ არის/)).toBeTruthy();
  expect(teacher.getByText(/გაზიარებას მასწავლებელი თავად იწყებს/)).toBeTruthy();
  expect(student.getByText(/500-ზე მეტი ინტერაქტიული გაკვეთილი/).classList.contains('al-benefit-unavailable')).toBe(true);
  expect(teacher.getByText(/ტესტის ავტომატური შეფასება/).classList.contains('al-benefit-unavailable')).toBe(true);
});

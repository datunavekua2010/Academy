/** The launch catalog is presentation data only. It never grants awards. */
export type AchievementCategory = 'milestones' | 'consistency' | 'mastery' | 'reasoning';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';
export type AchievementIcon = 'steps' | 'book' | 'flag' | 'compass' | 'mountain' | 'calendar' | 'rhythm' | 'numbers' | 'geometry' | 'fraction' | 'domains' | 'pattern' | 'detective' | 'puzzle' | 'idea';
export interface Achievement {
  id: string;
  name: string;
  category: AchievementCategory;
  tier?: AchievementTier;
  icon: AchievementIcon;
  description: string;
  requirement: string;
}

export const CATEGORIES: { id: AchievementCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'ყველა' },
  { id: 'milestones', label: 'მნიშვნელოვანი ნაბიჯები' },
  { id: 'consistency', label: 'თანმიმდევრულობა' },
  { id: 'mastery', label: 'მათემატიკის დაუფლება' },
  { id: 'reasoning', label: 'ლოგიკა და მსჯელობა' },
];
export const TIER_LABELS: Record<AchievementTier, string> = {
  bronze: 'ბრინჯაო', silver: 'ვერცხლი', gold: 'ოქრო', diamond: 'ბრილიანტი',
};

const mastery = 'დაუფლება მოითხოვს საჭირო სასწავლო აქტივობების დასრულებას და სერვერზე დადასტურებულ შეფასებას: სულ მცირე 20 შეკითხვა, 90% სიზუსტე, სულ მცირე 3 განსხვავებული შაბლონი (საკმარისი მრავალფეროვნების შემთხვევაში) და შეფასების დაფარვის პირობების შესრულება.';
const qualifying = 'სასწავლო დღედ ითვლება დღე, როცა დასრულებულია გაკვეთილი ან შესრულებულია სულ მცირე 5-პასუხიანი ვალიდური ვარჯიში ან მინიჭებული საშინაო დავალება. დღე მხოლოდ ერთხელ ითვლება; დღეები არ არის აუცილებელი ზედიზედ იყოს.';
const a = (id: string, name: string, category: AchievementCategory, icon: AchievementIcon, description: string, requirement: string, tier?: AchievementTier): Achievement => ({ id, name, category, icon, description, requirement, tier });

export const ACHIEVEMENTS: readonly Achievement[] = [
  a('M01', 'First Steps', 'milestones', 'steps', 'პირველი ნაბიჯი ვარჯიშში.', 'დაასრულე პირველი ვალიდური ვარჯიში სულ მცირე 5 გაგზავნილი პასუხით.'),
  a('M02', 'First Lesson', 'milestones', 'book', 'პირველი დასრულებული გაკვეთილი.', 'დაასრულე პირველი გაკვეთილი და შეასრულე მისი დასრულების პირობები.'),
  a('M03', 'Unit Pioneer', 'milestones', 'flag', 'პირველი დასრულებული ნაწილი.', 'დაასრულე სასწავლო პროგრამის პირველი ნაწილი.'),
  a('M04', 'Topic Explorer', 'milestones', 'compass', 'პირველი ათვისებული თემა.', `დაეუფლე პირველ თემას. ${mastery}`),
  a('M05', 'Five Units', 'milestones', 'mountain', 'ხუთი ნაწილი — შესანიშნავი გზა!', 'დაასრულე 5 განსხვავებული სასწავლო ნაწილი.'),
  a('M06', 'Ten Units', 'milestones', 'mountain', 'სწავლა წინ მიგიძღვის.', 'დაასრულე 10 განსხვავებული სასწავლო ნაწილი.'),
  a('M07', 'Learning Adventurer', 'milestones', 'compass', 'დიდი სასწავლო თავგადასავალი.', 'დაასრულე 25 განსხვავებული სასწავლო ნაწილი.'),
  a('C01', 'Three-Day Learner', 'consistency', 'calendar', 'სწავლა სამ სხვადასხვა დღეს.', `ისწავლე 3 სხვადასხვა ადგილობრივ კალენდარულ დღეს. ${qualifying}`, 'bronze'),
  a('C02', 'Seven-Day Learner', 'consistency', 'calendar', 'სწავლა შვიდ სხვადასხვა დღეს.', `ისწავლე 7 სხვადასხვა ადგილობრივ კალენდარულ დღეს. ${qualifying}`, 'silver'),
  a('C03', 'Fourteen-Day Learner', 'consistency', 'calendar', 'სწავლა თოთხმეტ სხვადასხვა დღეს.', `ისწავლე 14 სხვადასხვა ადგილობრივ კალენდარულ დღეს. ${qualifying}`, 'gold'),
  a('C04', 'Thirty-Day Learner', 'consistency', 'calendar', 'სწავლა ოცდაათ სხვადასხვა დღეს.', `ისწავლე 30 სხვადასხვა ადგილობრივ კალენდარულ დღეს. ${qualifying}`, 'diamond'),
  a('C05', 'Weekly Rhythm', 'consistency', 'rhythm', 'სამი სასწავლო დღე ერთ კვირაში.', `ისწავლე 3 სხვადასხვა დღეს ერთ ორშაბათი–კვირის კვირაში. ${qualifying}`, 'bronze'),
  a('C06', 'Weekly Rhythm', 'consistency', 'rhythm', 'ხუთი სასწავლო დღე ერთ კვირაში.', `ისწავლე 5 სხვადასხვა დღეს ერთ ორშაბათი–კვირის კვირაში. ${qualifying}`, 'silver'),
  a('C07', 'Weekly Rhythm', 'consistency', 'rhythm', 'ექვსი სასწავლო დღე ერთ კვირაში.', `ისწავლე 6 სხვადასხვა დღეს ერთ ორშაბათი–კვირის კვირაში. ${qualifying}`, 'gold'),
  a('A01', 'Number Navigator', 'mastery', 'numbers', 'გაეცანი რიცხვების სამყაროს.', `დაეუფლე რიცხვებთან დაკავშირებულ 1 განსხვავებულ ნაწილს. ${mastery}`, 'bronze'),
  a('A02', 'Number Navigator', 'mastery', 'numbers', 'რიცხვებში უფრო თავდაჯერებული ხარ.', `დაეუფლე რიცხვებთან დაკავშირებულ 3 განსხვავებულ ნაწილს. ${mastery}`, 'silver'),
  a('A03', 'Number Navigator', 'mastery', 'numbers', 'რიცხვების კიდევ უფრო დიდი სამყარო.', `დაეუფლე რიცხვებთან დაკავშირებულ 6 განსხვავებულ ნაწილს. ${mastery}`, 'gold'),
  a('A04', 'Number Navigator', 'mastery', 'numbers', 'რიცხვების მრავალმხრივი ცოდნა.', `დაეუფლე რიცხვებთან დაკავშირებულ 10 განსხვავებულ ნაწილს. ${mastery}`, 'diamond'),
  a('A05', 'Geometry Explorer', 'mastery', 'geometry', 'აღმოაჩინე ფორმები და ფიგურები.', `დაეუფლე გეომეტრიის 2 განსხვავებულ ნაწილს. ${mastery}`),
  a('A06', 'Fraction Specialist', 'mastery', 'fraction', 'გამოიკვლიე წილადები.', `დაეუფლე წილადებად მონიშნულ 2 განსხვავებულ ნაწილს. ${mastery}`),
  a('A07', 'Mathematical All-Rounder', 'mastery', 'domains', 'სხვადასხვა მათემატიკური მიმართულება.', `დაეუფლე სულ მცირე ერთ ნაწილს ოთხივე განსაზღვრულ მიმართულებაში. ${mastery}`),
  a('R01', 'Pattern Finder', 'reasoning', 'pattern', 'იპოვე კანონზომიერებები.', 'სწორად ამოხსენი 10 განსხვავებული დამტკიცებული კანონზომიერების ამოცანა. ერთი და იგივე ამოცანა მხოლოდ ერთხელ ითვლება.', 'bronze'),
  a('R02', 'Pattern Finder', 'reasoning', 'pattern', 'აღმოაჩინე მეტი კანონზომიერება.', 'სწორად ამოხსენი 30 განსხვავებული დამტკიცებული კანონზომიერების ამოცანა. ერთი და იგივე ამოცანა მხოლოდ ერთხელ ითვლება.', 'silver'),
  a('R03', 'Pattern Finder', 'reasoning', 'pattern', 'განაგრძე კანონზომიერებების ძიება.', 'სწორად ამოხსენი 60 განსხვავებული დამტკიცებული კანონზომიერების ამოცანა. ერთი და იგივე ამოცანა მხოლოდ ერთხელ ითვლება.', 'gold'),
  a('R04', 'Pattern Finder', 'reasoning', 'pattern', 'კანონზომიერებების დიდი კოლექცია.', 'სწორად ამოხსენი 100 განსხვავებული დამტკიცებული კანონზომიერების ამოცანა. ერთი და იგივე ამოცანა მხოლოდ ერთხელ ითვლება.', 'diamond'),
  a('R05', 'Logic Detective', 'reasoning', 'detective', 'იფიქრე დეტექტივივით.', 'მსჯელობის შეფასებაში მიიღე სულ მცირე 80% სულ მცირე 15 შეფასებული შეკითხვიდან.'),
  a('R06', 'Puzzle Solver', 'reasoning', 'puzzle', 'ამოხსენი მრავალსაფეხურიანი თავსატეხები.', 'წარმატებით დაასრულე 5 განსხვავებული დამტკიცებული მრავალსაფეხურიანი ლოგიკური დავალება.'),
  a('R07', 'Creative Thinker', 'reasoning', 'idea', 'გამოიყენე ცოდნა ახალ სიტუაციებში.', 'სწორად ამოხსენი 10 დამტკიცებული ცოდნის გადატანის ამოცანა სულ მცირე 3 განსხვავებული მსჯელობის შაბლონიდან.'),
];

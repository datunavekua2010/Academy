import type { ReactNode } from 'react';

export type NavTone = 'blue' | 'teal' | 'yellow' | 'pink' | 'violet' | 'green';

export interface StudentNavItem {
  /** Route segment after /student/ — also used as the page key. */
  key: string;
  to: string;
  label: string;
  /** Short helper text used by the footer fallback and page intros. */
  description: string;
  tone: NavTone;
  icon: ReactNode;
}

const iconProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
};

export const STUDENT_NAV: StudentNavItem[] = [
  {
    key: 'lessons',
    to: '/student/lessons',
    label: 'ჩემი გაკვეთილები',
    description: 'გაკვეთილები და თემები',
    tone: 'blue',
    icon: (
      <svg {...iconProps}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
        <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
        <path d="M8 7h8M8 10.5h5" />
      </svg>
    ),
  },
  {
    key: 'homework',
    to: '/student/homework',
    label: 'საშინაო დავალება',
    description: 'დავალებები და ვადები',
    tone: 'yellow',
    icon: (
      <svg {...iconProps}>
        <path d="M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
        <path d="M8 6H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2" />
        <path d="m8.5 14 2 2 4.5-4.5" />
      </svg>
    ),
  },
  {
    key: 'practice',
    to: '/student/practice',
    label: 'ვარჯიში',
    description: 'სავარჯიშოები და ამოცანები',
    tone: 'teal',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'progress',
    to: '/student/progress',
    label: 'ჩემი პროგრესი',
    description: 'შედეგები და მიღწევები',
    tone: 'pink',
    icon: (
      <svg {...iconProps}>
        <path d="M4 20h16" />
        <path d="M7 20v-6M12 20V8M17 20v-9" />
        <path d="m5 9 4-4 3 3 5-5" />
      </svg>
    ),
  },
  {
    key: 'schedule',
    to: '/student/schedule',
    label: 'განრიგი',
    description: 'კვირის გაკვეთილები',
    tone: 'violet',
    icon: (
      <svg {...iconProps}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M8 3v4M16 3v4M3.5 10h17" />
        <path d="M8 14h2M14 14h2M8 17.5h2M14 17.5h2" />
      </svg>
    ),
  },
  {
    key: 'profile',
    to: '/student/profile',
    label: 'ჩემი პროფილი',
    description: 'პირადი ინფორმაცია',
    tone: 'green',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
      </svg>
    ),
  },
];

export function findNavItem(key: string): StudentNavItem | undefined {
  return STUDENT_NAV.find((item) => item.key === key);
}

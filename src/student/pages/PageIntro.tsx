import type { ReactNode } from 'react';
import { Link } from '../../router';

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageIntro({ eyebrow, title, description, children }: PageIntroProps) {
  return (
    <div className="page-intro">
      <Link to="/student" className="back-link">
        <span aria-hidden="true">←</span> დაფაზე დაბრუნება
      </Link>
      <span className="eyebrow">
        <span className="eyebrow-dot" /> {eyebrow}
      </span>
      <h1>{title}</h1>
      <p className="lead">{description}</p>
      {children}
    </div>
  );
}

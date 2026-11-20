import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FoxArt } from '../../components/FoxArt';
import { navigate } from '../../router';
import type { GradeId } from '../../practice/types';
import { useStudentSession } from '../session';
import './grade-selection.css';

const GRADES: { id: GradeId; color: string; pale: string; symbol: string }[] = [
  { id: 1, color: '#f38a65', pale: '#fff0e8', symbol: '1 + 2' },
  { id: 2, color: '#25a99b', pale: '#e5f8f3', symbol: '2 · 3' },
  { id: 3, color: '#6c7ce6', pale: '#edf0ff', symbol: '3 × 4' },
  { id: 4, color: '#eea638', pale: '#fff5df', symbol: '½ + ¼' },
  { id: 5, color: '#e47c9a', pale: '#fff0f5', symbol: '45°' },
  { id: 6, color: '#449ac8', pale: '#e6f5fc', symbol: '2 : 3' },
  { id: 7, color: '#9580d5', pale: '#f2eeff', symbol: 'x + 7' },
];
const CARD_WIDTH = 208;
const GAP = 16;
const DESKTOP = 900;

export function parseStudentGrade(value: string | undefined): GradeId | null {
  if (!value) return null;
  const match = value.trim().match(/^(VII|VI|IV|V|III|II|I|[1-7])(?:\s*(?:კლასი|class|grade))?$/i);
  if (!match) return null;
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const number = /^[1-7]$/.test(match[1]) ? Number(match[1]) : romans.indexOf(match[1].toUpperCase()) + 1;
  return number >= 1 && number <= 7 ? number as GradeId : null;
}

function storedGrade(studentId: string | undefined): GradeId | null {
  if (!studentId) return null;
  try {
    const value = localStorage.getItem(`axiom:homework-grade:${studentId}`);
    return value && /^[1-7]$/.test(value) ? Number(value) as GradeId : null;
  } catch { return null; }
}

function Illustration({ grade }: { grade: typeof GRADES[number] }) {
  const { id, color, pale, symbol } = grade;
  return (
    <svg viewBox="0 0 180 140" className="grade-choice-art" aria-hidden="true" focusable="false">
      <circle cx="90" cy="68" r="61" fill={pale} />
      <circle cx="35" cy="36" r="5" fill={color} opacity=".65" />
      <path d="M145 28v14m-7-7h14" stroke={color} strokeWidth="3" strokeLinecap="round" opacity=".7" />
      {id === 1 && <><circle cx="48" cy="95" r="13" fill="#f5bb49" /><circle cx="78" cy="99" r="13" fill="#59bcae" /><circle cx="108" cy="95" r="13" fill="#f38a65" /></>}
      {id === 2 && <><rect x="33" y="79" width="29" height="29" rx="8" fill="#f6bb4d" /><rect x="74" y="71" width="29" height="37" rx="8" fill="#25a99b" /><rect x="115" y="60" width="29" height="48" rx="8" fill="#7185e5" /></>}
      {id === 3 && <><circle cx="49" cy="92" r="19" fill="#f6bc4c" /><path d="M70 111 92 69l23 42Z" fill="#ed9277" /><rect x="111" y="80" width="34" height="34" rx="7" fill="#6c7ce6" /></>}
      {id === 4 && <><circle cx="55" cy="91" r="23" fill="#f5c358" /><path d="M55 68v23h23A23 23 0 0 0 55 68" fill="#ec8669" /><path d="M91 85h49v21H91z" fill="#76c7b4" /><path d="M100 85v8m9-8v5m9-5v8m9-8v5" stroke="#fff" strokeWidth="2" /></>}
      {id === 5 && <><path d="M38 111h100M42 111l66-51" stroke="#e47c9a" strokeWidth="5" strokeLinecap="round" /><path d="M66 111a24 24 0 0 0-5-15" fill="none" stroke="#e9b23e" strokeWidth="4" /><circle cx="125" cy="86" r="15" fill="#77c8b8" /></>}
      {id === 6 && <><path d="M43 110V63m0 47h95M43 91h88M43 73h88M65 63v47m23-47v47m23-47v47" stroke="#9ecfe0" strokeWidth="2" /><path d="M49 102 73 88l22 5 29-26" fill="none" stroke="#449ac8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="124" cy="67" r="6" fill="#f4b34d" /></>}
      {id === 7 && <><path d="m46 108 30-51 30 51Z" fill="#9a84d8" /><circle cx="119" cy="91" r="22" fill="#64bdae" /><path d="M111 91h16m-8-8v16" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></>}
      <rect x="48" y="15" width="84" height="35" rx="12" fill="#fff" stroke={color} strokeWidth="2" />
      <text x="90" y="39" textAnchor="middle" fill={color} fontSize="17" fontWeight="800" fontFamily="sans-serif">{symbol}</text>
    </svg>
  );
}

export function GradeSelection() {
  const { student } = useStudentSession();
  const studentGrade = parseStudentGrade(student?.grade);
  const [selectedGrade, setSelectedGrade] = useState<GradeId | null>(() => storedGrade(student?.id) ?? studentGrade);
  const [position, setPosition] = useState(0);
  const [visible, setVisible] = useState(3);
  const [desktop, setDesktop] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef(selectedGrade);
  const navigating = useRef(false);
  selectionRef.current = selectedGrade;

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const recalculate = () => {
      const isDesktop = window.innerWidth >= DESKTOP;
      // The two arrow buttons and their gaps take 128px of the available area.
      const count = Math.max(1, Math.min(7, Math.floor((area.clientWidth - 128 + GAP) / (CARD_WIDTH + GAP))));
      setDesktop(isDesktop);
      setVisible(count);
      setPosition((current) => {
        const max = Math.max(0, 7 - count);
        const selectedIndex = selectionRef.current == null ? -1 : selectionRef.current - 1;
        let next = Math.min(current, max);
        if (isDesktop && selectedIndex >= 0) {
          if (selectedIndex < next) next = selectedIndex;
          else if (selectedIndex >= next + count) next = selectedIndex - count + 1;
        }
        return Math.max(0, Math.min(next, max));
      });
    };
    recalculate();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(recalculate);
    observer?.observe(area);
    window.addEventListener('resize', recalculate);
    return () => { observer?.disconnect(); window.removeEventListener('resize', recalculate); };
  }, []);

  const continueToHomework = () => {
    if (!selectedGrade || navigating.current) return;
    navigating.current = true;
    if (student?.id) {
      try { localStorage.setItem(`axiom:homework-grade:${student.id}`, String(selectedGrade)); } catch { /* navigation still works */ }
    }
    navigate(`/student/homework/grade/${selectedGrade}`);
  };
  const maxPosition = Math.max(0, GRADES.length - visible);

  return (
    <div className="grade-selection" lang="en">
      <div className="grade-selection-inner">
        <div className="grade-selection-brand"><span className="grade-selection-axi"><FoxArt pupilStyle={{}} /></span><span>AXIOM ACADEMY <b> / </b> LEARNING PATHS</span></div>
        <header className="grade-selection-heading">
          <span className="grade-selection-kicker">YOUR LEARNING JOURNEY</span>
          <h1>Choose your grade<span aria-hidden="true">.</span></h1>
          <p>Pick a grade to explore its learning path</p>
        </header>
        <div className="grade-selection-caption"><span>EXPLORE BY GRADE</span><span>01 — 07</span></div>
        <div className="grade-carousel" ref={areaRef}>
          <button type="button" className="grade-arrow" aria-label="Previous grades" disabled={position === 0} onClick={() => setPosition((p) => Math.max(0, p - 1))}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6" /></svg>
          </button>
          <div className="grade-carousel-window" style={{ '--visible': visible } as CSSProperties}>
            <div className="grade-carousel-track" style={{ '--position': position } as CSSProperties}>
              {GRADES.map((grade, index) => {
                const selected = selectedGrade === grade.id;
                const actual = studentGrade === grade.id;
                const hidden = desktop && (index < position || index >= position + visible);
                return (
                  <button key={grade.id} type="button" className={`grade-choice${selected ? ' is-selected' : ''}${actual ? ' is-actual' : ''}`} aria-label={`Grade ${grade.id}${actual ? ', your grade' : ''}`} aria-pressed={selected} aria-hidden={hidden || undefined} tabIndex={hidden ? -1 : undefined} onClick={() => setSelectedGrade(grade.id)}>
                    <span className="grade-choice-top"><span className="grade-choice-number">0{grade.id}</span>{actual && <span className="grade-actual"><span aria-hidden="true">✓</span> YOUR GRADE</span>}</span>
                    <Illustration grade={grade} />
                    <span className="grade-choice-bottom"><span>Grade {grade.id}</span><span className="grade-choice-check" aria-hidden="true">{selected ? '✓' : '↗'}</span></span>
                    <span className="grade-choice-sub">Mathematics</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button type="button" className="grade-arrow" aria-label="Next grades" disabled={position >= maxPosition} onClick={() => setPosition((p) => Math.min(maxPosition, p + 1))}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6" /></svg>
          </button>
        </div>
        <div className="grade-selection-action">
          <button type="button" className="grade-continue" disabled={!selectedGrade} onClick={continueToHomework}>Continue <span aria-hidden="true">→</span></button>
          <p>Choose any grade. Your school grade stays the same.</p>
        </div>
      </div>
    </div>
  );
}

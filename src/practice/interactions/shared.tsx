/* ---------------------------------------------------------------- *\
 * Shared
 * ---------------------------------------------------------------- */

export function CheckButton({
  ready,
  done,
  onClick,
  label = 'შემოწმება',
}: {
  ready: boolean;
  done: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="btn btn-primary ix-check" disabled={done || !ready} onClick={onClick}>
      {label}
    </button>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max: number;
  step?: number;
  disabled?: boolean;
}) {
  return (
    <span className="ix-stepper">
      <button
        type="button"
        className="ix-step"
        aria-label={`${label}: ნაკლები`}
        disabled={disabled || value - step < min}
        onClick={() => onChange(value - step)}
      >
        −
      </button>
      <strong className="ix-step-value" aria-live="polite">
        {value}
      </strong>
      <button
        type="button"
        className="ix-step"
        aria-label={`${label}: მეტი`}
        disabled={disabled || value + step > max}
        onClick={() => onChange(value + step)}
      >
        +
      </button>
    </span>
  );
}


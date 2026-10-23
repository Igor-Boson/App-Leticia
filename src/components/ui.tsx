import type { ReactNode } from 'react';

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const Icon = {
  check: (color = '#ffffff') => (
    <svg {...iconProps} width={16} height={16} stroke={color} strokeWidth={3}>
      <path d="M5 12l5 5L20 7" />
    </svg>
  ),
  arrowRight: () => (
    <svg {...iconProps} width={16} height={16}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  chevronLeft: () => (
    <svg {...iconProps} width={22} height={22}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  chevronRight: () => (
    <svg {...iconProps} width={22} height={22}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  plus: () => (
    <svg {...iconProps} strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: () => (
    <svg {...iconProps} strokeWidth={2.5}>
      <path d="M5 12h14" />
    </svg>
  ),
  edit: () => (
    <svg {...iconProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
  repeat: () => (
    <svg {...iconProps} width={14} height={14} stroke="#5a73b8">
      <path d="M17 2l4 4-4 4" />
      <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <path d="M7 22l-4-4 4-4" />
      <path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  info: () => (
    <svg {...iconProps} width={22} height={22} stroke="#5a73b8" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8h.01M11 12h1v5h1" />
    </svg>
  ),
  book: () => (
    <svg {...iconProps} width={22} height={22} stroke="#6b5ca5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </svg>
  ),
  trash: () => (
    <svg {...iconProps}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  ),
  settings: () => (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
};

export function CheckMark({ on, round = false }: { on: boolean; round?: boolean }) {
  return <span className={`check${round ? ' round' : ''}${on ? ' on' : ''}`}>{on && Icon.check()}</span>;
}

export function ProgressRing({ value, size = 128, label }: { value: number | null; size?: number; label: string }) {
  const stroke = size >= 120 ? 10 : 9;
  const r = (size - stroke) / 2 - 1;
  const circ = 2 * Math.PI * r;
  const pct = value ?? 0;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e3eaf7" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#8aa4e6"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${(circ * pct) / 100} ${circ}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dasharray 0.3s ease' }}
        />
      </svg>
      <div className="ring-label">
        <span className="ring-value" style={{ fontSize: size >= 120 ? 32 : 26 }}>
          {value === null ? '—' : `${value}%`}
        </span>
        <span className="muted small">{label}</span>
      </div>
    </div>
  );
}

export function Bar({ value, color }: { value: number | null; color?: string }) {
  return (
    <div className="bar">
      <span style={{ width: `${value ?? 0}%`, background: color }} />
    </div>
  );
}

export function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="section" aria-label={title}>
      <div className="section-head">
        <h2 className="section-title">{title}</h2>
        {aside && <span className="muted small">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

export function Stepper({
  value,
  label,
  onChange,
  step = 1,
  min = 0,
  max = 99,
  format = String,
}: {
  value: number;
  label: string;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  format?: (value: number) => string;
}) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="round-button"
        aria-label={`Diminuir ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - step))}
      >
        {Icon.minus()}
      </button>
      <span className="stepper-value" aria-live="polite">
        {format(value)}
      </span>
      <button
        type="button"
        className="round-button"
        aria-label={`Aumentar ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + step))}
      >
        {Icon.plus()}
      </button>
    </div>
  );
}

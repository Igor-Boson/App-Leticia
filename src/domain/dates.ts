// Datas são strings locais "AAAA-MM-DD" para evitar problemas de fuso horário.
export type ISODate = string;

/** Índice do dia da semana: 0 = segunda … 6 = domingo. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const WEEKDAY_SHORT = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'] as const;
export const WEEKDAY_LETTER = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'] as const;
export const WEEKDAY_LONG = [
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
  'domingo',
] as const;
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const pad = (n: number) => String(n).padStart(2, '0');

export function toISO(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISO(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): ISODate {
  return toISO(new Date());
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISO(s);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function weekday(s: ISODate): Weekday {
  return ((fromISO(s).getDay() + 6) % 7) as Weekday;
}

/** Segunda-feira da semana que contém a data. */
export function weekStart(s: ISODate): ISODate {
  return addDays(s, -weekday(s));
}

export function weekEnd(s: ISODate): ISODate {
  return addDays(weekStart(s), 6);
}

export function weekDays(s: ISODate): ISODate[] {
  const start = weekStart(s);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Dias de `from` até `to`, inclusive. */
export function daysBetween(from: ISODate, to: ISODate): ISODate[] {
  const out: ISODate[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function monthKey(s: ISODate): string {
  return s.slice(0, 7);
}

export function monthName(s: ISODate): string {
  return MONTHS[fromISO(s).getMonth()];
}

export function dayOfMonth(s: ISODate): number {
  return fromISO(s).getDate();
}

/** "23 de outubro" */
export function formatLongDate(s: ISODate): string {
  return `${dayOfMonth(s)} de ${monthName(s)}`;
}

/** "20 a 26 de outubro" ou "27 de outubro a 2 de novembro" */
export function formatWeekRange(s: ISODate): string {
  const start = weekStart(s);
  const end = weekEnd(s);
  if (monthKey(start) === monthKey(end)) {
    return `${dayOfMonth(start)} a ${dayOfMonth(end)} de ${monthName(end)}`;
  }
  return `${formatLongDate(start)} a ${formatLongDate(end)}`;
}

/** "31/10" */
export function formatShortDate(s: ISODate): string {
  const d = fromISO(s);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** 1.5 → "1h30", 0.5 → "30min", 2 → "2h" */
export function formatHours(h: number): string {
  const whole = Math.floor(h);
  const min = Math.round((h - whole) * 60);
  if (whole === 0) return `${min}min`;
  return min ? `${whole}h${pad(min)}` : `${whole}h`;
}

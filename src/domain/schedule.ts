import {
  addDays,
  daysBetween,
  monthKey,
  weekday,
  weekDays,
  weekEnd,
  weekStart,
  type ISODate,
} from './dates';
import type { AppState, Occurrence, Task } from './types';

export const newId = (): string => crypto.randomUUID();

type TaskIndex = Map<string, Task>;

export function indexTasks(tasks: Task[]): TaskIndex {
  return new Map(tasks.map((t) => [t.id, t]));
}

/** Tarefas diárias aparecem em todos os dias, então não pesam na escolha do dia mais leve. */
function countsForLoad(task: Task | undefined): boolean {
  return !!task && !task.archived && task.recurrence.kind !== 'daily';
}

export function dayLoad(occurrences: Occurrence[], tasks: TaskIndex, date: ISODate): number {
  return occurrences.filter((o) => o.date === date && countsForLoad(tasks.get(o.taskId))).length;
}

/**
 * Escolhe o dia mais leve entre os candidatos. Evita repetir a mesma tarefa no
 * mesmo dia; em caso de empate, fica com o dia mais cedo.
 */
export function pickLightestDay(
  occurrences: Occurrence[],
  tasks: TaskIndex,
  candidates: ISODate[],
  taskId: string,
): ISODate {
  let best = candidates[0];
  let bestScore: [number, number] | null = null;
  for (const date of candidates) {
    const repeats = occurrences.some((o) => o.taskId === taskId && o.date === date) ? 1 : 0;
    const score: [number, number] = [repeats, dayLoad(occurrences, tasks, date)];
    if (!bestScore || score[0] < bestScore[0] || (score[0] === bestScore[0] && score[1] < bestScore[1])) {
      best = date;
      bestScore = score;
    }
  }
  return best;
}

/** Remove até `excess` ocorrências pendentes, começando pelas mais tardias. */
function trimPending(occurrences: Occurrence[], matching: Occurrence[], excess: number): Occurrence[] {
  if (excess <= 0) return occurrences;
  const removable = matching
    .filter((o) => !o.doneOn)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
    .slice(0, excess);
  const ids = new Set(removable.map((o) => o.id));
  return occurrences.filter((o) => !ids.has(o.id));
}

/**
 * Garante que a semana (e o mês) de `today` têm todas as ocorrências das
 * tarefas e reposiciona as que ficaram para trás.
 *
 * - Diárias: uma por dia; se não foi feita, fica no dia (não é movida).
 * - Dias fixos: uma em cada dia escolhido.
 * - X por semana: distribuídas nos dias mais leves a partir de hoje.
 * - X por mês: ficam no checklist do mês, sem dia.
 * - Uma vez: no prazo, ou no dia mais leve da semana.
 *
 * Qualquer ocorrência pendente de um dia que já passou (exceto diárias) vai
 * para o dia mais leve que ainda resta na semana, inclusive vinda de semanas
 * anteriores: nada some.
 */
export function ensureSchedule(state: AppState, today: ISODate): AppState {
  const tasks = indexTasks(state.tasks);
  let occs: Occurrence[] = state.occurrences.map((o) => ({ ...o }));
  const ws = weekStart(today);
  const mk = monthKey(today);
  const restOfWeek = daysBetween(today, weekEnd(today));

  const add = (taskId: string, date: ISODate | null, period: string) => {
    occs.push({ id: newId(), taskId, date, plannedFor: date, period, doneOn: null });
  };
  const hasPeriod = (taskId: string, period: string) =>
    occs.some((o) => o.taskId === taskId && o.period === period);

  for (const task of state.tasks) {
    if (task.archived) continue;
    const r = task.recurrence;
    switch (r.kind) {
      case 'daily':
      case 'weekdays':
        for (const d of weekDays(ws)) {
          if (d < task.activeFrom) continue;
          if (r.kind === 'weekdays' && !r.days.includes(weekday(d))) continue;
          if (!hasPeriod(task.id, d)) add(task.id, d, d);
        }
        break;
      case 'weekly': {
        const existing = occs.filter((o) => o.taskId === task.id && o.period === ws);
        for (let i = existing.length; i < r.times; i++) {
          add(task.id, pickLightestDay(occs, tasks, restOfWeek, task.id), ws);
        }
        occs = trimPending(occs, existing, existing.length - r.times);
        break;
      }
      case 'monthly': {
        const existing = occs.filter((o) => o.taskId === task.id && o.period === mk);
        for (let i = existing.length; i < r.times; i++) add(task.id, null, mk);
        occs = trimPending(occs, existing, existing.length - r.times);
        break;
      }
      case 'once':
        if (!occs.some((o) => o.taskId === task.id)) {
          add(task.id, r.date ?? pickLightestDay(occs, tasks, restOfWeek, task.id), 'once');
        }
        break;
    }
  }

  const overdue = occs
    .filter((o) => !o.doneOn && o.date !== null && o.date < today)
    .filter((o) => {
      const t = tasks.get(o.taskId);
      return !!t && !t.archived && t.recurrence.kind !== 'daily';
    })
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  for (const o of overdue) {
    o.date = pickLightestDay(occs, tasks, restOfWeek, o.taskId);
  }

  return { ...state, occurrences: occs };
}

/** Dias para onde uma tarefa pode ser adiada: o resto da semana, ou a semana seguinte se hoje é domingo. */
export function postponeCandidates(today: ISODate): ISODate[] {
  const tomorrow = addDays(today, 1);
  const end = weekEnd(today);
  return tomorrow <= end ? daysBetween(tomorrow, end) : weekDays(tomorrow);
}

/** Texto curto explicando de onde a ocorrência veio, quando ela foi movida. */
export function carriedLabel(o: Occurrence, today: ISODate): string | null {
  if (o.date === null) return o.period < monthKey(today) ? 'do mês passado' : null;
  if (!o.plannedFor || o.plannedFor === o.date) return null;
  if (weekStart(o.plannedFor) < weekStart(o.date)) return 'da semana passada';
  return `veio de ${WEEKDAY_FROM[weekday(o.plannedFor)]}`;
}

const WEEKDAY_FROM = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];

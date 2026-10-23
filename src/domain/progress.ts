import { monthKey, weekday, weekDays, type ISODate } from './dates';
import { indexTasks } from './schedule';
import type { AppState, Occurrence } from './types';

export interface Ratio {
  done: number;
  total: number;
}

const ZERO: Ratio = { done: 0, total: 0 };

export const addRatio = (a: Ratio, b: Ratio): Ratio => ({ done: a.done + b.done, total: a.total + b.total });

/** Porcentagem arredondada; `null` quando não há nada para fazer. */
export function percent(r: Ratio): number | null {
  return r.total === 0 ? null : Math.round((r.done / r.total) * 100);
}

/** Ocorrências que aparecem no dia (de tarefas ativas, ou já feitas de tarefas arquivadas). */
export function occurrencesOn(state: AppState, date: ISODate): Occurrence[] {
  const tasks = indexTasks(state.tasks);
  return state.occurrences.filter((o) => {
    const t = tasks.get(o.taskId);
    return o.date === date && !!t && (!t.archived || !!o.doneOn);
  });
}

/** Checklist do mês: as mensais do mês, mais as que ficaram pendentes de meses anteriores. */
export function monthOccurrences(state: AppState, today: ISODate): Occurrence[] {
  const mk = monthKey(today);
  const tasks = indexTasks(state.tasks);
  return state.occurrences.filter((o) => {
    const t = tasks.get(o.taskId);
    if (o.date !== null || !t) return false;
    if (o.period === mk) return !t.archived || !!o.doneOn;
    return o.period < mk && !o.doneOn && !t.archived;
  });
}

export function studyTarget(state: AppState, date: ISODate): number {
  return state.studyTargets[weekday(date)] ?? 0;
}

export interface DayProgress {
  tasks: Ratio;
  habits: Ratio;
  /** Estudo vale um item; horas parciais contam proporcionalmente. */
  study: Ratio;
  overall: Ratio;
}

/** Se o dia é anterior ao começo do uso do app. */
export function beforeStart(state: AppState, date: ISODate): boolean {
  return !!state.startedOn && date < state.startedOn;
}

export function dayProgress(state: AppState, date: ISODate): DayProgress {
  if (beforeStart(state, date)) return { tasks: ZERO, habits: ZERO, study: ZERO, overall: ZERO };
  const occs = occurrencesOn(state, date);
  const tasks: Ratio = { done: occs.filter((o) => o.doneOn).length, total: occs.length };

  const doneHabits = state.habitLog[date] ?? [];
  const applicable = state.habits.filter((h) => h.days.includes(weekday(date)));
  const habits: Ratio = {
    done: applicable.filter((h) => doneHabits.includes(h.id)).length,
    total: applicable.length,
  };

  const target = studyTarget(state, date);
  const hours = state.studyLog[date] ?? 0;
  const study: Ratio = target > 0 ? { done: Math.min(1, hours / target), total: 1 } : ZERO;

  return { tasks, habits, study, overall: addRatio(addRatio(tasks, habits), study) };
}

export interface WeekProgress extends DayProgress {
  days: { date: ISODate; progress: DayProgress }[];
  studyHours: number;
  studyTargetHours: number;
}

export function weekProgress(state: AppState, anyDate: ISODate): WeekProgress {
  const days = weekDays(anyDate).map((date) => ({ date, progress: dayProgress(state, date) }));
  const sum = (key: keyof DayProgress) => days.reduce((acc, d) => addRatio(acc, d.progress[key]), ZERO);
  return {
    days,
    tasks: sum('tasks'),
    habits: sum('habits'),
    study: sum('study'),
    overall: sum('overall'),
    studyHours: days.reduce((acc, d) => acc + (state.studyLog[d.date] ?? 0), 0),
    studyTargetHours: days.reduce((acc, d) => acc + (beforeStart(state, d.date) ? 0 : studyTarget(state, d.date)), 0),
  };
}

/** Tarefas da semana por grupo. */
export function groupWeekProgress(state: AppState, anyDate: ISODate): Map<string, Ratio> {
  const tasks = indexTasks(state.tasks);
  const out = new Map<string, Ratio>();
  for (const date of weekDays(anyDate)) {
    for (const o of occurrencesOn(state, date)) {
      const groupId = tasks.get(o.taskId)!.groupId;
      out.set(groupId, addRatio(out.get(groupId) ?? ZERO, { done: o.doneOn ? 1 : 0, total: 1 }));
    }
  }
  return out;
}

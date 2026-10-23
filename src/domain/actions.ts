import type { ISODate } from './dates';
import { ensureSchedule, indexTasks, newId, pickLightestDay, postponeCandidates } from './schedule';
import type { AppState, Group, Habit, Recurrence } from './types';

export interface TaskInput {
  title: string;
  groupId: string;
  recurrence: Recurrence;
}

export function toggleOccurrence(state: AppState, occurrenceId: string, today: ISODate): AppState {
  return {
    ...state,
    occurrences: state.occurrences.map((o) =>
      o.id === occurrenceId ? { ...o, doneOn: o.doneOn ? null : today } : o,
    ),
  };
}

/** Joga a ocorrência para o dia mais leve depois de hoje. Devolve o dia escolhido. */
export function postpone(
  state: AppState,
  occurrenceId: string,
  today: ISODate,
): { state: AppState; movedTo: ISODate | null } {
  const occ = state.occurrences.find((o) => o.id === occurrenceId);
  if (!occ || occ.date === null) return { state, movedTo: null };
  const others = state.occurrences.filter((o) => o.id !== occurrenceId);
  const movedTo = pickLightestDay(others, indexTasks(state.tasks), postponeCandidates(today), occ.taskId);
  return {
    state: {
      ...state,
      occurrences: state.occurrences.map((o) => (o.id === occurrenceId ? { ...o, date: movedTo } : o)),
    },
    movedTo,
  };
}

/** Desfaz um adiamento, devolvendo a ocorrência ao dia anterior. */
export function moveOccurrence(state: AppState, occurrenceId: string, date: ISODate): AppState {
  return {
    ...state,
    occurrences: state.occurrences.map((o) => (o.id === occurrenceId ? { ...o, date } : o)),
  };
}

export function addTask(state: AppState, input: TaskInput, today: ISODate): AppState {
  const task = { id: newId(), ...input, activeFrom: today };
  return ensureSchedule({ ...state, tasks: [...state.tasks, task] }, today);
}

export function updateTask(state: AppState, taskId: string, input: TaskInput, today: ISODate): AppState {
  const current = state.tasks.find((t) => t.id === taskId);
  if (!current) return state;
  const recurrenceChanged = JSON.stringify(current.recurrence) !== JSON.stringify(input.recurrence);
  const tasks = state.tasks.map((t) =>
    t.id === taskId ? { ...t, ...input, activeFrom: recurrenceChanged ? today : t.activeFrom } : t,
  );
  // Com a recorrência nova, as pendentes são refeitas; o que já foi feito continua no histórico.
  const occurrences = recurrenceChanged
    ? state.occurrences.filter((o) => o.taskId !== taskId || o.doneOn)
    : state.occurrences;
  return ensureSchedule({ ...state, tasks, occurrences }, today);
}

/** Tira a tarefa da lista, mantendo no histórico o que já foi feito. */
export function archiveTask(state: AppState, taskId: string): AppState {
  return {
    ...state,
    tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, archived: true } : t)),
    occurrences: state.occurrences.filter((o) => o.taskId !== taskId || o.doneOn),
  };
}

export function saveGroup(state: AppState, group: Group): AppState {
  const exists = state.groups.some((g) => g.id === group.id);
  return {
    ...state,
    groups: exists ? state.groups.map((g) => (g.id === group.id ? group : g)) : [...state.groups, group],
  };
}

export function canDeleteGroup(state: AppState, groupId: string): boolean {
  return !state.tasks.some((t) => t.groupId === groupId && !t.archived);
}

export function deleteGroup(state: AppState, groupId: string): AppState {
  if (!canDeleteGroup(state, groupId)) return state;
  return { ...state, groups: state.groups.filter((g) => g.id !== groupId) };
}

export function toggleHabit(state: AppState, date: ISODate, habitId: string): AppState {
  const done = state.habitLog[date] ?? [];
  const next = done.includes(habitId) ? done.filter((id) => id !== habitId) : [...done, habitId];
  return { ...state, habitLog: { ...state.habitLog, [date]: next } };
}

export function saveHabit(state: AppState, habit: Habit): AppState {
  const exists = state.habits.some((h) => h.id === habit.id);
  return {
    ...state,
    habits: exists ? state.habits.map((h) => (h.id === habit.id ? habit : h)) : [...state.habits, habit],
  };
}

export function deleteHabit(state: AppState, habitId: string): AppState {
  return { ...state, habits: state.habits.filter((h) => h.id !== habitId) };
}

export function setStudyHours(state: AppState, date: ISODate, hours: number): AppState {
  return { ...state, studyLog: { ...state.studyLog, [date]: Math.max(0, hours) } };
}

export function setStudyTarget(state: AppState, weekdayIndex: number, hours: number): AppState {
  const studyTargets = state.studyTargets.map((h, i) => (i === weekdayIndex ? Math.max(0, hours) : h));
  return { ...state, studyTargets };
}

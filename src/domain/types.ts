import type { ISODate, Weekday } from './dates';

export interface Group {
  id: string;
  name: string;
  color: string;
}

export type Recurrence =
  /** Uma vez; com prazo opcional. */
  | { kind: 'once'; date?: ISODate }
  /** Todos os dias. */
  | { kind: 'daily' }
  /** Dias fixos da semana: "toda terça", "todo sábado e domingo". */
  | { kind: 'weekdays'; days: Weekday[] }
  /** X vezes por semana, nos dias mais leves. */
  | { kind: 'weekly'; times: number }
  /** X vezes por mês, no checklist do mês. */
  | { kind: 'monthly'; times: number };

export type RecurrenceKind = Recurrence['kind'];

export interface Task {
  id: string;
  title: string;
  groupId: string;
  recurrence: Recurrence;
  /** A partir de quando a recorrência atual vale (data de criação ou da última edição). */
  activeFrom: ISODate;
  archived?: boolean;
}

/** Uma vez em que a tarefa precisa ser feita. */
export interface Occurrence {
  id: string;
  taskId: string;
  /** Dia em que aparece; `null` para tarefas mensais (ficam no checklist do mês). */
  date: ISODate | null;
  /** Dia em que foi planejada originalmente, para mostrar "veio de terça". */
  plannedFor: ISODate | null;
  /** Período de origem: a data (diária/dias fixos), a segunda-feira (semanal), "AAAA-MM" (mensal) ou "once". */
  period: string;
  doneOn: ISODate | null;
}

export interface Habit {
  id: string;
  name: string;
  /** Dias da semana em que o hábito vale. */
  days: Weekday[];
}

export interface AppState {
  version: 1;
  groups: Group[];
  tasks: Task[];
  occurrences: Occurrence[];
  habits: Habit[];
  /** Hábitos feitos em cada dia. */
  habitLog: Record<ISODate, string[]>;
  /** Horas de estudo registradas em cada dia. */
  studyLog: Record<ISODate, number>;
  /** Meta de horas de estudo por dia da semana (segunda a domingo). */
  studyTargets: number[];
  /** Primeiro dia de uso; dias anteriores não entram na porcentagem. */
  startedOn?: ISODate;
}

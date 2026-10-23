import { describe, expect, it } from 'vitest';
import { addTask, postpone, toggleOccurrence, updateTask } from './actions';
import { weekday, weekStart } from './dates';
import { dayProgress, monthOccurrences, percent } from './progress';
import { carriedLabel, ensureSchedule } from './schedule';
import { seedState } from './seed';
import type { AppState, Recurrence } from './types';

// 19/10/2026 é uma segunda-feira.
const MON = '2026-10-19';
const TUE = '2026-10-20';
const WED = '2026-10-21';
const SUN = '2026-10-25';
const NEXT_MON = '2026-10-26';

function emptyState(): AppState {
  return {
    version: 1,
    groups: [{ id: 'g', name: 'Casa', color: '#fff' }],
    tasks: [],
    occurrences: [],
    habits: [],
    habitLog: {},
    studyLog: {},
    studyTargets: [0, 0, 0, 0, 0, 0, 0],
  };
}

function withTask(state: AppState, title: string, recurrence: Recurrence, today: string): AppState {
  return addTask(state, { title, groupId: 'g', recurrence }, today);
}

const taskId = (s: AppState, title: string) => s.tasks.find((t) => t.title === title)!.id;
const occsOf = (s: AppState, title: string) => s.occurrences.filter((o) => o.taskId === taskId(s, title));

describe('datas', () => {
  it('semana começa na segunda', () => {
    expect(weekday(MON)).toBe(0);
    expect(weekday(SUN)).toBe(6);
    expect(weekStart(SUN)).toBe(MON);
  });
});

describe('distribuição das tarefas', () => {
  it('coloca a tarefa semanal no dia mais leve', () => {
    let s = withTask(emptyState(), 'Lixo', { kind: 'weekdays', days: [0, 1] }, MON);
    s = withTask(s, 'Banheiro', { kind: 'weekly', times: 1 }, MON);
    expect(occsOf(s, 'Banheiro').map((o) => o.date)).toEqual([WED]);
  });

  it('espalha as repetições semanais em dias diferentes', () => {
    const s = withTask(emptyState(), 'Roupas', { kind: 'weekly', times: 3 }, MON);
    const days = occsOf(s, 'Roupas').map((o) => o.date);
    expect(new Set(days).size).toBe(3);
  });

  it('cria tarefas de dias fixos só nos dias escolhidos', () => {
    const s = withTask(emptyState(), 'Feira', { kind: 'weekdays', days: [5, 6] }, MON);
    expect(occsOf(s, 'Feira').map((o) => weekday(o.date!))).toEqual([5, 6]);
  });

  it('não duplica ao rodar de novo no mesmo dia', () => {
    let s = withTask(emptyState(), 'Banheiro', { kind: 'weekly', times: 2 }, MON);
    s = withTask(s, 'Cama', { kind: 'daily' }, MON);
    const before = s.occurrences.length;
    expect(ensureSchedule(ensureSchedule(s, MON), MON).occurrences.length).toBe(before);
  });
});

describe('o que ficou para trás', () => {
  it('move a tarefa não feita para o dia mais leve que resta', () => {
    let s = withTask(emptyState(), 'Banheiro', { kind: 'weekly', times: 1 }, MON);
    const occ = occsOf(s, 'Banheiro')[0];
    s = { ...s, occurrences: s.occurrences.map((o) => ({ ...o, date: TUE, plannedFor: TUE })) };
    s = ensureSchedule(s, WED);
    const moved = s.occurrences.find((o) => o.id === occ.id)!;
    expect(moved.date! >= WED).toBe(true);
    expect(carriedLabel(moved, WED)).toBe('veio de terça');
  });

  it('passa para a semana seguinte sem sumir', () => {
    let s = withTask(emptyState(), 'Banheiro', { kind: 'weekly', times: 1 }, MON);
    s = { ...s, occurrences: s.occurrences.map((o) => ({ ...o, date: SUN, plannedFor: SUN })) };
    s = ensureSchedule(s, NEXT_MON);
    const occs = occsOf(s, 'Banheiro');
    // A da semana passada continua pendente, e a desta semana também foi criada.
    expect(occs).toHaveLength(2);
    expect(occs.every((o) => o.date! >= NEXT_MON)).toBe(true);
    expect(occs.map((o) => carriedLabel(o, NEXT_MON))).toContain('da semana passada');
  });

  it('não move tarefas diárias', () => {
    let s = withTask(emptyState(), 'Cama', { kind: 'daily' }, MON);
    s = ensureSchedule(s, WED);
    const monday = occsOf(s, 'Cama').filter((o) => o.date === MON);
    expect(monday).toHaveLength(1);
    expect(monday[0].doneOn).toBeNull();
  });

  it('mantém a tarefa feita no dia em que foi feita', () => {
    let s = withTask(emptyState(), 'Feira', { kind: 'weekdays', days: [0] }, MON);
    s = toggleOccurrence(s, occsOf(s, 'Feira')[0].id, MON);
    s = ensureSchedule(s, WED);
    expect(occsOf(s, 'Feira')[0].date).toBe(MON);
  });

  it('leva a mensal não feita para o checklist do mês seguinte', () => {
    let s = withTask(emptyState(), 'Janelas', { kind: 'monthly', times: 1 }, '2026-10-30');
    s = ensureSchedule(s, '2026-11-02');
    const month = monthOccurrences(s, '2026-11-02');
    expect(month).toHaveLength(2);
    expect(month.map((o) => carriedLabel(o, '2026-11-02'))).toContain('do mês passado');
  });
});

describe('adiar', () => {
  it('no domingo, adia para a semana seguinte', () => {
    const s = withTask(emptyState(), 'Banheiro', { kind: 'weekly', times: 1 }, SUN);
    const result = postpone(s, occsOf(s, 'Banheiro')[0].id, SUN);
    expect(result.movedTo! >= NEXT_MON).toBe(true);
  });
});

describe('editar tarefa', () => {
  it('refaz as pendentes e mantém as feitas ao mudar a recorrência', () => {
    let s = withTask(emptyState(), 'Lixo', { kind: 'daily' }, MON);
    s = toggleOccurrence(s, occsOf(s, 'Lixo').find((o) => o.date === MON)!.id, MON);
    s = updateTask(s, taskId(s, 'Lixo'), { title: 'Lixo', groupId: 'g', recurrence: { kind: 'weekdays', days: [4] } }, MON);
    const occs = occsOf(s, 'Lixo');
    expect(occs.filter((o) => o.doneOn)).toHaveLength(1);
    expect(occs.filter((o) => !o.doneOn).map((o) => weekday(o.date!))).toEqual([4]);
  });
});

describe('porcentagem', () => {
  it('conta tarefas, hábitos e estudo proporcional', () => {
    let s = withTask(emptyState(), 'A', { kind: 'weekdays', days: [0] }, MON);
    s = withTask(s, 'B', { kind: 'weekdays', days: [0] }, MON);
    s = toggleOccurrence(s, occsOf(s, 'A')[0].id, MON);
    s = {
      ...s,
      habits: [
        { id: 'h1', name: 'Dormir', days: [0] },
        { id: 'h2', name: 'Acordar', days: [0] },
      ],
      habitLog: { [MON]: ['h1'] },
      studyLog: { [MON]: 1 },
      studyTargets: [2, 0, 0, 0, 0, 0, 0],
    };
    // (1 tarefa + 1 hábito + 0,5 de estudo) / 5 itens = 50%
    expect(percent(dayProgress(s, MON).overall)).toBe(50);
  });

  it('o estado inicial já tem a semana montada', () => {
    const s = seedState(MON);
    expect(dayProgress(s, MON).tasks.total).toBeGreaterThan(0);
    expect(monthOccurrences(s, MON).length).toBe(7);
  });
});

describe('primeiro uso', () => {
  it('não conta os dias antes de começar a usar o app', () => {
    const s = seedState('2026-10-22');
    expect(percent(dayProgress(s, TUE).overall)).toBeNull();
    expect(dayProgress(s, '2026-10-22').habits.total).toBe(4);
  });
});

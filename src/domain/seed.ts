import type { ISODate, Weekday } from './dates';
import { ensureSchedule, newId } from './schedule';
import type { AppState, Group, Recurrence, Task } from './types';

export const GROUP_COLORS = ['#9fd8c2', '#f6c39f', '#a9bdf0', '#cdb8ec', '#f5b8c8', '#f3dc8c'];

const ALL_DAYS: Weekday[] = [0, 1, 2, 3, 4, 5, 6];

/** Estado inicial baseado no planner que a Letícia já usava. */
export function seedState(today: ISODate): AppState {
  const rotina: Group = { id: newId(), name: 'Rotina', color: GROUP_COLORS[0] };
  const casa: Group = { id: newId(), name: 'Casa', color: GROUP_COLORS[1] };
  const pos: Group = { id: newId(), name: 'Pós', color: GROUP_COLORS[2] };

  const task = (title: string, group: Group, recurrence: Recurrence): Task => ({
    id: newId(),
    title,
    groupId: group.id,
    recurrence,
    activeFrom: today,
  });
  const daily: Recurrence = { kind: 'daily' };
  const weekly = (times: number): Recurrence => ({ kind: 'weekly', times });
  const monthly: Recurrence = { kind: 'monthly', times: 1 };
  const on = (...days: Weekday[]): Recurrence => ({ kind: 'weekdays', days });

  const tasks: Task[] = [
    task('Arrumar a cama', rotina, daily),
    task('Alimentar o Chico', rotina, daily),
    task('Limpar a caixa de areia', rotina, daily),
    task('Lavar a louça', rotina, daily),

    task('Tirar o lixo', casa, on(0, 2, 4)),
    task('Feira e compras', casa, on(2)),
    task('Trocar roupa de cama', casa, on(3)),
    task('Limpar banheiro', casa, weekly(1)),
    task('Lavar roupas', casa, weekly(2)),
    task('Dobrar roupas', casa, weekly(2)),
    task('Trocar toalhas', casa, weekly(1)),
    task('Aspirar cantinhos', casa, weekly(1)),
    task('Limpeza da cozinha', casa, weekly(1)),
    task('Verificar caixa de areia e lavar a pá', casa, weekly(1)),

    task('Limpar janelas', casa, monthly),
    task('Limpar geladeira', casa, monthly),
    task('Organizar armários', casa, monthly),
    task('Limpar forno e micro-ondas', casa, monthly),
    task('Lavar a máquina de lavar', casa, monthly),
    task('Limpar ventiladores e filtros', casa, monthly),
    task('Desapegar / doar', casa, monthly),
  ];

  return ensureSchedule(
    {
      version: 1,
      groups: [rotina, casa, pos],
      tasks,
      occurrences: [],
      habits: [
        { id: 'dormir', name: 'Dormi até 22h', days: ALL_DAYS },
        { id: 'acordar', name: 'Acordei às 6h', days: ALL_DAYS },
        { id: 'exercicio', name: 'Exercício', days: ALL_DAYS },
        { id: 'trabalho', name: 'Trabalhei hoje', days: [0, 1, 2, 3, 4] },
      ],
      habitLog: {},
      studyLog: {},
      studyTargets: [1, 1, 1, 2, 2, 2, 2],
      startedOn: today,
    },
    today,
  );
}

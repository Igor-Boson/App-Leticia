import { formatShortDate, type Weekday } from './dates';
import type { Recurrence } from './types';

const DAY_NAMES = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
const isWeekend = (d: Weekday) => d >= 5;

function joinPt(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
}

/** "toda terça", "todo sábado e domingo", "toda segunda e todo sábado", "de segunda a sexta" */
export function weekdaysLabel(days: Weekday[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return 'todo dia';
  if (sorted.join() === '0,1,2,3,4') return 'de segunda a sexta';
  if (sorted.every((d) => !isWeekend(d))) return `toda ${joinPt(sorted.map((d) => DAY_NAMES[d]))}`;
  if (sorted.every(isWeekend)) return `todo ${joinPt(sorted.map((d) => DAY_NAMES[d]))}`;
  return joinPt(sorted.map((d) => `${isWeekend(d) ? 'todo' : 'toda'} ${DAY_NAMES[d]}`));
}

export function recurrenceLabel(r: Recurrence): string {
  switch (r.kind) {
    case 'once':
      return r.date ? `uma vez · até ${formatShortDate(r.date)}` : 'uma vez';
    case 'daily':
      return 'todo dia';
    case 'weekdays':
      return weekdaysLabel(r.days);
    case 'weekly':
      return `${r.times}x por semana`;
    case 'monthly':
      return `${r.times}x por mês`;
  }
}

export function recurrenceExplanation(r: Recurrence): string {
  switch (r.kind) {
    case 'once':
      return r.date
        ? 'Aparece no dia do prazo. Se não for feita, vai para o dia mais leve seguinte até ser concluída.'
        : 'Vai para o dia mais leve da semana. Se não for feita, continua aparecendo até ser concluída.';
    case 'daily':
      return 'Aparece todos os dias na tela Hoje e conta na porcentagem de cada dia.';
    case 'weekdays':
      return 'Aparece nos dias escolhidos. Se não der tempo, vai para o dia mais leve que resta. E, se a semana acabar, passa para a próxima.';
    case 'weekly':
      return `O app coloca ${r.times === 1 ? 'a tarefa no dia' : `as ${r.times} vezes nos dias`} com menos coisa da semana. Se não der tempo, ela vai para outro dia leve. E, se a semana acabar, passa para a próxima.`;
    case 'monthly':
      return 'Entra no checklist do mês. Se não for feita até o fim do mês, passa para o mês seguinte.';
  }
}

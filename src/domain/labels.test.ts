import { describe, expect, it } from 'vitest';
import { recurrenceLabel, weekdaysLabel } from './labels';

describe('textos de repetição', () => {
  it('descreve dias fixos como a Letícia fala', () => {
    expect(weekdaysLabel([1])).toBe('toda terça');
    expect(weekdaysLabel([5, 6])).toBe('todo sábado e domingo');
    expect(weekdaysLabel([0, 2, 4])).toBe('toda segunda, quarta e sexta');
    expect(weekdaysLabel([0, 1, 2, 3, 4])).toBe('de segunda a sexta');
    expect(weekdaysLabel([0, 5])).toBe('toda segunda e todo sábado');
  });

  it('descreve as outras repetições', () => {
    expect(recurrenceLabel({ kind: 'weekly', times: 2 })).toBe('2x por semana');
    expect(recurrenceLabel({ kind: 'once', date: '2026-10-31' })).toBe('uma vez · até 31/10');
  });
});

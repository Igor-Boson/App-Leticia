import { useState, type FormEvent } from 'react';
import { Icon, Stepper } from '../components/ui';
import { addTask, archiveTask, updateTask } from '../domain/actions';
import { WEEKDAY_LETTER, WEEKDAY_LONG, type Weekday } from '../domain/dates';
import { recurrenceExplanation } from '../domain/labels';
import type { Recurrence, RecurrenceKind } from '../domain/types';
import { useStore } from '../state/store';

const KINDS: { kind: RecurrenceKind; label: string }[] = [
  { kind: 'once', label: 'Uma vez' },
  { kind: 'daily', label: 'Todo dia' },
  { kind: 'weekdays', label: 'Dias da semana' },
  { kind: 'weekly', label: 'X por semana' },
  { kind: 'monthly', label: 'X por mês' },
];

export function TaskForm({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const { state, today, update } = useStore();
  const existing = taskId ? state.tasks.find((t) => t.id === taskId) : undefined;
  const r = existing?.recurrence;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [groupId, setGroupId] = useState(existing?.groupId ?? state.groups[0]?.id ?? '');
  const [kind, setKind] = useState<RecurrenceKind>(r?.kind ?? 'weekly');
  const [days, setDays] = useState<Weekday[]>(r?.kind === 'weekdays' ? r.days : []);
  const [times, setTimes] = useState(r?.kind === 'weekly' || r?.kind === 'monthly' ? r.times : 1);
  const [date, setDate] = useState(r?.kind === 'once' ? r.date ?? '' : '');

  const recurrence: Recurrence = (() => {
    switch (kind) {
      case 'once':
        return date ? { kind, date } : { kind };
      case 'daily':
        return { kind };
      case 'weekdays':
        return { kind, days: [...days].sort((a, b) => a - b) };
      case 'weekly':
      case 'monthly':
        return { kind, times };
    }
  })();

  const valid = title.trim() !== '' && groupId !== '' && (kind !== 'weekdays' || days.length > 0);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const input = { title: title.trim(), groupId, recurrence };
    update((s, t) => (existing ? updateTask(s, existing.id, input, t) : addTask(s, input, t)));
    onClose();
  }

  function remove() {
    if (!existing) return;
    if (!window.confirm(`Excluir a tarefa "${existing.title}"? O que já foi feito continua no histórico.`)) return;
    update((s) => archiveTask(s, existing.id));
    onClose();
  }

  const toggleDay = (d: Weekday) =>
    setDays((current) => (current.includes(d) ? current.filter((x) => x !== d) : [...current, d]));

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
      <form className="app" onSubmit={submit}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" className="icon-button" style={{ marginLeft: -10 }} aria-label="Voltar" onClick={onClose}>
            {Icon.chevronLeft()}
          </button>
          <h1 id="task-form-title" className="page-title" style={{ fontSize: 22 }}>
            {existing ? 'Editar tarefa' : 'Nova tarefa'}
          </h1>
        </header>

        <div className="field">
          <label htmlFor="task-title" className="field-label">
            Nome
          </label>
          <input
            id="task-title"
            className="text-input"
            value={title}
            placeholder="Ex.: limpar banheiro"
            autoFocus={!existing}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <fieldset className="field">
          <legend className="field-label" style={{ marginBottom: 8 }}>
            Grupo
          </legend>
          <div className="chips">
            {state.groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="chip"
                aria-pressed={groupId === g.id}
                onClick={() => setGroupId(g.id)}
              >
                <span className="dot" style={{ background: g.color }} />
                {g.name}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend className="field-label" style={{ marginBottom: 8 }}>
            Repetir
          </legend>
          <div className="chips">
            {KINDS.map((k) => (
              <button
                key={k.kind}
                type="button"
                className="chip"
                aria-pressed={kind === k.kind}
                onClick={() => setKind(k.kind)}
              >
                {k.label}
              </button>
            ))}
          </div>
        </fieldset>

        {kind === 'weekdays' && (
          <fieldset className="field">
            <legend className="field-label" style={{ marginBottom: 8 }}>
              Em quais dias?
            </legend>
            <div className="day-picker">
              {WEEKDAY_LETTER.map((letter, i) => {
                const d = i as Weekday;
                return (
                  <button
                    key={d}
                    type="button"
                    className="day-toggle"
                    aria-pressed={days.includes(d)}
                    aria-label={WEEKDAY_LONG[d]}
                    onClick={() => toggleDay(d)}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {(kind === 'weekly' || kind === 'monthly') && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span>Quantas vezes {kind === 'weekly' ? 'por semana' : 'por mês'}?</span>
            <div style={{ width: 170 }}>
              <Stepper
                value={times}
                label="vezes"
                min={1}
                max={kind === 'weekly' ? 7 : 10}
                format={(n) => `${n}x`}
                onChange={setTimes}
              />
            </div>
          </div>
        )}

        {kind === 'once' && (
          <div className="field">
            <label htmlFor="task-date" className="field-label">
              Prazo (opcional)
            </label>
            <input
              id="task-date"
              type="date"
              className="text-input"
              value={date}
              min={today}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        <div className="info">
          {Icon.info()}
          <span>{recurrenceExplanation(recurrence)}</span>
        </div>

        <div className="button-row">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={!valid}>
            Salvar
          </button>
        </div>

        {existing && (
          <button type="button" className="danger-button" onClick={remove}>
            {Icon.trash()} Excluir tarefa
          </button>
        )}
      </form>
    </div>
  );
}

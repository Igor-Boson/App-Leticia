import { TaskRow } from '../components/TaskRow';
import { Bar, CheckMark, Icon, ProgressRing, Section, Stepper } from '../components/ui';
import { toggleHabit, toggleOccurrence, setStudyHours } from '../domain/actions';
import { formatHours, formatLongDate, weekday, WEEKDAY_LONG } from '../domain/dates';
import { dayProgress, monthOccurrences, occurrencesOn, percent, studyTarget } from '../domain/progress';
import { indexTasks } from '../domain/schedule';
import { useStore } from '../state/store';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function Today({
  onPostpone,
  onNewTask,
  onOpenWeek,
}: {
  onPostpone: (occurrenceId: string) => void;
  onNewTask: () => void;
  onOpenWeek: () => void;
}) {
  const { state, today, update } = useStore();
  const tasks = indexTasks(state.tasks);
  const progress = dayProgress(state, today);
  const pct = percent(progress.overall);
  const remaining = Math.round(progress.overall.total - progress.overall.done);
  const occs = occurrencesOn(state, today);
  const habits = state.habits.filter((h) => h.days.includes(weekday(today)));
  const doneHabits = state.habitLog[today] ?? [];
  const target = studyTarget(state, today);
  const hours = state.studyLog[today] ?? 0;
  const month = monthOccurrences(state, today);
  const monthDone = month.filter((o) => o.doneOn).length;
  const monthPending = month.filter((o) => !o.doneOn).map((o) => tasks.get(o.taskId)!.title);

  const groups = state.groups
    .map((g) => ({ group: g, occs: occs.filter((o) => tasks.get(o.taskId)!.groupId === g.id) }))
    .filter((g) => g.occs.length > 0);

  return (
    <>
      <section className="card progress-card" aria-label="Progresso do dia">
        <ProgressRing value={pct} label="do dia" />
        <div>
          {remaining <= 0 ? (
            <>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Dia completo!</div>
              <div className="muted">Tudo feito por hoje.</div>
            </>
          ) : (
            <>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {remaining === 1 ? 'Falta 1 item' : `Faltam ${remaining} itens`}
              </div>
              <div className="muted small">Tarefas, hábitos e estudo entram na conta.</div>
            </>
          )}
        </div>
      </section>

      {habits.length > 0 && (
        <Section title="Hábitos" aside={`${progress.habits.done} de ${progress.habits.total}`}>
          <div className="habit-grid">
            {habits.map((h) => {
              const on = doneHabits.includes(h.id);
              return (
                <button
                  key={h.id}
                  type="button"
                  className="habit"
                  aria-pressed={on}
                  onClick={() => update((s) => toggleHabit(s, today, h.id))}
                >
                  <CheckMark on={on} round />
                  <span>{h.name}</span>
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {(target > 0 || hours > 0) && (
        <section className="card section" aria-label="Estudos da pós">
          <div className="section-head">
            <h2 className="section-title">Estudos da pós</h2>
            <span className="muted small">{target > 0 ? `meta de hoje: ${formatHours(target)}` : 'sem meta hoje'}</span>
          </div>
          <Stepper
            value={hours}
            label="meia hora de estudo"
            step={0.5}
            max={12}
            format={(h) => (h === 0 ? '0h' : formatHours(h))}
            onChange={(h) => update((s) => setStudyHours(s, today, h))}
          />
          {target > 0 && <Bar value={Math.min(100, (hours / target) * 100)} color="#a9bdf0" />}
        </section>
      )}

      <Section title="Tarefas de hoje" aside={`${progress.tasks.done} de ${progress.tasks.total}`}>
        {groups.length === 0 && <p className="empty">Nenhuma tarefa para hoje.</p>}
        {groups.map(({ group, occs: groupOccs }) => (
          <div key={group.id} className="card group-card">
            <div className="group-head">
              <span className="dot" style={{ background: group.color }} />
              <span style={{ flex: 1 }}>{group.name}</span>
              <span className="muted small" style={{ fontWeight: 400 }}>
                {groupOccs.filter((o) => o.doneOn).length}/{groupOccs.length}
              </span>
            </div>
            {groupOccs.map((o) => (
              <TaskRow
                key={o.id}
                occurrence={o}
                task={tasks.get(o.taskId)!}
                today={today}
                onToggle={() => update((s) => toggleOccurrence(s, o.id, today))}
                onPostpone={() => onPostpone(o.id)}
              />
            ))}
          </div>
        ))}
      </Section>

      {month.length > 0 && (
        <button
          type="button"
          className="card progress-card"
          style={{ textAlign: 'left', gap: 14 }}
          onClick={onOpenWeek}
          aria-label="Abrir o checklist do mês"
        >
          {Icon.book()}
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <strong>Checklist do mês</strong>
            <span className="muted small">
              {monthDone} de {month.length} feitas
              {monthPending.length > 0 && ` · ${monthPending.slice(0, 2).join(', ').toLowerCase()}…`}
            </span>
          </span>
          <strong>{percent({ done: monthDone, total: month.length })}%</strong>
        </button>
      )}

      <button type="button" className="primary-button" onClick={onNewTask}>
        {Icon.plus()} Nova tarefa
      </button>
    </>
  );
}

export function todayHeader(today: string) {
  return {
    eyebrow: WEEKDAY_LONG[weekday(today)],
    title: formatLongDate(today),
    subtitle: `${greeting()}, Letícia.`,
  };
}

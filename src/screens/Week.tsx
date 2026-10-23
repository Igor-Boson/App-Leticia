import { Fragment, useState } from 'react';
import { TaskRow } from '../components/TaskRow';
import { Bar, CheckMark, Icon, ProgressRing, Section } from '../components/ui';
import { toggleHabit, toggleOccurrence } from '../domain/actions';
import {
  addDays,
  dayOfMonth,
  formatHours,
  formatWeekRange,
  monthName,
  weekday,
  weekDays,
  weekEnd,
  WEEKDAY_LETTER,
  WEEKDAY_LONG,
  WEEKDAY_SHORT,
  type ISODate,
} from '../domain/dates';
import { beforeStart, groupWeekProgress, monthOccurrences, occurrencesOn, percent, studyTarget, weekProgress } from '../domain/progress';
import { carriedLabel, dayLoad, indexTasks } from '../domain/schedule';
import { useStore } from '../state/store';

export function Week() {
  const { state, today, update } = useStore();
  const [offset, setOffset] = useState(0);
  const [openDay, setOpenDay] = useState<ISODate | null>(today);
  const anchor = addDays(today, offset * 7);
  const isCurrentWeek = offset === 0;
  const tasks = indexTasks(state.tasks);
  const week = weekProgress(state, anchor);
  const groups = groupWeekProgress(state, anchor);
  const days = weekDays(anchor);

  // Dia mais leve entre os que ainda restam nesta semana.
  let lightest: ISODate | null = null;
  if (isCurrentWeek) {
    let min = Infinity;
    for (const d of days.filter((d) => d > today && d <= weekEnd(today))) {
      const load = dayLoad(state.occurrences, tasks, d);
      if (load < min) {
        min = load;
        lightest = d;
      }
    }
  }

  const month = isCurrentWeek ? monthOccurrences(state, today) : [];
  const monthDone = month.filter((o) => o.doneOn).length;

  return (
    <>
      <div className="week-nav">
        <button type="button" className="icon-button" aria-label="Semana anterior" onClick={() => setOffset(offset - 1)}>
          {Icon.chevronLeft()}
        </button>
        <h2 className="page-title" style={{ textAlign: 'center' }}>
          {formatWeekRange(anchor)}
        </h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Próxima semana"
          disabled={isCurrentWeek}
          onClick={() => setOffset(offset + 1)}
        >
          {Icon.chevronRight()}
        </button>
      </div>

      <section className="card section" aria-label="Resumo da semana" style={{ gap: 16 }}>
        <div className="progress-card">
          <ProgressRing value={percent(week.overall)} size={104} label="da semana" />
          <div className="muted small">
            {isCurrentWeek
              ? 'A porcentagem considera a semana inteira, então ela sobe a cada dia.'
              : 'Resultado da semana.'}
          </div>
        </div>
        <div className="stats">
          <div className="stat">
            <span className="muted small">Tarefas</span>
            <strong>{percent(week.tasks) ?? '—'}%</strong>
            <span className="muted small">
              {week.tasks.done} de {week.tasks.total}
            </span>
          </div>
          <div className="stat">
            <span className="muted small">Hábitos</span>
            <strong>{percent(week.habits) ?? '—'}%</strong>
            <span className="muted small">
              {week.habits.done} de {week.habits.total}
            </span>
          </div>
          <div className="stat">
            <span className="muted small">Estudo</span>
            <strong>{percent(week.study) ?? '—'}%</strong>
            <span className="muted small">
              {week.studyHours ? formatHours(week.studyHours) : '0h'} de {formatHours(week.studyTargetHours)}
            </span>
          </div>
        </div>
      </section>

      <Section title="Dia a dia">
        <div className="card" style={{ padding: '0 14px' }}>
          {week.days.map(({ date, progress }) => {
            const dayPct = percent(progress.overall);
            const open = openDay === date;
            const dayOccs = occurrencesOn(state, date);
            return (
              <div key={date}>
                <button
                  type="button"
                  className="day-row"
                  aria-expanded={open}
                  aria-label={`${WEEKDAY_LONG[weekday(date)]}, ${dayOfMonth(date)} de ${monthName(date)}`}
                  onClick={() => setOpenDay(open ? null : date)}
                >
                  <span className="day-name">
                    {WEEKDAY_SHORT[weekday(date)]}
                    <span className="muted" style={{ fontWeight: 400, fontSize: 15 }}>
                      {dayOfMonth(date)}
                    </span>
                  </span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ display: 'flex', justifyContent: 'space-between', gap: 6, fontSize: 15 }}>
                      <span>
                        {beforeStart(state, date)
                          ? 'antes de começar'
                          : date > today
                          ? `${progress.tasks.total} planejadas`
                          : `${progress.tasks.done} de ${progress.tasks.total} tarefas`}
                      </span>
                      {date === today && <span className="badge solid">hoje</span>}
                      {date === lightest && <span className="badge blue">dia mais leve</span>}
                    </span>
                    <Bar value={dayPct} />
                  </span>
                  <strong style={{ width: 44, textAlign: 'right' }}>{dayPct === null ? '—' : `${dayPct}%`}</strong>
                </button>
                {open && (
                  <div className="day-tasks">
                    {dayOccs.length === 0 && <p className="empty">Nenhuma tarefa neste dia.</p>}
                    {dayOccs.map((o) => (
                      <TaskRow
                        key={o.id}
                        occurrence={o}
                        task={tasks.get(o.taskId)!}
                        today={today}
                        onToggle={() => update((s) => toggleOccurrence(s, o.id, today))}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {state.habits.length > 0 && (
        <Section title="Hábitos">
          <div className="card">
            <div className="habit-table">
              <span />
              {WEEKDAY_LETTER.map((l, i) => (
                <span key={i} className="head">
                  {l}
                </span>
              ))}
              {state.habits.map((h) => (
                <Fragment key={h.id}>{habitRow(h.id, h.name)}</Fragment>
              ))}
              <span className="small" style={{ paddingTop: 8, borderTop: '1px solid var(--divider)' }}>
                Horas de estudo
              </span>
              {days.map((d) => {
                const future = d > today;
                const value = future ? studyTarget(state, d) : state.studyLog[d] ?? 0;
                return (
                  <span
                    key={d}
                    className="small"
                    style={{
                      textAlign: 'center',
                      paddingTop: 8,
                      borderTop: '1px solid var(--divider)',
                      color: future ? '#8a93ad' : undefined,
                      fontSize: 12,
                    }}
                  >
                    {value ? formatHours(value) : '–'}
                  </span>
                );
              })}
            </div>
            <p className="muted small" style={{ margin: '12px 0 0' }}>
              Toque num dia para marcar um hábito esquecido. Nos dias que ainda não chegaram, aparece a meta de estudo.
            </p>
          </div>
        </Section>
      )}

      {groups.size > 0 && (
        <Section title="Por grupo">
          <div className="card section" style={{ gap: 14 }}>
            {state.groups
              .filter((g) => groups.has(g.id))
              .map((g) => {
                const r = groups.get(g.id)!;
                const p = percent(r);
                return (
                  <div key={g.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="dot" style={{ background: g.color }} />
                      <span style={{ flex: 1 }}>{g.name}</span>
                      <span className="muted small">
                        {r.done} de {r.total}
                      </span>
                      <strong style={{ width: 44, textAlign: 'right' }}>{p}%</strong>
                    </div>
                    <Bar value={p} color={g.color} />
                  </div>
                );
              })}
          </div>
        </Section>
      )}

      {month.length > 0 && (
        <Section title={`Checklist de ${monthName(today)}`} aside={`${percent({ done: monthDone, total: month.length })}%`}>
          <div className="card" style={{ padding: '0 14px' }}>
            {month.map((o) => {
              const task = tasks.get(o.taskId)!;
              const badge = carriedLabel(o, today);
              return (
                <div key={o.id} className="task-row" style={{ borderTop: 'none', borderBottom: '1px solid var(--divider)' }}>
                  <button
                    type="button"
                    className="task-check"
                    aria-pressed={!!o.doneOn}
                    aria-label={o.doneOn ? `Desmarcar ${task.title}` : `Marcar como feita: ${task.title}`}
                    onClick={() => update((s) => toggleOccurrence(s, o.id, today))}
                  >
                    <CheckMark on={!!o.doneOn} />
                  </button>
                  <span className="task-body" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <span className={`task-title${o.doneOn ? ' done' : ''}`}>{task.title}</span>
                    {badge && <span className="badge">{badge}</span>}
                  </span>
                </div>
              );
            })}
            <p className="muted small" style={{ margin: 0, padding: '10px 0' }}>
              O que não for feito este mês passa para o próximo.
            </p>
          </div>
        </Section>
      )}
    </>
  );

  function habitRow(habitId: string, name: string) {
    const habit = state.habits.find((h) => h.id === habitId)!;
    return (
      <>
        <span className="small">{name}</span>
        {days.map((d) => {
          if (!habit.days.includes(weekday(d)) || beforeStart(state, d)) return <span key={d} />;
          const done = (state.habitLog[d] ?? []).includes(habitId);
          if (d > today) {
            return (
              <span key={d} className="cell">
                <span className="future" />
              </span>
            );
          }
          return (
            <button
              key={d}
              type="button"
              className="cell"
              aria-pressed={done}
              aria-label={`${name}, ${WEEKDAY_LONG[weekday(d)]}`}
              onClick={() => update((s) => toggleHabit(s, d, habitId))}
            >
              {done ? (
                <span className="check round on" style={{ width: 22, height: 22 }}>
                  {Icon.check()}
                </span>
              ) : (
                <span className="miss" />
              )}
            </button>
          );
        })}
      </>
    );
  }
}

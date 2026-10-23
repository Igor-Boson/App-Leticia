import { useEffect, useState } from 'react';
import { moveOccurrence, postpone } from './domain/actions';
import { weekday, weekStart, WEEKDAY_LONG, type ISODate } from './domain/dates';
import { useStore } from './state/store';
import { Settings } from './screens/Settings';
import { TaskForm } from './screens/TaskForm';
import { Tasks } from './screens/Tasks';
import { Today, todayHeader } from './screens/Today';
import { Week } from './screens/Week';

type Tab = 'hoje' | 'semana' | 'tarefas';
type Overlay = { kind: 'task'; taskId: string | null } | { kind: 'settings' } | null;
interface Notice {
  text: string;
  occurrenceId: string;
  previousDate: ISODate;
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'semana', label: 'Semana' },
  { id: 'tarefas', label: 'Tarefas' },
];

export function App() {
  const { state, today, update } = useStore();
  const [tab, setTab] = useState<Tab>('hoje');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function handlePostpone(occurrenceId: string) {
    const occ = state.occurrences.find((o) => o.id === occurrenceId);
    const task = occ && state.tasks.find((t) => t.id === occ.taskId);
    if (!occ?.date || !task) return;
    const { movedTo } = postpone(state, occurrenceId, today);
    if (!movedTo) return;
    const previousDate = occ.date;
    update((s) => moveOccurrence(s, occurrenceId, movedTo));
    const dayName = WEEKDAY_LONG[weekday(movedTo)].replace('-feira', '');
    const when = weekStart(movedTo) > weekStart(today) ? `${dayName} da próxima semana` : dayName;
    setNotice({ text: `"${task.title}" foi para ${when}, o dia mais leve.`, occurrenceId, previousDate });
  }

  const header =
    tab === 'hoje'
      ? todayHeader(today)
      : tab === 'semana'
        ? { eyebrow: 'Semana', title: 'Sua semana', subtitle: null }
        : { eyebrow: 'Tarefas', title: 'Suas tarefas', subtitle: 'Cadastre uma vez e o app distribui pela semana.' };

  return (
    <>
      <main className="app" aria-hidden={overlay ? true : undefined}>
        <header className="page-header">
          <span className="eyebrow">{header.eyebrow}</span>
          <h1 className="page-title">{header.title}</h1>
          {header.subtitle && <span className="subtitle">{header.subtitle}</span>}
        </header>

        <nav className="tabs" aria-label="Telas">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className="tab"
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => {
                setTab(t.id);
                window.scrollTo({ top: 0 });
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'hoje' && (
          <Today
            onPostpone={handlePostpone}
            onNewTask={() => setOverlay({ kind: 'task', taskId: null })}
            onOpenWeek={() => setTab('semana')}
          />
        )}
        {tab === 'semana' && <Week />}
        {tab === 'tarefas' && (
          <Tasks
            onNewTask={() => setOverlay({ kind: 'task', taskId: null })}
            onEditTask={(taskId) => setOverlay({ kind: 'task', taskId })}
            onOpenSettings={() => setOverlay({ kind: 'settings' })}
          />
        )}
      </main>

      {overlay?.kind === 'task' && <TaskForm taskId={overlay.taskId} onClose={() => setOverlay(null)} />}
      {overlay?.kind === 'settings' && <Settings onClose={() => setOverlay(null)} />}

      {notice && !overlay && (
        <div className="toast" role="status">
          <p>{notice.text}</p>
          <button
            type="button"
            className="link-button"
            onClick={() => {
              update((s) => moveOccurrence(s, notice.occurrenceId, notice.previousDate));
              setNotice(null);
            }}
          >
            Desfazer
          </button>
        </div>
      )}
    </>
  );
}

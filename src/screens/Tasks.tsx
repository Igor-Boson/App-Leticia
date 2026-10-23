import { Icon, Section } from '../components/ui';
import { recurrenceLabel } from '../domain/labels';
import { useStore } from '../state/store';

export function Tasks({
  onNewTask,
  onEditTask,
  onOpenSettings,
}: {
  onNewTask: () => void;
  onEditTask: (taskId: string) => void;
  onOpenSettings: () => void;
}) {
  const { state } = useStore();
  const active = state.tasks.filter((t) => !t.archived);

  return (
    <>
      <button type="button" className="primary-button" onClick={onNewTask}>
        {Icon.plus()} Nova tarefa
      </button>

      {state.groups.map((g) => {
        const groupTasks = active.filter((t) => t.groupId === g.id);
        return (
          <Section
            key={g.id}
            title={g.name}
            aside={groupTasks.length === 1 ? '1 tarefa' : `${groupTasks.length} tarefas`}
          >
            <div className="card" style={{ padding: '2px 6px 2px 14px' }}>
              {groupTasks.length === 0 && <p className="empty">Nenhuma tarefa neste grupo.</p>}
              {groupTasks.map((t) => (
                <div key={t.id} className="list-row" style={{ minHeight: 56, padding: '4px 0' }}>
                  <span className="dot" style={{ background: g.color }} />
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span>{t.title}</span>
                    <span className="task-meta">
                      {Icon.repeat()}
                      {recurrenceLabel(t.recurrence)}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Editar ${t.title}`}
                    onClick={() => onEditTask(t.id)}
                  >
                    {Icon.edit()}
                  </button>
                </div>
              ))}
            </div>
          </Section>
        );
      })}

      <button type="button" className="secondary-button" onClick={onOpenSettings}>
        {Icon.settings()} Grupos, hábitos, metas e backup
      </button>
    </>
  );
}

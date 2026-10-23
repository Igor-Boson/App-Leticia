import type { ISODate } from '../domain/dates';
import { recurrenceLabel } from '../domain/labels';
import { carriedLabel } from '../domain/schedule';
import type { Occurrence, Task } from '../domain/types';
import { CheckMark, Icon } from './ui';

export function TaskRow({
  occurrence,
  task,
  today,
  onToggle,
  onPostpone,
}: {
  occurrence: Occurrence;
  task: Task;
  today: ISODate;
  onToggle: () => void;
  onPostpone?: () => void;
}) {
  const done = !!occurrence.doneOn;
  const badge = carriedLabel(occurrence, today);
  const canPostpone = !!onPostpone && !done && task.recurrence.kind !== 'daily' && occurrence.date !== null;
  return (
    <div className="task-row">
      <button
        type="button"
        className="task-check"
        aria-pressed={done}
        aria-label={done ? `Desmarcar ${task.title}` : `Marcar como feita: ${task.title}`}
        onClick={onToggle}
      >
        <CheckMark on={done} />
      </button>
      <div className="task-body">
        <span className={`task-title${done ? ' done' : ''}`}>{task.title}</span>
        <span className="task-meta">
          {recurrenceLabel(task.recurrence)}
          {badge && <span className="badge">{badge}</span>}
        </span>
      </div>
      {canPostpone && (
        <button type="button" className="link-button" aria-label={`Adiar ${task.title}`} onClick={onPostpone}>
          Adiar {Icon.arrowRight()}
        </button>
      )}
    </div>
  );
}

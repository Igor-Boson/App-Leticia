import type { AppState } from './types';

const KEY = 'minha-semana:v1';

export function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<AppState>;
  return (
    v.version === 1 &&
    Array.isArray(v.groups) &&
    Array.isArray(v.tasks) &&
    Array.isArray(v.occurrences) &&
    Array.isArray(v.habits) &&
    Array.isArray(v.studyTargets) &&
    typeof v.habitLog === 'object' &&
    typeof v.studyLog === 'object'
  );
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isAppState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Sem espaço ou armazenamento bloqueado: o app continua funcionando nesta sessão.
  }
}

/** Pede ao navegador para não apagar os dados quando faltar espaço. */
export function requestPersistentStorage(): void {
  navigator.storage?.persist?.().catch(() => undefined);
}

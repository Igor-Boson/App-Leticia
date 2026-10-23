import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { todayISO, type ISODate } from '../domain/dates';
import { ensureSchedule } from '../domain/schedule';
import { seedState } from '../domain/seed';
import { loadState, requestPersistentStorage, saveState } from '../domain/storage';
import type { AppState } from '../domain/types';

interface Store {
  state: AppState;
  today: ISODate;
  update: (fn: (state: AppState, today: ISODate) => AppState) => void;
  replace: (state: AppState) => void;
}

const StoreContext = createContext<Store | null>(null);

/** Data de hoje, atualizada quando o app volta para a tela ou vira o dia. */
function useToday(): ISODate {
  const [today, setToday] = useState(todayISO);
  useEffect(() => {
    const refresh = () => setToday(todayISO());
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);
  return today;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const today = useToday();
  const [state, setState] = useState<AppState>(() => ensureSchedule(loadState() ?? seedState(today), today));

  useEffect(() => {
    setState((s) => ensureSchedule(s, today));
  }, [today]);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(requestPersistentStorage, []);

  const update = useCallback(
    (fn: (s: AppState, today: ISODate) => AppState) => setState((s) => fn(s, today)),
    [today],
  );
  const replace = useCallback((next: AppState) => setState(ensureSchedule(next, today)), [today]);

  return <StoreContext.Provider value={{ state, today, update, replace }}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore precisa estar dentro de StoreProvider');
  return store;
}

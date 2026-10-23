import { useRef, useState } from 'react';
import { Icon, Section, Stepper } from '../components/ui';
import {
  canDeleteGroup,
  deleteGroup,
  deleteHabit,
  saveGroup,
  saveHabit,
  setStudyTarget,
} from '../domain/actions';
import { formatHours, WEEKDAY_LETTER, WEEKDAY_LONG, type Weekday } from '../domain/dates';
import { newId } from '../domain/schedule';
import { GROUP_COLORS } from '../domain/seed';
import { isAppState } from '../domain/storage';
import { useStore } from '../state/store';

export function Settings({ onClose }: { onClose: () => void }) {
  const { state, today, update, replace } = useStore();
  const fileInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  function exportBackup() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minha-semana-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importBackup(file: File) {
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isAppState(parsed)) throw new Error('formato');
      if (!window.confirm('Substituir todos os dados atuais pelos do backup?')) return;
      replace(parsed);
      setMessage('Backup restaurado.');
    } catch {
      setMessage('Não foi possível ler este arquivo. Escolha um backup exportado pelo app.');
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="app">
        <header style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button type="button" className="icon-button" style={{ marginLeft: -10 }} aria-label="Voltar" onClick={onClose}>
            {Icon.chevronLeft()}
          </button>
          <h1 id="settings-title" className="page-title" style={{ fontSize: 22 }}>
            Ajustes
          </h1>
        </header>

        <Section title="Grupos">
          <div className="card section" style={{ gap: 0 }}>
            {state.groups.map((g) => {
              const deletable = canDeleteGroup(state, g.id);
              return (
                <div key={g.id} className="list-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className="dot" style={{ background: g.color, width: 14, height: 14 }} />
                    <input
                      className="text-input"
                      style={{ minHeight: 44, padding: '8px 12px' }}
                      aria-label="Nome do grupo"
                      value={g.name}
                      onChange={(e) => update((s) => saveGroup(s, { ...g, name: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Excluir o grupo ${g.name}`}
                      disabled={!deletable}
                      title={deletable ? undefined : 'Mova ou exclua as tarefas deste grupo antes'}
                      onClick={() => update((s) => deleteGroup(s, g.id))}
                    >
                      {Icon.trash()}
                    </button>
                  </div>
                  <div className="chips" style={{ paddingLeft: 22, gap: 10 }}>
                    {GROUP_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className="color-swatch"
                        style={{ background: c }}
                        aria-label={`Cor ${c}`}
                        aria-pressed={g.color === c}
                        onClick={() => update((s) => saveGroup(s, { ...g, color: c }))}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
            <p className="muted small" style={{ margin: '8px 0' }}>
              Um grupo só pode ser excluído quando não tiver mais tarefas.
            </p>
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                update((s) =>
                  saveGroup(s, {
                    id: newId(),
                    name: 'Novo grupo',
                    color: GROUP_COLORS[s.groups.length % GROUP_COLORS.length],
                  }),
                )
              }
            >
              {Icon.plus()} Novo grupo
            </button>
          </div>
        </Section>

        <Section title="Hábitos">
          <div className="card section" style={{ gap: 0 }}>
            {state.habits.map((h) => (
              <div key={h.id} className="list-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    className="text-input"
                    style={{ minHeight: 44, padding: '8px 12px' }}
                    aria-label="Nome do hábito"
                    value={h.name}
                    onChange={(e) => update((s) => saveHabit(s, { ...h, name: e.target.value }))}
                  />
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Excluir o hábito ${h.name}`}
                    onClick={() => {
                      if (window.confirm(`Excluir o hábito "${h.name}"?`)) update((s) => deleteHabit(s, h.id));
                    }}
                  >
                    {Icon.trash()}
                  </button>
                </div>
                <div className="day-picker">
                  {WEEKDAY_LETTER.map((letter, i) => {
                    const d = i as Weekday;
                    const on = h.days.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        className="day-toggle"
                        aria-pressed={on}
                        aria-label={`${h.name}: ${WEEKDAY_LONG[d]}`}
                        onClick={() =>
                          update((s) =>
                            saveHabit(s, {
                              ...h,
                              days: on ? h.days.filter((x) => x !== d) : [...h.days, d].sort((a, b) => a - b),
                            }),
                          )
                        }
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="secondary-button"
              style={{ marginTop: 8 }}
              onClick={() =>
                update((s) => saveHabit(s, { id: newId(), name: 'Novo hábito', days: [0, 1, 2, 3, 4, 5, 6] }))
              }
            >
              {Icon.plus()} Novo hábito
            </button>
          </div>
        </Section>

        <Section title="Meta de estudo da pós">
          <div className="card section" style={{ gap: 0 }}>
            {state.studyTargets.map((hours, i) => (
              <div key={i} className="list-row" style={{ justifyContent: 'space-between' }}>
                <span style={{ textTransform: 'capitalize' }}>{WEEKDAY_LONG[i]}</span>
                <div style={{ width: 170 }}>
                  <Stepper
                    value={hours}
                    label={`meta de ${WEEKDAY_LONG[i]}`}
                    step={0.5}
                    max={12}
                    format={(h) => (h === 0 ? 'sem' : formatHours(h))}
                    onChange={(h) => update((s) => setStudyTarget(s, i, h))}
                  />
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Backup">
          <div className="card section">
            <p className="muted small" style={{ margin: 0 }}>
              Os dados ficam guardados só neste celular. Exporte um backup de vez em quando para não perder nada se
              trocar de aparelho ou limpar o navegador.
            </p>
            <div className="button-row">
              <button type="button" className="secondary-button" onClick={exportBackup}>
                Exportar
              </button>
              <button type="button" className="secondary-button" onClick={() => fileInput.current?.click()}>
                Importar
              </button>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="visually-hidden"
              aria-label="Arquivo de backup"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importBackup(file);
                e.target.value = '';
              }}
            />
            {message && (
              <p role="status" className="small" style={{ margin: 0 }}>
                {message}
              </p>
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

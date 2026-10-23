# Minha Semana

App de organização pessoal da Letícia: tarefas por grupo, tarefas recorrentes, hábitos, horas de estudo e porcentagem de tudo o que foi feito no dia, na semana e no mês.

O escopo e as decisões estão em [`docs/ESCOPO.md`](docs/ESCOPO.md).

## Como funciona

- **Hoje**: tarefas do dia por grupo, hábitos, horas de estudo da pós e a porcentagem do dia.
- **Semana**: porcentagem da semana e de cada dia, grade de hábitos, progresso por grupo e checklist do mês.
- **Tarefas**: cadastro e edição de tarefas e, em Ajustes, de grupos, hábitos, metas de estudo e backup.

Formas de repetir uma tarefa: uma vez (com prazo opcional), todo dia, em dias fixos da semana ("toda terça", "todo sábado e domingo"), X vezes por semana ou X vezes por mês.

Uma tarefa que não foi feita vai para o dia mais leve que resta na semana. Se a semana acabar, ela passa para a próxima. As tarefas diárias não mudam de dia, e as mensais que ficarem pendentes passam para o mês seguinte. A lógica fica em `src/domain/schedule.ts`.

Os dados ficam salvos no próprio celular (`localStorage`). Em Ajustes dá para exportar e importar um backup.

## Desenvolvimento

```bash
npm install
npm run dev        # servidor local
npm test           # testes da lógica
npm run build      # gera a versão final em dist/
```

## Publicação

A cada push na `main`, o workflow `.github/workflows/deploy.yml` roda os testes e publica o app no GitHub Pages. Para isso funcionar, é preciso ativar uma vez: no repositório, **Settings → Pages → Source: GitHub Actions**.

O app fica em `https://<usuário>.github.io/App-Leticia/`.

## Instalar no Android

1. Abra o endereço do app no Chrome.
2. Toque no menu (⋮) e em **Instalar app** ou **Adicionar à tela inicial**.
3. O app abre em tela cheia e funciona sem internet.

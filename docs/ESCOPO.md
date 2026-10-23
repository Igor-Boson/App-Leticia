# App da Letícia: Escopo

## Valor a entregar

> Abrir o app no celular e saber **o que fazer hoje**, sem se cobrar quando a semana foge do plano, e ver **em porcentagem** quanto já deu conta.

O planner de papel (no Samsung Notes) funcionava como visual, mas era estático: não se renovava, não se adaptava e não mostrava progresso. O app resolve justamente esses três pontos.

## Quem usa e onde

- Uso individual, só a Letícia
- Celular Android como uso principal

## Necessidades levantadas

| # | Necessidade | Como o app atende |
|---|---|---|
| 1 | Tarefas recorrentes por **quantidade**, sem dia fixo ("banheiro 1x/semana") | Recorrência por meta: X vezes por semana ou por mês |
| 2 | Tarefa não feita vai para um **dia mais leve** | Realocação automática para o dia com menos carga na semana |
| 3 | Grupos diferentes (casa, pós, trabalho…) | Grupos com nome e cor |
| 4 | Acompanhar **sono** e **exercício** | Hábitos de sim/não por dia |
| 5 | Acompanhar **horas de estudo** da pós | Registro de horas com meta por dia da semana (1h seg–qua, 2h qui–dom) |
| 6 | Ver o progresso | **Porcentagem** do dia, da semana e de cada grupo |
| 7 | Lembretes (horários ainda indefinidos) | Fase 2 |

**Fora de escopo** (ela não quer): água, humor do dia, refeições e tópicos de estudo.

## Modelo

- **Grupo**: nome e cor. Exemplos: Casa, Pós, Trabalho, Rotina.
- **Tarefa**: título, grupo e um destes tipos:
  - *avulsa*: com ou sem data
  - *diária*: rotina, como "alimentar a Chica"
  - *X vezes por semana*: o app distribui as ocorrências pelos dias
  - *X vezes por mês*: limpeza de geladeira, forno etc.
- **Ocorrência**: uma instância da tarefa num dia, que fica *pendente* ou *feita*.
- **Hábito**: sono e exercício, marcados como sim/não no dia, com meta semanal opcional (ex.: exercício 4x/semana).
- **Estudo**: horas registradas por dia, comparadas com a meta daquele dia da semana.

### Regra de realocação

Quando o dia acaba e uma ocorrência flexível (X vezes por semana/mês) ficou pendente, ela é movida para o dia restante do período **com menos ocorrências**. Tarefas avulsas com data e tarefas diárias **não** são movidas.

## Telas do MVP

1. **Hoje** (tela inicial): tarefas do dia agrupadas por grupo, hábitos do dia, horas de estudo e a % do dia.
2. **Semana**: grade de seg a dom no estilo da planilha, com a % da semana e a % de cada grupo.
3. **Tarefas**: criar e editar tarefas, grupos e recorrências.

## Decisões técnicas (proposta)

- **PWA** (React + TypeScript + Vite): ela instala pelo navegador, e as atualizações chegam só com o link, sem loja de apps.
- **Dados locais no celular** (IndexedDB), com exportar/importar backup. Como só ela usa, não precisa de servidor.
- **Lembretes (fase 2)**: notificações agendadas no Android são pouco confiáveis num PWA sem servidor. Quando ela definir os horários, a ideia é empacotar o app com **Capacitor** (vira um APK) e usar notificações locais.

## Fases

1. **MVP**: grupos, tarefas e recorrência, realocação, telas Hoje/Semana/Tarefas, hábitos, horas de estudo, porcentagens, backup.
2. **Lembretes**: APK via Capacitor, com notificações configuráveis.
3. **Talvez**: histórico mensal e gráficos de evolução.

## Pontos em aberto

- A % do dia conta **só tarefas** ou também hábitos e estudo?
- No fim da semana, uma tarefa flexível não feita **some** (a semana recomeça) ou **acumula** para a próxima?
- "Sono" quer dizer "dormir até 22h", "acordar às 6h" ou os dois?
- A semana começa na segunda?

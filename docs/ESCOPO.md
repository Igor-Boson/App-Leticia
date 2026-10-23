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
| 1b | Tarefas em **dias fixos** ("toda terça", "todo sábado e domingo") | Recorrência por dias da semana |
| 2 | Tarefa não feita vai para um **dia mais leve** | Realocação automática para o dia com menos carga na semana |
| 3 | Grupos diferentes (casa, pós, rotina…) | Grupos com nome e cor |
| 4 | Acompanhar **sono**, **exercício** e **trabalho** | Hábitos de sim/não por dia (o trabalho é só o check "Trabalhei hoje", de segunda a sexta) |
| 5 | Acompanhar **horas de estudo** da pós | Registro de horas com meta por dia da semana (1h seg–qua, 2h qui–dom) |
| 6 | Ver o progresso | **Porcentagem** do dia, da semana e de cada grupo |
| 7 | Lembretes (horários ainda indefinidos) | Fase 2 |

**Fora de escopo** (ela não quer): água, humor do dia, refeições e tópicos de estudo.

## Modelo

- **Grupo**: nome e cor. Exemplos: Rotina, Casa, Pós.
- **Tarefa**: título, grupo e um destes tipos:
  - *uma vez*: com ou sem prazo
  - *todo dia*: rotina, como "alimentar o Chico"
  - *dias da semana*: "toda terça", "todo sábado e domingo"
  - *X vezes por semana*: o app distribui as ocorrências nos dias mais leves
  - *X vezes por mês*: limpeza de geladeira, forno etc.
- **Ocorrência**: uma instância da tarefa num dia, que fica *pendente* ou *feita*.
- **Hábito**: dormir até 22h, acordar às 6h, exercício e "trabalhei hoje", marcados como sim/não. Cada hábito vale em dias da semana configuráveis.
- **Estudo**: horas registradas por dia, comparadas com a meta daquele dia da semana.

### Regra de realocação

- Quando o dia acaba e uma ocorrência (de qualquer tipo, exceto diária) ficou pendente, ela é movida para o dia restante da semana **com menos ocorrências**. Se a semana acabou, ela vai para a semana seguinte.
- Pelo botão "Adiar", a Letícia aplica a mesma regra na hora.
- Tarefas mensais não ficam presas a um dia: elas formam o checklist do mês.
- Tarefas diárias **não** são movidas. Se ela não fez, aquele dia fica com a porcentagem menor.

## Telas do MVP

1. **Hoje** (tela inicial): tarefas do dia agrupadas por grupo, hábitos do dia, horas de estudo e a % do dia.
2. **Semana**: grade de seg a dom no estilo da planilha, com a % da semana e a % de cada grupo.
3. **Tarefas**: criar e editar tarefas, grupos e recorrências.

## Decisões técnicas

- **PWA** (React + TypeScript + Vite), publicado no GitHub Pages: ela instala pelo navegador, e as atualizações chegam sozinhas, sem loja de apps.
- **Dados locais no celular** (`localStorage`), com exportar/importar backup.
- **Primeiro uso**: os dias anteriores à instalação não entram na porcentagem. Como só ela usa, não precisa de servidor.
- **Lembretes (fase 2)**: notificações agendadas no Android são pouco confiáveis num PWA sem servidor. Quando ela definir os horários, a ideia é empacotar o app com **Capacitor** (vira um APK) e usar notificações locais.

## Fases

1. **MVP**: grupos, tarefas e recorrência, realocação, telas Hoje/Semana/Tarefas, hábitos, horas de estudo, porcentagens, backup.
2. **Lembretes**: APK via Capacitor, com notificações configuráveis.
3. **Talvez**: histórico mensal e gráficos de evolução.

## Decisões confirmadas com a Letícia

- **Porcentagem de tudo**: a % do dia e da semana inclui tarefas, hábitos e estudo. As horas contam proporcionalmente (1h de uma meta de 2h vale 50% daquele item).
- **Nada some**: uma tarefa flexível que não foi feita passa para a semana seguinte, e uma tarefa mensal passa para o mês seguinte. Na tela Hoje, ela aparece com a marcação "da semana passada".
- **Sono são dois hábitos**: "dormir até 22h" e "acordar às 6h".
- **A semana começa na segunda.**

## Identidade visual

Neutra, em tons pastel e delicados: fundo azul bem claro, cartões brancos, destaques em azul-lavanda, títulos em lilás e grupos em menta, pêssego, azul e lilás. A fonte é Nunito.

## Feedback do protótipo

O protótipo foi validado, com estes ajustes: o gato é **o Chico**; o tema deve ser neutro, sem referências a Harry Potter; as tarefas precisam repetir em dias fixos da semana; e o trabalho é apenas um check diário.

# Plano — Versão "28 Dias: Emagrecimento com Calistenia"

Documento de plano (ainda **não** é código). Objetivo: virar o `treino-em-casa.html` de um
gerador full-body infinito para um **programa fechado de 28 dias**, focado em **queima de gordura**
com **calistenia** (peso do corpo), estilo desafio "resultados a partir de 28 dias".

Princípio-guia: reaproveitar o padrão que já existe (estado → render por string → delegação de
eventos → storage). Nada de framework, continua a ser **um só ficheiro**.

---

## 1. O que muda no conceito

| Hoje | Versão 28 dias |
|---|---|
| Rotação infinita de dias (Full Body A/B/C…) | Calendário fixo de **28 dias** (4 semanas) com dias de treino e de descanso |
| Séries × repetições (estilo ginásio) | **Circuito por tempo** (ex: 40s trabalho / 20s descanso) — mais densidade, mais queima |
| Progressão só pelo nível escolhido | **Progressão semana a semana** (as 4 semanas sobem de intensidade) |
| Foco neutro | Foco claro em **emagrecimento + calistenia** |
| Sem noção de "onde vou no programa" | Dashboard mostra **"Dia X de 28"** e % concluída |

O que **se mantém** (já está bom): questionário de personalização, ajuste por nível, filtro por
limitações/lesões, controlo de peso e gráfico de evolução, design escuro premium, storage híbrido.

---

## 2. Estrutura do programa de 28 dias

Quatro semanas com intensidade crescente (progressão real, não só "mais do mesmo"):

- **Semana 1 — Adaptação:** 40s trabalho / 20s descanso · 2 voltas · foco em técnica
- **Semana 2 — Intensificação:** 45s / 15s · 3 voltas
- **Semana 3 — Pico:** 50s / 10s · 3–4 voltas · finisher de cardio mais duro
- **Semana 4 — Consolidação:** volta ao 45s/15s mas com progressões mais difíceis dos exercícios; último dia = **balanço** (comparar peso inicial vs atual)

Cada semana tem, por omissão, **5 dias ativos + 2 de descanso** (ajustável a 3–4 se o utilizador
escolher menos dias no questionário). Dia de treino = estrutura de queima:

1. Aquecimento (~2–3 min)
2. **Bloco metabólico principal** — 4–5 exercícios de calistenia em circuito por tempo, N voltas
3. **Finisher de cardio** — bloco curto e intenso (tipo Tabata/AMRAP)
4. Core
5. Alongamento / respiração

---

## 3. Exercícios (calistenia + queima)

**Vídeos:** voltamos ao **YouTube incorporado** (`youtube-nocookie.com/embed/{id}`), usando o
`youtubeId` que cada exercício já tem nos dados. Removemos o leitor de ficheiros `.mp4` local, a pasta
`videos/` e o `LEIA-ME.txt` deixam de ser necessários. Sem hospedar ficheiros de ninguém = sem
problema de direitos de autor.

**Exercícios já existentes que servem para queima:** agachamento, flexão, avanço, ponte de glúteos,
prancha, escalador (mountain climber), abdominal bicicleta, polichinelo, bird dog.

**Novos a acrescentar (calistenia metabólica, sem equipamento):**

- Burpee
- Agachamento com salto (squat jump)
- Joelhos altos (high knees)
- Patinador (skater jumps)
- Afundo com salto (jumping lunge)
- Prancha com toque no ombro
- Escalador cruzado

Cada um entra no mesmo formato do `EXERCISES` (músculos, execução correta/incorreta, erros,
respiração, alternativa fácil/difícil, `youtubeId` real e verificado).

**Equipamento:** a calistenia é o núcleo. Os exercícios de equipamento (mochila, garrafas, elástico,
etc.) passam a **opcionais/secundários** — continuam disponíveis, mas o programa base de 28 dias é só
peso do corpo. Cadeira/parede/degrau mantêm-se porque são "peso do corpo assistido".

---

## 4. Mudanças no gerador (`gerarPlano`)

- Passa a devolver **28 dias** (com marca de semana e tipo: treino / descanso), em vez de 3–4 dias em rotação.
- Novo modo de volume **`circuito`**: em vez de séries×reps fixas, lê o tempo de trabalho/descanso e o
  nº de voltas **da semana** em que o dia está. Provável nova tabela `PROGRESSAO_SEMANA`.
- `getVolume()` ganha o caso `circuito` (devolve "40s trabalho / 20s descanso", voltas).
- Mantém-se a filtragem por limitações e a escolha de exercícios por nível.

---

## 5. Ecrãs

- **Dashboard:** passa a mostrar **"Dia X de 28"**, barra de progresso do programa, sequência de dias
  seguidos (streak), e o treino de hoje. Mantém o cartão de peso.
- **Novo ecrã "Programa" (calendário 28 dias):** grelha 4×7, cada dia marcado como concluído / hoje /
  descanso / por fazer. Substitui o atual "plano da semana".
- **Ecrã de treino:** passa a mostrar o formato de **circuito por tempo** (trabalho/descanso, voltas)
  em vez de séries×reps. Modal do exercício volta a ter vídeo do YouTube.
- **Ecrã de conclusão / balanço final:** ao terminar o dia 28, mostra resumo (treinos feitos, evolução
  do peso inicial → atual).

---

## 6. Onboarding

- **Objetivo:** mantém-se, mas o programa é sempre orientado a emagrecimento (as opções afinam a
  ênfase: mais cardio vs mais força-resistência).
- **Peso atual / peso-alvo:** mantém-se (essencial para um desafio de emagrecimento).
- **Nível:** mantém-se (afina reps/tempo e as progressões dos exercícios).
- **Dias/semana:** mantém-se, mas agora define quantos dos 7 dias de cada semana são de treino.
- **Tempo por treino:** mantém-se (afeta nº de voltas).
- **Limitações:** mantém-se (aviso de segurança).

---

## 7. Dados / armazenamento

- Nova chave `programa` (array de 28 dias) — ou reutilizar `plano` com a nova forma.
- `progresso` ganha `dataInicio` e a lista de dias concluídos (por índice 0–27).
- `pesoHistorico` mantém-se tal como está.
- Continua tudo em `window.storage` / `localStorage` (sem alterações no wrapper).

---

## 8. Fora de âmbito por agora (para não sobre-complicar)

Fica para uma fase seguinte, depois do programa de 28 dias estar a funcionar:

- **Dicas de alimentação para emagrecimento adaptadas a Angola** (funge, feijão, peixe, batata-doce…)
  — muito relevante para o objetivo, mas é um módulo próprio.
- Gamificação (XP, medalhas), notificações, fotos de evolução, calendário com datas reais,
  segundo/terceiro ciclo de 28 dias.
- Separar "editar perfil" de "apagar tudo" (hoje o *reset* apaga o histórico de peso — a corrigir).

---

## 9. Ordem de implementação sugerida

1. Reverter os vídeos para YouTube incorporado (rápido, isola já esse tema)
2. Acrescentar os exercícios novos de calistenia (com `youtubeId` reais)
3. Reescrever `gerarPlano` para 28 dias + progressão semanal + modo circuito
4. Atualizar ecrãs: dashboard "Dia X de 28", calendário 28 dias, treino em circuito
5. Ecrã de balanço final (dia 28)
6. Testar o fluxo todo (onboarding → dia 1 → concluir vários dias → peso → dia 28)

---

**Próximo passo:** dá o teu OK a este plano (ou diz o que queres mudar) e começo pela ordem acima.

# Domínio — PortalCopa26

A linguagem ubíqua do PortalCopa26 e o resumo das regras de negócio invioláveis.
Escrito a partir do protótipo (`src/js/dados/*.js`, `src/js/nucleo/classificacao.js`)
— em caso de dúvida, o protótipo é a especificação executável, não este resumo.

## Glossário

| Termo | Significado |
|---|---|
| `Selecao` | Uma das 48 seleções participantes. Nunca `Team`. |
| `Jogo` | Uma partida do torneio (das 104). Nunca `Match`. |
| `Classificacao` | A tabela calculada de um grupo, com posição de cada seleção. Nunca `Standing`. |
| `Grupo` | Um dos 12 grupos (A–L) da fase inicial, com 4 seleções cada. |
| `Pote` | Um dos 4 potes do sorteio; o Pote 1 reúne os cabeças de chave. |
| `Cabeça de chave` | Seleção do Pote 1 que lidera um grupo. |
| `Fase` | Etapa do torneio: `grupos`, `segunda-fase`, `oitavas`, `quartas`, `semifinal`, `terceiro-lugar`, `final`. |
| `Mata-mata` | Conjunto das fases eliminatórias, a partir da segunda fase. |
| `Chaveamento` | A estrutura de referências entre jogos do mata-mata (vencedor/perdedor de um jogo alimenta o próximo). |
| `RankingFifa` | A posição e pontuação de uma seleção no ranking FIFA usado como último critério de desempate. |
| `Estadio` | Uma das 16 cidades-sede/estádios do torneio. |
| `Jogador` | Um atleta convocado, pertencente a uma `Selecao`. |
| `SG` | Saldo de gols (GP − GC). |
| `GP` / `GC` | Gols pró / gols contra. |

## Entidades

### `Selecao`
Campos observados em `src/js/dados/selecoes.js`:

| Campo | Tipo | Observação |
|---|---|---|
| `cod` | texto, 3 letras | código FIFA — chave natural, ex. `"BRA"` |
| `nome` | texto | nome canônico em português |
| `grupo` | texto, 1 letra | `A`–`L` |
| `pote` | inteiro, 1–4 | |
| `cabecaDeChave` | booleano | true só para o Pote 1 |
| `confederacao` | texto | inferida por geografia — as fontes não a informam |
| `tecnico` | texto | |
| `rankingPosicao` | inteiro ou nulo | nulo para as 7 seleções fora do ranking disponível |
| `rankingPontos` | decimal ou nulo | pontuação FIFA; exibida na página de Ranking (feature 005), não usada no desempate |
| `rankingOrdem` | inteiro | usado no desempate — sempre preenchido, mesmo sem `rankingPosicao` |
| `bandeira` | URL | API pública da FIFA, com fallback para a sigla |

### `Jogo`
Campos observados em `src/js/dados/jogos.js`:

| Campo | Tipo | Observação |
|---|---|---|
| `id` | texto | ex. `"G01"` (grupos), prefixos variam por fase |
| `numero` | inteiro | numeração sequencial exibida na UI |
| `fase` | texto | uma das 7 fases |
| `grupo` | texto ou nulo | nulo fora da fase de grupos |
| `mandante` / `visitante` | código de `Selecao` ou nulo | nulo quando o lado depende do chaveamento |
| `mandanteRef` / `visitanteRef` | referência ou nulo | `{ jogo, tipo: 'vencedor'\|'perdedor' }` — como o mata-mata resolve o lado quando ele não está definido ainda |
| `data` / `hora` | texto | horário de Brasília (UTC−3); não "corrigir" o fuso |
| `diaTabela` | texto (data) | o dia em que a fonte agrupa o jogo na tabela — pode diferir de `data` em jogos de madrugada |
| `estadio` | texto | id do `Estadio` |
| `placarMandante` / `placarVisitante` | inteiro ou nulo | |
| `placarPenaltisMandante` / `placarPenaltisVisitante` | inteiro ou nulo | só preenchido no mata-mata, quando o tempo normal termina empatado (RN-03); não existe no seed estático (nenhum jogo futuro tem pênaltis definidos), mas o `Jogo` precisa do campo para registrar o resultado real quando a partida acontecer |
| `status` | texto | `Agendado` / `Em Andamento` / `Encerrado` no protótipo |

### `RankingFifa`
Campos observados em `src/js/dados/ranking.js`: `posicao`, `nome`, `cod`, `pontos`,
`naCopa` (indica se a seleção está entre as 48 do torneio).

## Regras de negócio invioláveis

Traduzidas de `src/js/nucleo/classificacao.js` — não reinventar a lógica, só mudar a
linguagem.

**RN-01 — Classificação dos grupos.** Desempate nesta ordem exata: pontos → saldo de
gols → gols marcados → confronto direto → saldo nos confrontos diretos → fair play →
ranking FIFA. O fair play **não é aplicado** (sem dados de cartões nas fontes); o
desempate salta direto para o ranking FIFA. Vitória vale 3 pontos, empate 1, derrota
0.

**RN-02 — Avanço.** 1º e 2º de cada grupo (24 seleções) avançam automaticamente. Os
8 melhores entre os 12 terceiros colocados avançam também, ordenados por pontos →
saldo de gols → gols marcados → ranking FIFA. Total: 32 seleções nas oitavas.

**RN-03 — Mata-mata.** Empate no tempo normal é decidido nos pênaltis; o vencedor
avança automaticamente pelo chaveamento, por referência (`mandanteRef`/`visitanteRef`
apontando para o vencedor ou perdedor de outro jogo). Não existe gol de ouro nem gol
de prata.

## Invariantes dos dados

Qualquer alteração que quebre um destes números é um bug (ver `CLAUDE.md`):

- 48 seleções em 12 grupos de 4, distribuídas em 4 potes
- 104 jogos: 72 de grupos + 16 de segunda fase + 8 oitavas + 4 quartas + 2 semis + 3º
  lugar + final
- Cada seleção joga exatamente 3 vezes na fase de grupos, sem confronto repetido
- 16 cidades-sede (11 EUA, 3 México, 2 Canadá) · 1.238 jogadores · 98 posições de
  ranking FIFA

## Onde ler mais

- `architecture.md` — como essas entidades e regras se encaixam nas camadas.
- `../README.md` — as 13 divergências das fontes já resolvidas (nomes canônicos,
  confederação inferida, fair play não aplicado, etc.).
- `../src/js/nucleo/classificacao.js` — o motor de classificação, fonte da tradução.

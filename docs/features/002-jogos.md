# Feature: Tabela de jogos

## Objetivo

Implementar a página de Tabela de Jogos do PortalCopa26 (RF-02): as 104 partidas do
torneio, agrupadas por dia, com filtros combináveis.

## Contexto

O sistema já possui (a partir da feature 001):

- `Selecao`
- `Jogo`

Esta feature é a primeira fatia vertical real da solução: precisa do Seed dos dados
de `Selecao`, `Jogo` e `Estadio` a partir de `src/js/dados/*.js` (o Seed ainda não
existe — ver `../roadmap.md`) e não depende do motor de classificação (esse entra na
feature 003). É a referência de comportamento: `src/jogos.html` +
`src/js/paginas/jogos.js` + `src/js/nucleo/componentes.js` (`agruparPorDia`,
`cartaoJogo`), já validados no protótipo.

## Requisitos funcionais

A página deverá:

1. Listar todos os 104 jogos, ordenados cronologicamente e agrupados por dia
   (`diaTabela`), com um cabeçalho de seção por dia mostrando a data por extenso e a
   quantidade de jogos daquele dia.
2. Exibir um cartão por jogo com: número do jogo, badge de fase (grupo, ou nome da
   fase + ordem nas fases eliminatórias), badge de status (`Agendado` / `Em
   Andamento` / `Encerrado`), mandante e visitante (bandeira + nome, ou o rótulo do
   chaveamento quando o lado ainda não está definido — ex. "Vencedor — Oitavas 3"),
   placar quando existir ou "VS" quando não, estádio e cidade.
3. Filtrar por fase (chips: Todas, Grupos, 2ª Fase, Oitavas, Quartas, Semis, 3º
   Lugar, Final — só aparecem fases que têm jogo), grupo (A–L), seleção (busca por
   nome), cidade-sede e data — todos combináveis entre si.
4. Permitir chegar à página já filtrada via querystring (`?selecao=BRA`,
   `?grupo=C`, `?fase=final`), replicando o comportamento do protótipo.
5. Mostrar um resumo textual: "Exibindo todos os 104 jogos" quando nenhum filtro
   está ativo, ou "N jogos encontrados em M dias" quando algum filtro reduz a lista.
6. Paginar a listagem incrementalmente por dia (6 dias por vez, botão "Mostrar mais
   N de M dias"), reiniciando a paginação sempre que um filtro muda.
7. Mostrar um estado vazio explícito quando nenhum jogo bate com os filtros
   selecionados.
8. Oferecer um botão para limpar todos os filtros de uma vez.

## Requisitos técnicos

Utilizar:

- Blazor (Interactive Server, conforme `../architecture.md`)
- Entity Framework Core + SQLite
- Os Services/Application existentes; nenhuma lógica de consulta direta no
  componente Blazor

## Regras

- Não criar uma nova API.
- Não criar um novo projeto — a página entra em `PortalCopa26.Web`.
- Não alterar a estrutura do `Domain` definida na feature 001 sem necessidade.
- Não colocar consultas EF Core diretamente no componente Blazor — passar por um
  serviço de `Application`.
- Horários são de Brasília (UTC−3); não "corrigir" o fuso (ver `../domain.md`).

## Critérios de aceite

- [ ] Página acessível pelo menu principal.
- [ ] Todos os 104 jogos exibidos corretamente, agrupados por dia.
- [ ] Filtros funcionam combinados (fase + grupo + seleção + cidade + data ao mesmo
      tempo).
- [ ] Deep-link por querystring funciona para seleção, grupo e fase.
- [ ] Paginação incremental por dia funciona e reinicia ao trocar um filtro.
- [ ] Estado vazio aparece quando os filtros não retornam nenhum jogo.
- [ ] `dotnet build` executa sem erros.

## Fora do escopo

- Edição de placar (painel administrativo — RF-07, fora do escopo da v1 conforme
  `CLAUDE.md`).
- Notificações de jogo ao vivo.
- Integração com API externa de resultados.
- Link "Ver grupos" a partir do cartão de jogo (entra junto com a feature 003, que
  ainda não existe nesta fase).

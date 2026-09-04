# Feature: Setup inicial da solução

## Objetivo

Criar o esqueleto da solução .NET 10 do PortalCopa26 em arquitetura DDD, com o motor
de classificação de grupos e de mata-mata traduzido do protótipo validado, para que
as próximas features (002 em diante) tenham onde pousar.

## Contexto

A solução .NET ainda não existe — `PRD/src/` está vazio. A única implementação do
domínio hoje é o protótipo em `src/js/nucleo/classificacao.js`, validado por 16
testes (`tools/testar.mjs`, rodáveis via `npm run teste`). Ver `../architecture.md` e
`../domain.md` para o detalhamento da arquitetura e da linguagem ubíqua que esta
feature estabelece.

Esta feature está detalhada como change formal em
`openspec/changes/bootstrap-solucao-dotnet/` (proposal, specs das capabilities
`classificacao-grupos` e `mata-mata`, design e tasks) — este documento é o resumo
executivo dela no formato de feature-doc do projeto.

## Requisitos funcionais

A solução deverá:

1. Compilar (`dotnet build`) e rodar ponta a ponta (`dotnet run --project
   PortalCopa26.Web`) com uma página placeholder no Blazor.
2. Calcular a tabela de classificação de um grupo (pontos, V/E/D, GP/GC, saldo)
   aplicando a ordem de desempate da RN-01, incluindo confronto direto e ranking
   FIFA como critérios finais (fair play pulado, sem dados de cartões).
3. Selecionar os 8 melhores terceiros colocados entre os 12 grupos (RN-02).
4. Resolver um confronto de mata-mata — vitória no tempo normal ou decisão nos
   pênaltis em caso de empate (RN-03, sem gol de ouro) — e propagar o vencedor
   automaticamente pelo chaveamento.

## Requisitos técnicos

Utilizar:

- .NET 10, arquitetura DDD em 4 camadas + projeto de testes (ver `../architecture.md`)
- Blazor Web App com **Interactive Server**
- Entity Framework Core + SQLite (só a referência do pacote; sem Seed real ainda)
- xUnit + FluentAssertions em `PortalCopa26.Domain.Tests`

## Regras

- Traduzir `src/js/nucleo/classificacao.js` — não reinventar a lógica de negócio.
- `Domain` não recebe nenhum pacote NuGet.
- Guard clauses de invariante vivem dentro do agregado, nunca em quem o chama.
- Não popular o banco com o dataset real (48 seleções, 104 jogos) — isso é Seed,
  fica para a feature de dados (ver `../roadmap.md`).
- Não implementar nenhuma tela do PRD nesta feature.

## Critérios de aceite

- [ ] `dotnet build` executa sem erros na solução inteira.
- [ ] `dotnet run --project PortalCopa26.Web` sobe a página placeholder sem erro.
- [ ] Os 16 cenários de `tools/testar.mjs` têm equivalente em
      `PortalCopa26.Domain.Tests`, todos verdes (`dotnet test`).
- [ ] `npm run teste` continua passando (protótipo intocado).
- [ ] `docs/architecture.md`, `docs/domain.md` e `docs/roadmap.md` existem e
      descrevem a solução criada.

## Fora do escopo

- Seed real a partir de `src/js/dados/*.js`.
- Qualquer tela do PRD (Jogos, Grupos, Elencos, Ranking, Home, Bolão).
- Autenticação, login ou área administrativa.
- Schema definitivo do EF Core/SQLite.

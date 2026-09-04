## Context

`PRD/src/` está vazio hoje — não há `.sln` nem projetos .NET. A única implementação
existente do domínio é o protótipo em `src/js/nucleo/classificacao.js`, validado por
16 testes em `tools/testar.mjs` (rodáveis via `npm run teste`). `CLAUDE.md` já fixa a
arquitetura em camadas (`Domain → Application → Infrastructure/Web`) e o idioma
(PT-BR em código e UI). Ver `proposal.md - Why` para a motivação completa.

## Goals / Non-Goals

**Goals:**
- Solução .NET 10 que compila (`dotnet build`) e roda (`dotnet run --project
  PortalCopa26.Web`) de ponta a ponta, com a estrutura de projetos definitiva.
- Motor de classificação (RN-01, RN-02, RN-03) correto e testado dentro do `Domain`,
  reconhecível como tradução de `classificacao.js` por quem lê os dois lados.
- Estrutura de `docs/` que sirva de referência estável para as próximas changes
  (features RF-02 a RF-06), reduzindo o contexto que cada prompt precisa carregar.

**Non-Goals:**
- Não popula o banco SQLite com o dataset real (48 seleções, 104 jogos) — isso é o
  Seed do EF Core a partir de `src/js/dados/*.js`, tratado em change futura.
- Não implementa nenhuma tela do PRD (Tabela, Grupos, Elencos, Escalação, Bolão).
- Não decide o schema definitivo do EF Core/SQLite — `Infrastructure` nesta change
  contém só o necessário para a solução compilar com as referências corretas.

## Decisions

### Estrutura de `docs/`
Segue o modelo do guia em `docs/features/minha-feature implememtacao.md` (que já
citava .NET/Blazor/EF Core como stack de referência, coerente com o `CLAUDE.md`
restaurado nesta sessão):
- `docs/architecture.md` — a arquitetura em camadas e a regra de dependência, com
  exemplos concretos de onde cada tipo de decisão vai (espelha a tabela do
  `CLAUDE.md`, mas com mais profundidade técnica).
- `docs/domain.md` — a linguagem ubíqua (Selecao, Jogo, Grupo, Classificacao,
  Chaveamento) e um resumo executável das RN-01/02/03, para servir de contexto rápido
  às próximas features sem reabrir `classificacao.js`.
- `docs/roadmap.md` — a ordem planejada das features (001-initial-setup em diante),
  para as próximas changes saberem o que vem antes/depois.
- `docs/features/001-initial-setup.md` — a spec desta própria feature, no formato de
  feature-doc que o guia recomenda (Objetivo, Contexto, Requisitos, Critérios de
  aceite, Fora do escopo), para servir de exemplo às próximas.

### Modo de renderização Blazor: Interactive Server
Decisão do usuário (ver proposal.md - Impact). `PortalCopa26.Web` é criado com
`dotnet new blazor --interactivity Server`. Alternativas descartadas:
- **WebAssembly**: exigiria expor uma API HTTP porque o navegador não acessa o
  arquivo SQLite local — contraria a restrição de "projeto único, sem servidor
  externo" do `CLAUDE.md`/PRD.
- **Auto**: soma a complexidade de build/publish de dois modelos de hospedagem sem
  necessidade de uso offline no produto.

### Projetos e regra de dependência
```
PortalCopa26.sln
├── src/PortalCopa26.Domain              (net10.0, classlib, zero pacotes externos)
├── src/PortalCopa26.Application         (net10.0, classlib) → refs Domain
├── src/PortalCopa26.Infrastructure      (net10.0, classlib) → refs Application
│                                          pacotes: Microsoft.EntityFrameworkCore.Sqlite
├── src/PortalCopa26.Web                 (net10.0, blazor)   → refs Application, Infrastructure
└── tests/PortalCopa26.Domain.Tests      (net10.0, xunit)    → refs Domain
                                           pacotes: xunit, FluentAssertions
```
`Domain` não recebe nenhum pacote NuGet — se um cenário parecer exigir um, é sinal de
modelagem errada (regra do `CLAUDE.md`). `Infrastructure` referencia `Application`
(não `Web`), então o Seed futuro fica isolado de qualquer preocupação de UI.

### Tradução de `classificacao.js` para o `Domain`
Mapeamento direto função → responsabilidade, mantendo os mesmos nomes de conceito em
português:
- `linhaVazia`/`aplicar`/`compararBase`/`ordenarGrupo`/`calcularGrupo` →
  agregado/serviço de domínio `Classificacao`, com o método que recebe os jogos e
  resultados de um grupo e devolve as linhas ordenadas pela RN-01.
- `miniTabela` → função interna privada do agregado (mini-tabela de confronto direto
  entre times empatados), não exposta fora do `Domain`.
- `terceirosColocados`/`classificados`/`zona` → método de domínio que recebe as 12
  tabelas de grupo já calculadas e devolve quem avança (RN-02), incluindo a
  classificação dos 8 melhores terceiros.
- `resolverMataMata`/`caminho` → agregado/serviço `Chaveamento` (capability
  `mata-mata`): resolve um confronto a partir do placar e, quando empatado, exige
  pênaltis (RN-03); propaga o vencedor para o confronto seguinte por referência,
  como o protótipo já faz com `mandanteRef`/`visitanteRef`.
- Guard clauses de invariante (ex.: "placar não pode ser negativo", "pênaltis só se
  houver empate no tempo normal") entram nos construtores/métodos do agregado, nunca
  em quem chama — conforme convenção do `CLAUDE.md`.

### Entidades mínimas do `Domain`
Campos derivados diretamente do shape observado em `src/js/dados/selecoes.js` e
`jogos.js` (ver `docs/domain.md` para a versão documentada):
- `Selecao`: código FIFA (3 letras), nome, grupo, pote, é cabeça de chave, ranking
  FIFA (posição pode ser nula para as 7 seleções fora do ranking disponível).
- `Jogo`: fase, grupo (nulo fora da fase de grupos), seleção mandante/visitante (ou
  referência a vencedor/perdedor de outro jogo, nas fases eliminatórias), placar,
  pênaltis, status.
- Não modela `Jogador`, `Estadio`, `Bolao`, `Escalacao` nesta change — pertencem a
  features futuras (RF-04 a RF-07) e não são necessários para RN-01/02/03.

### Testes de domínio como gabarito
`PortalCopa26.Domain.Tests` cobre os mesmos 16 cenários de `tools/testar.mjs`, com
`[Fact(DisplayName = "...")]` em português descrevendo a regra (ex.: "Desempata por
saldo de gols quando os pontos são iguais"). Usa fixtures mínimas (poucos times,
poucos jogos) em vez do dataset completo — o dataset real só entra com o Seed, fora
do escopo desta change.

## Risks / Trade-offs

- **Tradução divergir sutilmente do protótipo** (ex.: ordem de critérios trocada) →
  Mitigação: cada `[Fact]` do `Domain.Tests` linka o cenário equivalente de
  `tools/testar.mjs` no `DisplayName` ou comentário, e a change só é considerada
  pronta com os 16 cenários replicados e verdes.
- **Interactive Server exige conexão ativa (SignalR) com o servidor** → Aceitável:
  app de uso local/pessoal, sem requisito de offline no PRD; documentado em
  `docs/architecture.md` para não ser revisitado sem necessidade real.
- **`Infrastructure` sem Seed real pode dar falsa sensação de "pronto"** →
  Mitigação: `docs/roadmap.md` deixa explícito que o Seed é a próxima feature, e o
  critério de aceite desta change não inclui dados reais carregados.

## Migration Plan

Não aplicável — não há solução .NET nem dados anteriores a migrar. A criação da
solução e dos projetos é o próprio conteúdo desta change (detalhado em `tasks.md`).

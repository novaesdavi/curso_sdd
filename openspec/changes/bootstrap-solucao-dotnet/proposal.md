## Why

A solução .NET do PortalCopa26 ainda não existe — só o protótipo HTML/CSS/JS validado
em `src/`. Não há também uma estrutura de documentação (`docs/`) que registre a
arquitetura, o domínio e o roteiro de features, o que obriga a repetir contexto extenso
a cada prompt. Antes de construir qualquer página (RF-02 a RF-06 do PRD), o projeto
precisa de um alicerce: a solução .NET 10 em camadas DDD, com o motor de classificação
— a regra de negócio mais crítica do produto — traduzido fielmente do protótipo, e uma
estrutura de `docs/` que dê aos próximos prompts uma spec pequena para apontar, em vez
de reexplicar tudo.

## What Changes

- Cria `docs/architecture.md`, `docs/domain.md` e `docs/roadmap.md` documentando a
  arquitetura em camadas, a linguagem ubíqua do domínio (Selecao, Jogo, Classificacao,
  Grupo, Chaveamento) e a ordem planejada das próximas features.
- Cria `docs/features/001-initial-setup.md` descrevendo esta primeira feature (o
  esqueleto da solução), seguindo o formato de spec de feature adotado pelo projeto.
- Cria a solução .NET 10 com os projetos `PortalCopa26.Domain`,
  `PortalCopa26.Application`, `PortalCopa26.Infrastructure`, `PortalCopa26.Web`
  (Blazor Web App, **Interactive Server**) e `PortalCopa26.Domain.Tests`, respeitando a
  regra de dependência `Web/Infrastructure → Application → Domain`.
- Implementa em `PortalCopa26.Domain` as entidades `Selecao`, `Jogo` e o motor de
  classificação (`Classificacao`), traduzindo `src/js/nucleo/classificacao.js` —
  não reescrevendo a lógica.
- Implementa RN-01 (critérios de desempate), RN-02 (avanço: 1º/2º de cada grupo + 8
  melhores terceiros) e RN-03 (mata-mata decidido nos pênaltis, sem gol de ouro) como
  invariantes e cálculos dentro do agregado — nunca confiando em quem o chama.
- Adiciona `PortalCopa26.Domain.Tests` (xUnit + FluentAssertions) cobrindo os mesmos
  cenários dos 16 testes de `tools/testar.mjs`, o gabarito do domínio.
- `PortalCopa26.Web` sobe uma página mínima (placeholder) apenas para confirmar que a
  solução builda e roda ponta a ponta; nenhuma tela do PRD (RF-01 a RF-07) é
  implementada nesta change.
- Não cria `PortalCopa26.Infrastructure` com EF Core/SQLite funcional ainda além do
  necessário para a solução compilar e referenciar corretamente — Seed e persistência
  real ficam para uma change futura (ver `docs/roadmap.md`).

## Capabilities

### New Capabilities

- `classificacao-grupos`: cálculo da tabela de um grupo (pontos, saldo, gols),
  aplicação da ordem de desempate da RN-01 (pontos → saldo → gols marcados →
  confronto direto → saldo no confronto direto → ranking FIFA, pulando fair play) e
  seleção dos 8 melhores terceiros colocados (RN-02).
- `mata-mata`: resolução de um confronto eliminatório — vitória no tempo normal ou
  decisão nos pênaltis em caso de empate (RN-03), sem gol de ouro, com avanço
  automático do vencedor pelo chaveamento.

### Modified Capabilities

_Nenhuma — não há specs existentes no projeto ainda._

## Impact

- **Novo código:** solução .NET completa (5 projetos) em `PRD/src/`; nenhum código
  existente é alterado.
- **Protótipo (`src/`):** somente leitura, usado como referência de tradução — não é
  modificado.
- **Documentação:** novos arquivos em `docs/` na raiz do repositório.
- **Sem impacto em dados:** o Seed real a partir de `src/js/dados/*.js` fica fora do
  escopo desta change; os testes de domínio usam fixtures mínimas equivalentes às de
  `tools/testar.mjs`, não o dataset completo de 48 seleções/104 jogos.
- **Decisão registrada:** modo de renderização Blazor = Interactive Server (evita
  expor uma API HTTP só para o WebAssembly acessar o SQLite, mantendo o projeto único
  sem servidor externo).

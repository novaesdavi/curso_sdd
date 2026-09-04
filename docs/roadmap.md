# Roadmap — PortalCopa26

Ordem planejada das features da solução .NET, derivada das páginas já validadas no
protótipo (`src/*.html`) e da cobertura de PRD registrada em `../README.md`. Cada
feature vira uma spec em `features/NNN-nome.md` quando chega a vez de detalhá-la, e
uma change própria em `openspec/changes/` quando é implementada.

| # | Feature | PRD | Página de referência no protótipo | Status |
|---|---|---|---|---|
| 001 | Setup inicial da solução | — | — (esqueleto .NET + motor de classificação) | Em andamento — documentação concluída (`openspec/changes/bootstrap-solucao-dotnet`, seção 1 do `tasks.md`); esqueleto .NET e motores de domínio ainda pendentes (seções 2–6) |
| 002 | Tabela de jogos | RF-02 | `jogos.html` | Detalhada (`features/002-jogos.md`) |
| 003 | Classificação e grupos | RF-03 | `grupos.html` | A detalhar |
| 004 | Elencos das seleções | RF-04 | `equipes.html` | A detalhar |
| 005 | Ranking FIFA | Não é um RF formal — ver nota abaixo | `ranking.html` | A detalhar |
| 006 | Landing page | RF-01 | `index.html` | A detalhar |
| 007 | Bolão e simulador de chaveamento | RF-06 | `simulador.html` | A detalhar |

> **Nota sobre a feature 005:** `PRD.md` não tem uma seção de "Ranking FIFA" própria —
> a pontuação/posição no ranking aparece só como campo do card de seleção em RF-04
> ("bandeira, confederação, treinador, ranking FIFA"). A página `ranking.html` é uma
> consulta adicional que o protótipo criou além do PRD; mantida no roadmap porque já
> está implementada e testada, mas sem um RF para referenciar.

## Por que essa ordem

- **001** entrega o alicerce: sem ele, nenhuma outra feature tem onde pousar.
- **002** é a fatia vertical mais simples depois do setup — só precisa do `Jogo` e do
  `Estadio`, sem depender do motor de classificação. É também onde entra o **Seed
  real** a partir de `src/js/dados/*.js` (não existe ainda — feature 001 só cria a
  referência ao pacote do EF Core, sem dado nenhum carregado). Bom teste de fumaça
  da Infrastructure (Seed, EF Core) e do Web (Blazor Interactive Server) reais.
- **003** depende de **002** (a mesma tabela de jogos alimenta os resultados) e do
  motor de classificação já implementado em **001**.
- **004** e **005** são páginas de consulta relativamente independentes entre si;
  ambas podem vir depois de **002**/**003** sem depender uma da outra.
- **006** (Home) é deixada para depois porque agrega destaques de jogos, grupos e
  ranking — só faz sentido quando essas páginas já existem para reaproveitar.
- **007** (Bolão/Simulador) é a mais complexa: depende do motor de classificação
  **e** do motor de mata-mata (ambos de **001**), além de persistência de bolões e
  palpites. Fica por último.

## Fora do roadmap por enquanto

- **RF-05 — Escalação da Seleção Brasileira**: consta no PRD, mas não está entre as
  páginas cobertas pelo protótipo (ver tabela "Cobertura do PRD" em `../README.md`).
  Antes de agendar, vale confirmar com o time se ela ainda está no escopo da v1 ou
  se foi conscientemente adiada.
- **RF-07 — Painel administrativo**: `CLAUDE.md` exclui explicitamente área
  administrativa, login e autenticação do escopo da primeira versão. Não entra no
  roadmap até essa decisão mudar.

## Onde ler mais

- `architecture.md` — a arquitetura em camadas que cada feature deve seguir.
- `domain.md` — a linguagem ubíqua e as regras de negócio que já existem a partir da
  feature 001.
- `features/` — a spec detalhada de cada feature, no formato descrito em
  `features/minha-feature implememtacao.md`.

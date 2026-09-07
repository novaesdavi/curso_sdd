# PortalCopa26

Portal da Copa do Mundo FIFA 2026, especificado em [PRD.md](PRD.md). O repositório
tem duas partes:

- **`PRD/src/`** — a aplicação real: solução **Blazor Web App (.NET 10) + EF Core +
  SQLite**, em construção.
- **`src/`** — o protótipo HTML/CSS/JS que serviu (e serve) de especificação
  executável do domínio: as regras de negócio nele já estão validadas por 16 testes e
  são traduzidas, não reinventadas, para C#. Ver seção
  [Protótipo de referência](#protótipo-de-referência-src) mais abaixo.

---

## Projeto principal (`PRD/src/`)

Solução .NET 10 em DDD por camadas: `Domain → Application → Infrastructure/Web`. A
primeira feature (esqueleto da solução + motor de classificação de grupos e de
mata-mata) já está implementada; as telas do PRD (Jogos, Grupos, Elencos, Ranking,
Bolão) ainda não. Ver [`docs/roadmap.md`](docs/roadmap.md) para a ordem planejada.

### Como rodar

A partir de `PRD/src/`:

```bash
dotnet build                            # builda os 5 projetos da solução
dotnet run --project src/PortalCopa26.Web   # sobe o Blazor (Interactive Server)
dotnet test                             # testes de domínio (xUnit + FluentAssertions)
```

`dotnet run` sobe a aplicação em `https://localhost:<porta>` (a porta exata aparece no
console). O modo de renderização é **Interactive Server** — decisão registrada em
[`docs/architecture.md`](docs/architecture.md).

Para detalhes de arquitetura, migrations e comandos de EF Core, ver
[`CLAUDE.md`](CLAUDE.md) (na raiz do repositório, mas escrito para a pasta `PRD/src/`).

---

## Documentação (`docs/`)

| Pasta/arquivo | Objetivo |
|---|---|
| [`docs/architecture.md`](docs/architecture.md) | A arquitetura em camadas da solução .NET, a regra de dependência e onde cada tipo de decisão deve morar. |
| [`docs/domain.md`](docs/domain.md) | A linguagem ubíqua do domínio (`Selecao`, `Jogo`, `Classificacao`, …) e o resumo executável das regras de negócio (RN-01/02/03). |
| [`docs/roadmap.md`](docs/roadmap.md) | A ordem planejada das próximas features e por quê. |
| **`docs/features/`** | Uma spec por feature já detalhada para implementação, no formato Objetivo/Contexto/Requisitos/Critérios de aceite/Fora do escopo — o resumo executivo de uma change do OpenSpec (`openspec/changes/`), pensado para servir de contexto rápido sem reabrir o histórico completo da change. |
| **`docs/historias/`** | O conteúdo **bruto** de uma história do kanban (título, descrição, critérios de aceite tal como o card os registra), um arquivo por história/ID de card. É o insumo de entrada para `/opsx:propose` — aponte o skill para o arquivo em vez de colar o conteúdo no chat, e ele lê o arquivo como a descrição do que construir. Diferente de `docs/features/`: a história é o pedido cru; a feature-doc é o resultado já estruturado depois do planejamento. |

Essa estrutura existe para que cada prompt novo tenha uma spec pequena para apontar,
em vez de repetir contexto extenso — ver a seção "Fluxo de trabalho" do
[`CLAUDE.md`](CLAUDE.md).

---

## Protótipo de referência (`src/`)

HTML/CSS/JavaScript sem framework, sem build e sem dependências — os arquivos abrem
direto no navegador. Os dados vêm de *seed* dos arquivos em [`fontes/`](fontes/), a
fonte da verdade. Ele **não é rascunho**: é a especificação executável do domínio,
mantida intacta enquanto o projeto principal é construído (`js/nucleo/classificacao.js`
é o que se traduz para `PortalCopa26.Domain`, um a um, sem reinventar a lógica).

### Como executar

```bash
npm run servir     # http://localhost:5173 (ou dê duplo clique em src/index.html)
npm run dados       # relê fontes/ e reescreve src/js/dados/*.js
npm run teste        # 16 testes das regras de negócio — o gabarito do domínio C#
npm run verificar   # os dois de cima em sequência
```

### Estrutura

```
PRD.md                      Especificação do produto
fontes/                     Fonte da verdade dos dados (arquivos originais)
tools/
  gerar-dados.mjs           Seed: lê fontes/ e gera src/js/dados/*.js
  testar.mjs                Testes das regras de negócio (RN-01, RN-02, RN-03)
  servir.mjs                Servidor estático de desenvolvimento
src/
  index.html, jogos.html, grupos.html, equipes.html, ranking.html, simulador.html
  css/estilos.css           Folha de estilos única (design system + componentes)
  js/dados/                 GERADO — selecoes, jogos, estadios, ranking, jogadores
  js/nucleo/                util, classificacao (motor), armazenamento, componentes, layout
  js/paginas/                Um controlador por página
```

O fluxo dos dados é de mão única: **`fontes/` → `tools/gerar-dados.mjs` → `src/js/dados/`**.
Os arquivos de `src/js/dados/` são gerados e não devem ser editados à mão.

### Cobertura do PRD

| PRD | Implementação |
|---|---|
| §5 Home | `index.html` — hero, contagem regressiva, países-sede, próximos jogos, ranking, chamada do simulador (RF-01) |
| §6 Jogos | `jogos.html` — filtros combináveis por fase/grupo/seleção/sede/data, agrupamento por dia, paginação (RF-02) |
| §7 Grupos | `grupos.html` — V/E/D, GP/GC, saldo, pontos, badge de cabeça de chave, zona, terceiros colocados, potes 1–4 (RF-03) |
| §8 Equipes | `equipes.html` — busca, filtro por grupo/posição, treinador, confederação, clube (RF-04) |
| §9 Ranking | `ranking.html` — busca e filtro "somente Copa 2026" |
| §10 Simulador | `simulador.html` — 72 jogos de grupos com classificação ao vivo, mata-mata completo com pênaltis, múltiplos bolões (RF-06) |
| §11 Seed | `tools/gerar-dados.mjs`; bandeiras via `api.fifa.com/api/v3/picture/flags-sq-4/<COD>` com fallback para a sigla |

Requisitos não-funcionais: mobile-first (320/768/1024/1440), paginação em listagens
longas, PT-BR, contraste AA, `alt` em bandeiras, navegação por teclado e *skip link*.

### Regras de negócio implementadas

**RN-01 — Classificação dos grupos:** pontos → saldo de gols → gols marcados →
confronto direto → saldo nos confrontos diretos → *fair play* (pulado, sem dados de
cartões) → ranking FIFA.

**RN-02 — Avanço:** 1º e 2º de cada grupo (24) + os 8 melhores terceiros = 32 times,
ordenados por pontos, saldo, gols marcados e ranking FIFA.

**RN-03 — Mata-mata:** empate no tempo normal vai para pênaltis (sem gol de ouro); o
vencedor avança automaticamente pelo chaveamento.

### Números do seed

| | |
|---|---|
| Seleções | 48 (12 grupos × 4) |
| Jogos | 104 — 72 de grupos, 16 de segunda fase, 8 oitavas, 4 quartas, 2 semis, 3º lugar e final |
| Cidades-sede | 16 (11 EUA, 3 México, 2 Canadá) |
| Jogadores | 1.238 |
| Ranking FIFA | 98 posições (41 delas na Copa) |

### Decisões e divergências das fontes

Onde as fontes se contradizem ou não trazem um dado pedido pelo PRD, a escolha foi
registrada aqui em vez de ficar implícita no código.

1. **Total de jogos: 104.** `copa2026_fases.txt` diz "102 jogos", mas a soma real dos
   arquivos de jogos é 72 + 16 + 8 + 4 + 2 + 1 + 1 = **104**, que também é o número
   citado no RF-02. Prevaleceu a contagem dos arquivos de jogos.
2. **Datas do mata-mata.** A tabela de fases e os arquivos de confrontos divergem;
   prevaleceram as datas dos arquivos de confrontos, específicas por jogo.
3. **Participações em Copas** não constam nas fontes. Exibida como **"Copas (est.)"**,
   derivada da idade (conta 2010/2014/2018/2022 em que o jogador teria ≥21 anos).
4. **Quarta coluna dos elencos** (`Nome|Idade|Posição|N`) interpretada como **gols
   pela seleção** (campo pedido pelo PRD); mantida como está na fonte mesmo quando
   parece jogos disputados (ex.: goleiros com valor alto).
5. **Fair play (critério 6 da RN-01) não é aplicado** — sem dados de cartões; o
   desempate salta para o ranking FIFA.
6. **Confrontos da Segunda Fase são fixos** — `copa2026_Jogos_Segunda_fase.txt` já
   traz as 16 partidas emparelhadas; o chaveamento se resolve por referência a partir
   das oitavas.
7. **7 seleções fora do trecho de ranking disponível** (Arábia Saudita, Bósnia e
   Herzegovina, Cabo Verde, Curaçao, Gana, Nova Zelândia, Uzbequistão) aparecem sem
   pontuação e entram atrás das ranqueadas no desempate.
8. **Número de camisa e capitão não existem nas fontes** — usa índice sequencial em
   "#"; marcador de capitão implementado, sem dado para preencher.
9. **Confederações inferidas** por geografia — as fontes não as informam.
10. **Nomes de seleção variam entre arquivos** ("EUA"/"Estados Unidos",
    "Tchéquia"/"República Tcheca", "Curaçao"/"Curaçau", …) — normalizados para nome
    canônico e código FIFA de 3 letras.
11. **Contagem regressiva** aponta para o primeiro jogo (11/06/2026, 16h de
    Brasília); RF-01 menciona 17h, prevaleceu o horário da tabela de jogos.
12. **7 jogadores sem clube** — parênteses malformados na fonte (ex.:
    `Homam Ahmed Cultural Leonesa-ESP)`). Exibido como "—".
13. **Horários** são os das fontes, fuso de Brasília (UTC−3); jogos de madrugada são
    armazenados na data real e agrupados no dia da tabela em que a fonte os lista.

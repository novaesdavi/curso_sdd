# PortalCopa26

Protótipo HTML/CSS/JavaScript do portal da Copa do Mundo FIFA 2026, implementado a
partir do [PRD.md](PRD.md) e com os dados carregados por *seed* dos arquivos da pasta
[`fontes/`](fontes/) — a fonte da verdade.

Sem framework, sem build, sem dependências: os arquivos de `src/` abrem direto no
navegador.

---

## Como executar

**Opção 1 — abrir direto:** dê duplo clique em `src/index.html`.
Todos os scripts são clássicos (sem ES modules) e não há `fetch`, então o protótipo
funciona pelo protocolo `file://`.

**Opção 2 — servidor local** (reproduz o cenário de produção):

```bash
npm run servir        # http://localhost:5173
```

**Regenerar os dados a partir de `fontes/` e rodar os testes:**

```bash
npm run dados         # relê fontes/ e reescreve src/js/dados/*.js
npm run teste         # 16 testes das regras de negócio
npm run verificar     # os dois em sequência
```

---

## Estrutura

```
PRD.md                      Especificação do produto
fontes/                     Fonte da verdade dos dados (arquivos originais)
tools/
  gerar-dados.mjs           Seed: lê fontes/ e gera src/js/dados/*.js
  testar.mjs                Testes das regras de negócio (RN-01, RN-02, RN-03)
  servir.mjs                Servidor estático de desenvolvimento
src/
  index.html                Home
  jogos.html                Tabela de jogos
  grupos.html               Grupos e classificação
  equipes.html              Seleções e elencos
  ranking.html              Ranking FIFA
  simulador.html            Simulador / bolões
  css/estilos.css           Folha de estilos única (design system + componentes)
  js/dados/                 GERADO — selecoes, jogos, estadios, ranking, jogadores
  js/nucleo/
    util.js                 Acesso aos dados, datas, bandeiras, helpers de DOM
    classificacao.js        Motor de classificação, desempate e mata-mata
    armazenamento.js        Persistência dos bolões (localStorage)
    componentes.js          Cartão de jogo, tabela de grupo, agrupamento por dia
    layout.js               Cabeçalho, navegação e rodapé compartilhados
  js/paginas/               Um controlador por página
```

O fluxo dos dados é de mão única: **`fontes/` → `tools/gerar-dados.mjs` → `src/js/dados/`**.
Os arquivos de `src/js/dados/` são gerados e não devem ser editados à mão.

---

## Cobertura do PRD

| PRD | Implementação |
|---|---|
| §5 Home — hero, países-sede, próximos jogos, ranking, chamada do simulador | `index.html` + contagem regressiva, números da Copa e atalhos rápidos (RF-01) |
| §6 Jogos — data, hora, mandante, visitante, grupo, estádio, ordenação e agrupamento por dia, link "Ver grupos" | `jogos.html` com filtros combináveis por fase, grupo, seleção, sede e data, e paginação incremental (RF-02) |
| §7 Grupos — posição, seleção, jogos, V, E, D, saldo, pontos | `grupos.html` com GP/GC, badge de cabeça de chave, indicadores de zona, terceiros colocados e potes 1–4 (RF-03) |
| §8 Equipes — bandeira, nome, grupo, elenco (nome, posição, idade, gols, Copas) | `equipes.html` com busca, filtro por grupo e por posição, treinador, confederação e clube de cada jogador (RF-04) |
| §9 Ranking — posição, seleção, pontuação | `ranking.html` com busca e filtro "somente Copa 2026" |
| §10 Simulador — informar placares, simular, recalcular classificação | `simulador.html`: 72 jogos de grupos com classificação ao vivo, mata-mata completo com pênaltis e gestão de múltiplos bolões (RF-06) |
| §11 Seed de seleções, grupos, jogadores, jogos e ranking; bandeiras da API da FIFA | `tools/gerar-dados.mjs`; bandeiras via `api.fifa.com/api/v3/picture/flags-sq-4/<COD>` com fallback para a sigla |

Requisitos não-funcionais: mobile-first com breakpoints em 320/768/1024/1440 (RNF-02),
paginação em listagens longas (RNF-01), PT-BR (RNF-04), contraste AA, `alt` em todas as
bandeiras, navegação por teclado e *skip link* (RNF-05).

---

## Regras de negócio implementadas

**RN-01 — Classificação dos grupos** (`js/nucleo/classificacao.js`), na ordem:
pontos → saldo de gols → gols marcados → confronto direto → saldo nos confrontos
diretos → *fair play* → ranking FIFA.

**RN-02 — Avanço:** 1º e 2º de cada grupo (24) + os 8 melhores terceiros = 32 times.
Os terceiros são ordenados por pontos, saldo, gols marcados e ranking FIFA, conforme
`Copa2026_Regra_Terceiros_Colocados.txt`.

**RN-03 — Mata-mata:** empate no tempo normal abre o campo de pênaltis; o vencedor
avança automaticamente pelo chaveamento (`Venc. Segundafase N`, `Venc. Oitavas N`, …).

---

## Números do seed

| | |
|---|---|
| Seleções | 48 (12 grupos × 4) |
| Jogos | 104 — 72 de grupos, 16 de segunda fase, 8 oitavas, 4 quartas, 2 semis, 3º lugar e final |
| Cidades-sede | 16 (11 EUA, 3 México, 2 Canadá) |
| Jogadores | 1.238 |
| Ranking FIFA | 98 posições (41 delas na Copa) |

Verificado pelos testes: cada seleção joga exatamente 3 vezes na fase de grupos, não há
confronto repetido dentro do grupo e todo jogo tem estádio e horário válidos.

---

## Decisões e divergências das fontes

Onde as fontes se contradizem ou não trazem um dado pedido pelo PRD, a escolha foi
registrada aqui em vez de ficar implícita no código.

1. **Total de jogos: 104.** `copa2026_fases.txt` diz "total de 102 jogos", mas a soma
   real dos arquivos de jogos é 72 + 16 + 8 + 4 + 2 + 1 + 1 = **104** — que também é o
   número citado no RF-02. Prevaleceu a contagem dos arquivos de jogos.
2. **Datas do mata-mata.** A tabela de fases e os arquivos de confrontos divergem (ex.:
   quartas "11–13 jul" na tabela, 09–11/07 nos confrontos). Prevaleceram as datas dos
   arquivos de confrontos, que são específicas por jogo.
3. **Participações em Copas.** As fontes não trazem esse dado. Para atender ao §8 do
   PRD, a coluna é exibida como **"Copas (est.)"** e derivada da idade: conta as Copas
   de 2010/2014/2018/2022 nas quais o jogador teria ao menos 21 anos. A interface
   informa que é estimativa.
4. **Quarta coluna dos elencos** (`Nome|Idade|Posição|N`) foi interpretada como **gols
   pela seleção**, que é o campo pedido pelo PRD. Alguns registros da fonte parecem
   trazer jogos disputados em vez de gols (ex.: goleiros com valor alto); o dado foi
   mantido como está na fonte.
5. **Fair play (critério 6 da RN-01) não é aplicado** — não há dados de cartões nas
   fontes. O desempate salta para o ranking FIFA.
6. **Confrontos da Segunda Fase são fixos.** `copa2026_Jogos_Segunda_fase.txt` já traz
   as 16 partidas com as seleções emparelhadas, e nenhuma fonte define o mapeamento de
   posição de grupo para chave. O simulador mantém esses confrontos e resolve o
   chaveamento por referência a partir das oitavas; a simulação dos grupos alimenta a
   lista de classificados exibida ao lado.
7. **7 seleções da Copa estão fora do trecho de ranking disponível** (Arábia Saudita,
   Bósnia e Herzegovina, Cabo Verde, Curaçao, Gana, Nova Zelândia e Uzbequistão). Elas
   aparecem sem pontuação e entram atrás das ranqueadas nos critérios de desempate. A
   página de Ranking avisa isso explicitamente.
8. **Número de camisa e capitão não existem nas fontes.** A tabela de elenco usa um
   índice sequencial em "#", e o marcador de capitão está implementado mas sem dados
   para preencher.
9. **Confederações foram inferidas** por geografia — as fontes não as informam.
10. **Nomes de seleção variam entre os arquivos** ("EUA"/"Estados Unidos",
    "Tchéquia"/"República Tcheca", "Curaçao"/"Curaçau", "Países Baixos"/"Holanda",
    "Côte d'Ivoire"/"Costa do Marfim", …). O gerador normaliza tudo para um nome
    canônico via tabela de apelidos e código FIFA de 3 letras.
11. **Contagem regressiva** aponta para o primeiro jogo do seed (11/06/2026, 16h de
    Brasília). O RF-01 menciona 17h; prevaleceu o horário da tabela de jogos para a
    página não contradizer a própria tabela.
12. **7 jogadores ficaram sem clube** porque a linha correspondente na fonte tem
    parênteses malformados (ex.: `Homam Ahmed Cultural Leonesa-ESP)`). O clube aparece
    como "—".
13. **Horários** são os das fontes, no fuso de Brasília (UTC−3). Jogos de madrugada
    (ex.: "01:00 hs (14 de junho)") são armazenados na data real e agrupados no dia da
    tabela em que a fonte os lista.

---

## Próximo passo (Blazor / EF Core / SQLite)

O PRD prevê a evolução para Blazor Web App com .NET 10, EF Core e SQLite. O protótipo
já está organizado para isso:

- `js/dados/*.js` corresponde ao **Seed** das entidades `Selecao`, `Jogo`, `Estadio`,
  `Jogador` e `RankingFifa`;
- `js/nucleo/classificacao.js` é o **domínio** puro (sem DOM) — traduz direto para
  serviços C# com os mesmos testes;
- `js/nucleo/armazenamento.js` é o único ponto acoplado ao `localStorage`: é ele que
  vira repositório EF Core;
- as páginas correspondem 1:1 às rotas Blazor previstas na navegação do PRD.

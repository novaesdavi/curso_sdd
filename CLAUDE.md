# PortalCopa26 — Blazor / .NET

Portal da Copa do Mundo FIFA 2026: jogos, grupos, classificação, seleções, elencos,
ranking FIFA e simulador de resultados. Esta pasta (`PRD/src/`) abriga a aplicação
**Blazor Web App (.NET 10) com EF Core e SQLite**.

**Escreva tudo em PT-BR:** código, nomes de tipo, mensagens de erro, commits e UI.
O domínio é futebol brasileiro; `Selecao`, `Jogo`, `Classificacao` — nunca `Team`,
`Match`, `Standing`.

---

## Estado atual

**A solução .NET ainda não existe.** Esta pasta está vazia. Antes de rodar qualquer
comando `dotnet`, confirme o que já foi criado — não presuma que os comandos abaixo
funcionam.

O que existe hoje é o **protótipo HTML/CSS/JS** em `../../src/`, já completo e testado.
Ele não é rascunho: é a especificação executável do domínio. Mantenha-o intacto.

---

## Comandos

Alvo, a partir de `PRD/src/` (ajuste os nomes conforme a solução real):

```bash
dotnet build
dotnet test                                   # todos os testes
dotnet run --project PortalCopa26.Web         # sobe a aplicação
dotnet ef migrations add <Nome> --project PortalCopa26.Infrastructure --startup-project PortalCopa26.Web
dotnet ef database update --project PortalCopa26.Infrastructure --startup-project PortalCopa26.Web
```

Do protótipo de referência, a partir da **raiz do repositório**:

```bash
npm run dados      # regenera o seed a partir de fontes/
npm run teste      # 16 testes das regras de negócio — o gabarito do domínio C#
npm run servir     # sobe o protótipo em http://localhost:5173
```

---

## Arquitetura — DDD em camadas

```
PortalCopa26.Domain           Entidades, agregados, regras. Zero dependências.
PortalCopa26.Application      Casos de uso, DTOs, portas (interfaces de repositório).
PortalCopa26.Infrastructure   EF Core, SQLite, repositórios, Seed.
PortalCopa26.Web              Blazor Web App: páginas e componentes.
PortalCopa26.Domain.Tests     Testes do domínio.
```

**A dependência só aponta para dentro:** `Web → Application → Domain` e
`Infrastructure → Application → Domain`. O `Domain` não referencia ninguém — se você
precisou adicionar um pacote nele, a modelagem está errada.

### Onde mora o quê

| A decisão é… | Vai em | Nunca em |
|---|---|---|
| Regra de negócio, invariante, cálculo | `Domain` | componente Blazor, handler |
| Orquestração, busca de dados, tradução | `Application` | `Domain` |
| SQL, mapeamento, migration, seed | `Infrastructure` | `Application`, `Domain` |
| Layout, formatação, interação | `Web` | qualquer outra camada |

O agregado nunca confia em quem o chama: valide a invariante **dentro** dele, não no
handler. Se um endpoint novo ou um teste chamar o construtor direto, a regra tem que
continuar valendo.

**Decisão em aberto:** o modo de renderização do Blazor (Server / WebAssembly / Auto)
não foi definido no PRD. Pergunte antes de escolher.

---

## Regras de negócio invioláveis

Estas três regras vêm de `fontes/copa2026_regras_negocio.txt` e já estão implementadas
e testadas em `../../src/js/nucleo/classificacao.js`. **Traduza aquele arquivo — não
reinvente a lógica.**

**RN-01 — Classificação dos grupos.** Desempate nesta ordem exata: pontos → saldo de
gols → gols marcados → confronto direto → saldo nos confrontos diretos → fair play →
ranking FIFA. O critério de fair play **não é aplicado**: as fontes não têm dados de
cartões, então o desempate salta para o ranking FIFA.

**RN-02 — Avanço.** 1º e 2º de cada grupo (24) + os 8 melhores terceiros = 32 times.
Os 12 terceiros são ordenados por pontos → saldo → gols marcados → ranking FIFA.

**RN-03 — Mata-mata.** Empate no tempo normal vai para pênaltis; o vencedor avança
automaticamente pelo chaveamento. Não existe gol de ouro.

Vitória vale 3, empate 1, derrota 0.

---

## Invariantes dos dados

Qualquer alteração que quebre um destes números é um bug:

- **48 seleções** em **12 grupos** de 4, distribuídas em 4 potes
- **104 jogos**: 72 de grupos + 16 de segunda fase + 8 oitavas + 4 quartas + 2 semis +
  3º lugar + final
- Cada seleção joga **exatamente 3 vezes** na fase de grupos, sem confronto repetido
- **16 cidades-sede** (11 EUA, 3 México, 2 Canadá) · **1.238 jogadores** ·
  **98 posições** de ranking FIFA

`fontes/copa2026_fases.txt` diz "102 jogos" e está errado: a soma real dos arquivos de
confrontos é 104. Use 104.

---

## Dados

A fonte da verdade é a pasta `fontes/` na raiz do repositório — arquivos de texto
originais, nunca editados. O fluxo é de mão única:

```
fontes/  →  tools/gerar-dados.mjs  →  src/js/dados/*.js  →  Seed do EF Core
```

Ao construir o Seed em `Infrastructure`, importe de `src/js/dados/*.js`, que já está
normalizado (nomes canônicos, códigos FIFA de 3 letras, datas resolvidas). Não parseie
`fontes/` de novo em C#.

Três armadilhas que já custaram tempo — o restante está em `../../README.md`:

1. **Os confrontos da Segunda Fase são fixos.** O arquivo de origem já traz as 16
   partidas com as seleções emparelhadas, e nenhuma fonte define o mapeamento de
   posição de grupo para chave. Não invente esse mapeamento; a partir das oitavas o
   chaveamento se resolve por referência (`Venc. Segundafase N`).
2. **Horários são de Brasília (UTC−3).** Jogos de madrugada guardam a data real, mas
   são agrupados no dia da tabela em que a fonte os lista. Não "corrija" o fuso.
3. **7 seleções não estão no ranking disponível.** Elas entram atrás de todas as
   ranqueadas nos critérios de desempate.

---

## Convenções

- Exceções de domínio herdam de `DomainException`; o handler global já as trata.
- Valide invariantes com guard clauses no início do método, com mensagem em PT-BR.
- Testes: xUnit + FluentAssertions, com `[Fact(DisplayName = "...")]` descrevendo a
  regra em português. Use `[Theory]` quando a regra cobrir vários estados.
- Migrations são versionadas e commitadas.
- Banco: arquivo único `copa2026.db`, sem Docker e sem servidor externo.
- UI: mobile-first, breakpoints 320/768/1024/1440, contraste WCAG AA, `alt` em todas as
  bandeiras, navegação por teclado.
- Bandeiras vêm da API pública da FIFA
  (`https://api.fifa.com/api/v3/picture/flags-sq-4/<COD>`), sempre com fallback para a
  sigla de 3 letras quando a imagem não carregar.

## Não faça

- Não edite `src/js/dados/*.js` à mão — são gerados; rode `npm run dados`.
- Não edite nada em `fontes/` — é a fonte da verdade.
- Não commite `copa2026.db` nem `bin/`, `obj/`.
- Não coloque regra de negócio em componente `.razor`.
- Não crie área administrativa, login ou autenticação: o PRD as põe explicitamente
  fora do escopo da primeira versão.

---

## Fluxo de trabalho

Este repositório usa **OpenSpec** (`openspec/config.yaml`). Mudanças de escopo passam
por `propose → apply → archive` pelos comandos `/opsx:*`. Para correção pontual dentro
de um escopo já acordado, vá direto ao código.

## Onde ler mais

- `../../PRD.md` — o produto: páginas, campos de cada tela, escopo e não-escopo.
- `../../README.md` — o protótipo: como rodar, cobertura do PRD e as **13 divergências
  das fontes** com a decisão tomada em cada uma. Leia antes de mexer nos dados.
- `../../src/js/nucleo/classificacao.js` — o motor de classificação a ser traduzido.
- `../../tools/testar.mjs` — os 16 testes que o domínio C# precisa continuar passando.

# Arquitetura — PortalCopa26

Como a solução .NET do PortalCopa26 (`PRD/src/`) é organizada, e por quê. Este
documento existe para dar contexto rápido às próximas features, sem repetir a
explicação a cada prompt — a fonte da verdade das regras é sempre o `CLAUDE.md`.

## Camadas (DDD)

```
PortalCopa26.sln
├── src/PortalCopa26.Domain              net10.0, classlib — zero pacotes NuGet
├── src/PortalCopa26.Application         net10.0, classlib — refs Domain
├── src/PortalCopa26.Infrastructure      net10.0, classlib — refs Application
│                                          pacotes: Microsoft.EntityFrameworkCore.Sqlite
├── src/PortalCopa26.Web                 net10.0, Blazor Web App — refs Application, Infrastructure
└── tests/PortalCopa26.Domain.Tests      net10.0, xUnit — refs Domain
                                           pacotes: xunit, FluentAssertions
```

**A dependência só aponta para dentro:** `Web → Application → Domain` e
`Infrastructure → Application → Domain`. O `Domain` não referencia nenhum outro
projeto e não recebe pacote NuGet nenhum — se um cenário parecer exigir um, é sinal
de que a regra foi modelada no lugar errado.

`Infrastructure` referencia `Application` (não `Web`), então qualquer regra de
acesso a dados fica isolada de qualquer preocupação de interface.

## Onde mora o quê

| A decisão é… | Vai em | Nunca em |
|---|---|---|
| Regra de negócio, invariante, cálculo | `Domain` | componente Blazor, handler |
| Orquestração, busca de dados, tradução | `Application` | `Domain` |
| SQL, mapeamento, migration, seed | `Infrastructure` | `Application`, `Domain` |
| Layout, formatação, interação | `Web` | qualquer outra camada |

O agregado nunca confia em quem o chama: a invariante é validada **dentro** dele
(guard clause no construtor/método), não no handler que o chama. Se um teste novo
chamar o construtor direto, a regra continua valendo.

## Modo de renderização Blazor: Interactive Server

`PortalCopa26.Web` é criado com `dotnet new blazor --interactivity Server`.

**Por quê:** o app roda localmente, sem Docker e sem servidor externo (`copa2026.db`
é um arquivo único). Interactive Server acessa o EF Core/SQLite diretamente do
servidor, sem precisar expor uma API HTTP — que seria obrigatória com WebAssembly,
já que o navegador não pode abrir o arquivo SQLite. O modo Auto foi descartado por
somar a complexidade de dois modelos de hospedagem sem que o produto precise
funcionar offline.

**Trade-off aceito:** Interactive Server exige uma conexão ativa (SignalR) com o
servidor durante o uso. Como o PortalCopa26 é uma aplicação de uso local/pessoal sem
requisito de disponibilidade offline no PRD, isso não é um problema — não revisitar
esta decisão sem uma necessidade concreta nova.

## Fluxo de dados

```
fontes/  →  tools/gerar-dados.mjs  →  src/js/dados/*.js  →  Seed do EF Core (Infrastructure)
```

`fontes/` nunca é reparseada em C#: o Seed do `Infrastructure` importa de
`src/js/dados/*.js`, que já normaliza nomes canônicos, códigos FIFA de 3 letras e
datas resolvidas. Ver `domain.md` para o que cada arquivo de dados representa.

## Testes

- `PortalCopa26.Domain.Tests` (xUnit + FluentAssertions) é o único projeto de teste
  desta fase do projeto. Cobre as regras de negócio do `Domain` — hoje, o motor de
  classificação e o motor de mata-mata.
- O gabarito são os 16 testes de `tools/testar.mjs` (rodáveis com `npm run teste` na
  raiz do repositório): cada regra do protótipo precisa de um `[Fact]`/`[Theory]`
  equivalente em C#, com `DisplayName` em português descrevendo a regra.

## Onde ler mais

- `domain.md` — a linguagem ubíqua do domínio e o resumo das regras de negócio.
- `roadmap.md` — a ordem planejada das próximas features.
- `../CLAUDE.md` — as convenções de código, invariantes de dados e o que não fazer.
- `../README.md` — o protótipo: cobertura do PRD e as 13 divergências das fontes.

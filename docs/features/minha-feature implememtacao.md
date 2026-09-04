1. CLAUDE.md → regras permanentes do projeto

É o que fizemos acima. Ele deve conter coisas que continuam verdadeiras durante todo o desenvolvimento:

stack (.NET 10, Blazor, EF Core, SQLite);
arquitetura;
convenções;
estrutura de pastas;
princípios;
coisas que não devem ser feitas;
como validar o código;
visão geral do projeto.

O Claude Code lê esse arquivo como contexto do projeto.

2. docs/ → especificações das funcionalidades

Quando você quiser implementar uma alteração grande, não precisa colocar toda a explicação no prompt.

Crie, por exemplo:

PortalCopa26/
│
├── CLAUDE.md
│
├── docs/
│   ├── arquitetura.md
│   ├── especificacao.md
│   └── features/
│       ├── ranking-fifa.md
│       ├── simulador.md
│       └── jogos.md

E cada arquivo descreve uma funcionalidade ou alteração específica.

Por exemplo:

# Feature: Ranking FIFA

## Objetivo

Implementar a página de Ranking FIFA do PortalCopa26.

## Contexto

O sistema já possui as entidades:

- Selecao
- RankingFifa

O ranking atualmente está persistido no SQLite.

## Requisitos funcionais

A página deverá:

1. Exibir todas as seleções ordenadas pelo ranking FIFA.
2. Exibir posição.
3. Exibir nome da seleção.
4. Exibir pontuação.
5. Permitir visualizar a evolução do ranking.

## Requisitos técnicos

Utilizar:

- Blazor
- Entity Framework Core
- SQLite
- Chart.js
- JSInterop

O gráfico deverá ser implementado utilizando Chart.js.

## Regras

- Não criar uma nova API.
- Não criar um novo projeto.
- Não alterar a estrutura atual do banco sem necessidade.
- Utilizar os Services existentes.
- Não colocar consultas EF Core diretamente no componente Blazor.

## Critérios de aceite

- [ ] Página acessível pelo menu principal.
- [ ] Ranking carregado do SQLite.
- [ ] Dados ordenados corretamente.
- [ ] Gráfico funcionando.
- [ ] Nenhuma chamada externa necessária.
- [ ] `dotnet build` executa sem erros.

## Fora do escopo

- Autenticação.
- Área administrativa.
- Integração com API externa.
- Edição do ranking.

Então seu prompt pode ser simplesmente:

Implemente a feature descrita em docs/features/ranking-fifa.md. Antes de alterar o código, analise a arquitetura atual e verifique se a implementação está de acordo com o CLAUDE.md.

Isso é muito melhor do que jogar um prompt gigante toda vez.

Para alterações menores

Se for algo simples, nem precisa criar arquivo.

Exemplo:

Altere o botão "Simular" para ficar desabilitado enquanto a simulação estiver sendo processada. Siga as convenções do CLAUDE.md.

Pronto.

Para alterações grandes

Eu usaria este fluxo:

1. Criar especificação
       ↓
2. Salvar em docs/features/minha-feature.md
       ↓
3. Pedir Claude para analisar
       ↓
4. Claude identifica impacto
       ↓
5. Claude implementa
       ↓
6. Testes / validação

Inclusive, você pode pedir primeiro:

Leia docs/features/ranking-fifa.md e faça uma análise da implementação necessária. Não altere nenhum arquivo ainda. Liste os arquivos que precisarão ser criados ou modificados e explique a abordagem.

Depois:

Implemente a especificação após sua análise.

Isso reduz bastante o risco de o Claude sair implementando coisas que você não pediu.

Eu faria uma coisa ainda melhor no seu projeto

Como você está construindo o PortalCopa26 de forma incremental, criaria:

CLAUDE.md

docs/
├── architecture.md
├── domain.md
├── roadmap.md
├── decisions/
│   ├── ADR-001-single-project.md
│   └── ADR-002-sqlite.md
│
└── features/
    ├── 001-initial-setup.md
    ├── 002-jogos.md
    ├── 003-grupos.md
    ├── 004-selecoes.md
    ├── 005-ranking-fifa.md
    └── 006-simulador.md
A diferença entre eles
Arquivo	Para quê?
CLAUDE.md	Como o Claude deve trabalhar no projeto
architecture.md	Como o sistema é arquitetado
domain.md	Como funciona o domínio da Copa
roadmap.md	O que será desenvolvido e em qual ordem
ADR-*	Por que uma decisão arquitetural foi tomada
features/*.md	O que precisa ser implementado em cada funcionalidade
E o prompt fica pequeno

Em vez de:

"Crie uma página de ranking, usando Chart.js, mas não faça autenticação, lembre que estamos usando SQLite, o projeto é único, não crie API, o ranking tem essas entidades..."

Você simplesmente diz:

Implemente docs/features/005-ranking-fifa.md.

E o CLAUDE.md fornece as regras globais.

Essa é a abordagem que eu recomendo para o seu projeto. O prompt deve ser o comando da tarefa; os arquivos devem ser a fonte de verdade da especificação.
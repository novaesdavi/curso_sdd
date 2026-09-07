## 1. Documentação

- [x] 1.1 Criar `docs/architecture.md` descrevendo a arquitetura em camadas, a regra
  de dependência e a tabela "onde mora o quê", e verificar que o arquivo existe e
  cobre os 4 projetos (Domain/Application/Infrastructure/Web)
- [x] 1.2 Criar `docs/domain.md` com a linguagem ubíqua (Selecao, Jogo, Grupo,
  Classificacao, Chaveamento) e o resumo das RN-01/02/03, e verificar que cada termo
  usado no código do Domain (tarefas da seção 3) aparece documentado
- [x] 1.3 Criar `docs/roadmap.md` listando `001-initial-setup` como concluída ao fim
  desta change e as próximas features previstas (Seed/dados reais, Tabela de Jogos,
  Classificação e Grupos, Elencos, Escalação, Bolão), e verificar que a ordem é
  consistente com `PRD.md`
- [x] 1.4 Criar `docs/features/001-initial-setup.md` no formato de feature-doc do
  guia (Objetivo, Contexto, Requisitos, Critérios de aceite, Fora do escopo),
  resumindo esta change, e verificar que os critérios de aceite listados batem com a
  seção 6 deste `tasks.md`

## 2. Esqueleto da solução .NET

- [x] 2.1 Criar `PortalCopa26.sln` na raiz de `PRD/src/` e verificar que `dotnet sln
  list` mostra a solução vazia
- [x] 2.2 Criar `src/PortalCopa26.Domain` (classlib, net10.0, sem pacotes NuGet) e
  adicionar à solução; verificar que `dotnet build` do projeto isolado passa
- [x] 2.3 Criar `src/PortalCopa26.Application` (classlib) referenciando `Domain`;
  verificar com `dotnet build`
- [x] 2.4 Criar `src/PortalCopa26.Infrastructure` (classlib) referenciando
  `Application` e adicionar o pacote `Microsoft.EntityFrameworkCore.Sqlite`;
  verificar com `dotnet build`
- [x] 2.5 Criar `src/PortalCopa26.Web` com `dotnet new blazor --interactivity Server`
  referenciando `Application` e `Infrastructure`; verificar que `dotnet run
  --project PortalCopa26.Web` sobe a página padrão sem erro
- [x] 2.6 Criar `tests/PortalCopa26.Domain.Tests` (xUnit) referenciando `Domain` e
  adicionar os pacotes `xunit` e `FluentAssertions`; verificar que `dotnet test`
  roda (mesmo sem testes ainda) sem erro
- [x] 2.7 Confirmar que `dotnet build` na raiz da solução builda os 5 projetos sem
  avisos de referência circular ou de camada invertida (nenhum projeto downstream
  referenciado por um upstream)

## 3. Entidades de domínio

- [x] 3.1 Implementar a entidade `Selecao` em `PortalCopa26.Domain` (código FIFA de 3
  letras, nome, grupo, pote, cabeça de chave, ranking FIFA opcional) com guard
  clauses de invariante em PT-BR; verificar com um teste que construir uma `Selecao`
  com código FIFA fora do padrão de 3 letras lança `DomainException`
- [x] 3.2 Implementar a entidade `Jogo` (fase, grupo opcional, mandante/visitante ou
  referência a vencedor/perdedor de outro jogo, placar, pênaltis, status) com guard
  clauses; verificar com um teste que placar negativo lança `DomainException`
- [x] 3.3 Implementar `DomainException` como base das exceções de domínio; verificar
  que ela é usada pelas tarefas 3.1 e 3.2

## 4. Motor de classificação de grupos (capability `classificacao-grupos`)

- [x] 4.1 Implementar o cálculo da tabela de um grupo (pontos, V/E/D, gols
  pró/contra, saldo) a partir dos jogos com placar completo, traduzindo
  `linhaVazia`/`aplicar`/`calcularGrupo` de `classificacao.js`; verificar com teste
  cobrindo o cenário "Grupo com todos os jogos disputados" da spec
- [x] 4.2 Implementar a ordenação por desempate RN-01 (pontos → saldo → gols
  marcados → confronto direto → saldo no confronto direto → ranking FIFA, pulando
  fair play), traduzindo `compararBase`/`miniTabela`/`ordenarGrupo`; verificar com
  testes cobrindo os 3 cenários de empate da spec `classificacao-grupos`
  (saldo geral, confronto direto, ranking FIFA remanescente)
- [x] 4.3 Implementar a seleção dos 8 melhores terceiros colocados entre os 12
  grupos (RN-02), traduzindo `terceirosColocados`; verificar com testes cobrindo os
  cenários "entre os 8 melhores" e "fora dos 8 melhores" da spec
- [x] 4.4 Implementar a zona de classificação de uma seleção (classificado /
  eliminado / indefinido), traduzindo `zona`; verificar com testes cobrindo 1º/2º
  sempre classificados e 4º sempre eliminado

## 5. Motor de mata-mata (capability `mata-mata`)

- [x] 5.1 Implementar a resolução de um confronto por placar no tempo normal,
  traduzindo a parte correspondente de `resolverMataMata`; verificar com teste do
  cenário "Vitória simples no tempo normal" da spec `mata-mata`
- [x] 5.2 Implementar a decisão por pênaltis em caso de empate no tempo normal (RN-03,
  sem gol de ouro), com guard clause impedindo pênaltis sem empate prévio; verificar
  com testes dos cenários "Empate com pênaltis informados" e "Empate sem pênaltis
  ainda informados"
- [x] 5.3 Implementar a propagação automática do vencedor/perdedor para o confronto
  seguinte por referência, traduzindo o mecanismo de `mandanteRef`/`visitanteRef`;
  verificar com testes dos cenários "Próximo confronto aguardando o resultado
  anterior" e "Vencedor propagado para o confronto seguinte"

## 6. Gabarito de testes e verificação final

- [x] 6.1 Mapear os 16 testes de `tools/testar.mjs` (`npm run teste`) para os `[Fact
  (DisplayName = "...")]`/`[Theory]` equivalentes em `PortalCopa26.Domain.Tests`, um a
  um, com nomes em português descrevendo a regra
- [x] 6.2 Rodar `dotnet test` e verificar que todos os testes de domínio passam,
  cobrindo o mesmo conjunto de regras que os 16 testes do protótipo
- [x] 6.3 Rodar `npm run teste` na raiz do repositório e confirmar que o protótipo
  continua com os 16 testes verdes (garantindo que nada em `src/` foi alterado)
- [x] 6.4 Rodar `dotnet build` na raiz da solução e `dotnet run --project
  PortalCopa26.Web` e verificar que a aplicação sobe sem erro, confirmando a página
  placeholder do Blazor com Interactive Server funcionando ponta a ponta

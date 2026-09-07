## Purpose

Resolve um confronto eliminatório do mata-mata — quem avança e quem é eliminado —
aplicando a regra de que não existe gol de ouro e de que empates no tempo normal são
decididos nos pênaltis, e propaga o vencedor pelo chaveamento até a final.

## ADDED Requirements

### Requirement: Vencedor por placar no tempo normal
Quando um confronto do mata-mata tem placar diferente entre as duas seleções, o
sistema SHALL declarar vencedora a seleção com mais gols e o confronto SHALL ser
considerado decidido, sem necessidade de pênaltis.

#### Scenario: Vitória simples no tempo normal
- **WHEN** um confronto do mata-mata termina com placar diferente entre as duas
  seleções
- **THEN** o sistema declara vencedora a seleção com mais gols e o confronto fica
  decidido

### Requirement: Empate no tempo normal decidido nos pênaltis (RN-03)
Quando um confronto do mata-mata termina empatado no placar, o sistema SHALL exigir
um resultado de pênaltis para decidir o vencedor. Não existe gol de ouro ou gol de
prata: o sistema SHALL sempre tratar o empate como indo direto para a decisão por
pênaltis.

#### Scenario: Empate com pênaltis informados
- **WHEN** um confronto do mata-mata termina empatado no placar e o resultado dos
  pênaltis está definido com placares diferentes
- **THEN** o sistema declara vencedora a seleção com mais pênaltis convertidos e o
  confronto fica decidido

#### Scenario: Empate sem pênaltis ainda informados
- **WHEN** um confronto do mata-mata termina empatado no placar e o resultado dos
  pênaltis ainda não foi informado
- **THEN** o sistema mantém o confronto como não decidido, sem declarar vencedor

### Requirement: Avanço automático pelo chaveamento
Quando um confronto do mata-mata referencia o vencedor (ou perdedor, no caso da
disputa de 3º lugar) de outro confronto ainda não decidido, o sistema SHALL manter os
lados desse confronto como indefinidos até que o confronto de origem seja decidido.
Assim que o confronto de origem é decidido, o sistema SHALL propagar automaticamente
a seleção correspondente para o confronto seguinte.

#### Scenario: Próximo confronto aguardando o resultado anterior
- **WHEN** um confronto do mata-mata depende do vencedor de um confronto anterior
  ainda não decidido
- **THEN** o sistema mantém esse lado do confronto seguinte como indefinido

#### Scenario: Vencedor propagado para o confronto seguinte
- **WHEN** o confronto de origem é decidido
- **THEN** o sistema preenche automaticamente o lado correspondente do confronto
  seguinte com a seleção vencedora (ou perdedora, quando o confronto seguinte for a
  disputa de 3º lugar), sem exigir nova entrada manual

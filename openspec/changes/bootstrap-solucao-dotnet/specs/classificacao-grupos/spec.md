## Purpose

Calcula a tabela de classificação de um grupo da fase inicial e determina quais
seleções avançam ao mata-mata, aplicando a ordem de desempate oficial da FIFA e a
regra dos melhores terceiros colocados do torneio.

## ADDED Requirements

### Requirement: Cálculo da tabela de um grupo
O sistema SHALL calcular, para cada seleção de um grupo, jogos disputados, vitórias,
empates, derrotas, gols pró, gols contra, saldo de gols e pontos (vitória = 3, empate
= 1, derrota = 0), considerando somente os jogos do grupo cujo placar de ambos os
lados esteja definido. Um jogo sem placar completo não SHALL contar para nenhuma
seleção.

#### Scenario: Grupo com todos os jogos disputados
- **WHEN** os 6 jogos de um grupo de 4 seleções têm placar completo
- **THEN** a tabela do grupo mostra 3 jogos disputados para cada seleção e a soma dos
  pontos de todas as seleções é igual a 3 vezes o número de jogos decididos mais 2
  vezes o número de jogos empatados

#### Scenario: Grupo parcialmente disputado
- **WHEN** apenas alguns jogos do grupo têm placar definido
- **THEN** a tabela reflete somente os jogos com placar completo, e o sistema indica
  quantos dos jogos do grupo já foram computados frente ao total

### Requirement: Ordem de desempate entre seleções do grupo (RN-01)
Quando duas ou mais seleções do mesmo grupo têm a mesma pontuação, o sistema SHALL
desempatá-las nesta ordem exata: (1) pontos, (2) saldo de gols geral, (3) gols
marcados geral, (4) resultado dos confrontos diretos entre as seleções empatadas —
pontos, depois saldo, depois gols marcados nesses confrontos —, (5) posição no
ranking FIFA. O critério de fair play SHALL ser pulado, pois não há dados de cartões
disponíveis.

#### Scenario: Empate resolvido por saldo de gols geral
- **WHEN** duas seleções do grupo terminam com os mesmos pontos e saldos de gols
  diferentes
- **THEN** a seleção com maior saldo de gols fica na posição melhor da tabela

#### Scenario: Empate resolvido pelo confronto direto
- **WHEN** duas seleções do grupo terminam com os mesmos pontos, mesmo saldo de gols
  e mesmos gols marcados
- **THEN** o resultado do jogo entre as duas seleções decide qual fica na posição
  melhor da tabela

#### Scenario: Empate remanescente resolvido pelo ranking FIFA
- **WHEN** duas ou mais seleções permanecem empatadas após aplicar pontos, saldo de
  gols, gols marcados e o confronto direto entre elas
- **THEN** a seleção mais bem posicionada no ranking FIFA fica na posição melhor da
  tabela, incluindo quando uma das seleções não consta no ranking disponível — nesse
  caso ela SHALL ficar atrás de todas as seleções ranqueadas

### Requirement: Seleção dos 8 melhores terceiros colocados (RN-02)
O sistema SHALL comparar os 12 terceiros colocados (um de cada grupo) e ordená-los
por pontos, depois saldo de gols, depois gols marcados, depois ranking FIFA, marcando
os 8 melhores como classificados ao mata-mata.

#### Scenario: Terceiro colocado entre os 8 melhores
- **WHEN** um terceiro colocado tem pontuação entre as 8 mais altas dos 12 terceiros
- **THEN** o sistema marca essa seleção como classificada ao mata-mata

#### Scenario: Terceiro colocado fora dos 8 melhores
- **WHEN** um terceiro colocado tem pontuação fora das 8 mais altas dos 12 terceiros
- **THEN** o sistema marca essa seleção como eliminada, mesmo tendo terminado em
  terceiro no próprio grupo

### Requirement: Zona de classificação de uma seleção no grupo
O sistema SHALL classificar cada seleção do grupo em uma destas zonas: classificado
(1º ou 2º colocado, ou 3º colocado entre os 8 melhores terceiros), eliminado (4º
colocado, ou 3º colocado fora dos 8 melhores), ou indefinido enquanto o grupo não
estiver completo.

#### Scenario: Primeiro e segundo colocados sempre classificados
- **WHEN** o grupo está completo e uma seleção termina em 1º ou 2º lugar
- **THEN** o sistema marca essa seleção como classificada, independentemente do
  resultado dos terceiros colocados dos outros grupos

#### Scenario: Quarto colocado sempre eliminado
- **WHEN** o grupo está completo e uma seleção termina em 4º lugar
- **THEN** o sistema marca essa seleção como eliminada

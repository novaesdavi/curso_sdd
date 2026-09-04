# PRD — Copa do Mundo 2026 App
**Product Requirements Document**
Versão: 1.0 | Data: Abril 2026 | Status: Aprovado para desenvolvimento

---

## 1. Visão Geral do Produto

### 1.1 Descrição
Aplicação web completa dedicada à Copa do Mundo FIFA 2026, sediada nos EUA, Canadá e México. A plataforma oferece acompanhamento em tempo real dos jogos, classificação por grupos, elencos de seleções, simulador de bolão/chaveamento, escalação da Seleção Brasileira e uma landing page imersiva com contagem regressiva ao torneio.

### 1.2 Contexto do Torneio
- **Edição:** 23ª Copa do Mundo FIFA
- **Formato:** 48 seleções, 12 grupos de 4 equipes
- **Fase de grupos:** Top 2 de cada grupo + 8 melhores terceiros classificados avançam
- **Mata-mata:** Começa nas oitavas-de-final (32 equipes)
- **Total de jogos:** 104 partidas
- **Abertura:** 11 de junho de 2026 — Estádio Azteca, Cidade do México (México vs. África do Sul)
- **Final:** 19 de julho de 2026 — MetLife Stadium, Nova York (New Jersey)
- **Terceiro lugar:** 18 de julho de 2026 — Estádio de Miami

### 1.3 Público-Alvo
- Torcedores brasileiros e entusiastas do futebol
- Participantes de bolões esportivos
- Jornalistas e analistas esportivos
- Faixa etária: 16–55 anos

### 1.4 Objetivos de Negócio
1. Ser a referência de informação sobre a Copa 2026 em português
2. Engajar usuários com funcionalidades interativas (bolão, escalação)
3. Oferecer experiência fluida em mobile e desktop
4. Entregar uma plataforma de alta performance com dados precisos

---

## 2. Grupos da Copa do Mundo 2026

### Pote 1 — Cabeças de Chave
| Posição | Seleção | Grupo |
|---------|---------|-------|
| 1 | México (sede) | A |
| 2 | Canadá (sede) | B |
| 3 | Argentina | C |
| 4 | EUA (sede) | D |
| 5 | Alemanha | E |
| 6 | Holanda | F |
| 7 | Brasil | G |
| 8 | Espanha | H |
| 9 | França | I |
| 10 | Portugal | J |
| 11 | Inglaterra | K |
| 12 | Bélgica | L |

### Grupos Completos
| Grupo | Cabeça de Chave | Seleção 2 | Seleção 3 | Seleção 4 |
|-------|----------------|-----------|-----------|-----------|
| A | México | Coreia do Sul | República Tcheca | África do Sul |
| B | Canadá | Bósnia e Herzegovina | Catar | Suíça |
| C | Argentina | Croácia | Marrocos | Equador |
| D | EUA | Austrália | Paraguai | Turquia |
| E | Alemanha | Japão | Costa do Marfim | Curaçao |
| F | Holanda | Suécia | Tunísia | (a definir) |
| G | Brasil | Nigéria | Colômbia | Arábia Saudita |
| H | Espanha | Uruguai | Cabo Verde | (a definir) |
| I | França | Noruega | Senegal | Iraque |
| J | Portugal | Rep. Dem. Congo | Colômbia | Uzbequistão |
| K | Bélgica | Irã | Egito | Nova Zelândia |
| L | Inglaterra | Croácia | Gana | Panamá |

> **Nota:** Grupos F e H podem ter alterações conforme dados finais da FIFA. Os grupos acima refletem o sorteio de dezembro/2025 com atualizações de março/2026.

---

## 3. Requisitos Funcionais

### RF-01 — Landing Page

**Descrição:** Página inicial imersiva e atrativa, ponto de entrada para toda a aplicação.

**Funcionalidades:**
- **Countdown regressivo:** Contagem em tempo real (dias, horas, minutos, segundos) até o primeiro jogo da Copa (11 de junho de 2026, 17h horário de Brasília)
- **Hero section:** Visual impactante com tema da Copa 2026 ("We Are 26")
- **Destaques:** Cards com próximos jogos do dia e resultados recentes
- **Acesso rápido:** Atalhos para Tabela, Grupos, Brasil e Bolão
- **Stats:** Números da Copa (48 seleções, 16 cidades, 104 jogos)
- **Responsivo:** Adaptação completa para mobile

**Critérios de Aceite:**
- Countdown atualiza a cada segundo sem travamento
- Hero section carrega em menos de 2 segundos
- Navegação clara para todas as seções principais

---

### RF-02 — Tabela de Jogos

**Descrição:** Visualização completa de todas as 104 partidas do torneio.

**Funcionalidades:**
- Listagem de jogos filtráveis por: fase, grupo, data, seleção, sede/cidade
- Exibição por data com agrupamento visual
- Card de jogo com: seleção A vs. seleção B, data, horário (brasília), estádio, cidade, placar
- Status do jogo: Agendado / Em Andamento / Encerrado
- Indicação visual de resultado (vitória/empate/derrota)
- Navegação por semana/fase

**Critérios de Aceite:**
- Todos os 104 jogos exibidos corretamente
- Filtros funcionam combinados
- Placar editável via painel admin (SQLite)

---

### RF-03 — Classificação e Grupos

**Descrição:** Tabela de classificação de cada um dos 12 grupos com todas as informações estatísticas.

**Funcionalidades:**
- Cards de grupos (A a L) com classificação completa
- Colunas: Posição, Seleção, P (jogos), V (vitórias), E (empates), D (derrotas), GP (gols pró), GC (gols contra), SG (saldo de gols), Pts (pontos)
- Indicador visual de classificado (verde) / eliminado (vermelho) / indefinido
- Badge "Cabeça de Chave" na seleção do Pote 1
- Bandeiras das seleções
- Seção de potes com todas as 48 seleções distribuídas nos Potes 1–4
- Status: classificação atualizada conforme resultados no banco

**Critérios de Aceite:**
- 12 grupos exibidos corretamente
- Classificação calculada automaticamente com base nos resultados
- Regras de desempate FIFA aplicadas (saldo de gols > gols pró > confronto direto)

---

### RF-04 — Elencos das Seleções

**Descrição:** Visualização do elenco de todas as 48 seleções participantes.

**Funcionalidades:**
- Seleção de equipe via busca ou dropdown por grupo
- Card da seleção: bandeira, confederação, treinador, ranking FIFA
- Lista de jogadores com: número, nome, posição, clube, idade
- Filtro por posição (Goleiros, Zagueiros, Laterais, Meias, Atacantes)
- Destaque para capitão
- Seleção Brasileira com elenco detalhado pré-definido

**Critérios de Aceite:**
- Todas as 48 seleções acessíveis
- Brasil com elenco completo (23+ jogadores)
- Busca funcional por nome de seleção

---

### RF-05 — Escalação da Seleção Brasileira

**Descrição:** Ferramenta interativa para montar a escalação da Seleção Brasileira com drag & drop.

**Funcionalidades:**
- Campo de futebol visual interativo
- Seleção de formação tática: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 5-3-2, 4-1-4-1, 3-4-3
- Lista de convocados à esquerda (drag & drop ou clique para alocar)
- Posicionamento dos jogadores no campo (11 titulares + 12 reservas)
- Indicação automática de posição por jogador
- Salvar escalação (localStorage + SQLite)
- Compartilhar escalação (gerar imagem ou link)
- Aviso de formação inválida (ex: campo sem goleiro)

**Critérios de Aceite:**
- Mínimo 7 formações táticas disponíveis
- Drag & drop funcional em desktop; tap-to-place em mobile
- Validação: 11 jogadores diferentes para os 11 slots titulares
- Escalação salva persiste após reload

---

### RF-06 — Bolão e Simulador de Chaveamento

**Descrição:** Simulador completo que permite ao usuário definir placares e visualizar o chaveamento do torneio até a final.

**Funcionalidades:**

**Fase de Grupos:**
- Interface para palpitar placar de cada jogo dos grupos
- Cálculo automático de classificação baseado nos palpites
- Aplicação das regras FIFA de desempate
- Seleção dos 8 melhores terceiros colocados

**Mata-Mata (Oitavas → Final):**
- Chaveamento visual interativo (bracket)
- Definição de placar de cada confronto
- Prorrogação e pênaltis quando empate (toggle)
- Avanço automático do vencedor para a próxima fase
- Visualização do caminho até a final

**Gestão de Bolões:**
- Criar/editar múltiplos bolões salvos
- Nomear cada bolão (ex: "Meu palpite pessimista")
- Comparar resultados de diferentes bolões
- Percentual de acertos vs. resultados reais (quando disponíveis)

**Critérios de Aceite:**
- Chaveamento responde em menos de 500ms após inserção de placar
- Todas as fases do torneio navegáveis
- Dados persistidos no SQLite

---

### RF-07 — Painel Administrativo (backoffice básico)

**Descrição:** Interface simples para atualização de resultados sem acesso ao banco diretamente.

**Funcionalidades:**
- Autenticação básica (usuário/senha hardcoded)
- Atualizar placar de qualquer jogo
- Marcar jogo como "em andamento" / "encerrado"
- Visualizar e editar elencos

---

## 4. Requisitos Não-Funcionais

### RNF-01 — Performance
- Primeira renderização em < 3s em conexão 4G
- Banco SQLite com queries otimizadas (índices em datas, grupos, fases)
- Paginação em listagens com > 20 itens

### RNF-02 — Responsividade
- Mobile-first design
- Breakpoints: 320px, 768px, 1024px, 1440px
- Funcionalidades de drag & drop com fallback táctil

### RNF-03 — Banco de Dados
- SQLite (arquivo local, sem Docker, sem servidores externos)
- Arquivo único: `copa2026.db`
- Migrations versionadas
- Seed com todos os dados iniciais (grupos, jogos, elencos)

### RNF-04 — Tecnologias
- **Backend:** Python (FastAPI) ou Node.js (Express)
- **Frontend:** React + Tailwind CSS (ou HTML/CSS/JS vanilla para simplicidade)
- **Banco:** SQLite via `better-sqlite3` (Node) ou `sqlite3` (Python)
- **Linguagem:** Português (PT-BR) como padrão

### RNF-05 — Acessibilidade
- Contraste WCAG AA mínimo
- Alt text em todas as bandeiras/imagens
- Navegação por teclado nas principais interfaces

---

## 5. Modelo de Dados (SQLite)

### Tabelas Principais

```sql
-- Seleções
selecoes (id, nome, nome_pt, bandeira_emoji, confederacao, grupo, pote, eh_cabeca_chave, treinador, ranking_fifa)

-- Jogadores
jogadores (id, selecao_id, numero, nome, posicao, clube, idade, eh_capitao)

-- Jogos
jogos (id, fase, grupo, rodada, selecao_a_id, selecao_b_id, data_hora, estadio, cidade, pais_sede, gols_a, gols_b, status, penaltis_a, penaltis_b)

-- Classificação por grupo (calculada/materializada)
classificacao (id, selecao_id, grupo, pontos, jogos, vitorias, empates, derrotas, gols_pro, gols_contra, saldo_gols)

-- Bolões
boloes (id, nome, criado_em, usuario_session)

-- Palpites
palpites (id, bolao_id, jogo_id, gols_a, gols_b, penaltis_a, penaltis_b)

-- Escalações salvas
escalacoes (id, nome, formacao, jogadores_json, criado_em)
```

---

## 6. Fases do Torneio

| Fase | Times | Jogos | Datas |
|------|-------|-------|-------|
| Fase de Grupos | 48 (12 grupos × 4) | 48 jogos | 11 jun – 2 jul |
| Oitavas de Final | 32 | 16 jogos | 4 jul – 9 jul |
| Quartas de Final | 16 | 8 jogos | 11 jul – 13 jul |
| Semifinais | 8 | 4 jogos | 15 jul – 16 jul |
| 3º Lugar | 4 | 1 jogo | 18 jul (Miami) |
| Final | 2 | 1 jogo | 19 jul (Nova York) |

---

## 7. Cidades-Sede e Estádios

| Cidade | País | Estádio | Capacidade |
|--------|------|---------|-----------|
| Cidade do México | México | Estádio Azteca | 87.523 |
| Guadalajara | México | Estadio Akron | 49.850 |
| Monterrey | México | Estadio BBVA | 53.500 |
| Nova York/New Jersey | EUA | MetLife Stadium | 82.500 |
| Los Angeles | EUA | SoFi Stadium | 70.240 |
| Dallas | EUA | AT&T Stadium | 80.000 |
| San Francisco | EUA | Levi's Stadium | 68.500 |
| Seattle | EUA | Lumen Field | 69.000 |
| Boston | EUA | Gillette Stadium | 65.878 |
| Miami | EUA | Hard Rock Stadium | 65.326 |
| Filadélfia | EUA | Lincoln Financial Field | 69.176 |
| Kansas City | EUA | Arrowhead Stadium | 76.416 |
| Atlanta | EUA | Mercedes-Benz Stadium | 71.000 |
| Houston | EUA | NRG Stadium | 72.220 |
| Toronto | Canadá | BMO Field | 30.000* |
| Vancouver | Canadá | BC Place | 54.500 |

---

## 8. Elenco da Seleção Brasileira (referência)

| # | Nome | Posição | Clube |
|---|------|---------|-------|
| 1 | Ederson | Goleiro | Manchester City |
| 12 | Weverton | Goleiro | Palmeiras |
| 23 | Bento | Goleiro | Al-Qadsiah |
| 2 | Danilo | Lateral D | Flamengo |
| 3 | Guilherme Arana | Lateral E | Atlético MG |
| 4 | Marquinhos | Zagueiro | PSG |
| 5 | Gabriel Magalhães | Zagueiro | Arsenal |
| 6 | Éder Militão | Zagueiro | Real Madrid |
| 13 | Alex Telles | Lateral E | reserve |
| 22 | Vanderson | Lateral D | Monaco |
| 7 | Vinícius Jr. | Atacante | Real Madrid |
| 8 | Bruno Guimarães | Meia | Newcastle |
| 9 | Richarlison | Atacante | Tottenham |
| 10 | Neymar Jr. | Meia-atacante | Al-Hilal |
| 11 | Raphinha | Ponta E | Barcelona |
| 14 | Endrick | Atacante | Real Madrid |
| 15 | Casemiro | Volante | Manchester United |
| 16 | Gerson | Meia | Flamengo |
| 17 | Rodrygo | Meia-atacante | Real Madrid |
| 18 | Gabriel Martinelli | Atacante | Arsenal |
| 19 | Lucas Paquetá | Meia | West Ham |
| 20 | Savinho | Ponta D | Manchester City |
| 21 | Evanilson | Centroavante | Bournemouth |

---

## 9. Regras de Negócio

### RN-01 — Classificação de Grupos
Ordem de critérios:
1. Pontos
2. Saldo de gols
3. Gols marcados
4. Resultado do confronto direto
5. Saldo de gols nos confrontos diretos
6. Fair Play (cartões)
7. Ranking FIFA

### RN-02 — Avanço da Fase de Grupos
- 1º e 2º de cada grupo avançam automaticamente (24 times)
- Os 8 melhores entre os 12 terceiros colocados avançam (8 times)
- Total de 32 times nas oitavas

### RN-03 — Mata-Mata
- Em caso de empate no tempo normal: prorrogação (2 × 15 min)
- Se persistir empate: pênaltis
- Não há gol de ouro/prata

### RN-04 — Bolão
- Palpites salvos no SQLite associados a um session_id
- Múltiplos bolões por sessão permitidos
- Palpite sempre substitui o anterior para o mesmo jogo

---

## 10. Critérios de Sucesso

| Métrica | Meta |
|---------|------|
| Cobertura de jogos | 100% dos 104 jogos |
| Seleções com elenco | 48/48 |
| Formações táticas | ≥ 7 |
| Performance (LCP) | < 2.5s |
| Mobile-friendly | 100% das telas |
| Acessibilidade | WCAG AA |

---

## 11. Fora do Escopo (v1.0)

- Transmissão ao vivo de jogos
- Notificações push
- Chat ao vivo
- Integração com API de odds/apostas
- Perfis de usuários com autenticação completa (OAuth)
- Estatísticas avançadas por jogador (passes, chutes a gol, etc.)
- Versão nativa mobile (iOS/Android)

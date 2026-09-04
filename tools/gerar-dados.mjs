/**
 * Gerador de Seed do PortalCopa26
 * ---------------------------------
 * Le os arquivos de ./fontes (fonte da verdade) e emite os arquivos de dados
 * consumidos pelo prototipo em ./src/js/dados/.
 *
 * Uso: node tools/gerar-dados.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raizProjeto = join(dirname(fileURLToPath(import.meta.url)), '..');
const pastaFontes = join(raizProjeto, 'fontes');
const pastaDados = join(raizProjeto, 'src', 'js', 'dados');

const ler = (arquivo) => readFileSync(join(pastaFontes, arquivo), 'utf8').replace(/\r\n/g, '\n');

const avisos = [];
const avisar = (msg) => avisos.push(msg);

// ---------------------------------------------------------------------------
// 1. Normalizacao de nomes
// ---------------------------------------------------------------------------

const chave = (texto) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/**
 * Cadastro canonico das 48 selecoes.
 * nome  -> nome de exibicao (PT-BR)
 * cod   -> codigo FIFA de 3 letras (usado nas bandeiras da API da FIFA)
 * conf  -> confederacao
 * alias -> variacoes encontradas nos arquivos de origem
 */
const SELECOES = [
  { cod: 'MEX', nome: 'México', conf: 'CONCACAF', alias: [] },
  { cod: 'RSA', nome: 'África do Sul', conf: 'CAF', alias: [] },
  { cod: 'KOR', nome: 'Coreia do Sul', conf: 'AFC', alias: ['República da Coreia'] },
  { cod: 'CZE', nome: 'Tchéquia', conf: 'UEFA', alias: ['República Tcheca', 'República Tchéquia'] },
  { cod: 'CAN', nome: 'Canadá', conf: 'CONCACAF', alias: [] },
  { cod: 'BIH', nome: 'Bósnia e Herzegovina', conf: 'UEFA', alias: ['Bósnia'] },
  { cod: 'QAT', nome: 'Catar', conf: 'AFC', alias: [] },
  { cod: 'SUI', nome: 'Suíça', conf: 'UEFA', alias: [] },
  { cod: 'BRA', nome: 'Brasil', conf: 'CONMEBOL', alias: [] },
  { cod: 'MAR', nome: 'Marrocos', conf: 'CAF', alias: [] },
  { cod: 'HAI', nome: 'Haiti', conf: 'CONCACAF', alias: [] },
  { cod: 'SCO', nome: 'Escócia', conf: 'UEFA', alias: [] },
  { cod: 'USA', nome: 'Estados Unidos', conf: 'CONCACAF', alias: ['EUA'] },
  { cod: 'PAR', nome: 'Paraguai', conf: 'CONMEBOL', alias: [] },
  { cod: 'AUS', nome: 'Austrália', conf: 'AFC', alias: [] },
  { cod: 'TUR', nome: 'Turquia', conf: 'UEFA', alias: ['Türkiye'] },
  { cod: 'GER', nome: 'Alemanha', conf: 'UEFA', alias: [] },
  { cod: 'CUW', nome: 'Curaçao', conf: 'CONCACAF', alias: ['Curaçau'] },
  { cod: 'CIV', nome: 'Costa do Marfim', conf: 'CAF', alias: ["Côte d'Ivoire"] },
  { cod: 'ECU', nome: 'Equador', conf: 'CONMEBOL', alias: [] },
  { cod: 'NED', nome: 'Holanda', conf: 'UEFA', alias: ['Países Baixos'] },
  { cod: 'JPN', nome: 'Japão', conf: 'AFC', alias: [] },
  { cod: 'SWE', nome: 'Suécia', conf: 'UEFA', alias: [] },
  { cod: 'TUN', nome: 'Tunísia', conf: 'CAF', alias: [] },
  { cod: 'BEL', nome: 'Bélgica', conf: 'UEFA', alias: [] },
  { cod: 'EGY', nome: 'Egito', conf: 'CAF', alias: [] },
  { cod: 'IRN', nome: 'Irã', conf: 'AFC', alias: ['República Islâmica do Irã'] },
  { cod: 'NZL', nome: 'Nova Zelândia', conf: 'OFC', alias: [] },
  { cod: 'ESP', nome: 'Espanha', conf: 'UEFA', alias: [] },
  { cod: 'CPV', nome: 'Cabo Verde', conf: 'CAF', alias: [] },
  { cod: 'KSA', nome: 'Arábia Saudita', conf: 'AFC', alias: [] },
  { cod: 'URU', nome: 'Uruguai', conf: 'CONMEBOL', alias: [] },
  { cod: 'FRA', nome: 'França', conf: 'UEFA', alias: [] },
  { cod: 'SEN', nome: 'Senegal', conf: 'CAF', alias: [] },
  { cod: 'IRQ', nome: 'Iraque', conf: 'AFC', alias: [] },
  { cod: 'NOR', nome: 'Noruega', conf: 'UEFA', alias: [] },
  { cod: 'ARG', nome: 'Argentina', conf: 'CONMEBOL', alias: [] },
  { cod: 'ALG', nome: 'Argélia', conf: 'CAF', alias: [] },
  { cod: 'AUT', nome: 'Áustria', conf: 'UEFA', alias: [] },
  { cod: 'JOR', nome: 'Jordânia', conf: 'AFC', alias: [] },
  { cod: 'POR', nome: 'Portugal', conf: 'UEFA', alias: [] },
  { cod: 'COD', nome: 'RD Congo', conf: 'CAF', alias: ['República Democrática do Congo', 'ReD do Congo', 'RD do Congo'] },
  { cod: 'UZB', nome: 'Uzbequistão', conf: 'AFC', alias: [] },
  { cod: 'COL', nome: 'Colômbia', conf: 'CONMEBOL', alias: [] },
  { cod: 'ENG', nome: 'Inglaterra', conf: 'UEFA', alias: [] },
  { cod: 'CRO', nome: 'Croácia', conf: 'UEFA', alias: [] },
  { cod: 'GHA', nome: 'Gana', conf: 'CAF', alias: [] },
  { cod: 'PAN', nome: 'Panamá', conf: 'CONCACAF', alias: [] },
];

const indiceSelecoes = new Map();
for (const s of SELECOES) {
  indiceSelecoes.set(chave(s.nome), s.cod);
  for (const a of s.alias) indiceSelecoes.set(chave(a), s.cod);
}

const codDe = (nome, contexto = '') => {
  const cod = indiceSelecoes.get(chave(nome));
  if (!cod) avisar(`Selecao nao reconhecida: "${nome}" ${contexto}`);
  return cod ?? null;
};

// ---------------------------------------------------------------------------
// 2. Grupos e potes  (transcrito de fontes/copa2026_grupos.txt)
//    Coluna 1 = cabeca de chave (Pote 1); colunas 2..4 = Potes 2, 3 e 4.
// ---------------------------------------------------------------------------

const GRUPOS = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'República Tcheca'],
  B: ['Canadá', 'Bósnia e Herzegovina', 'Catar', 'Suíça'],
  C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  D: ['Estados Unidos', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Curaçao', 'Costa do Marfim', 'Equador'],
  F: ['Holanda', 'Japão', 'Suécia', 'Tunísia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
  I: ['França', 'Senegal', 'Iraque', 'Noruega'],
  J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  K: ['Portugal', 'RD Congo', 'Uzbequistão', 'Colômbia'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá'],
};

const infoSelecao = new Map(
  SELECOES.map((s) => [s.cod, { ...s, alias: undefined, grupo: null, pote: null, cabecaDeChave: false }])
);

for (const [grupo, nomes] of Object.entries(GRUPOS)) {
  nomes.forEach((nome, i) => {
    const cod = codDe(nome, `(grupo ${grupo})`);
    if (!cod) return;
    const info = infoSelecao.get(cod);
    info.grupo = grupo;
    info.pote = i + 1;
    info.cabecaDeChave = i === 0;
  });
}

for (const [cod, info] of infoSelecao) {
  if (!info.grupo) avisar(`Selecao sem grupo definido: ${cod}`);
}

// ---------------------------------------------------------------------------
// 3. Tecnicos  (fontes/copa2026_pais_tecnicos.txt)
// ---------------------------------------------------------------------------

for (const linha of ler('copa2026_pais_tecnicos.txt').split('\n')) {
  if (!linha.includes('|')) continue;
  const [pais, tecnico] = linha.split('|').map((t) => t.trim());
  const cod = codDe(pais, '(tecnicos)');
  if (cod) infoSelecao.get(cod).tecnico = tecnico;
}
for (const [cod, info] of infoSelecao) {
  if (!info.tecnico) avisar(`Selecao sem tecnico: ${cod}`);
}

// ---------------------------------------------------------------------------
// 4. Ranking FIFA  (fontes/copa2026_ranking_fifa.txt)
// ---------------------------------------------------------------------------

const ranking = [];
for (const linha of ler('copa2026_ranking_fifa.txt').split('\n')) {
  // Formato: "1<TAB>Argentina<TAB>1877.72" -- ha casos sem separador
  // ("República Tcheca1510.15"), por isso a captura por regex.
  const m = linha.match(/^\s*(\d{1,3})\s+(.+?)\s*(\d{3,4}\.\d{1,2})\s*$/);
  if (!m) continue;
  const [, posicao, nomeBruto, pontos] = m;
  const nome = nomeBruto.trim();
  const cod = indiceSelecoes.get(chave(nome)) ?? null;
  ranking.push({
    posicao: Number(posicao),
    nome,
    cod,
    pontos: Number(pontos),
    naCopa: Boolean(cod),
  });
}

const rankingPorCod = new Map(ranking.filter((r) => r.cod).map((r) => [r.cod, r]));
const piorRanking = ranking.length + 1;
for (const [cod, info] of infoSelecao) {
  const r = rankingPorCod.get(cod);
  info.rankingPosicao = r ? r.posicao : null;
  info.rankingPontos = r ? r.pontos : null;
  // Usado como ultimo critério de desempate (RN-01, item 7).
  info.rankingOrdem = r ? r.posicao : piorRanking;
}

// ---------------------------------------------------------------------------
// 5. Estadios / cidades-sede  (fontes/copa2026_cidades_sede_estadios.txt)
// ---------------------------------------------------------------------------

const ESTADIOS = [
  { id: 'cidade-do-mexico', cidade: 'Cidade do México', pais: 'México', estadio: 'Estádio Azteca', capacidade: 87523, alias: ['Estádio da Cidade do México', 'Azteca'] },
  { id: 'guadalajara', cidade: 'Guadalajara', pais: 'México', estadio: 'Estadio Akron', capacidade: 49850, alias: ['Estádio de Guadalajara', 'Estádio Guadalajara'] },
  { id: 'monterrey', cidade: 'Monterrey', pais: 'México', estadio: 'Estadio BBVA', capacidade: 53500, alias: ['Estádio de Monterrey'] },
  { id: 'nova-york', cidade: 'Nova York/Nova Jersey', pais: 'Estados Unidos', estadio: 'MetLife Stadium', capacidade: 82500, alias: ['Estádio de Nova Iorque/Nova Jersey', 'Nova Iorque', 'Nova Iorque/Nova Jersey', 'Nova Jersey', 'Nova York'] },
  { id: 'los-angeles', cidade: 'Los Angeles', pais: 'Estados Unidos', estadio: 'SoFi Stadium', capacidade: 70240, alias: ['Estádio de Los Angeles'] },
  { id: 'dallas', cidade: 'Dallas', pais: 'Estados Unidos', estadio: 'AT&T Stadium', capacidade: 80000, alias: ['Estádio de Dallas'] },
  { id: 'san-francisco', cidade: 'San Francisco (Área da Baía)', pais: 'Estados Unidos', estadio: "Levi's Stadium", capacidade: 68500, alias: ['Santa Clara', 'Estádio de Santa Clara', 'San Francisco'] },
  { id: 'seattle', cidade: 'Seattle', pais: 'Estados Unidos', estadio: 'Lumen Field', capacidade: 69000, alias: ['Estádio de Seattle', 'Seattle Field'] },
  { id: 'boston', cidade: 'Boston', pais: 'Estados Unidos', estadio: 'Gillette Stadium', capacidade: 65878, alias: ['Estádio de Boston'] },
  { id: 'miami', cidade: 'Miami', pais: 'Estados Unidos', estadio: 'Hard Rock Stadium', capacidade: 65326, alias: ['Estádio de Miami'] },
  { id: 'filadelfia', cidade: 'Filadélfia', pais: 'Estados Unidos', estadio: 'Lincoln Financial Field', capacidade: 69176, alias: ['Estádio da Filadélfia'] },
  { id: 'kansas-city', cidade: 'Kansas City', pais: 'Estados Unidos', estadio: 'Arrowhead Stadium', capacidade: 76416, alias: ['Estádio de Kansas City'] },
  { id: 'atlanta', cidade: 'Atlanta', pais: 'Estados Unidos', estadio: 'Mercedes-Benz Stadium', capacidade: 71000, alias: ['Estádio de Atlanta'] },
  { id: 'houston', cidade: 'Houston', pais: 'Estados Unidos', estadio: 'NRG Stadium', capacidade: 72220, alias: ['Estádio de Houston'] },
  { id: 'toronto', cidade: 'Toronto', pais: 'Canadá', estadio: 'BMO Field', capacidade: 30000, alias: ['Estádio de Toronto'] },
  { id: 'vancouver', cidade: 'Vancouver', pais: 'Canadá', estadio: 'BC Place', capacidade: 54500, alias: ['Estádio de Vancouver', 'Vancouver Place'] },
];

const indiceEstadios = new Map();
for (const e of ESTADIOS) {
  indiceEstadios.set(chave(e.cidade), e.id);
  indiceEstadios.set(chave(e.estadio), e.id);
  for (const a of e.alias) indiceEstadios.set(chave(a), e.id);
}
const estadioDe = (texto, contexto = '') => {
  const id = indiceEstadios.get(chave(texto));
  if (!id) avisar(`Estádio/cidade nao reconhecido: "${texto}" ${contexto}`);
  return id ?? null;
};

// ---------------------------------------------------------------------------
// 6. Jogos da fase de grupos  (fontes/copa2026_jogos_primeira_fase.txt)
// ---------------------------------------------------------------------------

const MESES = {
  janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

const pad = (n) => String(n).padStart(2, '0');
const isoData = (ano, mes, dia) => `${ano}-${pad(mes)}-${pad(dia)}`;

const jogos = [];
let numeroJogo = 0;

const novoJogo = (dados) => {
  numeroJogo += 1;
  jogos.push({ numero: numeroJogo, placarMandante: null, placarVisitante: null, status: 'Agendado', ...dados });
  return jogos[jogos.length - 1];
};

{
  const linhas = ler('copa2026_jogos_primeira_fase.txt').split('\n');
  let diaTabela = null; // dia da tabela (cabecalho), usado para o agrupamento visual
  let pendente = null;

  const reCabecalho = /^([\p{L}-]+)\s+(\d{1,2})\s+(\p{L}+)\s+(\d{4})\s*$/u;
  const reJogo = /^(.+?)\s+x\s+(.+?)\s{2,}(\d{1,2}):(\d{2})\s*hs(?:\s*\((\d{1,2})\s+de\s+(\p{L}+)\))?\s*$/u;
  const reDetalhe = /^(.+?)\s*·\s*Grupo\s+([A-L])\s*·\s*(.+?)\s*\(([^)]+)\)\s*$/;

  for (const linhaBruta of linhas) {
    const linha = linhaBruta.trim();
    if (!linha || /^-+$/.test(linha)) continue;

    const cab = linha.match(reCabecalho);
    if (cab && MESES[cab[3].toLowerCase()]) {
      diaTabela = {
        diaSemana: cab[1].toLowerCase(),
        dia: Number(cab[2]),
        mes: MESES[cab[3].toLowerCase()],
        ano: Number(cab[4]),
      };
      continue;
    }

    const jogo = linha.match(reJogo);
    if (jogo) {
      pendente = {
        mandante: jogo[1].trim(),
        visitante: jogo[2].trim(),
        hora: `${pad(jogo[3])}:${jogo[4]}`,
        diaReal: jogo[5] ? Number(jogo[5]) : diaTabela.dia,
        mesReal: jogo[6] ? MESES[jogo[6].toLowerCase()] : diaTabela.mes,
        diaTabela: { ...diaTabela },
      };
      continue;
    }

    const det = linha.match(reDetalhe);
    if (det && pendente) {
      novoJogo({
        id: `G${String(numeroJogo + 1).padStart(2, '0')}`,
        fase: 'grupos',
        grupo: det[2],
        mandante: codDe(pendente.mandante, '(jogos grupos)'),
        visitante: codDe(pendente.visitante, '(jogos grupos)'),
        mandanteRef: null,
        visitanteRef: null,
        data: isoData(pendente.diaTabela.ano, pendente.mesReal, pendente.diaReal),
        hora: pendente.hora,
        diaTabela: isoData(pendente.diaTabela.ano, pendente.diaTabela.mes, pendente.diaTabela.dia),
        estadio: estadioDe(det[4], '(jogos grupos)'),
      });
      pendente = null;
      continue;
    }

    avisar(`Linha nao interpretada (primeira fase): "${linha}"`);
  }
}

// ---------------------------------------------------------------------------
// 7. Segunda fase / Rodada de 32  (fontes/copa2026_Jogos_Segunda_fase.txt)
// ---------------------------------------------------------------------------

// As chaves usam o nome da fase normalizado (sem acentos/espacos), pois e assim
// que os arquivos de mata-mata referenciam os confrontos anteriores
// (ex.: "Venc. Segundafase 1", "Perd. Semifinal 2").
const chaveamento = { segundafase: new Map() };

{
  const blocos = ler('copa2026_Jogos_Segunda_fase.txt')
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const bloco of blocos) {
    const linhas = bloco.split('\n').map((l) => l.trim()).filter(Boolean);
    if (linhas.length < 3) continue;

    const ordem = Number(linhas[0].match(/(\d+)\s*$/)?.[1]);
    const loc = linhas[1].match(/^(.+?)\s{2,}(\d{1,2})\/(\d{1,2})\s+(\S+)\s+(\d{1,2}):(\d{2})\s*$/);
    const conf = linhas[2].split(/\s+x\s+/i).map((t) => t.trim());

    if (!ordem || !loc || conf.length !== 2) {
      avisar(`Bloco nao interpretado (segunda fase): "${bloco.replace(/\n/g, ' | ')}"`);
      continue;
    }

    const jogo = novoJogo({
      id: `SF${pad(ordem)}`,
      fase: 'segunda-fase',
      ordem,
      grupo: null,
      mandante: codDe(conf[0], '(segunda fase)'),
      visitante: codDe(conf[1], '(segunda fase)'),
      mandanteRef: null,
      visitanteRef: null,
      data: isoData(2026, Number(loc[3]), Number(loc[2])),
      hora: `${pad(loc[5])}:${loc[6]}`,
      diaTabela: isoData(2026, Number(loc[3]), Number(loc[2])),
      estadio: estadioDe(loc[1], '(segunda fase)'),
    });
    chaveamento.segundafase.set(ordem, jogo.id);
  }
}

// ---------------------------------------------------------------------------
// 8. Mata-mata (oitavas -> final): confrontos definidos por referencia
// ---------------------------------------------------------------------------

/**
 * Interpreta "Venc. Segundafase 1" / "Perd. Semifinal 2" em uma referencia
 * { tipo: 'vencedor'|'perdedor', jogo: '<id>' }.
 */
const referencia = (texto, mapas) => {
  const m = texto.match(/^(Venc\.?|Perd\.?)\s*(.+?)\s*(\d+)$/i);
  if (!m) {
    avisar(`Referencia de confronto nao interpretada: "${texto}"`);
    return null;
  }
  const tipo = /^venc/i.test(m[1]) ? 'vencedor' : 'perdedor';
  const faseChave = chave(m[2]).replace(/\s+/g, '');
  const ordem = Number(m[3]);
  const mapa = mapas[faseChave];
  if (!mapa || !mapa.has(ordem)) {
    avisar(`Referencia sem jogo correspondente: "${texto}"`);
    return null;
  }
  return { tipo, jogo: mapa.get(ordem) };
};

const lerFaseMataMata = ({ arquivo, fase, prefixoId, rotuloFonte, comAno = 2026 }) => {
  const blocos = ler(arquivo).split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const mapa = new Map();

  for (const bloco of blocos) {
    const linhas = bloco.split('\n').map((l) => l.trim()).filter(Boolean);
    if (linhas.length < 3) continue;

    const ordem = Number(linhas[0].match(/(\d+)\s*$/)?.[1]) || 1;
    // "Filadélfia 04/07 Sábado 18:00"  |  "Miami 18/07" + "Sábado as 18:00 hs"
    const restante = linhas.slice(1, -1).join(' ');
    const mData = restante.match(/(\d{1,2})\/(\d{1,2})/);
    const mHora = restante.match(/(\d{1,2}):(\d{2})/);
    const local = restante.split(/\s+\d{1,2}\//)[0].trim();
    const conf = linhas[linhas.length - 1].split(/\s+x\s+/i).map((t) => t.trim());

    if (!mData || !mHora || conf.length !== 2) {
      avisar(`Bloco nao interpretado (${fase}): "${bloco.replace(/\n/g, ' | ')}"`);
      continue;
    }

    const jogo = novoJogo({
      id: `${prefixoId}${pad(ordem)}`,
      fase,
      ordem,
      grupo: null,
      mandante: null,
      visitante: null,
      mandanteRef: referencia(conf[0], chaveamento),
      visitanteRef: referencia(conf[1], chaveamento),
      data: isoData(comAno, Number(mData[2]), Number(mData[1])),
      hora: `${pad(mHora[1])}:${mHora[2]}`,
      diaTabela: isoData(comAno, Number(mData[2]), Number(mData[1])),
      estadio: estadioDe(local, `(${fase})`),
      rotuloFonte: `${rotuloFonte} ${ordem}`,
    });
    mapa.set(ordem, jogo.id);
  }
  return mapa;
};

chaveamento['oitavas'] = lerFaseMataMata({
  arquivo: 'copa2026_jogos_oitavas.txt', fase: 'oitavas', prefixoId: 'OI', rotuloFonte: 'Oitavas',
});
chaveamento['quartas'] = lerFaseMataMata({
  arquivo: 'copa2026_jogos_quartas.txt', fase: 'quartas', prefixoId: 'QF', rotuloFonte: 'Quartas',
});
chaveamento['semifinal'] = lerFaseMataMata({
  arquivo: 'copa2026_jogos_semifinal.txt', fase: 'semifinal', prefixoId: 'SM', rotuloFonte: 'Semifinal',
});
chaveamento['terceirolugar'] = lerFaseMataMata({
  arquivo: 'copa2026_jogo_terceiro_lugar.txt', fase: 'terceiro-lugar', prefixoId: 'TL', rotuloFonte: 'Terceiro lugar',
});
chaveamento['final'] = lerFaseMataMata({
  arquivo: 'copa2026_jogo_final.txt', fase: 'final', prefixoId: 'FI', rotuloFonte: 'Final',
});

// Ordena por data/hora e reatribui a numeracao sequencial do torneio.
const ORDEM_FASES = ['grupos', 'segunda-fase', 'oitavas', 'quartas', 'semifinal', 'terceiro-lugar', 'final'];
jogos.sort((a, b) => {
  const f = ORDEM_FASES.indexOf(a.fase) - ORDEM_FASES.indexOf(b.fase);
  if (f !== 0) return f;
  return `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`);
});
jogos.forEach((j, i) => { j.numero = i + 1; });

// ---------------------------------------------------------------------------
// 9. Elencos  (fontes/copa2026_selecoes_jogadores.txt)
//    Formato: "# Selecao" seguido de "Nome|Idade|Posicao|Gols"
// ---------------------------------------------------------------------------

const POSICOES = {
  goleiro: 'Goleiro',
  defensor: 'Defensor',
  'meio campista': 'Meio-campista',
  atacante: 'Atacante',
};

const elencos = new Map(SELECOES.map((s) => [s.cod, []]));

{
  let codAtual = null;
  for (const linhaBruta of ler('copa2026_selecoes_jogadores.txt').split('\n')) {
    const linha = linhaBruta.trim();
    if (!linha) continue;

    if (linha.startsWith('#')) {
      codAtual = codDe(linha.replace(/^#\s*/, ''), '(elencos)');
      continue;
    }
    if (!codAtual) continue;

    const partes = linha.split('|').map((p) => p.trim());
    if (partes.length < 4) {
      avisar(`Linha de jogador nao interpretada: "${linha}"`);
      continue;
    }
    const [nome, idade, posicao, gols] = partes;
    elencos.get(codAtual).push({
      nome,
      idade: Number(idade),
      posicao: POSICOES[chave(posicao)] ?? posicao,
      gols: Number(gols),
      clube: null,
      clubePais: null,
    });
  }
}

// ---------------------------------------------------------------------------
// 10. Clubes  (fontes/selecoes_jogadores_convocados.txt)
//     Enriquece o elenco com o clube de cada jogador convocado.
// ---------------------------------------------------------------------------

const limparNomeJogador = (bruto) =>
  bruto
    .replace(/"[^"]*"/g, '')       // apelidos entre aspas
    .replace(/[“”][^“”]*[“”]/g, '')
    .replace(/^[\s,;.]*(?:e\s+)?/i, '')
    .replace(/[\s,;.]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

const separarClube = (bruto) => {
  const texto = bruto.trim().replace(/-+$/, '');
  const m = texto.match(/^(.*?)[-_]([A-Za-z]{2,4})$/);
  if (m && /^[A-Za-z]{3}$/.test(m[2])) return { clube: m[1].trim(), pais: m[2].toUpperCase() };
  return { clube: texto, pais: null };
};

{
  const linhas = ler('selecoes_jogadores_convocados.txt').split('\n');
  const reCategoria = /^(Goleiros|Defensores|Laterais|Zagueiros|Meio-campistas|Meio-campeistas|Volantes|Atacantes)\s*:/i;
  let codAtual = null;
  const clubesPorSelecao = new Map();

  for (const linhaBruta of linhas) {
    const linha = linhaBruta.trim();
    if (!linha) continue;
    if (/^Grupo\s+[A-L]$/i.test(linha)) continue;
    if (/^Confira as selecoes/i.test(chave(linha))) continue;

    if (!reCategoria.test(linha)) {
      const cod = indiceSelecoes.get(chave(linha));
      if (cod) {
        codAtual = cod;
        if (!clubesPorSelecao.has(cod)) clubesPorSelecao.set(cod, new Map());
      }
      continue;
    }
    if (!codAtual) continue;

    const conteudo = linha.replace(reCategoria, '');
    const mapa = clubesPorSelecao.get(codAtual);
    let cursor = 0;
    const re = /\(([^)]*)\)/g;
    let m;
    while ((m = re.exec(conteudo)) !== null) {
      const nome = limparNomeJogador(conteudo.slice(cursor, m.index));
      cursor = re.lastIndex;
      if (!nome) continue;
      mapa.set(chave(nome), separarClube(m[1]));
    }
  }

  // Casamento dos nomes: exato -> ultimo sobrenome + inicial -> sobrenome unico
  let comClube = 0;
  let semClube = 0;

  for (const [cod, jogadores] of elencos) {
    const mapa = clubesPorSelecao.get(cod) ?? new Map();
    const porSobrenome = new Map();
    for (const [k, v] of mapa) {
      const tokens = k.split(' ');
      const sobrenome = tokens[tokens.length - 1];
      if (!porSobrenome.has(sobrenome)) porSobrenome.set(sobrenome, []);
      porSobrenome.get(sobrenome).push({ k, v });
    }

    for (const jogador of jogadores) {
      const k = chave(jogador.nome);
      let achado = mapa.get(k);

      if (!achado) {
        const tokens = k.split(' ');
        const sobrenome = tokens[tokens.length - 1];
        const candidatos = porSobrenome.get(sobrenome) ?? [];
        if (candidatos.length === 1) {
          achado = candidatos[0].v;
        } else if (candidatos.length > 1) {
          const igualInicial = candidatos.filter((c) => c.k[0] === k[0]);
          if (igualInicial.length === 1) achado = igualInicial[0].v;
        }
      }

      if (achado) {
        jogador.clube = achado.clube;
        jogador.clubePais = achado.pais;
        comClube += 1;
      } else {
        semClube += 1;
      }
    }
  }
  avisar(`Clubes vinculados: ${comClube} jogadores; sem clube na fonte: ${semClube}.`);
}

// ---------------------------------------------------------------------------
// 11. Participacoes em Copas (estimativa)
//     As fontes nao informam esse dado. Para atender ao PRD (secao 8), o valor
//     e DERIVADO da idade: conta as Copas de 2010/2014/2018/2022 nas quais o
//     jogador teria pelo menos 21 anos. A interface rotula como estimativa.
// ---------------------------------------------------------------------------

const COPAS_ANTERIORES = [2010, 2014, 2018, 2022];
const ANO_COPA = 2026;
const IDADE_MINIMA = 21;

for (const jogadores of elencos.values()) {
  for (const j of jogadores) {
    j.copasEstimadas = COPAS_ANTERIORES.filter(
      (ano) => j.idade - (ANO_COPA - ano) >= IDADE_MINIMA
    ).length;
  }
}

// ---------------------------------------------------------------------------
// 12. Emissao dos arquivos
// ---------------------------------------------------------------------------

const cabecalhoArquivo = (titulo, origem) => `/**
 * ${titulo}
 * ARQUIVO GERADO AUTOMATICAMENTE -- nao edite a mao.
 * Origem: ${origem}
 * Gerador: tools/gerar-dados.mjs
 */
`;

const escrever = (arquivo, conteudo) => {
  mkdirSync(pastaDados, { recursive: true });
  writeFileSync(join(pastaDados, arquivo), conteudo, 'utf8');
};

const json = (valor) => JSON.stringify(valor, null, 2);

const selecoesSaida = SELECOES.map((s) => {
  const info = infoSelecao.get(s.cod);
  return {
    cod: s.cod,
    nome: info.nome,
    grupo: info.grupo,
    pote: info.pote,
    cabecaDeChave: info.cabecaDeChave,
    confederacao: info.conf,
    tecnico: info.tecnico ?? null,
    rankingPosicao: info.rankingPosicao,
    rankingPontos: info.rankingPontos,
    rankingOrdem: info.rankingOrdem,
    bandeira: `https://api.fifa.com/api/v3/picture/flags-sq-4/${s.cod}`,
  };
}).sort((a, b) => (a.grupo + a.pote).localeCompare(b.grupo + b.pote));

escrever('selecoes.js', `${cabecalhoArquivo(
  'Selecoes participantes da Copa do Mundo FIFA 2026',
  'fontes/copa2026_grupos.txt, copa2026_cabecas-chave.txt, copa2026_pais_tecnicos.txt, copa2026_ranking_fifa.txt'
)}window.COPA26_SELECOES = ${json(selecoesSaida)};
`);

escrever('estadios.js', `${cabecalhoArquivo(
  'Cidades-sede e estadios',
  'fontes/copa2026_cidades_sede_estadios.txt, copa2026_estadios.txt'
)}window.COPA26_ESTADIOS = ${json(ESTADIOS.map(({ alias, ...e }) => e))};
`);

escrever('jogos.js', `${cabecalhoArquivo(
  'Jogos da Copa do Mundo FIFA 2026 (horarios de Brasilia)',
  'fontes/copa2026_jogos_primeira_fase.txt, copa2026_Jogos_Segunda_fase.txt, copa2026_jogos_oitavas.txt, copa2026_jogos_quartas.txt, copa2026_jogos_semifinal.txt, copa2026_jogo_terceiro_lugar.txt, copa2026_jogo_final.txt'
)}window.COPA26_JOGOS = ${json(jogos)};
`);

escrever('ranking.js', `${cabecalhoArquivo(
  'Ranking FIFA',
  'fontes/copa2026_ranking_fifa.txt'
)}window.COPA26_RANKING = ${json(ranking)};
`);

const jogadoresSaida = {};
for (const [cod, jogadores] of elencos) jogadoresSaida[cod] = jogadores;

escrever('jogadores.js', `${cabecalhoArquivo(
  'Elencos das 48 selecoes',
  'fontes/copa2026_selecoes_jogadores.txt (nome, idade, posicao, gols) + selecoes_jogadores_convocados.txt (clubes)'
)}window.COPA26_JOGADORES = ${json(jogadoresSaida)};
`);

// ---------------------------------------------------------------------------
// 13. Relatorio
// ---------------------------------------------------------------------------

const contarFase = (fase) => jogos.filter((j) => j.fase === fase).length;
const totalJogadores = [...elencos.values()].reduce((s, l) => s + l.length, 0);

console.log('--- PortalCopa26 :: geracao de dados ---');
console.log(`Selecoes .......... ${selecoesSaida.length}`);
console.log(`Grupos ............ ${Object.keys(GRUPOS).length}`);
console.log(`Estadios/cidades .. ${ESTADIOS.length}`);
console.log(`Ranking FIFA ...... ${ranking.length} posicoes (${ranking.filter((r) => r.naCopa).length} na Copa)`);
console.log(`Jogadores ......... ${totalJogadores}`);
console.log('Jogos:');
for (const f of ORDEM_FASES) console.log(`  ${f.padEnd(16, '.')} ${contarFase(f)}`);
console.log(`  ${'TOTAL'.padEnd(16, '.')} ${jogos.length}`);

const semSelecao = jogos.filter((j) => j.fase !== 'grupos' && j.fase !== 'segunda-fase' ? false : !j.mandante || !j.visitante);
if (semSelecao.length) console.log(`\n[ERRO] ${semSelecao.length} jogo(s) com selecao nao resolvida`);
const semRef = jogos.filter((j) => ['oitavas', 'quartas', 'semifinal', 'terceiro-lugar', 'final'].includes(j.fase) && (!j.mandanteRef || !j.visitanteRef));
if (semRef.length) console.log(`[ERRO] ${semRef.length} jogo(s) de mata-mata sem referencia resolvida`);

if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}):`);
  for (const a of avisos) console.log(`  - ${a}`);
}

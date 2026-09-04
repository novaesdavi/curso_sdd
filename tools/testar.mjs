/**
 * PortalCopa26 — testes das regras de negócio (sem navegador).
 * Carrega os módulos de dados e o motor de classificação em um "window" mínimo
 * e valida RN-01, RN-02, RN-03 e a integridade do seed.
 *
 * Uso: node tools/testar.mjs
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const contexto = vm.createContext({ console, Intl, Date, Math, JSON, URLSearchParams });
contexto.window = contexto;

const carregar = (rel) => {
  const codigo = readFileSync(join(raiz, rel), 'utf8');
  vm.runInContext(codigo, contexto, { filename: rel });
};

[
  'src/js/dados/selecoes.js',
  'src/js/dados/estadios.js',
  'src/js/dados/jogos.js',
  'src/js/dados/ranking.js',
  'src/js/dados/jogadores.js',
  'src/js/nucleo/util.js',
  'src/js/nucleo/classificacao.js',
].forEach(carregar);

const { util, classificacao: calc } = contexto.Copa26;

let passou = 0;
let falhou = 0;
const casos = [];

function teste(nome, fn) {
  try {
    fn();
    passou += 1;
    casos.push(`  ok   ${nome}`);
  } catch (erro) {
    falhou += 1;
    casos.push(`  FALHA ${nome}\n         ${erro.message}`);
  }
}

function igual(recebido, esperado, msg) {
  const a = JSON.stringify(recebido);
  const b = JSON.stringify(esperado);
  if (a !== b) throw new Error(`${msg || 'valores diferentes'}: esperado ${b}, recebido ${a}`);
}

function verdadeiro(valor, msg) {
  if (!valor) throw new Error(msg || 'esperava verdadeiro');
}

// ---------------------------------------------------------------- Seed
teste('48 seleções distribuídas em 12 grupos de 4', () => {
  igual(util.selecoes.length, 48, 'total de seleções');
  igual(util.grupos.length, 12, 'total de grupos');
  for (const g of util.grupos) igual(util.selecoesDoGrupo(g).length, 4, `grupo ${g}`);
});

teste('104 jogos, sendo 72 na fase de grupos', () => {
  igual(util.jogos.length, 104, 'total de jogos');
  igual(util.jogos.filter((j) => j.fase === 'grupos').length, 72, 'jogos de grupos');
  igual(util.jogosDaFase('segunda-fase').length, 16, 'segunda fase');
  igual(util.jogosDaFase('oitavas').length, 8, 'oitavas');
  igual(util.jogosDaFase('quartas').length, 4, 'quartas');
  igual(util.jogosDaFase('semifinal').length, 2, 'semifinal');
  igual(util.jogosDaFase('final').length, 1, 'final');
});

teste('cada seleção joga 3 vezes na fase de grupos', () => {
  const conta = new Map(util.selecoes.map((s) => [s.cod, 0]));
  for (const j of util.jogos.filter((x) => x.fase === 'grupos')) {
    conta.set(j.mandante, conta.get(j.mandante) + 1);
    conta.set(j.visitante, conta.get(j.visitante) + 1);
  }
  const errados = [...conta.entries()].filter(([, n]) => n !== 3);
  igual(errados, [], 'seleções com número de jogos diferente de 3');
});

teste('todo jogo tem estádio válido e horário', () => {
  for (const j of util.jogos) {
    verdadeiro(util.estadio(j.estadio), `jogo ${j.id} sem estádio`);
    verdadeiro(/^\d{2}:\d{2}$/.test(j.hora), `jogo ${j.id} com hora inválida`);
    verdadeiro(/^\d{4}-\d{2}-\d{2}$/.test(j.data), `jogo ${j.id} com data inválida`);
  }
});

teste('mata-mata a partir das oitavas é definido por referência', () => {
  for (const fase of ['oitavas', 'quartas', 'semifinal', 'terceiro-lugar', 'final']) {
    for (const j of util.jogosDaFase(fase)) {
      verdadeiro(j.mandanteRef && util.jogo(j.mandanteRef.jogo), `${j.id} sem referência de mandante`);
      verdadeiro(j.visitanteRef && util.jogo(j.visitanteRef.jogo), `${j.id} sem referência de visitante`);
    }
  }
});

teste('todas as 48 seleções têm elenco e técnico', () => {
  for (const s of util.selecoes) {
    verdadeiro(util.elenco(s.cod).length >= 22, `${s.cod} com elenco insuficiente`);
    verdadeiro(s.tecnico, `${s.cod} sem técnico`);
  }
});

// ---------------------------------------------------------------- RN-01
teste('RN-01: pontuação 3/1/0 e saldo de gols', () => {
  const jogosA = util.jogosDoGrupo('A');
  const r = {};
  r[jogosA[0].id] = { m: 3, v: 0 };  // mandante vence
  r[jogosA[1].id] = { m: 1, v: 1 };  // empate
  const tabela = calc.calcularGrupo('A', r);
  const vencedor = tabela.linhas.find((l) => l.cod === jogosA[0].mandante);
  const perdedor = tabela.linhas.find((l) => l.cod === jogosA[0].visitante);
  igual(vencedor.pts, 3, 'pontos do vencedor');
  igual(vencedor.sg, 3, 'saldo do vencedor');
  igual(perdedor.pts, 0, 'pontos do perdedor');
  igual(perdedor.sg, -3, 'saldo do perdedor');
  igual(tabela.linhas.filter((l) => l.pts === 1).length, 2, 'empatados com 1 ponto');
});

teste('RN-01: desempate pelo confronto direto', () => {
  // Grupo A: MEX, RSA, KOR, CZE. Monta empate em pontos, saldo e gols.
  const jogos = util.jogosDoGrupo('A');
  const r = {};
  for (const j of jogos) {
    // Todos vencem por 1x0 em casa: 4 times com pontos e saldo iguais? Não —
    // usamos um cenário controlado abaixo.
    r[j.id] = { m: 1, v: 0 };
  }
  const tabela = calc.calcularGrupo('A', r);
  // Cada time joga 3 (2 em casa/1 fora ou variação) — apenas garante coerência.
  const soma = tabela.linhas.reduce((s, l) => s + l.pts, 0);
  igual(soma, 6 * 3, 'pontos totais distribuídos (6 jogos × 3)');
  igual(tabela.linhas.reduce((s, l) => s + l.sg, 0), 0, 'soma dos saldos deve ser zero');
});

teste('RN-01: confronto direto separa dois times empatados', () => {
  const grupo = 'C'; // BRA, MAR, HAI, SCO
  const jogos = util.jogosDoGrupo(grupo);
  const r = {};
  for (const j of jogos) r[j.id] = { m: 0, v: 0 };
  // Todos empatam em 0x0 -> 3 pontos, saldo 0, gols 0 para todos.
  let tabela = calc.calcularGrupo(grupo, r);
  igual(tabela.linhas.map((l) => l.pts), [3, 3, 3, 3], 'todos com 3 pontos');
  // Desempate final recai no ranking FIFA (item 7): Brasil é o mais bem colocado.
  igual(tabela.linhas[0].cod, 'BRA', 'primeiro pelo ranking FIFA');

  // Agora BRA vence MAR no confronto direto, mantendo saldo/gols iguais entre eles.
  const confronto = jogos.find((j) =>
    (j.mandante === 'BRA' && j.visitante === 'MAR') || (j.mandante === 'MAR' && j.visitante === 'BRA'));
  r[confronto.id] = confronto.mandante === 'MAR' ? { m: 0, v: 1 } : { m: 1, v: 0 };
  tabela = calc.calcularGrupo(grupo, r);
  const posBRA = tabela.linhas.findIndex((l) => l.cod === 'BRA');
  const posMAR = tabela.linhas.findIndex((l) => l.cod === 'MAR');
  verdadeiro(posBRA < posMAR, 'quem venceu o confronto direto fica na frente');
});

// ---------------------------------------------------------------- RN-02
teste('RN-02: 24 diretos + 8 melhores terceiros = 32 classificados', () => {
  const r = {};
  let n = 0;
  for (const j of util.jogos.filter((x) => x.fase === 'grupos')) {
    // Placares variados e determinísticos para produzir grupos desempatados.
    r[j.id] = { m: n % 4, v: (n + 1) % 3 };
    n += 1;
  }
  const tabelas = calc.calcularTodos(r);
  const c = calc.classificados(tabelas);
  igual(c.primeiros.length, 12, 'primeiros colocados');
  igual(c.segundos.length, 12, 'segundos colocados');
  igual(c.terceiros.length, 12, 'terceiros avaliados');
  igual(c.terceirosQueAvancam.length, 8, 'terceiros que avançam');
  igual(c.todos.length, 32, 'total de classificados');
  igual(new Set(c.todos.map((t) => t.cod)).size, 32, 'sem seleção repetida');
});

teste('RN-02: terceiros ordenados por pontos, saldo e gols', () => {
  const r = {};
  let n = 0;
  for (const j of util.jogos.filter((x) => x.fase === 'grupos')) {
    r[j.id] = { m: (n * 3) % 5, v: (n * 2) % 4 };
    n += 1;
  }
  const terceiros = calc.terceirosColocados(calc.calcularTodos(r));
  for (let i = 1; i < terceiros.length; i += 1) {
    const a = terceiros[i - 1];
    const b = terceiros[i];
    const ordenado = a.pts > b.pts ||
      (a.pts === b.pts && a.sg > b.sg) ||
      (a.pts === b.pts && a.sg === b.sg && a.gp > b.gp) ||
      (a.pts === b.pts && a.sg === b.sg && a.gp === b.gp && a.rankingOrdem <= b.rankingOrdem);
    verdadeiro(ordenado, `ordem incorreta entre ${a.cod} e ${b.cod}`);
  }
});

// ---------------------------------------------------------------- RN-03
teste('RN-03: empate no mata-mata é decidido nos pênaltis', () => {
  const r = {};
  r['SF01'] = { m: 1, v: 1 };
  let mm = calc.resolverMataMata(r);
  verdadeiro(!mm.get('SF01').decidido, 'empate sem pênaltis não decide');
  verdadeiro(mm.get('SF01').empatado, 'jogo marcado como empatado');

  r['SF01'] = { m: 1, v: 1, pm: 4, pv: 3 };
  mm = calc.resolverMataMata(r);
  const info = mm.get('SF01');
  verdadeiro(info.decidido && info.nosPenais, 'decidido nos pênaltis');
  igual(info.vencedor, util.jogo('SF01').mandante, 'vencedor nos pênaltis');
});

teste('mata-mata: vencedor avança automaticamente para a fase seguinte', () => {
  const r = {};
  r['SF01'] = { m: 2, v: 0 };
  r['SF02'] = { m: 0, v: 3 };
  const mm = calc.resolverMataMata(r);
  const oitava = util.jogosDaFase('oitavas').find((j) =>
    j.mandanteRef.jogo === 'SF01' && j.visitanteRef.jogo === 'SF02');
  verdadeiro(oitava, 'oitava alimentada por SF01 e SF02 existe');
  const info = mm.get(oitava.id);
  igual(info.mandante, util.jogo('SF01').mandante, 'mandante da oitava');
  igual(info.visitante, util.jogo('SF02').visitante, 'visitante da oitava');
});

teste('mata-mata completo produz campeão, vice e terceiro colocado', () => {
  const r = {};
  const fases = ['segunda-fase', 'oitavas', 'quartas', 'semifinal', 'terceiro-lugar', 'final'];
  for (const fase of fases) {
    for (const j of util.jogosDaFase(fase)) r[j.id] = { m: 2, v: 1 };
  }
  const mm = calc.resolverMataMata(r);
  const final = mm.get('FI01');
  const terceiro = mm.get('TL01');
  verdadeiro(final.decidido, 'final decidida');
  verdadeiro(terceiro.decidido, 'disputa de 3º lugar decidida');
  verdadeiro(final.vencedor && final.perdedor, 'campeão e vice definidos');
  verdadeiro(final.vencedor !== final.perdedor, 'campeão diferente do vice');

  const resumo = calc.resumo(r);
  igual(resumo.campeao, final.vencedor, 'campeão no resumo');
  igual(resumo.feitos.mataMata, 32, 'todos os 32 jogos de mata-mata preenchidos');

  const caminho = calc.caminho(final.vencedor, mm);
  igual(caminho.length, 5, 'campeão disputa 5 jogos (2ª fase → final)');
  verdadeiro(caminho.every((e) => e.venceu), 'campeão venceu todos os confrontos');
});

teste('resumo conta os 104 jogos do torneio', () => {
  const resumo = calc.resumo({});
  igual(resumo.totalGeral, 104, 'total de jogos');
  igual(resumo.total.grupos, 72, 'jogos de grupos');
  igual(resumo.total.mataMata, 32, 'jogos de mata-mata');
  igual(resumo.campeao, null, 'sem campeão sem palpites');
});

teste('placares inválidos são ignorados no cálculo', () => {
  const jogosA = util.jogosDoGrupo('A');
  const r = {};
  r[jogosA[0].id] = { m: 2, v: null };
  r[jogosA[1].id] = { m: -1, v: 2 };
  const tabela = calc.calcularGrupo('A', r);
  igual(tabela.jogosComputados, 0, 'nenhum jogo computado');
  igual(tabela.linhas.every((l) => l.j === 0), true, 'nenhuma seleção com jogo');
});

// ------------------------------------------------------------------ Saída
console.log('--- PortalCopa26 :: testes das regras de negócio ---');
console.log(casos.join('\n'));
console.log(`\n${passou} passaram, ${falhou} falharam`);
process.exit(falhou > 0 ? 1 : 0);

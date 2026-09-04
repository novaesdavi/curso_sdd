/**
 * PortalCopa26 — utilitários compartilhados
 * Namespace global: window.Copa26
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  // ------------------------------------------------------------- Constantes
  const FASES = {
    'grupos': { nome: 'Fase de Grupos', curto: 'Grupos', ordem: 1 },
    'segunda-fase': { nome: 'Segunda Fase', curto: '2ª Fase', ordem: 2 },
    'oitavas': { nome: 'Oitavas de Final', curto: 'Oitavas', ordem: 3 },
    'quartas': { nome: 'Quartas de Final', curto: 'Quartas', ordem: 4 },
    'semifinal': { nome: 'Semifinais', curto: 'Semis', ordem: 5 },
    'terceiro-lugar': { nome: 'Disputa de 3º Lugar', curto: '3º Lugar', ordem: 6 },
    'final': { nome: 'Final', curto: 'Final', ordem: 7 },
  };

  const LOGO_COPA = 'https://api.fifa.com/api/v3/picture/tournaments-sq-4/285023';

  const PAISES_SEDE = [
    { cod: 'CAN', nome: 'Canadá' },
    { cod: 'USA', nome: 'Estados Unidos' },
    { cod: 'MEX', nome: 'México' },
  ];

  // ------------------------------------------------------------------ Dados
  const selecoes = window.COPA26_SELECOES || [];
  const jogos = window.COPA26_JOGOS || [];
  const estadios = window.COPA26_ESTADIOS || [];
  const ranking = window.COPA26_RANKING || [];
  const jogadores = window.COPA26_JOGADORES || {};

  const mapaSelecoes = new Map(selecoes.map((s) => [s.cod, s]));
  const mapaEstadios = new Map(estadios.map((e) => [e.id, e]));
  const mapaJogos = new Map(jogos.map((j) => [j.id, j]));

  const grupos = [...new Set(selecoes.map((s) => s.grupo))].sort();

  /** Primeiro jogo do torneio (base da contagem regressiva). */
  const primeiroJogo = jogos
    .filter((j) => j.fase === 'grupos')
    .slice()
    .sort((a, b) => `${a.data}T${a.hora}`.localeCompare(`${b.data}T${b.hora}`))[0];

  // ------------------------------------------------------------- Selecoes
  const selecao = (cod) => mapaSelecoes.get(cod) || null;
  const nomeSelecao = (cod) => (mapaSelecoes.get(cod) ? mapaSelecoes.get(cod).nome : '—');
  const estadio = (id) => mapaEstadios.get(id) || null;
  const jogo = (id) => mapaJogos.get(id) || null;

  const selecoesDoGrupo = (grupo) =>
    selecoes.filter((s) => s.grupo === grupo).sort((a, b) => a.pote - b.pote);

  const jogosDoGrupo = (grupo) =>
    jogos.filter((j) => j.fase === 'grupos' && j.grupo === grupo);

  const jogosDaFase = (fase) =>
    jogos.filter((j) => j.fase === fase).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  const elenco = (cod) => jogadores[cod] || [];

  // ----------------------------------------------------------------- Datas
  const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  /** Converte "2026-06-11" em Date local sem sofrer deslocamento de fuso. */
  function dataLocal(iso) {
    const [a, m, d] = iso.split('-').map(Number);
    return new Date(a, m - 1, d);
  }

  /**
   * Instante do jogo em UTC. Os horários das fontes são de Brasília (UTC-3),
   * então somamos 3h para obter o instante absoluto.
   */
  function instanteJogo(j) {
    const [a, m, d] = j.data.split('-').map(Number);
    const [h, min] = j.hora.split(':').map(Number);
    return Date.UTC(a, m - 1, d, h + 3, min);
  }

  const dataExtensa = (iso) => {
    const dt = dataLocal(iso);
    const dia = DIAS[dt.getDay()];
    return `${dia.charAt(0).toUpperCase()}${dia.slice(1)}, ${dt.getDate()} de ${MESES[dt.getMonth()]} de ${dt.getFullYear()}`;
  };

  const dataCurta = (iso) => {
    const dt = dataLocal(iso);
    return `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}`;
  };

  const dataMedia = (iso) => {
    const dt = dataLocal(iso);
    return `${dt.getDate()} ${MESES_CURTOS[dt.getMonth()]}`;
  };

  // ------------------------------------------------------------------- DOM
  const $ = (sel, raiz) => (raiz || document).querySelector(sel);
  const $$ = (sel, raiz) => Array.from((raiz || document).querySelectorAll(sel));

  /** Escapa texto para interpolação segura em template HTML. */
  function esc(valor) {
    return String(valor == null ? '' : valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * HTML da bandeira (API pública da FIFA), com alt text (RNF-05) e
   * substituição pela sigla caso a imagem não carregue.
   */
  function bandeira(cod, tamanho) {
    const s = selecao(cod);
    const classe = tamanho ? `bandeira bandeira--${tamanho}` : 'bandeira';
    if (!s) return `<span class="${classe.replace('bandeira', 'bandeira-sigla')}" aria-hidden="true">?</span>`;
    return `<img class="${classe}" src="${esc(s.bandeira)}" alt="Bandeira de ${esc(s.nome)}"
      loading="lazy" data-cod="${esc(cod)}" data-tam="${esc(tamanho || '')}"
      onerror="Copa26.util.bandeiraFalhou(this)">`;
  }

  /** Fallback acessível quando a API de bandeiras está indisponível. */
  function bandeiraFalhou(img) {
    const cod = img.getAttribute('data-cod') || '';
    const tam = img.getAttribute('data-tam') || '';
    const span = document.createElement('span');
    span.className = 'bandeira-sigla' + (tam ? ` bandeira-sigla--${tam}` : '');
    span.textContent = cod;
    span.setAttribute('role', 'img');
    span.setAttribute('aria-label', img.alt || cod);
    if (img.parentNode) img.parentNode.replaceChild(span, img);
  }

  /** Bloco "bandeira + nome" reutilizado em tabelas e listas. */
  function selecaoLinha(cod, tamanho) {
    return `<span class="selecao-linha">${bandeira(cod, tamanho)}<span class="selecao-linha__nome">${esc(nomeSelecao(cod))}</span></span>`;
  }

  const numero = (v) => (v == null ? '—' : new Intl.NumberFormat('pt-BR').format(v));
  const decimal = (v) => (v == null ? '—' : new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v));
  const saldo = (v) => (v > 0 ? `+${v}` : String(v));

  /** Rótulo de um confronto de mata-mata ainda indefinido. */
  function rotuloReferencia(ref) {
    if (!ref) return 'A definir';
    const j = jogo(ref.jogo);
    if (!j) return 'A definir';
    const nomeFase = FASES[j.fase] ? FASES[j.fase].nome : j.fase;
    const prefixo = ref.tipo === 'vencedor' ? 'Vencedor' : 'Perdedor';
    const ordem = j.ordem ? ` ${j.ordem}` : '';
    return `${prefixo} — ${nomeFase}${ordem}`;
  }

  Copa26.util = {
    FASES, LOGO_COPA, PAISES_SEDE,
    selecoes, jogos, estadios, ranking, jogadores, grupos, primeiroJogo,
    selecao, nomeSelecao, estadio, jogo, selecoesDoGrupo, jogosDoGrupo, jogosDaFase, elenco,
    dataLocal, instanteJogo, dataExtensa, dataCurta, dataMedia,
    $, $$, esc, bandeira, bandeiraFalhou, selecaoLinha, numero, decimal, saldo, rotuloReferencia,
  };
})(window.Copa26);

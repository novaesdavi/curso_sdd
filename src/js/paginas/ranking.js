/**
 * PortalCopa26 — página Ranking (PRD §9)
 * Ranking FIFA com posição, seleção e pontuação, destacando as seleções
 * classificadas para a Copa 2026.
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;

  const estado = { busca: '', somenteCopa: false };

  const semAcento = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  function filtrar() {
    const busca = semAcento(estado.busca.trim());
    return util.ranking
      .filter((r) => !estado.somenteCopa || r.naCopa)
      .filter((r) => !busca || semAcento(r.nome).indexOf(busca) >= 0);
  }

  function pintarTabela() {
    const alvo = util.$('#tabela-ranking');
    const resumo = util.$('#resumo-ranking');
    if (!alvo) return;

    const lista = filtrar();
    if (resumo) {
      resumo.innerHTML = '<b>' + lista.length + '</b> de ' + util.ranking.length +
        ' posições exibidas · <b>' + util.ranking.filter((r) => r.naCopa).length +
        '</b> seleções do ranking estão na Copa 2026.';
    }

    if (lista.length === 0) {
      alvo.innerHTML = '<div class="vazio">Nenhuma seleção encontrada.</div>';
      return;
    }

    alvo.innerHTML = '<div class="tabela-envolucro"><table class="tabela">' +
      '<caption class="oculto-visual">Ranking FIFA</caption>' +
      '<thead><tr>' +
        '<th scope="col">Pos.</th>' +
        '<th scope="col">Seleção</th>' +
        '<th scope="col">Grupo</th>' +
        '<th scope="col">Confederação</th>' +
        '<th scope="col">Pontos</th>' +
      '</tr></thead><tbody>' +
      lista.map((r) => {
        const s = r.cod ? util.selecao(r.cod) : null;
        const classe = [
          r.naCopa ? 'linha--classificado' : '',
          r.cod === 'BRA' ? 'linha--brasil' : '',
        ].filter(Boolean).join(' ');
        const nome = s
          ? '<a href="equipes.html#' + s.cod + '" style="color:inherit">' + util.selecaoLinha(s.cod) + '</a>'
          : '<span class="selecao-linha"><span class="bandeira-sigla" aria-hidden="true">—</span>' +
            '<span class="selecao-linha__nome">' + util.esc(r.nome) + '</span></span>';

        return '<tr class="' + classe + '">' +
          '<td><span class="posicao' + (r.naCopa ? ' posicao--classificado' : '') + '">' + r.posicao + '</span></td>' +
          '<td>' + nome + '</td>' +
          '<td>' + (s ? '<span class="badge badge--grupo">' + util.esc(s.grupo) + '</span>' : '<span class="badge badge--neutro">—</span>') + '</td>' +
          '<td style="text-align:left;color:var(--texto-2)">' + util.esc(s ? s.confederacao : '—') + '</td>' +
          '<td class="num destaque">' + util.esc(util.decimal(r.pontos)) + '</td>' +
        '</tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  /** Seleções da Copa que não aparecem no trecho de ranking disponível. */
  function pintarForaDoRanking() {
    const alvo = util.$('#fora-do-ranking');
    if (!alvo) return;

    const fora = util.selecoes
      .filter((s) => !s.rankingPosicao)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    if (fora.length === 0) {
      alvo.innerHTML = '';
      return;
    }

    alvo.innerHTML = '<div class="aviso aviso--atencao">' +
      '<span><b>' + fora.length + ' seleções da Copa 2026</b> não constam no trecho do ranking disponível ' +
      'na fonte (as ' + util.ranking.length + ' primeiras posições): ' +
      fora.map((s) => util.esc(s.nome)).join(', ') + '. ' +
      'Nos critérios de desempate elas entram atrás das seleções ranqueadas.</span></div>';
  }

  function iniciar() {
    const busca = util.$('#busca-ranking');
    if (busca) {
      busca.addEventListener('input', () => {
        estado.busca = busca.value;
        pintarTabela();
      });
    }

    const somenteCopa = util.$('#somente-copa');
    if (somenteCopa) {
      somenteCopa.addEventListener('change', () => {
        estado.somenteCopa = somenteCopa.checked;
        pintarTabela();
      });
    }

    pintarTabela();
    pintarForaDoRanking();
  }

  Copa26.paginas = Copa26.paginas || {};
  Copa26.paginas.ranking = { iniciar };
})(window.Copa26);

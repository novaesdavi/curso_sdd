/**
 * PortalCopa26 — página Grupos (PRD §7 / RF-03)
 * Os 12 grupos com classificação completa, badge de cabeça de chave,
 * distribuição dos potes e indicadores de classificado/eliminado.
 *
 * A classificação é calculada pelo motor Copa26.classificacao. Como o
 * calendário oficial ainda não tem resultados, a página pode usar os palpites
 * do bolão ativo do simulador (alternador "Aplicar meus palpites").
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;
  const comp = Copa26.componentes;
  const calc = Copa26.classificacao;

  const estado = { usarPalpites: false };

  function resultadosOficiais() {
    // Resultados reais do banco/seed. Nenhum jogo disputado ainda.
    const mapa = {};
    for (const j of util.jogos) {
      if (Number.isFinite(j.placarMandante) && Number.isFinite(j.placarVisitante)) {
        mapa[j.id] = { m: j.placarMandante, v: j.placarVisitante };
      }
    }
    return mapa;
  }

  function resultadosAtuais() {
    if (!estado.usarPalpites) return resultadosOficiais();
    const bolao = Copa26.armazenamento.ativo();
    return bolao ? bolao.resultados : {};
  }

  function pintarGrupos() {
    const alvo = util.$('#lista-grupos');
    if (!alvo) return;

    const resultados = resultadosAtuais();
    const tabelas = calc.calcularTodos(resultados);
    const terceiros = calc.terceirosColocados(tabelas);

    alvo.innerHTML = util.grupos.map((g) => {
      const tabela = tabelas[g];
      const progresso = tabela.jogosComputados + '/' + tabela.totalJogos + ' jogos';
      return '<article class="cartao">' +
        '<div class="cartao__cabecalho">' +
          '<h3 class="grupo-cartao__titulo"><span class="letra">' + g + '</span> Grupo ' + g + '</h3>' +
          '<span class="badge ' + (tabela.completo ? 'badge--verde' : 'badge--neutro') + '">' + progresso + '</span>' +
        '</div>' +
        '<div class="cartao__corpo" style="padding:0">' +
          comp.tabelaGrupo(tabela, { terceiros }) +
        '</div>' +
        '<div class="cartao__rodape" style="display:flex;gap:.6rem;flex-wrap:wrap;align-items:center">' +
          '<a class="botao botao--fantasma botao--pequeno" href="jogos.html?grupo=' + g + '">Ver os 6 jogos</a>' +
          '<span>' + util.selecoesDoGrupo(g).map((s) => util.esc(s.nome)).join(' · ') + '</span>' +
        '</div>' +
      '</article>';
    }).join('');

    pintarTerceiros(terceiros, tabelas);
  }

  /** Ranking dos 12 terceiros colocados e as 8 vagas (RN-02). */
  function pintarTerceiros(terceiros, tabelas) {
    const alvo = util.$('#terceiros');
    if (!alvo) return;

    const algumJogo = Object.keys(tabelas).some((g) => tabelas[g].jogosComputados > 0);
    if (!algumJogo) {
      alvo.innerHTML = '<div class="vazio">Assim que houver resultados (oficiais ou do simulador), ' +
        'os 12 terceiros colocados aparecem aqui ordenados pelas regras da FIFA — ' +
        'e os 8 melhores avançam ao mata-mata.</div>';
      return;
    }

    alvo.innerHTML = '<div class="tabela-envolucro"><table class="tabela">' +
      '<caption class="oculto-visual">Classificação dos terceiros colocados</caption>' +
      '<thead><tr>' +
        '<th scope="col">#</th><th scope="col">Seleção</th><th scope="col">Grupo</th>' +
        '<th scope="col" title="Jogos">P</th><th scope="col" title="Vitórias">V</th>' +
        '<th scope="col" title="Empates">E</th><th scope="col" title="Derrotas">D</th>' +
        '<th scope="col" title="Saldo de gols">SG</th><th scope="col" title="Gols pró">GP</th>' +
        '<th scope="col" title="Pontos">Pts</th><th scope="col">Situação</th>' +
      '</tr></thead><tbody>' +
      terceiros.map((t) =>
        '<tr class="' + (t.avanca ? 'linha--classificado' : 'linha--eliminado') + '">' +
          '<td><span class="posicao ' + (t.avanca ? 'posicao--classificado' : 'posicao--eliminado') + '">' +
            t.posicaoEntreTerceiros + '</span></td>' +
          '<td>' + util.selecaoLinha(t.cod) + '</td>' +
          '<td><span class="badge badge--grupo">' + util.esc(t.grupo) + '</span></td>' +
          '<td class="num">' + t.j + '</td>' +
          '<td class="num">' + t.v + '</td>' +
          '<td class="num">' + t.e + '</td>' +
          '<td class="num">' + t.d + '</td>' +
          '<td class="num">' + util.esc(util.saldo(t.sg)) + '</td>' +
          '<td class="num">' + t.gp + '</td>' +
          '<td class="num destaque">' + t.pts + '</td>' +
          '<td>' + (t.avanca
            ? '<span class="badge badge--verde">Avança</span>'
            : '<span class="badge badge--vermelho">Fora</span>') + '</td>' +
        '</tr>').join('') +
      '</tbody></table></div>';
  }

  /** Os 4 potes com as 48 seleções (RF-03). */
  function pintarPotes() {
    const alvo = util.$('#potes');
    if (!alvo) return;

    alvo.innerHTML = [1, 2, 3, 4].map((pote) => {
      const times = util.selecoes
        .filter((s) => s.pote === pote)
        .sort((a, b) => a.grupo.localeCompare(b.grupo));
      const titulo = pote === 1 ? 'Pote 1 · Cabeças de chave' : 'Pote ' + pote;
      return '<div class="cartao pote"><div class="cartao__corpo">' +
        '<h3 class="pote__titulo">' + util.esc(titulo) + '</h3>' +
        '<ul>' + times.map((s) =>
          '<li>' + util.bandeira(s.cod) + '<span>' + util.esc(s.nome) + '</span>' +
          '<span class="grupo-mini">' + util.esc(s.grupo) + '</span></li>').join('') +
        '</ul></div></div>';
    }).join('');
  }

  function montarAlternador() {
    const alvo = util.$('#alternador-palpites');
    if (!alvo) return;

    const bolao = Copa26.armazenamento.ativo();
    alvo.innerHTML =
      '<label class="alternador">' +
        '<input type="checkbox" id="usar-palpites"> Aplicar meus palpites do simulador' +
      '</label>' +
      '<span class="badge badge--neutro">Bolão ativo: ' + util.esc(bolao ? bolao.nome : '—') + '</span>' +
      '<a class="botao botao--fantasma botao--pequeno" href="simulador.html">Abrir simulador</a>';

    util.$('#usar-palpites').addEventListener('change', (ev) => {
      estado.usarPalpites = ev.target.checked;
      pintarGrupos();
    });
  }

  function iniciar() {
    const legenda = util.$('#legenda-zonas');
    if (legenda) legenda.innerHTML = comp.legendaZonas;
    montarAlternador();
    pintarGrupos();
    pintarPotes();
  }

  Copa26.paginas = Copa26.paginas || {};
  Copa26.paginas.grupos = { iniciar };
})(window.Copa26);

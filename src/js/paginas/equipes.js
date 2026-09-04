/**
 * PortalCopa26 — página Equipes (PRD §8 / RF-04)
 * Lista as 48 seleções; ao selecionar uma, exibe bandeira, nome, grupo e
 * elenco completo (nome, posição, idade, gols e participações em Copas).
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;

  const ORDEM_POSICOES = ['Goleiro', 'Defensor', 'Meio-campista', 'Atacante'];
  const FILTROS_POSICAO = [
    { id: 'todas', rotulo: 'Todo o elenco' },
    { id: 'Goleiro', rotulo: 'Goleiros' },
    { id: 'Defensor', rotulo: 'Defensores' },
    { id: 'Meio-campista', rotulo: 'Meio-campistas' },
    { id: 'Atacante', rotulo: 'Atacantes' },
  ];

  const estado = { busca: '', grupo: 'todos', selecionada: null, posicao: 'todas' };

  const semAcento = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  // ------------------------------------------------------------ Grade de times
  function listaFiltrada() {
    const busca = semAcento(estado.busca.trim());
    return util.selecoes
      .filter((s) => estado.grupo === 'todos' || s.grupo === estado.grupo)
      .filter((s) => !busca || semAcento(s.nome).indexOf(busca) >= 0 || semAcento(s.cod).indexOf(busca) >= 0)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  function pintarGrade() {
    const alvo = util.$('#grade-equipes');
    const contador = util.$('#contador-equipes');
    if (!alvo) return;

    const lista = listaFiltrada();
    if (contador) {
      contador.textContent = lista.length + ' de ' + util.selecoes.length +
        (lista.length === 1 ? ' seleção' : ' seleções');
    }

    if (lista.length === 0) {
      alvo.innerHTML = '<div class="vazio">Nenhuma seleção encontrada para essa busca.</div>';
      return;
    }

    alvo.innerHTML = lista.map((s) =>
      '<button type="button" class="cartao-equipe" data-cod="' + s.cod + '"' +
        ' aria-pressed="' + (estado.selecionada === s.cod) + '">' +
        util.bandeira(s.cod, 'g') +
        '<span class="cartao-equipe__nome">' + util.esc(s.nome) + '</span>' +
        '<span class="cartao-equipe__meta">Grupo ' + util.esc(s.grupo) +
          (s.cabecaDeChave ? ' · Cabeça de chave' : '') + '</span>' +
      '</button>').join('');
  }

  // ------------------------------------------------------------- Ficha da equipe
  function pintarFicha() {
    const alvo = util.$('#ficha-equipe');
    if (!alvo) return;

    if (!estado.selecionada) {
      alvo.innerHTML = '<div class="vazio">Selecione uma seleção acima para ver a bandeira, ' +
        'o grupo e o elenco completo.</div>';
      return;
    }

    const s = util.selecao(estado.selecionada);
    if (!s) return;

    const elenco = util.elenco(s.cod);
    const golsTotais = elenco.reduce((soma, j) => soma + (j.gols || 0), 0);
    const idadeMedia = elenco.length
      ? (elenco.reduce((soma, j) => soma + j.idade, 0) / elenco.length).toFixed(1).replace('.', ',')
      : '—';

    const visiveis = elenco
      .filter((j) => estado.posicao === 'todas' || j.posicao === estado.posicao)
      .slice()
      .sort((a, b) => {
        const oa = ORDEM_POSICOES.indexOf(a.posicao);
        const ob = ORDEM_POSICOES.indexOf(b.posicao);
        return (oa === -1 ? 99 : oa) - (ob === -1 ? 99 : ob) || a.nome.localeCompare(b.nome, 'pt-BR');
      });

    const dado = (rotulo, valor) =>
      '<div class="dado"><span class="dado__rotulo">' + util.esc(rotulo) + '</span>' +
      '<span class="dado__valor">' + valor + '</span></div>';

    alvo.innerHTML =
      '<div class="ficha-equipe">' +
        '<header class="ficha-equipe__topo">' +
          '<div class="ficha-equipe__identidade">' +
            util.bandeira(s.cod, 'gg') +
            '<div>' +
              '<h2 class="ficha-equipe__nome">' + util.esc(s.nome) + '</h2>' +
              '<div style="display:flex;flex-wrap:wrap;gap:.4rem;margin-top:.35rem">' +
                '<span class="badge badge--grupo">Grupo ' + util.esc(s.grupo) + '</span>' +
                '<span class="badge">Pote ' + s.pote + '</span>' +
                (s.cabecaDeChave ? '<span class="badge badge--chave">Cabeça de chave</span>' : '') +
                '<span class="badge badge--neutro">' + util.esc(s.confederacao) + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="ficha-equipe__dados">' +
            dado('Treinador', util.esc(s.tecnico || '—')) +
            dado('Ranking FIFA', s.rankingPosicao
              ? s.rankingPosicao + 'º <span style="font-weight:600;color:var(--texto-3)">(' + util.decimal(s.rankingPontos) + ')</span>'
              : 'Fora do top ' + util.ranking.length) +
            dado('Jogadores', elenco.length) +
            dado('Idade média', idadeMedia + ' anos') +
          '</div>' +
        '</header>' +

        '<div class="grupo-botoes" style="justify-content:space-between;align-items:center">' +
          '<div class="chips" id="filtro-posicao">' +
            FILTROS_POSICAO.map((f) => {
              const total = f.id === 'todas'
                ? elenco.length
                : elenco.filter((j) => j.posicao === f.id).length;
              return '<button type="button" class="chip" data-posicao="' + util.esc(f.id) + '"' +
                ' aria-pressed="' + (estado.posicao === f.id) + '">' +
                util.esc(f.rotulo) + ' (' + total + ')</button>';
            }).join('') +
          '</div>' +
          '<a class="botao botao--fantasma botao--pequeno" href="jogos.html?selecao=' + s.cod + '">Ver jogos da seleção</a>' +
        '</div>' +

        '<div class="cartao"><div class="cartao__corpo" style="padding:0">' +
          '<div class="tabela-envolucro"><table class="tabela tabela--elenco">' +
            '<caption class="oculto-visual">Elenco de ' + util.esc(s.nome) + '</caption>' +
            '<thead><tr>' +
              '<th scope="col">#</th>' +
              '<th scope="col">Jogador</th>' +
              '<th scope="col">Posição</th>' +
              '<th scope="col">Idade</th>' +
              '<th scope="col" title="Gols pela seleção">Gols</th>' +
              '<th scope="col" title="Estimativa a partir da idade">Copas (est.)</th>' +
              '<th scope="col">Clube</th>' +
            '</tr></thead>' +
            '<tbody>' +
              (visiveis.length === 0
                ? '<tr><td colspan="7" style="text-align:center;color:var(--texto-3)">Nenhum jogador nessa posição.</td></tr>'
                : visiveis.map((j, i) =>
                  '<tr>' +
                    '<td class="num">' + (i + 1) + '</td>' +
                    '<td class="destaque" style="text-align:left">' + util.esc(j.nome) +
                      (j.capitao ? '<span class="marca-capitao" title="Capitão">C</span>' : '') + '</td>' +
                    '<td class="pos-txt">' + util.esc(j.posicao) + '</td>' +
                    '<td class="num">' + j.idade + '</td>' +
                    '<td class="num">' + j.gols + '</td>' +
                    '<td class="num">' + j.copasEstimadas + '</td>' +
                    '<td class="clube-txt">' + util.esc(j.clube || '—') +
                      (j.clubePais ? ' <span style="color:var(--texto-3)">(' + util.esc(j.clubePais) + ')</span>' : '') + '</td>' +
                  '</tr>').join('')) +
            '</tbody>' +
          '</table></div>' +
        '</div>' +
        '<div class="cartao__rodape">' +
          'Elenco com <b>' + elenco.length + '</b> jogadores · <b>' + golsTotais + '</b> gols somados pela seleção. ' +
          '<em>Copas (est.)</em> é uma estimativa derivada da idade — as fontes não informam participações em Copas.' +
        '</div></div>' +
      '</div>';

    const chips = util.$('#filtro-posicao');
    if (chips) {
      chips.addEventListener('click', (ev) => {
        const botao = ev.target.closest('[data-posicao]');
        if (!botao) return;
        estado.posicao = botao.getAttribute('data-posicao');
        pintarFicha();
      });
    }
  }

  function selecionar(cod, rolar) {
    estado.selecionada = cod;
    estado.posicao = 'todas';
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + cod);
    }
    pintarGrade();
    pintarFicha();
    if (rolar) {
      const ficha = util.$('#ficha-equipe');
      if (ficha) ficha.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function iniciar() {
    const busca = util.$('#busca-equipe');
    if (busca) {
      busca.addEventListener('input', () => {
        estado.busca = busca.value;
        pintarGrade();
      });
    }

    const grupo = util.$('#filtro-grupo-equipe');
    if (grupo) {
      grupo.innerHTML = '<option value="todos">Todos os grupos</option>' +
        util.grupos.map((g) => '<option value="' + g + '">Grupo ' + g + '</option>').join('');
      grupo.addEventListener('change', () => {
        estado.grupo = grupo.value;
        pintarGrade();
      });
    }

    const grade = util.$('#grade-equipes');
    if (grade) {
      grade.addEventListener('click', (ev) => {
        const botao = ev.target.closest('[data-cod]');
        if (!botao) return;
        selecionar(botao.getAttribute('data-cod'), true);
      });
    }

    // Deep link: equipes.html#BRA  ou  equipes.html?cod=BRA
    const params = new URLSearchParams(window.location.search);
    const alvo = (window.location.hash || '').replace('#', '') || params.get('cod');
    estado.selecionada = alvo && util.selecao(alvo) ? alvo : null;

    pintarGrade();
    pintarFicha();
  }

  Copa26.paginas = Copa26.paginas || {};
  Copa26.paginas.equipes = { iniciar, selecionar };
})(window.Copa26);

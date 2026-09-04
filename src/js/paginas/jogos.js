/**
 * PortalCopa26 — página Jogos (PRD §6 / RF-02)
 * Todos os 104 jogos ordenados por data, agrupados por dia, com filtros
 * combináveis por fase, grupo, seleção, cidade-sede e data.
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;
  const comp = Copa26.componentes;

  const DIAS_POR_PAGINA = 6; // paginação incremental (RNF-01)

  const estado = {
    fase: 'todas',
    grupo: 'todos',
    selecao: 'todas',
    cidade: 'todas',
    data: 'todas',
    diasVisiveis: DIAS_POR_PAGINA,
  };

  const ordenados = util.jogos
    .slice()
    .sort((a, b) => util.instanteJogo(a) - util.instanteJogo(b));

  /** Uma seleção participa do jogo quando é mandante ou visitante definido. */
  function envolve(j, cod) {
    return j.mandante === cod || j.visitante === cod;
  }

  function filtrar() {
    return ordenados.filter((j) => {
      if (estado.fase !== 'todas' && j.fase !== estado.fase) return false;
      if (estado.grupo !== 'todos' && j.grupo !== estado.grupo) return false;
      if (estado.selecao !== 'todas' && !envolve(j, estado.selecao)) return false;
      if (estado.cidade !== 'todas' && j.estadio !== estado.cidade) return false;
      if (estado.data !== 'todas' && j.diaTabela !== estado.data) return false;
      return true;
    });
  }

  // ------------------------------------------------------------------ Filtros
  function montarFiltros() {
    const chips = util.$('#filtro-fase');
    if (chips) {
      const fases = [{ id: 'todas', rotulo: 'Todas as fases' }].concat(
        Object.keys(util.FASES)
          .filter((f) => util.jogos.some((j) => j.fase === f))
          .map((f) => ({ id: f, rotulo: util.FASES[f].curto }))
      );
      chips.innerHTML = fases.map((f) => '<button type="button" class="chip" data-fase="' +
        util.esc(f.id) + '" aria-pressed="' + (f.id === estado.fase) + '">' +
        util.esc(f.rotulo) + '</button>').join('');

      chips.addEventListener('click', (ev) => {
        const botao = ev.target.closest('[data-fase]');
        if (!botao) return;
        estado.fase = botao.getAttribute('data-fase');
        estado.diasVisiveis = DIAS_POR_PAGINA;
        util.$$('[data-fase]', chips).forEach((b) => b.setAttribute('aria-pressed', String(b === botao)));
        pintar();
      });
    }

    const grupo = util.$('#filtro-grupo');
    if (grupo) {
      grupo.innerHTML = '<option value="todos">Todos os grupos</option>' +
        util.grupos.map((g) => '<option value="' + g + '">Grupo ' + g + '</option>').join('');
    }

    const selecao = util.$('#filtro-selecao');
    if (selecao) {
      const ordenadas = util.selecoes.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
      selecao.innerHTML = '<option value="todas">Todas as seleções</option>' +
        ordenadas.map((s) => '<option value="' + s.cod + '">' + util.esc(s.nome) + '</option>').join('');
    }

    const cidade = util.$('#filtro-cidade');
    if (cidade) {
      const sedes = util.estadios.slice().sort((a, b) => a.cidade.localeCompare(b.cidade, 'pt-BR'));
      cidade.innerHTML = '<option value="todas">Todas as sedes</option>' +
        sedes.map((e) => '<option value="' + util.esc(e.id) + '">' + util.esc(e.cidade) +
          ' — ' + util.esc(e.estadio) + '</option>').join('');
    }

    const data = util.$('#filtro-data');
    if (data) {
      const dias = [...new Set(ordenados.map((j) => j.diaTabela))].sort();
      data.innerHTML = '<option value="todas">Todas as datas</option>' +
        dias.map((d) => '<option value="' + d + '">' + util.esc(util.dataExtensa(d)) + '</option>').join('');
    }

    const ligacoes = [
      ['#filtro-grupo', 'grupo'],
      ['#filtro-selecao', 'selecao'],
      ['#filtro-cidade', 'cidade'],
      ['#filtro-data', 'data'],
    ];
    ligacoes.forEach(([sel, campo]) => {
      const el = util.$(sel);
      if (!el) return;
      el.addEventListener('change', () => {
        estado[campo] = el.value;
        estado.diasVisiveis = DIAS_POR_PAGINA;
        pintar();
      });
    });

    const limpar = util.$('#limpar-filtros');
    if (limpar) {
      limpar.addEventListener('click', () => {
        estado.fase = 'todas';
        estado.grupo = 'todos';
        estado.selecao = 'todas';
        estado.cidade = 'todas';
        estado.data = 'todas';
        estado.diasVisiveis = DIAS_POR_PAGINA;
        const chipsEl = util.$('#filtro-fase');
        if (chipsEl) {
          util.$$('[data-fase]', chipsEl).forEach((b) =>
            b.setAttribute('aria-pressed', String(b.getAttribute('data-fase') === 'todas')));
        }
        ligacoes.forEach(([sel]) => {
          const el = util.$(sel);
          if (el) el.selectedIndex = 0;
        });
        pintar();
      });
    }
  }

  // ------------------------------------------------------------- Renderização
  function pintar() {
    const lista = filtrar();
    const blocos = comp.agruparPorDia(lista);
    const visiveis = blocos.slice(0, estado.diasVisiveis);
    const alvo = util.$('#lista-jogos');
    const resumo = util.$('#resumo-jogos');

    if (resumo) {
      resumo.innerHTML = lista.length === util.jogos.length
        ? 'Exibindo <b>todos os ' + util.jogos.length + ' jogos</b> do torneio, agrupados por dia.'
        : '<b>' + lista.length + '</b> ' + (lista.length === 1 ? 'jogo encontrado' : 'jogos encontrados') +
          ' em ' + blocos.length + ' ' + (blocos.length === 1 ? 'dia' : 'dias') + '.';
    }

    if (!alvo) return;

    if (visiveis.length === 0) {
      alvo.innerHTML = '<div class="vazio">Nenhum jogo encontrado com os filtros selecionados.</div>';
    } else {
      alvo.innerHTML = visiveis.map((bloco) =>
        '<section class="dia-jogos">' +
          '<h3 class="dia-jogos__titulo">' + util.esc(util.dataExtensa(bloco.dia)) +
            '<span class="badge">' + bloco.jogos.length + ' ' +
            (bloco.jogos.length === 1 ? 'jogo' : 'jogos') + '</span>' +
          '</h3>' +
          '<div class="lista-jogos">' + bloco.jogos.map((j) => comp.cartaoJogo(j)).join('') + '</div>' +
        '</section>').join('');
    }

    const maisAlvo = util.$('#mais-jogos');
    if (maisAlvo) {
      const restantes = blocos.length - visiveis.length;
      maisAlvo.innerHTML = restantes > 0
        ? '<button class="botao botao--secundario" type="button" id="botao-mais">Mostrar mais ' +
          Math.min(restantes, DIAS_POR_PAGINA) + ' de ' + restantes + ' ' +
          (restantes === 1 ? 'dia' : 'dias') + '</button>'
        : '';
      const botao = util.$('#botao-mais');
      if (botao) {
        botao.addEventListener('click', () => {
          estado.diasVisiveis += DIAS_POR_PAGINA;
          pintar();
        });
      }
    }
  }

  function iniciar() {
    // Permite chegar já filtrado: jogos.html?selecao=BRA / ?grupo=C / ?fase=final
    const params = new URLSearchParams(window.location.search);
    const paramSelecao = params.get('selecao');
    const paramGrupo = params.get('grupo');
    const paramFase = params.get('fase');
    if (paramSelecao && util.selecao(paramSelecao)) estado.selecao = paramSelecao;
    if (paramGrupo && util.grupos.indexOf(paramGrupo) >= 0) estado.grupo = paramGrupo;
    if (paramFase && util.FASES[paramFase]) estado.fase = paramFase;

    montarFiltros();

    const grupo = util.$('#filtro-grupo');
    if (grupo) grupo.value = estado.grupo;
    const selecao = util.$('#filtro-selecao');
    if (selecao) selecao.value = estado.selecao;

    pintar();
  }

  Copa26.paginas = Copa26.paginas || {};
  Copa26.paginas.jogos = { iniciar };
})(window.Copa26);

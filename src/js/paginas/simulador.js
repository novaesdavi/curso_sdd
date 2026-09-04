/**
 * PortalCopa26 — página Simulador (PRD §10 / RF-06)
 *
 * Três painéis:
 *  1. Fase de grupos — placar de cada um dos 72 jogos, classificação recalculada
 *     na hora (RN-01) e seleção dos 8 melhores terceiros (RN-02).
 *  2. Mata-mata — da Segunda Fase à final, com pênaltis no empate (RN-03) e
 *     avanço automático do vencedor.
 *  3. Bolões — múltiplas simulações salvas, comparáveis entre si.
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;
  const calc = Copa26.classificacao;
  const armazenamento = Copa26.armazenamento;

  const FASES_MATA_MATA = ['segunda-fase', 'oitavas', 'quartas', 'semifinal', 'terceiro-lugar', 'final'];

  let resultados = {};
  let painelAtual = 'grupos';

  // --------------------------------------------------------------- Utilidades
  const idEntrada = (jogoId, lado) => 'in-' + jogoId + '-' + lado;

  function lerNumero(valor) {
    if (valor === '' || valor == null) return null;
    const n = Number.parseInt(valor, 10);
    if (!Number.isFinite(n) || n < 0) return null;
    return Math.min(n, 99);
  }

  function salvar(jogoId, dados) {
    const vazio = dados == null ||
      (dados.m == null && dados.v == null && dados.pm == null && dados.pv == null);
    if (vazio) {
      delete resultados[jogoId];
      armazenamento.salvarPalpite(jogoId, null);
    } else {
      resultados[jogoId] = dados;
      armazenamento.salvarPalpite(jogoId, dados);
    }
  }

  function recarregar() {
    const bolao = armazenamento.ativo();
    resultados = bolao ? JSON.parse(JSON.stringify(bolao.resultados || {})) : {};
  }

  /** Sorteia um placar plausível (0 a 4 gols, com peso maior nos placares baixos). */
  function golAleatorio() {
    const r = Math.random();
    if (r < 0.28) return 0;
    if (r < 0.62) return 1;
    if (r < 0.85) return 2;
    if (r < 0.96) return 3;
    return 4;
  }

  // ------------------------------------------------------- Linha de palpite
  function linhaPalpite(j, codM, codV) {
    const r = resultados[j.id] || {};
    const habilitado = Boolean(codM && codV);
    const nomeM = codM ? util.nomeSelecao(codM) : util.rotuloReferencia(j.mandanteRef);
    const nomeV = codV ? util.nomeSelecao(codV) : util.rotuloReferencia(j.visitanteRef);

    const ladoHtml = (cod, nome, posicao) =>
      '<div class="palpite__lado palpite__lado--' + posicao + (cod ? '' : ' jogo__lado--indefinido') + '">' +
        (cod ? util.bandeira(cod) : '<span class="bandeira-sigla" aria-hidden="true">?</span>') +
        '<span>' + util.esc(nome) + '</span>' +
      '</div>';

    const entrada = (lado, valor, rotulo) =>
      '<input class="entrada-gol' + (Number.isFinite(valor) ? ' entrada-gol--preenchida' : '') + '"' +
        ' id="' + idEntrada(j.id, lado) + '" type="number" min="0" max="99" step="1" inputmode="numeric"' +
        ' data-jogo="' + j.id + '" data-lado="' + lado + '"' +
        ' value="' + (Number.isFinite(valor) ? valor : '') + '"' +
        (habilitado ? '' : ' disabled') +
        ' aria-label="' + util.esc(rotulo) + '">';

    const empate = j.fase !== 'grupos' && calc.valido(r) && r.m === r.v;
    const blocoPenais = empate
      ? '<div class="penais">' +
          '<span>Empate no tempo normal — decisão nos pênaltis:</span>' +
          entrada('pm', r.pm, 'Pênaltis de ' + nomeM) +
          '<span aria-hidden="true">×</span>' +
          entrada('pv', r.pv, 'Pênaltis de ' + nomeV) +
        '</div>'
      : '';

    return '<div class="palpite" data-jogo="' + j.id + '">' +
      ladoHtml(codM, nomeM, 'mandante') +
      '<div class="palpite__placar">' +
        entrada('m', r.m, 'Gols de ' + nomeM) +
        '<span aria-hidden="true">×</span>' +
        entrada('v', r.v, 'Gols de ' + nomeV) +
      '</div>' +
      ladoHtml(codV, nomeV, 'visitante') +
      blocoPenais +
    '</div>';
  }

  // ------------------------------------------------------------ Painel grupos
  function pintarGrupos() {
    const alvo = util.$('#painel-grupos-lista');
    if (!alvo) return;

    alvo.innerHTML = util.grupos.map((g) =>
      '<article class="cartao" data-grupo="' + g + '">' +
        '<div class="cartao__cabecalho">' +
          '<h3 class="grupo-cartao__titulo"><span class="letra">' + g + '</span> Grupo ' + g + '</h3>' +
          '<button type="button" class="botao botao--fantasma botao--pequeno" data-acao="limpar-grupo" data-grupo="' + g + '">Limpar</button>' +
        '</div>' +
        '<div class="cartao__corpo">' +
          util.jogosDoGrupo(g)
            .slice()
            .sort((a, b) => util.instanteJogo(a) - util.instanteJogo(b))
            .map((j) => linhaPalpite(j, j.mandante, j.visitante))
            .join('') +
        '</div>' +
        '<div class="tabela-grupo-slot" data-slot="' + g + '"></div>' +
      '</article>').join('');

    util.grupos.forEach(atualizarTabelaGrupo);
    atualizarResumoGrupos();
  }

  function atualizarTabelaGrupo(g) {
    const slot = util.$('[data-slot="' + g + '"]');
    if (!slot) return;
    const tabelas = calc.calcularTodos(resultados);
    const terceiros = calc.terceirosColocados(tabelas);
    slot.innerHTML = Copa26.componentes.tabelaGrupo(tabelas[g], { terceiros });
  }

  function atualizarTodasTabelas() {
    const tabelas = calc.calcularTodos(resultados);
    const terceiros = calc.terceirosColocados(tabelas);
    for (const g of util.grupos) {
      const slot = util.$('[data-slot="' + g + '"]');
      if (slot) slot.innerHTML = Copa26.componentes.tabelaGrupo(tabelas[g], { terceiros });
    }
    atualizarResumoGrupos(tabelas, terceiros);
  }

  function atualizarResumoGrupos(tabelasParam, terceirosParam) {
    const tabelas = tabelasParam || calc.calcularTodos(resultados);
    const terceiros = terceirosParam || calc.terceirosColocados(tabelas);
    const alvo = util.$('#painel-grupos-resumo');
    if (!alvo) return;

    const algum = util.grupos.some((g) => tabelas[g].jogosComputados > 0);
    if (!algum) {
      alvo.innerHTML = '<div class="vazio">Informe os placares acima para ver a classificação, ' +
        'os 8 melhores terceiros e os 32 classificados ao mata-mata.</div>';
      return;
    }

    const c = calc.classificados(tabelas);
    const pilula = (linha, rotulo) =>
      '<span class="sede-pilula" style="--cor:var(--verde)">' + util.bandeira(linha.cod) +
      util.esc(util.nomeSelecao(linha.cod)) +
      ' <span style="color:var(--texto-3);font-weight:600">' + util.esc(rotulo) + '</span></span>';

    alvo.innerHTML =
      '<div class="cartao"><div class="cartao__corpo">' +
        '<h3 style="margin-top:0">Terceiros colocados — 8 vagas</h3>' +
        '<div class="tabela-envolucro"><table class="tabela">' +
          '<thead><tr><th scope="col">#</th><th scope="col">Seleção</th><th scope="col">Grupo</th>' +
          '<th scope="col">Pts</th><th scope="col">SG</th><th scope="col">GP</th><th scope="col">Situação</th></tr></thead>' +
          '<tbody>' + terceiros.map((t) =>
            '<tr class="' + (t.avanca ? 'linha--classificado' : 'linha--eliminado') + '">' +
              '<td><span class="posicao ' + (t.avanca ? 'posicao--classificado' : 'posicao--eliminado') + '">' +
                t.posicaoEntreTerceiros + '</span></td>' +
              '<td>' + util.selecaoLinha(t.cod) + '</td>' +
              '<td><span class="badge badge--grupo">' + util.esc(t.grupo) + '</span></td>' +
              '<td class="num destaque">' + t.pts + '</td>' +
              '<td class="num">' + util.esc(util.saldo(t.sg)) + '</td>' +
              '<td class="num">' + t.gp + '</td>' +
              '<td>' + (t.avanca ? '<span class="badge badge--verde">Avança</span>'
                                 : '<span class="badge badge--vermelho">Fora</span>') + '</td>' +
            '</tr>').join('') +
          '</tbody></table></div>' +

        '<h3 style="margin-top:1.5rem">Classificados ao mata-mata (' + c.todos.length + '/32)</h3>' +
        '<div class="sedes" style="margin-top:.5rem">' +
          c.primeiros.map((l) => pilula(l, l.origem)).join('') +
          c.segundos.map((l) => pilula(l, l.origem)).join('') +
          c.terceirosQueAvancam.map((l) => pilula(l, l.origem)).join('') +
        '</div>' +
      '</div></div>';
  }

  // ---------------------------------------------------------- Painel mata-mata
  function pintarMataMata() {
    const alvo = util.$('#painel-mata-mata-lista');
    if (!alvo) return;

    const mataMata = calc.resolverMataMata(resultados);
    const final = mataMata.get('FI01');

    let bannerCampeao = '';
    if (final && final.decidido) {
      const etapas = calc.caminho(final.vencedor, mataMata);
      bannerCampeao =
        '<div class="campeao">' +
          '<span class="campeao__rotulo">Campeão da simulação</span>' +
          util.bandeira(final.vencedor, 'gg') +
          '<h3 class="campeao__nome">' + util.esc(util.nomeSelecao(final.vencedor)) + '</h3>' +
          '<p style="margin:0;color:var(--texto-2)">Vice-campeão: <b>' +
            util.esc(util.nomeSelecao(final.perdedor)) + '</b></p>' +
          '<div class="campeao__caminho">' + etapas.map((e) =>
            '<span class="badge ' + (e.venceu ? 'badge--verde' : 'badge--vermelho') + '">' +
              util.esc(util.FASES[e.fase].curto) + ': ' + util.esc(util.nomeSelecao(e.adversario)) +
              ' ' + e.golsPro + '×' + e.golsContra + (e.nosPenais ? ' (pên.)' : '') +
            '</span>').join('') +
          '</div>' +
        '</div>';
    }

    const fases = FASES_MATA_MATA.map((fase) => {
      const jogos = util.jogosDaFase(fase);
      const decididos = jogos.filter((j) => mataMata.get(j.id).decidido).length;
      return '<section class="cartao">' +
        '<div class="cartao__cabecalho">' +
          '<h3 class="chave-fase__titulo" style="margin:0">' + util.esc(util.FASES[fase].nome) + '</h3>' +
          '<span class="badge ' + (decididos === jogos.length ? 'badge--verde' : 'badge--neutro') + '">' +
            decididos + '/' + jogos.length + ' definidos</span>' +
        '</div>' +
        '<div class="cartao__corpo">' +
          jogos.map((j) => {
            const info = mataMata.get(j.id);
            const est = util.estadio(j.estadio);
            return '<div class="chave-jogo">' +
              '<div class="jogo__topo" style="margin-bottom:.15rem">' +
                '<span class="jogo__numero">#' + j.numero + '</span>' +
                '<span>' + util.esc(util.dataMedia(j.data)) + ' · ' + util.esc(j.hora) + '</span>' +
                '<span>' + util.esc(est ? est.cidade : '—') + '</span>' +
                (info.decidido
                  ? '<span class="badge badge--verde">Venc.: ' + util.esc(util.nomeSelecao(info.vencedor)) + '</span>'
                  : '') +
              '</div>' +
              linhaPalpite(j, info.mandante, info.visitante) +
            '</div>';
          }).join('') +
        '</div>' +
      '</section>';
    }).join('');

    alvo.innerHTML = bannerCampeao +
      '<div class="aviso"><span>Os confrontos da <b>Segunda Fase</b> vêm definidos na fonte ' +
      '(<code>copa2026_Jogos_Segunda_fase.txt</code>) com as seleções já emparelhadas. ' +
      'A partir das oitavas, cada vencedor avança automaticamente pelo chaveamento ' +
      '(<em>Venc. Segundafase N</em>, <em>Venc. Oitavas N</em>, …).</span></div>' +
      '<div class="chave-fases" style="margin-top:1rem">' + fases + '</div>';
  }

  // ------------------------------------------------------------ Painel bolões
  function pintarBoloes() {
    const alvo = util.$('#painel-boloes-lista');
    if (!alvo) return;

    const lista = armazenamento.listar();
    const ativo = armazenamento.ativo();

    const cartoes = lista.map((b) => {
      const r = calc.resumo(b.resultados);
      const ehAtivo = ativo && b.id === ativo.id;
      return '<div class="bolao' + (ehAtivo ? ' bolao--ativo' : '') + '">' +
        '<div>' +
          '<div class="bolao__nome">' + util.esc(b.nome) +
            (ehAtivo ? ' <span class="badge badge--verde">Ativo</span>' : '') + '</div>' +
          '<div class="bolao__meta">' + r.feitosGeral + '/' + r.totalGeral + ' palpites · ' +
            (r.campeao ? 'campeão: <b>' + util.esc(util.nomeSelecao(r.campeao)) + '</b>' : 'sem campeão definido') +
          '</div>' +
        '</div>' +
        '<div class="bolao__acoes">' +
          (ehAtivo ? '' : '<button type="button" class="botao botao--secundario botao--pequeno" data-acao="ativar" data-id="' + b.id + '">Ativar</button>') +
          '<button type="button" class="botao botao--fantasma botao--pequeno" data-acao="renomear" data-id="' + b.id + '">Renomear</button>' +
          '<button type="button" class="botao botao--fantasma botao--pequeno" data-acao="duplicar" data-id="' + b.id + '">Duplicar</button>' +
          (lista.length > 1 ? '<button type="button" class="botao botao--perigo botao--pequeno" data-acao="excluir" data-id="' + b.id + '">Excluir</button>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    const comparacao = '<div class="cartao" style="margin-top:1.25rem"><div class="cartao__corpo">' +
      '<h3 style="margin-top:0">Comparação dos bolões</h3>' +
      '<div class="tabela-envolucro"><table class="tabela">' +
        '<thead><tr>' +
          '<th scope="col">#</th><th scope="col">Bolão</th>' +
          '<th scope="col">Grupos</th><th scope="col">Mata-mata</th>' +
          '<th scope="col">Campeão</th><th scope="col">Vice</th>' +
        '</tr></thead><tbody>' +
        lista.map((b, i) => {
          const r = calc.resumo(b.resultados);
          return '<tr>' +
            '<td><span class="posicao">' + (i + 1) + '</span></td>' +
            '<td style="text-align:left"><b>' + util.esc(b.nome) + '</b></td>' +
            '<td class="num">' + r.feitos.grupos + '/' + r.total.grupos + '</td>' +
            '<td class="num">' + r.feitos.mataMata + '/' + r.total.mataMata + '</td>' +
            '<td>' + (r.campeao ? util.selecaoLinha(r.campeao) : '<span style="color:var(--texto-3)">—</span>') + '</td>' +
            '<td>' + (r.vice ? util.selecaoLinha(r.vice) : '<span style="color:var(--texto-3)">—</span>') + '</td>' +
          '</tr>';
        }).join('') +
      '</tbody></table></div>' +
      '<p class="nota-fonte">O percentual de acertos frente aos resultados reais será calculado quando ' +
      'os placares oficiais estiverem no banco — nenhum jogo do calendário foi disputado ainda.</p>' +
      '</div></div>';

    alvo.innerHTML = '<div class="lista-boloes">' + cartoes + '</div>' + comparacao;
  }

  // ------------------------------------------------------------------ Barra
  function atualizarBarra() {
    const alvo = util.$('#barra-simulador');
    if (!alvo) return;
    const bolao = armazenamento.ativo();
    const r = calc.resumo(resultados);
    alvo.innerHTML =
      '<div class="barra-acoes__info">' +
        'Bolão ativo: <b>' + util.esc(bolao ? bolao.nome : '—') + '</b> · ' +
        '<b>' + r.feitosGeral + '</b> de ' + r.totalGeral + ' jogos com palpite' +
        (r.campeao ? ' · campeão: <b>' + util.esc(util.nomeSelecao(r.campeao)) + '</b>' : '') +
      '</div>' +
      '<button type="button" class="botao botao--primario botao--pequeno" data-acao="sortear">Simular tudo</button>' +
      '<button type="button" class="botao botao--secundario botao--pequeno" data-acao="novo">Novo bolão</button>' +
      '<button type="button" class="botao botao--perigo botao--pequeno" data-acao="limpar-tudo">Limpar palpites</button>';
  }

  // ------------------------------------------------------------------ Ações
  /** Preenche todos os jogos, resolvendo o chaveamento fase a fase. */
  function sortearTudo() {
    for (const j of util.jogos) {
      if (j.fase !== 'grupos') continue;
      salvar(j.id, { m: golAleatorio(), v: golAleatorio() });
    }
    for (const fase of FASES_MATA_MATA) {
      for (const j of util.jogosDaFase(fase)) {
        const mataMata = calc.resolverMataMata(resultados);
        const info = mataMata.get(j.id);
        if (!info.mandante || !info.visitante) continue;
        const m = golAleatorio();
        let v = golAleatorio();
        const dados = { m, v };
        if (m === v) {
          // Empate: decisão por pênaltis (RN-03), sem novo empate.
          let pm = 3 + Math.floor(Math.random() * 3);
          let pv = 3 + Math.floor(Math.random() * 3);
          if (pm === pv) pv = pm === 5 ? pm - 1 : pm + 1;
          dados.pm = pm;
          dados.pv = pv;
        }
        salvar(j.id, dados);
      }
    }
    redesenharTudo();
  }

  function redesenharTudo() {
    if (painelAtual === 'grupos') pintarGrupos();
    if (painelAtual === 'mata-mata') pintarMataMata();
    if (painelAtual === 'boloes') pintarBoloes();
    atualizarBarra();
  }

  /** Aplica a digitação de um placar, preservando o foco do campo. */
  function aoDigitar(ev) {
    const campo = ev.target.closest('.entrada-gol');
    if (!campo) return;

    const jogoId = campo.getAttribute('data-jogo');
    const lado = campo.getAttribute('data-lado');
    const atual = Object.assign({}, resultados[jogoId] || {});
    atual[lado] = lerNumero(campo.value);

    // Placar deixou de ser empate: os pênaltis perdem o sentido.
    if ((lado === 'm' || lado === 'v') && Number.isFinite(atual.m) && Number.isFinite(atual.v) && atual.m !== atual.v) {
      delete atual.pm;
      delete atual.pv;
    }
    salvar(jogoId, atual);

    campo.classList.toggle('entrada-gol--preenchida', Number.isFinite(atual[lado]));

    const jogo = util.jogo(jogoId);
    if (jogo && jogo.fase === 'grupos') {
      atualizarTodasTabelas();
      // A linha só é redesenhada quando o bloco de pênaltis precisa aparecer/sumir.
      atualizarBarra();
    } else {
      const foco = campo.id;
      const posicao = campo.value.length;
      pintarMataMata();
      atualizarBarra();
      const novo = document.getElementById(foco);
      if (novo) {
        novo.focus();
        try { novo.setSelectionRange(posicao, posicao); } catch (e) { /* type=number */ }
      }
    }
  }

  function aoClicar(ev) {
    const botao = ev.target.closest('[data-acao]');
    if (!botao) return;
    const acao = botao.getAttribute('data-acao');
    const id = botao.getAttribute('data-id');

    if (acao === 'sortear') { sortearTudo(); return; }

    if (acao === 'limpar-tudo') {
      if (!window.confirm('Apagar todos os palpites deste bolão?')) return;
      armazenamento.limpar();
      recarregar();
      redesenharTudo();
      return;
    }

    if (acao === 'limpar-grupo') {
      const g = botao.getAttribute('data-grupo');
      const ids = util.jogosDoGrupo(g).map((j) => j.id);
      armazenamento.limpar(ids);
      recarregar();
      pintarGrupos();
      atualizarBarra();
      return;
    }

    if (acao === 'novo') {
      const nome = window.prompt('Nome do novo bolão:', 'Meu palpite ' + (armazenamento.listar().length + 1));
      if (nome === null) return;
      armazenamento.criar(nome);
      recarregar();
      redesenharTudo();
      return;
    }

    if (acao === 'ativar') { armazenamento.definirAtivo(id); recarregar(); redesenharTudo(); return; }
    if (acao === 'duplicar') { armazenamento.duplicar(id); recarregar(); redesenharTudo(); return; }

    if (acao === 'renomear') {
      const atual = armazenamento.listar().find((b) => b.id === id);
      const nome = window.prompt('Novo nome do bolão:', atual ? atual.nome : '');
      if (nome === null) return;
      armazenamento.renomear(id, nome);
      redesenharTudo();
      return;
    }

    if (acao === 'excluir') {
      const atual = armazenamento.listar().find((b) => b.id === id);
      if (!window.confirm('Excluir o bolão "' + (atual ? atual.nome : '') + '"?')) return;
      armazenamento.remover(id);
      recarregar();
      redesenharTudo();
    }
  }

  /** Redesenha a linha quando um placar vira (ou deixa de ser) empate. */
  function aoSair(ev) {
    const campo = ev.target.closest('.entrada-gol');
    if (!campo) return;
    const jogoId = campo.getAttribute('data-jogo');
    const jogo = util.jogo(jogoId);
    if (!jogo || jogo.fase === 'grupos') return;
    pintarMataMata();
  }

  // -------------------------------------------------------------------- Abas
  function trocarPainel(id) {
    painelAtual = id;
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, '', '#' + id);
    }
    util.$$('[data-aba]').forEach((b) =>
      b.setAttribute('aria-selected', String(b.getAttribute('data-aba') === id)));
    util.$$('[data-painel]').forEach((p) => {
      p.hidden = p.getAttribute('data-painel') !== id;
    });
    if (id === 'grupos') pintarGrupos();
    if (id === 'mata-mata') pintarMataMata();
    if (id === 'boloes') pintarBoloes();
  }

  function iniciar() {
    recarregar();

    const abas = util.$('#abas-simulador');
    if (abas) {
      abas.addEventListener('click', (ev) => {
        const botao = ev.target.closest('[data-aba]');
        if (botao) trocarPainel(botao.getAttribute('data-aba'));
      });
    }

    document.addEventListener('input', aoDigitar);
    document.addEventListener('change', aoSair);
    document.addEventListener('click', aoClicar);

    if (!armazenamento.persistente) {
      const aviso = util.$('#aviso-armazenamento');
      if (aviso) {
        aviso.innerHTML = '<div class="aviso aviso--atencao"><span>Seu navegador bloqueou o ' +
          'armazenamento local: os palpites valem apenas para esta sessão.</span></div>';
      }
    }

    atualizarBarra();

    // Deep link para as abas: simulador.html#mata-mata
    const abaInicial = (window.location.hash || '').replace('#', '');
    const validas = ['grupos', 'mata-mata', 'boloes'];
    trocarPainel(validas.indexOf(abaInicial) >= 0 ? abaInicial : 'grupos');
  }

  Copa26.paginas = Copa26.paginas || {};
  Copa26.paginas.simulador = { iniciar };
})(window.Copa26);

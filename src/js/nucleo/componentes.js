/**
 * PortalCopa26 — componentes de renderização reutilizados pelas páginas.
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;

  /** Agrupa jogos pelo dia da tabela (agrupamento visual pedido no PRD §6). */
  function agruparPorDia(jogos) {
    const mapa = new Map();
    for (const j of jogos) {
      if (!mapa.has(j.diaTabela)) mapa.set(j.diaTabela, []);
      mapa.get(j.diaTabela).push(j);
    }
    return [...mapa.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dia, lista]) => ({
        dia,
        jogos: lista.slice().sort((x, y) => util.instanteJogo(x) - util.instanteJogo(y)),
      }));
  }

  /** Um dos lados do confronto: seleção definida ou referência do chaveamento. */
  function lado(cod, ref, posicao) {
    const classe = `jogo__lado jogo__lado--${posicao}`;
    if (cod) {
      return `<div class="${classe}">${util.bandeira(cod)}<span>${util.esc(util.nomeSelecao(cod))}</span></div>`;
    }
    return `<div class="${classe} jogo__lado--indefinido">
      <span class="bandeira-sigla" aria-hidden="true">?</span>
      <span>${util.esc(util.rotuloReferencia(ref))}</span>
    </div>`;
  }

  /**
   * Cartão de jogo (PRD §6): data, hora, mandante, visitante, grupo e estádio.
   * @param {object} j jogo
   * @param {object} [op] { placar:{gm,gv,nosPenais,pm,pv}, mandante, visitante, mostrarData }
   */
  function cartaoJogo(j, op) {
    const opcoes = op || {};
    const fase = util.FASES[j.fase];
    const est = util.estadio(j.estadio);
    const codM = opcoes.mandante !== undefined ? opcoes.mandante : j.mandante;
    const codV = opcoes.visitante !== undefined ? opcoes.visitante : j.visitante;
    const placar = opcoes.placar;
    const temPlacar = placar && Number.isFinite(placar.gm) && Number.isFinite(placar.gv);

    let classeVencedor = '';
    if (temPlacar && placar.gm > placar.gv) classeVencedor = ' jogo--vencedor-mandante';
    else if (temPlacar && placar.gm < placar.gv) classeVencedor = ' jogo--vencedor-visitante';

    const meio = temPlacar
      ? `<div class="jogo__placar" aria-label="Placar">${placar.gm} <span aria-hidden="true">–</span> ${placar.gv}</div>`
      : `<div class="jogo__x" aria-hidden="true">VS</div>`;

    const etiquetaFase = j.fase === 'grupos'
      ? `<span class="badge badge--grupo">Grupo ${util.esc(j.grupo)}</span>`
      : `<span class="badge badge--roxo">${util.esc(fase ? fase.nome : j.fase)}${j.ordem && ['segunda-fase', 'oitavas', 'quartas', 'semifinal'].includes(j.fase) ? ' ' + j.ordem : ''}</span>`;

    const statusBadge = temPlacar
      ? `<span class="badge badge--verde">${placar.nosPenais ? 'Pênaltis' : 'Simulado'}</span>`
      : `<span class="badge badge--neutro">${util.esc(j.status)}</span>`;

    return `<article class="jogo${classeVencedor}" data-jogo="${util.esc(j.id)}">
      <div class="jogo__topo">
        <span class="jogo__numero">#${j.numero}</span>
        ${etiquetaFase}
        ${statusBadge}
        ${opcoes.mostrarData ? `<span>${util.esc(util.dataMedia(j.data))}</span>` : ''}
        <span class="jogo__hora">${util.esc(j.hora)}</span>
      </div>
      <div class="jogo__confronto">
        ${lado(codM, j.mandanteRef, 'mandante')}
        ${meio}
        ${lado(codV, j.visitanteRef, 'visitante')}
      </div>
      ${temPlacar && placar.nosPenais
        ? `<div class="jogo__local"><span>Decisão por pênaltis: ${placar.pm} × ${placar.pv}</span></div>`
        : ''}
      <div class="jogo__local">
        <span>🏟️ ${util.esc(est ? est.estadio : 'A definir')}</span>
        <span>📍 ${util.esc(est ? est.cidade : '—')}${est ? `, ${util.esc(est.pais)}` : ''}</span>
      </div>
    </article>`;
  }

  /** Lista de jogos agrupada por dia, com cabeçalho de data. */
  function listaJogosPorDia(jogos, op) {
    const opcoes = op || {};
    const blocos = agruparPorDia(jogos);
    if (blocos.length === 0) {
      return `<div class="vazio">Nenhum jogo encontrado com os filtros selecionados.</div>`;
    }
    return blocos.map((bloco) => `
      <section class="dia-jogos">
        <h3 class="dia-jogos__titulo">
          ${util.esc(util.dataExtensa(bloco.dia))}
          <span class="badge">${bloco.jogos.length} ${bloco.jogos.length === 1 ? 'jogo' : 'jogos'}</span>
        </h3>
        <div class="lista-jogos">
          ${bloco.jogos.map((j) => cartaoJogo(j, {
            placar: opcoes.placares ? opcoes.placares[j.id] : null,
            mandante: opcoes.selecoesResolvidas ? opcoes.selecoesResolvidas[j.id + ':m'] : undefined,
            visitante: opcoes.selecoesResolvidas ? opcoes.selecoesResolvidas[j.id + ':v'] : undefined,
          })).join('')}
        </div>
      </section>`).join('');
  }

  /**
   * Tabela de classificação de um grupo (PRD §7 + RF-03).
   * @param {object} tabela retorno de Copa26.classificacao.calcularGrupo
   * @param {object} [op] { terceiros, mostrarZonas }
   */
  function tabelaGrupo(tabela, op) {
    const opcoes = op || {};
    const terceiros = opcoes.terceiros || [];
    const mostrarZonas = opcoes.mostrarZonas !== false && tabela.jogosComputados > 0;

    const linhas = tabela.linhas.map((l) => {
      const z = mostrarZonas ? Copa26.classificacao.zona(l, terceiros) : null;
      const classeLinha = [
        z ? `linha--${z}` : '',
        l.cod === 'BRA' ? 'linha--brasil' : '',
      ].filter(Boolean).join(' ');
      const classePos = z ? ` posicao--${z}` : '';
      const titulo = l.desempate ? ` title="Desempate por ${util.esc(l.desempate)}"` : '';

      return `<tr class="${classeLinha}"${titulo}>
        <td><span class="posicao${classePos}">${l.posicao}</span></td>
        <td>
          ${util.selecaoLinha(l.cod)}
          ${l.cabecaDeChave ? '<span class="badge badge--chave" title="Cabeça de chave (Pote 1)">Chave</span>' : ''}
        </td>
        <td class="num">${l.j}</td>
        <td class="num">${l.v}</td>
        <td class="num">${l.e}</td>
        <td class="num">${l.d}</td>
        <td class="num">${l.gp}</td>
        <td class="num">${l.gc}</td>
        <td class="num">${util.esc(util.saldo(l.sg))}</td>
        <td class="num destaque">${l.pts}</td>
      </tr>`;
    }).join('');

    return `<div class="tabela-envolucro">
      <table class="tabela">
        <caption class="oculto-visual">Classificação do Grupo ${util.esc(tabela.grupo)}</caption>
        <thead>
          <tr>
            <th scope="col" title="Posição">#</th>
            <th scope="col">Seleção</th>
            <th scope="col" title="Jogos">P</th>
            <th scope="col" title="Vitórias">V</th>
            <th scope="col" title="Empates">E</th>
            <th scope="col" title="Derrotas">D</th>
            <th scope="col" title="Gols pró">GP</th>
            <th scope="col" title="Gols contra">GC</th>
            <th scope="col" title="Saldo de gols">SG</th>
            <th scope="col" title="Pontos">Pts</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    </div>`;
  }

  /** Legenda das zonas de classificação. */
  const legendaZonas = `<div class="legenda">
    <span><i class="i-verde"></i> Classificado</span>
    <span><i class="i-amarelo"></i> 3º fora das 8 vagas</span>
    <span><i class="i-vermelho"></i> Eliminado</span>
    <span><i class="i-cinza"></i> Sem jogos computados</span>
  </div>`;

  Copa26.componentes = { agruparPorDia, cartaoJogo, listaJogosPorDia, tabelaGrupo, legendaZonas };
})(window.Copa26);

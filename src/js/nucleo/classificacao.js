/**
 * PortalCopa26 — motor de classificação
 *
 * Implementa as regras de negócio das fontes:
 *  - RN-01 (fontes/copa2026_regras_negocio.txt): critérios de desempate dos grupos
 *      1. Pontos  2. Saldo de gols  3. Gols marcados  4. Confronto direto
 *      5. Saldo nos confrontos diretos  6. Fair Play  7. Ranking FIFA
 *    Observação: o item 6 (Fair Play / cartões) não é aplicável — as fontes não
 *    trazem dados de cartões. O motor salta para o item 7.
 *  - RN-02: 1º e 2º de cada grupo + os 8 melhores terceiros avançam (32 times)
 *  - Copa2026_Regra_Terceiros_Colocados.txt: ordenação dos 12 terceiros
 *  - RN-03: empate no mata-mata é decidido nos pênaltis (após prorrogação)
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;
  const PONTOS_VITORIA = 3;
  const PONTOS_EMPATE = 1;
  const VAGAS_TERCEIROS = 8;

  /** Um resultado só entra na conta quando os dois placares são números. */
  function valido(r) {
    return !!r && Number.isFinite(r.m) && Number.isFinite(r.v) && r.m >= 0 && r.v >= 0;
  }

  function linhaVazia(cod) {
    const s = util.selecao(cod);
    return {
      cod,
      nome: s ? s.nome : cod,
      grupo: s ? s.grupo : null,
      cabecaDeChave: s ? s.cabecaDeChave : false,
      rankingOrdem: s ? s.rankingOrdem : 999,
      rankingPosicao: s ? s.rankingPosicao : null,
      j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, pts: 0,
      posicao: 0,
      desempate: null,
    };
  }

  /** Aplica um resultado às linhas de mandante e visitante. */
  function aplicar(linhaM, linhaV, gm, gv) {
    linhaM.j += 1; linhaV.j += 1;
    linhaM.gp += gm; linhaM.gc += gv;
    linhaV.gp += gv; linhaV.gc += gm;
    if (gm > gv) {
      linhaM.v += 1; linhaM.pts += PONTOS_VITORIA;
      linhaV.d += 1;
    } else if (gm < gv) {
      linhaV.v += 1; linhaV.pts += PONTOS_VITORIA;
      linhaM.d += 1;
    } else {
      linhaM.e += 1; linhaM.pts += PONTOS_EMPATE;
      linhaV.e += 1; linhaV.pts += PONTOS_EMPATE;
    }
    linhaM.sg = linhaM.gp - linhaM.gc;
    linhaV.sg = linhaV.gp - linhaV.gc;
  }

  /** Critérios 1 a 3 (pontos, saldo, gols marcados). */
  function compararBase(a, b) {
    return b.pts - a.pts || b.sg - a.sg || b.gp - a.gp;
  }

  /**
   * Mini-tabela dos confrontos diretos entre os times empatados
   * (critérios 4 e 5 da RN-01).
   */
  function miniTabela(codigos, jogosGrupo, resultados) {
    const set = new Set(codigos);
    const mapa = new Map(codigos.map((c) => [c, { pts: 0, gp: 0, gc: 0, sg: 0 }]));
    for (const j of jogosGrupo) {
      if (!set.has(j.mandante) || !set.has(j.visitante)) continue;
      const r = resultados[j.id];
      if (!valido(r)) continue;
      const m = mapa.get(j.mandante);
      const v = mapa.get(j.visitante);
      m.gp += r.m; m.gc += r.v;
      v.gp += r.v; v.gc += r.m;
      if (r.m > r.v) m.pts += PONTOS_VITORIA;
      else if (r.m < r.v) v.pts += PONTOS_VITORIA;
      else { m.pts += PONTOS_EMPATE; v.pts += PONTOS_EMPATE; }
    }
    for (const valor of mapa.values()) valor.sg = valor.gp - valor.gc;
    return mapa;
  }

  /**
   * Ordena as linhas de um grupo aplicando a RN-01 na ordem correta e
   * registrando qual critério separou cada bloco de empatados.
   */
  function ordenarGrupo(linhas, jogosGrupo, resultados) {
    const ordenadas = linhas.slice().sort(compararBase);
    const resultado = [];

    let i = 0;
    while (i < ordenadas.length) {
      let fim = i + 1;
      while (fim < ordenadas.length && compararBase(ordenadas[i], ordenadas[fim]) === 0) fim += 1;

      const bloco = ordenadas.slice(i, fim);
      if (bloco.length === 1) {
        resultado.push(bloco[0]);
      } else {
        const mini = miniTabela(bloco.map((l) => l.cod), jogosGrupo, resultados);
        bloco.sort((a, b) => {
          const ma = mini.get(a.cod);
          const mb = mini.get(b.cod);
          // 4. resultado do confronto direto  5. saldo nos confrontos diretos
          const porConfronto = mb.pts - ma.pts || mb.sg - ma.sg || mb.gp - ma.gp;
          if (porConfronto !== 0) return porConfronto;
          // 6. Fair Play — sem dados nas fontes. 7. Ranking FIFA.
          return a.rankingOrdem - b.rankingOrdem;
        });
        for (let k = 0; k < bloco.length; k += 1) {
          const anterior = k > 0 ? bloco[k - 1] : null;
          if (anterior) {
            const ma = mini.get(anterior.cod);
            const mb = mini.get(bloco[k].cod);
            const separadoPorConfronto = (mb.pts - ma.pts || mb.sg - ma.sg || mb.gp - ma.gp) !== 0;
            bloco[k].desempate = separadoPorConfronto ? 'confronto direto' : 'ranking FIFA';
            if (!anterior.desempate) anterior.desempate = bloco[k].desempate;
          }
        }
        resultado.push(...bloco);
      }
      i = fim;
    }

    resultado.forEach((l, idx) => { l.posicao = idx + 1; });
    return resultado;
  }

  /**
   * Classificação de um grupo.
   * @param {string} grupo letra do grupo (A..L)
   * @param {object} resultados mapa jogoId -> { m, v }
   */
  function calcularGrupo(grupo, resultados) {
    const res = resultados || {};
    const jogosGrupo = util.jogosDoGrupo(grupo);
    const linhas = new Map(util.selecoesDoGrupo(grupo).map((s) => [s.cod, linhaVazia(s.cod)]));

    let computados = 0;
    for (const j of jogosGrupo) {
      const r = res[j.id];
      if (!valido(r)) continue;
      aplicar(linhas.get(j.mandante), linhas.get(j.visitante), r.m, r.v);
      computados += 1;
    }

    return {
      grupo,
      linhas: ordenarGrupo([...linhas.values()], jogosGrupo, res),
      jogosComputados: computados,
      totalJogos: jogosGrupo.length,
      completo: computados === jogosGrupo.length,
    };
  }

  /** Classificação dos 12 grupos. */
  function calcularTodos(resultados) {
    const tabelas = {};
    for (const g of util.grupos) tabelas[g] = calcularGrupo(g, resultados);
    return tabelas;
  }

  /**
   * Ordena os 12 terceiros colocados conforme
   * fontes/Copa2026_Regra_Terceiros_Colocados.txt e marca os 8 que avançam.
   */
  function terceirosColocados(tabelas) {
    const terceiros = Object.keys(tabelas)
      .sort()
      .map((g) => {
        const linha = tabelas[g].linhas[2];
        return linha ? Object.assign({}, linha, { grupo: g }) : null;
      })
      .filter(Boolean);

    terceiros.sort((a, b) =>
      // Pontos > Saldo de gols > Gols marcados > (Fair play: sem dados) > Ranking FIFA
      b.pts - a.pts || b.sg - a.sg || b.gp - a.gp || a.rankingOrdem - b.rankingOrdem
    );

    return terceiros.map((t, i) => Object.assign(t, {
      posicaoEntreTerceiros: i + 1,
      avanca: i < VAGAS_TERCEIROS,
    }));
  }

  /**
   * Times classificados para o mata-mata (RN-02): 24 diretos + 8 terceiros.
   */
  function classificados(tabelas) {
    const primeiros = [];
    const segundos = [];
    for (const g of Object.keys(tabelas).sort()) {
      const l = tabelas[g].linhas;
      if (l[0]) primeiros.push(Object.assign({}, l[0], { grupo: g, origem: `1º ${g}` }));
      if (l[1]) segundos.push(Object.assign({}, l[1], { grupo: g, origem: `2º ${g}` }));
    }
    const terceiros = terceirosColocados(tabelas);
    const avancam = terceiros.filter((t) => t.avanca).map((t) => Object.assign({}, t, { origem: `3º ${t.grupo}` }));
    return {
      primeiros,
      segundos,
      terceiros,
      terceirosQueAvancam: avancam,
      todos: primeiros.concat(segundos, avancam),
    };
  }

  /** Zona de classificação de uma linha, considerando os melhores terceiros. */
  function zona(linha, terceiros) {
    if (linha.posicao <= 2) return 'classificado';
    if (linha.posicao === 3) {
      const t = terceiros.find((x) => x.cod === linha.cod);
      return t && t.avanca ? 'classificado' : 'repescagem';
    }
    return 'eliminado';
  }

  // ------------------------------------------------------------- Mata-mata
  const FASES_MATA_MATA = ['segunda-fase', 'oitavas', 'quartas', 'semifinal', 'terceiro-lugar', 'final'];

  /**
   * Resolve todo o mata-mata a partir dos placares informados.
   * Empate no tempo normal é decidido nos pênaltis (RN-03).
   * @returns {Map<string, object>} jogoId -> { mandante, visitante, gm, gv, vencedor, perdedor, decidido, nosPenais }
   */
  function resolverMataMata(resultados) {
    const res = resultados || {};
    const mapa = new Map();

    const ladoDe = (cod, ref) => {
      if (cod) return cod;
      if (!ref) return null;
      const anterior = mapa.get(ref.jogo);
      if (!anterior || !anterior.decidido) return null;
      return ref.tipo === 'vencedor' ? anterior.vencedor : anterior.perdedor;
    };

    for (const fase of FASES_MATA_MATA) {
      for (const j of util.jogosDaFase(fase)) {
        const mandante = ladoDe(j.mandante, j.mandanteRef);
        const visitante = ladoDe(j.visitante, j.visitanteRef);
        const r = res[j.id];
        const info = {
          jogo: j.id,
          fase,
          mandante,
          visitante,
          gm: valido(r) ? r.m : null,
          gv: valido(r) ? r.v : null,
          pm: r && Number.isFinite(r.pm) ? r.pm : null,
          pv: r && Number.isFinite(r.pv) ? r.pv : null,
          vencedor: null,
          perdedor: null,
          decidido: false,
          nosPenais: false,
          empatado: false,
        };

        if (mandante && visitante && valido(r)) {
          if (r.m > r.v) {
            info.vencedor = mandante; info.perdedor = visitante; info.decidido = true;
          } else if (r.m < r.v) {
            info.vencedor = visitante; info.perdedor = mandante; info.decidido = true;
          } else {
            info.empatado = true;
            if (Number.isFinite(info.pm) && Number.isFinite(info.pv) && info.pm !== info.pv) {
              info.nosPenais = true;
              info.decidido = true;
              if (info.pm > info.pv) { info.vencedor = mandante; info.perdedor = visitante; }
              else { info.vencedor = visitante; info.perdedor = mandante; }
            }
          }
        }
        mapa.set(j.id, info);
      }
    }
    return mapa;
  }

  /** Caminho percorrido por uma seleção no mata-mata (do início até a final). */
  function caminho(cod, mataMata) {
    if (!cod) return [];
    const etapas = [];
    for (const info of mataMata.values()) {
      if (info.mandante !== cod && info.visitante !== cod) continue;
      const adversario = info.mandante === cod ? info.visitante : info.mandante;
      const golsPro = info.mandante === cod ? info.gm : info.gv;
      const golsContra = info.mandante === cod ? info.gv : info.gm;
      etapas.push({
        fase: info.fase,
        adversario,
        golsPro,
        golsContra,
        venceu: info.vencedor === cod,
        nosPenais: info.nosPenais,
      });
    }
    return etapas;
  }

  /** Resumo de progresso de um conjunto de palpites. */
  function resumo(resultados) {
    const res = resultados || {};
    const total = { grupos: 0, mataMata: 0 };
    const feitos = { grupos: 0, mataMata: 0 };
    for (const j of util.jogos) {
      const chave = j.fase === 'grupos' ? 'grupos' : 'mataMata';
      total[chave] += 1;
      if (valido(res[j.id])) feitos[chave] += 1;
    }
    const mataMata = resolverMataMata(res);
    const final = mataMata.get('FI01');
    return {
      total, feitos,
      totalGeral: total.grupos + total.mataMata,
      feitosGeral: feitos.grupos + feitos.mataMata,
      campeao: final && final.decidido ? final.vencedor : null,
      vice: final && final.decidido ? final.perdedor : null,
    };
  }

  Copa26.classificacao = {
    VAGAS_TERCEIROS,
    valido,
    calcularGrupo,
    calcularTodos,
    terceirosColocados,
    classificados,
    zona,
    resolverMataMata,
    caminho,
    resumo,
  };
})(window.Copa26);

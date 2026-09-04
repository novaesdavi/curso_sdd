/**
 * PortalCopa26 — página Home (PRD §5 / RF-01)
 * Hero, países-sede, contagem regressiva, próximos jogos, ranking e chamada
 * para o simulador.
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;
  const comp = Copa26.componentes;

  /** Instante do primeiro e do último jogo, usados nos estados da página. */
  const inicio = util.instanteJogo(util.primeiroJogo);
  const jogoFinal = util.jogos[util.jogos.length - 1];
  const fim = util.instanteJogo(jogoFinal);

  // ------------------------------------------------------- Contagem regressiva
  function montarContagem() {
    const alvo = util.$('#contagem');
    if (!alvo) return;

    function pintar() {
      const agora = Date.now();
      const restante = inicio - agora;

      if (restante <= 0) {
        const emAndamento = agora <= fim + 3 * 60 * 60 * 1000;
        alvo.innerHTML = `
          <p class="contagem-titulo">${emAndamento ? 'A Copa está rolando' : 'Copa do Mundo FIFA 2026'}</p>
          <div class="aviso" style="justify-content:center">
            <span>${emAndamento
              ? 'A Copa do Mundo FIFA 2026 já começou. Acompanhe a tabela de jogos e a classificação dos grupos.'
              : 'Torneio encerrado no calendário oficial. Explore a tabela completa, os elencos e simule os resultados.'}</span>
          </div>`;
        return false;
      }

      const seg = Math.floor(restante / 1000);
      const partes = [
        { valor: Math.floor(seg / 86400), rotulo: 'dias' },
        { valor: Math.floor((seg % 86400) / 3600), rotulo: 'horas' },
        { valor: Math.floor((seg % 3600) / 60), rotulo: 'min' },
        { valor: seg % 60, rotulo: 'seg' },
      ];

      alvo.innerHTML = `
        <p class="contagem-titulo">Contagem regressiva para a bola rolar</p>
        <div class="contagem" role="timer" aria-live="off">
          ${partes.map((p) => `
            <div class="contagem__item">
              <span class="contagem__numero">${String(p.valor).padStart(2, '0')}</span>
              <span class="contagem__rotulo">${p.rotulo}</span>
            </div>`).join('')}
        </div>
        <p class="nota-fonte" style="text-align:center">
          ${util.esc(util.nomeSelecao(util.primeiroJogo.mandante))} × ${util.esc(util.nomeSelecao(util.primeiroJogo.visitante))} ·
          ${util.esc(util.dataExtensa(util.primeiroJogo.data))}, ${util.esc(util.primeiroJogo.hora)} (Brasília)
        </p>`;
      return true;
    }

    if (pintar()) {
      const timer = window.setInterval(() => {
        if (!pintar()) window.clearInterval(timer);
      }, 1000);
    }
  }

  // ------------------------------------------------------------- Países-sede
  function montarSedes() {
    const alvo = util.$('#paises-sede');
    if (!alvo) return;

    alvo.innerHTML = util.PAISES_SEDE.map((pais) => {
      const sedes = util.estadios.filter((e) => e.pais === pais.nome);
      const jogosNoPais = util.jogos.filter((j) => {
        const e = util.estadio(j.estadio);
        return e && e.pais === pais.nome;
      }).length;

      return `<article class="cartao pais-sede pais-sede--${pais.cod}">
        <div class="pais-sede__topo">
          ${util.bandeira(pais.cod, 'g')}
          <div>
            <h3 class="pais-sede__nome">${util.esc(pais.nome)}</h3>
            <span class="pais-sede__meta">${sedes.length} ${sedes.length === 1 ? 'cidade-sede' : 'cidades-sede'} · ${jogosNoPais} jogos</span>
          </div>
        </div>
        <ul>
          ${sedes.map((e) => `<li><span>${util.esc(e.cidade)}</span> <b>${util.esc(e.estadio)}</b></li>`).join('')}
        </ul>
      </article>`;
    }).join('');
  }

  // ---------------------------------------------------------- Próximos jogos
  function montarProximosJogos() {
    const alvo = util.$('#proximos-jogos');
    const titulo = util.$('#proximos-jogos-titulo');
    if (!alvo) return;

    const agora = Date.now();
    let lista = util.jogos
      .filter((j) => util.instanteJogo(j) >= agora)
      .sort((a, b) => util.instanteJogo(a) - util.instanteJogo(b))
      .slice(0, 6);

    let rotulo = 'Próximos jogos';
    if (lista.length === 0) {
      // Fora da janela do torneio: mostra a rodada de abertura.
      lista = util.jogos.slice(0, 6);
      rotulo = 'Jogos de abertura';
    }

    if (titulo) titulo.textContent = rotulo;
    alvo.innerHTML = `<div class="lista-jogos">
      ${lista.map((j) => comp.cartaoJogo(j, { mostrarData: true })).join('')}
    </div>`;
  }

  // ------------------------------------------------------------- Ranking FIFA
  function montarRanking() {
    const alvo = util.$('#ranking-resumo');
    if (!alvo) return;

    const topo = util.ranking.slice(0, 10);
    alvo.innerHTML = `<div class="tabela-envolucro">
      <table class="tabela">
        <caption class="oculto-visual">Top 10 do Ranking FIFA</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Seleção</th>
            <th scope="col">Grupo</th>
            <th scope="col">Pontos</th>
          </tr>
        </thead>
        <tbody>
          ${topo.map((r) => {
            const s = r.cod ? util.selecao(r.cod) : null;
            return `<tr>
              <td><span class="posicao">${r.posicao}</span></td>
              <td>${r.cod ? util.selecaoLinha(r.cod) : `<span class="selecao-linha"><span class="bandeira-sigla" aria-hidden="true">—</span><span>${util.esc(r.nome)}</span></span>`}</td>
              <td>${s ? `<span class="badge badge--grupo">${util.esc(s.grupo)}</span>` : '<span class="badge badge--neutro">Fora</span>'}</td>
              <td class="num destaque">${util.esc(util.decimal(r.pontos))}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
  }

  // ------------------------------------------------------------- Estatísticas
  function montarEstatisticas() {
    const alvo = util.$('#estatisticas');
    if (!alvo) return;

    const dados = [
      { valor: util.selecoes.length, rotulo: 'Seleções' },
      { valor: util.estadios.length, rotulo: 'Cidades-sede' },
      { valor: util.jogos.length, rotulo: 'Jogos' },
      { valor: util.grupos.length, rotulo: 'Grupos' },
    ];
    alvo.innerHTML = dados.map((d) => `
      <div class="estatistica">
        <span class="estatistica__valor">${d.valor}</span>
        <span class="estatistica__rotulo">${util.esc(d.rotulo)}</span>
      </div>`).join('');
  }

  function montarSedesHero() {
    const alvo = util.$('#sedes-hero');
    if (!alvo) return;
    const cores = { CAN: 'var(--canada)', USA: 'var(--eua)', MEX: 'var(--mexico)' };
    alvo.innerHTML = util.PAISES_SEDE.map((p) =>
      `<span class="sede-pilula" style="--cor:${cores[p.cod]}">${util.bandeira(p.cod)} ${util.esc(p.nome)}</span>`
    ).join('');
  }

  function iniciar() {
    montarSedesHero();
    montarContagem();
    montarEstatisticas();
    montarSedes();
    montarProximosJogos();
    montarRanking();
  }

  Copa26.paginas = Copa26.paginas || {};
  Copa26.paginas.home = { iniciar };
})(window.Copa26);

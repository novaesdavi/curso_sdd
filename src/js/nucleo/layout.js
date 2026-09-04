/**
 * PortalCopa26 — cabeçalho, navegação e rodapé compartilhados.
 * Cada página declara <body data-pagina="jogos"> para marcar o item ativo.
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const util = Copa26.util;

  const PAGINAS = [
    { id: 'home', rotulo: 'Home', href: 'index.html' },
    { id: 'jogos', rotulo: 'Jogos', href: 'jogos.html' },
    { id: 'grupos', rotulo: 'Grupos', href: 'grupos.html' },
    { id: 'equipes', rotulo: 'Equipes', href: 'equipes.html' },
    { id: 'ranking', rotulo: 'Ranking', href: 'ranking.html' },
    { id: 'simulador', rotulo: 'Simulador', href: 'simulador.html' },
  ];

  function itens(atual) {
    return PAGINAS.map((p) => {
      const ativo = p.id === atual ? ' aria-current="page"' : '';
      return `<li><a href="${p.href}"${ativo}>${util.esc(p.rotulo)}</a></li>`;
    }).join('');
  }

  function montarCabecalho(atual) {
    const alvo = util.$('#cabecalho');
    if (!alvo) return;
    alvo.className = 'cabecalho';
    alvo.innerHTML = `
      <div class="container cabecalho__interno">
        <a class="marca" href="index.html">
          <img class="marca__logo" src="${util.LOGO_COPA}" alt="Logo da Copa do Mundo FIFA 2026"
               onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'marca__logo',ariaHidden:'true'}))">
          <span class="marca__texto">PortalCopa26<small>Copa do Mundo FIFA 2026</small></span>
        </a>
        <nav class="navegacao" aria-label="Navegação principal"><ul>${itens(atual)}</ul></nav>
        <button class="botao-menu" type="button" aria-expanded="false" aria-controls="navegacao-movel">
          <span aria-hidden="true">☰</span> Menu
        </button>
      </div>
      <nav class="navegacao navegacao--movel container" id="navegacao-movel" aria-label="Navegação principal (mobile)">
        <ul>${itens(atual)}</ul>
      </nav>`;

    const botao = util.$('.botao-menu', alvo);
    const menu = util.$('#navegacao-movel', alvo);
    botao.addEventListener('click', () => {
      const aberto = menu.classList.toggle('aberta');
      botao.setAttribute('aria-expanded', String(aberto));
    });
  }

  function montarRodape() {
    const alvo = util.$('#rodape');
    if (!alvo) return;
    alvo.className = 'rodape';
    alvo.innerHTML = `
      <div class="container rodape__interno">
        <div>
          <strong>PortalCopa26</strong> — protótipo HTML/CSS/JavaScript do portal da Copa do Mundo FIFA 2026.
          <p style="margin:.5rem 0 0">
            ${util.jogos.length} jogos · ${util.selecoes.length} seleções · ${util.grupos.length} grupos ·
            ${util.estadios.length} cidades-sede. Horários no fuso de Brasília (UTC−3).
          </p>
          <p class="nota-fonte">
            Dados carregados por seed a partir dos arquivos da pasta <code>fontes/</code>.
            Bandeiras e logo obtidos da API pública da FIFA.
          </p>
        </div>
        <div>
          <strong>Navegação</strong>
          <div class="rodape__links" style="margin-top:.5rem">
            ${PAGINAS.map((p) => `<a href="${p.href}">${util.esc(p.rotulo)}</a>`).join('')}
          </div>
        </div>
      </div>`;
  }

  function iniciar() {
    const pagina = document.body.getAttribute('data-pagina') || '';
    montarCabecalho(pagina);
    montarRodape();
  }

  Copa26.layout = { PAGINAS, iniciar };
})(window.Copa26);

/**
 * PortalCopa26 — persistência dos bolões (simulações)
 *
 * O protótipo usa localStorage. Na evolução para Blazor/EF Core/SQLite este
 * módulo é o único ponto a substituir por chamadas ao banco.
 */
window.Copa26 = window.Copa26 || {};

(function (Copa26) {
  'use strict';

  const CHAVE = 'portalcopa26.boloes.v1';
  let memoria = null; // fallback quando o localStorage não está disponível

  function disponivel() {
    try {
      const teste = '__copa26__';
      window.localStorage.setItem(teste, '1');
      window.localStorage.removeItem(teste);
      return true;
    } catch (e) {
      return false;
    }
  }

  const temStorage = disponivel();

  function estadoInicial() {
    const id = novoId();
    return {
      versao: 1,
      ativo: id,
      boloes: [{
        id,
        nome: 'Meu palpite',
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
        resultados: {},
      }],
    };
  }

  function novoId() {
    return 'b' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /**
   * O estado inicial precisa ser gravado no primeiro acesso: como cada
   * estadoInicial() gera um id novo, devolvê-lo sem persistir faria leituras
   * consecutivas retornarem bolões diferentes (o ativo nunca casaria com a
   * lista).
   */
  function ler() {
    if (!temStorage) {
      if (!memoria) memoria = estadoInicial();
      return memoria;
    }
    try {
      const bruto = window.localStorage.getItem(CHAVE);
      if (bruto) {
        const dados = JSON.parse(bruto);
        if (dados && Array.isArray(dados.boloes) && dados.boloes.length > 0) return dados;
      }
    } catch (e) {
      // conteúdo corrompido: recomeça do estado inicial
    }
    return gravar(estadoInicial());
  }

  function gravar(estado) {
    estado.atualizadoEm = new Date().toISOString();
    if (!temStorage) { memoria = estado; return estado; }
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {
      memoria = estado;
    }
    return estado;
  }

  // ------------------------------------------------------------------- API
  const listar = () => ler().boloes;

  function ativo() {
    const estado = ler();
    return estado.boloes.find((b) => b.id === estado.ativo) || estado.boloes[0];
  }

  function definirAtivo(id) {
    const estado = ler();
    if (estado.boloes.some((b) => b.id === id)) {
      estado.ativo = id;
      gravar(estado);
    }
    return ativo();
  }

  function criar(nome, resultados) {
    const estado = ler();
    const bolao = {
      id: novoId(),
      nome: (nome || '').trim() || `Bolão ${estado.boloes.length + 1}`,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
      resultados: resultados ? JSON.parse(JSON.stringify(resultados)) : {},
    };
    estado.boloes.push(bolao);
    estado.ativo = bolao.id;
    gravar(estado);
    return bolao;
  }

  function duplicar(id) {
    const origem = ler().boloes.find((b) => b.id === id);
    if (!origem) return null;
    return criar(`${origem.nome} (cópia)`, origem.resultados);
  }

  function renomear(id, nome) {
    const estado = ler();
    const bolao = estado.boloes.find((b) => b.id === id);
    if (!bolao) return null;
    bolao.nome = (nome || '').trim() || bolao.nome;
    bolao.atualizadoEm = new Date().toISOString();
    gravar(estado);
    return bolao;
  }

  function remover(id) {
    const estado = ler();
    if (estado.boloes.length <= 1) return false;
    estado.boloes = estado.boloes.filter((b) => b.id !== id);
    if (estado.ativo === id) estado.ativo = estado.boloes[0].id;
    gravar(estado);
    return true;
  }

  /** Grava (ou apaga, quando valor nulo) o palpite de um jogo. */
  function salvarPalpite(jogoId, valor) {
    const estado = ler();
    const bolao = estado.boloes.find((b) => b.id === estado.ativo) || estado.boloes[0];
    if (valor == null) delete bolao.resultados[jogoId];
    else bolao.resultados[jogoId] = valor;
    bolao.atualizadoEm = new Date().toISOString();
    gravar(estado);
    return bolao;
  }

  /** Substitui todos os palpites do bolão ativo. */
  function substituirResultados(resultados) {
    const estado = ler();
    const bolao = estado.boloes.find((b) => b.id === estado.ativo) || estado.boloes[0];
    bolao.resultados = resultados ? JSON.parse(JSON.stringify(resultados)) : {};
    bolao.atualizadoEm = new Date().toISOString();
    gravar(estado);
    return bolao;
  }

  /** Apaga os palpites de um conjunto de jogos (ou todos, se omitido). */
  function limpar(jogoIds) {
    const estado = ler();
    const bolao = estado.boloes.find((b) => b.id === estado.ativo) || estado.boloes[0];
    if (!jogoIds) bolao.resultados = {};
    else for (const id of jogoIds) delete bolao.resultados[id];
    bolao.atualizadoEm = new Date().toISOString();
    gravar(estado);
    return bolao;
  }

  Copa26.armazenamento = {
    persistente: temStorage,
    listar, ativo, definirAtivo, criar, duplicar, renomear, remover,
    salvarPalpite, substituirResultados, limpar,
  };
})(window.Copa26);

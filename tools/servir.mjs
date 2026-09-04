/**
 * PortalCopa26 — servidor estático de desenvolvimento.
 * O protótipo também abre direto pelo sistema de arquivos (file://); este
 * servidor existe só para reproduzir o cenário de produção.
 *
 * Uso: node tools/servir.mjs [porta]
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const porta = Number(process.argv[2]) || 5173;

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${porta}`);
    let caminho = decodeURIComponent(url.pathname);
    if (caminho === '/' || caminho.endsWith('/')) caminho += 'index.html';

    // Impede sair da pasta src/
    const destino = join(raiz, normalize(caminho).replace(/^([/\\])+/, ''));
    if (!destino.startsWith(raiz)) {
      res.writeHead(403).end('Acesso negado');
      return;
    }

    const conteudo = await readFile(destino);
    res.writeHead(200, {
      'Content-Type': TIPOS[extname(destino).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(conteudo);
  } catch (erro) {
    res.writeHead(erro.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(erro.code === 'ENOENT' ? 'Página não encontrada' : 'Erro interno');
  }
}).listen(porta, () => {
  console.log(`PortalCopa26 em http://localhost:${porta}`);
});

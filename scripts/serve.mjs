import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex + 1] : process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Provide a valid port with --port <number>');
if (!existsSync(path.join(root, 'index.html'))) throw new Error('Build the site first with npm run build');
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.pdf': 'application/pdf',
  '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mp3': 'audio/mpeg', '.txt': 'text/plain; charset=utf-8'
};
const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Invalid URL');
    return;
  }
  if (pathname === '/index.php') pathname = '/index.html';
  let filename = path.resolve(root, `.${pathname}`);
  if (!filename.startsWith(root + path.sep) && filename !== root) {
    response.writeHead(403).end('Forbidden');
    return;
  }
  let status = 200;
  if (existsSync(filename) && statSync(filename).isDirectory()) {
    if (!pathname.endsWith('/')) {
      const query = new URL(request.url, 'http://localhost').search;
      response.writeHead(301, { Location: pathname + '/' + query }).end();
      return;
    }
    filename = path.join(filename, 'index.html');
  }
  if (!existsSync(filename) || !statSync(filename).isFile()) {
    filename = path.join(root, '404.html');
    status = 404;
  }
  const size = statSync(filename).size;
  const headers = { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Content-Length': size };
  const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
  let start = 0;
  let end = size - 1;
  if (range && status === 200) {
    start = Number(range[1]);
    end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end || start >= size) {
      response.writeHead(416, { 'Content-Range': `bytes */${size}` }).end();
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
    headers['Content-Length'] = end - start + 1;
  }
  headers['Accept-Ranges'] = 'bytes';
  response.writeHead(status, headers);
  if (request.method === 'HEAD') response.end();
  else pipeline(createReadStream(filename, { start, end }), response, error => {
    if (error && error.code !== 'ERR_STREAM_PREMATURE_CLOSE') console.error('Static response failed:', error);
  });
});
server.on('error', error => { console.error('Preview server failed:', error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Static preview: http://localhost:${port} (serving dist/ only)`));

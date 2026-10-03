import http from 'node:http';
import { stat, readFile } from 'node:fs/promises';
import path from 'node:path';

const mime = {'.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.pdf':'application/pdf', '.xml':'application/xml'};

export function createStaticServer({ dist, base }) {
  return http.createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (pathname === '/' && base !== '/') { res.writeHead(302, { Location: base }); return res.end(); }
      if (!pathname.startsWith(base)) { res.writeHead(404); return res.end('Not found'); }
      let file = path.resolve(dist, pathname.slice(base.length));
      if (file !== dist && !file.startsWith(`${dist}${path.sep}`)) { res.writeHead(403); return res.end('Forbidden'); }
      let metadata;
      try { metadata = await stat(file); } catch { /* respond with actual 404 below */ }
      if (metadata?.isDirectory()) {
        if (!pathname.endsWith('/')) { res.writeHead(301, { Location: `${pathname}/` }); return res.end(); }
        file = path.join(file, 'index.html');
      }
      try {
        const bytes = await readFile(file);
        res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
        return res.end(req.method === 'HEAD' ? undefined : bytes);
      } catch {
        res.writeHead(404, { 'Content-Type':'text/html; charset=utf-8' });
        return res.end(req.method === 'HEAD' ? undefined : await readFile(path.join(dist, '404.html')));
      }
    } catch { res.writeHead(400); res.end('Bad request'); }
  });
}

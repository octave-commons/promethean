import { createServer } from 'node:http';
import httpProxy from 'http-proxy';
import { readFile, stat } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..', 'sites');
const PROXY_PATHS = ['/llm', '/bridge'];

export function startSitesServer(
    port = Number(process.env.SITES_PORT) || 4500,
    proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:8080',
) {
    const proxy = httpProxy.createProxyServer({ changeOrigin: true });
    const server = createServer(async (req, res) => {
        const url = new URL(req.url, 'http://localhost');

        if (PROXY_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'))) {
            proxy.web(req, res, { target: proxyUrl }, (err) => {
                res.writeHead(502);
                res.end('Proxy error');
            });
            return;
        }
        let filePath = join(root, decodeURIComponent(url.pathname));
        try {
            const st = await stat(filePath);
            if (st.isDirectory()) {
                filePath = join(filePath, 'index.html');
            }
            const data = await readFile(filePath);
            const type = MIME_TYPES[extname(filePath).toLowerCase()] || 'application/octet-stream';
            res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
            res.end(data);
        } catch {
            res.writeHead(404);
            res.end('Not found');
        }
    });
    server.on('upgrade', (req, socket, head) => {
        const url = new URL(req.url, 'http://localhost');
        if (PROXY_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'))) {
            proxy.ws(req, socket, head, { target: proxyUrl });
        } else {
            socket.destroy();
        }
    });
    return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    startSitesServer().then((server) => {
        const { port } = server.address();
        console.log(`Serving sites from ${root} on http://localhost:${port}`);
    });
}

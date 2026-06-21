/**
 * Servidor local para testes em outros dispositivos (mesma rede Wi‑Fi).
 * Uso: node serve.js   ou   duplo clique em start-teste.bat
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = process.env.PORT || 8765;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function obterIpsLocais() {
  const ips = [];
  const interfaces = os.networkInterfaces();
  for (const nome of Object.keys(interfaces)) {
    for (const iface of interfaces[nome]) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
        ips.push({ ip: iface.address, interface: nome });
      }
    }
  }
  return ips;
}

function montarInfoRede() {
  const ips = obterIpsLocais();
  const links = ips.map(({ ip, interface: iface }) => ({
    ip,
    interface: iface,
    url: `http://${ip}:${PORT}/`
  }));
  return {
    ok: true,
    port: PORT,
    localhost: `http://localhost:${PORT}/`,
    rede: `http://localhost:${PORT}/rede.html`,
    primary: links[0]?.url || null,
    links
  };
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
}

function servirArquivo(req, res, urlPath) {
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(ROOT, urlPath));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500);
      res.end(err.code === 'ENOENT' ? 'Not Found' : 'Server Error');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  cors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  if (urlPath === '/api/rede-info' || urlPath === '/api/rede-info.json') {
    const info = montarInfoRede();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(info, null, 2));
    return;
  }

  servirArquivo(req, res, urlPath);
});

server.listen(PORT, '0.0.0.0', () => {
  const info = montarInfoRede();

  console.log('\n  🚀 Viagem Sistema Solar — Servidor de teste\n');
  console.log(`  Pasta: ${ROOT}`);
  console.log(`  Porta: ${PORT}\n`);
  console.log('  No computador:');
  console.log(`    → ${info.localhost}`);
  console.log(`    → ${info.rede}  (link + QR Code)\n`);

  if (info.links.length) {
    console.log('  📱 No celular/tablet (mesma Wi‑Fi):');
    info.links.forEach(({ url, interface: iface }) => {
      console.log(`    → ${url}  (${iface})`);
    });
    console.log(`\n  📱 Página de teste no celular:`);
    info.links.forEach(({ ip, interface: iface }) => {
      console.log(`    → http://${ip}:${PORT}/rede.html  (${iface})`);
    });
    console.log('');
  } else {
    console.log('  ⚠ Não foi possível detectar IP Wi‑Fi.\n');
  }

  if (process.env.ABRIR_NAVEGADOR !== '0') {
    const abrir = process.platform === 'win32'
      ? `start "" "${info.rede}"`
      : process.platform === 'darwin'
        ? `open "${info.rede}"`
        : `xdg-open "${info.rede}"`;
    setTimeout(() => exec(abrir, () => {}), 800);
  }
});

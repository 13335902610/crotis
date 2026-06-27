require('dotenv').config();
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname);
const PORT = process.env.PORT || 4280;

const apiHandlers = {
  '/api/bookings': require('./api/bookings/index.js'),
  '/api/status': require('./api/status/index.js')
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function getMimeType(filePath) {
  return mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

async function collectBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  const type = (req.headers['content-type'] || '').split(';')[0].trim();
  if (!raw) return undefined;
  if (type === 'application/json') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }
  return raw;
}

function createReq(req, parsedUrl, body) {
  const query = parsedUrl?.query || {};
  return {
    method: req.method,
    query,
    body,
    headers: req.headers,
    url: req.url
  };
}

async function handleApi(req, res, parsedUrl) {
  const handler = apiHandlers[parsedUrl.pathname];
  if (!handler) {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, message: 'API not found' }));
    return;
  }

  const body = await collectBody(req);
  const reqObj = createReq(req, parsedUrl, body);
  let statusCode = 200;
  let headers = { 'Content-Type': 'application/json; charset=utf-8' };
  let responseBody = '';

  const fakeRes = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      responseBody = JSON.stringify(payload);
      headers = { ...headers, 'Content-Type': 'application/json; charset=utf-8' };
      return this;
    }
  };

  try {
    await handler(reqObj, fakeRes);
    res.writeHead(statusCode, headers);
    res.end(responseBody);
  } catch (error) {
    const message = error?.message || 'Internal server error';
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, message }));
  }
}

async function handleStatic(req, res, parsedUrl) {
  let pathname = parsedUrl.pathname;
  if (pathname === '/') pathname = '/index.html';

  const filePath = path.join(ROOT, pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Invalid path');
    return;
  }

  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { 'Content-Type': getMimeType(filePath) });
    res.end(data);
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  if (parsedUrl.pathname?.startsWith('/api/')) {
    await handleApi(req, res, parsedUrl);
    return;
  }
  await handleStatic(req, res, parsedUrl);
});

server.listen(PORT, () => {
  console.log(`Local server running at http://localhost:${PORT}`);
  console.log('Use this URL to open index.html and admin.html in the browser.');
});

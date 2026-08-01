const http = require('http');
const fs = require('fs');
const path = require('path');

const host = '0.0.0.0';
const port = 3000;
const rootDir = __dirname;
const uploadDir = path.join(rootDir, 'uploads');
const productsFile = path.join(rootDir, 'products.json');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.html' ? 'text/html' :
         ext === '.css' ? 'text/css' :
         ext === '.js' ? 'application/javascript' :
         ext === '.json' ? 'application/json' :
         ext === '.webp' ? 'image/webp' :
         ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
         ext === '.png' ? 'image/png' :
         ext === '.svg' ? 'image/svg+xml' :
         ext === '.ico' ? 'image/x-icon' :
         ext === '.txt' ? 'text/plain' : 'application/octet-stream';
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(payload));
}

function sendFile(res, filePath) {
  res.writeHead(200, { 'Content-Type': getContentType(filePath) });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  if (url === '/upload' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
      sendJson(res, 400, { error: 'Boundary tidak ditemukan' });
      return;
    }

    const boundary = `--${boundaryMatch[1]}`;
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);
    const bodyText = body.toString('latin1');
    const parts = bodyText.split(boundary);
    let fileName = '';
    let fileBuffer = Buffer.alloc(0);

    for (const part of parts) {
      if (!part.includes('filename=')) continue;
      const headerEnd = part.indexOf('\r\n\r\n');
      if (headerEnd === -1) continue;
      const rawHeaders = part.slice(0, headerEnd);
      const rawContent = part.slice(headerEnd + 4);
      const fileNameMatch = rawHeaders.match(/filename="([^"]+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
      const contentEnd = rawContent.lastIndexOf('\r\n');
      const content = contentEnd !== -1 ? rawContent.slice(0, contentEnd) : rawContent;
      fileBuffer = Buffer.from(content, 'latin1');
      break;
    }

    if (!fileName || fileBuffer.length === 0) {
      sendJson(res, 400, { error: 'File tidak valid' });
      return;
    }

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const savePath = path.join(uploadDir, safeName);
    fs.writeFileSync(savePath, fileBuffer);

    const hostHeader = req.headers.host || `localhost:${port}`;
    const urlPath = `/uploads/${safeName}`;
    sendJson(res, 200, { url: `http://${hostHeader}${urlPath}` });
    return;
  }

  if (url === '/save-products' && req.method === 'POST') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    let data;
    try {
      data = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
      if (!Array.isArray(data)) {
        throw new Error('Format produk tidak valid');
      }
    } catch (error) {
      sendJson(res, 400, { error: 'JSON tidak valid' });
      return;
    }

    try {
      fs.writeFileSync(productsFile, JSON.stringify(data, null, 2), 'utf-8');
      sendJson(res, 200, { success: true });
    } catch (error) {
      sendJson(res, 500, { error: 'Gagal menyimpan products.json' });
    }
    return;
  }

  if (req.method === 'GET' && url.startsWith('/uploads/')) {
    const filePath = path.join(rootDir, url.replace(/^\//, ''));
    if (filePath.indexOf(rootDir) !== 0 || !fs.existsSync(filePath)) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }
    sendFile(res, filePath);
    return;
  }

  if (req.method === 'GET') {
    const requestPath = url === '/' ? '/index.html' : url;
    const filePath = path.normalize(path.join(rootDir, requestPath.replace(/^\//, '')));
    if (filePath.indexOf(rootDir) !== 0 || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }
    sendFile(res, filePath);
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
});

server.listen(port, host, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

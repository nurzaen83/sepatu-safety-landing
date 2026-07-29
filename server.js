const http = require('http');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const pump = promisify(pipeline);

const host = '127.0.0.1';
const port = 3000;
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/upload' && req.method === 'POST') {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Boundary tidak ditemukan' }));
      return;
    }

    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);
    const boundaryBuffer = Buffer.from(`--${boundary}`);
    const parts = body.split(boundaryBuffer);
    let fileName = '';
    let fileBuffer = Buffer.alloc(0);

    for (const part of parts) {
      if (!part.includes(Buffer.from('filename='))) continue;
      const headers = part.toString('binary').split('\r\n\r\n');
      const contentDisposition = headers[0] || '';
      const fileNameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (fileNameMatch) {
        fileName = fileNameMatch[1];
      }
      const fileContent = part.slice(part.indexOf('\r\n\r\n') + 4, part.length - 2);
      fileBuffer = fileContent;
      break;
    }

    if (!fileName || fileBuffer.length === 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'File tidak valid' }));
      return;
    }

    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const savePath = path.join(uploadDir, safeName);
    fs.writeFileSync(savePath, fileBuffer);

    const url = `http://localhost:${port}/uploads/${safeName}`;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ url }));
    return;
  }

  if (req.url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, req.url.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      const ext = path.extname(filePath).toLowerCase();
      const type = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(port, host, () => {
  console.log(`Upload server berjalan di http://${host}:${port}`);
});

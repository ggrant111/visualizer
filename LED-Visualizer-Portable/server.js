// server.js — Multi-device DDP streamer (DDP with chunking)
import dgram from 'node:dgram';
import http from 'node:http';
import { WebSocketServer } from 'ws';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const HTTP_PORT = parseInt(process.env.HTTP_PORT || '8137', 10);

const udp = dgram.createSocket('udp4');

// Static file server for UI
const server = http.createServer((req, res) => {
  // Handle API endpoint for saving devices
  if (req.method === 'POST' && req.url === '/api/devices/save') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const devicesData = JSON.parse(body);
        const devicesPath = path.join(process.cwd(), 'public', 'data', 'devices.json');
        const jsonData = {
          devices: devicesData.devices || devicesData,
          exported: new Date().toISOString(),
          version: '1.0'
        };
        fs.writeFileSync(devicesPath, JSON.stringify(jsonData, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Devices saved to devices.json' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Handle API endpoint for deleting custom palettes (check before save to avoid conflicts)
  if (req.method === 'DELETE' && req.url.startsWith('/api/palettes/') && req.url !== '/api/palettes/save') {
    const paletteName = decodeURIComponent(req.url.replace('/api/palettes/', ''));
    try {
      const palettesPath = path.join(process.cwd(), 'public', 'data', 'customPalettes.json');
      
      if (!fs.existsSync(palettesPath)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Palettes file not found' }));
        return;
      }
      
      const existing = fs.readFileSync(palettesPath, 'utf8');
      const data = JSON.parse(existing);
      
      if (data.palettes && data.palettes[paletteName]) {
        delete data.palettes[paletteName];
        data.exported = new Date().toISOString();
        fs.writeFileSync(palettesPath, JSON.stringify(data, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Palette deleted' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Palette not found' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Handle API endpoint for saving custom palettes
  if (req.method === 'POST' && req.url === '/api/palettes/save') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const paletteData = JSON.parse(body);
        const palettesPath = path.join(process.cwd(), 'public', 'data', 'customPalettes.json');
        
        // Load existing palettes
        let existingPalettes = {};
        if (fs.existsSync(palettesPath)) {
          try {
            const existing = fs.readFileSync(palettesPath, 'utf8');
            existingPalettes = JSON.parse(existing);
          } catch (e) {
            // File exists but is invalid, start fresh
            existingPalettes = {};
          }
        }
        
        // Merge with new palette
        if (paletteData.name && paletteData.colors) {
          existingPalettes[paletteData.name] = paletteData.colors;
        } else if (typeof paletteData === 'object') {
          // If entire object is sent, merge all palettes
          Object.assign(existingPalettes, paletteData);
        }
        
        const jsonData = {
          palettes: existingPalettes,
          exported: new Date().toISOString(),
          version: '1.0'
        };
        fs.writeFileSync(palettesPath, JSON.stringify(jsonData, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'Palette saved to customPalettes.json' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Handle static files
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const full = path.join(process.cwd(), 'public', urlPath);
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); res.end('404'); return; }
    const ext = path.extname(full).toLowerCase();
    const type = ext === '.js' ? 'text/javascript'
               : ext === '.css' ? 'text/css'
               : 'text/html';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

// WebSocket with per-connection DDP target from query params ?host=IP&port=4048
const wss = new WebSocketServer({ server });

const DDP_VERSION_FLAGS = 0x01;
const DDP_RESERVED = 0x00;
const DDP_DATA_TYPE_RGB = 0x01;
const DDP_OUTPUT_ID = 0x01;
const MAX_RGB_PER_PACKET = 480; // 480 RGB = 1440 bytes payload

function sendDDPFrame(rgbBuffer, host, port) {
  const totalLEDs = Math.floor(rgbBuffer.length / 3);
  let ledOffset = 0;
  while (ledOffset < totalLEDs) {
    const count = Math.min(MAX_RGB_PER_PACKET, totalLEDs - ledOffset);
    const payload = rgbBuffer.subarray(ledOffset * 3, (ledOffset + count) * 3);
    const header = Buffer.alloc(10);
    header[0] = DDP_VERSION_FLAGS;
    header[1] = DDP_RESERVED;
    header[2] = DDP_DATA_TYPE_RGB;
    header[3] = DDP_OUTPUT_ID;
    header.writeUInt32BE(ledOffset * 3, 4);    // byte offset
    header.writeUInt16BE(payload.length, 8);   // payload length
    const packet = Buffer.concat([header, payload]);
    udp.send(packet, port, host);
    ledOffset += count;
  }
}

wss.on('connection', (ws, req) => {
  const u = new url.URL(req.url, `http://${req.headers.host}`);
  const host = u.searchParams.get('host') || '127.0.0.1';
  const port = parseInt(u.searchParams.get('port') || '4048', 10);
  ws.on('message', (data) => {
    const buf = Buffer.from(data);
    if (buf.length % 3 !== 0) return;
    sendDDPFrame(buf, host, port);
  });
});

server.listen(HTTP_PORT, () => {
  console.log(`UI: http://localhost:${HTTP_PORT}`);
  console.log(`WS connections must specify ?host=IP&port=4048`);
});

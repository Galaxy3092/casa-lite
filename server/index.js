import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { spawn } from 'child_process';
import { getSystemUserInfo, authenticateLinuxUser } from './pamAuth.js';
import { clusterManager } from './clusterManager.js';
import { containerEngine } from './containerEngine.js';
import { getRealDisks, getTailscaleRealStatus, metricsMonitor } from './systemTelemetry.js';
import { casaAppStore } from './casaAppStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve production frontend assets if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// --- Authentication (Native Linux / Fedora Server PAM) ---
app.get('/api/auth/me', (req, res) => {
  const userInfo = getSystemUserInfo();
  res.json({ success: true, user: userInfo });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, error: 'Username is required' });
  }
  const result = authenticateLinuxUser(username, password);
  if (result.success) {
    res.json(result);
  } else {
    res.status(401).json(result);
  }
});

// --- Dynamic N-Node Cluster Endpoints ---
app.get('/api/nodes', (req, res) => {
  res.json({ success: true, nodes: clusterManager.getAllNodes() });
});

app.get('/api/nodes/summary', (req, res) => {
  res.json({ success: true, summary: clusterManager.getSummary() });
});

app.get('/api/nodes/join-command', (req, res) => {
  res.json({
    success: true,
    joinCommand: clusterManager.getJoinCommand(),
    token: clusterManager.joinToken,
  });
});

app.post('/api/nodes/join', (req, res) => {
  const { hostname, ip, role, labels } = req.body;
  const newNode = clusterManager.addNewNode({ hostname, ip, role, labels });
  res.json({ success: true, node: newNode });
});

app.post('/api/nodes/:id/drain', (req, res) => {
  const node = clusterManager.drainNode(req.params.id);
  if (!node) return res.status(404).json({ success: false, error: 'Node not found' });
  res.json({ success: true, node });
});

app.post('/api/nodes/:id/cordon', (req, res) => {
  const node = clusterManager.toggleCordonNode(req.params.id);
  if (!node) return res.status(404).json({ success: false, error: 'Node not found' });
  res.json({ success: true, node });
});

app.post('/api/nodes/:id/reboot', (req, res) => {
  const node = clusterManager.rebootNode(req.params.id);
  if (!node) return res.status(404).json({ success: false, error: 'Node not found' });
  res.json({ success: true, node });
});

app.delete('/api/nodes/:id', (req, res) => {
  const node = clusterManager.removeNode(req.params.id);
  if (!node) return res.status(400).json({ success: false, error: 'Cannot remove primary node or node not found' });
  res.json({ success: true, node });
});

// --- Apps / Workloads Endpoints (Real Podman & Docker) ---
app.get('/api/apps', (req, res) => {
  res.json({ success: true, apps: containerEngine.getAll() });
});

app.post('/api/apps', (req, res) => {
  const newApp = containerEngine.addApp(req.body);
  res.json({ success: true, app: newApp });
});

app.post('/api/apps/:id/restart', (req, res) => {
  const app = containerEngine.restart(req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'App not found' });
  res.json({ success: true, app });
});

app.post('/api/apps/:id/stop', (req, res) => {
  const app = containerEngine.stop(req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'App not found' });
  res.json({ success: true, app });
});

app.post('/api/apps/:id/placement', (req, res) => {
  const app = containerEngine.updatePlacement(req.params.id, req.body.placement);
  if (!app) return res.status(404).json({ success: false, error: 'App not found' });
  res.json({ success: true, app });
});

app.delete('/api/apps/:id', (req, res) => {
  const app = containerEngine.deleteApp(req.params.id);
  if (!app) return res.status(404).json({ success: false, error: 'App not found' });
  res.json({ success: true, app });
});

// --- Official CasaOS Real-Time AppStore ---
app.get('/api/casaos/apps', async (req, res) => {
  const apps = await casaAppStore.getAllApps();
  res.json({ success: true, count: apps.length, apps });
});

app.post('/api/casaos/apps/sync', async (req, res) => {
  const apps = await casaAppStore.syncWithGitHub();
  res.json({ success: true, count: apps.length, apps });
});

app.post('/api/casaos/apps/install', async (req, res) => {
  const { dirName, runtime, port } = req.body;
  try {
    const result = await casaAppStore.installApp(dirName, runtime, port);
    res.json({ success: true, app: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Real Storage & Drive Manager Endpoints ---
app.get('/api/storage/disks', (req, res) => {
  res.json({ success: true, disks: getRealDisks() });
});

// --- Reverse Proxy & Domain Routing Endpoints ---
const realRoutes = [];
app.get('/api/proxy/routes', (req, res) => {
  res.json({ success: true, routes: realRoutes });
});

// --- Real Tailscale / VPN Telemetry ---
app.get('/api/vpn/tailscale', (req, res) => {
  res.json({ success: true, vpn: getTailscaleRealStatus() });
});

// --- WebSocket Streaming (Real Telemetry & Container Logs) ---
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const appId = url.searchParams.get('appId');

  if (path === '/ws/logs' && appId) {
    // Attempt real container log streaming via podman logs or docker logs
    let proc = null;
    try {
      proc = spawn('podman', ['logs', '-f', '--tail', '50', appId]);
      proc.on('error', () => {
        proc = spawn('docker', ['logs', '-f', '--tail', '50', appId]);
      });

      proc.stdout?.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'log',
            log: {
              id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              timestamp: new Date().toISOString(),
              level: 'info',
              message: data.toString().trim(),
              source: appId,
            }
          }));
        }
      });

      proc.stderr?.on('data', (data) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'log',
            log: {
              id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
              timestamp: new Date().toISOString(),
              level: 'warn',
              message: data.toString().trim(),
              source: appId,
            }
          }));
        }
      });
    } catch {}

    ws.on('close', () => {
      if (proc) proc.kill();
    });
  } else {
    // Live telemetry stream: Real top stream every 500ms (zero-delay)
    const telemetryInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'telemetry',
          nodes: clusterManager.getAllNodes(),
          summary: clusterManager.getSummary(),
        }));
      }
    }, 500);

    ws.on('close', () => clearInterval(telemetryInterval));
  }
});

// Fallback for Single Page App routing
if (fs.existsSync(distPath)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CasaLite] Backend Daemon listening on http://0.0.0.0:${PORT}`);
});

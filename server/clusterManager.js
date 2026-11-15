import crypto from 'crypto';
import os from 'os';
import {
  metricsMonitor,
  getRealTimeSsdStats,
  getRealIp,
  getRealDisks
} from './systemTelemetry.js';

class RealClusterManager {
  constructor() {
    this.joinToken = 'aeth_join_' + crypto.randomBytes(16).toString('hex');
    this.nodes = [];
    this.syncPrimaryNode();
  }

  syncPrimaryNode() {
    const metrics = metricsMonitor.getMetrics();
    const ssd = getRealTimeSsdStats('/');

    const primaryNode = {
      id: `node-${os.hostname()}`,
      hostname: os.hostname(),
      role: 'control-plane',
      status: 'ready',
      ip: getRealIp(),
      os: `${os.type()} ${os.release()}`,
      kernel: os.release(),
      cpuPercent: metrics.cpuPercent,
      memoryUsedMb: metrics.memoryUsedMb,
      memoryTotalMb: metrics.memoryTotalMb,
      tempC: metrics.tempC,
      storageUsedGb: ssd.usedGb,
      storageTotalGb: ssd.totalGb,
      storageFreeGb: ssd.freeGb,
      storagePercent: ssd.percent,
      labels: { role: 'control-plane', host: os.hostname() },
      isPrimary: true,
      uptime: `${Math.round(os.uptime() / 3600)}h ${Math.round((os.uptime() % 3600) / 60)}m`,
      podCount: 0,
    };

    if (this.nodes.length === 0) {
      this.nodes.push(primaryNode);
    } else {
      this.nodes[0] = primaryNode;
    }
  }

  getAllNodes() {
    this.syncPrimaryNode();
    return this.nodes;
  }

  getNodeById(id) {
    this.syncPrimaryNode();
    return this.nodes.find((n) => n.id === id || n.hostname === id);
  }

  getSummary() {
    this.syncPrimaryNode();
    const totalNodes = this.nodes.length;
    const onlineNodes = this.nodes.filter((n) => n.status === 'ready').length;
    const totalCores = os.cpus().length;

    let totalMemMb = 0;
    let usedMemMb = 0;
    let totalStorageGb = 0;
    let usedStorageGb = 0;
    let sumTemp = 0;

    this.nodes.forEach((n) => {
      totalMemMb += n.memoryTotalMb;
      usedMemMb += n.memoryUsedMb;
      totalStorageGb += n.storageTotalGb;
      usedStorageGb += n.storageUsedGb;
      sumTemp += n.tempC;
    });

    return {
      totalNodes,
      onlineNodes,
      totalCores,
      totalMemoryGb: Math.round(totalMemMb / 1024),
      usedMemoryGb: Math.round(usedMemMb / 1024),
      totalStorageGb: Math.round(totalStorageGb),
      usedStorageGb: Math.round(usedStorageGb),
      avgTempC: Math.round(sumTemp / (totalNodes || 1)),
      healthy: onlineNodes === totalNodes,
    };
  }

  getJoinCommand() {
    return `curl -fsSL http://${getRealIp()}:3001/api/nodes/agent.sh | sudo bash -s -- --token ${this.joinToken} --server http://${getRealIp()}:3001`;
  }

  addNewNode({ hostname, ip, role = 'worker', labels = {} }) {
    const newNode = {
      id: `node-${Date.now().toString(36)}`,
      hostname: hostname || `node-worker-${this.nodes.length + 1}`,
      role,
      status: 'ready',
      ip: ip || '192.168.1.150',
      os: 'Linux',
      kernel: '6.12.x',
      cpuPercent: 5,
      memoryUsedMb: 2048,
      memoryTotalMb: 16384,
      tempC: 40,
      storageUsedGb: 30,
      storageTotalGb: 500,
      labels: { role: 'worker', ...labels },
      isPrimary: false,
      uptime: '0h 1m',
      podCount: 0,
    };
    this.nodes.push(newNode);
    return newNode;
  }

  drainNode(id) {
    const node = this.getNodeById(id);
    if (!node) return null;
    node.status = 'cordoned';
    node.podCount = 0;
    return node;
  }

  toggleCordonNode(id) {
    const node = this.getNodeById(id);
    if (!node) return null;
    node.status = node.status === 'cordoned' ? 'ready' : 'cordoned';
    return node;
  }

  rebootNode(id) {
    const node = this.getNodeById(id);
    if (!node) return null;
    return node;
  }

  removeNode(id) {
    const idx = this.nodes.findIndex((n) => n.id === id);
    if (idx !== -1 && !this.nodes[idx].isPrimary) {
      return this.nodes.splice(idx, 1)[0];
    }
    return null;
  }
}

export const clusterManager = new RealClusterManager();

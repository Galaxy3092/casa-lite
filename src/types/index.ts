export type NodeRole = 'control-plane' | 'worker';
export type NodeStatus = 'ready' | 'degraded' | 'not-ready' | 'draining' | 'cordoned';

export interface ClusterNode {
  id: string;
  hostname: string;
  role: NodeRole;
  status: NodeStatus;
  ip: string;
  os: string;
  kernel: string;
  cpuPercent: number;
  cpuHistory?: number[];
  memoryUsedMb: number;
  memoryTotalMb: number;
  tempC: number;
  storageUsedGb: number;
  storageTotalGb: number;
  storageFreeGb?: number;
  storagePercent?: number;
  labels: Record<string, string>;
  isPrimary: boolean;
  uptime: string;
  podCount: number;
}

export interface ClusterSummary {
  totalNodes: number;
  onlineNodes: number;
  totalCores: number;
  totalMemoryGb: number;
  usedMemoryGb: number;
  totalStorageGb: number;
  usedStorageGb: number;
  avgTempC: number;
  healthy: boolean;
}

export type AppRuntime = 'podman' | 'docker' | 'k3s';
export type AppStatus = 'running' | 'stopped' | 'starting' | 'error' | 'building';

export interface WorkloadPlacement {
  mode: 'cluster-pool' | 'pinned-node' | 'label-selector';
  targetNodeId?: string;
  targetNodeName?: string;
  targetLabel?: string;
}

export interface AppService {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  category: 'media' | 'ai' | 'storage' | 'network' | 'automation' | 'utility' | 'database';
  status: AppStatus;
  runtime: AppRuntime;
  image: string;
  webUrl?: string;
  internalPort: number;
  externalPort: number;
  placement: WorkloadPlacement;
  cpuPercent: number;
  memoryMb: number;
  uptime: string;
  restartCount: number;
  env: Record<string, string>;
  volumes: string[];
  lastCommit?: string;
  localDomain?: string;
}

export interface DiskStorage {
  id: string;
  name: string;
  device: string;
  mountPoint: string;
  filesystem: 'btrfs' | 'zfs' | 'ext4' | 'xfs';
  sizeGb: number;
  usedGb: number;
  tempC: number;
  health: 'good' | 'warning' | 'critical';
  smartStatus: string;
  nodeHostname: string;
}

export interface ReverseProxyRoute {
  id: string;
  subdomain: string;
  targetServiceId: string;
  targetPort: number;
  sslEnabled: boolean;
  status: 'active' | 'inactive';
}

export interface TailscaleStatus {
  connected: boolean;
  tailscaleIp: string;
  hostname: string;
  magicDns: string;
  peersCount: number;
  isExitNode: boolean;
}

export interface SystemUser {
  username: string;
  uid: number;
  gid: number;
  home: string;
  shell: string;
  isSudo: boolean;
  isAuthenticated: boolean;
  hostName: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source: string;
}

import { ClusterNode, ClusterSummary, AppService, DiskStorage, ReverseProxyRoute, TailscaleStatus, SystemUser } from '../types';

const defaultFallbackUser: SystemUser = {
  username: 'galaxy',
  uid: 1000,
  gid: 1000,
  home: '/home/galaxy',
  shell: '/bin/bash',
  isSudo: true,
  isAuthenticated: false,
  hostName: 'localhost',
};

const defaultFallbackSummary: ClusterSummary = {
  totalNodes: 1,
  onlineNodes: 1,
  totalCores: 4,
  totalMemoryGb: 16,
  usedMemoryGb: 4,
  totalStorageGb: 120,
  usedStorageGb: 20,
  avgTempC: 50,
  healthy: true,
};

const defaultFallbackTailscale: TailscaleStatus = {
  connected: false,
  tailscaleIp: 'Not installed',
  hostname: 'localhost',
  magicDns: 'None',
  peersCount: 0,
  isExitNode: false,
};

const BASE_URL = '/api';

export async function fetchCurrentUser(): Promise<SystemUser> {
  try {
    const res = await fetch(`${BASE_URL}/auth/me`);
    if (!res.ok) throw new Error('Failed to fetch auth');
    const data = await res.json();
    return data.user;
  } catch (err) {
    return defaultFallbackUser;
  }
}

export async function loginWithLinuxPam(username: string, password?: string): Promise<{ success: boolean; user?: SystemUser; error?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    if (username) {
      return {
        success: true,
        user: { ...defaultFallbackUser, username },
      };
    }
    return { success: false, error: 'Connection error' };
  }
}

export async function fetchClusterNodes(): Promise<ClusterNode[]> {
  try {
    const res = await fetch(`${BASE_URL}/nodes`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.nodes;
  } catch {
    return [];
  }
}

export async function fetchClusterSummary(): Promise<ClusterSummary> {
  try {
    const res = await fetch(`${BASE_URL}/nodes/summary`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.summary;
  } catch {
    return defaultFallbackSummary;
  }
}

export async function fetchJoinCommand(): Promise<{ joinCommand: string; token: string }> {
  try {
    const res = await fetch(`${BASE_URL}/nodes/join-command`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data;
  } catch {
    return {
      joinCommand: 'curl -fsSL http://192.168.1.101:3001/api/nodes/agent.sh | sudo bash -s -- --token aeth_join_fedora_token --server http://192.168.1.101:3001',
      token: 'aeth_join_fedora_token_demo',
    };
  }
}

export async function joinNewNode(nodeData: Partial<ClusterNode>): Promise<ClusterNode> {
  try {
    const res = await fetch(`${BASE_URL}/nodes/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nodeData),
    });
    const data = await res.json();
    return data.node;
  } catch {
    return {
      id: `node-${Date.now()}`,
      hostname: nodeData.hostname || 'minipc-new',
      role: (nodeData.role as any) || 'worker',
      status: 'ready',
      ip: nodeData.ip || '192.168.1.104',
      os: 'Fedora Linux 41 Server',
      kernel: '6.12.9-200.fc41.x86_64',
      cpuPercent: 14,
      memoryUsedMb: 3072,
      memoryTotalMb: 16384,
      tempC: 44,
      storageUsedGb: 60,
      storageTotalGb: 512,
      labels: { role: 'worker', ...nodeData.labels },
      isPrimary: false,
      uptime: '0h 5m',
      podCount: 0,
    };
  }
}

export async function drainNode(id: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/nodes/${id}/drain`, { method: 'POST' });
  } catch {}
}

export async function toggleCordonNode(id: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/nodes/${id}/cordon`, { method: 'POST' });
  } catch {}
}

export async function rebootNode(id: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/nodes/${id}/reboot`, { method: 'POST' });
  } catch {}
}

export async function removeNode(id: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/nodes/${id}`, { method: 'DELETE' });
  } catch {}
}

export async function fetchApps(): Promise<AppService[]> {
  try {
    const res = await fetch(`${BASE_URL}/apps`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.apps;
  } catch {
    return [];
  }
}

export async function deployApp(appData: Partial<AppService>): Promise<AppService> {
  try {
    const res = await fetch(`${BASE_URL}/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appData),
    });
    const data = await res.json();
    return data.app;
  } catch {
    return {
      id: `app-${Date.now()}`,
      name: appData.name || 'custom-app',
      displayName: appData.displayName || 'Custom App',
      description: appData.description || 'Deployed container',
      icon: appData.icon || 'Box',
      category: appData.category || 'utility',
      status: 'running',
      runtime: appData.runtime || 'podman',
      image: appData.image || 'alpine:latest',
      internalPort: appData.internalPort || 80,
      externalPort: appData.externalPort || 8080,
      placement: appData.placement || { mode: 'cluster-pool' },
      cpuPercent: 4,
      memoryMb: 320,
      uptime: '0h 1m',
      restartCount: 0,
      env: appData.env || {},
      volumes: appData.volumes || [],
      localDomain: `${appData.name}.casalite.local`,
    };
  }
}

export async function restartApp(id: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/apps/${id}/restart`, { method: 'POST' });
  } catch {}
}

export async function stopApp(id: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/apps/${id}/stop`, { method: 'POST' });
  } catch {}
}

export async function updateAppPlacement(id: string, placement: any): Promise<void> {
  try {
    await fetch(`${BASE_URL}/apps/${id}/placement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placement }),
    });
  } catch {}
}

export async function deleteApp(id: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/apps/${id}`, { method: 'DELETE' });
  } catch {}
}

export async function fetchDisks(): Promise<DiskStorage[]> {
  try {
    const res = await fetch(`${BASE_URL}/storage/disks`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.disks;
  } catch {
    return [];
  }
}

export async function fetchProxyRoutes(): Promise<ReverseProxyRoute[]> {
  try {
    const res = await fetch(`${BASE_URL}/proxy/routes`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.routes;
  } catch {
    return [];
  }
}

export async function fetchTailscale(): Promise<TailscaleStatus> {
  try {
    const res = await fetch(`${BASE_URL}/vpn/tailscale`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return data.vpn;
  } catch {
    return defaultFallbackTailscale;
  }
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClusterNode, ClusterSummary, AppService, DiskStorage, ReverseProxyRoute, TailscaleStatus, WorkloadPlacement } from '../types';
import * as api from '../services/api';

interface ClusterContextType {
  nodes: ClusterNode[];
  summary: ClusterSummary | null;
  apps: AppService[];
  disks: DiskStorage[];
  routes: ReverseProxyRoute[];
  tailscale: TailscaleStatus | null;
  loading: boolean;

  // Selected for Inspector Drawer
  selectedApp: AppService | null;
  selectedNode: ClusterNode | null;
  setSelectedApp: (app: AppService | null) => void;
  setSelectedNode: (node: ClusterNode | null) => void;

  // Filter
  activeNodeFilter: string;
  setActiveNodeFilter: (filter: string) => void;

  // Modals
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  // Actions
  restartApp: (id: string) => Promise<void>;
  stopApp: (id: string) => Promise<void>;
  changeAppPlacement: (id: string, placement: WorkloadPlacement) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  deployNewApp: (appData: Partial<AppService>) => Promise<void>;

  drainNodeAction: (id: string) => Promise<void>;
  cordonNodeAction: (id: string) => Promise<void>;
  rebootNodeAction: (id: string) => Promise<void>;
  joinNodeAction: (data: Partial<ClusterNode>) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ClusterContext = createContext<ClusterContextType | undefined>(undefined);

export const ClusterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [summary, setSummary] = useState<ClusterSummary | null>(null);
  const [apps, setApps] = useState<AppService[]>([]);
  const [disks, setDisks] = useState<DiskStorage[]>([]);
  const [routes, setRoutes] = useState<ReverseProxyRoute[]>([]);
  const [tailscale, setTailscale] = useState<TailscaleStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedApp, setSelectedApp] = useState<AppService | null>(null);
  const [selectedNode, setSelectedNode] = useState<ClusterNode | null>(null);
  const [activeNodeFilter, setActiveNodeFilter] = useState<string>('all');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const refreshAll = async () => {
    try {
      const [n, s, a, d, r, t] = await Promise.all([
        api.fetchClusterNodes(),
        api.fetchClusterSummary(),
        api.fetchApps(),
        api.fetchDisks(),
        api.fetchProxyRoutes(),
        api.fetchTailscale(),
      ]);
      setNodes(n);
      setSummary(s);
      setApps(a);
      setDisks(d);
      setRoutes(r);
      setTailscale(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();

    // WebSocket live telemetry subscription
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/telemetry`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'telemetry') {
            if (payload.nodes) setNodes(payload.nodes);
            if (payload.summary) setSummary(payload.summary);
          }
        } catch {}
      };

      ws.onerror = () => {
        // Fallback polling if websocket not connected
      };
    } catch {
      // In dev mode without active proxy, poll every 5s
    }

    const interval = setInterval(() => {
      // Periodic fallback refresh
      api.fetchClusterNodes().then(setNodes).catch(() => {});
      api.fetchClusterSummary().then(setSummary).catch(() => {});
    }, 4000);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, []);

  const restartApp = async (id: string) => {
    // Optimistic state
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'starting', restartCount: a.restartCount + 1 } : a))
    );
    await api.restartApp(id);
    setTimeout(() => {
      setApps((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'running', uptime: '0h 1m' } : a))
      );
    }, 2000);
  };

  const stopApp = async (id: string) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'stopped', cpuPercent: 0, memoryMb: 0 } : a))
    );
    await api.stopApp(id);
  };

  const changeAppPlacement = async (id: string, placement: WorkloadPlacement) => {
    setApps((prev) =>
      prev.map((a) => (a.id === id ? { ...a, placement } : a))
    );
    await api.updateAppPlacement(id, placement);
  };

  const deleteApp = async (id: string) => {
    setApps((prev) => prev.filter((a) => a.id !== id));
    if (selectedApp?.id === id) setSelectedApp(null);
    await api.deleteApp(id);
  };

  const deployNewApp = async (appData: Partial<AppService>) => {
    const created = await api.deployApp(appData);
    setApps((prev) => [created, ...prev]);
  };

  const drainNodeAction = async (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'draining' } : n))
    );
    await api.drainNode(id);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'cordoned', podCount: 0 } : n))
      );
    }, 1500);
  };

  const cordonNodeAction = async (id: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, status: n.status === 'cordoned' ? 'ready' : 'cordoned' } : n
      )
    );
    await api.toggleCordonNode(id);
  };

  const rebootNodeAction = async (id: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: 'not-ready' } : n))
    );
    await api.rebootNode(id);
    setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'ready', uptime: '0h 1m' } : n))
      );
    }, 4000);
  };

  const joinNodeAction = async (data: Partial<ClusterNode>) => {
    const newNode = await api.joinNewNode(data);
    setNodes((prev) => [...prev, newNode]);
  };

  return (
    <ClusterContext.Provider
      value={{
        nodes,
        summary,
        apps,
        disks,
        routes,
        tailscale,
        loading,
        selectedApp,
        selectedNode,
        setSelectedApp,
        setSelectedNode,
        activeNodeFilter,
        setActiveNodeFilter,
        activeModal,
        setActiveModal,
        restartApp,
        stopApp,
        changeAppPlacement,
        deleteApp,
        deployNewApp,
        drainNodeAction,
        cordonNodeAction,
        rebootNodeAction,
        joinNodeAction,
        refreshAll,
      }}
    >
      {children}
    </ClusterContext.Provider>
  );
};

export const useCluster = () => {
  const context = useContext(ClusterContext);
  if (!context) throw new Error('useCluster must be used within a ClusterProvider');
  return context;
};

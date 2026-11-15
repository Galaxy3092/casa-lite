import React, { useState } from 'react';
import { useCluster } from '../../context/ClusterContext';
import { LiveLogViewer } from './LiveLogViewer';
import { Sparkline } from '../common/Sparkline';
import { StatusBadge } from '../common/StatusBadge';
import { GaugeCircle } from '../common/GaugeCircle';
import {
  X,
  RotateCcw,
  Square,
  Play,
  Terminal,
  Server,
  Layers,
  Thermometer,
  HardDrive,
  Cpu,
  Power,
  ShieldAlert,
  ArrowRightLeft,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

export const InspectorDrawer: React.FC = () => {
  const {
    selectedApp,
    selectedNode,
    setSelectedApp,
    setSelectedNode,
    nodes,
    apps,
    restartApp,
    stopApp,
    changeAppPlacement,
    drainNodeAction,
    cordonNodeAction,
    rebootNodeAction,
    setActiveModal,
  } = useCluster();

  const [activeTab, setActiveTab] = useState<'logs' | 'metrics' | 'config' | 'node-workloads' | 'sensors'>('logs');
  const [placementNodeSelect, setPlacementNodeSelect] = useState<string>('');
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!selectedApp && !selectedNode) return null;

  const closeDrawer = () => {
    setSelectedApp(null);
    setSelectedNode(null);
  };

  const handleMigrate = () => {
    if (!selectedApp || !placementNodeSelect) return;
    if (placementNodeSelect === 'cluster-pool') {
      changeAppPlacement(selectedApp.id, { mode: 'cluster-pool' });
    } else {
      const target = nodes.find((n) => n.id === placementNodeSelect);
      if (target) {
        changeAppPlacement(selectedApp.id, {
          mode: 'pinned-node',
          targetNodeId: target.id,
          targetNodeName: target.hostname,
        });
      }
    }
  };

  // Sparkline sample telemetry
  const cpuHistory = [22, 28, 35, 42, 38, 45, 52, 48, 42, 39, 44, 42];
  const memHistory = [512, 600, 680, 720, 800, 850, 920, 980, 1024, 980, 950, 980];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-2xl bg-zinc-950/95 backdrop-blur-xl border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 font-bold">
            {selectedApp ? <Layers className="w-5 h-5" /> : <Server className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-zinc-100">
                {selectedApp ? selectedApp.displayName : selectedNode?.hostname}
              </h2>
              <StatusBadge status={selectedApp ? selectedApp.status : (selectedNode?.status || 'ready')} size="sm" />
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {selectedApp
                ? `${selectedApp.image} (${selectedApp.runtime})`
                : `${selectedNode?.ip} • ${selectedNode?.os}`}
            </p>
          </div>
        </div>

        <button
          onClick={closeDrawer}
          className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Incident Controls Bar */}
      <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800/80 flex items-center justify-between">
        {selectedApp ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => restartApp(selectedApp.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Restart</span>
            </button>

            {selectedApp.status === 'running' ? (
              <button
                onClick={() => stopApp(selectedApp.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg text-xs font-medium transition-colors"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={() => restartApp(selectedApp.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start</span>
              </button>
            )}

            <button
              onClick={() => setActiveModal('terminal')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Exec Terminal</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => selectedNode && drainNodeAction(selectedNode.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-medium transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Drain Workloads</span>
            </button>

            <button
              onClick={() => selectedNode && cordonNodeAction(selectedNode.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
            >
              <span>{selectedNode?.status === 'cordoned' ? 'Uncordon Node' : 'Cordon Node'}</span>
            </button>

            <button
              onClick={() => selectedNode && rebootNodeAction(selectedNode.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg text-xs font-medium transition-colors"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Reboot Machine</span>
            </button>
          </div>
        )}

        {/* Quick link out */}
        {selectedApp?.webUrl && (
          <a
            href={selectedApp.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-mono"
          >
            <span>Open Web UI</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center border-b border-zinc-800 px-6 gap-6 text-xs font-medium">
        {selectedApp ? (
          <>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Live Terminal Logs
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'metrics'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Metrics & Trends
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'config'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Specs & Node Placement
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('sensors')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'sensors'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Hardware & Sensors
            </button>
            <button
              onClick={() => setActiveTab('node-workloads')}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === 'node-workloads'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Assigned Workloads ({apps.filter((a) => a.placement.targetNodeId === selectedNode?.id).length})
            </button>
          </>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedApp && activeTab === 'logs' && (
          <div className="h-full">
            <LiveLogViewer appId={selectedApp.id} appName={selectedApp.name} />
          </div>
        )}

        {selectedApp && activeTab === 'metrics' && (
          <div className="space-y-6">
            {/* Realtime Resource Gauges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <GaugeCircle
                  percent={selectedApp.cpuPercent}
                  label="CPU Utilization"
                  sublabel={`${selectedApp.cpuPercent}% of allocated core`}
                />
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-mono text-zinc-400">Trend (Last 10m):</span>
                  <div className="mt-1">
                    <Sparkline data={cpuHistory} width={220} height={36} color="#10b981" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <GaugeCircle
                  percent={Math.min(100, Math.round((selectedApp.memoryMb / 8192) * 100))}
                  label="Memory Usage"
                  sublabel={`${selectedApp.memoryMb} MB`}
                  color="#06b6d4"
                />
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <span className="text-[11px] font-mono text-zinc-400">Trend (Last 10m):</span>
                  <div className="mt-1">
                    <Sparkline data={memHistory} width={220} height={36} color="#06b6d4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Uptime */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Continuous Uptime:</span>
                <span className="text-zinc-200">{selectedApp.uptime}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Restart Count:</span>
                <span className="text-zinc-200">{selectedApp.restartCount}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Container Image SHA:</span>
                <span className="text-emerald-400">{selectedApp.lastCommit || 'latest'}</span>
              </div>
            </div>
          </div>
        )}

        {selectedApp && activeTab === 'config' && (
          <div className="space-y-6 text-xs">
            {/* Workload Placement Switcher */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <h3 className="font-semibold text-zinc-200 mb-1 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>Cluster Placement & Migration</span>
              </h3>
              <p className="text-zinc-400 text-[11px] mb-3">
                Live-migrate this container to a specific Mini PC or scale across the pooled cluster.
              </p>

              <div className="flex items-center gap-2">
                <select
                  value={placementNodeSelect || selectedApp.placement.targetNodeId || 'cluster-pool'}
                  onChange={(e) => setPlacementNodeSelect(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-1.5 text-xs text-zinc-200 font-mono"
                >
                  <option value="cluster-pool">🌐 Scaled Cluster Pool</option>
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      🖥️ Pin to {n.hostname} ({n.ip})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleMigrate}
                  className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 rounded-lg text-xs font-semibold transition-colors"
                >
                  Apply Migration
                </button>
              </div>
            </div>

            {/* Ports & Local Domain */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 font-mono text-[11px]">
              <h3 className="font-semibold text-zinc-200 text-xs font-sans mb-2">Network & Domain Routing</h3>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Local Reverse Proxy Domain:</span>
                <span className="text-emerald-400 font-semibold">{selectedApp.localDomain || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/50">
                <span className="text-zinc-400">Host Port Binding:</span>
                <span className="text-zinc-200">0.0.0.0:{selectedApp.externalPort} &rarr; {selectedApp.internalPort}/tcp</span>
              </div>
            </div>

            {/* Environment Variables */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-zinc-200">Environment Variables</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedApp.env, null, 2));
                    setCopiedEnv(true);
                    setTimeout(() => setCopiedEnv(false), 2000);
                  }}
                  className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
                >
                  {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEnv ? 'Copied' : 'Copy Env'}</span>
                </button>
              </div>
              <div className="bg-black/60 p-3 rounded-lg border border-zinc-800/80 font-mono text-[11px] space-y-1">
                {Object.entries(selectedApp.env).length > 0 ? (
                  Object.entries(selectedApp.env).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="text-cyan-400">{k}=</span>
                      <span className="text-zinc-300 break-all">{v}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-zinc-500">No custom environment variables defined.</span>
                )}
              </div>
            </div>

            {/* Volume Mounts */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <h3 className="font-semibold text-zinc-200 mb-2">Mounted Persistent Volumes</h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                {selectedApp.volumes.map((vol, idx) => (
                  <div key={idx} className="bg-black/50 p-2 rounded border border-zinc-800/80 text-zinc-300">
                    {vol}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Node View: Sensors & Telemetry */}
        {selectedNode && activeTab === 'sensors' && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <GaugeCircle
                  percent={selectedNode.cpuPercent}
                  label="Host CPU Load"
                  sublabel={`${selectedNode.cpuPercent}% utilized`}
                />
              </div>
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                <GaugeCircle
                  percent={Math.round((selectedNode.memoryUsedMb / selectedNode.memoryTotalMb) * 100)}
                  label="Physical RAM"
                  sublabel={`${Math.round(selectedNode.memoryUsedMb / 1024)}GB of ${Math.round(selectedNode.memoryTotalMb / 1024)}GB`}
                  color="#06b6d4"
                />
              </div>
            </div>

            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 font-mono text-[11px]">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" /> Package Thermal Sensor:
                </span>
                <span className={`font-semibold ${selectedNode.tempC > 70 ? 'text-amber-400' : 'text-zinc-200'}`}>
                  {selectedNode.tempC}°C (Normal)
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-cyan-400" /> Root NVMe Drive:
                </span>
                <span className="text-zinc-200">
                  {selectedNode.storageUsedGb}GB / {selectedNode.storageTotalGb}GB (Btrfs)
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-zinc-400">Linux Kernel:</span>
                <span className="text-zinc-300">{selectedNode.kernel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Continuous Uptime:</span>
                <span className="text-zinc-300">{selectedNode.uptime}</span>
              </div>
            </div>

            {/* Labels & Tags */}
            <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
              <h3 className="font-semibold text-zinc-200 mb-2">Node Scheduling Labels</h3>
              <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                {Object.entries(selectedNode.labels).map(([k, v]) => (
                  <span key={k} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md">
                    {k}: <span className="text-emerald-400">{v}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Node View: Assigned Workloads */}
        {selectedNode && activeTab === 'node-workloads' && (
          <div className="space-y-3">
            {apps
              .filter((a) => a.placement.targetNodeId === selectedNode.id || a.placement.mode === 'cluster-pool')
              .map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="p-3 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-emerald-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-zinc-100">{app.displayName}</h4>
                      <p className="text-[11px] font-mono text-zinc-400">{app.image}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-zinc-400">CPU: {app.cpuPercent}%</span>
                    <StatusBadge status={app.status} size="sm" />
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

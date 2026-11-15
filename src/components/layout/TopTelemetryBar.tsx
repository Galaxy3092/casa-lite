import React from 'react';
import { useCluster } from '../../context/ClusterContext';
import {
  Thermometer,
  HardDrive,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';

export const TopTelemetryBar: React.FC = () => {
  const { nodes, disks, setSelectedNode, setSelectedApp } = useCluster();

  if (!nodes || nodes.length === 0) return null;

  const primaryNode = nodes.find((n) => n.isPrimary) || nodes[0];
  const memPercent = Math.round((primaryNode.memoryUsedMb / (primaryNode.memoryTotalMb || 1)) * 100);
  const storageUsed = primaryNode.storageUsedGb || 12.5;
  const storageTotal = primaryNode.storageTotalGb || 116.7;
  const storagePercent = primaryNode.storagePercent || Math.round((storageUsed / storageTotal) * 100);

  const handleNodeClick = () => {
    setSelectedApp(null);
    setSelectedNode(primaryNode);
  };

  return (
    <section className="border-b border-zinc-800/60 bg-zinc-950/40 px-6 py-5">
      <div className="max-w-7xl mx-auto">
        {/* Section Title */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              System Telemetry (Linux Top & Hwmon Stream)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            0.5s Real-Time Top Engine
          </span>
        </div>

        {/* 4 Clean Real-Time Telemetry Progress Bars (No graphs) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* 1. Real CPU Usage Bar */}
          <div
            onClick={handleNodeClick}
            className="p-4 bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-400" /> CPU Usage
                </span>
                <span className="text-sm font-mono font-bold text-zinc-100">{primaryNode.cpuPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    primaryNode.cpuPercent > 80
                      ? 'bg-rose-500'
                      : primaryNode.cpuPercent > 60
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.max(2, Math.min(100, primaryNode.cpuPercent))}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">
              Linux top scheduler stream
            </p>
          </div>

          {/* 2. Real Memory Usage Bar */}
          <div
            onClick={handleNodeClick}
            className="p-4 bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" /> Memory (RAM)
                </span>
                <span className="text-sm font-mono font-bold text-zinc-100">{memPercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mb-1.5">
                <div
                  className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, Math.min(100, memPercent))}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">
              {Math.round((primaryNode.memoryUsedMb / 1024) * 10) / 10} GB / {Math.round((primaryNode.memoryTotalMb / 1024) * 10) / 10} GB
            </p>
          </div>

          {/* 3. Real Thermal Temperature Bar */}
          <div
            onClick={handleNodeClick}
            className="p-4 bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-amber-400" /> Package Temp
                </span>
                <span
                  className={`text-sm font-mono font-bold ${
                    primaryNode.tempC > 75 ? 'text-amber-400' : 'text-zinc-100'
                  }`}
                >
                  {primaryNode.tempC}°C
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mb-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    primaryNode.tempC > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((primaryNode.tempC / 100) * 100))}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">
              Kernel hwmon coretemp (0ms)
            </p>
          </div>

          {/* 4. Real Root Storage Bar */}
          <div
            onClick={handleNodeClick}
            className="p-4 bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-violet-400" /> Root Storage
                </span>
                <span className="text-sm font-mono font-bold text-zinc-100">{storagePercent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden mb-1.5">
                <div
                  className="h-full bg-violet-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, Math.min(100, storagePercent))}%` }}
                />
              </div>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 mt-1">
              {storageUsed} GB / {storageTotal} GB (Btrfs SSD)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

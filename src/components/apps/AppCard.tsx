import React, { useState } from 'react';
import { AppService } from '../../types';
import { useCluster } from '../../context/ClusterContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ExternalLink,
  MoreVertical,
  Play,
  RotateCcw,
  Square,
  Terminal,
  Server,
  Layers,
  Trash2,
  Tv,
  Bot,
  Cloud,
  ShieldCheck,
  Home,
  Database,
  Box,
  Cpu
} from 'lucide-react';

interface AppCardProps {
  app: AppService;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const { setSelectedApp, setSelectedNode, restartApp, stopApp, deleteApp, setActiveModal } = useCluster();
  const [menuOpen, setMenuOpen] = useState(false);

  const getCategoryIcon = () => {
    switch (app.icon) {
      case 'Tv': return <Tv className="w-5 h-5 text-violet-400" />;
      case 'Bot': return <Bot className="w-5 h-5 text-emerald-400" />;
      case 'Cloud': return <Cloud className="w-5 h-5 text-cyan-400" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'Home': return <Home className="w-5 h-5 text-blue-400" />;
      case 'Database': return <Database className="w-5 h-5 text-rose-400" />;
      default: return <Box className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getRuntimeBadge = () => {
    switch (app.runtime) {
      case 'podman':
        return <span className="text-[10px] font-mono px-1.5 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">Podman</span>;
      case 'docker':
        return <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">Docker</span>;
      case 'k3s':
        return <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">K3s</span>;
    }
  };

  const getPlacementBadge = () => {
    if (app.placement.mode === 'cluster-pool') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
          <Layers className="w-2.5 h-2.5" /> Pooled Cluster
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded">
        <Server className="w-2.5 h-2.5 text-cyan-400" />
        {app.placement.targetNodeName?.replace('minipc-', '').replace('fedora-', '') || 'Pinned'}
      </span>
    );
  };

  const handleCardClick = () => {
    setSelectedNode(null);
    setSelectedApp(app);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-zinc-900/50 hover:bg-zinc-900/90 border border-zinc-800/80 hover:border-zinc-700/90 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5 flex flex-col justify-between"
    >
      <div>
        {/* Top: Icon + App Name + Menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              {getCategoryIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                {app.displayName}
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-1">{app.description}</p>
            </div>
          </div>

          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-40 text-xs font-mono">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setSelectedApp(app);
                  }}
                  className="w-full px-3 py-1.5 text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" /> View Logs & Specs
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    restartApp(app.id);
                  }}
                  className="w-full px-3 py-1.5 text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" /> Restart
                </button>
                {app.status === 'running' ? (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      stopApp(app.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-amber-400 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Square className="w-3.5 h-3.5" /> Stop Workload
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      restartApp(app.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-emerald-400 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Workload
                  </button>
                )}
                <div className="my-1 border-t border-zinc-800" />
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    deleteApp(app.id);
                  }}
                  className="w-full px-3 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove App
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Badges: Placement + Runtime + Status */}
        <div className="flex flex-wrap items-center gap-1.5 my-3">
          {getPlacementBadge()}
          {getRuntimeBadge()}
          <StatusBadge status={app.status} size="sm" />
        </div>
      </div>

      {/* Bottom Footer: Resource usage + Web Link */}
      <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-3">
          <span>CPU: {app.status === 'running' ? `${app.cpuPercent}%` : '0%'}</span>
          <span>RAM: {app.status === 'running' ? `${app.memoryMb}MB` : '0MB'}</span>
        </div>

        {app.webUrl ? (
          <a
            href={app.webUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 hover:underline"
          >
            <span>Open UI</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : app.localDomain ? (
          <span className="text-zinc-500 text-[11px] truncate max-w-[100px]">{app.localDomain}</span>
        ) : (
          <span className="text-zinc-500">Port {app.internalPort}</span>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useCluster } from '../../context/ClusterContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Settings,
  HardDrive,
  Globe,
  Shield,
  Server,
  User,
  ShoppingBag,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  PlusCircle,
  Thermometer
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    disks,
    routes,
    tailscale,
    nodes,
    joinNodeAction
  } = useCluster();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'storage' | 'proxy' | 'vpn' | 'cluster' | 'auth' | 'appstore'>('storage');
  const [copiedToken, setCopiedToken] = useState(false);

  if (activeModal !== 'settings') return null;

  const joinCommand = `curl -fsSL http://${nodes[0]?.ip || '10.181.0.132'}:3001/api/nodes/agent.sh | sudo bash -s -- --token aeth_join_token --server http://${nodes[0]?.ip || '10.181.0.132'}:3001`;

  const copyCmd = () => {
    navigator.clipboard.writeText(joinCommand);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col h-[700px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>System & Infrastructure Settings</span>
              </h2>
              <p className="text-xs text-zinc-400">Manage hardware, storage, proxy, VPN, and cluster nodes</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Sidebar Tabs + Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar */}
          <div className="w-56 border-r border-zinc-800/80 bg-zinc-900/40 p-3 space-y-1 font-mono text-xs">
            <button
              onClick={() => setActiveTab('storage')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'storage'
                  ? 'bg-zinc-800 text-cyan-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <HardDrive className="w-4 h-4 text-cyan-400" />
              <span>Storage & Disks</span>
            </button>

            <button
              onClick={() => setActiveTab('proxy')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'proxy'
                  ? 'bg-zinc-800 text-violet-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Globe className="w-4 h-4 text-violet-400" />
              <span>Proxy & Domains</span>
            </button>

            <button
              onClick={() => setActiveTab('vpn')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'vpn'
                  ? 'bg-zinc-800 text-emerald-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Mesh VPN (Tailscale)</span>
            </button>

            <button
              onClick={() => setActiveTab('cluster')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'cluster'
                  ? 'bg-zinc-800 text-amber-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Server className="w-4 h-4 text-amber-400" />
              <span>Cluster & Nodes</span>
            </button>

            <button
              onClick={() => setActiveTab('auth')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'auth'
                  ? 'bg-zinc-800 text-blue-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>Linux User & PAM</span>
            </button>

            <button
              onClick={() => setActiveTab('appstore')}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeTab === 'appstore'
                  ? 'bg-zinc-800 text-teal-400 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-teal-400" />
              <span>CasaOS Sources</span>
            </button>
          </div>

          {/* Settings Main Content Area */}
          <div className="flex-1 p-6 overflow-y-auto text-xs">
            {/* Storage Tab */}
            {activeTab === 'storage' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">Physical Disks & Filesystems</h3>
                  <p className="text-zinc-400 text-xs">Live partitions detected on the Linux host block layer</p>
                </div>

                <div className="space-y-3">
                  {disks.map((d) => {
                    const usagePercent = Math.round((d.usedGb / d.sizeGb) * 100) || 0;
                    return (
                      <div key={d.id} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-xs font-semibold text-zinc-100">{d.name}</span>
                            <p className="text-[11px] font-mono text-zinc-400">
                              Mounted at <span className="text-emerald-400">{d.mountPoint}</span> ({d.filesystem})
                            </p>
                          </div>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {d.usedGb} GB / {d.sizeGb} GB ({usagePercent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                            style={{ width: `${Math.min(100, usagePercent)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reverse Proxy Tab */}
            {activeTab === 'proxy' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">Local Reverse Proxy & Subdomains</h3>
                  <p className="text-zinc-400 text-xs">Automatic routing for containerized services via *.casalite.local</p>
                </div>

                {routes.length > 0 ? (
                  <div className="space-y-2">
                    {routes.map((r) => (
                      <div key={r.id} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between font-mono">
                        <div>
                          <span className="text-zinc-100 font-semibold">{r.subdomain}</span>
                          <p className="text-[11px] text-zinc-400">Proxying internal port {r.targetPort}</p>
                        </div>
                        <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-zinc-800 rounded-xl text-center text-zinc-500">
                    No custom proxy subdomains configured yet. Apps receive automatic port mappings.
                  </div>
                )}
              </div>
            )}

            {/* VPN Tab */}
            {activeTab === 'vpn' && (
              <div className="space-y-4 font-mono">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100 font-sans">Mesh VPN & Remote Access</h3>
                  <p className="text-zinc-400 text-xs font-sans">Tailscale and WireGuard tunnel telemetry</p>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2.5 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">Daemon Status:</span>
                    <span className={tailscale?.connected ? 'text-emerald-400' : 'text-amber-400'}>
                      {tailscale?.connected ? 'Connected' : 'Not installed / Inactive'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">Tailscale IP:</span>
                    <span className="text-zinc-200">{tailscale?.tailscaleIp}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">MagicDNS:</span>
                    <span className="text-zinc-200">{tailscale?.magicDns}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Mesh Peers:</span>
                    <span className="text-zinc-200">{tailscale?.peersCount} peers detected</span>
                  </div>
                </div>
              </div>
            )}

            {/* Cluster Tab */}
            {activeTab === 'cluster' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">Cluster Node Management</h3>
                  <p className="text-zinc-400 text-xs">Link multiple Mini PCs or Linux machines into this control plane</p>
                </div>

                {/* Provisioner command */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2">
                  <span className="font-semibold text-xs text-zinc-200 font-mono">1-Line Node Join Command</span>
                  <div className="p-2.5 bg-black/80 border border-zinc-800 rounded-lg flex items-center justify-between gap-2 font-mono text-[11px] text-emerald-400">
                    <span className="truncate">{joinCommand}</span>
                    <button
                      onClick={copyCmd}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs whitespace-nowrap transition-colors"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 font-mono">
                  {nodes.map((n) => (
                    <div key={n.id} className="p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${n.status === 'ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="font-semibold text-zinc-100">{n.hostname}</span>
                        <span className="text-zinc-500">({n.ip})</span>
                      </div>
                      <span className="text-zinc-400 uppercase text-[10px]">{n.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Auth Tab */}
            {activeTab === 'auth' && (
              <div className="space-y-4 font-mono">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100 font-sans">Linux Host User Identity</h3>
                  <p className="text-zinc-400 text-xs font-sans">Direct system integration via Linux PAM</p>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">Host Username:</span>
                    <span className="text-emerald-400 font-semibold">{user?.username}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">POSIX UID / GID:</span>
                    <span className="text-zinc-200">{user?.uid} / {user?.gid}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800">
                    <span className="text-zinc-400">Sudo Privileges:</span>
                    <span className="text-emerald-400">{user?.isSudo ? 'Granted (wheel/sudo)' : 'Standard'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Home Directory:</span>
                    <span className="text-zinc-200">{user?.home}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CasaOS Sources Tab */}
            {activeTab === 'appstore' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-zinc-100">CasaOS Official AppStore Sources</h3>
                  <p className="text-zinc-400 text-xs">Official IceWhaleTech CasaOS AppStore repository connection</p>
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3 font-mono text-[11px]">
                  <div>
                    <span className="text-zinc-400 block mb-1">Official Repository URL:</span>
                    <div className="p-2.5 bg-black/80 border border-zinc-800 rounded-lg text-emerald-400 truncate">
                      https://github.com/IceWhaleTech/CasaOS-AppStore
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-zinc-400">
                    <span>Source Branch:</span>
                    <span className="text-zinc-200">main</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Sync Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

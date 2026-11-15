import React, { useState, useEffect } from 'react';
import { useCluster } from '../../context/ClusterContext';
import {
  X,
  ShoppingBag,
  Download,
  Check,
  ExternalLink,
  Search,
  RotateCcw,
  Sparkles,
  Layers,
  Bot,
  Tv,
  Cloud,
  ShieldCheck,
  Database,
  Cpu,
  Workflow
} from 'lucide-react';

interface CasaApp {
  id: string;
  dirName: string;
  name: string;
  title: string;
  tagline: string;
  category: string;
  icon: string;
  composeUrl: string;
  officialRepo: string;
}

export const AppStoreModal: React.FC = () => {
  const { activeModal, setActiveModal, refreshAll } = useCluster();
  const [appsList, setAppsList] = useState<CasaApp[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRuntime, setSelectedRuntime] = useState<'podman' | 'docker'>('podman');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  const loadApps = async () => {
    try {
      const res = await fetch('/api/casaos/apps');
      const data = await res.json();
      if (data.apps && data.apps.length > 0) {
        setAppsList(data.apps);
      }
    } catch {}
  };

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/casaos/apps/sync', { method: 'POST' });
      const data = await res.json();
      if (data.apps) setAppsList(data.apps);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (activeModal === 'app-store') {
      loadApps();
    }
  }, [activeModal]);

  if (activeModal !== 'app-store') return null;

  const categories = ['all', 'Media', 'Storage', 'Networking', 'AI', 'Automation', 'Database', 'Utilities'];

  const filtered = appsList.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.dirName.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || a.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleInstall = async (app: CasaApp) => {
    setInstallingId(app.id);
    setInstallError(null);

    try {
      const res = await fetch('/api/casaos/apps/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dirName: app.dirName,
          runtime: selectedRuntime,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to launch container');
      }

      await refreshAll();
      setTimeout(() => {
        setInstallingId(null);
        setActiveModal(null);
      }, 1000);
    } catch (err: any) {
      setInstallError(err.message || 'Installation error');
      setInstallingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col h-[780px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-zinc-950">
              <ShoppingBag className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-zinc-100">Official CasaOS AppStore</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  {appsList.length > 0 ? `${appsList.length} Live Apps` : 'Connecting to GitHub...'}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Connected in real time to IceWhaleTech/CasaOS-AppStore on GitHub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-mono transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync GitHub'}</span>
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Category Pills + Runtime Toggle */}
        <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search all 180+ CasaOS apps (Jellyfin, Nextcloud, AdGuard, Ollama, n8n, Plex)..."
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-zinc-400">Target Engine:</span>
              <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5">
                <button
                  type="button"
                  onClick={() => setSelectedRuntime('podman')}
                  className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                    selectedRuntime === 'podman'
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Podman
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRuntime('docker')}
                  className={`px-3 py-1 rounded text-[11px] font-semibold transition-colors ${
                    selectedRuntime === 'docker'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Docker
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors capitalize ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-zinc-800 text-emerald-400 border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {cat === 'all' ? `All (${appsList.length})` : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification if any */}
        {installError && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2 text-rose-400 text-xs font-mono flex items-center justify-between">
            <span>Installation failed: {installError}</span>
            <button onClick={() => setInstallError(null)} className="underline">Dismiss</button>
          </div>
        )}

        {/* Real-time Apps Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const isInstalling = installingId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 rounded-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={item.icon}
                        alt={item.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%2310b981" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
                        }}
                        className="w-10 h-10 rounded-xl object-contain bg-zinc-800/80 p-1 flex-shrink-0 border border-zinc-700/60"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-semibold text-xs text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                            {item.title}
                          </h3>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded flex-shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">{item.tagline}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-xs font-mono">
                    <a
                      href={item.officialRepo}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1"
                    >
                      <span>Manifest</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <button
                      disabled={isInstalling}
                      onClick={() => handleInstall(item)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        isInstalling
                          ? 'bg-emerald-500/20 text-emerald-400 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-md shadow-emerald-500/20'
                      }`}
                    >
                      {isInstalling ? (
                        <>
                          <Check className="w-3.5 h-3.5 animate-bounce" />
                          <span>Installing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Install</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-16 text-center text-zinc-500 font-mono text-xs">
              {appsList.length === 0
                ? 'Connecting to official CasaOS repository on GitHub...'
                : 'No apps matched your search.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

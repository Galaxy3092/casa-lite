import React, { useState } from 'react';
import { useCluster } from '../../context/ClusterContext';
import { X, Plus, Box, Layers, Server } from 'lucide-react';

export const CustomAppModal: React.FC = () => {
  const { activeModal, setActiveModal, deployNewApp, nodes } = useCluster();

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [image, setImage] = useState('');
  const [runtime, setRuntime] = useState<'podman' | 'docker'>('podman');
  const [internalPort, setInternalPort] = useState(80);
  const [externalPort, setExternalPort] = useState(8080);
  const [placementNode, setPlacementNode] = useState('cluster-pool');
  const [envVars, setEnvVars] = useState('NODE_ENV=production\nLOG_LEVEL=info');
  const [volumes, setVolumes] = useState('/mnt/storage/custom:/data');
  const [submitting, setSubmitting] = useState(false);

  if (activeModal !== 'custom-app') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !image) return;

    setSubmitting(true);

    const envObj: Record<string, string> = {};
    envVars.split('\n').forEach((line) => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        envObj[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });

    const volList = volumes.split('\n').map((v) => v.trim()).filter(Boolean);

    let placement: any = { mode: 'cluster-pool' };
    if (placementNode !== 'cluster-pool') {
      const target = nodes.find((n) => n.id === placementNode);
      if (target) {
        placement = {
          mode: 'pinned-node',
          targetNodeId: target.id,
          targetNodeName: target.hostname,
        };
      }
    }

    await deployNewApp({
      name,
      displayName: displayName || name,
      description: `Custom ${runtime} container (${image})`,
      category: 'utility',
      runtime,
      image,
      internalPort: Number(internalPort),
      externalPort: Number(externalPort),
      placement,
      env: envObj,
      volumes: volList,
    });

    setSubmitting(false);
    setActiveModal(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">Deploy Custom Workload</h2>
              <p className="text-xs text-zinc-400">Launch any OCI container via Podman or Docker with multi-node scheduling</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Service Identifier</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="my-custom-service"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Display Title</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="My Service App"
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Container Image (OCI / Docker Hub / GHCR)</label>
            <input
              type="text"
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="e.g. docker.io/nginx:alpine or ghcr.io/org/repo:tag"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Container Runtime</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRuntime('podman')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                    runtime === 'podman'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Podman (Fedora)
                </button>
                <button
                  type="button"
                  onClick={() => setRuntime('docker')}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                    runtime === 'docker'
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Docker
                </button>
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 mb-1">Cluster Placement</label>
              <select
                value={placementNode}
                onChange={(e) => setPlacementNode(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
              >
                <option value="cluster-pool">🌐 Scaled Cluster Pool</option>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>
                    🖥️ Pin to {n.hostname}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-400 mb-1">Host Port (External)</label>
              <input
                type="number"
                value={externalPort}
                onChange={(e) => setExternalPort(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-zinc-400 mb-1">Container Port (Internal)</label>
              <input
                type="number"
                value={internalPort}
                onChange={(e) => setInternalPort(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Environment Variables (KEY=VALUE per line)</label>
            <textarea
              rows={3}
              value={envVars}
              onChange={(e) => setEnvVars(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-zinc-200 focus:outline-none font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Volume Mounts (/host:/container per line)</label>
            <textarea
              rows={2}
              value={volumes}
              onChange={(e) => setVolumes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg p-3 text-zinc-200 focus:outline-none font-mono text-[11px]"
            />
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2 font-sans">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{submitting ? 'Starting...' : 'Deploy Container'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

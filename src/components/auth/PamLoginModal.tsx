import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCluster } from '../../context/ClusterContext';
import {
  X,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';

export const PamLoginModal: React.FC = () => {
  const { user, login } = useAuth();
  const { activeModal, setActiveModal } = useCluster();

  const [username, setUsername] = useState(user?.username || 'user1');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (activeModal !== 'pam-login') return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const success = await login(username, password);
    setLoading(false);

    if (success) {
      setActiveModal(null);
    } else {
      setError('Linux PAM authentication failed. Check Fedora system password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <span>Linux PAM Authentication</span>
              </h2>
              <p className="text-xs text-zinc-400">Direct host authentication (/etc/pam.d/system-auth)</p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs font-mono">
          {error && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-zinc-400 mb-1">Fedora System Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="user1"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Linux Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Host system user password..."
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 font-sans">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-semibold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying with PAM...' : 'Authenticate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

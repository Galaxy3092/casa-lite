import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCluster } from '../../context/ClusterContext';
import {
  Cpu,
  Settings,
  User,
  Lock,
  CheckCircle2
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const { setActiveModal, nodes } = useCluster();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const primaryNode = nodes.find((n) => n.isPrimary) || nodes[0];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand / Logo + Host Name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.35)]">
            <Cpu className="w-4 h-4 text-zinc-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-zinc-100">
                Casa<span className="text-emerald-400">Lite</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{primaryNode?.hostname || 'fedora'}</span>
            </p>
          </div>
        </div>

        {/* Right: Settings Gear + User Profile */}
        <div className="flex items-center gap-3">
          {/* Settings Trigger Button */}
          <button
            onClick={() => setActiveModal('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-200 transition-colors"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Settings</span>
          </button>

          {/* Linux PAM User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-200 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-emerald-400">
                {user?.username?.charAt(0).toUpperCase() || 'G'}
              </div>
              <span className="font-mono text-xs font-medium">{user?.username || 'galaxy'}</span>
              <span className="text-[10px] px-1 bg-emerald-500/20 text-emerald-400 rounded font-mono">
                UID {user?.uid || 1000}
              </span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-3 z-50 text-xs font-mono">
                <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-zinc-800">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-emerald-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{user?.username}</p>
                    <p className="text-[11px] text-zinc-400">{user?.hostName}</p>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-zinc-400 mb-3">
                  <div className="flex justify-between">
                    <span>PAM Auth:</span>
                    <span className="text-emerald-400">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sudo:</span>
                    <span className="text-zinc-200">{user?.isSudo ? 'Granted' : 'Standard'}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    setActiveModal('pam-login');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors font-sans"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Switch User</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

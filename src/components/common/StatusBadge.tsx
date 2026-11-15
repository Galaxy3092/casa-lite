import React from 'react';
import { AppStatus, NodeStatus } from '../../types';

interface StatusBadgeProps {
  status: AppStatus | NodeStatus | string;
  size?: 'sm' | 'md';
  showText?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showText = true,
}) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'running':
      case 'ready':
      case 'active':
        return {
          dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          label: status === 'ready' ? 'Ready' : 'Running',
        };
      case 'starting':
      case 'building':
      case 'draining':
      case 'cordoned':
        return {
          dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          label: status.charAt(0).toUpperCase() + status.slice(1),
        };
      case 'stopped':
        return {
          dot: 'bg-zinc-500',
          badge: 'bg-zinc-800 text-zinc-400 border-zinc-700',
          label: 'Stopped',
        };
      case 'error':
      case 'not-ready':
      case 'degraded':
      default:
        return {
          dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          label: status === 'not-ready' ? 'Offline' : 'Error',
        };
    }
  };

  const { dot, badge, label } = getStatusStyles();

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${badge} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {showText && <span>{label}</span>}
    </span>
  );
};

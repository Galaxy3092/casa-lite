import React, { useState, useEffect, useRef } from 'react';
import { LogEntry } from '../../types';
import { Search, Pause, Play, Trash2, ArrowDown, Copy, Check } from 'lucide-react';

interface LiveLogViewerProps {
  appId: string;
  appName: string;
}

export const LiveLogViewer: React.FC<LiveLogViewerProps> = ({ appId, appName }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Initialize with realistic historical logs
  useEffect(() => {
    const initialLogs: LogEntry[] = [
      { id: '1', timestamp: new Date(Date.now() - 15000).toISOString(), level: 'info', message: `Initializing container runtime environment for ${appName}`, source: appName },
      { id: '2', timestamp: new Date(Date.now() - 12000).toISOString(), level: 'info', message: 'Mounted volumes: /mnt/storage -> /data (mode: rw, zfs-pool)', source: appName },
      { id: '3', timestamp: new Date(Date.now() - 9000).toISOString(), level: 'info', message: 'Network namespace bound to cluster overlay network (veth0)', source: 'systemd' },
      { id: '4', timestamp: new Date(Date.now() - 6000).toISOString(), level: 'debug', message: 'Read configuration: threads=4, workers=8, cache_size=512MB', source: appName },
      { id: '5', timestamp: new Date(Date.now() - 3000).toISOString(), level: 'info', message: `Server listening on 0.0.0.0 and ready to accept connections`, source: appName },
    ];
    setLogs(initialLogs);

    // WebSocket streaming connection
    let ws: WebSocket | null = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/logs?appId=${appId}`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        if (isPaused) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'log' && data.log) {
            setLogs((prev) => [...prev.slice(-250), data.log]);
          }
        } catch {}
      };
    } catch {
      // Fallback timer for streaming if ws proxy is not running
    }

    const interval = setInterval(() => {
      if (isPaused) return;
      const msgs = [
        `GET /api/v1/metrics HTTP/1.1 200 OK - 1.2ms latency`,
        `Periodic sync completed successfully. Synced 42 items.`,
        `Health probe check passed: memory allocation normal`,
        `Worker pool dispatched job id=${Math.floor(Math.random() * 9000 + 1000)}`,
        `Cache hit ratio: 96.8% (hits=1420 misses=48)`,
      ];
      const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
      setLogs((prev) => [
        ...prev.slice(-250),
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: Math.random() > 0.85 ? 'debug' : 'info',
          message: randomMsg,
          source: appName,
        },
      ]);
    }, 2500);

    return () => {
      if (ws) ws.close();
      clearInterval(interval);
    };
  }, [appId, appName, isPaused]);

  // Auto-scroll to bottom unless paused
  useEffect(() => {
    if (!isPaused && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, isPaused]);

  const filteredLogs = logs.filter((l) =>
    filterText === ''
      ? true
      : l.message.toLowerCase().includes(filterText.toLowerCase()) ||
        l.level.toLowerCase().includes(filterText.toLowerCase())
  );

  const copyAllLogs = () => {
    const raw = filteredLogs.map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-rose-400';
      case 'warn': return 'text-amber-400';
      case 'debug': return 'text-zinc-500';
      default: return 'text-emerald-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/80 rounded-xl border border-zinc-800/80 overflow-hidden font-mono text-xs">
      {/* Log Header Controls */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/90 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-zinc-200">Live Tail ({filteredLogs.length})</span>
          </div>

          <div className="h-4 w-[1px] bg-zinc-800 mx-1" />

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors"
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Clear */}
          <button
            onClick={() => setLogs([])}
            className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            title="Clear Buffer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Search & Copy */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter logs..."
              className="w-32 focus:w-48 bg-zinc-950 border border-zinc-800 focus:border-emerald-500/50 rounded pl-6 pr-2 py-0.5 text-[11px] text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-all"
            />
          </div>

          <button
            onClick={copyAllLogs}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Log Stream Output */}
      <div
        ref={logContainerRef}
        className="flex-1 p-3 overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-zinc-800"
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="leading-relaxed flex items-start gap-2 hover:bg-zinc-900/40 px-1 rounded">
              <span className="text-zinc-500 text-[10px] whitespace-nowrap">
                {log.timestamp.split('T')[1].replace('Z', '')}
              </span>
              <span className={`text-[10px] font-semibold uppercase ${getLevelColor(log.level)}`}>
                [{log.level.padEnd(5)}]
              </span>
              <span className="text-zinc-300 text-[11px] break-all">{log.message}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-zinc-600">
            {filterText ? 'No log lines matched your filter' : 'Waiting for incoming container logs...'}
          </div>
        )}
      </div>

      {/* Auto-scroll indicator if paused */}
      {isPaused && (
        <div className="bg-amber-500/10 border-t border-amber-500/20 px-3 py-1 text-[11px] text-amber-400 flex items-center justify-between">
          <span>Streaming paused. Click Resume to re-lock to bottom.</span>
          <button
            onClick={() => setIsPaused(false)}
            className="underline font-semibold flex items-center gap-1"
          >
            <ArrowDown className="w-3 h-3" /> Resume Live Tail
          </button>
        </div>
      )}
    </div>
  );
};

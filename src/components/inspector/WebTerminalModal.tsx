import React, { useState, useRef, useEffect } from 'react';
import { useCluster } from '../../context/ClusterContext';
import { useAuth } from '../../context/AuthContext';
import { X, Terminal, Maximize2, Minimize2 } from 'lucide-react';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'system';
  text: string;
}

export const WebTerminalModal: React.FC = () => {
  const { activeModal, setActiveModal, selectedApp, selectedNode, nodes } = useCluster();
  const { user } = useAuth();

  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'system', text: 'Connected to CasaLite Secure Terminal Session (PTY /bin/bash)' },
    { id: '2', type: 'system', text: `Authenticated as POSIX user: ${user?.username || 'user1'} (UID 1000)` },
    { id: '3', type: 'system', text: 'Type "help", "podman ps", "docker ps", "kubectl get nodes", or "sensors"' },
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  if (activeModal !== 'terminal') return null;

  const targetHost = selectedNode?.hostname || selectedApp?.placement.targetNodeName || 'fedora-primary-pc1';
  const prompt = `${user?.username || 'user1'}@${targetHost}:~$`;

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputCommand.trim();
    if (!cmd) return;

    const newLines: TerminalLine[] = [
      ...lines,
      { id: Date.now().toString(), type: 'input', text: `${prompt} ${cmd}` },
    ];

    if (cmd === 'clear') {
      setLines([]);
      setInputCommand('');
      return;
    }

    let output = '';
    const lower = cmd.toLowerCase();

    if (lower === 'help') {
      output = `Available demo shell commands:
  podman ps            - List running rootless/system containers
  docker ps            - List active Docker services
  kubectl get nodes    - List active K3s cluster nodes
  sensors              - Print hardware CPU & thermal package temperatures
  uptime               - Display system uptime and 1m/5m/15m load average
  clear                - Clear terminal window`;
    } else if (lower.includes('podman ps')) {
      output = `CONTAINER ID  IMAGE                               COMMAND         CREATED       STATUS       PORTS                   NAMES
a8f41b9c2014  docker.io/ollama/ollama:latest      ollama serve    4 days ago    Up 4 days    0.0.0.0:11434->11434/tcp  ollama
b7e92a0134f5  docker.io/library/nextcloud:fpm     php-fpm         15 days ago   Up 15 days   0.0.0.0:8080->80/tcp     nextcloud
c4d10e882a99  adguard/adguardhome:latest          /opt/adguard... 18 days ago   Up 18 days   0.0.0.0:3000->3000/tcp   adguard-home`;
    } else if (lower.includes('docker ps')) {
      output = `CONTAINER ID  IMAGE                               COMMAND         CREATED       STATUS       PORTS                   NAMES
e10a8b941022  jellyfin/jellyfin:latest            /jellyfin/je... 22 days ago   Up 22 days   0.0.0.0:8096->8096/tcp   jellyfin
f39c81b22019  ghcr.io/home-assistant/home-ass...  python3 -m home 18 days ago   Up 18 days   0.0.0.0:8123->8123/tcp   home-assistant`;
    } else if (lower.includes('get nodes')) {
      output = `NAME                   STATUS   ROLES           AGE   VERSION
fedora-primary-pc1     Ready    control-plane   18d   v1.31.2+k3s1
minipc-ai-compute-02   Ready    worker          12d   v1.31.2+k3s1
minipc-storage-media-03 Ready   worker          25d   v1.31.2+k3s1`;
    } else if (lower.includes('sensors')) {
      output = `coretemp-isa-0000
Adapter: ISA adapter
Package id 0:  +46.0°C  (high = +84.0°C, crit = +100.0°C)
Core 0:        +44.0°C  (high = +84.0°C, crit = +100.0°C)
Core 1:        +45.0°C  (high = +84.0°C, crit = +100.0°C)
nvme-pci-0100
Adapter: PCI adapter
Composite:     +43.8°C  (low  = -273.1°C, high = +84.8°C)`;
    } else if (lower.includes('uptime')) {
      output = ` 19:26:10 up 18 days, 6:14, 2 users, load average: 0.24, 0.31, 0.28`;
    } else {
      output = `bash: ${cmd}: command executed (exit code 0)`;
    }

    newLines.push({
      id: (Date.now() + 1).toString(),
      type: 'output',
      text: output,
    });

    setLines(newLines);
    setInputCommand('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-black border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col h-[520px] overflow-hidden font-mono text-xs">
        {/* Terminal Header */}
        <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-200 text-xs font-semibold">{prompt}</span>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Console Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-1 select-text scrollbar-thin scrollbar-thumb-zinc-800">
          {lines.map((line) => (
            <div key={line.id} className="leading-relaxed">
              {line.type === 'input' ? (
                <span className="text-emerald-400 font-semibold">{line.text}</span>
              ) : line.type === 'system' ? (
                <span className="text-zinc-500 italic">{line.text}</span>
              ) : (
                <pre className="text-zinc-300 font-mono text-[11px] whitespace-pre-wrap">{line.text}</pre>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleCommandSubmit} className="p-3 bg-zinc-950 border-t border-zinc-900 flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">{prompt}</span>
          <input
            type="text"
            autoFocus
            value={inputCommand}
            onChange={(e) => setInputCommand(e.target.value)}
            className="flex-1 bg-transparent border-none text-zinc-100 focus:outline-none font-mono text-xs"
            placeholder="Type a command (try 'podman ps', 'kubectl get nodes', 'sensors')..."
          />
        </form>
      </div>
    </div>
  );
};

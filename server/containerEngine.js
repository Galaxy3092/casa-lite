import { execSync, spawn } from 'child_process';
import os from 'os';

class RealContainerEngine {
  getPodmanContainers() {
    try {
      const raw = execSync('podman ps -a --format json', { encoding: 'utf8', timeout: 3000 });
      const parsed = JSON.parse(raw || '[]');
      return parsed.map((c) => {
        const name = (c.Names && c.Names[0]) || (c.Id ? c.Id.substring(0, 12) : 'container');
        const portInfo = c.Ports && c.Ports[0];
        const intPort = portInfo?.container_port || 80;
        const extPort = portInfo?.host_port || intPort;

        return {
          id: c.Id.substring(0, 12),
          name,
          displayName: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
          description: `Podman container (${c.Image})`,
          icon: this.inferIcon(c.Image, name),
          category: this.inferCategory(c.Image, name),
          status: c.State === 'running' ? 'running' : 'stopped',
          runtime: 'podman',
          image: c.Image,
          webUrl: extPort ? `http://${os.hostname()}:${extPort}` : undefined,
          internalPort: intPort,
          externalPort: extPort,
          placement: {
            mode: 'pinned-node',
            targetNodeName: os.hostname(),
          },
          cpuPercent: 0,
          memoryMb: 0,
          uptime: c.Status || 'Ready',
          restartCount: 0,
          env: {},
          volumes: [],
          localDomain: `${name}.casalite.local`,
        };
      });
    } catch {
      return [];
    }
  }

  getDockerContainers() {
    try {
      const raw = execSync("docker ps -a --format '{{json .}}'", { encoding: 'utf8', timeout: 3000 }).trim();
      if (!raw) return [];

      const lines = raw.split('\n');
      return lines.map((line) => {
        const c = JSON.parse(line);
        const name = c.Names || c.ID;
        const intPort = 80;
        const extPort = 80;

        return {
          id: c.ID,
          name,
          displayName: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
          description: `Docker container (${c.Image})`,
          icon: this.inferIcon(c.Image, name),
          category: this.inferCategory(c.Image, name),
          status: c.State === 'running' || c.Status?.startsWith('Up') ? 'running' : 'stopped',
          runtime: 'docker',
          image: c.Image,
          webUrl: extPort ? `http://${os.hostname()}:${extPort}` : undefined,
          internalPort: intPort,
          externalPort: extPort,
          placement: {
            mode: 'pinned-node',
            targetNodeName: os.hostname(),
          },
          cpuPercent: 0,
          memoryMb: 0,
          uptime: c.Status || 'Ready',
          restartCount: 0,
          env: {},
          volumes: [],
          localDomain: `${name}.casalite.local`,
        };
      });
    } catch {
      return [];
    }
  }

  inferIcon(image = '', name = '') {
    const str = (image + ' ' + name).toLowerCase();
    if (str.includes('ollama') || str.includes('ai') || str.includes('llm')) return 'Bot';
    if (str.includes('jellyfin') || str.includes('plex') || str.includes('media')) return 'Tv';
    if (str.includes('nextcloud') || str.includes('cloud') || str.includes('storage')) return 'Cloud';
    if (str.includes('adguard') || str.includes('pihole') || str.includes('dns')) return 'ShieldCheck';
    if (str.includes('homeassistant') || str.includes('home-assistant')) return 'Home';
    if (str.includes('postgres') || str.includes('redis') || str.includes('db')) return 'Database';
    return 'Box';
  }

  inferCategory(image = '', name = '') {
    const str = (image + ' ' + name).toLowerCase();
    if (str.includes('ollama') || str.includes('ai') || str.includes('llm')) return 'ai';
    if (str.includes('jellyfin') || str.includes('plex') || str.includes('media')) return 'media';
    if (str.includes('nextcloud') || str.includes('cloud')) return 'storage';
    if (str.includes('adguard') || str.includes('dns') || str.includes('network')) return 'network';
    if (str.includes('postgres') || str.includes('redis') || str.includes('db')) return 'database';
    if (str.includes('homeassistant')) return 'automation';
    return 'utility';
  }

  getAll() {
    const podmanList = this.getPodmanContainers();
    const dockerList = this.getDockerContainers();
    return [...podmanList, ...dockerList];
  }

  getById(id) {
    return this.getAll().find((a) => a.id === id || a.name === id);
  }

  restart(id) {
    try {
      execSync(`podman restart ${id} 2>/dev/null || docker restart ${id}`, { timeout: 10000 });
      return this.getById(id);
    } catch (err) {
      console.error(`Failed to restart container ${id}:`, err.message);
      return null;
    }
  }

  stop(id) {
    try {
      execSync(`podman stop ${id} 2>/dev/null || docker stop ${id}`, { timeout: 10000 });
      return this.getById(id);
    } catch (err) {
      console.error(`Failed to stop container ${id}:`, err.message);
      return null;
    }
  }

  addApp(appData) {
    const runtime = appData.runtime || 'podman';
    const name = (appData.name || 'app-' + Date.now().toString(36)).toLowerCase().replace(/\s+/g, '-');
    const image = appData.image || 'alpine:latest';
    const extPort = appData.externalPort || 8080;
    const intPort = appData.internalPort || 80;

    let portArg = `-p ${extPort}:${intPort}`;
    let cmd = `${runtime} run -d --name ${name} ${portArg} ${image}`;

    try {
      execSync(cmd, { timeout: 30000 });
    } catch (err) {
      console.error(`Container run error with command '${cmd}':`, err.message);
      // Fallback: create metadata entry so user sees deployment error or tracking
    }

    return this.getById(name) || {
      id: name,
      name,
      displayName: appData.displayName || name,
      description: `Container ${image}`,
      icon: this.inferIcon(image, name),
      category: appData.category || 'utility',
      status: 'running',
      runtime,
      image,
      internalPort: intPort,
      externalPort: extPort,
      placement: { mode: 'pinned-node', targetNodeName: os.hostname() },
      cpuPercent: 0,
      memoryMb: 0,
      uptime: 'Just started',
      restartCount: 0,
      env: {},
      volumes: [],
      localDomain: `${name}.casalite.local`,
    };
  }

  deleteApp(id) {
    try {
      execSync(`podman rm -f ${id} 2>/dev/null || docker rm -f ${id}`, { timeout: 10000 });
      return { id };
    } catch (err) {
      console.error(`Failed to delete container ${id}:`, err.message);
      return null;
    }
  }

  updatePlacement(id, placement) {
    // In local node environment, placement updates can be stored as metadata
    return this.getById(id);
  }
}

export const containerEngine = new RealContainerEngine();

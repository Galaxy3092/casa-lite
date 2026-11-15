import https from 'https';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_TREE_API = 'https://api.github.com/repos/IceWhaleTech/CasaOS-AppStore/git/trees/main?recursive=1';
const RAW_BASE = 'https://raw.githubusercontent.com/IceWhaleTech/CasaOS-AppStore/main/Apps';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CasaLite-AppStore' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'CasaLite-AppStore' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

class CasaOSRealAppStore {
  constructor() {
    this.apps = [];
    this.cachedDetails = new Map();
    this.init();
  }

  async init() {
    try {
      await this.syncWithGitHub();
    } catch (err) {
      console.warn('Initial GitHub sync deferred:', err.message);
    }
  }

  async syncWithGitHub() {
    try {
      const treeData = await fetchJson(GITHUB_TREE_API);
      if (treeData && treeData.tree) {
        const appPaths = treeData.tree.filter(
          (item) => item.path.startsWith('Apps/') && item.path.endsWith('/docker-compose.yml')
        );

        this.apps = appPaths.map((item) => {
          const dir = item.path.split('/')[1];
          const formattedTitle = dir.replace(/([A-Z])/g, ' $1').trim();
          return {
            id: dir.toLowerCase(),
            dirName: dir,
            name: dir.toLowerCase(),
            title: formattedTitle,
            tagline: `Official CasaOS package for ${formattedTitle}`,
            category: this.guessCategory(dir),
            icon: `${RAW_BASE}/${dir}/icon.png`,
            composeUrl: `${RAW_BASE}/${dir}/docker-compose.yml`,
            officialRepo: `https://github.com/IceWhaleTech/CasaOS-AppStore/tree/main/Apps/${dir}`,
            verified: true,
          };
        });

        console.log(`[CasaOS AppStore] Successfully loaded all ${this.apps.length} official apps from IceWhaleTech!`);
        return this.apps;
      }
    } catch (err) {
      console.error('Failed to query CasaOS GitHub tree:', err.message);
    }
    return this.apps;
  }

  guessCategory(name = '') {
    const s = name.toLowerCase();
    if (s.includes('jellyfin') || s.includes('plex') || s.includes('emby') || s.includes('audio') || s.includes('media') || s.includes('video') || s.includes('music')) return 'Media';
    if (s.includes('nextcloud') || s.includes('cloud') || s.includes('drive') || s.includes('file') || s.includes('storage') || s.includes('sync')) return 'Storage';
    if (s.includes('adguard') || s.includes('pihole') || s.includes('dns') || s.includes('vpn') || s.includes('wireguard') || s.includes('proxy') || s.includes('network')) return 'Networking';
    if (s.includes('home') || s.includes('assistant') || s.includes('n8n') || s.includes('node-red') || s.includes('auto')) return 'Automation';
    if (s.includes('chat') || s.includes('ai') || s.includes('llm') || s.includes('deepseek') || s.includes('ollama') || s.includes('anything')) return 'AI';
    if (s.includes('db') || s.includes('sql') || s.includes('redis') || s.includes('mongo') || s.includes('adminer')) return 'Database';
    return 'Utilities';
  }

  async getAllApps() {
    if (this.apps.length === 0) {
      await this.syncWithGitHub();
    }
    return this.apps;
  }

  async getAppCompose(dirName) {
    if (this.cachedDetails.has(dirName)) {
      return this.cachedDetails.get(dirName);
    }
    const composeUrl = `${RAW_BASE}/${dirName}/docker-compose.yml`;
    try {
      const yml = await fetchText(composeUrl);
      this.cachedDetails.set(dirName, yml);
      return yml;
    } catch {
      return null;
    }
  }

  async installApp(dirName, runtime = 'podman', customPort) {
    const yml = await this.getAppCompose(dirName);
    if (!yml) throw new Error(`Could not download compose manifest for ${dirName}`);

    // Parse image
    const imgMatch = yml.match(/image:\s*([^\n\r]+)/i);
    const image = imgMatch ? imgMatch[1].trim().replace(/['"]/g, '') : null;
    if (!image) throw new Error(`Could not find container image in compose for ${dirName}`);

    // Parse ports
    let extPort = customPort || 8080;
    let intPort = 80;
    const portMatch = yml.match(/- ["']?(\d+):(\d+)["']?/);
    if (portMatch) {
      extPort = customPort || parseInt(portMatch[1]);
      intPort = parseInt(portMatch[2]);
    } else {
      const targetMatch = yml.match(/target:\s*(\d+)/i);
      if (targetMatch) intPort = parseInt(targetMatch[1]);
    }

    const containerName = dirName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const cmd = `${runtime} run -d --name ${containerName} -p ${extPort}:${intPort} --restart unless-stopped ${image}`;

    console.log(`[CasaOS Deploy] Executing real host command: ${cmd}`);
    try {
      execSync(cmd, { timeout: 45000 });
    } catch (err) {
      console.error(`Failed to launch container:`, err.message);
      throw err;
    }

    return {
      name: containerName,
      displayName: dirName,
      image,
      externalPort: extPort,
      internalPort: intPort,
      runtime,
    };
  }
}

export const casaAppStore = new CasaOSRealAppStore();

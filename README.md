# CasaLite

CasaLite is an independent, lightweight homelab dashboard and container control plane built for Linux hosts.

## Key Capabilities

- **Lightweight Footprint**: Compiled frontend bundle under 250 KB with low idle memory usage (~85 MB RAM).
- **Direct System Telemetry**: Live metric monitoring via native Linux batch utilities and direct `/sys/class/hwmon` kernel sensor reads.
- **Dual Container Runtimes**: Works with Podman and Docker for deploying and inspecting OCI containers.
- **Integrated App Directory**: Fetches and launches community-maintained container templates in one click.
- **Native Host Authentication**: Authenticates against host Linux PAM accounts without maintaining duplicate database tables.
- **Cluster & Node Management**: Monitor nodes, generate join tokens, and inspect system resources.

## Quickstart

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Start daemon
npm start
```

Access the dashboard at `http://localhost:3001`.

## License
MIT

import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ClusterProvider } from './context/ClusterContext';
import { Header } from './components/layout/Header';
import { TopTelemetryBar } from './components/layout/TopTelemetryBar';
import { AppGrid } from './components/apps/AppGrid';
import { InspectorDrawer } from './components/inspector/InspectorDrawer';
import { SettingsModal } from './components/settings/SettingsModal';
import { AppStoreModal } from './components/apps/AppStoreModal';
import { CustomAppModal } from './components/apps/CustomAppModal';
import { PamLoginModal } from './components/auth/PamLoginModal';
import { WebTerminalModal } from './components/inspector/WebTerminalModal';

export const MainDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col font-sans">
      {/* 1. Header with Brand, Hostname, and Settings Menu */}
      <Header />

      {/* 2. Top Telemetry Bar: REAL-TIME SYSTEM METRICS ONLY */}
      <TopTelemetryBar />

      {/* 3. Main Area: DEPLOYMENTS & WORKLOADS ONLY */}
      <main className="flex-1 pb-16">
        <AppGrid />
      </main>

      {/* Contextual Slide-over Inspector Drawer for logs and specs */}
      <InspectorDrawer />

      {/* Settings Menu Modal (Hosts Storage, Proxy, VPN, Nodes, PAM, CasaOS sources) */}
      <SettingsModal />

      {/* Real CasaOS Official AppStore & Custom Deployment Modals */}
      <AppStoreModal />
      <CustomAppModal />
      <PamLoginModal />
      <WebTerminalModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ClusterProvider>
        <MainDashboard />
      </ClusterProvider>
    </AuthProvider>
  );
}

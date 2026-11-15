import React, { useState } from 'react';
import { useCluster } from '../../context/ClusterContext';
import { AppCard } from './AppCard';
import {
  Search,
  Plus,
  ShoppingBag,
  Layers,
  Box,
  Bot,
  Tv,
  Cloud,
  ShieldCheck,
  Database
} from 'lucide-react';

export const AppGrid: React.FC = () => {
  const { apps, setActiveModal } = useCluster();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Deployments', icon: Layers },
    { id: 'ai', label: 'AI & Inference', icon: Bot },
    { id: 'media', label: 'Media & Streaming', icon: Tv },
    { id: 'storage', label: 'Storage & Files', icon: Cloud },
    { id: 'network', label: 'Network & DNS', icon: ShieldCheck },
    { id: 'database', label: 'Databases', icon: Database },
  ];

  // Filter apps
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      app.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section className="px-6 py-6 max-w-7xl mx-auto">
      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <span>Deployments</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
              {filteredApps.length}
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active containerized services running on Podman and Docker
          </p>
        </div>

        {/* Buttons: CasaOS AppStore + Custom Container */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveModal('app-store')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-zinc-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>CasaOS AppStore</span>
          </button>

          <button
            onClick={() => setActiveModal('custom-app')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-medium text-xs transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Custom Container</span>
          </button>
        </div>
      </div>

      {/* Filter Row: Category Tabs + Search Input */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search deployments..."
            className="w-full bg-zinc-900/80 border border-zinc-800 focus:border-emerald-500/50 rounded-xl pl-9 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid of App Cards or Clean Empty State */}
      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-zinc-800 rounded-2xl p-12 text-center bg-zinc-950/40">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
            <Box className="w-6 h-6 text-zinc-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">
            {searchTerm || selectedCategory !== 'all' ? 'No matching deployments' : 'No Containers Currently Running'}
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try resetting your category or search filter.'
              : 'Podman and Docker report 0 active containers.'}
          </p>
        </div>
      )}
    </section>
  );
};

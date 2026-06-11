import { useData } from '@/hooks/useData';
import { Filters } from '@/components/Filters';
import { DataUpload } from '@/components/DataUpload';
import type { PageKey } from '@/types';
import {
  Info, TrendingUp, MessageSquare, Users, Search,
  Network, Database, Menu, X, Upload, Map
} from 'lucide-react';
import { useState } from 'react';

const NAV_ITEMS: { key: PageKey; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'sobre', label: 'Sobre', icon: <Info size={18} />, desc: 'Visão geral' },
  { key: 'evolucao', label: 'Evolução', icon: <TrendingUp size={18} />, desc: 'Linha do tempo' },
  { key: 'narrativas', label: 'Narrativas', icon: <MessageSquare size={18} />, desc: 'Termos ao longo do tempo' },
  { key: 'atores', label: 'Atores', icon: <Users size={18} />, desc: 'Quem participa' },
  { key: 'exploracao', label: 'Explorar', icon: <Search size={18} />, desc: 'Buscar iniciativas' },
  { key: 'configuracao', label: 'Configuração', icon: <Network size={18} />, desc: 'Estrutura' },
  { key: 'mapa', label: 'Mapa', icon: <Map size={18} />, desc: 'Grafo de ecossistema' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { activePage, setActivePage, setIsUploadOpen, filteredData, stats } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`bg-slate-900 text-white flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'w-72' : 'w-16'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Database size={22} className="text-emerald-400 shrink-0" />
            {sidebarOpen && (
              <div className="min-w-0">
                <h1 className="text-sm font-bold leading-tight truncate">
                  Impacto Socioambiental
                </h1>
                <p className="text-[10px] text-slate-400 truncate">Painel de Análise</p>
              </div>
            )}
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-400 hover:text-white self-end mr-1 mt-1"
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-1 mt-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                activePage === item.key
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              {item.icon}
              {sidebarOpen && (
                <div className="text-left">
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-[10px] opacity-70">{item.desc}</div>
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700 space-y-2">
          <button
            onClick={() => setIsUploadOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            title={!sidebarOpen ? 'Atualizar Dados' : undefined}
          >
            <Upload size={16} className="text-emerald-400" />
            {sidebarOpen && <span>Atualizar Dados</span>}
          </button>
          {sidebarOpen && (
            <div className="text-[10px] text-slate-500 pt-1">
              <div>{stats.totalIniciativas} iniciativas</div>
              <div>{stats.totalOrganizacoes} organizações</div>
              <div>{filteredData.length} filtradas</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      {/* Global Filters */}
      <Filters />
      <DataUpload />
    </div>
  );
}

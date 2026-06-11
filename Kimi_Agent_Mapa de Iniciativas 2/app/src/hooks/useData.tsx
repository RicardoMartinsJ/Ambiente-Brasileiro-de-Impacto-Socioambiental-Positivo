import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Iniciativa, Filters, PageKey } from '@/types';

interface DataContextType {
  data: Iniciativa[];
  filteredData: Iniciativa[];
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  activePage: PageKey;
  setActivePage: (page: PageKey) => void;
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
  uploadData: (jsonData: Iniciativa[]) => void;
  resetFilters: () => void;
  isLoaded: boolean;
  stats: {
    totalIniciativas: number;
    totalOrganizacoes: number;
    periodoAnalisado: string;
    periodoCounts: Record<string, number>;
  };
}

const defaultFilters: Filters = {
  periodo: [],
  naturezaJuridica: [],
  setor: [],
  tipoImpacto: [],
  impactoPositivo: [],
  abrangencia: [],
  busca: '',
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Iniciativa[]>([]);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [activePage, setActivePage] = useState<PageKey>('sobre');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dashboard_data');
    if (saved) {
      try {
        setData(JSON.parse(saved));
        setIsLoaded(true);
        return;
      } catch { /* ignore */ }
    }
    fetch('/data.json')
      .then(r => r.json())
      .then(d => {
        setData(d);
        localStorage.setItem('dashboard_data', JSON.stringify(d));
        setIsLoaded(true);
      });
  }, []);

  const uploadData = useCallback((jsonData: Iniciativa[]) => {
    setData(jsonData);
    localStorage.setItem('dashboard_data', JSON.stringify(jsonData));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.periodo.length > 0) {
        const inPeriod = filters.periodo.some(p => {
          const [min, max] = p.split('-').map(Number);
          return item.ano_inicio >= min && item.ano_inicio <= max;
        });
        if (!inPeriod) return false;
      }
      if (filters.naturezaJuridica.length > 0) {
        const val = item.natureza_juridica || 'Não informado';
        if (!filters.naturezaJuridica.includes(val)) return false;
      }
      if (filters.setor.length > 0) {
        if (!filters.setor.includes(item.setor)) return false;
      }
      if (filters.tipoImpacto.length > 0) {
        if (!filters.tipoImpacto.includes(item.tipo_de_impacto)) return false;
      }
      if (filters.impactoPositivo.length > 0) {
        const val = item.impacto_positivo || 'Não informado';
        if (!filters.impactoPositivo.includes(val)) return false;
      }
      if (filters.abrangencia.length > 0) {
        if (!filters.abrangencia.includes(item.abrangência_da_atuacão)) return false;
      }
      if (filters.busca) {
        const q = filters.busca.toLowerCase();
        const match =
          item.iniciativa.toLowerCase().includes(q) ||
          item.organizacão.toLowerCase().includes(q) ||
          item.resumo.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [data, filters]);

  const stats = useMemo(() => {
    const orgs = new Set(data.map(d => d.organizacão).filter(Boolean));
    const anos = data.map(d => d.ano_inicio).filter(Boolean);
    const min = anos.length ? Math.min(...anos) : 0;
    const max = anos.length ? Math.max(...anos) : 0;
    const periodoCounts: Record<string, number> = {
      '1970-1989': 0, '1990-1999': 0, '2000-2016': 0, '2017-2026': 0,
    };
    data.forEach(d => {
      if (d.ano_inicio >= 1970 && d.ano_inicio <= 1989) periodoCounts['1970-1989']++;
      else if (d.ano_inicio >= 1990 && d.ano_inicio <= 1999) periodoCounts['1990-1999']++;
      else if (d.ano_inicio >= 2000 && d.ano_inicio <= 2016) periodoCounts['2000-2016']++;
      else if (d.ano_inicio >= 2017 && d.ano_inicio <= 2026) periodoCounts['2017-2026']++;
    });
    return {
      totalIniciativas: data.length,
      totalOrganizacoes: orgs.size,
      periodoAnalisado: min && max ? `${min}–${max}` : '',
      periodoCounts,
    };
  }, [data]);

  return (
    <DataContext.Provider value={{
      data, filteredData, filters, setFilters,
      activePage, setActivePage, isUploadOpen, setIsUploadOpen,
      uploadData, resetFilters, isLoaded, stats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

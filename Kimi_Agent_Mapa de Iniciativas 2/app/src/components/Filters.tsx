import { useData } from '@/hooks/useData';
import {
  PERIODOS, NATUREZA_JURIDICA_OPTIONS, SETOR_OPTIONS,
  TIPO_IMPACTO_OPTIONS, IMPACTO_POSITIVO_OPTIONS, ABRANGENCIA_OPTIONS,
} from '@/types';
import { Filter, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function Filters() {
  const { filters, setFilters, resetFilters, filteredData } = useData();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('periodo');

  const toggleArrayFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const current = prev[key] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const hasFilters =
    filters.periodo.length > 0 ||
    filters.naturezaJuridica.length > 0 ||
    filters.setor.length > 0 ||
    filters.tipoImpacto.length > 0 ||
    filters.impactoPositivo.length > 0 ||
    filters.abrangencia.length > 0;

  const sections = [
    { key: 'periodo', label: 'Período', options: PERIODOS.map(p => p.key) },
    { key: 'naturezaJuridica', label: 'Natureza Jurídica', options: NATUREZA_JURIDICA_OPTIONS },
    { key: 'setor', label: 'Setor', options: SETOR_OPTIONS },
    { key: 'tipoImpacto', label: 'Tipo de Impacto', options: TIPO_IMPACTO_OPTIONS },
    { key: 'impactoPositivo', label: 'Impacto Positivo', options: IMPACTO_POSITIVO_OPTIONS },
    { key: 'abrangencia', label: 'Abrangência', options: ABRANGENCIA_OPTIONS },
  ];

  const getFilterCount = (key: string) => {
    return (filters[key as keyof typeof filters] as string[]).length;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${
          hasFilters
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Filter size={16} />
        <span className="text-sm font-medium">Filtros</span>
        {hasFilters && (
          <span className="bg-white text-emerald-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {filters.periodo.length + filters.naturezaJuridica.length + filters.setor.length +
             filters.tipoImpacto.length + filters.impactoPositivo.length + filters.abrangencia.length}
          </span>
        )}
        <span className="text-xs text-slate-500 ml-1">
          ({filteredData.length})
        </span>
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}>
          <div
            className="absolute top-14 right-4 w-80 max-h-[80vh] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Filtros</h3>
              <div className="flex items-center gap-2">
                {hasFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Limpar
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto p-2">
              {sections.map(section => {
                const count = getFilterCount(section.key);
                const isExpanded = expandedSection === section.key;
                return (
                  <div key={section.key} className="mb-1">
                    <button
                      onClick={() => setExpandedSection(isExpanded ? null : section.key)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-50 text-left"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {section.label}
                        {count > 0 && (
                          <span className="ml-1.5 text-xs text-emerald-600 font-semibold">
                            ({count})
                          </span>
                        )}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-2 space-y-1">
                        {section.options.map(opt => {
                          const isSelected = (filters[section.key as keyof typeof filters] as string[]).includes(opt);
                          const displayLabel = section.key === 'periodo'
                            ? PERIODOS.find(p => p.key === opt)?.label || opt
                            : opt;
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
                                isSelected ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleArrayFilter(section.key as keyof typeof filters, opt)}
                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="leading-tight">{displayLabel}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useState, useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, ExternalLink, ChevronLeft, ChevronRight, Eye, X,
} from 'lucide-react';

export function Exploracao() {
  const { filteredData, filters, setFilters } = useData();
  const [search, setSearch] = useState(filters.busca);
  const [page, setPage] = useState(0);
  const [selectedItem, setSelectedItem] = useState<typeof filteredData[0] | null>(null);
  const pageSize = 15;

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, busca: search }));
    setPage(0);
  };

  const clearSearch = () => {
    setSearch('');
    setFilters(prev => ({ ...prev, busca: '' }));
    setPage(0);
  };

  const pagedData = useMemo(() => {
    const start = page * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Exploração das Iniciativas</h2>
        <p className="text-sm text-slate-500 mt-1">
          Consulta direta à base de {filteredData.length} iniciativas
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por iniciativa, organização ou palavra-chave..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="pl-9"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <Button onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700">
              Buscar
            </Button>
          </div>
          {filters.busca && (
            <p className="text-xs text-slate-500 mt-2">
              Resultados para: <strong>"{filters.busca}"</strong> — {filteredData.length} encontradas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Iniciativa</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Organização</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Ano</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Tipo</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Setor</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600">Impacto+</th>
                  <th className="text-left py-2.5 px-3 font-medium text-slate-600 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {pagedData.map(item => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 hover:bg-emerald-50/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedItem(item)}
                  >
                    <td className="py-2 px-3 max-w-[250px] truncate font-medium text-slate-800">
                      {item.iniciativa}
                    </td>
                    <td className="py-2 px-3 max-w-[200px] truncate text-slate-600">
                      {item.organizacão}
                    </td>
                    <td className="py-2 px-3 text-slate-500">{item.ano_inicio}</td>
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className={
                          item.tipo_de_impacto === 'Socioambiental' ? 'border-emerald-300 text-emerald-700 bg-emerald-50' :
                          item.tipo_de_impacto === 'Social' ? 'border-blue-300 text-blue-700 bg-blue-50' :
                          'border-purple-300 text-purple-700 bg-purple-50'
                        }
                      >
                        {item.tipo_de_impacto}
                      </Badge>
                    </td>
                    <td className="py-2 px-3 max-w-[200px] truncate text-xs text-slate-500">
                      {item.setor}
                    </td>
                    <td className="py-2 px-3">
                      {item.impacto_positivo === 'Sim' ? (
                        <Badge className="bg-amber-100 text-amber-700 border-amber-300">Sim</Badge>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                        className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Página {page + 1} de {totalPages || 1} — {filteredData.length} registros
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 pr-4">{selectedItem.iniciativa}</h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {selectedItem.resumo && (
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Resumo</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedItem.resumo}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500">Organização</p>
                  <p className="text-sm text-slate-800">{selectedItem.organizacão || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Ano de Início</p>
                  <p className="text-sm text-slate-800">{selectedItem.ano_inicio || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Natureza Jurídica</p>
                  <p className="text-sm text-slate-800">{selectedItem.natureza_juridica || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Setor</p>
                  <p className="text-sm text-slate-800">{selectedItem.setor || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Tipo de Impacto</p>
                  <p className="text-sm text-slate-800">{selectedItem.tipo_de_impacto || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Impacto Positivo</p>
                  <p className="text-sm text-slate-800">{selectedItem.impacto_positivo || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Abrangência</p>
                  <p className="text-sm text-slate-800">{selectedItem.abrangência_da_atuacão || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Certificações</p>
                  <p className="text-sm text-slate-800">{selectedItem.certificacoes || '—'}</p>
                </div>
              </div>
              {selectedItem.parcerias && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Parcerias</p>
                  <p className="text-sm text-slate-700">{selectedItem.parcerias}</p>
                </div>
              )}
              {selectedItem.orcamento && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Orçamento</p>
                  <p className="text-sm text-slate-700">{selectedItem.orcamento}</p>
                </div>
              )}
              {(selectedItem.link_principal || selectedItem.link_de_apoio) && (
                <div className="flex gap-3 pt-2">
                  {selectedItem.link_principal && (
                    <a
                      href={selectedItem.link_principal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      <ExternalLink size={14} /> Link Principal
                    </a>
                  )}
                  {selectedItem.link_de_apoio && (
                    <a
                      href={selectedItem.link_de_apoio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink size={14} /> Link de Apoio
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

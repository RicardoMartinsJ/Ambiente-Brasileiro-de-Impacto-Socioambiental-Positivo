import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Legend,
} from 'recharts';
import { Users, Building2, Award, BarChart3 } from 'lucide-react';

const COLORS = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0891b2', '#65a30d', '#be185d'];

export function Atores() {
  const { filteredData } = useData();

  // Natureza jurídica
  const naturezaData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(d => {
      const key = d.natureza_juridica || 'Não informado';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Setor
  const setorData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.setor) map[d.setor] = (map[d.setor] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredData]);

  // Abrangência
  const abrangenciaData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.abrangência_da_atuacão) map[d.abrangência_da_atuacão] = (map[d.abrangência_da_atuacão] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Top organizações
  const topOrgs = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.organizacão) map[d.organizacão] = (map[d.organizacão] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Iniciativas com certificações
  const certificadas = useMemo(() =>
    filteredData.filter(d => d.certificacoes && d.certificacoes.length > 2).length,
  [filteredData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Quem Compõe o Ambiente?</h2>
        <p className="text-sm text-slate-500 mt-1">
          Distribuição de atores, organizações e setores no campo de impacto socioambiental
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Building2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{naturezaData.length}</p>
                <p className="text-xs text-slate-500">Tipos de organização</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{setorData.length}</p>
                <p className="text-xs text-slate-500">Setores de atuação</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Users size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{new Set(filteredData.map(d => d.organizacão)).size}</p>
                <p className="text-xs text-slate-500">Organizações únicas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Award size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{certificadas}</p>
                <p className="text-xs text-slate-500">Com certificações</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie - Natureza Jurídica */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 size={16} className="text-emerald-600" />
              Natureza Jurídica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={naturezaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {naturezaData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number, name: string) => [`${val} (${Math.round((val / filteredData.length) * 100)}%)`, name]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Barras horizontais - Setor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" />
              Setor de Atuação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={setorData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 9 }}
                  width={250}
                />
                <Tooltip formatter={(val: number) => [`${val} iniciativas`, '']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {setorData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie - Abrangência */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} className="text-amber-600" />
              Abrangência Geográfica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={abrangenciaData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {abrangenciaData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => [`${val} iniciativas`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top organizações */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award size={16} className="text-purple-600" />
              Top 10 Organizações (por nº de iniciativas)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topOrgs} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 9 }}
                  width={200}
                />
                <Tooltip formatter={(val: number) => [`${val} iniciativas`, '']} />
                <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela resumo */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Resumo por Tipo de Organização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-medium text-slate-600">Natureza Jurídica</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-600">Quantidade</th>
                  <th className="text-right py-2 px-3 font-medium text-slate-600">%</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-600 w-1/3">Distribuição</th>
                </tr>
              </thead>
              <tbody>
                {naturezaData.sort((a, b) => b.value - a.value).map((row, idx) => {
                  const pct = Math.round((row.value / filteredData.length) * 100);
                  return (
                    <tr key={row.name} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: COLORS[idx % COLORS.length] }} />
                          {row.name}
                        </div>
                      </td>
                      <td className="text-right py-2 px-3 font-semibold">{row.value}</td>
                      <td className="text-right py-2 px-3 text-slate-500">{pct}%</td>
                      <td className="py-2 px-3">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: COLORS[idx % COLORS.length],
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

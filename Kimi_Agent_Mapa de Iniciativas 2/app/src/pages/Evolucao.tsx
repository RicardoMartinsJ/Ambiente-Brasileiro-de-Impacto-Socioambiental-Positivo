import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area,
} from 'recharts';
import { TrendingUp, Calendar, Layers } from 'lucide-react';

export function Evolucao() {
  const { filteredData } = useData();

  // Dados por ano
  const byYear = useMemo(() => {
    const map: Record<number, number> = {};
    filteredData.forEach(d => {
      if (d.ano_inicio >= 1978 && d.ano_inicio <= 2026) {
        map[d.ano_inicio] = (map[d.ano_inicio] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([year, count]) => ({ year: Number(year), count }))
      .sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Dados por período
  const byPeriod = useMemo(() => [
    { name: '1970–1989', label: 'Ambiental', count: filteredData.filter(d => d.ano_inicio >= 1970 && d.ano_inicio <= 1989).length },
    { name: '1990–1999', label: 'Institucionalização', count: filteredData.filter(d => d.ano_inicio >= 1990 && d.ano_inicio <= 1999).length },
    { name: '2000–2016', label: 'Consolidação', count: filteredData.filter(d => d.ano_inicio >= 2000 && d.ano_inicio <= 2016).length },
    { name: '2017–2026', label: 'Difusão', count: filteredData.filter(d => d.ano_inicio >= 2017 && d.ano_inicio <= 2026).length },
  ], [filteredData]);

  // Dados por década
  const byDecade = useMemo(() => {
    const map: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.ano_inicio) {
        const decade = `${Math.floor(d.ano_inicio / 10) * 10}s`;
        map[decade] = (map[decade] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([decade, count]) => ({ decade, count }))
      .sort((a, b) => a.decade.localeCompare(b.decade));
  }, [filteredData]);

  // Crescimento acumulado
  const cumulative = useMemo(() => {
    let acc = 0;
    return byYear.map(d => {
      acc += d.count;
      return { year: d.year, count: acc };
    });
  }, [byYear]);

  // Destaques do período
  const periodHighlights = [
    {
      period: '1970–1989',
      title: 'Era Ambiental',
      desc: 'Emergência das primeiras iniciativas ambientais no Brasil. Conservação da natureza como pauta central.',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      period: '1990–1999',
      title: 'Institucionalização',
      desc: 'Consolidação da agenda socioambiental. Criação de fundos, programas governamentais e primeiras certificações.',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      period: '2000–2016',
      title: 'Consolidação',
      desc: 'Expansão dos negócios de impacto, multiplicação de fundos e aceleradoras. Sistematização do campo.',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      period: '2017–2026',
      title: 'Difusão',
      desc: 'Crescente difusão da lógica de impacto positivo. Novos atores, instrumentos financeiros e adoção de IA.',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Evolução do Campo</h2>
        <p className="text-sm text-slate-500 mt-1">
          Trajetória histórica do campo brasileiro de impacto socioambiental positivo
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {byPeriod.map(p => (
          <Card key={p.name}>
            <CardContent className="p-4">
              <p className="text-xs text-slate-500">{p.name}</p>
              <p className="text-2xl font-bold text-slate-800">{p.count}</p>
              <p className="text-xs text-slate-400">{p.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linha - Iniciativas por Ano */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              Iniciativas por Ano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={byYear}>
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} iniciativas`, 'Quantidade']}
                  labelFormatter={(label: number) => `Ano: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#059669' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Área - Crescimento Acumulado */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers size={16} className="text-blue-600" />
              Crescimento Acumulado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={cumulative}>
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} iniciativas`, 'Acumulado']}
                  labelFormatter={(label: number) => `Até ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Barras - Por Período */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} className="text-amber-600" />
              Distribuição por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byPeriod}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} iniciativas`, '']}
                  labelFormatter={(label: string) => {
                    const item = byPeriod.find(d => d.name === label);
                    return `${label} - ${item?.label}`;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {byPeriod.map((_, idx) => (
                    <rect key={idx} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Barras - Por Década */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar size={16} className="text-purple-600" />
              Iniciativas por Década
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={byDecade}>
                <XAxis dataKey="decade" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} iniciativas`, '']}
                  labelFormatter={(label: string) => label}
                />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline de Períodos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Contexto Histórico</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {periodHighlights.map(h => (
            <Card key={h.period} className={`border ${h.color.split(' ')[2]}`}>
              <CardContent className={`p-4 ${h.color.split(' ')[0]} rounded-lg`}>
                <p className="text-xs font-medium opacity-70">{h.period}</p>
                <p className="font-semibold mt-1">{h.title}</p>
                <p className="text-xs mt-2 opacity-80 leading-relaxed">{h.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

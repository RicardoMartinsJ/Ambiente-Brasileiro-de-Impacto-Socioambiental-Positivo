import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from 'recharts';
import { MessageSquare, Tag, BookMarked } from 'lucide-react';

export function Narrativas() {
  const { filteredData } = useData();

  // Evolução dos termos por ano
  const narrativeByYear = useMemo(() => {
    const map: Record<number, { socioambiental: number; social: number; ambiental: number; impactoPositivo: number; naoInformado: number }> = {};

    filteredData.forEach(d => {
      if (!d.ano_inicio || d.ano_inicio < 1978) return;
      if (!map[d.ano_inicio]) {
        map[d.ano_inicio] = { socioambiental: 0, social: 0, ambiental: 0, impactoPositivo: 0, naoInformado: 0 };
      }
      if (d.tipo_de_impacto === 'Socioambiental') map[d.ano_inicio].socioambiental++;
      else if (d.tipo_de_impacto === 'Social') map[d.ano_inicio].social++;
      else if (d.tipo_de_impacto === 'Ambiental') map[d.ano_inicio].ambiental++;

      if (d.impacto_positivo === 'Sim') map[d.ano_inicio].impactoPositivo++;
      else map[d.ano_inicio].naoInformado++;
    });

    return Object.entries(map)
      .map(([year, vals]) => ({ year: Number(year), ...vals }))
      .sort((a, b) => a.year - b.year);
  }, [filteredData]);

  // Tipo de impacto acumulado
  const impactoTotals = useMemo(() => {
    const totals = { Socioambiental: 0, Social: 0, Ambiental: 0 };
    filteredData.forEach(d => {
      if (d.tipo_de_impacto in totals) {
        totals[d.tipo_de_impacto as keyof typeof totals]++;
      }
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  // Impacto positivo distribuição
  const impactoPositivoData = useMemo(() => [
    { name: 'Com Impacto Positivo', value: filteredData.filter(d => d.impacto_positivo === 'Sim').length },
    { name: 'Não Informado', value: filteredData.filter(d => !d.impacto_positivo || d.impacto_positivo !== 'Sim').length },
  ], [filteredData]);

  // Surgimento do termo socioambiental - primeira menção por tipo
  const firstMentions = useMemo(() => {
    const sorted = [...filteredData].filter(d => d.ano_inicio).sort((a, b) => a.ano_inicio - b.ano_inicio);
    const first: Record<string, { year: number; name: string }> = {};

    sorted.forEach(d => {
      if (d.tipo_de_impacto && !first[d.tipo_de_impacto]) {
        first[d.tipo_de_impacto] = { year: d.ano_inicio, name: d.iniciativa };
      }
      if (d.impacto_positivo === 'Sim' && !first['impactoPositivo']) {
        first['impactoPositivo'] = { year: d.ano_inicio, name: d.iniciativa };
      }
    });
    return first;
  }, [filteredData]);

  const COLORS = {
    socioambiental: '#059669',
    social: '#2563eb',
    ambiental: '#7c3aed',
    impactoPositivo: '#d97706',
    naoInformado: '#94a3b8',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Socioambiental e Impacto Positivo</h2>
        <p className="text-sm text-slate-500 mt-1">
          Evolução das narrativas e vocabulário do campo ao longo do tempo
        </p>
      </div>

      {/* Primeiras menções */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {firstMentions['Ambiental'] && (
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <Tag size={14} />
                <span className="text-xs font-medium">Primeira iniciativa ambiental</span>
              </div>
              <p className="font-semibold text-emerald-900 text-sm">{firstMentions['Ambiental'].name}</p>
              <p className="text-xs text-emerald-600 mt-1">Ano: {firstMentions['Ambiental'].year}</p>
            </CardContent>
          </Card>
        )}
        {firstMentions['Socioambiental'] && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <BookMarked size={14} />
                <span className="text-xs font-medium">Primeira iniciativa socioambiental</span>
              </div>
              <p className="font-semibold text-blue-900 text-sm">{firstMentions['Socioambiental'].name}</p>
              <p className="text-xs text-blue-600 mt-1">Ano: {firstMentions['Socioambiental'].year}</p>
            </CardContent>
          </Card>
        )}
        {firstMentions['impactoPositivo'] && (
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <MessageSquare size={14} />
                <span className="text-xs font-medium">Primeira com impacto positivo explícito</span>
              </div>
              <p className="font-semibold text-amber-900 text-sm">{firstMentions['impactoPositivo'].name}</p>
              <p className="text-xs text-amber-600 mt-1">Ano: {firstMentions['impactoPositivo'].year}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução dos termos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-600" />
              Evolução do Termo "Socioambiental"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={narrativeByYear}>
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="socioambiental"
                  name="Socioambiental"
                  stroke={COLORS.socioambiental}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="social"
                  name="Social"
                  stroke={COLORS.social}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="ambiental"
                  name="Ambiental"
                  stroke={COLORS.ambiental}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Impacto Positivo ao longo do tempo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag size={16} className="text-amber-600" />
              Surgimento do "Impacto Positivo"
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={narrativeByYear}>
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="impactoPositivo"
                  name="Impacto Positivo"
                  stroke={COLORS.impactoPositivo}
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="naoInformado"
                  name="Não Informado"
                  stroke={COLORS.naoInformado}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Totais por tipo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BookMarked size={16} className="text-blue-600" />
              Distribuição por Tipo de Impacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={impactoTotals}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => [`${val} iniciativas`, '']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {impactoTotals.map((entry) => (
                    <rect
                      key={entry.name}
                      fill={entry.name === 'Socioambiental' ? COLORS.socioambiental :
                            entry.name === 'Social' ? COLORS.social : COLORS.ambiental}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1">
              {impactoTotals.map(t => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{
                        background: t.name === 'Socioambiental' ? COLORS.socioambiental :
                                   t.name === 'Social' ? COLORS.social : COLORS.ambiental,
                      }}
                    />
                    <span className="text-slate-600">{t.name}</span>
                  </div>
                  <span className="font-semibold text-slate-800">{t.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impacto Positivo distribuição */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag size={16} className="text-purple-600" />
              Impacto Positivo Explícito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={impactoPositivoData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(val: number) => [`${val} iniciativas`, '']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {impactoPositivoData.map((entry) => (
                    <rect
                      key={entry.name}
                      fill={entry.name === 'Com Impacto Positivo' ? COLORS.impactoPositivo : COLORS.naoInformado}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 grid grid-cols-2 gap-4">
              {impactoPositivoData.map(d => (
                <div key={d.name} className="text-center">
                  <p className="text-2xl font-bold text-slate-800">{d.value}</p>
                  <p className="text-xs text-slate-500">{d.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise textual */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transição Conceitual</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-3">
          <p>
            A base evidencia uma <strong>transição conceitual clara</strong> ao longo das décadas.
            As iniciativas iniciais (1978–1990) adotavam predominantemente uma abordagem
            <strong> ambientalista</strong>, focada na conservação da natureza e proteção de ecossistemas.
          </p>
          <p>
            A partir dos anos 1990, emerge o termo <strong>"socioambiental"</strong>, refletindo
            uma integração entre as dimensões social e ambiental. Essa narrativa se consolida
            e passa a dominar o campo a partir dos anos 2000.
          </p>
          <p>
            O conceito de <strong>"impacto positivo"</strong> ganha tração mais recentemente,
            especialmente após 2010, com a sistematização de métricas e metodologias de mensuração
            de impacto. Ainda assim, {impactoPositivoData[1]?.value} iniciativas ({Math.round((impactoPositivoData[1]?.value / filteredData.length) * 100)}%)
            não declaram explicitamente o uso dessa lógica, indicando um campo em consolidação.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

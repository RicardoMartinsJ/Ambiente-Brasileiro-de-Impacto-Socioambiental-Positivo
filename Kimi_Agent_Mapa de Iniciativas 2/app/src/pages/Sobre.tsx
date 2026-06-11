import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Building2, FileText, Calendar, BarChart3, Target, Users, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function Sobre() {
  const { stats, data } = useData();

  const periodoData = Object.entries(stats.periodoCounts).map(([key, value]) => ({
    name: key,
    value,
    label: key === '1970-1989' ? 'Ambiental' :
           key === '1990-1999' ? 'Institucionalização' :
           key === '2000-2016' ? 'Consolidação' : 'Difusão',
  }));

  const COLORS = ['#059669', '#10b981', '#34d399', '#6ee7b7'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Sobre a Pesquisa</h2>
        <p className="text-sm text-slate-500 mt-1">
          Dashboard do Ambiente Brasileiro de Impacto Socioambiental Positivo
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <FileText size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalIniciativas}</p>
                <p className="text-xs text-slate-500">Iniciativas mapeadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.totalOrganizacoes}</p>
                <p className="text-xs text-slate-500">Organizações</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calendar size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stats.periodoAnalisado}</p>
                <p className="text-xs text-slate-500">Período analisado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <BookOpen size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{data.filter(d => d.tipo_de_impacto === 'Socioambiental').length}</p>
                <p className="text-xs text-slate-500">Iniciativas socioambientais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Objetivo */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target size={16} className="text-emerald-600" />
              Objetivo da Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>
              Transformar a base de dados de iniciativas de impacto socioambiental positivo em uma
              interface exploratória que permita compreender a evolução e configuração do ambiente
              brasileiro de impacto socioambiental positivo.
            </p>
            <p>
              O dashboard funciona como complemento ao artigo científico, permitindo a navegação
              pelos dados que sustentam as conclusões sobre a evolução do campo e a configuração
              do ambiente de impacto socioambiental positivo no Brasil.
            </p>
          </CardContent>
        </Card>

        {/* Método */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-600" />
              Metodologia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-600">
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Revisão sistemática de literatura cinzenta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Base de dados de iniciativas construída a partir de múltiplas fontes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Análise de {stats.totalIniciativas} iniciativas ao longo de {stats.periodoAnalisado}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Foco na diversidade de atores: projetos, programas, negócios de impacto, instrumentos de fomento e estruturas de apoio</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Distribuição por Período */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-600" />
              Distribuição por Período Histórico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={periodoData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: number) => [`${val} iniciativas`, '']}
                  labelFormatter={(label: string) => {
                    const item = periodoData.find(d => d.name === label);
                    return `${label} (${item?.label})`;
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {periodoData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {periodoData.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded" style={{ background: COLORS[i] }} />
                  <span className="text-slate-600">{p.name}: <strong>{p.value}</strong> ({p.label})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Público */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users size={16} className="text-purple-600" />
              Público-Alvo
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-slate-700 mb-1">Principal</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Pesquisadores', 'Estudantes', 'Grupos de pesquisa', 'Universidades'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-medium text-slate-700 mb-1">Secundário</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Organizações do ecossistema', 'Investidores', 'Formuladores de políticas'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nota */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Nota sobre a base</p>
          <p>
            A base não se restringe a iniciativas que utilizam explicitamente o conceito de impacto positivo.
            O mapeamento foi construído para compreender a evolução histórica do ambiente brasileiro de
            impacto socioambiental positivo, incorporando iniciativas que contribuíram para sua formação
            ao longo do tempo, incluindo iniciativas ambientais, socioambientais, programas de investimento
            social, negócios de impacto e projetos sociais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

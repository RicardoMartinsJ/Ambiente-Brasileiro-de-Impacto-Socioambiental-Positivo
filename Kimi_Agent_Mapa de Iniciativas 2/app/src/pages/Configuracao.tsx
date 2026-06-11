import { useMemo } from 'react';
import { useData } from '@/hooks/useData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts';
import { Network, Layers, Handshake, FolderTree } from 'lucide-react';

const COLORS = ['#059669', '#2563eb', '#7c3aed', '#d97706', '#dc2626', '#0891b2'];

export function Configuracao() {
  const { filteredData } = useData();

  // Cruzamento: Natureza Jurídica x Tipo de Impacto
  const crossNaturezaImpacto = useMemo(() => {
    const naturezas = [...new Set(filteredData.map(d => d.natureza_juridica || 'Não informado'))];
    const tipos = ['Socioambiental', 'Social', 'Ambiental'];
    return naturezas.map(nat => {
      const row: Record<string, string | number> = { name: nat };
      tipos.forEach(tipo => {
        row[tipo] = filteredData.filter(d => (d.natureza_juridica || 'Não informado') === nat && d.tipo_de_impacto === tipo).length;
      });
      return row;
    });
  }, [filteredData]);

  // Cruzamento: Período x Tipo de Organização
  const crossPeriodoNatureza = useMemo(() => {
    const periodos = [
      { key: '1970-1989', min: 1970, max: 1989 },
      { key: '1990-1999', min: 1990, max: 1999 },
      { key: '2000-2016', min: 2000, max: 2016 },
      { key: '2017-2026', min: 2017, max: 2026 },
    ];
    const naturezas = [...new Set(filteredData.map(d => d.natureza_juridica || 'Não informado'))];
    return periodos.map(per => {
      const row: Record<string, string | number> = { name: per.key };
      naturezas.forEach(nat => {
        row[nat] = filteredData.filter(d =>
          d.ano_inicio >= per.min && d.ano_inicio <= per.max &&
          (d.natureza_juridica || 'Não informado') === nat
        ).length;
      });
      return row;
    });
  }, [filteredData]);

  // Cruzamento: Abrangência x Setor (top 4 setores)
  const crossAbrangenciaSetor = useMemo(() => {
    const abrangencias = ['Local', 'Regional', 'Nacional', 'Internacional'];
    const topSetores = [...new Set(filteredData.map(d => d.setor))]
      .filter(Boolean)
      .sort((a, b) =>
        filteredData.filter(d => d.setor === b).length -
        filteredData.filter(d => d.setor === a).length
      )
      .slice(0, 4);
    return abrangencias.map(abr => {
      const row: Record<string, string | number> = { name: abr };
      topSetores.forEach(setor => {
        row[setor] = filteredData.filter(d => d.abrangência_da_atuacão === abr && d.setor === setor).length;
      });
      return row;
    });
  }, [filteredData]);

  // Estatísticas de parcerias
  const parceriasStats = useMemo(() => {
    const comParcerias = filteredData.filter(d => d.parcerias && d.parcerias.length > 2 && d.parcerias !== 'Não informado').length;
    return {
      comParcerias,
      semParcerias: filteredData.length - comParcerias,
      percentual: Math.round((comParcerias / filteredData.length) * 100),
    };
  }, [filteredData]);

  // Contagem de tipos de iniciativa (inferida dos setores)
  const tipoIniciativa = useMemo(() => [
    {
      name: 'Projetos',
      desc: 'Projetos socioambientais, territoriais, de conservação e comunitários',
      count: filteredData.filter(d =>
        d.setor?.includes('Serviços sociais') ||
        d.setor?.includes('Agricultura') ||
        d.setor?.includes('Água')
      ).length,
    },
    {
      name: 'Programas',
      desc: 'Programas corporativos, governamentais e de investimento social',
      count: filteredData.filter(d =>
        d.natureza_juridica?.includes('pública') ||
        d.setor?.includes('financeiras')
      ).length,
    },
    {
      name: 'Negócios de Impacto',
      desc: 'Empreendimentos com geração intencional de impacto',
      count: filteredData.filter(d =>
        d.natureza_juridica?.includes('Impacto') ||
        d.certificacoes?.includes('Empresa B')
      ).length,
    },
    {
      name: 'Instrumentos de Fomento',
      desc: 'Editais, fundos, aceleradoras e incubadoras',
      count: filteredData.filter(d =>
        d.setor?.includes('financeiras') ||
        d.iniciativa?.toLowerCase().includes('fundo') ||
        d.iniciativa?.toLowerCase().includes('edital')
      ).length,
    },
    {
      name: 'Estruturas de Apoio',
      desc: 'Plataformas, certificações, observatórios, redes e coalizões',
      count: filteredData.filter(d =>
        d.iniciativa?.toLowerCase().includes('rede') ||
        d.iniciativa?.toLowerCase().includes('observatório') ||
        d.iniciativa?.toLowerCase().includes('plataforma') ||
        d.certificacoes
      ).length,
    },
  ], [filteredData]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Configuração do Ambiente</h2>
        <p className="text-sm text-slate-500 mt-1">
          Relações entre atores, iniciativas e mecanismos de atuação
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{parceriasStats.comParcerias}</p>
            <p className="text-xs text-slate-500">Com parcerias declaradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{parceriasStats.percentual}%</p>
            <p className="text-xs text-slate-500">Taxa de colaboração</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{new Set(filteredData.map(d => d.setor).filter(Boolean)).size}</p>
            <p className="text-xs text-slate-500">Setores diferentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">{new Set(filteredData.map(d => d.abrangência_da_atuacão).filter(Boolean)).size}</p>
            <p className="text-xs text-slate-500">Níveis de abrangência</p>
          </CardContent>
        </Card>
      </div>

      {/* Tipos de iniciativa */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FolderTree size={16} className="text-emerald-600" />
            Composição por Tipo de Iniciativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {tipoIniciativa.map((tipo, idx) => (
              <div
                key={tipo.name}
                className="p-3 rounded-lg border"
                style={{ borderColor: COLORS[idx % COLORS.length] + '40', background: COLORS[idx % COLORS.length] + '08' }}
              >
                <p className="text-lg font-bold" style={{ color: COLORS[idx % COLORS.length] }}>
                  {tipo.count}
                </p>
                <p className="text-xs font-medium text-slate-700">{tipo.name}</p>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">{tipo.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Cruzamento */}
      <div className="grid grid-cols-1 gap-6">
        {/* Natureza x Tipo de Impacto */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Network size={16} className="text-blue-600" />
              Natureza Jurídica x Tipo de Impacto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crossNaturezaImpacto}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Socioambiental" stackId="a" fill="#059669" />
                <Bar dataKey="Social" stackId="a" fill="#2563eb" />
                <Bar dataKey="Ambiental" stackId="a" fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Período x Natureza */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers size={16} className="text-amber-600" />
              Evolução por Período e Tipo de Organização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crossPeriodoNatureza}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                {crossPeriodoNatureza.length > 0 &&
                  Object.keys(crossPeriodoNatureza[0])
                    .filter(k => k !== 'name')
                    .map((key, idx) => (
                      <Bar key={key} dataKey={key} stackId="a" fill={COLORS[idx % COLORS.length]} />
                    ))
                }
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Abrangência x Setor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Handshake size={16} className="text-purple-600" />
              Abrangência x Setor (Top 4 Setores)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={crossAbrangenciaSetor}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                {crossAbrangenciaSetor.length > 0 &&
                  Object.keys(crossAbrangenciaSetor[0])
                    .filter(k => k !== 'name')
                    .slice(0, 4)
                    .map((key, idx) => (
                      <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />
                    ))
                }
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Análise */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Análise da Configuração</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-3">
          <p>
            O ambiente brasileiro de impacto socioambiental positivo apresenta uma
            <strong> configuração multifacetada</strong>, composta por diferentes tipos de atores
            que atuam de forma articulada em múltiplos setores e escalas geográficas.
          </p>
          <p>
            As <strong>Entidades sem fins lucrativos</strong> e as <strong>Empresas</strong> são
            os dois maiores grupos de atores, cada um representando uma parcela significativa das
            iniciativas mapeadas. A presença de <strong>Negócios de Impacto</strong> como categoria
            distinta evidencia a consolidação desse modelo de atuação no país.
          </p>
          <p>
            A maioria das iniciativas concentra-se em <strong>serviços sociais</strong> e
            <strong> atividades financeiras</strong>, indicando que o campo se estrutura
            significativamente em torno de mecanismos de financiamento e apoio a projetos.
            A dimensão ambiental aparece fortemente nos setores de <strong>água, esgoto e resíduos</strong>,
            bem como em <strong>agricultura e produção florestal</strong>.
          </p>
          <p>
            {parceriasStats.percentual}% das iniciativas declaram parcerias, sugerindo um campo
            fortemente colaborativo, onde a articulação entre diferentes atores é uma
            característica estrutural do ambiente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

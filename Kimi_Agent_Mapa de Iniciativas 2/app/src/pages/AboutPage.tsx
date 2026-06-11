import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowRight, ArrowLeft, BarChart3, BookOpen, Users, Calendar,
  Target, Layers, Lightbulb, FileText, TrendingUp, Sparkles,
} from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
  onEnterDashboard: () => void;
}

function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsInView(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, isInView } = useInView();
  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export function AboutPage({ onBack, onEnterDashboard }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative bg-slate-900 text-white py-20 px-6 overflow-hidden">
        {/* Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="max-w-4xl mx-auto relative">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={16} />
            Voltar à capa
          </button>

          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6">
              <BookOpen size={12} />
              Sobre a Pesquisa
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Como o campo de impacto
              <br />
              <span className="text-emerald-400">socioambiental positivo</span>
              <br />
              evoluiu no Brasil?
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed">
              Esta pesquisa mapeia 346 iniciativas ao longo de quase cinco décadas para compreender
              como diferentes atores, instrumentos e estratégias contribuíram para a formação do
              ambiente brasileiro de impacto socioambiental positivo.
            </p>
          </FadeIn>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">
        {/* Methodology */}
        <section>
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Target size={20} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Metodologia</h2>
            </div>
          </FadeIn>

          <FadeIn delay={100}>
            <p className="text-slate-600 leading-relaxed mb-8">
              A pesquisa adota uma abordagem exploratória e qualitativa, combinando revisão
              sistemática de literatura cinzenta com construção de base de dados. A unidade central
              de análise é a <strong>iniciativa</strong>, permitindo integrar diferentes formas de atuação
              — projetos, programas, negócios de impacto, instrumentos de fomento e estruturas de apoio.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <FileText size={18} />, title: 'Revisão de Literatura', desc: 'Mapeamento sistemático de documentos cinzentos: relatórios, e-books e publicações do ecossistema.' },
              { icon: <BarChart3 size={18} />, title: 'Base de Dados', desc: '346 iniciativas catalogadas com 16 variáveis: organização, setor, natureza jurídica, tipo de impacto e mais.' },
              { icon: <Calendar size={18} />, title: 'Análise Temporal', desc: 'Período de 1978 a 2026, dividido em quatro fases históricas do campo socioambiental brasileiro.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 100}>
                <Card className="h-full border-slate-200 hover:border-emerald-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="p-2 bg-emerald-50 rounded-lg w-fit mb-3 text-emerald-600">
                      {item.icon}
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Key Results */}
        <section>
          <FadeIn>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Sparkles size={20} className="text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Principais Resultados</h2>
            </div>
          </FadeIn>

          {/* KPI Grid */}
          <FadeIn delay={100}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { value: '346', label: 'Iniciativas mapeadas', icon: <BarChart3 size={16} />, color: 'bg-emerald-50 text-emerald-600' },
                { value: '307', label: 'Organizações únicas', icon: <Users size={16} />, color: 'bg-blue-50 text-blue-600' },
                { value: '48', label: 'Anos analisados', icon: <Calendar size={16} />, color: 'bg-amber-50 text-amber-600' },
                { value: '8', label: 'Setores de atuação', icon: <Layers size={16} />, color: 'bg-purple-50 text-purple-600' },
              ].map((kpi, i) => (
                <Card key={i} className="border-slate-200">
                  <CardContent className="p-4 text-center">
                    <div className={`inline-flex p-1.5 rounded-lg ${kpi.color} mb-2`}>
                      {kpi.icon}
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{kpi.value}</p>
                    <p className="text-xs text-slate-500">{kpi.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </FadeIn>

          {/* Findings */}
          <div className="space-y-4">
            {[
              {
                icon: <TrendingUp size={16} />,
                color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                title: 'Crescimento exponencial',
                text: 'O campo cresceu de 11 iniciativas (1970–1989) para 218 (2017–2026), um aumento de quase 20x na última fase.',
              },
              {
                icon: <Layers size={16} />,
                color: 'bg-blue-100 text-blue-700 border-blue-200',
                title: 'Diversidade de atores',
                text: '5 naturezas jurídicas distintas, com equilíbrio entre entidades empresariais (89) e sem fins lucrativos (89).',
              },
              {
                icon: <Lightbulb size={16} />,
                color: 'bg-amber-100 text-amber-700 border-amber-200',
                title: 'Transição conceitual',
                text: 'Evolução clara de abordagens ambientais para socioambientais e, mais recentemente, para a lógica de impacto positivo.',
              },
              {
                icon: <Users size={16} />,
                color: 'bg-purple-100 text-purple-700 border-purple-200',
                title: 'Serviços sociais dominam',
                text: '46% das iniciativas concentram-se em serviços sociais, seguidos por atividades financeiras (19%) e água/resíduos (16%).',
              },
            ].map((finding, i) => (
              <FadeIn key={i} delay={i * 80}>
                <Card className="border-slate-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className={`p-2 rounded-lg border shrink-0 ${finding.color}`}>
                      {finding.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{finding.title}</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{finding.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <FadeIn>
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white p-10 text-center overflow-hidden">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }} />

            <div className="relative">
              <div className="inline-flex p-3 bg-white/10 rounded-full mb-6">
                <BarChart3 size={28} className="text-emerald-400" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Explore os dados interativamente
              </h2>

              <p className="text-white/70 max-w-lg mx-auto mb-8 leading-relaxed">
                Navegue pelo dashboard com 6 visualizações, filtros dinâmicos e um grafo de
                ecossistema com todas as 346 iniciativas e suas conexões.
              </p>

              <Button
                onClick={onEnterDashboard}
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-base font-semibold rounded-full shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
              >
                Explorar o Dashboard
                <ArrowRight size={18} className="ml-2" />
              </Button>

              <p className="text-xs text-white/40 mt-4">
                6 telas · Filtros globais · Grafo interativo · Atualização de dados
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Footer */}
        <div className="text-center pb-8">
          <p className="text-xs text-slate-400">
            Dashboard do Ambiente Brasileiro de Impacto Socioambiental Positivo · Pesquisa acadêmica
          </p>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onContinue: () => void;
}

export function LandingPage({ onContinue }: LandingPageProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/capa-mural.png)' }}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-yellow-400 to-blue-500" />

      {/* Content */}
      <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-1000 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-white/80 tracking-wide">Base de 346 iniciativas · 1978–2026</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Ambiente Brasileiro
          <br />
          <span className="text-emerald-400">de Impacto</span>{' '}
          <span className="text-yellow-300">Socioambiental</span>{' '}
          <span className="text-blue-300">Positivo</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-4 leading-relaxed">
          Uma análise exploratória sobre a evolução e configuração do campo de impacto
          socioambiental positivo no Brasil ao longo de quase cinco décadas.
        </p>

        <p className="text-sm text-white/50 mb-10">
          Pesquisa acadêmica · Mapeamento sistemático · Dashboard interativo
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={onContinue}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-6 text-base font-semibold rounded-full shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
          >
            Conhecer a Pesquisa
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 delay-500 ${loaded ? 'opacity-60' : 'opacity-0'}`}>
        <span className="text-xs text-white/50 uppercase tracking-widest">Scroll</span>
        <ChevronDown size={20} className="text-white/50 animate-bounce" />
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

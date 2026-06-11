import { useState, useCallback } from 'react';
import { DataProvider, useData } from '@/hooks/useData';
import { Layout } from '@/components/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { AboutPage } from '@/pages/AboutPage';
import { Sobre } from '@/pages/Sobre';
import { Evolucao } from '@/pages/Evolucao';
import { Narrativas } from '@/pages/Narrativas';
import { Atores } from '@/pages/Atores';
import { Exploracao } from '@/pages/Exploracao';
import { Configuracao } from '@/pages/Configuracao';
import { MapaEcossistema } from '@/pages/MapaEcossistema';

type AppPhase = 'landing' | 'about' | 'dashboard';

function PageRouter() {
  const { activePage } = useData();

  switch (activePage) {
    case 'sobre': return <Sobre />;
    case 'evolucao': return <Evolucao />;
    case 'narrativas': return <Narrativas />;
    case 'atores': return <Atores />;
    case 'exploracao': return <Exploracao />;
    case 'configuracao': return <Configuracao />;
    case 'mapa': return <MapaEcossistema />;
    default: return <Sobre />;
  }
}

function AppContent() {
  const [phase, setPhase] = useState<AppPhase>('landing');

  const goToAbout = useCallback(() => setPhase('about'), []);
  const goToLanding = useCallback(() => setPhase('landing'), []);
  const goToDashboard = useCallback(() => setPhase('dashboard'), []);

  if (phase === 'landing') {
    return <LandingPage onContinue={goToAbout} />;
  }

  if (phase === 'about') {
    return <AboutPage onBack={goToLanding} onEnterDashboard={goToDashboard} />;
  }

  // Dashboard
  return (
    <Layout>
      <PageRouter />
    </Layout>
  );
}

function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;

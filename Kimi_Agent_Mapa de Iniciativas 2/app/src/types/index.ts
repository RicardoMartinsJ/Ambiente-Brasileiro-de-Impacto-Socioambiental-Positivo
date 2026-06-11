export interface Iniciativa {
  id: number;
  iniciativa: string;
  organizacão: string;
  parcerias: string;
  ano_inicio: number;
  resumo: string;
  setor: string;
  natureza_juridica: string;
  link_principal: string;
  link_de_apoio: string;
  tipo_de_impacto: string;
  descricao_impacto: string;
  abrangência_da_atuacão: string;
  impacto_positivo: string;
  orcamento: string;
  certificacoes: string;
}

export interface Filters {
  periodo: string[];
  naturezaJuridica: string[];
  setor: string[];
  tipoImpacto: string[];
  impactoPositivo: string[];
  abrangencia: string[];
  busca: string;
}

export type PageKey = 'sobre' | 'evolucao' | 'narrativas' | 'atores' | 'exploracao' | 'configuracao' | 'mapa';

export const PERIODOS = [
  { key: '1970-1989', label: '1970–1989 (Ambiental)', min: 1970, max: 1989 },
  { key: '1990-1999', label: '1990–1999 (Institucionalização)', min: 1990, max: 1999 },
  { key: '2000-2016', label: '2000–2016 (Consolidação)', min: 2000, max: 2016 },
  { key: '2017-2026', label: '2017–2026 (Difusão)', min: 2017, max: 2026 },
];

export const NATUREZA_JURIDICA_OPTIONS = [
  'Entidades empresariais',
  'Entidade sem fins lucrativos',
  'Adm. pública',
  'Negócios de Impacto',
  'Não informado',
];

export const SETOR_OPTIONS = [
  'Serviços sociais (Turismo, planejamento urbano, TIC, educação e saúde)',
  'Atividades financeiras (financiamento)',
  'Água, esgoto, resíduos sólidos e descontaminação',
  'Agricultura, pecuária, produção florestal, pesca e aquicultura',
  'Construção',
  'Indústria de transformação',
  'Transporte, armazenagem e correio',
  'Eletricidade e Gás',
];

export const TIPO_IMPACTO_OPTIONS = ['Socioambiental', 'Social', 'Ambiental'];
export const IMPACTO_POSITIVO_OPTIONS = ['Sim', 'Não informado'];
export const ABRANGENCIA_OPTIONS = ['Local', 'Regional', 'Nacional', 'Internacional'];

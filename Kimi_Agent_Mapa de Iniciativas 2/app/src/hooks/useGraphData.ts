import { useMemo } from 'react';
import type { Iniciativa } from '@/types';

export interface GraphNode {
  id: string;
  name: string;
  org: string;
  setor: string;
  natureza: string;
  tipoImpacto: string;
  abrangencia: string;
  ano: number;
  impactoPositivo: string;
  val: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: string;
}

const COLOR_PALETTE = [
  '#059669', '#2563eb', '#7c3aed', '#d97706', '#dc2626',
  '#0891b2', '#65a30d', '#be185d', '#4f46e5', '#ea580c',
  '#0d9488', '#9333ea', '#e11d48', '#15803d', '#0369a1',
  '#a855f7', '#06b6d4', '#84cc16', '#f59e0b', '#f43f5e',
];

// ==================== GLOBAL COLOR MAPS (persistent across renders) ====================
const setorColorMap = new Map<string, string>();
const naturezaColorMap = new Map<string, string>();
const tipoImpactoColorMap = new Map<string, string>();
const abrangenciaColorMap = new Map<string, string>();

function getCategoryColor(value: string, map: Map<string, string>): string {
  if (!value || value === 'Não informado' || value === 'Näo informado' || value === '') return '#94a3b8';
  if (map.has(value)) return map.get(value)!;
  const color = COLOR_PALETTE[map.size % COLOR_PALETTE.length];
  map.set(value, color);
  return color;
}

// ==================== GRAPH DATA GENERATION ====================
export function useGraphData(data: Iniciativa[]) {
  return useMemo(() => {
    const nodes: GraphNode[] = data.map(d => ({
      id: String(d.id),
      name: d.iniciativa || 'Sem nome',
      org: d.organizacão || '',
      setor: d.setor || 'Não informado',
      natureza: d.natureza_juridica || 'Não informado',
      tipoImpacto: d.tipo_de_impacto || 'Não informado',
      abrangencia: d.abrangência_da_atuacão || 'Não informado',
      ano: d.ano_inicio || 0,
      impactoPositivo: d.impacto_positivo || 'Não informado',
      val: 1,
    }));

    const links: GraphLink[] = [];
    const added = new Set<string>();

    const addLink = (s: string, t: string, type: string) => {
      if (s === t) return;
      const key = [s, t].sort().join('|');
      if (!added.has(key)) {
        added.add(key);
        links.push({ source: s, target: t, type });
      }
    };

    // 1. Conexões por mesma organização (strongest connection)
    const orgMap: Record<string, string[]> = {};
    nodes.forEach(n => {
      if (n.org) {
        if (!orgMap[n.org]) orgMap[n.org] = [];
        orgMap[n.org].push(n.id);
      }
    });
    Object.values(orgMap).forEach(ids => {
      if (ids.length > 1) {
        // Limit to max 8 connections per org to avoid super-hubs
        const limitedIds = ids.slice(0, 12);
        for (let i = 0; i < limitedIds.length; i++) {
          for (let j = i + 1; j < limitedIds.length; j++) {
            addLink(limitedIds[i], limitedIds[j], 'mesma-organizacao');
          }
        }
      }
    });

    // 2. Conexões por setor — SAMPLING for large sectors
    const setorMap: Record<string, string[]> = {};
    nodes.forEach(n => {
      if (n.setor && n.setor !== 'Não informado') {
        if (!setorMap[n.setor]) setorMap[n.setor] = [];
        setorMap[n.setor].push(n.id);
      }
    });
    Object.entries(setorMap).forEach(([_setor, ids]) => {
      if (ids.length < 2) return;
      // For large sectors, connect each node to ~2-4 random others in same sector
      const maxConnectionsPerNode = ids.length > 30 ? 2 : ids.length > 15 ? 3 : ids.length;
      ids.forEach((nodeId, idx) => {
        // Connect to next N nodes (circular) for deterministic but sparse connections
        for (let offset = 1; offset <= Math.min(maxConnectionsPerNode, ids.length - 1); offset++) {
          const targetIdx = (idx + offset) % ids.length;
          if (idx < targetIdx) { // avoid duplicates
            addLink(nodeId, ids[targetIdx], 'mesmo-setor');
          }
        }
      });
    });

    // 3. Conexões por parcerias (text matching)
    const orgNames = [...new Set(nodes.map(n => n.org).filter(Boolean))];
    nodes.forEach(sourceNode => {
      const parceriasStr = data.find(d => String(d.id) === sourceNode.id)?.parcerias;
      if (parceriasStr && parceriasStr.length > 3 && parceriasStr !== 'Não informado' && parceriasStr !== 'Näo informado') {
        // Check if parcerias contains any org name (as a separate word/phrase)
        let matchCount = 0;
        for (const orgName of orgNames) {
          if (matchCount >= 3) break; // max 3 parceria links per node
          if (orgName === sourceNode.org) continue;
          if (parceriasStr.toLowerCase().includes(orgName.toLowerCase().substring(0, Math.min(orgName.length, 15)))) {
            const targetNode = nodes.find(n => n.org === orgName);
            if (targetNode) {
              addLink(sourceNode.id, targetNode.id, 'parceria');
              matchCount++;
            }
          }
        }
      }
    });

    // 4. Ensure no isolated nodes — connect orphans to nearest by setor
    const degree: Record<string, number> = {};
    links.forEach(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      degree[s] = (degree[s] || 0) + 1;
      degree[t] = (degree[t] || 0) + 1;
    });

    const orphans = nodes.filter(n => !degree[n.id]);
    orphans.forEach(orphan => {
      // Find closest node by setor
      const sameSetor = nodes.find(n => n.id !== orphan.id && n.setor === orphan.setor && degree[n.id]);
      if (sameSetor) {
        addLink(orphan.id, sameSetor.id, 'mesmo-setor');
      } else {
        // Fallback: connect to any node with same natureza
        const sameNatureza = nodes.find(n => n.id !== orphan.id && n.natureza === orphan.natureza && degree[n.id]);
        if (sameNatureza) {
          addLink(orphan.id, sameNatureza.id, 'mesmo-setor');
        } else {
          // Last resort: connect to first available node
          const any = nodes.find(n => n.id !== orphan.id);
          if (any) addLink(orphan.id, any.id, 'mesmo-setor');
        }
      }
    });

    // Recompute degrees after orphan connections
    const finalDegree: Record<string, number> = {};
    links.forEach(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      finalDegree[s] = (finalDegree[s] || 0) + 1;
      finalDegree[t] = (finalDegree[t] || 0) + 1;
    });
    nodes.forEach(n => {
      n.val = finalDegree[n.id] || 0;
    });

    return { nodes, links };
  }, [data]);
}

// ==================== COLOR BY ====================
export type ColorByOption = 'setor' | 'natureza' | 'tipoImpacto' | 'abrangencia' | 'impactoPositivo' | 'periodo';
export type SizeByOption = 'conexoes' | 'fixo';

export const COLOR_BY_OPTIONS: { key: ColorByOption; label: string }[] = [
  { key: 'setor', label: 'Setor' },
  { key: 'natureza', label: 'Natureza Jurídica' },
  { key: 'tipoImpacto', label: 'Tipo de Impacto' },
  { key: 'abrangencia', label: 'Abrangência' },
  { key: 'impactoPositivo', label: 'Impacto Positivo' },
  { key: 'periodo', label: 'Período' },
];

export const SIZE_BY_OPTIONS: { key: SizeByOption; label: string }[] = [
  { key: 'conexoes', label: 'Número de Conexões' },
  { key: 'fixo', label: 'Tamanho Fixo' },
];

export function getNodeColor(node: GraphNode, colorBy: ColorByOption): string {
  switch (colorBy) {
    case 'setor':
      return getCategoryColor(node.setor, setorColorMap);
    case 'natureza':
      return getCategoryColor(node.natureza, naturezaColorMap);
    case 'tipoImpacto':
      return getCategoryColor(node.tipoImpacto, tipoImpactoColorMap);
    case 'abrangencia':
      return getCategoryColor(node.abrangencia, abrangenciaColorMap);
    case 'impactoPositivo':
      return node.impactoPositivo === 'Sim' ? '#d97706' : '#94a3b8';
    case 'periodo': {
      if (node.ano >= 1970 && node.ano <= 1989) return '#059669';
      if (node.ano >= 1990 && node.ano <= 1999) return '#2563eb';
      if (node.ano >= 2000 && node.ano <= 2016) return '#d97706';
      if (node.ano >= 2017) return '#dc2626';
      return '#94a3b8';
    }
    default:
      return '#059669';
  }
}

// ==================== SIZE BY ====================
export function getNodeSize(node: GraphNode, sizeBy: SizeByOption): number {
  if (sizeBy === 'fixo') return 4;
  // Scale by connections: min 3, max 14
  return Math.max(3, Math.min(node.val * 1.2 + 2, 14));
}

// ==================== LEGEND ====================
export function buildLegend(colorBy: ColorByOption, nodes: GraphNode[]): { label: string; color: string; count: number }[] {
  const counts: Record<string, number> = {};

  nodes.forEach(n => {
    let val = '';
    switch (colorBy) {
      case 'setor': val = n.setor; break;
      case 'natureza': val = n.natureza; break;
      case 'tipoImpacto': val = n.tipoImpacto; break;
      case 'abrangencia': val = n.abrangencia; break;
      case 'impactoPositivo': val = n.impactoPositivo; break;
      case 'periodo':
        if (n.ano >= 1970 && n.ano <= 1989) val = '1970–1989 (Ambiental)';
        else if (n.ano >= 1990 && n.ano <= 1999) val = '1990–1999 (Institucionalização)';
        else if (n.ano >= 2000 && n.ano <= 2016) val = '2000–2016 (Consolidação)';
        else if (n.ano >= 2017) val = '2017–2026 (Difusão)';
        else val = 'Não informado';
        break;
    }
    if (val) {
      counts[val] = (counts[val] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      color: getNodeColor(nodes.find(n => {
        switch (colorBy) {
          case 'setor': return n.setor === label;
          case 'natureza': return n.natureza === label;
          case 'tipoImpacto': return n.tipoImpacto === label;
          case 'abrangencia': return n.abrangencia === label;
          case 'impactoPositivo': return n.impactoPositivo === label;
          case 'periodo': {
            if (label.startsWith('1970')) return n.ano >= 1970 && n.ano <= 1989;
            if (label.startsWith('1990')) return n.ano >= 1990 && n.ano <= 1999;
            if (label.startsWith('2000')) return n.ano >= 2000 && n.ano <= 2016;
            if (label.startsWith('2017')) return n.ano >= 2017;
            return n.ano === 0;
          }
        }
        return false;
      }) || nodes[0], colorBy),
    }))
    .sort((a, b) => b.count - a.count);
}

// ==================== LINK COLORS & LABELS ====================
export const LINK_COLORS: Record<string, string> = {
  'mesma-organizacao': '#059669',
  'mesmo-setor': '#2563eb',
  'parceria': '#d97706',
};

export const LINK_LABELS: Record<string, string> = {
  'mesma-organizacao': 'Mesma Organização',
  'mesmo-setor': 'Mesmo Setor',
  'parceria': 'Parceria',
};

import { useState, useCallback, useRef, useEffect } from 'react';
import { useData } from '@/hooks/useData';
import { useGraphData, getNodeColor, getNodeSize, buildLegend } from '@/hooks/useGraphData';
import type { ColorByOption, SizeByOption, GraphNode } from '@/hooks/useGraphData';
import {
  COLOR_BY_OPTIONS, SIZE_BY_OPTIONS, LINK_COLORS, LINK_LABELS,
} from '@/hooks/useGraphData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Search, X, Maximize2, ZoomOut, Eye, EyeOff,
  Palette, Circle, Info, SlidersHorizontal, Crosshair,
} from 'lucide-react';
import ForceGraph2D from 'react-force-graph-2d';

export function MapaEcossistema() {
  const { filteredData } = useData();
  const { nodes, links } = useGraphData(filteredData);
  const fgRef = useRef<any>(null);

  const [colorBy, setColorBy] = useState<ColorByOption>('setor');
  const [sizeBy, setSizeBy] = useState<SizeByOption>('conexoes');
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [activeLinkTypes, setActiveLinkTypes] = useState<Set<string>>(
    new Set(['mesma-organizacao', 'mesmo-setor', 'parceria'])
  );

  // ---- computed data ----
  const highlightNodes = new Set<string>();
  if (search) {
    const q = search.toLowerCase();
    nodes.forEach(n => {
      if (n.name.toLowerCase().includes(q) || n.org.toLowerCase().includes(q)) {
        highlightNodes.add(n.id);
      }
    });
  }

  const filteredLinks = links.filter(l => activeLinkTypes.has(l.type));

  // Neighbors
  const neighborNodes = new Set<string>();
  const focusId = selectedNode?.id || hoveredNode;
  if (focusId) {
    filteredLinks.forEach(l => {
      const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
      const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
      if (s === focusId) neighborNodes.add(t);
      if (t === focusId) neighborNodes.add(s);
    });
    neighborNodes.add(focusId);
  }

  // ---- stats ----
  const nodeDegrees: Record<string, number> = {};
  filteredLinks.forEach(l => {
    const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
    const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
    nodeDegrees[s] = (nodeDegrees[s] || 0) + 1;
    nodeDegrees[t] = (nodeDegrees[t] || 0) + 1;
  });
  const stats = {
    nodes: nodes.length,
    links: filteredLinks.length,
    orgs: new Set(nodes.map(n => n.org).filter(Boolean)).size,
    avgDegree: nodes.length > 0 ? (filteredLinks.length * 2 / nodes.length).toFixed(1) : '0',
    maxDegree: Math.max(...Object.values(nodeDegrees), 0),
    isolated: nodes.filter(n => !nodeDegrees[n.id]).length,
  };

  // ---- legend ----
  const legend = buildLegend(colorBy, nodes);

  // ---- canvas painting ----
  const paintRing = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const gNode = node as GraphNode;
    const color = getNodeColor(gNode, colorBy);
    const size = getNodeSize(gNode, sizeBy);
    const isHighlighted = search && highlightNodes.has(gNode.id);
    const isFocus = focusId === gNode.id;
    const hasFocus = !!focusId;
    const isNeighbor = hasFocus && neighborNodes.has(gNode.id);
    const isDimmed = hasFocus && !isNeighbor;
    const isIsolated = !nodeDegrees[gNode.id];

    // Glow effect for focus
    if (isFocus) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 8, 0, 2 * Math.PI);
      const grad = ctx.createRadialGradient(node.x, node.y, size, node.x, node.y, size + 8);
      grad.addColorStop(0, color + '40');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fill();
    }

    // Main circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
    ctx.fillStyle = isDimmed ? color + '18' : (isIsolated ? color + '70' : color);
    ctx.fill();

    // Subtle inner highlight
    if (!isDimmed) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 0.6, 0, 2 * Math.PI);
      ctx.fillStyle = color + '30';
      ctx.fill();
    }

    // Border for focus
    if (isFocus) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 2.5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Highlight ring from search
    if (isHighlighted && !focusId) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 5, 0, 2 * Math.PI);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Dashed border for isolated nodes
    if (isIsolated && !isDimmed) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size + 1.5, 0, 2 * Math.PI);
      ctx.strokeStyle = color + '50';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Label (show if labels on OR focused OR zoomed in enough)
    const showLabel = (showLabels || isFocus) && !isDimmed;
    if (showLabel || (globalScale > 1.8 && !isDimmed)) {
      const fontSize = isFocus ? 11 : Math.min(10, Math.max(7, globalScale * 3));
      ctx.font = `${isFocus ? 'bold' : '500'} ${fontSize}px sans-serif`;
      ctx.fillStyle = isFocus ? '#0f172a' : (isDimmed ? '#94a3b8' : '#334155');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      const label = gNode.name.length > 30 ? gNode.name.slice(0, 27) + '...' : gNode.name;

      // Text background
      const textWidth = ctx.measureText(label).width;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.roundRect(
        node.x - textWidth / 2 - 3,
        node.y - size - fontSize - 5,
        textWidth + 6,
        fontSize + 4,
        3
      );
      ctx.fill();

      ctx.fillStyle = isFocus ? '#0f172a' : (isDimmed ? '#94a3b8' : '#334155');
      ctx.fillText(label, node.x, node.y - size - 4);
    }
  }, [colorBy, sizeBy, search, showLabels, focusId, highlightNodes, neighborNodes, nodeDegrees]);

  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const s = link.source;
    const t = link.target;
    if (s.x == null || t.x == null) return;

    const sId = typeof link.source === 'string' ? link.source : (link.source as GraphNode).id;
    const tId = typeof link.target === 'string' ? link.target : (link.target as GraphNode).id;
    const isRelevant = !focusId || neighborNodes.has(sId) && neighborNodes.has(tId);
    const isDimmed = focusId && !isRelevant;
    const color = LINK_COLORS[link.type] || '#94a3b8';

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.strokeStyle = isDimmed ? color + '08' : color + '35';
    ctx.lineWidth = isDimmed ? 0.2 : 0.8;
    ctx.stroke();
  }, [focusId, neighborNodes]);

  // ---- zoom controls ----
  const handleZoomFit = () => fgRef.current?.zoomToFit(500, 60);
  const handleZoomOut2 = () => fgRef.current?.zoom(0.6, 400);

  // ---- link toggle ----
  const toggleLinkType = (type: string) => {
    setActiveLinkTypes(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  // ---- hover tracking (uses mouse position, not graph coords) ----
  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node ? (node as GraphNode).id : null);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    mousePosRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // ---- initial zoom ----
  useEffect(() => {
    if (fgRef.current && nodes.length > 0) {
      const t = setTimeout(() => fgRef.current?.zoomToFit(600, 60), 1000);
      return () => clearTimeout(t);
    }
  }, [nodes.length]);

  // ---- connected nodes for detail ----
  const connectedNodes = selectedNode
    ? filteredLinks
        .filter(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          return s === selectedNode.id || t === selectedNode.id;
        })
        .map(l => {
          const s = typeof l.source === 'string' ? l.source : (l.source as GraphNode).id;
          const t = typeof l.target === 'string' ? l.target : (l.target as GraphNode).id;
          const otherId = s === selectedNode.id ? t : s;
          const other = nodes.find(n => n.id === otherId);
          return other ? { node: other, type: l.type } : null;
        })
        .filter(Boolean) as { node: GraphNode; type: string }[]
    : [];

  // ---- hovered node data ----
  const hoveredNodeData = hoveredNode ? nodes.find(n => n.id === hoveredNode) : null;

  return (
    <div className="flex h-full -m-6">
      {/* === MAIN GRAPH === */}
      <div className="flex-1 relative" onMouseMove={handleMouseMove}>
        {/* Toolbar */}
        <div className="absolute top-3 left-3 right-20 z-10 flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Buscar iniciativa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-7 h-8 text-xs w-48 bg-white/95 backdrop-blur shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Color By */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur rounded-md px-2 py-1 shadow-sm">
            <Palette size={12} className="text-slate-400" />
            <Select value={colorBy} onValueChange={(v) => setColorBy(v as ColorByOption)}>
              <SelectTrigger className="h-7 text-xs border-0 w-32 bg-transparent px-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLOR_BY_OPTIONS.map(o => (
                  <SelectItem key={o.key} value={o.key} className="text-xs">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Size By */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur rounded-md px-2 py-1 shadow-sm">
            <SlidersHorizontal size={12} className="text-slate-400" />
            <Select value={sizeBy} onValueChange={(v) => setSizeBy(v as SizeByOption)}>
              <SelectTrigger className="h-7 text-xs border-0 w-28 bg-transparent px-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_BY_OPTIONS.map(o => (
                  <SelectItem key={o.key} value={o.key} className="text-xs">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Labels Toggle */}
          <Button
            variant={showLabels ? 'default' : 'outline'}
            size="sm"
            className="h-8 text-xs bg-white/95 shadow-sm"
            onClick={() => setShowLabels(!showLabels)}
          >
            {showLabels ? <Eye size={13} className="mr-1" /> : <EyeOff size={13} className="mr-1" />}
            Labels
          </Button>

          {/* Zoom */}
          <div className="flex items-center bg-white/95 backdrop-blur rounded-md overflow-hidden shadow-sm">
            <button onClick={handleZoomFit} className="p-1.5 hover:bg-slate-100 text-slate-500" title="Ajustar à tela">
              <Maximize2 size={14} />
            </button>
            <button onClick={handleZoomOut2} className="p-1.5 hover:bg-slate-100 text-slate-500" title="Reduzir zoom">
              <ZoomOut size={14} />
            </button>
          </div>
        </div>

        {/* Force Graph */}
        {nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={{ nodes, links: filteredLinks }}
            nodeCanvasObject={paintRing}
            linkCanvasObject={paintLink}
            linkWidth={0.6}
            nodeRelSize={1}
            onNodeClick={(_: any, node: any) => setSelectedNode(node as GraphNode)}
            onNodeHover={handleNodeHover}
            onBackgroundClick={() => { setSelectedNode(null); setHoveredNode(null); }}
            enableZoomInteraction={true}
            enableNodeDrag={true}
            enablePanInteraction={true}
            // Physics: spread out more
            warmupTicks={40}
            cooldownTicks={60}
            d3AlphaDecay={0.015}
            d3VelocityDecay={0.3}
            backgroundColor="#f8fafc"
          />
        )}

        {/* === HOVER TOOLTIP (follows mouse) === */}
        {hoveredNodeData && !selectedNode && (
          <div
            className="absolute z-30 pointer-events-none transition-none"
            style={{
              left: Math.min(mousePosRef.current.x + 14, (fgRef.current?.width || 800) - 240),
              top: Math.max(mousePosRef.current.y - 10, 10),
            }}
          >
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 px-3 py-2 max-w-[230px]">
              <p className="text-xs font-semibold text-slate-800 truncate">{hoveredNodeData.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{hoveredNodeData.org}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{hoveredNodeData.ano || '?'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: getNodeColor(hoveredNodeData, colorBy) + '20', color: getNodeColor(hoveredNodeData, colorBy) }}>
                  {nodeDegrees[hoveredNodeData.id] || 0} conexões
                </span>
              </div>
            </div>
          </div>
        )}

        {/* === LEGEND (bottom left) === */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-lg shadow-md p-3 max-h-64 overflow-y-auto z-10 min-w-[170px]">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-2 flex items-center gap-1">
            <Circle size={9} />
            {COLOR_BY_OPTIONS.find(o => o.key === colorBy)?.label}
            <span className="text-slate-400 normal-case ml-auto">({legend.length})</span>
          </p>
          <div className="space-y-1">
            {legend.map(item => (
              <div key={item.label} className="flex items-center gap-2 group" title={`${item.label}: ${item.count} iniciativas`}>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-[10px] text-slate-600 truncate flex-1">{item.label}</span>
                <span className="text-[9px] text-slate-400 tabular-nums">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* === LINK FILTER (bottom right) === */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur rounded-lg shadow-md p-3 z-10">
          <p className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Conexões</p>
          {Object.entries(LINK_LABELS).map(([type, label]) => (
            <button
              key={type}
              onClick={() => toggleLinkType(type)}
              className={`flex items-center gap-1.5 w-full py-0.5 text-[10px] transition-colors ${
                activeLinkTypes.has(type) ? 'text-slate-700' : 'text-slate-400 line-through'
              }`}
            >
              <div className="w-3 h-0.5 rounded-full" style={{ background: activeLinkTypes.has(type) ? LINK_COLORS[type] : '#cbd5e1' }} />
              {label}
            </button>
          ))}
        </div>

        {/* === STATS (top right) === */}
        <div className="absolute top-3 right-3 flex gap-3 bg-white/95 backdrop-blur rounded-md px-3 py-1.5 shadow-sm z-10">
          {[
            { v: stats.nodes, l: 'Nós' },
            { v: stats.links, l: 'Links' },
            { v: stats.avgDegree, l: 'Grau' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-xs font-bold text-slate-800 tabular-nums">{s.v}</p>
              <p className="text-[9px] text-slate-500">{s.l}</p>
            </div>
          ))}
        </div>

        {/* Search results indicator */}
        {search && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-[10px] text-amber-700 z-10">
            {highlightNodes.size} resultado{highlightNodes.size !== 1 ? 's' : ''} encontrado{highlightNodes.size !== 1 ? 's' : ''}
            {highlightNodes.size === 0 && ' — tente outro termo'}
          </div>
        )}
      </div>

      {/* === DETAIL PANEL === */}
      {selectedNode && (
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto flex flex-col shrink-0 z-20">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-start justify-between z-10">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: getNodeColor(selectedNode, colorBy) }}
                />
                <h3 className="font-semibold text-sm text-slate-800 leading-tight">{selectedNode.name}</h3>
              </div>
              <p className="text-xs text-slate-500">{selectedNode.org}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-slate-600 shrink-0 p-0.5 rounded hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Ano', value: selectedNode.ano || '—' },
                { label: 'Conexões', value: nodeDegrees[selectedNode.id] || 0 },
                { label: 'Grau', value: stats.maxDegree ? ((nodeDegrees[selectedNode.id] || 0) / stats.maxDegree * 100).toFixed(0) + '%' : '—' },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                  <p className="text-sm font-bold text-slate-800">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Attributes */}
            <div className="space-y-2.5">
              {[
                { label: 'Natureza Jurídica', value: selectedNode.natureza, badge: true },
                { label: 'Setor', value: selectedNode.setor },
                { label: 'Abrangência', value: selectedNode.abrangencia },
                { label: 'Impacto Positivo', value: selectedNode.impactoPositivo },
              ].map(attr => (
                <div key={attr.label}>
                  <p className="text-[10px] text-slate-500 mb-0.5">{attr.label}</p>
                  {attr.badge ? (
                    <Badge variant="outline" className="text-[11px]">{attr.value || '—'}</Badge>
                  ) : (
                    <p className="text-xs text-slate-700">{attr.value || '—'}</p>
                  )}
                </div>
              ))}

              <div>
                <p className="text-[10px] text-slate-500 mb-0.5">Tipo de Impacto</p>
                <Badge className={
                  selectedNode.tipoImpacto === 'Socioambiental' ? 'bg-emerald-100 text-emerald-700 border-emerald-300 text-[11px]' :
                  selectedNode.tipoImpacto === 'Social' ? 'bg-blue-100 text-blue-700 border-blue-300 text-[11px]' :
                  'bg-purple-100 text-purple-700 border-purple-300 text-[11px]'
                }>
                  {selectedNode.tipoImpacto}
                </Badge>
              </div>
            </div>

            {/* Color context */}
            <div
              className="rounded-lg p-2.5 flex items-center gap-2.5"
              style={{ background: getNodeColor(selectedNode, colorBy) + '12' }}
            >
              <div className="w-5 h-5 rounded-full shrink-0 shadow-sm" style={{ background: getNodeColor(selectedNode, colorBy) }} />
              <div>
                <p className="text-[10px] text-slate-500">
                  {COLOR_BY_OPTIONS.find(o => o.key === colorBy)?.label}
                </p>
                <p className="text-xs font-medium text-slate-700">
                  {colorBy === 'periodo'
                    ? (selectedNode.ano >= 1970 && selectedNode.ano <= 1989 ? '1970–1989' :
                       selectedNode.ano >= 1990 && selectedNode.ano <= 1999 ? '1990–1999' :
                       selectedNode.ano >= 2000 && selectedNode.ano <= 2016 ? '2000–2016' :
                       selectedNode.ano >= 2017 ? '2017–2026' : 'Não informado')
                    : selectedNode[colorBy === 'setor' ? 'setor' : colorBy === 'natureza' ? 'natureza' : colorBy === 'tipoImpacto' ? 'tipoImpacto' : colorBy === 'abrangencia' ? 'abrangencia' : 'impactoPositivo']
                  }
                </p>
              </div>
            </div>

            {/* Connected nodes */}
            {connectedNodes.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase">
                    Conectada com
                  </p>
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{connectedNodes.length}</span>
                </div>
                <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                  {connectedNodes.map(({ node, type }, idx) => (
                    <button
                      key={`${node.id}-${idx}`}
                      onClick={() => setSelectedNode(node)}
                      className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors flex items-start gap-2 group"
                    >
                      <div className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0" style={{ background: LINK_COLORS[type] || '#94a3b8' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-700 truncate group-hover:text-emerald-700">{node.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{node.org}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] text-slate-400">{LINK_LABELS[type]}</span>
                          <span className="text-[9px] text-slate-300">·</span>
                          <span className="text-[9px] text-slate-400">{node.ano || '?'}</span>
                        </div>
                      </div>
                      <Crosshair size={10} className="text-slate-300 opacity-0 group-hover:opacity-100 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Help tip */}
            <div className="bg-slate-50 rounded-lg p-2.5 flex items-start gap-2">
              <Info size={12} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Clique em qualquer nó conectado para navegar. Use scroll para zoom, arraste para mover, clique no fundo para desselecionar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

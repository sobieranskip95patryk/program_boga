'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA HYPER INTERFACE – GRAPH VISUALIZATION COMPONENT
 * GOK:AI Protocol: Interactive knowledge graph with Anti-D filtering
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { DataSet } from 'vis-data/esnext/esm/vis-data';

// Domain color mapping (GOK:AI standard)
const DOMAIN_COLORS = {
  KAR: '#00D9FF',   // Cyan - Kwantowa Architektura Rzeczywistości
  MEHS: '#FF00FF',  // Magenta - Meta-Etyka Hiperskalarna
  NCSS: '#00FF88',  // Green - Noosfera Cyberprzestrzeni
  EAEO: '#FFD700',  // Gold - Ekonomia Anti-Entropiczna
  BSIT: '#FF6B35'   // Orange - Inżynieria Trajektorii Bio-Synchronicznej
};

export default function GraphVisualization({ nodes, edges, onNodeSelect }) {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [stats, setStats] = useState({
    totalNodes: 0,
    totalEdges: 0,
    averageCoherence: 0
  });

  useEffect(() => {
    if (!containerRef.current || !nodes || nodes.length === 0) return;

    // Transform data for vis.js
    const visNodes = new DataSet(
      nodes.map(node => ({
        id: node.id,
        label: node.label,
        title: `${node.label}\n\nDomena: ${node.domenaPierwotna}\nKoherencja: ${node.koherencja}\n\n${node.definicja}`,
        color: {
          background: DOMAIN_COLORS[node.domenaPierwotna] || '#999',
          border: node.statusAntiD ? '#00FF00' : '#FF0000',
          highlight: {
            background: DOMAIN_COLORS[node.domenaPierwotna] || '#999',
            border: '#FFFFFF'
          }
        },
        size: 20 + (node.koherencja * 30),
        font: {
          color: '#FFFFFF',
          size: 14,
          face: 'monospace'
        },
        borderWidth: node.statusTrajektorii === 'ROOT' ? 5 : 2,
        shape: node.statusTrajektorii === 'ROOT' ? 'star' : 'dot',
        // Store full node data
        nodeData: node
      }))
    );

    const visEdges = new DataSet(
      (edges || []).map(edge => ({
        from: edge.from,
        to: edge.to,
        label: edge.typ,
        arrows: {
          to: {
            enabled: true,
            type: 'arrow'
          }
        },
        color: {
          color: getEdgeColor(edge.typ),
          highlight: '#FFFFFF'
        },
        width: edge.waga || 1,
        font: {
          color: '#CCCCCC',
          size: 10,
          strokeWidth: 0
        },
        smooth: {
          type: 'curvedCW',
          roundness: 0.2
        }
      }))
    );

    // Network options (futuristic/monumental style)
    const options = {
      nodes: {
        shadow: {
          enabled: true,
          color: 'rgba(0,217,255,0.5)',
          size: 10,
          x: 0,
          y: 0
        }
      },
      edges: {
        shadow: {
          enabled: true,
          color: 'rgba(255,255,255,0.3)',
          size: 5,
          x: 0,
          y: 0
        }
      },
      physics: {
        enabled: true,
        solver: 'forceAtlas2Based',
        forceAtlas2Based: {
          gravitationalConstant: -50,
          centralGravity: 0.01,
          springLength: 200,
          springConstant: 0.08,
          damping: 0.4,
          avoidOverlap: 0.5
        },
        stabilization: {
          iterations: 150,
          updateInterval: 25
        }
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
        navigationButtons: true,
        keyboard: {
          enabled: true
        }
      },
      layout: {
        improvedLayout: true,
        hierarchical: false
      }
    };

    // Create network
    const network = new Network(
      containerRef.current,
      { nodes: visNodes, edges: visEdges },
      options
    );

    networkRef.current = network;

    // Event handlers
    network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = visNodes.get(nodeId);
        if (onNodeSelect) {
          onNodeSelect(node.nodeData?.id || nodeId);
        }
      } else {
        if (onNodeSelect) {
          onNodeSelect(null);
        }
      }
    });

    network.on('doubleClick', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        network.focus(nodeId, {
          scale: 2,
          animation: {
            duration: 500,
            easingFunction: 'easeInOutQuad'
          }
        });
      }
    });

    // Calculate stats
    const totalNodes = nodes.length;
    const totalEdges = edges?.length || 0;
    const averageCoherence = nodes.reduce((sum, n) => sum + n.koherencja, 0) / totalNodes;
    
    setStats({
      totalNodes,
      totalEdges,
      averageCoherence: averageCoherence.toFixed(2)
    });

    // Cleanup
    return () => {
      if (networkRef.current) {
        networkRef.current.destroy();
      }
    };
  }, [nodes, edges, onNodeSelect]);

  return (
    <div className="relative w-full h-full">
      {/* Graph container */}
      <div
        ref={containerRef}
        className="w-full h-full bg-black"
        style={{ minHeight: '600px' }}
      />
      
      {/* Stats overlay */}
      <div className="absolute top-4 right-4 glass-panel neon-border border-cyan-500/40 p-4 rounded-lg font-mono text-sm">
        <div className="text-cyan-400 font-bold mb-2">SYSTEM STATUS</div>
        <div className="space-y-1 text-white">
          <div>Nodes: <span className="text-cyan-400">{stats.totalNodes}</span></div>
          <div>Edges: <span className="text-cyan-400">{stats.totalEdges}</span></div>
          <div>Avg Coherence: <span className="text-cyan-400">{stats.averageCoherence}</span></div>
          <div className="mt-2 pt-2 border-t border-cyan-500">
            <div className="text-xs text-gray-400">GOK:AI P=1.0</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 glass-panel neon-border border-cyan-500/40 p-4 rounded-lg font-mono text-xs">
        <div className="text-cyan-400 font-bold mb-2">DOMAINS</div>
        <div className="space-y-1">
          {Object.entries(DOMAIN_COLORS).map(([domain, color]) => (
            <div key={domain} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-white">{domain}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// Helper function for edge colors
function getEdgeColor(typ) {
  const colors = {
    KONSTYTUUJE: '#00FF88',
    MANIFESTUJE: '#00D9FF',
    WZMACNIA: '#FFD700',
    ANTAGONIZUJE: '#FF0000',
    MAPUJE_NA: '#FF00FF',
    WARUNKUJE: '#FF6B35'
  };
  return colors[typ] || '#FFFFFF';
}

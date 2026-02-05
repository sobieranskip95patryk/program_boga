'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA HYPER INTERFACE – MAIN PAGE
 * GOK:AI Protocol: Knowledge graph explorer with Apollo Client
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, useLazyQuery, useMutation, gql } from '@apollo/client';
import GraphVisualization from '../components/GraphVisualization';
import RelationshipPanel from '../components/RelationshipPanel';
import CoherenceEditor from '../components/CoherenceEditor';
import RelationFilter, { ALL_RELATION_TYPES } from '../components/RelationFilter';
import AuditTrailPanel from '../components/AuditTrailPanel';

// Apollo Client setup
const client = new ApolloClient({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URI || 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
});

// GraphQL queries
const GET_ALL_CONCEPTS = gql`
  query GetAllConcepts {
    getAllConcepts {
      id
      label
      domenaPierwotna
      definicja
      aksjomatPodstawowy
      koherencja
      statusAntiD
      statusTrajektorii
      zrodloAksjomatyczne
      wektorHiperGestosci
      relacje {
        typ
        cel {
          id
        }
        waga
      }
    }
  }
`;

const VALIDATE_ANTI_D = gql`
  query ValidateAntiD {
    validateAntiD {
      totalNodes
      validNodes
      invalidNodes
      averageCoherence
      pathReachability
      isolatedNodes {
        id
        label
      }
    }
  }
`;

const GET_CONCEPT_BY_ID = gql`
  query GetConceptById($id: ID!) {
    getConceptById(id: $id) {
      id
      label
      domenaPierwotna
      definicja
      aksjomatPodstawowy
      koherencja
      statusAntiD
      statusTrajektorii
      zrodloAksjomatyczne
      wektorHiperGestosci
    }
  }
`;

const GET_NODE_RELATIONSHIPS = gql`
  query GetNodeRelationships($id: ID!) {
    getNodeRelationships(id: $id) {
      nodeId
      outgoing {
        typ
        waga
        source { id label domenaPierwotna }
        target { id label domenaPierwotna }
      }
      incoming {
        typ
        waga
        source { id label domenaPierwotna }
        target { id label domenaPierwotna }
      }
    }
  }
`;

const UPDATE_COHERENCE = gql`
  mutation UpdateCoherence($id: ID!, $koherencja: Float!) {
    updateCoherence(id: $id, koherencja: $koherencja) {
      id
      koherencja
      statusAntiD
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateStatus($id: ID!, $statusTrajektorii: StatusTrajektorii!) {
    updateStatus(id: $id, statusTrajektorii: $statusTrajektorii) {
      id
      statusTrajektorii
    }
  }
`;

const GET_AUDIT_EVENTS = gql`
  query GetAuditEvents($limit: Int = 20, $konceptId: ID) {
    getAuditEvents(limit: $limit, konceptId: $konceptId) {
      id
      timestamp
      action
      entityType
      entityId
      actor
      details
    }
  }
`;

function KnowledgeGraphExplorer() {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDomain, setFilterDomain] = useState('ALL');
  const [activeRelationFilters, setActiveRelationFilters] = useState(ALL_RELATION_TYPES);
  
  const { loading, error, data, refetch } = useQuery(GET_ALL_CONCEPTS, {
    pollInterval: 30000 // Refresh every 30 seconds
  });
  
  const { data: validationData } = useQuery(VALIDATE_ANTI_D, {
    pollInterval: 60000 // Refresh every minute
  });

  const [fetchConceptById, { data: selectedData, loading: selectedLoading, error: selectedError }] =
    useLazyQuery(GET_CONCEPT_BY_ID, { fetchPolicy: 'network-only' });

  const [fetchRelationships, { data: relData, loading: relLoading, error: relError }] =
    useLazyQuery(GET_NODE_RELATIONSHIPS, { fetchPolicy: 'network-only' });

  const [fetchAuditEvents, { data: auditData, loading: auditLoading, error: auditError }] =
    useLazyQuery(GET_AUDIT_EVENTS, { fetchPolicy: 'network-only' });

  const [updateCoherence, { loading: coherenceUpdating, data: coherenceResult }] =
    useMutation(UPDATE_COHERENCE, {
      onCompleted: () => {
        refetch();
        if (selectedNodeId) fetchConceptById({ variables: { id: selectedNodeId } });
        if (selectedNodeId) fetchAuditEvents({ variables: { konceptId: selectedNodeId, limit: 20 } });
      }
    });

  const [updateStatus, { loading: statusUpdating, data: statusResult }] =
    useMutation(UPDATE_STATUS, {
      onCompleted: () => {
        refetch();
        if (selectedNodeId) fetchConceptById({ variables: { id: selectedNodeId } });
        if (selectedNodeId) fetchAuditEvents({ variables: { konceptId: selectedNodeId, limit: 20 } });
      }
    });

  const handleUpdateCoherence = (id, value) => {
    updateCoherence({ variables: { id, koherencja: value } });
  };

  const handleUpdateStatus = (id, value) => {
    updateStatus({ variables: { id, statusTrajektorii: value } });
  };

  const handleNavigateToNode = (nodeId) => {
    setSelectedNodeId(nodeId);
    fetchConceptById({ variables: { id: nodeId } });
    fetchRelationships({ variables: { id: nodeId } });
    fetchAuditEvents({ variables: { konceptId: nodeId, limit: 20 } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <div className="text-cyan-400 text-6xl mb-4 animate-pulse">⟳</div>
          <div className="text-white font-mono">Loading knowledge graph...</div>
          <div className="text-gray-400 text-sm mt-2">GOK:AI Protocol P=1.0</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="bg-red-900/20 border border-red-500 p-8 rounded-lg max-w-2xl">
          <div className="text-red-400 text-2xl font-bold mb-4">⚠ CONNECTION ERROR</div>
          <div className="text-white font-mono mb-4">Failed to connect to GraphQL API</div>
          <pre className="bg-black/50 p-4 rounded text-red-300 text-sm overflow-auto">
            {error.message}
          </pre>
          <div className="mt-4 text-gray-400 text-sm">
            <div className="mb-2">💡 SOLUTION:</div>
            <div>1. Start Neo4j database</div>
            <div>2. Run GraphQL API: <code className="bg-black/50 px-2 py-1 rounded">cd MTA_GRAPHQL_API && npm run dev</code></div>
            <div>3. Verify connection at: <a href="http://localhost:4000" className="text-cyan-400 underline">http://localhost:4000</a></div>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for visualization
  const nodes = data?.getAllConcepts || [];
  const allEdges = nodes.flatMap(node =>
    (node.relacje || []).map(rel => ({
      from: node.id,
      to: rel.cel.id,
      typ: rel.typ,
      waga: rel.waga
    }))
  );

  // Filter edges by relation type
  const edges = allEdges.filter(e => activeRelationFilters.includes(e.typ));

  // Filter nodes
  let filteredNodes = nodes;
  if (searchQuery) {
    filteredNodes = nodes.filter(
      n =>
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.definicja.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (filterDomain !== 'ALL') {
    filteredNodes = filteredNodes.filter(n => n.domenaPierwotna === filterDomain);
  }

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden">
      <div className="absolute inset-0 mta-bg pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Header */}
      <header className="glass-panel neon-border border-cyan-500/40 p-4 mx-4 mt-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400 font-mono title-glow">MTAQuestWebsideX</h1>
            <div className="text-xs text-gray-400 tracking-widest">GOK:AI Protocol P=1.0 – Hyper-Interface</div>
          </div>
          
          {validationData && (
            <div className="glass-panel border-cyan-500/40 p-3 rounded-lg font-mono text-sm">
              <div className="flex gap-6">
                <div>
                  <span className="text-gray-400">Nodes:</span>{' '}
                  <span className="text-cyan-400">{validationData.validateAntiD.totalNodes}</span>
                </div>
                <div>
                  <span className="text-gray-400">Valid:</span>{' '}
                  <span className="text-green-400">{validationData.validateAntiD.validNodes}</span>
                </div>
                <div>
                  <span className="text-gray-400">Coherence:</span>{' '}
                  <span className="text-cyan-400">{validationData.validateAntiD.averageCoherence.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Reachability:</span>{' '}
                  <span className="text-cyan-400">{(validationData.validateAntiD.pathReachability * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Controls */}
      <div className="glass-panel neon-border p-4 space-y-3 mx-4 mt-4 rounded-xl">
        <div className="flex gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            placeholder="Search concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-black/70 border border-cyan-500/50 px-4 py-2 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-300"
          />
          
          {/* Domain filter */}
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="bg-black/70 border border-cyan-500/50 px-4 py-2 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-300"
          >
            <option value="ALL">All Domains</option>
            <option value="KAR">KAR</option>
            <option value="MEHS">MEHS</option>
            <option value="NCSS">NCSS</option>
            <option value="EAEO">EAEO</option>
            <option value="BSIT">BSIT</option>
          </select>
          
          {/* Refresh */}
          <button
            onClick={() => refetch()}
            className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-mono font-bold transition-colors shadow-[0_0_12px_rgba(0,217,255,0.35)]"
          >
            ⟳ Refresh
          </button>
        </div>

        {/* Relation type filter */}
        <RelationFilter
          activeFilters={activeRelationFilters}
          onFilterChange={setActiveRelationFilters}
        />
      </div>

      {/* Graph visualization */}
      <div className="flex-1 relative p-4">
        <div className="w-full h-full rounded-2xl overflow-hidden glass-panel neon-border">
          <GraphVisualization
            nodes={filteredNodes}
            edges={edges}
            onNodeSelect={(nodeId) => {
              setSelectedNodeId(nodeId);
              if (nodeId) {
                fetchConceptById({ variables: { id: nodeId } });
                fetchRelationships({ variables: { id: nodeId } });
                fetchAuditEvents({ variables: { konceptId: nodeId, limit: 20 } });
              }
            }}
          />
        </div>

        {/* ═══ Node Detail Sidebar ═══ */}
        {selectedNodeId && (
          <div className="absolute top-4 right-4 bottom-4 w-[380px] glass-panel neon-border border-cyan-500/40 font-mono overflow-y-auto rounded-xl">
            {/* Sidebar header */}
            <div className="sticky top-0 bg-black/70 border-b border-cyan-500/50 p-4 z-10 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="text-cyan-400 text-[10px] uppercase tracking-wider mb-1">Szczegóły węzła</div>
                  <div className="text-white text-base font-bold truncate">
                    {selectedData?.getConceptById?.label || selectedNodeId}
                  </div>
                  {selectedData?.getConceptById && (
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded border"
                        style={{
                          color: getDomainColor(selectedData.getConceptById.domenaPierwotna),
                          borderColor: getDomainColor(selectedData.getConceptById.domenaPierwotna) + '60',
                          backgroundColor: getDomainColor(selectedData.getConceptById.domenaPierwotna) + '15'
                        }}
                      >
                        {selectedData.getConceptById.domenaPierwotna}
                      </span>
                      <span className={`text-[10px] ${selectedData.getConceptById.statusAntiD ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedData.getConceptById.statusAntiD ? '● Anti-D OK' : '● Anti-D FAIL'}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="text-gray-400 hover:text-white ml-2 text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {selectedLoading && (
              <div className="p-4 text-gray-400 text-sm animate-pulse">Ładowanie szczegółów...</div>
            )}

            {selectedError && (
              <div className="p-4 text-red-400 text-sm">Błąd: {selectedError.message}</div>
            )}

            {selectedData?.getConceptById && (
              <div className="divide-y divide-cyan-500/20">
                {/* ── Properties Section ── */}
                <div className="p-4">
                  <div className="text-cyan-400 font-bold text-xs tracking-wider mb-3 pb-2 border-b border-cyan-500/30">
                    WŁAŚCIWOŚCI
                  </div>
                  <div className="space-y-2 text-xs">
                    <PropRow label="id" value={selectedData.getConceptById.id} color="cyan" />
                    <PropRow label="definicja" value={selectedData.getConceptById.definicja} multiline />
                    <PropRow label="aksjomat" value={selectedData.getConceptById.aksjomatPodstawowy} multiline />
                    <PropRow label="źródło" value={selectedData.getConceptById.zrodloAksjomatyczne} />
                    <PropRow label="wektor HG" value={selectedData.getConceptById.wektorHiperGestosci?.toFixed(4)} color="cyan" />
                  </div>
                </div>

                {/* ── Coherence Editor Section ── */}
                <div className="p-4">
                  <CoherenceEditor
                    nodeData={selectedData.getConceptById}
                    onUpdateCoherence={handleUpdateCoherence}
                    onUpdateStatus={handleUpdateStatus}
                    updating={coherenceUpdating || statusUpdating}
                    updateResult={coherenceResult || statusResult}
                  />
                </div>

                {/* ── Relationships Section ── */}
                <div className="p-4">
                  <RelationshipPanel
                    relationships={relData?.getNodeRelationships}
                    loading={relLoading}
                    error={relError}
                    onNavigate={handleNavigateToNode}
                  />
                </div>

                {/* ── Audit Trail Section ── */}
                <div className="p-4">
                  <AuditTrailPanel
                    events={auditData?.getAuditEvents}
                    loading={auditLoading}
                    error={auditError}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: Domain color mapping
function getDomainColor(domain) {
  const colors = {
    KAR: '#00D9FF',
    MEHS: '#FF00FF',
    NCSS: '#00FF88',
    EAEO: '#FFD700',
    BSIT: '#FF6B35'
  };
  return colors[domain] || '#888';
}

// Helper: Property row component
function PropRow({ label, value, color, multiline }) {
  return (
    <div className={multiline ? '' : 'flex items-baseline gap-2'}>
      <span className="text-gray-500 text-[10px] uppercase shrink-0">{label}:</span>
      <span className={`${
        color === 'cyan' ? 'text-cyan-400' : 'text-gray-200'
      } ${multiline ? 'block mt-0.5 text-gray-300 leading-relaxed' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <KnowledgeGraphExplorer />
    </ApolloProvider>
  );
}

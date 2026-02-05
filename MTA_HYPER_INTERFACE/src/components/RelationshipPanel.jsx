'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA HYPER INTERFACE – RELATIONSHIP PANEL
 * GOK:AI Protocol: Relational topology navigator
 * ════════════════════════════════════════════════════════════════════════════
 */

const RELATION_COLORS = {
  KONSTYTUUJE: '#00FF88',
  MANIFESTUJE: '#00D9FF',
  WZMACNIA: '#FFD700',
  ANTAGONIZUJE: '#FF0000',
  MAPUJE_NA: '#FF00FF',
  WARUNKUJE: '#FF6B35'
};

const RELATION_ICONS = {
  KONSTYTUUJE: '⬡',
  MANIFESTUJE: '◈',
  WZMACNIA: '⬆',
  ANTAGONIZUJE: '⚡',
  MAPUJE_NA: '↔',
  WARUNKUJE: '⟐'
};

export default function RelationshipPanel({ relationships, loading, error, onNavigate }) {
  if (loading) {
    return (
      <div className="text-gray-400 text-xs font-mono p-2">
        <div className="animate-pulse">Ładowanie relacji...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-xs font-mono p-2">
        Błąd: {error.message}
      </div>
    );
  }

  if (!relationships) return null;

  const { outgoing, incoming } = relationships;
  const totalRelations = outgoing.length + incoming.length;

  return (
    <div className="font-mono text-xs">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
        <span className="text-cyan-400 font-bold text-xs tracking-wider">RELACJE</span>
        <span className="text-gray-500 text-[10px]">
          {totalRelations} {totalRelations === 1 ? 'połączenie' : 'połączeń'}
        </span>
      </div>

      {totalRelations === 0 && (
        <div className="text-gray-500 text-center py-3">
          Brak relacji (węzeł izolowany)
        </div>
      )}

      {/* Outgoing relations */}
      {outgoing.length > 0 && (
        <div className="mb-3">
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="text-green-400">→</span> Wychodzące ({outgoing.length})
          </div>
          <div className="space-y-1">
            {outgoing.map((rel, idx) => (
              <RelationRow
                key={`out-${idx}`}
                relation={rel}
                direction="out"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}

      {/* Incoming relations */}
      {incoming.length > 0 && (
        <div>
          <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <span className="text-blue-400">←</span> Przychodzące ({incoming.length})
          </div>
          <div className="space-y-1">
            {incoming.map((rel, idx) => (
              <RelationRow
                key={`in-${idx}`}
                relation={rel}
                direction="in"
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelationRow({ relation, direction, onNavigate }) {
  const color = RELATION_COLORS[relation.typ] || '#888';
  const icon = RELATION_ICONS[relation.typ] || '●';
  
  // For outgoing: show target; for incoming: show source
  const neighbor = direction === 'out' ? relation.target : relation.source;
  const neighborLabel = neighbor?.label || neighbor?.id || '?';
  const neighborId = neighbor?.id;

  return (
    <button
      onClick={() => onNavigate && neighborId && onNavigate(neighborId)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-cyan-500/10 transition-colors text-left group"
      title={`Nawiguj do: ${neighborLabel}`}
    >
      {/* Relation type badge */}
      <span
        className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
        style={{ 
          backgroundColor: `${color}20`,
          color: color,
          border: `1px solid ${color}40`
        }}
      >
        {icon} {relation.typ}
      </span>

      {/* Direction arrow */}
      <span className="text-gray-600 shrink-0">
        {direction === 'out' ? '→' : '←'}
      </span>

      {/* Neighbor label */}
      <span className="text-white truncate group-hover:text-cyan-300 transition-colors">
        {neighborLabel}
      </span>

      {/* Weight indicator */}
      {relation.waga && relation.waga !== 1.0 && (
        <span className="text-gray-500 text-[9px] ml-auto shrink-0">
          w:{relation.waga.toFixed(1)}
        </span>
      )}

      {/* Navigate icon */}
      <span className="text-gray-600 group-hover:text-cyan-400 ml-auto shrink-0 transition-colors">
        ⟶
      </span>
    </button>
  );
}

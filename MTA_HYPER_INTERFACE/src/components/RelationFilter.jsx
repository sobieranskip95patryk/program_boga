'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA HYPER INTERFACE – RELATION TYPE FILTER
 * Filtrowanie krawędzi grafu po typie relacji semantycznej
 * ════════════════════════════════════════════════════════════════════════════
 */

const RELATION_TYPES = [
  { value: 'KONSTYTUUJE', label: 'Konstytuuje', color: '#00FF88', icon: '⬡', desc: 'A definiuje / tworzy B' },
  { value: 'MANIFESTUJE', label: 'Manifestuje', color: '#00D9FF', icon: '◈', desc: 'A jest wyrazem B' },
  { value: 'WZMACNIA',    label: 'Wzmacnia',    color: '#FFD700', icon: '⬆', desc: 'A wspiera B' },
  { value: 'ANTAGONIZUJE',label: 'Antagonizuje',color: '#FF0000', icon: '⚡', desc: 'A jest w konflikcie z B' },
  { value: 'MAPUJE_NA',   label: 'Mapuje na',   color: '#FF00FF', icon: '↔', desc: 'A odpowiada B' },
  { value: 'WARUNKUJE',   label: 'Warunkuje',   color: '#FF6B35', icon: '⟐', desc: 'A wymaga B' },
];

export default function RelationFilter({ activeFilters, onFilterChange }) {
  const allActive = activeFilters.length === RELATION_TYPES.length;
  const noneActive = activeFilters.length === 0;

  const toggleRelation = (value) => {
    if (activeFilters.includes(value)) {
      onFilterChange(activeFilters.filter(f => f !== value));
    } else {
      onFilterChange([...activeFilters, value]);
    }
  };

  const toggleAll = () => {
    if (allActive) {
      onFilterChange([]);
    } else {
      onFilterChange(RELATION_TYPES.map(r => r.value));
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* All/None toggle */}
      <button
        onClick={toggleAll}
        className={`text-[10px] px-2 py-1 rounded border font-mono transition-all ${
          allActive
            ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
            : 'border-gray-600 text-gray-500 hover:border-gray-400'
        }`}
        title={allActive ? 'Wyłącz wszystkie' : 'Włącz wszystkie'}
      >
        {allActive ? '✓ ALL' : '○ ALL'}
      </button>

      {/* Individual relation toggles */}
      {RELATION_TYPES.map(rel => {
        const isActive = activeFilters.includes(rel.value);
        return (
          <button
            key={rel.value}
            onClick={() => toggleRelation(rel.value)}
            className="text-[10px] px-2 py-1 rounded border font-mono transition-all"
            style={isActive ? {
              borderColor: rel.color + '80',
              color: rel.color,
              backgroundColor: rel.color + '15',
            } : {
              borderColor: '#333',
              color: '#555',
            }}
            title={`${rel.desc}${isActive ? ' (kliknij aby ukryć)' : ' (kliknij aby pokazać)'}`}
          >
            {rel.icon} {rel.label}
          </button>
        );
      })}

      {/* Counter */}
      {!allActive && !noneActive && (
        <span className="text-[9px] text-gray-500 font-mono ml-1">
          {activeFilters.length}/{RELATION_TYPES.length}
        </span>
      )}
    </div>
  );
}

// Export list of all relation type values for default state
export const ALL_RELATION_TYPES = RELATION_TYPES.map(r => r.value);

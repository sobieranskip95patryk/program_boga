'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA HYPER INTERFACE – AUDIT TRAIL PANEL
 * GOK:AI Protocol: Temporal change log for concepts
 * ════════════════════════════════════════════════════════════════════════════
 */

const ACTION_LABELS = {
  CREATE_CONCEPT: 'Utworzono koncept',
  CREATE_RELATION: 'Utworzono relację',
  UPDATE_COHERENCE: 'Zmieniono koherencję',
  UPDATE_STATUS: 'Zmieniono status',
  REPORT_EXTERNAL_ENTROPY: 'Zgłoszono entropię'
};

export default function AuditTrailPanel({ events, loading, error }) {
  if (loading) {
    return (
      <div className="text-gray-400 text-xs font-mono p-2">
        <div className="animate-pulse">Ładowanie audytu...</div>
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

  if (!events || events.length === 0) {
    return (
      <div className="font-mono text-xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
          <span className="text-cyan-400 font-bold text-xs tracking-wider">AUDYT</span>
          <span className="text-gray-500 text-[10px]">0 zdarzeń</span>
        </div>
        <div className="text-gray-500 text-center py-3">Brak zdarzeń audytu</div>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
        <span className="text-cyan-400 font-bold text-xs tracking-wider">AUDYT</span>
        <span className="text-gray-500 text-[10px]">{events.length} zdarzeń</span>
      </div>

      <div className="space-y-2">
        {events.map((event) => (
          <AuditRow key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

function AuditRow({ event }) {
  const label = ACTION_LABELS[event.action] || event.action;
  const timestamp = formatTimestamp(event.timestamp);
  const details = formatDetails(event.details);

  return (
    <div className="border border-cyan-500/20 rounded px-2 py-1.5 bg-black/40">
      <div className="flex items-center justify-between">
        <span className="text-cyan-300 text-[10px] uppercase tracking-wider">{label}</span>
        <span className="text-gray-500 text-[9px]">{timestamp}</span>
      </div>
      <div className="text-gray-300 text-[10px] mt-1">
        <span className="text-gray-500">Typ:</span> {event.entityType} · <span className="text-gray-500">Actor:</span> {event.actor}
      </div>
      {details && (
        <div className="text-gray-400 text-[10px] mt-1 leading-snug">
          {details}
        </div>
      )}
    </div>
  );
}

function formatTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('pl-PL', { hour12: false });
}

function formatDetails(details) {
  if (!details) return '';
  try {
    const parsed = JSON.parse(details);
    return Object.entries(parsed)
      .map(([key, val]) => `${key}: ${val}`)
      .join(' · ');
  } catch {
    return details;
  }
}

'use client';

/**
 * ════════════════════════════════════════════════════════════════════════════
 * MTA HYPER INTERFACE – COHERENCE EDITOR
 * GOK:AI Protocol: Active state calibration controller
 * ════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect } from 'react';

const STATUS_OPTIONS = [
  { value: 'ROOT', label: 'ROOT', color: '#FFD700', icon: '★' },
  { value: 'Nowy', label: 'Nowy', color: '#00D9FF', icon: '◆' },
  { value: 'Rozwijany', label: 'Rozwijany', color: '#00FF88', icon: '▶' },
  { value: 'Walidowany', label: 'Walidowany', color: '#88FF00', icon: '✓' },
  { value: 'Zarchiwizowany', label: 'Zarchiwizowany', color: '#888888', icon: '▪' }
];

export default function CoherenceEditor({
  nodeData,
  onUpdateCoherence,
  onUpdateStatus,
  updating,
  updateResult
}) {
  const [koherencja, setKoherencja] = useState(1.0);
  const [status, setStatus] = useState('Nowy');
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync with incoming node data
  useEffect(() => {
    if (nodeData) {
      setKoherencja(nodeData.koherencja ?? 1.0);
      setStatus(nodeData.statusTrajektorii ?? 'Nowy');
      setHasChanges(false);
    }
  }, [nodeData]);

  // Flash success on update
  useEffect(() => {
    if (updateResult) {
      setShowSuccess(true);
      setHasChanges(false);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [updateResult]);

  if (!nodeData) return null;

  const isAntiDValid = koherencja >= 0.80;
  const coherenceChanged = koherencja !== (nodeData.koherencja ?? 1.0);
  const statusChanged = status !== (nodeData.statusTrajektorii ?? 'Nowy');
  const isROOT = nodeData.statusTrajektorii === 'ROOT';

  const handleCoherenceChange = (value) => {
    const v = Math.max(0, Math.min(1, parseFloat(value) || 0));
    setKoherencja(v);
    setHasChanges(v !== (nodeData.koherencja ?? 1.0) || statusChanged);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setHasChanges(coherenceChanged || value !== (nodeData.statusTrajektorii ?? 'Nowy'));
  };

  const handleSaveCoherence = () => {
    if (coherenceChanged && onUpdateCoherence) {
      onUpdateCoherence(nodeData.id, koherencja);
    }
  };

  const handleSaveStatus = () => {
    if (statusChanged && onUpdateStatus) {
      onUpdateStatus(nodeData.id, status);
    }
  };

  const handleSaveAll = () => {
    if (coherenceChanged) handleSaveCoherence();
    if (statusChanged) handleSaveStatus();
  };

  // Get color for coherence level
  const getCoherenceColor = (val) => {
    if (val >= 0.95) return '#00FF88';
    if (val >= 0.80) return '#FFD700';
    if (val >= 0.50) return '#FF6B35';
    return '#FF0000';
  };

  const coherenceColor = getCoherenceColor(koherencja);

  return (
    <div className="font-mono text-xs">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/30">
        <span className="text-cyan-400 font-bold text-xs tracking-wider">KALIBRACJA STANU</span>
        {showSuccess && (
          <span className="text-green-400 text-[10px] animate-pulse">✓ Zapisano</span>
        )}
        {updating && (
          <span className="text-yellow-400 text-[10px] animate-pulse">⟳ Zapisuję...</span>
        )}
      </div>

      {/* Coherence control */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-400 text-[10px] uppercase tracking-wider">Koherencja</span>
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-bold"
              style={{ color: coherenceColor }}
            >
              {koherencja.toFixed(2)}
            </span>
            {!isAntiDValid && (
              <span className="text-red-400 text-[9px]" title="Anti-D warunek niespełniony (< 0.80)">
                ⚠ Anti-D
              </span>
            )}
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={koherencja}
            onChange={(e) => handleCoherenceChange(e.target.value)}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #FF0000 0%, #FF6B35 50%, #FFD700 80%, #00FF88 95%, #00FF88 100%)`,
              accentColor: coherenceColor
            }}
          />
          {/* Anti-D threshold marker */}
          <div
            className="absolute top-3 text-[8px] text-gray-500"
            style={{ left: '80%', transform: 'translateX(-50%)' }}
          >
            ▲0.80
          </div>
        </div>

        {/* Quick values */}
        <div className="flex gap-1 mt-3">
          {[0.5, 0.75, 0.80, 0.90, 0.95, 1.0].map(val => (
            <button
              key={val}
              onClick={() => handleCoherenceChange(val)}
              className={`px-1.5 py-0.5 rounded text-[9px] border transition-colors ${
                koherencja === val
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                  : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
              }`}
            >
              {val.toFixed(2)}
            </button>
          ))}
        </div>

        {/* Save coherence button */}
        {coherenceChanged && (
          <button
            onClick={handleSaveCoherence}
            disabled={updating}
            className="mt-2 w-full py-1 rounded text-[10px] font-bold bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30 transition-colors disabled:opacity-50"
          >
            Zapisz koherencję: {(nodeData.koherencja ?? 1.0).toFixed(2)} → {koherencja.toFixed(2)}
          </button>
        )}
      </div>

      {/* Status control */}
      <div className="mb-3">
        <div className="text-gray-400 text-[10px] uppercase tracking-wider mb-1.5">
          Status trajektorii
        </div>
        
        <div className="grid grid-cols-2 gap-1">
          {STATUS_OPTIONS.map(opt => {
            const isDisabled = isROOT && opt.value !== 'ROOT';
            return (
              <button
                key={opt.value}
                onClick={() => !isDisabled && handleStatusChange(opt.value)}
                disabled={isDisabled}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] border transition-all ${
                  status === opt.value
                    ? 'border-opacity-100 bg-opacity-20'
                    : 'border-gray-700 hover:border-gray-500'
                } ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                style={
                  status === opt.value
                    ? {
                        borderColor: opt.color,
                        backgroundColor: `${opt.color}15`,
                        color: opt.color
                      }
                    : {}
                }
                title={isDisabled ? 'ROOT status nie może być zmieniony' : `Ustaw status: ${opt.label}`}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {isROOT && (
          <div className="text-yellow-500/60 text-[9px] mt-1">
            ★ Węzeł ROOT — status chroniony
          </div>
        )}

        {/* Save status button */}
        {statusChanged && !isROOT && (
          <button
            onClick={handleSaveStatus}
            disabled={updating}
            className="mt-2 w-full py-1 rounded text-[10px] font-bold bg-purple-500/20 border border-purple-500/50 text-purple-400 hover:bg-purple-500/30 transition-colors disabled:opacity-50"
          >
            Zapisz status: {nodeData.statusTrajektorii} → {status}
          </button>
        )}
      </div>

      {/* Combined save */}
      {(coherenceChanged || (statusChanged && !isROOT)) && (coherenceChanged && statusChanged) && (
        <button
          onClick={handleSaveAll}
          disabled={updating}
          className="w-full py-1.5 rounded text-[10px] font-bold bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/50 text-white hover:from-cyan-500/30 hover:to-purple-500/30 transition-all disabled:opacity-50"
        >
          ⟳ Zapisz wszystkie zmiany
        </button>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHECKLIST_PHASES } from '../data/referenceData';
import { CheckSquare, Square, RotateCcw, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          pct === 100 ? 'bg-green-500' :
          pct >= 60  ? 'bg-amber-400'  :
                       'bg-blue-400'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Checklists() {
  const { checklistState, toggleChecklistItem, resetPhaseChecklist } = useApp();
  const [openPhase,   setOpenPhase]   = useState<string | null>(CHECKLIST_PHASES[0]?.id ?? null);
  const [filterCat,   setFilterCat]   = useState<string>('all');
  const [showCodes,   setShowCodes]   = useState(false);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  // Build category list from all phases
  const allCategories = Array.from(new Set(
    CHECKLIST_PHASES.flatMap(p => p.items.map(i => i.category))
  ));

  function getPhasePct(phaseId: string) {
    const phase = CHECKLIST_PHASES.find(p => p.id === phaseId);
    if (!phase || phase.items.length === 0) return 0;
    const done = phase.items.filter(i => checklistState[`${phaseId}_${i.id}`]).length;
    return Math.round((done / phase.items.length) * 100);
  }

  function handleReset(phaseId: string) {
    if (confirmReset === phaseId) {
      resetPhaseChecklist(phaseId);
      setConfirmReset(null);
    } else {
      setConfirmReset(phaseId);
      setTimeout(() => setConfirmReset(null), 3000);
    }
  }

  const overallDone  = CHECKLIST_PHASES.reduce((sum, p) =>
    sum + p.items.filter(i => checklistState[`${p.id}_${i.id}`]).length, 0);
  const overallTotal = CHECKLIST_PHASES.reduce((sum, p) => sum + p.items.length, 0);
  const overallPct   = overallTotal > 0 ? Math.round(overallDone / overallTotal * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Overall Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800">Overall Build Progress</h2>
            <p className="text-sm text-slate-500">{overallDone} of {overallTotal} items complete</p>
          </div>
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowCodes(v => !v)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showCodes ? 'Hide code refs' : 'Show code refs'}
            </button>
            <span className="text-2xl font-bold text-amber-600">{overallPct}%</span>
          </div>
        </div>
        <div className="mt-3">
          <ProgressBar pct={overallPct} />
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterCat === 'all' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >All</button>
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filterCat === cat ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Checklist phases */}
      <div className="space-y-3">
        {CHECKLIST_PHASES.map(phase => {
          const pct        = getPhasePct(phase.id);
          const isOpen     = openPhase === phase.id;
          const doneCount  = phase.items.filter(i => checklistState[`${phase.id}_${i.id}`]).length;
          const filtItems  = filterCat === 'all'
            ? phase.items
            : phase.items.filter(i => i.category === filterCat);
          const criticalLeft = phase.items.filter(i =>
            i.critical && !checklistState[`${phase.id}_${i.id}`]
          ).length;

          return (
            <div key={phase.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Phase header */}
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                onClick={() => setOpenPhase(isOpen ? null : phase.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{phase.icon}</span>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{phase.name}</span>
                      {criticalLeft > 0 && (
                        <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} />
                          {criticalLeft} critical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">{doneCount}/{phase.items.length} completed</span>
                      <span className={`text-xs font-semibold ${pct === 100 ? 'text-green-600' : pct > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block w-24">
                    <ProgressBar pct={pct} />
                  </div>
                  {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Checklist items */}
              {isOpen && (
                <div className="border-t border-slate-100">
                  {filtItems.length === 0 ? (
                    <p className="py-3 px-5 text-xs text-slate-400">No items match this category filter.</p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {filtItems.map(item => {
                        const key     = `${phase.id}_${item.id}`;
                        const checked = !!checklistState[key];
                        return (
                          <label
                            key={item.id}
                            className={`flex items-start gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${item.critical && !checked ? 'bg-red-50 hover:bg-red-50' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleChecklistItem(phase.id, item.id)}
                              className="sr-only"
                            />
                            <span className={`mt-0.5 flex-shrink-0 transition-colors ${checked ? 'text-green-500' : item.critical ? 'text-red-400' : 'text-slate-300'}`}>
                              {checked ? <CheckSquare size={18} /> : <Square size={18} />}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                {item.critical && !checked && (
                                  <span className="text-red-500 font-bold mr-1">★</span>
                                )}
                                {item.text}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.category}</span>
                                {showCodes && item.code && (
                                  <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">{item.code}</span>
                                )}
                                {item.note && (
                                  <span className="text-xs text-slate-500 italic">{item.note}</span>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Phase footer */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-100">
                    <span className="text-xs text-slate-500">{phase.items.length} items total</span>
                    <button
                      onClick={() => handleReset(phase.id)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                        confirmReset === phase.id
                          ? 'bg-red-500 text-white'
                          : 'text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <RotateCcw size={12} />
                      {confirmReset === phase.id ? 'Click again to confirm' : 'Reset phase'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        ★ = Critical inspection item. Always verify with local building department. Codes vary by jurisdiction.
      </p>
    </div>
  );
}

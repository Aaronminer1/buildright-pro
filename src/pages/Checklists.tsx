import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CHECKLIST_PHASES } from '../data/referenceData';
import { CheckCircle2, Circle, RotateCcw, ChevronDown, ChevronUp, AlertTriangle, Info } from 'lucide-react';

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
      <div
        className={`h-2 rounded-full transition-all duration-300 ${
          pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-blue-500'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function Checklists() {
  const { checklistState, toggleChecklistItem, resetPhaseChecklist } = useApp();
  const [openPhase, setOpenPhase] = useState<string | null>(CHECKLIST_PHASES[0]?.id ?? null);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);

  // State is stored as checklistState[phaseId][itemId] — use nested access
  function isChecked(phaseId: string, itemId: string): boolean {
    return !!checklistState[phaseId]?.[itemId];
  }

  function getPhaseCounts(phaseId: string) {
    const phase = CHECKLIST_PHASES.find(p => p.id === phaseId);
    if (!phase) return { done: 0, total: 0, pct: 0 };
    const done = phase.items.filter(i => isChecked(phaseId, i.id)).length;
    const total = phase.items.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
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

  const overallDone = CHECKLIST_PHASES.reduce(
    (sum, p) => sum + p.items.filter(i => isChecked(p.id, i.id)).length, 0
  );
  const overallTotal = CHECKLIST_PHASES.reduce((sum, p) => sum + p.items.length, 0);
  const overallPct = overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0;

  return (
    <div className="space-y-4">

      {/* Overall Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-slate-800 text-lg">Build Progress</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {overallDone} of {overallTotal} tasks checked off
            </p>
          </div>
          <span className={`text-3xl font-bold tabular-nums ${overallPct === 100 ? 'text-green-600' : 'text-amber-600'}`}>
            {overallPct}%
          </span>
        </div>
        <ProgressBar pct={overallPct} />
        {overallDone === 0 && (
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Info size={11} />
            Tap any item below to check it off. Items marked ⚠️ must pass official inspection.
          </p>
        )}
      </div>

      {/* Phase list */}
      <div className="space-y-3">
        {CHECKLIST_PHASES.map(phase => {
          const { done, total, pct } = getPhaseCounts(phase.id);
          const isOpen = openPhase === phase.id;
          const hasUnfinishedCritical = phase.items.some(
            i => i.critical && !isChecked(phase.id, i.id)
          );
          const allDone = pct === 100;

          return (
            <div
              key={phase.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                allDone ? 'border-green-200' : hasUnfinishedCritical ? 'border-amber-200' : 'border-slate-200'
              }`}
            >
              {/* Phase header */}
              <button
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                onClick={() => setOpenPhase(isOpen ? null : phase.id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{phase.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800">{phase.name}</span>
                      {allDone && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Complete ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500">{done}/{total} done</span>
                      <div className="flex-1 max-w-[100px]">
                        <ProgressBar pct={pct} />
                      </div>
                      <span className={`text-xs font-semibold tabular-nums ${
                        allDone ? 'text-green-600' : pct > 0 ? 'text-amber-600' : 'text-slate-400'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>
                {isOpen
                  ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0 ml-2" />
                  : <ChevronDown size={16} className="text-slate-400 flex-shrink-0 ml-2" />
                }
              </button>

              {/* Items */}
              {isOpen && (
                <div className="border-t border-slate-100">

                  {/* Inspection warning banner — only shows if phase has unchecked required items */}
                  {hasUnfinishedCritical && (
                    <div className="flex items-start gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
                      <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 leading-snug">
                        Items marked ⚠️ below are required to pass official inspection — do not skip them.
                      </p>
                    </div>
                  )}

                  <div className="divide-y divide-slate-100">
                    {phase.items.map(item => {
                      const checked = isChecked(phase.id, item.id);
                      const isConditional = /\(if /i.test(item.text) || /if applicable/i.test(item.text);

                      return (
                        <label
                          key={item.id}
                          className={`flex items-start gap-3 px-5 py-4 cursor-pointer transition-colors ${
                            checked
                              ? 'bg-green-50 hover:bg-green-100'
                              : item.critical
                              ? 'hover:bg-amber-50'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleChecklistItem(phase.id, item.id)}
                            className="sr-only"
                          />

                          {/* Checkbox icon */}
                          <span className={`mt-0.5 flex-shrink-0 transition-colors ${
                            checked ? 'text-green-500' : 'text-slate-300'
                          }`}>
                            {checked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                          </span>

                          <div className="flex-1 min-w-0">
                            {/* Item text + badges */}
                            <div className="flex items-start gap-1.5 flex-wrap">
                              {item.critical && !checked && (
                                <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              )}
                              <p className={`text-sm leading-snug ${
                                checked ? 'text-slate-400 line-through' : 'text-slate-700'
                              }`}>
                                {item.text}
                              </p>
                              {isConditional && !checked && (
                                <span className="inline-flex text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded leading-tight flex-shrink-0">
                                  when applicable
                                </span>
                              )}
                            </div>

                            {/* Note / why it matters */}
                            {item.note && !checked && (
                              <div className="flex items-start gap-1 mt-1.5 bg-blue-50 rounded px-2 py-1.5">
                                <Info size={11} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-700 leading-snug">{item.note}</p>
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Phase footer */}
                  <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-t border-slate-100">
                    <span className="text-xs text-slate-400">{total} items in this phase</span>
                    <button
                      onClick={() => handleReset(phase.id)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors ${
                        confirmReset === phase.id
                          ? 'bg-red-500 text-white'
                          : 'text-slate-400 hover:text-red-500 hover:bg-red-50'
                      }`}
                    >
                      <RotateCcw size={11} />
                      {confirmReset === phase.id ? 'Tap again to confirm' : 'Reset phase'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center pb-4">
        ⚠️ = Must pass inspection. Always verify requirements with your local building department — codes vary by jurisdiction.
      </p>
    </div>
  );
}

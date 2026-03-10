import { useState, type ReactNode } from 'react';
import { Card } from '../components/ui/Card';
import { SAFETY_CHECKLIST } from '../data/referenceData';
import { CheckSquare, Square, Shield, HardHat, Zap, AlertTriangle, Wrench } from 'lucide-react';

const CATEGORY_ICONS: Record<string, ReactNode> = {
  'Fall Protection':     <Shield size={18} className="text-red-500" />,
  'PPE Requirements':    <HardHat size={18} className="text-amber-500" />,
  'Tool & Equipment Safety': <Wrench size={18} className="text-blue-500" />,
  'Excavation & Trenching':  <AlertTriangle size={18} className="text-orange-500" />,
  'Hazardous Materials': <Zap size={18} className="text-yellow-500" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Fall Protection':         'bg-red-50 border-red-200',
  'PPE Requirements':        'bg-amber-50 border-amber-200',
  'Tool & Equipment Safety': 'bg-blue-50 border-blue-200',
  'Excavation & Trenching':  'bg-orange-50 border-orange-200',
  'Hazardous Materials':     'bg-yellow-50 border-yellow-200',
};

export function Safety() {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  function toggle(key: string) {
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const totalItems = SAFETY_CHECKLIST.reduce((s, c) => s + c.items.length, 0);
  const doneItems  = Object.values(checked).filter(Boolean).length;
  const pct        = totalItems > 0 ? Math.round(doneItems / totalItems * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-xl p-5 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-1">Job Site Safety</h2>
            <p className="text-red-200 text-sm">OSHA 29 CFR 1926 — Construction Safety Standards. Review daily at toolbox talk.</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-amber-400">{pct}%</p>
            <p className="text-red-300 text-xs">{doneItems}/{totalItems} reviewed</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-red-800 rounded-full overflow-hidden">
          <div className="h-2 bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Fatal Four */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Fatal Four #1', value: 'Falls',                color: 'bg-red-100 text-red-800' },
          { label: 'Fatal Four #2', value: 'Struck-By',            color: 'bg-orange-100 text-orange-800' },
          { label: 'Fatal Four #3', value: 'Electrocution',         color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Fatal Four #4', value: 'Caught-In/Between',    color: 'bg-amber-100 text-amber-800' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-sm font-bold mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Safety categories */}
      <div className="space-y-4">
        {SAFETY_CHECKLIST.map((cat, catIdx) => {
          const catKey   = cat.category;
          const catDone  = cat.items.filter((_, iIdx) => checked[`${catIdx}_${iIdx}`]).length;
          return (
            <div key={catIdx} className={`rounded-xl border ${CATEGORY_COLORS[catKey] ?? 'bg-slate-50 border-slate-200'} overflow-hidden`}>
              <div className="flex items-center gap-3 p-4">
                {CATEGORY_ICONS[catKey] ?? <Shield size={18} />}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{cat.category}</h3>
                </div>
                <span className="text-xs text-slate-500">{catDone}/{cat.items.length}</span>
              </div>
              <div className="divide-y divide-white divide-opacity-50">
                {cat.items.map((item, iIdx) => {
                  const id     = `${catIdx}_${iIdx}`;
                  const isDone = !!checked[id];
                  return (
                    <label key={iIdx} className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-white hover:bg-opacity-40 transition-colors">
                      <input type="checkbox" checked={isDone} onChange={() => toggle(id)} className="sr-only" />
                      <span className={`mt-0.5 flex-shrink-0 transition-colors ${isDone ? 'text-green-500' : 'text-slate-400'}`}>
                        {isDone ? <CheckSquare size={16} /> : <Square size={16} />}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {item.critical && <span className="text-red-600 font-bold mr-1">★</span>}
                          {item.text}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {item.code && <span className="text-xs text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">{item.code}</span>}
                          {item.note && <span className="text-xs text-slate-500 italic">{item.note}</span>}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* OSHA Quick Reference */}
      <Card title="OSHA Quick Reference — Key Thresholds">
        <div className="grid md:grid-cols-2 gap-3 text-xs">
          {[
            { rule: 'Fall Protection Required',  threshold: 'Above 6 feet (1926.502)',    detail: 'Guardrails, safety nets, or personal fall arrest' },
            { rule: 'Scaffold Fall Protection',  threshold: 'Above 10 feet',             detail: 'Requires full perimeter guardrails or PFAS' },
            { rule: 'Ladder Extension',          threshold: '3 ft above landing',        detail: 'Fixed and secured at top; 4:1 ground ratio' },
            { rule: 'Excavation Sloping',        threshold: '5+ feet deep',              detail: 'Requires sloping, shoring, or trench box' },
            { rule: 'Electrical Safe Distance',  threshold: '10 ft min (1926.416)',       detail: 'Stay 10\'+ from overhead high-voltage power lines' },
            { rule: 'Heat Illness Prevention',   threshold: '80°F+',                     detail: 'Water, rest, shade — OSHA heat illness standards' },
            { rule: 'Silica Exposure Limit',     threshold: '50 µg/m³ PEL (1926.1153)', detail: 'Wet cutting, local exhaust, respirator required' },
            { rule: 'PPE Minimum',               threshold: 'Always',                    detail: 'Hard hat, safety glasses, steel-toe boots on site' },
          ].map((r, i) => (
            <div key={i} className={`p-2.5 rounded-lg border ${i % 2 === 0 ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'}`}>
              <p className="font-bold text-slate-700">{r.rule}</p>
              <p className="text-amber-700 font-medium mt-0.5">{r.threshold}</p>
              <p className="text-slate-500 mt-0.5">{r.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Emergency contacts */}
      <Card title="Emergency Information" subtitle="Post these numbers on-site">
        <div className="grid md:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'Emergency',           number: '911',            note: 'Police, Fire, Medical' },
            { label: 'OSHA Hotline',        number: '1-800-321-6742', note: 'Report fatalities within 8 hrs' },
            { label: 'Poison Control',      number: '1-800-222-1222', note: 'Chemical/hazmat exposure' },
            { label: 'Utility Locate (811)',number: '811',            note: 'Call 3 days before digging (USA)' },
          ].map(c => (
            <div key={c.label} className="bg-slate-800 text-white rounded-xl p-3">
              <p className="text-slate-400 text-xs">{c.label}</p>
              <p className="text-amber-400 font-bold text-lg mt-0.5">{c.number}</p>
              <p className="text-slate-400 text-xs mt-0.5">{c.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <p className="text-xs text-slate-400 text-center">
        ★ = Critical safety items. Always follow your company safety plan and all applicable OSHA regulations.
      </p>
    </div>
  );
}

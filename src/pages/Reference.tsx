import { useState } from 'react';
import { Card } from '../components/ui/Card';
import {
  FLOOR_JOIST_SPANS, CEILING_JOIST_SPANS, RAFTER_SPANS,
  HEADER_SIZES, R_VALUE_GUIDE, NAILING_SCHEDULE,
  CONCRETE_MIX_GUIDE, ROUGH_OPENINGS,
} from '../data/referenceData';

const TABS = [
  { id: 'spans',    label: 'Span Tables',      icon: '📐' },
  { id: 'headers',  label: 'Headers',          icon: '🔩' },
  { id: 'nailing',  label: 'Nailing Schedule', icon: '🔨' },
  { id: 'rvalues',  label: 'R-Values',         icon: '🌡️' },
  { id: 'concrete', label: 'Concrete Mix',     icon: '🪣' },
  { id: 'openings', label: 'Rough Openings',   icon: '🚪' },
];

function SpanTables() {
  const [spanType, setSpanType] = useState<'floor' | 'ceiling' | 'rafter'>('floor');
  const data = spanType === 'floor' ? FLOOR_JOIST_SPANS : spanType === 'ceiling' ? CEILING_JOIST_SPANS : RAFTER_SPANS;
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(['floor', 'ceiling', 'rafter'] as const).map(t => (
          <button key={t} onClick={() => setSpanType(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${spanType === t ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {t === 'floor' ? 'Floor Joists' : t === 'ceiling' ? 'Ceiling Joists' : 'Rafters'}
          </button>
        ))}
      </div>
      <Card title={`${spanType === 'floor' ? 'Floor Joist' : spanType === 'ceiling' ? 'Ceiling Joist' : 'Rafter'} Maximum Spans`} subtitle="Douglas Fir-Larch No. 2">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 font-medium text-slate-600">Size</th>
              <th className="text-center py-2 px-3 font-medium text-slate-600">@ 12" OC</th>
              <th className="text-center py-2 px-3 font-medium text-slate-600">@ 16" OC</th>
              <th className="text-center py-2 px-3 font-medium text-slate-600">@ 24" OC</th>
            </tr></thead>
            <tbody>{data.map(row => (
              <tr key={row.size} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-3 font-bold text-amber-700">{row.size}</td>
                <td className="py-2 px-3 text-center text-slate-700">{row.spacing12}</td>
                <td className="py-2 px-3 text-center text-slate-700">{row.spacing16}</td>
                <td className="py-2 px-3 text-center text-slate-700">{row.spacing24}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">Maximum allowable spans for common residential conditions. Always consult current IRC or local code.</p>
      </Card>
    </div>
  );
}

function HeadersTable() {
  return (
    <Card title="Header / Lintel Sizing Guide" subtitle="Residential bearing walls — doubled lumber headers">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 font-medium text-slate-600">Max Opening</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600">Lumber Header</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600">LVL Option</th>
          </tr></thead>
          <tbody>{HEADER_SIZES.map((h, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-bold text-amber-700">Up to {h.maxOpeningFt}&apos;</td>
              <td className="py-2 px-3 text-slate-700">{h.twoBySize}</td>
              <td className="py-2 px-3 text-slate-500">{h.lvlNote}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="mt-3 grid md:grid-cols-2 gap-3 text-xs">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700">Doubled headers (two members + ½" spacer plywood) are most common. LVL beams can span larger openings with smaller depth.</div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-700">For openings over 10&apos;, consult a structural engineer. LVL or PSL beams are usually required.</div>
      </div>
    </Card>
  );
}

function NailingScheduleTable() {
  return (
    <Card title="Minimum Nailing Schedule" subtitle="IRC Table R602.3(1) — common wire nails unless noted">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 font-medium text-slate-600">Connection</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600">Fastener / Requirement</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600 hidden md:table-cell">Code Ref</th>
          </tr></thead>
          <tbody>{NAILING_SCHEDULE.map((n, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 text-slate-700">{n.connection}</td>
              <td className="py-2 px-3 font-medium text-amber-700">{n.fastener}</td>
              <td className="py-2 px-3 text-slate-400 hidden md:table-cell font-mono text-xs">{n.code}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-2">Use hot-dipped galvanized or stainless nails in wet/exterior conditions.</p>
    </Card>
  );
}

function RValuesTable() {
  return (
    <Card title="IECC Minimum Insulation R-Values by Climate Zone">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 font-medium text-slate-600">Zone</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600 hidden sm:table-cell">Region</th>
            <th className="text-center py-2 px-2 font-medium text-slate-600">Attic</th>
            <th className="text-center py-2 px-2 font-medium text-slate-600">Walls</th>
            <th className="text-center py-2 px-2 font-medium text-slate-600">Floors</th>
            <th className="text-center py-2 px-2 font-medium text-slate-600">Basement</th>
          </tr></thead>
          <tbody>{R_VALUE_GUIDE.map(r => (
            <tr key={r.zone} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-bold text-amber-700">Zone {r.zone}</td>
              <td className="py-2 px-3 text-slate-500 hidden sm:table-cell text-xs">{r.zoneName}</td>
              <td className="py-2 px-2 text-center font-medium text-slate-700">{r.attic}</td>
              <td className="py-2 px-2 text-center font-medium text-slate-700">{r.walls}</td>
              <td className="py-2 px-2 text-center font-medium text-slate-700">{r.floors}</td>
              <td className="py-2 px-2 text-center font-medium text-slate-700">{r.basement}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-2">Based on 2021 IECC. These are minimums; higher R-values are typically cost-effective.</p>
    </Card>
  );
}

function ConcreteMixTable() {
  return (
    <Card title="Concrete Mix Designs / Common Applications">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 font-medium text-slate-600">Application</th>
            <th className="text-center py-2 px-2 font-medium text-slate-600">Strength</th>
            <th className="text-center py-2 px-2 font-medium text-slate-600">w/c Ratio</th>
            <th className="text-center py-2 px-2 font-medium text-slate-600">Slump</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600 hidden md:table-cell">Notes</th>
          </tr></thead>
          <tbody>{CONCRETE_MIX_GUIDE.map((m, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-medium text-slate-700">{m.use}</td>
              <td className="py-2 px-2 text-center font-bold text-amber-700">{m.strength}</td>
              <td className="py-2 px-2 text-center text-slate-600">{m.wCRatio}</td>
              <td className="py-2 px-2 text-center text-slate-600">{m.slump}</td>
              <td className="py-2 px-3 text-slate-500 hidden md:table-cell">{m.note}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </Card>
  );
}

function RoughOpeningsTable() {
  return (
    <Card title="Standard Door & Window Rough Openings" subtitle="Add 2 in. to door width and 2.5 in. to door height for frame + shim space">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 font-medium text-slate-600">Opening / Item</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600">Rough Opening</th>
            <th className="text-left py-2 px-3 font-medium text-slate-600">Notes</th>
          </tr></thead>
          <tbody>{ROUGH_OPENINGS.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="py-2 px-3 font-medium text-slate-700">{r.item}</td>
              <td className="py-2 px-3 font-bold text-amber-700">{r.ro}</td>
              <td className="py-2 px-3 text-slate-500">{r.note}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-2">Always verify RO with the manufacturer&apos;s installation guide. Sizes depend on specific frame dimensions.</p>
    </Card>
  );
}

export function Reference() {
  const [tab, setTab] = useState('spans');
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
              <span className="mr-1">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'spans'    && <SpanTables />}
      {tab === 'headers'  && <HeadersTable />}
      {tab === 'nailing'  && <NailingScheduleTable />}
      {tab === 'rvalues'  && <RValuesTable />}
      {tab === 'concrete' && <ConcreteMixTable />}
      {tab === 'openings' && <RoughOpeningsTable />}
    </div>
  );
}

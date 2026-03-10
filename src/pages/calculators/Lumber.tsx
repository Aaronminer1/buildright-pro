import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox } from '../../components/ui/InfoBox';
import { calcBoardFeet, round2 } from '../../utils/calculations';
import { PriceIndexBanner } from '../../components/ui/PriceIndexBanner';

const LUMBER_SERIES = ['softwood_lumber', 'plywood'] as const;

const TABS = [
  { id: 'bf',    label: 'Board Feet',      icon: '🪵' },
  { id: 'order', label: 'Lumber Order',    icon: '📋' },
  { id: 'beam',  label: 'Beam/LVL Guide',  icon: '📏' },
];

// Standard lumber price per BF (rough estimates)
const LUMBER_PRICES: Record<string, number> = {
  '2x4':  0.55,
  '2x6':  0.75,
  '2x8':  1.10,
  '2x10': 1.50,
  '2x12': 2.20,
  '4x4':  1.20,
  '4x6':  2.00,
  '6x6':  2.80,
  '4x8':  2.50,
  'LVL':  4.00,
};

// Board Feet Calculator
function BoardFeetCalc() {
  const [thickness, setThickness] = useState('1.5');
  const [width,     setWidth]     = useState('3.5');
  const [length,    setLength]    = useState('8');
  const [pieces,    setPieces]    = useState('1');
  const [pricePerBF,setPrice]     = useState('0.75');

  const bf = useMemo(
    () => calcBoardFeet(parseFloat(thickness)||0, parseFloat(width)||0, parseFloat(length)||0, parseInt(pieces)||1),
    [thickness, width, length, pieces]
  );

  const cost = round2(bf * (parseFloat(pricePerBF) || 0));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Board feet = (T in × W in × L ft) ÷ 12">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Thickness (actual, not nominal)" value={thickness} onChange={setThickness} unit="in"
              hint='Use the ACTUAL size. A "2×4" is really 1.5" thick — see the chart below.' />
            <InputField label="Width (actual, not nominal)" value={width} onChange={setWidth} unit="in"
              hint='A "2×4" is actually 3.5" wide. See the chart below for all sizes.' />
          </div>
          <InputField label="Length" value={length} onChange={setLength} unit="ft" />
          <InputField label="Number of Pieces" value={pieces} onChange={setPieces} step={1} min={1} />
          <InputField label="Price per Board Foot ($)" value={pricePerBF} onChange={setPrice}
            unit="$/BF" step={0.05} min={0} hint="Typical: $0.50–2.50/BF depending on species and size" />

          {/* Quick size chart */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Quick Nominal vs Actual:</p>
            <div className="grid grid-cols-3 gap-1 text-xs">
              {[
                ['2×4', '1.5 × 3.5'],
                ['2×6', '1.5 × 5.5'],
                ['2×8', '1.5 × 7.25'],
                ['2×10','1.5 × 9.25'],
                ['2×12','1.5 × 11.25'],
                ['4×4', '3.5 × 3.5'],
                ['4×6', '3.5 × 5.5'],
                ['6×6', '5.5 × 5.5'],
              ].map(([nom, act]) => (
                <div key={nom} className="bg-slate-50 rounded px-1.5 py-1">
                  <div className="font-medium text-slate-700">{nom}</div>
                  <div className="text-slate-400">{act}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Board Feet"     value={bf}              unit="BF"  highlight />
          <ResultCard label="Estimated Cost" value={`$${cost}`}      unit="total" />
          <ResultCard label="Per Piece BF"   value={round2(bf / (parseInt(pieces)||1))} unit="BF/pc" small />
          <ResultCard label="$/BF"           value={`$${pricePerBF}`} unit="per BF" small />
        </div>

        <div className="mt-4 bg-slate-50 rounded-lg p-3 text-xs text-slate-600">
          <p><strong>Board Foot Formula:</strong> (T" × W" × L') ÷ 12</p>
          <p className="mt-1">Example: 2×6 × 10 ft = (1.5 × 5.5 × 10) / 12 = 6.875 BF</p>
          <p className="mt-1">Lumber is sold by the BF for large orders, or per piece at retail.</p>
        </div>
      </Card>
    </div>
  );
}

// Lumber Order Estimator
function LumberOrderCalc() {
  const [entries, setEntries] = useState<
    { size: string; pieces: number; lengthFt: number; id: number }[]
  >([
    { id: 1, size: '2x4',  pieces: 100, lengthFt: 8 },
    { id: 2, size: '2x6',  pieces: 50,  lengthFt: 10 },
    { id: 3, size: '2x8',  pieces: 30,  lengthFt: 12 },
  ]);
  const [nextId, setNextId] = useState(4);

  const sizeMap: Record<string, {t: number; w: number}> = {
    '2x4':  {t: 1.5, w: 3.5},
    '2x6':  {t: 1.5, w: 5.5},
    '2x8':  {t: 1.5, w: 7.25},
    '2x10': {t: 1.5, w: 9.25},
    '2x12': {t: 1.5, w: 11.25},
    '4x4':  {t: 3.5, w: 3.5},
    '4x6':  {t: 3.5, w: 5.5},
    '6x6':  {t: 5.5, w: 5.5},
  };

  const rows = useMemo(() => entries.map(e => {
    const dim = sizeMap[e.size] ?? {t: 1.5, w: 3.5};
    const bf  = calcBoardFeet(dim.t, dim.w, e.lengthFt, e.pieces);
    const price = LUMBER_PRICES[e.size] ?? 0.8;
    return { ...e, bf, cost: round2(bf * price) };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [entries]);

  const totalBF   = round2(rows.reduce((s, r) => s + r.bf, 0));
  const totalCost = round2(rows.reduce((s, r) => s + r.cost, 0));

  const addRow = () => {
    setEntries(prev => [...prev, { id: nextId, size: '2x4', pieces: 10, lengthFt: 8 }]);
    setNextId(n => n + 1);
  };

  const updateRow = (id: number, field: string, val: string | number) => {
    setEntries(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  };

  const removeRow = (id: number) => setEntries(prev => prev.filter(r => r.id !== id));

  return (
    <div className="space-y-4">
      <Card title="Lumber Take-Off Sheet">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Size</th>
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Pieces</th>
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Length</th>
                <th className="text-right py-2 px-2 text-slate-600 font-medium">BF</th>
                <th className="text-right py-2 px-2 text-slate-600 font-medium">Est. Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="py-1.5 px-2">
                    <select
                      value={r.size}
                      onChange={e => updateRow(r.id, 'size', e.target.value)}
                      className="border border-slate-300 rounded px-1.5 py-1 text-xs w-20 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    >
                      {Object.keys(sizeMap).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5 px-2">
                    <input type="number" value={r.pieces} min={1}
                      onChange={e => updateRow(r.id, 'pieces', parseInt(e.target.value) || 1)}
                      className="border border-slate-300 rounded px-1.5 py-1 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </td>
                  <td className="py-1.5 px-2">
                    <input type="number" value={r.lengthFt} min={1}
                      onChange={e => updateRow(r.id, 'lengthFt', parseFloat(e.target.value) || 8)}
                      className="border border-slate-300 rounded px-1.5 py-1 text-xs w-16 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                    <span className="text-xs text-slate-400 ml-1">ft</span>
                  </td>
                  <td className="py-1.5 px-2 text-right font-medium text-slate-700">{r.bf}</td>
                  <td className="py-1.5 px-2 text-right text-green-600">${r.cost.toLocaleString()}</td>
                  <td className="py-1.5 px-2">
                    <button onClick={() => removeRow(r.id)}
                      className="text-slate-300 hover:text-red-400 transition-colors">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-amber-50">
                <td colSpan={3} className="py-2 px-2 font-bold text-slate-800">TOTAL</td>
                <td className="py-2 px-2 text-right font-bold text-slate-800">{totalBF} BF</td>
                <td className="py-2 px-2 text-right font-bold text-amber-700">${totalCost.toLocaleString()}</td>
                <td/>
              </tr>
            </tfoot>
          </table>
        </div>
        <button onClick={addRow}
          className="mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium">
          + Add Row
        </button>
        <p className="text-xs text-slate-400 mt-2">Prices are rough estimates — verify with your supplier.</p>
      </Card>
    </div>
  );
}

// Beam / LVL Guide
function BeamGuide() {
  return (
    <Card title="Beam & LVL Span Guide" subtitle="Simplified sizing reference — always verify with engineer">
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Beam</th>
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Max Span (W=12')</th>
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Max Span (W=16')</th>
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { beam: '(2) 2×8',      s12: "8'",    s16: "7'",    note: 'TJI header, small spans' },
                { beam: '(2) 2×10',     s12: "10'",   s16: "9'",    note: 'Common floor beam' },
                { beam: '(2) 2×12',     s12: "12'",   s16: "10'",   note: 'Heavy floor/header' },
                { beam: '3.5"×9.25" LVL', s12: "14'", s16: "12'",  note: 'LVL — superior to 2× lumber' },
                { beam: '3.5"×11.25" LVL',s12: "17'", s16: "14'",  note: 'Very common LVL size' },
                { beam: '3.5"×14" LVL',  s12: "20'",  s16: "17'",  note: 'Large span — ridge beams' },
                { beam: '5.25"×11.25" LVL',s12: "22'",s16: "18'",  note: '5" wide LVL' },
                { beam: 'PSL / Glulam',  s12: '25+',  s16: '20+',  note: 'Engineered beam — consult manufacturer' },
              ].map(r => (
                <tr key={r.beam} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-1.5 px-2 font-medium text-slate-700">{r.beam}</td>
                  <td className="py-1.5 px-2 text-center text-slate-600">{r.s12}</td>
                  <td className="py-1.5 px-2 text-center text-slate-600">{r.s16}</td>
                  <td className="py-1.5 px-2 text-slate-400">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <strong>Note:</strong> Spans shown are approximate for residential floor dead load (10 psf) +
          live load (40 psf), W = tributary width supported. Always consult IRC Appendix A or a
          structural engineer for critical beams, long spans, or unusual loads.
        </div>
      </div>
    </Card>
  );
}

export function LumberCalc() {
  const [tab, setTab] = useState('bf');
  return (
    <div className="space-y-5">
      <InfoBox title="Understanding Lumber: Board Feet & Nominal Sizes" variant="blue" collapsible>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
          <div>
            <p className="font-semibold mb-1">What is a Board Foot?</p>
            <p>A board foot (BF) is a <strong>volume measurement</strong> for lumber: 1 foot long × 1 foot wide × 1 inch thick. Contractors order large quantities in board feet because it accounts for different thicknesses and widths in a single number.</p>
            <p className="mt-1">At Home Depot you buy lumber by the piece. On a job site, you order by board feet.</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Why is a "2×4" not actually 2"×4"?</p>
            <p>Lumber is named by its <strong>rough-sawn (nominal) size</strong> before it&apos;s dried and planed smooth. That process removes about ½ inch from each side. So a "2×4" is only 1.5" × 3.5" when you buy it — always use the <strong>actual dimensions</strong> when calculating.</p>
          </div>
        </div>
      </InfoBox>
      <PriceIndexBanner seriesKeys={LUMBER_SERIES} title="Lumber Market Price Trends" />
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'bf'    && <BoardFeetCalc />}
      {tab === 'order' && <LumberOrderCalc />}
      {tab === 'beam'  && <BeamGuide />}
    </div>
  );
}

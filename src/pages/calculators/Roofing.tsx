import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox } from '../../components/ui/InfoBox';
import { calcRoofPitch } from '../../utils/calculations';
import { PITCH_REFERENCE } from '../../data/referenceData';

const TABS = [
  { id: 'pitch',     label: 'Pitch & Rafters', icon: '△' },
  { id: 'materials', label: 'Materials',        icon: '📦' },
  { id: 'ref',       label: 'Quick Reference',  icon: '📋' },
];

// ─── Pitch & Rafter Calculator ─────────────────────────────────────────────────
function PitchCalc() {
  const [buildingWidth,  setWidth]    = useState('28');
  const [buildingLength, setLength]   = useState('40');
  const [pitchRise,      setPitch]    = useState('6');
  const [overhangIn,     setOverhang] = useState('12');
  const [shingleType,    setShingle]  = useState<'3tab'|'arch30'|'arch50'|'metal'>('arch30');

  const result = useMemo(() => calcRoofPitch(
    parseFloat(pitchRise) || 6,
    parseFloat(buildingWidth) || 28,
    parseFloat(buildingLength) || 40,
    parseFloat(overhangIn) || 12,
    (shingleType === 'metal' ? 'arch30' : shingleType) as '3tab'|'arch30'|'arch50'
  ), [pitchRise, buildingWidth, buildingLength, overhangIn, shingleType]);

  const pitchNum = parseFloat(pitchRise) || 6;
  const pitchDescription = pitchNum <= 3 ? 'Very low slope — almost flat. Common on additions and sheds.' :
    pitchNum <= 5 ? 'Low slope — gentle pitch. Easy to walk on, good for ranch-style homes.' :
    pitchNum <= 8 ? 'Standard slope — the most common for homes. Good balance of looks and drainage.' :
    pitchNum <= 12 ? 'Steep slope — dramatic look, sheds snow well. Harder to work on safely.' :
    'Very steep — requires special equipment. Mostly decorative peaks.';

  return (
    <div className="space-y-5">
      <InfoBox title="🏠 What is Roof Pitch? (and why does it matter?)" variant="blue" collapsible>
        <p>Roof pitch describes <strong>how steep your roof is</strong>. It's written as two numbers like <strong>6:12</strong>, which means "for every 12 inches you go sideways, the roof rises 6 inches up."</p>
        <p>Pitch affects three big things: <strong>how water and snow drain off</strong>, <strong>how much material you need</strong> (steeper = more surface area), and <strong>whether a roofer can walk on it safely</strong>.</p>
        <p>Most American homes have a pitch between <strong>4:12 and 8:12</strong>. If you don't know your pitch, a roofer can measure it — or you can look it up on your home's blueprints.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {[['2:12','Almost flat'],['4:12','Gentle slope'],['6:12','Standard'],['12:12','Very steep (45°)']].map(([p,d])=>(
            <div key={p} className="bg-white rounded p-2 text-center border border-blue-200">
              <div className="font-bold text-blue-800 text-sm">{p}</div>
              <div className="text-xs text-slate-500">{d}</div>
            </div>
          ))}
        </div>
      </InfoBox>

    <div className="grid lg:grid-cols-2 gap-6">
      {/* Inputs */}
      <Card title="Inputs" subtitle="Simple gable or hip roof">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Building Width" value={buildingWidth}  onChange={setWidth}    unit="ft" />
            <InputField label="Building Length" value={buildingLength} onChange={setLength}   unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField
              label="Roof Pitch" value={pitchRise} onChange={setPitch}
              unit=":12" min={1} max={24} step={1}
              hint={`For every 12" sideways, roof rises ${pitchRise}". Most homes: 4–8. ${pitchDescription}`}
            />
            <InputField
              label="Overhang" value={overhangIn} onChange={setOverhang}
              unit="in" min={0} step={1}
              hint="How far roof extends past the wall (typically 12–18 inches)"
            />
          </div>
          <SelectField label="Roofing Type" value={shingleType}
            onChange={v => setShingle(v as typeof shingleType)}
            options={[
              { value: '3tab',   label: '3-Tab — budget shingle, 20-25 yr life' },
              { value: 'arch30', label: 'Architectural — popular choice, 30 yr warranty' },
              { value: 'arch50', label: 'Architectural Premium — best shingle, 50 yr warranty' },
              { value: 'metal',  label: '🏗️ Standing Seam Metal — lasts 50+ yrs, sheds snow' },
            ]}
          />
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <Card title="Pitch Details">
          <div className="grid grid-cols-3 gap-3">
            <ResultCard label="Pitch Ratio"    value={`${pitchRise}:12`}               highlight />
            <ResultCard label="Angle"          value={`${result.pitchAngle}°`}         />
            <ResultCard label="Area Multiplier" value={result.pitchMultiplier}          note="applied to flat footprint" />
          </div>
          <div className="mt-3">
            <ResultCard label="Rafter Length (per side)" value={`${result.rafterLength} ft`} />
          </div>
        </Card>

        <Card title="Roof Area">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Roof Surface Area"  value={result.roofAreaSqFt.toLocaleString()} unit="sq ft"  highlight />
            <ResultCard label="Squares (for ordering)" value={result.squares}                   unit="squares" />
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-700">
            <strong>What is a square?</strong> Roofers measure material in "squares" — 1 square = 100 sq ft of roofing.
            So if your roof is {result.roofAreaSqFt.toLocaleString()} sq ft, you need {result.squares} squares of shingles.
          </div>
        </Card>

        {/* SVG pitch diagram */}
        <Card title="Interactive Pitch Diagram">
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 200 120" className="w-48 flex-shrink-0">
              {/* Baseline */}
              <line x1="20" y1="95" x2="150" y2="95" stroke="#94a3b8" strokeWidth="2"/>
              {/* Vertical */}
              <line x1="150" y1="95" x2="150" y2={95 - Math.min(parseFloat(pitchRise)||6, 18) * 4}
                stroke="#94a3b8" strokeWidth="2" strokeDasharray="4,2"/>
              {/* Rafter line */}
              <line x1="20" y1="95" x2="150" y2={95 - Math.min(parseFloat(pitchRise)||6, 18) * 4}
                stroke="#f59e0b" strokeWidth="3"/>
              {/* Dimension labels */}
              <text x="85" y="108" textAnchor="middle" fontSize="11" fill="#64748b">12"</text>
              <text x="162" y={95 - Math.min(parseFloat(pitchRise)||6, 18) * 2} fontSize="11" fill="#64748b">{pitchRise}"</text>
              {/* Pitch label */}
              <text x="60" y={80 - Math.min(parseFloat(pitchRise)||6, 18) * 2}
                fontSize="12" fontWeight="bold" fill="#f59e0b">{pitchRise}:12</text>
            </svg>
            <div className="text-xs text-slate-500 space-y-2">
              <div><strong className="text-slate-700">Walkable:</strong> {result.pitchAngle < 30 ? '✅ Yes — contractor can walk roof' : '⚠️ Too steep to walk — roof jacks or scaffold needed'}</div>
              <div><strong className="text-slate-700">Area factor:</strong> ×{result.pitchMultiplier} <span className="text-slate-400">(slope adds {Math.round((result.pitchMultiplier - 1) * 100)}% more material vs flat)</span></div>
              <div><strong className="text-slate-700">Angle:</strong> {result.pitchAngle}°</div>
              <div className="text-slate-400">
                {PITCH_REFERENCE.find(p => p.pitch === `${pitchRise}:12`)?.note || ''}
              </div>
            </div>
          </div>
        </Card>
        {parseFloat(pitchRise) <= 6 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>❄️ Low-slope snow note:</strong> Pitches ≤6:12 retain significant snow.
            In Zone 5/6, verify rafter sizing with a structural engineer —
            ground snow loads can exceed 40 PSF on shallow roofs.
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

// ─── Materials Calculator ─────────────────────────────────────────────────────
function MaterialsCalc() {
  const [buildingWidth,  setWidth]    = useState('28');
  const [buildingLength, setLength]   = useState('40');
  const [pitchRise,      setPitch]    = useState('6');
  const [overhangIn,     setOverhang] = useState('12');
  const [shingleType,    setShingle]  = useState<'3tab'|'arch30'|'arch50'|'metal'>('arch30');

  const isMetalRoof = shingleType === 'metal';
  const result = useMemo(() => calcRoofPitch(
    parseFloat(pitchRise) || 6,
    parseFloat(buildingWidth) || 28,
    parseFloat(buildingLength) || 40,
    parseFloat(overhangIn) || 12,
    (shingleType === 'metal' ? 'arch50' : shingleType) as '3tab'|'arch30'|'arch50'
  ), [pitchRise, buildingWidth, buildingLength, overhangIn, shingleType]);

  const shingleBundles = shingleType === 'arch30' ? result.shingleBundlesArch :
    shingleType === 'arch50' ? result.shingleBundlesArch : result.shingleBundles3Tab;

  // Rough costs — metal: ~$250/sq panels; shingles: ~$45/bundle
  const metalPanelCost   = Math.round(result.squares * 250);
  const shingleCost      = Math.round(shingleBundles * 45);
  const underlaymentCost = Math.round(result.underlaymentRolls * 32);
  const deckingCost      = Math.round(result.deckingSheets * 24);
  const ridgeCost        = isMetalRoof ? Math.round(result.ridgeCapLF * 18) : Math.round(result.ridgeCapLF * 2.5);
  const totalMaterial    = (isMetalRoof ? metalPanelCost : shingleCost) + underlaymentCost + deckingCost + ridgeCost;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Building Width"  value={buildingWidth}  onChange={setWidth}  unit="ft" />
            <InputField label="Building Length" value={buildingLength} onChange={setLength} unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Pitch" value={pitchRise}  onChange={setPitch}    unit=":12" min={1} max={24} step={1} />
            <InputField label="Overhang" value={overhangIn} onChange={setOverhang} unit="in" />
          </div>
          <SelectField label="Roofing Type" value={shingleType}
            onChange={v => setShingle(v as typeof shingleType)}
            options={[
              { value: '3tab',   label: '3-Tab Shingles' },
              { value: 'arch30', label: 'Architectural 30-Year' },
              { value: 'arch50', label: 'Architectural 50-Year' },
              { value: 'metal',  label: '🏗️ Standing Seam Metal (snow country)' },
            ]}
          />
        </div>
      </Card>

      <div className="space-y-4">
        <Card title="Material List">
          <div className="space-y-2">
            {(isMetalRoof ? [
              { label: '🏗️ Metal Panels (24ga standing seam)', value: `${result.squares.toFixed(1)} squares`, note: '~$250/sq · material only', cost: metalPanelCost },
              { label: '📜 Synthetic Underlayment',          value: `${result.underlaymentRolls} rolls`,     note: '400 SF per roll', cost: underlaymentCost },
              { label: '🟫 Roof Decking (4×8 OSB)',          value: `${result.deckingSheets} sheets`,        note: '32 SF per sheet', cost: deckingCost },
              { label: '➡️ Metal Ridge Cap',                 value: `${result.ridgeCapLF} LF`,              note: '~$18/LF matching cap', cost: ridgeCost },
              { label: '📏 Z-Flashing / Drip Edge',          value: `${result.dripEdgeLF} LF`,              note: 'Metal trim', cost: Math.round(result.dripEdgeLF * 1.5) },
            ] : [
              { label: shingleType === '3tab' ? '🏠 3-Tab Shingles' : '🏠 Architectural Shingles', value: `${shingleBundles} bundles`, note: `${result.squares} squares + 10% waste`, cost: shingleCost },
              { label: '📜 Underlayment (synthetic)',        value: `${result.underlaymentRolls} rolls`,     note: '400 SF per roll', cost: underlaymentCost },
              { label: '🟫 Roof Decking (4×8 OSB)',          value: `${result.deckingSheets} sheets`,        note: '32 SF per sheet', cost: deckingCost },
              { label: '➡️ Ridge Cap',                       value: `${result.ridgeCapLF} LF`,              note: 'Ridge shingles', cost: ridgeCost },
              { label: '📏 Drip Edge',                       value: `${result.dripEdgeLF} LF`,              note: 'Metal drip edge', cost: Math.round(result.dripEdgeLF * 1.5) },
              { label: '▬ Starter Strip',                    value: `${result.starterStripLF} LF`,          note: 'Along eaves', cost: Math.round(result.starterStripLF * 1.5) },
            ]).map(m => (
              <div key={m.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-slate-800">{m.label}</div>
                  <div className="text-xs text-slate-400">{m.note}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-slate-800 text-sm">{m.value}</div>
                  <div className="text-xs text-green-600">~${m.cost.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Summary">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Total Squares"     value={result.squares}          unit="squares" />
            <ResultCard label="Estimated Material" value={`$${totalMaterial.toLocaleString()}`} unit="(material only)" highlight />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Add $150–300/square for labor (tear-off + install). Complex roofs cost more.
          </p>
        </Card>
      </div>
    </div>
  );
}

// ─── Quick Reference Tab ──────────────────────────────────────────────────────
function PitchReference() {
  return (
    <Card title="Roof Pitch Quick Reference">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 text-slate-600 font-medium">Pitch</th>
              <th className="text-left py-2 px-3 text-slate-600 font-medium">Angle</th>
              <th className="text-left py-2 px-3 text-slate-600 font-medium">Multiplier</th>
              <th className="text-left py-2 px-3 text-slate-600 font-medium">Walkable</th>
              <th className="text-left py-2 px-3 text-slate-600 font-medium hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody>
            {PITCH_REFERENCE.map(p => (
              <tr key={p.pitch} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-2 px-3 font-bold text-amber-600">{p.pitch}</td>
                <td className="py-2 px-3 text-slate-700">{p.angleDeg}°</td>
                <td className="py-2 px-3 text-slate-700">{p.multiplier.toFixed(3)}</td>
                <td className="py-2 px-3">{p.walkable ? '✅' : '⚠️'}</td>
                <td className="py-2 px-3 text-slate-400 text-xs hidden md:table-cell">{p.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <strong>Minimum slopes:</strong> Asphalt shingles: 3:12 min (2:12 with special underlayment).
          Metal standing seam: 1:12. EPDM/TPO membrane: 1/8:12 (nearly flat).
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
          <strong>Snow loads:</strong> Steeper pitches shed snow better. In heavy-snow areas,
          consult a structural engineer — loads can exceed 40 psf for 6:12 or less.
        </div>
      </div>
    </Card>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Roofing() {
  const [tab, setTab] = useState('pitch');
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'pitch'     && <PitchCalc />}
      {tab === 'materials' && <MaterialsCalc />}
      {tab === 'ref'       && <PitchReference />}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { ToggleField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { calcWallFraming, calcFloorJoists, calcRafters, boardFeet, round2 } from '../../utils/calculations';
import { HEADER_SIZES } from '../../data/referenceData';

const TABS = [
  { id: 'wall',    label: 'Wall Framing', icon: '▦' },
  { id: 'floor',   label: 'Floor Joists', icon: '≡' },
  { id: 'rafters', label: 'Roof Rafters', icon: '△' },
  { id: 'headers', label: 'Headers',      icon: '▭' },
  { id: 'sheath',  label: 'Sheathing',    icon: '▪' },
];

// ─── Wall Framing ─────────────────────────────────────────────────────────────
function WallFraming() {
  const [wallLen,   setWallLen]   = useState('40');
  const [wallHt,    setWallHt]    = useState('9');
  const [spacing,   setSpacing]   = useState('16');
  const [doors,     setDoors]     = useState('2');
  const [windows,   setWindows]   = useState('4');
  const [isCorner,  setIsCorner]  = useState(false);
  const [lumber,    setLumber]    = useState('2x4');

  const lumberWidthIn = lumber === '2x4' ? 3.5 : 5.5;

  const result = useMemo(() => calcWallFraming(
    parseFloat(wallLen) || 0,
    parseFloat(wallHt)  || 0,
    parseInt(spacing)   || 16,
    parseInt(doors)     || 0,
    parseInt(windows)   || 0,
    isCorner,
    lumberWidthIn
  ), [wallLen, wallHt, spacing, doors, windows, isCorner, lumberWidthIn]);

  // Board-foot breakdowns — now directly from result (calcWallFraming uses correct width)
  const studsBF  = round2(boardFeet(1.5, lumberWidthIn, parseFloat(wallHt) || 0, result.studs));
  const platesBF = round2(boardFeet(1.5, lumberWidthIn, parseFloat(wallLen) || 0, 3));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Single wall section">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Wall Length"  value={wallLen}  onChange={setWallLen}  unit="ft" min={0} />
            <InputField label="Wall Height"  value={wallHt}   onChange={setWallHt}   unit="ft" min={0}
              hint="Typically 8, 9, or 10 ft" />
          </div>
          <SelectField label="Stud Spacing" value={spacing} onChange={setSpacing}
            options={[
              { value: 12, label: '12" OC (structural/heavy load)' },
              { value: 16, label: '16" OC (standard residential)' },
              { value: 24, label: '24" OC (advanced framing/value engineering)' },
            ]}
          />
          <SelectField label="Lumber Size" value={lumber} onChange={setLumber}
            options={[
              { value: '2x4', label: '2×4 (standard interior/exterior)' },
              { value: '2x6', label: '2×6 (exterior wall, better insulation)' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Door Openings" value={doors}   onChange={setDoors}   step={1} min={0} />
            <InputField label="Window Openings" value={windows} onChange={setWindows} step={1} min={0} />
          </div>
          <ToggleField label="Has Exterior Corner" checked={isCorner} onChange={setIsCorner}
            hint="Adds 3-stud corner package" />
        </div>
      </Card>

      <div className="space-y-4">
        <Card title="Stud Count">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Total Studs"     value={result.studs}         highlight />
            <ResultCard label="Board Feet (studs)" value={studsBF}           unit="BF" />
          </div>
          <div className="mt-3 text-xs text-slate-500 space-y-0.5">
            <div>Field studs: {Math.ceil((parseFloat(wallLen)||0) / (parseInt(spacing)||16) * 12) + 1}</div>
            <div>Opening studs (trimmers + kings): {(parseInt(doors)||0 + parseInt(windows)||0) * 4}</div>
            {isCorner && <div>Corner studs: 3</div>}
          </div>
        </Card>

        <Card title="Plates & Lumber">
          <div className="grid grid-cols-3 gap-3">
            <ResultCard label="Top Plates (2)" value={result.topPlatesLF}   unit="LF" small />
            <ResultCard label="Bottom Plate"  value={result.bottomPlateLF} unit="LF" small />
            <ResultCard label="Total Plates"  value={result.totalPlateLF}  unit="LF" small />
          </div>
          <div className="mt-3">
            <ResultCard label="Total Lumber (studs + plates)" value={round2(studsBF + platesBF)} unit="Board Feet" highlight />
          </div>
        </Card>

        <Card>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Quick rule:</strong> For 16" OC walls, count 1 stud per linear foot + 10% for waste.
            For 24" OC (advanced framing), count 0.75 studs/LF — saves ~15% on lumber costs.
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Floor Joists ─────────────────────────────────────────────────────────────
function FloorJoistCalc() {
  const [span,    setSpan]    = useState('14');
  const [roomLen, setRoomLen] = useState('24');
  const [spacing, setSpacing] = useState('16');
  const [size,    setSize]    = useState('2x10');

  const result = useMemo(() => calcFloorJoists(
    parseFloat(span) || 0,
    parseFloat(roomLen) || 0,
    parseInt(spacing) || 16
  ), [span, roomLen, spacing]);

  const widthIn = { '2x6': 5.5, '2x8': 7.25, '2x10': 9.25, '2x12': 11.25 }[size] ?? 9.25;
  const totalBF = round2(boardFeet(1.5, widthIn, parseFloat(span) || 0, result.count));
  const rimBF   = round2(boardFeet(1.5, widthIn, result.rimBoardLF));
  const bridging = Math.ceil(result.count * 2); // 2 rows per bay typically

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs">
        <div className="space-y-4">
          <InputField label="Joist Span (clear span)" value={span} onChange={setSpan} unit="ft"
            hint="Horizontal distance between bearing points (beams, walls)" />
          <InputField label="Room Length" value={roomLen} onChange={setRoomLen} unit="ft"
            hint="Length parallel to joists (determines joist count)" />
          <SelectField label="Joist Spacing" value={spacing} onChange={setSpacing}
            options={[
              { value: 12, label: '12" OC' },
              { value: 16, label: '16" OC (standard)' },
              { value: 24, label: '24" OC' },
            ]}
          />
          <SelectField label="Joist Size" value={size} onChange={setSize}
            options={[
              { value: '2x6',  label: '2×6' },
              { value: '2x8',  label: '2×8' },
              { value: '2x10', label: '2×10 (most common)' },
              { value: '2x12', label: '2×12' },
            ]}
          />
        </div>
      </Card>

      <div className="space-y-4">
        <Card title="Results">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Joist Count"    value={result.count}      highlight />
            <ResultCard label="Total Joist LF" value={result.totalLF}    unit="LF" />
            <ResultCard label="Rim Board LF"   value={result.rimBoardLF} unit="LF" small />
            <ResultCard label="Bridging Sets"  value={bridging}          unit="pieces" small />
          </div>
        </Card>
        <Card title="Board Feet">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Joists BF"  value={totalBF} unit="BF" highlight />
            <ResultCard label="Rim BF"     value={rimBF}   unit="BF" />
          </div>
        </Card>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Max Spans at this spacing (SYP #2):</p>
          <div className="text-xs text-slate-500 space-y-1">
            <div>2×8 @ 16" OC: 11'–7" max</div>
            <div>2×10 @ 16" OC: 14'–9" max</div>
            <div>2×12 @ 16" OC: 17'–11" max</div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Verify with IRC Table R502.3.1</p>
        </div>
      </div>
    </div>
  );
}

// ─── Roof Rafters ─────────────────────────────────────────────────────────────
function RafterCalc() {
  const [width,    setWidth]    = useState('28');
  const [length,   setLength]   = useState('40');
  const [pitch,    setPitch]    = useState('6');
  const [overhang, setOverhang] = useState('12');
  const [spacing,  setSpacing]  = useState('24');

  const result = useMemo(() => calcRafters(
    parseFloat(width) || 0,
    parseFloat(length) || 0,
    parseFloat(pitch) || 6,
    parseFloat(overhang) || 12,
    parseInt(spacing) || 24
  ), [width, length, pitch, overhang, spacing]);

  const angleDeg = (Math.atan(parseFloat(pitch) / 12) * 180 / Math.PI).toFixed(1);
  const multiplier = (Math.sqrt(parseFloat(pitch) ** 2 + 144) / 12).toFixed(3);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Simple gable roof">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Building Width" value={width}    onChange={setWidth}    unit="ft" />
            <InputField label="Building Length" value={length}  onChange={setLength}   unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Roof Pitch (rise)" value={pitch} onChange={setPitch}
              unit="/12" min={1} max={24} step={1}
              hint="Rise in inches per 12 inches of run" />
            <InputField label="Overhang" value={overhang} onChange={setOverhang} unit="in"
              hint="Typical: 12–24 inches" />
          </div>
          <SelectField label="Rafter Spacing" value={spacing} onChange={setSpacing}
            options={[
              { value: 12, label: '12" OC' },
              { value: 16, label: '16" OC' },
              { value: 24, label: '24" OC (standard with trusses)' },
            ]}
          />
        </div>
      </Card>

      <div className="space-y-4">
        <Card title="Pitch Info">
          <div className="grid grid-cols-3 gap-3">
            <ResultCard label="Pitch"       value={`${pitch}:12`}  />
            <ResultCard label="Angle"       value={`${angleDeg}°`} />
            <ResultCard label="Multiplier"  value={multiplier}     />
          </div>
        </Card>
        <Card title="Rafter Results">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Rafter Length" value={result.rafterLength} unit="ft" highlight />
            <ResultCard label="Total Rafters" value={result.studs}        unit="pcs" />
            <ResultCard label="Ridge Board"   value={result.ridgeLF}      unit="LF" small />
            <ResultCard label="Lumber BF"     value={result.boardFeet}    unit="BF" small />
          </div>
        </Card>

        {/* Visual pitch diagram */}
        <Card title="Pitch Diagram">
          <svg viewBox="0 0 220 110" className="w-full max-h-28">
            <line x1="10" y1="90" x2="130" y2="90" stroke="#94a3b8" strokeWidth="2"/>
            <line x1="130" y1="90" x2="130" y2={90 - parseFloat(pitch) * 6}
              stroke="#94a3b8" strokeWidth="2"/>
            <line x1="10" y1="90" x2="130" y2={90 - parseFloat(pitch) * 6}
              stroke="#f59e0b" strokeWidth="3"/>
            <text x="70" y="105" textAnchor="middle" fontSize="10" fill="#64748b">12"</text>
            <text x="143" y={90 - (parseFloat(pitch) * 3)} fontSize="10" fill="#64748b">{pitch}"</text>
            <text x="55" y={78 - parseFloat(pitch) * 2} fontSize="10" fill="#f59e0b">rafter</text>
          </svg>
        </Card>
      </div>
    </div>
  );
}

// ─── Headers Tab ──────────────────────────────────────────────────────────────
function HeadersCalc() {
  const [openingWidth, setOpening] = useState('4');

  const openingFt = parseFloat(openingWidth) || 0;
  const match = HEADER_SIZES.find(h => openingFt <= h.maxOpeningFt);
  const recommended = match ?? HEADER_SIZES[HEADER_SIZES.length - 1];

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Find Header Size" subtitle="Load-bearing wall openings (IRC Table R602.7)">
        <div className="space-y-4">
          <InputField
            label="Opening Width (rough opening)"
            value={openingWidth}
            onChange={setOpening}
            unit="ft"
            min={1}
            max={20}
            step={0.5}
            hint="Measure the clear span between trimmers"
          />

          {recommended && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
              <div className="text-sm font-semibold text-amber-800 mb-2">
                Recommended Header for {openingFt} ft opening:
              </div>
              <div className="text-2xl font-bold text-amber-700 mb-1">{recommended.twoBySize}</div>
              <div className="text-sm text-amber-600">{recommended.lvlNote}</div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Important:</strong> These are general guidelines for 1-story, standard loading.
            Always consult IRC Table R602.7 or a structural engineer for 2-story walls, ridge beams,
            or unusual loads.
          </div>
        </div>
      </Card>

      <Card title="Full Header Size Table" subtitle="IRC R602.7 — 1-story load-bearing walls">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Max Opening</th>
                <th className="text-left py-2 px-2 text-slate-600 font-medium">Lumber Header</th>
                <th className="text-left py-2 px-2 text-slate-600 font-medium">LVL Option</th>
              </tr>
            </thead>
            <tbody>
              {HEADER_SIZES.map(h => (
                <tr key={h.maxOpeningFt}
                  className={`border-b border-slate-100 ${openingFt <= h.maxOpeningFt && openingFt > (HEADER_SIZES[HEADER_SIZES.indexOf(h)-1]?.maxOpeningFt ?? 0)
                    ? 'bg-amber-50' : ''}`}>
                  <td className="py-1.5 px-2 font-medium text-slate-700">≤ {h.maxOpeningFt}'</td>
                  <td className="py-1.5 px-2 text-slate-600">{h.twoBySize}</td>
                  <td className="py-1.5 px-2 text-slate-500">{h.lvlNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Sheathing Tab ────────────────────────────────────────────────────────────
function SheathingCalc() {
  const [wallLen,  setWallLen]  = useState('120');
  const [wallHt,   setWallHt]  = useState('9');
  const [doors,    setDoors]   = useState('2');
  const [windows,  setWindows] = useState('6');
  const [waste,    setWaste]   = useState('10');

  const grossArea = useMemo(() => (parseFloat(wallLen)||0) * (parseFloat(wallHt)||0), [wallLen, wallHt]);
  const openingArea = useMemo(() =>
    (parseInt(doors)||0) * 21 + (parseInt(windows)||0) * 15,
    [doors, windows]);
  const netArea = Math.max(0, grossArea - openingArea);
  const withWaste = netArea * (1 + (parseFloat(waste)||10)/100);
  const sheets48 = Math.ceil(withWaste / 32);  // 4×8 = 32 SF
  const sheetsCost = sheets48 * 26; // rough cost per sheet

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Wall sheathing (OSB or plywood)">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Total Wall Length" value={wallLen} onChange={setWallLen} unit="ft"
              hint="Total linear feet of all walls (perimeter)" />
            <InputField label="Wall Height" value={wallHt} onChange={setWallHt} unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Door Count" value={doors}   onChange={setDoors}   step={1} min={0} />
            <InputField label="Window Count" value={windows} onChange={setWindows} step={1} min={0} />
          </div>
          <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" min={0} />
        </div>
      </Card>
      <Card title="Results">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Gross Wall Area"  value={Math.round(grossArea)}   unit="SF" small />
          <ResultCard label="Opening Deductions" value={Math.round(openingArea)} unit="SF" small />
          <ResultCard label="Net Sheathing Area" value={Math.round(netArea)}    unit="SF" />
          <ResultCard label="With Waste"         value={Math.round(withWaste)}  unit="SF" />
        </div>
        <div className="mt-4">
          <ResultCard label="4×8 Sheets Needed" value={sheets48} unit="sheets" highlight />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Standard sheet = 4'×8' = 32 SF. Estimated rough cost: ~${sheetsCost.toLocaleString()}.
          7/16" OSB is standard; 15/32" rated sheathing for structural shear panels.
        </p>
      </Card>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function Framing() {
  const [tab, setTab] = useState('wall');
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'wall'    && <WallFraming />}
      {tab === 'floor'   && <FloorJoistCalc />}
      {tab === 'rafters' && <RafterCalc />}
      {tab === 'headers' && <HeadersCalc />}
      {tab === 'sheath'  && <SheathingCalc />}
    </div>
  );
}

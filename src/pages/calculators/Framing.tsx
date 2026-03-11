import { useState, useMemo, useCallback } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox, TermDef } from '../../components/ui/InfoBox';
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

type WallType = 'exterior' | 'bearing' | 'partition';

interface WallRow {
  id: string;
  name: string;
  type: WallType;
  len: string;
  ht: string;
  spacing: string;
  lumber: '2x4' | '2x6';
  doors: string;
  wins: string;
}

const TYPE_META: Record<WallType, { label: string; tag: string; defaultLumber: '2x4' | '2x6'; note: string }> = {
  exterior:  { label: 'Exterior',       tag: 'bg-amber-100 text-amber-800',  defaultLumber: '2x6', note: '2×6, 16″ OC — has windows & exterior doors' },
  bearing:   { label: 'Load-Bearing',   tag: 'bg-blue-100 text-blue-800',    defaultLumber: '2x4', note: '2×4, 16″ OC — carries floor/roof loads, mostly door openings' },
  partition: { label: 'Partition',      tag: 'bg-slate-100 text-slate-600',  defaultLumber: '2x4', note: '2×4, 16–24″ OC — room dividers, no structural load' },
};

let _uid = 100;
function mkId() { return String(++_uid + Date.now()); }

function makeRow(type: WallType, name = ''): WallRow {
  return { id: mkId(), name, type, len: '', ht: '9', spacing: '16', lumber: TYPE_META[type].defaultLumber, doors: '0', wins: '0' };
}

const INITIAL_ROWS: WallRow[] = [
  { id: 'r1', name: 'Exterior Walls — Floor 1',     type: 'exterior',  len: '220', ht: '9', spacing: '16', lumber: '2x6', doors: '2', wins: '12' },
  { id: 'r2', name: 'Load-Bearing Interior — Fl 1', type: 'bearing',   len: '80',  ht: '9', spacing: '16', lumber: '2x4', doors: '3', wins: '0'  },
  { id: 'r3', name: 'Partition Walls — Floor 1',    type: 'partition', len: '150', ht: '9', spacing: '16', lumber: '2x4', doors: '8', wins: '0'  },
];

function WallFraming() {
  const [rows, setRows] = useState<WallRow[]>(INITIAL_ROWS);

  const update = useCallback((id: string, patch: Partial<WallRow>) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r)), []);

  const addRow = (type: WallType) => setRows(prev => [...prev, makeRow(type)]);
  const remove = (id: string)     => setRows(prev => prev.filter(r => r.id !== id));

  const results = useMemo(() => rows.map(r => {
    const lw = r.lumber === '2x4' ? 3.5 : 5.5;
    const res = calcWallFraming(
      parseFloat(r.len) || 0, parseFloat(r.ht) || 0,
      parseInt(r.spacing) || 16, parseInt(r.doors) || 0,
      parseInt(r.wins) || 0, false, lw
    );
    const studBF  = round2(boardFeet(1.5, lw, parseFloat(r.ht) || 0, res.studs));
    const plateBF = round2(boardFeet(1.5, lw, parseFloat(r.len) || 0, 3));
    return { ...res, studBF, plateBF, totalBF: round2(studBF + plateBF) };
  }), [rows]);

  const totals = useMemo(() => rows.reduce((t, r, i) => {
    const res = results[i]!;
    t.studs += res.studs;
    if (r.lumber === '2x4') { t.platesLF_2x4 += res.totalPlateLF; t.bf_2x4 = round2(t.bf_2x4 + res.totalBF); }
    else                    { t.platesLF_2x6 += res.totalPlateLF; t.bf_2x6 = round2(t.bf_2x6 + res.totalBF); }
    return t;
  }, { studs: 0, platesLF_2x4: 0, platesLF_2x6: 0, bf_2x4: 0, bf_2x6: 0 }), [rows, results]);

  const si = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400';
  const ss = 'w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white';

  return (
    <div className="space-y-4">
      <InfoBox title="🏠 Wall Schedule — Why separate sections matter" variant="blue" collapsible>
        <p>A real house has <strong>three distinct wall types</strong> that use different lumber, heights, and opening counts. Adding them all into one number gives wrong stud counts and a useless lumber order.</p>
        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
          <li><strong>Exterior walls</strong> — 2x6, has windows and exterior doors. Add one row per floor because wall height often changes (9ft main floor → 8ft upper floors).</li>
          <li><strong>Load-bearing interior</strong> — walls that carry the floor above. Mostly door openings, no windows, need 16 in OC minimum.</li>
          <li><strong>Partition walls</strong> — non-structural room dividers. Can use 24 in OC to save ~15% on lumber. No windows.</li>
        </ul>
        <p className="mt-2">Lumber yards fill orders by size — they need your 2x4 total and 2x6 total separately. This calculator gives you both.</p>
      </InfoBox>

      {/* Wall type legend */}
      <div className="grid grid-cols-3 gap-2">
        {(Object.entries(TYPE_META) as [WallType, typeof TYPE_META[WallType]][]).map(([k, m]) => (
          <div key={k} className={`rounded-xl border p-3 text-xs ${
            k === 'exterior'  ? 'border-amber-200 bg-amber-50'  :
            k === 'bearing'   ? 'border-blue-200 bg-blue-50'    :
                                'border-slate-200 bg-slate-50'
          }`}>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.tag}`}>{m.label}</span>
            <p className="mt-1.5 text-slate-500 leading-relaxed">{m.note}</p>
          </div>
        ))}
      </div>

      {/* Wall rows */}
      <div className="space-y-3">
        {rows.map((row, i) => {
          const res = results[i]!;
          const meta = TYPE_META[row.type];
          return (
            <Card key={row.id}>
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
                <input
                  value={row.name}
                  onChange={e => update(row.id, { name: e.target.value })}
                  placeholder={`${meta.label} — give this section a name (e.g. Floor 1, Floor 2)`}
                  className="flex-1 text-sm font-medium text-slate-800 bg-transparent focus:outline-none border-b border-transparent focus:border-amber-400 pb-0.5"
                />
                <span className={`hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ${meta.tag}`}>{meta.label}</span>
                <button onClick={() => remove(row.id)}
                  className="text-slate-300 hover:text-red-400 transition-colors ml-1 text-base leading-none font-bold flex-shrink-0">×</button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Wall Type</label>
                  <select value={row.type}
                    onChange={e => {
                      const t = e.target.value as WallType;
                      update(row.id, { type: t, lumber: TYPE_META[t].defaultLumber });
                    }}
                    className={ss}>
                    <option value="exterior">Exterior</option>
                    <option value="bearing">Load-Bearing</option>
                    <option value="partition">Partition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Length (ft)</label>
                  <input type="number" value={row.len} min={0}
                    onChange={e => update(row.id, { len: e.target.value })}
                    className={si} placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Height (ft)</label>
                  <input type="number" value={row.ht} min={0}
                    onChange={e => update(row.id, { ht: e.target.value })}
                    className={si} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Lumber</label>
                  <select value={row.lumber}
                    onChange={e => update(row.id, { lumber: e.target.value as '2x4' | '2x6' })}
                    className={ss}>
                    <option value="2x4">2×4</option>
                    <option value="2x6">2×6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Spacing</label>
                  <select value={row.spacing}
                    onChange={e => update(row.id, { spacing: e.target.value })}
                    className={ss}>
                    <option value="12">12 in OC</option>
                    <option value="16">16 in OC</option>
                    <option value="24">24 in OC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Doors / Windows</label>
                  <div className="flex gap-1">
                    <input type="number" value={row.doors} min={0} step={1} title="Doors"
                      onChange={e => update(row.id, { doors: e.target.value })}
                      className={si + ' text-center'} placeholder="D" />
                    <input type="number" value={row.wins} min={0} step={1} title="Windows"
                      onChange={e => update(row.id, { wins: e.target.value })}
                      className={si + ' text-center'} placeholder="W" />
                  </div>
                </div>
              </div>

              {/* Per-section mini results */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 rounded-xl p-3 text-center">
                <div>
                  <div className="text-xl font-bold text-slate-800">{res.studs}</div>
                  <div className="text-xs text-slate-500">Studs</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800">{res.totalPlateLF}</div>
                  <div className="text-xs text-slate-500">Plates (LF)</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800">{res.studBF}</div>
                  <div className="text-xs text-slate-500">Stud BF</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-amber-600">{res.totalBF}</div>
                  <div className="text-xs text-slate-500">Total BF</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-500">Add section:</span>
        <button onClick={() => addRow('exterior')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors">
          + Exterior Wall
        </button>
        <button onClick={() => addRow('bearing')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
          + Load-Bearing Interior
        </button>
        <button onClick={() => addRow('partition')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
          + Partition Wall
        </button>
        {rows.length > 0 && (
          <button onClick={() => setRows([])}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs text-red-400 hover:bg-red-50 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Grand totals */}
      {rows.length > 0 && (
        <Card title="Project Lumber Totals" subtitle="Ready to hand to your lumber yard">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <ResultCard label="Total Studs" value={totals.studs} highlight />
            {totals.platesLF_2x4 > 0 && <ResultCard label="2x4 Plates" value={round2(totals.platesLF_2x4)} unit="LF" small />}
            {totals.platesLF_2x6 > 0 && <ResultCard label="2x6 Plates" value={round2(totals.platesLF_2x6)} unit="LF" small />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {totals.bf_2x4 > 0 && <ResultCard label="2x4 Lumber" value={totals.bf_2x4} unit="BF" />}
            {totals.bf_2x6 > 0 && <ResultCard label="2x6 Lumber" value={totals.bf_2x6} unit="BF" />}
            <ResultCard label="Total Board Feet" value={round2(totals.bf_2x4 + totals.bf_2x6)} unit="BF" highlight />
          </div>
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Order tip:</strong> Add 10% waste to each lumber size separately. Upper floor exterior 
            walls typically have no exterior doors — adjust door counts per section. Partition walls 
            can often run 24 in OC, saving ~15% on their lumber order.
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Floor Joists ─────────────────────────────────────────────────────────────
function FloorJoistCalc() {
  const [span,    setSpan]    = useState('14');
  const [roomLen, setRoomLen] = useState('24');
  const [spacing, setSpacing] = useState('16');
  const [size,    setSize]    = useState('2x10');
  const [floors,  setFloors]  = useState('1');

  const result = useMemo(() => calcFloorJoists(
    parseFloat(span) || 0,
    parseFloat(roomLen) || 0,
    parseInt(spacing) || 16
  ), [span, roomLen, spacing]);

  const floorCount  = Math.max(1, parseInt(floors) || 1);
  const widthIn     = { '2x6': 5.5, '2x8': 7.25, '2x10': 9.25, '2x12': 11.25 }[size] ?? 9.25;
  const totalBF     = round2(boardFeet(1.5, widthIn, parseFloat(span) || 0, result.count) * floorCount);
  const rimBF       = round2(boardFeet(1.5, widthIn, result.rimBoardLF) * floorCount);
  const bridging    = Math.ceil(result.count * 2) * floorCount;
  const totalJoists = result.count * floorCount;
  const totalLF     = round2(result.totalLF * floorCount);
  const totalRim    = round2(result.rimBoardLF * floorCount);

  return (
    <div className="space-y-6">
      <InfoBox title="🪵 Floor Joists — The Boards Under Every Step You Take" variant="blue" collapsible>
        <p>Floor joists are the horizontal structural members that carry your subfloor decking. They span between load-bearing walls or beams, and everything in the house — furniture, people, walls above — rests on them. The right size and spacing determine whether your floor feels rock-solid or uncomfortably springy.</p>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs mt-2">
          <TermDef term="Span" def="The clear horizontal distance between bearing points — not total joist length. A joist from wall to wall across 14 ft has a 14 ft span. Longer spans need larger lumber." />
          <TermDef term="Bearing" def="Where the joist rests and transfers its load — a wall top plate, beam flange, or ledger. Code minimum: 1½″ bearing on wood, 3″ on masonry." />
          <TermDef term="Bridging" def="Cross-bracing installed mid-span between joists — either solid 2× blocking or metal X-bridging. Prevents joists from rolling/twisting and distributes point loads (heavy appliances, posts) across multiple joists." />
          <TermDef term="Rim board / band joist" def="The perimeter joist that caps the ends of all floor joists, completing the floor box. Nailed through the rim into each joist end. Also serves as the nailing surface for exterior wall framing above." />
          <TermDef term="Engineered I-joist (TJI)" def="Factory-built joists shaped like a steel I-beam. Span farther than same-size dimensional lumber, stay straighter, and their OSB web can be drilled for plumbing and wiring without structural loss. Cost more but essential for longer spans." />
          <TermDef term="On Center (OC)" def={`Measurement from center of one joist to center of the next. 16″ OC is standard residential. Use 12″ OC for tile floors or very heavy loads.`} />
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 text-sm mt-3 gap-y-2">
          <p><strong>Tile &amp; stone floors:</strong> Require a stiffer floor (L/360 live-load deflection limit vs. L/480 for wood floors). If you're tiling, go to 12″ OC or up one joist size — flex cracks grout joints over time.</p>
          <p><strong>Pro note:</strong> Always double joists under any wall that runs parallel above. A single joist under a wall will deflect unevenly and create a hump or soft spot in the floor.</p>
        </div>
        <p className="text-xs text-slate-500 mt-2">Verify all spans with IRC Table R502.3.1. Tables assume SYP #2 or Douglas Fir #2 at normal moisture — check your local building department for species adjustments.</p>
      </InfoBox>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Inputs">
        <div className="space-y-4">
          <InputField label="Joist Span (clear span)" value={span} onChange={setSpan} unit="ft"
            hint="Horizontal distance between bearing points (beams, walls)" />
          <InputField label="Bay Length (parallel to joists)" value={roomLen} onChange={setRoomLen} unit="ft"
            hint="Length of the floor bay — determines joist count" />
          <SelectField label="Joist Spacing" value={spacing} onChange={setSpacing}
            options={[
              { value: 12, label: '12 in OC' },
              { value: 16, label: '16 in OC (standard)' },
              { value: 24, label: '24 in OC' },
            ]}
          />
          <SelectField label="Joist Size" value={size} onChange={setSize}
            options={[
              { value: '2x6',  label: '2x6' },
              { value: '2x8',  label: '2x8' },
              { value: '2x10', label: '2x10 (most common)' },
              { value: '2x12', label: '2x12' },
            ]}
          />
          <div>
            <InputField label="Number of Identical Floor Levels" value={floors} onChange={setFloors}
              unit="floors" min={1} step={1}
              hint="3-story house: enter 3 to multiply totals by 3 (if all floors use the same span and bay length)" />
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
              If floors have different spans or bay sizes, run this calculator once per floor and add the results.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card title={floorCount > 1 ? `Results — ${floorCount} Floors Combined` : 'Results'}>
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Total Joists"      value={totalJoists}  highlight />
            <ResultCard label="Total Joist LF"    value={totalLF}      unit="LF" />
            <ResultCard label="Total Rim Board LF" value={totalRim}    unit="LF" small />
            <ResultCard label="Bridging Pieces"   value={bridging}     unit="pcs" small />
          </div>
          {floorCount > 1 && (
            <div className="mt-3 text-xs text-slate-500 border-t border-slate-100 pt-3">
              Per floor: {result.count} joists / {result.totalLF} LF / {Math.ceil(result.count * 2)} bridging pcs
            </div>
          )}
        </Card>
        <Card title="Board Feet">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Joists BF" value={totalBF} unit="BF" highlight />
            <ResultCard label="Rim BF"    value={rimBF}   unit="BF" />
          </div>
        </Card>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Max Spans at 16 in OC (SYP #2):</p>
          <div className="text-xs text-slate-500 space-y-1">
            <div>2x8: 11ft 7in max</div>
            <div>2x10: 14ft 9in max</div>
            <div>2x12: 17ft 11in max</div>
          </div>
          <p className="text-xs text-slate-400 mt-2">Verify with IRC Table R502.3.1</p>
        </div>
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
  const [size,     setSize]     = useState('2x8');

  const result = useMemo(() => calcRafters(
    parseFloat(width) || 0,
    parseFloat(length) || 0,
    parseFloat(pitch) || 6,
    parseFloat(overhang) || 12,
    parseInt(spacing) || 24
  ), [width, length, pitch, overhang, spacing]);

  const angleDeg = (Math.atan(parseFloat(pitch) / 12) * 180 / Math.PI).toFixed(1);
  const multiplier = (Math.sqrt(parseFloat(pitch) ** 2 + 144) / 12).toFixed(3);
  const widthIn   = ({ '2x6': 5.5, '2x8': 7.25, '2x10': 9.25, '2x12': 11.25 } as Record<string,number>)[size] ?? 7.25;
  const rafterBF  = round2(boardFeet(1.5, widthIn, result.rafterLength, result.studs));

  return (
    <div className="space-y-6">
      <InfoBox title="🔺 Roof Rafters — How a Stick-Framed Roof Goes Up" variant="amber" collapsible>
        <p>Rafters are the sloped structural members that form the shape of your roof and carry the weight of the roof decking, felt, and shingles down to the exterior walls. <strong>Most modern homes use factory-built trusses instead of site-cut rafters</strong> — trusses are cheaper, faster, and pre-engineered. This calculator covers traditional stick-framing, which is still common for custom rooflines, additions, and shed roofs.</p>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs mt-2">
          <TermDef term="Pitch" def="Rise in inches per 12 inches of horizontal run — written as X:12. A 6:12 pitch rises 6 inches for every 12 inches of horizontal distance. Steeper = more snow sheds off, more lumber needed." />
          <TermDef term="Multiplier" def="The math factor to convert horizontal run to actual rafter length. Multiply half the building width by the multiplier to get rafter length. e.g., 6:12 pitch = 1.118× multiplier." />
          <TermDef term="Ridge board" def="The horizontal board at the roof peak that both sets of rafters nail into. It is NOT structural — it's a nailing surface only. The two opposing rafters push against each other and the ceiling joists (or rafter ties) resist the outward wall thrust." />
          <TermDef term="Ridge beam" def="A structural beam at the peak that actually supports the rafter ends. Required for cathedral ceilings (no ceiling joists). Needs posts or columns below. Sized by an engineer." />
          <TermDef term={`Birdsmouth cut`} def={`The notch cut into each rafter where it sits on the wall top plate. Consists of a plumb cut (vertical face against wall) and a seat cut (horizontal face on plate). Maximum depth: 1/3 of the rafter depth.`} />
          <TermDef term="Collar tie / Rafter tie" def="Collar tie: horizontal member connecting opposing rafters in the upper third of the roof — resists wind uplift. Rafter tie: same concept but at ceiling level (lower third) — resists the outward wall thrust caused by rafter loads. Ceiling joists serve as rafter ties in an attic." />
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 text-sm mt-3 gap-y-2">
          <p><strong>Pitch below 3:12:</strong> Do not use asphalt shingles. Low slopes require modified bitumen, TPO, EPDM, or standing seam metal. Code requires a minimum 2:12 for most roofing materials.</p>
          <p><strong>Hip &amp; valley rafters</strong> are 1.414× longer than common rafters (diagonal math). They need to be deeper by at least one size to carry the concentrated load from jack rafters framing into them.</p>
        </div>
        <p className="text-xs text-slate-500 mt-2">Verify rafter sizing with IRC Table R802.4. The pitch diagram below shows rise, run, and the rafter hypotenuse your crew will actually cut.</p>
      </InfoBox>
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
          <SelectField label="Rafter Size (lumber)" value={size} onChange={setSize}
            options={[
              { value: '2x6',  label: '2×6 — low pitch, short spans (≤ 14 ft)' },
              { value: '2x8',  label: '2×8 — medium pitch (≤ 18 ft)' },
              { value: '2x10', label: '2×10 — steeper pitch or longer spans (≤ 22 ft)' },
              { value: '2x12', label: '2×12 — large roof, high snow loads' },
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
            <ResultCard label="Lumber BF"     value={rafterBF}            unit="BF" small />
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
    </div>
  );
}

// ─── Headers Tab ──────────────────────────────────────────────────────────────
function HeadersCalc() {
  const [openingWidth, setOpening] = useState('4');
  const [count,        setCount]   = useState('1');

  const openingFt = parseFloat(openingWidth) || 0;
  const match = HEADER_SIZES.find(h => openingFt <= h.maxOpeningFt);
  const recommended   = match ?? HEADER_SIZES[HEADER_SIZES.length - 1];
  const openingCount  = Math.max(1, parseInt(count) || 1);
  // Each header = rough opening + 6 inches (3" bearing each side per IRC R602.7)
  const headerLF      = Math.round((openingFt + 0.5) * openingCount * 10) / 10;

  return (
    <div className="space-y-6">
      <InfoBox title="🚪 Headers — Why Every Opening Needs Its Own Beam" variant="blue" collapsible>
        <p>Every door and window opening in a load-bearing wall creates a gap in the stud layout — and something has to carry the floor or roof load that was sitting on those missing studs. That something is a <strong>header</strong>: a horizontal beam (typically doubled 2× lumber or LVL) that spans the opening and transfers the load to the king studs on each side.</p>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs mt-2">
          <TermDef term="King stud" def="Full-height stud on each side of an opening. The header bears on the jack studs nailed alongside the king stud. King studs run from bottom plate to top plate." />
          <TermDef term="Jack stud (trimmer)" def="Shorter stud nailed alongside the king stud that physically supports the header at each end. Its height determines the rough opening height." />
          <TermDef term="Cripple stud" def="Short studs above a header (and below a window sill) that continue the regular stud layout for sheathing backing and insulation support. They carry no structural load." />
          <TermDef term="LVL (Laminated Veneer Lumber)" def="Engineered lumber made of thin wood veneers glued under heat and pressure. Much stronger and straighter than dimensional lumber. Preferred for large openings and multi-story walls — doesn't shrink, warp, or creep over time." />
          <TermDef term="Rough opening (RO)" def="The framed opening size — always slightly larger than the window or door unit to allow shimming and leveling. Typically RO = unit size + ½″ to ¾″." />
          <TermDef term="Point load" def="A concentrated load directly above an opening from a beam, post, or ridge above. Requires an engineer to size the header correctly — the tables on this tab assume standard distributed loading only." />
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 text-sm mt-3 gap-y-2">
          <p><strong>Non-load-bearing walls:</strong> Partition walls don't carry floor or roof loads, so the header can be a single 2×4 laid flat — or even just a doubled top plate. Only load-bearing walls need structural headers.</p>
          <p><strong>When to use LVL:</strong> Any opening over 5 ft on a load-bearing wall, any second-floor wall, or anywhere you've seen dimensional lumber headers stick doors or bow windows over time. LVL is more expensive but permanent.</p>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">⚠️ The size table on this page covers <strong>1-story, standard loading only</strong>. Two-story walls, garage headers, and any wall with a point load above must be verified with IRC Table R602.7 or a structural engineer.</p>
      </InfoBox>
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
          <InputField
            label="Number of openings this size"
            value={count}
            onChange={setCount}
            unit="openings"
            min={1}
            step={1}
            hint="Same-size doors or windows — get total header lumber in one step"
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

          {openingCount > 0 && recommended && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-2">
              <div className="text-sm font-semibold text-amber-800 mb-1">Total Header Material — {openingCount} opening{openingCount !== 1 ? 's' : ''}</div>
              <div className="text-2xl font-bold text-amber-700">{headerLF} LF</div>
              <div className="text-xs text-amber-600 mt-1">{recommended.twoBySize} × {openingCount} opening{openingCount !== 1 ? 's' : ''} = {headerLF} linear feet total</div>
              <div className="text-xs text-slate-500 mt-1">Order rough lumber — your carpenter will cut to exact length. Add 10% for waste and end checks.</div>
            </div>
          )}
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
    <div className="space-y-6">
      <InfoBox title="🏗️ Wall Sheathing — The Structural Skin That Keeps Your House Square" variant="blue" collapsible>
        <p>Wall sheathing (typically OSB or plywood) is nailed to the outside face of your stud framing before any siding or housewrap goes on. It does two critical jobs: <strong>(1) creates a rigid diaphragm</strong> that resists lateral (racking) forces from wind and earthquakes, and <strong>(2) provides a continuous nailing surface</strong> for siding and exterior trim. Without sheathing, a wall frame can lean sideways — a single 40 mph wind gust can rack an unsheathed wall out of plumb permanently.</p>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs mt-2">
          <TermDef term="OSB (Oriented Strand Board)" def="The standard wall sheathing material today. Wood strands pressed and glued under heat and pressure. 'Exposure 1' rated — can get wet during construction but must be dried in before long-term exposure. Cheaper than plywood." />
          <TermDef term="CDX Plywood" def="Three or more wood veneers glued with alternating grain direction. Stronger at panel edges than OSB, holds nails better when wet, and is more tolerant of prolonged moisture. The 'X' means Exterior-grade glue. Better choice in coastal or high-humidity climates." />
          <TermDef term="Shear wall" def="A specific wall section designed and detailed to resist lateral loads. Usually shown on structural drawings with a nail schedule, hold-down hardware, and specific panel layout. More than just regular sheathing — it transfers lateral loads to the foundation." />
          <TermDef term="Nailing schedule" def="How many nails, what size, and how far apart — THIS is what transfers racking load, not just the panels. Standard: 8d common at 6″ OC panel edges, 12″ OC field. Shear walls may be 4″ OC or 3″ OC edges. Same panels, different nailing = dramatically different shear capacity." />
          <TermDef term="Rated sheathing" def="OSB or plywood stamped by APA (the engineered wood association) with a span rating, thickness, and exposure rating. Always buy rated sheathing — the stamp tells inspectors and engineers exactly what you installed." />
          <TermDef term={`H-clip / panel clip`} def={`Small metal clip that fits between panel edges at mid-span between studs. Holds the 1/8″ expansion gap and prevents edge crush without needing solid blocking at every horizontal seam.`} />
        </div>
        <div className="grid sm:grid-cols-2 gap-x-6 text-sm mt-3 gap-y-2">
          <p><strong>Leave a 1/8″ gap at all panel edges.</strong> OSB swells slightly when it absorbs moisture. Panels installed tight will buckle outward ("telephone pole" pattern) when they get wet — leave the gap and use H-clips to hold spacing.</p>
          <p><strong>Tall walls tip:</strong> 4×9 and 4×10 sheets eliminate a horizontal seam in 9 ft and 10 ft stud walls. Fewer seams = better racking performance and less labor. Costs slightly more per sheet but worth it on exterior walls.</p>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2">⚠️ This calculator covers <strong>wall sheathing only</strong>. Roof sheathing uses the same OSB/plywood but different thicknesses (7/16″ or 15/32″) — use your roofing calculator or run this twice with different waste factors.</p>
      </InfoBox>
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

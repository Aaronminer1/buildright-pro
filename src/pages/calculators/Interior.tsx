import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField, ToggleField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox } from '../../components/ui/InfoBox';
import { calcDrywall, calcPaint } from '../../utils/calculations';

const TABS = [
  { id: 'drywall', label: 'Drywall', icon: '🔲' },
  { id: 'paint',   label: 'Paint',   icon: '🖌️' },
];

function DrywallCalc() {
  const [length,  setLength]  = useState('20');
  const [width,   setWidth]   = useState('15');
  const [height,  setHeight]  = useState('9');
  const [doors,   setDoors]   = useState('1');
  const [windows, setWindows] = useState('2');
  const [ceiling, setCeiling] = useState(true);
  const [sheetW,  setSheetW]  = useState('4x8');

  const sheetSqFt = sheetW === '4x12' ? 48 : sheetW === '4x16' ? 64 : 32;

  const res = useMemo(() => calcDrywall(
    parseFloat(length)||0, parseFloat(width)||0, parseFloat(height)||0,
    parseInt(doors)||0, parseInt(windows)||0, ceiling, sheetSqFt
  ), [length, width, height, doors, windows, ceiling, sheetSqFt]);

  // Additional supplies
  const screwLbs   = Math.round(res.sheets * 0.25);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Room Dimensions" subtitle="Enter room or house measurements">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <InputField label="Length" value={length}  onChange={setLength}  unit="ft" />
            <InputField label="Width"  value={width}   onChange={setWidth}   unit="ft" />
            <InputField label="Height" value={height}  onChange={setHeight}  unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Door Openings"   value={doors}   onChange={setDoors}   unit="doors" />
            <InputField label="Window Openings" value={windows} onChange={setWindows} unit="windows" />
          </div>
          <SelectField label="Sheet Size" value={sheetW} onChange={setSheetW}
            options={[
              { value: '4x8',  label: '4×8  (32 SF) — standard' },
              { value: '4x12', label: '4×12 (48 SF) — fewer seams' },
              { value: '4x16', label: '4×16 (64 SF) — large area' },
            ]}
          />
          <ToggleField label="Include Ceiling" checked={ceiling} onChange={setCeiling} />
        </div>
      </Card>
      <div className="space-y-4">
        <Card title="Drywall Results">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label={`${sheetW} Sheets`} value={res.sheets} highlight />
            <ResultCard label={`5-gal Joint Compound ("Mud") Buckets`} value={res.jc5Gal} unit="buckets" />
            <ResultCard label="Wall Area (net)" value={res.wallArea} unit="SF" small />
            {ceiling && <ResultCard label="Ceiling Area" value={res.ceilingArea} unit="SF" small />}
            <ResultCard label="Total Area"   value={res.totalArea}  unit="SF" small />
            <ResultCard label="Drywall Tape" value={res.tapeLF} unit="LF (linear feet)" small />
          </div>
        </Card>
        <Card title="Hardware & Supplies">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Drywall Screws" value={screwLbs}   unit="lbs"  small />
            <ResultCard label="Corner Bead (LF = linear feet)" value={res.cornerBeadLF} unit="LF" small />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            1 LF corner bead per door/window edge. One 5-gal bucket covers ~200 SF.
            Add 10% for waste and overage.
          </p>
        </Card>
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
          <p>• Door deduction: 21 SF per door (3'×7' rough opening)</p>
          <p>• Window deduction: 12 SF per window (3'×4' average)</p>
          <p>• 10% waste factor already included in sheet count</p>
        </div>
      </div>
    </div>
  );
}

function PaintCalc() {
  const [length,   setLength]   = useState('20');
  const [width,    setWidth]    = useState('15');
  const [height,   setHeight]   = useState('9');
  const [doors,    setDoors]    = useState('1');
  const [windows,  setWindows]  = useState('2');
  const [coats,    setCoats]    = useState('2');
  const [coverage, setCoverage] = useState('350');
  const [ceiling,  setCeiling]  = useState(true);
  const [primer,   setPrimer]   = useState(true);

  const res = useMemo(() => calcPaint(
    parseFloat(length)||0, parseFloat(width)||0, parseFloat(height)||0,
    parseInt(doors)||0, parseInt(windows)||0,
    parseInt(coats)||2, ceiling, parseFloat(coverage)||350
  ), [length, width, height, doors, windows, coats, ceiling, coverage]);

  const wallArea    = Math.round(2 * ((parseFloat(length)||0) + (parseFloat(width)||0)) * (parseFloat(height)||0) - (parseInt(doors)||0) * 21 - (parseInt(windows)||0) * 15);
  const ceilingArea = ceiling ? Math.round((parseFloat(length)||0) * (parseFloat(width)||0)) : 0;
  const primerGals = primer ? res.primerGallons : 0;
  const totalGals  = res.totalGallons + primerGals;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Room Details">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <InputField label="Length" value={length}  onChange={setLength}  unit="ft" />
            <InputField label="Width"  value={width}   onChange={setWidth}   unit="ft" />
            <InputField label="Height" value={height}  onChange={setHeight}  unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Doors"   value={doors}   onChange={setDoors}   unit="" />
            <InputField label="Windows" value={windows} onChange={setWindows} unit="" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Number of Coats" value={coats} onChange={setCoats}
              options={[
                { value: '1', label: '1 coat' },
                { value: '2', label: '2 coats (standard)' },
                { value: '3', label: '3 coats (new construction)' },
              ]}
            />
            <SelectField label="Coverage Rate" value={coverage} onChange={setCoverage}
              options={[
                { value: '300', label: '300 SF/gal (thick paint)' },
                { value: '350', label: '350 SF/gal (standard)' },
                { value: '400', label: '400 SF/gal (thin/economy)' },
              ]}
            />
          </div>
          <div className="flex gap-6">
            <ToggleField label="Include Ceiling" checked={ceiling} onChange={setCeiling} />
            <ToggleField label="Include Primer Coat" checked={primer} onChange={setPrimer} />
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        <Card title="Paint Results">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Total Gallons" value={totalGals} highlight />
            <ResultCard label="Paint Gallons" value={res.totalGallons} unit="gal" />
            {primer && <ResultCard label="Primer Gallons" value={primerGals} unit="gal" small />}
            <ResultCard label="Paintable Area" value={wallArea + ceilingArea} unit="SF" small />
            <ResultCard label="Wall Area"     value={wallArea}    unit="SF" small />
            {ceiling && <ResultCard label="Ceiling Area" value={ceilingArea} unit="SF" small />}
          </div>
        </Card>

        <Card title="Breakdown by Quarts">
          <div className="grid grid-cols-3 gap-3">
            <ResultCard label="Walls Qts"   value={Math.ceil(res.totalGallons * 4 * (wallArea / Math.max(wallArea + ceilingArea, 1)))} small />
            {ceiling && <ResultCard label="Ceiling Qts" value={Math.ceil(res.totalGallons * 4 * (ceilingArea / Math.max(wallArea + ceilingArea, 1)))} small />}
            <ResultCard label="Primer Qts"  value={primerGals * 4} small />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Round up to nearest gallon at the store. Better to have extra than run out mid-cut.
          </p>
        </Card>
      </div>
    </div>
  );
}

export function Interior() {
  const [tab, setTab] = useState('drywall');
  return (
    <div className="space-y-5">
      <InfoBox title="Drywall & Paint: What Everything Means" variant="blue" collapsible>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div><strong>Drywall (Sheetrock)</strong> — The large flat panels (4×8 ft standard) that become your interior walls and ceilings. Made from a gypsum plaster core between two sheets of paper. Screwed to the wall framing, then finished to look smooth.</div>
          <div><strong>Joint Compound (“Mud”)</strong> — The white paste used to fill and smooth the seams (joints) between drywall sheets. Comes in 5-gallon buckets. Applied in multiple thin coats, sanded between each. One bucket covers about 200 SF.</div>
          <div><strong>Corner Bead</strong> — Metal or plastic strips installed on every <em>outside</em> corner (like the corners of window openings and doorways). They protect the edges from damage and make corners perfectly straight and sharp. Measured in <strong>LF (Linear Feet)</strong> — just length in feet.</div>
          <div><strong>Drywall Tape</strong> — Paper or mesh tape pressed into the mud over every seam to prevent cracks. The calculator figures out how many linear feet you need based on your room dimensions.</div>
          <div><strong>Primer</strong> — The first coat of paint that seals the surface and helps the finish coat stick evenly. Especially important on new drywall — skipping it shows blotchy results.</div>
          <div><strong>Coverage Rate</strong> — How many square feet one gallon of paint covers. Standard interior paint covers about 350 SF per gallon. Rough/textured surfaces absorb more, so use a lower number.</div>
        </div>
      </InfoBox>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'drywall' && <DrywallCalc />}
      {tab === 'paint'   && <PaintCalc />}
    </div>
  );
}

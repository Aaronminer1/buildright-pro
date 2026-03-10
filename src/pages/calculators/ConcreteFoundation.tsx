import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { ToggleField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import {
  calcConcreteSlab, calcContinuousFooting, calcPadFooting,
  calcFoundationWall, calcColumn, calcGravel
} from '../../utils/calculations';
import { PriceIndexBanner } from '../../components/ui/PriceIndexBanner';

const TABS = [
  { id: 'slab',   label: 'Slab',            icon: '▭' },
  { id: 'footing',label: 'Continuous Footing',icon: '⊓' },
  { id: 'pad',    label: 'Pad Footing',      icon: '◻' },
  { id: 'wall',   label: 'Foundation Wall',  icon: '▐' },
  { id: 'column', label: 'Column',           icon: '▮' },
  { id: 'gravel', label: 'Gravel / Fill',    icon: '⊙' },
];

const THICKNESS_OPTIONS = [
  { value: 3.5,  label: '3.5" (slab-on-grade, light)' },
  { value: 4,    label: '4" (standard residential slab)' },
  { value: 5,    label: '5" (heavy-use slab)' },
  { value: 6,    label: '6" (garage, driveway)' },
  { value: 8,    label: '8" (foundation wall, light)' },
  { value: 10,   label: '10" (foundation wall, standard)' },
  { value: 12,   label: '12" (foundation wall, heavy)' },
];

// Concrete cost ref ($/CY — rough 2024 averages)
const CONCRETE_SERIES = ['cement', 'ready_mix'] as const;

const CONCRETE_COST_PER_CY = 165;

// ─── Slab Tab ────────────────────────────────────────────────────────────────
function SlabCalc() {
  const [length, setLength]     = useState('20');
  const [width, setWidth]       = useState('20');
  const [thickness, setThick]   = useState('4');
  const [waste, setWaste]       = useState('10');
  const [addRebar, setAddRebar] = useState(false);
  const [rebarSpacing, setRebar]= useState('12');

  const result = useMemo(() => {
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const t = parseFloat(thickness) || 4;
    const wst = parseFloat(waste) || 10;
    return calcConcreteSlab(l, w, t, wst, addRebar, parseFloat(rebarSpacing) || 12);
  }, [length, width, thickness, waste, addRebar, rebarSpacing]);

  const estCost = (result.cubicYardsWithWaste * CONCRETE_COST_PER_CY).toFixed(0);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Enter slab dimensions">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Length" value={length} onChange={setLength} unit="ft" min={0} />
            <InputField label="Width"  value={width}  onChange={setWidth}  unit="ft" min={0} />
          </div>
          <SelectField
            label="Thickness"
            value={thickness}
            onChange={setThick}
            options={THICKNESS_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
          />
          <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" min={0} max={30}
            hint="10% is standard; use 15% for complex shapes" />
          <ToggleField label="Include Rebar Estimate" checked={addRebar} onChange={setAddRebar} />
          {addRebar && (
            <SelectField label="Rebar Spacing" value={rebarSpacing} onChange={setRebar}
              options={[
                { value: 12, label: '12" OC (#4 standard slab)' },
                { value: 16, label: '16" OC (#4 light slab)' },
                { value: 18, label: '18" OC (#3 light duty)' },
                { value: 24, label: '24" OC (minimum reinforcement)' },
              ]}
            />
          )}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Code note:</strong> IRC R506 requires a min 3.5" slab over a 4" compacted gravel base.
            Use 4" minimum for all driveways and garage slabs.
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <Card title="Concrete Volume">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Cubic Yards"        value={result.cubicYards}          unit="CY" highlight />
            <ResultCard label="With Waste"          value={result.cubicYardsWithWaste} unit="CY" />
            <ResultCard label="Cubic Feet"          value={result.cubicFeet}           unit="CF" small />
            <ResultCard label="Est. Material Cost"  value={`$${estCost}`}              unit="rough estimate" small />
          </div>
        </Card>

        <Card title="Bag Concrete (if mixing on-site)">
          <div className="grid grid-cols-3 gap-3">
            <ResultCard label="60 lb Bags" value={result.bags60lb} unit="bags" small note="0.45 CF/bag" />
            <ResultCard label="80 lb Bags" value={result.bags80lb} unit="bags" small note="0.60 CF/bag" />
            <ResultCard label="90 lb Bags" value={result.bags90lb} unit="bags" small note="0.68 CF/bag" />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Ready-mix is more economical for orders over 1 CY. Minimum delivery is typically 1 CY.
          </p>
        </Card>

        {addRebar && result.totalRebarLF !== undefined && (
          <Card title="Rebar Estimate (#4 Rebar — two directions)">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="LF per Direction" value={result.rebarLFPerDir ?? 0} unit="linear ft" small />
              <ResultCard label="Total Rebar Needed" value={result.totalRebarLF ?? 0} unit="linear ft" highlight />
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Standard #4 rebar comes in 20-ft lengths. Divide total LF by 20 for stick count.
              Add 10% for lap splices (18" min).
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Continuous Footing Tab ────────────────────────────────────────────────────
function FootingCalc() {
  const [width, setWidth]     = useState('16');
  const [depth, setDepth]     = useState('8');
  const [linFt, setLinFt]     = useState('120');
  const [waste, setWaste]     = useState('10');

  const result = useMemo(() => calcContinuousFooting(
    parseFloat(width) || 0,
    parseFloat(depth) || 0,
    parseFloat(linFt) || 0,
    parseFloat(waste) || 10
  ), [width, depth, linFt, waste]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Continuous footing under frost wall or grade beam">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Footing Width" value={width} onChange={setWidth} unit="in"
              hint="Min 2× wall thickness (IRC R403.1)" />
            <InputField label="Footing Depth" value={depth} onChange={setDepth} unit="in"
              hint="Must be below frost line" />
          </div>
          <InputField label="Total Linear Feet" value={linFt} onChange={setLinFt} unit="ft"
            hint="Perimeter of the foundation" />
          <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" min={0} max={20} />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>IRC R403.1:</strong> Min footing width = 12" for 1-story, 15" for 2-story, 23" for 3-story
            (for soil bearing capacity ≥ 1,500 psf). Always verify with local code.
          </div>
        </div>
      </Card>

      <Card title="Results">
        <div className="grid grid-cols-2 gap-4">
          <ResultCard label="Cubic Yards"      value={result.cubicYards}          unit="CY" highlight />
          <ResultCard label="With Waste"        value={result.cubicYardsWithWaste} unit="CY" />
          <ResultCard label="80 lb Bags"        value={result.bags80lb}            unit="bags" small />
          <ResultCard label="Est. Cost"         value={`$${Math.round(result.cubicYardsWithWaste * CONCRETE_COST_PER_CY)}`} unit="rough" small />
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Typical residential footing: 16" wide × 8" deep. Larger houses or poor soils require wider footings.
        </p>
      </Card>
    </div>
  );
}

// ─── Pad Footing Tab ──────────────────────────────────────────────────────────
function PadCalc() {
  const [width, setWidth]  = useState('24');
  const [length, setLen]   = useState('24');
  const [depth, setDepth]  = useState('12');
  const [count, setCount]  = useState('4');
  const [waste, setWaste]  = useState('5');

  const result = useMemo(() => calcPadFooting(
    parseFloat(width) || 0, parseFloat(length) || 0,
    parseFloat(depth) || 0, parseInt(count) || 1, parseFloat(waste) || 5
  ), [width, length, depth, count, waste]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Isolated pad footings for posts or columns">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Pad Width"  value={width}  onChange={setWidth}  unit="in" />
            <InputField label="Pad Length" value={length} onChange={setLen}    unit="in" />
          </div>
          <InputField label="Pad Depth"    value={depth}  onChange={setDepth}  unit="in" />
          <InputField label="Number of Pads" value={count} onChange={setCount} unit="pads" step={1} min={1} />
          <InputField label="Waste Factor"   value={waste}  onChange={setWaste} unit="%" min={0} />
        </div>
      </Card>
      <Card title="Results">
        <div className="grid grid-cols-2 gap-4">
          <ResultCard label="Total Cubic Yards" value={result.cubicYards}          unit="CY" highlight />
          <ResultCard label="With Waste"         value={result.cubicYardsWithWaste} unit="CY" />
          <ResultCard label="80 lb Bags"         value={result.bags80lb}            unit="bags" small />
        </div>
      </Card>
    </div>
  );
}

// ─── Foundation Wall Tab ──────────────────────────────────────────────────────
function WallCalc() {
  const [perimeter, setPerim] = useState('120');
  const [height, setHeight]   = useState('4');
  const [thickness, setThick] = useState('8');
  const [waste, setWaste]     = useState('8');

  const result = useMemo(() => calcFoundationWall(
    parseFloat(perimeter) || 0, parseFloat(height) || 0,
    parseFloat(thickness) || 8, parseFloat(waste) || 8
  ), [perimeter, height, thickness, waste]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Poured concrete foundation or stem wall">
        <div className="space-y-4">
          <InputField label="Wall Perimeter" value={perimeter} onChange={setPerim} unit="ft"
            hint="Total linear feet of all walls" />
          <InputField label="Wall Height" value={height} onChange={setHeight} unit="ft"
            hint="3–4 ft for crawl space, 8 ft for full basement" />
          <SelectField label="Wall Thickness" value={thickness} onChange={setThick}
            options={[
              { value: 6,  label: '6" (light crawl space wall)' },
              { value: 8,  label: '8" (standard residential)' },
              { value: 10, label: '10" (8-ft basement, standard)' },
              { value: 12, label: '12" (heavy load, 9-ft basement)' },
            ]}
          />
          <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" min={0} />
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <strong>Tip:</strong> Poured concrete walls are stronger than block for resisting lateral soil pressure.
            IRC R404 governs concrete wall thickness based on unbalanced backfill height.
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="grid grid-cols-2 gap-4">
          <ResultCard label="Cubic Yards" value={result.cubicYards}          unit="CY" highlight />
          <ResultCard label="With Waste"   value={result.cubicYardsWithWaste} unit="CY" />
          <ResultCard label="80 lb Bags"   value={result.bags80lb}            unit="bags" small />
          <ResultCard label="Est. Cost"    value={`$${Math.round(result.cubicYardsWithWaste * CONCRETE_COST_PER_CY)}`} unit="rough" small />
        </div>
      </Card>
    </div>
  );
}

// ─── Column Tab ───────────────────────────────────────────────────────────────
function ColumnCalc() {
  const [diameter, setDiam]  = useState('12');
  const [height, setHeight]  = useState('4');
  const [count, setCount]    = useState('6');
  const [waste, setWaste]    = useState('5');

  const result = useMemo(() => calcColumn(
    parseFloat(diameter) || 0, parseFloat(height) || 0,
    parseInt(count) || 1, parseFloat(waste) || 5
  ), [diameter, height, count, waste]);

  const sonotubes = parseInt(count) || 1;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Round concrete columns and Sonotube forms">
        <div className="space-y-4">
          <SelectField label="Column Diameter" value={diameter} onChange={setDiam}
            options={[
              { value: 8,  label: '8" (Sonotube — deck post)' },
              { value: 10, label: '10" (Sonotube — light column)' },
              { value: 12, label: '12" (Sonotube — porch column)' },
              { value: 14, label: '14" (heavy post)' },
              { value: 16, label: '16" (structural column)' },
              { value: 18, label: '18" (heavy structural)' },
              { value: 24, label: '24" (large diameter pier)' },
            ]}
          />
          <InputField label="Column Height / Depth" value={height} onChange={setHeight} unit="ft"
            hint="Depth into ground + above-grade height" />
          <InputField label="Number of Columns" value={count} onChange={setCount} step={1} min={1} />
          <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" min={0} />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            For deck footings, check local frost depth. Bottom of footing must be below frost line.
            Typical residential: 42" in zone 5, 36" in zone 4.
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="grid grid-cols-2 gap-4">
          <ResultCard label="Total Cubic Yards" value={result.cubicYards}          unit="CY" highlight />
          <ResultCard label="With Waste"         value={result.cubicYardsWithWaste} unit="CY" />
          <ResultCard label="Sonotubes Needed"   value={sonotubes}                  unit="forms" small />
          <ResultCard label="80 lb Bags"         value={result.bags80lb}            unit="bags" small />
        </div>
      </Card>
    </div>
  );
}

// ─── Gravel Tab ───────────────────────────────────────────────────────────────
function GravelCalc() {
  const [length, setLen]  = useState('20');
  const [width, setWidth] = useState('20');
  const [depth, setDepth] = useState('4');
  const [waste, setWaste] = useState('15');

  const totalCY = useMemo(() => calcGravel(
    parseFloat(length) || 0, parseFloat(width) || 0,
    parseFloat(depth) || 0, parseFloat(waste) || 15
  ), [length, width, depth, waste]);

  const tons = (totalCY * 1.35).toFixed(1); // typical compacted gravel = 1.35 tons/CY

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Gravel base, fill material, and sub-base">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Length" value={length} onChange={setLen}   unit="ft" />
            <InputField label="Width"  value={width}  onChange={setWidth} unit="ft" />
          </div>
          <InputField label="Depth" value={depth} onChange={setDepth} unit="in"
            hint="IRC R506: min 4 in. compacted gravel under slab" />
          <InputField label="Waste / Compaction Factor" value={waste} onChange={setWaste} unit="%"
            hint="15–20% for gravel (compaction and losses)" />
        </div>
      </Card>
      <Card title="Results">
        <div className="grid grid-cols-2 gap-4">
          <ResultCard label="Cubic Yards"  value={totalCY}          unit="CY (loose)" highlight />
          <ResultCard label="Approx. Tons" value={tons}             unit="tons (compacted)" />
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Gravel is sold by the ton or cubic yard. Ask your supplier for their CY/ton conversion —
          it varies by material. #57 stone ≈ 1.35 t/CY. Pea gravel ≈ 1.4 t/CY.
        </p>
      </Card>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function ConcreteFoundation() {
  const [tab, setTab] = useState('slab');

  return (
    <div className="space-y-5">
      <PriceIndexBanner seriesKeys={CONCRETE_SERIES} title="Concrete &amp; Cement Market Trends" />
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'slab'    && <SlabCalc />}
      {tab === 'footing' && <FootingCalc />}
      {tab === 'pad'     && <PadCalc />}
      {tab === 'wall'    && <WallCalc />}
      {tab === 'column'  && <ColumnCalc />}
      {tab === 'gravel'  && <GravelCalc />}
    </div>
  );
}

import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { calcFlooring, calcTile, calcSiding } from '../../utils/calculations';

const TABS = [
  { id: 'floor',  label: 'Flooring',  icon: '🏠' },
  { id: 'tile',   label: 'Tile',      icon: '⬛' },
  { id: 'siding', label: 'Siding',    icon: '🏗️' },
];

// Coverage per box by flooring type (typical, in SF)
const FLOORING_TYPES: Record<string, { label: string; sfPerBox: number; unit: string }> = {
  lvp:       { label: 'LVP / LVT',                  sfPerBox: 20,   unit: 'boxes' },
  hardwood:  { label: 'Hardwood (3/4")',             sfPerBox: 18,   unit: 'boxes' },
  laminate:  { label: 'Laminate',                    sfPerBox: 22,   unit: 'boxes' },
  carpet:    { label: 'Carpet (sold by yard)',        sfPerBox: 9,    unit: 'sq yd' },  // 9 SF/SY
  engineered:{ label: 'Engineered Hardwood',         sfPerBox: 20,   unit: 'boxes' },
  tile:      { label: 'Tile (use Tile tab for count)', sfPerBox: 20,  unit: 'boxes' },
};

function FlooringCalc() {
  const [length, setLength]     = useState('20');
  const [width,  setWidth]      = useState('15');
  const [waste,  setWaste]      = useState('10');
  const [type,   setType]       = useState('lvp');
  const [underlayment, setUnder]= useState('true');

  const { sfPerBox, unit, label } = FLOORING_TYPES[type] ?? FLOORING_TYPES.lvp;

  const res = useMemo(() => calcFlooring(
    parseFloat(length)||0, parseFloat(width)||0, parseFloat(waste)||10
  ), [length, width, waste]);

  // For carpet, convert to SY
  const carpetSY = type === 'carpet' ? Math.ceil(res.withWasteSqFt / 9) : 0;
  const boxes    = type === 'carpet' ? carpetSY : Math.ceil(res.withWasteSqFt / sfPerBox);

  const underlaymentSF = underlayment === 'true' ? Math.ceil(res.withWasteSqFt * 1.05) : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Room Details">
        <div className="space-y-4">
          <SelectField label="Flooring Type" value={type} onChange={setType}
            options={Object.entries(FLOORING_TYPES).map(([v, t]) => ({ value: v, label: t.label }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Length" value={length} onChange={setLength} unit="ft" />
            <InputField label="Width"  value={width}  onChange={setWidth}  unit="ft" />
          </div>
          <SelectField label="Waste / Overage" value={waste} onChange={setWaste}
            options={[
              { value: '5',  label: '5%  — simple rectangle, no cuts' },
              { value: '10', label: '10% — standard with some cuts' },
              { value: '15', label: '15% — diagonal pattern or complex layout' },
              { value: '20', label: '20% — herringbone, high-waste pattern' },
            ]}
          />
          <SelectField label="Underlayment Needed" value={underlayment} onChange={setUnder}
            options={[
              { value: 'true',  label: 'Yes — include underlayment' },
              { value: 'false', label: 'No — pre-attached or not needed' },
            ]}
          />
        </div>
      </Card>
      <div className="space-y-4">
        <Card title="Material Quantities">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label={`${label} (${unit})`} value={boxes} highlight />
            <ResultCard label="SF with Waste" value={res.withWasteSqFt} unit="SF" />
            <ResultCard label="Net Room SF"   value={res.netSqFt}       unit="SF" small />
            <ResultCard label="Waste Added"   value={Math.round(res.withWasteSqFt - res.netSqFt)} unit="SF" small />
            {underlayment === 'true' &&
              <ResultCard label="Underlayment" value={underlaymentSF} unit="SF" small />}
          </div>
          {type === 'carpet' && (
            <p className="text-xs text-slate-500 mt-3">
              Carpet is sold by the <strong>square yard</strong>. Standard roll is 12' wide.
              A {carpetSY} SY order = {Math.round(carpetSY * 9)} SF.
            </p>
          )}
        </Card>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <strong>Pro tips:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Acclimate flooring 48–72 hrs before install (LVP, hardwood)</li>
            <li>• For diagonal installs, use 15–20% waste factor</li>
            <li>• Maintain expansion gaps at walls (⅜" typical for hardwood)</li>
            <li>• Hardwood: install perpendicular to floor joists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function TileCalc() {
  const [length, setLength] = useState('12');
  const [width,  setWidth]  = useState('12');
  const [roomL,  setRoomL]  = useState('10');
  const [roomW,  setRoomW]  = useState('10');
  const [waste,  setWaste]  = useState('10');
  const [grout,  setGrout]  = useState('3/16');

  const roomSF = (parseFloat(roomL)||0) * (parseFloat(roomW)||0);
  const res    = useMemo(() => calcTile(
    roomSF, parseFloat(length)||12, parseFloat(width)||12, parseFloat(waste)||10
  ), [roomSF, length, width, waste]);

  const tilesSF = (parseFloat(length)||12) * (parseFloat(width)||12) / 144;
  const groutLbs= Math.ceil(res.sqFtNeeded / 40); // ~40 SF per 10-lb bag for 12x12 @ 3/16 joint

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Tile Details">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Room Length" value={roomL} onChange={setRoomL} unit="ft" />
            <InputField label="Room Width"  value={roomW} onChange={setRoomW} unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Tile Length" value={length} onChange={setLength} unit="in" />
            <InputField label="Tile Width"  value={width}  onChange={setWidth}  unit="in" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Waste Factor" value={waste} onChange={setWaste}
              options={[
                { value: '5',  label: '5%  — simple grid' },
                { value: '10', label: '10% — standard cuts' },
                { value: '15', label: '15% — diagonal layout' },
              ]}
            />
            <SelectField label="Grout Joint" value={grout} onChange={setGrout}
              options={[
                { value: '1/16',  label: '1/16" (rectified tile)' },
                { value: '1/8',   label: '1/8" (standard small)' },
                { value: '3/16',  label: '3/16" (standard)' },
                { value: '1/4',   label: '1/4" (large tiles)' },
                { value: '3/8',   label: '3/8" (slate/stone)' },
              ]}
            />
          </div>
        </div>
      </Card>
      <Card title="Tile Results">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Tiles Needed"    value={res.tiles}      highlight />
          <ResultCard label="SF to Order"     value={res.sqFtNeeded} unit="SF" />
          <ResultCard label="SF per tile"     value={Math.round(tilesSF * 100)/100} unit="SF" small />
          <ResultCard label="Grout (approx)"  value={groutLbs}       unit="lbs" small />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Grout estimate based on {grout}" joint, {length}×{width}" tile.
          Use unsanded grout for joints under 1/8"; sanded for 1/8" and above.
        </p>
      </Card>
    </div>
  );
}

// Siding types and their coverage rates
const SIDING_TYPES: Record<string, { label: string; unitLabel: string; note: string }> = {
  vinyl:     { label: 'Vinyl Siding (double 4" lap)',    unitLabel: 'squares', note: '1 square = 100 SF. Sold by box (sq).' },
  lp:        { label: 'LP SmartSide / Fiber Cement Lap', unitLabel: 'squares', note: 'Includes trim: add 15% for corners/windows.' },
  hardie:    { label: 'HardiePlank (5.25" exposure)',    unitLabel: 'squares', note: 'Overlap included in exposure measurement.' },
  board:     { label: 'Board & Batten (1×8 board)',       unitLabel: 'LF boards', note: '5 boards per 4\' width + battens.' },
  stucco:    { label: 'Stucco (3-coat)',                  unitLabel: 'squares', note: '18 lbs base coat per SF. Plus labor.' },
};

function SidingCalc() {
  const [perimeter, setPerimeter] = useState('160');
  const [wallH,     setWallH]     = useState('9');
  const [winArea,   setWinArea]   = useState('120');
  const [doorArea,  setDoorArea]  = useState('42');
  const [exposure,  setExposure]  = useState('4');
  const [waste,     setWaste]     = useState('10');
  const [sidingT,   setSidingT]   = useState('vinyl');

  const res = useMemo(() => calcSiding(
    parseFloat(perimeter)||0, parseFloat(wallH)||0,
    parseFloat(winArea)||0,   parseFloat(doorArea)||0,
    parseFloat(exposure)||4,  parseFloat(waste)||10
  ), [perimeter, wallH, winArea, doorArea, exposure, waste]);

  const squares     = res.sidingSquares;
  const housewrapSF = Math.ceil(res.housewrapSqFt);
  const grossWallSF = Math.round((parseFloat(perimeter)||0) * (parseFloat(wallH)||0));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="House Dimensions">
        <div className="space-y-4">
          <SelectField label="Siding Type" value={sidingT} onChange={setSidingT}
            options={Object.entries(SIDING_TYPES).map(([v, t]) => ({ value: v, label: t.label }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Wall Perimeter" value={perimeter} onChange={setPerimeter} unit="ft" hint="Total exterior perimeter" />
            <InputField label="Average Wall Height" value={wallH} onChange={setWallH} unit="ft" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Total Window Area" value={winArea} onChange={setWinArea} unit="SF" />
            <InputField label="Total Door Area"   value={doorArea} onChange={setDoorArea} unit="SF" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Exposure / Pattern" value={exposure} onChange={setExposure} unit="in" hint="Lap exposure in inches" />
            <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" />
          </div>
        </div>
      </Card>
      <div className="space-y-4">
        <Card title="Siding Results">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Squares (100 SF)" value={squares}              highlight />
            <ResultCard label="Gross Wall Area"  value={grossWallSF}      unit="SF" />
            <ResultCard label="Net Wall Area"    value={res.netWallArea}        unit="SF" small />
            <ResultCard label="SF to Order"      value={Math.round(res.sidingSquares * 100)}   unit="SF" small />
          </div>
        </Card>
        <Card title="Related Materials">
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Housewrap"      value={housewrapSF}           unit="SF" small />
            <ResultCard label="Starter Strip"  value={Math.round((parseFloat(perimeter)||0))} unit="LF" small />
          </div>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
            {SIDING_TYPES[sidingT]?.note}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function Flooring() {
  const [tab, setTab] = useState('floor');
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'floor'  && <FlooringCalc />}
      {tab === 'tile'   && <TileCalc />}
      {tab === 'siding' && <SidingCalc />}
    </div>
  );
}

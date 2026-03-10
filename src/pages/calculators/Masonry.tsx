import React, { useState, useMemo } from 'react';
import { Card, ResultCard } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { SelectField } from '../components/ui/SelectField';
import { Tabs } from '../components/ui/Button';
import { InfoBox } from '../components/ui/InfoBox';
import { calcCMUBlocks } from '../../utils/calculations';

const TABS = [
  { id: 'cmu',    label: 'CMU Block',     icon: '🧱' },
  { id: 'brick',  label: 'Brick',         icon: '🟫' },
  { id: 'ref',    label: 'Mortar Guide',  icon: '📋' },
];

function CMUCalc() {
  const [height, setHeight]  = useState('8');
  const [length, setLength]  = useState('40');
  const [openings, setOpen]  = useState('0');
  const [waste,   setWaste]  = useState('5');
  const [blockSize, setBlock]= useState('8');

  const result = useMemo(() => calcCMUBlocks(
    parseFloat(height) || 0,
    parseFloat(length) || 0,
    parseFloat(openings) || 0,
    parseFloat(waste) || 5
  ), [height, length, openings, waste]);

  // Grout for filled CMU (every other cell typical)
  const groutCY = parseFloat(blockSize) === 8
    ? Math.round(result.blocks * 0.0021 * 100) / 100
    : Math.round(result.blocks * 0.003 * 100) / 100;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Standard CMU block wall">
        <div className="space-y-4">
          <SelectField label="Block Size" value={blockSize} onChange={setBlock}
            options={[
              { value: '8',  label: '8"×8"×16" (standard — most common)' },
              { value: '12', label: '12"×8"×16" (heavy duty / retaining)' },
              { value: '6',  label: '6"×8"×16" (non-load-bearing partition)' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Wall Height" value={height} onChange={setHeight} unit="ft" />
            <InputField label="Wall Length" value={length} onChange={setLength} unit="ft" />
          </div>
          <InputField label="Opening Area (SF)" value={openings} onChange={setOpen} unit="SF"
            hint="Combined area of all door/window openings" />
          <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" min={0} max={15} />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Tip:</strong> 8"×8"×16" CMU = 0.89 SF face area (accounting for ⅜" mortar).
            Courses are 8" high. Columns typically 16"×16" (2 blocks wide).
          </div>
        </div>
      </Card>
      <Card title="Results">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Blocks Needed"     value={result.blocks}           highlight />
          <ResultCard label="80 lb Mortar Bags" value={result.mortar80lbBags}   unit="bags" />
          <ResultCard label="Grout (approx — fills hollow cores)" value={groutCY} unit="CY (cubic yards)" small />
          <ResultCard label="Wall SF (net)"     value={Math.round((parseFloat(height)||0) * (parseFloat(length)||0) - (parseFloat(openings)||0))} unit="SF" small />
        </div>
        <p className="text-xs text-slate-400 mt-4">
          <strong>Grout</strong> fills the hollow cores of blocks. Estimate assumes every-other cell filled (partial grouting). Full grouting (all cores filled) requires ~2× grout — required for structural/retaining walls or anywhere rebar is used.
        </p>
      </Card>
    </div>
  );
}

function BrickCalc() {
  const [height, setHeight]  = useState('8');
  const [length, setLength]  = useState('40');
  const [openings, setOpen]  = useState('0');
  const [waste,   setWaste]  = useState('5');
  const [brickType, setBrick]= useState('standard');

  const brickTypes: Record<string, { bricksPerSF: number; desc: string }> = {
    'standard': { bricksPerSF: 6.75,  desc: 'Modular (2.25"×3.75"×8")' },
    'queen':    { bricksPerSF: 5.76,  desc: 'Queen size (2.75"×3.75"×8")' },
    'king':     { bricksPerSF: 5.0,   desc: 'King size (2.75"×3.75"×9.625")' },
    'utility':  { bricksPerSF: 3.0,   desc: 'Utility/Jumbo (3.5"×3.75"×11.5")' },
  };

  const factor = brickTypes[brickType]?.bricksPerSF ?? 6.75;
  const netSF  = Math.max(0, (parseFloat(height)||0) * (parseFloat(length)||0) - (parseFloat(openings)||0));
  const bricksAdj = Math.ceil(netSF * factor * (1 + (parseFloat(waste)||5)/100));
  const mortarBags = Math.ceil(bricksAdj / 40);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Inputs" subtitle="Brick veneer or full brick wall">
        <div className="space-y-4">
          <SelectField label="Brick Type" value={brickType} onChange={setBrick}
            options={Object.entries(brickTypes).map(([v, t]) => ({ value: v, label: t.desc }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="Wall Height" value={height} onChange={setHeight} unit="ft" />
            <InputField label="Wall Length" value={length} onChange={setLength} unit="ft" />
          </div>
          <InputField label="Opening Area" value={openings} onChange={setOpen} unit="SF" />
          <InputField label="Waste Factor" value={waste} onChange={setWaste} unit="%" min={0} max={15} />
        </div>
      </Card>
      <Card title="Results">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Bricks Needed"     value={bricksAdj}   highlight />
          <ResultCard label="80 lb Mortar Bags" value={mortarBags}   unit="bags" />
          <ResultCard label="Net Wall Area"      value={Math.round(netSF)} unit="SF" small />
          <ResultCard label="Bricks per SF"      value={factor}      unit="bricks/SF" small />
        </div>
        <p className="text-xs text-slate-400 mt-4">
          For veneer applications, also include: metal ties (1 per 2.67 SF), moisture barrier, and
          weep screed at base. Consult NCMA or BIA for structural brick design.
        </p>
      </Card>
    </div>
  );
}

function MortarGuide() {
  return (
    <Card title="Mortar Mix Guide">
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-2 font-medium text-slate-600">Type</th>
                <th className="text-left py-2 px-2 font-medium text-slate-600">Mason Cement</th>
                <th className="text-left py-2 px-2 font-medium text-slate-600">Sand</th>
                <th className="text-left py-2 px-2 font-medium text-slate-600">Compressive</th>
                <th className="text-left py-2 px-2 font-medium text-slate-600 hidden md:table-cell">Best Use</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'Type M', cement: '1 part', sand: '3 parts', strength: '2,500 psi', use: 'Below grade, foundations, driveways' },
                { type: 'Type S', cement: '1 part', sand: '4.5 parts', strength: '1,800 psi', use: 'Exterior at/below grade, structural masonry' },
                { type: 'Type N', cement: '1 part', sand: '6 parts', strength: '750 psi',   use: 'Above-grade exterior, veneer, chimneys' },
                { type: 'Type O', cement: '1 part', sand: '9 parts', strength: '350 psi',   use: 'Interior non-load-bearing, repair work' },
              ].map(r => (
                <tr key={r.type} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-2 font-bold text-amber-600">{r.type}</td>
                  <td className="py-2 px-2 text-slate-700">{r.cement}</td>
                  <td className="py-2 px-2 text-slate-700">{r.sand}</td>
                  <td className="py-2 px-2 text-slate-700">{r.strength}</td>
                  <td className="py-2 px-2 text-slate-500 hidden md:table-cell">{r.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
            <strong>Ready-mix bags:</strong> Quikrete Mortar Mix and similar products are Type N.
            For structural CMU or below-grade work, mix your own Type S or M or use pre-blended ASTM C270.
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            <strong>Joint thickness:</strong> Standard bed and head joints are 3/8". Keep consistent —
            variation causes cracking. Too much water weakens mortar significantly.
          </div>
        </div>
      </div>
    </Card>
  );
}

export function Masonry() {
  const [tab, setTab] = useState('cmu');
  return (
    <div className="space-y-5">
      <InfoBox title="Masonry Basics: CMU, Brick, Mortar & Grout" variant="blue" collapsible>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
          <div><strong>CMU Block</strong> (Concrete Masonry Unit) — The gray rectangular concrete blocks you see in foundations, garages, and retaining walls. The standard size is 8×8×16 inches. They have hollow cores that can be filled with grout and rebar for extra strength.</div>
          <div><strong>Mortar</strong> — The cement paste mixed with sand that <em>holds blocks or bricks together</em> at the joints (gaps between each unit). Applied in thin 3⅛” layers. Think of it like concrete glue.</div>
          <div><strong>Grout</strong> — A thinner liquid concrete poured to <em>fill the hollow cores</em> of CMU blocks. Grout (often with rebar inside) turns a hollow block wall into a solid reinforced structure — required for load-bearing or retaining walls.</div>
          <div><strong>Courses</strong> — A horizontal row of blocks or bricks. Each CMU course is 8 inches tall (7.625" block + 3⅛" mortar). You can calculate how many courses you need by dividing wall height by 8".</div>
          <div><strong>Veneer vs. Structural</strong> — Brick <em>veneer</em> is a decorative single layer attached to the outside of a framed wall — it&apos;s not load-bearing. <em>Structural</em> brick or CMU actually holds up the building.</div>
          <div><strong>CY</strong> — Cubic Yards. Used to measure grout and concrete volume. 1 CY = 27 cubic feet = roughly a 3×3×3 foot cube.</div>
        </div>
      </InfoBox>
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'cmu'   && <CMUCalc />}
      {tab === 'brick' && <BrickCalc />}
      {tab === 'ref'   && <MortarGuide />}
    </div>
  );
}

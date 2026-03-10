import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { calcBattInsulation, calcBlownInInsulation } from '../../utils/calculations';
import { R_VALUE_GUIDE } from '../../data/referenceData';

const TABS = [
  { id: 'zone',  label: 'Climate Zones', icon: '🗺️' },
  { id: 'batt',  label: 'Batt / Roll',  icon: '📦' },
  { id: 'blown', label: 'Blown-In',     icon: '💨' },
];

function ClimateZoneGuide() {
  const [selectedZone, setZone] = useState<string>('3');
  const guide = R_VALUE_GUIDE.find(z => z.zone === parseInt(selectedZone));

  return (
    <div className="space-y-4">
      <Card title="Select Your Climate Zone">
        <SelectField label="IECC Climate Zone" value={selectedZone} onChange={setZone}
          options={R_VALUE_GUIDE.map(z => ({ value: String(z.zone), label: `Zone ${z.zone} — ${z.zoneName}` }))}
        />
        <p className="text-xs text-slate-500 mt-2">
          IECC Climate Zones: 1 (Hot/Humid Florida) → 7 (Cold/Subarctic). Find your county at
          energycodes.gov.
        </p>
      </Card>

      {guide && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card title={`Zone ${guide.zone} — ${guide.zoneName}`} >
            <div className="space-y-3">
              {[
                { label: 'Attic / Ceiling', value: guide.attic },
                { label: 'Wood Frame Walls', value: guide.walls },
                { label: 'Floor (over unconditioned)', value: guide.floors },
                { label: 'Crawl Space / Basement Wall', value: guide.basement },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-700">{row.label}</span>
                  <span className="font-bold text-amber-600 text-sm">{row.value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Common Assemblies">
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <strong className="text-blue-700">2×4 wall</strong>
                <p className="text-slate-600 mt-0.5">R-15 batt fills cavity. Add continuous exterior
                  foam for higher performance (R-5 polyiso).</p>
              </div>
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <strong className="text-blue-700">2×6 wall</strong>
                <p className="text-slate-600 mt-0.5">R-21 batt fills cavity. Preferred in Zones 4–7
                  to meet energy code without exterior foam.</p>
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <strong className="text-amber-700">Attic (blown-in)</strong>
                <p className="text-slate-600 mt-0.5">Blown cellulose or fiberglass for R-38 to R-60.
                  Cellulose often preferred for air sealing.</p>
              </div>
              <div className="p-2 bg-green-50 rounded border border-green-200">
                <strong className="text-green-700">Spray Foam</strong>
                <p className="text-slate-600 mt-0.5">Open cell (R-3.8/in) vs closed cell (R-6.5/in).
                  Closed cell is a vapor retarder.</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function BattCalc() {
  const [area,    setArea]    = useState('500');
  const [rValue,  setRValue]  = useState('15');
  const [width,   setWidth]   = useState('15');  // cavity width (3.5" for 2x4, etc.)

  const result = useMemo(() => calcBattInsulation(
    parseFloat(area)||0, parseInt(rValue)||15
  ), [area, rValue]);

  // Standard batt widths by framing

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Batt Insulation Inputs">
        <div className="space-y-4">
          <InputField label="Area to Insulate" value={area} onChange={setArea} unit="SF"
            hint="Net area after deducting framing" />
          <SelectField label="Target R-Value" value={rValue} onChange={setRValue}
            options={[
              { value: '11',  label: 'R-11  (2×4 walls, economy)' },
              { value: '13',  label: 'R-13  (2×4 walls, standard)' },
              { value: '15',  label: 'R-15  (2×4 walls, high performance)' },
              { value: '19',  label: 'R-19  (2×6 walls)' },
              { value: '21',  label: 'R-21  (2×6 walls, high density)' },
              { value: '30',  label: 'R-30  (floor/crawlspace)' },
              { value: '38',  label: 'R-38  (attic, min Zone 3–4)' },
              { value: '49',  label: 'R-49  (attic, Zone 5–7)' },
            ]}
          />
          <SelectField label="Framing Width" value={width} onChange={setWidth}
            options={[
              { value: '15', label: '15" — 2×4 framing at 16" OC' },
              { value: '23', label: '23" — 2×6 framing at 24" OC' },
              { value: '11', label: '11" — 2×4 framing at 12" OC' },
            ]}
          />
        </div>
      </Card>
      <Card title="Batt Results">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Batts / Bags"  value={result.batts}   highlight />
          <ResultCard label="Rolls" value={result.rolls} unit="rolls" />
          <ResultCard label="Area" value={Math.round(parseFloat(area)||0)} unit="SF" small />
        </div>
        <p className="text-xs text-slate-400 mt-3">{result.note}</p>
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-700">
          <strong>Note on high-density batts:</strong> R-15 in a 2×4 cavity and R-21 in a 2×6 cavity
          are "high density" products — verify they fit without voids, as compression reduces R-value.
        </div>
      </Card>
    </div>
  );
}

function BlownInCalc() {
  const [area,      setArea]      = useState('1500');
  const [rValue,    setRValue]    = useState('38');
  const [product,   setProduct]   = useState('cellulose');

  const result = useMemo(() => calcBlownInInsulation(
    parseFloat(area)||0, parseInt(rValue)||38, (product === 'cellulose' ? 'cellulose' : 'fiberglass') as 'fiberglass' | 'cellulose'
  ), [area, rValue, product]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Blown-In Inputs">
        <div className="space-y-4">
          <InputField label="Attic / Floor Area" value={area} onChange={setArea} unit="SF" />
          <SelectField label="Product Type" value={product} onChange={setProduct}
            options={[
              { value: 'cellulose',   label: 'Cellulose (recycled paper)' },
              { value: 'fiberglass',  label: 'Fiberglass loosefill' },
              { value: 'mineral_wool',label: 'Mineral wool (rockwool)' },
            ]}
          />
          <SelectField label="Target R-Value" value={rValue} onChange={setRValue}
            options={[
              { value: '30', label: 'R-30' },
              { value: '38', label: 'R-38 (Zone 3–4 attic)' },
              { value: '49', label: 'R-49 (Zone 5–7 attic)' },
              { value: '60', label: 'R-60 (far north / super-insulated)' },
            ]}
          />
          <p className="text-xs text-slate-500">
            Product-specific settled depths and coverage per bag vary by manufacturer.
            Always check the bag's coverage chart — required by FTC.
          </p>
        </div>
      </Card>
      <Card title="Blown-In Results">
        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Bags Needed"       value={result.bags}           highlight />
          <ResultCard label="Installed Depth"   value={result.settledDepthIn} unit="inches" />
          <ResultCard label="Area Covered"      value={Math.round(parseFloat(area)||0)} unit="SF" small />
        </div>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 space-y-1">
          <p>• Net-and-blow technique: blow then net for better control</p>
          <p>• Air seal all penetrations BEFORE blowing — blown-in is not an air barrier</p>
          <p>• Add depth rulers (depth gauges) to verify R-value during install</p>
          <p>• Cellulose settles ~20% after install — account for this in depth</p>
        </div>
      </Card>
    </div>
  );
}

export function Insulation() {
  const [tab, setTab] = useState('zone');
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>
      {tab === 'zone'  && <ClimateZoneGuide />}
      {tab === 'batt'  && <BattCalc />}
      {tab === 'blown' && <BlownInCalc />}
    </div>
  );
}

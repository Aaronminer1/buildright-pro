import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox } from '../../components/ui/InfoBox';
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
      <InfoBox title="🏠 What is Insulation? Why does R-Value matter?" variant="blue" collapsible>
        <p><strong>Insulation</strong> is material placed in your walls, attic, and floors to slow the movement of heat. In winter, it keeps heat inside. In summer, it keeps heat out.</p>
        <p><strong>R-Value</strong> measures how well insulation resists heat flow. <em>Higher R-value = better insulation.</em> Think of it like a winter coat — R-13 is a light jacket, R-38 is a heavy parka. Your attic needs more R-value than your walls because heat rises.</p>
        <p><strong>Climate Zone</strong> determines how much insulation you need. The colder your climate, the higher the R-value required. Select your zone below or look yours up at <em>energycodes.gov</em> (just enter your zip code).</p>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-1 mt-2">
          {['1 Hot/Humid','2 Hot','3 Warm','4 Mixed','5 Cool','6 Cold','7 Very Cold'].map((z,i)=>(
            <div key={i} className="bg-white rounded p-1.5 border border-blue-200 text-center text-xs">
              <div className="font-bold text-blue-800">Zone {i+1}</div>
              <div className="text-slate-400 text-xs leading-tight">{z.split(' ').slice(1).join(' ')}</div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs"><strong>Quick guide:</strong> Florida → Zone 1; Texas/SE → Zone 2; Atlanta/LA → Zone 3; DC/Denver → Zone 4; Chicago/Boston → Zone 5; Minneapolis → Zone 6; Northern Alaska → Zone 7</p>
      </InfoBox>

      <Card title="Select Your Climate Zone">
        <SelectField label="What climate zone do you live in?" value={selectedZone} onChange={setZone}
          options={R_VALUE_GUIDE.map(z => ({ value: String(z.zone), label: `Zone ${z.zone} — ${z.zoneName}` }))}
        />
        <p className="text-xs text-slate-500 mt-2">
          Not sure which zone you're in? Go to <strong>energycodes.gov</strong> and search your county, or ask your insulation contractor.
        </p>
      </Card>

      {guide && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card title={`Zone ${guide.zone} — ${guide.zoneName}: Minimum R-Values Required`}>
            <div className="space-y-3">
              {[
                { label: 'Attic / Ceiling', value: guide.attic, tip: 'Most heat escapes through the roof — the attic needs the most insulation' },
                { label: 'Exterior Walls', value: guide.walls, tip: 'Standard 2×4 walls get R-13 or R-15 batt insulation' },
                { label: 'Floor (over crawl or garage)', value: guide.floors, tip: 'Floors over unheated spaces like garages or crawl spaces need insulation' },
                { label: 'Basement / Crawl Space Wall', value: guide.basement, tip: 'Walls below grade if you have a basement' },
              ].map(row => (
                <div key={row.label} className="p-2 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">{row.label}</span>
                    <span className="font-bold text-amber-600 text-sm">{row.value}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{row.tip}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Types of Insulation: Which Do I Choose?">
            <div className="space-y-2 text-xs">
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <strong className="text-blue-700">Batt/Roll (fiberglass or mineral wool)</strong>
                <p className="text-slate-600 mt-0.5">Fluffy pink or yellow rolls that fit between studs. The most common and affordable. Good for walls and floors. R-3.2 to R-4.3 per inch.</p>
              </div>
              <div className="p-2 bg-blue-50 rounded border border-blue-200">
                <strong className="text-blue-700">Blown-In (cellulose or fiberglass)</strong>
                <p className="text-slate-600 mt-0.5">Loose material blown in by machine. Best for attics and hard-to-reach spaces. Cellulose (recycled newspaper) also helps with air sealing.</p>
              </div>
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <strong className="text-amber-700">2×4 vs 2×6 walls</strong>
                <p className="text-slate-600 mt-0.5">Standard homes use 2×4 studs (fits R-13 to R-15). Upgrade to 2×6 framing if you want R-19 to R-21 — great for cold climates.</p>
              </div>
              <div className="p-2 bg-green-50 rounded border border-green-200">
                <strong className="text-green-700">Spray Foam</strong>
                <p className="text-slate-600 mt-0.5">Sprayed liquid that expands and seals gaps. Open cell (R-3.8/inch, cheaper) vs closed cell (R-6.5/inch, also a moisture barrier). Best for sealing tough spots.</p>
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

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Batt Insulation Inputs">
        <div className="space-y-4">
          <InputField label="Area to Insulate" value={area} onChange={setArea} unit="SF"
            hint="Measure the total wall, floor, or ceiling area you want to insulate (in square feet). Don't worry about stud space — the calculator handles that." />
          <SelectField label="Target R-Value (insulating power)" value={rValue} onChange={setRValue}
            options={[
              { value: '11',  label: 'R-11  — 2×4 walls, minimal insulation' },
              { value: '13',  label: 'R-13  — 2×4 walls, standard (most common)' },
              { value: '15',  label: 'R-15  — 2×4 walls, high performance' },
              { value: '19',  label: 'R-19  — 2×6 walls, standard' },
              { value: '21',  label: 'R-21  — 2×6 walls, dense pack' },
              { value: '30',  label: 'R-30  — floors and crawl spaces' },
              { value: '38',  label: 'R-38  — attic (warmer climates, Zone 3–4)' },
              { value: '49',  label: 'R-49  — attic (cooler climates, Zone 5–7)' },
            ]}
          />
          <SelectField label="Framing Width (how wide are your wall cavities?)" value={width} onChange={setWidth}
            options={[
              { value: '15', label: '15" — standard (2×4 framing at 16" spacing)' },
              { value: '23', label: '23" — wider (2×6 framing at 24" spacing)' },
              { value: '11', label: '11" — narrow (2×4 framing at 12" spacing)' },
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
    parseFloat(area)||0, parseInt(rValue)||38, product as 'fiberglass' | 'cellulose'
  ), [area, rValue, product]);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card title="Blown-In Inputs">
        <div className="space-y-4">
          <InputField label="Attic / Floor Area" value={area} onChange={setArea} unit="SF" />
          <SelectField label="Insulation Type" value={product} onChange={setProduct}
            options={[
              { value: 'cellulose',   label: 'Cellulose — recycled paper, best air sealing, most popular' },
              { value: 'fiberglass',  label: 'Fiberglass loosefill — affordable, common' },
              { value: 'mineral_wool',label: 'Mineral wool (Rockwool) — fire resistant, premium' },
            ]}
          />
          <SelectField label="Target R-Value (attic insulating power)" value={rValue} onChange={setRValue}
            options={[
              { value: '30', label: 'R-30 — minimum for warm climates' },
              { value: '38', label: 'R-38 — recommended Zones 3–4 (most US homes)' },
              { value: '49', label: 'R-49 — recommended Zones 5–7 (cold climates)' },
              { value: '60', label: 'R-60 — super-insulated / far north' },
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

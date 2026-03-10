import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { calcHVACLoad } from '../../utils/calculations';

const CLIMATE_ZONES = [
  { value: '1', label: 'Zone 1 — Hot/Humid (Miami, Tampa, Phoenix summer)' },
  { value: '2', label: 'Zone 2 — Hot/Humid (Houston, New Orleans)' },
  { value: '3', label: 'Zone 3 — Warm/Mixed (Atlanta, LA, Dallas)' },
  { value: '4', label: 'Zone 4 — Mixed (DC, Denver, Seattle)' },
  { value: '5', label: 'Zone 5 — Cool (Chicago, Minneapolis, Boston)' },
  { value: '6', label: 'Zone 6 — Cold (Minneapolis, NE Montana)' },
  { value: '7', label: 'Zone 7 — Very Cold (N. Minnesota, Alaska)' },
];

// Duct sizing reference: CFM at 0.1 in/wg static pressure
const DUCT_SIZES = [
  { in: 6,  maxCFM: 100 },
  { in: 7,  maxCFM: 150 },
  { in: 8,  maxCFM: 200 },
  { in: 9,  maxCFM: 270 },
  { in: 10, maxCFM: 355 },
  { in: 12, maxCFM: 535 },
  { in: 14, maxCFM: 755 },
];

export function HVAC() {
  const [sqft,    setSqft]    = useState('2000');
  const [ceilHt,  setCeilHt]  = useState('9');
  const [zone,    setZone]    = useState('3');
  const [insPkg,  setInsPkg]  = useState('good');
  const [stories, setStories] = useState('1');
  const [windows, setWindows] = useState('standard');

  const insulated = insPkg !== 'poor';

  const result = useMemo(() => calcHVACLoad(
    parseFloat(sqft)||0,
    parseFloat(ceilHt)||9,
    parseInt(zone)||3,
    insulated
  ), [sqft, ceilHt, zone, insulated]);

  // Rough CFM estimate: 400 CFM/ton
  const heatingBTU   = Math.round(result.heatingBTU);
  const coolingTons  = result.coolingTons;
  const recTons      = result.recommendedTons;
  const cfm          = Math.round(recTons * 400);

  // Find duct size recommendation for total system CFM
  const mainDuctSize = DUCT_SIZES.find(d => d.maxCFM >= cfm)?.in ?? 16;

  const adjustedHeat = insPkg === 'poor'   ? Math.round(heatingBTU * 1.3)
                     : insPkg === 'good'   ? heatingBTU
                     : Math.round(heatingBTU * 0.85); // excellent

  const adjustedCool = insPkg === 'poor'   ? Math.round(coolingTons * 1.3 * 10) / 10
                     : insPkg === 'good'   ? coolingTons
                     : Math.round(coolingTons * 0.85 * 10) / 10;

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Building Details" subtitle="Simplified Manual J load estimate">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Conditioned SF" value={sqft}   onChange={setSqft}   unit="SF" />
              <InputField label="Ceiling Height" value={ceilHt} onChange={setCeilHt} unit="ft" />
            </div>
            <SelectField label="Climate Zone (IECC)" value={zone} onChange={setZone}
              options={CLIMATE_ZONES}
            />
            <SelectField label="Insulation Package" value={insPkg} onChange={setInsPkg}
              options={[
                { value: 'poor',      label: 'Poor — below code (older home renovation)' },
                { value: 'good',      label: 'Good — meets current energy code' },
                { value: 'excellent', label: 'Excellent — exceeds code, tight envelope' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Stories" value={stories} onChange={setStories}
                options={[
                  { value: '1', label: '1-story' },
                  { value: '2', label: '2-story' },
                  { value: '3', label: '3-story' },
                ]}
              />
              <SelectField label="Window Area" value={windows} onChange={setWindows}
                options={[
                  { value: 'low',      label: 'Low (10–12% of floor area)' },
                  { value: 'standard', label: 'Standard (15% of floor area)' },
                  { value: 'high',     label: 'High (20%+ of floor area)' },
                ]}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Load Estimates">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Heating Load"        value={adjustedHeat.toLocaleString()} unit="BTU/hr" highlight />
              <ResultCard label="Cooling Load"        value={adjustedCool} unit="tons" highlight />
              <ResultCard label="Recommended Unit"    value={recTons}      unit="tons" />
              <ResultCard label="System CFM"          value={cfm}          unit="CFM" />
            </div>
          </Card>

          <Card title="Equipment Sizing Guide" subtitle="Common residential sizes">
            <div className="space-y-2">
              {[
                { tons: 1.5, btu: 18000, sqft: '800–1200 SF',  use: 'Small home/zone' },
                { tons: 2,   btu: 24000, sqft: '1200–1600 SF', use: 'Townhouse / small SFR' },
                { tons: 2.5, btu: 30000, sqft: '1500–2000 SF', use: 'Medium SFR' },
                { tons: 3,   btu: 36000, sqft: '1800–2500 SF', use: 'Common residential' },
                { tons: 3.5, btu: 42000, sqft: '2200–3000 SF', use: 'Larger home' },
                { tons: 4,   btu: 48000, sqft: '2800–3500 SF', use: 'Large SFR' },
                { tons: 5,   btu: 60000, sqft: '3500–4500 SF', use: 'Very large / commercial adj.' },
              ].map(r => (
                <div
                  key={r.tons}
                  className={`flex items-center justify-between p-2 rounded text-xs ${
                    r.tons === recTons
                      ? 'bg-amber-100 border border-amber-400 font-bold'
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <span className="text-slate-700 w-14">{r.tons} tons</span>
                  <span className="text-slate-600 w-16">{r.btu.toLocaleString()} BTU</span>
                  <span className="text-slate-500 w-24 hidden sm:block">{r.sqft}</span>
                  <span className="text-slate-400 hidden md:block">{r.use}</span>
                  {r.tons === recTons && <span className="text-amber-700 ml-2">← recommended</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Duct Sizing Quick Reference */}
      <Card title="Duct Sizing Quick Reference" subtitle="Round duct at 0.1 in. w.g. pressure drop">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-2 px-3 text-left font-medium text-slate-600">Duct Diameter</th>
                <th className="py-2 px-3 text-left font-medium text-slate-600">Max CFM</th>
                <th className="py-2 px-3 text-left font-medium text-slate-600">Typical Use</th>
              </tr>
            </thead>
            <tbody>
              {DUCT_SIZES.map(d => (
                <tr key={d.in} className={`border-b border-slate-100 ${d.in === mainDuctSize ? 'bg-amber-50 font-bold' : 'hover:bg-slate-50'}`}>
                  <td className="py-2 px-3 text-amber-700 font-medium">{d.in}" diameter</td>
                  <td className="py-2 px-3 text-slate-700">{d.maxCFM} CFM</td>
                  <td className="py-2 px-3 text-slate-500">
                    {d.in <= 6  ? 'Individual rooms, small supply runs' :
                     d.in <= 8  ? 'Supply branch runs' :
                     d.in <= 10 ? 'Main supply branch' :
                                  'Trunk duct / main supply'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          ALWAYS perform a proper Manual J calculation (ACCA) before purchasing equipment.
          This tool provides planning estimates only. Oversizing causes short-cycling, humidity
          problems, and poor comfort.
        </p>
      </Card>

      <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-800 text-sm mb-2">⚠️ Important Disclaimer</h3>
        <p className="text-xs text-yellow-700">
          This is a simplified rule-of-thumb estimate only. Actual HVAC sizing requires a full
          Manual J heat load calculation per ACCA standards, taking into account local design
          temperatures, insulation values, window specifications, infiltration rates, internal loads,
          and ductwork design. Use this for budget planning only — consult a licensed HVAC mechanical
          engineer or contractor for final equipment selection.
        </p>
      </div>
    </div>
  );
}

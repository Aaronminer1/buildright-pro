import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { ToggleField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox, TermDef } from '../../components/ui/InfoBox';

const TABS = [
  { id: 'circuits',  label: 'Circuits & Panel',  icon: '⚡' },
  { id: 'wire',      label: 'Wire Estimate',      icon: '🔌' },
  { id: 'boxes',     label: 'Outlets & Boxes',    icon: '🔲' },
  { id: 'lighting',  label: 'Lighting Layout',    icon: '💡' },
];

// ─── Circuits & Panel ────────────────────────────────────────────────────────

function Circuits() {
  const [bedrooms,    setBedrooms]    = useState('3');
  const [bathrooms,   setBathrooms]   = useState('2');
  const [hasGarage,   setHasGarage]   = useState(true);
  const [hasLaundry,  setHasLaundry]  = useState(true);
  const [hasEV,       setHasEV]       = useState(false);
  const [hasElecRange,setHasElecRange] = useState(false);
  const [hasHotTub,   setHasHotTub]   = useState(false);

  const bed    = parseInt(bedrooms)  || 0;
  const bath   = parseInt(bathrooms) || 0;

  // Circuit counts per NEC 2023 Article 210
  const generalCircuits     = bed + 2;                       // ~1 per bedroom + living + dining
  const kitchenSABC         = 2;                             // NEC 210.11(C)(1): min 2 × 20A small appliance branch circuits
  const bathroomCircuits    = bath;                          // 1 × 20A per bath NEC 210.11(C)(3)
  const laundryCircuits     = hasLaundry ? 1 : 0;           // NEC 210.11(C)(2): 1 × 20A laundry
  const garageCircuits      = hasGarage ? 1 : 0;
  const hvacCircuits        = 2;                             // 1 condenser + 1 air handler
  const evCircuit           = hasEV ? 1 : 0;                // 50A dedicated
  const rangeCircuit        = hasElecRange ? 1 : 0;         // 50A dedicated
  const hotTubCircuit       = hasHotTub ? 1 : 0;            // 50A dedicated
  const dedicatedCircuits   = laundryCircuits + garageCircuits + hvacCircuits + evCircuit + rangeCircuit + hotTubCircuit;
  const totalCircuits       = generalCircuits + kitchenSABC + bathroomCircuits + dedicatedCircuits;

  // Panel sizing — rough load calculation
  const lightingVA    = (bed * 200 + 400) * 3;              // ~3 VA/SF rough
  const recepVA       = totalCircuits * 180;
  const cookVA        = hasElecRange ? 8000 : 0;
  const dryerVA       = hasLaundry   ? 5500 : 0;
  const hvacVA        = 5000;
  const miscVA        = hasEV ? 9600 : 0;
  const totalVA       = lightingVA + recepVA + cookVA + dryerVA + hvacVA + miscVA;
  const totalAmps     = Math.ceil(totalVA / 240);
  const recommendedPanel = totalAmps <= 100 ? 100 : totalAmps <= 150 ? 150 : 200;

  return (
    <div className="space-y-5">
      <InfoBox title="⚡ Electrical Basics — What Joe Needs to Know" variant="blue" collapsible>
        <p>Your home electrical system starts at the <strong>service panel</strong> (also called the breaker box or loadcenter). The utility company runs power to it, and it splits into individual <strong>circuits</strong> — each one protected by its own <strong>circuit breaker</strong>.</p>
        <p>Think of the panel like a hub, and each circuit like a garden hose running to a different part of the house. If too much current flows (a short circuit or overload), the breaker "trips" and shuts off that hose to prevent fire.</p>
        <TermDef term="Circuit breaker" def="A safety switch in the panel that automatically shuts off power if too much current flows through that circuit. Each circuit has its own breaker." />
        <TermDef term="20A vs 15A circuit" def="Amperage is the circuit's capacity. Kitchen countertops require 20A circuits (for small appliances). Bedrooms typically use 15A. The wire gauge and outlet must match the breaker." />
        <TermDef term="GFCI (Ground-Fault Circuit Interrupter)" def="A special outlet (or breaker) that detects tiny current leaks and shuts off in milliseconds. Required within 6 feet of water — kitchens, bathrooms, garages, outdoors." />
        <TermDef term="AFCI (Arc-Fault Circuit Interrupter)" def="A newer breaker type that detects arcing (sparking) in the wire — a common cause of house fires. Required by NEC 2014+ in all bedrooms, living rooms, kitchens, and most habitable spaces." />
        <TermDef term="Service size (100A / 200A)" def="The total amperage available to your whole house. 100A was standard for older homes; 200A is today's minimum for new construction. EV chargers, hot tubs, and whole-house heat pumps may require 200A+." />
        <p className="text-xs text-red-700 bg-red-50 p-2 rounded">🚨 <strong>Permits required.</strong> Electrical work requires a permit and inspection in nearly every jurisdiction. Unpermitted wiring is a fire hazard and will cause problems when selling your home. Always pull a permit.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Home Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Bedrooms"  value={bedrooms}  onChange={setBedrooms}  step={1} min={1} />
              <InputField label="Bathrooms" value={bathrooms} onChange={setBathrooms} step={1} min={1} />
            </div>
            <ToggleField label="Garage" checked={hasGarage} onChange={setHasGarage} />
            <ToggleField label="Laundry Room (washer/dryer)" checked={hasLaundry} onChange={setHasLaundry} />
            <ToggleField label="Electric Range / Oven" checked={hasElecRange} onChange={setHasElecRange}
              hint="Gas range uses only a small 120V outlet; electric range needs a dedicated 50A/240V circuit" />
            <ToggleField label="EV Charger (Level 2)" checked={hasEV} onChange={setHasEV}
              hint="Level 2 EV charger requires a dedicated 50A / 240V circuit" />
            <ToggleField label="Hot Tub / Spa" checked={hasHotTub} onChange={setHasHotTub}
              hint="Requires a dedicated GFCI-protected 50A circuit with a disconnect near the tub" />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Circuit Count Breakdown">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Total Circuits" value={totalCircuits} highlight />
              <ResultCard label="Recommended Panel" value={recommendedPanel} unit="amps" />
              <ResultCard label="General Lighting/Recep" value={generalCircuits} unit="× 15A" small />
              <ResultCard label="Kitchen SABC (NEC)" value={kitchenSABC} unit="× 20A req'd" small />
              <ResultCard label="Bathroom Circuits" value={bathroomCircuits} unit="× 20A" small />
              <ResultCard label="Dedicated Circuits" value={dedicatedCircuits} unit="circuits" small />
            </div>
          </Card>
          <Card title="Panel & Code Notes">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• All bedroom circuits require <strong>AFCI breakers</strong> (NEC 210.12)</p>
              <p>• Kitchen, bath, garage outlets require <strong>GFCI protection</strong></p>
              <p>• Leave <strong>20–30% spare breaker slots</strong> for future circuits</p>
              <p>• 200A panels have 40–42 slots; 100A panels typically have 20–24 slots</p>
              <p>• Estimated total load: ~<strong>{Math.round(totalVA / 100) * 100} VA</strong> ({totalAmps}A at 240V)</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Wire Estimate ────────────────────────────────────────────────────────────

function WireEstimate() {
  const [sqFt,      setSqFt]      = useState('1500');
  const [stories,   setStories]   = useState('1');
  const [bedrooms,  setBedrooms]  = useState('3');
  const [bathrooms, setBathrooms] = useState('2');

  const sqf  = parseFloat(sqFt)  || 0;
  const bed  = parseInt(bedrooms) || 0;
  const bath = parseInt(bathrooms) || 0;
  const stry = parseInt(stories)  || 1;

  // Wire runs estimated by circuit type
  // Each circuit = panel run + room loop. Rough: 1.5× sqrt(SF) per circuit + panel distance
  const panelWallFt  = stry > 1 ? 14 : 0;  // extra run for multi-story

  // 14/2 NM (15A general & lighting)
  const generalCircuits14 = bed + 2;
  const wire14_2 = Math.ceil(generalCircuits14 * (Math.sqrt(sqf) * 1.5 + panelWallFt + 20));

  // 12/2 NM (20A — kitchen SABC + bath + laundry)
  const circuits12 = 2 + bath + 1; // kitchen SABC + bathrooms + laundry
  const wire12_2 = Math.ceil(circuits12 * (Math.sqrt(sqf) * 1.5 + panelWallFt + 20));

  // 10/3 NM (30A — dryer)
  const wire10_3 = Math.ceil(1 * (panelWallFt + 30));

  // 6/3 NM (50A — range / EV)
  const wire6_3 = Math.ceil(1 * (panelWallFt + 40));

  // Add 15% waste/overage
  const tot14 = Math.ceil(wire14_2 * 1.15 / 250) * 250;  // round to 250ft rolls
  const tot12 = Math.ceil(wire12_2 * 1.15 / 250) * 250;

  return (
    <div className="space-y-5">
      <InfoBox title="🔌 Wire Gauge Guide — Match the Wire to the Breaker" variant="green" collapsible>
        <p>Electrical wire is sold as NM-B cable (brand name: Romex). The label "12/2" means: 12 gauge wires, 2 conductors (+ a bare ground). <strong>Never use smaller wire than the breaker size requires</strong> — undersized wire overheats and can cause fires.</p>
        <TermDef term="14 AWG" def="Goes with 15A breakers. Lighting circuits, general bedroom outlets. The most common wire in a house." />
        <TermDef term="12 AWG" def="Goes with 20A breakers. Kitchen small appliance circuits, bathrooms, laundry. Thicker, stiffer, more expensive." />
        <TermDef term="10 AWG" def="Goes with 30A breakers. Clothes dryer, window A/C units. Requires 3-wire cable (10/3 with ground)." />
        <TermDef term="6 AWG" def="Goes with 50A breakers. Electric range, hot tub, EV Level 2 charger. Stiff, requires special connectors." />
        <TermDef term="/2 vs /3 cable" def="14/2 means 2 conductors (black hot + white neutral + bare ground). 14/3 adds a red wire — used for 3-way switches and 240V circuits." />
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">⚠️ These estimates are rough order-of-magnitude. A licensed electrician will do a proper load calculation and wire take-off from the blueprints. Don't order wire without a plan.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Home Inputs">
          <div className="space-y-4">
            <InputField label="Home Square Footage" value={sqFt} onChange={setSqFt} unit="SF" />
            <SelectField label="Stories" value={stories} onChange={setStories}
              options={[
                { value: '1', label: '1 story' },
                { value: '2', label: '2 stories — longer panel runs' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Bedrooms"  value={bedrooms}  onChange={setBedrooms}  step={1} min={1} />
              <InputField label="Bathrooms" value={bathrooms} onChange={setBathrooms} step={1} min={1} />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Wire Rough Estimate">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="14/2 NM (15A circuits)" value={tot14} unit="ft" highlight />
              <ResultCard label="12/2 NM (20A circuits)" value={tot12} unit="ft" />
              <ResultCard label="10/3 NM (dryer 30A)" value={wire10_3 + 10} unit="ft" small />
              <ResultCard label="6/3 NM (range/EV 50A)" value={wire6_3 + 10} unit="ft" small />
            </div>
          </Card>
          <Card title="Buying Notes">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Wire is sold by the foot off a spool or in 25/50/100/250 ft rolls</p>
              <p>• Always verify your wire is <strong>NM-B (dry locations)</strong> — not NM or UF</p>
              <p>• Buy wire after your electrician produces a proper circuit plan — these are rough estimates only</p>
              <p>• <strong>Pull permits</strong> before buying — your inspector will want to see the wire gauge matches the breaker</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Outlets & Boxes ─────────────────────────────────────────────────────────

function OutletBoxes() {
  const [roomLen,  setRoomLen]  = useState('14');
  const [roomWid,  setRoomWid]  = useState('12');
  const [roomName, setRoomName] = useState('bedroom');
  const [switches, setSwitches] = useState('2');

  const perimeter = useMemo(() => {
    return 2 * ((parseFloat(roomLen)||0) + (parseFloat(roomWid)||0));
  }, [roomLen, roomWid]);

  // NEC 210.52: outlet within 6 ft of any door/opening; no point more than 6 ft from outlet
  // → outlet every 12 ft of wall run (so no point is more than 6 ft from one)
  const outlets      = Math.ceil(perimeter / 12) + 1;  // +1 for corner/door bonus
  const switchBoxes  = parseInt(switches) || 0;
  const totalBoxes   = outlets + switchBoxes;
  const gfciRequired = roomName === 'kitchen' || roomName === 'bathroom' || roomName === 'garage' || roomName === 'outdoor';
  const gfciOutlets  = gfciRequired ? outlets : 0;
  const stdOutlets   = outlets - gfciOutlets;
  const jboxes       = Math.ceil(outlets * 0.2); // ~20% get junction boxes for circuits threading through

  return (
    <div className="space-y-5">
      <InfoBox title="🔲 Outlet Spacing Rules (NEC 210.52)" variant="amber" collapsible>
        <p>The National Electrical Code (NEC) says: <strong>no point along a wall should be more than 6 feet from an outlet.</strong> This means outlets must be spaced no more than 12 feet apart (so you're always within 6 ft of one).</p>
        <p>Think of it this way: a standard 6-foot lamp cord should always be able to reach an outlet without an extension cord. That's the actual reason for the rule.</p>
        <TermDef term="Duplex receptacle" def="The standard outlet — two plugs side by side. What most people think of as an outlet." />
        <TermDef term="GFCI outlet" def="Has TEST and RESET buttons. Required within 6 feet of any water source (NEC 210.8). One GFCI outlet can 'protect' downstream standard outlets on the same circuit." />
        <TermDef term="Old-work vs new-work box" def="New-work (blue plastic) boxes nail directly to studs during framing. Old-work boxes cut into existing drywall. You want new-work boxes during construction." />
        <TermDef term="Device box vs junction box" def="Device box = holds an outlet or switch. Junction box = covered box where wires splice together (must remain accessible — can't be hidden in a wall permanently)." />
        <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">💡 Buy <strong>single-gang boxes</strong> for single switches and outlets. Use <strong>double-gang</strong> when two switches share one location (like at a 3-way switch arrangement).</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Room Inputs">
          <div className="space-y-4">
            <SelectField label="Room Type" value={roomName} onChange={setRoomName}
              options={[
                { value: 'bedroom',  label: 'Bedroom — general 15A outlets + AFCI required' },
                { value: 'kitchen',  label: 'Kitchen — 20A GFCI countertop circuits' },
                { value: 'bathroom', label: 'Bathroom — GFCI required; 20A dedicated' },
                { value: 'living',   label: 'Living/Family Room — AFCI required' },
                { value: 'garage',   label: 'Garage — all outlets must be GFCI' },
                { value: 'outdoor',  label: 'Outdoor — GFCI + weatherproof cover required' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Room Length" value={roomLen} onChange={setRoomLen} unit="ft" />
              <InputField label="Room Width"  value={roomWid} onChange={setRoomWid} unit="ft" />
            </div>
            <InputField label="Light Switches" value={switches} onChange={setSwitches}
              hint="Single-pole switches: 1 per usual. 3-way (top AND bottom of stairs) = 2 boxes"
              step={1} min={0} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Box Count">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Total Boxes" value={totalBoxes} highlight />
              <ResultCard label="Wall Perimeter" value={Math.round(perimeter)} unit="LF" />
              {gfciRequired ? (
                <ResultCard label="GFCI Outlets Required" value={gfciOutlets} unit="pcs" />
              ) : (
                <ResultCard label="Standard Outlets" value={stdOutlets} unit="pcs" small />
              )}
              <ResultCard label="Switch Boxes" value={switchBoxes} unit="pcs" small />
              <ResultCard label="Junction Boxes (approx)" value={jboxes} unit="pcs" small />
            </div>
          </Card>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            {gfciRequired && <p className="text-red-600 font-semibold">• All outlets in this space must be GFCI protected (NEC 210.8)</p>}
            <p>• Kitchen countertop outlets: min 2 SABC 20A circuits — outlets alternate between circuits</p>
            <p>• Bathrooms: 1 outlet within 36" of each sink (NEC 210.52(D))</p>
            <p>• Add 10-15% extra boxes for wiring errors and extras</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Lighting Layout ─────────────────────────────────────────────────────────

const LIGHTING_SCHEDULE = [
  { space: 'Living Room (150 SF)', type: 'Recessed (6")', qty: '6–8 cans', spacing: '4–5 ft apart', watts: '75–100W equiv (10W LED)', notes: 'Aim for 50 FC (footcandles) general, 150 FC task areas' },
  { space: 'Kitchen (120 SF)', type: 'Recessed + Under-cabinet', qty: '6–8 cans + strip lights', spacing: '3–4 ft OC', watts: '75–100W per can', notes: 'NEC requires kitchen dedicated circuits, not lighting circuits' },
  { space: 'Bedroom (120–150 SF)', type: 'Ceiling flush-mount or recessed', qty: '4–6 fixtures', spacing: 'Center + corners', watts: '60–75W equiv', notes: 'Night-stand outlets needed; fan/light combo at center' },
  { space: 'Bathroom (50 SF)', type: 'Vanity bar + exhaust fan', qty: '1 vanity + 1 fan', spacing: 'Vanity over mirror', watts: '2×60W vanity bar', notes: 'NEC 210.11(C)(3): dedicated 20A bath circuit; fan must vent outside' },
  { space: 'Hallway (per 6 LF)', type: 'Recessed or surface', qty: '1 per 6 ft', spacing: '~6 ft apart', watts: '50–60W equiv', notes: 'Must have switched at each end if over 10 ft' },
  { space: 'Garage (2-car)', type: 'LED shop lights / recessed', qty: '4–6 4-ft strip lights', spacing: '6–8 ft apart', watts: '40W per 4-ft LED strip', notes: 'GFCI outlets; 20A dedicated circuit; door opener separate circuit' },
  { space: 'Exterior', type: 'Porch/security/flood', qty: 'Per design', spacing: 'Entry points', watts: 'Motion-sensor LEDs', notes: 'Must be GFCI; weatherproof cover; consider photocell or timer' },
  { space: 'Stairway', type: 'Recessed or pendant', qty: '1 per landing/tread run', spacing: 'Uniform', watts: '50–60W equiv', notes: 'MUST be 3-way switched (top AND bottom) per NEC 210.52(H)' },
];

function Lighting() {
  const [roomSqFt,  setRoomSqFt]  = useState('150');
  const [ceilHt,    setCeilHt]    = useState('9');
  const [canSize,   setCanSize]   = useState('6');

  const sqf  = parseFloat(roomSqFt) || 0;
  const ht   = parseFloat(ceilHt)   || 9;
  const can  = parseFloat(canSize)  || 6;

  // Recessed layout: spacing = 1.5× can diameter for ceiling height ≤ 8', more spread for higher ceilings
  // General rule: rows = sqrt(SF/spacing²), round up
  const canSpacingFt = ht >= 10 ? (can / 12) * 2.0 : (can / 12) * 1.5;
  // Coverage area per can: ≈ π × (cone radius)²  where cone radius ≈ height × tan(30°) ≈ ht × 0.577
  const coneRadFt    = ht * 0.45;  // conservative
  const coversPerCan = Math.PI * coneRadFt * coneRadFt;
  const cansNeeded   = Math.ceil(sqf / coversPerCan);
  const comboCans    = Math.ceil(cansNeeded / 2);  // half can be combined fixture circuits

  return (
    <div className="space-y-5">
      <InfoBox title="💡 Lighting Basics for Joe" variant="purple" collapsible>
        <p>Lighting has two jobs: <strong>general (ambient) lighting</strong> to see where you're going, and <strong>task lighting</strong> for specific work areas (counters, desks, vanities). Most rooms need both.</p>
        <p><strong>Recessed cans</strong> are the most popular choice for new construction because they're clean-looking and work on any ceiling height. The 6" can is the most common; 4" cans go in lower ceilings and accent areas.</p>
        <TermDef term="Recessed can / pot light" def="A light fixture installed inside the ceiling so only the trim ring and bulb are visible. Needs an 'IC-rated' can if it may touch insulation (which it almost always will)." />
        <TermDef term="IC-rated" def="IC = Insulation Contact. An IC-rated can won't overheat if insulation is piled on top. Required by code whenever recessed lights are installed in an insulated ceiling." />
        <TermDef term="Footcandle (FC)" def="A unit of illumination. 1 FC = the light one candle produces 1 foot away. Living rooms need ~30–50 FC; kitchens ~50–75 FC; reading areas ~100+ FC." />
        <TermDef term="3-way switch" def="Two switches that control the same light from two different locations. Required at stairways and hallways over 10 ft so you don't have to backtrack to turn lights off." />
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Room Inputs">
          <div className="space-y-4">
            <InputField label="Room Square Footage" value={roomSqFt} onChange={setRoomSqFt} unit="SF" />
            <InputField label="Ceiling Height" value={ceilHt} onChange={setCeilHt} unit="ft"
              hint="Higher ceilings need more widely-spaced or brighter fixtures" />
            <SelectField label="Can / Fixture Size" value={canSize} onChange={setCanSize}
              options={[
                { value: '4', label: '4" can — accent & tight spaces' },
                { value: '6', label: '6" can — standard general lighting' },
                { value: '8', label: '8" can — large rooms, high ceilings' },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Lighting Layout">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Recessed Cans (general)" value={cansNeeded} highlight />
              <ResultCard label="Recommended Spacing" value={Math.round(canSpacingFt * 10) / 10} unit="ft OC" />
              <ResultCard label="Fixture Circuit Loads" value={comboCans} unit="pairs" small />
              <ResultCard label="Estimated LED Wattage" value={cansNeeded * 10} unit="W total" small />
            </div>
          </Card>
          <Card title="Room-by-Room Guide">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-1.5 pr-2 font-semibold text-slate-700">Space</th>
                    <th className="text-left py-1.5 pr-2 font-semibold text-slate-700">Fixture Type</th>
                    <th className="text-left py-1.5 font-semibold text-slate-700">Qty / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {LIGHTING_SCHEDULE.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-1.5 pr-2 text-slate-700 font-medium">{row.space}</td>
                      <td className="py-1.5 pr-2 text-slate-600">{row.type}</td>
                      <td className="py-1.5 text-slate-500">{row.qty} — {row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function Electrical() {
  const [tab, setTab] = useState('circuits');
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Electrical Rough-In</h1>
        <p className="text-slate-500 mt-1">Circuits, wire sizing, outlet boxes, and lighting layout planning</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'circuits' && <Circuits />}
      {tab === 'wire'     && <WireEstimate />}
      {tab === 'boxes'    && <OutletBoxes />}
      {tab === 'lighting' && <Lighting />}
    </div>
  );
}

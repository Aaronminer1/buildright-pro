import { useState } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { ToggleField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox, TermDef } from '../../components/ui/InfoBox';

const TABS = [
  { id: 'fixtures',   label: 'Fixtures & Rough-In', icon: '🚿' },
  { id: 'dwv',        label: 'DWV Pipe',             icon: '🔩' },
  { id: 'supply',     label: 'Supply Lines',         icon: '💧' },
  { id: 'waterheater',label: 'Water Heater',         icon: '🔥' },
];

// ─── Rough-In Dimensions Reference ───────────────────────────────────────────
const ROUGH_IN_DIMS = [
  { fixture: 'Toilet',              roughIn: '12" flange from finished wall',     drain: '3" closet flange',    vent: '2" vent', supply: '1/2" cold only @ 6" AFF, 6" left of center' },
  { fixture: 'Bathroom Sink',       roughIn: '4" drain on centerline',           drain: '1-1/2" P-trap',       vent: '1.5" vent', supply: '1/2" H+C @ 20" AFF, 4" apart' },
  { fixture: 'Kitchen Sink',        roughIn: '4" drain centered under sink',     drain: '1-1/2" or 2" P-trap', vent: '2" vent', supply: '1/2" H+C @ 20" AFF, 8" apart' },
  { fixture: 'Tub / Shower',        roughIn: 'Drain centered 14" from wall',     drain: '2" P-trap',           vent: '2" vent', supply: '1/2" H+C valve @ 28–36" AFF' },
  { fixture: 'Shower (walk-in)',     roughIn: 'Drain per pan layout',             drain: '2" P-trap',           vent: '2" vent', supply: '1/2" H+C + optional 3rd body spray' },
  { fixture: 'Washing Machine',     roughIn: 'Standpipe 18–30" AFF',            drain: '2" standpipe/trap',   vent: '2" vent', supply: '1/2" H+C with shutoff valves' },
  { fixture: 'Dishwasher',          roughIn: 'Under counter drain loop',        drain: 'Air gap to sink drain', vent: 'High loop or air gap', supply: '1/2" hot only' },
  { fixture: 'Ice Maker / Fridge',  roughIn: 'Stub-out behind unit',            drain: 'N/A',                 vent: 'N/A', supply: '1/4" cold at 48" AFF' },
  { fixture: 'Outdoor Hose Bibb',   roughIn: 'Stub through exterior wall',      drain: 'N/A',                 vent: 'N/A', supply: '1/2" with shutoff inside' },
  { fixture: 'Water Heater',        roughIn: 'Per manufacturer',                drain: '3/4" T&P drain + floor drain', vent: 'Per type', supply: '3/4" H+C' },
];

// ─── Fixtures & Rough-In ─────────────────────────────────────────────────────

function Fixtures() {
  const [bathFull,   setBathFull]   = useState('2');
  const [bathHalf,   setBathHalf]   = useState('1');
  const [kitchen,    setKitchen]    = useState('1');
  const [laundry,    setLaundry]    = useState('1');
  const [hasDishwasher, setHasDishwasher] = useState(true);
  const [hasIceMaker, setHasIceMaker] = useState(true);
  const [hasHosebibb, setHasHosebibb] = useState(true);

  const full = parseInt(bathFull)  || 0;
  const half = parseInt(bathHalf)  || 0;
  const kit  = parseInt(kitchen)   || 0;
  const lndr = parseInt(laundry)   || 0;

  // Fixture unit totals (for drain/vent sizing reference — DFUs per IPC Table 709.1)
  const toiletDFU    = full * 3 + half;
  const lavDFU       = full * 1 + half * 1;
  const tubDFU       = full * 2;
  const kitSinkDFU   = kit * 2;
  const dishDFU      = hasDishwasher ? 2 : 0;
  const laundryDFU   = lndr * 2;
  const totalDFU     = toiletDFU + lavDFU + tubDFU + kitSinkDFU + dishDFU + laundryDFU;

  const totalFixtures = full * 4 + half * 2 + kit * (1 + (hasDishwasher ? 1 : 0)) + lndr + (hasIceMaker ? 1 : 0) + (hasHosebibb ? 2 : 0);

  return (
    <div className="space-y-5">
      <InfoBox title="🚿 Plumbing 101 — What Goes Where" variant="blue" collapsible>
        <p>Your home's plumbing has two completely separate systems: <strong>supply</strong> (pressurized clean water coming IN) and <strong>drain-waste-vent (DWV)</strong> (gravity-fed used water going OUT). They never connect — that separation is what keeps sewage from mixing with drinking water.</p>
        <p><strong>Rough-in</strong> is the stage where you install all the pipes INSIDE the walls before drywall goes up. This is the most complicated part of plumbing — and once walls are closed, mistakes are very expensive to fix. Always get this inspected.</p>
        <TermDef term="P-trap" def="The curved pipe under every drain that holds a small amount of water. This water seal blocks sewer gases (which are toxic and flammable) from entering your home. Never install a drain without one." />
        <TermDef term="Closet flange" def="The fitting that mounts the toilet to the floor. It must be at the FINISHED floor height (not subfloor) and exactly 12 inches from the finished wall." />
        <TermDef term="DFU (Drainage Fixture Unit)" def="A unit used to size drain pipes. A toilet = 3 DFU; bathroom sink = 1 DFU. Add them up; larger buildings need larger pipes." />
        <TermDef term="Rough-in dimension" def="Where to locate the drain stub-outs and supply stubs before drywall. Get these wrong and your toilet won't fit, or the sink drain won't align with the vanity." />
        <TermDef term="Stub-out" def="A short pipe left sticking out of the wall or floor, capped off, waiting to be connected to the finished fixture later." />
        <p className="text-xs text-red-700 bg-red-50 p-2 rounded">🚨 <strong>Plumbing requires permits and inspections.</strong> The rough-in inspection happens BEFORE walls are closed. Don't skip it — you'll be tearing out drywall later if inspector finds issues.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Fixture Count">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Full Baths" value={bathFull} onChange={setBathFull}
                hint="Toilet + sink + tub/shower" step={1} min={0} />
              <InputField label="Half Baths" value={bathHalf} onChange={setBathHalf}
                hint="Toilet + sink only (powder room)" step={1} min={0} />
            </div>
            <InputField label="Kitchen Sinks" value={kitchen} onChange={setKitchen} step={1} min={0} />
            <InputField label="Laundry Rooms" value={laundry} onChange={setLaundry} step={1} min={0} />
            <ToggleField label="Dishwasher" checked={hasDishwasher} onChange={setHasDishwasher} />
            <ToggleField label="Refrigerator Ice Maker" checked={hasIceMaker} onChange={setHasIceMaker} />
            <ToggleField label="Exterior Hose Bibbs (2)" checked={hasHosebibb} onChange={setHasHosebibb}
              hint="Front and rear frost-free hose bibb — each needs a shutoff inside the wall" />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Plumbing Summary">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Total Fixture Connections" value={totalFixtures} highlight />
              <ResultCard label="Total Drain Fixture Units" value={totalDFU} unit="DFU" />
              <ResultCard label="Main Drain Size" value={totalDFU > 26 ? 4 : 3} unit='" pipe' />
              <ResultCard label="Toilets" value={full + half} unit="fixtures" small />
              <ResultCard label="Sink Drains" value={full + half + kit} unit="drains" small />
              <ResultCard label="Tubs / Showers" value={full} unit="fixtures" small />
            </div>
          </Card>
          <Card title="Pipe Size Rule of Thumb">
            <div className="space-y-1 text-sm text-slate-600">
              <p>• <strong>Main sewer / house drain:</strong> 4" minimum (IPC 710.1)</p>
              <p>• <strong>Toilet drain:</strong> 3" minimum — never smaller</p>
              <p>• <strong>Tub/shower drain:</strong> 2" minimum</p>
              <p>• <strong>Sink/lav drain:</strong> 1-1/2" minimum</p>
              <p>• <strong>Water supply mains:</strong> 3/4" → branch to 1/2" at fixtures</p>
            </div>
          </Card>
        </div>
      </div>

      <Card title="Rough-In Dimension Reference">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-3 font-semibold text-slate-700 min-w-[110px]">Fixture</th>
                <th className="text-left py-2 pr-3 font-semibold text-slate-700 min-w-[150px]">Drain Location</th>
                <th className="text-left py-2 pr-3 font-semibold text-slate-700 min-w-[80px]">Drain Size</th>
                <th className="text-left py-2 font-semibold text-slate-700">Supply Location</th>
              </tr>
            </thead>
            <tbody>
              {ROUGH_IN_DIMS.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-3 font-medium text-slate-700">{row.fixture}</td>
                  <td className="py-2 pr-3 text-slate-600">{row.roughIn}</td>
                  <td className="py-2 pr-3 font-mono text-blue-700">{row.drain}</td>
                  <td className="py-2 text-slate-500">{row.supply}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">AFF = Above Finished Floor. Always confirm with your specific fixture manufacturer's installation sheet — dimensions vary by brand.</p>
      </Card>
    </div>
  );
}

// ─── DWV Pipe ────────────────────────────────────────────────────────────────

function DWVPipe() {
  const [stories,     setStories]     = useState('1');
  const [bathrooms,   setBathrooms]   = useState('2');
  const [toilets,     setToilets]     = useState('2');
  const [sinks,       setSinks]       = useState('4');
  const [crawlOrBasement, setCrawl]   = useState('slab');

  const stories_ = parseInt(stories)   || 1;
  const bath_    = parseInt(bathrooms) || 0;
  const toilet_  = parseInt(toilets)   || 0;
  const sink_    = parseInt(sinks)     || 0;

  // Rough pipe quantities (LF estimates)
  const mainDrainLF  = stories_ === 1 ? 20 : 35;     // horizontal main to sewer
  const stackLF      = stories_ * 12;                  // vertical stacks
  const totalPVC4    = mainDrainLF + stackLF;
  const totalPVC3    = toilet_ * 8;   // 3" toilet drain branches
  const totalPVC2    = bath_ * 12 + sink_ * 6;
  const totalPVC1_5  = sink_ * 8;
  const fittings4    = Math.ceil(totalPVC4 / 5);
  const cleanouts    = stories_ + 2;

  return (
    <div className="space-y-5">
      <InfoBox title="🔩 DWV System — Drains, Waste & Vents" variant="green" collapsible>
        <p>DWV is the drain side of your plumbing — it's a completely different system from the pressurized supply water. DWV works by <strong>gravity</strong>: pipes must slope downward at 1/4 inch per foot so waste flows out on its own.</p>
        <p>The <strong>vent</strong> part is critical and often confusing to beginners. Every drain needs air behind it to flow properly — otherwise it creates a siphon that sucks the water out of your P-traps (defeating their gas-blocking purpose). Vents run up through the walls and exit through the roof.</p>
        <TermDef term="Stack" def="A large vertical pipe (usually 3-4 inch PVC) that carries waste down from upper floors. Multiple fixtures branch into it. Called the 'soil stack' when it connects to a toilet." />
        <TermDef term="Wet vent" def="A single pipe that acts as both a drain AND a vent for another fixture simultaneously. Allowed in specific configurations by the IPC — saves pipe runs." />
        <TermDef term="Cleanout" def="A capped fitting that provides access to the drain pipe for clearing clogs. Required at the base of each stack, where the pipe changes direction, and outside the building." />
        <TermDef term="Slope (fall)" def={`Drain pipes must slope 1/4" per foot toward the sewer. Too little slope = solids don't move. Too much slope = water runs ahead of solids leaving them behind.`} />
        <TermDef term="PVC vs ABS" def="Both plastic drain pipes. PVC is white/grey; ABS is black. Don't mix them without a transition cement. Check local code — some areas require one or the other." />
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="System Inputs">
          <div className="space-y-4">
            <SelectField label="Foundation / Stories" value={crawlOrBasement} onChange={setCrawl}
              options={[
                { value: 'slab',     label: 'Slab-on-grade — drains in concrete' },
                { value: 'crawl',    label: 'Crawl space — drains accessible under floor' },
                { value: 'basement', label: 'Basement — lowest floor drains below sewer?' },
              ]}
            />
            <SelectField label="Stories" value={stories} onChange={setStories}
              options={[
                { value: '1', label: '1 story' },
                { value: '2', label: '2 stories — longer stack + branch runs' },
              ]}
            />
            <div className="grid grid-cols-3 gap-3">
              <InputField label="Toilets"   value={toilets}   onChange={setToilets}   step={1} min={0} />
              <InputField label="Sinks"     value={sinks}     onChange={setSinks}     step={1} min={0} />
              <InputField label="Bathrooms" value={bathrooms} onChange={setBathrooms} step={1} min={0} />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="DWV Pipe Estimates">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label='4" PVC (main/stack)' value={totalPVC4} unit="LF" highlight />
              <ResultCard label='3" PVC (toilet branches)' value={totalPVC3} unit="LF" />
              <ResultCard label='2" PVC (tub/shower)' value={totalPVC2} unit="LF" small />
              <ResultCard label='1.5" PVC (sink drains)' value={totalPVC1_5} unit="LF" small />
              <ResultCard label='4" Fittings (90s, tees, wyes)' value={fittings4} unit="pcs" small />
              <ResultCard label="Cleanouts" value={cleanouts} unit="pcs" small />
            </div>
          </Card>
          {crawlOrBasement === 'basement' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              <p className="font-semibold">⚠️ Basement Below Sewer Level?</p>
              <p className="mt-1">If your basement floor is below the municipal sewer, you cannot gravity-drain a basement toilet or floor drain. You'll need a <strong>sewage ejector pump</strong> (upflush system) — a sealed tank with a grinder pump that forces waste up to the house drain. Factor in ~$800–1,500 for the unit.</p>
            </div>
          )}
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            <p>• All DWV pipe material: Schedule 40 PVC (white) or ABS (black) — check local code</p>
            <p>• Vent pipe can be 1.5" or 2" thinner-wall PVC — lighter & cheaper for upper runs</p>
            <p>• Buy 10% extra for miscalculations and fittings</p>
            <p>• Slab work: coordinate pipe locations BEFORE concrete pour — very expensive to fix after</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Supply Lines (PEX) ──────────────────────────────────────────────────────

function SupplyLines() {
  const [stories,   setStories]   = useState('1');
  const [bathrooms, setBathrooms] = useState('2');
  const [kitchens,  setKitchens]  = useState('1');
  const [laundry,   setLaundry]   = useState('1');
  const [pexType,   setPexType]   = useState('pex-a');

  const stry = parseInt(stories)   || 1;
  const bath = parseInt(bathrooms) || 0;
  const kit  = parseInt(kitchens)  || 0;
  const lndr = parseInt(laundry)   || 0;

  // Supply layout: home-run from manifold OR trunk-and-branch
  // Each fixture gets 2 runs (hot + cold), estimated run length 20-40 ft
  const fixturesTotal = bath * 3 + kit * 2 + lndr * 2 + 2 + 1; // +outdoor bibbs + water heater
  const avgRunFt      = 25 + stry * 10;
  const pex_3_4       = Math.ceil((stry * 15) + (kit * 20) + 20); // main trunks 3/4"
  const pex_1_2       = Math.ceil(fixturesTotal * 2 * avgRunFt);   // hot+cold per fixture
  const manifoldPorts = fixturesTotal * 2;
  const crimpsOrClips = Math.ceil(pex_1_2 / 5);                    // ~1 connection per 5 LF
  const shutoffs      = fixturesTotal * 2;                         // under each fixture

  return (
    <div className="space-y-5">
      <InfoBox title="💧 PEX Tubing — The Modern Way to Run Water" variant="amber" collapsible>
        <p><strong>PEX</strong> (cross-linked polyethylene) has largely replaced copper in residential new construction. It's flexible like a garden hose, doesn't corrode, doesn't burst as easily when frozen, and costs significantly less than copper.</p>
        <p>The most popular installation method is <strong>home-run manifold</strong>: a central manifold (like a circuit breaker panel, but for water) with individual dedicated lines running to each fixture. This means if a toilet supply leaks, you turn off just that valve at the manifold — not the whole house.</p>
        <TermDef term="PEX-A vs PEX-B" def="PEX-A (Uponor, Rehau) is more flexible, can be expanded for fittings (no clamps needed). PEX-B (SharkBite, generic) is stiffer but cheaper. PEX-A is the pro choice; PEX-B is common for DIY repairs." />
        <TermDef term="Manifold" def="A brass or plastic block with multiple valved ports — one port per fixture. Hot water manifold + cold water manifold sit near the water heater. Each port has its own shutoff." />
        <TermDef term="Crimp vs clamp vs expansion fitting" def="Three ways to join PEX. Crimp (copper rings + crimp tool) is cheapest. Clamp (stainless clamps) is easier. Expansion (PEX-A only) is strongest. All are code-approved." />
        <TermDef term='3/4" vs 1/2" PEX' def='Main lines running from the water heater/manifold to the manifold are 3/4". Branch lines from manifold to individual fixtures are 1/2". This sizing maintains water pressure.' />
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="System Inputs">
          <div className="space-y-4">
            <SelectField label="PEX Type" value={pexType} onChange={setPexType}
              options={[
                { value: 'pex-a', label: 'PEX-A (Uponor/Rehau) — most flexible, expansion fittings' },
                { value: 'pex-b', label: 'PEX-B (generic) — affordable, crimp/clamp fittings' },
              ]}
            />
            <SelectField label="Stories" value={stories} onChange={setStories}
              options={[
                { value: '1', label: '1 story — shorter runs' },
                { value: '2', label: '2 stories — longer runs from manifold' },
              ]}
            />
            <div className="grid grid-cols-3 gap-3">
              <InputField label="Bathrooms" value={bathrooms} onChange={setBathrooms} step={1} min={0} />
              <InputField label="Kitchens"  value={kitchens}  onChange={setKitchens}  step={1} min={0} />
              <InputField label="Laundry"   value={laundry}   onChange={setLaundry}   step={1} min={0} />
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="PEX Estimates">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label='3/4" PEX (mains)' value={pex_3_4} unit="LF" highlight />
              <ResultCard label='1/2" PEX (branches)' value={pex_1_2} unit="LF" />
              <ResultCard label="Manifold Ports Needed" value={manifoldPorts} unit="ports" small />
              <ResultCard label="Fixture Shutoff Valves" value={shutoffs} unit="pcs" small />
              <ResultCard label="Crimp / Clamp Fittings" value={crimpsOrClips} unit="pcs (est)" small />
              <ResultCard label="Total Fixture Runs" value={fixturesTotal} unit="runs" small />
            </div>
          </Card>
          <Card title="Key Material Notes">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• PEX-A sold by Uponor in 100 ft, 300 ft, and 500 ft rolls</p>
              <p>• Add <strong>15% waste</strong> for bends, extra length to manifold, and mistakes</p>
              <p>• Install <strong>stub-out brackets</strong> at each fixture to hold the pipe rigid behind the wall</p>
              <p>• Use <strong>nail plates</strong> wherever PEX passes through a stud less than 1.25" from the face</p>
              <p>• Pressure-test the system BEFORE closing walls (inspector will require this)</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Water Heater ────────────────────────────────────────────────────────────

function WaterHeater() {
  const [people,    setPeople]    = useState('4');
  const [heaterType, setHeaterType] = useState('tank');
  const [fuel,      setFuel]      = useState('gas');

  const numPeople = parseInt(people) || 0;

  // First Hour Rating (FHR) needed
  // Rule: (numPeople - 1) × 12 + 20 gallons FHR minimum
  const fhrNeeded = Math.ceil((numPeople - 1) * 12 + 20);
  const tankSize  = numPeople <= 2 ? 40 : numPeople <= 4 ? 50 : numPeople <= 6 ? 65 : 80;

  // Tankless sizing: GPM needed = simultaneous demand
  // Shower = 2 GPM; sink = 0.5 GPM; tub fill = 4 GPM
  const simultaneousGPM = Math.min(numPeople, 3) * 2.5; // rough
  const btuNeeded = (simultaneous: number) => Math.ceil(simultaneous * 500 * 70);
  const btu = btuNeeded(simultaneousGPM);
  const kW  = Math.ceil(btu / 3412);

  return (
    <div className="space-y-5">
      <InfoBox title="🔥 Water Heater — Tank vs Tankless vs Heat Pump" variant="purple" collapsible>
        <p>Every house needs a way to make hot water. Three main options:</p>
        <p><strong>Tank water heater</strong>: Stores 40–80 gallons of pre-heated water. Simple, cheap to install ($800–1,200), but runs 24/7 even when you're on vacation (standby heat loss). Most common in homes.</p>
        <p><strong>Tankless (on-demand)</strong>: Heats water only when you turn on the tap. Endless hot water, more efficient, but $2,000–4,000 installed and requires larger gas line (or very large electrical service). Takes 2–3 seconds to get hot water to the tap.</p>
        <p><strong>Heat Pump Water Heater (HPWH)</strong>: Runs like a refrigerator in reverse — extracts heat from room air and puts it into the water. 3–4× more efficient than electric resistance. Best long-term cost. Requires 700+ SF of unconditioned space around it. $1,200–2,500 unit price.</p>
        <TermDef term="First Hour Rating (FHR)" def="The gallons of hot water a tank can deliver in the first hour starting from fully heated. This is the key spec to match, not just tank size." />
        <TermDef term="Energy Factor (EF) / UEF" def="How efficiently the heater converts fuel to hot water. Higher = cheaper to run. Gas tanks: 0.6–0.7 EF; heat pump: 2.0–4.0 UEF; tankless gas: 0.82–0.96 EF." />
        <TermDef term="T&P valve" def="Temperature & Pressure relief valve. Required on every water heater — it prevents the tank from becoming a rocket if pressure/temp gets too high. Must drain to a floor drain or outdoors." />
        <TermDef term="Dielectric union" def="A fitting used where copper pipe meets the steel water heater connections. Prevents galvanic corrosion between dissimilar metals. Required by code." />
        <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">💡 <strong>New in many states:</strong> Heat Pump Water Heaters may now qualify for federal tax credits (up to $600) and utility rebates. Check the Inflation Reduction Act credits before buying.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Household Inputs">
          <div className="space-y-4">
            <InputField label="People in Household" value={people} onChange={setPeople} step={1} min={1}
              hint="Full-time residents — affects hot water demand" />
            <SelectField label="Heater Type" value={heaterType} onChange={setHeaterType}
              options={[
                { value: 'tank',     label: 'Storage Tank — standard, simple' },
                { value: 'tankless', label: 'Tankless (on-demand) — endless hot water, higher cost' },
                { value: 'hpwh',     label: 'Heat Pump Water Heater — most efficient electric option' },
              ]}
            />
            <SelectField label="Fuel Source" value={fuel} onChange={setFuel}
              options={[
                { value: 'gas',      label: 'Natural gas — faster recovery, lower operating cost' },
                { value: 'propane',  label: 'Propane — same as gas, tank delivery needed' },
                { value: 'electric', label: 'Electric — easier install, higher operating cost (unless HPWH)' },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Recommendations">
            {heaterType === 'tank' && (
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Recommended Tank Size" value={tankSize} unit="gallons" highlight />
                <ResultCard label="First Hour Rating Needed" value={fhrNeeded} unit="gal/hr" />
                <ResultCard label="People Served" value={numPeople} unit="occupants" small />
                {fuel === 'gas' && <ResultCard label="Typ. BTU Input" value={40000} unit="BTU/hr" small />}
                {fuel === 'electric' && <ResultCard label="Typ. Wattage" value={4500} unit="watts (240V)" small />}
              </div>
            )}
            {heaterType === 'tankless' && (
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Simultaneous GPM Needed" value={Math.round(simultaneousGPM * 10)/10} unit="GPM" highlight />
                {fuel !== 'electric' && <ResultCard label="BTU Input Needed" value={btu} unit="BTU/hr" />}
                {fuel === 'electric' && <ResultCard label="Electrical Size Needed" value={kW} unit="kW" />}
                <ResultCard label="Gas Line Size" value={fuel !== 'electric' ? '3/4"' : 'N/A'} unit="" small />
              </div>
            )}
            {heaterType === 'hpwh' && (
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Recommended Tank Size" value={tankSize >= 65 ? 80 : 65} unit="gallons" highlight />
                <ResultCard label="Min Room Volume" value={700} unit="cu ft" />
                <ResultCard label="Electrical Circuit" value={30} unit="A / 240V" small />
                <ResultCard label="Estimated UEF" value={'3.5'} unit="" small />
              </div>
            )}
          </Card>
          <Card title="Installation Checklist">
            <div className="space-y-1 text-sm text-slate-600">
              <p>• Install a T&P (temperature & pressure) relief valve drain line to within 6" of floor</p>
              <p>• Use dielectric unions where connecting to copper pipe</p>
              <p>• Provide a floor drain or drain pan under the unit</p>
              {fuel !== 'electric' && <p>• Gas line: {heaterType === 'tankless' ? '3/4" min (verify BTU demand)' : '1/2" for tanks up to 50K BTU'}</p>}
              {heaterType === 'hpwh' && <p>• HPWH needs 700+ SF of unconditioned air to draw from — basement or garage ideal</p>}
              <p>• Insulate first 6 feet of hot supply pipe</p>
              <p>• Set temperature to 120°F (reduces scalding risk and energy use)</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function Plumbing() {
  const [tab, setTab] = useState('fixtures');
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Plumbing Rough-In</h1>
        <p className="text-slate-500 mt-1">Fixture layout, DWV pipe sizing, PEX supply, and water heater planning</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'fixtures'    && <Fixtures />}
      {tab === 'dwv'         && <DWVPipe />}
      {tab === 'supply'      && <SupplyLines />}
      {tab === 'waterheater' && <WaterHeater />}
    </div>
  );
}

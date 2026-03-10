import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox, TermDef } from '../../components/ui/InfoBox';

const TABS = [
  { id: 'hangers',   label: 'Joist Hangers',    icon: '🔩' },
  { id: 'hurricane', label: 'Hurricane Ties',    icon: '💨' },
  { id: 'fasteners', label: 'Screws & Nails',    icon: '📌' },
  { id: 'schedule',  label: 'Nail Schedule',     icon: '📋' },
];

// ─── Joist Hangers ───────────────────────────────────────────────────────────

function JoistHangers() {
  const [span,     setSpan]     = useState('20');
  const [spacing,  setSpacing]  = useState('16');
  const [joistSz,  setJoistSz]  = useState('2x10');
  const [beamEnds, setBeamEnds] = useState('2');

  const joistCount = useMemo(() => {
    const sp = parseFloat(span) || 0;
    const oc = parseFloat(spacing) || 16;
    return oc > 0 ? Math.ceil(sp / (oc / 12)) + 1 : 0;
  }, [span, spacing]);

  const hangers      = joistCount * 2;                   // both ends
  const beamHangers  = (parseInt(beamEnds) || 0) * 2;   // beam/LVL hangers
  const totalHangers = hangers + beamHangers;
  const totalNails   = totalHangers * 8;
  const nailLbs      = Math.ceil(totalNails / 200);      // ~200 per lb for 10d joist-hanger nails

  return (
    <div className="space-y-5">
      <InfoBox title="🔩 What Is a Joist Hanger — and Why Do You Need One?" variant="blue" collapsible>
        <p>A <strong>joist hanger</strong> is a small metal bracket (usually galvanized steel) that holds the end of a floor joist or ceiling joist against a beam or rim board. Without it, you'd be relying only on a few toenailed nails — which can pull out over time or under load.</p>
        <p><strong>Why they matter:</strong> Code requires metal connectors in most jurisdictions. They dramatically increase the strength of floor connections and prevent joists from twisting off their bearing points when someone walks across the floor.</p>
        <TermDef term="Rim joist / band board" def="The outer perimeter joist that runs along the top of the foundation wall. All floor joists attach to it using hangers." />
        <TermDef term="LUS / HUS hangers" def="Simpson Strong-Tie product names. LUS = light-duty, HUS = heavy-duty. Match the hanger to your joist size (e.g. LUS210 for 2x10)." />
        <TermDef term="On Center (OC)" def={`Distance measured from the center of one joist to the center of the next. 16" OC is standard floors; 12" OC is used for tile or heavy loads.`} />
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">⚠️ Always use <strong>joist-hanger nails</strong> (short, fat 10d×1.5\" or 1.5\" × 0.148\" dia) — NOT regular framing nails. The holes in the hanger are sized for these specific nails.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Floor System Inputs">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Floor Span" value={span} onChange={setSpan} unit="ft"
                hint="Width of the room floor — the joists bridge this distance" />
              <SelectField label="Joist Spacing" value={spacing} onChange={setSpacing}
                options={[
                  { value: '12', label: '12" OC — tile floors, heavy loads' },
                  { value: '16', label: '16" OC — standard (most homes)' },
                  { value: '19.2', label: '19.2" OC — engineered lumber' },
                  { value: '24', label: '24" OC — light-use areas' },
                ]}
              />
            </div>
            <SelectField label="Joist Size" value={joistSz} onChange={setJoistSz}
              options={[
                { value: '2x6',  label: '2×6 — short spans up to 10 ft' },
                { value: '2x8',  label: '2×8 — spans up to 13 ft' },
                { value: '2x10', label: '2×10 — spans up to 16 ft (most common)' },
                { value: '2x12', label: '2×12 — longer spans up to 20 ft' },
                { value: 'LVL',  label: 'LVL beam — engineered, longer spans' },
              ]}
            />
            <InputField label="Beam/LVL Connection Points" value={beamEnds} onChange={setBeamEnds}
              hint="Number of places where a beam end rests on a post or column — each needs a post cap or beam hanger"
              step={1} min={0} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Hanger Quantities">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Joists in Floor" value={joistCount} highlight />
              <ResultCard label={`${joistSz} Joist Hangers`} value={totalHangers} unit="pcs" />
              <ResultCard label="Joist-Hanger Nails (10d)" value={totalNails} unit="nails" small />
              <ResultCard label="Nails Needed (approx)" value={nailLbs} unit="lbs" small />
            </div>
          </Card>
          <Card title="What to Buy">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• <strong>Hanger model:</strong> Simpson LUS{joistSz.replace('x','').replace('LVL','210')} (or HUS for LVL/engineered lumber)</p>
              <p>• <strong>Nails:</strong> 10d × 1.5" joist hanger nails — sold in 1 lb or 5 lb boxes</p>
              <p>• <strong>Beam caps:</strong> Simpson BC post cap or LPC (if you have beam ends above)</p>
              <p>• Add <strong>10% extra</strong> for mistaken placements and waste</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Hurricane Ties ──────────────────────────────────────────────────────────

function HurricaneTies() {
  const [buildingLen, setBuildingLen] = useState('40');
  const [spacing,     setSpacing]     = useState('24');
  const [roofStyle,   setRoofStyle]   = useState('gable');
  const [stories,     setStories]     = useState('1');

  const rafterCount = useMemo(() => {
    const len = parseFloat(buildingLen) || 0;
    const oc  = parseFloat(spacing) || 24;
    const perSide = oc > 0 ? Math.ceil(len / (oc / 12)) + 1 : 0;
    return roofStyle === 'hip' ? perSide * 4 : perSide * 2;
  }, [buildingLen, spacing, roofStyle]);

  const ties      = rafterCount;
  const tieNails  = ties * 6; // ~6 nails per tie
  const holdDowns = parseInt(stories) > 1 ? 8 : 4; // corner hold-downs
  const strapCount = parseInt(stories) > 1 ? holdDowns * 2 : 0;

  return (
    <div className="space-y-5">
      <InfoBox title="💨 Hurricane Ties — Keeping the Roof On" variant="green" collapsible>
        <p>A <strong>hurricane tie</strong> (also called a rafter tie or H-clip) is a metal strap that connects each rafter or truss directly to the top plate of your wall. Without these, strong winds can literally lift the roof right off the walls — it happens in storms because the rafters are only nailed down, not strapped.</p>
        <p><strong>Code:</strong> IRC requires uplift connectors in most regions. In hurricane/high-wind zones, you also need <strong>hold-down anchors</strong> at corners that run from the roof framing down through the wall studs to the foundation.</p>
        <TermDef term="H2.5 / H10S" def="Simpson hurricane tie model numbers. H2.5 is the most common single-family residential tie. H10S is heavier duty for larger loads." />
        <TermDef term="Hold-down / tension rod" def="A threaded rod that runs vertically through the structure, anchored to the foundation, to resist overturning forces in high-wind or seismic areas." />
        <TermDef term="Top plate" def="The horizontal 2×4 or 2×6 boards at the very top of your wall — the last thing before the roof starts. Rafters and trusses sit on (and are tied to) the top plate." />
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Roof System Inputs">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Building Length" value={buildingLen} onChange={setBuildingLen} unit="ft" />
              <SelectField label="Rafter Spacing" value={spacing} onChange={setSpacing}
                options={[
                  { value: '16', label: '16" OC — heavier roof loads' },
                  { value: '24', label: '24" OC — standard with trusses' },
                ]}
              />
            </div>
            <SelectField label="Roof Style" value={roofStyle} onChange={setRoofStyle}
              options={[
                { value: 'gable', label: 'Gable — triangular ends, two roof slopes' },
                { value: 'hip',   label: 'Hip — four sloping sides, more wind-resistant' },
              ]}
            />
            <SelectField label="Stories" value={stories} onChange={setStories}
              options={[
                { value: '1', label: '1 story' },
                { value: '2', label: '2 stories — add hold-downs & straps' },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Connector Quantities">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Rafters / Trusses" value={rafterCount} highlight />
              <ResultCard label="Hurricane Ties" value={ties} unit="pcs" />
              <ResultCard label="Nails for Ties" value={tieNails} unit="nails" small />
              {parseInt(stories) > 1 && (
                <ResultCard label="Corner Hold-Downs" value={holdDowns} unit="pcs" small />
              )}
              {strapCount > 0 && (
                <ResultCard label="Continuous Straps" value={strapCount} unit="pcs" small />
              )}
            </div>
          </Card>
          <Card title="What to Buy">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• <strong>Hurricane ties:</strong> Simpson H2.5 (standard) or H10S (larger loads)</p>
              <p>• <strong>Nails:</strong> 10d × 1.5" joist hanger nails — same box as floor hangers</p>
              {parseInt(stories) > 1 && <p>• <strong>Hold-downs:</strong> Simpson HDU series — consult your structural engineer for sizing</p>}
              <p>• Add <strong>10% extra</strong> for errors and spare hardware</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Screws & Nails ──────────────────────────────────────────────────────────

function Fasteners() {
  const [sqFt,     setSqFt]     = useState('1500');
  const [stories,  setStories]  = useState('1');
  const [deckSqFt, setDeckSqFt] = useState('200');
  const [lvlBeams, setLvlBeams] = useState('2');

  const sqf = parseFloat(sqFt) || 0;
  const sheathing = sqf;  // wall + roof sheathing ≈ house SF × 1.5 but rough

  // Framing nails (16d sinkers) — each stud connection needs ~3-4 nails
  // Rough estimate: 1 lb per 100 SF of framing
  const framingNailLbs   = Math.ceil(sqf / 100);
  // Sheathing nails (8d commons) — ~1 lb per 50 SF
  const sheathingNailLbs = Math.ceil(sheathing / 50);
  // Deck screws — 1 lb per 25 SF
  const deckScrewLbs     = Math.ceil((parseFloat(deckSqFt) || 0) / 25);
  // LVL structural screws — 5 per beam × 2 per LVL connection point
  const structuralScrews = (parseInt(lvlBeams) || 0) * 10;

  return (
    <div className="space-y-5">
      <InfoBox title="📌 Nails vs. Screws — When to Use What" variant="amber" collapsible>
        <p>This confuses a lot of people. Here's the rule:</p>
        <p><strong>Nails are for framing.</strong> Nails have better shear strength (resistance to sideways forces). When you're face-nailing studs to plates, installing sheathing, or toenailing rafters, use nails. A nail gun (framing nailer) makes this go 10× faster.</p>
        <p><strong>Screws are for decking, trim, and hardware.</strong> Screws hold better in direct pull-out (withdrawal), which is why you use them for deck boards, subfloor, LVL connections, and drywall.</p>
        <TermDef term="16d sinker" def="The most common framing nail. 3.25 inches long, with a vinyl coating that makes it 'sink' easier. Used for stud-to-plate, header, and general framing." />
        <TermDef term="8d common / box nail" def={`Shorter nail (2.5") used for sheathing (OSB/plywood on walls and roof deck). Box nails are slightly thinner and less likely to split wood.`} />
        <TermDef term="GRK / Spax structural screws" def="Heavy-duty structural screws used for connecting LVL beams, post bases, and other load-bearing connections where a regular screw isn't rated." />
        <TermDef term={`Joist-hanger nails (10d × 1.5")`} def="Short, fat nails specifically sized for the holes in metal connectors. Using regular nails here is a code violation — the hole size matters." />
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">⚠️ <strong>Don't use drywall screws in framing.</strong> They are brittle and not rated for structural shear loads. Only use properly rated structural screws or framing nails for structural connections.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Project Inputs">
          <div className="space-y-4">
            <InputField label="House Square Footage" value={sqFt} onChange={setSqFt} unit="SF"
              hint="Heated floor area — used to estimate total framing fasteners" />
            <InputField label="Deck / Subfloor Area" value={deckSqFt} onChange={setDeckSqFt} unit="SF"
              hint="Area to be covered with deck screws (deck boards, subfloor gluing)" />
            <InputField label="LVL Beam Connection Points" value={lvlBeams} onChange={setLvlBeams}
              hint="Each spot where an LVL or engineered beam bears on a post or wall" step={1} min={0} />
            <SelectField label="Stories" value={stories} onChange={setStories}
              options={[
                { value: '1', label: '1 story' },
                { value: '2', label: '2 stories' },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Estimated Fasteners">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="16d Framing Nails" value={framingNailLbs * (parseInt(stories)||1)} unit="lbs" highlight />
              <ResultCard label="8d Sheathing Nails" value={sheathingNailLbs * (parseInt(stories)||1)} unit="lbs" />
              <ResultCard label="Deck / Subfloor Screws" value={deckScrewLbs} unit="lbs" small />
              <ResultCard label="LVL Structural Screws" value={structuralScrews} unit="pcs" small />
            </div>
          </Card>
          <Card title="Buying Guide">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• <strong>Framing nails:</strong> Buy 25–50 lb bulk boxes for nail guns (verify your nailer caliber)</p>
              <p>• <strong>Sheathing:</strong> 8d common (2.5" × 0.131") or check local code for pneumatic sheathing nails</p>
              <p>• <strong>Deck screws:</strong> #10 × 3" coated (exterior decks) or #8 × 1-5/8" (subfloor)</p>
              <p>• <strong>Structural:</strong> GRK RSS #10 × 3" or Spax PowerLag — check load ratings</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Nail Schedule ────────────────────────────────────────────────────────────

const NAIL_SCHEDULE = [
  { connection: 'Stud to top/bottom plate (face nail)', nail: '16d sinker', qty: '2 per end', method: 'Face nail' },
  { connection: 'Stud to plate (toenail)', nail: '8d', qty: '4 per stud (2 each side)', method: 'Toenail' },
  { connection: 'Double top plate splice', nail: '16d', qty: '8 @ 16" spacing', method: 'Face nail' },
  { connection: 'Header to king stud', nail: '16d', qty: '3 per end', method: 'Face nail' },
  { connection: 'Cripple stud to header', nail: '8d', qty: '2 per cripple', method: 'Face nail' },
  { connection: 'Rim joist to plate', nail: '16d', qty: '3 per joist bay (16" OC)', method: 'Face nail' },
  { connection: 'Joist to beam (toenail)', nail: '10d', qty: '3 per joist end', method: 'Toenail' },
  { connection: 'OSB wall sheathing', nail: '8d common × 2.5"', qty: '6" edges / 12" field', method: 'Pneumatic' },
  { connection: 'OSB roof sheathing', nail: '8d common × 2.5"', qty: '6" edges / 12" field', method: 'Pneumatic' },
  { connection: 'OSB subfloor (glue + nail)', nail: '8d ring shank × 2.5"', qty: '6" edges / 12" field', method: 'Pneumatic + glue' },
  { connection: 'Rafter to ridge board (toenail)', nail: '10d', qty: '4 per rafter (2 each side)', method: 'Toenail' },
  { connection: 'Collar tie to rafter', nail: '10d', qty: '4 per end', method: 'Face nail' },
  { connection: 'Stair stringer to framing', nail: '16d', qty: '3 per connection', method: 'Face nail' },
];

function NailSchedule() {
  return (
    <div className="space-y-5">
      <InfoBox title="📋 IRC Nail Schedule Cheat Sheet" variant="purple" collapsible>
        <p>The <strong>nail schedule</strong> is a code-required table that specifies exactly which nail and how many are needed for every structural connection in your house. It's in the International Residential Code (IRC) Table R602.3.</p>
        <p>Your <strong>building inspector will check this</strong> during rough framing inspection. Wrong nails or too few = failed inspection = tear apart and redo.</p>
        <TermDef term="Face nail" def="Drive the nail straight through the face (wide side) of the piece into the next piece. Fastest and strongest method." />
        <TermDef term="Toenail" def="Drive the nail at a 45° angle through the side of one piece into another. Used when you can't face-nail (like a joist sitting on a beam)." />
        <TermDef term="16d sinker" def={`Standard framing nail: 3.25" long, vinyl coated. '16d' is called a '16 penny' nail — a historical reference to the cost of 100 nails.`} />
        <TermDef term="Ring shank nail" def="Has rings cut into the shank that grab the wood fibers. Dramatically more pull-out resistance than smooth nails. Required for subfloor." />
      </InfoBox>

      <Card title="IRC Framing Nail Schedule (Reference)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 pr-3 font-semibold text-slate-700 min-w-[200px]">Connection</th>
                <th className="text-left py-2 pr-3 font-semibold text-slate-700 min-w-[120px]">Nail Type</th>
                <th className="text-left py-2 pr-3 font-semibold text-slate-700 min-w-[100px]">Quantity</th>
                <th className="text-left py-2 font-semibold text-slate-700">Method</th>
              </tr>
            </thead>
            <tbody>
              {NAIL_SCHEDULE.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                  <td className="py-2 pr-3 text-slate-700">{row.connection}</td>
                  <td className="py-2 pr-3 font-mono text-xs text-blue-700">{row.nail}</td>
                  <td className="py-2 pr-3 text-slate-600">{row.qty}</td>
                  <td className="py-2 text-slate-500 text-xs">{row.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-3">Ref: IRC Table R602.3. Always verify with your local AHJ (authority having jurisdiction) — local codes may differ.</p>
      </Card>
    </div>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function Hardware() {
  const [tab, setTab] = useState('hangers');
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Hardware & Connectors</h1>
        <p className="text-slate-500 mt-1">Joist hangers, hurricane ties, nail schedules, and structural fasteners</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'hangers'   && <JoistHangers />}
      {tab === 'hurricane' && <HurricaneTies />}
      {tab === 'fasteners' && <Fasteners />}
      {tab === 'schedule'  && <NailSchedule />}
    </div>
  );
}

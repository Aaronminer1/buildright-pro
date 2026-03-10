import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { SelectField } from '../../components/ui/SelectField';
import { ToggleField } from '../../components/ui/SelectField';
import { Tabs } from '../../components/ui/Button';
import { InfoBox, TermDef } from '../../components/ui/InfoBox';

const TABS = [
  { id: 'tile',     label: 'Tile Layout',         icon: '🔳' },
  { id: 'substrate',label: 'Cement Board',         icon: '🧱' },
  { id: 'grout',    label: 'Thinset & Grout',      icon: '🪣' },
  { id: 'schluter', label: 'Schluter & Trims',     icon: '✂️' },
];

// ─── Tile Layout ─────────────────────────────────────────────────────────────

function TileLayout() {
  const [length,    setLength]    = useState('10');
  const [width,     setWidth]     = useState('8');
  const [tileSize,  setTileSize]  = useState('12x24');
  const [jointSize, setJointSize] = useState('1/16');
  const [pattern,   setPattern]   = useState('straight');
  const [walls,     setWalls]     = useState(false);
  const [wallHt,    setWallHt]    = useState('4');

  const sqFt = useMemo(() => {
    const floorSF = (parseFloat(length)||0) * (parseFloat(width)||0);
    const perim   = 2 * ((parseFloat(length)||0) + (parseFloat(width)||0));
    const wallSF  = walls ? perim * (parseFloat(wallHt)||0) : 0;
    return floorSF + wallSF;
  }, [length, width, walls, wallHt]);

  // Waste factor based on pattern and tile size
  const wastePct = pattern === 'diagonal' ? 0.15 :
                   pattern === 'herringbone' ? 0.20 :
                   (tileSize === '24x48' || tileSize === '12x24') ? 0.10 : 0.08;

  const tileSqFt  = sqFt * (1 + wastePct);

  const tileDims = useMemo(() => {
    const parts = tileSize.split('x');
    return { w: parseInt(parts[0])||12, h: parseInt(parts[1])||12 };
  }, [tileSize]);

  const tileArea    = (tileDims.w / 12) * (tileDims.h / 12);  // SF per tile
  const tileCount   = Math.ceil(tileSqFt / tileArea);  // typical box = ~10 tiles
  const boxesNeeded = Math.ceil(tileSqFt / (tileArea * 10));

  return (
    <div className="space-y-5">
      <InfoBox title="🔳 Tile Basics — What Joe Needs to Know Before Laying One Tile" variant="blue" collapsible>
        <p>Tile is beautiful, durable, and completely unforgiving of mistakes. Water gets behind improperly installed tile and destroys the structure underneath — mold, rot, subfloor failure. Before tile goes DOWN, you need the right <strong>substrate</strong> (what the tile sticks to), the right <strong>waterproofing</strong>, and the right <strong>layout planning</strong>.</p>
        <p><strong>Never tile directly onto drywall in wet areas.</strong> Drywall (even "greenboard") is not waterproof. You need cement board, or a waterproof membrane system. The tile mortar itself is NOT waterproof.</p>
        <TermDef term="Substrate" def="The surface the tile bonds to. In dry areas: cement board or drywall. In wet areas (shower, tub surround): cement board + waterproof membrane, or a foam shower pan system (like Wedi or Schluter Kerdi)." />
        <TermDef term="Grout joint" def={`The gap between tiles. Smaller joints (1/16") are for rectified tiles with very straight edges. Larger joints (3/16" – 1/4") accommodate slight size variations and make layout forgiving.`} />
        <TermDef term="Rectified tile" def={`Tile that has been precision-cut after firing so all edges are exactly the same size. Allows very tight grout joints (1/16"). Often used for large format tiles (24"×24" and up).`} />
        <TermDef term="Lippage" def="When the edge of one tile is higher than the adjacent tile, creating a trip hazard and unsightly look. Caused by uneven substrate, bad trowel technique, or warped tiles. Large tiles are most prone to this." />
        <TermDef term="Offset / brick pattern" def={`Also called a "running bond" — each row is offset by half a tile, like brick. Looks great but creates more cut tiles and more waste (especially with large-format tiles).`} />
        <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">⚠️ <strong>Layout first, cut last.</strong> Always dry-lay your tile pattern (no mortar) from the center of the room outward before you set a single tile. You want even cuts at both walls — never a sliver piece at one end.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Space Dimensions">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Length" value={length} onChange={setLength} unit="ft" />
              <InputField label="Width"  value={width}  onChange={setWidth}  unit="ft" />
            </div>
            <SelectField label="Tile Size" value={tileSize} onChange={setTileSize}
              options={[
                { value: '4x4',   label: '4×4" — classic, any room' },
                { value: '6x6',   label: '6×6" — traditional' },
                { value: '12x12', label: '12×12" — most popular floor' },
                { value: '12x24', label: '12×24" — modern elongated' },
                { value: '16x16', label: '16×16"' },
                { value: '18x18', label: '18×18" — large format' },
                { value: '24x24', label: '24×24" — very large format' },
                { value: '24x48', label: '24×48" — slab look' },
                { value: '3x12',  label: '3×12" (subway) — backsplash/wall' },
                { value: '4x16',  label: '4×16" (large subway)' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Grout Joint" value={jointSize} onChange={setJointSize}
                options={[
                  { value: '1/16', label: '1/16" — rectified tile only' },
                  { value: '1/8',  label: '1/8" — minimum for most tile' },
                  { value: '3/16', label: '3/16" — standard recommendation' },
                  { value: '1/4',  label: '1/4" — ceramic, uneven tiles' },
                ]}
              />
              <SelectField label="Layout Pattern" value={pattern} onChange={setPattern}
                options={[
                  { value: 'straight',    label: 'Grid / straight — least waste' },
                  { value: 'offset',      label: '1/3 or 1/2 offset (brick) — classic' },
                  { value: 'diagonal',    label: '45° diagonal — more cuts (+15%)' },
                  { value: 'herringbone', label: 'Herringbone — most waste (+20%)' },
                ]}
              />
            </div>
            <ToggleField label="Include Wall Tile" checked={walls} onChange={setWalls}
              hint="Tub surrounds, shower walls, backsplash — enter height below" />
            {walls && <InputField label="Wall Tile Height" value={wallHt} onChange={setWallHt} unit="ft"
              hint="e.g. 4 ft for tub surround; 8 ft for full-height shower" />}
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Tile Quantities">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Total Area (with waste)" value={Math.round(tileSqFt)} unit="SF" highlight />
              <ResultCard label="Tile Count" value={tileCount} unit="tiles" />
              <ResultCard label="Base Area" value={Math.round(sqFt)} unit="SF" small />
              <ResultCard label="Waste Factor" value={`${Math.round(wastePct * 100)}%`} unit="" small />
              <ResultCard label="Approx Boxes (10 tiles)" value={boxesNeeded} unit="boxes" small />
              <ResultCard label="Tile Size" value={tileSize} unit='"' small />
            </div>
          </Card>
          <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
            <p>• Order extra: tile discontinuation makes re-ordering for repairs impossible</p>
            <p>• Large format tile ({'>'}15") requires lippage control clips during installation</p>
            <p>• All tile needs sealing (especially grout) — use penetrating silicone sealer</p>
            <p>• Verify "suitable for floor use" — wall tile is NOT rated for floor load</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cement Board ────────────────────────────────────────────────────────────

function Substrate() {
  const [length,   setLength]   = useState('10');
  const [width,    setWidth]    = useState('8');
  const [walls,    setWalls]    = useState(true);
  const [wallHt,   setWallHt]   = useState('4');
  const [cbType,   setCbType]   = useState('durock');
  const [membrane, setMembrane] = useState(true);

  const floorSF = (parseFloat(length)||0) * (parseFloat(width)||0);
  const perim   = 2 * ((parseFloat(length)||0) + (parseFloat(width)||0));
  const wallSF  = walls ? perim * (parseFloat(wallHt)||0) : 0;
  const totalSF = floorSF + wallSF;

  // Cement board sheets
  const sheetSF    = cbType === 'large' ? 32 : 15;  // 3×5 = 15 SF or 4×8 = 32 SF
  const sheets     = Math.ceil(totalSF * 1.1 / sheetSF);  // 10% waste
  const screws     = Math.ceil(totalSF * 3);    // ~3 screws per SF        // 1 SF mesh tape per SF of seam area
  const seam_tape_lf = Math.ceil((totalSF / sheetSF) * 8);  // avg perimeter per sheet

  // Waterproof membrane (Schluter Kerdi, RedGard, etc.)
  const membraneGal = Math.ceil(totalSF / 40);  // Red Guard ~40 SF/gal (2 coats)
  const kerdiFT2    = Math.ceil(totalSF * 1.15); // Kerdi membrane with 15% overlap

  return (
    <div className="space-y-5">
      <InfoBox title="🧱 Substrate — The Foundation Under Your Tile" variant="green" collapsible>
        <p>This is the most important step nobody talks about. The tile is only as good as what it's bonded to. In kitchens and bathrooms, you need a <strong>rigid, stable, dimensionally consistent surface</strong> that won't swell, flex, or rot when it gets wet.</p>
        <p><strong>Cement board</strong> (Durock, HardieBacker, Wonderboard) is a cementitious panel that doesn't absorb water or flex. Screw it to the studs or subfloor, tape the seams with alkaline-resistant mesh tape + thinset, then tile over it.</p>
        <p><strong>Important clarification:</strong> Cement board is <em>water-resistant</em>, not waterproof. For direct-water areas (shower floor, tub surround), you need a <strong>waterproof membrane</strong> OVER the cement board, or a foam system that IS the substrate AND waterproofing in one (like Schluter Kerdi or Wedi).</p>
        <TermDef term="HardieBacker" def={`Popular brand of cement board. 1/2" for walls; 1/4" for floors. Cut with a carbide score-and-snap blade or a diamond blade on a circular saw (wear a respirator — silica dust is serious).`} />
        <TermDef term="RedGard / HydroBan" def="Liquid-applied waterproof membranes (roll or brush on like paint). 2 coats needed. Pink when wet, red when dry — so you know when it's cured. Much cheaper than Kerdi but requires correct technique." />
        <TermDef term="Schluter Kerdi" def="Sheet waterproofing membrane that bonds directly to the cement board. Expensive but foolproof — used by most tile pros. Kerdi-Board systems replace cement board entirely." />
        <TermDef term="Mesh tape (alkaline-resistant)" def="Used to tape cement board seams before applying thinset. Must be alkaline-resistant (yellow/orange, not standard fiberglass mesh) because regular mesh tape degrades in cement." />
        <p className="text-xs text-red-700 bg-red-50 p-2 rounded">🚨 <strong>Never use regular drywall compound to fill cement board seams.</strong> Only thinset mortar or a mortar-based material. Joint compound will fail and crack.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Area Inputs">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Floor Length" value={length} onChange={setLength} unit="ft" />
              <InputField label="Floor Width"  value={width}  onChange={setWidth}  unit="ft" />
            </div>
            <ToggleField label="Include Wall Substrate" checked={walls} onChange={setWalls}
              hint="Tub surround, shower walls, backsplash area" />
            {walls && <InputField label="Wall Height" value={wallHt} onChange={setWallHt} unit="ft" />}
            <SelectField label="Cement Board Sheet Size" value={cbType} onChange={setCbType}
              options={[
                { value: 'standard', label: '3×5 (15 SF) — standard, lighter, easier in bathrooms' },
                { value: 'large',    label: '4×8 (32 SF) — larger, fewer seams (floors)' },
              ]}
            />
            <ToggleField label="Apply Waterproof Membrane" checked={membrane} onChange={setMembrane}
              hint="Required for shower floors and direct-water areas — specify liquid (RedGard) or sheet (Kerdi) in the notes" />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Substrate Quantities">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Cement Board Sheets" value={sheets} highlight />
              <ResultCard label="Total Tile Area" value={Math.round(totalSF)} unit="SF" />
              <ResultCard label={`CB Screws (1.25" galv.)`} value={screws} unit="pcs" small />
              <ResultCard label="Alkaline Mesh Tape" value={seam_tape_lf} unit="LF" small />
              {membrane && (
                <>
                  <ResultCard label="RedGard (liquid membrane)" value={membraneGal} unit="gal" small />
                  <ResultCard label="Kerdi Membrane (alt)" value={kerdiFT2} unit="SF" small />
                </>
              )}
            </div>
          </Card>
          <Card title="Application Notes">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Cement board on walls: 1/2" thick, screws every 8" around edges, 12" in field</p>
              <p>• Cement board on floors: 1/4" thick, thin-set under board + screws every 8"</p>
              <p>• Tape ALL seams with alkaline-resistant mesh tape + thinset — do not skip</p>
              <p>• Let thinset cure 24 hours minimum before applying waterproof membrane</p>
              {membrane && <p>• RedGard: 2 coats; each coat to min 30 mil wet thickness; 24hr cure before tiling</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Thinset & Grout ─────────────────────────────────────────────────────────

function ThinsetGrout() {
  const [sqFt,       setSqFt]       = useState('100');
  const [tileSize,   setTileSize]   = useState('12x12');
  const [jointSize,  setJointSize]  = useState('3/16');
  const [trowelSize, setTrowelSize] = useState('3/8');
  const [groutType,  setGroutType]  = useState('sanded');

  const sf = parseFloat(sqFt) || 0;

  // Thinset coverage: varies by trowel notch and tile size
  // 1/4"×3/8" V-notch: ~40 SF/50lb bag;  3/8" sq: ~50 SF/50lb; 1/2" sq: ~35 SF/50lb
  const thinsetCoverage = trowelSize === '1/4v' ? 40 :
                           trowelSize === '3/8'  ? 50 :
                           trowelSize === '1/2'  ? 35 : 25;  // for large format
  const thinsetBags     = Math.ceil(sf / thinsetCoverage * 1.1);  // 10% extra

  // Grout coverage: depends on tile size and joint width
  const tileDims = useMemo(() => {
    const parts = tileSize.split('x');
    return { w: parseInt(parts[0])||12, h: parseInt(parts[1])||12 };
  }, [tileSize]);
  const jointIn    = jointSize === '1/16' ? 0.0625 : jointSize === '1/8' ? 0.125 : jointSize === '3/16' ? 0.1875 : 0.25;
  const groutDepthIn = 0.375;
  const groutSF100 = (tileDims.w * tileDims.h) / (jointIn * groutDepthIn * 10);
  const groutLbs   = Math.ceil(sf / Math.max(groutSF100, 5) * 1.15);

  // Caulk (perimeter, joints, corners)
  const perimeterLF  = 4 * Math.sqrt(sf);  // rough perimeter
  const caulkTubes   = Math.ceil(perimeterLF / 15);  // ~15 LF per tube

  return (
    <div className="space-y-5">
      <InfoBox title="🪣 Thinset Mortar & Grout — The Glue and the Gaps" variant="amber" collapsible>
        <p><strong>Thinset mortar</strong> is a cement-based adhesive that bonds tile to the substrate. It is NOT the same as regular mortar, grout, or joint compound. There are several types:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Modified thinset</strong>: Has polymer additives for better bond and flexibility. Best for most floor and wall tile on cement board.</li>
          <li><strong>Unmodified thinset</strong>: Used with Schluter Kerdi membrane specifically — the manufacturer requires it so the polymer doesn't interfere with membrane curing.</li>
          <li><strong>Large-format tile mortar</strong>: Specifically formulated to prevent large tiles from sagging on walls or cracking on floors. Required for tiles over 15".</li>
        </ul>
        <p><strong>Grout</strong> fills the joints between tiles. Two main types:</p>
        <TermDef term="Sanded grout" def={`Has sand mixed in. Required for joints wider than 1/8" — the sand prevents cracking in wider joints. Do not use on polished, soft stone — sand will scratch the tile surface.`} />
        <TermDef term="Unsanded grout" def={`No sand. Required for joints 1/16" – 1/8" and for polished stone, glass tile, and marble where sand would scratch the surface.`} />
        <TermDef term="Epoxy grout" def="Two-part system (not cement based). Extremely stain and chemical resistant — commercial kitchens and hospitals. Expensive, hard to work with (very unforgiving open time), but lasts decades and never stains." />
        <TermDef term="Thinset trowel notch" def="You apply thinset with a notched trowel. The notch size determines how thick the mortar bed is — bigger tiles need deeper notch (more mortar). Wrong notch = hollow spots = cracked tile." />
        <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">💡 <strong>The 95% rule:</strong> NEC tile installation standards require 95% back coverage (mortar contacting the back of the tile) in wet areas. Use the correct trowel and use the "back-butter" technique (spread thin coat on tile back before pressing) to achieve this.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Installation Inputs">
          <div className="space-y-4">
            <InputField label="Area to Tile" value={sqFt} onChange={setSqFt} unit="SF" />
            <SelectField label="Tile Size" value={tileSize} onChange={setTileSize}
              options={[
                { value: '4x4',   label: '4×4"' },
                { value: '6x6',   label: '6×6"' },
                { value: '12x12', label: '12×12"' },
                { value: '12x24', label: '12×24"' },
                { value: '18x18', label: '18×18"' },
                { value: '24x24', label: '24×24" large format' },
              ]}
            />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Trowel Notch" value={trowelSize} onChange={setTrowelSize}
                options={[
                  { value: '1/4v', label: '1/4"×3/8" V-notch — small tile ≤ 8"' },
                  { value: '3/8',  label: '3/8" sq notch — 8"–16" tile (most common)' },
                  { value: '1/2',  label: '1/2" sq notch — 16"–24" tile' },
                  { value: '3/4',  label: '3/4" sq notch — large format >24"' },
                ]}
              />
              <SelectField label="Grout Joint Width" value={jointSize} onChange={setJointSize}
                options={[
                  { value: '1/16', label: '1/16" — rectified tile, unsanded' },
                  { value: '1/8',  label: '1/8" — standard, unsanded or sanded' },
                  { value: '3/16', label: '3/16" — standard sanded' },
                  { value: '1/4',  label: '1/4" — ceramic, irregular tile, sanded' },
                ]}
              />
            </div>
            <SelectField label="Grout Type" value={groutType} onChange={setGroutType}
              options={[
                { value: 'sanded',    label: 'Sanded — for joints 1/8" and wider' },
                { value: 'unsanded',  label: 'Unsanded — for joints under 1/8"' },
                { value: 'epoxy',     label: 'Epoxy — commercial-grade, stain-proof' },
              ]}
            />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Material Quantities">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Thinset Mortar (50 lb bags)" value={thinsetBags} highlight />
              <ResultCard label={`${groutType === 'epoxy' ? 'Epoxy' : (groutType === 'sanded' ? 'Sanded' : 'Unsanded')} Grout`} value={groutLbs} unit="lbs" />
              <ResultCard label="Trowel Notch Size" value={trowelSize + '"'} unit="" small />
              <ResultCard label="Perimeter Caulk Tubes" value={caulkTubes} unit="tubes" small />
            </div>
          </Card>
          <Card title="Critical Installation Tips">
            <div className="space-y-2 text-sm text-slate-600">
              <p>• Mix thinset to "peanut butter" consistency — too wet = weak bond, too dry = hard to work</p>
              <p>• Never use more than 30 minutes of mixed thinset (open time limit)</p>
              <p>• Apply thinset with notched trowel at consistent 45° angle — all ridges parallel</p>
              <p>• <strong>Caulk, don't grout</strong> at all changes of plane (floor-to-wall, corners, around fixtures) — grout cracks, caulk flexes</p>
              <p>• Seal grout 72 hours after installation; re-seal annually in wet areas</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Schluter & Trims ────────────────────────────────────────────────────────

const SCHLUTER_GUIDE = [
  { product: 'Schluter Jolly (JOLX)', use: 'Exposed tile edge at wall ending or niche edge', size: 'Match tile thickness + 1/32"', material: 'Aluminum or stainless — exterior uses marine grade' },
  { product: 'Schluter Rondec', use: 'Bull-nose alternative; outside corners', size: 'Match tile thickness', material: 'Aluminum, oil-rubbed bronze, chrome — matches fixture finish' },
  { product: 'Schluter Schiene', use: 'Transition between tile and lower-profile floor covering', size: '1/2" or 5/16" based on tile + substrate', material: 'Aluminum — very durable' },
  { product: 'Schluter Dilex-AHK', use: 'Movement joint inline with floor tile field', size: '5/16"', material: 'PVC/aluminum — allows tile to expand without cracking' },
  { product: 'Schluter Dilex-BT', use: 'Transition profile at tile-to-carpet or vinyl', size: 'Match tile height', material: 'Aluminum — low-profile' },
  { product: 'Schluter Kerdi-Line', use: 'Linear shower drain channel — goes with any tile', size: '30", 36", 48", 60" lengths', material: 'Stainless steel body + tile insert tray' },
  { product: 'Schluter Kerdi-Drain', use: 'Standard format shower drain for tiled shower floor', size: '4" with adjustable flange', material: 'ABS/stainless — adapts to any tile height' },
  { product: 'Noblebond (or Kerdi-Fix)', use: 'Sealant between Kerdi membrane seams and corners', size: 'Tube', material: 'Single-component polyurethane — NOT silicone caulk' },
];

function Schluter() {
  const [showerLen,  setShowerLen]  = useState('5');
  const [showerWid,  setShowerWid]  = useState('3');
  const [niche,      setNiche]      = useState(true);
  const [linearDrain,setLinearDrain] = useState(false);
  const [transitionLF, setTransitionLF] = useState('12');
  const [exposedEdgeLF, setExposedEdgeLF] = useState('8');

  const shwLen = parseFloat(showerLen) || 0;
  const shwWid = parseFloat(showerWid) || 0;
  const kerdiSF = shwLen * shwWid + 2 * (shwLen + shwWid) * 7/12 + (niche ? 4 : 0); // floor + 7" walls + niche

  const jollyLF    = parseFloat(exposedEdgeLF) || 0;
  const schieneLF  = parseFloat(transitionLF)  || 0;
  const dilex24    = Math.ceil(shwLen / 4);      // movement joints at max 24" apart
  const kerdiBand  = Math.ceil((2 * (shwLen + shwWid) + 4) / 5) * 5; // corner/seam band LF
  const kerdiFix   = Math.ceil(kerdiBand / 10);   // tubes of sealant

  return (
    <div className="space-y-5">
      <InfoBox title="✂️ Schluter Systems — The Finishing Touch That Actually Does Something" variant="purple" collapsible>
        <p>Schluter-Systems makes specialized metal trim profiles for tile installations. They solve three real problems:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li><strong>Edge protection</strong> — exposed tile edges are sharp and chip easily. A Schluter Jolly or Rondec profile covers and protects the edge while looking finished.</li>
          <li><strong>Transitions</strong> — where tile meets carpet, hardwood, or vinyl, you need a height-transition strip. Schluter Schiene and Dilex provide these.</li>
          <li><strong>Movement joints</strong> — tile expands and contracts slightly with temperature. Without movement joints at the right spacing, your tile will crack or pop up off the floor.</li>
        </ol>
        <p>The <strong>Kerdi system</strong> is Schluter's flagship waterproofing line — it replaces the traditional cement board + waterproof membrane approach with a fabric-backed polyethylene membrane that bonds directly to drywall or cement board. Industry standard for custom showers.</p>
        <TermDef term="Schluter Jolly" def="The most common trim. An L-shaped profile — one leg goes under the tile, the other caps the exposed edge. Available in aluminum, stainless, oil-rubbed bronze, brushed nickel, chrome." />
        <TermDef term="Kerdi membrane" def="Lightweight polyethylene sheet membrane for waterproofing walls and floors in wet areas. Applied with unmodified thinset. Overlapping seams sealed with Kerdi-Fix." />
        <TermDef term="Linear drain (Kerdi-Line)" def="A long rectangular channel drain instead of a center drain. Allows you to slope the entire shower floor in one direction. Looks modern; easier to install large tiles on floor." />
        <TermDef term="Movement joint" def="A flexible gap filled with caulk (not grout) in a tile field that allows the tile to expand and contract without cracking the field. Required at 24–36 ft² areas and at all changes of plane." />
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Shower Details">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Shower Length" value={showerLen} onChange={setShowerLen} unit="ft" />
              <InputField label="Shower Width"  value={showerWid} onChange={setShowerWid} unit="ft" />
            </div>
            <ToggleField label="Include Niche (recessed shelf)" checked={niche} onChange={setNiche}
              hint="A recessed box tiled in the shower wall for shampoo bottles. Requires waterproofing on 5 sides." />
            <ToggleField label="Linear Drain (vs center drain)" checked={linearDrain} onChange={setLinearDrain}
              hint="Kerdi-Line replaces center drain — single-slope floor, large tile friendly" />
            <InputField label="Exposed Tile Edge LF" value={exposedEdgeLF} onChange={setExposedEdgeLF} unit="LF"
              hint="Where tile ends without a wall or another material (niches, shelf ends)" />
            <InputField label="Floor Transition Strip LF" value={transitionLF} onChange={setTransitionLF} unit="LF"
              hint="Where tile transitions to another floor material outside the shower" />
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Schluter Material Estimate">
            <div className="grid grid-cols-2 gap-3">
              <ResultCard label="Kerdi Membrane" value={Math.round(kerdiSF)} unit="SF" highlight />
              <ResultCard label="Kerdi Band / Corners" value={kerdiBand} unit="LF" />
              <ResultCard label="Kerdi-Fix Sealant" value={kerdiFix} unit="tubes" small />
              <ResultCard label="Jolly Edge Trim" value={jollyLF} unit="LF" small />
              <ResultCard label="Schiene Transition" value={schieneLF} unit="LF" small />
              <ResultCard label="Dilex Movement Joints" value={dilex24} unit="strips" small />
            </div>
          </Card>
          <Card title="Schluter Profile Reference">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-1.5 pr-2 font-semibold text-slate-700">Product</th>
                    <th className="text-left py-1.5 font-semibold text-slate-700">Use</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHLUTER_GUIDE.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-1.5 pr-2 font-medium text-slate-700 min-w-[120px]">{row.product}</td>
                      <td className="py-1.5 text-slate-500">{row.use}</td>
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

// ─── Main Export ─────────────────────────────────────────────────────────────

export function Tile() {
  const [tab, setTab] = useState('tile');
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tile & Wet Areas</h1>
        <p className="text-slate-500 mt-1">Tile layout, cement board, thinset & grout quantities, Schluter trim profiles</p>
      </div>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'tile'      && <TileLayout />}
      {tab === 'substrate' && <Substrate />}
      {tab === 'grout'     && <ThinsetGrout />}
      {tab === 'schluter'  && <Schluter />}
    </div>
  );
}

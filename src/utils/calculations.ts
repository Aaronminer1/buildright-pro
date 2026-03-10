import type {
  ConcreteSlabResult,
  FootingResult,
  FramingResult,
  RoofResult,
  StairResult,
} from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const round2 = (n: number) => Math.round(n * 100) / 100;
export const round1 = (n: number) => Math.round(n * 10) / 10;
export const ceilInt = (n: number) => Math.ceil(n);

export function feetInchesToFeet(feet: number, inches: number): number {
  return feet + inches / 12;
}

export function inchesToFeet(inches: number): number {
  return inches / 12;
}

export function boardFeet(
  thicknessIn: number,
  widthIn: number,
  lengthFt: number,
  count: number = 1
): number {
  return (thicknessIn * widthIn * lengthFt * count) / 12;
}

export function formatFtIn(totalInches: number): string {
  const ft = Math.floor(totalInches / 12);
  const inches = round1(totalInches % 12);
  if (ft === 0) return `${inches}"`;
  if (inches === 0) return `${ft}'`;
  return `${ft}' ${inches}"`;
}

// ─── Concrete & Foundation ────────────────────────────────────────────────────

/** Concrete slab volume and bag counts */
export function calcConcreteSlab(
  lengthFt: number,
  widthFt: number,
  thicknessIn: number,
  wastePct: number = 10,
  addRebar: boolean = false,
  rebarSpacingIn: number = 12
): ConcreteSlabResult {
  const thicknessFt = thicknessIn / 12;
  const cubicFeet = lengthFt * widthFt * thicknessFt;
  const cubicYards = cubicFeet / 27;
  const cubicYardsWithWaste = cubicYards * (1 + wastePct / 100);

  // Bags: 60lb ≈ 0.45 CF, 80lb ≈ 0.60 CF, 90lb ≈ 0.675 CF
  const bags60lb = Math.ceil(cubicYardsWithWaste * 60);
  const bags80lb = Math.ceil(cubicYardsWithWaste * 45);
  const bags90lb = Math.ceil(cubicYardsWithWaste * 40);

  let rebarLFPerDir: number | undefined;
  let totalRebarLF: number | undefined;

  if (addRebar) {
    const spacingFt = rebarSpacingIn / 12;
    const barsAlongWidth = Math.ceil(lengthFt / spacingFt) + 1;
    const barsAlongLength = Math.ceil(widthFt / spacingFt) + 1;
    rebarLFPerDir = barsAlongWidth * widthFt;
    const dir2 = barsAlongLength * lengthFt;
    totalRebarLF = rebarLFPerDir + dir2;
    rebarLFPerDir = round2(rebarLFPerDir);
    totalRebarLF = round2(totalRebarLF);
  }

  return {
    cubicFeet: round2(cubicFeet),
    cubicYards: round2(cubicYards),
    cubicYardsWithWaste: round2(cubicYardsWithWaste),
    bags60lb,
    bags80lb,
    bags90lb,
    rebarLFPerDir,
    totalRebarLF,
  };
}

/** Continuous footing volume */
export function calcContinuousFooting(
  widthIn: number,
  depthIn: number,
  linearFt: number,
  wastePct: number = 10
): FootingResult {
  const widthFt = widthIn / 12;
  const depthFt = depthIn / 12;
  const cubicYards = (widthFt * depthFt * linearFt) / 27;
  const cubicYardsWithWaste = cubicYards * (1 + wastePct / 100);
  return {
    cubicYards: round2(cubicYards),
    cubicYardsWithWaste: round2(cubicYardsWithWaste),
    bags80lb: Math.ceil(cubicYardsWithWaste * 45),
  };
}

/** Isolated (pad) footing */
export function calcPadFooting(
  widthIn: number,
  lengthIn: number,
  depthIn: number,
  count: number,
  wastePct: number = 5
): FootingResult {
  const vol = ((widthIn / 12) * (lengthIn / 12) * (depthIn / 12) * count) / 27;
  const withWaste = vol * (1 + wastePct / 100);
  return {
    cubicYards: round2(vol),
    cubicYardsWithWaste: round2(withWaste),
    bags80lb: Math.ceil(withWaste * 45),
  };
}

/** Foundation / stem wall volume */
export function calcFoundationWall(
  perimeterFt: number,
  heightFt: number,
  thicknessIn: number,
  wastePct: number = 8
): FootingResult {
  const thickFt = thicknessIn / 12;
  const vol = (perimeterFt * heightFt * thickFt) / 27;
  const withWaste = vol * (1 + wastePct / 100);
  return {
    cubicYards: round2(vol),
    cubicYardsWithWaste: round2(withWaste),
    bags80lb: Math.ceil(withWaste * 45),
  };
}

/** Concrete column */
export function calcColumn(
  diameterIn: number,
  heightFt: number,
  count: number,
  wastePct: number = 5
): FootingResult {
  const r = diameterIn / 24; // radius in feet
  const vol = (Math.PI * r * r * heightFt * count) / 27;
  const withWaste = vol * (1 + wastePct / 100);
  return {
    cubicYards: round2(vol),
    cubicYardsWithWaste: round2(withWaste),
    bags80lb: Math.ceil(withWaste * 45),
  };
}

/** Gravel / fill material (cubic yards) */
export function calcGravel(
  lengthFt: number,
  widthFt: number,
  depthIn: number,
  wastePct: number = 15
): number {
  const vol = (lengthFt * widthFt * (depthIn / 12)) / 27;
  return round2(vol * (1 + wastePct / 100));
}

// ─── Framing ──────────────────────────────────────────────────────────────────

/** Wall framing: studs, plates */
export function calcWallFraming(
  wallLengthFt: number,
  wallHeightFt: number,
  spacingIn: number,
  doorOpenings: number,
  windowOpenings: number,
  isExteriorCornerWall: boolean = false,
  /** Actual lumber width in inches: 3.5 for 2×4, 5.5 for 2×6 */
  lumberWidthIn: number = 3.5
): FramingResult {
  // Studs: (length / spacing) + 1, then extras for openings & corners
  const spacingFt = spacingIn / 12;
  const fieldStuds = Math.ceil(wallLengthFt / spacingFt) + 1;
  // Each door needs 2 trimmers + 2 king studs, each window needs 2 trimmers + 2 king studs
  const openingStuds = (doorOpenings + windowOpenings) * 4;
  // Each door also needs a cripple stud or header support (approx 2 per opening)
  // Corner: 3-stud corner package
  const cornerStuds = isExteriorCornerWall ? 3 : 0;

  const totalStuds = fieldStuds + openingStuds + cornerStuds;
  // Stud board feet (uses actual lumber width from caller, default 2×4 = 3.5")
  const studBF = boardFeet(1.5, lumberWidthIn, wallHeightFt, totalStuds);

  // Plates: 2 top plates + 1 bottom plate = 3 × wall length
  const topPlatesLF = wallLengthFt * 2;
  const bottomPlateLF = wallLengthFt;
  const plateBF = boardFeet(1.5, lumberWidthIn, wallLengthFt, 3);

  return {
    studs: totalStuds,
    topPlatesLF: round1(topPlatesLF),
    bottomPlateLF: round1(bottomPlateLF),
    totalPlateLF: round1(topPlatesLF + bottomPlateLF),
    boardFeet: round1(studBF + plateBF),
    cornerStuds,
  };
}

/** Floor joists */
export function calcFloorJoists(
  spanFt: number,
  roomLengthFt: number,
  spacingIn: number
): { count: number; totalLF: number; rimBoardLF: number } {
  const count = Math.ceil(roomLengthFt / (spacingIn / 12)) + 1;
  const totalLF = round1(count * spanFt);
  const rimBoardLF = round1(2 * (spanFt + roomLengthFt));
  return { count, totalLF, rimBoardLF };
}

/** Roof rafters (simple gable) */
export function calcRafters(
  buildingWidthFt: number,
  buildingLengthFt: number,
  pitchRise: number,
  overhangIn: number,
  spacingIn: number
): FramingResult & { rafterLength: number; ridgeLF: number } {
  const multiplier = Math.sqrt(pitchRise * pitchRise + 144) / 12;
  const overhangFt = overhangIn / 12;
  const halfSpan = buildingWidthFt / 2 + overhangFt;
  const rafterLength = round2(halfSpan * multiplier);
  // Count per side = ceil(length / spacing) + 1, × 2 sides
  const raftersPerSide = Math.ceil((buildingLengthFt + 2 * overhangFt) / (spacingIn / 12)) + 1;
  const totalRafters = raftersPerSide * 2;
  const ridgeLF = round1(buildingLengthFt + 2 * overhangFt);
  const totalBF = boardFeet(1.5, 5.5, rafterLength, totalRafters); // 2x6 rafter

  return {
    studs: totalRafters,
    topPlatesLF: 0,
    bottomPlateLF: 0,
    totalPlateLF: 0,
    boardFeet: round1(totalBF),
    cornerStuds: 0,
    rafterLength,
    ridgeLF,
  };
}

// ─── Roofing ──────────────────────────────────────────────────────────────────

/** Roof pitch computations */
export function calcRoofPitch(
  pitchRise: number,
  buildingWidthFt: number,
  buildingLengthFt: number,
  overhangIn: number,
  shingleType: '3tab' | 'arch30' | 'arch50'
): RoofResult {
  const multiplier = Math.sqrt(pitchRise * pitchRise + 144) / 12;
  const angleDeg = Math.atan(pitchRise / 12) * (180 / Math.PI);
  const overhangFt = overhangIn / 12;

  // Rafter run (horizontal projection of one side)
  const rafterRun = buildingWidthFt / 2 + overhangFt;
  const rafterLength = round2(rafterRun * multiplier);

  // Roof surface area (gable)
  const roofArea = round2(2 * (buildingLengthFt + 2 * overhangFt) * rafterLength);
  const squares = round2(roofArea / 100);

  // Shingles (bundles per square: 3-tab = 3 bundles, arch 30yr = 3 bundles, arch 50yr = 4)
  const bundlesPerSq = shingleType === 'arch50' ? 4 : 3;
  const shinglesWithWaste = squares * 1.1; // 10% waste
  const shingleBundles3Tab = Math.ceil(shinglesWithWaste * 3);
  const shingleBundlesArch = Math.ceil(shinglesWithWaste * bundlesPerSq);

  // Underlayment: 1 roll covers 400 SF (standard 15# felt)
  const underlaymentRolls = Math.ceil((roofArea * 1.1) / 400);

  // Decking / sheathing: 4×8 sheets = 32 SF each
  const deckingSheets = Math.ceil((roofArea * 1.1) / 32);

  // Ridge cap: (buildingLength + 2 overhangs) × 12 LF (hip ridge would add more)
  const ridgeCapLF = round1(buildingLengthFt + 2 * overhangFt);

  // Drip edge: perimeter (2 eaves + 2 rakes)
  const eave = buildingLengthFt + 2 * overhangFt;
  const rake = rafterLength; // approx
  const dripEdgeLF = round1(2 * eave + 2 * rake);

  // Starter strip along eaves
  const starterStripLF = round1(2 * eave);

  return {
    pitchAngle: round2(angleDeg),
    pitchMultiplier: round2(multiplier),
    rafterLength,
    roofAreaSqFt: roofArea,
    squares,
    shingleBundles3Tab,
    shingleBundlesArch,
    underlaymentRolls,
    deckingSheets,
    ridgeCapLF,
    dripEdgeLF,
    starterStripLF,
  };
}

// ─── Stairs ───────────────────────────────────────────────────────────────────

export function calcStairs(
  totalRiseIn: number,
  stairWidthIn: number,
  desiredRiserIn: number = 7.5,
  treadDepthIn: number = 10.5
): StairResult {
  const warnings: string[] = [];

  // Number of risers = round(totalRise / desiredRiser)
  let numberOfRisers = Math.round(totalRiseIn / desiredRiserIn);
  if (numberOfRisers < 1) numberOfRisers = 1;
  const actualRiserHeight = round2(totalRiseIn / numberOfRisers);

  // IRC 2021 R311.7.5.1: min 4" max 8.25" riser
  if (actualRiserHeight > 8.25) {
    warnings.push(`Riser height ${actualRiserHeight}" exceeds IRC max of 8.25"`);
  }
  if (actualRiserHeight < 4) {
    warnings.push(`Riser height ${actualRiserHeight}" is below IRC min of 4"`);
  }
  // IRC R311.7.5.2: min 10" tread (nosing may reduce to 9")
  if (treadDepthIn < 10) {
    warnings.push(`Tread depth ${treadDepthIn}" is below IRC minimum of 10"`);
  }
  // Riser + tread comfort rule: 2R + T = 24–25"
  const comfort = 2 * actualRiserHeight + treadDepthIn;
  if (comfort < 24 || comfort > 25.5) {
    warnings.push(`2R+T = ${round2(comfort)}" (ideal 24–25.5" for comfort)`);
  }

  const numberOfTreads = numberOfRisers - 1;
  const totalRun = round2(numberOfTreads * treadDepthIn);
  // Stringer length using Pythagorean theorem (all in inches)
  const stringerLengthIn = Math.sqrt(totalRiseIn ** 2 + totalRun ** 2);
  const stringerLengthFt = round2(stringerLengthIn / 12);

  // Minimum stringers: IRC R311.7.10 – 3 if > 36" wide
  const minimumStringers = stairWidthIn > 36 ? 3 : 2;
  const handrailRequired = numberOfRisers >= 4; // IRC R311.7.8 — 4+ risers

  const codeCompliant =
    actualRiserHeight >= 4 &&
    actualRiserHeight <= 8.25 &&
    treadDepthIn >= 10 &&
    warnings.length === 0;

  return {
    numberOfRisers,
    riserHeight: actualRiserHeight,
    numberOfTreads,
    treadDepth: treadDepthIn,
    totalRun,
    stringerLength: stringerLengthFt,
    minimumStringers,
    handrailRequired,
    codeCompliant,
    warnings,
  };
}

// ─── Lumber ───────────────────────────────────────────────────────────────────

export function calcBoardFeet(
  thicknessIn: number,
  widthIn: number,
  lengthFt: number,
  pieces: number
): number {
  return round2(boardFeet(thicknessIn, widthIn, lengthFt, pieces));
}

// ─── Masonry ──────────────────────────────────────────────────────────────────

/** CMU block count (standard 8"×8"×16" block) */
export function calcCMUBlocks(
  wallHeightFt: number,
  wallLengthFt: number,
  openingSqFt: number = 0,
  wastePct: number = 5
): { blocks: number; mortar80lbBags: number } {
  // One 8×16 block covers 0.89 SF of wall face (accounting for mortar joint)
  const netSqFt = wallHeightFt * wallLengthFt - openingSqFt;
  const blocks = Math.ceil((netSqFt / 0.89) * (1 + wastePct / 100));
  // Mortar: approx 1 bag (80lb) per 30 blocks
  const mortar80lbBags = Math.ceil(blocks / 30);
  return { blocks, mortar80lbBags };
}

/** Brick count (standard modular 2.25"×3.75"×8" brick) */
export function calcBricks(
  wallHeightFt: number,
  wallLengthFt: number,
  openingSqFt: number = 0,
  wastePct: number = 5
): { bricks: number; mortar80lbBags: number } {
  // Approx 6.75 bricks per SF for standard course (with 3/8" mortar joint)
  const netSqFt = wallHeightFt * wallLengthFt - openingSqFt;
  const bricks = Math.ceil(netSqFt * 6.75 * (1 + wastePct / 100));
  const mortar80lbBags = Math.ceil(bricks / 45);
  return { bricks, mortar80lbBags };
}

// ─── Interior Materials ───────────────────────────────────────────────────────

/** Drywall sheet calculator */
export function calcDrywall(
  roomLengthFt: number,
  roomWidthFt: number,
  ceilingHeightFt: number,
  doors: number,
  windows: number,
  includeCeiling: boolean,
  sheetSize: '4x8' | '4x12'
): {
  wallArea: number;
  ceilingArea: number;
  totalArea: number;
  sheets: number;
  jc5Gal: number;
  tapeLF: number;
  cornerBeadLF: number;
  screwsLb: number;
} {
  const perimeter = 2 * (roomLengthFt + roomWidthFt);
  const wallArea = perimeter * ceilingHeightFt - doors * 21 - windows * 15;
  const ceilingArea = includeCeiling ? roomLengthFt * roomWidthFt : 0;
  const totalArea = wallArea + ceilingArea;
  const sheetSF = sheetSize === '4x12' ? 48 : 32;
  const sheets = Math.ceil((totalArea * 1.1) / sheetSF);
  // Joint compound: 5-gal bucket covers ~200 SF
  const jc5Gal = Math.ceil(totalArea / 200);
  // Tape: ~50 LF per 100 SF
  const tapeLF = Math.ceil(totalArea * 0.5);
  // Corner bead: every outside corner (rough approximation)
  const cornerBeadLF = Math.ceil(ceilingHeightFt * 4 * 1.1);
  // Screws: ~1 lb per 500 SF
  const screwsLb = Math.ceil(totalArea / 500) + 1;

  return {
    wallArea: round2(wallArea),
    ceilingArea: round2(ceilingArea),
    totalArea: round2(totalArea),
    sheets,
    jc5Gal,
    tapeLF,
    cornerBeadLF,
    screwsLb,
  };
}

/** Paint calculator */
export function calcPaint(
  roomLengthFt: number,
  roomWidthFt: number,
  ceilingHeightFt: number,
  doors: number,
  windows: number,
  coats: number,
  includeCeiling: boolean,
  coveragePerGal: number = 350
): { wallGallons: number; ceilingGallons: number; totalGallons: number; primerGallons: number } {
  const perimeter = 2 * (roomLengthFt + roomWidthFt);
  const wallArea = perimeter * ceilingHeightFt - doors * 21 - windows * 15;
  const ceilingArea = includeCeiling ? roomLengthFt * roomWidthFt : 0;
  const wallGallons = Math.ceil((wallArea * coats) / coveragePerGal);
  const ceilingGallons = includeCeiling ? Math.ceil((ceilingArea * coats) / coveragePerGal) : 0;
  const totalGallons = wallGallons + ceilingGallons;
  const primerGallons = Math.ceil((wallArea + ceilingArea) / coveragePerGal);
  return { wallGallons, ceilingGallons, totalGallons, primerGallons };
}

/** Flooring calculator */
export function calcFlooring(
  roomLengthFt: number,
  roomWidthFt: number,
  wastePct: number = 10
): { netSqFt: number; withWasteSqFt: number } {
  const netSqFt = round2(roomLengthFt * roomWidthFt);
  const withWasteSqFt = round2(netSqFt * (1 + wastePct / 100));
  return { netSqFt, withWasteSqFt };
}

/** Tile calculator (per tile size) */
export function calcTile(
  roomSqFt: number,
  tileLengthIn: number,
  tileWidthIn: number,
  wastePct: number = 10
): { tiles: number; sqFtNeeded: number } {
  const tileSqFt = (tileLengthIn * tileWidthIn) / 144;
  const sqFtNeeded = round2(roomSqFt * (1 + wastePct / 100));
  const tiles = Math.ceil(sqFtNeeded / tileSqFt);
  return { tiles, sqFtNeeded };
}

/** Siding calculator */
export function calcSiding(
  perimeterFt: number,
  wallHeightFt: number,
  windowSqFt: number,
  doorSqFt: number,
  exposureIn: number,
  wastePct: number = 10
): { netWallArea: number; sidingSquares: number; housewrapSqFt: number } {
  const grossWall = perimeterFt * wallHeightFt;
  const netWallArea = round2(grossWall - windowSqFt - doorSqFt);
  const withWaste = netWallArea * (1 + wastePct / 100);
  // Coverage factor based on exposure
  const boardWidthIn = exposureIn + 1; // approximate board width
  const coverageFactor = exposureIn / boardWidthIn;
  const sidingSquares = round2(withWaste / (100 * coverageFactor));
  const housewrapSqFt = round2(grossWall * 1.15); // 15% overlap
  return { netWallArea, sidingSquares, housewrapSqFt };
}

// ─── Insulation ───────────────────────────────────────────────────────────────

export function calcBattInsulation(
  areaSqFt: number,
  rValue: number
): { batts: number; rolls: number; note: string } {
  // Batts / rolls cover ~40 SF per roll typically (varies by product)
  // R-13 2x4 wall batt: 40 SF/bag, R-19 2x6 wall: 40 SF/bag, R-38 attic: 20 SF/bag
  let sfPerUnit = 40;
  if (rValue >= 38) sfPerUnit = 20;
  if (rValue >= 49) sfPerUnit = 15;
  const units = Math.ceil(areaSqFt / sfPerUnit);
  const note = rValue >= 30
    ? 'Attic batts — consider blown-in for better coverage and lower cost'
    : 'Wall/floor batts';
  return { batts: units, rolls: units, note };
}

export function calcBlownInInsulation(
  areaSqFt: number,
  rValue: number,
  productType: 'fiberglass' | 'cellulose'
): { bags: number; settledDepthIn: number } {
  // Number of bags per manufacturer coverage charts varies widely
  // Fiberglass: ~40 SF per bag at R-38 settled, cellulose slightly more efficient
  const r_per_inch = productType === 'cellulose' ? 3.7 : 2.5;
  const depthNeeded = rValue / r_per_inch;
  // Bags: typical coverage is printed on bag — use ~40 SF/bag for cellulose R-38
  const sfPerBag = productType === 'cellulose' ? (200 / (depthNeeded / 3.5)) : (150 / (depthNeeded / 4));
  const bags = Math.ceil(areaSqFt / sfPerBag);
  return { bags, settledDepthIn: round1(depthNeeded) };
}

// ─── HVAC ────────────────────────────────────────────────────────────────────

export function calcHVACLoad(
  sqFt: number,
  ceilingHeightFt: number,
  climateZone: number,
  insulated: boolean
): {
  heatingBTU: number;
  coolingBTU: number;
  heatingTons: number;
  coolingTons: number;
  recommendedTons: number;
} {
  // Simplified Manual J approximation
  // Base BTU/SF varies by climate zone
  const heatingFactor = insulated
    ? [0, 30, 35, 40, 45, 50, 55, 65, 75][Math.min(climateZone, 8)]
    : [0, 45, 50, 60, 70, 80, 90, 100, 120][Math.min(climateZone, 8)];
  const coolingFactor = insulated ? 20 : 30;

  const volumeFactor = ceilingHeightFt / 8; // 8 ft is baseline
  const heatingBTU = Math.round(sqFt * (heatingFactor ?? 40) * volumeFactor);
  const coolingBTU = Math.round(sqFt * coolingFactor * volumeFactor);

  return {
    heatingBTU,
    coolingBTU,
    heatingTons: round2(heatingBTU / 12000),
    coolingTons: round2(coolingBTU / 12000),
    recommendedTons: Math.ceil(coolingBTU / 12000 / 0.5) * 0.5,
  };
}

// ─── Cost Estimator ───────────────────────────────────────────────────────────

export interface TradeCost {
  trade: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export function calcProjectCost(
  trades: Omit<TradeCost, 'total'>[],
  contingencyPct: number = 10
): { trades: TradeCost[]; subtotal: number; contingency: number; grandTotal: number; costPerSqFt: number; sqFt: number } {
  const filled: TradeCost[] = trades.map(t => ({ ...t, total: round2(t.quantity * t.unitCost) }));
  const subtotal = round2(filled.reduce((s, t) => s + t.total, 0));
  const contingency = round2(subtotal * contingencyPct / 100);
  const grandTotal = round2(subtotal + contingency);
  const sqFtEntry = trades.find(t => t.unit === 'SF');
  const sqFt = sqFtEntry ? sqFtEntry.quantity : 0;
  return { trades: filled, subtotal, contingency, grandTotal, costPerSqFt: sqFt ? round2(grandTotal / sqFt) : 0, sqFt };
}

// ─── Project ──────────────────────────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  address: string;
  client: string;
  startDate: string;
  estimatedEnd: string;
  phase: BuildPhase;
  sqft: number;
  stories: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type BuildPhase =
  | 'pre-construction'
  | 'site-prep'
  | 'foundation'
  | 'framing'
  | 'rough-mep'
  | 'insulation'
  | 'drywall'
  | 'finish-work'
  | 'final-inspection'
  | 'complete';

// ─── Checklist ────────────────────────────────────────────────────────────────
export interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  code?: string;
  note?: string;
  critical?: boolean;
}

export interface ChecklistPhase {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  items: ChecklistItem[];
}

export interface ChecklistState {
  [phaseId: string]: {
    [itemId: string]: boolean;
  };
}

// ─── Calculator Results ────────────────────────────────────────────────────────
export interface ConcreteSlabResult {
  cubicFeet: number;
  cubicYards: number;
  bags60lb: number;
  bags80lb: number;
  bags90lb: number;
  cubicYardsWithWaste: number;
  rebarLFPerDir?: number;
  totalRebarLF?: number;
}

export interface FootingResult {
  cubicYards: number;
  cubicYardsWithWaste: number;
  bags80lb: number;
}

export interface FramingResult {
  studs: number;
  topPlatesLF: number;
  bottomPlateLF: number;
  totalPlateLF: number;
  boardFeet: number;
  cornerStuds: number;
}

export interface RoofResult {
  pitchAngle: number;
  pitchMultiplier: number;
  rafterLength: number;
  roofAreaSqFt: number;
  squares: number;
  shingleBundles3Tab: number;
  shingleBundlesArch: number;
  underlaymentRolls: number;
  deckingSheets: number;
  ridgeCapLF: number;
  dripEdgeLF: number;
  starterStripLF: number;
}

export interface StairResult {
  numberOfRisers: number;
  riserHeight: number;
  numberOfTreads: number;
  treadDepth: number;
  totalRun: number;
  stringerLength: number;
  minimumStringers: number;
  handrailRequired: boolean;
  codeCompliant: boolean;
  warnings: string[];
}

export interface MaterialResult {
  netSqFt: number;
  withWasteSqFt: number;
  sheets?: number;
  bundles?: number;
  boxes?: number;
}

// ─── Reference Data ────────────────────────────────────────────────────────────
export interface SpanTableEntry {
  size: string;
  spacing12: string;
  spacing16: string;
  spacing24: string;
}

export interface HeaderSizeEntry {
  maxOpeningFt: number;
  twoBySize: string;
  lvlNote: string;
}

export interface RValueEntry {
  zone: number;
  zoneName: string;
  attic: string;
  walls: string;
  floors: string;
  basement: string;
}

// ─── App State ─────────────────────────────────────────────────────────────────
export interface AppState {
  projects: Project[];
  checklistState: ChecklistState;
  activeProjectId: string | null;
}

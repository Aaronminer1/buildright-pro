import type { ChecklistPhase, SpanTableEntry, HeaderSizeEntry, RValueEntry } from '../types';

// ─── Checklists ───────────────────────────────────────────────────────────────

export const CHECKLIST_PHASES: ChecklistPhase[] = [
  {
    id: 'pre-construction',
    name: 'Pre-Construction',
    description: 'Planning, permits, and site preparation',
    icon: '📋',
    color: 'blue',
    items: [
      { id: 'pc1', category: 'Permits', text: 'Building permit obtained', code: 'IRC R105', critical: true },
      { id: 'pc2', category: 'Permits', text: 'Electrical permit obtained', code: 'NEC 90.2' },
      { id: 'pc3', category: 'Permits', text: 'Plumbing permit obtained' },
      { id: 'pc4', category: 'Permits', text: 'Mechanical (HVAC) permit obtained' },
      { id: 'pc5', category: 'Site', text: 'Survey and property pins located', critical: true },
      { id: 'pc6', category: 'Site', text: 'Utilities located (call 811)', critical: true, note: 'Always call 811 before digging' },
      { id: 'pc7', category: 'Site', text: 'Geotechnical/soil test completed' },
      { id: 'pc8', category: 'Site', text: 'Percolation test completed (if septic)' },
      { id: 'pc9', category: 'Site', text: 'Zoning and setback requirements verified', code: 'Local zoning' },
      { id: 'pc10', category: 'Site', text: 'Erosion control measures installed', note: 'Silt fences, inlet protection' },
      { id: 'pc11', category: 'Plans', text: 'Engineered drawings stamped', critical: true },
      { id: 'pc12', category: 'Plans', text: 'Site plan approved by municipality' },
      { id: 'pc13', category: 'Plans', text: 'Energy compliance report (Title 24/REScheck)' },
      { id: 'pc14', category: 'Insurance', text: 'Builder\'s risk insurance in place' },
      { id: 'pc15', category: 'Insurance', text: 'Liability insurance certificate on file' },
      { id: 'pc16', category: 'Insurance', text: 'Workers comp insurance current' },
    ],
  },
  {
    id: 'site-prep',
    name: 'Site Prep & Excavation',
    description: 'Clearing, grading, and excavation',
    icon: '🚜',
    color: 'yellow',
    items: [
      { id: 'sp1', category: 'Clearing', text: 'Trees and vegetation removed from footprint' },
      { id: 'sp2', category: 'Clearing', text: 'Topsoil stripped and stockpiled' },
      { id: 'sp3', category: 'Layout', text: 'Building corners staked by surveyor', critical: true },
      { id: 'sp4', category: 'Layout', text: 'Batter boards installed' },
      { id: 'sp5', category: 'Layout', text: 'Excavation lines marked' },
      { id: 'sp6', category: 'Excavation', text: 'Excavation to design depth', code: 'IRC R403.1', critical: true },
      { id: 'sp7', category: 'Excavation', text: 'Footings below frost line verified', critical: true, note: 'Check local frost depth requirements' },
      { id: 'sp8', category: 'Excavation', text: 'Subgrade compacted and approved' },
      { id: 'sp9', category: 'Drainage', text: 'Positive drainage sloped away from structure', code: 'IRC R401.3', critical: true },
      { id: 'sp10', category: 'Drainage', text: 'Gravel base under slab (if applicable)', note: 'Min 4" compacted gravel or 6" sand' },
      { id: 'sp11', category: 'Utilities', text: 'Underground utilities sleeved through footings' },
      { id: 'sp12', category: 'Utilities', text: 'Septic/sewer line location confirmed' },
    ],
  },
  {
    id: 'foundation',
    name: 'Foundation',
    description: 'Footings, foundation walls, and waterproofing',
    icon: '🏗️',
    color: 'gray',
    items: [
      { id: 'f1', category: 'Footings', text: 'Footing forms inspected by inspector', critical: true },
      { id: 'f2', category: 'Footings', text: 'Footing rebar in place per plan', code: 'IRC R403' },
      { id: 'f3', category: 'Footings', text: 'Anchor bolts/hold-downs positioned correctly', code: 'IRC R403.1.6' },
      { id: 'f4', category: 'Footings', text: 'Concrete strength per spec (min 2500 psi residential)', critical: true },
      { id: 'f5', category: 'Footings', text: 'Concrete test cylinders taken (if required)' },
      { id: 'f6', category: 'Foundation Wall', text: 'Foundation walls plumb and square', critical: true },
      { id: 'f7', category: 'Foundation Wall', text: 'Rebar in walls per engineered plans' },
      { id: 'f8', category: 'Foundation Wall', text: 'Top of foundation at correct elevation' },
      { id: 'f9', category: 'Waterproofing', text: 'Damp-proofing or waterproofing applied to exterior', code: 'IRC R406' },
      { id: 'f10', category: 'Waterproofing', text: 'Drainage board installed (full basement)', note: 'Dimple mat or rigid drainage panel' },
      { id: 'f11', category: 'Waterproofing', text: 'Footing drain tile installed', code: 'IRC R405' },
      { id: 'f12', category: 'Waterproofing', text: 'Sump pit installed (if required)' },
      { id: 'f13', category: 'Termite', text: 'Termite treatment applied (per local requirements)' },
      { id: 'f14', category: 'Termite', text: 'Termite shield installed on top of foundation' },
      { id: 'f15', category: 'Inspection', text: 'Foundation inspection approved', critical: true },
      { id: 'f16', category: 'Backfill', text: 'Concrete cured min 7 days before backfill', critical: true },
      { id: 'f17', category: 'Backfill', text: 'Backfill placed and compacted in lifts' },
    ],
  },
  {
    id: 'framing',
    name: 'Rough Framing',
    description: 'Floor, wall, and roof framing',
    icon: '🔨',
    color: 'orange',
    items: [
      { id: 'fr1', category: 'Sill Plate', text: 'Sill plate pressure-treated lumber', code: 'IRC R317', critical: true },
      { id: 'fr2', category: 'Sill Plate', text: 'Sill plate anchor bolt spacing per plan', code: 'IRC R403.1.6' },
      { id: 'fr3', category: 'Sill Plate', text: 'Sill gasket/seal installed' },
      { id: 'fr4', category: 'Floor', text: 'Floor joists sized per span tables', code: 'IRC R502', critical: true },
      { id: 'fr5', category: 'Floor', text: 'Joist hangers at connections to beams' },
      { id: 'fr6', category: 'Floor', text: 'Bridging/blocking installed (spans > 8 ft)', code: 'IRC R502.7' },
      { id: 'fr7', category: 'Floor', text: 'Subfloor installed with staggered joints' },
      { id: 'fr8', category: 'Floor', text: 'Subfloor glued and screwed' },
      { id: 'fr9', category: 'Walls', text: 'Wall plates straight and within tolerance', critical: true },
      { id: 'fr10', category: 'Walls', text: 'Stud spacing consistent per plan (16" or 24" OC)' },
      { id: 'fr11', category: 'Walls', text: 'Headers sized per span tables for all openings', code: 'IRC Table R602.7', critical: true },
      { id: 'fr12', category: 'Walls', text: 'Walls sheathed per plan (if structural)' },
      { id: 'fr13', category: 'Walls', text: 'Shear panels and hold-downs installed per plan', critical: true },
      { id: 'fr14', category: 'Walls', text: 'All walls plumb, level, and square', critical: true },
      { id: 'fr15', category: 'Roof', text: 'Rafters/trusses sized per design', code: 'IRC R802', critical: true },
      { id: 'fr16', category: 'Roof', text: 'Rafter ties or collar ties installed', code: 'IRC R802.4' },
      { id: 'fr17', category: 'Roof', text: 'Ridge beam/board sized correctly' },
      { id: 'fr18', category: 'Roof', text: 'Roof sheathing installed with H-clips' },
      { id: 'fr19', category: 'Roof', text: 'All blocking at exterior walls and beams' },
      { id: 'fr20', category: 'Inspection', text: 'Framing inspection approved', critical: true },
    ],
  },
  {
    id: 'rough-mep',
    name: 'Rough MEP',
    description: 'Mechanical, Electrical, and Plumbing rough-in',
    icon: '⚡',
    color: 'purple',
    items: [
      { id: 'm1', category: 'Electrical', text: 'Service entrance location approved', code: 'NEC 230', critical: true },
      { id: 'm2', category: 'Electrical', text: 'Panel location set and grounded', code: 'NEC 250' },
      { id: 'm3', category: 'Electrical', text: 'All branch circuit rough-in complete' },
      { id: 'm4', category: 'Electrical', text: 'Arc-fault circuit interrupter (AFCI) wired', code: 'NEC 210.12', critical: true },
      { id: 'm5', category: 'Electrical', text: 'Smoke detector wiring in place', code: 'IRC R314', critical: true },
      { id: 'm6', category: 'Electrical', text: 'Carbon monoxide detector wired', code: 'IRC R315', critical: true },
      { id: 'm7', category: 'Electrical', text: 'Wire fill in boxes within code limits', code: 'NEC 314.16' },
      { id: 'm8', category: 'Plumbing', text: 'DWV (drain, waste, vent) rough-in complete', code: 'IRC P3000', critical: true },
      { id: 'm9', category: 'Plumbing', text: 'DWV pressure test passed (air or water)', critical: true },
      { id: 'm10', category: 'Plumbing', text: 'Supply lines rough-in complete' },
      { id: 'm11', category: 'Plumbing', text: 'Water supply pressure test (min 100 psi for 15 min)', critical: true },
      { id: 'm12', category: 'Plumbing', text: 'Pipe penetrations through fire-rated assemblies fire-blocked', code: 'IRC R302.11' },
      { id: 'm13', category: 'HVAC', text: 'Duct work sized per Manual D', code: 'IRC M1601', critical: true },
      { id: 'm14', category: 'HVAC', text: 'Return air pathways adequate' },
      { id: 'm15', category: 'HVAC', text: 'Flue/vent penetrations sealed and clearance maintained', critical: true },
      { id: 'm16', category: 'HVAC', text: 'Combustion air provisions in place' },
      { id: 'm17', category: 'Inspection', text: 'Rough MEP inspection approved', critical: true },
    ],
  },
  {
    id: 'insulation',
    name: 'Insulation & Air Barrier',
    description: 'Insulation, vapor retarder, and air sealing',
    icon: '🌡️',
    color: 'green',
    items: [
      { id: 'i1', category: 'Air Sealing', text: 'All penetrations in top plates air-sealed', critical: true },
      { id: 'i2', category: 'Air Sealing', text: 'Bottom plates sealed to subfloor' },
      { id: 'i3', category: 'Air Sealing', text: 'Rim joists sealed and insulated', critical: true },
      { id: 'i4', category: 'Air Sealing', text: 'Electrical and plumbing penetrations through top plates sealed' },
      { id: 'i5', category: 'Walls', text: 'Wall insulation R-value meets local requirements', critical: true },
      { id: 'i6', category: 'Walls', text: 'Insulation completely fills stud bays (no voids)' },
      { id: 'i7', category: 'Attic', text: 'Attic insulation R-value meets local requirements', critical: true },
      { id: 'i8', category: 'Attic', text: 'Attic ventilation baffles installed at eaves' },
      { id: 'i9', category: 'Attic', text: 'Attic hatch insulated to meeting attic R-value' },
      { id: 'i10', category: 'Floor', text: 'Floor insulation installed (if over unconditioned space)' },
      { id: 'i11', category: 'Vapor Retarder', text: 'Vapor barrier installed on warm side in cold climates', code: 'IRC R702.7' },
      { id: 'i12', category: 'Vapor Retarder', text: 'Crawl space ground cover vapor barrier (6-mil poly)', code: 'IRC R408.3' },
      { id: 'i13', category: 'Inspection', text: 'Insulation inspection approved', critical: true },
    ],
  },
  {
    id: 'drywall',
    name: 'Drywall & Finishes',
    description: 'Drywall installation and interior finishes',
    icon: '🏠',
    color: 'teal',
    items: [
      { id: 'dw1', category: 'Fire-Rated', text: '5/8" Type X drywall in garage (car side)', code: 'IRC R302.5', critical: true },
      { id: 'dw2', category: 'Fire-Rated', text: 'Fire blocking in wall cavities at mid-height', code: 'IRC R302.11' },
      { id: 'dw3', category: 'Moisture', text: 'Moisture-resistant drywall in bathrooms', code: 'IRC R702.4' },
      { id: 'dw4', category: 'Moisture', text: 'Cement board at tile surrounds/wet areas' },
      { id: 'dw5', category: 'Installation', text: 'Drywall fastened per code spacing (16" field, 8" edge)', code: 'IRC Table R702.3.5' },
      { id: 'dw6', category: 'Installation', text: 'Seams staggered and joints at studs' },
      { id: 'dw7', category: 'Finishing', text: 'All three coats of joint compound applied' },
      { id: 'dw8', category: 'Finishing', text: 'Corners taped and beaded' },
      { id: 'dw9', category: 'Finishing', text: 'Final sand — smooth, ready for paint' },
      { id: 'dw10', category: 'Paint', text: 'Primer applied to all drywall' },
      { id: 'dw11', category: 'Paint', text: 'Final paint coats applied — inspect sheen and coverage' },
      { id: 'dw12', category: 'Trim', text: 'Base, casing, crown molding installed' },
      { id: 'dw13', category: 'Trim', text: 'Interior doors hung, plumb, and operating correctly' },
      { id: 'dw14', category: 'Cabinets', text: 'Kitchen/bath cabinets installed level and plumb' },
      { id: 'dw15', category: 'Cabinets', text: 'Countertops installed and secured' },
    ],
  },
  {
    id: 'final-inspection',
    name: 'Final Inspection',
    description: 'Finish work and certificate of occupancy',
    icon: '✅',
    color: 'emerald',
    items: [
      { id: 'fi1', category: 'HVAC', text: 'HVAC startup and commissioning complete', critical: true },
      { id: 'fi2', category: 'HVAC', text: 'All supply and return registers installed and balanced' },
      { id: 'fi3', category: 'HVAC', text: 'Filter installed in HVAC unit' },
      { id: 'fi4', category: 'Electrical', text: 'All devices, fixtures, outlets installed', critical: true },
      { id: 'fi5', category: 'Electrical', text: 'GFCI outlets verified at all wet locations', code: 'NEC 210.8', critical: true },
      { id: 'fi6', category: 'Electrical', text: 'Smoke detectors tested and functional', code: 'IRC R314', critical: true },
      { id: 'fi7', category: 'Electrical', text: 'CO detectors tested and functional', code: 'IRC R315', critical: true },
      { id: 'fi8', category: 'Plumbing', text: 'All fixtures installed and leak-free', critical: true },
      { id: 'fi9', category: 'Plumbing', text: 'Water heater installed per code and permitted' },
      { id: 'fi10', category: 'Plumbing', text: 'Pressure relief valve on water heater properly piped', critical: true },
      { id: 'fi11', category: 'Exterior', text: 'All exterior penetrations sealed (caulk/flashing)' },
      { id: 'fi12', category: 'Exterior', text: 'Grading slopes away from structure min 6" in 10 ft', code: 'IRC R401.3', critical: true },
      { id: 'fi13', category: 'Exterior', text: 'Gutters and downspouts installed' },
      { id: 'fi14', category: 'Safety', text: 'Guardrails on decks and porches > 30" high', code: 'IRC R312', critical: true },
      { id: 'fi15', category: 'Safety', text: 'Stair handrails graspable per code', code: 'IRC R311.7.8', critical: true },
      { id: 'fi16', category: 'Safety', text: 'Safety glass in hazardous locations', code: 'IRC R308', critical: true },
      { id: 'fi17', category: 'Inspection', text: 'Final building inspection passed', critical: true },
      { id: 'fi18', category: 'Inspection', text: 'Certificate of Occupancy issued', critical: true },
    ],
  },
];

// ─── Span Tables ──────────────────────────────────────────────────────────────

/** Floor joist max span (Southern Yellow Pine #2, 40 psf live + 10 psf dead) */
export const FLOOR_JOIST_SPANS: SpanTableEntry[] = [
  { size: '2×6',  spacing12: "9'-8\"",  spacing16: "8'-9\"",  spacing24: "7'-7\"" },
  { size: '2×8',  spacing12: "12'-9\"", spacing16: "11'-7\"", spacing24: "10'-0\"" },
  { size: '2×10', spacing12: "16'-2\"", spacing16: "14'-9\"", spacing24: "12'-9\"" },
  { size: '2×12', spacing12: "19'-8\"", spacing16: "17'-11\"",spacing24: "15'-7\"" },
];

/** Ceiling joist max span (SYP #2, 10 psf live + 5 psf dead — attic no storage) */
export const CEILING_JOIST_SPANS: SpanTableEntry[] = [
  { size: '2×4',  spacing12: "11'-5\"", spacing16: "10'-5\"", spacing24: "9'-1\"" },
  { size: '2×6',  spacing12: "17'-11\"",spacing16: "16'-3\"", spacing24: "14'-3\"" },
  { size: '2×8',  spacing12: "23'-8\"", spacing16: "21'-6\"", spacing24: "18'-9\"" },
  { size: '2×10', spacing12: "30'-1\"", spacing16: "27'-4\"", spacing24: "23'-11\"" },
];

/** Rafter max span (SYP #2, 20 psf live + 20 psf dead — light roof) */
export const RAFTER_SPANS: SpanTableEntry[] = [
  { size: '2×6',  spacing12: "14'-4\"", spacing16: "13'-0\"", spacing24: "11'-4\"" },
  { size: '2×8',  spacing12: "18'-11\"",spacing16: "17'-2\"", spacing24: "14'-11\"" },
  { size: '2×10', spacing12: "24'-1\"", spacing16: "21'-11\"",spacing24: "19'-1\"" },
  { size: '2×12', spacing12: "29'-4\"", spacing16: "26'-8\"", spacing24: "23'-3\"" },
];

// ─── Header Sizes ─────────────────────────────────────────────────────────────

export const HEADER_SIZES: HeaderSizeEntry[] = [
  { maxOpeningFt: 3,  twoBySize: '2 – 2×6',  lvlNote: 'Or (1) 3.5"×5.25" LVL' },
  { maxOpeningFt: 4,  twoBySize: '2 – 2×8',  lvlNote: 'Or (1) 3.5"×7.25" LVL' },
  { maxOpeningFt: 5,  twoBySize: '2 – 2×8',  lvlNote: 'Or (1) 3.5"×7.25" LVL' },
  { maxOpeningFt: 6,  twoBySize: '2 – 2×10', lvlNote: 'Or (1) 3.5"×9.25" LVL' },
  { maxOpeningFt: 8,  twoBySize: '2 – 2×12', lvlNote: 'Or (1) 3.5"×11.25" LVL' },
  { maxOpeningFt: 10, twoBySize: '3 – 2×10 or Engineered', lvlNote: '(1) 5.25"×9.25" LVL' },
  { maxOpeningFt: 12, twoBySize: '3 – 2×12 or Engineered', lvlNote: '(1) 5.25"×11.25" LVL' },
  { maxOpeningFt: 16, twoBySize: 'Engineered beam required', lvlNote: 'Consult structural engineer' },
];

// ─── R-Value Guide ─────────────────────────────────────────────────────────────

export const R_VALUE_GUIDE: RValueEntry[] = [
  { zone: 1, zoneName: 'Hot/Very Hot (Hawaii, S. Florida)', attic: 'R-30 to R-49', walls: 'R-13', floors: 'R-13', basement: 'None required' },
  { zone: 2, zoneName: 'Hot/Humid (Gulf Coast, S. Texas)', attic: 'R-38 to R-60', walls: 'R-13', floors: 'R-13 to R-19', basement: 'R-10' },
  { zone: 3, zoneName: 'Warm (SE US, Calif. coast)', attic: 'R-38 to R-60', walls: 'R-13 to R-20', floors: 'R-19 to R-25', basement: 'R-10 to R-15' },
  { zone: 4, zoneName: 'Mixed (Mid-Atlantic, PNW)', attic: 'R-49 to R-60', walls: 'R-13 to R-20+', floors: 'R-25 to R-30', basement: 'R-10 to R-15' },
  { zone: 5, zoneName: 'Cool (Great Lakes, New England)', attic: 'R-49 to R-60', walls: 'R-20 to R-21', floors: 'R-30', basement: 'R-15 to R-19' },
  { zone: 6, zoneName: 'Cold (N. Minnesota, Montana)', attic: 'R-49 to R-60', walls: 'R-20+', floors: 'R-30', basement: 'R-15 to R-21' },
  { zone: 7, zoneName: 'Very Cold (N. Canada, Alaska)', attic: 'R-60', walls: 'R-21+', floors: 'R-38', basement: 'R-21+' },
  { zone: 8, zoneName: 'Arctic (N. Alaska)', attic: 'R-60', walls: 'R-21+', floors: 'R-38', basement: 'R-21+' },
];

// ─── Fastener / Nailing Schedule ──────────────────────────────────────────────

export const NAILING_SCHEDULE = [
  { connection: 'Stud to top or bottom plate (toe-nail)', fastener: '4 – 8d nails TOE, or 2 – 16d nails END-nail', code: 'IRC Table R602.3(1)' },
  { connection: 'Double stud (face-nail)', fastener: '10d nails @ 24" OC', code: 'IRC Table R602.3(1)' },
  { connection: 'Double top plate', fastener: '16d nails @ 24" OC', code: 'IRC Table R602.3(1)' },
  { connection: 'Sole plate to joist (toe-nail)', fastener: '16d nails @ 16" OC', code: 'IRC Table R602.3(1)' },
  { connection: 'Joist to sill or girder (toe-nail)', fastener: '3 – 8d nails', code: 'IRC Table R602.3(1)' },
  { connection: 'Rim joist to top plate (toe-nail)', fastener: '8d nails @ 6" OC', code: 'IRC Table R602.3(1)' },
  { connection: 'Rafter to top plate (toe-nail)', fastener: '3 – 8d nails OR H2.5 hurricane clip', code: 'IRC Table R802.4' },
  { connection: 'Ridge board to rafter (end-nail)', fastener: '3 – 16d nails each side', code: 'IRC Table R802.4' },
  { connection: 'Sheathing to studs (structural)', fastener: '8d nails @ 6" edges, 12" field', code: 'IRC Table R602.3(3)' },
  { connection: 'Subfloor to joists (glue-nail)', fastener: '8d deformed shank @ 6" edges, 12" field + PL400 adhesive', code: 'IRC Table R503.2' },
  { connection: 'Collar tie to rafter (face-nail)', fastener: '3 – 10d nails each end', code: 'IRC R802.4.6' },
  { connection: 'Hurricane / seismic strap at rafter', fastener: 'Per manufacturer (H2.5, H10, etc.)', code: 'IRC R802.11' },
];

// ─── Concrete Mix Guide ────────────────────────────────────────────────────────

export const CONCRETE_MIX_GUIDE = [
  { use: 'Footings & foundations (residential)', strength: '2,500 – 3,000 psi', wCRatio: '0.55–0.60', slump: '4"', note: 'Standard ready-mix; add air entrainment in freeze-thaw zones' },
  { use: 'Slabs on grade', strength: '3,000 – 3,500 psi', wCRatio: '0.50', slump: '4"', note: '4" min thickness; fiber reinforcement optional' },
  { use: 'Driveways & flatwork', strength: '3,500 – 4,000 psi', wCRatio: '0.45–0.50', slump: '4"', note: 'Air-entrained in cold climates' },
  { use: 'Basement/garage walls (exposed)', strength: '4,000 psi', wCRatio: '0.45', slump: '5"', note: 'For water resistance; consider w/c ≤ 0.45' },
  { use: 'Structural columns/beams', strength: '4,000 – 5,000 psi', wCRatio: '0.40–0.45', slump: '4"', note: 'Per structural engineer specs; use superplasticizer for flow' },
  { use: 'Post-set (fence/mailbox posts)', strength: '1 bag Quikrete Fast-Set', wCRatio: 'Per bag', slump: 'Soupy', note: 'Pour dry, add water — sets in 20–40 min' },
];

// ─── Pitch Quick Reference ────────────────────────────────────────────────────

export const PITCH_REFERENCE = [
  { pitch: '2:12', angleDeg: 9.5,  multiplier: 1.014, walkable: false, note: 'Low slope — requires special low-slope shingles' },
  { pitch: '3:12', angleDeg: 14.0, multiplier: 1.031, walkable: false, note: 'Minimum slope for standard 3-tab shingles' },
  { pitch: '4:12', angleDeg: 18.4, multiplier: 1.054, walkable: true,  note: 'Common residential — good drainage' },
  { pitch: '5:12', angleDeg: 22.6, multiplier: 1.083, walkable: true,  note: 'Popular ranch/contemporary style' },
  { pitch: '6:12', angleDeg: 26.6, multiplier: 1.118, walkable: true,  note: 'Very common — balanced look' },
  { pitch: '7:12', angleDeg: 30.3, multiplier: 1.158, walkable: true,  note: 'Begin to need roof jacks' },
  { pitch: '8:12', angleDeg: 33.7, multiplier: 1.202, walkable: false, note: 'Steep — safety equipment required' },
  { pitch: '9:12', angleDeg: 36.9, multiplier: 1.250, walkable: false, note: 'Steep — use scaffold or roof jacks' },
  { pitch: '10:12',angleDeg: 39.8, multiplier: 1.302, walkable: false, note: 'Very steep' },
  { pitch: '12:12',angleDeg: 45.0, multiplier: 1.414, walkable: false, note: '45° — equal rise and run' },
];

// ─── Rough Opening Sizes ──────────────────────────────────────────────────────

export const ROUGH_OPENINGS = [
  { item: 'Standard door (2\'8" × 6\'8")',      ro: '2\'10" × 6\'10.5"', note: 'Add 2" width + 2.5" height' },
  { item: 'Standard door (3\'0" × 6\'8")',       ro: '3\'2" × 6\'10.5"',  note: '' },
  { item: 'Exterior door (3\'0" × 6\'8")',       ro: '3\'2.5" × 6\'11"',  note: 'Includes j-channel/brickmold' },
  { item: 'Sliding glass door (6\'0")',          ro: '6\'2" × 6\'11"',    note: '2" each side, 3" top' },
  { item: 'Standard window (2\'0" × 3\'0")',     ro: '2\'2" × 3\'2"',     note: 'RO = nominal + 2" each dimension' },
  { item: 'Standard window (3\'0" × 4\'0")',     ro: '3\'2" × 4\'2"',     note: '' },
  { item: 'Egress window (min 5.7 SF open)',     ro: '2\'6" × 3\'8"',     note: 'IRC R310 — bedroom windows' },
  { item: 'Garage door (9\'× 7\')',             ro: '9\'2" × 7\'2"',     note: 'Steel jamb headers required' },
  { item: 'Garage door (16\' × 7\')',           ro: '16\'2" × 7\'2"',    note: 'LVL or steel beam header' },
];

// ─── Safety Data ──────────────────────────────────────────────────────────────

export const SAFETY_CHECKLIST: Array<{ category: string; items: Array<{ text: string; code?: string; critical?: boolean; note?: string }> }> = [
  {
    category: 'Fall Protection',
    items: [
      { text: 'Fall protection required for work 6 ft or more above lower level (residential)', code: 'OSHA 1926.502', critical: true },
      { text: 'Guardrails: min 42" high, mid-rail at 21", toeboard', code: 'OSHA 1926.502(b)' },
      { text: 'Personal fall arrest system (harness) when guardrail not feasible', code: 'OSHA 1926.502(d)' },
      { text: 'Safety nets — used when other methods impractical', code: 'OSHA 1926.502(c)' },
      { text: 'All floor openings covered and secured', code: 'OSHA 1926.502(j)', critical: true },
      { text: 'Skylights covered with rated covers when not present during framing', critical: true },
      { text: 'Scaffolding erected by competent person, inspected daily', code: 'OSHA 1926.451' },
      { text: 'Ladder extends 3 ft above landing, secured at top', code: 'OSHA 1926.1053' },
    ],
  },
  {
    category: 'Excavation & Trenching',
    items: [
      { text: 'Competent person present at all excavations', code: 'OSHA 1926.650', critical: true },
      { text: 'Excavations >5 ft sloped, shored, or shielded', code: 'OSHA 1926.652', critical: true },
      { text: 'Excavations >4 ft: ladders within 25 ft of workers', code: 'OSHA 1926.651(c)' },
      { text: 'Spoil piles at least 2 ft from edge', code: 'OSHA 1926.651(j)' },
      { text: 'Daily inspection before each shift', code: 'OSHA 1926.651(k)' },
    ],
  },
  {
    category: 'Tool & Equipment Safety',
    items: [
      { text: 'All power tools have guards in place', code: 'OSHA 1926.300', critical: true },
      { text: 'Circular saws have retractable lower guards', code: 'OSHA 1926.304' },
      { text: 'Nail guns — sequential trip preferred over contact trip', note: 'Reduces inadvertent discharge' },
      { text: 'GFCI protection on all electrical equipment', code: 'OSHA 1926.404(b)', critical: true },
      { text: 'Extension cords in good condition (no splices)', code: 'OSHA 1926.404' },
      { text: 'Heavy equipment operators trained and certified' },
    ],
  },
  {
    category: 'PPE Requirements',
    items: [
      { text: 'Hard hats required in areas with overhead hazards', code: 'OSHA 1926.100', critical: true },
      { text: 'Safety glasses / face shields when sawing, grinding, nailing', code: 'OSHA 1926.102' },
      { text: 'Hearing protection for noise > 85 dB (table saw, hammer drill, concrete work)', code: 'OSHA 1926.101' },
      { text: 'Steel-toed boots', note: 'Strongly recommended at all times on site' },
      { text: 'Gloves appropriate to task', },
      { text: 'Dust masks / respirators when cutting treated lumber, concrete, or drywall', code: 'OSHA 1926.103' },
      { text: 'High-visibility vest around equipment/roadway', code: 'OSHA 1926.201' },
    ],
  },
  {
    category: 'Hazardous Materials',
    items: [
      { text: 'SDS (Safety Data Sheets) on site for all chemicals', code: 'OSHA 1910.1200', critical: true },
      { text: 'Silica exposure controls when cutting concrete/masonry', code: 'OSHA 1926.1153', critical: true },
      { text: 'Lead-safe practices when working on pre-1978 homes', code: 'EPA RRP Rule', critical: true },
      { text: 'Pressure-treated lumber — wash hands, no sawdust burning', note: 'Contains copper compounds (CA-C, MCA)' },
      { text: 'Adhesives/solvents stored in flammable storage cabinet', code: 'OSHA 1926.152' },
    ],
  },
];

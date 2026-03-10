import { Link } from 'react-router-dom';

const CALC_GROUPS = [
  {
    group: 'Site & Structure',
    color: 'amber',
    tools: [
      { to: '/calculators/concrete',   icon: '🏗️', label: 'Concrete & Foundation', desc: 'Slabs, footings, walls, piers' },
      { to: '/calculators/framing',    icon: '🔨', label: 'Framing & Structure',   desc: 'Studs, joists, rafters, headers' },
      { to: '/calculators/roofing',    icon: '🏠', label: 'Roofing',               desc: 'Pitch, area, shingles, underlayment' },
      { to: '/calculators/stairs',     icon: '📐', label: 'Stairs',                desc: 'Rise, run, stringer length' },
      { to: '/calculators/lumber',     icon: '🪵', label: 'Lumber & Board Feet',   desc: 'Board feet, quantities, waste' },
      { to: '/calculators/masonry',    icon: '🧱', label: 'Masonry & Block',       desc: 'CMU block, brick, mortar' },
    ],
  },
  {
    group: 'Rough-In Systems',
    color: 'blue',
    tools: [
      { to: '/calculators/hardware',   icon: '🔩', label: 'Hardware & Connectors', desc: 'Joist hangers, hurricane ties, nails' },
      { to: '/calculators/electrical', icon: '⚡', label: 'Electrical Rough-In',   desc: 'Circuits, panel, wire sizing, outlets' },
      { to: '/calculators/plumbing',   icon: '🚿', label: 'Plumbing Rough-In',     desc: 'Fixtures, DWV pipe, PEX supply lines' },
      { to: '/calculators/hvac',       icon: '❄️', label: 'HVAC Load',             desc: 'Manual J heat/cool load estimate' },
      { to: '/calculators/insulation', icon: '🌡️', label: 'Insulation & Energy',   desc: 'R-values, batts, blown-in, spray' },
    ],
  },
  {
    group: 'Finishes & Interior',
    color: 'green',
    tools: [
      { to: '/calculators/interior',   icon: '🎨', label: 'Drywall & Paint',       desc: 'Sheets, gallons, tape, joint compound' },
      { to: '/calculators/flooring',   icon: '🏡', label: 'Flooring & Siding',     desc: 'Hardwood, tile, LVP, vinyl siding' },
      { to: '/calculators/tile',       icon: '🔳', label: 'Tile & Wet Areas',      desc: 'Tile layout, cement board, Schluter' },
    ],
  },
  {
    group: 'Estimating',
    color: 'purple',
    tools: [
      { to: '/calculators/cost',       icon: '💰', label: 'Cost Estimator',        desc: 'Full line-item project cost estimate' },
    ],
  },
];

const COLOR_MAP: Record<string, { header: string; card: string; badge: string }> = {
  amber:  { header: 'bg-amber-50 border-amber-200',  card: 'hover:border-amber-300 hover:shadow-amber-50',  badge: 'bg-amber-100 text-amber-700' },
  blue:   { header: 'bg-blue-50 border-blue-200',    card: 'hover:border-blue-300 hover:shadow-blue-50',    badge: 'bg-blue-100 text-blue-700' },
  green:  { header: 'bg-green-50 border-green-200',  card: 'hover:border-green-300 hover:shadow-green-50',  badge: 'bg-green-100 text-green-700' },
  purple: { header: 'bg-purple-50 border-purple-200', card: 'hover:border-purple-300 hover:shadow-purple-50', badge: 'bg-purple-100 text-purple-700' },
};

export function CalculatorsIndex() {
  const total = CALC_GROUPS.reduce((n, g) => n + g.tools.length, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">All Calculators</h1>
        <p className="text-slate-500 mt-1 text-sm">
          {total} calculators — click any card to open it. Every calculator explains what each field means,
          so you don't need to be an expert to use them.
        </p>
      </div>

      {/* Groups */}
      {CALC_GROUPS.map(group => {
        const c = COLOR_MAP[group.color];
        return (
          <div key={group.group}>
            <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg border ${c.header}`}>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                {group.tools.length}
              </span>
              <h2 className="font-semibold text-slate-700">{group.group}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.tools.map(t => (
                <Link
                  key={t.to}
                  to={t.to}
                  className={`bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3
                    hover:shadow-md transition-all group ${c.card}`}
                >
                  <span className="text-3xl mt-0.5 leading-none">{t.icon}</span>
                  <div>
                    <div className="font-medium text-slate-800 group-hover:text-amber-600 transition-colors text-sm">
                      {t.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

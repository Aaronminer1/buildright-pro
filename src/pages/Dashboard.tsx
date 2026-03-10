import { Link } from 'react-router-dom';
import {
  HardHat, FolderOpen, Calculator, ClipboardCheck,
  BookOpen, TrendingUp, Clock, ChevronRight,
  Layers, Ruler, Hammer, Home, TreePine,
  FileText, Receipt, DollarSign,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useBusiness } from '../context/BusinessContext';
import { CHECKLIST_PHASES } from '../data/referenceData';
import { calcQuoteTotals, calcInvoiceTotals, fmt } from '../types/business';

const QUICK_TOOLS = [
  { to: '/calculators/concrete',   label: 'Concrete Calc',    icon: '🏗️', desc: 'Slabs, footings, walls' },
  { to: '/calculators/framing',    label: 'Framing Calc',     icon: '🔨', desc: 'Studs, joists, rafters' },
  { to: '/calculators/roofing',    label: 'Roof Calc',        icon: '🏠', desc: 'Pitch, area, materials' },
  { to: '/calculators/stairs',     label: 'Stair Calc',       icon: '📐', desc: 'Rise, run, stringer' },
  { to: '/calculators/cost',       label: 'Cost Estimator',   icon: '💰', desc: 'Full project estimate' },
  { to: '/calculators/lumber',     label: 'Lumber Calc',      icon: '🪵', desc: 'Board feet & quantities' },
  { to: '/calculators/interior',   label: 'Drywall & Paint',  icon: '🎨', desc: 'Sheets, gallons, tape' },
  { to: '/calculators/insulation', label: 'Insulation',       icon: '🌡️', desc: 'R-values, batts, blown-in' },
];

const BUILD_PHASES = [
  { label: 'Pre-Construction',   desc: 'Permits, survey, plans',             color: 'bg-blue-100 text-blue-700',   icon: <Layers size={16} /> },
  { label: 'Site Prep',          desc: 'Clearing, excavation, layout',        color: 'bg-yellow-100 text-yellow-700', icon: <TreePine size={16} /> },
  { label: 'Foundation',         desc: 'Footings, walls, waterproofing',      color: 'bg-slate-200 text-slate-700', icon: <HardHat size={16} /> },
  { label: 'Framing',            desc: 'Floor, walls, roof structure',        color: 'bg-orange-100 text-orange-700', icon: <Hammer size={16} /> },
  { label: 'Rough MEP',          desc: 'Electrical, plumbing, HVAC rough',    color: 'bg-purple-100 text-purple-700', icon: <Ruler size={16} /> },
  { label: 'Insulation',         desc: 'Air sealing, insulation, vapor',      color: 'bg-green-100 text-green-700', icon: <Home size={16} /> },
  { label: 'Drywall & Finishes', desc: 'Drywall, paint, trim, cabinets',      color: 'bg-teal-100 text-teal-700',  icon: <Home size={16} /> },
  { label: 'Final Inspection',   desc: 'MEP finish, CO, punchlist',           color: 'bg-emerald-100 text-emerald-700', icon: <ClipboardCheck size={16} /> },
];

const TIPS = [
  'Always call 811 before you dig to locate buried utilities.',
  'Footings must be below the local frost line — check your municipality.',
  'Concrete gains 70% strength in 7 days, but wait 28 days for full load.',
  '2R + T = 24–25" is the stair comfort formula (R=riser, T=tread).',
  'Use pressure-treated lumber within 6 inches of soil or concrete.',
  'R-value stacks: you can layer insulation products to hit your target.',
  'Slope grade 6 inches per 10 feet away from the foundation (IRC R401.3).',
  'Engineered lumber (LVL, PSL) doesn\'t warp — great for long-span headers.',
  '3-4-5 triangle: 3 ft one way, 4 ft the other = 5 ft hypotenuse for square.',
  'Roof pitch 4:12 is the minimum for asphalt shingles to perform properly.',
];

function getTip() {
  return TIPS[new Date().getDate() % TIPS.length];
}

export function Dashboard() {
  const { projects, checklistState } = useApp();
  const { quotes, invoices } = useBusiness();
  const activeProjects = projects.filter(p => p.phase !== 'complete');

  // Financial summaries
  const openQuotesValue = quotes
    .filter(q => q.status === 'draft' || q.status === 'sent')
    .reduce((s, q) => s + calcQuoteTotals(q).total, 0);
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const collectedThisMonth = invoices
    .flatMap(i => i.payments)
    .filter(p => p.date.startsWith(thisMonth))
    .reduce((s, p) => s + p.amount, 0);
  const outstanding = invoices
    .filter(i => i.status !== 'paid')
    .reduce((s, i) => s + calcInvoiceTotals(i).balance, 0);

  // Calculate checklist progress
  const totalItems = CHECKLIST_PHASES.reduce((s, ph) => s + ph.items.length, 0);
  const checkedItems = Object.values(checklistState).reduce(
    (s, phase) => s + Object.values(phase).filter(Boolean).length, 0
  );

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <HardHat size={20} className="text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">BuildRight Pro</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">
            The Complete Contractor Toolkit
          </h2>
          <p className="text-slate-300 text-sm max-w-lg">
            From breaking ground to handing over the keys — calculators, checklists, reference tables,
            and safety guides all in one place.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link to="/calculators/concrete"
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Open Calculators
            </Link>
            <Link to="/checklists"
              className="bg-white/10 hover:bg-white/20 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              View Checklists
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Projects', value: activeProjects.length, icon: <FolderOpen size={20} className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Calculators',     value: 11,                    icon: <Calculator size={20} className="text-amber-500" />, bg: 'bg-amber-50' },
          { label: 'Checklist Items', value: totalItems,            icon: <ClipboardCheck size={20} className="text-green-500" />, bg: 'bg-green-50' },
          { label: 'Items Checked',   value: checkedItems,          icon: <TrendingUp size={20} className="text-purple-500" />, bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`${s.bg} p-2.5 rounded-xl`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Financial summary */}
      {(quotes.length > 0 || invoices.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link to="/quotes"
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-sm transition-all group">
            <div className="bg-blue-50 p-2.5 rounded-xl">
              <FileText size={20} className="text-blue-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{fmt(openQuotesValue)}</div>
              <div className="text-xs text-slate-500">Open Quote Pipeline</div>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-400" />
          </Link>
          <Link to="/invoices"
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-amber-300 hover:shadow-sm transition-all group">
            <div className="bg-amber-50 p-2.5 rounded-xl">
              <Receipt size={20} className="text-amber-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{fmt(outstanding)}</div>
              <div className="text-xs text-slate-500">Outstanding Balance</div>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-amber-400" />
          </Link>
          <Link to="/invoices"
            className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 hover:border-green-300 hover:shadow-sm transition-all group">
            <div className="bg-green-50 p-2.5 rounded-xl">
              <DollarSign size={20} className="text-green-500" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-800">{fmt(collectedThisMonth)}</div>
              <div className="text-xs text-slate-500">Collected This Month</div>
            </div>
            <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-green-400" />
          </Link>
        </div>
      )}

      {/* Quick tools */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-800">Quick Calculators</h2>
          <Link to="/calculators/concrete" className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1">
            All tools <ChevronRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_TOOLS.map(t => (
            <Link
              key={t.to}
              to={t.to}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:border-amber-300 hover:shadow-md
                transition-all group"
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-medium text-slate-800 text-sm group-hover:text-amber-600 transition-colors">
                {t.label}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Build phase guide + projects side by side */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Build phases */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Layers size={18} className="text-amber-500" /> Build Phase Guide
          </h2>
          <div className="space-y-2">
            {BUILD_PHASES.map((ph, i) => (
              <div key={ph.label} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white flex items-center
                  justify-center text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${ph.color}`}>
                      {ph.icon} {ph.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{ph.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active projects + tip */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <FolderOpen size={18} className="text-amber-500" /> Active Projects
              </h2>
              <Link to="/projects" className="text-sm text-amber-600 hover:text-amber-700">
                Manage →
              </Link>
            </div>
            {activeProjects.length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <FolderOpen size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No projects yet</p>
                <Link to="/projects" className="text-sm text-amber-500 mt-1 block">Create one →</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {activeProjects.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="bg-amber-100 p-1.5 rounded-lg">
                      <HardHat size={16} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{p.name}</div>
                      <div className="text-xs text-slate-400 truncate">{p.address || 'No address'}</div>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full capitalize">
                      {p.phase.replace(/-/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pro tip */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <div className="text-sm font-semibold text-amber-800 mb-1">Pro Tip of the Day</div>
                <p className="text-sm text-amber-700">{getTip()}</p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <BookOpen size={18} className="text-amber-500" /> Quick Reference
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/reference', label: '📏 Span Tables' },
                { to: '/reference', label: '🔩 Nailing Schedule' },
                { to: '/reference', label: '🏗️ Header Sizes' },
                { to: '/reference', label: '🌡️ R-Value Guide' },
                { to: '/safety',    label: '⚠️ OSHA Checklists' },
                { to: '/checklists',label: '✅ Inspections' },
              ].map(l => (
                <Link
                  key={l.to + l.label}
                  to={l.to}
                  className="text-sm text-slate-600 hover:text-amber-600 hover:bg-amber-50 px-3 py-2
                    rounded-lg transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Clock size={18} className="text-amber-500" /> Getting Started
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <FolderOpen size={24} className="text-blue-500" />, title: '1. Create a Project', desc: 'Set up your job — add address, client, phase, and square footage.', to: '/projects' },
            { icon: <Calculator size={24} className="text-amber-500" />, title: '2. Run Calculations', desc: 'Use 11+ calculators covering concrete, framing, roofing, costs, and more.', to: '/calculators/concrete' },
            { icon: <ClipboardCheck size={24} className="text-green-500" />, title: '3. Follow Checklists', desc: '8 phase-specific inspection checklists with IRC/OSHA code references.', to: '/checklists' },
          ].map(s => (
            <Link key={s.title} to={s.to}
              className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-amber-50 transition-colors group">
              <div className="flex-shrink-0">{s.icon}</div>
              <div>
                <div className="font-medium text-slate-800 text-sm group-hover:text-amber-600">{s.title}</div>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

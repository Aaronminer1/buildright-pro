import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderOpen, Calculator, ClipboardCheck,
  BookOpen, ShieldAlert, Menu, X, HardHat,
  ChevronDown, ChevronRight,
  FileText, Receipt, Package, Settings,
} from 'lucide-react';

const calcSubLinks = [
  { to: '/calculators/concrete',    label: 'Concrete & Foundation', icon: '🏗️' },
  { to: '/calculators/framing',     label: 'Framing & Structure',    icon: '🔨' },
  { to: '/calculators/roofing',     label: 'Roofing',                icon: '🏠' },
  { to: '/calculators/stairs',      label: 'Stairs',                 icon: '📐' },
  { to: '/calculators/lumber',      label: 'Lumber & Board Feet',    icon: '🪵' },
  { to: '/calculators/masonry',     label: 'Masonry & Block',        icon: '🧱' },
  { to: '/calculators/interior',    label: 'Drywall & Paint',        icon: '🎨' },
  { to: '/calculators/flooring',    label: 'Flooring & Siding',      icon: '🏡' },
  { to: '/calculators/insulation',  label: 'Insulation & Energy',    icon: '🌡️' },
  { to: '/calculators/hvac',        label: 'HVAC Load',              icon: '❄️' },
  { to: '/calculators/cost',        label: 'Cost Estimator',         icon: '💰' },
  { to: '/calculators/hardware',    label: 'Hardware & Connectors',  icon: '🔩' },
  { to: '/calculators/electrical',  label: 'Electrical Rough-In',    icon: '⚡' },
  { to: '/calculators/plumbing',    label: 'Plumbing Rough-In',      icon: '🚿' },
  { to: '/calculators/tile',        label: 'Tile & Wet Areas',       icon: '🔳' },
];

const mainLinks = [
  { to: '/',          label: 'Dashboard',    icon: <LayoutDashboard size={18} /> },
  { to: '/projects',  label: 'Projects',     icon: <FolderOpen size={18} /> },
];

const businessLinks = [
  { to: '/quotes',   label: 'Quotes',   icon: <FileText size={18} /> },
  { to: '/invoices', label: 'Invoices', icon: <Receipt size={18} /> },
  { to: '/bom',      label: 'BOM',      icon: <Package size={18} /> },
  { to: '/settings', label: 'Settings', icon: <Settings size={18} /> },
];

const bottomLinks = [
  { to: '/checklists', label: 'Checklists',  icon: <ClipboardCheck size={18} /> },
  { to: '/reference',  label: 'Reference',   icon: <BookOpen size={18} /> },
  { to: '/safety',     label: 'Safety',      icon: <ShieldAlert size={18} /> },
];

function NavLink({ to, label, icon, onClick }: { to: string; label: string; icon: React.ReactNode; onClick?: () => void }) {
  const loc = useLocation();
  const active = loc.pathname === to || (to !== '/' && loc.pathname.startsWith(to) && !loc.pathname.startsWith('/calculators'));
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link ${active ? 'nav-link-active' : ''}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function CalcSubLink({ to, label, icon, onClick }: { to: string; label: string; icon: string; onClick?: () => void }) {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors
        ${active
          ? 'bg-amber-500 text-white'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
        }`}
    >
      <span className="text-base leading-none">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const loc = useLocation();
  const calcOpen = loc.pathname.startsWith('/calculators');
  const [calcExpanded, setCalcExpanded] = useState(calcOpen);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-700">
        <div className="bg-amber-500 p-2 rounded-xl">
          <HardHat size={22} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-white text-base leading-tight">BuildRight Pro</div>
          <div className="text-xs text-slate-400">Contractor Toolkit</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        <div className="section-badge">Main</div>
        {mainLinks.map(l => (
          <NavLink key={l.to} {...l} onClick={onClose} />
        ))}

        <div className="section-badge mt-2">Business</div>
        {businessLinks.map(l => (
          <NavLink key={l.to} {...l} onClick={onClose} />
        ))}

        <div className="section-badge mt-2">Tools</div>

        {/* Calculators expandable */}
        <button
          onClick={() => setCalcExpanded(e => !e)}
          className={`nav-link w-full justify-between ${calcExpanded ? 'text-white' : ''}`}
        >
          <span className="flex items-center gap-3">
            <Calculator size={18} />
            <span>Calculators</span>
          </span>
          {calcExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        {calcExpanded && (
          <div className="pl-3 space-y-0.5 mt-0.5">
            {calcSubLinks.map(l => (
              <CalcSubLink key={l.to} {...l} onClick={onClose} />
            ))}
          </div>
        )}

        {bottomLinks.map(l => (
          <NavLink key={l.to} {...l} onClick={onClose} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-500 text-center">
        BuildRight Pro v1.0 · All calcs client-side
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sidebar hidden lg:flex flex-col w-60 bg-slate-900 fixed inset-y-0 left-0 z-30">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900">
            <SidebarContent onClose={() => setOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}

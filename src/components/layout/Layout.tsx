import { useLocation, Outlet, Link } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Printer, ChevronLeft, Home } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/':                          'Dashboard',
  '/projects':                  'Projects',
  '/calculators':               'All Calculators',
  '/calculators/concrete':      'Concrete & Foundation',
  '/calculators/framing':       'Framing & Structure',
  '/calculators/roofing':       'Roofing',
  '/calculators/stairs':        'Stairs Calculator',
  '/calculators/lumber':        'Lumber & Board Feet',
  '/calculators/masonry':       'Masonry & Block',
  '/calculators/interior':      'Drywall & Paint',
  '/calculators/flooring':      'Flooring & Siding',
  '/calculators/insulation':    'Insulation & Energy',
  '/calculators/hvac':          'HVAC Load Calculator',
  '/calculators/cost':          'Cost Estimator',
  '/calculators/hardware':      'Hardware & Connectors',
  '/calculators/electrical':    'Electrical Rough-In',
  '/calculators/plumbing':      'Plumbing Rough-In',
  '/calculators/tile':          'Tile & Wet Areas',
  '/checklists':                'Inspection Checklists',
  '/reference':                 'Reference Materials',
  '/safety':                    'Safety Guidelines',
  '/quotes':                    'Quotes',
  '/invoices':                  'Invoices',
  '/bom':                       'Bill of Materials',
  '/settings':                  'Settings',
};

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/quotes/'))   return 'Quote Detail';
  if (pathname.startsWith('/invoices/')) return 'Invoice Detail';
  return PAGE_TITLES[pathname] ?? 'BuildRight Pro';
}

/** Returns { label, to } for the "back" crumb, or null on top-level pages. */
function getBackCrumb(pathname: string): { label: string; to: string } | null {
  if (pathname === '/' || pathname === '/projects' || pathname === '/checklists' ||
      pathname === '/reference' || pathname === '/safety' || pathname === '/quotes' ||
      pathname === '/invoices' || pathname === '/bom' || pathname === '/settings') {
    return { label: 'Dashboard', to: '/' };
  }
  if (pathname === '/calculators') {
    return { label: 'Dashboard', to: '/' };
  }
  if (pathname.startsWith('/calculators/')) {
    return { label: 'All Calculators', to: '/calculators' };
  }
  if (pathname.startsWith('/quotes/')) {
    return { label: 'Quotes', to: '/quotes' };
  }
  if (pathname.startsWith('/invoices/')) {
    return { label: 'Invoices', to: '/invoices' };
  }
  return null;
}

export function Layout() {
  const loc = useLocation();
  const title = getPageTitle(loc.pathname);
  const back = getBackCrumb(loc.pathname);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      {/* Main */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 no-print">
          <MobileSidebar />

          {/* Back / breadcrumb */}
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {back ? (
              <Link
                to={back.to}
                className="flex items-center gap-1 text-slate-400 hover:text-amber-600 transition-colors mr-1 shrink-0"
                title={`Back to ${back.label}`}
              >
                <ChevronLeft size={18} />
                <span className="text-xs font-medium hidden sm:inline">{back.label}</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="flex items-center gap-1 text-slate-400 hover:text-amber-600 transition-colors mr-1 shrink-0"
                title="Dashboard"
              >
                <Home size={16} />
              </Link>
            )}
            <h1 className="font-semibold text-slate-800 text-lg truncate">{title}</h1>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900
              border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
            title="Print this page"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

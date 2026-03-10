import { useLocation, Outlet } from 'react-router-dom';
import { Sidebar, MobileSidebar } from './Sidebar';
import { Printer } from 'lucide-react';

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/':                        'Dashboard',
    '/projects':                'Projects',
    '/calculators/concrete':    'Concrete & Foundation',
    '/calculators/framing':     'Framing & Structure',
    '/calculators/roofing':     'Roofing',
    '/calculators/stairs':      'Stairs Calculator',
    '/calculators/lumber':      'Lumber & Board Feet',
    '/calculators/masonry':     'Masonry & Block',
    '/calculators/interior':    'Drywall & Paint',
    '/calculators/flooring':    'Flooring & Siding',
    '/calculators/insulation':  'Insulation & Energy',
    '/calculators/hvac':        'HVAC Load Calculator',
    '/calculators/cost':        'Cost Estimator',
    '/checklists':              'Inspection Checklists',
    '/reference':               'Reference Materials',
    '/safety':                  'Safety Guidelines',
    '/quotes':                  'Quotes',
    '/invoices':                'Invoices',
    '/bom':                     'Bill of Materials',
    '/settings':                'Settings',
  };
  if (pathname.startsWith('/quotes/'))   return 'Quote Detail';
  if (pathname.startsWith('/invoices/')) return 'Invoice Detail';
  return map[pathname] ?? 'BuildRight Pro';
}

export function Layout() {
  const loc = useLocation();
  const title = getPageTitle(loc.pathname);

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      {/* Main */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 no-print">
          <MobileSidebar />
          <h1 className="font-semibold text-slate-800 text-lg flex-1">{title}</h1>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900
              border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
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

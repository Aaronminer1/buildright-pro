import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AppProvider } from './context/AppContext';
import { BusinessProvider } from './context/BusinessContext';
import { migrateFromLocalStorage } from './db/migrate';
import { PinLockScreen, usePinGate } from './components/PinLockScreen';
import { Layout } from './components/layout/Layout';

// Pages
import { Dashboard }        from './pages/Dashboard';
import { Projects }         from './pages/Projects';
import { Checklists }       from './pages/Checklists';
import { Reference }        from './pages/Reference';
import { Safety }           from './pages/Safety';

// Business pages
import { Settings }         from './pages/Settings';
import { Quotes }           from './pages/Quotes';
import { QuoteDetail }      from './pages/QuoteDetail';
import { Invoices }         from './pages/Invoices';
import { InvoiceDetail }    from './pages/InvoiceDetail';
import { BOMPage }          from './pages/BOM';

// Calculators
import { ConcreteFoundation } from './pages/calculators/ConcreteFoundation';
import { Framing }            from './pages/calculators/Framing';
import { Roofing }            from './pages/calculators/Roofing';
import { StairsCalc }         from './pages/calculators/Stairs';
import { LumberCalc }         from './pages/calculators/Lumber';
import { Masonry }            from './pages/calculators/Masonry';
import { Interior }           from './pages/calculators/Interior';
import { Flooring }           from './pages/calculators/Flooring';
import { Insulation }         from './pages/calculators/Insulation';
import { HVAC }               from './pages/calculators/HVAC';
import { CostEstimator }      from './pages/calculators/CostEstimator';
import { CalculatorsIndex }   from './pages/calculators/CalculatorsIndex';
import { Hardware }           from './pages/calculators/Hardware';
import { Electrical }         from './pages/calculators/Electrical';
import { Plumbing }           from './pages/calculators/Plumbing';
import { Tile }               from './pages/calculators/Tile';

function AppRoutes() {
  return (
    <BrowserRouter>
      <AppProvider>
        <BusinessProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="projects"    element={<Projects />} />
              <Route path="checklists"  element={<Checklists />} />
              <Route path="reference"   element={<Reference />} />
              <Route path="safety"      element={<Safety />} />

              {/* Business */}
              <Route path="quotes"           element={<Quotes />} />
              <Route path="quotes/:id"       element={<QuoteDetail />} />
              <Route path="invoices"         element={<Invoices />} />
              <Route path="invoices/:id"     element={<InvoiceDetail />} />
              <Route path="bom"              element={<BOMPage />} />
              <Route path="settings"         element={<Settings />} />

              {/* Calculators */}
              <Route path="calculators">
                <Route index element={<CalculatorsIndex />} />
                <Route path="concrete"    element={<ConcreteFoundation />} />
                <Route path="framing"     element={<Framing />} />
                <Route path="roofing"     element={<Roofing />} />
                <Route path="stairs"      element={<StairsCalc />} />
                <Route path="lumber"      element={<LumberCalc />} />
                <Route path="masonry"     element={<Masonry />} />
                <Route path="interior"    element={<Interior />} />
                <Route path="flooring"    element={<Flooring />} />
                <Route path="insulation"  element={<Insulation />} />
                <Route path="hvac"        element={<HVAC />} />
                <Route path="cost"        element={<CostEstimator />} />
                <Route path="hardware"    element={<Hardware />} />
                <Route path="electrical"  element={<Electrical />} />
                <Route path="plumbing"    element={<Plumbing />} />
                <Route path="tile"        element={<Tile />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BusinessProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

function AppShell() {
  const { locked, unlock } = usePinGate();

  if (locked === null) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (locked) {
    return <PinLockScreen onUnlocked={unlock} />;
  }

  return <AppRoutes />;
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    migrateFromLocalStorage().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading BuildRight Pro…</div>
      </div>
    );
  }

  return <AppShell />;
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { BusinessProvider } from './context/BusinessContext';
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
import { StairsCalc }           from './pages/calculators/Stairs';
import { LumberCalc }            from './pages/calculators/Lumber';
import { Masonry }            from './pages/calculators/Masonry';
import { Interior }           from './pages/calculators/Interior';
import { Flooring }           from './pages/calculators/Flooring';
import { Insulation }         from './pages/calculators/Insulation';
import { HVAC }               from './pages/calculators/HVAC';
import { CostEstimator }      from './pages/calculators/CostEstimator';
import { Hardware }           from './pages/calculators/Hardware';
import { Electrical }         from './pages/calculators/Electrical';
import { Plumbing }           from './pages/calculators/Plumbing';
import { Tile }               from './pages/calculators/Tile';

export default function App() {
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
                <Route index element={<Navigate to="/calculators/concrete" replace />} />
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

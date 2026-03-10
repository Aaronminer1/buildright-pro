# BuildRight Pro

> **The complete contractor toolkit** — estimating, quoting, invoicing, and material ordering in one client-side web app.

[![Deploy to GitHub Pages](https://github.com/Aaronminer1/buildright-pro/actions/workflows/deploy.yml/badge.svg)](https://github.com/Aaronminer1/buildright-pro/actions/workflows/deploy.yml)

## 🔗 Live Demo

**[https://aaronminer1.github.io/buildright-pro/](https://aaronminer1.github.io/buildright-pro/)**

No sign-up. No installation. Open it in any browser and start working. All data is stored locally in your browser.

---

## What's Inside

### 💼 Business Management
| Feature | Description |
|---------|-------------|
| **Quotes** | Create professional customer proposals with adjustable line-item pricing and markup (markup stays private). Track from Draft → Sent → Accepted → Invoiced. |
| **Invoices** | Convert accepted quotes to invoices or create standalone. Record payments (check, cash, ACH, card), track balances, mark as paid. |
| **Bill of Materials (BOM)** | Build material takeoff sheets with quantities, unit costs, and supplier names. Export to CSV or print as a supplier order sheet. |
| **Settings** | Manage your contractor profile, license info, default terms, and customer contacts. |

### 🧮 Calculators (11 total)
| Calculator | What It Does |
|------------|-------------|
| **Concrete & Foundation** | Slabs, footings, foundation walls — concrete volume in yards |
| **Framing & Structure** | Studs, plates, headers, floor joists, rafters |
| **Roofing** | Pitch factor, roof area, shingle squares, underlayment |
| **Stairs** | Riser/tread layout, stringer length, step count from rise |
| **Lumber & Board Feet** | Board foot calculator with standard lumber species pricing |
| **Masonry & Block** | CMU block count, mortar, grout, rebar quantities |
| **Drywall & Paint** | Sheet count, tape/mud, primer/paint gallons by room |
| **Flooring & Siding** | Tile, hardwood, vinyl, carpet, and lap/panel siding |
| **Insulation & Energy** | Batt, blown-in, spray foam by R-value and zone |
| **HVAC Load** | Manual J heat/cool load estimate from envelope inputs |
| **Cost Estimator** | Full project cost buildup from square footage and finish level |

### 📋 Tools
- **Inspection Checklists** — 8 phase-specific checklists (Pre-Construction through Final Inspection) with IRC/OSHA code references
- **Reference Tables** — Span tables, header sizing, nailing schedules, R-value guides, load tables
- **Safety Guidelines** — OSHA fall protection, excavation, scaffold setup requirements
- **Projects** — Track active jobs with address, phase, client, and square footage

### 📈 Live Material Pricing
The dashboard pulls real-time Producer Price Index (PPI) data from the [BLS Public API](https://api.bls.gov) for lumber, plywood, steel, cement, ready-mix concrete, and gypsum — so you can see year-over-year material cost trends before you price a job.

---

## Features Built With the Contractor in Mind

- **Markup stays private** — quote documents show the customer a unit price; your cost + markup % is never printed
- **Quote → Invoice workflow** — one click converts an accepted quote to an invoice with all line items copied
- **Payment recording** — log individual payments by method, auto-updates invoice status (Partial / Paid)
- **CSV export** — download any BOM as a spreadsheet for emailing to suppliers
- **Print-ready documents** — quotes, invoices, and BOM order sheets are all print-formatted
- **Offline-capable** — all calculations and business data live in `localStorage`; works without internet after first load
- **No account required** — nothing is sent to any server; your data stays on your machine

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Icons | Lucide React |
| Data | `localStorage` via custom `useLocalStorage` hook |
| Pricing API | BLS PPI Public API v2 (no key required) |
| Deployment | GitHub Pages via Actions |

---

## Running Locally

```bash
# 1. Clone
git clone https://github.com/Aaronminer1/buildright-pro.git
cd buildright-pro

# 2. Install
npm install

# 3. Start dev server
npm run dev
```

App runs at `http://localhost:5173/`

The BLS live pricing banner works in local dev via a Vite proxy (avoids CORS). In production on GitHub Pages, the banner will silently fall back — all calculators and business features work without it.

---

## Project Structure

```
src/
├── App.tsx                     # Routes + providers
├── components/
│   ├── layout/                 # Sidebar, Layout, header
│   └── ui/                     # Reusable components (Button, Card, PriceIndexBanner)
├── context/
│   ├── AppContext.tsx           # Projects + checklists state
│   └── BusinessContext.tsx     # Quotes, invoices, customers, BOMs
├── pages/
│   ├── Dashboard.tsx
│   ├── Quotes.tsx / QuoteDetail.tsx
│   ├── Invoices.tsx / InvoiceDetail.tsx
│   ├── BOM.tsx
│   ├── Settings.tsx
│   └── calculators/            # 11 individual calculator pages
├── services/
│   └── blsPricing.ts           # BLS API integration
├── types/
│   ├── business.ts             # Quote, Invoice, BOM, Customer types + helpers
│   └── index.ts                # App-wide types
└── data/
    └── referenceData.ts        # Span tables, checklists, reference values
```

---

## Deploying Your Own Copy

1. Fork this repo
2. In your fork's **Settings → Pages**, set source to **GitHub Actions**
3. Push any commit to `main` — the workflow builds and deploys automatically
4. Your app will be live at `https://<your-username>.github.io/buildright-pro/`

---

## Contributing / Roadmap

Ideas for future features:
- [ ] Photo/document attachments on quotes and projects
- [ ] Multi-user / team mode (Supabase backend)
- [ ] Material order tracking (sent/received status per BOM item)
- [ ] Xero / QuickBooks export for invoices
- [ ] Mobile PWA with offline sync

Pull requests welcome.

---

## License

MIT — free to use, fork, and modify.

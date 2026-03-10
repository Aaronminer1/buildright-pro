// ─── Contractor Profile ───────────────────────────────────────────────────────
export interface ContractorProfile {
  name: string;
  company: string;
  license: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  defaultPaymentTerms: string;
  defaultTaxPct: number;
  defaultValidDays: number;
}

export const DEFAULT_PROFILE: ContractorProfile = {
  name: '',
  company: '',
  license: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  website: '',
  defaultPaymentTerms:
    '50% deposit required before work begins. Balance due upon completion. ' +
    'Late payments subject to 1.5% monthly interest.',
  defaultTaxPct: 0,
  defaultValidDays: 30,
};

// ─── Customer ─────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  createdAt: string;
}

// ─── Line Items ───────────────────────────────────────────────────────────────
export interface LineItem {
  id: string;
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;   // base cost (your cost)
  markupPct: number;  // markup % on top of cost — not shown to customer
  notes: string;
}

export function calcLineTotal(item: LineItem): number {
  return Math.round(item.qty * item.unitCost * (1 + item.markupPct / 100) * 100) / 100;
}

export function calcSubtotal(items: LineItem[]): number {
  return Math.round(items.reduce((s, i) => s + calcLineTotal(i), 0) * 100) / 100;
}

export function fmt(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(s: string): string {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m) - 1]} ${parseInt(d)}, ${y}`;
}

export function addDays(dateStr: string, days: number): string {
  const dt = new Date(dateStr + 'T12:00:00');
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().split('T')[0];
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export const LINE_CATEGORIES = [
  'Site Work', 'Foundation', 'Framing', 'Roofing', 'Exterior',
  'Windows & Doors', 'Rough Plumbing', 'Rough Electrical', 'HVAC',
  'Insulation', 'Drywall', 'Flooring', 'Trim & Millwork',
  'Cabinets & Countertops', 'Interior Paint', 'Exterior Paint',
  'Finish Plumbing', 'Finish Electrical', 'Landscaping', 'Driveway',
  'Permits & Fees', 'Labor', 'Materials', 'Contingency', 'Other',
];

export const LINE_UNITS = ['LS', 'EA', 'SF', 'LF', 'SY', 'CY', 'BF', 'HR', 'DAY', 'SQ', 'TON', 'GAL'];

export function newLineItem(): LineItem {
  return {
    id: `item_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    category: 'Labor',
    description: '',
    qty: 1,
    unit: 'LS',
    unitCost: 0,
    markupPct: 0,
    notes: '',
  };
}

// ─── Quote ────────────────────────────────────────────────────────────────────
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export const QUOTE_STATUS_META: Record<QuoteStatus, { label: string; color: string }> = {
  draft:    { label: 'Draft',    color: 'bg-slate-100 text-slate-600' },
  sent:     { label: 'Sent',     color: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600' },
  expired:  { label: 'Expired',  color: 'bg-amber-100 text-amber-700' },
};

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  projectName: string;
  jobSiteAddress: string;
  dateCreated: string;
  validUntil: string;
  status: QuoteStatus;
  lineItems: LineItem[];
  taxPct: number;
  notes: string;           // shown on customer-facing quote
  terms: string;           // shown on customer-facing quote
  internalNotes: string;   // internal only, NOT printed
  linkedInvoiceId: string; // if converted to invoice
}

export function calcQuoteTotals(q: Quote) {
  const subtotal = calcSubtotal(q.lineItems);
  const tax      = Math.round(subtotal * (q.taxPct / 100) * 100) / 100;
  const total    = subtotal + tax;
  return { subtotal, tax, total };
}

// ─── Invoice ──────────────────────────────────────────────────────────────────
export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';

export const INVOICE_STATUS_META: Record<InvoiceStatus, { label: string; color: string }> = {
  draft:   { label: 'Draft',   color: 'bg-slate-100 text-slate-600' },
  sent:    { label: 'Sent',    color: 'bg-blue-100 text-blue-700' },
  partial: { label: 'Partial', color: 'bg-amber-100 text-amber-700' },
  paid:    { label: 'Paid',    color: 'bg-green-100 text-green-700' },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-600' },
};

export type PaymentMethod = 'check' | 'cash' | 'ach' | 'card' | 'other';

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  notes: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  quoteId: string;        // if created from quote
  customerId: string;
  projectName: string;
  jobSiteAddress: string;
  dateIssued: string;
  dateDue: string;
  status: InvoiceStatus;
  lineItems: LineItem[];
  taxPct: number;
  payments: Payment[];
  notes: string;
  terms: string;
}

export function calcInvoiceTotals(inv: Invoice) {
  const subtotal    = calcSubtotal(inv.lineItems);
  const tax         = Math.round(subtotal * (inv.taxPct / 100) * 100) / 100;
  const total       = subtotal + tax;
  const amountPaid  = Math.round(inv.payments.reduce((s, p) => s + p.amount, 0) * 100) / 100;
  const balance     = Math.round((total - amountPaid) * 100) / 100;
  return { subtotal, tax, total, amountPaid, balance };
}

// ─── BOM ──────────────────────────────────────────────────────────────────────
export interface BOMItem {
  id: string;
  category: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  supplier: string;
  notes: string;
}

export interface BOM {
  id: string;
  name: string;
  projectId: string;
  dateCreated: string;
  items: BOMItem[];
  notes: string;
}

export function calcBOMTotal(bom: BOM): number {
  return Math.round(bom.items.reduce((s, i) => s + i.qty * i.unitCost, 0) * 100) / 100;
}

export function newBOMItem(): BOMItem {
  return {
    id: `bom_${Date.now()}_${Math.floor(Math.random() * 9999)}`,
    category: 'Materials',
    description: '',
    qty: 0,
    unit: 'EA',
    unitCost: 0,
    supplier: '',
    notes: '',
  };
}

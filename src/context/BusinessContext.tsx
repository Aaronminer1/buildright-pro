import React, { createContext, useContext } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type {
  ContractorProfile, Customer, Quote, Invoice, Payment, BOM,
} from '../types/business';
import { DEFAULT_PROFILE, addDays, todayStr } from '../types/business';

interface BusinessContextType {
  contractor: ContractorProfile;
  updateContractor: (updates: Partial<ContractorProfile>) => void;

  customers: Customer[];
  addCustomer: (c: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  quotes: Quote[];
  addQuote: (q: Omit<Quote, 'id' | 'quoteNumber'>) => Quote;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  deleteQuote: (id: string) => void;

  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  addPayment: (invoiceId: string, p: Omit<Payment, 'id'>) => void;
  deletePayment: (invoiceId: string, paymentId: string) => void;

  boms: BOM[];
  addBOM: (b: Omit<BOM, 'id' | 'dateCreated'>) => BOM;
  updateBOM: (id: string, updates: Partial<BOM>) => void;
  deleteBOM: (id: string) => void;
}

const BusinessContext = createContext<BusinessContextType | null>(null);

function nextNumber(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;
  const count = existing.filter(n => n.startsWith(key)).length + 1;
  return `${key}-${String(count).padStart(3, '0')}`;
}

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const contractorRow = useLiveQuery(() => db.settings.get('contractor'), []);
  const contractor = (contractorRow?.value as ContractorProfile) ?? DEFAULT_PROFILE;

  const customers = useLiveQuery(() => db.customers.orderBy('createdAt').toArray(), []) ?? [];
  const quotes    = useLiveQuery(() => db.quotes.orderBy('dateCreated').toArray(), []) ?? [];
  const invoices  = useLiveQuery(() => db.invoices.orderBy('dateIssued').toArray(), []) ?? [];
  const boms      = useLiveQuery(() => db.boms.orderBy('dateCreated').toArray(), []) ?? [];

  const updateContractor = (updates: Partial<ContractorProfile>) => {
    db.settings.put({ key: 'contractor', value: { ...contractor, ...updates } });
  };

  // ─── Customers ───────────────────────────────────────────────────────────
  const addCustomer = (c: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customer: Customer = { ...c, id: `cust_${Date.now()}`, createdAt: todayStr() };
    db.customers.add(customer);
    return customer;
  };
  const updateCustomer = (id: string, updates: Partial<Customer>) =>
    db.customers.update(id, updates);
  const deleteCustomer = (id: string) =>
    db.customers.delete(id);

  // ─── Quotes ──────────────────────────────────────────────────────────────
  const addQuote = (q: Omit<Quote, 'id' | 'quoteNumber'>): Quote => {
    const today = todayStr();
    const quote: Quote = {
      ...q,
      id: `quote_${Date.now()}`,
      quoteNumber: nextNumber('Q', quotes.map(x => x.quoteNumber)),
      dateCreated: today,
      validUntil: q.validUntil || addDays(today, contractor.defaultValidDays || 30),
    };
    db.quotes.add(quote);
    return quote;
  };
  const updateQuote = (id: string, updates: Partial<Quote>) =>
    db.quotes.update(id, updates);
  const deleteQuote = (id: string) =>
    db.quotes.delete(id);

  // ─── Invoices ────────────────────────────────────────────────────────────
  const addInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const today = todayStr();
    const invoice: Invoice = {
      ...inv,
      id: `inv_${Date.now()}`,
      invoiceNumber: nextNumber('INV', invoices.map(x => x.invoiceNumber)),
      dateIssued: today,
      dateDue: inv.dateDue || addDays(today, 30),
    };
    db.invoices.add(invoice);
    return invoice;
  };
  const updateInvoice = (id: string, updates: Partial<Invoice>) =>
    db.invoices.update(id, updates);
  const deleteInvoice = (id: string) =>
    db.invoices.delete(id);

  const addPayment = (invoiceId: string, p: Omit<Payment, 'id'>) => {
    const payment: Payment = { ...p, id: `pay_${Date.now()}` };
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    const payments = [...inv.payments, payment];
    const paid = payments.reduce((s, x) => s + x.amount, 0);
    const sub  = inv.lineItems.reduce((s, item) =>
      s + item.qty * item.unitCost * (1 + item.markupPct / 100), 0);
    const total = sub + sub * (inv.taxPct / 100);
    const status: Invoice['status'] =
      paid <= 0 ? inv.status : paid >= total ? 'paid' : 'partial';
    db.invoices.update(invoiceId, { payments, status });
  };

  const deletePayment = (invoiceId: string, paymentId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;
    const payments = inv.payments.filter(p => p.id !== paymentId);
    const paid = payments.reduce((s, p) => s + p.amount, 0);
    const sub  = inv.lineItems.reduce((s, item) =>
      s + item.qty * item.unitCost * (1 + item.markupPct / 100), 0);
    const total = sub + sub * (inv.taxPct / 100);
    const status: Invoice['status'] =
      paid <= 0 ? 'sent' : paid >= total ? 'paid' : 'partial';
    db.invoices.update(invoiceId, { payments, status });
  };

  // ─── BOMs ────────────────────────────────────────────────────────────────
  const addBOM = (b: Omit<BOM, 'id' | 'dateCreated'>): BOM => {
    const bom: BOM = { ...b, id: `bom_${Date.now()}`, dateCreated: todayStr() };
    db.boms.add(bom);
    return bom;
  };
  const updateBOM = (id: string, updates: Partial<BOM>) =>
    db.boms.update(id, updates);
  const deleteBOM = (id: string) =>
    db.boms.delete(id);

  return (
    <BusinessContext.Provider value={{
      contractor, updateContractor,
      customers, addCustomer, updateCustomer, deleteCustomer,
      quotes, addQuote, updateQuote, deleteQuote,
      invoices, addInvoice, updateInvoice, deleteInvoice,
      addPayment, deletePayment,
      boms, addBOM, updateBOM, deleteBOM,
    }}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const ctx = useContext(BusinessContext);
  if (!ctx) throw new Error('useBusiness must be used within BusinessProvider');
  return ctx;
}

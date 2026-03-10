import React, { createContext, useContext } from 'react';
import type {
  ContractorProfile, Customer, Quote, Invoice, Payment, BOM,
} from '../types/business';
import { DEFAULT_PROFILE, addDays, todayStr } from '../types/business';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  const [contractor, setContractor] = useLocalStorage<ContractorProfile>('brp_contractor', DEFAULT_PROFILE);
  const [customers, setCustomers]   = useLocalStorage<Customer[]>('brp_customers', []);
  const [quotes, setQuotes]         = useLocalStorage<Quote[]>('brp_quotes', []);
  const [invoices, setInvoices]     = useLocalStorage<Invoice[]>('brp_invoices', []);
  const [boms, setBoms]             = useLocalStorage<BOM[]>('brp_boms', []);

  const updateContractor = (updates: Partial<ContractorProfile>) =>
    setContractor(prev => ({ ...prev, ...updates }));

  // ─── Customers ───────────────────────────────────────────────────────────
  const addCustomer = (c: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const customer: Customer = { ...c, id: `cust_${Date.now()}`, createdAt: todayStr() };
    setCustomers(prev => [...prev, customer]);
    return customer;
  };
  const updateCustomer = (id: string, updates: Partial<Customer>) =>
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  const deleteCustomer = (id: string) =>
    setCustomers(prev => prev.filter(c => c.id !== id));

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
    setQuotes(prev => [...prev, quote]);
    return quote;
  };
  const updateQuote = (id: string, updates: Partial<Quote>) =>
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  const deleteQuote = (id: string) =>
    setQuotes(prev => prev.filter(q => q.id !== id));

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
    setInvoices(prev => [...prev, invoice]);
    return invoice;
  };
  const updateInvoice = (id: string, updates: Partial<Invoice>) =>
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  const deleteInvoice = (id: string) =>
    setInvoices(prev => prev.filter(i => i.id !== id));

  const addPayment = (invoiceId: string, p: Omit<Payment, 'id'>) => {
    const payment: Payment = { ...p, id: `pay_${Date.now()}` };
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const payments = [...inv.payments, payment];
      const paid = payments.reduce((s, x) => s + x.amount, 0);
      const { total } = (() => {
        const sub = inv.lineItems.reduce((s, item) =>
          s + item.qty * item.unitCost * (1 + item.markupPct / 100), 0);
        const tax = sub * (inv.taxPct / 100);
        return { total: sub + tax };
      })();
      const status: Invoice['status'] =
        paid <= 0 ? inv.status :
        paid >= total ? 'paid' : 'partial';
      return { ...inv, payments, status };
    }));
  };

  const deletePayment = (invoiceId: string, paymentId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;
      const payments = inv.payments.filter(p => p.id !== paymentId);
      const paid = payments.reduce((s, p) => s + p.amount, 0);
      const sub = inv.lineItems.reduce((s, item) =>
        s + item.qty * item.unitCost * (1 + item.markupPct / 100), 0);
      const total = sub + sub * (inv.taxPct / 100);
      const status: Invoice['status'] =
        paid <= 0 ? 'sent' : paid >= total ? 'paid' : 'partial';
      return { ...inv, payments, status };
    }));
  };

  // ─── BOMs ────────────────────────────────────────────────────────────────
  const addBOM = (b: Omit<BOM, 'id' | 'dateCreated'>): BOM => {
    const bom: BOM = { ...b, id: `bom_${Date.now()}`, dateCreated: todayStr() };
    setBoms(prev => [...prev, bom]);
    return bom;
  };
  const updateBOM = (id: string, updates: Partial<BOM>) =>
    setBoms(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  const deleteBOM = (id: string) =>
    setBoms(prev => prev.filter(b => b.id !== id));

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

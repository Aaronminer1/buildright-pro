import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Printer, Save, ArrowLeft, ChevronDown, CreditCard } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import type { Invoice, LineItem, InvoiceStatus, Payment, PaymentMethod } from '../types/business';
import {
  calcLineTotal, calcInvoiceTotals, fmt, fmtDate, addDays, todayStr,
  INVOICE_STATUS_META, LINE_CATEGORIES, LINE_UNITS, newLineItem,
} from '../types/business';

const STATUS_FLOW: InvoiceStatus[] = ['draft', 'sent', 'partial', 'paid', 'overdue'];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'check', label: 'Check' },
  { value: 'cash',  label: 'Cash'  },
  { value: 'ach',   label: 'ACH / Bank Transfer' },
  { value: 'card',  label: 'Credit / Debit Card' },
  { value: 'other', label: 'Other' },
];

function blankInvoice(terms: string, taxPct: number): Omit<Invoice, 'id' | 'invoiceNumber'> {
  const today = todayStr();
  return {
    quoteId: '', customerId: '', projectName: '', jobSiteAddress: '',
    dateIssued: today, dateDue: addDays(today, 30), status: 'draft',
    lineItems: [], taxPct, payments: [], notes: '', terms,
  };
}

function LineRow({ item, onChange, onRemove }: {
  item: LineItem; onChange: (f: keyof LineItem, v: string | number) => void; onRemove: () => void;
}) {
  const total = calcLineTotal(item);
  return (
    <tr className="border-b border-slate-100 group">
      <td className="py-1.5 px-1">
        <select value={item.category} onChange={e => onChange('category', e.target.value)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white">
          {LINE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="py-1.5 px-1">
        <input type="text" value={item.description} placeholder="Description"
          onChange={e => onChange('description', e.target.value)}
          className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1 w-16">
        <input type="number" min={0} value={item.qty} onChange={e => onChange('qty', parseFloat(e.target.value) || 0)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1 w-20">
        <input list="inv-units" value={item.unit} onChange={e => onChange('unit', e.target.value)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
        <datalist id="inv-units">{LINE_UNITS.map(u => <option key={u} value={u} />)}</datalist>
      </td>
      <td className="py-1.5 px-1 w-28">
        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
          <span className="px-1.5 py-1 text-xs text-slate-400 bg-slate-50 border-r border-slate-200">$</span>
          <input type="number" min={0} step={0.01} value={item.unitCost}
            onChange={e => onChange('unitCost', parseFloat(e.target.value) || 0)}
            className="w-full px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
        </div>
      </td>
      <td className="py-1.5 px-1 w-20">
        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
          <input type="number" min={0} max={200} step={0.5} value={item.markupPct}
            onChange={e => onChange('markupPct', parseFloat(e.target.value) || 0)}
            className="w-full px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
          <span className="px-1.5 py-1 text-xs text-slate-400 bg-slate-50 border-l border-slate-200">%</span>
        </div>
      </td>
      <td className="py-1.5 px-2 text-right text-sm font-medium text-slate-800">{fmt(total)}</td>
      <td className="py-1.5 px-1 w-8">
        <button onClick={onRemove} className="p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100">
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

// ─── Print Document ───────────────────────────────────────────────────────────
function PrintDoc({ invoice, customer, contractor }: {
  invoice: Invoice;
  customer: ReturnType<typeof useBusiness>['customers'][0] | undefined;
  contractor: ReturnType<typeof useBusiness>['contractor'];
}) {
  const { subtotal, tax, total, amountPaid, balance } = calcInvoiceTotals(invoice);
  return (
    <div className="hidden print:block bg-white p-10 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-2xl font-bold text-slate-900">{contractor.company || 'Your Company'}</div>
          {contractor.name && <div className="text-slate-600">{contractor.name}</div>}
          {contractor.address && <div className="text-slate-600">{contractor.address}</div>}
          {[contractor.city, contractor.state, contractor.zip].filter(Boolean).join(', ') && (
            <div className="text-slate-600">{[contractor.city, contractor.state, contractor.zip].filter(Boolean).join(', ')}</div>
          )}
          {contractor.phone && <div className="text-slate-600">{contractor.phone}</div>}
          {contractor.email && <div className="text-slate-600">{contractor.email}</div>}
          {contractor.license && <div className="text-slate-600">Lic # {contractor.license}</div>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-amber-600 uppercase tracking-widest">Invoice</div>
          <div className="mt-2 text-slate-700"><span className="font-semibold">Invoice #:</span> {invoice.invoiceNumber}</div>
          <div className="text-slate-700"><span className="font-semibold">Date Issued:</span> {fmtDate(invoice.dateIssued)}</div>
          <div className="text-slate-700"><span className="font-semibold">Due Date:</span> {fmtDate(invoice.dateDue)}</div>
          {invoice.quoteId && <div className="text-slate-500 text-xs mt-1">Ref: Quote associated</div>}
        </div>
      </div>

      <div className="flex gap-10 mb-8">
        <div className="flex-1">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Bill To</div>
          {customer ? (
            <>
              <div className="font-semibold text-slate-800">{customer.name}</div>
              {customer.company && <div className="text-slate-600">{customer.company}</div>}
              {customer.address && <div className="text-slate-600">{customer.address}</div>}
              {[customer.city, customer.state, customer.zip].filter(Boolean).join(', ') && (
                <div className="text-slate-600">{[customer.city, customer.state, customer.zip].filter(Boolean).join(', ')}</div>
              )}
              {customer.phone && <div className="text-slate-600">{customer.phone}</div>}
              {customer.email && <div className="text-slate-600">{customer.email}</div>}
            </>
          ) : <div className="text-slate-400 italic">No customer</div>}
        </div>
        {invoice.jobSiteAddress && (
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Job Site</div>
            <div className="text-slate-700 whitespace-pre-line">{invoice.jobSiteAddress}</div>
          </div>
        )}
      </div>

      {invoice.projectName && (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded px-4 py-2">
          <span className="font-semibold text-slate-700">Project: </span>{invoice.projectName}
        </div>
      )}

      <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0' }}>
            {['Description', 'Qty', 'Unit', 'Unit Price', 'Total'].map(h => (
              <th key={h} style={{ paddingLeft: h === 'Description' ? 0 : '8px', paddingRight: h === 'Total' ? 0 : '8px' }}
                className={`py-2 text-xs font-bold uppercase tracking-wide text-slate-600 ${
                  ['Total','Unit Price','Qty'].includes(h) ? 'text-right' : 'text-left'
                }`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map(item => {
            const lt = calcLineTotal(item);
            const up = item.qty > 0 ? lt / item.qty : 0;
            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-2 text-slate-800">
                  {item.category && <span className="text-xs text-slate-400 mr-1">[{item.category}]</span>}
                  {item.description}
                </td>
                <td className="py-2 text-right text-slate-700" style={{ paddingLeft: '8px' }}>{item.qty}</td>
                <td className="py-2 text-right text-slate-700" style={{ paddingLeft: '8px' }}>{item.unit}</td>
                <td className="py-2 text-right text-slate-700" style={{ paddingLeft: '8px' }}>{fmt(up)}</td>
                <td className="py-2 text-right font-medium text-slate-800">{fmt(lt)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '1px solid #e2e8f0' }}>
            <td colSpan={4} className="py-2 text-right text-slate-600">Subtotal</td>
            <td className="py-2 text-right font-medium text-slate-800">{fmt(subtotal)}</td>
          </tr>
          {invoice.taxPct > 0 && (
            <tr>
              <td colSpan={4} className="py-1 text-right text-slate-600">Tax ({invoice.taxPct}%)</td>
              <td className="py-1 text-right text-slate-800">{fmt(tax)}</td>
            </tr>
          )}
          <tr style={{ borderTop: '2px solid #1e293b' }}>
            <td colSpan={4} className="py-2 text-right font-bold text-slate-900 text-base">TOTAL</td>
            <td className="py-2 text-right font-bold text-slate-900 text-base">{fmt(total)}</td>
          </tr>
          {amountPaid > 0 && (
            <>
              <tr>
                <td colSpan={4} className="py-1 text-right text-green-700">Payments Received</td>
                <td className="py-1 text-right text-green-700">({fmt(amountPaid)})</td>
              </tr>
              <tr style={{ borderTop: '2px solid #dc2626' }}>
                <td colSpan={4} className="py-2 text-right font-bold text-red-700 text-base">BALANCE DUE</td>
                <td className="py-2 text-right font-bold text-red-700 text-base">{fmt(balance)}</td>
              </tr>
            </>
          )}
        </tfoot>
      </table>

      {invoice.payments.length > 0 && (
        <div className="mb-5">
          <div className="font-semibold text-slate-700 mb-2">Payment History</div>
          <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                {['Date', 'Method', 'Reference', 'Amount'].map(h => (
                  <th key={h} className={`py-1 text-slate-500 font-medium ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoice.payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td className="py-1 text-slate-600">{fmtDate(p.date)}</td>
                  <td className="py-1 text-slate-600 capitalize">{p.method}</td>
                  <td className="py-1 text-slate-500">{p.reference || '—'}</td>
                  <td className="py-1 text-right font-medium text-green-700">{fmt(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoice.notes && <div className="mb-4"><div className="font-semibold text-slate-700 mb-1">Notes</div><div className="text-slate-600 whitespace-pre-line">{invoice.notes}</div></div>}
      {invoice.terms && <div className="mb-4"><div className="font-semibold text-slate-700 mb-1">Terms</div><div className="text-slate-600 text-xs whitespace-pre-line">{invoice.terms}</div></div>}

      <div className="mt-8 text-center text-slate-500 text-xs border-t border-slate-200 pt-4">
        Thank you for your business! · {contractor.phone || contractor.email || contractor.website || ''}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contractor, customers, invoices, addInvoice, updateInvoice, addPayment, deletePayment } = useBusiness();

  const isNew   = id === 'new';
  const existing = isNew ? undefined : invoices.find(i => i.id === id);

  const [invoice, setInvoice] = useState<Omit<Invoice, 'id' | 'invoiceNumber'>>(() =>
    existing ?? blankInvoice(contractor.defaultPaymentTerms, contractor.defaultTaxPct)
  );
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState<Omit<Payment, 'id'>>({
    date: todayStr(), amount: 0, method: 'check', reference: '', notes: '',
  });

  useEffect(() => {
    if (existing) setInvoice(existing);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof typeof invoice>(field: K, value: typeof invoice[K]) =>
    setInvoice(prev => ({ ...prev, [field]: value }));

  const updateItem = (itemId: string, field: keyof LineItem, value: string | number) =>
    setInvoice(prev => ({
      ...prev, lineItems: prev.lineItems.map(i => i.id === itemId ? { ...i, [field]: value } : i),
    }));

  const addItem = () => setInvoice(prev => ({ ...prev, lineItems: [...prev.lineItems, newLineItem()] }));
  const removeItem = (itemId: string) =>
    setInvoice(prev => ({ ...prev, lineItems: prev.lineItems.filter(i => i.id !== itemId) }));

  const handleSave = () => {
    if (isNew) {
      const saved = addInvoice(invoice);
      navigate(`/invoices/${saved.id}`, { replace: true });
    } else if (existing) {
      updateInvoice(existing.id, invoice);
    }
  };

  const handleAddPayment = () => {
    if (!existing || payForm.amount <= 0) return;
    addPayment(existing.id, payForm);
    setPayForm({ date: todayStr(), amount: 0, method: 'check', reference: '', notes: '' });
    setShowPayForm(false);
    // Sync local state with updated invoice
    const updated = invoices.find(i => i.id === existing.id);
    if (updated) setInvoice(updated);
  };

  const fullInvoice: Invoice = existing
    ? { ...invoice, id: existing.id, invoiceNumber: existing.invoiceNumber, payments: existing.payments }
    : { ...invoice, id: '', invoiceNumber: '', payments: [] };

  const { subtotal, tax, total, amountPaid, balance } = calcInvoiceTotals(fullInvoice);
  const customer = customers.find(c => c.id === invoice.customerId);

  return (
    <div className="space-y-4 max-w-7xl">
      {existing && <PrintDoc invoice={fullInvoice} customer={customer} contractor={contractor} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Link to="/invoices" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm">
          <ArrowLeft size={15} /> Invoices
        </Link>
        <span className="text-slate-300">|</span>
        {existing && <span className="text-slate-500 text-sm font-medium">{existing.invoiceNumber}</span>}

        {existing && (
          <div className="relative ml-auto flex-shrink-0">
            <button onClick={() => setStatusMenuOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${INVOICE_STATUS_META[invoice.status].color}`}>
              {INVOICE_STATUS_META[invoice.status].label} <ChevronDown size={12} />
            </button>
            {statusMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10 min-w-[140px]">
                {STATUS_FLOW.map(s => (
                  <button key={s} onClick={() => { set('status', s); setStatusMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_META[s].color}`}>
                      {INVOICE_STATUS_META[s].label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
          <Save size={15} /> Save
        </button>
        {existing && (
          <button onClick={() => setShowPayForm(o => !o)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            <CreditCard size={15} /> Record Payment
          </button>
        )}
        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
          <Printer size={15} /> Print Invoice
        </button>
      </div>

      {/* Record Payment Form */}
      {showPayForm && existing && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 print:hidden">
          <h3 className="font-semibold text-green-800 text-sm mb-3">Record Payment · Balance Due: <span className="text-red-600">{fmt(balance)}</span></h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
              <input type="date" value={payForm.date} onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
              <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
                <span className="px-2 py-2 text-sm text-slate-400 bg-slate-50 border-r border-slate-300">$</span>
                <input type="number" min={0} step={0.01} value={payForm.amount}
                  onChange={e => setPayForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method</label>
              <select value={payForm.method} onChange={e => setPayForm(p => ({ ...p, method: e.target.value as PaymentMethod }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Reference (check #, etc.)</label>
              <input type="text" value={payForm.reference} placeholder="Check #1234"
                onChange={e => setPayForm(p => ({ ...p, reference: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAddPayment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
              Add Payment
            </button>
            <button onClick={() => setShowPayForm(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Payment history (if any) */}
      {existing && existing.payments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 print:hidden">
          <h3 className="font-semibold text-slate-800 text-sm mb-3">Payment History</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {['Date', 'Method', 'Reference', 'Notes', 'Amount', ''].map(h => (
                  <th key={h} className={`px-2 py-1.5 text-xs font-medium text-slate-500 ${h === 'Amount' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {existing.payments.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-2 py-2 text-slate-600">{fmtDate(p.date)}</td>
                  <td className="px-2 py-2 text-slate-600 capitalize">{p.method}</td>
                  <td className="px-2 py-2 text-slate-500">{p.reference || '—'}</td>
                  <td className="px-2 py-2 text-slate-400 text-xs">{p.notes || '—'}</td>
                  <td className="px-2 py-2 text-right font-semibold text-green-700">{fmt(p.amount)}</td>
                  <td className="px-2 py-2 text-right">
                    <button onClick={() => deletePayment(existing.id, p.id)}
                      className="text-slate-300 hover:text-red-400 p-1"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50">
                <td colSpan={4} className="px-2 py-2 text-right text-xs font-medium text-slate-500">Total Paid</td>
                <td className="px-2 py-2 text-right font-bold text-green-700">{fmt(amountPaid)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Main form grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">

        {/* Left col */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Customer</h3>
            <select value={invoice.customerId} onChange={e => set('customerId', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">— Select a customer —</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ''}</option>)}
            </select>
            {customer && (
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 space-y-0.5">
                {customer.company && <div>{customer.company}</div>}
                {customer.address && <div>{customer.address}</div>}
                {[customer.city, customer.state].filter(Boolean).join(', ') && (
                  <div>{[customer.city, customer.state].filter(Boolean).join(', ')}</div>
                )}
                {customer.phone && <div>{customer.phone}</div>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Project &amp; Dates</h3>
            {[
              { label: 'Project Name', field: 'projectName' as const },
              { label: 'Job Site Address', field: 'jobSiteAddress' as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type="text" value={invoice[field]} onChange={e => set(field, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Date Issued', field: 'dateIssued' as const },
                { label: 'Due Date', field: 'dateDue' as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                  <input type="date" value={invoice[field]} onChange={e => set(field, e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <h3 className="font-semibold text-slate-800 text-sm">Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span></div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Tax</span>
                  <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                    <input type="number" min={0} max={30} step={0.1} value={invoice.taxPct}
                      onChange={e => set('taxPct', parseFloat(e.target.value) || 0)}
                      className="w-12 px-1 py-0.5 text-xs text-right focus:outline-none" />
                    <span className="px-1 text-xs text-slate-400 bg-slate-50 border-l border-slate-200">%</span>
                  </div>
                </div>
                <span className="font-medium">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-200">
                <span>TOTAL</span><span>{fmt(total)}</span>
              </div>
              {amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Paid</span><span className="font-medium">({fmt(amountPaid)})</span>
                  </div>
                  <div className={`flex justify-between font-bold text-lg pt-1 border-t-2 border-slate-200 ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    <span>Balance</span><span>{balance <= 0 ? 'PAID ✓' : fmt(balance)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right col: Line Items + Notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Line Items</h3>
              <button onClick={addItem} className="flex items-center gap-1 text-amber-500 hover:text-amber-600 text-xs font-medium">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-1 py-2 text-left text-slate-500 w-28">Category</th>
                    <th className="px-1 py-2 text-left text-slate-500">Description</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-16">Qty</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-20">Unit</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-28">Your Cost</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-20">Markup</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-28">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.length === 0 ? (
                    <tr><td colSpan={8} className="py-8 text-center text-slate-400">
                      No items. <button onClick={addItem} className="text-amber-500 hover:underline">Add first item →</button>
                    </td></tr>
                  ) : invoice.lineItems.map(item => (
                    <LineRow key={item.id} item={item}
                      onChange={(f, v) => updateItem(item.id, f, v)}
                      onRemove={() => removeItem(item.id)} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Notes &amp; Terms</h3>
            {[
              { label: 'Customer Notes (printed)', field: 'notes' as const },
              { label: 'Terms & Conditions (printed)', field: 'terms' as const },
            ].map(({ label, field }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <textarea rows={3} value={invoice[field]} onChange={e => set(field, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

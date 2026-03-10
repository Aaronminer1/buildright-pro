import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Printer, Save, ArrowLeft, FileCheck, ChevronDown } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import type { Quote, LineItem, QuoteStatus } from '../types/business';
import {
  calcLineTotal, calcQuoteTotals, fmt, fmtDate, addDays, todayStr,
  QUOTE_STATUS_META, LINE_CATEGORIES, LINE_UNITS, newLineItem,
} from '../types/business';

const STATUS_FLOW: QuoteStatus[] = ['draft', 'sent', 'accepted', 'rejected', 'expired'];

function blankQuote(terms: string, taxPct: number, validDays: number): Omit<Quote, 'id' | 'quoteNumber'> {
  const today = todayStr();
  return {
    customerId: '', projectName: '', jobSiteAddress: '', dateCreated: today,
    validUntil: addDays(today, validDays), status: 'draft', lineItems: [],
    taxPct, notes: '', terms, internalNotes: '', linkedInvoiceId: '',
  };
}

function LineRow({ item, onChange, onRemove }: {
  item: LineItem;
  onChange: (field: keyof LineItem, value: string | number) => void;
  onRemove: () => void;
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
        <input type="text" value={item.description} placeholder="Description of work / material"
          onChange={e => onChange('description', e.target.value)}
          className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1 w-16">
        <input type="number" min={0} value={item.qty} onChange={e => onChange('qty', parseFloat(e.target.value) || 0)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1 w-20">
        <input list="units-list" value={item.unit} onChange={e => onChange('unit', e.target.value)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
        <datalist id="units-list">{LINE_UNITS.map(u => <option key={u} value={u} />)}</datalist>
      </td>
      <td className="py-1.5 px-1 w-28">
        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
          <span className="px-1.5 py-1 text-xs text-slate-400 bg-slate-50 border-r border-slate-200">$</span>
          <input type="number" min={0} step={0.01} value={item.unitCost}
            onChange={e => onChange('unitCost', parseFloat(e.target.value) || 0)}
            className="w-full px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
        </div>
      </td>
      <td className="py-1.5 px-1 w-20" title="Your markup % — not shown on customer quote">
        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
          <input type="number" min={0} max={200} step={0.5} value={item.markupPct}
            onChange={e => onChange('markupPct', parseFloat(e.target.value) || 0)}
            className="w-full px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
          <span className="px-1.5 py-1 text-xs text-slate-400 bg-slate-50 border-l border-slate-200">%</span>
        </div>
      </td>
      <td className="py-1.5 px-2 text-right text-sm font-medium text-slate-800 tabular-nums">
        {fmt(total)}
      </td>
      <td className="py-1.5 px-1 w-8">
        <button onClick={onRemove} className="p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

// ─── Print Document ───────────────────────────────────────────────────────────
function PrintDoc({ quote, customer, contractor }: {
  quote: Quote;
  customer: ReturnType<typeof useBusiness>['customers'][0] | undefined;
  contractor: ReturnType<typeof useBusiness>['contractor'];
}) {
  const { subtotal, tax, total } = calcQuoteTotals(quote);
  return (
    <div className="hidden print:block bg-white p-10 text-sm font-sans" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
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
          <div className="text-3xl font-bold text-amber-600 uppercase tracking-widest">Quote</div>
          <div className="mt-2 text-slate-700"><span className="font-semibold">Quote #:</span> {quote.quoteNumber}</div>
          <div className="text-slate-700"><span className="font-semibold">Date:</span> {fmtDate(quote.dateCreated)}</div>
          <div className="text-slate-700"><span className="font-semibold">Valid Until:</span> {fmtDate(quote.validUntil)}</div>
        </div>
      </div>

      {/* Bill To / Job Site */}
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
          ) : <div className="text-slate-400 italic">No customer selected</div>}
        </div>
        {quote.jobSiteAddress && (
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Job Site</div>
            <div className="text-slate-700 whitespace-pre-line">{quote.jobSiteAddress}</div>
          </div>
        )}
      </div>

      {quote.projectName && (
        <div className="mb-6 bg-slate-50 border border-slate-200 rounded px-4 py-2">
          <span className="font-semibold text-slate-700">Project: </span>
          <span className="text-slate-700">{quote.projectName}</span>
        </div>
      )}

      {/* Line Items */}
      <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', borderTop: '2px solid #e2e8f0' }}>
            {['Description', 'Qty', 'Unit', 'Unit Price', 'Total'].map(h => (
              <th key={h} className={`py-2 text-xs font-bold uppercase tracking-wide text-slate-600 ${h === 'Total' || h === 'Unit Price' || h === 'Qty' ? 'text-right' : 'text-left'}`}
                style={{ paddingLeft: h === 'Description' ? 0 : '8px', paddingRight: h === 'Total' ? 0 : '8px' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {quote.lineItems.map(item => {
            const lineTotal = calcLineTotal(item);
            const unitPrice = item.qty > 0 ? lineTotal / item.qty : 0;
            return (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="py-2 text-slate-800">
                  {item.category && <span className="text-xs text-slate-400 mr-1">[{item.category}]</span>}
                  {item.description}
                  {item.notes && <div className="text-xs text-slate-400 italic">{item.notes}</div>}
                </td>
                <td className="py-2 text-right text-slate-700" style={{ paddingLeft: '8px' }}>{item.qty}</td>
                <td className="py-2 text-right text-slate-700" style={{ paddingLeft: '8px' }}>{item.unit}</td>
                <td className="py-2 text-right text-slate-700" style={{ paddingLeft: '8px' }}>{fmt(unitPrice)}</td>
                <td className="py-2 text-right font-medium text-slate-800">{fmt(lineTotal)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr style={{ borderTop: '1px solid #e2e8f0' }}>
            <td colSpan={4} className="py-2 text-right text-slate-600">Subtotal</td>
            <td className="py-2 text-right font-medium text-slate-800">{fmt(subtotal)}</td>
          </tr>
          {quote.taxPct > 0 && (
            <tr>
              <td colSpan={4} className="py-1 text-right text-slate-600">Tax ({quote.taxPct}%)</td>
              <td className="py-1 text-right text-slate-800">{fmt(tax)}</td>
            </tr>
          )}
          <tr style={{ borderTop: '2px solid #1e293b' }}>
            <td colSpan={4} className="py-2 text-right font-bold text-slate-900 text-base">TOTAL</td>
            <td className="py-2 text-right font-bold text-slate-900 text-base">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>

      {quote.notes && (
        <div className="mb-5">
          <div className="font-semibold text-slate-700 mb-1">Notes</div>
          <div className="text-slate-600 whitespace-pre-line">{quote.notes}</div>
        </div>
      )}

      {quote.terms && (
        <div className="mb-8">
          <div className="font-semibold text-slate-700 mb-1">Terms & Conditions</div>
          <div className="text-slate-600 text-xs whitespace-pre-line">{quote.terms}</div>
        </div>
      )}

      <div className="mt-10 grid grid-cols-2 gap-10" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <div>
          <div className="text-xs text-slate-500 mb-6">Customer Signature</div>
          <div style={{ borderBottom: '1px solid #334155', marginBottom: '4px' }} />
          <div className="text-xs text-slate-500">Signature &amp; Date</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-6">Contractor</div>
          <div style={{ borderBottom: '1px solid #334155', marginBottom: '4px' }} />
          <div className="text-xs text-slate-500">{contractor.name || contractor.company || 'Signature & Date'}</div>
        </div>
      </div>
    </div>
  );
}

// ─── Main QuoteDetail Component ───────────────────────────────────────────────
export function QuoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { contractor, customers, quotes, addQuote, updateQuote, addInvoice, updateQuote: _uq } = useBusiness();
  void _uq;

  const isNew = id === 'new';
  const existing = isNew ? undefined : quotes.find(q => q.id === id);

  const [quote, setQuote] = useState<Omit<Quote, 'id' | 'quoteNumber'>>(() =>
    existing ?? blankQuote(contractor.defaultPaymentTerms, contractor.defaultTaxPct, contractor.defaultValidDays)
  );
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  // Sync if existing quote changes (e.g., on first load)
  useEffect(() => {
    if (existing) setQuote(existing);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof typeof quote>(field: K, value: typeof quote[K]) =>
    setQuote(prev => ({ ...prev, [field]: value }));

  const updateItem = (itemId: string, field: keyof LineItem, value: string | number) =>
    setQuote(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(i => i.id === itemId ? { ...i, [field]: value } : i),
    }));

  const addItem = () =>
    setQuote(prev => ({ ...prev, lineItems: [...prev.lineItems, newLineItem()] }));

  const removeItem = (itemId: string) =>
    setQuote(prev => ({ ...prev, lineItems: prev.lineItems.filter(i => i.id !== itemId) }));

  const handleSave = () => {
    if (isNew) {
      const saved = addQuote(quote);
      navigate(`/quotes/${saved.id}`, { replace: true });
    } else if (existing) {
      updateQuote(existing.id, quote);
    }
  };

  const convertToInvoice = () => {
    if (!existing) return;
    const inv = addInvoice({
      quoteId: existing.id,
      customerId: quote.customerId,
      projectName: quote.projectName,
      jobSiteAddress: quote.jobSiteAddress,
      dateIssued: todayStr(),
      dateDue: addDays(todayStr(), 30),
      status: 'sent',
      lineItems: quote.lineItems,
      taxPct: quote.taxPct,
      payments: [],
      notes: quote.notes,
      terms: quote.terms,
    });
    updateQuote(existing.id, { ...quote, linkedInvoiceId: inv.id, status: 'accepted' });
    navigate(`/invoices/${inv.id}`);
  };

  const { subtotal, tax, total } = calcQuoteTotals({ ...quote, id: '', quoteNumber: '' });
  const customer = customers.find(c => c.id === quote.customerId);

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Print document (hidden in normal view) */}
      {existing && <PrintDoc quote={{ ...quote, id: existing.id, quoteNumber: existing.quoteNumber }} customer={customer} contractor={contractor} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Link to="/quotes" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm">
          <ArrowLeft size={15} /> Quotes
        </Link>
        <span className="text-slate-300">|</span>
        {existing && (
          <span className="text-slate-500 text-sm font-medium">{existing.quoteNumber}</span>
        )}

        {/* Status selector */}
        {existing && (
          <div className="relative ml-auto flex-shrink-0">
            <button onClick={() => setStatusMenuOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${QUOTE_STATUS_META[quote.status].color}`}>
              {QUOTE_STATUS_META[quote.status].label} <ChevronDown size={12} />
            </button>
            {statusMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10 min-w-[130px]">
                {STATUS_FLOW.map(s => (
                  <button key={s} onClick={() => { set('status', s); setStatusMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${QUOTE_STATUS_META[s].color}`}>
                      {QUOTE_STATUS_META[s].label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button onClick={() => { handleSave(); }}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
          <Save size={15} /> Save
        </button>

        {existing && !existing.linkedInvoiceId && (
          <button onClick={convertToInvoice}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            <FileCheck size={15} /> Convert to Invoice
          </button>
        )}
        {existing?.linkedInvoiceId && (
          <Link to={`/invoices/${existing.linkedInvoiceId}`}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100">
            View Invoice
          </Link>
        )}

        <button onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
          <Printer size={15} /> Print Quote
        </button>
      </div>

      {/* Main form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">

        {/* Left: Customer + Project */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Customer</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Select Customer</label>
              <select value={quote.customerId} onChange={e => set('customerId', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">— Select a customer —</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` (${c.company})` : ''}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                <Link to="/settings" className="text-amber-500 hover:underline">Manage customers →</Link>
              </p>
            </div>
            {customer && (
              <div className="bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-600 space-y-0.5">
                {customer.company && <div>{customer.company}</div>}
                {customer.address && <div>{customer.address}</div>}
                {[customer.city, customer.state].filter(Boolean).join(', ') && (
                  <div>{[customer.city, customer.state].filter(Boolean).join(', ')}</div>
                )}
                {customer.phone && <div>{customer.phone}</div>}
                {customer.email && <div>{customer.email}</div>}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Project</h3>
            {[
              { label: 'Project Name', field: 'projectName' as const, placeholder: 'New Home Build — 1234 Pine St' },
              { label: 'Job Site Address', field: 'jobSiteAddress' as const, placeholder: '1234 Pine St, Boise ID 83702' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
                <input type="text" value={quote[field]} placeholder={placeholder}
                  onChange={e => set(field, e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Quote Date</label>
                <input type="date" value={quote.dateCreated} onChange={e => set('dateCreated', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Valid Until</label>
                <input type="date" value={quote.validUntil} onChange={e => set('validUntil', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
            <h3 className="font-semibold text-slate-800 text-sm">Totals</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Tax</span>
                  <div className="flex items-center border border-slate-200 rounded overflow-hidden">
                    <input type="number" min={0} max={30} step={0.1} value={quote.taxPct}
                      onChange={e => set('taxPct', parseFloat(e.target.value) || 0)}
                      className="w-12 px-1 py-0.5 text-xs text-right focus:outline-none" />
                    <span className="px-1 text-xs text-slate-400 bg-slate-50 border-l border-slate-200">%</span>
                  </div>
                </div>
                <span className="font-medium">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-800 text-base pt-2 border-t border-slate-200">
                <span>TOTAL</span><span className="text-amber-600">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Line Items + Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Line items */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-slate-800 text-sm">Line Items</h3>
                <span className="text-xs text-slate-400">Unit Cost + Markup % → Customer Price (markup not printed)</span>
              </div>
              <button onClick={addItem}
                className="flex items-center gap-1 text-amber-500 hover:text-amber-600 text-xs font-medium">
                <Plus size={14} /> Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-1 py-2 text-left text-slate-500 font-medium w-28">Category</th>
                    <th className="px-1 py-2 text-left text-slate-500 font-medium">Description</th>
                    <th className="px-1 py-2 text-right text-slate-500 font-medium w-16">Qty</th>
                    <th className="px-1 py-2 text-right text-slate-500 font-medium w-20">Unit</th>
                    <th className="px-1 py-2 text-right text-slate-500 font-medium w-28">Your Cost</th>
                    <th className="px-1 py-2 text-right text-slate-500 font-medium w-20">Markup</th>
                    <th className="px-1 py-2 text-right text-slate-500 font-medium w-28">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        No items yet. <button onClick={addItem} className="text-amber-500 hover:underline">Add first item →</button>
                      </td>
                    </tr>
                  ) : (
                    quote.lineItems.map(item => (
                      <LineRow key={item.id} item={item}
                        onChange={(f, v) => updateItem(item.id, f, v)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {quote.lineItems.length > 0 && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-right text-xs text-slate-500">
                {quote.lineItems.length} item{quote.lineItems.length !== 1 ? 's' : ''} ·
                Markup total: {fmt(total - calcQuoteTotals({ ...quote, id: '', quoteNumber: '', taxPct: 0 }).subtotal)}
              </div>
            )}
          </div>

          {/* Notes + Terms + Internal */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Notes & Terms</h3>
            {[
              { label: 'Customer Notes (printed on quote)', field: 'notes' as const, placeholder: 'Scope of work, inclusions/exclusions, special conditions...' },
              { label: 'Terms & Conditions (printed on quote)', field: 'terms' as const, placeholder: 'Payment terms, warranty, etc.' },
              { label: 'Internal Notes (NOT printed — your eyes only)', field: 'internalNotes' as const, placeholder: 'Material costs, subcontractor quotes, margin notes...' },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {label}
                  {field === 'internalNotes' && <span className="ml-1 text-amber-500">(private)</span>}
                </label>
                <textarea rows={field === 'internalNotes' ? 2 : 3} value={quote[field]} placeholder={placeholder}
                  onChange={e => set(field, e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none ${
                    field === 'internalNotes' ? 'border-amber-200 bg-amber-50' : 'border-slate-300'
                  }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

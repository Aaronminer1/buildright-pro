import { Link } from 'react-router-dom';
import { Plus, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { calcQuoteTotals, fmt, fmtDate, QUOTE_STATUS_META } from '../types/business';
import type { QuoteStatus } from '../types/business';

const STATUS_FILTERS: { value: QuoteStatus | 'all'; label: string }[] = [
  { value: 'all',      label: 'All' },
  { value: 'draft',    label: 'Draft' },
  { value: 'sent',     label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired',  label: 'Expired' },
];

import { useState } from 'react';

export function Quotes() {
  const { quotes, customers, deleteQuote } = useBusiness();
  const [filter, setFilter] = useState<QuoteStatus | 'all'>('all');

  const visible = filter === 'all' ? quotes : quotes.filter(q => q.status === filter);
  const sorted  = [...visible].sort((a, b) => b.dateCreated.localeCompare(a.dateCreated));

  // Stats
  const sentQuotes     = quotes.filter(q => q.status === 'sent');
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
  const sentValue      = sentQuotes.reduce((s, q) => s + calcQuoteTotals(q).total, 0);
  const acceptedValue  = acceptedQuotes.reduce((s, q) => s + calcQuoteTotals(q).total, 0);
  const wonRate        = quotes.filter(q => q.status === 'accepted' || q.status === 'rejected').length > 0
    ? Math.round(acceptedQuotes.length /
        quotes.filter(q => q.status === 'accepted' || q.status === 'rejected').length * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Quotes', value: String(quotes.length), icon: <FileText size={18} className="text-slate-500" />, bg: 'bg-slate-50' },
          { label: 'Pending Value', value: fmt(sentValue), icon: <Clock size={18} className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Accepted Value', value: fmt(acceptedValue), icon: <CheckCircle size={18} className="text-green-500" />, bg: 'bg-green-50' },
          { label: 'Win Rate', value: `${wonRate}%`, icon: <TrendingUp size={18} className="text-amber-500" />, bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl border border-slate-200 p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{s.label}</span>
              {s.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Header + New button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.value ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({quotes.filter(q => q.status === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <Link to="/quotes/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 shrink-0 ml-3">
          <Plus size={16} /> New Quote
        </Link>
      </div>

      {/* Quote list */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No quotes yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first quote to start tracking jobs.</p>
          <Link to="/quotes/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
            <Plus size={15} /> Create Quote
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Quote #</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Project</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Valid Until</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide text-right">Total</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map(q => {
                const customer = customers.find(c => c.id === q.customerId);
                const { total } = calcQuoteTotals(q);
                const meta = QUOTE_STATUS_META[q.status];
                return (
                  <tr key={q.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/quotes/${q.id}`} className="font-medium text-amber-600 hover:text-amber-700">
                        {q.quoteNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{customer?.name ?? <span className="text-slate-400 italic">No customer</span>}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[180px] truncate">{q.projectName || <span className="text-slate-400 italic">Unnamed</span>}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(q.dateCreated)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(q.validUntil)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{fmt(total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/quotes/${q.id}`}
                          className="text-xs px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                          Edit
                        </Link>
                        {q.linkedInvoiceId && (
                          <Link to={`/invoices/${q.linkedInvoiceId}`}
                            className="text-xs px-2.5 py-1 border border-green-200 bg-green-50 rounded-lg text-green-700 hover:bg-green-100">
                            Invoice
                          </Link>
                        )}
                        <button
                          onClick={() => { if (window.confirm('Delete this quote?')) deleteQuote(q.id); }}
                          className="text-xs px-2.5 py-1 border border-red-100 rounded-lg text-red-500 hover:bg-red-50">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

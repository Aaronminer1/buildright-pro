import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import { calcInvoiceTotals, fmt, fmtDate, INVOICE_STATUS_META } from '../types/business';
import type { InvoiceStatus } from '../types/business';

const STATUS_FILTERS: { value: InvoiceStatus | 'all'; label: string }[] = [
  { value: 'all',     label: 'All' },
  { value: 'draft',   label: 'Draft' },
  { value: 'sent',    label: 'Sent' },
  { value: 'partial', label: 'Partial' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'paid',    label: 'Paid' },
];

export function Invoices() {
  const { invoices, customers, deleteInvoice } = useBusiness();
  const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');

  const visible = filter === 'all' ? invoices : invoices.filter(i => i.status === filter);
  const sorted  = [...visible].sort((a, b) => b.dateIssued.localeCompare(a.dateIssued));

  // Stats
  const outstanding  = invoices.filter(i => i.status === 'sent' || i.status === 'partial' || i.status === 'overdue');
  const overdue      = invoices.filter(i => i.status === 'overdue');
  const outstandingAmt = outstanding.reduce((s, i) => s + calcInvoiceTotals(i).balance, 0);
  const overdueAmt   = overdue.reduce((s, i) => s + calcInvoiceTotals(i).balance, 0);

  const thisMonth = new Date().toISOString().slice(0, 7);
  const paidThisMonth = invoices
    .flatMap(i => i.payments.filter(p => p.date.startsWith(thisMonth)))
    .reduce((s, p) => s + p.amount, 0);

  const totalInvoiced = invoices.reduce((s, i) => s + calcInvoiceTotals(i).total, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Invoiced', value: fmt(totalInvoiced), icon: <FileText size={18} className="text-slate-500" />, bg: 'bg-slate-50' },
          { label: 'Outstanding',    value: fmt(outstandingAmt), icon: <DollarSign size={18} className="text-blue-500" />, bg: 'bg-blue-50' },
          { label: 'Overdue',        value: fmt(overdueAmt),     icon: <AlertTriangle size={18} className="text-red-500" />, bg: 'bg-red-50' },
          { label: 'Collected (mo)', value: fmt(paidThisMonth),  icon: <CheckCircle size={18} className="text-green-500" />, bg: 'bg-green-50' },
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

      {/* Filter + New */}
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
                  ({invoices.filter(i => i.status === f.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
        <Link to="/invoices/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 shrink-0 ml-3">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      {/* Invoice list */}
      {sorted.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No invoices yet</p>
          <p className="text-slate-400 text-sm mt-1">Create an invoice manually or convert an accepted quote.</p>
          <Link to="/invoices/new"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
            <Plus size={15} /> Create Invoice
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                {['Invoice #', 'Customer', 'Project', 'Issued', 'Due', 'Total', 'Balance', 'Status', ''].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide ${
                    h === 'Total' || h === 'Balance' ? 'text-right' : ''
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map(inv => {
                const customer = customers.find(c => c.id === inv.customerId);
                const { total, balance } = calcInvoiceTotals(inv);
                const meta = INVOICE_STATUS_META[inv.status];
                return (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link to={`/invoices/${inv.id}`} className="font-medium text-amber-600 hover:text-amber-700">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{customer?.name ?? <span className="text-slate-400 italic">—</span>}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[160px] truncate">{inv.projectName || <span className="text-slate-400 italic">—</span>}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(inv.dateIssued)}</td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(inv.dateDue)}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800">{fmt(total)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      balance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>{balance > 0 ? fmt(balance) : 'Paid'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>{meta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/invoices/${inv.id}`}
                          className="text-xs px-2.5 py-1 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
                          Edit
                        </Link>
                        <button onClick={() => { if (window.confirm('Delete this invoice?')) deleteInvoice(inv.id); }}
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

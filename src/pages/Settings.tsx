import { useState } from 'react';
import { Building2, Users, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import type { Customer } from '../types/business';

const TABS = ['Business Info', 'Customers'] as const;
type Tab = typeof TABS[number];

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
      />
    </div>
  );
}

const BLANK_CUSTOMER: Omit<Customer, 'id' | 'createdAt'> = {
  name: '', company: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '', notes: '',
};

function CustomerForm({ initial, onSave, onCancel }: {
  initial: Omit<Customer, 'id' | 'createdAt'>;
  onSave: (c: Omit<Customer, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(initial);
  const set = (field: keyof typeof form) => (v: string) => setForm(prev => ({ ...prev, [field]: v }));
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Full Name *" value={form.name} onChange={set('name')} placeholder="John Smith" />
        <Field label="Company" value={form.company} onChange={set('company')} placeholder="ABC Corp" />
        <Field label="Email" value={form.email} onChange={set('email')} type="email" placeholder="john@example.com" />
        <Field label="Phone" value={form.phone} onChange={set('phone')} placeholder="(208) 555-1234" />
        <Field label="Address" value={form.address} onChange={set('address')} placeholder="123 Main St" />
        <Field label="City" value={form.city} onChange={set('city')} placeholder="Boise" />
        <Field label="State" value={form.state} onChange={set('state')} placeholder="ID" />
        <Field label="Zip" value={form.zip} onChange={set('zip')} placeholder="83702" />
      </div>
      <Textarea label="Notes" value={form.notes} onChange={set('notes')} />
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-300 rounded-lg hover:bg-slate-100">
          <X size={14} /> Cancel
        </button>
        <button onClick={() => form.name.trim() && onSave(form)}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600">
          <Check size={14} /> Save Customer
        </button>
      </div>
    </div>
  );
}

export function Settings() {
  const [tab, setTab] = useState<Tab>('Business Info');
  const { contractor, updateContractor, customers, addCustomer, updateCustomer, deleteCustomer } = useBusiness();
  const [saved, setSaved] = useState(false);
  const [addingCust, setAddingCust] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const set = (field: keyof typeof contractor) => (v: string) =>
    updateContractor({ [field]: field === 'defaultTaxPct' || field === 'defaultValidDays' ? parseFloat(v) || 0 : v });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-1 inline-flex gap-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-amber-500 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}>
            {t === 'Business Info' ? <Building2 size={15} /> : <Users size={15} />}
            {t}
          </button>
        ))}
      </div>

      {/* ─── Business Info ─── */}
      {tab === 'Business Info' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          <h3 className="font-semibold text-slate-800">Your Business</h3>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Company Name" value={contractor.company} onChange={set('company')} placeholder="Smith Construction LLC" />
            <Field label="Your Name" value={contractor.name} onChange={set('name')} placeholder="John Smith" />
            <Field label="Contractor License #" value={contractor.license} onChange={set('license')} placeholder="RCE-12345" />
            <Field label="Phone" value={contractor.phone} onChange={set('phone')} placeholder="(208) 555-1234" />
            <Field label="Email" value={contractor.email} onChange={set('email')} type="email" placeholder="john@smithconstruction.com" />
            <Field label="Website" value={contractor.website} onChange={set('website')} placeholder="www.smithconstruction.com" />
            <Field label="Street Address" value={contractor.address} onChange={set('address')} placeholder="456 Builder Ave" />
            <Field label="City" value={contractor.city} onChange={set('city')} placeholder="Boise" />
            <Field label="State" value={contractor.state} onChange={set('state')} placeholder="ID" />
            <Field label="Zip" value={contractor.zip} onChange={set('zip')} placeholder="83702" />
          </div>

          <hr className="border-slate-200" />
          <h3 className="font-semibold text-slate-800">Quote & Invoice Defaults</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Default Tax Rate (%)</label>
              <input type="number" min={0} max={30} step={0.1}
                value={contractor.defaultTaxPct}
                onChange={e => set('defaultTaxPct')(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <p className="text-xs text-slate-400 mt-1">Set 0 if you don't charge sales tax</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Quote Valid For (days)</label>
              <input type="number" min={1} max={180}
                value={contractor.defaultValidDays}
                onChange={e => set('defaultValidDays')(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <Textarea label="Default Payment Terms (shown on all quotes & invoices)"
            value={contractor.defaultPaymentTerms}
            onChange={set('defaultPaymentTerms')}
          />

          <div className="flex items-center gap-3">
            <button onClick={handleSave}
              className="px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
              Save Settings
            </button>
            {saved && <span className="text-green-600 text-sm flex items-center gap-1"><Check size={14} /> Saved</span>}
          </div>
        </div>
      )}

      {/* ─── Customers ─── */}
      {tab === 'Customers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Customers ({customers.length})</h3>
            <button onClick={() => { setAddingCust(true); setEditingId(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
              <Plus size={15} /> Add Customer
            </button>
          </div>

          {addingCust && (
            <CustomerForm
              initial={BLANK_CUSTOMER}
              onSave={c => { addCustomer(c); setAddingCust(false); }}
              onCancel={() => setAddingCust(false)}
            />
          )}

          {customers.length === 0 && !addingCust && (
            <div className="text-center py-10 text-slate-400">
              <Users size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No customers yet. Add one to get started.</p>
            </div>
          )}

          <div className="space-y-2">
            {customers.map(c => (
              <div key={c.id}>
                {editingId === c.id ? (
                  <CustomerForm
                    initial={c}
                    onSave={updates => { updateCustomer(c.id, updates); setEditingId(null); }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <div className="flex items-center justify-between px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 text-sm">{c.name}
                        {c.company && <span className="text-slate-400 font-normal"> · {c.company}</span>}
                      </div>
                      <div className="text-xs text-slate-500">
                        {[c.phone, c.email, [c.city, c.state].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4 shrink-0">
                      <button onClick={() => setEditingId(c.id)}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => { if (window.confirm(`Delete ${c.name}?`)) deleteCustomer(c.id); }}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

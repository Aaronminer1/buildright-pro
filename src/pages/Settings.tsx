import { useState, useRef, useEffect } from 'react';
import { Building2, Users, Plus, Pencil, Trash2, Check, X, Download, Upload, HardDrive, Lock, ShieldCheck, ShieldOff, Share2, FileSpreadsheet, Smartphone, RefreshCw, Mail } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import type { Customer } from '../types/business';
import { exportBackup, importBackup } from '../db/backup';
import { setPin, removePin, isPinEnabled, verifyPin } from '../db/pin';
import {
  exportCustomersCSV, exportProjectsCSV, exportQuotesCSV,
  exportInvoicesCSV, exportAllSpreadsheetsCSV, shareBackupFile,
} from '../db/csvExport';

const TABS = ['Business Info', 'Customers', 'Data'] as const;
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
  const [backupStatus, setBackupStatus] = useState<'idle' | 'exporting' | 'importing' | 'sharing' | 'done' | 'error'>('idle');
  const [backupMsg, setBackupMsg] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const [csvStatus, setCsvStatus] = useState<Record<string, 'idle' | 'busy' | 'done'>>({});
  const [shareSupported, setShareSupported] = useState<boolean | null>(null);

  // PIN state
  const [pinEnabled, setPinEnabled] = useState<boolean>(false);
  const [pinMode, setPinMode] = useState<'idle' | 'setting' | 'removing' | 'changing'>('idle');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinCurrent, setPinCurrent] = useState('');
  const [pinNew, setPinNew] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');

  useEffect(() => {
    isPinEnabled().then(setPinEnabled);
  }, []);

  const resetPinForm = () => {
    setPinMode('idle');
    setPinError('');
    setPinCurrent('');
    setPinNew('');
    setPinConfirm('');
  };

  const handleSetPin = async () => {
    if (!/^\d{4}$/.test(pinNew)) { setPinError('PIN must be exactly 4 digits.'); return; }
    if (pinNew !== pinConfirm) { setPinError('PINs do not match.'); return; }
    await setPin(pinNew);
    setPinEnabled(true);
    setPinSuccess('PIN enabled. You will be prompted next time you open the app.');
    resetPinForm();
    setTimeout(() => setPinSuccess(''), 4000);
  };

  const handleRemovePin = async () => {
    const ok = await verifyPin(pinCurrent);
    if (!ok) { setPinError('Incorrect PIN.'); return; }
    await removePin();
    setPinEnabled(false);
    setPinSuccess('PIN removed.');
    resetPinForm();
    setTimeout(() => setPinSuccess(''), 4000);
  };

  const handleChangePin = async () => {
    const ok = await verifyPin(pinCurrent);
    if (!ok) { setPinError('Current PIN is incorrect.'); return; }
    if (!/^\d{4}$/.test(pinNew)) { setPinError('New PIN must be exactly 4 digits.'); return; }
    if (pinNew !== pinConfirm) { setPinError('New PINs do not match.'); return; }
    await setPin(pinNew);
    setPinSuccess('PIN changed successfully.');
    resetPinForm();
    setTimeout(() => setPinSuccess(''), 4000);
  };

  const handleExport = async () => {
    setBackupStatus('exporting');
    try {
      await exportBackup();
      setBackupStatus('done');
      setBackupMsg('Backup file downloaded.');
    } catch (e) {
      setBackupStatus('error');
      setBackupMsg('Export failed. Try again.');
    }
    setTimeout(() => setBackupStatus('idle'), 3000);
  };

  const handleShare = async () => {
    setBackupStatus('sharing');
    const result = await shareBackupFile();
    if (result === 'shared') {
      setBackupStatus('done');
      setBackupMsg('Backup shared successfully.');
    } else if (result === 'unsupported') {
      setShareSupported(false);
      setBackupStatus('idle');
    } else {
      setBackupStatus('idle'); // cancelled
    }
    if (result === 'shared') setTimeout(() => setBackupStatus('idle'), 3000);
  };

  const handleCSV = async (label: string, fn: () => Promise<void>) => {
    setCsvStatus(s => ({ ...s, [label]: 'busy' }));
    try {
      await fn();
      setCsvStatus(s => ({ ...s, [label]: 'done' }));
      setTimeout(() => setCsvStatus(s => ({ ...s, [label]: 'idle' })), 2500);
    } catch {
      setCsvStatus(s => ({ ...s, [label]: 'idle' }));
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!window.confirm('This will REPLACE all current data with the backup. Are you sure?')) {
      e.target.value = '';
      return;
    }
    setBackupStatus('importing');
    try {
      await importBackup(file);
      setBackupStatus('done');
      setBackupMsg('Backup restored successfully.');
    } catch (err) {
      setBackupStatus('error');
      setBackupMsg(err instanceof Error ? err.message : 'Import failed.');
    }
    e.target.value = '';
    setTimeout(() => setBackupStatus('idle'), 4000);
  };

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
            {t === 'Business Info' ? <Building2 size={15} /> : t === 'Customers' ? <Users size={15} /> : <HardDrive size={15} />}
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

      {/* ─── Data Tab ─── */}
      {tab === 'Data' && (
        <div className="space-y-4">

          {/* Storage info */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <HardDrive size={16} className="text-amber-500" />
              Local Storage — IndexedDB
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              All your data — jobs, customers, quotes, invoices, and checklists — is stored
              locally on this device. Nothing is sent to any server.
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>✅ Works offline</span>
              <span>✅ No account needed</span>
              <span>✅ No cloud upload</span>
              <span>⚠️ Lost if browser data is cleared or device is replaced</span>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-semibold text-slate-800">Backup &amp; Restore</h3>
            <p className="text-sm text-slate-500">
              A backup file contains ALL your data. Save it somewhere safe — then use Restore
              to bring everything back on any device or browser.
            </p>

            {backupStatus === 'done' && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                <Check size={15} /> {backupMsg}
              </div>
            )}
            {backupStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                <X size={15} /> {backupMsg}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Download */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
                  <Download size={15} className="text-amber-500" /> Download File
                </div>
                <p className="text-xs text-slate-500 flex-1">
                  Saves a <strong>.json</strong> file to your device. Store it in Google Drive,
                  iCloud, Dropbox, or a USB drive.
                </p>
                <button
                  onClick={handleExport}
                  disabled={backupStatus === 'exporting'}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-60 transition-colors">
                  <Download size={14} />
                  {backupStatus === 'exporting' ? 'Saving…' : 'Export Backup'}
                </button>
              </div>

              {/* Share / Email */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
                  <Mail size={15} className="text-amber-500" /> Email / Share
                </div>
                <p className="text-xs text-slate-500 flex-1">
                  <strong>On mobile:</strong> opens your share sheet — send directly to Gmail,
                  iCloud Mail, WhatsApp, etc. <strong>On desktop:</strong> download first,
                  then attach to an email.
                </p>
                <button
                  onClick={handleShare}
                  disabled={backupStatus === 'sharing'}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors">
                  <Share2 size={14} />
                  {backupStatus === 'sharing' ? 'Opening…' : 'Share Backup'}
                </button>
                {shareSupported === false && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Sharing isn't supported in this browser. Download the file above and attach
                    it to an email manually.
                  </p>
                )}
              </div>

              {/* Restore */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 font-medium text-slate-800 text-sm">
                  <RefreshCw size={15} className="text-amber-500" /> Restore
                </div>
                <p className="text-xs text-slate-500 flex-1">
                  Upload a backup file to completely restore all data.
                  <strong className="text-red-600"> This replaces everything currently in the app.</strong>
                </p>
                <button
                  onClick={() => importRef.current?.click()}
                  disabled={backupStatus === 'importing'}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-white disabled:opacity-60 transition-colors">
                  <Upload size={14} />
                  {backupStatus === 'importing' ? 'Restoring…' : 'Choose Backup File'}
                </button>
                <input ref={importRef} type="file" accept=".json" onChange={handleImport} className="sr-only" />
              </div>
            </div>
          </div>

          {/* Spreadsheet Export */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet size={16} className="text-amber-500" />
                Spreadsheet Export (CSV)
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Export your data as CSV files — open in Excel or Google Sheets. Great for
                sharing with your accountant, bookkeeper, or keeping human-readable records.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                { label: 'All Data', fn: exportAllSpreadsheetsCSV, desc: 'Everything in one file' },
                { label: 'Customers', fn: exportCustomersCSV, desc: 'Name, contact, address' },
                { label: 'Projects', fn: exportProjectsCSV, desc: 'Jobs, phases, dates' },
                { label: 'Quotes', fn: exportQuotesCSV, desc: 'Summary + line items' },
                { label: 'Invoices', fn: exportInvoicesCSV, desc: 'Summary + payments' },
              ] as const).map(({ label, fn, desc }) => (
                <button
                  key={label}
                  onClick={() => handleCSV(label, fn)}
                  disabled={csvStatus[label] === 'busy'}
                  className="flex flex-col items-start gap-0.5 px-4 py-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 hover:border-amber-300 disabled:opacity-60 transition-colors group">
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                    {csvStatus[label] === 'done'
                      ? <Check size={13} className="text-green-600" />
                      : <Download size={13} className="text-amber-500 group-hover:translate-y-0.5 transition-transform" />}
                    {csvStatus[label] === 'busy' ? 'Exporting…' : label}
                  </span>
                  <span className="text-xs text-slate-400">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recovery Guide */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <Smartphone size={16} className="text-amber-600" />
              How to protect &amp; recover your data
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
              <div className="space-y-1.5">
                <p className="font-medium text-amber-900">📱 New phone or device</p>
                <ol className="text-amber-800 space-y-1 list-decimal list-inside text-xs">
                  <li>Export Backup on your old device</li>
                  <li>Email it to yourself or save to Google Drive / iCloud</li>
                  <li>Open BuildRight Pro on the new device</li>
                  <li>Settings → Data → Choose Backup File</li>
                </ol>
              </div>
              <div className="space-y-1.5">
                <p className="font-medium text-amber-900">🔄 Browser data cleared</p>
                <ol className="text-amber-800 space-y-1 list-decimal list-inside text-xs">
                  <li>Open the backup file you saved earlier</li>
                  <li>Settings → Data → Choose Backup File</li>
                  <li>All data is restored instantly</li>
                  <li>Set up a weekly backup habit to avoid data loss</li>
                </ol>
              </div>
              <div className="space-y-1.5">
                <p className="font-medium text-amber-900">📊 Accountant / tax time</p>
                <ol className="text-amber-800 space-y-1 list-decimal list-inside text-xs">
                  <li>Use Spreadsheet Export → Invoices or All Data</li>
                  <li>Download the CSV file</li>
                  <li>Attach it to an email to your accountant</li>
                  <li>Opens in Excel or Google Sheets</li>
                </ol>
              </div>
            </div>
            <p className="text-xs text-amber-700 border-t border-amber-200 pt-3">
              💡 Best practice: export a backup weekly and email it to yourself so you always
              have a recent copy in your inbox.
            </p>
          </div>

          {/* ─── PIN Lock ─── */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Lock size={16} className="text-amber-500" />
                App Lock PIN
              </h3>
              {pinEnabled
                ? <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full"><ShieldCheck size={13} /> Enabled</span>
                : <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full"><ShieldOff size={13} /> Disabled</span>}
            </div>

            <p className="text-sm text-slate-500">
              Set a 4-digit PIN to lock the app when you leave. You'll be prompted to enter it
              next time you open BuildRight Pro.
            </p>

            {pinSuccess && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm">
                <Check size={15} /> {pinSuccess}
              </div>
            )}
            {pinError && (
              <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                <X size={15} /> {pinError}
              </div>
            )}

            {pinMode === 'idle' && (
              <div className="flex flex-wrap gap-3">
                {!pinEnabled && (
                  <button onClick={() => { setPinMode('setting'); setPinError(''); }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                    <Lock size={15} /> Set PIN
                  </button>
                )}
                {pinEnabled && (
                  <>
                    <button onClick={() => { setPinMode('changing'); setPinError(''); }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
                      <Lock size={15} /> Change PIN
                    </button>
                    <button onClick={() => { setPinMode('removing'); setPinError(''); }}
                      className="flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                      <ShieldOff size={15} /> Remove PIN
                    </button>
                  </>
                )}
              </div>
            )}

            {pinMode === 'setting' && (
              <div className="space-y-3 max-w-xs">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New PIN (4 digits)</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinNew}
                    onChange={e => { setPinNew(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm PIN</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinConfirm}
                    onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSetPin}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
                    <Check size={14} /> Enable PIN
                  </button>
                  <button onClick={resetPinForm}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            )}

            {pinMode === 'removing' && (
              <div className="space-y-3 max-w-xs">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Enter current PIN to confirm</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinCurrent}
                    onChange={e => { setPinCurrent(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••" autoFocus />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleRemovePin}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                    <ShieldOff size={14} /> Remove PIN
                  </button>
                  <button onClick={resetPinForm}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            )}

            {pinMode === 'changing' && (
              <div className="space-y-3 max-w-xs">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Current PIN</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinCurrent}
                    onChange={e => { setPinCurrent(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••" autoFocus />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">New PIN (4 digits)</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinNew}
                    onChange={e => { setPinNew(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New PIN</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinConfirm}
                    onChange={e => { setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinError(''); }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="••••" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleChangePin}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
                    <Check size={14} /> Update PIN
                  </button>
                  <button onClick={resetPinForm}
                    className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            )}
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

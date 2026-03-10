import { useState } from 'react';
import { Plus, Trash2, Download, Printer, Package, ChevronDown } from 'lucide-react';
import { useBusiness } from '../context/BusinessContext';
import type { BOM, BOMItem } from '../types/business';
import { calcBOMTotal, fmt, fmtDate, newBOMItem, LINE_CATEGORIES, LINE_UNITS } from '../types/business';

function BOMItemRow({ item, onChange, onRemove }: {
  item: BOMItem;
  onChange: (field: keyof BOMItem, value: string | number) => void;
  onRemove: () => void;
}) {
  return (
    <tr className="border-b border-slate-100 group">
      <td className="py-1.5 px-1">
        <select value={item.category} onChange={e => onChange('category', e.target.value)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400 bg-white">
          {LINE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>
      <td className="py-1.5 px-1">
        <input type="text" value={item.description} placeholder="Material / item description"
          onChange={e => onChange('description', e.target.value)}
          className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1 w-20">
        <input type="number" min={0} step={0.01} value={item.qty}
          onChange={e => onChange('qty', parseFloat(e.target.value) || 0)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1 w-20">
        <input list="bom-units" value={item.unit} onChange={e => onChange('unit', e.target.value)}
          className="w-full border border-slate-200 rounded px-1.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
        <datalist id="bom-units">{LINE_UNITS.map(u => <option key={u} value={u} />)}</datalist>
      </td>
      <td className="py-1.5 px-1 w-28">
        <div className="flex items-center border border-slate-200 rounded overflow-hidden">
          <span className="px-1.5 py-1 text-xs text-slate-400 bg-slate-50 border-r border-slate-200">$</span>
          <input type="number" min={0} step={0.01} value={item.unitCost}
            onChange={e => onChange('unitCost', parseFloat(e.target.value) || 0)}
            className="w-full px-1.5 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-amber-400" />
        </div>
      </td>
      <td className="py-1.5 px-2 text-right text-sm font-medium text-slate-800 tabular-nums">
        {fmt(item.qty * item.unitCost)}
      </td>
      <td className="py-1.5 px-1">
        <input type="text" value={item.supplier} placeholder="Supplier name"
          onChange={e => onChange('supplier', e.target.value)}
          className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1">
        <input type="text" value={item.notes} placeholder="Notes"
          onChange={e => onChange('notes', e.target.value)}
          className="w-full border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400" />
      </td>
      <td className="py-1.5 px-1 w-8">
        <button onClick={onRemove}
          className="p-1 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  );
}

// ─── CSV Export helper ────────────────────────────────────────────────────────
function exportCSV(bom: BOM) {
  const header = ['Category', 'Description', 'Qty', 'Unit', 'Unit Cost', 'Total', 'Supplier', 'Notes'];
  const rows = bom.items.map(i => [
    i.category, i.description, String(i.qty), i.unit,
    i.unitCost.toFixed(2), (i.qty * i.unitCost).toFixed(2), i.supplier, i.notes,
  ]);
  const csvContent = [header, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BOM_${bom.name.replace(/\s+/g, '_')}_${bom.dateCreated}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Print Layout ─────────────────────────────────────────────────────────────
function PrintBOM({ bom, contractor }: { bom: BOM; contractor: ReturnType<typeof useBusiness>['contractor'] }) {
  const total = calcBOMTotal(bom);
  // Group by category
  const categories = [...new Set(bom.items.map(i => i.category))];
  return (
    <div className="hidden print:block bg-white p-10 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="text-xl font-bold text-slate-900">{contractor.company || 'Your Company'}</div>
          {contractor.phone && <div className="text-slate-600 text-xs">{contractor.phone}</div>}
          {contractor.email && <div className="text-slate-600 text-xs">{contractor.email}</div>}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-amber-600 uppercase tracking-widest">Material Order</div>
          <div className="text-slate-700 mt-1"><span className="font-semibold">BOM:</span> {bom.name}</div>
          <div className="text-slate-500 text-xs">{fmtDate(bom.dateCreated)}</div>
        </div>
      </div>

      {categories.map(cat => {
        const catItems = bom.items.filter(i => i.category === cat);
        const catTotal = catItems.reduce((s, i) => s + i.qty * i.unitCost, 0);
        return (
          <div key={cat} className="mb-6">
            <div className="font-bold text-slate-700 text-xs uppercase tracking-widest bg-slate-100 px-3 py-1 mb-2">
              {cat}
            </div>
            <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  {['Description', 'Qty', 'Unit', 'Unit Cost', 'Total', 'Supplier', 'Notes'].map(h => (
                    <th key={h} className={`py-1.5 text-slate-500 font-medium ${
                      ['Total','Unit Cost','Qty'].includes(h) ? 'text-right' : 'text-left'
                    }`} style={{ paddingLeft: h === 'Description' ? 0 : '6px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {catItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td className="py-1.5 text-slate-800">{item.description}</td>
                    <td className="py-1.5 text-right text-slate-700" style={{ paddingLeft: '6px' }}>{item.qty}</td>
                    <td className="py-1.5 text-right text-slate-700" style={{ paddingLeft: '6px' }}>{item.unit}</td>
                    <td className="py-1.5 text-right text-slate-700" style={{ paddingLeft: '6px' }}>{fmt(item.unitCost)}</td>
                    <td className="py-1.5 text-right font-medium text-slate-800" style={{ paddingLeft: '6px' }}>{fmt(item.qty * item.unitCost)}</td>
                    <td className="py-1.5 text-slate-600" style={{ paddingLeft: '6px' }}>{item.supplier}</td>
                    <td className="py-1.5 text-slate-400" style={{ paddingLeft: '6px' }}>{item.notes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: '1px solid #e2e8f0' }}>
                  <td colSpan={4} className="py-1 text-right font-semibold text-slate-600 text-xs">{cat} Subtotal</td>
                  <td className="py-1 text-right font-bold text-slate-800" style={{ paddingLeft: '6px' }}>{fmt(catTotal)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        );
      })}

      <div className="mt-4 pt-3 text-right" style={{ borderTop: '2px solid #1e293b' }}>
        <span className="font-bold text-slate-900 text-base">TOTAL MATERIAL COST: {fmt(total)}</span>
      </div>
      {bom.notes && <div className="mt-4 text-xs text-slate-500"><strong>Notes:</strong> {bom.notes}</div>}

      <div className="mt-8 grid grid-cols-2 gap-8" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <div>
          <div className="text-xs text-slate-400 mb-4">Ordered By</div>
          <div style={{ borderBottom: '1px solid #334155' }} />
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-4">Date Ordered</div>
          <div style={{ borderBottom: '1px solid #334155' }} />
        </div>
      </div>
    </div>
  );
}

// ─── Main BOM Page ────────────────────────────────────────────────────────────
export function BOMPage() {
  const { contractor, boms, addBOM, updateBOM, deleteBOM } = useBusiness();
  const [selectedId, setSelectedId] = useState<string | null>(boms[0]?.id ?? null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newBOMName, setNewBOMName] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const selected = boms.find(b => b.id === selectedId);

  const createBOM = () => {
    if (!newBOMName.trim()) return;
    const b = addBOM({ name: newBOMName.trim(), projectId: '', items: [], notes: '' });
    setSelectedId(b.id);
    setNewBOMName('');
    setShowNewForm(false);
  };

  const updateItem = (itemId: string, field: keyof BOMItem, value: string | number) => {
    if (!selected) return;
    updateBOM(selected.id, {
      items: selected.items.map(i => i.id === itemId ? { ...i, [field]: value } : i),
    });
  };

  const addItem = () => {
    if (!selected) return;
    updateBOM(selected.id, { items: [...selected.items, newBOMItem()] });
  };

  const removeItem = (itemId: string) => {
    if (!selected) return;
    updateBOM(selected.id, { items: selected.items.filter(i => i.id !== itemId) });
  };

  // Category subtotals for sidebar
  const categoryTotals = selected
    ? [...new Set(selected.items.map(i => i.category))].map(cat => ({
        cat,
        total: selected.items.filter(i => i.category === cat).reduce((s, i) => s + i.qty * i.unitCost, 0),
        count: selected.items.filter(i => i.category === cat).length,
      })).sort((a, b) => b.total - a.total)
    : [];

  const grandTotal = selected ? calcBOMTotal(selected) : 0;

  return (
    <div className="space-y-4 max-w-7xl">
      {selected && <PrintBOM bom={selected} contractor={contractor} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        {/* BOM selector */}
        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 min-w-[200px]">
            <Package size={15} className="text-amber-500" />
            <span className="flex-1 text-left truncate">{selected?.name ?? 'Select BOM'}</span>
            <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-10 min-w-[220px]">
              {boms.map(b => (
                <button key={b.id} onClick={() => { setSelectedId(b.id); setMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center hover:bg-slate-50 ${b.id === selectedId ? 'text-amber-600 font-medium' : 'text-slate-700'}`}>
                  <span className="truncate">{b.name}</span>
                  <span className="text-xs text-slate-400 ml-2">{b.items.length} items</span>
                </button>
              ))}
              {boms.length > 0 && <div className="border-t border-slate-100 my-1" />}
              <button onClick={() => { setShowNewForm(true); setMenuOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
                <Plus size={13} /> New BOM
              </button>
            </div>
          )}
        </div>

        <button onClick={() => setShowNewForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-amber-400 text-amber-600 rounded-xl text-sm hover:bg-amber-50">
          <Plus size={15} /> New BOM
        </button>

        {selected && (
          <>
            <button onClick={addItem}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600">
              <Plus size={15} /> Add Item
            </button>
            <button onClick={() => exportCSV(selected)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
              <Download size={15} /> Export CSV
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50">
              <Printer size={15} /> Print Order Sheet
            </button>
            <button onClick={() => { if (window.confirm(`Delete "${selected.name}"?`)) { deleteBOM(selected.id); setSelectedId(boms.find(b => b.id !== selected.id)?.id ?? null); } }}
              className="ml-auto text-xs px-3 py-1.5 border border-red-100 text-red-500 rounded-lg hover:bg-red-50">
              Delete BOM
            </button>
          </>
        )}
      </div>

      {/* New BOM form */}
      {showNewForm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 print:hidden">
          <input type="text" value={newBOMName} placeholder="BOM name (e.g., 1234 Pine St — Framing Package)"
            autoFocus
            onChange={e => setNewBOMName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') createBOM(); if (e.key === 'Escape') setShowNewForm(false); }}
            className="flex-1 border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white" />
          <button onClick={createBOM}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
            Create
          </button>
          <button onClick={() => setShowNewForm(false)}
            className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
            Cancel
          </button>
        </div>
      )}

      {/* No BOMs yet */}
      {boms.length === 0 && !showNewForm && (
        <div className="bg-white rounded-xl border border-slate-200 p-14 text-center print:hidden">
          <Package size={44} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 font-medium">No BOMs yet</p>
          <p className="text-slate-400 text-sm mt-1">Create a Bill of Materials to track and order your materials.</p>
          <button onClick={() => setShowNewForm(true)}
            className="inline-flex items-center gap-2 mt-4 px-5 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
            <Plus size={15} /> Create First BOM
          </button>
        </div>
      )}

      {/* BOM editor */}
      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 print:hidden">
          {/* Main table */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              {/* Editable BOM name */}
              <input type="text" value={selected.name}
                onChange={e => updateBOM(selected.id, { name: e.target.value })}
                className="font-semibold text-slate-800 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded px-1 -mx-1 min-w-0 flex-1" />
              <span className="text-xs text-slate-400 ml-3 shrink-0">{selected.items.length} item{selected.items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-1 py-2 text-left text-slate-500 w-28">Category</th>
                    <th className="px-1 py-2 text-left text-slate-500">Description</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-20">Qty</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-20">Unit</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-28">Unit Cost</th>
                    <th className="px-1 py-2 text-right text-slate-500 w-24">Total</th>
                    <th className="px-1 py-2 text-left text-slate-500">Supplier</th>
                    <th className="px-1 py-2 text-left text-slate-500">Notes</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.length === 0 ? (
                    <tr><td colSpan={9} className="py-10 text-center text-slate-400">
                      No items. <button onClick={addItem} className="text-amber-500 hover:underline">Add first item →</button>
                    </td></tr>
                  ) : selected.items.map(item => (
                    <BOMItemRow key={item.id} item={item}
                      onChange={(f, v) => updateItem(item.id, f, v)}
                      onRemove={() => removeItem(item.id)} />
                  ))}
                </tbody>
              </table>
            </div>
            {selected.items.length > 0 && (
              <div className="px-4 py-3 bg-amber-50 border-t border-amber-100 flex justify-between items-center">
                <button onClick={addItem}
                  className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-xs font-medium">
                  <Plus size={13} /> Add Item
                </button>
                <div className="text-sm font-bold text-amber-700">
                  Total: {fmt(grandTotal)}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Category summary + notes */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">By Category</h3>
              {categoryTotals.length === 0 ? (
                <p className="text-xs text-slate-400">No items yet</p>
              ) : (
                <div className="space-y-2">
                  {categoryTotals.map(({ cat, total, count }) => (
                    <div key={cat} className="text-xs">
                      <div className="flex justify-between text-slate-600 mb-0.5">
                        <span className="truncate">{cat}</span>
                        <span className="font-medium ml-2 shrink-0">{fmt(total)}</span>
                      </div>
                      <div className="bg-slate-100 rounded-full h-1.5">
                        <div className="bg-amber-400 rounded-full h-1.5"
                          style={{ width: `${grandTotal > 0 ? Math.min(100, (total / grandTotal) * 100) : 0}%` }} />
                      </div>
                      <div className="text-slate-400 mt-0.5">{count} item{count !== 1 ? 's' : ''}</div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800 text-sm">
                    <span>Grand Total</span>
                    <span className="text-amber-600">{fmt(grandTotal)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">BOM Notes</label>
              <textarea rows={4} value={selected.notes}
                onChange={e => updateBOM(selected.id, { notes: e.target.value })}
                placeholder="Delivery notes, supplier contacts, special orders..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
            </div>

            {/* Supplier breakdown */}
            {selected.items.some(i => i.supplier) && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="font-semibold text-slate-800 text-sm mb-3">By Supplier</h3>
                {[...new Set(selected.items.filter(i => i.supplier).map(i => i.supplier))].map(sup => {
                  const supItems = selected.items.filter(i => i.supplier === sup);
                  const supTotal = supItems.reduce((s, i) => s + i.qty * i.unitCost, 0);
                  return (
                    <div key={sup} className="flex justify-between text-xs py-1 border-b border-slate-100">
                      <span className="text-slate-600 truncate">{sup}</span>
                      <span className="font-medium text-slate-800 ml-2 shrink-0">{fmt(supTotal)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

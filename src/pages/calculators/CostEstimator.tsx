import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { Button } from '../../components/ui/Button';
import { calcProjectCost } from '../../utils/calculations';
import { PlusCircle, Trash2, Printer } from 'lucide-react';
import { PriceIndexBanner } from '../../components/ui/PriceIndexBanner';

interface Trade {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
}

const DEFAULT_TRADES: Trade[] = [
  { id: '1',  name: 'Site Work / Excavation',      quantity: 1,    unit: 'LS',  unitCost: 12000  },
  { id: '2',  name: 'Concrete / Foundation',        quantity: 100,  unit: 'CY',  unitCost: 165    },
  { id: '3',  name: 'Framing Labor & Material',     quantity: 2000, unit: 'SF',  unitCost: 22     },
  { id: '4',  name: 'Roofing (shingles)',            quantity: 25,   unit: 'sq',  unitCost: 350    },
  { id: '5',  name: 'Windows & Exterior Doors',     quantity: 15,   unit: 'EA',  unitCost: 600    },
  { id: '6',  name: 'Rough Plumbing',               quantity: 1,    unit: 'LS',  unitCost: 14000  },
  { id: '7',  name: 'Rough Electrical',             quantity: 1,    unit: 'LS',  unitCost: 12000  },
  { id: '8',  name: 'HVAC System',                  quantity: 1,    unit: 'LS',  unitCost: 18000  },
  { id: '9',  name: 'Insulation',                   quantity: 2000, unit: 'SF',  unitCost: 2.5    },
  { id: '10', name: 'Drywall (supply & install)',   quantity: 2000, unit: 'SF',  unitCost: 4.5    },
  { id: '11', name: 'Flooring',                     quantity: 1600, unit: 'SF',  unitCost: 8      },
  { id: '12', name: 'Cabinets & Countertops',       quantity: 1,    unit: 'LS',  unitCost: 22000  },
  { id: '13', name: 'Interior Trim & Doors',        quantity: 1,    unit: 'LS',  unitCost: 8000   },
  { id: '14', name: 'Exterior Siding & Trim',       quantity: 2000, unit: 'SF',  unitCost: 7      },
  { id: '15', name: 'Paint (interior)',              quantity: 2000, unit: 'SF',  unitCost: 3      },
  { id: '16', name: 'Finish Plumbing (fixtures)',   quantity: 1,    unit: 'LS',  unitCost: 8000   },
  { id: '17', name: 'Finish Electrical (devices)',  quantity: 1,    unit: 'LS',  unitCost: 6000   },
  { id: '18', name: 'Landscaping / Grading',        quantity: 1,    unit: 'LS',  unitCost: 5000   },
  { id: '19', name: 'Driveway / Flatwork',          quantity: 500,  unit: 'SF',  unitCost: 8      },
  { id: '20', name: 'Permits & Inspections',        quantity: 1,    unit: 'LS',  unitCost: 4500   },
];

const ALL_MATERIAL_SERIES = ['softwood_lumber', 'plywood', 'cement', 'ready_mix', 'steel', 'gypsum'] as const;

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function CostEstimator() {
  const [trades, setTrades]         = useState<Trade[]>(DEFAULT_TRADES);
  const [contingency, setContingency] = useState('10');
  const [sqft, setSqft]             = useState('2000');
  const [projectName, setProjectName] = useState('New Home Build');

  const costs = useMemo(() => {
    const tradeCosts = trades.map(t => ({
      trade: t.name,
      quantity: t.quantity,
      unit: t.unit,
      unitCost: t.unitCost,
    }));
    return calcProjectCost(tradeCosts, parseFloat(contingency)||10);
  }, [trades, contingency]);

  const costPerSF = sqft ? Math.round(costs.grandTotal / (parseFloat(sqft)||1)) : 0;

  function updateTrade(id: string, field: keyof Trade, value: string | number) {
    setTrades(ts => ts.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  function removeTrade(id: string) {
    setTrades(ts => ts.filter(t => t.id !== id));
  }

  function addTrade() {
    setTrades(ts => [...ts, {
      id: generateId(), name: 'New Line Item', quantity: 1, unit: 'LS', unitCost: 0
    }]);
  }

  function resetToDefaults() {
    setTrades(DEFAULT_TRADES);
  }

  return (
    <div className="space-y-5">
      <PriceIndexBanner seriesKeys={ALL_MATERIAL_SERIES} title="Construction Material Market Trends" />
      {/* Header controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-medium text-slate-600 mb-1">Project Name</label>
            <input
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="w-32">
            <InputField label="House Size" value={sqft} onChange={setSqft} unit="SF" />
          </div>
          <div className="w-28">
            <InputField label="Contingency %" value={contingency} onChange={setContingency} unit="%" />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={resetToDefaults} size="sm">Reset</Button>
            <Button variant="ghost" onClick={() => window.print()} size="sm">
              <Printer size={14} className="mr-1" /> Print
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line items table */}
        <div className="lg:col-span-2">
          <Card title="Trade Line Items" action={
            <Button variant="outline" onClick={addTrade} size="sm">
              <PlusCircle size={14} className="mr-1" /> Add Trade
            </Button>
          }>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 px-1 font-medium text-slate-600 w-52">Description</th>
                    <th className="text-right py-2 px-1 font-medium text-slate-600 w-20">Qty</th>
                    <th className="text-left py-2 px-1 font-medium text-slate-600 w-16">Unit</th>
                    <th className="text-right py-2 px-1 font-medium text-slate-600 w-24">Unit Cost</th>
                    <th className="text-right py-2 px-1 font-medium text-slate-600 w-24">Total</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map(t => (
                    <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-1.5 px-1">
                        <input
                          value={t.name}
                          onChange={e => updateTrade(t.id, 'name', e.target.value)}
                          className="w-full border-0 bg-transparent text-slate-700 text-xs focus:outline-none focus:bg-blue-50 rounded px-1"
                        />
                      </td>
                      <td className="py-1.5 px-1">
                        <input
                          type="number"
                          value={t.quantity}
                          onChange={e => updateTrade(t.id, 'quantity', parseFloat(e.target.value)||0)}
                          className="w-full border-0 bg-transparent text-slate-700 text-xs text-right focus:outline-none focus:bg-blue-50 rounded px-1"
                        />
                      </td>
                      <td className="py-1.5 px-1">
                        <input
                          value={t.unit}
                          onChange={e => updateTrade(t.id, 'unit', e.target.value)}
                          className="w-full border-0 bg-transparent text-slate-500 text-xs focus:outline-none focus:bg-blue-50 rounded px-1"
                        />
                      </td>
                      <td className="py-1.5 px-1">
                        <div className="flex items-center justify-end gap-0.5">
                          <span className="text-slate-400">$</span>
                          <input
                            type="number"
                            value={t.unitCost}
                            onChange={e => updateTrade(t.id, 'unitCost', parseFloat(e.target.value)||0)}
                            className="w-full border-0 bg-transparent text-slate-700 text-xs text-right focus:outline-none focus:bg-blue-50 rounded px-1"
                          />
                        </div>
                      </td>
                      <td className="py-1.5 px-1 text-right font-medium text-slate-800">
                        ${(t.quantity * t.unitCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </td>
                      <td className="py-1.5 px-1">
                        <button
                          onClick={() => removeTrade(t.id)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={addTrade}
              className="mt-3 w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs text-slate-400 hover:text-amber-600 hover:border-amber-300 transition-colors"
            >
              + Add Line Item
            </button>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card title="Cost Summary">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="font-medium text-slate-800">
                  ${costs.subtotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Contingency ({contingency}%)</span>
                <span className="font-medium text-amber-600">
                  +${costs.contingency.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 bg-slate-800 text-white rounded-lg px-3">
                <span className="font-bold">TOTAL</span>
                <span className="font-bold text-amber-400 text-lg">
                  ${costs.grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-blue-50 rounded-lg px-3">
                <span className="text-xs text-blue-700">Cost per SF</span>
                <span className="font-bold text-blue-800">${costPerSF}/SF</span>
              </div>
            </div>
          </Card>

          {/* Top 5 trades */}
          <Card title="Top Cost Categories">
            <div className="space-y-2">
              {trades
                .map(t => ({ name: t.name, cost: t.quantity * t.unitCost }))
                .sort((a, b) => b.cost - a.cost)
                .slice(0, 6)
                .map((t, i) => {
                  const pct = costs.subtotal > 0 ? Math.round(t.cost / costs.subtotal * 100) : 0;
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex justify-between mb-0.5">
                        <span className="text-slate-600 truncate max-w-[9rem]">{t.name}</span>
                        <span className="text-slate-800 font-medium ml-2">
                          ${t.cost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full">
                        <div
                          className="h-1.5 bg-amber-400 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 space-y-1">
            <p className="font-bold">⚠️ Estimate Basis</p>
            <p>These are national average estimates. Actual costs vary significantly by
            region, market conditions, material prices, and project complexity.</p>
            <p>Always get 3 bids from licensed contractors before committing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

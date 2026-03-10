import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { calcStairs, formatFtIn } from '../../utils/calculations';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function StairsCalc() {
  const [riseIn,     setRiseIn]     = useState('');
  const [riseFt,     setRiseFt]     = useState('8');
  const [stairWidth, setStairWidth] = useState('36');
  const [treadDepth, setTreadDepthV]= useState('10.5');
  const [useInches,  setUseInches]  = useState(false);

  const totalRiseIn = useMemo(() => {
    if (useInches) return parseFloat(riseIn) || 0;
    const ft = parseFloat(riseFt) || 0;
    return ft * 12;
  }, [useInches, riseIn, riseFt]);

  const result = useMemo(() => {
    if (!totalRiseIn) return null;
    return calcStairs(totalRiseIn, parseFloat(stairWidth) || 36, undefined, parseFloat(treadDepth) || 10.5);
  }, [totalRiseIn, stairWidth, treadDepth]);

  // Stair step diagram
  const maxSteps = result ? Math.min(result.numberOfRisers, 15) : 0;

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card title="Stair Calculator" subtitle="IRC 2021 R311.7 — Stairways">
          <div className="space-y-4">
            <div>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setUseInches(false)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    !useInches ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >Feet</button>
                <button
                  onClick={() => setUseInches(true)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    useInches ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >Total Inches</button>
              </div>

              {useInches ? (
                <InputField
                  label="Total Rise (floor-to-floor)"
                  value={riseIn}
                  onChange={setRiseIn}
                  unit="inches"
                  hint="Measure finished floor to finished floor"
                />
              ) : (
                <InputField
                  label="Floor-to-Floor Height"
                  value={riseFt}
                  onChange={setRiseFt}
                  unit="ft"
                  hint="Top of subfloor to top of subfloor (or finished-to-finished)"
                />
              )}
            </div>

            <InputField
              label="Stair Width (clear width)"
              value={stairWidth}
              onChange={setStairWidth}
              unit="in"
              hint="IRC R311.7.1: min 36 inches clear width"
            />

            <InputField
              label="Desired Tread Depth"
              value={treadDepth}
              onChange={setTreadDepthV}
              unit="in"
              hint="IRC R311.7.5.2: min 10 inches. Comfort: 10.5–11 inches"
              min={9}
              max={14}
              step={0.25}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <strong>IRC Stair Rules (R311.7):</strong>
              <ul className="mt-1 space-y-0.5 list-disc list-inside">
                <li>Max riser: 8.25" | Min riser: 4"</li>
                <li>Max variation between any two risers: 3/8"</li>
                <li>Min tread depth: 10" (with nosing) / 11" (without)</li>
                <li>Comfort formula: 2R + T = 24–25"</li>
                <li>Handrail required when 4+ risers</li>
                <li>Headroom: min 6'-8" clearance above tread nosings</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <Card title="Results">
              {/* Code compliance banner */}
              <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm font-medium
                ${result.codeCompliant
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                {result.codeCompliant
                  ? <><CheckCircle size={16} /> IRC Code Compliant</>
                  : <><AlertTriangle size={16} /> Check Warnings Below</>
                }
              </div>

              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Number of Risers" value={result.numberOfRisers} highlight />
                <ResultCard label="Riser Height"     value={`${result.riserHeight}"`} />
                <ResultCard label="Number of Treads" value={result.numberOfTreads}   />
                <ResultCard label="Tread Depth"      value={`${result.treadDepth}"`} />
              </div>
            </Card>

            <Card title="Run & Stringer">
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Total Horizontal Run" value={formatFtIn(result.totalRun)}  />
                <ResultCard label="Stringer Length"      value={`${result.stringerLength} ft`} highlight />
                <ResultCard label="Min Stringers"         value={result.minimumStringers}      unit="pcs"  small />
                <ResultCard label="Handrail Required"     value={result.handrailRequired ? 'Yes' : 'No'}  small />
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Use 2×12 KD lumber for stringers. Ensure minimum 3.5" of net solid lumber
                remains after cutting notches (IRC R311.7.10).
              </p>
            </Card>

            {result.warnings.length > 0 && (
              <Card>
                <div className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 bg-yellow-50 border border-yellow-200
                      rounded-lg p-3 text-sm text-yellow-800">
                      <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                      {w}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Step profile diagram */}
      {result && (
        <Card title="Step Profile (simplified side view)">
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${Math.min(maxSteps, 12) * 45 + 30} 160`}
              className="w-full max-h-44"
            >
              {/* Draw each step */}
              {Array.from({ length: Math.min(maxSteps, 12) }).map((_, i) => {
                const scale = 3.5;
                const treadPx = (result.treadDepth / 12) * 12 * scale;
                const riserPx = (result.riserHeight / 12) * 12 * scale;
                const x = 10 + i * treadPx;
                const yBase = 155;
                const yTop  = yBase - (i + 1) * riserPx;
                return (
                  <g key={i}>
                    {/* Riser */}
                    <line x1={x} y1={yBase - i * riserPx} x2={x} y2={yTop}
                      stroke="#f59e0b" strokeWidth="2"/>
                    {/* Tread */}
                    <line x1={x} y1={yTop} x2={x + treadPx} y2={yTop}
                      stroke="#f59e0b" strokeWidth="2"/>
                    {/* Ground under first step */}
                    {i === 0 && (
                      <line x1={10} y1={yBase} x2={10 + treadPx * Math.min(maxSteps, 12) + 10}
                        y2={yBase} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,2"/>
                    )}
                  </g>
                );
              })}
              {/* Labels */}
              <text x="15" y="25" fontSize="9" fill="#64748b">
                {result.numberOfRisers} risers × {result.riserHeight}"
              </text>
            </svg>
          </div>
        </Card>
      )}

      {!result && (
        <Card>
          <div className="text-center py-8 text-slate-400">
            <p className="text-5xl mb-3">📐</p>
            <p className="font-medium text-slate-500">Enter the floor-to-floor height above to calculate your stairs.</p>
            <p className="text-sm mt-1">Includes rise/run, stringer length, and IRC code compliance check.</p>
          </div>
        </Card>
      )}
    </div>
  );
}

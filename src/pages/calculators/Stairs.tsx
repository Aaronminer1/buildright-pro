import { useState, useMemo } from 'react';
import { Card, ResultCard } from '../../components/ui/Card';
import { InputField } from '../../components/ui/InputField';
import { calcStairs, formatFtIn } from '../../utils/calculations';
import { InfoBox } from '../../components/ui/InfoBox';
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
      <InfoBox title="🏠 Stair Anatomy: What Do These Terms Mean?" variant="blue" collapsible>
        <p>Building stairs sounds complicated, but there are really just a few parts to know:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          <div className="bg-white rounded p-2 border border-blue-200 text-xs">
            <div className="font-bold text-blue-800">Riser</div>
            <div className="text-slate-500">The vertical face of each step — how tall each step is. IRC code says max 8.25 inches per riser.</div>
          </div>
          <div className="bg-white rounded p-2 border border-blue-200 text-xs">
            <div className="font-bold text-blue-800">Tread</div>
            <div className="text-slate-500">The flat part you step on. Code requires min 10 inches deep. Deeper = more comfortable.</div>
          </div>
          <div className="bg-white rounded p-2 border border-blue-200 text-xs">
            <div className="font-bold text-blue-800">Stringer</div>
            <div className="text-slate-500">The angled side board that supports all the treads and risers. Usually cut from 2×12 lumber.</div>
          </div>
          <div className="bg-white rounded p-2 border border-blue-200 text-xs">
            <div className="font-bold text-blue-800">Total Rise</div>
            <div className="text-slate-500">The full height from one floor to the next — e.g., 8 feet for a typical floor.</div>
          </div>
          <div className="bg-white rounded p-2 border border-blue-200 text-xs">
            <div className="font-bold text-blue-800">Total Run</div>
            <div className="text-slate-500">How far the stairs extend horizontally along the floor.</div>
          </div>
          <div className="bg-white rounded p-2 border border-blue-200 text-xs">
            <div className="font-bold text-blue-800">Nosing</div>
            <div className="text-slate-500">The front edge of the tread that overhangs the riser. Makes stairs safer and easier to climb.</div>
          </div>
        </div>
        <p className="mt-2"><strong>The golden rule:</strong> 2 × Riser Height + Tread Depth = 24–25". This is the "comfort formula" used by every building code. If this number is off, stairs feel awkward to use.</p>
        <p><strong>What you need to enter:</strong> Just measure the height from the top of the floor below to the top of the floor above. That's your "floor-to-floor height." The calculator does the rest.</p>
      </InfoBox>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card title="Stair Calculator" subtitle="Based on IRC 2021 R311.7 code">
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
                  hint="Measure from the top of the lower floor to the top of the upper floor. Standard is 8 to 9 feet."
                />
              )}
            </div>

            <InputField
              label="Stair Width"
              value={stairWidth}
              onChange={setStairWidth}
              unit="in"
              hint="How wide are the stairs from side to side? Building code requires at least 36 inches (3 feet)."
            />

            <InputField
              label="Desired Tread Depth"
              value={treadDepth}
              onChange={setTreadDepthV}
              unit="in"
              hint="How deep each step is (front-to-back). More = more comfortable. Code minimum is 10 inches. Most homes use 10.5 or 11 inches."
              min={9}
              max={14}
              step={0.25}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
              <strong>Building Code Requirements (IRC R311.7):</strong>
              <ul className="mt-1 space-y-0.5 list-disc list-inside">
                <li>Each step (riser) must be max 8¼" tall — too tall is a trip hazard</li>
                <li>All steps must be the same height within ⅜" (uneven steps cause falls)</li>
                <li>Each tread (step surface) must be min 10" deep</li>
                <li>Comfort check: 2 × riser + tread = 24–25" (your results will show this)</li>
                <li>Handrail required when you have 4 or more steps</li>
                <li>Min 6'8" of headroom above every step</li>
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
                <ResultCard label="Number of Steps (risers)" value={result.numberOfRisers} highlight />
                <ResultCard label="Each Step is" value={`${result.riserHeight}"`} unit="tall" />
                <ResultCard label="Number of Treads" value={result.numberOfTreads} unit="flat surfaces" />
                <ResultCard label="Tread Depth" value={`${result.treadDepth}"`} unit="front-to-back" />
              </div>
            </Card>

            <Card title="Run &amp; Stringer Length">
              <div className="grid grid-cols-2 gap-3">
                <ResultCard label="Total Horizontal Run" value={formatFtIn(result.totalRun)} note="floor space stairs take up" />
                <ResultCard label="Stringer Length"      value={`${result.stringerLength} ft`} highlight note="length of angled side boards" />
                <ResultCard label="Stringers Needed"     value={result.minimumStringers} unit="pcs" small />
                <ResultCard label="Handrail Required"    value={result.handrailRequired ? '✅ Yes' : 'No'} small />
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Stringers are the angled side boards that carry all the weight. Use 2×12 lumber. The stringer length tells you how long each board needs to be.
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

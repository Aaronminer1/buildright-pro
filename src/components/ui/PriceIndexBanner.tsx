import { useEffect, useMemo, useState } from 'react';
import {
  fetchPriceIndexes,
  type PriceIndexEntry,
  type PriceIndexResult,
  type SeriesKey,
} from '../../services/blsPricing';

interface Props {
  /** Which BLS series to display */
  seriesKeys: readonly SeriesKey[];
  title?: string;
}

export function PriceIndexBanner({ seriesKeys, title = 'Market Price Trends (Live)' }: Props) {
  const [result, setResult] = useState<PriceIndexResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Stable dependency — only re-fetch if the list of keys actually changes
  const keysString = useMemo(() => seriesKeys.slice().sort().join(','), [seriesKeys]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPriceIndexes([...seriesKeys]).then((res) => {
      if (!cancelled) {
        setResult(res);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keysString]);

  if (loading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 animate-pulse">
        <div className="h-3 w-40 bg-slate-200 rounded mb-2" />
        <div className="grid grid-cols-3 gap-2">
          {seriesKeys.slice(0, 3).map((k) => (
            <div key={k} className="h-10 bg-slate-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // If the API failed or returned no data, render nothing (non-intrusive)
  if (!result || result.error || Object.keys(result.data).length === 0) {
    return null;
  }

  const items: PriceIndexEntry[] = seriesKeys
    .map((k) => result.data[k])
    .filter((x): x is PriceIndexEntry => x !== undefined);

  if (items.length === 0) return null;

  const period = items[0].period;

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-sky-800 uppercase tracking-wide">
          {title}
        </span>
        <span className="text-xs text-sky-400">BLS PPI · {period}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => {
          const pct = item.pctChange;
          const isUp   = pct !== null && pct > 0.5;
          const isDown = pct !== null && pct < -0.5;
          const colorClass = isUp
            ? 'text-red-600'
            : isDown
              ? 'text-emerald-700'
              : 'text-slate-500';
          const arrow = isUp ? '▲' : isDown ? '▼' : '▶';
          const sign  = isUp ? '+' : '';

          return (
            <div
              key={item.seriesKey}
              className="bg-white rounded border border-sky-100 px-2.5 py-1.5"
            >
              <div className="text-xs text-slate-500 leading-tight mb-0.5">
                {item.icon} {item.label}
              </div>
              <div className={`text-sm font-semibold ${colorClass}`}>
                {arrow}{' '}
                {pct !== null
                  ? `${sign}${pct.toFixed(1)}% YoY`
                  : `Index ${item.currentIndex.toFixed(0)}`}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-sky-400 mt-1.5">
        Year-over-year price index change · Base 1982=100 · Source: U.S. Bureau of Labor Statistics
      </p>
    </div>
  );
}

/**
 * BLS Producer Price Index (PPI) service for construction materials.
 *
 * Uses the free BLS Public Data API v2 — no API key required.
 * Rate limit: 25 requests/day unregistered; register at bls.gov for 500/day.
 *
 * Series reference:
 *   https://api.bls.gov/publicAPI/v2/timeseries/data/
 */

export const BLS_SERIES = {
  softwood_lumber: { id: 'WPU0811', label: 'Softwood Lumber',      icon: '🪵' },
  plywood:         { id: 'WPU083',  label: 'Plywood / OSB',        icon: '📋' },
  cement:          { id: 'WPU1322', label: 'Hydraulic Cement',     icon: '🏗️' },
  ready_mix:       { id: 'WPU1333', label: 'Ready-Mix Concrete',   icon: '🪨' },
  steel:           { id: 'WPU1017', label: 'Steel Mill Products',  icon: '⚙️' },
  gypsum:          { id: 'WPU1371', label: 'Gypsum Products',      icon: '🧱' },
} as const;

export type SeriesKey = keyof typeof BLS_SERIES;

export interface PriceIndexEntry {
  seriesKey: SeriesKey;
  label: string;
  icon: string;
  currentIndex: number;
  yearAgoIndex: number | null;
  /** Year-over-year % change, or null if prior-year data unavailable */
  pctChange: number | null;
  /** Human-readable period, e.g. "January 2026" */
  period: string;
}

export interface PriceIndexResult {
  data: Partial<Record<SeriesKey, PriceIndexEntry>>;
  error: string | null;
  fetchedAt: Date;
}

// ─── In-memory cache (1-hour TTL) ────────────────────────────────────────────
let _cache: { result: PriceIndexResult; expiry: number } | null = null;

// ─── Public API ───────────────────────────────────────────────────────────────
export async function fetchPriceIndexes(
  keys: SeriesKey[] = Object.keys(BLS_SERIES) as SeriesKey[],
): Promise<PriceIndexResult> {
  if (_cache && Date.now() < _cache.expiry) {
    return _cache.result;
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  try {
    const response = await fetch(
      '/api/bls',  // proxied through Vite dev server to avoid CORS
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seriesid: keys.map((k) => BLS_SERIES[k].id),
          startyear: String(currentYear - 1),
          endyear: String(currentYear),
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );

    if (!response.ok) throw new Error(`BLS API returned HTTP ${response.status}`);

    const json = await response.json() as {
      status: string;
      Results: { series: Array<{ seriesID: string; data: Array<{ year: string; period: string; periodName: string; value: string }> }> };
    };

    if (json.status !== 'REQUEST_SUCCEEDED') {
      throw new Error('BLS API reported failure');
    }

    // Build a map from series ID → latest + year-ago values
    const byId: Record<string, { currentIndex: number; yearAgoIndex: number | null; period: string }> = {};

    for (const series of json.Results.series ?? []) {
      const rows = [...(series.data ?? [])].sort((a, b) => {
        // Sort descending by "YYYYMNN" key
        const ka = `${a.year}${a.period}`;
        const kb = `${b.year}${b.period}`;
        return kb.localeCompare(ka);
      });

      if (rows.length === 0) continue;

      const latest = rows[0];
      const currentIndex = parseFloat(latest.value);
      const yearAgoYear = String(parseInt(latest.year, 10) - 1);
      const yearAgoRow = rows.find(
        (d) => d.year === yearAgoYear && d.period === latest.period,
      );

      byId[series.seriesID] = {
        currentIndex,
        yearAgoIndex: yearAgoRow ? parseFloat(yearAgoRow.value) : null,
        period: `${latest.periodName} ${latest.year}`,
      };
    }

    // Map back onto SeriesKey
    const resultData: Partial<Record<SeriesKey, PriceIndexEntry>> = {};
    for (const key of keys) {
      const entry = byId[BLS_SERIES[key].id];
      if (!entry) continue;

      const pctChange =
        entry.yearAgoIndex != null
          ? ((entry.currentIndex / entry.yearAgoIndex) - 1) * 100
          : null;

      resultData[key] = {
        seriesKey: key,
        label: BLS_SERIES[key].label,
        icon: BLS_SERIES[key].icon,
        currentIndex: entry.currentIndex,
        yearAgoIndex: entry.yearAgoIndex,
        pctChange,
        period: entry.period,
      };
    }

    const result: PriceIndexResult = { data: resultData, error: null, fetchedAt: now };
    _cache = { result, expiry: Date.now() + 60 * 60 * 1_000 }; // 1 hour
    return result;
  } catch (err) {
    return {
      data: {},
      error: err instanceof Error ? err.message : 'Failed to fetch pricing data',
      fetchedAt: now,
    };
  }
}

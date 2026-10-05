import React, { useState } from 'react';
import { SoraRateRecord } from '../types/sora';
import { formatPct } from '../utils/soraCalculator';
import { TrendingDown, Calendar, HelpCircle, Layers } from 'lucide-react';

interface HistoricalTrendProps {
  history: SoraRateRecord[];
  currentRates: SoraRateRecord;
}

export const HistoricalTrend: React.FC<HistoricalTrendProps> = ({ history, currentRates }) => {
  const [selectedBenchmarkView, setSelectedBenchmarkView] = useState<'3m' | '1m' | '6m'>('3m');

  const data = [...history].reverse(); // Oldest to newest
  const getVal = (rec: SoraRateRecord) => {
    if (selectedBenchmarkView === '1m') return rec.soraCompounded1M;
    if (selectedBenchmarkView === '6m') return rec.soraCompounded6M;
    return rec.soraCompounded3M;
  };

  const values = data.map(getVal);
  const minVal = Math.floor(Math.min(...values) * 10) / 10 - 0.2;
  const maxVal = Math.ceil(Math.max(...values) * 10) / 10 + 0.2;
  const range = Math.max(0.1, maxVal - minVal);

  const points = data.map((d, index) => {
    const x = (index / (data.length - 1 || 1)) * 100;
    const y = 100 - ((getVal(d) - minVal) / range) * 100;
    return { x, y, date: d.date, val: getVal(d) };
  });

  const svgPolyline = points.map((p) => `${p.x},${p.y}`).join(' ');
  const svgArea = `0,100 ${svgPolyline} 100,100`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
            <TrendingDown className="w-4 h-4 text-emerald-600" />
            MAS Historical SORA Trend
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical progression of Monetary Authority of Singapore compounded benchmark rates.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setSelectedBenchmarkView('1m')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedBenchmarkView === '1m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            1M SORA
          </button>
          <button
            type="button"
            onClick={() => setSelectedBenchmarkView('3m')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedBenchmarkView === '3m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            3M SORA
          </button>
          <button
            type="button"
            onClick={() => setSelectedBenchmarkView('6m')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              selectedBenchmarkView === '6m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            6M SORA
          </button>
        </div>
      </div>

      {/* SVG Trend Chart */}
      <div className="relative pt-2 pb-4">
        <div className="h-44 w-full relative">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="soraGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid horizontal lines */}
            {[0, 25, 50, 75, 100].map((lineY) => (
              <line
                key={lineY}
                x1="0"
                y1={lineY}
                x2="100"
                y2={lineY}
                stroke="#f1f5f9"
                strokeWidth="0.8"
              />
            ))}

            {/* Area */}
            <polygon points={svgArea} fill="url(#soraGrad)" />

            {/* Polyline */}
            <polyline
              points={svgPolyline}
              fill="none"
              stroke="#059669"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, idx) => (
              <circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="2"
                fill="#ffffff"
                stroke="#059669"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>

        {/* Labels along timeline */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
          <span>{data[0]?.date || 'Past'}</span>
          <span>{data[Math.floor(data.length / 2)]?.date}</span>
          <span className="font-bold text-slate-700">{data[data.length - 1]?.date || 'Latest'}</span>
        </div>
      </div>

      {/* SORA Key Mechanics Educational Callout */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <HelpCircle className="w-3.5 h-3.5 text-slate-600" />
          <span>Understanding SORA in Singapore Home Loans</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] leading-relaxed">
          <div>
            <span className="font-semibold text-slate-800 block">Compounded in Arrears:</span>
            Unlike SIBOR which was forward-looking, SORA is calculated by MAS from actual interbank transactions, eliminating market manipulation.
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">3-Month Reset Cycle:</span>
            Your loan interest rate stays locked for 3-month windows, then resets based on the average MAS 3M SORA rate on that date.
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Transparency:</span>
            Published daily by MAS at 9:00 AM SGT on the MAS official website and data API feeds.
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { SoraBenchmarkType, SoraRateRecord } from '../types/sora';
import { formatPct } from '../utils/soraCalculator';
import { TrendingUp, Info } from 'lucide-react';

interface RateBarProps {
  selectedBenchmark: SoraBenchmarkType;
  customRate: number;
  rates: SoraRateRecord;
  onSelectBenchmark: (type: SoraBenchmarkType) => void;
  onChangeCustomRate: (rate: number) => void;
  lastUpdatedDate: string;
}

export const RateBar: React.FC<RateBarProps> = ({
  selectedBenchmark,
  customRate,
  rates,
  onSelectBenchmark,
  onChangeCustomRate,
  lastUpdatedDate,
}) => {
  const benchmarkOptions: { type: SoraBenchmarkType; label: string; rate: number; desc: string; popular?: boolean }[] = [
    {
      type: '3m_compounded',
      label: '3M Compounded SORA',
      rate: rates.soraCompounded3M,
      desc: 'Most common Singapore home loan peg (DBS, OCBC, UOB)',
      popular: true,
    },
    {
      type: '1m_compounded',
      label: '1M Compounded SORA',
      rate: rates.soraCompounded1M,
      desc: 'Reflects short-term rate movements faster',
    },
    {
      type: '6m_compounded',
      label: '6M Compounded SORA',
      rate: rates.soraCompounded6M,
      desc: 'Semi-annual rate resetting schedule',
    },
    {
      type: 'daily',
      label: 'Daily SORA',
      rate: rates.sora,
      desc: 'Volume-weighted overnight rate',
    },
    {
      type: 'custom',
      label: 'Custom Rate',
      rate: customRate,
      desc: 'Manual interest rate override',
    },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-400">
            MAS Benchmark Reference Rates
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Select the SORA benchmark used by your bank package. Published by MAS as of {lastUpdatedDate}.
          </p>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-1.5 self-start sm:self-auto">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Compounded rates eliminate daily volatility</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 pt-3">
        {benchmarkOptions.map((opt) => {
          const isSelected = selectedBenchmark === opt.type;
          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelectBenchmark(opt.type)}
              className={`text-left p-3 rounded-lg border transition-all relative ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500 shadow-inner'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              {opt.popular && (
                <span className="absolute top-2 right-2 text-[10px] font-medium text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                  Most Popular
                </span>
              )}
              <div className="text-xs font-medium text-slate-300 truncate pr-6">{opt.label}</div>
              <div className="mt-1 flex items-baseline gap-1">
                {opt.type === 'custom' ? (
                  <div className="flex items-center gap-1 mt-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="15"
                      value={customRate}
                      onChange={(e) => {
                        onChangeCustomRate(parseFloat(e.target.value) || 0);
                        onSelectBenchmark('custom');
                      }}
                      className="w-16 px-1.5 py-0.5 text-base font-bold bg-slate-950 border border-slate-700 rounded text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-sm font-semibold text-slate-300">%</span>
                  </div>
                ) : (
                  <span className="text-xl font-bold tracking-tight text-white">{formatPct(opt.rate)}</span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{opt.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

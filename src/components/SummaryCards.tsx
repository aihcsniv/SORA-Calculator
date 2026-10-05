import React from 'react';
import { CalculationResult, LoanInputState, SoraBenchmarkType, SoraRateRecord } from '../types/sora';
import { formatPct, formatSGD, getBenchmarkLabel, getBenchmarkRate } from '../utils/soraCalculator';
import { Percent, DollarSign, Calendar, ShieldCheck } from 'lucide-react';

interface SummaryCardsProps {
  result: CalculationResult;
  input: LoanInputState;
  rates: SoraRateRecord;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ result, input, rates }) => {
  const benchmarkRate = getBenchmarkRate(input.selectedBenchmark, rates, input.customSoraRate);
  const benchmarkName = getBenchmarkLabel(input.selectedBenchmark);

  const firstMonth = result.amortizationMonthly[0] || { interestPayment: 0, principalPayment: 0 };
  const principalPct = result.totalPayment > 0 ? (result.totalPrincipal / result.totalPayment) * 100 : 0;
  const interestPct = result.totalPayment > 0 ? (result.totalInterest / result.totalPayment) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Primary Hero Result Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Estimated Monthly Installment
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-mono">
                {formatSGD(result.initialMonthlyPayment)}
              </span>
              <span className="text-xs font-medium text-slate-500">/ month</span>
            </div>
          </div>

          <div className="mt-2 sm:mt-0 text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Effective All-in Rate</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono">
              {formatPct(result.currentEffectiveRate)}
            </div>
          </div>
        </div>

        {/* Rate Breakdown Equation */}
        <div className="mt-3 bg-slate-50 rounded-lg p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-slate-600">{benchmarkName}:</span>
            <span className="font-bold text-slate-900">{formatPct(benchmarkRate)}</span>
            <span className="text-slate-400">+</span>
            <span className="font-medium text-slate-600">Bank Spread:</span>
            <span className="font-bold text-slate-900">
              +{formatPct(result.currentEffectiveRate - benchmarkRate)}
            </span>
            <span className="text-slate-400">=</span>
            <span className="font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
              {formatPct(result.currentEffectiveRate)} p.a.
            </span>
          </div>

          <div className="text-slate-500 text-[11px]">
            Based on {input.tenureYears} years ({input.tenureYears * 12} installments)
          </div>
        </div>

        {/* First Month Split */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 rounded bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Month 1 Principal Paid</span>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {formatSGD(firstMonth.principalPayment)}
            </span>
          </div>
          <div className="p-2.5 rounded bg-slate-50/70 border border-slate-100">
            <span className="text-slate-500 block text-[11px]">Month 1 Interest Paid</span>
            <span className="text-sm font-bold text-amber-700 font-mono">
              {formatSGD(firstMonth.interestPayment)}
            </span>
          </div>
        </div>
      </div>

      {/* Lifetime Loan Statistics */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Loan Lifetime Cost Breakdown
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {input.tenureYears} Years Amortization
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 block">Total Principal</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {formatSGD(result.totalPrincipal)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {principalPct.toFixed(1)}% of total payment
            </span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 block">Total Interest Cost</span>
            <span className="text-base font-bold text-amber-700 font-mono">
              {formatSGD(result.totalInterest)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {interestPct.toFixed(1)}% of total payment
            </span>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <span className="text-[11px] text-slate-500 block">Total Amount Repaid</span>
            <span className="text-base font-bold text-slate-900 font-mono">
              {formatSGD(result.totalPayment)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Principal + Interest
            </span>
          </div>
        </div>

        {/* Visual Bar of Principal vs Interest */}
        <div>
          <div className="flex justify-between text-xs text-slate-600 mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-800 inline-block"></span>
              Principal: {formatSGD(result.totalPrincipal)} ({principalPct.toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block"></span>
              Interest: {formatSGD(result.totalInterest)} ({interestPct.toFixed(0)}%)
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${principalPct}%` }}
              className="bg-slate-800 transition-all duration-500"
            />
            <div
              style={{ width: `${interestPct}%` }}
              className="bg-amber-500 transition-all duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { CalculationResult, LoanInputState, SoraRateRecord } from '../types/sora';
import { calculateMonthlyPayment, formatPct, formatSGD, getBenchmarkRate } from '../utils/soraCalculator';
import { AlertCircle, CheckCircle, ShieldAlert, TrendingUp } from 'lucide-react';

interface StressTestPanelProps {
  result: CalculationResult;
  input: LoanInputState;
  rates: SoraRateRecord;
}

export const StressTestPanel: React.FC<StressTestPanelProps> = ({ result, input, rates }) => {
  const [customStressRate, setCustomStressRate] = useState<number>(result.masStressRate);
  const benchmarkRate = getBenchmarkRate(input.selectedBenchmark, rates, input.customSoraRate);
  const totalMonths = input.tenureYears * 12;

  // Rate shock scenarios
  const shocks = [-0.5, -0.25, 0, 0.25, 0.5, 1.0, 1.5, 2.0];

  const minRequiredIncomeForTdsr = (result.stressMonthlyPayment + input.otherCommitments) / 0.55;
  const minRequiredIncomeForMsr = result.stressMonthlyPayment / 0.30;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              MAS Regulatory Stress Test &amp; TDSR Verification
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monetary Authority of Singapore (MAS) requires financial institutions to test affordability at a medium-term floor rate.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <span className="text-slate-500 font-medium">MAS Floor Rate:</span>
          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded border border-amber-200">
            {formatPct(result.masStressRate)} p.a.
          </span>
        </div>
      </div>

      {/* Stress Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Stress Installment */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500 block">Stress Monthly Installment</span>
          <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
            {formatSGD(result.stressMonthlyPayment)}
          </div>
          <div className="text-[11px] text-amber-700 mt-1 font-medium flex items-center gap-1">
            <span>
              +{formatSGD(result.stressPaymentDifference)}/mo (+{((result.stressPaymentDifference / result.initialMonthlyPayment) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* TDSR Ratio */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">TDSR (Limit 55%)</span>
            {result.tdsrCompliant ? (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Compliant
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded">
                Exceeded
              </span>
            )}
          </div>
          <div className="text-xl font-bold font-mono mt-0.5 text-slate-900">
            {result.stressTdsrRatio.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Min gross income needed: {formatSGD(minRequiredIncomeForTdsr)}
          </span>
        </div>

        {/* HDB MSR or Income Buffer */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {input.propertyType === 'hdb' ? 'HDB MSR (Limit 30%)' : 'Monthly Income Buffer'}
            </span>
            {input.propertyType === 'hdb' && (
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  result.msrCompliant
                    ? 'text-emerald-700 bg-emerald-100'
                    : 'text-red-700 bg-red-100'
                }`}
              >
                {result.msrCompliant ? 'Compliant' : 'Exceeded'}
              </span>
            )}
          </div>
          <div className="text-xl font-bold font-mono mt-0.5 text-slate-900">
            {input.propertyType === 'hdb'
              ? `${((result.stressMonthlyPayment / Math.max(1, input.monthlyBorrowerIncome)) * 100).toFixed(1)}%`
              : formatSGD(Math.max(0, input.monthlyBorrowerIncome - result.stressMonthlyPayment - input.otherCommitments))}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {input.propertyType === 'hdb'
              ? `Min gross income needed: ${formatSGD(minRequiredIncomeForMsr)}`
              : 'Disposable income after loan & debt'}
          </span>
        </div>
      </div>

      {/* SORA Rate Sensitivity Matrix */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            SORA Rate Shock Sensitivity Matrix
          </span>
          <span className="text-[11px] text-slate-400">
            Impact on monthly repayments if market rates move
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Rate Movement</th>
                <th className="py-2.5 px-3">Hypothetical SORA</th>
                <th className="py-2.5 px-3">All-In Rate (p.a.)</th>
                <th className="py-2.5 px-3">Monthly Payment</th>
                <th className="py-2.5 px-3">Difference vs Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {shocks.map((delta) => {
                const isBase = delta === 0;
                const simulatedSora = Math.max(0.1, benchmarkRate + delta);
                const simulatedAllIn = simulatedSora + input.flatSpread;
                const payment = calculateMonthlyPayment(input.loanAmount, simulatedAllIn, totalMonths);
                const diff = payment - result.initialMonthlyPayment;

                return (
                  <tr
                    key={delta}
                    className={`transition-colors ${
                      isBase
                        ? 'bg-emerald-50/60 font-semibold text-emerald-950'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <td className="py-2 px-3 font-sans font-medium">
                      {isBase ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                          Current Rate (Base)
                        </span>
                      ) : delta > 0 ? (
                        <span className="text-red-600">+{delta.toFixed(2)}%</span>
                      ) : (
                        <span className="text-emerald-600">{delta.toFixed(2)}%</span>
                      )}
                    </td>
                    <td className="py-2 px-3">{formatPct(simulatedSora)}</td>
                    <td className="py-2 px-3">{formatPct(simulatedAllIn)}</td>
                    <td className="py-2 px-3 font-bold">{formatSGD(payment)}</td>
                    <td className="py-2 px-3 font-medium">
                      {isBase ? (
                        <span className="text-slate-400">-</span>
                      ) : diff > 0 ? (
                        <span className="text-red-600">+{formatSGD(diff)}</span>
                      ) : (
                        <span className="text-emerald-600">-{formatSGD(Math.abs(diff))}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

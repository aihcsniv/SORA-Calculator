import React, { useState } from 'react';
import { AmortizationRow, AmortizationYearSummary } from '../types/sora';
import { formatPct, formatSGD } from '../utils/soraCalculator';
import { Download, ChevronRight, ChevronDown, Sparkles, DollarSign } from 'lucide-react';

interface AmortizationTableProps {
  monthly: AmortizationRow[];
  yearly: AmortizationYearSummary[];
  loanAmount: number;
  onExportCsv: () => void;
}

export const AmortizationTable: React.FC<AmortizationTableProps> = ({
  monthly,
  yearly,
  loanAmount,
  onExportCsv,
}) => {
  const [viewMode, setViewMode] = useState<'yearly' | 'monthly'>('yearly');
  const [selectedYearFilter, setSelectedYearFilter] = useState<number | 'all'>('all');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Prepayment simulation state
  const [showPrepayment, setShowPrepayment] = useState<boolean>(false);
  const [prepayAmount, setPrepayAmount] = useState<number>(30000);
  const [prepayAtYear, setPrepayAtYear] = useState<number>(3);

  // Prepayment savings estimate
  const estimatedInterestSavings = prepayAmount * 0.038 * Math.max(1, yearly.length - prepayAtYear);

  const filteredMonthly = selectedYearFilter === 'all'
    ? monthly
    : monthly.filter((m) => m.year === selectedYearFilter);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Amortization &amp; Repayment Schedule
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed breakdown of monthly and annual principal reduction over time.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Prepayment Toggle */}
          <button
            type="button"
            onClick={() => setShowPrepayment(!showPrepayment)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors flex items-center gap-1.5 ${
              showPrepayment
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Prepayment Tool</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode('yearly')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                viewMode === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual Summary
            </button>
            <button
              type="button"
              onClick={() => setViewMode('monthly')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Table
            </button>
          </div>

          <button
            type="button"
            onClick={onExportCsv}
            className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Prepayment Scenario Card */}
      {showPrepayment && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-950 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              Lump Sum Capital Prepayment Impact
            </span>
            <span className="text-[11px] text-amber-800">
              Singapore bank lock-in periods typically expire after Year 2 or 3
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-medium text-amber-900 block mb-1">
                Lump Sum Amount (SGD)
              </label>
              <input
                type="number"
                step="5000"
                min="5000"
                value={prepayAmount}
                onChange={(e) => setPrepayAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded bg-white font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-amber-900 block mb-1">
                Make Prepayment At
              </label>
              <select
                value={prepayAtYear}
                onChange={(e) => setPrepayAtYear(parseInt(e.target.value))}
                className="w-full px-2.5 py-1 text-xs border border-amber-300 rounded bg-white"
              >
                {yearly.map((y) => (
                  <option key={y.year} value={y.year}>
                    End of Year {y.year} (Month {y.year * 12})
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white p-2.5 rounded border border-amber-200 flex flex-col justify-center">
              <span className="text-[10px] text-amber-800 font-medium">Estimated Interest Savings</span>
              <span className="text-base font-bold text-amber-900 font-mono">
                ~{formatSGD(estimatedInterestSavings)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Yearly View */}
      {viewMode === 'yearly' && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Principal Paid</th>
                <th className="py-2.5 px-3">Interest Paid</th>
                <th className="py-2.5 px-3">Total Paid</th>
                <th className="py-2.5 px-3">Effective Rate</th>
                <th className="py-2.5 px-3 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {yearly.map((row) => (
                <tr key={row.year} className="hover:bg-slate-50 transition-colors text-slate-700">
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">
                    Year {row.year}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium">{formatSGD(row.principalPaid)}</td>
                  <td className="py-2.5 px-3 text-amber-700 font-medium">{formatSGD(row.interestPaid)}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{formatSGD(row.totalPaid)}</td>
                  <td className="py-2.5 px-3 text-slate-600">{formatPct(row.effectiveRate)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                    {formatSGD(row.endingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly View */}
      {viewMode === 'monthly' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Showing {filteredMonthly.length} installments
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Filter Year:</span>
              <select
                value={selectedYearFilter}
                onChange={(e) =>
                  setSelectedYearFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))
                }
                className="px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800"
              >
                <option value="all">All Years</option>
                {yearly.map((y) => (
                  <option key={y.year} value={y.year}>
                    Year {y.year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                <tr>
                  <th className="py-2 px-3">Month</th>
                  <th className="py-2 px-3">Beginning Balance</th>
                  <th className="py-2 px-3">Principal</th>
                  <th className="py-2 px-3">Interest</th>
                  <th className="py-2 px-3">Total Installment</th>
                  <th className="py-2 px-3 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredMonthly.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-50 transition-colors text-slate-700">
                    <td className="py-2 px-3 font-sans font-medium">
                      M{m.month} (Y{m.year})
                    </td>
                    <td className="py-2 px-3 text-slate-600">{formatSGD(m.beginningBalance)}</td>
                    <td className="py-2 px-3 text-slate-900 font-medium">{formatSGD(m.principalPayment)}</td>
                    <td className="py-2 px-3 text-amber-700">{formatSGD(m.interestPayment)}</td>
                    <td className="py-2 px-3 font-bold text-slate-900">{formatSGD(m.totalPayment)}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      {formatSGD(m.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

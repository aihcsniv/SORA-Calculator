import React, { useState } from 'react';
import { X, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { CalculationResult, LoanInputState } from '../types/sora';
import { calculateMonthlyPayment, formatPct, formatSGD } from '../utils/soraCalculator';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseResult: CalculationResult;
  input: LoanInputState;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  baseResult,
  input,
}) => {
  if (!isOpen) return null;

  const [compareType, setCompareType] = useState<'fixed' | 'sora_alt'>('fixed');
  const [fixedRate, setFixedRate] = useState<number>(2.90);
  const [lockInYears, setLockInYears] = useState<number>(2);
  const [altSpread, setAltSpread] = useState<number>(0.60);

  const totalMonths = input.tenureYears * 12;

  // Comparison calculations
  const comparisonRate = compareType === 'fixed'
    ? fixedRate
    : (baseResult.currentEffectiveRate - input.flatSpread + altSpread);

  const compMonthlyPayment = calculateMonthlyPayment(input.loanAmount, comparisonRate, totalMonths);
  const monthlyDifference = compMonthlyPayment - baseResult.initialMonthlyPayment;
  const lockInMonths = lockInYears * 12;
  const savingsOverLockIn = Math.abs(monthlyDifference) * lockInMonths;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Loan Package Comparison
            </h2>
            <p className="text-xs text-slate-500">
              Compare your current SORA loan against a Fixed Rate or alternative bank package
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Comparison Mode Selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setCompareType('fixed')}
              className={`flex-1 py-1.5 rounded-md font-medium text-xs transition-colors ${
                compareType === 'fixed'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current SORA vs Fixed Rate Loan
            </button>
            <button
              type="button"
              onClick={() => setCompareType('sora_alt')}
              className={`flex-1 py-1.5 rounded-md font-medium text-xs transition-colors ${
                compareType === 'sora_alt'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Current SORA vs Alt SORA Spread
            </button>
          </div>

          {/* Form controls for comparison */}
          {compareType === 'fixed' ? (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Fixed Package Rate (p.a.)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    step="0.05"
                    min="1.0"
                    max="8.0"
                    value={fixedRate}
                    onChange={(e) => setFixedRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-sm"
                  />
                  <span className="font-semibold text-slate-500">%</span>
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Fixed Lock-in Period
                </label>
                <select
                  value={lockInYears}
                  onChange={(e) => setLockInYears(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-sm"
                >
                  <option value={1}>1 Year Fixed</option>
                  <option value={2}>2 Years Fixed (Most Common)</option>
                  <option value={3}>3 Years Fixed</option>
                  <option value={5}>5 Years Fixed</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Alternative Bank Spread
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-slate-500">SORA +</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="3.0"
                    value={altSpread}
                    onChange={(e) => setAltSpread(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white font-mono text-sm"
                  />
                  <span className="font-semibold text-slate-500">%</span>
                </div>
              </div>
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Comparison Horizon
                </label>
                <select
                  value={lockInYears}
                  onChange={(e) => setLockInYears(parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-sm"
                >
                  <option value={2}>2 Years</option>
                  <option value={3}>3 Years</option>
                  <option value={5}>5 Years</option>
                </select>
              </div>
            </div>
          )}

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-lg p-3.5 bg-white">
              <span className="text-[11px] text-slate-500 block font-medium">Your SORA Package</span>
              <div className="text-base font-bold text-slate-900 font-mono mt-1">
                {formatPct(baseResult.currentEffectiveRate)}
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-2">
                {formatSGD(baseResult.initialMonthlyPayment)}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Floats with MAS 3M/1M SORA resets
              </span>
            </div>

            <div className="border border-emerald-200 rounded-lg p-3.5 bg-emerald-50/40">
              <span className="text-[11px] text-emerald-800 block font-medium">
                {compareType === 'fixed' ? 'Fixed Rate Package' : 'Alternative SORA Package'}
              </span>
              <div className="text-base font-bold text-emerald-700 font-mono mt-1">
                {formatPct(comparisonRate)}
              </div>
              <div className="text-xl font-bold font-mono text-emerald-800 mt-2">
                {formatSGD(compMonthlyPayment)}
                <span className="text-xs font-normal text-slate-500">/mo</span>
              </div>
              <span className="text-[10px] text-emerald-700 block mt-1">
                {compareType === 'fixed' ? `Guaranteed for ${lockInYears} years` : 'With lower/different spread'}
              </span>
            </div>
          </div>

          {/* Outcome Summary Banner */}
          <div className="p-3.5 rounded-lg bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">
                {monthlyDifference < 0 ? 'Fixed Rate Saves You' : 'SORA Package Saves You'}
              </span>
              <div className="text-lg font-bold font-mono text-emerald-400">
                {formatSGD(Math.abs(monthlyDifference))}/month
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">
                Total over {lockInYears} years
              </span>
              <div className="text-lg font-bold font-mono text-white">
                ~{formatSGD(savingsOverLockIn)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-xs transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};

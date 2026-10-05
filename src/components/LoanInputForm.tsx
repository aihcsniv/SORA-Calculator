import React from 'react';
import { Home, Building2, Landmark, Briefcase, Plus, Trash2 } from 'lucide-react';
import { BankSpreadTier, LoanInputState, SoraBenchmarkType } from '../types/sora';
import { formatSGD } from '../utils/soraCalculator';

interface LoanInputFormProps {
  input: LoanInputState;
  onChange: (updated: Partial<LoanInputState>) => void;
}

export const LoanInputForm: React.FC<LoanInputFormProps> = ({ input, onChange }) => {
  const propertyTypes = [
    { id: 'hdb', label: 'HDB Flat', icon: Home, maxTenure: 30, maxLtv: '75%' },
    { id: 'condo', label: 'Condo / Private', icon: Building2, maxTenure: 30, maxLtv: '75%' },
    { id: 'landed', label: 'Landed Property', icon: Landmark, maxTenure: 35, maxLtv: '75%' },
    { id: 'commercial', label: 'Commercial', icon: Briefcase, maxTenure: 30, maxLtv: '80%' },
  ] as const;

  const presets = [
    { label: 'HDB BTO/Resale ($550k · 25y)', type: 'hdb', amount: 550000, tenure: 25, spread: 0.70 },
    { label: 'Condo New/Resale ($1.4M · 30y)', type: 'condo', amount: 1400000, tenure: 30, spread: 0.65 },
    { label: 'Landed ($2.8M · 30y)', type: 'landed', amount: 2800000, tenure: 30, spread: 0.60 },
    { label: 'Refinancing ($750k · 20y)', type: 'condo', amount: 750000, tenure: 20, spread: 0.75 },
  ] as const;

  const handleAddTier = () => {
    const lastTier = input.tiers[input.tiers.length - 1];
    const newStart = lastTier ? lastTier.endMonth + 1 : 13;
    const newTier: BankSpreadTier = {
      id: Math.random().toString(36).substring(7),
      name: `Year ${Math.ceil(newStart / 12)}+`,
      startMonth: newStart,
      endMonth: 999,
      spread: 0.85,
    };
    onChange({
      tiers: [...input.tiers, newTier],
    });
  };

  const handleRemoveTier = (index: number) => {
    const updated = input.tiers.filter((_, i) => i !== index);
    onChange({ tiers: updated });
  };

  const handleUpdateTierSpread = (index: number, newSpread: number) => {
    const updated = [...input.tiers];
    updated[index] = { ...updated[index], spread: newSpread };
    onChange({ tiers: updated });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-6">
      {/* Property Type Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Property Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {propertyTypes.map((prop) => {
            const Icon = prop.icon;
            const isSelected = input.propertyType === prop.id;
            return (
              <button
                key={prop.id}
                type="button"
                onClick={() => {
                  const maxAllowed = prop.maxTenure;
                  onChange({
                    propertyType: prop.id,
                    tenureYears: Math.min(input.tenureYears, maxAllowed),
                  });
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border text-center transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                <span className="text-xs font-semibold">{prop.label}</span>
                <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  Max {prop.maxTenure} yrs · LTV {prop.maxLtv}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="text-[11px] font-medium text-slate-400 mb-1.5">Quick Presets:</div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onChange({
                  propertyType: preset.type as any,
                  loanAmount: preset.amount,
                  tenureYears: preset.tenure,
                  flatSpread: preset.spread,
                });
              }}
              className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors font-medium"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loan Amount & Tenure */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Loan Amount (SGD)</label>
            <span className="text-sm font-bold text-slate-900 font-mono">
              {formatSGD(input.loanAmount)}
            </span>
          </div>
          <input
            type="number"
            step="10000"
            min="50000"
            max="20000000"
            value={input.loanAmount}
            onChange={(e) => onChange({ loanAmount: Math.max(0, parseFloat(e.target.value) || 0) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 mb-2"
          />
          <input
            type="range"
            min="100000"
            max="3000000"
            step="25000"
            value={input.loanAmount}
            onChange={(e) => onChange({ loanAmount: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>$100k</span>
            <span>$1.5M</span>
            <span>$3M+</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700">Loan Tenure</label>
            <span className="text-sm font-bold text-slate-900">
              {input.tenureYears} Years ({input.tenureYears * 12} Months)
            </span>
          </div>
          <input
            type="number"
            min="5"
            max={input.propertyType === 'landed' ? 35 : 30}
            value={input.tenureYears}
            onChange={(e) => onChange({ tenureYears: Math.max(1, parseInt(e.target.value) || 1) })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 mb-2"
          />
          <input
            type="range"
            min="5"
            max={input.propertyType === 'landed' ? 35 : 30}
            step="1"
            value={input.tenureYears}
            onChange={(e) => onChange({ tenureYears: Number(e.target.value) })}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>5 yrs</span>
            <span>20 yrs</span>
            <span>{input.propertyType === 'landed' ? '35 yrs' : '30 yrs'}</span>
          </div>
        </div>
      </div>

      {/* Bank Spread Configuration */}
      <div className="pt-2 border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bank Margin / Spread (% p.a.)
            </label>
            <p className="text-xs text-slate-500">
              Banks charge a spread added on top of the SORA benchmark.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => onChange({ isTieredSpread: false })}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                !input.isTieredSpread
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flat Spread
            </button>
            <button
              type="button"
              onClick={() => onChange({ isTieredSpread: true })}
              className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                input.isTieredSpread
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tiered Rate Package
            </button>
          </div>
        </div>

        {!input.isTieredSpread ? (
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-700">Bank Spread (p.a.)</span>
              <div className="text-[11px] text-slate-500">Typical packages range from +0.60% to +0.85%</div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-1.5">
                {[0.60, 0.65, 0.70, 0.75, 0.80].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onChange({ flatSpread: s })}
                    className={`text-xs px-2 py-1 rounded border font-medium transition-colors ${
                      input.flatSpread === s
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +{s.toFixed(2)}%
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="5"
                  value={input.flatSpread}
                  onChange={(e) => onChange({ flatSpread: parseFloat(e.target.value) || 0 })}
                  className="w-16 px-2 py-1 text-sm font-semibold border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900"
                />
                <span className="text-xs font-medium text-slate-500">%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="text-xs text-slate-600 mb-2">
              Configure multi-year packages (e.g., Year 1: +0.60%, Year 2: +0.65%, Year 3+: +0.80%)
            </div>
            {input.tiers.map((tier, idx) => (
              <div key={tier.id} className="flex items-center justify-between gap-3 bg-white p-2.5 rounded border border-slate-200 text-xs">
                <div className="font-medium text-slate-800">{tier.name}</div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">SORA +</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="5"
                    value={tier.spread}
                    onChange={(e) => handleUpdateTierSpread(idx, parseFloat(e.target.value) || 0)}
                    className="w-16 px-1.5 py-0.5 text-xs font-bold border border-slate-300 rounded text-slate-900 focus:outline-none focus:border-slate-900 text-right"
                  />
                  <span className="text-slate-600 font-semibold">%</span>
                  {input.tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove Tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {input.tiers.length < 4 && (
              <button
                type="button"
                onClick={handleAddTier}
                className="mt-2 text-xs font-medium text-slate-700 hover:text-slate-900 flex items-center gap-1 px-2.5 py-1 border border-dashed border-slate-300 rounded hover:border-slate-400 bg-white"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Year Tier</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Borrower Eligibility & TDSR Setup */}
      <div className="pt-2 border-t border-slate-200">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          MAS TDSR / MSR Borrower Qualification
        </label>
        <p className="text-xs text-slate-500 mb-3">
          MAS enforces a 55% Total Debt Servicing Ratio (TDSR) limit and 30% Mortgage Servicing Ratio (MSR) for HDB.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Gross Monthly Income (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-medium text-slate-400">S$</span>
              <input
                type="number"
                step="500"
                min="1000"
                value={input.monthlyBorrowerIncome}
                onChange={(e) => onChange({ monthlyBorrowerIncome: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-slate-900 font-medium text-sm focus:outline-none focus:border-slate-900"
                placeholder="8000"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-700 block mb-1">
              Other Monthly Debt (Car loans, cards)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-medium text-slate-400">S$</span>
              <input
                type="number"
                step="100"
                min="0"
                value={input.otherCommitments}
                onChange={(e) => onChange({ otherCommitments: parseFloat(e.target.value) || 0 })}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded text-slate-900 font-medium text-sm focus:outline-none focus:border-slate-900"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

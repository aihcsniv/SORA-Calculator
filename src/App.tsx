import React, { useEffect, useState, useMemo } from 'react';
import { LoanInputState, MasApiResponse, SoraBenchmarkType } from './types/sora';
import {
  fetchMasSoraRates,
  VERIFIED_HISTORICAL_RATES,
  VERIFIED_MAS_BENCHMARK_RATES,
} from './services/masApi';
import { calculateLoan, exportAmortizationToCsv } from './utils/soraCalculator';
import { Header } from './components/Header';
import { RateBar } from './components/RateBar';
import { LoanInputForm } from './components/LoanInputForm';
import { SummaryCards } from './components/SummaryCards';
import { StressTestPanel } from './components/StressTestPanel';
import { HistoricalTrend } from './components/HistoricalTrend';
import { AmortizationTable } from './components/AmortizationTable';
import { MasApiModal } from './components/MasApiModal';
import { ComparisonModal } from './components/ComparisonModal';

const INITIAL_LOAN_INPUT: LoanInputState = {
  propertyType: 'condo',
  loanAmount: 1000000,
  tenureYears: 25,
  selectedBenchmark: '3m_compounded',
  customSoraRate: 3.05,
  isTieredSpread: false,
  flatSpread: 0.70,
  tiers: [
    { id: '1', name: 'Year 1 - 2', startMonth: 1, endMonth: 24, spread: 0.65 },
    { id: '2', name: 'Year 3 onwards', startMonth: 25, endMonth: 999, spread: 0.85 },
  ],
  monthlyBorrowerIncome: 12000,
  otherCommitments: 800,
};

export default function App() {
  const [apiResponse, setApiResponse] = useState<MasApiResponse>({
    success: true,
    source: 'fallback_snapshot',
    lastUpdated: VERIFIED_MAS_BENCHMARK_RATES.date,
    rates: VERIFIED_MAS_BENCHMARK_RATES,
    historical: VERIFIED_HISTORICAL_RATES,
  });

  const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);
  const [loanInput, setLoanInput] = useState<LoanInputState>(INITIAL_LOAN_INPUT);

  // Modals
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Load latest MAS rates on initial launch
  const loadRates = async () => {
    setIsFetchingApi(true);
    try {
      const res = await fetchMasSoraRates();
      setApiResponse(res);
    } catch (e) {
      console.error('Failed to sync MAS rates:', e);
    } finally {
      setIsFetchingApi(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, []);

  // Compute loan results
  const calculationResult = useMemo(() => {
    return calculateLoan(loanInput, apiResponse.rates);
  }, [loanInput, apiResponse.rates]);

  const handleUpdateInput = (updated: Partial<LoanInputState>) => {
    setLoanInput((prev) => ({ ...prev, ...updated }));
  };

  const handleSelectBenchmark = (type: SoraBenchmarkType) => {
    setLoanInput((prev) => ({ ...prev, selectedBenchmark: type }));
  };

  const handleChangeCustomRate = (rate: number) => {
    setLoanInput((prev) => ({ ...prev, customSoraRate: rate }));
  };

  const handleExportCsv = () => {
    exportAmortizationToCsv(calculationResult.amortizationMonthly, loanInput.loanAmount);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation & Status */}
      <Header
        apiStatus={apiResponse}
        isFetching={isFetchingApi}
        onRefreshApi={loadRates}
        onOpenApiConfig={() => setIsApiModalOpen(true)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* MAS Rate Benchmarks Bar */}
        <RateBar
          selectedBenchmark={loanInput.selectedBenchmark}
          customRate={loanInput.customSoraRate}
          rates={apiResponse.rates}
          onSelectBenchmark={handleSelectBenchmark}
          onChangeCustomRate={handleChangeCustomRate}
          lastUpdatedDate={apiResponse.lastUpdated}
        />

        {/* Core Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Loan Input Controls */}
          <div className="lg:col-span-5 space-y-6">
            <LoanInputForm input={loanInput} onChange={handleUpdateInput} />
          </div>

          {/* Right Column: Results, Stress Test & Sensitivity */}
          <div className="lg:col-span-7 space-y-6">
            <SummaryCards
              result={calculationResult}
              input={loanInput}
              rates={apiResponse.rates}
            />

            <StressTestPanel
              result={calculationResult}
              input={loanInput}
              rates={apiResponse.rates}
            />

            <HistoricalTrend
              history={apiResponse.historical}
              currentRates={apiResponse.rates}
            />
          </div>
        </div>

        {/* Full Width: Amortization Schedule & Prepayment */}
        <AmortizationTable
          monthly={calculationResult.amortizationMonthly}
          yearly={calculationResult.amortizationYearly}
          loanAmount={loanInput.loanAmount}
          onExportCsv={handleExportCsv}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">SORA Mortgage &amp; Rate Calculator</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>Monetary Authority of Singapore (MAS) Benchmark Standards</span>
          </div>
          <div className="text-[11px] text-slate-400">
            For financial planning and estimation purposes. Bank lending rates, spreads, and TDSR qualifications are subject to institutional approval.
          </div>
        </div>
      </footer>

      {/* Modals */}
      <MasApiModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        currentResponse={apiResponse}
        onRatesUpdated={(res) => setApiResponse(res)}
      />

      <ComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        baseResult={calculationResult}
        input={loanInput}
      />
    </div>
  );
}

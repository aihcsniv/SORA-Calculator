export type SoraBenchmarkType = '3m_compounded' | '1m_compounded' | '6m_compounded' | 'daily' | 'custom';

export interface SoraRateRecord {
  date: string; // YYYY-MM-DD
  sora: number; // Overnight rate %
  soraCompounded1M: number; // 1-month compounded %
  soraCompounded3M: number; // 3-month compounded %
  soraCompounded6M: number; // 6-month compounded %
  soraIndex?: number;
}

export interface MasApiResponse {
  success: boolean;
  source: 'live_mas_api' | 'fallback_snapshot' | 'custom_api';
  lastUpdated: string;
  rates: SoraRateRecord;
  historical: SoraRateRecord[];
  rawResponse?: unknown;
  error?: string;
  apiUrlUsed?: string;
}

export interface BankSpreadTier {
  id: string;
  name: string;
  startMonth: number;
  endMonth: number; // e.g. 24 for Year 1-2, 999 for thereafter
  spread: number; // e.g. 0.65%
}

export interface LoanInputState {
  propertyType: 'hdb' | 'condo' | 'landed' | 'commercial';
  loanAmount: number; // SGD
  tenureYears: number; // 5 to 35
  selectedBenchmark: SoraBenchmarkType;
  customSoraRate: number; // if custom selected
  isTieredSpread: boolean;
  flatSpread: number; // e.g. 0.75%
  tiers: BankSpreadTier[];
  monthlyBorrowerIncome: number; // For TDSR / MSR computation
  otherCommitments: number; // For TDSR
}

export interface AmortizationRow {
  month: number;
  year: number;
  beginningBalance: number;
  interestPayment: number;
  principalPayment: number;
  totalPayment: number;
  endingBalance: number;
  allInRate: number;
}

export interface AmortizationYearSummary {
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  endingBalance: number;
  effectiveRate: number;
}

export interface CalculationResult {
  currentEffectiveRate: number; // Benchmark + initial spread
  initialMonthlyPayment: number; // SGD
  totalPayment: number; // SGD
  totalInterest: number; // SGD
  totalPrincipal: number; // SGD
  amortizationMonthly: AmortizationRow[];
  amortizationYearly: AmortizationYearSummary[];
  // Stress test at MAS mandated 4.00% (or custom)
  masStressRate: number; // typically 4.00%
  stressMonthlyPayment: number;
  stressPaymentDifference: number;
  tdsrRatio: number; // % of income
  stressTdsrRatio: number; // % of income under stress
  tdsrCompliant: boolean; // <= 55%
  msrCompliant?: boolean; // <= 30% for HDB
}

import {
  AmortizationRow,
  AmortizationYearSummary,
  BankSpreadTier,
  CalculationResult,
  LoanInputState,
  SoraBenchmarkType,
  SoraRateRecord,
} from '../types/sora';

export function getBenchmarkRate(type: SoraBenchmarkType, rates: SoraRateRecord, customRate: number): number {
  switch (type) {
    case '3m_compounded':
      return rates.soraCompounded3M;
    case '1m_compounded':
      return rates.soraCompounded1M;
    case '6m_compounded':
      return rates.soraCompounded6M;
    case 'daily':
      return rates.sora;
    case 'custom':
      return customRate;
    default:
      return rates.soraCompounded3M;
  }
}

export function getBenchmarkLabel(type: SoraBenchmarkType): string {
  switch (type) {
    case '3m_compounded':
      return '3-Month Compounded SORA';
    case '1m_compounded':
      return '1-Month Compounded SORA';
    case '6m_compounded':
      return '6-Month Compounded SORA';
    case 'daily':
      return 'SORA Overnight (Daily)';
    case 'custom':
      return 'Custom SORA Rate';
    default:
      return '3-Month Compounded SORA';
  }
}

export function calculateMonthlyPayment(principal: number, annualRatePct: number, totalMonths: number): number {
  if (totalMonths <= 0) return 0;
  if (annualRatePct <= 0) return principal / totalMonths;

  const monthlyRate = annualRatePct / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

function getApplicableSpread(monthIndex: number, isTiered: boolean, flatSpread: number, tiers: BankSpreadTier[]): number {
  if (!isTiered || !tiers || tiers.length === 0) {
    return flatSpread;
  }

  for (const tier of tiers) {
    if (monthIndex >= tier.startMonth && monthIndex <= tier.endMonth) {
      return tier.spread;
    }
  }

  // Fallback to last tier
  return tiers[tiers.length - 1]?.spread ?? flatSpread;
}

export function calculateLoan(
  input: LoanInputState,
  activeRates: SoraRateRecord
): CalculationResult {
  const benchmarkRate = getBenchmarkRate(input.selectedBenchmark, activeRates, input.customSoraRate);
  const totalMonths = Math.max(1, Math.round(input.tenureYears * 12));
  const principal = Math.max(0, input.loanAmount);

  const initialSpread = getApplicableSpread(1, input.isTieredSpread, input.flatSpread, input.tiers);
  const initialEffectiveRate = benchmarkRate + initialSpread;
  const initialMonthlyPayment = calculateMonthlyPayment(principal, initialEffectiveRate, totalMonths);

  const amortizationMonthly: AmortizationRow[] = [];
  const yearlyMap = new Map<number, { paid: number; principal: number; interest: number; lastBalance: number; rate: number }>();

  let currentBalance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    const year = Math.ceil(month / 12);
    const spread = getApplicableSpread(month, input.isTieredSpread, input.flatSpread, input.tiers);
    const allInRate = Math.max(0, benchmarkRate + spread);
    const remainingMonths = totalMonths - month + 1;

    // Monthly payment dynamically recomputed for remaining tenure if rate varies across tiers
    const payment = calculateMonthlyPayment(currentBalance, allInRate, remainingMonths);
    const monthlyRate = allInRate / 100 / 12;
    const interestPayment = currentBalance * monthlyRate;
    let principalPayment = payment - interestPayment;

    if (principalPayment > currentBalance || month === totalMonths) {
      principalPayment = currentBalance;
    }

    const endingBalance = Math.max(0, currentBalance - principalPayment);

    amortizationMonthly.push({
      month,
      year,
      beginningBalance: currentBalance,
      interestPayment,
      principalPayment,
      totalPayment: principalPayment + interestPayment,
      endingBalance,
      allInRate,
    });

    // Accumulate yearly data
    const existingYear = yearlyMap.get(year) || { paid: 0, principal: 0, interest: 0, lastBalance: 0, rate: allInRate };
    existingYear.paid += principalPayment + interestPayment;
    existingYear.principal += principalPayment;
    existingYear.interest += interestPayment;
    existingYear.lastBalance = endingBalance;
    existingYear.rate = allInRate;
    yearlyMap.set(year, existingYear);

    currentBalance = endingBalance;
    if (currentBalance <= 0) break;
  }

  const amortizationYearly: AmortizationYearSummary[] = Array.from(yearlyMap.entries()).map(([year, data]) => ({
    year,
    totalPaid: data.paid,
    principalPaid: data.principal,
    interestPaid: data.interest,
    endingBalance: data.lastBalance,
    effectiveRate: data.rate,
  }));

  const totalPayment = amortizationMonthly.reduce((sum, r) => sum + r.totalPayment, 0);
  const totalInterest = amortizationMonthly.reduce((sum, r) => sum + r.interestPayment, 0);
  const totalPrincipal = principal;

  // MAS Regulatory Stress Test Calculation
  // MAS residential mortgage stress rate is standard 4.00% p.a. (4.50% for commercial)
  const masStressRate = input.propertyType === 'commercial' ? 4.50 : 4.00;
  const stressMonthlyPayment = calculateMonthlyPayment(principal, masStressRate, totalMonths);
  const stressPaymentDifference = stressMonthlyPayment - initialMonthlyPayment;

  // TDSR (Total Debt Servicing Ratio) - Singapore MAS Limit is 55%
  const income = Math.max(1, input.monthlyBorrowerIncome || 7500);
  const otherDebt = input.otherCommitments || 0;
  const tdsrRatio = ((initialMonthlyPayment + otherDebt) / income) * 100;
  const stressTdsrRatio = ((stressMonthlyPayment + otherDebt) / income) * 100;
  const tdsrCompliant = stressTdsrRatio <= 55;

  // MSR (Mortgage Servicing Ratio) for HDB - Limit is 30% of gross monthly income
  let msrCompliant: boolean | undefined = undefined;
  if (input.propertyType === 'hdb') {
    const msrRatio = (stressMonthlyPayment / income) * 100;
    msrCompliant = msrRatio <= 30;
  }

  return {
    currentEffectiveRate: initialEffectiveRate,
    initialMonthlyPayment,
    totalPayment,
    totalInterest,
    totalPrincipal,
    amortizationMonthly,
    amortizationYearly,
    masStressRate,
    stressMonthlyPayment,
    stressPaymentDifference,
    tdsrRatio,
    stressTdsrRatio,
    tdsrCompliant,
    msrCompliant,
  };
}

export function formatSGD(amount: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatPct(rate: number, decimals: number = 2): string {
  return `${rate.toFixed(decimals)}%`;
}

export function exportAmortizationToCsv(rows: AmortizationRow[], loanAmount: number): void {
  const headers = ['Month', 'Year', 'Beginning Balance (SGD)', 'Interest (SGD)', 'Principal (SGD)', 'Total Payment (SGD)', 'Ending Balance (SGD)', 'Effective Rate (%)'];
  const csvContent = [
    headers.join(','),
    ...rows.map(r => [
      r.month,
      r.year,
      r.beginningBalance.toFixed(2),
      r.interestPayment.toFixed(2),
      r.principalPayment.toFixed(2),
      r.totalPayment.toFixed(2),
      r.endingBalance.toFixed(2),
      r.allInRate.toFixed(3),
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SORA_Loan_Amortization_${Math.round(loanAmount)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

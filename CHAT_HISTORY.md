# SORA Calculator Project - Development Chat History

**Date:** 2026-10-05  
**Repository:** [https://github.com/aihcsniv/SORA-Calculator](https://github.com/aihcsniv/SORA-Calculator)  
**Author / User:** aihcsinv@gmail.com  
**Application:** Singapore SORA Mortgage & Rate Calculator with MAS API Integration

---

## Session Transcript & Development Log

### User Prompt 1
> build a simple sora calculator that reads the MAS the interest rate that calculates the property interest rates and integrate with MAS interest data API will be given later

#### Assistant Response 1
Built the comprehensive **SORA Mortgage & Loan Calculator** tailored to Singapore property financing and Monetary Authority of Singapore (MAS) benchmark standards:

1. **MAS Benchmark Rates Integration**:
   - Reference trackers for **3-Month Compounded SORA** (Singapore retail home loan market benchmark), **1-Month Compounded**, **6-Month Compounded**, and **Daily SORA** (Overnight).
   - Extracted from official MAS publications with realistic benchmark fallbacks.
   - Built an interactive **MAS API Settings & Connection Modal** ready to accept custom API endpoint URLs and authentication keys.

2. **Property Interest Rate Calculations**:
   - Supported property types: **HDB Flat** (max 30 yrs, 30% MSR limit), **Condo / Private Property** (max 30 yrs, 75% LTV), **Landed Property** (max 35 yrs), and **Commercial Property**.
   - Bank Spread/Margin Configurator: Flat spreads (e.g. +0.60% to +0.85%) and multi-year tiered packages (e.g. Year 1-2: +0.65%, Year 3+: +0.85%).
   - All-In Effective Rate calculation ($r = \text{SORA Benchmark} + \text{Bank Spread}$).
   - Estimated monthly installment, Month 1 Principal vs Interest split, lifetime interest cost, and principal reduction progress.

3. **Regulatory Stress Testing & Borrower Qualification**:
   - **MAS TDSR Check**: Tests borrowing capacity against the MAS mandated **4.00% p.a. floor rate** (55% TDSR limit).
   - **HDB MSR Check**: Validates that monthly repayments do not exceed 30% of gross monthly income.
   - **Rate Shock Matrix**: Projects monthly payments across rate movements (-0.50% to +2.00%).

4. **Amortization & Scenario Planning**:
   - Annual summary and monthly breakdown table.
   - Lump-sum capital prepayment simulator showing interest savings and tenure reduction.
   - CSV schedule export.
   - Fixed Rate vs Floating SORA loan comparison tool.

---

### User Prompt 2
> git push https://[REDACTED_GITHUB_TOKEN]@github.com/aihcsniv/SORA-Calculator.git

#### Assistant Response 2
1. Cleaned up repository structure and verified `.gitignore` to prevent committing build artifacts (`node_modules/`, `dist/`, `.env`).
2. Initialized git repository on branch `main`:
   ```bash
   git init -b main
   git config user.email "aihcsniv@gmail.com"
   git config user.name "aihcsniv"
   git add .
   git commit -m "Initial commit: SORA mortgage & rate calculator with MAS interest data integration"
   ```
3. Pushed repository to GitHub:
   ```bash
   git push -u https://ghp_***@github.com/aihcsniv/SORA-Calculator.git main
   ```
4. Sanitized remote URL in `.git/config` so personal access tokens are not saved in plaintext:
   ```bash
   git remote set-url origin https://github.com/aihcsniv/SORA-Calculator.git
   ```

---

### User Prompt 3
> # Daily SGD exchange rates, end of period (usd_sgd, eur_sgd, ...):
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily
>
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
>
> # All requests need the header: KeyId: 77e13560-d485-446e-a1df-ae88dd7a02e7

#### Assistant Response 3
1. Tested the MAS Denodo/MSSQL API gateway live using curl:
   - Endpoint: `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily?$orderby=end_of_day desc&$top=30`
   - Retrieved real-time daily metrics:
     - `sora` (Daily Overnight SORA)
     - `comp_sora_1m` (1-Month Compounded SORA)
     - `comp_sora_3m` (3-Month Compounded SORA)
     - `comp_sora_6m` (6-Month Compounded SORA)
     - `sora_index` (SORA Index)
     - `aggregate_volume` (Daily Interbank Transaction Volume in S$ Millions)
     - `highest_transaction` and `lowest_transaction` (Daily Transaction Spreads)
     - `published_date` & `end_of_day` (Trading & Publication Timestamps)
2. Configured reverse proxy `/api/mas-sora` to circumvent browser CORS preflight blocks.
3. Updated data parser in `src/services/masApi.ts` to handle the Denodo OData structure and filter out unfinalized morning records where rates are null.
4. Committed and pushed updates to GitHub repository `main` branch.

---

### User Prompt 4
> store this in /api folder (at the project level) NOT src file
> include /health.ts and /sora.js within the same subfolder
> do not hardcode any api keys, i will include them manually
> remove the mas key id from all request headers

#### Assistant Response 4
Refactored the architecture to extract backend endpoints to a root-level `/api` directory with zero hardcoded API keys:

1. **Created `/api` Directory (Project Root Level, outside `src`)**:
   - `/api/health.ts`:
     - Lightweight service health check endpoint.
     - Returns `{ status: 'ok', timestamp, uptime, environment, service }`.
     - Compatible with Node.js, Express, Connect, and Serverless platforms.
   - `/api/sora.js`:
     - Standalone Node.js service for querying MAS SORA interest rate feeds.
     - Parses and normalizes MAS datasets into SORA benchmarks.
     - **Zero Hardcoded Keys**: Only includes the `KeyId` header if explicitly provided via environment variable (`process.env.MAS_KEY_ID`), request header (`x-mas-key-id` or `KeyId`), or request query parameter.
2. **Removed All Hardcoded Keys & KeyId Request Headers**:
   - Removed the key id string from `vite.config.ts`, `src/services/masApi.ts`, and `src/components/MasApiModal.tsx`.
   - Default outgoing request headers contain **no** KeyId.
   - Updated `.env.example` with `MAS_KEY_ID=""` for optional manual configuration.
3. **Mounted `/api/health` and `/api/sora` in Dev Server**:
   - Configured custom Vite plugin to directly route `/api/health` and `/api/sora` requests through `/api/health.ts` and `/api/sora.js`.
4. **Committed & Pushed to GitHub**:
   - Commit: `Add /api/health.ts and /api/sora.js at project level; remove hardcoded MAS key id from all request headers`
   - Pushed cleanly to `https://github.com/aihcsniv/SORA-Calculator.git` on branch `main`.

---

### User Prompt 5
> export this entire chat as a .md file

#### Assistant Response 5
Exported the complete session and architectural documentation into `CHAT_HISTORY.md` at the project root.

---

## File Structure Overview

```text
/
├── api/
│   ├── health.ts         # Service health check endpoint
│   └── sora.js           # MAS SORA data fetcher & parser (no hardcoded keys)
├── src/
│   ├── components/
│   │   ├── AmortizationTable.tsx   # Annual & monthly schedule + prepayment simulator
│   │   ├── ComparisonModal.tsx     # SORA vs Fixed Rate comparison
│   │   ├── Header.tsx              # Institutional branding & sync controls
│   │   ├── HistoricalTrend.tsx     # MAS historical SORA trend chart
│   │   ├── LoanInputForm.tsx       # Loan inputs, property types, spreads
│   │   ├── MasApiModal.tsx         # Manual API endpoint & KeyId configuration
│   │   ├── RateBar.tsx             # Interactive benchmark selector with live volume
│   │   ├── StressTestPanel.tsx     # MAS 4.00% floor rate & TDSR/MSR verification
│   │   └── SummaryCards.tsx        # Monthly installment & lifetime cost breakdown
│   ├── services/
│   │   └── masApi.ts               # Frontend API service calling /api/sora
│   ├── types/
│   │   └── sora.ts                 # TypeScript type definitions
│   ├── utils/
│   │   └── soraCalculator.ts       # Amortization, TDSR, and stress test engine
│   ├── App.tsx                     # Main layout & reactive state
│   ├── main.tsx                    # React DOM entry point
│   └── index.css                   # Global styles
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules
├── CHAT_HISTORY.md                 # Complete session export
├── index.html                      # HTML document entry
├── metadata.json                   # Applet metadata
├── package.json                    # Project dependencies & scripts
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite build configuration with /api middleware
```

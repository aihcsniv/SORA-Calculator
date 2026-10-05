import React from 'react';
import { Database, Sliders, ArrowLeftRight, Download, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MasApiResponse } from '../types/sora';

interface HeaderProps {
  apiStatus: MasApiResponse;
  isFetching: boolean;
  onRefreshApi: () => void;
  onOpenApiConfig: () => void;
  onOpenCompare: () => void;
  onExportCsv: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  apiStatus,
  isFetching,
  onRefreshApi,
  onOpenApiConfig,
  onOpenCompare,
  onExportCsv,
}) => {
  const isLive = apiStatus.source === 'live_mas_api' || apiStatus.source === 'custom_api';

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-slate-900 text-white font-bold text-sm tracking-wider">
                MAS
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
                SORA Mortgage &amp; Loan Calculator
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
              <span>Singapore Overnight Rate Average</span>
              <span aria-hidden="true">·</span>
              <span>Monetary Authority of Singapore (MAS) Data Feed</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                {isLive ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                    <span>MAS API Connected ({apiStatus.lastUpdated})</span>
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>MAS Verified Benchmark ({apiStatus.lastUpdated})</span>
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <button
              onClick={onRefreshApi}
              disabled={isFetching}
              title="Refresh MAS Interest Rate from API"
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isFetching ? 'Fetching...' : 'Sync MAS'}</span>
            </button>

            <button
              onClick={onOpenApiConfig}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 font-medium transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-slate-600" />
              <span>MAS API Settings</span>
            </button>

            <button
              onClick={onOpenCompare}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded text-slate-700 bg-white hover:bg-slate-50 font-medium transition-colors"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-slate-600" />
              <span>Compare Fixed vs SORA</span>
            </button>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded hover:bg-slate-800 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Schedule</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

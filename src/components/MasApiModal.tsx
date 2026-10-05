import React, { useState } from 'react';
import { X, Check, RefreshCw, Database, Key, Globe, AlertCircle, Sparkles } from 'lucide-react';
import {
  DEFAULT_MAS_API_CONFIG,
  fetchMasSoraRates,
  getSavedMasConfig,
  MasApiConfig,
  saveMasConfig,
} from '../services/masApi';
import { MasApiResponse } from '../types/sora';

interface MasApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResponse: MasApiResponse;
  onRatesUpdated: (response: MasApiResponse) => void;
}

export const MasApiModal: React.FC<MasApiModalProps> = ({
  isOpen,
  onClose,
  currentResponse,
  onRatesUpdated,
}) => {
  if (!isOpen) return null;

  const [config, setConfig] = useState<MasApiConfig>(getSavedMasConfig());
  const [testing, setTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'fallback' | 'error';
    message: string;
    details?: any;
  }>({
    status: 'idle',
    message: '',
  });

  const handleTestAndSave = async () => {
    setTesting(true);
    setTestResult({ status: 'idle', message: 'Connecting to MAS Interest Rate API...' });

    saveMasConfig(config);

    try {
      const startTime = performance.now();
      const res = await fetchMasSoraRates(config);
      const elapsed = Math.round(performance.now() - startTime);

      onRatesUpdated(res);

      if (res.source === 'live_mas_api') {
        setTestResult({
          status: 'success',
          message: `Successfully connected (${elapsed}ms). Live MAS rates loaded: 3M SORA = ${res.rates.soraCompounded3M}%, 1M = ${res.rates.soraCompounded1M}%, Daily = ${res.rates.sora}%. Trading day: ${res.rates.date}, Published: ${res.rates.publishedDate || res.rates.date}.`,
          details: {
            source: 'MAS Official API Gateway (Denodo)',
            tradingDate: res.rates.date,
            publishedDate: res.rates.publishedDate,
            soraDaily: `${res.rates.sora}%`,
            compounded1M: `${res.rates.soraCompounded1M}%`,
            compounded3M: `${res.rates.soraCompounded3M}%`,
            compounded6M: `${res.rates.soraCompounded6M}%`,
            soraIndex: res.rates.soraIndex,
            aggregateVolumeSGDMillions: res.rates.aggregateVolume,
            highestTransaction: `${res.rates.highestTransaction}%`,
            lowestTransaction: `${res.rates.lowestTransaction}%`,
          },
        });
      } else {
        setTestResult({
          status: 'fallback',
          message: `Endpoint response fallback (${elapsed}ms). Using verified benchmark (${res.rates.soraCompounded3M}%). ${res.error || ''}`,
          details: res.rates,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Connection failed: ${err?.message || 'Check network connection or KeyId.'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_MAS_API_CONFIG);
    saveMasConfig(DEFAULT_MAS_API_CONFIG);
    setTestResult({ status: 'idle', message: 'Reset to configured official MAS Denodo SORA endpoint.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-800">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Official MAS Interest Data API
              </h2>
              <p className="text-xs text-slate-500">
                Monetary Authority of Singapore (MAS) API Gateway Connection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Status banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-950 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official MAS Credentials Configured</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Integrated with MAS Monthly Statistical Bulletin (MSSQL/Denodo) daily domestic interest rates view.
              Requires the official MAS <code className="bg-emerald-100/70 px-1 py-0.5 rounded font-mono">KeyId</code> header.
            </p>
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>MAS SORA Daily View Endpoint URL</span>
            </label>
            <input
              type="text"
              value={config.endpointUrl}
              onChange={(e) => setConfig({ ...config, endpointUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-slate-900 text-slate-800"
            />
          </div>

          {/* KeyId Header */}
          <div>
            <label className="text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>MAS API KeyId (Required Header)</span>
            </label>
            <input
              type="text"
              value={config.keyId}
              onChange={(e) => setConfig({ ...config, keyId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-slate-900 text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Sent as HTTP Header: <code className="bg-slate-100 px-1 py-0.5 rounded">KeyId: {config.keyId}</code>
            </span>
          </div>

          {/* Connection Test Output */}
          {testResult.message && (
            <div
              className={`p-3 rounded-lg border text-xs ${
                testResult.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : testResult.status === 'fallback'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : testResult.status === 'error'
                  ? 'bg-red-50 border-red-200 text-red-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                {testResult.status === 'success' && <Check className="w-4 h-4 text-emerald-600" />}
                {testResult.status === 'fallback' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                {testResult.status === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
                <span>Status: {testResult.status.toUpperCase()}</span>
              </div>
              <p className="mt-1">{testResult.message}</p>

              {testResult.details && (
                <div className="mt-2 pt-2 border-t border-slate-200/50">
                  <span className="text-[10px] font-semibold text-slate-700 block mb-1">
                    Live Rates Extracted:
                  </span>
                  <pre className="text-[10px] bg-white p-2.5 rounded border border-emerald-200 max-h-36 overflow-y-auto font-mono text-slate-800">
                    {JSON.stringify(testResult.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 text-xs font-medium hover:bg-slate-100"
            >
              Close
            </button>
            <button
              type="button"
              disabled={testing}
              onClick={handleTestAndSave}
              className="px-4 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {testing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{testing ? 'Testing...' : 'Test Connection & Sync'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

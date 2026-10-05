import React, { useState } from 'react';
import { X, Check, RefreshCw, Database, Key, Globe, AlertCircle, FileText } from 'lucide-react';
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
    setTestResult({ status: 'idle', message: 'Connecting to specified API endpoint...' });

    saveMasConfig(config);

    try {
      const startTime = performance.now();
      const res = await fetchMasSoraRates(config);
      const elapsed = Math.round(performance.now() - startTime);

      onRatesUpdated(res);

      if (res.source === 'live_mas_api' || res.source === 'custom_api') {
        setTestResult({
          status: 'success',
          message: `Successfully connected (${elapsed}ms). Live MAS rates loaded: 3M SORA = ${res.rates.soraCompounded3M}%, 1M = ${res.rates.soraCompounded1M}%.`,
          details: res.rawResponse || res.rates,
        });
      } else {
        setTestResult({
          status: 'fallback',
          message: `Endpoint accessed or fell back (${elapsed}ms). Using verified MAS benchmark snapshot (${res.rates.soraCompounded3M}%). ${res.error || ''}`,
          details: res.rates,
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: `Connection failed: ${err?.message || 'Check URL or CORS configuration.'}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_MAS_API_CONFIG);
    saveMasConfig(DEFAULT_MAS_API_CONFIG);
    setTestResult({ status: 'idle', message: 'Reset to default official MAS CKAN endpoint.' });
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
                MAS Interest Data API Integration
              </h2>
              <p className="text-xs text-slate-500">
                Configure official MAS CKAN datastore or custom internal interest rate endpoint
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
          {/* Information box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800 block">
              Flexible MAS API Integration
            </span>
            <p className="text-[11px] leading-relaxed">
              When you have your specific MAS interest data API endpoint or gateway ready, paste the URL below.
              The parser automatically normalizes MAS CKAN format, domestic interest rate records, or standard JSON feeds.
            </p>
          </div>

          {/* Endpoint URL */}
          <div>
            <label className="text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>MAS API Endpoint URL</span>
            </label>
            <input
              type="text"
              value={config.endpointUrl}
              onChange={(e) => setConfig({ ...config, endpointUrl: e.target.value })}
              placeholder="https://eservices.mas.gov.sg/api/action/datastore/search.json"
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Default: Monetary Authority of Singapore official datastore endpoint.
            </span>
          </div>

          {/* Resource ID */}
          <div>
            <label className="text-slate-700 font-semibold block mb-1">
              Dataset Resource ID (MAS CKAN Datastore)
            </label>
            <input
              type="text"
              value={config.resourceId}
              onChange={(e) => setConfig({ ...config, resourceId: e.target.value })}
              placeholder="9a0bf149-3083-461a-a4e9-68b805001e8d"
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Standard MAS Domestic Interest Rates dataset ID: 9a0bf149-3083-461a-a4e9-68b805001e8d
            </span>
          </div>

          {/* Optional API Key / Auth Header */}
          <div>
            <label className="text-slate-700 font-semibold flex items-center gap-1.5 mb-1">
              <Key className="w-3.5 h-3.5 text-slate-500" />
              <span>API Key / Bearer Token (Optional)</span>
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Leave empty if public, or paste your API key here"
              className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:outline-none focus:border-slate-900"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Automatically sent in Authorization Bearer and x-api-key headers.
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
                  <span className="text-[10px] font-semibold text-slate-600 block mb-1">
                    Returned Data Preview:
                  </span>
                  <pre className="text-[10px] bg-white/70 p-2 rounded max-h-28 overflow-y-auto font-mono">
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
              <span>{testing ? 'Testing...' : 'Test & Save API Config'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SORA Rate API Handler
 * Project-level endpoint: /api/sora.js
 * Connects to Monetary Authority of Singapore (MAS) Domestic Interest Rates feed.
 * NO API keys or KeyId are hardcoded; user injects keys manually via environment variables or request headers.
 */

const MAS_SORA_ENDPOINT =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

/**
 * Normalizes MAS Denodo response format into clean SORA records
 */
function parseMasData(data) {
  if (!data) return null;

  let elements = [];
  if (Array.isArray(data.elements)) {
    elements = data.elements;
  } else if (data.result && Array.isArray(data.result.records)) {
    elements = data.result.records;
  } else if (Array.isArray(data.records)) {
    elements = data.records;
  } else if (Array.isArray(data)) {
    elements = data;
  }

  if (!elements || elements.length === 0) return null;

  const validRecords = [];

  for (const item of elements) {
    const rawSora = item.sora ?? item.sora_rate ?? item.daily_sora;
    const rawC1m = item.comp_sora_1m ?? item.sora_compounded_1m ?? item.compounded_1m;
    const rawC3m = item.comp_sora_3m ?? item.sora_compounded_3m ?? item.compounded_3m;
    const rawC6m = item.comp_sora_6m ?? item.sora_compounded_6m ?? item.compounded_6m;

    const sora = rawSora !== null && rawSora !== undefined ? parseFloat(String(rawSora)) : null;
    const sora1M = rawC1m !== null && rawC1m !== undefined ? parseFloat(String(rawC1m)) : null;
    const sora3M = rawC3m !== null && rawC3m !== undefined ? parseFloat(String(rawC3m)) : null;
    const sora6M = rawC6m !== null && rawC6m !== undefined ? parseFloat(String(rawC6m)) : null;

    // Skip unfinalized rows with all null interest figures
    if (sora === null && sora3M === null && sora1M === null) {
      continue;
    }

    const soraIndex = item.sora_index !== null && item.sora_index !== undefined ? parseFloat(String(item.sora_index)) : null;
    const aggregateVolume = item.aggregate_volume !== null && item.aggregate_volume !== undefined ? parseFloat(String(item.aggregate_volume)) : null;
    const highestTransaction = item.highest_transaction !== null && item.highest_transaction !== undefined ? parseFloat(String(item.highest_transaction)) : null;
    const lowestTransaction = item.lowest_transaction !== null && item.lowest_transaction !== undefined ? parseFloat(String(item.lowest_transaction)) : null;

    validRecords.push({
      date: item.end_of_day || item.date || '',
      publishedDate: item.published_date ? String(item.published_date).split('T')[0] : null,
      sora: sora ?? sora3M,
      soraCompounded1M: sora1M ?? sora3M,
      soraCompounded3M: sora3M ?? sora,
      soraCompounded6M: sora6M ?? sora3M,
      soraIndex,
      aggregateVolume,
      highestTransaction,
      lowestTransaction,
      calculationMethod: item.calculation_method || null,
    });
  }

  if (validRecords.length === 0) return null;

  validRecords.sort((a, b) => (a.date < b.date ? 1 : -1));

  return {
    current: validRecords[0],
    historical: validRecords.slice(0, 30),
  };
}

/**
 * Fetches latest SORA rates from MAS endpoint
 * Reads manual key from process.env if provided by user; NO key is hardcoded.
 */
export async function fetchSoraData(customKeyId = null) {
  const url = `${MAS_SORA_ENDPOINT}?$orderby=end_of_day%20desc&$top=30`;

  // Standard request headers - NO hardcoded key id
  const headers = {
    Accept: 'application/json',
  };

  // Only inject if manually provided via environment variable or argument
  const activeKey = customKeyId || (typeof process !== 'undefined' ? process.env?.MAS_KEY_ID : null);
  if (activeKey) {
    headers['KeyId'] = activeKey;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`MAS API returned HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const parsed = parseMasData(data);

  if (!parsed) {
    throw new Error('No valid published SORA interest rate records found in MAS response');
  }

  return {
    success: true,
    lastUpdated: parsed.current.publishedDate || parsed.current.date,
    rates: parsed.current,
    historical: parsed.historical,
    source: 'live_mas_api',
  };
}

/**
 * Default HTTP handler for Express, Vite middlewares, or Serverless functions
 */
export default async function soraHandler(req, res) {
  try {
    // Extract key only if user provided it manually via header or query
    const clientKey = req?.headers?.['x-mas-key-id'] || req?.headers?.['keyid'] || req?.query?.keyId || null;
    const result = await fetchSoraData(clientKey);

    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate');
    }

    if (res && typeof res.status === 'function') {
      return res.status(200).json(result);
    }

    if (res && typeof res.end === 'function') {
      res.statusCode = 200;
      return res.end(JSON.stringify(result));
    }

    return result;
  } catch (error) {
    const errorPayload = {
      success: false,
      error: error.message || 'Failed to fetch SORA interest rates from MAS',
    };

    if (res && typeof res.status === 'function') {
      return res.status(502).json(errorPayload);
    }

    if (res && typeof res.end === 'function') {
      res.statusCode = 502;
      return res.end(JSON.stringify(errorPayload));
    }

    return errorPayload;
  }
}

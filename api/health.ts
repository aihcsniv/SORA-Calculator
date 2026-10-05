/**
 * Health check endpoint for SORA Calculator Service
 */

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  service: string;
}

export function getHealthStatus(): HealthResponse {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: typeof process !== 'undefined' && process.uptime ? process.uptime() : 0,
    environment: typeof process !== 'undefined' && process.env?.NODE_ENV ? process.env.NODE_ENV : 'development',
    service: 'sora-calculator-api',
  };
}

/**
 * Standard HTTP handler compatible with Express, Connect, and Serverless runtimes
 */
export default function handler(req: any, res: any) {
  const status = getHealthStatus();

  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
  }

  if (res && typeof res.status === 'function') {
    return res.status(200).json(status);
  }

  if (res && typeof res.end === 'function') {
    res.statusCode = 200;
    return res.end(JSON.stringify(status));
  }

  return status;
}

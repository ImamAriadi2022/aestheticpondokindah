/**
 * Production-Safe Logger Utility — Aesthetic Pondok Indah
 * Supports log levels, module grouping, performance measurement, and sensitive data sanitization.
 */

const isDev = import.meta.env.DEV;

// Sensitive keys to sanitize in logs
const SENSITIVE_KEYS = [
  'password',
  'password_confirmation',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'secret',
  'card_number',
  'cvv',
];

const sanitize = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  const clean: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      clean[key] = '***[REDACTED]***';
    } else if (typeof data[key] === 'object') {
      clean[key] = sanitize(data[key]);
    } else {
      clean[key] = data[key];
    }
  }
  return clean;
};

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) {
      console.log(...args.map(sanitize));
    }
  },
  info: (module: string, message: string, ...args: unknown[]) => {
    if (isDev) {
      console.info(`%c[INFO] [${module}]`, 'color: #3b82f6; font-weight: bold;', message, ...args.map(sanitize));
    }
  },
  debug: (module: string, message: string, ...args: unknown[]) => {
    if (isDev) {
      console.debug(`%c[DEBUG] [${module}]`, 'color: #8b5cf6; font-weight: bold;', message, ...args.map(sanitize));
    }
  },
  warn: (module: string, message: string, ...args: unknown[]) => {
    if (isDev) {
      console.warn(`[WARN] [${module}]`, message, ...args.map(sanitize));
    }
  },
  error: (module: string, message: string, ...args: unknown[]) => {
    // Errors are logged in all environments but sanitized
    console.error(`[ERROR] [${module}]`, message, ...args.map(sanitize));
  },
  request: (method: string, url: string, data?: unknown) => {
    if (isDev) {
      console.groupCollapsed(`%c[HTTP REQUEST] ${method.toUpperCase()} ${url}`, 'color: #10b981; font-weight: bold;');
      if (data) console.log('Payload:', sanitize(data));
      console.groupEnd();
    }
  },
  response: (method: string, url: string, status: number, data?: unknown) => {
    if (isDev) {
      const color = status >= 200 && status < 300 ? '#10b981' : '#ef4444';
      console.groupCollapsed(`%c[HTTP RESPONSE] ${status} ${method.toUpperCase()} ${url}`, `color: ${color}; font-weight: bold;`);
      if (data) console.log('Response:', sanitize(data));
      console.groupEnd();
    }
  },
  performance: (label: string, durationMs: number) => {
    if (isDev) {
      console.log(`%c[PERF] ${label}: ${durationMs.toFixed(2)}ms`, 'color: #f59e0b; font-weight: bold;');
    }
  },
};

/**
 * @masdannn/license-guard — Client SDK Runtime
 */

export interface LicenseGuardConfig {
  apiKey?: string;
  endpoint?: string;
  redirect?: string;
  interval?: number; // dalam detik
}

export interface LicenseState {
  valid: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';
  token?: string | null;
  lastCheck?: number;
}

const DEFAULT_ENDPOINT = 'https://license-tau-nine.vercel.app';

export function initGuard(config: LicenseGuardConfig = {}): void {
  if (typeof window === 'undefined') return;

  const endpoint = config.endpoint || DEFAULT_ENDPOINT;
  const apiKey = config.apiKey;

  if (!apiKey) {
    console.warn('[@masdannn/license-guard] apiKey is required to initialize.');
    return;
  }

  // Inject guard.js dynamically
  const scriptId = '__license_guard_sdk_script__';
  if (!document.getElementById(scriptId)) {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `${endpoint.replace(/\/$/, '')}/guard.js`;
    script.setAttribute('data-api-key', apiKey);
    if (config.redirect) script.setAttribute('data-redirect', config.redirect);
    if (config.interval) script.setAttribute('data-interval', String(config.interval));
    document.head.appendChild(script);
  }
}

/**
 * Server-side / Node.js Express Middleware Helper
 */
export function guardMiddleware(config: { apiKey: string; endpoint?: string; domain?: string }) {
  const endpoint = config.endpoint || DEFAULT_ENDPOINT;
  const apiKey = config.apiKey;
  const targetDomain = config.domain || 'localhost';

  return async function (req: any, res: any, next: any) {
    try {
      const response = await fetch(`${endpoint.replace(/\/$/, '')}/api/license/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          domain: targetDomain,
        }),
      });

      const data = (await response.json()) as { valid?: boolean; status?: string };
      if (!data.valid || data.status !== 'ACTIVE') {
        if (res.status) {
          return res.status(403).send('<h1>403 Forbidden - License Suspended</h1>');
        }
      }
      if (next) next();
    } catch {
      // Grace period fallback
      if (next) next();
    }
  };
}

/**
 * @masdannn/license-guard — Client SDK Runtime
 */
interface LicenseGuardConfig {
    apiKey?: string;
    endpoint?: string;
    redirect?: string;
    interval?: number;
}
interface LicenseState {
    valid: boolean;
    status: 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';
    token?: string | null;
    lastCheck?: number;
}
declare function initGuard(config?: LicenseGuardConfig): void;
/**
 * Server-side / Node.js Express Middleware Helper
 */
declare function guardMiddleware(config: {
    apiKey: string;
    endpoint?: string;
    domain?: string;
}): (req: any, res: any, next: any) => Promise<any>;

export { type LicenseGuardConfig, type LicenseState, guardMiddleware, initGuard };

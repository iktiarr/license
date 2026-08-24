import { importPKCS8, importSPKI, SignJWT, jwtVerify } from 'jose';

export type LicensePayload = {
  projectId: string;
  domain: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TAMPERED';
  iat?: number;
  exp?: number;
};

function parsePem(raw: string): string {
  // .env stores newlines as \n literal — restore them
  return raw.replace(/\\n/g, '\n');
}

async function getPrivateKey() {
  const pem = parsePem(process.env.RSA_PRIVATE_KEY ?? '');
  if (!pem) throw new Error('RSA_PRIVATE_KEY is not configured');
  return importPKCS8(pem, 'RS256');
}

async function getPublicKey() {
  const pem = parsePem(process.env.RSA_PUBLIC_KEY ?? '');
  if (!pem) throw new Error('RSA_PUBLIC_KEY is not configured');
  return importSPKI(pem, 'RS256');
}

/**
 * Sign a license JWT valid for `expiresInHours` hours.
 * Default expiry is 25h (slightly above 24h grace period) so clients
 * must heartbeat before the token expires.
 */
export async function signLicenseToken(
  payload: Omit<LicensePayload, 'iat' | 'exp'>,
  expiresInHours = 25
): Promise<string> {
  const privateKey = await getPrivateKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuedAt()
    .setIssuer('license-guard')
    .setAudience('client-site')
    .setExpirationTime(`${expiresInHours}h`)
    .sign(privateKey);
}

/**
 * Verify a license JWT. Returns the decoded payload or null if invalid.
 */
export async function verifyLicenseToken(
  token: string
): Promise<LicensePayload | null> {
  try {
    const publicKey = await getPublicKey();
    const { payload } = await jwtVerify(token, publicKey, {
      issuer: 'license-guard',
      audience: 'client-site',
      algorithms: ['RS256'],
    });
    return payload as unknown as LicensePayload;
  } catch {
    return null;
  }
}

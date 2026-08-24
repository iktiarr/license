/**
 * RSA-2048 Key Generator for License Guard JWT
 * Run: node scripts/generate-keys.mjs
 *
 * This script generates an RSA-2048 key pair and appends them to .env.local
 * The private key signs license JWT tokens; the public key is shared with clients.
 */

import { generateKeyPair, exportPKCS8, exportSPKI } from 'jose';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../.env.local');

console.log('🔑 Generating RSA-2048 key pair...');

const { privateKey, publicKey } = await generateKeyPair('RS256', { modulusLength: 2048, extractable: true });

const privatePem = await exportPKCS8(privateKey);
const publicPem = await exportSPKI(publicKey);

// Collapse PEM to single line for .env storage
const privateKeyEnv = privatePem.replace(/\n/g, '\\n');
const publicKeyEnv = publicPem.replace(/\n/g, '\\n');

// Read existing .env.local and update RSA_ keys
let envContent = '';
try {
  envContent = readFileSync(envPath, 'utf8');
} catch {
  envContent = '';
}

// Replace or append RSA keys
function setEnvVar(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  const line = `${key}="${value}"`;
  if (regex.test(content)) {
    return content.replace(regex, line);
  }
  return content + `\n${line}`;
}

envContent = setEnvVar(envContent, 'RSA_PRIVATE_KEY', privateKeyEnv);
envContent = setEnvVar(envContent, 'RSA_PUBLIC_KEY', publicKeyEnv);

writeFileSync(envPath, envContent, 'utf8');

console.log('✅ RSA keys written to .env.local');
console.log('');
console.log('📋 Public Key (share with client sites):');
console.log(publicPem);

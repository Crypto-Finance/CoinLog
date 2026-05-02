// ---------------------------------------------------------------------------
// Bybit API key storage (encrypted in localStorage)
//
// API keys are encrypted with AES-GCM using a user-provided passphrase
// before being stored in localStorage. This provides defense-in-depth
// against XSS attacks reading plaintext credentials.
// ---------------------------------------------------------------------------

import { encrypt, decrypt } from './crypto';

const API_KEY_STORAGE = 'CoinLog.bybit.apiKey';
const API_SECRET_STORAGE = 'CoinLog.bybit.apiSecret';

export interface StoredKeys {
  apiKey: string;
  apiSecret: string;
}

/**
 * Retrieve and decrypt stored API keys.
 * Returns null if keys are not stored or decryption fails.
 */
export async function getStoredKeys(passphrase: string): Promise<StoredKeys | null> {
  if (typeof window === 'undefined') return null;

  const encryptedKey = localStorage.getItem(API_KEY_STORAGE);
  const encryptedSecret = localStorage.getItem(API_SECRET_STORAGE);

  if (!encryptedKey || !encryptedSecret) return null;

  try {
    const apiKey = await decrypt(encryptedKey, passphrase);
    const apiSecret = await decrypt(encryptedSecret, passphrase);
    return { apiKey, apiSecret };
  } catch {
    return null;
  }
}

/**
 * Encrypt and store API keys in localStorage.
 */
export async function storeKeys(
  apiKey: string,
  apiSecret: string,
  passphrase: string,
): Promise<void> {
  if (typeof window === 'undefined') return;

  const encryptedKey = await encrypt(apiKey, passphrase);
  const encryptedSecret = await encrypt(apiSecret, passphrase);

  localStorage.setItem(API_KEY_STORAGE, encryptedKey);
  localStorage.setItem(API_SECRET_STORAGE, encryptedSecret);
}

/**
 * Remove stored API keys from localStorage.
 */
export function clearKeys(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(API_KEY_STORAGE);
  localStorage.removeItem(API_SECRET_STORAGE);
}

/**
 * Check if encrypted keys are stored (does not verify they can be decrypted).
 */
export function hasStoredKeys(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    localStorage.getItem(API_KEY_STORAGE) &&
    localStorage.getItem(API_SECRET_STORAGE)
  );
}

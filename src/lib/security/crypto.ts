// ---------------------------------------------------------------------------
// Web Crypto API — AES-GCM encryption for sensitive data
//
// Uses PBKDF2 to derive an AES-GCM key from a passphrase. This provides
// defense-in-depth against XSS reading plaintext from localStorage.
//
// IMPORTANT: The passphrase is NOT stored. Users must re-enter it to decrypt.
// For a better UX, consider integrating with WebAuthn or a secure vault.
//
// Format: base64(salt:iv:ciphertext)
//   - salt: 16 bytes (random per encryption)
//   - iv:   12 bytes (random per encryption)
//   - ciphertext: variable length
// ---------------------------------------------------------------------------

const PBKDF2_ITERATIONS = 600_000; // OWASP 2023 recommendation
const AES_KEY_LENGTH = 256;
const SALT_LENGTH = 16; // 128-bit salt
const IV_LENGTH = 12; // 96-bit IV for AES-GCM

/**
 * Encode a Uint8Array to base64.
 * Uses native Uint8Array.toBase64() when available (ES2025),
 * falls back to btoa for older browsers/Node.js.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  // Feature-detect native method (ES2025, Chrome 137+, Firefox 137+, Safari 18.4+)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nativeToBase64 = (bytes as any).toBase64;
  if (typeof nativeToBase64 === 'function') {
    return nativeToBase64.call(bytes);
  }
  // Fallback: convert bytes to binary string, then base64-encode
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decode a base64 string to a Uint8Array.
 * Uses native Uint8Array.fromBase64() when available (ES2025),
 * falls back to atob for older browsers/Node.js.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  // Feature-detect native method (ES2025, Chrome 137+, Firefox 137+, Safari 18.4+)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nativeFromBase64 = (Uint8Array as any).fromBase64;
  if (typeof nativeFromBase64 === 'function') {
    return nativeFromBase64(base64);
  }
  // Fallback: decode base64 to binary string, then convert to bytes
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derive an AES-GCM CryptoKey from a passphrase using PBKDF2.
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: AES_KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  );
}

/**
 * Encrypt plaintext using AES-GCM with a random salt and IV.
 *
 * Returns a base64-encoded string containing: salt (16 bytes) + IV (12 bytes) + ciphertext.
 * Format: base64(salt:iv:ciphertext)
 */
export async function encrypt(
  plaintext: string,
  passphrase: string,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const key = await deriveKey(passphrase, salt);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  // Pack: salt + iv + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
  combined.set(salt);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

  // Convert to base64 for storage
  return uint8ArrayToBase64(combined);
}

/**
 * Decrypt a base64-encoded AES-GCM ciphertext.
 *
 * Expects format: base64(salt:iv:ciphertext)
 */
export async function decrypt(
  encryptedBase64: string,
  passphrase: string,
): Promise<string> {
  // Decode base64 back to bytes
  const combined = base64ToUint8Array(encryptedBase64);

  // Extract salt (first 16 bytes), IV (next 12 bytes), and ciphertext (remainder)
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

  const key = await deriveKey(passphrase, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext,
  );

  return new TextDecoder().decode(decrypted);
}

import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '@/lib/crypto';

describe('encrypt/decrypt', () => {
  const passphrase = 'test-passphrase-123';
  const plaintext = 'sensitive-api-key-secret';

  it('should decrypt to original plaintext', async () => {
    const encrypted = await encrypt(plaintext, passphrase);
    const decrypted = await decrypt(encrypted, passphrase);
    
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertext each time (random salt/iv)', async () => {
    const encrypted1 = await encrypt(plaintext, passphrase);
    const encrypted2 = await encrypt(plaintext, passphrase);
    
    // Each encryption should produce different output due to random salt and IV
    expect(encrypted1).not.toBe(encrypted2);
    
    // But both should decrypt to the same plaintext
    const decrypted1 = await decrypt(encrypted1, passphrase);
    const decrypted2 = await decrypt(encrypted2, passphrase);
    
    expect(decrypted1).toBe(plaintext);
    expect(decrypted2).toBe(plaintext);
  });

  it('should fail with wrong passphrase', async () => {
    const encrypted = await encrypt(plaintext, passphrase);
    
    await expect(decrypt(encrypted, 'wrong-passphrase')).rejects.toThrow();
  });

  it('should handle empty plaintext', async () => {
    const encrypted = await encrypt('', passphrase);
    const decrypted = await decrypt(encrypted, passphrase);
    
    expect(decrypted).toBe('');
  });

  it('should handle unicode characters', async () => {
    const unicodeText = 'Hello 世界 🌍 Привет';
    const encrypted = await encrypt(unicodeText, passphrase);
    const decrypted = await decrypt(encrypted, passphrase);
    
    expect(decrypted).toBe(unicodeText);
  });

  it('should handle long plaintext', async () => {
    const longText = 'a'.repeat(1000);
    const encrypted = await encrypt(longText, passphrase);
    const decrypted = await decrypt(encrypted, passphrase);
    
    expect(decrypted).toBe(longText);
  });

  it('should produce base64 output', async () => {
    const encrypted = await encrypt(plaintext, passphrase);
    
    // Base64 should only contain valid characters
    expect(encrypted).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it('should fail with empty passphrase', async () => {
    const encrypted = await encrypt(plaintext, passphrase);
    
    await expect(decrypt(encrypted, '')).rejects.toThrow();
  });
});

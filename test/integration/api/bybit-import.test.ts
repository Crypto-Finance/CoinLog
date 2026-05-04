import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the dependencies
vi.mock('@/lib/infrastructure/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}));

vi.mock('@/lib/security/csrf-check', () => ({
  verifyOrigin: vi.fn(),
}));

vi.mock('@/lib/infrastructure/api/auth', () => ({
  verifyApiAuth: vi.fn(),
}));

import { checkRateLimit } from '@/lib/infrastructure/rate-limit';
import { verifyOrigin } from '@/lib/security/csrf-check';
import { verifyApiAuth } from '@/lib/infrastructure/api/auth';
import { runImportGuards } from '@/lib/infrastructure/bybit/guards';

const mockCheckRateLimit = vi.mocked(checkRateLimit);
const mockVerifyOrigin = vi.mocked(verifyOrigin);
const mockVerifyApiAuth = vi.mocked(verifyApiAuth);

describe('Bybit Import API Guard Chain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: API auth passes for tests
    mockVerifyApiAuth.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createMockRequest(body: Record<string, unknown>, headers: Record<string, string> = {}): NextRequest {
    return new NextRequest(new Request('http://localhost:3000/api/bybit/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(body),
    }));
  }

  describe('Successful request', () => {
    it('should return body when all guards pass', async () => {
      // Arrange: All guards pass
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(true);

      const validBody = {
        apiKey: 'validApiKey123456',
        apiSecret: 'validApiSecret12345678',
        timestamp: Date.now(),
      };

      const request = createMockRequest(validBody, {
        'Authorization': 'Bearer test-secret',
        'Origin': 'http://localhost:3000',
      });

      // Act
      const result = await runImportGuards(request);

      // Assert
      expect(result).not.toBeInstanceOf(Response);
      expect(result).toEqual(expect.objectContaining({
        apiKey: 'validApiKey123456',
        apiSecret: 'validApiSecret12345678',
      }));
    });
  });

  describe('Rate limit guard', () => {
    it('should reject when rate limited', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ 
        success: false, 
        limit: 10, 
        remaining: 0, 
        reset: Date.now() + 60000 
      });
      mockVerifyOrigin.mockReturnValue(true);

      const request = createMockRequest({ apiKey: 'test', apiSecret: 'test' });

      // Act
      const result = await runImportGuards(request);

      // Assert
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(429);
        const body = await result.json();
        expect(body.error).toContain('Rate limited');
      }
    });
  });

  describe('CSRF guard', () => {
    it('should reject when origin verification fails', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(false);

      const request = createMockRequest({ apiKey: 'test', apiSecret: 'test' });

      // Act
      const result = await runImportGuards(request);

      // Assert
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(403);
        const body = await result.json();
        expect(body.error).toBe('Forbidden');
      }
    });
  });

  describe('Content-Type guard', () => {
    it('should reject when Content-Type is not application/json', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(true);

      const request = new NextRequest(new Request('http://localhost:3000/api/bybit/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'Authorization': 'Bearer test',
          'Origin': 'http://localhost:3000',
        },
        body: 'test',
      }));

      // Act
      const result = await runImportGuards(request);

      // Assert
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body.error).toContain('Content-Type');
      }
    });
  });

  describe('Body validation guard', () => {
    it('should reject invalid JSON', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(true);

      const request = new NextRequest(new Request('http://localhost:3000/api/bybit/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test',
          'Origin': 'http://localhost:3000',
        },
        body: 'not-json',
      }));

      // Act
      const result = await runImportGuards(request);

      // Assert
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body.error).toBe('Invalid JSON body');
      }
    });

    it('should reject missing API key', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(true);

      const request = createMockRequest({ apiSecret: 'test' });

      // Act
      const result = await runImportGuards(request);

      // Assert - Zod validation catches missing required fields first
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body.error).toBe('Invalid request body');
      }
    });

    it('should reject invalid API key format', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(true);

      const request = createMockRequest({ 
        apiKey: 'short', 
        apiSecret: 'validSecret12345678' 
      });

      // Act
      const result = await runImportGuards(request);

      // Assert - Zod validation catches short API key first
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body.error).toBe('Invalid request body');
      }
    });

    it('should reject expired requests (replay attack protection)', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(true);

      const request = createMockRequest({ 
        apiKey: 'validApiKey123456', 
        apiSecret: 'validApiSecret12345678',
        timestamp: Date.now() - 60000, // 60 seconds ago
      });

      // Act
      const result = await runImportGuards(request);

      // Assert
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(400);
        const body = await result.json();
        expect(body.error).toBe('Request expired');
      }
    });
  });

  describe('Body size guard', () => {
    it('should reject oversized request body', async () => {
      // Arrange
      mockCheckRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: Date.now() });
      mockVerifyOrigin.mockReturnValue(true);

      const largeBody = {
        apiKey: 'validApiKey123456',
        apiSecret: 'validApiSecret12345678',
        extraData: 'x'.repeat(11 * 1024), // 11KB of extra data
      };

      const request = createMockRequest(largeBody, {
        'Authorization': 'Bearer test',
        'Origin': 'http://localhost:3000',
      });

      // Act
      const result = await runImportGuards(request);

      // Assert
      expect(result).toBeInstanceOf(Response);
      if (result instanceof Response) {
        expect(result.status).toBe(413);
        const body = await result.json();
        expect(body.error).toBe('Request body too large');
      }
    });
  });
});

import { describe, it, expect } from 'vitest';
import { getClientIp } from '@/lib/infrastructure/rate-limit';

describe('getClientIp', () => {
  function createMockRequest(headers: Record<string, string | null>): Request {
    return new Request('http://localhost:3000', {
      headers: new Headers(headers as Record<string, string>),
    });
  }

  it('should return cf-connecting-ip when present (Cloudflare)', () => {
    const request = createMockRequest({
      'cf-connecting-ip': '203.0.113.50',
      'x-forwarded-for': '192.168.1.1, 10.0.0.1',
      'x-real-ip': '172.16.0.1',
    });
    
    const ip = getClientIp(request);
    expect(ip).toBe('203.0.113.50');
  });

  it('should return x-real-ip when cf-connecting-ip is not present', () => {
    const request = createMockRequest({
      'x-real-ip': '172.16.0.1',
      'x-forwarded-for': '192.168.1.1, 10.0.0.1',
    });
    
    const ip = getClientIp(request);
    expect(ip).toBe('172.16.0.1');
  });

  it('should return first IP from x-forwarded-for when only that is present', () => {
    const request = createMockRequest({
      'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
    });
    
    const ip = getClientIp(request);
    // Should return the first IP (client IP is leftmost in the chain)
    expect(ip).toBe('192.168.1.1');
  });

  it('should handle single IP in x-forwarded-for', () => {
    const request = createMockRequest({
      'x-forwarded-for': '192.168.1.1',
    });
    
    const ip = getClientIp(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should return unknown when no IP headers present', () => {
    const request = createMockRequest({});
    
    const ip = getClientIp(request);
    expect(ip).toBe('unknown');
  });

  it('should handle IPv6 addresses', () => {
    const request = createMockRequest({
      'cf-connecting-ip': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    });
    
    const ip = getClientIp(request);
    expect(ip).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  });

  it('should handle x-forwarded-for with spaces', () => {
    const request = createMockRequest({
      'x-forwarded-for': ' 192.168.1.1 , 10.0.0.1 , 172.16.0.1 ',
    });
    
    const ip = getClientIp(request);
    expect(ip).toBe('192.168.1.1');
  });

  it('should return unknown for invalid IP format', () => {
    const request = createMockRequest({
      'x-forwarded-for': 'invalid-ip',
    });
    
    const ip = getClientIp(request);
    expect(ip).toBe('unknown');
  });

  it('should prioritize cf-connecting-ip over invalid x-real-ip', () => {
    const request = createMockRequest({
      'cf-connecting-ip': '203.0.113.50',
      'x-real-ip': 'invalid',
    });
    
    const ip = getClientIp(request);
    expect(ip).toBe('203.0.113.50');
  });

  it('should skip invalid IPs in x-forwarded-for chain', () => {
    const request = createMockRequest({
      'x-forwarded-for': '192.168.1.1, invalid, 172.16.0.1',
    });
    
    const ip = getClientIp(request);
    // First IP is valid, so it should be returned
    expect(ip).toBe('192.168.1.1');
  });
});

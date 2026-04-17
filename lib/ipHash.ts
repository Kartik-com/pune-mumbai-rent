import { createHash } from 'crypto';

export function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex');
}

export function getIPFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || '127.0.0.1';
}

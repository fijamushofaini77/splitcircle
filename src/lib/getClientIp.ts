import type { NextRequest } from 'next/server';

/**
 * NextRequest tidak punya properti `.ip` bawaan (sudah dicek di source
 * next/dist/server/web/spec-extension/request.d.ts, tidak ada field itu),
 * jadi IP diambil dari header yang di-set oleh reverse proxy (Vercel dkk).
 */
export function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

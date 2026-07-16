import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';

/**
 * Rate limiter fixed-window pakai tabel Postgres (rate_limits).
 * Dipilih karena neon-http tidak support transaksi (lihat HANDOFF.md),
 * jadi upsert-nya harus 1 statement atomic (INSERT ... ON CONFLICT).
 *
 * @param key      Identifier unik, mis. `login:ip:1.2.3.4` atau `login:email:a@b.com`
 * @param limit    Maksimum jumlah request yang diperbolehkan dalam 1 window
 * @param windowMs Panjang window dalam milidetik
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();

  const cutoff = now - windowMs;
  const result = await db.execute(sql`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (${key}, ${now}::bigint, 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN rate_limits.window_start > ${cutoff}::bigint
          THEN rate_limits.count + 1
        ELSE 1
      END,
      window_start = CASE
        WHEN rate_limits.window_start > ${cutoff}::bigint
          THEN rate_limits.window_start
        ELSE ${now}::bigint
      END
    RETURNING count
  `);

  const count = Number(result.rows[0]?.count ?? 1);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}
